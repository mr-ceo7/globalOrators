import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import { CoachMessenger } from '../components/messenger/CoachMessenger';
import { messagesApi } from '../services/apiClient';

vi.mock('../services/apiClient', () => ({
  clearAuthSession: vi.fn(),
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    googleAuth: vi.fn(),
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    me: vi.fn().mockResolvedValue({ id: 'coach-1', email: 'kassimmusa322@gmail.com', role: 'coach', full_name: 'Coach Qassim' })
  },
  clientsApi: {
    getAll: vi.fn().mockResolvedValue([
      {
        id: 'client-1',
        name: 'Geoffrey Anyona',
        email: 'anyonageoffrey49@gmail.com',
        phone: '+254700000001',
        avatar: '',
        status: 'Active',
        goal: 'Executive & Board Pitching',
        currentProgramName: 'Master Orator Protocol'
      }
    ]),
    list: vi.fn().mockResolvedValue([
      {
        id: 'client-1',
        name: 'Geoffrey Anyona',
        email: 'anyonageoffrey49@gmail.com',
        phone: '+254700000001',
        avatar: '',
        status: 'Active',
        goal: 'Executive & Board Pitching',
        currentProgramName: 'Master Orator Protocol'
      }
    ]),
    getMe: vi.fn().mockResolvedValue(null)
  },
  coachesApi: {
    getAll: vi.fn().mockResolvedValue([])
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
        sender: 'client',
        text: 'Hello Coach, I have practiced the parliamentary flow.',
        timestamp: '10:30 AM',
        isRead: true
      },
      {
        id: 'msg-2',
        clientId: 'client-1',
        sender: 'coach',
        text: 'Excellent work! Keep your pauses controlled.',
        timestamp: '10:32 AM',
        isRead: false
      }
    ]),
    send: vi.fn().mockResolvedValue({
      id: 'msg-new',
      clientId: 'client-1',
      sender: 'coach',
      text: 'Remember diaphragmatic breath support.',
      timestamp: '10:35 AM',
      isRead: false
    }),
    markRead: vi.fn().mockResolvedValue({ status: 'ok', clientId: 'client-1' }),
    sendTyping: vi.fn().mockResolvedValue({ status: 'ok', clientId: 'client-1', isTyping: true }),
    react: vi.fn().mockResolvedValue({
      id: 'msg-1',
      attachment: {
        reactions: [{ emoji: '👍', userId: 'coach-1', userName: 'Coach Qassim' }]
      }
    }),
    getPresence: vi.fn().mockResolvedValue({ onlineUserIds: ['coach-1'], onlineClientIds: ['client-1'] })
  },
  activityApi: {
    getAll: vi.fn().mockResolvedValue([])
  }
}));

describe('CoachMessenger Component (WhatsApp-style Modern Chat)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('globalorators_token', 'test-token');
    localStorage.setItem('globalorators_user', JSON.stringify({ id: 'coach-1', email: 'kassimmusa322@gmail.com', role: 'coach', full_name: 'Coach Qassim' }));
  });

  test('renders Messenger header, orator list, and messages thread', async () => {
    render(
      <AppProvider>
        <CoachMessenger />
      </AppProvider>
    );

    // Header title
    await waitFor(() => {
      expect(screen.getByText('Messenger')).toBeInTheDocument();
    });

    // Orator in list
    expect(screen.getAllByText('Geoffrey Anyona').length).toBeGreaterThan(0);

    // Messages rendered
    await waitFor(() => {
      expect(screen.getByText(/Hello Coach, I have practiced/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Excellent work! Keep your pauses controlled/i).length).toBeGreaterThan(0);
    });
  });

  test('displays real-time online presence status', async () => {
    render(
      <AppProvider>
        <CoachMessenger />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/ONLINE • SSE ACTIVE/i)).toBeInTheDocument();
    });
  });

  test('allows typing and sending a message with Quick Cues', async () => {
    render(
      <AppProvider>
        <CoachMessenger />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Hello Coach, I have practiced/i)).toBeInTheDocument();
    });

    // Click a quick cue
    const quickCueBtn = screen.getByText(/Sharp argument structure!/i);
    expect(quickCueBtn).toBeInTheDocument();
    fireEvent.click(quickCueBtn);

    // Input field is present
    const input = screen.getByPlaceholderText(/Message Geoffrey Anyona/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Great pacing on that drill!' } });
    expect(input.value).toBe('Great pacing on that drill!');

    const sendBtn = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendBtn);
  });

  test('toggles in-chat search and filters messages', async () => {
    render(
      <AppProvider>
        <CoachMessenger />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Hello Coach, I have practiced/i)).toBeInTheDocument();
    });

    // Toggle search button
    const searchBtn = screen.getByTitle('Search conversation');
    fireEvent.click(searchBtn);

    const searchInput = screen.getByPlaceholderText('Search messages in this thread...');
    expect(searchInput).toBeInTheDocument();

    // Filter for "parliamentary"
    fireEvent.change(searchInput, { target: { value: 'parliamentary' } });

    await waitFor(() => {
      expect(screen.getByText(/Hello Coach, I have practiced the parliamentary/i)).toBeInTheDocument();
      expect(screen.getByText(/1 found/i)).toBeInTheDocument();
    });
  });

  test('dispatches typing indicator on input change and clears on blur', async () => {
    render(
      <AppProvider>
        <CoachMessenger />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Message Geoffrey Anyona.../i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Message Geoffrey Anyona.../i);
    fireEvent.change(input, { target: { value: 'Working on your vocal pace...' } });

    expect(messagesApi.sendTyping).toHaveBeenCalledWith('client-1', true);

    fireEvent.blur(input);
    expect(messagesApi.sendTyping).toHaveBeenCalledWith('client-1', false);
  });
});
