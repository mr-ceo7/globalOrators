/**
 * Global Orators API Client Service
 * Connects frontend to the FastAPI backend with JWT authentication and fallback resiliency.
 */

import {
  Client,
  Exercise,
  TrainingProgram,
  ScheduledWorkout,
  MetricEntry,
  PersonalRecord,
  ProgressPhoto,
  ChatMessage,
  ActivityFeedItem,
  ClientDailyHabitLog,
  CoachItem
} from '../types';


export const API_BASE_URL = (() => {
  const envUrl = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL;
  if (!envUrl || envUrl.includes('trycloudflare.com') || envUrl.includes('ngrok-free.dev')) {
    return '/api';
  }
  return envUrl;
})();

export const clearAuthSession = () => {
  localStorage.removeItem('globalorators_token');
  localStorage.removeItem('globalorators_user');
  localStorage.removeItem('globalorators_speaker_profile');
  localStorage.removeItem('globalorators_portal');
  localStorage.removeItem('globalorators_selected_branch');
  localStorage.removeItem('nubianfit_token');
  localStorage.removeItem('nubianfit_user');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:session_cleared'));
  }
};

class ApiClient {

  async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const token = localStorage.getItem('globalorators_token') || localStorage.getItem('nubianfit_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': '1',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // If 401 Unauthorized, purge all cached credentials and throw AuthenticationError
      if (response.status === 401) {
        clearAuthSession();
        throw new Error('AuthenticationError');
      }

      let errorMsg = `API Error ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        }
      } catch {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          searchParams.append(k, String(v));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = localStorage.getItem('globalorators_token') || localStorage.getItem('nubianfit_token');

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'ngrok-skip-browser-warning': '1',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthSession();
        throw new Error('AuthenticationError');
      }

      let errorMsg = `API Error ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        }
      } catch {}
      throw new Error(errorMsg);
    }

    return response.json();
  }

  async getBlob(endpoint: string): Promise<Blob> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = localStorage.getItem('globalorators_token') || localStorage.getItem('nubianfit_token');

    const headers: Record<string, string> = {
      'ngrok-skip-browser-warning': '1',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
      if (response.status === 401) {
        clearAuthSession();
        throw new Error('AuthenticationError');
      }
      throw new Error(`Failed to fetch audio stream: ${response.statusText}`);
    }
    return response.blob();
  }
}

export const api = new ApiClient();

