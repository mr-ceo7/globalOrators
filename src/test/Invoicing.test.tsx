import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { GOP_BILLING_CONFIG } from '../config/company';
import { createInvoice, listInvoices } from '../services/invoiceService';
import { AdminInvoices } from '../components/invoicing/AdminInvoices';
import { InvoicePage } from '../components/invoicing/InvoicePage';

global.fetch = vi.fn();

describe('GOP Invoicing Module Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('GOP_BILLING_CONFIG is defined with GOP branding and prefix', () => {
    expect(GOP_BILLING_CONFIG.id).toBe('gop');
    expect(GOP_BILLING_CONFIG.invoicePrefix).toBe('GOP');
    expect(GOP_BILLING_CONFIG.name).toContain('Global Orators');
    expect(GOP_BILLING_CONFIG.email).toBe('director@globaloratorsproject.com');
  });

  test('createInvoice goes through the Global Orators API, not the payment backend', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        id: 'inv_test_123',
        invoiceNumber: 'GOP-2026-0001',
        company: 'gop'
      })
    });

    const result = await createInvoice({
      clientName: 'Strathmore Debate Society',
      items: [{ description: 'Debate Coaching', quantity: 2, unitPrice: 5000 }],
      tax: 0
    });

    expect(result.success).toBe(true);
    expect(result.invoiceNumber).toBe('GOP-2026-0001');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as any).mock.calls[0];
    // The company (gop) and its key are applied server-side by the head-coach-only proxy.
    expect(url).toBe('/api/invoices');
    expect(url).not.toContain('onrender.com');
    expect(options.method).toBe('POST');
    const sentBody = JSON.parse(options.body);
    expect(sentBody.company).toBeUndefined();
    expect(sentBody.clientName).toBe('Strathmore Debate Society');
  });

  test('listInvoices calls the Global Orators API', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    await listInvoices();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url] = (global.fetch as any).mock.calls[0];
    expect(url).toBe('/api/invoices');
  });

  test('AdminInvoices renders header and invoice registry', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 'inv_1',
          invoiceNumber: 'GOP-2026-0001',
          clientName: 'Alliance High School',
          items: [{ description: 'Tournament Adjudication', quantity: 1, unitPrice: 10000 }],
          subtotal: 10000,
          tax: 0,
          total: 10000,
          currency: 'KES',
          status: 'UNPAID',
          createdAt: new Date().toISOString()
        }
      ]
    });

    render(<AdminInvoices />);

    expect(screen.getByText('Invoicing & Billing Desk')).toBeInTheDocument();
    expect(screen.getByText('Issue Invoice')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('GOP-2026-0001')).toBeInTheDocument();
      expect(screen.getByText('Alliance High School')).toBeInTheDocument();
    });
  });

  test('InvoicePage renders invoice details and direct settlement block', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'inv_100',
        invoiceNumber: 'GOP-2026-0005',
        clientName: 'Kenya High Debate Club',
        items: [{ description: 'Parliamentary Forensics Masterclass', quantity: 1, unitPrice: 25000 }],
        subtotal: 25000,
        tax: 0,
        total: 25000,
        currency: 'KES',
        status: 'UNPAID',
        createdAt: new Date().toISOString()
      })
    });

    render(<InvoicePage invoiceId="inv_100" />);

    await waitFor(() => {
      expect(screen.getAllByText('GOP-2026-0005')[0]).toBeInTheDocument();
      expect(screen.getByText('Kenya High Debate Club')).toBeInTheDocument();
      expect(screen.getByText('Parliamentary Forensics Masterclass')).toBeInTheDocument();
      expect(screen.getByText(/Proceed to Secure Checkout — KES 25,000/i)).toBeInTheDocument();
    });
  });
});
