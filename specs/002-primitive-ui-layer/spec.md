# Feature Specification: Primitive UI layer

**Feature Branch**: `002-primitive-ui-layer`
**Created**: 2026-09-06
**Status**: Draft
**Input**: Feature id 2 in `feature_list.json` (`primitive_ui_layer`, `"sdd": true`). Rebuild the eight design-system primitives in `app/shared/ui/` as Vue SFCs after the 2026-09-06 Astro→Nuxt migration discarded the previous implementation, with a Storybook story per component plus one story for the design token set (absorbed from feature 1).

## Overview

The muush.dev design reuses a very small set of visual primitives an enormous
number of times across its four vigent frames (Landing and Nosotros, 1440px
desktop and 390px mobile): **13** glass panels, **11** pills, **8+** radars,
**4** wordmarks, **3** primary buttons, **4** link arrows, **3** social
buttons. Every later feature — the shell, the landing sections, the About
page, both forms — is assembled out of these eight pieces.

Feature 1 delivered the **vocabulary**: the four colour ramps, the two font
families, the thirteen derived glass/radar colour mixes, the twenty-two fluid
type roles, the surface/spacing/radius/blur scale, and the `@property`
registration plus `@keyframes` the LED ring animates against. All of it is
already in `app/assets/css/global.css` and already resolves under Tailwind v4
inside Nuxt.

This feature delivers the **words**: eight components that consume that
vocabulary and nothing else, and the review surface (Storybook) that lets a
broken variant be caught at the component level instead of three sections
later.

Nothing here is placed on a page. No section, card, nav, footer or form is
built. This mirrors the scoping precedent of feature 1, which delivered the
isotipo assets without placing a logo instance anywhere.

### Source of truth and evidence discipline

Every measurement in this spec is **CONFIRMED** against
`docs/business/landing/design-extract.md` (extracted from `muush.pen` on
2026-09-06), **DERIVED** from those values with the arithmetic shown, or
recorded as an explicit **ASSUMPTION** below with its owner and its reversal
cost. Nothing is estimated from memory, and the `.pen` file itself is not
opened by this feature — the Pencil bridge does not exist outside the main
interactive session.

Prop signatures start from `docs/business/landing/component-contracts.md`,
recovered from the pre-migration implementation. Those interfaces were derived
from real design instances and passed review; they are adapted from Astro
idioms to Vue, not redesigned.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compose a section without knowing any measurement (Priority: P1)

A section author building the Propósito cards needs a red glass card at the
"strong" opacity, and the same card again at the "soft" opacity for its two
siblings. They name the variant and drop their content inside. They never see
an opacity percentage, a blur radius, a corner radius or a padding value, and
they write no breakpoint — the desktop↔mobile difference is already inside the
primitive.

**Why this priority**: this is the entire reason the layer exists. Thirteen
glass surfaces spread across two pages either share one recipe or drift apart
one card at a time. Without it, every later feature re-derives the same six
variants from the design file.

**Independent Test**: render each of the six glass variants side by side at a
1440px and a 390px viewport and confirm the computed fill, border colour,
backdrop blur, corner radius and padding match `design-extract.md` § 1 for
that variant at that width, with no breakpoint in the component.

**Acceptance Scenarios**:

1. **Given** the `red-strong` variant, **When** it renders at 1440px, **Then**
   its fill is red-400 at 17%, its border is red-400 at 47% and 1px wide, its
   backdrop blur is 22 and its corner radius is 22, and its padding is 32.
2. **Given** the same variant and the same single named variant value, **When**
   the viewport is 390px, **Then** blur is 20, radius is 18 and padding is 22.
3. **Given** the `bone` variant used as a photo frame, **When** the author asks
   for the tight padding, **Then** padding resolves to 22 desktop / 18 mobile
   while fill, border, blur and radius are unchanged.
4. **Given** any of the six variants, **When** the rendered markup is
   inspected, **Then** it contains no colour literal and no pixel literal —
   every value arrives from a named token.

