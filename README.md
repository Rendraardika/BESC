# BESC

BESC adalah platform kompetisi online yang terdiri dari:

- `backend`: REST API Go Fiber dengan database MySQL.
- `frontend`: React + Vite untuk tampilan web.

Dokumen ini dibuat untuk teman yang baru clone repository dan ingin menjalankan project di laptop lokal.

## Cara Paling Cepat

Pastikan sudah install:

- Git
- Go 1.22 atau lebih baru
- Node.js 20 atau lebih baru
- MySQL 8 atau MySQL dari Laragon/XAMPP

Lalu jalankan alur ini:

```bash
git clone <url-repository>
cd <nama-folder-repository>
```

Siapkan database:

```sql
CREATE DATABASE competition_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Copy file environment:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Import migration dan seed:

```bash
cd backend
for file in database/migrations/*.sql; do mysql -uroot -p competition_platform < "$file"; done
mysql -uroot -p competition_platform < database/seeds/001_seed_data.sql
```

Jalankan backend:

```bash
go mod tidy
go run ./cmd/api
```

Buka terminal baru, jalankan frontend:

```bash
cd frontend
npm install
npm run dev
```

Alamat aplikasi:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:8080/health`
- API base URL: `http://localhost:8080/api/v1`

## Catatan untuk Windows PowerShell

Kalau memakai PowerShell, perintah `cp` tetap bisa dipakai. Untuk import semua migration, gunakan pipe ke `mysql` karena operator `<` adalah syntax Bash:

```powershell
cd backend
Get-ChildItem database/migrations/*.sql | Sort-Object Name | ForEach-Object {
  Get-Content $_.FullName | mysql -uroot -p competition_platform
}
Get-Content database/seeds/001_seed_data.sql | mysql -uroot -p competition_platform
```

Jika password MySQL kosong, tekan Enter saat diminta password. Jika memakai Laragon, pastikan service MySQL sudah menyala.

## Setup Detail

### 1. Clone Repository

```bash
git clone <url-repository>
cd <nama-folder-repository>
```

Ganti `<url-repository>` dengan URL GitHub/GitLab project ini. Ganti `<nama-folder-repository>` dengan nama folder hasil clone.

### 2. Setup Database

Buat database MySQL:

```bash
mysql -uroot -p
```

Lalu jalankan:

```sql
CREATE DATABASE competition_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Import semua migration dari folder `backend/database/migrations` secara berurutan. Saat ini migration tersedia sampai `018_create_password_resets.sql`.

```bash
cd backend
for file in database/migrations/*.sql; do mysql -uroot -p competition_platform < "$file"; done
mysql -uroot -p competition_platform < database/seeds/001_seed_data.sql
```

Seed hanya untuk development/testing. Jangan import seed demo di production.

### 3. Setup Backend

Masuk ke folder backend:

```bash
cd backend
```

Buat file `.env` dari contoh:

```bash
cp .env.example .env
```

Isi default untuk lokal:

```env
APP_ENV=development
APP_PORT=8080
APP_URL=http://localhost:8080

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=competition_platform

JWT_SECRET=development-only-secret-change-me
JWT_EXPIRES_HOURS=24

GOOGLE_CLIENT_ID=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=BESC <noreply@example.com>

UPLOAD_DIR=uploads
CORS_ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Kalau MySQL lokal punya password, isi `DB_PASSWORD`.

Install dependency dan jalankan API:

```bash
go mod tidy
go run ./cmd/api
```

Backend berjalan di:

```txt
http://localhost:8080
```

Cek backend:

```txt
http://localhost:8080/health
```

Dokumentasi Swagger YAML:

```txt
http://localhost:8080/docs/swagger.yaml
```

### 4. Setup Frontend

Buka terminal baru, lalu masuk ke folder frontend:

```bash
cd frontend
```

Buat file `.env` dari contoh:

```bash
cp .env.example .env
```

Isi default untuk lokal:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_GOOGLE_CLIENT_ID=
```

Install dependency dan jalankan frontend:

```bash
npm install
npm run dev
```

Frontend biasanya berjalan di:

```txt
http://localhost:5173
```

Jika port `5173` sudah dipakai, Vite akan menampilkan URL lain di terminal.

## Akun Demo

Setelah seed database berhasil diimport, gunakan akun berikut:

```txt
Admin:
email    : admin@example.com
password : password

User:
email    : user@example.com
password : password
```

## Perintah Harian

Jalankan backend:

```bash
cd backend
go run ./cmd/api
```

Jalankan frontend:

```bash
cd frontend
npm run dev
```

Build frontend:

```bash
cd frontend
npm run build
```

Preview hasil build:

```bash
cd frontend
npm run preview
```

Jalankan test backend:

```bash
cd backend
go test ./...
```

## Troubleshooting

Backend gagal connect database:

- Pastikan MySQL menyala.
- Pastikan database `competition_platform` sudah dibuat.
- Cek `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, dan `DB_NAME` di `backend/.env`.

Frontend tidak bisa request ke backend:

- Pastikan backend jalan di `http://localhost:8080`.
- Pastikan `frontend/.env` berisi `VITE_API_URL=http://localhost:8080/api/v1`.
- Restart Vite setelah mengubah `.env`.

Import migration gagal:

- Pastikan sedang berada di folder `backend`.
- Pastikan database `competition_platform` sudah ada.
- Jika MySQL memakai password, masukkan password yang benar saat prompt muncul.
- Jika sebagian migration sudah pernah diimport, database bisa bentrok karena tabel/kolom sudah ada. Untuk setup ulang lokal, drop database lalu buat ulang:

```sql
DROP DATABASE competition_platform;
CREATE DATABASE competition_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Upload bukti pembayaran atau snapshot bermasalah:

- Pastikan folder `backend/uploads` ada.
- Aplikasi akan membuat subfolder `payments` dan `proctoring` saat backend berjalan.

Login Google tidak muncul/berfungsi:

- Isi `GOOGLE_CLIENT_ID` di `backend/.env`.
- Isi `VITE_GOOGLE_CLIENT_ID` di `frontend/.env`.
- Untuk development tanpa Google Login, field tersebut boleh dikosongkan.

## Docker dan Deploy

File `docker-compose.yml` di repo ini disiapkan untuk production dengan Traefik dan domain `beschimbio.online`. Untuk teman yang hanya ingin menjalankan project di laptop lokal, gunakan cara manual di atas.

Sebelum deploy production:

- Ganti `JWT_SECRET` dengan secret panjang dan acak.
- Gunakan user database non-root dan password kuat.
- Batasi `CORS_ALLOW_ORIGINS` hanya ke domain frontend.
- Isi `GOOGLE_CLIENT_ID` backend dan frontend jika memakai Google Login.
- Pastikan `backend/uploads` disimpan di persistent volume dan dibackup.
- Jalankan semua migration sampai file terbaru di `backend/database/migrations`.
- Jangan gunakan akun demo dari seed untuk production.

Script deploy yang tersedia:

- `deploy-vps.sh`: setup awal di VPS.
- `update.sh`: pull update dan rebuild container di VPS.
- `enable-https.sh`: setup HTTPS.
