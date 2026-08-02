#!/bin/bash
set -e

echo "========================================="
echo "  BESC HTTPS Setup"
echo "========================================="

cd /opt/BESC

# Step 1: Install certbot
echo "[1/7] Installing certbot..."
apt update > /dev/null 2>&1
apt install -y certbot > /dev/null 2>&1

# Step 2: Stop frontend to free port 80
echo "[2/7] Stopping frontend..."
docker compose stop frontend

# Step 3: Generate SSL certificate
echo "[3/7] Generating SSL certificate..."
certbot certonly --standalone -d beschimbio.online --non-interactive --agree-tos --email admin@beschimbio.online

# Step 4: Create certs directory and copy certificates
echo "[4/7] Copying certificates..."
mkdir -p /opt/BESC/certs
cp /etc/letsencrypt/live/beschimbio.online/fullchain.pem /opt/BESC/certs/
cp /etc/letsencrypt/live/beschimbio.online/privkey.pem /opt/BESC/certs/
chmod 644 /opt/BESC/certs/*.pem

# Step 5: Create nginx SSL config
echo "[5/7] Creating nginx SSL config..."
cat > /opt/BESC/frontend/nginx-ssl.conf << 'NGINX'
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

# Step 6: Update docker-compose to mount certs
echo "[6/7] Updating docker-compose..."
# Add certs volume to frontend service
sed -i '/ports:/a\      - "443:443"\n    volumes:\n      - ./certs:/etc/nginx/certs:ro' docker-compose.yml
# Replace nginx config to use SSL version
sed -i 's|COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf|COPY frontend/nginx-ssl.conf /etc/nginx/conf.d/default.conf|' frontend/Dockerfile

# Step 7: Rebuild and restart
echo "[7/7] Rebuilding with SSL..."
docker compose --env-file .env up -d --build

echo ""
echo "========================================="
echo "  HTTPS Setup Complete!"
echo "========================================="
echo ""
echo "Website: https://beschimbio.online"
echo ""

# Setup auto-renewal
(crontab -l 2>/dev/null; echo "0 0 1 * * certbot renew --quiet --post-hook 'cp /etc/letsencrypt/live/beschimbio.online/fullchain.pem /opt/BESC/certs/ && cp /etc/letsencrypt/live/beschimbio.online/privkey.pem /opt/BESC/certs/ && cd /opt/BESC && docker compose restart frontend'") | crontab -
echo "Auto-renewal configured."
