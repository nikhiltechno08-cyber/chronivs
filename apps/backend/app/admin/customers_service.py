"""Admin customers list and detail queries."""

from __future__ import annotations

import math
from datetime import datetime, timezone
from decimal import Decimal
from urllib.parse import unquote

from sqlalchemy import asc, case, desc, func, or_, select
from sqlalchemy.orm import Session

from app.admin.schemas import (
    AdminCustomerDetailResponse,
    AdminCustomerExperienceItem,
    AdminCustomerListItem,
    AdminCustomerListResponse,
    AdminCustomerOrderHistoryItem,
    AdminCustomerPaymentHistoryItem,
    AdminCustomerSummary,
)
from app.common.enums import MediaType, PaymentStatus
from app.common.exceptions import NotFoundException
from app.models.checkout_session import CheckoutSession
from app.models.experience import Experience
from app.models.experience_media import ExperienceMedia
from app.models.payment import Payment
from app.models.published_experience import PublishedExperience

_SUCCESS_PAYMENT = {PaymentStatus.SUCCESS, PaymentStatus.PAID}


def _month_start_utc() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def _normalize_email(email: str) -> str:
    return unquote(email).strip().lower()


def _payment_status_value(payment: Payment | None) -> str:
    return payment.status.value if payment else "unpaid"


def _customer_aggregate_subquery():
    paid_total = func.coalesce(
        func.sum(
            case(
                (Payment.status.in_(_SUCCESS_PAYMENT), CheckoutSession.total),
                else_=Decimal("0.00"),
            )
        ),
        Decimal("0.00"),
    )
    paid_orders = func.coalesce(
        func.sum(case((Payment.status.in_(_SUCCESS_PAYMENT), 1), else_=0)),
        0,
    )

    return (
        select(
            func.lower(CheckoutSession.email).label("email"),
            func.max(CheckoutSession.customer_name).label("customer_name"),
            func.max(CheckoutSession.mobile).label("phone"),
            func.count(CheckoutSession.id).label("total_orders"),
            paid_total.label("total_spent"),
            paid_orders.label("paid_orders"),
            func.min(CheckoutSession.created_at).label("joined_at"),
            func.max(CheckoutSession.created_at).label("latest_purchase"),
            func.max(CheckoutSession.currency).label("currency"),
        )
        .join(Experience, Experience.uuid == CheckoutSession.experience_uuid)
        .outerjoin(Payment, Payment.experience_id == Experience.id)
        .group_by(func.lower(CheckoutSession.email))
    ).subquery("customers")


