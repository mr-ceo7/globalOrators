import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { GOP_BILLING_CONFIG } from '../config/company';
import { api } from './apiClient';

const PAYMENT_BACKEND_URL = import.meta.env.VITE_PAYMENT_BACKEND_URL || 'https://uon-smart-backend.onrender.com';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  company?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
  dueDate: string;
  notes: string;
  createdAt: string;
  paidAt: string | null;
  transactionId: string | null;
}

// ─── API CALLS ─────────────────────────────────────────────────────
// Public invoice views and payments go straight to the payment backend (with local reverse-proxy fallback).
// Admin calls go through the Global Orators API proxy.

export const fetchInvoice = async (id: string): Promise<Invoice> => {
  try {
    const res = await fetch(`${PAYMENT_BACKEND_URL}/api/invoices/${encodeURIComponent(id)}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Direct payment backend invoice fetch failed, falling back to local proxy:', err);
  }
  const fallbackRes = await fetch(`/api/invoices/${encodeURIComponent(id)}`);
  if (!fallbackRes.ok) throw new Error('Invoice not found');
  return fallbackRes.json();
};

export const createInvoice = async (data: {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  items: InvoiceItem[];
  tax?: number;
  dueDate?: string;
  notes?: string;
}): Promise<{ success: boolean; id: string; invoiceNumber: string; company?: string }> => {
  return api.post('/invoices', data);
};

export const listInvoices = async (filters?: { status?: string }): Promise<Invoice[]> => {
  return api.get<Invoice[]>('/invoices', filters?.status ? { status: filters.status } : undefined);
};

export const payInvoice = async (invoiceId: string, phone?: string) => {
  try {
    const res = await fetch(`${PAYMENT_BACKEND_URL}/api/invoices/${encodeURIComponent(invoiceId)}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone || '' }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Direct payment backend pay failed, falling back to local proxy:', err);
  }
  const fallbackRes = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone || '' }),
  });
  if (!fallbackRes.ok) {
    const err = await fallbackRes.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Payment failed');
  }
  return fallbackRes.json();
};

export const sendInvoiceReceipt = async (invoiceId: string, email?: string): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}/send-receipt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Failed to dispatch receipt email');
  }
  return res.json();
};

export const updateInvoice = async (id: string, data: {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  items?: InvoiceItem[];
  tax?: number;
  dueDate?: string;
  notes?: string;
  status?: string;
}): Promise<{ success: boolean }> => {
  return api.put(`/invoices/${encodeURIComponent(id)}`, data);
};

export const updateInvoiceStatus = async (id: string, status: string): Promise<{ success: boolean }> => {
  return api.patch(`/invoices/${encodeURIComponent(id)}`, { status });
};

export interface InvoiceDraft {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  items?: InvoiceItem[];
  tax?: number;
  dueDate?: string;
  notes?: string;
}

/** Turns a natural-language description into invoice fields (AI runs server-side). */
export const draftInvoice = async (prompt: string): Promise<InvoiceDraft> => {
  return api.post<InvoiceDraft>('/invoices/draft', { prompt });
};

// ─── LOGO HELPER ───────────────────────────────────────────────────

const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context failed');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
};

// ─── PDF GENERATION ────────────────────────────────────────────────

