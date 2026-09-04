# Chronivs V2 — Development setup script (Windows)
$ErrorActionPreference = "Stop"

Write-Host "Installing npm dependencies..."
npm install

Write-Host "Setting up frontend environment..."
if (-not (Test-Path "apps/frontend/.env.local")) {
    Copy-Item "apps/frontend/.env.example" "apps/frontend/.env.local"
    Write-Host "Created apps/frontend/.env.local"
}

Write-Host "Setting up backend environment..."
if (-not (Test-Path "apps/backend/.env")) {
    Copy-Item "apps/backend/.env.example" "apps/backend/.env"
    Write-Host "Created apps/backend/.env"
}

Write-Host "Setting up Python virtual environment..."
Push-Location apps/backend
if (-not (Test-Path ".venv")) {
    python -m venv .venv
}
& .\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
Pop-Location

Write-Host "Setup complete."
