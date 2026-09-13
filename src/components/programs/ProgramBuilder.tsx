import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Save, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  X,
  Mic,
  Sliders,
  ChevronRight,
  Sparkles,
  FileText,
  Layers,
  ArrowRight,
  ListChecks,
  Search,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  TrainingProgram, 
  WorkoutDay, 
  WorkoutExerciseItem, 
  Exercise, 
  SpeakingGoal, 
  Difficulty,
  SessionPhase
} from '../../types';

// Standard 6-Phase Masterclass breakdown used across Global Orators executive coaching
const DEFAULT_6_PHASES: SessionPhase[] = [
  {
    id: 'p1',
    phaseName: 'Phase 1: Vocal Warm-up & Diction',
    durationMin: 10,
    description: 'Diaphragmatic breathwork, resonance hums, and articulatory release.'
  },
  {
    id: 'p2',
    phaseName: 'Phase 2: Core Rhetorical Doctrine',
    durationMin: 15,
    description: 'Instruction on key principles, framing structure, and delivery mechanics.'
  },
  {
    id: 'p3',
    phaseName: 'Phase 3: Demonstration & Model Analysis',
    durationMin: 20,
    description: 'Deconstruct master speech recordings or examine exemplar rhetorical frameworks.'
  },
  {
    id: 'p4',
    phaseName: 'Phase 4: Floor Delivery & Practical Drills',
    durationMin: 30,
    description: 'High-repetition live speaking exercises, impromptu rounds, and Q&A simulations.'
  },
  {
    id: 'p5',
    phaseName: 'Phase 5: Coach Critique & Scorecard',
    durationMin: 10,
    description: 'Immediate diagnostic on tone, cadence, argument hierarchy, and presence.'
  },
  {
    id: 'p6',
    phaseName: 'Phase 6: Between-Session Assignment Briefing',
    durationMin: 5,
    description: 'Task briefing and prompt parameters for the take-home video recording.'
  }
];

