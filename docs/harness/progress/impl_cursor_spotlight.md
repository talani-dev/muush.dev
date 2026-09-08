# Implementation · Feature 008 · `cursor_spotlight`

- **Branch**: `feat/cursor-spotlight`
- **Agent**: `implementer`
- **Started**: 2026-09-07
- **Spec package**: `specs/008-cursor-spotlight/`

---

## T001 · Before-state (SC-012 baseline)

The five gates on the untouched branch, before any file of this feature was
written. Everything below has to still be true at the end, with **additions
only**.

| Gate | Result |
|---|---|
| `pnpm check` | ✅ `Checked 97 files in 22ms. No fixes applied.` exit 0 |
| `pnpm typecheck` | ✅ no output, exit 0 |
| `pnpm test` | ✅ **Test Files 22 passed (22) · Tests 242 passed (242)** |
| `pnpm generate` | ✅ `Prerendered 12 routes` → `.output/public` |
| `pnpm storybook:build` | ✅ `Storybook build completed successfully` |

No file was changed by this task.

---

## T002–T003 · The harness proved before it is trusted (R39)

`vitest.config.ts`'s `include` gained `'app/shared/logic/**/*.test.ts'`, then a
single deliberately failing assertion was placed in
`app/shared/logic/useCursorSpotlight.test.ts` and `pnpm test` was run. Recorded
output:

```
 FAIL  |happy-dom| app/shared/logic/useCursorSpotlight.test.ts > useCursorSpotlight
   > should be collected by vitest when placed in app/shared/logic
 AssertionError: expected true to be false // Object.is equality

 Test Files  1 failed | 22 passed (23)
      Tests  1 failed | 242 passed (243)
```

**The file count moved 22 → 23 and the run named the file.** That is the proof
§ R39 asks for: before this edit the same file would have produced
`22 passed (22)` and a green run. The failing assertion is replaced by the real
suite in T011.

---

## What was built

| File | Change |
|---|---|
| `app/assets/css/global.css` | **+9 tokens**, `--layer-glow` `-2`→`-3`, `--layer-dots` `-1`→`-2`, new `--layer-spotlight: -1` |
| `app/shared/logic/useCursorSpotlight.ts` | **new** — every listener, both media conditions, rAF coalescing, teardown |
| `app/shared/logic/useCursorSpotlight.test.ts` | **new** — 15 tests |
| `app/shared/ui/CursorSpotlight.vue` | **new** — root → beam → window → lit; no props, no imports |
| `app/shared/ui/CursorSpotlight.test.ts` | **new** — 14 tests |
| `app/shared/ui/CursorSpotlight.stories.ts` | **new** — `Pinned` + `Live` |
| `app/layouts/default.vue` | ref + composable + `<CursorSpotlight v-if>`, stack table updated |
| `app/shared/ui/DotGrid.stories.ts` · `SectionBackdrop.stories.ts` | **doc comment only** — the level numbers |
| `tests/static-output.test.ts` | **additive** — 4 route assertions + 1 stylesheet assertion |
| `vitest.config.ts` | `include` gains `app/shared/logic/**/*.test.ts` |
| `docs/business/rules.md` | R37's caveat lifted; **R40–R44** appended |

`DotGrid.vue`, `SectionBackdrop.vue`, `SectionGlow.vue`, `SectionGlow.stories.ts`,
`SectionGlow.test.ts` and `i18n/` show **zero changed lines** (T026, verified by
`git diff`). No file under `docs/business/` other than `rules.md` was touched.

---

## Phase 6 · What was measured, and in which browser

**Method.** Chrome 4 (`/Applications/Google Chrome.app`, `--headless=new`)
driven over the DevTools protocol from a ~80-line Node client using Node 24's
built-in `WebSocket` — **no new dependency, no Playwright** (Article X). The
artefact under test was `.output/public` from a real `pnpm generate`, served
over HTTP. The layout viewport was fixed with
`Emulation.setDeviceMetricsOverride`, **not** with `--window-size`, which
`rules.md` § R34 records as unreliable. Every number below was read from inside
the page or from Chrome's own trace; nothing was judged from a picture.

