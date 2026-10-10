import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import { LandingPage } from '../components/landing/LandingPage';
import { ClientPortal } from '../components/clientApp/ClientPortal';
import { SubdomainSwitcher } from '../components/common/SubdomainSwitcher';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';

vi.mock('../services/apiClient', () => ({
  clearAuthSession: vi.fn(),
  authApi: { me: vi.fn().mockResolvedValue({ email: 'coach@globalorators.com' }) },
  clientsApi: { 
    list: vi.fn().mockResolvedValue([]), 
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation((c) => Promise.resolve({ ...c, id: c.id || 'client-mock-123' })),
    getMe: vi.fn().mockImplementation(() => {
      return Promise.resolve({
        id: 'client-mock-kassim',
        name: 'KASSIM MUSA',
        email: 'kassimmusa322@gmail.com',
        phone: '+254746957502',
        goal: 'Pan-African Leadership',
        experienceLevel: 'Novice Speaker',
        currentWeightKg: 140,
        onboardingSurvey: {
          branch: 'Academy',
          fullName: 'KASSIM MUSA',
          email: 'kassimmusa322@gmail.com',
          phone: '+254746957502',
          institution: 'Maseno University',
          primaryDiscipline: 'Decolonial Parliamentary Forensics',
          coreFocus: 'Ideological Rigor & Rebuttal Depth',
          missionFocus: 'Pan-African Leadership',
          selectedHabits: [
            'Vocal Hydration (2.5L + Warm Lemon Water)',
            'Decolonial Parliamentary Case Prep (15 Min)'
          ]
        }
      });
    }),
  },
  exercisesApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  programsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  workoutsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  metricsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  prsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  habitsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  photosApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  messagesApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  activityApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  inquiriesApi: {
    submit: vi.fn().mockResolvedValue({
      status: 'success',
      inquiryId: 'GOP-INQ-TEST-001',
      organization: 'Strathmore University',
      branch: 'Academy',
      receivedAt: '2026-09-10T12:00:00Z',
      message: 'Inquiry received. Our partnerships director will review and respond within 24 hours.'
    }),
    list: vi.fn().mockResolvedValue([])
  },
  coachesApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  groupsApi: { getAll: vi.fn().mockResolvedValue([]), create: vi.fn(), startCall: vi.fn() },
}));

