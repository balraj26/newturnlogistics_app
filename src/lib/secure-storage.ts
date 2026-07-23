import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

/** Adapts expo-secure-store (Keychain on iOS, Keystore-backed EncryptedSharedPreferences
 * on Android) to zustand's persist StateStorage interface, so the auth
 * store's tokens never sit in plain AsyncStorage/localStorage-equivalent on
 * native. expo-secure-store's web implementation is a stub with no actual
 * methods (see node_modules/expo-secure-store/src/ExpoSecureStore.web.ts) —
 * calling it there throws and the persisted store never rehydrates, so the
 * app hangs on a blank screen forever. Native (iOS/Android) is unaffected;
 * web isn't a real target for this app (see README), so localStorage here
 * is just "don't hang," not a security boundary. */
export const secureStorage: StateStorage =
  Platform.OS === 'web'
    ? {
        getItem: (name) => window.localStorage.getItem(name),
        setItem: (name, value) => window.localStorage.setItem(name, value),
        removeItem: (name) => window.localStorage.removeItem(name),
      }
    : {
        getItem: async (name) => (await SecureStore.getItemAsync(name)) ?? null,
        setItem: async (name, value) => {
          await SecureStore.setItemAsync(name, value);
        },
        removeItem: async (name) => {
          await SecureStore.deleteItemAsync(name);
        },
      };
