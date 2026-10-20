# Implementation (phase B) — feature 38 `tablet_layout_and_pill_fixes`

Date: 2026-10-19 · Branch `feat/tablet-layout-and-pill-fixes` · Not committed.
Scope: Roberto's decisions D1, D3, D4, D5 (option b), D6 and the new Propósito
item, as relayed by the leader. `docs/business/` and the `feature_list.json`
status were not touched.

## Files changed

| File | Change |
|---|---|
| `app/assets/css/global.css` | `--contact-left-w`/`--contact-form-w` → `--contact-cols: minmax(0, 556fr) minmax(0, 660fr)`; `--work-left-w`/`--work-form-w` → `--work-cols: minmax(0, 520fr) minmax(0, 660fr)`. Services: node x tokens become unitless frame px (150/430/690/950/1150, same as `SERVICE_NODE_CENTRES`); new `--services-frame-units: 1440`, `--services-unit-x: calc(100cqw / var(--services-frame-units))`, `--services-text-w: 232`, `--services-text-min-w: 11.25rem`; `--services-text-offset-x` becomes `-4` (frame px). Deleted `--services-pill-x`, `--services-closer-x/-w/-h` (`-h` had no consumer) and the `@theme` `--spacing-services-text-w`. Comments updated. |
| `app/features/landing/ui/ContactSection.vue` | grid block `64rem` → `80rem`, tracks `var(--contact-cols)`; comments. |
| `app/features/about/ui/WorkWithMuushSection.vue` | same (`--work-cols`); the `margin-top` offset stays inside the ≥80rem rule. |
| `app/features/landing/ui/ServicesConstellation.vue` | `.eyebrow` and `.closer` on `--spacing-page` (closer width = content box). Nodes and connectors are wrapped in a new `.frame` (`absolute inset-0`, `container-type: inline-size`, pointer passes through to the Pill, nodes take it back). Radar x, text x and text width are frame units × `--services-unit-x`; y unchanged; text width `max(232 units, 11.25rem)`. No transform/zoom on the canvas. 199 lines. |
| `app/features/landing/ui/ServicesConnectors.vue` | `<svg>` `width: 100%` of `.frame` + `preserveAspectRatio="none"` (x follows the canvas, y stays 910 units); skew is now `skewY(atan2(rise·frame-px, run·unit-x))` (the shift term needs no change). |
| `app/features/landing/ui/ServicesTimeline.vue` | removed the dead `left-services-pill-x` class (generated no CSS). |
| `app/features/landing/ui/PurposeSection.vue` | constellation, arcs, origin glow `lg:` → `xl:`; carousel `lg:hidden` → `xl:hidden`; comment. |
| `app/features/landing/ui/PurposeCard.vue` | `lg:hidden` / `lg:font-medium` → `xl:` (so the carousel cards keep their label and mobile weight in 1024–1279). |
| `PurposeCarousel.vue`, `PurposeConstellation.vue`, `logic/usePurposeArcRadii.ts`, `PurposeSection.stories.ts` | comments only (`lg` → `xl`). Stories keep their 390/1440 viewports; no story change needed. |
| Tests | `PurposeCard/PurposeSection/PurposeCarousel/PurposeConstellation.test.ts`, `usePurposeArcRadii.test.ts`: `lg` → `xl`. `ServicesConnectors.test.ts`: frame width/`preserveAspectRatio`/`atan2` transform. `ServicesConstellation.test.ts`: new describe (Pills/closer on `--spacing-page`, x scaled, y fixed, text-width floor, container on `.frame` not root, no transform on canvas). New `tests/tablet-layout-tokens.test.ts`: both forms switch at 80rem with no `64rem`, track ratios + gap = 1280 (the 1440 content box), old width tokens gone, node x tokens equal `SERVICE_NODE_CENTRES`, one unit = 1px at the 1440 frame, dead Pill/closer tokens gone. |

`forms/` was not touched (D3: `lg:w-btn-submit-w lg:self-center` already
centres the 216px button in the stacked 1024–1279 range).

