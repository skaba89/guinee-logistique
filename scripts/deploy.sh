#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
stage="${1:-}"
case "$stage" in dev|rec|prod) ;; *) echo "Usage: bash scripts/deploy.sh dev|rec|prod" >&2; exit 2;; esac
file=".env.$stage"
[[ -f "$file" ]] || { echo "Missing $file" >&2; exit 2; }
# Compose gives shell variables precedence over env files. Do not mix environments.
unset GL_DB_PASSWORD GL_AUTH_PASSWORD GL_TENANT_PASSWORD GL_PUBLIC_ORIGIN GL_HTTP_PORT COMPOSE_PROJECT_NAME
docker compose --env-file "$file" -p "guinee-logistique-$stage" config --quiet
compose=(docker compose --env-file "$file" -p "guinee-logistique-$stage")
"${compose[@]}" build app migrate
"${compose[@]}" up -d --wait db
existing=$("${compose[@]}" exec -T db psql -U postgres -d guinee_logistique -v ON_ERROR_STOP=1 -Atc "SELECT to_regclass('public._prisma_migrations') IS NOT NULL")
if [[ "$existing" == t ]]; then
  backup=$(bash scripts/backup.sh "$stage")
  echo "Backup: $backup"
  if [[ "$stage" == prod ]]; then bash scripts/verify-restore.sh "$backup"; fi
fi
"${compose[@]}" run --rm provision
"${compose[@]}" run --rm migrate
"${compose[@]}" up -d --no-deps --wait app
"${compose[@]}" ps
