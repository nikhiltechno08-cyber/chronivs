"""Root API router aggregating placeholder endpoints and auth."""

from fastapi import APIRouter

from app.admin.router import router as admin_router
from app.api.routes import (
    checkout,
    experiences,
    media,
    payments,
    public_experiences,
    public_runtime,
    publish,
    users,
)
from app.auth.router import router as auth_router

api_router = APIRouter()
api_router.include_router(admin_router)
api_router.include_router(auth_router)
api_router.include_router(checkout.router)
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(experiences.router, prefix="/experiences", tags=["experiences"])
api_router.include_router(media.router, prefix="/media", tags=["media"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(publish.router, prefix="/publish", tags=["publish"])
# Legacy alias; prefer /api/v1/public/{uuid}
api_router.include_router(public_experiences.router, prefix="/e", tags=["public-legacy"])
api_router.include_router(public_runtime.router, prefix="/public", tags=["public"])

