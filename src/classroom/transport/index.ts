import { LocalBroadcastTransport } from './localBroadcastTransport';
import { SupabaseRealtimeTransport } from './supabaseTransport';
import { RoomTransport, TransportKind } from './types';

export function createRoomTransport(
  preferred: 'auto' | TransportKind = 'auto',
): RoomTransport {
  if (preferred === 'local') {
    return new LocalBroadcastTransport();
  }

  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (url && url.trim() && key && key.trim()) {
    return new SupabaseRealtimeTransport(url.trim(), key.trim());
  }

  return new LocalBroadcastTransport();
}

export * from './types';
