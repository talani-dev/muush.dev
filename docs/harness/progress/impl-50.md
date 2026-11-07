# Feature 50 · `mobile_fixes_map_process_footer` — implementation report

Implementer, 2026-11-07, branch `fix/v2-mobile-fixes`. Nothing committed or
pushed, and no branch switched. `feature_list.json` status not touched.
`docs/harness/progress/tracking-plan-49.md` and `feature_list.json` were
already modified when I started; I did not change them.

Screenshots: `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/f50/`
(full file paths are listed in § 5). All of them come from Playwright
**WebKit 26.5** at 390 × 844, `deviceScaleFactor: 3`, `isMobile`. The
before and after builds were each made with `pnpm generate` and served
locally. Playwright was not installed: I used the copy already in the npx
cache (`playwright-core` 1.61.1) with the WebKit build already in
`~/Library/Caches/ms-playwright/webkit-2359`.

---

## 1 · Map: dots stay sharp (`WorldMap.vue`, `MapPin.vue`, `mapGeometry.ts`)

### Root cause: what I could and could not confirm

- **CONFIRMED (code + computed style):** below `lg`, the canvas that holds
  the inlined SVG was laid out at the box's own size (342 px wide) and
  enlarged with `scale: 4.940351` for America / `7.41` for Europe, plus
  `translate`. WebKit's computed style for the old build:
  `scale: 4.940351; translate: -73.68% -99.86%; width: 342px`. The pins
  were counter-scaled with `scale: 0.202415`.
- **NOT REPRODUCED in desktop WebKit.** Playwright WebKit on macOS shows
  sharp dots before the fix: at rest, mid-transition (250 / 450 / 900 ms
  after a tab change) and after switching regions. The edge ramp is about
  1 device px in each case (`mid-before-europe-*.png`, `zoom-before-*.png`).
  This was expected. The blur Roberto saw depends on how iOS Safari
  composites layers (it can rasterize a transformed layer at an unscaled or
  capped contents scale and then magnify that bitmap). macOS WebKit does not
  share that path.
- **iOS Simulator not available.** Xcode is installed, but there are no
  simulator devices or runtimes (`~/Library/Developer/CoreSimulator/Devices`
  holds only `device_set.plist`, and `xcrun simctl list` hung). So the
  leader's hypothesis is still **INFERRED**. It fits the code and the
  screenshot, and the fix removes the mechanism behind it entirely (no
  `scale` transform on the map anywhere). **Needs a check on a real iPhone
  (Roberto) before closing.**

### Fix

- `mapGeometry.ts`: new `regionFrame(region, windowAspect)`, built on the
  existing `regionTransform`. It gives the same fit as a laid-out frame in
  percent of the window: `widthPercent = zoom × 100`,
  `leftPercent = translateX`, and `topPercent = translateY × (470/1408) ×
  aspect`, because `top %` resolves against the box height. The header
  comment explains why.
- `WorldMap.vue`: the canvas below `lg` uses
  `max-lg:w-(--mapa-ancho) max-lg:left-(--mapa-x) max-lg:top-(--mapa-y)`.
  It is laid out at its final size (1689.6 px for America, 2534.4 px for
  Europe), and the SVG paints the dots at that size. The transition moves
  from `transform` to `max-lg:transition-[left,top,width]`, still
  `duration-(--lento) ease-muush motion-reduce:transition-none`. Each map
  point travels linearly, along the same path as before. `--mapa-zoom`,
  `--mapa-tx`, `--mapa-ty` and `--mapa-contra` are gone. The header comment
  has been rewritten (feature 50 paragraph, and "no raster copy").
- `MapPin.vue`: the counter-scale and its transition are removed, since
  there is no zoom left to undo. Pins stay 28 × 28 and ride along with the
  canvas through their `left/top %`. The comment is updated.
- Trade-off: switching regions now animates layout properties (left, top,
  width) on the main thread for 700 ms. Only the visible 342 × 240 clip is
  repainted. I saw no problem in WebKit, but it was not profiled on a phone.

### Verification (WebKit, 390 px, DPR 3)

| Check | Before | After |
|---|---|---|
| Canvas computed `scale` / `translate` | `4.940351` / `-73.68% -99.86%` | `none` / `none` |
| Canvas width / left / top (America) | 342 px / 0 / 0 | 1689.6 px / −252 px / −114 px |
| Pin `scale` | `0.202415` | `none` |
| SVG on-screen size, America / Europe | 1689.6 × 564.0 / 2534.4 × 846.0 | 1689.6 × 564.0 / 2534.4 × 846.0 |
| 9 pin centres, America, Europe, back to America (home and Nosotros) | — | identical to before within 0.1 px (pixel snapping), all 28 px |
| Desktop 1440 map screenshot | — | **pixel-identical** (max diff 0 over 663 168 px); canvas rect and pin positions identical |

