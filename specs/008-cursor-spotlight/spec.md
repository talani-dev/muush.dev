# Feature Specification: Cursor spotlight

**Feature Branch**: `feat/cursor-spotlight`
**Created**: 2026-09-07
**Status**: Draft
**Input**: Feature id 8 in `feature_list.json` (`cursor_spotlight`, `"sdd": true`, `depends_on: [6]`). A radial glow that follows the pointer across the whole page, plus the requirement that the dotted paper's dots brighten inside its radius. Recipe extracted by the leader from `.pen` frame `gViAx` "DEMO spotlight cursor" on 2026-09-07 and cross-checked against `docs/business/landing/ui-map.md` § 10.

## Overview

Feature 6 painted the page: an ink base, a field of section glows, a sheet of
dotted paper, content on top. All four layers are static — the page looks the
same whether or not a person is there.

This feature adds the one background element that answers the visitor: a soft
red light that follows the cursor across the entire page, and a lift in the
dotted paper wherever that light falls. It is the first row of `ui-map.md`
§ 10 — *"Efectos que dependen de JavaScript (con fallback sin JS)"* — so
scripting is anticipated by the design rather than smuggled past it, and
`content.md` names the reference out loud: *"Dotted paper estilo
atlassian.design con spotlight de cursor (JavaScript)"*.

Three things make it more than a decorative circle:

1. **It is the only page-wide interactive effect.** Every other JavaScript
   effect in § 10 belongs to one section on one breakpoint. This one runs
   across both pages, in both locales, over every section.
2. **It has to touch a layer it must not own.** `ui-map.md:271` requires the
   dots *inside the radius* to brighten. The dot sheet belongs to feature 6
   and is frozen. The paint-order contract (`rules.md` § R28) has exactly two
   negative levels and no room between the dots and the content. Resolving
   that is the substance of this feature — see § *The dot-brightening
   decision*.
3. **It must cost nothing when it is off.** Touch pointers, reduced motion,
   and scripting disabled are three separate off-switches, and in all three
   cases the page must be byte-for-byte the background feature 6 renders.

### What this feature is not

It does **not** rebuild, retune or re-specify `DotGrid.vue`,
`SectionBackdrop.vue` or `SectionGlow.vue`. All three are `done`, their prop
and class contracts are fixed, and this feature composes over them. The only
files of feature 6's that this feature edits are `app/assets/css/global.css`
(new tokens plus the two amended layer values, § FR-016) and
`app/layouts/default.vue` (it renders one more layer).

It does **not** place any section glow, build any section, or change the type
scale, the shell or the routing.

It does **not** touch the three items feature 7 owns — `SectionGlow.vue`'s
stale "22 / 12 on Landing" comment, `SectionGlow.stories.ts`'s copy of it, or
the dead `'920'` size variant. Feature 7 is `pending` and those are its diff.

### Source of truth and evidence discipline

Every value below is **CONFIRMED** against the design file (through the
leader), **DERIVED** with the arithmetic shown, or recorded as an
**ASSUMPTION** / **UNVERIFIED** with an owner and a reversal cost. The `.pen`
is not opened here: the Pencil bridge exists only in the main interactive
session (Constitution, *Development Workflow*; `rules.md` § R32).

The leader supplied a reading of frame `gViAx` ("DEMO spotlight cursor") taken
from `/Users/betonajera/Documents/Muush/Landing Page/muush.pen` on 2026-09-07.
Per § R32 that reading **outranks any value in `docs/business/`**, and where
a value is missing the answer is to ask the leader, never to fall back to a
document. One value is missing and is asked for rather than invented — see
A-03.

Frame `gViAx` draws **three static states** (`Estado 1`, `2`, `3`), each a
copy of the full Landing page with the two circles over it and a drawn cursor,
and its legend reads:

> *"Spotlight del cursor · 3 posiciones (el seguimiento lo programa Roberto)"*

The design therefore **defers the tracking to code by intent**. Three drawn
positions are the design file's way of specifying a moving thing; they are not
three states to implement. This spec treats them as three samples of one
continuous behaviour, and reuses that idea in the catalogue (FR-020).

### Measurement provenance

