import React, { useState } from 'react';
import { Globe, Mic, UserCheck, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PortalView } from '../../types';

export const SubdomainSwitcher: React.FC = () => {
  const { currentPortal, setCurrentPortal } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const portals: { id: PortalView; label: string; subdomain: string; icon: React.ComponentType<{ className?: string }>; badge: string }[] = [
    {
      id: 'landing',
      label: 'Main Umbrella',
      subdomain: 'globaloratorsproject.com',
      icon: Globe,
      badge: 'Public'
    },
    {
      id: 'speaker_app',
      label: 'Orators App',
      subdomain: 'app.globaloratorsproject.com',
      icon: Mic,
      badge: 'Client App'
    },
    {
      id: 'coach_os',
      label: 'Coach App',
      subdomain: 'coach.globaloratorsproject.com',
      icon: Shield,
      badge: 'Coach'
    },
    {
      id: 'onboarding',
      label: 'Speaker Onboarding',
      subdomain: 'onboard.globaloratorsproject.com',
      icon: UserCheck,
      badge: 'Flow'
    }
  ];

  return (
    <aside aria-label="Environment and subdomain navigation" className="hidden md:block sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between py-1.5 sm:py-2">
        {/* Left: Indicator & Collapse Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-800 font-mono text-[10px] tracking-wide">
            <span className="text-brand-gold font-bold uppercase tracking-wider">NETWORK:</span>
            <span className="font-semibold text-slate-100">
              {portals.find(p => p.id === currentPortal)?.subdomain || 'globaloratorsproject.com'}
            </span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md sm:hidden flex items-center"
            title={isCollapsed ? 'Show domains' : 'Collapse bar'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right: Subdomain pills */}
        {!isCollapsed && (
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {portals.map((p) => {
              const Icon = p.icon;
              const isActive = currentPortal === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setCurrentPortal(p.id)}
                  className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg font-medium transition-all text-[11px] whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3 h-3 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                  <span className="hidden md:inline">{p.subdomain}</span>
                  <span className="md:hidden">{p.label}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded ${
                      isActive ? 'bg-black/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.badge}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
