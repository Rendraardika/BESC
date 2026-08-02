# Panduan Deployment ke Hostinger VPS dengan Docker

## Prasyarat
- Hostinger VPS dengan OS Ubuntu/Debian
- Docker & Docker Compose sudah terinstall
- Domain sudah pointing ke IP VPS

## Langkah-langkah Deployment

### 1. SSH ke VPS
```bash
ssh root@IP_VPS_ANDA
```

### 2. Install Docker (jika belum)
```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker
```

### 3. Install Docker Compose (jika belum)
```bash
apt install docker-compose -y
```

### 4. Clone Repository
```bash
cd /opt
git clone https://github.com/Rendraardika/BESC.git
cd "BESC"
```

### 5. Buat File .env
```bash
cp .env .env.production
nano .env.production
```

Isi dengan nilai yang benar:
```env
# Database
MYSQL_ROOT_PASSWORD=your_secure_root_password
DB_PASSWORD=your_secure_db_password

# Backend
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# CORS - Ganti dengan domain Anda
CORS_ALLOW_ORIGINS=https://domain-anda.com,http://domain-anda.com

# Google OAuth (opsional)
VITE_GOOGLE_CLIENT_ID=
```

### 6. Build & Jalankan
```bash
# Gunakan -f docker-compose.yml saja (tanpa override) untuk production
docker compose -f docker-compose.yml --env-file .env.production up -d --build
```

### 7. Cek Status
```bash
docker compose -f docker-compose.yml ps
docker compose -f docker-compose.yml logs backend
docker compose -f docker-compose.yml logs db
```

### 8. Inisialisasi Database (otomatis)
Database akan otomatis diinisialisasi oleh MySQL init scripts saat pertama kali start.
Semua tabel dan migration akan dijalankan otomatis.

### 9. Akses Website
- Frontend: `http://IP_VPS`
- Backend API: `http://IP_VPS/api/v1`

## Setup Domain & SSL (opsional tapi direkomendasikan)

### Install Certbot untuk SSL
```bash
apt install certbot -y
certbot certonly --standalone -d domain-anda.com
```

### Update Nginx untuk SSL
Edit `frontend/nginx.conf` untuk menambahkan SSL, atau gunakan reverse proxy dari Hostinger panel.

## Perintah Umum

### Restart semua service
```bash
docker compose -f docker-compose.yml restart
```

### Lihat logs
```bash
docker compose -f docker-compose.yml logs -f
```

### Stop semua service
```bash
docker compose -f docker-compose.yml down
```

### Rebuild setelah update code
```bash
cd /opt/BESC
git pull origin main
docker compose -f docker-compose.yml --env-file .env.production up -d --build
```

### Backup database
```bash
docker compose -f docker-compose.yml exec db mysqldump -u root -p competition_platform > backup_$(date +%Y%m%d).sql
```

## Catatan Penting
- **Pertama kali start**: Database akan otomatis membuat semua tabel dari migration files
- **Volume uploads**: Data file upload tersimpan di Docker volume `uploads_data` (persistent)
- **Volume database**: Data MySQL tersimpan di Docker volume `db_data` (persistent)
- **Port**: Frontend di port 80, Backend di port 8080 (internal)
- **Backend hanya bisa diakses melalui nginx proxy** (tidak exposed ke luar)
