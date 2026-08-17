#!/bin/bash
# ============================================
# Script Restore Uploads (Foto Profil) ke VPS
# Jalankan dari komputer lokal di folder BESC:
#   bash restore-uploads.sh
# ============================================

VPS_IP="187.124.137.134"
VPS_USER="root"
LOCAL_UPLOADS="./backend/uploads"
VPS_UPLOADS_DIR="/opt/besc-uploads"

echo "=========================================="
echo "  RESTORE FOTO PROFIL KE VPS"
echo "=========================================="
echo ""

# Buat tar dari folder uploads lokal
echo "[1/4] Membuat arsip dari folder uploads lokal..."
tar -czf /tmp/besc_uploads_restore.tar.gz -C "$LOCAL_UPLOADS" .
echo "Arsip dibuat: /tmp/besc_uploads_restore.tar.gz"
echo ""

# Upload ke VPS
echo "[2/4] Upload arsip ke VPS..."
scp /tmp/besc_uploads_restore.tar.gz ${VPS_USER}@${VPS_IP}:/tmp/
echo "Upload selesai!"
echo ""

# Restore di VPS
echo "[3/4] Ekstrak di VPS ke ${VPS_UPLOADS_DIR}..."
ssh ${VPS_USER}@${VPS_IP} << 'VPSEOF'
mkdir -p /opt/besc-uploads
tar -xzf /tmp/besc_uploads_restore.tar.gz -C /opt/besc-uploads
echo "Ekstrak selesai!"
ls -la /opt/besc-uploads/public/avatars/ | head -10
echo "..."
echo "Total foto avatar: $(ls /opt/besc-uploads/public/avatars/ | wc -l)"
rm /tmp/besc_uploads_restore.tar.gz
VPSEOF
echo ""

# Cleanup lokal
rm /tmp/besc_uploads_restore.tar.gz

echo "[4/4] Selesai!"
echo ""
echo "=========================================="
echo "  RESTORE SELESAI!"
echo "  Cek foto di: https://beschimbio.online"
echo "=========================================="
