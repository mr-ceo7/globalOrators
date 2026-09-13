import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  HeartHandshake, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Volume2, 
  Heart, 
  Compass, 
  ShieldCheck, 
  Mic, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone,
  Clock, 
  Smile, 
  Award,
  BookOpen,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BranchType, SpeakingGoal, ExperienceLevel, SpeakerOnboardingData } from '../../types';
import {
  sanitizeText,
  sanitizeMultiline,
  sanitizeEmail,
  validateEmail,
  sanitizePhone,
  validatePhone,
  validateName,
  sanitizeInteger
} from '../../utils/sanitization';

export interface Step3FormatOption {
  id: string;
  name: string;
  code: string;
  desc: string;
}

export interface Step3PriorityOption {
  id: string;
  label: string;
  sub: string;
}

export interface Step3CadencePreset {
  label: string;
  wpm: number;
  desc: string;
}

export interface Step3ProfileConfig {
  badge: string;
  title: string;
  subtitle: string;
  identitySectionLabel: string;
  namePlaceholder: string;
  institutionLabel: string;
  institutionPlaceholder: string;
  experienceLabel: string;
  experienceOptions: { value: ExperienceLevel; label: string }[];
  formatSectionLabel: string;
  formatSectionSub: string;
  formats: Step3FormatOption[];
  prioritySectionLabel: string;
  prioritySectionSub: string;
  priorities: Step3PriorityOption[];
  cadenceSubtitle: string;
  cadencePresets: Step3CadencePreset[];
  cadenceMin: number;
  cadenceMax: number;
  cadenceDefault: number;
  cadenceMinLabel: string;
  cadenceMidLabel: string;
  cadenceMaxLabel: string;
}

