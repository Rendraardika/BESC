# BESC Backup and Restore

This project stores user files on the VPS filesystem. Treat the database and
`UPLOAD_DIR` as one backup set because database rows reference files.

## Storage Layout

Development can use the default:

```env
UPLOAD_DIR=uploads
```

Production should use a persistent directory outside the Git checkout, for
example:

```env
UPLOAD_DIR=/var/lib/besc/uploads
```

Expected structure:

```text
$UPLOAD_DIR/
├── public/
└── private/
    ├── payments/
    └── proctoring/
```

The application serves only `$UPLOAD_DIR/public` through `/uploads`. Payment
proofs and proctoring snapshots remain private and are served through protected
API endpoints.

## Deployment Safety

Do not store production uploads inside a build output directory. Deployment
steps such as `git pull`, `npm run build`, `go build`, and service restart must
not delete `UPLOAD_DIR`.

The system user that runs the backend must have read/write access to
`UPLOAD_DIR`. Use ownership appropriate for your VPS, such as:

```bash
sudo chown -R <app-user>:<app-group> "$UPLOAD_DIR"
sudo chmod -R u+rwX,g-rwx,o-rwx "$UPLOAD_DIR"
```

Do not use `chmod -R 777`.

## Backup

Create a timestamped backup directory:

```bash
BACKUP_DIR=/var/backups/besc/$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"
```

Database backup:

```bash
mysqldump \
  -h "$DB_HOST" \
  -P "$DB_PORT" \
  -u "$DB_USER" \
  -p \
  "$DB_NAME" > "$BACKUP_DIR/database.sql"
```

Do not put the database password directly in the command line.

File backup:

```bash
tar -czf "$BACKUP_DIR/uploads.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
```

The file backup must include:

```text
public/
private/payments/
private/proctoring/
```

## Retention

For BESC v1, a simple starting policy is:

```text
daily backups
retain the last 7 daily backups
```

After the VPS is available, schedule the backup command with cron or systemd
timer and copy backups to an offsite location when possible.

## Restore

Use a matching database and upload backup from the same backup window.

1. Stop the backend service.
2. Restore MySQL:

```bash
mysql \
  -h "$DB_HOST" \
  -P "$DB_PORT" \
  -u "$DB_USER" \
  -p \
  "$DB_NAME" < "$BACKUP_DIR/database.sql"
```

3. Restore uploads to the configured persistent directory:

```bash
mkdir -p "$(dirname "$UPLOAD_DIR")"
tar -xzf "$BACKUP_DIR/uploads.tar.gz" -C "$(dirname "$UPLOAD_DIR")"
```

4. Verify ownership and permissions for the backend service user.
5. Start the backend service.
6. Check the health endpoint.
7. Verify an admin can open payment proof and proctoring snapshot files through
   protected API endpoints.
