from fastapi import APIRouter
from sqlalchemy import select, func, text
from app.models.database import AsyncSessionLocal
from app.models.analytics_events import AnalyticsEvent
import datetime
import os
import httpx

router = APIRouter()


def _knot_headers() -> dict:
    secret = os.getenv("KNOT_ANALYTICS_SECRET", "")
    return {"X-Dashboard-Secret": secret} if secret else {}


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

        knot_url = os.getenv("KNOT_API_URL", "")
        knot: dict = {}
        knot_connected = False
        if knot_url:
            try:
                async with httpx.AsyncClient(timeout=5) as client:
                    r = await client.get(
                        f"{knot_url}/api/analytics/overview",
                        headers=_knot_headers(),
                    )
                    if r.status_code == 200:
                        knot = r.json()
                        knot_connected = True
            except Exception:
                pass

        return {
            "page_views_today": page_views_today + knot.get("page_views_today", 0),
            "unique_visitors_today": unique_visitors_today + knot.get("unique_visitors_today", 0),
            "active_now": active_now + knot.get("active_now", 0),
            "bounce_rate": None,
            "avg_session_duration_sec": None,
            "top_referrer": None,
            "disconnected": False,
            "pretzel_page_views_today": page_views_today,
            "pretzel_unique_visitors_today": unique_visitors_today,
            "knot_page_views_today": knot.get("page_views_today", 0),
            "knot_unique_visitors_today": knot.get("unique_visitors_today", 0),
            "knot_active_now": knot.get("active_now", 0),
            "knot_connected": knot_connected,
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
            pretzel_by_date = {
                str(r.date)[:10]: {"page_views": r.page_views, "unique_visitors": r.unique_visitors}
                for r in rows.fetchall()
            }

        knot_url = os.getenv("KNOT_API_URL", "")
        knot_by_date: dict = {}
        if knot_url:
            try:
                async with httpx.AsyncClient(timeout=5) as client:
                    r = await client.get(
                        f"{knot_url}/api/analytics/daily-trend",
                        headers=_knot_headers(),
                    )
                    if r.status_code == 200:
                        for row in r.json():
                            knot_by_date[row["date"]] = row
            except Exception:
                pass

        all_dates = sorted(set(list(pretzel_by_date.keys()) + list(knot_by_date.keys())))
        merged = []
        for date in all_dates:
            p = pretzel_by_date.get(date, {})
            k = knot_by_date.get(date, {})
            merged.append({
                "date": date,
                "page_views": p.get("page_views", 0) + k.get("page_views", 0),
                "unique_visitors": p.get("unique_visitors", 0) + k.get("unique_visitors", 0),
                "knot_page_views": k.get("page_views", 0),
                "knot_unique_visitors": k.get("unique_visitors", 0),
            })
        return merged
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
            pretzel_pages = {
                r.page_path: {"path": r.page_path, "views": r.views, "unique": r.unique, "avg_time_sec": 0}
                for r in rows.fetchall()
            }

        knot_url = os.getenv("KNOT_API_URL", "")
        knot_pages: dict = {}
        if knot_url:
            try:
                async with httpx.AsyncClient(timeout=5) as client:
                    r = await client.get(
                        f"{knot_url}/api/analytics/top-pages",
                        headers=_knot_headers(),
                    )
                    if r.status_code == 200:
                        knot_pages = {row["path"]: row for row in r.json()}
            except Exception:
                pass

        combined: dict = {}
        for path, p in pretzel_pages.items():
            if path in knot_pages:
                k = knot_pages.pop(path)
                combined[path] = {
                    "path": path,
                    "views": p["views"] + k["views"],
                    "unique": p["unique"] + k["unique"],
                    "avg_time_sec": 0,
                    "source": "both",
                }
            else:
                combined[path] = {**p, "source": "pretzel"}

        for path, k in knot_pages.items():
            combined[path] = {
                "path": path,
                "views": k["views"],
                "unique": k["unique"],
                "avg_time_sec": 0,
                "source": "knot",
            }

        return sorted(combined.values(), key=lambda x: -x["views"])[:10]
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
