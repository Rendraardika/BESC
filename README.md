# BESC

Project ini terdiri dari dua aplikasi:

- `backend`: REST API Go Fiber dengan database MySQL.
- `frontend`: React + Vite untuk tampilan web.

Ikuti langkah di bawah ini setelah clone repository supaya project bisa dijalankan di komputer lokal.

## Prasyarat

Pastikan sudah terinstall:

- Go 1.22 atau lebih baru
- Node.js dan npm
- MySQL
- Git

Jika memakai Laragon, aktifkan service MySQL terlebih dahulu.

## 1. Clone Project

```bash
git clone <url-repository>
cd besc
```

## 2. Setup Database

Buat database MySQL bernama `competition_platform`.

Contoh lewat MySQL CLI:

```bash
mysql -uroot -p
```

Lalu jalankan:

```sql
CREATE DATABASE competition_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Import semua file migration secara berurutan dari folder `backend/database/migrations`.

```bash
cd backend
mysql -uroot -p competition_platform < database/migrations/001_create_schema.sql
mysql -uroot -p competition_platform < database/migrations/002_add_proctoring.sql
mysql -uroot -p competition_platform < database/migrations/003_add_user_profile.sql
mysql -uroot -p competition_platform < database/migrations/004_extend_competitions.sql
mysql -uroot -p competition_platform < database/migrations/005_add_exam_settings.sql
mysql -uroot -p competition_platform < database/migrations/006_expand_competition_banner.sql
mysql -uroot -p competition_platform < database/migrations/007_add_user_team_fields.sql
mysql -uroot -p competition_platform < database/migrations/008_set_tab_switch_limit_to_three.sql
mysql -uroot -p competition_platform < database/migrations/009_add_question_image.sql
mysql -uroot -p competition_platform < database/migrations/010_add_option_e_and_negative_scoring.sql
mysql -uroot -p competition_platform < database/migrations/011_prevent_duplicate_submissions.sql
mysql -uroot -p competition_platform < database/seeds/001_seed_data.sql
```

Jika password MySQL kosong, tekan Enter saat diminta password.

## 3. Setup Backend

Masuk ke folder backend:

```bash
cd backend
```

Buat file `.env` di folder `backend`:

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

UPLOAD_DIR=uploads
CORS_ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Untuk production, gunakan `backend/.env.production.example` sebagai template, lalu ganti placeholder dengan nilai server asli:

```env
APP_ENV=production
APP_URL=https://api.example.com
CORS_ALLOW_ORIGINS=https://example.com,https://www.example.com
JWT_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=
```

Install dependency Go dan jalankan API:

```bash
go mod tidy
go run ./cmd/api
```

Backend berjalan di:

```txt
http://localhost:8080
```

Endpoint API utama:

```txt
http://localhost:8080/api/v1
```

Cek apakah backend hidup:

```txt
http://localhost:8080/health
```

Dokumentasi Swagger YAML:

```txt
http://localhost:8080/docs/swagger.yaml
```

## 4. Setup Frontend

Buka terminal baru, lalu masuk ke folder frontend:

```bash
cd frontend
```

Buat file `.env` di folder `frontend`:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_GOOGLE_CLIENT_ID=
```

Untuk production:

```env
VITE_API_URL=https://api.example.com/api/v1
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

Jika port tersebut sudah dipakai, Vite akan menampilkan URL lain di terminal.

## Akun Demo

Setelah seed database berhasil dijalankan, gunakan akun berikut:

```txt
Admin:
email    : admin@example.com
password : password

User:
email    : user@example.com
password : password
```

Seed demo hanya untuk development/testing. Jangan jalankan seed demo secara otomatis di production; buat akun admin production dengan credential baru yang kuat.

## Perintah yang Sering Dipakai

Backend:

```bash
cd backend
go run ./cmd/api
```

Frontend:

```bash
cd frontend
npm run dev
```

Build frontend:

```bash
cd frontend
npm run build
```

Preview hasil build frontend:

```bash
cd frontend
npm run preview
```

## Troubleshooting

Jika backend gagal connect database, cek kembali nilai `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, dan `DB_NAME` di `backend/.env`.

Jika frontend tidak bisa request ke backend, pastikan backend berjalan di port `8080` dan `frontend/.env` berisi:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

Jika perubahan `.env` frontend tidak terbaca, hentikan server Vite lalu jalankan ulang `npm run dev`.

Jika upload bukti pembayaran atau snapshot bermasalah, pastikan folder `backend/uploads` ada. Aplikasi akan membuat subfolder `payments` dan `proctoring` saat backend dijalankan.

## Checklist Sebelum Deploy

- Gunakan VPS untuk menjalankan backend Go, MySQL, Nginx, dan frontend build.
- Jalankan semua migration `001` sampai `011` secara berurutan. Migration `011` menambahkan proteksi database agar satu user tidak memiliki submission ganda pada competition yang sama.
- Ganti `JWT_SECRET`, password database, dan akun demo sebelum live.
- Isi `GOOGLE_CLIENT_ID` di backend dan `VITE_GOOGLE_CLIENT_ID` di frontend dengan OAuth Client ID yang sama.
- Batasi `CORS_ALLOW_ORIGINS` ke domain frontend. Authentication web memakai cookie `HttpOnly`, jadi production wajib HTTPS dan CORS harus mengizinkan credentials dari origin frontend yang eksplisit.
- Build frontend dengan `VITE_API_URL` production.
- Pastikan `backend/uploads` writable dan masuk backup rutin.
- Jalankan backend sebagai service, misalnya `systemd`, agar otomatis hidup setelah reboot.
