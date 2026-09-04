"""Admin orders list, detail, and summary queries."""

from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import String, asc, cast, desc, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.admin.schemas import (
    AdminOrderDetailResponse,
    AdminOrderFilterOptions,
    AdminOrderListItem,
    AdminOrderListResponse,
    AdminOrderPhotoItem,
    AdminOrderSummary,
)
from app.common.enums import CheckoutStatus, MediaType, PaymentStatus
from app.common.exceptions import NotFoundException
from app.models.checkout_session import CheckoutSession
from app.models.experience import Experience
from app.models.experience_media import ExperienceMedia
from app.models.payment import Payment
from app.models.published_experience import PublishedExperience

_SUCCESS_PAYMENT = {PaymentStatus.SUCCESS, PaymentStatus.PAID}
_PENDING_PAYMENT = {PaymentStatus.CREATED, PaymentStatus.PENDING}
_FAILED_PAYMENT = {PaymentStatus.FAILED, PaymentStatus.CANCELLED, PaymentStatus.REFUNDED}
_COMPLETED_CHECKOUT = {CheckoutStatus.COMPLETED}
_PENDING_CHECKOUT = {CheckoutStatus.READY_FOR_PAYMENT, CheckoutStatus.PENDING}


def _utc_today_bounds() -> tuple[datetime, datetime]:
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    return start, start + timedelta(days=1)


def _payment_status_value(payment: Payment | None) -> str:
    return payment.status.value if payment else "unpaid"


def _extract_general(experience: Experience | None) -> dict[str, Any]:
    if not experience or not experience.experience_data:
        return {}
    raw = experience.experience_data
    general = raw.get("general") if isinstance(raw, dict) else None
    return general if isinstance(general, dict) else {}


def _extract_custom_message(experience: Experience | None) -> str | None:
    general = _extract_general(experience)
    message = general.get("custom_message")
    if isinstance(message, str) and message.strip():
        return message.strip()

    if not experience or not experience.experience_data:
        return None
    raw = experience.experience_data
    if not isinstance(raw, dict):
        return None
    letter = raw.get("letter")
    if isinstance(letter, dict):
        body = letter.get("body")
        if isinstance(body, str) and body.strip():
            return body.strip()
    return None


def _extract_recipient_name(experience: Experience | None, checkout: CheckoutSession) -> str | None:
    general = _extract_general(experience)
    receiver = general.get("receiver_name")
    if isinstance(receiver, str) and receiver.strip():
        return receiver.strip()
    return checkout.customer_name


def _photo_items(media: list[ExperienceMedia]) -> list[AdminOrderPhotoItem]:
    items: list[AdminOrderPhotoItem] = []
    for row in media:
        if row.media_type not in {MediaType.PHOTO, MediaType.COVER}:
            continue
        url = row.secure_url or row.file_url or row.placeholder_url
        items.append(
            AdminOrderPhotoItem(
                uuid=str(row.uuid),
                url=url,
                cloudinary_public_id=row.cloudinary_public_id,
                media_type=row.media_type.value,
                alt_text=row.alt_text,
            )
        )
    return items


def _base_order_query():
    return (
        select(CheckoutSession, Experience, Payment, PublishedExperience)
        .join(Experience, Experience.uuid == CheckoutSession.experience_uuid)
        .outerjoin(Payment, Payment.experience_id == Experience.id)
        .outerjoin(PublishedExperience, PublishedExperience.experience_id == Experience.id)
    )


def _serialize_list_item(
    checkout: CheckoutSession,
    experience: Experience,
    payment: Payment | None,
    published: PublishedExperience | None,
) -> AdminOrderListItem:
    is_published = bool(published and published.is_active and published.status == "published")
    return AdminOrderListItem(
        order_id=str(checkout.uuid),
        experience_uuid=str(experience.uuid),
        customer_name=checkout.customer_name,
        email=checkout.email,
        occasion=checkout.occasion or experience.occasion,
        relationship=checkout.relationship or experience.relationship,
        template=checkout.template_name or experience.template_name,
        amount=checkout.total,
        currency=checkout.currency,
        payment_status=_payment_status_value(payment),
        experience_status=experience.status.value if experience.status else None,
        checkout_status=checkout.status.value,
        payment_id=payment.payment_id if payment else None,
        experience_url=published.public_url if is_published else None,
        published=is_published,
        created_at=checkout.created_at,
    )


