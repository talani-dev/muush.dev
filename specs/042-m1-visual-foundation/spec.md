# Feature Specification: Muush 1.0 visual foundation — tokens, primitives and animated backgrounds

**Feature Branch**: `feat/v2-visual-foundation` (cut from `muush-v2`, merges back into `muush-v2`, never into `master`)
**Feature**: 42 `m1_visual_foundation` · `sdd: true` · depends on 41 (done)
**Created**: 2026-10-31
**Status**: Approved by Roberto on 2026-10-31
**Input**: User description: "Feature 42 `m1_visual_foundation` — Muush 1.0 (v2) visual foundation: design tokens 1.0, base primitives and animated WebGL backgrounds; cursor and spotlight kept and adapted to the dark background." (full text in `feature_list.json`, id 42)

> **Naming reorganization approved by Roberto 2026-11-01** (constitution
> 2.1.1, Article VII). No v2 name carries a version marker: the tokens are
> unprefixed (`--negro-950`, `bg-negro-950`, `text-hero`), the components are
> `Pill`, `PrimaryButton`, `GlassButton`, `GlassSurface`, `Heading`,
> `RotatingPill` and `ShaderBackground`, the tests are
> `tests/design-tokens.test.ts` and `tests/token-literals.test.ts`, and the
> stories are `Foundations/Tokens` and `Shared/UI/*`. v1 is quarantined in
> `app/shared/ui/legacy/`, `legacy-*` theme keys and the `Legacy v1/`
> Storybook group until feature 47. The feature name `m1_visual_foundation`
> and this folder's name are historical identifiers and keep the marker.
> Nothing changes in behaviour or rendering. Report:
> `docs/harness/progress/impl_42_naming.md`.

## Context

This is the first code feature of the Muush 1.0 redesign (v2, features 41–48).
It builds the **vocabulary** that the later features (43 shell, 44–46 pages)
are written in: the colour, type, shape and motion tokens, six primitives and
the animated section backgrounds. It builds **no** page, no section, no nav and
no footer.

### Sources of truth (in order of precedence)

1. `docs/harness/progress/pen-extract-42.md`: values the leader extracted from
   `muush.pen` on 2026-10-31. **The `.pen` wins** over every other source
   (`rules.md` § R32). The spec author cannot open the `.pen` and has not.
2. `docs/business/muush-1.0.md`: authoritative v2 decisions and approved copy.
3. `docs/handoff/muush-1.0/`: reference code (Astro + vanilla JS) with exact
   tokens, shader uniforms and behaviour rules. It is **translated**, never
   copied in, and nothing is served from `docs/`.
4. The v1 documents (`branding.md`, `landing/design-extract.md`,
   `landing/ui-map.md`, `landing/content.md`) describe the withdrawn design
   and supply **no** value to this feature.

### Settled decisions (cited, not re-decided)

- Dark theme only. The logo does not change (Roberto, 2026-10-31,
  `muush-1.0.md` § 1).
- 390 px and 1440 px are anchors that must match the `.pen`. At other widths,
  sizes and spacing may adapt; colour, components, copy and behaviour may not
  (Constitution VII, AGENTS.md § 3.1).
- The custom cursor and the spotlight stay (Roberto, 2026-10-31). Their colours
  may move to `--*`; their behaviour may not change (pen extract § 7).
- Only the listón and vidrio acanalado backgrounds are used. Brasa-acero is not
  (handoff README).
- `m1-red-400 #CF3147` in the `.pen` is "el rojo anterior", reference only. No
  token is created for it (pen extract § 1).
- No Google Fonts `@import` (pen extract § 5).
- No version bump in this feature (AGENTS.md § 3.1).

## User Scenarios & Testing *(mandatory)*

"Visitor" is anyone on `/es/…` or `/en/…`. "Builder" is whoever composes
features 43–46 from what this feature ships. "Reviewer" is Roberto, approving
it in the component catalogue (Storybook).

### User Story 1 - One token vocabulary for the redesign (Priority: P1)

A builder writing the v2 shell and sections can express every colour, type
size, radius, blur, shadow, spacing and motion value of the Kit through named
tokens. The tokens exist both as CSS custom properties and as utility classes,
so no component ever needs a literal value.

**Why this priority**: every other story and every later v2 feature depends on
it. Without it, Article VII cannot be satisfied.

