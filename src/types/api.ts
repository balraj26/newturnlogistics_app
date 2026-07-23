/**
 * DTOs mirroring the backend's Pydantic schemas (backend/app/modules/*\/schemas.py).
 * Ported from New Turn/frontend/types/api/index.ts — same backend, same
 * contracts. Kept hand-in-sync rather than codegen'd, matching that repo's
 * own "avoid unnecessary abstraction" call.
 */

export type UUID = string;

// ---- Auth / Core ---------------------------------------------------------

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/** What POST /auth/register returns instead of tokens — the email must be
 * confirmed via POST /auth/email/verify before any tokens are issued. */
export interface PendingVerificationResponse {
  pending_token: string;
  email: string;
}

/** POST /auth/login either succeeds outright (status "ok") or, for an
 * unverified local account, sends a fresh code and hands back a pending
 * token instead (status "email_verification_required"). */
export interface LoginResponse {
  status: "ok" | "email_verification_required";
  tokens: TokenPair | null;
  pending_token: string | null;
  email: string | null;
}

export type UserType = "owner" | "employee";
export type AuthProvider = "local" | "google";

export interface User {
  id: UUID;
  company_id: UUID;
  phone: string | null;
  email: string;
  email_verified: boolean;
  auth_provider: AuthProvider;
  has_password: boolean;
  full_name: string;
  user_type: UserType;
  is_active: boolean;
  is_platform_admin: boolean;
}

export type CompanyType = "factory_owner" | "transporter";

export interface Company {
  id: UUID;
  organization_id: UUID;
  company_type: CompanyType;
  public_code: string;
  name: string;
  slug: string;
  gstin: string | null;
  is_active: boolean;
  is_onboarded: boolean;
}

export interface Branch {
  id: UUID;
  company_id: UUID;
  name: string;
  code: string;
  address: string | null;
  is_active: boolean;
}

export interface Role {
  id: UUID;
  company_id: UUID;
  name: string;
  description: string | null;
  is_default: boolean;
  permission_codes: string[];
}

// ---- Master data ----------------------------------------------------------

export type PartnerType = "customer" | "consignee" | "vendor";

export interface BusinessPartner {
  id: UUID;
  company_id: UUID;
  partner_type: PartnerType;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstin: string | null;
  is_active: boolean;
}

export interface Location {
  id: UUID;
  company_id: UUID;
  name: string;
  address: string | null;
  city: string;
  district: string | null;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  /** null = the company's own address; set = that customer's (BusinessPartner) address. */
  business_partner_id: UUID | null;
}

export interface Warehouse {
  id: UUID;
  company_id: UUID;
  name: string;
  location_id: UUID;
  is_active: boolean;
}

export interface Material {
  id: UUID;
  company_id: UUID;
  name: string;
  code: string;
  unit: string;
  hsn_code: string | null;
}

export interface Route {
  id: UUID;
  company_id: UUID;
  origin_location_id: UUID;
  destination_location_id: UUID;
  distance_km: number | null;
}

export interface Vehicle {
  id: UUID;
  company_id: UUID;
  registration_number: string;
  vehicle_type: string;
  capacity_kg: number;
  is_active: boolean;
}

export interface Trailer {
  id: UUID;
  company_id: UUID;
  registration_number: string;
  trailer_type: string;
  vehicle_id: UUID | null;
}

export interface Driver {
  id: UUID;
  company_id: UUID;
  full_name: string;
  license_number: string;
  phone: string | null;
  user_id: UUID;
  is_active: boolean;
}

// ---- Shipment --------------------------------------------------------

export type ShipmentStatus =
  | "draft"
  | "bidding_open"
  | "transporter_selected"
  | "vehicle_assigned"
  | "driver_assigned"
  | "pickup_in_progress"
  | "loaded"
  | "dispatched"
  | "in_transit"
  | "arrived_at_destination"
  | "delivered"
  | "completed"
  | "cancelled";

export interface VehicleSummary {
  id: UUID;
  registration_number: string;
  vehicle_type: string;
}

export interface DriverSummary {
  id: UUID;
  full_name: string;
  phone: string | null;
}

export interface Shipment {
  id: UUID;
  company_id: UUID;
  customer_id: UUID;
  consignee_id: UUID | null;
  origin_location_id: UUID;
  destination_location_id: UUID;
  material_id: UUID | null;
  weight_kg: number;
  required_date: string;
  special_instructions: string | null;
  status: ShipmentStatus;
  /** The winning transporter's Company id (not a business partner) once selected. */
  transporter_id: UUID | null;
  vehicle_id: UUID | null;
  driver_id: UUID | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  gate_checked_in_at: string | null;
  gate_checked_out_at: string | null;
}

/** GET /shipments/{id} only — a cross-tenant single-record summary once assigned. */
export interface ShipmentDetail extends Shipment {
  vehicle: VehicleSummary | null;
  driver: DriverSummary | null;
}

