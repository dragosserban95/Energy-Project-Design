"""Pydantic models for the application."""
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict
import uuid


def new_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:16]}"


# ---- Auth ----
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=120)
    company: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: EmailStr
    name: str
    company: Optional[str] = None
    picture: Optional[str] = None
    auth_provider: str = "email"  # 'email' | 'google'
    plan: str = "free"  # free, pro, enterprise
    plan_renews_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AuthResponse(BaseModel):
    token: str
    user: User


# ---- Templates ----
class TemplateMeta(BaseModel):
    model_config = ConfigDict(extra="ignore")
    template_id: str
    user_id: str
    name: str
    placeholders: List[str]
    size_bytes: int
    created_at: str


class TemplateCreate(BaseModel):
    name: str


# ---- Stamps ----
class StampMeta(BaseModel):
    model_config = ConfigDict(extra="ignore")
    stamp_id: str
    user_id: str
    name: str
    created_at: str


# ---- Certificates ----
class CertificateMeta(BaseModel):
    model_config = ConfigDict(extra="ignore")
    cert_id: str
    user_id: str
    name: str
    subject: str
    issuer: str
    valid_from: str
    valid_to: str
    created_at: str


# ---- Documents ----
class GenerateRequest(BaseModel):
    template_id: str
    values: Dict[str, str]  # placeholder => value
    stamp_id: Optional[str] = None
    stamp_position: str = "bottom-right"  # top-left, top-right, bottom-left, bottom-right
    stamp_size_cm: float = 4.0
    cert_id: Optional[str] = None
    cert_password: Optional[str] = None
    document_name: Optional[str] = None


class DocumentMeta(BaseModel):
    model_config = ConfigDict(extra="ignore")
    document_id: str
    user_id: str
    template_id: str
    name: str
    stamped: bool = False
    signed: bool = False
    signature_hash: Optional[str] = None
    signature_cert_subject: Optional[str] = None
    created_at: str


class EmailSendRequest(BaseModel):
    document_id: str
    recipients: List[EmailStr]
    subject: str
    body: str


# ---- Subscription / Stripe ----
class CheckoutRequest(BaseModel):
    plan_id: str  # 'pro' or 'enterprise'
    origin_url: str


class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    transaction_id: str
    user_id: str
    plan_id: str
    session_id: str
    amount: float
    currency: str
    payment_status: str = "initiated"
    status: str = "open"
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: str
