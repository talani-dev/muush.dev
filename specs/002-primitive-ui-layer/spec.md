# Feature Specification: Primitive UI layer

**Feature Branch**: `002-primitive-ui-layer`
**Created**: 2026-09-06
**Status**: Draft
**Input**: User description: "Primitive UI layer for muush.dev: a fluid type/spacing scale plus eight static presentational components that every landing and Nosotros section will later compose from. All measurements come from `docs/business/landing/design-extract.md`."

## Overview

The muush.dev design (4 vigent frames: landing and Nosotros, desktop 1440px
and mobile 390px) reuses a very small set of visual primitives an enormous
number of times: 13 glass panels, 11 pills, 8+ radars, 4 wordmarks, 3 primary
buttons, 4 link-arrows, 3 social buttons. Today `src/components/` is empty and
`src/styles/global.css` holds only color and font-family tokens (delivered by
feature 001).

This feature builds that primitive layer — **the shared vocabulary**, not the
pages. It has three parts:

1. A **fluid type, spacing and surface scale** so the desktop→mobile size
   difference is carried by tokens instead of breakpoints.
2. **Eight static presentational components** that consume only those tokens.
3. **Three normalized social glyph assets** so the icons respect the brand
   `bone-100` token instead of the pure white they currently hardcode.

Nothing in this feature is placed on a page. No section, card, form, nav or
footer is built — those consume this layer in later features. This mirrors the
scoping precedent of feature 001, which delivered the isotipo assets without
placing a logo instance anywhere.

**Source of truth for every measurement in this spec:**
`docs/business/landing/design-extract.md` (values extracted directly from
`muush.pen` on 2026-09-06). The design file itself is NOT read by this feature.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One size token, both viewports (Priority: P1)

A section author writing the hero needs the headline to render at its designed
size on a 1440px desktop frame and at its designed size on a 390px phone frame.
They apply a single named type role to the element and get both, without
writing a single breakpoint, and without knowing what the two endpoint numbers
are.

**Why this priority**: Every other component in this feature — and every
section in every later feature — depends on this scale existing. Without it,
each component re-invents its own desktop/mobile handling and the design drifts.

**Independent Test**: Render a bare element carrying each type role at a 1440px
viewport and at a 390px viewport and confirm the computed font size, line
height and letter spacing match the design-extract § 9 endpoints, with no
media query present in the stylesheet for those roles.

**Acceptance Scenarios**:

1. **Given** the display role applied to a heading, **When** the viewport is
   1440px wide, **Then** it computes to 98px with line-height 0.98 and the
   documented negative tracking.
2. **Given** the same element and the same single class, **When** the viewport
   is 390px wide, **Then** it computes to 46px with line-height 1.
3. **Given** a viewport between 390px and 1440px, **When** the page is resized
   continuously, **Then** the size interpolates smoothly with no jump.
4. **Given** a role documented as fixed across both frames (service brief,
   form label, input value), **When** the viewport changes, **Then** the size
   does not change.
5. **Given** a viewport wider than 1440px or narrower than 390px, **When** it
   is rendered, **Then** the size clamps at the corresponding endpoint and
   never grows or shrinks past it.

---

### User Story 2 - The glass surface vocabulary (Priority: P1)

A section author needs a translucent panel. The design uses the same glass
recipe 13 times with six different intensities. The author picks the intensity
by name and gets the exact fill, border, blur, radius and padding the design
specifies for it, at both viewports.

**Why this priority**: The glass panel is the highest-impact primitive in the
system — it is the surface every card, form and photo frame sits on. Getting
its six variants exactly right unblocks four later features at once.

**Independent Test**: Render all six variants side by side and compare each
one's resolved fill, border colour, blur radius, corner radius and padding
against the design-extract § 1 table.

**Acceptance Scenarios**:

1. **Given** the `red-strong` variant, **When** rendered, **Then** its fill is
   red-400 at 17%, its border is red-400 at 47%, its backdrop blur is 22px on
   desktop and 20px on mobile, its radius 22px→18px and its padding 32px→22px.
