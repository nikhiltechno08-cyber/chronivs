"""Experience service — create/store/lifecycle for the central Chronivs object."""

from __future__ import annotations

from typing import Any
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.common.enums import ExperienceStatus
from app.common.exceptions import ConflictException, NotFoundException, ValidationException
from app.mappers.experience_mapper import experience_mapper
from app.models.experience import Experience
from app.repositories.experience_repository import experience_repository
from app.schemas.checkout import CheckoutCreateRequest
from app.schemas.experience import (
    ExperienceCreateRequest,
    ExperienceListResponse,
    ExperienceResponse,
    ExperienceUpdateRequest,
)
from app.schemas.experience_data import ExperienceData, ExperienceDataGeneral, ExperienceDataMetadata
from app.serializers.experience_serializer import experience_serializer
from app.validators.experience_validator import experience_validator


class ExperienceService:
    def __init__(self) -> None:
        self.repo = experience_repository
        self.mapper = experience_mapper
        self.validator = experience_validator
        self.serializer = experience_serializer

    def create(self, db: Session, payload: ExperienceCreateRequest) -> ExperienceResponse:
        self.validator.validate_create(payload)
        user_id = self.repo.resolve_user_id(db, payload.user_uuid)
        if payload.user_uuid and user_id is None:
            raise ValidationException("user_uuid not found")

        orm_data = self.mapper.to_orm_dict(payload, user_id=user_id)
        experience = Experience(**orm_data)
        self.repo.add(db, experience)
        self.repo.commit(db)
        self.repo.refresh(db, experience)
        return self.mapper.to_response(experience)

    def create_from_checkout(
        self,
        db: Session,
        payload: CheckoutCreateRequest,
        *,
        experience_uuid: UUID,
        template_slug: str | None = None,
    ) -> Experience:
        """Materialize Experience using the checkout-reserved UUID (same transaction)."""
        slug = template_slug or self._infer_slug(payload.template_name)

        # Prefer client-provided canonical experience_data when present.
        if payload.experience_data is not None:
            data = self.mapper.parse_data(payload.experience_data)
            notes = dict(data.metadata.notes or {})
            if payload.coupon_code:
                notes.setdefault("coupon_code", payload.coupon_code)
            notes.setdefault("source", "checkout")
            data = data.model_copy(
                update={
                    "metadata": data.metadata.model_copy(
                        update={"source": data.metadata.source or "checkout", "notes": notes}
                    )
                }
            )
        else:
            data = ExperienceData(
                general=ExperienceDataGeneral(
                    experience_title=payload.template_name,
                ),
                metadata=ExperienceDataMetadata(
                    source="checkout",
                    notes={"coupon_code": payload.coupon_code} if payload.coupon_code else {},
                ),
            )

        title = (
            data.general.experience_title
            or payload.template_name
            or slug
        )
        experience = Experience(
            uuid=experience_uuid,
            user_id=None,
            template_slug=slug,
            template_name=payload.template_name,
            occasion=payload.occasion,
            relationship=payload.relationship,
            title=title,
            customer_name=payload.customer_name,
            customer_email=str(payload.email).lower().strip(),
            customer_mobile=payload.mobile,
            status=ExperienceStatus.READY_FOR_PAYMENT,
            preview_version=1,
            published_version=None,
            experience_data=data.model_dump(),
        )
        self.repo.add(db, experience)
        return experience

    def attach_checkout_payload(
        self,
        db: Session,
        experience_uuid: UUID,
        payload: CheckoutCreateRequest,
        *,
        template_slug: str | None = None,
    ) -> Experience:
        """
        Attach checkout customer + optional experience_data to a pre-created Experience.
        Does not create a second row — used when FE already called POST /experiences.
        """
        experience = self._require(db, experience_uuid)
        self._assert_editable(experience)
        slug = template_slug or experience.template_slug or self._infer_slug(payload.template_name)

        if payload.experience_data is not None:
            data = self.mapper.parse_data(payload.experience_data)
            notes = dict(data.metadata.notes or {})
            if payload.coupon_code:
                notes.setdefault("coupon_code", payload.coupon_code)
            data = data.model_copy(
                update={
                    "metadata": data.metadata.model_copy(
                        update={"source": data.metadata.source or "checkout", "notes": notes}
                    )
                }
            )
            experience.experience_data = data.model_dump()
            experience.title = data.general.experience_title or experience.title or payload.template_name

        experience.template_slug = slug
        experience.template_name = payload.template_name or experience.template_name
        experience.occasion = payload.occasion or experience.occasion
        experience.relationship = payload.relationship or experience.relationship
        experience.customer_name = payload.customer_name
        experience.customer_email = str(payload.email).lower().strip()
        experience.customer_mobile = payload.mobile
        experience.status = ExperienceStatus.READY_FOR_PAYMENT
        experience.preview_version = int(experience.preview_version or 1) + 1
        self.repo.save(db, experience)
        return experience

    def get(self, db: Session, experience_uuid: UUID) -> ExperienceResponse:
        experience = self._require(db, experience_uuid)
        return self.mapper.to_response(experience)

    def update(
        self,
        db: Session,
        experience_uuid: UUID,
        payload: ExperienceUpdateRequest,
    ) -> ExperienceResponse:
        self.validator.validate_update(payload)
        experience = self._require(db, experience_uuid)
        self._assert_editable(experience)
        self.mapper.apply_update(experience, payload)
        # Bump preview version when content changes — version history ready.
        changed = payload.model_dump(exclude_unset=True)
        if payload.experience_data is not None or any(
            field in changed
            for field in ("title", "template_slug", "template_name", "occasion", "relationship", "status")
        ):
            experience.preview_version = int(experience.preview_version or 1) + 1
        self.repo.save(db, experience)
        self.repo.commit(db)
        self.repo.refresh(db, experience)
        return self.mapper.to_response(experience)

    def patch_section(
        self,
        db: Session,
        experience_uuid: UUID,
        section: str,
        payload: dict[str, Any],
    ) -> ExperienceResponse:
        """Autosave-ready section patch."""
        self.validator.validate_section(section)
        experience = self._require(db, experience_uuid)
        self._assert_editable(experience)
        current = self.mapper.parse_data(experience.experience_data)
        merged = current.merge_section(section, payload)
        self.validator.validate_data(merged)
        experience.experience_data = merged.model_dump()
        experience.preview_version = int(experience.preview_version or 1) + 1
        self.repo.save(db, experience)
        self.repo.commit(db)
        self.repo.refresh(db, experience)
        return self.mapper.to_response(experience)

    def archive(self, db: Session, experience_uuid: UUID) -> ExperienceResponse:
        experience = self._require(db, experience_uuid)
        self.repo.soft_delete(db, experience)
        self.repo.commit(db)
        self.repo.refresh(db, experience)
        return self.mapper.to_response(experience)

    def duplicate(self, db: Session, experience_uuid: UUID) -> ExperienceResponse:
        source = self._require(db, experience_uuid)
        clone = Experience(
            uuid=uuid4(),
            user_id=source.user_id,
            template_slug=source.template_slug,
            template_name=source.template_name,
            occasion=source.occasion,
            relationship=source.relationship,
            title=f"{source.title or 'Experience'} (Copy)" if source.title else "Experience (Copy)",
            customer_name=source.customer_name,
            customer_email=source.customer_email,
            customer_mobile=source.customer_mobile,
            status=ExperienceStatus.DRAFT,
            preview_version=1,
            published_version=None,
            experience_data=self.mapper.parse_data(source.experience_data).model_dump(),
            published_at=None,
            deleted_at=None,
        )
        self.repo.add(db, clone)
        self.repo.commit(db)
        self.repo.refresh(db, clone)
        return self.mapper.to_response(clone)

    def list(
        self,
        db: Session,
        *,
        page: int = 1,
        page_size: int = 20,
        status: ExperienceStatus | None = None,
        customer_email: str | None = None,
    ) -> ExperienceListResponse:
        items, total = self.repo.list(
            db,
            page=page,
            page_size=page_size,
            status=status,
            customer_email=customer_email,
        )
        return ExperienceListResponse(
            items=[self.mapper.to_response(item) for item in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    def serialize(self, db: Session, experience_uuid: UUID) -> dict[str, Any]:
        experience = self._require(db, experience_uuid)
        return self.serializer.to_dict(experience)

    def _require(self, db: Session, experience_uuid: UUID) -> Experience:
        experience = self.repo.get_by_uuid(db, experience_uuid)
        if experience is None:
            raise NotFoundException("Experience not found", details={"uuid": str(experience_uuid)})
        return experience

    @staticmethod
    def _assert_editable(experience: Experience) -> None:
        """Published experiences are immutable — future edits create a new version."""
        if experience.status == ExperienceStatus.PUBLISHED:
            raise ConflictException(
                "This experience is published and can no longer be edited.",
                code="experience_locked",
                details={"uuid": str(experience.uuid)},
            )

    @staticmethod
    def _infer_slug(template_name: str | None) -> str | None:
        if not template_name:
            return None
        value = template_name.strip().lower()
        if " " in value or "·" in value:
            # Display label — not a slug; leave null unless kebab-case.
            if all(ch.isalnum() or ch == "-" for ch in value.replace(" ", "-")):
                return "-".join(part for part in value.replace("·", " ").split() if part)
            return None
        return value if all(ch.isalnum() or ch == "-" for ch in value) else None


experience_service = ExperienceService()
