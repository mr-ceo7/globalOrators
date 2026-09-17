import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ScrollText, 
  BookOpen, 
  CalendarDays, 
  TrendingUp, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  Mic,
  Globe,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';
import { GlobalOratorsLogo } from '../common/GlobalOratorsLogo';


export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, clients, coaches, messages, scheduledWorkouts, setSelectedClientId, logout, showToast, setCurrentPortal } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCoachSignOut = () => {
    logout();
    showToast('Signed out of Coach App.');
  };

  // Unread messages count
  const unreadCount = messages.filter(m => m.sender === 'client' && !m.isRead).length;

  // Today's pending sessions count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPendingCount = scheduledWorkouts.filter(w => w.date === todayStr && w.status === 'Scheduled').length;

  const currentUser = (() => {
    try {
      const stored = localStorage.getItem('globalorators_user') || localStorage.getItem('nubianfit_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const isHeadCoach = currentUser?.id === 'coach-1' || currentUser?.email?.toLowerCase() === 'kassimmusa322@gmail.com' || currentUser?.email?.toLowerCase() === 'coach@globalorators.com';

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Speakers & Debaters', icon: Users, badge: clients.filter(c => c.status === 'Active').length },
    ...(isHeadCoach ? [{ id: 'coaches' as NavigationTab, label: 'Faculty Coaches', icon: ShieldCheck, badge: coaches.length }] : []),
    { id: 'programs', label: 'Curriculum Builder', icon: ScrollText },
    { id: 'exercises', label: 'Drill & Speech Library', icon: BookOpen },
    { id: 'calendar', label: 'Session Schedule', icon: CalendarDays, badge: todayPendingCount > 0 ? todayPendingCount : undefined, badgeColor: 'bg-emerald-500' },
    { id: 'progress', label: 'Speech Analytics', icon: TrendingUp },
    { id: 'messenger', label: '1-on-1 Messenger', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined, badgeColor: 'bg-cyan-500' }
  ];

  return (
    <aside 
      id="sidebar-navigation"
      className={`relative hidden md:flex flex-col border-r border-slate-800 bg-slate-950 text-slate-200 transition-all duration-300 z-30 shrink-0 ${

        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          {isCollapsed ? (
            <GlobalOratorsLogo className="w-9 h-9 shrink-0" colorMode="gold" />
          ) : (
            <div className="flex items-center gap-2.5">
              <GlobalOratorsLogo className="w-8 h-8 shrink-0" colorMode="gold" />
              <div className="flex flex-col items-stretch">
                <span className="font-serif font-black text-[16px] tracking-tight text-slate-100 block leading-none">
                  Global<span className="text-[#C89630]">Orators</span>
                </span>
                <div className="flex justify-between text-[8px] text-slate-400 font-mono tracking-widest uppercase mt-1 w-full leading-none">
                  <span>speak</span>
                  <span>with</span>
                  <span>impact</span>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-[#C89630]/10 text-[#C89630] border border-[#C89630]/30 leading-none self-start mt-0.5">
                Coach
              </span>
            </div>
          )}
        </div>


        {/* Collapse Button */}
        <button 
          id="sidebar-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•' : 'Main Menu'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/50' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`flex items-center justify-center ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                <Icon className="h-5 w-5 shrink-0" />
              </div>

              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!isCollapsed && item.badge !== undefined && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  item.badgeColor || 'bg-slate-800 text-slate-300'
                } text-white shadow-xs`}>
                  {item.badge}
                </span>
              )}

              {/* Collapsed Badge indicator */}
              {isCollapsed && item.badge !== undefined && (
                <span className={`absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full ${
                  item.badgeColor || 'bg-emerald-500'
                } ring-2 ring-slate-950`} />
              )}

            </button>
          );
        })}

        {/* Quick Speaker Jump List */}
        {!isCollapsed && (
          <div className="pt-6 pb-2">
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Top Speakers
              </span>
              <button 
                onClick={() => setActiveTab('clients')}
                className="text-[11px] text-emerald-400 hover:underline font-medium"
              >
                View all
              </button>
            </div>
            <div className="space-y-1">
              {clients.slice(0, 3).map(client => (
                <div 
                  key={client.id}
                  onClick={() => {
                    setSelectedClientId(client.id);
                    setActiveTab('clients');
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-slate-800/60 cursor-pointer text-slate-300 hover:text-white transition-colors"
                >
                  <img 
                    src={client.avatar} 
                    alt={client.name} 
                    className="h-6 w-6 rounded-full object-cover border border-slate-700" 
                  />
                  <span className="truncate flex-1 font-medium">{client.name}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{client.complianceRate}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Coach Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-3">
          {(() => {
            const user = currentUser;
            const coachName = user?.full_name || (isHeadCoach ? 'Head Coach Qassim' : 'Faculty Coach');
            const coachTitle = isHeadCoach ? 'Head Speech & Debate Coach' : 'Faculty Coach';
            const initials = coachName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || (isHeadCoach ? 'HQ' : 'FC');

            return (
              <>
                <div className="relative">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={coachName}
                      className="h-10 w-10 rounded-xl object-cover border-2 border-emerald-500/40"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-xs">
                      {initials}
                    </div>
                  )}
                </div>
                
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-white truncate">{coachName}</span>
                    <span className="text-[11px] text-slate-400 truncate">{coachTitle}</span>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {!isCollapsed ? (
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
            <button
              onClick={() => setCurrentPortal('speaker_app')}
              className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              title="Open Orators App (app.globaloratorsproject.com)"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>Orators</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setCurrentPortal('landing')}
              className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              title="Return to Public Site (globaloratorsproject.com)"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Site</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={handleCoachSignOut}
              className="text-slate-400 hover:text-red-400 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              title="Sign Out of Coach App"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
              <span>Exit</span>
            </button>
          </div>
        ) : (
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex flex-col items-center gap-2">
            <button
              onClick={() => setCurrentPortal('speaker_app')}
              className="text-slate-400 hover:text-emerald-400 p-1 transition-colors cursor-pointer"
              title="Open Orators App (app.globaloratorsproject.com)"
            >
              <Mic className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => setCurrentPortal('landing')}
              className="text-slate-400 hover:text-emerald-400 p-1 transition-colors cursor-pointer"
              title="Return to Public Site (globaloratorsproject.com)"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={handleCoachSignOut}
              className="text-slate-400 hover:text-red-400 p-1 transition-colors cursor-pointer"
              title="Sign Out of Coach App"
            >
              <LogOut className="w-4 h-4 text-slate-500 hover:text-red-400" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
