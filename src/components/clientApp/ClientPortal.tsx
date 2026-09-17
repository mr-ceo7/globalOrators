import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Flame,
  Heart,
  Award,
  BookOpen,
  Send,
  MessageSquare,
  GraduationCap,
  HeartHandshake,
  RefreshCw,
  Clock,
  Compass,
  Volume2,
  Activity,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Globe,
  LogOut,
  Video,
  Download,
  Target,
  FileText,
  Layers,
  Briefcase,
  Sun,
  Moon,
  LayoutDashboard,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BranchType, SpeakerOnboardingData, ScheduledWorkout } from '../../types';
import { resolveSpeakerCurriculum } from '../../utils/curriculumResolver';
import { LiveRehearsalRoom } from '../live/LiveRehearsalRoom';
import { SEOHead } from '../common/SEOHead';
import { SpeakerMobileBottomNav } from './SpeakerMobileBottomNav';
import { SpeakerLoginPortal } from '../auth/SpeakerLoginPortal';
import { SpeakerSidebar } from './SpeakerSidebar';
import { GlobalOratorsLogo } from '../common/GlobalOratorsLogo';
import { journalsApi, simulationsApi, recordingsApi, RecordingResponse } from '../../services/apiClient';

export type SpeakerTabType = 'today' | 'practice' | 'catharsis' | 'schedule' | 'habits' | 'progress' | 'coach';

