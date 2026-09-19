import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import { SpeakerMessenger } from '../components/messenger/SpeakerMessenger';

vi.mock('../services/apiClient', () => ({
  clearAuthSession: vi.fn(),
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    googleAuth: vi.fn(),
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    me: vi.fn().mockResolvedValue({ id: 'spk-1', email: 'orator@example.com', role: 'client', full_name: 'Geoffrey Anyona' })
  },
  clientsApi: {
    getAll: vi.fn().mockResolvedValue([
      {
        id: 'client-1',
        name: 'Geoffrey Anyona',
        email: 'orator@example.com',
        phone: '+254700000001',
        avatar: '',
        status: 'Active',
        goal: 'Executive & Board Pitching',
        currentProgramName: 'Master Orator Protocol',
        coachId: 'coach-1'
      }
    ]),
    list: vi.fn().mockResolvedValue([
      {
        id: 'client-1',
        name: 'Geoffrey Anyona',
        email: 'orator@example.com',
        phone: '+254700000001',
        avatar: '',
        status: 'Active',
        goal: 'Executive & Board Pitching',
        currentProgramName: 'Master Orator Protocol',
        coachId: 'coach-1'
      }
    ]),
    getMe: vi.fn().mockResolvedValue({
      id: 'client-1',
      name: 'Geoffrey Anyona',
      email: 'orator@example.com',
      track: 'executive',
      currentProgramName: 'Master Orator Protocol',
      assignedCoachId: 'coach-1'
    })
  },
  coachesApi: {
    getAll: vi.fn().mockResolvedValue([
      {
        id: 'coach-1',
        name: 'Head Coach Qassim',
        email: 'kassimmusa322@gmail.com',
        title: 'Master Rhetoric & Parliamentary Coach',
        status: 'Active'
      },
      {
        id: 'coach-8afc482c',
        name: 'claude2',
        email: '2claudeformee@gmail.com',
        title: 'Faculty Speech & Debate Coach',
        status: 'Active'
      }
    ])
  },
  programsApi: {
    getAll: vi.fn().mockResolvedValue([])
  },
  exercisesApi: {
    getAll: vi.fn().mockResolvedValue([])
  },
  workoutsApi: {
    getAll: vi.fn().mockResolvedValue([])
  },
  metricsApi: {
    getAll: vi.fn().mockResolvedValue([])
  },
  prsApi: {
    getAll: vi.fn().mockResolvedValue([])
  },
  habitsApi: {
    getAll: vi.fn().mockResolvedValue([])
  },
  photosApi: {
    getAll: vi.fn().mockResolvedValue([])
  },
  messagesApi: {
    getAll: vi.fn().mockResolvedValue([
      {
        id: 'msg-1',
        clientId: 'client-1',
        coachId: 'coach-1',
        sender: 'coach',
        text: 'Welcome Geoffrey. Let us refine your board presentation rebuttal.',
        timestamp: '09:00 AM',
        isRead: true
      },
      {
        id: 'msg-2',
        clientId: 'client-1',
        sender: 'client',
        text: 'Thank you Coach. I recorded a voice note rehearsal.',
        timestamp: '09:05 AM',
        isRead: true,
        messageType: 'audio',
        attachment: {
          type: 'voice',
          title: 'Voice Rehearsal Memo (0:18)',
          duration: '0:18',
          durationSeconds: 18,
          waveform: [14, 28, 18, 32, 16, 24, 36, 20]
        }
      },
      {
        id: 'msg-3',
        clientId: 'client-1',
        coachId: 'coach-1',
        sender: 'coach',
        text: '🎙️ Voice critique on opening rebuttal hook (0:12)',
        timestamp: '09:15 AM',
        isRead: true,
        messageType: 'audio',
        attachment: {
          type: 'voice',
          title: 'Voice Critique (0:12)',
          duration: '0:12',
          durationSeconds: 12,
          waveform: [14, 28, 18, 32, 16, 24, 36, 20]
        }
      },
      {
        id: 'msg-4',
        clientId: 'client-1',
        coachId: 'coach-8afc482c',
        sender: 'coach',
        text: 'Check your posture on the podium.',
        timestamp: '09:20 AM',
        isRead: true
      }
    ]),
    send: vi.fn().mockResolvedValue({
      id: 'msg-new',
      clientId: 'client-1',
      sender: 'client',
      text: 'I practiced the 2-second pause technique.',
      timestamp: '09:10 AM',
      isRead: false
    }),
    markRead: vi.fn().mockResolvedValue({ status: 'ok', clientId: 'client-1' }),
    react: vi.fn().mockResolvedValue({
      id: 'msg-1',
      attachment: {
        reactions: [{ emoji: '🔥', userId: 'client-1', userName: 'Geoffrey Anyona' }]
      }
    }),
    getPresence: vi.fn().mockResolvedValue({ onlineUserIds: ['coach-1'], onlineClientIds: ['client-1'] })
  },
  activityApi: {
    getAll: vi.fn().mockResolvedValue([])
  }
}));