---

### User Story 2 - Review a primitive before composing it (Priority: P1)

A reviewer needs to see every variant of every primitive, on the dark surface
the site actually uses, at both frame widths, without running the site and
without a page existing to put them on. They open the component catalogue,
pick a component, and see all of its variants rendered together.

**Why this priority**: Constitution Article X makes the story mandatory for
every component in `app/shared/ui/`, and it is the mechanism that makes
"a broken variant is caught at the component level" true rather than
aspirational. The catalogue is also the only way to review this feature at
all, since it puts nothing on a page.

**Independent Test**: build the component catalogue and confirm it contains one
entry per component, that each entry renders every variant that component
declares, and that switching the catalogue's viewport control between 390px
and 1440px visibly changes the fluid values.

**Acceptance Scenarios**:

1. **Given** the catalogue, **When** it is built, **Then** it contains a story
   for each of the eight primitives and one story for the design token set.
2. **Given** the GlassPanel story, **When** it is opened, **Then** all six
   variants render simultaneously with their variant name visible, so two
   variants that should differ can be compared rather than described.
3. **Given** the token story, **When** it is opened, **Then** it renders the
   four colour ramps at their five steps each and one specimen line per fluid
   type role, and the type specimens resize when the viewport control changes.
4. **Given** the placeholder smoke-test story that currently occupies
   `app/shared/ui/GlassPanel.stories.ts`, **When** this feature ships,
   **Then** it no longer exists — the real GlassPanel story occupies that path
   and the token set has its own story file.

---

### User Story 3 - The primary CTA reads as alive on pointer devices and calm everywhere else (Priority: P2)

A visitor on a laptop hovers the "Cuéntanos tu proyecto" button and its 1.5px
border sweeps a light around the perimeter, once every 2.6 seconds, stopping
when the pointer leaves. A visitor on a phone, a visitor who asked their
operating system to reduce motion, and a visitor whose browser cannot animate
the ring all see the same button with a static red border — never a broken
one, never a permanently spinning one.

**Why this priority**: `branding.md` designates the LED border as the single
animated control in the entire system, one per screen. It is the highest-risk
piece of this layer — it is the only one with motion, the only one with a
state, and the only one whose brand description in `branding.md` was wrong
until the 2026-09-06 correction.

**Independent Test**: render the button, confirm the static ring paints
correctly with no pointer present; simulate hover on a pointer device and
confirm rotation starts and stops with the pointer; enable reduced motion and
confirm the ring is flat red-400 with no animation.

**Acceptance Scenarios**:

1. **Given** the button at rest, **When** it renders, **Then** its border is a
   1.5px ring carrying a three-stop conic gradient of red-400 → bone-100 →
   red-400, and the button's own translucent dark fill is not tinted by the
   gradient beneath it.
2. **Given** a pointer device, **When** the pointer enters the button,
   **Then** the ring rotates one full turn every 2.6 seconds at linear speed,
   and **When** the pointer leaves, **Then** rotation stops.
3. **Given** a visitor with reduced motion requested, **When** the button
   renders, **Then** the ring is flat red-400 and never animates.
4. **Given** a touch device with no hover capability, **When** the button
   renders, **Then** the ring is static — see assumption A-02, which is
   pending an open decision and reversible.
5. **Given** any of the three size variants (`nav`, `hero`, `submit`),
   **When** rendered, **Then** padding and label size match
   `design-extract.md` § 4 for that variant and the fill, radius and ring are
   identical across all three.

---

### User Story 4 - The brand mark renders correctly at any size (Priority: P2)

The nav and the footer each need the muush lockup. It has to render the
isotipo and the wordmark locked together, at the right relative size, with the
`.dev` suffix present — and it has to be able to drop the suffix, because
`branding.md` documents two official lockups.

**Why this priority**: four instances in the shell, plus the mobile menu.
Getting the isotipo's stroke weight wrong here is the single most visible
possible brand error on the site, and the design documentation actively
invites that error (see FR-018).

