"""Reusable domain enumerations shared across models, schemas, and services."""

import enum


class ExperienceStatus(str, enum.Enum):
    """Lifecycle status for a Chronivs experience (single source of truth)."""

    DRAFT = "draft"
    PREVIEW_READY = "preview_ready"
    CHECKOUT_STARTED = "checkout_started"
    READY_FOR_PAYMENT = "ready_for_payment"
    PAYMENT_PENDING = "payment_pending"
    PAYMENT_SUCCESS = "payment_success"
    READY_TO_PUBLISH = "ready_to_publish"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    FAILED = "failed"

    # Legacy DB value from Phase 3 foundation — treated as payment_pending.
    PENDING_PAYMENT = "pending_payment"


class MediaType(str, enum.Enum):
    """Supported media kinds attached to an experience."""

    PHOTO = "photo"
    AUDIO = "audio"
    VIDEO = "video"
    COVER = "cover"


class MediaUploadStatus(str, enum.Enum):
    """Upload lifecycle for experience media (Cloudinary-backed)."""

    PLACEHOLDER = "placeholder"
    PENDING = "pending"
    UPLOADED = "uploaded"
    FAILED = "failed"


class PaymentStatus(str, enum.Enum):
    """Payment processing status (gateway-agnostic)."""

    CREATED = "created"
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

    # Legacy Phase 3 value — treat as SUCCESS in business logic.
    PAID = "paid"


class EmailStatus(str, enum.Enum):
    """Delivery status for outbound email logs."""

    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


# Backward-compatible alias used by existing ORM / schema imports.
EmailLogStatus = EmailStatus


class CheckoutStatus(str, enum.Enum):
    """Checkout session lifecycle (pre-payment)."""

    PENDING = "pending"
    READY_FOR_PAYMENT = "ready_for_payment"
    ABANDONED = "abandoned"
    COMPLETED = "completed"
