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

    // Verify brand and tagline
    expect(screen.getByText('speak with impact')).toBeInTheDocument();
    expect(screen.getByText(/The Pan-African Voice & Catharsis Movement/i)).toBeInTheDocument();

    // Verify both missions
    expect(screen.getByText(/Deconditioning & Pan-African Enlightenment/i)).toBeInTheDocument();
    expect(screen.getByText(/Speaking as a Form of Escapism & Catharsis/i)).toBeInTheDocument();

    // Verify both functional branches
    expect(screen.getAllByText('Global Orators Academy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Global Orators Foundation').length).toBeGreaterThan(0);

    // Verify tournament achievements
    expect(screen.getByText('World Universities Debating Championship')).toBeInTheDocument();
    expect(screen.getByText('Pan-African Universities Debating Championship')).toBeInTheDocument();
  });

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
});
