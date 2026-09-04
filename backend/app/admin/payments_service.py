"""Admin payments list and detail queries."""

from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import String, asc, cast, desc, func, or_, select
from sqlalchemy.orm import Session

from app.admin.experience_helpers import resolve_customer_name, utc_now
from app.admin.payment_view import admin_payment_view
from app.admin.schemas import (
    AdminPaymentDetailResponse,
    AdminPaymentFilterOptions,
    AdminPaymentListItem,
    AdminPaymentListResponse,
    AdminPaymentSummary,
)
from app.common.enums import PaymentStatus
from app.common.exceptions import NotFoundException
from app.core.config import settings
from app.models.checkout_session import CheckoutSession
from app.models.experience import Experience
from app.models.payment import Payment
from app.models.published_experience import PublishedExperience

_SUCCESS = {PaymentStatus.SUCCESS, PaymentStatus.PAID}
_PENDING = {PaymentStatus.CREATED, PaymentStatus.PENDING}
_FAILED = {PaymentStatus.FAILED, PaymentStatus.CANCELLED}
_REFUNDED = {PaymentStatus.REFUNDED}


def _utc_today_bounds() -> tuple[datetime, datetime]:
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    return start, start + timedelta(days=1)


def _base_payment_query():
    return (
        select(Payment, Experience, CheckoutSession, PublishedExperience)
        .join(Experience, Experience.id == Payment.experience_id)
        .outerjoin(CheckoutSession, CheckoutSession.experience_uuid == Experience.uuid)
        .outerjoin(PublishedExperience, PublishedExperience.experience_id == Experience.id)
    )


def _serialize_list_item(
    payment: Payment,
    experience: Experience,
    checkout: CheckoutSession | None,
) -> AdminPaymentListItem:
    normalized_status = admin_payment_view.normalize_status(payment.status)
    order_id = str(checkout.uuid) if checkout else payment.order_id
    return AdminPaymentListItem(
        record_id=str(payment.id),
        payment_id=payment.payment_id,
        order_id=order_id,
        customer=resolve_customer_name(experience, checkout),
        customer_email=experience.customer_email or (checkout.email if checkout else None),
        amount=payment.amount,
        currency=payment.currency,
        payment_method=payment.payment_method,
        status=normalized_status,
        raw_status=payment.status.value,
        gateway=admin_payment_view.normalize_gateway(payment.provider),
        provider=payment.provider,
        experience_id=str(experience.uuid),
        created_at=payment.created_at,
    )


