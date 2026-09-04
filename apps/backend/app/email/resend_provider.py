"""Resend EmailProvider implementation."""

from __future__ import annotations

import logging
from typing import Any

import resend

from app.core.config import settings
from app.email.base import EmailMessage, EmailSendResult

logger = logging.getLogger(__name__)


class ResendProvider:
    provider_name = "resend"

    def __init__(
        self,
        *,
        api_key: str | None = None,
        from_address: str | None = None,
        client: Any | None = None,
    ) -> None:
        self._api_key = (api_key if api_key is not None else settings.resend_api_key).strip()
        self._from = (from_address if from_address is not None else settings.email_from).strip()
        self._client = client
        if client is None:
            settings.require_resend()
            resend.api_key = self._api_key

    def send(self, message: EmailMessage) -> EmailSendResult:
        payload: dict[str, Any] = {
            "from": self._from,
            "to": [message.to],
            "subject": message.subject,
            "html": message.html,
            "text": message.text,
        }
        reply_to = message.reply_to or settings.email_reply_to
        if reply_to:
            payload["reply_to"] = reply_to

        try:
            if self._client is not None:
                raw = self._client.Emails.send(payload)
            else:
                raw = resend.Emails.send(payload)

            if isinstance(raw, dict):
                message_id = str(raw.get("id") or "") or None
                data = raw
            else:
                message_id = str(getattr(raw, "id", "") or "") or None
                data = {"id": message_id}

            if not message_id:
                return EmailSendResult(
                    success=False,
                    error="Resend did not return a message id",
                    raw=data if isinstance(data, dict) else None,
                )

            logger.info("Resend email sent message_id=%s to=%s", message_id, message.to)
            return EmailSendResult(success=True, message_id=message_id, raw=data)
        except Exception as exc:  # noqa: BLE001 — provider boundary
            logger.exception("Resend send failed to=%s", message.to)
            return EmailSendResult(success=False, error=str(exc) or "Resend send failed")