// Auth Endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await api.post<{ access_token: string; token_type: string; user: any }>('/auth/login', {
      email,
      password,
    });
    if (data?.access_token) {
      localStorage.setItem('nubianfit_token', data.access_token);
      localStorage.setItem('globalorators_token', data.access_token);
      localStorage.setItem('nubianfit_user', JSON.stringify(data.user));
      localStorage.setItem('globalorators_user', JSON.stringify(data.user));
    }
    return data;
  },
  register: async (payload: { email: string; password: string; full_name: string; role?: string; coach_invite_code?: string; avatar?: string }) => {
    const data = await api.post<{ access_token: string; token_type: string; user: any }>('/auth/register', payload);
    if (data?.access_token) {
      localStorage.setItem('nubianfit_token', data.access_token);
      localStorage.setItem('globalorators_token', data.access_token);
      localStorage.setItem('nubianfit_user', JSON.stringify(data.user));
      localStorage.setItem('globalorators_user', JSON.stringify(data.user));
    }
    return data;
  },
  googleAuth: async (credential: string, role: 'coach' | 'speaker' = 'speaker') => {
    const data = await api.post<{ access_token: string; token_type: string; user: any }>('/auth/google', {
      credential,
      role,
      coach_invite_code: role === 'coach' ? 'FACULTY-INVITE-2026' : undefined
    });
    if (data?.access_token) {
      localStorage.setItem('nubianfit_token', data.access_token);
      localStorage.setItem('globalorators_token', data.access_token);
      localStorage.setItem('nubianfit_user', JSON.stringify(data.user));
      localStorage.setItem('globalorators_user', JSON.stringify(data.user));
    }
    return data;
  },
  sendOtp: async (email: string, redirectUrl?: string) => {
    return api.post<{ status: string; email: string; message: string; magic_link?: string }>('/auth/otp/send', {
      email,
      redirect_url: redirectUrl || (typeof window !== 'undefined' ? window.location.origin : undefined)
    });
  },
  verifyOtp: async (email: string, code: string) => {
    const data = await api.post<{ access_token: string; token_type: string; user: any }>('/auth/otp/verify', {
      email,
      code,
    });
    if (data?.access_token) {
      localStorage.setItem('nubianfit_token', data.access_token);
      localStorage.setItem('globalorators_token', data.access_token);
      localStorage.setItem('nubianfit_user', JSON.stringify(data.user));
      localStorage.setItem('globalorators_user', JSON.stringify(data.user));
    }
    return data;
  },
  verifyMagicLink: async (token: string, email?: string) => {
    const data = await api.post<{ access_token: string; token_type: string; user: any }>('/auth/magic-link/verify', {
      token,
      email,
    });
    if (data?.access_token) {
      localStorage.setItem('nubianfit_token', data.access_token);
      localStorage.setItem('globalorators_token', data.access_token);
      localStorage.setItem('nubianfit_user', JSON.stringify(data.user));
      localStorage.setItem('globalorators_user', JSON.stringify(data.user));
    }
    return data;
  },
  me: () => api.get<any>('/auth/me'),
  checkEmail: async (email: string) => {
    return api.post<{
      email: string;
      exists: boolean;
      auth_method: 'password' | 'google' | 'both' | 'none';
      role: string | null;
    }>('/auth/check-email', { email });
  },
  logout: () => {
    clearAuthSession();
  },
};

// Clients Endpoints
export const clientsApi = {
  getAll: (params?: { status?: string; search?: string; intake?: string }) => api.get<Client[]>('/clients', params),
  getById: (id: string) => api.get<Client>(`/clients/${id}`),
  getMe: () => api.get<Client>('/clients/me'),
  create: (client: Partial<Client> & { coachRef?: string }) => api.post<Client>('/clients', client),
  update: (id: string, updates: Partial<Client>) => api.patch<Client>(`/clients/${id}`, updates),
  reassignCoach: (id: string, coachId: string, reason?: string) =>
    api.patch<Client>(`/clients/${id}/reassign-coach`, { coachId, reason }),
  addAdjudicationNote: (id: string, note: string, rubricCategory?: string, rating?: number) =>
    api.post<Client>(`/clients/${id}/adjudication-notes`, { note, rubricCategory, rating }),
  addNote: (id: string, note: string) => api.post<Client>(`/clients/${id}/notes`, { note }),
  delete: (id: string) => api.delete<{ message: string; id: string }>(`/clients/${id}`),
};

// Coaches Faculty Directory Endpoints
export const coachesApi = {
  getAll: () => api.get<CoachItem[]>('/coaches'),
  create: (data: { email: string; password: string; fullName: string; avatar?: string }) =>
    api.post<CoachItem>('/coaches', data),
};


// Exercises / Speech Drills Endpoints
export const exercisesApi = {
  getAll: (params?: { skill?: string; muscle?: string; equipment?: string; format?: string; difficulty?: string; search?: string }) =>
    api.get<Exercise[]>('/exercises', params),
  getById: (id: string) => api.get<Exercise>(`/exercises/${id}`),
  create: (exercise: Partial<Exercise>) => api.post<Exercise>('/exercises', exercise),
  update: (id: string, updates: Partial<Exercise>) => api.patch<Exercise>(`/exercises/${id}`, updates),
  delete: (id: string) => api.delete<{ message: string; id: string }>(`/exercises/${id}`),
};

