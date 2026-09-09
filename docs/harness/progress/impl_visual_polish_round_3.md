# Implementation report — feature 24 `visual_polish_round_2`, round 3

Post-merge feedback from Roberto on item 1 (Propósito) only, branch
`fix/purpose-arc-reach-and-pill`. The other 5 items already approved in
round 2 are untouched.

## Investigation — the real cause of the arc's short reach

CDP measurement (`pnpm generate` + headless Chrome via raw CDP over
`ws://`, `Emulation.setDeviceMetricsOverride` at 1440×1400, no Playwright)
against `.output/public/es/#proposito`:

- `.arcs` (the wrapper carrying `overflow-clip`) reported `left: 79.98,
  width: 1280` — i.e. it was clipped to the SECTION's own content box
  (inset by `<main>`'s `px-page`, 80px each side), not to the `.pen`'s full
  1440px frame.
- The origin itself (each `.arc`'s own box centre) sits at viewport
  `x ≈ -100.02, y ≈ 44.24` — off the LEFT edge of the section by design
  (`--purpose-arc-origin-x: -14.0625%` of the 1280px section box = -180px
  section-relative, which the `.pen`'s own frame-to-section coordinate
  mapping confirms is correct). This math was NOT the bug.
- Given that origin and the 1280px clip, I computed where each arc's visible
  curve (after `clip-path: inset(50% 0 0 50%)`) actually got cut by the
  wrapper: arc-why at `(x=79.98, y=517.9)`, arc-how at `(x=79.98, y=802.6)` —
  both cut by the wrapper's LEFT edge, 80px short of the `.pen`'s own frame
  edge (viewport x=0, since the frame is exactly 1440px = the viewport at
  that width). arc-what's cut point is `(x≈447, y≈926)` — bound by the
  section's own HEIGHT, not its width; that one is correct as-is (the `.pen`
  frame is only 900 tall and the arcs "se salen del frame" by design).

This is the same class of bug already fixed for Servicios' `.canvas`
(feature 23 item 4, `ServicesConstellation.vue`): a wrapper anchored to
`<main>`'s padded content box (1280) instead of its border box (1440, the
frame). Unlike Servicios, Propósito's arcs use PERCENTAGE positioning
(`--purpose-arc-origin-x` etc., against the 1280px box, deliberately — they
scale with width) — so I could not just widen `.arcs` itself, that would
have changed the percentage basis and moved the origin.

## Fix

Split `.arcs` into two nested elements (`PurposeSection.vue`):

- `.arcs-clip` (outer, new): carries `overflow-clip`, `absolute inset-0`,
  `hidden lg:block`, `aria-hidden`. Widened via `width: min(var(--spacing-
  shell-max), calc(100% + 2 * var(--spacing-page)))` and `margin-inline:
  calc(-1 * var(--spacing-page))` — the exact formula already reviewed for
  Servicios' `.canvas`, reused via the shared `--spacing-shell-max` token
  (not the services-namespaced `--services-canvas-w`).
- `.arcs` (inner, unchanged box): `position: absolute; left: var(--spacing-
  page); width: calc(100% - 2 * var(--spacing-page))` relative to the outer
  — this lands it on the exact same box it always had (1280px, same left
  offset), so every `--purpose-arc-*` percentage keeps its old value and
  meaning. Still holds the three `.arc-why/-how/-what` spans as its direct
  children (`.arcs > *` unchanged).

No token changed value except the Pill nudge (item 1b, below). No
`--purpose-arc-origin-x`, `--purpose-origin-y` or arc-diameter token was
touched, and `usePurposeArcRadii.ts` needed no change: it still selects
`.arcs` for its zero-rect guard, and a box whose ANCESTOR is `display: none`
below `lg` still reports a zero rect regardless of its own class — verified
by CDP at 390px (see below).

Updated `PurposeSection.test.ts`'s clip-wrapper assertions to check
`.arcs-clip` instead of `.arcs` for the clip-related classes; the
"arcs before both compositions" ordering check and the "one origin, three
radii" check (`.arcs > *`) needed no change.

## Item 1b — Pill nudge, third calibration

`-1.375rem` (22px, round 2's value) was still "not enough" per Roberto.
Raised to `-3.75rem` (60px) — more than double the previous nudge,
deliberately large per the instruction to prefer overshooting a third time.
Final Pill top at 1440px: 194.2px (was 232.2px), comfortably clear of the
pinned nav's ~102.8px height (`findings.md` § R55).

## CDP verification (before → after, 1440×1400, fresh `pnpm generate`)

| Measure | Before | After |
|---|---|---|
| `.arcs` wrapper clip box | left 79.98, width 1280 (= section) | n/a — clip moved to `.arcs-clip` |
| `.arcs-clip` clip box | (didn't exist) | left 0, width 1440 (= `<main>`'s border box / `.pen` frame) |
| `.arcs` (inner) box | left 79.98, width 1280 | left 79.98, width 1280 — **unchanged** |
| Origin (`.arc-why` box centre) | (-100.02, 44.24) | (-100.02, 44.24) — **unchanged** |
| Radar centres (Why/How/What) | (250,410) (400,641) (550,853) | identical — **unchanged** |
| arc-why visible cutoff | (79.98, 517.9) | (0, 541.0) — 80px further left, 23px further down |
| arc-how visible cutoff | (79.98, 802.6) | (0, 817.1) — 80px further left, 14.5px further down |
| arc-what visible cutoff | (≈447, ≈926, bound by section height) | unchanged — correctly still bound by height, not width |
| Pill top (viewport, 1440) | 232.2px | 194.2px |
| `.arcs-clip` at 390px (mobile) | n/a | `display: none`, rect 0×0×0×0 |
| `.arc-why`'s inline `--arc-diameter` at 390px | n/a | `""` (empty — guard correctly did not fire, fixed CSS fallback still in effect) |

## Verification

- `pnpm vitest run app/features/landing/ui/PurposeSection.test.ts
  app/features/landing/logic/usePurposeArcRadii.test.ts`: 22/22 passed.
- `./init.sh` exits 0 (typecheck, biome check, full test suite 711/711,
  `pnpm generate`, `pnpm storybook:build` all green).
- No frozen primitive touched (`SectionGlow`, `DotGrid`, `SectionBackdrop`,
  `Radar`, `Pill`, `BotonPrimario`). No component other than
  `PurposeSection.vue` (and its test) and the `--purpose-pill-y` token in
  `global.css` were edited.

Status left at `reviewing` in `feature_list.json` for the reviewer.
