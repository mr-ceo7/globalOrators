import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import { LandingPage } from '../components/landing/LandingPage';
import { SEOHead } from '../components/common/SEOHead';

vi.mock('../services/apiClient', () => ({
  clearAuthSession: vi.fn(),
  authApi: { me: vi.fn().mockResolvedValue({ email: 'coach@globalorators.com' }) },
  clientsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  exercisesApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  programsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  workoutsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  metricsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  prsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  habitsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  photosApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  messagesApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  activityApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  inquiriesApi: { submit: vi.fn().mockResolvedValue({ status: 'success' }), list: vi.fn().mockResolvedValue([]) }
}));

const NavigationTester: React.FC = () => {
  const { navigate, currentPath } = useApp();
  return (
    <div>
      <div data-testid="current-path">{currentPath}</div>
      <button onClick={() => navigate('/about')}>Go to About</button>
      <button onClick={() => navigate('/academy')}>Go to Academy</button>
      <button onClick={() => navigate('/foundation')}>Go to Foundation</button>
      <button onClick={() => navigate('/escapism')}>Go to Escapism</button>
      <button onClick={() => navigate('/tournaments')}>Go to Tournaments</button>
      <button onClick={() => navigate('/testimonials')}>Go to Testimonials</button>
      <button onClick={() => navigate('/')}>Go to Home</button>
      <LandingPage />
    </div>
  );
};

