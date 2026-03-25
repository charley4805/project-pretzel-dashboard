from sqlalchemy import Column, String, Integer, DateTime, Boolean, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.database import Base
import datetime
import uuid

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name = Column(String, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    session_id = Column(String, nullable=True)
    source_app = Column(String, index=True)
    page_path = Column(String, nullable=True)
    entity_type = Column(String, nullable=True)
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    metadata_json = Column("metadata", JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, index=True)

class DashboardDailyRollup(Base):
    __tablename__ = "dashboard_daily_rollups"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date = Column(DateTime, unique=True, index=True)
    new_users = Column(Integer, default=0)
    dau = Column(Integer, default=0)
    wau = Column(Integer, default=0)
    mau = Column(Integer, default=0)
    profiles_created = Column(Integer, default=0)
    searches_count = Column(Integer, default=0)
    unique_search_users = Column(Integer, default=0)
    ai_requests_count = Column(Integer, default=0)
    ai_unique_users = Column(Integer, default=0)
    api_requests_count = Column(Integer, default=0)
    api_error_count = Column(Integer, default=0)
    avg_api_latency_ms = Column(Integer, default=0)
    signup_conversion_rate = Column(Numeric, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
