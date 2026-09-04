#!/usr/bin/env bash
# Chronivs V2 — Development setup script
set -euo pipefail

echo "Installing npm dependencies..."
npm install

echo "Setting up frontend environment..."
if [ ! -f apps/frontend/.env.local ]; then
  cp apps/frontend/.env.example apps/frontend/.env.local
  echo "Created apps/frontend/.env.local"
fi

echo "Setting up backend environment..."
if [ ! -f apps/backend/.env ]; then
  cp apps/backend/.env.example apps/backend/.env
  echo "Created apps/backend/.env"
fi

echo "Setting up Python virtual environment..."
cd apps/backend
if [ ! -d .venv ]; then
  python -m venv .venv
fi

# shellcheck disable=SC1091
source .venv/bin/activate 2>/dev/null || source .venv/Scripts/activate
pip install -e ".[dev]"

echo "Setup complete."
