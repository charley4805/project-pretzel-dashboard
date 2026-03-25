from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.schemas.analytics import OverviewMetrics, UsersMetrics, UsageMetrics, AIMetrics, SearchMetrics, ApiMetrics, HealthMetrics
import datetime
from fastapi.responses import JSONResponse

router = APIRouter()

# Dependency mock for Database
def get_db():
    pass

@router.get("/overview", response_model=OverviewMetrics)
def get_overview(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    source_app: Optional[str] = Query("all")
):
    """Returns top level KPIs for selected date range."""
    # Production: Query `dashboard_daily_rollups` over the date range
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
        health_status="optimal"
    )

@router.get("/users")
def get_users_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Returns growth, signups, profiles, activation, retention."""
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
            "active": 3420
        }
    }

@router.get("/ai")
def get_ai_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Returns AI usage, unique AI users, trends, tokens, latency, failures"""
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
        "success_rate": 98.5
    }

@router.get("/health")
def get_health_analytics():
    """Returns service health, DB connections, uptime"""
    return {
        "services": [
            {"name": "Main API", "status": "healthy", "latency": 110, "uptime": 99.99},
            {"name": "Database", "status": "healthy", "latency": 45, "uptime": 99.98},
            {"name": "Redis Cache", "status": "healthy", "latency": 5, "uptime": 100},
            {"name": "Background Workers", "status": "warning", "latency": 0, "uptime": 99.10, "queue": 1500},
            {"name": "Knot Service", "status": "healthy", "latency": 80, "uptime": 99.95},
        ]
    }

@router.get("/live")
def get_live_feed():
    """Scrolling feed of recent events."""
    import time
    return {
        "events": [
            {"id": "evt1", "time": "Just now", "type": "signup", "message": "New user signed up from web", "severity": "info"},
            {"id": "evt2", "time": "2m ago", "type": "ai", "message": "AI Request spike observed on /generate_contract", "severity": "warning"},
            {"id": "evt3", "time": "15m ago", "type": "search", "message": "Zero results for 'quantum entanglement'", "severity": "info"},
            {"id": "evt4", "time": "1h ago", "type": "error", "message": "Database connection degraded momentarily", "severity": "error"},
            {"id": "evt5", "time": "1h 10m ago", "type": "profile", "message": "User completed full profile setup", "severity": "success"},
        ]
    }

@router.get("/founder-insights")
def get_founder_insights():
    return {
        "insights": [
            "User signups are up 12% vs prior week.",
            "AI usage surged by 4,000 requests over the last 3 hours.",
            "The /api/ai/chat endpoint is currently showing elevated latency.",
            "Main Landing page is converting at 4.2% today, slightly above average."
        ]
    }
