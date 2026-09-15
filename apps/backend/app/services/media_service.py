"""Media upload/delete service — Cloudinary + PostgreSQL orchestration."""

from __future__ import annotations

import logging
import mimetypes
from io import BytesIO
from pathlib import PurePosixPath
from typing import Any, BinaryIO, Sequence
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.constants import (
    ALLOWED_MEDIA_FOLDERS,
    SUPPORTED_IMAGE_EXTENSIONS,
    SUPPORTED_IMAGE_TYPES,
    UPLOAD_LIMITS,
)
from app.common.enums import MediaType, MediaUploadStatus
from app.common.exceptions import MediaException, NotFoundException, ValidationException
from app.core import cloudinary as cloudinary_core
from app.core.config import settings
from app.models.experience import Experience
from app.models.experience_media import ExperienceMedia
from app.services.image_processing import process_image

logger = logging.getLogger(__name__)

MAX_IMAGE_BYTES = UPLOAD_LIMITS["image"]


class MediaService:
    """Production media pipeline: validate → process → Cloudinary → PostgreSQL."""

    def resolve_folder(self, folder: str | None = None) -> str:
        """
        Build a Cloudinary folder path under the configured root.

        Example: chronivs/birthday
        """
        root = (settings.CLOUDINARY_FOLDER_ROOT or "chronivs").strip().strip("/")
        segment = (folder or "general").strip().strip("/").lower()
        if segment.startswith(f"{root.lower()}/"):
            segment = segment.split("/", 1)[1]
        if segment not in ALLOWED_MEDIA_FOLDERS:
            raise ValidationException(
                f"Invalid media folder '{folder}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_MEDIA_FOLDERS))}",
                code="invalid_media_folder",
            )
        return f"{root}/{segment}"

    def validate_image_upload(
        self,
        *,
        filename: str | None,
        content_type: str | None,
        size: int | None,
    ) -> tuple[str, str]:
        """Validate extension + MIME + size. Returns (normalized_ext, content_type)."""
        name = (filename or "").strip()
        if not name:
            raise ValidationException("Filename is required", code="missing_filename")

        ext = PurePosixPath(name).suffix.lower()
        if ext not in SUPPORTED_IMAGE_EXTENSIONS:
            raise ValidationException(
                f"Unsupported file type '{ext or 'unknown'}'. "
                "Allowed: jpg, jpeg, png, webp.",
                code="unsupported_extension",
            )

        guessed, _ = mimetypes.guess_type(name)
        mime = (content_type or guessed or "").split(";")[0].strip().lower()
        if mime == "image/jpg":
            mime = "image/jpeg"
        if mime not in SUPPORTED_IMAGE_TYPES and mime != "application/octet-stream":
            raise ValidationException(
                f"Unsupported MIME type '{mime or 'unknown'}'. "
                "Allowed: image/jpeg, image/png, image/webp.",
                code="unsupported_mime",
            )
        if mime == "application/octet-stream":
            mime = {
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".png": "image/png",
                ".webp": "image/webp",
            }[ext]

        if size is not None and size > MAX_IMAGE_BYTES:
            raise ValidationException(
                f"File exceeds maximum size of {MAX_IMAGE_BYTES // (1024 * 1024)}MB",
                code="file_too_large",
            )

        return ext, mime

    def generate_public_url(self, public_id: str, *, resource_type: str = "image") -> str:
        """Generate a secure auto-format / auto-quality Cloudinary delivery URL."""
        return cloudinary_core.generate_public_url(
            public_id,
            resource_type=resource_type,
            quality="auto",
            fetch_format="auto",
        )

    @staticmethod
    def _filename_from_content_type(content_type: str | None) -> str:
        mime = (content_type or "").split(";")[0].strip().lower()
        if mime == "image/jpg":
            mime = "image/jpeg"
        ext = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
        }.get(mime, ".jpg")
        return f"upload{ext}"

    def upload_image(
        self,
        db: Session,
        *,
        file: UploadFile | BinaryIO,
        filename: str | None = None,
        content_type: str | None = None,
        folder: str | None = None,
        experience_uuid: UUID | None = None,
        media_type: MediaType = MediaType.PHOTO,
        alt_text: str | None = None,
        display_order: int = 0,
    ) -> ExperienceMedia:
        """Validate, process, upload one image, and persist ExperienceMedia."""
        if not cloudinary_core.is_cloudinary_configured():
            missing = settings.cloudinary_missing()
            logger.warning("Media upload unavailable: missing Cloudinary configuration")
            raise MediaException(
                "Photo uploads are temporarily unavailable. You can continue without photos.",
                code="cloudinary_not_configured",
                details={"missing": missing},
            )

        upload_name = (filename or "").strip() or None
        upload_mime = content_type
        # Duck-type UploadFile: FastAPI/Starlette UploadFile classes are not always
        # interchangeable with isinstance() across package versions.
        file_name_attr = getattr(file, "filename", None)
        file_mime_attr = getattr(file, "content_type", None)
        if isinstance(file_name_attr, str) and file_name_attr.strip():
            upload_name = upload_name or file_name_attr.strip()
        if isinstance(file_mime_attr, str) and file_mime_attr.strip():
            upload_mime = upload_mime or file_mime_attr
        if not upload_name:
            # Some browsers omit Content-Disposition filename; derive from MIME.
            upload_name = self._filename_from_content_type(upload_mime)

        self.validate_image_upload(filename=upload_name, content_type=upload_mime, size=None)

        raw = self._read_upload_bytes(file)
        if len(raw) > MAX_IMAGE_BYTES:
            raise ValidationException(
                f"File exceeds maximum size of {MAX_IMAGE_BYTES // (1024 * 1024)}MB",
                code="file_too_large",
            )

        _, mime = self.validate_image_upload(
            filename=upload_name,
            content_type=upload_mime,
            size=len(raw),
        )
        processed = process_image(raw, content_type=mime)
        target_folder = self.resolve_folder(folder)
        experience_id = self._resolve_experience_id(db, experience_uuid)

        try:
            result = cloudinary_core.upload_file(
                BytesIO(processed.content),
                folder=target_folder,
                resource_type="image",
                extra_options={
                    "quality": "auto",
                    "fetch_format": "auto",
                },
            )
        except Exception as exc:  # noqa: BLE001
            logger.exception("Cloudinary upload failed for file=%s", upload_name)
            raise MediaException(
                "Failed to upload image to storage",
                code="cloudinary_upload_failed",
            ) from exc

        public_id = str(result.get("public_id") or "")
        secure_url = str(result.get("secure_url") or "")
        if not public_id or not secure_url:
            logger.error("Cloudinary upload returned incomplete payload: %s", result)
            raise MediaException(
                "Storage provider returned an incomplete upload response",
                code="cloudinary_incomplete_response",
            )

        optimized_url = self.generate_public_url(public_id, resource_type="image")
        delivery_url = optimized_url or secure_url

        media = ExperienceMedia(
            experience_id=experience_id,
            media_type=media_type,
            display_order=display_order,
            placeholder_url=delivery_url,
            file_url=delivery_url,
            secure_url=delivery_url,
            upload_status=MediaUploadStatus.UPLOADED,
            alt_text=alt_text,
            cloudinary_public_id=public_id,
            width=int(result.get("width") or processed.width),
            height=int(result.get("height") or processed.height),
            format=str(result.get("format") or processed.format),
            byte_size=int(result.get("bytes") or processed.byte_size),
            resource_type=str(result.get("resource_type") or "image"),
        )
        db.add(media)
        try:
            db.commit()
            db.refresh(media)
        except Exception:
            db.rollback()
            # Best-effort cleanup of the orphaned Cloudinary asset
            try:
                cloudinary_core.destroy_asset(public_id, resource_type="image")
            except Exception:  # noqa: BLE001
                logger.exception(
                    "Failed to roll back Cloudinary asset after DB error public_id=%s",
                    public_id,
                )
            logger.exception("Failed to persist media row for public_id=%s", public_id)
            raise MediaException(
                "Failed to save media record",
                code="media_persist_failed",
            )

        logger.info(
            "Media upload success id=%s public_id=%s bytes=%s",
            media.uuid,
            public_id,
            media.byte_size,
        )
        return media

    def upload_multiple_images(
        self,
        db: Session,
        *,
        files: Sequence[UploadFile],
        folder: str | None = None,
        experience_uuid: UUID | None = None,
        media_type: MediaType = MediaType.PHOTO,
    ) -> list[ExperienceMedia]:
        """Upload multiple images sequentially; stops on first hard failure."""
        uploaded: list[ExperienceMedia] = []
        for index, file in enumerate(files):
            media = self.upload_image(
                db,
                file=file,
                folder=folder,
                experience_uuid=experience_uuid,
                media_type=media_type,
                display_order=index,
            )
            uploaded.append(media)
        return uploaded

    def delete_image(self, db: Session, media_id: UUID | str | int) -> dict[str, Any]:
        """Delete Cloudinary asset and database row for a media id (UUID preferred)."""
        media = self._get_media(db, media_id)
        public_id = media.cloudinary_public_id
        resource_type = media.resource_type or "image"

        if public_id:
            try:
                result = cloudinary_core.destroy_asset(
                    public_id,
                    resource_type=resource_type,
                )
                # Cloudinary returns result=not found when already gone — treat as success.
                status = str(result.get("result") or "")
                if status not in {"ok", "not found"}:
                    logger.error(
                        "Unexpected Cloudinary destroy result public_id=%s result=%s",
                        public_id,
                        result,
                    )
                    raise MediaException(
                        "Failed to delete image from storage",
                        code="cloudinary_delete_failed",
                    )
            except MediaException:
                raise
            except Exception as exc:  # noqa: BLE001
                logger.exception("Cloudinary delete failed public_id=%s", public_id)
                raise MediaException(
                    "Failed to delete image from storage",
                    code="cloudinary_delete_failed",
                ) from exc

        media_uuid = media.uuid
        db.delete(media)
        try:
            db.commit()
        except Exception as exc:  # noqa: BLE001
            db.rollback()
            logger.exception("Failed to delete media row uuid=%s", media_uuid)
            raise MediaException(
                "Failed to delete media record",
                code="media_delete_failed",
            ) from exc

        logger.info("Media delete success id=%s public_id=%s", media_uuid, public_id)
        return {"id": str(media_uuid), "deleted": True, "public_id": public_id}

    def get_media(self, db: Session, media_id: UUID | str | int) -> ExperienceMedia:
        return self._get_media(db, media_id)

    def health(self) -> dict[str, Any]:
        configured = cloudinary_core.is_cloudinary_configured()
        missing = settings.cloudinary_missing()
        return {
            "status": "ok" if configured else "misconfigured",
            "cloudinary_configured": configured,
            "folder_root": settings.CLOUDINARY_FOLDER_ROOT or "chronivs",
            "missing_env": missing,
            "max_image_bytes": MAX_IMAGE_BYTES,
            "allowed_folders": sorted(ALLOWED_MEDIA_FOLDERS),
        }

    def _read_upload_bytes(self, file: UploadFile | BinaryIO) -> bytes:
        """
        Read upload bytes synchronously.

        Prefer the underlying SpooledTemporaryFile (``file.file``). Do not call
        ``UploadFile.read()`` here — in Starlette 1.x it is async and returns a coroutine.
        """
        stream = getattr(file, "file", None)
        if stream is not None and hasattr(stream, "read"):
            raw = stream.read(MAX_IMAGE_BYTES + 1)
            if hasattr(stream, "seek"):
                try:
                    stream.seek(0)
                except Exception:  # noqa: BLE001
                    pass
            return raw if isinstance(raw, (bytes, bytearray)) else bytes(raw)

        data = file.read(MAX_IMAGE_BYTES + 1)
        # Guard against accidentally calling async UploadFile.read() in sync code.
        if hasattr(data, "__await__"):
            raise MediaException(
                "Failed to read uploaded file",
                code="upload_read_failed",
            )
        return data if isinstance(data, (bytes, bytearray)) else bytes(data)

    def _resolve_experience_id(self, db: Session, experience_uuid: UUID | None) -> int | None:
        if experience_uuid is None:
            return None
        experience = db.scalars(select(Experience).where(Experience.uuid == experience_uuid)).first()
        if experience is None:
            raise NotFoundException(
                "Experience not found",
                code="experience_not_found",
                details={"experience_uuid": str(experience_uuid)},
            )
        return experience.id

    def _get_media(self, db: Session, media_id: UUID | str | int) -> ExperienceMedia:
        media: ExperienceMedia | None = None
        if isinstance(media_id, int) or (isinstance(media_id, str) and media_id.isdigit()):
            media = db.get(ExperienceMedia, int(media_id))
        else:
            try:
                media_uuid = media_id if isinstance(media_id, UUID) else UUID(str(media_id))
            except ValueError as exc:
                raise ValidationException(
                    "Invalid media id",
                    code="invalid_media_id",
                ) from exc
            media = db.scalars(
                select(ExperienceMedia).where(ExperienceMedia.uuid == media_uuid)
            ).first()

        if media is None:
            raise NotFoundException("Media not found", code="media_not_found")
        return media


media_service = MediaService()
