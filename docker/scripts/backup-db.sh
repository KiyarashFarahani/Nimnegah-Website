#!/bin/bash
# =============================================================================
# Nimnegah Academy — PostgreSQL Backup Script
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
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/nimnegah_${TIMESTAMP}.sql.gz"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Dump and compress
echo "[$(date)] Starting backup: ${DB_NAME}"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl \
  | gzip > "$BACKUP_FILE"

FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup complete: ${BACKUP_FILE} (${FILESIZE})"

# Prune old backups
DELETED=$(find "$BACKUP_DIR" -name "nimnegah_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
echo "[$(date)] Pruned ${DELETED} backups older than ${RETENTION_DAYS} days"

# Optional: upload to remote storage (uncomment and configure)
# aws s3 cp "$BACKUP_FILE" s3://your-bucket/nimnegah-backups/ \
#   --storage-class STANDARD_IA \
#   --quiet
# echo "[$(date)] Uploaded to S3"
