#!/usr/bin/env bash
# ==============================================================================
# Global Orators - Production Database Restore Engine
# Restores compressed, verified backups into PostgreSQL or SQLite databases.
# ==============================================================================

set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <path_to_backup_archive.gz> [--confirm]"
    echo "Example: $0 ./backups/globalorators_pg_20260913_120000.sql.gz --confirm"
    exit 1
fi

BACKUP_FILE="$1"
CONFIRM="${2:-}"
DATABASE_URL="${DATABASE_URL:-sqlite+aiosqlite:///./globalorators.db}"

if [[ ! -f "${BACKUP_FILE}" ]]; then
    echo "Error: Backup file '${BACKUP_FILE}' does not exist." >&2
    exit 1
fi

echo "======================================================================"
echo "Global Orators Database Restore Engine"
echo "Target Backup: ${BACKUP_FILE}"
echo "======================================================================"

# Check for checksum file and verify
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [[ -f "${CHECKSUM_FILE}" ]]; then
    echo "Verifying SHA256 integrity..."
    sha256sum -c "${CHECKSUM_FILE}"
else
    echo "Warning: No .sha256 checksum file found. Verifying archive with gzip -t..."
    gzip -t "${BACKUP_FILE}"
fi

if [[ "${CONFIRM}" != "--confirm" ]]; then
    echo ""
    echo "CAUTION: This operation will overwrite existing database records!"
    read -p "Type 'RESTORE' to proceed: " USER_INPUT
    if [[ "${USER_INPUT}" != "RESTORE" ]]; then
        echo "Restore aborted by user."
        exit 0
    fi
fi

if [[ "${DATABASE_URL}" =~ ^postgres(ql)?(\+asyncpg)?:// ]]; then
    CLEAN_URL="$(echo "${DATABASE_URL}" | sed -E 's/\+asyncpg//')"
    echo "Restoring to managed PostgreSQL database..."
    if command -v psql >/dev/null 2>&1; then
        gunzip -c "${BACKUP_FILE}" | psql "${CLEAN_URL}" --single-transaction
    else
        echo "Error: 'psql' utility not found on PATH. Install postgresql-client." >&2
        exit 1
    fi
else
    RAW_PATH="$(echo "${DATABASE_URL}" | sed -E 's|^sqlite(\+aiosqlite)?:///||')"
    SQLITE_PATH="${RAW_PATH}"
    if [[ ! -f "${SQLITE_PATH}" && -f "backend/${RAW_PATH}" ]]; then
        SQLITE_PATH="backend/${RAW_PATH}"
    elif [[ ! -f "${SQLITE_PATH}" && -f "backend/nubianfit.db" ]]; then
        SQLITE_PATH="backend/nubianfit.db"
    fi
    echo "Restoring to SQLite database at '${SQLITE_PATH}'..."
    TEMP_RESTORE="/tmp/go_restore_temp.db"
    gunzip -c "${BACKUP_FILE}" > "${TEMP_RESTORE}"
    mv -f "${TEMP_RESTORE}" "${SQLITE_PATH}"
fi

echo "----------------------------------------------------------------------"
echo "Database restoration completed successfully."
echo "----------------------------------------------------------------------"
