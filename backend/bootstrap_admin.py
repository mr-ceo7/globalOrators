"""
Administrative Bootstrap & Credential Rotation Tool for Global Orators Platform
Provides controlled, auditable creation and credential rotation for initial administrator accounts.
"""

import sys
import os
import argparse
import asyncio
import logging
from datetime import datetime, timezone

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy import select
from app.database import engine, AsyncSessionLocal, Base
from app.config import settings
from app.security import get_password_hash
from app.models.user import User

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("bootstrap_admin")


async def bootstrap_or_rotate_admin(email: str, name: str, password: str, rotate: bool = False):
    """Create or rotate credentials for a faculty coach administrator account."""
    if len(password) < 8:
        print("ERROR: Password must be at least 8 characters.")
        sys.exit(1)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        res = await session.execute(select(User).where(User.email == email.lower()))
        user = res.scalar_one_or_none()

        if user:
            if not rotate:
                print(f"Administrator account '{email}' already exists. Pass --rotate to update credentials.")
                return
            user.hashed_password = get_password_hash(password)
            user.full_name = name or user.full_name
            user.is_active = True
            await session.commit()
            logger.warning(
                "AUDIT SECURITY EVENT: Administrator credentials rotated for user %s (role=%s) at %s",
                email, user.role, datetime.now(timezone.utc).isoformat()
            )
            print(f"SUCCESS: Administrator credentials successfully rotated for {email}.")
        else:
            coach_id = f"coach-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
            new_user = User(
                id=coach_id,
                email=email.lower(),
                hashed_password=get_password_hash(password),
                full_name=name,
                role="coach",
                avatar="",
                is_active=True,
                created_at=datetime.now(timezone.utc),
            )
            session.add(new_user)
            await session.commit()
            logger.warning(
                "AUDIT SECURITY EVENT: Initial administrator account provisioned (id=%s, email=%s, role=coach) at %s",
                coach_id, email, datetime.now(timezone.utc).isoformat()
            )
            print(f"SUCCESS: Initial administrator '{email}' successfully provisioned with ID '{coach_id}'.")


def main():
    parser = argparse.ArgumentParser(description="Global Orators Admin Bootstrapping Tool")
    parser.add_argument("--email", default=settings.DEFAULT_COACH_EMAIL, help="Admin coach email")
    parser.add_argument("--name", default=settings.DEFAULT_COACH_NAME, help="Admin coach full name")
    parser.add_argument("--password", default=settings.DEFAULT_COACH_PASSWORD, help="Admin coach password")
    parser.add_argument("--rotate", action="store_true", help="Rotate existing administrator password")
    args = parser.parse_args()

    asyncio.run(bootstrap_or_rotate_admin(args.email, args.name, args.password, args.rotate))


if __name__ == "__main__":
    main()
