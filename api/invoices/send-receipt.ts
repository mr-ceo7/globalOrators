import type { IncomingMessage, ServerResponse } from 'http';

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_cVKs2BmD_BaxMzSs5k4YwZ7BgCoARXptb';
const FROM_EMAIL = process.env.FROM_EMAIL || 'auth@globaloratorsproject.com';
const PAYMENT_BACKEND_URL = process.env.VITE_PAYMENT_BACKEND_URL || 'https://uon-smart-backend.onrender.com';

interface InvoiceItem {
  description?: string;
  quantity?: number;
  unitPrice?: number;
}

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  items?: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  currency?: string;
  status?: string;
  paidAt?: string;
  transactionId?: string;
}

export default async function handler(req: any, res: any) {
  // Support CORS for client-side invocations
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const invoiceId = req.query.invoiceId || req.query.id || body.invoiceId;

    if (!invoiceId) {
      return res.status(400).json({ error: 'Missing invoice identifier' });
    }

    // 1. Fetch authoritative invoice record from the database/payment backend
    const invRes = await fetch(`${PAYMENT_BACKEND_URL}/api/invoices/${encodeURIComponent(String(invoiceId))}`);
    if (!invRes.ok) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const invoice: InvoiceRecord = await invRes.json();

    const targetEmail = (body.email || invoice.clientEmail || '').trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid recipient email address is required' });
    }

    const currency = invoice.currency || 'KES';
    const totalFormatted = `${currency} ${(invoice.total || 0).toLocaleString()}`;
    const subtotalFormatted = `${currency} ${(invoice.subtotal || invoice.total || 0).toLocaleString()}`;
    const taxFormatted = invoice.tax ? `${currency} ${invoice.tax.toLocaleString()}` : `${currency} 0`;
    const settledDate = invoice.paidAt ? new Date(invoice.paidAt).toUTCString() : new Date().toUTCString();
    const txnId = invoice.transactionId || 'ONLINE-SETTLEMENT';
    const items = Array.isArray(invoice.items) && invoice.items.length > 0
      ? invoice.items
      : [{ description: 'Pan-African Forensics & Oratory Services', quantity: 1, unitPrice: invoice.total || 0 }];

    const itemsHtml = items.map(it => {
      const q = it.quantity || 1;
      const u = it.unitPrice || 0;
      const t = q * u;
      return `
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 12px 16px; color: #f1f5f9; font-size: 13px;">${it.description || 'Deliverable'}</td>
          <td style="padding: 12px 16px; color: #94a3b8; font-size: 13px; text-align: center; font-family: monospace;">${q}</td>
          <td style="padding: 12px 16px; color: #94a3b8; font-size: 13px; text-align: right; font-family: monospace;">${currency} ${u.toLocaleString()}</td>
          <td style="padding: 12px 16px; color: #f1f5f9; font-size: 13px; text-align: right; font-family: monospace; font-weight: bold;">${currency} ${t.toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    const itemsText = items.map(it => {
      const q = it.quantity || 1;
      const u = it.unitPrice || 0;
      return `- ${it.description || 'Deliverable'}: ${q} x ${currency} ${u.toLocaleString()} = ${currency} ${(q * u).toLocaleString()}`;
    }).join('\n');

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt ${invoice.invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
    <tr>
      <td style="height: 4px; background-color: #C89630;"></td>
    </tr>
    <tr>
      <td style="padding: 32px 32px 24px 32px; background-color: #020617; border-bottom: 1px solid #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="font-family: monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #C89630; font-weight: bold; margin-bottom: 4px;">Official Payment Receipt</div>
              <div style="font-family: Georgia, serif; font-size: 22px; font-weight: bold; color: #f8fafc; letter-spacing: -0.5px;">THE GLOBAL ORATORS PROJECT</div>
              <div style="color: #94a3b8; font-size: 12px; margin-top: 2px;">Pan-African Forensics, Debate & Voice Sovereignty</div>
            </td>
            <td style="text-align: right; vertical-align: top;">
              <span style="display: inline-block; padding: 4px 10px; background-color: #064e3b; border: 1px solid #059669; color: #34d399; font-family: monospace; font-size: 11px; font-weight: bold; border-radius: 6px; text-transform: uppercase;">SETTLED</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px; background-color: #0b1329; border-bottom: 1px solid #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <div style="font-family: monospace; font-size: 10px; color: #C89630; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Official Payee</div>
              <div style="font-weight: bold; font-size: 14px; color: #f8fafc;">Global Orators Project</div>
              <div style="color: #94a3b8; font-size: 12px; margin-top: 2px;">Nairobi, Kenya</div>
              <div style="color: #94a3b8; font-size: 12px;">director@globaloratorsproject.com</div>
            </td>
            <td style="width: 50%; vertical-align: top; text-align: right;">
              <div style="font-family: monospace; font-size: 10px; color: #C89630; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Billed Client</div>
              <div style="font-weight: bold; font-size: 14px; color: #f8fafc;">${invoice.clientName || 'Valued Client'}</div>
              <div style="color: #94a3b8; font-size: 12px; margin-top: 2px;">${targetEmail}</div>
              ${invoice.clientPhone ? `<div style="color: #94a3b8; font-size: 12px;">${invoice.clientPhone}</div>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 32px; background-color: #0f172a; border-bottom: 1px solid #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom: 6px; color: #94a3b8; font-size: 12px;">Invoice Number:</td>
            <td style="padding-bottom: 6px; text-align: right; font-family: monospace; font-weight: bold; color: #f8fafc; font-size: 13px;">${invoice.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 6px; color: #94a3b8; font-size: 12px;">Settlement Timestamp:</td>
            <td style="padding-bottom: 6px; text-align: right; font-family: monospace; color: #cbd5e1; font-size: 12px;">${settledDate}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 6px; color: #94a3b8; font-size: 12px;">Payment Method:</td>
            <td style="padding-bottom: 6px; text-align: right; color: #cbd5e1; font-size: 12px;">Online Settlement (M-Pesa / Card)</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; font-size: 12px;">Transaction Reference:</td>
            <td style="text-align: right; font-family: monospace; color: #38bdf8; font-size: 12px;">${txnId}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px 12px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid #334155;">
              <th style="padding: 8px 16px; text-align: left; font-family: monospace; font-size: 10px; text-transform: uppercase; color: #94a3b8;">Deliverable</th>
              <th style="padding: 8px 16px; text-align: center; font-family: monospace; font-size: 10px; text-transform: uppercase; color: #94a3b8;">Qty</th>
              <th style="padding: 8px 16px; text-align: right; font-family: monospace; font-size: 10px; text-transform: uppercase; color: #94a3b8;">Unit Price</th>
              <th style="padding: 8px 16px; text-align: right; font-family: monospace; font-size: 10px; text-transform: uppercase; color: #94a3b8;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 32px 24px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #1e293b; padding-top: 16px;">
          <tr>
            <td style="padding: 4px 0; color: #94a3b8; font-size: 12px; font-family: monospace;">Subtotal</td>
            <td style="padding: 4px 0; text-align: right; color: #cbd5e1; font-size: 12px; font-family: monospace;">${subtotalFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #94a3b8; font-size: 12px; font-family: monospace;">Tax</td>
            <td style="padding: 4px 0; text-align: right; color: #94a3b8; font-size: 12px; font-family: monospace;">${taxFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0 0 0; color: #f8fafc; font-size: 16px; font-weight: bold; border-top: 1px solid #334155;">AMOUNT SETTLED</td>
            <td style="padding: 12px 0 0 0; text-align: right; color: #C89630; font-size: 20px; font-weight: bold; font-family: monospace; border-top: 1px solid #334155;">${totalFormatted}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px; background-color: #020617; border-top: 1px solid #1e293b; text-align: center; color: #64748b; font-size: 11px;">
        <p style="margin: 0 0 8px 0; color: #94a3b8;">This is an electronically verified payment receipt issued by Global Orators Project.</p>
        <p style="margin: 0; font-family: monospace;">Global Orators Project · Nairobi, Kenya · director@globaloratorsproject.com</p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textBody = `
OFFICIAL PAYMENT RECEIPT
THE GLOBAL ORATORS PROJECT
Pan-African Forensics, Debate & Voice Sovereignty

Status: SETTLED & CONFIRMED
Invoice Number: ${invoice.invoiceNumber}
Settlement Date: ${settledDate}
Payment Reference: ${txnId}

Billed To:
${invoice.clientName || 'Valued Client'}
Email: ${targetEmail}
Phone: ${invoice.clientPhone || 'N/A'}

Payee:
Global Orators Project
Nairobi, Kenya
director@globaloratorsproject.com

Deliverables:
${itemsText}

Subtotal: ${subtotalFormatted}
Tax: ${taxFormatted}
TOTAL SETTLED: ${totalFormatted}

Thank you for your transaction with Global Orators Project.
    `.trim();

    // 2. Dispatch via Resend REST API directly from GOP
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `The Global Orators Project <${FROM_EMAIL}>`,
        to: [targetEmail],
        subject: `Payment Receipt: ${invoice.invoiceNumber} — The Global Orators Project`,
        html: htmlBody,
        text: textBody,
        reply_to: 'director@globaloratorsproject.com',
      }),
    });

    const resendData = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      console.error('[GOP Receipt Dispatch Error]:', resendData);
      return res.status(500).json({ error: resendData.message || 'Failed to dispatch receipt email via GOP' });
    }

    return res.status(200).json({
      success: true,
      message: `Receipt successfully emailed to ${targetEmail}`,
      messageId: resendData.id,
    });
  } catch (err: any) {
    console.error('[Receipt Handler Exception]:', err);
    return res.status(500).json({ error: err.message || 'Internal server error while processing receipt' });
  }
}
