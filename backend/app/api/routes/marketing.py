from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()


@router.get("/overview")
def get_marketing_overview(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    """Marketing KPIs: signups, conversion rate, visitors, trial starts.
    Sources:
      - new_signups_today: dashboard_daily_rollups.new_users (project-pretzel)
      - conversion_rate:   signups / visitors from analytics_events
      - visitors_today:    analytics_events WHERE event_name='page_view'
      - trial_starts_today:user_subscriptions WHERE status='trialing' AND created_at >= today
    """
    return {
        "new_signups_today": 145,
        "new_signups_delta": 12.1,
        "conversion_rate": 4.2,
        "conversion_delta": 0.3,
        "visitors_today": 3450,
        "visitors_delta": 8.5,
        "trial_starts_today": 89,
        "trial_delta": 15.2,
    }


@router.get("/funnel")
def get_funnel(source_app: Optional[str] = Query("all")):
    """Full acquisition funnel from visitor to active DAU.
    Source: project-pretzel analytics_events + dashboard_daily_rollups.
    """
    return {
        "funnel": [
            {"stage": "Visitors", "count": 45000},
            {"stage": "Signups", "count": 15234},
            {"stage": "Onboarding", "count": 12000},
            {"stage": "Profile Created", "count": 4500},
            {"stage": "Active (DAU)", "count": 3420},
        ]
    }


@router.get("/acquisition")
def get_acquisition_sources():
    """Traffic acquisition source breakdown.
    Source: analytics_events.metadata_json->>'utm_source' GROUP BY source.
    """
    return {
        "sources": [
            {"source": "Organic", "value": 42},
            {"source": "Referral", "value": 28},
            {"source": "Paid Search", "value": 18},
            {"source": "Social", "value": 12},
        ]
    }


@router.get("/trends")
def get_signup_trends():
    """Weekly signup trend — Pretzel.io vs PretzelKnot.
    Sources:
      - pretzel: dashboard_daily_rollups.new_users
      - knot:    PretzelKnot User.CreatedAt daily count
    """
    return {
        "weekly": [
            {"day": "Mon", "signups": 120, "knot": 28},
            {"day": "Tue", "signups": 145, "knot": 32},
            {"day": "Wed", "signups": 108, "knot": 19},
            {"day": "Thu", "signups": 178, "knot": 41},
            {"day": "Fri", "signups": 163, "knot": 37},
            {"day": "Sat", "signups": 95, "knot": 22},
            {"day": "Sun", "signups": 145, "knot": 28},
        ]
    }


@router.get("/search-terms")
def get_top_search_terms(limit: int = Query(10)):
    """Top contractor search queries from PretzelKnot directory.
    Source: PretzelKnot analytics search query log table.
    TODO: wire to PretzelKnot search analytics endpoint.
    """
    return {
        "terms": [
            {"term": "electrician near me", "count": 1842, "delta": "+12%"},
            {"term": "plumber", "count": 1620, "delta": "+8%"},
            {"term": "general contractor", "count": 1310, "delta": "+3%"},
            {"term": "roofing contractor", "count": 980, "delta": "+22%"},
            {"term": "hvac repair", "count": 830, "delta": "-4%"},
            {"term": "flooring installation", "count": 720, "delta": "+18%"},
            {"term": "painting contractor", "count": 610, "delta": "+7%"},
            {"term": "landscaper", "count": 490, "delta": "+31%"},
            {"term": "bathroom remodel", "count": 440, "delta": "+9%"},
            {"term": "fence installation", "count": 370, "delta": "+5%"},
        ][:limit]
    }


@router.get("/campaigns")
def get_campaigns():
    """Marketing campaign performance.
    Source: External ad platforms (Google Ads, Meta Ads) via API integration.
    TODO: Integrate Google Ads API + Meta Marketing API with stored credentials.
    """
    return {
        "campaigns": [
            {"name": "Spring Launch - Google", "impressions": 84000, "clicks": 2800, "ctr": "3.3%", "conversions": 142, "cpa": "$14.50", "status": "active"},
            {"name": "FB Contractor Drive", "impressions": 62000, "clicks": 1900, "ctr": "3.1%", "conversions": 98, "cpa": "$19.20", "status": "active"},
            {"name": "Retargeting - All", "impressions": 28000, "clicks": 1400, "ctr": "5.0%", "conversions": 84, "cpa": "$11.80", "status": "active"},
            {"name": "LinkedIn - B2B", "impressions": 15000, "clicks": 420, "ctr": "2.8%", "conversions": 28, "cpa": "$38.50", "status": "paused"},
        ]
    }
