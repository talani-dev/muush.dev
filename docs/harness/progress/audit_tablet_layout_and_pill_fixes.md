# Audit (phase A) — feature 38 `tablet_layout_and_pill_fixes`

Date: 2026-10-19 · Branch `feat/tablet-layout-and-pill-fixes` · Read-only phase:
no file in `app/`, `tests/`, `public/`, config, `feature_list.json` or
`docs/business/` was edited.

## How this was measured

- `pnpm generate` (clean), `.output/public` served by `python3 -m http.server`
  on 127.0.0.1:8765. System Google Chrome 155, headless, driven over the
  DevTools protocol (`Emulation.setDeviceMetricsOverride`, DPR 1, `mobile: false`
  — what iPadOS Safari reports as a desktop-class browser), fonts awaited before
  every probe. Both server and Chrome were killed afterwards; the working tree
  is unchanged apart from this file.
- Throwaway scripts and outputs live in the scratchpad
  `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/e5208577-2f90-4d71-9ada-14f28d58646f/scratchpad/`
  (`measure.mjs`, `probe2.mjs`, `m_*.json` raw data, `shots/`).
- Every number below is **MEASURED** in Chrome unless labelled COMPUTED. No
  WebKit/Safari measurement was possible (see problem 2).
- `<main>` is `mx-auto max-w-shell-max px-page`; `--spacing-page` =
  `clamp(24px, 3.2px + 5.3333vw, 80px)` → 57.8 @1024, 66.1 @1180, 71.5 @1280,
  76.1 @1366, 80 from 1440. Content box = [57.8, 966.2] @1024 … [80, 1360]
  @1440, [320, 1600] @1920. The layout root has `overflow: clip`, so the
  overflow never shows a scrollbar — content is silently **cut**, which is
  exactly what Roberto saw.

Screenshots (scratchpad `shots/`):
`full-es-1024.png`, `full-es-1280.png`, `full-nosotros-1024.png` (full page,
50 %), and per-Pill crops `es1024-*.png`, `es1440-*.png` (DPR 2).

---

## Problem 1 — forms cut off

### Measured cause — leader's inference CONFIRMED