### T022 · Paint order, registration, and `mod()`

| Claim | Measured |
|---|---|
| Spotlight level | `z-index: -1` on `.cursor-spotlight` |
| Dot sheet | `z-index: -2` |
| Section backdrop | `z-index: -3` — measured in the built catalogue, because **no page on the site renders a section yet** (feature 006 shipped the mechanism; the sections are later features). Stated as a limit, not glossed |
| Content | `auto`; layout root `position: relative`, `isolation: isolate` |
| Beam geometry | 660×660, `transform: matrix(1,0,0,1,700,400)` with the pointer at (700, 400) — the beam's **centre** is the pointer hotspot (A-04) |
| Mask radius | `radial-gradient(330px, …)` — exactly the light's radius (FR-008) |
| `mod()` resolved | lit sheet `transform: matrix(1,0,0,1,-10,-22)`; (700−330) mod 24 = 10 and (400−330) mod 24 = 22. **Never `none`**, which is what an unsupported `mod()` would have produced |
| Registration | lit-sheet origin ≡ dot-sheet origin (mod 24) — offset `[0, 0]` at four pointer positions |
| Pointer never intercepted | `document.elementFromPoint` at the cursor returns page content, not the layer |

### T022 · Scroll (SC-006 and A-05)

The stub pages are one viewport tall, so a 3000px spacer was injected to make
the document scrollable — declared, because it means the scroll case was
verified on the mechanism rather than on shipped content.

| scrollY | Beam centre in viewport | Lit registration | `scrollHeight` |
|---|---|---|---|
| 0 | (700, 400) | `[0, 0]` | 3551 |
| 600 | (700, 400) | `[0, 0]` | 3551 |
| 1500 | (700, 400) | `[0, 0]` | 3551 |

The light stays exactly under a still cursor while the page moves, and the
document does not grow. `scrollWidth`/`scrollHeight` were also identical
(1440 × 900) with the pointer at the page centre and at all four extremes.

### T022 · SC-002 — the dots really are brighter *and* more distinct

Pixels decoded from a `Page.captureScreenshot` PNG at coordinates the 24px grid
predicts. This is a **colour** measurement at known coordinates, which § R34
does not forbid; it forbids inferring *layout* from a capture.

| Where | Dot luma | Paper luma | Gap |
|---|---|---|---|
| Inside the core | **84.1** | 55.1 | **29.0** |
| Inside the field (~200px out) | 67.8 | 42.0 | 25.8 |
| Just outside (~370px out) | 60.0 | 38.0 | 22.0 |
| Far outside | 60.0 | 38.0 | 22.0 |

Inside the radius the dots are both brighter (84 vs 60) **and** more distinct
(gap 29 vs 22) — the two halves `ui-map.md:271` asks for. **The spec's derived
value was exact**: § *The dot-brightening decision* predicted a lit dot at
≈133 R against ≈109; the measured pixel at a lit dot centre is
`rgb(133, 43, 56)`, and the unlit baseline it predicted (59 on 38, gap 21) came
out 60 on 38, gap 22.

**No doubled dots at the boundary.** Scanning a dot row from 132px inside the
radius to 348px outside it, the brightest pixel in every one of 21 consecutive
24px cells sits within **1px** of the predicted `12 + 24k` position — the ±1
is a 2.5px dot straddling a pixel boundary, tilted by the light's own gradient,
not a phase shift. Outside the core the peak-to-peak spacing is exactly 24px,
fourteen times in a row, straight across the radius edge.

### T023 · The frame budget (spec A-11 — a measurement, not an assumption)

Two five-second traces of continuous pointer movement at ~430 events/second,
the second with `prefers-reduced-motion: reduce` emulated so the effect does
not exist. The difference is this feature's cost.

