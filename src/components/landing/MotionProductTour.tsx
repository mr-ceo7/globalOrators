import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Rotate3d,
  Maximize2,
  Download,
  Film,
  Award,
  Mic,
  Activity,
  CheckCircle2,
  Radio,
  Sliders,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ThreeDBackground } from './ThreeDBackground';

interface MotionProductTourProps {
  onStartOnboarding?: (branch?: 'Academy' | 'Foundation') => void;
  isStandalonePage?: boolean;
}

type SceneKey = 'coach_os' | 'cursor_click' | 'speaker_chamber' | 'synchronized';

interface SceneConfig {
  id: SceneKey;
  step: string;
  title: string;
  subtitle: string;
  rotX: number;
  rotY: number;
  scale: number;
  focusCard: 'coach' | 'speaker' | 'both';
}

const SCENES: SceneConfig[] = [
  {
    id: 'coach_os',
    step: '01',
    title: 'Coach OS Command Center',
    subtitle: 'Live parliamentary forensics rubric scoring, varsity squad telemetry & coach dispatch.',
    rotX: 8,
    rotY: -10,
    scale: 1,
    focusCard: 'coach',
  },
  {
    id: 'cursor_click',
    step: '02',
    title: 'Cursor Action & State Flip',
    subtitle: 'Kinetic spring physics and interactive portal switching with instant state preservation.',
    rotX: 4,
    rotY: -2,
    scale: 1.05,
    focusCard: 'coach',
  },
  {
    id: 'speaker_chamber',
    step: '03',
    title: 'Speaker Rehearsal Chamber',
    subtitle: 'Live acoustic resonance monitoring, 7-minute BP countdown & real-time clash feedback.',
    rotX: 8,
    rotY: 10,
    scale: 1,
    focusCard: 'speaker',
  },
  {
    id: 'synchronized',
    step: '04',
    title: 'Synchronized Dual Architecture',
    subtitle: 'Dual-deck isometric view showing seamless two-way telemetry between Coach and Orator.',
    rotX: 14,
    rotY: 0,
    scale: 0.9,
    focusCard: 'both',
  },
];