// Training Programs Endpoints
export const programsApi = {
  getAll: (params?: { goal?: string; difficulty?: string }) => api.get<TrainingProgram[]>('/programs', params),
  getById: (id: string) => api.get<TrainingProgram>(`/programs/${id}`),
  save: (program: TrainingProgram) => api.post<TrainingProgram>('/programs', program),
  update: (id: string, updates: Partial<TrainingProgram>) => api.patch<TrainingProgram>(`/programs/${id}`, updates),
  assign: (programId: string, clientId: string) =>
    api.post<{ message: string; scheduled_count: number }>(`/programs/${programId}/assign`, { client_id: clientId }),
  delete: (id: string) => api.delete<{ message: string; id: string }>(`/programs/${id}`),
};

// Scheduled Workouts Endpoints
export const workoutsApi = {
  getAll: (params?: { clientId?: string; date?: string; status?: string }) =>
    api.get<ScheduledWorkout[]>('/workouts', params),
  getById: (id: string) => api.get<ScheduledWorkout>(`/workouts/${id}`),
  create: (workout: Partial<ScheduledWorkout>) => api.post<ScheduledWorkout>('/workouts', workout),
  update: (id: string, updates: Partial<ScheduledWorkout>) => api.patch<ScheduledWorkout>(`/workouts/${id}`, updates),
  complete: (
    id: string,
    payload: { clientFeedback?: string; coachFeedback?: string; rating?: number; durationMin?: number; exercises?: any[] }
  ) => api.post<ScheduledWorkout>(`/workouts/${id}/complete`, payload),
  delete: (id: string) => api.delete<{ message: string; id: string }>(`/workouts/${id}`),
};

// Biometric Metrics Endpoints
export const metricsApi = {
  getAll: (params?: { clientId?: string }) => api.get<MetricEntry[]>('/metrics', params),
  create: (metric: Partial<MetricEntry>) => api.post<MetricEntry>('/metrics', metric),
  delete: (id: string) => api.delete<{ message: string; id: string }>(`/metrics/${id}`),
};

// Personal Records (PRs) Endpoints
export const prsApi = {
  getAll: (params?: { clientId?: string }) => api.get<PersonalRecord[]>('/prs', params),
  create: (pr: Partial<PersonalRecord>) => api.post<PersonalRecord>('/prs', pr),
};

// Habit Logs Endpoints
export const habitsApi = {
  getAll: (params?: { clientId?: string; date?: string }) => api.get<ClientDailyHabitLog[]>('/habits', params),
  toggle: (clientId: string, date: string, habitId: string) =>
    api.post<ClientDailyHabitLog>('/habits/toggle', { clientId, date, habitId }),
};

// Progress Photos Endpoints
export const photosApi = {
  getAll: (params?: { clientId?: string }) => api.get<ProgressPhoto[]>('/photos', params),
  create: (photo: Partial<ProgressPhoto>) => api.post<ProgressPhoto>('/photos', photo),
  delete: (id: string) => api.delete<{ message: string; id: string }>(`/photos/${id}`),
};

// Chat Messages Endpoints
export const messagesApi = {
  getAll: (params?: { clientId?: string }) => api.get<ChatMessage[]>('/messages', params),
  send: (clientId: string, text: string, attachment?: any, sender: 'coach' | 'client' = 'coach', clientMsgId?: string) =>
    api.post<ChatMessage>('/messages', { clientId, sender, text, attachment, clientMsgId }),
  delete: (messageId: string) =>
    api.delete<{ status: string; messageId: string }>(`/messages/${messageId}`),
  markRead: (clientId: string) =>
    api.post<{ status: string; clientId: string }>('/messages/mark-read', { clientId }),
  react: (messageId: string, emoji: string) =>
    api.patch<ChatMessage>(`/messages/${messageId}/react`, { emoji }),
  getPresence: () =>
    api.get<{ onlineUserIds: string[]; onlineClientIds: string[] }>('/messages/presence'),
};

