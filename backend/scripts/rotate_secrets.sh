#!/usr/bin/env bash
# ==============================================================================
# Global Orators - Operational Secret Rotation Engine
# Generates cryptographically secure, high-entropy production secrets and outputs
# zero-downtime rotation instructions.
# ==============================================================================

set -euo pipefail

echo "======================================================================"
echo "Global Orators - Production Secret Rotation Generator"
echo "Generated at: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
echo "======================================================================"

NEW_JWT_SECRET="$(openssl rand -hex 32)"
NEW_COACH_SECRET="$(openssl rand -hex 32)"
NEW_INVITE_CODE="GOP-$(openssl rand -hex 16)"
NEW_SESSION_SALT="$(openssl rand -hex 24)"

echo "Generated High-Entropy Production Secrets:"
echo ""
echo "JWT_SECRET=${NEW_JWT_SECRET}"
echo "COACH_SECRET_KEY=${NEW_COACH_SECRET}"
echo "COACH_INVITE_CODE=${NEW_INVITE_CODE}"
echo "SESSION_SALT=${NEW_SESSION_SALT}"
echo ""
echo "======================================================================"
echo "Zero-Downtime Secret Rotation Procedure:"
echo "----------------------------------------------------------------------"
echo "1. Render Environment Dashboard:"
echo "   - Open dashboard.render.com -> globalorators-backend -> Environment"
echo "   - Update JWT_SECRET, COACH_SECRET_KEY, and COACH_INVITE_CODE."
echo "   - Click 'Save Changes' to trigger zero-downtime rolling restart."
echo ""
echo "2. Vercel Frontend Dashboard (if client variables changed):"
echo "   - Open vercel.com -> globalOrators -> Settings -> Environment Variables"
echo "   - Redeploy production branch to pick up new configurations."
echo ""
echo "3. Operational Verification:"
echo "   - Verify /api/health returns HTTP 200."
echo "   - Authenticate with new coach credentials to confirm session issuance."
echo "======================================================================"