## How it was measured

`pnpm generate` → `.output/public` on 127.0.0.1:8765; a copy of the
pre-change build (same branch, app identical to master) on :8766. Headless
Chrome 155 over CDP, DPR 1, `mobile: false`, fonts awaited. Rest geometry with
`prefers-reduced-motion: reduce` (float stopped); the float was also sampled
running. Throwaway scripts in the session scratchpad (`verify.mjs`,
`scan.mjs`, `dump.mjs`, `cmp.py`); servers and Chrome were stopped
afterwards. (A `python3 -m http.server 3000` on `.output/public`, pid 67701,
was already running and is not mine; left alone.)

## Results

### Forms — overflow (must be 0)

Same in both locales; Contacto (home) and Work with muush (About).
"past" = how far any descendant goes past the content box (R/L) or the viewport.

| Width | Layout | Text w | Form w (contact / work) | past content R/L | past viewport | Submit |
|---|---|---|---|---|---|---|
| 320 | stacked | 272 | 272 | 0 | 0 | full 222 |
| 390 | stacked | 342 | 342 | 0 | 0 | full 292 |
| 768 | stacked | 679.7 | 679.7 | 0 | 0 | full 622.5 |
| 1023 | stacked | 907.5 | 907.5 | ≤0.01 | 0 | full 845.5 |
| 1024 | stacked | 908.4 | 908.4 | 0 | 0 | 216 centred |
| 1180 | stacked | 1047.8 | 1047.8 | ≤0.01 | 0 | 216 centred |
| 1279 | stacked | 1136.2 | 1136.2 | ≤0.01 | 0 | 216 centred |
| 1280 | 2 cols | 490.7 / 457.0 | 582.4 / 580.1 | ≤0.01 | 0 | 216 centred |
| 1366 | 2 cols | 525.8 / 490.9 | 624.1 / 623.1 | ≤0.01 | 0 | 216 centred |
| 1439 | 2 cols | 555.6 / 519.6 | 659.5 / 659.5 | ≤0.01 | 0 | 216 centred |
| 1440 | 2 cols | 556 / 520 | 660.03 / 660.02 | 0.02 | 0 | 216 centred |
| 1600, 1920 | 2 cols | 556 / 520 | 660 / 660 | 0 | 0 | 216 centred |

The ≤0.02 values are LayoutUnit rounding (1/64 px); the master build
measures the same 0.02 at 1440 (and 160.8 past the content edge at 1024). `documentElement.scrollWidth` = viewport at every width.

### Section Pills — x and size

Left x minus the content edge, every visible section Pill (home: Hero eyebrow,
Propósito, Servicios, Delivery, Contacto; About: Nosotros/About us, Work with
muush), both locales: **identical for all Pills at every width** (0 / −0.01 /
−0.02 px of rounding against the computed padding, the same value for every
Pill at a given width). On master at 1024 Servicios and Delivery were +22.19.

Pill size: height 40, padding, label font size compared Pill by Pill against
the master build at all 13 widths, ES and EN home: **no difference**.

### Propósito

| Width | Constellation | Carousel | Arcs/origin glow |
|---|---|---|---|
| 320 – 1279 | hidden | shown | hidden |
| 1280 – 1920 | shown | hidden | shown |

The carousel cards keep their in-card label and 600 weight up to 1279
(`PurposeCard` moved to `xl:` with the section).

### Services constellation (breakpoint unchanged: `lg`, 1024)

Rest geometry, both locales (identical unless noted). `minTextGap` = smallest
gap between any two text blocks' line boxes; text→radar = smallest gap
between a text block's lines and another node's radar.

