#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
stage="${1:-}"
origin="${2:-}"
case "$stage" in
  dev) port=8400 ;;
  rec) port=8401 ;;
  prod) port=8402 ;;
  *) echo "Usage: bash scripts/init-deploy-env.sh dev|rec|prod https://domain" >&2; exit 2 ;;
esac
[[ "$origin" =~ ^https://[a-zA-Z0-9.-]+(:[0-9]+)?$ ]] || { echo "HTTPS origin required (no trailing slash)" >&2; exit 2; }
file=".env.$stage"
umask 077
(set -o noclobber
 printf 'COMPOSE_PROJECT_NAME=guinee-logistique-%s\nGL_HTTP_PORT=%s\nGL_PUBLIC_ORIGIN=%s\nGL_DB_PASSWORD=%s\nGL_AUTH_PASSWORD=%s\nGL_TENANT_PASSWORD=%s\n' \
 "$stage" "$port" "$origin" "$(openssl rand -hex 32)" "$(openssl rand -hex 32)" "$(openssl rand -hex 32)" > "$file"
)
echo "Configuration created: $file"
