import { apiFetch } from '@/lib/api-client';
import type { Company, User } from '@/types/api';

export const usersService = {
  me: () => apiFetch<User>('/api/v1/users/me'),
  myPermissions: () => apiFetch<string[]>('/api/v1/users/me/permissions'),
  myCompany: () => apiFetch<Company>('/api/v1/companies/me'),
  list: () => apiFetch<User[]>('/api/v1/users'),
  listOwners: () => apiFetch<User[]>('/api/v1/users/owners'),
  grantOwner: (userId: string) =>
    apiFetch<User>(`/api/v1/users/${userId}/grant-owner`, { method: 'POST' }),
  revokeOwner: (userId: string) =>
    apiFetch<User>(`/api/v1/users/${userId}/revoke-owner`, { method: 'POST' }),
};
