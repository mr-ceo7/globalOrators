import crypto from 'crypto';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FORWARDING_EMAIL = process.env.FORWARDING_EMAIL || 'kassimmusa322@gmail.com';
const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'auth@globaloratorsproject.com';

function verifySvix(secret: string, msgId: string, timestamp: string, rawBody: string, sigHeader: string): boolean {
  if (!secret) return true;
  try {
    const cleanSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    const key = Buffer.from(cleanSecret, 'base64');
    const toSign = `${msgId}.${timestamp}.${rawBody}`;
    const expectedSig = crypto.createHmac('sha256', key).update(toSign).digest('base64');

    const parts = (sigHeader || '').split(' ');
    for (const part of parts) {
      const [version, sig] = part.split(',');
      if (version === 'v1' && crypto.timingSafeEqual(Buffer.from(sig.trim()), Buffer.from(expectedSig))) {
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('[Svix Verification Error]:', err);
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'Global Orators Resend Inbound Forwarder',
      forwarding_to: FORWARDING_EMAIL
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let rawBody = '';
  if (typeof req.body === 'string') {
    rawBody = req.body;
  } else if (Buffer.isBuffer(req.body)) {
    rawBody = req.body.toString('utf-8');
  } else if (req.body && typeof req.body === 'object') {
    rawBody = JSON.stringify(req.body);
  }

  const msgId = req.headers['svix-id'] as string;
  const timestamp = req.headers['svix-timestamp'] as string;
  const signature = req.headers['svix-signature'] as string;

  if (RESEND_WEBHOOK_SECRET && msgId && timestamp && signature) {
    const isValid = verifySvix(RESEND_WEBHOOK_SECRET, msgId, timestamp, rawBody, signature);
    if (!isValid) {
      console.warn('[Resend Webhook] Rejected: Invalid Svix cryptographic signature');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  }

  let payload: any = {};
  try {
    payload = typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : JSON.parse(rawBody);
  } catch (parseErr) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }

  const eventType = payload.type;
  console.log(`[Resend Inbound] Processing event: ${eventType}`);

  if (eventType === 'email.received') {
    const emailId = payload.data?.email_id || payload.data?.id;
    if (!emailId) {
      return res.status(400).json({ error: 'Missing email_id in event data' });
    }

    try {
      // 1. Fetch full email metadata and body from Resend Receiving API
      const fetchRes = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!fetchRes.ok) {
        const errText = await fetchRes.text();
        console.error(`[Resend Inbound] Error fetching email ${emailId}: ${fetchRes.status} ${errText}`);
        return res.status(502).json({ error: 'Failed to retrieve email content from Resend' });
      }

      const emailData: any = await fetchRes.json();
      const origFrom = emailData.from || 'Unknown Sender';
      const toList = emailData.to || [];
      const origTo = toList.join(', ') || 'admissions@globaloratorsproject.com';
      const origSubject = emailData.subject || '(No Subject)';
      const origHtml = emailData.html || '';
      const origText = emailData.text || '';
      const createdAtStr = emailData.created_at || new Date().toISOString();

      const bodyContent = origHtml && origHtml.trim()
        ? origHtml
        : `<pre style="font-family: monospace; white-space: pre-wrap;">${origText || 'No content'}</pre>`;

      const envelopeHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #1e293b;">
  <div style="background-color: #f8fafc; border-left: 4px solid #047857; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 6px 6px 0; border: 1px solid #e2e8f0; border-left-width: 4px; border-left-color: #047857;">
    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #047857; font-weight: 700; margin-bottom: 8px;">
      Global Orators Inbound Gateway &bull; Forwarded Dispatch
    </div>
    <div style="font-size: 13px; line-height: 1.6; color: #334155;">
      <p style="margin: 0 0 4px 0;"><strong>Original Sender:</strong> ${origFrom}</p>
      <p style="margin: 0 0 4px 0;"><strong>Delivered To:</strong> ${origTo}</p>
      <p style="margin: 0 0 4px 0;"><strong>Subject:</strong> ${origSubject}</p>
      <p style="margin: 0;"><strong>Received At:</strong> ${createdAtStr}</p>
    </div>
  </div>
  <div style="padding: 8px 0;">
    ${bodyContent}
  </div>
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; font-family: monospace;">
    Replying directly to this email will send your response to ${origFrom}.
  </div>
</div>
`;

      const envelopeText = `--- GLOBAL ORATORS INBOUND FORWARDED DISPATCH ---
Original Sender: ${origFrom}
Delivered To: ${origTo}
Subject: ${origSubject}
Received At: ${createdAtStr}

-------------------------------------------------
${origText}
`;

      // 2. Dispatch forward to administrator inbox
      const sendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `Global Orators Gateway <${FROM_EMAIL}>`,
          to: [FORWARDING_EMAIL.trim()],
          reply_to: origFrom,
          subject: `[Fwd: ${origTo}] ${origSubject}`,
          html: envelopeHtml,
          text: envelopeText
        })
      });

      if (!sendRes.ok) {
        const sendErr = await sendRes.text();
        console.error(`[Resend Inbound] Forward dispatch failed: ${sendRes.status} ${sendErr}`);
        return res.status(502).json({ error: 'Forward dispatch failed' });
      }

      const sendData: any = await sendRes.json();
      console.log(`[Resend Inbound] Email ${emailId} forwarded to ${FORWARDING_EMAIL} (Dispatch ID: ${sendData.id})`);

      return res.status(200).json({
        status: 'forwarded',
        email_id: emailId,
        forwarded_to: FORWARDING_EMAIL,
        dispatch_id: sendData.id
      });
    } catch (forwardErr: any) {
      console.error('[Resend Inbound] Error during processing:', forwardErr);
      return res.status(500).json({ error: forwardErr.message });
    }
  }

  return res.status(200).json({ status: 'acknowledged', event: eventType });
}
