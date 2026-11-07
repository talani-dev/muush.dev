# Review · feature 50 `mobile_fixes_map_process_footer`

Reviewer, 2026-11-07. Branch `fix/v2-mobile-fixes` (uncommitted working tree; compared against `master`
with `git diff master -- app tests`). Spec: the feature 50 entry in `feature_list.json` (sdd: false, no spec folder).
Status in `feature_list.json` was `reviewing` when the review started.

## Verdict: APPROVED

No blocking defects. Every acceptance criterion is met in code and tests. The map criterion is met only
on paper (see finding 1): the leader must get Roberto's confirmation on a real iPhone before marking the
feature `done`. That is a human check. No code change is needed for it.

## Commands (run by the reviewer)

| Command | Result |
|---|---|
| `pnpm check` | pass |
| `pnpm typecheck` | pass |
| `pnpm test` | pass: 222 files, 3052 tests |
| `pnpm generate` | pass: 28 routes prerendered |
| `pnpm storybook:build` | pass |
| `./init.sh` | exit 0, "Environment ready" |

Note: in my first chained run, `pnpm test` and `pnpm generate` failed (only the stack tail was captured).
Both passed when I ran them again on their own, and `./init.sh` passed with all steps. I believe the first
failure was transient and environmental, because it ran right after `nuxt typecheck` rewrote `.nuxt`.
That cause is INFERRED: I could not reproduce the failure.

## Acceptance criteria

| # | Criterion | Result |
|---|---|---|
| 1 | Map sharp at 390, America and Europe, after a switch; no `scale` on a rasterized layer | CONFIRMED in code: no `scale` or `translate` is left on the canvas or pins below lg (`WorldMap.vue:119`, `MapPin.vue:51`). No `--mapa-zoom/-contra/-tx/-ty` remains anywhere in `app/` or `tests/`. That the fix removes the iPhone blur is INFERRED (finding 1) |
| 2 | Pins, radar and labels in the same positions; animation kept; desktop unchanged | CONFIRMED by maths and tests. `regionFrame` (`mapGeometry.ts:66-80`) is an exact re-expression: `left %` and `width %` resolve against the window width, which equals the old canvas width. `top %` resolves against the window height, hence the `(470/1408) × aspect` factor. `mapGeometry.test.ts:92-128` checks the corners and centre against the handoff's `iniciarMapa` at 342 and 600. The animation path is the same: linear interpolation of translate+scale and of left+width gives the same point trajectory. At lg the classes reduce to `top-0 left-0 w-full aspect-mapa`, the same as `inset-x-0 top-0 w-full` before. City labels are `sr-only` and unaffected |
| 3 | No raster image of the map | CONFIRMED: SVG still inlined via `?raw`, no asset added |
| 4 | Process: active step 1/1, others reduced proportionally, continuous with the scroll | CONFIRMED: `stepEmphasis` / `railPosition` / `emphasisAlongRail` (`timelineProgress.ts:36-114`), linear and floored, interpolated across uneven rows, clamped at both ends |
| 5 | transform + opacity only, no layout shift; reduced motion = opacity only | CONFIRMED: `max-lg:scale-…` + `max-lg:opacity-…`, `origin-top-left` (`ProcessStep.vue:140-144`). Scale is 1 under reduced motion (`timelineProgress.ts:74-76`) |
| 6 | Rail fills as today; desktop hover/focus unchanged | CONFIRMED: `measure()` returns before `lit`/`fills` under reduced motion, so the rail stays full as before. The non-reduced path is unchanged. At lg the block is `lg:contents` and all `max-lg:` utilities drop out. The existing desktop tests pass unmodified |
| 7 | Footer: ≥44×44, non-overlapping, more space, same type/colour/order | CONFIRMED in code and generated HTML. Each entry is a wrapping flex item with `min-h-toque min-w-toque`, so no two can overlap. The pull-backs are smaller than the neighbouring gaps (finding 6) |
| 8 | Tokens in global.css, no magic numbers | CONFIRMED (`global.css:982-997`, `:2625-2635`) |
| 9 | Unit tests cover the proportional maths and reduced motion | CONFIRMED: 13 pure cases in `timelineProgress.test.ts`, plus composable, component and timeline cases |
| 10 | check / typecheck / test / generate / storybook:build | CONFIRMED (table above) |

## Findings

1. **Medium (human gate, no code change). The map root cause is still INFERRED; confirm on iPhone before `done`.**
   The implementer could not reproduce the blur in desktop WebKit: the "before" screenshots are already
   sharp. Their DPR-3 WebKit captures therefore show that nothing regressed. They do not prove the bug is
   fixed. The fix plausibly removes the mechanism. The canvas is no longer a transformed layer: it is laid
   out at 1689.6 / 2534.4 CSS px, and nothing promotes it to a compositing layer. The SVG is then painted
   at its final device resolution on every frame, including during the left/top/width transition, which
   WebKit cannot run on the compositor. Any iOS contents-scale cap on transformed layers no longer
   applies. Roberto should check `/es/` and `/es/nosotros` on his iPhone in both regions and after
   switching, as `impl-50.md` § 6.1 already asks.

