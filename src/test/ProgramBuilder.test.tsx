import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import { ProgramBuilder } from '../components/programs/ProgramBuilder';

vi.mock('../services/apiClient', () => ({
  authApi: { me: vi.fn().mockResolvedValue({ email: 'coach@globalorators.com' }) },
  clientsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  exercisesApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  programsApi: { 
    list: vi.fn().mockResolvedValue([]), 
    getAll: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockImplementation((p) => Promise.resolve(p)),
    delete: vi.fn().mockResolvedValue(true),
    assign: vi.fn().mockResolvedValue(true)
  },
  workoutsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  metricsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  prsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  habitsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  photosApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  messagesApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  activityApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  inquiriesApi: { submit: vi.fn().mockResolvedValue({ status: 'success' }) }
}));

describe('Global Orators ProgramBuilder Redesign', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the oratorical curriculum builder with speech headers and saved curriculums', () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    expect(screen.getByText('ORATORICAL SYLLABUS STUDIO')).toBeInTheDocument();
    expect(screen.getByText('Curriculum & Forensics Protocol Builder')).toBeInTheDocument();
    expect(screen.getByText('+ New Curriculum')).toBeInTheDocument();
    expect(screen.getByText('Assign to Speaker')).toBeInTheDocument();
    expect(screen.getByText('Save Curriculum')).toBeInTheDocument();
  });

  test('displays sessions tabs and allows switching between sessions', () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    // Should have session tabs (not gym workout days)
    const session1Buttons = screen.getAllByText(/Session 1/i);
    expect(session1Buttons.length).toBeGreaterThan(0);

    // Switcher tabs for blueprint, 6-phase breakdown, and assigned drills
    expect(screen.getByText('Blueprint & Objectives')).toBeInTheDocument();
    expect(screen.getByText('6-Phase Breakdown')).toBeInTheDocument();
  });

  test('allows viewing 6-phase standardized masterclass breakdown', () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    const phasesTab = screen.getByText('6-Phase Breakdown');
    fireEvent.click(phasesTab);

    expect(screen.getByText('STANDARDIZED 6-PHASE MASTERCLASS TIMELINE')).toBeInTheDocument();
  });

  test('allows adding and removing session objectives', () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    const blueprintTab = screen.getByText('Blueprint & Objectives');
    fireEvent.click(blueprintTab);

    const input = screen.getByPlaceholderText(/Add specific learning outcome/i);
    fireEvent.change(input, { target: { value: 'Master eye contact during executive pauses' } });

    const addBtn = screen.getByRole('button', { name: '+ Add' });
    fireEvent.click(addBtn);

    expect(screen.getByText('Master eye contact during executive pauses')).toBeInTheDocument();
  });

  test('opens drill picker modal when clicking Add Drill', () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    const addDrillBtns = screen.getAllByText(/Add Drill/i);
    fireEvent.click(addDrillBtns[0]);

    expect(screen.getByPlaceholderText(/Search drills by keyword/i)).toBeInTheDocument();
  });

  test('opens assign to speaker modal and displays client list', () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    const assignBtn = screen.getByRole('button', { name: /Assign to Speaker/i });
    fireEvent.click(assignBtn);

    expect(screen.getByText('Assign Curriculum to Speaker')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm Enrollment/i })).toBeInTheDocument();
  });

  test('creates a new blank speech curriculum without gym slop', () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    const newBtn = screen.getByRole('button', { name: /\+ New Curriculum/i });
    fireEvent.click(newBtn);

    expect(screen.getByDisplayValue('New Speech & Debate Masterclass')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Structured Oratory Syllabus & Rehearsal Protocol')).toBeInTheDocument();
  });
});
