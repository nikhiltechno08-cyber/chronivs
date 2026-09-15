"""Smoke-test Cloudinary media health, upload, and delete endpoints.

Requires:
- migrated database
- Cloudinary env vars in apps/backend/.env
- API server running on 127.0.0.1:8000  OR pass --direct for in-process TestClient

Usage:
  set PYTHONPATH=.
  python scripts/verify_media_api.py
"""

from __future__ import annotations

import io
import os
import sys
from pathlib import Path

import httpx
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

BASE = os.environ.get("CHRONIVS_API_BASE", "http://127.0.0.1:8000")


def _tiny_jpeg() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (64, 48), color=(230, 193, 90)).save(buffer, format="JPEG", quality=85)
    return buffer.getvalue()


def main() -> int:
    jpeg = _tiny_jpeg()
    with httpx.Client(base_url=BASE, timeout=60.0) as client:
        health = client.get("/api/v1/media/health")
        health.raise_for_status()
        body = health.json()
        print("media health:", body)
        if not body.get("cloudinary_configured"):
            print("FAIL: Cloudinary is not configured")
            return 1

        upload = client.post(
            "/api/v1/media/upload",
            files={"file": ("verify.jpg", jpeg, "image/jpeg")},
            data={"folder": "general"},
        )
        if upload.status_code >= 400:
            print("UPLOAD FAIL:", upload.status_code, upload.text)
            return 1
        payload = upload.json()
        print("upload:", payload)
        url = payload.get("url")
        media_id = payload.get("id")
        if not url or not media_id:
            print("FAIL: missing url/id in upload response")
            return 1

        probe = client.get(url, follow_redirects=True)
        print("url status:", probe.status_code, "content-type:", probe.headers.get("content-type"))
        if probe.status_code >= 400:
            print("FAIL: uploaded URL did not open")
            return 1

        deleted = client.delete(f"/api/v1/media/{media_id}")
        if deleted.status_code >= 400:
            print("DELETE FAIL:", deleted.status_code, deleted.text)
            return 1
        print("delete:", deleted.json())
        print("OK — media pipeline verified")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
