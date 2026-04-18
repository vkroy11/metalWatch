# MetalWatch — UI Design Prompt (v2, Stitch-ready)

> Enhanced brief for **MetalWatch**, a React Native (Expo) app that tracks live prices
> of gold, silver, platinum, and palladium for Indian retail investors. This prompt is
> written to be fed directly into Google Stitch / any text-to-UI model, and builds on
> the goals in `prd.md` and `README.md`.

---

## 1. Product Context

- **Audience:** casual Indian investors tracking INR/gram prices at 24K / 22K / 18K purity.
- **Platform:** React Native (Expo), primary target mid-range Android, secondary iOS.
- **Data cadence:** 60s polling via React Query. UI must convey freshness (last updated, live dot).
- **Screens in scope:** Landing (tile grid) + Detail (interactive line chart).
- **Performance floor:** 60fps on mid-range Android. Visual richness is a feature — we
  just don't pile effects gratuitously.

## 2. Design Direction — Liquid Glass (premium fintech)

**Primary style: Liquid Glass**, the flagship recommendation from the design-system
search. This is the look we want: translucent surfaces, soft iridescence, morphing
transitions, dynamic backdrop blur, cinematic dark canvas. Think Apple Weather ×
Robinhood × a private-bank mobile app.

**Why Liquid Glass fits:**
- Precious metals are a luxury/trust category — glass + gold feels inherently premium.
- The chart and tiles benefit from depth cues (blur behind, crisp numbers in front).
- Mid-range Android handles `backdrop-filter` / `BlurView` fine when used on ≤ 2 layers
  per screen with moderate blur radius (see §12 guardrails).

**Mood words:** luminous, liquid, precise, cinematic, "private-wealth terminal."

## 3. Color System — Dark-first, Gold-forward

Dark canvas lets gold read as gold and silver read as silver without competing with
a bright background. We keep this as the v1 theme.

| Token | Hex / Value | Use |
|---|---|---|
| `bg/canvas` | `#0B1020` | App background (deep navy, near-black) |
| `bg/canvas-grad` | `linear-gradient(180deg, #0F172A 0%, #0B1020 60%, #060912 100%)` | Subtle ambient gradient behind glass surfaces |
| `bg/aurora-gold` | Radial `#F59E0B @ 18% alpha` top-right | Ambient glow behind Gold tile |
| `bg/aurora-violet` | Radial `#8B5CF6 @ 14% alpha` bottom-left | Ambient glow for the CTA/accent zone |
| `glass/surface` | `rgba(255,255,255,0.06)` + `backdrop-blur(24px)` + 1px inner border `rgba(255,255,255,0.08)` | Cards, tiles, nav bars |
| `glass/surface-strong` | `rgba(255,255,255,0.10)` + `backdrop-blur(32px)` | Detail hero card, modals |
| `glass/stroke` | `rgba(255,255,255,0.12)` | Hairline borders on glass |
| `text/primary` | `#F8FAFC` | Prices, headings |
| `text/secondary` | `#CBD5E1` | Labels |
| `text/muted` | `#94A3B8` | Timestamps, hints |
| `accent/gold` | `#F59E0B` → `#FBBF24` gradient | XAU identity + primary CTA |
| `accent/silver` | `#E5E7EB` → `#9CA3AF` gradient | XAG identity |
| `accent/platinum` | `#A5B4FC` → `#64748B` gradient | XPT identity (cool iridescent) |
| `accent/palladium` | `#C4B5FD` → `#7C8797` gradient | XPD identity (violet metallic) |
| `cta/violet` | `#8B5CF6` | Secondary CTA, active states |
| `semantic/gain` | `#34D399` | ▲ price up |
| `semantic/loss` | `#F87171` | ▼ price down |
| `semantic/gain-glow` | radial `#10B981 @ 24% alpha` | Chart fill under gain line |
| `semantic/loss-glow` | radial `#EF4444 @ 24% alpha` | Chart fill under loss line |

**Rules:**
- Metal accent appears as (a) a 2px gradient bar on the tile's left edge, and (b) a
  small iridescent swatch next to the metal name. It may subtly tint the tile's
  backdrop-blur via a low-alpha radial glow — never a solid fill.