There is no raster image of the map: the SVG is still inlined via `?raw`,
and no file was added.

Tests: `mapGeometry.test.ts` has new `regionFrame` cases. Every corner and
the centre of each region lands on the handoff's `iniciarMapa` pixel at
342- and 600-wide windows, and width = zoom × 100. `WorldMap.test.ts`
checks `--mapa-ancho: 494.03` / `741.05`, the new classes, and the absence
of any scale or translate class on the canvas. `MapPin.test.ts` checks
there is no scale class. `tests/static-output.test.ts` (prerendered
America) now matches `--mapa-ancho: 494.03`.

## 2 · "Cómo trabajamos" mobile: steps scale and fade with the scroll

- **Pure maths** (`landing/logic/timelineProgress.ts`):
  - `stepEmphasis(distance, tokens, reducedMotion)`: linear from 1 at the
    active point, through the "one step away" values at distance 1, floored
    at the minimums. Under reduced motion, scale is always 1 and opacity is
    unchanged.
  - `railPosition(stepTops, viewport)`: the pencil line (the existing 65 %
    `PEN_LINE_RATIO`, where the red fill ends) as a continuous step index,
    interpolated across rows of any height. Clamped to the first and last
    steps, so the list never sits entirely at the floor when you arrive at
    it or scroll past it.
  - `emphasisAlongRail(...)` combines the two.
  - `NEUTRAL_EMPHASIS` = `{1, 1}`.
- **Tokens** (`global.css` `:root`, next to `--paso-escala`, with a comment
  saying they are for Roberto to tune): `--paso-enfasis-escala-vecino: 0.92`,
  `--paso-enfasis-opacidad-vecino: 0.45`, `--paso-enfasis-escala-min: 0.9`,
  `--paso-enfasis-opacidad-min: 0.35`. The active step's 1 / 1 is the
  identity, so it is not a token. `useTimelineProgress` reads the tokens
  off `:root` once listening starts. If they cannot be read, every step
  stays whole.
- **Composable** (`useTimelineProgress.ts`): returns `emphasis` alongside
  `lit` and `fills`. On the server, without scripting, and from `lg`, it is
  neutral. **Behaviour change (needed for "reduced motion: opacity only"):**
  the scroll listener now runs under reduced motion too, so the fade can
  follow the scroll. The rail itself still stays full under reduced motion,
  exactly as before, and the emphasis drops its scale. The two existing
  tests that asserted "no listener under reduced motion" were rewritten to
  match.
- **UI**: `ProcessStep.vue` has a new optional `emphasis` prop. The text
  block (number + title, description, chip; not the rail) gets
  `--paso-texto-escala` / `--paso-texto-opacidad` inline and the classes
  `max-lg:scale-(…) max-lg:opacity-(…) origin-top-left
  transition-[scale,opacity] duration-(--progreso-paso) ease-linear
  motion-reduce:transition-none`. It uses the same 120 ms linear catch-up
  as the rail fill, which is 0 ms under reduced motion. I used
  `origin-top-left` rather than `origin-left` (centre-left): the block only
  shrinks towards the rail, and its top stays aligned with the dot. From
  `lg` the block is `contents`, so nothing changes on desktop.
  `ProcessTimeline.vue` passes `emphasis[index]`. Both header comments are
  updated.
- **Verified in WebKit 390** with the pencil halfway between steps 03 and
  04: computed `scale / opacity` for 01..05 = `0.9/0.35, 0.9/0.35,
  0.960/0.726, 0.960/0.724, 0.9/0.35`. Every row is still 112 px tall
  (no layout shift), and every text block's left edge is still x = 52
  (inside the gutter). Under `reducedMotion: 'reduce'`, every scale is 1,
  the opacities are identical to the above, and the rail is full.
- Tests: 14 new pure-function cases in `timelineProgress.test.ts`
  (distance 0, ±1, 0.5, floors, reduced motion, tuned tokens, railPosition
  including uneven rows, clamping and zero height). 5 new composable cases
  (SSR neutral, proportional, reduced motion fade-only, missing tokens,
  desktop neutral). 1 new `ProcessTimeline` case (emphasis passed through
  in order). 2 new `ProcessStep` cases. Stories: `EsDimmedMobile390` and
  `EnDimmedMobile390` in `ProcessStep.stories.ts`, and the
  `ProcessTimeline` story description is updated.
