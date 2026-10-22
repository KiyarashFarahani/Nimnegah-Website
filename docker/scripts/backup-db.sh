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

# Product files are large (hundreds of MB each) and only change when a new
# version is uploaded, so they get their own shorter retention window than the
# database. At 650 MB per archive, 30 days would eat 19 GB of a 48 GB disk.
PRODUCT_RETENTION_DAYS="${PRODUCT_RETENTION_DAYS:-7}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/nimnegah_${TIMESTAMP}.sql.gz"
PROTECTED_ARCHIVE="${BACKUP_DIR}/protected_${TIMESTAMP}.tar.gz"
MANIFEST_FILE="${BACKUP_DIR}/.protected-manifest"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# ── Database ─────────────────────────────────────────────────────────────────
echo "[$(date)] Starting backup: ${DB_NAME}"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl \
  | gzip > "$BACKUP_FILE"

FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup complete: ${BACKUP_FILE} (${FILESIZE})"

# ── Protected product files ─────────────────────────────────────────────────
# These only change when a new version is uploaded, so a new archive is only
# made when something actually changed — otherwise every nightly run would
# rewrite hundreds of megabytes of identical data.
if [ -d "$PROTECTED_DIR" ]; then
  # GNU and BSD stat use different flags, and this script gets run from macOS
  # during development as well as from Ubuntu in production.
  if stat -c '%n' /dev/null >/dev/null 2>&1; then
    STAT_OPT='-c'
    STAT_FMT='%n %s %Y'
  else
    STAT_OPT='-f'
    STAT_FMT='%N %z %m'
  fi

  if command -v sha256sum >/dev/null 2>&1; then
    hash_stdin() { sha256sum | cut -d' ' -f1; }
  else
    hash_stdin() { shasum -a 256 | cut -d' ' -f1; }
  fi

  CURRENT_MANIFEST=$(
    find "$PROTECTED_DIR" -type f -print0 \
      | xargs -0 stat "$STAT_OPT" "$STAT_FMT" 2>/dev/null \
      | sort \
      | hash_stdin
  )
  NEEDS_BACKUP=1

  if [ -f "$MANIFEST_FILE" ] && [ "$(cat "$MANIFEST_FILE")" = "$CURRENT_MANIFEST" ]; then
    # Unchanged — but only skip if a recent archive still exists, otherwise the
    # retention prune would leave us with no product backup at all.
    if find "$BACKUP_DIR" -name "protected_*.tar.gz" -mtime "-${PRODUCT_RETENTION_DAYS}" -print -quit 2>/dev/null | grep -q .; then
      NEEDS_BACKUP=0
    fi
  fi

  if [ "$NEEDS_BACKUP" -eq 0 ]; then
    echo "[$(date)] Product files unchanged — keeping the existing archive"
  else
    echo "[$(date)] Backing up protected product files: ${PROTECTED_DIR}"
    tar -czf "$PROTECTED_ARCHIVE" -C "$PROTECTED_DIR" .
    printf '%s' "$CURRENT_MANIFEST" > "$MANIFEST_FILE"
    PSIZE=$(du -h "$PROTECTED_ARCHIVE" | cut -f1)
    echo "[$(date)] Product files backed up: ${PROTECTED_ARCHIVE} (${PSIZE})"
  fi
else
  echo "[$(date)] WARNING: ${PROTECTED_DIR} not found — product files NOT backed up"
fi

# ── Prune old backups ───────────────────────────────────────────────────────
DELETED=$(find "$BACKUP_DIR" -name "nimnegah_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
echo "[$(date)] Pruned ${DELETED} database backups older than ${RETENTION_DAYS} days"

DELETED=$(find "$BACKUP_DIR" -name "protected_*.tar.gz" -mtime +${PRODUCT_RETENTION_DAYS} -delete -print | wc -l)
echo "[$(date)] Pruned ${DELETED} product-file backups older than ${PRODUCT_RETENTION_DAYS} days"

# Optional: upload to remote storage (uncomment and configure)
# aws s3 cp "$BACKUP_FILE" s3://your-bucket/nimnegah-backups/ \
#   --storage-class STANDARD_IA \
#   --quiet
# aws s3 cp "$PROTECTED_ARCHIVE" s3://your-bucket/nimnegah-backups/ \
#   --storage-class STANDARD_IA \
#   --quiet
# echo "[$(date)] Uploaded to S3"
