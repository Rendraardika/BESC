#!/bin/bash
set -e

echo "========================================="
echo "  BESC Update Script - BESC 2026"
echo "========================================="

# Navigate to project directory
cd /opt/BESC || { echo "ERROR: /opt/BESC not found."; exit 1; }

# Pull latest code
echo "[1/6] Pulling latest code..."
git pull origin main

# Stop old containers
echo "[2/6] Stopping old containers..."
docker compose down 2>/dev/null || true

# Create .env with correct VPS IP and domain
echo "[3/6] Creating .env file..."
VPS_IP=$(hostname -I | awk '{print $1}')
DOMAIN="beschimbio.online"
echo "   Detected VPS IP: $VPS_IP"

cat > .env << ENVEOF
MYSQL_ROOT_PASSWORD=BescSecureRoot2026!
DB_PASSWORD=BescSecureDb2026!
JWT_SECRET=besc2026productionsecretkeyminimum32chars!!
CORS_ALLOW_ORIGINS=http://${VPS_IP},https://${VPS_IP},http://${DOMAIN},https://${DOMAIN},http://www.${DOMAIN},https://www.${DOMAIN}
VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:-}
ENVEOF

echo "   CORS configured for: ${VPS_IP} and ${DOMAIN}"

# Build and start all services (rebuild to pick up new files)
echo "[4/6] Building and starting all containers..."
docker compose --env-file .env up -d --build

# Wait for services
echo "[5/6] Waiting for services..."
sleep 15

# Check status
echo "[6/6] Checking status..."
docker compose ps

echo ""
echo "=== Backend Logs (last 10 lines) ==="
docker compose logs backend --tail=10

echo ""
echo "========================================="
echo "  Update Complete!