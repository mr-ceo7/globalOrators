import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BranchType, SpeakerOnboardingData } from '../../types';

export const ClientPortal: React.FC = () => {
  const { 
    activeSpeakerProfile, 
    setActiveSpeakerProfile, 
    setCurrentPortal, 
    showToast,
    resetOnboarding
  } = useApp();

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

  // Daily Habits State in Client Portal
  const [habitsStatus, setHabitsStatus] = useState<{ [title: string]: boolean }>({
    'Vocal Hydration (2.5L + Warm Lemon Water)': true,
    'Diaphragmatic Breathwork (5 Min Morning Routine)': true,
    'Cathartic Voice Journaling (1-Min Audio Reflection)': false,
    'Pan-African & Current Affairs Reading (10 Min Daily)': true,
    'Tongue Twisters & Articulation Warmups': false
  });

  // Client to Coach simulated messages
  const [clientMessageInput, setClientMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'client' | 'coach'; text: string; time: string }[]>([
    {
      sender: 'coach',
      text: `Welcome to Global Orators! I'm reviewing your baseline pacing. Remember, whether preparing for championships or practicing emotional catharsis, your voice is your instrument of sovereign authority.`,
      time: '09:00 AM'
    },
    {
      sender: 'client',
      text: 'Thank you Coach Qassim! I am starting today\'s vocalization drill.',
      time: '09:15 AM'
    }
  ]);

  // Demo Profile switcher (Allows seamless switching between Academy & Foundation personas)
  const handleSwitchBranchDemo = (targetBranch: BranchType) => {
    if (targetBranch === 'Academy') {
      const academyProfile: SpeakerOnboardingData = {
        branch: 'Academy',
        fullName: 'Kwame Mensah',
        email: 'kwame.mensah@globalorators.org',
        age: 22,
        phone: '+254 711 223 344',
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
      showToast('Switched to Global Orators Academy demo profile 🎓');
    } else {
      const foundationProfile: SpeakerOnboardingData = {
        branch: 'Foundation',
        fullName: 'Nia Adebayo',
        email: 'nia.adebayo@globalorators.org',
        age: 19,
        phone: '+254 722 334 455',
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
      showToast('Switched to Global Orators Foundation demo profile 💖');
    }
  };

  const profile = activeSpeakerProfile || {
    branch: 'Foundation' as BranchType,
    fullName: 'Nia Adebayo',
    email: 'nia.adebayo@globalorators.org',
    missionFocus: 'Speaking as a Form of Escapism & Healing',
    speakingGoal: 'Cathartic Expression & Healing',
    experienceLevel: 'Novice Speaker',
    vocalBaselinePace: 135,
    emotionalOpennessRating: 8,
    selectedHabits: ['Vocal Hydration (2.5L + Warm Lemon Water)', 'Diaphragmatic Breathwork (5 Min Morning Routine)']
  };

  const isAcademy = profile.branch === 'Academy';

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
    showToast('Reflection logged in your private Catharsis Vault 🎙️');
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
          text: `Great work, ${profile.fullName.split(' ')[0]}! I reviewed your rehearsal metrics. Keep your breath deep in the lower abdomen and let your authentic conviction lead.`,
          time: 'Just now'
        }
      ]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. Speaker App Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-slate-950 shadow-md ${
            isAcademy ? 'bg-emerald-400' : 'bg-teal-400'
          }`}>
            {profile.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                {profile.fullName}
              </span>
              <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                isAcademy
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
              }`}>
                {profile.branch} Track
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
              {profile.missionFocus}
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2">
          {/* Quick Demo Track Toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px]">
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
            className="px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
            title="Open Coach OS (coach.globalorators.com)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">Coach OS</span>
          </button>

          <button
            onClick={() => setCurrentPortal('landing')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
            title="Return to Landing Page (globalorators.com)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Public Site</span>
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
        <div className="mb-6 rounded-3xl p-5 sm:p-6 border bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${
                isAcademy ? 'bg-emerald-500/20 text-emerald-300' : 'bg-teal-500/20 text-teal-300'
              }`}>
                {isAcademy ? 'Tournament & Leadership Syllabus' : 'Catharsis & Healing Fellowship'}
              </span>
              <span className="text-xs text-slate-500 font-mono">• Day 14 Streak (🔥 6 Days)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {isAcademy ? 'Championship Debate & Cognitive Sovereignty' : 'Speaking as Escapism: Emotional Vulnerability Studio'}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {isAcademy
                ? 'Developing razor-sharp syllogistic logic, overcoming western dependency narratives, and commanding global parliamentary conventions.'
                : 'A safe sanctuary for vocalizing suppressed trauma, breaking generational silence, and turning lived pain into therapeutic empowerment.'}
            </p>
          </div>

          <button
            onClick={() => resetOnboarding()}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 self-start md:self-auto shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Retake Onboarding</span>
          </button>
        </div>

        {/* Responsive 2-Column Mobile Stats Grid (Strictly adhering to mobile design rules) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 sm:p-4">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Target Pacing</div>
            <div className="text-lg sm:text-2xl font-black text-emerald-400 mt-0.5">{profile.vocalBaselinePace} <span className="text-xs font-normal text-slate-400">WPM</span></div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">Optimal Cadence</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 sm:p-4">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Fluency & Clarity</div>
            <div className="text-lg sm:text-2xl font-black text-white mt-0.5">94.2%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Top 5% Tier</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 sm:p-4">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Catharsis Openness</div>
            <div className="text-lg sm:text-2xl font-black text-teal-400 mt-0.5">{profile.emotionalOpennessRating * 10}%</div>
            <div className="text-[10px] text-teal-500/80 mt-0.5">Vulnerability Index</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 sm:p-4">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Rehearsals Logged</div>
            <div className="text-lg sm:text-2xl font-black text-white mt-0.5">18 <span className="text-xs font-normal text-slate-400">Sessions</span></div>
            <div className="text-[10px] text-emerald-400 mt-0.5">+4 this week</div>
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
                      {isAcademy
                        ? 'Pan-African Deconditioning & Leadership Manifesto'
                        : 'Cathartic Voice Journaling & Vulnerability Release'}
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
                  {isAcademy ? 'Debate / Manifesto Prompt' : 'Catharsis & Healing Safe Prompt'}
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {isAcademy
                    ? '"Dismantle the proposition that African youth must migrate to achieve prosperity. Defend continental resource mobilization and self-development with uncompromising moral logic."'
                    : '"Speak aloud a truth you felt pressured to hide. Breathe through the constriction in your throat, allow your voice to express the emotion completely, and end with an affirmation of self-sovereignty."'}
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
                          1-on-1 Executive & Delivery Review with Coach Qassim
                        </h3>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Confirmed</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tomorrow at 03:30 PM (45 Min) • Video Consultation & Audio Pacing Feedback
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
                          {isAcademy
                            ? 'PAUDC Championship Mock Round (British Parliamentary)'
                            : 'Foundation Community Voice & Healing Circle'}
                        </h3>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-teal-500/15 text-teal-300">Live Workshop</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Friday at 05:00 PM (60 Min) • Facilitated Group Session
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
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online • Global Orators Coaching Lead</span>
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
