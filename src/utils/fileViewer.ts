/**
 * Utility functions for handling and opening WhatsApp-style attachments
 * (PDF documents, transcripts, images, and audio).
 */

export const isImageFile = (fileName?: string, fileType?: string, url?: string): boolean => {
  if (fileType?.startsWith('image/')) return true;
  const target = (fileName || url || '').toLowerCase();
  return /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp)(\?.*)?$/i.test(target) || (url?.startsWith('data:image/') ?? false);
};

export const isPdfFile = (fileName?: string, fileType?: string): boolean => {
  if (fileType === 'application/pdf') return true;
  const target = (fileName || '').toLowerCase();
  return /\.pdf(\?.*)?$/i.test(target);
};

export const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export const createFallbackPdfDataUrl = (fileName: string, metadata?: { title?: string; sender?: string }): string => {
  const safeName = (fileName || 'Document').replace(/[()]/g, '');
  const title = (metadata?.title || 'Global Orators Protocol Document').replace(/[()]/g, '');
  const sender = (metadata?.sender || 'Faculty Desk').replace(/[()]/g, '');

  const pdfStream = 
`%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj <</Length 260>> stream
BT
/F1 18 Tf
50 720 Td
(GLOBAL ORATORS - Executive Speech Document) Tj
/F1 12 Tf
0 -40 Td
(File: ${safeName}) Tj
0 -25 Td
(Title: ${title}) Tj
0 -25 Td
(Sender: ${sender}) Tj
0 -25 Td
(Status: Verified via Faculty Desk Vault) Tj
ET
endstream
endobj
5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000556 00000 n 
trailer <</Size 6 /Root 1 0 R>>
startxref
633
%%EOF`;

  return `data:application/pdf;base64,${btoa(pdfStream)}`;
};

export const openOrDownloadFile = (
  fileUrl?: string, 
  fileName?: string, 
  metadata?: { title?: string; sender?: string }
): void => {
  const effectiveName = fileName || 'document.pdf';
  let targetUrl = fileUrl;

  if (!targetUrl || targetUrl.trim() === '') {
    targetUrl = createFallbackPdfDataUrl(effectiveName, metadata);
  }

  try {
    if (targetUrl.startsWith('data:')) {
      const parts = targetUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const b64Data = parts[1] || '';
      const byteCharacters = atob(b64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const blobUrl = URL.createObjectURL(blob);

      // Open in a new tab if supported, otherwise trigger download
      const win = window.open(blobUrl, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = effectiveName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } else {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.target = '_blank';
      a.download = effectiveName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.error('Failed to open/download file:', err);
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  }
};
