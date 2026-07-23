import { Redirect } from 'expo-router';

import { LoadingView } from '@/components/ui';
import { useCurrentRole } from '@/hooks/useCurrentRole';

/** Landing spot right after login/verify — resolves which persona tab
 * group to send the user into (see useCurrentRole) and redirects there.
 * Each role group owns its own Tabs layout under (app)/<role>/. */
export default function AppIndex() {
  const { isLoading, role } = useCurrentRole();

  if (isLoading || !role) {
    return <LoadingView />;
  }

  switch (role) {
    case 'factory':
      return <Redirect href="/(app)/factory" />;
    case 'transporter':
      return <Redirect href="/(app)/transporter" />;
    case 'driver':
      return <Redirect href="/(app)/driver" />;
    case 'gatekeeper':
      return <Redirect href="/(app)/gatekeeper" />;
  }
}
