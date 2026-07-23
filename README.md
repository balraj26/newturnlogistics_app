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

Logged in and linked (2026-07-23) — the commands below use the CLI
package name directly since plain `npx eas ...` fails with "could not
determine executable to run" (the package is `eas-cli`, not `eas`):

```bash
npx eas-cli@latest login                 # done — account: balrajsingh1910@gmail.com
npx eas-cli@latest init --id <id>        # done — see app.json's extra.eas.projectId
npx eas-cli@latest build --profile preview --platform android   # first build kicked off, see below
npx eas-cli@latest build --profile production --platform all
npx eas-cli@latest submit --platform ios      # after a production build
npx eas-cli@latest submit --platform android
```

**Project**: linked to `@balraj26s-team/balraj26` (EAS project ID
`e4110f0a-d7f9-4b86-90eb-7f1a609735d2`). The project's *slug* ended up as
`balraj26` (defaulted from the account name — it was created via the EAS
dashboard's "New project" flow without a custom name) instead of
`newturnlogistics-mobile`; cosmetic only, shows up in the expo.dev project
URL. Rename it on the dashboard if you want it cleaner — `app.json`'s
`slug` field has to match whatever the project is actually registered
under, so don't hand-edit it without also renaming the EAS project first.

**Credentials**: Android signing keystore was generated and is held by
EAS ("remote credentials" — you don't need `keytool` installed locally).

**EAS Update**: the first build auto-installed `expo-updates` and wired
`runtimeVersion`/`updates.url` for the `preview` channel/branch it
created — OTA JS-only updates (`eas update --branch preview`) work once a
build from that channel is installed, without needing a new store build
for every change.

**Checking a build's status**:

```bash
npx eas-cli@latest build:list                 # recent builds, all profiles
npx eas-cli@latest build:view <build-id>       # one build's detail + logs/artifact URL
```

Status also shows on the EAS dashboard (expo.dev → your project →
Builds) — same info, plus a permanent install QR code once it finishes.
Builds can sit "in queue" for a while on the free tier; it's running
entirely in EAS's cloud, so closing the terminal or losing the local
connection doesn't cancel it.

`eas.json` defines `development`/`preview`/`production` profiles pointing
at `https://api.newturnlogistics.com`. `app.json` sets
`ios.bundleIdentifier`/`android.package` to `com.newturnlogistics.mobile`
and the permission strings EAS needs for App Store/Play Store review
(location, camera, background location).
