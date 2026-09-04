"""Users placeholder router — no business logic yet."""

from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_users() -> dict[str, str]:
    return {"status": "ok", "message": "Users endpoint placeholder"}


@router.get("/{user_uuid}")
def get_user(user_uuid: str) -> dict[str, str]:
    return {"status": "ok", "message": "User detail placeholder", "user_uuid": user_uuid}
