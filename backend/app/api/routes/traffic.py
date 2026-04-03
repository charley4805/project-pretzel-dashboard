from fastapi import APIRouter
from sqlalchemy import select, func, text
from app.models.database import AsyncSessionLocal
from app.models.analytics_events import AnalyticsEvent
import datetime

router = APIRouter()


@router.get("/overview")
async def traffic_overview():
    try:
        async with AsyncSessionLocal() as db:
            today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            pv = await db.execute(
                select(func.count()).where(
                    AnalyticsEvent.created_at >= today_start,
                    AnalyticsEvent.event_name == "page_view",
                )
            )
            page_views_today = pv.scalar() or 0

            uv = await db.execute(
                select(func.count(func.distinct(AnalyticsEvent.session_id))).where(
                    AnalyticsEvent.created_at >= today_start
                )
            )
            unique_visitors_today = uv.scalar() or 0

            five_min_ago = datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
            active_q = await db.execute(
                select(func.count(func.distinct(AnalyticsEvent.session_id))).where(
                    AnalyticsEvent.created_at >= five_min_ago
                )
            )
            active_now = active_q.scalar() or 0

            return {
                "page_views_today": page_views_today,
                "unique_visitors_today": unique_visitors_today,
                "active_now": active_now,
                "bounce_rate": None,
                "avg_session_duration_sec": None,
                "top_referrer": None,
                "disconnected": False,
            }
    except Exception:
        return {"disconnected": True}


@router.get("/daily-trend")
async def traffic_daily_trend():
    try:
        async with AsyncSessionLocal() as db:
            seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
            rows = await db.execute(
                select(
                    func.date_trunc("day", AnalyticsEvent.created_at).label("date"),
                    func.count().label("page_views"),
                    func.count(func.distinct(AnalyticsEvent.session_id)).label("unique_visitors"),
                )
                .where(
                    AnalyticsEvent.created_at >= seven_days_ago,
                    AnalyticsEvent.event_name == "page_view",
                )
                .group_by("date")
                .order_by("date")
            )
            return [
                {
                    "date": str(r.date)[:10],
                    "page_views": r.page_views,
                    "unique_visitors": r.unique_visitors,
                }
                for r in rows.fetchall()
            ]
    except Exception:
        return []


@router.get("/top-pages")
async def traffic_top_pages():
    try:
        async with AsyncSessionLocal() as db:
            today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            rows = await db.execute(
                select(
                    AnalyticsEvent.page_path,
                    func.count().label("views"),
                    func.count(func.distinct(AnalyticsEvent.session_id)).label("unique"),
                )
                .where(
                    AnalyticsEvent.created_at >= today_start,
                    AnalyticsEvent.page_path.isnot(None),
                )
                .group_by(AnalyticsEvent.page_path)
                .order_by(func.count().desc())
                .limit(10)
            )
            return [
                {"path": r.page_path, "views": r.views, "unique": r.unique, "avg_time_sec": 0}
                for r in rows.fetchall()
            ]
    except Exception:
        return []


@router.get("/sources")
async def traffic_sources():
    try:
        async with AsyncSessionLocal() as db:
            today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            rows = await db.execute(
                text("""
                    SELECT
                        COALESCE(metadata->>'utm_source', 'direct') as source,
                        COUNT(*) as visitors
                    FROM analytics_events
                    WHERE created_at >= :start
                    GROUP BY 1
                    ORDER BY 2 DESC
                    LIMIT 10
                """),
                {"start": today_start},
            )
            result = rows.fetchall()
            total = sum(r.visitors for r in result) or 1
            return [
                {"source": r.source, "visitors": r.visitors, "pct": round(r.visitors / total * 100, 1)}
                for r in result
            ]
    except Exception:
        return []


@router.get("/live")
async def traffic_live():
    try:
        async with AsyncSessionLocal() as db:
            five_min_ago = datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
            rows = await db.execute(
                select(AnalyticsEvent)
                .where(AnalyticsEvent.created_at >= five_min_ago)
                .order_by(AnalyticsEvent.created_at.desc())
                .limit(20)
            )
            events = rows.scalars().all()
            return [
                {
                    "session_id": str(e.session_id) if e.session_id else None,
                    "page_path": e.page_path,
                    "event_name": e.event_name,
                    "source_app": e.source_app,
                    "occurred_at": e.created_at.isoformat() if e.created_at else None,
                }
                for e in events
            ]
    except Exception:
        return []
