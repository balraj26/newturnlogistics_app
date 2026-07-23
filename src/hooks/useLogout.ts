import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { authService } from '@/services/auth';
import { notificationsService } from '@/services/notifications';
import { useAuthStore } from '@/store/auth-store';

/** Revokes the refresh token, unregisters this device's push token (so a
 * signed-out phone stops receiving push for the account that just left),
 * clears local session state, and returns to login. Best-effort: network
 * failures on the revoke/unregister calls never block getting the user
 * signed out locally.
 */
export function useLogout() {
  const router = useRouter();
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);

  return async () => {
    try {
      const pushToken = (await Notifications.getExpoPushTokenAsync().catch(() => null))?.data;
      if (pushToken) {
        await notificationsService.unregisterDevice(pushToken).catch(() => undefined);
      }
      if (refreshToken) {
        await authService.logout(refreshToken).catch(() => undefined);
      }
    } finally {
      clearSession();
      router.replace('/(auth)/login');
    }
  };
}
