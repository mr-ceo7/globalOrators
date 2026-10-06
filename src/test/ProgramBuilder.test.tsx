import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../context/AppContext';
import { ProgramBuilder } from '../components/programs/ProgramBuilder';
import { programsApi, exercisesApi } from '../services/apiClient';

vi.mock('../services/apiClient', () => ({
  clearAuthSession: vi.fn(),
  authApi: { me: vi.fn().mockResolvedValue({ email: 'coach@globalorators.com' }) },
  clientsApi: { list: vi.fn().mockResolvedValue([]), getAll: vi.fn().mockResolvedValue([]) },
  exercisesApi: {
    list: vi.fn().mockResolvedValue([]),
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation((ex) => Promise.resolve({ ...ex, id: 'ex-real-1' }))
  },
  programsApi: { 
    list: vi.fn().mockResolvedValue([]), 
    getAll: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockImplementation((p) => Promise.resolve(p)),
    delete: vi.fn().mockResolvedValue(true),
    assign: vi.fn().mockResolvedValue(true),
    importFromFiles: vi.fn()
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
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
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

  test('creates a new blank curriculum, persists it, and updates the active canvas', async () => {
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    // Open curriculum switcher dropdown
    const dropdownTrigger = screen.getByText('CURRICULUM').closest('button');
    expect(dropdownTrigger).toBeTruthy();
    fireEvent.click(dropdownTrigger!);

    expect(screen.getByText('SWITCH CURRICULUM')).toBeInTheDocument();

    // Click "+ New Blank Curriculum" button
    const newBlankBtn = screen.getByRole('button', { name: /New Blank Curriculum/i });
    expect(newBlankBtn).toBeInTheDocument();
    fireEvent.click(newBlankBtn);

    // Canvas should reflect the new masterclass title
    expect(await screen.findByText(/New Speech & Debate Masterclass/i)).toBeInTheDocument();
  });

  test('imports a file into an unsaved draft and adds new drills to the library on save', async () => {
    const draft = {
      program: {
        id: 'prog-imported', title: 'Debate Foundations From Syllabus', subtitle: '', description: 'Imported',
        difficulty: 'Beginner', goal: 'Competitive Debate', durationWeeks: 2, daysPerWeek: 1, tags: [],
        assignedClientCount: 0, createdAt: '', updatedAt: '',
        days: [{
          id: 's1', dayNumber: 1, name: 'Session 1: Opening Hooks', focus: 'Hooks', estimatedDurationMin: 90,
          objectives: ['Open with a story'],
          exercises: [{
            id: 'd1', exerciseId: 'pending-1', exerciseName: 'Mirror Rebuttal', primaryMuscle: 'Rebuttal & Refutation',
            equipment: 'Debate Flow Sheet', coachNotes: '', sets: [{ id: 't1', setNumber: 1, targetReps: '3:00 min' }]
          }]
        }]
      },
      newDrills: [{
        tempId: 'pending-1', name: 'Mirror Rebuttal', primaryMuscle: 'Rebuttal & Refutation', secondaryMuscles: [],
        equipment: 'Debate Flow Sheet', difficulty: 'Intermediate', category: 'Debate Tactics', description: '',
        instructions: [], formCues: [], thumbnailUrl: '', isCustom: true
      }],
      sources: [{ name: 'syllabus.docx', readBy: 'server', characters: 100 }],
      builtBy: 'gemini'
    };
    (programsApi.importFromFiles as any).mockResolvedValue(draft);

    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Import from File/i }));
    const buildBtn = screen.getByRole('button', { name: /Build Draft/i });
    expect(buildBtn).toBeDisabled();

    const file = new File(['Week 1: Opening hooks'], 'syllabus.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    fireEvent.change(screen.getByTestId('import-file-input'), { target: { files: [file] } });
    expect(screen.getByText('syllabus.docx')).toBeInTheDocument();
    fireEvent.click(buildBtn);

    await waitFor(() => expect(screen.getByText('Unsaved draft')).toBeInTheDocument());
    expect(programsApi.importFromFiles).toHaveBeenCalledWith([file]);
    expect(screen.getByText('Debate Foundations From Syllabus')).toBeInTheDocument();
    expect(programsApi.save).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Save Curriculum/i }));
    await waitFor(() => expect(programsApi.save).toHaveBeenCalled());
    const created = (exercisesApi.create as any).mock.calls[0][0];
    expect(created.name).toBe('Mirror Rebuttal');
    expect(created).not.toHaveProperty('tempId');
    const saved = (programsApi.save as any).mock.calls.at(-1)[0];
    expect(saved.days[0].exercises[0].exerciseId).toBe('ex-real-1');
    await waitFor(() => expect(screen.queryByText('Unsaved draft')).not.toBeInTheDocument());
  });

  test('shows the server error when the import fails', async () => {
    (programsApi.importFromFiles as any).mockRejectedValue(new Error('The AI is busy right now. Try again in a minute.'));
    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: /Import from File/i }));
    fireEvent.change(screen.getByTestId('import-file-input'), { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } });
    fireEvent.click(screen.getByRole('button', { name: /Build Draft/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('The AI is busy right now');
  });

  test('reuses a library drill with the same name instead of adding a duplicate on save', async () => {
    localStorage.setItem('globalorators_token', 'test-token');
    const existing = {
      id: 'ex-lib-9', name: 'mirror rebuttal', primaryMuscle: 'Rebuttal & Refutation', secondaryMuscles: [],
      equipment: 'Debate Flow Sheet', difficulty: 'Intermediate', category: 'Debate Tactics', description: '',
      instructions: [], formCues: [], thumbnailUrl: ''
    };
    (exercisesApi.getAll as any).mockResolvedValue([existing]);
    (exercisesApi as any).list.mockResolvedValue([existing]);
    (programsApi.importFromFiles as any).mockResolvedValue({
      program: {
        id: 'prog-dup', title: 'Dup Check', subtitle: '', description: '', difficulty: 'Beginner', goal: 'Competitive Debate',
        durationWeeks: 1, daysPerWeek: 1, tags: [], assignedClientCount: 0, createdAt: '', updatedAt: '',
        days: [{ id: 's1', dayNumber: 1, name: 'Session 1: X', focus: '', estimatedDurationMin: 60, objectives: [],
          exercises: [{ id: 'd1', exerciseId: 'pending-1', exerciseName: 'Mirror Rebuttal', primaryMuscle: 'Rebuttal & Refutation',
            equipment: 'Debate Flow Sheet', sets: [{ id: 't1', setNumber: 1, targetReps: '3:00 min' }] }] }]
      },
      newDrills: [{ ...existing, name: 'Mirror Rebuttal', tempId: 'pending-1', isCustom: true }],
      sources: [{ name: 'a.docx', readBy: 'server', characters: 10 }],
      builtBy: 'gemini'
    });

    render(
      <AppProvider>
        <ProgramBuilder />
      </AppProvider>
    );
    await waitFor(() => expect(exercisesApi.getAll).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /Import from File/i }));
    fireEvent.change(screen.getByTestId('import-file-input'), { target: { files: [new File(['x'], 'a.docx')] } });
    fireEvent.click(screen.getByRole('button', { name: /Build Draft/i }));
    await waitFor(() => expect(screen.getByText('Unsaved draft')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Save Curriculum/i }));
    await waitFor(() => expect(programsApi.save).toHaveBeenCalled());
    expect(exercisesApi.create).not.toHaveBeenCalled();
    expect((programsApi.save as any).mock.calls.at(-1)[0].days[0].exercises[0].exerciseId).toBe('ex-lib-9');
    (exercisesApi.getAll as any).mockResolvedValue([]);
    (exercisesApi as any).list.mockResolvedValue([]);
  });
});