export type BidStatus = "submitted" | "withdrawn" | "accepted" | "rejected";

export interface Bid {
  id: UUID;
  shipment_id: UUID;
  /** The bidding transporter's Company id — implicit from the caller on create. */
  transporter_id: UUID;
  price: number;
  eta_hours: number;
  status: BidStatus;
  notes: string | null;
}

export interface ShipmentTimelineEvent {
  action: string;
  context: Record<string, unknown> | null;
  created_at: string;
}

// ---- Documents -------------------------------------------------------

export type DocumentType =
  | "invoice"
  | "lr"
  | "e_way_bill"
  | "purchase_order"
  | "delivery_challan"
  | "pod"
  | "driver_document"
  | "vehicle_document"
  | "insurance"
  | "gst_document"
  | "other";

export type DocumentOwnerType = "shipment" | "driver" | "vehicle" | "company";

export interface Document {
  id: UUID;
  company_id: UUID;
  document_type: DocumentType;
  owner_type: DocumentOwnerType;
  owner_id: UUID;
  file_url: string;
  version: number;
  uploaded_by: UUID | null;
  description: string | null;
}

// ---- Finance ---------------------------------------------------------

export interface FreightCharge {
  id: UUID;
  company_id: UUID;
  shipment_id: UUID;
  amount: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  description: string | null;
}

export interface Expense {
  id: UUID;
  company_id: UUID;
  shipment_id: UUID | null;
  category: string;
  amount: number;
  incurred_on: string;
  notes: string | null;
}

export interface DriverExpense {
  id: UUID;
  company_id: UUID;
  driver_id: UUID;
  shipment_id: UUID | null;
  category: string;
  amount: number;
  incurred_on: string;
  notes: string | null;
}

export type PaymentStatus = "pending" | "completed" | "failed";

export interface Payment {
  id: UUID;
  company_id: UUID;
  shipment_id: UUID;
  amount: number;
  method: string;
  reference_number: string | null;
  status: PaymentStatus;
}

export type SettlementStatus = "pending" | "settled";

export interface Settlement {
  id: UUID;
  company_id: UUID;
  shipment_id: UUID;
  /** The transporter's Company id (not a business partner). */
  transporter_id: UUID;
  total_freight_amount: number;
  total_deductions: number;
  net_payable: number;
  status: SettlementStatus;
  settled_on: string | null;
}

// ---- Tracking --------------------------------------------------------

export interface TrackingPing {
  id: UUID;
  shipment_id: UUID;
  latitude: number;
  longitude: number;
  speed_kmph: number | null;
  heading_degrees: number | null;
  recorded_at: string;
}

export interface Eta {
  shipment_id: UUID;
  eta_hours: number | null;
  remaining_distance_km: number | null;
}

// ---- Notifications -----------------------------------------------------

export type NotificationChannel = "in_app" | "email" | "sms" | "whatsapp" | "push";
export type NotificationStatus = "pending" | "sent" | "failed";

export interface Notification {
  id: UUID;
  company_id: UUID;
  recipient_user_id: UUID;
  channel: NotificationChannel;
  title: string;
  body: string;
  status: NotificationStatus;
  related_entity_type: string | null;
  related_entity_id: UUID | null;
  read_at: string | null;
  created_at: string;
}

export type DevicePlatform = "ios" | "android";

// ---- Administration ----------------------------------------------------

export interface DashboardSummary {
  active_loads: number;
  open_bids: number;
  in_transit: number;
  delivered_this_month: number;
}

export interface MonthlyTransportSpend {
  year: number;
  month: number;
  total_amount: number;
}

export interface TransporterPerformanceEntry {
  /** The transporter's Company id (not a business partner). */
  transporter_id: UUID;
  transporter_name: string;
  completed_shipment_count: number;
  average_delivery_hours: number | null;
}

export interface FeatureFlag {
  id: UUID;
  company_id: UUID;
  key: string;
  is_enabled: boolean;
  description: string | null;
}

export interface Setting {
  id: UUID;
  company_id: UUID;
  key: string;
  value: string;
  description: string | null;
}

// ---- Transporter network ------------------------------------------------

export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";
export type LinkStatus = "active" | "revoked";

export interface TransporterInvite {
  id: UUID;
  inviting_company_id: UUID;
  invitee_phone: string | null;
  invitee_email: string | null;
  invitee_gstin: string | null;
  existing_transporter_company_id: UUID | null;
  invite_token: string;
  status: InviteStatus;
}

export interface FactoryTransporterLink {
  id: UUID;
  factory_company_id: UUID;
  transporter_company_id: UUID;
  status: LinkStatus;
}

export interface CompanyLookupResult {
  id: UUID;
  name: string;
}

// ---- API error shape ---------------------------------------------------

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    request_id: string | null;
  };
}
