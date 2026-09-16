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

