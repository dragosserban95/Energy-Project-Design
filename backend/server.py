"""Main FastAPI server for the Romanian gas pipes engineering DOCX platform."""
import os
import io
import uuid
import base64
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Request, Response
from fastapi.responses import StreamingResponse, JSONResponse
from starlette.middleware.cors import CORSMiddleware

from db import db
from models import (
    User, UserLogin, UserRegister, AuthResponse,
    TemplateMeta, StampMeta, CertificateMeta,
    GenerateRequest, DocumentMeta, EmailSendRequest,
    CheckoutRequest, PaymentTransaction, new_id,
)
from auth import (
    hash_password, verify_password, create_jwt,
    fetch_emergent_session, get_current_user,
)
from docx_processor import extract_placeholders, replace_placeholders, insert_stamp
from signing import parse_p12, sign_document
from email_sender import send_email_with_attachment

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionRequest,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="StampDoc Romania API")
api = APIRouter(prefix="/api")

# ----------- Pricing plans (server side, fixed amounts in RON) -----------
PLANS = {
    "pro": {"name": "Pro", "amount": 99.0, "currency": "ron", "documents_per_month": 200},
    "enterprise": {"name": "Enterprise", "amount": 299.0, "currency": "ron", "documents_per_month": 2000},
}


# ====================== AUTH ======================
@api.post("/auth/register", response_model=AuthResponse)
async def register(payload: UserRegister):
    existing = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email-ul este deja înregistrat")
    user_id = new_id("usr_")
    user_doc = {
        "user_id": user_id,
        "email": payload.email.lower(),
        "name": payload.name,
        "company": payload.company,
        "picture": None,
        "auth_provider": "email",
        "plan": "free",
        "plan_renews_at": None,
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    user_doc.pop("password_hash", None)
    token = create_jwt(user_id)
    return AuthResponse(token=token, user=User(**user_doc))


@api.post("/auth/login", response_model=AuthResponse)
async def login(payload: UserLogin):
    user_doc = await db.users.find_one({"email": payload.email.lower()})
    if not user_doc or not user_doc.get("password_hash"):
        raise HTTPException(status_code=401, detail="Credențiale invalide")
    if not verify_password(payload.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Credențiale invalide")
    user_doc.pop("_id", None)
    user_doc.pop("password_hash", None)
    token = create_jwt(user_doc["user_id"])
    return AuthResponse(token=token, user=User(**user_doc))


@api.post("/auth/google/session")
async def google_session(payload: dict, response: Response):
    """Exchange Emergent session_id for our session_token cookie + user."""
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    data = await fetch_emergent_session(session_id)
    email = data["email"].lower()
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    if not user_doc:
        user_id = new_id("usr_")
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": data.get("name", email.split("@")[0]),
            "company": None,
            "picture": data.get("picture"),
            "auth_provider": "google",
            "plan": "free",
            "plan_renews_at": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(dict(user_doc))
    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    response.set_cookie(
        key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none", path="/",
        max_age=7 * 24 * 3600,
    )
    return {"user": user_doc, "token": session_token}


@api.get("/auth/me", response_model=User)
async def me(user: User = Depends(get_current_user)):
    return user


@api.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ====================== TEMPLATES ======================
@api.post("/templates/upload", response_model=TemplateMeta)
async def upload_template(file: UploadFile = File(...), name: Optional[str] = Form(None), user: User = Depends(get_current_user)):
    if not file.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=400, detail="Se acceptă doar fișiere .docx")
    data = await file.read()
    placeholders = extract_placeholders(data)
    template_id = new_id("tpl_")
    doc = {
        "template_id": template_id,
        "user_id": user.user_id,
        "name": name or file.filename,
        "placeholders": placeholders,
        "size_bytes": len(data),
        "data_b64": base64.b64encode(data).decode("ascii"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.templates.insert_one(doc)
    return TemplateMeta(**{k: v for k, v in doc.items() if k != "data_b64"})


@api.get("/templates", response_model=List[TemplateMeta])
async def list_templates(user: User = Depends(get_current_user)):
    cursor = db.templates.find({"user_id": user.user_id}, {"_id": 0, "data_b64": 0}).sort("created_at", -1)
    docs = await cursor.to_list(500)
    return [TemplateMeta(**d) for d in docs]


@api.get("/templates/{template_id}", response_model=TemplateMeta)
async def get_template(template_id: str, user: User = Depends(get_current_user)):
    doc = await db.templates.find_one({"template_id": template_id, "user_id": user.user_id}, {"_id": 0, "data_b64": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Șablon negăsit")
    return TemplateMeta(**doc)


@api.delete("/templates/{template_id}")
async def delete_template(template_id: str, user: User = Depends(get_current_user)):
    res = await db.templates.delete_one({"template_id": template_id, "user_id": user.user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Șablon negăsit")
    return {"ok": True}


# ====================== STAMPS ======================
@api.post("/stamps/upload", response_model=StampMeta)
async def upload_stamp(file: UploadFile = File(...), name: Optional[str] = Form(None), user: User = Depends(get_current_user)):
    ct = (file.content_type or "").lower()
    if not (ct.startswith("image/") or file.filename.lower().endswith((".png", ".jpg", ".jpeg"))):
        raise HTTPException(status_code=400, detail="Se acceptă doar imagini PNG/JPG")
    data = await file.read()
    stamp_id = new_id("stm_")
    doc = {
        "stamp_id": stamp_id,
        "user_id": user.user_id,
        "name": name or file.filename,
        "data_b64": base64.b64encode(data).decode("ascii"),
        "content_type": ct or "image/png",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.stamps.insert_one(doc)
    return StampMeta(**{k: v for k, v in doc.items() if k not in ("data_b64", "content_type")})


@api.get("/stamps", response_model=List[StampMeta])
async def list_stamps(user: User = Depends(get_current_user)):
    cursor = db.stamps.find({"user_id": user.user_id}, {"_id": 0, "data_b64": 0}).sort("created_at", -1)
    return [StampMeta(**d) for d in await cursor.to_list(500)]


@api.get("/stamps/{stamp_id}/image")
async def get_stamp_image(stamp_id: str, user: User = Depends(get_current_user)):
    doc = await db.stamps.find_one({"stamp_id": stamp_id, "user_id": user.user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Ștampilă negăsită")
    data = base64.b64decode(doc["data_b64"])
    return Response(content=data, media_type=doc.get("content_type", "image/png"))


@api.delete("/stamps/{stamp_id}")
async def delete_stamp(stamp_id: str, user: User = Depends(get_current_user)):
    res = await db.stamps.delete_one({"stamp_id": stamp_id, "user_id": user.user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ștampilă negăsită")
    return {"ok": True}


# ====================== CERTIFICATES ======================
@api.post("/certificates/upload", response_model=CertificateMeta)
async def upload_certificate(
    file: UploadFile = File(...),
    password: str = Form(""),
    name: Optional[str] = Form(None),
    user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith((".p12", ".pfx")):
        raise HTTPException(status_code=400, detail="Se acceptă doar fișiere .p12 / .pfx")
    data = await file.read()
    try:
        info = parse_p12(data, password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Certificat invalid sau parolă greșită: {e}")

    cert_id = new_id("crt_")
    doc = {
        "cert_id": cert_id,
        "user_id": user.user_id,
        "name": name or file.filename,
        "subject": info["subject"],
        "issuer": info["issuer"],
        "valid_from": info["valid_from"],
        "valid_to": info["valid_to"],
        "data_b64": base64.b64encode(data).decode("ascii"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.certificates.insert_one(doc)
    return CertificateMeta(**{k: v for k, v in doc.items() if k != "data_b64"})


@api.get("/certificates", response_model=List[CertificateMeta])
async def list_certificates(user: User = Depends(get_current_user)):
    cursor = db.certificates.find({"user_id": user.user_id}, {"_id": 0, "data_b64": 0}).sort("created_at", -1)
    return [CertificateMeta(**d) for d in await cursor.to_list(500)]


@api.delete("/certificates/{cert_id}")
async def delete_certificate(cert_id: str, user: User = Depends(get_current_user)):
    res = await db.certificates.delete_one({"cert_id": cert_id, "user_id": user.user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Certificat negăsit")
    return {"ok": True}


# ====================== DOCUMENT GENERATION ======================
async def _enforce_quota(user: User) -> None:
    """Free plan: 5 docs total. Pro/Enterprise: monthly cap."""
    if user.plan == "free":
        count = await db.documents.count_documents({"user_id": user.user_id})
        if count >= 5:
            raise HTTPException(status_code=402, detail="Limita planului Free atinsă. Vă rugăm să faceți upgrade.")
    else:
        plan_cfg = PLANS.get(user.plan)
        if plan_cfg:
            month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
            count = await db.documents.count_documents({"user_id": user.user_id, "created_at": {"$gte": month_start}})
            if count >= plan_cfg["documents_per_month"]:
                raise HTTPException(status_code=402, detail="Limita lunară atinsă pentru planul curent.")


@api.post("/documents/generate", response_model=DocumentMeta)
async def generate_document(req: GenerateRequest, user: User = Depends(get_current_user)):
    await _enforce_quota(user)

    tpl = await db.templates.find_one({"template_id": req.template_id, "user_id": user.user_id})
    if not tpl:
        raise HTTPException(status_code=404, detail="Șablon negăsit")
    docx_bytes = base64.b64decode(tpl["data_b64"])

    # Replace placeholders
    docx_bytes = replace_placeholders(docx_bytes, req.values)

    stamped = False
    if req.stamp_id:
        stamp = await db.stamps.find_one({"stamp_id": req.stamp_id, "user_id": user.user_id})
        if not stamp:
            raise HTTPException(status_code=404, detail="Ștampilă negăsită")
        stamp_bytes = base64.b64decode(stamp["data_b64"])
        docx_bytes = insert_stamp(docx_bytes, stamp_bytes, req.stamp_position, req.stamp_size_cm)
        stamped = True

    signed = False
    signature_b64: Optional[str] = None
    signature_info: Optional[dict] = None
    if req.cert_id:
        cert = await db.certificates.find_one({"cert_id": req.cert_id, "user_id": user.user_id})
        if not cert:
            raise HTTPException(status_code=404, detail="Certificat negăsit")
        try:
            sig_bytes, info = sign_document(docx_bytes, base64.b64decode(cert["data_b64"]), req.cert_password or "")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Eroare la semnare: {e}")
        signature_b64 = base64.b64encode(sig_bytes).decode("ascii")
        signature_info = info
        signed = True

    doc_id = new_id("doc_")
    base_name = (req.document_name or tpl["name"]).rsplit(".docx", 1)[0]
    final_name = f"{base_name}.docx"

    doc = {
        "document_id": doc_id,
        "user_id": user.user_id,
        "template_id": req.template_id,
        "name": final_name,
        "stamped": stamped,
        "signed": signed,
        "signature_hash": signature_info["sha256"] if signature_info else None,
        "signature_cert_subject": signature_info["subject"] if signature_info else None,
        "data_b64": base64.b64encode(docx_bytes).decode("ascii"),
        "signature_b64": signature_b64,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.documents.insert_one(doc)
    return DocumentMeta(**{k: v for k, v in doc.items() if k not in ("data_b64", "signature_b64")})


@api.get("/documents", response_model=List[DocumentMeta])
async def list_documents(user: User = Depends(get_current_user)):
    cursor = db.documents.find({"user_id": user.user_id}, {"_id": 0, "data_b64": 0, "signature_b64": 0}).sort("created_at", -1)
    return [DocumentMeta(**d) for d in await cursor.to_list(500)]


@api.get("/documents/{document_id}/download")
async def download_document(document_id: str, user: User = Depends(get_current_user)):
    doc = await db.documents.find_one({"document_id": document_id, "user_id": user.user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document negăsit")
    data = base64.b64decode(doc["data_b64"])
    return StreamingResponse(
        io.BytesIO(data),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{doc["name"]}"'},
    )


@api.get("/documents/{document_id}/signature")
async def download_signature(document_id: str, user: User = Depends(get_current_user)):
    doc = await db.documents.find_one({"document_id": document_id, "user_id": user.user_id})
    if not doc or not doc.get("signature_b64"):
        raise HTTPException(status_code=404, detail="Semnătură negăsită")
    data = base64.b64decode(doc["signature_b64"])
    name = doc["name"].rsplit(".docx", 1)[0] + ".p7s"
    return StreamingResponse(
        io.BytesIO(data),
        media_type="application/pkcs7-signature",
        headers={"Content-Disposition": f'attachment; filename="{name}"'},
    )


@api.delete("/documents/{document_id}")
async def delete_document(document_id: str, user: User = Depends(get_current_user)):
    res = await db.documents.delete_one({"document_id": document_id, "user_id": user.user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document negăsit")
    return {"ok": True}


# ====================== EMAIL ======================
@api.post("/documents/email")
async def email_document(req: EmailSendRequest, user: User = Depends(get_current_user)):
    doc = await db.documents.find_one({"document_id": req.document_id, "user_id": user.user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document negăsit")
    data = base64.b64decode(doc["data_b64"])
    extras = []
    if doc.get("signature_b64"):
        sig_name = doc["name"].rsplit(".docx", 1)[0] + ".p7s"
        extras.append((sig_name, base64.b64decode(doc["signature_b64"]), "application/pkcs7-signature"))

    result = send_email_with_attachment(
        recipients=req.recipients,
        subject=req.subject,
        body=req.body,
        attachment_name=doc["name"],
        attachment_bytes=data,
        extra_attachments=extras,
    )
    await db.email_logs.insert_one({
        "log_id": new_id("log_"),
        "user_id": user.user_id,
        "document_id": req.document_id,
        "recipients": req.recipients,
        "subject": req.subject,
        "ok": result.get("ok", False),
        "error": result.get("error"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    if not result.get("ok"):
        raise HTTPException(status_code=500, detail=result.get("error", "Eroare la trimitere"))
    return {"ok": True}


# ====================== STRIPE PAYMENTS ======================
def _stripe_client(request: Request) -> StripeCheckout:
    api_key = os.environ.get("STRIPE_API_KEY", "")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    return StripeCheckout(api_key=api_key, webhook_url=webhook_url)


@api.get("/plans")
async def list_plans():
    return {
        "free": {"name": "Free", "amount": 0, "currency": "ron", "documents_per_month": 5},
        **PLANS,
    }


@api.post("/payments/checkout")
async def create_checkout(req: CheckoutRequest, request: Request, user: User = Depends(get_current_user)):
    plan = PLANS.get(req.plan_id)
    if not plan:
        raise HTTPException(status_code=400, detail="Plan invalid")
    success_url = f"{req.origin_url.rstrip('/')}/dashboard?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url.rstrip('/')}/pricing"

    sc = _stripe_client(request)
    co_req = CheckoutSessionRequest(
        amount=float(plan["amount"]),
        currency=plan["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"user_id": user.user_id, "plan_id": req.plan_id, "source": "subscription"},
    )
    session = await sc.create_checkout_session(co_req)

    txn = {
        "transaction_id": new_id("txn_"),
        "user_id": user.user_id,
        "plan_id": req.plan_id,
        "session_id": session.session_id,
        "amount": float(plan["amount"]),
        "currency": plan["currency"],
        "payment_status": "initiated",
        "status": "open",
        "metadata": {"user_id": user.user_id, "plan_id": req.plan_id},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.insert_one(txn)
    return {"url": session.url, "session_id": session.session_id}


@api.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request, user: User = Depends(get_current_user)):
    sc = _stripe_client(request)
    status = await sc.get_checkout_status(session_id)
    txn = await db.payment_transactions.find_one({"session_id": session_id, "user_id": user.user_id}, {"_id": 0})
    if not txn:
        raise HTTPException(status_code=404, detail="Tranzacție negăsită")

    # Idempotent activation
    if status.payment_status == "paid" and txn["payment_status"] != "paid":
        plan_id = txn["plan_id"]
        renew_at = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": {"plan": plan_id, "plan_renews_at": renew_at}},
        )
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "status": status.status, "completed_at": datetime.now(timezone.utc).isoformat()}},
        )
    else:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": status.payment_status, "status": status.status}},
        )
    return {
        "payment_status": status.payment_status,
        "status": status.status,
        "amount_total": status.amount_total,
        "currency": status.currency,
    }


@api.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    sc = _stripe_client(request)
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    try:
        event = await sc.handle_webhook(body, sig)
    except Exception as e:
        logger.warning(f"Stripe webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook error")
    if event.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": event.session_id},
            {"$set": {"payment_status": "paid"}},
        )
        meta = event.metadata or {}
        user_id = meta.get("user_id")
        plan_id = meta.get("plan_id")
        if user_id and plan_id:
            renew_at = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {"plan": plan_id, "plan_renews_at": renew_at}},
            )
    return {"received": True}


# ====================== ROOT ======================
@api.get("/")
async def root():
    return {"app": "StampDoc Romania", "status": "ok"}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    from db import client
    client.close()
