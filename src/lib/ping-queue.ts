import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { trackingService, type TrackingPingInput } from '@/services/tracking';

const STORAGE_KEY = 'newturn-pending-pings';
const MAX_QUEUED = 500; // ~4h of pings at one every 30s — a hard cap, not a real limit in practice

let flushing = false;

async function readQueue(): Promise<TrackingPingInput[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as TrackingPingInput[]) : [];
}

async function writeQueue(queue: TrackingPingInput[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

/** Submits a ping; if the request fails (offline, timeout, 5xx), it's
 * persisted to a local queue instead of dropped, so a driver going through
 * a dead zone doesn't silently lose their tracking history. Flushed by
 * flushPingQueue() on reconnect. */
export async function submitPingOrQueue(ping: TrackingPingInput): Promise<void> {
  try {
    await trackingService.submitPing(ping);
  } catch {
    const queue = await readQueue();
    queue.push(ping);
    await writeQueue(queue.slice(-MAX_QUEUED));
  }
}

/** Drains the queue oldest-first, stopping at the first failure so pings
 * stay in order and nothing is dropped if connectivity drops again
 * mid-flush. Safe to call repeatedly/concurrently — a flush already in
 * progress is a no-op. */
export async function flushPingQueue(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    let queue = await readQueue();
    while (queue.length > 0) {
      const [next, ...rest] = queue;
      try {
        await trackingService.submitPing(next);
        queue = rest;
        await writeQueue(queue);
      } catch {
        break;
      }
    }
  } finally {
    flushing = false;
  }
}

/** Call once near app start (see (app)/_layout.tsx) — flushes immediately
 * and again every time the device regains connectivity. */
export function startPingQueueFlusher(): () => void {
  flushPingQueue().catch(() => undefined);

  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      flushPingQueue().catch(() => undefined);
    }
  });

  return unsubscribe;
}