- Desktop hover / focus code is untouched, and all its existing tests pass.

## 3 · Mobile footer: tap areas (`MobileFooter.vue`)

- Each entry of the links line, and both legal links, gets the `TAP` class
  constant: `inline-flex min-h-toque min-w-toque items-center
  justify-center px-toque-x` (44 × 44 minimum, 8 px either side of the
  label). Entries sit in a wrapping flex row (`flex flex-wrap items-center`)
  so no two areas overlap. The `" · "` separator is unchanged (aria-hidden
  span, now `whitespace-pre` so its spaces survive inside flex).
- Tokens (`global.css`): `--toque: 2.75rem` in `:root`, plus `@theme`
  `--spacing-toque`, `--spacing-toque-x: 0.5rem`, and
  `--spacing-toque-sangria: calc((var(--toque) - 1lh) / 2)`. The lists pull
  back by the padding (`-mx-toque-x`) so the first label still starts at
  the 24 px gutter. The links line also pulls back by half the extra height
  (`-my-toque-sangria`) so the 24 px block rhythm holds. The legal row only
  pulls back upwards (`-mt-`): a downward pull would slide the copyright
  over the links, and the copyright, being later in the page, would take
  those taps.
- **Deviation:** I removed `rounded-control` from the links line. A border
  radius also clips hit-testing, and with 12 px corners `elementFromPoint`
  at the link's corners returned the parent `<li>`, so less than 44 × 44
  was actually tappable. Only the keyboard focus outline's corners change
  (now square), and only below `lg`. The legal links never had it. A
  comment in the component explains this.
- The `data-footer-enlaces` / `data-footer-legal` hooks are deliberately
  not `data-en…`: `tests/not-found-output.test.ts` forbids `/data-en/` in
  the 404 HTML, and my first name (`data-enlaces`) tripped it.
- **Verified in WebKit 390, ES and EN:** all 9 entries per locale are
  44 px tall and 46–162 px wide, with **0 overlaps**. Hit tests at the
  corners and centre of every link return the link itself. Label text
  starts at x = 24 in both lists. Type and colour are unchanged
  (15 px Blanco 70 %, 12 px Gris 400). Visible effect: wider gaps around
  each `·`, and 44 px per wrapped row. The ES line now wraps 3 / 3 / 1
  instead of 4 / 3 + wrap, and the footer is about 85 px taller at 390.
- Tests: 2 new cases (tap classes on all 7 entries, 6 separators, no
  radius; legal tap classes, `-mt` only). The story description is updated.

## 4 · Commands

| Command | Result |
|---|---|
| `pnpm check` | pass (0 errors) |
| `pnpm typecheck` | pass |
| `pnpm test` | pass — 222 files, 3052 tests |
| `pnpm generate` | pass |
| `pnpm storybook:build` | pass |
| `./init.sh` | exit 0, "Environment ready" (it re-runs all of the above) |

## 5 · Screenshots (WebKit 26.5, 390 px, DPR 3 unless noted)

Map, home (`/es/`):
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/f50/map-after-america.png`
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/f50/map-after-europe.png`
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/f50/map-after-america-after-switch.png`
- before counterparts: `…/f50/map-before-america.png`, `…/f50/map-before-europe.png`, `…/f50/map-before-america-after-switch.png`
- Nosotros: `…/f50/map-after-nosotros-{america,europe,america-after-switch}.png` (and `map-before-nosotros-*`)
- Desktop 1440 (DPR 1), pixel-identical: `…/f50/map-before-desktop1440.png`, `…/f50/map-after-desktop1440.png`
- Repro attempt, old build mid-transition: `…/f50/mid-before-europe-{250,450,900,3000}ms.png`; magnified crops `…/f50/zoom-*.png`

Process timeline, pencil halfway between steps 03 and 04:
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/f50/process-midscroll-390.png` (the list)
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/f50/process-midscroll-390-viewport.png` (viewport; the cookie banner covers the bottom)
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/f50/process-reduced-motion-390.png` (+ `-viewport`)