describe('Global Orators Dedicated Routing & SEO Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  test('should render HomePage by default and navigate to Academy page', async () => {
    render(
      <AppProvider>
        <NavigationTester />
      </AppProvider>
    );

    // Initial page should be Home
    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
    expect(screen.getByRole('heading', { level: 1, name: /Words Shape Nations/i })).toBeInTheDocument();

    // Navigate to Academy
    const academyBtn = screen.getByText('Go to Academy');
    await act(async () => {
      fireEvent.click(academyBtn);
    });

    expect(screen.getByTestId('current-path')).toHaveTextContent('/academy');
    expect(screen.getByRole('heading', { level: 1, name: /The Sovereign Chamber of Forensics/i })).toBeInTheDocument();
    expect(screen.getByText('The 4 Mastery Modules')).toBeInTheDocument();
    expect(screen.getByText('Obed')).toBeInTheDocument();
  });

  test('should navigate to About page and Foundation page', async () => {
    render(
      <AppProvider>
        <NavigationTester />
      </AppProvider>
    );

    // Navigate to About
    const aboutBtn = screen.getByText('Go to About');
    await act(async () => {
      fireEvent.click(aboutBtn);
    });

    expect(screen.getByTestId('current-path')).toHaveTextContent('/about');
    expect(screen.getByText('The Crisis of Cognitive Dependency')).toBeInTheDocument();
    expect(screen.getByText('Nairobi, Kenya')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /A Generation That Can Speak Must Also Learn to Think/i })).toBeInTheDocument();
    expect(screen.getAllByText('Geoffrey Anyona').length).toBeGreaterThan(0);
    expect(screen.getByText(/curated corporate communications training/i)).toBeInTheDocument();

    // Verify Chapter III: Movement Directorate & Faculty
    expect(screen.getByRole('heading', { level: 2, name: /The Minds Behind the Movement/i })).toBeInTheDocument();
    expect(screen.getByText(/Tyrese King[’']?ori Nyawira/i)).toBeInTheDocument();
    expect(screen.getByText('Milo Brian')).toBeInTheDocument();
    expect(screen.getByText('Obed Imbusi')).toBeInTheDocument();
    expect(screen.getByText('Liz Imani')).toBeInTheDocument();
    expect(screen.getByText('Rachael')).toBeInTheDocument();
    expect(screen.getByText('Qassim Musa')).toBeInTheDocument();
    expect(screen.getByText('Michelle Kinanga')).toBeInTheDocument();

    // Navigate to Foundation
    const foundationBtn = screen.getByText('Go to Foundation');
    await act(async () => {
      fireEvent.click(foundationBtn);
    });

    expect(screen.getByTestId('current-path')).toHaveTextContent('/foundation');
    expect(screen.getByRole('heading', { level: 1, name: /Radical Accessibility/i })).toBeInTheDocument();
    expect(screen.getByText('100% Barrier-Free Fellowships')).toBeInTheDocument();
    expect(screen.getByText("Children's Shelter Healing Circles")).toBeInTheDocument();
  });

  test('should navigate to Escapism, Tournaments, and Testimonials pages', async () => {
    render(
      <AppProvider>
        <NavigationTester />
      </AppProvider>
    );

    // Navigate to Escapism
    await act(async () => {
      fireEvent.click(screen.getByText('Go to Escapism'));
    });
    expect(screen.getByTestId('current-path')).toHaveTextContent('/escapism');
    expect(screen.getByRole('heading', { level: 1, name: /Speaking as Escapism: The Liberation of Truth/i })).toBeInTheDocument();
    expect(screen.getByText('The 4 Vocal Release Protocols')).toBeInTheDocument();

    // Navigate to Tournaments
    await act(async () => {
      fireEvent.click(screen.getByText('Go to Tournaments'));
    });
    expect(screen.getByTestId('current-path')).toHaveTextContent('/tournaments');
    expect(screen.getByRole('heading', { level: 1, name: /Fielding Champions on World Stages/i })).toBeInTheDocument();
    expect(screen.getByText('Pan-African Universities Championship')).toBeInTheDocument();

    // Navigate to Testimonials
    await act(async () => {
      fireEvent.click(screen.getByText('Go to Testimonials'));
    });
    expect(screen.getByTestId('current-path')).toHaveTextContent('/testimonials');
    expect(screen.getByText('Imani')).toBeInTheDocument();
    expect(screen.getByText('Milo Brian')).toBeInTheDocument();
    expect(screen.getByText('Obed')).toBeInTheDocument();
    expect(screen.getByText(/Academy Debate Fellow & Youth Leader/i)).toBeInTheDocument();
  });

  test('should inject SEO metadata tags and Schema.org JSON-LD structured data', () => {
    const mockJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      'name': 'Test Forensic Course'
    };

    render(
      <SEOHead
        title="Custom Test Page Title"
        description="Custom test meta description for search engine ranking."
        canonicalPath="/test-path"
        jsonLd={mockJsonLd}
      />
    );

    // Verify document title
    expect(document.title).toContain('Custom Test Page Title');
    expect(document.title).toContain('Global Orators Project');

    // Verify meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription?.getAttribute('content')).toBe('Custom test meta description for search engine ranking.');

    // Verify robots meta tag (index, follow by default)
    const metaRobots = document.querySelector('meta[name="robots"]');
    expect(metaRobots?.getAttribute('content')).toContain('index, follow');

    // Verify canonical link
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    expect(canonicalLink?.getAttribute('href')).toBe('https://globaloratorsproject.com/test-path');

    // Verify JSON-LD script
    const jsonLdScript = document.getElementById('seo-json-ld');
    expect(jsonLdScript).toBeInTheDocument();
    expect(jsonLdScript?.textContent).toContain('Test Forensic Course');

    // Verify OpenGraph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute('content')).toContain('Custom Test Page Title');

    const ogDesc = document.querySelector('meta[property="og:description"]');
    expect(ogDesc?.getAttribute('content')).toBe('Custom test meta description for search engine ranking.');

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute('content')).toBe('https://globaloratorsproject.com/images/og-preview.jpg');

    const ogWidth = document.querySelector('meta[property="og:image:width"]');
    expect(ogWidth?.getAttribute('content')).toBe('1200');

    // Verify Twitter card tags
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    expect(twitterImage?.getAttribute('content')).toBe('https://globaloratorsproject.com/images/og-preview.jpg');
  });

  test('should set noindex, nofollow when noIndex prop is true', () => {
    render(
      <SEOHead
        title="Private Portal"
        description="Private internal area"
        canonicalPath="/coach"
        noIndex={true}
      />
    );

    const metaRobots = document.querySelector('meta[name="robots"]');
    expect(metaRobots?.getAttribute('content')).toBe('noindex, nofollow');
  });

  test('should verify exactly one h1 element is rendered on HomePage', () => {
    render(
      <AppProvider>
        <NavigationTester />
      </AppProvider>
    );

    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    expect(h1Elements).toHaveLength(1);
    expect(h1Elements[0]).toHaveTextContent(/Words Shape Nations/i);
  });

  test('should navigate to /apply and transition to onboarding portal', async () => {
    const ApplyTester: React.FC = () => {
      const { navigate, currentPath, currentPortal } = useApp();
      return (
        <div>
          <div data-testid="portal-val">{currentPortal}</div>
          <div data-testid="path-val">{currentPath}</div>
          <button onClick={() => navigate('/apply')}>Apply Now</button>
        </div>
      );
    };

    render(
      <AppProvider>
        <ApplyTester />
      </AppProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Apply Now'));
    });

    expect(screen.getByTestId('path-val')).toHaveTextContent('/apply');
    expect(screen.getByTestId('portal-val')).toHaveTextContent('onboarding');
  });
});
