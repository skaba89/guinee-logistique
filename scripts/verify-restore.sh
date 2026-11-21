#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
file="${1:-}"
[[ -f "$file" && -f "$file.sha256" ]] || { echo "Usage: bash scripts/verify-restore.sh path/to/backup.dump" >&2; exit 2; }
read -r expected _ < "$file.sha256"
[[ "$expected" =~ ^[a-f0-9]{64}$ ]] || { echo "Invalid checksum" >&2; exit 2; }
actual=$(sha256sum "$file")
[[ "${actual%% *}" == "$expected" ]] || { echo "Checksum mismatch" >&2; exit 1; }
# Never restore to any Compose database. A new isolated container has no network or host mounts.
container=$(docker run --rm -d --network none -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_DB=gl_restore_test postgres:16)
[[ "$container" =~ ^[a-f0-9]{64}$ ]] || exit 1
trap 'docker stop "$container" >/dev/null 2>&1 || true' EXIT
ready=false
for ((i=0;i<60;i++)); do
  if docker exec "$container" pg_isready -h 127.0.0.1 -U postgres -d gl_restore_test >/dev/null 2>&1; then ready=true; break; fi
  sleep 1
done
[[ "$ready" == true ]] || { echo "Restore database unavailable" >&2; exit 1; }
docker exec -i "$container" psql -U postgres -d gl_restore_test -v ON_ERROR_STOP=1 < prisma/saas/provision-role.sql
docker exec -i "$container" pg_restore -U postgres -d gl_restore_test --exit-on-error < "$file"
docker exec "$container" psql -U postgres -d gl_restore_test -v ON_ERROR_STOP=1 -Atc 'SELECT count(*) FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL' | grep -Eq '^[1-9][0-9]*$'
docker exec "$container" psql -U postgres -d gl_restore_test -v ON_ERROR_STOP=1 -Atc "SELECT 'organizations=' || count(*) FROM \"Organization\"; SELECT 'admins=' || count(*) FROM \"Membership\" WHERE role='admin';"
echo "Restauration isolée réussie"
