import React, { useState } from 'react';
import { motion } from 'motion/react';
import { markIntroSeen } from './introCurtain';

/**
 * Charcoal curtain with the GOP mark that sweeps up off the screen to reveal the hero.
 * Plays once per browser session; never for reduced-motion users (see shouldShowIntro).
 */
export const IntroCurtain: React.FC = () => {
  const [done, setDone] = useState(false);
  if (done) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-[100] bg-[#181B1F] flex flex-col items-center justify-center"
      initial={{ y: 0 }}
      animate={{ y: 'calc(-100% - 120px)' }}
      transition={{ duration: 0.75, delay: 0.95, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => {
        markIntroSeen();
        setDone(true);
      }}
    >
      <motion.img
        src="/logo-icon.svg"
        alt=""
        className="w-20 h-20 sm:w-24 sm:h-24"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
      />
      <motion.span
        className="mt-5 font-serif font-black text-3xl sm:text-4xl text-[#FBF8F2] tracking-tight"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        Global Orators
      </motion.span>
      <motion.span
        className="mt-4 h-px w-40 bg-[#C89630]/70 origin-center"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.6, 0, 0.2, 1] }}
      />
      <motion.span
        className="mt-3 font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#C8D0DC]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.4 }}
      >
        Speak with impact
      </motion.span>

      {/* Wavy trailing edge, so the curtain lifts like the section curves */}
      <svg viewBox="0 0 1440 130" preserveAspectRatio="none" className="absolute top-full left-0 w-full h-[70px] sm:h-[110px]">
        <path d="M 0,0 L 0,72 C 160,116 360,130 620,108 C 900,84 1140,22 1440,50 L 1440,0 Z" fill="#181B1F" />
      </svg>
    </motion.div>
  );
};