class AdminPaymentsService:
    def list_payments(
        self,
        db: Session,
        *,
        page: int = 1,
        page_size: int = 20,
        q: str | None = None,
        status: str | None = None,
        gateway: str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
        sort: str = "newest",
    ) -> AdminPaymentListResponse:
        page = max(page, 1)
        page_size = min(max(page_size, 1), 100)

        query = _base_payment_query()
        count_query = (
            select(func.count())
            .select_from(Payment)
            .join(Experience, Experience.id == Payment.experience_id)
            .outerjoin(CheckoutSession, CheckoutSession.experience_uuid == Experience.uuid)
        )

        filters = []

        if q and q.strip():
            term = f"%{q.strip()}%"
            filters.append(
                or_(
                    Payment.payment_id.ilike(term),
                    Payment.order_id.ilike(term),
                    cast(CheckoutSession.uuid, String).ilike(term),
                    Experience.customer_name.ilike(term),
                    Experience.customer_email.ilike(term),
                    CheckoutSession.customer_name.ilike(term),
                    CheckoutSession.email.ilike(term),
                )
            )

        status_key = (status or "all").strip().lower()
        if status_key == "success":
            filters.append(Payment.status.in_(_SUCCESS))
        elif status_key == "pending":
            filters.append(Payment.status.in_(_PENDING))
        elif status_key == "failed":
            filters.append(Payment.status.in_(_FAILED))
        elif status_key == "refunded":
            filters.append(Payment.status.in_(_REFUNDED))

        if gateway and gateway.strip().lower() not in {"", "all"}:
            filters.append(func.lower(Payment.provider) == gateway.strip().lower())

        if date_from is not None:
            filters.append(Payment.created_at >= date_from)
        if date_to is not None:
            filters.append(Payment.created_at <= date_to)

        for clause in filters:
            query = query.where(clause)
            count_query = count_query.where(clause)

        sort_key = (sort or "newest").strip().lower()
        if sort_key == "oldest":
            query = query.order_by(asc(Payment.created_at))
        elif sort_key == "highest_amount":
            query = query.order_by(desc(Payment.amount), desc(Payment.created_at))
        elif sort_key == "lowest_amount":
            query = query.order_by(asc(Payment.amount), desc(Payment.created_at))
        else:
            query = query.order_by(desc(Payment.created_at))

        total = db.scalar(count_query) or 0
        pages = math.ceil(total / page_size) if total else 0
        offset = (page - 1) * page_size

        rows = db.execute(query.offset(offset).limit(page_size)).all()
        items = [
            _serialize_list_item(payment, experience, checkout)
            for payment, experience, checkout, _published in rows
        ]

        return AdminPaymentListResponse(
            items=items,
            total=int(total),
            page=page,
            page_size=page_size,
            pages=pages,
            summary=self._load_summary(db),
            filter_options=self._load_filter_options(db),
            active_provider=settings.payment_provider,
        )

    def get_payment_detail(self, db: Session, record_id: int) -> AdminPaymentDetailResponse:
        row = db.execute(
            _base_payment_query().where(Payment.id == record_id)
        ).first()

        if not row:
            raise NotFoundException("Payment not found")

        payment, experience, checkout, published = row
        is_published = bool(published and published.is_active and published.public_url)
        normalized_status = admin_payment_view.normalize_status(payment.status)
        order_id = str(checkout.uuid) if checkout else payment.order_id
        experience_name = experience.title or experience.template_name or "Experience"

        return AdminPaymentDetailResponse(
            record_id=str(payment.id),
            payment_id=payment.payment_id,
            order_id=order_id,
            customer=resolve_customer_name(experience, checkout),
            customer_email=experience.customer_email or (checkout.email if checkout else None),
            amount=payment.amount,
            currency=payment.currency,
            payment_method=payment.payment_method,
            status=normalized_status,
            raw_status=payment.status.value,
            gateway=admin_payment_view.normalize_gateway(payment.provider),
            provider=payment.provider,
            transaction_reference=admin_payment_view.transaction_reference(payment),
            failure_reason=payment.failure_reason,
            experience_id=str(experience.uuid),
            experience_name=experience_name,
            experience_url=published.public_url if is_published else None,
            verified_at=payment.verified_at,
            created_at=payment.created_at,
        )

    def _load_summary(self, db: Session) -> AdminPaymentSummary:
        today_start, today_end = _utc_today_bounds()

        total_revenue = db.scalar(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status.in_(_SUCCESS))
        ) or Decimal("0.00")

        todays_revenue = db.scalar(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                Payment.status.in_(_SUCCESS),
                Payment.created_at >= today_start,
                Payment.created_at < today_end,
            )
        ) or Decimal("0.00")

        successful = db.scalar(
            select(func.count()).select_from(Payment).where(Payment.status.in_(_SUCCESS))
        ) or 0
        pending = db.scalar(
            select(func.count()).select_from(Payment).where(Payment.status.in_(_PENDING))
        ) or 0
        failed = db.scalar(
            select(func.count()).select_from(Payment).where(Payment.status.in_(_FAILED))
        ) or 0
        refunded = db.scalar(
            select(func.count()).select_from(Payment).where(Payment.status.in_(_REFUNDED))
        ) or 0

        currency_row = db.scalar(select(Payment.currency).order_by(desc(Payment.created_at)).limit(1))

        return AdminPaymentSummary(
            total_revenue=Decimal(total_revenue),
            todays_revenue=Decimal(todays_revenue),
            successful_payments=int(successful),
            pending_payments=int(pending),
            failed_payments=int(failed),
            refunded_payments=int(refunded),
            currency=currency_row or "INR",
        )

    def _load_filter_options(self, db: Session) -> AdminPaymentFilterOptions:
        providers = db.scalars(
            select(Payment.provider)
            .where(Payment.provider.is_not(None), Payment.provider != "")
            .distinct()
            .order_by(Payment.provider.asc())
        ).all()
        return AdminPaymentFilterOptions(
            gateways=[provider.strip().lower() for provider in providers if provider],
        )


admin_payments_service = AdminPaymentsService()
