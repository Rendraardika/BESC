#!/bin/bash
set -e

echo "========================================="
echo "  BESC SSL Setup Script"
echo "========================================="

DOMAIN="beschimbio.online"
EMAIL="admin@beschimbio.online"

# Navigate to project directory
cd /opt/BESC || { echo "ERROR: /opt/BESC not found"; exit 1; }

# Install certbot
echo "[1/6] Installing certbot..."
apt update && apt install -y certbot

# Stop frontend container (release port 80)
echo "[2/6] Stopping frontend container..."
docker compose stop frontend

# Generate SSL certificate
echo "[3/6] Generating SSL certificate for ${DOMAIN}..."
certbot certonly --standalone -d ${DOMAIN} --non-interactive --agree-tos --email ${EMAIL}

# Copy certs to project directory
echo "[4/6] Copying certificates..."
mkdir -p /opt/BESC/certs
cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem /opt/BESC/certs/
cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem /opt/BESC/certs/
chmod 644 /opt/BESC/certs/*.pem

# Update .env with new CORS
echo "[5/6] Updating CORS for HTTPS..."
sed -i "s|CORS_ALLOW_ORIGINS=.*|CORS_ALLOW_ORIGINS=http://${DOMAIN},https://${DOMAIN},http://187.124.137.134,https://187.124.137.134|" .env

# Restart everything with SSL
echo "[6/6] Restarting with SSL..."
docker compose --env-file .env up -d --build

echo ""
echo "========================================="
echo "  SSL Setup Complete!"
echo "========================================="
echo ""
echo "Website: https://${DOMAIN}"
echo ""
echo "Auto-renewal setup:"
echo "  Add to crontab: 0 0 1 * * certbot renew --quiet && cd /opt/BESC && cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem certs/ && cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem certs/ && docker compose restart frontend"
echo ""
