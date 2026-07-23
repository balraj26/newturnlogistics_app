import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

import { submitPingOrQueue } from '@/lib/ping-queue';

const PING_INTERVAL_MS = 30_000;
const PING_DISTANCE_METERS = 50;

/** Foreground GPS sharing for the driver actively on a shipment — submits
 * a tracking ping roughly every 30s or 50m of movement while enabled and
 * the app is open (POST /tracking/pings).
 *
 * Deliberately foreground-only for now: true background tracking needs
 * Location.startLocationUpdatesAsync + a TaskManager-registered task,
 * which requires a custom dev-client/production build (it does not run
 * in Expo Go on iOS since SDK 43) — a real next step once you're building
 * with EAS rather than Expo Go, not something this foreground watcher can
 * paper over.
 */
export function useShipmentLocationSharing(shipmentId: string | undefined) {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!enabled || !shipmentId) {
      subscription.current?.remove();
      subscription.current = null;
      return;
    }

    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) {
          setError('Location permission is required to share live tracking.');
          setEnabled(false);
        }
        return;
      }

      subscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: PING_INTERVAL_MS,
          distanceInterval: PING_DISTANCE_METERS,
        },
        (location) => {
          submitPingOrQueue({
            shipment_id: shipmentId,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            speed_kmph: location.coords.speed != null ? Math.max(0, location.coords.speed * 3.6) : undefined,
            heading_degrees: location.coords.heading ?? undefined,
          }).catch(() => undefined);
        },
      );
    })();

    return () => {
      cancelled = true;
      subscription.current?.remove();
      subscription.current = null;
    };
  }, [enabled, shipmentId]);

  return { enabled, setEnabled, error };
}
