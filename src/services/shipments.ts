import { apiFetch } from '@/lib/api-client';
import type { Bid, Shipment, ShipmentDetail, ShipmentTimelineEvent, UUID } from '@/types/api';

export interface NewAddressInput {
  name: string;
  address?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

export interface ShipmentInput {
  customer_id: UUID;
  consignee_id?: UUID;
  origin_location_id?: UUID;
  origin_new_address?: NewAddressInput;
  destination_location_id?: UUID;
  destination_new_address?: NewAddressInput;
  material_id?: UUID;
  weight_kg: number;
  required_date: string;
  special_instructions?: string;
}

export interface BidInput {
  price: number;
  eta_hours: number;
  notes?: string;
}

export const LIFECYCLE_ACTIONS = [
  'publish',
  'start-pickup',
  'mark-loaded',
  'dispatch',
  'mark-in-transit',
  'mark-arrived',
  'mark-delivered',
  'complete',
  'cancel',
  'gate-check-in',
  'gate-check-out',
] as const;

export type LifecycleAction = (typeof LIFECYCLE_ACTIONS)[number];

/** Ported from New Turn/frontend/services/shipments.ts. */
export const shipmentsService = {
  list: () => apiFetch<Shipment[]>('/api/v1/shipments'),
  get: (id: UUID) => apiFetch<ShipmentDetail>(`/api/v1/shipments/${id}`),
  create: (data: ShipmentInput) =>
    apiFetch<Shipment>('/api/v1/shipments', { method: 'POST', body: data }),
  timeline: (id: UUID) => apiFetch<ShipmentTimelineEvent[]>(`/api/v1/shipments/${id}/timeline`),

  listBids: (shipmentId: UUID) => apiFetch<Bid[]>(`/api/v1/shipments/${shipmentId}/bids`),
  submitBid: (shipmentId: UUID, data: BidInput) =>
    apiFetch<Bid>(`/api/v1/shipments/${shipmentId}/bids`, { method: 'POST', body: data }),
  acceptBid: (shipmentId: UUID, bidId: UUID) =>
    apiFetch<Shipment>(`/api/v1/shipments/${shipmentId}/bids/${bidId}/accept`, {
      method: 'POST',
    }),

  assignVehicle: (shipmentId: UUID, vehicleId: UUID) =>
    apiFetch<Shipment>(`/api/v1/shipments/${shipmentId}/assign-vehicle`, {
      method: 'POST',
      body: { vehicle_id: vehicleId },
    }),
  assignDriver: (shipmentId: UUID, driverId: UUID) =>
    apiFetch<Shipment>(`/api/v1/shipments/${shipmentId}/assign-driver`, {
      method: 'POST',
      body: { driver_id: driverId },
    }),

  runAction: (shipmentId: UUID, action: LifecycleAction) =>
    apiFetch<Shipment>(`/api/v1/shipments/${shipmentId}/${action}`, { method: 'POST' }),
};
