#!/usr/bin/env sh
set -eu

cd /var/www/html

if [ -z "${APP_KEY:-}" ]; then
  php artisan key:generate --force || true
fi

php artisan migrate --force
php artisan optimize

exec php artisan serve --host 0.0.0.0 --port "${PORT:-10000}"