| Width | Canvas | Text w | Text overlap | Min text gap | Min text→radar (rest) | Connector end error | Rightmost text vs viewport | Delivery closer vs content box |
|---|---|---|---|---|---|---|---|---|
| 1024 | 1024 | 180 (floor) | 0 | 19.1 (1↔2, horizontal) | 23.5 | ≤0.01 | 29 inside | on the edges (±0.02) |
| 1180 | 1180 | 190.1 | 0 | 39.3 | 32.8 | ≤0.01 | 51 inside | on the edges |
| 1279 | 1279 | 206.1 | 0 | 42.6 | 32.6 ES / 32.5 EN | ≤0.01 | 55 inside | on the edges |
| 1366 | 1366 | 220.1 | 0 | 45.6 | 53.9 ES / 32.2 EN | ≤0.01 | 59 inside | on the edges |
| 1439 | 1439 | 231.8 | 0 | 48.0 | 53.4 | ≤0.01 | 62 inside | on the edges |
| 1440–1920 | 1440 | 232 | 0 | 48.0 | 53.4 | 0 | 62 inside | on the edges |

Fine scan 1024–1184 in 8px steps, both locales: min text→text 19.1, min
text→radar 23.0. The float moves neighbouring nodes up to 13.05px relative to
each other (amplitude 7, golden-angle phases), so the worst case under motion
is ≥10px text→radar and ≥19px text→text (horizontal gaps are not affected by
the vertical float). With the float running (1024, 1100, 1180, 1279, 1366,
1439): text overlap 0, text-on-radar 0, connector ends ≤0.01px from the radar
centres. The Delivery closer stays on one Pill row inside the canvas (copy
59–65px tall, ≥35px above the canvas bottom) and 117–158px below the lowest
node text.

**What was chosen for the text width (D5).** Fully proportional (232 × W/1440)
gave 165px at 1024: text never overlapped text, but the ES *Automation* brief
wrapped one more line and ended 1.7px above node 5's radar at 1024–1087 (EN:
11.6px above node 3's radar at 1024–1088), which the float runs through. So
the width scales proportionally with a floor of **11.25rem (180px)**, active
only below ~1117px. Floors tried: 10.5rem (no fix), 11rem (EN still 11.6px),
11.5rem (text→radar 33, but text→text drops to 15.1). 11.25rem gives the best
balance. This is a measured value, not a design value; it is commented as such
in `global.css` with the copy dependency. The lower bound stays at 1024.

Connector crossings: lines 2 and 4 cross the bounding boxes of the text next
to them over 156–228px, the same as the 1440 composition (212 / 164px). The
1024 screenshot reads the same way as 1440.

### 1440 / 1920 unchanged — diff against the pre-change build

Element boxes (every element in `<body>`) and full-page screenshots, reduced
motion, ES/EN home and About, at 1440 and 1920:

| Page | 1440 boxes | 1440 pixels | 1920 boxes | 1920 pixels |
|---|---|---|---|---|
| /en/about/, /es/nosotros/ | identical | **0 px differ** | identical | 0 |
| /en/, /es/ | max shift 0.03px | 778 / 486 px differ | identical | 0 |

On the home page at 1440 the only box changes are ≤0.03px: the Servicios and
Delivery Pills and the closer copy move from x 80.00 to 79.98, and the contact
form track goes 660 → 660.03. Cause: `--spacing-page` =
`clamp(1.5rem, 0.2rem + 5.3333vw, 5rem)` evaluates to 79.9995 at 1440 and
lays out at **79.98**, not 80. Every other section Pill was already at 79.98,
so putting these two on `--spacing-page` (D6) moves them by 0.02px to match
them. Those sub-pixel shifts move glyphs into a different subpixel-positioning
bin, which accounts for the differing pixels (all within the Servicios Pill,
Delivery row and contact form). A side-by-side crop of the Services section
at 1440 looks the same. Nodes, text blocks and all four connector lines have
identical boxes at 1440 and 1920. `.frame` is the only new element.

### Checks

`./init.sh` exit 0: typecheck, Biome, **96 files / 1363 tests**, generate,
storybook:build all OK.

## Not met / for the leader

1. **Not literally identical at 1440 (≤0.03px).** Explained above. Making it
   bit-identical would mean keeping the two Services Pills off
   `--spacing-page`, which contradicts D6. Roberto should know about this.