- Gain/loss color always pairs with an arrow glyph — never rely on color alone.
- Dark-first in v1. Light/day mode is a future variant.

## 4. Typography

**Pairing:** Inter (UI) + IBM Plex Mono (numerals).
Inter is the design-system pick — clean, neutral, premium. Plex Mono handles prices
and axes so digits don't jitter between 60s polls.

| Role | Font | Size (sp) | Weight | Notes |
|---|---|---|---|---|
| Display price (Detail) | Plex Mono | 44 | 600 | `font-variant-numeric: tabular-nums`; slight -1% tracking |
| Tile price | Plex Mono | 26 | 600 | Tabular nums |
| Screen title | Inter | 22 | 600 | Tracking -0.5% |
| Metal name | Inter | 15 | 600 | |
| Label / metadata | Inter | 13 | 500 | `text/secondary` |
| Timestamp | Inter | 11 | 500 | `text/muted`, uppercase, +0.8 tracking |
| Chart axis | Plex Mono | 10 | 400 | |

All prices, deltas, and axis ticks **must** use `tabular-nums`.

## 5. Spacing & Grid

- Base unit: **8px**. Allowed: 4, 8, 12, 16, 20, 24, 32, 48, 64.
- Screen horizontal padding: 20px.
- Tile grid: 2 columns, 16px gutter, 1:1.05 aspect ratio.
- Card radius: **20px** tiles, **28px** detail hero, **999px** pill chips.
- Hit targets: **≥ 44×44px** on every chip, back button, tile, kebab.

## 6. Elevation & Glass Recipe

Every glass surface uses the same two-part recipe — one blur + one soft shadow.

```
glass-card:
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.08) inset,   // top inner highlight
    0 20px 40px -20px rgba(0, 0, 0, 0.55);     // soft ambient lift
```

Detail hero uses `blur(32px)` and a slightly stronger inner highlight. Don't stack
more than two blur surfaces on a single screen.

## 7. Screen 1 — Landing (Home)

**Ambient layer (bottom, non-interactive):**
- Canvas gradient `bg/canvas-grad`.
- Two radial auroras: gold top-right, violet bottom-left. Low alpha, heavily blurred.
  These are **static SVG with a very slow 20s drift** (transform-only), not animated
  on every frame.

**Foreground (top → bottom):**

1. **Glass status bar strip** — App name "MetalWatch" left (Inter 17 / 600 with a
   tiny gold-to-violet gradient on the "W"), live-dot + "Live · updated 12s ago" right.
   Live dot: 6px circle, `semantic/gain` when last fetch < 90s, `text/muted` when stale,
   with a soft glow matching the state.
2. **Hero line** — "Prices in INR / gram" (Inter 13 muted) and a **segmented glass pill
   toggle** `24K · 22K · 18K` (purity is global). Active segment has a white-5% fill
   and inner hairline; inactive is transparent.
3. **Tile grid 2×2** — Gold, Silver, Platinum, Palladium (see anatomy below).
4. **Footer caption** — "Source: Metals-API · Refreshes every 60s" in `text/muted` 11sp.

**Tile anatomy:**

- Glass-card recipe from §6.
- 2px left-edge gradient bar (metal's iridescent gradient), full card height.
- Top row: iridescent swatch (10px rounded square with metal gradient + 1px stroke),
  metal name ("Gold"), and a symbol chip ("XAU" in a 999-radius pill, `glass/surface`,
  text `text/secondary`).
- Price row: Plex Mono 26 in `text/primary`. Example: `₹ 7,284.50`.
- Purity caption: "per gram · 22K" in `text/secondary` 12sp.
- Delta row: ▲ / ▼ glyph (inline SVG, 12px) + absolute + percent, colored
  `semantic/gain` or `semantic/loss`. Example: `▲ ₹42.10  +0.58%`.
- Micro sparkline (24h), 44px tall, 1.75px stroke gradient in direction color, soft
  radial glow beneath (same color @ 18% alpha). Max 24 points, `preserveAspectRatio="none"`.
- Timestamp row: "Updated 14:32" in `text/muted` 11sp uppercase.

**States:**
- **Skeleton:** tile silhouette with `glass/surface` and an animated diagonal sheen
  (linear-gradient stripe sliding across at 1200ms, translate-only).
- **Stale (> 120s):** price at 65% opacity + tiny "Stale" pill in `semantic/loss` tint.
- **Error:** last known price muted + "Retry" text-button with gold underline-on-press.

**Interaction:**
- Tile press: scale to 0.97 (160ms), glow radius bump, release.
- Navigate to Detail with a **shared-element morph**: tile expands into detail hero
  (radius 20 → 28, position springs, 520ms curve `cubic-bezier(0.2, 0.9, 0.1, 1)`).

## 8. Screen 2 — Detail (Graph View)

**Ambient:** same canvas gradient; the selected metal's aurora intensifies (gold for
Gold, violet tint for Palladium, etc.) at 10% alpha, following the chart's gain/loss
direction.

