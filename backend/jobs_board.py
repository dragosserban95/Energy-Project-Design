"""Jobs board — închirieri ștampile, certificări, abonamente, locuri de muncă.

Inspired by V5 vision: ștampile-as-a-service, certificări la cerere, employment opportunities.

Types of jobs:
  - stamp_rental: someone with ANRE stamp/certification rents it for one project
  - certification_request: someone needs a VGD/RTE/atestat signature on their docs
  - subscription: monthly access to a service (e.g., template library, AI consultant)
  - employment: job opening
"""
from typing import Optional, List, Dict
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from db import db


JOB_TYPES = [
    {"id": "stamp_rental",          "label": "Închiriere ștampilă/atestat"},
    {"id": "certification_request", "label": "Cerere certificare (VGD/RTE)"},
    {"id": "subscription",          "label": "Abonament serviciu lunar"},
    {"id": "employment",            "label": "Loc de muncă"},
    {"id": "consulting",            "label": "Consultanță tehnică"},
    {"id": "subcontract",           "label": "Subcontractare lucrare"},
]


class JobIn(BaseModel):
    title: str = Field(..., min_length=4, max_length=200)
    job_type: str = Field(..., description="One of JOB_TYPES ids")
    industry: Optional[str] = None
    description: str = Field(..., min_length=10, max_length=4000)
    budget_eur: Optional[float] = Field(None, ge=0)
    duration: Optional[str] = None  # e.g. "1 lună", "3 luni", "unic"
    location: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    visible: bool = True


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def list_jobs(job_type: Optional[str] = None, industry: Optional[str] = None, status: str = "open") -> List[Dict]:
    q: Dict = {"visible": True}
    if status and status != "all":
        q["status"] = status
    if job_type:
        q["job_type"] = job_type
    if industry:
        q["industry"] = industry
    return await db.jobs.find(q, {"_id": 0}).sort("created_at", -1).limit(500).to_list(500)


async def get_job(job_id: str) -> Optional[Dict]:
    return await db.jobs.find_one({"job_id": job_id}, {"_id": 0})


async def create_job(user, payload: JobIn, job_id: str) -> Dict:
    doc = payload.model_dump()
    doc["job_id"] = job_id
    doc["author_id"] = user.user_id
    doc["author_name"] = user.name or user.email.split("@")[0]
    doc["author_email"] = user.email
    doc["status"] = "open"  # 'open' | 'in_progress' | 'closed'
    doc["applications_count"] = 0
    doc["created_at"] = _now()
    doc["updated_at"] = _now()
    await db.jobs.insert_one(dict(doc))
    return doc


async def update_job(job_id: str, updates: Dict) -> Optional[Dict]:
    cleaned = {k: v for k, v in updates.items() if v is not None and k not in ("job_id", "author_id", "created_at")}
    if not cleaned:
        return await get_job(job_id)
    cleaned["updated_at"] = _now()
    return await db.jobs.find_one_and_update(
        {"job_id": job_id},
        {"$set": cleaned},
        return_document=True,
        projection={"_id": 0},
    )


async def delete_job(job_id: str) -> bool:
    res = await db.jobs.delete_one({"job_id": job_id})
    return res.deleted_count > 0


class JobApplication(BaseModel):
    message: str = Field(..., min_length=10, max_length=2000)


async def apply_to_job(user, job_id: str, payload: JobApplication, application_id: str) -> Optional[Dict]:
    job = await db.jobs.find_one({"job_id": job_id}, {"_id": 0, "author_id": 1, "status": 1})
    if not job:
        return None
    if job.get("status") != "open":
        return {"error": "Jobul nu mai este deschis"}
    if job.get("author_id") == user.user_id:
        return {"error": "Nu poți aplica la propriul tău job"}
    doc = {
        "application_id": application_id,
        "job_id": job_id,
        "applicant_id": user.user_id,
        "applicant_name": user.name or user.email.split("@")[0],
        "applicant_email": user.email,
        "message": payload.message.strip(),
        "status": "pending",
        "created_at": _now(),
    }
    await db.job_applications.insert_one(dict(doc))
    await db.jobs.update_one({"job_id": job_id}, {"$inc": {"applications_count": 1}})
    return doc


async def list_applications_for_job(job_id: str) -> List[Dict]:
    return await db.job_applications.find({"job_id": job_id}, {"_id": 0}).sort("created_at", -1).to_list(500)


async def jobs_stats() -> Dict:
    pipeline = [{"$group": {"_id": "$job_type", "count": {"$sum": 1}}}]
    out = {}
    async for row in db.jobs.aggregate(pipeline):
        out[row["_id"]] = row["count"]
    return out
