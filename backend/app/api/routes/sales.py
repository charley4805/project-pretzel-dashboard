import datetime
import logging
from typing import Optional

from fastapi import APIRouter, Query
from sqlalchemy import func, select, case, text

from app.models.database import AsyncSessionLocal
from app.models.pretzel import (
    PretzelContract,
    PretzelContractPaymentEvent,
    PretzelUser,
    PretzelUserSubscription,
)

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Tier display mapping ───────────────────────────────────────────────────────
# Maps user_subscriptions.tier → dashboard display label
TIER_DISPLAY: dict[str, str] = {
    "base":              "Solo",
    "diy_monthly":       "Solo",
    "base_pass":         "Solo",
    "pro":               "Pro",
    "power":             "Team",
    "power_unlimited":   "Team",
    "power_pass":        "Team",
    "group_base":        "Group",
    "group":             "Group",
    "group_power":       "Group",
}

# Monthly price per tier (USD). Used for MRR calculation.
TIER_MONTHLY_PRICE: dict[str, float] = {
    "base":              0,
    "diy_monthly":       0,
    "base_pass":         0,
    "pro":               19,
    "power":             49,
    "power_unlimited":   89,
    "power_pass":        49,
    "group_base":        89,
    "group":             199,
    "group_power":       199,
}

ACTIVE_STATUSES = ("active", "trialing")

# ── Contract pipeline stage mapping ───────────────────────────────────────────
# Maps contracts.status → ordered pipeline stage
CONTRACT_STAGES = ["draft", "sent", "active", "signed", "completed"]
STAGE_LABELS = {
    "draft":     "Draft",
    "sent":      "Sent",
    "active":    "Negotiating",
    "signed":    "Signed",
    "completed": "Paid",
}


def _month_start() -> datetime.datetime:
    now = datetime.datetime.utcnow()
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

def _prev_month_start() -> datetime.datetime:
    ms = _month_start()
    return (ms - datetime.timedelta(days=1)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)


@router.get("/overview")
async def get_sales_overview():
    try:
        async with AsyncSessionLocal() as db:
            month_start = _month_start()
            prev_month = _prev_month_start()

            # Active subscriptions
            active_q = await db.execute(
                select(
                    PretzelUserSubscription.tier,
                    func.count().label("cnt"),
                )
                .where(PretzelUserSubscription.status.in_(ACTIVE_STATUSES))
                .group_by(PretzelUserSubscription.tier)
            )
            tier_counts = {row.tier: row.cnt for row in active_q.fetchall()}

            active_subscriptions = sum(tier_counts.values())
            mrr = sum(
                cnt * TIER_MONTHLY_PRICE.get(tier, 0)
                for tier, cnt in tier_counts.items()
            )
            arr = round(mrr * 12)

            # Active subscriptions last month (for delta)
            active_prev_q = await db.execute(
                select(func.count()).select_from(PretzelUserSubscription)
                .where(
                    PretzelUserSubscription.status.in_(ACTIVE_STATUSES),
                    PretzelUserSubscription.created_at < month_start,
                )
            )
            active_prev = active_prev_q.scalar() or 1
            active_subs_delta = round(
                (active_subscriptions - active_prev) / active_prev * 100, 1
            )

            # MRR last month estimate (tier counts at prev month start are hard to
            # reconstruct without a snapshot table, so we skip the delta for now)
            mrr_delta = 0.0

            # Trial starts that converted to active this month
            trial_conv_q = await db.execute(
                select(func.count()).select_from(PretzelUserSubscription)
                .where(
                    PretzelUserSubscription.status == "active",
                    PretzelUserSubscription.trial_used == True,
                    PretzelUserSubscription.subscription_started_at >= month_start,
                )
            )
            trial_conversions_this_month = trial_conv_q.scalar() or 0

            # Churn rate: cancellations this month / active at month start
            churn_q = await db.execute(
                select(func.count()).select_from(PretzelUserSubscription)
                .where(
                    PretzelUserSubscription.status == "canceled",
                    PretzelUserSubscription.updated_at >= month_start,
                )
            )
            churned = churn_q.scalar() or 0
            churn_rate = round(churned / max(active_prev, 1) * 100, 2)

            arpu = round(mrr / active_subscriptions, 2) if active_subscriptions else 0.0

        return {
            "mrr": mrr,
            "mrr_delta": mrr_delta,
            "arr": arr,
            "arr_delta": mrr_delta,
            "active_subscriptions": active_subscriptions,
            "active_subs_delta": active_subs_delta,
            "trial_conversions_this_month": trial_conversions_this_month,
            "trial_conv_delta": 0.0,
            "churn_rate": churn_rate,
            "churn_delta": 0.0,
            "avg_revenue_per_user": arpu,
        }
    except Exception:
        logger.exception("sales overview query failed")
        return {
            "mrr": 0, "mrr_delta": 0, "arr": 0, "arr_delta": 0,
            "active_subscriptions": 0, "active_subs_delta": 0,
            "trial_conversions_this_month": 0, "trial_conv_delta": 0,
            "churn_rate": 0, "churn_delta": 0, "avg_revenue_per_user": 0,
        }


