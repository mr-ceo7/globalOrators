import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import { ClientRoster } from '../components/clients/ClientRoster';

vi.mock('../services/apiClient', () => ({
  clearAuthSession: vi.fn(),
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    googleAuth: vi.fn(),
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    me: vi.fn().mockResolvedValue({ email: 'kassimmusa322@gmail.com', role: 'coach' })
  },
  clientsApi: {
    list: vi.fn().mockResolvedValue([
      {
        id: 'client-1',
        name: 'Geoffrey Anyona',
        email: 'anyonageoffrey49@gmail.com',
        phone: '+254700000001',
        avatar: '',
        status: 'Active',
        programId: 'prog-1',
        coachId: '', // Unassigned speaker!
        tier: 'executive',
        goal: 'Executive & Board Pitching',
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
        name: 'Dr. Arthur Vance',
        email: 'executive.speaker@globalorators.org',
        phone: '+254700000002',
        avatar: '',
        status: 'Pending Onboarding',
        programId: '',
        coachId: '', // Unassigned speaker!
        tier: 'foundation',
        goal: '', // Empty goal before completing onboarding!
        createdAt: '2026-01-02T00:00:00Z',
        startDate: '2026-01-02',
        streakDays: 0,
        totalWorkouts: 0,
        metrics: { baselineWpm: 130, currentWpm: 130, fillerWordsPerMin: 0, clarityScore: 100 },
        program: null,
        upcomingSession: ''
      }
    ]),
    getAll: vi.fn().mockResolvedValue([
      {
        id: 'client-1',
        name: 'Geoffrey Anyona',
        email: 'anyonageoffrey49@gmail.com',
        phone: '+254700000001',
        avatar: '',
        status: 'Active',
        programId: 'prog-1',
        coachId: '',
        tier: 'executive',
        goal: 'Executive & Board Pitching',
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
        name: 'Dr. Arthur Vance',
        email: 'executive.speaker@globalorators.org',
        phone: '+254700000002',
        avatar: '',
        status: 'Pending Onboarding',
        programId: '',
        coachId: '',
        tier: 'foundation',
        goal: '',
        createdAt: '2026-01-02T00:00:00Z',
        startDate: '2026-01-02',
        streakDays: 0,
        totalWorkouts: 0,
        metrics: { baselineWpm: 130, currentWpm: 130, fillerWordsPerMin: 0, clarityScore: 100 },
        program: null,
        upcomingSession: ''
      }
    ]),
    getMe: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
    reassignCoach: vi.fn().mockImplementation((clientId, coachId, reason) => Promise.resolve({
      id: clientId,
      name: clientId === 'client-1' ? 'Geoffrey Anyona' : 'Dr. Arthur Vance',
      email: clientId === 'client-1' ? 'anyonageoffrey49@gmail.com' : 'executive.speaker@globalorators.org',
      coachId,
      status: 'Active'
    }))
  },
  coachesApi: {
    getAll: vi.fn().mockResolvedValue([
      {
        id: 'coach-1',
        name: 'Head Coach Qassim',
        email: 'kassimmusa322@gmail.com',
        avatar: '',
        specialty: 'Executive Forensics',
        assignedSpeakersCount: 0
      }
    ]),
    create: vi.fn()
  },
  exercisesApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  programsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  workoutsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  metricsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  prsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  habitsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  photosApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  messagesApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  activityApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) }
}));

import { clientsApi } from '../services/apiClient';

describe('ClientRoster UI Optimization and Standout Claim Button', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('globalorators_token', 'mock-coach-token');
    localStorage.setItem('globalorators_user', JSON.stringify({
      id: 'coach-1',
      name: 'Head Coach Qassim',
      email: 'kassimmusa322@gmail.com',
      role: 'coach'
    }));
    vi.clearAllMocks();
  });

  test('renders speaker cards with standout Claim Speaker button and zero status indicator dots', async () => {
    render(
      <AppProvider>
        <ClientRoster
          isAddModalOpen={false}
          onCloseAddModal={vi.fn()}
          onOpenAddModal={vi.fn()}
        />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Geoffrey Anyona')).toBeInTheDocument();
      expect(screen.getByText('Dr. Arthur Vance')).toBeInTheDocument();
    });

    // Zero status indicator dots (Anti-AI Slop rule)
    expect(screen.queryByText(/●/)).not.toBeInTheDocument();

    // Verify standout Claim Speaker buttons are present for both unassigned speakers
    const claimButtons = screen.getAllByRole('button', { name: /Claim Speaker/i });
    expect(claimButtons.length).toBeGreaterThanOrEqual(2);

    // Verify empty goal on Dr. Arthur Vance renders "Pending Intake" instead of blank whitespace
    expect(screen.getByText('Pending Intake')).toBeInTheDocument();

    // Verify Open Pool / Awaiting Coach Allocation banners are rendered
    expect(screen.getAllByText(/Awaiting Coach Allocation/i).length).toBeGreaterThanOrEqual(1);
  });

  test('clicking Claim Speaker executes coach reassignment and claims the speaker to roster', async () => {
    render(
      <AppProvider>
        <ClientRoster
          isAddModalOpen={false}
          onCloseAddModal={vi.fn()}
          onOpenAddModal={vi.fn()}
        />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Geoffrey Anyona')).toBeInTheDocument();
    });

    const claimBtn = document.getElementById('claim-speaker-client-1')!;
    expect(claimBtn).toBeInTheDocument();

    fireEvent.click(claimBtn);

    await waitFor(() => {
      expect(clientsApi.reassignCoach).toHaveBeenCalledWith(
        'client-1',
        'coach-1',
        expect.stringContaining('Claimed by coach')
      );
    });
  });

  test('renders standout Claim button in Table View mode for unassigned speakers and includes Faculty Coach column', async () => {
    render(
      <AppProvider>
        <ClientRoster
          isAddModalOpen={false}
          onCloseAddModal={vi.fn()}
          onOpenAddModal={vi.fn()}
        />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Geoffrey Anyona')).toBeInTheDocument();
    });

    // Switch to table view
    const tableViewBtn = screen.getByTitle('Table View');
    fireEvent.click(tableViewBtn);

    // In table view, prominent Claim button should be visible in the actions column
    await waitFor(() => {
      const claimTableButtons = screen.getAllByRole('button', { name: /Claim/i });
      expect(claimTableButtons.length).toBeGreaterThanOrEqual(2);
      expect(screen.getByRole('columnheader', { name: /Faculty Coach/i })).toBeInTheDocument();
    });
  });

  test('renders sorting controls and allows sorting speakers by name, coach, and status', async () => {
    render(
      <AppProvider>
        <ClientRoster
          isAddModalOpen={false}
          onCloseAddModal={vi.fn()}
          onOpenAddModal={vi.fn()}
        />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Geoffrey Anyona')).toBeInTheDocument();
    });

    // Check sort controls exist
    const sortSelect = document.getElementById('roster-sort-by-select') as HTMLSelectElement;
    expect(sortSelect).toBeInTheDocument();
    expect(sortSelect.value).toBe('name');

    const sortDirBtn = document.getElementById('roster-sort-dir-toggle-btn')!;
    expect(sortDirBtn).toBeInTheDocument();
    expect(sortDirBtn.textContent).toContain('ASC');

    // Toggle sort direction
    fireEvent.click(sortDirBtn);
    expect(sortDirBtn.textContent).toContain('DESC');

    // Change sort field to coach
    fireEvent.change(sortSelect, { target: { value: 'coach' } });
    expect(sortSelect.value).toBe('coach');
  });
});
