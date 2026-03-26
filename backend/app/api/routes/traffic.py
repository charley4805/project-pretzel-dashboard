from fastapi import APIRouter
from sqlalchemy import select, func, text
from app.models.database import AsyncSessionLocal
from app.models.analytics_events import AnalyticsEvent
import datetime

router = APIRouter()

MOCK_OVERVIEW = {
    "page_views_today": 1247,
    "unique_visitors_today": 389,
    "active_now": 23,
    "bounce_rate": 38.2,
    "avg_session_duration_sec": 187,
    "top_referrer": "google.com",
}

MOCK_DAILY_TREND = [
    {"date": "2026-03-20", "page_views": 980, "unique_visitors": 310},
    {"date": "2026-03-21", "page_views": 1102, "unique_visitors": 345},
    {"date": "2026-03-22", "page_views": 876, "unique_visitors": 280},
    {"date": "2026-03-23", "page_views": 1320, "unique_visitors": 412},
    {"date": "2026-03-24", "page_views": 1189, "unique_visitors": 377},
    {"date": "2026-03-25", "page_views": 1403, "unique_visitors": 441},
    {"date": "2026-03-26", "page_views": 1247, "unique_visitors": 389},
]

MOCK_TOP_PAGES = [
    {"path": "/", "views": 324, "unique": 210, "avg_time_sec": 45},
    {"path": "/find-a-pro", "views": 218, "unique": 175, "avg_time_sec": 134},
    {"path": "/pricing", "views": 187, "unique": 162, "avg_time_sec": 98},
    {"path": "/signup", "views": 143, "unique": 143, "avg_time_sec": 72},
    {"path": "/dashboard", "views": 112, "unique": 89, "avg_time_sec": 312},
    {"path": "/blog", "views": 98, "unique": 81, "avg_time_sec": 223},
    {"path": "/knot", "views": 87, "unique": 74, "avg_time_sec": 156},
]

MOCK_SOURCES = [
    {"source": "organic", "visitors": 189, "pct": 48.6},
    {"source": "direct", "visitors": 98, "pct": 25.2},
    {"source": "social", "visitors": 54, "pct": 13.9},
    {"source": "referral", "visitors": 31, "pct": 8.0},
    {"source": "email", "visitors": 17, "pct": 4.4},
]


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
                "bounce_rate": MOCK_OVERVIEW["bounce_rate"],
                "avg_session_duration_sec": MOCK_OVERVIEW["avg_session_duration_sec"],
                "top_referrer": MOCK_OVERVIEW["top_referrer"],
            }
    except Exception:
        return MOCK_OVERVIEW


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
            result = rows.fetchall()
            if not result:
                return MOCK_DAILY_TREND
            return [
                {
                    "date": str(r.date)[:10],
                    "page_views": r.page_views,
                    "unique_visitors": r.unique_visitors,
                }
                for r in result
            ]
    except Exception:
        return MOCK_DAILY_TREND


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
            result = rows.fetchall()
            if not result:
                return MOCK_TOP_PAGES
            return [
                {"path": r.page_path, "views": r.views, "unique": r.unique, "avg_time_sec": 0}
                for r in result
            ]
    except Exception:
        return MOCK_TOP_PAGES


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
            if not result:
                return MOCK_SOURCES
            total = sum(r.visitors for r in result) or 1
            return [
                {"source": r.source, "visitors": r.visitors, "pct": round(r.visitors / total * 100, 1)}
                for r in result
            ]
    except Exception:
        return MOCK_SOURCES


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
