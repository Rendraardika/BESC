#!/bin/bash
set -e

# Ubah sesuai kebutuhan domain dan database
DOMAIN="beschimbio.online"
DB_NAME="competition_platform"
DB_USER="bescuser"
# DO NOT commit secrets to GitHub. Provide DB_PASSWORD and REPO_URL via environment
# when running the script, or edit them locally before running.
DB_PASSWORD=""
APP_DIR="/opt/besc-app"
REPO_URL=""
# Generate JWT_SECRET at runtime if not provided via environment
: "${JWT_SECRET:=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)}"

if [ -z "$REPO_URL" ]; then
  echo "Repo URL belum diatur. Set environment variable REPO_URL or edit the script before running."
  echo "Example: REPO_URL=\"https://github.com/username/repo.git\" DB_PASSWORD=\"yourpass\" sudo /path/to/deploy_beschimbio_online.sh"
  exit 1
fi

sudo apt update
sudo apt install -y git curl nginx mysql-server golang-go
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

sudo rm -rf "$APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo chown "$USER":"$USER" "$APP_DIR"
cd /opt
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" besc-app
else
  cd "$APP_DIR" && git pull
fi

cd "$APP_DIR/backend"
mkdir -p bin uploads/payments uploads/proctoring
# attempt to set ownership but do not fail if $USER is not set in this environment
sudo chown -R "$USER":"$USER" uploads || true

cat > "$APP_DIR/backend/.env" <<EOF
APP_ENV=production
APP_PORT=8080
APP_URL=https://$DOMAIN
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
JWT_SECRET=$JWT_SECRET
UPLOAD_DIR=uploads
CORS_ALLOW_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
GOOGLE_CLIENT_ID=
EOF

cd "$APP_DIR/backend"
go build -o bin/besc-api ./cmd/api

cd "$APP_DIR/frontend"
npm install
npm run build

sudo tee /etc/nginx/sites-available/besc.conf > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $APP_DIR/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias $APP_DIR/backend/uploads/;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/besc.conf /etc/nginx/sites-enabled/besc.conf
sudo nginx -t
sudo systemctl reload nginx

sudo tee /etc/systemd/system/besc-api.service > /dev/null <<EOF
[Unit]
Description=BESC API
After=network.target

[Service]
WorkingDirectory=$APP_DIR/backend
ExecStart=$APP_DIR/backend/bin/besc-api
Restart=always
RestartSec=5
User=root
EnvironmentFile=$APP_DIR/backend/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable besc-api
sudo systemctl restart besc-api
sudo systemctl status besc-api --no-pager

echo "Deployment selesai. Jika domain sudah mengarah, jalankan certbot untuk SSL."

echo "sudo apt install -y certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
