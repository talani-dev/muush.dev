# Review — feature 38 `tablet_layout_and_pill_fixes`

Date: 2026-10-19 · Reviewer agent · Branch `feat/tablet-layout-and-pill-fixes`
(uncommitted working tree) · `sdd: false`. I reviewed against the `acceptance`
array and description in `feature_list.json` (D1–D6 plus the Propósito item),
the phase A audit, the implementer report, CHECKPOINTS, the constitution and
`docs/business/`.

## Verdict

**APPROVED**

There are no blocking items. All 8 acceptance criteria hold when measured
independently. Non-blocking notes are below.

## How it was verified

- Status precondition: `feature_list.json` id 38 is `reviewing` (CONFIRMED).
- `./init.sh` exits **0**: typecheck, Biome, 96 files / 1363 tests, `pnpm generate` and
  `storybook:build` all OK. (The first run failed only because a different `nuxt
  generate` process, PID 86747, held the build lock. That process was gone
  seconds later and the re-run passed. It was not mine and I did not kill it.)
- I read the full `git diff` and `tests/tablet-layout-tokens.test.ts`.
- Builds: a snapshot of the branch `.output/public`, plus master `6fae925` built
  in a scratch `git worktree` under the session scratchpad. Each was served on its
  own port (8781 and 8782). I used headless system Chrome 155 over CDP on port 9333,
  with DPR 1, `mobile:false` and fonts awaited. Pages: `/es/`, `/en/`,
  `/es/nosotros/`, `/en/about/`. Widths: 320, 390, 768, 1023, 1024, 1100,
  1180, 1279, 1280, 1366, 1439, 1440, 1920. Geometry was taken at rest
  (`prefers-reduced-motion: reduce`), and the float was also sampled live
  (24 poses each at 1024, 1060, 1100, 1180, 1279, 1366 and 1439, in both locales).
  I wrote my own scripts in the scratchpad `rvscripts/` and did not reuse the
  implementer's. Afterwards I stopped my servers and Chrome and removed the worktree.
  The user's `:3000` server (pid 67701) was left running.

## Acceptance criteria

| # | Criterion | Result |
|---|---|---|
| 1 | Phase A delivered and approved | CONFIRMED by artifact: the audit has measured causes, widths and the proposed breakpoint, and the description records Roberto's D1–D6 approval. The approval itself is the leader's record (UNVERIFIED by me). |
| 2 | No form overflows horizontally from 320 to 1920 in either locale | CONFIRMED. For both forms, at every width and in both locales, no visible descendant goes past the content box by more than 0.02 px (LayoutUnit rounding) and nothing goes past the viewport. Master at 1024 had 12 overflowing form elements on About (labels/inputs up to x 1110 at 1024). |
| 3 | Stacked below 1280 with full-width text and centred submit; two proportional columns from 1280 | CONFIRMED. Stacked 320–1279: text and form both use the full content width (908.4 @1024, 1136.2 @1279). The submit is 216 px and centred (offset ≤0.01) from 1024 to 1279, and full width below 1024 as before. Two columns from 1280: contact 490.7/582.4, work 457.0/580.1. At 1440 they are 556/660 and 520/660, the same as the frame. |
| 4 | Propósito: carousel below 1280, constellation from 1280, nothing open at tablet | CONFIRMED. Constellation is `display:none` and the carousel shows from 320 to 1279. At 1280 and above it is the other way round. The same holds with `hover:none` / `pointer:coarse` emulated at 1024, 1180 and 1279, so a touch tablet in that range never gets the constellation. |
| 5 | Services constellation not cut from 1024 to 1920, narrower and without overlap, unchanged at 1440 | CONFIRMED. Rest: text overlap 0, text-on-radar 0, rightmost text ≥30 px inside the viewport (master: 338 px cut @1024). Floating: 0 overlaps over 336 samples. Worst gaps were text→text 20.7 and text→radar 18.3 (ES @1024). Connector ends stay ≤0.014 px from the radar centres, at rest and while floating. The Delivery closer sits exactly on the content box (±0.016), on one Pill row, ≥35 px above the canvas bottom and ≥119 px below the lowest node text. |
| 6 | Section Pills share left x; size unchanged | CONFIRMED. Every visible section Pill on home (Hero, Propósito, Servicios, Delivery, Contacto) and About (Nosotros/About us, Work with muush) sits at content-edge offset 0 to −0.015 px, and all Pills share the same offset at a given width. On master Servicios and Delivery were +22.2 @1024. Pill width, height, padding and label font-size match master at all 13 widths, on 4 pages: 0 mismatches. |
| 7 | No copy, route or dependency changes; 1440 composition unchanged | CONFIRMED. The diff touches no `i18n/`, pages, `package.json`, lockfile, `nuxt.config.ts`, `.storybook` or `server/`. For 1440, see the next section. |
| 8 | check / typecheck / test / generate / storybook:build pass | CONFIRMED (`./init.sh` exit 0). |