2. **Given** the `dark` variant, **When** rendered, **Then** its fill is the
   dark-glass base at 65%, its border bone-100 at 23%, blur 22px, radius
   20px→18px, padding 34px→24px.
3. **Given** any variant, **When** arbitrary content is placed inside it,
   **Then** the panel does not constrain, style or reposition that content
   beyond its own padding.
4. **Given** the `bone` variant used as a photo frame, **When** the tighter
   padding option is requested, **Then** it renders 22px→18px padding while
   keeping its fill, border and radius unchanged.

---

### User Story 3 - The section marker (radar + pill) (Priority: P2)

Every section of both pages is introduced by the same small capsule: a
three-ring radar dot followed by a label. The author supplies only the label
text; everything else is fixed by the design. The radar itself is also needed
standalone, at two larger sizes, by the purpose and services layouts.

**Why this priority**: 11 pill instances and 8+ standalone radar instances
across the two pages. It is the second most repeated element after glass, and
it is the only place where two primitives compose.

**Independent Test**: Render the pill with each of the 11 documented labels and
the radar at each of its 3 sizes, and compare geometry against design-extract
§ 2 and § 3.

**Acceptance Scenarios**:

1. **Given** the pill, **When** rendered with a label, **Then** it shows a
   small radar followed by that label, fully rounded, on dark glass with a
   bone-100 18% border, with the documented gap and asymmetric padding.
2. **Given** the radar at each size, **When** rendered, **Then** its three
   rings are concentric and measure 20/14/7, 30/20/12 or 22/16/10, with the
   core always in red-400 and the two halos in red-400 at 12% and 30%.
3. **Given** the pill's label text, **When** the viewport changes from desktop
   to mobile, **Then** the label size moves from 13px to 12px through the
   scale, with no breakpoint in the component.
4. **Given** any label, **When** rendered, **Then** no locale-specific string
   is baked into the component — the label is supplied entirely by the caller.

---

### User Story 4 - The primary call to action (Priority: P2)

The single most important control on the site: a dark glass button with an
animated LED ring. On hover, the ring rotates once every 2.6 seconds. A visitor
who has asked their operating system to reduce motion sees the ring frozen as a
solid red border instead. Nothing about it depends on JavaScript.

**Why this priority**: It is the conversion element of the landing, it carries
the only animation in the control system, and its gradient was documented
incorrectly until the 2026-09-06 correction — encoding it right here prevents
that error from reaching production.

**Independent Test**: Render the three size variants, hover each, verify the
ring rotates; then enable reduced motion and verify the ring is static red-400.
Verify the built output contains no script for this component.

**Acceptance Scenarios**:

1. **Given** the button in any variant, **When** rendered, **Then** its border
   is a 1.5px conic gradient with exactly three stops: red-400 at 0, bone-100
   at 0.5 and red-400 again at 1 — wine appears nowhere.
2. **Given** a pointer that supports hover, **When** the pointer enters the
   button, **Then** the ring begins rotating at one full turn per 2.6s linear;
   **When** the pointer leaves, **Then** the rotation stops.
3. **Given** the user has `prefers-reduced-motion: reduce` set, **When** they
   hover the button, **Then** the ring does not rotate and the border renders
   as a static red-400 ring.
4. **Given** the `nav`, `hero` and `submit` variants, **When** rendered,
   **Then** each uses its documented padding and label size from § 4.
5. **Given** the page is loaded with JavaScript disabled, **When** the button
   is displayed and hovered, **Then** the behaviour is identical to the
   JavaScript-enabled case.

---

### User Story 5 - The brand mark in text (Priority: P2)

The nav and footer of both pages need the muush.dev wordmark, and the nav needs
it paired with the isotipo. The dot in `.dev` is always the brand's single red
accent. The isotipo's stroke weight does not scale automatically, so the paired
mark must set it explicitly for its size.

**Why this priority**: Four wordmark instances plus the mobile menu; it is the
first thing on every page. Lower than the CTA only because it carries no
behaviour.

