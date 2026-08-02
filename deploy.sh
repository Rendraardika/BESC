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
echo "[2/7] Stopping old containers..."
docker compose down 2>/dev/null || true

# Create .env with correct VPS IP and domain
echo "[3/7] Creating .env file..."
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

# Build and start all services
echo "[4/7] Building and starting all containers..."
docker compose --env-file .env up -d --build

# Wait for services
echo "[5/7] Waiting for services..."
sleep 10

# Check status
echo "[6/7] Checking status..."
docker compose ps

# Show backend logs
echo ""
echo "=== Backend Logs (last 5 lines) ==="
docker compose logs backend --tail=5

echo ""
echo "========================================="
echo "  Deployment Complete!"
echo "========================================="
echo ""
echo "Website: http://${VPS_IP}"
echo "Domain: http://${DOMAIN}"
echo ""
echo "Next steps:"
echo "  1. Register a new account"
echo "  2. To make admin, run:"
echo "     docker compose exec db mysql -u root -pBescSecureRoot2026! competition_platform -e \"UPDATE users SET role='admin' WHERE email='YOUR_EMAIL';\""
echo ""
echo "To enable Google login, add to .env:"
echo "  VITE_GOOGLE_CLIENT_ID=your-client-id"
echo "  Then rebuild: docker compose --env-file .env up -d --build frontend"
echo ""