**Independent Test**: render the lockup at its mobile and desktop widths and
confirm the isotipo's rendered stroke thickness matches the design's per-size
values as a natural consequence of scaling, with no thickness set anywhere in
the code.

**Acceptance Scenarios**:

1. **Given** the full lockup at desktop, **When** it renders, **Then** the
   isotipo is 52 wide and 29 tall with a stroke that measures 8.85, and the
   wordmark sits beside it, vertically centred, 12 away.
2. **Given** the same lockup at mobile, **When** it renders, **Then** the
   isotipo is 40×22 with a stroke measuring 6.8 and the gap is 9 — all as a
   consequence of one width changing, with no stroke value written anywhere.
3. **Given** the wordmark in its full form, **When** it renders, **Then**
   `muush` and `dev` are bone-100, the separating `.` is red-400, the three
   runs are set in the logo typeface with no gap between them.
4. **Given** the wordmark in its short form, **When** it renders, **Then** only
   `muush` appears — neither the dot nor `dev`.

---

### User Story 5 - Social and secondary links are on-brand and reachable (Priority: P3)

A visitor opening the mobile menu sees three social buttons. A visitor reading
the hero sees "Agenda una llamada →" as text, not as a second button competing
with the primary CTA. A visitor navigating by keyboard reaches all of them and
can see where they are. A visitor using a screen reader hears what each social
button is, even though it contains only a glyph.

**Why this priority**: three social buttons and four link arrows across the
site, and both are the components most likely to ship an accessibility defect
because one is icon-only and the other has no box to focus.

**Independent Test**: tab through a page containing all three social buttons
and both link arrow sizes; confirm every one takes focus with a visible
indicator, that each social button announces its network, and that each
external destination opens in a new context safely.

**Acceptance Scenarios**:

1. **Given** a social button, **When** a screen reader encounters it, **Then**
   it announces the caller-supplied accessible name, because the glyph itself
   carries no text.
2. **Given** a social button, **When** it renders, **Then** its glyph takes the
   bone-100 brand colour from its container rather than the pure white the
   vendor art hardcodes.
3. **Given** a link arrow in any state including hover and focus, **When** it
   renders, **Then** it has no background and no border — it never becomes a
   button.
4. **Given** any interactive primitive, **When** it receives keyboard focus,
   **Then** a red-400 focus indicator is visible and was not suppressed.
5. **Given** an external destination, **When** the link is followed, **Then**
   it opens in a new browsing context with the opener relationship severed.

---

### User Story 6 - A section author can see the vocabulary itself (Priority: P3)

Before choosing a type role or a colour step, an author wants to see them.
They open the token story and see the four ramps at five steps each with their
names, and one line of specimen text per type role, resizing live as the
viewport control moves.

**Why this priority**: absorbed from feature 1, which closed without it. It is
documentation, not behaviour — valuable, but nothing depends on it.

**Independent Test**: open the token story at both viewport widths and confirm
each ramp step and each type role is labelled with the name an author would
write, and that the specimens visibly change size between the two widths.

**Acceptance Scenarios**:

1. **Given** the token story, **When** it renders, **Then** each of the twenty
   colour steps shows a swatch and its token name.
2. **Given** the token story, **When** the viewport control moves from 1440px
   to 390px, **Then** every fluid type specimen shrinks toward its documented
   mobile endpoint, demonstrating that no breakpoint is involved.

---

### Edge Cases

- **A glass panel nested inside another glass panel.** `branding.md` forbids
  glass on glass ("nunca vidrio sobre vidrio"). The primitive does not enforce
  this — it has no way to know its ancestry — so the rule is documented in the
  story and enforced by review, not by the component. Recorded so the next
  reviewer does not treat the absence of enforcement as an oversight.
- **A glass panel with no content.** Padding still applies, so the panel
  collapses to twice its padding rather than to zero. This is correct for the
  reserved-space slots the design already uses.
