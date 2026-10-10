import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { FONT_MONO } from '../fonts';

interface DataStreamSyncProps {
  revealFrame: number;
}

export const DataStreamSync: React.FC<DataStreamSyncProps> = ({ revealFrame }) => {
  const frame = useCurrentFrame();

  if (frame < revealFrame) return null;

  const opacity = interpolate(
    frame,
    [revealFrame, revealFrame + 20],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Flowing particle positions along connection line
  const particleOffset1 = ((frame - revealFrame) * 14) % 480;
  const particleOffset2 = ((frame - revealFrame) * 14 + 240) % 480;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 480,
        height: 90,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {/* Editorial sync pill */}
      <div
        style={{
          padding: '6px 16px',
          borderRadius: 20,
          backgroundColor: '#070C18',
          border: '1px solid #C89630',
          boxShadow: '0 0 25px rgba(200, 150, 48, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#E3B95C', letterSpacing: '0.14em', fontWeight: 800 }}>
          SYNCHRONIZED TELEMETRY BUS
        </span>
        <span style={{ width: 1, height: 10, backgroundColor: 'rgba(200, 150, 48, 0.5)' }} />
        <span style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#10B981', letterSpacing: '0.1em', fontWeight: 800 }}>
          ACTIVE PIPELINE
        </span>
      </div>

      {/* SVG Connecting Beam with animated flowing pulses */}
      <svg width="440" height="28" viewBox="0 0 440 28" fill="none">
        <line
          x1="0"
          y1="14"
          x2="440"
          y2="14"
          stroke="rgba(200, 150, 48, 0.35)"
          strokeWidth="2"
          strokeDasharray="8 8"
        />
        <circle
          cx={particleOffset1}
          cy="14"
          r="5"
          fill="#E3B95C"
          filter="drop-shadow(0 0 8px #E3B95C)"
        />
        <circle
          cx={particleOffset2}
          cy="14"
          r="4"
          fill="#10B981"
          filter="drop-shadow(0 0 8px #10B981)"
        />
      </svg>
    </div>
  );
};