export const generateInvoicePDF = async (invoice: Invoice) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const goldRgb = GOP_BILLING_CONFIG.brandColorRgb;

  // ─── BRANDED HEADER BANNER ─────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 48, 'F');
  
  // Gold hairline divider
  doc.setFillColor(goldRgb[0], goldRgb[1], goldRgb[2]);
  doc.rect(0, 48, pageWidth, 1.5, 'F');

  try {
    const logoBase64 = await loadImageAsBase64(GOP_BILLING_CONFIG.logoUrl);
    doc.addImage(logoBase64, 'PNG', 14, 8, 32, 32);
  } catch {
    doc.setFontSize(18);
    doc.setTextColor(goldRgb[0], goldRgb[1], goldRgb[2]);
    doc.text('GOP', 22, 28);
  }

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(GOP_BILLING_CONFIG.name.toUpperCase(), 52, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(GOP_BILLING_CONFIG.tagline, 52, 29);

  // Invoice label + number
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(goldRgb[0], goldRgb[1], goldRgb[2]);
  doc.text('INVOICE', pageWidth - 14, 22, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(invoice.invoiceNumber, pageWidth - 14, 29, { align: 'right' });
  doc.text(`Issued: ${new Date(invoice.createdAt).toLocaleDateString()}`, pageWidth - 14, 35, { align: 'right' });
  if (invoice.dueDate) {
    doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, pageWidth - 14, 41, { align: 'right' });
  }

  // ─── TWO-COLUMN BILLING ────────────────────────────────────────────
  const billingY = 60;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(goldRgb[0], goldRgb[1], goldRgb[2]);
  doc.text('FROM', 14, billingY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(GOP_BILLING_CONFIG.legalName, 14, billingY + 6);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  let fromY = billingY + 11;
  doc.text(`Reg: ${GOP_BILLING_CONFIG.registrationNumber}`, 14, fromY);
  fromY += 5;
  GOP_BILLING_CONFIG.addressLines.forEach(line => {
    doc.text(line, 14, fromY);
    fromY += 5;
  });
  doc.text(GOP_BILLING_CONFIG.email, 14, fromY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(goldRgb[0], goldRgb[1], goldRgb[2]);
  doc.text('BILLED TO', pageWidth / 2 + 10, billingY);

  let toY = billingY + 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);

  if (invoice.clientName) {
    const nameLines = invoice.clientName.split('\n');
    doc.text(nameLines, pageWidth / 2 + 10, toY);
    toY += nameLines.length * 5 + 1;
  } else {
    doc.text('Client', pageWidth / 2 + 10, toY);
    toY += 6;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  
  if (invoice.clientEmail) {
    const emailLines = invoice.clientEmail.split('\n');
    doc.text(emailLines, pageWidth / 2 + 10, toY);
    toY += emailLines.length * 5;
  }
  if (invoice.clientPhone) {
    doc.text(invoice.clientPhone, pageWidth / 2 + 10, toY);
  }

  // ─── DIVIDER ───────────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(14, billingY + 34, pageWidth - 14, billingY + 34);

  // ─── ITEMIZED TABLE ────────────────────────────────────────────────
  const items = invoice.items || [];
  const tableBody = items.map(item => [
    item.description,
    String(item.quantity),
    `${invoice.currency} ${item.unitPrice.toLocaleString()}`,
    `${invoice.currency} ${(item.quantity * item.unitPrice).toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: billingY + 38,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: tableBody,
    foot: [
      [
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: 'Subtotal', styles: { fillColor: [248, 250, 252], fontStyle: 'bold', textColor: [71, 85, 105] } },
        { content: `${invoice.currency} ${invoice.subtotal.toLocaleString()}`, styles: { fillColor: [248, 250, 252], fontStyle: 'bold', textColor: [71, 85, 105] } }
      ],
      [
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: 'Tax', styles: { fillColor: [248, 250, 252], textColor: [148, 163, 184] } },
        { content: invoice.tax ? `${invoice.currency} ${invoice.tax.toLocaleString()}` : 'N/A', styles: { fillColor: [248, 250, 252], textColor: [148, 163, 184] } }
      ],
      [
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: 'TOTAL', styles: { fillColor: [15, 23, 42], fontStyle: 'bold', textColor: [255, 255, 255], fontSize: 12 } },
        { content: `${invoice.currency} ${invoice.total.toLocaleString()}`, styles: { fillColor: [15, 23, 42], fontStyle: 'bold', textColor: [goldRgb[0], goldRgb[1], goldRgb[2]], fontSize: 12 } }
      ],
    ],
    theme: 'plain',
    headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold', fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 6, right: 6 } },
    bodyStyles: { fontSize: 10, textColor: [30, 41, 59], cellPadding: { top: 6, bottom: 6, left: 6, right: 6 } },
    footStyles: { fontSize: 10, cellPadding: { top: 4, bottom: 4, left: 6, right: 6 } },
    columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 40, halign: 'right' }, 3: { cellWidth: 40, halign: 'right' } },
    margin: { left: 14, right: 14 },
  });

  const afterTableY = (doc as any).lastAutoTable.finalY;

  // ─── NOTES ─────────────────────────────────────────────────────────
  if (invoice.notes) {
    const notesY = afterTableY + 12;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(goldRgb[0], goldRgb[1], goldRgb[2]);
    doc.text('NOTES & TERMS', 14, notesY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(invoice.notes, 14, notesY + 6, { maxWidth: pageWidth - 28 });
  }

  // ─── STATUS STAMP ──────────────────────────────────────────────────
  if (invoice.status === 'PAID') {
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
    doc.setFontSize(72);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text('PAID', pageWidth / 2, 140, { align: 'center', angle: 25 });
    doc.restoreGraphicsState();
  }

  // ─── FOOTER ────────────────────────────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');
  doc.setFillColor(goldRgb[0], goldRgb[1], goldRgb[2]);
  doc.rect(0, pageHeight - 6, pageWidth, 1.5, 'F');

  // ─── QR CODE ───────────────────────────────────────────────────────
  try {
    const invoiceUrl = `${window.location.origin}/invoice/${invoice.id}`;
    const qrDataUrl = await QRCode.toDataURL(invoiceUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 100
    });
    
    const qrSize = 24;
    const qrX = pageWidth - 14 - qrSize;
    const qrY = pageHeight - 12 - qrSize;
    
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Scan to Pay / View Online', qrX + (qrSize/2), qrY + qrSize + 3, { align: 'center' });
  } catch (err) {
    console.error('QR Generation failed:', err);
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`${GOP_BILLING_CONFIG.name} — ${GOP_BILLING_CONFIG.email}`, 14, pageHeight - 12);

  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};
