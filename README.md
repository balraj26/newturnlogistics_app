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
- **No UI yet for the newer shipment sub-stage/reconciliation actions**:
  `src/services/shipments.ts` has calls for `revert`, `archive`/
  `unarchive`, gate verification (`gate-verify-vehicle`/`-driver`/
  `-documents`), loading-event capture (weight/seal), and POD
  reconciliation (accepted/rejected quantity) — see
  `docs/shipment-specification.md` in `New Turn/backend`'s sibling repo
  for the full design — but no screen calls any of them yet. Only
  `cancel` (now requiring a reason) is wired into a screen
  (`factory/shipments/[id].tsx`). The web dashboard has the same gap for
  most of these — check `New Turn/frontend/components/dashboard/shipments/`
  before assuming a form already exists to port from.

## Running natively on Android (local build, no EAS wait)

For fast local iteration instead of waiting on EAS cloud builds:

```bash
# ~/.zshrc (Android Studio's bundled JBR, Java 21)
export ANDROID_HOME=$HOME/Library/Android/sdk
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"

npx expo run:android   # builds the native project + installs on a running emulator/device
```

Requires Android Studio installed with an AVD created (Android Studio →
Device Manager). `brew install watchman` is recommended — without it,
Metro's fallback file watcher can serve stale bundles after edits (looks
like the file wasn't saved, or a fixed error keeps reappearing).

**SDK version**: on Expo SDK 54 (`react-native` 0.81.5, React 19.1) as of
2026-07-24, downgraded from SDK 57 while chasing the layout bug below.
The downgrade turned out not to be the fix (see below), but there's no
reason to move back — 54 is stable, `expo-doctor` is 18/18 clean, and
nothing in this app needs an SDK-57-only feature.

**Known Android layout footgun**: `components/ui/Screen.tsx`'s `padded`
wrapper needs `flex: 1` (fixed 2026-07-24). Without it, a `Screen
scroll={false}` + a `flex:1`-centered content view inside is an ambiguous
nested-flex case that Android's Yoga layout engine resolves badly —
auto-sized `Text` nodes (titles, subtitles, input labels) get measured
with zero space and silently disappear, while fixed-height elements
(buttons, `TextInput` boxes) still render, overlapping. Same component
tree rendered correctly on `expo start --web`, which is more forgiving of
that ambiguity — don't trust a clean web render alone when a screen uses
`scroll={false}` with centered content; check Android/iOS too.

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
