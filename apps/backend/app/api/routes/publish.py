"""Publish health / legacy mount — business publish is POST /experiences/{id}/publish."""

from fastapi import APIRouter

router = APIRouter()


@router.get("")
def publish_status() -> dict[str, str]:
    return {
        "status": "ok",
        "message": "Use POST /experiences/{id}/publish to publish a paid experience.",
    }
