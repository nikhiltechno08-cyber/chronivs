"""Pillow-based image normalization before Cloudinary upload."""

from __future__ import annotations

import io
from dataclasses import dataclass

from PIL import Image, ImageOps

from app.common.exceptions import ValidationException


@dataclass(frozen=True, slots=True)
class ProcessedImage:
    """Normalized image bytes ready for Cloudinary upload."""

    content: bytes
    content_type: str
    format: str
    width: int
    height: int
    byte_size: int


_FORMAT_TO_CONTENT_TYPE = {
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "WEBP": "image/webp",
}

_CONTENT_TYPE_TO_FORMAT = {
    "image/jpeg": "JPEG",
    "image/jpg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WEBP",
}


def process_image(raw: bytes, *, content_type: str | None = None) -> ProcessedImage:
    """
    Auto-rotate via EXIF, strip metadata, and compress without resizing.

    Aspect ratio of the original pixels is preserved (no dimension changes).
    """
    if not raw:
        raise ValidationException(
            "Empty image payload",
            code="empty_image",
        )

    try:
        with Image.open(io.BytesIO(raw)) as image:
            image = ImageOps.exif_transpose(image)

            requested = (_CONTENT_TYPE_TO_FORMAT.get((content_type or "").lower()) or image.format or "JPEG").upper()
            if requested == "JPG":
                requested = "JPEG"
            if requested not in _FORMAT_TO_CONTENT_TYPE:
                requested = "JPEG"

            # Normalize modes for target codecs; drop ICC / EXIF by re-encoding.
            if requested == "JPEG":
                if image.mode in ("RGBA", "LA", "P"):
                    image = image.convert("RGB")
                elif image.mode != "RGB":
                    image = image.convert("RGB")
            elif requested == "PNG":
                if image.mode not in ("RGB", "RGBA", "L", "LA", "P"):
                    image = image.convert("RGBA")
            elif requested == "WEBP":
                if image.mode not in ("RGB", "RGBA"):
                    image = image.convert("RGBA" if "A" in image.getbands() else "RGB")

            width, height = image.size
            buffer = io.BytesIO()
            save_kwargs: dict = {"optimize": True}
            if requested == "JPEG":
                save_kwargs.update({"quality": 85, "progressive": True})
            elif requested == "WEBP":
                save_kwargs.update({"quality": 85, "method": 4})

            image.save(buffer, format=requested, **save_kwargs)
            content = buffer.getvalue()
    except ValidationException:
        raise
    except Exception as exc:  # noqa: BLE001 — map any decode failure to validation
        raise ValidationException(
            "Unable to process image. Upload a valid JPG, PNG, or WEBP file.",
            code="invalid_image",
        ) from exc

    return ProcessedImage(
        content=content,
        content_type=_FORMAT_TO_CONTENT_TYPE[requested],
        format=requested.lower() if requested != "JPEG" else "jpg",
        width=width,
        height=height,
        byte_size=len(content),
    )
