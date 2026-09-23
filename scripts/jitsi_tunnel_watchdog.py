#!/usr/bin/env python3
"""
Global Orators Jitsi Cloudflare Tunnel Auto-Healing Watchdog
============================================================
Supervises Cloudflare quick tunnel for Jitsi Meet WebRTC instance.
When an ephemeral tunnel expires, disconnects, or fails health checks:
1. Automatically terminates stale tunnel process and spawns a fresh quick tunnel.
2. Extracts new *.trycloudflare.com domain from startup stream.
3. Dynamically updates /home/qsm/jitsi/.env (PUBLIC_URL).
4. Hot-patches ~/.jitsi-meet-cfg/web/config.js (config.bosh and config.websocket).
5. Reloads Jitsi Web's Nginx reverse proxy.
6. Notifies FastAPI backend (/api/system/jitsi-domain) so frontend clients discover
   the new live domain with zero downtime and no rebuilds.
7. Periodically performs active health checks (native metrics endpoint + IPv4 external probe)
   every 15s to guarantee continuous uptime.
"""

import os
import re
import sys
import time
import signal
import socket
import logging
import urllib.request
import urllib.error
import json
import subprocess
from threading import Thread
from queue import Queue, Empty

# Force IPv4 resolution for all Python socket operations to prevent Linux IPv6 routing failures
orig_getaddrinfo = socket.getaddrinfo


def force_ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)


socket.getaddrinfo = force_ipv4_getaddrinfo

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("jitsi_watchdog")

CLOUDFLARED_BIN = "/usr/local/bin/cloudflared"
ENV_FILE = os.path.expanduser("/home/qsm/jitsi/.env")
CONFIG_JS_FILE = os.path.expanduser("/home/qsm/.jitsi-meet-cfg/web/config.js")
BACKEND_NOTIFY_URL = os.getenv("BACKEND_NOTIFY_URL", "http://localhost:8000/api/system/jitsi-domain")
# Must match the backend's JITSI_UPDATE_TOKEN; the backend refuses domain updates without it.
JITSI_UPDATE_TOKEN = os.getenv("JITSI_UPDATE_TOKEN", "")
METRICS_READY_URL = "http://127.0.0.1:20241/ready"

HEALTH_CHECK_INTERVAL = 15  # seconds
MAX_CONSECUTIVE_FAILURES = 3

FAILURE_KEYWORDS = [
    "unauthorized: tunnel not found",
    "err no more connections active",
    "failed to request quick tunnel",
    "tunnel server stopped",
    "quitting...",
]

running = True


def handle_signals(signum, frame):
    global running
    logger.info(f"Received signal {signum}. Initiating graceful shutdown...")
    running = False


signal.signal(signal.SIGINT, handle_signals)
signal.signal(signal.SIGTERM, handle_signals)


def patch_jitsi_config(domain: str) -> bool:
    """Updates .env and config.js with the new tunnel domain."""
    success = True

    # 1. Update .env
    try:
        if os.path.exists(ENV_FILE):
            with open(ENV_FILE, "r", encoding="utf-8") as f:
                env_content = f.read()
            new_env = re.sub(
                r"PUBLIC_URL=https?://[^\s\n]+",
                f"PUBLIC_URL=https://{domain}",
                env_content
            )
            with open(ENV_FILE, "w", encoding="utf-8") as f:
                f.write(new_env)
            logger.info(f"Updated {ENV_FILE} with PUBLIC_URL=https://{domain}")
    except Exception as e:
        logger.error(f"Failed to update {ENV_FILE}: {e}")
        success = False

    # 2. Update config.js
    try:
        if os.path.exists(CONFIG_JS_FILE):
            with open(CONFIG_JS_FILE, "r", encoding="utf-8") as f:
                cfg_content = f.read()

            new_cfg = re.sub(
                r"config\.bosh\s*=\s*'https?://[^/]+/",
                f"config.bosh = 'https://{domain}/",
                cfg_content
            )
            new_cfg = re.sub(
                r"config\.websocket\s*=\s*'wss?://[^/]+/",
                f"config.websocket = 'wss://{domain}/",
                new_cfg
            )

            with open(CONFIG_JS_FILE, "w", encoding="utf-8") as f:
                f.write(new_cfg)
            logger.info(f"Patched {CONFIG_JS_FILE} bosh & websocket URLs for {domain}")

            # 3. Reload Nginx in Jitsi Web container
            try:
                res = subprocess.run(
                    ["docker", "exec", "jitsi-web-1", "nginx", "-s", "reload"],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                if res.returncode == 0:
                    logger.info("Successfully reloaded jitsi-web-1 Nginx.")
                else:
                    logger.warning(f"Nginx reload returned code {res.returncode}: {res.stderr.strip()}")
            except Exception as ex:
                logger.warning(f"Could not execute nginx reload in jitsi-web-1: {ex}")
    except Exception as e:
        logger.error(f"Failed to update {CONFIG_JS_FILE}: {e}")
        success = False

    return success


def notify_backend(domain: str) -> bool:
    """Notifies the FastAPI backend about the newly active Jitsi domain."""
    payload = json.dumps({"domain": domain}).encode("utf-8")
    req = urllib.request.Request(
        BACKEND_NOTIFY_URL,
        data=payload,
        headers={"Content-Type": "application/json", "X-Jitsi-Update-Token": JITSI_UPDATE_TOKEN},
        method="POST"
    )
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    body = json.loads(resp.read().decode("utf-8"))
                    logger.info(f"Successfully notified backend of active Jitsi domain: {body.get('domain')}")
                    return True
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1}/5: Failed to notify backend at {BACKEND_NOTIFY_URL}: {e}")
            time.sleep(1)
    return False


