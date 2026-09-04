"""Global constants shared across the Chronivs backend."""

from typing import Final

API_VERSION: Final[str] = "v1"

DEFAULT_PAGE_SIZE: Final[int] = 20
MAX_PAGE_SIZE: Final[int] = 100

DEFAULT_TIMEZONE: Final[str] = "UTC"

# Upload limits in bytes.
UPLOAD_LIMITS: Final[dict[str, int]] = {
    "image": 15 * 1024 * 1024,  # 15 MB
    "audio": 25 * 1024 * 1024,  # 25 MB
    "video": 100 * 1024 * 1024,  # 100 MB
}

SUPPORTED_IMAGE_TYPES: Final[frozenset[str]] = frozenset(
    {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    }
)

SUPPORTED_IMAGE_EXTENSIONS: Final[frozenset[str]] = frozenset(
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }
)

# Cloudinary folder segments under CLOUDINARY_FOLDER_ROOT (e.g. chronivs/birthday).
ALLOWED_MEDIA_FOLDERS: Final[frozenset[str]] = frozenset(
    {
        "birthday",
        "proposal",
        "anniversary",
        "father",
        "mother",
        "girlfriend",
        "wife",
        "general",
    }
)

SUPPORTED_AUDIO_TYPES: Final[frozenset[str]] = frozenset(
    {
        "audio/mpeg",
        "audio/mp4",
        "audio/wav",
        "audio/webm",
        "audio/ogg",
    }
)

# Checkout pricing (INR) — Razorpay wiring comes in a later phase.
CHECKOUT_CURRENCY: Final[str] = "INR"
CHECKOUT_BASE_PRICE: Final[int] = 199