Mobile footer (`/es/`, cookie banner dismissed in the throwaway context):
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/f50/footer-after-390.png`
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/f50/footer-after-390-tap-areas.png` (tap areas outlined in green)
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/f50/footer-before-390.png`

## 6 · Open items for the leader

1. **Map blur on a real iPhone: UNVERIFIED.** It does not reproduce in
   desktop WebKit, and no iOS simulator runtime is installed. The fix
   removes the scale transform (confirmed by computed style), but Roberto
   should confirm on his iPhone, in both regions and after switching.
2. **Reduced-motion reading for fix 2:** I applied "only opacity changes"
   literally, so the fade follows the scroll under reduced motion while the
   rail stays full. If Roberto meant "no scroll effect at all under reduced
   motion", that is a one-line change in `useTimelineProgress`.
3. **`.pen` follow-up (rules.md § R32):** the step emphasis and the footer
   tap spacing are Roberto's direct instructions and are not drawn in the
   `.pen`. The leader should pass them to Clau, along with the footer's new
   height at 390 (+~85 px) and the 3 / 3 / 1 wrap.
4. Focus outline corners on the mobile footer links line are now square
   (see § 3 deviation).
5. Possible business rule to raise with a human (not written anywhere by
   me): "text links on mobile need 44 × 44 tap areas" would apply equally
   to other link lines on the site.

## 7 · Review follow-up (review-50 low findings 3 and 4)

- **(3) Desktop canvas transition.** `WorldMap.vue`: `duration-(--lento)`
  and `ease-muush` are now `max-lg:`. A duration with no transition
  property transitions `all`. Checked with WebKit computed style on the
  new build: at 390 it is `left, top, width` / `0.7s` / Muush ease; at
  1440 it is `all` / `0s` / `ease`, so nothing animates on desktop. The
  header comment explains this. `WorldMap.test.ts` asserts the `max-lg:`
  classes and adds a case checking there is no bare duration or ease.
- **(4) Neutral array on every desktop frame.** `useTimelineProgress.ts`:
  `emphasis` is now a `shallowRef`, so its entries stay raw and
  `NEUTRAL_EMPHASIS` can be recognised by identity. A new
  `resetEmphasis()` skips the write when every step is already neutral. It
  is used from `lg` and when the tokens are missing. Two new tests: from
  `lg`, two scroll frames leave the same array (`toBe`); crossing to `lg`
  after an emphasis resets to whole once, and the next frame keeps that
  array.
- Commands: `pnpm check` 0, `pnpm typecheck` 0, `pnpm generate` 0,
  `pnpm test` 0 (222 files, 3055 tests). No commit.

## 8 · Cursor (item 4, Roberto 2026-11-07)

- `public/cursor/you.svg` now carries the drawing from Roberto's
  `02-Mouse.svg` (the source file was only read, never modified). The
  full-size `<rect width="32" height="32" fill="white"/>` is removed. The
  root is `width="64" height="64" viewBox="0 0 32 32"`. The pill rect, the
  "You" path and the rounded arrow path are byte-identical to the source
  and in its order (checked with `diff`). Colours are `#E5352F` (Red muush
  500) and white. The provenance comment is rewritten (02-Mouse.svg,
  feature 50, what changed, hotspot reasoning) and contains no `--`. WebKit
  decodes the shipped file as a 64 × 64 image.
- **Hotspot kept at `1 9`; both `--cursor-brand` values unchanged.** I
  rendered the old and new files in WebKit at ×8. The new tip keeps the
  same vertex (≈1.01, 5.01 in the viewBox, i.e. (2, 10) in 64 space), but
  the rounding pulls the painted point in by about one pixel:
  - Old outermost painted tip: ≈(0.25, 8.25), with pixel (0, 8) 36 %
    covered.
  - New: pixel (0, 8) is empty, and pixel (1, 9) is the outermost painted
    pixel of the tip, 77 % covered. Pixel (2, 10) is 100 % covered.

  So `1 9` lands on the visible point of the new arrow. `2 10` would sit
  one pixel inside it. The reasoning is in the `global.css` comment (the
  feature 34 cursor block, extended) and in the SVG comment.
- `tests/brand-cursor.test.ts`: existing assertions unchanged and green
  (64/64/viewBox, no background rect, 1 rect + 2 paths, red pinned to the
  token, `1 9` hotspot). One new case checks that the rounded arrow path is
  present, the feature 34 arrow is gone, and the comment names
  02-Mouse.svg.
- Commands: `pnpm check` 0, `pnpm typecheck` 0, `pnpm generate` 0
  (`.output/public/cursor/you.svg` is identical to the source file),
  `pnpm test` 0 (222 files, 3056 tests). No commit.
- Not checked: how the cursor looks under a real pointer in Safari, Chrome
  or Firefox, which is the feature 34 manual matrix. Roberto should glance
  at it on desktop.
