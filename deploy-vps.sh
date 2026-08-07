#!/bin/bash
# ============================================
# BESC Auto Deploy Script
# Jalankan dari komputer lokal (Windows/Mac/Linux)
# Usage: bash deploy-vps.sh
# ============================================

VPS_IP="187.124.137.134"
VPS_USER="root"
PROJECT_DIR="/docker/besc"
REPO_URL="https://github.com/Rendraardika/BESC.git"

echo "=========================================="
echo "  BESC AUTO DEPLOY TO VPS"
echo "=========================================="
echo ""

# Step 1: Push dari lokal ke GitHub
echo "[1/5] Push code ke GitHub..."
cd "c:/Users/konta/BESC REAL 3 AGUSTUS" 2>/dev/null || cd "$(pwd)"
git add -A
git commit -m "deploy: update $(date +%Y-%m-%d_%H:%M)" || echo "Tidak ada perubahan untuk di-commit"
git push origin main || { echo "ERROR: Git push gagal!"; exit 1; }
echo "✅ Push berhasil!"
echo ""

# Step 2: Setup .env di VPS
echo "[2/5] Setup .env di VPS..."
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 64 | head -n 1)

ssh ${VPS_USER}@${VPS_IP} << DEPLOY_EOF
set -e

# Backup .env jika ada
if [ -f "${PROJECT_DIR}/.env" ]; then
    cp ${PROJECT_DIR}/.env /tmp/.env-backup-$(date +%s)
    echo "📦 .env backup disimpan"
fi

# Clone atau pull
if [ -d "${PROJECT_DIR}/.git" ]; then
    echo "📥 Git pull..."
    cd ${PROJECT_DIR}
    git fetch origin
    git reset --hard origin/main
    git clean -fd
else
    echo "📥 Clone fresh..."
    rm -rf ${PROJECT_DIR}
    git clone ${REPO_URL} ${PROJECT_DIR}
    cd ${PROJECT_DIR}
fi

# Buat .env jika belum ada atau kosong
if [ ! -f ".env" ] || ! grep -q "DB_PASSWORD" .env 2>/dev/null; then
    echo "📝 Membuat .env baru..."
    cat > .env << 'ENVEOF'
DB_PASSWORD=besc_secure_2026
JWT_SECRET=${JWT_SECRET_PLACEHOLDER}
CORS_ALLOW_ORIGINS=https://beschimbio.online,https://www.beschimbio.online
ENVEOF
    # Replace placeholder with actual secret
    sed -i "s|\${JWT_SECRET_PLACEHOLDER}|${JWT_SECRET}|" .env
    echo "✅ .env dibuat dengan JWT_SECRET random"
else
    echo "✅ .env sudah ada, menggunakan yang sudah ada"
fi

# Tampilkan isi .env (hide sensitive values)
echo "📋 Isi .env:"
cat .env | sed 's/JWT_SECRET=.*/JWT_SECRET=***HIDDEN***/' | sed 's/DB_PASSWORD=.*/DB_PASSWORD=***HIDDEN***/'

# Docker compose down & up
echo ""
echo "🐳 Docker compose down..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null

echo "🐳 Docker compose up --build..."
docker compose up -d --build 2>/dev/null || docker-compose up -d --build 2>/dev/null

echo ""
echo "⏳ Menunggu 20 detik untuk container ready..."
sleep 20

# Cek status
echo ""
echo "📊 Status Container:"
docker compose ps 2>/dev/null || docker-compose ps 2>/dev/null

echo ""
echo "📋 Backend logs (5 baris terakhir):"
docker compose logs backend --tail 5 2>/dev/null || docker-compose logs backend --tail 5 2>/dev/null

echo ""
echo "=========================================="
echo "  ✅ DEPLOY SELESAI!"
echo "  🌐 https://beschimbio.online"
echo "=========================================="

DEPLOY_EOF

echo ""
echo "=========================================="
echo "  ✅ DEPLOY SELESAI!"
echo "  🌐 Cek website: https://beschimbio.online"
echo "=========================================="