**Independent Test**: Render the wordmark in both official forms and the paired
lockup at both documented sizes, and compare against design-extract § 5 / § 6
and the stroke-width formula in `branding.md`.

**Acceptance Scenarios**:

1. **Given** the wordmark in its full form, **When** rendered, **Then** it
   reads `muush.dev` with the three parts visually joined, the dot in red-400
   and the rest in bone-100, in the logo typeface at semibold with the
   documented negative tracking.
2. **Given** the wordmark in its short form, **When** rendered, **Then** it
   reads `muush` with no dot and no `dev`.
3. **Given** the lockup at 52px isotipo width, **When** rendered, **Then** the
   isotipo stroke width is 8.85 and the gap to the wordmark is 12px; at 40px
   width the stroke width is 6.8 and the gap 9px.
4. **Given** the lockup, **When** rendered, **Then** the isotipo and the
   wordmark are vertically centred against each other.

---

### User Story 6 - The unboxed secondary link (Priority: P3)

The secondary call to action is deliberately not a button — it is loose text
with an arrow. It must never acquire a background, because a background turns
it back into a button and the hero is designed to contain exactly one box.

**Why this priority**: Four instances, no variants beyond size, no behaviour
beyond a hover affordance. Small, but its "never a box" rule is a design
decision that must be encoded somewhere it cannot be forgotten.

**Independent Test**: Render both size variants in their default and hover
states and confirm no background or border is ever painted.

**Acceptance Scenarios**:

1. **Given** the link in either variant, **When** rendered in any state
   including hover and focus, **Then** it paints no background fill and no
   border box.
2. **Given** the link, **When** hovered, **Then** it responds with an underline
   or an arrow shift, and nothing else.
3. **Given** the two documented size variants, **When** rendered, **Then** the
   standard one is 16px and the large one moves 23px→20px across viewports.
4. **Given** the link points at an external destination, **When** it is
   activated, **Then** it opens in a new tab with the safe-referrer attributes
   applied.

---

### User Story 7 - Social glyphs that obey the brand token (Priority: P3)

The mobile menu shows three social buttons. The vendor SVGs available today are
inconsistent — three different viewBoxes, one of them not even square, pure
white fills hardcoded in all three, and a global CSS class embedded in one of
them that would leak into the rest of the page when inlined. Normalized, the
glyphs inherit their colour from the design token and render identically.

**Why this priority**: Three instances on one breakpoint of one page. Deferred
below the rest, but the CSS-class leak makes it a correctness issue, not just
a polish one, the moment the icons are inlined.

**Independent Test**: Inline all three normalized glyphs on a page that also
uses a `.cls-1` class elsewhere and confirm no style bleed; set the container
colour to bone-100 and confirm all three glyphs adopt it.

**Acceptance Scenarios**:

1. **Given** each normalized glyph, **When** inspected, **Then** it declares a
   single square viewBox shared by all three.
2. **Given** the TikTok glyph, whose source art is not square, **When**
   rendered next to the other two, **Then** it is optically centred within the
   square viewBox and reads at a comparable visual weight.
3. **Given** any normalized glyph, **When** its container's text colour is set
   to bone-100, **Then** the glyph renders in bone-100 (`#FBF8F6`) and not in
   pure white.
4. **Given** any normalized glyph, **When** inspected, **Then** it contains no
   `<style>`, no `<defs>`, no DOCTYPE, no tool metadata and no comments.
5. **Given** a social button, **When** rendered, **Then** the glyph sits
   centred inside a 48×48 dark-glass square with a 10px radius and a bone-100
   18% border.

---

### Edge Cases

- **A role that does not change between viewports** (service brief, form label,
  input value): must resolve to a single fixed size, not a degenerate clamp
  that drifts.
- **A role documented only for desktop** (h3 "Work with muush" at 44px, copy
  "Delivery" at 24px): the mobile endpoint is not in the design. The scale must
  still produce a sane smaller value rather than a 44px headline on a phone.