class AdminOrdersService:
    def list_orders(
        self,
        db: Session,
        *,
        page: int = 1,
        page_size: int = 20,
        q: str | None = None,
        status: str | None = None,
        occasion: str | None = None,
        template: str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
        sort: str = "newest",
    ) -> AdminOrderListResponse:
        page = max(page, 1)
        page_size = min(max(page_size, 1), 100)

        query = _base_order_query()
        count_query = select(func.count()).select_from(CheckoutSession).join(
            Experience, Experience.uuid == CheckoutSession.experience_uuid
        ).outerjoin(Payment, Payment.experience_id == Experience.id)

        filters = []

        if q and q.strip():
            term = f"%{q.strip()}%"
            filters.append(
                or_(
                    CheckoutSession.customer_name.ilike(term),
                    CheckoutSession.email.ilike(term),
                    cast(CheckoutSession.uuid, String).ilike(term),
                )
            )

        if occasion and occasion.strip():
            filters.append(
                or_(
                    CheckoutSession.occasion.ilike(occasion.strip()),
                    Experience.occasion.ilike(occasion.strip()),
                )
            )

        if template and template.strip():
            term = f"%{template.strip()}%"
            filters.append(
                or_(
                    CheckoutSession.template_name.ilike(term),
                    Experience.template_name.ilike(term),
                    Experience.template_slug.ilike(term),
                )
            )

        if date_from is not None:
            filters.append(CheckoutSession.created_at >= date_from)
        if date_to is not None:
            filters.append(CheckoutSession.created_at <= date_to)

        if status and status.strip().lower() not in {"", "all"}:
            normalized = status.strip().lower()
            if normalized == "completed":
                filters.append(
                    or_(
                        Payment.status.in_(_SUCCESS_PAYMENT),
                        CheckoutSession.status.in_(_COMPLETED_CHECKOUT),
                    )
                )
            elif normalized == "pending":
                filters.append(
                    or_(
                        Payment.id.is_(None),
                        Payment.status.in_(_PENDING_PAYMENT),
                    )
                )
                filters.append(
                    or_(
                        Payment.id.is_(None),
                        Payment.status.notin_(_SUCCESS_PAYMENT | _FAILED_PAYMENT),
                    )
                )
                filters.append(CheckoutSession.status != CheckoutStatus.ABANDONED)
            elif normalized == "failed":
                filters.append(
                    or_(
                        Payment.status.in_(_FAILED_PAYMENT),
                        CheckoutSession.status == CheckoutStatus.ABANDONED,
                    )
                )

        for clause in filters:
            query = query.where(clause)
            count_query = count_query.where(clause)

        sort_key = (sort or "newest").strip().lower()
        if sort_key == "oldest":
            query = query.order_by(asc(CheckoutSession.created_at))
        elif sort_key == "highest_amount":
            query = query.order_by(desc(CheckoutSession.total), desc(CheckoutSession.created_at))
        elif sort_key == "lowest_amount":
            query = query.order_by(asc(CheckoutSession.total), desc(CheckoutSession.created_at))
        else:
            query = query.order_by(desc(CheckoutSession.created_at))

        total = db.scalar(count_query) or 0
        pages = math.ceil(total / page_size) if total else 0
        offset = (page - 1) * page_size

        rows = db.execute(query.offset(offset).limit(page_size)).all()
        items = [
            _serialize_list_item(checkout, experience, payment, published)
            for checkout, experience, payment, published in rows
        ]

        return AdminOrderListResponse(
            items=items,
            total=int(total),
            page=page,
            page_size=page_size,
            pages=pages,
            summary=self._load_summary(db),
            filter_options=self._load_filter_options(db),
        )

    def get_order_detail(self, db: Session, order_id: UUID) -> AdminOrderDetailResponse:
        row = db.execute(
            select(CheckoutSession, Experience, Payment, PublishedExperience)
            .join(Experience, Experience.uuid == CheckoutSession.experience_uuid)
            .outerjoin(Payment, Payment.experience_id == Experience.id)
            .outerjoin(PublishedExperience, PublishedExperience.experience_id == Experience.id)
            .options(selectinload(Experience.media))
            .where(CheckoutSession.uuid == order_id)
        ).first()

        if not row:
            raise NotFoundException("Order not found")

        checkout, experience, payment, published = row
        is_published = bool(published and published.is_active and published.status == "published")

        return AdminOrderDetailResponse(
            order_id=str(checkout.uuid),
            experience_uuid=str(experience.uuid),
            customer_name=checkout.customer_name,
            email=checkout.email,
            mobile=checkout.mobile,
            occasion=checkout.occasion or experience.occasion,
            relationship=checkout.relationship or experience.relationship,
            template=checkout.template_name or experience.template_name,
            template_slug=experience.template_slug,
            recipient_name=_extract_recipient_name(experience, checkout),
            custom_message=_extract_custom_message(experience),
            amount=checkout.amount,
            discount_amount=checkout.discount_amount,
            total=checkout.total,
            currency=checkout.currency,
            coupon_code=checkout.coupon_code,
            payment_status=_payment_status_value(payment),
            checkout_status=checkout.status.value,
            experience_status=experience.status.value if experience.status else None,
            payment_id=payment.payment_id if payment else None,
            payment_order_id=payment.order_id if payment else None,
            payment_provider=payment.provider if payment else None,
            experience_url=published.public_url if is_published else None,
            published=is_published,
            published_at=published.published_at if published else None,
            photos=_photo_items(list(experience.media or [])),
            created_at=checkout.created_at,
            updated_at=checkout.updated_at,
        )

    def _load_summary(self, db: Session) -> AdminOrderSummary:
        today_start, today_end = _utc_today_bounds()

        total_orders = db.scalar(select(func.count()).select_from(CheckoutSession)) or 0

        completed = db.scalar(
            select(func.count())
            .select_from(CheckoutSession)
            .join(Experience, Experience.uuid == CheckoutSession.experience_uuid)
            .outerjoin(Payment, Payment.experience_id == Experience.id)
            .where(
                or_(
                    Payment.status.in_(_SUCCESS_PAYMENT),
                    CheckoutSession.status.in_(_COMPLETED_CHECKOUT),
                )
            )
        ) or 0

        pending = db.scalar(
            select(func.count())
            .select_from(CheckoutSession)
            .join(Experience, Experience.uuid == CheckoutSession.experience_uuid)
            .outerjoin(Payment, Payment.experience_id == Experience.id)
            .where(
                CheckoutSession.status.in_(_PENDING_CHECKOUT),
                or_(Payment.id.is_(None), Payment.status.in_(_PENDING_PAYMENT)),
            )
        ) or 0

        failed = db.scalar(
            select(func.count())
            .select_from(CheckoutSession)
            .join(Experience, Experience.uuid == CheckoutSession.experience_uuid)
            .outerjoin(Payment, Payment.experience_id == Experience.id)
            .where(
                or_(
                    Payment.status.in_(_FAILED_PAYMENT),
                    CheckoutSession.status == CheckoutStatus.ABANDONED,
                )
            )
        ) or 0

        todays_orders = db.scalar(
            select(func.count())
            .select_from(CheckoutSession)
            .where(
                CheckoutSession.created_at >= today_start,
                CheckoutSession.created_at < today_end,
            )
        ) or 0

        todays_revenue = db.scalar(
            select(func.coalesce(func.sum(CheckoutSession.total), 0))
            .select_from(CheckoutSession)
            .join(Experience, Experience.uuid == CheckoutSession.experience_uuid)
            .join(Payment, Payment.experience_id == Experience.id)
            .where(
                CheckoutSession.created_at >= today_start,
                CheckoutSession.created_at < today_end,
                Payment.status.in_(_SUCCESS_PAYMENT),
            )
        ) or Decimal("0.00")

        currency_row = db.scalar(
            select(CheckoutSession.currency)
            .order_by(desc(CheckoutSession.created_at))
            .limit(1)
        )

        return AdminOrderSummary(
            total_orders=int(total_orders),
            completed=int(completed),
            pending=int(pending),
            failed=int(failed),
            todays_orders=int(todays_orders),
            todays_revenue=Decimal(todays_revenue),
            currency=currency_row or "INR",
        )

    def _load_filter_options(self, db: Session) -> AdminOrderFilterOptions:
        occasions = db.scalars(
            select(CheckoutSession.occasion)
            .where(CheckoutSession.occasion.is_not(None), CheckoutSession.occasion != "")
            .distinct()
            .order_by(CheckoutSession.occasion.asc())
        ).all()
        templates = db.scalars(
            select(CheckoutSession.template_name)
            .where(CheckoutSession.template_name.is_not(None), CheckoutSession.template_name != "")
            .distinct()
            .order_by(CheckoutSession.template_name.asc())
        ).all()
        return AdminOrderFilterOptions(
            occasions=[value for value in occasions if value],
            templates=[value for value in templates if value],
        )


admin_orders_service = AdminOrdersService()
