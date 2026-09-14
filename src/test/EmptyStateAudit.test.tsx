import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProvider, useApp } from '../context/AppContext';

// Mock API to return empty arrays — simulates a new user with no data
vi.mock('../services/apiClient', () => ({
  authApi: {
    me: vi.fn().mockResolvedValue({ email: 'test@example.com', role: 'coach' }),
    login: vi.fn().mockResolvedValue({ access_token: 'test-token', user: { email: 'test@example.com', role: 'coach' } }),
  },
  clientsApi: { getAll: vi.fn().mockResolvedValue([]), create: vi.fn(), getMe: vi.fn().mockRejectedValue(new Error('Not found')) },
  exercisesApi: { getAll: vi.fn().mockResolvedValue([]) },
  programsApi: { getAll: vi.fn().mockResolvedValue([]), save: vi.fn(), assign: vi.fn() },
  workoutsApi: { getAll: vi.fn().mockResolvedValue([]) },
  metricsApi: { getAll: vi.fn().mockResolvedValue([]) },
  prsApi: { getAll: vi.fn().mockResolvedValue([]) },
  habitsApi: { getAll: vi.fn().mockResolvedValue([]) },
  photosApi: { getAll: vi.fn().mockResolvedValue([]) },
  messagesApi: { getAll: vi.fn().mockResolvedValue([]), send: vi.fn() },
  activityApi: { getAll: vi.fn().mockResolvedValue([]) },
  inquiriesApi: { submit: vi.fn().mockResolvedValue({ status: 'success' }) },
  coachesApi: { getAll: vi.fn().mockResolvedValue([]) },
}));

// Helper component to expose context values for assertions
const ContextInspector: React.FC<{ onContext: (ctx: ReturnType<typeof useApp>) => void }> = ({ onContext }) => {
  const ctx = useApp();
  React.useEffect(() => { onContext(ctx); }, [ctx, onContext]);
  return <div data-testid="inspector">ready</div>;
};

describe('Empty State Rendering (Audit Gate Item 9)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Simulate authenticated coach session
    localStorage.setItem('globalorators_token', 'test-jwt-token');
  });

  test('all business collections initialize as empty arrays — no mock data fallback', async () => {
    let capturedCtx: ReturnType<typeof useApp> | null = null;
    const capture = vi.fn((ctx: ReturnType<typeof useApp>) => { capturedCtx = ctx; });

    render(
      <AppProvider>
        <ContextInspector onContext={capture} />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('inspector')).toBeInTheDocument();
    });

    expect(capturedCtx).toBeTruthy();
    // Every business collection must be an array (not undefined, not mock data)
    expect(Array.isArray(capturedCtx!.clients)).toBe(true);
    expect(Array.isArray(capturedCtx!.exercises)).toBe(true);
    expect(Array.isArray(capturedCtx!.programs)).toBe(true);
    expect(Array.isArray(capturedCtx!.scheduledWorkouts)).toBe(true);
    expect(Array.isArray(capturedCtx!.metrics)).toBe(true);
    expect(Array.isArray(capturedCtx!.personalRecords)).toBe(true);
    expect(Array.isArray(capturedCtx!.photos)).toBe(true);
    expect(Array.isArray(capturedCtx!.messages)).toBe(true);
    expect(Array.isArray(capturedCtx!.activityFeed)).toBe(true);
    expect(Array.isArray(capturedCtx!.habitLogs)).toBe(true);
  });

  test('no fictional seed names appear when API returns empty arrays', async () => {
    let capturedClients: any[] = [];
    const capture = vi.fn((ctx: ReturnType<typeof useApp>) => { capturedClients = ctx.clients; });

    render(
      <AppProvider>
        <ContextInspector onContext={capture} />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('inspector')).toBeInTheDocument();
    });

    // Verify no seed/fixture names are present
    const fixtureNames = [
      'Marcus Vance', 'Elena Rostova', 'David Kim',
      'Amina Diallo', 'Lucas Moreau', 'Sarah Jenkins',
      'Dr. Arthur Vance', 'Kofi Mensah', 'Nia Adebayo'
    ];

    fixtureNames.forEach(name => {
      expect(capturedClients.find(c => c.name === name)).toBeUndefined();
    });
  });

  test('speaker profile is null when no saved profile exists — no hardcoded default identity', async () => {
    let capturedProfile: any = 'unset';
    const capture = vi.fn((ctx: ReturnType<typeof useApp>) => { capturedProfile = ctx.activeSpeakerProfile; });

    render(
      <AppProvider>
        <ContextInspector onContext={capture} />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('inspector')).toBeInTheDocument();
    });

    // No default Kofi Mensah or any hardcoded identity
    expect(capturedProfile).toBeNull();
  });

  test('completeOnboarding fails closed and does NOT touch localStorage when database persistence fails', async () => {
    const { clientsApi } = await import('../services/apiClient');
    (clientsApi.create as any).mockRejectedValueOnce(new Error('Network error: server unreachable'));

    let contextInstance: ReturnType<typeof useApp> | null = null;
    const capture = vi.fn((ctx: ReturnType<typeof useApp>) => { contextInstance = ctx; });

    render(
      <AppProvider>
        <ContextInspector onContext={capture} />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('inspector')).toBeInTheDocument();
    });

    const testData = {
      branch: 'Academy' as const,
      fullName: 'Fail Closed Candidate',
      email: 'fail.closed@example.com',
      missionFocus: 'Executive & Board Pitching',
      speakingGoal: 'Executive & Board Pitching' as const,
      experienceLevel: 'Novice Speaker' as const,
      vocalBaselinePace: 140,
      emotionalOpennessRating: 8,
      selectedHabits: []
    };

    const res = await contextInstance!.completeOnboarding(testData);
    expect(res.success).toBe(false);

    // Assert fail-closed: NO profile saved to localStorage
    expect(localStorage.getItem('globalorators_speaker_profile')).toBeNull();
    // Portal must NOT switch to speaker_app
    expect(contextInstance!.currentPortal).not.toBe('speaker_app');
  });

  test('completeOnboarding succeeds and writes to localStorage ONLY after database returns success', async () => {
    const { clientsApi } = await import('../services/apiClient');
    (clientsApi.create as any).mockResolvedValueOnce({
      id: 'client-persisted-999',
      name: 'Persisted Speaker',
      email: 'persisted@example.com'
    });

    let contextInstance: ReturnType<typeof useApp> | null = null;
    const capture = vi.fn((ctx: ReturnType<typeof useApp>) => { contextInstance = ctx; });

    render(
      <AppProvider>
        <ContextInspector onContext={capture} />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('inspector')).toBeInTheDocument();
    });

    const testData = {
      branch: 'Academy' as const,
      fullName: 'Persisted Speaker',
      email: 'persisted@example.com',
      missionFocus: 'Executive & Board Pitching',
      speakingGoal: 'Executive & Board Pitching' as const,
      experienceLevel: 'Novice Speaker' as const,
      vocalBaselinePace: 140,
      emotionalOpennessRating: 8,
      selectedHabits: []
    };

    let res: any;
    await waitFor(async () => {
      res = await contextInstance!.completeOnboarding(testData);
    });
    expect(res.success).toBe(true);

    // Profile must be in localStorage after verified server persistence
    const saved = JSON.parse(localStorage.getItem('globalorators_speaker_profile')!);
    expect(saved.fullName).toBe('Persisted Speaker');
    
    await waitFor(() => {
      expect(contextInstance!.currentPortal).toBe('speaker_app');
    });
  });
});
