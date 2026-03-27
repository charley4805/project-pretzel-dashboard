from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.database import get_db
from app.models.crm import CRMLead, CRMEmailLog, CRMActivity, CRMNote
from pydantic import BaseModel
from typing import Optional
import datetime

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class LeadIn(BaseModel):
    name: str
    email: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = "new"
    notes: Optional[str] = None


class EmailLogIn(BaseModel):
    lead_id: Optional[str] = None
    to_email: str
    from_email: str
    subject: str
    body: Optional[str] = None
    agent_name: Optional[str] = None
    campaign: Optional[str] = None
    status: Optional[str] = "sent"


class ActivityIn(BaseModel):
    lead_id: Optional[str] = None
    activity_type: str
    description: Optional[str] = None
    agent_name: Optional[str] = None
    occurred_at: Optional[datetime.datetime] = None


class NoteIn(BaseModel):
    lead_id: Optional[str] = None
    content: str
    author: Optional[str] = None


# ── Leads ─────────────────────────────────────────────────────────────────────

@router.post("/leads", status_code=201)
async def create_lead(payload: LeadIn, db: AsyncSession = Depends(get_db)):
    lead = CRMLead(**payload.model_dump())
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return {"id": str(lead.id), "status": "created"}


@router.get("/leads")
async def list_leads(
    status: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(CRMLead).order_by(CRMLead.created_at.desc()).limit(limit)
    if status:
        q = q.where(CRMLead.status == status)
    rows = await db.execute(q)
    leads = rows.scalars().all()
    return [
        {
            "id": str(l.id),
            "name": l.name,
            "email": l.email,
            "company": l.company,
            "source": l.source,
            "status": l.status,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        }
        for l in leads
    ]


# ── Email Log ─────────────────────────────────────────────────────────────────

@router.post("/emails", status_code=201)
async def log_email(payload: EmailLogIn, db: AsyncSession = Depends(get_db)):
    entry = CRMEmailLog(**payload.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return {"id": str(entry.id), "status": "logged"}


@router.get("/emails")
async def list_emails(limit: int = 50, db: AsyncSession = Depends(get_db)):
    rows = await db.execute(
        select(CRMEmailLog).order_by(CRMEmailLog.sent_at.desc()).limit(limit)
    )
    emails = rows.scalars().all()
    return [
        {
            "id": str(e.id),
            "to_email": e.to_email,
            "subject": e.subject,
            "agent_name": e.agent_name,
            "campaign": e.campaign,
            "status": e.status,
            "sent_at": e.sent_at.isoformat() if e.sent_at else None,
        }
        for e in emails
    ]


# ── Activities ────────────────────────────────────────────────────────────────

@router.post("/activities", status_code=201)
async def log_activity(payload: ActivityIn, db: AsyncSession = Depends(get_db)):
    activity = CRMActivity(
        lead_id=payload.lead_id,
        activity_type=payload.activity_type,
        description=payload.description,
        agent_name=payload.agent_name,
        occurred_at=payload.occurred_at or datetime.datetime.utcnow(),
    )
    db.add(activity)
    await db.commit()
    await db.refresh(activity)
    return {"id": str(activity.id), "status": "logged"}


# ── Notes ─────────────────────────────────────────────────────────────────────

@router.post("/notes", status_code=201)
async def create_note(payload: NoteIn, db: AsyncSession = Depends(get_db)):
    note = CRMNote(**payload.model_dump())
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return {"id": str(note.id), "status": "created"}


# ── Summary ───────────────────────────────────────────────────────────────────

@router.get("/summary")
async def crm_summary(db: AsyncSession = Depends(get_db)):
    try:
        total_leads = (await db.execute(select(func.count()).select_from(CRMLead))).scalar()
        new_leads = (await db.execute(select(func.count()).where(CRMLead.status == "new"))).scalar()
        qualified = (await db.execute(select(func.count()).where(CRMLead.status == "qualified"))).scalar()
        converted = (await db.execute(select(func.count()).where(CRMLead.status == "converted"))).scalar()
        emails_sent = (await db.execute(select(func.count()).select_from(CRMEmailLog))).scalar()
        activities = (await db.execute(select(func.count()).select_from(CRMActivity))).scalar()
        return {
            "total_leads": total_leads,
            "new_leads": new_leads,
            "qualified": qualified,
            "converted": converted,
            "emails_sent": emails_sent,
            "activities_logged": activities,
        }
    except Exception:
        return {"total_leads": 0, "new_leads": 0, "qualified": 0, "converted": 0, "emails_sent": 0, "activities_logged": 0}
