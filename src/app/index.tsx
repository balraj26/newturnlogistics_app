import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/auth-store';

export default function Index() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const pendingVerification = useAuthStore((state) => state.pendingVerification);

  if (accessToken) {
    return <Redirect href="/(app)" />;
  }
  if (pendingVerification) {
    return <Redirect href="/(auth)/verify-email" />;
  }
  return <Redirect href="/(auth)/login" />;
}