**Layout:**

1. **Glass nav bar** — Back chevron (44×44), metal name centered, kebab right.
   `glass/surface` floating 12px below status bar with 16px side margins (not edge-to-edge).
2. **Hero glass card** (`glass/surface-strong`, 28px radius, 24px padding):
   - Iridescent swatch + metal name + symbol chip.
   - Display price (Plex Mono 44). Price changes cross-fade (200ms) — no odometer.
   - Range delta row: e.g. "1W · ▲ ₹188.20  +2.64%" in direction color.
   - Purity pill toggle `24K · 22K · 18K` aligned right.
3. **Chart** — Victory Native, 240px tall, inside the hero card or a second glass card
   directly below.
   - Line: 2px stroke with a vertical gradient in direction color (light at top, deep at bottom).
   - Soft fill under line: same color, `SVG radialGradient` 24% → 0% alpha.
   - Gridlines: 4 horizontal, 1px `rgba(255,255,255,0.06)`, dashed.
   - Axis labels: Plex Mono 10, `text/muted`.
   - Tooltip on long-press: vertical 1px dashed guide + a small glass pill (`glass/surface`
     blur 16px) with price + timestamp. Tooltip never occludes the last point — flips
     side at 80% of chart width.
   - Data caps (enforced in adapter): 1D ≤ 96 pts, 1W ≤ 84 pts, 1M ≤ 90 pts, 1Y ≤ 120 pts.
4. **Range chips** — `1D  1W  1M  1Y`, 999px pills, 36px tall.
   Active: gold gradient fill, `#0B1020` text. Inactive: `glass/surface`, `text/secondary`.
   Transition: background + color 220ms ease-out, no layout shift.
5. **Stat strip** — 3 columns split by 1px `glass/stroke`:
   **Open · High · Low**. Label Inter 11 uppercase muted; value Plex Mono 16 primary.
6. **Info row** — "Last updated 14:32 · Source: Metals-API" in `text/muted` 11sp.

**Interaction:**
- Range chip tap: chart line morphs — old path fades to 0.25 opacity while new path
  animates its `d` attribute over 400ms (`cubic-bezier(0.2, 0.9, 0.1, 1)`). Axis ticks
  cross-fade.
- Long-press scrub: haptic selection tick per crossed data point (RN `Haptics.selectionAsync`).
- Pull-to-refresh on Detail: glass arc indicator, respects reduced-motion.

## 9. Motion

- **Durations:** micro 160ms, standard 240ms, morphs 400–520ms, aurora drift 20s loop.
- **Curves:**
  - Standard: `cubic-bezier(0.2, 0, 0, 1)`
  - Morph / shared-element: `cubic-bezier(0.2, 0.9, 0.1, 1)`
  - Exits: `ease-out`
- **Transforms/opacity only.** Never animate `width/height/top/left/backdrop-filter radius`.
- **Reduced motion** (RN `AccessibilityInfo.isReduceMotionEnabled`): disable scale-on-press,
  shared-element morph, aurora drift, and chart path morph. Use instant cross-fades.
- **Price update:** 200ms cross-fade. Never an odometer — too expensive cross-platform.

## 10. Iconography

- SVG only, 24×24 viewBox, stroke 1.75px, rounded joins.
- No emojis in the UI.
- Required: arrow-up, arrow-down, chevron-left, more-horizontal, refresh, info.
- Source: Lucide.

