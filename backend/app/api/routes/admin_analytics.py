from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.schemas.analytics import OverviewMetrics, KnotMetrics
import datetime
from fastapi.responses import JSONResponse

router = APIRouter()


def get_db():
    pass


@router.get("/overview", response_model=OverviewMetrics)
def get_overview(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    source_app: Optional[str] = Query("all"),
):
    """Top-level ecosystem KPIs.
    Sources:
      - project-pretzel: dashboard_daily_rollups, users, projects, contracts tables
      - PretzelKnot: User, ContractorProfile tables (read-only replica or API call)
    """
    return OverviewMetrics(
        total_users=15234,
        total_users_delta=2.4,
        new_users_today=145,
        new_users_delta=12.1,
        daily_active=3420,
        daily_active_delta=-1.2,
        profiles_created=4500,
        total_searches_today=8900,
        ai_requests_today=45300,
        api_requests_today=124000,
        avg_api_latency_ms=120,
        error_rate=0.04,
        health_status="optimal",
        active_projects=1840,
        contracts_this_month=267,
    )


@router.get("/knot-metrics", response_model=KnotMetrics)
def get_knot_metrics():
    """PretzelKnot contractor directory aggregate metrics.
    Source: PretzelKnot PostgreSQL (read via cross-DB query or synced rollup table).
      - total_contractors    -> COUNT(ContractorProfile)
      - verified_contractors -> COUNT(ContractorProfile WHERE IsVerified = true)
      - active_listings      -> COUNT(ContractorProfile WHERE IsPublic = true)
      - avg_rating           -> AVG(ContractorProfile.AverageRating)
      - new_contractors_today-> COUNT(User WHERE Role='Contractor' AND CreatedAt >= today)
      - synced_projects      -> COUNT(SyncedProject)
    """
    return KnotMetrics(
        total_contractors=3120,
        verified_contractors=1480,
        active_listings=2340,
        avg_rating=4.7,
        new_contractors_today=28,
        synced_projects=890,
    )


@router.get("/knot-trade-breakdown")
def get_knot_trade_breakdown():
    """Contractor count by trade category.
    Source: PretzelKnot ContractorProfile.TradeCategory — GROUP BY.
    """
    return {
        "trades": [
            {"trade": "Electrician", "count": 480},
            {"trade": "Plumber", "count": 420},
            {"trade": "General Contractor", "count": 380},
            {"trade": "Roofer", "count": 310},
            {"trade": "HVAC", "count": 290},
            {"trade": "Painter", "count": 240},
            {"trade": "Flooring", "count": 210},
            {"trade": "Other", "count": 790},
        ]
    }


@router.get("/users")
def get_users_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """User growth, signups, activation funnel, retention.
    Source: project-pretzel dashboard_daily_rollups + users table.
    """
    return {
        "growth_chart": [
            {"date": "2026-03-10", "total": 14000, "new": 100},
            {"date": "2026-03-11", "total": 14120, "new": 120},
            {"date": "2026-03-12", "total": 14300, "new": 180},
            {"date": "2026-03-13", "total": 14450, "new": 150},
            {"date": "2026-03-14", "total": 14800, "new": 350},
            {"date": "2026-03-15", "total": 15020, "new": 220},
            {"date": "2026-03-16", "total": 15234, "new": 214},
        ],
        "funnel": {
            "visitor": 45000,
            "signup": 15234,
            "onboarding": 12000,
            "profile_created": 4500,
            "active": 3420,
        },
    }


@router.get("/ai")
def get_ai_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """AI usage, tokens, latency, model breakdown.
    Source: project-pretzel analytics_events WHERE event_name LIKE 'ai_%'
             + dashboard_daily_rollups.ai_requests_count.
    """
    return {
        "daily_requests": [
            {"date": "2026-03-10", "requests": 34000, "unique_users": 1800},
            {"date": "2026-03-11", "requests": 35000, "unique_users": 1850},
            {"date": "2026-03-12", "requests": 31000, "unique_users": 1500},
            {"date": "2026-03-13", "requests": 39000, "unique_users": 2100},
            {"date": "2026-03-14", "requests": 41000, "unique_users": 2300},
            {"date": "2026-03-15", "requests": 43000, "unique_users": 2350},
            {"date": "2026-03-16", "requests": 45300, "unique_users": 2420},
        ],
        "model_breakdown": [
            {"model": "gpt-4-turbo", "pct": 65},
            {"model": "claude-3-opus", "pct": 25},
            {"model": "gpt-3.5-turbo", "pct": 10},
        ],
        "avg_latency_ms": 840,
        "success_rate": 98.5,
    }


@router.get("/health")
def get_health_analytics():
    """Service health, DB connections, uptime.
    Sources:
      - project-pretzel: FastAPI /health endpoint, DB ping, Redis ping
      - PretzelKnot: .NET /health endpoint
    """
    return {
        "services": [
            {"name": "Main API (Pretzel.io)", "status": "healthy", "latency": 110, "uptime": 99.99},
            {"name": "PostgreSQL (Pretzel)", "status": "healthy", "latency": 45, "uptime": 99.98},
            {"name": "Redis Cache", "status": "healthy", "latency": 5, "uptime": 100},
            {"name": "Celery Workers", "status": "warning", "latency": 0, "uptime": 99.10, "queue": 1500},
            {"name": "PretzelKnot API (.NET)", "status": "healthy", "latency": 80, "uptime": 99.95},
            {"name": "PostgreSQL (Knot)", "status": "healthy", "latency": 38, "uptime": 99.97},
        ]
    }


@router.get("/live")
def get_live_feed():
    """Recent cross-platform events feed.
    Source: project-pretzel analytics_events ORDER BY created_at DESC LIMIT 20.
    """
    return {
        "events": [
            {"id": "evt1", "time": "Just now", "type": "signup", "message": "New user signed up from web", "severity": "info", "source": "pretzel"},
            {"id": "evt2", "time": "2m ago", "type": "ai", "message": "AI Request spike on /generate_contract", "severity": "warning", "source": "pretzel"},
            {"id": "evt3", "time": "8m ago", "type": "knot", "message": "New contractor registered: Apex Electric LLC", "severity": "success", "source": "knot"},
            {"id": "evt4", "time": "15m ago", "type": "search", "message": "Zero results for 'quantum entanglement'", "severity": "info", "source": "knot"},
            {"id": "evt5", "time": "1h ago", "type": "error", "message": "DB connection degraded momentarily", "severity": "error", "source": "pretzel"},
            {"id": "evt6", "time": "1h 10m ago", "type": "billing", "message": "Pro subscription activated — Summit Builds", "severity": "success", "source": "knot"},
        ]
    }


@router.get("/founder-insights")
def get_founder_insights():
    """AI-curated executive summary bullets.
    Production: LLM call summarizing last 24h of analytics_events + rollup data.
    """
    return {
        "insights": [
            "User signups up 12% vs prior week — organic search driving most growth.",
            "AI usage surged 4,000 requests over the last 3 hours.",
            "PretzelKnot added 28 new verified contractors today, highest this month.",
            "Contract pipeline is $9.05M across 1,057 active contracts.",
            "Pro tier churn dropped 0.2% — retention improving after onboarding update.",
        ]
    }
