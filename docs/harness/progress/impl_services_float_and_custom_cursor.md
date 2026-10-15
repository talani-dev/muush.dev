# Implementation report · feature 34 `services_float_and_custom_cursor`

- **Date:** 2026-10-14 · **Agent:** implementer · **Branch:** `feat/services-float-custom-cursor`
- **Gate:** Roberto approved 2026-10-14 ("implementalo"), OA-1..OA-8 as recommended.
- **Status:** `reviewing` (set by implementer on the leader's instruction). Not `done`.
- **Commits:** none. Roberto commits on request. Plan § Commit grouping still
  applies (1 desktop float, 2 mobile trial alone, 3 cursor). The file lists
  are below.
- **`./init.sh`:** exit 0 · 82 test files / 1157 tests (baseline 78 / 1120) ·
  check, typecheck, generate, storybook:build all OK.

Evidence labels: **CONFIRMED** = measured in this session, **INFERRED** =
reasoned, **UNVERIFIED** = not observable here. Browser evidence is
**headless Chrome 155 on macOS (Apple M4 Pro)** driven over CDP against
`.output/public` served locally. Safari and Firefox were not available, so
nothing in this report is CONFIRMED for them.

---

## T002 · OA-3 (pre-existing connector misalignment): CONFIRMED

The pre-feature build was measured before any change. The table gives the
distance from each line end to the centre of the radar dot it should touch:

| Viewport | Connector 1 (start/end) | 2 | 3 | 4 |
|---|---|---|---|---|
| 1024 | 56.4 / 144.4 | 144.4 / 199.4 | 199.4 / 280.8 | 280.8 / **332.3** px |
| 1280 | **21.7** / 55.5 | 55.5 / 76.7 | 76.7 / 108.0 | 108.0 / 127.8 px |
| 1440 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 1920 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |

The spec predicted about 22 px for connector 1's start at 1280. It was
21.7 px. Cause: a `size-full` SVG meet-scaled into a canvas narrower than
1440 px.

## Part A · float: what was built

- `global.css`: `--services-float-amplitude: 7`, `--duration-services-float: 6s`,
  `--services-float-phase-step: 137.5deg`, `--services-frame-px: 0.0625rem`.
  Reduced motion sets the amplitude to `0`. The `@property --services-float-phase`
  (`<angle>`, inherits) and `@keyframes services-float` (0deg → 360deg) are
  there too.
- `data/servicesContent.ts`: pure `connectorFloatVars(connector, index)`.
- `ui/ServicesConnectors.vue` (new, 121 lines): the four connectors were
  extracted from the constellation. Each one's SVG is sized to the frame
  (`--services-canvas-w/h`, `overflow: visible`), which fixes OA-3. The
  shear is `translate(0, shift) skewY(atan(slope))`, built from the same
  `sin()` the nodes use.
- `ui/ServicesConstellation.vue` (215 → **197** lines): `--i` on each node,
  `.node` translate, the canvas clock plus its reduced-motion `animation: none`.
  The feature-23 history comment on `.canvas` was condensed to get under 200
  lines. The formula rationale and the width table are kept.
- `ui/ServicesTimeline.vue` (171 → **199** lines): the D-3 trial, one fenced
  block at the end of `<style scoped>`.

### Measured (Chrome 155 headless)

- **Glue (SC-001, Chrome only):** line end vs radar-dot centre is **0.000 px**
  at all 8 moments of a cycle × 1024/1280/1440/1920, and again with a
  **20 px root font** (32 + 32 checks, worst 0). Measured with `getScreenCTM`
  on the line ends and `getBoundingClientRect` on the dots. A bounding-box
  cross-check agrees.
- **Motion:** node offsets are exact sines within ±7 px. Phases are
  0°/137.5°/275°/52.5°/190°, and no two nodes peak together. Example at
  t = 1.5 s: `[7, −5.16, 0.61, 4.26, −6.89]`.
- **Layout (SC-004 proxy):** `Performance.getMetrics` gives `LayoutCount` = **0**
  over 4 s at 1440 and at 390. See deviation 1, which this required.
- **Reduced motion (SC-003):** 0 style recalcs. Services screenshots at
  1440×900 and 390×844 are **byte-identical** to the pre-feature build, with
  the mobile trial in place.
- **No JS:** with script execution disabled (app not mounted), node offsets
  still advance between two reads.
- **Mobile trial at 390 and 768:** rows float out of phase, radar-dot x stays
  constant, the spine has no transform, and `data-lyrics` is still set by the
  composable. Only one float animation is visible per viewport.
- **No added horizontal scroll** at 1024 (`scrollWidth` 1024 before and after).
- **Style cost (for the reviewer):** the inherited clock recalculates style
  for the canvas's 48 descendants every frame. That is about **1.4–2.2 ms per
  frame** in headless Chrome, against about 0.37 ms per frame for the same
  property non-inherited (probe), and there is no layout. It is the price of
  OA-1's single clock. Whether it shows on real hardware is part of T013's
  Performance recording.

## Part B · cursor: what was built

- `public/cursor/you.svg`: a copy of `01-Mouse.svg`. `diff` against the source
  shows exactly one changed line: line 2,
  `<rect width="32" height="32" fill="white"/>`, was replaced by a provenance
  XML comment. Every path, the pill rect, the colours and the white glyphs
  are unchanged (OA-7). The source file was not modified.
- `global.css`: `--cursor-brand` / `--cursor-brand-pointer`
  (`url("/cursor/you.svg") 1 5, auto|pointer`, OA-4). The four unlayered
  `:where()` rules sit inside `@media (forced-colors: none)` (OA-8).
- **Measured in Chrome:** the image decodes at 32×32. The corners are
  transparent (no white square) and the arrow and pill are `rgb(207,49,71)`
  (= `#CF3147`). Computed cursors on `/es/` and `/en/about/`:
  - brand + `auto`: html, divs, p, h1/h2, labels, select, radio, file input, disabled-state button
  - brand + `pointer`: every `a[href]`, `button`, `.cursor-pointer` (nav, burger, country selector, radio pills)
  - `text`: every text/email input and the textarea

  With `forced-colors: active` emulated, all cursors are system ones.

## Deviations from the plan (all inside the approved mechanism; OA-1 held, no rAF fallback)

1. **One frame-sized `<svg>` per connector, with the shear on the outer
   `<svg>` instead of the `<line>`.** Built as planned, a CSS `transform` on an
   SVG `<line>` made Chromium run **a layout every frame** (241 layouts in
   4 s). I isolated it by disabling each part separately. On the outer
   `<svg>` (a CSS box) it is **0 layouts**, which FR-007 requires. The clock
   and formulas are unchanged. The shift becomes a length via
   `--services-frame-px`, and `transform-box: view-box` is no longer needed
   because the border-box origin is the viewBox origin. The per-line vars now
   sit on each `<svg>` (inherited by its line). `ServicesConnectors.test.ts`
   asserts that structure. Recorded in findings § R67.
2. **Cursor rule 2 lists `input` whole** instead of `input:not(<text types>)`.
   Rule 4 takes the text types back by order, as research R9 describes. This
   avoids writing the text-type list twice.
3. **`brand-cursor.test.ts` accepts `url(../cursor/you.svg)`.** Nuxt rewrites
   the root-relative public URL relative to the stylesheet, even inside a
   custom property. Chrome resolves it to `/cursor/you.svg` on every route,
   including `/es/nosotros/` (trailing slash, the S3-website redirect target).
   An extra test resolves each emitted cursor URL against its stylesheet and
   asserts that it lands on the shipped file. Findings § R69.
4. **Defect found and fixed in my own asset comment:** writing `--red-400`
   inside the SVG's XML comment made the file malformed (`--` is illegal in
   XML comments), and Chrome refused to decode it. Silent, and it would have
   meant system cursors everywhere. Reworded, and a guard test was added and
   seen red. Findings § R68.