describe('Global Orators Landing Page & Features Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('should render GOP umbrella title, tagline, and both functional branches on Landing Page', () => {
    render(
      <AppProvider>
        <LandingPage />
      </AppProvider>
    );

    // Verify brand and lead headline
    expect(within(screen.getByRole('banner')).getByText('Global')).toBeInTheDocument();
    expect(screen.getByText('speak with impact')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Words Shape Nations/i })).toBeInTheDocument();

    // Verify both missions
    expect(screen.getByText(/The First Pillar • Thinking For Ourselves/i)).toBeInTheDocument();
    expect(screen.getByText(/Speaking as a Form of Escapism & Catharsis/i)).toBeInTheDocument();

    // Verify both functional branches
    expect(screen.getAllByText('Global Orators Academy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Global Orators Foundation').length).toBeGreaterThan(0);

    // Verify tournament achievements
    expect(screen.getByText('World Universities Debating Championship')).toBeInTheDocument();
    expect(screen.getByText('Pan-African Universities Debating Championship')).toBeInTheDocument();

    // Verify Founder's Note
    expect(screen.getByText('Geoffrey Anyona')).toBeInTheDocument();
    expect(screen.getByText(/Founder & Forensics Director · The Global Orators Project/i)).toBeInTheDocument();
    expect(screen.getByText(/a generation that can speak must also learn to think/i)).toBeInTheDocument();

    // Verify Co-Founder's Note & Documentary Dispatch (Tyrese)
    expect(screen.getByText('Tyrese King’ori Nyawira')).toBeInTheDocument();
    expect(screen.getByText(/Co-Founder & Head Debate Coach · The Global Orators Project/i)).toBeInTheDocument();
    expect(screen.getByText(/I believe words can change the trajectory of a life/i)).toBeInTheDocument();
    expect(screen.getByAltText(/City of Nairobi rostrum/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Championship Laureate holding trophy and gold medals/i)).toBeInTheDocument();
  }, 15000);

  test('should render SubdomainSwitcher with globaloratorsproject.com, app, and coach domains', () => {
    render(
      <AppProvider>
        <SubdomainSwitcher />
      </AppProvider>
    );

    expect(screen.getAllByText('globaloratorsproject.com').length).toBeGreaterThan(0);
    expect(screen.getByText('app.globaloratorsproject.com')).toBeInTheDocument();
    expect(screen.getByText('coach.globaloratorsproject.com')).toBeInTheDocument();
  });

  test('should render Client-Side Speaker App with drill studio, catharsis vault, and habit tracking', () => {
    localStorage.setItem('globalorators_speaker_profile', JSON.stringify({
      fullName: 'Amara Diallo',
      branch: 'Foundation',
      email: 'amara@example.com'
    }));

    render(
      <AppProvider>
        <ClientPortal />
      </AppProvider>
    );

    // Check tabs in client portal
    expect(screen.getByText('Daily Drill Studio')).toBeInTheDocument();
    expect(screen.getByText('Catharsis & Voice Vault')).toBeInTheDocument();
    expect(screen.getByText('Daily Orator Rituals')).toBeInTheDocument();
    expect(screen.getAllByText('Messenger').length).toBeGreaterThan(0);

    // Switch to Catharsis tab
    const catharsisTab = screen.getByText('Catharsis & Voice Vault');
    fireEvent.click(catharsisTab);

    expect(screen.getByText(/Private Expression Vault/i)).toBeInTheDocument();
  });

  test('should allow toggling theme on LandingPage between light and dark modes', async () => {
    render(
      <AppProvider>
        <LandingPage />
      </AppProvider>
    );

    const themeToggleBtn = document.getElementById('landing-theme-toggle');
    expect(themeToggleBtn).toBeInTheDocument();

    // Default theme is light
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click to toggle to dark
    await act(async () => {
      fireEvent.click(themeToggleBtn!);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Click to toggle back to light
    await act(async () => {
      fireEvent.click(themeToggleBtn!);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('should render audience-specific CTAs, value proposition, process steps, and interactive voice dispatch on LandingPage', async () => {
    render(
      <AppProvider>
        <LandingPage />
      </AppProvider>
    );

    // Verify clear one-sentence value proposition
    expect(screen.getByText(/Debate training, leadership development, and healing-centered voice programs for African youth/i)).toBeInTheDocument();

    // Verify Audience Chooser fast-track section and 4-stage methodology
    expect(screen.getByText('Choose Your Path')).toBeInTheDocument();
    expect(screen.getByText('How The Program Operates')).toBeInTheDocument();

    // Verify audience-specific direct action CTAs (replaces generic 'Take the Floor')
    expect(screen.getAllByText('Apply to Academy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Apply for Fellowship').length).toBeGreaterThan(0);

    // Verify Debated Motions section
    expect(screen.getByText("Motions We've Argued on the Floor")).toBeInTheDocument();
    expect(screen.getByText(/Condition All Foreign Mineral Concessions/i)).toBeInTheDocument();
    expect(screen.getByText(/Repudiate Odious Historical Debts/i)).toBeInTheDocument();

    // Verify Voice Dispatch audio player
    expect(screen.getByText(/Voice Dispatch • Circle 07/i)).toBeInTheDocument();
    const playBtn = screen.getByLabelText('Play voice dispatch');
    expect(playBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(playBtn);
    });

    expect(screen.getByLabelText('Pause voice dispatch')).toBeInTheDocument();
    expect(screen.getByText(/0:24 \/ 1:18/)).toBeInTheDocument();
  });

  test('should open partner modal and submit partnership inquiry with confirmation reference number', async () => {
    render(
      <AppProvider>
        <LandingPage />
      </AppProvider>
    );

    // Click "Inquire for School Partnership"
    const partnerBtn = screen.getByRole('button', { name: /Inquire for School Partnership/i });
    expect(partnerBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(partnerBtn);
    });

    // Verify dialog opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Partner with Global Orators Academy')).toBeInTheDocument();

    // Fill form fields
    const orgInput = screen.getByLabelText(/Organization/i);
    const emailInput = screen.getByLabelText(/Contact Email/i);

    fireEvent.change(orgInput, { target: { value: 'Strathmore University' } });
    fireEvent.change(emailInput, { target: { value: 'dean@strathmore.edu' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Submit Inquiry/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Verify success confirmation with reference ID
    expect(await screen.findByText('Inquiry Successfully Logged')).toBeInTheDocument();
    expect(screen.getByText('GOP-INQ-TEST-001')).toBeInTheDocument();
  });

  test('should open and close mobile navigation drawer with standard nav links on LandingPage', async () => {
    render(
      <AppProvider>
        <LandingPage />
      </AppProvider>
    );

    const mobileToggleBtn = document.getElementById('mobile-toc-toggle');
    expect(mobileToggleBtn).toBeInTheDocument();

    // Verify desktop standard nav has Home, About, Academy
    expect(screen.getAllByRole('link', { name: 'Home' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'About' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Academy' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Foundation' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Escapism' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Tournaments' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Testimonials' }).length).toBeGreaterThan(0);

    // Open mobile drawer
    await act(async () => {
      fireEvent.click(mobileToggleBtn!);
    });

    // Check that standard nav links are rendered in mobile drawer
    expect(screen.getAllByRole('link', { name: 'Home' }).length).toBeGreaterThan(1);
    expect(screen.getAllByRole('link', { name: 'About' }).length).toBeGreaterThan(1);
    expect(screen.getAllByRole('link', { name: 'Academy' }).length).toBeGreaterThan(1);
    expect(screen.getAllByRole('link', { name: 'Foundation' }).length).toBeGreaterThan(1);

    // Close drawer
    await act(async () => {
      fireEvent.click(mobileToggleBtn!);
    });
  });

  test('should render Speaker Spotlight and Testimonials featuring authentic profiles for Imani, Milo Brian, and Valerie Wanjiku', () => {
    render(
      <AppProvider>
        <LandingPage />
      </AppProvider>
    );

    // Verify Speaker Spotlight header
    expect(screen.getByText(/Voices of Conviction: Rigor, Rhetoric, and Courage/i)).toBeInTheDocument();

    // Verify Imani's presence in spotlight & testimonials
    expect(screen.getAllByText('Imani').length).toBeGreaterThan(0);
    expect(screen.getByText(/Spotlight 01 · Philosophy & Voice/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Imani studying and drafting philosophical debate arguments/i)).toBeInTheDocument();

    // Verify Milo Brian's presence in spotlight & testimonials
    expect(screen.getAllByText('Milo Brian').length).toBeGreaterThan(0);
    expect(screen.getByText(/Spotlight 02 · Law, Debate & Poetry/i)).toBeInTheDocument();
    expect(screen.getByText(/Milo, among other things, is a legal scholar, award winning debater, poet/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Milo Brian delivering an award-winning speech at the podium with microphone/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Milo Brian reviewing debate frameworks and poetry in front of a green chalkboard/i)).toBeInTheDocument();

    // Verify Valerie Wanjiku's presence in spotlight
    expect(screen.getAllByText('Valerie Wanjiku').length).toBeGreaterThan(0);
    expect(screen.getByText(/Spotlight 03 · Storytelling & African Voices/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Valerie Wanjiku addressing the continental assembly forum at the rostrum in Maseru/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Valerie Wanjiku in oratorical delivery at the International Sports and Olympism podium/i)).toBeInTheDocument();
  });

  test('should render dynamic Step 3 Personal Baseline adapted for Foundation Escapism & Catharsis by default', async () => {
    render(
      <AppProvider>
        <OnboardingFlow />
      </AppProvider>
    );

    // Default Step 1 is Foundation
    // Navigate from Step 1 to Step 2
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    await act(async () => {
      fireEvent.click(continueBtn);
    });

    // Step 2 is on Foundation: default is Speaking as a Form of Escapism & Emotional Catharsis
    expect(screen.getByText('Speaking as a Form of Escapism & Emotional Catharsis')).toBeInTheDocument();

    // Navigate from Step 2 to Step 3
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    });

    // Step 3 assertions dynamically configured for Foundation Cathartic Sanctuary
    expect(screen.getByText('Cathartic & Emotional Baseline')).toBeInTheDocument();
    expect(screen.getByText(/A confidential sanctuary to calibrate your vocal release/i)).toBeInTheDocument();
    expect(screen.getByText('Personal & Community Identity')).toBeInTheDocument();
    expect(screen.getByText("Community / Children's Home / Self-Nominated")).toBeInTheDocument();
    expect(screen.getByText('Safe Expression Modality')).toBeInTheDocument();
    expect(screen.getByText('Private Audio Vault')).toBeInTheDocument();
    expect(screen.getByText('Healing & Expression Priority')).toBeInTheDocument();
    expect(screen.getByText('Emotional Release')).toBeInTheDocument();
    expect(screen.getByText('Diaphragmatic Calm')).toBeInTheDocument();
    expect(screen.getByText(/Speaking Cadence & Tempo Target/i)).toBeInTheDocument();
    expect(screen.getByText('Gentle & Unhurried')).toBeInTheDocument();
  });

  test('should dynamically reconfigure Step 3 when choosing Academy Competitive Debate track', async () => {
    render(
      <AppProvider>
        <OnboardingFlow />
      </AppProvider>
    );

    // Click Academy in Step 1
    const academyBtn = screen.getByRole('button', { name: /Global Orators Academy/i });
    await act(async () => {
      fireEvent.click(academyBtn);
    });

    // Move to Step 2
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    });

    // Select Competitive Parliamentary Debate mission
    const debateOption = screen.getByRole('button', { name: /Competitive Parliamentary Debate/i });
    await act(async () => {
      fireEvent.click(debateOption);
    });

    // Move to Step 3
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    });

    // Verify Step 3 has reconfigured dynamically for Competitive Forensics
    expect(screen.getByText('Competitive Forensics Baseline')).toBeInTheDocument();
    expect(screen.getByText(/Calibrate your tournament circuit, debating format/i)).toBeInTheDocument();
    expect(screen.getByText('Personal & Institutional Identity')).toBeInTheDocument();
    expect(screen.getByText('University / Debate Society / School')).toBeInTheDocument();
    expect(screen.getByText('Primary Forensics Format')).toBeInTheDocument();
    expect(screen.getByText('British Parliamentary')).toBeInTheDocument();
    expect(screen.getByText('World Schools (WSDC)')).toBeInTheDocument();
    expect(screen.getByText('Technical Development Priority')).toBeInTheDocument();
    expect(screen.getByText('Argumentation & Rebuttal')).toBeInTheDocument();
    expect(screen.getByText('Motion Analysis & POIs')).toBeInTheDocument();
    expect(screen.getByText('Forensics Pace')).toBeInTheDocument();
  });

  test('should dynamically reconfigure Step 3 when choosing Academy Executive Pitching track', async () => {
    render(
      <AppProvider>
        <OnboardingFlow />
      </AppProvider>
    );

    // Click Academy in Step 1
    const academyBtn = screen.getByRole('button', { name: /Global Orators Academy/i });
    await act(async () => {
      fireEvent.click(academyBtn);
    });

    // Move to Step 2
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    });

    // Select Executive & Investor Boardroom Pitching mission
    const pitchOption = screen.getByRole('button', { name: /Executive & Investor Boardroom Pitching/i });
    await act(async () => {
      fireEvent.click(pitchOption);
    });

    // Move to Step 3
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    });

    // Verify Step 3 has reconfigured dynamically for Executive & Capital Pitch
    expect(screen.getByText('Executive & Capital Pitch Baseline')).toBeInTheDocument();
    expect(screen.getByText(/Calibrate your venture narrative, corporate boardroom defense/i)).toBeInTheDocument();
    expect(screen.getByText('Executive & Enterprise Identity')).toBeInTheDocument();
    expect(screen.getByText('Company / Venture / Incubator')).toBeInTheDocument();
    expect(screen.getByText('Boardroom & Commercial Format')).toBeInTheDocument();
    expect(screen.getByText('VC Investment Pitch')).toBeInTheDocument();
    expect(screen.getByText('Boardroom Defense')).toBeInTheDocument();
    expect(screen.getByText('Executive Competency Priority')).toBeInTheDocument();
    expect(screen.getByText('Metric Defensibility')).toBeInTheDocument();
    expect(screen.getByText('Hostile Q&A Defense')).toBeInTheDocument();
    expect(screen.getByText('Authoritative')).toBeInTheDocument();
  });

  test('should skip Step 1 and land directly on Step 2 when user clicks Apply to Academy CTA, displaying Best for indicators', async () => {
    // Simulate user clicking "Apply to Academy" CTA which stores branch in localStorage
    localStorage.setItem('globalorators_selected_branch', 'Academy');

    render(
      <AppProvider>
        <OnboardingFlow />
      </AppProvider>
    );

    // Should NOT show Step 1 "Choose Your Functional Branch"
    expect(screen.queryByText('Choose Your Functional Branch')).not.toBeInTheDocument();

    // Should land directly on Step 2 with Academy mission options
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    expect(screen.getByText('Define Your Core Speaking Mission')).toBeInTheDocument();
    expect(screen.getByText(/Debaters, varsity students & corporate speakers/i)).toBeInTheDocument();
    expect(screen.getByText('Pan-African Leadership & Cognitive Deconditioning')).toBeInTheDocument();
    expect(screen.getByText(/Civic organizers, public intellectuals & political youth/i)).toBeInTheDocument();
    expect(screen.getByText(/Competitive Parliamentary Debate/i)).toBeInTheDocument();

    // Clicking Previous should allow them to return to Step 1 if they want to change their branch
    const prevBtn = screen.getByRole('button', { name: /Previous/i });
    await act(async () => {
      fireEvent.click(prevBtn);
    });

    expect(screen.getByText('Choose Your Functional Branch')).toBeInTheDocument();
  });

  test('should display Foundation track Best for indicators when on Foundation Step 2', async () => {
    localStorage.setItem('globalorators_selected_branch', 'Foundation');

    render(
      <AppProvider>
        <OnboardingFlow />
      </AppProvider>
    );

    // Should land directly on Step 2 with Foundation mission options
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    expect(screen.getByText(/Personal healing, vulnerability & youth advocacy/i)).toBeInTheDocument();
    expect(screen.getByText(/Speaking as a Form of Escapism & Emotional Catharsis/i)).toBeInTheDocument();
    expect(screen.getByText(/Personal healing, emotional release & safe expression/i)).toBeInTheDocument();
  });

  test('should render and accept Phone Number on Step 3 of the onboarding form', async () => {
    localStorage.setItem('globalorators_selected_branch', 'Academy');

    render(
      <AppProvider>
        <OnboardingFlow />
      </AppProvider>
    );

    // Move from Step 2 to Step 3
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    await act(async () => {
      fireEvent.click(continueBtn);
    });

    // Verify Phone input is present
    expect(screen.getByText(/Phone Number \(WhatsApp\)/i)).toBeInTheDocument();
    const phoneInput = screen.getByPlaceholderText('+254 700 000 000');
    expect(phoneInput).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(phoneInput, { target: { value: '+254 712 345 678' } });
    });

    expect(phoneInput).toHaveValue('+254 712 345 678');
  });

  test('should render Other option on Step 2 and enable user to provide custom description', async () => {
    localStorage.setItem('globalorators_selected_branch', 'Academy');

    render(
      <AppProvider>
        <OnboardingFlow />
      </AppProvider>
    );

    // Verify "Other Speaking Pursuit" option exists on Step 2
    const otherOption = screen.getByRole('button', { name: /Other Speaking Pursuit/i });
    expect(otherOption).toBeInTheDocument();

    // Click "Other Speaking Pursuit"
    await act(async () => {
      fireEvent.click(otherOption);
    });

    // Verify description textarea appears
    expect(screen.getByText(/Describe What You Are Looking For/i)).toBeInTheDocument();
    const descInput = screen.getByPlaceholderText(/Briefly describe what you are looking to achieve/i);
    expect(descInput).toBeInTheDocument();

    // Type custom description
    await act(async () => {
      fireEvent.change(descInput, { target: { value: 'Preparing a TEDx keynote on clean energy policy across Africa' } });
    });

    expect(descInput).toHaveValue('Preparing a TEDx keynote on clean energy policy across Africa');

    // Click Continue to move to Step 3
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    await act(async () => {
      fireEvent.click(continueBtn);
    });

    // Verify Step 3 renders the Bespoke Speaking Baseline
    expect(screen.getByText('Bespoke Oratory & Rhetoric Baseline')).toBeInTheDocument();
    expect(screen.getByText(/Calibrate your personalized speaking trajectory/i)).toBeInTheDocument();
  });

  test('should render Other Arena and Other Priority options on Step 3 and enable custom descriptions', async () => {
    localStorage.setItem('globalorators_selected_branch', 'Academy');

    render(
      <AppProvider>
        <OnboardingFlow />
      </AppProvider>
    );

    // Advance to Step 3
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    await act(async () => {
      fireEvent.click(continueBtn);
    });

    expect(screen.getByText(/Sovereign Rhetoric & Leadership Baseline/i)).toBeInTheDocument();

    // 1. Test Other Arena / Format
    const otherArenaBtn = screen.getByRole('button', { name: /Other Arena \/ Format/i });
    expect(otherArenaBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(otherArenaBtn);
    });

    expect(screen.getByText(/Describe What You Are Looking For in Your Arena/i)).toBeInTheDocument();
    const arenaInput = screen.getByPlaceholderText(/African Union Youth Plenary/i);
    expect(arenaInput).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(arenaInput, { target: { value: 'African Union Model Summit Plenary' } });
    });
    expect(arenaInput).toHaveValue('African Union Model Summit Plenary');

    // 2. Test Other Technical Priority
    const otherPriorityBtn = screen.getByRole('button', { name: /Other Priority \/ Skill Need/i });
    expect(otherPriorityBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(otherPriorityBtn);
    });

    expect(screen.getByText(/Describe What You Are Looking For in Your Priority/i)).toBeInTheDocument();
    const priorityInput = screen.getByPlaceholderText(/Overcoming throat constriction/i);
    expect(priorityInput).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(priorityInput, { target: { value: 'Mastering rapid extemporaneous rebuttal under pressure' } });
    });
    expect(priorityInput).toHaveValue('Mastering rapid extemporaneous rebuttal under pressure');

    // Fill required Name and Email
    const nameInput = screen.getByPlaceholderText(/Kwame Mensah/i);
    const emailInput = screen.getByPlaceholderText(/nia@example.org/i);
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Kwame Mensah' } });
      fireEvent.change(emailInput, { target: { value: 'kwame@pan-african.org' } });
    });

    // Advance to Step 4
    const nextBtn = screen.getByRole('button', { name: /Continue/i });
    await act(async () => {
      fireEvent.click(nextBtn);
    });

    // Verify Step 4 renders
    expect(screen.getByText(/Commit to Daily Orator Habits/i)).toBeInTheDocument();
  });

  test('should render refined Step 4 habits in 2-column layout with branch-tailored options and custom ritual input', async () => {
    // Test Academy track Step 4
    localStorage.setItem('globalorators_selected_branch', 'Academy');

    const { unmount } = render(
      <AppProvider>
        <OnboardingFlow initialStep={4} />
      </AppProvider>
    );

    expect(screen.getByText('Commit to Daily Orator Habits')).toBeInTheDocument();
    expect(screen.getByText(/Great orators are forged through daily discipline/i)).toBeInTheDocument();
    expect(screen.getByText('Diaphragmatic Breathwork & Resonance')).toBeInTheDocument();
    expect(screen.getByText('VOCAL CORE • 5 MIN')).toBeInTheDocument();
    expect(screen.getByText('Rapid Motion Rebuttal Drills')).toBeInTheDocument();
    expect(screen.getByText('FORENSICS • 7 MIN')).toBeInTheDocument();

    // Verify Other / Custom Ritual button
    const otherRitualBtn = screen.getByRole('button', { name: /Other \/ Custom Ritual/i });
    expect(otherRitualBtn).toBeInTheDocument();
    expect(screen.getByText('BESPOKE • CUSTOM')).toBeInTheDocument();

    // Click Other / Custom Ritual
    await act(async () => {
      fireEvent.click(otherRitualBtn);
    });

    expect(screen.getByText(/Describe Your Daily Ritual \*/i)).toBeInTheDocument();
    const customHabitInput = screen.getByPlaceholderText(/5-minute vocal sirens/i);
    expect(customHabitInput).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(customHabitInput, { target: { value: '10-minute bedtime vocal straw phonation and pitch sweeps' } });
    });
    expect(customHabitInput).toHaveValue('10-minute bedtime vocal straw phonation and pitch sweeps');

    unmount();

    // Test Foundation track Step 4
    localStorage.setItem('globalorators_selected_branch', 'Foundation');

    render(
      <AppProvider>
        <OnboardingFlow initialBranch="Foundation" initialStep={4} />
      </AppProvider>
    );

    expect(screen.getByText('Commit to Daily Orator Habits')).toBeInTheDocument();
    expect(screen.getByText(/Sovereign voices are nurtured through daily sanctuary/i)).toBeInTheDocument();
    expect(screen.getByText('Cathartic Voice Audio Journaling')).toBeInTheDocument();
    expect(screen.getByText('CATHARSIS • 1 MIN')).toBeInTheDocument();
    expect(screen.getByText('Diaphragmatic Somatic Grounding')).toBeInTheDocument();
    expect(screen.getByText('GROUNDING • 5 MIN')).toBeInTheDocument();
  });
});


