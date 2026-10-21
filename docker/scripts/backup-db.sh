#!/bin/bash
# =============================================================================
# Nimnegah Academy — Backup Script (database + protected product files)
# =============================================================================
# Usage:
#   1. Make executable: chmod +x docker/scripts/backup-db.sh
#   2. Add to crontab: crontab -e
#      0 3 * * * /path/to/project/docker/scripts/backup-db.sh
#   This runs daily at 3 AM.
# =============================================================================

set -euo pipefail

# Config — override via environment or edit here
BACKUP_DIR="${BACKUP_DIR:-/var/backups/nimnegah}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DB_CONTAINER="${DB_CONTAINER:-nimnegah-db-1}"
DB_NAME="${DB_NAME:-nimnegah}"
DB_USER="${DB_USER:-nimnegah}"

# Protected digital-product files. The database only stores their metadata
# (filename, size, mime type) — the actual bytes live on this disk. Losing
# this directory means losing the products outright, so they are backed up
# alongside the database.
PROTECTED_DIR="${PROTECTED_DIR:-/var/data/protected}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/nimnegah_${TIMESTAMP}.sql.gz"
PROTECTED_ARCHIVE="${BACKUP_DIR}/protected_${TIMESTAMP}.tar.gz"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# ── Database ─────────────────────────────────────────────────────────────────
echo "[$(date)] Starting backup: ${DB_NAME}"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl \
  | gzip > "$BACKUP_FILE"

FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup complete: ${BACKUP_FILE} (${FILESIZE})"

# ── Protected product files ─────────────────────────────────────────────────
if [ -d "$PROTECTED_DIR" ]; then
  echo "[$(date)] Backing up protected product files: ${PROTECTED_DIR}"
  tar -czf "$PROTECTED_ARCHIVE" -C "$PROTECTED_DIR" .
  PSIZE=$(du -h "$PROTECTED_ARCHIVE" | cut -f1)
  echo "[$(date)] Product files backed up: ${PROTECTED_ARCHIVE} (${PSIZE})"
else
  echo "[$(date)] WARNING: ${PROTECTED_DIR} not found — product files NOT backed up"
fi

# ── Prune old backups ───────────────────────────────────────────────────────
DELETED=$(find "$BACKUP_DIR" -name "nimnegah_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
echo "[$(date)] Pruned ${DELETED} database backups older than ${RETENTION_DAYS} days"

DELETED=$(find "$BACKUP_DIR" -name "protected_*.tar.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
echo "[$(date)] Pruned ${DELETED} product-file backups older than ${RETENTION_DAYS} days"

# Optional: upload to remote storage (uncomment and configure)
# aws s3 cp "$BACKUP_FILE" s3://your-bucket/nimnegah-backups/ \
#   --storage-class STANDARD_IA \
#   --quiet
# aws s3 cp "$PROTECTED_ARCHIVE" s3://your-bucket/nimnegah-backups/ \
#   --storage-class STANDARD_IA \
#   --quiet
# echo "[$(date)] Uploaded to S3"
