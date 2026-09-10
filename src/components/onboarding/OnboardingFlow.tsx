import React, { useState } from 'react';
import { 
  GraduationCap, 
  HeartHandshake, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Volume2, 
  Heart, 
  Compass, 
  ShieldCheck, 
  Mic, 
  CheckCircle2, 
  User, 
  Mail, 
  Clock, 
  Smile, 
  Award,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BranchType, SpeakingGoal, ExperienceLevel, SpeakerOnboardingData } from '../../types';

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding, setCurrentPortal } = useApp();

  // Step Tracker (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const initialBranch = (localStorage.getItem('globalorators_selected_branch') as BranchType) || 'Foundation';
  const [branch, setBranch] = useState<BranchType>(initialBranch);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number>(20);

  const [speakingGoal, setSpeakingGoal] = useState<SpeakingGoal>(
    branch === 'Academy' ? 'Competitive Debate' : 'Cathartic Expression & Healing'
  );

  const [missionFocus, setMissionFocus] = useState<string>(
    branch === 'Academy' 
      ? 'Pan-African Leadership & Cognitive Deconditioning'
      : 'Speaking as a Form of Escapism & Catharsis from Adversity'
  );

  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Novice Speaker');
  const [vocalBaselinePace, setVocalBaselinePace] = useState<number>(135);
  const [emotionalOpennessRating, setEmotionalOpennessRating] = useState<number>(7);

  const [selectedHabits, setSelectedHabits] = useState<string[]>([
    'Vocal Hydration (2.5L + Warm Lemon Water)',
    'Diaphragmatic Breathwork (5 Min Morning Routine)',
    'Cathartic Voice Journaling (1-Min Audio Reflection)'
  ]);

  const [primaryObstacle, setPrimaryObstacle] = useState('Nervous Tension & Panic Freezing');

  // Toggle Habits
  const handleToggleHabit = (habit: string) => {
    setSelectedHabits(prev => 
      prev.includes(habit) ? prev.filter(h => h !== habit) : [...prev, habit]
    );
  };

  // Next Step validation
  const handleNext = () => {
    if (currentStep === 3) {
      if (!fullName.trim()) {
        alert('Please enter your name to personalize your curriculum.');
        return;
      }
      if (!email.trim()) {
        alert('Please enter your email.');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleFinish = () => {
    const data: SpeakerOnboardingData = {
      branch,
      fullName: fullName.trim() || (branch === 'Academy' ? 'Kwame Mensah' : 'Nia Adebayo'),
      email: email.trim() || 'speaker@globalorators.org',
      age,
      missionFocus,
      speakingGoal,
      experienceLevel,
      vocalBaselinePace,
      emotionalOpennessRating,
      selectedHabits,
      bioNotes: `${branch} member committed to ${missionFocus}. Primary focus: overcoming ${primaryObstacle}.`
    };

    completeOnboarding(data);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-850">
        <button
          onClick={() => setCurrentPortal('landing')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(step => (
              <div
                key={step}
                className={`w-2 sm:w-6 h-1.5 rounded-full transition-all ${
                  step === currentStep 
                    ? 'bg-[#C89630]' 
                    : step < currentStep 
                    ? 'bg-[#C89630]/60' 
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono text-slate-400 ml-1">
            Step {currentStep} of 5
          </span>
        </div>
      </div>

      {/* Main Questionnaire Container */}
      <div className="max-w-2xl mx-auto w-full my-auto py-8">
        {/* STEP 1: Branch Selection */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#C89630] px-2.5 py-1 rounded-md bg-[#C89630]/10 border border-[#C89630]/20">
                Step 1 of 5
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mt-3">
                Choose Your Functional Branch
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Select the Global Orators pathway tailored to your journey and aspirations.
              </p>
            </div>

            {/* 2-Column Responsive Grid on Mobile & Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Academy */}
              <button
                type="button"
                onClick={() => {
                  setBranch('Academy');
                  setSpeakingGoal('Competitive Debate');
                  setMissionFocus('Pan-African Leadership & Cognitive Deconditioning');
                }}
                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  branch === 'Academy'
                    ? 'bg-[#C89630]/10 border-[#C89630] ring-2 ring-[#C89630]/20 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {branch === 'Academy' && (
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#C89630] text-slate-950 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#C89630]/15 text-[#C89630] border border-[#C89630]/30 flex items-center justify-center mb-3">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-mono uppercase font-extrabold tracking-widest text-[#C89630]">
                    Competitive Forensics & Leadership
                  </div>
                  <h3 className="text-base font-serif font-bold text-white mt-1 mb-2">
                    Global Orators Academy
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Professional speech & parliamentary debate training. Focuses on cognitive enlightenment, tournament squads, executive pitching, and institutional leadership.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                  Ideal for debaters, varsity students & corporate speakers.
                </div>
              </button>

              {/* Option B: Foundation */}
              <button
                type="button"
                onClick={() => {
                  setBranch('Foundation');
                  setSpeakingGoal('Cathartic Expression & Healing');
                  setMissionFocus('Speaking as a Form of Escapism & Catharsis from Adversity');
                }}
                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  branch === 'Foundation'
                    ? 'bg-[#2E684D]/20 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {branch === 'Foundation' && (
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div className="text-[10px] font-mono uppercase font-extrabold tracking-widest text-emerald-400">
                    Grant-Funded Non-Profit Arm
                  </div>
                  <h3 className="text-base font-serif font-bold text-white mt-1 mb-2">
                    Global Orators Foundation
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    100% sponsored fellowships. Equipping youth in children's homes to overcome trauma & abuse, breaking patriarchal silence through therapeutic vocal catharsis.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                  Ideal for personal healing, vulnerability & youth advocacy.
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Mission & Purpose Selection */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Step 2 of 5 • {branch} Track
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Define Your Core Speaking Mission
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                What breakthrough do you want your voice to manifest?
              </p>
            </div>

            {/* Dynamic mission options depending on branch */}
            <div className="space-y-2.5">
              {branch === 'Academy' ? (
                <>
                  {[
                    {
                      title: 'Pan-African Leadership & Cognitive Deconditioning',
                      goal: 'Pan-African Leadership' as SpeakingGoal,
                      desc: 'Dismantling colonial social conditioning and external dependency through sovereign economic and political discourse.'
                    },
                    {
                      title: 'Competitive Parliamentary Debate (BP / Worlds Format)',
                      goal: 'Competitive Debate' as SpeakingGoal,
                      desc: 'Preparing for national championships, Karl Popper, and World Universities Debating Championship.'
                    },
                    {
                      title: 'Executive & Investor Boardroom Pitching',
                      goal: 'Executive & Board Pitching' as SpeakingGoal,
                      desc: 'Defending capital allocation, venture capital narratives, and corporate negotiation.'
                    },
                    {
                      title: 'Keynote & Main Stage Conference Oratory',
                      goal: 'Keynote & Conference' as SpeakingGoal,
                      desc: 'Mastering spatial commanding, teleprompters, and audience engagement at scale.'
                    }
                  ].map(item => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => {
                        setMissionFocus(item.title);
                        setSpeakingGoal(item.goal);
                      }}
                      className={`w-full p-4 rounded-xl border text-left flex items-start justify-between transition-all ${
                        missionFocus === item.title
                          ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/30'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                      {missionFocus === item.title && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-3 mt-0.5" />
                      )}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[
                    {
                      title: 'Speaking as a Form of Escapism & Emotional Catharsis',
                      goal: 'Cathartic Expression & Healing' as SpeakingGoal,
                      desc: 'Experiencing the visceral emotional relief that comes from vocalizing suppressed feelings in a safe space.'
                    },
                    {
                      title: 'Breaking Patriarchal & Generational Silence',
                      goal: 'Cathartic Expression & Healing' as SpeakingGoal,
                      desc: 'Overcoming cultural conditioning that equates emotional vulnerability and tears with weakness.'
                    },
                    {
                      title: 'Trauma-to-Advocacy Voice Discovery',
                      goal: 'Trauma Storytelling & Advocacy' as SpeakingGoal,
                      desc: 'Transforming painful lived experiences into powerful advocacy to prevent abuse of children and youth.'
                    },
                    {
                      title: 'Conquering Social Anxiety & Speech Isolation',
                      goal: 'Impromptu & Extemporaneous' as SpeakingGoal,
                      desc: 'Grounded somatic vocalization drills to dismantle fight-or-flight stage panic.'
                    }
                  ].map(item => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => {
                        setMissionFocus(item.title);
                        setSpeakingGoal(item.goal);
                      }}
                      className={`w-full p-4 rounded-xl border text-left flex items-start justify-between transition-all ${
                        missionFocus === item.title
                          ? 'bg-teal-950/40 border-teal-500 text-white ring-1 ring-teal-500/30'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                      {missionFocus === item.title && (
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 ml-3 mt-0.5" />
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Vocal & Personal Baseline */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Step 3 of 5
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Personal & Vocal Baseline
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Help Coach Qassim calibrate your speech metrics and comfortable cadence.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Nia Adebayo"
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nia@example.org"
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 2-Column Mobile Grid for Age and Experience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Your Age
                  </label>
                  <input
                    type="number"
                    min={12}
                    max={65}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Novice Speaker">Novice Speaker (&lt;1 year)</option>
                    <option value="Club Debater">Club Debater (1-3 years)</option>
                    <option value="Varsity / Advanced">Varsity / Advanced (3-6 years)</option>
                    <option value="Master Orator">Master Orator (6+ years)</option>
                  </select>
                </div>
              </div>

              {/* Speaking Pace baseline */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Comfortable Speaking Pace: <span className="text-emerald-400 font-mono">{vocalBaselinePace} WPM</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Normal conversation is ~130-150 WPM</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={180}
                  step={5}
                  value={vocalBaselinePace}
                  onChange={(e) => setVocalBaselinePace(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Emotional Openness */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Current Comfort With Vulnerability & Expression: <span className="text-teal-400 font-mono">{emotionalOpennessRating} / 10</span>
                  </label>
                  <span className="text-[10px] text-slate-500">1 = Guarded • 10 = Fully Open</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={emotionalOpennessRating}
                  onChange={(e) => setEmotionalOpennessRating(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Daily Habits Commitment */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Step 4 of 5
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Commit to Daily Orator Habits
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Great orators are forged through micro-habits. Select your daily rituals.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  title: 'Vocal Hydration (2.5L + Warm Lemon Water)',
                  desc: 'Protects delicate vocal cord mucosa and prevents hoarseness.'
                },
                {
                  title: 'Diaphragmatic Breathwork (5 Min Morning Routine)',
                  desc: 'Calms nervous system, relieves anxiety, and expands resonance.'
                },
                {
                  title: 'Cathartic Voice Journaling (1-Min Audio Reflection)',
                  desc: 'Speaking freely into the audio vault as emotional escapism.'
                },
                {
                  title: 'Pan-African & Current Affairs Reading (10 Min Daily)',
                  desc: 'Sharpens cognitive familiarity with socio-economic realities.'
                },
                {
                  title: 'Tongue Twisters & Articulation Warmups',
                  desc: 'Eliminates mumbling and builds crisp consonant enunciation.'
                }
              ].map(habit => {
                const isSelected = selectedHabits.includes(habit.title);
                return (
                  <button
                    key={habit.title}
                    type="button"
                    onClick={() => handleToggleHabit(habit.title)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{habit.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{habit.desc}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ml-3 ${
                        isSelected ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Review & Personalized Generation */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Step 5 of 5 • Complete
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Your Protocol is Formulated!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Welcome to the Global Orators Project. Your personalized client portal is ready.
              </p>
            </div>

            {/* Speaker Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                    {fullName.charAt(0) || (branch === 'Academy' ? 'K' : 'N')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{fullName || 'New Orator'}</h3>
                    <div className="text-xs text-slate-400">{email || 'speaker@globalorators.org'}</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${
                    branch === 'Academy'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                  }`}
                >
                  {branch} Scholar
                </span>
              </div>

              {/* 2-Column Mobile Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80 mb-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Speaking Mission</div>
                  <div className="text-xs font-semibold text-white truncate mt-0.5">{speakingGoal}</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Starting Baseline</div>
                  <div className="text-xs font-semibold text-emerald-400 mt-0.5">{vocalBaselinePace} WPM</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Vulnerability Openness</div>
                  <div className="text-xs font-semibold text-teal-400 mt-0.5">{emotionalOpennessRating} / 10</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Habits Committed</div>
                  <div className="text-xs font-semibold text-white mt-0.5">{selectedHabits.length} Daily Rituals</div>
                </div>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Coach Qassim's Welcome:</strong> "Your path in {branch} is designed to awaken self-development and therapeutic expression. Enter your portal to begin your first drill."
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls Bar */}
      <div className="max-w-2xl mx-auto w-full pt-6 border-t border-slate-850 flex items-center justify-between">
        {currentStep > 1 ? (
          <button
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < 5 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-[#C89630] text-slate-950 font-serif font-bold text-xs hover:bg-[#B37D22] flex items-center gap-2 shadow-lg shadow-[#C89630]/20 ml-auto cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="px-6 py-2.5 rounded-xl bg-[#C89630] text-slate-950 font-serif font-bold text-xs hover:bg-[#B37D22] flex items-center gap-2 shadow-xl shadow-[#C89630]/25 ml-auto cursor-pointer"
          >
            <span>Enter My Speaker Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
