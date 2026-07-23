import { apiFetch } from '@/lib/api-client';
import type { Role, User, UUID } from '@/types/api';

export interface RoleInput {
  name: string;
  description?: string;
  permission_codes: string[];
}

export interface RoleUpdateInput {
  name?: string;
  description?: string;
  permission_codes?: string[];
}

/** Ported from New Turn/frontend/services/rbac.ts. */
export const rbacService = {
  listRoles: () => apiFetch<Role[]>('/api/v1/roles'),
  createRole: (data: RoleInput) => apiFetch<Role>('/api/v1/roles', { method: 'POST', body: data }),
  updateRole: (roleId: UUID, data: RoleUpdateInput) =>
    apiFetch<Role>(`/api/v1/roles/${roleId}`, { method: 'PATCH', body: data }),
  deleteRole: (roleId: UUID) => apiFetch<void>(`/api/v1/roles/${roleId}`, { method: 'DELETE' }),
  assignRole: (userId: UUID, roleId: UUID) =>
    apiFetch<void>('/api/v1/roles/assign', {
      method: 'POST',
      body: { user_id: userId, role_id: roleId },
    }),
  unassignRole: (userId: UUID, roleId: UUID) =>
    apiFetch<void>('/api/v1/roles/unassign', {
      method: 'POST',
      body: { user_id: userId, role_id: roleId },
    }),
  listRoleUsers: (roleId: UUID) => apiFetch<User[]>(`/api/v1/roles/${roleId}/users`),
};