**Independent Test**: open the token story in the catalogue and compare each
swatch and type sample with the Kit values in the pen extract. Check the
stylesheet for each `tokens.css` variable with an automated test.

**Acceptance Scenarios**:

1. **Given** the handoff `tokens.css`, **When** the site stylesheet is
   inspected, **Then** every one of its variables exists under the same name
   with the same computed value, except where the pen extract overrides it
   (FR-006, FR-007). Each override is recorded next to its token.
2. **Given** a builder needs Blanco text on Negro 950, **When** they write the
   markup, **Then** a utility class exists for each, with no arbitrary value.
3. **Given** the heading scale, **When** a hero heading renders at 1440 px,
   **Then** it is 96 px (not the handoff's 84). At 390 px it is 34 px.
4. **Given** any page, **When** it loads, **Then** no request reaches
   `fonts.googleapis.com` or `fonts.gstatic.com`, and Poppins 500 is
   available for headings.

---

### User Story 2 - Primitives that match the Kit (Priority: P1)

The reviewer sees in the catalogue the glass surface, the pill with the red
dot, the primary button, the glass button, the two-tone heading and the
rotating pill. Each matches the Kit at 390 and 1440 px, with Spanish and
English copy.

**Why this priority**: the hero, the forms and every section are built from
these. A wrong primitive repeats its error everywhere.

**Independent Test**: each primitive's stories render at the "Móvil (390)" and
"Escritorio (1440)" viewports with ES and EN copy and are compared with the
pen extract tables. Component tests pin props to classes.

**Acceptance Scenarios**:

1. **Given** the primary button at its desktop-hero size, **When** rendered,
   **Then** it shows the red three-stop gradient, a 1 px white 20 % border,
   the red shadow, the pill radius, a white 19 px semibold label and a 20 px
   right arrow, at 253 × 55 with the label "Diagnóstico gratis".
2. **Given** the glass button, **When** rendered, **Then** it shows a Carbón
   55 % fill, a 20 px backdrop blur, a 1 px border fading from Blanco 25 % at
   the top to Blanco 6 % at the bottom, a 17 px medium label and no icon.
3. **Given** the pill, **When** rendered, **Then** it is 36 px tall with the
   three concentric red rings (20 / 14 / 7 px at 12 % / 30 % / 100 %).
4. **Given** the glass surface with the form-panel, service-card and strip
   presets, **When** rendered side by side, **Then** each matches its row in
   pen extract § 3.
5. **Given** a two-tone heading with two lines, **When** rendered, **Then**
   line 1 is Blanco and line 2 is Gris 400, both Poppins 500, and a screen
   reader reads it as one heading.
6. **Given** a button primitive with a link destination, **When** activated,
   **Then** it navigates. Without a destination it behaves as a real button.

---

### User Story 3 - Living section backgrounds that never cost the visitor (Priority: P1)

A visitor on a section with an animated background sees the listón or the
fluted glass moving slowly behind the content. A visitor whose device cannot
or should not animate sees the section's still poster instead. No visitor pays
for animation they cannot see.

**Why this priority**: the backgrounds are the signature of v2 and the only
GPU-heavy element. Their failure modes (battery drain, blank sections, motion
sickness) are visible to visitors.

**Independent Test**: one background story per preset, checked in DevTools
(drawing paused offscreen and with the tab hidden), with reduced motion on,
with WebGL disabled and with JavaScript disabled.

**Acceptance Scenarios**:

1. **Given** a background in view, **When** the visitor scrolls it out of view
   or switches tab, **Then** it stops drawing frames, and it resumes when they
   return.
2. **Given** `prefers-reduced-motion: reduce`, **When** the section shows,
   **Then** exactly one still frame is drawn and nothing animates.
3. **Given** no WebGL, a shader that fails to compile, a lost GPU context or
   no JavaScript, **When** the section shows, **Then** its poster is visible
   and the section is never blank.
4. **Given** the shader has not drawn its first frame yet, **When** the
   section shows, **Then** the poster is visible (no black flash, no empty
   box).
5. **Given** a viewport below 768 px, **When** the background draws, **Then**
   it renders at 1× device pixels. At 768 px and above it renders at most at
   1.5×.
6. **Given** any background, **When** the visitor clicks on it or uses
   assistive technology, **Then** it intercepts no pointer and is not
   announced.

---

### User Story 4 - A rotating pill every visitor can read (Priority: P2)

A visitor sees the hero pill cycle through the four service names every 2.6 s
with a short upward slide. A visitor with reduced motion sees only the first
name. A screen-reader user hears all four names once and is not interrupted
every 2.6 s.

**Why this priority**: it is a single hero element, but it is the only
primitive that changes its content on its own.

**Independent Test**: the rotating-pill story with ES and EN items, a component
test with fake timers and a reduced-motion stub, and a check of the
accessibility tree.

**Acceptance Scenarios**:

1. **Given** motion is allowed and the tab is visible, **When** 2.6 s pass,
   **Then** the visible text changes to the next item, wrapping after the last.
2. **Given** reduced motion, **When** any amount of time passes, **Then** the
   first item stays.
3. **Given** a hidden tab, or the pointer resting on the pill, **When** the
   interval elapses, **Then** the text does not advance.
4. **Given** a screen reader, **When** it reaches the pill, **Then** it reads
   all items once and makes no announcement on each rotation.
5. **Given** JavaScript is off, **When** the page renders, **Then** the first
   item is shown.

---

### User Story 5 - Cursor and spotlight still work, now on dark (Priority: P2)

A visitor with a mouse keeps the brand cursor and the red lit-dots spotlight.
Both behave exactly as before, in the v2 accent red, over the new near-black
canvas.

**Why this priority**: this is Roberto's explicit decision to keep them.
Nothing new is built; the two are recoloured and re-verified.

**Independent Test**: the existing cursor and spotlight tests and stories pass
after the recolour, plus a manual check on `/es/` and `/en/` with a mouse.

**Acceptance Scenarios**:

1. **Given** a fine hovering pointer and motion allowed, **When** the pointer
   moves over the page, **Then** the dots near it turn red (the v2 accent) and
   fade with distance, at the same radius and under the same conditions as
   feature 34 A2.
2. **Given** the brand cursor, **When** shown over the canvas, links, buttons
   and text fields, **Then** it behaves exactly as in feature 34: the arrow,
   the same image on links and buttons, the I-beam in text fields and the
   native cursor in forced-colours mode.
3. **Given** touch, reduced motion or no JavaScript, **When** the page
   renders, **Then** no spotlight appears, unchanged from features 8 and 34.

---

### Edge Cases

- **Root font size enlarged**: tokens are authored in `rem`, so type, radii and
  spacing scale with it. The spotlight keeps its registration with the dots.
- **Widths between anchors (360, 768, 1024, 1280, 1920)**: fluid tokens may
  deviate from a literal interpolation, but never cause horizontal scroll,
  clipped text or overlap. Below 390 px the fluid minimum holds; above 1440 px
  the maximum holds.
- **Two backgrounds on one page**: each pauses on its own visibility.
- **Window resize or orientation change**: the canvas re-measures and applies
  the DPR cap for the new width.
- **GPU context lost mid-session**: the poster shows again. No error reaches
  the visitor.
- **Reduced motion toggled while the page is open**: the background switches
  to a still frame and the rotating pill stops on its current item. (The
  handoff reads the preference once; this feature follows it live. See
  Assumptions.)
- **Hero buttons below 1024 px**: the mobile hero primary button shows the
  same 20 px arrow as the desktop one; only its padding and label size change
  (pen extract § 9, corrected 2026-11-01).
- **A rotating pill with one item**: it never rotates.
- **Forced-colours mode**: buttons and pills keep a visible boundary and a
  readable label in system colours. The brand cursor gives way to the OS
  cursor, as today.
- **Print**: backgrounds and the spotlight are not printed.

## Requirements *(mandatory)*

### Functional Requirements

#### Tokens

- **FR-001**: The site stylesheet MUST define every variable of the handoff
  `tokens.css` under its name without the handoff's `m1-` version prefix
  (the two font stacks are `--fuente-titulo` and `--fuente-texto`, see
  research R1), with the same computed value at the
  default 16 px root, except where FR-006 or FR-007 records a `.pen` override.
- **FR-002**: The palette MUST be exactly the fourteen `m1-*` colours of pen
  extract § 1 plus the text-with-opacity tokens (suave 70 %, tenue 40 %, línea
  12 %, línea fuerte 20 %). There is no token for `#CF3147` and no
  `--brasa-500` alias.
- **FR-003**: Every colour, font family, type size, radius, blur, shadow,
  spacing and container token MUST also be exposed as a utility class in an
  unprefixed namespace (for example a `bg-negro-950` background and a
  `font-titulo` font; renamed 2026-11-01 from an `m1` namespace), so
  components consume tokens through classes. Motion durations, gradients
  and other values the utility layer cannot express stay CSS custom
  properties, read by component-scoped styles.
- **FR-004**: The v1 token families (`--bone-*`, `--ink-*`, `--red-*`,
  `--wine-*` and everything derived from them) MUST stay untouched so the v1
  sections keep rendering until feature 47. No file this feature creates MAY
  reference them.
- **FR-005**: Fonts MUST keep resolving through the existing self-hosted build
  step. Poppins 500 MUST be added to that set (headings, logo and wordmark,
  Constitution VII). No stylesheet MAY import from `fonts.googleapis.com`.
- **FR-006**: The heading scale MUST follow pen extract § 4, anchored at
  390 → 1440 px: hero 34 → 96 (line-height 1.1 → 1.06, tracking 0 → −3.5 px);
  section 28 → 56 (1.15 → 1.1, tracking 0 → −1.96 px); process 28 → 52
  (1.15 → 1.1, 0 → −1.82 px); assessment 34 → 64 (1.15 → 1.08, 0 → −2.24 px).
  The handoff's `--h-hero` keeps its name with the `.pen` maximum (96, not 84).
  Tracking is fluid: 0 at 390 and about −0.035 em at 1440 (the px values
  above), so both anchors match (pen extract § 8). The section size is 28 at
  390; the 30, 32 and 34 px mobile sizes some sections use (Servicios, Nosotros
  hero, Cómo se arma, Trabaja con muush) are per-use overrides that features
  44 and 46 own, not part of this scale (Clarifications Q2, resolved).
- **FR-007**: Text tokens MUST cover the hero subtitle (17 → 20 px,
  line-height 1.5, Blanco 70 %) and the section body (17 px, line-height 1.55,
  Gris 400) from pen extract § 4, the service-card title (24 px at both
  anchors, tracking −0.6 px, pen extract § 8), plus the handoff's card-heading,
  paragraph, small and label sizes. The handoff's `--p-grande` (16 → 20) is
  re-anchored to the `.pen` hero subtitle (17 → 20).
- **FR-008**: Radii (control 12, field 12, card 22, tile 28, pill 999, control
  side 36), gutters (24 / 80), section padding (72 / 120), the container
  maximum (1280), the nav background and motion (ease
  `cubic-bezier(.2,.7,.2,1)`; 180 / 320 / 700 ms, all 0 ms under reduced
  motion) MUST be tokens with the values of pen extract § 5.
- **FR-009**: The page canvas MUST become Negro 950 (`#050505`). This covers
  the document canvas (overscroll included) and the layout root, which must
  agree so no seam shows. Nothing else on the live pages changes colour in this
  feature (see "What changes visually").

#### Primitives

- **FR-010 — Glass surface**: one primitive for the translucent dark surface
  family, parametrised by tint and opacity, radius, blur, shadow and edge (the
  1 px top-lit border that fades downward). It has three named presets that
  match pen extract § 3 exactly:
  - **form panel**: Negro 900 at 70 %, radius 28, edge 25 % → 4 %, blur 30,
    shadow black at 67 % y 30 blur 80, padding 36;
  - **service card**: opaque Negro 900, radius 24, edge 18 % → 4 %, no blur,
    clips its content;
  - **strip**: Carbón 800 at 40 %, radius 20, flat edge at 10 %, blur 20,
    padding 22 / 28.

  It renders its caller's content and carries no copy.
- **FR-011 — Pill**: fill Carbón 800 at 60 %, pill radius, 1 px Blanco 12 %
  border, 16 px backdrop blur, padding 8 / 18 / 8 / 10, gap 10. The red dot has
  three rings (20 / 14 / 7 px at 12 % / 30 % / 100 % Red muush 500) and is
  decorative. Label: Instrument Sans 13 / 500, tracking 0.6 px, Blanco. Height
  36 at both anchors.
- **FR-012 — Primary button**: top-to-bottom gradient `#EC4A44` 0 % →
  `#E5352F` 55 % → `#C42A25` 100 %, pill radius, 1 px white 20 % border,
  shadow Red muush 500 at 33 % y 10 blur 32, label Instrument Sans 600 in
  Blanco, plus a right-arrow icon. Sizes (pen extract § 2):
  - **hero desktop**: 16 / 30, 19 px, icon 20 (253 × 55);
  - **nav**: 11 / 20, 15 px, icon 16 (195 × 40);
  - **hero mobile**: 12 / 14, 14 px, icon 20 (178 × 44; pen extract § 9);
  - **full width** for form submits (302 × 55 at 390).

  It renders a link when given a destination and a real button otherwise, and
  keeps a disabled state.
- **FR-013 — Glass button**: fill Carbón 800 at 55 %, pill radius, 1 px edge
  Blanco 25 % → 6 %, 20 px backdrop blur, padding 16 / 28, label Instrument
  Sans 17 / 500 in Blanco, no icon (198 × 53). Mobile: 12 / 14, 14 px
  (145 × 41). Link or button as in FR-012.
- **FR-014 — Two-tone heading**: Poppins 500, a heading element at the
  caller's level, line 1 in Blanco and line 2 in Gris 400, each on its own
  line, at one of the four sizes of FR-006. A one-line heading (line 1 only)
  is allowed. It is read as one heading.
- **FR-015 — Rotating pill**: the pill of FR-011, whose label cycles through a
  caller-supplied list every 2.6 s. The outgoing label fades and rises 6 px
  over 220 ms; the incoming one rises from 6 px below over 260 ms (handoff
  `rotatePill`). It does not advance while the tab is hidden or while the
  pointer hovers it (Clarifications Q4), stays on the
  first item under reduced motion, renders the first item without
  JavaScript, exposes all items once to assistive technology and does not
  announce each rotation.
- **FR-016**: Every primitive MUST receive all visible text from its caller
  (no copy lives in a primitive) and MUST contain no hex, rgb or px literal
  and no v1 token.
- **FR-017**: The primary and glass buttons MUST show a visible keyboard focus
  indicator built from v2 tokens: a 2 px Blanco outline with a 3 px offset,
  shown on keyboard focus only (Clarifications Q3).

#### Animated backgrounds

- **FR-018**: One background component draws either the listón or the vidrio
  acanalado shader, chosen by a named **preset** that bundles the shader, its
  uniforms and its poster for each production use in the handoff README: home
  hero, cómo trabajamos, diagnóstico y contacto, Nosotros hero, Trabaja con
  muush, Preguntas and 404. Every preset also carries `u_flip: 1`; omitted
  uniforms take the shader defaults.
- **FR-019**: It MUST stop drawing when it is off screen (with a look-ahead
  margin of about 100 px, as in the handoff) or when the tab is hidden, and
  resume when both conditions clear.
- **FR-020**: Under reduced motion it MUST draw exactly one still frame (at
  the handoff's still time, 12 s) and run no animation loop.
- **FR-021**: The section's poster MUST be visible with JavaScript disabled,
  when WebGL is unavailable, when the shader fails to compile or link, after a
  context loss, and until the first frame is drawn. The home hero poster is
  not lazy-loaded.
- **FR-022**: Drawing resolution MUST be capped at 1× device pixels below a
  768 px viewport width and at 1.5× from 768 px up, re-evaluated on resize.
- **FR-023**: The background MUST fill its positioned section, sit beneath
  the section's content, intercept no pointer (`pointer-events: none`), be
  `aria-hidden` and not print.
- **FR-024**: All observers, listeners, animation frames and the GPU context
  MUST be released when the component unmounts. (The handoff never releases
  them; a client-side-routed site must.)
- **FR-025**: Shader sources and posters MUST live in the application's own
  assets and be bundled by the build. Nothing is served or imported from
  `docs/`. The unused `m1-brasa-acero` shader is not shipped.
- **FR-026**: The background MUST add no runtime dependency and no server
  capability (Article IV).

#### Cursor and spotlight

- **FR-027**: The spotlight's lit-dot colour MUST move from the v1 `--red-400`
  to `--red-muush-500`. Its radius, mask fall-off, mounting conditions
  (fine hovering pointer, motion allowed, after the first mouse event),
  registration with the dot grid and fade timing MUST NOT change.
- **FR-028**: The brand cursor image MUST be recoloured from `#CF3147` to Red
  muush 500 `#E5352F` (Clarifications Q1). Its size, hotspot, fallback keywords, the I-beam on text
  fields and the forced-colours exemption MUST NOT change.
- **FR-029**: The existing tests that pin the spotlight colour and the cursor
  literal MUST be updated to the new values, not deleted.

#### Quality

- **FR-030**: Every new primitive and the background MUST have catalogue
  stories at both anchor viewports, with ES and EN copy where the primitive
  shows text, plus component tests. Every composable MUST have unit tests
  (Article X).
- **FR-031**: The i18n parity test MUST stay green. This feature adds no
  user-facing string to the site (primitives receive copy as props), so it
  adds no locale key.
- **FR-032**: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`,
  `pnpm storybook:build` and `./init.sh` MUST pass.

### What changes visually on the live pages after 42

"Live" means the `muush-v2` integration build. Production (`master`) does not
change until feature 47.

1. **The canvas becomes Negro 950** (`#050505`) instead of Ink 500
   (`#262626`), behind every v1 section on the home, Nosotros/About and 404
   pages in both locales. The v1 dotted paper and section glows still paint on
   top of it, so the pages read darker with the same decoration.
2. **The v1 footer keeps its own flat Ink 500 surface**, which feature 34 A2
   rev 1 pinned. It now shows as a lighter grey band at the bottom of every
   page until feature 43 replaces it. Any other v1 surface painted in Ink 500
   or the v1 dark glass also now sits on a darker canvas.
3. **The spotlight dots and the brand cursor** turn Red muush 500 instead of
   the former red, a small shift toward a warmer red.
4. **Nothing else.** No primitive, background or token of this feature is
   placed on a page. The new primitives are visible only in the catalogue.

### Key Entities

- **Token**: a named design value (`--*`), its value, its source (handoff or
  `.pen` override) and its utility-class exposure.
- **Glass preset**: a named combination of tint and opacity, radius, blur,
  shadow, edge and padding (form panel, service card, strip).
- **Background preset**: a named section use: shader (listón or acanalado),
  uniform overrides, poster image and whether the poster is high priority.
- **Poster**: a still image of a preset, shown before and instead of the
  animation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % of the `tokens.css` variables are present with matching
  computed values (or a recorded `.pen` override), checked by an automated
  test.
- **SC-002**: At 390 px and 1440 px every primitive story matches the pen
  extract's dimensions within 1 px: buttons 253 × 55, 195 × 40, 178 × 44,
  198 × 53 and 145 × 41; pill height 36; hero heading 96 / 34 px.
- **SC-003**: At 360, 768, 1024, 1280 and 1920 px no primitive story shows
  horizontal scroll, clipped text or overlap.
- **SC-004**: With a background scrolled out of view or the tab hidden, zero
  frames are drawn, verified in the performance panel and by a unit test of
  the run condition.
- **SC-005**: With WebGL disabled, with JavaScript disabled and with reduced
  motion, 100 % of background presets show a non-blank section (the poster or
  one still frame).
- **SC-006**: The built site makes zero requests to Google Fonts and contains
  no server route; the `pnpm generate` output stays fully static.
- **SC-007**: Zero hex, rgb or px literals and zero v1 tokens in the files this
  feature creates under `app/`, checked by an automated scan.
- **SC-008**: A screen reader announces the rotating pill's items once and
  makes zero announcements during 30 s of rotation.
- **SC-009**: All existing cursor and spotlight tests pass after the recolour,
  with only their pinned colour values changed.

## Clarifications

### Session 2026-10-31

`/speckit-clarify` ran inside the spec_author subagent, which cannot reach
Roberto. Each answer below is the **recommended option, applied
provisionally**, unless marked RESOLVED. Roberto confirms or changes each
provisional one at the spec_ready gate; a change is a one-line edit to the
requirement named.

**Update 2026-10-31:** Roberto approved the spec and confirmed every
provisional answer below (Q1, Q3, Q4) at the gate; Q2 was already resolved.

- Q1: Should the brand cursor image move from `#CF3147` to the v2 accent Red
  muush 500 `#E5352F`, or keep the former red? Options: A recolour to
  `#E5352F` · B keep `#CF3147` · C recolour and add a light outline. → A:
  **A, recolour to `#E5352F`** (confirmed by Roberto 2026-10-31). The Kit marks `#CF3147` as
  reference-only and names Red muush 500 the only solid accent; pen extract
  § 7 allows moving the cursor's colours to `--*`. Applied in FR-028.
- Q2: Which heading values hold at 390 px, where the extract gave no mobile
  tracking, "≈ −2 px" for the section heading and "28–30" for the mobile
  section size? Options: A tracking proportional to size (em), section 28 at
  390 · B no tracking at 390 · C ask the leader to re-extract. → A: **C,
  RESOLVED by the leader's re-check (pen extract § 8, frames `V2s7T`,
  `mJxKt`, `trkk7`)**. Tracking is 0 at 390 and about −0.035 em at 1440, so it
  is fluid (hero 0 → −3.5 px, section 0 → −1.96 px, process 0 → −1.82 px,
  assessment 0 → −2.24 px). The section heading is 28 at 390; the 30, 32 and
  34 sizes of individual sections are per-use overrides owned by features 44
  and 46. Applied in FR-006. The provisional answer that preceded it (an em
  value scaled from 1440, i.e. −1.24 px on a 34 px mobile hero) is withdrawn.
- Q3: What does keyboard focus look like on the v2 buttons, since the `.pen`
  draws no focus state? Options: A 2 px Blanco outline, 3 px offset, on
  `:focus-visible` only · B 2 px Red muush 500 outline · C browser default. →
  A: **A** (confirmed by Roberto 2026-10-31). A red ring disappears against the red primary
  button; Blanco reads on both buttons and on Negro 950; the browser default
  varies by engine. Width and offset are tokens. Applied in FR-017.
- Q4: The rotating pill updates itself indefinitely, which WCAG 2.2.2 (Pause,
  Stop, Hide) asks to be pausable. Options: A rotate as designed, no pause ·
  B pause while the pointer hovers the pill · C stop after one full cycle. →
  A: **B, pause while hovered** (confirmed by Roberto 2026-10-31). It is the smallest addition to
  the designed behaviour; reduced motion already stops it entirely, and the
  full list is exposed to assistive technology. Applied in FR-015.

## Assumptions

- **Spec folder number.** `042` matches the feature id, following this repo's
  convention (002, 003, 006, 008, 034 and 036 all equal their feature ids).
- **Units.** Tokens are authored in `rem`, the repo's
  convention, so they scale with the root font size. "Same value" in FR-001
  means the same computed value at the default 16 px root.
- **Fluid scale method.** Each fluid token interpolates linearly between its
  390 px and 1440 px values and clamps outside them (Constitution VII,
  responsive anchors).
- **Copy.** Primitives carry no copy. Catalogue stories use the approved copy
  of `muush-1.0.md` § 4 in ES and EN. The four rotating-pill items and the
  hero CTA labels are added to the locale files by feature 44, which places
  them.
- **Arrow icon.** The lucide `arrow-right` glyph is stored as a local SVG asset
  (no icon dependency) and is decorative.
- **Hero button switch.** The hero buttons change from the mobile to the
  desktop size at 1024 px, the handoff's desktop threshold. Sizes in between
  may interpolate (responsive latitude).
- **Reduced motion changed at runtime** is followed live, an improvement on the
  handoff, which reads it once. Behaviour at load is identical.
- **Trabaja con muush poster.** That preset reuses the diagnóstico poster
  because the README gives it the same uniforms and the handoff ships no
  poster of its own. INFERRED.
- **Service card radius.** RESOLVED (pen extract § 8): the `.pen` confirms 24
  for the service card. The service-card preset uses 24 and the handoff's
  `--radio-tarjeta` token keeps 22.
- **Poppins 600** stays in the self-hosted set until feature 47 because v1
  components still use it.
- **Naming.** The new primitives are distinct from the v1 `Pill`,
  `PrimaryButton` and `GlassPanel`, which v1 sections still use until 47.

## Out of scope

- Nav, header behaviour, mobile menu and footer (feature 43); page sections and
  placing backgrounds in them (44–46); legal pages (48); removing v1 tokens,
  the dotted paper, glows and v1 components, and the 2.0.0 bump (47).
- A new logo or wordmark: the isotipo does not change. Its on-dark colours
  (Blanco stroke, Red muush 500 dot) are applied where the shell places it
  (43). Recolouring the favicon is not in this feature.
- The final animation of the Cómo trabajamos line (Clau, pending).
- A new cursor or spotlight design, and any change to either one's behaviour.
