#!/usr/bin/env bash
# Deploy / update asia26.ygouf.com on the VPS.
#
# Run this FROM THE REPO ROOT on the VPS (not from this sandbox — it has no
# outbound SSH). Idempotent: safe to re-run after `git pull` for updates.
#
# Usage:
#   ./deploy/deploy.sh            # build + (re)start the stack
#   ./deploy/deploy.sh --seed     # also load demo data (first deploy only)

set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "No .env found at repo root. Creating one with fresh random secrets..."
  ./deploy/generate-env.sh
  echo ""
  echo "Review .env before continuing (in particular CORS_ORIGIN), then re-run this script."
  exit 1
fi

echo "==> Pulling latest images / rebuilding..."
docker compose build

echo "==> Starting the stack (db, backend, frontend)..."
docker compose up -d

echo "==> Waiting for the API to become healthy..."
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:4000/health >/dev/null 2>&1; then
    echo "Backend is up."
    break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "Backend did not become healthy in time. Check: docker compose logs backend"
    exit 1
  fi
done

if [ "${1:-}" = "--seed" ]; then
  echo "==> Loading demo data (families, members, stopovers, flights, links, forum)..."
  docker compose exec backend npm run seed
fi

echo "==> Done. Containers:"
docker compose ps

cat <<'EOF'

Next step (one-time, or after editing /Caddyfile): point the host's Caddy
at this checkout's Caddyfile, then reload it:

  sudo ln -sf "$(pwd)/Caddyfile" /etc/caddy/sites-enabled/asia26.ygouf.com
  sudo caddy validate --config /etc/caddy/Caddyfile
  sudo systemctl reload caddy

(If your host Caddyfile doesn't use sites-enabled/*, see docs/DEPLOY.md
for how to `import` this file instead.)
EOF
