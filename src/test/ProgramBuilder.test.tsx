import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import { ProgramBuilder } from '../components/programs/ProgramBuilder';

vi.mock('../services/apiClient', () => ({
  clearAuthSession: vi.fn(),
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
  inquiriesApi: { submit: vi.fn().mockResolvedValue({ status: 'success' }) },
  coachesApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  groupsApi: { getAll: vi.fn().mockResolvedValue([]), create: vi.fn(), startCall: vi.fn() },
}));

describe('Global Orators Minimalist Split-View ProgramBuilder', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the minimalist command bar, roadmap, and editorial canvas', () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    expect(screen.getByText('CURRICULUM')).toBeInTheDocument();
    expect(screen.getByText('SYLLABUS ROADMAP')).toBeInTheDocument();
    expect(screen.getByText('Assign to Speaker')).toBeInTheDocument();
    expect(screen.getByText('Save Curriculum')).toBeInTheDocument();
    expect(screen.getByText('+ Add Session')).toBeInTheDocument();
  });

  test('adds a session and displays it on the roadmap', () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    // Start with empty program, add a session
    const addSessionBtn = screen.getByRole('button', { name: /\+ Add Session/i });
    fireEvent.click(addSessionBtn);

    // After adding a session, canvas elements should appear
    expect(screen.getByText('TAKE-HOME DISPATCH (VOICE VAULT PROMPT)')).toBeInTheDocument();
  });

  test('allows adding session objectives on the canvas after creating a session', () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    // Add a session first
    const addSessionBtn = screen.getByRole('button', { name: /\+ Add Session/i });
    fireEvent.click(addSessionBtn);

    const input = screen.getByPlaceholderText(/\+ Add specific learning outcome/i);
    fireEvent.change(input, { target: { value: 'Master eye contact during executive pauses' } });

    const addBtn = screen.getByRole('button', { name: '+ Add' });
    fireEvent.click(addBtn);

    expect(screen.getByText('Master eye contact during executive pauses')).toBeInTheDocument();
  });

  test('opens drill picker modal when clicking Add Drill on a session', () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    // Add a session first
    const addSessionBtn = screen.getByRole('button', { name: /\+ Add Session/i });
    fireEvent.click(addSessionBtn);

    const addDrillBtn = screen.getByRole('button', { name: /\+ Add Drill/i });
    fireEvent.click(addDrillBtn);

    expect(screen.getByPlaceholderText(/Search speech drills by keyword/i)).toBeInTheDocument();
  });

  test('opens assign to speaker modal and displays client list', () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    const assignBtn = screen.getByRole('button', { name: /Assign to Speaker/i });
    fireEvent.click(assignBtn);

    expect(screen.getByRole('heading', { name: 'Assign to Speaker' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm Enrollment/i })).toBeInTheDocument();
  });

  test('opens settings modal to configure weeks, sessions per week, and tier', () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    const settingsBtn = screen.getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsBtn);

    expect(screen.getByText('Curriculum Settings')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Done/i })).toBeInTheDocument();
  });
});
