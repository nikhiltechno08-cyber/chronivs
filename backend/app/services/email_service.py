"""
EmailService — deliver premium Chronivs emails after publish.

Architecture:
  EmailService → EmailProvider (Resend) → EmailLog (DB)

Future email kinds (receipt, reminder, anniversary, thank_you, referral)
register through send_templated_email without changing core flow.
"""

from __future__ import annotations

import logging
import re
import time
from datetime import datetime, timezone
from typing import Any, Callable
from uuid import UUID

from email_validator import EmailNotValidError, validate_email
from sqlalchemy.orm import Session

from app.common.enums import EmailLogStatus, ExperienceStatus
from app.common.exceptions import NotFoundException, ValidationException
from app.core.config import settings
from app.email.base import EmailMessage, EmailProvider, EmailSendResult
from app.email.factory import get_email_provider
from app.email.templates.experience_ready import build_experience_ready_email
from app.models.email_log import EmailLog
from app.models.experience import Experience
from app.repositories.email_log_repository import email_log_repository
from app.repositories.experience_repository import experience_repository
from app.schemas.delivery import DeliveryStatusResponse

logger = logging.getLogger(__name__)

MAX_ATTEMPTS = 3
BACKOFF_SECONDS = (1.0, 2.0, 4.0)

EMAIL_TYPE_EXPERIENCE_READY = "experience_ready"

