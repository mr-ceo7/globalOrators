import { describe, test, expect } from 'vitest';
import { resolveSpeakerCurriculum } from '../utils/curriculumResolver';
import { SpeakerOnboardingData } from '../types';

describe('Speaker Curriculum Dynamic Resolver Tests', () => {
  test('should resolve Pan-African Debate curriculum for Kassim Musa', () => {
    const profile: SpeakerOnboardingData = {
      branch: 'Academy',
      fullName: 'KASSIM MUSA',
      email: 'kassimmusa322@gmail.com',
      institution: 'Maseno University',
      primaryDiscipline: 'Decolonial Parliamentary Forensics',
      coreFocus: 'Ideological Rigor & Rebuttal Depth',
      missionFocus: 'Pan-African Leadership & Cognitive Deconditioning',
      speakingGoal: 'Competitive Debate',
      experienceLevel: 'Novice Speaker',
      vocalBaselinePace: 140,
      emotionalOpennessRating: 8,
      selectedHabits: ['Vocal Hydration (2.5L + Warm Lemon Water)']
    };

    const result = resolveSpeakerCurriculum(profile);
    expect(result.syllabusKicker).toBe('Tournament & Leadership Syllabus');
    expect(result.title).toBe('Championship Debate & Pan-African Leadership');
    expect(result.disciplineLabel).toBe('Decolonial Parliamentary Forensics');
    expect(result.focusLabel).toBe('Ideological Rigor & Rebuttal Depth');
    expect(result.drillTitle).toContain('Adversarial Rebuttal Sprint');
    expect(result.drillCategory).toContain('Motion Rebuttal');
    expect(result.drillPrompt).toContain('African youth must migrate');
  });

  test('should resolve Executive Pitching curriculum for business leaders', () => {
    const profile: SpeakerOnboardingData = {
      branch: 'Academy',
      fullName: 'Amina Kimani',
      email: 'amina@venture.org',
      institution: 'Nairobi Tech Hub',
      primaryDiscipline: 'Executive Investor Pitch',
      coreFocus: 'High-Stakes Persuasion & Presence',
      missionFocus: 'Executive Pitching & High-Stakes Storytelling',
      speakingGoal: 'Executive & Board Pitching',
      experienceLevel: 'Varsity / Advanced',
      vocalBaselinePace: 145,
      emotionalOpennessRating: 7,
      selectedHabits: []
    };

    const result = resolveSpeakerCurriculum(profile);
    expect(result.syllabusKicker).toBe('Executive Thought Leadership Syllabus');
    expect(result.title).toBe('Executive Investor Pitch: High-Stakes Persuasion & Presence');
    expect(result.drillTitle).toBe('High-Stakes Persuasion & Presence: The 60-Second Venture Genesis');
    expect(result.drillCategory).toBe('Executive Pitching • Narrative Delivery');
    expect(result.drillPrompt).toContain('venture\'s founding conviction');
    expect(result.sessionTitle).toContain('Venture Narrative');
  });

  test('should resolve Stutter & Anxiety transformation curriculum for Foundation scholars', () => {
    const profile: SpeakerOnboardingData = {
      branch: 'Foundation',
      fullName: 'Tariq Osei',
      email: 'tariq@gmail.com',
      institution: 'Independent Orator',
      primaryDiscipline: 'Pacing Control & Somatic Grounding',
      coreFocus: 'Dysfluency Acceptance & Vocal Ease',
      missionFocus: 'Transforming Stutter & Speech Anxiety',
      speakingGoal: 'Cathartic Expression & Healing',
      experienceLevel: 'Novice Speaker',
      vocalBaselinePace: 125,
      emotionalOpennessRating: 9,
      selectedHabits: []
    };

    const result = resolveSpeakerCurriculum(profile);
    expect(result.syllabusKicker).toBe('Fluency Liberation & Pacing Fellowship');
    expect(result.title).toBe('Pacing Control & Somatic Grounding: Dysfluency Acceptance & Vocal Ease');
    expect(result.drillTitle).toContain('Breath Pause & Soft Articulation');
    expect(result.drillCategory).toBe('Fluency Recovery • Somatic Pacing');
    expect(result.drillPrompt).toContain('125 WPM');
    expect(result.workshopTitle).toBe('Foundation Pacing & Vocal Liberation Circle');
  });

  test('should resolve custom write-in objective gracefully', () => {
    const profile: SpeakerOnboardingData = {
      branch: 'Academy',
      fullName: 'Farah Nour',
      email: 'farah@climate.org',
      institution: 'UN Environmental Assembly',
      primaryDiscipline: 'Other: Multilateral Diplomatic Protocol',
      coreFocus: 'Other: High-Stakes Treaty Negotiations',
      missionFocus: 'Other: Pan-African Climate Justice Advocacy',
      speakingGoal: 'Trauma Storytelling & Advocacy',
      experienceLevel: 'Master Orator',
      vocalBaselinePace: 150,
      emotionalOpennessRating: 8,
      selectedHabits: []
    };

    const result = resolveSpeakerCurriculum(profile);
    expect(result.syllabusKicker).toBe('Custom Tournament & Leadership Syllabus');
    expect(result.title).toBe('Pan-African Climate Justice Advocacy: High-Stakes Treaty Negotiations');
    expect(result.disciplineLabel).toBe('Multilateral Diplomatic Protocol');
    expect(result.focusLabel).toBe('High-Stakes Treaty Negotiations');
    expect(result.description).toContain('UN Environmental Assembly');
    expect(result.drillPrompt).toContain('Pan-African Climate Justice Advocacy');
  });
});
