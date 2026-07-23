import { useEffect } from 'react';
import { Redirect, Slot } from 'expo-router';

import { useRegisterPushToken } from '@/hooks/useRegisterPushToken';
import { startPingQueueFlusher } from '@/lib/ping-queue';
import { useAuthStore } from '@/store/auth-store';

export default function AppLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);
  useRegisterPushToken();

  useEffect(() => {
    if (!accessToken) return;
    return startPingQueueFlusher();
  }, [accessToken]);

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Slot />;
}
