import React, { useState, useEffect, useMemo } from 'react';
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
  ShieldCheck,
  Globe,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BranchType, SpeakerOnboardingData } from '../../types';
import { resolveSpeakerCurriculum } from '../../utils/curriculumResolver';

export const ClientPortal: React.FC = () => {
  const { 
    activeSpeakerProfile, 
    setActiveSpeakerProfile, 
    setCurrentPortal, 
    showToast,
    resetOnboarding
  } = useApp();

  const profile = useMemo(() => activeSpeakerProfile || {
    branch: 'Foundation' as BranchType,
    fullName: 'Nia Adebayo',
    email: 'nia.adebayo@globalorators.org',
    missionFocus: 'Speaking as a Form of Escapism & Healing',
    primaryDiscipline: 'Cathartic Voice Journaling',
    coreFocus: 'Vulnerability & Unfiltered Truth',
    institution: 'Independent Orator',
    speakingGoal: 'Cathartic Expression & Healing',
    experienceLevel: 'Novice Speaker',
    vocalBaselinePace: 135,
    emotionalOpennessRating: 8,
    selectedHabits: ['Vocal Hydration (2.5L + Warm Lemon Water)', 'Diaphragmatic Breathwork (5 Min Morning Routine)']
  }, [activeSpeakerProfile]);

  const isAcademy = profile.branch === 'Academy';
  const curriculum = useMemo(() => resolveSpeakerCurriculum(profile), [profile]);

  // Active Tab inside Client Portal
  const [speakerTab, setSpeakerTab] = useState<'practice' | 'catharsis' | 'schedule' | 'habits' | 'coach'>('practice');

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

  // Journal entries for Catharsis Vault
  const [journalText, setJournalText] = useState('');
  const [journalFeelBefore, setJournalFeelBefore] = useState('Anxious & Suppressed');
  const [journalEntries, setJournalEntries] = useState<{
    id: string;
    date: string;
    text: string;
    feelBefore: string;
    feelAfter: string;
    audioLength: string;
  }[]>([
    {
      id: 'j-1',
      date: 'Yesterday, 8:45 PM',
      text: 'Vocalized the heavy memory of being told to remain quiet during family disputes. Felt my chest tighten at first, then deep emotional relief when I finished the declaration.',
      feelBefore: 'Guarded & Tense',
      feelAfter: 'Lighter, Empowered & Grounded',
      audioLength: '3 min 12 sec'
    }
  ]);

  // Daily Habits State in Client Portal initialized dynamically from profile
  const [habitsStatus, setHabitsStatus] = useState<{ [title: string]: boolean }>(() => {
    const initial: { [title: string]: boolean } = {};
    const habitsList = profile.selectedHabits && profile.selectedHabits.length > 0
      ? profile.selectedHabits
      : [
          'Vocal Hydration (2.5L + Warm Lemon Water)',
          'Diaphragmatic Breathwork (5 Min Morning Routine)',
          'Tongue Twisters & Articulation Warmups'
        ];
    habitsList.forEach((habitTitle, idx) => {
      initial[habitTitle] = idx === 0;
    });
    return initial;
  });

  const habitsKey = useMemo(() => (profile.selectedHabits || []).join(':::'), [profile.selectedHabits]);

  // Keep habitsStatus in sync whenever speaker profile updates
  useEffect(() => {
    if (profile.selectedHabits && profile.selectedHabits.length > 0) {
      setHabitsStatus(prev => {
        const next: { [title: string]: boolean } = {};
        profile.selectedHabits.forEach((habitTitle, idx) => {
          next[habitTitle] = prev[habitTitle] !== undefined ? prev[habitTitle] : idx === 0;
        });
        return next;
      });
    }
  }, [habitsKey]);

  // Client to Coach simulated messages initialized with personalized context
  const [clientMessageInput, setClientMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'client' | 'coach'; text: string; time: string }[]>(() => [
    {
      sender: 'coach',
      text: `Welcome to Global Orators, ${profile.fullName.split(' ')[0]}! I've calibrated your ${profile.branch} protocol${profile.institution ? ` for ${profile.institution}` : ''}. We are prioritizing ${curriculum.focusLabel} at your target pace of ${profile.vocalBaselinePace} WPM. Remember, your voice is your sovereign instrument.`,
      time: '09:00 AM'
    },
    {
      sender: 'client',
      text: `Thank you Coach Qassim! I am starting today's drill on ${curriculum.focusLabel}.`,
      time: '09:15 AM'
    }
  ]);

  // Synchronize Coach chat whenever profile persona changes
  useEffect(() => {
    setChatMessages([
      {
        sender: 'coach',
        text: `Welcome to Global Orators, ${profile.fullName.split(' ')[0]}! I've calibrated your ${profile.branch} protocol${profile.institution ? ` for ${profile.institution}` : ''}. We are prioritizing ${curriculum.focusLabel} at your target pace of ${profile.vocalBaselinePace} WPM. Remember, your voice is your sovereign instrument.`,
        time: '09:00 AM'
      },
      {
        sender: 'client',
        text: `Thank you Coach Qassim! I am starting today's drill on ${curriculum.focusLabel}.`,
        time: '09:15 AM'
      }
    ]);
  }, [profile.fullName, profile.branch, profile.institution, profile.coreFocus, profile.primaryDiscipline, profile.vocalBaselinePace, curriculum.focusLabel]);

  // Demo Profile switcher (Allows seamless switching between Academy & Foundation personas)
  const handleSwitchBranchDemo = (targetBranch: BranchType) => {
    if (targetBranch === 'Academy') {
      const academyProfile: SpeakerOnboardingData = {
        branch: 'Academy',
        fullName: 'Kwame Mensah',
        email: 'kwame.mensah@globalorators.org',
        age: 22,
        phone: '+254 711 223 344',
        institution: 'Strathmore Debate Society',
        primaryDiscipline: 'British Parliamentary (BP)',
        coreFocus: 'Argumentation & Rebuttal Depth',
        missionFocus: 'Pan-African Leadership & WUDC Championship Debate',
        speakingGoal: 'Competitive Debate',
        experienceLevel: 'Varsity / Advanced',
        vocalBaselinePace: 148,
        emotionalOpennessRating: 8,
        selectedHabits: [
          'Vocal Hydration (2.5L + Warm Lemon Water)',
          'Diaphragmatic Breathwork (5 Min Morning Routine)',
          'Pan-African & Current Affairs Reading (10 Min Daily)'
        ],
        bioNotes: 'Lead debater on the Global Orators Pan-African tournament squad.'
      };
      setActiveSpeakerProfile(academyProfile);
      showToast('Switched to Global Orators Academy demo profile.');
    } else {
      const foundationProfile: SpeakerOnboardingData = {
        branch: 'Foundation',
        fullName: 'Nia Adebayo',
        email: 'nia.adebayo@globalorators.org',
        age: 19,
        phone: '+254 722 334 455',
        institution: 'Independent Orator',
        primaryDiscipline: 'Cathartic Voice Journaling',
        coreFocus: 'Vulnerability & Unfiltered Truth',
        missionFocus: 'Speaking as a Form of Escapism & Catharsis from Adversity',
        speakingGoal: 'Cathartic Expression & Healing',
        experienceLevel: 'Novice Speaker',
        vocalBaselinePace: 132,
        emotionalOpennessRating: 9,
        selectedHabits: [
          'Vocal Hydration (2.5L + Warm Lemon Water)',
          'Diaphragmatic Breathwork (5 Min Morning Routine)',
          'Cathartic Voice Journaling (1-Min Audio Reflection)'
        ],
        bioNotes: 'Foundation fellow transforming past domestic adversity into voice advocacy.'
      };
      setActiveSpeakerProfile(foundationProfile);
      showToast('Switched to Global Orators Foundation demo profile.');
    }
  };

  // Toggle habit check
  const toggleHabit = (title: string) => {
    setHabitsStatus(prev => {
      const updated = { ...prev, [title]: !prev[title] };
      showToast(updated[title] ? `Completed: ${title}` : `Unchecked: ${title}`);
      return updated;
    });
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
    // Generate personalized feedback
    const baseWpm = profile.vocalBaselinePace || 135;
    setRecordedFeedback({
      wpm: Math.round(baseWpm + (Math.random() * 8 - 4)),
      clarity: 94,
      fillers: 2,
      catharsisScore: profile.emotionalOpennessRating ? profile.emotionalOpennessRating * 10 : 85
    });
    showToast('Rehearsal processed! Instant delivery metrics ready.');
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

  // Send message to coach
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientMessageInput.trim()) return;

    const newMsg = {
      sender: 'client' as const,
      text: clientMessageInput.trim(),
      time: 'Just now'
    };

    setChatMessages([...chatMessages, newMsg]);
    setClientMessageInput('');

    // Coach automated response after 1.2s
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'coach',
          text: `Great work, ${profile.fullName.split(' ')[0]}! I reviewed your rehearsal metrics for ${curriculum.focusLabel}. Keep your breath deep in the lower abdomen and let your authentic conviction lead.`,
          time: 'Just now'
        }
      ]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. Speaker App Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-black text-sm text-slate-950 shadow-md ${
            isAcademy ? 'bg-[#C89630]' : 'bg-teal-400'
          }`}>
            {profile.fullName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-serif font-bold text-white leading-tight truncate">
                {profile.fullName}
              </span>
              <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                isAcademy
                  ? 'bg-amber-500/10 text-[#C89630] border-[#C89630]/30'
                  : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
              }`}>
                {profile.branch} Track
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 truncate max-w-[200px] xs:max-w-xs sm:max-w-md">
              {profile.institution ? `${profile.institution} • ` : ''}{profile.primaryDiscipline || profile.missionFocus}
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Demo Track Toggle */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px]">
            <button
              onClick={() => handleSwitchBranchDemo('Academy')}
              className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                isAcademy ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Academy Track
            </button>
            <button
              onClick={() => handleSwitchBranchDemo('Foundation')}
              className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                !isAcademy ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Foundation Track
            </button>
          </div>

          <button
            onClick={() => setCurrentPortal('coach_os')}
            aria-label="Open Coach OS"
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Open Coach OS (coach.globalorators.com)"
          >
            <ShieldCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-teal-400" />
            <span className="hidden md:inline">Coach OS</span>
          </button>

          <button
            onClick={() => setCurrentPortal('landing')}
            aria-label="Return to Public Site"
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Return to Landing Page (globalorators.com)"
          >
            <Globe className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Public Site</span>
          </button>

          <button
            onClick={() => {
              setActiveSpeakerProfile(null);
              localStorage.removeItem('globalorators_speaker_profile');
              setCurrentPortal('landing');
              showToast('Signed out of speaker profile.');
            }}
            aria-label="Sign Out"
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-rose-900/40 bg-rose-950/20 text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sign out of speaker profile"
          >
            <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* 2. Speaker Segmented Navigation Bar */}
      <div className="bg-slate-900/70 border-b border-slate-800/80 px-4 sm:px-6 py-2 overflow-x-auto no-scrollbar">
        <div className="max-w-5xl mx-auto flex items-center gap-1.5 sm:gap-2">
          {[
            { id: 'practice', label: 'Daily Drill Studio', icon: Mic },
            { id: 'catharsis', label: 'Catharsis & Voice Vault', icon: Heart },
            { id: 'schedule', label: 'My Sessions & Rounds', icon: Calendar },
            { id: 'habits', label: 'Daily Orator Rituals', icon: CheckCircle2 },
            { id: 'coach', label: 'Coach Qassim (2-Way)', icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = speakerTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSpeakerTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? isAcademy
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
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {/* Banner with Speaker Track Overview */}
        <div className="mb-6 rounded-3xl p-5 sm:p-6 border bg-slate-900/60 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C89630] font-bold">
                {profile.institution ? `${profile.institution} • ` : ''}{curriculum.syllabusKicker}
              </span>
              <span className="hidden xs:inline-block w-px h-3 bg-slate-800" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Day 14 Practice Cycle • 6-Day Streak
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white tracking-tight leading-snug">
              {curriculum.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {curriculum.description}
            </p>

            {/* Dynamic Curriculum Focus Tags */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-3 pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Discipline: <strong className="text-slate-200 font-semibold">{curriculum.disciplineLabel}</strong>
              </span>
              <span className="hidden xs:inline-block w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Focus: <strong className="text-[#C89630] font-semibold">{curriculum.focusLabel}</strong>
              </span>
              <span className="hidden xs:inline-block w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Tier: <strong className="text-slate-200 font-semibold">{profile.experienceLevel || 'Calibrated'}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={() => resetOnboarding()}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors self-start md:self-center shrink-0"
            title="Recalibrate curriculum preferences"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>Recalibrate Track</span>
          </button>
        </div>

        {/* Responsive 2-Column Mobile Stats Grid (Strictly adhering to mobile design rules) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4.5 transition-colors hover:border-slate-700/80">
            <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">Target Pacing</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#C89630] mt-1 tracking-tight">
              {profile.vocalBaselinePace}
              <span className="font-mono text-[10px] sm:text-xs font-normal text-slate-400 uppercase tracking-wider ml-1">WPM</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1">Optimal Cadence</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4.5 transition-colors hover:border-slate-700/80">
            <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">Fluency & Clarity</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white mt-1 tracking-tight">
              94.2%
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">Top 5% Tier</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4.5 transition-colors hover:border-slate-700/80">
            <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">Catharsis Index</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-teal-400 mt-1 tracking-tight">
              {profile.emotionalOpennessRating * 10}%
            </div>
            <div className="text-[10px] font-mono text-teal-400 mt-1">Vulnerability Level</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4.5 transition-colors hover:border-slate-700/80">
            <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">Rehearsals Logged</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white mt-1 tracking-tight">
              18
              <span className="font-mono text-[10px] sm:text-xs font-normal text-slate-400 uppercase tracking-wider ml-1">Rounds</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1">+4 this week</div>
          </div>
        </div>

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
                {recordingCompleted && recordedFeedback && (
                  <div className="mt-6 pt-5 border-t border-slate-850 animate-fadeIn text-left">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Speech Delivery Diagnostics</span>
                    </div>

                    {/* 2-Column Responsive Metrics on Mobile */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                        <div className="text-[10px] text-slate-400">Pacing (WPM)</div>
                        <div className="text-base font-bold text-white mt-0.5">{recordedFeedback.wpm} WPM</div>
                        <div className="text-[9px] text-emerald-400">In optimal target zone</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                        <div className="text-[10px] text-slate-400">Articulation Score</div>
                        <div className="text-base font-bold text-emerald-400 mt-0.5">{recordedFeedback.clarity}%</div>
                        <div className="text-[9px] text-slate-400">Zero mumbling detected</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                        <div className="text-[10px] text-slate-400">Filler Words</div>
                        <div className="text-base font-bold text-white mt-0.5">{recordedFeedback.fillers}</div>
                        <div className="text-[9px] text-emerald-400">2 'ums' in 2 min</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                        <div className="text-[10px] text-slate-400">Emotional Resonance</div>
                        <div className="text-base font-bold text-teal-400 mt-0.5">{recordedFeedback.catharsisScore}%</div>
                        <div className="text-[9px] text-teal-400">Deep conviction</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Catharsis & Voice Vault (Speaking as Escapism) */}
        {speakerTab === 'catharsis' && (
          <div className="space-y-6 animate-fadeIn">
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
          </div>
        )}

        {/* TAB 3: My Sessions & Rounds */}
        {speakerTab === 'schedule' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-2">
                Upcoming 1-on-1s & Rehearsal Rounds
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Coaching consultations with Head Coach Qassim and peer parliamentary debates.
              </p>

              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-white">
                          {curriculum.sessionTitle}
                        </h3>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Confirmed</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tomorrow at 03:30 PM (45 Min) • {curriculum.sessionDescription}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => showToast('Connecting to rehearsal room...')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shrink-0 self-start sm:self-auto shadow-md"
                  >
                    Join Room
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-white">
                          {curriculum.workshopTitle}
                        </h3>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-teal-500/15 text-teal-300">Live Workshop</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Friday at 05:00 PM (60 Min) • {curriculum.workshopDescription}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => showToast('RSVP Confirmed for workshop round.')}
                    className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white font-semibold text-xs shrink-0 self-start sm:self-auto"
                  >
                    Add to Calendar
                  </button>
                </div>
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

        {/* TAB 5: Coach Qassim 2-Way Chat */}
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

                <span className="text-[10px] text-slate-400 font-mono">Encrypted Direct Thread</span>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      msg.sender === 'client' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'client'
                          ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={clientMessageInput}
                  onChange={(e) => setClientMessageInput(e.target.value)}
                  placeholder="Ask Coach Qassim about your speech, pacing, or catharsis..."
                  className="flex-1 h-10 px-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
