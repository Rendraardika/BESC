#!/bin/bash
set -e

echo "========================================="
echo "  BESC Deployment Script"
echo "========================================="

# Navigate to project directory
cd /opt/BESC || { echo "ERROR: /opt/BESC not found. Run: git clone https://github.com/Rendraardika/BESC.git /opt/BESC"; exit 1; }

# Pull latest code
echo "[1/6] Pulling latest code..."
git pull origin main

# Stop old containers and remove volumes
echo "[2/6] Stopping old containers and resetting database..."
docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true

# Create .env if not exists
if [ ! -f .env ]; then
  echo "[3/6] Creating .env file..."
  cat > .env << 'ENVEOF'
MYSQL_ROOT_PASSWORD=BescSecureRoot2026!
DB_PASSWORD=BescSecureDb2026!
JWT_SECRET=besc2026productionsecretkeyminimum32chars!!
CORS_ALLOW_ORIGINS=http://srv1872078.hstgr.cloud,https://srv1872078.hstgr.cloud
ENVEOF
  echo "   .env file created with secure passwords."
else
  echo "[3/6] .env file already exists, keeping current."
fi

# Show .env (without passwords)
echo "   Current CORS setting: $(grep CORS_ALLOW_ORIGINS .env)"

# Build and start
echo "[4/6] Building and starting containers..."
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# Wait for backend to be ready
echo "[5/6] Waiting for backend to be ready..."
sleep 10

# Check status
echo "[6/6] Checking status..."
docker compose -f docker-compose.prod.yml ps

# Test API
echo ""
echo "Testing backend API..."
BACKEND_RESPONSE=$(docker compose -f docker-compose.prod.yml exec -T backend wget -q -O- http://localhost:8080/api/v1/competitions 2>/dev/null || echo "FAILED")
if echo "$BACKEND_RESPONSE" | grep -q "success\|data"; then
  echo "✅ Backend API is working!"
else
  echo "⚠️  Backend might still be starting. Check logs with:"
  echo "   docker compose -f docker-compose.prod.yml logs backend --tail=20"
fi

echo ""
echo "========================================="
echo "  Deployment Complete!"
echo "========================================="
echo ""
echo "Website: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "To create admin account:"
echo "  1. Register at the website"
echo "  2. Then run:"
echo "     docker compose -f docker-compose.prod.yml exec db mysql -u root -pBescSecureRoot2026! competition_platform -e \"UPDATE users SET role='admin' WHERE email='YOUR_EMAIL';\""
echo ""
