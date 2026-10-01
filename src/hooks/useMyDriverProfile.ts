import { useQuery } from '@tanstack/react-query';

import { masterDataService } from '@/services/master-data';

/** The signed-in driver's own record, from GET /master-data/drivers/me — a
 * Driver holds no master_data:view, so the company roster
 * (GET /master-data/drivers) is off limits to them. */
export function useMyDriverProfile() {
  const driverQuery = useQuery({
    queryKey: ['master-data', 'drivers', 'me'],
    queryFn: masterDataService.getMyDriverRecord,
  });

  return {
    isLoading: driverQuery.isLoading,
    driver: driverQuery.data,
  };
}