5. Extra tests beyond the plan: the XML-comment guard, cursor URL resolution,
   and the mobile `.spine` static guard.

## Red-first record

T003 7/7 red · T006 2/2 red · T007/T008 red (import of the not-yet-existing
component) · T016 9/10 red (the off-host guard is green by design) · T021 4/6
red (two guards green by design) · XML guard seen red against a deliberately
broken comment. Then all green.

## T023 revert drill (D-3)

I deleted the fenced block (with its leading blank line) and
`ServicesTimeline.float.test.ts`. Result: `ServicesTimeline.vue` was
**byte-identical to HEAD** (`git diff --quiet`), `pnpm check` was green, and
`pnpm test` passed 81 files / 1151 tests. Both were then restored, so **the
trial is in place.** (A first attempt left a stray blank line. That was a
bug in my removal script, not in the block, and it was redone exactly.)

**Revert instructions for Roberto:** in
`app/features/landing/ui/ServicesTimeline.vue`, delete everything from the
blank line before `/* Feature 34 · D-3 mobile float trial.` through
`/* end D-3 */`. Then delete
`app/features/landing/ui/ServicesTimeline.float.test.ts` and run
`pnpm test`. Nothing else changes, and the desktop float and the tokens stay.

## Open manual checks (unchecked in tasks.md)

