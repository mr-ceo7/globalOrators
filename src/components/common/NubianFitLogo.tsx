import React from 'react';

interface GlobalOratorsLogoProps {
  className?: string;
}

export const GlobalOratorsLogo: React.FC<GlobalOratorsLogoProps> = ({ className = "h-9 w-9" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} shrink-0 transition-all duration-300 hover:scale-105 active:scale-95`}
    >
      {/* Outer Hexagon / Shield Frame */}
      <polygon 
        points="50,6 88,27 88,73 50,94 12,73 12,27" 
        className="stroke-emerald-500 stroke-[4.5] fill-emerald-500/10" 
        strokeLinejoin="round"
      />
      {/* Global Latitude / Soundwave Arc Left */}
      <path 
        d="M26 40 C34 32 66 32 74 40" 
        className="stroke-emerald-500/60 stroke-[3] stroke-linecap-round"
      />
      {/* Global Latitude / Soundwave Arc Center */}
      <path 
        d="M22 50 C32 44 68 44 78 50" 
        className="stroke-emerald-500 stroke-[3.5] stroke-linecap-round"
      />
      {/* Global Latitude / Soundwave Arc Bottom */}
      <path 
        d="M26 60 C34 68 66 68 74 60" 
        className="stroke-emerald-500/60 stroke-[3] stroke-linecap-round"
      />
      {/* Central Orator Rostrum & Microphone / Torch Vector */}
      <path 
        d="M50 25 V72" 
        className="stroke-white dark:stroke-white stroke-[5.5] stroke-linecap-round" 
        style={{ stroke: 'var(--app-fg)' }}
      />
      {/* Orator Acoustic Flame / Sound Dispersion Cap */}
      <circle 
        cx="50" 
        cy="24" 
        r="5" 
        className="fill-emerald-500 stroke-white dark:stroke-white stroke-[2]" 
        style={{ stroke: 'var(--app-fg)' }}
      />
      {/* Rostrum Base Pedestal */}
      <path 
        d="M38 72 H62" 
        className="stroke-emerald-500 stroke-[5] stroke-linecap-round" 
      />
    </svg>
  );
};

export const NubianFitLogo = GlobalOratorsLogo;
