import { Redirect } from 'expo-router';

import { LoadingView } from '@/components/ui';
import { useCurrentRole } from '@/hooks/useCurrentRole';

/** Landing spot right after login/verify — resolves which persona to send
 * the user into (see useCurrentRole) and redirects there. Consignor
 * (factory) and Transporter share one unified shell (see (app)/home/) with
 * a side menu + Trips/Loads home, since both deal in the same shipment
 * list just filtered server-side (docs/shipment-specification.md §7's
 * scope=loads|trips). Driver and Gatekeeper keep their own distinct,
 * purpose-built Tabs groups. */
export default function AppIndex() {
  const { isLoading, role } = useCurrentRole();

  if (isLoading || !role) {
    return <LoadingView />;
  }

  switch (role) {
    case 'factory':
    case 'transporter':
      return <Redirect href="/(app)/home" />;
    case 'driver':
      return <Redirect href="/(app)/driver" />;
    case 'gatekeeper':
      return <Redirect href="/(app)/gatekeeper" />;
  }
}
