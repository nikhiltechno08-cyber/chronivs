"""PublishedExperience repository — persistence only."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.experience import Experience
from app.models.published_experience import PublishedExperience


class PublishedExperienceRepository:
    def get_by_experience_id(self, db: Session, experience_id: int) -> PublishedExperience | None:
        return db.scalars(
            select(PublishedExperience).where(PublishedExperience.experience_id == experience_id)
        ).first()

    def get_by_public_token(
        self,
        db: Session,
        token: str,
        *,
        include_inactive: bool = False,
    ) -> PublishedExperience | None:
        """Resolve by public_slug or public_uuid string (never by DB integer id)."""
        token = (token or "").strip()
        if not token:
            return None

        filters = [PublishedExperience.public_slug == token]
        try:
            as_uuid = UUID(token)
            filters.append(PublishedExperience.public_uuid == as_uuid)
        except ValueError:
            # Also accept uuid hex without dashes
            if len(token) == 32:
                try:
                    as_uuid = UUID(hex=token)
                    filters.append(PublishedExperience.public_uuid == as_uuid)
                except ValueError:
                    pass

        statement = (
            select(PublishedExperience)
            .options(
                selectinload(PublishedExperience.experience).selectinload(Experience.payment),
            )
            .where(or_(*filters))
        )
        if not include_inactive:
            statement = statement.where(PublishedExperience.is_active.is_(True))
        return db.scalars(statement).first()

    def slug_exists(self, db: Session, slug: str) -> bool:
        return (
            db.scalars(
                select(PublishedExperience.id).where(PublishedExperience.public_slug == slug)
            ).first()
            is not None
        )

    def add(self, db: Session, row: PublishedExperience) -> PublishedExperience:
        db.add(row)
        db.flush()
        return row

    def save(self, db: Session, row: PublishedExperience) -> PublishedExperience:
        db.add(row)
        db.flush()
        return row


published_experience_repository = PublishedExperienceRepository()
