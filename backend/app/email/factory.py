"""Resolve the active email provider (Resend today; SES/etc. later)."""

from __future__ import annotations

from functools import lru_cache

from app.email.base import EmailProvider
from app.email.resend_provider import ResendProvider


@lru_cache
def get_email_provider() -> EmailProvider:
    return ResendProvider()
