"""
Read-only SQLAlchemy models for project-pretzel tables.

The dashboard backend shares the same PostgreSQL database as project-pretzel.
These are lightweight mirrors — only the columns we need for analytics.
No writes are ever made to these tables from the dashboard.
"""
import uuid
from sqlalchemy import (
    Column, String, Boolean, DateTime, Numeric,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from .database import Base


class PretzelUser(Base):
    __tablename__ = "users"

    id = Column(PGUUID(as_uuid=True), primary_key=True)
    email = Column(String(255))
    full_name = Column(String(255))
    is_active = Column(Boolean)
    subscription_tier = Column(String(16))
    subscription_status = Column(String(16))
    created_at = Column(DateTime(timezone=True))


class PretzelProject(Base):
    __tablename__ = "projects"

    id = Column(PGUUID(as_uuid=True), primary_key=True)
    status = Column(String(50))
    is_active = Column(Boolean)
    archived_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True))


class PretzelContract(Base):
    __tablename__ = "contracts"

    id = Column(PGUUID(as_uuid=True), primary_key=True)
    status = Column(String(50))          # draft | sent | active | signed | completed | cancelled
    total_amount = Column(Numeric(12, 2))
    created_at = Column(DateTime(timezone=True))
    activated_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))


class PretzelContractPaymentEvent(Base):
    __tablename__ = "contract_payment_events"

    id = Column(PGUUID(as_uuid=True), primary_key=True)
    contract_id = Column(PGUUID(as_uuid=True))
    event_type = Column(String(64))      # funding_succeeded | payout_sent | refund_created …
    status = Column(String(32))          # pending | succeeded | failed | reversed
    amount = Column(Numeric(12, 2))
    currency = Column(String(3))
    created_at = Column(DateTime(timezone=True))


class PretzelAIRunLog(Base):
    __tablename__ = "ai_run_logs"

    id = Column(PGUUID(as_uuid=True), primary_key=True)
    user_id = Column(PGUUID(as_uuid=True))
    project_id = Column(PGUUID(as_uuid=True))
    created_at = Column(DateTime(timezone=True))


class PretzelUserSubscription(Base):
    __tablename__ = "user_subscriptions"

    id = Column(PGUUID(as_uuid=True), primary_key=True)
    user_id = Column(PGUUID(as_uuid=True))
    tier = Column(String(32))
    status = Column(String(32))           # active | trialing | canceled | past_due | expired | paused
    subscription_scope = Column(String(16))
    trial_used = Column(Boolean)
    cancel_at_period_end = Column(Boolean)
    subscription_started_at = Column(DateTime(timezone=True))
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True))
