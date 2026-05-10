from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime


# ─── Agent Fleet ───────────────────────────────────────────

class AgentBase(BaseModel):
    name: str
    type: str  # support | social | leadgen
    status: str = "idle"
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    handle: Optional[str] = None


class AgentCreate(AgentBase):
    pass


class AgentOut(AgentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Agent Config ──────────────────────────────────────────

class AgentConfigBase(BaseModel):
    system_prompt: Optional[str] = None
    guardrails: Optional[Dict[str, Any]] = None
    integrations: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None


class AgentConfigOut(AgentConfigBase):
    id: str
    agent_id: str
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Agent Activity ────────────────────────────────────────

class AgentActivityBase(BaseModel):
    activity_type: str
    data: Optional[Dict[str, Any]] = None


class AgentActivityOut(AgentActivityBase):
    id: str
    agent_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Agent Training ────────────────────────────────────────

class AgentTrainingBase(BaseModel):
    task: str
    input_example: Optional[str] = None
    expected_output: Optional[str] = None
    feedback: Optional[str] = None


class AgentTrainingOut(AgentTrainingBase):
    id: str
    agent_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Knowledge Vault ───────────────────────────────────────

class KnowledgeArticleBase(BaseModel):
    category: str
    title: str
    content: Optional[str] = None
    tags: Optional[List[str]] = None


class KnowledgeArticleCreate(KnowledgeArticleBase):
    pass


class KnowledgeArticleOut(KnowledgeArticleBase):
    id: str
    created_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Agent Metrics ─────────────────────────────────────────

class AgentMetricsBase(BaseModel):
    conversations_handled: int = 0
    resolution_rate: float = 0.0
    avg_response_time: float = 0.0
    escalation_rate: float = 0.0
    custom_metrics: Optional[Dict[str, Any]] = None


class AgentMetricsOut(AgentMetricsBase):
    id: str
    agent_id: str
    timestamp: datetime

    class Config:
        from_attributes = True


# ─── Support ───────────────────────────────────────────────

class ConversationOut(BaseModel):
    id: str
    user_name: str
    email: str
    status: str
    priority: str
    unread: int
    ticket_number: str
    last_message: str
    timestamp: str


class EscalationRequest(BaseModel):
    conversation_id: str
    reason: Optional[str] = None


class DraftReplyRequest(BaseModel):
    conversation_id: str
    content: str


class DraftReplyOut(BaseModel):
    draft_id: str
    status: str = "pending_review"
    content: str


# ─── Social ────────────────────────────────────────────────

class CampaignOut(BaseModel):
    id: str
    name: str
    platform: str
    status: str
    reach: int = 0
    engagement_rate: float = 0.0
    clicks: int = 0


class SchedulePostRequest(BaseModel):
    content: str
    platforms: List[str]
    scheduled_for: Optional[datetime] = None


class EngagementOut(BaseModel):
    id: str
    platform: str
    user_name: str
    action_type: str
    content: str
    sentiment: str
    time_ago: str


# ─── Leads ─────────────────────────────────────────────────

class LeadOut(BaseModel):
    id: str
    name: str
    source: str
    score: float
    stage: str
    date_discovered: str


class ScoreLeadRequest(BaseModel):
    lead_id: str


class ScoreLeadOut(BaseModel):
    lead_id: str
    score: float
    factors: Dict[str, Any]


class OutreachDraftRequest(BaseModel):
    lead_id: str
    channel: str = "email"


class OutreachDraftOut(BaseModel):
    draft_id: str
    lead_id: str
    channel: str
    message: str
    status: str = "draft"
