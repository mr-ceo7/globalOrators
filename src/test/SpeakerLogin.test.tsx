import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import { SpeakerLoginModal } from '../components/landing/SpeakerLoginModal';
import { ClientPortal } from '../components/clientApp/ClientPortal';

vi.mock('../services/apiClient', () => ({
  authApi: { me: vi.fn().mockResolvedValue({ email: 'coach@globalorators.com' }) },
  clientsApi: {
    list: vi.fn().mockResolvedValue([]),
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation((c) => Promise.resolve({ ...c, id: c.id || 'client-1' })),
    lookup: vi.fn().mockImplementation((search: string) => {
      if (search.includes('kassim') || search.includes('254746957502')) {
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
      }
      return Promise.reject(new Error('Speaker profile not found'));
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
  inquiriesApi: { submit: vi.fn().mockResolvedValue({ status: 'success' }), list: vi.fn().mockResolvedValue([]) }
}));

describe('Speaker Login & Portal Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should render SpeakerLoginModal and log in with email', async () => {
    const handleClose = vi.fn();
    render(
      <AppProvider>
        <SpeakerLoginModal isOpen={true} onClose={handleClose} />
      </AppProvider>
    );

    expect(screen.getByText('Access Your Protocol')).toBeInTheDocument();
    expect(screen.getByText('Speaker Portal Re-Entry')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/kassimmusa322@gmail\.com/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'kassimmusa322@gmail.com' } });
    });

    const submitBtn = screen.getByRole('button', { name: /Enter Speaker Portal/i });
    await act(async () => {
      fireEvent.click(submitBtn);
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

    const submitBtn = screen.getByRole('button', { name: /Enter Speaker Portal/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(await screen.findByText(/No speaker profile found with that email/i)).toBeInTheDocument();
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
    expect(screen.getByText('Championship Debate & Pan-African Leadership')).toBeInTheDocument();
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
    expect(screen.getByText('Executive Investor Pitch: High-Stakes Persuasion & Presence')).toBeInTheDocument();
    expect(screen.getByText(/The 60-Second Venture Genesis/i)).toBeInTheDocument();
    expect(screen.getByText(/venture's founding conviction/i)).toBeInTheDocument();
  });
});

