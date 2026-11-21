#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
stage="${1:-}"
case "$stage" in dev|rec|prod) ;; *) echo "Usage: bash scripts/bootstrap-admin.sh dev|rec|prod 'Entreprise' slug 'Administrateur' email" >&2; exit 2;; esac
[[ $# -eq 5 && -f ".env.$stage" ]] || { echo "Configuration ou arguments manquants" >&2; exit 2; }
unset GL_DB_PASSWORD GL_AUTH_PASSWORD GL_TENANT_PASSWORD GL_PUBLIC_ORIGIN GL_HTTP_PORT COMPOSE_PROJECT_NAME
shift
if [[ -t 0 ]]; then
  IFS= read -r -s -p 'Mot de passe administrateur (12–128 caractères) : ' secret
  printf '\n' >&2
else
  IFS= read -r secret
fi
trap 'unset secret' EXIT
printf '%s\n' "$secret" | docker compose --env-file ".env.$stage" -p "guinee-logistique-$stage" run --rm -T --no-deps migrate bun scripts/bootstrap-admin.ts "$@"
