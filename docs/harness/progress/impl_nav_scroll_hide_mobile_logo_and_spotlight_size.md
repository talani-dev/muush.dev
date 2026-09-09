# Implementation — feature 26: nav_scroll_hide_mobile_logo_and_spotlight_size

Branch: `feat/nav-scroll-mobile-logo-spotlight-size` · sdd: false · status left at `reviewing`.

## 1 · Nav hides on downward scroll

New composable `app/features/shell/logic/useNavScrollReveal.ts` (mechanically
modeled on `useCursorSpotlight.ts`: passive scroll listener, rAF-coalesced,
`onScopeDispose` cleanup) exposes `isNavVisible: ComputedRef<boolean>`. It
takes `useMobileMenu()`'s `isOpen` so the menu-open state overrides scroll
direction unconditionally. `SiteNav.vue` binds a `site-nav--hidden` class from
it; CSS applies `transform: translateY(-100%)` with `transition-property:
transform` (removed under `prefers-reduced-motion`). `position: sticky` is
untouched — the transform layers on top of it.

Two named constants in the composable, `REVEAL_ZONE_PX = 80` and
`HIDE_ACCUMULATION_PX = 10` — plain px, not rem tokens, because they compare
directly against `window.scrollY`, same precedent as `useCursorSpotlight.ts`
publishing raw `clientX`/`clientY`.

Unit tests: `app/features/shell/logic/useNavScrollReveal.test.ts` (9 cases,
fake-rAF harness like `useCursorSpotlight.test.ts`). Component-level smoke
test added to `SiteNav.test.ts`.

**CDP verification** (headless Chrome via raw WebSocket, no new dependency —
script in the session scratchpad, not committed), mobile 390×844, against
`pnpm generate`'s `.output/public/es/`:

| scrollY sequence | `.site-nav` transform | Reads as |
|---|---|---|
| 40 (inside 80px zone) | `none` | visible ✓ |
| 0→300 in one jump (>10px past zone) | `matrix(…, -78)` | hidden ✓ |
| 80 (zone edge) | `none` | visible ✓ |
| 80→85 (+5) | `none` | visible, under threshold ✓ |
| 85→88 (+3, total +8) | `none` | visible, still under ✓ |
| 88→92 (+4, total +12) | `matrix(…, -78)` | hidden, crossed 10px ✓ |
| 92→88 (upward) | `none` | visible immediately, no threshold ✓ |
| 88→105 (downward again) | `matrix(…, -78)` | hidden ✓ |
| hamburger clicked while last state was hidden | `none` | forced visible, menu open ✓ |
| `prefers-reduced-motion: reduce` emulated | `transitionProperty: 'none'` | instant, no animation ✓ |

Also confirmed at 1440×900: `getComputedStyle('.site-nav').position === 'sticky'`
(1f, untouched).

## 2 · Mobile logo — isotipo only

`Lockup.vue` gained `hideWordmarkBelowLg?: boolean` (default `false`). When
`true` it wraps the `Wordmark` child in `<span class="hidden lg:inline-flex">`
instead of passing a class into `Wordmark` itself (avoids a same-specificity
utility conflict between `Wordmark`'s own root `inline-flex` and a merged
`hidden`). `SiteNav.vue` passes `hide-wordmark-below-lg`; `SiteFooter.vue`
passes nothing, so its behavior is unchanged in both viewports. Documented in
both files as a recorded human divergence from the `.pen` (Roberto,
2026-09-09) — the frame draws the full wordmark in mobile nav
(`UVyfl`/`Gyzef`/`jEjlk`/`JSjcc`), same treatment class as the earlier
"Proyectos" removal.

Verified in `pnpm generate` output, both locales: nav contains
`hidden lg:inline-flex` around the wordmark and the wordmark text is present
exactly once (in the DOM for the desktop breakpoint, hidden by CSS below
`lg`); footer contains no `hidden lg:inline-flex` and its wordmark renders
normally. Tests added: `Lockup.test.ts` (2 cases), `SiteNav.test.ts` (1 case),
`SiteFooter.test.ts` (1 regression case).

## 3 · Cursor spotlight size

Investigated `CursorSpotlight.vue`: the "outer field" and "core" are two
`radial-gradient()` layers in the **same** `background-image` stack on one
element (`.cursor-spotlight__beam`) — not two redundant elements. `.__lit` is
a separate, genuinely different mechanism (a dot-relighting mask, not a color
gradient). Per Roberto's own wording ("reduce the bigger one, leave the
smaller one"), only `--spotlight-outer-size` was cut — from `41.25rem` (660px,
the confirmed `.pen` value) to `20.625rem` (330px, half) — in
`app/assets/css/global.css`. `--spotlight-core-size` (11.25rem/180px) is
untouched. `.window`'s mask radius and `.lit`'s size derive from
`--spotlight-outer-size` via `var()`, so no component code changed — one
token, documented as a first-pass calibration, not final.

Updated the stale numbers this created in `CursorSpotlight.vue`'s own doc
comments (the "660px" description and the historical fallback-measurement
table), flagging both as either the divergence record or as scale-invariant-
argument-not-exact-figures, rather than silently leaving false documentation.

Before/after screenshots at 1440×900, mouse at a fixed point (720, 450) via
CDP `Input.dispatchMouseEvent` with `pointerType: 'mouse'`: before overrides
the live token back to 660px for comparison, after uses the shipped 330px.
Visually confirms a clearly smaller, more concentrated glow (not subtle).
Screenshots kept in the session scratchpad
(`spotlight-before-660.png` / `spotlight-after-330.png`) for the leader to
show Roberto and confirm whether a second calibration pass is needed.

## Gates

`pnpm check`, `pnpm typecheck`, `pnpm test` (728 tests, 60 files),
`pnpm generate` and `pnpm storybook:build` all pass. `./init.sh` exits 0.
No frozen primitive touched. `feature_list.json` left at `reviewing`.
