export type ClientStatus = 'Active' | 'Inactive' | 'Onboarding' | 'Needs Check-in' | 'Needs Review' | 'Suspended';

export type BranchType = 'Academy' | 'Foundation';

export type PortalView = 'landing' | 'speaker_app' | 'coach_os' | 'onboarding';

export type SpeakingGoal = 
  | 'Competitive Debate' 
  | 'Keynote & Conference' 
  | 'Executive & Board Pitching' 
  | 'Impromptu & Extemporaneous' 
  | 'Model UN & Parliamentary' 
  | 'Stage Presence & Vocal Mastery'
  | 'Cathartic Expression & Healing'
  | 'Trauma Storytelling & Advocacy'
  | 'Pan-African Leadership';

export type FitnessGoal = SpeakingGoal;

export type ExperienceLevel = 
  | 'Novice Speaker'
  | 'Club Debater'
  | 'Varsity / Advanced'
  | 'Master Orator';

export interface SpeakerOnboardingData {
  branch: BranchType;
  fullName: string;
  email: string;
  age?: number;
  phone?: string;
  institution?: string;
  primaryDiscipline?: string;
  coreFocus?: string;
  missionFocus: string;
  speakingGoal: SpeakingGoal;
  experienceLevel: ExperienceLevel;
  vocalBaselinePace: number;
  emotionalOpennessRating: number;
  selectedHabits: string[];
  bioNotes?: string;
  coachRef?: string;
}

export interface AdjudicationNote {
  id: string;
  coachId: string;
  coachName: string;
  coachAvatar?: string;
  timestamp: string;
  note: string;
  rubricCategory: string;
  rating?: number;
}

export interface CoachItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface Client {
  id: string;
  coachId?: string;
  referralCode?: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  status: ClientStatus;
  branch?: BranchType;
  institution?: string;
  primaryDiscipline?: string;
  coreFocus?: string;
  missionFocus?: string;
  catharsisScore?: number; // 0-100% emotional vulnerability & expression score
  goal: SpeakingGoal;
  experienceLevel: ExperienceLevel;
  startDate: string;
  currentProgramId?: string;
  currentProgramName?: string;
  complianceRate: number; // percentage 0 - 100
  workoutsCompleted: number; // sessions completed
  totalWorkoutsAssigned: number; // total sessions assigned
  lastActive: string;
  targetWeightKg: number; // target speaking pace (WPM)
  currentWeightKg: number; // current speaking pace (WPM)
  startingWeightKg: number; // starting speaking pace (WPM)
  heightCm: number;
  bodyFatPercentage: number; // clarity / fluency score %
  targetBodyFat: number; // target clarity / fluency %
  injuriesAndHealth: string[]; // speech challenges & focus areas
  medicalAlerts?: string; // coach vocal health / speech delivery alert
  customCoachNotes: string[];
  adjudicatorNotes?: AdjudicationNote[];
  onboardingSurvey: {
    gymAccess: string; // primary debate / speaking format & venue
    weeklyAvailabilityDays: number;
    dietaryRestrictions: string; // speaking background / club affiliation
    sleepAvgHours: number;
    stressLevel: string;
    favoriteExercises: string; // favorite speech drills & formats
    leastFavoriteExercises: string; // speech areas needing growth
  };
}

export type SkillCategory = 
  | 'Vocal Modulation' 
  | 'Argumentation & Logic' 
  | 'Pacing & Pauses' 
  | 'Body Language & Presence' 
  | 'Rebuttal & Refutation' 
  | 'Rhetoric & Storytelling' 
  | 'Impromptu Delivery' 
  | 'Clarity & Articulation' 
  | 'Audience Engagement' 
  | 'Cross-Examination'
  | 'Cathartic Storytelling'
  | 'Emotional Vulnerability'
  | 'Deconditioning & Pan-Africanism';

export type MuscleGroup = SkillCategory;

export type SpeechEquipment = 
  | 'Impromptu Prompt' 
  | 'Prepared Manuscript' 
  | 'Cross-Examination' 
  | 'Debate Flow Sheet' 
  | 'Podium & Microphone' 
  | 'Slide Deck Presentation' 
  | 'Teleprompter' 
  | 'Vocal Resonator';

export type Equipment = SpeechEquipment;

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type DrillCategory = 
  | 'Argumentation' 
  | 'Vocal Delivery' 
  | 'Impromptu' 
  | 'Stage Presence' 
  | 'Debate Tactics'
  | 'Catharsis & Healing'
  | 'Pan-African Discourse';

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  description: string;
  instructions: string[];
  formCues: string[];
  instructionalVideoUrl?: string;
  demoVideoPlaceholderUrl?: string;
  thumbnailUrl: string;
  category: DrillCategory;
  isCustom?: boolean;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  targetReps: string; // e.g. "3:00 min" or "135 WPM" or "8-10"
  targetRpe?: number; // Fluency / Delivery Score (1-10)
  targetWeightKg?: number; // Target Pacing (WPM)
  restSeconds?: number; // Prep / intermission time seconds
  completedReps?: number; // Actual Duration (min) or Reps
  completedWeightKg?: number; // Actual Pacing (WPM)
  completedRpe?: number; // Actual Fluency (1-10)
  isCompleted?: boolean;
  notes?: string;
}

