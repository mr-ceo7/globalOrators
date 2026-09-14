import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpeakerMobileBottomNav } from '../components/clientApp/SpeakerMobileBottomNav';

describe('SpeakerMobileBottomNav', () => {
  const defaultProps = {
    speakerTab: 'today' as const,
    setSpeakerTab: vi.fn(),
    onOpenLiveRehearsal: vi.fn(),
    isExecutive: true,
    isAcademy: false,
    unreadCount: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 4 primary navigation tabs and the center quick action trigger', () => {
    render(<SpeakerMobileBottomNav {...defaultProps} />);

    expect(screen.getByRole('tab', { name: /^Today$/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^Drills$/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^Rituals$/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^Coach$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Speaker quick actions and live rehearsal/i)).toBeInTheDocument();
  });

  it('calls setSpeakerTab when a navigation tab is clicked', async () => {
    render(<SpeakerMobileBottomNav {...defaultProps} />);

    const drillsTab = screen.getByRole('tab', { name: /^Drills$/i });
    await act(async () => {
      fireEvent.click(drillsTab);
    });
    expect(defaultProps.setSpeakerTab).toHaveBeenCalledWith('practice');

    const ritualsTab = screen.getByRole('tab', { name: /^Rituals$/i });
    await act(async () => {
      fireEvent.click(ritualsTab);
    });
    expect(defaultProps.setSpeakerTab).toHaveBeenCalledWith('habits');

    const coachTab = screen.getByRole('tab', { name: /^Coach$/i });
    await act(async () => {
      fireEvent.click(coachTab);
    });
    expect(defaultProps.setSpeakerTab).toHaveBeenCalledWith('coach');
  });

  it('displays unread notification badge when unreadCount > 0', () => {
    render(<SpeakerMobileBottomNav {...defaultProps} unreadCount={3} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('opens quick action sheet modal when center FAB is clicked and triggers actions', async () => {
    render(<SpeakerMobileBottomNav {...defaultProps} />);

    const fabBtn = screen.getByLabelText(/Speaker quick actions and live rehearsal/i);
    await act(async () => {
      fireEvent.click(fabBtn);
    });

    // Action sheet contents should now be visible
    expect(screen.getByText('Speaker Quick Actions')).toBeInTheDocument();
    expect(screen.getByText(/Launch Chamber/i)).toBeInTheDocument();
    expect(screen.getByText(/Speech Analytics/i)).toBeInTheDocument();

    // Click Launch Chamber
    const launchChamberBtn = screen.getByRole('button', { name: /Launch Chamber/i });
    await act(async () => {
      fireEvent.click(launchChamberBtn);
    });

    expect(defaultProps.onOpenLiveRehearsal).toHaveBeenCalledTimes(1);
  });

  it('navigates to analytics from quick actions sheet', async () => {
    render(<SpeakerMobileBottomNav {...defaultProps} />);

    const fabBtn = screen.getByLabelText(/Speaker quick actions and live rehearsal/i);
    await act(async () => {
      fireEvent.click(fabBtn);
    });

    const analyticsBtn = screen.getByRole('button', { name: /Speech Analytics/i });
    await act(async () => {
      fireEvent.click(analyticsBtn);
    });

    expect(defaultProps.setSpeakerTab).toHaveBeenCalledWith('progress');
  });
});