- **T013:** quickstart § 1 in **Safari and Firefox** (glue at real widths,
  shear rendering), plus in any real browser: smoothness, readability while
  moving, and a 10 s Performance-panel recording (style cost above). Chrome
  glue, layout and motion are covered by the measurements above.
- **T015:** reduced motion and no-JS were done in headless Chrome only (see
  above). A human pass in a real browser is still open.
- **T020:** the cursor matrix on real hardware. Chrome/Safari/Firefox (plus
  Windows Chrome/Edge if available) on all 4 routes: the cursor actually
  renders and is sharp on Retina (OA-6), hotspot click on a 1 px target
  (SC-007), visibility over the red final-CTA gradient (OA-8), blocked
  `/cursor/you.svg` → system arrow and hand, High Contrast → system cursors.
  Also **Safari and Firefox resolution of the rewritten
  `url(../cursor/you.svg)` on `/es/nosotros/`** (UNVERIFIED, findings § R69).
- **T024:** Roberto's local keep-or-revert review of the mobile trial
  (`pnpm dev`, 390×844 and 768×1024).

## For the leader (not written anywhere under `docs/business/`)

- **Pre-existing, CONFIRMED in Chrome at 390:** the mobile spine is at x 53
  and the radar-dot centres at x 34.86, so the spine does not pass through the
  radars (about 18 px apart). This matches the spec's optional `.pen` check 2.
  Out of scope here, and unchanged.
- OA-6 / OA-8 follow-ups (PNG pair, outline over red) depend on T020.

## Files

Commit 1 (desktop float): `app/assets/css/global.css` (float tokens,
reduced-motion override, `@property`, `@keyframes`) ·
`app/features/landing/data/servicesContent.ts` + `.test.ts` ·
`app/features/landing/ui/ServicesConnectors.vue` + `.test.ts` (new) ·
`app/features/landing/ui/ServicesConstellation.vue` + `.test.ts` ·
`tests/services-float-tokens.test.ts` (new).

Commit 2 (mobile trial, alone): the fenced block in
`app/features/landing/ui/ServicesTimeline.vue` ·
`app/features/landing/ui/ServicesTimeline.float.test.ts` (new).

Commit 3 (cursor): `public/cursor/you.svg` (new) · `app/assets/css/global.css`
(cursor tokens and the `forced-colors` rules) · `tests/brand-cursor.test.ts`
(new).

Note: `global.css` carries hunks for commits 1 and 3, so commit with
`git add -p`.

Harness: `feature_list.json` (34 → `reviewing`) ·
`specs/034-services-float-custom-cursor/tasks.md` (23/27 ticked) ·
`docs/harness/progress/current.md` · `docs/harness/findings.md` (§§ R67–R69).

## Round 2 — cursor size (2026-10-14)

Change request from Roberto via the leader: "está muy chico, hazlo un poco más
grande". Status stays `reviewing`; nothing committed.

- **Asset** `public/cursor/you.svg`: only the root `width`/`height` went from
  32 to 48. `viewBox="0 0 32 32"` and every path and colour are
  byte-identical, so it scales as a vector and nothing is rasterized. The
  provenance comment now names both changes. `diff` against `01-Mouse.svg`
  shows exactly: root width/height, the removed white `<rect>`, and the
  comment (CONFIRMED, run this round). 48 is under the 128 px limit.
- **Hotspot `1 7`** (was `1 5`), in the 48×48 render space. The vertex (1, 5)
  scales to (1.5, 7.5) and the drawn miter tip ≈(0.1, 4.1) to ≈(0.15, 6.15).
  (1, 7) sits on the tip's bisector between them: 1.2 px from the drawn tip
  and 0.7 px from the vertex. (2, 8) is also 0.7 px from the vertex, but past
  it inside the fill and 2.6 px from the drawn tip (DERIVED). The value is
  declared only in the two `:root` tokens in `app/assets/css/global.css`, and
  their comment carries this derivation.