2. **Propósito carousel at tablet widths (observation, no change made).** The
   carousel card is a fixed 274px (`--purpose-card-m`), but the lead copy
   follows the viewport-fluid `text-lead`. Cards are 525px tall at 1024 and
   561px at 1279, against 316px at 390. At 1180 the Why card is centred and
   How/What sit fully or partly visible to its right. Roberto asked for this
   composition and it works, but it is a new look for that range. Any tablet
   card width or type size would have to come from the design (Q1). It should
   not be invented.
3. **`--services-text-min-w` depends on the copy.** If the Services briefs get
   longer, re-run the 1024–1116 clearance scan.
4. D7 (sections switch at different breakpoints: forms and Propósito at 1280,
   Services/Hero at 1024) is now the shipped state. Roberto's decisions
   implied it but it was not stated explicitly.
5. No WebKit/Safari measurement (same limitation as phase A). The new CSS
   needs container query units (`cqw`) and `atan2()`/`max()` in `calc`:
   Safari ≥16 / Chrome ≥111 / Firefox ≥110. **INFERRED** from support tables,
   not measured on a device.
6. `PurposeSection.vue` was already over Article V's 200-line limit before
   this feature (368 → 373 lines here, comment only). Not addressed.

---

# Round 2 — Roberto's iPad feedback (2026-10-19)

Branch `feat/tablet-layout-and-pill-fixes`, not committed, feature status not
changed, `docs/business/` and `forms/` not touched. Services, Pill alignment
and the Propósito breakpoint (carousel <1280 / constellation ≥1280) are as in
round 1.

## Files changed in this round

| File | Change |
|---|---|
| `app/features/landing/logic/usePurposeCarousel.ts` | Active-card detection: `threshold: 0.75` → `rootMargin: '0px -49.5%'`, `threshold: 0` (a centre strip 1% of the track wide). When several entries in one batch are intersecting, the one whose `boundingClientRect` centre is nearest the `rootBounds` centre wins (`nearestToCentre`). This reads no layout because the entry's rects are already computed. Comment explains the bug. |
| `app/features/landing/logic/usePurposeCarousel.test.ts` | The stub records `rootMargin`/`threshold`. 2 new tests: the observer watches the centre strip (regression, feature 38), and the nearest-to-centre pick when two cards cross together. |
| `app/features/landing/ui/ContactSection.vue`, `app/features/about/ui/WorkWithMuushSection.vue` | `@media (width >= 80rem)` → `(width >= 64rem)`, which is master's breakpoint. The proportional tracks `--contact-cols` / `--work-cols` stay. Comments rewritten. |
| `app/assets/css/global.css` | Comments only (`--contact-cols` / `--work-cols` now say 64rem). |
| `tests/tablet-layout-tokens.test.ts` | The form test now pins `64rem` and forbids `80rem`. |

## 1. Carousel: cause (CONFIRMED by measurement)

The track itself was fine. In round 1's build at 768, 1024, 1180 and 1279,
touch swipes scrolled and snapped correctly (`scrollLeft` 0 → 268 → 535, the
geometrically centred card 0 → 1 → 2). Only the active-card state was wrong.

`usePurposeCarousel` set the active card from an `IntersectionObserver` with
`root: track` and `threshold: 0.75`, taking "the first entry that is
intersecting". An observer only fires when a card crosses the threshold. The
track is full-bleed, and its scroll range is the same 535 px at every width
because it depends only on the cards. At 390 only one card can be ≥75% inside
the track, so the threshold works. At about 760 px and wider, two or three cards
are ≥75% inside the track at the same time:

