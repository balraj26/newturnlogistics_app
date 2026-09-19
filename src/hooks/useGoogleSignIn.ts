import { useCallback, useState } from 'react';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { authService } from '@/services/auth';
import { usersService } from '@/services/users';
import { useAuthStore } from '@/store/auth-store';

/** Android-only for now — no iosClientId configured, see README. */
export function useGoogleSignIn() {
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signIn = useCallback(async () => {
    setIsSigningIn(true);
    try {
      // configure() is async (does real native setup) — awaiting it here,
      // every time, guarantees it's actually finished before signIn() runs.
      await GoogleSignin.configure({
        // Audiences the returned ID token to our existing Web OAuth client,
        // the same one the backend already verifies against — see .env.example.
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
      });
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = isSuccessResponse(response) ? (response.data?.idToken ?? null) : null;
      if (idToken === null) {
        return; // user cancelled — not an error
      }

      const tokens = await authService.googleTokenSignIn(idToken);
      setSession(tokens);
      const me = await usersService.me();
      setUser(me);
      return me;
    } catch (error) {
      if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      throw error;
    } finally {
      setIsSigningIn(false);
    }
  }, [setSession, setUser]);

  return { signIn, isSigningIn };
}