- **A role whose font weight changes between viewports** (`lead` 500→600,
  standard link-arrow 500→600): font weight cannot be interpolated by a fluid
  scale. This must be resolved explicitly, not left to chance.
- **A role whose tracking ratio changes between viewports** (`lead`: −0.02em
  desktop vs −0.03em mobile): same problem as weight, must be documented where
  the consuming component will see it.
- **Content longer than its container**: a pill label or button label longer
  than the designed string must not break the shape — the capsule and the
  button grow with their text rather than clipping or overflowing.
- **The `bone` glass variant has two documented paddings** (28→22 for project
  cards, 22→18 for photo frames). One variant name must serve both without
  forking into a seventh variant.
- **The `bone-faint` border in the design is `#FBF8F2`, not `#FBF8F6`** — a
  one-off that does not match any token in the brand ramp.
- **The dark glass base `#1C1416` is not in the brand ramps either** — it is a
  warm near-black, distinctly not `ink-500` (`#262626`).
- **Weights 500 and 600 have no font file in the project yet** — `public/fonts/`
  is empty and `global.css` still carries the "font files missing" TODO from
  feature 001. Every role in this scale specifies 500 or 600.
- **A touch device has no hover**, so a hover-triggered LED ring never
  animates there.

## Requirements *(mandatory)*

### Fluid scale

- **FR-001**: The stylesheet MUST expose a named fluid type scale whose roles
  cover every text role in design-extract § 9, at minimum: display, h1, h2,
  h2-alt, h3, h3-alt, lead, copy, body-lg, body, body-sm, service-name,
  service-brief, form-label, input-value, pill, meta — plus wordmark (§ 5),
  button (§ 4) and link-arrow (§ 7).
- **FR-002**: Each fluid role MUST interpolate between its mobile endpoint at a
  390px viewport and its desktop endpoint at a 1440px viewport, and MUST clamp
  at both endpoints outside that range.
- **FR-003**: The scale MUST carry the size, line height and letter spacing of
  each role, so that applying a single role to an element requires no
  additional sizing declaration.
- **FR-004**: Letter spacing MUST be expressed relative to the role's own font
  size, so it scales with the fluid size rather than needing its own
  interpolation. (The design's per-role tracking ratios are consistent at
  roughly −3%, matching `branding.md`; the sole exception is `lead`, see
  FR-009.)
- **FR-005**: Roles documented as identical on both frames (service-brief,
  form-label, input-value) MUST resolve to a single fixed value.
- **FR-006**: The stylesheet MUST expose a fluid surface scale covering the
  design-extract § 9 surface table: page margin 80→24, panel radius 22→18 and
  20→18, card padding 32→22 / 28→22 / 34→24 / 22→18, and form gap 16→14.
- **FR-007**: The stylesheet MUST expose the fixed control radii the design
  uses: 12 (primary button), 10 (icon button), and fully-rounded (pill).
- **FR-008**: The scale MUST be added to `src/styles/global.css` **alongside**
  the existing colour ramps, font tokens and `@font-face` blocks delivered by
  feature 001 — no existing token value may be changed or removed.
- **FR-009**: Where a role's weight or tracking ratio differs between the two
  frames and therefore cannot be expressed fluidly (`lead` 500→600 and
  −0.02em→−0.03em; standard link-arrow 500→600), the scale MUST resolve to one
  documented value and the divergence MUST be recorded so the consuming
  feature can handle it deliberately.
- **FR-010**: Applying the scale MUST require no media query in any component
  for sizing purposes.

### Components

- **FR-011**: Eight components MUST exist in `src/components/`: GlassPanel,
  Radar, Wordmark, Lockup, Pill, BotonPrimario, LinkArrow, SocialIcon.
- **FR-012**: All eight MUST be static presentational components with zero
  client-side JavaScript, rendered entirely at build time. None may be an
  interactive island.
- **FR-013**: The only dependencies permitted between them are Pill → Radar and
  Lockup → (isotipo asset + Wordmark). No other component may import another.
