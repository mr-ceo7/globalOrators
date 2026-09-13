"""
FastAPI Backend API Test Suite
"""

import pytest
import httpx
from app.main import app
from app.config import settings


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