// Activity Feed Endpoints
export const activityApi = {
  getAll: (limit = 25) => api.get<ActivityFeedItem[]>(`/activity?limit=${limit}`),
};

// Inquiries Endpoints
export interface InquiryPayload {
  organization: string;
  email: string;
  branch: 'Academy' | 'Foundation';
  focus: string;
  message?: string;
}

export interface InquiryResponse {
  status: string;
  inquiryId: string;
  organization: string;
  email: string;
  branch: string;
  focus: string;
  message: string;
  createdAt: string;
}

export const inquiriesApi = {
  submit: (data: InquiryPayload) => api.post<InquiryResponse>('/inquiries', data),
  getAll: () => api.get<InquiryResponse[]>('/inquiries'),
};

// Journals Endpoints (Catharsis Vault Reflections)
export interface JournalEntryPayload {
  client_id: string;
  date: string;
  text: string;
  feel_before: string;
  feel_after: string;
}

export interface JournalEntryResponse {
  id: string;
  client_id: string;
  date: string;
  text: string;
  feel_before: string;
  feel_after: string;
  created_at?: string;
}

export const journalsApi = {
  getAll: (params?: { clientId?: string }) => api.get<JournalEntryResponse[]>('/journals', params),
  create: (data: JournalEntryPayload) => api.post<JournalEntryResponse>('/journals', data),
  delete: (id: string) => api.delete<{ message: string; id: string }>(`/journals/${id}`),
};

// Executive Simulations Endpoints (Speech Vault Simulations)
export interface SimulationPayload {
  client_id: string;
  date: string;
  arena: string;
  summary: string;
  wpm?: number;
  coach_status?: string;
}

export interface SimulationResponse {
  id: string;
  client_id: string;
  date: string;
  arena: string;
  summary: string;
  wpm: number;
  coach_status: string;
  created_at?: string;
}

export const simulationsApi = {
  getAll: (params?: { clientId?: string }) => api.get<SimulationResponse[]>('/simulations', params),
  create: (data: SimulationPayload) => api.post<SimulationResponse>('/simulations', data),
  delete: (id: string) => api.delete<{ message: string; id: string }>(`/simulations/${id}`),
};

// Audio Recordings Endpoints (Durable Rehearsal Storage)
export interface RecordingResponse {
  id: string;
  client_id: string;
  title: string;
  file_url: string;
  duration_seconds: number;
  file_size_bytes: number;
  mime_type: string;
  created_at?: string;
}

export const recordingsApi = {
  getAll: (params?: { clientId?: string }) => api.get<RecordingResponse[]>('/recordings', params),
  upload: (clientId: string, file: Blob, title = 'Rehearsal Recording', durationSeconds = 0) => {
    const formData = new FormData();
    formData.append('file', file, 'rehearsal.webm');
    formData.append('clientId', clientId);
    formData.append('title', title);
    formData.append('duration_seconds', String(durationSeconds));
    return api.postFormData<RecordingResponse>('/recordings/upload', formData);
  },
  getStreamBlob: (recordingId: string) => api.getBlob(`/recordings/${recordingId}/stream`),
  delete: (recordingId: string) => api.delete<{ message: string; id: string }>(`/recordings/${recordingId}`),
};

// System Configuration Endpoints (Dynamic Infrastructure Discovery)
export interface JitsiDomainConfig {
  domain: string;
  url: string;
  source: string;
  updated_at?: string;
}

export const systemApi = {
  getJitsiDomain: async (): Promise<JitsiDomainConfig> => {
    try {
      return await api.get<JitsiDomainConfig>('/system/jitsi-domain');
    } catch {
      const fallbackDomain = (import.meta as unknown as { env?: { VITE_JITSI_DOMAIN?: string } }).env?.VITE_JITSI_DOMAIN || 'meet.globalorators.com';
      return {
        domain: fallbackDomain,
        url: `https://${fallbackDomain}`,
        source: 'client_fallback',
      };
    }
  },
};

