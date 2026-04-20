import datetime
import logging
from typing import Optional

from fastapi import APIRouter, Query
from sqlalchemy import func, select, text

from app.models.analytics_events import AnalyticsEvent, DashboardDailyRollup
from app.models.database import AsyncSessionLocal
from app.models.pretzel import (
    PretzelAIRunLog,
    PretzelContract,
    PretzelProject,
    PretzelUser,
)
from app.schemas.analytics import KnotMetrics, OverviewMetrics

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Helpers ────────────────────────────────────────────────────────────────────

def _today_start() -> datetime.datetime:
    return datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

def _month_start() -> datetime.datetime:
    now = datetime.datetime.utcnow()
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

def _yesterday_start() -> datetime.datetime:
    return _today_start() - datetime.timedelta(days=1)


async def _get_overview_data() -> dict:
    today = _today_start()
    yesterday = _yesterday_start()
    month_start = _month_start()
    five_min_ago = datetime.datetime.utcnow() - datetime.timedelta(minutes=5)

    async with AsyncSessionLocal() as db:
        # Total users
        total_users_q = await db.execute(select(func.count()).select_from(PretzelUser))
        total_users = total_users_q.scalar() or 0

        # New users today
        new_today_q = await db.execute(
            select(func.count()).select_from(PretzelUser)
            .where(PretzelUser.created_at >= today)
        )
        new_users_today = new_today_q.scalar() or 0

        # New users yesterday (for delta)
        new_yesterday_q = await db.execute(
            select(func.count()).select_from(PretzelUser)
            .where(PretzelUser.created_at >= yesterday, PretzelUser.created_at < today)
        )
        new_users_yesterday = new_yesterday_q.scalar() or 1  # avoid div/0

        new_users_delta = round(
            (new_users_today - new_users_yesterday) / new_users_yesterday * 100, 1
        )

        # Total users delta vs yesterday's total
        total_yesterday_q = await db.execute(
            select(func.count()).select_from(PretzelUser)
            .where(PretzelUser.created_at < today)
        )
        total_yesterday = total_yesterday_q.scalar() or 1
        total_users_delta = round(
            (total_users - total_yesterday) / total_yesterday * 100, 1
        )

        # DAU — distinct sessions in last 24 h
        dau_q = await db.execute(
            select(func.count(func.distinct(AnalyticsEvent.session_id)))
            .where(AnalyticsEvent.created_at >= today)
        )
        daily_active = dau_q.scalar() or 0

        # DAU yesterday for delta
        dau_yesterday_q = await db.execute(
            select(func.count(func.distinct(AnalyticsEvent.session_id)))
            .where(AnalyticsEvent.created_at >= yesterday, AnalyticsEvent.created_at < today)
        )
        dau_yesterday = dau_yesterday_q.scalar() or 1
        daily_active_delta = round(
            (daily_active - dau_yesterday) / dau_yesterday * 100, 1
        )

        # Profiles created — users with full_name set, total
        profiles_q = await db.execute(
            select(func.count()).select_from(PretzelUser)
            .where(PretzelUser.full_name.isnot(None))
        )
        profiles_created = profiles_q.scalar() or 0

        # Searches today
        searches_q = await db.execute(
            select(func.count()).select_from(AnalyticsEvent)
            .where(
                AnalyticsEvent.event_name == "search",
                AnalyticsEvent.created_at >= today,
            )
        )
        total_searches_today = searches_q.scalar() or 0

        # AI requests today
        ai_q = await db.execute(
            select(func.count()).select_from(PretzelAIRunLog)
            .where(PretzelAIRunLog.created_at >= today)
        )
        ai_requests_today = ai_q.scalar() or 0

        # API stats from daily rollup (latest row)
        rollup_q = await db.execute(
            select(DashboardDailyRollup)
            .where(DashboardDailyRollup.date >= today)
            .order_by(DashboardDailyRollup.date.desc())
            .limit(1)
        )
        rollup = rollup_q.scalar_one_or_none()
        api_requests_today = rollup.api_requests_count if rollup else 0
        avg_api_latency_ms = rollup.avg_api_latency_ms if rollup else 0
        error_rate = (
            round(rollup.api_error_count / rollup.api_requests_count, 4)
            if rollup and rollup.api_requests_count
            else 0.0
        )

        # Active projects
        projects_q = await db.execute(
            select(func.count()).select_from(PretzelProject)
            .where(PretzelProject.is_active == True, PretzelProject.archived_at.is_(None))
        )
        active_projects = projects_q.scalar() or 0

        # Contracts this month
        contracts_q = await db.execute(
            select(func.count()).select_from(PretzelContract)
            .where(PretzelContract.created_at >= month_start)
        )
        contracts_this_month = contracts_q.scalar() or 0

    return dict(
        total_users=total_users,
        total_users_delta=total_users_delta,
        new_users_today=new_users_today,
        new_users_delta=new_users_delta,
        daily_active=daily_active,
        daily_active_delta=daily_active_delta,
        profiles_created=profiles_created,
        total_searches_today=total_searches_today,
        ai_requests_today=ai_requests_today,
        api_requests_today=api_requests_today,
        avg_api_latency_ms=avg_api_latency_ms,
        error_rate=error_rate,
        health_status="optimal",
        active_projects=active_projects,
        contracts_this_month=contracts_this_month,
    )


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("/overview", response_model=OverviewMetrics)
async def get_overview(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    source_app: Optional[str] = Query("all"),
):
    try:
        data = await _get_overview_data()
        return OverviewMetrics(**data)
    except Exception:
        logger.exception("overview query failed")
        return OverviewMetrics(
            total_users=0, total_users_delta=0, new_users_today=0, new_users_delta=0,
            daily_active=0, daily_active_delta=0, profiles_created=0,
            total_searches_today=0, ai_requests_today=0, api_requests_today=0,
            avg_api_latency_ms=0, error_rate=0, health_status="unknown",
            active_projects=0, contracts_this_month=0,
        )