- **1279:** all three cards are always ≥75% visible, so no crossing ever
  happens after the first callback. The active card stays on Why, and so do
  the dots (Roberto's report). Dots and arrows still "worked" because
  `focusCard` sets the index directly.
- **768 / 1024 / 1180:** crossings only happen at the outer cards, so swipe
  → active jumps to What while How is centred, and swipe ← goes back to Why.
  Clicking dot 1 or pressing → also ended on the wrong card, because the
  observer overwrote `focusCard`'s index during the smooth scroll.

The original wording said a card "counts as centred once three quarters of it
is inside the track". That only holds when the track is narrower than about
two cards.

## Fix

The observer's root is narrowed to a strip at the track's centre with a
negative `rootMargin` of 49.5% on each side (3.9 px wide at 390, 10.2 px at
1024), and threshold is `0`. At rest, exactly one card crosses that strip at
any track width. This keeps the existing approach: native snap track, one
observer, no scroll listener, no per-frame geometry read (R41), and no new
dependency, script island or server code. Dots and arrow keys are unchanged.

## Verification (headless Chrome 155, CDP, touch emulation)

Builds were served from scratchpad copies: round 1 on :8790, the pre-feature
build (carousel identical to master) on :8791, and round 2 on :8792. Each
width ran this sequence: 3 swipes →, 2 swipes ← (`Input.synthesizeScrollGesture`,
`gestureSourceType: touch`), then dots 2/1/0, then 3 × ArrowRight from
dot 0. The check was: the centred card, the undimmed card and the
`aria-current` dot must all agree.

| Width | Round 1 build | Round 2 build |
|---|---|---|
| 390 | correct | correct |
| 768 / 1024 / 1180 | swipe → shows active **What** with How centred; swipe ← shows **Why** with How centred; dot 1 / → wrong | all steps correct |
| 1279 | swipes: active stays **Why** at every step | all steps correct |

Also checked with the round 2 build: raw `Input.dispatchTouchEvent`
drags (touchStart / 12 × touchMove / touchEnd) at 320, 1032 (iPad 13"
portrait width), 1279 in ES, all correct, while round 1 at 1032 fails the same way. Under
`prefers-reduced-motion: reduce` at 390 and 1024, swipes and dots are correct.

**Mobile vs master (390).** Rest states, snap positions, dots and keys are
identical. The only difference is the scroll offset where the active card
changes mid-swipe. I measured it with snapping disabled and 2 px steps:
master switches at 134 px in both directions. Round 2 switches at 146 →
and 122 ← (the pitch is 268). The 12 px asymmetry comes from the
neighbour's 0.88 `scale`, because the observer sees the transformed box. It
is transient. Every swipe settles on a snap point where the right card is
active. At 320, master switched at 170 → / 98 ←, so it was already
asymmetric there.

**Card height at tablet.** Unchanged: the fix gives the cards no new width.
Height is 316 at 390, 421 at 768, 525 at 1024, 526 at 1032, 547 at 1180 and
561 at 1279. The card stays 274 px wide while the `text-lead` copy grows with
the viewport. A tablet card width or type size would have to come from the
design. I did not invent one.

## 2. Forms: two columns from 64rem again

Measured with the round 2 build, ES and EN, at 1023 / 1024 / 1100 / 1180 /
1279 / 1280 / 1366 / 1440. Three states: default, WhatsApp chosen (dial
code + phone shown), and empty submit (errors shown: 5 on Contacto, 4 on
Work). Outbound https was blocked so nothing left the machine. "Past column" is
how far any visible descendant goes beyond its column box (text, alt or
form), across all three states.

| Width | Contacto text / form | Work text / form | Past column | Clipped text | Radio row (1 line) slack ES / EN | Dial + phone (Contact / Work) | Submit |
|---|---|---|---|---|---|---|---|
| 1023 | stacked 907.5 | stacked 907.5 | 0 | none | 592.6 / 603.2 | 103.6 + 734.3 | full 845.5 |
| 1024 | 386.1 / 458.3 | 356.2 / 452.1 | 0 | none | 143.4 / 153.9 (Work 137.2 / 147.8) | 103.6 + 285.1 / 278.9 | 216 |
| 1100 | 417.1 / 495.1 | 386.2 / 490.1 | 0 | none | 178.8 / 189.4 | 103.6 + 320.3 / 315.3 | 216 |
| 1180 | 449.8 / 534.0 | 417.6 / 530.1 | 0 | none | 216.1 / 226.6 | 103.7 + 357.5 / 353.6 | 216 |
| 1279 | 490.2 / 582.0 | 456.6 / 579.6 | 0 | none | 262.2 / 272.8 | 103.8 + 403.4 / 401.0 | 216 |
| 1440 | 556 / 660.03 | 520 / 660.02 | 0 | none | 337.2 / 347.8 | 104.0 + 478.1 | 216 |

At every width and in both locales: `documentElement.scrollWidth` equals the
viewport, the select shows its longest option without clipping (ES
"Creador de contenido/marca personal" is 261 px of text in a 362 px box at
1024), the CV field is 390 px wide at 1024, and no element has
`scrollWidth > clientWidth`. Screenshots at 1024 with errors and WhatsApp
shown (scratchpad `r2/shot_*_1024.png`) show no overlap and no clipping. Type sizes were not changed.
1440 is unaffected because the grid applies there either way.

## Not met / for the leader

1. **Long CV file name (pre-existing, not caused by this feature, not
   fixed).** After you attach a file whose name is one unbreakable token
   (tested with `Curriculum_Vitae_..._version_final.pdf`, 540 px of text), the
   name runs past the form. It goes 162 px past at 1024, 37 px at 1279, and
   **266 px at 390 on master**. At 1440 and wider it fits. The cause is in
   `forms/ui/FileField.vue`: the file-summary `<span>` has no `min-w-0` and no
   truncation or `overflow-wrap`. Whether to fix it with an ellipsis or by
   wrapping the name is a visual choice for Roberto. Fixing it would also
   touch `forms/`, which this round was told to leave alone.
2. The mid-swipe switch point at 390 moved by 12 px (see above). Rest
   behaviour is identical.
3. Card height at tablet (525–561 px) is unchanged. A better tablet card needs a
   value from the design.
4. No Safari/WebKit or real-device run. IntersectionObserver `rootMargin`
   with an element root is standard and is INFERRED to behave the same in
   iPad Chrome (WebKit), but this was not measured on the device.

## Checks

`./init.sh` exit 0: typecheck, Biome, **96 files / 1365 tests**, generate,
storybook:build. My servers (:8790–8792) and Chrome (:9340) were stopped.
The user's `:3000` server (pid 67701) was left running, and `.output/public`
now holds the round 2 build.

# Round 3 — hidden carousel scrollbar (2026-10-19)

Roberto's report (iPad, Chrome): while swiping, a horizontal scrollbar shows
under the Propósito cards. He wants it hidden in every carousel at every size.
New acceptance item: "Ningún carrusel del sitio muestra barra de scroll
horizontal…". Branch `feat/tablet-layout-and-pill-fixes`. Not committed.
Status unchanged. `docs/business/` not touched.

## Inventory: one carousel (CONFIRMED)

- Grep of `app/` for `overflow-x`, `overflow-auto/scroll`, `scroll-snap`,
  `snap-x/y` and `scrollbar`: the only horizontal scroller is the `.track` in
  `app/features/landing/ui/PurposeCarousel.vue`. The `overflow-x-clip` hits
  are Storybook hosts, which clip and do not scroll. The Services timeline is
  vertical and does not scroll itself.
- Runtime scan in Chrome at 390 and 1024 of every element with a computed
  `overflow-x` of `auto`/`scroll`, on `/es/`, `/en/`, `/es/nosotros/` and
  `/en/about/`: the landing pages have only `DIV.track` plus the contact
  `TEXTAREA` (UA default, not a carousel, left alone). The about pages have
  none.

Only one component needs the rule, so it lives in that component's scoped CSS
and there is no shared utility.

## Files changed

| File | Change |
|---|---|
| `app/features/landing/ui/PurposeCarousel.vue` | `.track { scrollbar-width: none }` and `.track::-webkit-scrollbar { display: none }`, with a comment giving the reason and the engine coverage. No overflow, snap or JS change. |
| `app/features/landing/ui/PurposeCarousel.test.ts` | New `describe('PurposeCarousel · no visible scrollbar')` (3 tests). It reads the scoped style block from disk with comments stripped (R27 pattern, as in `PurposeConstellation.test.ts`) and pins both rules. It also pins that the track is still `overflow-x-auto` and that `.track` has no `overflow: hidden/clip`. |

## Verification (headless Chrome 155 via CDP, build copied to scratchpad and served on :8794; round 2 build on :8795 for comparison; both stopped afterwards, :3000 untouched)

- **Computed style** at 390 / 1024 / 1279, ES and EN: track
  `scrollbar-width: none`, `overflow-x: auto`, `scroll-snap-type: x mandatory`,
  still scrollable (`scrollWidth > clientWidth`). The stylesheet contains
  `.track[data-v-…]::-webkit-scrollbar {display: none}`. `html` and `body`
  stay at `scrollbar-width: auto`, so the page's own vertical scrollbar is
  untouched.
- **The bar itself**: macOS headless Chrome uses overlay scrollbars, so
  `offsetHeight − clientHeight` is 0 in both builds and cannot tell them apart.
  I took screenshots of the track's bottom edge mid-swipe (touch emulation,
  `mobile: true`, scrollbars not hidden). At 1024 the round 2 build shows the
  horizontal overlay bar across the track and the round 3 build shows none. At
  390 round 2 shows a thin line along the bottom edge that round 3 lacks. This
  matches Roberto's second screenshot. I did not reproduce it on a real
  iPad/WebKit or Firefox: WebKit relies on the `::-webkit-scrollbar` rule and
  Firefox on `scrollbar-width`. Both are standard, but they are UNVERIFIED on
  device.