- **Tests** `tests/brand-cursor.test.ts`: the root test now pins
  `width="48" height="48" viewBox="0 0 32 32"`, and the emitted-CSS regex pins
  `1 7`. No automated test compares the asset with the source, because that
  file lives outside the repo; the source diff is the manual T017 step,
  re-run this round. Emitted CSS was checked as `you.svg) 1 7, auto` and
  `you.svg) 1 7, pointer`.
- **Docs**: amendment A1 (dated 2026-10-14) added to `spec.md` and
  `research.md`. OA-4, R5 and R6 are marked superseded, and FR-013, FR-014
  and the Key Entity are updated. `plan.md`, `data-model.md`, `tasks.md`
  (T016/T017/T018/T020) and `quickstart.md` § 3 are updated too.
- **Browser caveats** (research A1): MDN confirms the 128×128 limit and the
  32×32 recommendation. These are UNVERIFIED: Chromium hiding cursors larger
  than 32 px near the viewport edge or browser UI, Windows pointer-size
  scaling and clipping, and Safari's handling of SVG cursors above 32 px.
  All of them are in the manual matrix (T020, quickstart § 3), which is
  still open.
- `./init.sh`: exit 0 (82 files / 1157 tests, generate and Storybook OK).

## Round 3 — cursor size (2026-10-14)

Roberto asked again for "un poquito más grande". Status stays `reviewing`;
nothing committed.

- **Asset**: the root `width`/`height` went from 48 to 56, a 1.75× scale of
  the 32 viewBox. The viewBox, paths and colours are unchanged, and the
  provenance comment is updated. `diff` against `01-Mouse.svg` still shows
  only the root width/height, the removed white `<rect>` and the comment
  (CONFIRMED, re-run).
- **Hotspot `1 8`** (was `1 7`). The scaled vertex is (1.75, 8.75), and the
  drawn miter tip is about (0.18, 7.18); the unrounded R6 value gives
  (0.21, 7.21).
  - (1, 8) lies on the tip's bisector between those two points. It is 1.2 px
    from the drawn tip and 1.1 px outward from the vertex, which puts it
    inside the painted miter (about 2.2 px beyond the vertex at this scale).
    So the click point is on the visible tip.
  - (2, 9) is closer to the vertex (0.35 px), but it falls past the vertex
    inside the fill, 2.6 px from the drawn tip, so I rejected it. This is the
    same rule as round 2 (DERIVED).
- **Updated**: the two `:root` tokens and their derivation comment in
  `app/assets/css/global.css` and `tests/brand-cursor.test.ts` (the root is
  now pinned to 56/56 with viewBox 0 0 32 32, and the emitted-CSS regex to
  `1 8`). Also updated: amendment A1 in `spec.md` and `research.md`, plus
  `plan.md`, `data-model.md`, `tasks.md` (T016–T018, T020) and
  `quickstart.md` § 3. The PNG fallback sizes in OA-6 and A1 are now 56×56
  and 112×112.
- **New caveat** in research A1 (UNVERIFIED): at device pixel ratio 3 the
  cursor is 168 device px, above 128. Whether a browser applies the limit in
  CSS px or device px is not confirmed, so it was added to the manual matrix
  along with the earlier caveats.
- **Emitted CSS** checked: `you.svg) 1 8, auto` and `you.svg) 1 8, pointer`.
- `./init.sh`: exit 0 on the first run (82 files / 1157 tests; typecheck,
  check, generate and Storybook OK).

## Round 4 — cursor size (2026-10-14)

Roberto sent a reference screenshot (@2x) of the size he wants. From it, the
leader measured the "You" pill at about 48×31 CSS px and the arrow at about
20 px, which is exactly 2× the 32 viewBox (the pill is 23.5×14.76 units, so
47×29.5 px). Status stays `reviewing`; nothing committed.

- **Asset**: the root `width`/`height` went from 56 to 64. The viewBox, paths
  and colours are unchanged, and the provenance comment now cites the
  screenshot. `diff` against `01-Mouse.svg` still shows only the root
  width/height, the removed white `<rect>` and the comment (CONFIRMED,
  re-run).
