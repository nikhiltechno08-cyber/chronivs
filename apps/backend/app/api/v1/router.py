"""API v1 routes."""

from fastapi import APIRouter

api_router = APIRouter()

# Route modules will be registered here as features are built
# e.g. api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
