"""Media-service guards for optional Cloudinary integration."""

from io import BytesIO

import pytest

from app.api.exception_handlers import _status_for
from app.common.exceptions import MediaException
from app.services.media_service import MediaService


def test_upload_returns_actionable_error_when_cloudinary_is_unavailable(monkeypatch):
    monkeypatch.setattr(
        "app.core.cloudinary.is_cloudinary_configured",
        lambda: False,
    )
    service = MediaService()

    with pytest.raises(MediaException) as exc:
        service.upload_image(
            object(),
            file=BytesIO(b"not-read-when-storage-is-unavailable"),
            filename="photo.jpg",
            content_type="image/jpeg",
        )

    assert exc.value.code == "cloudinary_not_configured"
    assert "continue without photos" in exc.value.message
    assert _status_for(exc.value) == 503