export interface WorkoutExerciseItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: MuscleGroup;
  equipment: Equipment;
  sets: WorkoutSet[];
  tempo?: string; // e.g. "135 WPM Cadence" or "3-0-1-0"
  coachNotes?: string;
  isSupersetWithNext?: boolean; // e.g. back-to-back cross-fire / rebuttal drill
}

export interface SessionPhase {
  id: string;
  phaseName: string; // e.g. "Review & Warm-Up", "Core Concept / Instruction", "Demonstration & Analysis", "Practical Speaking Drills", "Feedback & Assessment", "Practice Assignment"
  durationMin: number; // e.g. 10, 15, 20, 30, 10, 5
  description: string;
}

export interface WorkoutDay {
  id: string;
  dayNumber: number;
  name: string; // e.g. "Session 1: Communication Assessment & Baseline"
  focus: string;
  estimatedDurationMin: number;
  warmupNotes?: string;
  cooldownNotes?: string;
  objectives?: string[]; // Specific lesson objectives from executive curriculum
  phases?: SessionPhase[]; // 6 distinct 90-min executive coaching phases
  assignmentNotes?: string; // Practice assignment between sessions
  exercises: WorkoutExerciseItem[];
}

export type CurriculumSession = WorkoutDay;
export type CurriculumProgram = TrainingProgram;
export type SpeakingDrill = WorkoutExerciseItem;

export interface TrainingProgram {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: Difficulty;
  goal: SpeakingGoal;
  durationWeeks: number;
  daysPerWeek: number;
  days: WorkoutDay[];
  tags: string[];
  assignedClientCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledWorkout {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  programId?: string;
  programName?: string;
  workoutDayId: string;
  workoutTitle: string;
  date: string; // YYYY-MM-DD
  time?: string;
  status: 'Scheduled' | 'Completed' | 'Missed' | 'In-Progress';
  durationMin?: number;
  rating?: number; // 1-5
  clientFeedback?: string;
  coachFeedback?: string;
  totalVolumeKg?: number; // Total Speaking Time or Cumulative Volume
  prCount?: number;
  objectives?: string[];
  phases?: SessionPhase[];
  assignmentNotes?: string;
  chamberRoomName?: string;
  exercises: WorkoutExerciseItem[];
}

export interface MetricEntry {
  id: string;
  clientId: string;
  date: string;
  weightKg: number; // Speaking Pace (WPM)
  bodyFatPercentage?: number; // Fluency / Clarity Score (%)
  chestCm?: number; // Filler Word Count (per speech)
  waistCm?: number; // Vocal Projection (dB)
  armsCm?: number; // Stage Presence / Confidence (1-10)
  thighsCm?: number;
  notes?: string;
}

export interface PersonalRecord {
  id: string;
  clientId: string;
  exerciseName: string;
  weightKg: number; // Milestone Score or Pacing (WPM / Speaker Points)
  reps: number; // Rounds or Speeches
  estimated1RmKg: number; // Overall Oratory Index
  date: string;
  previousWeightKg?: number;
}

export interface HabitItem {
  id: string;
  title: string;
  targetValue: string;
  unit: string;
  iconName: string;
  category: 'Nutrition' | 'Recovery' | 'Activity' | 'Mindset';
}

export interface ClientDailyHabitLog {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  habits: {
    habitId: string;
    title: string;
    completed: boolean;
    currentValue?: number | string;
    targetValue: string;
    unit: string;
  }[];
}

export interface ProgressPhoto {
  id: string;
  clientId: string;
  date: string;
  view: 'Front' | 'Side' | 'Back'; // Stage / Podium / Delivery angle
  photoUrl: string;
  weightKg: number; // Speaking Pace (WPM)
  bodyFatPercentage?: number; // Fluency %
  notes?: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName?: string;
  senderRole?: string;
}

export interface ChatAttachment {
  type: 'workout_link' | 'video_form_check' | 'progress_photo' | 'audio_note' | 'voice' | 'document' | 'workout_assignment' | 'form_check' | string;
  title?: string;
  url?: string;
  workoutId?: string;
  durationSeconds?: number;
  feedbackGiven?: boolean;
  audioUrl?: string;
  duration?: string;
  waveform?: number[];
  fileName?: string;
  fileSize?: string;
  rating?: number;
  exerciseName?: string;
  videoUrl?: string;
  replyTo?: {
    id: string;
    text: string;
    sender: 'coach' | 'client';
    senderName?: string;
  };
  reactions?: MessageReaction[];
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  clientId: string;
  coachId?: string;
  sender: 'coach' | 'client';
  text: string;
  timestamp: string;
  isRead: boolean;
  attachment?: ChatAttachment;
  messageType?: string;
  attachmentData?: any;
  content?: string;
}

export interface ActivityFeedItem {
  id: string;
  type: 'workout_completed' | 'pr_achieved' | 'check_in_submitted' | 'new_message' | 'streak_milestone';
  clientId: string;
  clientName: string;
  clientAvatar: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    weightKg?: number;
    exerciseName?: string;
    compliance?: number;
  };
}
