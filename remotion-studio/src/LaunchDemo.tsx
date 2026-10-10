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
import { SpeakerPortalCard } from './components/SpeakerPortalCard';
import { CursorClick } from './components/CursorClick';
import { DataStreamSync } from './components/DataStreamSync';
import { FONT_SANS, FONT_SERIF, FONT_MONO } from './fonts';

export const LaunchDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ==========================================
  // PHYSICAL CAMERA & SCENE TIMING
  // ==========================================

  // Scene 1: Coach OS Dolly Zoom into Evaluation (frames 30 - 95)
  const coachZoom = interpolate(
    frame,
    [30, 95],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const scene1Scale = interpolate(coachZoom, [0, 1], [0.94, 1.12]);
  const scene1RotX = interpolate(coachZoom, [0, 1], [8, 2]);
  const scene1RotY = interpolate(coachZoom, [0, 1], [-6, -1]);
  const scene1TransY = interpolate(coachZoom, [0, 1], [0, 24]);

  // Click timing on Coach OS button (Frame 162)
  const isButtonClickState = frame >= 161 && frame <= 168;

  // Scene 2 -> Scene 3: Clean Horizontal 3D Slide Transition (frames 165 - 205)
  const slideProgress = interpolate(
    frame,
    [165, 205],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Scene 3: Speaker Chamber Zoom (frames 215 - 280)
  const speakerZoom = interpolate(
    frame,
    [215, 275],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const scene2Scale = interpolate(speakerZoom, [0, 1], [1.02, 1.14]);

  // Scene 4: Dual Isometric View (frames 300 - 340)
  const dualProgress = interpolate(
    frame,
    [300, 340],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Cards Layer Clean Fade-Out before Outro (frames 375 - 395)
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

  // Scene 5: Outro Fade-in (frames 390 - 418)
  const outroProgress = interpolate(
    frame,
    [390, 418],
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

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#020617',
        color: '#F8FAFC',
        overflow: 'hidden',
        fontFamily: `${FONT_SANS}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
      }}
    >
      {/* 1. Dynamic 3D Perspective Background Grid with Ambient Lighting */}
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
              PAN-AFRICAN FORENSICS & COACHING PLATFORM
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
            {frame < 165
              ? 'STAGE 01 // COACH OS COMMAND CENTER'
              : frame < 305
              ? 'STAGE 02 // SPEAKER REHEARSAL CHAMBER'
              : 'STAGE 03 // SYNCHRONIZED ARCHITECTURE'}
          </span>
        </div>
      </div>

      {/* 3. 3D Spatial Canvas for Portals */}
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
          {/* SINGLE VIEW MODE (Frames 0 - 305) */}
          {dualProgress === 0 && (
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
              {/* COACH OS CARD (Slides out to the left on click) */}
              {slideProgress < 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `
                      translate(-50%, -50%)
                      translateX(${interpolate(slideProgress, [0, 1], [0, -1500])}px)
                      translateY(${scene1TransY}px)
                      scale(${scene1Scale})
                      rotateX(${scene1RotX}deg)
                      rotateY(${interpolate(slideProgress, [0, 1], [scene1RotY, -24])}deg)
                    `,
                    opacity: interpolate(slideProgress, [0, 0.7, 1], [1, 0.5, 0]),
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <CoachOSCard
                    revealFrame={5}
                    highlightEvaluation={frame > 40}
                    isPressed={isButtonClickState}
                  />
                </div>
              )}

              {/* SPEAKER PORTAL CARD (Slides in from the right) */}
              {slideProgress > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `
                      translate(-50%, -50%)
                      translateX(${interpolate(slideProgress, [0, 1], [1500, 0])}px)
                      translateY(20px)
                      scale(${scene2Scale})
                      rotateX(3deg)
                      rotateY(${interpolate(slideProgress, [0, 1], [24, -1])}deg)
                    `,
                    opacity: interpolate(slideProgress, [0, 0.3, 1], [0, 0.6, 1]),
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <SpeakerPortalCard revealFrame={165} />
                </div>
              )}
            </div>
          )}

          {/* DUAL VIEW MODE (Frames 300 - 380): Side-by-Side 3D Isometric Keynote Stage */}
          {dualProgress > 0 && (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transformStyle: 'preserve-3d',
                transform: `
                  scale(${interpolate(dualProgress, [0, 1], [1, 0.96])})
                  rotateX(${interpolate(dualProgress, [0, 1], [3, 6])}deg)
                `,
              }}
            >
              {/* Left: Coach OS Card (Smoothly glides from left to X=460px with scale 0.64) */}
              <div
                style={{
                  position: 'absolute',
                  left: interpolate(dualProgress, [0, 1], [-400, 460]),
                  top: '50%',
                  transform: `
                    translate(-50%, -50%)
                    scale(0.64)
                    rotateY(${interpolate(dualProgress, [0, 1], [0, 15])}deg)
                  `,
                  opacity: interpolate(dualProgress, [0, 0.35, 1], [0, 0.5, 1]),
                  transformStyle: 'preserve-3d',
                }}
              >
                <CoachOSCard revealFrame={0} highlightEvaluation={true} />
              </div>

              {/* Central Telemetry Stream */}
              <DataStreamSync revealFrame={315} />

              {/* Right: Speaker Portal Card (Smoothly glides from center 960 to 1460px with scale 0.64) */}
              <div
                style={{
                  position: 'absolute',
                  left: interpolate(dualProgress, [0, 1], [960, 1460]),
                  top: '50%',
                  transform: `
                    translate(-50%, -50%)
                    scale(${interpolate(dualProgress, [0, 1], [1.14, 0.64])})
                    rotateY(${interpolate(dualProgress, [0, 1], [0, -15])}deg)
                  `,
                  transformStyle: 'preserve-3d',
                }}
              >
                <SpeakerPortalCard revealFrame={0} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Realistic Cursor Click Choreography (Frames 122 - 180) */}
      <CursorClick
        startFrame={122}
        clickFrame={162}
        startX={540}
        startY={660}
        targetX={1300}
        targetY={505}
        label="CLICK // SWITCH PORTAL"
      />

      {/* 5. Apple/Stripe-Style Grand Editorial Outro (Frames 390 - 450) */}
      {outroProgress > 0 && (
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#020617',
            opacity: outroProgress,
            transform: `scale(${interpolate(outroProgress, [0, 1], [0.93, 1])})`,
            zIndex: 200,
          }}
        >
          {/* Subtle Ambient Radial Gold Glow behind Logo */}
          <div
            style={{
              position: 'absolute',
              width: 600,
              height: 600,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(200, 150, 48, 0.22) 0%, transparent 68%)',
              pointerEvents: 'none',
            }}
          />

          {/* Luxury Brand Crest */}
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #FDE68A 0%, #C89630 50%, #92400E 100%)',
              color: '#070C18',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontWeight: 900,
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
              fontSize: 52,
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
            Words Shape Nations.<br />
            <span style={{ color: '#E3B95C', fontStyle: 'italic', fontWeight: 400 }}>
              Silence Breaks Them.
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
              COACH OS // REHEARSAL CHAMBER // PAN-AFRICAN FORENSICS
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
            GLOBALORATORSPROJECT.COM
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
