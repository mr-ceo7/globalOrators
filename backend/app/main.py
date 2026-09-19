"""
global Orators FastAPI Backend Main Application
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import engine, Base
import app.models  # Guarantees all ORM models are registered in Base.metadata for create_all
from app.dependencies import get_db

# Routers
from app.routers import (
    auth_router,
    clients_router,
    exercises_router,
    programs_router,
    workouts_router,
    metrics_router,
    prs_router,
    habits_router,
    photos_router,
    messages_router,
    activity_router,
    inquiries_router,
    webrtc_router,
    coaches_router,
    journals_router,
    simulations_router,
    recordings_router,
    events_router,
    system_router,
    webhooks_router,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("globalorators")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager: Initialize DB tables and seed mock data."""
    logger.info("Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        # Ensure schema migrations for newly introduced columns
        def _migrate_columns(connection):
            from sqlalchemy import inspect, text
            inspector = inspect(connection)
            if "clients" in inspector.get_table_names():
                cols = [c["name"] for c in inspector.get_columns("clients")]
                if "referral_code" not in cols:
                    connection.execute(text("ALTER TABLE clients ADD COLUMN referral_code VARCHAR(64)"))
                if "adjudicator_notes" not in cols:
                    connection.execute(text("ALTER TABLE clients ADD COLUMN adjudicator_notes JSON DEFAULT '[]'"))
            if "audio_recordings" in inspector.get_table_names():
                rec_cols = [c["name"] for c in inspector.get_columns("audio_recordings")]
                if "storage_key" not in rec_cols:
                    connection.execute(text("ALTER TABLE audio_recordings ADD COLUMN storage_key VARCHAR(500)"))
            if "exercises" in inspector.get_table_names():
                ex_cols = [c["name"] for c in inspector.get_columns("exercises")]
                if "instructional_video_url" not in ex_cols:
                    connection.execute(text("ALTER TABLE exercises ADD COLUMN instructional_video_url VARCHAR(512)"))
            if "email_otps" in inspector.get_table_names():
                otp_cols = [c["name"] for c in inspector.get_columns("email_otps")]
                if "magic_token" not in otp_cols:
                    connection.execute(text("ALTER TABLE email_otps ADD COLUMN magic_token VARCHAR(255)"))
        await conn.run_sync(_migrate_columns)

    logger.info("Checking / running initial database seed...")
    import os
    enable_dev_seed = os.getenv("ENABLE_DEV_SEED", "false").lower() in ("true", "1")

    if settings.ENVIRONMENT == 'production' and enable_dev_seed:
        logger.error("CRITICAL: ENABLE_DEV_SEED is strictly prohibited in production environment.")
        raise RuntimeError("CRITICAL: ENABLE_DEV_SEED is strictly prohibited in production environment.")

    if settings.ENVIRONMENT != 'production':
        if enable_dev_seed or settings.TESTING:
            logger.info("Database seed active (TESTING=%s, ENABLE_DEV_SEED=%s)...", settings.TESTING, enable_dev_seed)
            try:
                from fixtures.seed_data import seed_database
                await seed_database(force=False)
            except Exception as e:
                logger.error(f"Failed during database seed: {e}")
                if settings.TESTING:
                    raise
    else:
        from app.database import AsyncSessionLocal
        from app.models import User
        from sqlalchemy import select
        from app.security import get_password_hash
        from datetime import datetime, timezone

        async with AsyncSessionLocal() as session:
            try:
                user_res = await session.execute(select(User).where(User.role == "coach"))
                existing_coach = user_res.scalars().first()
                if not existing_coach:
                    if settings.BOOTSTRAP_INITIAL_ADMIN:
                        coach_user = User(
                            id="coach-1",
                            email=settings.DEFAULT_COACH_EMAIL.lower(),
                            hashed_password=get_password_hash(settings.DEFAULT_COACH_PASSWORD),
                            full_name=settings.DEFAULT_COACH_NAME,
                            role="coach",
                            avatar="",
                            is_active=True,
                            created_at=datetime.now(timezone.utc),
                        )
                        session.add(coach_user)
                        await session.commit()
                        logger.warning(
                            "AUDIT SECURITY EVENT: Initial administrator account provisioned (id=coach-1, email=%s, role=coach). "
                            "Immediate credential rotation is required in accordance with security policy.",
                            settings.DEFAULT_COACH_EMAIL
                        )
                    else:
                        logger.warning(
                            "PRODUCTION BOOTSTRAP NOTICE: No coach administrator accounts exist in the database. "
                            "Automatic credential bootstrapping is disabled in production unless BOOTSTRAP_INITIAL_ADMIN=true. "
                            "Run 'python backend/bootstrap_admin.py' or provide BOOTSTRAP_INITIAL_ADMIN=true."
                        )
            except Exception as e:
                logger.critical(f"Critical failure checking coach account in production: {e}")
                raise

    logger.info("global Orators FastAPI Backend ready.")
    yield
    logger.info("Shutting down global Orators FastAPI Backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check endpoint verifying application and database readiness."""
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Health check database failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "unhealthy", "database": "disconnected", "error": str(e)}
        )

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status
    }


@app.get("/ready", tags=["System"])
@app.get("/api/ready", tags=["System"])
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """Kubernetes/Render readiness probe."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "not_ready", "database": "disconnected"}
        )


# Mount all API routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(clients_router, prefix=settings.API_PREFIX)
app.include_router(exercises_router, prefix=settings.API_PREFIX)
app.include_router(programs_router, prefix=settings.API_PREFIX)
app.include_router(workouts_router, prefix=settings.API_PREFIX)
app.include_router(metrics_router, prefix=settings.API_PREFIX)
app.include_router(prs_router, prefix=settings.API_PREFIX)
app.include_router(habits_router, prefix=settings.API_PREFIX)
app.include_router(photos_router, prefix=settings.API_PREFIX)
app.include_router(messages_router, prefix=settings.API_PREFIX)
app.include_router(activity_router, prefix=settings.API_PREFIX)
app.include_router(inquiries_router, prefix=settings.API_PREFIX)
app.include_router(coaches_router, prefix=settings.API_PREFIX)
app.include_router(journals_router, prefix=settings.API_PREFIX)
app.include_router(simulations_router, prefix=settings.API_PREFIX)
app.include_router(recordings_router, prefix=settings.API_PREFIX)
app.include_router(events_router, prefix=settings.API_PREFIX)
app.include_router(system_router, prefix=settings.API_PREFIX)
app.include_router(webhooks_router, prefix=settings.API_PREFIX)
app.include_router(webrtc_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8005, reload=True)
