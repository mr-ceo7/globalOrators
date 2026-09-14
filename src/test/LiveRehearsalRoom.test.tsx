import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LiveRehearsalRoom } from '../components/live/LiveRehearsalRoom';

describe('LiveRehearsalRoom Dual Engine Tests', () => {
  test('should render room title, speaker details, and self-hosted Jitsi chamber pointing to configured domain', () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <LiveRehearsalRoom
        isOpen={true}
        onClose={handleClose}
        roomTitle="PAUDC Grand Finals Prep"
        speakerName="Obed Imbusi"
        speakerId="client-101"
        userRole="coach"
        branch="Academy"
        onSaveFeedback={handleSave}
      />
    );

    // Verify header title and role context
    expect(screen.getByText('PAUDC Grand Finals Prep')).toBeInTheDocument();
    expect(screen.getByText('Coaching Rehearsal with Obed Imbusi')).toBeInTheDocument();
    expect(screen.getByText('Live Studio')).toBeInTheDocument();

    // Verify self-hosted Jitsi iframe rendered with custom domain
    const expectedDomain = (import.meta as any).env?.VITE_JITSI_DOMAIN || 'meet.globalorators.com';
    const iframe = screen.getByTitle('Live Meeting: PAUDC Grand Finals Prep');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', expect.stringContaining(expectedDomain));
    expect(iframe).toHaveAttribute('src', expect.stringContaining('GlobalOrators-ObedImbusi-client101'));
    expect(iframe).toHaveAttribute('src', expect.stringContaining('SHOW_JITSI_WATERMARK=false'));
    expect(iframe).toHaveAttribute('allow', expect.stringContaining('camera *; microphone *; display-capture *; autoplay *; clipboard-write *; screen-wake-lock *; fullscreen *; speaker-selection *; compute-pressure *'));

    // Verify Launch Fullscreen link for mobile / external view
    expect(screen.getByText('Launch Fullscreen')).toBeInTheDocument();

    // Verify forensic speech timer presets
    expect(screen.getByText('7:00 BP Speech')).toBeInTheDocument();
    expect(screen.getByText('5:00 Catharsis')).toBeInTheDocument();
    expect(screen.getByText('3:00 Rebuttal')).toBeInTheDocument();
    expect(screen.getByText('1:00 POI / Hook')).toBeInTheDocument();

    // Verify Parliamentary speech clock default for Academy BP is 07:00
    expect(screen.getByText('07:00')).toBeInTheDocument();
    expect(screen.getByText(/Protected Period/i)).toBeInTheDocument();
  });

  test('should switch from Self-Hosted Jitsi to Native P2P Studio mode seamlessly', () => {
    render(
      <LiveRehearsalRoom
        isOpen={true}
        onClose={vi.fn()}
        roomTitle="PAUDC Grand Finals Prep"
        speakerName="Obed Imbusi"
        speakerId="client-101"
        userRole="coach"
        branch="Academy"
      />
    );

    // Initially in Jitsi mode
    expect(screen.getByTitle('Live Meeting: PAUDC Grand Finals Prep')).toBeInTheDocument();

    // Switch to Native P2P Studio
    const nativeBtn = screen.getByRole('button', { name: /Native P2P Studio/i });
    fireEvent.click(nativeBtn);

    // Jitsi iframe is unmounted, Native controls and meters are rendered
    expect(screen.queryByTitle('Live Meeting: PAUDC Grand Finals Prep')).not.toBeInTheDocument();
    expect(screen.getByText(/ZERO-ADS • ENCRYPTED P2P/i)).toBeInTheDocument();
    expect(screen.getByText(/Vocal Projection/i)).toBeInTheDocument();
  });

  test('should switch timer preset and calculate remaining time', () => {
    render(
      <LiveRehearsalRoom
        isOpen={true}
        onClose={vi.fn()}
        roomTitle="Impromptu Rehearsal"
        speakerName="Nia Adebayo"
        userRole="speaker"
        branch="Foundation"
      />
    );

    // Default for Foundation is 5:00 (05:00)
    expect(screen.getByText('05:00')).toBeInTheDocument();

    // Switch to 3:00 Rebuttal
    const rebuttalBtn = screen.getByText('3:00 Rebuttal');
    fireEvent.click(rebuttalBtn);

    expect(screen.getByText('03:00')).toBeInTheDocument();
  });

  test('should allow coach to fill live evaluation rubric and save feedback', () => {
    const handleSave = vi.fn();

    render(
      <LiveRehearsalRoom
        isOpen={true}
        onClose={vi.fn()}
        roomTitle="Rebuttal Clash Drill"
        speakerName="Milo Brian"
        userRole="coach"
        branch="Academy"
        onSaveFeedback={handleSave}
      />
    );

    // Verify rubric elements
    expect(screen.getByText('Coach Live Evaluation Rubric')).toBeInTheDocument();
    expect(screen.getByText(/Dialectical Clash & Poise/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimated Speaking Pace/i)).toBeInTheDocument();

    // Type notes into rubric
    const notesInput = screen.getByPlaceholderText(/Jot down specific feedback/i);
    fireEvent.change(notesInput, { target: { value: 'Masterful extension on Point 2; maintain diaphragm engagement.' } });

    // Click save button
    const saveBtn = screen.getByText('Save Feedback to Speaker Vault');
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: 'Masterful extension on Point 2; maintain diaphragm engagement.',
        score: expect.any(Number),
        wpm: expect.any(Number)
      })
    );
  });

  test('should copy invite link to clipboard when clicked', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    render(
      <LiveRehearsalRoom
        isOpen={true}
        onClose={vi.fn()}
        roomTitle="Impromptu Rehearsal"
        speakerName="Kassim Musa"
        speakerId="client-1"
        userRole="coach"
      />
    );

    const copyBtn = screen.getByTitle('Copy rehearsal invite link');
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('GlobalOrators-KassimMusa-client1'));
  });

  test('should switch between Rehearse, Evaluate, and Debrief modes with session semantics', () => {
    render(
      <LiveRehearsalRoom
        isOpen={true}
        onClose={vi.fn()}
        roomTitle="Executive Boardroom Defense"
        speakerName="Dr. Arthur Vance"
        speakerId="exec-vance"
        userRole="coach"
        branch="Academy"
      />
    );

    // Initial Rehearse mode displays Practice Clock and Target outcome
    expect(screen.getByText('Practice Clock')).toBeInTheDocument();
    expect(screen.getByText(/Target:/i)).toBeInTheDocument();
    expect(screen.getByText('Session Directives')).toBeInTheDocument();

    // Switch to Evaluate mode
    const evaluateTabs = screen.getAllByRole('tab', { name: /Evaluate/i });
    fireEvent.click(evaluateTabs[0]);
    expect(screen.getByText('Executive Delivery & Poise Rubric')).toBeInTheDocument();

    // Switch to Debrief mode
    const debriefTabs = screen.getAllByRole('tab', { name: /Debrief/i });
    fireEvent.click(debriefTabs[0]);
    expect(screen.getByText('Session Debrief & Vault Archive')).toBeInTheDocument();
    expect(screen.getByText('Next Immediate Drill')).toBeInTheDocument();
    expect(screen.getByText('Archive Debrief to Speaker Vault')).toBeInTheDocument();
  });

  test('should close live rehearsal room when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <LiveRehearsalRoom
        isOpen={true}
        onClose={handleClose}
        roomTitle="Pan-African Chamber"
        speakerName="Obed Imbusi"
        userRole="speaker"
        branch="Academy"
      />
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
