import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { AppProvider, useApp } from '../context/AppContext';

vi.mock('../services/apiClient', () => ({
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
}));

const ThemeTesterComponent = () => {
  const { theme, toggleTheme, resetThemeToSystem } = useApp();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>Toggle</button>
      {resetThemeToSystem && (
        <button data-testid="reset-btn" onClick={resetThemeToSystem}>Reset</button>
      )}
    </div>
  );
};

describe('Theme Context Unit Tests', () => {
  let matchMediaListeners: Array<(e: MediaQueryListEvent) => void> = [];
  let prefersDark = false;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    matchMediaListeners = [];
    prefersDark = false;

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      get matches() {
        return query === '(prefers-color-scheme: dark)' ? prefersDark : false;
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, listener: any) => {
        if (event === 'change') matchMediaListeners.push(listener);
      }),
      removeEventListener: vi.fn((event: string, listener: any) => {
        if (event === 'change') {
          matchMediaListeners = matchMediaListeners.filter(l => l !== listener);
        }
      }),
      dispatchEvent: vi.fn(),
    }));
  });

  test('should default to system light mode when no saved preference exists', async () => {
    prefersDark = false;
    await act(async () => {
      render(
        <AppProvider>
          <ThemeTesterComponent />
        </AppProvider>
      );
    });

    expect(screen.getByTestId('theme-value').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('globalorators_theme')).toBeNull();
  });

  test('should default to system dark mode when prefers-color-scheme is dark and no saved preference exists', async () => {
    prefersDark = true;
    await act(async () => {
      render(
        <AppProvider>
          <ThemeTesterComponent />
        </AppProvider>
      );
    });

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('globalorators_theme')).toBeNull();
  });

  test('should allow user to manually toggle theme and persist choice to localStorage', async () => {
    prefersDark = false;
    await act(async () => {
      render(
        <AppProvider>
          <ThemeTesterComponent />
        </AppProvider>
      );
    });

    const button = screen.getByTestId('toggle-btn');
    act(() => {
      button.click();
    });

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('globalorators_theme')).toBe('dark');
  });

  test('should respect saved user preference even when system preference is different', async () => {
    localStorage.setItem('globalorators_theme', 'dark');
    prefersDark = false; // System is light, but user preference is dark

    await act(async () => {
      render(
        <AppProvider>
          <ThemeTesterComponent />
        </AppProvider>
      );
    });

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('should dynamically update theme when system preference changes and user has not set an override', async () => {
    prefersDark = false;
    await act(async () => {
      render(
        <AppProvider>
          <ThemeTesterComponent />
        </AppProvider>
      );
    });

    expect(screen.getByTestId('theme-value').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Simulate system switching to dark mode
    act(() => {
      prefersDark = true;
      matchMediaListeners.forEach(listener => listener({ matches: true } as MediaQueryListEvent));
    });

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('should NOT change theme on system preference change once user has manually toggled', async () => {
    prefersDark = false;
    await act(async () => {
      render(
        <AppProvider>
          <ThemeTesterComponent />
        </AppProvider>
      );
    });

    // User toggles to dark manually
    const button = screen.getByTestId('toggle-btn');
    act(() => {
      button.click();
    });
    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(localStorage.getItem('globalorators_theme')).toBe('dark');

    // System changes to light, but user preference should remain pinned to dark
    act(() => {
      prefersDark = false;
      matchMediaListeners.forEach(listener => listener({ matches: false } as MediaQueryListEvent));
    });

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('should reset back to system preference when resetThemeToSystem is called', async () => {
    localStorage.setItem('globalorators_theme', 'dark');
    prefersDark = false; // System is light

    await act(async () => {
      render(
        <AppProvider>
          <ThemeTesterComponent />
        </AppProvider>
      );
    });

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');

    const resetBtn = screen.getByTestId('reset-btn');
    act(() => {
      resetBtn.click();
    });

    expect(screen.getByTestId('theme-value').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('globalorators_theme')).toBeNull();
  });

});

