"""Admin analytics aggregation from real platform data."""

from __future__ import annotations

from calendar import month_abbr
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import desc, extract, func, or_, select
from sqlalchemy.orm import Session

from app.admin.schemas import (
    AdminAnalyticsActivityItem,
    AdminAnalyticsCountItem,
    AdminAnalyticsMetrics,
    AdminAnalyticsResponse,
    AdminAnalyticsTrendPoint,
)
from app.common.enums import CheckoutStatus, PaymentStatus
from app.core.config import settings
from app.models.checkout_session import CheckoutSession
from app.models.experience import Experience
from app.models.payment import Payment
from app.models.published_experience import PublishedExperience

_SUCCESS_PAYMENT = {PaymentStatus.SUCCESS, PaymentStatus.PAID}
_COMPLETED_CHECKOUT = {CheckoutStatus.COMPLETED}

TREND_DAYS = 30
MONTHLY_MONTHS = 12


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _day_start(value: datetime) -> datetime:
    return value.astimezone(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)


def _normalize_label(value: str | None) -> str:
    return (value or "").strip().lower()


def _month_label(year: int, month: int) -> str:
    return f"{month_abbr[month]} {year}"


def _build_day_series(
    start: datetime,
    end: datetime,
    rows: list[tuple[date, Decimal | int]],
) -> list[AdminAnalyticsTrendPoint]:
    values = {row[0]: row[1] for row in rows}
    points: list[AdminAnalyticsTrendPoint] = []
    cursor = _day_start(start)
    while cursor < end:
        day = cursor.date()
        raw = values.get(day, 0)
        points.append(
            AdminAnalyticsTrendPoint(
                label=day.isoformat(),
                value=Decimal(raw) if isinstance(raw, Decimal) else int(raw),
            )
        )
        cursor += timedelta(days=1)
    return points