- **Behaviour** at 390 and 1024, ES and EN: 3 touch swipes → and 2 ←, then
  dots 2/1/0, then 3 × ArrowRight. At every step the centred card, the
  undimmed card and the `aria-current` dot agree (scrollLeft 0 → 268 → 535 and
  back). This is identical to round 2.
- `./init.sh` exit 0, 1368 tests (round 2 had 1365, plus 3).

# Round 4 — Propósito by input type (2026-10-19)

Roberto's request: a cursor/desktop device gets the Why/How/What
constellation with the hover reveal, and a touch screen gets the carousel.
Branch `feat/tablet-layout-and-pill-fixes`. Not committed. Status unchanged.
`docs/business/`, `forms/`, Services and the Pills not touched.

## The condition: one name, used everywhere

`global.css` now declares a Tailwind v4 custom variant right after the import:

```css
@custom-variant constellation (
  @media (width >= 64rem) and (hover: hover) and (pointer: fine)
);
```

The constellation shows only when this matches. In every other case the
carousel shows: any primary pointer that is coarse or cannot hover (any touch
screen at any width), and every device below 64rem. Tailwind compiles all four
utilities into a single `@media (width>=64rem) and (hover:hover) and
(pointer:fine)` block in `entry.*.css` (confirmed in the generated CSS). There
is no JS, matchMedia or user-agent check, so Article I holds.