# Future template registry — add receipt / reminder / etc. here.
EmailBuilder = Callable[..., tuple[str, str, str]]  # subject, html, text


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _as_dict(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    if hasattr(value, "model_dump"):
        return value.model_dump()
    return {}


class EmailService:
    def __init__(self, provider: EmailProvider | None = None) -> None:
        self._provider = provider

    @property
    def provider(self) -> EmailProvider:
        return self._provider or get_email_provider()

    def deliver_experience_ready(
        self,
        db: Session,
        experience_uuid: UUID,
        *,
        force: bool = False,
    ) -> DeliveryStatusResponse:
        """
        Send the post-publish experience email with automatic retries.
        Never called before publish — requires PUBLISHED status.
        """
        experience = self._require_published(db, experience_uuid)
        existing = email_log_repository.get_latest_for_experience(
            db, experience.id, email_type=EMAIL_TYPE_EXPERIENCE_READY
        )
        if existing and existing.status == EmailLogStatus.SENT and not force:
            return self._to_status(existing)

        recipient = self._validate_recipient(experience.customer_email)
        payload = self._build_experience_ready_payload(experience)

        log = existing
        if log is None or log.status == EmailLogStatus.SENT:
            log = EmailLog(
                experience_id=experience.id,
                recipient=recipient,
                subject=payload["subject"],
                provider=self.provider.provider_name,
                status=EmailLogStatus.PENDING,
                retry_count=0,
                email_type=EMAIL_TYPE_EXPERIENCE_READY,
                error=None,
                message_id=None,
                sent_at=None,
            )
            email_log_repository.add(db, log)
        else:
            log.recipient = recipient
            log.subject = payload["subject"]
            log.provider = self.provider.provider_name
            log.status = EmailLogStatus.PENDING
            log.error = None
            email_log_repository.save(db, log)

        db.commit()
        db.refresh(log)

        result = self._send_with_retries(
            db,
            log,
            EmailMessage(
                to=recipient,
                subject=payload["subject"],
                html=payload["html"],
                text=payload["text"],
                reply_to=settings.email_reply_to or None,
                tags={"email_type": EMAIL_TYPE_EXPERIENCE_READY, "experience": str(experience_uuid)},
            ),
        )
        return self._to_status(result)

    def retry_experience_ready(
        self,
        db: Session,
        experience_uuid: UUID,
    ) -> DeliveryStatusResponse:
        """Manual retry from the success screen."""
        return self.deliver_experience_ready(db, experience_uuid, force=True)

    def get_delivery_status(
        self,
        db: Session,
        experience_uuid: UUID,
    ) -> DeliveryStatusResponse:
        experience = experience_repository.get_by_uuid(db, experience_uuid)
        if experience is None:
            raise NotFoundException(
                "Experience not found.",
                code="experience_not_found",
            )
        log = email_log_repository.get_latest_for_experience(
            db, experience.id, email_type=EMAIL_TYPE_EXPERIENCE_READY
        )
        if log is None:
            return DeliveryStatusResponse(
                status="pending",
                pending=True,
                recipient_email=experience.customer_email,
                email_type=EMAIL_TYPE_EXPERIENCE_READY,
            )
        return self._to_status(log)

    def send_templated_email(
        self,
        db: Session,
        *,
        experience: Experience,
        email_type: str,
        to: str,
        subject: str,
        html: str,
        text: str,
    ) -> EmailLog:
        """
        Extension point for future emails (receipt, reminder, thank_you, …).
        """
        recipient = self._validate_recipient(to)
        log = EmailLog(
            experience_id=experience.id,
            recipient=recipient,
            subject=subject[:512],
            provider=self.provider.provider_name,
            status=EmailLogStatus.PENDING,
            retry_count=0,
            email_type=email_type,
        )
        email_log_repository.add(db, log)
        db.commit()
        db.refresh(log)
        return self._send_with_retries(
            db,
            log,
            EmailMessage(
                to=recipient,
                subject=subject,
                html=html,
                text=text,
                reply_to=settings.email_reply_to or None,
                tags={"email_type": email_type},
            ),
        )

    def _send_with_retries(
        self,
        db: Session,
        log: EmailLog,
        message: EmailMessage,
    ) -> EmailLog:
        last_error: str | None = None
        for attempt in range(MAX_ATTEMPTS):
            if attempt > 0:
                delay = BACKOFF_SECONDS[min(attempt - 1, len(BACKOFF_SECONDS) - 1)]
                logger.info(
                    "Email retry attempt=%s delay=%ss log_id=%s",
                    attempt + 1,
                    delay,
                    log.id,
                )
                time.sleep(delay)
                log.retry_count = int(log.retry_count or 0) + 1

            send_result: EmailSendResult = self.provider.send(message)
            if send_result.success:
                log.status = EmailLogStatus.SENT
                log.message_id = send_result.message_id
                log.sent_at = _utc_now()
                log.error = None
                email_log_repository.save(db, log)
                db.commit()
                db.refresh(log)
                logger.info(
                    "Email sent experience_id=%s message_id=%s attempts=%s",
                    log.experience_id,
                    log.message_id,
                    attempt + 1,
                )
                return log

            last_error = send_result.error or "Email send failed"
            log.error = last_error
            log.status = EmailLogStatus.FAILED
            email_log_repository.save(db, log)
            db.commit()
            logger.warning(
                "Email send failed attempt=%s experience_id=%s error=%s",
                attempt + 1,
                log.experience_id,
                last_error,
            )

        db.refresh(log)
        return log

    def _require_published(self, db: Session, experience_uuid: UUID) -> Experience:
        experience = experience_repository.get_by_uuid(db, experience_uuid)
        if experience is None:
            raise NotFoundException(
                "Experience not found.",
                code="experience_not_found",
            )
        if experience.status != ExperienceStatus.PUBLISHED:
            raise ValidationException(
                "Emails are only sent after an experience is published.",
                code="not_published",
            )
        if experience.published is None:
            raise ValidationException(
                "Published record is missing for this experience.",
                code="published_record_missing",
            )
        return experience

    def _validate_recipient(self, email: str | None) -> str:
        raw = (email or "").strip().lower()
        if not raw:
            raise ValidationException(
                "Customer email is required for delivery.",
                code="missing_recipient_email",
            )
        # Basic hardening before library validation
        if re.search(r"[\r\n]", raw):
            raise ValidationException(
                "Invalid recipient email.",
                code="invalid_recipient_email",
            )
        try:
            result = validate_email(raw, check_deliverability=False)
            return result.normalized
        except EmailNotValidError as exc:
            raise ValidationException(
                "Invalid recipient email.",
                code="invalid_recipient_email",
                details={"reason": str(exc)},
            ) from exc

    def _build_experience_ready_payload(self, experience: Experience) -> dict[str, str]:
        published = experience.published
        public_url = (
            (published.public_url if published else None)
            or f"{settings.PUBLIC_APP_URL.rstrip('/')}/e/{published.public_slug if published else ''}"
        )
        data = _as_dict(experience.experience_data)
        notes = _as_dict(_as_dict(data.get("metadata")).get("notes"))
        canonical = _as_dict(notes.get("canonical"))
        recipient = _as_dict(canonical.get("recipient"))
        general = _as_dict(data.get("general"))

        recipient_name = (
            str(recipient.get("name") or "").strip()
            or str(general.get("receiver_name") or "").strip()
            or "someone special"
        )
        customer_name = (experience.customer_name or "").strip() or "there"
        occasion = (experience.occasion or "").strip() or "a special occasion"

        gallery_urls = notes.get("gallery_urls")
        thumb = None
        if isinstance(gallery_urls, list) and gallery_urls:
            candidate = str(gallery_urls[0])
            if candidate.startswith("https://"):
                thumb = candidate

        content = build_experience_ready_email(
            customer_name=customer_name,
            recipient_name=recipient_name,
            occasion=occasion,
            public_url=public_url,
            support_email=settings.email_reply_to or "support@chronivs.com",
            preview_thumbnail_url=thumb,
        )
        return {
            "subject": content.subject,
            "html": content.html,
            "text": content.text,
        }

    def _to_status(self, log: EmailLog) -> DeliveryStatusResponse:
        status_value = log.status.value if hasattr(log.status, "value") else str(log.status)
        mapped = {
            "sent": "email_sent",
            "pending": "pending",
            "failed": "failed",
        }.get(status_value, status_value)
        return DeliveryStatusResponse(
            status=mapped,
            email_sent=mapped == "email_sent",
            pending=mapped == "pending",
            failed=mapped == "failed",
            recipient_email=log.recipient,
            provider=log.provider,
            message_id=log.message_id,
            sent_at=log.sent_at,
            error=log.error,
            retry_count=int(log.retry_count or 0),
            last_retry=int(log.retry_count or 0),
            email_type=log.email_type or EMAIL_TYPE_EXPERIENCE_READY,
        )


email_service = EmailService()
