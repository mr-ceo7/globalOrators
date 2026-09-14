import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import { CoachLoginPortal } from '../components/auth/CoachLoginPortal';

vi.mock('../services/apiClient', () => ({
  clearAuthSession: vi.fn(),
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    googleAuth: vi.fn(),
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    me: vi.fn().mockResolvedValue({ email: 'coach@globalorators.com', role: 'coach' })
  },
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
  coachesApi: { getAll: vi.fn().mockResolvedValue([]) },
}));

import { authApi } from '../services/apiClient';

describe('CoachLoginPortal Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('renders Coach Operating System sign-in portal with commanding typography and form controls', () => {
    render(
      <AppProvider>
        <CoachLoginPortal />
      </AppProvider>
    );

    expect(screen.getByText(/Accredited Coach Access/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Coach Operating System/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Faculty Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Account Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enter Coach Operating System/i })).toBeInTheDocument();
  });

  test('submits valid credentials and successfully authenticates coach', async () => {
    (authApi.login as any).mockResolvedValueOnce({
      access_token: 'valid-coach-token',
      token_type: 'bearer',
      user: {
        id: 'coach-1',
        email: 'coach@globalorators.com',
        full_name: 'Arthur Vance',
        role: 'coach',
        avatar: '',
        is_active: true
      }
    });

    render(
      <AppProvider>
        <CoachLoginPortal />
      </AppProvider>
    );

    fireEvent.change(screen.getByLabelText(/Faculty Email/i), {
      target: { value: 'coach@globalorators.com' }
    });
    fireEvent.change(screen.getByLabelText(/Account Password/i), {
      target: { value: 'CoachSecurePassword123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Enter Coach Operating System/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('coach@globalorators.com', 'CoachSecurePassword123');
    });
  });

  test('displays error alert when coach authentication fails', async () => {
    (authApi.login as any).mockRejectedValueOnce({
      response: { data: { detail: 'Invalid email or password' } }
    });

    render(
      <AppProvider>
        <CoachLoginPortal />
      </AppProvider>
    );

    fireEvent.change(screen.getByLabelText(/Faculty Email/i), {
      target: { value: 'wrong@globalorators.com' }
    });
    fireEvent.change(screen.getByLabelText(/Account Password/i), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Enter Coach Operating System/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  test('switches to Accreditation registration mode and renders invite code field', async () => {
    render(
      <AppProvider>
        <CoachLoginPortal />
      </AppProvider>
    );

    const accreditationTab = screen.getByRole('button', { name: /Accreditation/i });
    fireEvent.click(accreditationTab);

    expect(screen.getByLabelText(/Full Name & Credentials/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Faculty Invite Code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Provision Coach Account/i })).toBeInTheDocument();
  });

  test('submits coach registration with invite code', async () => {
    (authApi.register as any).mockResolvedValueOnce({
      access_token: 'new-coach-token',
      token_type: 'bearer',
      user: {
        id: 'coach-2',
        email: 'faculty@globalorators.com',
        full_name: 'Dr. Evelyn Reed',
        role: 'coach',
        avatar: '',
        is_active: true
      }
    });

    render(
      <AppProvider>
        <CoachLoginPortal />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Accreditation/i }));

    fireEvent.change(screen.getByLabelText(/Full Name & Credentials/i), {
      target: { value: 'Dr. Evelyn Reed' }
    });
    fireEvent.change(screen.getByLabelText(/Faculty Email/i), {
      target: { value: 'faculty@globalorators.com' }
    });
    fireEvent.change(screen.getByLabelText(/Master Password/i), {
      target: { value: 'FacultyMasterKey123' }
    });
    fireEvent.change(screen.getByLabelText(/Faculty Invite Code/i), {
      target: { value: 'FACULTY-INVITE-2026' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Provision Coach Account/i }));

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        email: 'faculty@globalorators.com',
        password: 'FacultyMasterKey123',
        full_name: 'Dr. Evelyn Reed',
        role: 'coach',
        coach_invite_code: 'FACULTY-INVITE-2026'
      });
    });
  });
});
