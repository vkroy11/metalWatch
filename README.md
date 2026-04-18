# MetalWatch

A React Native (Expo) app that tracks live INR prices for precious metals — Gold, Silver, Platinum, Palladium — at 24K / 22K / 18K purity (only for gold), for Indian retail investors.

- **Design direction:** Liquid Glass on a dark navy canvas. See `design-preview/index.html` for the visual source of truth.
- **Architecture:** `metals.dev → Adapter (conversion + purity) → React Query → UI`. Business math lives in `src/adapters/` and nowhere else. See `CLAUDE.md`.

## Setup

```bash
cp .env.example .env        # then paste your metals.dev key
npm install
npx expo start
```

A `.npmrc` with `legacy-peer-deps=true` is committed so installs resolve cleanly across Expo SDK 54 peer ranges. Scan the QR with **Expo Go** on Android or the Camera app on iOS.

### Environment variables

```
EXPO_PUBLIC_METALS_API_KEY=<your-key>
EXPO_PUBLIC_METALS_BASE_URL=https://api.metals.dev/v1
```

Get a free key at https://metals.dev/.

## Stack

| Layer       | Tech                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| Framework   | Expo SDK 54 (React Native 0.81, React 19, New Architecture)            |
| Routing     | expo-router v6 (file-based)                                            |
| Fetching    | `@tanstack/react-query` v5                                             |
| Typing      | TypeScript strict, zod for API response validation                     |
| UI          | `expo-blur`, `react-native-svg`, `expo-linear-gradient`, Reanimated v4 |
| Fonts       | Inter + IBM Plex Mono (via `@expo-google-fonts/*`)                     |
| State       | Zustand (purity toggle only)                                           |
| Persistence | `@react-native-async-storage/async-storage` (24h delta reference)      |

## Scripts

```bash
npm start          # dev server
npm test           # jest (adapter unit tests)
npm run typecheck  # tsc --noEmit
```

## Project layout

```
app/                   # expo-router screens
  _layout.tsx          # providers + Stack
  index.tsx            # Landing (tile grid)
  metal/[symbol].tsx   # Detail (chart + stats)
src/
  api/                 # metals.dev fetch layer (+ zod schemas + fixtures)
  adapters/            # pure business math (ounce→gram, purity, delta, downsample)
  hooks/               # React Query hooks + purity + reduced-motion
  state/               # query client + purity store
  components/          # GlassView, Tile, HeroCard, PriceChart, etc.
  theme/               # design tokens + ThemeProvider
  types/               # Symbol / Purity / Range / MetalQuote / ChartPoint
  utils/               # format, a11y, downsample
```

## Notes on the free tier

metals.dev's free plan refreshes on a slower cadence than true realtime, so React Query is configured with a 6 h `refetchInterval`. The Landing topbar shows `UPDATED {relative-time}` instead of a fake live counter. Tile 24h deltas are computed by persisting yesterday's raw rate in AsyncStorage and diffing on the next refresh — the first-ever launch shows `—` for deltas.

### Historical chart

`/timeseries` caps each call at 30 days. For the **1Y** range the client fires 13 parallel chunks (each ≤30 days), merges the `rates` maps, and hands the combined series to the adapter. React Query caches the result under `['timeseries', range]` so 1D/1W/1M/1Y are fetched once per session and shared across every metal's detail screen. The endpoint also always returns USD per troy ounce — the adapter multiplies by each day's `currencies.INR` rate (USD per 1 INR) to convert to INR per gram at the selected purity.

## Design constraints (honoured)

- Liquid Glass stays even on mid-range Android; `GlassView` falls back to a solid `rgba(15,23,42,0.92)` on Android API < 31 or when OS-level _Reduce Transparency_ is enabled.
- Every price / delta / axis tick uses IBM Plex Mono with `tabular-nums`.
- Gain / loss is always encoded by **arrow glyph + sign + colour** — never colour alone.
- `prefers-reduced-motion` disables tile press-scale, aurora drift, and skeleton sheen.

# metalWatch

# metalWatch
