from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()


@router.get("/overview")
def get_sales_overview():
    """Revenue KPIs: MRR, ARR, active subscriptions, churn, ARPU.
    Sources:
      - project-pretzel: user_subscriptions (Stripe sync), contract_payments
      - PretzelKnot:     UserSubscription entity, BillingEvent entity
    Production query:
      MRR = SUM of active subscription monthly amounts across both platforms
      Churn = (cancelled_this_month / start_of_month_active) * 100
    """
    return {
        "mrr": 84200,
        "mrr_delta": 3.8,
        "arr": 1010400,
        "arr_delta": 3.8,
        "active_subscriptions": 1842,
        "active_subs_delta": 2.1,
        "trial_conversions_this_month": 142,
        "trial_conv_delta": 8.4,
        "churn_rate": 1.8,
        "churn_delta": -0.2,
        "avg_revenue_per_user": 45.7,
    }


@router.get("/revenue")
def get_revenue_chart():
    """Monthly revenue timeseries split by platform.
    Sources:
      - pretzel: SUM(contract_payments.amount) + SUM(subscription monthly value)
      - knot:    SUM(BillingEvent.Amount WHERE EventType='payment_succeeded')
    """
    return {
        "monthly": [
            {"month": "Oct", "pretzel": 68000, "knot": 8200},
            {"month": "Nov", "pretzel": 71000, "knot": 9100},
            {"month": "Dec", "pretzel": 74000, "knot": 9800},
            {"month": "Jan", "pretzel": 76500, "knot": 10200},
            {"month": "Feb", "pretzel": 80000, "knot": 10900},
            {"month": "Mar", "pretzel": 84200, "knot": 11400},
        ]
    }


@router.get("/subscriptions")
def get_subscription_tiers():
    """Subscriber count and MRR contribution by plan tier.
    Sources:
      - project-pretzel: user_subscriptions.subscription_tier GROUP BY tier
      - PretzelKnot:     UserSubscription joined with SubscriptionPlan
    """
    return {
        "tiers": [
            {"tier": "Solo", "count": 820, "mrr": 16400},
            {"tier": "Pro", "count": 620, "mrr": 31000},
            {"tier": "Team", "count": 280, "mrr": 25200},
            {"tier": "Enterprise", "count": 42, "mrr": 8400},
            {"tier": "Group", "count": 80, "mrr": 3200},
        ]
    }


@router.get("/transactions")
def get_recent_transactions(limit: int = Query(10)):
    """Recent payment transactions across both platforms.
    Sources:
      - project-pretzel: contract_payments + stripe webhook events
      - PretzelKnot:     BillingEvent WHERE EventType IN ('payment_succeeded','payment_failed')
    """
    return {
        "transactions": [
            {"id": "inv_001", "user": "Apex Construction LLC", "plan": "Pro", "amount": 49, "status": "paid", "date": "Today, 2:14 PM", "source": "pretzel"},
            {"id": "inv_002", "user": "Mike T. Electrical", "plan": "Solo", "amount": 19, "status": "paid", "date": "Today, 1:55 PM", "source": "knot"},
            {"id": "inv_003", "user": "Summit Builds", "plan": "Team", "amount": 89, "status": "paid", "date": "Today, 1:30 PM", "source": "pretzel"},
            {"id": "inv_004", "user": "R&L Plumbing", "plan": "Pro", "amount": 49, "status": "failed", "date": "Today, 12:10 PM", "source": "knot"},
            {"id": "inv_005", "user": "Blue Ridge Roofing", "plan": "Enterprise", "amount": 199, "status": "paid", "date": "Today, 11:48 AM", "source": "pretzel"},
            {"id": "inv_006", "user": "Cornerstone GC", "plan": "Team", "amount": 89, "status": "refunded", "date": "Today, 10:20 AM", "source": "pretzel"},
        ][:limit]
    }


@router.get("/pipeline")
def get_contract_pipeline():
    """Contract pipeline stage breakdown.
    Source: project-pretzel contracts table — status field + contract_payments.
    Stages: Draft -> Sent -> Negotiating -> Signed -> Paid
    """
    return {
        "stages": [
            {"stage": "Draft", "count": 340, "value": 2800000},
            {"stage": "Sent", "count": 218, "value": 1920000},
            {"stage": "Negotiating", "count": 87, "value": 890000},
            {"stage": "Signed", "count": 145, "value": 1340000},
            {"stage": "Paid", "count": 267, "value": 2100000},
        ]
    }


@router.get("/knot-billing")
def get_knot_billing_events(limit: int = Query(20)):
    """PretzelKnot billing events from Stripe webhook sync.
    Source: PretzelKnot BillingEvent entity
      Fields: EventType, Amount, Currency, UserId, SubscriptionId, CreatedAt
    """
    return {
        "events": [
            {"id": "ke_001", "type": "subscription.activated", "user": "TestCo LLC", "tier": "Pro", "amount": 49, "date": "Today, 2:10 PM"},
            {"id": "ke_002", "type": "subscription.renewed", "user": "Mountain Electric", "tier": "Solo", "amount": 19, "date": "Today, 1:40 PM"},
            {"id": "ke_003", "type": "payment.failed", "user": "Riverside GC", "tier": "Team", "amount": 89, "date": "Yesterday, 6:30 PM"},
            {"id": "ke_004", "type": "subscription.cancelled", "user": "Lakeside Builders", "tier": "Pro", "amount": 0, "date": "Yesterday, 3:15 PM"},
        ][:limit]
    }
