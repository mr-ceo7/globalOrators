import React from 'react';
import { 
  Users, 
  Mic, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  Trophy, 
  MessageSquare, 
  Flame, 
  Play, 
  ChevronRight,
  ShieldAlert,
  BookOpen,
  Video
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScheduledWorkout } from '../../types';
import { LiveRehearsalRoom } from '../live/LiveRehearsalRoom';

export const CoachDashboard: React.FC<{
  onOpenNewClient?: () => void;
  onOpenNewProgram?: () => void;
  onOpenAddClientModal?: () => void;
}> = ({ onOpenNewClient, onOpenNewProgram, onOpenAddClientModal }) => {
  const { 
    clients, 
    scheduledWorkouts, 
    activityFeed, 
    setActiveTab, 
    setSelectedClientId,
    openWorkoutLogger,
    addCoachNote,
    addMetricEntry
  } = useApp();

  const [liveRoomWorkout, setLiveRoomWorkout] = React.useState<ScheduledWorkout | null>(null);

  const handleOpenClient = onOpenAddClientModal || onOpenNewClient;
  const handleOpenProgram = onOpenNewProgram || (() => setActiveTab('programs'));

  const todayStr = new Date().toISOString().split('T')[0];
  const [activeMobileSection, setActiveMobileSection] = React.useState<'schedule' | 'activity' | 'watchlist'>('schedule');


  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  // Calculated metrics
  const activeClientsCount = clients.filter(c => c.status === 'Active').length;
  const todayWorkouts = scheduledWorkouts.filter(w => w.date === todayStr);
  const completedTodayCount = todayWorkouts.filter(w => w.status === 'Completed').length;
  const pendingCheckinsCount = clients.filter(c => c.status === 'Needs Check-in').length;
  const firstPendingClient = clients.find(c => c.status === 'Needs Check-in');
  const inactiveCount = clients.filter(c => c.status !== 'Active').length;
  
  const avgCompliance = Math.round(
    clients.reduce((acc, c) => acc + c.complianceRate, 0) / (clients.length || 1)
  );

  const totalCompletedWorkoutsAllTime = clients.reduce((acc, c) => acc + c.workoutsCompleted, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                Dispatch Desk • {formattedToday}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Speaker & Debater Command
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              You have <strong className="text-emerald-400 font-semibold">{todayWorkouts.length} rehearsal sessions</strong> scheduled today with {completedTodayCount} logged. {pendingCheckinsCount > 0 ? `${pendingCheckinsCount} speaker requires delivery evaluation.` : 'All speaker evaluations are up to date.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="dashboard-onboard-client-btn"
              onClick={handleOpenClient}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Users className="h-4 w-4 text-emerald-400" />
              <span>Add Speaker</span>
            </button>

            <button
              id="dashboard-build-program-btn"
              onClick={handleOpenProgram}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              <span>Create Curriculum</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Speakers */}
        <div 
          onClick={() => setActiveTab('clients')}
          className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-400">Active Roster</span>
            <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-white">{activeClientsCount}</span>
            <span className="text-[10px] sm:text-xs text-slate-400">/ {clients.length}</span>
          </div>
          <div className="mt-1 sm:mt-2 flex items-center text-[10px] sm:text-xs text-emerald-400 font-medium truncate">
            <span className="truncate">{activeClientsCount} active • {inactiveCount} pending review</span>
          </div>
        </div>

        {/* Card 2: Sessions Completed Today */}
        <div 
          onClick={() => setActiveTab('calendar')}
          className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-400">Today's Sessions</span>
            <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-white">{completedTodayCount}</span>
            <span className="text-[10px] sm:text-xs text-slate-400">/ {todayWorkouts.length}</span>
          </div>
          <div className="mt-1 sm:mt-2 flex items-center text-[10px] sm:text-xs text-cyan-400 font-medium truncate">
            <span className="truncate">{todayWorkouts.length - completedTodayCount} scheduled</span>
          </div>
        </div>

        {/* Card 3: Pending Check-ins */}
        <div 
          onClick={() => setActiveTab('clients')}
          className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-400">Speech Reviews</span>
            <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-white">{pendingCheckinsCount}</span>
            <span className="text-[10px] sm:text-xs text-amber-400/80 font-medium">pending</span>
          </div>
          <div className="mt-1 sm:mt-2 flex items-center text-[10px] sm:text-xs text-slate-400 font-medium truncate">
            <span className="truncate">{firstPendingClient ? `${firstPendingClient.name} evaluation` : 'All evaluations cleared'}</span>
          </div>
        </div>

        {/* Card 4: Weekly Compliance Rate */}
        <div 
          onClick={() => setActiveTab('progress')}
          className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-400">Avg Fluency</span>
            <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-emerald-400">{avgCompliance}%</span>
            <span className="text-[10px] sm:text-xs text-slate-400">score</span>
          </div>
          <div className="mt-1 sm:mt-2 flex items-center text-[10px] sm:text-xs text-slate-400 font-medium truncate">
            <span className="truncate">{totalCompletedWorkoutsAllTime} deliveries logged</span>
          </div>
        </div>
      </div>

      {/* Mobile Segmented Control */}
      <div className="lg:hidden flex p-1 bg-slate-900 border border-slate-800 rounded-xl mb-4">
        <button
          onClick={() => setActiveMobileSection('schedule')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeMobileSection === 'schedule'
              ? 'bg-emerald-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Today's Schedule
        </button>
        <button
          onClick={() => setActiveMobileSection('activity')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeMobileSection === 'activity'
              ? 'bg-emerald-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Activity Feed
        </button>
        <button
          onClick={() => setActiveMobileSection('watchlist')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeMobileSection === 'watchlist'
              ? 'bg-emerald-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Watchlist
        </button>
      </div>

      {/* Main Grid: Today's Workouts + Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Today's Scheduled Workouts */}
        <div className={`lg:col-span-2 space-y-4 ${activeMobileSection === 'schedule' ? 'block' : 'hidden lg:block'}`}>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Today's Speech & Debate Schedule</h3>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Full Calendar <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayWorkouts.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs leading-relaxed">
                No speech sessions scheduled for today. Assign a rehearsal session from the speaker profile or calendar.
              </div>
            ) : (
              todayWorkouts.map((workout) => {
                const isDone = workout.status === 'Completed';

                return (
                  <div
                    key={workout.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDone 
                        ? 'bg-slate-900/60 border-emerald-500/30' 
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Client info & workout title */}
                      <div className="flex items-center gap-3">
                        <img 
                          src={workout.clientAvatar} 
                          alt={workout.clientName} 
                          className="h-11 w-11 rounded-xl object-cover border border-slate-700" 
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span 
                              onClick={() => {
                                setSelectedClientId(workout.clientId);
                                setActiveTab('clients');
                              }}
                              className="text-sm font-bold text-white hover:text-emerald-400 cursor-pointer"
                            >
                              {workout.clientName}
                            </span>
                            <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                              {workout.time || 'All Day'}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-slate-300 mt-0.5">
                            {workout.workoutTitle}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {workout.programName || 'Custom Speech Protocol'}
                          </div>
                        </div>
                      </div>

                      {/* Status & Action */}
                      <div className="flex items-center gap-2.5 sm:self-center">
                        {isDone ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Completed ({workout.durationMin}m)
                            </span>
                            <button
                              onClick={() => openWorkoutLogger(workout)}
                              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 font-medium"
                            >
                              Review Log
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
                              Scheduled
                            </span>
                            <button
                              onClick={() => setLiveRoomWorkout(workout)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                              title="Launch Live Rehearsal Room"
                            >
                              <Video className="h-3 w-3 text-emerald-400" />
                              <span>Live Room</span>
                            </button>
                            <button
                              id={`log-workout-${workout.id}`}
                              onClick={() => openWorkoutLogger(workout)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-xs"
                            >
                              <Play className="h-3 w-3 fill-slate-950" />
                              <span>Log Session</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feedback preview if completed */}
                    {isDone && workout.clientFeedback && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl">
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-200">Speaker Note:</strong> "{workout.clientFeedback}"
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Roster At-A-Glance Bar */}
          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Coaching Tip of the Day</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Reinforce 2-second strategic pauses and diaphragmatic breath support on all constructive debate speeches this week.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('messenger')}
                className="text-xs font-bold text-emerald-400 hover:underline shrink-0"
              >
                Broadcast to Speakers →
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Activity Feed & Milestone Alerts */}
        <div className={`space-y-6 ${activeMobileSection !== 'schedule' ? 'block' : 'hidden lg:block'}`}>
          
          {/* Milestones & Activity Feed */}
          <div className={`space-y-4 ${activeMobileSection === 'activity' ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Milestones & Activity</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">Live stream</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 divide-y divide-slate-800/80">
              {activityFeed.slice(0, 6).map((item) => (
                <div 
                  key={item.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 hover:bg-slate-800/30 p-2 rounded-xl transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedClientId(item.clientId);
                    if (item.type === 'new_message') setActiveTab('messenger');
                    else if (item.type === 'pr_achieved') setActiveTab('progress');
                    else setActiveTab('clients');
                  }}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={item.clientAvatar} 
                      alt={item.clientName} 
                      className="h-8 w-8 rounded-full object-cover border border-slate-700" 
                    />
                    {item.type === 'pr_achieved' && (
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center text-[9px] text-slate-950 font-black">
                        ★
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate">{item.clientName}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                    </div>
                    <div className="text-xs font-medium text-emerald-400 truncate mt-0.5">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Injury & Health Watchlist Widget */}
          <div className={`p-4 rounded-2xl bg-slate-900/90 border border-slate-800 ${activeMobileSection === 'watchlist' ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Vocal Health & Pacing Watchlist</h4>
            </div>
            
            <div className="space-y-2">
              {clients.filter(c => c.injuriesAndHealth.length > 0).slice(0, 2).map(c => (
                <div 
                  key={c.id}
                  onClick={() => {
                    setSelectedClientId(c.id);
                    setActiveTab('clients');
                  }}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{c.name}</span>
                    <span className="text-[10px] text-amber-400 font-semibold">{c.injuriesAndHealth.length} focus area</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {c.medicalAlerts || c.injuriesAndHealth[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Embedded Live Rehearsal Studio Modal */}
      {liveRoomWorkout && (
        <LiveRehearsalRoom
          isOpen={Boolean(liveRoomWorkout)}
          onClose={() => setLiveRoomWorkout(null)}
          roomTitle={`Live Rehearsal: ${liveRoomWorkout.workoutTitle} (${liveRoomWorkout.clientName})`}
          speakerName={liveRoomWorkout.clientName}
          speakerId={liveRoomWorkout.clientId}
          userRole="coach"
          onSaveFeedback={({ wpm, score, notes, durationSeconds }) => {
            const durMin = Math.max(1, Math.round(durationSeconds / 60));
            addCoachNote(liveRoomWorkout.clientId, `Live Rehearsal (${durMin} min, ${wpm} WPM, Score: ${score}/10): ${notes}`);
            addMetricEntry({
              clientId: liveRoomWorkout.clientId,
              date: new Date().toISOString().split('T')[0],
              weightKg: wpm,
              bodyFatPercentage: score * 10,
              notes: `Live Session Rehearsal (${durMin} min): ${notes}`
            });
          }}
        />
      )}
    </div>
  );
};
