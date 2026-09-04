"""Experience repository — persistence only (no business rules)."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.common.enums import ExperienceStatus
from app.models.experience import Experience
from app.models.user import User


class ExperienceRepository:
    def get_by_uuid(
        self,
        db: Session,
        experience_uuid: UUID,
        *,
        include_deleted: bool = False,
    ) -> Experience | None:
        statement = (
            select(Experience)
            .options(
                selectinload(Experience.user),
                selectinload(Experience.media),
                selectinload(Experience.payment),
                selectinload(Experience.published),
            )
            .where(Experience.uuid == experience_uuid)
        )
        if not include_deleted:
            statement = statement.where(Experience.deleted_at.is_(None))
        return db.scalars(statement).first()

    def get_by_id(self, db: Session, experience_id: int) -> Experience | None:
        return db.get(Experience, experience_id)

    def list(
        self,
        db: Session,
        *,
        page: int = 1,
        page_size: int = 20,
        status: ExperienceStatus | None = None,
        customer_email: str | None = None,
        include_deleted: bool = False,
    ) -> tuple[list[Experience], int]:
        filters = []
        if not include_deleted:
            filters.append(Experience.deleted_at.is_(None))
        if status is not None:
            filters.append(Experience.status == status)
        if customer_email:
            filters.append(Experience.customer_email == customer_email.lower().strip())

        count_stmt = select(func.count()).select_from(Experience)
        list_stmt = (
            select(Experience)
            .options(selectinload(Experience.user))
            .order_by(Experience.created_at.desc())
        )
        if filters:
            count_stmt = count_stmt.where(*filters)
            list_stmt = list_stmt.where(*filters)

        total = int(db.scalar(count_stmt) or 0)
        offset = max(page - 1, 0) * page_size
        items = list(db.scalars(list_stmt.offset(offset).limit(page_size)).all())
        return items, total

    def add(self, db: Session, experience: Experience) -> Experience:
        db.add(experience)
        db.flush()
        return experience

    def save(self, db: Session, experience: Experience) -> Experience:
        db.add(experience)
        db.flush()
        db.refresh(experience)
        return experience

    def soft_delete(self, db: Session, experience: Experience) -> Experience:
        experience.touch_soft_delete()
        return self.save(db, experience)

    def resolve_user_id(self, db: Session, user_uuid: UUID | None) -> int | None:
        if user_uuid is None:
            return None
        user = db.scalars(select(User).where(User.uuid == user_uuid)).first()
        return user.id if user else None

    def commit(self, db: Session) -> None:
        db.commit()

    def refresh(self, db: Session, experience: Experience) -> Experience:
        db.refresh(experience)
        return experience


experience_repository = ExperienceRepository()
