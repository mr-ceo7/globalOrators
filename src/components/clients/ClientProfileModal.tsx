import React, { useState } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle2, 
  Plus, 
  ShieldAlert, 
  Activity, 
  Award, 
  Phone, 
  Mail, 
  Target,
  UserPlus,
  Ban,
  RefreshCw,
  Trash2,
  UserX
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';

interface ClientProfileModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ client, isOpen, onClose }) => {
  const { 
    updateClient, 
    addCoachNote, 
    programs, 
    assignProgramToClient, 
    scheduledWorkouts, 
    metrics, 
    personalRecords,
    setActiveTab,
    setSelectedClientId,
    openWorkoutLogger,
    coaches,
    fetchCoaches,
    reassignClientCoach,
    addAdjudicationNote,
    showToast,
    deleteClient,
    suspendClient,
    reactivateClient
  } = useApp();

  const [activeTab, setActiveModalTab] = useState<'overview' | 'health' | 'notes' | 'adjudication' | 'program' | 'metrics'>('overview');
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedProgramToAssign, setSelectedProgramToAssign] = useState<string>(client.currentProgramId || '');
  const [editStatus, setEditStatus] = useState(client.status);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Coach Reassignment State
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState<string>(client.coachId || '');
  const [reassignReason, setReassignReason] = useState<string>('');
  const [isSubmittingReassign, setIsSubmittingReassign] = useState<boolean>(false);

  // Panel Adjudication State
  const [adjCategory, setAdjCategory] = useState<string>('Executive Presence & Poise');
  const [adjRating, setAdjRating] = useState<number>(8.5);
  const [adjNote, setAdjNote] = useState<string>('');
  const [isSubmittingAdj, setIsSubmittingAdj] = useState<boolean>(false);

  React.useEffect(() => {
    if (coaches.length === 0) {
      fetchCoaches();
    }
  }, [coaches.length, fetchCoaches]);

  const assignedCoach = React.useMemo(() => {
    return coaches.find(c => c.id === client.coachId);
  }, [coaches, client.coachId]);

  const currentUser = React.useMemo(() => {
    try {
      const u = localStorage.getItem('globalorators_user') || localStorage.getItem('nubianfit_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }, []);

  if (!isOpen) return null;

  const clientWorkouts = scheduledWorkouts.filter(w => w.clientId === client.id);
  const clientMetrics = metrics.filter(m => m.clientId === client.id);
  const clientPRs = personalRecords.filter(pr => pr.clientId === client.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addCoachNote(client.id, newNoteText.trim());
    setNewNoteText('');
  };

  const handleAssignProgram = () => {
    if (!selectedProgramToAssign) return;
    assignProgramToClient(selectedProgramToAssign, client.id);
  };

  const handleStatusChange = (newStatus: Client['status']) => {
    setEditStatus(newStatus);
    updateClient(client.id, { status: newStatus });
  };

  const weightDelta = (client.currentWeightKg - client.startingWeightKg).toFixed(1);
  const isWeightDown = Number(weightDelta) < 0;


  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">

      <div className="relative w-full max-w-4xl h-[88vh] sm:h-auto max-h-[88vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-900 border-t sm:border border-slate-700 shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300">
        
        {/* Mobile bottom-sheet drag handle */}
        <div className="flex justify-center py-2 sm:hidden bg-slate-950/80 shrink-0">
          <div className="w-10 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Header with Speaker Profile Banner */}
        <div className="relative p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-b border-slate-800">
          <button 
            id="close-client-profile-btn"
            onClick={onClose}
            className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src={client.avatar} 
                alt={client.name} 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=047857&color=fff`;
                }}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg"
              />
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">{client.name}</h2>
                  {/* Status selector */}
                  <select
                    value={editStatus}
                    onChange={(e) => handleStatusChange(e.target.value as Client['status'])}
                    className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Needs Check-in">Needs Check-in</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-slate-400" /> {client.email}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" /> {client.phone}</span>
                  <span>Age {client.age} • {client.gender}</span>
                  <span className="text-slate-600">•</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Faculty Coach:</span>
                    <span className={`font-mono text-xs font-semibold ${assignedCoach ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {assignedCoach ? assignedCoach.name : 'Unassigned Triage'}
                    </span>
                    {!assignedCoach && currentUser?.id && (
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await reassignClientCoach(client.id, currentUser.id, 'Claimed by coach from intake pool');
                          if (ok) {
                            showToast(`Claimed ${client.name} to your roster.`);
                          }
                        }}
                        className="ml-1 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-sm transition-all cursor-pointer"
                        title={`Claim ${client.name} to your personal coaching roster`}
                      >
                        <UserPlus className="h-3 w-3 stroke-[2.5]" />
                        <span>Claim to My Roster</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsReassignOpen(prev => !prev)}
                      className="ml-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      {isReassignOpen ? 'Cancel' : 'Reassign'}
                    </button>
                  </div>
                </div>

                {isReassignOpen && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-700 space-y-2 max-w-xl animate-in fade-in duration-150">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      Reassign / Delegate Speaker
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={selectedCoachId}
                        onChange={(e) => setSelectedCoachId(e.target.value)}
                        className="h-8 px-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden"
                      >
                        <option value="">Select Target Coach...</option>
                        {coaches.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.id})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Reassignment rationale (optional)..."
                        value={reassignReason}
                        onChange={(e) => setReassignReason(e.target.value)}
                        className="h-8 px-2 flex-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        disabled={isSubmittingReassign || !selectedCoachId}
                        onClick={async () => {
                          if (!selectedCoachId) return;
                          setIsSubmittingReassign(true);
                          const ok = await reassignClientCoach(client.id, selectedCoachId, reassignReason || undefined);
                          setIsSubmittingReassign(false);
                          if (ok) {
                            setIsReassignOpen(false);
                            setReassignReason('');
                          }
                        }}
                        className="h-8 px-3 rounded-lg bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {isSubmittingReassign ? 'Saving...' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              {!client.coachId && currentUser?.id && (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await reassignClientCoach(client.id, currentUser.id, 'Claimed by coach from intake pool');
                    if (ok) {
                      showToast(`Claimed ${client.name} to your roster.`);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 transition-all cursor-pointer"
                  title={`Claim ${client.name} to your coaching roster`}
                >
                  <UserPlus className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Claim Speaker</span>
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedClientId(client.id);
                  setActiveTab('messenger');
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
                <span>Message</span>
              </button>

              <button
                onClick={() => {
                  setSelectedClientId(client.id);
                  setActiveTab('progress');
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Metrics</span>
              </button>

              {/* Management Actions */}
              <div className="flex items-center gap-1.5 ml-auto">
                {client.status === 'Suspended' ? (
                  <button
                    onClick={async () => { await reactivateClient(client.id); onClose(); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-colors"
                    title="Reactivate speaker"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reactivate</span>
                  </button>
                ) : (
                  <button
                    onClick={async () => { await suspendClient(client.id); onClose(); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-xs font-bold border border-amber-500/30 transition-colors"
                    title="Suspend speaker"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    <span>Suspend</span>
                  </button>
                )}
                {client.coachId && (
                  <button
                    onClick={async () => { await reassignClientCoach(client.id, '', 'Released to intake pool'); onClose(); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 text-xs font-bold border border-sky-500/30 transition-colors"
                    title="Release to intake pool"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    <span>Release</span>
                  </button>
                )}
                {confirmDelete ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={async () => { setConfirmDelete(false); await deleteClient(client.id); onClose(); }}
                      className="px-3 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-colors"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 transition-colors"
                    title="Delete speaker permanently"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Focus</span>
              <div 
                className={`text-sm font-bold truncate ${client.goal ? 'text-emerald-400' : 'text-slate-500 italic font-normal'}`}
                title={client.goal || 'Pending Intake'}
              >
                {client.goal || 'Pending Intake'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Speaking Pace</span>
              <div className="font-bold text-white text-sm">
                {client.currentWeightKg} WPM <span className={`text-xs ${isWeightDown ? 'text-emerald-400' : 'text-cyan-400'}`}>({isWeightDown ? '' : '+'}{weightDelta} WPM)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Fluency Score</span>
              <div className="font-bold text-emerald-400 text-sm">{client.complianceRate}% score</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Clarity & Eloquence</span>
              <div className="font-bold text-white text-sm">{client.bodyFatPercentage}% <span className="text-slate-400 text-xs">(Goal: {client.targetBodyFat}%)</span></div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveModalTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Survey
          </button>
          <button
            onClick={() => setActiveModalTab('health')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'health' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            Speech Focus & Health ({client.injuriesAndHealth.length})
          </button>
          <button
            onClick={() => setActiveModalTab('program')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'program' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Curriculum & Sessions ({clientWorkouts.length})
          </button>
          <button
            onClick={() => setActiveModalTab('notes')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'notes' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Coach Notes ({client.customCoachNotes.length})
          </button>
          <button
            onClick={() => setActiveModalTab('adjudication')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'adjudication' ? 'border-amber-500 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5 text-amber-400" />
            Panel Adjudication ({client.adjudicatorNotes?.length || 0})
          </button>
          <button
            onClick={() => setActiveModalTab('metrics')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'metrics' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Milestones & Records
          </button>

        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Current Active Curriculum Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Oratory Curriculum</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{client.currentProgramName || 'No curriculum assigned currently'}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {client.workoutsCompleted} completed out of {client.totalWorkoutsAssigned} assigned speech sessions.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedProgramToAssign}
                    onChange={(e) => setSelectedProgramToAssign(e.target.value)}
                    className="h-8 px-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-hidden"
                  >
                    <option value="">Select template...</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignProgram}
                    className="h-8 px-3 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold hover:bg-emerald-500/30 transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>

              {/* Onboarding Survey Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Speaker Intake Survey</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 font-semibold">Debate Format & Venue Access:</span>
                    <p className="text-slate-200 mt-0.5">{client.onboardingSurvey.gymAccess}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Weekly Practice Availability:</span>
                    <p className="text-slate-200 mt-0.5">{client.onboardingSurvey.weeklyAvailabilityDays} Days / Week</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Background & Affiliation:</span>
                    <p className="text-slate-200 mt-0.5">{client.onboardingSurvey.dietaryRestrictions}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Prep Routine & Stress:</span>
                    <p className="text-slate-200 mt-0.5">{client.onboardingSurvey.sleepAvgHours} hrs/night • Stress: {client.onboardingSurvey.stressLevel}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Favorite Speech Drills:</span>
                    <p className="text-emerald-400 mt-0.5">{client.onboardingSurvey.favoriteExercises}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Areas Needing Growth:</span>
                    <p className="text-amber-400 mt-0.5">{client.onboardingSurvey.leastFavoriteExercises}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Injuries & Medical Alerts */}
          {activeTab === 'health' && (
            <div className="space-y-4">
              {client.medicalAlerts && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Coach Vocal Health Alert</h4>
                    <p className="text-slate-200 mt-1">{client.medicalAlerts}</p>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Reported Speech Delivery & Vocal History</h4>
                {client.injuriesAndHealth.length === 0 ? (
                  <p className="text-slate-400">No speech or vocal health constraints reported.</p>
                ) : (
                  <div className="space-y-2">
                    {client.injuriesAndHealth.map((injury, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                        <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                        <span>{injury}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Curriculum & Rehearsal Sessions */}
          {activeTab === 'program' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Scheduled & Logged Sessions</h4>
                <button
                  onClick={() => {
                    setActiveTab('calendar');
                    onClose();
                  }}
                  className="text-xs font-bold text-emerald-400 hover:underline"
                >
                  Schedule in Calendar →
                </button>
              </div>

              <div className="space-y-2.5">
                {clientWorkouts.length === 0 ? (
                  <p className="text-slate-400 p-4 text-center">No sessions assigned yet. Assign a curriculum from the Overview tab.</p>
                ) : (
                  clientWorkouts.map(w => (
                    <div key={w.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{w.workoutTitle}</div>
                        <div className="text-[11px] text-slate-400">{w.date} • {w.programName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          w.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {w.status}
                        </span>
                        <button
                          onClick={() => {
                            openWorkoutLogger(w);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
                        >
                          Review Log
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab: Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Add Private Coach Evaluation Note</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Refined opening hook with rhetorical questions; pacing held steady at 148 WPM..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 h-10 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shrink-0"
                  >
                    Add Note
                  </button>
                </div>
              </form>

              <div className="space-y-2 pt-2">
                {client.customCoachNotes.map((note, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200">
                    <p className="leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Panel Adjudication */}
          {activeTab === 'adjudication' && (
            <div className="space-y-4">
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!adjNote.trim()) return;
                  setIsSubmittingAdj(true);
                  const ok = await addAdjudicationNote(client.id, adjNote.trim(), adjCategory, adjRating);
                  setIsSubmittingAdj(false);
                  if (ok) {
                    setAdjNote('');
                  }
                }}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-slate-200">Submit Panel Adjudication Feedback</h4>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Faculty Reviewer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Rubric Category
                    </label>
                    <select
                      value={adjCategory}
                      onChange={(e) => setAdjCategory(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="Executive Presence & Poise">Executive Presence & Poise</option>
                      <option value="Argumentation & Logic">Argumentation & Logic</option>
                      <option value="Vocal Cadence & Modulation">Vocal Cadence & Modulation</option>
                      <option value="Audience Engagement & Hook">Audience Engagement & Hook</option>
                      <option value="Emotional Vulnerability">Emotional Vulnerability</option>
                      <option value="Refutation & Rebuttal Depth">Refutation & Rebuttal Depth</option>
                      <option value="General Adjudication">General Adjudication</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Rubric Score (1 - 10)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      value={adjRating}
                      onChange={(e) => setAdjRating(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    Evaluator Feedback & Diagnostic Assessment
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Document actionable diagnostic feedback, delivery strengths, and specific areas for rhetorical refinement..."
                    value={adjNote}
                    onChange={(e) => setAdjNote(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingAdj || !adjNote.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-bold hover:bg-emerald-400 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isSubmittingAdj ? 'Submitting Evaluation...' : 'Record Evaluation'}
                  </button>
                </div>
              </form>

              {/* Adjudication Notes History */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300">
                  Panel Evaluations History ({client.adjudicatorNotes?.length || 0})
                </h4>
                {(!client.adjudicatorNotes || client.adjudicatorNotes.length === 0) ? (
                  <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                    No panel evaluations recorded for this speaker yet.
                  </div>
                ) : (
                  client.adjudicatorNotes.map((entry) => (
                    <div key={entry.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {entry.coachAvatar ? (
                            <img 
                              src={entry.coachAvatar} 
                              alt={entry.coachName} 
                              className="h-6 w-6 rounded-full object-cover" 
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.coachName || 'Coach')}&background=1e293b&color=cbd5e1`;
                              }}
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300">
                              {entry.coachName?.slice(0, 2).toUpperCase() || 'AD'}
                            </div>
                          )}
                          <span className="font-bold text-white text-xs">{entry.coachName}</span>
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {entry.rubricCategory}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {entry.rating !== undefined && entry.rating !== null && (
                            <span className="font-mono text-xs font-extrabold text-amber-300">
                              {entry.rating} / 10
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-8">
                        {entry.note}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab: PRs & History */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Speech Milestones & Records</h4>
                  </div>
                </div>

                {clientPRs.length === 0 ? (
                  <p className="text-slate-400">No speech milestones logged yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {clientPRs.map(pr => (
                      <div key={pr.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="font-bold text-white">{pr.exerciseName}</div>
                        <div className="text-emerald-400 font-extrabold text-sm mt-0.5">
                          {pr.weightKg} WPM / Score × {pr.reps} rounds
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span>Oratory Index: {pr.estimated1RmKg}</span>
                          <span>{pr.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