- **A pill whose label is long enough to wrap.** The design has eleven
  instances, all short. The pill stays a single capsule row and lets the label
  determine the width; it does not truncate, because truncating a nav-adjacent
  label silently loses information.
- **A primary button whose label is set by a longer locale.** The button's
  width comes from its label; the LED ring inherits the button's own radius so
  it stays aligned at any width. Nothing is fixed-width.
- **A browser without support for the animatable angle property.** The ring
  paints at its initial angle and simply does not rotate — the documented
  fallback in `ui-map.md` § 10, not a broken border.
- **A social glyph rendered on a light surface.** The glyph inherits its
  container's colour, so it follows whatever the container sets rather than
  being locked to bone-100. Both catalogue backgrounds exist precisely so a
  component that only looks right on dark is caught.
- **Radar used inside the mobile services timeline.** The opacity ladder
  (0.18 / 0.45 / 1) is applied by that section to the whole radar-plus-text
  group. Radar exposes no opacity control.

## Requirements *(mandatory)*

### Scope boundary

- **FR-001**: The feature MUST create exactly eight components, all under
  `app/shared/ui/`: GlassPanel, Radar, Wordmark, Lockup, Pill, BotonPrimario,
  LinkArrow, SocialIcon.
- **FR-002**: The feature MUST NOT create any page, layout, route, feature
  module, navigation, footer or form component. `app/features/`,
  `app/layouts/` and `app/pages/` MUST be untouched.
- **FR-003**: The only dependencies between the eight components MUST be: Pill
  composes Radar, and Lockup composes the isotipo asset plus Wordmark. The
  other six MUST have no component dependency.
- **FR-004**: No component MAY import from a feature module, a layout or a
  page. The layer is a leaf.
- **FR-005**: Every visible string MUST arrive from the caller. No component
  may contain Spanish or English copy. The sole exception is the Wordmark's
  `muush` / `.` / `dev` runs, which are brand identity and locale-invariant.
- **FR-006**: The feature MUST NOT add, remove or change any token value in
  `app/assets/css/global.css`. It consumes the vocabulary feature 1 delivered.
  If a required token proves genuinely absent, that MUST be reported rather
  than worked around with a literal.

### Token discipline

- **FR-007**: No component's markup or styles MAY contain a colour literal
  (hex, `rgb()`, `oklch()`) or an arbitrary bracketed utility value. Every
  colour resolves through the ramps and the derived glass/radar mixes already
  in `global.css`.
- **FR-008**: No component's markup or styles MAY contain a pixel or rem size
  literal for type, spacing, radius or blur. Every such value resolves through
  a named scale token.
- **FR-009**: No component MAY use a breakpoint to change a font size, a
  padding, a radius or a blur. The desktop↔mobile difference is carried by the
  fluid tokens.
- **FR-010**: Variant-to-class resolution MUST use complete class-name strings
  looked up from a closed map, never assembled by string concatenation, since
  a concatenated name is invisible to the stylesheet generator and the utility
  is simply never emitted.
- **FR-011**: Only the Wordmark MAY use the logo typeface. Every other
  component uses the body typeface.

### GlassPanel

- **FR-012**: GlassPanel MUST support exactly the six variants of
  `design-extract.md` § 1 — `red-strong`, `red-soft`, `bone-strong`, `bone`,
  `bone-faint`, `dark` — with the fill, 1px border colour, backdrop blur,
  corner radius and padding that section records for each, at both frame
  widths.
- **FR-013**: The variant MUST be required, with no default: there is no
  sensible fallback among six visually distinct surfaces.
- **FR-014**: Padding MUST be independently controllable from the variant, with
  three values: the variant's own padding, a tight padding (22 desktop / 18
  mobile, used by the photo frames), and none.
- **FR-015**: GlassPanel MUST accept a caller-chosen semantic wrapper element
  from a closed set, defaulting to a generic block, so a card can be an
  `article` and a region can be a `section` without a second component.
