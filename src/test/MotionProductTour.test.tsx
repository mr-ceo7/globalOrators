import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MotionProductTour } from '../components/landing/MotionProductTour';
import { DemoPage } from '../pages/DemoPage';
import { AppProvider } from '../context/AppContext';

// Mock matchMedia and scrollTo
window.scrollTo = vi.fn();

describe('MotionProductTour Component', () => {
  it('renders the programmatic motion header and commanding headline without status dots', () => {
    render(
      <AppProvider>
        <MotionProductTour />
      </AppProvider>
    );

    // Header kicker
    expect(screen.getByText(/Programmatic Motion Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Dual-Portal 3D Architecture/i)).toBeInTheDocument();

    // Commanding headline
    expect(screen.getByText(/Sovereign Debate Forensics/i)).toBeInTheDocument();
    expect(screen.getByText(/Engineered in Full 3D Motion/i)).toBeInTheDocument();

    // Zero AI Slop: Check no status indicator dot as kicker in header
    const headerKicker = screen.getByText(/Programmatic Motion Engine/i).parentElement;
    expect(headerKicker?.textContent).not.toMatch(/^●/);
  });

  it('renders all four scene navigation buttons', () => {
    render(
      <AppProvider>
        <MotionProductTour />
      </AppProvider>
    );

    expect(screen.getByRole('button', { name: /Coach OS Command Center/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cursor Action & State Flip/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Speaker Rehearsal Chamber/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Synchronized Dual Architecture/i })).toBeInTheDocument();
  });

  it('switches scenes and reveals the Speaker Chamber card on click', () => {
    render(
      <AppProvider>
        <MotionProductTour />
      </AppProvider>
    );

    const speakerSceneBtn = screen.getByRole('button', { name: /03 Speaker Rehearsal Chamber/i });
    fireEvent.click(speakerSceneBtn);

    // Speaker Chamber components are present
    expect(screen.getByText(/Orators Portal \/\/ Live Rehearsal Chamber/i)).toBeInTheDocument();
    expect(screen.getAllByText(/"This House Would Decolonize Pan-African Curricula"/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Vocal Resonance & Clash Spectrum/i)).toBeInTheDocument();
  });

  it('toggles 3D Orbit mode on and off', () => {
    render(
      <AppProvider>
        <MotionProductTour />
      </AppProvider>
    );

    const orbitBtn = screen.getByTitle(/Toggle interactive free 3D tilt/i);
    expect(orbitBtn).toHaveTextContent(/3D Orbit/i);

    fireEvent.click(orbitBtn);
    expect(orbitBtn).toHaveTextContent(/Orbit Active/i);

    fireEvent.click(orbitBtn);
    expect(orbitBtn).toHaveTextContent(/3D Orbit/i);
  });

  it('provides a direct download link for the MP4 launch video', () => {
    render(
      <AppProvider>
        <MotionProductTour />
      </AppProvider>
    );

    const downloadLink = screen.getByTitle(/Download MP4 video for marketing/i);
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', '/videos/gop-product-launch-demo.mp4');
    expect(downloadLink).toHaveAttribute('download', 'gop-product-launch-demo.mp4');
  });

  it('opens and closes the video modal player on clicking Watch Launch Reel', async () => {
    render(
      <AppProvider>
        <MotionProductTour />
      </AppProvider>
    );

    const watchBtn = screen.getByRole('button', { name: /Watch Launch Reel/i });
    fireEvent.click(watchBtn);

    // Modal is opened
    expect(screen.getByText(/Global Orators Launch Motion Reel/i)).toBeInTheDocument();
    expect(screen.getByText(/Programmatic Remotion Render \/\/ 1080p 30fps/i)).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByRole('button', { name: /Close modal/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Global Orators Launch Motion Reel/i)).not.toBeInTheDocument();
    });
  });
});

describe('DemoPage Route', () => {
  it('renders the DemoPage with motion tour and engineering specs', () => {
    const mockStartOnboarding = vi.fn();
    const mockOpenPartner = vi.fn();
    const mockNavigate = vi.fn();

    render(
      <AppProvider>
        <DemoPage
          onStartOnboarding={mockStartOnboarding}
          onOpenPartner={mockOpenPartner}
          onNavigate={mockNavigate}
        />
      </AppProvider>
    );

    // Engineering specs section
    expect(screen.getByText(/Engineering Specs/i)).toBeInTheDocument();
    expect(screen.getByText(/Programmatic Remotion Suite/i)).toBeInTheDocument();
    expect(screen.getByText(/Three.js WebGL Spatial Rig/i)).toBeInTheDocument();
    expect(screen.getByText(/Kinetic Spring Physics/i)).toBeInTheDocument();

    // Conversion actions
    const academyBtn = screen.getByRole('button', { name: /Apply to Academy/i });
    fireEvent.click(academyBtn);
    expect(mockStartOnboarding).toHaveBeenCalledWith('Academy');
  });
});