## Files changed

| File | Change |
|---|---|
| `app/assets/css/global.css` | The `constellation` custom variant, with a comment explaining why it must be the only switch. |
| `app/features/landing/ui/PurposeSection.vue` | `xl:block` (origin glow, arcs) → `constellation:block`. `hidden xl:flex` (constellation) → `hidden constellation:flex`. Carousel `xl:hidden` → `constellation:hidden`. Comments updated. The display strategy (inactive version is `display: none`) has not changed. |
| `app/features/landing/ui/PurposeCard.vue` | `xl:hidden` (in-card label) and `xl:font-medium` → `constellation:`. The label stays out of the a11y tree only where the constellation's trigger already names it. Comments updated. |
| `app/features/landing/ui/PurposeConstellation.vue` | **Removed the `@media (hover: none)` block** that showed all three cards at once. The constellation is never displayed under `hover: none` now, so the block was dead code, and it was the iPad bug that started the 80rem detour. The `:hover` / `:focus-visible` reveal is unchanged. Comments updated. |
| `PurposeCarousel.vue`, `logic/usePurposeArcRadii.ts`, `PurposeSection.stories.ts` | Comments only. The arc-radii guard is a zero-rect check on the hidden wrapper and does not depend on a breakpoint. Its ResizeObserver also fires when a pointer change flips the composition, because the section height changes. Round 2's observer fix and round 3's hidden scrollbar are untouched. |
| Tests | `PurposeCard/PurposeSection/PurposeCarousel/PurposeConstellation.test.ts` and `usePurposeArcRadii.test.ts`: `xl:` → `constellation:`. The PurposeCard test now rejects any `sm/md/lg/xl/2xl:` class. New describe in `tests/tablet-layout-tokens.test.ts` (7 tests). It pins the exact variant declaration and checks that `(hover: hover) and (pointer: fine)` appears exactly once in global.css. It checks that none of the 4 Purpose components has an `sm/md/lg/xl/2xl:` class, `80rem` or `@media (hover: none)`. It checks that the section has exactly 3 `hidden … constellation:flex/block` pieces plus the carousel's `constellation:hidden`, and that the `:hover` and `:focus-visible` reveal selectors for `.link`, `.card` and `.radar` are present. |

