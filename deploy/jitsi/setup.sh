#!/usr/bin/env bash
# ==============================================================================
# Global Orators Self-Hosted Jitsi Meet Setup Script
# Automatically generates cryptographically secure passwords, initializes
# directory mounts, and prepares .env for meet.globalorators.com deployment.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "=================================================================="
echo "  Global Orators Self-Hosted Jitsi Meet Deployment Setup"
echo "=================================================================="

# 1. Check for .env or copy from .env.example
if [ ! -f ".env" ]; then
    echo "[+] Creating .env from .env.example..."
    cp .env.example .env
fi

# 2. Generate random passwords for internal services
echo "[+] Generating secure secrets for Prosody, Jicofo, and JVB..."
generate_secret() {
    openssl rand -hex 16
}

JICOFO_PASS=$(generate_secret)
JVB_PASS=$(generate_secret)

# Replace placeholders in .env
sed -i "s/CHANGE_ME_JICOFO_SECRET/${JICOFO_PASS}/g" .env
sed -i "s/CHANGE_ME_JVB_SECRET/${JVB_PASS}/g" .env

# 3. Create persistent config directories on the host
CONFIG_DIR="${HOME}/.jitsi-meet-cfg"
echo "[+] Initializing host config directory at ${CONFIG_DIR}..."
mkdir -p "${CONFIG_DIR}/web/letsencrypt"
mkdir -p "${CONFIG_DIR}/transcripts"
mkdir -p "${CONFIG_DIR}/prosody/config"
mkdir -p "${CONFIG_DIR}/prosody/prosody-plugins-custom"
mkdir -p "${CONFIG_DIR}/jicofo"
mkdir -p "${CONFIG_DIR}/jvb"

echo ""
echo "=================================================================="
echo "  Configuration Complete!"
echo "=================================================================="
echo "Next steps to launch meet.globalorators.com:"
echo ""
echo " 1. Open .env and verify your public IP and domain:"
echo "    - DOCKER_HOST_ADDRESS=$(curl -s ifconfig.me || echo 'YOUR_PUBLIC_IP')"
echo "    - PUBLIC_URL=https://meet.globalorators.com"
echo "    - ENABLE_LETSENCRYPT=1 (if DNS points to this server)"
echo ""
echo " 2. Start the Jitsi stack:"
echo "    docker compose up -d"
echo ""
echo " 3. Verify services are running:"
echo "    docker compose ps"
echo ""
echo "Enjoy ad-free, 100% white-labeled video rooms on Global Orators!"
echo "=================================================================="
