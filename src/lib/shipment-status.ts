import type { StatusPillType } from '@/components/ui';
import type { ShipmentStatus } from '@/types/api';

const STATUS_META: Record<ShipmentStatus, { label: string; pill: StatusPillType }> = {
  draft: { label: 'Draft', pill: 'navy' },
  bidding_open: { label: 'Bidding open', pill: 'info' },
  transporter_selected: { label: 'Transporter selected', pill: 'info' },
  vehicle_assigned: { label: 'Vehicle assigned', pill: 'info' },
  driver_assigned: { label: 'Driver assigned', pill: 'info' },
  pickup_in_progress: { label: 'Pickup in progress', pill: 'warning' },
  loaded: { label: 'Loaded', pill: 'warning' },
  dispatched: { label: 'Dispatched', pill: 'warning' },
  in_transit: { label: 'In transit', pill: 'warning' },
  arrived_at_destination: { label: 'Arrived', pill: 'warning' },
  delivered: { label: 'Delivered', pill: 'success' },
  completed: { label: 'Completed', pill: 'success' },
  cancelled: { label: 'Cancelled', pill: 'danger' },
};

export function shipmentStatusMeta(status: ShipmentStatus) {
  return STATUS_META[status];
}

/** The next lifecycle action a driver/transporter can take from the given
 * status, or null if none applies (e.g. still waiting on the factory, or
 * already terminal). Mirrors the backend's fixed forward-only state
 * machine (app/modules/shipment/service.py's _NEXT_STATUS map). */
export function nextDriverAction(status: ShipmentStatus): { action: string; label: string } | null {
  switch (status) {
    case 'driver_assigned':
      return { action: 'start-pickup', label: 'Start pickup' };
    case 'pickup_in_progress':
      return { action: 'mark-loaded', label: 'Mark loaded' };
    case 'loaded':
      return { action: 'dispatch', label: 'Dispatch' };
    case 'dispatched':
      return { action: 'mark-in-transit', label: 'Mark in transit' };
    case 'in_transit':
      return { action: 'mark-arrived', label: 'Mark arrived' };
    case 'arrived_at_destination':
      return { action: 'mark-delivered', label: 'Mark delivered' };
    default:
      return null;
  }
}
