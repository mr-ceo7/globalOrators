#!/usr/bin/env bash
# ==============================================================================
# Global Orators - Production Database Backup Engine
# Generates atomic, compressed, SHA-256 verified backups for PostgreSQL & SQLite.
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
DATABASE_URL="${DATABASE_URL:-sqlite+aiosqlite:///./globalorators.db}"

mkdir -p "${BACKUP_DIR}"

echo "======================================================================"
echo "Global Orators Database Backup Engine"
echo "Timestamp: ${TIMESTAMP}"
echo "Backup Directory: ${BACKUP_DIR}"
echo "======================================================================"

if [[ "${DATABASE_URL}" =~ ^postgres(ql)?(\+asyncpg)?:// ]]; then
    # PostgreSQL Managed Backup
    CLEAN_URL="$(echo "${DATABASE_URL}" | sed -E 's/\+asyncpg//')"
    BACKUP_FILE="${BACKUP_DIR}/globalorators_pg_${TIMESTAMP}.sql.gz"
    
    echo "Initiating streaming PostgreSQL dump..."
    if command -v pg_dump >/dev/null 2>&1; then
        pg_dump "${CLEAN_URL}" --no-owner --clean --if-exists | gzip -9 > "${BACKUP_FILE}"
    else
        echo "Error: 'pg_dump' utility not found on PATH. Install postgresql-client." >&2
        exit 1
    fi
else
    # SQLite Backup
    RAW_PATH="$(echo "${DATABASE_URL}" | sed -E 's|^sqlite(\+aiosqlite)?:///||')"
    SQLITE_PATH="${RAW_PATH}"
    if [[ ! -f "${SQLITE_PATH}" && -f "backend/${RAW_PATH}" ]]; then
        SQLITE_PATH="backend/${RAW_PATH}"
    elif [[ ! -f "${SQLITE_PATH}" && -f "backend/nubianfit.db" ]]; then
        SQLITE_PATH="backend/nubianfit.db"
    elif [[ ! -f "${SQLITE_PATH}" && -f "nubianfit.db" ]]; then
        SQLITE_PATH="nubianfit.db"
    fi

    if [[ ! -f "${SQLITE_PATH}" ]]; then
        echo "Error: SQLite database file not found at '${RAW_PATH}' or fallback locations." >&2
        exit 1
    fi
    BACKUP_FILE="${BACKUP_DIR}/globalorators_sqlite_${TIMESTAMP}.db.gz"
    echo "Performing atomic SQLite backup from ${SQLITE_PATH}..."
    sqlite3 "${SQLITE_PATH}" ".backup /tmp/go_backup_${TIMESTAMP}.db"
    gzip -9 -c "/tmp/go_backup_${TIMESTAMP}.db" > "${BACKUP_FILE}"
    rm -f "/tmp/go_backup_${TIMESTAMP}.db"
fi

# Verify archive integrity
echo "Verifying archive integrity with gzip..."
gzip -t "${BACKUP_FILE}"

# Generate SHA256 checksum for audit and tamper detection
sha256sum "${BACKUP_FILE}" > "${BACKUP_FILE}.sha256"
CHECKSUM="$(cat "${BACKUP_FILE}.sha256" | awk '{print $1}')"

BACKUP_SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"

echo "----------------------------------------------------------------------"
echo "Backup successfully created: ${BACKUP_FILE}"
echo "Archive Size: ${BACKUP_SIZE}"
echo "SHA256: ${CHECKSUM}"
echo "----------------------------------------------------------------------"

# Retention Policy Pruning
echo "Pruning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "globalorators_*.*" -mtime +"${RETENTION_DAYS}" -delete
echo "Retention pruning completed successfully."
