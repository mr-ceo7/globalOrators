import { describe, test, expect } from 'vitest';
import { resolveSpeakerCurriculum } from '../utils/curriculumResolver';
import { SpeakerOnboardingData } from '../types';

describe('Speaker Curriculum Dynamic Resolver Tests', () => {
  test('should return honest Awaiting Faculty Allocation when no curriculum is assigned (Academy)', () => {
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

    const result = resolveSpeakerCurriculum(profile, null, 'Coach Arthur Vance');
    expect(result.isAssignedByCoach).toBe(false);
    expect(result.statusLabel).toBe('Awaiting Faculty Allocation');
    expect(result.syllabusKicker).toBe('Academy Track · Intake Completed');
    expect(result.title).toBe('Awaiting Faculty Curriculum Allocation');
    expect(result.disciplineLabel).toBe('Decolonial Parliamentary Forensics');
    expect(result.focusLabel).toBe('Ideological Rigor & Rebuttal Depth');
    expect(result.drillTitle).toBe('Curriculum Allocation Pending');
    expect(result.drillCategory).toBe('Faculty Allocation • In Review');
    expect(result.drillPrompt).toContain('No active drills assigned yet');
    expect(result.description).toContain('Coach Arthur Vance');
    expect(result.sessionTitle).toBe('Intake Review with Coach Arthur Vance');
  });

  test('should return honest Awaiting Faculty Allocation for Foundation scholars', () => {
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
    expect(result.isAssignedByCoach).toBe(false);
    expect(result.statusLabel).toBe('Awaiting Faculty Allocation');
    expect(result.syllabusKicker).toBe('Foundation Track · Intake Completed');
    expect(result.title).toBe('Awaiting Faculty Curriculum Allocation');
    expect(result.disciplineLabel).toBe('Pacing Control & Somatic Grounding');
    expect(result.focusLabel).toBe('Dysfluency Acceptance & Vocal Ease');
    expect(result.drillTitle).toBe('Curriculum Allocation Pending');
    expect(result.sessionTitle).toBe('Intake Review with Faculty Coach');
  });

  test('should clean custom write-in objective labels gracefully when unassigned', () => {
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
    expect(result.isAssignedByCoach).toBe(false);
    expect(result.disciplineLabel).toBe('Multilateral Diplomatic Protocol');
    expect(result.focusLabel).toBe('High-Stakes Treaty Negotiations');
    expect(result.statusLabel).toBe('Awaiting Faculty Allocation');
  });

  test('should prioritize database TrainingProgram as single source of truth when supplied', () => {
    const profile: SpeakerOnboardingData = {
      branch: 'Academy',
      fullName: 'Kassim Musa',
      email: 'kassim@example.com',
      missionFocus: '',
      speakingGoal: 'Competitive Debate',
      experienceLevel: 'Novice Speaker',
      vocalBaselinePace: 140,
      emotionalOpennessRating: 8,
      selectedHabits: []
    };

    const mockProgram: any = {
      id: 'prog-101',
      title: 'Global Orators Executive Masterclass',
      subtitle: 'Coach Custom Syllabus',
      description: 'Handcrafted by Coach Arthur Vance for board leadership.',
      difficulty: 'Advanced',
      goal: 'Executive & Board Pitching',
      durationWeeks: 12,
      daysPerWeek: 3,
      days: [
        {
          id: 'day-1',
          dayNumber: 1,
          name: 'Day 1: Boardroom Gravitas',
          focus: 'Executive Cadence & Vocal Dominance',
          estimatedDurationMin: 60,
          assignmentNotes: 'Record a 90-second CEO opening address.',
          exercises: [
            {
              id: 'ex-1',
              exerciseId: 'drill-1',
              exerciseName: 'Rapid Rebuttal Crucible',
              primaryMuscle: 'Executive Pitching',
              coachNotes: 'Hold silence for 3 full seconds before countering.',
              sets: []
            }
          ]
        }
      ]
    };

    const result = resolveSpeakerCurriculum(profile, mockProgram);
    expect(result.syllabusKicker).toBe('Coach Custom Syllabus');
    expect(result.title).toBe('Global Orators Executive Masterclass');
    expect(result.description).toBe('Handcrafted by Coach Arthur Vance for board leadership.');
    expect(result.drillTitle).toBe('Rapid Rebuttal Crucible');
    expect(result.drillPrompt).toBe('Hold silence for 3 full seconds before countering.');
    expect(result.sessionTitle).toBe('Session: Day 1: Boardroom Gravitas');
    expect(result.sessionDescription).toBe('Executive Cadence & Vocal Dominance');
    expect(result.isAssignedByCoach).toBe(true);
    expect(result.statusLabel).toBe('Active Assigned Syllabus');
  });
});