- **FR-016**: GlassPanel MUST supply fill, border, blur, radius and padding and
  nothing else. It imposes no layout, no width, no typography and no colour on
  its content — those belong to the caller.

### Radar

- **FR-017**: Radar MUST support exactly the three sizes of `design-extract.md`
  § 2 — outer/middle/core diameters of 20/14/7 (`sm`), 30/20/12 (`md`) and
  22/16/10 (`sm-alt`) — rendered as three concentric shapes sharing one centre.
- **FR-018**: The three rings MUST use one colour recipe across all sizes:
  outer red-400 at 12%, middle red-400 at 30%, core solid red-400, per the
  standing rule in `design-extract.md` § 2.
- **FR-019**: Radar MUST be hidden from assistive technology. It is decoration;
  the adjacent label always carries the information.
- **FR-020**: Radar MUST expose no opacity or colour control.

### Wordmark and Lockup

- **FR-021**: Wordmark MUST render both official lockups: the full
  `muush` + `.` + `dev`, and the short `muush` alone. `muush` and `dev` are
  bone-100; the separating dot is red-400; the three runs sit flush with no
  gap.
- **FR-022**: Lockup MUST render the dark-background isotipo variant beside a
  Wordmark, cross-axis centred, at the documented fluid gap, and MUST forward
  the caller's chosen wordmark form.
- **FR-023**: Lockup MUST set only the isotipo's width. The per-instance stroke
  formula `12 × (width ÷ 70.5)` documented in `branding.md`,
  `design-extract.md` § 6 and `rules.md` § R3 is a workaround for a design-tool
  limitation and MUST NOT appear in code in any form — no prop, no computation,
  no helper. The rendering engine scales the stroke with the artwork's own
  coordinate system automatically; replicating the formula would apply the
  scale twice and thicken the mark.
- **FR-024**: Lockup MUST NOT be a link. The nav and the footer decide where it
  points, so the caller wraps it.

### Pill

- **FR-025**: Pill MUST render a small Radar followed by a caller-supplied
  label inside a fully rounded dark-glass capsule with a 1px neutral border, at
  the gap and asymmetric padding of `design-extract.md` § 3.
- **FR-026**: Pill MUST take exactly one content input: the label. The
  13→12 type difference between frames is carried by the fluid pill type role,
  not by a size prop.

### BotonPrimario

- **FR-027**: BotonPrimario MUST support the three size variants of
  `design-extract.md` § 4 — `nav`, `hero` and `submit` — differing only in
  padding and label size. Fill, corner radius and the ring are identical across
  all three.
- **FR-028**: The LED ring MUST be a 1.5px conic gradient with exactly three
  stops: red-400 at the start, bone-100 at the midpoint, red-400 at the end.
  **Wine appears nowhere.** `branding.md`'s previous "Red 400 → Bone 100 →
  Wine 400" wording was corrected on 2026-09-06; the third stop in the design
  file is written as a one-digit typo of red-400 and resolves to the red-400
  token in code. Source: `design-extract.md` § 4 and § 11.
- **FR-029**: The ring MUST be masked to the border band only, so the button's
  own translucent dark fill is never tinted by the gradient behind it.
- **FR-030**: The animation MUST be achieved without any client-side scripting:
  one linear turn every 2.6 seconds, starting on hover and stopping when hover
  ends.
- **FR-031**: With reduced motion requested, the ring MUST be flat red-400 with
  no animation.
- **FR-032**: Where the browser cannot animate the ring's angle, the ring MUST
  still paint statically rather than disappearing or falling back to no border.
- **FR-033**: BotonPrimario MUST render as a link when given a destination and
  as a real button otherwise, with the button's type defaulting to submit for
  the `submit` variant and to a non-submitting button elsewhere.
- **FR-034**: The label MUST come from the caller. LED behaviour MUST NOT be a
  prop — `branding.md` allows exactly one primary button per screen, so there
  is nothing for a caller to turn off.