class AdminCustomersService:
    def list_customers(
        self,
        db: Session,
        *,
        page: int = 1,
        page_size: int = 20,
        q: str | None = None,
        has_orders: str | None = None,
        repeat_customer: str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
        sort: str = "newest",
    ) -> AdminCustomerListResponse:
        page = max(page, 1)
        page_size = min(max(page_size, 1), 100)
        customers = _customer_aggregate_subquery()

        query = select(customers)
        count_query = select(func.count()).select_from(customers)
        filters = []

        if q and q.strip():
            term = f"%{q.strip()}%"
            filters.append(
                or_(
                    customers.c.customer_name.ilike(term),
                    customers.c.email.ilike(term),
                    customers.c.phone.ilike(term),
                )
            )

        has_orders_key = (has_orders or "all").strip().lower()
        if has_orders_key == "paid":
            filters.append(customers.c.paid_orders >= 1)
        elif has_orders_key == "unpaid":
            filters.append(customers.c.paid_orders == 0)

        repeat_key = (repeat_customer or "all").strip().lower()
        if repeat_key == "repeat":
            filters.append(customers.c.total_orders > 1)
        elif repeat_key == "first_time":
            filters.append(customers.c.total_orders == 1)

        if date_from is not None:
            filters.append(customers.c.joined_at >= date_from)
        if date_to is not None:
            filters.append(customers.c.joined_at <= date_to)

        for clause in filters:
            query = query.where(clause)
            count_query = count_query.where(clause)

        sort_key = (sort or "newest").strip().lower()
        if sort_key == "oldest":
            query = query.order_by(asc(customers.c.joined_at))
        elif sort_key == "highest_spend":
            query = query.order_by(desc(customers.c.total_spent), desc(customers.c.joined_at))
        elif sort_key == "latest_purchase":
            query = query.order_by(desc(customers.c.latest_purchase))
        elif sort_key == "most_orders":
            query = query.order_by(desc(customers.c.total_orders), desc(customers.c.joined_at))
        else:
            query = query.order_by(desc(customers.c.joined_at))

        total = db.scalar(count_query) or 0
        pages = math.ceil(total / page_size) if total else 0
        offset = (page - 1) * page_size
        rows = db.execute(query.offset(offset).limit(page_size)).all()

        emails = [row.email for row in rows]
        latest_meta = self._load_latest_order_meta(db, emails)

        items = [
            AdminCustomerListItem(
                email=row.email,
                customer_name=row.customer_name,
                phone=row.phone,
                total_orders=int(row.total_orders),
                total_spent=Decimal(row.total_spent),
                currency=row.currency or "INR",
                latest_purchase=row.latest_purchase,
                joined_at=row.joined_at,
                is_repeat=int(row.total_orders) > 1,
                latest_order_id=latest_meta.get(row.email, {}).get("order_id"),
                latest_experience_url=latest_meta.get(row.email, {}).get("experience_url"),
            )
            for row in rows
        ]

        return AdminCustomerListResponse(
            items=items,
            total=int(total),
            page=page,
            page_size=page_size,
            pages=pages,
            summary=self._load_summary(db),
        )

    def get_customer_detail(self, db: Session, email: str) -> AdminCustomerDetailResponse:
        normalized = _normalize_email(email)
        customers = _customer_aggregate_subquery()
        row = db.execute(select(customers).where(customers.c.email == normalized)).first()
        if not row:
            raise NotFoundException("Customer not found")

        order_rows = db.execute(
            select(CheckoutSession, Experience, Payment, PublishedExperience)
            .join(Experience, Experience.uuid == CheckoutSession.experience_uuid)
            .outerjoin(Payment, Payment.experience_id == Experience.id)
            .outerjoin(PublishedExperience, PublishedExperience.experience_id == Experience.id)
            .where(func.lower(CheckoutSession.email) == normalized)
            .order_by(desc(CheckoutSession.created_at))
        ).all()

        if not order_rows:
            raise NotFoundException("Customer not found")

        purchase_history: list[AdminCustomerOrderHistoryItem] = []
        payment_history: list[AdminCustomerPaymentHistoryItem] = []
        experiences: list[AdminCustomerExperienceItem] = []
        seen_experiences: set[str] = set()
        experience_ids: list[int] = []

        latest_order_id: str | None = None
        latest_purchase: datetime | None = None
        latest_experience_url: str | None = None

        for index, (checkout, experience, payment, published) in enumerate(order_rows):
            if index == 0:
                latest_order_id = str(checkout.uuid)
                latest_purchase = checkout.created_at
                if published and published.is_active and published.public_url:
                    latest_experience_url = published.public_url

            purchase_history.append(
                AdminCustomerOrderHistoryItem(
                    order_id=str(checkout.uuid),
                    amount=checkout.total,
                    currency=checkout.currency,
                    payment_status=_payment_status_value(payment),
                    checkout_status=checkout.status.value,
                    template=checkout.template_name or experience.template_name,
                    occasion=checkout.occasion or experience.occasion,
                    created_at=checkout.created_at,
                )
            )

            if payment:
                payment_history.append(
                    AdminCustomerPaymentHistoryItem(
                        payment_id=payment.payment_id,
                        order_id=str(checkout.uuid),
                        amount=payment.amount,
                        currency=payment.currency,
                        status=payment.status.value,
                        provider=payment.provider,
                        created_at=payment.created_at,
                    )
                )

            experience_key = str(experience.uuid)
            if experience_key not in seen_experiences:
                seen_experiences.add(experience_key)
                experience_ids.append(experience.id)
                is_published = bool(published and published.is_active and published.status == "published")
                name = experience.title or experience.template_name or "Experience"
                experiences.append(
                    AdminCustomerExperienceItem(
                        id=str(published.public_uuid) if published else experience_key,
                        name=name,
                        public_url=published.public_url if is_published else None,
                        published=is_published,
                        published_at=published.published_at if published else None,
                        created_at=experience.created_at,
                    )
                )

        uploaded_images_count = 0
        if experience_ids:
            uploaded_images_count = (
                db.scalar(
                    select(func.count())
                    .select_from(ExperienceMedia)
                    .where(
                        ExperienceMedia.experience_id.in_(experience_ids),
                        ExperienceMedia.media_type.in_({MediaType.PHOTO, MediaType.COVER}),
                    )
                )
                or 0
            )

        return AdminCustomerDetailResponse(
            email=row.email,
            customer_name=row.customer_name,
            phone=row.phone,
            joined_at=row.joined_at,
            total_orders=int(row.total_orders),
            total_spent=Decimal(row.total_spent),
            currency=row.currency or "INR",
            latest_order_id=latest_order_id,
            latest_purchase=latest_purchase,
            latest_experience_url=latest_experience_url,
            uploaded_images_count=int(uploaded_images_count),
            purchase_history=purchase_history,
            payment_history=payment_history,
            experiences=experiences,
        )

    def _load_latest_order_meta(
        self,
        db: Session,
        emails: list[str],
    ) -> dict[str, dict[str, str | None]]:
        if not emails:
            return {}

        rows = db.execute(
            select(CheckoutSession, PublishedExperience)
            .join(Experience, Experience.uuid == CheckoutSession.experience_uuid)
            .outerjoin(PublishedExperience, PublishedExperience.experience_id == Experience.id)
            .where(func.lower(CheckoutSession.email).in_(emails))
            .order_by(func.lower(CheckoutSession.email), desc(CheckoutSession.created_at))
        ).all()

        meta: dict[str, dict[str, str | None]] = {}
        for checkout, published in rows:
            email = checkout.email.lower()
            if email in meta:
                continue
            experience_url = None
            if published and published.is_active and published.public_url:
                experience_url = published.public_url
            meta[email] = {
                "order_id": str(checkout.uuid),
                "experience_url": experience_url,
            }
        return meta

    def _load_summary(self, db: Session) -> AdminCustomerSummary:
        customers = _customer_aggregate_subquery()
        month_start = _month_start_utc()

        total_customers = db.scalar(select(func.count()).select_from(customers)) or 0
        new_this_month = (
            db.scalar(
                select(func.count()).select_from(customers).where(customers.c.joined_at >= month_start)
            )
            or 0
        )
        repeat_customers = (
            db.scalar(
                select(func.count()).select_from(customers).where(customers.c.total_orders > 1)
            )
            or 0
        )
        total_revenue = db.scalar(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status.in_(_SUCCESS_PAYMENT))
        ) or Decimal("0.00")
        currency_row = db.scalar(
            select(CheckoutSession.currency).order_by(desc(CheckoutSession.created_at)).limit(1)
        )

        return AdminCustomerSummary(
            total_customers=int(total_customers),
            new_this_month=int(new_this_month),
            repeat_customers=int(repeat_customers),
            total_revenue=Decimal(total_revenue),
            currency=currency_row or "INR",
        )


admin_customers_service = AdminCustomersService()