const AuthenticatedVaultPlayer: React.FC<{ recordingId: string }> = ({ recordingId }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlay = async () => {
    if (blobUrl) return;
    setIsLoading(true);
    setError(null);
    try {
      const blob = await recordingsApi.getStreamBlob(recordingId);
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch {
      setError('Playback failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  if (blobUrl) {
    return <audio controls autoPlay src={blobUrl} className="h-9 w-full sm:w-64" />;
  }

  return (
    <button
      onClick={handlePlay}
      disabled={isLoading}
      className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-[#C89630]/60 bg-slate-900 text-[11px] font-mono text-slate-300 hover:text-white transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
    >
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C89630]" /> : <Play className="w-3.5 h-3.5 text-[#C89630]" />}
      <span>{isLoading ? 'Decrypting Stream...' : error || 'Play Rehearsal'}</span>
    </button>
  );
};

export const ClientPortal: React.FC = () => {
  const {
    activeSpeakerProfile,
    setActiveSpeakerProfile,
    setCurrentPortal,
    showToast,
    resetOnboarding,
    clients,
    coaches,
    programs,
    scheduledWorkouts,
    messages,
    sendMessage,
    habitLogs,
    toggleHabitCompletion,
    metrics,
    theme,
    toggleTheme,
    logout
  } = useApp();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLiveRehearsalOpen, setIsLiveRehearsalOpen] = useState(false);
  const [activeChamberTitle, setActiveChamberTitle] = useState('Executive Public Speaking Chamber');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const profile = useMemo(() => activeSpeakerProfile || {
    branch: 'Foundation' as BranchType,
    fullName: '',
    email: '',
    missionFocus: '',
    primaryDiscipline: '',
    coreFocus: '',
    institution: '',
    speakingGoal: '',
    experienceLevel: '',
    vocalBaselinePace: 135,
    emotionalOpennessRating: 8,
    selectedHabits: []
  }, [activeSpeakerProfile]);

  // Match client and program
  const pairedClient = useMemo(() => {
    return clients.find(c =>
      (c.email && profile.email && c.email.toLowerCase() === profile.email.toLowerCase()) ||
      (c.name && profile.fullName && c.name.toLowerCase() === profile.fullName.toLowerCase())
    );
  }, [clients, profile]);

  const assignedCoach = useMemo(() => {
    if (!pairedClient?.coachId) return null;
    return coaches.find(c => c.id === pairedClient.coachId) || null;
  }, [coaches, pairedClient?.coachId]);

  const isAssignedHeadCoach = Boolean(
    assignedCoach && (
      assignedCoach.id === 'coach-1' ||
      assignedCoach.email?.toLowerCase() === 'kassimmusa322@gmail.com' ||
      assignedCoach.email?.toLowerCase() === 'coach@globalorators.com'
    )
  );
  const assignedCoachName = assignedCoach?.name || (pairedClient?.coachId ? 'Faculty Coach' : 'Faculty Coaching Desk');
  const assignedCoachTitle = isAssignedHeadCoach
    ? 'Head Speech & Debate Coach'
    : (assignedCoach ? (assignedCoach.title || 'Faculty Coach') : 'Global Orators Faculty Desk');
  const assignedCoachInitials = assignedCoach
    ? (assignedCoachName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'FC')
    : 'FD';

  const coachSidebarLabel = useMemo(() => {
    if (assignedCoach) {
      if (isAssignedHeadCoach) {
        return 'Coach Qassim (2-Way)';
      }
      const cleanName = assignedCoach.name.replace(/^(Head\s+Coach|Faculty\s+Coach)\s+/i, 'Coach ');
      return `${cleanName} (2-Way)`;
    }
    return 'Faculty Coach (2-Way)';
  }, [assignedCoach, isAssignedHeadCoach]);

  const execProgram = useMemo(() => {
    if (!pairedClient?.currentProgramId) return null;
    return programs.find(p => p.id === pairedClient.currentProgramId) || null;
  }, [programs, pairedClient?.currentProgramId]);

  const isAcademy = profile.branch === 'Academy';
  const curriculum = useMemo(
    () => resolveSpeakerCurriculum(profile, execProgram, assignedCoach?.name),
    [profile, execProgram, assignedCoach?.name]
  );


  // True if speaker is on an Executive Public Speaking / Boardroom Pitching track
  const isExecutive = useMemo(() => {
    const profileText = `${profile.missionFocus || ''} ${profile.primaryDiscipline || ''} ${profile.speakingGoal || ''} ${profile.institution || ''} ${profile.coreFocus || ''}`.toLowerCase();
    const isProfileExec = profileText.includes('executive') ||
                          profileText.includes('pitch') ||
                          profileText.includes('board') ||
                          profileText.includes('keynote') ||
                          profileText.includes('capital') ||
                          profileText.includes('presentation skills');
    if (isProfileExec) return true;
    if (pairedClient && (pairedClient.currentProgramId === 'prog-exec-speaking-1' || pairedClient.goal === 'Executive & Board Pitching')) return true;
    return false;
  }, [profile, pairedClient]);

  // Real Persisted Roadmap Sessions from Database
  const roadmapSessions = useMemo(() => {
    if (pairedClient) {
      return scheduledWorkouts.filter(w => w.clientId === pairedClient.id);
    }
    return [];
  }, [pairedClient, scheduledWorkouts]);

  // Real Persisted Rehearsal Metrics from Database
  const speakerMetrics = useMemo(() => {
    if (!pairedClient) return [];
    return metrics
      .filter(m => m.clientId === pairedClient.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [pairedClient, metrics]);

  // Real Scored Panel Adjudications & Debriefs from Database
  const speakerEvaluations = useMemo(() => {
    return pairedClient?.adjudicatorNotes || [];
  }, [pairedClient?.adjudicatorNotes]);

  // Derived Average Pacing from Persisted Metrics
  const avgWpm = useMemo(() => {
    if (speakerMetrics.length === 0) return null;
    const sum = speakerMetrics.reduce((acc, m) => acc + (m.weight || 0), 0);
    return Math.round(sum / speakerMetrics.length);
  }, [speakerMetrics]);

  const downloadSessionIcs = (session: ScheduledWorkout) => {
    const title = session.workoutTitle;
    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, ' ').trim();
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Global Orators//Executive Speaking Chamber//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:Global Orators: ${cleanTitle}`,
      `DESCRIPTION:Executive Public Speaking 90-Minute Live Consultation & Drill Protocol with ${assignedCoachName}.\\nRoom: ${session.chamberRoomName || 'live-chamber'}\\nAssignments: ${session.assignmentNotes || 'Prepared speech simulation.'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${cleanTitle.toLowerCase().replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Calendar invitation downloaded for "${title}"`);
  };

  // Active Tab inside Client Portal
  const [speakerTab, setSpeakerTab] = useState<SpeakerTabType>('today');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // Close profile menu on Escape or click outside
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Voice Recorder State (Real MediaRecorder)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordingUploadStatus, setRecordingUploadStatus] = useState<'idle' | 'uploading' | 'persisted' | 'failed'>('idle');
  const recordedAudioBlobRef = useRef<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Real Audio Recordings Vault (Encrypted Backend Persistence)
  const [persistedRecordings, setPersistedRecordings] = useState<RecordingResponse[]>([]);

  // Hydrate recordings from backend
  useEffect(() => {
    if (pairedClient?.id) {
      recordingsApi.getAll({ clientId: pairedClient.id })
        .then(data => {
          if (Array.isArray(data)) setPersistedRecordings(data);
        })
        .catch(() => {});
    }
  }, [pairedClient?.id]);

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  // Recording Handlers (Real MediaRecorder API)
  const handleStartRecording = async () => {
    setRecordingError(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    recordedAudioBlobRef.current = null;
    setRecordingCompleted(false);
    setRecordingUploadStatus('idle');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setRecordingError('Microphone recording is not supported in this browser environment.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        recordedAudioBlobRef.current = audioBlob;
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        setRecordingCompleted(true);

        if (pairedClient?.id) {
          setRecordingUploadStatus('uploading');
          try {
            const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const title = `${profile.goal || 'Oratory'} Rehearsal (${dateStr})`;
            const uploaded = await recordingsApi.upload(
              pairedClient.id,
              audioBlob,
              title,
              recordingSeconds
            );
            if (uploaded && uploaded.id) {
              setPersistedRecordings(prev => [uploaded, ...prev]);
              setRecordingUploadStatus('persisted');
              showToast('Rehearsal uploaded and secured to Orator Vault.');
            } else {
              setRecordingUploadStatus('failed');
            }
          } catch (uploadErr) {
            console.warn('Failed to upload rehearsal to server:', uploadErr);
            setRecordingUploadStatus('failed');
            showToast('Rehearsal upload failed: Audio saved as local preview only.');
          }
        } else {
          setRecordingUploadStatus('failed');
          showToast('Orator profile not linked to server. Audio saved as local preview only.');
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      setRecordingError('Microphone permission required for rehearsal recording. Please allow access in browser settings.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
  };

  const handleRetryUploadRecording = async () => {
    if (!recordedAudioBlobRef.current) return;
    if (!pairedClient?.id) {
      showToast('Cannot upload: Orator profile not linked to server. Please complete speaker onboarding.');
      return;
    }
    setRecordingUploadStatus('uploading');
    try {
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const title = `${profile.goal || 'Oratory'} Rehearsal (${dateStr})`;
      const uploaded = await recordingsApi.upload(
        pairedClient.id,
        recordedAudioBlobRef.current,
        title,
        recordingSeconds
      );
      if (uploaded && uploaded.id) {
        setPersistedRecordings(prev => [uploaded, ...prev]);
        setRecordingUploadStatus('persisted');
        showToast('Rehearsal uploaded and secured to Orator Vault.');
      } else {
        setRecordingUploadStatus('failed');
        showToast('Upload retry failed. Check server connection.');
      }
    } catch (err) {
      console.warn('Retry upload failed:', err);
      setRecordingUploadStatus('failed');
      showToast('Upload retry failed: Server unreachable.');
    }
  };

  const handleDiscardRecording = () => {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    recordedAudioBlobRef.current = null;
    setRecordedAudioUrl(null);
    setRecordingUploadStatus('idle');
    setRecordingCompleted(false);
    showToast('Local rehearsal preview discarded.');
  };

  const handleDeleteRecording = async (recordingId: string) => {
    try {
      await recordingsApi.delete(recordingId);
      setPersistedRecordings(prev => prev.filter(r => r.id !== recordingId));
      showToast('Rehearsal purged from vault.');
    } catch (err) {
      console.warn('Failed to delete recording:', err);
      showToast('Failed to delete rehearsal from server.');
    }
  };

  // Add Journal Entry with authenticated server persistence (Fail Closed - C1 Audit Fix)
  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    if (!pairedClient?.id) {
      showToast('Vault unavailable: Orator profile not linked to server. Please complete speaker onboarding.');
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const payload = {
      client_id: pairedClient.id,
      date: dateStr,
      text: journalText.trim(),
      feel_before: journalFeelBefore,
      feel_after: journalFeelAfter
    };

    setIsSavingJournal(true);
    try {
      const res = await journalsApi.create(payload);
      setJournalEntries(prev => [{
        id: res.id,
        date: res.date,
        text: res.text,
        feelBefore: res.feel_before,
        feelAfter: res.feel_after
      }, ...prev]);
      setJournalText('');
      showToast('Reflection secured to Orator Vault.');
    } catch (err) {
      console.warn('Failed to persist reflection to server:', err);
      showToast('Failed to save reflection to server vault.');
    } finally {
      setIsSavingJournal(false);
    }
  };

  // Add Executive Simulation Entry with authenticated server persistence (Fail Closed - C1 Audit Fix)
  const handleSaveExecSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!execSimulationText.trim()) return;

    if (!pairedClient?.id) {
      showToast('Vault unavailable: Orator profile not linked to server. Please complete speaker onboarding.');
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const payload = {
      client_id: pairedClient.id,
      date: dateStr,
      arena: execArena,
      summary: execSimulationText.trim(),
      wpm: profile.vocalBaselinePace || 135,
      coach_status: 'Vault Persisted'
    };

    setIsSavingExec(true);
    try {
      const res = await simulationsApi.create(payload);
      setExecEntries(prev => [{
        id: res.id,
        date: res.date,
        arena: res.arena,
        summary: res.summary,
        wpm: res.wpm,
        coachStatus: res.coach_status
      }, ...prev]);
      setExecSimulationText('');
      showToast('Simulation dispatch secured to Orator Vault.');
    } catch (err) {
      console.warn('Failed to persist simulation to server:', err);
      showToast('Failed to save simulation dispatch to server vault.');
    } finally {
      setIsSavingExec(false);
    }
  };

  // Journal entries for Catharsis Vault (Foundation Track) - Server Persisted
  const [journalText, setJournalText] = useState('');
  const [journalFeelBefore, setJournalFeelBefore] = useState('Anxious & Suppressed');
  const [journalFeelAfter, setJournalFeelAfter] = useState('Relieved, Grounded & Sovereign');
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [journalEntries, setJournalEntries] = useState<{
    id: string;
    date: string;
    text: string;
    feelBefore: string;
    feelAfter: string;
  }[]>([]);

  // Hydrate journals from backend
  useEffect(() => {
    if (pairedClient?.id) {
      journalsApi.getAll({ clientId: pairedClient.id })
        .then(data => {
          if (Array.isArray(data)) {
            setJournalEntries(data.map(j => ({
              id: j.id,
              date: j.date,
              text: j.text,
              feelBefore: j.feel_before,
              feelAfter: j.feel_after
            })));
          }
        })
        .catch(() => {});
    }
  }, [pairedClient?.id]);

  // Executive Speech Vault State (Executive Track) - Server Persisted
  const [execArena, setExecArena] = useState('Series A / Growth Capital Venture Pitch');
  const [execSimulationText, setExecSimulationText] = useState('');
  const [isSavingExec, setIsSavingExec] = useState(false);
  const [execEntries, setExecEntries] = useState<{
    id: string;
    date: string;
    arena: string;
    summary: string;
    wpm: number;
    coachStatus: string;
  }[]>([]);

  // Hydrate simulations from backend
  useEffect(() => {
    if (pairedClient?.id) {
      simulationsApi.getAll({ clientId: pairedClient.id })
        .then(data => {
          if (Array.isArray(data)) {
            setExecEntries(data.map(s => ({
              id: s.id,
              date: s.date,
              arena: s.arena,
              summary: s.summary,
              wpm: s.wpm,
              coachStatus: s.coach_status
            })));
          }
        })
        .catch(() => {});
    }
  }, [pairedClient?.id]);

  // Daily Habits State in Client Portal using backend via context (stable habit IDs)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentClientHabitLog = useMemo(() => {
    if (!pairedClient?.id) return null;
    return habitLogs.find(l => l.clientId === pairedClient.id && l.date === todayStr);
  }, [habitLogs, pairedClient?.id, todayStr]);

  const activeHabitsList = useMemo(() => {
    if (currentClientHabitLog && currentClientHabitLog.habits && currentClientHabitLog.habits.length > 0) {
      return currentClientHabitLog.habits.map((h, i) => ({
        habitId: h.habitId || `h-${i + 1}`,
        title: h.title,
        completed: Boolean(h.completed),
      }));
    }
    return (profile.selectedHabits || []).map((title, i) => ({
      habitId: `h-${i + 1}`,
      title,
      completed: false,
    }));
  }, [currentClientHabitLog, profile.selectedHabits]);

  // Client to Coach messages initialized from authoritative AppContext
  const [clientMessageInput, setClientMessageInput] = useState('');

  // Authoritative messages from shared AppContext
  const displayedMessages = useMemo(() => {
    if (!pairedClient?.id) return [];
    return messages
      .filter(m => m.clientId === pairedClient.id)
      .map(m => ({
        sender: m.sender,
        text: m.text,
        time: m.timestamp
      }));
  }, [messages, pairedClient?.id]);

  // Toggle habit check via Backend (server-authoritative by stable habitId)
  const toggleHabit = (habitId: string) => {
    if (!pairedClient?.id) {
      showToast('No active speaker profile found to record habits.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    toggleHabitCompletion(pairedClient.id, today, habitId);
  };

  // Timer and cleanup effects for MediaRecorder
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Send message to coach
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = clientMessageInput.trim();
    if (!textToSend) return;

    if (pairedClient) {
      sendMessage({
        clientId: pairedClient.id,
        sender: 'client',
        text: textToSend
      });
    }
    setClientMessageInput('');
  };

  const habitsRemainingCount = useMemo(() => {
    const total = activeHabitsList.length;
    const completed = activeHabitsList.filter(h => h.completed).length;
    return Math.max(0, total - completed);
  }, [activeHabitsList]);

  const handleOpenLiveChamber = () => {
    setActiveChamberTitle(
      isExecutive
        ? 'Executive Boardroom Simulation & Pitch Chamber'
        : isAcademy
          ? 'Championship Parliamentary Chamber'
          : 'Expression & Catharsis Vocal Chamber'
    );
    setIsLiveRehearsalOpen(true);
  };

  const handleSignOut = () => {
    setIsProfileMenuOpen(false);
    logout();
    showToast('Signed out of speaker profile.');
  };

  const getBreadcrumbTitle = () => {
    switch (speakerTab) {
      case 'today': return "Rehearsal Protocol";
      case 'practice': return 'Drill Chamber';
      case 'catharsis': return isExecutive ? 'Executive Speech Vault' : 'Expression & Catharsis';
      case 'schedule': return isExecutive ? 'Executive Syllabus & Roadmap' : 'Syllabus & Roadmap';
      case 'habits': return 'Orator Rituals';
      case 'progress': return 'Speech Analytics';
      case 'coach': return 'Coach Consultation';
      default: return 'Speaker Studio';
    }
  };

  if (!activeSpeakerProfile) {
    return <SpeakerLoginPortal />;
  }

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 min-h-screen h-screen overflow-hidden">
      <SEOHead
        title="Speaker Practice Studio"
        description="Private rehearsal vault, catharsis voice recorder, and drill studio for Global Orators speakers."
        canonicalPath="/speaker"
        noIndex={true}
      />

      {/* Collapsible Speaker Navigation Sidebar (Desktop md+) */}
      <SpeakerSidebar
        speakerTab={speakerTab}
        setSpeakerTab={setSpeakerTab}
        profile={profile}
        isExecutive={isExecutive}
        isAcademy={isAcademy}
        coachLabel={coachSidebarLabel}
        roadmapSessionsCount={roadmapSessions.length}
        habitsRemainingCount={habitsRemainingCount}
        unreadMessagesCount={0}
        onResetOnboarding={resetOnboarding}
        onSignOut={handleSignOut}
        onOpenLiveChamber={handleOpenLiveChamber}
        onReturnToPublicSite={() => setCurrentPortal('landing')}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Floating Top Header matching Coach OS Header */}
        <header className="relative z-20 flex h-14 sm:h-16 items-center justify-between border border-slate-800/80 bg-slate-950/90 px-3.5 md:px-5 backdrop-blur-md rounded-xl mt-1.5 mx-1.5 shadow-lg shadow-slate-950/20 shrink-0">
          {/* Left: Mobile Brand or Desktop Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="md:hidden flex items-center gap-2">
              <GlobalOratorsLogo className="w-7 h-7 shrink-0" colorMode="gold" />
              <span className="font-serif font-bold text-sm text-white">Global<span className="text-[#C89630]">Orators</span></span>
            </div>

            <div className="hidden md:flex items-center gap-2.5 min-w-0">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Speaker Studio /</span>
              <span className="text-sm font-serif font-bold text-white tracking-tight truncate">
                {getBreadcrumbTitle()}
              </span>
              <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                isExecutive
                  ? 'bg-amber-500/10 text-[#C89630] border-[#C89630]/30'
                  : isAcademy
                    ? 'bg-amber-500/10 text-[#C89630] border-[#C89630]/30'
                    : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
              }`}>
                {isExecutive ? 'Executive Track' : `${profile.branch} Track`}
              </span>
            </div>
          </div>

          {/* Right Action Controls: Live Chamber, Messages, Theme, Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={handleOpenLiveChamber}
              className="min-h-[38px] hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-700 text-xs font-mono transition-colors cursor-pointer"
              title="Enter Live Rehearsal Chamber"
            >
              <Video className="w-3.5 h-3.5 text-[#C89630]" />
              <span>Live Chamber</span>
            </button>

            <button
              onClick={() => setSpeakerTab('coach')}
              aria-label={`Direct message thread with ${assignedCoachName}`}
              className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-mono transition-colors cursor-pointer"
              title={`Direct message thread with ${assignedCoachName}`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#C89630]" />
              <span className="hidden sm:inline">Coach Thread</span>
            </button>

            {/* Visual Theme Toggle Button */}
            <button
              id="speaker-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#C89630]" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* Profile & Workspace Menu Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                aria-label="Speaker workspace profile and settings menu"
                className="min-h-[38px] flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs text-slate-950 ${
                  isExecutive ? 'bg-[#C89630]' : isAcademy ? 'bg-[#C89630]' : 'bg-teal-400'
                }`}>
                  {profile.fullName ? profile.fullName.charAt(0) : 'S'}
                </div>
                <span className="hidden sm:inline font-sans font-medium text-white">
                  {profile.fullName ? profile.fullName.split(' ')[0] : 'Speaker'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileMenuOpen && (
                <div
                  role="menu"
                  aria-label="Profile and Workspace Settings"
                  className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-fadeIn"
                >
                  {/* Speaker Identity */}
                  <div className="px-3 py-2.5 border-b border-slate-800/80 mb-1">
                    <div className="font-bold text-white text-sm truncate">{profile.fullName || 'Speaker'}</div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">{profile.email}</div>
                    <div className="text-[10px] font-mono text-[#C89630] uppercase tracking-wider mt-1">
                      {isExecutive ? 'Executive Public Speaking Track' : `${profile.branch} Track`}
                    </div>
                  </div>

                  {/* Workspace Navigation Links */}
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                    Workspaces & Actions
                  </div>
                  <button
                    onClick={() => { setCurrentPortal('coach_os'); setIsProfileMenuOpen(false); }}
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>Open Coach App</span>
                  </button>
                  <button
                    onClick={() => { setCurrentPortal('landing'); setIsProfileMenuOpen(false); }}
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Return to Public Site</span>
                  </button>
                  <button
                    onClick={() => { resetOnboarding(); setIsProfileMenuOpen(false); }}
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                    <span>Recalibrate Track Preferences</span>
                  </button>

                  <div className="my-1.5 border-t border-slate-800" />

                  {/* Destructive Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left flex items-center gap-2 text-rose-300 hover:bg-rose-950/40 hover:text-rose-100 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable View Area with bottom padding for mobile bar */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-6 touch-pan-y">
          <div className="max-w-6xl mx-auto space-y-6">
        {/* TAB 0: TODAY'S COMMAND CENTER */}
        {speakerTab === 'today' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Protocol Strip */}
            <div className="rounded-3xl p-5 sm:p-6 border bg-slate-900/60 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C89630] font-bold">
                    {profile.institution ? `${profile.institution} · ` : ''}{curriculum.syllabusKicker}
                  </span>
                  <span className="hidden xs:inline-block w-px h-3 bg-slate-800" />
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                    curriculum.isAssignedByCoach
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  }`}>
                    {curriculum.isAssignedByCoach ? 'Assigned Syllabus' : 'Recommendation Preview'}
                  </span>
                  <span className="hidden xs:inline-block w-px h-3 bg-slate-800" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {roadmapSessions.length > 0 ? `Week 1 · Session 1 · ${roadmapSessions[0].durationMin || 42} min` : '—'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white tracking-tight leading-snug">
                  {curriculum.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                  {curriculum.description}
                </p>

                {!curriculum.isAssignedByCoach && (
                  <div className="mt-3 mb-2 bg-slate-950/80 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2.5 text-left max-w-2xl">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      <strong className="text-amber-300 font-semibold font-mono uppercase tracking-wider text-[10px] block mb-0.5">Track Recommendation Preview</strong>
                      This syllabus represents an authored training recommendation derived from your intake goals. An official active syllabus and assigned calendar will be confirmed by your faculty coach upon intake review.
                    </p>
                  </div>
                )}

                {/* Dynamic Curriculum Focus Tags */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <span>Discipline: <strong className="text-slate-200 font-semibold">{curriculum.disciplineLabel}</strong></span>
                  <span className="hidden xs:inline-block w-1 h-1 rounded-full bg-slate-700" />
                  <span>Focus: <strong className="text-[#C89630] font-semibold">{curriculum.focusLabel}</strong></span>
                  <span className="hidden xs:inline-block w-1 h-1 rounded-full bg-slate-700" />
                  <span>Tier: <strong className="text-slate-200 font-semibold">{profile.experienceLevel || 'Calibrated'}</strong></span>
                </div>
              </div>

              <button
                onClick={() => resetOnboarding()}
                className="min-h-[44px] px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors self-start md:self-center shrink-0"
                title="Recalibrate curriculum preferences"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Recalibrate Track</span>
              </button>
            </div>

            {/* 2. Dominant Next Action: Today's Rehearsal Command Center */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C89630] font-bold px-2.5 py-0.5 rounded bg-[#C89630]/10 border border-[#C89630]/30">
                      {curriculum.isAssignedByCoach ? "Today's Rehearsal" : "Recommended Rehearsal Preview"}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isExecutive ? '60 min executive protocol' : '45 min chamber drill'}</span>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight leading-tight">
                    {curriculum.drillTitle}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                    {curriculum.drillPrompt}
                  </p>

                  {/* 3 Compact Objectives */}
                  <div className="mt-5 space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Session Objectives (3 Required Outcomes)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
                      <div className="flex items-start gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                        <CheckCircle2 className="w-4 h-4 text-[#C89630] shrink-0 mt-0.5" />
                        <span>{isExecutive ? 'Open with high-conviction BLUF premise without hedging' : 'Establish uncontestable normative framework in 60s'}</span>
                      </div>
                      <div className="flex items-start gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                        <CheckCircle2 className="w-4 h-4 text-[#C89630] shrink-0 mt-0.5" />
                        <span>{isExecutive ? 'Structure 3 quantified proof-points with explicit risk mitigations' : 'Anticipate and neutralize deepest opposition comparative'}</span>
                      </div>
                      <div className="flex items-start gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                        <CheckCircle2 className="w-4 h-4 text-[#C89630] shrink-0 mt-0.5" />
                        <span>{isExecutive ? 'Deliver conclusive ask within calibrated 135–145 WPM cadence' : 'Synthesize debate round into decisive sovereign impact ballot'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setActiveChamberTitle(isExecutive ? 'Executive Public Speaking Chamber' : 'Live Rehearsal Chamber');
                      setIsLiveRehearsalOpen(true);
                    }}
                    className="min-h-[44px] px-6 py-3.5 rounded-2xl bg-[#C89630] hover:bg-[#d6a543] text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#C89630]/25 transition-all cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Enter Live Chamber</span>
                  </button>

                  <button
                    onClick={() => setSpeakerTab('practice')}
                    className="min-h-[44px] px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-[#C89630]" />
                    <span>Solo Rehearsal</span>
                  </button>

                  <button
                    onClick={() => setSpeakerTab('progress')}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Review Last Feedback</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 3. Compact Cumulative Metrics Grid (Responsive 2-column mobile layout) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4.5 transition-colors hover:border-slate-700/80">
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">Pacing</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#C89630] mt-1 tracking-tight">
                  {profile.vocalBaselinePace}
                  <span className="font-mono text-[10px] sm:text-xs font-normal text-slate-400 uppercase tracking-wider ml-1">WPM</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-1">{profile.vocalBaselinePace ? 'Calibrated Cadence' : 'Baseline'}</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4.5 transition-colors hover:border-slate-700/80">
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">Clarity</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white mt-1 tracking-tight">
                  —
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Evaluation Pending</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4.5 transition-colors hover:border-slate-700/80">
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                  {isExecutive ? 'BLUF Score' : isAcademy ? 'Argumentative Rigor' : 'Catharsis Index'}
                </div>
                <div className={`text-xl sm:text-2xl md:text-3xl font-serif font-bold mt-1 tracking-tight ${
                  isExecutive ? 'text-[#C89630]' : isAcademy ? 'text-emerald-400' : 'text-teal-400'
                }`}>
                  {isExecutive ? '—' : `${profile.emotionalOpennessRating * 10}%`}
                </div>
                <div className={`text-[10px] font-mono mt-1 ${
                  isExecutive ? 'text-[#C89630]' : isAcademy ? 'text-emerald-400' : 'text-teal-400'
                }`}>
                  {isExecutive ? 'Target Standard' : isAcademy ? 'Target Discipline' : 'Focus Area'}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4.5 transition-colors hover:border-slate-700/80">
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">Sessions</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white mt-1 tracking-tight">
                  {roadmapSessions.length || 0}
                  <span className="font-mono text-[10px] sm:text-xs font-normal text-slate-400 uppercase tracking-wider ml-1">
                    {isExecutive ? 'Sessions' : 'Rounds'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-1"></div>
              </div>
            </div>

            {/* 4. Two-Column Section: Coach Directive + Daily Rituals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Coach Directive & Dispatch */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-400 font-mono">
                        HQ
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Coach Assignment & Note</h3>
                        <span className="text-[10px] text-slate-400">Faculty Directive</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSpeakerTab('coach')}
                      className="text-[11px] text-[#C89630] hover:underline font-mono"
                    >
                      Reply
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {curriculum.drillPrompt || 'Awaiting personalized coach directive.'}
                  </p>

                  {/* Direct Faculty Communication */}
                  <div className="mt-4 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-mono text-slate-200 font-semibold">Faculty Direct Consultation</div>
                      <div className="text-[10px] font-mono text-slate-400">Send an inquiry or consultation to {assignedCoachName}</div>
                    </div>
                    <button
                      onClick={() => setSpeakerTab('coach')}
                      className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-[#C89630] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Consult Coach</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Calibrated for {profile.fullName.split(' ')[0]}</span>
                  <button onClick={() => setSpeakerTab('coach')} className="text-slate-300 hover:text-white flex items-center gap-1">
                    <span>Open Thread</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Right Column: Daily Rituals Interactive Checklist */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C89630]" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Today's Daily Rituals</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {activeHabitsList.filter(h => h.completed).length} of {activeHabitsList.length} Completed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeHabitsList.length === 0 ? (
                      <div className="py-4 px-3 rounded-2xl bg-slate-950/60 border border-slate-850 text-center">
                        <p className="text-xs text-slate-400">No daily rituals recorded yet today.</p>
                      </div>
                    ) : (
                      activeHabitsList.slice(0, 3).map((habit) => (
                        <button
                          key={habit.habitId}
                          onClick={() => toggleHabit(habit.habitId)}
                          className={`w-full min-h-[44px] p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            habit.completed
                              ? 'bg-slate-950/80 border-slate-800 text-slate-400'
                              : 'bg-slate-950 border-slate-800/80 text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              habit.completed ? 'bg-[#C89630] border-[#C89630] text-slate-950' : 'border-slate-600'
                            }`}>
                              {habit.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-xs truncate ${habit.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                              {habit.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {habit.completed ? 'Done' : 'Tap'}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{activeHabitsList.filter(h => h.completed).length} of {activeHabitsList.length} Completed</span>
                  <button onClick={() => setSpeakerTab('habits')} className="text-[#C89630] hover:underline flex items-center gap-1">
                    <span>Full Habit Protocol</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Curriculum Progression / Upcoming Rehearsals */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#C89630] uppercase tracking-wider font-semibold">
                    Curriculum Progression
                  </span>
                  <h3 className="text-sm font-serif font-bold text-white">Upcoming Rehearsals & Sessions</h3>
                </div>
                <button
                  onClick={() => setSpeakerTab('schedule')}
                  className="text-xs text-[#C89630] hover:underline font-mono flex items-center gap-1"
                >
                  <span>View Full Syllabus</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {roadmapSessions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roadmapSessions.slice(0, 2).map((session, idx) => (
                    <div key={session.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                          <span className="text-[#C89630] font-bold">Session 0{idx + 1}</span>
                          <span>{session.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-1">{session.workoutTitle}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                          {session.assignmentNotes || 'High-intensity floor delivery simulation.'}
                        </p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-slate-850 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">{session.time}</span>
                        <button
                          onClick={() => downloadSessionIcs(session)}
                          className="text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>.ICS</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
                  <Calendar className="w-5 h-5 text-slate-600 mx-auto mb-1.5" />
                  <p className="text-xs font-serif font-bold text-slate-300">No Rehearsal Sessions Scheduled</p>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">Your coach will assign upcoming chamber sessions to your calendar.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: Daily Drill & Rehearsal Studio */}
        {speakerTab === 'practice' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`p-2 rounded-xl text-slate-950 font-bold ${
                    isAcademy ? 'bg-emerald-400' : 'bg-teal-400'
                  }`}>
                    <Mic className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                      Today's Featured Drill
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {curriculum.drillTitle}
                    </h2>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                  3-Min Protocol
                </span>
              </div>

              {/* Prompt Card */}
              <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 sm:p-5 mb-6">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  {curriculum.drillCategory}
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {curriculum.drillPrompt}
                </p>
              </div>

              {/* Voice Rehearsal Studio */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center">
                {recordingError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                    {recordingError}
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 h-12 mb-3">
                  {isRecording ? (
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-sm font-mono text-white font-bold">
                        Recording Rehearsal: {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-mono">
                      Microphone standby (Local Preview) • Click Record to begin your rehearsal
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3">
                  {!isRecording ? (
                    <button
                      onClick={handleStartRecording}
                      className={`px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                        isAcademy ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-[#C89630] hover:bg-[#d6a543]'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>Start Voice Recording</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopRecording}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-400 text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      <Square className="w-4 h-4" />
                      <span>Stop Rehearsal Recording</span>
                    </button>
                  )}
                </div>

                {/* Instant Audio Replay & Self-Evaluation */}
                {recordedAudioUrl && (
                  <div className="mt-6 pt-5 border-t border-slate-850 animate-fadeIn text-center">
                    {recordingUploadStatus === 'uploading' && (
                      <div className="text-[10px] uppercase font-mono font-bold text-amber-400 mb-2 flex items-center justify-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Uploading to Server Vault...</span>
                      </div>
                    )}
                    {recordingUploadStatus === 'persisted' && (
                      <div className="text-[10px] uppercase font-mono font-bold text-emerald-400 mb-2 flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Rehearsal Secured to Server Vault</span>
                      </div>
                    )}
                    {recordingUploadStatus === 'failed' && (
                      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 mb-3 max-w-md mx-auto text-left">
                        <div className="text-[11px] font-mono font-bold text-rose-400 flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>Local Audio Preview Only ({pairedClient?.id ? 'Upload Failed' : 'No Server Profile'} — Not in Server Vault)</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          This audio is stored in temporary browser memory and is not saved to your persistent vault. It will be lost on page reload.
                        </p>
                      </div>
                    )}

                    <audio controls src={recordedAudioUrl} className="w-full max-w-md mx-auto my-3 rounded-xl" />

                    <div className="flex items-center justify-center gap-3 mt-3">
                      {recordingUploadStatus === 'failed' && pairedClient?.id && (
                        <button
                          onClick={handleRetryUploadRecording}
                          disabled={recordingUploadStatus === 'uploading'}
                          className="px-4 py-1.5 rounded-lg font-mono text-xs font-bold bg-[#C89630] hover:bg-[#b08328] text-slate-950 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retry Upload to Vault</span>
                        </button>
                      )}
                      <button
                        onClick={handleDiscardRecording}
                        className="px-3 py-1.5 rounded-lg font-mono text-xs text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition cursor-pointer"
                      >
                        {recordingUploadStatus === 'persisted' ? 'Dismiss Preview' : 'Discard Preview'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Persisted Rehearsal Recordings Archive */}
                {persistedRecordings.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-850 text-left">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-slate-300 flex items-center gap-2">
                        <Mic className="w-3.5 h-3.5 text-[#C89630]" />
                        <span>Saved Rehearsal Vault ({persistedRecordings.length})</span>
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Encrypted Storage
                      </span>
                    </div>
                    <div className="space-y-3">
                      {persistedRecordings.map((rec) => (
                        <div key={rec.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-white mb-1">{rec.title}</p>
                            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                              <span>{rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'Recorded'}</span>
                              <span>•</span>
                              <span>{rec.duration_seconds}s duration</span>
                              <span>•</span>
                              <span>{(rec.file_size_bytes / 1024).toFixed(1)} KB</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <AuthenticatedVaultPlayer recordingId={rec.id} />
                            <button
                              onClick={() => handleDeleteRecording(rec.id)}
                              title="Purge rehearsal from vault"
                              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Catharsis & Voice Vault or Executive Speech Vault */}
        {speakerTab === 'catharsis' && (
          <div className="space-y-6 animate-fadeIn">
            {isExecutive ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
                <div className="max-w-2xl mb-6">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C89630] px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    High-Stakes Rehearsal & Simulation Vault
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-black text-white mt-2">
                    Executive Speech & Pitch Vault
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Log and review simulated investor presentations, boardroom defenses, shareholder addresses, and keynote drafts. Calibrate your Bottom Line Upfront (BLUF) delivery and tactical pause execution with {assignedCoachName}.
                  </p>
                </div>

                {!pairedClient?.id && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 text-left flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">Incomplete Profile Link</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Your session is not currently paired with a verified server profile. Please complete speaker onboarding to unlock durable vault persistence for your simulations.
                      </p>
                    </div>
                  </div>
                )}

                {/* New Executive Simulation Form */}
                <form onSubmit={handleSaveExecSimulation} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-8 space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Target Presentation Arena & Objective
                    </label>
                    <select
                      value={execArena}
                      onChange={(e) => setExecArena(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#C89630] focus:outline-hidden"
                    >
                      <option>Series A / Growth Capital Venture Pitch</option>
                      <option>Executive Boardroom Strategic Review</option>
                      <option>Global Industry Keynote (1,000+ Attendees)</option>
                      <option>All-Hands Townhall & Vision Address</option>
                      <option>Crisis Communications & Media Defense</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Keynote / Speech Outline & Core Thesis (BLUF)
                    </label>
                    <textarea
                      rows={4}
                      value={execSimulationText}
                      onChange={(e) => setExecSimulationText(e.target.value)}
                      placeholder="Outline your primary thesis, bottom-line upfront declaration, data proof-points, and anticipated boardroom objections..."
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#C89630] focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C89630]" />
                      <span>Orator Vault Persistence • Authenticated & Durable</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingExec}
                      className="px-5 py-2 rounded-xl bg-[#C89630] hover:bg-[#d6a543] text-slate-950 font-bold text-xs shadow-md shadow-[#C89630]/20 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingExec ? 'Saving...' : 'Save Rehearsal Note'}
                    </button>
                  </div>
                </form>

                {/* Past Executive Simulations */}
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                  Executive Rehearsal & Pitch History
                </h3>
                <div className="space-y-3">
                  {execEntries.length > 0 ? (
                    execEntries.map(entry => (
                      <div key={entry.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400">{entry.date}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                              {entry.arena}
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                            {entry.coachStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed mb-3">
                          "{entry.summary}"
                        </p>
                        <div className="flex items-center gap-4 text-[10px] pt-2 border-t border-slate-900 text-slate-400 font-mono">
                          <span>Pacing: <strong className="text-white">{entry.wpm} WPM</strong></span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8 bg-slate-950 border border-slate-800/80 rounded-2xl">
                      <p className="text-xs text-slate-400">No executive rehearsal notes logged yet. Outline your thesis above.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="max-w-2xl mb-6">
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                  Private Expression Vault
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                  Speaking as a Form of Escapism
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  Decades of patriarchal and colonial conditioning told us that emotional vulnerability is dangerous. Here, your voice is your catharsis. Log your reflections, vocalize what you carry, and feel the lightness that follows.
                </p>
              </div>

              {!pairedClient?.id && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 text-left flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">Incomplete Profile Link</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Your session is not currently paired with a verified server profile. Please complete speaker onboarding to unlock durable vault persistence for your reflections.
                    </p>
                  </div>
                </div>
              )}

              {/* New Reflection Form */}
              <form onSubmit={handleSaveJournal} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-8 space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    State of Mind Before Speaking
                  </label>
                  <select
                    value={journalFeelBefore}
                    onChange={(e) => setJournalFeelBefore(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                  >
                    <option>Anxious & Suppressed</option>
                    <option>Bottled Anger & Frustration</option>
                    <option>Overwhelmed by Expectations</option>
                    <option>Grieving a Hidden Burden</option>
                    <option>Seeking Clarity & Courage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Vocal Reflection Notes / Words Spoken Aloud
                  </label>
                  <textarea
                    rows={4}
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Write or summarize what you vocalized during your cathartic session today..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>Orator Vault Persistence • Authenticated & Durable</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingJournal}
                    className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingJournal ? 'Saving...' : 'Save Reflection'}
                  </button>
                </div>
              </form>

              {/* Past Vault Entries */}
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                Previous Catharsis Releases
              </h3>
              <div className="space-y-3">
                {journalEntries.length > 0 ? (
                  journalEntries.map(entry => (
                    <div key={entry.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-slate-400">{entry.date}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                          Vocalized
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed mb-3">
                        "{entry.text}"
                      </p>
                      <div className="flex items-center gap-2 text-[10px] pt-2 border-t border-slate-900 text-slate-400">
                        <span>Before: <strong className="text-rose-300">{entry.feelBefore}</strong></span>
                        <span>→</span>
                        <span>After: <strong className="text-emerald-400">{entry.feelAfter}</strong></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 bg-slate-950 border border-slate-800/80 rounded-2xl">
                    <p className="text-xs text-slate-400">No reflections logged yet. Record your first private expression above.</p>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        )}

        {/* TAB 3: My Sessions & Rounds */}
        {speakerTab === 'schedule' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-[#C89630] uppercase mb-1">
                    Executive Oratory Syllabus · Dynamic Roadmap
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white">
                    {execProgram.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    A rigorous 4-week, 8-session executive protocol. Live 1-on-1 consultations scheduled twice weekly on <span className="text-slate-200 font-semibold">Tuesdays & Thursdays (90 minutes each)</span>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                    <span className="text-emerald-400 font-bold">{roadmapSessions.length}</span> Sessions Total
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-[#C89630]">
                    90 Min / Session
                  </div>
                </div>
              </div>

              {/* Sessions Roadmap List */}
              <div className="mt-6 space-y-4">
                {roadmapSessions.length > 0 ? (
                  roadmapSessions.map((session, idx) => {
                    const weekNum = Math.floor(idx / 2) + 1;
                    const isExpanded = expandedSessionId === session.id;
                    const isConfirmed = session.status === 'Confirmed' || idx === 0;

                    return (
                      <div
                        key={session.id}
                        className="bg-slate-950 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-md"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <Calendar className="w-5 h-5" />
                            </div>

                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-mono tracking-widest text-[#C89630] uppercase">
                                  Week {weekNum} · Session {idx + 1}
                                </span>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-wider ${
                                  isConfirmed
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                  {isConfirmed ? 'Confirmed' : 'Scheduled'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  {session.date} • {session.time || '10:00 AM (90 Mins)'}
                                </span>
                              </div>

                              <h3 className="text-base font-serif font-bold text-white tracking-tight">
                                {session.workoutTitle}
                              </h3>

                              {/* Session Objectives */}
                              {session.objectives && session.objectives.length > 0 && (
                                <div className="pt-2">
                                  <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1 mb-1">
                                    <Target className="w-3 h-3 text-[#C89630]" />
                                    <span>Core Objectives:</span>
                                  </div>
                                  <ul className="space-y-1 text-xs text-slate-300">
                                    {session.objectives.map((obj, oIdx) => (
                                      <li key={oIdx} className="flex items-start gap-2">
                                        <span className="text-[#C89630] font-bold shrink-0">•</span>
                                        <span className="leading-relaxed">{obj}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Practical Assignment */}
                              {session.assignmentNotes && (
                                <div className="mt-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block">Action Assignment:</span>
                                    <span className="text-slate-200">{session.assignmentNotes}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions: Join Room + Add to Calendar */}
                          <div className="flex sm:flex-row lg:flex-col items-stretch gap-2 shrink-0 self-stretch lg:self-start lg:w-44 pt-2 lg:pt-0">
                            <button
                              onClick={() => {
                                setActiveChamberTitle(session.workoutTitle);
                                setIsLiveRehearsalOpen(true);
                              }}
                              className="flex-1 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Video className="w-4 h-4" />
                              <span>Join Chamber</span>
                            </button>

                            <button
                              onClick={() => downloadSessionIcs(session)}
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Add to Calendar</span>
                            </button>

                            {session.phases && session.phases.length > 0 && (
                              <button
                                onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-800/80 text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>{isExpanded ? 'Hide Protocol' : 'View Protocol Breakdown'}</span>
                                <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expandable Protocol Breakdown */}
                        {isExpanded && session.phases && (
                          <div className="mt-4 pt-4 border-t border-slate-900 space-y-2">
                            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                              90-Minute Rehearsal Protocol
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {session.phases.map((phase, pIdx) => (
                                <div key={phase.id || pIdx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-850 text-xs">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-white mb-1">
                                    <span>{pIdx + 1}. {phase.phaseName}</span>
                                    <span className="text-[#C89630] font-mono font-normal">{phase.durationMin}m</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{phase.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-8 text-center">
                    <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-serif font-bold text-white">No Scheduled Rehearsal Sessions</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto font-sans">
                      Your coach has not yet scheduled upcoming chamber sessions for your profile. When new consultation or rehearsal rounds are added to the roster, they will appear here with calendar sync.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Daily Orator Rituals & Habits */}
        {speakerTab === 'habits' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Daily Orator Rituals
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Check off your habits each day to track your practice consistency.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-xs">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{activeHabitsList.filter(h => h.completed).length} / {activeHabitsList.length} Completed</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {activeHabitsList.length === 0 ? (
                  <div className="py-10 px-6 rounded-2xl bg-slate-950/60 border border-slate-850 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-medium text-slate-300">No daily orator rituals active</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Daily habits configured during onboarding or assigned by your coach will appear here for daily tracking.
                    </p>
                  </div>
                ) : (
                  activeHabitsList.map((habit) => (
                    <button
                      key={habit.habitId}
                      type="button"
                      onClick={() => toggleHabit(habit.habitId)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        habit.completed
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                            habit.completed ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'
                          }`}
                        >
                          {habit.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-xs font-semibold ${habit.completed ? 'text-white line-through opacity-80' : 'text-slate-200'}`}>
                          {habit.title}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-slate-500">
                        {habit.completed ? 'Completed Today' : 'Tap to Complete'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Longitudinal Speech Analytics */}
        {speakerTab === 'progress' && (
          <div id="panel-progress" role="tabpanel" aria-labelledby="tab-progress" className="space-y-6 animate-fadeIn">
            {/* Header / Editorial Overview */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-[#C89630] uppercase mb-1">
                    Oratorical Trajectory · Longitudinal Speech Analytics
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white">
                    Vocal Velocity & Cadence Analytics
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Longitudinal tracking of vocal delivery rate (WPM), articulation clarity, and Bottom Line Up Front (BLUF) discipline across rehearsal chambers.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                    Target: <span className="text-[#C89630] font-bold">135–145 WPM</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                    {roadmapSessions.length} {roadmapSessions.length === 1 ? 'Session' : 'Sessions'} Logged
                  </div>
                </div>
              </div>

              {/* 4-Metric Responsive Grid: 2 cols on mobile, 4 on desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Average Pace</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-white">
                      {avgWpm ? avgWpm : (profile.vocalBaselinePace || '—')}
                    </span>
                    <span className="text-xs font-mono text-slate-400">WPM</span>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span>{avgWpm ? 'Rehearsal average' : 'Self-reported baseline'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Consonant Clarity</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-white">—</span>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <span>Awaiting acoustic evaluation</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">BLUF Precision</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-white">—</span>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <span>Awaiting speech adjudication</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Filler Frequency</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-white">—</span>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <span>Awaiting cadence analysis</span>
                  </div>
                </div>
              </div>

              {/* Longitudinal Pacing Trajectory Visualization */}
              <div className="mt-6 p-5 rounded-2xl bg-slate-950 border border-slate-850">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Delivery Rate Trajectory · Last 6 Rehearsals
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Target corridor: 135–145 Words Per Minute (balanced executive tempo)
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#C89630]" /> Rehearsal Pace
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-slate-700" /> Target Floor
                    </span>
                  </div>
                </div>

                {/* Trajectory Bar Chart */}
                {speakerMetrics.length > 0 ? (
                  <div className="grid grid-cols-6 gap-2 sm:gap-4 pt-6 pb-2 items-end h-40 border-b border-slate-800/80">
                    {speakerMetrics.slice(-6).map((item, idx) => {
                      const wpm = item.weight || profile.vocalBaselinePace || 140;
                      const heightPercent = Math.min(100, Math.max(20, ((wpm - 100) / 60) * 100));
                      const isOptimal = wpm >= 135 && wpm <= 145;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                          <span className="text-[10px] font-mono text-slate-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            {wpm}
                          </span>
                          <div className="w-full max-w-[36px] bg-slate-900 rounded-t-lg overflow-hidden flex flex-col justify-end h-28 relative">
                            <div className="absolute inset-x-0 bottom-[58%] border-t border-dashed border-[#C89630]/30 pointer-events-none" />
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full rounded-t-md transition-all ${
                                isOptimal ? 'bg-[#C89630]' : 'bg-slate-700'
                              }`}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 mt-1">R-0{idx + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center border-b border-slate-800/80 text-center p-4">
                    <Activity className="w-5 h-5 text-slate-600 mb-1.5" />
                    <p className="text-xs font-serif font-bold text-slate-300">Pacing Trajectory Awaiting Chamber Drills</p>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Baseline: {profile.vocalBaselinePace ? `${profile.vocalBaselinePace} WPM` : '—'}. Trajectory bars will plot as chamber workouts are logged.
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2">
                  <span>Initial Baseline: {profile.vocalBaselinePace ? `${profile.vocalBaselinePace} WPM` : '—'}</span>
                  <span>Latest Rehearsal: {speakerMetrics.length > 0 ? `${speakerMetrics[speakerMetrics.length - 1].weight} WPM` : '—'}</span>
                </div>
              </div>
            </div>

            {/* Historical Evaluations List */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                    Historical Evaluations & Debrief Archive
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Detailed scoring, coach feedback directives, and recorded parameters from previous chamber workouts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveChamberTitle(isExecutive ? 'Executive Public Speaking Chamber' : 'Live Rehearsal Chamber');
                    setIsLiveRehearsalOpen(true);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#C89630] hover:bg-[#d6a543] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-[#C89630]/20 shrink-0 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Launch Chamber Rehearsal</span>
                </button>
              </div>

              <div className="mt-5 space-y-3.5">
                {speakerEvaluations.length > 0 ? (
                  speakerEvaluations.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-850 hover:border-slate-800 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-900">
                        <div>
                          <div className="text-[10px] font-mono text-[#C89630] uppercase tracking-wider">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'} · {item.evaluatorName || 'Faculty Adjudicator'}
                          </div>
                          <h4 className="text-sm font-bold text-white mt-0.5">{item.category}</h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                            Score {item.rating}/10
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-slate-300 leading-relaxed font-sans">
                        <span className="font-semibold text-slate-200">Evaluator Feedback: </span>
                        "{item.note}"
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 bg-slate-950 border border-slate-800/80 rounded-2xl">
                    <Award className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <h4 className="text-sm font-serif font-bold text-white">No Formal Evaluations Logged</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto font-sans">
                      Scored evaluations and panel adjudication debriefs from faculty coaches will be archived here after your chamber reviews.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Coach 2-Way Chat */}
        {speakerTab === 'coach' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col h-[520px]">
              {!assignedCoach && (
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 mb-3 text-left flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-[#C89630] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-bold text-amber-300 uppercase tracking-wider font-mono">Faculty Triage & Allocation</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      A faculty coach is not yet assigned to your account. Your inquiries and practice submissions route directly to Head Coach Qassim and the Global Orators Faculty Desk.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-sm">
                    {assignedCoachInitials}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white">{assignedCoachName}</h3>
                    <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">
                      {assignedCoachTitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveChamberTitle(isExecutive ? 'Executive Public Speaking Chamber' : 'Live Rehearsal Chamber');
                      setIsLiveRehearsalOpen(true);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer ${
                      isExecutive ? 'bg-[#C89630] hover:bg-[#d6a543]' : 'bg-emerald-500 hover:bg-emerald-400'
                    }`}
                    title="Start Live Rehearsal Room"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Live Rehearsal</span>
                  </button>
                  <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">Direct Faculty Thread</span>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                {displayedMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-slate-500 italic">
                    Start a conversation with your coach
                  </div>
                ) : (
                  displayedMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg.sender === 'client' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'client'
                            ? isExecutive
                              ? 'bg-[#C89630] text-slate-950 font-medium rounded-br-none'
                              : 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'
                            : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={clientMessageInput}
                  onChange={(e) => setClientMessageInput(e.target.value)}
                  placeholder={
                    isExecutive
                      ? `Ask ${assignedCoach ? assignedCoach.name : 'the Faculty Coaching Desk'} about your pitch deck, boardroom presentation, or pacing...`
                      : `Ask ${assignedCoach ? assignedCoach.name : 'the Faculty Coaching Desk'} about your speech, pacing, or catharsis...`
                  }
                  className="flex-1 h-10 px-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className={`h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer ${
                    isExecutive
                      ? 'bg-[#C89630] hover:bg-[#d6a543] text-slate-950 shadow-[#C89630]/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible on mobile screens < md) */}
      <SpeakerMobileBottomNav
        speakerTab={speakerTab}
        setSpeakerTab={setSpeakerTab}
        onOpenLiveRehearsal={() => {
          setActiveChamberTitle(
            isExecutive
              ? 'The 60-Second Venture Genesis'
              : isAcademy
                ? 'Syllogistic Framing & Whip Extension'
                : 'Unfiltered Cathartic Voice Journaling'
          );
          setIsLiveRehearsalOpen(true);
        }}
        isExecutive={isExecutive}
        isAcademy={isAcademy}
        unreadCount={0}
      />

      {/* Embedded Live Rehearsal Studio Modal */}
      <LiveRehearsalRoom
        isOpen={isLiveRehearsalOpen}
        onClose={() => setIsLiveRehearsalOpen(false)}
        roomTitle={activeChamberTitle}
        speakerName={profile.fullName}
        speakerId={pairedClient?.id}
        userRole="speaker"
        branch={profile.branch}
        onSaveFeedback={({ wpm, score }) => {
          showToast(`Rehearsal logged: ${wpm} WPM · Score: ${score}/10`);
        }}
      />
    </div>
  );
};