export const getStep3Config = (branch: BranchType, missionFocus: string): Step3ProfileConfig => {
  if (branch === 'Academy') {
    if (missionFocus.includes('Competitive') || missionFocus.includes('Debate')) {
      return {
        badge: 'Step 3 of 5 • Tournament Forensics Calibration',
        title: 'Competitive Forensics Baseline',
        subtitle: 'Calibrate your tournament circuit, debating format, and motion rebuttal metrics with the faculty.',
        identitySectionLabel: 'Personal & Institutional Identity',
        namePlaceholder: 'e.g. Kwame Mensah',
        institutionLabel: 'University / Debate Society / School',
        institutionPlaceholder: 'e.g. Strathmore Debate Society / Harvard Forensics',
        experienceLabel: 'Debate Tier',
        experienceOptions: [
          { value: 'Novice Speaker', label: 'Novice Debater (<1 yr)' },
          { value: 'Club Debater', label: 'Circuit Debater (1-3 yrs)' },
          { value: 'Varsity / Advanced', label: 'Varsity Champion (3-6 yrs)' },
          { value: 'Master Orator', label: 'Chief Adjudicator / Master (6+ yrs)' }
        ],
        formatSectionLabel: 'Primary Forensics Format',
        formatSectionSub: 'Select Tournament Ruleset',
        formats: [
          {
            id: 'British Parliamentary (BP)',
            name: 'British Parliamentary',
            code: 'BP Circuit',
            desc: '7-minute speeches, POIs & rapid opening/closing half strategy.'
          },
          {
            id: 'World Schools Debating (WSDC)',
            name: 'World Schools (WSDC)',
            code: '3v3 Format',
            desc: '8-minute speeches, substantive motions & principled reply speeches.'
          },
          {
            id: 'American Parliamentary (APDA)',
            name: 'American Parliamentary',
            code: 'APDA Format',
            desc: 'Case construction, tight Gov/Opp dynamics & fast rebuttals.'
          },
          {
            id: 'Karl Popper & Public Forum',
            name: 'Karl Popper / Public Forum',
            code: 'Public Forum',
            desc: 'Cross-examination, evidence cards & audience argumentation.'
          }
        ],
        prioritySectionLabel: 'Technical Development Priority',
        prioritySectionSub: 'Curriculum Emphasis',
        priorities: [
          {
            id: 'Argumentation & Rebuttal Depth',
            label: 'Argumentation & Rebuttal',
            sub: 'Comparative weighing & extensions'
          },
          {
            id: 'Rhetorical Cadence & Fluency',
            label: 'Rhetorical Cadence',
            sub: 'Vocal modulation & zero filler words'
          },
          {
            id: 'Stage Poise & Vocal Projection',
            label: 'Stage Poise & Projection',
            sub: 'Diaphragmatic power & podium poise'
          },
          {
            id: 'Motion Analysis & Strategic POIs',
            label: 'Motion Analysis & POIs',
            sub: 'Burden allocation & strategic points'
          }
        ],
        cadenceSubtitle: 'Calibrated delivery rhythm for tournament rebuttals and point extensions:',
        cadencePresets: [
          { label: 'Measured', wpm: 130, desc: 'Solemn rhetoric' },
          { label: 'Conversational', wpm: 145, desc: 'Balanced dynamic' },
          { label: 'Forensics Pace', wpm: 165, desc: 'Tournament rebuttal' }
        ],
        cadenceMin: 120,
        cadenceMax: 185,
        cadenceDefault: 165,
        cadenceMinLabel: '120 WPM (Deliberate Substantive)',
        cadenceMidLabel: '150 WPM (Conversational Extension)',
        cadenceMaxLabel: '185 WPM (Forensics Rebuttal)'
      };
    }

    if (missionFocus.includes('Executive') || missionFocus.includes('Pitching')) {
      return {
        badge: 'Step 3 of 5 • Executive Voice Calibration',
        title: 'Executive & Capital Pitch Baseline',
        subtitle: 'Calibrate your venture narrative, corporate boardroom defense, and investor persuasion metrics.',
        identitySectionLabel: 'Executive & Enterprise Identity',
        namePlaceholder: 'e.g. Farida Mwangi',
        institutionLabel: 'Company / Venture / Incubator',
        institutionPlaceholder: 'e.g. Nairobi Tech Lab / Sovereign Capital Africa',
        experienceLabel: 'Executive Stage',
        experienceOptions: [
          { value: 'Novice Speaker', label: 'First-Time Founder (<1 yr)' },
          { value: 'Club Debater', label: 'Seed Stage Pitcher (1-3 yrs)' },
          { value: 'Varsity / Advanced', label: 'Growth Executive (3-6 yrs)' },
          { value: 'Master Orator', label: 'Boardroom Veteran (6+ yrs)' }
        ],
        formatSectionLabel: 'Boardroom & Commercial Format',
        formatSectionSub: 'Select Persuasion Arena',
        formats: [
          {
            id: 'VC Investment Pitch (Seed/Series A)',
            name: 'VC Investment Pitch',
            code: 'Pitch Deck',
            desc: '3-5 min deck narrative, traction defense & financial defensibility.'
          },
          {
            id: 'Executive Boardroom Defense',
            name: 'Boardroom Defense',
            code: 'Governance',
            desc: 'Strategic budget defense, governance review & shareholder alignment.'
          },
          {
            id: 'High-Stakes Deal Negotiation',
            name: 'Commercial Negotiation',
            code: 'Deal Room',
            desc: 'Tactical concessions, principled bargaining & counter-proposal defense.'
          },
          {
            id: 'Fireside Keynote & Press Briefing',
            name: 'Press & Industry Briefing',
            code: 'Media Voice',
            desc: 'Crisis comms, product unveiling & authoritative media soundbites.'
          }
        ],
        prioritySectionLabel: 'Executive Competency Priority',
        prioritySectionSub: 'Commercial Emphasis',
        priorities: [
          {
            id: 'Concise Metric Defensibility',
            label: 'Metric Defensibility',
            sub: 'Unit economics & data under fire'
          },
          {
            id: 'Executive Gravitas & Poise',
            label: 'Executive Gravitas',
            sub: 'Unshakable calm under interrogation'
          },
          {
            id: 'Narrative Arc & Market Tension',
            label: 'Commercial Narrative',
            sub: 'Hook, urgency & commercial moats'
          },
          {
            id: 'Objection Handling Under Fire',
            label: 'Hostile Q&A Defense',
            sub: 'Deflecting investor skepticism with poise'
          }
        ],
        cadenceSubtitle: 'Calibrated speaking tempo for investor pitch desks and boardroom governance:',
        cadencePresets: [
          { label: 'Authoritative', wpm: 130, desc: 'Boardroom defense' },
          { label: 'Magnetic', wpm: 145, desc: 'Investor pitch' },
          { label: 'Rapid Defense', wpm: 160, desc: 'Hostile questioning' }
        ],
        cadenceMin: 120,
        cadenceMax: 175,
        cadenceDefault: 145,
        cadenceMinLabel: '120 WPM (Authoritative Boardroom)',
        cadenceMidLabel: '145 WPM (Magnetic Pitch Flow)',
        cadenceMaxLabel: '175 WPM (Rapid Hostile Q&A)'
      };
    }

    if (missionFocus.includes('Keynote') || missionFocus.includes('Conference')) {
      return {
        badge: 'Step 3 of 5 • Keynote Orator Calibration',
        title: 'Main Stage & Keynote Baseline',
        subtitle: 'Calibrate spatial staging, teleprompter mastery, and arena-scale keynote dynamics.',
        identitySectionLabel: 'Keynote & Platform Identity',
        namePlaceholder: 'e.g. David Ochieng',
        institutionLabel: 'Speaking Agency / Forum / Industry',
        institutionPlaceholder: 'e.g. Pan-African Speaker Bureau / Independent Keynoter',
        experienceLabel: 'Stage Mastery',
        experienceOptions: [
          { value: 'Novice Speaker', label: 'Aspiring Keynoter (<1 yr)' },
          { value: 'Club Debater', label: 'Panelist & Host (1-3 yrs)' },
          { value: 'Varsity / Advanced', label: 'Main Stage Keynoter (3-6 yrs)' },
          { value: 'Master Orator', label: 'Hall of Fame Orator (6+ yrs)' }
        ],
        formatSectionLabel: 'Stage & Keynote Format',
        formatSectionSub: 'Select Stage Dynamic',
        formats: [
          {
            id: 'Auditorium Keynote Address',
            name: 'Auditorium Keynote',
            code: 'Main Stage',
            desc: '45-minute vision address, multi-tier staging & audience call-to-action.'
          },
          {
            id: 'TED-Style Provocation (12-Min)',
            name: '12-Min Provocation',
            code: 'Idea Provocation',
            desc: 'Tight conceptual hook, single memorable narrative & profound takeaway.'
          },
          {
            id: 'Ceremonial & Commencement Address',
            name: 'Ceremonial Address',
            code: 'Solemn Occasion',
            desc: 'Commencement, inaugural honors & timeless cultural celebration.'
          },
          {
            id: 'Global Summit Plenary',
            name: 'Summit Plenary Address',
            code: 'Plenary Hall',
            desc: 'Diplomatic assembly, multilingual audience & geopolitical gravitas.'
          }
        ],
        prioritySectionLabel: 'Stagecraft Development Priority',
        prioritySectionSub: 'Arena Performance',
        priorities: [
          {
            id: 'Spatial Staging & Anchoring',
            label: 'Spatial Staging & Walk',
            sub: 'Podium command & intentional physical anchoring'
          },
          {
            id: 'Vocal Modulation & Crescendo',
            label: 'Modulation & Crescendo',
            sub: 'Dynamic pitch range & dramatic pause'
          },
          {
            id: 'Story Architecture & Hooks',
            label: 'Story Architecture',
            sub: "Hero's journey & visceral opening hooks"
          },
          {
            id: 'Teleprompter & Podium Poise',
            label: 'Teleprompter Poise',
            sub: 'Natural eye line & effortless script delivery'
          }
        ],
        cadenceSubtitle: 'Calibrated delivery rhythm for plenary halls and auditorium acoustics:',
        cadencePresets: [
          { label: 'Resonant', wpm: 120, desc: 'Dramatic plenary' },
          { label: 'Conference Flow', wpm: 140, desc: 'Main stage keynote' },
          { label: 'Climactic Surge', wpm: 155, desc: 'Call to action' }
        ],
        cadenceMin: 110,
        cadenceMax: 170,
        cadenceDefault: 140,
        cadenceMinLabel: '110 WPM (Dramatic Resonant Pause)',
        cadenceMidLabel: '140 WPM (Dynamic Conference Flow)',
        cadenceMaxLabel: '170 WPM (Climactic Orator Surge)'
      };
    }

    if (missionFocus.includes('Other')) {
      return {
        badge: 'Step 3 of 5 • Bespoke Speaking Baseline',
        title: 'Bespoke Oratory & Rhetoric Baseline',
        subtitle: 'Calibrate your personalized speaking trajectory, target arena, and technical priorities with the faculty.',
        identitySectionLabel: 'Personal & Professional Identity',
        namePlaceholder: 'e.g. Kwame Mensah',
        institutionLabel: 'Organization / Company / Affiliation',
        institutionPlaceholder: 'e.g. Independent Speaker / Specialized Field',
        experienceLabel: 'Speaking Experience',
        experienceOptions: [
          { value: 'Novice Speaker', label: 'Emerging Speaker (<1 yr)' },
          { value: 'Club Debater', label: 'Active Speaker (1-3 yrs)' },
          { value: 'Varsity / Advanced', label: 'Experienced Orator (3-6 yrs)' },
          { value: 'Master Orator', label: 'Master Speaker (6+ yrs)' }
        ],
        formatSectionLabel: 'Primary Speaking Format',
        formatSectionSub: 'Select Target Arena',
        formats: [
          {
            id: 'Keynote & Main Stage Address',
            name: 'Keynote Address',
            code: 'Main Stage',
            desc: 'Plenary halls, conferences, and high-impact audience addresses.'
          },
          {
            id: 'Competitive Forensics & Debate',
            name: 'Competitive Forensics',
            code: 'Debate Arena',
            desc: 'Parliamentary debate, moot court & adversarial argumentation.'
          },
          {
            id: 'Executive & Strategic Pitching',
            name: 'Executive Pitching',
            code: 'Boardroom',
            desc: 'Boardroom defense, investor decks & high-stakes negotiation.'
          },
          {
            id: 'Bespoke / Multi-Format Arena',
            name: 'Bespoke Speaking Arena',
            code: 'Custom Arena',
            desc: 'Tailored format adapted to your specific speaking domain and goals.'
          }
        ],
        prioritySectionLabel: 'Primary Development Focus',
        prioritySectionSub: 'Curriculum Emphasis',
        priorities: [
          {
            id: 'Clarity, Cadence & Vocal Projection',
            label: 'Clarity & Projection',
            sub: 'Diaphragmatic resonance & crisp articulation'
          },
          {
            id: 'Argument Architecture & Persuasion',
            label: 'Argument Architecture',
            sub: 'Logical case building & compelling narrative flow'
          },
          {
            id: 'Stage Poise & Overcoming Freeze Response',
            label: 'Poise & Confidence',
            sub: 'Grounded physical anchoring & nervous calm'
          },
          {
            id: 'Impromptu Thinking & Hostile Q&A',
            label: 'Impromptu Mastery',
            sub: 'Quick cognitive synthesis & unscripted answers'
          }
        ],
        cadenceSubtitle: 'Calibrated delivery rhythm for your custom speaking objectives:',
        cadencePresets: [
          { label: 'Deliberate', wpm: 125, desc: 'Thoughtful pacing' },
          { label: 'Dynamic', wpm: 145, desc: 'Natural authority' },
          { label: 'Commanding', wpm: 160, desc: 'High energy drive' }
        ],
        cadenceMin: 110,
        cadenceMax: 180,
        cadenceDefault: 145,
        cadenceMinLabel: '110 WPM (Deliberate & Grounded)',
        cadenceMidLabel: '145 WPM (Dynamic & Conversational)',
        cadenceMaxLabel: '180 WPM (Commanding & Fast-Paced)'
      };
    }

    // Default Academy: Pan-African Leadership & Cognitive Deconditioning
    return {
      badge: 'Step 3 of 5 • Sovereign Leadership Calibration',
      title: 'Sovereign Rhetoric & Leadership Baseline',
      subtitle: 'Calibrate your movement arena, decolonial framework, and high-impact oratory metrics with the faculty.',
      identitySectionLabel: 'Personal & Movement Identity',
      namePlaceholder: 'e.g. Kwame Mensah',
      institutionLabel: 'Movement / Institution / Organization',
      institutionPlaceholder: 'e.g. Pan-African Youth Congress / Civic Collective',
      experienceLabel: 'Leadership Stage',
      experienceOptions: [
        { value: 'Novice Speaker', label: 'Emerging Organizer (<1 yr)' },
        { value: 'Club Debater', label: 'Civic Spokesperson (1-3 yrs)' },
        { value: 'Varsity / Advanced', label: 'Institutional Leader (3-6 yrs)' },
        { value: 'Master Orator', label: 'Sovereign Statesperson (6+ yrs)' }
      ],
      formatSectionLabel: 'Discourse & Leadership Arena',
      formatSectionSub: 'Select Rhetorical Arena',
      formats: [
        {
          id: 'Decolonial Parliamentary Rhetoric',
          name: 'Decolonial Parliamentary',
          code: 'Statecraft',
          desc: 'Dismantling neo-colonial economic narratives & sovereign policy defense.'
        },
        {
          id: 'Public Intellectual Manifesto',
          name: 'Intellectual Manifesto',
          code: 'Manifesto',
          desc: 'Rigorous essays, ideological debates & thought leadership polemics.'
        },
        {
          id: 'Policy Summit & Civic Assembly',
          name: 'Civic Assembly & Plenary',
          code: 'Civic Arena',
          desc: 'Town halls, legislative testimony & Pan-African youth summits.'
        },
        {
          id: 'Extemporaneous Geopolitical Analysis',
          name: 'Geopolitical Analysis',
          code: 'Extemp Brief',
          desc: 'Rapid synthesis of African trade, diplomacy & sovereign treaties.'
        }
      ],
      prioritySectionLabel: 'Leadership Technical Priority',
      prioritySectionSub: 'Strategic Emphasis',
      priorities: [
        {
          id: 'Ideological Rigor & Historical Framing',
          label: 'Ideological Rigor',
          sub: 'Historical depth & decolonial frameworks'
        },
        {
          id: 'Commanding Presence & Gravitas',
          label: 'Commanding Gravitas',
          sub: 'Voice of moral authority & poise'
        },
        {
          id: 'Deconditioning Cadence & Fluency',
          label: 'Deconditioning Cadence',
          sub: 'Unflinching, deliberate articulation'
        },
        {
          id: 'Institutional Reform Clarity',
          label: 'Policy & Reform Clarity',
          sub: 'Actionable civic blueprints & mandates'
        }
      ],
      cadenceSubtitle: 'Calibrated delivery rhythm for ideological discourse and assembly leadership:',
      cadencePresets: [
        { label: 'Deliberate', wpm: 125, desc: 'Solemn conviction' },
        { label: 'Articulate', wpm: 140, desc: 'Commanding delivery' },
        { label: 'Assembly Pace', wpm: 155, desc: 'Movement call to action' }
      ],
      cadenceMin: 115,
      cadenceMax: 175,
      cadenceDefault: 140,
      cadenceMinLabel: '115 WPM (Deliberate & Solemn)',
      cadenceMidLabel: '140 WPM (Commanding Delivery)',
      cadenceMaxLabel: '175 WPM (Assembly Call to Action)'
    };
  }

  // Branch === 'Foundation'
  if (missionFocus.includes('Patriarchal') || missionFocus.includes('Silence')) {
    return {
      badge: 'Step 3 of 5 • Voice Reclamation Calibration',
      title: 'Sovereign Voice Reclamation Baseline',
      subtitle: 'Break free from enforced docility, cultural shame, and the dread of speaking truth to authority.',
      identitySectionLabel: 'Personal & Fellowship Identity',
      namePlaceholder: 'e.g. Amani Muthoni',
      institutionLabel: 'Family / Community Group / Fellowship',
      institutionPlaceholder: "e.g. Grassroots Women's Network / Independent Voice",
      experienceLabel: 'Voice Sovereignty Stage',
      experienceOptions: [
        { value: 'Novice Speaker', label: 'Breaking The Silence (<1 yr)' },
        { value: 'Club Debater', label: 'Assertive Boundary Builder (1-3 yrs)' },
        { value: 'Varsity / Advanced', label: 'Cultural Truth-Teller (3-6 yrs)' },
        { value: 'Master Orator', label: 'Community Elder / Mentor (6+ yrs)' }
      ],
      formatSectionLabel: 'Voice Reclamation Format',
      formatSectionSub: 'Select Assertion Format',
      formats: [
        {
          id: 'Assertive Boundary Voice',
          name: 'Boundary Setting Dialogues',
          code: 'Direct Truth',
          desc: 'Firm, unapologetic verbalization of bodily, emotional, and social autonomy.'
        },
        {
          id: 'Vulnerability-Without-Apology',
          name: 'Unapologetic Vulnerability',
          code: 'No Shame',
          desc: 'Rejecting the myth that emotional openness makes a person weak.'
        },
        {
          id: 'Sovereign Voice Reclamation',
          name: 'Defying Docility Drills',
          code: 'Sovereignty',
          desc: 'Speaking in rooms where hierarchy demanded silence, with steady composure.'
        },
        {
          id: 'Intergenerational Bridge Circles',
          name: 'Intergenerational Bridge',
          code: 'Elders Dialogue',
          desc: 'Engaging family elders with truth, respect, and non-negotiable dignity.'
        }
      ],
      prioritySectionLabel: 'Empowerment & Agency Priority',
      prioritySectionSub: 'Personal Sovereignty',
      priorities: [
        {
          id: 'Firm Non-Violent Assertion',
          label: 'Firm Assertion',
          sub: "Clear 'No' without guilt or trembling"
        },
        {
          id: 'Overcoming Disapproval Panic',
          label: 'Disapproval Desensitization',
          sub: 'Remaining calm when facing cultural pushback'
        },
        {
          id: 'Steady Pitch Under Pressure',
          label: 'Steady Vocal Pitch',
          sub: 'Preventing throat constriction under tension'
        },
        {
          id: 'Generational Bridge Framing',
          label: 'Bridge Framing',
          sub: 'Honoring roots while asserting personal sovereignty'
        }
      ],
      cadenceSubtitle: 'Calibrated pacing to maintain steady breath and composure during confrontation:',
      cadencePresets: [
        { label: 'Calm & Resolute', wpm: 125, desc: 'Firm boundary' },
        { label: 'Clear Dialogue', wpm: 140, desc: 'Conversational assertiveness' },
        { label: 'Empowered & Direct', wpm: 150, desc: 'Direct truth' }
      ],
      cadenceMin: 110,
      cadenceMax: 165,
      cadenceDefault: 135,
      cadenceMinLabel: '110 WPM (Calm & Resolute Boundary)',
      cadenceMidLabel: '140 WPM (Clear Dialogue Pace)',
      cadenceMaxLabel: '165 WPM (Direct Empowered Delivery)'
    };
  }

  if (missionFocus.includes('Trauma') || missionFocus.includes('Advocacy')) {
    return {
      badge: 'Step 3 of 5 • Advocacy Voice Calibration',
      title: 'Trauma-to-Advocacy Baseline',
      subtitle: 'Transform lived struggle into ethical youth advocacy, survivor protection campaigns, and policy change.',
      identitySectionLabel: 'Advocate & Fellowship Identity',
      namePlaceholder: 'e.g. Brian Kipkorir',
      institutionLabel: "Advocacy Alliance / Children's Home / Center",
      institutionPlaceholder: "e.g. Child Protection Fellowship / Hope Center",
      experienceLabel: 'Advocacy Experience',
      experienceOptions: [
        { value: 'Novice Speaker', label: 'First Testimony (<1 yr)' },
        { value: 'Club Debater', label: 'Peer Youth Advocate (1-3 yrs)' },
        { value: 'Varsity / Advanced', label: 'Campaign Spokesperson (3-6 yrs)' },
        { value: 'Master Orator', label: 'National Child Rights Fellow (6+ yrs)' }
      ],
      formatSectionLabel: 'Advocacy Delivery Format',
      formatSectionSub: 'Select Advocacy Arena',
      formats: [
        {
          id: 'Ethical Lived-Experience Storytelling',
          name: 'Ethical Lived Storytelling',
          code: 'Survivor Voice',
          desc: 'Sharing survival stories without re-traumatization or voyeuristic exploitation.'
        },
        {
          id: 'Child Protection & Rights Advocacy',
          name: 'Child Rights Campaign',
          code: 'Policy Voice',
          desc: 'Demanding institutional accountability and protection for vulnerable youth.'
        },
        {
          id: 'Youth Peer Mentorship',
          name: 'Peer Mentorship Circles',
          code: 'Youth Circle',
          desc: 'Guiding younger survivors to discover their voice and restore self-worth.'
        },
        {
          id: 'Public Forum Testimony',
          name: 'Public Forum & Legislative',
          code: 'Legislative',
          desc: 'Delivering moral clarity to donor boards, civic assemblies, and magistrates.'
        }
      ],
      prioritySectionLabel: 'Advocacy Competency Priority',
      prioritySectionSub: 'Systemic Impact',
      priorities: [
        {
          id: 'Safe Narrative Boundaries',
          label: 'Safe Story Boundaries',
          sub: 'Protecting personal well-being while advocating'
        },
        {
          id: 'Translating Truth to Policy Action',
          label: 'Truth-to-Policy Translation',
          sub: 'Connecting lived struggle to systemic change'
        },
        {
          id: 'Inspiring Audience Empathy',
          label: 'Empathetic Connection',
          sub: 'Awakening conscience without sensationalism'
        },
        {
          id: 'Audience-Calibrated Testimony',
          label: 'Calibrated Testimony',
          sub: 'Tailoring delivery for boards, peers, or public'
        }
      ],
      cadenceSubtitle: 'Calibrated delivery rhythm to balance deep vulnerability with persuasive moral force:',
      cadencePresets: [
        { label: 'Measured & Heartfelt', wpm: 125, desc: 'Emotional depth' },
        { label: 'Inspiring & Dynamic', wpm: 140, desc: 'Advocacy pitch' },
        { label: 'Urgent Moral Plea', wpm: 155, desc: 'Systemic urgency' }
      ],
      cadenceMin: 115,
      cadenceMax: 170,
      cadenceDefault: 135,
      cadenceMinLabel: '115 WPM (Heartfelt & Measured Depth)',
      cadenceMidLabel: '140 WPM (Inspiring Dynamic Pitch)',
      cadenceMaxLabel: '170 WPM (Urgent Moral Plea)'
    };
  }

  if (missionFocus.includes('Anxiety') || missionFocus.includes('Isolation')) {
    return {
      badge: 'Step 3 of 5 • Anxiety Desensitization Calibration',
      title: 'Confidence & Social Baseline',
      subtitle: 'Dissolve speech dread, conquer the fight-or-flight freeze, and build natural spoken presence.',
      identitySectionLabel: 'Personal & Environmental Context',
      namePlaceholder: 'e.g. Kevin Otieno',
      institutionLabel: 'School / University / Workplace',
      institutionPlaceholder: 'e.g. University Student / Workplace Transition',
      experienceLabel: 'Exposure Stage',
      experienceOptions: [
        { value: 'Novice Speaker', label: 'Severe Freeze State (<1 yr)' },
        { value: 'Club Debater', label: 'Hesitant Participant (1-3 yrs)' },
        { value: 'Varsity / Advanced', label: 'Casual Conversationalist (3-6 yrs)' },
        { value: 'Master Orator', label: 'Confident Communicator (6+ yrs)' }
      ],
      formatSectionLabel: 'Desensitization Drill Format',
      formatSectionSub: 'Select Progression Format',
      formats: [
        {
          id: 'Low-Stakes Micro-Speaking (30-Sec)',
          name: '30-Second Micro Drills',
          code: 'Micro Step',
          desc: 'Gradual exposure starting with 30-second low-stakes shares in friendly groups.'
        },
        {
          id: 'Somatic Body & Throat Reset',
          name: 'Somatic Vagus Reset',
          code: 'Somatic Reset',
          desc: 'Physical grounding, jaw relaxation, and diaphragmatic vagus nerve calming.'
        },
        {
          id: 'Unscripted Daily Fluency',
          name: 'Unscripted Daily Drills',
          code: 'Impromptu Ease',
          desc: 'Building tolerance for pausing, searching for words, and natural flow.'
        },
        {
          id: 'Spatial Poise & Presence',
          name: 'Spatial Eye-Contact Poise',
          code: 'Gaze & Poise',
          desc: 'Overcoming the urge to look down, holding gentle, confident eye contact.'
        }
      ],
      prioritySectionLabel: 'Confidence Milestone Priority',
      prioritySectionSub: 'Nervous System Regulation',
      priorities: [
        {
          id: 'Dissolving Throat Tightness',
          label: 'Throat Tightness Reset',
          sub: 'Overcoming vocal cord clamp and voice shaking'
        },
        {
          id: 'Overcoming Judgment Panic',
          label: 'Panic Desensitization',
          sub: 'Rewiring the fear of blushing, stuttering or pauses'
        },
        {
          id: 'Spontaneous Conversational Ease',
          label: 'Spontaneous Flow',
          sub: 'Speaking without overthinking or scripting'
        },
        {
          id: 'Steady Vocal Tone & Breath Poise',
          label: 'Steady Breath Poise',
          sub: 'Maintaining deep belly breathing when spotlighted'
        }
      ],
      cadenceSubtitle: 'Calibrated pacing designed to down-regulate heart rate and maintain calm vocal tone:',
      cadencePresets: [
        { label: 'Grounded & Unhurried', wpm: 115, desc: 'Calm grounding' },
        { label: 'Natural Flow', wpm: 135, desc: 'Comfortable dialogue' },
        { label: 'Confident & Steady', wpm: 145, desc: 'Steady room presence' }
      ],
      cadenceMin: 105,
      cadenceMax: 160,
      cadenceDefault: 125,
      cadenceMinLabel: '105 WPM (Calm Grounding & Breaths)',
      cadenceMidLabel: '135 WPM (Comfortable Natural Flow)',
      cadenceMaxLabel: '160 WPM (Steady Confident Presence)'
    };
  }

  if (missionFocus.includes('Other')) {
    return {
      badge: 'Step 3 of 5 • Bespoke Voice Sanctuary Calibration',
      title: 'Bespoke Vocal Healing & Expression Baseline',
      subtitle: 'Calibrate your individualized emotional safety parameters, somatic focus, and authentic voice journey.',
      identitySectionLabel: 'Personal & Community Identity',
      namePlaceholder: 'e.g. Nia Adebayo',
      institutionLabel: "Community / Fellowship / Sanctuary",
      institutionPlaceholder: "e.g. Independent Sanctuary / Grassroots Fellow",
      experienceLabel: 'Voice Discovery Stage',
      experienceOptions: [
        { value: 'Novice Speaker', label: 'Beginning The Journey (<1 yr)' },
        { value: 'Club Debater', label: 'Growing In Expression (1-3 yrs)' },
        { value: 'Varsity / Advanced', label: 'Empowered Speaker (3-6 yrs)' },
        { value: 'Master Orator', label: 'Peer Voice Mentor (6+ yrs)' }
      ],
      formatSectionLabel: 'Sanctuary Expression Modality',
      formatSectionSub: 'Select Sanctuary Format',
      formats: [
        {
          id: 'Private Audio Vault Catharsis',
          name: 'Private Audio Vault',
          code: 'Sanctuary',
          desc: 'Solo unmonitored recordings to vent raw emotion without fear of judgment.'
        },
        {
          id: 'Trauma Narrative & Lived Storytelling',
          name: 'Lived Storytelling',
          code: 'Narrative',
          desc: 'Refining your authentic personal story to educate, empower, and inspire.'
        },
        {
          id: 'Somatic Grounding & Stage Panic Drills',
          name: 'Somatic Vocal Drills',
          code: 'Grounded Tone',
          desc: 'Breathwork, diaphragm support & vagus nerve calm for freeze response.'
        },
        {
          id: 'Bespoke Sanctuary Voice Modality',
          name: 'Bespoke Sanctuary Modality',
          code: 'Custom Voice',
          desc: 'Customized vocal practices adapted to your personal journey.'
        }
      ],
      prioritySectionLabel: 'Healing & Expressive Priority',
      prioritySectionSub: 'Curriculum Emphasis',
      priorities: [
        {
          id: 'Emotional Safety & Freedom From Freeze',
          label: 'Freedom From Freeze',
          sub: 'Somatic grounding to release tension'
        },
        {
          id: 'Vulnerability Without Guilt',
          label: 'Vulnerability Without Guilt',
          sub: 'Expressing raw truth without shame'
        },
        {
          id: 'Authentic Vocal Resonance',
          label: 'Authentic Resonance',
          sub: 'Finding your unmasked, organic tone'
        },
        {
          id: 'Confident Small-Circle Sharing',
          label: 'Small-Circle Confidence',
          sub: 'Comfortable speaking in peer circles'
        }
      ],
      cadenceSubtitle: 'Calibrated delivery rhythm for gentle vocal exploration and therapeutic pacing:',
      cadencePresets: [
        { label: 'Unrushed', wpm: 105, desc: 'Gentle reflection' },
        { label: 'Expressive', wpm: 125, desc: 'Heartfelt narrative' },
        { label: 'Empowered', wpm: 140, desc: 'Confident advocacy' }
      ],
      cadenceMin: 95,
      cadenceMax: 155,
      cadenceDefault: 125,
      cadenceMinLabel: '95 WPM (Gentle Therapeutic Pace)',
      cadenceMidLabel: '125 WPM (Heartfelt Expressive)',
      cadenceMaxLabel: '155 WPM (Empowered Advocacy)'
    };
  }

  // Default Foundation: Speaking as Escapism & Emotional Catharsis
  return {
    badge: 'Step 3 of 5 • Therapeutic Voice Sanctuary',
    title: 'Cathartic & Emotional Baseline',
    subtitle: 'A confidential sanctuary to calibrate your vocal release, somatic grounding, and emotional safety.',
    identitySectionLabel: 'Personal & Community Identity',
    namePlaceholder: 'e.g. Nia Adebayo',
    institutionLabel: "Community / Children's Home / Self-Nominated",
    institutionPlaceholder: "e.g. St. Nicholas Children's Home / Safe Harbor Fellow",
    experienceLabel: 'Voice Discovery Stage',
    experienceOptions: [
      { value: 'Novice Speaker', label: 'Silent Survivor (<1 yr)' },
      { value: 'Club Debater', label: 'Tentative Voice (1-3 yrs)' },
      { value: 'Varsity / Advanced', label: 'Expressive Storyteller (3-6 yrs)' },
      { value: 'Master Orator', label: 'Peer Voice Mentor (6+ yrs)' }
    ],
    formatSectionLabel: 'Safe Expression Modality',
    formatSectionSub: 'Select Therapeutic Format',
    formats: [
      {
        id: 'Private Audio Vault Catharsis',
        name: 'Private Audio Vault',
        code: 'Sanctuary',
        desc: 'Solo unmonitored recordings to vent raw emotion without fear of judgment.'
      },
      {
        id: 'Intimate Circle Sanctuary',
        name: 'Intimate Circle (3-5 peers)',
        code: 'Circle Trust',
        desc: 'Vulnerability circles led by trauma-informed faculty and peer listeners.'
      },
      {
        id: 'Spoken Word & Cathartic Poetry',
        name: 'Spoken Word Poetry',
        code: 'Poetic Truth',
        desc: 'Rhythmic verse translating personal sorrow and survival into living art.'
      },
      {
        id: 'Somatic Breath & Sound Release',
        name: 'Somatic Sound Release',
        code: 'Vocal Release',
        desc: 'Unlocking trapped diaphragm tension through sighs, humming & vocal release.'
      }
    ],
    prioritySectionLabel: 'Healing & Expression Priority',
    prioritySectionSub: 'Emotional Recovery',
    priorities: [
      {
        id: 'Fearless Emotional Release',
        label: 'Emotional Release',
        sub: 'Releasing tears and unsaid words without shame'
      },
      {
        id: 'Diaphragmatic Grounding',
        label: 'Diaphragmatic Calm',
        sub: 'Steadying breath during intense emotion'
      },
      {
        id: 'Transforming Adversity to Art',
        label: 'Pain to Artistry',
        sub: 'Channeling grief into poetic testimony'
      },
      {
        id: 'Reclaiming Audible Presence',
        label: 'Audible Presence',
        sub: 'Moving from whispered doubt to clear resonance'
      }
    ],
    cadenceSubtitle: 'Gentle, unhurried pacing calibrated for nervous system soothing and raw honesty:',
    cadencePresets: [
      { label: 'Gentle & Unhurried', wpm: 120, desc: 'Intimate reflection' },
      { label: 'Safe Circle Flow', wpm: 135, desc: 'Conversational ease' },
      { label: 'Liberated & Bold', wpm: 150, desc: 'Vocal release' }
    ],
    cadenceMin: 105,
    cadenceMax: 165,
    cadenceDefault: 130,
    cadenceMinLabel: '105 WPM (Gentle Breathing & Unhurried)',
    cadenceMidLabel: '135 WPM (Natural Conversational Pace)',
    cadenceMaxLabel: '165 WPM (Liberated Emotional Release)'
  };
};

