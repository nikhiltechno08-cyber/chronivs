"""Generic utility helpers shared across the backend."""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from pathlib import Path


def generate_uuid() -> uuid.UUID:
    """Return a new UUID4 value."""
    return uuid.uuid4()


def utc_now() -> datetime:
    """Return the current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def slugify(value: str) -> str:
    """
    Convert a string into a URL-safe slug.

    Lowercases, replaces non-alphanumeric characters with hyphens,
    and trims leading/trailing hyphens.
    """
    normalized = value.strip().lower()
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    return normalized.strip("-")


def generate_public_slug(prefix: str = "exp", length: int = 8) -> str:
    """
    Generate a short public slug suitable for published experiences.

    Example: ``exp-a1b2c3d4``
    """
    token = uuid.uuid4().hex[: max(length, 4)]
    safe_prefix = slugify(prefix) or "exp"
    return f"{safe_prefix}-{token}"


def safe_filename(filename: str) -> str:
    """
    Sanitize a filename by keeping only the basename and safe characters.
    """
    name = Path(filename).name
    name = re.sub(r"[^\w.\-]+", "_", name, flags=re.UNICODE)
    return name.strip("._") or "file"


def format_datetime(value: datetime, *, fmt: str = "%Y-%m-%dT%H:%M:%SZ") -> str:
    """
    Format a datetime as a UTC string.

    Naive datetimes are treated as UTC.
    """
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    else:
        value = value.astimezone(timezone.utc)
    return value.strftime(fmt)
