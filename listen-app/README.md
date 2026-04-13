# LISTEN

> _SETI@home was shut down in 2020. We are turning it back on — in the pockets of 4 billion people._

LISTEN is a React Native / Expo app that turns every phone into a node of
the largest distributed radio-telescope data processor ever built. While the
phone is charging and on Wi-Fi it pulls a tiny packet of real spectrogram
data, runs a local FFT + anomaly score, and ships the result back to the
network. When enough phones flag the same sky sector, the app surfaces it as
a candidate anomaly for human review.

## Project layout

```
listen-app/
├── app/                  Expo Router pages (onboarding, tabs, settings)
├── components/           Reusable UI (waveform, starfield, cards, …)
├── constants/            Colors, typography, runtime config
├── services/             i18n, Supabase client, signal processor, background task
├── store/                Zustand store (persisted with AsyncStorage)
├── utils/                Pure math: FFT, anomaly score, constellation gen
├── locales/              i18next JSON for 9 languages
├── scripts/              Mock data generator
└── supabase/             SQL migrations + edge functions
```

## Run locally

The app boots without any backend, without any font files, and without a
native dev-client. You can test it in three ways — pick the fastest for
your machine.

### 1. Expo Go on a physical phone (easiest)

```bash
cd listen-app
npm install                         # if postinstall scripts fail,
                                    # re-run with: npm install --ignore-scripts
npx expo start
```

Then install **Expo Go** from the App Store / Play Store, make sure your
phone is on the same Wi-Fi as your laptop, and scan the QR code that Metro
prints. The app will hot-reload as you edit files.

### 2. Web (no phone needed)

```bash
cd listen-app
npm install --ignore-scripts        # web doesn't need the native modules
npx expo start --web
```

Metro will open `http://localhost:8081` in your browser. The
`services/backgroundTask.web.ts` stub keeps the UI fully interactive — only
the background packet processing no-ops.

### 3. iOS simulator (macOS) / Android emulator

```bash
cd listen-app
npm install
npx expo start --ios      # or --android
```

Requires Xcode / Android Studio installed.

### Backend — optional

All mock data is baked in. To wire up a real Supabase project, copy
`.env.example` to `.env` and fill in:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Without these, `subscribeGlobalStats()` is a no-op and the hero counter
keeps drifting on its local simulated values.

### Run the unit tests

The scientific core has its own standalone Jest config:

```bash
cd listen-app
npm install --no-save --ignore-scripts jest@29 ts-jest@29 typescript@5 @types/jest@29
npx jest --config jest.config.js
```

Expected output: **11 passed, 2 total**.

## Scientific core

`utils/fft.ts` implements a radix-2 Cooley-Tukey FFT in pure TypeScript so
the same code runs on iOS, Android, Web and inside Jest tests without a
native bridge. `utils/anomalyScore.ts` combines three heuristics — spectral
peak sharpness, spectral flatness and kurtosis — to produce a 0-100 score.
Both modules have unit tests under `utils/__tests__/`.

## Mock data

```bash
npm run generate-mock-data          # writes to /tmp/listen-mock
supabase storage cp /tmp/listen-mock listen-packets --recursive
```

## Supabase

Apply migrations with the Supabase CLI:

```bash
supabase db push
supabase functions deploy distribute-packets
supabase functions deploy aggregate-results
```

## Business model

$1 up-front. Zero ads. Zero subscriptions. Zero data selling. Future revenue
comes from scientific institutions paying the network for compute time.
