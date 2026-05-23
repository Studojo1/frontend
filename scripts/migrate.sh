#!/bin/sh
# Apply pending SQL migrations from /src/drizzle/*.sql against $DATABASE_URL.
#
# Idempotent: tracks applied filenames in a applied_drizzle_migrations table so each
# file runs exactly once across all deploys. Each migration is wrapped in a
# transaction along with its tracking insert, so a failure leaves the DB and
# the tracking table in sync.
#
# Used by the Kubernetes Job created by deploy.yml / deploy-staging.yml.
# Fails fast on any SQL error (psql ON_ERROR_STOP=1 + shell set -e), which
# causes the GitHub Actions migrate step to fail and blocks the deploy step
# from promoting a new image.
set -eu

MIGRATIONS_DIR="${MIGRATIONS_DIR:-/src/drizzle}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[migrate] FATAL: DATABASE_URL is not set" >&2
  exit 1
fi

# Print the URL with the password masked so the workflow logs are useful
# without leaking credentials.
masked=$(echo "$DATABASE_URL" | sed -E 's|(://[^:]+:)[^@]+(@)|\1****\2|')
echo "[migrate] target: $masked"
echo "[migrate] migrations dir: $MIGRATIONS_DIR"

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'EOSQL'
CREATE TABLE IF NOT EXISTS applied_drizzle_migrations (
  filename   TEXT PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT now()
);
EOSQL

applied=0
skipped=0

# Lexicographic sort matches drizzle's NNNN_ prefix ordering. Glob returns the
# pattern literally if no files match, so guard with a presence check.
if [ -d "$MIGRATIONS_DIR" ]; then
  files=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null || true)
else
  files=""
fi

if [ -z "$files" ]; then
  echo "[migrate] no SQL files found in $MIGRATIONS_DIR"
  exit 0
fi

for file in $(echo "$files" | sort); do
  base=$(basename "$file")
  already=$(psql "$DATABASE_URL" -tAc "SELECT 1 FROM applied_drizzle_migrations WHERE filename = '$base'")

  if [ "$already" = "1" ]; then
    echo "[migrate] SKIP  $base (already applied)"
    skipped=$((skipped + 1))
    continue
  fi

  echo "[migrate] APPLY $base"
  # Wrap the file's SQL and the tracking insert in a single transaction. If
  # any statement errors, the whole migration rolls back including the
  # tracking row, so the next run will retry.
  psql "$DATABASE_URL" \
    -v ON_ERROR_STOP=1 \
    --single-transaction \
    -f "$file" \
    -c "INSERT INTO applied_drizzle_migrations (filename) VALUES ('$base')"
  applied=$((applied + 1))
done

echo "[migrate] done. applied=$applied skipped=$skipped"
