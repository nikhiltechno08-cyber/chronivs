"""Email provider adapters — swap Resend for another vendor without changing EmailService."""

from app.email.base import EmailMessage, EmailProvider, EmailSendResult
from app.email.factory import get_email_provider

__all__ = ["EmailMessage", "EmailProvider", "EmailSendResult", "get_email_provider"]
