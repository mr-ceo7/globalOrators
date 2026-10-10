import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { BackgroundGrid } from './components/BackgroundGrid';
import { CoachOSCard } from './components/CoachOSCard';
import { CursorClick } from './components/CursorClick';
import { FONT_SANS, FONT_SERIF, FONT_MONO } from './fonts';

export const CoachPortalDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ==========================================
  // PHYSICAL CAMERA & SPATIAL TIMING
  // ==========================================

  // Scene 1 -> 2: Camera Dolly Zoom into Evaluation Rubric (frames 50 - 130)
  const rubricZoom = interpolate(
    frame,
    [50, 130],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const cardScale = interpolate(rubricZoom, [0, 1], [0.95, 1.15]);
  const cardRotX = interpolate(rubricZoom, [0, 1], [10, 1]);
  const cardRotY = interpolate(rubricZoom, [0, 1], [-8, 0]);
  const cardTransY = interpolate(rubricZoom, [0, 1], [10, 30]);

  // Click timing on Coach OS button (Frame 235)
  const isButtonClickState = frame >= 234 && frame <= 245;

  // Scene 3: Camera Pan to Faculty Telemetry (frames 200 - 240)
  const facultyPan = interpolate(
    frame,
    [200, 240],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const cardTransX = interpolate(facultyPan, [0, 1], [0, 25]);

  // Scene 4: 3D Isometric Cohort Shift (frames 315 - 355)
  const isoProgress = interpolate(
    frame,
    [315, 355],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const isoRotX = interpolate(isoProgress, [0, 1], [cardRotX, 15]);
  const isoRotY = interpolate(isoProgress, [0, 1], [cardRotY, 14]);
  const isoScale = interpolate(isoProgress, [0, 1], [cardScale, 0.98]);

  // Scene 5: Outro Fade-in & Card Fade-out (frames 375 - 405)
  const cardsFadeOut = interpolate(
    frame,
    [375, 395],
    [1, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const outroProgress = interpolate(
    frame,
    [390, 420],
    [0, 1],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Top Global Header Kicker
  const headerOpacity = interpolate(
    frame,
    [10, 25, 375, 390],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Simulated live coach stats overlay during Scene 2 & 3
  const statsOpacity = interpolate(
    frame,
    [80, 105, 360, 375],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#020617',
        color: '#F8FAFC',
        overflow: 'hidden',
        fontFamily: `${FONT_SANS}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
      }}
    >
      {/* 1. Dynamic 3D Perspective Background Grid */}
      <BackgroundGrid />

      {/* 2. Top Editorial Header Bar */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 48,
          right: 48,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: headerOpacity,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: 'linear-gradient(135deg, #FDE68A 0%, #C89630 60%, #92400E 100%)',
              color: '#070C18',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 14,
              fontFamily: `${FONT_SERIF}, serif`,
              boxShadow: '0 4px 14px rgba(200, 150, 48, 0.4)',
            }}
          >
            GOP
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.14em', color: '#F8FAFC' }}>
              GLOBAL ORATORS PROJECT
            </div>
            <div style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#E3B95C', letterSpacing: '0.1em' }}>
              COACH OS COMMAND CENTER // PRODUCT REEL
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              padding: '7px 16px',
              borderRadius: 6,
              backgroundColor: '#070C18',
              border: '1px solid rgba(200, 150, 48, 0.45)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              color: '#E3B95C',
              fontSize: 11,
              fontFamily: `${FONT_MONO}, monospace`,
              letterSpacing: '0.1em',
              fontWeight: 800,
            }}
          >
            {frame < 90
              ? 'STAGE 01 // VARSITY ROSTER INITIALIZATION'
              : frame < 210
              ? 'STAGE 02 // PARLIAMENTARY FORENSICS RUBRIC'
              : frame < 330
              ? 'STAGE 03 // CRITIQUE DISPATCH TELEMETRY'
              : 'STAGE 04 // COHORT TOURNAMENT ARCHITECTURE'}
          </span>
        </div>
      </div>

      {/* Floating Tactical Telemetry Badges (Bottom Left & Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          left: 48,
          display: 'flex',
          gap: 16,
          opacity: statsOpacity,
          zIndex: 90,
        }}
      >
        <div
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            backgroundColor: 'rgba(7, 12, 24, 0.9)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#94A3B8', letterSpacing: '0.1em' }}>
            ACCREDITED FACULTY:
          </span>
          <span style={{ fontSize: 11, fontFamily: `${FONT_MONO}, monospace`, color: '#E3B95C', fontWeight: 800 }}>
            WUDC / PAUDC ADJUDICATORS
          </span>
        </div>
        <div
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            backgroundColor: 'rgba(7, 12, 24, 0.9)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#94A3B8', letterSpacing: '0.1em' }}>
            TELEMETRY DISPATCH:
          </span>
          <span style={{ fontSize: 11, fontFamily: `${FONT_MONO}, monospace`, color: '#10B981', fontWeight: 800 }}>
            SYNC IN 14MS
          </span>
        </div>
      </div>

      {/* 3. 3D Spatial Canvas for Coach OS */}
      {cardsFadeOut > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: 1300,
            perspectiveOrigin: '50% 50%',
            opacity: cardsFadeOut,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transformStyle: 'preserve-3d',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `
                  translate(-50%, -50%)
                  translateX(${cardTransX}px)
                  translateY(${cardTransY}px)
                  scale(${isoProgress > 0 ? isoScale : cardScale})
                  rotateX(${isoProgress > 0 ? isoRotX : cardRotX}deg)
                  rotateY(${isoProgress > 0 ? isoRotY : cardRotY}deg)
                `,
                transformStyle: 'preserve-3d',
                transition: 'box-shadow 0.2s ease',
              }}
            >
              <CoachOSCard
                revealFrame={10}
                highlightEvaluation={frame > 40}
                isPressed={isButtonClickState}
              />
            </div>

            {/* Interactive Simulated Cursor Action at Frame 235 */}
            <CursorClick
              startFrame={190}
              clickFrame={235}
              startX={1280}
              startY={720}
              targetX={1320}
              targetY={420}
              label="DISPATCH ADJUDICATION TO ORATOR"
            />
          </div>
        </div>
      )}

      {/* 4. Editorial Outro Title Sequence */}
      {outroProgress > 0 && (
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: outroProgress,
            transform: `scale(${interpolate(outroProgress, [0, 1], [0.92, 1])})`,
            zIndex: 200,
            backgroundColor: 'rgba(2, 6, 23, 0.94)',
          }}
        >
          {/* Gold Monogram Shield */}
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              background: 'linear-gradient(135deg, #FDE68A 0%, #C89630 55%, #92400E 100%)',
              color: '#070C18',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 32,
              fontFamily: `${FONT_SERIF}, serif`,
              marginBottom: 28,
              boxShadow: '0 0 70px rgba(200, 150, 48, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              zIndex: 10,
            }}
          >
            GOP
          </div>

          <div
            style={{
              fontSize: 50,
              fontWeight: 800,
              fontFamily: `${FONT_SERIF}, Georgia, serif`,
              color: '#F8FAFC',
              textAlign: 'center',
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              marginBottom: 18,
              position: 'relative',
              zIndex: 10,
            }}
          >
            Institutional Forensics.<br />
            <span style={{ color: '#E3B95C', fontStyle: 'italic', fontWeight: 400 }}>
              Unrivaled Adjudication.
            </span>
          </div>

          {/* Architectural divider with micro-mono kicker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 34,
              position: 'relative',
              zIndex: 10,
            }}
          >
            <div style={{ width: 40, height: 1, backgroundColor: 'rgba(200, 150, 48, 0.4)' }} />
            <p
              style={{
                fontSize: 14,
                color: '#94A3B8',
                fontFamily: `${FONT_MONO}, monospace`,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                margin: 0,
                fontWeight: 600,
              }}
            >
              COACH OS COMMAND CENTER // PAN-AFRICAN FORENSICS
            </p>
            <div style={{ width: 40, height: 1, backgroundColor: 'rgba(200, 150, 48, 0.4)' }} />
          </div>

          {/* Polished Glass Action Pill */}
          <div
            style={{
              padding: '14px 34px',
              borderRadius: 30,
              backgroundColor: '#070C18',
              border: '1px solid #C89630',
              color: '#E3B95C',
              fontSize: 13,
              fontWeight: 800,
              fontFamily: `${FONT_MONO}, monospace`,
              letterSpacing: '0.18em',
              boxShadow: '0 8px 30px rgba(200, 150, 48, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              position: 'relative',
              zIndex: 10,
            }}
          >
            COACH.GLOBALORATORSPROJECT.COM
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
