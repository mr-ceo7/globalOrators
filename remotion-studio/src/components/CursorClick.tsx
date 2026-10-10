import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONT_MONO } from '../fonts';

interface CursorClickProps {
  startFrame: number;
  clickFrame: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  label?: string;
}

export const CursorClick: React.FC<CursorClickProps> = ({
  startFrame,
  clickFrame,
  startX,
  startY,
  targetX,
  targetY,
  label = 'CLICK // SWITCH PORTAL',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const endFrame = clickFrame + 22;
  if (frame < startFrame || frame > endFrame) return null;

  // Fade out after click completes
  const cursorOpacity = interpolate(
    frame,
    [clickFrame + 8, endFrame],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Smooth easeInOut movement from start to target using sine curve
  const rawProgress = interpolate(
    frame,
    [startFrame, clickFrame - 4],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  // Ease out cubic for natural human pointer velocity
  const moveProgress = 1 - Math.pow(1 - rawProgress, 3);

  // Curved trajectory
  const currentX = interpolate(moveProgress, [0, 1], [startX, targetX]);
  const currentY = interpolate(moveProgress, [0, 1], [startY, targetY]);

  // Click bounce using spring
  const clickSpring = spring({
    frame: frame - clickFrame,
    fps,
    config: { damping: 12, stiffness: 220 },
  });

  const cursorScale = frame >= clickFrame ? interpolate(clickSpring, [0, 1], [0.82, 1]) : 1;

  // Ripple effect on click
  const rippleProgress = interpolate(
    frame,
    [clickFrame, clickFrame + 18],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const rippleScale = interpolate(rippleProgress, [0, 1], [0.2, 2.4]);
  const rippleOpacity = interpolate(rippleProgress, [0, 0.2, 1], [0, 0.9, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: currentX,
        top: currentY,
        transform: `scale(${cursorScale})`,
        transformOrigin: '0 0',
        opacity: cursorOpacity,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {/* Click Ripple */}
      {frame >= clickFrame && frame < clickFrame + 25 && (
        <div
          style={{
            position: 'absolute',
            left: 2,
            top: 2,
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '2px solid #E3B95C',
            backgroundColor: 'rgba(200, 150, 48, 0.3)',
            boxShadow: '0 0 15px rgba(227, 185, 92, 0.6)',
            transform: `translate(-50%, -50%) scale(${rippleScale})`,
            opacity: rippleOpacity,
          }}
        />
      )}

      {/* SVG Modern macOS Cursor */}
      <svg
        width="28"
        height="34"
        viewBox="0 0 26 32"
        fill="none"
        style={{
          filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.8))',
        }}
      >
        <path
          d="M1 1L10.5 29.5L14.8 17.5L25 14L1 1Z"
          fill="#070C18"
          stroke="#E3B95C"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="9" r="2.2" fill="#F8FAFC" />
      </svg>

      {/* Cursor Label Pill */}
      {label && frame > startFrame + 6 && (
        <div
          style={{
            position: 'absolute',
            left: 26,
            top: -22,
            backgroundColor: '#070C18',
            border: '1px solid rgba(200, 150, 48, 0.5)',
            color: '#E3B95C',
            padding: '3px 8px',
            borderRadius: 5,
            fontSize: 10,
            fontFamily: `${FONT_MONO}, monospace`,
            fontWeight: 800,
            letterSpacing: '0.12em',
            whiteSpace: 'nowrap',
            boxShadow: '0 6px 16px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
