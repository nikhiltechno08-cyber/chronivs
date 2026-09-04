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

## Available Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start frontend dev server            |
| `npm run dev:frontend` | Start frontend dev server          |
| `npm run dev:backend`  | Start backend dev server           |
| `npm run build`      | Build all workspaces                 |
| `npm run lint`       | Lint all workspaces                  |
| `npm run format`     | Format code with Prettier            |
| `npm run typecheck`  | Type-check all TypeScript workspaces |

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
