"""Admin experiences list and detail queries."""

from __future__ import annotations

import math
from datetime import datetime
from uuid import UUID

from sqlalchemy import String, asc, cast, desc, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.admin.experience_helpers import (
    display_status,
    extract_custom_message,
    extract_recipient_name,
    payment_reference,
    photo_items,
    resolve_customer_name,
    utc_now,
)
from app.admin.schemas import (
    AdminExperienceDetailResponse,
    AdminExperienceFilterOptions,
    AdminExperienceListItem,
    AdminExperienceListResponse,
    AdminExperienceSummary,
)
from app.common.exceptions import NotFoundException
from app.models.checkout_session import CheckoutSession
from app.models.experience import Experience
from app.models.payment import Payment
from app.models.published_experience import PublishedExperience


def _base_experience_query():
    return (
        select(Experience, PublishedExperience, CheckoutSession, Payment)
        .outerjoin(PublishedExperience, PublishedExperience.experience_id == Experience.id)
        .outerjoin(CheckoutSession, CheckoutSession.experience_uuid == Experience.uuid)
        .outerjoin(Payment, Payment.experience_id == Experience.id)
        .where(Experience.deleted_at.is_(None))
    )


def _serialize_list_item(
    experience: Experience,
    published: PublishedExperience | None,
    checkout: CheckoutSession | None,
) -> AdminExperienceListItem:
    status = display_status(experience, published)
    return AdminExperienceListItem(
        experience_id=str(experience.uuid),
        customer=resolve_customer_name(experience, checkout),
        customer_email=experience.customer_email or (checkout.email if checkout else None),
        occasion=experience.occasion or (checkout.occasion if checkout else None),
        relationship=experience.relationship or (checkout.relationship if checkout else None),
        template=experience.template_name or (checkout.template_name if checkout else None),
        status=status,
        experience_status=experience.status.value if experience.status else None,
        published_url=published.public_url if published and published.is_active else None,
        created_at=experience.created_at,
    )