Both sections switch to two columns at `width >= 64rem` (1024 — so an iPad Air
13" portrait, exactly 1024 CSS px, gets the desktop layout) with fixed-clamp
tracks:

- Contact: `grid-template-columns: var(--contact-left-w) var(--contact-form-w)`
  + `column-gap: var(--contact-col-gap)` (64).
- Work: `var(--work-left-w) var(--work-form-w)` + `--work-col-gap` (100).

The clamps are linear 390↔1440 interpolations, so they shrink far slower than
the content box. COMPUTED from the tokens and matching the measurements to
0.1 px:

- Contact overflow past the content edge = `556.8 − 0.38667·W` px
- Work overflow past the content edge = `606.2 − 0.42095·W` px

Both reach zero **only at W = 1440**. Every width from 1024 to 1439 overflows.

| Width | Contact: past viewport | Contact: past content edge | Work: past viewport | Work: past content edge |
|---|---|---|---|---|
| 1023 | 0 (stacked) | 0 | 0 (stacked) | 0 |
| **1024** | **103.0** | 160.8 | **117.3** | 175.1 |
| 1100 | 69.6 | 131.5 | 81.2 | 143.1 |
| **1180** | **34.4** | 100.5 | **43.3** | 109.4 |
| **1280** | 0 | **61.9** (right margin 71.5 → 9.6) | 0 | **67.4** (margin → 4.1) |
| **1366** | 0 | **28.6** | 0 | **31.2** |
| 1400 | 0 | 15.5 | 0 | 16.9 |
| **1440** | 0 | 0 | 0 | 0 |
| 1600 / 1920 | 0 | 0 | 0 | 0 |

ES and EN are identical (track widths do not depend on copy). Track widths at
1024: contact 471.2 + 534 (+64), work 449.5 + 534 (+100), in a 908.4 content
box. Between 1280 and 1439 the form does not leave the viewport, but it eats
the right page margin — the acceptance ("no desbordan") fails there too.

Sub-elements at the currently stacked widths (320, 390, 768, 1023, both forms,
both locales): **no descendant of either form passes the form card or the
content edge** (the only `scrollWidth > clientWidth` hits are `sr-only`
elements, which is by design). The Correo/WhatsApp radio row is one line from
390 up and wraps to two lines at 320 (inside the card, no overflow). Submit
button is full width below 1024 (222 @320 → 845 @1023), 216 px centred from
1024 (`lg:w-btn-submit-w lg:self-center` in `ContactForm.vue` /
`ApplicationForm.vue`).

### Proposed fix (simulated in the browser by injecting CSS, then measured)

1. **Stack below 80rem (1280)** in both sections: move the two `@media
   (width >= 64rem)` blocks to `@media (width >= 80rem)`. Below it both
   sections keep their existing mobile flow — text above, form below at full
   content width (and for Contact, the alt route third, after the form —
   the existing DOM order).
2. **Above 80rem, fluid columns that reproduce 1440 exactly**: replace the
   clamp tracks with proportional tracks —
   contact `minmax(0, 556fr) minmax(0, 660fr)`,
   work `minmax(0, 520fr) minmax(0, 660fr)` — gaps unchanged (64 / 100).
   At ≥1440 the content box is 1280, so the tracks resolve to exactly
   556/660 and 520/660: **zero change to the 1440 composition** (measured:
   556 / 660.03 and 520 / 660.02 at 1440; 556/660 and 520/660 at 1920).
   Note `fr` cannot be used inside `calc()`, so the token has to hold the
   whole track list (e.g. `--contact-cols` / `--work-cols` in `:root`, read by
   the scoped rule per `rules.md` § R18) or the two ratio numbers written in
   the scoped rule with a comment; implementer's choice.

Simulated result (both locales, both pages):

| Width | Layout | Text block | Form | Past viewport / content |
|---|---|---|---|---|
| 1024 | stacked | 908.4 wide | 908.4 wide, x 57.8 | 0 / 0 |
| 1180 | stacked | 1047.8 | 1047.8 | 0 / 0 |
| 1279 | stacked | 1136.2 | 1136.2 | 0 / 0 |
| 1280 | 2 cols | contact 490.7 · work 457.0 | contact 582.4 · work 580.1 | 0 / 0 |
| 1366 | 2 cols | 525.8 · 490.9 | 624.1 · 623.0 | 0 / 0 |
| 1440 | 2 cols | 556 · 520 | 660 · 660 | 0 / 0 |

No form descendant overflows at any of those widths; the radio row stays one
line (846–1069 wide when stacked); the submit button stays 216 centred
(desktop `lg:` classes) in the stacked 1024–1279 range — see D3.

Implementation traps found while simulating:
- The `≥64rem` rule sets `align-items: start` on the grid. If the stacked
  range is produced by overriding rather than by moving the media query, the
  flex column inherits `align-items: start` and the form collapses to its
  content width (measured 315–363 px). Moving the whole block to `≥80rem`
  avoids it.
- `WorkWithMuushSection.vue`'s `.work-layout__form { margin-top: -30px }` must
  stay inside the two-column rule (it would otherwise pull the form into the
  text when stacked).

Files: `app/features/landing/ui/ContactSection.vue`,
`app/features/about/ui/WorkWithMuushSection.vue` (media query + track source),
`app/assets/css/global.css` (`--contact-left-w`, `--contact-form-w`,
`--work-left-w`, `--work-form-w` become dead → replace with the track tokens
and update their comments; `--contact-col-gap`, `--contact-left-gap`,
`--work-col-gap`, `--work-form-y-offset` unchanged). No test references these
tokens (grep of `tests/`).

Risk to 1440: none measured (identical track widths at 1440 and above). The
only visible changes are in 1024–1439.

---

## Problem 2 — Pills of different size

### Measured: no size difference exists in Chrome

Every visible section Pill on all four pages, at 320, 390, 768, 1023, 1024,
1100, 1180, 1280, 1366, 1400, 1439, 1440, 1600, 1920:

| Property | Value (all Pills, every width) |
|---|---|
| height | **40** |
| padding (top/start/end) | 9 / 10 / 20 |
| gap | 11 |
| label font-size | identical per width: 12 @≤390, 12.35 @768, 12.60 @1024, 12.75 @1180, 12.84 @1280, 12.92 @1366, 12.99 @1440, 13 @≥1600 |
| weight / letter-spacing / family | 500 / 0.054em / Instrument Sans |
| radar footprint | 20 × 20 |
| transform / scale / zoom on the Pill or any ancestor | none (checked the full chain for every Pill) |

The services canvas animates only a registered custom property
(`--services-float-phase`) and the per-node `translate` is on `.node`, not on
the Pill. The Pill crops at DPR 2 (`shots/es1024-1-Prop_sito.png` vs
`shots/es1024-2-Servicios.png`) are visually the same capsule.

The **only** dimension that differs is width, and only because of the label
length (Pill is content-sized by design — `design-extract.md` § 3: "solo
cambia el texto"):

| @1024 | ES | EN |
|---|---|---|
| Hero eyebrow | 238.5 | 238.5 |
| Propósito / Purpose | **126.4** | **116.9** |
| Servicios / Services | 122.1 (−4.3) | 118.1 (+1.2) |
| Delivery | 116.5 (−9.9) | 116.5 (−0.4) |
| Contacto / Contact | 123.4 (−3.0) | 115.4 (−1.5) |
| Nosotros / About us | 122.0 | 121.3 |
| Work with muush | 176.0 | 176.0 |

So in ES "Servicios" and "Delivery" are 4–10 px narrower than "Propósito";
in EN "Services" is actually wider than "Purpose".

### What Roberto may have seen (UNVERIFIED — needs his screenshot/device)

- H1: the 4–10 px width difference from the shorter label, read as "smaller".
- H2: the Servicios/Delivery Pills sit 22 px further right than Propósito at
  1024 (problem 3), which makes them read as a different element.
- H3: a WebKit-specific rendering on the iPad (Safari) — I could not run
  Safari/WebKit (enabling `safaridriver` is a system change outside this
  phase), so this is not ruled out.

### Proposed fix

No code change is justified by the Chrome measurements. If Roberto confirms
H2, problem 3's fix closes it. If he means equal **widths**, that is a new
visual rule (a min-width on the Pill), not in the design — a human decision
(D6). The acceptance criterion ("mismo alto, padding, tipografía y radar que
Propósito") is already met in Chrome at every width measured.

Side note for the leader (Q2): code comments quote the design Pill as 127×38 /
118×38, and we render **40** tall (border 1 + padding 9 + radar 20, ×2).
Uniform across all Pills, so it is not this bug, but it is a 2 px deviation
from the design if Pencil draws the 1 px stroke inside.

---

## Problem 3 — Pills misaligned on x

### Measured cause

Every section Pill sits on the content edge (`--spacing-page`) **except the
two in the desktop Services constellation** (`Servicios` eyebrow and
`Delivery`, `ServicesConstellation.vue`). They are absolutely positioned in
`.canvas`, which breaks out of `<main>`'s padding to `<main>`'s border box,
at a fixed `left: var(--services-pill-x)` / `var(--services-closer-x)` = **80
px**. 80 equals the page margin only when the margin is at its max, i.e. from
1440 up; below that the Pill is offset by `80 − page`.

Left x of every section Pill (home, both locales identical):

| Width | Hero | Propósito | **Servicios** | **Delivery** | Contacto | Offset |
|---|---|---|---|---|---|---|
| 1024 | 57.8 | 57.8 | **80** | **80** | 57.8 | **+22.2** |
| 1180 | 66.1 | 66.1 | **80** | **80** | 66.1 | +13.9 |
| 1280 | 71.5 | 71.5 | **80** | **80** | 71.5 | +8.5 |
| 1366 | 76.1 | 76.1 | **80** | **80** | 76.1 | +3.9 |
| 1440 | 80 | 80 | 80 | 80 | 80 | 0 |
| 1600 | 160 | 160 | 160 | 160 | 160 | 0 |
| 1920 | 320 | 320 | 320 | 320 | 320 | 0 |

Below 1024 (timeline) all Pills are at the content edge (24 @390, 44.2 @768).
About/Nosotros: hero Pill and Work with muush Pill are both on the content edge
at every width (0 offset).

Also found: `ServicesTimeline.vue`'s eyebrow carries `left-services-pill-x`,
which generates **no CSS** (`--services-pill-x` is a `:root` token, not an
`@theme` one; the built CSS has no such utility). It is a dead class; the
mobile Pill is correctly placed by its static position.

### Proposed fix

In `ServicesConstellation.vue`: `.eyebrow { left: var(--spacing-page) }`,
`.closer { left: var(--spacing-page); width: calc(100% - 2 * var(--spacing-page)) }`.
Since `.canvas`'s left is `<main>`'s border-box left at every width, this lands
both Pills on the content edge everywhere and is **identical at ≥1440**
(page = 80, canvas = 1440 → closer 1280). Then `--services-pill-x`,
`--services-closer-x`, `--services-closer-w` become dead in `global.css`
(delete + fix the comments that reference them), and the dead
`left-services-pill-x` class in `ServicesTimeline.vue` should go.

Risk: below 1440 the closer becomes narrower (908 @1024 instead of 1280) so the
Delivery copy wraps to more lines; the closer is absolutely positioned at
`--services-closer-y` (810) inside a 910-tall canvas, so a third line could
reach the canvas bottom / the Contact section's top. Must be measured after
the change (it is currently cut off instead — see F4).

---

## F4 — additional finding: the Services constellation is cut between 1024 and 1439

Not one of the three reported problems, but the same class (fixed 1440
geometry shown below 1440) and visible in `shots/full-es-1024.png`. Every node
x is a fixed px offset from the 1440 frame; the canvas is only as wide as the
viewport, and the layout root clips:

| Width | Node 4 text (946–1178) | Node 5 radar (1135–1165) / text (1146–1378) | Delivery copy right edge |
|---|---|---|---|
| 1024 | 154 px cut | radar **entirely off-screen**, text entirely off-screen | 1360 → 336 px cut |
| 1180 | inside | radar visible, text 198 px cut | 180 px cut |
| 1280 | inside | text 98 px cut | 80 px cut (eats margin) |
| 1366 | inside | text 12 px cut | inside the viewport (past content edge) |
| ≥1440 | fine | fine | fine |

Options (D5): (a) show `ServicesTimeline` until a higher breakpoint (e.g. 90rem)
— consistent with Roberto's "stack when it does not fit"; (b) make node x
proportional to the canvas (`x / 1440` as a percentage) — nodes would crowd
(node 4→5 spacing 200 → 142 px at 1024 vs 232-px text blocks; COMPUTED); (c) a
real tablet composition from the `.pen` (Q1). Do **not** scale the canvas with
`transform`/`zoom`: that would shrink the Pills inside it and create exactly
problem 2.

---

## Proposed scope for the implementer (after approval)

| File | Change |
|---|---|
| `app/features/landing/ui/ContactSection.vue` | two-column rule `64rem → 80rem` (per D1); tracks from the proportional token |
| `app/features/about/ui/WorkWithMuushSection.vue` | same; keep `margin-top` offset inside the two-column rule |
| `app/assets/css/global.css` | replace `--contact-left-w/-form-w`, `--work-left-w/-form-w` with track tokens; delete `--services-pill-x`, `--services-closer-x`, `--services-closer-w`; update their comments |
| `app/features/landing/ui/ServicesConstellation.vue` | `.eyebrow`/`.closer` on `--spacing-page`; closer width = content width |
| `app/features/landing/ui/ServicesTimeline.vue` | drop dead `left-services-pill-x` class |
| `app/features/forms/ui/ContactForm.vue`, `ApplicationForm.vue` | only if D3 = full-width button while stacked (`lg:` → `xl:`) |
| Services breakpoint (`ServicesSection.vue` `lg:` → new) | only if D5 is taken into this feature |

`Pill.vue` needs no change (problem 2) unless D6 decides otherwise.

Verification the reviewer can repeat: the scratchpad scripts measure form
overflow, Pill boxes and Pill x at any width list in ~1 min per page.

---

## Questions for the leader (need the `.pen`)

- **Q1.** Is there any frame between 390 and 1440 (tablet, 1024, 1280) for
  Contacto, Work with muush or Servicios? If yes, its geometry decides D1/D5.
- **Q2.** Pill frame stroke alignment in Pencil (inside vs outside/centre):
  is the design Pill 38 tall (we render 40) or 40?
- **Q3.** `--contact-left-w` (556) and `--contact-col-gap` (64) are marked
  UNVERIFIED in `global.css`; they now become the fluid ratio. Please confirm
  the Contacto frame's left-block width and column gap at 1440.
- **Q4.** Confirm the Servicios eyebrow and Delivery Pill x in frame `GiLTU`
  is 80 = the page margin (i.e. the intent is "content edge", not "80 from the
  frame") — the proposed fix assumes it.

## Open decisions for Roberto

- **D1.** Stack breakpoint for both forms: **80rem / 1280 (recommended)** —
  iPad 13" portrait (1024/1032) and 11" landscape (1180/1194) stack; 13"
  landscape (1366/1376) and laptops ≥1280 get two columns with a 582–660 px
  form. Alternatives: 90rem (two columns only at the design width), or stay
  at 64rem with fluid columns (form 459 px at 1024 — the thinner form he said
  he does not want).
- **D2.** Above the breakpoint, proportional columns that keep the 1440 ratio
  (recommended) vs fixed form width with a flexible text column.
- **D3.** Submit button in the stacked 1024–1279 range: keep the desktop
  216 px centred (no forms-file change, recommended) or full width as below
  1024 (touches `forms/`).
- **D4.** Text block when stacked runs up to 1136 px wide at 1279 (~150
  characters per line of body copy). Cap it (e.g. at the 1440 left-column
  width 556 / 520) or leave it full width as the 768–1023 range already does
  today. A cap would also change 768–1023.
- **D5.** F4 (Services constellation cut 1024–1439): include in feature 38 or
  open a separate feature; and which option (a/b/c).
- **D6.** Pill "size": in Chrome they are identical except label-driven width.
  Which screen/device was the screenshot from, and does he want equal widths
  (new rule, not in the design) or was it the x offset (fixed by problem 3)?
- **D7.** With D1 = 80rem, Contacto/Work switch layout at 1280 while
  Propósito/Servicios/Hero switch at 1024. Each section still has a single
  breakpoint, but the site no longer shares one. Accept?
