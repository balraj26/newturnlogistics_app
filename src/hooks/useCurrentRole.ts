import { useQuery } from '@tanstack/react-query';

import { usersService } from '@/services/users';
import { useAuthStore } from '@/store/auth-store';
import type { Company, User } from '@/types/api';

export type AppRole = 'factory' | 'transporter' | 'driver' | 'gatekeeper';

interface CurrentRole {
  isLoading: boolean;
  role: AppRole | null;
  user: User | undefined;
  company: Company | undefined;
  permissions: string[];
}

/** Resolves which of the four persona tab-groups a logged-in user belongs
 * in — company_type narrows it to factory-side vs transporter-side, and
 * permission codes (see backend/docs/roles.md) narrow it further: a
 * factory_owner company's Gatekeeper holds shipment:gate_manage but not
 * company:manage; a transporter company's Driver holds shipment:execute_own
 * but not company:manage. Additive role assignment (e.g. a Factory Admin
 * who's also a Gatekeeper) resolves to the fuller admin persona — the
 * gate action itself is still reachable there in a future iteration, not
 * duplicated as its own tab group.
 */
export function useCurrentRole(): CurrentRole {
  const accessToken = useAuthStore((state) => state.accessToken);
  const enabled = !!accessToken;

  const userQuery = useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersService.me,
    enabled,
  });
  const companyQuery = useQuery({
    queryKey: ['companies', 'me'],
    queryFn: usersService.myCompany,
    enabled,
  });
  const permissionsQuery = useQuery({
    queryKey: ['users', 'me', 'permissions'],
    queryFn: usersService.myPermissions,
    enabled,
  });

  const isLoading = userQuery.isLoading || companyQuery.isLoading || permissionsQuery.isLoading;
  const company = companyQuery.data;
  const permissions = permissionsQuery.data ?? [];

  let role: AppRole | null = null;
  if (company && permissions.length >= 0 && !isLoading) {
    if (company.company_type === 'factory_owner') {
      role = permissions.includes('company:manage') || permissions.includes('shipment:manage')
        ? 'factory'
        : 'gatekeeper';
    } else {
      role = permissions.includes('company:manage') || permissions.includes('bid:submit')
        ? 'transporter'
        : 'driver';
    }
  }

  return { isLoading, role, user: userQuery.data, company, permissions };
}
