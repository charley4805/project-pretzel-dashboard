import datetime
import logging
from typing import Optional

from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.models.analytics_events import AnalyticsEvent
from app.models.database import AsyncSessionLocal
from app.models.pretzel import PretzelUser, PretzelUserSubscription

router = APIRouter()
logger = logging.getLogger(__name__)


def _today_start() -> datetime.datetime:
    return datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

def _yesterday_start() -> datetime.datetime:
    return _today_start() - datetime.timedelta(days=1)


@router.get("/overview")
async def get_marketing_overview(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    try:
        today = _today_start()
        yesterday = _yesterday_start()

        async with AsyncSessionLocal() as db:
            # New signups today
            signups_today_q = await db.execute(
                select(func.count()).select_from(PretzelUser)
                .where(PretzelUser.created_at >= today)
            )
            new_signups_today = signups_today_q.scalar() or 0

            # New signups yesterday (for delta)
            signups_yesterday_q = await db.execute(
                select(func.count()).select_from(PretzelUser)
                .where(PretzelUser.created_at >= yesterday, PretzelUser.created_at < today)
            )
            new_signups_yesterday = signups_yesterday_q.scalar() or 1
            new_signups_delta = round(
                (new_signups_today - new_signups_yesterday) / new_signups_yesterday * 100, 1
            )

            # Visitors today — distinct sessions
            visitors_q = await db.execute(
                select(func.count(func.distinct(AnalyticsEvent.session_id)))
                .where(AnalyticsEvent.created_at >= today)
            )
            visitors_today = visitors_q.scalar() or 0

            # Visitors yesterday (for delta)
            visitors_yesterday_q = await db.execute(
                select(func.count(func.distinct(AnalyticsEvent.session_id)))
                .where(AnalyticsEvent.created_at >= yesterday, AnalyticsEvent.created_at < today)
            )
            visitors_yesterday = visitors_yesterday_q.scalar() or 1
            visitors_delta = round(
                (visitors_today - visitors_yesterday) / visitors_yesterday * 100, 1
            )

            # Trial starts today
            trials_q = await db.execute(
                select(func.count()).select_from(PretzelUserSubscription)
                .where(
                    PretzelUserSubscription.status == "trialing",
                    PretzelUserSubscription.created_at >= today,
                )
            )
            trial_starts_today = trials_q.scalar() or 0

            # Trials yesterday (for delta)
            trials_yesterday_q = await db.execute(
                select(func.count()).select_from(PretzelUserSubscription)
                .where(
                    PretzelUserSubscription.status == "trialing",
                    PretzelUserSubscription.created_at >= yesterday,
                    PretzelUserSubscription.created_at < today,
                )
            )
            trials_yesterday = trials_yesterday_q.scalar() or 1
            trial_delta = round(
                (trial_starts_today - trials_yesterday) / trials_yesterday * 100, 1
            )

            # Conversion rate: signups / visitors
            conversion_rate = round(
                new_signups_today / visitors_today * 100, 2
            ) if visitors_today else 0.0

            conversion_yesterday = round(
                new_signups_yesterday / visitors_yesterday * 100, 2
            ) if visitors_yesterday else 0.0
            conversion_delta = round(conversion_rate - conversion_yesterday, 2)

        return {
            "new_signups_today": new_signups_today,
            "new_signups_delta": new_signups_delta,
            "conversion_rate": conversion_rate,
            "conversion_delta": conversion_delta,
            "visitors_today": visitors_today,
            "visitors_delta": visitors_delta,
            "trial_starts_today": trial_starts_today,
            "trial_delta": trial_delta,
        }
    except Exception:
        logger.exception("marketing overview query failed")
        return {
            "new_signups_today": 0, "new_signups_delta": 0,
            "conversion_rate": 0, "conversion_delta": 0,
            "visitors_today": 0, "visitors_delta": 0,
            "trial_starts_today": 0, "trial_delta": 0,
        }


@router.get("/funnel")
async def get_funnel(source_app: Optional[str] = Query("all")):
    try:
        async with AsyncSessionLocal() as db:
            # Visitors — all-time distinct sessions
            visitors_q = await db.execute(
                select(func.count(func.distinct(AnalyticsEvent.session_id)))
            )
            visitors = visitors_q.scalar() or 0

            # Signups — total users
            signups_q = await db.execute(select(func.count()).select_from(PretzelUser))
            signups = signups_q.scalar() or 0

            # Profile created — users with full_name
            profiles_q = await db.execute(
                select(func.count()).select_from(PretzelUser)
                .where(PretzelUser.full_name.isnot(None))
            )
            profiles = profiles_q.scalar() or 0

            # Active (DAU) — distinct sessions today
            today = _today_start()
            dau_q = await db.execute(
                select(func.count(func.distinct(AnalyticsEvent.session_id)))
                .where(AnalyticsEvent.created_at >= today)
            )
            dau = dau_q.scalar() or 0

            # Active subscriptions as proxy for "onboarding complete"
            onboarding_q = await db.execute(
                select(func.count()).select_from(PretzelUserSubscription)
                .where(PretzelUserSubscription.status.in_(("active", "trialing")))
            )
            onboarding = onboarding_q.scalar() or 0

        return {
            "funnel": [
                {"stage": "Visitors",        "count": visitors},
                {"stage": "Signups",         "count": signups},
                {"stage": "Onboarding",      "count": onboarding},
                {"stage": "Profile Created", "count": profiles},
                {"stage": "Active (DAU)",    "count": dau},
            ]
        }
    except Exception:
        logger.exception("funnel query failed")
        return {"funnel": []}


@router.get("/acquisition")
async def get_acquisition_sources():
    try:
        async with AsyncSessionLocal() as db:
            from sqlalchemy import text as sa_text
            today = _today_start()
            rows = await db.execute(
                sa_text("""
                    SELECT
                        COALESCE(metadata->>'utm_source', 'direct') AS source,
                        COUNT(*) AS cnt
                    FROM analytics_events
                    WHERE created_at >= :start
                    GROUP BY 1
                    ORDER BY 2 DESC
                    LIMIT 8
                """),
                {"start": today},
            )
            result = rows.fetchall()
            total = sum(r.cnt for r in result) or 1
            return {
                "sources": [
                    {
                        "source": r.source.capitalize(),
                        "value": round(r.cnt / total * 100),
                    }
                    for r in result
                ]
            }
    except Exception:
        logger.exception("acquisition sources query failed")
        return {"sources": []}


@router.get("/trends")
async def get_signup_trends():
    try:
        async with AsyncSessionLocal() as db:
            seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
            rows = await db.execute(
                select(
                    func.date_trunc("day", PretzelUser.created_at).label("day"),
                    func.count().label("signups"),
                )
                .where(PretzelUser.created_at >= seven_days_ago)
                .group_by("day")
                .order_by("day")
            )
            daily = rows.fetchall()

            DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            weekly = [
                {
                    "day": DOW[r.day.weekday()],
                    "signups": r.signups,
                    "knot": 0,  # populated from Knot API when available
                }
                for r in daily
            ]
        return {"weekly": weekly}
    except Exception:
        logger.exception("signup trends query failed")
        return {"weekly": []}


@router.get("/search-terms")
async def get_top_search_terms(limit: int = Query(10)):
    """Top search terms from PretzelKnot directory search log."""
    import os
    import httpx

    knot_url = os.getenv("KNOT_API_URL", "")
    if knot_url:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(
                    f"{knot_url}/api/admin/search-terms?limit={limit}"
                )
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            logger.exception("knot search terms fetch failed")
    return {"terms": []}


@router.get("/campaigns")
async def get_campaigns():
    """
    Campaign performance from external ad platforms.
    TODO: integrate Google Ads API + Meta Marketing API.
    """
    return {"campaigns": []}
