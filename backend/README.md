# Online Competition Platform API

Production-ready REST API scaffold for an online competition/exam platform built with Go, Fiber v2, MySQL, raw SQL, JWT auth, and clean architecture.

## Features

- User registration, login, JWT middleware, bcrypt password hashing, and current-user endpoint.
- Role-based access for `user` and `admin`.
- Competition CRUD, listing, detail by UUID or slug, and pagination.
- Competition registration, payment proof upload, payment status, and admin verification/rejection.
- Verified-user exam access, start exam, submit answers, and automatic scoring.
- Proctoring endpoints for tab/leave/camera/copy events and periodic camera snapshots.
- Admin question CRUD and submission monitoring.
- Raw SQL repositories using `database/sql`, no ORM.
- MySQL migrations, seed data, Dockerfile, Docker Compose, `.env.example`, and Swagger YAML.

## Project Structure

```txt
cmd/api                 Application entrypoint
config                  Environment config loader
database                MySQL connection, migrations, seeds
internal/entities       Domain entities
internal/dto            Request/response DTOs
internal/repositories   Raw SQL data access
internal/services       Business rules
internal/handlers       Fiber HTTP handlers
internal/middleware     JWT and role middleware
internal/routes         Route registration
internal/utils          JWT, password, validation, shared errors
pkg/response            Structured JSON response helper
uploads                 Uploaded payment proofs
docs                    Swagger/OpenAPI document
```

## Quick Start

1. Copy environment file:

```bash
cp .env.example .env
```

2. Run with Docker:

```bash
docker compose up --build
```

3. API will be available at:

```txt
http://localhost:8080/api/v1
```

Swagger YAML is served at:

```txt
http://localhost:8080/docs/swagger.yaml
```

## Local Development

Start MySQL, create `competition_platform`, then run:

```bash
go mod tidy
mysql -uroot -proot competition_platform < database/migrations/001_create_schema.sql
mysql -uroot -proot competition_platform < database/seeds/001_seed_data.sql
go run ./cmd/api
```

Seed accounts:

```txt
admin@example.com / password
user@example.com / password
```

## Main Endpoints

Public:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/competitions?page=1&limit=10`
- `GET /api/v1/competitions/:id` where `id` can be UUID or slug

Authenticated user:

- `GET /api/v1/auth/me`
- `POST /api/v1/competitions/:competition_id/register`
- `GET /api/v1/me/competitions`
- `POST /api/v1/registrations/:registration_id/payment-proof` with multipart field `proof`
- `GET /api/v1/registrations/:registration_id/payment`
- `POST /api/v1/competitions/:competition_id/exam/start`
- `GET /api/v1/competitions/:competition_id/exam/questions`
- `POST /api/v1/competitions/:competition_id/exam/submit`
- `POST /api/v1/proctoring/events`
- `POST /api/v1/submissions/:submission_id/proctoring/snapshots` with multipart field `snapshot`

Admin:

- `POST /api/v1/admin/competitions`
- `PUT /api/v1/admin/competitions/:id`
- `DELETE /api/v1/admin/competitions/:id`
- `POST /api/v1/admin/payments/:payment_id/verify`
- `GET /api/v1/admin/submissions`
- `GET /api/v1/admin/competitions/:competition_id/questions`
- `POST /api/v1/admin/competitions/:competition_id/questions`
- `PUT /api/v1/admin/questions/:id`
- `DELETE /api/v1/admin/questions/:id`
- `GET /api/v1/admin/submissions/:submission_id/proctoring/summary`
- `GET /api/v1/admin/submissions/:submission_id/proctoring/events`
- `GET /api/v1/admin/submissions/:submission_id/proctoring/snapshots`

## Example Requests

Login:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

Create competition:

```bash
curl -X POST http://localhost:8080/api/v1/admin/competitions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Math Olympiad",
    "slug":"math-olympiad",
    "description":"Online math competition",
    "banner":"",
    "price":100000,
    "start_time":"2026-06-10T09:00:00Z",
    "end_time":"2026-06-10T11:00:00Z",
    "status":"published"
  }'
```

Submit exam:

```bash
curl -X POST http://localhost:8080/api/v1/competitions/<competition_id>/exam/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"question_id":"<question_id>","answer":"A"}]}'
```

Log proctoring event from frontend:

```bash
curl -X POST http://localhost:8080/api/v1/proctoring/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id":"<submission_id>",
    "event_type":"tab_switch",
    "metadata":"{\"visibilityState\":\"hidden\"}"
  }'
```

Upload camera snapshot:

```bash
curl -X POST http://localhost:8080/api/v1/submissions/<submission_id>/proctoring/snapshots \
  -H "Authorization: Bearer <token>" \
  -F "snapshot=@camera.jpg"
```

Supported proctoring events:

```txt
page_leave, tab_switch, fullscreen_exit, camera_off, camera_on,
copy_attempt, right_click, screenshot_attempt, devtools_attempt
```

## Notes

- All repositories use parameterized raw SQL queries.
- Payment verification runs inside a transaction and updates registration status atomically.
- Exam submission locks the submission row, inserts answers, calculates score in the service, and marks the submission as submitted atomically.
- Proctoring cannot fully prevent OS-level screenshots in a normal browser. The backend stores violation logs and camera snapshots so admins can review suspicious sessions.
- For production, replace `JWT_SECRET`, restrict CORS, serve uploads from object storage or a protected CDN, and add a migration runner such as Goose or Atlas.
