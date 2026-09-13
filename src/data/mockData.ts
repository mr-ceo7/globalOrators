import { 
  Client, 
  Exercise, 
  TrainingProgram, 
  ScheduledWorkout, 
  MetricEntry, 
  PersonalRecord, 
  ProgressPhoto, 
  ChatMessage, 
  ActivityFeedItem,
  HabitItem,
  ClientDailyHabitLog
} from '../types';

export const INITIAL_CLIENTS: Client[] = [
  {
    "id": "client-exec-1",
    "name": "Dr. Arthur Vance",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "email": "arthur.vance@executive.org",
    "phone": "+254 700 889 900",
    "age": 42,
    "gender": "Male",
    "status": "Active",
    "branch": "Academy",
    "missionFocus": "Executive Public Speaking & Presentation Skills",
    "catharsisScore": 96,
    "goal": "Executive & Board Pitching",
    "experienceLevel": "Master Orator",
    "startDate": "2026-08-01",
    "currentProgramId": "prog-exec-speaking-1",
    "currentProgramName": "Executive Public Speaking & Presentation Skills Programme",
    "complianceRate": 98,
    "workoutsCompleted": 18,
    "totalWorkoutsAssigned": 18,
    "lastActive": "Today at 08:30 AM",
    "startingWeightKg": 138,
    "currentWeightKg": 138,
    "targetWeightKg": 138,
    "heightCm": 185,
    "bodyFatPercentage": 96.0,
    "targetBodyFat": 98.0,
    "injuriesAndHealth": [
      "Boardroom cadence pacing maintenance under hostile investor Q&A"
    ],
    "medicalAlerts": "Apply 2-second deliberate pause before responding to valuation or capex questions.",
    "customCoachNotes": [
      "Boardroom pitch deck structure anchored around BLUF (Bottom Line Upfront).",
      "Executive presence calibrated at 138 WPM. Excellent gravitas and command of floor.",
      "4-week, 8-session executive protocol scheduled for Tuesdays and Thursdays (90 mins)."
    ],
    "onboardingSurvey": {
      "gymAccess": "Executive Boardrooms & Investor Demo Days (Teleconference & In-Person Pitching)",
      "weeklyAvailabilityDays": 2,
      "dietaryRestrictions": "Managing Director, Sovereign Advisory & Enterprise Capital",
      "sleepAvgHours": 7.0,
      "stressLevel": "High",
      "favoriteExercises": "Executive Boardroom Pitch & Objection Handling, Strategic Pauses & Cadence Deceleration",
      "leastFavoriteExercises": "Diaphragmatic Resonance Vowel Hums"
    }
  },
  {
    "id": "client-1",
    "name": "Marcus Vance",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "email": "marcus.vance@example.com",
    "phone": "+1 (555) 234-5678",
    "age": 28,
    "gender": "Male",
    "status": "Active",
    "branch": "Academy",
    "missionFocus": "Pan-African Debating Union & British Parliamentary Championships",
    "catharsisScore": 72,
    "goal": "Competitive Debate",
    "experienceLevel": "Varsity / Advanced",
    "startDate": "2026-04-10",
    "currentProgramId": "prog-1",
    "currentProgramName": "8-Week Championship Debate Masterclass",
    "complianceRate": 94,
    "workoutsCompleted": 42,
    "totalWorkoutsAssigned": 45,
    "lastActive": "Today at 09:30 AM",
    "startingWeightKg": 120,
    "currentWeightKg": 148,
    "targetWeightKg": 150,
    "heightCm": 182,
    "bodyFatPercentage": 92.5,
    "targetBodyFat": 95.0,
    "injuriesAndHealth": [
      "Vocal fatigue during high-volume POI cross-examinations",
      "Pacing acceleration past 170 WPM under hostile rebuttals"
    ],
    "medicalAlerts": "Practice diaphragmatic belly breathing between floor speeches; keep warm lemon water at the podium.",
    "customCoachNotes": [
      "Focusing on structured syllogistic refutation and Aristotelian Ethos/Logos balance.",
      "Responding exceptionally well to 4-minute rapid rebuttal drills. Fluency cadence averaging 148 WPM.",
      "Refined opening hook with rhetorical questions and empirical trade statistics."
    ],
    "onboardingSurvey": {
      "gymAccess": "British Parliamentary & Policy Debate (Floor Speeches, Cross-Examination, POI)",
      "weeklyAvailabilityDays": 4,
      "dietaryRestrictions": "Oxford Union Debater, Economics & Geopolitical Law specialization",
      "sleepAvgHours": 7.8,
      "stressLevel": "Moderate",
      "favoriteExercises": "Cross-Examination Rapid POI Defense, Syllogistic Rebuttal, Aristotelian Triad Framing",
      "leastFavoriteExercises": "Impromptu Metaphor Linking, Tongue Twister Enunciation"
    }
  },
  {
    "id": "client-2",
    "name": "Elena Rostova",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "email": "elena.rostova@example.com",
    "phone": "+1 (555) 876-5432",
    "age": 32,
    "gender": "Female",
    "status": "Active",
    "branch": "Academy",
    "missionFocus": "Global Leadership & Corporate Keynote Conventions",
    "catharsisScore": 80,
    "goal": "Keynote & Conference",
    "experienceLevel": "Master Orator",
    "startDate": "2026-05-15",
    "currentProgramId": "prog-2",
    "currentProgramName": "12-Week Executive Oratory & Keynote Mastery",
    "complianceRate": 98,
    "workoutsCompleted": 38,
    "totalWorkoutsAssigned": 39,
    "lastActive": "Yesterday at 04:15 PM",
    "startingWeightKg": 115,
    "currentWeightKg": 132,
    "targetWeightKg": 130,
    "heightCm": 168,
    "bodyFatPercentage": 96.0,
    "targetBodyFat": 98.0,
    "injuriesAndHealth": [
      "Mild stage fright tension in trapezius muscles",
      "Occasional vocal fry at the end of long declarative sentences"
    ],
    "medicalAlerts": "Incorporate vocal cord siren glides and neck release stretches before main stage rehearsals.",
    "customCoachNotes": [
      "Superb spatial stage anchoring; transitions from Stage Right to Center are natural and authoritative.",
      "Keynote pacing is locked at 132 WPM, perfectly aligned with global conference simultaneous interpretation.",
      "Slide synchronisation is crisp—she never turns her back to the audience."
    ],
    "onboardingSurvey": {
      "gymAccess": "Main Stage Conference Auditoriums (Wireless Lavalier, Confidence Monitors, 500+ Seating)",
      "weeklyAvailabilityDays": 3,
      "dietaryRestrictions": "Global Tech Keynote Speaker, AI Ethics & Leadership",
      "sleepAvgHours": 8.0,
      "stressLevel": "Low",
      "favoriteExercises": "Keynote Hook & Attention Hijack, Stage Commanding & Spatial Anchoring, Strategic Pauses",
      "leastFavoriteExercises": "Line-by-Line Rebuttal Clash"
    }
  },
  {
    "id": "client-3",
    "name": "David Kim",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "email": "david.kim@example.com",
    "phone": "+1 (555) 345-6789",
    "age": 35,
    "gender": "Male",
    "status": "Needs Review",
    "branch": "Academy",
    "missionFocus": "African Tech Innovation & Venture Capital Pitching",
    "catharsisScore": 65,
    "goal": "Executive & Board Pitching",
    "experienceLevel": "Club Debater",
    "startDate": "2026-03-01",
    "currentProgramId": "prog-2",
    "currentProgramName": "12-Week Executive Oratory & Keynote Mastery",
    "complianceRate": 78,
    "workoutsCompleted": 31,
    "totalWorkoutsAssigned": 40,
    "lastActive": "3 days ago",
    "startingWeightKg": 165,
    "currentWeightKg": 155,
    "targetWeightKg": 140,
    "heightCm": 178,
    "bodyFatPercentage": 84.0,
    "targetBodyFat": 92.0,
    "injuriesAndHealth": [
      "Fast speech cadence under investor interrogation",
      "Tendency to overuse technical acronyms and hedging language ('kind of', 'essentially')"
    ],
    "medicalAlerts": "Enforce 2-second tactical pause before answering valuation and risk questions.",
    "customCoachNotes": [
      "Needs to slow down from 155 WPM to 140 WPM during Series B investor Q&A.",
      "Boardroom pitch deck structure improved dramatically using BLUF framework (Bottom Line Upfront).",
      "Schedule 1-on-1 drill session for handling hostile venture capitalist inquiries."
    ],
    "onboardingSurvey": {
      "gymAccess": "Executive Boardrooms & Investor Demo Days (Teleconference & In-Person Pitching)",
      "weeklyAvailabilityDays": 3,
      "dietaryRestrictions": "Startup Founder, Fintech & Enterprise SaaS",
      "sleepAvgHours": 6.5,
      "stressLevel": "High",
      "favoriteExercises": "Executive Boardroom Pitch & Objection Handling, Strategic Pauses & Cadence Deceleration",
      "leastFavoriteExercises": "Diaphragmatic Resonance Vowel Hums"
    }
  },
  {
    "id": "client-4",
    "name": "Amina Diallo",
    "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "email": "amina.diallo@example.com",
    "phone": "+1 (555) 456-7890",
    "age": 24,
    "gender": "Female",
    "status": "Active",
    "branch": "Foundation",
    "missionFocus": "Pan-African Youth Enlightenment & Model UN Diplomatic Voice",
    "catharsisScore": 92,
    "goal": "Model UN & Parliamentary",
    "experienceLevel": "Varsity / Advanced",
    "startDate": "2026-06-01",
    "currentProgramId": "prog-1",
    "currentProgramName": "8-Week Championship Debate Masterclass",
    "complianceRate": 96,
    "workoutsCompleted": 27,
    "totalWorkoutsAssigned": 28,
    "lastActive": "Today at 11:45 AM",
    "startingWeightKg": 130,
    "currentWeightKg": 142,
    "targetWeightKg": 145,
    "heightCm": 172,
    "bodyFatPercentage": 94.0,
    "targetBodyFat": 97.0,
    "injuriesAndHealth": [
      "Slight vocal rasp after multi-day conference sessions"
    ],
    "medicalAlerts": "Use resonance humming during caucus recesses to soothe vocal folds.",
    "customCoachNotes": [
      "Outstanding diplomatic framing; skillfully unifies divided voting blocs.",
      "Resolution sponsorship speeches are persuasive, commanding, and mathematically sound.",
      "Preparing for Harvard WorldMUN championship finals next month."
    ],
    "onboardingSurvey": {
      "gymAccess": "Model United Nations & Diplomatic Assemblies (Security Council, General Assembly)",
      "weeklyAvailabilityDays": 4,
      "dietaryRestrictions": "International Relations Delegate, Multilateral Treaty Negotiations",
      "sleepAvgHours": 7.5,
      "stressLevel": "Moderate",
      "favoriteExercises": "Oxford Style Floor Speech & Clashing, Syllogistic Rebuttal, Cross-Examination Rapid POI Defense",
      "leastFavoriteExercises": "Consonant Crispness Drills"
    }
  },
  {
    "id": "client-5",
    "name": "Lucas Moreau",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "email": "lucas.moreau@example.com",
    "phone": "+1 (555) 567-8901",
    "age": 21,
    "gender": "Male",
    "status": "Onboarding",
    "branch": "Foundation",
    "missionFocus": "Speaking as Escapism from Social Anxiety & Emotional Isolation",
    "catharsisScore": 88,
    "goal": "Impromptu & Extemporaneous",
    "experienceLevel": "Novice Speaker",
    "startDate": "2026-08-01",
    "currentProgramId": "prog-3",
    "currentProgramName": "6-Week Impromptu Fluency & Extemporaneous Protocol",
    "complianceRate": 88,
    "workoutsCompleted": 14,
    "totalWorkoutsAssigned": 16,
    "lastActive": "Yesterday at 07:00 PM",
    "startingWeightKg": 110,
    "currentWeightKg": 126,
    "targetWeightKg": 135,
    "heightCm": 180,
    "bodyFatPercentage": 79.0,
    "targetBodyFat": 90.0,
    "injuriesAndHealth": [
      "Severe filler word reliance ('um', 'like', 'sort of') during unscripted moments",
      "Nervous fidgeting with hands when delivering without notes"
    ],
    "medicalAlerts": "Apply physical anchor technique (light touch of index finger and thumb) to ground nervous energy.",
    "customCoachNotes": [
      "Showing fast progress on 1-2-3 PREP framework drills.",
      "Filler word count dropped from 18 per 2-minute speech to 6 in just two weeks.",
      "Needs more practice maintaining eye contact through the 15-second prep window."
    ],
    "onboardingSurvey": {
      "gymAccess": "University Debate Society & Toastmasters Chapter",
      "weeklyAvailabilityDays": 4,
      "dietaryRestrictions": "Undergraduate Debater, Philosophy & Political Science",
      "sleepAvgHours": 7.0,
      "stressLevel": "Moderate",
      "favoriteExercises": "Impromptu 1-2-3 Sprint (PREP Framework), Strategic Pauses & Cadence Deceleration",
      "leastFavoriteExercises": "Cross-Examination Rapid POI Defense"
    }
  },
  {
    "id": "client-6",
    "name": "Sarah Jenkins",
    "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    "email": "sarah.jenkins@example.com",
    "phone": "+1 (555) 678-9012",
    "age": 29,
    "gender": "Female",
    "status": "Needs Check-in",
    "branch": "Foundation",
    "missionFocus": "Trauma Storytelling, Breaking Generational Silence & Child Advocacy",
    "catharsisScore": 95,
    "goal": "Stage Presence & Vocal Mastery",
    "experienceLevel": "Club Debater",
    "startDate": "2026-07-10",
    "currentProgramId": "prog-2",
    "currentProgramName": "12-Week Executive Oratory & Keynote Mastery",
    "complianceRate": 82,
    "workoutsCompleted": 18,
    "totalWorkoutsAssigned": 22,
    "lastActive": "4 days ago",
    "startingWeightKg": 125,
    "currentWeightKg": 136,
    "targetWeightKg": 138,
    "heightCm": 165,
    "bodyFatPercentage": 86.0,
    "targetBodyFat": 94.0,
    "injuriesAndHealth": [
      "Shallow thoracic breathing leading to breathlessness at sentence endings",
      "Monotone vocal inflection during technical sections"
    ],
    "medicalAlerts": "Daily 10-minute diaphragmatic breathing protocol before voice rehearsals.",
    "customCoachNotes": [
      "Check in regarding missed voice warm-ups this past Thursday.",
      "Pitch inflection drill showed immediate improvement\u2014vocal range increased by 4 semitones.",
      "Encourage her to record weekly video rehearsals to evaluate non-verbal micro-expressions."
    ],
    "onboardingSurvey": {
      "gymAccess": "Corporate Auditorium & Studio Webcast (Professional Broadcast Setup)",
      "weeklyAvailabilityDays": 3,
      "dietaryRestrictions": "Management Consultant, Strategy & Transformation",
      "sleepAvgHours": 6.8,
      "stressLevel": "High",
      "favoriteExercises": "Diaphragmatic Resonance & Vocal Projection, Vocal Range & Pitch Variation Sprint",
      "leastFavoriteExercises": "Extemp 7-Minute Policy Architecture"
    }
  }
];

