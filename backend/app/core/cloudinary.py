"""Cloudinary SDK configuration and low-level upload helpers (no business logic)."""

from __future__ import annotations

from typing import Any, BinaryIO

import cloudinary
import cloudinary.uploader
import cloudinary.utils

from app.core.config import settings

_configured = False


def configure_cloudinary(*, require: bool = True) -> None:
    """
    Initialize the Cloudinary SDK from application settings.

    Raises RuntimeError when credentials are missing and ``require`` is True.
    """
    global _configured

    if require:
        settings.require_cloudinary()
    elif settings.cloudinary_missing():
        _configured = False
        return

    cloudinary.config(
        cloud_name=settings.cloud_name,
        api_key=settings.api_key,
        api_secret=settings.api_secret,
        secure=True,
    )
    _configured = True


def ensure_cloudinary_configured() -> None:
    """Configure Cloudinary once per process (lazy-safe)."""
    global _configured
    if not _configured:
        configure_cloudinary(require=True)


def upload_file(
    file: BinaryIO | bytes,
    *,
    folder: str,
    public_id: str | None = None,
    resource_type: str = "image",
    extra_options: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Upload a binary payload to Cloudinary and return the raw API result."""
    ensure_cloudinary_configured()
    options: dict[str, Any] = {
        "folder": folder,
        "resource_type": resource_type,
        "overwrite": False,
        "unique_filename": True,
        "use_filename": True,
    }
    if public_id:
        options["public_id"] = public_id
    if extra_options:
        options.update(extra_options)
    return cloudinary.uploader.upload(file, **options)


def destroy_asset(public_id: str, *, resource_type: str = "image") -> dict[str, Any]:
    """Delete an asset from Cloudinary by public_id."""
    ensure_cloudinary_configured()
    return cloudinary.uploader.destroy(
        public_id,
        resource_type=resource_type,
        invalidate=True,
    )


def generate_public_url(
    public_id: str,
    *,
    resource_type: str = "image",
    quality: str = "auto",
    fetch_format: str = "auto",
) -> str:
    """Build a secure optimized delivery URL for a Cloudinary public_id."""
    ensure_cloudinary_configured()
    url, _ = cloudinary.utils.cloudinary_url(
        public_id,
        resource_type=resource_type,
        secure=True,
        quality=quality,
        fetch_format=fetch_format,
    )
    return url


def is_cloudinary_configured() -> bool:
    """Return True when Cloudinary credentials are present and SDK is configured."""
    if settings.cloudinary_missing():
        return False
    if not _configured:
        configure_cloudinary(require=False)
    return _configured
