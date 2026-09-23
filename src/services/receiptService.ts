import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { GOP_BILLING_CONFIG } from '../config/company';

export interface ReceiptData {
  transactionId: string;
  date: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  phone: string;
}

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

export const generateReceipt = async (data: ReceiptData, returnDoc: boolean = false) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const goldRgb = GOP_BILLING_CONFIG.brandColorRgb;

  // ─── BRANDED HEADER BANNER ─────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 48, 'F');

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
  doc.setTextColor(148, 163, 184);
  doc.text(GOP_BILLING_CONFIG.tagline, 52, 29);

  // Receipt label on right
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(goldRgb[0], goldRgb[1], goldRgb[2]);
  doc.text('RECEIPT', pageWidth - 14, 22, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`#${data.transactionId.slice(0, 20)}`, pageWidth - 14, 29, { align: 'right' });
  doc.text(data.date, pageWidth - 14, 35, { align: 'right' });

  // ─── TWO-COLUMN BILLING INFO ───────────────────────────────────────
  const billingY = 60;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(goldRgb[0], goldRgb[1], goldRgb[2]);
  doc.text('FROM', 14, billingY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(GOP_BILLING_CONFIG.legalName, 14, billingY + 6);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  let fromY = billingY + 11;
  doc.text(`Reg: ${GOP_BILLING_CONFIG.registrationNumber}`, 14, fromY);
  fromY += 5;
  GOP_BILLING_CONFIG.addressLines.forEach(line => {
    doc.text(line, 14, fromY);
    fromY += 5;
  });
  doc.text(GOP_BILLING_CONFIG.email, 14, fromY);

  // Paid By
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(goldRgb[0], goldRgb[1], goldRgb[2]);
  doc.text('PAID BY', pageWidth / 2 + 10, billingY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Phone: ${data.phone}`, pageWidth / 2 + 10, billingY + 6);
  doc.text(`Method: ${data.paymentMethod}`, pageWidth / 2 + 10, billingY + 11);
  doc.text(`Txn ID: ${data.transactionId}`, pageWidth / 2 + 10, billingY + 16);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, billingY + 34, pageWidth - 14, billingY + 34);

  // ─── TABLE ─────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: billingY + 38,
    head: [['Item / Description', 'Qty', 'Unit Price', 'Amount']],
    body: [
      [data.planName, '1', `${GOP_BILLING_CONFIG.currency} ${data.amount.toLocaleString()}`, `${GOP_BILLING_CONFIG.currency} ${data.amount.toLocaleString()}`]
    ],
    foot: [
      [
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: '', styles: { fillColor: [255, 255, 255] } },
        { content: 'TOTAL PAID', styles: { fillColor: [15, 23, 42], fontStyle: 'bold', textColor: [255, 255, 255], fontSize: 11 } },
        { content: `${GOP_BILLING_CONFIG.currency} ${data.amount.toLocaleString()}`, styles: { fillColor: [15, 23, 42], fontStyle: 'bold', textColor: [goldRgb[0], goldRgb[1], goldRgb[2]], fontSize: 11 } }
      ]
    ],
    theme: 'plain',
    headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 10, textColor: [30, 41, 59] },
    columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 40, halign: 'right' }, 3: { cellWidth: 40, halign: 'right' } },
    margin: { left: 14, right: 14 }
  });

  const afterTableY = (doc as any).lastAutoTable.finalY;

  // Stamp
  doc.saveGraphicsState();
  doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
  doc.setFontSize(72);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('PAID', pageWidth / 2, 140, { align: 'center', angle: 25 });
  doc.restoreGraphicsState();

  // Footer & QR Code
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');
  doc.setFillColor(goldRgb[0], goldRgb[1], goldRgb[2]);
  doc.rect(0, pageHeight - 6, pageWidth, 1.5, 'F');

  try {
    const qrDataUrl = await QRCode.toDataURL(data.transactionId, { margin: 1, width: 80 });
    const qrSize = 22;
    doc.addImage(qrDataUrl, 'PNG', pageWidth - 14 - qrSize, pageHeight - 12 - qrSize, qrSize, qrSize);
  } catch (err) {
    console.error('QR error', err);
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`${GOP_BILLING_CONFIG.name} — Official Payment Receipt`, 14, pageHeight - 12);

  if (returnDoc) {
    return doc;
  }
  doc.save(`Receipt_${data.transactionId}.pdf`);
  return doc;
};