### LinkArrow

- **FR-035**: LinkArrow MUST support two sizes, matching the 16 and the 20→23
  instances of `design-extract.md` § 7, always in bone-100.
- **FR-036**: LinkArrow MUST NOT have a background or a border in any state,
  including hover and focus other than the focus indicator required by FR-039.
  `design-extract.md` § 7 and `ui-map.md` § 3 both state it is loose text and
  "nunca un fondo".
- **FR-037**: The trailing arrow glyph MUST be supplied by the component, not
  by the caller, so the hover affordance has something to act on.
- **FR-038**: LinkArrow MUST accept an external flag that, when set, opens the
  destination in a new browsing context with the opener relationship severed.

### Accessibility

- **FR-039**: Every interactive primitive MUST show a visible red-400 focus
  indicator on keyboard focus, and MUST NOT suppress the default one without
  replacing it (`ui-map.md` § 10).
- **FR-040**: SocialIcon MUST require a caller-supplied accessible name, since
  its only content is a glyph.
- **FR-041**: Purely decorative graphics — the radar rings, the isotipo inside
  the lockup, the trailing arrow — MUST be hidden from assistive technology so
  they are not announced.

### SocialIcon

- **FR-042**: SocialIcon MUST support exactly three networks — LinkedIn,
  Instagram, TikTok — rendered as a 48×48 dark-glass square with the icon
  corner radius and a 1px neutral border, per `design-extract.md` § 8.
- **FR-043**: The glyph MUST be inlined from the normalized assets already in
  `app/assets/social/` so it inherits its colour from the container. It MUST
  NOT be referenced as an external image and MUST NOT be moved to the public
  directory, because either would lock it to the vendor's pure white and defeat
  the normalization (`rules.md` § R8).
- **FR-044**: The three assets MUST be consumed as-is. They were already
  normalized to a shared square coordinate system with inheritable fills; this
  feature MUST NOT re-normalize, re-scale or edit them.
- **FR-045**: SocialIcon MUST require a destination and MUST open it in a new
  browsing context with the opener relationship severed.

### Review surface

- **FR-046**: Every one of the eight components MUST have a story in the
  component catalogue, covering every variant it declares. Constitution
  Article X makes this mandatory, not optional.
- **FR-047**: A further story MUST render the design token set: the four colour
  ramps at five steps each with their names, and one specimen per fluid type
  role.
- **FR-048**: The placeholder smoke-test story currently at
  `app/shared/ui/GlassPanel.stories.ts` MUST be replaced by the real GlassPanel
  story. The token rendering it foreshadowed becomes its own story file.
- **FR-049**: Each story MUST render its component's variants together rather
  than one per navigation entry, so two variants that should differ can be
  compared side by side.

### Verification

- **FR-050**: A repository-wide check MUST be able to demonstrate FR-007 and
  FR-008 mechanically — a search across the eight component files for colour
  and size literals returns nothing.
- **FR-051**: Each component MUST be covered by an automated component test
  asserting its variant map and its structural invariants (three rings in a
  radar; a radar inside a pill; no stroke thickness anywhere in the lockup; the
  short wordmark omitting the suffix; link-versus-button selection in the
  primary button; the accessible name and safe-external attributes on the
  social icon). Constitution Article X, layer 2.
- **FR-052**: The repository's existing quality gates MUST all pass unchanged:
  lint/format, type check, tests, static generation, and the catalogue build.

### Key Entities

- **Glass variant**: a closed set of six surface recipes, each a 5-tuple of
  fill, border colour, blur, radius and padding. Two of the six are red-based,
  three bone-based, one dark. Design source: `design-extract.md` § 1.
- **Glass padding**: a closed set of three, orthogonal to the variant — the
  variant's own, tight, or none.
- **Radar size**: a closed set of three, each a triple of concentric diameters
  sharing one colour recipe. Design source: `design-extract.md` § 2.
