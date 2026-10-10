import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONT_SANS, FONT_SERIF, FONT_MONO } from '../fonts';

interface SpeakerPortalCardProps {
  revealFrame?: number;
}

export const SpeakerPortalCard: React.FC<SpeakerPortalCardProps> = ({
  revealFrame = 190,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterSpring = spring({
    frame: frame - revealFrame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const cardOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const cardScale = interpolate(enterSpring, [0, 1], [0.94, 1]);

  // Audio waveform bar generator
  const bars = Array.from({ length: 32 }, (_, i) => {
    // Generate organic pseudo-random oscillation based on frame and bar index
    const wave1 = Math.sin((frame * 0.18) + (i * 0.45));
    const wave2 = Math.cos((frame * 0.12) - (i * 0.3));
    const rawHeight = Math.abs(wave1 * 0.6 + wave2 * 0.4);
    const height = Math.max(12, Math.min(68, rawHeight * 70));
    return height;
  });

  // Timer calculation
  const elapsedSec = Math.floor(interpolate(frame, [revealFrame, revealFrame + 240], [272, 285], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const minutes = Math.floor(elapsedSec / 60);
  const seconds = (elapsedSec % 60).toString().padStart(2, '0');

  return (
    <div
      style={{
        width: 1040,
        backgroundColor: '#070C18',
        backgroundImage: 'linear-gradient(180deg, rgba(200, 150, 48, 0.05) 0%, rgba(2, 6, 23, 0.8) 100%)',
        borderRadius: 20,
        border: '1px solid rgba(200, 150, 48, 0.45)',
        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 35px 80px -15px rgba(0, 0, 0, 0.95), 0 0 50px rgba(200, 150, 48, 0.15)',
        overflow: 'hidden',
        color: '#F8FAFC',
        fontFamily: `${FONT_SANS}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
      }}
    >
      {/* Window Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(200, 150, 48, 0.25)',
          backgroundColor: '#0D1527',
          backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#EF4444', boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#F59E0B', boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)' }} />
          <span
            style={{
              marginLeft: 14,
              fontSize: 11,
              fontFamily: `${FONT_MONO}, monospace`,
              letterSpacing: '0.18em',
              color: '#94A3B8',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            ORATORS SPEAKER PORTAL // LIVE REHEARSAL CHAMBER
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              backgroundColor: 'rgba(16, 185, 129, 0.16)',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              color: '#34D399',
              fontSize: 10,
              fontFamily: `${FONT_MONO}, monospace`,
              fontWeight: 800,
              letterSpacing: '0.12em',
            }}
          >
            RECORDING LIVE AUDIO
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ padding: '26px 30px' }}>
        {/* Motion Banner and Debate Clock */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
            padding: '18px 22px',
            backgroundColor: '#0B1222',
            borderRadius: 12,
            border: '1px solid rgba(51, 65, 85, 0.45)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#C89630', letterSpacing: '0.14em', fontWeight: 800 }}>
              OFFICIAL PARLIAMENTARY MOTION
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#F8FAFC', marginTop: 4, letterSpacing: '-0.01em' }}>
              "This House Would Decolonize Pan-African Curricula"
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>
              British Parliamentary Forensics • 1st Proposition (Opening Government)
            </div>
          </div>

          <div
            style={{
              padding: '12px 20px',
              backgroundColor: '#070C18',
              borderRadius: 10,
              border: '1px solid rgba(200, 150, 48, 0.4)',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#94A3B8', letterSpacing: '0.1em' }}>CHAMBER CLOCK</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#E3B95C', fontFamily: `${FONT_MONO}, monospace` }}>
              0{minutes}:{seconds} <span style={{ fontSize: 13, color: '#64748B' }}>/ 07:00</span>
            </div>
          </div>
        </div>

        {/* Audio Waveform Studio Card */}
        <div
          style={{
            padding: '22px 26px',
            backgroundColor: '#090F1E',
            borderRadius: 16,
            border: '1px solid rgba(51, 65, 85, 0.45)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#E3B95C', letterSpacing: '0.16em', fontWeight: 800 }}>
                TELEMETRY
              </span>
              <span style={{ width: 1, height: 12, backgroundColor: 'rgba(200, 150, 48, 0.4)' }} />
              <span style={{ fontSize: 12, fontFamily: `${FONT_MONO}, monospace`, color: '#E2E8F0', letterSpacing: '0.08em', fontWeight: 600 }}>
                VOCAL RESONANCE & CLASH FREQUENCY
              </span>
            </div>
            <span style={{ fontSize: 11, fontFamily: `${FONT_MONO}, monospace`, color: '#38BDF8', fontWeight: 600 }}>
              142 WPM • 48 kHz High Fidelity
            </span>
          </div>

          {/* Dynamic Oscillating Waveform Bars */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              height: 84,
              backgroundColor: '#050811',
              borderRadius: 12,
              padding: '0 24px',
              border: '1px solid rgba(51, 65, 85, 0.35)',
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.6)',
            }}
          >
            {bars.map((h, i) => (
              <div
                key={i}
                style={{
                  width: 14,
                  height: h,
                  borderRadius: 7,
                  background: i % 2 === 0
                    ? 'linear-gradient(180deg, #FDE68A 0%, #C89630 65%, #92400E 100%)'
                    : 'linear-gradient(180deg, #FEF08A 0%, #E3B95C 65%, #A16207 100%)',
                  boxShadow: '0 0 10px rgba(200, 150, 48, 0.5)',
                  transition: 'height 0.05s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* Real-time Faculty Telemetry Banner */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#090F1E',
            borderRadius: 12,
            border: '1px solid rgba(200, 150, 48, 0.35)',
            boxShadow: 'inset 0 1px 0 rgba(200, 150, 48, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                fontSize: 10,
                fontFamily: `${FONT_MONO}, monospace`,
                fontWeight: 900,
                letterSpacing: '0.12em',
                color: '#070C18',
                backgroundColor: '#E3B95C',
                padding: '3px 8px',
                borderRadius: 4,
              }}
            >
              SYNC
            </span>
            <div>
              <div style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#E3B95C', fontWeight: 800, letterSpacing: '0.08em' }}>
                SYNCHRONIZED FACULTY FEEDBACK ARRIVED
              </div>
              <div style={{ fontSize: 12, color: '#E2E8F0', marginTop: 2, fontStyle: 'italic' }}>
                Coach Valerie: "Cadence is locked; transition smoothly into Second Proposition point."
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              backgroundColor: '#10B981',
              color: '#070C18',
              fontSize: 11,
              fontWeight: 900,
              fontFamily: `${FONT_MONO}, monospace`,
              letterSpacing: '0.05em',
            }}
          >
            RUBRIC: 94.8%
          </div>
        </div>
      </div>
    </div>
  );
};
