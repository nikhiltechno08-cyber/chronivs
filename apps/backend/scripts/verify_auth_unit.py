"""Unit checks for auth crypto (no database required)."""

from __future__ import annotations

from app.auth.security import hash_password, verify_password
from app.auth.tokens import create_access_token, create_refresh_token, verify_token
from app.common.exceptions import UnauthorizedException


def main() -> None:
    password = "TestPass1"
    hashed = hash_password(password)
    assert hashed and not hashed.startswith(password)
    assert verify_password(password, hashed) is True
    assert verify_password("wrong-pass", hashed) is False

    subject = "11111111-1111-1111-1111-111111111111"
    access = create_access_token(subject)
    access_payload = verify_token(access, expected_type="access")
    assert access_payload["sub"] == subject
    assert access_payload["type"] == "access"

    refresh, jti, _ = create_refresh_token(subject)
    refresh_payload = verify_token(refresh, expected_type="refresh")
    assert refresh_payload["jti"] == jti

    try:
        verify_token(access, expected_type="refresh")
        raise AssertionError("Expected token type mismatch")
    except UnauthorizedException:
        pass

    try:
        verify_token("not.a.token", expected_type="access")
        raise AssertionError("Expected invalid token rejection")
    except UnauthorizedException:
        pass

    print("auth_unit_ok")


if __name__ == "__main__":
    main()