2. **Medium (spec-level, for Roberto; not an implementation defect). The dimmed steps' text contrast.**
   At the floor opacity of 0.35 (`global.css:991`), the description and chip text of the non-active steps
   falls well below WCAG 1.4.3's 4.5:1. By my estimate, Blanco 70 % × 0.35 on the dark background gives
   about 2:1 (INFERRED, not measured). WCAG has no exception for dimmed content. The values are the
   leader's proposed defaults, and the spec says Roberto may tune them. Raise this when reporting to
   Roberto. Raising `--paso-enfasis-opacidad-min` / `-vecino` is a tokens-only change.

3. **Low. The map canvas transitions `all` properties from lg.**
   `WorldMap.vue:119`: `duration-(--lento) ease-muush` now applies at every width, but the
   transition-property is set only below lg (`max-lg:transition-[left,top,width]`). From lg it falls back
   to the CSS initial value, `all`, at 700 ms. Before, it was `transition-transform` everywhere. The only
   practical effect is that resizing across the lg breakpoint animates left/top/width for 700 ms. The old
   code animated the transform in the same case, so this is not a visible regression. It is unintended,
   though. Suggested fix: `lg:transition-none`, or move the duration and ease under `max-lg:`.

4. **Low. Desktop now writes reactive state on every scroll frame.**
   `useTimelineProgress.ts:85-88`: the listener now also runs under reduced motion. From lg, `measure()`
   assigns a fresh `neutral()` array on every scroll frame, which re-renders `ProcessTimeline` for nothing.
   Before, desktop `measure()` returned without writing anything. Suggested fix: write only when
   `emphasis` is not already neutral, or reuse one constant neutral array. Running the listener under
   reduced motion is sound otherwise. The rail stays full (`fillAll()` on mount and on toggle, and the
   early return before `lit`/`fills`). The reduced-motion toggle re-measures in both directions. The
   tokens are read once in `start()`. Unmount still removes both listeners
   (`useTimelineProgress.test.ts`, last case).

5. **Low / Info. Footer: dropping `rounded-control` on the links line is justified.**
   `MobileFooter.vue:116`, comment at `:35-37`. Per CSS Backgrounds 3, border-radius clips the area that
   accepts pointer events, so the implementer's reasoning is correct. The cost is square focus-outline
   corners below lg only, which no longer match the desktop footer. This is a visible deviation that is
   not in the `.pen`: include it in the R32 hand-off to Clau, with the 3/3/1 wrap and the ~85 px of extra
   height. Keeping the radius on an inner element would preserve both, but that is optional.

6. **Info. Footer negative margins checked; no overlap.**
   `-my-toque-sangria` is `(44 − 1lh)/2`, resolved on each list's own line-height: about 10.75 px for
   15 px text. That is less than the 24 px block gap, so the links' tap areas clear the contact rows above
   and the social buttons below. The legal row pulls back only upwards: about 13–14 px, inside the 16 px
   `pt-legal-movil-arriba`, so the tap area stays below the border line. Its bottom extension only pushes
   the copyright down, so the copyright cannot overlap the links. The separators are `aria-hidden` and
   render as ` · ` (checked in `.output/public/es/index.html`). The `ul > li` and `p` semantics are
   unchanged. The "Blog · próximamente" `<span>` also gets `TAP`. That is harmless, and it keeps the
   spacing even.

7. **Info. The emphasis is anchored at each step's dot (row top).**
   `timelineProgress.ts:91-103`: when the pencil is halfway through a row, that step and the next both
   show 0.96 / ~0.73, and neither is at 1/1. This follows "the step at the rail's active point" literally
   (the dot is the active point), and the change is continuous. Roberto may prefer to anchor at the text's
   centre when tuning. Mention it in the report.

8. **Info. Text scaling is itself a transform.** The step text animates `scale` over 120 ms, so WebKit
   composites the layer during the transition and re-rasterizes it afterwards. Scaling down to 0.9–1 does
   not risk the magnification blur from finding 1. Still worth a glance on the same iPhone check.

## Constitution / CHECKPOINTS

- Article VII (tokens): new values are tokens (`--paso-enfasis-*`, `--toque`, `--spacing-toque*`). No colour or spacing literals were added to components.
- Article VIII (no magic numbers): OK. The maths uses `PEN_LINE_RATIO`, `PERCENT` and `MAP_SIZE`.
- Article IV (static purity): OK. No server route was added.
- Article VI (i18n): no copy or route changed. The footer was checked in both locales by tests.
- Article XII (imports): new imports are alias-based (`@/…`) or same-directory. `ui` → `logic` is allowed.
- Article X (testing): test names follow `should … when …`. The tests check behaviour, not only class presence: the frame maths is checked against the handoff, the composable against stubbed layout, and the reduced-motion and missing-token paths are covered.
- C3: every touched component is under 200 lines (largest is `ProcessStep.vue` at 173). The `useTimelineProgress` closure was already over ~30 lines before this feature; its inner functions are short.
- C5: `WorldMap` and `MapPin` (shared/ui) keep their stories. New `ProcessStep` dimmed stories were added in ES and EN.
- Comment style matches the surrounding code (header JSDoc paragraphs dated and attributed to the feature).