class AdminExperiencesService:
    def list_experiences(
        self,
        db: Session,
        *,
        page: int = 1,
        page_size: int = 20,
        q: str | None = None,
        occasion: str | None = None,
        relationship: str | None = None,
        template: str | None = None,
        status: str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
        sort: str = "newest",
    ) -> AdminExperienceListResponse:
        page = max(page, 1)
        page_size = min(max(page_size, 1), 100)
        now = utc_now()

        query = _base_experience_query()
        count_query = (
            select(func.count())
            .select_from(Experience)
            .outerjoin(PublishedExperience, PublishedExperience.experience_id == Experience.id)
            .outerjoin(CheckoutSession, CheckoutSession.experience_uuid == Experience.uuid)
            .where(Experience.deleted_at.is_(None))
        )

        filters = []

        if q and q.strip():
            term = f"%{q.strip()}%"
            filters.append(
                or_(
                    Experience.customer_name.ilike(term),
                    Experience.customer_email.ilike(term),
                    Experience.template_name.ilike(term),
                    Experience.template_slug.ilike(term),
                    cast(Experience.uuid, String).ilike(term),
                    CheckoutSession.customer_name.ilike(term),
                    CheckoutSession.email.ilike(term),
                )
            )

        if occasion and occasion.strip():
            filters.append(
                or_(
                    Experience.occasion.ilike(occasion.strip()),
                    CheckoutSession.occasion.ilike(occasion.strip()),
                )
            )

        if relationship and relationship.strip():
            filters.append(
                or_(
                    Experience.relationship.ilike(relationship.strip()),
                    CheckoutSession.relationship.ilike(relationship.strip()),
                )
            )

        if template and template.strip():
            term = f"%{template.strip()}%"
            filters.append(
                or_(
                    Experience.template_name.ilike(term),
                    Experience.template_slug.ilike(term),
                    CheckoutSession.template_name.ilike(term),
                    PublishedExperience.template_id.ilike(term),
                )
            )

        if date_from is not None:
            filters.append(Experience.created_at >= date_from)
        if date_to is not None:
            filters.append(Experience.created_at <= date_to)

        status_key = (status or "all").strip().lower()
        if status_key == "published":
            filters.append(
                PublishedExperience.is_active.is_(True),
                PublishedExperience.status == "published",
                or_(PublishedExperience.expires_at.is_(None), PublishedExperience.expires_at >= now),
            )
        elif status_key == "draft":
            filters.append(
                or_(
                    PublishedExperience.id.is_(None),
                    PublishedExperience.is_active.is_(False),
                    PublishedExperience.status != "published",
                )
            )
        elif status_key == "expired":
            filters.append(
                PublishedExperience.expires_at.is_not(None),
                PublishedExperience.expires_at < now,
            )

        for clause in filters:
            query = query.where(clause)
            count_query = count_query.where(clause)

        sort_key = (sort or "newest").strip().lower()
        if sort_key == "oldest":
            query = query.order_by(asc(Experience.created_at))
        else:
            query = query.order_by(desc(Experience.created_at))

        total = db.scalar(count_query) or 0
        pages = math.ceil(total / page_size) if total else 0
        offset = (page - 1) * page_size

        rows = db.execute(query.offset(offset).limit(page_size)).all()
        items = [
            _serialize_list_item(experience, published, checkout)
            for experience, published, checkout, _payment in rows
        ]

        return AdminExperienceListResponse(
            items=items,
            total=int(total),
            page=page,
            page_size=page_size,
            pages=pages,
            summary=self._load_summary(db),
            filter_options=self._load_filter_options(db),
        )

    def get_experience_detail(self, db: Session, experience_id: UUID) -> AdminExperienceDetailResponse:
        row = db.execute(
            _base_experience_query()
            .options(selectinload(Experience.media))
            .where(Experience.uuid == experience_id)
        ).first()

        if not row:
            raise NotFoundException("Experience not found")

        experience, published, checkout, payment = row
        status = display_status(experience, published)

        return AdminExperienceDetailResponse(
            experience_id=str(experience.uuid),
            customer=resolve_customer_name(experience, checkout),
            customer_email=experience.customer_email or (checkout.email if checkout else None),
            recipient_name=extract_recipient_name(experience, checkout),
            occasion=experience.occasion or (checkout.occasion if checkout else None),
            relationship=experience.relationship or (checkout.relationship if checkout else None),
            template=experience.template_name or (checkout.template_name if checkout else None),
            template_slug=experience.template_slug,
            personal_message=extract_custom_message(experience),
            status=status,
            experience_status=experience.status.value if experience.status else None,
            published_url=published.public_url if published and published.is_active else None,
            public_slug=published.public_slug if published else None,
            payment_reference=payment_reference(payment),
            checkout_order_id=str(checkout.uuid) if checkout else None,
            photos=photo_items(list(experience.media or [])),
            created_at=experience.created_at,
            published_at=published.published_at if published else experience.published_at,
        )

    def _load_summary(self, db: Session) -> AdminExperienceSummary:
        now = utc_now()
        total = db.scalar(select(func.count()).select_from(Experience).where(Experience.deleted_at.is_(None))) or 0

        published = db.scalar(
            select(func.count())
            .select_from(Experience)
            .join(PublishedExperience, PublishedExperience.experience_id == Experience.id)
            .where(
                Experience.deleted_at.is_(None),
                PublishedExperience.is_active.is_(True),
                PublishedExperience.status == "published",
                or_(PublishedExperience.expires_at.is_(None), PublishedExperience.expires_at >= now),
            )
        ) or 0

        expired = db.scalar(
            select(func.count())
            .select_from(Experience)
            .join(PublishedExperience, PublishedExperience.experience_id == Experience.id)
            .where(
                Experience.deleted_at.is_(None),
                PublishedExperience.expires_at.is_not(None),
                PublishedExperience.expires_at < now,
            )
        ) or 0

        draft = max(int(total) - int(published) - int(expired), 0)

        return AdminExperienceSummary(
            published=int(published),
            draft=int(draft),
            expired=int(expired),
            total=int(total),
        )

    def _load_filter_options(self, db: Session) -> AdminExperienceFilterOptions:
        occasions = db.scalars(
            select(Experience.occasion)
            .where(Experience.deleted_at.is_(None), Experience.occasion.is_not(None), Experience.occasion != "")
            .distinct()
            .order_by(Experience.occasion.asc())
        ).all()
        relationships = db.scalars(
            select(Experience.relationship)
            .where(
                Experience.deleted_at.is_(None),
                Experience.relationship.is_not(None),
                Experience.relationship != "",
            )
            .distinct()
            .order_by(Experience.relationship.asc())
        ).all()
        templates = db.scalars(
            select(Experience.template_name)
            .where(
                Experience.deleted_at.is_(None),
                Experience.template_name.is_not(None),
                Experience.template_name != "",
            )
            .distinct()
            .order_by(Experience.template_name.asc())
        ).all()
        return AdminExperienceFilterOptions(
            occasions=[value for value in occasions if value],
            relationships=[value for value in relationships if value],
            templates=[value for value in templates if value],
        )


admin_experiences_service = AdminExperiencesService()
