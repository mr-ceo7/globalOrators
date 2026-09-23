import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import { CoachManager } from '../components/coaches/CoachManager';

vi.mock('../services/apiClient', () => ({
  clearAuthSession: vi.fn(),
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    googleAuth: vi.fn(),
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    me: vi.fn().mockResolvedValue({ id: 'coach-1', email: 'coach@globalorators.com', role: 'coach', is_head_coach: true })
  },
  clientsApi: {
    list: vi.fn().mockResolvedValue([
      {
        id: 'client-1',
        name: 'Kofi Mensah',
        email: 'kofi@example.com',
        phone: '+254700000001',
        avatar: '',
        status: 'active',
        programId: 'prog-1',
        coachId: 'coach-1',
        tier: 'executive',
        goal: 'Keynote Mastery',
        createdAt: '2026-01-01T00:00:00Z',
        startDate: '2026-01-01',
        streakDays: 5,
        totalWorkouts: 12,
        metrics: { baselineWpm: 140, currentWpm: 155, fillerWordsPerMin: 1.2, clarityScore: 92 },
        program: { id: 'prog-1', name: 'Executive Track', weeks: 8, currentWeek: 3 },
        upcomingSession: '2026-09-20'
      },
      {
        id: 'client-2',
        name: 'Amina Diallo',
        email: 'amina@example.com',
        phone: '+254700000002',
        avatar: '',
        status: 'active',
        programId: 'prog-2',
        coachId: '', // unassigned!
        tier: 'foundation',
        goal: 'Debate Delivery',
        createdAt: '2026-01-02T00:00:00Z',
        startDate: '2026-01-02',
        streakDays: 2,
        totalWorkouts: 4,
        metrics: { baselineWpm: 130, currentWpm: 142, fillerWordsPerMin: 2.1, clarityScore: 86 },
        program: { id: 'prog-2', name: 'Debate Track', weeks: 6, currentWeek: 1 },
        upcomingSession: '2026-09-22'
      }
    ]),
    getAll: vi.fn().mockResolvedValue([
      {
        id: 'client-1',
        name: 'Kofi Mensah',
        email: 'kofi@example.com',
        phone: '+254700000001',
        avatar: '',
        status: 'active',
        programId: 'prog-1',
        coachId: 'coach-1',
        tier: 'executive',
        goal: 'Keynote Mastery',
        createdAt: '2026-01-01T00:00:00Z',
        startDate: '2026-01-01',
        streakDays: 5,
        totalWorkouts: 12,
        metrics: { baselineWpm: 140, currentWpm: 155, fillerWordsPerMin: 1.2, clarityScore: 92 },
        program: { id: 'prog-1', name: 'Executive Track', weeks: 8, currentWeek: 3 },
        upcomingSession: '2026-09-20'
      },
      {
        id: 'client-2',
        name: 'Amina Diallo',
        email: 'amina@example.com',
        phone: '+254700000002',
        avatar: '',
        status: 'active',
        programId: 'prog-2',
        coachId: '', // unassigned!
        tier: 'foundation',
        goal: 'Debate Delivery',
        createdAt: '2026-01-02T00:00:00Z',
        startDate: '2026-01-02',
        streakDays: 2,
        totalWorkouts: 4,
        metrics: { baselineWpm: 130, currentWpm: 142, fillerWordsPerMin: 2.1, clarityScore: 86 },
        program: { id: 'prog-2', name: 'Debate Track', weeks: 6, currentWeek: 1 },
        upcomingSession: '2026-09-22'
      }
    ]),
    getMe: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
    reassignCoach: vi.fn().mockImplementation((clientId, coachId, reason) => Promise.resolve({
      id: clientId,
      name: 'Amina Diallo',
      email: 'amina@example.com',
      coachId,
      status: 'active'
    }))
  },
  coachesApi: {
    getAll: vi.fn().mockResolvedValue([
      {
        id: 'coach-1',
        name: 'Dr. Arthur Vance',
        email: 'arthur.vance@globalorators.com',
        avatar: '',
        specialty: 'Executive Forensics',
        assignedSpeakersCount: 1
      },
      {
        id: 'coach-2',
        name: 'Sarah Chen',
        email: 'sarah.chen@globalorators.com',
        avatar: '',
        specialty: 'Debate & Persuasion',
        assignedSpeakersCount: 0
      }
    ]),
    create: vi.fn().mockResolvedValue({
      id: 'coach-3',
      name: 'Evelyn Reed',
      email: 'evelyn.reed@globalorators.com',
      avatar: '',
      specialty: 'Vocal Presence',
      assignedSpeakersCount: 0
    })
  },
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

import { coachesApi, clientsApi } from '../services/apiClient';

describe('CoachManager Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('globalorators_token', 'mock-coach-token');
    localStorage.setItem('globalorators_user', JSON.stringify({
      id: 'coach-1',
      is_head_coach: true, // computed by the backend on every user object
      email: 'coach@globalorators.com',
      role: 'coach',
      full_name: 'Arthur Vance'
    }));
    vi.clearAllMocks();
  });

  test('renders Master Coach administration header and metrics', async () => {
    render(
      <AppProvider>
        <CoachManager />
      </AppProvider>
    );

    expect(screen.getByText('Master Coach Administration')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Faculty Coaches & Speaker Allocation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Faculty Coach/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Active Coaches')).toBeInTheDocument();
      expect(screen.getByText('Assigned Speakers')).toBeInTheDocument();
      expect(screen.getByText('Unassigned Intake')).toBeInTheDocument();
    });
  });

  test('displays unassigned speakers triage pool and assigns to coach', async () => {
    render(
      <AppProvider>
        <CoachManager />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Amina Diallo')).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/Assign coach to speaker Amina Diallo/i);
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'coach-2' } });

    await waitFor(() => {
      expect(clientsApi.reassignCoach).toHaveBeenCalledWith('client-2', 'coach-2', expect.any(String));
    });
  });

  test('opens Add Faculty Coach modal and creates a new coach account', async () => {
    render(
      <AppProvider>
        <CoachManager />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Add Faculty Coach/i }));

    expect(screen.getByRole('heading', { name: /Add Faculty Coach/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name & Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Faculty Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Initial Password/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Full Name & Title/i), {
      target: { value: 'Evelyn Reed' }
    });
    fireEvent.change(screen.getByLabelText(/Faculty Email Address/i), {
      target: { value: 'evelyn.reed@globalorators.com' }
    });
    fireEvent.change(screen.getByLabelText(/Initial Password/i), {
      target: { value: 'CoachPassword2026' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Provision Coach/i }));

    await waitFor(() => {
      expect(coachesApi.create).toHaveBeenCalledWith(expect.objectContaining({
        fullName: 'Evelyn Reed',
        email: 'evelyn.reed@globalorators.com',
        password: 'CoachPassword2026'
      }));
    });
  });
});
