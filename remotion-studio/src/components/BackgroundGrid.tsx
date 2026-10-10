import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const BackgroundGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const gridOffsetY = interpolate(frame, [0, 450], [0, 50], { extrapolateRight: 'clamp' });
  const glowX = interpolate(frame, [0, 160, 320, 450], [40, 60, 45, 50]);
  const glowY = interpolate(frame, [0, 160, 320, 450], [38, 48, 52, 45]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: -200,
        backgroundColor: '#030712',
        backgroundImage: `
          radial-gradient(ellipse 60% 50% at ${glowX}% ${glowY}%, rgba(200, 150, 48, 0.18) 0%, transparent 68%),
          radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.75) 0%, #030712 100%),
          linear-gradient(to right, rgba(51, 65, 85, 0.22) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(51, 65, 85, 0.22) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 72px 72px, 72px 72px',
        backgroundPosition: `0 0, 0 0, 0 ${gridOffsetY}px, 0 ${gridOffsetY}px`,
        pointerEvents: 'none',
      }}
    >
      {/* Subtle vignette border */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 160px rgba(2, 6, 23, 0.98)',
        }}
      />
    </div>
  );
};