- **FR-014**: GlassPanel MUST support the six variants of design-extract § 1 —
  `red-strong`, `red-soft`, `bone-strong`, `bone`, `bone-faint`, `dark` — each
  with its documented fill opacity, border colour and opacity, blur, radius and
  padding.
- **FR-015**: GlassPanel MUST allow the `bone` variant's tighter padding
  (22→18) to be selected without introducing a seventh variant, and MUST allow
  padding to be suppressed for callers that need to control it themselves.
- **FR-016**: GlassPanel MUST render arbitrary caller-supplied content and MUST
  NOT impose layout on that content beyond its own padding.
- **FR-017**: Radar MUST support the three sizes of design-extract § 2 —
  `sm` (20/14/7), `md` (30/20/12), `sm-alt` (22/16/10) — always as three
  concentric rings with the core in red-400 and the halos in red-400 at 12%
  (outer) and 30% (middle).
- **FR-018**: Wordmark MUST render both official forms, `muush.dev` and
  `muush`, in the logo typeface at semibold with the documented negative
  tracking, with the three parts visually joined and the dot always in red-400.
- **FR-019**: Lockup MUST place the isotipo before the wordmark, vertically
  centred, at the documented gap (12 desktop / 9 mobile), and the isotipo's
  rendered stroke width MUST satisfy `12 × width ÷ 70.5` — 8.85 at a 52px
  width and 6.8 at 40px.
- **FR-020**: Lockup MUST use the isotipo variant intended for dark
  backgrounds, since the entire site is dark end to end.
- **FR-021**: Pill MUST compose Radar `sm` with a caller-supplied label, in a
  fully-rounded dark-glass capsule with a bone-100 18% border, the documented
  gap of 11 and asymmetric padding (9 top/bottom, 20 right, 10 left), with the
  label in bone-200 at the pill type role.
- **FR-022**: BotonPrimario MUST support the three size variants of
  design-extract § 4 — `nav`, `hero`, `submit` — each with its documented
  padding and label size, on dark glass at a 12px radius.
- **FR-023**: BotonPrimario's border MUST be a 1.5px conic gradient with
  exactly three stops: red-400 at 0, bone-100 at 0.5, red-400 (`#cf3247`) at 1.
  Wine MUST NOT appear in this gradient. This supersedes the earlier
  `branding.md` wording, per design-extract § 4 and § 11.
- **FR-024**: The LED rotation MUST be one full turn per 2.6s, linear, starting
  on hover and stopping when the pointer leaves — implemented in CSS only, with
  no JavaScript of any kind.
- **FR-025**: Under `prefers-reduced-motion: reduce`, the LED MUST NOT animate
  and MUST render as a static red-400 border.
- **FR-026**: LinkArrow MUST render as loose text with a trailing arrow, MUST
  NOT paint a background or border in any state including hover and focus, and
  MUST support the two documented sizes (16px standard; 23→20 large).
- **FR-027**: SocialIcon MUST render one of the three normalized glyphs
  centred inside a 48×48 dark-glass square with a 10px radius and a bone-100
  18% border, with the glyph inheriting bone-100 from its container.
- **FR-028**: SocialIcon MUST expose an accessible name for the destination it
  links to, and MUST apply safe-referrer attributes when linking off-site.
- **FR-029**: No component may embed a Spanish or English content string — all
  visible text MUST arrive from the caller, so no `src/i18n/ui.ts` key and no
  route is added or changed by this feature.
- **FR-030**: No component markup may contain a hardcoded colour or size
  literal. Every visual value MUST resolve through a token defined in
  `src/styles/global.css` (Constitution Article IV).
- **FR-031**: The two colour values the design uses that have no equivalent in
  the brand ramps — the dark glass base `#1C1416` and the `bone-faint` border's
  `#FBF8F2` — MUST be resolved into named tokens rather than inlined, so a
  later brand change touches only the stylesheet.

### Social glyph assets

- **FR-032**: The three social glyphs (LinkedIn, Instagram, TikTok) MUST be
  normalized into the project to a single shared square viewBox.
