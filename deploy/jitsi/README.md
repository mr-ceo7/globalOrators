# Global Orators Self-Hosted Jitsi Meet Deployment Guide

This directory contains the production-ready Docker Compose blueprint to self-host Jitsi Meet on your own domain (e.g. `meet.globalorators.com`).

By self-hosting Jitsi:
- **Zero Ads & Zero Promos**: All 8x8 JaaS upsells, watermarks, and promotional overlays are eliminated.
- **High-Capacity Debates**: Handles full 8-debater British Parliamentary rounds plus adjudicators through Jitsi Videobridge (SFU).
- **100% Brand Control**: Custom dark slate editorial theme, gold accents, and direct integration into Global Orators Coach OS and Speaker Portal.

---

## Server Requirements

- **Operating System**: Ubuntu 22.04+ or Debian 12
- **Hardware**:
  - Minimum: 2 vCPUs, 4GB RAM (Supports up to ~30 concurrent participants)
  - Recommended: 4 vCPUs, 8GB RAM (Supports multiple simultaneous debate rounds)
  - Recommended VPS Providers: Hetzner ($5–$8/mo), DigitalOcean ($18/mo), AWS Lightsail ($10/mo)
- **Firewall / Network Ports**:
  - `80/tcp` (HTTP - ACME Let's Encrypt challenge)
  - `443/tcp` (HTTPS - Web interface & signaling)
  - `10000/udp` (WebRTC audio/video streams for JVB)
  - `4443/tcp` (WebRTC TCP fallback)

---

## 10-Minute Deployment Walkthrough

### 1. Configure DNS
Add an `A` record in your DNS provider (Cloudflare, Namecheap, Route53, etc.):
```text
Type: A
Name: meet
Target: <YOUR_SERVER_PUBLIC_IP>
TTL: Auto (or 300)
```

### 2. Install Docker on your VPS
```bash
sudo apt update && sudo apt install -y curl git
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 3. Clone Repository & Run Setup Script
```bash
git clone https://github.com/mr-ceo7/globalOrators.git
cd globalOrators/deploy/jitsi

# Run automated setup to generate passwords and directory mounts
./setup.sh
```

### 4. Configure `.env`
Edit `.env` to set your public IP and domain:
```bash
nano .env
```
Key variables:
- `PUBLIC_URL=https://meet.globalorators.com`
- `DOCKER_HOST_ADDRESS=<YOUR_SERVER_PUBLIC_IP>`
- `ENABLE_LETSENCRYPT=1`
- `LETSENCRYPT_EMAIL=coach@globalorators.com`
- `LETSENCRYPT_DOMAIN=meet.globalorators.com`

### 5. Launch the Stack
```bash
docker compose up -d
```

Check the logs to verify Let's Encrypt SSL certificate issuance:
```bash
docker compose logs -f web
```

---

## Connecting with the Global Orators Web App

Once your server is live at `https://meet.globalorators.com`:

1. In the main app root, set the environment variable in `.env`:
   ```bash
   VITE_JITSI_DOMAIN="meet.globalorators.com"
   ```
2. Rebuild or restart Vite:
   ```bash
   npm run build
   ```
3. Whenever a coach or speaker opens the **Live Rehearsal Studio**, it will seamlessly route video through your private, ad-free server.
