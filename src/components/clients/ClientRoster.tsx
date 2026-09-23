import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MessageSquare, 
  TrendingUp, 
  ShieldAlert, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  Phone, 
  Mail, 
  CheckCircle2, 
  X, 
  Target,
  Link2,
  UserPlus,
  MoreVertical,
  Ban,
  RefreshCw,
  Trash2,
  UserX,
  ArrowUpDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Client, ClientStatus, SpeakingGoal, ExperienceLevel } from '../../types';
import { ClientProfileModal } from './ClientProfileModal';
import { OratorAvatar } from '../common/OratorAvatar';
import { localDateString } from '../../utils/date';
import { isHeadCoach } from '../../utils/roles';

export const ClientRoster: React.FC<{
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}> = ({ isAddModalOpen, onCloseAddModal, onOpenAddModal }) => {
  const { 
    clients, 
    addClient, 
    selectedClientId, 
    setSelectedClientId, 
    setActiveTab,
    reassignClientCoach,
    showToast,
    deleteClient,
    suspendClient,
    reactivateClient,
    coaches
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string>('All');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<'All' | 'Academy' | 'Foundation'>('All');
  const [selectedIntakeFilter, setSelectedIntakeFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [viewingClientProfile, setViewingClientProfile] = useState<Client | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    try {
      const u = localStorage.getItem('globalorators_user') || localStorage.getItem('nubianfit_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }, []);

  const unassignedCount = useMemo(() => clients.filter(c => !c.coachId).length, [clients]);

  // New Client Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAge, setFormAge] = useState(28);
  const [formGender, setFormGender] = useState('Male');
  const [formBranch, setFormBranch] = useState<'Academy' | 'Foundation'>('Academy');
  const [formMissionFocus, setFormMissionFocus] = useState('Pan-African Championship Debate & Leadership');
  const [formStatus, setFormStatus] = useState<ClientStatus>('Active');
  const [formGoal, setFormGoal] = useState<SpeakingGoal>('Competitive Debate');
  const [formExperience, setFormExperience] = useState<ExperienceLevel>('Varsity / Advanced');
  const [formWeight, setFormWeight] = useState(135);
  const [formTargetWeight, setFormTargetWeight] = useState(145);
  const [formHeight, setFormHeight] = useState(90);
  const [formBodyFat, setFormBodyFat] = useState(92);
  const [formTargetBodyFat, setFormTargetBodyFat] = useState(95);
  const [formInjuries, setFormInjuries] = useState('');
  const [formMedicalAlerts, setFormMedicalAlerts] = useState('');
  const [formGymAccess, setFormGymAccess] = useState('Parliamentary Chambers & Conference Stages');
  const [formWeeklyDays, setFormWeeklyDays] = useState(4);
  const [formDietary, setFormDietary] = useState('Debate Society & Policy Focus');

  const [isSaving, setIsSaving] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'coach' | 'lastActive' | 'fluency' | 'pace'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const handleSort = (field: 'name' | 'status' | 'coach' | 'lastActive' | 'fluency' | 'pace') => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const headCoach = useMemo(() => isHeadCoach(currentUser), [currentUser]);

  const getCoachName = useMemo(() => {
    const map = new Map(coaches.map(c => [c.id, c.name]));
    return (coachId?: string) => {
      if (!coachId) return 'Unassigned';
      return map.get(coachId) || 'Unknown Coach';
    };
  }, [coaches]);

  // Filter clients
  const filteredClients = clients.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.goal || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'All' || 
                          c.status === selectedStatusFilter ||
                          (selectedStatusFilter === 'Onboarding' && (c.status as string) === 'Pending Onboarding');
    const matchesGoal = selectedGoalFilter === 'All' || c.goal === selectedGoalFilter;
    const speakerBranch = c.branch || (c.onboardingSurvey as any)?.branch || 'Academy';
    const matchesBranch = selectedBranchFilter === 'All' || speakerBranch === selectedBranchFilter;
    const matchesIntake = 
      selectedIntakeFilter === 'all' ? true :
      selectedIntakeFilter === 'unassigned' ? !c.coachId :
      Boolean(c.coachId);
    return matchesSearch && matchesStatus && matchesGoal && matchesBranch && matchesIntake;
  }).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'name':
        return dir * (a.name || '').localeCompare(b.name || '');
      case 'status':
        return dir * (a.status || '').localeCompare(b.status || '');
      case 'coach':
        return dir * getCoachName(a.coachId).localeCompare(getCoachName(b.coachId));
      case 'lastActive':
        return dir * (a.lastActive || '').localeCompare(b.lastActive || '');
      case 'fluency':
        return dir * ((a.complianceRate || 0) - (b.complianceRate || 0));
      case 'pace':
        return dir * ((a.currentWeightKg || 0) - (b.currentWeightKg || 0));
      default:
        return 0;
    }
  });


  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    setIsSaving(true);
    try {
      const saved = await addClient({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || '+1 (555) 000-1234',
        avatar: '',
        age: Number(formAge),
        gender: formGender,
        status: formStatus,
        branch: formBranch,
        missionFocus: formMissionFocus,
        catharsisScore: formBranch === 'Foundation' ? 90 : 72,
        goal: formGoal,
        experienceLevel: formExperience,
        startDate: localDateString(),
        startingWeightKg: Number(formWeight),
        currentWeightKg: Number(formWeight),
        targetWeightKg: Number(formTargetWeight),
        heightCm: Number(formHeight),
        bodyFatPercentage: Number(formBodyFat),
        targetBodyFat: Number(formTargetBodyFat),
        injuriesAndHealth: formInjuries.trim() ? formInjuries.split(',').map(s => s.trim()) : [],
        medicalAlerts: formMedicalAlerts.trim() || undefined,
        customCoachNotes: ['Initial onboarding assessment completed.'],
        onboardingSurvey: {
          gymAccess: formGymAccess,
          weeklyAvailabilityDays: Number(formWeeklyDays),
          dietaryRestrictions: formDietary,
          sleepAvgHours: 7.5,
          stressLevel: 'Moderate',
          favoriteExercises: 'Aristotelian Triad Framing, POI Defense',
          leastFavoriteExercises: 'None reported'
        }
      });

      // Keep the form open (and the coach's input) when the server rejects it.
      if (saved) onCloseAddModal();
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Active
          </span>
        );
      case 'Needs Check-in':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
            Review Due
          </span>
        );
      case 'Onboarding':
      case 'Pending Onboarding' as any:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-sky-500/15 text-sky-300 border border-sky-500/30">
            Onboarding
          </span>
        );
      case 'Needs Review':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Needs Review
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-800 text-slate-400 border border-slate-700">
            Inactive
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-red-500/15 text-red-400 border border-red-500/30">
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-sky-500/15 text-sky-300 border border-sky-500/30">
            Onboarding
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Summary & Add Client CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" />
            Speaker & Debater Roster ({clients.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your speaking roster, debate formats, pacing targets, and coach evaluations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            id="copy-roster-referral-link-btn"
            onClick={() => {
              const coachId = currentUser?.id || 'coach-1';
              const link = `${window.location.origin}/apply?ref=${encodeURIComponent(coachId)}`;
              navigator.clipboard?.writeText(link);
              showToast('Speaker invite link copied to clipboard.');
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-mono text-xs transition-all cursor-pointer"
            title="Copy speaker invite link"
          >
            <Link2 className="h-4 w-4 text-brand-gold" />
            <span>Invite Speaker</span>
          </button>

          <button
            id="open-add-client-modal-btn"
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>+ Onboard New Speaker</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="client-roster-search-input"
            type="text"
            placeholder="Search by speaker name, email, or oratory goal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        {/* Branch Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'All', label: 'All Tracks' },
            { id: 'Academy', label: 'Academy' },
            { id: 'Foundation', label: 'Foundation' }
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBranchFilter(b.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                selectedBranchFilter === b.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Intake Triage Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'all', label: 'All' },
            { id: 'assigned', label: 'Roster' },
            { id: 'unassigned', label: `Triage (${unassignedCount})` }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedIntakeFilter(item.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                selectedIntakeFilter === item.id
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>


        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Active', 'Needs Check-in', 'Onboarding', 'Suspended', 'Inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatusFilter(status)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                selectedStatusFilter === status
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Sort Controls and View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          {/* Sort Controls */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1 pl-2 pr-0.5 text-slate-400">
              <ArrowUpDown className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-mono tracking-wider uppercase hidden sm:inline text-slate-400 font-semibold">Sort</span>
            </div>

            <select
              id="roster-sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 text-slate-200 text-xs font-mono rounded-lg px-2 py-1 border border-slate-700/80 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              aria-label="Sort speakers by"
            >
              <option value="name">Name (A-Z)</option>
              <option value="status">Status</option>
              <option value="coach">Faculty Coach</option>
              <option value="fluency">Fluency</option>
              <option value="pace">Speaking Pace</option>
              <option value="lastActive">Last Active</option>
            </select>

            <button
              id="roster-sort-dir-toggle-btn"
              onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer"
              title={`Sort Direction: ${sortDir === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortDir === 'asc' ? 'ASC ↑' : 'DESC ↓'}
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs ${viewMode === 'table' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs ${viewMode === 'grid' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Clients Display: Table View */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      <span>Speaker</span>
                      {sortBy === 'name' && (
                        <span className="text-emerald-400 text-[10px] font-mono">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      {sortBy === 'status' && (
                        <span className="text-emerald-400 text-[10px] font-mono">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Focus & Curriculum</th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('pace')}>
                    <div className="flex items-center gap-1">
                      <span>Speaking Pace</span>
                      {sortBy === 'pace' && (
                        <span className="text-emerald-400 text-[10px] font-mono">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('fluency')}>
                    <div className="flex items-center gap-1">
                      <span>Fluency</span>
                      {sortBy === 'fluency' && (
                        <span className="text-emerald-400 text-[10px] font-mono">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Focus Areas</th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('coach')}>
                    <div className="flex items-center gap-1">
                      <span>Faculty Coach</span>
                      {sortBy === 'coach' && (
                        <span className="text-emerald-400 text-[10px] font-mono">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No speakers found matching the filters.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const weightDiff = (client.currentWeightKg - client.startingWeightKg).toFixed(1);

                    return (
                      <tr 
                        key={client.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => setViewingClientProfile(client)}
                      >
                        {/* Speaker Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <OratorAvatar 
                              src={client.avatar} 
                              name={client.name} 
                              className="h-10 w-10 rounded-xl border border-slate-700 shrink-0" 
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                  {client.name}
                                </span>
                                {!client.coachId ? (
                                  <span className="text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-300 bg-amber-950/40 font-semibold">
                                    Triage
                                  </span>
                                ) : client.coachId === currentUser?.id ? (
                                  <span className="text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded border border-emerald-500/40 text-emerald-300 bg-emerald-950/40 font-semibold">
                                    My Roster
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {client.email}
                              </div>
                            </div>

                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {getStatusBadge(client.status)}
                        </td>

                        {/* Goal & Program */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">{client.goal || 'Pending Intake'}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {client.currentProgramName || 'No curriculum assigned'}
                          </div>
                        </td>

                        {/* Speaking Pace (WPM) */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{client.currentWeightKg} WPM</div>
                          <div className="text-[10px] text-slate-400">
                            {Number(weightDiff) < 0 ? (
                              <span className="text-emerald-400">{weightDiff} WPM</span>
                            ) : (
                              <span className="text-cyan-400">+{weightDiff} WPM</span>
                            )}{' '}
                            (Goal: {client.targetWeightKg} WPM)
                          </div>
                        </td>

                        {/* Compliance Bar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full" 
                                style={{ width: `${client.complianceRate}%` }}
                              />
                            </div>
                            <span className="font-bold text-emerald-400">{client.complianceRate}%</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {client.workoutsCompleted} / {client.totalWorkoutsAssigned} sessions
                          </div>
                        </td>

                        {/* Health alerts */}
                        <td className="py-3.5 px-4">
                          {(client.injuriesAndHealth?.length ?? 0) > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                              <ShieldAlert className="h-3 w-3" />
                              {client.injuriesAndHealth.length} focus area
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Clear</span>
                          )}
                        </td>

                        {/* Faculty Coach */}
                        <td className="py-3.5 px-4 font-mono text-xs">
                          {client.coachId ? (
                            <span className="text-slate-300 font-medium">
                              {getCoachName(client.coachId)}
                            </span>
                          ) : (
                            <span className="text-amber-400/90 italic text-[11px]">
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {!client.coachId && currentUser?.id && (
                              <button
                                onClick={async () => {
                                  const ok = await reassignClientCoach(client.id, currentUser.id, 'Claimed by coach from intake pool');
                                  if (ok) {
                                    showToast(`Claimed ${client.name} to your roster.`);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                                title={`Claim ${client.name} to your coaching roster`}
                              >
                                <UserPlus className="h-3.5 w-3.5 stroke-[2.5]" />
                                <span>Claim</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedClientId(client.id);
                                setActiveTab('messenger');
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                              title="Chat with speaker"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedClientId(client.id);
                                setActiveTab('progress');
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                              title="View Analytics & Milestones"
                            >
                              <TrendingUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setViewingClientProfile(client)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                            >
                              Profile
                            </button>

                            {/* Management dropdown */}
                            <div className="relative">
                              <button
                                onClick={() => setActionMenuOpenId(actionMenuOpenId === client.id ? null : client.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Manage speaker"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {actionMenuOpenId === client.id && (
                                <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/40 py-1 text-left">
                                  {client.status === 'Suspended' ? (
                                    <button
                                      onClick={async () => { setActionMenuOpenId(null); await reactivateClient(client.id); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-400 hover:bg-slate-800 transition-colors"
                                    >
                                      <RefreshCw className="h-3.5 w-3.5" /> Reactivate Speaker
                                    </button>
                                  ) : (
                                    <button
                                      onClick={async () => { setActionMenuOpenId(null); await suspendClient(client.id); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-slate-800 transition-colors"
                                    >
                                      <Ban className="h-3.5 w-3.5" /> Suspend Speaker
                                    </button>
                                  )}
                                  {client.coachId && (
                                    <button
                                      onClick={async () => { setActionMenuOpenId(null); await reassignClientCoach(client.id, '', 'Released to intake pool'); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-sky-400 hover:bg-slate-800 transition-colors"
                                    >
                                      <UserX className="h-3.5 w-3.5" /> Release to Pool
                                    </button>
                                  )}
                                  <div className="border-t border-slate-800 my-1" />
                                  {confirmDeleteId === client.id ? (
                                    <div className="px-3 py-2 space-y-2">
                                      <p className="text-[11px] text-red-400 font-bold">Permanently remove this speaker?</p>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={async () => { setConfirmDeleteId(null); setActionMenuOpenId(null); await deleteClient(client.id); }}
                                          className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-colors"
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          onClick={() => setConfirmDeleteId(null)}
                                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setConfirmDeleteId(client.id)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-slate-800 transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" /> Delete Speaker
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const isUnassigned = !client.coachId;
            const isMySpeaker = client.coachId === currentUser?.id;
            const branch = client.branch || (client.onboardingSurvey as any)?.branch || 'Academy';

            return (
              <div
                key={client.id}
                onClick={() => setViewingClientProfile(client)}
                className={`p-5 rounded-2xl transition-all cursor-pointer group shadow-sm flex flex-col justify-between border ${
                  isUnassigned
                    ? 'bg-slate-900/95 border-amber-500/30 hover:border-amber-500/60 shadow-amber-950/10'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Architectural Divider Row: Track & Status Badges */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md ${
                        branch === 'Foundation'
                          ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {branch} Track
                      </span>

                      {isUnassigned ? (
                        <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-md border border-amber-500/40 text-amber-300 bg-amber-950/40 font-semibold">
                          Triage
                        </span>
                      ) : isMySpeaker ? (
                        <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-md border border-emerald-500/40 text-emerald-300 bg-emerald-950/40 font-semibold">
                          My Roster
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-md border border-slate-700 text-slate-300 bg-slate-800/80 font-semibold" title={`Assigned Coach: ${getCoachName(client.coachId)}`}>
                          Coach: {getCoachName(client.coachId)}
                        </span>
                      )}
                    </div>

                    <div>
                      {getStatusBadge(client.status)}
                    </div>
                  </div>

                  {/* Speaker Info Row: Avatar + Name + Email */}
                  <div className="flex items-center gap-3">
                    <OratorAvatar 
                      src={client.avatar} 
                      name={client.name} 
                      className="h-12 w-12 rounded-xl border border-slate-700 shrink-0 text-sm" 
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white text-base leading-tight group-hover:text-emerald-400 transition-colors truncate">
                        {client.name}
                      </h3>
                      <div className="text-xs text-slate-400 truncate mt-0.5" title={client.email}>
                        {client.email}
                      </div>
                    </div>
                  </div>

                  {/* Intake Pool Callout Banner when unassigned */}
                  {isUnassigned && (
                    <div className="mt-3.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        Awaiting Coach Allocation
                      </span>
                      <span className="text-[10px] font-mono text-amber-400/90 font-medium">
                        Open Pool
                      </span>
                    </div>
                  )}

                  {/* Metrics Grid: Focus & Fluency */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider block">Focus</span>
                      <div 
                        className={`font-semibold truncate mt-0.5 ${client.goal ? 'text-emerald-400' : 'text-slate-500 italic'}`}
                        title={client.goal || 'Pending Intake Assessment'}
                      >
                        {client.goal || 'Pending Intake'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider block">Fluency</span>
                      <div className="font-bold text-white truncate mt-0.5">{client.complianceRate}%</div>
                    </div>
                  </div>

                  {/* Curriculum row */}
                  <div className="mt-3 text-xs text-slate-300 flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-mono text-[11px] shrink-0">Curriculum:</span>
                    <span 
                      className="font-medium text-slate-200 truncate max-w-[200px]" 
                      title={client.currentProgramName || 'Not assigned'}
                    >
                      {client.currentProgramName || 'Not assigned'}
                    </span>
                  </div>

                  {/* Faculty Coach row */}
                  {!isUnassigned && (
                    <div className="mt-2 text-xs text-slate-300 flex items-center justify-between gap-2">
                      <span className="text-slate-400 font-mono text-[11px] shrink-0">Faculty Coach:</span>
                      <span 
                        className={`font-mono text-xs font-semibold truncate max-w-[200px] ${isMySpeaker ? 'text-emerald-400' : 'text-slate-300'}`}
                        title={getCoachName(client.coachId)}
                      >
                        {getCoachName(client.coachId)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400 truncate">
                    Active: {client.lastActive}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    {isUnassigned && currentUser?.id ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingClientProfile(client);
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer"
                        >
                          Profile
                        </button>
                        <button
                          id={`claim-speaker-${client.id}`}
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const ok = await reassignClientCoach(client.id, currentUser.id, 'Claimed by coach from intake pool');
                            if (ok) {
                              showToast(`Claimed ${client.name} to your roster.`);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 transition-all cursor-pointer"
                          title={`Claim ${client.name} to your personal coaching roster`}
                        >
                          <UserPlus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Claim Speaker</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        View Profile <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    )}

                    {/* Management menu (grid) */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActionMenuOpenId(actionMenuOpenId === client.id ? null : client.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Manage speaker"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {actionMenuOpenId === client.id && (
                        <div className="absolute right-0 bottom-full mb-1 z-50 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/40 py-1 text-left">
                          {client.status === 'Suspended' ? (
                            <button
                              onClick={async () => { setActionMenuOpenId(null); await reactivateClient(client.id); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-400 hover:bg-slate-800 transition-colors"
                            >
                              <RefreshCw className="h-3.5 w-3.5" /> Reactivate Speaker
                            </button>
                          ) : (
                            <button
                              onClick={async () => { setActionMenuOpenId(null); await suspendClient(client.id); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-slate-800 transition-colors"
                            >
                              <Ban className="h-3.5 w-3.5" /> Suspend Speaker
                            </button>
                          )}
                          {client.coachId && (
                            <button
                              onClick={async () => { setActionMenuOpenId(null); await reassignClientCoach(client.id, '', 'Released to intake pool'); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-sky-400 hover:bg-slate-800 transition-colors"
                            >
                              <UserX className="h-3.5 w-3.5" /> Release to Pool
                            </button>
                          )}
                          <div className="border-t border-slate-800 my-1" />
                          {confirmDeleteId === client.id ? (
                            <div className="px-3 py-2 space-y-2">
                              <p className="text-[11px] text-red-400 font-bold">Permanently remove?</p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={async () => { setConfirmDeleteId(null); setActionMenuOpenId(null); await deleteClient(client.id); }}
                                  className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(client.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-slate-800 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete Speaker
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client Profile Modal Drawer */}
      {viewingClientProfile && (
        <ClientProfileModal
          client={viewingClientProfile}
          isOpen={true}
          onClose={() => setViewingClientProfile(null)}
        />
      )}

      {/* Onboard New Client Modal Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  Onboard New Speaker
                </h3>
                <p className="text-xs text-slate-400">Enter speaker demographics, debate focus, pacing targets, and coach notes.</p>
              </div>
              <button onClick={onCloseAddModal} className="text-slate-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. speaker@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Age</label>
                  <input
                    type="number"
                    value={formAge}
                    onChange={(e) => setFormAge(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Oratorical Goal</label>
                  <select
                    value={formGoal}
                    onChange={(e) => setFormGoal(e.target.value as SpeakingGoal)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Competitive Debate">Competitive Debate (Parliamentary / Policy)</option>
                    <option value="Keynote & Conference">Keynote & Conference (TEDx & Mainstage)</option>
                    <option value="Executive & Board Pitching">Executive & Board Pitching (Venture & C-Suite)</option>
                    <option value="Impromptu & Extemporaneous">Impromptu & Extemporaneous (Rapid Framing)</option>
                    <option value="Model UN & Parliamentary">Model UN & Parliamentary (Diplomatic Caucus)</option>
                    <option value="Stage Presence & Vocal Mastery">Stage Presence & Vocal Mastery (Resonance)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Experience Level</label>
                  <select
                    value={formExperience}
                    onChange={(e) => setFormExperience(e.target.value as ExperienceLevel)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Novice Speaker">Novice Speaker (&lt;1 year)</option>
                    <option value="Club Debater">Club Debater (1-3 years)</option>
                    <option value="Varsity / Advanced">Varsity / Advanced (3-6 years)</option>
                    <option value="Master Orator">Master Orator (6+ years)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Current Pace (WPM)</label>
                  <input
                    type="number"
                    step="1"
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Target Pace (WPM)</label>
                  <input
                    type="number"
                    step="1"
                    value={formTargetWeight}
                    onChange={(e) => setFormTargetWeight(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Target Speech Duration (Min)</label>
                  <input
                    type="number"
                    value={formHeight}
                    onChange={(e) => setFormHeight(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Fluency & Clarity %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formBodyFat}
                    onChange={(e) => setFormBodyFat(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Speech Challenges & Delivery Focus (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vocal fatigue on long speeches, rapid pacing acceleration under cross-fire"
                  value={formInjuries}
                  onChange={(e) => setFormInjuries(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Coach Vocal Health & Delivery Alert
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diaphragmatic breathing intervals; ensure hydration at podium"
                  value={formMedicalAlerts}
                  onChange={(e) => setFormMedicalAlerts(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseAddModal}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Registering speaker...</span>
                    </>
                  ) : (
                    <span>Save Speaker Profile</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