## Does 1440 really not change?

Element-box diff against master at 1440, every element in `<body>`, at rest:

- Home (ES/EN): 36 of 330 boxes differ, by at most **0.031 px**. These are the
  contact form card and its descendants (width 660.00 → 660.03) plus the
  Servicios/Delivery Pills and the closer (x 80.00 → 79.98). About: 28 of 198 differ
  by ≤0.016 px (form width 660.00 → 660.02). The implementer's report says the About
  boxes are "identical". That is a small inaccuracy, but the pixel claim holds.
- At 1920 all four pages are identical (0 boxes, 0 pixels).
- Full-page pixels at 1440: About 0 px differ. Home 778 (EN) / 486 (ES) px differ,
  all inside the Servicios Pill label, the Delivery row and the "Send" button
  edges. Amplified diff crops (`scratchpad/rv_shots/cmp_all.png`) show only
  glyph antialiasing edges. Nothing moves or changes size visibly.

Judgement: this **meets "la composición a 1440 no cambia" in substance**. The
shifts are 1–2 LayoutUnits (1/64 px). They come from `--spacing-page` resolving
to 79.98 rather than 80, which every other section already used, and from
`fr` track rounding. Removing them would mean taking the two Services Pills off
the content edge again, which contradicts D6. Roberto should be told about it,
but it is not a regression.

## Constitution and checkpoints

- CSS only: no new script, listener or `matchMedia`. The only `.ts` change outside
  tests is comments in `usePurposeArcRadii.ts`. Switching is done with `xl:`
  utilities and `@media (width >= 80rem)`. CONFIRMED.
- Tokens: the new values live in `:root` (`--contact-cols`, `--work-cols`,
  `--services-frame-units`, `--services-unit-x`, `--services-text-w`,
  `--services-text-min-w`). The new rules have no colour or spacing literals; the
  `px` hits in the added lines are all in comments. The dead tokens and the dead
  `left-services-pill-x` class were removed. `--services-text-min-w` is
  explicitly documented in `global.css` as "NOT a design value — measured in
  Chrome", with the measurement and a re-tune warning tied to copy length.
  CONFIRMED.
- No `server/` route, no new alias, no relative cross-directory import, and
  `<script setup lang="ts">` is unchanged. Each section still has one breakpoint
  (rules.md § point 4 / Article VII). The site as a whole now has two (1024 for
  Hero/Services, 1280 for Propósito and the forms); this is D7, see the notes.
- C3 size: `ServicesConstellation.vue` is 199 lines (it was kept under 200 by
  shortening comments). `PurposeSection.vue` is 373 lines (368 on master), so it
  was already over the limit before this feature and grew only by comments. Not caused by this feature.
- Tests: they are meaningful within jsdom's limits. They are source-level
  assertions on the breakpoint, the track ratio sum (= 1280 content box), the
  node-x tokens matching `SERVICE_NODE_CENTRES` (which ties radars to lines),
  the unit being 1 px at 1440, Pills and closer on `--spacing-page`, no
  canvas transform, and `xl` switching for Propósito. Rendered geometry is
  covered by the browser measurements above, which matches the project's
  practice.

