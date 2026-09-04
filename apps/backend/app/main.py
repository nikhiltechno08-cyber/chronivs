"""Chronivs FastAPI application entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # noqa: F401 — register ORM metadata
from app.api.exception_handlers import register_exception_handlers
from app.api.router import api_router
from app.api.routes import public_experiences
from app.common.constants import API_VERSION
from app.core.cloudinary import configure_cloudinary
from app.core.config import settings


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Validate Cloudinary + payment provider config on startup."""
    configure_cloudinary(require=True)
    settings.validate_payment_provider_config()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Chronivs backend API — authentication foundation",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(api_router, prefix=f"/api/{API_VERSION}")
# Spec: GET /e/{public_uuid} — public runtime payload (no draft leakage)
app.include_router(public_experiences.router, prefix="/e", tags=["public"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.APP_NAME}
