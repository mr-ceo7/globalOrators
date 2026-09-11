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

        # 4. Clients
        res = await client.get("/api/clients")
        assert res.status_code == 200
        clients = res.json()
        assert len(clients) >= 6
        first_client = clients[0]
        assert "name" in first_client
        assert "complianceRate" in first_client

        # Add Coach note to first client
        res = await client.post(
            f"/api/clients/{first_client['id']}/notes",
            json={"note": "Test note from automated test"}
        )
        assert res.status_code == 200
        assert res.json()["customCoachNotes"][0] == "Test note from automated test"

        # 5. Exercises
        res = await client.get("/api/exercises")
        assert res.status_code == 200
        exercises = res.json()
        assert len(exercises) >= 15
        assert "primaryMuscle" in exercises[0]

        # 6. Programs
        res = await client.get("/api/programs")
        assert res.status_code == 200
        programs = res.json()
        assert len(programs) >= 3

        # 7. Scheduled Workouts
        res = await client.get("/api/workouts")
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
            }
        )
        assert res.status_code == 200
        assert res.json()["status"] == "Completed"

        # 9. Metrics
        res = await client.get("/api/metrics")
        assert res.status_code == 200
        assert len(res.json()) >= 12

        # 10. PRs
        res = await client.get("/api/prs")
        assert res.status_code == 200
        assert len(res.json()) >= 8

        # 11. Habits & Toggle
        res = await client.get("/api/habits")
        assert res.status_code == 200
        toggle_res = await client.post(
            "/api/habits/toggle",
            json={
                "clientId": first_client["id"],
                "date": "2026-08-16",
                "habitId": "h-1"
            }
        )
        assert toggle_res.status_code == 200

        # 12. Photos
        res = await client.get("/api/photos")
        assert res.status_code == 200
        assert len(res.json()) >= 6

        # 13. Messages
        res = await client.get(f"/api/messages?clientId={first_client['id']}")
        assert res.status_code == 200

        # Send Message
        res = await client.post(
            "/api/messages",
            json={
                "clientId": first_client["id"],
                "sender": "coach",
                "text": "Keep up the momentum!"
            }
        )
        assert res.status_code == 201
        assert res.json()["text"] == "Keep up the momentum!"

        # 14. Activity Feed
        res = await client.get("/api/activity")
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

        # List inquiries
        res = await client.get("/api/inquiries")
        assert res.status_code == 200
        assert len(res.json()) >= 1

        print("All API endpoints tested and passed flawlessly!")
