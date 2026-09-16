#!/usr/bin/env bash
# Generates a root .env with strong random secrets, from .env.example.
# Run once on the VPS, from the repo root. Safe to inspect/edit afterwards.

set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  echo ".env already exists — not overwriting. Delete it first if you want to regenerate." >&2
  exit 1
fi

random() { openssl rand -hex "$1"; }

cp .env.example .env
sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$(random 24)/" .env
sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(random 48)/" .env

echo "Wrote .env with fresh POSTGRES_PASSWORD and JWT_SECRET."
echo "Double-check CORS_ORIGIN in .env matches https://asia26.ygouf.com"