| Trace counter | Effect running | Control (off) |
|---|---|---|
| Pointer events dispatched | 2147 | 2148 |
| `RequestAnimationFrame` / `FireAnimationFrame` | **301 / 301** | 0 / 0 |
| `Layout` | **0** | 0 |
| `Paint` / `PaintImage` | **0 / 0** | 0 / 0 |
| `UpdateLayoutTree` (style recalc) | **301** | 0 |
| `Blink.ForcedStyleAndLayout` | **2147** | 2148 |
| `Commit` (compositor) | 305 | 301 |

- **2147 events → 301 updates over 5s ≈ one per frame at 60Hz.** FR-020 and
  SC-005 confirmed by count, not by construction.
- **Zero layout and zero paint** attributable to the layer. Per frame the
  effect costs one style resolution and a composite, which is exactly what
  `research.md` § R2 designed for and A-11 required to be proven.
- Forced style-and-layout is **identical with the effect on and off** (2147 vs
  2148, one per pointer event) — that baseline is Chrome hit-testing a moving
  mouse and happens either way. **This took a fix**: see *Deviations* below.
- Scrolling ran at 61 frames per second, and every listener is reported by
  Chrome as `passive: true` (`pointermove`, `scroll`, `resize` on `window`;
  `pointerenter`, `pointerleave` on `documentElement`).

### T024 · The three off-states, and the live flip

| State | Spotlight elements | Listeners attached |
|---|---|---|
| Desktop, mouse | 1 | 5, all `passive: true` |
| `prefers-reduced-motion: reduce` on load | **0** | **0** |
| Touch (390×844, touch emulation; `(hover:hover) and (pointer:fine)` = `false`) | **0** | **0** |
| Scripting disabled | **0** | n/a |

Under reduced motion the background is exactly feature 006's: the dot sheet is
present at `z-index: -2` with a 24px grid, the layout root paints
`rgb(38, 38, 38)` = ink-500, and the host carries **no `style` attribute at
all** — nothing of this feature is written anywhere. With scripting disabled the
nav, the dot grid and the footer are all present and no spotlight element
exists.

**FR-013, without a reload**: with the page open and the effect running,
emulating `prefers-reduced-motion: reduce` took the element count 1 → 0, emptied
the host's inline properties and removed every listener; restoring the
preference and moving the mouse took it back to 1. No navigation occurred.

### T025 · Behavioural edge cases

| Case | Observed |
|---|---|
| Reload without moving the mouse | no element, host `style` attribute is `null` — **no red blob** (A-07) |
| After the first move | `opacity: 1`, `transition-duration: 0.2s` (the token) |
| Pointer leaves the window | element **stays mounted**, computed `opacity: 0`, `--spotlight-opacity: 0` — it fades rather than freezing or remounting |
| Nav link hit test | returns an element inside the link; the layer intercepts nothing |
| Accessibility | `aria-hidden="true"`, `tabIndex` `-1` |
| `/en/` and `/es/nosotros/` | beam centre exactly (640, 360) with the pointer at (640, 360) — identical on both pages and both locales |

---

## Deviations from the plan, and why

1. **The hot path no longer reads `window.scrollX`/`scrollY`.** `research.md`
   § R2 and task T009 asked for the scroll offset to be read inside the frame,
   before the writes. The first trace showed ~600 forced style updates over five
   seconds against the control — two per frame, one per axis. A rAF callback runs
   *before* the frame's style pass, so the read flushes whatever the previous
   frame's write invalidated, whichever order the two appear in. The offset is
   now cached from the `scroll` handler and at activation; the retrace shows the
   attributable count at **zero**. Recorded as `rules.md` § R41.