@router.get("/revenue")
async def get_revenue_chart():
    try:
        async with AsyncSessionLocal() as db:
            six_months_ago = datetime.datetime.utcnow() - datetime.timedelta(days=180)
            rows = await db.execute(
                select(
                    func.date_trunc("month", PretzelContractPaymentEvent.created_at).label("month"),
                    func.sum(PretzelContractPaymentEvent.amount).label("total"),
                )
                .where(
                    PretzelContractPaymentEvent.event_type == "funding_succeeded",
                    PretzelContractPaymentEvent.status == "succeeded",
                    PretzelContractPaymentEvent.created_at >= six_months_ago,
                )
                .group_by("month")
                .order_by("month")
            )
            monthly = [
                {
                    "month": str(r.month)[:7],
                    "pretzel": float(r.total or 0),
                    "knot": 0,  # populated from Knot API if available
                }
                for r in rows.fetchall()
            ]
        return {"monthly": monthly}
    except Exception:
        logger.exception("revenue chart query failed")
        return {"monthly": []}


@router.get("/subscriptions")
async def get_subscription_tiers():
    try:
        async with AsyncSessionLocal() as db:
            rows = await db.execute(
                select(
                    PretzelUserSubscription.tier,
                    func.count().label("count"),
                )
                .where(PretzelUserSubscription.status.in_(ACTIVE_STATUSES))
                .group_by(PretzelUserSubscription.tier)
                .order_by(func.count().desc())
            )
            raw = rows.fetchall()

            # Aggregate by display label
            aggregated: dict[str, dict] = {}
            for row in raw:
                label = TIER_DISPLAY.get(row.tier, row.tier.capitalize())
                price = TIER_MONTHLY_PRICE.get(row.tier, 0)
                if label not in aggregated:
                    aggregated[label] = {"tier": label, "count": 0, "mrr": 0}
                aggregated[label]["count"] += row.count
                aggregated[label]["mrr"] += row.count * price

            tiers = list(aggregated.values())

        return {"tiers": tiers}
    except Exception:
        logger.exception("subscriptions query failed")
        return {"tiers": []}


@router.get("/transactions")
async def get_recent_transactions(limit: int = Query(10)):
    try:
        async with AsyncSessionLocal() as db:
            rows = await db.execute(
                select(
                    PretzelContractPaymentEvent.id,
                    PretzelContractPaymentEvent.contract_id,
                    PretzelContractPaymentEvent.event_type,
                    PretzelContractPaymentEvent.status,
                    PretzelContractPaymentEvent.amount,
                    PretzelContractPaymentEvent.created_at,
                    PretzelContract.title,
                )
                .join(PretzelContract, PretzelContract.id == PretzelContractPaymentEvent.contract_id)
                .where(
                    PretzelContractPaymentEvent.event_type.in_(
                        ["funding_succeeded", "funding_failed", "refund_created"]
                    )
                )
                .order_by(PretzelContractPaymentEvent.created_at.desc())
                .limit(limit)
            )
            txs = rows.fetchall()

            def _tx_status(event_type: str, status: str) -> str:
                if event_type == "refund_created":
                    return "refunded"
                if status == "succeeded":
                    return "paid"
                if status == "failed":
                    return "failed"
                return status

            return {
                "transactions": [
                    {
                        "id": str(tx.id),
                        "user": tx.title or "Unknown",
                        "plan": "—",
                        "amount": float(tx.amount or 0),
                        "status": _tx_status(tx.event_type, tx.status),
                        "date": _fmt_dt(tx.created_at),
                        "source": "pretzel",
                    }
                    for tx in txs
                ]
            }
    except Exception:
        logger.exception("transactions query failed")
        return {"transactions": []}


@router.get("/pipeline")
async def get_contract_pipeline():
    try:
        async with AsyncSessionLocal() as db:
            rows = await db.execute(
                select(
                    PretzelContract.status,
                    func.count().label("count"),
                    func.coalesce(func.sum(PretzelContract.total_amount), 0).label("value"),
                )
                .group_by(PretzelContract.status)
            )
            by_status = {row.status: row for row in rows.fetchall()}

            stages = []
            for status in CONTRACT_STAGES:
                row = by_status.get(status)
                stages.append({
                    "stage": STAGE_LABELS.get(status, status.capitalize()),
                    "count": row.count if row else 0,
                    "value": int(row.value) if row else 0,
                })

        return {"stages": stages}
    except Exception:
        logger.exception("pipeline query failed")
        return {"stages": []}


@router.get("/knot-billing")
async def get_knot_billing_events(limit: int = Query(20)):
    import os
    import httpx

    knot_url = os.getenv("KNOT_API_URL", "")
    if knot_url:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(f"{knot_url}/api/admin/billing/recent?limit={limit}")
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            logger.exception("knot billing fetch failed")
    return {"events": []}


# ── Utilities ──────────────────────────────────────────────────────────────────

def _fmt_dt(dt: datetime.datetime) -> str:
    if dt is None:
        return "—"
    dt = dt.replace(tzinfo=None)
    now = datetime.datetime.utcnow()
    diff = now - dt
    if diff.days == 0:
        return f"Today, {dt.strftime('%-I:%M %p')}"
    if diff.days == 1:
        return f"Yesterday, {dt.strftime('%-I:%M %p')}"
    return dt.strftime("%b %d, %Y")