export const MotionProductTour: React.FC<MotionProductTourProps> = ({
  onStartOnboarding,
  isStandalonePage = false,
}) => {
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isOrbitMode, setIsOrbitMode] = useState<boolean>(false);
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [simulatedClickTriggered, setSimulatedClickTriggered] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeScene = SCENES[activeSceneIdx];

  // Auto-play timer (cycles through scenes every 6 seconds)
  useEffect(() => {
    if (!isPlaying || isOrbitMode) return;

    const interval = setInterval(() => {
      setActiveSceneIdx((prev) => (prev + 1) % SCENES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPlaying, isOrbitMode]);

  // Handle simulated click sequence on Scene 2
  useEffect(() => {
    if (activeScene.id === 'cursor_click') {
      const timer = setTimeout(() => {
        setSimulatedClickTriggered(true);
      }, 1600);
      return () => {
        clearTimeout(timer);
        setSimulatedClickTriggered(false);
      };
    } else {
      setSimulatedClickTriggered(false);
    }
  }, [activeScene.id]);

  // Handle Interactive Mouse / Touch Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;

    // Apply proportional tilt
    setMouseTilt({
      x: -yRatio * (isOrbitMode ? 28 : 12),
      y: xRatio * (isOrbitMode ? 32 : 14),
    });
  };

  const handleMouseLeave = () => {
    if (!isOrbitMode) {
      setMouseTilt({ x: 0, y: 0 });
    }
  };

  // Compute final 3D angles
  const currentRotX = isOrbitMode ? mouseTilt.x : activeScene.rotX + mouseTilt.x;
  const currentRotY = isOrbitMode ? mouseTilt.y : activeScene.rotY + mouseTilt.y;

  return (
    <section
      id="product-tour"
      className={`relative bg-slate-950 text-slate-100 overflow-hidden border-b border-slate-800 ${
        isStandalonePage ? 'py-8 sm:py-16' : 'py-12 sm:py-24'
      }`}
    >
      {/* 1. WebGL Three.js Coordinate Lattice & Particle Field */}
      <ThreeDBackground interactive={true} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 z-10">
        {/* Section Header: Anti-AI Slop Strict Typography */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12 border-b border-slate-800 pb-6">
          <div className="max-w-2xl text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono tracking-widest text-[#E3B95C] uppercase bg-[#C89630]/10 px-2 py-0.5 rounded border border-[#C89630]/30 font-bold">
                Programmatic Motion Engine
              </span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                // Dual-Portal 3D Architecture
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-slate-100 leading-tight">
              Sovereign Debate Forensics<br />
              <span className="italic font-normal text-[#E3B95C]">
                Engineered in Full 3D Motion.
              </span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Explore the two synchronized pillars of the Global Orators platform: the coach command desk with
              live parliamentary adjudications, and the speaker chamber with real-time acoustic resonance tracking.
            </p>
          </div>

          {/* Action CTAs: Direct Video Download & Watch Launch Reel */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setVideoModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#C89630] text-[#0F172A] font-serif font-bold text-xs hover:bg-[#B37D22] transition-all flex items-center gap-2 shadow-lg shadow-[#C89630]/20 cursor-pointer"
              title="Watch high-definition programmatic launch video"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Watch Launch Reel</span>
            </button>

            <a
              href="/videos/gop-product-launch-demo.mp4"
              download="gop-product-launch-demo.mp4"
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-[#C89630]/60 font-mono text-xs transition-all flex items-center gap-2 cursor-pointer"
              title="Download MP4 video for marketing & social media"
            >
              <Download className="w-3.5 h-3.5 text-[#E3B95C]" />
              <span>Download MP4</span>
            </a>
          </div>
        </div>

        {/* Scene Navigation Bar: Editorial Timeline Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800">
          {/* Scene Selectors */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => {
                  setActiveSceneIdx(idx);
                  setIsOrbitMode(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSceneIdx === idx && !isOrbitMode
                    ? 'bg-[#C89630] text-[#0F172A] font-bold shadow-md shadow-[#C89630]/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-[10px] opacity-75">{scene.step}</span>{' '}
                <span>{scene.title}</span>
              </button>
            ))}
          </div>

          {/* Interactive Play/Pause & 3D Orbit Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOrbitMode(!isOrbitMode)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                isOrbitMode
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Toggle interactive free 3D tilt with mouse/touch"
            >
              <Rotate3d className="w-3.5 h-3.5" />
              <span className="text-[11px]">{isOrbitMode ? 'Orbit Active' : '3D Orbit'}</span>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause auto-play' : 'Resume auto-play'}
              aria-label={isPlaying ? 'Pause tour' : 'Play tour'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 3D Motion Perspective Stage Container */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative min-h-[520px] sm:min-h-[640px] rounded-3xl bg-slate-950/70 border border-slate-800 p-4 sm:p-8 flex items-center justify-center overflow-hidden shadow-2xl transition-all select-none"
          style={{
            perspective: 1200,
          }}
        >
          {/* Subtle Ambient Light Cone */}
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#C89630]/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* 3D Spatial Rig (Rotates according to Scene or Orbit) */}
          <motion.div
            animate={{
              rotateX: currentRotX,
              rotateY: currentRotY,
              scale: activeScene.scale,
            }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 18,
            }}
            style={{
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full max-w-4xl"
          >
            {/* ========================================================
                CARD 1: GOP COACH OS COMMAND CENTER
               ======================================================== */}
            <div
              className={`transition-all duration-700 ${
                activeScene.focusCard === 'coach'
                  ? 'opacity-100 z-30 scale-100'
                  : activeScene.focusCard === 'both'
                  ? 'opacity-95 z-20 scale-90 -translate-x-4 lg:-translate-x-16 -rotate-y-12'
                  : 'opacity-0 pointer-events-none scale-90 translate-y-8'
              }`}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="rounded-2xl bg-slate-900/95 border border-[#C89630]/40 p-4 sm:p-6 shadow-2xl backdrop-blur-xl text-left">
                {/* Window Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-3 text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                      GOP Coach OS // Adjudication Desk v2.4
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#E3B95C] bg-[#C89630]/15 border border-[#C89630]/30 px-2 py-0.5 rounded">
                    LIVE FACULTY TELEMETRY
                  </span>
                </div>

                {/* 3-Column Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-5">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[9px] font-mono text-slate-400 uppercase">Tournament Squads</div>
                    <div className="text-xl sm:text-2xl font-serif font-black text-slate-100 mt-1">16 Squads</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">PAUDC & WUDC Ready</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-[#C89630]/30">
                    <div className="text-[9px] font-mono text-[#E3B95C] uppercase">Championship Readiness</div>
                    <div className="text-xl sm:text-2xl font-serif font-black text-[#E3B95C] mt-1">94.8%</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Breakthrough Cohort</div>
                  </div>
                  <div className="hidden sm:block p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[9px] font-mono text-slate-400 uppercase">Debaters Trained</div>
                    <div className="text-xl sm:text-2xl font-serif font-black text-slate-100 mt-1">1,450+</div>
                    <div className="text-[10px] text-sky-400 font-mono mt-0.5">Pan-African Network</div>
                  </div>
                </div>

                {/* Live Parliamentary Forensics Rubric Box */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="text-[10px] font-mono font-bold text-[#C89630] uppercase tracking-wider">
                        Live Debate Evaluation Rubric
                      </div>
                      <div className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
                        Valerie Wanjiku — Prime Minister Opening Rebuttal
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Motion: "This House Would Decolonize Pan-African Curricula"
                      </div>
                    </div>

                    <button
                      id="tour-switch-btn"
                      onClick={() => {
                        setActiveSceneIdx(2);
                        setIsOrbitMode(false);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        simulatedClickTriggered
                          ? 'bg-emerald-500 text-slate-950 scale-95 shadow-md shadow-emerald-500/30'
                          : 'bg-[#C89630] text-slate-950 hover:bg-[#B37D22] shadow-md shadow-[#C89630]/20'
                      }`}
                    >
                      <span>Switch to Speaker Chamber</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 4 Rubric Scoring Meters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300">Argumentation & Proof</span>
                        <span className="font-mono font-bold text-[#E3B95C]">9.4 / 10</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C89630] rounded-full transition-all duration-1000" style={{ width: '94%' }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300">Refutation & Rebuttal</span>
                        <span className="font-mono font-bold text-[#E3B95C]">9.1 / 10</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C89630] rounded-full transition-all duration-1000" style={{ width: '91%' }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300">Rhetorical Poise & Cadence</span>
                        <span className="font-mono font-bold text-emerald-400">9.6 / 10</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: '96%' }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300">POI Management</span>
                        <span className="font-mono font-bold text-[#E3B95C]">8.9 / 10</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C89630] rounded-full transition-all duration-1000" style={{ width: '89%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Coach Note Dispatch */}
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-[#C89630]/25 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#C89630] text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                      VJ
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] font-mono text-[#E3B95C]">FACULTY DISPATCH // COACH JEFF & VALERIE</div>
                      <div className="text-xs text-slate-200 mt-0.5">
                        "First speaker clash articulated with poise; opposition POIs countered cleanly."
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================
                CARD 2: ORATORS SPEAKER CHAMBER
               ======================================================== */}
            <div
              className={`transition-all duration-700 ${
                activeScene.focusCard === 'speaker'
                  ? 'opacity-100 z-30 scale-100'
                  : activeScene.focusCard === 'both'
                  ? 'opacity-95 z-20 scale-90 translate-x-4 lg:translate-x-16 rotate-y-12'
                  : 'opacity-0 pointer-events-none scale-90 -translate-y-8'
              }`}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="rounded-2xl bg-slate-900/95 border border-[#C89630]/40 p-4 sm:p-6 shadow-2xl backdrop-blur-xl text-left">
                {/* Window Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-3 text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                      Orators Portal // Live Rehearsal Chamber
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                    AUDIO RECORDING ACTIVE
                  </span>
                </div>

                {/* Motion Banner & Chamber Clock */}
                <div className="p-4 rounded-xl bg-slate-950 border border-[#C89630]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="text-[10px] font-mono text-[#E3B95C] uppercase font-bold tracking-wider">
                      Parliamentary Motion Resolution
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
                      "This House Would Decolonize Pan-African Curricula"
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Prime Minister Speech • BP Forensics Simulation
                    </div>
                  </div>
                  <div className="p-2.5 px-4 rounded-lg bg-slate-900 border border-slate-800 text-right shrink-0">
                    <div className="text-[9px] font-mono text-slate-400">CHAMBER CLOCK</div>
                    <div className="text-xl font-mono font-black text-[#E3B95C]">
                      04:32 <span className="text-xs text-slate-500">/ 07:00</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Acoustic Soundwave Studio */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E3B95C] animate-pulse" />
                      <span className="text-xs font-mono font-semibold text-slate-200">
                        Vocal Resonance & Clash Spectrum
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-sky-400">142 WPM • 48 kHz High-Res</span>
                  </div>

                  {/* 28 Dynamic Waveform Bars */}
                  <div className="flex items-center justify-center gap-1.5 h-20 bg-slate-900/90 rounded-lg px-4 border border-slate-800/80">
                    {Array.from({ length: 28 }).map((_, i) => {
                      const heights = [28, 42, 60, 34, 55, 70, 48, 62, 38, 52, 68, 44, 30, 58, 64, 40, 54, 72, 46, 32, 50, 66, 36, 48, 60, 42, 30, 24];
                      return (
                        <motion.div
                          key={i}
                          animate={{
                            height: [heights[i % heights.length] * 0.5, heights[i % heights.length], heights[i % heights.length] * 0.7],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.2 + (i % 5) * 0.15,
                            ease: 'easeInOut',
                          }}
                          className={`w-2.5 rounded-full ${
                            i % 3 === 0 ? 'bg-[#C89630]' : i % 3 === 1 ? 'bg-[#E3B95C]' : 'bg-emerald-400'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Real-time Faculty Sync Notification */}
                <div className="p-3 rounded-lg bg-[#C89630]/10 border border-[#C89630]/35 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-[#E3B95C] animate-pulse" />
                    <div className="text-xs text-slate-200">
                      <span className="font-mono text-[#E3B95C] font-bold">LIVE TELEMETRY: </span>
                      Coach Jeff affirmed rebuttal structure: <strong className="text-emerald-400">Score 94.8%</strong>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                    SYNCD
                  </span>
                </div>
              </div>
            </div>

            {/* Realistic Animated Cursor (Visible in Scene 2) */}
            {activeScene.id === 'cursor_click' && (
              <motion.div
                initial={{ opacity: 0, x: -120, y: -80 }}
                animate={{
                  opacity: 1,
                  x: [0, 180, 260],
                  y: [0, 80, 110],
                }}
                transition={{
                  duration: 1.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute z-50 pointer-events-none"
                style={{
                  top: '40%',
                  right: '25%',
                }}
              >
                {/* SVG Pointer */}
                <svg
                  width="26"
                  height="32"
                  viewBox="0 0 26 32"
                  fill="none"
                  className="filter drop-shadow-lg"
                >
                  <path
                    d="M1 1L10.5 29.5L14.8 17.5L25 14L1 1Z"
                    fill="#0F172A"
                    stroke="#C89630"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="9" r="2.2" fill="#E3B95C" />
                </svg>

                {/* Simulated Click Ripple Ring */}
                {simulatedClickTriggered && (
                  <motion.div
                    initial={{ scale: 0.2, opacity: 1 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute -top-3 -left-3 w-10 h-10 rounded-full border-2 border-[#E3B95C] bg-[#C89630]/20"
                  />
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Scene Caption & Progress Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div>
            <div className="text-xs font-mono font-bold text-[#E3B95C] uppercase tracking-wider">
              {activeScene.step} // {activeScene.title}
            </div>
            <div className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {activeScene.subtitle}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-mono text-slate-400">
              Drag mouse or finger on the showcase to test 3D perspective depth.
            </span>
          </div>
        </div>
      </div>

      {/* Video Modal Player (Programmatic MP4 Launch Reel) */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="text-left">
                  <div className="text-[10px] font-mono text-[#E3B95C] font-bold uppercase tracking-widest">
                    Programmatic Remotion Render // 1080p 30fps
                  </div>
                  <h3 className="text-lg font-serif font-bold text-slate-100">
                    Global Orators Launch Motion Reel
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="/videos/gop-product-launch-demo.mp4"
                    download="gop-product-launch-demo.mp4"
                    className="px-3 py-1.5 rounded-lg bg-[#C89630] text-slate-950 font-serif font-bold text-xs hover:bg-[#B37D22] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </a>

                  <button
                    onClick={() => setVideoModalOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
                <video
                  src="/videos/gop-product-launch-demo.mp4"
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
                <span className="font-mono">
                  Full programmatic render generated using Remotion React engine. Ready for social platforms.
                </span>
                <span className="font-mono text-[#E3B95C] mt-2 sm:mt-0">
                  globaloratorsproject.com
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