2. **`--spotlight-x` / `--spotlight-y` fall back to a length, not to `50%`.**
   `contracts/components.md` § 1 specified `50%`. The change is right; **the
   reason first recorded here was wrong and the reviewer was correct to reject
   it.**

   *What I claimed and could not support*: that a percentage inside `mod()`
   would silently invalidate the whole `transform`. **False.** Measured in
   Chrome, `CSS.supports('transform', 'translate3d(calc(-1 * mod(calc(50% -
   330px), 24px)), 0px, 0)')` returns `true`, and forcing the `50%` fallback in
   situ yields valid matrices on both elements, never `none`. I had inferred it
   from `research.md` § R3's warning instead of measuring it.

   *The reason that does verify*: **a percentage resolves against each
   element's own box**, and the two elements that consume `--spotlight-beam-*`
   are different sizes — the beam is 660px, the lit sheet 756px (the beam plus
   two dot steps of bleed per side, measured). The same `50%` is therefore
   330px where the light uses it and 378px where the registration uses it, so
   the two halves stop agreeing on where the beam is.

   I built a test that can tell the two hypotheses apart, because the
   reviewer's `50%` measurement cannot: at `50%` both predict a lit translate
   of `0` (378 − 330 = 48, and 48 ≡ 0 mod 24), so it is unfalsifiable at that
   value. `55%` separates them, with `--spotlight-x` removed so the fallback is
   what runs:

   | Fallback | Beam translate | Lit translate | Correct value |
   |---|---|---|---|
   | `50%` | 330 | 0 | 0 — agrees **by coincidence** |
   | `55%` | 363 | **−13.8** | −9 — **wrong by 4.8px** |
   | `var(--spotlight-outer-size)` (shipped) | 660 | −18 | −18 ✓ |

   −13.8 = `mod(0.55 × 756 − 330, 24)`, i.e. the lit sheet's **own** box; the
   competing hypothesis (the declaring beam's 660px box) predicts −9. So the
   percentage resolves against the using element, confirmed. `50%` only looks
   correct because the bleed happens to total exactly two dot steps — relying
   on that coincidence is the registration fragility FR-006 exists to forbid.
   The path is unreachable in production (the `v-if` needs a published position
   and the pinned story sets one), so this is latent, which is why the fix is a
   comment and not code. Behaviour with the properties set — always, on the
   site and in both stories — is unchanged.

3. **The lit sheet's mask is two stops, not three.** FR-008 requires the lit
   dots to "fade out over the same radius as the light"; the mask therefore runs
   opaque → transparent over exactly `--spotlight-outer-size / 2` (measured:
   `radial-gradient(330px, …)`). Matching the light's *curve* as well as its
   radius would have meant a fourth derived percentage with no source. The
   consequence is that the lit dots fade slightly more slowly than the light
   between the mid stop and the edge. It is a tuning question and belongs with
   A-03, whose owner is Clau.

4. **`useCursorSpotlight.test.ts` mounts a one-line component instead of using
   `effectScope()`.** `research.md` § R6 assumed a bare `effectScope()`, but the
   composable starts in `onMounted` — the SSR-safe placement its own contract
   requires — and `onMounted` never runs without a component instance. Unmounting
   provides the same scope disposal. Everything else of § R6 is as written: a
   controllable `matchMedia`, a hand-flushed rAF queue, and a plain detached
   `<div>` as the host.

5. **`tests/static-output.test.ts` asserts on the `<body>`, not the document.**
   The obvious assertion failed on all four routes and the feature was correct:
   Nuxt inlines a component's scoped CSS into every prerendered page in the
   route's module graph whether or not it renders. Recorded as `rules.md` § R40.

---

## T028 · What could not be sourced — owner **Clau**

| Item | Where it stands |
|---|---|
| `--dot-paper-lit-color` (spec **A-03**, `rules.md` § R38) | **UNVERIFIED.** No document states how bright a lit dot is, and a static mockup structurally cannot draw a pointer-dependent brightness. Implemented as the base recipe painted twice, which **derives** `1 − (1 − 0.12)² = 22.6%`; the derivation was measured and matched exactly (`rgb(133, 43, 56)`). It is a named token so a value from Clau costs one line. |
| `--duration-spotlight-fade` (spec **A-08**) | **UNVERIFIED.** The design specifies no timing, exactly as it specified none for the radar ping. `0.2s`, from a token, pending sign-off. |
| **D-01** — `ui-map.md:270` omits the outer field's mid stop | The frame draws three stops (42% at 0, 17% at 0.42, transparent at 1); the document describes one value. The design file wins (§ R32) and the implementation has three stops. **Correcting `ui-map.md` is Clau's** — `docs/business/` outside `rules.md` is not in this cycle's write scope, and it was not touched. |

Also worth Clau's eye: the mask falloff in *Deviations* § 3, which travels with
A-03.

---

## Limits of what was verified

- **`z-index: -3` was measured in the catalogue, not on the site**, because no
  page renders a `SectionBackdrop` yet. The site's own stack was measured as
  `-2` (dots) / `-1` (spotlight) / `auto` (content).
- **Scrolling was verified with an injected spacer**, because both stub pages
  are one viewport tall. The mechanism is what was measured.
- **One browser.** Everything above is Chrome on macOS. `mod()`, `mask-image`
  and `overflow: clip` are not verified in Safari or Firefox by anything here,
  and this repository has no cross-browser harness. The riskiest of the three is
  `mod()`: where it is unsupported the whole `transform` declaration invalidates
  and the lit dots would show doubled — `research.md` § R3 has the fallback
  written and costed. **Now also recorded as `rules.md` § R45**, since a
  progress report is not where the next agent will look.
- **Nothing was judged by eye.** No claim in this document rests on a screenshot
  looking right.

---

## T029 · After-state — the five gates

| Gate | Before (T001) | After |
|---|---|---|
| `pnpm check` | 97 files, exit 0 | **102 files**, exit 0 |
| `pnpm typecheck` | exit 0 | exit 0 |
| `pnpm test` | **22 files · 242 tests** | **24 files · 276 tests**, all green |
| `pnpm generate` | 12 routes | 12 routes |
| `pnpm storybook:build` | success | success |
| `./init.sh` | — | **exit 0** |

**+2 test files, +34 tests, and not one existing test modified, removed or
weakened.** The only edit to an existing test file is the five additive
assertions in `tests/static-output.test.ts` (SC-012). `SectionGlow.test.ts`,
`DotGrid.test.ts`, `SectionBackdrop.test.ts` and `tests/i18n-parity.test.ts`
pass unmodified.

**Status left at `in_progress`.** The `reviewer` gate has not run; moving the
feature is not this agent's call.

---

## Review round 1 — rejected on one point, corrected 2026-09-07

Verdict: `docs/harness/progress/review_cursor_spotlight.md`. The reviewer
verified the frozen files, R36–R39 (mutation-testing the composable's suite and
restoring it byte-identical), SC-002, SC-005, SC-006, the scroll case and all
three off-states, and independently reproduced deviation 1 at ≈609 forced
updates per 5s against my ≈600. Deviations 1 and 3 accepted.

**The one required change — deviation 2's recorded reason, not its code.** I had
written that a `50%` fallback would silently invalidate the `transform`. That is
false and I had not measured it; I inferred it from `research.md` § R3's
warning. Corrected in both places with the reason that does verify, plus a
discriminating measurement the reviewer's own `50%` test could not provide (see
*Deviations* § 2). **No code changed.**

Two non-blocking items handled in the same pass:

- **Article V's 200-line limit.** The file is over it and `plan.md` line 111 had
  estimated "~90 lines". The component is **not** restructured — splitting it
  would break the `--spotlight-beam-*` inheritance chain. The exception is now
  recorded in two places: at the top of `CursorSpotlight.vue`, where an agent
  reading Article V against the file will hit it, and as a fourth row in
  `plan.md`'s Complexity Tracking table, which is where the Constitution's
  *Compliance Review* says a justification must live.
- **The single-browser limit** moved out of this report and into
  `docs/business/rules.md` as **§ R45**, naming each of the three declarations,
  what happens where it is unsupported, and where the costed fallback is.

Gates re-run after the corrections: `check` (102 files), `typecheck`, `test`
(**24 files / 276 tests**, unchanged), `generate`, `storybook:build`, and
`./init.sh` **exit 0**. Status left at `in_progress`.
