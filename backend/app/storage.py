"""
Storage Abstraction Layer for Global Orators Platform
Supports local durable disk and S3-compatible private object storage (AWS S3, MinIO, Cloudflare R2).
Includes quota enforcement, key-based persistence, and lifecycle cleanup.
"""

import os
import shutil
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from app.config import settings

logger = logging.getLogger("globalorators.storage")


class StorageService:
    """Pluggable storage manager for rehearsal audio recordings and artifacts."""

    def __init__(self):
        self.backend = settings.STORAGE_BACKEND.lower()
        self.local_root = os.path.abspath(settings.STORAGE_LOCAL_ROOT)
        self.max_total_bytes = settings.STORAGE_MAX_TOTAL_BYTES
        os.makedirs(self.local_root, exist_ok=True)
        os.makedirs(os.path.join(self.local_root, "recordings"), exist_ok=True)

    def _resolve_local_path(self, storage_key: str) -> str:
        """Resolve a safe local path from a storage key, preventing path traversal."""
        clean_key = storage_key.lstrip("/").replace("..", "")
        return os.path.join(self.local_root, clean_key)

    def get_storage_stats(self) -> Dict[str, Any]:
        """Compute current disk storage usage and file count."""
        total_size = 0
        file_count = 0
        for dirpath, _, filenames in os.walk(self.local_root):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                if not os.path.islink(fp):
                    try:
                        total_size += os.path.getsize(fp)
                        file_count += 1
                    except OSError:
                        pass
        return {
            "backend": self.backend,
            "total_bytes_used": total_size,
            "max_bytes_quota": self.max_total_bytes,
            "quota_percent_used": round((total_size / self.max_total_bytes) * 100, 2) if self.max_total_bytes > 0 else 0,
            "file_count": file_count,
            "storage_root": self.local_root,
        }

    def check_quota(self, incoming_bytes: int):
        """Ensure incoming upload does not violate the storage quota."""
        if self.backend == "local":
            stats = self.get_storage_stats()
            if stats["total_bytes_used"] + incoming_bytes > self.max_total_bytes:
                logger.error(
                    "Storage quota exceeded: used %d bytes, incoming %d bytes, limit %d bytes",
                    stats["total_bytes_used"], incoming_bytes, self.max_total_bytes
                )
                raise HTTPException(
                    status_code=status.HTTP_507_INSUFFICIENT_STORAGE,
                    detail="Server storage quota exceeded. Please contact your faculty administrator."
                )

    async def save_file(self, storage_key: str, data: bytes, content_type: str = "audio/webm") -> str:
        """Save file bytes under the given storage key."""
        self.check_quota(len(data))

        if self.backend == "s3" and settings.S3_BUCKET:
            try:
                import boto3
                s3_client = boto3.client(
                    "s3",
                    region_name=settings.S3_REGION,
                    aws_access_key_id=settings.S3_ACCESS_KEY_ID or None,
                    aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY or None,
                    endpoint_url=settings.S3_ENDPOINT_URL or None,
                )
                s3_client.put_object(
                    Bucket=settings.S3_BUCKET,
                    Key=storage_key,
                    Body=data,
                    ContentType=content_type
                )
                logger.info("Saved %d bytes to S3 bucket %s with key %s", len(data), settings.S3_BUCKET, storage_key)
                return storage_key
            except Exception as e:
                logger.error("Failed to upload to S3 (%s): %s. Falling back to local storage.", storage_key, e)

        # Local storage execution
        local_path = self._resolve_local_path(storage_key)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with open(local_path, "wb") as f:
            f.write(data)
        logger.info("Saved %d bytes to local storage at %s", len(data), local_path)
        return storage_key

    def get_local_path(self, storage_key: str) -> Optional[str]:
        """Return the local filesystem path if the file exists locally."""
        local_path = self._resolve_local_path(storage_key)
        if os.path.exists(local_path):
            return local_path
        return None

    async def read_file(self, storage_key: str) -> bytes:
        """Read and return file bytes for streaming or download."""
        if self.backend == "s3" and settings.S3_BUCKET:
            try:
                import boto3
                s3_client = boto3.client(
                    "s3",
                    region_name=settings.S3_REGION,
                    aws_access_key_id=settings.S3_ACCESS_KEY_ID or None,
                    aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY or None,
                    endpoint_url=settings.S3_ENDPOINT_URL or None,
                )
                response = s3_client.get_object(Bucket=settings.S3_BUCKET, Key=storage_key)
                return response["Body"].read()
            except Exception as e:
                logger.warning("S3 read failed for %s: %s. Attempting local lookup.", storage_key, e)

        local_path = self._resolve_local_path(storage_key)
        if not os.path.exists(local_path):
            raise FileNotFoundError(f"Storage key {storage_key} not found")
        with open(local_path, "rb") as f:
            return f.read()

    async def delete_file(self, storage_key: str) -> bool:
        """Permanently purge file from storage backend."""
        deleted = False
        if self.backend == "s3" and settings.S3_BUCKET:
            try:
                import boto3
                s3_client = boto3.client(
                    "s3",
                    region_name=settings.S3_REGION,
                    aws_access_key_id=settings.S3_ACCESS_KEY_ID or None,
                    aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY or None,
                    endpoint_url=settings.S3_ENDPOINT_URL or None,
                )
                s3_client.delete_object(Bucket=settings.S3_BUCKET, Key=storage_key)
                deleted = True
                logger.info("Deleted %s from S3 bucket %s", storage_key, settings.S3_BUCKET)
            except Exception as e:
                logger.error("Failed to delete %s from S3: %s", storage_key, e)

        local_path = self._resolve_local_path(storage_key)
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
                deleted = True
                logger.info("Deleted %s from local storage", local_path)
            except OSError as e:
                logger.error("Failed to remove local file %s: %e", local_path, e)

        return deleted

    def exists(self, storage_key: str) -> bool:
        """Check if file exists in storage."""
        local_path = self._resolve_local_path(storage_key)
        return os.path.exists(local_path)


storage_service = StorageService()