## For the leader before `done`

- Finding 1: Roberto confirms the map is sharp on his iPhone.
- Findings 2, 5 and 7: include them in the R32 report to Roberto and Clau.
- Findings 3 and 4 are optional polish. Fix them now or later, at the leader's discretion.

---

## Re-review (2026-11-07): findings 3 and 4 fixed, plus the new item (4) CURSOR

Scope: only the delta, compared against `master`. That is `app/shared/ui/WorldMap.vue` and its test,
`app/features/landing/logic/useTimelineProgress.ts` and its test, `public/cursor/you.svg`,
`tests/brand-cursor.test.ts`, and the cursor comment in `app/assets/css/global.css`. Status in
`feature_list.json` is still `reviewing`. Per the leader, Roberto has already checked the map, the
timeline and the footer on his iPhone. I did not observe that check myself (UNVERIFIED by me). It
closes the human gate in finding 1.

### Verdict: APPROVED

### Commands

| Command | Result |
|---|---|
| `pnpm check` | pass |
| `pnpm typecheck` | pass |
| `pnpm test` | pass: 222 files, 3056 tests (see note) |
| `pnpm generate` | pass: 28 routes; `.output/public/cursor/you.svg` is byte-identical to `public/cursor/you.svg` |

Note: on the first attempt, `pnpm generate` refused to run with "Another Nuxt build is already running"
(another process held the lock). In a run made right after that, `pnpm test` reported an "Unhandled
Error" with no failing test. Both passed cleanly when re-run on their own (exit 0). I attribute the
failures to a concurrent build in the workspace, not to the change. That attribution is INFERRED. The
same transient appeared in my first review.

### Earlier findings

- **Finding 3: fixed.** `WorldMap.vue:122` now carries `max-lg:duration-(--lento) max-lg:ease-muush`, so
  from lg the canvas has no duration, and the initial `all` property transitions nothing. Below lg the
  transition is unchanged. `WorldMap.test.ts:134` pins this.
- **Finding 4: fixed.** `emphasis` is now a `shallowRef`. `resetEmphasis()`
  (`useTimelineProgress.ts:84-87`) skips the write when every entry is already `NEUTRAL_EMPHASIS` by
  identity, so desktop scroll frames no longer trigger a re-render. The shallow ref is sound here because
  the array is always replaced whole and never mutated in place. The mobile and reduced-motion paths are
  unchanged.

### Cursor (item 4)

- **Asset: CONFIRMED.** Compared with Roberto's `02-Mouse.svg`, the only changes are that the
  full-size white `<rect width="32" height="32">` is removed and the root width/height went from 32 to 64.
  `viewBox="0 0 32 32"` is kept. The pill rect, the "You" path and the arrow path are kept verbatim and in
  order. Colours are only `#E5352F` and white. The file has no `<script>`, `href` or external reference.
  The provenance comment is updated. The new `brand-cursor.test.ts` case pins the new arrow, the absence
  of the old one, and the source name. The existing assertions are unchanged and green.
- **Hotspot `1 9`: CONFIRMED by my own geometry check.** The arrow path starts and ends at
  (1.0137, 5.0133) in the viewBox, which is (2.03, 10.03) in the 64 px image. Its first control point,
  (1.2593, 4.7677), and its last, (0.7682, 5.2588), are collinear with that point along the (1, −1)
  direction. So the tip is a smooth rounded extremum, not a corner, and its outward normal is (−1, −1)/√2.
  The stroke is 1 viewBox unit wide (0.5 outside the fill), so the painted tip reaches about
  (1.014 − 0.354, 5.013 − 0.354) = (0.66, 4.66) in the viewBox, which is **(1.32, 9.32) in image px**.
  That point lies inside pixel (1, 9), about 0.45 px from the hotspot. So `1 9` sits on the visible tip.
  `2 10` would be about 1 px inside it. Pixel (0, 8) is no longer painted: the old sharp miter reached
  further out. All of this matches the implementer's ×8 WebKit measurement and the reasoning in the
  `global.css` / SVG comments. The size stays 64 × 64, under the 128 px browser limit.
- **Not verified:** how the cursor looks under a real pointer in Safari, Chrome and Firefox (the
  feature 34 manual matrix). Roberto should glance at it on desktop. That is not a blocker.

### New findings

9. **Info.** `app/assets/css/global.css:579-580`: in the edited cursor comment, the first line
   ("rounded arrow, redrawn lettering, same pill). Defined once here and read by every cursor rule below
   the `html`") runs well past the surrounding wrap width. It is cosmetic only; re-wrap it when
   convenient.

### For the leader before `done`

- Finding 1's iPhone gate: reported as satisfied by Roberto. Record it in history.
- R32 hand-off to Roberto and Clau, still pending: findings 2 (dim-step contrast), 5 (square focus corners
  on the mobile links line, the 3/3/1 wrap, ~85 px taller footer) and 7 (emphasis anchored at the dot).
  The new cursor drawing should also be reflected in the `.pen` if it is not there already.
