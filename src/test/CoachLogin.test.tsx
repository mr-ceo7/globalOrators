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
    checkEmail: vi.fn(),
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

  test('renders Coach App email-first portal without Sign In / Create Account tabs', () => {
    render(
      <AppProvider>
        <CoachLoginPortal />
      </AppProvider>
    );

    expect(screen.getByText(/Welcome, Coach/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Coach App/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Coach Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();

    // Verify tabs are NOT present
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Sign In$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Create Account$/i })).not.toBeInTheDocument();
  });

  test('checks existing email and transitions to password sign-in', async () => {
    (authApi.checkEmail as any).mockResolvedValueOnce({
      email: 'coach@globalorators.com',
      exists: true,
      auth_method: 'password',
      role: 'coach'
    });

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

    fireEvent.change(screen.getByLabelText(/Coach Email/i), {
      target: { value: 'coach@globalorators.com' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(authApi.checkEmail).toHaveBeenCalledWith('coach@globalorators.com');
      expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In to Coach App/i })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'CoachSecurePassword123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In to Coach App/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('coach@globalorators.com', 'CoachSecurePassword123');
    });
  });

  test('checks new email and transitions directly to create account form', async () => {
    (authApi.checkEmail as any).mockResolvedValueOnce({
      email: 'newcoach@globalorators.com',
      exists: false,
      auth_method: 'none',
      role: null
    });

    (authApi.register as any).mockResolvedValueOnce({
      access_token: 'new-coach-token',
      token_type: 'bearer',
      user: {
        id: 'coach-2',
        email: 'newcoach@globalorators.com',
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

    fireEvent.change(screen.getByLabelText(/Coach Email/i), {
      target: { value: 'newcoach@globalorators.com' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(authApi.checkEmail).toHaveBeenCalledWith('newcoach@globalorators.com');
      expect(screen.getByRole('heading', { name: /Create Coach Account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name & Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Coach Account/i })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Full Name & Title/i), {
      target: { value: 'Dr. Evelyn Reed' }
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'FacultyMasterKey123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Coach Account/i }));

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        email: 'newcoach@globalorators.com',
        password: 'FacultyMasterKey123',
        full_name: 'Dr. Evelyn Reed',
        role: 'coach',
        coach_invite_code: 'FACULTY-INVITE-2026'
      });
    });
  });

  test('checks Google-registered email and prompts to sign in with Google to prevent duplicate accounts', async () => {
    (authApi.checkEmail as any).mockResolvedValueOnce({
      email: 'googlecoach@globalorators.com',
      exists: true,
      auth_method: 'google',
      role: 'coach'
    });

    render(
      <AppProvider>
        <CoachLoginPortal />
      </AppProvider>
    );

    fireEvent.change(screen.getByLabelText(/Coach Email/i), {
      target: { value: 'googlecoach@globalorators.com' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(authApi.checkEmail).toHaveBeenCalledWith('googlecoach@globalorators.com');
      expect(screen.getByText(/Google Sign-In Account Found/i)).toBeInTheDocument();
      expect(screen.getByText(/You previously accessed Global Orators using Google with this email/i)).toBeInTheDocument();
    });
  });

  test('displays error alert when coach authentication fails', async () => {
    (authApi.checkEmail as any).mockResolvedValueOnce({
      email: 'coach@globalorators.com',
      exists: true,
      auth_method: 'password',
      role: 'coach'
    });

    (authApi.login as any).mockRejectedValueOnce({
      response: { data: { detail: 'Invalid email or password' } }
    });

    render(
      <AppProvider>
        <CoachLoginPortal />
      </AppProvider>
    );

    fireEvent.change(screen.getByLabelText(/Coach Email/i), {
      target: { value: 'coach@globalorators.com' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In to Coach App/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });
});
