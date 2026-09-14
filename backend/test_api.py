"""
FastAPI Backend API Test Suite
"""

import os
os.environ["TESTING"] = "true"

import pytest
import httpx
from app.config import settings
settings.TESTING = True
from app.main import app


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

        # Lookup by exact email
        res_lookup_email = await client.get(f"/api/clients/lookup?search={test_email}")
        assert res_lookup_email.status_code == 200
        assert res_lookup_email.json()["id"] == client_db_id
        assert res_lookup_email.json()["phone"] == test_phone

        # Lookup by phone number
        res_lookup_phone = await client.get(f"/api/clients/lookup?search=%2B2547{test_phone_suffix}")
        assert res_lookup_phone.status_code == 200
        assert res_lookup_phone.json()["id"] == client_db_id

        # Lookup by phone without plus or spaces
        res_lookup_phone_plain = await client.get(f"/api/clients/lookup?search={test_phone_plain}")
        assert res_lookup_phone_plain.status_code == 200
        assert res_lookup_phone_plain.json()["id"] == client_db_id

        # Lookup non-existent speaker returns 404
        res_lookup_missing = await client.get("/api/clients/lookup?search=nonexistent_speaker_xyz@gmail.com")
        assert res_lookup_missing.status_code == 404

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
    from starlette.testclient import TestClient
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

        # 1. Loose name search on /lookup is strictly rejected (404)
        res_name_lookup = await client.get("/api/clients/lookup?search=Marcus")
        assert res_name_lookup.status_code == 404

        res_partial_phone = await client.get("/api/clients/lookup?search=123")
        assert res_partial_phone.status_code == 400 or res_partial_phone.status_code == 404

        # 2. Onboard a speaker with coach notes and assignments via coach
        coach_res = await client.post(
            "/api/auth/login",
            json={"email": settings.DEFAULT_COACH_EMAIL, "password": settings.DEFAULT_COACH_PASSWORD}
        )
        coach_token = coach_res.json()["access_token"]
        coach_headers = {"Authorization": f"Bearer {coach_token}"}

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

        # 3. Unauthenticated lookup by exact email returns profile with coach notes REDACTED
        res_pub_lookup = await client.get(f"/api/clients/lookup?search={test_email}")
        assert res_pub_lookup.status_code == 200
        assert res_pub_lookup.json()["customCoachNotes"] == []

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