export interface OnboardingFlowProps {
  initialBranch?: BranchType;
  initialStep?: number;
}

export interface Step4HabitOption {
  id: string;
  tag: string;
  title: string;
  desc: string;
}

export const getStep4Habits = (branch: BranchType): Step4HabitOption[] => {
  if (branch === 'Academy') {
    return [
      {
        id: 'Diaphragmatic Breathwork & Resonance',
        tag: 'VOCAL CORE • 5 MIN',
        title: 'Diaphragmatic Breathwork & Resonance',
        desc: 'Calms sympathetic nervous arousal and activates deep chest-to-mask vocal projection.'
      },
      {
        id: 'Rapid Motion Rebuttal Drills',
        tag: 'FORENSICS • 7 MIN',
        title: 'Rapid Motion Rebuttal Drills',
        desc: 'Construct point-counterpoint syllogisms against spontaneous tournament motions.'
      },
      {
        id: 'Vocal Hydration & Cord Conditioning',
        tag: 'PHYSIOLOGY • DAILY',
        title: 'Vocal Hydration & Cord Conditioning',
        desc: 'Protects vocal cord mucosa and prevents larynx fatigue during high-intensity oration.'
      },
      {
        id: 'Tongue Twisters & Articulation Precision',
        tag: 'DICTION • 3 MIN',
        title: 'Tongue Twisters & Consonant Agility',
        desc: 'Eliminates mumbling, sharpens plosives, and builds crisp articulatory precision.'
      },
      {
        id: 'Pan-African & Geopolitics Reading',
        tag: 'COGNITION • 10 MIN',
        title: 'Pan-African & Geopolitics Reading',
        desc: 'Sharpens cognitive familiarity with socio-economic context, policy, and global discourse.'
      }
    ];
  }

  return [
    {
      id: 'Cathartic Voice Audio Journaling',
      tag: 'CATHARSIS • 1 MIN',
      title: 'Cathartic Voice Audio Journaling',
      desc: 'Speaking raw, unedited thoughts into the private audio vault for emotional release.'
    },
    {
      id: 'Diaphragmatic Somatic Grounding',
      tag: 'GROUNDING • 5 MIN',
      title: 'Diaphragmatic Somatic Grounding',
      desc: 'Regulates vagus nerve tone, dissolves throat tightness, and anchors the nervous system.'
    },
    {
      id: 'Vocal Hydration & Gentle Warm-Up',
      tag: 'SANCTUARY • DAILY',
      title: 'Vocal Hydration & Gentle Warm-Up',
      desc: 'Gentle warm hydration and resonant humming to honor and protect your speaking instrument.'
    },
    {
      id: 'Voice Reclamation & Sovereignty Reading',
      tag: 'EMPOWERMENT • 5 MIN',
      title: 'Voice Reclamation & Sovereignty Reading',
      desc: 'Vocalizing personal narratives aloud to shed inherited silence and build authentic agency.'
    },
    {
      id: 'Polyvagal Humming & Chest Release',
      tag: 'SOMATICS • 3 MIN',
      title: 'Polyvagal Humming & Chest Release',
      desc: 'Low-frequency resonant humming to melt chest constriction and ease fight-or-flight panic.'
    }
  ];
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialBranch: propBranch,
  initialStep: propStep
}) => {
  const { completeOnboarding, setCurrentPortal } = useApp();

  // Form State & Preselection Check
  const rawStoredBranch = typeof window !== 'undefined'
    ? (localStorage.getItem('globalorators_selected_branch') as BranchType | null)
    : null;

  const hasPreselectedBranch = Boolean(
    propBranch || 
    (rawStoredBranch === 'Academy' || rawStoredBranch === 'Foundation')
  );

  const resolvedBranch: BranchType = propBranch || (rawStoredBranch === 'Academy' ? 'Academy' : 'Foundation');
  const [branch, setBranch] = useState<BranchType>(resolvedBranch);

  // If a branch was pre-selected via an audience CTA (e.g. "Apply to Academy" or "Apply for Fellowship"),
  // start directly at Step 2 (Speaking Mission) instead of asking the user to choose their branch again.
  const resolvedInitialStep = propStep !== undefined 
    ? propStep 
    : (hasPreselectedBranch ? 2 : 1);

  const [currentStep, setCurrentStep] = useState<number>(resolvedInitialStep);

  const initialMission = resolvedBranch === 'Academy'
    ? 'Pan-African Leadership & Cognitive Deconditioning'
    : 'Speaking as a Form of Escapism & Emotional Catharsis';

  const [missionFocus, setMissionFocus] = useState<string>(initialMission);

  const [speakingGoal, setSpeakingGoal] = useState<SpeakingGoal>(
    resolvedBranch === 'Academy' ? 'Pan-African Leadership' : 'Cathartic Expression & Healing'
  );

  const activeConfig = useMemo(() => getStep3Config(branch, missionFocus), [branch, missionFocus]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otherDescription, setOtherDescription] = useState('');
  const [customFormatDescription, setCustomFormatDescription] = useState('');
  const [customPriorityDescription, setCustomPriorityDescription] = useState('');
  const [customHabitDescription, setCustomHabitDescription] = useState('');
  const [age, setAge] = useState<number>(20);
  const [institution, setInstitution] = useState('');
  const [primaryDiscipline, setPrimaryDiscipline] = useState(activeConfig.formats[0].id);
  const [coreFocus, setCoreFocus] = useState(activeConfig.priorities[0].id);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Novice Speaker');
  const [vocalBaselinePace, setVocalBaselinePace] = useState<number>(activeConfig.cadenceDefault);
  const [emotionalOpennessRating, setEmotionalOpennessRating] = useState<number>(8);

  // Form input validation & touched state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (fieldName: string, value: string): string => {
    let error = '';
    if (fieldName === 'fullName') {
      const res = validateName(value, 'Full name', 2, 80);
      if (!res.isValid) error = res.error || '';
    } else if (fieldName === 'email') {
      const res = validateEmail(value);
      if (!res.isValid) error = res.error || '';
    } else if (fieldName === 'phone') {
      const res = validatePhone(value, false);
      if (!res.isValid) error = res.error || '';
    } else if (fieldName === 'otherDescription') {
      if (missionFocus === 'Other Speaking Pursuit' && !value.trim()) {
        error = 'Please describe what you are looking for.';
      }
    } else if (fieldName === 'customFormatDescription') {
      if (primaryDiscipline === 'Other / Custom Arena' && !value.trim()) {
        error = 'Please describe what you are looking for in your rhetorical arena.';
      }
    } else if (fieldName === 'customPriorityDescription') {
      if (coreFocus === 'Other / Custom Priority' && !value.trim()) {
        error = 'Please describe what you are looking for in your technical priority.';
      }
    } else if (fieldName === 'customHabitDescription') {
      if (selectedHabits.includes('Other / Custom Ritual') && !value.trim()) {
        error = 'Please describe your personal daily ritual.';
      }
    }
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
    return error;
  };

  const handleBlur = (fieldName: string, value: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, value);
  };

  // Synchronize options when track/mission changes
  const prevConfigKeyRef = useRef(`${branch}-${missionFocus}`);
  useEffect(() => {
    const currentKey = `${branch}-${missionFocus}`;
    if (prevConfigKeyRef.current !== currentKey) {
      prevConfigKeyRef.current = currentKey;
      setPrimaryDiscipline(activeConfig.formats[0].id);
      setCoreFocus(activeConfig.priorities[0].id);
      setVocalBaselinePace(activeConfig.cadenceDefault);
    }
  }, [branch, missionFocus, activeConfig]);

  // Branch-specific daily habits
  const currentHabitOptions = useMemo(() => getStep4Habits(branch), [branch]);

  const [selectedHabits, setSelectedHabits] = useState<string[]>(() =>
    resolvedBranch === 'Academy'
      ? [
          'Diaphragmatic Breathwork & Resonance',
          'Vocal Hydration & Cord Conditioning',
          'Tongue Twisters & Articulation Precision'
        ]
      : [
          'Cathartic Voice Audio Journaling',
          'Diaphragmatic Somatic Grounding',
          'Vocal Hydration & Gentle Warm-Up'
        ]
  );

  const prevBranchHabitsRef = useRef(branch);
  useEffect(() => {
    if (prevBranchHabitsRef.current !== branch) {
      prevBranchHabitsRef.current = branch;
      if (branch === 'Academy') {
        setSelectedHabits([
          'Diaphragmatic Breathwork & Resonance',
          'Vocal Hydration & Cord Conditioning',
          'Tongue Twisters & Articulation Precision'
        ]);
      } else {
        setSelectedHabits([
          'Cathartic Voice Audio Journaling',
          'Diaphragmatic Somatic Grounding',
          'Vocal Hydration & Gentle Warm-Up'
        ]);
      }
    }
  }, [branch]);

  const [primaryObstacle, setPrimaryObstacle] = useState('Nervous Tension & Panic Freezing');

  // Toggle Habits
  const handleToggleHabit = (habitId: string) => {
    setSelectedHabits(prev => 
      prev.includes(habitId) ? prev.filter(h => h !== habitId) : [...prev, habitId]
    );
  };

  // Next Step validation
  const handleNext = () => {
    if (currentStep === 2) {
      if (missionFocus === 'Other Speaking Pursuit') {
        const err = validateField('otherDescription', otherDescription);
        if (err) {
          setTouched(prev => ({ ...prev, otherDescription: true }));
          alert('Please give a brief description of what you are looking for.');
          return;
        }
      }
    }
    if (currentStep === 3) {
      const nameErr = validateField('fullName', fullName);
      const emailErr = validateField('email', email);
      const phoneErr = validateField('phone', phone);
      const formatErr = primaryDiscipline === 'Other / Custom Arena'
        ? validateField('customFormatDescription', customFormatDescription)
        : '';
      const priorityErr = coreFocus === 'Other / Custom Priority'
        ? validateField('customPriorityDescription', customPriorityDescription)
        : '';

      setTouched(prev => ({
        ...prev,
        fullName: true,
        email: true,
        phone: true,
        customFormatDescription: true,
        customPriorityDescription: true
      }));

      if (nameErr) {
        alert(nameErr.includes('required') ? 'Please enter your name to personalize your curriculum.' : nameErr);
        return;
      }
      if (emailErr) {
        alert(emailErr.includes('required') ? 'Please enter your email.' : emailErr);
        return;
      }
      if (phoneErr) {
        alert(phoneErr);
        return;
      }
      if (formatErr) {
        alert('Please give a brief description of what you are looking for in your rhetorical arena.');
        return;
      }
      if (priorityErr) {
        alert('Please give a brief description of what you are looking for in your technical priority.');
        return;
      }
    }
    if (currentStep === 4) {
      if (selectedHabits.includes('Other / Custom Ritual')) {
        const habitErr = validateField('customHabitDescription', customHabitDescription);
        if (habitErr) {
          setTouched(prev => ({ ...prev, customHabitDescription: true }));
          alert('Please give a brief description of your custom daily ritual.');
          return;
        }
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleFinish = () => {
    localStorage.removeItem('globalorators_selected_branch');
    const sanitizedName = sanitizeText(fullName, 80) || (branch === 'Academy' ? 'Kwame Mensah' : 'Nia Adebayo');
    const sanitizedEmailVal = sanitizeEmail(email) || 'speaker@globalorators.org';
    const sanitizedPhoneVal = sanitizePhone(phone) || undefined;
    const sanitizedInstitution = sanitizeText(institution, 120) || 'Independent Orator';
    const sanitizedOtherDesc = sanitizeMultiline(otherDescription, 1000);
    const sanitizedFormatDesc = sanitizeText(customFormatDescription, 150);
    const sanitizedPriorityDesc = sanitizeText(customPriorityDescription, 150);
    const sanitizedCustomHabit = sanitizeText(customHabitDescription, 150);

    const resolvedMission = (missionFocus === 'Other Speaking Pursuit' && sanitizedOtherDesc.trim())
      ? `Other: ${sanitizedOtherDesc.trim()}`
      : missionFocus;

    const resolvedDiscipline = (primaryDiscipline === 'Other / Custom Arena' && sanitizedFormatDesc.trim())
      ? `Other: ${sanitizedFormatDesc.trim()}`
      : primaryDiscipline;

    const resolvedFocus = (coreFocus === 'Other / Custom Priority' && sanitizedPriorityDesc.trim())
      ? `Other: ${sanitizedPriorityDesc.trim()}`
      : coreFocus;

    const resolvedHabits = selectedHabits.map(h => {
      if (h === 'Other / Custom Ritual' && sanitizedCustomHabit.trim()) {
        return `Other: ${sanitizedCustomHabit.trim()}`;
      }
      return h;
    });

    const data: SpeakerOnboardingData = {
      branch,
      fullName: sanitizedName,
      email: sanitizedEmailVal,
      phone: sanitizedPhoneVal,
      institution: sanitizedInstitution,
      age: sanitizeInteger(age, 12, 75, 20),
      primaryDiscipline: resolvedDiscipline,
      coreFocus: resolvedFocus,
      missionFocus: resolvedMission,
      speakingGoal,
      experienceLevel,
      vocalBaselinePace: sanitizeInteger(vocalBaselinePace, 100, 200, 140),
      emotionalOpennessRating: sanitizeInteger(emotionalOpennessRating, 1, 10, 8),
      selectedHabits: resolvedHabits,
      bioNotes: sanitizedOtherDesc.trim()
        ? `${branch} member from ${sanitizedInstitution}. Custom Objective: ${sanitizedOtherDesc.trim()}. Primary discipline: ${resolvedDiscipline}, specializing in ${resolvedFocus}.`
        : `${branch} member from ${sanitizedInstitution}. Primary discipline: ${resolvedDiscipline}, specializing in ${resolvedFocus}. Mission: ${missionFocus}.`
    };

    completeOnboarding(data);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-850">
        <button
          onClick={() => {
            localStorage.removeItem('globalorators_selected_branch');
            setCurrentPortal('landing');
          }}
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
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
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
                  setSpeakingGoal('Pan-African Leadership');
                  setMissionFocus('Pan-African Leadership & Cognitive Deconditioning');
                  localStorage.setItem('globalorators_selected_branch', 'Academy');
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
                    Learn to speak with impact.
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
                  setMissionFocus('Speaking as a Form of Escapism & Emotional Catharsis');
                  localStorage.setItem('globalorators_selected_branch', 'Foundation');
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
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                Define Your Core Speaking Mission
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                What breakthrough do you want your voice to manifest?
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400">
                <span className={`uppercase font-bold tracking-wider text-[10px] ${branch === 'Academy' ? 'text-[#C89630]' : 'text-emerald-400'}`}>
                  Best for:
                </span>
                <span className="text-slate-300 font-medium">
                  {branch === 'Academy'
                    ? 'Debaters, varsity students & corporate speakers'
                    : 'Personal healing, vulnerability & youth advocacy'}
                </span>
              </div>
            </div>

            {/* Dynamic mission options depending on branch */}
            <div className="space-y-2.5">
              {branch === 'Academy' ? (
                <>
                  {[
                    {
                      title: 'Pan-African Leadership & Cognitive Deconditioning',
                      goal: 'Pan-African Leadership' as SpeakingGoal,
                      desc: 'Dismantling colonial social conditioning and external dependency through sovereign economic and political discourse.',
                      bestFor: 'Civic organizers, public intellectuals & political youth'
                    },
                    {
                      title: 'Competitive Parliamentary Debate (BP / Worlds Format)',
                      goal: 'Competitive Debate' as SpeakingGoal,
                      desc: 'Preparing for national championships, Karl Popper, and World Universities Debating Championship.',
                      bestFor: 'Varsity debaters, high school & university circuit speakers'
                    },
                    {
                      title: 'Executive & Investor Boardroom Pitching',
                      goal: 'Executive & Board Pitching' as SpeakingGoal,
                      desc: 'Defending capital allocation, venture capital narratives, and corporate negotiation.',
                      bestFor: 'Startup founders, corporate executives & investor desks'
                    },
                    {
                      title: 'Keynote & Main Stage Conference Oratory',
                      goal: 'Keynote & Conference' as SpeakingGoal,
                      desc: 'Mastering spatial commanding, teleprompters, and audience engagement at scale.',
                      bestFor: 'Conference keynoters, plenary speakers & summit addresses'
                    },
                    {
                      title: 'Other Speaking Pursuit',
                      goal: 'Keynote & Conference' as SpeakingGoal,
                      desc: 'What you are looking for is not among the options above. Specify your custom speaking goals.',
                      bestFor: 'Bespoke speaking objectives, specialized formats & personalized mentorship'
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
                      <div className="flex-1 pr-2">
                        <div className="text-xs font-bold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</div>
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                          <span className="text-[#C89630] font-semibold uppercase tracking-wider text-[9px]">Best for:</span>
                          <span className="text-slate-300">{item.bestFor}</span>
                        </div>
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
                      desc: 'Experiencing the visceral emotional relief that comes from vocalizing suppressed feelings in a safe space.',
                      bestFor: 'Personal healing, emotional release & safe expression'
                    },
                    {
                      title: 'Breaking Patriarchal & Generational Silence',
                      goal: 'Cathartic Expression & Healing' as SpeakingGoal,
                      desc: 'Overcoming cultural conditioning that equates emotional vulnerability and tears with weakness.',
                      bestFor: "Breaking cultural silence, boundary setting & women's advocacy"
                    },
                    {
                      title: 'Trauma-to-Advocacy Voice Discovery',
                      goal: 'Trauma Storytelling & Advocacy' as SpeakingGoal,
                      desc: 'Transforming painful lived experiences into powerful advocacy to prevent abuse of children and youth.',
                      bestFor: 'Youth protection advocates, survivor voices & lived-experience storytellers'
                    },
                    {
                      title: 'Conquering Social Anxiety & Speech Isolation',
                      goal: 'Impromptu & Extemporaneous' as SpeakingGoal,
                      desc: 'Grounded somatic vocalization drills to dismantle fight-or-flight stage panic.',
                      bestFor: 'Overcoming stage panic, freeze response & conversational dread'
                    },
                    {
                      title: 'Other Speaking Pursuit',
                      goal: 'Cathartic Expression & Healing' as SpeakingGoal,
                      desc: 'What you are looking for is not among the options above. Specify your custom speaking or healing focus.',
                      bestFor: 'Individualized vocal healing, unique lived experiences & personal sanctuaries'
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
                      <div className="flex-1 pr-2">
                        <div className="text-xs font-bold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</div>
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                          <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[9px]">Best for:</span>
                          <span className="text-slate-300">{item.bestFor}</span>
                        </div>
                      </div>
                      {missionFocus === item.title && (
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 ml-3 mt-0.5" />
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Custom description textarea when Other is selected */}
            {missionFocus === 'Other Speaking Pursuit' && (
              <div className="p-4 rounded-xl border border-[#C89630]/40 bg-slate-900/80 animate-fadeIn space-y-2">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="other-description-input"
                    className="block text-[10px] uppercase font-bold text-[#C89630] font-mono tracking-wider"
                  >
                    Describe What You Are Looking For *
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {otherDescription.length}/1000
                  </span>
                </div>
                <textarea
                  id="other-description-input"
                  name="otherDescription"
                  rows={3}
                  maxLength={1000}
                  spellCheck={true}
                  aria-required="true"
                  aria-invalid={touched.otherDescription && !!fieldErrors.otherDescription}
                  aria-describedby={touched.otherDescription && fieldErrors.otherDescription ? "other-description-error" : undefined}
                  value={otherDescription}
                  onChange={(e) => {
                    const val = sanitizeMultiline(e.target.value, 1000);
                    setOtherDescription(val);
                    if (touched.otherDescription) validateField('otherDescription', val);
                  }}
                  onBlur={() => handleBlur('otherDescription', otherDescription)}
                  placeholder="Briefly describe what you are looking to achieve (e.g. preparing for a TEDx talk, courtroom advocacy, sermon delivery, wedding keynote, or overcoming stage panic)..."
                  className={`w-full p-3 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-600 focus:outline-hidden transition-all ${
                    touched.otherDescription && fieldErrors.otherDescription
                      ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                      : 'border-slate-800 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]/30'
                  }`}
                />
                {touched.otherDescription && fieldErrors.otherDescription && (
                  <p id="other-description-error" role="alert" className="text-[10px] font-mono text-rose-400">
                    {fieldErrors.otherDescription}
                  </p>
                )}
                <p className="text-[10px] text-slate-400 font-mono">
                  Our faculty and coaches will review your description to tailor your curriculum and drills.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Orator & Forensics Baseline */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                {activeConfig.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {activeConfig.subtitle}
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
              {/* SECTION 1: Personal & Academic/Community Identity */}
              <div>
                <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#C89630] mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{activeConfig.identitySectionLabel}</span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="full-name-input" className="block text-[10px] uppercase font-bold text-slate-400">
                          Your Full Name *
                        </label>
                        {touched.fullName && fieldErrors.fullName && (
                          <span id="full-name-error" role="alert" className="text-[10px] font-mono text-rose-400">
                            {fieldErrors.fullName}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                        <input
                          id="full-name-input"
                          name="fullName"
                          required
                          type="text"
                          autoComplete="name"
                          spellCheck={false}
                          maxLength={80}
                          aria-required="true"
                          aria-invalid={touched.fullName && !!fieldErrors.fullName}
                          aria-describedby={touched.fullName && fieldErrors.fullName ? "full-name-error" : undefined}
                          value={fullName}
                          onChange={(e) => {
                            const val = sanitizeText(e.target.value, 80);
                            setFullName(val);
                            if (touched.fullName) validateField('fullName', val);
                          }}
                          onBlur={() => handleBlur('fullName', fullName)}
                          placeholder={activeConfig.namePlaceholder}
                          className={`w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-600 focus:outline-hidden transition-all ${
                            touched.fullName && fieldErrors.fullName
                              ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                              : 'border-slate-800 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]/30'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="email-input" className="block text-[10px] uppercase font-bold text-slate-400">
                          Email Address *
                        </label>
                        {touched.email && fieldErrors.email && (
                          <span id="email-error" role="alert" className="text-[10px] font-mono text-rose-400">
                            {fieldErrors.email}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                        <input
                          id="email-input"
                          name="email"
                          required
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          autoCapitalize="none"
                          spellCheck={false}
                          maxLength={254}
                          aria-required="true"
                          aria-invalid={touched.email && !!fieldErrors.email}
                          aria-describedby={touched.email && fieldErrors.email ? "email-error" : undefined}
                          value={email}
                          onChange={(e) => {
                            const val = sanitizeEmail(e.target.value);
                            setEmail(val);
                            if (touched.email) validateField('email', val);
                          }}
                          onBlur={() => handleBlur('email', email)}
                          placeholder="nia@example.org"
                          className={`w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-600 focus:outline-hidden transition-all ${
                            touched.email && fieldErrors.email
                              ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                              : 'border-slate-800 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]/30'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="phone-input" className="block text-[10px] uppercase font-bold text-slate-400">
                          Phone Number (WhatsApp)
                        </label>
                        {touched.phone && fieldErrors.phone && (
                          <span id="phone-error" role="alert" className="text-[10px] font-mono text-rose-400">
                            {fieldErrors.phone}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                        <input
                          id="phone-input"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          spellCheck={false}
                          maxLength={25}
                          aria-invalid={touched.phone && !!fieldErrors.phone}
                          aria-describedby={touched.phone && fieldErrors.phone ? "phone-error" : undefined}
                          value={phone}
                          onChange={(e) => {
                            const val = sanitizePhone(e.target.value);
                            setPhone(val);
                            if (touched.phone) validateField('phone', val);
                          }}
                          onBlur={() => handleBlur('phone', phone)}
                          placeholder="+254 700 000 000"
                          className={`w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-600 focus:outline-hidden transition-all ${
                            touched.phone && fieldErrors.phone
                              ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                              : 'border-slate-800 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]/30'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="institution-input" className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        {activeConfig.institutionLabel}
                      </label>
                      <div className="relative">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                        <input
                          id="institution-input"
                          name="institution"
                          type="text"
                          autoComplete="organization"
                          maxLength={120}
                          value={institution}
                          onChange={(e) => setInstitution(sanitizeText(e.target.value, 120))}
                          placeholder={activeConfig.institutionPlaceholder}
                          className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]/30 focus:outline-hidden transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Age and Experience Level in a 2-column responsive layout */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="age-input" className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Age
                      </label>
                      <input
                        id="age-input"
                        name="age"
                        type="number"
                        inputMode="numeric"
                        min={12}
                        max={75}
                        value={age || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setAge(0);
                          } else {
                            setAge(sanitizeInteger(val, 12, 75, 20));
                          }
                        }}
                        onBlur={() => {
                          if (age < 12) setAge(12);
                          else if (age > 75) setAge(75);
                        }}
                        className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]/30 focus:outline-hidden transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="experience-level-select" className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        {activeConfig.experienceLabel}
                      </label>
                      <select
                        id="experience-level-select"
                        name="experienceLevel"
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                        className="w-full h-10 px-2 sm:px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]/30 focus:outline-hidden transition-all"
                      >
                        {activeConfig.experienceOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION 2: Primary Debate & Forensics Format */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#C89630] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>{activeConfig.formatSectionLabel}</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">{activeConfig.formatSectionSub}</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {activeConfig.formats.map(fmt => {
                    const isSelected = primaryDiscipline === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setPrimaryDiscipline(fmt.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#C89630]/15 border-[#C89630] text-white ring-1 ring-[#C89630]/30 shadow-md'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#C89630]">
                              {fmt.code}
                            </span>
                            {isSelected && (
                              <Check className="w-3 h-3 text-[#C89630] stroke-[3]" />
                            )}
                          </div>
                          <div className="text-xs font-bold text-white mt-1">{fmt.name}</div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-1 line-clamp-2">
                            {fmt.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {/* Other Arena / Format Option */}
                  <button
                    type="button"
                    onClick={() => setPrimaryDiscipline('Other / Custom Arena')}
                    className={`col-span-2 p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      primaryDiscipline === 'Other / Custom Arena'
                        ? 'bg-[#C89630]/15 border-[#C89630] text-white ring-1 ring-[#C89630]/30 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#C89630]">
                          CUSTOM
                        </span>
                        {primaryDiscipline === 'Other / Custom Arena' && (
                          <Check className="w-3 h-3 text-[#C89630] stroke-[3]" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-white mt-1">Other Arena / Format</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        Define a custom rhetorical arena, debate format, or speaking setting not listed above.
                      </div>
                    </div>
                  </button>
                </div>

                {/* Custom description input when Other Arena is selected */}
                {primaryDiscipline === 'Other / Custom Arena' && (
                  <div className="mt-2.5 p-3 rounded-xl border border-[#C89630]/40 bg-slate-950/90 animate-fadeIn space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label 
                        htmlFor="custom-arena-input"
                        className="block text-[10px] uppercase font-bold text-[#C89630] font-mono tracking-wider"
                      >
                        Describe What You Are Looking For in Your Arena *
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {customFormatDescription.length}/150
                      </span>
                    </div>
                    <input
                      id="custom-arena-input"
                      name="customFormatDescription"
                      type="text"
                      maxLength={150}
                      spellCheck={true}
                      aria-required="true"
                      aria-invalid={touched.customFormatDescription && !!fieldErrors.customFormatDescription}
                      aria-describedby={touched.customFormatDescription && fieldErrors.customFormatDescription ? "custom-arena-error" : undefined}
                      value={customFormatDescription}
                      onChange={(e) => {
                        const val = sanitizeText(e.target.value, 150);
                        setCustomFormatDescription(val);
                        if (touched.customFormatDescription) validateField('customFormatDescription', val);
                      }}
                      onBlur={() => handleBlur('customFormatDescription', customFormatDescription)}
                      placeholder="e.g. African Union Youth Plenary, Courtroom Cross-Exam, Keynote Sermon, Broadcast Panel..."
                      className={`w-full h-9 px-3 rounded-lg bg-slate-900 border text-xs text-white placeholder-slate-600 focus:outline-hidden transition-all ${
                        touched.customFormatDescription && fieldErrors.customFormatDescription
                          ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                          : 'border-slate-800 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]/30'
                      }`}
                    />
                    {touched.customFormatDescription && fieldErrors.customFormatDescription && (
                      <p id="custom-arena-error" role="alert" className="text-[10px] font-mono text-rose-400">
                        {fieldErrors.customFormatDescription}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 3: Core Forensics Focus / Technical Priority */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#C89630]">
                    {activeConfig.prioritySectionLabel}
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">{activeConfig.prioritySectionSub}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {activeConfig.priorities.map(item => {
                    const isSelected = coreFocus === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCoreFocus(item.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#C89630]/15 border-[#C89630] text-white ring-1 ring-[#C89630]/30 shadow-xs'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{item.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#C89630] stroke-[3] shrink-0 ml-1" />}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{item.sub}</div>
                      </button>
                    );
                  })}

                  {/* Other Technical Priority Option */}
                  <button
                    type="button"
                    onClick={() => setCoreFocus('Other / Custom Priority')}
                    className={`col-span-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      coreFocus === 'Other / Custom Priority'
                        ? 'bg-[#C89630]/15 border-[#C89630] text-white ring-1 ring-[#C89630]/30 shadow-xs'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Other Priority / Skill Need</span>
                      {coreFocus === 'Other / Custom Priority' && (
                        <Check className="w-3 h-3 text-[#C89630] stroke-[3] shrink-0 ml-1" />
                      )}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      Specify a custom technical focus, vocal challenge, or speaking priority
                    </div>
                  </button>
                </div>

                {/* Custom description input when Other Priority is selected */}
                {coreFocus === 'Other / Custom Priority' && (
                  <div className="mt-2.5 p-3 rounded-xl border border-[#C89630]/40 bg-slate-950/90 animate-fadeIn space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label 
                        htmlFor="custom-priority-input"
                        className="block text-[10px] uppercase font-bold text-[#C89630] font-mono tracking-wider"
                      >
                        Describe What You Are Looking For in Your Priority *
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {customPriorityDescription.length}/150
                      </span>
                    </div>
                    <input
                      id="custom-priority-input"
                      name="customPriorityDescription"
                      type="text"
                      maxLength={150}
                      spellCheck={true}
                      aria-required="true"
                      aria-invalid={touched.customPriorityDescription && !!fieldErrors.customPriorityDescription}
                      aria-describedby={touched.customPriorityDescription && fieldErrors.customPriorityDescription ? "custom-priority-error" : undefined}
                      value={customPriorityDescription}
                      onChange={(e) => {
                        const val = sanitizeText(e.target.value, 150);
                        setCustomPriorityDescription(val);
                        if (touched.customPriorityDescription) validateField('customPriorityDescription', val);
                      }}
                      onBlur={() => handleBlur('customPriorityDescription', customPriorityDescription)}
                      placeholder="e.g. Overcoming throat constriction, impromptu rebuttal formulation, conversational poise..."
                      className={`w-full h-9 px-3 rounded-lg bg-slate-900 border text-xs text-white placeholder-slate-600 focus:outline-hidden transition-all ${
                        touched.customPriorityDescription && fieldErrors.customPriorityDescription
                          ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                          : 'border-slate-800 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]/30'
                      }`}
                    />
                    {touched.customPriorityDescription && fieldErrors.customPriorityDescription && (
                      <p id="custom-priority-error" role="alert" className="text-[10px] font-mono text-rose-400">
                        {fieldErrors.customPriorityDescription}
                      </p>
                    )}
                  </div>
                )}
              </div>



              {/* SECTION 4: Delivery Cadence & Vocal Projection */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#C89630] flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Speaking Cadence & Tempo Target</span>
                    </label>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {activeConfig.cadenceSubtitle}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#C89630] bg-[#C89630]/10 px-2 py-0.5 rounded-md border border-[#C89630]/20">
                      {vocalBaselinePace} WPM
                    </span>
                  </div>
                </div>

                {/* 3 Quick Presets */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {activeConfig.cadencePresets.map(preset => {
                    const isSelected = vocalBaselinePace === preset.wpm;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setVocalBaselinePace(preset.wpm)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#C89630]/20 border-[#C89630] text-white ring-1 ring-[#C89630]/30'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-white">{preset.label}</div>
                        <div className="text-[9px] text-[#C89630] font-mono">{preset.wpm} WPM</div>
                      </button>
                    );
                  })}
                </div>

                <input
                  type="range"
                  min={activeConfig.cadenceMin}
                  max={activeConfig.cadenceMax}
                  step={5}
                  value={vocalBaselinePace}
                  onChange={(e) => setVocalBaselinePace(Number(e.target.value))}
                  className="w-full accent-[#C89630] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                  <span>{activeConfig.cadenceMinLabel}</span>
                  <span>{activeConfig.cadenceMidLabel}</span>
                  <span>{activeConfig.cadenceMaxLabel}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Daily Habits Commitment */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                Commit to Daily Orator Habits
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {branch === 'Academy'
                  ? 'Great orators are forged through daily discipline. Calibrate your morning drills, forensic analysis, and vocal conditioning.'
                  : 'Sovereign voices are nurtured through daily sanctuary. Select the somatic rituals, cathartic reflections, and grounding habits that restore your expression.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {currentHabitOptions.map(habit => {
                const isSelected = selectedHabits.includes(habit.id);
                return (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#C89630]/15 border-[#C89630] text-white ring-1 ring-[#C89630]/30 shadow-xs'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#C89630]">
                          {habit.tag}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#C89630] text-slate-950' : 'border border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-white leading-snug">
                        {habit.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {habit.desc}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Card 6: Other / Custom Ritual */}
              {(() => {
                const isOtherSelected = selectedHabits.includes('Other / Custom Ritual');
                return (
                  <button
                    type="button"
                    onClick={() => handleToggleHabit('Other / Custom Ritual')}
                    className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isOtherSelected
                        ? 'bg-[#C89630]/15 border-[#C89630] text-white ring-1 ring-[#C89630]/30 shadow-xs'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#C89630]">
                          BESPOKE • CUSTOM
                        </span>
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                            isOtherSelected ? 'bg-[#C89630] text-slate-950' : 'border border-slate-700'
                          }`}
                        >
                          {isOtherSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-white leading-snug">
                        Other / Custom Ritual
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Define your own personal speaking discipline, vocal warm-up, or evening reflection.
                      </div>
                    </div>
                  </button>
                );
              })()}

              {/* Expandable Textarea for Other Custom Ritual spanning col-span-2 */}
              {selectedHabits.includes('Other / Custom Ritual') && (
                <div className="col-span-2 space-y-1 animate-fadeIn pt-1">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="custom-habit-description"
                      className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold"
                    >
                      Describe Your Daily Ritual *
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {customHabitDescription.length}/500
                    </span>
                  </div>
                  <textarea
                    id="custom-habit-description"
                    rows={2}
                    maxLength={500}
                    spellCheck={true}
                    aria-required="true"
                    aria-invalid={touched.customHabitDescription && !!fieldErrors.customHabitDescription}
                    aria-describedby={touched.customHabitDescription && fieldErrors.customHabitDescription ? "custom-habit-error" : undefined}
                    value={customHabitDescription}
                    onChange={(e) => {
                      const val = sanitizeMultiline(e.target.value, 500);
                      setCustomHabitDescription(val);
                      if (touched.customHabitDescription) validateField('customHabitDescription', val);
                    }}
                    onBlur={() => handleBlur('customHabitDescription', customHabitDescription)}
                    placeholder="Describe your personal speaking ritual (e.g. 5-minute vocal sirens, mirror monologue drills, reading poetry aloud, or bedtime gratitude audio notes)..."
                    className={`w-full p-3 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-600 focus:outline-hidden transition-all ${
                      touched.customHabitDescription && fieldErrors.customHabitDescription
                        ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                        : 'border-slate-800 focus:border-[#C89630] focus:ring-1 focus:ring-[#C89630]/30'
                    }`}
                  />
                  {touched.customHabitDescription && fieldErrors.customHabitDescription && (
                    <p id="custom-habit-error" role="alert" className="text-[10px] font-mono text-rose-400">
                      {fieldErrors.customHabitDescription}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 font-mono">
                    This ritual will be integrated directly into your daily habit tracker on your speaker portal.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Review & Personalized Generation */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                Your Protocol is Formulated!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Welcome to the Global Orators Project. Your personalized client portal is ready.
              </p>
            </div>

            {/* Speaker Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-[#C89630]/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C89630] to-amber-700 flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg">
                    {fullName.charAt(0) || (branch === 'Academy' ? 'K' : 'N')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{fullName || 'New Orator'}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                      <span>{institution || email || 'speaker@globalorators.org'}</span>
                      {phone && <span className="text-slate-500">• {phone}</span>}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-extrabold uppercase px-3 py-1 rounded-full border border-[#C89630]/30 bg-[#C89630]/15 text-[#C89630]">
                  {branch} Scholar
                </span>
              </div>

              {/* 2-Column Mobile Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80 mb-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Speaking Mission</div>
                  <div className="text-xs font-semibold text-white truncate mt-0.5" title={otherDescription.trim() || speakingGoal}>
                    {missionFocus.includes('Other') && otherDescription.trim() ? otherDescription.trim() : speakingGoal}
                  </div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Primary Format</div>
                  <div className="text-xs font-semibold text-[#C89630] mt-0.5 truncate">{primaryDiscipline}</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Curriculum Focus</div>
                  <div className="text-xs font-semibold text-amber-400 mt-0.5 truncate">{coreFocus}</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Target Cadence</div>
                  <div className="text-xs font-semibold text-white mt-0.5">{vocalBaselinePace} WPM</div>
                </div>
              </div>

              <div className="bg-[#C89630]/10 border border-[#C89630]/20 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 text-[#C89630] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Global Orators Faculty Welcome:</strong>{" "}
                  {missionFocus.includes('Other') && otherDescription.trim()
                    ? `"Your bespoke pathway in Global Orators is calibrated around your unique speaking pursuit: '${otherDescription.trim()}'. Enter your portal to begin your tailored coaching trajectory."`
                    : branch === 'Academy'
                    ? '"Your pathway in Global Orators Academy is calibrated to awaken cognitive sovereignty, rigorous forensics argumentation, and commanding rhetorical delivery. Enter your portal to begin your first drill."'
                    : '"Your sanctuary in Global Orators Foundation is calibrated for emotional safety, vulnerability-without-apology, and discovering the healing power of your authentic voice. Enter your portal to begin your first reflection."'
                  }
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
