# Chronivs Backend

FastAPI + PostgreSQL + SQLAlchemy 2.0 + Alembic + Cloudinary media storage.

## Setup

```bash
cd apps/backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # or: cp .env.example .env
```

## Environment variables

Copy `.env.example` to `.env` and fill in values. Never commit real secrets.

```env
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@localhost:5432/chronivs
SECRET_KEY=CHANGE_ME
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Cloudinary (required — app will not start without these)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER_ROOT=chronivs
```

### Cloudinary setup

1. Create a Cloudinary account and project.
2. From the Cloudinary dashboard, copy **Cloud name**, **API Key**, and **API Secret**.
3. Paste them into your local `.env` (not into source code or git).
4. Optional: set `CLOUDINARY_FOLDER_ROOT` (default `chronivs`).

Uploads are stored under folders such as:

- `chronivs/birthday`
- `chronivs/proposal`
- `chronivs/anniversary`
- `chronivs/father`
- `chronivs/mother`
- `chronivs/general`

## Migrate

```bash
alembic upgrade head
```

## Run locally

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Health: `GET http://127.0.0.1:8000/health`
- Media health: `GET http://127.0.0.1:8000/api/v1/media/health`
- Docs: `http://127.0.0.1:8000/docs`
- API prefix: `/api/v1`

## Media API (Cloudinary)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/v1/media/health` | Cloudinary configuration status |
| POST | `/api/v1/media/upload` | Multipart image upload → Cloudinary + DB |
| POST | `/api/v1/media/test-upload` | Temporary test upload (same pipeline) |
| DELETE | `/api/v1/media/{id}` | Delete Cloudinary asset + DB row (UUID) |

### Upload rules

- Accepted: `jpg`, `jpeg`, `png`, `webp`
- Max size: **15MB**
- Images are auto-rotated, metadata-stripped, and compressed (no resize)
- Delivery URLs use Cloudinary `quality=auto` + `fetch_format=auto` (secure HTTPS)

### Example upload (curl)

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/media/upload" ^
  -F "file=@C:\path\to\photo.jpg" ^
  -F "folder=birthday"
```

Response shape:

```json
{
  "id": "<uuid>",
  "url": "https://res.cloudinary.com/...",
  "public_id": "chronivs/birthday/...",
  "width": 1200,
  "height": 800,
  "format": "jpg",
  "bytes": 123456
}
```

### Verify media pipeline

```bash
set PYTHONPATH=.
python scripts/verify_media_api.py
```

## Auth (Phase 3.2)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/v1/auth/health` | Auth module health |
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Issue access + refresh JWT |
| POST | `/api/v1/auth/refresh` | Rotate tokens |
| POST | `/api/v1/auth/logout` | Revoke refresh token |
| GET | `/api/v1/auth/me` | Protected — requires `Authorization: Bearer <access>` |

```bash
set PYTHONPATH=.
python scripts/verify_auth_unit.py
```

## Structure

```
apps/backend/
  app/
    api/          # routers + exception handlers
    auth/         # JWT auth (local) + OAuth-ready providers/
    common/       # shared constants, enums, utils
    core/         # settings + Cloudinary config helpers
    crud/         # CRUD scaffolding
    database/     # engine, session, Base
    models/       # SQLAlchemy models
    schemas/      # Pydantic schemas
    services/     # checkout, experience, media
    main.py
  alembic/
  alembic.ini
  main.py
  requirements.txt
  .env.example
```