- **Hotspot `1 9`** (was `1 8`). At 2×, the vertex is (2, 10) and the drawn
  miter tip is about (0.2, 8.2); the unrounded R6 value gives (0.24, 8.24).
  - (1, 9) lies on the tip's bisector between those two points. It is 1.1 px
    from the drawn tip and 1.4 px from the vertex, inside the painted miter
    (which reaches about 2.5 px past the vertex at this scale).
  - (2, 10) is the bare vertex, 2.5 px behind the visible tip.
  - (0, 8) is on the anti-aliased outer edge of the stroke.
  - This is the same rule as rounds 2 and 3 (DERIVED).
- **Updated**: the `:root` tokens and their comment in `global.css` and
  `tests/brand-cursor.test.ts` (the root is now pinned to 64/64 with viewBox
  0 0 32 32, and the regex to `1 9`). Also updated: amendment A1 in
  `spec.md` and `research.md` (now 64×64, sized from the screenshot), plus
  `plan.md`, `data-model.md`, `tasks.md` (T016–T018, T020) and
  `quickstart.md` § 3. The OA-6 PNG sizes are now 64×64 and 128×128.
- **Risks** recorded in research A1 for the manual matrix (both UNVERIFIED):
  at 2× DPR the cursor is exactly 128 device px, right at the limit; at 3×
  it is 192, above it.
- **Emitted CSS** checked: `you.svg) 1 9, auto` and `you.svg) 1 9, pointer`.
- `./init.sh`: exit 0 on the first run (82 files / 1157 tests; generate and
  Storybook OK). Afterwards I fixed one stale `1 8` in tasks.md T016's prose;
  that file is docs only and no build or test reads it.

## Round 5 — Amendment A2 (2026-10-15)

- **Scope:** spec § Amendment A2 (FR-022…FR-029, SC-009…SC-012), plan,
  research A2.1–A2.5, data-model §§ 6–7, tasks T028–T040.
- **Approval:** Roberto approved it on 2026-10-14 ("implementalo"), including:
  - centre colour `--red-400` at full opacity (A2-S1);
  - `--spotlight-lit-radius: 7.5rem` (A2-S2);
  - footer option A (no surface of its own);
  - form cards stay opaque;
  - no new colour token and no new red.
- **Status:** `reviewing` → `in_progress` while working → `reviewing`. No
  commit (plan § Commit grouping, item 4: Part C alone).
- **Untouched:** Parts A and B (float, mobile trial, 64px cursor with
  hotspot `1 9`).

### What changed

- **`app/assets/css/global.css`** (`:root`):
  - Deleted `--spotlight-red-400-42/-17/-37`, `--spotlight-stop-mid`,
    `--spotlight-core-size` and `--spotlight-outer-size`, with their
    comments.
  - Added `--spotlight-lit-radius: 7.5rem` and
    `--dot-paper-lit-color: var(--red-400)`, each with an A2 comment (the
    fallback is a `color-mix` on this same token).
  - The layer-table row now reads "puntos rojos bajo el puntero".
  - The radar comment no longer cites the lit colour as unresolved.
  - The `--red-*` set is still exactly 100…500. No hex was added.
- **`app/shared/ui/CursorSpotlight.vue`:**
  - Added a component-local `--spotlight-size: calc(2 *
    var(--spotlight-lit-radius))` on the root. The beam, margins and
    fallback read it.
  - The beam's four `background-*` declarations are gone.
  - Both masks use `circle var(--spotlight-lit-radius) at center`.
  - Doc comment rewritten for A2: red lit dots, no light, the `gViAx`
    divergence, and `overflow: clip` now "near the end of the page, which
    after A2 includes the footer".
  - The fallback table is marked as measured at the original 660px size.
  - The file went from 305 to 269 lines, about 90 of them code. The
    Article V exception note was updated.
- **`CursorSpotlight.stories.ts`:** the "What to look for" list and the
  lit-colour note were updated. Story code is unchanged except one Spanish
  demo sentence (see Deviations).
- **`app/features/shell/ui/SiteFooter.vue`:** `<footer>` has no class. The
  doc comment covers A2-4 and the § 9.bis divergence.
- **Comment-only fixes:**
  - `app/layouts/default.vue`: background-stack table and notes ("recolour",
    "no red dots … before the pointer has moved").
  - `app/shared/ui/SectionBackdrop.vue`: "no opaque block remains".