## 11. Accessibility

- Contrast: text on glass must test ≥ 4.5:1 against the *darkest* canvas pixel behind it
  (glass reduces contrast — verify with real screenshots).
- Gain/loss: arrow + color + sign, never color alone.
- `accessibilityLabel` per tile: "Gold, 22K, 7284 rupees 50 paise per gram, up 42 rupees
  10 paise, 0.58 percent, updated 14:32."
- Range chips: `radiogroup` with `accessibilityState={{ selected }}`.
- Touch targets ≥ 44×44 everywhere.
- `prefers-reduced-motion` and reduced-transparency respected (fallback to
  `rgba(15,23,42,0.92)` solid when user disables transparency).

## 12. Performance Guardrails (keep it smooth, not cheap)

- Max **2 blur layers per screen** simultaneously. Nav bar + hero card is fine; don't
  nest a blurred modal on top of a blurred card on top of a blurred navbar.
- Blur radius ≤ 32px. `saturate(140%)` is optional juice, skip on older Android.
- Auroras are **static SVG** with a single slow `transform: translate` animation, not
  animated gradients.
- Sparklines and detail chart receive downsampled data from the adapter.
- Memoize `Tile`, `Sparkline`, `RangeChip`. Tile equality keyed on price+delta+purity.
- Skeletons, not spinners.
- Use `expo-blur` `<BlurView intensity={40} tint="dark">`; avoid DIY CSS filter stacks.
- Feature-detect on Android API < 30: swap glass for `rgba(15,23,42,0.88)` solid with
  `glass/stroke` border. Keep the composition identical.

## 13. Deliverables Expected From the Design Tool

1. Landing — default populated (all 4 tiles).
2. Landing — skeleton state.
3. Detail (Gold, 1W) — default, line trending up.
4. Detail — long-press tooltip visible on chart.
5. Purity pill toggle (24K/22K/18K) — active + hover + pressed states.
6. Empty / error tile variant.
7. Shared-element morph keyframes (tile → detail hero) — 3 frames at 0ms / 260ms / 520ms.

## 14. Anti-patterns (do not ship)

- ❌ Rainbow gradient everywhere — auroras are *subtle* ambient, not splash pages.
- ❌ More than two blur surfaces stacked.
- ❌ Animated counting digits (odometer).
- ❌ Emoji icons.
- ❌ Solid-filled tiles in metal color — accent is a bar + swatch, not a background.
- ❌ Arrow-only or color-only direction indicators.
- ❌ Tooltip that occludes the latest data point.
- ❌ Spinners. Skeletons or nothing.

---

## 15. One-paragraph summary for Stitch

> Design a 2-screen React Native app called **MetalWatch** for Indian investors tracking
> gold, silver, platinum, and palladium in INR per gram. Style is **Liquid Glass** on a
> dark navy canvas (`#0B1020`) with two subtle radial auroras (gold top-right, violet
> bottom-left). All cards are translucent glass (`rgba(255,255,255,0.06)` +
> `backdrop-blur(24px)` + 1px white-10% hairline + soft ambient shadow). Typography is
> Inter for UI and IBM Plex Mono with tabular numerals for all prices. Landing is a 2×2
> tile grid; each tile has a 2px iridescent left-edge bar, metal name + symbol chip,
> large mono INR price, ▲/▼ delta in green `#34D399` / red `#F87171`, a flat 24h
> sparkline with a matching soft glow, and a timestamp. A global 24K/22K/18K segmented
> glass pill sits above the grid. Detail screen: glass nav bar, hero glass card with
> giant Plex Mono price and range delta, Victory-Native line chart with gradient stroke
> and radial fill, `1D · 1W · 1M · 1Y` pill chips (active = gold gradient fill), and an
> Open/High/Low stat strip. Tile → detail transition is a shared-element morph
> (radius 20 → 28, 520ms spring). Motion: 160–520ms, transforms/opacity only. All
> premium effects capped at two blur layers per screen with graceful solid fallback on
> older Android; `prefers-reduced-motion` and reduced-transparency respected. No
> emojis, no odometer digits, no spinners, no solid metal-colored tile backgrounds.
