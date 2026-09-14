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
}

const cleanString = (val?: string): string => {
  if (!val) return '';
  if (val.startsWith('Other:')) {
    return val.replace(/^Other:\s*/, '').trim();
  }
  return val.trim();
};

export const resolveSpeakerCurriculum = (
  profile: SpeakerOnboardingData, 
  program?: TrainingProgram | null
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
      workshopDescription: `Interactive rehearsal and masterclass based on ${program.title}.`
    };
  }

  const isAcademy = profile.branch === 'Academy';
  const mission = (profile.missionFocus || '').toLowerCase();
  const rawMission = cleanString(profile.missionFocus);
  const discipline = (profile.primaryDiscipline || '').toLowerCase();
  const rawDiscipline = cleanString(profile.primaryDiscipline);
  const focus = (profile.coreFocus || '').toLowerCase();
  const rawFocus = cleanString(profile.coreFocus);
  const inst = profile.institution ? profile.institution.trim() : '';

  // 1. Explicit Custom / Other Goal (Takes precedence when user entered custom write-in)
  if (profile.missionFocus && profile.missionFocus.startsWith('Other:') && rawMission) {
    const disciplineLabel = rawDiscipline || (isAcademy ? 'Custom Forensics Arena' : 'Custom Healing Sanctuary');
    const focusLabel = rawFocus || 'Targeted Technical Priority';
    return {
      syllabusKicker: isAcademy ? 'Custom Tournament & Leadership Syllabus' : 'Custom Catharsis & Voice Fellowship',
      title: `${rawMission}: ${focusLabel}`,
      description: `Personalized orator protocol designed for ${profile.fullName}${inst ? ` from ${inst}` : ''}, specializing in ${disciplineLabel} with an emphasis on ${focusLabel}.`,
      disciplineLabel,
      focusLabel,
      drillTitle: `${focusLabel}: Bespoke Rehearsal Sprint`,
      drillCategory: 'Personalized Protocol • Core Objective',
      drillPrompt: `"Address your bespoke objective: '${rawMission}'. Ground your vocal delivery at ${profile.vocalBaselinePace || 140} WPM and articulate your points with uncompromising moral clarity."`,
      sessionTitle: '1-on-1 Personalized Coaching Consultation with Coach Qassim',
      sessionDescription: 'Custom Objective Delivery & Diagnostic Feedback',
      workshopTitle: isAcademy ? 'Advanced Parliamentary & Leadership Workshop' : 'Fellowship Voice & Expression Workshop',
      workshopDescription: 'Tailored Cohort Rehearsal Session'
    };
  }

  // 2. Executive Pitching & Venture Storytelling
  if (
    mission.includes('pitch') || 
    mission.includes('executive') || 
    discipline.includes('pitch') || 
    discipline.includes('keynote') ||
    discipline.includes('investor')
  ) {
    const disciplineLabel = rawDiscipline || 'Executive Investor Pitch';
    const focusLabel = rawFocus || 'High-Stakes Persuasion & Presence';
    return {
      syllabusKicker: 'Executive Thought Leadership Syllabus',
      title: `${disciplineLabel}: ${focusLabel}`,
      description: `Commanding boardrooms, investor syndicates, and keynote stages through compelling narrative tension, unshakeable composure, and memorable calls to action.`,
      disciplineLabel,
      focusLabel,
      drillTitle: `${focusLabel}: The 60-Second Venture Genesis`,
      drillCategory: 'Executive Pitching • Narrative Delivery',
      drillPrompt: `"Deliver your venture's founding conviction in 60 seconds without filler words. State the systemic breakdown, your proprietary paradigm shift, and the urgent economic imperative."`,
      sessionTitle: '1-on-1 Venture Narrative & Delivery Review with Coach Qassim',
      sessionDescription: 'Pitch Deck Vocal Pacing & Executive Hook Review',
      workshopTitle: 'High-Stakes Executive Mock Pitch & Q&A Grilling',
      workshopDescription: 'Simulated Investor Boardroom Presentation'
    };
  }

  // 3. Youth Parliamentary Leadership & Civic Advocacy
  if (
    mission.includes('youth') || 
    mission.includes('civic') || 
    mission.includes('advocacy') ||
    discipline.includes('policy')
  ) {
    const disciplineLabel = rawDiscipline || 'Parliamentary Policy Advocacy';
    const focusLabel = rawFocus || 'Democratic Rhetoric & Social Impact';
    return {
      syllabusKicker: 'Legislative & Civic Leadership Syllabus',
      title: `${disciplineLabel}: ${focusLabel}`,
      description: `Mobilizing grassroots constituencies, drafting legislative rhetoric, and defending public policy motions with ethical courage.`,
      disciplineLabel,
      focusLabel,
      drillTitle: `${focusLabel}: Floor Address Defense`,
      drillCategory: 'Civic Oratory • Floor Speech',
      drillPrompt: `"Address a skeptical youth council on sovereign digital public infrastructure. Rebut fiscal defeatism and inspire collective civic stewardship."`,
      sessionTitle: '1-on-1 Legislative Rhetoric Consultation with Coach Qassim',
      sessionDescription: 'Policy Floor Delivery & Audience Engagement Review',
      workshopTitle: 'Model African Union & Youth Parliament Floor Debate',
      workshopDescription: 'Live Parliamentary Caucus & Rebuttal Session'
    };
  }

  // 4. Foundation: Transforming Stutter & Speech Anxiety
  if (
    mission.includes('stutter') || 
    mission.includes('anxiety') || 
    discipline.includes('stutter') || 
    focus.includes('pacing control') ||
    focus.includes('somatic')
  ) {
    const disciplineLabel = rawDiscipline || 'Pacing Control & Somatic Grounding';
    const focusLabel = rawFocus || 'Dysfluency Acceptance & Vocal Ease';
    return {
      syllabusKicker: 'Fluency Liberation & Pacing Fellowship',
      title: `${disciplineLabel}: ${focusLabel}`,
      description: `Dissolving speech anticipation panic, grounding diaphragmatic breath, and releasing shame through radical vocal presence and unhurried pacing.`,
      disciplineLabel,
      focusLabel,
      drillTitle: `${focusLabel}: Breath Pause & Soft Articulation`,
      drillCategory: 'Fluency Recovery • Somatic Pacing',
      drillPrompt: `"Read this passage at your calibrated pace of ${profile.vocalBaselinePace || 130} WPM. Pause with sovereign ease at every comma. When you anticipate a block, breathe out softly, relax your jaw, and let your voice glide forward."`,
      sessionTitle: '1-on-1 Fluency Desensitization & Breathwork with Coach Qassim',
      sessionDescription: 'Pacing Audio Diagnostics & Somatic Grounding',
      workshopTitle: 'Foundation Pacing & Vocal Liberation Circle',
      workshopDescription: 'Supportive Peer Speaking & Resonance Circle'
    };
  }

  // 5. Foundation: Generational Storytelling & Living Legacy
  if (
    mission.includes('storytelling') || 
    mission.includes('generational') || 
    discipline.includes('oral') || 
    mission.includes('legacy')
  ) {
    const disciplineLabel = rawDiscipline || 'Oral History & Narrative Preservation';
    const focusLabel = rawFocus || 'Vocal Resonance & Sensory Imagery';
    return {
      syllabusKicker: 'Generational Oral Archive Fellowship',
      title: `${disciplineLabel}: ${focusLabel}`,
      description: `Preserving ancestral narratives and family triumphs through sensory vocal imagery, emotional modulation, and indelible oral transmission.`,
      disciplineLabel,
      focusLabel,
      drillTitle: `${focusLabel}: The Crucible of Resilience`,
      drillCategory: 'Living Archive • Narrative Rehearsal',
      drillPrompt: `"Recount a pivotal moment of courage passed down by an elder in your lineage. Describe the sensory atmosphere—the scents, ambient sounds, and unspoken weight—bringing their dignity into the room."`,
      sessionTitle: '1-on-1 Narrative Architecture Review with Coach Qassim',
      sessionDescription: 'Sensory Imagery & Modulation Coaching',
      workshopTitle: 'Living Archive & Oral History Circle',
      workshopDescription: 'Facilitated Group Story Sharing'
    };
  }

  // 6. Default Academy (Competitive Debate, Pan-African Forensics, Parliamentary)
  if (isAcademy) {
    const disciplineLabel = rawDiscipline || 'British Parliamentary (BP)';
    const focusLabel = rawFocus || 'Argumentation & Rebuttal Depth';
    const dynamicTitle = mission.includes('pan-african')
      ? 'Championship Debate & Pan-African Leadership'
      : `${disciplineLabel}: ${focusLabel}`;

    return {
      syllabusKicker: 'Tournament & Leadership Syllabus',
      title: dynamicTitle,
      description: 'Developing razor-sharp syllogistic logic, overcoming western dependency narratives, and commanding global parliamentary conventions.',
      disciplineLabel,
      focusLabel,
      drillTitle: `${focusLabel}: Adversarial Rebuttal Sprint`,
      drillCategory: 'Tournament Forensics • Motion Rebuttal',
      drillPrompt: `"Dismantle the proposition that African youth must migrate to achieve prosperity. Defend continental resource mobilization and self-development with uncompromising moral logic."`,
      sessionTitle: '1-on-1 Forensics & Rebuttal Strategy with Coach Qassim',
      sessionDescription: 'Video Consultation & POI Extension Feedback',
      workshopTitle: 'PAUDC Championship Mock Round (British Parliamentary)',
      workshopDescription: 'Facilitated Tournament Simulation Round'
    };
  }

  // 7. Default Foundation (Escapism, Emotional Catharsis, Voice Recovery)
  const disciplineLabel = rawDiscipline || 'Cathartic Voice Journaling';
  const focusLabel = rawFocus || 'Vulnerability & Unfiltered Truth';
  return {
    syllabusKicker: 'Catharsis & Healing Fellowship',
    title: 'Speaking as Escapism: Emotional Vulnerability Studio',
    description: 'A safe sanctuary for vocalizing suppressed trauma, breaking generational silence, and turning lived pain into therapeutic empowerment.',
    disciplineLabel,
    focusLabel,
    drillTitle: 'Cathartic Voice Journaling & Vulnerability Release',
    drillCategory: 'Catharsis Studio • Safe Expression',
    drillPrompt: `"Speak aloud a truth you felt pressured to hide. Breathe through the constriction in your throat, allow your voice to express the emotion completely, and end with an affirmation of self-sovereignty."`,
    sessionTitle: '1-on-1 Therapeutic Voice & Breathwork Session with Coach Qassim',
    sessionDescription: 'Video Consultation & Emotional Resonance Feedback',
    workshopTitle: 'Foundation Community Voice & Healing Circle',
    workshopDescription: 'Facilitated Group Catharsis Session'
  };
};
