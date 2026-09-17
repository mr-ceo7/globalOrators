import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Mic, 
  Video, 
  CheckCircle2, 
  MessageSquare, 
  TrendingUp, 
  Briefcase, 
  Heart, 
  Calendar, 
  Plus, 
  X,
  Play
} from 'lucide-react';
import { SpeakerTabType } from './ClientPortal';

interface SpeakerMobileBottomNavProps {
  speakerTab: SpeakerTabType;
  setSpeakerTab: (tab: SpeakerTabType) => void;
  onOpenLiveRehearsal: () => void;
  isExecutive: boolean;
  isAcademy: boolean;
  unreadCount?: number;
}

export const SpeakerMobileBottomNav: React.FC<SpeakerMobileBottomNavProps> = ({
  speakerTab,
  setSpeakerTab,
  onOpenLiveRehearsal,
  isExecutive,
  isAcademy,
  unreadCount = 0,
}) => {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Fallback for non-supporting devices
      }
    }
  };

  const handleTabClick = (tab: SpeakerTabType) => {
    triggerHaptic();
    setSpeakerTab(tab);
  };

  const handleOpenActionSheet = () => {
    triggerHaptic();
    setIsActionSheetOpen(true);
  };

  const handleQuickLaunchLive = () => {
    setIsActionSheetOpen(false);
    triggerHaptic();
    onOpenLiveRehearsal();
  };

  return (
    <>
      {/* Speaker Mobile Bottom Navigation Bar (Hidden on desktop md+) */}
      <nav 
        id="speaker-mobile-bottom-nav"
        aria-label="Speaker Navigation"
        className="md:hidden fixed bottom-1.5 left-1.5 right-1.5 z-40 bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl transition-transform duration-200"
      >
        <div className="flex items-center justify-around px-2 py-1.5 h-16 max-w-lg mx-auto">
          {/* 1. Today */}
          <button
            id="speaker-mobile-nav-today"
            role="tab"
            aria-selected={speakerTab === 'today'}
            onClick={() => handleTabClick('today')}
            className="flex-1 flex flex-col items-center justify-center py-1 relative touch-manipulation active:scale-95 transition-transform"
          >
            <div className={`relative p-1 rounded-xl transition-colors ${
              speakerTab === 'today'
                ? isExecutive ? 'text-[#C89630]' : isAcademy ? 'text-emerald-400' : 'text-teal-400'
                : 'text-slate-400'
            }`}>
              <Compass className="w-5 h-5" />
              {speakerTab === 'today' && (
                <motion.div 
                  layoutId="speakerMobileNavIndicator"
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${
                    isExecutive ? 'bg-[#C89630]' : isAcademy ? 'bg-emerald-400' : 'bg-teal-400'
                  }`}
                />
              )}
            </div>
            <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${
              speakerTab === 'today'
                ? isExecutive ? 'text-[#C89630] font-bold' : isAcademy ? 'text-emerald-400 font-bold' : 'text-teal-400 font-bold'
                : 'text-slate-400'
            }`}>
              Today
            </span>
          </button>

          {/* 2. Practice Drills */}
          <button
            id="speaker-mobile-nav-practice"
            role="tab"
            aria-selected={speakerTab === 'practice'}
            onClick={() => handleTabClick('practice')}
            className="flex-1 flex flex-col items-center justify-center py-1 relative touch-manipulation active:scale-95 transition-transform"
          >
            <div className={`relative p-1 rounded-xl transition-colors ${
              speakerTab === 'practice'
                ? isExecutive ? 'text-[#C89630]' : isAcademy ? 'text-emerald-400' : 'text-teal-400'
                : 'text-slate-400'
            }`}>
              <Mic className="w-5 h-5" />
              {speakerTab === 'practice' && (
                <motion.div 
                  layoutId="speakerMobileNavIndicator"
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${
                    isExecutive ? 'bg-[#C89630]' : isAcademy ? 'bg-emerald-400' : 'bg-teal-400'
                  }`}
                />
              )}
            </div>
            <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${
              speakerTab === 'practice'
                ? isExecutive ? 'text-[#C89630] font-bold' : isAcademy ? 'text-emerald-400 font-bold' : 'text-teal-400 font-bold'
                : 'text-slate-400'
            }`}>
              Drills
            </span>
          </button>

          {/* 3. Center Elevated FAB Action */}
          <div className="flex-1 flex items-center justify-center -mt-5">
            <button
              id="speaker-mobile-quick-action-trigger"
              aria-label="Speaker quick actions and live rehearsal"
              aria-expanded={isActionSheetOpen}
              onClick={isActionSheetOpen ? () => setIsActionSheetOpen(false) : handleOpenActionSheet}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md border-2 border-slate-950 active:scale-90 transition-all duration-300 focus:outline-hidden ${
                isActionSheetOpen
                  ? 'bg-slate-700 text-white rotate-45'
                  : isExecutive
                    ? 'bg-[#C89630] hover:bg-[#d6a543] text-slate-950 rotate-0 shadow-[#C89630]/30'
                    : isAcademy
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 rotate-0 shadow-emerald-500/30'
                      : 'bg-teal-500 hover:bg-teal-400 text-slate-950 rotate-0 shadow-teal-500/30'
              }`}
              title="Live Rehearsal Chamber & Shortcuts"
            >
              {isActionSheetOpen ? (
                <Plus className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <Video className="w-5 h-5 fill-current stroke-[2]" />
              )}
            </button>
          </div>

          {/* 4. Rituals */}
          <button
            id="speaker-mobile-nav-habits"
            role="tab"
            aria-selected={speakerTab === 'habits'}
            onClick={() => handleTabClick('habits')}
            className="flex-1 flex flex-col items-center justify-center py-1 relative touch-manipulation active:scale-95 transition-transform"
          >
            <div className={`relative p-1 rounded-xl transition-colors ${
              speakerTab === 'habits'
                ? isExecutive ? 'text-[#C89630]' : isAcademy ? 'text-emerald-400' : 'text-teal-400'
                : 'text-slate-400'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
              {speakerTab === 'habits' && (
                <motion.div 
                  layoutId="speakerMobileNavIndicator"
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${
                    isExecutive ? 'bg-[#C89630]' : isAcademy ? 'bg-emerald-400' : 'bg-teal-400'
                  }`}
                />
              )}
            </div>
            <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${
              speakerTab === 'habits'
                ? isExecutive ? 'text-[#C89630] font-bold' : isAcademy ? 'text-emerald-400 font-bold' : 'text-teal-400 font-bold'
                : 'text-slate-400'
            }`}>
              Rituals
            </span>
          </button>

          {/* 5. Coach 2-Way */}
          <button
            id="speaker-mobile-nav-coach"
            role="tab"
            aria-selected={speakerTab === 'coach'}
            onClick={() => handleTabClick('coach')}
            className="flex-1 flex flex-col items-center justify-center py-1 relative touch-manipulation active:scale-95 transition-transform"
          >
            <div className={`relative p-1 rounded-xl transition-colors ${
              speakerTab === 'coach'
                ? isExecutive ? 'text-[#C89630]' : isAcademy ? 'text-emerald-400' : 'text-teal-400'
                : 'text-slate-400'
            }`}>
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-1 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-[#C89630] text-slate-950 ring-2 ring-slate-950">
                  {unreadCount}
                </span>
              )}
              {speakerTab === 'coach' && (
                <motion.div 
                  layoutId="speakerMobileNavIndicator"
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${
                    isExecutive ? 'bg-[#C89630]' : isAcademy ? 'bg-emerald-400' : 'bg-teal-400'
                  }`}
                />
              )}
            </div>
            <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${
              speakerTab === 'coach'
                ? isExecutive ? 'text-[#C89630] font-bold' : isAcademy ? 'text-emerald-400 font-bold' : 'text-teal-400 font-bold'
                : 'text-slate-400'
            }`}>
              Messenger
            </span>
          </button>
        </div>
      </nav>

      {/* Speaker Mobile Quick Action Sheet Modal */}
      <AnimatePresence>
        {isActionSheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bottom-[76px] z-50 flex items-end justify-center bg-slate-950/85 backdrop-blur-xs cursor-pointer"
            onClick={() => setIsActionSheetOpen(false)}
          >
            {/* Action Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 pb-6 z-10 shadow-2xl space-y-4 max-h-[75vh] overflow-y-auto cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet Drag Handle */}
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">Speaker Quick Actions</h4>
                  <p className="text-xs text-slate-400">Chamber shortcuts, speech vault & analytics</p>
                </div>
                <button
                  onClick={() => setIsActionSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Close action sheet"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Action Tiles (2-Column Grid) */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Live Rehearsal Chamber */}
                <button
                  onClick={handleQuickLaunchLive}
                  className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2 text-left active:scale-[0.97] transition-transform ${
                    isExecutive 
                      ? 'bg-[#C89630]/15 border-[#C89630]/40 text-white' 
                      : 'bg-emerald-950/60 border-emerald-800/40 text-white'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isExecutive ? 'bg-[#C89630] text-slate-950' : 'bg-emerald-500 text-slate-950'}`}>
                    <Play className="w-4 h-4 fill-slate-950" />
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${isExecutive ? 'text-[#C89630]' : 'text-emerald-400'}`}>
                      Launch Chamber
                    </span>
                    <span className="text-[11px] text-slate-400">Practice clock & live rubric</span>
                  </div>
                </button>

                {/* 2. Speech / Catharsis Vault */}
                <button
                  onClick={() => {
                    setIsActionSheetOpen(false);
                    handleTabClick('catharsis');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex flex-col items-start gap-2 text-left active:scale-[0.97] transition-transform"
                >
                  <div className="p-2 rounded-xl bg-teal-900/60 text-teal-300">
                    {isExecutive ? <Briefcase className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isExecutive ? 'Speech Vault' : 'Catharsis Vault'}
                    </span>
                    <span className="text-[11px] text-slate-400">Recordings & debriefs</span>
                  </div>
                </button>

                {/* 3. Longitudinal Speech Analytics */}
                <button
                  onClick={() => {
                    setIsActionSheetOpen(false);
                    handleTabClick('progress');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex flex-col items-start gap-2 text-left active:scale-[0.97] transition-transform"
                >
                  <div className="p-2 rounded-xl bg-cyan-900/50 text-cyan-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Speech Analytics</span>
                    <span className="text-[11px] text-slate-400">WPM & clarity trajectory</span>
                  </div>
                </button>

                {/* 4. Executive Syllabus & Roadmap */}
                <button
                  onClick={() => {
                    setIsActionSheetOpen(false);
                    handleTabClick('schedule');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex flex-col items-start gap-2 text-left active:scale-[0.97] transition-transform"
                >
                  <div className="p-2 rounded-xl bg-amber-900/40 text-amber-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Syllabus & Roadmap</span>
                    <span className="text-[11px] text-slate-400">Consultation calendar</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
