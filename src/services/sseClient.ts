/**
 * Global Orators Server-Sent Events (SSE) Client
 * Provides persistent HTTP event streaming for real-time messages,
 * roster allocation changes, and notifications with automatic reconnection.
 */

import { API_BASE_URL } from './apiClient';
import { ChatMessage, ActivityFeedItem } from '../types';

export interface SSEOptions {
  token: string;
  onConnected?: (data: { status: string; userId: string; role: string }) => void;
  onNewMessage?: (message: ChatMessage) => void;
  onMessagesRead?: (data: { clientId: string; readerRole?: string }) => void;
  onMessageReaction?: (data: { messageId: string; clientId: string; reactions: any[] }) => void;
  onMessageDeleted?: (data: { messageId: string; clientId: string }) => void;
  onPresence?: (data: { userId: string; clientId?: string; role?: string; status: 'online' | 'offline' }) => void;
  onClientUpdated?: (data: { action: string; clientId: string; status?: string; coachId?: string; name?: string }) => void;
  onRosterUpdated?: (data: { action: string; clientId?: string; coachId?: string; coachName?: string; name?: string; status?: string }) => void;
  onActivity?: (activity: ActivityFeedItem) => void;
  onError?: (err: Event) => void;
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectTimeout: any = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 15000;
  private isExplicitlyClosed = false;

  constructor(private options: SSEOptions) {}

  public connect(): void {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return;
    }

    if (!this.options.token) {
      return;
    }

    this.isExplicitlyClosed = false;
    this.cleanup();

    const streamUrl = `${API_BASE_URL}/events/stream?token=${encodeURIComponent(this.options.token)}`;

    try {
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.addEventListener('connected', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          this.reconnectAttempts = 0;
          this.options.onConnected?.(payload);
        } catch {
          // Ignore JSON parse errors
        }
      });

      this.eventSource.addEventListener('new_message', (e: MessageEvent) => {
        try {
          const message: ChatMessage = JSON.parse(e.data);
          this.options.onNewMessage?.(message);
        } catch (err) {
          console.warn('[SSE] Failed to parse new_message:', err);
        }
      });

      this.eventSource.addEventListener('messages_read', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.options.onMessagesRead?.(data);
        } catch (err) {
          console.warn('[SSE] Failed to parse messages_read:', err);
        }
      });

      this.eventSource.addEventListener('message_reaction', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.options.onMessageReaction?.(data);
        } catch (err) {
          console.warn('[SSE] Failed to parse message_reaction:', err);
        }
      });

      this.eventSource.addEventListener('message_deleted', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.options.onMessageDeleted?.(data);
        } catch (err) {
          console.warn('[SSE] Failed to parse message_deleted:', err);
        }
      });

      this.eventSource.addEventListener('presence', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.options.onPresence?.(data);
        } catch (err) {
          console.warn('[SSE] Failed to parse presence:', err);
        }
      });

      this.eventSource.addEventListener('client_updated', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.options.onClientUpdated?.(data);
        } catch (err) {
          console.warn('[SSE] Failed to parse client_updated:', err);
        }
      });

      this.eventSource.addEventListener('roster_updated', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.options.onRosterUpdated?.(data);
        } catch (err) {
          console.warn('[SSE] Failed to parse roster_updated:', err);
        }
      });

      this.eventSource.addEventListener('activity_update', (e: MessageEvent) => {
        try {
          const activity: ActivityFeedItem = JSON.parse(e.data);
          this.options.onActivity?.(activity);
        } catch (err) {
          console.warn('[SSE] Failed to parse activity_update:', err);
        }
      });

      this.eventSource.onerror = (e: Event) => {
        this.options.onError?.(e);
        this.cleanup();

        if (!this.isExplicitlyClosed) {
          // Exponential backoff reconnect
          const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
          this.reconnectAttempts++;
          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, delay);
        }
      };
    } catch (err) {
      console.warn('[SSE] Failed to initialize EventSource:', err);
    }
  }

  public close(): void {
    this.isExplicitlyClosed = true;
    this.cleanup();
  }

  private cleanup(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

/**
 * Convenience helper to start an SSE stream connection
 */
export const startEventStream = (options: SSEOptions): (() => void) => {
  const client = new SSEClient(options);
  client.connect();
  return () => client.close();
};
