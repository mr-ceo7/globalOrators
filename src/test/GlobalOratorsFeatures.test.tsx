import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import { LandingPage } from '../components/landing/LandingPage';
import { ClientPortal } from '../components/clientApp/ClientPortal';
import { SubdomainSwitcher } from '../components/common/SubdomainSwitcher';

vi.mock('../services/apiClient', () => ({
  authApi: { me: vi.fn().mockResolvedValue({ email: 'coach@globalorators.com' }) },
  clientsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  exercisesApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  programsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  workoutsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  metricsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  prsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  habitsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  photosApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  messagesApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  activityApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  inquiriesApi: {
    submit: vi.fn().mockResolvedValue({
      status: 'success',
      inquiryId: 'GOP-INQ-TEST-001',
      organization: 'Strathmore University',
      branch: 'Academy',
      receivedAt: '2026-09-10T12:00:00Z',
      message: 'Inquiry received. Our partnerships director will review and respond within 24 hours.'
    }),
    list: vi.fn().mockResolvedValue([])
  },
}));

describe('Global Orators Landing Page & Features Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should render GOP umbrella title, tagline, and both functional branches on Landing Page', () => {
    render(
      <AppProvider>
        <LandingPage />
      </AppProvider>
    );

    // Verify brand and lead headline
    expect(screen.getByText('speak with impact')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Words Shape Nations/i })).toBeInTheDocument();

    // Verify both missions
    expect(screen.getByText(/Deconditioning & Pan-African Enlightenment/i)).toBeInTheDocument();
    expect(screen.getByText(/Speaking as a Form of Escapism & Catharsis/i)).toBeInTheDocument();

    // Verify both functional branches
    expect(screen.getAllByText('Global Orators Academy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Global Orators Foundation').length).toBeGreaterThan(0);

    // Verify tournament achievements
    expect(screen.getByText('World Universities Debating Championship')).toBeInTheDocument();
    expect(screen.getByText('Pan-African Universities Debating Championship')).toBeInTheDocument();
  }, 15000);

  test('should render SubdomainSwitcher with globalorators.com, app, and coach domains', () => {
    render(
      <AppProvider>
        <SubdomainSwitcher />
      </AppProvider>
    );

    expect(screen.getAllByText('globalorators.com').length).toBeGreaterThan(0);
    expect(screen.getByText('app.globalorators.com')).toBeInTheDocument();
    expect(screen.getByText('coach.globalorators.com')).toBeInTheDocument();
  });

  test('should render Client-Side Speaker App with drill studio, catharsis vault, and habit tracking', () => {
    render(
      <AppProvider>
        <ClientPortal />
      </AppProvider>
    );

    // Check tabs in client portal
    expect(screen.getByText('Daily Drill Studio')).toBeInTheDocument();
    expect(screen.getByText('Catharsis & Voice Vault')).toBeInTheDocument();
    expect(screen.getByText('Daily Orator Rituals')).toBeInTheDocument();
    expect(screen.getByText('Coach Qassim (2-Way)')).toBeInTheDocument();

    // Switch to Catharsis tab
    const catharsisTab = screen.getByText('Catharsis & Voice Vault');
    fireEvent.click(catharsisTab);

    expect(screen.getByText(/Private & Encrypted Expression Vault/i)).toBeInTheDocument();
  });

  test('should allow toggling theme on LandingPage between light and dark modes', async () => {
    render(
      <AppProvider>
        <LandingPage />
      </AppProvider>
    );

    const themeToggleBtn = document.getElementById('landing-theme-toggle');
    expect(themeToggleBtn).toBeInTheDocument();

    // Default theme is light
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click to toggle to dark
    await act(async () => {
      fireEvent.click(themeToggleBtn!);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Click to toggle back to light
    await act(async () => {
      fireEvent.click(themeToggleBtn!);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('should render audience-specific CTAs, value proposition, process steps, and interactive voice dispatch on LandingPage', async () => {
    render(
      <AppProvider>
        <LandingPage />
      </AppProvider>
    );

    // Verify clear one-sentence value proposition
    expect(screen.getByText(/Debate training, sovereign leadership development, and healing-centered voice programs for African youth/i)).toBeInTheDocument();

    // Verify Audience Chooser fast-track section and 4-stage methodology
    expect(screen.getByText('Choose Your Path')).toBeInTheDocument();
    expect(screen.getByText('How The Program Operates')).toBeInTheDocument();

    // Verify audience-specific direct action CTAs (replaces generic 'Take the Floor')
    expect(screen.getAllByText('Apply to Academy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Apply for Fellowship').length).toBeGreaterThan(0);

    // Verify Debated Motions section
    expect(screen.getByText('Sovereignty Defended On The Floor')).toBeInTheDocument();
    expect(screen.getByText(/Condition All Foreign Mineral Concessions/i)).toBeInTheDocument();
    expect(screen.getByText(/Repudiate Odious Historical Debts/i)).toBeInTheDocument();

    // Verify Voice Dispatch audio player
    expect(screen.getByText(/Voice Dispatch • Circle 07/i)).toBeInTheDocument();
    const playBtn = screen.getByLabelText('Play voice dispatch');
    expect(playBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(playBtn);
    });

    expect(screen.getByLabelText('Pause voice dispatch')).toBeInTheDocument();
    expect(screen.getByText(/0:24 \/ 1:18/)).toBeInTheDocument();
  });

  test('should open partner modal and submit partnership inquiry with confirmation reference number', async () => {
    render(
      <AppProvider>
        <LandingPage />
      </AppProvider>
    );

    // Click "Inquire for School Partnership"
    const partnerBtn = screen.getByRole('button', { name: /Inquire for School Partnership/i });
    expect(partnerBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(partnerBtn);
    });

    // Verify dialog opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Partner with Global Orators Academy')).toBeInTheDocument();

    // Fill form fields
    const orgInput = screen.getByLabelText(/Organization/i);
    const emailInput = screen.getByLabelText(/Contact Email/i);

    fireEvent.change(orgInput, { target: { value: 'Strathmore University' } });
    fireEvent.change(emailInput, { target: { value: 'dean@strathmore.edu' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Submit Inquiry/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Verify success confirmation with reference ID
    expect(await screen.findByText('Inquiry Successfully Logged')).toBeInTheDocument();
    expect(screen.getByText('GOP-INQ-TEST-001')).toBeInTheDocument();
  });

  test('should open and close mobile navigation drawer with standard nav links on LandingPage', async () => {
    render(
      <AppProvider>
        <LandingPage />
      </AppProvider>
    );

    const mobileToggleBtn = document.getElementById('mobile-toc-toggle');
    expect(mobileToggleBtn).toBeInTheDocument();

    // Verify desktop standard nav has Home, About, Academy
    expect(screen.getAllByRole('button', { name: 'Home' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'About' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Academy' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Foundation' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Escapism' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Tournaments' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Testimonials' }).length).toBeGreaterThan(0);

    // Open mobile drawer
    await act(async () => {
      fireEvent.click(mobileToggleBtn!);
    });

    // Check that standard nav buttons/links are rendered in mobile drawer
    expect(screen.getAllByRole('button', { name: 'Home' }).length).toBeGreaterThan(1);
    expect(screen.getAllByRole('link', { name: 'About' }).length).toBeGreaterThan(1);
    expect(screen.getAllByRole('link', { name: 'Academy' }).length).toBeGreaterThan(1);
    expect(screen.getAllByRole('link', { name: 'Foundation' }).length).toBeGreaterThan(1);

    // Close drawer
    await act(async () => {
      fireEvent.click(mobileToggleBtn!);
    });
  });
});
