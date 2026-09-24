import React, { useState, useEffect } from 'react';
import { 
  fetchInvoice, 
  payInvoice, 
  sendInvoiceReceipt,
  generateInvoicePDF, 
  Invoice 
} from '../../services/invoiceService';
import { generateReceipt } from '../../services/receiptService';
import { GOP_BILLING_CONFIG } from '../../config/company';
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  FileText, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Mail,
  Check
} from 'lucide-react';

const PAYMENT_BACKEND_URL = import.meta.env.VITE_PAYMENT_BACKEND_URL || 'https://uon-smart-backend.onrender.com';

interface InvoicePageProps {
  invoiceId?: string;
}

export const InvoicePage: React.FC<InvoicePageProps> = ({ invoiceId }) => {
  // Extract id from props or URL pathname (/invoice/:id)
  const id = invoiceId || (() => {
    const parts = window.location.pathname.split('/');
    const invIndex = parts.indexOf('invoice');
    return invIndex !== -1 && parts[invIndex + 1] ? parts[invIndex + 1] : '';
  })();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payStep, setPayStep] = useState<'idle' | 'sending' | 'waiting' | 'paid'>('idle');
  const [payError, setPayError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Invoice identifier missing from URL.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetchInvoice(id)
      .then(inv => {
        setInvoice(inv);
        if (inv.status === 'PAID') {
          setPayStep('paid');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Invoice not found or expired.');
        setLoading(false);
      });
  }, [id]);

  // Check URL query parameters for return from payment gateway
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txnId = params.get('success_txn') || params.get('reference');
    if (txnId) {
      setTransactionId(txnId);
      setPayStep('waiting');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Poll for payment confirmation
  useEffect(() => {
    if (payStep !== 'waiting' || !transactionId) return;
    const interval = setInterval(async () => {
      try {
        let res = await fetch(`${PAYMENT_BACKEND_URL}/api/transaction-status/${encodeURIComponent(transactionId)}`).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`/api/transaction-status/${encodeURIComponent(transactionId)}`).catch(() => null);
        }
        if (!res || !res.ok) return;
        const data = await res.json();
        if (data.status === 'COMPLETED') {
          setPayStep('paid');
          setInvoice(prev => prev ? { ...prev, status: 'PAID', paidAt: new Date().toISOString() } : prev);
          clearInterval(interval);
        } else if (data.status === 'FAILED') {
          setPayError('Payment was not completed. Please try again.');
          setPayStep('idle');
          clearInterval(interval);
        }
      } catch {
        // Keep polling
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [payStep, transactionId]);

  const handlePay = async () => {
    if (!invoice) return;
    if (invoice.total <= 0) {
      setPayError('This invoice has a balance of KES 0. No online transaction is required.');
      return;
    }
    setPayStep('sending');
    setPayError('');
    try {
      const clientContactPhone = invoice.clientPhone || '';
      const result = await payInvoice(invoice.id, clientContactPhone);
      const txn = result.transactionId || result.reference;

      if (!txn) {
        throw new Error('Payment server did not return a transaction identifier.');
      }

      // Use the branded gateway only when a live public key is configured; otherwise fall back
      // to Paystack's hosted checkout (never a hard-coded test key).
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;
      if (result.access_code && paystackKey) {
        const redirectUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}?success_txn=${txn}`);
        const amountCents = Math.round(invoice.total * 100);
        const cleanPhone = (clientContactPhone || '').replace(/[^0-9]/g, '');
        const email = invoice.clientEmail || (cleanPhone ? `${cleanPhone}@gmail.com` : 'director@globaloratorsproject.com');
        
        const gatewayUrl = `https://payments.royalmint.app/?access_code=${result.access_code}&public_key=${paystackKey}&reference=${txn}&amount=${amountCents}&email=${encodeURIComponent(email)}&redirect_url=${redirectUrl}`;
        window.location.href = gatewayUrl;
        return;
      } else if (result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
        return;
      }

      setTransactionId(txn);
      setPayStep('waiting');
    } catch (err: any) {
      setPayError(err.message || 'Payment initiation failed.');
      setPayStep('idle');
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    await generateInvoicePDF(invoice);
  };

  const handleDownloadReceipt = async () => {
    if (!invoice) return;
    await generateReceipt({
      transactionId: invoice.transactionId || transactionId || `TXN_${Date.now()}`,
      date: new Date().toLocaleDateString(),
      planName: `Invoice ${invoice.invoiceNumber}`,
      amount: invoice.total,
      paymentMethod: 'Online Settlement',
      phone: invoice.clientPhone || 'N/A'
    });
  };

  const handleEmailReceipt = async () => {
    if (!invoice) return;
    const targetEmail = invoice.clientEmail;
    if (!targetEmail || !targetEmail.includes('@')) {
      setEmailStatus('No client email address is registered for this invoice.');
      return;
    }
    setEmailSending(true);
    setEmailStatus(null);
    try {
      const res = await sendInvoiceReceipt(invoice.id, targetEmail);
      setEmailStatus(res.message || `Receipt dispatched to ${targetEmail}`);
    } catch (err: any) {
      setEmailStatus(err.message || 'Failed to email receipt.');
    } finally {
      setEmailSending(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
          <p className="font-mono text-xs text-slate-400">Loading invoice dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="font-serif font-bold text-lg text-slate-100">Invoice Record Not Found</h2>
          <p className="text-xs text-slate-400">
            {error || 'The requested invoice link does not exist or has expired.'}
          </p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'PAID' || payStep === 'paid';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-4 sm:py-8 px-3 sm:px-6 print:bg-white print:text-slate-900 print:py-0">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">

        {/* Top Actions (Print & Download) */}
        <div className="flex items-center justify-between text-xs font-mono print:hidden">
          <div className="text-slate-400 text-[11px] sm:text-xs">
            Reference: <span className="text-slate-200 font-bold">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C89630]/30 bg-slate-900 text-brand-gold hover:bg-[#C89630]/10 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl print:border-none print:shadow-none">
          {/* Branded Banner */}
          <div className="p-4 sm:p-8 bg-slate-950 border-b-2 border-[#C89630] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src={GOP_BILLING_CONFIG.logoUrl}
                alt="Global Orators"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain bg-slate-900 p-1 border border-slate-800"
              />
              <div>
                <h1 className="font-serif font-black text-base sm:text-xl text-slate-100 tracking-tight">
                  {GOP_BILLING_CONFIG.name.toUpperCase()}
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-400 font-sans">
                  {GOP_BILLING_CONFIG.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto sm:text-right pt-2 sm:pt-0 border-t border-slate-800/60 sm:border-0">
              <div className="font-serif font-bold text-base sm:text-lg text-brand-gold">INVOICE</div>
              <div className="font-mono text-xs text-slate-400">{invoice.invoiceNumber}</div>
            </div>
          </div>

          <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
            {/* Status and Dates */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase tracking-wider font-bold rounded-md border ${
                isPaid
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {isPaid && <CheckCircle2 className="w-3.5 h-3.5" />}
                {isPaid ? 'PAID' : invoice.status}
              </span>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                <span>Issued: {new Date(invoice.createdAt).toLocaleDateString()}</span>
                {invoice.dueDate && (
                  <>
                    <span>•</span>
                    <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </>
                )}
                {invoice.paidAt && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">Settled: {new Date(invoice.paidAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Two-Column Billing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 text-xs">
              <div className="p-3.5 sm:p-0 rounded-xl bg-slate-950/40 sm:bg-transparent border border-slate-800/80 sm:border-0 space-y-1">
                <div className="text-[10px] font-mono tracking-widest uppercase text-brand-gold font-semibold">
                  From (Official Payee)
                </div>
                <div className="font-serif font-bold text-sm text-slate-100">{GOP_BILLING_CONFIG.legalName}</div>
                <div className="text-slate-400 font-mono text-[11px]">Reg: {GOP_BILLING_CONFIG.registrationNumber}</div>
                {GOP_BILLING_CONFIG.addressLines.map((line, idx) => (
                  <div key={idx} className="text-slate-400">{line}</div>
                ))}
                <div className="text-slate-400 font-mono pt-0.5">{GOP_BILLING_CONFIG.email}</div>
              </div>

              <div className="p-3.5 sm:p-0 rounded-xl bg-slate-950/40 sm:bg-transparent border border-slate-800/80 sm:border-0 space-y-1">
                <div className="text-[10px] font-mono tracking-widest uppercase text-brand-gold font-semibold">
                  Billed To
                </div>
                <div className="font-serif font-bold text-sm text-slate-100 whitespace-pre-wrap">
                  {invoice.clientName || 'Client'}
                </div>
                {invoice.clientEmail && (
                  <div className="text-slate-400 font-mono text-[11px] whitespace-pre-wrap break-all">{invoice.clientEmail}</div>
                )}
                {invoice.clientPhone && (
                  <div className="text-slate-400 font-mono text-[11px]">{invoice.clientPhone}</div>
                )}
              </div>
            </div>

            {/* Itemized Deliverables */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <div className="sm:hidden bg-slate-950 px-4 py-2.5 border-b border-slate-800 text-[10px] font-mono tracking-wider uppercase text-slate-400">
                Deliverables ({invoice.items.length})
              </div>
              <table className="w-full text-xs">
                <thead className="hidden sm:table-header-group">
                  <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-mono tracking-wider uppercase text-slate-400">
                    <th className="text-left py-3 px-4 font-semibold">Description</th>
                    <th className="text-center py-3 px-3 font-semibold w-16">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold sm:w-28">Unit Price</th>
                    <th className="text-right py-3 px-4 font-semibold sm:w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="block sm:table-row-group divide-y divide-slate-800/60">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="block sm:table-row p-3.5 sm:p-0 hover:bg-slate-800/20 space-y-1.5 sm:space-y-0">
                      <td className="block sm:table-cell py-0 sm:py-3 px-0 sm:px-4 font-sans text-slate-100 font-medium sm:font-normal">
                        {item.description}
                      </td>
                      <td className="hidden sm:table-cell py-3 px-3 text-center font-mono text-slate-300">
                        {item.quantity}
                      </td>
                      <td className="hidden sm:table-cell py-3 px-4 text-right font-mono text-slate-300">
                        {invoice.currency} {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="flex sm:table-cell items-center justify-between py-1.5 sm:py-3 px-0 sm:px-4 text-right font-mono font-medium text-slate-100 border-t border-slate-800/40 sm:border-0 mt-1 sm:mt-0">
                        <span className="sm:hidden text-slate-400 text-[11px] font-normal">
                          {item.quantity} × {invoice.currency} {item.unitPrice.toLocaleString()}
                        </span>
                        <span className="font-bold text-slate-100 sm:font-medium">
                          {invoice.currency} {(item.quantity * item.unitPrice).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="block sm:table-footer-group bg-slate-950/80 border-t border-slate-800 text-xs font-mono p-3.5 sm:p-0 space-y-1.5 sm:space-y-0">
                  <tr className="flex justify-between sm:table-row">
                    <td colSpan={2} className="hidden sm:table-cell py-2.5 px-4"></td>
                    <td className="py-0 sm:py-2.5 px-0 sm:px-4 text-left sm:text-right text-slate-400">Subtotal:</td>
                    <td className="py-0 sm:py-2.5 px-0 sm:px-4 text-right text-slate-200">
                      {invoice.currency} {invoice.subtotal.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="flex justify-between sm:table-row">
                    <td colSpan={2} className="hidden sm:table-cell py-2 px-4"></td>
                    <td className="py-0 sm:py-2 px-0 sm:px-4 text-left sm:text-right text-slate-400">Tax:</td>
                    <td className="py-0 sm:py-2 px-0 sm:px-4 text-right text-slate-400">
                      {invoice.tax ? `${invoice.currency} ${invoice.tax.toLocaleString()}` : 'KES 0'}
                    </td>
                  </tr>
                  <tr className="flex justify-between sm:table-row border-t border-slate-800 font-bold text-sm pt-2 sm:pt-0">
                    <td colSpan={2} className="hidden sm:table-cell py-3 px-4"></td>
                    <td className="py-0 sm:py-3 px-0 sm:px-4 text-left sm:text-right text-slate-100">TOTAL:</td>
                    <td className="py-0 sm:py-3 px-0 sm:px-4 text-right text-brand-gold">
                      {invoice.currency} {invoice.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Notes / Terms */}
            {invoice.notes && (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs space-y-1">
                <div className="text-[10px] font-mono tracking-widest uppercase text-brand-gold font-semibold">
                  Notes & Terms
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">{invoice.notes}</p>
              </div>
            )}

            {/* Settlement / Payment Actions */}
            <div className="pt-2 print:hidden">
              {isPaid ? (
                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-emerald-300">
                      Payment Confirmed & Settled
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      Thank you for your transaction with Global Orators Project.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
                    <button
                      onClick={handleDownloadReceipt}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs rounded-xl transition-all shadow-md active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Payment Receipt
                    </button>
                    <button
                      onClick={handleEmailReceipt}
                      disabled={emailSending}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl transition-colors border border-slate-700 disabled:opacity-50 active:scale-95"
                    >
                      {emailSending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold" />
                          <span>Dispatching Receipt...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5 text-brand-gold" />
                          <span>Email Receipt</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs rounded-xl transition-colors border border-slate-800 active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Invoice PDF
                    </button>
                  </div>

                  {emailStatus && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-mono max-w-md mx-auto">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{emailStatus}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 sm:space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 border-b border-slate-800/80 pb-4">
                    <div>
                      <div className="text-[10px] font-mono tracking-widest uppercase text-brand-gold font-semibold">
                        Online Settlement
                      </div>
                      <h3 className="font-serif font-bold text-base text-slate-100 mt-0.5">
                        Settle Invoice Online
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Instant secure checkout supporting Safaricom M-Pesa, Card, and Mobile Money.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>256-Bit Encrypted</span>
                    </div>
                  </div>

                  {payError && (
                    <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-mono">
                      {payError}
                    </div>
                  )}

                  {payStep === 'waiting' ? (
                    <div className="p-6 text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
                      <div className="font-mono text-xs text-slate-200 font-bold">
                        Awaiting Payment Confirmation...
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Please complete payment on the checkout window. This page will automatically update once verified.
                      </p>
                    </div>
                  ) : invoice.total <= 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                      <div className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Zero Balance / Complimentary
                      </div>
                      <p className="text-xs text-slate-400">
                        This invoice has a balance of {invoice.currency} 0. No online transaction is required.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={handlePay}
                        disabled={payStep === 'sending'}
                        className="w-full px-6 py-3.5 bg-[#C89630] hover:bg-[#D9A741] text-on-gold font-serif font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2 active:scale-95"
                      >
                        {payStep === 'sending' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Connecting to Secure Checkout...</span>
                          </>
                        ) : (
                          <>
                            <span>Proceed to Secure Checkout — {invoice.currency} {invoice.total.toLocaleString()}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center font-mono text-[10px] text-slate-500 pt-2">
          {GOP_BILLING_CONFIG.name} · {GOP_BILLING_CONFIG.email}
        </div>
      </div>
    </div>
  );
};
