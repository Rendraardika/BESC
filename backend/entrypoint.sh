#!/bin/sh
set -e

echo "Waiting for MySQL to be ready..."
MAX_RETRIES=30
RETRY=0
until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  RETRY=$((RETRY + 1))
  if [ $RETRY -ge $MAX_RETRIES ]; then
    echo "ERROR: MySQL not ready after $MAX_RETRIES attempts. Starting anyway..."
    break
  fi
  echo "MySQL not ready yet. Attempt $RETRY/$MAX_RETRIES..."
  sleep 1
done

echo "Running database avatar migrations..."
/app/migrate-avatars || true

echo "Starting backend..."
exec /app/besc-api
