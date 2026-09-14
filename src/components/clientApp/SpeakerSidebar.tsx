import React from 'react';
import {
  LayoutDashboard,
  Mic,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Globe,
  RefreshCw,
  LogOut,
  Video
} from 'lucide-react';
import { GlobalOratorsLogo } from '../common/GlobalOratorsLogo';
import { SpeakerTabType } from './ClientPortal';
import { SpeakerOnboardingData } from '../../types';

interface SpeakerSidebarProps {
  speakerTab: SpeakerTabType;
  setSpeakerTab: (tab: SpeakerTabType) => void;
  profile: SpeakerOnboardingData;
  isExecutive: boolean;
  isAcademy: boolean;
  roadmapSessionsCount?: number;
  habitsRemainingCount?: number;
  unreadMessagesCount?: number;
  onResetOnboarding: () => void;
  onSignOut: () => void;
  onOpenLiveChamber: () => void;
  onReturnToPublicSite: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const SpeakerSidebar: React.FC<SpeakerSidebarProps> = ({
  speakerTab,
  setSpeakerTab,
  profile,
  isExecutive,
  isAcademy,
  roadmapSessionsCount = 0,
  habitsRemainingCount = 0,
  unreadMessagesCount = 0,
  onResetOnboarding,
  onSignOut,
  onOpenLiveChamber,
  onReturnToPublicSite,
  isCollapsed,
  setIsCollapsed
}) => {
  const navItems = [
    {
      id: 'today' as SpeakerTabType,
      label: "Today's Rehearsal",
      icon: LayoutDashboard,
    },
    {
      id: 'practice' as SpeakerTabType,
      label: 'Daily Drill Studio',
      icon: Mic,
    },
    {
      id: 'catharsis' as SpeakerTabType,
      label: isExecutive ? 'Executive Speech Vault' : 'Catharsis & Voice Vault',
      icon: ShieldCheck,
    },
    {
      id: 'schedule' as SpeakerTabType,
      label: isExecutive ? 'Executive Syllabus & Roadmap' : 'Syllabus & Roadmap',
      icon: CalendarDays,
      badge: roadmapSessionsCount > 0 ? roadmapSessionsCount : undefined,
      badgeColor: 'bg-[#C89630] text-slate-950'
    },
    {
      id: 'habits' as SpeakerTabType,
      label: 'Daily Orator Rituals',
      icon: CheckCircle2,
      badge: habitsRemainingCount > 0 ? habitsRemainingCount : undefined,
      badgeColor: 'bg-emerald-500 text-slate-950'
    },
    {
      id: 'progress' as SpeakerTabType,
      label: 'Speech Analytics',
      icon: TrendingUp,
    },
    {
      id: 'coach' as SpeakerTabType,
      label: 'Coach Qassim (2-Way)',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      badgeColor: 'bg-[#C89630] text-slate-950'
    }
  ];

  const trackBadgeLabel = isExecutive
    ? 'Executive'
    : isAcademy
      ? 'Academy'
      : 'Foundation';

  const avatarInitial = (profile.fullName || 'Speaker').charAt(0).toUpperCase();

  return (
    <aside
      id="speaker-sidebar-navigation"
      aria-label="Orators App Navigation"
      className={`relative hidden md:flex flex-col border-r border-slate-800 bg-slate-950 text-slate-200 transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-800/80">
        <div
          className="flex items-center gap-3 overflow-hidden cursor-pointer"
          onClick={() => setSpeakerTab('today')}
        >
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
                {trackBadgeLabel}
              </span>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          id="speaker-sidebar-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Live Rehearsal Chamber Quick Action Button */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={onOpenLiveChamber}
          className={`w-full min-h-[40px] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
            isExecutive
              ? 'bg-[#C89630] hover:bg-[#d6a543] text-slate-950 shadow-[#C89630]/20'
              : isAcademy
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
          }`}
          title="Enter Live Rehearsal Chamber"
        >
          <Video className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Live Chamber</span>}
        </button>
      </div>

      {/* Navigation Links List */}
      <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto" role="tablist" aria-label="Speaker Navigation">
        <div className={`px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•' : 'Navigation'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = speakerTab === item.id;

          return (
            <button
              key={item.id}
              id={`speaker-nav-${item.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              onClick={() => setSpeakerTab(item.id)}
              className={`w-full min-h-[42px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all duration-150 group relative cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border border-[#C89630]/50 shadow-sm shadow-slate-950'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`flex items-center justify-center shrink-0 ${
                isActive ? 'text-[#C89630]' : 'text-slate-400 group-hover:text-slate-200'
              }`}>
                <Icon className="h-4.5 w-4.5" />
              </div>

              {!isCollapsed && (
                <span className="truncate flex-1 text-left font-sans text-xs">{item.label}</span>
              )}

              {!isCollapsed && item.badge !== undefined && (
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                  item.badgeColor || 'bg-slate-800 text-slate-300'
                } shadow-xs`}>
                  {item.badge}
                </span>
              )}

              {/* Collapsed Badge indicator dot */}
              {isCollapsed && item.badge !== undefined && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#C89630] ring-2 ring-slate-950" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile & Workspace Controls */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs text-slate-950 shrink-0 ${
            isExecutive ? 'bg-[#C89630]' : isAcademy ? 'bg-[#C89630]' : 'bg-teal-400'
          }`}>
            {avatarInitial}
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate">
                {profile.fullName || 'Speaker'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate">
                {isExecutive ? 'Executive Orator' : isAcademy ? 'Academy Debater' : 'Foundation Orator'}
              </span>
            </div>
          )}
        </div>

        {!isCollapsed ? (
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <button
              onClick={onResetOnboarding}
              className="hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              title="Recalibrate curriculum preferences"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Recalibrate</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={onReturnToPublicSite}
              className="hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              title="Return to Public Site"
            >
              <Globe className="w-3 h-3" />
              <span>Public Site</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={onSignOut}
              className="hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
              <span>Exit</span>
            </button>
          </div>
        ) : (
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex flex-col items-center gap-2">
            <button
              onClick={onReturnToPublicSite}
              className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
              title="Return to Public Site"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onSignOut}
              className="text-slate-400 hover:text-rose-400 p-1 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
