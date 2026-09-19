"""
SMTP Email Dispatch Service for Global Orators Platform
Handles editorial notifications across the orator and coach lifecycles:
- Speaker Welcome & Formulated Protocol Briefing (Onboarding Step 5)
- Faculty Coach Dispatch: New Orator Enrolled
- Rehearsal & Drill Submission Alerts (to Coach)
- Faculty Adjudication & Feedback Alerts (to Speaker)
- Direct Secure Messaging Alerts
- Institutional & Partnership Inquiry Alerts
- Passwordless OTP & 1-Click Magic Login Links
"""

import ssl
import smtplib
import asyncio
import logging
import email.utils
from urllib.parse import urlparse
from typing import Optional
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger("globalorators.email")


def _sanitize_public_url(url: Optional[str]) -> str:
    """
    Ensure all outbound links use the canonical production HTTPS domain.
    Rewrites any localhost/127.0.0.1 references to https://globaloratorsproject.com
    to protect domain reputation and prevent anti-phishing/spam false positives.
    """
    fallback_domain = "https://globaloratorsproject.com"
    if not url:
        return fallback_domain
    clean = url.strip()
    if clean.startswith("http://localhost") or clean.startswith("http://127.0.0.1"):
        parsed = urlparse(clean)
        path = parsed.path or ""
        if parsed.query:
            path += f"?{parsed.query}"
        return f"{fallback_domain}{path}"
    return clean