class AdminAnalyticsService:
    def get_analytics(self, db: Session) -> AdminAnalyticsResponse:
        if not settings.DATABASE_URL.strip():
            return AdminAnalyticsResponse(available=False, message="No analytics available.")

        try:
            metrics = self._load_metrics(db)
            has_data = (
                metrics.orders > 0
                or metrics.revenue > 0
                or metrics.customers > 0
                or metrics.experiences > 0
            )
            if not has_data:
                return AdminAnalyticsResponse(available=False, message="No analytics available.")

            end = _day_start(_utc_now()) + timedelta(days=1)
            start = end - timedelta(days=TREND_DAYS)

            revenue_trend = self._load_revenue_trend(db, start, end)
            orders_trend = self._load_orders_trend(db, start, end)
            daily_purchases = self._load_daily_purchases(db, start, end)
            monthly_revenue = self._load_monthly_revenue(db)
            popular_occasions = self._load_popular_occasions(db)
            popular_templates = self._load_popular_templates(db)
            top_occasions = self._load_top_occasions(db, popular_occasions)
            top_templates = popular_templates[:6]
            recent_activity = self._load_recent_activity(db)

            return AdminAnalyticsResponse(
                available=True,
                metrics=metrics,
                revenue_trend=revenue_trend,
                orders_trend=orders_trend,
                daily_purchases=daily_purchases,
                monthly_revenue=monthly_revenue,
                popular_occasions=popular_occasions,
                popular_templates=popular_templates,
                top_occasions=top_occasions,
                top_templates=top_templates,
                recent_activity=recent_activity,
            )
        except Exception:
            return AdminAnalyticsResponse(available=False, message="No analytics available.")

    def _load_metrics(self, db: Session) -> AdminAnalyticsMetrics:
        revenue = db.scalar(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status.in_(_SUCCESS_PAYMENT))
        ) or Decimal("0.00")

        orders = db.scalar(select(func.count()).select_from(CheckoutSession)) or 0
        customers = db.scalar(
            select(func.count(func.distinct(CheckoutSession.email))).select_from(CheckoutSession)
        ) or 0
        experiences = db.scalar(
            select(func.count())
            .select_from(PublishedExperience)
            .where(PublishedExperience.is_active.is_(True))
        ) or 0

        currency = db.scalar(
            select(Payment.currency)
            .where(Payment.status.in_(_SUCCESS_PAYMENT))
            .order_by(desc(Payment.created_at))
            .limit(1)
        ) or "INR"

        return AdminAnalyticsMetrics(
            revenue=Decimal(revenue),
            orders=int(orders),
            customers=int(customers),
            experiences=int(experiences),
            conversion_rate=None,
            currency=currency,
        )

    def _paid_checkout_filter(self):
        return or_(
            CheckoutSession.status.in_(_COMPLETED_CHECKOUT),
            Payment.status.in_(_SUCCESS_PAYMENT),
        )

    def _load_revenue_trend(
        self,
        db: Session,
        start: datetime,
        end: datetime,
    ) -> list[AdminAnalyticsTrendPoint]:
        rows = db.execute(
            select(
                func.date(Payment.created_at).label("day"),
                func.coalesce(func.sum(Payment.amount), 0).label("total"),
            )
            .where(
                Payment.status.in_(_SUCCESS_PAYMENT),
                Payment.created_at >= start,
                Payment.created_at < end,
            )
            .group_by(func.date(Payment.created_at))
            .order_by(func.date(Payment.created_at))
        ).all()
        parsed = [(row.day, Decimal(row.total)) for row in rows if row.day is not None]
        return _build_day_series(start, end, parsed)

    def _load_orders_trend(
        self,
        db: Session,
        start: datetime,
        end: datetime,
    ) -> list[AdminAnalyticsTrendPoint]:
        rows = db.execute(
            select(
                func.date(CheckoutSession.created_at).label("day"),
                func.count().label("total"),
            )
            .where(
                CheckoutSession.created_at >= start,
                CheckoutSession.created_at < end,
            )
            .group_by(func.date(CheckoutSession.created_at))
            .order_by(func.date(CheckoutSession.created_at))
        ).all()
        parsed = [(row.day, int(row.total)) for row in rows if row.day is not None]
        return _build_day_series(start, end, parsed)

    def _load_daily_purchases(
        self,
        db: Session,
        start: datetime,
        end: datetime,
    ) -> list[AdminAnalyticsTrendPoint]:
        rows = db.execute(
            select(
                func.date(Payment.created_at).label("day"),
                func.count().label("total"),
            )
            .where(
                Payment.status.in_(_SUCCESS_PAYMENT),
                Payment.created_at >= start,
                Payment.created_at < end,
            )
            .group_by(func.date(Payment.created_at))
            .order_by(func.date(Payment.created_at))
        ).all()
        parsed = [(row.day, int(row.total)) for row in rows if row.day is not None]
        return _build_day_series(start, end, parsed)

    def _load_monthly_revenue(self, db: Session) -> list[AdminAnalyticsTrendPoint]:
        now = _utc_now()
        month_starts: list[tuple[int, int]] = []
        cursor = date(now.year, now.month, 1)
        for _ in range(MONTHLY_MONTHS):
            month_starts.append((cursor.year, cursor.month))
            if cursor.month == 1:
                cursor = date(cursor.year - 1, 12, 1)
            else:
                cursor = date(cursor.year, cursor.month - 1, 1)
        month_starts.reverse()

        earliest = datetime(month_starts[0][0], month_starts[0][1], 1, tzinfo=timezone.utc)
        rows = db.execute(
            select(
                extract("year", Payment.created_at).label("year"),
                extract("month", Payment.created_at).label("month"),
                func.coalesce(func.sum(Payment.amount), 0).label("total"),
            )
            .where(
                Payment.status.in_(_SUCCESS_PAYMENT),
                Payment.created_at >= earliest,
            )
            .group_by(extract("year", Payment.created_at), extract("month", Payment.created_at))
            .order_by(extract("year", Payment.created_at), extract("month", Payment.created_at))
        ).all()

        totals = {(int(row.year), int(row.month)): Decimal(row.total) for row in rows}
        return [
            AdminAnalyticsTrendPoint(
                label=_month_label(year, month),
                value=totals.get((year, month), Decimal("0.00")),
            )
            for year, month in month_starts
        ]

    def _load_popular_occasions(self, db: Session) -> list[AdminAnalyticsCountItem]:
        occasion_expr = func.coalesce(CheckoutSession.occasion, Experience.occasion)
        rows = db.execute(
            select(
                occasion_expr.label("occasion"),
                func.count().label("total"),
            )
            .select_from(CheckoutSession)
            .join(Experience, Experience.uuid == CheckoutSession.experience_uuid)
            .outerjoin(Payment, Payment.experience_id == Experience.id)
            .where(self._paid_checkout_filter(), occasion_expr.is_not(None), occasion_expr != "")
            .group_by(occasion_expr)
            .order_by(desc(func.count()))
            .limit(8)
        ).all()

        return [
            AdminAnalyticsCountItem(
                key=_normalize_label(row.occasion),
                label=(row.occasion or "Unknown").strip(),
                count=int(row.total),
            )
            for row in rows
            if row.occasion
        ]

    def _load_popular_templates(self, db: Session) -> list[AdminAnalyticsCountItem]:
        template_expr = func.coalesce(CheckoutSession.template_name, Experience.template_name)
        rows = db.execute(
            select(
                template_expr.label("template"),
                func.count().label("total"),
            )
            .select_from(CheckoutSession)
            .join(Experience, Experience.uuid == CheckoutSession.experience_uuid)
            .outerjoin(Payment, Payment.experience_id == Experience.id)
            .where(self._paid_checkout_filter(), template_expr.is_not(None), template_expr != "")
            .group_by(template_expr)
            .order_by(desc(func.count()))
            .limit(8)
        ).all()

        return [
            AdminAnalyticsCountItem(
                key=_normalize_label(row.template),
                label=(row.template or "Unknown").strip(),
                count=int(row.total),
            )
            for row in rows
            if row.template
        ]

    def _load_top_occasions(
        self,
        _db: Session,
        popular: list[AdminAnalyticsCountItem],
    ) -> list[AdminAnalyticsCountItem]:
        canonical = [
            ("Birthday", ("birthday",)),
            ("Anniversary", ("anniversary",)),
            ("Proposal", ("proposal",)),
            ("Wedding", ("wedding",)),
            ("Graduation", ("graduation",)),
            ("Baby Shower", ("baby shower", "baby-shower", "babyshower")),
        ]
        results: list[AdminAnalyticsCountItem] = []
        for label, aliases in canonical:
            count = 0
            for item in popular:
                key = _normalize_label(item.key)
                if any(alias == key or alias in key for alias in aliases):
                    count += item.count
            results.append(
                AdminAnalyticsCountItem(
                    key=label.lower().replace(" ", "-"),
                    label=label,
                    count=count,
                )
            )
        return results

    def _load_recent_activity(self, db: Session) -> list[AdminAnalyticsActivityItem]:
        activity: list[AdminAnalyticsActivityItem] = []

        payment_rows = db.execute(
            select(Payment, Experience, CheckoutSession)
            .join(Experience, Experience.id == Payment.experience_id)
            .outerjoin(CheckoutSession, CheckoutSession.experience_uuid == Experience.uuid)
            .where(Payment.status.in_(_SUCCESS_PAYMENT))
            .order_by(desc(Payment.created_at))
            .limit(6)
        ).all()
        for payment, experience, checkout in payment_rows:
            customer = checkout.customer_name if checkout else experience.customer_name
            activity.append(
                AdminAnalyticsActivityItem(
                    id=f"payment-{payment.id}",
                    type="payment_completed",
                    title="Payment Completed",
                    subtitle=f"{customer or 'Customer'} · {payment.currency} {payment.amount}",
                    occurred_at=payment.created_at,
                )
            )

        experience_rows = db.execute(
            select(PublishedExperience, Experience)
            .join(Experience, Experience.id == PublishedExperience.experience_id)
            .order_by(desc(PublishedExperience.created_at))
            .limit(6)
        ).all()
        for published, experience in experience_rows:
            name = experience.title or experience.template_name or "Experience"
            activity.append(
                AdminAnalyticsActivityItem(
                    id=f"experience-{published.id}",
                    type="experience_generated",
                    title="Experience Generated",
                    subtitle=f"{name} · {experience.customer_name or 'Customer'}",
                    occurred_at=published.created_at,
                )
            )

        checkout_rows = db.execute(
            select(CheckoutSession, Experience, Payment)
            .join(Experience, Experience.uuid == CheckoutSession.experience_uuid)
            .outerjoin(Payment, Payment.experience_id == Experience.id)
            .where(
                or_(
                    CheckoutSession.status.in_(_COMPLETED_CHECKOUT),
                    Payment.status.in_(_SUCCESS_PAYMENT),
                )
            )
            .order_by(desc(CheckoutSession.created_at))
            .limit(6)
        ).all()
        for checkout, experience, _payment in checkout_rows:
            activity.append(
                AdminAnalyticsActivityItem(
                    id=f"purchase-{checkout.uuid}",
                    type="customer_purchased",
                    title="Customer Purchased",
                    subtitle=f"{checkout.customer_name} · {checkout.template_name or experience.template_name or 'Experience'}",
                    occurred_at=checkout.created_at,
                )
            )

        activity.sort(key=lambda item: item.occurred_at, reverse=True)
        return activity[:12]


admin_analytics_service = AdminAnalyticsService()
