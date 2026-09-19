import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  PortalView,
  SpeakerOnboardingData,
  BranchType,
  CoachItem,
  ChatGroup,
  DirectoryOrator
} from '../types';
// mockData.ts removed from production bundle (C1 audit fix).
// All business collections initialize as empty arrays and are populated exclusively from the API.
import * as apiClientModule from '../services/apiClient';
const {
  authApi,
  clientsApi,
  exercisesApi,
  programsApi,
  workoutsApi,
  metricsApi,
  prsApi,
  habitsApi,
  photosApi,
  messagesApi,
  activityApi,
  coachesApi,
  clearAuthSession,
} = apiClientModule;
let groupsApi: any = {
  getAll: async () => [],
  create: async () => null,
  getById: async () => null,
  startCall: async () => null,
};
try {
  if (apiClientModule.groupsApi) {
    groupsApi = apiClientModule.groupsApi;
  }
} catch {
  // Vitest mock proxy throws on unmocked property access
}
import { startEventStream } from '../services/sseClient';

export type NavigationTab =
  | 'dashboard'
  | 'clients'
  | 'coaches'
  | 'programs'
  | 'exercises'
  | 'calendar'
  | 'progress'
  | 'messenger';

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  clients: Client[];
  exercises: Exercise[];
  programs: TrainingProgram[];
  scheduledWorkouts: ScheduledWorkout[];
  metrics: MetricEntry[];
  personalRecords: PersonalRecord[];
  photos: ProgressPhoto[];
  messages: ChatMessage[];
  groups: ChatGroup[];
  oratorDirectory: DirectoryOrator[];
  activityFeed: ActivityFeedItem[];
  habitLogs: ClientDailyHabitLog[];

  // Backend Connection State
  isBackendConnected: boolean;

  // Selected state
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedClient: Client | undefined;

  // Modals & Active actions
  isWorkoutLoggerOpen: boolean;
  activeWorkoutToLog: ScheduledWorkout | null;
  openWorkoutLogger: (workout: ScheduledWorkout) => void;
  closeWorkoutLogger: () => void;

  // Actions
  addClient: (client: Omit<Client, 'id' | 'workoutsCompleted' | 'totalWorkoutsAssigned' | 'complianceRate' | 'lastActive'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => Promise<boolean>;
  suspendClient: (id: string) => Promise<boolean>;
  reactivateClient: (id: string) => Promise<boolean>;
  addCoachNote: (clientId: string, note: string) => void;
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  saveProgram: (program: TrainingProgram) => void;
  deleteProgram: (id: string) => void;
  assignProgramToClient: (programId: string, clientId: string) => void;
  scheduleWorkout: (workout: Omit<ScheduledWorkout, 'id'>) => void;
  updateWorkoutLog: (workoutId: string, updates: Partial<ScheduledWorkout>) => void;
  completeWorkout: (workoutId: string, feedback: { clientFeedback?: string; coachFeedback?: string; rating?: number; durationMin?: number }) => void;
  addMetricEntry: (entry: Omit<MetricEntry, 'id'>) => void;
  addPersonalRecord: (pr: Omit<PersonalRecord, 'id'>) => void;
  sendMessage: (
    target: string | { clientId: string; sender?: 'coach' | 'client'; text?: string; content?: string; messageType?: string; attachmentData?: any },
    text?: string,
    attachment?: ChatMessage['attachment']
  ) => void;
  deleteMessage: (messageId: string) => Promise<void>;
  markMessagesRead: (clientId: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  createGroup: (name: string, description: string, memberIds: string[]) => Promise<ChatGroup | null>;
  startGroupCall: (groupId: string) => Promise<{ chamberRoomId: string; groupName: string } | null>;
  fetchGroups: () => Promise<ChatGroup[]>;
  fetchOratorDirectory: () => Promise<DirectoryOrator[]>;
  onlineClientIds: string[];
  onlineUserIds: string[];
  typingUsers: Record<string, { userId: string; userName: string; role: string; timestamp: number }>;
  sendTypingIndicator: (clientId: string, isTyping: boolean) => Promise<void>;
  toggleHabitCompletion: (clientId: string, date: string, habitId: string) => void;

  // Refresh data from API
  refreshFromBackend: () => Promise<void>;
  isLoading: boolean;

  // Theme State
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  resetThemeToSystem?: () => void;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Portal & Standard URL Routing
  currentPortal: PortalView;
  setCurrentPortal: (portal: PortalView) => void;
  currentPath: string;
  navigate: (path: string) => void;

  // Speaker Client App Profile & Onboarding
  activeSpeakerProfile: SpeakerOnboardingData | null;
  setActiveSpeakerProfile: (profile: SpeakerOnboardingData | null) => void;
  completeOnboarding: (data: SpeakerOnboardingData) => Promise<{ success: boolean; error?: string }>;
  loginSpeaker: (email: string, code?: string) => Promise<{ success: boolean; error?: string }>;
  sendSpeakerOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifySpeakerOtp: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  verifySpeakerMagicLink: (token: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (credential: string, role?: 'coach' | 'speaker') => Promise<{ success: boolean; error?: string; user?: any }>;
  resetOnboarding: () => void;

  // Faculty Directory, Referrals & Adjudication
  coaches: CoachItem[];
  fetchCoaches: () => Promise<CoachItem[]>;
  referredCoach: string | null;
  reassignClientCoach: (clientId: string, coachId: string, reason?: string) => Promise<boolean>;
  addAdjudicationNote: (clientId: string, note: string, rubricCategory?: string, rating?: number) => Promise<boolean>;
  currentCoachUser: { id: string; email: string; full_name: string; role: string; avatar?: string } | null;
  isAuthenticatedCoach: boolean;
  checkCoachEmail: (email: string) => Promise<{ exists: boolean; auth_method: 'password' | 'google' | 'both' | 'none'; role: string | null }>;
  loginCoach: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: any }>;
  registerCoach: (payload: { email: string; password: string; fullName: string; inviteCode?: string }) => Promise<{ success: boolean; error?: string; user?: any }>;
  addCoach: (data: { email: string; password: string; fullName: string; avatar?: string }) => Promise<{ success: boolean; error?: string; coach?: CoachItem }>;
  logout: () => void;
}



// No default speaker profile — user must authenticate or complete onboarding (H1 audit fix).

export const clientToSpeakerProfile = (client: Client): SpeakerOnboardingData => {
  const survey = (client.onboardingSurvey || {}) as Record<string, any>;
  return {
    branch: (client.branch || survey.branch || 'Academy') as BranchType,
    fullName: client.name || survey.fullName || '',
    email: client.email || survey.email || '',
    phone: client.phone || survey.phone || '',
    age: client.age || survey.age || undefined,
    institution: client.institution || survey.institution || '',
    primaryDiscipline: client.primaryDiscipline || survey.primaryDiscipline || '',
    coreFocus: client.coreFocus || survey.coreFocus || '',
    missionFocus: client.missionFocus || survey.missionFocus || client.goal || '',
    speakingGoal: client.goal || survey.speakingGoal || '',
    experienceLevel: client.experienceLevel || survey.experienceLevel || '',
    vocalBaselinePace: survey.vocalBaselinePace || client.currentWeightKg || undefined,
    emotionalOpennessRating: survey.emotionalOpennessRating || (client.catharsisScore ? Math.round(client.catharsisScore / 10) : undefined),
    selectedHabits: survey.selectedHabits && Array.isArray(survey.selectedHabits) ? survey.selectedHabits : [],
    bioNotes: survey.bioNotes || (client.customCoachNotes && client.customCoachNotes[0]) || ''
  };
};

export const isProfileOnboarded = (client: Client | null | undefined): boolean => {
  if (!client) return false;
  const survey = (client.onboardingSurvey || {}) as Record<string, any>;
  const hasSurveyContent = Boolean(
    survey &&
    Object.keys(survey).length > 0 &&
    (survey.speakingGoal || survey.speaking_goal || survey.branch || survey.primaryDiscipline || survey.primary_discipline)
  );
  const hasGoal = Boolean(client.goal && client.goal.trim().length > 0);
  if ((client.status as string) === 'Pending Onboarding' && !hasSurveyContent && !hasGoal) {
    return false;
  }
  return hasSurveyContent || hasGoal;
};

const getSavedTheme = (): 'light' | 'dark' | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('globalorators_theme') || localStorage.getItem('nubianfit_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // ignore storage restrictions
  }
  return null;
};

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }
  return 'light';
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Standard URL Path Routing & Hash Normalization
  const [currentPath, setCurrentPathState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase().replace('#', '');
      let resolvedPath = pathname || '/';

      // Normalize legacy hash navigation (e.g. /#academy -> /academy)
      if (hash === 'academy') resolvedPath = '/academy';
      else if (hash === 'foundation') resolvedPath = '/foundation';
      else if (hash === 'mission' || hash === 'about') resolvedPath = '/about';
      else if (hash === 'escapism') resolvedPath = '/escapism';
      else if (hash === 'championships' || hash === 'tournaments') resolvedPath = '/tournaments';
      else if (hash === 'testimonials') resolvedPath = '/testimonials';

      if (hash && window.history) {
        window.history.replaceState({}, '', resolvedPath);
      }
      return resolvedPath;
    }
    return '/';
  });

  // Portal & Subdomain Routing
  const [currentPortal, setCurrentPortalState] = useState<PortalView>(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname.toLowerCase();
      if (hostname.startsWith('coach.')) return 'coach_os';
      if (hostname.startsWith('app.')) return 'speaker_app';
      if (hostname === 'globaloratorsproject.com' || hostname === 'www.globaloratorsproject.com') {
        const pathname = window.location.pathname.toLowerCase();
        if (pathname === '/onboarding' || pathname === '/apply') return 'onboarding';
        return 'landing';
      }

      const pathname = window.location.pathname.toLowerCase();
      if (pathname === '/coach' || pathname === '/coach_os') return 'coach_os';
      if (pathname === '/app' || pathname === '/speaker' || pathname === '/speaker_app') return 'speaker_app';
      if (pathname === '/onboarding' || pathname === '/apply') return 'onboarding';

      const params = new URLSearchParams(window.location.search);
      if (params.has('magic_token') || params.has('token')) return 'speaker_app';
      const portalParam = params.get('portal');
      if (portalParam === 'coach' || portalParam === 'coach_os') return 'coach_os';
      if (portalParam === 'app' || portalParam === 'speaker_app') return 'speaker_app';
      if (portalParam === 'onboarding' || portalParam === 'apply') return 'onboarding';
      if (portalParam === 'landing') return 'landing';
    }
    const saved = localStorage.getItem('globalorators_portal');
    if (saved && ['landing', 'speaker_app', 'coach_os', 'onboarding'].includes(saved)) {
      return saved as PortalView;
    }
    return 'landing';
  });

  const navigate = useCallback((to: string) => {
    if (typeof window !== 'undefined') {
      let cleanPath = to.startsWith('/') ? to : `/${to}`;
      if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.slice(0, -1);
      }
      if (window.history) {
        window.history.pushState({}, '', cleanPath);
      }
      setCurrentPathState(cleanPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Synchronize portal state
      if (cleanPath === '/onboarding' || cleanPath === '/apply') {
        setCurrentPortalState('onboarding');
      } else if (cleanPath === '/coach' || cleanPath === '/coach_os') {
        setCurrentPortalState('coach_os');
      } else if (cleanPath === '/app' || cleanPath === '/speaker' || cleanPath === '/speaker_app') {
        setCurrentPortalState('speaker_app');
      } else {
        setCurrentPortalState('landing');
      }
    }
  }, []);

  // Listen for browser forward/back buttons (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const pathname = window.location.pathname.toLowerCase() || '/';
      setCurrentPathState(pathname);
      if (pathname === '/onboarding' || pathname === '/apply') {
        setCurrentPortalState('onboarding');
      } else if (pathname === '/coach' || pathname === '/coach_os') {
        setCurrentPortalState('coach_os');
      } else if (pathname === '/app' || pathname === '/speaker' || pathname === '/speaker_app') {
        setCurrentPortalState('speaker_app');
      } else {
        setCurrentPortalState('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setCurrentPortal = useCallback((portal: PortalView) => {
    setCurrentPortalState(portal);
    localStorage.setItem('globalorators_portal', portal);
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname.toLowerCase();
      const isCustomDomain = hostname.includes('globaloratorsproject.com');

      if (isCustomDomain) {
        if (portal === 'coach_os' && !hostname.startsWith('coach.')) {
          window.location.href = 'https://coach.globaloratorsproject.com';
          return;
        }
        if (portal === 'speaker_app' && !hostname.startsWith('app.')) {
          window.location.href = 'https://app.globaloratorsproject.com';
          return;
        }
        if (portal === 'landing' && (hostname.startsWith('coach.') || hostname.startsWith('app.'))) {
          window.location.href = 'https://globaloratorsproject.com';
          return;
        }
        if (portal === 'onboarding' && (hostname.startsWith('coach.') || hostname.startsWith('app.'))) {
          window.location.href = 'https://globaloratorsproject.com/onboarding';
          return;
        }
      }

      if (window.history) {
        let targetPath = '/';
        if (portal === 'coach_os') targetPath = '/coach';
        else if (portal === 'speaker_app') targetPath = '/speaker';
        else if (portal === 'onboarding') targetPath = '/onboarding';
        else targetPath = '/';

        setCurrentPathState(targetPath);
        window.history.pushState({}, '', targetPath);
      }
    }
  }, []);

  // Speaker Client App Profile & Onboarding
  const [activeSpeakerProfile, setActiveSpeakerProfile] = useState<SpeakerOnboardingData | null>(() => {
    const saved = localStorage.getItem('globalorators_speaker_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem('globalorators_speaker_profile');
    setActiveSpeakerProfile(null);
    setCurrentPortal('onboarding');
  }, [setCurrentPortal]);


  // Business collections initialize empty — populated exclusively from API (C1, H7 audit fix)
  const [clients, setClients] = useState<Client[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [metrics, setMetrics] = useState<MetricEntry[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [habitLogs, setHabitLogs] = useState<ClientDailyHabitLog[]>([]);
  const [onlineClientIds, setOnlineClientIds] = useState<string[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, { userId: string; userName: string; role: string; timestamp: number }>>({});

  // Periodic cleanup for typing indicators (clear after 4 seconds of inactivity)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => {
        let changed = false;
        const next = { ...prev };
        for (const [key, val] of Object.entries(next)) {
          if (val && now - (val as { timestamp: number }).timestamp > 4000) {
            delete next[key];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Faculty Coaches & Referrals
  const [coaches, setCoaches] = useState<CoachItem[]>([]);
  const [referredCoach, setReferredCoach] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('coach') || params.get('ref') || params.get('coach_ref') || null;
    }
    return null;
  });

  const fetchCoaches = useCallback(async (): Promise<CoachItem[]> => {
    try {
      const res = await coachesApi.getAll();
      if (Array.isArray(res)) {
        setCoaches(res);
        return res;
      }
      return [];
    } catch (err) {
      console.warn('Could not load faculty directory:', err);
      return [];
    }
  }, []);

  // WhatsApp-style Orator Syndicates & Group Calls
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [oratorDirectory, setOratorDirectory] = useState<DirectoryOrator[]>([]);

  const fetchGroups = useCallback(async (): Promise<ChatGroup[]> => {
    try {
      const res = await groupsApi?.getAll?.();
      if (Array.isArray(res)) {
        setGroups(res);
        return res;
      }
      return [];
    } catch (err) {
      console.warn('Could not load syndicate groups:', err);
      return [];
    }
  }, []);

  const fetchOratorDirectory = useCallback(async (): Promise<DirectoryOrator[]> => {
    try {
      const res = await clientsApi?.getDirectory?.();
      if (Array.isArray(res)) {
        setOratorDirectory(res);
        return res;
      }
      return [];
    } catch (err) {
      console.warn('Could not load orator directory:', err);
      return [];
    }
  }, []);

  const createGroup = async (name: string, description: string, memberIds: string[]): Promise<ChatGroup | null> => {
    try {
      const created = await groupsApi?.create?.({ name, description, member_ids: memberIds });
      if (created) {
        setGroups(prev => [created, ...prev.filter(g => g.id !== created.id)]);
        showToast(`Syndicate "${created.name}" created.`);
        return created;
      }
      return null;
    } catch (err) {
      console.error('Failed to create syndicate group:', err);
      showToast('Failed to create group.');
      return null;
    }
  };

  const startGroupCall = async (groupId: string): Promise<{ chamberRoomId: string; groupName: string } | null> => {
    try {
      const res = await groupsApi?.startCall?.(groupId);
      if (res?.chamberRoomId) {
        return { chamberRoomId: res.chamberRoomId, groupName: res.groupName };
      }
      return null;
    } catch (err) {
      console.error('Failed to initiate syndicate call:', err);
      showToast('Failed to start group call.');
      return null;
    }
  };

  const [currentCoachUser, setCurrentCoachUser] = useState<{ id: string; email: string; full_name: string; role: string; avatar?: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem('globalorators_token') || localStorage.getItem('nubianfit_token');
      if (!token) return null;
      const savedUserStr = localStorage.getItem('globalorators_user') || localStorage.getItem('nubianfit_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u && u.role === 'coach') return u;
        if (u && u.role === 'speaker') return null;
      }
      return { id: 'coach-session', email: '', full_name: 'Faculty Coach', role: 'coach', avatar: '', is_active: true };
    } catch {
      return null;
    }
  });

  const isAuthenticatedCoach = Boolean(
    currentCoachUser ||
    (typeof window !== 'undefined' &&
      Boolean(localStorage.getItem('globalorators_token') || localStorage.getItem('nubianfit_token')) &&
      (() => {
        try {
          const u = localStorage.getItem('globalorators_user') || localStorage.getItem('nubianfit_user');
          return u ? JSON.parse(u)?.role === 'coach' : true;
        } catch {
          return true;
        }
      })()
    )
  );

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isWorkoutLoggerOpen, setIsWorkoutLoggerOpen] = useState<boolean>(false);
  const [activeWorkoutToLog, setActiveWorkoutToLog] = useState<ScheduledWorkout | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = getSavedTheme();
    if (saved) return saved;
    return getSystemTheme();
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('globalorators_theme', next);
        localStorage.setItem('nubianfit_theme', next);
      } catch {
        // ignore storage restrictions
      }
      return next;
    });
  };

  const resetThemeToSystem = () => {
    try {
      localStorage.removeItem('globalorators_theme');
      localStorage.removeItem('nubianfit_theme');
    } catch {
      // ignore storage restrictions
    }
    setTheme(getSystemTheme());
  };

  // Sync with system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const saved = getSavedTheme();
      if (!saved) {
        setTheme(getSystemTheme());
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Set html class on theme change
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);



  // localStorage sync removed for business data (H7 audit fix).
  // Business records (clients, exercises, programs, workouts, metrics, messages, habits)
  // are sourced exclusively from the API. Only preferences (theme, portal) and
  // auth tokens remain in localStorage.

  // Fetch initial data from FastAPI backend
  const refreshFromBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      // Require an existing auth token — no auto-login with hardcoded credentials (C2 audit fix)
      const token = localStorage.getItem('globalorators_token') || localStorage.getItem('nubianfit_token');
      if (!token) {
        // No token: skip API sync, UI will show empty/login state
        setIsLoading(false);
        return;
      }

      const results = await Promise.allSettled([
        clientsApi.getAll(),
        exercisesApi.getAll(),
        programsApi.getAll(),
        workoutsApi.getAll(),
        metricsApi.getAll(),
        prsApi.getAll(),
        habitsApi.getAll(),
        photosApi.getAll(),
        messagesApi.getAll(),
        activityApi.getAll(),
        coachesApi.getAll(),
        groupsApi?.getAll ? groupsApi.getAll() : Promise.resolve([]),
        clientsApi?.getDirectory ? clientsApi.getDirectory() : Promise.resolve([]),
      ]);

      const [
        clientsRes,
        exercisesRes,
        programsRes,
        workoutsRes,
        metricsRes,
        prsRes,
        habitsRes,
        photosRes,
        messagesRes,
        activityRes,
        coachesRes,
        groupsRes,
        directoryRes
      ] = results;

      const failedEndpoints: string[] = [];

      if (groupsRes.status === 'fulfilled') {
        setGroups(groupsRes.value || []);
      }

      if (directoryRes.status === 'fulfilled') {
        setOratorDirectory(directoryRes.value || []);
      }

      if (coachesRes.status === 'fulfilled') {
        setCoaches(coachesRes.value || []);
      }

      // Always set state from API response, including empty arrays (C1 audit fix)
      if (clientsRes.status === 'fulfilled') {
        const loadedClients = clientsRes.value || [];
        setClients(loadedClients);
        setSelectedClientId(prev => {
          if (prev && loadedClients.some(c => c.id === prev)) return prev;
          return loadedClients.length > 0 ? loadedClients[0].id : null;
        });
      } else {
        failedEndpoints.push('speakers');
        console.error('Failed to sync speakers from API:', clientsRes.reason);
      }

      if (exercisesRes.status === 'fulfilled') {
        setExercises(exercisesRes.value || []);
      } else {
        failedEndpoints.push('drills');
        console.error('Failed to sync drills from API:', exercisesRes.reason);
      }

      if (programsRes.status === 'fulfilled') {
        setPrograms(programsRes.value || []);
      } else {
        failedEndpoints.push('curriculums');
        console.error('Failed to sync curriculums from API:', programsRes.reason);
      }

      if (workoutsRes.status === 'fulfilled') {
        setScheduledWorkouts(workoutsRes.value || []);
      } else {
        failedEndpoints.push('rehearsals');
        console.error('Failed to sync rehearsals from API:', workoutsRes.reason);
      }

      if (metricsRes.status === 'fulfilled') {
        setMetrics(metricsRes.value || []);
      } else {
        console.error('Failed to sync metrics from API:', metricsRes.reason);
      }

      if (prsRes.status === 'fulfilled') {
        setPersonalRecords(prsRes.value || []);
      } else {
        console.error('Failed to sync personal records from API:', prsRes.reason);
      }

      if (habitsRes.status === 'fulfilled') {
        setHabitLogs(habitsRes.value || []);
      } else {
        console.error('Failed to sync habits from API:', habitsRes.reason);
      }

      if (photosRes.status === 'fulfilled') {
        setPhotos(photosRes.value || []);
      } else {
        console.error('Failed to sync photos from API:', photosRes.reason);
      }

      if (messagesRes.status === 'fulfilled') {
        setMessages(messagesRes.value || []);
      } else {
        console.error('Failed to sync messages from API:', messagesRes.reason);
      }

      if (activityRes.status === 'fulfilled') {
        setActivityFeed(activityRes.value || []);
      } else {
        console.error('Failed to sync activity from API:', activityRes.reason);
      }

      try {
        const presence = await messagesApi.getPresence();
        if (presence?.onlineClientIds) setOnlineClientIds(presence.onlineClientIds);
        if (presence?.onlineUserIds) setOnlineUserIds(presence.onlineUserIds);
      } catch {
        // Non-blocking presence fetch
      }

      // Bind identity hydration strictly to authenticated server identity (H1/M3)
      let serverUser: any = null;
      try {
        serverUser = await authApi.me();
      } catch {
        // Not authenticated with authApi.me()
      }

      if (serverUser && serverUser.role === 'coach') {
        setCurrentCoachUser(serverUser);
        localStorage.setItem('globalorators_user', JSON.stringify(serverUser));
      } else {
        try {
          const me = await clientsApi.getMe();
          if (me && isProfileOnboarded(me)) {
            const profile = clientToSpeakerProfile(me);
            setActiveSpeakerProfile(profile);
            localStorage.setItem('globalorators_speaker_profile', JSON.stringify(profile));
          } else {
            setActiveSpeakerProfile(null);
            localStorage.removeItem('globalorators_speaker_profile');
          }
        } catch {
          setActiveSpeakerProfile(null);
          localStorage.removeItem('globalorators_speaker_profile');
        }
      }

      if (failedEndpoints.length > 0) {
        setIsBackendConnected(false);
        showToast(`Unable to load ${failedEndpoints.join(', ')}. Check your connection.`);
      } else {
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.error('Backend synchronization failure:', err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  // Real-Time Server-Sent Events (SSE) Stream Connection
  useEffect(() => {
    const token = localStorage.getItem('globalorators_token') || localStorage.getItem('nubianfit_token');
    if (!token) return;

    const disconnect = startEventStream({
      token,
      onNewMessage: (incomingMsg: any) => {
        setMessages(prev => {
          // 1. Exact match by message ID -> update in place
          const exactIndex = prev.findIndex(m => m.id === incomingMsg.id);
          if (exactIndex !== -1) {
            const copy = [...prev];
            copy[exactIndex] = { ...prev[exactIndex], ...incomingMsg, isRead: prev[exactIndex].isRead || incomingMsg.isRead };
            return copy;
          }

          // 2. ClientMsgId match -> replaces pending optimistic message
          if (incomingMsg.clientMsgId) {
            const clientMsgIndex = prev.findIndex(m => m.id === incomingMsg.clientMsgId);
            if (clientMsgIndex !== -1) {
              const copy = [...prev];
              copy[clientMsgIndex] = { ...incomingMsg, isRead: prev[clientMsgIndex].isRead || incomingMsg.isRead };
              return copy;
            }
          }

          // 3. Heuristic deduplication for self-sent messages:
          // If the incoming message has identical text, sender, and clientId as a pending message, replace it
          const heuristicIndex = prev.findIndex(m =>
            m.clientId === incomingMsg.clientId &&
            m.sender === incomingMsg.sender &&
            m.text === incomingMsg.text &&
            (m.id.startsWith('msg-') || m.id.startsWith('temp-'))
          );
          if (heuristicIndex !== -1 && incomingMsg.sender === (currentCoachUser ? 'coach' : 'client')) {
            const copy = [...prev];
            copy[heuristicIndex] = { ...incomingMsg, isRead: prev[heuristicIndex].isRead || incomingMsg.isRead };
            return copy;
          }

          return [...prev, incomingMsg];
        });

        if (incomingMsg.sender === 'client' && currentCoachUser) {
          showToast(`New message from speaker: ${incomingMsg.text.slice(0, 40)}`);
        } else if (incomingMsg.sender === 'coach' && activeSpeakerProfile) {
          showToast(`Coach feedback: ${incomingMsg.text.slice(0, 40)}`);
        }
      },
      onMessageDeleted: (data) => {
        if (data.messageId) {
          setMessages(prev => prev.filter(m => m.id !== data.messageId));
        }
      },
      onMessagesRead: (data) => {
        if (data.clientId) {
          setMessages(prev => prev.map(m => m.clientId === data.clientId ? { ...m, isRead: true } : m));
        }
      },
      onMessageReaction: (data) => {
        if (data.messageId && data.reactions) {
          setMessages(prev => prev.map(m => {
            if (m.id !== data.messageId) return m;
            const att = { ...(m.attachment || { type: 'text' }), reactions: data.reactions };
            return { ...m, attachment: att };
          }));
        }
      },
      onPresence: (data) => {
        if (data.clientId) {
          setOnlineClientIds(prev => {
            if (data.status === 'online') {
              return prev.includes(data.clientId!) ? prev : [...prev, data.clientId!];
            } else {
              return prev.filter(id => id !== data.clientId);
            }
          });
        }
        if (data.userId) {
          setOnlineUserIds(prev => {
            if (data.status === 'online') {
              return prev.includes(data.userId) ? prev : [...prev, data.userId];
            } else {
              return prev.filter(id => id !== data.userId);
            }
          });
        }
      },
      onRosterUpdated: () => {
        refreshFromBackend();
      },
      onClientUpdated: (data) => {
        if (data.clientId) {
          setClients(prev => prev.map(c => c.id === data.clientId ? { 
            ...c, 
            status: (data.status as any) || c.status, 
            coachId: data.coachId !== undefined ? data.coachId : c.coachId 
          } : c));
        }
      },
      onGroupCreated: (group: any) => {
        if (group?.id) {
          setGroups(prev => [group, ...prev.filter(g => g.id !== group.id)]);
          showToast(`New Syndicate created: "${group.name}"`);
        }
      },
      onGroupCallStarted: (data: any) => {
        if (data?.groupName) {
          showToast(`Chamber Call active in "${data.groupName}"`);
        }
      },
      onTyping: (data) => {
        if (!data?.clientId || !data?.userId) return;
        const myId = currentCoachUser?.id || activeSpeakerProfile?.id;
        if (myId && data.userId === myId) return;

        setTypingUsers(prev => {
          if (!data.isTyping) {
            const next = { ...prev };
            delete next[data.clientId];
            return next;
          }
          return {
            ...prev,
            [data.clientId]: {
              userId: data.userId,
              userName: data.userName || 'Someone',
              role: data.role || 'user',
              timestamp: Date.now()
            }
          };
        });
      },
      onActivity: (activity) => {
        setActivityFeed(prev => [activity, ...prev]);
      }
    });

    return () => {
      disconnect();
    };
  }, [currentCoachUser, activeSpeakerProfile, showToast, refreshFromBackend]);

  const logout = useCallback(() => {
    clearAuthSession();
    setActiveSpeakerProfile(null);
    setCurrentCoachUser(null);
    setClients([]);
    setPrograms([]);
    setScheduledWorkouts([]);
    setMetrics([]);
    setPersonalRecords([]);
    setHabitLogs([]);
    setPhotos([]);
    setMessages([]);
    setActivityFeed([]);
    setSelectedClientId(null);
    if (currentPortal !== 'coach_os') {
      setCurrentPortal('landing');
    }
  }, [currentPortal, setCurrentPortal]);

  useEffect(() => {
    const handleSessionCleared = () => {
      setActiveSpeakerProfile(null);
      setCurrentCoachUser(null);
      setClients([]);
      setPrograms([]);
      setScheduledWorkouts([]);
      setMetrics([]);
      setPersonalRecords([]);
      setHabitLogs([]);
      setPhotos([]);
      setMessages([]);
      setActivityFeed([]);
      setSelectedClientId(null);
      if (currentPortal !== 'coach_os') {
        setCurrentPortal('landing');
      }
    };
    window.addEventListener('auth:session_cleared', handleSessionCleared);
    return () => {
      window.removeEventListener('auth:session_cleared', handleSessionCleared);
    };
  }, [currentPortal, setCurrentPortal]);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const openWorkoutLogger = (workout: ScheduledWorkout) => {
    setActiveWorkoutToLog(workout);
    setIsWorkoutLoggerOpen(true);
  };

  const closeWorkoutLogger = () => {
    setIsWorkoutLoggerOpen(false);
    setActiveWorkoutToLog(null);
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'workoutsCompleted' | 'totalWorkoutsAssigned' | 'complianceRate' | 'lastActive'>) => {
    const tempId = `client-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id: tempId,
      workoutsCompleted: 0,
      totalWorkoutsAssigned: 0,
      complianceRate: 100,
      lastActive: 'Just registered'
    };

    // Optimistic UI update
    setClients(prev => [newClient, ...prev]);
    setSelectedClientId(newClient.id);

    // Activity feed item
    setActivityFeed(prev => [
      {
        id: `act-${Date.now()}`,
        type: 'check_in_submitted',
        clientId: newClient.id,
        clientName: newClient.name,
        clientAvatar: newClient.avatar,
        title: 'New Client Onboarded',
        description: `Enrolled for ${newClient.goal} coaching`,
        timestamp: 'Just now'
      },
      ...prev
    ]);
    showToast(`Client ${newClient.name} added successfully!`);

    // Sync to Backend
    try {
      const created = await clientsApi.create(clientData);
      if (created?.id) {
        setClients(prev => prev.map(c => c.id === tempId ? created : c));
        setSelectedClientId(created.id);
      }
    } catch (err) {
      console.warn('Backend sync failed for addClient:', err);
      setClients(prev => prev.filter(c => c.id !== tempId));
      showToast('Failed to save speaker to server. Reverting changes.');
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const originalClient = clients.find(c => c.id === id);
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    try {
      await clientsApi.update(id, updates);
      showToast('Speaker details updated.');
    } catch (err) {
      console.warn('Backend sync failed for updateClient:', err);
      if (originalClient) {
        setClients(prev => prev.map(c => c.id === id ? originalClient : c));
      }
      showToast('Failed to update speaker on server. Reverting changes.');
    }
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    const originalClient = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));

    try {
      await clientsApi.delete(id);
      showToast('Speaker removed from roster.');
      return true;
    } catch (err) {
      console.warn('Backend sync failed for deleteClient:', err);
      if (originalClient) {
        setClients(prev => [...prev, originalClient]);
      }
      showToast('Failed to remove speaker. Reverting.');
      return false;
    }
  };

  const suspendClient = async (id: string): Promise<boolean> => {
    const originalClient = clients.find(c => c.id === id);
    setClients(prev => prev.map(c => c.id === id ? { ...c, status: 'Suspended' as any } : c));

    try {
      await clientsApi.update(id, { status: 'Suspended' as any });
      showToast('Speaker suspended.');
      return true;
    } catch (err) {
      console.warn('Backend sync failed for suspendClient:', err);
      if (originalClient) {
        setClients(prev => prev.map(c => c.id === id ? originalClient : c));
      }
      showToast('Failed to suspend speaker. Reverting.');
      return false;
    }
  };

  const reactivateClient = async (id: string): Promise<boolean> => {
    const originalClient = clients.find(c => c.id === id);
    setClients(prev => prev.map(c => c.id === id ? { ...c, status: 'Active' as any } : c));

    try {
      await clientsApi.update(id, { status: 'Active' as any });
      showToast('Speaker reactivated.');
      return true;
    } catch (err) {
      console.warn('Backend sync failed for reactivateClient:', err);
      if (originalClient) {
        setClients(prev => prev.map(c => c.id === id ? originalClient : c));
      }
      showToast('Failed to reactivate speaker. Reverting.');
      return false;
    }
  };

  const addCoachNote = async (clientId: string, note: string) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          customCoachNotes: [note, ...c.customCoachNotes]
        };
      }
      return c;
    }));

    try {
      await clientsApi.addNote(clientId, note);
      showToast('Coach note added.');
    } catch (err) {
      console.warn('Backend sync failed for addCoachNote:', err);
      setClients(prev => prev.map(c => {
        if (c.id === clientId) {
          return {
            ...c,
            customCoachNotes: c.customCoachNotes.filter(n => n !== note)
          };
        }
        return c;
      }));
      showToast('Failed to save note to server. Reverting note.');
    }
  };

  const reassignClientCoach = useCallback(async (clientId: string, coachId: string, reason?: string): Promise<boolean> => {
    try {
      const updated = await clientsApi.reassignCoach(clientId, coachId, reason);
      if (updated && updated.id) {
        setClients(prev => prev.map(c => c.id === clientId ? updated : c));
        showToast(`Speaker reassigned successfully.`);
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err?.message || 'Failed to reassign speaker.');
      return false;
    }
  }, [showToast]);

  const addAdjudicationNote = useCallback(async (clientId: string, note: string, rubricCategory?: string, rating?: number): Promise<boolean> => {
    try {
      const updated = await clientsApi.addAdjudicationNote(clientId, note, rubricCategory, rating);
      if (updated && updated.id) {
        setClients(prev => prev.map(c => c.id === clientId ? updated : c));
        showToast(`Panel adjudication feedback recorded.`);
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err?.message || 'Failed to record adjudication note.');
      return false;
    }
  }, [showToast]);


  const addExercise = async (exerciseData: Omit<Exercise, 'id'>) => {
    const tempId = `ex-${Date.now()}`;
    const newEx: Exercise = {
      ...exerciseData,
      id: tempId,
      isCustom: true
    };
    setExercises(prev => [newEx, ...prev]);
    showToast(`Speech drill "${newEx.name}" added to library.`);

    try {
      const created = await exercisesApi.create(exerciseData);
      if (created?.id) {
        setExercises(prev => prev.map(e => e.id === tempId ? created : e));
      }
    } catch (err) {
      console.warn('Backend sync failed for addExercise:', err);
      setExercises(prev => prev.filter(e => e.id !== tempId));
      showToast('Failed to save drill to server. Reverting changes.');
    }
  };

  const saveProgram = async (prog: TrainingProgram) => {
    const previousPrograms = [...programs];
    setPrograms(prev => {
      const idx = prev.findIndex(p => p.id === prog.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...prog, updatedAt: new Date().toISOString().split('T')[0] };
        return next;
      } else {
        return [{ ...prog, id: prog.id || `prog-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] }, ...prev];
      }
    });

    try {
      await programsApi.save(prog);
      showToast(`Curriculum "${prog.title}" saved!`);
    } catch (err) {
      console.warn('Backend sync failed for saveProgram:', err);
      setPrograms(previousPrograms);
      showToast('Failed to save curriculum to server. Reverting changes.');
    }
  };

  const deleteProgram = async (id: string) => {
    const targetProgram = programs.find(p => p.id === id);
    setPrograms(prev => prev.filter(p => p.id !== id));

    try {
      await programsApi.delete(id);
      showToast('Curriculum deleted.');
    } catch (err) {
      console.warn('Backend sync failed for deleteProgram:', err);
      if (targetProgram) {
        setPrograms(prev => [...prev, targetProgram]);
      }
      showToast('Failed to delete curriculum on server. Reverting.');
    }
  };

  const assignProgramToClient = async (programId: string, clientId: string) => {
    const targetProgram = programs.find(p => p.id === programId);
    const targetClient = clients.find(c => c.id === clientId);
    if (!targetProgram || !targetClient) return;

    try {
      await programsApi.assign(programId, clientId);
      await refreshFromBackend();
      showToast(`Assigned "${targetProgram.title}" to ${targetClient.name}!`);
    } catch (err) {
      console.warn('Backend sync failed for assignProgramToClient:', err);
      showToast('Failed to assign curriculum on server. Reverting.');
    }
  };

  const scheduleWorkout = async (workoutData: Omit<ScheduledWorkout, 'id'>) => {
    const tempId = `sched-${Date.now()}`;
    const newSched: ScheduledWorkout = {
      ...workoutData,
      id: tempId
    };
    setScheduledWorkouts(prev => [newSched, ...prev]);
    showToast(`Rehearsal session "${newSched.workoutTitle}" scheduled for ${newSched.date}.`);

    try {
      const created = await workoutsApi.create(workoutData);
      if (created?.id) {
        setScheduledWorkouts(prev => prev.map(w => w.id === tempId ? created : w));
      }
    } catch (err) {
      console.warn('Backend sync failed for scheduleWorkout:', err);
      setScheduledWorkouts(prev => prev.filter(w => w.id !== tempId));
      showToast('Failed to schedule session on server. Reverting changes.');
    }
  };

  const updateWorkoutLog = async (workoutId: string, updates: Partial<ScheduledWorkout>) => {
    const originalWorkout = scheduledWorkouts.find(w => w.id === workoutId);
    setScheduledWorkouts(prev => prev.map(w => w.id === workoutId ? { ...w, ...updates } : w));

    try {
      await workoutsApi.update(workoutId, updates);
    } catch (err) {
      console.warn('Backend sync failed for updateWorkoutLog:', err);
      if (originalWorkout) {
        setScheduledWorkouts(prev => prev.map(w => w.id === workoutId ? originalWorkout : w));
      }
      showToast('Failed to update session on server. Reverting changes.');
    }
  };

  const completeWorkout = async (workoutId: string, feedback: { clientFeedback?: string; coachFeedback?: string; rating?: number; durationMin?: number }) => {
    const target = scheduledWorkouts.find(w => w.id === workoutId);
    if (!target) return;

    const updatedWorkout: ScheduledWorkout = {
      ...target,
      status: 'Completed',
      durationMin: feedback.durationMin || target.durationMin || 55,
      rating: feedback.rating || 5,
      clientFeedback: feedback.clientFeedback || target.clientFeedback || 'Great rehearsal session completed!',
      coachFeedback: feedback.coachFeedback || target.coachFeedback || 'Excellent delivery and pacing consistency.'
    };

    setScheduledWorkouts(prev => prev.map(w => w.id === workoutId ? updatedWorkout : w));

    setClients(prev => prev.map(c => {
      if (c.id === target.clientId) {
        const completed = c.workoutsCompleted + 1;
        const total = c.totalWorkoutsAssigned || completed;
        const compliance = Math.min(100, Math.round((completed / total) * 100));
        return {
          ...c,
          workoutsCompleted: completed,
          complianceRate: compliance,
          lastActive: 'Just now'
        };
      }
      return c;
    }));

    setActivityFeed(prev => [
      {
        id: `act-${Date.now()}`,
        type: 'workout_completed',
        clientId: target.clientId,
        clientName: target.clientName,
        clientAvatar: target.clientAvatar,
        title: `Speech Session Logged: ${target.workoutTitle}`,
        description: `Completed with ${feedback.rating || 5}/5 delivery score rating`,
        timestamp: 'Just now'
      },
      ...prev
    ]);

    try {
      await workoutsApi.complete(workoutId, {
        clientFeedback: updatedWorkout.clientFeedback,
        coachFeedback: updatedWorkout.coachFeedback,
        rating: updatedWorkout.rating,
        durationMin: updatedWorkout.durationMin,
        exercises: target.exercises,
      });
      showToast(`Rehearsal session "${target.workoutTitle}" marked completed! 🎙️`);
    } catch (err) {
      console.warn('Backend sync failed for completeWorkout:', err);
      setScheduledWorkouts(prev => prev.map(w => w.id === workoutId ? target : w));
      showToast('Failed to complete session on server. Reverting status.');
    }
  };

  const addMetricEntry = async (entryData: Omit<MetricEntry, 'id'>) => {
    const tempId = `m-${Date.now()}`;
    const newEntry: MetricEntry = {
      ...entryData,
      id: tempId
    };

    setMetrics(prev => [newEntry, ...prev]);

    setClients(prev => prev.map(c => {
      if (c.id === entryData.clientId) {
        return {
          ...c,
          currentWeightKg: entryData.weightKg,
          bodyFatPercentage: entryData.bodyFatPercentage || c.bodyFatPercentage,
          lastActive: 'Just now'
        };
      }
      return c;
    }));

    const client = clients.find(c => c.id === entryData.clientId);
    if (client) {
      setActivityFeed(prev => [
        {
          id: `act-${Date.now()}`,
          type: 'check_in_submitted',
          clientId: client.id,
          clientName: client.name,
          clientAvatar: client.avatar,
          title: 'Speech Metric Logged',
          description: `${entryData.weightKg} WPM cadence • ${entryData.bodyFatPercentage}% fluency score`,
          timestamp: 'Just now',
          metadata: { weightKg: entryData.weightKg }
        },
        ...prev
      ]);
    }

    try {
      const created = await metricsApi.create(entryData);
      if (created?.id) {
        setMetrics(prev => prev.map(m => m.id === tempId ? created : m));
      }
      showToast(`Delivery metric recorded: ${entryData.weightKg} WPM.`);
    } catch (err) {
      console.warn('Backend sync failed for addMetricEntry:', err);
      setMetrics(prev => prev.filter(m => m.id !== tempId));
      showToast('Failed to record delivery metric on server. Reverting.');
    }
  };

  const addPersonalRecord = async (prData: Omit<PersonalRecord, 'id'>) => {
    const tempId = `pr-${Date.now()}`;
    const newPr: PersonalRecord = {
      ...prData,
      id: tempId
    };

    setPersonalRecords(prev => [newPr, ...prev]);

    const client = clients.find(c => c.id === prData.clientId);
    if (client) {
      setActivityFeed(prev => [
        {
          id: `act-${Date.now()}`,
          type: 'pr_achieved',
          clientId: client.id,
          clientName: client.name,
          clientAvatar: client.avatar,
          title: `Speech Milestone: ${prData.exerciseName}`,
          description: `${prData.weightKg} WPM cadence over ${prData.reps} speeches/rounds`,
          timestamp: 'Just now',
          metadata: { weightKg: prData.weightKg, exerciseName: prData.exerciseName }
        },
        ...prev
      ]);
    }

    try {
      const created = await prsApi.create(prData);
      if (created?.id) {
        setPersonalRecords(prev => prev.map(p => p.id === tempId ? created : p));
      }
      showToast(`Speech milestone logged for ${prData.exerciseName}! 🎯`);
    } catch (err) {
      console.warn('Backend sync failed for addPersonalRecord:', err);
      setPersonalRecords(prev => prev.filter(p => p.id !== tempId));
      showToast('Failed to save milestone on server. Reverting.');
    }
  };

  const addProgressPhoto = async (photoData: Omit<ProgressPhoto, 'id'>) => {
    const tempId = `photo-${Date.now()}`;
    const newPhoto: ProgressPhoto = {
      ...photoData,
      id: tempId
    };

    setPhotos(prev => [newPhoto, ...prev]);

    try {
      const created = await photosApi.create(photoData);
      if (created?.id) {
        setPhotos(prev => prev.map(p => p.id === tempId ? created : p));
      }
      showToast('Stage check-in photo uploaded successfully.');
    } catch (err) {
      console.warn('Backend sync failed for addProgressPhoto:', err);
      setPhotos(prev => prev.filter(p => p.id !== tempId));
      showToast('Failed to save photo on server. Reverting.');
    }
  };

  const sendMessage = async (
    target: string | { clientId: string; sender?: 'coach' | 'client'; text?: string; content?: string; messageType?: string; attachmentData?: any },
    textParam?: string,
    attachmentParam?: ChatMessage['attachment']
  ) => {
    let clientId: string = '';
    let text: string = '';
    let sender: 'coach' | 'client' = 'coach';
    let attachment: ChatMessage['attachment'] = attachmentParam;

    if (typeof target === 'object' && target !== null) {
      clientId = target.clientId;
      text = (target.text || target.content || '').trim();
      if (target.sender) sender = target.sender;
      if (target.attachmentData) {
        attachment = {
          ...target.attachmentData,
          type: target.attachmentData.type || (
            target.messageType === 'workout_assignment' 
              ? 'workout_link' 
              : target.messageType === 'audio' 
                ? 'voice' 
                : 'video_form_check'
          ),
          title: target.attachmentData.title || target.attachmentData.exerciseName || (target.messageType === 'audio' ? 'Voice Memo' : 'Attachment'),
          workoutId: target.attachmentData.workoutId,
          url: target.attachmentData.url || target.attachmentData.audioUrl || target.attachmentData.videoUrl,
          audioUrl: target.attachmentData.audioUrl || target.attachmentData.url
        };
      }
    } else if (typeof target === 'string') {
      clientId = target;
      text = (textParam || '').trim();
    }

    if (!clientId) return;
    if (!text && attachment) {
      text = attachment.title || (attachment.type === 'voice' ? 'Voice memo' : 'Attachment');
    }
    if (!text) return;

    const tempId = (typeof target === 'object' && target !== null && (target as any).id) 
      ? (target as any).id 
      : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: tempId,
      clientId,
      sender,
      text,
      timestamp: nowTime,
      isRead: false,
      attachment,
      messageType: (typeof target === 'object' && target !== null ? target.messageType : undefined) || (attachment?.type === 'voice' ? 'audio' : undefined),
      attachmentData: attachment
    };

    setMessages(prev => {
      if (prev.some(m => m.id === tempId)) return prev;
      return [...prev, newMsg];
    });

    try {
      const created = await messagesApi.send(clientId, text, attachment, sender, tempId);
      if (created?.id) {
        setMessages(prev => {
          // If created.id was already inserted by real-time SSE
          const hasCreatedId = prev.some(m => m.id === created.id);
          if (hasCreatedId) {
            if (created.id !== tempId) {
              return prev.filter(m => m.id !== tempId);
            }
            return prev;
          }
          // Replace tempId with created
          return prev.map(m => m.id === tempId ? { ...created, isRead: m.isRead } : m);
        });
      }
      if (sender === 'coach') {
        showToast('Message sent to speaker.');
      } else {
        showToast('Message sent.');
      }
    } catch (err) {
      console.warn('Backend sync failed for sendMessage:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      showToast('Failed to deliver message. Server could not be reached.');
    }
  };

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!messageId) return;
    const msgToDelete = messages.find(m => m.id === messageId);
    setMessages(prev => prev.filter(m => m.id !== messageId));
    try {
      await messagesApi.delete(messageId);
      showToast('Message deleted.');
    } catch (err) {
      console.error('Failed to delete message on backend:', err);
      if (msgToDelete) {
        setMessages(prev => [...prev, msgToDelete]);
      }
      showToast('Unable to delete message from server.');
    }
  }, [messages, showToast]);

  const markMessagesRead = useCallback(async (clientId: string) => {
    if (!clientId) return;
    setMessages(prev => prev.map(m => m.clientId === clientId ? { ...m, isRead: true } : m));
    try {
      await messagesApi.markRead(clientId);
    } catch (e) {
      console.debug('Failed to sync markRead:', e);
    }
  }, []);

  const sendTypingIndicator = useCallback(async (clientId: string, isTyping: boolean) => {
    if (!clientId) return;
    try {
      await messagesApi.sendTyping(clientId, isTyping);
    } catch (e) {
      console.debug('Failed to sync sendTyping:', e);
    }
  }, []);

  const reactToMessage = useCallback(async (messageId: string, emoji: string) => {
    if (!messageId || !emoji) return;
    const currentUserId = currentCoachUser?.id || activeSpeakerProfile?.id || 'current-user';
    const currentRole = currentCoachUser ? 'coach' : 'client';
    const currentName = currentCoachUser?.full_name || activeSpeakerProfile?.name || 'User';

    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const att = { ...(m.attachment || { type: 'text' }) };
      const currentReactions = [...(att.reactions || [])];
      const existingIdx = currentReactions.findIndex(r => r.userId === currentUserId && r.emoji === emoji);
      if (existingIdx >= 0) {
        currentReactions.splice(existingIdx, 1);
      } else {
        currentReactions.push({ emoji, userId: currentUserId, userName: currentName, senderRole: currentRole });
      }
      return { ...m, attachment: { ...att, reactions: currentReactions } };
    }));

    try {
      await messagesApi.react(messageId, emoji);
    } catch (e) {
      console.debug('Failed to sync reaction:', e);
    }
  }, [currentCoachUser, activeSpeakerProfile]);
  // No simulated replies — all responses must come from real messages via the API (H4 audit fix)

  const toggleHabitCompletion = async (clientId: string, date: string, habitId: string) => {
    try {
      const updatedLog = await habitsApi.toggle(clientId, date, habitId);
      if (updatedLog) {
        setHabitLogs(prev => {
          const exists = prev.some(l => l.id === updatedLog.id || (l.clientId === updatedLog.clientId && l.date === updatedLog.date));
          return exists
            ? prev.map(l => (l.id === updatedLog.id || (l.clientId === updatedLog.clientId && l.date === updatedLog.date)) ? updatedLog : l)
            : [updatedLog, ...prev];
        });
      }
    } catch (err) {
      console.error('Failed to sync habit toggle to server:', err);
      showToast('Unable to update habit. Server could not be reached.');
    }
  };

  const completeOnboarding = useCallback(async (data: SpeakerOnboardingData): Promise<{ success: boolean; error?: string }> => {
    const coachRefToUse = data.coachRef || referredCoach || undefined;

    // Register or sync client in Coach OS
    const newClientEntry: Client & { coachRef?: string } = {
      id: `client-${Date.now()}`,
      coachRef: coachRefToUse,
      name: data.fullName,
      avatar: '',
      email: data.email,
      phone: data.phone || '',
      age: data.age || undefined,
      gender: undefined,
      status: 'Active',
      branch: data.branch,
      institution: data.institution || '',
      primaryDiscipline: data.primaryDiscipline || '',
      coreFocus: data.coreFocus || '',
      missionFocus: data.missionFocus,
      catharsisScore: undefined,
      goal: data.speakingGoal,
      experienceLevel: data.experienceLevel,
      startDate: undefined,
      currentProgramId: undefined,
      currentProgramName: undefined,
      complianceRate: 0,
      workoutsCompleted: 0,
      totalWorkoutsAssigned: 0,
      lastActive: 'Just now',
      targetWeightKg: undefined,
      currentWeightKg: undefined,
      startingWeightKg: undefined,
      heightCm: undefined,
      bodyFatPercentage: undefined,
      targetBodyFat: undefined,
      injuriesAndHealth: [],
      medicalAlerts: '',
      customCoachNotes: data.bioNotes ? [data.bioNotes] : [],
      onboardingSurvey: {
        branch: data.branch,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || '',
        age: data.age || undefined,
        institution: data.institution || '',
        primaryDiscipline: data.primaryDiscipline || '',
        coreFocus: data.coreFocus || '',
        missionFocus: data.missionFocus,
        speakingGoal: data.speakingGoal,
        experienceLevel: data.experienceLevel,
        vocalBaselinePace: data.vocalBaselinePace || undefined,
        emotionalOpennessRating: data.emotionalOpennessRating || undefined,
        selectedHabits: data.selectedHabits || [],
        bioNotes: data.bioNotes || ''
      } as any
    };

    try {
      // Must persist to backend database first (Fail-Closed, No Offline Mode)
      const persisted = await clientsApi.create(newClientEntry);
      if (!persisted || !persisted.id) {
        throw new Error('Database server returned an invalid response.');
      }

      const resolvedClient: Client = {
        ...newClientEntry,
        id: persisted.id,
        coachId: persisted.coachId,
        referralCode: persisted.referralCode,
        adjudicatorNotes: persisted.adjudicatorNotes || []
      };


      // 1. Update in-memory roster with verified server record
      setClients(prev => [resolvedClient, ...prev.filter(c => c.email !== data.email && c.id !== resolvedClient.id)]);
      setSelectedClientId(resolvedClient.id);

      // 2. Only NOW set active profile and persist session to localStorage
      setActiveSpeakerProfile(data);
      localStorage.setItem('globalorators_speaker_profile', JSON.stringify(data));

      // 3. Switch portal to speaker app
      setCurrentPortal('speaker_app');
      showToast(`Welcome ${data.fullName}. Your ${data.branch} protocol is initialized.`);
      return { success: true };
    } catch (err: any) {
      console.error('Backend client persistence failed (fail-closed):', err);
      const errorMsg = err?.message || 'Unable to register profile to server. Please check your connection and try again.';
      showToast(errorMsg);
      // DO NOT set active speaker profile
      // DO NOT save to localStorage
      // DO NOT switch portal
      return { success: false, error: errorMsg };
    }
  }, [setCurrentPortal, showToast]);

  const sendSpeakerOtp = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    try {
      await authApi.sendOtp(clean);
      return { success: true };
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Unable to dispatch verification passcode.';
      return { success: false, error: msg };
    }
  }, []);

  const verifySpeakerOtp = useCallback(async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();
    if (!cleanEmail || !cleanCode) {
      return { success: false, error: 'Email and verification passcode are required.' };
    }

    try {
      const res = await authApi.verifyOtp(cleanEmail, cleanCode);
      if (!res || !res.access_token) {
        throw new Error('Authentication failed: No token returned from server.');
      }

      await refreshFromBackend();

      let matchedClient: Client | null = null;
      try {
        matchedClient = await clientsApi.getMe();
      } catch {
        // No client profile found for this authenticated account
      }

      const onboarded = isProfileOnboarded(matchedClient);
      if (matchedClient && onboarded) {
        setClients(prev => {
          const exists = prev.some(c => c.id === matchedClient!.id);
          return exists ? prev.map(c => c.id === matchedClient!.id ? matchedClient! : c) : [matchedClient!, ...prev];
        });
        const profile = clientToSpeakerProfile(matchedClient);
        setActiveSpeakerProfile(profile);
        localStorage.setItem('globalorators_speaker_profile', JSON.stringify(profile));
        setCurrentPortal('speaker_app');
        showToast(`Welcome back, ${profile.fullName}. Session authenticated.`);
        return { success: true };
      } else {
        // Authenticated user has not completed onboarding; route to Onboarding
        setActiveSpeakerProfile(null);
        localStorage.removeItem('globalorators_speaker_profile');
        setCurrentPortal('onboarding');
        showToast('Account verified. Please complete your orator onboarding intake to initialize your syllabus.');
        return { success: true };
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Invalid or expired verification passcode.';
      return { success: false, error: msg };
    }
  }, [refreshFromBackend, setCurrentPortal, showToast]);

  const verifySpeakerMagicLink = useCallback(async (token: string, email?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      return { success: false, error: 'Magic login token is required.' };
    }

    try {
      const res = await authApi.verifyMagicLink(cleanToken, email ? email.trim().toLowerCase() : undefined);
      if (!res || !res.access_token) {
        throw new Error('Authentication failed: No token returned from server.');
      }

      await refreshFromBackend();

      let matchedClient: Client | null = null;
      try {
        matchedClient = await clientsApi.getMe();
      } catch {
        // No client profile found for this authenticated account
      }

      const onboarded = isProfileOnboarded(matchedClient);
      if (matchedClient && onboarded) {
        setClients(prev => {
          const exists = prev.some(c => c.id === matchedClient!.id);
          return exists ? prev.map(c => c.id === matchedClient!.id ? matchedClient! : c) : [matchedClient!, ...prev];
        });
        const profile = clientToSpeakerProfile(matchedClient);
        setActiveSpeakerProfile(profile);
        localStorage.setItem('globalorators_speaker_profile', JSON.stringify(profile));
        setCurrentPortal('speaker_app');
        showToast(`Welcome back, ${profile.fullName}. Session authenticated.`);
        return { success: true };
      } else {
        setActiveSpeakerProfile(null);
        localStorage.removeItem('globalorators_speaker_profile');
        setCurrentPortal('onboarding');
        showToast('Magic link verified. Please complete your orator onboarding intake to initialize your syllabus.');
        return { success: true };
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Invalid or expired magic login link.';
      return { success: false, error: msg };
    }
  }, [refreshFromBackend, setCurrentPortal, showToast]);

  const loginSpeaker = useCallback(async (email: string, code?: string): Promise<{ success: boolean; error?: string }> => {
    if (code) {
      return verifySpeakerOtp(email, code);
    }
    return sendSpeakerOtp(email);
  }, [sendSpeakerOtp, verifySpeakerOtp]);

  const loginWithGoogle = useCallback(async (credential: string, role: 'coach' | 'speaker' = 'speaker'): Promise<{ success: boolean; error?: string; user?: any }> => {
    try {
      const res = await authApi.googleAuth(credential, role);
      if (res && res.user) {
        if (res.user.role === 'coach' || role === 'coach') {
          const coachUser = {
            ...res.user,
            role: 'coach'
          };
          setCurrentCoachUser(coachUser);
          localStorage.setItem('globalorators_user', JSON.stringify(coachUser));
          setCurrentPortal('coach_os');
          showToast(`Welcome back, Coach ${res.user.full_name}.`);
          return { success: true, user: coachUser };
        } else {
          // Look up real client record created in backend strictly via authenticated /me endpoint
          let matchedClient: Client | null = null;
          try {
            matchedClient = await clientsApi.getMe();
          } catch {
            // No client profile found for account
          }

          const onboarded = isProfileOnboarded(matchedClient);
          if (matchedClient && onboarded) {
            setClients(prev => {
              const exists = prev.some(c => c.id === matchedClient!.id);
              return exists ? prev.map(c => c.id === matchedClient!.id ? matchedClient! : c) : [matchedClient!, ...prev];
            });
            const profile = clientToSpeakerProfile(matchedClient);
            setActiveSpeakerProfile(profile);
            localStorage.setItem('globalorators_speaker_profile', JSON.stringify(profile));
            setCurrentPortal('speaker_app');
            showToast(`Welcome back, ${res.user.full_name}. Orators App loaded.`);
            return { success: true, user: res.user };
          } else {
            // New speaker who has not completed onboarding -> Route to Onboarding!
            setActiveSpeakerProfile(null);
            localStorage.removeItem('globalorators_speaker_profile');
            setCurrentPortal('onboarding');
            showToast(`Welcome, ${res.user.full_name}! Please complete your orator onboarding.`);
            return { success: true, user: res.user };
          }
        }
      }
      return { success: false, error: 'Authentication failed. Please try again.' };
    } catch (err: any) {
      console.error('Google authentication error:', err);
      // Production fail-closed: reject failed authentication (C3 audit fix)
      return { success: false, error: err?.message || 'Google authentication failed. Please try again.' };
    }
  }, [setCurrentPortal, showToast]);

  const checkCoachEmail = useCallback(async (email: string): Promise<{ exists: boolean; auth_method: 'password' | 'google' | 'both' | 'none'; role: string | null }> => {
    try {
      const res = await authApi.checkEmail(email.trim().toLowerCase());
      return res;
    } catch {
      return { exists: false, auth_method: 'none', role: null };
    }
  }, []);

  const loginCoach = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> => {
    try {
      const res = await authApi.login(email.trim().toLowerCase(), password);
      if (res && res.access_token && res.user) {
        if (res.user.role !== 'coach') {
          clearAuthSession();
          return { success: false, error: 'Access denied: this account does not have coaching privileges.' };
        }
        setCurrentCoachUser(res.user);
        await refreshFromBackend();
        setCurrentPortal('coach_os');
        showToast(`Welcome back, Coach ${res.user.full_name}.`);
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Invalid email or password.' };
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Authentication failed. Please verify credentials.';
      return { success: false, error: msg };
    }
  }, [refreshFromBackend, setCurrentPortal, showToast]);

  const registerCoach = useCallback(async (payload: { email: string; password: string; fullName: string; inviteCode?: string }): Promise<{ success: boolean; error?: string; user?: any }> => {
    try {
      const res = await authApi.register({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        full_name: payload.fullName.trim(),
        role: 'coach',
        coach_invite_code: payload.inviteCode?.trim() || 'FACULTY-INVITE-2026'
      });
      if (res && res.access_token && res.user) {
        setCurrentCoachUser(res.user);
        await refreshFromBackend();
        setCurrentPortal('coach_os');
        showToast(`Coach account created. Welcome, Coach ${res.user.full_name}.`);
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Registration failed.' };
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Registration failed. Please check details.';
      return { success: false, error: msg };
    }
  }, [refreshFromBackend, setCurrentPortal, showToast]);

  const addCoach = useCallback(async (data: { email: string; password: string; fullName: string; avatar?: string }): Promise<{ success: boolean; error?: string; coach?: CoachItem }> => {
    try {
      const newCoach = await coachesApi.create({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        fullName: data.fullName.trim(),
        avatar: data.avatar || ''
      });
      if (newCoach) {
        setCoaches(prev => [newCoach, ...prev.filter(c => c.id !== newCoach.id)]);
        showToast(`Coach ${newCoach.name} added to faculty roster.`);
        return { success: true, coach: newCoach };
      }
      return { success: false, error: 'Failed to add coach.' };
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to add coach.';
      return { success: false, error: msg };
    }
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        clients,
        exercises,
        programs,
        scheduledWorkouts,
        metrics,
        personalRecords,
        photos,
        messages,
        activityFeed,
        habitLogs,
        isBackendConnected,
        selectedClientId,
        setSelectedClientId,
        selectedClient,
        isWorkoutLoggerOpen,
        activeWorkoutToLog,
        openWorkoutLogger,
        closeWorkoutLogger,
        addClient,
        updateClient,
        addCoachNote,
        addExercise,
        saveProgram,
        deleteProgram,
        assignProgramToClient,
        scheduleWorkout,
        updateWorkoutLog,
        completeWorkout,
        addMetricEntry,
        addPersonalRecord,
        addProgressPhoto,
        sendMessage,
        deleteMessage,
        markMessagesRead,
        reactToMessage,
        onlineClientIds,
        onlineUserIds,
        typingUsers,
        sendTypingIndicator,
        toggleHabitCompletion,
        refreshFromBackend,
        isLoading,
        theme,
        toggleTheme,
        resetThemeToSystem,
        toastMessage,
        showToast,
        currentPortal,
        setCurrentPortal,
        currentPath,
        navigate,
        activeSpeakerProfile,
        setActiveSpeakerProfile,
        completeOnboarding,
        loginSpeaker,
        sendSpeakerOtp,
        verifySpeakerOtp,
        verifySpeakerMagicLink,
        loginWithGoogle,
        resetOnboarding,
        coaches,
        fetchCoaches,
        groups,
        oratorDirectory,
        createGroup,
        startGroupCall,
        fetchGroups,
        fetchOratorDirectory,
        referredCoach,
        reassignClientCoach,
        addAdjudicationNote,
        currentCoachUser,
        isAuthenticatedCoach,
        checkCoachEmail,
        loginCoach,
        registerCoach,
        addCoach,
        logout,
        deleteClient,
        suspendClient,
        reactivateClient
      }}
    >
      {children}
    </AppContext.Provider>

  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
