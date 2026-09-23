import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Check, 
  Copy, 
  Edit3, 
  Download, 
  Trash2, 
  Sparkles, 
  AlertCircle,
  ExternalLink,
  Receipt,
  X
} from 'lucide-react';
import { 
  listInvoices, 
  createInvoice, 
  updateInvoice, 
  updateInvoiceStatus, 
  generateInvoicePDF,
  draftInvoice,
  Invoice, 
  InvoiceItem 
} from '../../services/invoiceService';
import { GOP_BILLING_CONFIG } from '../../config/company';

export const AdminInvoices: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [tax, setTax] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [editingInvoiceNumber, setEditingInvoiceNumber] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('UNPAID');

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');

  useEffect(() => {
    if (view === 'list') {
      loadInvoices();
    }
  }, [view]);

  const loadInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(err?.message || 'Unable to retrieve invoices from the billing network.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const validItems = items.filter(i => i.description && i.quantity > 0 && i.unitPrice >= 0);
      if (validItems.length === 0) throw new Error('At least one line item is required.');
      if (!clientName.trim()) throw new Error('Client or institution name is required.');

      const result = await createInvoice({
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        items: validItems,
        tax: Number(tax),
        dueDate,
        notes: notes.trim()
      });

      setSuccessBanner(`Invoice ${result.invoiceNumber} registered successfully.`);
      setTimeout(() => setSuccessBanner(''), 5000);

      // Reset form
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
      setTax(0);
      setDueDate('');
      setNotes('');
      setAiPrompt('');
      setView('list');
    } catch (err: any) {
      setError(err.message || 'Failed to issue invoice.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoiceId) return;
    setLoading(true);
    setError('');
    try {
      const validItems = items.filter(i => i.description && i.quantity > 0 && i.unitPrice >= 0);
      if (validItems.length === 0) throw new Error('At least one line item is required.');
      if (!clientName.trim()) throw new Error('Client or institution name is required.');

      await updateInvoice(editingInvoiceId, {
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        items: validItems,
        tax: Number(tax),
        dueDate,
        notes: notes.trim(),
        status: editStatus
      });

      setSuccessBanner(`Invoice ${editingInvoiceNumber} updated.`);
      setTimeout(() => setSuccessBanner(''), 5000);

      setEditingInvoiceId(null);
      setEditingInvoiceNumber('');
      setView('list');
    } catch (err: any) {
      setError(err.message || 'Failed to update invoice.');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id);
    setEditingInvoiceNumber(invoice.invoiceNumber);
    setClientName(invoice.clientName || '');
    setClientEmail(invoice.clientEmail || '');
    setClientPhone(invoice.clientPhone || '');
    setItems(invoice.items && invoice.items.length > 0 ? invoice.items : [{ description: '', quantity: 1, unitPrice: 0 }]);
    setTax(invoice.tax || 0);
    setDueDate(invoice.dueDate || '');
    setNotes(invoice.notes || '');
    setEditStatus(invoice.status || 'UNPAID');
    setError('');
    setView('edit');
  };

  const handleMarkAsPaid = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      await updateInvoiceStatus(id, 'PAID');
      await loadInvoices();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/invoice/${id}`;
    navigator.clipboard.writeText(url);
    setSuccessBanner('Public invoice link copied to clipboard.');
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      setAiFeedback('Please enter natural language details.');
      return;
    }
    setIsGenerating(true);
    setAiFeedback('');

    try {
      // Drafting runs on the Global Orators API so the Gemini key never reaches the browser.
      const parsed = await draftInvoice(aiPrompt);
      if (parsed.clientName) setClientName(parsed.clientName);
      if (parsed.clientEmail) setClientEmail(parsed.clientEmail);
      if (parsed.clientPhone) setClientPhone(parsed.clientPhone);
      if (parsed.items && Array.isArray(parsed.items)) setItems(parsed.items);
      if (parsed.tax !== undefined) setTax(parsed.tax);
      if (parsed.dueDate) setDueDate(parsed.dueDate);
      if (parsed.notes) setNotes(parsed.notes);

      setAiFeedback('Invoice form populated. Review line items before saving.');
    } catch (err: any) {
      console.error(err);
      setAiFeedback(err?.message || 'Could not parse natural language prompt. Please specify details clearly.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalAmount = subtotal + Number(tax || 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-[10px] font-mono tracking-widest uppercase text-[#C89630] font-semibold mb-1">
            Global Orators · Financial Dispatch
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-slate-100">
            Invoicing & Billing Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Issue forensic coaching retainers, tournament fees, and institutional speech invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
              view === 'list' 
                ? 'bg-slate-800 text-slate-100 border border-slate-700' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Invoice Registry
          </button>
          <button
            onClick={() => {
              setEditingInvoiceId(null);
              setEditingInvoiceNumber('');
              setView('create');
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
              view === 'create'
                ? 'bg-[#C89630] text-slate-950 shadow-[#C89630]/20'
                : 'bg-slate-900 border border-[#C89630]/40 text-[#C89630] hover:bg-[#C89630]/10'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Issue Invoice
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successBanner && (
        <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-xs font-mono flex items-center gap-2.5">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/60 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-xs font-mono flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 text-center text-slate-400 font-mono text-xs">
              Synchronizing invoice ledger...
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-slate-200">No Invoices on Record</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active billing records found under Global Orators. Click 'Issue Invoice' above to draft your first invoice.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono tracking-wider uppercase text-slate-400">
                    <th className="py-3.5 px-5 font-semibold">Invoice #</th>
                    <th className="py-3.5 px-5 font-semibold">Client / Organization</th>
                    <th className="py-3.5 px-5 font-semibold">Status</th>
                    <th className="py-3.5 px-5 font-semibold text-right">Amount ({GOP_BILLING_CONFIG.currency})</th>
                    <th className="py-3.5 px-5 font-semibold">Date Issued</th>
                    <th className="py-3.5 px-5 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-[#C89630]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-100">{inv.clientName || 'N/A'}</div>
                        {inv.clientEmail && <div className="text-[11px] text-slate-400 font-mono">{inv.clientEmail}</div>}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold rounded-md border ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : inv.status === 'OVERDUE'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-mono font-bold text-slate-100">
                        {inv.currency} {inv.total.toLocaleString()}
                      </td>
                      <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => copyLink(inv.id)}
                            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Copy Public Link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => generateInvoicePDF(inv)}
                            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => startEditing(inv)}
                            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {inv.status !== 'PAID' && (
                            <button
                              onClick={() => handleMarkAsPaid(inv.id)}
                              className="px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-mono font-bold transition-colors inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE VIEW */}
      {view === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Drafting Assistant */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-slate-200 font-serif font-bold text-base">
                <Sparkles className="w-4 h-4 text-[#C89630]" />
                <span>AI Drafting Assistant</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe the client, cohort, or tournament items in natural language to quickly populate the invoice.
              </p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Issue invoice for Strathmore Debate Club (debate@strathmore.edu). 3 debate coaches for 2 weekends at 15000 KES each. Due next Friday."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#C89630] h-28 resize-none"
              />
              <button
                type="button"
                onClick={generateWithAI}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-[#C89630]/30 text-[#C89630] font-mono text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Analyzing prompt...' : 'Populate Invoice Form'}
              </button>
              {aiFeedback && (
                <div className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {aiFeedback}
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                  Prefix: {GOP_BILLING_CONFIG.invoicePrefix}
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-100">
                  Draft New Invoice
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                    Client / Organization <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Alliance High School Forensics"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#C89630]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="e.g. forensics@institution.org"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#C89630]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                    Client Phone (M-Pesa)
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#C89630]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#C89630] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-slate-100">Itemized Deliverables</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs font-mono font-bold text-[#C89630] hover:text-[#D9A741] inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder="Description (e.g. Forensics Masterclass Session)"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-[#C89630]"
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-md px-2 py-1.5 text-xs text-center text-slate-100 focus:outline-none focus:border-[#C89630]"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          min="0"
                          required
                          placeholder="Unit KES"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-right text-slate-100 focus:outline-none focus:border-[#C89630]"
                        />
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                    Notes & Terms
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Thank you for supporting Global Orators. Payment terms: due upon presentation."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#C89630] resize-none"
                  />
                </div>
                <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col justify-end space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Subtotal:</span>
                    <span>KES {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono border-b border-slate-800 pb-2">
                    <span>Tax (KES):</span>
                    <input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                      className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-right text-xs text-slate-100 focus:outline-none focus:border-[#C89630]"
                    />
                  </div>
                  <div className="flex justify-between items-center font-mono font-bold text-sm text-slate-100 pt-1">
                    <span>Total:</span>
                    <span className="text-[#C89630]">KES {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#C89630] hover:bg-[#D9A741] text-slate-950 font-serif font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Registering Invoice...' : 'Generate & Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VIEW */}
      {view === 'edit' && (
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleEdit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                  Editing Record
                </div>
                <h3 className="font-serif font-bold text-xl text-slate-100">
                  Invoice {editingInvoiceNumber}
                </h3>
              </div>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-[#C89630]"
              >
                <option value="UNPAID">UNPAID</option>
                <option value="PAID">PAID</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Client / Organization <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#C89630]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#C89630]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Client Phone
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#C89630]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#C89630] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-slate-100">Itemized Deliverables</h4>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-xs font-mono font-bold text-[#C89630] hover:text-[#D9A741] inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Line
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-[#C89630]"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-2 py-1.5 text-xs text-center text-slate-100 focus:outline-none focus:border-[#C89630]"
                      />
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        min="0"
                        required
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-right text-slate-100 focus:outline-none focus:border-[#C89630]"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Subtotal & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Notes & Terms
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-[#C89630] resize-none"
                />
              </div>
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col justify-end space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Subtotal:</span>
                  <span>KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 font-mono border-b border-slate-800 pb-2">
                  <span>Tax (KES):</span>
                  <input
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-right text-xs text-slate-100 focus:outline-none focus:border-[#C89630]"
                  />
                </div>
                <div className="flex justify-between items-center font-mono font-bold text-sm text-slate-100 pt-1">
                  <span>Total:</span>
                  <span className="text-[#C89630]">KES {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-[#C89630] hover:bg-[#D9A741] text-slate-950 font-serif font-bold text-sm rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Modifications'}
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
