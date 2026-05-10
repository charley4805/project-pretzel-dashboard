from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from typing import Optional, List, Dict, Any

from app.models.database import get_db
from app.models.agents import Agent, AgentConfig, AgentActivity, AgentTraining, KnowledgeArticle, AgentMetrics
from app.schemas import agents as schemas

router = APIRouter()

# ════════════════════════════════════════════════════════════
# MOCK DATA (initial phase — replace with DB queries later)
# ════════════════════════════════════════════════════════════

MOCK_AGENTS: List[Dict[str, Any]] = [
    {"id": "sa-1", "name": "Support Agent Alpha", "type": "support", "status": "online", "description": "Handles billing & account inquiries", "avatar_url": None, "handle": "@support-alpha", "created_at": "2025-01-15T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "sa-2", "name": "Support Agent Beta", "type": "support", "status": "online", "description": "Technical support & troubleshooting", "avatar_url": None, "handle": "@support-beta", "created_at": "2025-01-15T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "sa-3", "name": "Support Agent Gamma", "type": "support", "status": "online", "description": "General inquiries & onboarding", "avatar_url": None, "handle": "@support-gamma", "created_at": "2025-01-15T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "sa-4", "name": "Support Agent Delta", "type": "support", "status": "warning", "description": "Escalation handling & L2 support", "avatar_url": None, "handle": "@support-delta", "created_at": "2025-01-15T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "sa-5", "name": "Support Agent Epsilon", "type": "support", "status": "online", "description": "Enterprise & priority support", "avatar_url": None, "handle": "@support-epsilon", "created_at": "2025-01-15T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "sa-6", "name": "Support Agent Zeta", "type": "support", "status": "error", "description": "After-hours support coverage", "avatar_url": None, "handle": "@support-zeta", "created_at": "2025-01-15T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "ma-1", "name": "Social Agent Prime", "type": "social", "status": "online", "description": "LinkedIn content & engagement", "avatar_url": None, "handle": "@social-prime", "created_at": "2025-02-01T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "ma-2", "name": "Social Agent Duo", "type": "social", "status": "online", "description": "Twitter monitoring & replies", "avatar_url": None, "handle": "@social-duo", "created_at": "2025-02-01T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "ma-3", "name": "Social Agent Trio", "type": "social", "status": "warning", "description": "Instagram & visual content", "avatar_url": None, "handle": "@social-trio", "created_at": "2025-02-01T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "ma-4", "name": "Social Agent Quad", "type": "social", "status": "online", "description": "Community management & DMs", "avatar_url": None, "handle": "@social-quad", "created_at": "2025-02-01T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "lg-1", "name": "Lead Gen Scout", "type": "leadgen", "status": "online", "description": "Reddit & forum prospecting", "avatar_url": None, "handle": "@lead-scout", "created_at": "2025-03-01T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "lg-2", "name": "Lead Gen Hunter", "type": "leadgen", "status": "online", "description": "IndieHackers & ProductHunt", "avatar_url": None, "handle": "@lead-hunter", "created_at": "2025-03-01T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "lg-3", "name": "Lead Gen Tracker", "type": "leadgen", "status": "online", "description": "Twitter DM outreach", "avatar_url": None, "handle": "@lead-tracker", "created_at": "2025-03-01T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "lg-4", "name": "Lead Gen Miner", "type": "leadgen", "status": "online", "description": "LinkedIn Sales Navigator", "avatar_url": None, "handle": "@lead-miner", "created_at": "2025-03-01T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
    {"id": "lg-5", "name": "Lead Gen Sniper", "type": "leadgen", "status": "warning", "description": "Qualified lead verification", "avatar_url": None, "handle": "@lead-sniper", "created_at": "2025-03-01T10:00:00Z", "updated_at": "2026-05-08T16:00:00Z"},
]

MOCK_ACTIVITIES: List[Dict[str, Any]] = [
    {"id": "act-1", "agent_id": "sa-3", "agentType": "support", "agentName": "Support Agent #3", "action": "Resolved ticket #4821", "detail": "Billing inquiry — Refund processed", "timestamp": "1m ago", "badge": "Resolved", "badgeColor": "emerald"},
    {"id": "act-2", "agent_id": "lg-2", "agentType": "leadgen", "agentName": "Lead Gen Agent #2", "action": "New qualified lead found", "detail": "Reddit r/entrepreneur — SaaS pricing pain", "timestamp": "2m ago", "badge": "Qualified", "badgeColor": "violet"},
    {"id": "act-3", "agent_id": "ma-1", "agentType": "social", "agentName": "Social Agent #1", "action": "Published post to LinkedIn", "detail": '"10 Mistakes Bootstrappers Make" — 1.2K impressions', "timestamp": "3m ago"},
    {"id": "act-4", "agent_id": "sa-1", "agentType": "support", "agentName": "Support Agent #1", "action": "Escalated ticket #4823", "detail": "Database connectivity issue — L2 assigned", "timestamp": "4m ago", "badge": "Escalated", "badgeColor": "amber"},
    {"id": "act-5", "agent_id": "lg-4", "agentType": "leadgen", "agentName": "Lead Gen Agent #4", "action": "Outreach delivered", "detail": "IndieHackers user replied to DM", "timestamp": "5m ago", "badge": "Converted", "badgeColor": "emerald"},
]

MOCK_CONVERSATIONS: List[Dict[str, Any]] = [
    {"id": "conv-1", "user_name": "Sarah Mitchell", "email": "sarah@acme.com", "status": "active", "priority": "critical", "unread": 2, "ticket_number": "#4821", "last_message": "The API keeps returning 500 errors...", "timestamp": "2m"},
    {"id": "conv-2", "user_name": "Mike Rodriguez", "email": "mike@techcorp.io", "status": "active", "priority": "medium", "unread": 1, "ticket_number": "#4822", "last_message": "Can I get a refund for last month?", "timestamp": "4m"},
    {"id": "conv-3", "user_name": "Jessica Taylor", "email": "jessica@startup.co", "status": "waiting", "priority": "low", "unread": 0, "ticket_number": "#4824", "last_message": "How do I connect Zapier?", "timestamp": "6m"},
    {"id": "conv-4", "user_name": "David Kim", "email": "david@enterprise.com", "status": "escalated", "priority": "critical", "unread": 3, "ticket_number": "#4823", "last_message": "Urgent: Our team lost dashboard access", "timestamp": "8m"},
    {"id": "conv-5", "user_name": "Emily Chen", "email": "emily@design.studio", "status": "waiting", "priority": "low", "unread": 0, "ticket_number": "#4825", "last_message": "Feature request: dark mode for mobile", "timestamp": "12m"},
]

MOCK_CAMPAIGNS: List[Dict[str, Any]] = [
    {"id": "camp1", "name": "Q1 Product Launch", "platform": "twitter", "status": "active", "reach": 45200, "engagement_rate": 8.3, "clicks": 3240},
    {"id": "camp2", "name": "Developer Relations", "platform": "linkedin", "status": "active", "reach": 18700, "engagement_rate": 12.1, "clicks": 1890},
    {"id": "camp3", "name": "Customer Success Stories", "platform": "linkedin", "status": "draft", "reach": 0, "engagement_rate": 0.0, "clicks": 0},
    {"id": "camp4", "name": "#BuildInPublic March", "platform": "twitter", "status": "completed", "reach": 62100, "engagement_rate": 15.4, "clicks": 4850},
]

MOCK_LEADS: List[Dict[str, Any]] = [
    {"id": "l1", "name": "Alex Thornton", "source": "Reddit r/SaaS", "score": 85, "stage": "discovered", "date_discovered": "2h ago"},
    {"id": "l2", "name": "Priya Sharma", "source": "IndieHackers", "score": 72, "stage": "discovered", "date_discovered": "3h ago"},
    {"id": "l9", "name": "David Nakamura", "source": "Reddit r/SaaS", "score": 94, "stage": "qualified", "date_discovered": "1d ago"},
    {"id": "l15", "name": "Nathan Brooks", "source": "Reddit r/SaaS", "score": 92, "stage": "contacted", "date_discovered": "2d ago"},
    {"id": "l20", "name": "Jennifer Walsh", "source": "Reddit r/SaaS", "score": 96, "stage": "responded", "date_discovered": "1d ago"},
    {"id": "l24", "name": "Michelle Park", "source": "Reddit r/SaaS", "score": 93, "stage": "meeting_scheduled", "date_discovered": "2d ago"},
    {"id": "l26", "name": "Amanda Lewis", "source": "Reddit r/SaaS", "score": 98, "stage": "converted", "date_discovered": "5d ago"},
]

MOCK_VAULT: List[Dict[str, Any]] = [
    {"id": "kv-1", "category": "support", "title": "Refund Policy FAQ", "content": "Customers can request a refund within 30 days...", "tags": ["billing", "refund"], "created_by": "admin@projectpretzel.org", "created_at": "2025-01-10T10:00:00Z"},
    {"id": "kv-2", "category": "social", "title": "Brand Voice Guidelines", "content": "Professional but approachable. Use data...", "tags": ["brand", "voice"], "created_by": "admin@projectpretzel.org", "created_at": "2025-02-15T14:00:00Z"},
    {"id": "kv-3", "category": "leadgen", "title": "Ideal Customer Profile", "content": "SaaS founders, 10-200 employees, B2B...", "tags": ["icp", "targeting"], "created_by": "admin@projectpretzel.org", "created_at": "2025-03-01T09:00:00Z"},
    {"id": "kv-4", "category": "general", "title": "System Architecture", "content": "FastAPI + Next.js + Supabase PostgreSQL...", "tags": ["architecture", "docs"], "created_by": "admin@projectpretzel.org", "created_at": "2025-04-20T11:00:00Z"},
]


# ════════════════════════════════════════════════════════════
# AGENT FLEET
# ════════════════════════════════════════════════════════════

@router.get("/overview", response_model=Dict[str, Any])
async def get_agents_overview():
    total = len(MOCK_AGENTS)
    online = sum(1 for a in MOCK_AGENTS if a["status"] == "online")
    busy = sum(1 for a in MOCK_AGENTS if a["status"] == "busy")
    warning = sum(1 for a in MOCK_AGENTS if a["status"] == "warning")
    error = sum(1 for a in MOCK_AGENTS if a["status"] == "error")
    return {
        "agents": MOCK_AGENTS,
        "summary": {
            "total": total,
            "online": online,
            "busy": busy,
            "warning": warning,
            "error": error,
        },
        "recent_activity": MOCK_ACTIVITIES[:10],
    }


@router.get("/{agent_type}", response_model=List[Dict[str, Any]])
async def get_agents_by_type(agent_type: str):
    allowed = {"support", "social", "leadgen"}
    if agent_type not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid agent_type. Must be one of {allowed}")
    return [a for a in MOCK_AGENTS if a["type"] == agent_type]


@router.post("/{agent_id}/configure", response_model=Dict[str, str])
async def configure_agent(agent_id: str, payload: schemas.AgentConfigBase):
    agent = next((a for a in MOCK_AGENTS if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"status": "updated", "agent_id": agent_id}


@router.get("/{agent_id}/activity", response_model=List[Dict[str, Any]])
async def get_agent_activity(agent_id: str):
    return [act for act in MOCK_ACTIVITIES if act["agent_id"] == agent_id]


# ════════════════════════════════════════════════════════════
# SUPPORT
# ════════════════════════════════════════════════════════════

@router.get("/support/conversations", response_model=List[Dict[str, Any]])
async def get_support_conversations():
    return MOCK_CONVERSATIONS


@router.get("/support/conversations/{conv_id}", response_model=Dict[str, Any])
async def get_conversation(conv_id: str):
    conv = next((c for c in MOCK_CONVERSATIONS if c["id"] == conv_id), None)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.post("/support/escalate", response_model=Dict[str, str])
async def escalate_conversation(payload: schemas.EscalationRequest):
    return {"status": "escalated", "conversation_id": payload.conversation_id}


@router.post("/support/draft-reply", response_model=schemas.DraftReplyOut)
async def draft_reply(payload: schemas.DraftReplyRequest):
    return schemas.DraftReplyOut(
        draft_id="draft-" + payload.conversation_id,
        status="pending_review",
        content=payload.content,
    )


# ════════════════════════════════════════════════════════════
# SOCIAL
# ════════════════════════════════════════════════════════════

@router.get("/social/campaigns", response_model=List[Dict[str, Any]])
async def get_social_campaigns():
    return MOCK_CAMPAIGNS


@router.post("/social/schedule-post", response_model=Dict[str, str])
async def schedule_post(payload: schemas.SchedulePostRequest):
    return {"status": "scheduled", "post_id": "post-new", "platforms": payload.platforms}


@router.get("/social/engagement", response_model=List[Dict[str, Any]])
async def get_social_engagement():
    return [
        {"id": "e1", "platform": "twitter", "user_name": "Sarah Chen", "action_type": "comment", "content": "This is exactly what we needed!", "sentiment": "positive", "time_ago": "2m ago"},
        {"id": "e2", "platform": "linkedin", "user_name": "Michael Rodriguez", "action_type": "share", "content": "Great insights on scaling.", "sentiment": "positive", "time_ago": "5m ago"},
    ]


# ════════════════════════════════════════════════════════════
# LEADS
# ════════════════════════════════════════════════════════════

@router.get("/leads/pipeline", response_model=List[Dict[str, Any]])
async def get_leads_pipeline():
    return MOCK_LEADS


@router.get("/leads/sources", response_model=Dict[str, int])
async def get_lead_sources():
    sources: Dict[str, int] = {}
    for lead in MOCK_LEADS:
        src = lead["source"]
        sources[src] = sources.get(src, 0) + 1
    return sources


@router.post("/leads/score", response_model=schemas.ScoreLeadOut)
async def score_lead(payload: schemas.ScoreLeadRequest):
    lead = next((l for l in MOCK_LEADS if l["id"] == payload.lead_id), None)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return schemas.ScoreLeadOut(
        lead_id=payload.lead_id,
        score=lead["score"],
        factors={"problem_fit": 90, "intent_signals": 85, "profile_fit": 88},
    )


@router.post("/leads/outreach-draft", response_model=schemas.OutreachDraftOut)
async def outreach_draft(payload: schemas.OutreachDraftRequest):
    return schemas.OutreachDraftOut(
        draft_id="draft-" + payload.lead_id,
        lead_id=payload.lead_id,
        channel=payload.channel,
        message="Hi there! I noticed your post about support challenges...",
        status="draft",
    )


# ════════════════════════════════════════════════════════════
# TRAINING & VAULT
# ════════════════════════════════════════════════════════════

@router.get("/vault", response_model=List[Dict[str, Any]])
async def get_knowledge_vault():
    return MOCK_VAULT


@router.post("/training/example", response_model=Dict[str, str])
async def add_training_example(payload: schemas.AgentTrainingBase):
    return {"status": "created", "training_id": "tr-new"}


@router.get("/settings/{agent_type}", response_model=Dict[str, Any])
async def get_agent_settings(agent_type: str):
    return {
        "agent_type": agent_type,
        "model": "gpt-4o",
        "temperature": 0.3,
        "max_tokens": 1024,
        "auto_escalation": True,
        "guardrails": {"max_attempts": 3, "timeout_seconds": 300},
    }


@router.post("/settings/{agent_type}", response_model=Dict[str, str])
async def update_agent_settings(agent_type: str, payload: Dict[str, Any]):
    return {"status": "updated", "agent_type": agent_type}
