import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, programsApi } from '../services/apiClient';

describe('apiClient exponential retries', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('retries on 502 Bad Gateway and succeeds when server recovers', async () => {
    const formData = new FormData();
    formData.append('test', 'value');

    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount <= 2) {
        return new Response(JSON.stringify({ detail: 'Bad Gateway' }), {
          status: 502,
          statusText: 'Bad Gateway',
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const promise = api.postFormData<{ success: boolean }>('/test-upload', formData);

    // Fast-forward timers for the retries (1s and 2s)
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);

    const result = await promise;
    expect(result).toEqual({ success: true });
    expect(callCount).toBe(3);
  });

  it('fails with clear error message after exhausting retries on continuous 502', async () => {
    const formData = new FormData();

    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return new Response(JSON.stringify({ detail: 'Bad Gateway' }), {
        status: 502,
        statusText: 'Bad Gateway',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const promise = api.postFormData('/test-upload', formData);
    const rejectionPromise = expect(promise).rejects.toThrow(/temporarily unavailable.*502/i);

    // Advance through all 3 backoff intervals (1s + 2s + 4s)
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);
    await vi.advanceTimersByTimeAsync(4000);

    await rejectionPromise;
  });

  it('does not retry client errors such as 400 or 422', async () => {
    const formData = new FormData();

    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      return new Response(JSON.stringify({ detail: 'Unsupported file format' }), {
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const promise = api.postFormData('/test-upload', formData);
    await expect(promise).rejects.toThrow('Unsupported file format');
    expect(callCount).toBe(1);
  });
});