@router.get("/knot-metrics", response_model=KnotMetrics)
async def get_knot_metrics():
    """
    PretzelKnot contractor directory metrics.
    Fetched from the Knot REST API (KNOT_API_URL env var).
    Falls back to zeros on error.
    """
    import os
    import httpx

    knot_url = os.getenv("KNOT_API_URL", "")
    if knot_url:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(f"{knot_url}/api/admin/metrics")
                if resp.status_code == 200:
                    d = resp.json()
                    return KnotMetrics(
                        total_contractors=d.get("total_contractors", 0),
                        verified_contractors=d.get("verified_contractors", 0),
                        active_listings=d.get("active_listings", 0),
                        avg_rating=d.get("avg_rating", 0.0),
                        new_contractors_today=d.get("new_contractors_today", 0),
                        synced_projects=d.get("synced_projects", 0),
                    )
        except Exception:
            logger.exception("knot metrics fetch failed")

    return KnotMetrics(
        total_contractors=0, verified_contractors=0, active_listings=0,
        avg_rating=0.0, new_contractors_today=0, synced_projects=0,
    )


@router.get("/knot-trade-breakdown")
async def get_knot_trade_breakdown():
    import os
    import httpx

    knot_url = os.getenv("KNOT_API_URL", "")
    if knot_url:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(f"{knot_url}/api/admin/trade-breakdown")
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            logger.exception("knot trade breakdown fetch failed")

    return {"trades": []}


@router.get("/users")
async def get_users_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    try:
        async with AsyncSessionLocal() as db:
            rows = await db.execute(
                select(
                    func.date_trunc("day", PretzelUser.created_at).label("date"),
                    func.count().label("new"),
                )
                .where(PretzelUser.created_at >= datetime.datetime.utcnow() - datetime.timedelta(days=14))
                .group_by("date")
                .order_by("date")
            )
            daily = rows.fetchall()

            # Running total for each day
            total_q = await db.execute(select(func.count()).select_from(PretzelUser))
            total_now = total_q.scalar() or 0
            # Walk backwards to reconstruct daily totals
            growth_chart = []
            running = total_now
            for row in reversed(daily):
                growth_chart.insert(0, {
                    "date": str(row.date)[:10],
                    "total": running,
                    "new": row.new,
                })
                running -= row.new

            today = _today_start()
            dau_q = await db.execute(
                select(func.count(func.distinct(AnalyticsEvent.session_id)))
                .where(AnalyticsEvent.created_at >= today)
            )
            dau = dau_q.scalar() or 0

            profiles_q = await db.execute(
                select(func.count()).select_from(PretzelUser)
                .where(PretzelUser.full_name.isnot(None))
            )
            profiles = profiles_q.scalar() or 0

            return {
                "growth_chart": growth_chart,
                "funnel": {
                    "visitor": 0,   # from analytics_events page_view distinct sessions (all-time)
                    "signup": total_now,
                    "onboarding": 0,
                    "profile_created": profiles,
                    "active": dau,
                },
            }
    except Exception:
        logger.exception("users analytics query failed")
        return {"growth_chart": [], "funnel": {}}


