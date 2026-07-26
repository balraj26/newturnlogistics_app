import { apiFetch } from '@/lib/api-client';
import type {
  Bid,
  LoadingEvent,
  LoadingEventType,
  RejectionReason,
  Shipment,
  ShipmentDetail,
  ShipmentTimelineEvent,
  UnloadingEvent,
  UUID,
} from '@/types/api';

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

/** PATCH /shipments/{id} — only while status=draft. Every field optional. */
export interface ShipmentUpdateInput {
  customer_id?: UUID;
  consignee_id?: UUID;
  material_id?: UUID;
  weight_kg?: number;
  required_date?: string;
  special_instructions?: string;
}

export interface BidInput {
  price: number;
  eta_hours: number;
  notes?: string;
}

export interface LoadingEventInput {
  event_type: LoadingEventType;
  quantity_kg?: number;
  gross_weight_kg?: number;
  tare_weight_kg?: number;
  net_weight_kg?: number;
  seal_number?: string;
  seal_photo_document_id?: UUID;
}

export interface UnloadingReconcileInput {
  quantity_accepted_kg: number;
  quantity_rejected_kg: number;
  rejection_reason_id?: UUID;
}

// Bare (no-body) POST actions. "cancel" is deliberately excluded — it now
// requires a { cancellation_reason } body, see shipmentsService.cancel.
export const LIFECYCLE_ACTIONS = [
  'publish',
  'start-pickup',
  'mark-loaded',
  'dispatch',
  'mark-in-transit',
  'mark-arrived',
  'mark-delivered',
  'complete',
  'revert',
  'archive',
  'unarchive',
  'gate-check-in',
  'gate-check-out',
  'destination-gate-check-in',
  'gate-verify-vehicle',
  'gate-verify-driver',
  'gate-verify-documents',
] as const;

export type LifecycleAction = (typeof LIFECYCLE_ACTIONS)[number];

/** Ported from New Turn/frontend/services/shipments.ts. */
export const shipmentsService = {
  list: (includeArchived = false) =>
    apiFetch<Shipment[]>(
      `/api/v1/shipments${includeArchived ? '?include_archived=true' : ''}`
    ),
  get: (id: UUID) => apiFetch<ShipmentDetail>(`/api/v1/shipments/${id}`),
  create: (data: ShipmentInput) =>
    apiFetch<Shipment>('/api/v1/shipments', { method: 'POST', body: data }),
  update: (id: UUID, data: ShipmentUpdateInput) =>
    apiFetch<Shipment>(`/api/v1/shipments/${id}`, { method: 'PATCH', body: data }),
  timeline: (id: UUID) => apiFetch<ShipmentTimelineEvent[]>(`/api/v1/shipments/${id}/timeline`),

  listBids: (shipmentId: UUID) => apiFetch<Bid[]>(`/api/v1/shipments/${shipmentId}/bids`),
  submitBid: (shipmentId: UUID, data: BidInput) =>
    apiFetch<Bid>(`/api/v1/shipments/${shipmentId}/bids`, { method: 'POST', body: data }),
  acceptBid: (shipmentId: UUID, bidId: UUID) =>
    apiFetch<Shipment>(`/api/v1/shipments/${shipmentId}/bids/${bidId}/accept`, {
      method: 'POST',
    }),
  withdrawBid: (shipmentId: UUID, bidId: UUID) =>
    apiFetch<Bid>(`/api/v1/shipments/${shipmentId}/bids/${bidId}/withdraw`, {
      method: 'POST',
    }),
  rejectBid: (shipmentId: UUID, bidId: UUID) =>
    apiFetch<Bid>(`/api/v1/shipments/${shipmentId}/bids/${bidId}/reject`, {
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

  /** cancellation_reason is mandatory — see docs/shipment-specification.md §9. */
  cancel: (shipmentId: UUID, cancellationReason: string) =>
    apiFetch<Shipment>(`/api/v1/shipments/${shipmentId}/cancel`, {
      method: 'POST',
      body: { cancellation_reason: cancellationReason },
    }),

  runAction: (shipmentId: UUID, action: LifecycleAction) =>
    apiFetch<Shipment>(`/api/v1/shipments/${shipmentId}/${action}`, { method: 'POST' }),

  listLoadingEvents: (shipmentId: UUID) =>
    apiFetch<LoadingEvent[]>(`/api/v1/shipments/${shipmentId}/loading-events`),
  recordLoadingEvent: (shipmentId: UUID, data: LoadingEventInput) =>
    apiFetch<LoadingEvent>(`/api/v1/shipments/${shipmentId}/loading-events`, {
      method: 'POST',
      body: data,
    }),

  getUnloadingEvent: (shipmentId: UUID) =>
    apiFetch<UnloadingEvent>(`/api/v1/shipments/${shipmentId}/unloading-events`),
  reconcileUnloading: (shipmentId: UUID, data: UnloadingReconcileInput) =>
    apiFetch<UnloadingEvent>(`/api/v1/shipments/${shipmentId}/unloading-events/reconcile`, {
      method: 'POST',
      body: data,
    }),

  listRejectionReasons: () =>
    apiFetch<RejectionReason[]>('/api/v1/shipments/rejection-reasons'),
};
