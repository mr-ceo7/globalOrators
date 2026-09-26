import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import { SpeakerLoginModal } from '../components/landing/SpeakerLoginModal';
import { ClientPortal } from '../components/clientApp/ClientPortal';

vi.mock('../services/apiClient', () => ({
  clearAuthSession: vi.fn().mockImplementation(() => {
    localStorage.removeItem('globalorators_speaker_profile');
    localStorage.removeItem('globalorators_token');
    localStorage.removeItem('globalorators_user');
  }),
  authApi: {
    me: vi.fn().mockResolvedValue({ email: 'coach@globalorators.com' }),
    sendOtp: vi.fn().mockImplementation((email: string) => {
      if (email.includes('unknown@example.com')) {
        return Promise.reject(new Error('No speaker profile found with that email.'));
      }
      return Promise.resolve({ status: 'sent', message: 'Verification code sent.' });
    }),
    verifyOtp: vi.fn().mockImplementation((email: string, code: string) => {
      if (code === '123456') {
        return Promise.resolve({
          access_token: 'mock-jwt-token',
          token_type: 'bearer',
          user: {
            id: 'u-1',
            email: email,
            full_name: 'KASSIM MUSA',
            role: 'speaker'
          }
        });
      }
      return Promise.reject(new Error('Invalid or expired verification passcode.'));
    }),
    verifyMagicLink: vi.fn().mockImplementation((token: string, email?: string) => {
      if (token === 'valid-magic-token') {
        return Promise.resolve({
          access_token: 'mock-jwt-token',
          token_type: 'bearer',
          user: {
            id: 'u-1',
            email: email || 'kassimmusa322@gmail.com',
            full_name: 'KASSIM MUSA',
            role: 'speaker'
          }
        });
      }
      return Promise.reject(new Error('Magic login link has expired or has already been used.'));
    })
  },
  clientsApi: {
    list: vi.fn().mockResolvedValue([
      {
        id: 'client-mock-kassim',
        name: 'KASSIM MUSA',
        email: 'kassimmusa322@gmail.com',
        phone: '+254746957502',
        goal: 'Pan-African Leadership',
        experienceLevel: 'Novice Speaker',
        currentWeightKg: 140,
        onboardingSurvey: {
          branch: 'Academy',
          fullName: 'KASSIM MUSA',
          email: 'kassimmusa322@gmail.com',
          phone: '+254746957502',
          institution: 'Maseno University',
          primaryDiscipline: 'Decolonial Parliamentary Forensics',
          coreFocus: 'Ideological Rigor & Rebuttal Depth',
          missionFocus: 'Pan-African Leadership',
          selectedHabits: [
            'Vocal Hydration (2.5L + Warm Lemon Water)',
            'Decolonial Parliamentary Case Prep (15 Min)'
          ]
        }
      }
    ]),
    getAll: vi.fn().mockImplementation(() => Promise.resolve([
      {
        id: 'client-mock-kassim',
        name: 'KASSIM MUSA',
        email: 'kassimmusa322@gmail.com',
        phone: '+254746957502',
        goal: 'Pan-African Leadership',
        experienceLevel: 'Novice Speaker',
        currentWeightKg: 140,
        onboardingSurvey: {
          branch: 'Academy',
          fullName: 'KASSIM MUSA',
          email: 'kassimmusa322@gmail.com',
          phone: '+254746957502',
          institution: 'Maseno University',
          primaryDiscipline: 'Decolonial Parliamentary Forensics',
          coreFocus: 'Ideological Rigor & Rebuttal Depth',
          missionFocus: 'Pan-African Leadership',
          selectedHabits: [
            'Vocal Hydration (2.5L + Warm Lemon Water)',
            'Decolonial Parliamentary Case Prep (15 Min)'
          ]
        }
      }
    ])),
    create: vi.fn().mockImplementation((c) => Promise.resolve({ ...c, id: c.id || 'client-1' })),
    getMe: vi.fn().mockImplementation(() => {
      return Promise.resolve({
        id: 'client-mock-kassim',
        name: 'KASSIM MUSA',
        email: 'kassimmusa322@gmail.com',
        phone: '+254746957502',
        goal: 'Pan-African Leadership',
        experienceLevel: 'Novice Speaker',
        currentWeightKg: 140,
        onboardingSurvey: {
          branch: 'Academy',
          fullName: 'KASSIM MUSA',
          email: 'kassimmusa322@gmail.com',
          phone: '+254746957502',
          institution: 'Maseno University',
          primaryDiscipline: 'Decolonial Parliamentary Forensics',
          coreFocus: 'Ideological Rigor & Rebuttal Depth',
          missionFocus: 'Pan-African Leadership',
          selectedHabits: [
            'Vocal Hydration (2.5L + Warm Lemon Water)',
            'Decolonial Parliamentary Case Prep (15 Min)'
          ]
        }
      });
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
  inquiriesApi: { submit: vi.fn().mockResolvedValue({ status: 'success' }), list: vi.fn().mockResolvedValue([]) },
  recordingsApi: { getAll: vi.fn().mockResolvedValue([]), upload: vi.fn().mockResolvedValue({}) },
  journalsApi: { getAll: vi.fn().mockResolvedValue([]), create: vi.fn().mockResolvedValue({}) },
  simulationsApi: { getAll: vi.fn().mockResolvedValue([]), create: vi.fn().mockResolvedValue({}) },
  vaultApi: { getJournals: vi.fn().mockResolvedValue([]), getExecSimulations: vi.fn().mockResolvedValue([]) },
  coachesApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  groupsApi: { getAll: vi.fn().mockResolvedValue([]), create: vi.fn(), startCall: vi.fn() },
}));

describe('Speaker Login & Portal Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('should render SpeakerLoginModal and log in with email and OTP passcode', async () => {
    const handleClose = vi.fn();
    render(
      <AppProvider>
        <SpeakerLoginModal isOpen={true} onClose={handleClose} />
      </AppProvider>
    );

    expect(screen.getByRole('heading', { name: 'Orators App' })).toBeInTheDocument();
    expect(screen.getByText('Orators App Re-Entry')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/kassimmusa322@gmail\.com/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'kassimmusa322@gmail.com' } });
    });

    const sendCodeBtn = screen.getByRole('button', { name: /Send Login Passcode/i });
    await act(async () => {
      fireEvent.click(sendCodeBtn);
    });

    // Step 2 should now be visible
    expect(await screen.findByText('Verify Identity')).toBeInTheDocument();
    expect(screen.getByText(/passcode were sent/i)).toBeInTheDocument();

    // Enter 6-digit passcode
    const otpInput = screen.getByPlaceholderText('123456');
    await act(async () => {
      fireEvent.change(otpInput, { target: { value: '123456' } });
    });

    const verifyBtn = screen.getByRole('button', { name: /Enter Orators App/i });
    await act(async () => {
      fireEvent.click(verifyBtn);
    });

    expect(handleClose).toHaveBeenCalled();
    const saved = localStorage.getItem('globalorators_speaker_profile');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved || '{}');
    expect(parsed.fullName).toBe('KASSIM MUSA');
    expect(parsed.missionFocus).toBe('Pan-African Leadership');
  });

  test('should show error when non-existent email is entered', async () => {
    render(
      <AppProvider>
        <SpeakerLoginModal isOpen={true} onClose={vi.fn()} />
      </AppProvider>
    );

    const input = screen.getByPlaceholderText(/kassimmusa322@gmail\.com/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'unknown@example.com' } });
    });

    const sendCodeBtn = screen.getByRole('button', { name: /Send Login Passcode/i });
    await act(async () => {
      fireEvent.click(sendCodeBtn);
    });

    expect(await screen.findByText(/No speaker profile found with that email/i)).toBeInTheDocument();
  });

  test('should show error when invalid OTP code is entered', async () => {
    render(
      <AppProvider>
        <SpeakerLoginModal isOpen={true} onClose={vi.fn()} />
      </AppProvider>
    );

    const input = screen.getByPlaceholderText(/kassimmusa322@gmail\.com/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'kassimmusa322@gmail.com' } });
    });

    const sendCodeBtn = screen.getByRole('button', { name: /Send Login Passcode/i });
    await act(async () => {
      fireEvent.click(sendCodeBtn);
    });

    expect(await screen.findByText('Verify Identity')).toBeInTheDocument();

    const otpInput = screen.getByPlaceholderText('123456');
    await act(async () => {
      fireEvent.change(otpInput, { target: { value: '000000' } });
    });

    const verifyBtn = screen.getByRole('button', { name: /Enter Orators App/i });
    await act(async () => {
      fireEvent.click(verifyBtn);
    });

    expect(await screen.findByText(/Invalid or expired verification passcode/i)).toBeInTheDocument();
  });

  test('should render ClientPortal with dynamic habits and Sign Out button', async () => {
    localStorage.setItem('globalorators_speaker_profile', JSON.stringify({
      branch: 'Academy',
      fullName: 'KASSIM MUSA',
      email: 'kassimmusa322@gmail.com',
      institution: 'Maseno University',
      primaryDiscipline: 'Decolonial Parliamentary Forensics',
      coreFocus: 'Ideological Rigor & Rebuttal Depth',
      missionFocus: 'Pan-African Leadership',
      speakingGoal: 'Pan-African Leadership',
      experienceLevel: 'Novice Speaker',
      vocalBaselinePace: 140,
      emotionalOpennessRating: 8,
      selectedHabits: [
        'Vocal Hydration (2.5L + Warm Lemon Water)',
        'Decolonial Parliamentary Case Prep (15 Min)'
      ]
    }));

    render(
      <AppProvider>
        <ClientPortal />
      </AppProvider>
    );

    expect(screen.getByText('KASSIM MUSA')).toBeInTheDocument();
    expect(screen.getAllByText(/Maseno University/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Awaiting Faculty Curriculum Allocation')).toBeInTheDocument();
    expect(screen.getByText('Awaiting Faculty Allocation')).toBeInTheDocument();
    expect(screen.getByText('Decolonial Parliamentary Forensics')).toBeInTheDocument();
    expect(screen.getByText('Ideological Rigor & Rebuttal Depth')).toBeInTheDocument();
    // Open profile menu to access Sign Out
    const profileBtn = screen.getByRole('button', { name: /Speaker workspace profile and settings menu/i });
    await act(async () => {
      fireEvent.click(profileBtn);
    });
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();

    // Click habits tab
    const habitsTabBtn = screen.getByRole('tab', { name: /Daily Orator Rituals/i });
    await act(async () => {
      fireEvent.click(habitsTabBtn);
    });

    // Verify dynamic habit rendered
    expect(screen.getByText('Decolonial Parliamentary Case Prep (15 Min)')).toBeInTheDocument();

    // Open profile menu if not open and click Sign Out
    let signOutBtn = screen.queryByRole('button', { name: /Sign Out/i });
    if (!signOutBtn) {
      await act(async () => {
        fireEvent.click(profileBtn);
      });
      signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    }
    await act(async () => {
      fireEvent.click(signOutBtn);
    });

    expect(localStorage.getItem('globalorators_speaker_profile')).toBeNull();
  });

  test('should dynamically reconfigure syllabus and drill when speaker has Executive Pitching profile', async () => {
    localStorage.setItem('globalorators_speaker_profile', JSON.stringify({
      branch: 'Academy',
      fullName: 'Amina Kimani',
      email: 'amina@venture.org',
      institution: 'Nairobi Tech Hub',
      primaryDiscipline: 'Executive Investor Pitch',
      coreFocus: 'High-Stakes Persuasion & Presence',
      missionFocus: 'Executive Pitching & High-Stakes Storytelling',
      speakingGoal: 'Executive Pitching',
      experienceLevel: 'Varsity / Advanced',
      vocalBaselinePace: 145,
      emotionalOpennessRating: 7,
      selectedHabits: ['Vocal Hydration (2.5L + Warm Lemon Water)']
    }));

    render(
      <AppProvider>
        <ClientPortal />
      </AppProvider>
    );

    expect(screen.getByText('Amina Kimani')).toBeInTheDocument();
    expect(screen.getAllByText(/Nairobi Tech Hub/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Awaiting Faculty Curriculum Allocation')).toBeInTheDocument();
    expect(screen.getByText('Executive Investor Pitch')).toBeInTheDocument();
    expect(screen.getByText('High-Stakes Persuasion & Presence')).toBeInTheDocument();
    expect(screen.getByText('No Rehearsal Rounds Assigned Yet')).toBeInTheDocument();
    expect(screen.getByText('Curriculum Allocation Pending')).toBeInTheDocument();

    // Switch to Daily Drill Studio tab to verify self-guided impromptu practice
    const drillTabBtn = screen.getByRole('tab', { name: /Daily Drill Studio/i });
    await act(async () => {
      fireEvent.click(drillTabBtn);
    });
    expect(screen.getByText(/Self-Guided Impromptu Practice/i)).toBeInTheDocument();
  });

  test('requires authentication and renders SpeakerLoginPortal when unauthenticated (no guest access)', async () => {
    // Ensure no active speaker profile exists
    localStorage.clear();
    sessionStorage.clear();

    render(
      <AppProvider>
        <ClientPortal />
      </AppProvider>
    );

    // Verifies NO "Guest Speaker" is rendered, instead SpeakerLoginPortal is rendered
    expect(screen.queryByText(/Guest Speaker/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Welcome, Speaker/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Orators App' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Speaker Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Login Passcode/i })).toBeInTheDocument();
  });

  test('should automatically authenticate via 1-click magic link URL parameters', async () => {
    localStorage.clear();
    sessionStorage.clear();

    // Set magic_token in window.location.search
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      pathname: '/speaker',
      search: '?magic_token=valid-magic-token&email=kassimmusa322@gmail.com'
    } as any;

    render(
      <AppProvider>
        <ClientPortal />
      </AppProvider>
    );

    // Verify loading state or successful login profile
    expect(await screen.findByText('KASSIM MUSA')).toBeInTheDocument();
    const saved = localStorage.getItem('globalorators_speaker_profile');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved || '{}');
    expect(parsed.fullName).toBe('KASSIM MUSA');

    // Restore window.location
    (window as any).location = originalLocation;
  });

  test('should recognize speaker as onboarded and enter speaker studio when onboardingSurvey is filled even if status is Pending Onboarding', async () => {
    localStorage.clear();
    sessionStorage.clear();
    const { clientsApi } = await import('../services/apiClient');
    (clientsApi.getMe as any).mockResolvedValueOnce({
      id: 'client-17860310',
      name: 'Geoffrey Anyona',
      email: 'anyonageoffrey49@gmail.com',
      status: 'Pending Onboarding',
      goal: 'Executive & Board Pitching',
      onboardingSurvey: {
        branch: 'Academy',
        fullName: 'Geoffrey Anyona',
        email: 'anyonageoffrey49@gmail.com',
        speakingGoal: 'Executive & Board Pitching',
        primaryDiscipline: 'VC Investment Pitch (Seed/Series A)'
      }
    });

    const originalLocation = window.location;
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      pathname: '/speaker',
      search: '?magic_token=valid-magic-token&email=anyonageoffrey49@gmail.com'
    } as any;

    render(
      <AppProvider>
        <ClientPortal />
      </AppProvider>
    );

    expect(await screen.findByText('Geoffrey Anyona')).toBeInTheDocument();
    const saved = localStorage.getItem('globalorators_speaker_profile');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved || '{}');
    expect(parsed.fullName).toBe('Geoffrey Anyona');

    (window as any).location = originalLocation;
  });
});