describe('SpeakerMessenger Component', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('globalorators_token', 'test-token');
    localStorage.setItem('globalorators_speaker_token', 'test-token');
    localStorage.setItem('globalorators_speaker_profile', JSON.stringify({
      fullName: 'Geoffrey Anyona',
      email: 'orator@example.com',
      track: 'executive'
    }));
  });

  const mockProps = {
    assignedCoach: {
      id: 'coach-1',
      name: 'Head Coach Qassim',
      title: 'Master Rhetoric Coach',
      email: 'kassimmusa322@gmail.com'
    },
    pairedClient: {
      id: 'client-1',
      name: 'Geoffrey Anyona',
      email: 'orator@example.com'
    },
    profile: {
      fullName: 'Geoffrey Anyona',
      email: 'orator@example.com',
      track: 'executive'
    },
    isExecutive: true,
    isAcademy: false
  };

  test('renders coach header, online presence status, and message bubbles', async () => {
    render(
      <AppProvider>
        <SpeakerMessenger {...mockProps} />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Head Coach Qassim').length).toBeGreaterThan(0);
      expect(screen.getByText(/ONLINE • SSE ACTIVE/i)).toBeInTheDocument();
    });

    // Message text rendered
    expect(screen.getByText(/Welcome Geoffrey/i)).toBeInTheDocument();

    // Voice note rendered with waveform container and speed toggle
    expect(screen.getAllByTitle(/Play Voice Memo/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText('1x').length).toBeGreaterThan(0);
    expect(screen.getByText('0:18')).toBeInTheDocument();
  });

  test('cycles voice playback speed multiplier on button click', async () => {
    render(
      <AppProvider>
        <SpeakerMessenger {...mockProps} />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('1x').length).toBeGreaterThan(0);
    });

    const speedBtn = screen.getAllByTitle(/Toggle Playback Speed/i)[0];
    fireEvent.click(speedBtn);
    expect(screen.getAllByText('1.5x').length).toBeGreaterThan(0);

    fireEvent.click(speedBtn);
    expect(screen.getAllByText('2x').length).toBeGreaterThan(0);

    fireEvent.click(speedBtn);
    expect(screen.getAllByText('1x').length).toBeGreaterThan(0);
  });

  test('allows typing and sending a text message with quick cues', async () => {
    render(
      <AppProvider>
        <SpeakerMessenger {...mockProps} />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome Geoffrey/i)).toBeInTheDocument();
    });

    // Quick Cue clicked
    const quickCue = screen.getByText(/Can you evaluate the hook and pacing/i);
    expect(quickCue).toBeInTheDocument();
    fireEvent.click(quickCue);

    // Input populated or message sent
    const input = screen.getByPlaceholderText(/Message Head Coach Qassim/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Ready for my rehearsal review.' } });
    expect(input.value).toBe('Ready for my rehearsal review.');

    const sendBtn = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendBtn);
  });

  test('toggles in-chat search and filters messages', async () => {
    render(
      <AppProvider>
        <SpeakerMessenger {...mockProps} />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome Geoffrey/i)).toBeInTheDocument();
    });

    const searchBtn = screen.getByTitle(/Search conversation messages/i);
    fireEvent.click(searchBtn);

    const searchInput = screen.getByPlaceholderText(/Search messages in this consultation/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'presentation' } });

    await waitFor(() => {
      expect(screen.getByText(/1 found/i)).toBeInTheDocument();
      expect(screen.getByText(/presentation rebuttal/i)).toBeInTheDocument();
    });
  });

  test('correctly shows offline status when assigned coach is not in onlineUserIds', async () => {
    const offlineCoachProps = {
      ...mockProps,
      assignedCoach: {
        id: 'coach-8afc482c',
        name: 'claude2',
        title: 'Faculty Speech & Debate Coach',
        email: '2claudeformee@gmail.com'
      }
    };

    render(
      <AppProvider>
        <SpeakerMessenger {...offlineCoachProps} />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('claude2')).toBeInTheDocument();
      expect(screen.getByText(/OFFLINE • DIRECT FACULTY THREAD/i)).toBeInTheDocument();
    });
  });

  test('accurately attributes voice note and critique to Head Coach Qassim even when assigned coach is claude2', async () => {
    const claude2Props = {
      ...mockProps,
      assignedCoach: {
        id: 'coach-8afc482c',
        name: 'claude2',
        title: 'Faculty Speech & Debate Coach',
        email: '2claudeformee@gmail.com'
      }
    };

    render(
      <AppProvider>
        <SpeakerMessenger {...claude2Props} />
      </AppProvider>
    );

    await waitFor(() => {
      // Header shows assigned coach claude2
      expect(screen.getByText('claude2')).toBeInTheDocument();
    });

    // Voice critique from coach-1 shows Head Coach Qassim attribution and Faculty Head badge
    await waitFor(() => {
      expect(screen.getAllByText('Head Coach Qassim').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Faculty Head/i).length).toBeGreaterThan(0);
    });

    // Avatar for Head Coach message has HQ initials and title
    expect(screen.getAllByTitle(/Head Coach Qassim \(Faculty Head\)/i)[0]).toBeInTheDocument();

    // Message from claude2 shows claude2 attribution and title
    expect(screen.getByText('Check your posture on the podium.')).toBeInTheDocument();
    expect(screen.getByTitle(/claude2 \(Faculty Coach\)/i)).toBeInTheDocument();
  });
});