def _dispatch_smtp_email_sync(recipient_email: str, subject: str, text_body: str, html_body: str) -> bool:
    """
    Transmit an email via authenticated SMTP with TLS/SSL encryption and full RFC 5322 anti-spam headers.
    Gracefully logs and suppresses errors in testing/development environments.
    """
    if settings.TESTING:
        logger.info(f"[TESTING] Email dispatch simulated: '{subject}' -> {recipient_email}")
        return True

    # 1. Direct Resend REST API Driver (Highest Deliverability Transactional Engine)
    if settings.RESEND_API_KEY and settings.RESEND_API_KEY.strip():
        try:
            import httpx
            headers = {
                "Authorization": f"Bearer {settings.RESEND_API_KEY.strip()}",
                "Content-Type": "application/json"
            }
            payload = {
                "from": f"Global Orators <{settings.FROM_EMAIL}>",
                "to": [recipient_email],
                "subject": subject,
                "html": html_body,
                "text": text_body,
                "reply_to": f"Global Orators Support <{settings.FROM_EMAIL}>"
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post("https://api.resend.com/emails", headers=headers, json=payload)
                if res.status_code in (200, 201):
                    data = res.json()
                    logger.info(f"[Resend API] Email delivered: '{subject}' -> {recipient_email} (id: {data.get('id')})")
                    return True
                else:
                    logger.error(f"[Resend API] Delivery failed ({res.status_code}): {res.text}. Falling back to SMTP.")
        except Exception as resend_err:
            logger.error(f"[Resend API] Connection error: {resend_err}. Falling back to SMTP.")

    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning(
            f"SMTP credentials not configured; skipping email dispatch: '{subject}' -> {recipient_email}"
        )
        return False

    from_domain = settings.FROM_EMAIL.split("@")[-1] if "@" in settings.FROM_EMAIL else "globaloratorsproject.com"
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Global Orators <{settings.FROM_EMAIL}>"
    msg["To"] = recipient_email
    msg["Reply-To"] = f"Global Orators Support <{settings.FROM_EMAIL}>"
    msg["Date"] = email.utils.formatdate(localtime=True)
    msg["Message-ID"] = email.utils.make_msgid(domain=from_domain)

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

        logger.info(f"Email successfully delivered: '{subject}' -> {recipient_email}")
        return True
    except Exception as exc:
        logger.error(f"Failed to dispatch email to {recipient_email} ('{subject}'): {exc}")
        return False


def _format_coach_title(name: str) -> str:
    """Format coach name cleanly without awkward duplicated titles (e.g. Coach Head Coach Qassim)."""
    cleaned = (name or "").strip()
    if not cleaned:
        return "Coach"
    lower = cleaned.lower()
    if lower.startswith("head coach") or lower.startswith("coach") or lower.startswith("master coach"):
        return cleaned
    return f"Coach {cleaned}"


def _wrap_editorial_html(kicker: str, headline: str, lead_text: str, content_html: str, action_url: Optional[str] = None, action_label: Optional[str] = None) -> str:
    """
    Render an authoritative editorial email document adhering strictly to
    Anti-AI Slop standards (commanding serif display, gold accents, hairline dividers, micro-mono labels).
    Includes the official Global Orators emblem logo and masthead.
    """
    safe_action_url = _sanitize_public_url(action_url) if action_url else None
    action_button_html = ""
    if safe_action_url and action_label:
        action_button_html = f"""
        <div style="text-align: center; margin: 32px 0 24px 0;">
          <a href="{safe_action_url}" style="background-color: #c89630; color: #080a0e; font-family: Georgia, Cambria, 'Times New Roman', serif; font-size: 15px; font-weight: 800; padding: 15px 34px; text-decoration: none; border-radius: 10px; display: inline-block; letter-spacing: 0.02em; box-shadow: 0 4px 14px rgba(200, 150, 48, 0.35);">
            {action_label} &rarr;
          </a>
        </div>
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 11px; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
            Direct link: <a href="{safe_action_url}" style="color: #c89630; word-break: break-all;">{safe_action_url}</a>
          </span>
        </div>
        """

    logo_url = f"{settings.APP_URL.rstrip('/')}/logo-icon.png"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{headline}</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #080a0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <!-- Preheader preview text for inbox display -->
  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; mso-hide: all;">
    {lead_text[:120]}
  </div>

  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #10141d; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; padding: 40px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.55);">
    <tr>
      <td>
        <!-- Brand Masthead Header with Official Emblem Logo -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
          <tr>
            <td style="vertical-align: middle; width: 44px; padding-right: 14px;">
              <img src="{logo_url}" alt="Global Orators" width="44" height="44" style="display: block; width: 44px; height: 44px; border-radius: 10px; border: 1px solid rgba(200, 150, 48, 0.35); background-color: #080a0e;" />
            </td>
            <td style="vertical-align: middle;">
              <div style="font-family: Georgia, Cambria, 'Times New Roman', serif; font-size: 17px; font-weight: 800; color: #ffffff; letter-spacing: -0.01em; line-height: 1.2;">
                Global Orators
              </div>
              <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 9px; letter-spacing: 0.16em; color: #c89630; text-transform: uppercase; margin-top: 2px;">
                Forensics · Rhetoric · Voice Sovereignty
              </div>
            </td>
          </tr>
        </table>

        <!-- Architectural hairline divider -->
        <div style="border-top: 1px solid #1e293b; margin-bottom: 24px;"></div>

        <!-- Kicker -->
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; letter-spacing: 0.18em; color: #c89630; text-transform: uppercase; margin-bottom: 10px; font-weight: 700;">
          {kicker}
        </div>
        
        <!-- Headline -->
        <h1 style="font-family: Georgia, Cambria, 'Times New Roman', serif; font-size: 24px; font-weight: 900; color: #ffffff; margin: 0 0 14px 0; line-height: 1.25; letter-spacing: -0.02em;">
          {headline}
        </h1>

        <!-- Lead paragraph -->
        <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 22px 0;">
          {lead_text}
        </p>

        <!-- Body content -->
        {content_html}

        <!-- Call-to-action button -->
        {action_button_html}

        <!-- Architectural hairline divider -->
        <div style="border-top: 1px solid #1e293b; margin: 28px 0 20px 0;"></div>

        <!-- Editorial Dispatch Footer with Deliverability Compliance -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="vertical-align: top; width: 28px; padding-right: 12px;">
              <img src="{logo_url}" alt="" width="24" height="24" style="display: block; width: 24px; height: 24px; border-radius: 6px; opacity: 0.75;" />
            </td>
            <td style="font-size: 11px; line-height: 1.6; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
              <strong style="color: #94a3b8;">Global Orators Project</strong> · Forensics, Rhetoric & Voice Sovereignty<br>
              Official Transactional Notification · Nairobi, Kenya<br>
              Sent to registered platform participants. To update notification preferences, reply directly to this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


# ---------------------------------------------------------------------------
# 1. Passwordless OTP & Magic Login Link
# ---------------------------------------------------------------------------

def send_otp_email_sync(recipient_email: str, otp_code: str, magic_link_url: Optional[str] = None) -> bool:
    """Transmit a 1-click magic login link and single-use verification passcode."""
    safe_magic_link = _sanitize_public_url(magic_link_url) if magic_link_url else None
    magic_link_section_text = f"""Direct Sign-in Link:
Click the link below to enter your Orators App workspace:
{safe_magic_link}

""" if safe_magic_link else ""

    text_body = f"""Global Orators · Speaker Verification

Your 6-digit verification passcode is:
{otp_code}

{magic_link_section_text}This passcode is valid for 15 minutes.
Enter this code in your Global Orators portal or click the direct sign-in link above.
If you did not request this code, you can safely ignore this email.
"""

    otp_block_html = f"""
    <div style="background-color: #080a0e; border: 1px solid #334155; border-radius: 12px; padding: 22px; text-align: center; margin: 20px 0 24px 0;">
      <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 0.28em; color: #ffffff;">
        {otp_code}
      </div>
      <div style="font-size: 11px; color: #64748b; margin-top: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; text-transform: uppercase; letter-spacing: 0.08em;">
        Verification Passcode · Valid for 15 minutes
      </div>
    </div>
    """

    html_body = _wrap_editorial_html(
        kicker="Global Orators · Speaker Protocol",
        headline=f"Your Verification Passcode is {otp_code}",
        lead_text="Use this 6-digit passcode to verify your sign-in, or click the direct button below to enter your workspace.",
        content_html=otp_block_html,
        action_url=safe_magic_link,
        action_label="Sign in to Orators App" if safe_magic_link else None
    )

    return _dispatch_smtp_email_sync(
        recipient_email=recipient_email,
        subject=f"Your Global Orators verification code: {otp_code}",
        text_body=text_body,
        html_body=html_body
    )


async def send_otp_email(recipient_email: str, otp_code: str, magic_link_url: Optional[str] = None) -> bool:
    """Non-blocking async wrapper executing SMTP operations in worker threadpool."""
    return await asyncio.to_thread(send_otp_email_sync, recipient_email, otp_code, magic_link_url)


# ---------------------------------------------------------------------------
# 2. Speaker Welcome & Formulated Protocol Briefing (Onboarding Step 5)
# ---------------------------------------------------------------------------

def send_welcome_protocol_email_sync(
    speaker_email: str,
    speaker_name: str,
    branch: str,
    mission_focus: str,
    primary_format: str,
    curriculum_focus: str,
    target_cadence: int,
    institution: str = "",
    magic_link_url: Optional[str] = None
) -> bool:
    """
    Transmit high-end editorial briefing containing the speaker's customized protocol,
    mirroring Step 5 of the onboarding journey.
    """
    clean_branch = branch if branch in ("Academy", "Foundation") else "Academy"
    faculty_quote = (
        "Your pathway in Global Orators Academy is calibrated to awaken cognitive sovereignty, "
        "rigorous forensics argumentation, and commanding rhetorical delivery. Enter your portal to begin your first drill."
        if clean_branch == "Academy"
        else "Your sanctuary in Global Orators Foundation is calibrated for emotional safety, "
        "vulnerability-without-apology, and discovering the healing power of your authentic voice. Enter your portal to begin your first reflection."
    )

    portal_url = _sanitize_public_url(magic_link_url or f"{settings.APP_URL}/speaker")

    text_body = f"""GLOBAL ORATORS · PROTOCOL FORMULATION BRIEFING
Your Personalized Orator Training Protocol is Formulated

Speaker: {speaker_name} ({clean_branch} Scholar)
Institution: {institution or 'Independent Scholar'}

ORATOR CALIBRATION SUMMARY:
- Speaking Mission: {mission_focus}
- Primary Format: {primary_format}
- Curriculum Focus: {curriculum_focus}
- Target Cadence: {target_cadence} WPM

FACULTY WELCOME:
"{faculty_quote}"

Enter your workspace to access your curriculum and initial diagnostic drills:
{portal_url}
"""

    institution_line = f"""<div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">{institution}</div>""" if institution else ""

    content_html = f"""
    <!-- Speaker Summary Card -->
    <div style="background-color: #080a0e; border: 1px solid rgba(200, 150, 48, 0.4); border-radius: 14px; padding: 22px; margin-bottom: 24px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 18px;">
        <tr>
          <td>
            <div style="font-size: 16px; font-weight: 800; color: #ffffff; font-family: Georgia, serif;">{speaker_name}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">{speaker_email}</div>
            {institution_line}
          </td>
          <td align="right" valign="top">
            <span style="font-family: ui-monospace, monospace; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(200, 150, 48, 0.4); background-color: rgba(200, 150, 48, 0.15); color: #c89630;">
              {clean_branch} Scholar
            </span>
          </td>
        </tr>
      </table>

      <!-- 2-Column Metrics Table -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #1e293b; padding-top: 14px;">
        <tr>
          <td width="50%" style="padding: 6px 8px 10px 0;" valign="top">
            <div style="font-family: ui-monospace, monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 700;">Speaking Mission</div>
            <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-top: 3px;">{mission_focus}</div>
          </td>
          <td width="50%" style="padding: 6px 0 10px 8px;" valign="top">
            <div style="font-family: ui-monospace, monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 700;">Primary Format</div>
            <div style="font-size: 13px; font-weight: 700; color: #c89630; margin-top: 3px;">{primary_format}</div>
          </td>
        </tr>
        <tr>
          <td width="50%" style="padding: 6px 8px 0 0;" valign="top">
            <div style="font-family: ui-monospace, monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 700;">Curriculum Focus</div>
            <div style="font-size: 13px; font-weight: 700; color: #f59e0b; margin-top: 3px;">{curriculum_focus}</div>
          </td>
          <td width="50%" style="padding: 6px 0 0 8px;" valign="top">
            <div style="font-family: ui-monospace, monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 700;">Target Cadence</div>
            <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-top: 3px;">{target_cadence} WPM</div>
          </td>
        </tr>
      </table>

      <!-- Faculty Welcome Statement -->
      <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #1e293b;">
        <div style="font-family: ui-monospace, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #c89630; font-weight: 700; margin-bottom: 4px;">
          Global Orators Faculty Welcome
        </div>
        <div style="font-size: 12px; line-height: 1.55; color: #cbd5e1; font-style: italic;">
          &ldquo;{faculty_quote}&rdquo;
        </div>
      </div>
    </div>
    """

    html_body = _wrap_editorial_html(
        kicker="Global Orators · Protocol Formulation",
        headline="Your Protocol is Formulated",
        lead_text="Welcome to the Global Orators Project. Your personalized client portal has been calibrated and is ready for your initial diagnostics.",
        content_html=content_html,
        action_url=portal_url,
        action_label="Enter Orators App"
    )

    return _dispatch_smtp_email_sync(
        recipient_email=speaker_email,
        subject="Global Orators · Your Speaking Protocol Formulation Briefing",
        text_body=text_body,
        html_body=html_body
    )


async def send_welcome_protocol_email(
    speaker_email: str,
    speaker_name: str,
    branch: str,
    mission_focus: str,
    primary_format: str,
    curriculum_focus: str,
    target_cadence: int,
    institution: str = "",
    magic_link_url: Optional[str] = None
) -> bool:
    """Async wrapper for welcome protocol briefing dispatch."""
    return await asyncio.to_thread(
        send_welcome_protocol_email_sync,
        speaker_email,
        speaker_name,
        branch,
        mission_focus,
        primary_format,
        curriculum_focus,
        target_cadence,
        institution,
        magic_link_url
    )


# ---------------------------------------------------------------------------
# 3. Faculty Coach Alert: New Orator Enrolled
# ---------------------------------------------------------------------------

def send_coach_new_speaker_email_sync(
    coach_email: str,
    coach_name: str,
    speaker_name: str,
    speaker_email: str,
    branch: str,
    mission_focus: str,
    primary_format: str,
    curriculum_focus: str,
    target_cadence: int,
    institution: str = ""
) -> bool:
    """Alert coach when a new orator completes intake and joins their roster."""
    coach_portal_url = _sanitize_public_url(f"{settings.APP_URL}/coach")
    greeting_coach = _format_coach_title(coach_name)

    text_body = f"""GLOBAL ORATORS · FACULTY DISPATCH: NEW ORATOR ENROLLED
{greeting_coach}, an orator has completed onboarding and formulated their initial diagnostic protocol.

NEW SPEAKER DOSSIER:
- Name: {speaker_name}
- Email: {speaker_email}
- Cohort: {branch} Scholar
- Institution: {institution or 'Independent Scholar'}
- Speaking Mission: {mission_focus}
- Primary Format: {primary_format}
- Curriculum Focus: {curriculum_focus}
- Target Baseline: {target_cadence} WPM

Review the speaker's diagnostic profile in Coach OS:
{coach_portal_url}
"""

    institution_line = f"""<tr><td style="color: #64748b; font-size: 11px; padding: 4px 0; width: 140px; font-family: ui-monospace, monospace; text-transform: uppercase;">Institution</td><td style="color: #ffffff; font-size: 13px; font-weight: 600;">{institution}</td></tr>""" if institution else ""

    content_html = f"""
    <div style="background-color: #080a0e; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="color: #64748b; font-size: 11px; padding: 4px 0; width: 140px; font-family: ui-monospace, monospace; text-transform: uppercase;">Speaker</td>
          <td style="color: #ffffff; font-size: 13px; font-weight: 700;">{speaker_name} &lt;{speaker_email}&gt;</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-size: 11px; padding: 4px 0; font-family: ui-monospace, monospace; text-transform: uppercase;">Cohort</td>
          <td style="color: #c89630; font-size: 13px; font-weight: 700;">{branch} Scholar</td>
        </tr>
        {institution_line}
        <tr>
          <td style="color: #64748b; font-size: 11px; padding: 4px 0; font-family: ui-monospace, monospace; text-transform: uppercase;">Mission</td>
          <td style="color: #cbd5e1; font-size: 13px;">{mission_focus}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-size: 11px; padding: 4px 0; font-family: ui-monospace, monospace; text-transform: uppercase;">Format</td>
          <td style="color: #cbd5e1; font-size: 13px;">{primary_format}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-size: 11px; padding: 4px 0; font-family: ui-monospace, monospace; text-transform: uppercase;">Focus</td>
          <td style="color: #f59e0b; font-size: 13px; font-weight: 600;">{curriculum_focus}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-size: 11px; padding: 4px 0; font-family: ui-monospace, monospace; text-transform: uppercase;">Target Baseline</td>
          <td style="color: #ffffff; font-size: 13px; font-weight: 600;">{target_cadence} WPM</td>
        </tr>
      </table>
    </div>
    """

    html_body = _wrap_editorial_html(
        kicker="Global Orators · Faculty Dispatch",
        headline="New Orator Intake Enrolled",
        lead_text=f"{greeting_coach}, an orator has completed onboarding and formulated their initial diagnostic protocol.",
        content_html=content_html,
        action_url=coach_portal_url,
        action_label="Review Speaker Dossier in Coach OS"
    )

    return _dispatch_smtp_email_sync(
        recipient_email=coach_email,
        subject=f"Global Orators Faculty · New Orator Enrolled: {speaker_name}",
        text_body=text_body,
        html_body=html_body
    )


async def send_coach_new_speaker_email(
    coach_email: str,
    coach_name: str,
    speaker_name: str,
    speaker_email: str,
    branch: str,
    mission_focus: str,
    primary_format: str,
    curriculum_focus: str,
    target_cadence: int,
    institution: str = ""
) -> bool:
    """Async wrapper for coach new speaker notification."""
    return await asyncio.to_thread(
        send_coach_new_speaker_email_sync,
        coach_email,
        coach_name,
        speaker_name,
        speaker_email,
        branch,
        mission_focus,
        primary_format,
        curriculum_focus,
        target_cadence,
        institution
    )


# ---------------------------------------------------------------------------
# 4. Faculty Coach Alert: Rehearsal / Drill Submission
# ---------------------------------------------------------------------------

def send_drill_submission_email_sync(
    coach_email: str,
    coach_name: str,
    speaker_name: str,
    drill_title: str,
    duration_seconds: Optional[int] = None,
    notes: Optional[str] = None
) -> bool:
    """Alert coach that a speaker has recorded and submitted a drill for adjudication."""
    coach_portal_url = _sanitize_public_url(f"{settings.APP_URL}/coach")
    greeting_coach = _format_coach_title(coach_name)

    duration_str = ""
    if duration_seconds and duration_seconds > 0:
        minutes = duration_seconds // 60
        secs = duration_seconds % 60
        duration_str = f"{minutes}m {secs:02d}s" if minutes else f"{secs}s"

    text_body = f"""GLOBAL ORATORS · DRILL SUBMISSION DISPATCH
{greeting_coach}, orator {speaker_name} has submitted a rehearsal session for faculty adjudication.

SUBMISSION DETAILS:
- Speaker: {speaker_name}
- Drill / Rehearsal: {drill_title}
- Duration: {duration_str or 'Completed Session'}
- Notes: {notes or 'Audio rehearsal recorded and submitted for evaluation.'}

Open Coach OS to listen to the recording and submit evaluation feedback:
{coach_portal_url}
"""

    notes_line = f"""<tr><td style="color: #64748b; font-size: 11px; padding: 4px 0; width: 130px; font-family: ui-monospace, monospace; text-transform: uppercase;">Notes</td><td style="color: #cbd5e1; font-size: 13px;">{notes}</td></tr>""" if notes else ""
    dur_line = f"""<tr><td style="color: #64748b; font-size: 11px; padding: 4px 0; width: 130px; font-family: ui-monospace, monospace; text-transform: uppercase;">Duration</td><td style="color: #ffffff; font-size: 13px; font-weight: 600;">{duration_str}</td></tr>""" if duration_str else ""

    content_html = f"""
    <div style="background-color: #080a0e; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="color: #64748b; font-size: 11px; padding: 4px 0; width: 130px; font-family: ui-monospace, monospace; text-transform: uppercase;">Speaker</td>
          <td style="color: #ffffff; font-size: 13px; font-weight: 700;">{speaker_name}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-size: 11px; padding: 4px 0; font-family: ui-monospace, monospace; text-transform: uppercase;">Drill / Speech</td>
          <td style="color: #c89630; font-size: 13px; font-weight: 700;">{drill_title}</td>
        </tr>
        {dur_line}
        {notes_line}
      </table>
    </div>
    """

    html_body = _wrap_editorial_html(
        kicker="Global Orators · Drill Submission Dispatch",
        headline="Rehearsal Submission Received",
        lead_text=f"{greeting_coach}, orator {speaker_name} has submitted a rehearsal session for faculty adjudication.",
        content_html=content_html,
        action_url=coach_portal_url,
        action_label="Adjudicate in Coach OS"
    )

    return _dispatch_smtp_email_sync(
        recipient_email=coach_email,
        subject=f"Global Orators Faculty · Rehearsal Submission: {speaker_name}",
        text_body=text_body,
        html_body=html_body
    )


async def send_drill_submission_email(
    coach_email: str,
    coach_name: str,
    speaker_name: str,
    drill_title: str,
    duration_seconds: Optional[int] = None,
    notes: Optional[str] = None
) -> bool:
    """Async wrapper for drill submission notification."""
    return await asyncio.to_thread(
        send_drill_submission_email_sync,
        coach_email,
        coach_name,
        speaker_name,
        drill_title,
        duration_seconds,
        notes
    )


# ---------------------------------------------------------------------------
# 5. Speaker Alert: Coach Feedback & Review Published
# ---------------------------------------------------------------------------

def send_coach_feedback_email_sync(
    speaker_email: str,
    speaker_name: str,
    drill_title: str,
    coach_name: str,
    feedback_text: str,
    rating: Optional[int] = None
) -> bool:
    """Alert speaker when their coach has reviewed and adjudicated their rehearsal."""
    speaker_portal_url = _sanitize_public_url(f"{settings.APP_URL}/speaker")
    greeting_coach = _format_coach_title(coach_name)

    rating_str = f"{rating}/5" if rating else "Evaluated"

    text_body = f"""GLOBAL ORATORS · FACULTY ADJUDICATION DISPATCH
{speaker_name}, {greeting_coach} has published feedback on your rehearsal.

EVALUATION DETAILS:
- Drill: {drill_title}
- Adjudicator: {greeting_coach}
- Rating: {rating_str}

COACH CRITIQUE & NOTES:
"{feedback_text}"

Enter your speaker workspace to review full notes, practice recommendations, and upcoming drills:
{speaker_portal_url}
"""

    rating_badge = f"""<div style="font-size: 12px; color: #f59e0b; font-weight: 700; margin-top: 4px;">Rating: {rating_str}</div>""" if rating else ""

    content_html = f"""
    <div style="background-color: #080a0e; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-family: ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b;">
        Rehearsal Session
      </div>
      <div style="font-size: 15px; font-weight: 800; color: #ffffff; font-family: Georgia, serif; margin: 4px 0 10px 0;">
        {drill_title}
      </div>
      <div style="font-size: 12px; color: #94a3b8;">
        Adjudicated by <strong style="color: #ffffff;">{greeting_coach}</strong>
      </div>
      {rating_badge}

      <!-- Coach Feedback Quote Box -->
      <div style="background-color: #10141d; border-left: 3px solid #c89630; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-top: 16px;">
        <div style="font-size: 10px; font-family: ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.1em; color: #c89630; font-weight: 700; margin-bottom: 6px;">
          Faculty Critique
        </div>
        <div style="font-size: 13px; line-height: 1.6; color: #e2e8f0; font-style: italic;">
          &ldquo;{feedback_text}&rdquo;
        </div>
      </div>
    </div>
    """

    html_body = _wrap_editorial_html(
        kicker="Global Orators · Faculty Adjudication",
        headline="Faculty Feedback Published",
        lead_text=f"{speaker_name}, your coach {coach_name} has published feedback on your rehearsal session.",
        content_html=content_html,
        action_url=speaker_portal_url,
        action_label="Review Feedback & Rehearsals"
    )

    return _dispatch_smtp_email_sync(
        recipient_email=speaker_email,
        subject=f"Global Orators · Faculty Evaluation: {drill_title}",
        text_body=text_body,
        html_body=html_body
    )


async def send_coach_feedback_email(
    speaker_email: str,
    speaker_name: str,
    drill_title: str,
    coach_name: str,
    feedback_text: str,
    rating: Optional[int] = None
) -> bool:
    """Async wrapper for coach feedback email dispatch."""
    return await asyncio.to_thread(
        send_coach_feedback_email_sync,
        speaker_email,
        speaker_name,
        drill_title,
        coach_name,
        feedback_text,
        rating
    )


# ---------------------------------------------------------------------------
# 6. Direct Message Notification (Speaker & Coach)
# ---------------------------------------------------------------------------

def send_direct_message_email_sync(
    recipient_email: str,
    recipient_name: str,
    sender_name: str,
    sender_role: str,
    message_snippet: str,
    thread_url: Optional[str] = None
) -> bool:
    """Notify user of a new direct communication in the platform."""
    default_url = f"{settings.APP_URL}/coach" if sender_role.lower() == "speaker" else f"{settings.APP_URL}/speaker"
    target_url = _sanitize_public_url(thread_url or default_url)

    clean_snippet = message_snippet[:280] + ("..." if len(message_snippet) > 280 else "")

    text_body = f"""Global Orators · Direct Message
Hello {recipient_name}, {sender_name} ({sender_role}) sent you a message:

"{clean_snippet}"

View full conversation:
{target_url}
"""

    content_html = f"""
    <div style="background-color: #080a0e; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-family: ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 6px;">
        Sender
      </div>
      <div style="font-size: 14px; font-weight: 700; color: #ffffff;">
        {sender_name} <span style="font-size: 11px; color: #c89630; font-family: ui-monospace, monospace; text-transform: uppercase; font-weight: 600;">({sender_role})</span>
      </div>

      <div style="background-color: #10141d; border-left: 3px solid #c89630; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-top: 14px;">
        <div style="font-size: 13px; line-height: 1.6; color: #e2e8f0;">
          &ldquo;{clean_snippet}&rdquo;
        </div>
      </div>
    </div>
    """

    html_body = _wrap_editorial_html(
        kicker="Global Orators · Coaching Workspace",
        headline=f"New Message from {sender_name}",
        lead_text=f"Hello {recipient_name}, {sender_name} sent you a message.",
        content_html=content_html,
        action_url=target_url,
        action_label="View Message & Reply"
    )

    return _dispatch_smtp_email_sync(
        recipient_email=recipient_email,
        subject=f"New message from {sender_name} · Global Orators",
        text_body=text_body,
        html_body=html_body
    )


async def send_direct_message_email(
    recipient_email: str,
    recipient_name: str,
    sender_name: str,
    sender_role: str,
    message_snippet: str,
    thread_url: Optional[str] = None
) -> bool:
    """Async wrapper for direct message email notification."""
    return await asyncio.to_thread(
        send_direct_message_email_sync,
        recipient_email,
        recipient_name,
        sender_name,
        sender_role,
        message_snippet,
        thread_url
    )


# ---------------------------------------------------------------------------
# 7. Institutional & Partnership Inquiry Alert (to Faculty Coach)
# ---------------------------------------------------------------------------

def send_inquiry_notification_email_sync(
    coach_email: str,
    organization: str,
    contact_email: str,
    branch: str,
    focus: str,
    message: str
) -> bool:
    """Alert faculty coaches of new school, grant, or institutional inquiries."""
    coach_portal_url = _sanitize_public_url(f"{settings.APP_URL}/coach")

    text_body = f"""GLOBAL ORATORS · INTAKE INQUIRY DISPATCH
A new institutional partnership inquiry has been submitted.

INQUIRY DETAILS:
- Organization: {organization}
- Contact Email: {contact_email}
- Program / Branch: {branch}
- Strategic Focus: {focus}

INQUIRY STATEMENT:
"{message}"

Access Coach OS to review intake inquiries:
{coach_portal_url}
"""

    content_html = f"""
    <div style="background-color: #080a0e; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="color: #64748b; font-size: 11px; padding: 4px 0; width: 130px; font-family: ui-monospace, monospace; text-transform: uppercase;">Organization</td>
          <td style="color: #ffffff; font-size: 14px; font-weight: 700;">{organization}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-size: 11px; padding: 4px 0; font-family: ui-monospace, monospace; text-transform: uppercase;">Contact Email</td>
          <td style="color: #c89630; font-size: 13px;">{contact_email}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-size: 11px; padding: 4px 0; font-family: ui-monospace, monospace; text-transform: uppercase;">Branch & Focus</td>
          <td style="color: #cbd5e1; font-size: 13px;">{branch} &middot; {focus}</td>
        </tr>
      </table>

      <div style="background-color: #10141d; border-left: 3px solid #c89630; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-top: 14px;">
        <div style="font-size: 10px; font-family: ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.1em; color: #c89630; font-weight: 700; margin-bottom: 6px;">
          Applicant Message
        </div>
        <div style="font-size: 13px; line-height: 1.6; color: #e2e8f0;">
          &ldquo;{message}&rdquo;
        </div>
      </div>
    </div>
    """

    html_body = _wrap_editorial_html(
        kicker="Global Orators · Intake Inquiry Dispatch",
        headline="New Institutional Partnership Inquiry",
        lead_text=f"A new partnership or grant inquiry was received from {organization}.",
        content_html=content_html,
        action_url=coach_portal_url,
        action_label="Review Inquiries in Coach OS"
    )

    return _dispatch_smtp_email_sync(
        recipient_email=coach_email,
        subject=f"Global Orators Faculty · Institutional Inquiry: {organization}",
        text_body=text_body,
        html_body=html_body
    )


async def send_inquiry_notification_email(
    coach_email: str,
    organization: str,
    contact_email: str,
    branch: str,
    focus: str,
    message: str
) -> bool:
    """Async wrapper for inquiry email dispatch."""
    return await asyncio.to_thread(
        send_inquiry_notification_email_sync,
        coach_email,
        organization,
        contact_email,
        branch,
        focus,
        message
    )
