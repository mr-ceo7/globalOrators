import { SpeakerOnboardingData, TrainingProgram } from '../types';

export interface ResolvedCurriculum {
  syllabusKicker: string;
  title: string;
  description: string;
  disciplineLabel: string;
  focusLabel: string;
  drillTitle: string;
  drillCategory: string;
  drillPrompt: string;
  sessionTitle: string;
  sessionDescription: string;
  workshopTitle: string;
  workshopDescription: string;
  isAssignedByCoach: boolean;
  statusLabel: string;
}

const cleanString = (val?: string): string => {
  if (!val) return '';
  if (val.startsWith('Other:')) {
    return val.replace(/^Other:\s*/, '').trim();
  }
  return val.trim();
};

export const formatCoachReviewer = (coachName?: string): string => {
  if (!coachName || coachName === 'Faculty Coaching Desk') {
    return 'the Global Orators faculty desk';
  }
  const trimmed = coachName.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('coach') || lower.startsWith('head coach') || lower.startsWith('dr.') || lower.startsWith('prof.')) {
    return trimmed;
  }
  return `your faculty coach, ${trimmed}`;
};

export const resolveSpeakerCurriculum = (
  profile: SpeakerOnboardingData, 
  program?: TrainingProgram | null,
  assignedCoachName?: string
): ResolvedCurriculum => {
  // 0. Single Source of Truth: If database program exists with configured curriculum data, use it directly
  if (program && program.title) {
    const firstDay = program.days?.[0];
    const firstExercise = firstDay?.exercises?.[0];
    const disciplineLabel = program.goal || (profile.branch === 'Academy' ? 'Championship Oratory' : 'Cathartic Voice');
    const focusLabel = firstDay?.focus || firstDay?.name || program.difficulty || 'Core Training Module';
    const drillTitle = firstExercise?.exerciseName || (firstDay ? `${firstDay.name} Drill` : `${program.title} Drill`);
    const drillCategory = firstExercise?.primaryMuscle || `${program.goal || 'Executive Oratory'} • Protocol`;
    const drillPrompt = firstExercise?.coachNotes || (firstDay?.assignmentNotes ? `"${firstDay.assignmentNotes}"` : (firstDay?.focus ? `"${firstDay.focus}"` : `"Execute today's assigned drills from ${program.title}."`));

    return {
      syllabusKicker: program.subtitle || (profile.branch === 'Academy' ? 'Academy Curriculum' : 'Foundation Curriculum'),
      title: program.title,
      description: program.description || `Training curriculum assigned to ${profile.fullName}.`,
      disciplineLabel,
      focusLabel,
      drillTitle,
      drillCategory,
      drillPrompt,
      sessionTitle: firstDay ? `Session: ${firstDay.name}` : `Curriculum Review: ${program.title}`,
      sessionDescription: firstDay?.focus || `${program.durationWeeks || 8}-week structured regimen`,
      workshopTitle: `${program.title} Cohort Workshop`,
      workshopDescription: `Interactive rehearsal and masterclass based on ${program.title}.`,
      isAssignedByCoach: true,
      statusLabel: 'Active Assigned Syllabus'
    };
  }

  // When no curriculum has been assigned by coach: show honest pending state, zero fake preview
  const isAcademy = profile.branch === 'Academy';
  const rawDiscipline = cleanString(profile.primaryDiscipline);
  const rawFocus = cleanString(profile.coreFocus);
  const coachStr = assignedCoachName ? `with ${assignedCoachName}` : 'with Faculty Coach';

  const disciplineLabel = rawDiscipline || (isAcademy ? 'Championship Debate & Forensics' : 'Healing-Centered Voice');
  const focusLabel = rawFocus || 'Foundational Technical Oratory';

  return {
    syllabusKicker: isAcademy ? 'Academy Track · Intake Completed' : 'Foundation Track · Intake Completed',
    title: 'Awaiting Faculty Curriculum Allocation',
    description: `Your intake profile is currently under review by ${formatCoachReviewer(assignedCoachName)}. Once your customized training syllabus is allocated, your scheduled rehearsal rounds and floor drills will appear here.`,
    disciplineLabel,
    focusLabel,
    drillTitle: 'Curriculum Allocation Pending',
    drillCategory: 'Faculty Allocation • In Review',
    drillPrompt: 'No active drills assigned yet. Your faculty coach will schedule your initial diagnostic rehearsal and structured exercises once your curriculum is confirmed.',
    sessionTitle: `Intake Review ${coachStr}`,
    sessionDescription: 'Curriculum & Rehearsal Schedule Allocation',
    workshopTitle: isAcademy ? 'Academy Forensics Workshop' : 'Voice Sovereignty Workshop',
    workshopDescription: 'Cohort Masterclass & Live Rehearsal Sessions',
    isAssignedByCoach: false,
    statusLabel: 'Awaiting Faculty Allocation'
  };
};
