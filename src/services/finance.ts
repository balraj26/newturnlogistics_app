import { apiFetch } from '@/lib/api-client';
import type { DriverExpense, Expense, FreightCharge, Payment, Settlement, UUID } from '@/types/api';

export interface FreightChargeInput {
  shipment_id: UUID;
  amount: number;
  gst_rate: number;
  description?: string;
}

export interface ExpenseInput {
  shipment_id?: UUID;
  category: string;
  amount: number;
  incurred_on: string;
  notes?: string;
}

export interface DriverExpenseInput {
  driver_id: UUID;
  shipment_id?: UUID;
  category: string;
  amount: number;
  incurred_on: string;
  notes?: string;
}

export interface PaymentInput {
  shipment_id: UUID;
  amount: number;
  method: string;
  reference_number?: string;
}

export interface SettlementInput {
  shipment_id: UUID;
  transporter_id: UUID;
  total_freight_amount: number;
  total_deductions?: number;
}

/** Ported from New Turn/frontend/services/finance.ts. */
export const financeService = {
  listFreightCharges: (shipmentId: UUID) =>
    apiFetch<FreightCharge[]>(`/api/v1/finance/freight-charges?shipment_id=${shipmentId}`),
  recordFreightCharge: (data: FreightChargeInput) =>
    apiFetch<FreightCharge>('/api/v1/finance/freight-charges', { method: 'POST', body: data }),

  recordExpense: (data: ExpenseInput) =>
    apiFetch<Expense>('/api/v1/finance/expenses', { method: 'POST', body: data }),

  recordDriverExpense: (data: DriverExpenseInput) =>
    apiFetch<DriverExpense>('/api/v1/finance/driver-expenses', { method: 'POST', body: data }),

  recordPayment: (data: PaymentInput) =>
    apiFetch<Payment>('/api/v1/finance/payments', { method: 'POST', body: data }),

  createSettlement: (data: SettlementInput) =>
    apiFetch<Settlement>('/api/v1/finance/settlements', { method: 'POST', body: data }),
  settle: (settlementId: UUID) =>
    apiFetch<Settlement>(`/api/v1/finance/settlements/${settlementId}/settle`, {
      method: 'POST',
    }),
};