- **FR-033**: Every `fill` in the normalized glyphs MUST be `currentColor`, so
  they inherit bone-100 (`#FBF8F6`) rather than the pure white (`#ffffff`)
  their sources hardcode.
- **FR-034**: The normalized glyphs MUST contain no `<style>`, no `<defs>`, no
  DOCTYPE, no tool metadata and no comments — specifically, Instagram's global
  `.cls-1` class MUST be gone, because inlining it would collide with page
  styles.
- **FR-035**: TikTok's non-square source art (1419×1627) MUST be optically
  centred in the square viewBox; nested `<g transform>` wrappers MUST be
  flattened where possible, including LinkedIn's `scale(8.53333)`.
- **FR-036**: The normalized assets MUST live alongside the existing
  `src/assets/logo/` precedent from feature 001, with a colocated note
  recording the source file each was derived from and what was changed.

### Scope boundary

- **FR-037**: No page, layout, section, card, form, nav, footer, section glow
  or background treatment may be created or modified. Specifically out of
  scope: PurposeCard, ProjectCard, TeamMemberCard, ServiceItem, FormField,
  RadioPill, FooterColumn, Nav, Footer, SectionGlow, DottedPaper. Design-extract
  § 10 is read only to shape the primitives' interfaces, never to build them.
- **FR-038**: No component instance may be placed on any existing page, and no
  existing page or layout file may be modified — the same scoping precedent as
  feature 001.
- **FR-039**: `pnpm check`, `pnpm typecheck`, `pnpm test` and `pnpm build` MUST
  all pass.

### Key Entities

- **Type role**: A named text style (display, h1, pill, meta…) carrying a
  fluid size, a line height and a proportional letter spacing. Consumed by
  applying one name.
- **Surface role**: A named spatial value (page margin, panel radius, card
  padding, form gap) that interpolates between a mobile and a desktop endpoint.
- **Glass variant**: One of six named intensities of the shared translucent
  recipe, each a fixed combination of fill, border, blur, radius and padding.
- **Radar size**: One of three named three-ring geometries.
- **Button size variant**: One of three named padding/label-size pairings
  (`nav`, `hero`, `submit`) sharing one border and one animation.
- **Social network**: One of three identities (LinkedIn, Instagram, TikTok),
  each mapping to one normalized glyph.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every text role in design-extract § 9 renders within 1px of its
  documented value at both 1440px and 390px, measured on a bare element with a
  single role applied.
- **SC-002**: Zero media queries exist in the delivered stylesheet or in any of
  the eight components for the purpose of sizing text or surfaces. (Media
  queries for reduced motion and hover capability are expected and are not
  sizing.)
- **SC-003**: All six glass variants match their design-extract § 1 row exactly
  on all five properties (fill, border, blur, radius, padding) at both
  viewports — 30 of 30 checks pass.
- **SC-004**: A search of the eight component files finds zero colour literals
  and zero fixed pixel sizes; every visual value traces back to a token in
  `src/styles/global.css`.
- **SC-005**: The production build contains no JavaScript attributable to these
  eight components, and every one of their behaviours (including the LED
  animation) is reproducible with JavaScript disabled.
- **SC-006**: With reduced motion requested, no element in this layer animates.
- **SC-007**: All three social glyphs render at the same optical size and adopt
  their container's colour; inlining all three on a page that also defines a
  `.cls-1` class produces no style bleed.
- **SC-008**: `git status` after implementation shows changes confined to
  `src/styles/global.css`, `src/components/`, `src/assets/`, `tests/` and the
  feature's own `specs/` directory — no page, layout or i18n file touched.
- **SC-009**: `pnpm check`, `pnpm typecheck`, `pnpm test` and `pnpm build` all
  exit zero.
- **SC-010**: A later section author can build the hero's eyebrow, headline,
  primary CTA and secondary link entirely from this layer without adding a
  single new token or a single new size declaration.

## Assumptions

Recorded because the design-extract does not state them and a reasonable
default exists. Each is reversible in `src/styles/global.css` alone.

