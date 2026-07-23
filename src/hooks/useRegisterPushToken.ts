import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { notificationsService } from '@/services/notifications';
import { useAuthStore } from '@/store/auth-store';

/** Registers this device's Expo push token with the backend once per
 * authenticated session — best-effort and silent on failure (denied
 * permission, simulator with no push capability, offline at launch): a
 * missing push token degrades to in-app-only notifications, it never
 * blocks using the app. See backend/docs/08-notifications-module.md. */
export function useRegisterPushToken() {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken || !Device.isDevice) return;

    let cancelled = false;

    (async () => {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let status = existing;
      if (status !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        status = requested.status;
      }
      if (status !== 'granted' || cancelled) return;

      const { data: token } = await Notifications.getExpoPushTokenAsync();
      if (cancelled) return;

      await notificationsService
        .registerDevice(token, Platform.OS === 'ios' ? 'ios' : 'android')
        .catch(() => undefined);
    })().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [accessToken]);
}
