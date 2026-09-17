import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { SSEClient, startEventStream } from '../services/sseClient';
import { ChatMessage } from '../types';

describe('SSEClient Real-Time Event Streaming', () => {
  let mockEventSourceInstances: any[] = [];

  class MockEventSource {
    url: string;
    listeners: { [event: string]: ((e: any) => void)[] } = {};
    onerror: ((e: any) => void) | null = null;
    closed = false;

    constructor(url: string) {
      this.url = url;
      mockEventSourceInstances.push(this);
    }

    addEventListener(event: string, cb: (e: any) => void) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(cb);
    }

    removeEventListener(event: string, cb: (e: any) => void) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(l => l !== cb);
      }
    }

    close() {
      this.closed = true;
    }

    simulateEvent(event: string, data: any) {
      const payload = { data: JSON.stringify(data) };
      (this.listeners[event] || []).forEach(cb => cb(payload));
    }
  }

  beforeEach(() => {
    mockEventSourceInstances = [];
    (global as any).EventSource = MockEventSource as any;
  });

  afterEach(() => {
    delete (global as any).EventSource;
  });

  test('connects to /events/stream with encoded authentication token', () => {
    const client = new SSEClient({
      token: 'jwt-mock-token-123',
    });

    client.connect();

    expect(mockEventSourceInstances.length).toBe(1);
    expect(mockEventSourceInstances[0].url).toContain('/api/events/stream?token=jwt-mock-token-123');
  });

  test('dispatches incoming new_message event to onNewMessage callback', () => {
    const onNewMessage = vi.fn();
    const client = new SSEClient({
      token: 'jwt-mock-token-123',
      onNewMessage
    });

    client.connect();

    const instance = mockEventSourceInstances[0];
    const incomingMessage: ChatMessage = {
      id: 'msg-test-1',
      clientId: 'client-1',
      sender: 'coach',
      text: 'Vocal projection was outstanding today!',
      timestamp: '12:00 PM',
      isRead: true
    };

    instance.simulateEvent('new_message', incomingMessage);

    expect(onNewMessage).toHaveBeenCalledWith(incomingMessage);
  });

  test('dispatches roster_updated and client_updated events', () => {
    const onRosterUpdated = vi.fn();
    const onClientUpdated = vi.fn();

    const client = new SSEClient({
      token: 'jwt-mock-token-123',
      onRosterUpdated,
      onClientUpdated
    });

    client.connect();

    const instance = mockEventSourceInstances[0];
    instance.simulateEvent('roster_updated', { action: 'reassigned', clientId: 'client-1' });
    expect(onRosterUpdated).toHaveBeenCalledWith({ action: 'reassigned', clientId: 'client-1' });

    instance.simulateEvent('client_updated', { action: 'updated', clientId: 'client-1', status: 'Active' });
    expect(onClientUpdated).toHaveBeenCalledWith({ action: 'updated', clientId: 'client-1', status: 'Active' });
  });

  test('close() terminates EventSource connection and stops reconnecting', () => {
    const client = new SSEClient({
      token: 'jwt-mock-token-123'
    });

    client.connect();
    const instance = mockEventSourceInstances[0];
    expect(instance.closed).toBe(false);

    client.close();
    expect(instance.closed).toBe(true);
  });

  test('startEventStream helper returns cleanup function', () => {
    const disconnect = startEventStream({
      token: 'jwt-mock-token-123'
    });

    expect(mockEventSourceInstances.length).toBe(1);
    const instance = mockEventSourceInstances[0];
    expect(instance.closed).toBe(false);

    disconnect();
    expect(instance.closed).toBe(true);
  });
});