export const INITIAL_EXERCISES: Exercise[] = [
  {
    "id": "ex-1",
    "name": "Aristotelian Triad Framing (Ethos, Pathos, Logos)",
    "primaryMuscle": "Argumentation & Logic",
    "secondaryMuscles": [
      "Rhetoric & Storytelling",
      "Audience Engagement"
    ],
    "equipment": "Prepared Manuscript",
    "difficulty": "Intermediate",
    "category": "Argumentation",
    "description": "Master the foundational pillar of classical persuasion. Systematically construct case opening arguments that establish credible authority (Ethos), spark genuine emotional resonance (Pathos), and prove premises with empirical logic (Logos).",
    "instructions": [
      "Establish speaker credibility within the first 20 seconds using empirical standing or lived authority.",
      "Introduce a compelling human narrative or high-stakes scenario to ignite visceral emotional empathy.",
      "Deliver inductive or deductive logical premises backed by verified data points and clear causality.",
      "Synthesize all three pillars into an unassailable thesis call-to-action."
    ],
    "formCues": [
      "Establish unwavering eye contact during Ethos claims",
      "Lower vocal pitch by half an octave on Pathos points",
      "Anchor premises with concrete statistics",
      "Execute a 2-second pause right before the core thesis"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-2",
    "name": "Impromptu 1-2-3 Sprint (PREP Framework)",
    "primaryMuscle": "Impromptu Delivery",
    "secondaryMuscles": [
      "Pacing & Pauses",
      "Clarity & Articulation"
    ],
    "equipment": "Impromptu Prompt",
    "difficulty": "Intermediate",
    "category": "Impromptu",
    "description": "Rapid extemporaneous thinking drill using the Point, Reason, Example, Point (PREP) protocol. Given an unseen prompt with 15 seconds prep, deliver a crisp, punchy 2-minute speech with zero filler sounds.",
    "instructions": [
      "Receive an unseen philosophical or current affairs prompt; activate 15-second silent mental prep.",
      "State your primary contention (Point) immediately in one definitive sentence.",
      "Unpack the structural Reason why this claim holds true across modern systems.",
      "Provide a vivid real-world Example or historical precedent reinforcing your claim.",
      "Restate the initial Point with heightened conviction and forward momentum."
    ],
    "formCues": [
      "No filler vocalizations during the 15-second prep",
      "Punch the opening thesis statement",
      "Maintain steady 140 WPM delivery tempo",
      "Conclude cleanly within 5 seconds of the closing bell"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-3",
    "name": "Cross-Examination & Rapid POI Defense",
    "primaryMuscle": "Cross-Examination",
    "secondaryMuscles": [
      "Rebuttal & Refutation",
      "Argumentation & Logic"
    ],
    "equipment": "Cross-Examination",
    "difficulty": "Advanced",
    "category": "Debate Tactics",
    "description": "High-pressure Point of Information (POI) defense drill. Coach or peer throws hostile interruptions while speaker defends case line without losing composure, vocal resonance, or analytical flow.",
    "instructions": [
      "Begin 3-minute policy speech while standing at the podium.",
      "Accept 3 hostile Points of Information (POIs) raised at unexpected intervals.",
      "Acknowledge the opponent politely within 3 seconds, isolate their logical fallacy, and refute decisively.",
      "Seamlessly pivot back to your primary contention without stuttering or breaking eye contact."
    ],
    "formCues": [
      "Never step backward when interrupted",
      "Neutral vocal inflection on defense",
      "Dismantle underlying assumptions before debating statistics",
      "Re-anchor your case line within 15 seconds"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-4",
    "name": "Diaphragmatic Resonance & Vocal Projection",
    "primaryMuscle": "Vocal Modulation",
    "secondaryMuscles": [
      "Clarity & Articulation",
      "Body Language & Presence"
    ],
    "equipment": "Podium & Microphone",
    "difficulty": "Beginner",
    "category": "Vocal Delivery",
    "description": "Vocal agility drill expanding abdominal resonance, eliminating vocal fry, and filling a large hall with deep, commanding tone without straining vocal folds.",
    "instructions": [
      "Stand in grounded speaker stance, shoulders relaxed, knees unlocked.",
      "Inhale deeply through the nose into the lower abdomen over 4 counts.",
      "Project sustained resonant vowel hums (Mmm, Ahh, Ohh) targeting 75-80 dB without straining.",
      "Vary pitch across octaves while maintaining abdominal support and open throat posture."
    ],
    "formCues": [
      "Shoulders remain stationary on inhale",
      "Sound emanates from gut, not throat",
      "Jaw unhinged and relaxed",
      "Warm, resonant timbre"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-5",
    "name": "Syllogistic Rebuttal & Line-by-Line Refutation",
    "primaryMuscle": "Rebuttal & Refutation",
    "secondaryMuscles": [
      "Argumentation & Logic",
      "Clarity & Articulation"
    ],
    "equipment": "Debate Flow Sheet",
    "difficulty": "Advanced",
    "category": "Debate Tactics",
    "description": "Competitive debate drill flowing opponent arguments and systematically dismantling premise, warrant, or impact in numbered sequence with razor-sharp precision.",
    "instructions": [
      "Review opponent 4-point case flow on the debate sheet.",
      "Signpost each clash explicitly: 'On their contention 1 regarding economic solvency...'",
      "Apply 'They Say / We Say / Because / Therefore' four-step rebuttal architecture.",
      "Weigh impacts using magnitude, timeframe, and probability metrics."
    ],
    "formCues": [
      "Clear verbal signposting before every clash",
      "Never drop an opponent flow point",
      "Crisp analytical distinction between warrant and impact",
      "Strict time budget: 45 seconds per clash"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-6",
    "name": "Strategic Pauses & Cadence Deceleration",
    "primaryMuscle": "Pacing & Pauses",
    "secondaryMuscles": [
      "Vocal Modulation",
      "Audience Engagement"
    ],
    "equipment": "Prepared Manuscript",
    "difficulty": "Intermediate",
    "category": "Vocal Delivery",
    "description": "Pacing discipline drill replacing filler words with dramatic 2-3 second silences to create tension, emphasize core arguments, and command hall authority.",
    "instructions": [
      "Deliver a 3-minute executive monologue with marked pause notations [//].",
      "Execute a deliberate 2-second silent pause before every key statistic or thesis point.",
      "Hold steady eye contact across the room during the pause without blinking or shifting feet.",
      "Drop speaking tempo from 160 WPM down to a deliberate 125 WPM on critical takeaways."
    ],
    "formCues": [
      "Embrace the silence without anxiety",
      "Breathe through the nose during pauses",
      "Scan left, center, right audience sections",
      "Zero 'um', 'like', or 'you know'"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-7",
    "name": "Stage Commanding & Spatial Anchoring",
    "primaryMuscle": "Body Language & Presence",
    "secondaryMuscles": [
      "Audience Engagement",
      "Vocal Modulation"
    ],
    "equipment": "Podium & Microphone",
    "difficulty": "Intermediate",
    "category": "Stage Presence",
    "description": "Non-verbal authority drill mapping the stage into three narrative zones: past problem (stage right), present crisis (center stage), and future vision (stage left).",
    "instructions": [
      "Calibrate neutral speaker stance: feet shoulder-width, palms open above waist level.",
      "Begin case narrative at stage right describing the historical baseline.",
      "Move purposefully across to center stage upon introducing the critical tipping point.",
      "Advance diagonally to stage left to unveil the transformative recommendation."
    ],
    "formCues": [
      "Never pace aimlessly",
      "Move on transitions, plant feet firmly during assertions",
      "Open chest and relaxed shoulders",
      "Keep gesture box between waist and collarbone"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-8",
    "name": "Consonant Crispness & Articulation Drills",
    "primaryMuscle": "Clarity & Articulation",
    "secondaryMuscles": [
      "Vocal Modulation",
      "Pacing & Pauses"
    ],
    "equipment": "Prepared Manuscript",
    "difficulty": "Beginner",
    "category": "Vocal Delivery",
    "description": "Vocal agility conditioning activating tongue, lips, and soft palate to ensure pristine enunciation even under high debate speech speeds.",
    "instructions": [
      "Recite complex phonetic combinations (P-T-K, B-D-G) with exaggerated plosive release.",
      "Deliver classic oratorical twisters ('The intellect of Aristotle was articulated in Athens') at escalating tempos.",
      "Speak with a cork lightly gripped between front teeth for 2 minutes, then remove.",
      "Deliver speech without obstruction and observe immediate phonetic clarity."
    ],
    "formCues": [
      "Crisp plosive consonants",
      "Wide mouth vowel shapes",
      "Mobile soft palate",
      "Zero trailing word endings"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-9",
    "name": "Metaphor Weaving & Narrative Arc",
    "primaryMuscle": "Rhetoric & Storytelling",
    "secondaryMuscles": [
      "Argumentation & Logic",
      "Audience Engagement"
    ],
    "equipment": "Prepared Manuscript",
    "difficulty": "Intermediate",
    "category": "Argumentation",
    "description": "Transform complex technical policy data into memorable, emotionally captivating narratives using central metaphors and classic narrative tension arcs.",
    "instructions": [
      "Identify the abstract core thesis of your presentation.",
      "Select a visceral extended metaphor (e.g. navigation through storm, architectural foundation).",
      "Build three acts: The Stasis, The Disruption/Conflict, The Resolution.",
      "Re-introduce the metaphor at the climax for poetic resonance."
    ],
    "formCues": [
      "Sensory details: sight, sound, touch",
      "Show, don't just tell",
      "Match vocal pitch to emotional tone of story",
      "Connect story directly back to thesis"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-10",
    "name": "Hostile Q&A & Defusal Tactics",
    "primaryMuscle": "Cross-Examination",
    "secondaryMuscles": [
      "Body Language & Presence",
      "Argumentation & Logic"
    ],
    "equipment": "Cross-Examination",
    "difficulty": "Advanced",
    "category": "Debate Tactics",
    "description": "Executive defense drill responding to aggressive stakeholder questions, loaded inquiries, and ad hominem attacks with poised, unflappable defusal.",
    "instructions": [
      "Receive a loaded question designed to provoke defensive or angry reaction.",
      "Validate the underlying concern neutrally: 'I appreciate the focus on risk solvency...'",
      "Reflect the question to eliminate loaded presuppositions.",
      "Deliver structured 3-part factual response and bridge to strategic initiative."
    ],
    "formCues": [
      "Smile subtly before answering",
      "Lower pitch by half an octave",
      "Do not adopt closed arm posture",
      "Bridge back to positive core message"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-11",
    "name": "Keynote Hook & Attention Hijack",
    "primaryMuscle": "Audience Engagement",
    "secondaryMuscles": [
      "Rhetoric & Storytelling",
      "Body Language & Presence"
    ],
    "equipment": "Podium & Microphone",
    "difficulty": "Beginner",
    "category": "Stage Presence",
    "description": "Master the first 45 seconds of a keynote. Ban trivial pleasantries and capture undivided attention with provocative questions, counter-intuitive facts, or sensory scenes.",
    "instructions": [
      "Walk into the stage lights and pause for 3 full seconds in total silence.",
      "Deliver opening line without preamble: high-contrast statistic, bold assertion, or story.",
      "Connect the opening hook to the audience's urgent pain point within 30 seconds.",
      "Set the presentation roadmap and promise of value."
    ],
    "formCues": [
      "Never say 'Good morning, can everyone hear me?'",
      "Unwavering gaze across center rows",
      "Command the acoustic space instantly",
      "Energetic vocal inflection"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-12",
    "name": "Extemp 7-Minute Policy Architecture",
    "primaryMuscle": "Argumentation & Logic",
    "secondaryMuscles": [
      "Impromptu Delivery",
      "Pacing & Pauses"
    ],
    "equipment": "Impromptu Prompt",
    "difficulty": "Advanced",
    "category": "Argumentation",
    "description": "Extemporaneous speaking simulation. Given a 30-minute research window on foreign policy, deliver an impeccably timed 7-minute analytical policy address.",
    "instructions": [
      "Organize 3 substantive contentions: historical context, geopolitical friction, economic solvency.",
      "Time check at Minute 2 (intro done), Minute 5 (two points covered), Minute 6:30 (conclusion).",
      "Cite 5 verified scholarly or international sources verbatim.",
      "Conclude with synthesis and memorable closing quote."
    ],
    "formCues": [
      "Glance at stopwatch smoothly without breaking rhythm",
      "Cite sources conversationally",
      "Sustain 135 WPM pacing",
      "Finish between 6:50 and 7:00"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-13",
    "name": "Vocal Range & Pitch Variation Sprint",
    "primaryMuscle": "Vocal Modulation",
    "secondaryMuscles": [
      "Audience Engagement",
      "Rhetoric & Storytelling"
    ],
    "equipment": "Podium & Microphone",
    "difficulty": "Intermediate",
    "category": "Vocal Delivery",
    "description": "Cure monotone delivery by practicing dynamic pitch shifts between authoritative low baritone, engaging midrange, and passionate high inflection.",
    "instructions": [
      "Read a multi-sentence paragraph assigning distinct pitch levels to each sentence.",
      "Use low pitch for absolute assertions and sober statistics.",
      "Use mid pitch for conversational explanations and scene setting.",
      "Use high pitch for surprising revelations, urgency, and calls to action."
    ],
    "formCues": [
      "Avoid upward inflection (uptalk) at sentence ends",
      "Resonate in chest cavity for low tones",
      "Express genuine facial animation",
      "Smooth transitions between registers"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-14",
    "name": "Oxford Style Floor Speech & Clashing",
    "primaryMuscle": "Argumentation & Logic",
    "secondaryMuscles": [
      "Rebuttal & Refutation",
      "Body Language & Presence"
    ],
    "equipment": "Debate Flow Sheet",
    "difficulty": "Advanced",
    "category": "Debate Tactics",
    "description": "Classic parliamentary chamber speech debating contentious resolution with rhetorical wit, procedural decorum, and forensic precision.",
    "instructions": [
      "Address the Chair with proper parliamentary etiquette.",
      "State clear stance: Proposition or Opposition to the motion.",
      "Dismantle the fundamental ideological pillar of the other side.",
      "Deliver a stirring oratorical finish appealing to universal human values."
    ],
    "formCues": [
      "Elegantly composed posture",
      "Witty rhetorical devices (anaphora, chiasmus)",
      "Modulated vocal volume for dramatic emphasis",
      "Respectful yet razor-sharp tone"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-15",
    "name": "TED-Style Slide Deck Synchronization",
    "primaryMuscle": "Audience Engagement",
    "secondaryMuscles": [
      "Body Language & Presence",
      "Pacing & Pauses"
    ],
    "equipment": "Slide Deck Presentation",
    "difficulty": "Intermediate",
    "category": "Stage Presence",
    "description": "Multi-modal delivery drill coordinating visual minimal slides with verbal narrative without reading off the screen or turning back to audience.",
    "instructions": [
      "Stand positioned downstage left of the screen, facing audience at 45 degrees.",
      "Click slide on transition words, never interrupting vocal delivery.",
      "Reference visuals with an open palm gesture without looking back at the slide for more than 1 second.",
      "Let visual slide breathe for 3 seconds before explaining the key takeaway."
    ],
    "formCues": [
      "Never read slide bullets aloud",
      "Maintain audience eye contact 90% of the time",
      "Fluid remote clicker handling",
      "Seamless slide-to-speech synchronization"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-16",
    "name": "Executive Boardroom Pitch & Objection Handling",
    "primaryMuscle": "Argumentation & Logic",
    "secondaryMuscles": [
      "Cross-Examination",
      "Audience Engagement"
    ],
    "equipment": "Prepared Manuscript",
    "difficulty": "Advanced",
    "category": "Argumentation",
    "description": "High-stakes 10-minute executive briefing defending capital allocation, ROI projections, and addressing skeptical board members with executive composure.",
    "instructions": [
      "State the bottom line upfront (BLUF framework) within the first 60 seconds.",
      "Outline the 3 strategic imperatives driving return on investment.",
      "Address anticipated cost, timeline, and competitive counter-arguments preemptively.",
      "Close with a decisive, actionable investment decision ask."
    ],
    "formCues": [
      "Command table posture: upright, forearms grounded",
      "Calm and collected vocal tone",
      "Handle interruptions as collaboration opportunities",
      "Direct answers with zero hedging"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-catharsis-1",
    "name": "Cathartic Voice Journaling & Vulnerability Release",
    "primaryMuscle": "Cathartic Storytelling",
    "secondaryMuscles": [
      "Emotional Vulnerability",
      "Pacing & Pauses"
    ],
    "equipment": "Prepared Manuscript",
    "difficulty": "Beginner",
    "category": "Catharsis & Healing",
    "description": "Speaking as a profound form of escapism and emotional catharsis. Guided vocalization of suppressed feelings, breaking generational and patriarchal silence, and releasing bottled trauma through intentional vocal expression.",
    "instructions": [
      "Close your eyes, breathe into your lower abdomen for 4 counts, and exhale with an audible sigh.",
      "Speak aloud your untold truth or a burden you carried without self-censoring or trying to perform.",
      "Notice the physical sensation of lightness and catharsis in your chest as the story leaves your throat.",
      "Conclude with an empowering statement of self-worth, healing, and future resilience."
    ],
    "formCues": [
      "Permission to let the voice tremble without judgment",
      "Keep shoulders dropped and soles of feet grounded",
      "Release throat constriction on exhale",
      "Emotion is strength and honesty, not weakness"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400&auto=format&fit=crop&q=80"
  },
  {
    "id": "ex-panafrican-1",
    "name": "Pan-African Deconditioning & Leadership Manifesto",
    "primaryMuscle": "Deconditioning & Pan-Africanism",
    "secondaryMuscles": [
      "Argumentation & Logic",
      "Rhetoric & Storytelling"
    ],
    "equipment": "Podium & Microphone",
    "difficulty": "Advanced",
    "category": "Pan-African Discourse",
    "description": "Cognitive enlightenment speech drill. Dismantling colonial social conditioning, breaking dependency mentalities and ethnic divisions, and articulating an audacious blueprint for sovereign African youth leadership.",
    "instructions": [
      "Diagnose the socio-economic root cause of a continental challenge without defaulting to colonial fatalism.",
      "Articulate a bold, proactive solution centered on self-development, good governance, and youth agency.",
      "Synthesize your argument into a commanding call-to-action that rallies community ownership.",
      "Deliver the final 60 seconds with unwavering moral clarity and steady vocal resonance."
    ],
    "formCues": [
      "Resonant, forward chest projection",
      "Command open stage space with dignity and pride",
      "Use active, decisive leadership verbs",
      "Never rush pivotal thesis takeaways"
    ],
    "thumbnailUrl": "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=400&auto=format&fit=crop&q=80"
  }
];

export const INITIAL_PROGRAMS: TrainingProgram[] = [
  {
    "id": "prog-exec-speaking-1",
    "title": "Executive Public Speaking & Presentation Skills Programme",
    "subtitle": "4-Week / 8-Session Executive Mastery & Boardroom Rhetoric",
    "description": "Comprehensive practical coaching programme designed for executives and leaders seeking to command boardrooms, deliver memorable keynotes, master extemporaneous clarity, and project unshakeable composure under high-pressure Q&A.",
    "difficulty": "Advanced",
    "goal": "Executive & Board Pitching",
    "durationWeeks": 4,
    "daysPerWeek": 2,
    "tags": [
      "Executive",
      "Public Speaking",
      "Boardroom",
      "Media & Q&A",
      "Leadership Storytelling"
    ],
    "assignedClientCount": 1,
    "createdAt": "2026-08-01",
    "updatedAt": "2026-09-13",
    "days": [
      {
        "id": "p-exec-s1",
        "dayNumber": 1,
        "name": "Session 1: Communication Assessment & Baseline",
        "focus": "Baseline Diagnostic, Style Evaluation & Speaking Profile",
        "estimatedDurationMin": 90,
        "warmupNotes": "Diaphragmatic resonance humming (3x30s) + articulatory tongue twisters.",
        "cooldownNotes": "Self-reflection notes on verbal cues and baseline delivery habits.",
        "objectives": [
          "Establish individual communication goals and assess challenges faced while speaking",
          "Baseline unguided speaking assessment (evaluating pace, tone, punctuation, verbal cues)",
          "Impromptu speaking exercises under neutral observation",
          "Identify existing strengths and areas requiring refinement",
          "Establish a personalized development framework and speaking profile"
        ],
        "phases": [
          {
            "id": "s1-p1",
            "phaseName": "Review & Vocal Warm-up",
            "durationMin": 10,
            "description": "Diaphragmatic breathwork, resonance hums, and diction release."
          },
          {
            "id": "s1-p2",
            "phaseName": "Core Concept / Instruction",
            "durationMin": 15,
            "description": "Speaker profiles, communication patterns, and unconscious verbal ticks."
          },
          {
            "id": "s1-p3",
            "phaseName": "Demonstration & Analysis",
            "durationMin": 20,
            "description": "Diagnostic review of initial speaking habits and vocal cues."
          },
          {
            "id": "s1-p4",
            "phaseName": "Practical Speaking Exercises",
            "durationMin": 30,
            "description": "3-minute unguided diagnostic presentation and impromptu exercises."
          },
          {
            "id": "s1-p5",
            "phaseName": "Feedback & Assessment",
            "durationMin": 10,
            "description": "Head Coach diagnostic review and strengths/weaknesses matrix."
          },
          {
            "id": "s1-p6",
            "phaseName": "Practice Assignment",
            "durationMin": 5,
            "description": "Briefing on the between-session recording assignment."
          }
        ],
        "assignmentNotes": "Record a 2-minute unscripted reflection on your personal leadership philosophy without notes. Focus on natural rhythm.",
        "exercises": [
          {
            "id": "p-exec-s1-e1",
            "exerciseId": "ex-1",
            "exerciseName": "Unguided Baseline Diagnostic Presentation",
            "primaryMuscle": "Audience Engagement",
            "equipment": "Prepared Manuscript",
            "tempo": "135-145 WPM",
            "coachNotes": "Deliver without preparation or coaching. Coach notes pacing, fillers, and inflection.",
            "sets": [
              {
                "id": "s1-1",
                "setNumber": 1,
                "targetReps": "3:00 min",
                "targetRpe": 7,
                "targetWeightKg": 140,
                "restSeconds": 60
              }
            ]
          }
        ]
      },
      {
        "id": "p-exec-s2",
        "dayNumber": 2,
        "name": "Session 2: Executive Presence & Delivery",
        "focus": "Voice Projection, Authority, Pacing & Physical Presence",
        "estimatedDurationMin": 90,
        "warmupNotes": "Thoracic expansion drills and pitch modulation slides.",
        "cooldownNotes": "Check posture alignment and relaxed jaw release.",
        "objectives": [
          "Developing vocal range, volume, pitch, and rhythm as communicative instruments",
          "Strategic use of pace, pauses, and cadence variations to prevent predictability",
          "Posture, physical presence, and grounded commanding body language",
          "Eye contact, room anchoring, and authentic audience engagement",
          "Developing authority, gravitas, and confidence while speaking"
        ],
        "phases": [
          {
            "id": "s2-p1",
            "phaseName": "Review & Vocal Warm-up",
            "durationMin": 10,
            "description": "Resonance placement, pitch glides, and postural alignment."
          },
          {
            "id": "s2-p2",
            "phaseName": "Core Concept / Instruction",
            "durationMin": 15,
            "description": "The voice as an instrument of authority, pace psychology, and pauses."
          },
          {
            "id": "s2-p3",
            "phaseName": "Demonstration & Analysis",
            "durationMin": 20,
            "description": "Comparative video analysis of commanding vs rushed executive delivery."
          },
          {
            "id": "s2-p4",
            "phaseName": "Practical Speaking Exercises",
            "durationMin": 30,
            "description": "Deliberate pause drills and physical gravitas room command drills."
          },
          {
            "id": "s2-p5",
            "phaseName": "Feedback & Assessment",
            "durationMin": 10,
            "description": "Pace check (WPM analysis) and presence scoring."
          },
          {
            "id": "s2-p6",
            "phaseName": "Practice Assignment",
            "durationMin": 5,
            "description": "Review between-session cadence assignment."
          }
        ],
        "assignmentNotes": "Deliver a 3-minute executive briefing using 3 deliberate tactical pauses (3 seconds each). Target 135\u2013145 WPM.",
        "exercises": [
          {
            "id": "p-exec-s2-e1",
            "exerciseId": "ex-2",
            "exerciseName": "Tactical Pause & Cadence Control Drill",
            "primaryMuscle": "Pacing & Pauses",
            "equipment": "Prepared Manuscript",
            "tempo": "135 WPM Controlled",
            "coachNotes": "Hold intentional silence before transitioning to the operative verb.",
            "sets": [
              {
                "id": "s2-1",
                "setNumber": 1,
                "targetReps": "3:00 min",
                "targetRpe": 8,
                "targetWeightKg": 135,
                "restSeconds": 60
              }
            ]
          }
        ]
      },
      {
        "id": "p-exec-s3",
        "dayNumber": 3,
        "name": "Session 3: Structuring Powerful Speeches",
        "focus": "Logical Progression, Central Message & Seamless Transitions",
        "estimatedDurationMin": 90,
        "warmupNotes": "Tongue twisters for plosive clarity and pitch variety.",
        "cooldownNotes": "Structural memo signposting reflection.",
        "objectives": [
          "Building strong openings that immediately seize audience attention",
          "Sharpening the central message so the audience grasps the core point without effort",
          "Organizing complex information into logical, intuitive progressions",
          "Effective transitions that guide listeners effortlessly between points",
          "Delivering definitive, high-impact conclusions with memorable calls to action"
        ],
        "phases": [
          {
            "id": "s3-p1",
            "phaseName": "Review & Vocal Warm-up",
            "durationMin": 10,
            "description": "Vocal resonance glides and articulation articulators."
          },
          {
            "id": "s3-p2",
            "phaseName": "Core Concept / Instruction",
            "durationMin": 15,
            "description": "Central idea precision, framing complex data, and speech architecture."
          },
          {
            "id": "s3-p3",
            "phaseName": "Demonstration & Analysis",
            "durationMin": 20,
            "description": "Deconstruction of classic keynote structures and structural signposts."
          },
          {
            "id": "s3-p4",
            "phaseName": "Practical Speaking Exercises",
            "durationMin": 30,
            "description": "Drafting and delivering high-impact speech hooks and transitions."
          },
          {
            "id": "s3-p5",
            "phaseName": "Feedback & Assessment",
            "durationMin": 10,
            "description": "Evaluation of clarity, prioritization, and logical momentum."
          },
          {
            "id": "s3-p6",
            "phaseName": "Practice Assignment",
            "durationMin": 5,
            "description": "Briefing on the 5-point strategic memo assignment."
          }
        ],
        "assignmentNotes": "Structure a 5-point strategic initiative into a 3-minute spoken framework using hook, central idea, 3 pillars, and action call.",
        "exercises": [
          {
            "id": "p-exec-s3-e1",
            "exerciseId": "ex-1",
            "exerciseName": "Speech Opening & Hook Delivery",
            "primaryMuscle": "Argumentation & Logic",
            "equipment": "Prepared Manuscript",
            "tempo": "140 WPM",
            "coachNotes": "Seize the room in the first 20 seconds. No pleasantries before the thesis.",
            "sets": [
              {
                "id": "s3-1",
                "setNumber": 1,
                "targetReps": "2:30 min",
                "targetRpe": 8,
                "targetWeightKg": 140,
                "restSeconds": 60
              }
            ]
          }
        ]
      },
      {
        "id": "p-exec-s4",
        "dayNumber": 4,
        "name": "Session 4: Speaking With Clarity & Notes Independence",
        "focus": "Extemporaneous Delivery & Simplifying Complex Ideas",
        "estimatedDurationMin": 90,
        "warmupNotes": "Quick-fire word association and cadence variations.",
        "cooldownNotes": "Review notes dependency checklist.",
        "objectives": [
          "Thinking in core ideas rather than memorized sentences",
          "Speaking extemporaneously without over-reliance on scripts or slides",
          "Communicating complex concepts simply without dumbing down meaning",
          "Concise communication under strict time limits",
          "Adapting the same core message to 30-second, 60-second, and 3-minute formats"
        ],
        "phases": [
          {
            "id": "s4-p1",
            "phaseName": "Review & Vocal Warm-up",
            "durationMin": 10,
            "description": "Articulation agility and breath-supported projection."
          },
          {
            "id": "s4-p2",
            "phaseName": "Core Concept / Instruction",
            "durationMin": 15,
            "description": "Cognitive idea-mapping vs word-by-word memorization."
          },
          {
            "id": "s4-p3",
            "phaseName": "Demonstration & Analysis",
            "durationMin": 20,
            "description": "Live simplification of dense financial or technical briefings."
          },
          {
            "id": "s4-p4",
            "phaseName": "Practical Speaking Exercises",
            "durationMin": 30,
            "description": "Extemporaneous drills: 30s elevator pitch, 60s briefing, 3m keynote."
          },
          {
            "id": "s4-p5",
            "phaseName": "Feedback & Assessment",
            "durationMin": 10,
            "description": "Analysis of filler words, hesitation rate, and message density."
          },
          {
            "id": "s4-p6",
            "phaseName": "Practice Assignment",
            "durationMin": 5,
            "description": "Assignment briefing on 90-second data breakdown."
          }
        ],
        "assignmentNotes": "Deliver a complex quarterly performance breakdown in 90 seconds without slides or notes. Ground your delivery with 2 visceral examples.",
        "exercises": [
          {
            "id": "p-exec-s4-e1",
            "exerciseId": "ex-7",
            "exerciseName": "Extemporaneous Concept Compression",
            "primaryMuscle": "Impromptu Delivery",
            "equipment": "Impromptu Prompt",
            "tempo": "145 WPM",
            "coachNotes": "Explain a complex initiative in 60 seconds using only a 3-word prompt.",
            "sets": [
              {
                "id": "s4-1",
                "setNumber": 1,
                "targetReps": "2:00 min",
                "targetRpe": 9,
                "targetWeightKg": 145,
                "restSeconds": 45
              }
            ]
          }
        ]
      },
      {
        "id": "p-exec-s5",
        "dayNumber": 5,
        "name": "Session 5: Storytelling for Leadership",
        "focus": "Narrative Arcs, Emotional Resonance & Values Transmission",
        "estimatedDurationMin": 90,
        "warmupNotes": "Emotional inflection and expressive vocal coloring.",
        "cooldownNotes": "Story spine and moral takeaway reflection.",
        "objectives": [
          "Identifying powerful personal and professional stories that illustrate leadership values",
          "Mastering narrative structure: hook, stakes, struggle, turning point, and resolution",
          "Creating visceral emotional connection and empathy with diverse audiences",
          "Using stories to communicate organizational vision and inspire teams",
          "Crafting memorable metaphors and stories that stick long after the session"
        ],
        "phases": [
          {
            "id": "s5-p1",
            "phaseName": "Review & Vocal Warm-up",
            "durationMin": 10,
            "description": "Tonal warmth drills and emotional vocal coloring."
          },
          {
            "id": "s5-p2",
            "phaseName": "Core Concept / Instruction",
            "durationMin": 15,
            "description": "The leadership narrative arc: turning raw events into sovereign lessons."
          },
          {
            "id": "s5-p3",
            "phaseName": "Demonstration & Analysis",
            "durationMin": 20,
            "description": "Case study of iconic leadership speeches that shifted organizational history."
          },
          {
            "id": "s5-p4",
            "phaseName": "Practical Speaking Exercises",
            "durationMin": 30,
            "description": "The Leadership Crucible Drill: sharing a defining high-stakes moment."
          },
          {
            "id": "s5-p5",
            "phaseName": "Feedback & Assessment",
            "durationMin": 10,
            "description": "Authenticity, emotional vulnerability, and narrative pacing review."
          },
          {
            "id": "s5-p6",
            "phaseName": "Practice Assignment",
            "durationMin": 5,
            "description": "Refinement briefing for the 4-minute leadership story."
          }
        ],
        "assignmentNotes": "Refine and record a 4-minute leadership crucible narrative. Focus on emotional vulnerability followed by resolute moral conviction.",
        "exercises": [
          {
            "id": "p-exec-s5-e1",
            "exerciseId": "ex-5",
            "exerciseName": "The Leadership Crucible Story Arc",
            "primaryMuscle": "Rhetoric & Storytelling",
            "equipment": "Prepared Manuscript",
            "tempo": "130 WPM Reflective",
            "coachNotes": "Take time on the moment of crisis. Let the audience feel the stakes before the resolution.",
            "sets": [
              {
                "id": "s5-1",
                "setNumber": 1,
                "targetReps": "4:00 min",
                "targetRpe": 8,
                "targetWeightKg": 130,
                "restSeconds": 60
              }
            ]
          }
        ]
      },
      {
        "id": "p-exec-s6",
        "dayNumber": 6,
        "name": "Session 6: Persuasive Communication & Stakeholder Influence",
        "focus": "Classical Rhetoric (Ethos, Logos, Pathos) & Board Alignment",
        "estimatedDurationMin": 90,
        "warmupNotes": "Diaphragmatic power projection and tonal conviction switches.",
        "cooldownNotes": "Rhetorical balance checklist.",
        "objectives": [
          "Classical rhetoric integration: balancing credibility (ethos), logic (logos), and emotion (pathos)",
          "Building instant authority and trust with cynical or resistant stakeholders",
          "Connecting empirical data and business logic directly with human impact",
          "Adapting persuasion styles for different stakeholder groups (investors, board, public)",
          "Delivering an unshakeable, high-conviction call to action"
        ],
        "phases": [
          {
            "id": "s6-p1",
            "phaseName": "Review & Vocal Warm-up",
            "durationMin": 10,
            "description": "Diaphragmatic resonance power and authoritative cadence."
          },
          {
            "id": "s6-p2",
            "phaseName": "Core Concept / Instruction",
            "durationMin": 15,
            "description": "Ethos, logos, pathos balance in boardroom persuasion."
          },
          {
            "id": "s6-p3",
            "phaseName": "Demonstration & Analysis",
            "durationMin": 20,
            "description": "Analyzing board pitch simulations and high-stakes capital allocations."
          },
          {
            "id": "s6-p4",
            "phaseName": "Practical Speaking Exercises",
            "durationMin": 30,
            "description": "The Hostile Board Simulation: pitching under skeptical scrutiny."
          },
          {
            "id": "s6-p5",
            "phaseName": "Feedback & Assessment",
            "durationMin": 10,
            "description": "Rhetorical credibility, argument resilience, and conviction score."
          },
          {
            "id": "s6-p6",
            "phaseName": "Practice Assignment",
            "durationMin": 5,
            "description": "Assignment briefing on executive committee funding pitch."
          }
        ],
        "assignmentNotes": "Deliver a 4-minute pitch convincing an executive board to fund a high-stakes initiative. Blend empirical projections with moral urgency.",
        "exercises": [
          {
            "id": "p-exec-s6-e1",
            "exerciseId": "ex-1",
            "exerciseName": "High-Stakes Boardroom Persuasion",
            "primaryMuscle": "Argumentation & Logic",
            "equipment": "Prepared Manuscript",
            "tempo": "140 WPM",
            "coachNotes": "Lead with credibility, fortify with indisputable logic, close on moral vision.",
            "sets": [
              {
                "id": "s6-1",
                "setNumber": 1,
                "targetReps": "4:00 min",
                "targetRpe": 9,
                "targetWeightKg": 140,
                "restSeconds": 60
              }
            ]
          }
        ]
      },
      {
        "id": "p-exec-s7",
        "dayNumber": 7,
        "name": "Session 7: Handling Questions & High-Pressure Communication",
        "focus": "Media Inquiries, Hostile Questions & Crisis Composure",
        "estimatedDurationMin": 90,
        "warmupNotes": "Breath control under stress and rapid articulation reflex drills.",
        "cooldownNotes": "Q&A debrief and pivot reflection.",
        "objectives": [
          "Impromptu response frameworks (PREP and Bridge-and-Pivot techniques)",
          "Staying composed, measured, and calm under intense questioning",
          "Answering difficult, loaded, or aggressive questions directly and effectively",
          "Managing media-style questioning and rapid-fire press scrums",
          "Avoiding defensive postures, speculation traps, and emotional escalation"
        ],
        "phases": [
          {
            "id": "s7-p1",
            "phaseName": "Review & Vocal Warm-up",
            "durationMin": 10,
            "description": "Heart-rate lowering breathwork and articulatory agility."
          },
          {
            "id": "s7-p2",
            "phaseName": "Core Concept / Instruction",
            "durationMin": 15,
            "description": "Psychological composure, the Bridge-and-Pivot method, and media traps."
          },
          {
            "id": "s7-p3",
            "phaseName": "Demonstration & Analysis",
            "durationMin": 20,
            "description": "Deconstructing press conference masterclasses and crisis management."
          },
          {
            "id": "s7-p4",
            "phaseName": "Practical Speaking Exercises",
            "durationMin": 30,
            "description": "Live Fire Q&A Simulation: 5 rapid challenging cross-examinations."
          },
          {
            "id": "s7-p5",
            "phaseName": "Feedback & Assessment",
            "durationMin": 10,
            "description": "Composure under pressure, non-verbal stillness, and pivot precision."
          },
          {
            "id": "s7-p6",
            "phaseName": "Practice Assignment",
            "durationMin": 5,
            "description": "Assignment briefing on 5 recorded hostile Q&A responses."
          }
        ],
        "assignmentNotes": "Record responses to 5 difficult stakeholder questions using the Bridge-and-Pivot technique. Keep all responses under 45 seconds.",
        "exercises": [
          {
            "id": "p-exec-s7-e1",
            "exerciseId": "ex-7",
            "exerciseName": "Hostile Press & Board Q&A Crossfire",
            "primaryMuscle": "Cross-Examination",
            "equipment": "Cross-Examination",
            "tempo": "Calm, Deliberate Cadence",
            "coachNotes": "Acknowledge the core question, bridge to strategic truth, pivot to forward solution.",
            "sets": [
              {
                "id": "s7-1",
                "setNumber": 1,
                "targetReps": "3:00 min",
                "targetRpe": 9,
                "targetWeightKg": 135,
                "restSeconds": 45
              }
            ]
          }
        ]
      },
      {
        "id": "p-exec-s8",
        "dayNumber": 8,
        "name": "Session 8: Final Executive Speaking Simulation",
        "focus": "Capstone Keynote, Simulated Press Q&A & Baseline Comparison",
        "estimatedDurationMin": 90,
        "warmupNotes": "Full vocal resonance and diaphragm grounding routine.",
        "cooldownNotes": "Portfolio debrief and graduation roadmap.",
        "objectives": [
          "Deliver a prepared 7-minute executive keynote presentation",
          "Impromptu speaking on an unexpected corporate or industry scenario",
          "Simulated Q&A with challenging pushback and press inquiries",
          "Comprehensive final performance assessment and scorecard",
          "Direct comparison with initial Day 1 baseline (pacing, presence, structure, poise)",
          "Establish next-stage sovereign leadership development priorities and maintenance plan"
        ],
        "phases": [
          {
            "id": "s8-p1",
            "phaseName": "Review & Vocal Warm-up",
            "durationMin": 10,
            "description": "Complete physiological grounding, resonance hums, and focus alignment."
          },
          {
            "id": "s8-p2",
            "phaseName": "Core Concept / Instruction",
            "durationMin": 15,
            "description": "Final executive review: presence, mastery, and enduring impact."
          },
          {
            "id": "s8-p3",
            "phaseName": "Demonstration & Analysis",
            "durationMin": 20,
            "description": "Mental readiness protocol and performance state calibration."
          },
          {
            "id": "s8-p4",
            "phaseName": "Practical Speaking Exercises",
            "durationMin": 30,
            "description": "Full Capstone: 7-Minute Keynote + 5-Minute Press & Board Q&A."
          },
          {
            "id": "s8-p5",
            "phaseName": "Feedback & Assessment",
            "durationMin": 10,
            "description": "Day 1 Baseline vs Day 8 Graduation Scorecard & comparative playback."
          },
          {
            "id": "s8-p6",
            "phaseName": "Practice Assignment",
            "durationMin": 5,
            "description": "Personal executive voice manifesto and ongoing maintenance rituals."
          }
        ],
        "assignmentNotes": "Review your baseline vs graduation recording comparison. Establish your weekly 15-minute maintenance ritual in the Speaker App.",
        "exercises": [
          {
            "id": "p-exec-s8-e1",
            "exerciseId": "ex-1",
            "exerciseName": "Capstone Executive Keynote & Board Q&A",
            "primaryMuscle": "Audience Engagement",
            "equipment": "Prepared Manuscript",
            "tempo": "140 WPM Sovereign",
            "coachNotes": "Command the entire chamber. Seamless synthesis of structure, presence, story, and poise.",
            "sets": [
              {
                "id": "s8-1",
                "setNumber": 1,
                "targetReps": "7:00 min",
                "targetRpe": 10,
                "targetWeightKg": 140,
                "restSeconds": 60
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "prog-1",
    "title": "8-Week Championship Debate Masterclass",
    "subtitle": "Elite Parliamentary & Policy Debate Protocol",
    "description": "Rigorous competitive debate curriculum designed for university debaters, moot court advocates, and parliamentary contenders targeting national and world championships.",
    "difficulty": "Advanced",
    "goal": "Competitive Debate",
    "durationWeeks": 8,
    "daysPerWeek": 4,
    "tags": [
      "Parliamentary",
      "British Parliamentary",
      "Policy Debate",
      "Cross-Examination"
    ],
    "assignedClientCount": 2,
    "createdAt": "2026-03-01",
    "updatedAt": "2026-08-10",
    "days": [
      {
        "id": "p1-d1",
        "dayNumber": 1,
        "name": "Day 1: Case Architecture & Aristotelian Framing",
        "focus": "Argumentation & Logic",
        "estimatedDurationMin": 60,
        "warmupNotes": "5 min Diaphragmatic resonance hums + vocal siren glides",
        "cooldownNotes": "Self-reflection notes on argument signposting clarity",
        "exercises": [
          {
            "id": "p1-d1-e1",
            "exerciseId": "ex-1",
            "exerciseName": "Aristotelian Triad Framing (Ethos, Pathos, Logos)",
            "primaryMuscle": "Argumentation & Logic",
            "equipment": "Prepared Manuscript",
            "tempo": "140 WPM Cadence",
            "coachNotes": "Establish clear moral or empirical authority before presenting inductive premises.",
            "sets": [
              {
                "id": "s1",
                "setNumber": 1,
                "targetReps": "3:00 min",
                "targetRpe": 8,
                "targetWeightKg": 140,
                "restSeconds": 60
              },
              {
                "id": "s2",
                "setNumber": 2,
                "targetReps": "3:00 min",
                "targetRpe": 9,
                "targetWeightKg": 145,
                "restSeconds": 60
              },
              {
                "id": "s3",
                "setNumber": 3,
                "targetReps": "4:00 min",
                "targetRpe": 9,
                "targetWeightKg": 150,
                "restSeconds": 90
              }
            ]
          },
          {
            "id": "p1-d1-e2",
            "exerciseId": "ex-8",
            "exerciseName": "Consonant Crispness & Articulation Drills",
            "primaryMuscle": "Clarity & Articulation",
            "equipment": "Prepared Manuscript",
            "tempo": "Accelerating Tempo",
            "coachNotes": "Focus on crisp plosive T, P, K releases.",
            "sets": [
              {
                "id": "s4",
                "setNumber": 1,
                "targetReps": "2:00 min",
                "targetRpe": 7,
                "targetWeightKg": 135,
                "restSeconds": 45
              },
              {
                "id": "s5",
                "setNumber": 2,
                "targetReps": "2:00 min",
                "targetRpe": 8,
                "targetWeightKg": 140,
                "restSeconds": 45
              }
            ]
          }
        ]
      },
      {
        "id": "p1-d2",
        "dayNumber": 2,
        "name": "Day 2: Rapid Rebuttal & Line-by-Line Refutation",
        "focus": "Rebuttal & Refutation",
        "estimatedDurationMin": 60,
        "warmupNotes": "3 min flow sheet reading speed drill",
        "cooldownNotes": "Track dropped arguments vs refuted warrants",
        "exercises": [
          {
            "id": "p1-d2-e1",
            "exerciseId": "ex-5",
            "exerciseName": "Syllogistic Rebuttal & Line-by-Line Refutation",
            "primaryMuscle": "Rebuttal & Refutation",
            "equipment": "Debate Flow Sheet",
            "tempo": "150 WPM Cadence",
            "coachNotes": "Use They Say / We Say / Because / Therefore structure.",
            "sets": [
              {
                "id": "s6",
                "setNumber": 1,
                "targetReps": "4:00 min",
                "targetRpe": 8,
                "targetWeightKg": 145,
                "restSeconds": 60
              },
              {
                "id": "s7",
                "setNumber": 2,
                "targetReps": "4:00 min",
                "targetRpe": 9,
                "targetWeightKg": 150,
                "restSeconds": 60
              },
              {
                "id": "s8",
                "setNumber": 3,
                "targetReps": "5:00 min",
                "targetRpe": 9,
                "targetWeightKg": 155,
                "restSeconds": 90
              }
            ]
          }
        ]
      },
      {
        "id": "p1-d3",
        "dayNumber": 3,
        "name": "Day 3: Cross-Examination & POI Defense",
        "focus": "Cross-Examination",
        "estimatedDurationMin": 50,
        "warmupNotes": "Deep box breathing (4-4-4-4) to lower nervous arousal",
        "cooldownNotes": "Record defensive recovery times on video",
        "exercises": [
          {
            "id": "p1-d3-e1",
            "exerciseId": "ex-3",
            "exerciseName": "Cross-Examination & Rapid POI Defense",
            "primaryMuscle": "Cross-Examination",
            "equipment": "Cross-Examination",
            "tempo": "Variable Cadence",
            "coachNotes": "Never step backward when fielding hostile inquiries.",
            "sets": [
              {
                "id": "s9",
                "setNumber": 1,
                "targetReps": "3:00 min",
                "targetRpe": 8,
                "targetWeightKg": 140,
                "restSeconds": 60
              },
              {
                "id": "s10",
                "setNumber": 2,
                "targetReps": "3:00 min",
                "targetRpe": 9,
                "targetWeightKg": 145,
                "restSeconds": 60
              }
            ]
          }
        ]
      },
      {
        "id": "p1-d4",
        "dayNumber": 4,
        "name": "Day 4: Championship Mock Debate & Floor Flow",
        "focus": "Debate Tactics",
        "estimatedDurationMin": 75,
        "warmupNotes": "Full 10 min speaker vocal and physical calibration",
        "cooldownNotes": "Adjudication ballot review and speaker points breakdown",
        "exercises": [
          {
            "id": "p1-d4-e1",
            "exerciseId": "ex-14",
            "exerciseName": "Oxford Style Floor Speech & Clashing",
            "primaryMuscle": "Argumentation & Logic",
            "equipment": "Debate Flow Sheet",
            "tempo": "145 WPM Cadence",
            "coachNotes": "Address the Chair with formal decorum and deliver decisive clash.",
            "sets": [
              {
                "id": "s11",
                "setNumber": 1,
                "targetReps": "7:00 min",
                "targetRpe": 9,
                "targetWeightKg": 148,
                "restSeconds": 120
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "prog-2",
    "title": "12-Week Executive Oratory & Keynote Mastery",
    "subtitle": "High-Stakes Keynotes, Board Pitches & Stage Presence",
    "description": "Comprehensive keynote and executive oratory conditioning. Built for C-suite leaders, conference keynote speakers, and founders preparing for multimillion-dollar board presentations.",
    "difficulty": "Intermediate",
    "goal": "Keynote & Conference",
    "durationWeeks": 12,
    "daysPerWeek": 3,
    "tags": [
      "Keynote",
      "TEDx",
      "Board Pitching",
      "Stage Presence"
    ],
    "assignedClientCount": 3,
    "createdAt": "2026-04-15",
    "updatedAt": "2026-08-12",
    "days": [
      {
        "id": "p2-d1",
        "dayNumber": 1,
        "name": "Day 1: Narrative Hooks & Spatial Stage Anchoring",
        "focus": "Stage Presence",
        "estimatedDurationMin": 55,
        "warmupNotes": "Full body alignment and posture check",
        "cooldownNotes": "Review stage movement video playback",
        "exercises": [
          {
            "id": "p2-d1-e1",
            "exerciseId": "ex-11",
            "exerciseName": "Keynote Hook & Attention Hijack",
            "primaryMuscle": "Audience Engagement",
            "equipment": "Podium & Microphone",
            "tempo": "130 WPM Cadence",
            "coachNotes": "Silence for 3 seconds before first word. Command the room.",
            "sets": [
              {
                "id": "s12",
                "setNumber": 1,
                "targetReps": "2:00 min",
                "targetRpe": 8,
                "targetWeightKg": 130,
                "restSeconds": 60
              },
              {
                "id": "s13",
                "setNumber": 2,
                "targetReps": "2:00 min",
                "targetRpe": 9,
                "targetWeightKg": 132,
                "restSeconds": 60
              }
            ]
          },
          {
            "id": "p2-d1-e2",
            "exerciseId": "ex-7",
            "exerciseName": "Stage Commanding & Spatial Anchoring",
            "primaryMuscle": "Body Language & Presence",
            "equipment": "Podium & Microphone",
            "tempo": "Deliberate Movement",
            "coachNotes": "Plant feet during core assertions; move only on transitions.",
            "sets": [
              {
                "id": "s14",
                "setNumber": 1,
                "targetReps": "5:00 min",
                "targetRpe": 8,
                "targetWeightKg": 130,
                "restSeconds": 90
              }
            ]
          }
        ]
      },
      {
        "id": "p2-d2",
        "dayNumber": 2,
        "name": "Day 2: Diaphragm Resonance & Strategic Pauses",
        "focus": "Vocal Delivery",
        "estimatedDurationMin": 45,
        "warmupNotes": "Deep belly breathing and lip trill warm-up",
        "cooldownNotes": "Assess filler word reduction",
        "exercises": [
          {
            "id": "p2-d2-e1",
            "exerciseId": "ex-4",
            "exerciseName": "Diaphragmatic Resonance & Vocal Projection",
            "primaryMuscle": "Vocal Modulation",
            "equipment": "Podium & Microphone",
            "tempo": "Sustained Tone",
            "coachNotes": "Project from the pelvic floor and lower abdomen.",
            "sets": [
              {
                "id": "s15",
                "setNumber": 1,
                "targetReps": "3:00 min",
                "targetRpe": 7,
                "targetWeightKg": 125,
                "restSeconds": 45
              },
              {
                "id": "s16",
                "setNumber": 2,
                "targetReps": "3:00 min",
                "targetRpe": 8,
                "targetWeightKg": 128,
                "restSeconds": 45
              }
            ]
          },
          {
            "id": "p2-d2-e2",
            "exerciseId": "ex-6",
            "exerciseName": "Strategic Pauses & Cadence Deceleration",
            "primaryMuscle": "Pacing & Pauses",
            "equipment": "Prepared Manuscript",
            "tempo": "125 WPM Cadence",
            "coachNotes": "2-second dramatic silences before key takeaways.",
            "sets": [
              {
                "id": "s17",
                "setNumber": 1,
                "targetReps": "4:00 min",
                "targetRpe": 8,
                "targetWeightKg": 125,
                "restSeconds": 60
              }
            ]
          }
        ]
      },
      {
        "id": "p2-d3",
        "dayNumber": 3,
        "name": "Day 3: Boardroom Pitching & Slide Harmony",
        "focus": "Argumentation & Logic",
        "estimatedDurationMin": 60,
        "warmupNotes": "Review BLUF structure and slide clicker coordination",
        "cooldownNotes": "Objection handling evaluation and confidence scoring",
        "exercises": [
          {
            "id": "p2-d3-e1",
            "exerciseId": "ex-16",
            "exerciseName": "Executive Boardroom Pitch & Objection Handling",
            "primaryMuscle": "Argumentation & Logic",
            "equipment": "Prepared Manuscript",
            "tempo": "135 WPM Cadence",
            "coachNotes": "State bottom line upfront; address cost and risk immediately.",
            "sets": [
              {
                "id": "s18",
                "setNumber": 1,
                "targetReps": "6:00 min",
                "targetRpe": 9,
                "targetWeightKg": 135,
                "restSeconds": 90
              }
            ]
          },
          {
            "id": "p2-d3-e2",
            "exerciseId": "ex-15",
            "exerciseName": "TED-Style Slide Deck Synchronization",
            "primaryMuscle": "Audience Engagement",
            "equipment": "Slide Deck Presentation",
            "tempo": "Synchronized",
            "coachNotes": "Never read slide text aloud; let the graphic breathe.",
            "sets": [
              {
                "id": "s19",
                "setNumber": 1,
                "targetReps": "5:00 min",
                "targetRpe": 8,
                "targetWeightKg": 130,
                "restSeconds": 60
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "prog-3",
    "title": "6-Week Impromptu Fluency & Extemporaneous Protocol",
    "subtitle": "Master Unseen Prompts & Quick-Fire Rhetoric",
    "description": "High-intensity quick-thinking training to eliminate speech hesitation, eradicate filler words, and structure unscripted addresses on any global topic in under 15 seconds.",
    "difficulty": "Intermediate",
    "goal": "Impromptu & Extemporaneous",
    "durationWeeks": 6,
    "daysPerWeek": 4,
    "tags": [
      "Impromptu",
      "Extemp",
      "PREP Framework",
      "Cadence"
    ],
    "assignedClientCount": 1,
    "createdAt": "2026-05-01",
    "updatedAt": "2026-08-15",
    "days": [
      {
        "id": "p3-d1",
        "dayNumber": 1,
        "name": "Day 1: PREP Framework & 15-Second Prep Speed",
        "focus": "Impromptu Delivery",
        "estimatedDurationMin": 45,
        "warmupNotes": "Quick word association and mental agility warmup",
        "cooldownNotes": "Record filler words tally per speech round",
        "exercises": [
          {
            "id": "p3-d1-e1",
            "exerciseId": "ex-2",
            "exerciseName": "Impromptu 1-2-3 Sprint (PREP Framework)",
            "primaryMuscle": "Impromptu Delivery",
            "equipment": "Impromptu Prompt",
            "tempo": "140 WPM Cadence",
            "coachNotes": "Point -> Reason -> Example -> Point. Strict 15s prep time.",
            "sets": [
              {
                "id": "s20",
                "setNumber": 1,
                "targetReps": "2:00 min",
                "targetRpe": 8,
                "targetWeightKg": 135,
                "restSeconds": 45
              },
              {
                "id": "s21",
                "setNumber": 2,
                "targetReps": "2:00 min",
                "targetRpe": 8,
                "targetWeightKg": 140,
                "restSeconds": 45
              },
              {
                "id": "s22",
                "setNumber": 3,
                "targetReps": "2:00 min",
                "targetRpe": 9,
                "targetWeightKg": 140,
                "restSeconds": 45
              }
            ]
          }
        ]
      },
      {
        "id": "p3-d2",
        "dayNumber": 2,
        "name": "Day 2: Strategic Pauses & Monotone Elimination",
        "focus": "Vocal Delivery",
        "estimatedDurationMin": 40,
        "warmupNotes": "Vocal inflection siren glides (low to high register)",
        "cooldownNotes": "Evaluate pitch variety on recording",
        "exercises": [
          {
            "id": "p3-d2-e1",
            "exerciseId": "ex-13",
            "exerciseName": "Vocal Range & Pitch Variation Sprint",
            "primaryMuscle": "Vocal Modulation",
            "equipment": "Podium & Microphone",
            "tempo": "Expressive Inflection",
            "coachNotes": "Vary pitch deliberately between premise and climax.",
            "sets": [
              {
                "id": "s23",
                "setNumber": 1,
                "targetReps": "3:00 min",
                "targetRpe": 7,
                "targetWeightKg": 130,
                "restSeconds": 45
              },
              {
                "id": "s24",
                "setNumber": 2,
                "targetReps": "3:00 min",
                "targetRpe": 8,
                "targetWeightKg": 135,
                "restSeconds": 45
              }
            ]
          },
          {
            "id": "p3-d2-e2",
            "exerciseId": "ex-6",
            "exerciseName": "Strategic Pauses & Cadence Deceleration",
            "primaryMuscle": "Pacing & Pauses",
            "equipment": "Prepared Manuscript",
            "tempo": "130 WPM Cadence",
            "coachNotes": "Replace every 'um' with a silent inhalation.",
            "sets": [
              {
                "id": "s25",
                "setNumber": 1,
                "targetReps": "3:00 min",
                "targetRpe": 8,
                "targetWeightKg": 130,
                "restSeconds": 60
              }
            ]
          }
        ]
      },
      {
        "id": "p3-d3",
        "dayNumber": 3,
        "name": "Day 3: Metaphor Linking & Unseen Prompt Sprints",
        "focus": "Rhetoric & Storytelling",
        "estimatedDurationMin": 45,
        "warmupNotes": "Metaphor generation brainstorming sprint (5 analogies in 60s)",
        "cooldownNotes": "Review storytelling vividness and sensory cues",
        "exercises": [
          {
            "id": "p3-d3-e1",
            "exerciseId": "ex-9",
            "exerciseName": "Metaphor Weaving & Narrative Arc",
            "primaryMuscle": "Rhetoric & Storytelling",
            "equipment": "Prepared Manuscript",
            "tempo": "135 WPM Cadence",
            "coachNotes": "Build the 3-act tension arc; link back to core thesis.",
            "sets": [
              {
                "id": "s26",
                "setNumber": 1,
                "targetReps": "4:00 min",
                "targetRpe": 8,
                "targetWeightKg": 135,
                "restSeconds": 60
              },
              {
                "id": "s27",
                "setNumber": 2,
                "targetReps": "4:00 min",
                "targetRpe": 9,
                "targetWeightKg": 138,
                "restSeconds": 60
              }
            ]
          }
        ]
      },
      {
        "id": "p3-d4",
        "dayNumber": 4,
        "name": "Day 4: 7-Minute Policy Extemp Run",
        "focus": "Argumentation & Logic",
        "estimatedDurationMin": 50,
        "warmupNotes": "Read 2 foreign policy executive summaries",
        "cooldownNotes": "Timing precision check: did conclusion hit at 6:45?",
        "exercises": [
          {
            "id": "p3-d4-e1",
            "exerciseId": "ex-12",
            "exerciseName": "Extemp 7-Minute Policy Architecture",
            "primaryMuscle": "Argumentation & Logic",
            "equipment": "Impromptu Prompt",
            "tempo": "135 WPM Cadence",
            "coachNotes": "3 contentions, 5 scholarly citations, strict timing.",
            "sets": [
              {
                "id": "s28",
                "setNumber": 1,
                "targetReps": "7:00 min",
                "targetRpe": 9,
                "targetWeightKg": 138,
                "restSeconds": 120
              }
            ]
          }
        ]
      }
    ]
  }
];

export const INITIAL_SCHEDULED_WORKOUTS: ScheduledWorkout[] = [
  {
    "id": "sw-1",
    "clientId": "client-1",
    "clientName": "Marcus Vance",
    "clientAvatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "programId": "prog-1",
    "programName": "8-Week Championship Debate Masterclass",
    "workoutDayId": "p1-d1",
    "workoutTitle": "Case Architecture & Aristotelian Framing",
    "date": "2026-08-16",
    "time": "09:00 AM",
    "status": "Completed",
    "durationMin": 60,
    "rating": 5,
    "clientFeedback": "Felt completely locked in on the Ethos-Logos transitions. Pacing hit 148 WPM with zero strain!",
    "coachFeedback": "Phenomenal delivery Marcus. Your opening hook commanded the room instantly.",
    "totalVolumeKg": 18,
    "prCount": 1,
    "exercises": [
      {
        "id": "sw1-e1",
        "exerciseId": "ex-1",
        "exerciseName": "Aristotelian Triad Framing (Ethos, Pathos, Logos)",
        "primaryMuscle": "Argumentation & Logic",
        "equipment": "Prepared Manuscript",
        "tempo": "140 WPM Cadence",
        "sets": [
          {
            "id": "sw1-s1",
            "setNumber": 1,
            "targetReps": "3:00 min",
            "targetRpe": 8,
            "targetWeightKg": 140,
            "completedReps": 3,
            "completedWeightKg": 142,
            "completedRpe": 8,
            "isCompleted": true
          },
          {
            "id": "sw1-s2",
            "setNumber": 2,
            "targetReps": "3:00 min",
            "targetRpe": 9,
            "targetWeightKg": 145,
            "completedReps": 3,
            "completedWeightKg": 146,
            "completedRpe": 9,
            "isCompleted": true
          },
          {
            "id": "sw1-s3",
            "setNumber": 3,
            "targetReps": "4:00 min",
            "targetRpe": 9,
            "targetWeightKg": 150,
            "completedReps": 4,
            "completedWeightKg": 150,
            "completedRpe": 9,
            "isCompleted": true
          }
        ]
      }
    ]
  },
  {
    "id": "sw-2",
    "clientId": "client-2",
    "clientName": "Elena Rostova",
    "clientAvatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "programId": "prog-2",
    "programName": "12-Week Executive Oratory & Keynote Mastery",
    "workoutDayId": "p2-d1",
    "workoutTitle": "Narrative Hooks & Spatial Stage Anchoring",
    "date": "2026-08-16",
    "time": "11:30 AM",
    "status": "Scheduled",
    "durationMin": 55,
    "rating": null,
    "clientFeedback": null,
    "coachFeedback": null,
    "totalVolumeKg": null,
    "prCount": null,
    "exercises": [
      {
        "id": "sw2-e1",
        "exerciseId": "ex-11",
        "exerciseName": "Keynote Hook & Attention Hijack",
        "primaryMuscle": "Audience Engagement",
        "equipment": "Podium & Microphone",
        "tempo": "130 WPM Cadence",
        "sets": [
          {
            "id": "sw2-s1",
            "setNumber": 1,
            "targetReps": "2:00 min",
            "targetRpe": 8,
            "targetWeightKg": 130
          },
          {
            "id": "sw2-s2",
            "setNumber": 2,
            "targetReps": "2:00 min",
            "targetRpe": 9,
            "targetWeightKg": 132
          }
        ]
      }
    ]
  },
  {
    "id": "sw-3",
    "clientId": "client-3",
    "clientName": "David Kim",
    "clientAvatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "programId": "prog-2",
    "programName": "12-Week Executive Oratory & Keynote Mastery",
    "workoutDayId": "p2-d3",
    "workoutTitle": "Boardroom Pitching & Objection Handling",
    "date": "2026-08-16",
    "time": "02:00 PM",
    "status": "Scheduled",
    "durationMin": 60,
    "rating": null,
    "clientFeedback": null,
    "coachFeedback": null,
    "totalVolumeKg": null,
    "prCount": null,
    "exercises": [
      {
        "id": "sw3-e1",
        "exerciseId": "ex-16",
        "exerciseName": "Executive Boardroom Pitch & Objection Handling",
        "primaryMuscle": "Argumentation & Logic",
        "equipment": "Prepared Manuscript",
        "tempo": "135 WPM Cadence",
        "sets": [
          {
            "id": "sw3-s1",
            "setNumber": 1,
            "targetReps": "6:00 min",
            "targetRpe": 9,
            "targetWeightKg": 135
          }
        ]
      }
    ]
  },
  {
    "id": "sw-4",
    "clientId": "client-4",
    "clientName": "Amina Diallo",
    "clientAvatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "programId": "prog-1",
    "programName": "8-Week Championship Debate Masterclass",
    "workoutDayId": "p1-d4",
    "workoutTitle": "Championship Mock Debate & Floor Flow",
    "date": "2026-08-17",
    "time": "10:00 AM",
    "status": "Scheduled",
    "durationMin": 75,
    "rating": null,
    "clientFeedback": null,
    "coachFeedback": null,
    "totalVolumeKg": null,
    "prCount": null,
    "exercises": [
      {
        "id": "sw4-e1",
        "exerciseId": "ex-14",
        "exerciseName": "Oxford Style Floor Speech & Clashing",
        "primaryMuscle": "Argumentation & Logic",
        "equipment": "Debate Flow Sheet",
        "tempo": "145 WPM Cadence",
        "sets": [
          {
            "id": "sw4-s1",
            "setNumber": 1,
            "targetReps": "7:00 min",
            "targetRpe": 9,
            "targetWeightKg": 148
          }
        ]
      }
    ]
  },
  {
    "id": "sw-5",
    "clientId": "client-5",
    "clientName": "Lucas Moreau",
    "clientAvatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "programId": "prog-3",
    "programName": "6-Week Impromptu Fluency & Extemporaneous Protocol",
    "workoutDayId": "p3-d1",
    "workoutTitle": "PREP Framework & 15-Second Prep Speed",
    "date": "2026-08-15",
    "time": "03:30 PM",
    "status": "Completed",
    "durationMin": 45,
    "rating": 4,
    "clientFeedback": "Only 3 filler words in the second speech! Feeling much more confident thinking on my feet.",
    "coachFeedback": "Major breakthrough Lucas! The 15s silent prep discipline is paying off huge.",
    "totalVolumeKg": 12,
    "prCount": 1,
    "exercises": [
      {
        "id": "sw5-e1",
        "exerciseId": "ex-2",
        "exerciseName": "Impromptu 1-2-3 Sprint (PREP Framework)",
        "primaryMuscle": "Impromptu Delivery",
        "equipment": "Impromptu Prompt",
        "tempo": "140 WPM Cadence",
        "sets": [
          {
            "id": "sw5-s1",
            "setNumber": 1,
            "targetReps": "2:00 min",
            "targetRpe": 8,
            "targetWeightKg": 135,
            "completedReps": 2,
            "completedWeightKg": 132,
            "completedRpe": 8,
            "isCompleted": true
          },
          {
            "id": "sw5-s2",
            "setNumber": 2,
            "targetReps": "2:00 min",
            "targetRpe": 8,
            "targetWeightKg": 140,
            "completedReps": 2,
            "completedWeightKg": 138,
            "completedRpe": 8,
            "isCompleted": true
          }
        ]
      }
    ]
  },
  {
    "id": "sw-6",
    "clientId": "client-6",
    "clientName": "Sarah Jenkins",
    "clientAvatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    "programId": "prog-2",
    "programName": "12-Week Executive Oratory & Keynote Mastery",
    "workoutDayId": "p2-d2",
    "workoutTitle": "Diaphragm Resonance & Strategic Pauses",
    "date": "2026-08-17",
    "time": "04:00 PM",
    "status": "Scheduled",
    "durationMin": 45,
    "rating": null,
    "clientFeedback": null,
    "coachFeedback": null,
    "totalVolumeKg": null,
    "prCount": null,
    "exercises": [
      {
        "id": "sw6-e1",
        "exerciseId": "ex-4",
        "exerciseName": "Diaphragmatic Resonance & Vocal Projection",
        "primaryMuscle": "Vocal Modulation",
        "equipment": "Podium & Microphone",
        "tempo": "Sustained Tone",
        "sets": [
          {
            "id": "sw6-s1",
            "setNumber": 1,
            "targetReps": "3:00 min",
            "targetRpe": 7,
            "targetWeightKg": 125
          }
        ]
      }
    ]
  }
];

export const INITIAL_METRICS: MetricEntry[] = [
  {
    "id": "m-1",
    "clientId": "client-1",
    "date": "2026-05-01",
    "weightKg": 125,
    "bodyFatPercentage": 82.0,
    "chestCm": 14,
    "waistCm": 74,
    "armsCm": 7,
    "notes": "Baseline debate cadence test"
  },
  {
    "id": "m-2",
    "clientId": "client-1",
    "date": "2026-06-01",
    "weightKg": 134,
    "bodyFatPercentage": 86.5,
    "chestCm": 9,
    "waistCm": 76,
    "armsCm": 8,
    "notes": "Signpost structure improved; filler words down to 9"
  },
  {
    "id": "m-3",
    "clientId": "client-1",
    "date": "2026-07-01",
    "weightKg": 142,
    "bodyFatPercentage": 89.0,
    "chestCm": 5,
    "waistCm": 78,
    "armsCm": 9,
    "notes": "Rapid POI defense response time under 3.2 seconds"
  },
  {
    "id": "m-4",
    "clientId": "client-1",
    "date": "2026-08-01",
    "weightKg": 148,
    "bodyFatPercentage": 92.5,
    "chestCm": 2,
    "waistCm": 80,
    "armsCm": 9,
    "notes": "Championship caliber delivery; 148 WPM steady tempo"
  },
  {
    "id": "m-5",
    "clientId": "client-2",
    "date": "2026-05-15",
    "weightKg": 118,
    "bodyFatPercentage": 88.0,
    "chestCm": 6,
    "waistCm": 72,
    "armsCm": 8,
    "notes": "Keynote initial run-through"
  },
  {
    "id": "m-6",
    "clientId": "client-2",
    "date": "2026-06-15",
    "weightKg": 124,
    "bodyFatPercentage": 91.0,
    "chestCm": 4,
    "waistCm": 75,
    "armsCm": 9,
    "notes": "Spatial anchoring across three stage zones refined"
  },
  {
    "id": "m-7",
    "clientId": "client-2",
    "date": "2026-07-15",
    "weightKg": 128,
    "bodyFatPercentage": 94.0,
    "chestCm": 2,
    "waistCm": 77,
    "armsCm": 10,
    "notes": "TEDx rehearsal; standing ovation in mock run"
  },
  {
    "id": "m-8",
    "clientId": "client-2",
    "date": "2026-08-15",
    "weightKg": 132,
    "bodyFatPercentage": 96.0,
    "chestCm": 1,
    "waistCm": 78,
    "armsCm": 10,
    "notes": "Pristine pacing locked for main conference"
  },
  {
    "id": "m-9",
    "clientId": "client-3",
    "date": "2026-04-01",
    "weightKg": 165,
    "bodyFatPercentage": 75.0,
    "chestCm": 22,
    "waistCm": 70,
    "armsCm": 6,
    "notes": "Rushing through investor pitch at 165 WPM"
  },
  {
    "id": "m-10",
    "clientId": "client-3",
    "date": "2026-05-01",
    "weightKg": 160,
    "bodyFatPercentage": 78.0,
    "chestCm": 18,
    "waistCm": 72,
    "armsCm": 7,
    "notes": "Strategic pauses introduced before financial slides"
  },
  {
    "id": "m-11",
    "clientId": "client-3",
    "date": "2026-06-01",
    "weightKg": 155,
    "bodyFatPercentage": 81.0,
    "chestCm": 12,
    "waistCm": 74,
    "armsCm": 8,
    "notes": "BLUF model applied; board deck clarity surging"
  },
  {
    "id": "m-12",
    "clientId": "client-3",
    "date": "2026-08-01",
    "weightKg": 150,
    "bodyFatPercentage": 84.0,
    "chestCm": 8,
    "waistCm": 75,
    "armsCm": 8,
    "notes": "Investor Q&A defusal drills progressing well"
  }
];

export const INITIAL_PRS: PersonalRecord[] = [
  {
    "id": "pr-1",
    "clientId": "client-1",
    "exerciseName": "Aristotelian Triad Framing (Ethos, Pathos, Logos)",
    "weightKg": 150,
    "reps": 4,
    "estimated1RmKg": 160,
    "date": "2026-08-16",
    "previousWeightKg": 142
  },
  {
    "id": "pr-2",
    "clientId": "client-1",
    "exerciseName": "Syllogistic Rebuttal & Line-by-Line Refutation",
    "weightKg": 155,
    "reps": 5,
    "estimated1RmKg": 168,
    "date": "2026-08-10",
    "previousWeightKg": 148
  },
  {
    "id": "pr-3",
    "clientId": "client-2",
    "exerciseName": "Keynote Hook & Attention Hijack",
    "weightKg": 132,
    "reps": 3,
    "estimated1RmKg": 140,
    "date": "2026-08-12",
    "previousWeightKg": 126
  },
  {
    "id": "pr-4",
    "clientId": "client-2",
    "exerciseName": "Stage Commanding & Spatial Anchoring",
    "weightKg": 130,
    "reps": 5,
    "estimated1RmKg": 138,
    "date": "2026-08-05",
    "previousWeightKg": 122
  },
  {
    "id": "pr-5",
    "clientId": "client-3",
    "exerciseName": "Executive Boardroom Pitch & Objection Handling",
    "weightKg": 145,
    "reps": 6,
    "estimated1RmKg": 155,
    "date": "2026-07-28",
    "previousWeightKg": 135
  },
  {
    "id": "pr-6",
    "clientId": "client-4",
    "exerciseName": "Oxford Style Floor Speech & Clashing",
    "weightKg": 148,
    "reps": 7,
    "estimated1RmKg": 158,
    "date": "2026-08-11",
    "previousWeightKg": 140
  },
  {
    "id": "pr-7",
    "clientId": "client-5",
    "exerciseName": "Impromptu 1-2-3 Sprint (PREP Framework)",
    "weightKg": 138,
    "reps": 2,
    "estimated1RmKg": 145,
    "date": "2026-08-15",
    "previousWeightKg": 128
  },
  {
    "id": "pr-8",
    "clientId": "client-6",
    "exerciseName": "Diaphragmatic Resonance & Vocal Projection",
    "weightKg": 132,
    "reps": 3,
    "estimated1RmKg": 140,
    "date": "2026-08-08",
    "previousWeightKg": 124
  }
];

export const INITIAL_HABIT_LOGS: ClientDailyHabitLog[] = [
  {
    "id": "hl-1",
    "clientId": "client-1",
    "date": "2026-08-16",
    "habits": [
      {
        "habitId": "h-1",
        "title": "Morning Diaphragmatic Warm-up",
        "completed": true,
        "currentValue": 10,
        "targetValue": "10",
        "unit": "min"
      },
      {
        "habitId": "h-2",
        "title": "Global Affairs / News Analysis",
        "completed": true,
        "currentValue": 20,
        "targetValue": "15",
        "unit": "min"
      },
      {
        "habitId": "h-3",
        "title": "2-Minute Unseen Impromptu Run",
        "completed": true,
        "currentValue": 1,
        "targetValue": "1",
        "unit": "run"
      },
      {
        "habitId": "h-4",
        "title": "Tongue Twister Enunciation Drill",
        "completed": true,
        "currentValue": 5,
        "targetValue": "5",
        "unit": "min"
      },
      {
        "habitId": "h-5",
        "title": "Vocal Hydration & Rest Protocol",
        "completed": true,
        "currentValue": 2.8,
        "targetValue": "2.5",
        "unit": "L"
      }
    ]
  },
  {
    "id": "hl-2",
    "clientId": "client-2",
    "date": "2026-08-16",
    "habits": [
      {
        "habitId": "h-1",
        "title": "Morning Diaphragmatic Warm-up",
        "completed": true,
        "currentValue": 12,
        "targetValue": "10",
        "unit": "min"
      },
      {
        "habitId": "h-2",
        "title": "Global Affairs / News Analysis",
        "completed": true,
        "currentValue": 15,
        "targetValue": "15",
        "unit": "min"
      },
      {
        "habitId": "h-3",
        "title": "2-Minute Unseen Impromptu Run",
        "completed": false,
        "currentValue": 0,
        "targetValue": "1",
        "unit": "run"
      },
      {
        "habitId": "h-4",
        "title": "Tongue Twister Enunciation Drill",
        "completed": true,
        "currentValue": 5,
        "targetValue": "5",
        "unit": "min"
      },
      {
        "habitId": "h-5",
        "title": "Vocal Hydration & Rest Protocol",
        "completed": true,
        "currentValue": 3.0,
        "targetValue": "2.5",
        "unit": "L"
      }
    ]
  }
];

export const INITIAL_PHOTOS: ProgressPhoto[] = [
  {
    "id": "p-1",
    "clientId": "client-1",
    "date": "2026-08-16",
    "view": "Front",
    "photoUrl": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80",
    "weightKg": 148,
    "bodyFatPercentage": 92.5,
    "notes": "Podium posture check: shoulders relaxed, open chest, hands grounded in neutral speaker zone."
  },
  {
    "id": "p-2",
    "clientId": "client-1",
    "date": "2026-07-16",
    "view": "Side",
    "photoUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
    "weightKg": 142,
    "bodyFatPercentage": 89.0,
    "notes": "Lateral angle during constructive speech: spine aligned, zero forward neck strain."
  },
  {
    "id": "p-3",
    "clientId": "client-2",
    "date": "2026-08-12",
    "view": "Front",
    "photoUrl": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
    "weightKg": 132,
    "bodyFatPercentage": 96.0,
    "notes": "Center stage lighting delivery: natural expansive gestures commanding the entire amphitheater."
  },
  {
    "id": "p-4",
    "clientId": "client-2",
    "date": "2026-07-10",
    "view": "Back",
    "photoUrl": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
    "weightKg": 128,
    "bodyFatPercentage": 94.0,
    "notes": "Stage rear perspective: clear visual synchronization with audience and prompt monitor."
  },
  {
    "id": "p-5",
    "clientId": "client-3",
    "date": "2026-08-01",
    "view": "Front",
    "photoUrl": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
    "weightKg": 150,
    "bodyFatPercentage": 84.0,
    "notes": "Boardroom table stance: authoritative posture, commanding presence during valuation defense."
  },
  {
    "id": "p-6",
    "clientId": "client-5",
    "date": "2026-08-15",
    "view": "Front",
    "photoUrl": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80",
    "weightKg": 126,
    "bodyFatPercentage": 79.0,
    "notes": "First extemporaneous speech without notes: hands grounded without nervous pocketing."
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    "id": "msg-1",
    "clientId": "client-1",
    "sender": "coach",
    "text": "Marcus, your delivery on the climate policy motion yesterday was brilliant. Let's make sure you hold that 2-second pause after your third contention today.",
    "timestamp": "Today, 08:30 AM",
    "isRead": true
  },
  {
    "id": "msg-2",
    "clientId": "client-1",
    "sender": "client",
    "text": "Thanks Coach! The PREP framework made the impromptu rebuttal feel effortless. Reviewing the flow sheet notes now.",
    "timestamp": "Today, 08:45 AM",
    "isRead": true
  },
  {
    "id": "msg-3",
    "clientId": "client-2",
    "sender": "coach",
    "text": "Elena, reviewed your 15-minute keynote video recording. The slide synchronization at Minute 8 was flawless.",
    "timestamp": "Yesterday, 02:15 PM",
    "isRead": true
  },
  {
    "id": "msg-4",
    "clientId": "client-2",
    "sender": "client",
    "text": "Coach, feeling so prepared for the Singapore summit! The diaphragmatic projection is making a noticeable difference in vocal endurance.",
    "timestamp": "Yesterday, 03:00 PM",
    "isRead": true
  },
  {
    "id": "msg-5",
    "clientId": "client-3",
    "sender": "coach",
    "text": "David, let's keep your investor pitch pacing strictly under 140 WPM today. Remember: silence demonstrates confidence, not weakness.",
    "timestamp": "2 days ago",
    "isRead": true
  },
  {
    "id": "msg-6",
    "clientId": "client-4",
    "sender": "coach",
    "text": "Amina, excellent draft on the UN Security Council resolution speech. Your opening rhetorical question sets high stakes.",
    "timestamp": "3 days ago",
    "isRead": true
  },
  {
    "id": "msg-7",
    "clientId": "client-5",
    "sender": "client",
    "text": "Coach, completed my daily 2-minute impromptu drill! Managed to eliminate almost all 'ums' by pausing to breathe.",
    "timestamp": "4 days ago",
    "isRead": true
  }
];

export const INITIAL_ACTIVITY_FEED: ActivityFeedItem[] = [
  {
    "id": "act-1",
    "type": "workout_completed",
    "clientId": "client-1",
    "clientName": "Marcus Vance",
    "clientAvatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "title": "Completed Speech Session",
    "description": "Finished 'Case Architecture & Aristotelian Framing' (60 min) with 5/5 fluency rating.",
    "timestamp": "Today, 09:30 AM",
    "metadata": {
      "weightKg": 148,
      "exerciseName": "Aristotelian Triad Framing",
      "compliance": 94
    }
  },
  {
    "id": "act-2",
    "type": "pr_achieved",
    "clientId": "client-1",
    "clientName": "Marcus Vance",
    "clientAvatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "title": "New Speech Milestone Achieved",
    "description": "Set a new benchmark: 150 WPM cadence with zero filler words on 4-minute constructive speech.",
    "timestamp": "Today, 09:25 AM",
    "metadata": {
      "weightKg": 150,
      "exerciseName": "Aristotelian Triad Framing"
    }
  },
  {
    "id": "act-3",
    "type": "check_in_submitted",
    "clientId": "client-2",
    "clientName": "Elena Rostova",
    "clientAvatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "title": "Weekly Keynote Check-in Submitted",
    "description": "Logged 96% fluency score, 132 WPM pacing, and 7/7 vocal hydration habit completions.",
    "timestamp": "Yesterday, 04:15 PM",
    "metadata": {
      "weightKg": 132,
      "compliance": 98
    }
  },
  {
    "id": "act-4",
    "type": "workout_completed",
    "clientId": "client-5",
    "clientName": "Lucas Moreau",
    "clientAvatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "title": "Completed Impromptu Sprint",
    "description": "Finished 'PREP Framework & 15-Second Prep Speed' (45 min) with 4/5 rating.",
    "timestamp": "Yesterday, 07:00 PM",
    "metadata": {
      "weightKg": 126,
      "exerciseName": "Impromptu 1-2-3 Sprint",
      "compliance": 88
    }
  },
  {
    "id": "act-5",
    "type": "streak_milestone",
    "clientId": "client-4",
    "clientName": "Amina Diallo",
    "clientAvatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "title": "14-Day Rhetoric Habit Streak!",
    "description": "Completed morning vocal warmups and global affairs analysis for 14 consecutive days.",
    "timestamp": "2 days ago",
    "metadata": {
      "compliance": 96
    }
  }
];

export const HABIT_TEMPLATES: HabitItem[] = [
  {
    "id": "h-1",
    "title": "Morning Diaphragmatic Warm-up",
    "targetValue": "10",
    "unit": "min",
    "iconName": "Mic",
    "category": "Mindset"
  },
  {
    "id": "h-2",
    "title": "Global Affairs / News Analysis",
    "targetValue": "15",
    "unit": "min",
    "iconName": "BookOpen",
    "category": "Activity"
  },
  {
    "id": "h-3",
    "title": "2-Minute Unseen Impromptu Run",
    "targetValue": "1",
    "unit": "run",
    "iconName": "Zap",
    "category": "Activity"
  },
  {
    "id": "h-4",
    "title": "Tongue Twister Enunciation Drill",
    "targetValue": "5",
    "unit": "min",
    "iconName": "Volume2",
    "category": "Recovery"
  },
  {
    "id": "h-5",
    "title": "Vocal Hydration & Rest Protocol",
    "targetValue": "2.5",
    "unit": "L",
    "iconName": "Droplet",
    "category": "Nutrition"
  }
];
