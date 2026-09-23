import React, { useState, useEffect } from 'react';
import { 
  fetchInvoice, 
  payInvoice, 
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
  Phone, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const PAYMENT_BACKEND_URL = import.meta.env.VITE_PAYMENT_BACKEND_URL || 'https://payment-backend-0eo0.onrender.com';

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
  const [phone, setPhone] = useState('0700000000');
  const [payStep, setPayStep] = useState<'idle' | 'input' | 'sending' | 'waiting' | 'paid'>('idle');
  const [payError, setPayError] = useState('');
  const [transactionId, setTransactionId] = useState('');

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
        if (inv.clientPhone) {
          setPhone(inv.clientPhone);
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
        const res = await fetch(`${PAYMENT_BACKEND_URL}/api/transaction-status/${transactionId}`);
        const data = await res.json();
        if (data.status === 'COMPLETED') {
          setPayStep('paid');
          setInvoice(prev => prev ? { ...prev, status: 'PAID', paidAt: new Date().toISOString() } : prev);
          clearInterval(interval);
        } else if (data.status === 'FAILED') {
          setPayError('Payment was not completed. Please try again.');
          setPayStep('input');
          clearInterval(interval);
        }
      } catch {
        // Keep polling
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [payStep, transactionId]);

  const handlePay = async () => {
    if (!phone.trim() || !invoice) return;
    setPayStep('sending');
    setPayError('');
    try {
      const result = await payInvoice(invoice.id, phone.trim());
      const txn = result.transactionId || result.reference;

      if (!txn) {
        throw new Error('Payment server did not return a transaction identifier.');
      }

      // Check if redirect payment gateway is provided
      if (result.access_code) {
        const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_3b090dc14ceb6fe8e611f786e42a26152f59e241';
        const redirectUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}?success_txn=${txn}`);
        const amountCents = Math.round(invoice.total * 100);
        const cleanPhone = phone.replace(/[^0-9]/g, '');
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
      setPayStep('input');
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
      paymentMethod: 'M-Pesa Direct Settlement',
      phone: invoice.clientPhone || phone || 'N/A'
    });
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#C89630] animate-spin mx-auto" />
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 print:bg-white print:text-slate-900 print:py-0">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Actions (Print & Download) */}
        <div className="flex items-center justify-between text-xs font-mono print:hidden">
          <div className="text-slate-400">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C89630]/30 bg-slate-900 text-[#C89630] hover:bg-[#C89630]/10 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl print:border-none print:shadow-none">
          {/* Branded Banner */}
          <div className="p-6 sm:p-8 bg-slate-950 border-b-2 border-[#C89630] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={GOP_BILLING_CONFIG.logoUrl}
                alt="Global Orators"
                className="w-12 h-12 rounded-lg object-contain bg-slate-900 p-1 border border-slate-800"
              />
              <div>
                <h1 className="font-serif font-black text-lg sm:text-xl text-slate-100 tracking-tight">
                  {GOP_BILLING_CONFIG.name.toUpperCase()}
                </h1>
                <p className="text-xs text-slate-400 font-sans">
                  {GOP_BILLING_CONFIG.tagline}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="font-serif font-bold text-lg text-[#C89630]">INVOICE</div>
              <div className="font-mono text-xs text-slate-400">{invoice.invoiceNumber}</div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <div className="text-[10px] font-mono tracking-widest uppercase text-[#C89630] font-semibold">
                  From (Official Payee)
                </div>
                <div className="font-serif font-bold text-sm text-slate-100">{GOP_BILLING_CONFIG.legalName}</div>
                <div className="text-slate-400 font-mono text-[11px]">Reg: {GOP_BILLING_CONFIG.registrationNumber}</div>
                {GOP_BILLING_CONFIG.addressLines.map((line, idx) => (
                  <div key={idx} className="text-slate-400">{line}</div>
                ))}
                <div className="text-slate-400 font-mono pt-1">{GOP_BILLING_CONFIG.email}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono tracking-widest uppercase text-[#C89630] font-semibold">
                  Billed To
                </div>
                <div className="font-serif font-bold text-sm text-slate-100 whitespace-pre-wrap">
                  {invoice.clientName || 'Client'}
                </div>
                {invoice.clientEmail && (
                  <div className="text-slate-400 font-mono text-[11px] whitespace-pre-wrap">{invoice.clientEmail}</div>
                )}
                {invoice.clientPhone && (
                  <div className="text-slate-400 font-mono text-[11px]">{invoice.clientPhone}</div>
                )}
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-mono tracking-wider uppercase text-slate-400">
                    <th className="text-left py-3 px-4 font-semibold">Description</th>
                    <th className="text-center py-3 px-3 font-semibold w-16">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold sm:w-28">Unit Price</th>
                    <th className="text-right py-3 px-4 font-semibold sm:w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-sans text-slate-100">{item.description}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-300">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {invoice.currency} {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-100">
                        {invoice.currency} {(item.quantity * item.unitPrice).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-950/70 border-t border-slate-800 text-xs font-mono">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-4"></td>
                    <td className="py-2.5 px-4 text-right text-slate-400">Subtotal:</td>
                    <td className="py-2.5 px-4 text-right text-slate-200">
                      {invoice.currency} {invoice.subtotal.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="py-2 px-4"></td>
                    <td className="py-2 px-4 text-right text-slate-400">Tax:</td>
                    <td className="py-2 px-4 text-right text-slate-400">
                      {invoice.tax ? `${invoice.currency} ${invoice.tax.toLocaleString()}` : 'KES 0'}
                    </td>
                  </tr>
                  <tr className="border-t border-slate-800 font-bold text-sm">
                    <td colSpan={2} className="py-3 px-4"></td>
                    <td className="py-3 px-4 text-right text-slate-100">TOTAL:</td>
                    <td className="py-3 px-4 text-right text-[#C89630]">
                      {invoice.currency} {invoice.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Notes / Terms */}
            {invoice.notes && (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs space-y-1">
                <div className="text-[10px] font-mono tracking-widest uppercase text-[#C89630] font-semibold">
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
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleDownloadReceipt}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs rounded-xl transition-all shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Payment Receipt
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl transition-colors border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Invoice PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div>
                    <div className="text-[10px] font-mono tracking-widest uppercase text-[#C89630] font-semibold mb-1">
                      Direct Settlement
                    </div>
                    <h3 className="font-serif font-bold text-base text-slate-100">
                      Settle Invoice via M-Pesa
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enter your Safaricom M-Pesa number below to receive an instant payment prompt.
                    </p>
                  </div>

                  {payError && (
                    <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-mono">
                      {payError}
                    </div>
                  )}

                  {payStep === 'waiting' ? (
                    <div className="p-6 text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[#C89630] animate-spin mx-auto" />
                      <div className="font-mono text-xs text-slate-200 font-bold">
                        Awaiting M-Pesa PIN Confirmation...
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Please check your phone and enter your M-Pesa PIN. This window will automatically verify once complete.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="07XXXXXXXX or 2547XXXXXXXX"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#C89630]"
                        />
                      </div>
                      <button
                        onClick={handlePay}
                        disabled={payStep === 'sending' || !phone.trim()}
                        className="px-6 py-2.5 bg-[#C89630] hover:bg-[#D9A741] text-slate-950 font-serif font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
                      >
                        {payStep === 'sending' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Dispatching STK...
                          </>
                        ) : (
                          `Pay KES ${invoice.total.toLocaleString()} Now`
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
