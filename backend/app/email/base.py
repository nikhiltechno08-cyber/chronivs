"""Gateway-agnostic email provider contract."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol


@dataclass(frozen=True)
class EmailMessage:
    to: str
    subject: str
    html: str
    text: str
    reply_to: str | None = None
    tags: dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True)
class EmailSendResult:
    success: bool
    message_id: str | None = None
    error: str | None = None
    raw: dict | None = None


class EmailProvider(Protocol):
    provider_name: str

    def send(self, message: EmailMessage) -> EmailSendResult: ...
