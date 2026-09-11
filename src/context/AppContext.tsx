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
  BranchType
} from '../types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_EXERCISES, 
  INITIAL_PROGRAMS, 
  INITIAL_SCHEDULED_WORKOUTS, 
  INITIAL_METRICS, 
  INITIAL_PRS, 
  INITIAL_PHOTOS, 
  INITIAL_MESSAGES, 
  INITIAL_ACTIVITY_FEED,
  INITIAL_HABIT_LOGS
} from '../data/mockData';
import {
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
} from '../services/apiClient';

export type NavigationTab = 
  | 'dashboard' 
  | 'clients' 
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
  addProgressPhoto: (photo: Omit<ProgressPhoto, 'id'>) => void;
  sendMessage: (clientId: string, text: string, attachment?: ChatMessage['attachment']) => void;
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
  completeOnboarding: (data: SpeakerOnboardingData) => void;
  loginSpeaker: (emailOrPhone: string) => Promise<{ success: boolean; error?: string }>;
  resetOnboarding: () => void;
}


const DEFAULT_SPEAKER_PROFILE: SpeakerOnboardingData = {
  branch: 'Foundation',
  fullName: 'Kofi Mensah',
  email: 'kofi.mensah@globalorators.org',
  age: 20,
  phone: '+254 712 345 678',
  missionFocus: 'Breaking Patriarchal Silence & Speaking as Catharsis from Childhood Adversity',
  speakingGoal: 'Cathartic Expression & Healing',
  experienceLevel: 'Novice Speaker',
  vocalBaselinePace: 135,
  emotionalOpennessRating: 8,
  selectedHabits: [
    'Vocal Hydration (2.5L + Warm Lemon Water)',
    'Diaphragmatic Breathwork (5 Min Morning Routine)',
    'Cathartic Voice Journaling (1-Min Audio Reflection)',
    'Tongue Twisters & Articulation Warmups'
  ],
  bioNotes: 'Foundation scholar working on cathartic expression, healing from past adversity, and discovering his oratorical voice.'
};

