# Chronivs V2

AI-powered Digital Experience Platform — create cinematic digital experiences for birthdays, proposals, anniversaries, and future occasions.

## Tech Stack

| Layer    | Technologies                                                                 |
| -------- | ---------------------------------------------------------------------------- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion, GSAP, Lenis |
| Backend  | FastAPI, PostgreSQL, SQLAlchemy, JWT, Cloudinary, Razorpay                   |
| Tooling  | npm workspaces, ESLint, Prettier, Husky, lint-staged, commitlint             |

## Project Structure

```
chronivs-v2/
├── apps/
│   ├── frontend/          # Next.js application
│   └── backend/           # FastAPI application
├── packages/
│   ├── config/            # Shared ESLint, TypeScript, Tailwind configs
│   ├── shared/            # Shared types, schemas, constants
│   └── ui/                # Shared UI component library
├── docs/                  # Project documentation
├── scripts/               # Build & utility scripts
├── assets/                # Static assets
└── templates/             # Experience templates (future)
```

## Prerequisites

- Node.js >= 20
- npm >= 10
- Python >= 3.12
- PostgreSQL >= 15

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env
```

### 3. Set up Python backend

```bash
cd apps/backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -e ".[dev]"
```

### 4. Run development servers

```bash
# Frontend (port 3000)
npm run dev:frontend

# Backend (port 8000)
npm run dev:backend
```

The backend commands automatically use `apps/backend/.venv` when it exists.

## Available Scripts

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start frontend dev server            |
| `npm run dev:frontend`  | Start frontend dev server            |
| `npm run dev:backend`   | Start backend dev server             |
| `npm run start:backend` | Start backend without auto-reload    |
| `npm run test:backend`  | Run backend tests                    |
| `npm run build`         | Build all workspaces                 |
| `npm run lint`          | Lint all workspaces                  |
| `npm run format`        | Format code with Prettier            |
| `npm run typecheck`     | Type-check all TypeScript workspaces |

## Deployment entry points

- Frontend root: `apps/frontend`; build with `npm run build`, start with `npm run start`.
- Backend root: `apps/backend`; install with `pip install -r requirements.txt`, migrate with
  `alembic upgrade head`, and start with
  `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

Configure secrets in the hosting provider's encrypted environment settings. Never deploy or
commit `apps/backend/.env`.

- Frontend: set `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_API_URL` (including `/api/v1`).
- Backend core: set `DATABASE_URL`, `SECRET_KEY`, `PUBLIC_APP_URL`, and `CORS_ORIGINS`.
- Photos: set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
  `CLOUDINARY_API_SECRET`. Without these, the app still supports experiences without photos.
- Checkout: set `APP_ENV=production`, `PAYMENT_PROVIDER=razorpay`, `RAZORPAY_KEY_ID`, and
  `RAZORPAY_KEY_SECRET`. Production intentionally refuses mock payments.

See [`apps/backend/README.md`](./apps/backend/README.md) for backend configuration and
migration details.

## Documentation

See the [`docs/`](./docs/) directory:

- [CHRONIVS.md](./docs/CHRONIVS.md) — Project overview
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — System architecture
- [DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) — Design tokens & components
- [TEMPLATE_GUIDE.md](./docs/TEMPLATE_GUIDE.md) — Template authoring
- [STORY_GUIDE.md](./docs/STORY_GUIDE.md) — Story composition
- [ANIMATION_GUIDE.md](./docs/ANIMATION_GUIDE.md) — Animation patterns

## Conventions

- **Modular** — Everything lives in the right package
- **Strongly typed** — TypeScript + Zod on frontend, Pydantic on backend
- **Mobile first** — Responsive from the ground up
- **Performance first** — Optimized bundles, lazy loading, efficient animations
- **Accessibility first** — WCAG 2.1 AA compliance target

## License

Proprietary — All rights reserved.
