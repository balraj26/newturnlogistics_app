import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

/** Adapts expo-secure-store (Keychain on iOS, Keystore-backed EncryptedSharedPreferences
 * on Android) to zustand's persist StateStorage interface, so the auth
 * store's tokens never sit in plain AsyncStorage/localStorage-equivalent. */
export const secureStorage: StateStorage = {
  getItem: async (name) => (await SecureStore.getItemAsync(name)) ?? null,
  setItem: async (name, value) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    await SecureStore.deleteItemAsync(name);
  },
};
