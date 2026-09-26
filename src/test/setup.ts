import '@testing-library/jest-dom';
import { vi } from 'vitest';

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  class MockIntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    observe = vi.fn((target: Element) => {
      this.callback([{
        isIntersecting: true,
        target,
        intersectionRatio: 1,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now(),
      } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    });
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn().mockReturnValue([]);
    constructor(private callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}

import React from 'react';

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: any) => children,
  GoogleLogin: ({ onSuccess }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'mock-google-login' },
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: () =>
            onSuccess?.({
              credential:
                'mockHeader.eyJzdWIiOiJnb29nbGUtdGVzdC1leGVjLTEyMyIsImVtYWlsIjoiZXhlY3V0aXZlLnNwZWFrZXJAZ2xvYmFsb3JhdG9ycy5vcmciLCJuYW1lIjoiVGVzdCBPcmF0b3IifQ.mockSig',
            }),
        },
        'Sign in with Google',
      ),
    ),
  useGoogleOneTapLogin: vi.fn(),
}));

