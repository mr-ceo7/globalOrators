"""
SMTP Email Dispatch Service for Global Orators Platform
Handles passwordless OTP delivery with SSL encryption and editorial formatting.
"""

import ssl
import smtplib
import asyncio
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger("globalorators.email")


def send_otp_email_sync(recipient_email: str, otp_code: str) -> bool:
    """
    Transmit a single-use verification passcode via authenticated SMTP SSL.
    Adheres strictly to Global Orators editorial typography and Anti-AI Slop guidelines.
    """
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured; skipping actual email transmission.")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your Global Orators Verification Passcode: {otp_code}"
    msg["From"] = f"Global Orators <{settings.FROM_EMAIL}>"
    msg["To"] = recipient_email

    text_body = f"""GLOBAL ORATORS · SPEAKER PROTOCOL ACCESS
Authentication Passcode

Your single-use verification code is: {otp_code}

This passcode is valid for 10 minutes.

Enter this code in your Global Orators portal window to access your training workspace.
If you did not request this code, you can safely disregard this message.
"""

    html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Global Orators Speaker Verification</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #080a0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #10141d; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; padding: 40px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
    <tr>
      <td>
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; letter-spacing: 0.18em; color: #c89630; text-transform: uppercase; margin-bottom: 8px; font-weight: 700;">
          Global Orators · Speaker Protocol
        </div>
        <h1 style="font-family: Georgia, Cambria, 'Times New Roman', serif; font-size: 24px; font-weight: 900; color: #ffffff; margin: 0 0 16px 0; line-height: 1.25; letter-spacing: -0.02em;">
          Authentication Passcode
        </h1>
        <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 28px 0;">
          Enter the single-use passcode below in your browser window to verify your identity and access your speaker workspace.
        </p>

        <div style="background-color: #080a0e; border: 1px solid #334155; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
          <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 34px; font-weight: 800; letter-spacing: 0.28em; color: #ffffff;">
            {otp_code}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; text-transform: uppercase; letter-spacing: 0.08em;">
            Single-Use · Valid for 10 minutes
          </div>
        </div>

        <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin: 0; border-top: 1px solid #1e293b; padding-top: 20px;">
          If you did not request this verification code, you can safely ignore this email. No changes will be made to your records.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        context = ssl.create_default_context()
        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_SERVER, settings.SMTP_PORT, context=context, timeout=12) as server:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)
        else:
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=12) as server:
                server.starttls(context=context)
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)

        logger.info(f"OTP passcode email successfully delivered to {recipient_email}")
        return True
    except Exception as exc:
        logger.error(f"Failed to dispatch OTP email to {recipient_email}: {exc}")
        return False


async def send_otp_email(recipient_email: str, otp_code: str) -> bool:
    """Non-blocking async wrapper executing SMTP operations in worker threadpool."""
    return await asyncio.to_thread(send_otp_email_sync, recipient_email, otp_code)
