import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, ShieldAlert } from 'lucide-react';

export const VoiceDispatchPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(78);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      if (typeof audioRef.current.pause === 'function') {
        try {
          audioRef.current.pause();
        } catch (e) {
          console.warn('Audio pause error:', e);
        }
      }
      setIsPlaying(false);
    } else {
      if (typeof audioRef.current.play === 'function') {
        try {
          const promise = audioRef.current.play();
          if (promise && typeof promise.then === 'function') {
            promise.then(() => {
              setIsPlaying(true);
            }).catch((err) => {
              console.warn('Audio playback prevented or unsupported:', err);
              setIsPlaying(true);
            });
          } else {
            setIsPlaying(true);
          }
        } catch {
          setIsPlaying(true);
        }
      } else {
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
      {/* Real HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src="/audio/dispatch-preview.wav"
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />

      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-[#7A4B06] dark:text-[#E3B95C] uppercase tracking-widest font-semibold flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-brand-gold" />
          Voice Dispatch • Circle 07 (Nairobi)
        </span>
        <span className="text-slate-400 font-mono">
          {isPlaying ? `${formatTime(currentTime || 24)} / ${formatTime(duration || 78)}` : '0:24 / 1:18'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlayback}
          className="w-10 h-10 rounded-full bg-[#C89630] hover:bg-[#B37D22] text-[#181B1F] font-bold flex items-center justify-center shrink-0 shadow-md shadow-[#C89630]/25 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C89630] focus-visible:outline-hidden"
          aria-label={isPlaying ? 'Pause voice dispatch' : 'Play voice dispatch'}
          title={isPlaying ? 'Pause voice excerpt' : 'Play voice excerpt'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Acoustic Waveform Bars (Respects prefers-reduced-motion) */}
        <div className="flex-1 flex items-center gap-1 h-8 overflow-hidden px-1" aria-hidden="true">
          {[35, 60, 25, 80, 95, 50, 75, 45, 90, 60, 30, 85, 100, 70, 45, 80, 65, 40, 75, 85, 60, 40, 80, 50, 30, 70, 85, 45].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-300 ${
                isPlaying
                  ? 'bg-[#C89630] opacity-90'
                  : 'bg-slate-700 opacity-50'
              }`}
              style={{
                height: isPlaying 
                  ? `${Math.max(20, (h + (i % 3) * 20) % 100)}%` 
                  : `${Math.max(15, h * 0.35)}%`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="text-[11px] text-slate-300 font-serif italic border-t border-slate-800/80 pt-2 leading-relaxed">
        "{isPlaying ? 'Now Playing: ' : ''}For six years I believed silence was safety. The day I spoke my truth in the circle, the fear left my body."
      </div>

      {/* Transparent Educational & Safeguarding Disclosure */}
      <div className="flex items-start gap-1.5 text-[9px] font-mono text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
        <ShieldAlert className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300 font-semibold">Educational Demo Model:</strong> Actual healing circle voice sessions are strictly confidential under child safeguarding protocols. This track demonstrates pacing, pause drills, and vocal resonance.
        </span>
      </div>
    </div>
  );
};