## Verification (headless Chrome 155 via CDP)

Setup: build copied to the scratchpad and served on :8796, Chrome on :9351.
Both were stopped afterwards, and the user's :3000 (pid 67701) was left
running. Mouse emulation set `hover: hover`, `pointer: fine`, `any-hover:
hover` and `any-pointer: fine`. Touch emulation used
`setTouchEmulationEnabled` + `setEmitTouchEventsForMouse` + `mobile: true`
with `hover: none`, `pointer: coarse` and `any-*` set to match. ES and EN gave
identical results.

| Input | Width | Variant matches | Visible | Arcs / origin glow | In-card label | Interaction |
|---|---|---|---|---|---|---|
| mouse | 390 | no | carousel | hidden | shown, 600 | dot 3 → 535 / dot 1 → 0, centred = undimmed = `aria-current` |
| mouse | 1023 | no | carousel | hidden | shown, 600 | same |
| mouse | 1024 / 1280 / 1440 | yes | constellation | shown | hidden, 500 | rest opacities 0,0,0. Hover on How's radar gives 0,1,0, and moving away gives 0,0,0. Tab to the first trigger: `:focus-visible` true, giving 1,0,0 |
| touch | 390 / 768 / 1024 / 1180 / 1366 | no | carousel | hidden | shown, 600 | swipes ←,←,→ give scrollLeft 268/535/268. Tapping dot 3 gives 535 and dot 1 gives 0. At every step the centred card, the undimmed card and the `aria-current` dot agree |

In every row exactly one composition has a box. The other is `display: none`,
so its copy is not announced twice. The arcs and the origin glow follow the
constellation, and the in-card label follows the carousel.
`documentElement.scrollWidth` equals the viewport everywhere.

**1440 with a mouse vs master.** This is INFERRED and was not pixel-diffed
this round. With a mouse at ≥1024 the variant emits the same declarations
master's `lg:` did. The only removed rule (`hover: none`) cannot match with a
mouse. Round 1 already diffed 1440 against the pre-change build.

## Behaviour changes worth telling Roberto

1. **Mouse 1024–1279 is back on the constellation** (round 1 had moved it to
   the carousel), as he asked.
2. **Hybrid devices follow the primary pointer.** A touchscreen laptop whose
   primary pointer is a trackpad gets the constellation, and touching a dot
   there only reveals through focus or emulated hover. An iPad with a Magic
   Keyboard trackpad reports a coarse primary pointer in iPadOS Safari/Chrome,
   so it stays on the carousel. This is INFERRED from how WebKit reports
   media features and was not measured on a device.
3. Real iPad / Safari is still UNVERIFIED. Everything here is Chrome emulation.

## Checks

`./init.sh` exit 0: typecheck, Biome, **96 files / 1375 tests** (1368 + 7),
generate, storybook:build.
