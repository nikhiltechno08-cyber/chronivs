"""
End-to-end auth API checks (requires migrated PostgreSQL).

Run:  python scripts/verify_auth_api.py
"""

from __future__ import annotations

import sys
import uuid

from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app

get_settings.cache_clear()


def main() -> int:
    client = TestClient(app)
    email = f"user_{uuid.uuid4().hex[:10]}@example.com"
    password = "SecurePass1"

    health = client.get("/api/v1/auth/health")
    assert health.status_code == 200, health.text

    register = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Auth Tester",
            "email": email,
            "password": password,
            "confirm_password": password,
        },
    )
    assert register.status_code == 201, register.text
    body = register.json()
    assert body["user"]["email"] == email
    assert "password" not in body["user"]
    assert "password_hash" not in body["user"]

    dup = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Auth Tester",
            "email": email,
            "password": password,
            "confirm_password": password,
        },
    )
    assert dup.status_code == 409, dup.text

    bad_login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "WrongPass1"},
    )
    assert bad_login.status_code == 401, bad_login.text

    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login.status_code == 200, login.text
    tokens = login.json()
    access = tokens["access_token"]
    refresh = tokens["refresh_token"]

    me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access}"},
    )
    assert me.status_code == 200, me.text
    assert me.json()["email"] == email

    rejected = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.value"},
    )
    assert rejected.status_code == 401, rejected.text

    refreshed = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
    assert refreshed.status_code == 200, refreshed.text
    new_refresh = refreshed.json()["refresh_token"]

    logout = client.post("/api/v1/auth/logout", json={"refresh_token": new_refresh})
    assert logout.status_code == 200, logout.text

    reuse = client.post("/api/v1/auth/refresh", json={"refresh_token": new_refresh})
    assert reuse.status_code == 401, reuse.text

    print("auth_api_ok")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"auth_api_failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
