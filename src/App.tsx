/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CoachDashboard } from './components/dashboard/CoachDashboard';
import { ClientRoster } from './components/clients/ClientRoster';
import { ProgramBuilder } from './components/programs/ProgramBuilder';
import { ExerciseLibrary } from './components/programs/ExerciseLibrary';
import { CalendarScheduler } from './components/programs/CalendarScheduler';
import { ProgressTracker } from './components/progress/ProgressTracker';
import { CoachMessenger } from './components/messenger/CoachMessenger';
import { WorkoutLoggerModal } from './components/programs/WorkoutLoggerModal';
import { SplashScreen } from './components/common/SplashScreen';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';

import { SubdomainSwitcher } from './components/common/SubdomainSwitcher';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { ClientPortal } from './components/clientApp/ClientPortal';
import { CoachLoginPortal } from './components/auth/CoachLoginPortal';
import { SpeakerLoginPortal } from './components/auth/SpeakerLoginPortal';
import { CoachManager } from './components/coaches/CoachManager';
import { AdminInvoices } from './components/invoicing/AdminInvoices';
import { InvoicePage } from './components/invoicing/InvoicePage';
import { SEOHead } from './components/common/SEOHead';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Allow ESC key to skip splash screen immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLoadingApp) {
        setIsLoadingApp(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoadingApp]);

  return (
    <div className="flex-1 min-h-0 bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 h-full overflow-hidden">
      <SEOHead
        title="Coach App"
        description="Private coaching dashboard and forensics workbench for Global Orators speech and debate coaches."
        canonicalPath="/coach"
        noIndex={true}
      />
      {/* Initial App Load Splash Screen */}
      <AnimatePresence>
        {isLoadingApp && (
          <SplashScreen
            minDurationMs={2200}
            onFinish={() => setIsLoadingApp(false)}
          />
        )}
      </AnimatePresence>

      {/* Collapsible Coach Sidebar (Desktop only) */}
      <Sidebar 
        onOpenAddClientModal={() => setIsAddClientModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col h-full overflow-hidden">
        {/* Global Header */}
        <Header 
          onOpenNewClient={() => setIsAddClientModalOpen(true)}
          onOpenNewProgram={() => setActiveTab('programs')}
          onOpenExerciseModal={() => setIsAddExerciseModalOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />

        {/* Scrollable View Area with bottom padding for mobile bar */}
        <main className={`flex-1 min-h-0 ${
          activeTab === 'messenger' 
            ? 'flex flex-col overflow-hidden px-2 sm:px-6 py-2 sm:py-3 pb-20 md:pb-3' 
            : 'overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-6 touch-pan-y'
        }`}>
          <div className={`mx-auto w-full ${
            activeTab === 'messenger' 
              ? 'flex-1 min-h-0 flex flex-col max-w-7xl' 
              : 'max-w-7xl'
          }`}>
            {activeTab === 'dashboard' && (
              <CoachDashboard onOpenAddClientModal={() => setIsAddClientModalOpen(true)} />
            )}

            {activeTab === 'clients' && (
              <ClientRoster
                isAddModalOpen={isAddClientModalOpen}
                onOpenAddModal={() => setIsAddClientModalOpen(true)}
                onCloseAddModal={() => setIsAddClientModalOpen(false)}
              />
            )}

            {activeTab === 'programs' && (
              <ProgramBuilder />
            )}

            {activeTab === 'exercises' && (
              <ExerciseLibrary
                isAddModalOpen={isAddExerciseModalOpen}
                onOpenAddModal={() => setIsAddExerciseModalOpen(true)}
                onCloseAddModal={() => setIsAddExerciseModalOpen(false)}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarScheduler />
            )}

            {activeTab === 'progress' && (
              <ProgressTracker />
            )}

            {activeTab === 'messenger' && (
              <CoachMessenger />
            )}

            {activeTab === 'coaches' && (
              <CoachManager />
            )}

            {activeTab === 'invoices' && (
              <AdminInvoices />
            )}
          </div>
        </main>
      </div>

      {/* Native Mobile Bottom Navigation (Visible on mobile/tablets < md) */}
      <MobileBottomNav 
        onOpenNewClient={() => setIsAddClientModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* PWA Home Screen Installation Modal */}
      <PwaInstallPrompt 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
      />

      {/* Global Workout Logger Modal */}
      <WorkoutLoggerModal />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentPortal, isAuthenticatedCoach, activeSpeakerProfile, currentPath } = useApp();

  const isPreviewOrDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.vercel.app') ||
    new URLSearchParams(window.location.search).has('debug_domains')
  );

  const isInvoicePath = currentPath.toLowerCase().startsWith('/invoice/');
  if (isInvoicePath) {
    return <InvoicePage />;
  }

  return (
    <div className={`${currentPortal === 'coach_os' || currentPortal === 'speaker_app' ? 'h-full h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'} bg-slate-950 text-slate-100 flex flex-col font-sans antialiased`}>
      {isPreviewOrDev && currentPortal !== 'landing' && currentPortal !== 'onboarding' && isAuthenticatedCoach && <SubdomainSwitcher />}
      {currentPortal === 'landing' && <LandingPage />}
      {currentPortal === 'speaker_app' && (activeSpeakerProfile ? <ClientPortal /> : <SpeakerLoginPortal />)}
      {currentPortal === 'onboarding' && <OnboardingFlow />}
      {currentPortal === 'coach_os' && (isAuthenticatedCoach ? <MainLayout /> : <CoachLoginPortal />)}
    </div>
  );
};

export default function App() {
  const isVercelHost = typeof window !== 'undefined' && (
    window.location.hostname.endsWith('.vercel.app') ||
    Boolean(import.meta.env.VITE_VERCEL_ENV)
  );

  return (
    <AppProvider>
      <AppContent />
      {isVercelHost && <Analytics />}
    </AppProvider>
  );
}
