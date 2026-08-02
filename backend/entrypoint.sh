#!/bin/sh
set -e

echo "Waiting for MySQL to be ready..."
until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  echo "MySQL is not ready yet. Waiting..."
  sleep 2
done

echo "MySQL is ready. Starting backend..."
exec /app/besc-api
