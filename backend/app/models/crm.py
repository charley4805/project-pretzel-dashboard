import uuid
import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.database import Base


class CRMLead(Base):
    __tablename__ = "crm_leads"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    company = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    source = Column(String, nullable=True)
    status = Column(String, default="new")  # new, contacted, qualified, converted, lost
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class CRMEmailLog(Base):
    __tablename__ = "crm_email_log"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("crm_leads.id"), nullable=True)
    to_email = Column(String, nullable=False)
    from_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=True)
    sent_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    agent_name = Column(String, nullable=True)
    campaign = Column(String, nullable=True)
    status = Column(String, default="sent")  # sent, bounced, opened, replied


class CRMActivity(Base):
    __tablename__ = "crm_activities"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("crm_leads.id"), nullable=True)
    activity_type = Column(String, nullable=False)  # call, email, demo, follow_up, proposal
    description = Column(Text, nullable=True)
    agent_name = Column(String, nullable=True)
    occurred_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)


class CRMNote(Base):
    __tablename__ = "crm_notes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("crm_leads.id"), nullable=True)
    content = Column(Text, nullable=False)
    author = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