| Value | Source | Status |
|---|---|---|
| Two concentric circles, `cornerRadius: 999`, both radial gradients | Frame `gViAx`, all three states | **CONFIRMED** |
| Outer "Spotlight" 660×660 → radius 330px | `gViAx`; `ui-map.md:270` says "radio ~330px" | **CONFIRMED by both sources** |
| Inner "Núcleo" 180×180 → radius 90px | `gViAx`; `ui-map.md:270` says "núcleo interior ~90px" | **CONFIRMED by both sources** |
| Outer centre `#CF31476B` → red-400 at 42% | `gViAx`; `ui-map.md:270` says "Red 400 al 42% en el centro" | **CONFIRMED by both sources**; alpha DERIVED: `0x6B` = 107/255 = 41.96% |
| Outer mid stop `#CF31472B` at position 0.42 → red-400 at 17% | `gViAx` only | **CONFIRMED against the frame**; the document does not mention a mid stop at all (see D-01) |
| Núcleo centre `#CF31475E` → red-400 at 37% | `gViAx`; `ui-map.md:270` says "núcleo interior … al 37%" | **CONFIRMED by both sources**; alpha DERIVED: `0x5E` = 94/255 = 36.86% |
| Base colour `#CF3147` = `red-400` | `branding.md` ramp | **CONFIRMED** |
| Outer stop `#26262600` = ink-500 at zero alpha → `transparent` in CSS | `gViAx`; precedent set by `SectionGlow.vue` | **CONFIRMED** — gradients premultiply by alpha, so a fully transparent stop's hue is never read |
| The two circles are concentric with each other and with the cursor tip | `gViAx`, arithmetic below | **CONFIRMED across all three states** |
| No blend mode is recorded on either circle | `gViAx` | **CONFIRMED** — the circles composite normally; see § *The dot-brightening decision* |
| Desktop only, whole page | `ui-map.md` § 10, row 1: "Escritorio, toda la página" | **CONFIRMED** |
| No-JS fallback: "Fondo normal, sin glow — no se pierde contenido" | `ui-map.md` § 10, row 1 | **CONFIRMED** |
| `prefers-reduced-motion: reduce` turns it off | `ui-map.md` § *Movimiento reducido* — the spotlight is listed **first** | **CONFIRMED** |
| The reference is atlassian.design's dotted paper | `content.md` § *Dirección visual* | **CONFIRMED** |
| None of 42 / 17 / 37 exists as a token | Verified in `app/assets/css/global.css`: the red-400 glow tokens are 65, 60 and 12 only | **CONFIRMED** |
| Brightness of a lit dot | Nowhere — a static mockup cannot draw it | **UNVERIFIED** — see A-03 |
| Fade duration when the pointer leaves the window | Nowhere | **UNVERIFIED** — see A-08 |

**Concentricity, verified.** The frame records each circle by its top-left
corner, so concentricity is arithmetic, not eyeballing. Outer centre =
`(x + 330, y + 330)`; núcleo centre = `(x + 90, y + 90)`:

| State | Outer x,y → centre | Núcleo x,y → centre | Cursor x,y |
|---|---|---|---|
| 1 | 50, −30 → **380, 300** | 290, 210 → **380, 300** | 376, 296 |
| 2 | 570, −150 → **900, 180** | 810, 90 → **900, 180** | 896, 176 |
| 3 | 850, 100 → **1180, 430** | 1090, 340 → **1180, 430** | 1176, 426 |

The two centres coincide **exactly** in all three states, and the drawn cursor
sits 4px up and to the left of the shared centre in all three — i.e. the
cursor *hotspot* is the centre and the 4px is the glyph's own offset, constant
across states. **The effect is centred on the pointer position, not on the
drawn arrow's top-left corner** (DERIVED, and the same 4,4 in three
independent samples).

### Discrepancies