- **Tests:**
  - New: `tests/spotlight-red-dots-tokens.test.ts`.
  - Updated: `CursorSpotlight.test.ts` (token list; "no light of its own";
    "fade … at the lit radius"; removed tokens absent).
  - Updated: `SiteFooter.test.ts` (no `bg-*`, no inline background).
  - Updated: the `ContactForm` and `ApplicationForm` tests (glass-card
    guard).
  - Updated: `tests/static-output.test.ts` (lit-radius token in emitted CSS;
    no outer-size or red-400-* tokens; `/es` and `/en/about` footer tag
    without `bg-`).
- **Stale-reference grep** over `app/`, `tests/` and `.storybook/`: clean.
  The one remaining mention of `--spotlight-outer-size` is a historical note
  inside a `global.css` comment.

### Red-first record (CONFIRMED)

- Before the CSS and markup change, 7 of the new or changed assertions
  failed:
  - token test: 3;
  - CursorSpotlight: 3 (token list, no light, mask radius);
  - SiteFooter: 1.
- The form guards passed on arrival. I removed `bg-glass-dark-contact` from
  both `.vue` files locally and both guards failed. I then restored the
  files, and `git status` shows no `.vue` change under `forms`.
- The static-output test turned green after `pnpm generate`. The emitted
  footer tag is `<footer class="mt-section-gap">` on `/es` and
  `/en/about`.

### Gates

- `pnpm check`, `pnpm typecheck` and `pnpm test` (83 files / 1169 tests,
  was 82 / 1157) all pass.
- `pnpm generate` and `pnpm storybook:build` pass.
- `git diff` shows nothing under `docs/business/`, `i18n/locales/`,
  `app/features/forms/*.vue` or `app/shared/logic/`.
- `./init.sh` exits 0 on the first run.

### Browser evidence (headless Chrome 155, CDP, `.output/public` served locally, DPR 1)

**Method.**

1. Move the pointer onto a dot centre and wait 600 ms for the fade.
2. Pause all animations and wait 400 ms.
3. Capture shot A.
4. Hide `.cursor-spotlight`, then capture shot B.
5. Control: B against a second B taken 300 ms later differs by 0 pixels in
   every scenario.

Root font 20px is emulated with `Page.setFontSizes` (computed `html` 20px,
step 30, R 150).

| Scenario | Under the pointer | Centre dot A | Between dots A / B | Changed px off the grid **within R** | Falloff along +x |
|---|---|---|---|---|---|
| `/es` middle scroll, 16px (plain paper, SC-009) | Services canvas | `#CD3146` | `#262626` / `#262626` | 21 (see residue) | 24px `#B13345`, 48 `#933542`, 72 `#763740`, 96 `#58393D`, 120+ `#3B3B3B` (normal dot) |
| `/es` top, 16px | Hero `main` (over a hero glow) | `#CE3146` | `#452429` / `#452429` | 0 | n/a (edge) |
| `/es` bottom, footer, 16px (SC-010) | footer container | `#CD3146` | `#262626` / `#262626` | **0**, and 0 changed px beyond R | same as plain paper |
| `/en/about` bottom, footer, 16px (SC-010) | footer container | `#CD3146` | `#262626` / `#262626` | **0**, and 0 beyond R | same |
| `/es` top / middle / footer, **20px root** (SC-011) | as above | `#CE3147` ×3 | `#262626` on paper | 0 (top, footer), 29 (middle, see residue) | 30 / 60 / 90 / 120 px fading, 150+ normal dot |

- **Glow gone:** CONFIRMED. Between-dot pixels inside the radius are
  identical with and without the spotlight. Every changed pixel within R is
  on a dot, apart from the residue below.
- **Lit colour:** CONFIRMED. The dot under the pointer is `#CF3147` ±2 in
  every case. The falloff is linear: the 24px value `#B13345` is 80% red over
  the normal dot.
- **Registration:** CONFIRMED in Chrome at top, middle and bottom scroll, at
  16px and 20px root. No doubled or half-step dots. Every changed pixel is
  within the dot radius + 1px of a `DotGrid` centre.
- **Footer:** CONFIRMED. The effect reaches into the footer on `/es` and
  `/en/about`, with no stray pixel.
- **Form card covers it:** CONFIRMED. With the pointer at the centre of the
  `/es` contact card, 3129 of the card's pixels differ by at most **1/255**
  per channel. That is the blurred residue under 80% glass, invisible. The
  centre dot reads `#322629` against `#322628`.
