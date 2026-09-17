"""
FastAPI Backend API Test Suite
"""

import os
_test_db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_globalorators.db")
if os.path.exists(_test_db_path):
    try:
        os.remove(_test_db_path)
    except OSError:
        pass
os.environ["TESTING"] = "true"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_test_db_path}"

import pytest
import httpx
import uuid
from app.config import settings
settings.TESTING = True
from app.main import app


@pytest.fixture(autouse=True, scope="session")
def setup_test_database():
    """Ensure test database is isolated and populated with fresh fixtures."""
    import asyncio
    from fixtures.seed_data import seed_database
    from app.database import engine
    from sqlalchemy import text, inspect

    async def _init_db():
        await seed_database(force=True)
        def _mig(connection):
            insp = inspect(connection)
            if "exercises" in insp.get_table_names():
                cols = [c["name"] for c in insp.get_columns("exercises")]
                if "instructional_video_url" not in cols:
                    connection.execute(text("ALTER TABLE exercises ADD COLUMN instructional_video_url VARCHAR(512)"))
            if "audio_recordings" in insp.get_table_names():
                cols = [c["name"] for c in insp.get_columns("audio_recordings")]
                if "storage_key" not in cols:
                    connection.execute(text("ALTER TABLE audio_recordings ADD COLUMN storage_key VARCHAR(500)"))
        async with engine.begin() as conn:
            await conn.run_sync(_mig)
    asyncio.run(_init_db())


@pytest.mark.asyncio
async def test_api_endpoints():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/api/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

        # 2. Auth Login
        res = await client.post(
            "/api/auth/login",
            json={
                "email": settings.DEFAULT_COACH_EMAIL,
                "password": settings.DEFAULT_COACH_PASSWORD
            }
        )
        assert res.status_code == 200
        token_data = res.json()
        assert "access_token" in token_data
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Auth Me
        res = await client.get("/api/auth/me", headers=headers)
        assert res.status_code == 200
        assert res.json()["email"] == settings.DEFAULT_COACH_EMAIL

        # 3b. Google Auth for Executive Speaker
        import base64
        import json
        mock_payload = base64.urlsafe_b64encode(json.dumps({
            "sub": "google-test-exec-123",
            "email": "executive.speaker@globalorators.org",
            "name": "Dr. Arthur Vance"
        }).encode()).decode().rstrip("=")
        mock_jwt = f"mockHeader.{mock_payload}.mockSignature"

        res = await client.post("/api/auth/google", json={"credential": mock_jwt, "role": "speaker"})
        assert res.status_code == 200
        speaker_token_data = res.json()
        assert "access_token" in speaker_token_data
        assert speaker_token_data["user"]["email"] == "executive.speaker@globalorators.org"
        assert speaker_token_data["user"]["role"] == "speaker"

        # Verify Google-authenticated speaker has Client record provisioned
        speaker_headers = {"Authorization": f"Bearer {speaker_token_data['access_token']}"}
        res_me = await client.get("/api/clients/me", headers=speaker_headers)
        assert res_me.status_code == 200
        assert res_me.json()["email"] == "executive.speaker@globalorators.org"

        # 4. Clients
        res = await client.get("/api/clients", headers=headers)
        assert res.status_code == 200
        clients = res.json()
        assert len(clients) >= 6
        first_client = clients[0]
        assert "name" in first_client
        assert "complianceRate" in first_client

        # Add Coach note to first client
        res = await client.post(
            f"/api/clients/{first_client['id']}/notes",
            json={"note": "Test note from automated test"},
            headers=headers
        )
        assert res.status_code == 200
        assert res.json()["customCoachNotes"][0] == "Test note from automated test"

        # 5. Exercises
        res = await client.get("/api/exercises", headers=headers)
        assert res.status_code == 200
        exercises = res.json()
        assert len(exercises) >= 15
        assert "primaryMuscle" in exercises[0]

        # 6. Programs
        res = await client.get("/api/programs", headers=headers)
        assert res.status_code == 200
        programs = res.json()
        assert len(programs) >= 3

        # 7. Scheduled Workouts
        res = await client.get("/api/workouts", headers=headers)
        assert res.status_code == 200
        workouts = res.json()
        assert len(workouts) >= 6

        # 8. Complete a workout
        res = await client.post(
            f"/api/workouts/{workouts[0]['id']}/complete",
            json={
                "clientFeedback": "Felt great today!",
                "coachFeedback": "Strong work",
                "rating": 5,
                "durationMin": 60
            },
            headers=headers
        )
        assert res.status_code == 200
        assert res.json()["status"] == "Completed"

        # 9. Metrics
        res = await client.get("/api/metrics", headers=headers)
        assert res.status_code == 200
        assert len(res.json()) >= 12

        # 10. PRs
        res = await client.get("/api/prs", headers=headers)
        assert res.status_code == 200
        assert len(res.json()) >= 8

        # 11. Habits & Toggle
        res = await client.get("/api/habits", headers=headers)
        assert res.status_code == 200
        toggle_res = await client.post(
            "/api/habits/toggle",
            json={
                "clientId": first_client["id"],
                "date": "2026-08-16",
                "habitId": "h-1"
            },
            headers=headers
        )
        assert toggle_res.status_code == 200

        # 12. Photos
        res = await client.get("/api/photos", headers=headers)
        assert res.status_code == 200
        assert len(res.json()) >= 6

        # 13. Messages
        res = await client.get(f"/api/messages?clientId={first_client['id']}", headers=headers)
        assert res.status_code == 200

        # Send Message
        res = await client.post(
            "/api/messages",
            json={
                "clientId": first_client["id"],
                "sender": "coach",
                "text": "Keep up the momentum!"
            },
            headers=headers
        )
        assert res.status_code == 201
        assert res.json()["text"] == "Keep up the momentum!"

        # 14. Activity Feed
        res = await client.get("/api/activity", headers=headers)
        assert res.status_code == 200
        assert len(res.json()) >= 5

        # 15. Inquiries (Partnership / Grant Submission)
        res = await client.post(
            "/api/inquiries",
            json={
                "organization": "Alliance High School",
                "email": "principal@alliance.ac.ke",
                "branch": "Academy",
                "focus": "Institutional Speech Training & Tournament Sponsorship",
                "message": "Interested in 2026 debate curriculum."
            }
        )
        assert res.status_code == 201
        inq_data = res.json()
        assert inq_data["status"] == "success"
        assert inq_data["organization"] == "Alliance High School"
        assert "inquiryId" in inq_data or "inquiry_id" in inq_data

        # 16. Inquiries Input Sanitization & Validation Tests
        # XSS injection attempt should be stripped and sanitized
        res_xss = await client.post(
            "/api/inquiries",
            json={
                "organization": "   <script>alert('attack')</script>Starehe Boys Centre   ",
                "email": "  INFO@STAREHE.ORG  ",
                "branch": "Academy",
                "focus": "Debate Mentorship",
                "message": "<b>Urgent:</b> Please send details <script>hack()</script>"
            }
        )
        assert res_xss.status_code == 201
        xss_data = res_xss.json()
        assert xss_data["organization"] == "Starehe Boys Centre"
        assert xss_data["email"] == "info@starehe.org"
        assert "<script>" not in xss_data["message"]
        assert "hack()" not in xss_data["message"]

        # Invalid email rejection (422)
        res_bad_email = await client.post(
            "/api/inquiries",
            json={
                "organization": "Valid Org",
                "email": "invalid-email-address",
                "branch": "Academy",
                "focus": "Debate"
            }
        )
        assert res_bad_email.status_code == 422

        # Too short organization rejection (422)
        res_bad_org = await client.post(
            "/api/inquiries",
            json={
                "organization": "   ",
                "email": "valid@org.com",
                "branch": "Academy",
                "focus": "Debate"
            }
        )
        assert res_bad_org.status_code == 422

        # List inquiries (secured with require_coach)
        res = await client.get("/api/inquiries", headers=headers)
        assert res.status_code == 200
        assert len(res.json()) >= 1

        # 17. Speaker Client Onboarding Persistence & Lookup Tests
        import time
        t_now = int(time.time())
        test_email = f"kassim.test.{t_now}@example.com"
        test_phone_suffix = f"{t_now % 100000000:08d}"
        test_phone = f"+2547{test_phone_suffix}"
        test_phone_plain = f"2547{test_phone_suffix}"

        speaker_payload = {
            "name": "KASSIM MUSA",
            "email": test_email,
            "phone": test_phone,
            "branch": "Academy",
            "missionFocus": "Pan-African Leadership",
            "goal": "Pan-African Leadership",
            "experienceLevel": "Novice Speaker",
            "status": "Active",
            "startingWeightKg": 140.0,
            "currentWeightKg": 140.0,
            "targetWeightKg": 145.0,
            "customCoachNotes": ["Enrolled via Global Orators Academy. Focus: Pan-African Leadership"],
            "onboardingSurvey": {
                "branch": "Academy",
                "fullName": "KASSIM MUSA",
                "email": test_email,
                "phone": test_phone,
                "institution": "Maseno University",
                "primaryDiscipline": "Decolonial Parliamentary Forensics",
                "coreFocus": "Ideological Rigor & Rebuttal Depth",
                "missionFocus": "Pan-African Leadership",
                "speakingGoal": "Pan-African Leadership",
                "experienceLevel": "Novice Speaker",
                "vocalBaselinePace": 140,
                "emotionalOpennessRating": 8,
                "selectedHabits": [
                    "Vocal Hydration (2.5L + Warm Lemon Water)",
                    "Diaphragmatic Breathwork (5 Min Morning Routine)",
                    "Decolonial Parliamentary Case Prep (15 Min)"
                ],
                "bioNotes": "Academy debater advancing decolonial rhetoric."
            }
        }

        # Create speaker profile
        res_create = await client.post("/api/clients", json=speaker_payload)
        assert res_create.status_code == 201
        created_client = res_create.json()
        assert created_client["name"] == "KASSIM MUSA"
        assert created_client["email"] == test_email
        assert created_client["onboardingSurvey"]["primaryDiscipline"] == "Decolonial Parliamentary Forensics"
        client_db_id = created_client["id"]

        # Lookup endpoint is removed per C1; returns 404 (endpoint removed)
        # Lookup endpoint is removed per C1; unauthenticated access returns 401
        res_lookup_unauth = await client.get(f"/api/clients/lookup?search={test_email}")
        assert res_lookup_unauth.status_code in (401, 404)

        # Authenticated lookup by non-existent ID returns 404
        res_lookup_auth = await client.get("/api/clients/lookup?search=Marcus", headers=headers)
        assert res_lookup_auth.status_code == 404

        # Coach can access client profile by ID
        res_client_by_id = await client.get(f"/api/clients/{client_db_id}", headers=headers)
        assert res_client_by_id.status_code == 200
        assert res_client_by_id.json()["id"] == client_db_id
        assert res_client_by_id.json()["phone"] == test_phone

        # Authenticated speaker resolves their own profile via /api/clients/me
        res_speaker_auth = await client.post("/api/auth/otp/verify", json={"email": test_email, "code": "123456"})
        assert res_speaker_auth.status_code == 200
        speaker_token = res_speaker_auth.json()["access_token"]
        speaker_headers = {"Authorization": f"Bearer {speaker_token}"}

        res_me = await client.get("/api/clients/me", headers=speaker_headers)
        assert res_me.status_code == 200
        assert res_me.json()["id"] == client_db_id
        assert res_me.json()["email"] == test_email
        assert res_me.json()["phone"] == test_phone
        # Redacted coach notes for speaker
        assert res_me.json()["customCoachNotes"] == []

        # Unauthenticated call to /api/clients/me returns 401
        res_me_unauth = await client.get("/api/clients/me")
        assert res_me_unauth.status_code == 401

        # Re-submitting with same email updates existing record without duplicate
        updated_payload = dict(speaker_payload)
        updated_payload["currentWeightKg"] = 144.0
        res_update = await client.post("/api/clients", json=updated_payload)
        assert res_update.status_code == 201
        assert res_update.json()["id"] == client_db_id
        assert res_update.json()["currentWeightKg"] == 144.0

        print("All API endpoints tested and passed flawlessly!")