export const clientToSpeakerProfile = (client: Client): SpeakerOnboardingData => {
  const survey = (client.onboardingSurvey || {}) as Record<string, any>;
  return {
    branch: (client.branch || survey.branch || 'Academy') as BranchType,
    fullName: client.name,
    email: client.email || survey.email || '',
    phone: client.phone || survey.phone || '',
    age: client.age || survey.age || 20,
    institution: client.institution || survey.institution || '',
    primaryDiscipline: client.primaryDiscipline || survey.primaryDiscipline || '',
    coreFocus: client.coreFocus || survey.coreFocus || '',
    missionFocus: client.missionFocus || survey.missionFocus || client.goal || 'Oratorical Leadership & Impact',
    speakingGoal: client.goal,
    experienceLevel: client.experienceLevel,
    vocalBaselinePace: survey.vocalBaselinePace || client.currentWeightKg || 140,
    emotionalOpennessRating: survey.emotionalOpennessRating || (client.catharsisScore ? Math.round(client.catharsisScore / 10) : 8),
    selectedHabits: survey.selectedHabits && Array.isArray(survey.selectedHabits) && survey.selectedHabits.length > 0
      ? survey.selectedHabits
      : [
          'Vocal Hydration (2.5L + Warm Lemon Water)',
          'Diaphragmatic Breathwork (5 Min Morning Routine)',
          'Tongue Twisters & Articulation Warmups'
        ],
    bioNotes: survey.bioNotes || (client.customCoachNotes && client.customCoachNotes[0]) || ''
  };
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
      const pathname = window.location.pathname.toLowerCase();
      if (pathname === '/coach' || pathname === '/coach_os') return 'coach_os';
      if (pathname === '/app' || pathname === '/speaker' || pathname === '/speaker_app') return 'speaker_app';
      if (pathname === '/onboarding') return 'onboarding';

      const params = new URLSearchParams(window.location.search);
      const portalParam = params.get('portal');
      if (portalParam === 'coach' || portalParam === 'coach_os') return 'coach_os';
      if (portalParam === 'app' || portalParam === 'speaker_app') return 'speaker_app';
      if (portalParam === 'onboarding') return 'onboarding';
      if (portalParam === 'landing') return 'landing';

      const hostname = window.location.hostname.toLowerCase();
      if (hostname.startsWith('coach.')) return 'coach_os';
      if (hostname.startsWith('app.')) return 'speaker_app';
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
      if (cleanPath === '/onboarding') {
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
      if (pathname === '/onboarding') {
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
    if (typeof window !== 'undefined' && window.history) {
      let targetPath = '/';
      if (portal === 'coach_os') targetPath = '/coach';
      else if (portal === 'speaker_app') targetPath = '/speaker';
      else if (portal === 'onboarding') targetPath = '/onboarding';
      else targetPath = '/';

      setCurrentPathState(targetPath);
      window.history.pushState({}, '', targetPath);
    }
  }, []);

  // Speaker Client App Profile & Onboarding
  const [activeSpeakerProfile, setActiveSpeakerProfile] = useState<SpeakerOnboardingData | null>(() => {
    const saved = localStorage.getItem('globalorators_speaker_profile');
    return saved ? JSON.parse(saved) : DEFAULT_SPEAKER_PROFILE;
  });

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem('globalorators_speaker_profile');
    setActiveSpeakerProfile(null);
    setCurrentPortal('onboarding');
  }, [setCurrentPortal]);

  
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('nubianfit_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });
  
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('nubianfit_exercises');
    return saved ? JSON.parse(saved) : INITIAL_EXERCISES;
  });
  
  const [programs, setPrograms] = useState<TrainingProgram[]>(() => {
    const saved = localStorage.getItem('nubianfit_programs');
    return saved ? JSON.parse(saved) : INITIAL_PROGRAMS;
  });
  
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>(() => {
    const saved = localStorage.getItem('nubianfit_workouts');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULED_WORKOUTS;
  });
  
  const [metrics, setMetrics] = useState<MetricEntry[]>(() => {
    const saved = localStorage.getItem('nubianfit_metrics');
    return saved ? JSON.parse(saved) : INITIAL_METRICS;
  });
  
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() => {
    const saved = localStorage.getItem('nubianfit_prs');
    return saved ? JSON.parse(saved) : INITIAL_PRS;
  });
  
  const [photos, setPhotos] = useState<ProgressPhoto[]>(() => {
    const saved = localStorage.getItem('nubianfit_photos');
    return saved ? JSON.parse(saved) : INITIAL_PHOTOS;
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('nubianfit_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });
  
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>(INITIAL_ACTIVITY_FEED);
  
  const [habitLogs, setHabitLogs] = useState<ClientDailyHabitLog[]>(() => {
    const saved = localStorage.getItem('nubianfit_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABIT_LOGS;
  });

  const [selectedClientId, setSelectedClientId] = useState<string | null>('client-1');
  const [isWorkoutLoggerOpen, setIsWorkoutLoggerOpen] = useState<boolean>(false);
  const [activeWorkoutToLog, setActiveWorkoutToLog] = useState<ScheduledWorkout | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

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

  // Dynamically listen for system color scheme changes (only applies if user has not set explicit manual preference)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const saved = getSavedTheme();
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, []);

  // Sync active theme to HTML documentElement class without writing to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);


  // Sync to localStorage as backup
  useEffect(() => {
    localStorage.setItem('nubianfit_clients', JSON.stringify(clients));
  }, [clients]);
  
  useEffect(() => {
    localStorage.setItem('nubianfit_exercises', JSON.stringify(exercises));
  }, [exercises]);
  
  useEffect(() => {
    localStorage.setItem('nubianfit_programs', JSON.stringify(programs));
  }, [programs]);
  
  useEffect(() => {
    localStorage.setItem('nubianfit_workouts', JSON.stringify(scheduledWorkouts));
  }, [scheduledWorkouts]);

  useEffect(() => {
    localStorage.setItem('nubianfit_metrics', JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    localStorage.setItem('nubianfit_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('nubianfit_habits', JSON.stringify(habitLogs));
  }, [habitLogs]);

  // Fetch initial data from FastAPI backend
  const refreshFromBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check auth / log in if needed
      const token = localStorage.getItem('nubianfit_token');
      if (!token) {
        try {
          await authApi.login('coach@nubianfit.com', 'Coach@123');
        } catch {
          // continue even if login fails
        }
      }

      const [
        fetchedClients,
        fetchedExercises,
        fetchedPrograms,
        fetchedWorkouts,
        fetchedMetrics,
        fetchedPrs,
        fetchedHabits,
        fetchedPhotos,
        fetchedMessages,
        fetchedActivity
      ] = await Promise.all([
        clientsApi.getAll().catch(() => null),
        exercisesApi.getAll().catch(() => null),
        programsApi.getAll().catch(() => null),
        workoutsApi.getAll().catch(() => null),
        metricsApi.getAll().catch(() => null),
        prsApi.getAll().catch(() => null),
        habitsApi.getAll().catch(() => null),
        photosApi.getAll().catch(() => null),
        messagesApi.getAll().catch(() => null),
        activityApi.getAll().catch(() => null),
      ]);

      if (fetchedClients && fetchedClients.length > 0) {
        setClients(fetchedClients);
        setIsBackendConnected(true);
      }
      if (fetchedExercises && fetchedExercises.length > 0) setExercises(fetchedExercises);
      if (fetchedPrograms && fetchedPrograms.length > 0) setPrograms(fetchedPrograms);
      if (fetchedWorkouts && fetchedWorkouts.length > 0) setScheduledWorkouts(fetchedWorkouts);
      if (fetchedMetrics && fetchedMetrics.length > 0) setMetrics(fetchedMetrics);
      if (fetchedPrs && fetchedPrs.length > 0) setPersonalRecords(fetchedPrs);
      if (fetchedHabits && fetchedHabits.length > 0) setHabitLogs(fetchedHabits);
      if (fetchedPhotos && fetchedPhotos.length > 0) setPhotos(fetchedPhotos);
      if (fetchedMessages && fetchedMessages.length > 0) setMessages(fetchedMessages);
      if (fetchedActivity && fetchedActivity.length > 0) setActivityFeed(fetchedActivity);
    } catch (err) {
      console.warn('FastAPI backend not reachable, using offline store:', err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

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
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    showToast('Client details updated.');

    try {
      await clientsApi.update(id, updates);
    } catch (err) {
      console.warn('Backend sync failed for updateClient:', err);
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
    showToast('Coach note added.');

    try {
      await clientsApi.addNote(clientId, note);
    } catch (err) {
      console.warn('Backend sync failed for addCoachNote:', err);
    }
  };

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
    }
  };

  const saveProgram = async (prog: TrainingProgram) => {
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
    showToast(`Program "${prog.title}" saved!`);

    try {
      await programsApi.save(prog);
    } catch (err) {
      console.warn('Backend sync failed for saveProgram:', err);
    }
  };

  const deleteProgram = async (id: string) => {
    setPrograms(prev => prev.filter(p => p.id !== id));
    showToast('Program deleted.');

    try {
      await programsApi.delete(id);
    } catch (err) {
      console.warn('Backend sync failed for deleteProgram:', err);
    }
  };

  const assignProgramToClient = async (programId: string, clientId: string) => {
    const targetProgram = programs.find(p => p.id === programId);
    const targetClient = clients.find(c => c.id === clientId);
    if (!targetProgram || !targetClient) return;

    setClients(prev => prev.map(c => c.id === clientId ? {
      ...c,
      currentProgramId: targetProgram.id,
      currentProgramName: targetProgram.title
    } : c));

    setPrograms(prev => prev.map(p => p.id === programId ? {
      ...p,
      assignedClientCount: p.assignedClientCount + 1
    } : p));

    const today = new Date();
    const newWorkouts: ScheduledWorkout[] = targetProgram.days.map((day, idx) => {
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + (idx * 2));
      const dateStr = scheduledDate.toISOString().split('T')[0];

      return {
        id: `sched-${Date.now()}-${idx}`,
        clientId: targetClient.id,
        clientName: targetClient.name,
        clientAvatar: targetClient.avatar,
        programId: targetProgram.id,
        programName: targetProgram.title,
        workoutDayId: day.id,
        workoutTitle: day.name,
        date: dateStr,
        time: '09:00 AM',
        status: 'Scheduled',
        exercises: day.exercises
      };
    });

    setScheduledWorkouts(prev => [...newWorkouts, ...prev]);

    setActivityFeed(prev => [
      {
        id: `act-${Date.now()}`,
        type: 'check_in_submitted',
        clientId: targetClient.id,
        clientName: targetClient.name,
        clientAvatar: targetClient.avatar,
        title: `Assigned: ${targetProgram.title}`,
        description: `Curriculum assigned with ${targetProgram.days.length} training rounds`,
        timestamp: 'Just now'
      },
      ...prev
    ]);

    showToast(`Assigned "${targetProgram.title}" to ${targetClient.name}!`);

    try {
      await programsApi.assign(programId, clientId);
    } catch (err) {
      console.warn('Backend sync failed for assignProgramToClient:', err);
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
    }
  };

  const updateWorkoutLog = async (workoutId: string, updates: Partial<ScheduledWorkout>) => {
    setScheduledWorkouts(prev => prev.map(w => w.id === workoutId ? { ...w, ...updates } : w));

    try {
      await workoutsApi.update(workoutId, updates);
    } catch (err) {
      console.warn('Backend sync failed for updateWorkoutLog:', err);
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

    showToast(`Rehearsal session "${target.workoutTitle}" marked completed! 🎙️`);

    try {
      await workoutsApi.complete(workoutId, {
        clientFeedback: updatedWorkout.clientFeedback,
        coachFeedback: updatedWorkout.coachFeedback,
        rating: updatedWorkout.rating,
        durationMin: updatedWorkout.durationMin,
        exercises: target.exercises,
      });
    } catch (err) {
      console.warn('Backend sync failed for completeWorkout:', err);
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

    showToast(`Delivery metric recorded: ${entryData.weightKg} WPM.`);

    try {
      const created = await metricsApi.create(entryData);
      if (created?.id) {
        setMetrics(prev => prev.map(m => m.id === tempId ? created : m));
      }
    } catch (err) {
      console.warn('Backend sync failed for addMetricEntry:', err);
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

    showToast(`Speech milestone logged for ${prData.exerciseName}! 🎯`);

    try {
      const created = await prsApi.create(prData);
      if (created?.id) {
        setPersonalRecords(prev => prev.map(p => p.id === tempId ? created : p));
      }
    } catch (err) {
      console.warn('Backend sync failed for addPersonalRecord:', err);
    }
  };

  const addProgressPhoto = async (photoData: Omit<ProgressPhoto, 'id'>) => {
    const tempId = `photo-${Date.now()}`;
    const newPhoto: ProgressPhoto = {
      ...photoData,
      id: tempId
    };

    setPhotos(prev => [newPhoto, ...prev]);
    showToast('Stage check-in photo uploaded successfully.');

    try {
      const created = await photosApi.create(photoData);
      if (created?.id) {
        setPhotos(prev => prev.map(p => p.id === tempId ? created : p));
      }
    } catch (err) {
      console.warn('Backend sync failed for addProgressPhoto:', err);
    }
  };

  const sendMessage = async (clientId: string, text: string, attachment?: ChatMessage['attachment']) => {
    const tempId = `msg-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newMsg: ChatMessage = {
      id: tempId,
      clientId,
      sender: 'coach',
      text,
      timestamp: nowTime,
      isRead: true,
      attachment
    };

    setMessages(prev => [...prev, newMsg]);

    try {
      await messagesApi.send(clientId, text, attachment);
    } catch (err) {
      console.warn('Backend sync failed for sendMessage:', err);
    }

    // Auto simulate client reply after short delay
    setTimeout(() => {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      const clientReplies = [
        'Thanks Coach! Crushed the rehearsal session today. Feeling confident for the tournament!',
        'Got it, will incorporate the 2-second pause before my rebuttal next time.',
        'Submitted my speaking pace and fluency check-in for this morning!',
        'Vocal projection felt strong and resonant with the diaphragmatic breathwork adjustments. Appreciate you!'
      ];
      const randomReply = clientReplies[Math.floor(Math.random() * clientReplies.length)];

      const clientMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        clientId,
        sender: 'client',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      };

      setMessages(prev => [...prev, clientMsg]);

      setActivityFeed(af => [
        {
          id: `act-${Date.now()}`,
          type: 'new_message',
          clientId: client.id,
          clientName: client.name,
          clientAvatar: client.avatar,
          title: `Reply from ${client.name}`,
          description: `"${randomReply.substring(0, 45)}..."`,
          timestamp: 'Just now'
        },
        ...af
      ]);
    }, 2800);

    showToast('Message sent to speaker.');
  };

  const toggleHabitCompletion = async (clientId: string, date: string, habitId: string) => {
    setHabitLogs(prev => {
      const existingLog = prev.find(l => l.clientId === clientId && l.date === date);
      if (existingLog) {
        return prev.map(log => {
          if (log.id === existingLog.id) {
            return {
              ...log,
              habits: log.habits.map(h => h.habitId === habitId ? { ...h, completed: !h.completed } : h)
            };
          }
          return log;
        });
      } else {
        const newLog: ClientDailyHabitLog = {
          id: `hl-${Date.now()}`,
          clientId,
          date,
          habits: [
            { habitId: 'h-1', title: 'Vocal Hydration (Warm Lemon Water)', completed: habitId === 'h-1', currentValue: '2.5', targetValue: '2.5', unit: 'Liters' },
            { habitId: 'h-2', title: 'Diaphragmatic Breathwork', completed: habitId === 'h-2', currentValue: '15', targetValue: '15', unit: 'Minutes' },
            { habitId: 'h-3', title: 'Editorial & Current Affairs Reading', completed: habitId === 'h-3', currentValue: '30', targetValue: '20', unit: 'Minutes' },
            { habitId: 'h-4', title: 'Vocal Cord Rest & Sleep', completed: habitId === 'h-4', currentValue: '8.0', targetValue: '7.5+', unit: 'Hours' },
            { habitId: 'h-5', title: 'Tongue Twisters & Articulation', completed: habitId === 'h-5', currentValue: '10', targetValue: '10', unit: 'Minutes' }
          ]
        };
        return [newLog, ...prev];
      }
    });

    try {
      await habitsApi.toggle(clientId, date, habitId);
    } catch (err) {
      console.warn('Backend sync failed for toggleHabitCompletion:', err);
    }
  };

  const completeOnboarding = useCallback((data: SpeakerOnboardingData) => {
    setActiveSpeakerProfile(data);
    localStorage.setItem('globalorators_speaker_profile', JSON.stringify(data));

    // Register or sync client in Coach OS
    const newClientEntry: Client = {
      id: `client-${Date.now()}`,
      name: data.fullName,
      avatar: data.branch === 'Academy'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      email: data.email,
      phone: data.phone || '+254 700 000 000',
      age: data.age || 21,
      gender: 'Non-binary',
      status: 'Active',
      branch: data.branch,
      institution: data.institution || 'Independent Orator',
      primaryDiscipline: data.primaryDiscipline || 'British Parliamentary (BP)',
      coreFocus: data.coreFocus || 'Argumentation & Rebuttal Depth',
      missionFocus: data.missionFocus,
      catharsisScore: data.emotionalOpennessRating * 10,
      goal: data.speakingGoal,
      experienceLevel: data.experienceLevel,
      startDate: new Date().toISOString().split('T')[0],
      currentProgramId: data.branch === 'Academy' ? 'prog-1' : 'prog-3',
      currentProgramName: data.branch === 'Academy' ? '8-Week Championship Debate Masterclass' : '6-Week Impromptu Fluency & Extemporaneous Protocol',
      complianceRate: 100,
      workoutsCompleted: 0,
      totalWorkoutsAssigned: 12,
      lastActive: 'Just now',
      targetWeightKg: 145,
      currentWeightKg: data.vocalBaselinePace,
      startingWeightKg: data.vocalBaselinePace,
      heightCm: 175,
      bodyFatPercentage: 88,
      targetBodyFat: 95,
      injuriesAndHealth: ['Navigating emotional vulnerability hurdles', 'Overcoming conversational hesitation'],
      medicalAlerts: 'Prioritize diaphragmatic calming breathwork and vocal hydration before speaking.',
      customCoachNotes: [data.bioNotes || `Onboarded through Global Orators ${data.branch} flow. Focus: ${data.missionFocus}`],
      onboardingSurvey: {
        gymAccess: data.branch === 'Academy' ? 'University Debate Hall & Parliamentary Forum' : 'Children\'s Home & Community Empowerment Center',
        weeklyAvailabilityDays: 4,
        dietaryRestrictions: 'Public Speaking Trainee',
        sleepAvgHours: 7.5,
        stressLevel: 'Moderate',
        favoriteExercises: data.branch === 'Academy' ? 'Aristotelian Triad Framing' : 'Cathartic Voice Journaling & Vulnerability Release',
        leastFavoriteExercises: 'None recorded',
        branch: data.branch,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || '',
        age: data.age || 20,
        institution: data.institution || '',
        primaryDiscipline: data.primaryDiscipline || '',
        coreFocus: data.coreFocus || '',
        missionFocus: data.missionFocus,
        speakingGoal: data.speakingGoal,
        experienceLevel: data.experienceLevel,
        vocalBaselinePace: data.vocalBaselinePace,
        emotionalOpennessRating: data.emotionalOpennessRating,
        selectedHabits: data.selectedHabits,
        bioNotes: data.bioNotes || ''
      } as any
    };

    setClients(prev => [newClientEntry, ...prev.filter(c => c.email !== data.email)]);
    setCurrentPortal('speaker_app');
    showToast(`Welcome ${data.fullName}. Your ${data.branch} protocol is initialized.`);

    // Persist to backend SQLite database
    clientsApi.create(newClientEntry)
      .then(persisted => {
        if (persisted && persisted.id) {
          setClients(prev => prev.map(c => c.id === newClientEntry.id ? persisted : c));
        }
      })
      .catch(err => {
        console.warn('Backend client persistence failed (local fallback retained):', err);
      });
  }, [setCurrentPortal, showToast]);

  const loginSpeaker = useCallback(async (emailOrPhone: string): Promise<{ success: boolean; error?: string }> => {
    const clean = emailOrPhone.trim();
    if (!clean) {
      return { success: false, error: 'Please enter your email or phone number.' };
    }

    const cleanLower = clean.toLowerCase();
    const cleanDigits = clean.replace(/\D/g, '');

    // Check in-memory clients first
    const localMatch = clients.find(c => {
      const emailMatches = Boolean(c.email && c.email.toLowerCase() === cleanLower);
      const nameMatches = Boolean(c.name && c.name.toLowerCase() === cleanLower);
      const phoneMatches = Boolean(cleanDigits.length >= 6 && c.phone && c.phone.replace(/\D/g, '').includes(cleanDigits));
      return emailMatches || nameMatches || phoneMatches;
    });

    try {
      const backendClient = await clientsApi.lookup(clean);
      if (backendClient) {
        const profile = clientToSpeakerProfile(backendClient);
        setActiveSpeakerProfile(profile);
        localStorage.setItem('globalorators_speaker_profile', JSON.stringify(profile));
        const targetEmail = (backendClient.email || '').toLowerCase();
        const targetId = backendClient.id;
        setClients(prev => {
          const exists = prev.some(c => c.id === targetId || (targetEmail && (c.email || '').toLowerCase() === targetEmail));
          return exists 
            ? prev.map(c => (c.id === targetId || (targetEmail && (c.email || '').toLowerCase() === targetEmail)) ? backendClient : c) 
            : [backendClient, ...prev];
        });
        setCurrentPortal('speaker_app');
        showToast(`Welcome back, ${profile.fullName}. Profile loaded.`);
        return { success: true };
      }
    } catch {
      // Backend lookup returned 404 or connection offline
      if (localMatch) {
        const profile = clientToSpeakerProfile(localMatch);
        setActiveSpeakerProfile(profile);
        localStorage.setItem('globalorators_speaker_profile', JSON.stringify(profile));
        setCurrentPortal('speaker_app');
        showToast(`Welcome back, ${profile.fullName}. Profile loaded.`);
        return { success: true };
      }
    }

    if (localMatch) {
      const profile = clientToSpeakerProfile(localMatch);
      setActiveSpeakerProfile(profile);
      localStorage.setItem('globalorators_speaker_profile', JSON.stringify(profile));
      setCurrentPortal('speaker_app');
      showToast(`Welcome back, ${profile.fullName}. Profile loaded.`);
      return { success: true };
    }

    return {
      success: false,
      error: 'No speaker profile found with that email or phone number. Check your entry or create a new profile.'
    };
  }, [clients, setCurrentPortal, showToast]);

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
        resetOnboarding
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
