import { useQuery } from '@tanstack/react-query';

import { masterDataService } from '@/services/master-data';
import { usersService } from '@/services/users';

/** There's no dedicated "my driver record" endpoint — GET /master-data/drivers
 * lists the whole company roster (any authenticated user in the company
 * may call it, no master_data:view requirement, see
 * app/modules/master_data/router.py:list_drivers), so this filters
 * client-side to the row whose user_id matches the caller. */
export function useMyDriverProfile() {
  const meQuery = useQuery({ queryKey: ['users', 'me'], queryFn: usersService.me });
  const driversQuery = useQuery({
    queryKey: ['master-data', 'drivers'],
    queryFn: masterDataService.listDrivers,
    enabled: !!meQuery.data,
  });

  const driver = driversQuery.data?.find((d) => d.user_id === meQuery.data?.id);

  return {
    isLoading: meQuery.isLoading || driversQuery.isLoading,
    driver,
  };
}
