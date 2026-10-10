import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONT_SANS, FONT_SERIF, FONT_MONO } from '../fonts';

interface CoachOSCardProps {
  revealFrame?: number;
  highlightEvaluation?: boolean;
  isPressed?: boolean;
}

export const CoachOSCard: React.FC<CoachOSCardProps> = ({
  revealFrame = 10,
  highlightEvaluation = true,
  isPressed = false,
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

  // Rubric animation progress
  const rubricProgress = interpolate(
    frame,
    [revealFrame + 20, revealFrame + 65],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const argScore = (rubricProgress * 9.4).toFixed(1);
  const refScore = (rubricProgress * 9.1).toFixed(1);
  const poiseScore = (rubricProgress * 9.6).toFixed(1);
  const poiScore = (rubricProgress * 8.9).toFixed(1);

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
            GOP COACH OS // COMMAND PORTAL
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              backgroundColor: 'rgba(200, 150, 48, 0.16)',
              border: '1px solid rgba(200, 150, 48, 0.4)',
              color: '#E3B95C',
              fontSize: 10,
              fontFamily: `${FONT_MONO}, monospace`,
              fontWeight: 800,
              letterSpacing: '0.12em',
            }}
          >
            LIVE FACULTY STREAM
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ padding: '26px 30px' }}>
        {/* Metric Cards Top Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 24 }}>
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#0B1222',
              backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 100%)',
              borderRadius: 12,
              border: '1px solid rgba(51, 65, 85, 0.45)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#94A3B8', letterSpacing: '0.12em', fontWeight: 600 }}>
              TOURNAMENT SQUADS
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#F8FAFC', marginTop: 4, letterSpacing: '-0.02em' }}>16 Delegations</div>
            <div style={{ fontSize: 11, color: '#10B981', marginTop: 3, fontWeight: 600 }}>PAUDC & WUDC Ready</div>
          </div>
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#0B1222',
              backgroundImage: 'linear-gradient(180deg, rgba(200, 150, 48, 0.06) 0%, rgba(255, 255, 255, 0) 100%)',
              borderRadius: 12,
              border: '1px solid rgba(200, 150, 48, 0.4)',
              boxShadow: 'inset 0 1px 0 rgba(200, 150, 48, 0.15)',
            }}
          >
            <div style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#E3B95C', letterSpacing: '0.12em', fontWeight: 700 }}>
              CHAMPIONSHIP BENCHMARK
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#E3B95C', marginTop: 4, letterSpacing: '-0.02em' }}>94.8%</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>Breakthrough Velocity</div>
          </div>
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#0B1222',
              backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 100%)',
              borderRadius: 12,
              border: '1px solid rgba(51, 65, 85, 0.45)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#94A3B8', letterSpacing: '0.12em', fontWeight: 600 }}>
              ACTIVE VARSITY SPEAKERS
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#F8FAFC', marginTop: 4, letterSpacing: '-0.02em' }}>1,450+</div>
            <div style={{ fontSize: 11, color: '#38BDF8', marginTop: 3, fontWeight: 600 }}>Kenya • SA • Ghana • Uganda</div>
          </div>
        </div>

        {/* Feature Spotlight: Live Evaluation Rubric */}
        <div
          style={{
            padding: '22px 26px',
            backgroundColor: '#090F1E',
            borderRadius: 16,
            border: highlightEvaluation ? '1px solid rgba(200, 150, 48, 0.65)' : '1px solid rgba(51, 65, 85, 0.4)',
            boxShadow: highlightEvaluation ? '0 0 35px rgba(200, 150, 48, 0.16), inset 0 1px 0 rgba(200, 150, 48, 0.2)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#C89630', letterSpacing: '0.15em', fontWeight: 800 }}>
                PARLIAMENTARY FORENSICS RUBRIC
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#F8FAFC', marginTop: 3, letterSpacing: '-0.01em' }}>
                Valerie Wanjiku — Prime Minister Opening Rebuttal
              </div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>
                Motion: "This House Would Decolonize Pan-African Curricula"
              </div>
            </div>
            <div
              id="switch-portal-btn"
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                backgroundColor: isPressed ? '#E3B95C' : '#C89630',
                color: '#070C18',
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '0.08em',
                fontFamily: `${FONT_MONO}, monospace`,
                boxShadow: isPressed ? '0 0 25px rgba(227, 185, 92, 0.8)' : '0 4px 18px rgba(200, 150, 48, 0.45)',
                transform: isPressed ? 'scale(0.95)' : 'scale(1)',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
              }}
            >
              SWITCH TO SPEAKER CHAMBER →
            </div>
          </div>

          {/* Rubric Scoring Bars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
            {/* 1. Argumentation */}
            <div style={{ backgroundColor: '#070B16', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(51, 65, 85, 0.45)', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#E2E8F0', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>Argumentation & Burden of Proof</span>
                <span style={{ fontWeight: 800, color: '#E3B95C', fontFamily: `${FONT_MONO}, monospace` }}>{argScore} / 10</span>
              </div>
              <div style={{ height: 6, backgroundColor: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${rubricProgress * 94}%`,
                    backgroundColor: '#C89630',
                    borderRadius: 3,
                    boxShadow: '0 0 10px rgba(200, 150, 48, 0.7)',
                  }}
                />
              </div>
            </div>

            {/* 2. Refutation */}
            <div style={{ backgroundColor: '#070B16', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(51, 65, 85, 0.45)', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#E2E8F0', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>Refutation & Rebuttal Dynamics</span>
                <span style={{ fontWeight: 800, color: '#E3B95C', fontFamily: `${FONT_MONO}, monospace` }}>{refScore} / 10</span>
              </div>
              <div style={{ height: 6, backgroundColor: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${rubricProgress * 91}%`,
                    backgroundColor: '#C89630',
                    borderRadius: 3,
                    boxShadow: '0 0 10px rgba(200, 150, 48, 0.7)',
                  }}
                />
              </div>
            </div>

            {/* 3. Rhetorical Poise */}
            <div style={{ backgroundColor: '#070B16', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(51, 65, 85, 0.45)', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#E2E8F0', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>Rhetorical Poise & Cadence</span>
                <span style={{ fontWeight: 800, color: '#E3B95C', fontFamily: `${FONT_MONO}, monospace` }}>{poiseScore} / 10</span>
              </div>
              <div style={{ height: 6, backgroundColor: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${rubricProgress * 96}%`,
                    backgroundColor: '#10B981',
                    borderRadius: 3,
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.7)',
                  }}
                />
              </div>
            </div>

            {/* 4. POI Management */}
            <div style={{ backgroundColor: '#070B16', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(51, 65, 85, 0.45)', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#E2E8F0', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>Points of Information (POI) Handling</span>
                <span style={{ fontWeight: 800, color: '#E3B95C', fontFamily: `${FONT_MONO}, monospace` }}>{poiScore} / 10</span>
              </div>
              <div style={{ height: 6, backgroundColor: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${rubricProgress * 89}%`,
                    backgroundColor: '#C89630',
                    borderRadius: 3,
                    boxShadow: '0 0 10px rgba(200, 150, 48, 0.7)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Coach Notes */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#050811',
              borderRadius: 10,
              border: '1px solid rgba(200, 150, 48, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: '#C89630',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 13,
                fontFamily: `${FONT_MONO}, monospace`,
                color: '#070C18',
                flexShrink: 0,
              }}
            >
              VJ
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: `${FONT_MONO}, monospace`, color: '#E3B95C', letterSpacing: '0.1em', fontWeight: 800 }}>
                HEAD COACH DISPATCH // JEFF & VALERIE
              </div>
              <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 2, fontStyle: 'italic' }}>
                "Exceptional clarity on first speaker clash. Stance is commanding under opposition cross-examination."
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
