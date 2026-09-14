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
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BranchType, SpeakerOnboardingData, ScheduledWorkout } from '../../types';
import { resolveSpeakerCurriculum } from '../../utils/curriculumResolver';
import { LiveRehearsalRoom } from '../live/LiveRehearsalRoom';
import { SEOHead } from '../common/SEOHead';
import { SpeakerMobileBottomNav } from './SpeakerMobileBottomNav';

export type SpeakerTabType = 'today' | 'practice' | 'catharsis' | 'schedule' | 'habits' | 'progress' | 'coach';

export const ClientPortal: React.FC = () => {
  const { 
    activeSpeakerProfile, 
    setActiveSpeakerProfile, 
    setCurrentPortal, 
    showToast,
    resetOnboarding,
    clients,
    programs,
    scheduledWorkouts,
    messages,
    sendMessage,
    habitLogs,
    toggleHabitCompletion
  } = useApp();

  const [isLiveRehearsalOpen, setIsLiveRehearsalOpen] = useState(false);
  const [activeChamberTitle, setActiveChamberTitle] = useState('Executive Public Speaking Chamber');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const profile = useMemo(() => activeSpeakerProfile || {
    branch: 'Foundation' as BranchType,
    fullName: 'Guest Speaker',
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

  const isAcademy = profile.branch === 'Academy';
  const curriculum = useMemo(() => resolveSpeakerCurriculum(profile), [profile]);

  // Match client and program
  const pairedClient = useMemo(() => {
    return clients.find(c => 
      (c.email && profile.email && c.email.toLowerCase() === profile.email.toLowerCase()) ||
      (c.name && profile.fullName && c.name.toLowerCase() === profile.fullName.toLowerCase())
    );
  }, [clients, profile]);

  const execProgram = useMemo(() => {
    return programs.find(p => p.id === (pairedClient?.currentProgramId || 'prog-exec-speaking-1')) ||
           programs.find(p => p.id === 'prog-exec-speaking-1') ||
           programs[0];
  }, [programs, pairedClient]);

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

  // Derived Dynamic Roadmap Sessions (Tuesdays and Thursdays, 90 mins)
  const roadmapSessions = useMemo(() => {
    if (pairedClient) {
      const matchedWorkouts = scheduledWorkouts.filter(w => w.clientId === pairedClient.id);
      if (matchedWorkouts.length > 0) {
        return matchedWorkouts;
      }
    }

    if (!execProgram?.days) return [];

    return execProgram.days.map((day, idx) => {
      const weekNumber = Math.floor(idx / 2) + 1;
      const isTue = idx % 2 === 0;
      const dayLabel = isTue ? 'Tuesday' : 'Thursday';

      return {
        id: `sched-roadmap-${idx + 1}`,
        clientId: pairedClient?.id || 'client-active',
        clientName: profile.fullName,
        clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        programId: execProgram.id,
        programName: execProgram.title,
        workoutDayId: day.id,
        workoutTitle: day.name,
        date: `${dayLabel} · Week ${weekNumber}`,
        time: '10:00 AM - 11:30 AM (90 Mins)',
        status: (idx === 0 ? 'Confirmed' : 'Scheduled') as 'Scheduled' | 'Confirmed',
        durationMin: day.durationMinutes || 90,
        objectives: day.objectives || [],
        phases: day.phases || [],
        assignmentNotes: day.assignmentNotes || '',
        chamberRoomName: `chamber-${(profile.fullName || 'executive').toLowerCase().replace(/[^a-z0-9]/g, '-')}-round-${idx + 1}`,
        exercises: day.exercises || []
      } as ScheduledWorkout;
    });
  }, [pairedClient, scheduledWorkouts, execProgram, profile.fullName]);

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
      `DESCRIPTION:Executive Public Speaking 90-Minute Live Consultation & Drill Protocol with Head Coach Qassim.\\nRoom: ${session.chamberRoomName || 'live-chamber'}\\nAssignments: ${session.assignmentNotes || 'Prepared speech simulation.'}`,
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

  // Simulated Voice Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  const [recordedFeedback, setRecordedFeedback] = useState<{
    wpm: number;
    clarity: number;
    fillers: number;
    catharsisScore: number;
  } | null>(null);

  // Journal entries for Catharsis Vault (Foundation Track)
  const [journalText, setJournalText] = useState('');
  const [journalFeelBefore, setJournalFeelBefore] = useState('Anxious & Suppressed');
  const [journalEntries, setJournalEntries] = useState<{
    id: string;
    date: string;
    text: string;
    feelBefore: string;
    feelAfter: string;
    audioLength: string;
  }[]>([]);

  // Executive Speech Vault State (Executive Track)
  const [execArena, setExecArena] = useState('Series A / Growth Capital Venture Pitch');
  const [execSimulationText, setExecSimulationText] = useState('');
  const [execEntries, setExecEntries] = useState<{
    id: string;
    date: string;
    arena: string;
    summary: string;
    wpm: number;
    blufScore: number;
    coachStatus: string;
  }[]>([]);

  // Daily Habits State in Client Portal using backend via context
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentClientHabitLog = useMemo(() => {
    return habitLogs.find(l => l.clientId === (pairedClient?.id || 'client-1') && l.date === todayStr);
  }, [habitLogs, pairedClient?.id, todayStr]);

  const habitsStatus = useMemo(() => {
    const status: { [title: string]: boolean } = {};
    if (currentClientHabitLog) {
      currentClientHabitLog.habits.forEach(h => {
        status[h.title] = h.completed;
      });
    }
    (profile.selectedHabits || []).forEach(h => {
      if (status[h] === undefined) status[h] = false;
    });
    return status;
  }, [currentClientHabitLog, profile.selectedHabits]);

  // Client to Coach simulated messages initialized with empty context
  const [clientMessageInput, setClientMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'client' | 'coach'; text: string; time: string }[]>([]);



  // Merged message list from shared AppContext messages
  const displayedMessages = useMemo(() => {
    if (pairedClient) {
      const clientMsgs = messages.filter(m => m.clientId === pairedClient.id);
      if (clientMsgs.length > 0) {
        return clientMsgs.map(m => ({
          sender: m.sender,
          text: m.text,
          time: m.timestamp
        }));
      }
    }
    return chatMessages;
  }, [messages, pairedClient, chatMessages]);

  // Toggle habit check via Backend
  const toggleHabit = (title: string) => {
    const clientIdToUse = pairedClient?.id || 'client-1';
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Attempt to map title back to habitId if available, else use a hash or just title as ID 
    // In AppContext, habit ID is needed but it accepts anything. Let's pass title.
    toggleHabitCompletion(clientIdToUse, todayStr, title);
    showToast(`Toggled habit status for: ${title}`);
  };

  // Recording Simulation Handlers
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingCompleted(false);
    setRecordedFeedback(null);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setRecordingCompleted(true);
    setRecordedFeedback(null);
    showToast('Rehearsal processed! Analysis coming soon.');
  };

  // Add Journal Entry
  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    const newEntry = {
      id: `j-${Date.now()}`,
      date: 'Just now',
      text: journalText.trim(),
      feelBefore: journalFeelBefore,
      feelAfter: 'Relieved, Grounded & Sovereign',
      audioLength: '2 min 45 sec'
    };

    setJournalEntries([newEntry, ...journalEntries]);
    setJournalText('');
    showToast('Reflection logged in your private Catharsis Vault.');
  };

  // Add Executive Simulation Entry
  const handleSaveExecSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!execSimulationText.trim()) return;

    const newEntry = {
      id: `exec-${Date.now()}`,
      date: 'Just now',
      arena: execArena,
      summary: execSimulationText.trim(),
      wpm: profile.vocalBaselinePace || 138,
      blufScore: 95,
      coachStatus: 'Queued for Coach Qassim Review'
    };

    setExecEntries([newEntry, ...execEntries]);
    setExecSimulationText('');
    showToast('Simulation logged in your Executive Speech Vault.');
  };

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

    setChatMessages(prev => [
      ...prev,
      {
        sender: 'client' as const,
        text: textToSend,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setClientMessageInput('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      <SEOHead
        title="Speaker Practice Studio"
        description="Private rehearsal vault, catharsis voice recorder, and drill studio for Global Orators speakers."
        canonicalPath="/speaker"
        noIndex={true}
      />
      {/* 1. Speaker App Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-black text-sm text-slate-950 shadow-md ${
            isExecutive ? 'bg-[#C89630]' : isAcademy ? 'bg-[#C89630]' : 'bg-teal-400'
          }`}>
            {profile.fullName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-serif font-bold text-white leading-tight truncate">
                {profile.fullName}
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
            <p className="text-[10px] font-mono text-slate-400 truncate max-w-[200px] xs:max-w-xs sm:max-w-md">
              {profile.institution ? `${profile.institution} • ` : ''}{profile.primaryDiscipline || profile.missionFocus}
            </p>
          </div>
        </div>

        {/* Action Controls in Header: Messages & Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setSpeakerTab('coach')}
            aria-label="Direct message thread with Coach Qassim"
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-mono transition-colors"
            title="Direct message thread with Coach Qassim"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#C89630]" />
            <span className="hidden sm:inline">Coach Thread</span>
          </button>

          {/* Profile & Workspace Menu Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              aria-label="Speaker workspace profile and settings menu"
              className="min-h-[44px] flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono transition-colors"
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs text-slate-950 ${
                isExecutive ? 'bg-[#C89630]' : isAcademy ? 'bg-[#C89630]' : 'bg-teal-400'
              }`}>
                {profile.fullName.charAt(0)}
              </div>
              <span className="hidden sm:inline font-sans font-medium text-white">{profile.fullName.split(' ')[0]}</span>
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
                  <div className="font-bold text-white text-sm truncate">{profile.fullName}</div>
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
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Open Coach OS</span>
                </button>
                <button
                  onClick={() => { setCurrentPortal('landing'); setIsProfileMenuOpen(false); }}
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Return to Public Site</span>
                </button>
                <button
                  onClick={() => { resetOnboarding(); setIsProfileMenuOpen(false); }}
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  <span>Recalibrate Track Preferences</span>
                </button>

                <div className="my-1.5 border-t border-slate-800" />

                {/* Destructive Sign Out */}
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setActiveSpeakerProfile(null);
                    localStorage.removeItem('globalorators_speaker_profile');
                    setCurrentPortal('landing');
                    showToast('Signed out of speaker profile.');
                  }}
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl text-left flex items-center gap-2 text-rose-300 hover:bg-rose-950/40 hover:text-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Speaker Segmented Navigation Bar (Desktop md+) */}
      <div className="hidden md:block bg-slate-900/70 border-b border-slate-800/80 px-4 sm:px-6 py-2 overflow-x-auto no-scrollbar">
        <div role="tablist" aria-label="Speaker Navigation" className="max-w-5xl mx-auto flex items-center gap-1.5 sm:gap-2">
          {[
            { id: 'today', label: "Today's Floor", icon: Compass },
            { id: 'practice', label: 'Daily Drill Studio', icon: Mic },
            { id: 'catharsis', label: isExecutive ? 'Executive Speech Vault' : 'Catharsis & Voice Vault', icon: isExecutive ? Briefcase : Heart },
            { id: 'schedule', label: isExecutive ? 'Executive Syllabus & Roadmap' : 'My Sessions & Rounds', icon: Calendar },
            { id: 'habits', label: 'Daily Orator Rituals', icon: CheckCircle2 },
            { id: 'progress', label: 'Speech Analytics', icon: TrendingUp },
            { id: 'coach', label: 'Coach Qassim (2-Way)', icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = speakerTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setSpeakerTab(tab.id as any)}
                className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? isExecutive
                      ? 'bg-[#C89630] text-slate-950 shadow-md shadow-[#C89630]/20'
                      : isAcademy
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Portal Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
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
                      Today's Rehearsal
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>42 min estimated duration</span>
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
                        <span>{isExecutive ? 'Hold deliberate 2-second pauses before strategic claims' : 'Engage deepest opposing mechanism with 2-point refutation'}</span>
                      </div>
                      <div className="flex items-start gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                        <CheckCircle2 className="w-4 h-4 text-[#C89630] shrink-0 mt-0.5" />
                        <span>{isExecutive ? 'Bridge adversarial Q&A back to core unit economics' : 'Maintain target vocal pace at 138–148 WPM'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Block */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-56">
                  <button
                    onClick={() => {
                      setActiveChamberTitle(
                        isExecutive 
                          ? 'The 60-Second Venture Genesis' 
                          : isAcademy 
                            ? 'Syllogistic Framing & Whip Extension' 
                            : 'Unfiltered Cathartic Voice Journaling'
                      );
                      setIsLiveRehearsalOpen(true);
                    }}
                    className="min-h-[48px] px-6 py-3.5 rounded-xl bg-[#C89630] hover:bg-[#d6a543] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C89630]/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Begin Rehearsal</span>
                  </button>

                  <button
                    onClick={() => setSpeakerTab('coach')}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#C89630]" />
                    <span>Message Coach</span>
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
                <div className="text-[10px] font-mono text-emerald-400 mt-1">Optimal Cadence</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4.5 transition-colors hover:border-slate-700/80">
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">Clarity</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white mt-1 tracking-tight">
                  —
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Top 5% Tier</div>
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
                  {isExecutive ? 'High-Stakes Gravitas' : isAcademy ? 'WUDC Standard' : 'Vulnerability Level'}
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
                        <span className="text-[10px] text-slate-400">Head Coach Qassim · Verified Dispatch</span>
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

                  {/* Audio Dispatch Snippet */}
                  <div className="mt-4 bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <button
                      onClick={() => showToast('Playing Coach Qassim voice dispatch: "Calibration on BLUF timing and vocal resonance"')}
                      aria-label="Play Coach Qassim voice dispatch"
                      className="min-h-[44px] min-w-[44px] rounded-xl bg-[#C89630] text-slate-950 flex items-center justify-center font-bold hover:bg-[#d6a543] transition-colors shrink-0 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-mono text-slate-200 truncate">Voice Dispatch · Circle 07 Briefing</div>
                      <div className="text-[10px] font-mono text-slate-400">0:45 min · High-Fidelity Voice Note</div>
                      <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                        <div className="bg-[#C89630] h-full w-2/5" />
                      </div>
                    </div>
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
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      6-Day Streak
                    </span>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(habitsStatus).slice(0, 3).map(([title, completed]) => (
                      <button
                        key={title}
                        onClick={() => toggleHabit(title)}
                        className={`w-full min-h-[44px] p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          completed 
                            ? 'bg-slate-950/80 border-slate-800 text-slate-400' 
                            : 'bg-slate-950 border-slate-800/80 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            completed ? 'bg-[#C89630] border-[#C89630] text-slate-950' : 'border-slate-600'
                          }`}>
                            {completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-xs truncate ${completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                            {title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {completed ? 'Done' : 'Tap'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{Object.values(habitsStatus).filter(Boolean).length} of {Object.keys(habitsStatus).length} Completed</span>
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

              {/* Interactive Audio Recording Simulation */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center">
                <div className="flex items-center justify-center gap-1.5 h-12 mb-3">
                  {isRecording ? (
                    Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full animate-pulse ${
                          isAcademy ? 'bg-emerald-400' : 'bg-teal-400'
                        }`}
                        style={{
                          height: `${Math.max(15, (Math.sin(i + Date.now()) * 0.5 + 0.5) * 45)}px`,
                          animationDuration: `${0.3 + (i % 5) * 0.1}s`
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 font-mono">
                      Microphone standby • Click Record to begin your rehearsal
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3">
                  {!isRecording ? (
                    <button
                      onClick={handleStartRecording}
                      className={`px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 flex items-center gap-2 shadow-lg transition-all ${
                        isAcademy ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-teal-400 hover:bg-teal-300'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>Start Voice Recording</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopRecording}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-400 text-white flex items-center gap-2 shadow-lg transition-all animate-pulse"
                    >
                      <Square className="w-4 h-4" />
                      <span>Stop & Analyze Speech</span>
                    </button>
                  )}
                </div>

                {/* Instant Metric Feedback Display */}
                {recordingCompleted && !recordedFeedback && (
                  <div className="mt-6 pt-5 border-t border-slate-850 animate-fadeIn text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center justify-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Analysis coming soon</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Your speech rehearsal has been logged. Advanced delivery metrics and coach review will be available shortly.
                    </p>
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
                    Log and review simulated investor presentations, boardroom defenses, shareholder addresses, and keynote drafts. Calibrate your Bottom Line Upfront (BLUF) delivery and tactical pause execution with Coach Qassim.
                  </p>
                </div>

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
                      <span>Encrypted executive repository • Reviewed by Head Coach Qassim</span>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#C89630] hover:bg-[#d6a543] text-slate-950 font-bold text-xs shadow-md shadow-[#C89630]/20 cursor-pointer"
                    >
                      Log into Executive Vault
                    </button>
                  </div>
                </form>

                {/* Past Executive Simulations */}
                <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                  Executive Rehearsal & Pitch History
                </h3>
                <div className="space-y-3">
                  {execEntries.map(entry => (
                    <div key={entry.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400">{entry.date}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                            {entry.arena}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                          {entry.coachStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed mb-3">
                        "{entry.summary}"
                      </p>
                      <div className="flex items-center gap-4 text-[10px] pt-2 border-t border-slate-900 text-slate-400 font-mono">
                        <span>Pacing: <strong className="text-white">{entry.wpm} WPM</strong></span>
                        <span>•</span>
                        <span>BLUF Score: <strong className="text-[#C89630]">{entry.blufScore}%</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="max-w-2xl mb-6">
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                  Private & Encrypted Expression Vault
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                  Speaking as a Form of Escapism
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  Decades of patriarchal and colonial conditioning told us that emotional vulnerability is dangerous. Here, your voice is your catharsis. Log your reflections, vocalize what you carry, and feel the lightness that follows.
                </p>
              </div>

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
                    <span>Encrypted with personal privacy protection</span>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20"
                  >
                    Record into Vault
                  </button>
                </div>
              </form>

              {/* Past Vault Entries */}
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                Previous Catharsis Releases
              </h3>
              <div className="space-y-3">
                {journalEntries.map(entry => (
                  <div key={entry.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-400">{entry.date}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                        {entry.audioLength} Spoken
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
                ))}
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
                {roadmapSessions.map((session, idx) => {
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
                              <Layers className="w-3 h-3" />
                              <span>{isExpanded ? 'Hide Agenda' : '90m Breakdown'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable 6-Phase 90-Minute Structure Breakdown */}
                      {isExpanded && session.phases && session.phases.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-800/80 animate-fadeIn">
                          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-3">
                            90-Minute Structured Session Blueprint
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {session.phases.map((phase, pIdx) => (
                              <div
                                key={pIdx}
                                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <span className="text-[#C89630] font-bold">Phase {phase.phaseNumber}</span>
                                  <span className="text-slate-400 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" /> {phase.durationMinutes} min
                                  </span>
                                </div>
                                <div className="font-bold text-slate-200 text-xs">{phase.title}</div>
                                <p className="text-[11px] text-slate-400 leading-snug">{phase.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
                    Check off your habits each day to maintain your 6-day speaker streak.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-xs">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Streak: 6 Days</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {Object.entries(habitsStatus).map(([title, completed]) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => toggleHabit(title)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      completed
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                          completed ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'
                        }`}
                      >
                        {completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs font-semibold ${completed ? 'text-white line-through opacity-80' : 'text-slate-200'}`}>
                        {title}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      {completed ? 'Completed Today' : 'Tap to Complete'}
                    </span>
                  </button>
                ))}
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
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
                    10 Sessions Logged
                  </div>
                </div>
              </div>

              {/* 4-Metric Responsive Grid: 2 cols on mobile, 4 on desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Average Pace</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-white">136</span>
                    <span className="text-xs font-mono text-slate-400">WPM</span>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span>Within target window</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Consonant Clarity</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-white">94</span>
                    <span className="text-xs font-mono text-slate-400">%</span>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-teal-400 flex items-center gap-1">
                    <span>High articulation score</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">BLUF Precision</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-white">95</span>
                    <span className="text-xs font-mono text-slate-400">/ 100</span>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-[#C89630] flex items-center gap-1">
                    <span>Executive synthesis</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Filler Frequency</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-white">1.1</span>
                    <span className="text-xs font-mono text-slate-400">/ min</span>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span>-42% vs baseline</span>
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
                <div className="grid grid-cols-6 gap-2 sm:gap-4 pt-6 pb-2 items-end h-40 border-b border-slate-800/80">
                  {[
                    { session: 'R-01', wpm: 152, date: 'Aug 26' },
                    { session: 'R-02', wpm: 146, date: 'Aug 29' },
                    { session: 'R-03', wpm: 141, date: 'Sep 02' },
                    { session: 'R-04', wpm: 139, date: 'Sep 05' },
                    { session: 'R-05', wpm: 134, date: 'Sep 09' },
                    { session: 'R-06', wpm: 138, date: 'Yesterday' }
                  ].map((item, idx) => {
                    const heightPercent = Math.min(100, Math.max(20, ((item.wpm - 100) / 60) * 100));
                    const isOptimal = item.wpm >= 135 && item.wpm <= 145;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[10px] font-mono text-slate-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.wpm}
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
                        <span className="text-[10px] font-mono text-slate-400 mt-1">{item.session}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2">
                  <span>Initial Baseline: 152 WPM</span>
                  <span>Latest Rehearsal: 138 WPM</span>
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
                {[
                  {
                    id: 'eval-1',
                    title: 'Series A / Growth Capital Venture Pitch',
                    date: 'Yesterday, 4:15 PM',
                    duration: '7 min practice',
                    score: '9.4',
                    wpm: 138,
                    clarity: '96%',
                    bluf: '96/100',
                    coachNote: 'Delivered the 60-second genesis without hedging. Anchored value thesis around African logistics efficiency.',
                    directive: 'Next: Defend against aggressive valuation compression in Q&A phase.'
                  },
                  {
                    id: 'eval-2',
                    title: 'Executive Boardroom Strategic Capex Review',
                    date: '3 days ago',
                    duration: '10 min practice',
                    score: '9.2',
                    wpm: 134,
                    clarity: '94%',
                    bluf: '94/100',
                    coachNote: 'Simulated 5-minute capex allocation defense with deliberate 2-second pauses before financial answers.',
                    directive: 'Maintain eye contact and steady tone during hostile inquiries.'
                  },
                  {
                    id: 'eval-3',
                    title: 'Keynote Value Genesis Simulation',
                    date: 'Last week',
                    duration: '8 min practice',
                    score: '8.9',
                    wpm: 142,
                    clarity: '91%',
                    bluf: '91/100',
                    coachNote: 'Commanding stage presence. Vocal projection was resonant, with minimal filler words detected.',
                    directive: 'Deepen diaphragmatic breath between transitions.'
                  }
                ].map(item => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-850 hover:border-slate-800 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-900">
                      <div>
                        <div className="text-[10px] font-mono text-[#C89630] uppercase tracking-wider">{item.date} · {item.duration}</div>
                        <h4 className="text-sm font-bold text-white mt-0.5">{item.title}</h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                          Score {item.score}/10
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs">
                          {item.wpm} WPM
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-300 leading-relaxed">
                      <span className="font-semibold text-slate-200">Coach Debrief: </span>
                      "{item.coachNote}"
                    </div>

                    <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-slate-900/80 text-[11px]">
                      <div className="text-slate-400 font-mono flex items-center gap-1.5">
                        <span className="text-[#C89630] font-bold">Immediate Directive:</span>
                        <span>{item.directive}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 font-mono shrink-0">
                        <span>Clarity: <strong className="text-slate-200">{item.clarity}</strong></span>
                        <span>BLUF: <strong className="text-slate-200">{item.bluf}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Coach Qassim 2-Way Chat */}
        {speakerTab === 'coach' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-sm">
                    HQ
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white">Head Coach Qassim</h3>
                    <div className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">
                      Online • Coaching Lead
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
                  <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">Encrypted Direct Thread</span>
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
                      ? "Ask Coach Qassim about your pitch deck, boardroom presentation, or pacing..."
                      : "Ask Coach Qassim about your speech, pacing, or catharsis..."
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
      </main>

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
