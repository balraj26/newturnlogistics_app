import { apiFetch } from '@/lib/api-client';
import type {
  DashboardSummary,
  FeatureFlag,
  MonthlyTransportSpend,
  Setting,
  TransporterPerformanceEntry,
} from '@/types/api';

/** Ported from New Turn/frontend/services/administration.ts. */
export const administrationService = {
  dashboard: () => apiFetch<DashboardSummary>('/api/v1/administration/dashboard'),

  monthlyTransportSpend: (year: number, month: number) =>
    apiFetch<MonthlyTransportSpend>(
      `/api/v1/administration/reports/monthly-transport-spend?year=${year}&month=${month}`,
    ),
  transporterPerformance: () =>
    apiFetch<TransporterPerformanceEntry[]>(
      '/api/v1/administration/reports/transporter-performance',
    ),

  listFeatureFlags: () => apiFetch<FeatureFlag[]>('/api/v1/administration/feature-flags'),
  setFeatureFlag: (key: string, isEnabled: boolean, description?: string) =>
    apiFetch<FeatureFlag>(`/api/v1/administration/feature-flags/${key}`, {
      method: 'PUT',
      body: { is_enabled: isEnabled, description },
    }),

  listSettings: () => apiFetch<Setting[]>('/api/v1/administration/settings'),
  setSetting: (key: string, value: string, description?: string) =>
    apiFetch<Setting>(`/api/v1/administration/settings/${key}`, {
      method: 'PUT',
      body: { value, description },
    }),
};