- **Wordmark form**: a closed set of two, `muush.dev` and `muush`, both
  documented as official in `branding.md`.
- **Button variant**: a closed set of three, each a pair of padding and label
  size. Design source: `design-extract.md` § 4.
- **Link size**: a closed set of two. Design source: `design-extract.md` § 7.
- **Social network**: a closed set of three, each bound to one normalized glyph
  asset already present in the repository.

No runtime data, no state, no persistence, no network call exists anywhere in
this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 glass variants, 3 radar sizes, 2 wordmark forms, 3 button
  variants, 2 link sizes and 3 social networks render, and each matches its
  documented values at both 1440px and 390px — 19 variant renderings verified
  against `design-extract.md` §§ 1–8.
- **SC-002**: A search for colour literals and size literals across the eight
  component files returns **zero** matches.
- **SC-003**: A search for a breakpoint controlling a font size, padding,
  radius or blur across the eight component files returns **zero** matches.
- **SC-004**: The component catalogue contains **9** entries — one per
  primitive plus the token set — and builds without error.
- **SC-005**: The number of stroke-thickness values written anywhere in the
  lockup implementation is **zero**, while the rendered isotipo stroke measures
  8.85 at 52 wide and 6.8 at 40 wide.
- **SC-006**: The primary button's ring contains **3** gradient stops and
  **zero** occurrences of any wine value.
- **SC-007**: The primary button carries **zero** lines of client-side script,
  and the whole feature adds **zero** bytes of runtime JavaScript to a page
  that uses it.
- **SC-008**: Every interactive primitive is reachable by keyboard and shows a
  visible focus indicator — 3 component types, 100% coverage.
- **SC-009**: A section author can build a glass card with a pill and a radar
  in it without opening `design-extract.md`, because every value they would
  have looked up is named.
- **SC-010**: All five repository quality gates pass: lint/format, type check,
  tests, static generation, catalogue build.
- **SC-011**: Files created or modified outside `app/shared/ui/`, the test
  configuration and the spec directory: **zero**, apart from the state and
  progress files the workflow itself updates.

## Assumptions

Each assumption below is a decision made because the design file documents a
range, an either/or, or nothing at all. None invents a measurement.

- **A-01 · Frame endpoints**: the two reference widths are 390px and 1440px and
  no intermediate frame exists (`rules.md` § R5). Every fluid token already
  interpolates between exactly those two and clamps outside them; this feature
  inherits that and adds no new interpolation.
- **A-02 · LED on touch devices — OPEN DECISION, flagged, reversible**:
  `decisions-open.md` #8 ("Borde LED en móvil: estático o en loop permanente",
  owner Clau, classified non-blocking) is **still open**. The pre-migration
  implementation used a hover-capability media query so a touch device gets the
  static red-400 ring, identical to the reduced-motion fallback
  (`rules.md` § R7). That default is carried forward **unchanged and
  deliberately**, not re-decided. Rationale on the record: a permanent loop
  would be the only continuously animating element on the page and contradicts
  `branding.md`'s "one LED per screen, on hover". Reversal cost: deleting one
  media query.
- **A-03 · LinkArrow weight and tracking**: `design-extract.md` § 7 documents
  four instances with three different weights and four different tracking
  values, but the contract has only two sizes. The two existing type roles
  (`link`, `link-lg`) resolve this at weight 600 — the value 3 of the 4
  instances use. Only the desktop hero instance is 500. This was settled when
  the roles were tokenized in feature 1; this feature consumes them and does
  not revisit it.
- **A-04 · LinkArrow hover affordance**: `design-extract.md` § 7 says hover is
  "subrayado **o** desplazamiento de la flecha" — an either/or, not a
  specification. Resolved to translating the arrow, because the component owns
  the glyph precisely so the hover has something to move
  (`component-contracts.md`). The hard part of the rule — never a background —
  is a requirement (FR-036), not an assumption.
