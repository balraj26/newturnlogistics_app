import { apiFetch } from '@/lib/api-client';
import type { Eta, TrackingPing, UUID } from '@/types/api';

export interface TrackingPingInput {
  shipment_id: UUID;
  latitude: number;
  longitude: number;
  speed_kmph?: number;
  heading_degrees?: number;
}

/** Ported from New Turn/frontend/services/tracking.ts. */
export const trackingService = {
  submitPing: (data: TrackingPingInput) =>
    apiFetch<TrackingPing>('/api/v1/tracking/pings', { method: 'POST', body: data }),
  history: (shipmentId: UUID) =>
    apiFetch<TrackingPing[]>(`/api/v1/tracking/shipments/${shipmentId}/history`),
  latest: (shipmentId: UUID) =>
    apiFetch<TrackingPing>(`/api/v1/tracking/shipments/${shipmentId}/latest`),
  eta: (shipmentId: UUID) => apiFetch<Eta>(`/api/v1/tracking/shipments/${shipmentId}/eta`),
};
