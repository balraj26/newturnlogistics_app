# NewTurn Logistics — mobile app

React Native (Expo, TypeScript, Expo Router) companion app to
[`New Turn/backend`](../New%20Turn/backend) and
[`New Turn/frontend`](../New%20Turn/frontend) — one app, four persona tab
groups resolved by role after login (see `src/hooks/useCurrentRole.ts`):
Factory Owner, Transporter, Driver, Gatekeeper.

## Setup

```bash
npm install
cp .env.example .env   # point EXPO_PUBLIC_API_URL at your backend
npx expo start
```

`EXPO_PUBLIC_API_URL` must be reachable from wherever the app runs — use
your machine's LAN IP (not `localhost`) for a physical device or the
Android emulator; `http://localhost:8000` only works from the iOS
Simulator on the same machine as the backend.

Location and push-notification permissions require a real device or the
iOS Simulator/Android emulator with Google Play services — camera capture
(proof of delivery) needs a real device or a simulator with a mocked
camera.

## Structure

- `src/theme/` — design tokens ported from `NewTurn Mobile App Template`
  (color/typography/spacing values) + the `useTheme()` light/dark hook.
- `src/components/ui/` — core primitives (Button, Input, Card, StatusPill,
  Screen, TopAppBar, ...).
- `src/services/`, `src/types/api.ts`, `src/lib/api-client.ts` — ported
  from `New Turn/frontend` (same backend, same contracts); the auth store
  (`src/store/auth-store.ts`) swaps `localStorage` for `expo-secure-store`.
- `src/app/(auth)/` — login, signup, OTP email verification.
- `src/app/(app)/` — authenticated shell; `(app)/index.tsx` resolves role
  and redirects into `factory/`, `transporter/`, `driver/`, or
  `gatekeeper/`, each with its own `Tabs` layout.

## Known gaps / next steps (deliberately out of scope for v1)

- **Native Google Sign-In**: the backend's `/auth/google/*` flow hands
  tokens back via a web redirect fragment, not usable from a native
  binary. Email+password + OTP is the only mobile signup path for now.
- **True background location**: `useShipmentLocationSharing` only tracks
  while the app is foregrounded (`Location.watchPositionAsync`). Real
  background tracking needs `Location.startLocationUpdatesAsync` +
  `expo-task-manager`, which requires a custom dev-client/production
  build — it does not run in Expo Go on iOS since SDK 43.
- **Team/roles, finance, and most master-data CRUD** (locations, materials,
  routes, business partners) are web-dashboard-only for now — the mobile
  app assumes those are set up there first; it covers the workflows that
  actually need to happen in the field (shipment lifecycle, bidding,
  gate check-in/out, proof of delivery).
- **Offline ping queue** (`src/lib/ping-queue.ts`) persists failed
  tracking pings and flushes on reconnect, but there's no equivalent queue
  for other mutations (bids, status transitions) — those still fail
  outright when offline.

## Building & submitting (EAS)

Not run yet — needs `eas login` (an Expo account) first:

```bash
npx eas login
npx eas build:configure        # links this project to an EAS project, fills app.json's `extra.eas.projectId`
npx eas build --profile preview --platform android   # internal APK, fastest way to test on a real device
npx eas build --profile production --platform all
npx eas submit --platform ios      # after a production build
npx eas submit --platform android
```

`eas.json` already defines `development`/`preview`/`production` profiles
pointing at `https://api.newturnlogistics.com`. `app.json` sets
`ios.bundleIdentifier`/`android.package` to `com.newturnlogistics.mobile`
and the permission strings EAS needs for the App Store/Play Store
review (location, camera, background location).