@pytest.mark.asyncio
async def test_security_controls():
    """Security regression tests verifying P0 and P1 audit remediation."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unauthenticated requests to private business routes return 401 Unauthorized
        for route in [
            "/api/clients",
            "/api/workouts",
            "/api/programs",
            "/api/exercises",
            "/api/inquiries",
            "/api/metrics",
            "/api/prs",
            "/api/habits",
            "/api/photos",
            "/api/activity",
        ]:
            res = await client.get(route)
            assert res.status_code == 401, f"Expected 401 for unauthenticated GET {route}, got {res.status_code}"

        # 2. Coach registration requires valid coach_invite_code
        import time
        t_id = int(time.time() * 1000)
        
        # 2a. Attempting coach registration without invite code fails (403)
        res_rogue_coach = await client.post(
            "/api/auth/register",
            json={
                "email": f"rogue.coach.{t_id}@example.com",
                "password": "Password123!",
                "full_name": "Rogue Coach",
                "role": "coach"
            }
        )
        assert res_rogue_coach.status_code == 403

        # 2b. Attempting coach registration with wrong invite code fails (403)
        res_bad_invite = await client.post(
            "/api/auth/register",
            json={
                "email": f"bad.invite.{t_id}@example.com",
                "password": "Password123!",
                "full_name": "Bad Invite Coach",
                "role": "coach",
                "coach_invite_code": "wrong-secret-code"
            }
        )
        assert res_bad_invite.status_code == 403

        # 2c. Valid coach registration with correct invite code succeeds (200)
        res_valid_coach = await client.post(
            "/api/auth/register",
            json={
                "email": f"valid.coach.{t_id}@example.com",
                "password": "Password123!",
                "full_name": "Valid Coach",
                "role": "coach",
                "coach_invite_code": settings.COACH_INVITE_CODE
            }
        )
        assert res_valid_coach.status_code == 200
        coach_token = res_valid_coach.json()["access_token"]
        coach_headers = {"Authorization": f"Bearer {coach_token}"}

        # 2d. Public registration without invite code defaults safely to 'speaker'
        res_speaker_reg = await client.post(
            "/api/auth/register",
            json={
                "email": f"speaker.{t_id}@example.com",
                "password": "Password123!",
                "full_name": "Registered Speaker",
                "role": "speaker"
            }
        )
        assert res_speaker_reg.status_code == 200
        speaker_token = res_speaker_reg.json()["access_token"]
        speaker_headers = {"Authorization": f"Bearer {speaker_token}"}
        assert res_speaker_reg.json()["user"]["role"] == "speaker"

        # 3. Google Auth Token Forgery Protection
        # Arbitrary fabricated credentials without valid signature or mockHeader format fail (401)
        res_forged_google = await client.post(
            "/api/auth/google",
            json={
                "credential": "forged.payloadWithoutGoogleSignature.fakeSig",
                "role": "coach"
            }
        )
        assert res_forged_google.status_code == 401

        # 4. Speaker Role Boundary & Tenant Isolation
        # Speaker cannot create an exercise (Coach required) -> 403
        res_spk_ex = await client.post(
            "/api/exercises",
            json={
                "name": "Unauthorized Drill",
                "primaryMuscle": "Articulation",
                "equipment": "Floor",
                "difficulty": "Advanced",
                "instructions": ["Should fail"]
            },
            headers=speaker_headers
        )
        assert res_spk_ex.status_code == 403

        # Speaker cannot access coach inquiries admin list -> 403
        res_spk_inq = await client.get("/api/inquiries", headers=speaker_headers)
        assert res_spk_inq.status_code == 403

        # Speaker listing clients only receives their own record, with coach notes redacted
        res_spk_clients = await client.get("/api/clients", headers=speaker_headers)
        assert res_spk_clients.status_code == 200
        for item in res_spk_clients.json():
            assert item.get("customCoachNotes") == []

        print("Security regression tests passed successfully!")


@pytest.mark.asyncio
async def test_multi_coach_strict_isolation():
    """Verify strict multi-tenant coach isolation across speakers, curriculums, workouts, and messaging."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        import time
        ts = int(time.time() * 1000)
        
        # 1. Register Coach A
        res_a = await client.post(
            "/api/auth/register",
            json={
                "email": f"coach.alpha.{ts}@globalorators.org",
                "password": "Password123!",
                "full_name": "Coach Alpha",
                "role": "coach",
                "coach_invite_code": settings.COACH_INVITE_CODE
            }
        )
        assert res_a.status_code == 200
        token_a = res_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}
        
        # 2. Register Coach B
        res_b = await client.post(
            "/api/auth/register",
            json={
                "email": f"coach.bravo.{ts}@globalorators.org",
                "password": "Password123!",
                "full_name": "Coach Bravo",
                "role": "coach",
                "coach_invite_code": settings.COACH_INVITE_CODE
            }
        )
        assert res_b.status_code == 200
        token_b = res_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # Verify Coach B starts with empty roster (strict isolation, no seed data)
        res_b_init = await client.get("/api/clients", headers=headers_b)
        assert res_b_init.status_code == 200
        assert len(res_b_init.json()) == 0

        # 3. Coach A onboards a private speaker
        speaker_email = f"marcus.orator.{ts}@rome.org"
        speaker_phone = f"+1555{ts % 10000000:07d}"
        res_spk_a = await client.post(
            "/api/clients",
            json={
                "name": "Marcus Aurelius",
                "email": speaker_email,
                "phone": speaker_phone,
                "goal": "Stoic Keynote Oratory",
                "experienceLevel": "Advanced",
                "customCoachNotes": ["Private observation: exceptional vocal cadence"]
            },
            headers=headers_a
        )
        assert res_spk_a.status_code == 201
        spk_a = res_spk_a.json()
        spk_a_id = spk_a["id"]

        # Coach A sees Marcus
        res_a_clients = await client.get("/api/clients", headers=headers_a)
        assert res_a_clients.status_code == 200
        assert any(c["id"] == spk_a_id for c in res_a_clients.json())

        # 4. Coach B cannot see Marcus in roster
        res_b_clients = await client.get("/api/clients", headers=headers_b)
        assert res_b_clients.status_code == 200
        assert not any(c["id"] == spk_a_id for c in res_b_clients.json())

        # 5. Coach B forbidden from viewing Marcus's profile directly
        res_b_view = await client.get(f"/api/clients/{spk_a_id}", headers=headers_b)
        assert res_b_view.status_code == 403

        # 6. Coach B forbidden from updating Marcus
        res_b_update = await client.patch(
            f"/api/clients/{spk_a_id}",
            json={"goal": "Hacked Goal"},
            headers=headers_b
        )
        assert res_b_update.status_code == 403

        # 7. Coach B forbidden from adding notes to Marcus
        res_b_note = await client.post(
            f"/api/clients/{spk_a_id}/notes",
            json={"note": "Unauthorized spy note"},
            headers=headers_b
        )
        assert res_b_note.status_code == 403

        # 8. Coach B forbidden from deleting Marcus
        res_b_del = await client.delete(f"/api/clients/{spk_a_id}", headers=headers_b)
        assert res_b_del.status_code == 403

        # 9. Coach A creates a custom training program / curriculum
        res_prog_a = await client.post(
            "/api/programs",
            json={
                "title": "Classical Rhetoric & Decorum",
                "subtitle": "Ciceronian Delivery Standard",
                "goal": "Keynote Delivery",
                "durationWeeks": 6,
                "daysPerWeek": 3,
                "days": [{"day": 1, "title": "Cadence Drill", "exercises": []}]
            },
            headers=headers_a
        )
        assert res_prog_a.status_code in (200, 201)
        prog_a = res_prog_a.json()
        prog_a_id = prog_a["id"]

        # Coach B cannot see Coach A's curriculum in program list
        res_b_progs = await client.get("/api/programs", headers=headers_b)
        assert res_b_progs.status_code == 200
        assert not any(p["id"] == prog_a_id for p in res_b_progs.json())

        # Coach B forbidden from viewing or modifying Coach A's program directly
        res_b_prog_view = await client.get(f"/api/programs/{prog_a_id}", headers=headers_b)
        assert res_b_prog_view.status_code == 403

        res_b_prog_edit = await client.put(
            f"/api/programs/{prog_a_id}",
            json={"title": "Unauthorized Modification"},
            headers=headers_b
        )
        assert res_b_prog_edit.status_code == 403

        # 10. Coach A schedules a rehearsal session for Marcus
        res_sched = await client.post(
            "/api/workouts",
            json={
                "clientId": spk_a_id,
                "clientName": "Marcus Aurelius",
                "workoutTitle": "Keynote Rehearsal - Act I",
                "date": "2026-09-20",
                "time": "10:00 AM",
                "status": "Scheduled"
            },
            headers=headers_a
        )
        assert res_sched.status_code == 201
        sched_id = res_sched.json()["id"]

        # Coach B cannot see Coach A's rehearsal in workout list
        res_b_workouts = await client.get("/api/workouts", headers=headers_b)
        assert res_b_workouts.status_code == 200
        assert not any(w["id"] == sched_id for w in res_b_workouts.json())

        # Coach B forbidden from getting, modifying, or deleting Coach A's scheduled session
        assert (await client.get(f"/api/workouts/{sched_id}", headers=headers_b)).status_code == 403
        assert (await client.patch(f"/api/workouts/{sched_id}", json={"durationMin": 90}, headers=headers_b)).status_code == 403
        assert (await client.delete(f"/api/workouts/{sched_id}", headers=headers_b)).status_code == 403

        # 11. Coach B forbidden from messaging Coach A's speaker or snooping on chat
        res_b_msg = await client.post(
            "/api/messages",
            json={
                "clientId": spk_a_id,
                "sender": "coach",
                "text": "Hello unauthorized speaker"
            },
            headers=headers_b
        )
        assert res_b_msg.status_code == 403

        res_b_msg_list = await client.get(f"/api/messages?clientId={spk_a_id}", headers=headers_b)
        assert res_b_msg_list.status_code == 403

        print("Multi-tenant Coach Isolation test passed with 100% assertions satisfied!")


