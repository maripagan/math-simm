import { ClientToHostEvent, HostToClientEvent } from './roomWire';

export type {
  ClientToHostEvent,
  HostToClientEvent,
  LeaderboardEntry,
} from './roomWire';

export type TransportKind = 'local' | 'supabase';

export interface RoomTransport {
  readonly kind: TransportKind;
  connect(roomCode: string, role: 'host' | 'student'): Promise<void>;
  disconnect(): Promise<void>;
  sendHostEvent(event: HostToClientEvent): void;
  sendClientEvent(event: ClientToHostEvent): void;
  onHostEvent(handler: (event: HostToClientEvent) => void): () => void;
  onClientEvent(handler: (event: ClientToHostEvent) => void): () => void;
}