- **Page does not grow:** CONFIRMED. With the pointer along the very bottom
  of the footer at maximum scroll, `scrollHeight` is 4229 before and after.
- **Residue, INFERRED to be a raster artefact and not a glow:**
  - Repainting the spotlight layer changes 20–500 off-grid pixels by 3–8 per
    channel. They sit over the hero and services `bg-radial-*` glow spans,
    mostly **more than 1000px from the pointer**, far outside the 336px lit
    sheet the layer can paint.
  - The same pixels change when only the lit sheet's `background-image` is
    removed, so they cannot be glow paint.
  - Some get *darker* in red, which red-400 paint with source-over cannot
    do.
  - A no-op style injection changes 0 pixels.
  - Recorded as findings.md § R70.

### OA-9 (CONFIRMED in headless Chrome; the spec's INFERRED prediction did not hold)

- **Method:** at maximum scroll with no pointer event, so the spotlight is
  absent. I captured the footer region twice: as built, and with
  `bg-ink-500` re-added to `<footer>` (a simulated pre-A2 look). As a
  sanity check, the two differ by 1457–3583 px, which are the dots now
  visible.
- **Result:** in the as-built capture, background pixels off the dot grid
  that differ from ink-500 by more than 2: **0 under the footer** in every
  case:
  - `/es` at 1440×900 and 390×844;
  - `/es/nosotros` at 1440×900 and 390×844.
- **Where the glow stops:** the last section's red glow ends 115px above the
  footer's top edge at 1440 on both routes, 167px above it on `/es` at 390,
  and 58px above it on `/es/nosotros` at 390.
- **Conclusion:** today no section glow shows under the footer, so the look
  Roberto would be judging does not occur, at least in Chrome.
- I did not change any glow.
- Safari and Firefox: UNVERIFIED.
- **Evidence** (PNG, per route and width: `-A2` and `-preA2-simulated`), in
  `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/df30a46d-12b7-45f4-a169-1247e104acfd/scratchpad/evidence/`:
  - `oa9-es-1440-*`, `oa9-es-390-*`;
  - `oa9-esnosotros-1440-*`, `oa9-esnosotros-390-*`;
  - the pointer scenarios' A/B/C shots;
  - `crop-footer.png`.

### Deviations

1. **Story demo sentence.** `CursorSpotlight.stories.ts` → Pinned had the
   Spanish demo sentence "Los puntos dentro del radio suben de brillo". It
   now reads "… se vuelven rojos". T035 said story code would stay
   unchanged, but the sentence would have described the removed behaviour.
   It is catalogue-only text, not site copy, and no locale key.
2. **Two stale comments left in `useCursorSpotlight.ts`.** Lines 142 and
   170 still say "the light". I left them because T038 requires no change
   under `app/shared/logic/`. They are comment-only, for the leader to
   decide.
3. **`global.css` layer-table comment reworded.** "para poder iluminarlos"
   became "para poder teñirlos". This is part of the FR-028 comment sweep and
   is not listed word-for-word in T033.

### Open manual checks (T039 unchecked)

- Safari and Firefox: the whole of quickstart § 5.
- On real hardware:
  - the colour against Roberto's reference screenshot;
  - the ink-300 weak spot (footer category, copyright and location lines
    under a red dot);
  - the visibility of red dots near the red final-CTA and glass cards
    (step 10);
  - the A2-5 conditions: reduced motion, coarse pointer and print. These
    are unchanged in code (composable untouched, the three guards still
    asserted) but were not re-observed in this round.
- OA-9 in Safari and Firefox.
- For the leader to carry to Roberto (no agent writes these): the six
  `docs/business/` passages listed in spec § Amendment A2 (design-extract
  § 9.bis fill; rules § R28, § R37 row, § R38; ui-map § 10 row and recipe;
  ui-map § 2 note), and the `.pen` frame `gViAx` divergence.

## Round 6 — A2 revision 1 (2026-10-15)

Roberto, 2026-10-15: "me quitaste el fondo del footer flat, eso quiero que
esté". The footer gets its flat opaque `bg-ink-500` back, exactly as before
A2, so neither the dotted paper nor the red lit dots show over it. Everything
else in feature 34 is untouched: the float, the mobile trial, the 64 px
cursor with hotspot (1, 9), no glow, and red-400 lit dots at 7.5rem. The
status went `reviewing` → `in_progress` → `reviewing`. Nothing was
committed, and nothing under `docs/business/` was edited.

