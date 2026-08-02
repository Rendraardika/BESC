#!/bin/bash
set -e

echo "========================================="
echo "  BESC Deployment Script"
echo "========================================="

# Navigate to project directory
cd /opt/BESC || { echo "ERROR: /opt/BESC not found. Run: git clone https://github.com/Rendraardika/BESC.git /opt/BESC"; exit 1; }

# Pull latest code
echo "[1/7] Pulling latest code..."
git pull origin main

# Stop old containers and remove volumes
echo "[2/7] Stopping old containers and resetting database..."
docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true

# Create .env with correct VPS IP
echo "[3/7] Creating .env file..."
VPS_IP=$(hostname -I | awk '{print $1}')
echo "   Detected VPS IP: $VPS_IP"

cat > .env << ENVEOF
MYSQL_ROOT_PASSWORD=BescSecureRoot2026!
DB_PASSWORD=BescSecureDb2026!
JWT_SECRET=besc2026productionsecretkeyminimum32chars!!
CORS_ALLOW_ORIGINS=http://${VPS_IP},https://${VPS_IP},http://localhost,http://127.0.0.1
ENVEOF

echo "   CORS configured for: http://${VPS_IP}"

# Build and start all services
echo "[4/7] Building and starting all containers..."
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# Wait for MySQL to be healthy
echo "[5/7] Waiting for MySQL to be healthy..."
sleep 15

# Wait for backend to start
echo "[6/7] Waiting for backend to start..."
sleep 10

# Check status
echo "[7/7] Checking status..."
docker compose -f docker-compose.prod.yml ps

# Show backend logs
echo ""
echo "=== Backend Logs (last 10 lines) ==="
docker compose -f docker-compose.prod.yml logs backend --tail=10

echo ""
echo "========================================="
echo "  Deployment Complete!"
echo "========================================="
echo ""
echo "Website: http://${VPS_IP}"
echo ""
echo "Next steps:"
echo "  1. Open http://${VPS_IP} in your browser"
echo "  2. Register a new account"
echo "  3. To make admin, run:"
echo "     docker compose -f docker-compose.prod.yml exec db mysql -u root -pBescSecureRoot2026! competition_platform -e \"UPDATE users SET role='admin' WHERE email='YOUR_EMAIL';\""
echo ""
