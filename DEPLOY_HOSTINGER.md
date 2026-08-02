# Panduan Deployment ke Hostinger VPS dengan Docker

## Prasyarat
- Hostinger VPS dengan OS Ubuntu/Debian
- Docker & Docker Compose sudah terinstall (biasanya sudah ada di Hostinger VPS)

---

## Cara 1: Deploy via Hostinger Docker Manager (GUI Panel)

### Langkah 1: Upload Source Code
Buka **Konsol Web** di Hostinger panel, lalu jalankan:
```bash
cd /opt
git clone https://github.com/Rendraardika/BESC.git
cd BESC
```

### Langkah 2: Set Environment Variables
Di Docker Manager panel Hostinger:
1. Klik **Kredensial** di sidebar kiri
2. Tambahkan environment variables berikut:

| Key | Value |
|-----|-------|
| `MYSQL_ROOT_PASSWORD` | (buat password yang kuat) |
| `DB_PASSWORD` | (buat password yang kuat, beda dari MYSQL_ROOT_PASSWORD) |
| `JWT_SECRET` | (minimal 32 karakter, random string) |
| `CORS_ALLOW_ORIGINS` | https://domain-anda.com,http://domain-anda.com |
| `APP_ENV` | production |
| `APP_PORT` | 8080 |
| `DB_HOST` | db |
| `DB_PORT` | 3306 |
| `DB_USER` | bescuser |
| `DB_NAME` | competition_platform |
| `UPLOAD_DIR` | uploads |
| `VITE_GOOGLE_CLIENT_ID` | (opsional, kosongkan jika tidak pakai) |

**⚠️ PENTING:**
- `JWT_SECRET` harus minimal 32 karakter dan bukan placeholder
- `CORS_ALLOW_ORIGINS` harus diisi dengan domain VPS Anda (bukan `*`)
- `DB_PASSWORD` harus diisi password yang kuat

### Langkah 3: Buat File .env
Di **Konsol Web** Hostinger:
```bash
cd /opt/BESC
cat > .env << 'EOF'
MYSQL_ROOT_PASSWORD=password_kuat_anda
DB_PASSWORD=password_db_kuat_anda
JWT_SECRET=apa_saja_yang_panjang_minimal_32_karakter_acak
CORS_ALLOW_ORIGINS=http://IP_VPS_ANDA,https://IP_VPS_ANDA
EOF
```

### Langkah 4: Build & Deploy
Di Docker Manager Hostinger:
1. Klik **Compose** → **Deploy new stack**
2. Pilih **Upload file** atau **Paste compose YAML**
3. Upload `docker-compose.prod.yml` atau paste isi filenya
4. Klik **Deploy**

**Atau via Konsol Web:**
```bash
cd /opt/BESC
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

### Langkah 5: Cek Status
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs db
```

---

## Cara 2: Deploy via SSH (Command Line)

### 1. SSH ke VPS
```bash
ssh root@IP_VPS_ANDA
```

### 2. Install Docker (jika belum)
```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker
```

### 3. Clone Repository
```bash
cd /opt
git clone https://github.com/Rendraardika/BESC.git
cd BESC
```

### 4. Buat File .env
```bash
cat > .env << 'EOF'
MYSQL_ROOT_PASSWORD=buat_password_kuat_disini
DB_PASSWORD=buat_password_db_kuat_disini
JWT_SECRET=minimal_32_karakter_random_string_panjang_disini
CORS_ALLOW_ORIGINS=http://IP_VPS,https://IP_VPS,http://domain.com,https://domain.com
EOF
```

### 5. Build & Jalankan
```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

### 6. Cek Status
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

---

## Setup Domain & SSL

### Install Certbot
```bash
apt install certbot -y
certbot certonly --standalone -d domain-anda.com
```

### Update Nginx untuk SSL
Edit `frontend/nginx.conf` untuk menambahkan SSL, atau gunakan reverse proxy dari Hostinger panel.

---

## Troubleshooting

### Jika container backend tidak jalan:
```bash
docker compose -f docker-compose.prod.yml logs backend
```
Cek apakah ada error:
- `missing required production configuration` → Environment variables belum diisi
- `JWT_SECRET must be a long random value` → JWT_SECRET terlalu pendek/lemah
- `database connection failed` → Cek password DB dan pastikan container db sudah running

### Jika database belum terinisialisasi:
```bash
docker compose -f docker-compose.prod.yml exec db mysql -u root -p competition_platform -e "SHOW TABLES;"
```

### Jika perlu reset database:
```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

### Restart semua service
```bash
docker compose -f docker-compose.prod.yml restart
```

### Rebuild setelah update code
```bash
cd /opt/BESC
git pull origin main
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

### Backup database
```bash
docker compose -f docker-compose.prod.yml exec db mysqldump -u root -p competition_platform > backup_$(date +%Y%m%d).sql
```

---

## Catatan Penting
- **Gunakan `docker-compose.prod.yml`** untuk production (bukan `docker-compose.yml`)
- **Database otomatis** diinisialisasi saat pertama kali start
- **Volume uploads** tersimpan di Docker volume `uploads_data` (persistent)
- **Volume database** tersimpan di Docker volume `db_data` (persistent)
- **Frontend** di port 80, **Backend** internal di port 8080
- **Backend hanya diakses melalui nginx proxy** (tidak exposed ke luar)