@pytest.mark.asyncio
async def test_production_secrets_fail_closed():
    """Verify backend/app/config.py strictly fails closed in production with weak or default secrets."""
    from app.config import Settings

    # 1. Insecure default secret in production fails closed
    with pytest.raises(ValueError) as excinfo:
        Settings(
            ENVIRONMENT="production",
            TESTING=False,
            SECRET_KEY="globalorators-jwt-production-signing-secret-key-2026",
            DEFAULT_COACH_PASSWORD="StrongPassword123!",
            COACH_INVITE_CODE="super-secure-invite-code-2026-xyz"
        )
    assert "SECRET_KEY" in str(excinfo.value)

    # 2. Short secret in production fails closed
    with pytest.raises(ValueError) as excinfo:
        Settings(
            ENVIRONMENT="production",
            TESTING=False,
            SECRET_KEY="short-secret-under-32-chars",
            DEFAULT_COACH_PASSWORD="StrongPassword123!",
            COACH_INVITE_CODE="super-secure-invite-code-2026-xyz"
        )
    assert "SECRET_KEY" in str(excinfo.value)

    # 3. Insecure default coach password in production fails closed
    with pytest.raises(ValueError) as excinfo:
        Settings(
            ENVIRONMENT="production",
            TESTING=False,
            SECRET_KEY="a-strong-custom-production-jwt-key-minimum-32-chars",
            DEFAULT_COACH_PASSWORD="Coach@123",
            COACH_INVITE_CODE="super-secure-invite-code-2026-xyz"
        )
    assert "DEFAULT_COACH_PASSWORD" in str(excinfo.value)

    # 4. Insecure coach invite code in production fails closed
    with pytest.raises(ValueError) as excinfo:
        Settings(
            ENVIRONMENT="production",
            TESTING=False,
            SECRET_KEY="a-strong-custom-production-jwt-key-minimum-32-chars",
            DEFAULT_COACH_PASSWORD="StrongPassword123!",
            COACH_INVITE_CODE="globalorators-coach-invite-2026"
        )
    assert "COACH_INVITE_CODE" in str(excinfo.value)

    # 5. Valid production settings succeed
    valid_prod = Settings(
        ENVIRONMENT="production",
        TESTING=False,
        SECRET_KEY="a-strong-custom-production-jwt-key-minimum-32-chars",
        DEFAULT_COACH_PASSWORD="SuperStrongProductionPassword2026!",
        COACH_INVITE_CODE="super-secure-custom-invite-code-2026"
    )
    assert valid_prod.ENVIRONMENT == "production"
    print("Production secrets fail-closed tests passed!")


