import { describe, it, expect } from 'vitest';
import { getStep3Config } from '../components/onboarding/OnboardingFlow';

describe('OnboardingFlow Step 3 Dynamic Personalization Profiles', () => {
  describe('Academy Track', () => {
    it('calibrates for Competitive Parliamentary Debate correctly', () => {
      const config = getStep3Config('Academy', 'Competitive Parliamentary Debate (BP / Worlds Format)');
      expect(config.title).toBe('Competitive Forensics Baseline');
      expect(config.badge).toContain('Tournament Forensics Calibration');
      expect(config.institutionLabel).toBe('University / Debate Society / School');
      expect(config.formats.map(f => f.id)).toContain('British Parliamentary (BP)');
      expect(config.formats.map(f => f.id)).toContain('World Schools Debating (WSDC)');
      expect(config.priorities.map(p => p.id)).toContain('Argumentation & Rebuttal Depth');
      expect(config.priorities.map(p => p.id)).toContain('Motion Analysis & Strategic POIs');
      expect(config.cadenceDefault).toBe(165);
      expect(config.cadenceMin).toBe(120);
      expect(config.cadenceMax).toBe(185);
    });

    it('calibrates for Pan-African Leadership correctly', () => {
      const config = getStep3Config('Academy', 'Pan-African Leadership & Cognitive Deconditioning');
      expect(config.title).toBe('Sovereign Rhetoric & Leadership Baseline');
      expect(config.badge).toContain('Sovereign Leadership Calibration');
      expect(config.institutionLabel).toBe('Movement / Institution / Organization');
      expect(config.formats.map(f => f.id)).toContain('Decolonial Parliamentary Rhetoric');
      expect(config.formats.map(f => f.id)).toContain('Public Intellectual Manifesto');
      expect(config.priorities.map(p => p.id)).toContain('Ideological Rigor & Historical Framing');
      expect(config.priorities.map(p => p.id)).toContain('Commanding Presence & Gravitas');
      expect(config.cadenceDefault).toBe(140);
    });

    it('calibrates for Executive & Investor Boardroom Pitching correctly', () => {
      const config = getStep3Config('Academy', 'Executive & Investor Boardroom Pitching');
      expect(config.title).toBe('Executive & Capital Pitch Baseline');
      expect(config.badge).toContain('Executive Voice Calibration');
      expect(config.institutionLabel).toBe('Company / Venture / Incubator');
      expect(config.formats.map(f => f.id)).toContain('VC Investment Pitch (Seed/Series A)');
      expect(config.formats.map(f => f.id)).toContain('Executive Boardroom Defense');
      expect(config.priorities.map(p => p.id)).toContain('Concise Metric Defensibility');
      expect(config.priorities.map(p => p.id)).toContain('Objection Handling Under Fire');
      expect(config.cadenceDefault).toBe(145);
    });

    it('calibrates for Keynote & Main Stage Conference Oratory correctly', () => {
      const config = getStep3Config('Academy', 'Keynote & Main Stage Conference Oratory');
      expect(config.title).toBe('Main Stage & Keynote Baseline');
      expect(config.badge).toContain('Keynote Orator Calibration');
      expect(config.institutionLabel).toBe('Speaking Agency / Forum / Industry');
      expect(config.formats.map(f => f.id)).toContain('Auditorium Keynote Address');
      expect(config.formats.map(f => f.id)).toContain('TED-Style Provocation (12-Min)');
      expect(config.priorities.map(p => p.id)).toContain('Spatial Staging & Anchoring');
      expect(config.priorities.map(p => p.id)).toContain('Teleprompter & Podium Poise');
      expect(config.cadenceDefault).toBe(140);
    });
  });

  describe('Foundation Track', () => {
    it('calibrates for Escapism & Emotional Catharsis correctly', () => {
      const config = getStep3Config('Foundation', 'Speaking as a Form of Escapism & Emotional Catharsis');
      expect(config.title).toBe('Cathartic & Emotional Baseline');
      expect(config.badge).toContain('Therapeutic Voice Sanctuary');
      expect(config.institutionLabel).toBe("Community / Children's Home / Self-Nominated");
      expect(config.formats.map(f => f.id)).toContain('Private Audio Vault Catharsis');
      expect(config.formats.map(f => f.id)).toContain('Intimate Circle Sanctuary');
      expect(config.priorities.map(p => p.id)).toContain('Fearless Emotional Release');
      expect(config.priorities.map(p => p.id)).toContain('Diaphragmatic Grounding');
      expect(config.cadenceDefault).toBe(130);
    });

    it('calibrates for Breaking Patriarchal & Generational Silence correctly', () => {
      const config = getStep3Config('Foundation', 'Breaking Patriarchal & Generational Silence');
      expect(config.title).toBe('Sovereign Voice Reclamation Baseline');
      expect(config.badge).toContain('Voice Reclamation Calibration');
      expect(config.institutionLabel).toBe('Family / Community Group / Fellowship');
      expect(config.formats.map(f => f.id)).toContain('Assertive Boundary Voice');
      expect(config.formats.map(f => f.id)).toContain('Sovereign Voice Reclamation');
      expect(config.priorities.map(p => p.id)).toContain('Firm Non-Violent Assertion');
      expect(config.priorities.map(p => p.id)).toContain('Overcoming Disapproval Panic');
      expect(config.cadenceDefault).toBe(135);
    });

    it('calibrates for Trauma-to-Advocacy Voice Discovery correctly', () => {
      const config = getStep3Config('Foundation', 'Trauma-to-Advocacy Voice Discovery');
      expect(config.title).toBe('Trauma-to-Advocacy Baseline');
      expect(config.badge).toContain('Advocacy Voice Calibration');
      expect(config.institutionLabel).toBe("Advocacy Alliance / Children's Home / Center");
      expect(config.formats.map(f => f.id)).toContain('Ethical Lived-Experience Storytelling');
      expect(config.formats.map(f => f.id)).toContain('Child Protection & Rights Advocacy');
      expect(config.priorities.map(p => p.id)).toContain('Safe Narrative Boundaries');
      expect(config.priorities.map(p => p.id)).toContain('Translating Truth to Policy Action');
      expect(config.cadenceDefault).toBe(135);
    });

    it('calibrates for Conquering Social Anxiety & Speech Isolation correctly', () => {
      const config = getStep3Config('Foundation', 'Conquering Social Anxiety & Speech Isolation');
      expect(config.title).toBe('Confidence & Social Baseline');
      expect(config.badge).toContain('Anxiety Desensitization Calibration');
      expect(config.institutionLabel).toBe('School / University / Workplace');
      expect(config.formats.map(f => f.id)).toContain('Low-Stakes Micro-Speaking (30-Sec)');
      expect(config.formats.map(f => f.id)).toContain('Somatic Body & Throat Reset');
      expect(config.priorities.map(p => p.id)).toContain('Dissolving Throat Tightness');
      expect(config.priorities.map(p => p.id)).toContain('Overcoming Judgment Panic');
      expect(config.cadenceDefault).toBe(125);
    });
  });
});
