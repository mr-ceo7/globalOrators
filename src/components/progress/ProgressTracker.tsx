import React, { useState } from 'react';
import { 
  TrendingUp, 
  Award, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Camera, 
  Flame, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight, 
  X, 
  Droplets, 
  Moon, 
  Activity, 
  BookOpen, 
  Mic, 
  Volume2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricEntry, PersonalRecord, ProgressPhoto } from '../../types';

export const ProgressTracker: React.FC = () => {
  const { 
    clients, 
    selectedClientId, 
    setSelectedClientId, 
    metrics, 
    personalRecords, 
    photos, 
    habitLogs, 
    toggleHabitCompletion, 
    addMetricEntry,
    addPersonalRecord,
    addProgressPhoto
  } = useApp();

  const [activeTab, setActiveTab] = useState<'metrics' | 'habits' | 'photos' | 'prs'>('metrics');
  const [selectedRange, setSelectedRange] = useState<'1M' | '3M' | '6M' | 'All'>('All');

  // Active speaker
  const activeClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const clientMetrics = metrics.filter(m => m.clientId === activeClient?.id);
  const clientPRs = personalRecords.filter(pr => pr.clientId === activeClient?.id);
  const clientPhotos = photos.filter(p => p.clientId === activeClient?.id);

  // Today's habit log
  const todayStr = '2026-08-16';
  const todayHabits = habitLogs.find(l => l.clientId === activeClient?.id && l.date === todayStr)?.habits || [
    { habitId: 'h-1', title: 'Vocal Hydration (Warm Lemon Water)', completed: true, currentValue: '2.5', targetValue: '2.5', unit: 'Liters' },
    { habitId: 'h-2', title: 'Diaphragmatic Breathwork', completed: true, currentValue: '15', targetValue: '15', unit: 'Minutes' },
    { habitId: 'h-3', title: 'Editorial & Current Affairs Reading', completed: true, currentValue: '30', targetValue: '20', unit: 'Minutes' },
    { habitId: 'h-4', title: 'Vocal Cord Rest & Sleep', completed: true, currentValue: '8.0', targetValue: '7.5+', unit: 'Hours' },
    { habitId: 'h-5', title: 'Tongue Twisters & Articulation', completed: false, currentValue: '5', targetValue: '10', unit: 'Minutes' }
  ];

  // Photo comparison viewer state
  const [beforePhotoId, setBeforePhotoId] = useState<string>(clientPhotos[0]?.id || '');
  const [afterPhotoId, setAfterPhotoId] = useState<string>(clientPhotos[1]?.id || clientPhotos[0]?.id || '');

  // Modals state
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [isPrModalOpen, setIsPrModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // New Metric Form State
  const [formDate, setFormDate] = useState('2026-08-16');
  const [formWeight, setFormWeight] = useState(activeClient?.currentWeightKg || 140);
  const [formBodyFat, setFormBodyFat] = useState(activeClient?.bodyFatPercentage || 88);
  const [formChest, setFormChest] = useState(4); // Filler words / min
  const [formWaist, setFormWaist] = useState(78); // Vocal projection dB
  const [formArms, setFormArms] = useState(8.5); // Stage presence score
  const [formNotes, setFormNotes] = useState('');

  // New PR Form State
  const [formPrExercise, setFormPrExercise] = useState('Oxford Union Rebuttal Round');
  const [formPrWeight, setFormPrWeight] = useState(29.5);
  const [formPrReps, setFormPrReps] = useState(4);

  // New Photo Form State
  const [formPhotoView, setFormPhotoView] = useState<'Front' | 'Side' | 'Back'>('Front');
  const [formPhotoUrl, setFormPhotoUrl] = useState('https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80');
  const [formPhotoNotes, setFormPhotoNotes] = useState('Stage posture and rostrum delivery check-in.');

  const handleCreateMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) return;

    addMetricEntry({
      clientId: activeClient.id,
      date: formDate,
      weightKg: Number(formWeight),
      bodyFatPercentage: Number(formBodyFat),
      chestCm: Number(formChest),
      waistCm: Number(formWaist),
      armsCm: Number(formArms),
      notes: formNotes.trim() || undefined
    });

    setIsMetricModalOpen(false);
  };

  const handleCreatePR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) return;

    const est1Rm = Math.round(Number(formPrWeight) * 3 + Number(formPrReps) * 2);
    addPersonalRecord({
      clientId: activeClient.id,
      exerciseName: formPrExercise,
      weightKg: Number(formPrWeight),
      reps: Number(formPrReps),
      estimated1RmKg: est1Rm,
      date: new Date().toISOString().split('T')[0]
    });

    setIsPrModalOpen(false);
  };

  const handleCreatePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) return;

    addProgressPhoto({
      clientId: activeClient.id,
      date: new Date().toISOString().split('T')[0],
      view: formPhotoView,
      photoUrl: formPhotoUrl,
      weightKg: activeClient.currentWeightKg,
      bodyFatPercentage: activeClient.bodyFatPercentage,
      notes: formPhotoNotes
    });

    setIsPhotoModalOpen(false);
  };

  // SVG Chart rendering calculations for Cadence (WPM) Trend
  const sortedMetrics = [...clientMetrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const weights = sortedMetrics.map(m => m.weightKg);
  const minWeight = Math.min(...(weights.length ? weights : [120]), (activeClient?.targetWeightKg || 120)) - 5;
  const maxWeight = Math.max(...(weights.length ? weights : [160]), (activeClient?.startingWeightKg || 160)) + 5;

  const chartWidth = 600;
  const chartHeight = 200;
  const padding = 40;

  const points = sortedMetrics.map((m, idx) => {
    const x = padding + (idx / Math.max(1, sortedMetrics.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - ((m.weightKg - minWeight) / (maxWeight - minWeight || 1)) * (chartHeight - padding * 2);
    return { x, y, data: m };
  });

  const pathD = points.length > 0 
    ? `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}` 
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : '';

  const targetY = chartHeight - padding - (((activeClient?.targetWeightKg || 140) - minWeight) / (maxWeight - minWeight || 1)) * (chartHeight - padding * 2);

  const beforePhoto = clientPhotos.find(p => p.id === beforePhotoId) || clientPhotos[0];
  const afterPhoto = clientPhotos.find(p => p.id === afterPhotoId) || clientPhotos[clientPhotos.length - 1] || clientPhotos[0];

  const getHabitIcon = (title: string) => {
    if (title.includes('Hydration') || title.includes('Water')) return <Droplets className="h-4 w-4 text-cyan-400" />;
    if (title.includes('Breathwork') || title.includes('Diaphragmatic')) return <Activity className="h-4 w-4 text-emerald-400" />;
    if (title.includes('Reading') || title.includes('Editorial')) return <BookOpen className="h-4 w-4 text-amber-400" />;
    if (title.includes('Sleep') || title.includes('Rest')) return <Moon className="h-4 w-4 text-slate-300" />;
    return <Mic className="h-4 w-4 text-emerald-400" />;
  };

  const completedHabitsCount = todayHabits.filter(h => h.completed).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Speaker Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            Speaker Analytics, Habits & Milestones
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track speaking pace (WPM), clarity & fluency metrics, debate milestones, daily vocal habits, and stage presence recordings.
          </p>
        </div>

        {/* Speaker selector pill */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 pl-2">Speaker:</span>
          <select
            value={activeClient?.id}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="h-8 px-3 rounded-xl bg-slate-950 text-xs font-bold text-emerald-400 focus:outline-hidden"
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Speaker Metric Summary Card */}
      {activeClient && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/30 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <img 
              src={activeClient.avatar} 
              alt={activeClient.name} 
              className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">{activeClient.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {activeClient.goal}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Coaching started {activeClient.startDate} • {activeClient.workoutsCompleted} rehearsals logged
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Cadence</span>
              <div className="text-base font-extrabold text-white mt-0.5">{activeClient.currentWeightKg} WPM</div>
              <span className="text-[10px] text-emerald-400 font-bold">Goal: {activeClient.targetWeightKg} WPM</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Fluency Score</span>
              <div className="text-base font-extrabold text-cyan-400 mt-0.5">{activeClient.bodyFatPercentage}%</div>
              <span className="text-[10px] text-slate-400">Target: {activeClient.targetBodyFat}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Pace Adjustment</span>
              <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                {(activeClient.currentWeightKg - activeClient.startingWeightKg > 0 ? '+' : '')}{(activeClient.currentWeightKg - activeClient.startingWeightKg).toFixed(0)} WPM
              </div>
              <span className="text-[10px] text-slate-400">Since Baseline</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Vocal Habit Adherence</span>
              <div className="text-base font-extrabold text-amber-400 mt-0.5">
                {Math.round((completedHabitsCount / todayHabits.length) * 100)}%
              </div>
              <span className="text-[10px] text-slate-400">{completedHabitsCount}/{todayHabits.length} completed</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'metrics' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Volume2 className="h-4 w-4" />
          Speaking Cadence & Delivery
        </button>
        <button
          onClick={() => setActiveTab('habits')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'habits' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Daily Vocal Habits
        </button>
        <button
          onClick={() => setActiveTab('prs')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'prs' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="h-4 w-4 text-emerald-400" />
          Speech Milestones & Speaker Points
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'photos' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="h-4 w-4" />
          Stage Presence & Video Gallery
        </button>
      </div>

      {/* Subtab 1: Speaking Cadence & Delivery Chart */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Main Chart Container */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-emerald-400" />
                  Speaking Cadence Progression Trend (Words Per Minute)
                </h3>
                <p className="text-xs text-slate-400">
                  Target pacing benchmark: <strong className="text-emerald-400">{activeClient?.targetWeightKg} WPM</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMetricModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Log Speech Metric</span>
                </button>
              </div>
            </div>

            {/* SVG Interactive Chart */}
            <div className="w-full overflow-x-auto">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-64 overflow-visible"
              >
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#1e293b" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

                {/* Target Pacing Goal Line */}
                <line 
                  x1={padding} 
                  y1={targetY} 
                  x2={chartWidth - padding} 
                  y2={targetY} 
                  stroke="#06b6d4" 
                  strokeWidth="1.5" 
                  strokeDasharray="6 4" 
                />
                <text x={chartWidth - padding + 5} y={targetY + 4} fill="#06b6d4" fontSize="9" fontWeight="bold">
                  Target ({activeClient?.targetWeightKg} WPM)
                </text>

                {/* Area fill */}
                {areaD && (
                  <path d={areaD} fill="url(#emeraldGradient)" />
                )}

                {/* Line Path */}
                {pathD && (
                  <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                )}

                {/* Data Points */}
                {points.map((pt, i) => (
                  <g key={i} className="group cursor-pointer">
                    <circle 
                      cx={pt.x} 
                      cy={pt.y} 
                      r="5" 
                      fill="#090d16" 
                      stroke="#10b981" 
                      strokeWidth="2.5" 
                      className="group-hover:r-7 transition-all"
                    />
                    <text 
                      x={pt.x} 
                      y={pt.y - 10} 
                      textAnchor="middle" 
                      fill="#e2e8f0" 
                      fontSize="10" 
                      fontWeight="bold"
                    >
                      {pt.data.weightKg} WPM
                    </text>
                    <text 
                      x={pt.x} 
                      y={chartHeight - padding + 15} 
                      textAnchor="middle" 
                      fill="#64748b" 
                      fontSize="9"
                    >
                      {pt.data.date.substring(5)}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Metric Entries History Table */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Speech Delivery & Vocal Metric History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Cadence (WPM)</th>
                    <th className="py-2.5 px-3">Fluency %</th>
                    <th className="py-2.5 px-3">Vocal Proj (dB)</th>
                    <th className="py-2.5 px-3">Fillers / Min</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {clientMetrics.map(m => (
                    <tr key={m.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-white">{m.date}</td>
                      <td className="py-2.5 px-3 font-extrabold text-emerald-400">{m.weightKg} WPM</td>
                      <td className="py-2.5 px-3 text-cyan-400">{m.bodyFatPercentage ? `${m.bodyFatPercentage}%` : '--'}</td>
                      <td className="py-2.5 px-3">{m.waistCm ? `${m.waistCm} dB` : '--'}</td>
                      <td className="py-2.5 px-3">{m.chestCm !== undefined ? `${m.chestCm} /min` : '--'}</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.notes || 'Routine check-in'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Daily Vocal Habits */}
      {activeTab === 'habits' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Daily Vocal & Rhetorical Habits ({todayStr})
                </h3>
                <p className="text-xs text-slate-400">
                  Daily regimen for diaphragmatic breathwork, vocal hydration, speech reading, and articulation drills.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {completedHabitsCount} / {todayHabits.length} Completed Today
                </span>
              </div>
            </div>

            {/* Habit Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayHabits.map((habit) => (
                <div
                  key={habit.habitId}
                  onClick={() => activeClient && toggleHabitCompletion(activeClient.id, todayStr, habit.habitId)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    habit.completed
                      ? 'bg-emerald-950/30 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      habit.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {getHabitIcon(habit.title)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {habit.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Target: <strong className="text-slate-200">{habit.targetValue} {habit.unit}</strong>
                      </p>
                    </div>
                  </div>

                  <div className={`p-2 rounded-xl transition-colors ${
                    habit.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-500'
                  }`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly Habit Heatmap Strip */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">7-Day Vocal Regimen Consistency</h4>
              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun (Today)'].map((day, idx) => (
                  <div key={day} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400">{day}</span>
                    <div className="h-2 w-full rounded-full bg-emerald-500 mt-1.5" />
                    <span className="text-[10px] font-bold text-emerald-400 mt-1 block">100%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Speech Milestones & Speaker Points */}
      {activeTab === 'prs' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-400" />
                  Speech & Debate Milestones Hall of Fame
                </h3>
                <p className="text-xs text-slate-400">
                  Tournament speaker points, cadence records, delivery rubric scores, and historic podium performances.
                </p>
              </div>

              <button
                onClick={() => setIsPrModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>+ Log New Milestone</span>
              </button>
            </div>

            {/* Milestone Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientPRs.map((pr) => (
                <div key={pr.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">{pr.exerciseName}</h4>
                    <span className="text-[10px] text-slate-400">{pr.date}</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-400">{pr.weightKg} pts</span>
                    <span className="text-xs text-slate-300 font-bold">× {pr.reps} rounds</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Oratory Index: <strong className="text-emerald-400">{pr.estimated1RmKg} pts</strong></span>
                    {pr.previousWeightKg && (
                      <span className="text-emerald-400 font-bold">
                        +{pr.weightKg - pr.previousWeightKg} pt Milestone
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Progress Visual Gallery */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="h-5 w-5 text-emerald-400" />
                  Stage Posture & Delivery Visual Gallery
                </h3>
                <p className="text-xs text-slate-400">
                  Visual stage presence tracking with posture alignment, rostrum stance, and audience engagement.
                </p>
              </div>

              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold shadow-md self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>+ Upload Stage Check-in</span>
              </button>
            </div>

            {/* Side-by-side photo comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Baseline Stance (Before)</span>
                    <h4 className="text-xs font-bold text-white">{beforePhoto?.date || 'Day 1 Baseline'}</h4>
                  </div>
                  <span className="text-xs font-bold text-slate-300">
                    {beforePhoto?.weightKg} WPM • {beforePhoto?.bodyFatPercentage}% Fluency
                  </span>
                </div>

                <div className="relative h-80 rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src={beforePhoto?.photoUrl}
                    alt="Before Check-in"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-white">
                    {beforePhoto?.view || 'Front'} Rostrum View
                  </div>
                </div>
              </div>

              {/* After Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Recent Tournament Stance (After)</span>
                    <h4 className="text-xs font-bold text-white">{afterPhoto?.date || 'Championship Check-in'}</h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    {afterPhoto?.weightKg} WPM • {afterPhoto?.bodyFatPercentage}% Fluency
                  </span>
                </div>

                <div className="relative h-80 rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src={afterPhoto?.photoUrl}
                    alt="After Check-in"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                    {afterPhoto?.view || 'Front'} Rostrum View
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Metric Modal */}
      {isMetricModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-emerald-400" />
                Log Speaker Delivery Metric
              </h3>
              <button onClick={() => setIsMetricModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMetric} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Speaking Cadence (WPM) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Fluency / Clarity %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formBodyFat}
                    onChange={(e) => setFormBodyFat(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1">Vocal Proj (dB)</label>
                  <input
                    type="number"
                    value={formWaist}
                    onChange={(e) => setFormWaist(Number(e.target.value))}
                    className="w-full h-9 px-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1">Fillers / Min</label>
                  <input
                    type="number"
                    value={formChest}
                    onChange={(e) => setFormChest(Number(e.target.value))}
                    className="w-full h-9 px-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1">Stage Presence (1-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formArms}
                    onChange={(e) => setFormArms(Number(e.target.value))}
                    className="w-full h-9 px-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Coach Assessment Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Crisp articulation, strategic 2s pauses, strong diaphragmatic projection..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMetricModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold shadow-md"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log PR Modal */}
      {isPrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-400" />
                Log Speech Milestone
              </h3>
              <button onClick={() => setIsPrModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePR} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Speech / Debate Event</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oxford Union Rebuttal Round"
                  value={formPrExercise}
                  onChange={(e) => setFormPrExercise(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Speaker Points / Pace (WPM)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formPrWeight}
                    onChange={(e) => setFormPrWeight(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Speeches / Rounds</label>
                  <input
                    type="number"
                    value={formPrReps}
                    onChange={(e) => setFormPrReps(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold shadow-md"
                >
                  Log Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-emerald-400" />
                Upload Stage Check-in Photo
              </h3>
              <button onClick={() => setIsPhotoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePhoto} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Stage Stance / Angle View</label>
                <select
                  value={formPhotoView}
                  onChange={(e) => setFormPhotoView(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="Front">Podium / Rostrum Front</option>
                  <option value="Side">Side Stage Profile</option>
                  <option value="Back">Audience / Panel View</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Photo Image URL</label>
                <input
                  type="text"
                  value={formPhotoUrl}
                  onChange={(e) => setFormPhotoUrl(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Delivery & Presence Notes</label>
                <textarea
                  rows={2}
                  value={formPhotoNotes}
                  onChange={(e) => setFormPhotoNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold shadow-md"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
