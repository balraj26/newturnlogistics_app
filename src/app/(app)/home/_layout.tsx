import { Stack } from 'expo-router';

/** Shared shell for Consignor and Transporter — a plain Stack, not Tabs.
 * The side menu (SideMenu) + persistent notification bell on home/index.tsx
 * replace the old per-role bottom tab bar; every other screen here is
 * reached via the side menu or a push from the Trips/Loads list, so each
 * renders its own TopAppBar with a back button. */
export default function HomeLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