## Non-blocking notes (for the leader / Roberto)

1. **1440 sub-pixel shift (≤0.031 px, antialiasing-only pixel diff).** It is acceptable as
   explained above. Mention it to Roberto rather than claim "bit-identical".
2. **Propósito carousel at 1024–1279 is a new look.** The 274 px cards with the
   fluid `text-lead` make the cards tall (≈525 px @1024). The first card is centred,
   which leaves the left half of the section empty, and the neighbouring cards are
   fully visible beside it (screenshots `scratchpad/rv_shots/v_pur_es_1024.png`,
   `v_pur_es_1180.png`). It meets the criterion, but Roberto should see it. Any
   tablet-specific card size must come from the `.pen`.
3. **D7 is now shipped.** Hero and Services switch at 1024, while Propósito,
   Contacto and Work switch at 1280. Each section still has a single breakpoint.
   Roberto approved the decisions that imply this, but he never stated it
   explicitly.
4. **Pre-existing, outside this feature:** at 320 px the mobile Services timeline
   closer copy (`w-services-closer-m-w`, 342 px) runs to x 366, which is 46 px past
   the viewport, in both locales. Master shows the identical result. Consider a follow-up
   (acceptance #2 covers the forms only).
5. **Touch devices at ≥1280 (for example iPad 13" landscape, 1366).** They still get the
   constellation, and its `(hover: none)` rule is the pre-existing touch
   behaviour. Whether Roberto considers that "tablet" is UNVERIFIED. The approved
   wording scopes the change to below 80rem, so this is not a defect of this
   feature.
6. `--services-text-min-w` depends on the copy. Re-run the 1024–1116 clearance scan
   if the Services briefs change. This is already documented in the token comment.
7. No WebKit/Safari measurement. The new CSS relies on `cqw`, `atan2()` and `max()`
   inside `calc`. INFERRED to be supported from Safari 16, not measured on a device.
8. Side effect for the user: `./init.sh` regenerated `.output/public`, which the
   user's `:3000` server serves. It now serves this branch's build.

---

# Round 2 — after Roberto's iPad test (2026-10-19)

Reviewer agent, branch `feat/tablet-layout-and-pill-fixes` (uncommitted). The
review is against the rewritten acceptance items 3 (forms side by side from
64rem, proportional columns) and 4 (carousel below 1280, swipeable Why/How/What
with the active card and dots following). It also re-checks the round-1 items.

## Verdict

**APPROVED**

There are no blocking items.

## How it was verified

- Precondition: `feature_list.json` id 38 is `reviewing` (CONFIRMED).
- `./init.sh` exits **0**: typecheck, Biome, **96 files / 1365 tests**,
  generate and storybook:build all pass (CONFIRMED).
- Diff read: `usePurposeCarousel.ts` (+ test), `ContactSection.vue`,
  `WorkWithMuushSection.vue`, `global.css` (comments only) and
  `tests/tablet-layout-tokens.test.ts`.
  - Carousel: the observer moved from `threshold: 0.75` to
    `rootMargin: '0px -49.5%'` with `threshold: 0`, so a card counts as active
    when it covers a 1%-wide strip at the centre of the track. When two cards
    cross in the same batch, `nearestToCentre` picks one using the entry rects
    the browser already supplies, so it adds no layout reads. There is still
    no scroll listener, script island or dependency.
  - Forms: the media query is back to `(width >= 64rem)`, and the tracks are
    still `--contact-cols` / `--work-cols`.
  - New tests: the observer options are pinned and the nearest-to-centre
    choice is covered. The form test pins `64rem` and forbids `80rem`.
- I built the current tree and a fresh `master` (6fae925, built in a temporary
  worktree that has since been removed) and served each from a scratchpad copy
  on :8881 (branch) and :8882 (master). Headless system Chrome 155 ran on
  :9351. I stopped all three when done. The user's :3000 server (pid 67701)
  was left running. Note that `./init.sh` regenerated `.output/public`, which
  that server serves.

## Item 4: carousel (CONFIRMED by measurement)

Setup: touch emulation, `hover: none` and `pointer: coarse`. At each width the
sequence was 8 swipes (→ → → ← ← ← → ←), then dots 2/0/1, then ArrowRight ×2
and ArrowLeft ×2 on the dots. After every step I checked that the geometrically
centred card, the undimmed card and the dot with `aria-current` were the
expected index.

| Width | Input | Result |
|---|---|---|
| 390, 768, 1024, 1180, 1279 (ES) | `synthesizeScrollGesture` (touch) | every step correct: swipes reach card 2 (How) and card 3 (What) and come back; dots and keys follow |
| 390, 768, 1024, 1180, 1279 (EN) | raw `dispatchTouchEvent` drags | every step correct |
| 820, 1032 (iPad portrait widths, ES) | raw touch drags | every step correct |

- **390 compared with master:** the scroll positions, centred card, active card,
  dots and key behaviour were identical at every step, with both input
  methods. Keyboard focus stays on the dot that had it in both builds; that is
  how master's roving behaviour works, not a regression.
- **Master at 768, for contrast:** it fails 9 of 16 steps (for example, ArrowRight
  ends with the active card on What while How is centred). This confirms the
  bug class Roberto reported in the video frames (`video/sheet.png`: only Why
  is ever active and the dots never move) and shows that round 2 fixes it.
- **Breakpoint:** at 1279 the carousel is visible and the constellation is not.
  At 1280 and 1366 it is the other way round (CONFIRMED).

## Item 3: forms (CONFIRMED by measurement)

Pages: `/es/`, `/en/`, `/es/nosotros/`, `/en/about/`. Widths: 768, 1023,
1024, 1180, 1280, 1366, 1440. Each was measured in three states:

- the default state;
- after an empty submit, with the errors showing;
- after choosing WhatsApp, selecting the longest option, and attaching a CV
  named `CV_Roberto_Miron_2026.pdf`.

Outbound https was blocked during the run.

- **From 1024:** both forms use a grid. The text sits beside the form with no
  overlap: the gap is 64 px (Contacto) and 100 px (Work).
  - Columns at 1024: Contacto 386/458, Work 356/452.
  - Columns at 1440: 556/660 and 520/660, which matches master.
- **No overflow at any width or in any state:**
  - `scrollWidth` never exceeds the viewport.
  - No visible descendant extends past its column.
  - No clipped element has `overflow` set.
- **Controls:**
  - Each radio row stays on one line.
  - The dial code and phone sit on the same row without overlapping, and stay
    inside the form. At 1024 they are 103.6 + 285.1 (Contacto) and 103.6 +
    278.9 (Work).
  - The longest select option fits (ES 261 px of text in 362 available at
    1024).
  - Submit is 216 px wide and inside the form.
  - The normal CV filename (231 px) fits at every width from 390 up.
- **Below 1024 (390, 768, 1023):** the stacked layout is **identical to
  master** for all four pages: the probe output diffs empty.

## Round-1 items re-checked (the full probe from round 1, 4 pages × 13 widths, 320–1920)

- **Services constellation:**
  - From 1024 to 1920 in both locales, there is no text/text or text/radar
    overlap. The smallest text gap is 20.7 px at 1024.
  - Connector error is at most 0.014 px, and the canvas never goes past the
    viewport.
  - Master has 14–16 page-overflow offenders at 1024–1180. The branch has 0.
- **Pill x:** every visible section Pill sits within 0.01 px of the content
  edge, at every width from 1024 up.
- **Pill size:** the branch and master match exactly on all 182 Pill
  comparisons (Δ 0).
- **1440 compared with master:** there are 36 box differences on Home and 28 on
  About, all at most 0.031 px. At 1920 there are 0. This matches round 1.
- **Constitution:** the added lines contain no colour literals, relative
  cross-directory imports, `server/` routes or dependency changes. There are
  no copy or route changes.

## Non-blocking notes

1. **Long unbroken CV filename: this overflow is pre-existing (CONFIRMED) and
   outside this feature's scope.** The test file was
   `Curriculum_Vitae_Roberto_Ejemplo_Nombre_Muy_Largo_2026_version_final.pdf`
   (540 px of text), attached to the Work form. The table shows how far the
   name runs past the form:

   | Width | Master | Branch |
   |---|---|---|
   | 390 | 291 px | 291 px |
   | 1024 | 111 px | 193 px |
   | 1279 | 39 px | 70 px |
   | 1440 | fits | fits |

   - The page never scrolls horizontally because of it.
   - Between 1024 and 1279 the overflow is larger on the branch, because the
     form column is now narrower and no longer runs off the page.
   - The cause is the file-summary `<span>` in `forms/ui/FileField.vue`, which
     has no `min-w-0`, truncation or wrapping. Recommend a follow-up; whether
     to use an ellipsis or wrap the name is Roberto's visual call.
2. **The ES select at 390 is pre-existing and identical on master.** The
   longest option ("Creador de contenido/marca personal") measures 261 px of
   text against 258 px available, so about 3 px may be clipped. This is
   outside the 1024+ scope.
3. **The mid-swipe switch point at 390 moved slightly.** The implementer
   reports 146 → / 122 ← against master's 134. The resting state matches master
   exactly. I did not re-measure this transient value.
4. **Only Chromium was tested.** Nothing was run on WebKit or a real iPad. The
   use of `rootMargin` with an element root is standard and is INFERRED to
   behave the same in iPad Safari/Chrome. Roberto should re-test on the device
   before merge.
5. **Round-1 notes 2–8 still apply,** in particular the tall tablet cards
   (525–561 px) and the site-wide 1024/1280 breakpoint split. Note 3 now
   covers only Hero/Services (1024) against Propósito (1280), because the
   forms are back at 1024.

---

# Round 3: hidden carousel scrollbar (2026-10-19)

Reviewed with status `reviewing` (CONFIRMED in `feature_list.json`). Branch
`feat/tablet-layout-and-pill-fixes`, uncommitted. `sdd: false`, so the review
was run against the `acceptance` array, mainly the new item: "Ningún carrusel
del sitio muestra barra de scroll horizontal…".

## Verdict

**APPROVED.** Nothing blocks. One residual risk is listed under the notes:
the iPad/WebKit and Firefox behaviour has not been checked on a real device.

## How it was verified

- `./init.sh` **exit 0**: 96 files and 1368 tests, plus generate and Storybook.
  The first run failed only because another Nuxt build was running at the same
  time (PID 70895). That process had exited by the time I checked it, and the
  re-run was clean.
- I read the round 3 diff. In `PurposeCarousel.vue` the change adds
  `.track { scrollbar-width: none }` and `.track::-webkit-scrollbar { display:
  none }`, both scoped. It changes no overflow, snap or JS. The remaining diff
  lines are comment and test-name renames from `lg` to `xl` (round 2). In
  `PurposeCarousel.test.ts` there are 3 new tests. They pin both rules from the
  comment-stripped style block, plus `overflow-x-auto` and the absence of
  `overflow: hidden/clip` on `.track`.
- **Inventory**: I grepped `app/` for `overflow(-x/-y)-(auto|scroll)`,
  `scroll-snap`, `snap-x` and `scrollbar`. The only horizontal scroller is
  `.track` in `PurposeCarousel.vue`. I also scanned at runtime every element
  with a computed `overflow-x` of `auto`/`scroll` on `/es/` and `/en/` at 390
  and 1024. The result was `DIV.track` and the contact `TEXTAREA` (a UA
  default, not a carousel). CONFIRMED: there is no other carousel.
- **Headless Chrome 155 (CDP)** served a copy of the `.output/public` build
  from the scratchpad on :8811, with Chrome debugging on :9311. I stopped both
  afterwards. :3000 was not touched.
  - **Computed style**, 390 and 1024 × ES and EN, touch emulation on: the track
    has `scrollbar-width: none`, `overflow-x: auto`, `scroll-snap-type: x
    mandatory`, and `scrollWidth > clientWidth`. The CSSOM contains
    `.track[data-v-…]::-webkit-scrollbar { display: none }`. `html` and `body`
    keep `scrollbar-width: auto`, so the page scrollbars are unchanged. The
    document has no horizontal overflow.
  - **Visual**: I took screenshots of the track's bottom edge mid-swipe at
    390 and 1024. Neither shows a bar under the cards, only the cards and the
    dots. In Roberto's screenshot the bar sits at that same edge.
  - **Behaviour**, all four combinations: I ran swipes → → → ← ←, then dots 2,
    1, 0, then 3 × ArrowRight on the indicator. The centred card, the undimmed
    card and the `aria-current` dot agree at every step (scrollLeft
    0/268/535). The arrow keys wrap from 2 to 0. My long swipe at 1024 (512 px)
    jumps 0→2, which is expected for a drag that long. A short 150 px swipe
    advances exactly one card (0→1) at both widths.
- **Rounds 1–2 spot-check**, `/es/`, `/en/`, `/es/nosotros/`, `/en/about/` ×
  1024, 1180, 1280, 1366 and 1440: no horizontal document overflow anywhere.
  Both forms are two-column, with the form to the right of the heading. The
  right edge of every form control stays inside the viewport (for example 935
  at 1024 and 1325 at 1440). Every visible section Pill shares one left x per
  width (58/66/71/76/80): hero, Propósito/Purpose, Servicios/Services,
  Delivery, Contacto/Contact, Nosotros/About us and Work with muush. Pill
  widths match round 2. The Services canvas ends at the viewport edge.

## Acceptance

| # | Item | Result |
|---|---|---|
| 7 | No horizontal scrollbar in any carousel, with swipe, dots and keyboard kept | Met in Chrome (CONFIRMED). For WebKit and Firefox the standard rules are present (CONFIRMED) but were not checked on a device (UNVERIFIED) |
| 2–6 | Forms, Propósito carousel below 1280, Services, Pill x | Still hold (spot-checked, CONFIRMED) |
| 8 | No copy, route or dependency changes; 1440 unchanged | Round 3 adds CSS only. Pill and form geometry at 1440 is unchanged from round 2 |
| 9 | check, typecheck, test, generate, storybook:build | `./init.sh` exit 0 |

## Non-blocking notes

1. **Device check pending.** Chrome on iPad uses WebKit. Hiding the bar there
   depends on `::-webkit-scrollbar { display: none }`, or on `scrollbar-width`
   in recent Safari. Historically iOS has not always honoured the
   pseudo-element on overflow scrollers. Having both rules is the standard
   belt-and-braces fix, but Roberto should re-test on the iPad before merging.
   If the bar persists there, the usual fallback is a wrapper with
   `overflow: hidden` and a track padded or shifted to push the bar out of view.
2. Hiding the bar removes a mouse-only affordance on desktop browsers below
   1280 (laptop windows 1024–1279). The dots and arrow keys still work, and
   the shift+wheel and trackpad swipe still scroll. This matches the request.
3. Round 1–2 notes still apply.

---

# Round 4: Propósito chooses its version by pointer type and width (2026-10-19)

Reviewed with status `reviewing` (CONFIRMED in `feature_list.json`). Branch
`feat/tablet-layout-and-pill-fixes`, uncommitted. `sdd: false`, so the review
was run against the `acceptance` array, mainly the rewritten Propósito item
("Propósito elige versión por tipo de puntero y ancho…").

## Verdict

**APPROVED.** Nothing blocks. One residual risk is listed under the notes:
real iPad/Safari and hybrid devices have not been checked on hardware.

## How it was verified

- `./init.sh` **exit 0**: 96 files and 1375 tests, plus generate and Storybook.
  The first run failed only because another Nuxt build held the lock
  (PID 81160, the same thing as in round 3). That process had exited when I
  checked, and the re-run was clean.
- **Diff read.** `global.css` adds `@custom-variant constellation (@media
  (width >= 64rem) and (hover: hover) and (pointer: fine))`. In
  `PurposeSection.vue` and `PurposeCard.vue`, every `lg:` switch (constellation,
  carousel, arcs, origin glow, in-card label, weight) becomes
  `constellation:`. `PurposeConstellation.vue` drops the `@media (hover: none)`
  "all revealed" block. `PurposeCarousel.vue` and `usePurposeArcRadii.ts`
  change only comments, with no JS, `matchMedia` or user-agent check. Grepping
  the 4 components and the composables for `sm/md/lg/xl/2xl:`, `80rem`,
  `hover: none`, `matchMedia` and `userAgent` finds only comments. The new
  describe in `tests/tablet-layout-tokens.test.ts` pins the variant, its
  single occurrence, the absence of breakpoint prefixes, the hidden/shown
  pairing and the `:hover`/`:focus-visible` reveal selectors.
- **Compiled CSS** (branch `entry.*.css`): `constellation:block`, `:flex`,
  `:hidden` and `:font-medium` sit together in **one**
  `@media (width>=64rem) and (hover:hover) and (pointer:fine)` block. That is
  the only `pointer` media query in the build. The branch build has no
  `hover:none` rule left, while master's `pages.*.css` has one.
- **Headless Chrome 155 (CDP).** I served the branch `.output/public` copy on
  :8821 and a fresh **master build** (scratch worktree at `6fae925`, `pnpm
  generate`) on :8822, with Chrome on :9361. All three were stopped afterwards,
  and the worktree was removed. :3000 (pid 67701) was not touched.
  - **Emulation caveat (CONFIRMED by measurement).** Chrome 155 **silently
    ignores** `hover`, `pointer`, `any-hover` and `any-pointer` passed to
    `Emulation.setEmulatedMedia`: `matchMedia('(hover: none)')` stays false.
    What actually flips them is `setTouchEmulationEnabled`, which gives
    `hover: none`, `pointer: coarse` and `any-pointer: coarse`. Headless
    defaults give `hover: hover` and `pointer: fine`. So "mouse" below means
    native hover/fine, and "touch" means touch emulation (+ `mobile: true`). I
    verified with `matchMedia` that each mode reports what it should. The
    implementer's report describes it as media-feature emulation, but the
    results hold for this reason.
  - **Matrix, ES and EN** (20 runs):

    | Input | Width | Variant | Visible | Arcs/glow | In-card label / weight | Interaction |
    |---|---|---|---|---|---|---|
    | mouse | 390, 1023 | no | carousel only | hidden | shown / 600 | dot3→535, dot1→0, 2×ArrowRight 268→535. Centred = undimmed = `aria-current` at every step |
    | mouse | 1024, 1280, 1440 | yes | constellation only | shown | `display: none` / 500 | rest 0,0,0. Hover How radar → 0,1,0, away → 0,0,0. Tab onto first trigger: `:focus-visible` true → 1,0,0 |
    | touch | 390, 768, 1024, 1180, 1366 | no | carousel only | hidden | shown / 600 | swipes →,→,← give 268/535/268, dots and keys as above, all in agreement |

    The track has `scrollbar-width: none` everywhere, and the document has no
    horizontal overflow anywhere.
  - **Assistive tech.** In the full AX tree (non-ignored StaticText), each
    label (Why/How/What) appears once and each card copy appears once in
    every run. The single apparent second hit (ES "What") is the hero
    paragraph, which shares the 40-character prefix "Diseñamos y construimos
    soluciones digit…". Master has the same hit, so it is not a duplicate.
  - **Live flip without reload.** Loading with touch at 1280 shows the carousel
    with the arcs unmeasured. Disabling touch switches to the constellation
    and the arcs get their measured diameters (984/1564/2051 px), identical to
    a fresh mouse load. The reverse flip hides the constellation. The
    ResizeObserver claim holds.
- **1440 with a mouse vs master (pixel diff, prefers-reduced-motion).**
  The Propósito section crop is **0 px different** in ES and EN, both at rest
  and with How hovered. Full pages: About 0 px. Home has 486 (ES) / 778 (EN)
  px in the Services Pill, the Delivery row and the Send button. These are
  **the same counts round 1 measured and accepted** as glyph antialiasing
  from the 79.98 px page margin, so round 4 adds nothing. Two runs of the
  branch differ by 0 px, so the method is deterministic. The implementer
  INFERRED this. It is now CONFIRMED.
- **Rounds 1–3 spot-check** (mouse), `/es/`, `/en/`, `/es/nosotros/`,
  `/en/about/` × 1024/1180/1280/1366/1440: there is no document overflow.
  Both forms are two-column, with the form's rightmost control at
  935/1081/1175/1256/1325. Every section Pill shares one x per width
  (58/66/71/76/80). The Services canvas ends at the viewport edge. All of this
  is identical to round 3.

## Is removing the `(hover: none)` block safe?

**Yes (CONFIRMED).** The constellation only gets a box under
`(hover: hover)`, and `hover` has one value per device, so `(hover: none)`
and `(hover: hover)` can never both match. The deleted block could therefore
only have applied while the constellation is `display: none`. Measured: with
touch emulation at 1024–1366 the constellation has no box. With a mouse, the
rest state is 0,0,0, as on master (`hover: none` false there). The mixed
combinations that Chrome cannot emulate (`hover: hover` + `pointer: coarse`,
`hover: none` + `pointer: fine`, `pointer: none`) fail the single compiled
query, so they get the carousel. No state shows the constellation without
hover. That follows from the compiled CSS (INFERRED by reading it, not
emulated).

## Acceptance

| # | Item | Result |
|---|---|---|
| 4 | Propósito by pointer and width, CSS only | Met (CONFIRMED in Chrome for mouse 390–1440 and touch 390–1366, ES/EN). The mixed-pointer cases follow from the single compiled query (INFERRED) |
| 2, 3, 5, 6 | Forms, Services, Pill x | Still hold (spot-checked, CONFIRMED) |
| 7 | No carousel scrollbar | Still `scrollbar-width: none`, and swipe, dots and keys work (CONFIRMED in Chrome) |
| 8 | No copy, route or dependency changes; 1440 unchanged | Round 4 is CSS-variant and comment-only in `app/`. Propósito at 1440 is 0 px different from master (CONFIRMED) |
| 9 | check, typecheck, test, generate, storybook:build | `./init.sh` exit 0 |

## Non-blocking notes

1. **Real devices are still UNVERIFIED.** Everything above is Chrome
   emulation. Roberto should confirm on the iPad (portrait and landscape,
   carousel expected in both) and, if possible, with a Magic Keyboard trackpad
   attached. WebKit is expected to keep `pointer: coarse` as the primary
   pointer there, which means the carousel, but this has not been measured.
2. **Hybrid devices follow the primary pointer.** On a touchscreen laptop
   whose primary pointer is a trackpad, the constellation shows. Tapping a dot
   there reveals the card only through emulated hover or focus. This is the
   behaviour Roberto asked for, but he should know about it.
3. **Mouse at 1024–1279 is back on the constellation** (round 1 had moved it
   to the carousel). This is intended by the new criterion. A narrow laptop
   window at 1023 or below still gets the carousel, without a visible
   scrollbar, as in round 3 note 2.
4. **For future reviews:** do not rely on `setEmulatedMedia` for
   `hover`/`pointer` in this Chrome version. Use touch emulation and check with
   `matchMedia`.
5. Notes from rounds 1–3 still apply.