### Tasks

- [x] **T041** (`SiteFooter.test.ts`): `should paint no surface of its own`
  is replaced by `should paint its own flat ink-500 surface when rendered`,
  which asserts that the classes contain `bg-ink-500`. **Red first**: it
  failed (1 of 16) against the class-less `<footer>`.
- [x] **T042** (`tests/static-output.test.ts`): the A2 loop is replaced by
  `should render the footer on its own ink-500 surface when the page is
  <route>` for `/es` and `/en/about`. It asserts that the prerendered
  `<footer` tag's `class` attribute matches `\bbg-ink-500\b`. T032's
  spotlight-stylesheet assertions are left as they were.
- [x] **T043** (`SiteFooter.vue`): `<footer class="bg-ink-500">` is
  restored, along with the pre-A2 first doc-comment paragraph. The A2
  paragraph is replaced by a note: the flat ink-500 is Roberto's decision,
  it covers the dots by design, and removing it is a design change, not a
  fix. `git diff HEAD` on this file shows only that 4-line note, and the
  `<footer>` line is identical to HEAD.
- [x] **T044**, the comment sweep:
  - `SectionBackdrop.vue` was restored from HEAD, so its diff is empty.
  - `default.vue`: the A2 paragraph now names the footer (flat ink-500,
    A2 revision 1) and the form cards' glass as the surfaces that cover the
    effect. The other A2 edits (red lit dots, "recolour", "red dots") stay.
  - `CursorSpotlight.vue` point 1 now says "a beam near the end of the page
    (under the footer)". `overflow: clip` stays.
  - The grep over `app/`, `tests/` and `.storybook/` for `A2-4`, `no surface
    of its own`, `No opaque block remains`, `sits on the paper` and
    `continue under` found two stale hits, in the form-card guard comments
    of `ApplicationForm.test.ts` and `ContactForm.test.ts` ("the footer lost
    its own surface…"). Both were reworded. Only comments changed; the
    assertions are the same. The grep is now clean.
- [x] **T045**: `pnpm check` (after one Biome reformat of my own edit),
  `typecheck`, `test` (83 files / 1169 tests), `generate` and
  `storybook:build` all pass. Nothing changed under `docs/business/`,
  `i18n/locales/` or `app/shared/logic/`, and no forms `.vue` changed.
  `public/cursor/` is Part B's existing asset and was not touched this round.
- [ ] **T046**: the manual check in Chrome, Safari and Firefox is left
  open for Roberto.
- [x] **T047**: `current.md` is updated, and the three remaining
  `docs/business/` passages plus the `gViAx` divergence are handed over.

### Headless Chrome evidence (Chrome headless, CDP, 1440×900, DPR 1, `.output/public` served locally)

The pointer was moved with `Input.dispatchMouseEvent`. Screenshot clips are
in document coordinates (R70). Red pixel means R > 120, R−G > 60, R−B > 45.

| Check | `/es` | `/en/about` |
|---|---|---|
| `<footer>` class / computed background | `bg-ink-500 mt-section-gap` / `rgb(38, 38, 38)` | same |
| Spotlight mounted after the mouse event | yes | yes |
| Red pixels in a 240² body clip, pointer on it vs far away | 209 vs 0 | 184 vs 45 and 96 vs 0 (left column; the right column at those heights is a red gradient section, so it can't be measured with this threshold) |
| 260² clip in the footer middle, pointer inside vs 400 px above: pixel diff | none (identical) | none (identical) |
| Dominant colour of that footer clip | `#262626`, 65 922 / 67 600 px; the rest is footer text | `#262626`, 65 764 / 67 600 |
| Pointer 30 px above the footer's top edge vs far away: diff bbox (footer top at clip y = 160) | y 50–148 | y 46–144 |
| Red pixels above the footer edge with the pointer there | 68 | 68 |
| `scrollHeight` before and after the pointer moves | 4229 / 4229 | 2028 / 2028 |

So the footer is flat ink-500 with no dots and no red effect, even with the
pointer directly over it. The lit dots stop on the last grid row above the
footer, and everywhere else on the page they still turn red. The
ink-coloured footer pixels are CONFIRMED by measurement. Safari, Firefox,
390 px and real hardware are UNVERIFIED (T046).

### Unexpected

Two form-test comments outside the plan's file list still described A2-4,
and I reworded them (comments only). Nothing else.