- **A-01 · Fluid range endpoints**: The scale interpolates between 390px and
  1440px viewports, the exact widths of the mobile and desktop frames in the
  design file. No intermediate frame exists to contradict this.
- **A-02 · LED on touch devices** (relates to `decisions-open.md` open decision
  #8, classified there as non-blocking): since a touch device has no hover, the
  LED ring renders **static red-400** there, identical to the reduced-motion
  and no-JavaScript fallback. The alternative — a permanent loop on mobile —
  would be the only continuously animating element on the page and contradicts
  the "one LED per screen, on hover" restraint in `branding.md`. **Pending
  Clau's decision**; reversing it is a stylesheet change, not a component
  change.
- **A-03 · Desktop-only roles**: `h3` (44px) and `copy` (24px) have no
  documented mobile endpoint. Their mobile endpoints are derived by applying
  the same desktop→mobile ratio the neighbouring documented roles use, rather
  than freezing them at the desktop size.
- **A-04 · Undocumented mobile tracking**: where § 9 gives a desktop letter
  spacing but no mobile one, the proportional (em) value is carried across.
  Verified consistent: display −0.036/−0.037em, h2 −0.034/−0.034em, h2-alt
  −0.031/−0.031em, wordmark −0.03/−0.03em, service-name −0.03/−0.03em.
- **A-05 · `lead` divergence** (FR-009): resolved to the desktop values
  (weight 500, −0.02em). The mobile shift to 600/−0.03em is recorded for the
  PurposeCard feature that consumes it — out of scope here.
- **A-06 · LinkArrow weight** (FR-009): resolved to 600, the value used by 3 of
  the 4 documented instances. Only the desktop hero instance is 500.
- **A-07 · `bone-faint` border**: the design's `#FBF8F2` is treated as a
  one-off drift from `bone-100` `#FBF8F6` and is implemented as bone-100 at
  16%. The difference is imperceptible at 16% opacity and it keeps the token
  system whole. Flagged for Clau to correct in the design file.
- **A-08 · Dark glass base**: `#1C1416` is not `ink-500` (`#262626`) and is not
  in any brand ramp. It becomes its own named token rather than being forced
  onto an existing one.
- **A-09 · Glyph size inside SocialIcon**: the design's 18px `L`/`I`/`T` are
  placeholder letters, not the final art. The normalized 24×24 glyph is
  centred in the 48×48 button, giving a 12px inset — close to the documented
  10px padding and correct for real glyph art.
- **A-10 · Font weights 500 and 600 have no font file yet**: `public/fonts/` is
  empty and only 400/700 `@font-face` declarations exist, both pointing at
  files that are not in the repo (the TODO left by feature 001). This layer
  declares the correct weights; supplying the font binaries is a separate
  feature and does not block this one.
- **A-11 · Form width deferred**: § 9's form width row (660→342) is a layout
  concern belonging to the form feature, not a primitive. It is not tokenized
  here.
- **A-12 · Lockup isotipo variant**: the site is dark end to end, so Lockup
  uses `isotipo-on-ink.svg`. The `on-bone` and `on-red` variants delivered by
  feature 001 stay unconsumed, as feature 001 anticipated.

## Dependencies

- **Feature 001 (done)**: supplies the colour ramps, the two font-family
  tokens and the three isotipo SVG assets this layer builds on.
- **`docs/business/landing/design-extract.md`**: the sole source of
  measurements. The `.pen` design file is not read by this feature — the
  Pencil bridge is unavailable outside the interactive session.
- **`docs/business/landing/decisions-open.md` § Íconos de redes sociales**:
  defines the four normalization steps required of the social glyphs.
- **Three vendor SVG source files** under
  `~/Library/Mobile Documents/com~apple~CloudDocs/Pictures/Icons/Redes/`
  (`Instagram/Instagram_Glyph_White.svg`, `TikTok/tiktok-logo-white.svg`,
  `Linkedin/linkedin-logo-white.svg`) — confirmed present on 2026-09-06.
