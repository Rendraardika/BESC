#!/bin/bash
set -e

echo "========================================="
echo "  BESC HTTPS Setup"
echo "========================================="

cd /opt/BESC

# Step 1: Install certbot
echo "[1/5] Installing certbot..."
apt update -qq > /dev/null 2>&1
apt install -y -qq certbot > /dev/null 2>&1
echo "   Done."

# Step 2: Stop frontend to free port 80
echo "[2/5] Stopping frontend container..."
docker compose stop frontend
echo "   Done."

# Step 3: Generate SSL certificate
echo "[3/5] Generating SSL certificate (may take 30-60 seconds)..."
certbot certonly --standalone -d beschimbio.online --non-interactive --agree-tos --email admin@beschimbio.online
echo "   Done."

# Step 4: Copy certificates
echo "[4/5] Setting up certificates..."
mkdir -p /opt/BESC/certs
cp /etc/letsencrypt/live/beschimbio.online/fullchain.pem /opt/BESC/certs/
cp /etc/letsencrypt/live/beschimbio.online/privkey.pem /opt/BESC/certs/
chmod 644 /opt/BESC/certs/*.pem
echo "   Done."

# Step 5: Create SSL nginx config and inject into container
echo "[5/5] Configuring nginx for HTTPS..."

# Create SSL nginx config
cat > /tmp/nginx-ssl.conf << 'EOF'
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    root /usr/share/nginx/html;
    index index.html;
    client_max_body_size 10M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Start frontend with certs volume
docker compose up -d frontend

# Wait for container to start
sleep 3

# Copy SSL config into running container
CONTAINER_ID=$(docker compose ps -q frontend)
docker cp /tmp/nginx-ssl.conf ${CONTAINER_ID}:/etc/nginx/conf.d/default.conf
docker cp /opt/BESC/certs ${CONTAINER_ID}:/etc/nginx/certs

# Reload nginx inside container
docker compose exec frontend nginx -s reload

echo "   Done."

# Setup auto-renewal
echo "Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 0 1 * * certbot renew --quiet --post-hook 'cp /etc/letsencrypt/live/beschimbio.online/fullchain.pem /opt/BESC/certs/ && cp /etc/letsencrypt/live/beschimbio.online/privkey.pem /opt/BESC/certs/ && docker compose -f /opt/BESC/docker-compose.yml exec frontend nginx -s reload'" 2>/dev/null) | crontab - 2>/dev/null || true

echo ""
echo "========================================="
echo "  HTTPS Setup Complete!"
echo "========================================="
echo ""
echo "Website: https://beschimbio.online"
echo ""