export const ProgramBuilder: React.FC<{
  initialProgramId?: string;
}> = ({ initialProgramId }) => {
  const { 
    programs, 
    exercises, 
    saveProgram, 
    deleteProgram, 
    clients, 
    assignProgramToClient 
  } = useApp();

  const defaultProgram = programs.find(p => p.id === initialProgramId) || programs[0];

  const [activeProgram, setActiveProgram] = useState<TrainingProgram>(() => {
    if (!defaultProgram) {
      return {
        id: `prog-${Date.now()}`,
        title: 'Executive Public Speaking & Presentation Skills Programme',
        subtitle: '4-Week / 8-Session Executive Mastery & Boardroom Rhetoric',
        description: 'Comprehensive practical coaching programme designed for executives and leaders.',
        difficulty: 'Advanced',
        goal: 'Executive & Board Pitching',
        durationWeeks: 4,
        daysPerWeek: 2,
        tags: ['Executive', 'Public Speaking'],
        assignedClientCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        days: []
      };
    }
    return JSON.parse(JSON.stringify(defaultProgram));
  });

  const [activeSessionIndex, setActiveSessionIndex] = useState<number>(0);
  const [isDrillPickerOpen, setIsDrillPickerOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const [selectedClientToAssign, setSelectedClientToAssign] = useState<string>(clients[0]?.id || '');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState<string>('All');
  const [newObjectiveText, setNewObjectiveText] = useState('');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [showPhasesTimeline, setShowPhasesTimeline] = useState(false);
  const [mobileView, setMobileView] = useState<'roadmap' | 'canvas'>('canvas');

  // Switch loaded program
  const handleLoadProgram = (programId: string) => {
    const found = programs.find(p => p.id === programId);
    if (found) {
      setActiveProgram(JSON.parse(JSON.stringify(found)));
      setActiveSessionIndex(0);
      setIsProgramDropdownOpen(false);
    }
  };

  // Create new blank program
  const handleCreateNewBlankProgram = () => {
    const newProg: TrainingProgram = {
      id: `prog-${Date.now()}`,
      title: 'New Speech & Debate Masterclass',
      subtitle: 'Structured Oratory Syllabus & Rehearsal Protocol',
      description: 'Custom forensics and executive rhetoric curriculum with practical floor drills.',
      difficulty: 'Intermediate',
      goal: 'Executive & Board Pitching',
      durationWeeks: 6,
      daysPerWeek: 2,
      tags: ['Executive', 'Masterclass'],
      assignedClientCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      days: [
        {
          id: `session-${Date.now()}-1`,
          dayNumber: 1,
          name: 'Session 1: Diagnostic Assessment & Style Profiling',
          focus: 'Baseline Diagnostic, Voice Resonance & Delivery Profiling',
          estimatedDurationMin: 90,
          warmupNotes: 'Diaphragmatic resonance humming (3x30s) + articulatory release.',
          assignmentNotes: 'Record a 3-minute impromptu response to an unscripted stakeholder inquiry in the Voice Vault.',
          objectives: [
            'Establish baseline vocal presence, eye contact, and pacing (WPM)',
            'Identify filler word frequency and unconscious postural tics',
            'Deliver a 3-minute impromptu diagnostic speech'
          ],
          phases: JSON.parse(JSON.stringify(DEFAULT_6_PHASES)),
          exercises: []
        },
        {
          id: `session-${Date.now()}-2`,
          dayNumber: 2,
          name: 'Session 2: Vocal Architecture & Projection',
          focus: 'Diaphragmatic Breathwork, Resonance & Pitch Dynamics',
          estimatedDurationMin: 90,
          warmupNotes: 'Vowel elongation scales and chest resonance exercises.',
          assignmentNotes: 'Practice 5 minutes of vocal resonance hums daily before speaking.',
          objectives: [
            'Master thoracic diaphragmatic breathing to eliminate breathlessness',
            'Develop vocal command without strain or vocal fatigue'
          ],
          phases: JSON.parse(JSON.stringify(DEFAULT_6_PHASES)),
          exercises: []
        }
      ]
    };
    setActiveProgram(newProg);
    setActiveSessionIndex(0);
    setIsProgramDropdownOpen(false);
  };

  const currentSession: WorkoutDay | undefined = activeProgram.days[activeSessionIndex] || activeProgram.days[0];

  // Modify Program Fields
  const updateProgramField = <K extends keyof TrainingProgram>(key: K, value: TrainingProgram[K]) => {
    setActiveProgram(prev => ({ ...prev, [key]: value }));
  };

  // Modify Current Session Fields
  const updateCurrentSession = (updates: Partial<WorkoutDay>) => {
    setActiveProgram(prev => {
      const nextDays = [...prev.days];
      if (!nextDays[activeSessionIndex]) return prev;
      nextDays[activeSessionIndex] = { ...nextDays[activeSessionIndex], ...updates };
      return { ...prev, days: nextDays };
    });
  };

  // Add new session
  const handleAddSession = () => {
    const nextSessionNum = activeProgram.days.length + 1;
    const newSession: WorkoutDay = {
      id: `session-${Date.now()}-${nextSessionNum}`,
      dayNumber: nextSessionNum,
      name: `Session ${nextSessionNum}: Advanced Delivery & Floor Drill`,
      focus: 'Rhetorical Pacing & Conviction Calibration',
      estimatedDurationMin: 90,
      warmupNotes: 'Diaphragmatic warm-up and projection drills.',
      assignmentNotes: 'Practice session drills and record a 3-minute video reflection.',
      objectives: [
        'Command audience attention within the opening 15 seconds',
        'Execute structured transitions between core propositions'
      ],
      phases: JSON.parse(JSON.stringify(DEFAULT_6_PHASES)),
      exercises: []
    };
    setActiveProgram(prev => ({
      ...prev,
      days: [...prev.days, newSession],
      daysPerWeek: Math.max(1, Math.min(7, prev.days.length + 1))
    }));
    setActiveSessionIndex(activeProgram.days.length);
    setMobileView('canvas');
  };

  // Delete current session
  const handleDeleteCurrentSession = () => {
    if (activeProgram.days.length <= 1) return;
    setActiveProgram(prev => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== activeSessionIndex).map((s, idx) => ({ ...s, dayNumber: idx + 1 }))
    }));
    setActiveSessionIndex(Math.max(0, activeSessionIndex - 1));
  };

  // Add Objective
  const handleAddObjective = () => {
    if (!newObjectiveText.trim() || !currentSession) return;
    const currentObjectives = currentSession.objectives || [];
    updateCurrentSession({
      objectives: [...currentObjectives, newObjectiveText.trim()]
    });
    setNewObjectiveText('');
  };

  // Remove Objective
  const handleRemoveObjective = (index: number) => {
    if (!currentSession) return;
    const currentObjectives = currentSession.objectives || [];
    updateCurrentSession({
      objectives: currentObjectives.filter((_, i) => i !== index)
    });
  };

  // Update Phase
  const handleUpdatePhase = (phaseIndex: number, field: keyof SessionPhase, value: any) => {
    if (!currentSession) return;
    const phases = [...(currentSession.phases || DEFAULT_6_PHASES)];
    phases[phaseIndex] = { ...phases[phaseIndex], [field]: value };
    updateCurrentSession({ phases });
  };

  // Add drill to current session
  const handleAddDrillToSession = (ex: Exercise) => {
    if (!currentSession) return;
    const newDrillItem: WorkoutExerciseItem = {
      id: `drill-item-${Date.now()}`,
      exerciseId: ex.id,
      exerciseName: ex.name,
      primaryMuscle: ex.primaryMuscle,
      equipment: ex.equipment,
      tempo: '135 - 145 WPM Cadence',
      coachNotes: ex.instructions?.[0] || 'Deliver key assertions with unhurried tactical pauses.',
      sets: [
        { 
          id: `take-${Date.now()}-1`, 
          setNumber: 1, 
          targetReps: '3:00 min', 
          targetRpe: 9.0, 
          targetWeightKg: 140, 
          restSeconds: 60 
        }
      ]
    };

    updateCurrentSession({
      exercises: [...(currentSession.exercises || []), newDrillItem]
    });
    setIsDrillPickerOpen(false);
  };

  // Remove drill from session
  const handleRemoveDrill = (drillItemId: string) => {
    if (!currentSession) return;
    updateCurrentSession({
      exercises: currentSession.exercises.filter(e => e.id !== drillItemId)
    });
  };

  // Move drill up/down
  const handleMoveDrill = (index: number, direction: 'up' | 'down') => {
    if (!currentSession) return;
    const list = [...currentSession.exercises];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);
    updateCurrentSession({ exercises: list });
  };

  // Update drill fields
  const handleUpdateDrillField = (drillItemId: string, field: 'coachNotes' | 'tempo', value: string) => {
    if (!currentSession) return;
    const updated = currentSession.exercises.map(e => {
      if (e.id === drillItemId) {
        return { ...e, [field]: value };
      }
      return e;
    });
    updateCurrentSession({ exercises: updated });
  };

  const handleUpdateDrillDuration = (drillItemId: string, durationStr: string) => {
    if (!currentSession) return;
    const updated = currentSession.exercises.map(e => {
      if (e.id === drillItemId) {
        const nextSets = e.sets.map(s => ({ ...s, targetReps: durationStr }));
        return { ...e, sets: nextSets };
      }
      return e;
    });
    updateCurrentSession({ exercises: updated });
  };

  const handleUpdateDrillCadence = (drillItemId: string, cadenceWpm: number) => {
    if (!currentSession) return;
    const updated = currentSession.exercises.map(e => {
      if (e.id === drillItemId) {
        const nextSets = e.sets.map(s => ({ ...s, targetWeightKg: cadenceWpm }));
        return { ...e, sets: nextSets };
      }
      return e;
    });
    updateCurrentSession({ exercises: updated });
  };

  // Save Program Action
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProgram(activeProgram);
      setSaveNotification('Curriculum changes saved.');
      setTimeout(() => setSaveNotification(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter exercises in picker
  const filteredPickerExercises = exercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      e.primaryMuscle.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      e.description?.toLowerCase().includes(pickerSearch.toLowerCase());
    const matchesCategory = pickerCategory === 'All' || e.primaryMuscle === pickerCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = ['All', ...Array.from(new Set(exercises.map(e => e.primaryMuscle)))];

  return (
    <div className="space-y-4 pb-16 font-sans antialiased text-slate-100">
      {/* Toast Notification */}
      {saveNotification && (
        <div className="fixed top-14 right-6 z-50 bg-slate-900 border border-[#C89630]/60 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-[#C89630]" />
          <span className="text-xs font-semibold">{saveNotification}</span>
        </div>
      )}

      {/* Minimalist Command Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        {/* Left: Active Curriculum Selector Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProgramDropdownOpen(!isProgramDropdownOpen)}
              className="flex items-center gap-2 group text-left transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#C89630] font-bold">
                    CURRICULUM
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeProgram.goal}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-lg md:text-xl font-serif font-bold text-white tracking-tight group-hover:text-[#C89630] transition-colors">
                    {activeProgram.title}
                  </h2>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors shrink-0" />
                </div>
              </div>
            </button>
          </div>

          {/* Curriculum Switcher Dropdown Menu */}
          {isProgramDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 md:w-96 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl z-50 p-2 space-y-1 animate-in fade-in">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-900">
                SWITCH CURRICULUM
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                {programs.map(p => {
                  const isSelected = p.id === activeProgram.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleLoadProgram(p.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isSelected 
                          ? 'bg-[#C89630]/15 text-[#C89630] font-bold' 
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{p.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.goal} · {p.days.length} Sessions</div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#C89630] shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="pt-1.5 border-t border-slate-900">
                <button
                  id="new-program-builder-btn"
                  onClick={handleCreateNewBlankProgram}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-[#C89630] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New Blank Curriculum</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Clean Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
            title="Curriculum Settings & Parameters"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Settings</span>
          </button>

          {/* Assign to Speaker */}
          <button
            id="assign-program-to-client-btn"
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 hover:border-[#C89630]/50 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#C89630]" />
            <span>Assign to Speaker</span>
          </button>

          {/* Save Curriculum */}
          <button
            id="save-program-builder-btn"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C89630] hover:bg-[#b08428] text-slate-950 font-bold text-xs shadow-sm transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Curriculum</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Toggle Bar */}
      <div className="flex md:hidden items-center justify-between bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs">
        <button
          onClick={() => setMobileView('roadmap')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mobileView === 'roadmap' ? 'bg-[#C89630] text-slate-950' : 'text-slate-400'
          }`}
        >
          Syllabus Roadmap ({activeProgram.days.length})
        </button>
        <button
          onClick={() => setMobileView('canvas')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mobileView === 'canvas' ? 'bg-[#C89630] text-slate-950' : 'text-slate-400'
          }`}
        >
          Active Session Canvas
        </button>
      </div>

      {/* Split-View Canvas Layout (Notion / Linear style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column: Syllabus Roadmap (4 Cols on Desktop) */}
        <div className={`md:col-span-4 space-y-2.5 ${mobileView === 'roadmap' ? 'block' : 'hidden md:block'}`}>
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              SYLLABUS ROADMAP
            </span>
            <span className="text-[10px] font-mono text-[#C89630] font-semibold">
              {activeProgram.days.length} SESSIONS
            </span>
          </div>

          {/* Session Cards List */}
          <div className="space-y-1.5">
            {activeProgram.days.map((session, idx) => {
              const isSelected = activeSessionIndex === idx;
              return (
                <div
                  key={session.id || idx}
                  onClick={() => {
                    setActiveSessionIndex(idx);
                    setMobileView('canvas');
                  }}
                  className={`p-3 rounded-2xl cursor-pointer transition-all border text-left group ${
                    isSelected
                      ? 'bg-slate-900 border-[#C89630]/60 shadow-md ring-1 ring-[#C89630]/30'
                      : 'bg-slate-950/60 border-slate-900 hover:bg-slate-900/60 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-[#C89630] text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {String(session.dayNumber || idx + 1).padStart(2, '0')}
                      </span>
                      <span className={`text-xs font-semibold truncate max-w-[180px] ${
                        isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}>
                        {session.name.replace(/^Session \d+:\s*/i, '') || `Session ${idx + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0">
                      <span>{session.estimatedDurationMin || 90}m</span>
                      <span>·</span>
                      <span>{session.exercises?.length || 0} Drills</span>
                    </div>
                  </div>

                  {session.focus && (
                    <div className="text-[11px] text-slate-400 mt-1 truncate pl-7">
                      {session.focus}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Session CTA */}
          <button
            onClick={handleAddSession}
            className="w-full py-2.5 px-3 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-dashed border-slate-800 hover:border-[#C89630]/50 text-slate-400 hover:text-[#C89630] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Session</span>
          </button>
        </div>

        {/* Right Column: Borderless Editorial Canvas (8 Cols on Desktop) */}
        {currentSession && (
          <div className={`md:col-span-8 space-y-6 ${mobileView === 'canvas' ? 'block' : 'hidden md:block'}`}>
            {/* Session Masthead (Notion / Linear Document Header) */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C89630] font-bold">
                    SESSION {String(currentSession.dayNumber || activeSessionIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="text-slate-600">·</span>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <input
                      type="number"
                      value={currentSession.estimatedDurationMin || 90}
                      onChange={(e) => updateCurrentSession({ estimatedDurationMin: Number(e.target.value) })}
                      className="w-10 bg-transparent border-b border-slate-700 text-center text-white focus:outline-hidden focus:border-[#C89630]"
                    />
                    <span>MINUTES</span>
                  </div>
                </div>

                {activeProgram.days.length > 1 && (
                  <button
                    onClick={handleDeleteCurrentSession}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Direct Inline Title */}
              <div>
                <input
                  type="text"
                  value={currentSession.name}
                  onChange={(e) => updateCurrentSession({ name: e.target.value })}
                  placeholder="Session Module Name..."
                  className="w-full bg-transparent border-none outline-none text-xl sm:text-2xl font-serif font-bold text-white placeholder-slate-600 p-0 focus:ring-0"
                />
              </div>

              {/* Direct Inline Rhetorical Focus */}
              <div>
                <input
                  type="text"
                  value={currentSession.focus}
                  onChange={(e) => updateCurrentSession({ focus: e.target.value })}
                  placeholder="Primary oratorical focus / topic for this session..."
                  className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-[#C89630] placeholder-slate-600 p-0 focus:ring-0 font-medium"
                />
              </div>

              {/* Vocal Warm-up one-liner */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold shrink-0">
                  WARM-UP CUE:
                </span>
                <input
                  type="text"
                  value={currentSession.warmupNotes || ''}
                  onChange={(e) => updateCurrentSession({ warmupNotes: e.target.value })}
                  placeholder="Diaphragmatic resonance hums, vocal articulation..."
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-300 placeholder-slate-600 p-0 focus:ring-0"
                />
              </div>
            </div>

            {/* Section 1: Practical Floor Drills */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#C89630]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                    PRACTICAL FLOOR SPEECH DRILLS ({currentSession.exercises?.length || 0})
                  </span>
                </div>
                <button
                  id="open-exercise-picker-btn"
                  onClick={() => setIsDrillPickerOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-[#C89630] border border-slate-800 hover:border-[#C89630]/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Drill</span>
                </button>
              </div>

              {/* Drills Clean List */}
              {(!currentSession.exercises || currentSession.exercises.length === 0) ? (
                <div 
                  onClick={() => setIsDrillPickerOpen(true)}
                  className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 hover:border-[#C89630]/40 text-center cursor-pointer transition-colors group"
                >
                  <Mic className="w-6 h-6 text-slate-600 group-hover:text-[#C89630] mx-auto mb-2 transition-colors" />
                  <div className="text-xs font-medium text-slate-300">No floor speech drills assigned yet</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Click to choose from the speech drill library</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentSession.exercises.map((drill, dIdx) => {
                    const firstSet = drill.sets?.[0];
                    const currentDuration = firstSet?.targetReps || '3:00 min';
                    const currentCadence = firstSet?.targetWeightKg || 140;

                    return (
                      <div
                        key={drill.id || dIdx}
                        className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="h-5 w-5 rounded-md bg-[#C89630]/20 text-[#C89630] flex items-center justify-center font-mono text-[10px] font-bold">
                              {dIdx + 1}
                            </span>
                            <span className="text-xs font-bold text-white">{drill.exerciseName}</span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md">
                              {drill.primaryMuscle}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Speech Duration Selector */}
                            <select
                              value={currentDuration}
                              onChange={(e) => handleUpdateDrillDuration(drill.id, e.target.value)}
                              className="h-7 px-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-white focus:outline-hidden focus:border-[#C89630]"
                            >
                              <option value="1:00 min">1:00m</option>
                              <option value="2:00 min">2:00m</option>
                              <option value="3:00 min">3:00m</option>
                              <option value="4:00 min">4:00m</option>
                              <option value="5:00 min">5:00m</option>
                              <option value="7:00 min">7:00m</option>
                              <option value="10:00 min">10:00m</option>
                            </select>

                            {/* Cadence Input */}
                            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 h-7 font-mono text-[11px] text-[#C89630]">
                              <input
                                type="number"
                                step="5"
                                value={currentCadence}
                                onChange={(e) => handleUpdateDrillCadence(drill.id, Number(e.target.value))}
                                className="w-9 bg-transparent border-none text-right font-bold focus:outline-hidden"
                              />
                              <span className="text-[9px] text-slate-400 ml-1">WPM</span>
                            </div>

                            {/* Move & Delete */}
                            <button
                              onClick={() => handleMoveDrill(dIdx, 'up')}
                              disabled={dIdx === 0}
                              className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveDrill(dIdx, 'down')}
                              disabled={dIdx === currentSession.exercises.length - 1}
                              className="p-1 text-slate-500 hover:text-white disabled:opacity-20"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveDrill(drill.id)}
                              className="p-1 text-slate-500 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Coach Delivery Cue Input */}
                        <div className="flex items-center gap-2 text-xs pl-7">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0">
                            CUE:
                          </span>
                          <input
                            type="text"
                            value={drill.coachNotes || ''}
                            onChange={(e) => handleUpdateDrillField(drill.id, 'coachNotes', e.target.value)}
                            placeholder="e.g. Pause 2 full seconds before rebuttal; maintain eye contact..."
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-800 focus:border-[#C89630] text-xs text-slate-300 placeholder-slate-600 focus:outline-hidden pb-0.5"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Session Objectives & Key Learning Outcomes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-[#C89630]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                    SESSION OBJECTIVES ({currentSession.objectives?.length || 0})
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                {currentSession.objectives && currentSession.objectives.length > 0 && (
                  <div className="space-y-1.5">
                    {currentSession.objectives.map((obj, oIdx) => (
                      <div key={oIdx} className="flex items-start justify-between gap-2 text-xs group">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C89630] shrink-0 mt-0.5" />
                          <span className="text-slate-200">{obj}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveObjective(oIdx)}
                          className="text-slate-500 hover:text-red-400 p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Add Objective */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
                  <input
                    type="text"
                    value={newObjectiveText}
                    onChange={(e) => setNewObjectiveText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddObjective()}
                    placeholder="+ Add specific learning outcome (e.g. Master eye contact during executive pauses)..."
                    className="flex-1 bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-600 py-1 focus:ring-0"
                  />
                  {newObjectiveText.trim() && (
                    <button
                      onClick={handleAddObjective}
                      className="px-2.5 py-1 rounded-lg bg-[#C89630] text-slate-950 font-bold text-xs"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Take-Home Between-Session Dispatch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                    TAKE-HOME DISPATCH (VOICE VAULT PROMPT)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                  Syncs to Speaker Vault
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 border-l-2 border-l-emerald-500">
                <textarea
                  rows={3}
                  value={currentSession.assignmentNotes || ''}
                  onChange={(e) => updateCurrentSession({ assignmentNotes: e.target.value })}
                  placeholder="Describe the take-home video recording or self-reflection assignment the speaker must record before the next live session..."
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-600 focus:ring-0 p-0 leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Collapsible 6-Phase Timeline Breakdown */}
            <div className="pt-2 border-t border-slate-900">
              <button
                onClick={() => setShowPhasesTimeline(!showPhasesTimeline)}
                className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span>{showPhasesTimeline ? '▾ Hide' : '▸ View'} Standard 6-Phase Coaching Breakdown</span>
              </button>

              {showPhasesTimeline && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-3 animate-in fade-in">
                  {(currentSession.phases || DEFAULT_6_PHASES).map((phase, pIdx) => (
                    <div key={phase.id || pIdx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white text-[11px] truncate">{phase.phaseName}</span>
                        <div className="flex items-center font-mono text-[10px] text-[#C89630]">
                          <input
                            type="number"
                            value={phase.durationMin}
                            onChange={(e) => handleUpdatePhase(pIdx, 'durationMin', Number(e.target.value))}
                            className="w-8 text-center bg-transparent border-b border-slate-800 focus:outline-hidden"
                          />
                          <span>m</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">{phase.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Drill Library Picker Modal */}
      {isDrillPickerOpen && currentSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl max-h-[85vh] rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-[#C89630]" />
                <h3 className="text-sm font-bold text-white">
                  Add Speech Drill to {currentSession.name.replace(/^Session \d+:\s*/i, '')}
                </h3>
              </div>
              <button 
                onClick={() => setIsDrillPickerOpen(false)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filter & Search */}
            <div className="p-3 border-b border-slate-800/80 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search speech drills by keyword or technique..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:border-[#C89630] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {uniqueCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPickerCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
                      pickerCategory === cat
                        ? 'bg-[#C89630] text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Drills List */}
            <div className="p-3 overflow-y-auto space-y-1.5 flex-1 max-h-96">
              {filteredPickerExercises.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => handleAddDrillToSession(ex)}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-[#C89630]/60 flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={ex.thumbnailUrl} 
                      alt={ex.name} 
                      className="h-9 w-9 rounded-lg object-cover border border-slate-800 shrink-0" 
                    />
                    <div>
                      <div className="font-bold text-white group-hover:text-[#C89630] text-xs transition-colors">
                        {ex.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[#C89630]">{ex.primaryMuscle}</span>
                        <span>•</span>
                        <span>{ex.equipment}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#C89630] px-2 py-0.5 rounded bg-[#C89630]/10 border border-[#C89630]/20">
                    + Add
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Curriculum Settings Slide-Over / Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#C89630]" />
                <h3 className="text-sm font-bold text-white">Curriculum Settings</h3>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1 font-bold">Curriculum Title</label>
                <input
                  type="text"
                  value={activeProgram.title}
                  onChange={(e) => updateProgramField('title', e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:border-[#C89630] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1 font-bold">Rhetorical Domain</label>
                <select
                  value={activeProgram.goal}
                  onChange={(e) => updateProgramField('goal', e.target.value as SpeakingGoal)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:border-[#C89630] focus:outline-hidden"
                >
                  <option value="Executive & Board Pitching">Executive & Board Pitching</option>
                  <option value="Competitive Debate">Competitive Debate</option>
                  <option value="Keynote & Conference">Keynote & Conference</option>
                  <option value="Impromptu & Extemporaneous">Impromptu & Extemporaneous</option>
                  <option value="Model UN & Parliamentary">Model UN & Parliamentary</option>
                  <option value="Stage Presence & Vocal Mastery">Stage Presence & Vocal Mastery</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1 font-bold">Weeks</label>
                  <input
                    type="number"
                    value={activeProgram.durationWeeks}
                    onChange={(e) => updateProgramField('durationWeeks', Number(e.target.value))}
                    className="w-full h-9 px-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-center focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1 font-bold">Sessions/Wk</label>
                  <input
                    type="number"
                    value={activeProgram.daysPerWeek}
                    onChange={(e) => updateProgramField('daysPerWeek', Number(e.target.value))}
                    className="w-full h-9 px-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-center focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1 font-bold">Tier</label>
                  <select
                    value={activeProgram.difficulty}
                    onChange={(e) => updateProgramField('difficulty', e.target.value as Difficulty)}
                    className="w-full h-9 px-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1 font-bold">Pedagogical Overview</label>
                <textarea
                  rows={3}
                  value={activeProgram.description}
                  onChange={(e) => updateProgramField('description', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:border-[#C89630] focus:outline-hidden leading-relaxed resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
              {programs.length > 1 && (
                <button
                  onClick={async () => {
                    if (window.confirm(`Delete curriculum "${activeProgram.title}"?`)) {
                      await deleteProgram(activeProgram.id);
                      setIsSettingsOpen(false);
                      const rem = programs.filter(p => p.id !== activeProgram.id);
                      if (rem[0]) setActiveProgram(JSON.parse(JSON.stringify(rem[0])));
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete Curriculum
                </button>
              )}
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="ml-auto px-4 py-1.5 rounded-xl bg-[#C89630] text-slate-950 font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Program to Speaker Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#C89630]" />
                <h3 className="text-base font-bold text-white">Assign to Speaker</h3>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enroll a speaker into <strong>"{activeProgram.title}"</strong>. All {activeProgram.days.length} sessions will populate their live calendar and rehearsal studio.
            </p>

            <div>
              <label className="block text-slate-400 font-mono uppercase text-[10px] tracking-wider mb-1.5 font-bold">
                Select Speaker / Debater
              </label>
              <select
                value={selectedClientToAssign}
                onChange={(e) => setSelectedClientToAssign(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-[#C89630] focus:outline-hidden"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.goal}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-900 flex justify-end gap-2">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  assignProgramToClient(activeProgram.id, selectedClientToAssign);
                  setIsAssignModalOpen(false);
                  setSaveNotification('Assigned to speaker successfully.');
                  setTimeout(() => setSaveNotification(null), 3500);
                }}
                className="px-5 py-2 rounded-xl bg-[#C89630] hover:bg-[#b08428] text-slate-950 font-bold text-xs shadow-md"
              >
                Confirm Enrollment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
