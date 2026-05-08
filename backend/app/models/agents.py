import uuid
import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float, JSON
from app.models.database import Base


class Agent(Base):
    __tablename__ = "agents"
    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # support | social | leadgen
    status = Column(String, default="idle")  # online | busy | offline | error | idle
    description = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    handle = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )


class AgentConfig(Base):
    __tablename__ = "agent_config"
    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    system_prompt = Column(Text, nullable=True)
    guardrails = Column(JSON, nullable=True)
    integrations = Column(JSON, nullable=True)
    settings = Column(JSON, nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )


class AgentActivity(Base):
    __tablename__ = "agent_activity"
    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    activity_type = Column(String, nullable=False)
    data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)


class AgentTraining(Base):
    __tablename__ = "agent_training"
    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    task = Column(String, nullable=False)
    input_example = Column(Text, nullable=True)
    expected_output = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)


class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"
    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    category = Column(String, nullable=False)  # support | social | leadgen | general
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)


class AgentMetrics(Base):
    __tablename__ = "agent_metrics"
    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    conversations_handled = Column(Integer, default=0)
    resolution_rate = Column(Float, default=0.0)
    avg_response_time = Column(Float, default=0.0)  # seconds
    escalation_rate = Column(Float, default=0.0)
    custom_metrics = Column(JSON, nullable=True)
