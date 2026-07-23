import { apiFetch } from '@/lib/api-client';
import type {
  BusinessPartner,
  Driver,
  Location,
  Material,
  PartnerType,
  Route,
  Trailer,
  UUID,
  Vehicle,
  Warehouse,
} from '@/types/api';

export interface BusinessPartnerInput {
  partner_type: PartnerType;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
}

export interface LocationInput {
  name: string;
  address?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  business_partner_id?: UUID;
}

export interface WarehouseInput {
  name: string;
  location_id: UUID;
}

export interface MaterialInput {
  name: string;
  code: string;
  unit: string;
  hsn_code?: string;
}

export interface RouteInput {
  origin_location_id: UUID;
  destination_location_id: UUID;
  distance_km?: number;
}

export interface VehicleInput {
  registration_number: string;
  vehicle_type: string;
  capacity_kg: number;
}

export interface TrailerInput {
  registration_number: string;
  trailer_type: string;
  vehicle_id?: UUID;
}

export interface DriverInput {
  full_name: string;
  license_number: string;
  phone: string;
  email?: string;
  password: string;
}

export interface DriverTransferInput {
  new_company_public_code: string;
}

/** Ported from New Turn/frontend/services/master-data.ts. */
export const masterDataService = {
  listBusinessPartners: (partnerType?: PartnerType) =>
    apiFetch<BusinessPartner[]>(
      `/api/v1/master-data/business-partners${partnerType ? `?partner_type=${partnerType}` : ''}`,
    ),
  createBusinessPartner: (data: BusinessPartnerInput) =>
    apiFetch<BusinessPartner>('/api/v1/master-data/business-partners', {
      method: 'POST',
      body: data,
    }),
  deleteBusinessPartner: (partnerId: UUID) =>
    apiFetch<void>(`/api/v1/master-data/business-partners/${partnerId}`, { method: 'DELETE' }),

  listLocations: (businessPartnerId?: UUID) =>
    apiFetch<Location[]>(
      `/api/v1/master-data/locations${
        businessPartnerId ? `?business_partner_id=${businessPartnerId}` : ''
      }`,
    ),
  createLocation: (data: LocationInput) =>
    apiFetch<Location>('/api/v1/master-data/locations', { method: 'POST', body: data }),

  listWarehouses: () => apiFetch<Warehouse[]>('/api/v1/master-data/warehouses'),
  createWarehouse: (data: WarehouseInput) =>
    apiFetch<Warehouse>('/api/v1/master-data/warehouses', { method: 'POST', body: data }),

  listMaterials: () => apiFetch<Material[]>('/api/v1/master-data/materials'),
  createMaterial: (data: MaterialInput) =>
    apiFetch<Material>('/api/v1/master-data/materials', { method: 'POST', body: data }),

  listRoutes: () => apiFetch<Route[]>('/api/v1/master-data/routes'),
  createRoute: (data: RouteInput) =>
    apiFetch<Route>('/api/v1/master-data/routes', { method: 'POST', body: data }),

  listVehicles: () => apiFetch<Vehicle[]>('/api/v1/master-data/vehicles'),
  createVehicle: (data: VehicleInput) =>
    apiFetch<Vehicle>('/api/v1/master-data/vehicles', { method: 'POST', body: data }),

  listTrailers: () => apiFetch<Trailer[]>('/api/v1/master-data/trailers'),
  createTrailer: (data: TrailerInput) =>
    apiFetch<Trailer>('/api/v1/master-data/trailers', { method: 'POST', body: data }),

  listDrivers: () => apiFetch<Driver[]>('/api/v1/master-data/drivers'),
  createDriver: (data: DriverInput) =>
    apiFetch<Driver>('/api/v1/master-data/drivers', { method: 'POST', body: data }),
  transferDriver: (driverId: UUID, data: DriverTransferInput) =>
    apiFetch<Driver>(`/api/v1/master-data/drivers/${driverId}/transfer`, {
      method: 'POST',
      body: data,
    }),
};
