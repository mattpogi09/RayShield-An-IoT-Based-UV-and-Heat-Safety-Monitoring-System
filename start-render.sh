#!/usr/bin/env sh
set -eu

cd /var/www/html

# Ensure framework cache/session/view directories exist in container runtime.
mkdir -p \
  storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

# Guarantee APP_KEY is valid for AES-256-CBC even if env has a bad generated value.
APP_KEY_VALID=$(php -r '
  $k = getenv("APP_KEY") ?: "";
  if (str_starts_with($k, "base64:")) {
    $decoded = base64_decode(substr($k, 7), true);
    echo ($decoded !== false && (strlen($decoded) === 16 || strlen($decoded) === 32)) ? "1" : "0";
  } else {
    echo (strlen($k) === 16 || strlen($k) === 32) ? "1" : "0";
  }
');

if [ "${APP_KEY_VALID}" != "1" ]; then
  export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
  echo "APP_KEY was missing/invalid. Generated runtime key."
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

# Avoid failing startup on view cache path issues in container runtime.
php artisan config:cache
php artisan route:cache

exec php artisan serve --host 0.0.0.0 --port "${PORT:-10000}"
