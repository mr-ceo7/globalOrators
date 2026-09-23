import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRightLeft,
  Search,
  UserCheck,
  Copy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sanitizeText } from '../../utils/sanitization';
import { getStoredUser, isHeadCoach } from '../../utils/roles';

export const CoachManager: React.FC = () => {
  const { 
    coaches, 
    clients, 
    addCoach, 
    reassignClientCoach, 
    showToast 
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const headCoach = isHeadCoach(getStoredUser());

  // Add Coach Modal State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reassignment Modal State
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null);
  const [targetCoachId, setTargetCoachId] = useState<string>('');
  const [isReassigning, setIsReassigning] = useState(false);

  // Stats
  const totalCoaches = coaches.length;
  const assignedSpeakers = clients.filter(c => Boolean(c.coachId)).length;
  const unassignedSpeakers = clients.filter(c => !c.coachId);

  const filteredCoaches = coaches.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeText(formName, 100).trim();
    const cleanEmail = sanitizeText(formEmail, 120).toLowerCase().trim();
    const cleanPassword = formPassword.trim();

    if (!cleanName) {
      setErrorMessage('Coach full name is required.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Valid email address is required.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await addCoach({
        fullName: cleanName,
        email: cleanEmail,
        password: cleanPassword
      });

      if (res.success) {
        setIsAddModalOpen(false);
        setFormName('');
        setFormEmail('');
        setFormPassword('');
      } else {
        setErrorMessage(res.error || 'Failed to add coach account.');
      }
    } catch {
      setErrorMessage('Unable to connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignSpeaker = async (speakerId: string, coachId: string) => {
    if (!speakerId || !coachId) return;
    setIsReassigning(true);
    try {
      const ok = await reassignClientCoach(speakerId, coachId, 'Assigned by Master Coach');
      if (ok) {
        setSelectedSpeakerId(null);
        setTargetCoachId('');
        showToast('Speaker successfully allocated.');
      } else {
        showToast('Failed to allocate speaker.');
      }
    } catch {
      showToast('Error connecting to allocation service.');
    } finally {
      setIsReassigning(false);
    }
  };

  if (!headCoach) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center max-w-xl mx-auto my-12">
          <ShieldCheck className="w-12 h-12 text-brand-gold mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-white mb-2">Master Coach Administration Restricted</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Faculty Coach provisioning and global speaker allocation are reserved for the Head Coach & Faculty Director. You can manage your assigned debaters directly from your roster.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-[10px] font-mono tracking-widest uppercase text-brand-gold mb-1">
            Master Coach Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Faculty Coaches & Speaker Allocation
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Manage active faculty coaches and assign enrolled speakers to their rosters.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-on-gold font-serif font-bold text-xs shadow-md shadow-[#C89630]/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Faculty Coach</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Active Coaches</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-white">{totalCoaches}</span>
            <span className="text-xs text-slate-500 font-mono">faculty</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Assigned Speakers</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400">{assignedSpeakers}</span>
            <span className="text-xs text-slate-500 font-mono">allocated</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Unassigned Intake</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">{unassignedSpeakers.length}</span>
            <span className="text-xs text-slate-500 font-mono">awaiting allocation</span>
          </div>
        </div>
      </div>

      {/* Unassigned Intake Pool (Actionable) */}
      {unassignedSpeakers.length > 0 && (
        <div className="p-4 sm:p-5 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <h2 className="text-xs sm:text-sm font-serif font-bold text-amber-300">
                Unassigned Speakers ({unassignedSpeakers.length})
              </h2>
            </div>
            <span className="text-[10px] font-mono uppercase text-amber-400/80">Pending Coach Assignment</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {unassignedSpeakers.map(spk => (
              <div 
                key={spk.id}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-semibold text-xs text-white">{spk.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{spk.email} · {spk.goal || 'Pending Intake'}</div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    id={`assign-select-${spk.id}`}
                    aria-label={`Assign coach to speaker ${spk.name}`}
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAssignSpeaker(spk.id, e.target.value);
                      }
                    }}
                    className="py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-[#C89630]"
                  >
                    <option value="" disabled>Assign to coach...</option>
                    {coaches.map(c => (
                      <option key={c.id} value={c.id}>Coach {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coaches Directory & Assigned Speakers */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-gold" />
            <h2 className="text-sm sm:text-base font-serif font-bold text-white">Faculty Directory</h2>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search faculty..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630]"
            />
          </div>
        </div>

        {filteredCoaches.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-slate-900 border border-slate-800">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No faculty coaches found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {searchTerm 
                ? `No faculty coaches match "${searchTerm}". Clear your search query to see all coaches.` 
                : 'No coaches are currently registered in the faculty directory.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 px-3 py-1 rounded-lg bg-slate-800 text-xs font-mono text-brand-gold border border-slate-700 hover:bg-slate-700 cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoaches.map(coach => {
            const coachSpeakers = clients.filter(c => c.coachId === coach.id);

            return (
              <div 
                key={coach.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C89630]/20 border border-[#C89630]/40 text-brand-gold flex items-center justify-center font-serif font-bold text-sm">
                        {coach.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-sm text-white">{coach.name}</h3>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{coach.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px] uppercase">Roster Allocation</span>
                    <span className="font-semibold text-white font-mono">{coachSpeakers.length} Speakers</span>
                  </div>

                  {/* Assigned Speakers Quick List */}
                  {coachSpeakers.length > 0 ? (
                    <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {coachSpeakers.map(spk => (
                        <div 
                          key={spk.id}
                          className="flex items-center justify-between text-[11px] py-1 px-2 rounded bg-slate-950/70 border border-slate-800/60"
                        >
                          <span className="text-slate-300 truncate max-w-[140px]">{spk.name}</span>
                          <button
                            onClick={() => {
                              setSelectedSpeakerId(spk.id);
                              setTargetCoachId(coach.id);
                            }}
                            className="text-brand-gold hover:text-[#E3B95C] text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                            title="Reassign to another coach"
                          >
                            <ArrowRightLeft className="w-2.5 h-2.5" />
                            <span>Reassign</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 py-3 text-center rounded bg-slate-950/40 border border-dashed border-slate-800 text-[11px] text-slate-500 font-mono">
                      No speakers currently allocated
                    </div>
                  )}
                </div>

                <div className="pt-2 text-[10px] font-mono text-slate-500 border-t border-slate-800/60 flex items-center justify-between">
                  <span>ID: {coach.id}</span>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/apply?ref=${encodeURIComponent(coach.id)}`;
                      navigator.clipboard?.writeText(link);
                      showToast(`Referral link for ${coach.name} copied.`);
                    }}
                    className="text-brand-gold hover:text-[#E3B95C] text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                    title={`Copy referral link for ${coach.name}`}
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Referral Link</span>
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Add Faculty Coach Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-gold" />
                <h3 className="font-serif font-bold text-base text-white">Add Faculty Coach</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoach} className="space-y-3.5">
              <div>
                <label 
                  htmlFor="add-coach-name-input"
                  className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1"
                >
                  Full Name & Title
                </label>
                <input
                  id="add-coach-name-input"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Coach Kofi Mensah"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630]"
                />
              </div>

              <div>
                <label 
                  htmlFor="add-coach-email-input"
                  className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1"
                >
                  Faculty Email Address
                </label>
                <input
                  id="add-coach-email-input"
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="kofi.mensah@globalorators.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630]"
                />
              </div>

              <div>
                <label 
                  htmlFor="add-coach-password-input"
                  className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1"
                >
                  Initial Password
                </label>
                <input
                  id="add-coach-password-input"
                  type="password"
                  required
                  minLength={8}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#C89630]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#C89630] hover:bg-[#B37D22] text-on-gold font-serif font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Adding Coach...</span>
                    </>
                  ) : (
                    <>
                      <span>Provision Coach</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Speaker Reassignment Modal */}
      {selectedSpeakerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif font-bold text-sm text-white">Reassign Speaker</h3>
              <button 
                onClick={() => setSelectedSpeakerId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select the new faculty coach for{' '}
              <strong className="text-white">
                {clients.find(c => c.id === selectedSpeakerId)?.name}
              </strong>:
            </p>

            <select
              id="reassign-target-coach-select"
              aria-label="Target faculty coach for reassignment"
              value={targetCoachId}
              onChange={(e) => setTargetCoachId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-[#C89630]"
            >
              {coaches.map(c => (
                <option key={c.id} value={c.id}>Coach {c.name} ({c.email})</option>
              ))}
            </select>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSpeakerId(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isReassigning}
                onClick={() => handleAssignSpeaker(selectedSpeakerId, targetCoachId)}
                className="px-4 py-1.5 rounded-lg bg-[#C89630] hover:bg-[#B37D22] text-on-gold font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isReassigning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Reassigning...</span>
                  </>
                ) : (
                  <span>Confirm Assignment</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
