import { decodeClientEvent, decodeHostEvent } from './roomWire';
import {
  ClientToHostEvent,
  HostToClientEvent,
  RoomTransport,
} from './types';

interface Envelope {
  direction: 'host_to_client' | 'client_to_host';
  payload: HostToClientEvent | ClientToHostEvent;
}

const STORAGE_STATE_PREFIX = 'mathsim:classroom:state:';
const STORAGE_MSG_PREFIX = 'mathsim:classroom:msg:';

/**
 * Transporte zero-config baseado em BroadcastChannel + fallback localStorage.
 * Permite testar Host (/host) e múltiplos Alunos (/play) em abas/janelas diferentes
 * do mesmo navegador sem precisar de servidor externo.
 */
export class LocalBroadcastTransport implements RoomTransport {
  readonly kind = 'local' as const;

  private roomCode = '';
  private channel: BroadcastChannel | null = null;
  private hostHandlers = new Set<(event: HostToClientEvent) => void>();
  private clientHandlers = new Set<(event: ClientToHostEvent) => void>();
  private storageListener: ((e: StorageEvent) => void) | null = null;

  async connect(roomCode: string, role: 'host' | 'student'): Promise<void> {
    this.roomCode = roomCode.trim().toUpperCase();
    const channelName = `mathsim-classroom-${this.roomCode}`;

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(channelName);
      this.channel.onmessage = (msg: MessageEvent<unknown>) => {
        this.dispatchEnvelope(msg.data);
      };
    }

    // Fallback via storage event (para navegadores ou janelas sem BroadcastChannel)
    this.storageListener = (e: StorageEvent) => {
      if (e.key !== `${STORAGE_MSG_PREFIX}${this.roomCode}` || !e.newValue) {
        return;
      }
      try {
        this.dispatchEnvelope(JSON.parse(e.newValue));
      } catch {
        // Ignora mensagens malformadas
      }
    };
    window.addEventListener('storage', this.storageListener);

    // Se for aluno entrando agora, entrega imediatamente o último snapshot salvo
    if (role === 'student') {
      try {
        const cached = localStorage.getItem(
          `${STORAGE_STATE_PREFIX}${this.roomCode}`,
        );
        if (cached) {
          const event = decodeHostEvent(JSON.parse(cached));
          if (event?.type === 'room:state') {
            this.hostHandlers.forEach((fn) => fn(event));
          }
        }
      } catch {
        // Ignora erro de leitura
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
    this.hostHandlers.clear();
    this.clientHandlers.clear();
  }

  sendHostEvent(event: HostToClientEvent): void {
    if (event.type === 'room:state' && this.roomCode) {
      try {
        localStorage.setItem(
          `${STORAGE_STATE_PREFIX}${this.roomCode}`,
          JSON.stringify(event),
        );
      } catch {
        // Quota cheia ou modo privado
      }
    }
    if (event.type === 'room:closed' && this.roomCode) {
      try {
        localStorage.removeItem(`${STORAGE_STATE_PREFIX}${this.roomCode}`);
      } catch {
        // Ignora
      }
    }
    this.emitEnvelope({
      direction: 'host_to_client',
      payload: event,
    });
  }

  sendClientEvent(event: ClientToHostEvent): void {
    this.emitEnvelope({
      direction: 'client_to_host',
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

  private emitEnvelope(envelope: Envelope): void {
    if (this.channel) {
      this.channel.postMessage(envelope);
    } else if (this.roomCode) {
      try {
        localStorage.setItem(
          `${STORAGE_MSG_PREFIX}${this.roomCode}`,
          JSON.stringify(envelope),
        );
      } catch {
        // Ignora
      }
    }
  }

  private dispatchEnvelope(raw: unknown): void {
    if (typeof raw !== 'object' || raw === null) return;
    const { direction, payload } = raw as Partial<Envelope>;
    if (direction === 'host_to_client') {
      const evt = decodeHostEvent(payload);
      if (evt) this.hostHandlers.forEach((fn) => fn(evt));
    } else if (direction === 'client_to_host') {
      const evt = decodeClientEvent(payload);
      if (evt) this.clientHandlers.forEach((fn) => fn(evt));
    }
  }
}