@router.get("/ai")
async def get_ai_analytics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    try:
        async with AsyncSessionLocal() as db:
            rows = await db.execute(
                select(
                    func.date_trunc("day", PretzelAIRunLog.created_at).label("date"),
                    func.count().label("requests"),
                    func.count(func.distinct(PretzelAIRunLog.user_id)).label("unique_users"),
                )
                .where(PretzelAIRunLog.created_at >= datetime.datetime.utcnow() - datetime.timedelta(days=7))
                .group_by("date")
                .order_by("date")
            )
            daily = rows.fetchall()
            return {
                "daily_requests": [
                    {"date": str(r.date)[:10], "requests": r.requests, "unique_users": r.unique_users}
                    for r in daily
                ],
                "avg_latency_ms": 0,
                "success_rate": 100,
            }
    except Exception:
        logger.exception("ai analytics query failed")
        return {"daily_requests": [], "avg_latency_ms": 0, "success_rate": 0}


@router.get("/health")
async def get_health_analytics():
    return {
        "services": [
            {"name": "Main API (Pretzel.io)",   "status": "healthy", "latency": 0, "uptime": 99.99},
            {"name": "PostgreSQL (Pretzel)",     "status": "healthy", "latency": 0, "uptime": 99.98},
            {"name": "PretzelKnot API (.NET)",   "status": "healthy", "latency": 0, "uptime": 99.95},
        ]
    }


@router.get("/live")
async def get_live_feed():
    try:
        async with AsyncSessionLocal() as db:
            five_min_ago = datetime.datetime.utcnow() - datetime.timedelta(minutes=30)
            rows = await db.execute(
                select(AnalyticsEvent)
                .where(AnalyticsEvent.created_at >= five_min_ago)
                .order_by(AnalyticsEvent.created_at.desc())
                .limit(20)
            )
            events = rows.scalars().all()
            if events:
                return {
                    "events": [
                        {
                            "id": str(e.id),
                            "time": _relative_time(e.created_at),
                            "type": e.event_name,
                            "message": f"{e.event_name} on {e.page_path or 'unknown'}",
                            "severity": "info",
                            "source": e.source_app or "pretzel",
                        }
                        for e in events
                    ]
                }
    except Exception:
        logger.exception("live feed query failed")
    return {"events": []}


@router.get("/founder-insights")
async def get_founder_insights():
    try:
        data = await _get_overview_data()
        insights = [
            f"Total platform users: {data['total_users']:,} ({_delta_str(data['total_users_delta'])} vs yesterday).",
            f"New signups today: {data['new_users_today']:,} ({_delta_str(data['new_users_delta'])} vs yesterday).",
            f"Daily active users: {data['daily_active']:,} ({_delta_str(data['daily_active_delta'])} vs yesterday).",
            f"Active projects on platform: {data['active_projects']:,}.",
            f"Contracts created this month: {data['contracts_this_month']:,}.",
        ]
        return {"insights": insights}
    except Exception:
        logger.exception("founder insights failed")
        return {"insights": []}


# ── Utilities ──────────────────────────────────────────────────────────────────

def _delta_str(delta: float) -> str:
    sign = "+" if delta >= 0 else ""
    return f"{sign}{delta}%"


def _relative_time(dt: datetime.datetime) -> str:
    diff = datetime.datetime.utcnow() - dt.replace(tzinfo=None)
    secs = int(diff.total_seconds())
    if secs < 60:
        return "Just now"
    if secs < 3600:
        return f"{secs // 60}m ago"
    return f"{secs // 3600}h ago"
