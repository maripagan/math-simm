import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import {
  ClientToHostEvent,
  HostToClientEvent,
  RoomTransport,
} from './types';

/**
 * Transporte em tempo real via Supabase Realtime Broadcast.
 * Requer VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env para conectar
 * celulares reais na rede da escola sem necessidade de login inicial.
 */
export class SupabaseRealtimeTransport implements RoomTransport {
  readonly kind = 'supabase' as const;

  private client: SupabaseClient;
  private channel: RealtimeChannel | null = null;
  private hostHandlers = new Set<(event: HostToClientEvent) => void>();
  private clientHandlers = new Set<(event: ClientToHostEvent) => void>();

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
    });
  }

  async connect(roomCode: string, _role: 'host' | 'student'): Promise<void> {
    const normalized = roomCode.trim().toUpperCase();
    const channel = this.client.channel(`classroom:${normalized}`, {
      config: {
        broadcast: { self: false },
      },
    });

    channel
      .on('broadcast', { event: 'host_event' }, ({ payload }) => {
        const evt = payload as HostToClientEvent;
        this.hostHandlers.forEach((fn) => fn(evt));
      })
      .on('broadcast', { event: 'client_event' }, ({ payload }) => {
        const evt = payload as ClientToHostEvent;
        this.clientHandlers.forEach((fn) => fn(evt));
      });

    await new Promise<void>((resolve, reject) => {
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          resolve();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          reject(new Error(`Falha ao conectar no canal Supabase (${status})`));
        }
      });
    });

    this.channel = channel;
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.client.removeChannel(this.channel);
      this.channel = null;
    }
    this.hostHandlers.clear();
    this.clientHandlers.clear();
  }

  sendHostEvent(event: HostToClientEvent): void {
    if (!this.channel) return;
    void this.channel.send({
      type: 'broadcast',
      event: 'host_event',
      payload: event,
    });
  }

  sendClientEvent(event: ClientToHostEvent): void {
    if (!this.channel) return;
    void this.channel.send({
      type: 'broadcast',
      event: 'client_event',
      payload: event,
    });
  }

  onHostEvent(handler: (event: HostToClientEvent) => void): () => void {
    this.hostHandlers.add(handler);
    return () => {
      this.hostHandlers.delete(handler);
    };
  }

  onClientEvent(handler: (event: ClientToHostEvent) => void): () => void {
    this.clientHandlers.add(handler);
    return () => {
      this.clientHandlers.delete(handler);
    };
  }
}
