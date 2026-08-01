 # Deployment guide (singkat)

 Panduan ringkas untuk men‑deploy aplikasi ke VPS (mis. Hostinger). Jalankan perintah di VPS setelah SSH masuk.

 1) Pastikan DNS
 - A record `@` -> VPS_IP
 - A record `www` -> VPS_IP

 2) Persiapan paket (jika belum terpasang)
 ```bash
 sudo apt update
 sudo apt install -y git curl nginx mysql-server golang-go
 curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
 sudo apt install -y nodejs
 ```

 3) Database
 ```bash
 sudo mysql -e "CREATE DATABASE IF NOT EXISTS competition_platform;"
 sudo mysql -e "CREATE USER IF NOT EXISTS 'bescuser'@'localhost' IDENTIFIED BY 'REPLACE_DB_PASSWORD';"
 sudo mysql -e "GRANT ALL PRIVILEGES ON competition_platform.* TO 'bescuser'@'localhost';"
 sudo mysql -e "FLUSH PRIVILEGES;"
 ```

 4) Ambil kode
 - Jika pakai Git: `sudo git clone <REPO_URL> /opt/besc-app`
 - Jika upload manual: tempatkan file di `/opt/besc-app`

 5) Buat file `.env` di `/opt/besc-app/backend` (isi `DB_PASSWORD` & `JWT_SECRET`)

 6) Build
 ```bash
 cd /opt/besc-app/backend
 go build -o bin/besc-api ./cmd/api
 cd /opt/besc-app/frontend
 npm install
 npm run build
 ```

 7) Nginx (contoh minimal)
 - Pasang file di `/etc/nginx/sites-available/besc.conf` yang menunjuk ke `/opt/besc-app/frontend/dist` dan proxy `/api/` ke `http://127.0.0.1:8080`.
 - Aktifkan dan reload:
 ```bash
 sudo ln -sf /etc/nginx/sites-available/besc.conf /etc/nginx/sites-enabled/besc.conf
 sudo nginx -t && sudo systemctl reload nginx
 ```

 8) Jalankan backend sebagai systemd service (contoh `/etc/systemd/system/besc-api.service`)
 ```bash
 sudo systemctl daemon-reload
 sudo systemctl enable --now besc-api
 sudo systemctl status besc-api --no-pager
 ```

 9) Pasang SSL (setelah DNS aktif)
 ```bash
 sudo apt install -y certbot python3-certbot-nginx
 sudo certbot --nginx -d beschimbio.online -d www.beschimbio.online
 ```

 10) Verifikasi
 ```bash
 curl -I http://127.0.0.1:8080/health
 # dan buka https://beschimbio.online di browser
 ```

 Catatan singkat:
 - Jangan commit rahasia (DB_PASSWORD, JWT_SECRET) ke GitHub.
 - Jika butuh, saya bantu buat `besc.conf` dan `besc-api.service` yang siap pakai.
