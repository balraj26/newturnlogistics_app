import { apiFetch } from '@/lib/api-client';
import type { CompanyLookupResult, FactoryTransporterLink, TransporterInvite, UUID } from '@/types/api';

export interface CreateInviteInput {
  existing_transporter_public_code?: string;
  invitee_phone?: string;
  invitee_email?: string;
  invitee_gstin?: string;
}

/** Ported from New Turn/frontend/services/transporter-network.ts. */
export const transporterNetworkService = {
  lookupCompany: (publicCode: string) =>
    apiFetch<CompanyLookupResult>(
      `/api/v1/companies/lookup?public_code=${encodeURIComponent(publicCode)}`,
    ),

  listInvites: () => apiFetch<TransporterInvite[]>('/api/v1/transporter-invites'),
  createInvite: (data: CreateInviteInput) =>
    apiFetch<TransporterInvite>('/api/v1/transporter-invites', { method: 'POST', body: data }),
  acceptInvite: (id: UUID) =>
    apiFetch<FactoryTransporterLink>(`/api/v1/transporter-invites/${id}/accept`, {
      method: 'POST',
    }),

  listLinks: () => apiFetch<FactoryTransporterLink[]>('/api/v1/transporter-network/links'),
  revokeLink: (id: UUID) =>
    apiFetch<FactoryTransporterLink>(`/api/v1/transporter-network/links/${id}/revoke`, {
      method: 'POST',
    }),
};
