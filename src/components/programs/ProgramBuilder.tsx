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
  Target,
  Mic,
  Award,
  ListChecks,
  Timer,
  Layers,
  Sparkles,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  TrainingProgram, 
  WorkoutDay, 
  WorkoutExerciseItem, 
  WorkoutSet, 
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

  // Active loaded program
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
  const [selectedClientToAssign, setSelectedClientToAssign] = useState<string>(clients[0]?.id || '');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState<string>('All');
  const [newObjectiveText, setNewObjectiveText] = useState('');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'blueprint' | 'drills' | 'phases'>('blueprint');

  // Handle program switch
  const handleLoadProgram = (programId: string) => {
    const found = programs.find(p => p.id === programId);
    if (found) {
      setActiveProgram(JSON.parse(JSON.stringify(found)));
      setActiveSessionIndex(0);
    }
  };

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
          warmupNotes: 'Diaphragmatic resonance humming (3x30s) + articulatory tongue twisters.',
          assignmentNotes: 'Record a 3-minute impromptu response to an unscripted stakeholder inquiry and submit to Voice Vault.',
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
          assignmentNotes: 'Practice 5 minutes of vocal resonance hums daily before presentations.',
          objectives: [
            'Master thoracic diaphragmatic breathing to eliminate breathlessness',
            'Develop vocal command without strain or vocal fatigue',
            'Apply tactical downward inflections on authoritative claims'
          ],
          phases: JSON.parse(JSON.stringify(DEFAULT_6_PHASES)),
          exercises: []
        }
      ]
    };
    setActiveProgram(newProg);
    setActiveSessionIndex(0);
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
        'Command audience attention within the first 15 seconds',
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

  // Update drill duration or cadence
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
      setSaveNotification('Curriculum saved successfully!');
      setTimeout(() => setSaveNotification(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete entire curriculum
  const handleDeleteEntireProgram = async () => {
    if (programs.length <= 1) {
      alert('Cannot delete the last remaining curriculum.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${activeProgram.title}"?`)) {
      await deleteProgram(activeProgram.id);
      const remaining = programs.filter(p => p.id !== activeProgram.id);
      if (remaining[0]) {
        setActiveProgram(JSON.parse(JSON.stringify(remaining[0])));
        setActiveSessionIndex(0);
      }
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

  // Compute curriculum stats
  const totalSessions = activeProgram.days.length;
  const totalDrills = activeProgram.days.reduce((acc, d) => acc + (d.exercises?.length || 0), 0);
  const totalDurationMin = activeProgram.days.reduce((acc, d) => acc + (d.estimatedDurationMin || 90), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {saveNotification && (
        <div className="fixed top-16 right-6 z-50 bg-[#0c1222] border border-[#C89630]/60 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-[#C89630]" />
          <span className="text-xs font-semibold">{saveNotification}</span>
        </div>
      )}

      {/* Editorial Masthead & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#C89630] font-bold">
              ORATORICAL SYLLABUS STUDIO
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[10px] font-mono text-slate-400">
              {totalSessions} SESSIONS · {totalDrills} DRILLS · {totalDurationMin} TOTAL MINS
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-white tracking-tight">
            Curriculum & Forensics Protocol Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Architect structured oratorical curriculums, masterclass modules, practical floor speech drills, and between-session recording briefs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="new-program-builder-btn"
            onClick={handleCreateNewBlankProgram}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="h-4 w-4 text-[#C89630]" />
            <span>+ New Curriculum</span>
          </button>

          <button
            id="assign-program-to-client-btn"
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-[#C89630]/40 transition-colors"
          >
            <UserCheck className="h-4 w-4 text-[#C89630]" />
            <span>Assign to Speaker</span>
          </button>

          <button
            id="save-program-builder-btn"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#C89630] hover:bg-[#b08428] text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Curriculum</span>
              </>
            )}
          </button>

          {programs.length > 1 && (
            <button
              onClick={handleDeleteEntireProgram}
              className="p-2 rounded-xl bg-slate-950 hover:bg-red-500/20 text-slate-500 hover:text-red-400 border border-slate-800 transition-colors"
              title="Delete this entire curriculum"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Saved Curriculums Selector Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5 overflow-x-auto">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-2 shrink-0 font-bold">
          SAVED CURRICULUMS:
        </span>
        {programs.map(p => {
          const isActive = activeProgram.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleLoadProgram(p.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive 
                  ? 'bg-[#C89630] text-slate-950 font-bold shadow-sm' 
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <BookOpen className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
              <span>{p.title}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                isActive ? 'bg-black/20 text-slate-950' : 'bg-slate-900 text-slate-400'
              }`}>
                {p.days.length} Sessions
              </span>
            </button>
          );
        })}
      </div>

      {/* Curriculum Metadata Architecture Card */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold">
            CURRICULUM SPECIFICATION & METADATA
          </span>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            {activeProgram.assignedClientCount} Enrolled Speaker{activeProgram.assignedClientCount === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-slate-400 font-mono uppercase text-[10px] tracking-wider mb-1.5 font-bold">
              Curriculum Title
            </label>
            <input
              type="text"
              value={activeProgram.title}
              onChange={(e) => updateProgramField('title', e.target.value)}
              placeholder="e.g. Executive Public Speaking & Presentation Skills Programme"
              className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:border-[#C89630] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono uppercase text-[10px] tracking-wider mb-1.5 font-bold">
              Rhetorical Domain / Track
            </label>
            <select
              value={activeProgram.goal}
              onChange={(e) => updateProgramField('goal', e.target.value as SpeakingGoal)}
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-[#C89630] focus:border-[#C89630] focus:outline-hidden"
            >
              <option value="Executive & Board Pitching">Executive & Board Pitching</option>
              <option value="Competitive Debate">Competitive Debate</option>
              <option value="Keynote & Conference">Keynote & Conference</option>
              <option value="Impromptu & Extemporaneous">Impromptu & Extemporaneous</option>
              <option value="Model UN & Parliamentary">Model UN & Parliamentary</option>
              <option value="Stage Presence & Vocal Mastery">Stage Presence & Vocal Mastery</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-slate-400 font-mono uppercase text-[10px] tracking-wider mb-1.5 font-bold">
              Executive Subtitle & Track Tagline
            </label>
            <input
              type="text"
              value={activeProgram.subtitle || ''}
              onChange={(e) => updateProgramField('subtitle', e.target.value)}
              placeholder="e.g. 4-Week / 8-Session Executive Mastery & Boardroom Rhetoric"
              className="w-full h-9 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-[#C89630] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-400 font-mono uppercase text-[10px] mb-1 font-bold">
                Weeks
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={activeProgram.durationWeeks}
                onChange={(e) => updateProgramField('durationWeeks', Number(e.target.value))}
                className="w-full h-9 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white text-center focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono uppercase text-[10px] mb-1 font-bold">
                Sessions/Wk
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={activeProgram.daysPerWeek}
                onChange={(e) => updateProgramField('daysPerWeek', Number(e.target.value))}
                className="w-full h-9 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white text-center focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono uppercase text-[10px] mb-1 font-bold">
                Tier
              </label>
              <select
                value={activeProgram.difficulty}
                onChange={(e) => updateProgramField('difficulty', e.target.value as Difficulty)}
                className="w-full h-9 px-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 font-mono uppercase text-[10px] tracking-wider mb-1.5 font-bold">
            Pedagogical Overview & Curriculum Manifesto
          </label>
          <textarea
            rows={2}
            value={activeProgram.description}
            onChange={(e) => updateProgramField('description', e.target.value)}
            placeholder="Describe the overarching transformative trajectory of this curriculum..."
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 placeholder-slate-600 focus:border-[#C89630] focus:outline-hidden leading-relaxed"
          />
        </div>
      </div>

      {/* Session Syllabus Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {activeProgram.days.map((session, idx) => {
            const isSelected = activeSessionIndex === idx;
            return (
              <button
                key={session.id || idx}
                onClick={() => setActiveSessionIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#C89630]/20 text-[#C89630] border border-[#C89630]/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span className="font-mono text-[11px]">Session {session.dayNumber || idx + 1}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-[#C89630]/30 text-[#C89630]' : 'bg-slate-800 text-slate-400'
                }`}>
                  {session.exercises?.length || 0} Drills
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddSession}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-[#C89630] text-xs font-semibold border border-slate-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Add Session</span>
          </button>
          {activeProgram.days.length > 1 && (
            <button
              onClick={handleDeleteCurrentSession}
              className="p-2 rounded-xl bg-slate-950 hover:bg-red-500/20 text-slate-500 hover:text-red-400 border border-slate-800 transition-colors"
              title="Delete this session from syllabus"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Session Deep Dive */}
      {currentSession && (
        <div className="space-y-5">
          {/* Session Header Card */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-[#C89630]/20 text-[#C89630] flex items-center justify-center font-mono font-bold text-xs">
                  {currentSession.dayNumber || activeSessionIndex + 1}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  SESSION ARCHITECTURE
                </span>
              </div>
              
              {/* Workspace View Switcher */}
              <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveViewTab('blueprint')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeViewTab === 'blueprint' 
                      ? 'bg-[#C89630] text-slate-950 font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Blueprint & Objectives
                </button>
                <button
                  onClick={() => setActiveViewTab('phases')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeViewTab === 'phases' 
                      ? 'bg-[#C89630] text-slate-950 font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  6-Phase Breakdown
                </button>
                <button
                  onClick={() => setActiveViewTab('drills')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeViewTab === 'drills' 
                      ? 'bg-[#C89630] text-slate-950 font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Assigned Drills ({currentSession.exercises?.length || 0})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-400 font-mono uppercase text-[10px] tracking-wider mb-1 font-bold">
                  Session Module Name
                </label>
                <input
                  type="text"
                  value={currentSession.name}
                  onChange={(e) => updateCurrentSession({ name: e.target.value })}
                  placeholder="e.g. Session 1: Communication Assessment & Baseline"
                  className="w-full h-9 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:border-[#C89630] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono uppercase text-[10px] tracking-wider mb-1 font-bold">
                  Allocated Duration (Minutes)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={currentSession.estimatedDurationMin || 90}
                    onChange={(e) => updateCurrentSession({ estimatedDurationMin: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-[#C89630] focus:outline-hidden"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-500">MINUTES</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-mono uppercase text-[10px] tracking-wider mb-1 font-bold">
                  Primary Rhetorical Focus
                </label>
                <input
                  type="text"
                  value={currentSession.focus}
                  onChange={(e) => updateCurrentSession({ focus: e.target.value })}
                  placeholder="e.g. Baseline Diagnostic, Style Evaluation & Speaking Profile"
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-[#C89630] focus:border-[#C89630] focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono uppercase text-[10px] tracking-wider mb-1 font-bold">
                  Vocal Warm-up & Physiological Cue
                </label>
                <input
                  type="text"
                  value={currentSession.warmupNotes || ''}
                  onChange={(e) => updateCurrentSession({ warmupNotes: e.target.value })}
                  placeholder="e.g. Diaphragmatic resonance humming (3x30s) + articulatory release"
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-[#C89630] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* VIEW TAB 1: BLUEPRINT & OBJECTIVES */}
          {activeViewTab === 'blueprint' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Learning Objectives Card */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-[#C89630]" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                      KEY LEARNING OUTCOMES & OBJECTIVES
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {currentSession.objectives?.length || 0} Listed
                  </span>
                </div>

                <div className="space-y-2">
                  {(!currentSession.objectives || currentSession.objectives.length === 0) ? (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-slate-500 text-xs text-center">
                      No explicit objectives added yet. Define the learning outcomes below.
                    </div>
                  ) : (
                    currentSession.objectives.map((obj, oIdx) => (
                      <div 
                        key={oIdx}
                        className="flex items-start justify-between gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C89630] shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-200 leading-snug">{obj}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveObjective(oIdx)}
                          className="text-slate-500 hover:text-red-400 p-0.5 rounded shrink-0 transition-colors"
                          title="Remove objective"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Objective Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newObjectiveText}
                    onChange={(e) => setNewObjectiveText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddObjective()}
                    placeholder="Add specific learning outcome or rhetoric benchmark..."
                    className="flex-1 h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:border-[#C89630] focus:outline-hidden"
                  />
                  <button
                    onClick={handleAddObjective}
                    className="px-3.5 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#C89630] text-xs font-bold transition-colors shrink-0"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Between-Session Practice Assignment Card */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                        BETWEEN-SESSION DISPATCH (VOICE VAULT PROMPT)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      Speaker Rehearsal
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 mb-3 leading-relaxed">
                    Provide precise instructions for the speech recording or reflection assignment the speaker must complete before the next session.
                  </p>

                  <textarea
                    rows={4}
                    value={currentSession.assignmentNotes || ''}
                    onChange={(e) => updateCurrentSession({ assignmentNotes: e.target.value })}
                    placeholder="e.g. Record a 3-minute executive briefing utilizing the BLUF framework. Upload video to Voice Vault for coach critique before Tuesday."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-hidden leading-relaxed"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#C89630] shrink-0" />
                  <span>
                    Submissions sync directly with the client's <strong>Catharsis & Voice Vault</strong> tab for coach review.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 2: 6-PHASE MASTERCLASS BREAKDOWN */}
          {activeViewTab === 'phases' && (
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-[#C89630]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                    STANDARDIZED 6-PHASE MASTERCLASS TIMELINE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Total Allocated: {(currentSession.phases || DEFAULT_6_PHASES).reduce((sum, p) => sum + p.durationMin, 0)} Min
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(currentSession.phases || DEFAULT_6_PHASES).map((phase, pIdx) => (
                  <div 
                    key={phase.id || pIdx}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {phase.phaseName}
                      </span>
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <input
                          type="number"
                          value={phase.durationMin}
                          onChange={(e) => handleUpdatePhase(pIdx, 'durationMin', Number(e.target.value))}
                          className="w-12 h-6 px-1 text-center rounded bg-slate-900 border border-slate-700 text-[#C89630] font-bold focus:outline-hidden"
                        />
                        <span className="text-[10px] text-slate-500">m</span>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={phase.description}
                      onChange={(e) => handleUpdatePhase(pIdx, 'description', e.target.value)}
                      placeholder="Phase focus description..."
                      className="w-full p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 focus:border-[#C89630] focus:outline-hidden leading-snug resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW TAB 3: ASSIGNED DRILLS */}
          {(activeViewTab === 'drills' || activeViewTab === 'blueprint') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#C89630]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                    PRACTICAL FLOOR DRILLS & REHEARSAL ROUNDS
                  </span>
                </div>
                <button
                  id="open-exercise-picker-btn"
                  onClick={() => setIsDrillPickerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C89630] hover:bg-[#b08428] text-slate-950 text-xs font-bold transition-all shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add Drill from Library</span>
                </button>
              </div>

              {/* Drills List */}
              {(!currentSession.exercises || currentSession.exercises.length === 0) ? (
                <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-dashed border-slate-800 text-slate-400 text-xs space-y-3">
                  <Mic className="h-8 w-8 mx-auto text-slate-600" />
                  <div className="text-slate-300 font-medium">No floor drills assigned to this session yet.</div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Add focused oratorical drills (e.g. BLUF Framing, Impromptu 60-Second Challenge, Hostile Q&A Defense).
                  </p>
                  <button
                    onClick={() => setIsDrillPickerOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-[#C89630] font-bold hover:bg-slate-700 border border-[#C89630]/30 shadow-md transition-all"
                  >
                    + Browse Drill Library
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentSession.exercises.map((drillItem, dIdx) => {
                    const firstSet = drillItem.sets?.[0];
                    const currentDuration = firstSet?.targetReps || '3:00 min';
                    const currentCadence = firstSet?.targetWeightKg || 140;

                    return (
                      <div
                        key={drillItem.id || dIdx}
                        className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                      >
                        {/* Drill Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#C89630]/20 text-[#C89630] font-mono font-bold text-xs">
                              {dIdx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-bold text-white">{drillItem.exerciseName}</h3>
                                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-[#C89630]">
                                  {drillItem.primaryMuscle}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {drillItem.equipment}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Reorder & Delete */}
                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <button
                              onClick={() => handleMoveDrill(dIdx, 'up')}
                              disabled={dIdx === 0}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                              title="Move up"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleMoveDrill(dIdx, 'down')}
                              disabled={dIdx === currentSession.exercises.length - 1}
                              className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                              title="Move down"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveDrill(drillItem.id)}
                              className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                              title="Remove drill"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Speech Parameters Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-400 font-mono uppercase text-[9px] tracking-wider mb-1 font-bold">
                              Speech Duration
                            </label>
                            <select
                              value={currentDuration}
                              onChange={(e) => handleUpdateDrillDuration(drillItem.id, e.target.value)}
                              className="w-full h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-[#C89630] focus:outline-hidden"
                            >
                              <option value="1:00 min">1:00 min (Blitz)</option>
                              <option value="2:00 min">2:00 min (Concise)</option>
                              <option value="3:00 min">3:00 min (Standard Floor Drill)</option>
                              <option value="4:00 min">4:00 min (Narrative Arc)</option>
                              <option value="5:00 min">5:00 min (Keynote Stanza)</option>
                              <option value="7:00 min">7:00 min (Parliamentary Constructive)</option>
                              <option value="10:00 min">10:00 min (Deep Rebuttal)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-400 font-mono uppercase text-[9px] tracking-wider mb-1 font-bold">
                              Cadence Target (WPM)
                            </label>
                            <input
                              type="number"
                              step="5"
                              min="80"
                              max="260"
                              value={currentCadence}
                              onChange={(e) => handleUpdateDrillCadence(drillItem.id, Number(e.target.value))}
                              className="w-full h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-[#C89630] font-mono font-bold focus:border-[#C89630] focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 font-mono uppercase text-[9px] tracking-wider mb-1 font-bold">
                              Delivery Rhythm Mode
                            </label>
                            <input
                              type="text"
                              value={drillItem.tempo || 'Measured & Deliberate'}
                              onChange={(e) => handleUpdateDrillField(drillItem.id, 'tempo', e.target.value)}
                              className="w-full h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-[#C89630] focus:outline-hidden"
                            />
                          </div>
                        </div>

                        {/* Coach Cues & Rhetorical Directive */}
                        <div>
                          <label className="block text-slate-400 font-mono uppercase text-[9px] tracking-wider mb-1 font-bold">
                            Coach Delivery Cues & Floor Instructions
                          </label>
                          <input
                            type="text"
                            value={drillItem.coachNotes || ''}
                            onChange={(e) => handleUpdateDrillField(drillItem.id, 'coachNotes', e.target.value)}
                            placeholder="e.g. Hold eye contact on the central premise. Pause 2 full seconds before refuting counter-points."
                            className="w-full h-8 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:border-[#C89630] focus:outline-hidden"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Drill Library Picker Modal */}
      {isDrillPickerOpen && currentSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-[#C89630]" />
                <h3 className="text-sm font-bold text-white">
                  Add Speech Drill to {currentSession.name}
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
            <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 space-y-2.5">
              <input
                type="text"
                placeholder="Search drills by keyword or technique..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-[#C89630] focus:outline-hidden"
              />

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {uniqueCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPickerCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                      pickerCategory === cat
                        ? 'bg-[#C89630] text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Drills List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-96">
              {filteredPickerExercises.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No drills matched your filter criteria.
                </div>
              ) : (
                filteredPickerExercises.map(ex => (
                  <div
                    key={ex.id}
                    onClick={() => handleAddDrillToSession(ex)}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-[#C89630]/60 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={ex.thumbnailUrl} 
                        alt={ex.name} 
                        className="h-11 w-11 rounded-lg object-cover border border-slate-800 shrink-0" 
                      />
                      <div>
                        <div className="font-bold text-white group-hover:text-[#C89630] text-xs transition-colors">
                          {ex.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[#C89630]">{ex.primaryMuscle}</span>
                          <span>•</span>
                          <span>{ex.equipment}</span>
                          <span>•</span>
                          <span className="capitalize">{ex.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#C89630] group-hover:translate-x-0.5 transition-transform shrink-0 px-2 py-1 rounded bg-[#C89630]/10 border border-[#C89630]/20">
                      Add +
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Program to Speaker Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#C89630]" />
                <h3 className="text-base font-bold text-white">
                  Assign Curriculum to Speaker
                </h3>
              </div>
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enroll a speaker into <strong>"{activeProgram.title}"</strong>. All {activeProgram.days.length} masterclass sessions and rehearsal schedules will automatically populate their client calendar and studio room.
            </p>

            <div>
              <label className="block text-slate-400 font-mono uppercase text-[10px] tracking-wider mb-1.5 font-bold">
                Select Speaker / Debater
              </label>
              <select
                value={selectedClientToAssign}
                onChange={(e) => setSelectedClientToAssign(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-[#C89630] focus:outline-hidden"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.goal} ({c.experienceLevel})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  assignProgramToClient(activeProgram.id, selectedClientToAssign);
                  setIsAssignModalOpen(false);
                  setSaveNotification('Curriculum successfully assigned to speaker schedule!');
                  setTimeout(() => setSaveNotification(null), 3500);
                }}
                className="px-5 py-2 rounded-xl bg-[#C89630] hover:bg-[#b08428] text-slate-950 font-bold text-xs shadow-md transition-all"
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