- **A-05 · Hero button mobile padding**: § 4 records two mobile paddings for
  the `hero` variant (`[16,26]` and `[17,24]`). The existing spacing tokens
  resolve it as 16→18 vertical and 26→32 horizontal. Carried forward from
  feature 1's tokenization.
- **A-06 · Social glyph size inside the button**: § 8 documents padding 10
  around an 18px placeholder letter, but the real art is the normalized square
  glyph, not a letter. The glyph renders at 24 centred in the 48 button — a 12
  inset, close to the documented 10 and correct for real glyph art. Token
  already exists.
- **A-07 · Focus indicator geometry**: `ui-map.md` § 10 requires a visible
  red-400 focus indicator and forbids removing it, but documents no thickness
  or offset, and `design-extract.md` has no focus frame. The platform default
  outline geometry is used, recoloured to red-400. **UNVERIFIED against the
  design file** — flagged for Clau if a specific geometry is wanted.
- **A-08 · Glass-on-glass is not enforced in code**: `branding.md`'s "nunca
  vidrio sobre vidrio" is a composition rule a leaf component cannot check. It
  is documented in the story and enforced at review.
- **A-09 · Lockup uses the dark-background isotipo**: the site is dark end to
  end (`content.md` § Dirección visual), so the lockup uses the on-ink variant.
  The on-bone and on-red assets stay unconsumed, exactly as feature 1
  anticipated.
- **A-10 · The `bone` variant's two documented paddings**: § 1 records
  `28/22 · 22/18` for the `bone` variant because the photo frames use a tighter
  padding than the project cards. This is why padding is a separate input
  (FR-014), not two variants.
- **A-11 · Font binaries are still missing**: `public/fonts/` has no files and
  `global.css` declares weights 400 and 700 against paths that do not exist —
  a TODO left by feature 1. The design uses 500 and 600. This layer names the
  correct weights; the catalogue and the site will fall back to a system face
  until the binaries land. **This does not block this feature** and supplying
  them is a separate piece of work.
- **A-12 · Component tests are in scope**: Constitution Article X names three
  testing layers and the second is component tests for `ui/` components. The
  originating task description listed only the components and the stories, so
  FR-051 is an addition made to satisfy Article X rather than a restatement of
  the request. It is called out here so the approval gate can trim it if the
  intent was Storybook-only. Note that the current test configuration only
  scans `tests/` in a non-DOM environment, so honouring FR-051 requires
  extending that configuration — the only file this feature touches outside
  `app/shared/ui/`.

## Out of Scope

- Any page, layout, route, nav, footer, form, card or section component.
- Any change to the token values in `global.css`, including adding a token.
- Re-normalizing, re-scaling or relocating the logo and social SVG assets.
- The font binaries (A-11).
- Resolving `decisions-open.md` #8 (A-02), or any of the four blocking open
  decisions — none of them touch this layer.
- End-to-end tests. Constitution Article X puts them out of scope for the
  repository.

## Dependencies

- **Feature 1 (`done`)**: supplies every token this layer consumes, the three
  isotipo assets and the three normalized social glyphs. Verified present in
  `app/assets/css/global.css`, `app/assets/logo/` and `app/assets/social/`.
- **`docs/business/landing/design-extract.md`**: the sole source of
  measurements. The `.pen` file is not read.
- **`docs/business/landing/component-contracts.md`**: the prop surface,
  recovered from the pre-migration implementation, adapted rather than
  redesigned.
- **`docs/business/rules.md` §§ R1–R8**: the business and system rules the
  previous cycle recorded for exactly this feature.
- **The component catalogue toolchain**: already configured and building, with
  the aliases mirrored and the dark site background as its default.

## Downstream consumers

Feature 3 (site shell) is blocked on this layer: its nav composes Lockup,
Wordmark and BotonPrimario; its mobile menu composes SocialIcon; its footer
composes Lockup and LinkArrow. Changing any signature in
`component-contracts.md` after this feature ships is a breaking change to every
consumer, which is why those signatures are adapted rather than redesigned.