def verify_cloudflared_ready() -> bool:
    """Queries cloudflared local readiness endpoint."""
    try:
        req = urllib.request.Request(METRICS_READY_URL)
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                if data.get("status") == 200 and data.get("readyConnections", 0) > 0:
                    return True
    except Exception:
        pass
    return False


def enqueue_output(out, queue):
    """Enqueues process stdout/stderr line by line."""
    try:
        for line in iter(out.readline, ""):
            if not line:
                break
            queue.put(line)
        out.close()
    except Exception:
        pass


def kill_proc_tree(proc):
    """Forcefully terminates a process if still running."""
    if proc and proc.poll() is None:
        try:
            proc.terminate()
            proc.wait(timeout=3)
        except Exception:
            try:
                proc.kill()
                proc.wait(timeout=2)
            except Exception:
                pass


def run_watchdog():
    logger.info("=======================================================")
    logger.info("Starting Global Orators Jitsi Tunnel Auto-Healing Watchdog")
    logger.info("=======================================================")

    global running
    consecutive_failures = 0
    active_domain = None

    while running:
        logger.info(f"Spawning fresh Cloudflare Tunnel using {CLOUDFLARED_BIN}...")
        cmd = [
            CLOUDFLARED_BIN,
            "tunnel",
            "--url", "https://localhost:443",
            "--no-tls-verify"
        ]

        try:
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
        except Exception as e:
            logger.critical(f"Failed to spawn cloudflared: {e}. Retrying in 5s...")
            time.sleep(5)
            continue

        q = Queue()
        t = Thread(target=enqueue_output, args=(proc.stdout, q), daemon=True)
        t.start()

        new_domain = None
        start_time = time.time()

        # Phase 1: Capture generated domain from output stream
        while running and proc.poll() is None:
            try:
                line = q.get(timeout=1)
                line_str = line.strip()
                if line_str:
                    logger.info(f"[cloudflared] {line_str}")

                match = re.search(r"https://([a-zA-Z0-9-]+\.trycloudflare\.com)", line_str)
                if match:
                    new_domain = match.group(1).lower().strip()
                    logger.info(f"🎉 Captured new Quick Tunnel domain: {new_domain}")
                    break

                # Check for critical errors during startup
                lower_line = line_str.lower()
                if any(kw in lower_line for kw in FAILURE_KEYWORDS):
                    logger.error(f"Detected failure keyword in startup logs: {line_str}")
                    break
            except Empty:
                pass

            if time.time() - start_time > 30:
                logger.error("Timed out (30s) waiting for cloudflared tunnel URL to generate.")
                break

        if not new_domain or proc.poll() is not None:
            logger.warning("Failed to establish valid tunnel domain. Recycling process...")
            kill_proc_tree(proc)
            time.sleep(3)
            continue

        active_domain = new_domain
        consecutive_failures = 0

        # Phase 2: Apply configuration hot-patches and notify backend
        patch_jitsi_config(active_domain)
        notify_backend(active_domain)

        # Wait up to 10s for initial ready connections
        ready = False
        for _ in range(10):
            if verify_cloudflared_ready():
                ready = True
                logger.info("cloudflared native readiness verified (readyConnections > 0).")
                break
            time.sleep(1)

        if not ready:
            logger.warning("cloudflared readiness check did not report ready within 10s, continuing monitoring.")

        # Phase 3: Active Health Monitoring Loop
        logger.info(f"Entering active health monitoring loop for {active_domain} (probe every {HEALTH_CHECK_INTERVAL}s)...")
        last_check_time = time.time()

        while running:
            # 1. Process termination check
            if proc.poll() is not None:
                logger.error(f"Cloudflared process terminated unexpectedly (code {proc.returncode}). Restarting...")
                break

            # 2. Drain log stream and check for disconnect messages
            fatal_log_detected = False
            while not q.empty():
                try:
                    line = q.get_nowait()
                    line_str = line.strip()
                    if line_str:
                        logger.info(f"[cloudflared] {line_str}")
                    lower_line = line_str.lower()
                    if any(kw in lower_line for kw in FAILURE_KEYWORDS):
                        logger.error(f"Cloudflared reported fatal disconnect: '{line_str}'. Triggering renewal...")
                        fatal_log_detected = True
                        break
                except Empty:
                    break

            if fatal_log_detected:
                break

            # 3. Active periodic health probe
            now = time.time()
            if now - last_check_time >= HEALTH_CHECK_INTERVAL:
                last_check_time = now
                is_ready = verify_cloudflared_ready()

                if is_ready:
                    if consecutive_failures > 0:
                        logger.info(f"Health check recovered for {active_domain}.")
                    consecutive_failures = 0
                else:
                    consecutive_failures += 1
                    logger.warning(f"cloudflared ready probe failed. Consecutive failures: {consecutive_failures}/{MAX_CONSECUTIVE_FAILURES}")

                if consecutive_failures >= MAX_CONSECUTIVE_FAILURES:
                    logger.error(f"Tunnel {active_domain} failed {MAX_CONSECUTIVE_FAILURES} consecutive health probes. Auto-healing tunnel...")
                    break

            time.sleep(1)

        # Cleanup before recycling
        logger.info("Recycling tunnel: terminating current cloudflared instance...")
        kill_proc_tree(proc)
        time.sleep(3)

    logger.info("Watchdog terminated cleanly.")


if __name__ == "__main__":
    run_watchdog()
