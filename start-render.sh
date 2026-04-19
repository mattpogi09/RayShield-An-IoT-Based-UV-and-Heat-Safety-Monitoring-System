#!/usr/bin/env sh
set -eu

cd /var/www/html

if [ -z "${APP_KEY:-}" ]; then
  php artisan key:generate --force || true
fi

# Render Postgres can take a bit to become reachable on first deploy.
# Retry migrations to avoid failing the whole deployment too early.
MAX_RETRIES=20
RETRY_DELAY=5
ATTEMPT=1

until php artisan migrate --force; do
  if [ "$ATTEMPT" -ge "$MAX_RETRIES" ]; then
    echo "Migration failed after ${MAX_RETRIES} attempts."
    exit 1
  fi

  echo "Migration attempt ${ATTEMPT}/${MAX_RETRIES} failed. Retrying in ${RETRY_DELAY}s..."
  ATTEMPT=$((ATTEMPT + 1))
  sleep "$RETRY_DELAY"
done

php artisan optimize

exec php artisan serve --host 0.0.0.0 --port "${PORT:-10000}"
