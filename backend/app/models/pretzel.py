"""
Read-only SQLAlchemy models for project-pretzel tables.

The dashboard backend shares the same PostgreSQL database as project-pretzel.
These are lightweight mirrors — only the columns needed for analytics queries.
No writes are ever made to these tables from the dashboard.
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Numeric, Uuid
from app.models.database import Base


class PretzelUser(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True)
    email = Column(String(255))
    full_name = Column(String(255))
    is_active = Column(Boolean)
    subscription_tier = Column(String(16))
    subscription_status = Column(String(16))
    created_at = Column(DateTime(timezone=True))


class PretzelProject(Base):
    __tablename__ = "projects"

    id = Column(Uuid, primary_key=True)
    status = Column(String(50))
    is_active = Column(Boolean)
    archived_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True))


class PretzelContract(Base):
    __tablename__ = "contracts"

    id = Column(Uuid, primary_key=True)
    status = Column(String(50))
    total_amount = Column(Numeric(12, 2))
    created_at = Column(DateTime(timezone=True))
    activated_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))


class PretzelContractPaymentEvent(Base):
    __tablename__ = "contract_payment_events"

    id = Column(Uuid, primary_key=True)
    contract_id = Column(Uuid)
    event_type = Column(String(64))
    status = Column(String(32))
    amount = Column(Numeric(12, 2))
    currency = Column(String(3))
    created_at = Column(DateTime(timezone=True))


class PretzelAIRunLog(Base):
    __tablename__ = "ai_run_logs"

    id = Column(Uuid, primary_key=True)
    user_id = Column(Uuid)
    project_id = Column(Uuid)
    created_at = Column(DateTime(timezone=True))


class PretzelUserSubscription(Base):
    __tablename__ = "user_subscriptions"

    id = Column(Uuid, primary_key=True)
    user_id = Column(Uuid)
    tier = Column(String(32))
    status = Column(String(32))
    subscription_scope = Column(String(16))
    trial_used = Column(Boolean)
    cancel_at_period_end = Column(Boolean)
    subscription_started_at = Column(DateTime(timezone=True))
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True))