@pytest.mark.asyncio
async def test_websocket_authentication_and_room_authorization():
    """Verify WebSocket signaling endpoint mandates in-band authentication and enforces exact room authorization."""
    import json
    import time
    from fastapi.testclient import TestClient
    from starlette.websockets import WebSocketDisconnect
    from app.security import create_access_token
    from app.database import AsyncSessionLocal
    from app.models.user import User
    from app.models.client import Client
    from datetime import datetime, timezone

    ts = int(time.time() * 1000)
    speaker_a_id = f"user-speaker-a-{ts}"
    client_a_id = f"client-a-{ts}"
    speaker_b_id = f"user-speaker-b-{ts}"
    client_b_id = f"client-b-{ts}"

    async with AsyncSessionLocal() as session:
        user_a = User(
            id=speaker_a_id,
            email=f"alpha.{ts}@example.com",
            hashed_password="hash",
            full_name="Speaker Alpha",
            role="speaker",
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        cl_a = Client(
            id=client_a_id,
            coach_id="coach-1",
            name="Speaker Alpha",
            email=f"alpha.{ts}@example.com",
            phone=f"+25470{ts % 10000000:07d}",
            status="Active"
        )
        user_b = User(
            id=speaker_b_id,
            email=f"bravo.{ts}@example.com",
            hashed_password="hash",
            full_name="Speaker Bravo",
            role="speaker",
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        cl_b = Client(
            id=client_b_id,
            coach_id="coach-1",
            name="Speaker Bravo",
            email=f"bravo.{ts}@example.com",
            phone=f"+25471{ts % 10000000:07d}",
            status="Active"
        )
        session.add_all([user_a, cl_a, user_b, cl_b])
        await session.commit()

    coach_token = create_access_token("coach-1")
    token_a = create_access_token(speaker_a_id)
    token_b = create_access_token(speaker_b_id)

    with TestClient(app) as tc:
        # 1. Anonymous connection without query token: if client attempts signaling without auth frame, rejected with 1008
        with tc.websocket_connect(f"/ws/signaling/GlobalOrators-SpeakerAlpha-{client_a_id}") as ws:
            ws.send_text(json.dumps({"type": "peer-ready"}))
            with pytest.raises(WebSocketDisconnect) as excinfo:
                ws.receive_text()
            assert excinfo.value.code == 1008

        # 2. In-band authentication handshake with invalid token is rejected with 1008
        with tc.websocket_connect(f"/ws/signaling/GlobalOrators-SpeakerAlpha-{client_a_id}") as ws:
            ws.send_text(json.dumps({"type": "auth", "token": "invalid.jwt.token"}))
            with pytest.raises(WebSocketDisconnect) as excinfo:
                ws.receive_text()
            assert excinfo.value.code == 1008

        # 3. Successful in-band authentication handshake by Coach
        with tc.websocket_connect(f"/ws/signaling/GlobalOrators-SpeakerAlpha-{client_a_id}") as ws:
            ws.send_text(json.dumps({"type": "auth", "token": coach_token}))
            ack = json.loads(ws.receive_text())
            assert ack.get("type") == "auth-success"
            ws.send_text(json.dumps({"type": "peer-ready"}))

        # 4. Successful in-band authentication handshake by Speaker A in their own room
        with tc.websocket_connect(f"/ws/signaling/GlobalOrators-SpeakerAlpha-{client_a_id}") as ws:
            ws.send_text(json.dumps({"type": "auth", "token": token_a}))
            ack = json.loads(ws.receive_text())
            assert ack.get("type") == "auth-success"
            ws.send_text(json.dumps({"type": "peer-ready"}))

        # 5. Exact room authorization: Speaker B is rejected when attempting to enter Speaker A's room
        with tc.websocket_connect(f"/ws/signaling/GlobalOrators-SpeakerAlpha-{client_a_id}") as ws:
            ws.send_text(json.dumps({"type": "auth", "token": token_b}))
            with pytest.raises(WebSocketDisconnect) as excinfo:
                ws.receive_text()
            assert excinfo.value.code == 1008

        # 6. Backward-compatible query string token authentication
        with tc.websocket_connect(f"/ws/signaling/GlobalOrators-SpeakerAlpha-{client_a_id}?token={coach_token}") as ws:
            ack = json.loads(ws.receive_text())
            assert ack.get("type") == "auth-success"
            ws.send_text(json.dumps({"type": "peer-ready"}))

        print("WebSocket authentication and room authorization tests passed!")


@pytest.mark.asyncio
async def test_public_client_hardening_and_lookup_protection():
    """Verify loose name search is blocked on /lookup and public unauthenticated callers cannot overwrite protected profile fields."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        import time
        ts = int(time.time() * 1000)

        # 1. Unauthenticated /lookup is rejected with 401 Unauthorized (C1 Audit Fix)
        res_unauth = await client.get("/api/clients/lookup?search=Marcus")
        assert res_unauth.status_code in (401, 404)

        # 2. Login coach
        coach_res = await client.post(
            "/api/auth/login",
            json={"email": settings.DEFAULT_COACH_EMAIL, "password": settings.DEFAULT_COACH_PASSWORD}
        )
        coach_token = coach_res.json()["access_token"]
        coach_headers = {"Authorization": f"Bearer {coach_token}"}

        # Authenticated lookup for non-existent client ID returns 404
        res_name_lookup = await client.get("/api/clients/lookup?search=Marcus", headers=coach_headers)
        assert res_name_lookup.status_code == 404

        # 3. Onboard a speaker with coach notes and assignments via coach
        test_email = f"protected.speaker.{ts}@example.com"
        test_phone = f"+25470{ts % 10000000:07d}"

        res_create = await client.post(
            "/api/clients",
            json={
                "name": "Protected Orator",
                "email": test_email,
                "phone": test_phone,
                "goal": "National Championship",
                "complianceRate": 95.0,
                "customCoachNotes": ["Top Secret Faculty Evaluation: Gold Tier Cadence"]
            },
            headers=coach_headers
        )
        assert res_create.status_code == 201
        created_client = res_create.json()
        assert created_client["customCoachNotes"] == ["Top Secret Faculty Evaluation: Gold Tier Cadence"]

        # 4. Unauthenticated /lookup is rejected with 401 (C1 Audit Fix)
        res_pub_lookup = await client.get(f"/api/clients/lookup?search={test_email}")
        assert res_pub_lookup.status_code in (401, 404)

        # Authenticated access by coach returns profile with coach notes intact
        res_coach_get = await client.get(f"/api/clients/{created_client['id']}", headers=coach_headers)
        assert res_coach_get.status_code == 200
        assert res_coach_get.json()["customCoachNotes"] == ["Top Secret Faculty Evaluation: Gold Tier Cadence"]

        # Authenticated access by speaker via /api/clients/me redacts coach notes
        res_speaker_auth = await client.post("/api/auth/otp/verify", json={"email": test_email, "code": "123456"})
        assert res_speaker_auth.status_code == 200
        speaker_token = res_speaker_auth.json()["access_token"]
        speaker_headers = {"Authorization": f"Bearer {speaker_token}"}

        res_speaker_me = await client.get("/api/clients/me", headers=speaker_headers)
        assert res_speaker_me.status_code == 200
        assert res_speaker_me.json()["customCoachNotes"] == []

        # 4. Unauthenticated attempt to overwrite coach notes or compliance rate is ignored
        malicious_payload = {
            "name": "Hacked Orator",
            "email": test_email,
            "phone": test_phone,
            "goal": "Hacked Goal",
            "complianceRate": 0.0,
            "customCoachNotes": ["Attacker Injected Note"]
        }
        res_tamper = await client.post("/api/clients", json=malicious_payload)
        assert res_tamper.status_code == 201
        # Re-check via coach: notes must be unchanged
        res_verify = await client.get(f"/api/clients/{created_client['id']}", headers=coach_headers)
        assert res_verify.status_code == 200
        assert res_verify.json()["customCoachNotes"] == ["Top Secret Faculty Evaluation: Gold Tier Cadence"]
        assert res_verify.json()["name"] == "Protected Orator"  # Name not modified by unauthenticated caller

        print("Public client hardening and lookup protection tests passed!")


@pytest.mark.asyncio
async def test_idor_protection_for_habits_metrics_photos_prs():
    """Verify strict IDOR protection across habits, metrics, photos, and PRs for both speakers and coaches."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        import time
        ts = int(time.time() * 1000)

        # 1. Register Speaker A
        email_a = f"speaker.alpha.{ts}@example.com"
        res_a = await client.post(
            "/api/auth/register",
            json={"email": email_a, "password": "Password123!", "full_name": "Speaker Alpha", "role": "speaker"}
        )
        token_a = res_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Onboard client record for Speaker A
        res_cl_a = await client.post(
            "/api/clients",
            json={"name": "Speaker Alpha", "email": email_a, "phone": f"+1000{ts % 1000000:06d}"}
        )
        client_a_id = res_cl_a.json()["id"]

        # 2. Register Speaker B
        email_b = f"speaker.bravo.{ts}@example.com"
        res_b = await client.post(
            "/api/auth/register",
            json={"email": email_b, "password": "Password123!", "full_name": "Speaker Bravo", "role": "speaker"}
        )
        token_b = res_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # 3. Habits IDOR Tests: Speaker B cannot view or toggle Speaker A's habits
        res_habits_view = await client.get(f"/api/habits?clientId={client_a_id}", headers=headers_b)
        assert res_habits_view.status_code == 403

        res_habits_toggle = await client.post(
            "/api/habits/toggle",
            json={"clientId": client_a_id, "habitId": "h-1", "date": "2026-09-13"},
            headers=headers_b
        )
        assert res_habits_toggle.status_code == 403

        # 4. Metrics IDOR Tests: Speaker B cannot view or log metrics for Speaker A
        res_metrics_view = await client.get(f"/api/metrics?clientId={client_a_id}", headers=headers_b)
        assert res_metrics_view.status_code == 403

        res_metrics_create = await client.post(
            "/api/metrics",
            json={"clientId": client_a_id, "weightKg": 75.0, "date": "2026-09-13"},
            headers=headers_b
        )
        assert res_metrics_create.status_code == 403

        # 5. Photos IDOR Tests: Speaker B cannot view or post photos for Speaker A
        res_photos_view = await client.get(f"/api/photos?clientId={client_a_id}", headers=headers_b)
        assert res_photos_view.status_code == 403

        res_photos_create = await client.post(
            "/api/photos",
            json={"clientId": client_a_id, "photoUrl": "https://example.com/p.jpg", "type": "Stage", "date": "2026-09-13"},
            headers=headers_b
        )
        assert res_photos_create.status_code == 403

        # 6. PRs IDOR Tests: Speaker B cannot view or log PRs for Speaker A
        res_prs_view = await client.get(f"/api/prs?clientId={client_a_id}", headers=headers_b)
        assert res_prs_view.status_code == 403

        res_prs_create = await client.post(
            "/api/prs",
            json={
                "client_id": client_a_id,
                "exercise_name": "Cadence Test",
                "weight_kg": 150.0,
                "reps": 1,
                "estimated_1rm_kg": 150.0,
                "date": "2026-09-13"
            },
            headers=headers_b
        )
        assert res_prs_create.status_code == 403

        # 7. Speaker A can access their own resources successfully
        res_a_habits = await client.get(f"/api/habits?clientId={client_a_id}", headers=headers_a)
        assert res_a_habits.status_code == 200

        res_a_metrics = await client.post(
            "/api/metrics",
            json={"clientId": client_a_id, "weightKg": 80.0, "date": "2026-09-13"},
            headers=headers_a
        )
        assert res_a_metrics.status_code == 201

        print("IDOR protection tests for habits, metrics, photos, and PRs passed 100%!")


@pytest.mark.asyncio
async def test_rate_limiter_engine():
    """Verify sliding-window rate limiter throttles excessive requests and enforces trusted proxy boundary."""
    from app.rate_limiter import InMemoryRateLimiter, is_trusted_proxy, get_client_ip
    from starlette.requests import Request
    
    limiter = InMemoryRateLimiter()
    key = "test_user_ip"

    # Limit = 3 requests per 10 seconds
    for i in range(3):
        assert await limiter.check(key, limit=3, window_seconds=10, ignore_testing=True) is True

    # 4th request must be rejected
    assert await limiter.check(key, limit=3, window_seconds=10, ignore_testing=True) is False

    # Trusted proxy verification
    assert is_trusted_proxy("127.0.0.1") is True
    assert is_trusted_proxy("::1") is True
    assert is_trusted_proxy("10.0.4.15") is True
    assert is_trusted_proxy("172.20.0.1") is True
    assert is_trusted_proxy("192.168.1.100") is True
    assert is_trusted_proxy("203.0.113.195") is False  # Public untrusted IP
    assert is_trusted_proxy("198.51.100.2") is False

    # Anti-spoofing check for get_client_ip:
    # 1. Untrusted peer IP sending spoofed X-Forwarded-For is ignored
    scope_untrusted = {
        "type": "http",
        "client": ("203.0.113.195", 54321),
        "headers": [(b"x-forwarded-for", b"8.8.8.8, 1.1.1.1")],
    }
    req_untrusted = Request(scope_untrusted)
    assert get_client_ip(req_untrusted) == "203.0.113.195"

    # 2. Trusted proxy peer IP honors X-Forwarded-For
    scope_trusted = {
        "type": "http",
        "client": ("127.0.0.1", 54321),
        "headers": [(b"x-forwarded-for", b"198.51.100.42, 10.0.0.1")],
    }
    req_trusted = Request(scope_trusted)
    assert get_client_ip(req_trusted) == "198.51.100.42"

    print("Rate limiter engine and trusted proxy unit tests passed successfully!")


@pytest.mark.asyncio
async def test_coach_referrals_reassignment_and_adjudication():
    """Verify coach referral attribution, intake triage pool, coach reassignment, and shared panel adjudication."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        import time
        ts = int(time.time() * 1000)

        # 1. Check GET /api/coaches returns coaches directory
        res_coaches = await client.get("/api/coaches")
        assert res_coaches.status_code == 200
        coaches_list = res_coaches.json()
        assert len(coaches_list) >= 1
        assert any(c["id"] == "coach-1" for c in coaches_list)

        # 2. Register Coach Gamma
        res_gamma = await client.post(
            "/api/auth/register",
            json={
                "email": f"coach.gamma.{ts}@globalorators.org",
                "password": "Password123!",
                "full_name": "Coach Gamma",
                "role": "coach",
                "coach_invite_code": settings.COACH_INVITE_CODE
            }
        )
        assert res_gamma.status_code == 200
        token_gamma = res_gamma.json()["access_token"]
        headers_gamma = {"Authorization": f"Bearer {token_gamma}"}
        coach_gamma_id = res_gamma.json()["user"]["id"]

        # 3. Public speaker registers WITH Coach Gamma's referral code
        speaker_email_referred = f"referred.speaker.{ts}@example.com"
        res_ref = await client.post(
            "/api/clients",
            json={
                "name": "Referred Orator",
                "email": speaker_email_referred,
                "phone": f"+25470{ts % 10000000:07d}",
                "coachRef": coach_gamma_id,
                "goal": "Keynote & Conference"
            }
        )
        assert res_ref.status_code == 201
        referred_client = res_ref.json()
        assert referred_client["coachId"] == coach_gamma_id
        assert referred_client["referralCode"] == coach_gamma_id

        # 4. Public speaker registers WITHOUT coach referral -> Lands in unassigned intake triage pool
        speaker_email_unassigned = f"unassigned.speaker.{ts}@example.com"
        res_unassigned = await client.post(
            "/api/clients",
            json={
                "name": "Unassigned Orator",
                "email": speaker_email_unassigned,
                "phone": f"+25471{ts % 10000000:07d}",
                "goal": "Competitive Debate"
            }
        )
        assert res_unassigned.status_code == 201
        unassigned_client = res_unassigned.json()
        assert unassigned_client["coachId"] is None
        unassigned_id = unassigned_client["id"]

        # 5. Intake filtering:
        # Coach Gamma queries ?intake=unassigned and sees unassigned applicant
        res_pool = await client.get("/api/clients?intake=unassigned", headers=headers_gamma)
        assert res_pool.status_code == 200
        pool_clients = res_pool.json()
        assert any(c["id"] == unassigned_id for c in pool_clients)

        # 6. Reassignment / Claiming:
        # Coach Gamma claims/reassigns the unassigned applicant to themselves
        res_claim = await client.patch(
            f"/api/clients/{unassigned_id}/reassign-coach",
            json={
                "coachId": coach_gamma_id,
                "reason": "Claimed from intake pool for debate coaching"
            },
            headers=headers_gamma
        )
        assert res_claim.status_code == 200
        claimed_client = res_claim.json()
        assert claimed_client["coachId"] == coach_gamma_id
        assert any("Reassigned from Unassigned Intake to Coach Coach Gamma" in note for note in claimed_client["customCoachNotes"])

        # 7. Head Coach reassigns from Coach Gamma to Coach-1
        res_head = await client.post(
            "/api/auth/login",
            json={"email": settings.DEFAULT_COACH_EMAIL, "password": settings.DEFAULT_COACH_PASSWORD}
        )
        head_token = res_head.json()["access_token"]
        headers_head = {"Authorization": f"Bearer {head_token}"}

        res_reassign_head = await client.patch(
            f"/api/clients/{unassigned_id}/reassign-coach",
            json={
                "coachId": "coach-1",
                "reason": "Executive transfer by Head Coach"
            },
            headers=headers_head
        )
        assert res_reassign_head.status_code == 200
        assert res_reassign_head.json()["coachId"] == "coach-1"

        # 8. Shared Panel Adjudication:
        # Coach Gamma leaves an adjudication note on the speaker now owned by Coach-1
        res_adj = await client.post(
            f"/api/clients/{unassigned_id}/adjudication-notes",
            json={
                "note": "Remarkable rhetorical framing during opening proposition.",
                "rubricCategory": "Argumentation & Logic",
                "rating": 9.5
            },
            headers=headers_gamma
        )
        assert res_adj.status_code == 200
        adj_client = res_adj.json()
        assert len(adj_client["adjudicatorNotes"]) >= 1
        note_entry = adj_client["adjudicatorNotes"][0]
        assert note_entry["coachId"] == coach_gamma_id
        assert note_entry["coachName"] == "Coach Gamma"
        assert note_entry["rubricCategory"] == "Argumentation & Logic"
        assert note_entry["rating"] == 9.5

        # 9. Enrolled speaker curriculum access
        # Create speaker user and login
        spk_res = await client.post(
            "/api/auth/register",
            json={
                "email": speaker_email_unassigned,
                "password": "Password123!",
                "full_name": "Unassigned Orator",
                "role": "speaker"
            }
        )
        assert spk_res.status_code == 200
        spk_token = spk_res.json()["access_token"]
        headers_spk = {"Authorization": f"Bearer {spk_token}"}

        # Head Coach creates private program and assigns to this speaker
        prog_res = await client.post(
            "/api/programs",
            json={
                "title": "Head Coach Private Masterclass",
                "subtitle": "Restricted Masterclass",
                "goal": "Competitive Debate",
                "durationWeeks": 8,
                "daysPerWeek": 3,
                "days": []
            },
            headers=headers_head
        )
        assert prog_res.status_code == 201
        prog_id = prog_res.json()["id"]

        # Assign program to speaker
        await client.post(
            f"/api/programs/{prog_id}/assign",
            json={"clientId": unassigned_id},
            headers=headers_head
        )

        # Enrolled speaker can access this coach-owned program
        spk_prog_view = await client.get(f"/api/programs/{prog_id}", headers=headers_spk)
        assert spk_prog_view.status_code == 200
        assert spk_prog_view.json()["title"] == "Head Coach Private Masterclass"

        print("Coach referral, triage pool, reassignment, adjudication, and program access tests all passed!")


@pytest.mark.asyncio
async def test_email_otp_authentication_flow():
    """Verify passwordless email OTP generation, verification, and speaker session issuance."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        import time
        ts = int(time.time() * 1000)
        otp_speaker_email = f"otp.speaker.{ts}@example.com"
        otp_speaker_phone = f"+25472{ts % 10000000:07d}"

        # 1. Onboard a speaker so their email is registered in client records
        res_onboard = await client.post(
            "/api/clients",
            json={
                "name": "OTP Authenticated Speaker",
                "email": otp_speaker_email,
                "phone": otp_speaker_phone,
                "branch": "Academy",
                "goal": "Executive Presence"
            }
        )
        assert res_onboard.status_code == 201

        # 2. Attempt OTP dispatch with invalid email format fails (422)
        res_bad_email = await client.post(
            "/api/auth/otp/send",
            json={"email": "not-an-email"}
        )
        assert res_bad_email.status_code == 422

        # 3. Attempt OTP dispatch with unregistered email returns uniform 200 anti-enumeration response (M2 Audit Fix)
        res_unregistered = await client.post(
            "/api/auth/otp/send",
            json={"email": "unregistered.random@example.com"}
        )
        assert res_unregistered.status_code == 200
        assert res_unregistered.json()["status"] == "sent"

        # 4. Dispatch OTP for registered speaker succeeds (200)
        res_send = await client.post(
            "/api/auth/otp/send",
            json={"email": otp_speaker_email}
        )
        assert res_send.status_code == 200
        send_data = res_send.json()
        assert send_data["status"] == "sent"
        assert send_data["email"] == otp_speaker_email

        # 5. Verify OTP with invalid passcode fails (401 Unauthorized)
        res_bad_code = await client.post(
            "/api/auth/otp/verify",
            json={"email": otp_speaker_email, "code": "000000"}
        )
        assert res_bad_code.status_code == 401

        # 6. Verify OTP with test bypass code (123456) in testing environment succeeds (200)
        res_verify = await client.post(
            "/api/auth/otp/verify",
            json={"email": otp_speaker_email, "code": "123456"}
        )
        assert res_verify.status_code == 200
        verify_data = res_verify.json()
        assert "access_token" in verify_data
        assert verify_data["token_type"] == "bearer"
        assert verify_data["user"]["email"] == otp_speaker_email
        assert verify_data["user"]["role"] == "speaker"

        speaker_token = verify_data["access_token"]
        speaker_headers = {"Authorization": f"Bearer {speaker_token}"}

        # 7. Authenticated speaker resolves their own profile via /api/clients/me (C1 Audit Fix)
        res_own_me = await client.get(
            "/api/clients/me",
            headers=speaker_headers
        )
        assert res_own_me.status_code == 200
        assert res_own_me.json()["email"] == otp_speaker_email

        # 8. Unauthenticated /api/clients/lookup is completely blocked (401 or 404)
        res_other_lookup = await client.get(
            f"/api/clients/lookup?search={otp_speaker_email}"
        )
        assert res_other_lookup.status_code in (401, 404)

        print("Email OTP passwordless authentication flow verified successfully!")


@pytest.mark.asyncio
async def test_magic_link_authentication_flow():
    """Verify 1-click magic link dispatch, verification, anti-replay, and speaker auto-provisioning."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        import time
        import urllib.parse
        ts = int(time.time() * 1000)
        magic_email = f"magic.speaker.{ts}@example.com"

        # 1. Request OTP / magic link with redirect_url
        res_send = await client.post(
            "/api/auth/otp/send",
            json={"email": magic_email, "redirect_url": "http://localhost:3000"}
        )
        assert res_send.status_code == 200
        send_data = res_send.json()
        assert send_data["status"] == "sent"
        assert send_data["email"] == magic_email
        assert "magic_link" in send_data
        magic_link = send_data["magic_link"]
        assert magic_link is not None
        assert "magic_token=" in magic_link

        # Extract token from magic link url
        parsed = urllib.parse.urlparse(magic_link)
        params = urllib.parse.parse_qs(parsed.query)
        magic_token = params["magic_token"][0]

        # 2. Attempt verification with invalid token fails (400)
        res_invalid = await client.post(
            "/api/auth/magic-link/verify",
            json={"token": "invalid-token-xyz"}
        )
        assert res_invalid.status_code == 400

        # 3. Verify magic link with valid token succeeds (200)
        res_verify = await client.post(
            "/api/auth/magic-link/verify",
            json={"token": magic_token, "email": magic_email}
        )
        assert res_verify.status_code == 200
        verify_data = res_verify.json()
        assert "access_token" in verify_data
        assert verify_data["user"]["email"] == magic_email
        assert verify_data["user"]["role"] == "speaker"

        # 4. Anti-replay check: Attempting to verify the exact same token again fails (400)
        res_replay = await client.post(
            "/api/auth/magic-link/verify",
            json={"token": magic_token, "email": magic_email}
        )
        assert res_replay.status_code == 400

        # 5. Verify the issued access token works on /api/clients/me
        speaker_token = verify_data["access_token"]
        res_me = await client.get(
            "/api/clients/me",
            headers={"Authorization": f"Bearer {speaker_token}"}
        )
        assert res_me.status_code == 200
        assert res_me.json()["email"] == magic_email

        print("Magic link authentication flow verified successfully!")



@pytest.mark.asyncio
async def test_authenticated_vault_persistence_and_recordings():
    """Verify authenticated database persistence for journals, executive simulations, and audio recordings."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        import time
        ts = int(time.time() * 1000)
        speaker_a_email = f"vault.speaker.a.{ts}@example.com"
        speaker_b_email = f"vault.speaker.b.{ts}@example.com"

        # Onboard Speaker A and Speaker B
        res_a = await client.post("/api/clients", json={
            "name": "Speaker Alpha",
            "email": speaker_a_email,
            "phone": f"+25471{ts % 10000000:07d}",
            "branch": "Foundation",
            "goal": "Vocal Catharsis"
        })
        assert res_a.status_code == 201
        client_a = res_a.json()

        res_b = await client.post("/api/clients", json={
            "name": "Speaker Beta",
            "email": speaker_b_email,
            "phone": f"+25473{ts % 10000000:07d}",
            "branch": "Executive",
            "goal": "Boardroom Presence"
        })
        assert res_b.status_code == 201
        client_b = res_b.json()

        # Authenticate Speaker A and B via OTP verification to obtain authentic sessions
        res_auth_a = await client.post("/api/auth/otp/verify", json={"email": speaker_a_email, "code": "123456"})
        assert res_auth_a.status_code == 200
        headers_a = {"Authorization": f"Bearer {res_auth_a.json()['access_token']}"}

        res_auth_b = await client.post("/api/auth/otp/verify", json={"email": speaker_b_email, "code": "123456"})
        assert res_auth_b.status_code == 200
        headers_b = {"Authorization": f"Bearer {res_auth_b.json()['access_token']}"}

        # 1. Journals Persistence (Catharsis Vault)
        # Speaker A writes reflection
        res_j = await client.post("/api/journals", json={
            "client_id": client_a["id"],
            "date": "Sep 14, 2026",
            "text": "Released deep anxiety around imposter syndrome on stage.",
            "feel_before": "Anxious & Suppressed",
            "feel_after": "Relieved, Grounded & Sovereign"
        }, headers=headers_a)
        assert res_j.status_code == 201
        journal_entry = res_j.json()
        assert journal_entry["text"] == "Released deep anxiety around imposter syndrome on stage."

        # Speaker A can fetch their journals
        res_list_j = await client.get(f"/api/journals?clientId={client_a['id']}", headers=headers_a)
        assert res_list_j.status_code == 200
        assert len(res_list_j.json()) >= 1
        assert res_list_j.json()[0]["id"] == journal_entry["id"]

        # IDOR Isolation: Speaker B cannot access Speaker A's journals (403)
        res_list_j_idor = await client.get(f"/api/journals?clientId={client_a['id']}", headers=headers_b)
        assert res_list_j_idor.status_code == 403

        # IDOR Isolation: Speaker B cannot delete Speaker A's journal
        res_del_j_idor = await client.delete(f"/api/journals/{journal_entry['id']}", headers=headers_b)
        assert res_del_j_idor.status_code == 403

        # 2. Executive Simulations Persistence
        res_s = await client.post("/api/simulations", json={
            "client_id": client_b["id"],
            "date": "Sep 14, 2026",
            "arena": "Series A / Growth Capital Venture Pitch",
            "summary": "Pitching $10M Series A round with bottom-line upfront thesis.",
            "wpm": 138,
            "coach_status": "Vault Persisted"
        }, headers=headers_b)
        assert res_s.status_code == 201
        sim_entry = res_s.json()
        assert sim_entry["wpm"] == 138

        # Speaker B can fetch their simulations
        res_list_s = await client.get(f"/api/simulations?clientId={client_b['id']}", headers=headers_b)
        assert res_list_s.status_code == 200
        assert len(res_list_s.json()) >= 1

        # IDOR Isolation: Speaker A cannot access Speaker B's simulations
        res_list_s_idor = await client.get(f"/api/simulations?clientId={client_b['id']}", headers=headers_a)
        assert res_list_s_idor.status_code == 403

        # 3. Audio Recordings Persistence
        fake_audio_bytes = b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00data\x00\x00\x00\x00"
        upload_files = {
            "file": ("rehearsal.webm", fake_audio_bytes, "audio/webm")
        }
        upload_data = {
            "clientId": client_a["id"],
            "title": "Chamber Rehearsal 1",
            "duration_seconds": "45"
        }
        res_rec = await client.post(
            "/api/recordings/upload",
            data=upload_data,
            files=upload_files,
            headers=headers_a
        )
        assert res_rec.status_code == 201
        rec_entry = res_rec.json()
        assert rec_entry["title"] == "Chamber Rehearsal 1"
        assert rec_entry["duration_seconds"] == 45
        rec_id = rec_entry["id"]

        # Speaker A can list recordings
        res_list_rec = await client.get(f"/api/recordings?clientId={client_a['id']}", headers=headers_a)
        assert res_list_rec.status_code == 200
        assert len(res_list_rec.json()) >= 1
        assert res_list_rec.json()[0]["id"] == rec_id

        # Speaker A can stream recording audio
        res_stream = await client.get(f"/api/recordings/{rec_id}/stream", headers=headers_a)
        assert res_stream.status_code == 200
        assert res_stream.content == fake_audio_bytes

        # IDOR Isolation: Speaker B cannot access Speaker A's recordings
        res_list_rec_idor = await client.get(f"/api/recordings?clientId={client_a['id']}", headers=headers_b)
        assert res_list_rec_idor.status_code == 403

        res_stream_rec_idor = await client.get(f"/api/recordings/{rec_id}/stream", headers=headers_b)
        assert res_stream_rec_idor.status_code == 403

        # 4. Audio Content Validation: Reject invalid audio binary magic bytes (returns 400)
        invalid_files = {
            "file": ("malicious.sh", b"#!/bin/bash\necho 'hacked'", "audio/webm")
        }
        res_invalid_magic = await client.post(
            "/api/recordings/upload",
            data=upload_data,
            files=invalid_files,
            headers=headers_a
        )
        assert res_invalid_magic.status_code == 400
        assert "Invalid audio binary header" in res_invalid_magic.json()["detail"]

        # 5. Audio Content Validation: File size limit (>25MB returns 413)
        oversized_files = {
            "file": ("large.wav", b"RIFF" + (b"\x00" * (26 * 1024 * 1024)), "audio/wav")
        }
        res_oversized = await client.post(
            "/api/recordings/upload",
            data=upload_data,
            files=oversized_files,
            headers=headers_a
        )
        assert res_oversized.status_code == 413
        assert "exceeds maximum permitted size" in res_oversized.json()["detail"]

        # 6. Recording Deletion and IDOR Protection
        # Speaker B cannot delete Speaker A's recording (403)
        res_del_idor = await client.delete(f"/api/recordings/{rec_id}", headers=headers_b)
        assert res_del_idor.status_code == 403

        # Speaker A can delete their recording (200)
        res_del = await client.delete(f"/api/recordings/{rec_id}", headers=headers_a)
        assert res_del.status_code == 200

        # After deletion, stream returns 404
        res_stream_deleted = await client.get(f"/api/recordings/{rec_id}/stream", headers=headers_a)
        assert res_stream_deleted.status_code == 404

        # 7. Explicitly Extinguished Legacy Speaker Lookup Route
        # Both unauthenticated and authenticated calls to /api/clients/lookup return 404
        res_lookup_unauth = await client.get("/api/clients/lookup")
        assert res_lookup_unauth.status_code == 404
        assert "speaker lookup endpoint has been removed" in res_lookup_unauth.json()["detail"]

        res_lookup_auth = await client.get("/api/clients/lookup", headers=headers_a)
        assert res_lookup_auth.status_code == 404
        assert "speaker lookup endpoint has been removed" in res_lookup_auth.json()["detail"]

        print("Authenticated vault persistence and recordings tests passed flawlessly!")


@pytest.mark.asyncio
async def test_storage_service_and_multi_session_persistence():
    """
    Verify durable storage service abstraction and full multi-session persistence.
    Proves that onboarding, assignments, journals, simulations, habits, metrics,
    and recordings survive session boundaries and remain server-authoritative.
    """
    import time
    from app.storage import storage_service
    from app.security import create_access_token

    # 1. StorageService verification
    test_key = f"recordings/unit-test-{int(time.time())}.webm"
    test_data = b"\x1a\x45\xdf\xa3" + b"\x00" * 512
    saved_key = await storage_service.save_file(test_key, test_data, "audio/webm")
    assert saved_key == test_key
    assert storage_service.exists(test_key) is True

    read_data = await storage_service.read_file(test_key)
    assert read_data == test_data

    stats = storage_service.get_storage_stats()
    assert "total_bytes_used" in stats
    assert stats["file_count"] >= 1
    assert stats["backend"] in ("local", "s3")

    deleted = await storage_service.delete_file(test_key)
    assert deleted is True
    assert storage_service.exists(test_key) is False

    # 2. Multi-Session Server-Authoritative Persistence Flow
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        ts = int(time.time() * 1000)
        speaker_email = f"persisted.orator.{ts}@globalorators.org"
        speaker_name = f"Persisted Orator {ts}"

        # Session 1: Onboard speaker
        res_onboard = await client.post(
            "/api/clients",
            json={
                "name": speaker_name,
                "email": speaker_email,
                "branch": "Academy",
                "goal": "Competitive Debate",
                "experienceLevel": "Novice Speaker",
                "onboardingSurvey": {
                    "branch": "Academy",
                    "fullName": speaker_name,
                    "email": speaker_email,
                    "primaryDiscipline": "Decolonial Parliamentary Forensics",
                    "coreFocus": "Ideological Rigor & Rebuttal Depth",
                    "missionFocus": "Pan-African Leadership & Cognitive Deconditioning",
                    "speakingGoal": "Competitive Debate",
                    "experienceLevel": "Novice Speaker",
                    "vocalBaselinePace": 142,
                    "emotionalOpennessRating": 8,
                    "selectedHabits": [
                        "Vocal Hydration (2.5L + Warm Lemon Water)",
                        "Diaphragmatic Breathwork (10 min daily)"
                    ]
                }
            }
        )
        assert res_onboard.status_code in (200, 201)
        client_data = res_onboard.json()
        client_id = client_data["id"]

        # Session 1: Create speaker User and authenticate
        from app.database import AsyncSessionLocal
        from app.models.user import User
        from app.security import get_password_hash
        from datetime import datetime, timezone

        speaker_user_id = f"user-speaker-{ts}"
        async with AsyncSessionLocal() as session:
            spk_user = User(
                id=speaker_user_id,
                email=speaker_email.lower(),
                hashed_password=get_password_hash("SpeakerSecure@123"),
                full_name=speaker_name,
                role="speaker",
                is_active=True,
                created_at=datetime.now(timezone.utc)
            )
            session.add(spk_user)
            await session.commit()

        session1_token = create_access_token(speaker_user_id)
        headers_s1 = {"Authorization": f"Bearer {session1_token}"}

        # Verify profile binds to /api/clients/me
        res_me = await client.get("/api/clients/me", headers=headers_s1)
        assert res_me.status_code == 200
        assert res_me.json()["email"] == speaker_email

        # Session 1: Create journal entry
        res_journal = await client.post(
            "/api/journals",
            headers=headers_s1,
            json={
                "client_id": client_id,
                "date": "2026-09-15",
                "text": "Session 1 deep reflection on forensic argument framing.",
                "feel_before": "Anxious",
                "feel_after": "Grounded"
            }
        )
        assert res_journal.status_code in (200, 201)
        journal_id = res_journal.json()["id"]

        # Session 1: Create executive simulation
        res_sim = await client.post(
            "/api/simulations",
            headers=headers_s1,
            json={
                "client_id": client_id,
                "date": "2026-09-15",
                "arena": "Boardroom Pitch",
                "summary": "Completed opening 60-second value thesis simulation.",
                "wpm": 138,
                "coach_status": "Pending Review"
            }
        )
        assert res_sim.status_code in (200, 201)
        sim_id = res_sim.json()["id"]

        # Session 1: Toggle habit
        res_habit = await client.post(
            "/api/habits/toggle",
            headers=headers_s1,
            json={
                "clientId": client_id,
                "date": "2026-09-15",
                "habitId": "h-1"
            }
        )
        assert res_habit.status_code == 200

        # Session 1: Upload recording
        audio_content = b"\x1a\x45\xdf\xa3" + b"\x00\x00\x00\x01\x02\x03\x04"
        res_rec = await client.post(
            "/api/recordings/upload",
            headers=headers_s1,
            data={"clientId": client_id, "title": "Multi-session Drill", "duration_seconds": "45"},
            files={"file": ("rehearsal.webm", audio_content, "audio/webm")}
        )
        assert res_rec.status_code == 201
        rec_id = res_rec.json()["id"]
        assert "storage_key" in res_rec.json()

        # Session 1 ends: "Log out" (client drops token and memory state)
        headers_s1.clear()

        # Session 2: New session start! Authenticate afresh
        session2_token = create_access_token(speaker_user_id)
        headers_s2 = {"Authorization": f"Bearer {session2_token}"}

        # Session 2 verifies /clients/me returns the authoritative identity
        res_me_s2 = await client.get("/api/clients/me", headers=headers_s2)
        assert res_me_s2.status_code == 200
        assert res_me_s2.json()["id"] == client_id

        # Session 2 verifies journals persisted
        res_journals_s2 = await client.get("/api/journals", headers=headers_s2)
        assert res_journals_s2.status_code == 200
        journals_list = res_journals_s2.json()
        assert any(j["id"] == journal_id for j in journals_list)

        # Session 2 verifies simulations persisted
        res_sims_s2 = await client.get("/api/simulations", headers=headers_s2)
        assert res_sims_s2.status_code == 200
        sims_list = res_sims_s2.json()
        assert any(s["id"] == sim_id for s in sims_list)

        # Session 2 verifies habits persisted
        res_habits_s2 = await client.get(f"/api/habits?clientId={client_id}&date=2026-09-15", headers=headers_s2)
        assert res_habits_s2.status_code == 200
        habits_list = res_habits_s2.json()
        assert len(habits_list) >= 1

        # Session 2 verifies audio recording stream is playable and persisted
        res_stream_s2 = await client.get(f"/api/recordings/{rec_id}/stream", headers=headers_s2)
        assert res_stream_s2.status_code == 200
        assert res_stream_s2.content == audio_content

        # Cleanup test recording
        await client.delete(f"/api/recordings/{rec_id}", headers=headers_s2)

    print("Storage service and multi-session persistence verified successfully!")


@pytest.mark.asyncio
async def test_auth_check_email():
    """Verify /api/auth/check-email identifies existing accounts and auth methods correctly."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Non-existent email
        res_nonexistent = await client.post("/api/auth/check-email", json={"email": "nonexistent@example.com"})
        assert res_nonexistent.status_code == 200
        data_none = res_nonexistent.json()
        assert data_none["exists"] is False
        assert data_none["auth_method"] == "none"

        # Existing bootstrap coach
        res_coach = await client.post("/api/auth/check-email", json={"email": "coach@globalorators.com"})
        assert res_coach.status_code == 200
        data_coach = res_coach.json()
        assert data_coach["exists"] is True
        assert data_coach["auth_method"] == "password"
        assert data_coach["role"] == "coach"


@pytest.mark.asyncio
async def test_email_notifications_lifecycle():
    """Verify email notification templates and platform lifecycle dispatches."""
    from app.services.email import (
        send_welcome_protocol_email,
        send_coach_new_speaker_email,
        send_drill_submission_email,
        send_coach_feedback_email,
        send_direct_message_email,
        send_inquiry_notification_email
    )

    # 1. Direct unit verification of email service functions in testing mode
    res_welcome = await send_welcome_protocol_email(
        speaker_email="anyonageoffrey49@gmail.com",
        speaker_name="Geoffrey Anyona",
        branch="Academy",
        mission_focus="Executive & Board Pitching",
        primary_format="VC Investment Pitch (Seed/Series A)",
        curriculum_focus="Concise Metric Defensibility",
        target_cadence=145,
        institution="Global Orators Academy",
        magic_link_url="http://test/speaker"
    )
    assert res_welcome is True

    res_coach_alert = await send_coach_new_speaker_email(
        coach_email="coach@globalorators.com",
        coach_name="Coach Qassim",
        speaker_name="Geoffrey Anyona",
        speaker_email="anyonageoffrey49@gmail.com",
        branch="Academy",
        mission_focus="Executive & Board Pitching",
        primary_format="VC Investment Pitch (Seed/Series A)",
        curriculum_focus="Concise Metric Defensibility",
        target_cadence=145,
        institution="Global Orators Academy"
    )
    assert res_coach_alert is True

    res_drill_sub = await send_drill_submission_email(
        coach_email="coach@globalorators.com",
        coach_name="Coach Qassim",
        speaker_name="Geoffrey Anyona",
        drill_title="VC Elevator Hook - 90s Drill",
        duration_seconds=92,
        notes="First attempt with strict cadence pacing."
    )
    assert res_drill_sub is True

    res_feedback = await send_coach_feedback_email(
        speaker_email="anyonageoffrey49@gmail.com",
        speaker_name="Geoffrey Anyona",
        drill_title="VC Elevator Hook - 90s Drill",
        coach_name="Coach Qassim",
        feedback_text="Exceptional vocal clarity and metric defense. Maintain eye contact during the closing ask.",
        rating=5
    )
    assert res_feedback is True

    res_msg = await send_direct_message_email(
        recipient_email="coach@globalorators.com",
        recipient_name="Coach Qassim",
        sender_name="Geoffrey Anyona",
        sender_role="Speaker",
        message_snippet="I have submitted the revised opening hook for the board pitch review.",
        thread_url="http://test/coach"
    )
    assert res_msg is True

    res_inq = await send_inquiry_notification_email(
        coach_email="coach@globalorators.com",
        organization="Oxford Union Forensics Society",
        contact_email="partnerships@oxfordforensics.org",
        branch="Academy",
        focus="Parliamentary Forensics Cohort",
        message="Requesting intake partnership for 25 varsity debaters."
    )
    assert res_inq is True

    # 2. Integration test: Onboarding a speaker dispatches welcome & coach alerts
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        onboard_payload = {
            "name": "Amira Al-Mansoor",
            "email": "amira.test.speaker@globalorators.org",
            "branch": "Academy",
            "goal": "Parliamentary Debate",
            "experience_level": "Advanced",
            "onboarding_survey": {
                "branch": "Academy",
                "fullName": "Amira Al-Mansoor",
                "email": "amira.test.speaker@globalorators.org",
                "missionFocus": "Parliamentary Forensics Championship",
                "primaryDiscipline": "British Parliamentary (Prime Minister)",
                "coreFocus": "Rhetorical Counter-Framing",
                "vocalBaselinePace": 150,
                "institution": "University Forensics Team"
            }
        }
        res_onboard = await client.post("/api/clients/onboard", json=onboard_payload)
        assert res_onboard.status_code == 201
        data = res_onboard.json()
        assert data["email"] == "amira.test.speaker@globalorators.org"

        # 3. Integration test: Submitting partnership inquiry dispatches notification
        inquiry_payload = {
            "organization": "Cambridge Debate Union",
            "email": "inquiries@cambridge.edu",
            "branch": "Academy",
            "focus": "High-Performance Forensics",
            "message": "Inquiry regarding cohort enrollment."
        }
        res_inquiry = await client.post("/api/inquiries", json=inquiry_payload)
        assert res_inquiry.status_code == 201
        assert res_inquiry.json()["status"] == "success"


@pytest.mark.asyncio
async def test_pending_onboarding_speaker_transitions_to_active_on_survey_completion():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        test_email = f"pending.speaker.{uuid.uuid4().hex[:6]}@example.com"
        
        # 1. Simulate authentication creation of stub client with Pending Onboarding
        otp_send = await client.post("/api/auth/otp/send", json={"email": test_email, "redirect_url": "http://localhost:3000"})
        assert otp_send.status_code == 200
        send_data = otp_send.json()
        assert "magic_link" in send_data

        import urllib.parse
        parsed = urllib.parse.urlparse(send_data["magic_link"])
        params = urllib.parse.parse_qs(parsed.query)
        magic_token = params["magic_token"][0]

        auth_res = await client.post("/api/auth/magic-link/verify", json={"token": magic_token, "email": test_email})
        assert auth_res.status_code == 200
        speaker_token = auth_res.json()["access_token"]
        speaker_headers = {"Authorization": f"Bearer {speaker_token}"}
        
        # Verify profile is currently Pending Onboarding
        me_before = await client.get("/api/clients/me", headers=speaker_headers)
        assert me_before.status_code == 200
        assert me_before.json()["status"] == "Pending Onboarding"
        
        # 2. Speaker submits completed onboarding survey
        survey_payload = {
            "name": "Geoff Onboarding Test",
            "email": test_email,
            "branch": "Academy",
            "goal": "Executive & Board Pitching",
            "experience_level": "Novice Speaker",
            "onboarding_survey": {
                "branch": "Academy",
                "fullName": "Geoff Onboarding Test",
                "email": test_email,
                "speakingGoal": "Executive & Board Pitching",
                "primaryDiscipline": "VC Investment Pitch (Seed/Series A)"
            }
        }
        submit_res = await client.post("/api/clients", json=survey_payload, headers=speaker_headers)
        assert submit_res.status_code == 201
        
        # 3. Verify status automatically transitioned to Active
        me_after = await client.get("/api/clients/me", headers=speaker_headers)
        assert me_after.status_code == 200
        assert me_after.json()["status"] == "Active"
        assert me_after.json()["goal"] == "Executive & Board Pitching"


@pytest.mark.asyncio
async def test_sse_events_streaming_and_broadcasting():
    """Verify Server-Sent Events (SSE) authentication barriers, formatting, and real-time broadcasting."""
    from app.services.events import sse_manager
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unauthenticated connection is rejected with 401
        res_unauth = await client.get("/api/events/stream")
        assert res_unauth.status_code == 401
        assert "Authentication token required" in res_unauth.text

        # 2. Invalid token is rejected with 401
        res_invalid = await client.get("/api/events/stream?token=invalid.jwt.token")
        assert res_invalid.status_code == 401
        assert "Invalid or expired token" in res_invalid.text

        # 3. Test SSE subscriber connection and message formatting
        test_user_id = "test-coach-sse"
        queue = await sse_manager.subscribe(user_id=test_user_id, role="coach")
        try:
            # Broadcast targeted event
            test_payload = {"id": "msg-realtime-1", "text": "Hello Orators", "clientId": "client-alpha"}
            await sse_manager.broadcast(
                event="new_message",
                data=test_payload,
                target_user_id=test_user_id
            )

            # Receive formatted SSE chunk
            raw_chunk = queue.get_nowait()
            assert "event: new_message" in raw_chunk
            assert "Hello Orators" in raw_chunk
            assert "client-alpha" in raw_chunk

            # Test format_sse helper
            custom_chunk = sse_manager.format_sse("roster_updated", {"action": "reassigned"}, event_id="evt-100")
            assert "id: evt-100" in custom_chunk
            assert "event: roster_updated" in custom_chunk
            assert '"action": "reassigned"' in custom_chunk
        finally:
            await sse_manager.unsubscribe(user_id=test_user_id, queue=queue)
            assert test_user_id not in sse_manager._subscribers




