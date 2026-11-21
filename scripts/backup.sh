#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
stage="${1:-}"
case "$stage" in dev|rec|prod) ;; *) echo "Usage: bash scripts/backup.sh dev|rec|prod" >&2; exit 2;; esac
[[ -f ".env.$stage" ]] || { echo "Missing .env.$stage" >&2; exit 2; }
unset GL_DB_PASSWORD GL_AUTH_PASSWORD GL_TENANT_PASSWORD GL_PUBLIC_ORIGIN GL_HTTP_PORT COMPOSE_PROJECT_NAME
compose=(docker compose --env-file ".env.$stage" -p "guinee-logistique-$stage")
umask 077
dir="backups/$stage"
mkdir -p "$dir"
tmp=$(mktemp "$dir/.partial-$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")
trap 'rm -f -- "$tmp"' EXIT
"${compose[@]}" exec -T db pg_dump -U postgres -d guinee_logistique --format=custom > "$tmp"
test -s "$tmp"
"${compose[@]}" exec -T db pg_restore --list < "$tmp" > /dev/null
file="$dir/${tmp##*/.partial-}.dump"
mv -- "$tmp" "$file"
(cd "$dir" && sha256sum "${file##*/}" > "${file##*/}.sha256")
printf '%s\n' "$file"