- **D-01 · The mid stop exists only in the design file.** `ui-map.md:270`
  describes the outer circle as a single value ("radial Red 400 al 42% en el
  centro, radio ~330px"), while the frame draws **three** stops: 42% at 0,
  17% at 0.42, transparent at 1. The two sources do not conflict — the
  document is less specific, not wrong — but a spec written from the document
  alone would have shipped a two-stop gradient with a visibly different
  falloff. **The design file wins** (`rules.md` § R32): three stops.
  **Action: `ui-map.md:270` gains the middle stop.** **Owner: Clau.**
  This is the second time in three features that `docs/business/` has been
  found less current than the `.pen`; unlike D-01 of feature 6, this one is an
  omission rather than a contradiction.

- **Beware the coincidence.** The mid stop's **position** is `0.42` and the
  centre's **opacity** is `42%`. They are unrelated numbers that happen to
  share digits. Any implementation, comment or test that treats them as one
  value is wrong, and this spec names them separately everywhere for that
  reason.

## Clarifications

### Session 2026-09-07

Three questions had no answer in any document. All three are decided here
rather than deferred, per the leader's instruction; each carries an owner and
a reversal cost.

- **Q**: `ui-map.md:271` requires the dotted paper's dots to brighten inside
  the radius, but feature 6's dot sheet is a single page-wide layer that sits
  **above** the glows, and `rules.md` § R28 leaves no level between the dots
  and the content. How does a spotlight brighten a layer it must not own?
  → **A**: **The spotlight paints a second copy of the dot recipe, confined to
  its own radius, on a new third negative level above the dots.** § R28 gains
  one row and its two existing values shift down; nothing else about the
  contract changes. The full comparison of the four candidate mechanisms is in
  § *The dot-brightening decision*, and the amended rule is FR-016 / A-01.

- **Q**: Is the effect viewport-fixed (glued to the pointer, ignoring the
  page) or document-positioned (living in page coordinates)?
  → **A**: **Document-positioned, driven by page coordinates**, with scroll
  folded into the same update as pointer movement. Both options need a scroll
  handler — one to move the light, the other to keep the lit dots registered
  with the page grid — and their failure modes under a dropped frame are not
  equal: a late frame in the document-positioned form makes the whole effect
  trail the cursor for one frame, while a late frame in the viewport-fixed
  form misregisters the lit dots against the base dots and shows **doubled
  dots**, a visible artifact. One coordinate space, one worse-case that reads
  as softness rather than as a bug. See A-05.

- **Q**: Does the spotlight run on Nosotros too, or only on Landing? § 10's
  row says "toda la página" inside the Landing UI map; frame `gViAx` copies
  the Landing; and Nosotros' own § 9 does not mention it.
  → **A**: **Both pages.** It is site chrome and it lives in the layout, the
  same decision feature 6 made for the dotted paper, which § 10 also documents
  only under Landing. An effect that vanished when the visitor clicked
  "Nosotros" would read as a bug, not as a boundary. See A-02.

## The dot-brightening decision

`ui-map.md:271` — *"Los puntos del dotted paper dentro del radio suben de
brillo"* — is the one requirement no static mockup can draw, and frame `gViAx`
does not draw it: the three states show the two circles over an ordinary dot
field. It is also the requirement that crosses feature 6's contract, so the
decision is recorded here in full rather than left to the plan.

**Four candidates were weighed.**

| # | Mechanism | Verdict |
|---|---|---|
| 1 | A blend mode (`screen`) on the spotlight layer | **Rejected.** `screen` *reduces* the dots' contrast: with light `R`, dot `D`, background `B`, the gap becomes `(1−R)(D−B)`. The dots inside the radius would wash out, which is the opposite of the requirement. |
| 2 | A blend mode (`plus-lighter`) on the spotlight layer | **Rejected**, though it is the closest miss. It raises the dots' absolute brightness and keeps `D−B` constant, so the dots are brighter but no more distinct than outside the radius — and § 271 singles the dots out precisely because the glow already brightens everything. It also departs from the frame, which records **no** blend mode on either circle. |
| 3 | Amend the layer contract so the spotlight sits *below* the dots | **Rejected.** The light would be buried under the section glows (up to 65% opacity in the Hero and CTA), exactly where the page is brightest, and the frame draws the circles **over** the page copy. Curiously, the lit dots would still work from below — see the note on commutativity — but the light would not. |
| 4 | **A second dot sheet, masked to the spotlight radius** | **Chosen.** |

**The chosen mechanism.** The spotlight layer carries two things that travel
together: the two gradients from the frame, and a second copy of the dot
recipe clipped to the same radius. Inside the radius the dot pattern is
therefore painted twice; outside it, once. The base sheet is not touched,
not read, and not depended on beyond the fact that it exists.

*Why it wins:*

- It is the atlassian.design behaviour `content.md` names as the reference —
  the dots gain **contrast**, not just luminance.
- It invents no colour. The second sheet reuses the existing
  `--dot-paper-*` recipe, so the brightening is the arithmetic of painting
  12% twice: `1 − (1 − 0.12)² = 22.6%` — **DERIVED**, not chosen. A named
  token stands in front of it so the value is tunable in one place when Clau
  gives one (A-03).
- It keeps the frame's gradients compositing normally, exactly as drawn.
- Measured against `ink-500`: outside the radius a dot reads 59 against a
  background of 38 (a gap of 21). Inside, under the 42% light, a base dot
  would be veiled to a gap of 12; the second sheet lifts the dot to ≈133 R
  against ≈109 (a gap of ≈24 per channel). **DERIVED** — the dots inside are
  both brighter and more distinct than outside, which is what § 271 asks for.

*What it costs:*

- **One new level in `rules.md` § R28.** Being above the dots requires a
  third negative level, and there is no integer between `−1` and `0`. The
  amendment is FR-016: `--layer-glow` becomes `−3`, `--layer-dots` becomes
  `−2`, and the new `--layer-spotlight` takes `−1`. **The relation the rule
  protects is unchanged** — glows below dots below content — and both existing
  layers keep their token names, so `DotGrid.vue` and `SectionBackdrop.vue`
  do not change (their CSS names the token, never the number).
- **Two stale parentheses.** `DotGrid.stories.ts` and
  `SectionBackdrop.stories.ts` each print the old numbers inside a doc
  comment. This feature corrects those two lines, and nothing else in those
  files (FR-017). Leaving them would manufacture exactly the debt feature 7
  exists to pay off.
- **A registration constraint.** The second sheet's dots must land on the same
  24px grid as the base sheet at every pointer position and every scroll
  offset, or the two patterns show as doubled dots. This is a hard correctness
  requirement (FR-006), not a nicety.

**The commutativity note, recorded because it will be re-derived otherwise:**
two sheets of the *same* colour at the *same* positions produce the same final
pixel in either order — `1 − (1−a)(1−b)` is symmetric. The chosen level is
therefore about the **light**, not about the dots. If a future change ever
needs the spotlight lower in the stack, the dot half survives the move; the
gradient half is what would be lost.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The page answers the cursor (Priority: P1)

A visitor on a laptop moves the mouse across the landing. A soft red light
travels with the pointer: a wide, gentle field about 660px across with a
denser core at its centre, and wherever it passes, the dotted paper underneath
comes up out of the dark. Nothing else moves, nothing lags behind, nothing can
be clicked or selected. Scrolling with the mouse still, the light stays under
the cursor. Moving off the window, it fades out; coming back, it returns.

**Why this priority**: it is the feature. Everything else is a guard around
it.

**Independent Test**: open a generated page on a machine with a mouse, move
the pointer across the whole page including over sections and the footer,
scroll while stationary, and confirm the light tracks, the dots inside it lift,
and no interaction of any kind is affected.

**Acceptance Scenarios**:

1. **Given** a desktop browser with a mouse, **When** the pointer moves over
   the page, **Then** a two-part radial light follows it with its centre at
   the pointer.
2. **Given** the light over an area of dotted paper, **When** it is compared
   to the paper outside its radius, **Then** the dots inside are visibly
   brighter and more distinct, and are still on the same grid — no doubled or
   offset dots at the boundary.
3. **Given** the pointer held still, **When** the page is scrolled, **Then**
   the light remains centred on the pointer and the lit dots remain registered
   with the page's dot grid.
4. **Given** the pointer over any text, button or link, **When** the visitor
   clicks, hovers or selects, **Then** the behaviour is identical to before
   this feature — the light never intercepts anything.
5. **Given** a screen reader, **When** it walks the page, **Then** no
   spotlight element is announced.
6. **Given** the pointer leaves the window, **When** the visitor looks at the
   page, **Then** the light is gone rather than frozen mid-page.
7. **Given** the pointer near the top, bottom or side edge of the page,
   **When** the light would extend past the page box, **Then** it is clipped
   there and neither scrollbar moves, and the page's scrollable height does
   not change.
8. **Given** the English pages, **When** they are loaded, **Then** the effect
   is identical — it carries no copy and no locale.

---

### User Story 2 - It is absent whenever it should be (Priority: P1)

A visitor on a phone gets the page exactly as feature 6 renders it. So does a
visitor who has asked their system to reduce motion. So does a visitor with
scripting disabled. In none of the three does anything shift, disappear or
degrade — the page is simply the page.

**Why this priority**: tied with US1. `ui-map.md` § 10 and § *Movimiento
reducido* state all three, and a decorative effect that ignores a stated
accessibility preference is a defect, not a flourish. It is also the half a
reviewer can verify mechanically.

**Independent Test**: load the generated pages three ways — with a touch
pointer, with `prefers-reduced-motion: reduce`, and with JavaScript disabled —
and confirm the rendered background is identical to feature 6's in all three,
with no spotlight element in the document.

**Acceptance Scenarios**:

1. **Given** a device whose primary pointer is coarse or which cannot hover,
   **When** any page loads, **Then** no spotlight element exists and no
   pointer listener is attached.
2. **Given** `prefers-reduced-motion: reduce`, **When** any page loads,
   **Then** no spotlight element exists and no listener is attached, at any
   pointer type.
3. **Given** scripting is disabled, **When** any page loads, **Then** the
   background is exactly base + glows + dots, and no content is lost.
4. **Given** the prerendered HTML of all four routes, **When** it is
   inspected, **Then** it contains no spotlight markup at all — the effect is
   added after mount, never shipped in the document.
5. **Given** a visitor who plugs in a mouse, or who turns reduced motion off
   while the page is open, **When** the preference changes, **Then** the
   effect starts or stops without a reload.
6. **Given** any of the three off-states, **When** the page is compared to
   feature 6's output, **Then** nothing about the base, the glows or the dots
   differs.

---

### User Story 3 - It costs nothing to run (Priority: P2)

A visitor whipping the pointer across a long page sees the light keep up
without the page stuttering, without scrolling getting heavier, and without
the machine's fans spinning up.

**Why this priority**: a background effect that costs frames is worse than no
effect. P2 only because it is verified by measurement on top of US1 rather
than independently.

**Independent Test**: record a performance trace while moving the pointer
continuously for five seconds over a full-length page, and inspect what work
each frame did.

**Acceptance Scenarios**:

1. **Given** a pointer emitting events faster than the display refreshes,
   **When** the trace is inspected, **Then** at most one visual update
   occurred per frame.
2. **Given** continuous pointer movement, **When** the trace is inspected,
   **Then** no frame shows layout or paint work attributable to the spotlight
   layers — only style and compositing.
3. **Given** continuous scrolling, **When** the trace is inspected, **Then**
   no listener blocked the scroll.
4. **Given** the effect is off (touch, reduced motion, no JS), **When** the
   trace is inspected, **Then** the spotlight contributes zero work of any
   kind.

---

### User Story 4 - The recipe is reviewable at rest (Priority: P3)

A reviewer opens the catalogue and sees the spotlight's gradient recipe
without having to chase it with a mouse: a story pins it at a fixed position,
the way the design file itself drew three fixed states, and a second story
lets it follow the pointer over real content.

**Why this priority**: Article X makes stories the review surface, and this is
the one component in the system whose whole point is invisible in a
screenshot. P3 because it is a review affordance rather than visitor-facing
behaviour.

**Independent Test**: build the catalogue and confirm the pinned story renders
the full recipe with no pointer involved and no Nuxt runtime.

**Acceptance Scenarios**:

1. **Given** the built catalogue, **When** the pinned story is opened,
   **Then** the two gradients and the lit dots are visible at a fixed
   position, over the real dotted paper on the real ink base.
2. **Given** the pinned story, **When** it renders, **Then** it needed no
   pointer event, no Nuxt composable and no Nuxt runtime (`rules.md` §§ R19,
   R23, R30).
3. **Given** the live story, **When** the reviewer moves the pointer over the
   canvas, **Then** the effect follows it exactly as on the site.
4. **Given** either story, **When** the reviewer compares it to the frame's
   `Estado 2`, **Then** the gradient falloff matches.

---

### Edge Cases

- **The pointer's position is unknown on load.** No pointer event has fired
  yet, and the page must not flash a red blob at the top-left corner. The
  effect appears only after the first qualifying pointer event.
- **The pointer leaves the window** (another window, the browser chrome, a
  second monitor). A light frozen mid-page reads as broken.
- **The pointer near the page's top, bottom or edge.** The light's box extends
  past the page in the design too — `Estado 1` and `Estado 2` both sit at
  negative y. It must be clipped without creating a scrollbar and, critically,
  **without extending the document's scrollable height**, which an
  unclipped absolutely-positioned box near the footer would do.
- **A very long page.** The effect lives in page coordinates over a document
  that may be 5000px+ tall; only the area around the pointer may ever be
  painted.
- **A hybrid device** — a laptop with both a touchscreen and a trackpad.
  The media query admits it (its primary pointer is fine), so a stray touch
  event must not teleport the light to a fingertip.
- **A preference that changes mid-session**: a mouse plugged in, or reduced
  motion toggled in the OS.
- **The mobile menu is open.** It is a touch-first surface at 390px, so the
  effect is off there by construction; the panel must in any case stay above
  every background layer, as feature 6's FR-008 requires.
- **Printing.** The effect is decorative and pointer-driven; it must not
  appear in print output or affect it.
- **A visitor who enlarges text.** The dot grid scales with the root font size
  (feature 6, A-03). The lit sheet must scale with it identically or the two
  patterns separate.
- **Two pages in two tabs.** The effect is per-document and holds no shared or
  persisted state.

## Requirements *(mandatory)*

### Functional Requirements — the light

- **FR-001**: The spotlight MUST render two concentric radial fields centred
  on the pointer: an outer field 660px across whose fill runs red-400 at 42%
  at the centre → red-400 at 17% at position 0.42 → transparent at the edge,
  and an inner core 180px across running red-400 at 37% at the centre →
  transparent at the edge. Both MUST be circular and MUST composite normally —
  frame `gViAx` records no blend mode.
- **FR-002**: The three opacities (42%, 17%, 37%) and the two diameters MUST
  each resolve through a **new named token** in
  `app/assets/css/global.css`. No component may carry the literal
  (Constitution Article VII).
- **FR-003**: The new tokens MUST NOT be named `--color-glow-*` or
  `--spacing-glow-*`. Those two prefixes are a **closed namespace owned by
  `SectionGlow.vue`**: `SectionGlow.test.ts` scans `global.css` for every
  token matching them and fails if one is not reachable through the
  component's props. A spotlight token in that family turns the existing suite
  red without touching a line of `SectionGlow.vue`.
- **FR-004**: The spotlight MUST NOT be built by extending `SectionGlow.vue`.
  Its opacity unions are the twelve pairs the design draws and adding 42/17/37
  changes a `done` contract; its two-stop recipe cannot express the mid stop
  anyway.
- **FR-005**: The effect MUST follow the pointer across the **whole page** —
  both pages, every section, the footer, and the gutters — not per section,
  and MUST stay centred on the pointer while the page scrolls.

### Functional Requirements — the dots

- **FR-006**: The dots of the dotted paper inside the spotlight's radius MUST
  be brighter and more distinct than the dots outside it
  (`ui-map.md:271`), and MUST remain on the **same grid** as the base sheet at
  every pointer position and every scroll offset. A visible doubled or offset
  dot anywhere is a failure of this requirement.
- **FR-007**: The brightening MUST be produced by the spotlight's own layer.
  `DotGrid.vue` MUST NOT change, MUST NOT gain a prop, and MUST NOT be read or
  measured at runtime.
- **FR-008**: The lit dots MUST fade out over the same radius as the light, so
  the two halves of the effect end together and no hard circular edge appears
  in the paper.
- **FR-009**: The lit sheet MUST resolve its geometry from the **same**
  `--dot-paper-*` tokens the base sheet uses, so the two can never drift apart
  — including when the visitor changes the root font size.

### Functional Requirements — when it must not run

- **FR-010**: The effect MUST NOT run on a device whose primary pointer cannot
  hover or is coarse (`ui-map.md` § 10: "Escritorio"). On such a device no
  element is rendered and no pointer listener is attached.
- **FR-011**: Under `prefers-reduced-motion: reduce` the effect MUST be off
  completely, at any pointer type, and the background MUST be exactly what
  feature 6 renders (`ui-map.md` § *Movimiento reducido*, where the spotlight
  is listed first).
- **FR-012**: With scripting disabled the page MUST render feature 6's
  background unchanged and lose no content. The spotlight MUST NOT appear in
  the prerendered HTML of any route — it is added after mount, which is also
  how FR-012 is verified.
- **FR-013**: A change to either media preference MUST take effect without a
  reload.
- **FR-014**: Even on an eligible device, a pointer event that did not come
  from a mouse MUST be ignored, so a touch on a hybrid laptop cannot move the
  light.
- **FR-015**: The effect MUST be decorative and inert: hidden from assistive
  technology, never intercepting a pointer, never focusable, and never part of
  the tab order or the accessibility tree.

### Functional Requirements — the layer contract

- **FR-016**: The paint-order contract (`rules.md` § R28) MUST be amended to
  **three** negative levels, and the amendment MUST be written into
  `rules.md`, into `app/layouts/default.vue`'s doc comment, and into the new
  component:

  | Level | What | Where it is written |
  |---|---|---|
  | root background | `ink-500` base | the layout |
  | `--layer-glow` (**−3**) | section glow groups | inside each section |
  | `--layer-dots` (**−2**) | dotted paper, page-wide | the layout, once |
  | `--layer-spotlight` (**−1**) | cursor spotlight: light + lit dots | the layout, once, after mount |
  | normal flow | nav, content, footer | everywhere |

  The relation § R28 protects is unchanged — glows below dots below content —
  and both existing levels keep their token **names**, so no component that
  consumes them changes.
- **FR-017**: The two doc comments that print the old level numbers
  (`DotGrid.stories.ts`, `SectionBackdrop.stories.ts`) MUST be corrected.
  **Only the numbers change**: no story, no render, no assertion, and nothing
  in `SectionGlow.stories.ts`, which belongs to feature 7.
- **FR-018**: `DotGrid.vue`, `SectionBackdrop.vue` and `SectionGlow.vue` MUST
  show **zero changed lines**. This feature composes over feature 6.
- **FR-019**: The spotlight layer MUST NOT create a stacking context anywhere
  between a section's glows and the layout root, MUST NOT alter the layout
  root's `isolation`/`position`/`overflow` behaviour, and MUST NOT change the
  page's scrollable width or height at any pointer position.

### Functional Requirements — cost, structure and gates

- **FR-020**: Pointer and scroll input MUST be coalesced to **at most one
  visual update per animation frame**, and that update MUST write CSS custom
  properties rather than restyling elements. Per frame the effect MUST cause
  no layout and no repaint of its own layers' contents — only style resolution
  and compositing. Listeners MUST be passive.
- **FR-021**: The tracking logic MUST live in a composable under a `logic/`
  directory; the rendering component MUST be presentational and MUST NOT
  attach listeners itself (Constitution Article V).
- **FR-022**: The rendering component MUST be drivable entirely from CSS
  custom properties set by an ancestor, so the catalogue can pin it without a
  Nuxt runtime and without a pointer (`rules.md` §§ R19, R23, R30).
- **FR-023**: The catalogue MUST carry **two** stories: one pinned at a fixed
  position reproducing a frame state, and one live over the composed
  background (Constitution Article X).
- **FR-024**: Tests MUST cover: the token mapping across the component/CSS
  boundary, the touch-pointer opt-out, the reduced-motion opt-out, the
  once-per-frame coalescing, and the absence of the effect from the
  prerendered artifact.
- **FR-025**: The feature MUST add no user-facing string and no locale key;
  i18n parity MUST be untouched (Constitution Article VI).
- **FR-026**: Rules discovered while specifying or implementing MUST be
  appended to `docs/business/rules.md`, never overwriting it, each citing this
  feature.
- **FR-027**: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate` and
  `pnpm storybook:build` MUST all pass, and every existing test MUST stay
  green with no modification made to accommodate this feature.

### Key Entities

- **Spotlight**: the moving light — an outer field and an inner core, sharing
  one centre, expressed as five values (two diameters, three opacities) plus
  one stop position.
- **Pointer position**: one pair of page coordinates, updated from pointer
  movement and from scrolling, published as two CSS custom properties. It is
  the only state the feature holds.
- **Lit paper**: the second copy of the dot recipe, clipped to the
  spotlight's radius and registered to the base sheet's grid.
- **Eligibility**: the two media conditions (a fine, hovering pointer; motion
  not reduced) that together decide whether the feature exists at all. It is a
  live value, not a load-time one.
- **Layer stack**: feature 6's contract, now with three negative levels
  instead of two.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With a mouse, the light is centred on the pointer at **100%** of
  sampled positions across both pages, including while scrolling; zero
  positions show it lagging permanently or offset.
- **SC-002**: Inside the radius the dots measure **brighter and further from
  the local background** than the dots outside it, at three sampled positions
  on each page. Zero doubled or half-step dots appear at any boundary.
- **SC-003**: In the prerendered HTML of all four routes, the spotlight
  appears **zero** times, and the rendered background with scripting disabled
  is identical to feature 6's output.
- **SC-004**: With a coarse pointer, and separately with
  `prefers-reduced-motion: reduce`, **zero** spotlight elements exist and
  **zero** pointer listeners are attached.
- **SC-005**: During five seconds of continuous pointer movement, the frame
  trace shows **at most one** update per frame, **zero** layout operations and
  **zero** paints attributable to the spotlight layers.
- **SC-006**: The page's scroll width and scroll height are **identical** with
  the pointer at the centre of the page and at each of its four extremes.
- **SC-007**: `DotGrid.vue`, `SectionBackdrop.vue` and `SectionGlow.vue` show
  **zero** changed lines in the feature's diff.
- **SC-008**: **Zero** hex literals and **zero** px/rem/em literals appear in
  the new component's stylesheet; every value resolves through a token.
- **SC-009**: **Zero** tokens whose name begins `--color-glow-` or
  `--spacing-glow-` are added, and `SectionGlow.test.ts` passes unmodified.
- **SC-010**: **Zero** locale keys are added or changed and the i18n-parity
  suite passes unmodified.
- **SC-011**: The catalogue's pinned story renders the complete recipe with
  **zero** pointer events and **zero** Nuxt runtime.
- **SC-012**: All five quality gates pass, and the existing suites (shell,
  i18n parity, static output, and the nine primitives) stay green with **zero**
  modifications made to accommodate this feature.

## Assumptions

Each assumption is a decision taken because no source documents the value or
because the design file cannot express it. **A-01, A-03 and A-05 are the three
the approval gate most needs to look at.**

- **A-01 · `rules.md` § R28 gains a third level, and its two existing values
  shift.** There is no integer between `−1` and `0`, so a layer above the dots
  and below the content requires renumbering. The alternative — putting the
  spotlight at the dots' own level and relying on document order — is
  precisely the fragility § R28 was written to forbid, and accepting it once
  would erode the rule for the five section features that come next. **Owner:
  Roberto** (accepting the amendment). **Reversal cost: two token values and
  three doc comments.**
- **A-02 · The effect runs on Nosotros as well as Landing.** § 10 documents it
  under the Landing UI map, as it also documents the dotted paper that feature
  6 correctly put in the layout. **Owner: Clau** (to confirm). **Reversal
  cost: move one element from the layout to the Landing page.**
- **A-03 · The lit dot's brightness is the base recipe painted twice —
  UNVERIFIED, because the design file cannot draw it.** Frame `gViAx` shows
  the circles over an ordinary dot field; § 271 states the requirement in
  words only. Rather than invent a percentage, the second sheet reuses
  `--dot-paper-color`, which DERIVES `1 − (1 − 0.12)² = 22.6%` inside the
  radius. A named token stands in front of that so a value from Clau costs one
  line. **This is the one value this spec would have asked the leader for and
  no frame can answer.** **Owner: Clau.** **Reversal cost: one token value.**
- **A-04 · The centre of the effect is the pointer hotspot.** The frame's
  drawn cursor sits 4px up and left of the shared circle centre in all three
  states — constant across samples, therefore the glyph's own offset rather
  than an intended eccentricity. **Reversal cost: two numbers, if it were ever
  meant to trail.**
- **A-05 · Page coordinates, not viewport coordinates.** Both forms need a
  scroll handler; they differ in what a dropped frame looks like. Page
  coordinates degrade to a one-frame trail behind the cursor; viewport
  coordinates degrade to misregistered lit dots — a visible artifact.
  **Reversal cost: the composable's coordinate arithmetic, one function.**
- **A-06 · Eligibility is "a fine pointer that can hover, and motion not
  reduced", evaluated live.** `ui-map.md` says "Escritorio", which is not a
  measurable property of a browser; the closest measurable statement is the
  pointer's capabilities, which is also the precedent `rules.md` § R7 set for
  the LED border. A hybrid laptop passes the query, which is why FR-014 adds
  the per-event guard. **Reversal cost: one media query.**
- **A-07 · The effect appears only after the first mouse event and hides when
  the pointer leaves the window.** Neither is documented; both are required to
  avoid an obvious defect (a red blob at the top-left on every load, and a
  frozen light after the visitor alt-tabs away). **Reversal cost: two
  listeners.**
- **A-08 · The fade on enter and leave lasts a fraction of a second, from a
  token — UNVERIFIED.** The design specifies no timing, exactly as it
  specified none for the radar ping, which `ui-map.md` records as an
  implementation choice pending sign-off. Same treatment, same shape of
  answer: one token. **Owner: Clau.** **Reversal cost: one token value.**
- **A-09 · The light is clipped at the page box.** The design frames clip
  their contents and two of the three states bleed off the top edge, so
  clipping is the design's own behaviour; it is also the only way to stop a
  box near the footer from lengthening the document. **Reversal cost: one
  declaration.**
- **A-10 · Geometry is expressed in `rem`.** The rest of `global.css` is, and
  feature 6's A-03 made the same choice for the dot grid, which the lit sheet
  must track exactly. Consequence: the spotlight scales with the visitor's
  text size. **Reversal cost: two token values.**
- **A-11 · "No paint per frame" is asserted by measurement, not by
  construction — UNVERIFIED until traced.** The mechanism is chosen so that
  only transforms change, which browsers handle without repainting layer
  contents, but this repository's evidence discipline (`rules.md` §§ R25, R31,
  R34) says the question is what the tool recorded, not what the mechanism
  implies. The implementer MUST record a trace. **Reversal cost: none — it is
  a verification obligation.**

## Out of Scope

- Any change to `DotGrid.vue`, `SectionBackdrop.vue` or `SectionGlow.vue`, and
  any change to the dotted paper's own appearance outside the radius.
- Feature 7's cleanup: `SectionGlow.vue`'s and `SectionGlow.stories.ts`'s
  stale counts and the dead `'920'` size variant.
- Placing any of the 21 section glows, and building any section.
- The other JavaScript effects in `ui-map.md` § 10 — the lyrics effect, the
  two carousels — and the LED border and radar ping, which already ship.
- Correcting `ui-map.md:270` to include the mid stop (D-01). That is Clau's,
  and `docs/business/` content outside `rules.md` is not in a spec cycle's
  write scope.
- A touch or keyboard equivalent of the effect. § 10 scopes it to desktop, and
  the no-effect state is explicitly "no se pierde contenido".
- End-to-end tests (Constitution Article X).

## Dependencies

- **Feature 6 (`done`)** — `DotGrid.vue` and the page-wide dot sheet this
  effect brightens, `SectionBackdrop.vue`/`SectionGlow.vue` and the layer
  contract this feature amends, and `app/layouts/default.vue`, the single
  stacking context all of it resolves against.
- **Feature 3 (`done`)** — the layout and the mobile menu whose glass sits
  above every background layer.
- **Feature 1 (`done`)** — the `red-400` ramp and the token file.
- **`.pen` frame `gViAx`**, through the leader (`rules.md` § R32) — the whole
  recipe.
- **`docs/business/landing/ui-map.md` §§ 5, 10, *Movimiento reducido*** — the
  scope, the fallback, the dot requirement and the accessibility opt-out.
- **`docs/business/landing/content.md` § *Dirección visual*** — the
  atlassian.design reference.
- **`docs/business/rules.md` §§ R7, R18, R19, R23, R28, R29, R30, R32, R34** —
  the hover-media precedent, the `@theme inline` trap that governs any
  hand-written CSS, the three ways the catalogue must be told things twice, the
  paint-order contract this feature amends, the design-file precedence rule,
  and the measurement discipline.
