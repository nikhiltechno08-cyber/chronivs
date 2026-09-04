"""Application settings loaded from environment variables."""

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the Chronivs backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = ""
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    APP_NAME: str = "Chronivs API"
    APP_VERSION: str = "0.1.0"
    # development | staging | production — mock payments are forbidden in production
    APP_ENV: str = "development"

    # Cloudinary — required for media upload/delete (validated at startup / first use)
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    CLOUDINARY_FOLDER_ROOT: str = "chronivs"

    # Payment provider: mock | razorpay (stripe/paypal later)
    PAYMENT_PROVIDER: str = "mock"
    # Mock-only outcome: success | failure | cancelled
    MOCK_PAYMENT_RESULT: str = "success"

    # Razorpay — KEY_SECRET must never be sent to clients
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # Public web app origin used to build published share URLs (no trailing slash)
    PUBLIC_APP_URL: str = "https://chronivs.com"

    # Comma-separated browser origins allowed to call the API (CORS).
    # Include both localhost and 127.0.0.1 in local dev — browsers treat them as different origins.
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Resend — API key never leaves the server
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "Chronivs <onboarding@resend.dev>"
    EMAIL_REPLY_TO: str = ""

    # Admin portal — credentials via environment only (never commit secrets)
    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD_HASH: str = ""
    ADMIN_SESSION_COOKIE_NAME: str = "chronivs_admin_session"
    ADMIN_SESSION_EXPIRE_HOURS: int = 8

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def app_env(self) -> str:
        return (self.APP_ENV or "development").strip().lower()

    @property
    def is_production(self) -> bool:
        return self.app_env in {"production", "prod"}

    @property
    def payment_provider(self) -> str:
        return (self.PAYMENT_PROVIDER or "mock").strip().lower()

    @property
    def mock_payment_result(self) -> str:
        value = (self.MOCK_PAYMENT_RESULT or "success").strip().lower()
        if value not in {"success", "failure", "cancelled"}:
            return "success"
        return value

    def validate_payment_provider_config(self) -> None:
        """Refuse unsafe mock payments in production."""
        provider = self.payment_provider
        if provider not in {"mock", "razorpay"}:
            raise RuntimeError(
                f"Unsupported PAYMENT_PROVIDER='{self.PAYMENT_PROVIDER}'. "
                "Supported: mock, razorpay"
            )
        if self.is_production and provider == "mock":
            raise RuntimeError(
                "PAYMENT_PROVIDER=mock is not allowed when APP_ENV=production. "
                "Use PAYMENT_PROVIDER=razorpay."
            )

    @property
    def cloud_name(self) -> str:
        return self.CLOUDINARY_CLOUD_NAME.strip()

    @property
    def razorpay_key_id(self) -> str:
        return self.RAZORPAY_KEY_ID.strip()

    @property
    def razorpay_key_secret(self) -> str:
        return self.RAZORPAY_KEY_SECRET.strip()

    @property
    def api_key(self) -> str:
        return self.CLOUDINARY_API_KEY.strip()

    @property
    def api_secret(self) -> str:
        return self.CLOUDINARY_API_SECRET.strip()

    @field_validator(
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
        "CLOUDINARY_FOLDER_ROOT",
        "RAZORPAY_KEY_ID",
        "RAZORPAY_KEY_SECRET",
        "RESEND_API_KEY",
        "EMAIL_FROM",
        "EMAIL_REPLY_TO",
        "PUBLIC_APP_URL",
        "CORS_ORIGINS",
        "APP_ENV",
        "PAYMENT_PROVIDER",
        "MOCK_PAYMENT_RESULT",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD_HASH",
        "ADMIN_SESSION_COOKIE_NAME",
        mode="before",
    )
    @classmethod
    def _strip_secrets(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

    def cloudinary_missing(self) -> list[str]:
        """Return names of missing Cloudinary environment variables."""
        missing: list[str] = []
        if not self.cloud_name:
            missing.append("CLOUDINARY_CLOUD_NAME")
        if not self.api_key:
            missing.append("CLOUDINARY_API_KEY")
        if not self.api_secret:
            missing.append("CLOUDINARY_API_SECRET")
        return missing

    def require_cloudinary(self) -> None:
        """Raise a clear startup/runtime error when Cloudinary is not configured."""
        missing = self.cloudinary_missing()
        if missing:
            raise RuntimeError(
                "Cloudinary is not configured. Set these environment variables: "
                + ", ".join(missing)
            )

    def razorpay_missing(self) -> list[str]:
        missing: list[str] = []
        if not self.razorpay_key_id:
            missing.append("RAZORPAY_KEY_ID")
        if not self.razorpay_key_secret:
            missing.append("RAZORPAY_KEY_SECRET")
        return missing

    def require_razorpay(self) -> None:
        missing = self.razorpay_missing()
        if missing:
            raise RuntimeError(
                "Razorpay is not configured. Set these environment variables: "
                + ", ".join(missing)
            )

    @property
    def resend_api_key(self) -> str:
        return self.RESEND_API_KEY.strip()

    @property
    def email_from(self) -> str:
        return self.EMAIL_FROM.strip()

    @property
    def email_reply_to(self) -> str:
        return self.EMAIL_REPLY_TO.strip()

    def resend_missing(self) -> list[str]:
        missing: list[str] = []
        if not self.resend_api_key:
            missing.append("RESEND_API_KEY")
        if not self.email_from:
            missing.append("EMAIL_FROM")
        return missing

    def require_resend(self) -> None:
        missing = self.resend_missing()
        if missing:
            raise RuntimeError(
                "Resend is not configured. Set these environment variables: "
                + ", ".join(missing)
            )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
