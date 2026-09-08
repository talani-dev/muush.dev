# Feature Specification: Propósito — the Golden Circle section

**Feature Branch**: `013-purpose-section` (no branch created — see § *Process notes*)
**Created**: 2026-09-08
**Status**: Draft
**Input**: feature 13 `purpose_section` in `feature_list.json`, plus the leader's
reading of frames `ayCiG` (desktop 1440×900) and `D2AvaO` (mobile 390×534) on
2026-09-08 (`rules.md` § R32).

## Summary

`02 Propósito` is the landing's second section and the site's **most divergent**:
desktop is a Golden Circle constellation that reveals on hover/focus, mobile is a
three-card carousel. Two compositions, not one rescaled.

At rest the desktop constellation shows **only** three pinging radars and three
words. Hovering a radar or its word extends that node's connector line rightward
and then reveals its card. The `.pen` draws the **revealed** state — the same
misreading `ui-map.md` § *Receta del ping* already recorded for the radar's halos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The Golden Circle reads itself, one node at a time (Priority: P1)

A visitor at desktop width scrolls past the Hero and finds three words on a
constellation of pulsing dots. Pointing at one draws a line to the right and a
glass card appears with that block's copy. Moving away puts it back.

**Why this priority**: this is the section. Without the reveal the section is
either three bare words (no substance) or three permanent cards (not the design).

**Independent Test**: load `/es` and `/en` at 1440px. At rest, no card and no line
is visible. Hover each radar and each word in turn; the matching line then card
appear, and the other two stay hidden.

**Acceptance Scenarios**:

1. **Given** the landing at 1440px with the pointer outside the section, **When**
   it is rendered, **Then** three radars with their ping and three labels are
   visible, and all three lines have zero width and all three cards zero opacity.
2. **Given** the pointer on the `Why` radar, **When** it settles, **Then** the
   `Why` line extends to the card column and the `Why` card fades in after it —
   and `How` and `What` stay hidden.
3. **Given** the pointer on the `How` **word** (not the radar), **When** it
   settles, **Then** `How` reveals exactly as it does from the radar.
4. **Given** a revealed node, **When** the pointer leaves the trigger, **Then**
   the card fades out and the line retracts, in that order.

---

### User Story 2 — Keyboard and touch get the same substance (Priority: P1)

A keyboard user tabs into the section; a tablet user at desktop width has no
pointer at all. Both must be able to read Why/How/What.

**Why this priority**: the copy is the substance of the Golden Circle, not
decoration. A section whose content exists only under a cursor excludes keyboard
users and every touch screen wider than 1024px.

**Independent Test**: at 1440px, tab through the section and confirm each node
reveals on focus. Then emulate a coarse pointer (`hover: none`) and confirm all
three nodes render revealed with no interaction.

**Acceptance Scenarios**:

1. **Given** the constellation, **When** the visitor tabs to a node's trigger,
   **Then** that node reveals and the focus ring is visible.
2. **Given** a device with no hover (`@media (hover: none)`) at desktop width,
   **When** the section renders, **Then** all three lines are at full width and
   all three cards at full opacity, with no interaction required.
3. **Given** a screen reader at desktop width, **When** it walks the section,
   **Then** it reads each label followed by that node's copy, once — never twice,
   and never a card announced as empty.
4. **Given** `prefers-reduced-motion: reduce`, **When** a node is hovered or
   focused, **Then** the card and line appear **immediately** with no transition,
   and the radar ping is off (already inherited from `Radar`).

---

### User Story 3 — Mobile reads it as a carousel (Priority: P1)

At 390px there is no constellation: three cards on a horizontal track, the centred
one at full size and its neighbours smaller and dimmed, with three dots below.

**Why this priority**: it is the only form the section has below 1024px, so it is
half the feature's surface, not an enhancement.

**Independent Test**: load `/es` and `/en` at 390px. Confirm `Why` is centred and
active on entry, the neighbours are visibly smaller and dimmer, swiping and the
dots both change the active card, and the label is **inside** each card.

**Acceptance Scenarios**:

1. **Given** the landing at 390px, **When** it renders, **Then** `Why` is centred
   at full size and opacity and the other two are scaled down and dimmed.
2. **Given** the carousel, **When** the visitor swipes horizontally, **Then** the
   track snaps to the next card and the indicator follows.
3. **Given** the indicator, **When** a dot is activated by pointer or keyboard,
   **Then** its card is centred and becomes active.
4. **Given** scripting is unavailable, **When** the carousel renders, **Then** it
   is a native horizontally scrolling snap track with **all three cards at full
   size and opacity** (`ui-map.md` § 10) — no content lost.
5. **Given** the section, **When** the page is scrolled vertically over it,
   **Then** the page scroll is never hijacked.

---

### User Story 4 — The section contributes its background without breaking it (Priority: P2)

The section carries three glows and three concentric arcs. They must paint below
the page-wide dotted paper, and the arcs must not leak into the neighbouring
sections.

**Why this priority**: the R28/R37 paint-order contract fails **silently** — no
error, no red test, the page just stops matching the design. This is only the
second section bound by it.

**Independent Test**: on the generated artefact, read the computed `z-index` of
the section's backdrop (`-3`), the dot sheet (`-2`) and the section's content
(`auto`), and confirm the arcs are clipped to the section box.

**Acceptance Scenarios**:

1. **Given** the built page, **When** the four levels are measured **on the page**
   (not in Storybook), **Then** glows sit below the dots and the content above.
2. **Given** the section element, **When** its computed style is read, **Then** it
   declares none of the eleven stacking-context properties and no background.
3. **Given** the desktop arcs, **When** the page is inspected above and below the
   section, **Then** no arc is painted outside the section box.
4. **Given** any viewport from 320px to 2560px, **When** the page is measured,
   **Then** `scrollWidth` never exceeds `clientWidth`.

---

### Edge Cases

- **Two nodes hovered in quick succession** — each node is independent; the
  leaving node retracts while the entering one extends. No shared state exists to
  desynchronise.
- **Pointer crosses the card** — the card never intercepts the pointer, so
  crossing it changes nothing. Text inside a revealed card is therefore not
  selectable with a mouse; the copy is fully selectable at mobile and coarse-pointer
  widths, where it is permanently visible (assumption A-06).
- **A locale's copy is longer** — card heights are intrinsic (copy-driven), so the
  stack grows and the radars stay centred on their own card. Nothing is measured
  from a hard-coded card height.
- **Section is the last block in the document** — it is not; Servicios follows. If
  it temporarily is, its glows can lengthen the document, which the layout root's
  `overflow-clip` and `html`'s ink surface already absorb (`findings.md` §§ R54, R57).
- **A fragment jump to `#proposito`** — the section's own top padding (164px
  desktop / 90px mobile) exceeds the pinned nav's height (103 / 78), so the first
  content lands below the nav with no `scroll-margin-top` (assumption A-05).

## Requirements *(mandatory)*

### Functional Requirements — structure and copy

- **FR-001**: The section MUST render on the landing in both locales, carry
  `id="proposito"` and be preceded by nothing but the Hero. This is the target of
  three links the shell already emits (`SHELL_ANCHORS.purpose`), so it closes
  three of the five dangling anchors `rules.md` § R50 records.
- **FR-002**: The section MUST render a `Pill` eyebrow, then exactly one of two
  compositions: the constellation at ≥1024px, the carousel below it. The inactive
  composition MUST be removed from rendering (`display: none`), never merely
  transparent, so no copy is announced twice.
- **FR-003**: All copy MUST come from `landing.purpose.*` in
  `i18n/locales/{es,en}.json`, both locales present, with zero strings in
  components (Article VI).
- **FR-004**: The card component MUST always receive `label` **and** `copy`, with
  no mode/variant prop. Mobile paints the label inside the card; desktop hides the
  card's own label with one utility and the constellation paints the word outside
  (`decisions-open.md` § D6).
- **FR-005**: The three cards MUST share one set of surface values. The frame's
  brighter Why card (`#CF31472B` fill / `#CF314778` stroke) is its **hover** state,
  not Golden Circle hierarchy (Roberto, 2026-09-08).

### Functional Requirements — the reveal

- **FR-006**: At rest the constellation MUST show only the three radars (with
  their ping) and the three labels. Every line MUST have zero width and every card
  zero opacity.
- **FR-007**: Hovering **or** focusing a node's trigger MUST reveal that node
  only: the line extends rightward first, the card fades in after it. Removing
  hover/focus MUST reverse it — card out first, line retracting after.
- **FR-008**: The reveal MUST be pure CSS — `:hover` and `:focus-visible` on the
  trigger driving its later siblings. No JavaScript, no composable, no client
  state (same class of mechanism as the LED ring and the radar ping).
- **FR-009**: Each node's trigger MUST be a real focusable control whose
  accessible name is that node's label. Its activation MUST have no destination
  and MUST emit no `href` and no fragment (`rules.md` § R50).
- **FR-010**: Every card's copy MUST be present in the DOM **and in the
  accessibility tree** at rest. Hiding MUST use `opacity` only — never
  `display: none`, `visibility: hidden` or `content-visibility: hidden`.
- **FR-011**: Under `@media (hover: none)` the three nodes MUST render revealed
  with no interaction, at any width where the constellation renders.
- **FR-012**: Under `prefers-reduced-motion: reduce` the reveal MUST be kept and
  only the transition dropped. Showing the card is information; the slide is
  decoration.
- **FR-013**: The radar MUST have two intensities, dimmer at rest and brighter on
  reveal, applied as one opacity lever on the radar's wrapper — **without editing
  `Radar.vue`**, which is a `done` contract with no colour or opacity prop.

### Functional Requirements — desktop geometry

- **FR-014**: The three connector line lengths MUST be generated by one formula,
  not written as `394 / 244 / 94`. The radars step 150px right while all three
  cards align at one x, so the length is `cardLeft − (radarCentre + radar/2 + 1)`
  and each node differs only by its index. See `data-model.md` § 2.
- **FR-015**: Card heights MUST be intrinsic. The frame's 228 / 187 / 146 are
  4 / 3 / 2 lines of 30px copy plus 2×32 padding and MUST NOT become tokens.
- **FR-016**: Each node's radar and connector line MUST be vertically centred on
  that node's card — a relation, not three measured offsets.
- **FR-017**: The three arcs MUST be expressed as one origin plus three radii, and
  the radii MUST be recorded as `2 × distance(origin, radarCentre)`. Their frame
  diameters (1039 / 1617 / 2134) are that arithmetic, verified to under 1px per
  arc — they are not three magic numbers.
- **FR-018**: The arcs MUST be clipped to the section box so no hairline is
  painted over the Hero or Servicios. The clip MUST NOT be placed on the section
  element itself, which would also cut the section's own glows.
- **FR-019**: The section MUST NOT declare bottom padding. The gap to Servicios
  belongs to Servicios (`rules.md` § R49).

### Functional Requirements — mobile carousel

- **FR-020**: The track MUST be a native centre-snapping horizontal scroller, so
  swiping, snapping and centring work with no JavaScript.
- **FR-021**: The neighbour state MUST be one scale plus one opacity applied to
  the same card, not a second smaller card. The frame's 241×278 is 274×316 × 0.88
  on **both** axes (agreement to four decimals), so `0.88` is the value and the
  drawn 18px copy is that scale drawn statically.
- **FR-022**: The indicator MUST be three real buttons that centre their card,
  operable by keyboard, with the active one marked for assistive technology
  (`ui-map.md` § *Accesibilidad mínima*).
- **FR-023**: Without JavaScript all three cards MUST render at full size and full
  opacity, never dimmed by default (`ui-map.md` § 10). Same under
  `prefers-reduced-motion: reduce`.
- **FR-024**: The cards MUST NOT be links and MUST NOT show a pointer cursor
  (`ui-map.md` § 4, `findings.md` § R56).
- **FR-025**: The section MUST NOT hijack vertical page scroll.

### Functional Requirements — background contribution

- **FR-026**: The section MUST contribute three glows through the feature 6
  mechanism, with **zero** edits to `SectionGlow.vue`, `SectionBackdrop.vue`,
  `DotGrid.vue` or the `--layer-*` tokens: `wine-400` 20% size `1000-560`,
  `wine-300` 17% size `820-480`, and `Glow origen` `red-400` 12% size `920`.
- **FR-027**: `Glow origen` MUST render **inside** this section, which is where the
  design nests it. It is the consumer of `SectionGlow`'s `'920'` size variant, and
  the reason that variant is not dead code.
- **FR-028**: `Glow origen` MUST NOT render below 1024px — the design gives it no
  mobile size.
- **FR-029**: All glow offsets MUST be section-relative, converted from the
  design's page-absolute centres per `rules.md` §§ R29 and R48, and each axis of
  each glow MUST interpolate between its **two measured** endpoints. No offset may
  be derived from the other viewport (§ R48's disproved derivation).
- **FR-030**: The section, and every wrapper between it and the layout root, MUST
  create no stacking context and paint no opaque background (`rules.md` §§ R28,
  R37). If either turns out to be needed, that is a finding to report, not
  something to work around.
- **FR-031**: No token added by this feature may be named `--color-glow-*` or
  `--spacing-glow-*` — that namespace is closed and its test lives in a file this
  feature never opens (`rules.md` § R36).

### Key Entities

- **Purpose node** — one Golden Circle block: an index (0/1/2), a label key and a
  copy key. The index is what generates every horizontal offset and the line
  length; nothing else distinguishes the three.
- **Purpose card** — label + copy on a red glass surface. One component, two
  placements for the label, no mode prop.

## Success Criteria *(mandatory)*

- **SC-001**: At 1440px with no pointer over the section, a visitor sees three
  words and three pulsing dots and **no card and no line**; each of the three
  reveals independently from either its dot or its word.
- **SC-002**: Every one of the three blocks' copy is reachable by keyboard alone
  and by a screen reader, and is announced exactly once per composition.
- **SC-003**: On a device with no hover at desktop width, all three blocks are
  readable with zero interaction.
- **SC-004**: With `prefers-reduced-motion: reduce`, hovering a node still shows
  its card and no movement occurs.
- **SC-005**: At 390px a visitor can reach all three blocks by swiping **and** by
  the three dots, and with scripting disabled by scrolling the track — never
  losing a block.
- **SC-006**: Measured on the generated artefact at 1440 and 390: the section's
  backdrop computes below the dot sheet, the content above both, and the section
  declares no stacking-context property and no background colour.
- **SC-007**: Measured on the generated artefact: the six glow centres match the
  design's converted section-relative coordinates at both endpoints; the three arc
  diameters each pass within 1px of their radar's centre at 1440.
- **SC-008**: No horizontal overflow from 320px to 2560px.
- **SC-009**: `#proposito` scrolls to the section from the footer and from the
  mobile menu, in both locales, and the section's first content is not covered by
  the pinned nav.
- **SC-010**: Zero hex, `px` or arbitrary Tailwind values outside
  `app/assets/css/global.css`; zero copy literals in components.
- **SC-011**: `git diff --stat` shows zero changed lines in `SectionGlow.vue`,
  `SectionBackdrop.vue`, `DotGrid.vue`, `Radar.vue`, `GlassPanel.vue` and
  `Pill.vue`, and `app/shared/ui/SectionGlow.test.ts` passes unmodified.
- **SC-012**: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate` and
  `pnpm storybook:build` all pass, with no pre-existing test modified.

## Provenance

Per `rules.md` § R32: `CONFIRMED` = read from the `.pen` by the leader or from
this repository. `DERIVED` = arithmetic on confirmed values, shown. `UNVERIFIED` =
nobody documents it.

### CONFIRMED

Desktop frame `ayCiG` 1440×900, mobile `D2AvaO` 390×534. Cards 700 wide at x 660,
tops 150 / 422 / 653, heights 228 / 187 / 146, radius 22, padding 32, internal gap
14, copy 30px/500. Radars `md` (30/20/12) at 235,249 · 385,501 · 535,711. Labels
220×21, 17px/600, `#F0A3AE`. Lines 1px `#FBF8F63D`, 394 @266,264 · 244 @416,515.5 ·
94 @566,726. Arcs 2134 @−1167,−1187 · 1617 @−909,−929 · 1039 @−620,−640. `Glow
origen` 920 @−560,−580, red-400 12%, nested in the section. Section glows wine-400
20% `1000-560` (page centres 140,1480 / 80,1180) and wine-300 17% `820-480`
(1490,1630 / 480,1420). Mobile active card 274×316 copy 22px/600, neighbours
241×278 copy 18px/600 at 45%, indicator dots 8px / 6px. Hero's page span and the
leftover it leaves this section: 164 desktop / 90 mobile (`rules.md` § R49).
`#F0A3AE` **is** `red-200` and `#FBF8F63D` **is** `bone-100` at 24%.

### DERIVED (arithmetic shown in `data-model.md`)

- **The cards are flush with the content box's right edge.** 660 + 700 = 1360 =
  1440 − 80, and the section's box starts at the page margin, so card left =
  580 = 1280 − 700 of a 1280 content box. This is what makes the horizontal
  geometry expressible as percentages of the section's width.
- **The line lengths are one formula** — `cardLeft − (radarCentre + 15 + 1)`,
  giving 394 / 244 / 94 as the radar steps 150px right (FR-014).
- **The card stack is one column with gap 44** — 422 − 378 = 44 and 653 − 609 = 44.
- **Card heights are intrinsic** — 64 + n × 41 for n = 4/3/2 lines gives exactly
  228 / 187 / 146.
- **Radar and line are centred on their card** — radar centre y 264 / 516 / 726
  equals card centre y 264 / 515.5 / 726.
- **The label is centred on its radar** — label centre x 250 / 400 / 550 equals
  radar centre x 250 / 400 / 550.
- **The arcs and `Glow origen` share one origin and the arcs pass through the
  radars.** All four centre on (−100, −120) frame-relative; the distances from
  there to the three radar centres are 519.6 / 809.0 / 1066.9 against drawn radii
  of 519.5 / 808.5 / 1067.0.
- **The mobile neighbour is the active card at 0.88** — 241/274 = 0.8796 and
  278/316 = 0.8797.
- **The six section-relative glow anchors** — page centre minus the page margin
  horizontally, minus the section's page-y top (776 desktop / 550 mobile)
  vertically.
- **No `scroll-margin-top` is needed** — the section's top padding (164 / 90)
  exceeds the pinned nav's measured height (102.8 / 78.19, `findings.md` § R55).

### UNVERIFIED — one line each to close, all listed in § *Open values*

The two radar intensities · the arc stroke colour and width · the three label
strings · the desktop Pill's frame position · the mobile frame's internal offsets ·
the reveal duration.

## Open values

Every one is a token or a key seeded with a **derivation**, never an invention
(`rules.md` § R38). None blocks implementation.

| # | What is missing | Seeded with | Owner |
|---|---|---|---|
| O-01 | The radar's rest and hover intensities. The three radars in the frame are byte-identical, so the file holds one state and cannot say which | `--purpose-radar-rest-opacity: 0.73`, the mean of the card's own rest:hover ratios (31/43 = 0.721 fill, 89/120 = 0.742 stroke) — the only rest/hover pair the frame contains | Roberto / Clau |
| O-02 | The arcs' stroke colour and width | `bone-100` at 24% and 1px — identical to the connector lines, the same hairline family in the same composition | Clau |
| O-03 | The three label strings, ES and EN | ES `Por qué` / `Cómo` / `Qué`; EN `Why` / `How` / `What`, from `content.md`'s own block headings (`WHY · por qué existe muush`) | Roberto |
| O-04 | The 17th desktop child. 16 are enumerated; `design-extract.md` § 3 lists a `Propósito` Pill among the landing's 11 Pill instances, so it is almost certainly that — but its frame y is unread | Pill at frame y 0, which every other frame in the design does, giving an eyebrow gap of 314 − 164 − 40 = **110px** and closing the arithmetic exactly | leader, from the `.pen` |
| O-05 | The mobile frame's internal offsets: the carousel row's y, the indicator's gap, whether a Pill is present | eyebrow gap 40, indicator gap 24, dot gap 8 — flow values, since `rules.md` § R12 already refused to replicate a mobile frame's absolute y coordinates | leader, from the `.pen` |
| O-06 | The reveal timing. No frame can draw a transition (`rules.md` § R38, same case as the spotlight fade) | `--duration-purpose-reveal: 0.2s`, seeded to the site's existing fade so the page's motion stays coherent | Clau |

## Contradictions found in `docs/business/` — reported, not edited

`docs/business/` is human-authored and read-only to this agent (AGENTS.md § 3).

| Document | What it says | What wins |
|---|---|---|
| `ui-map.md` § 4 | Desktop Propósito is *"estático, sin interacción… Sin hover, sin click"* | Roberto's 2026-09-08 definition of the reveal |
| `ui-map.md` § 4 | *"Why ancha arriba al 17%, How y What abajo al 12%"* — a one-up/two-down layout, with the opacity read as hierarchy | The frame draws a three-row constellation and the 17%/47% is Why's hover state (Roberto, 2026-09-08) |
| `ui-map.md` § 4 | Mobile neighbours *"atenuadas al 50%"* | The frame's **45%** (§ R32) |
| `ui-map.md` § 4 | *"Loop activo (Why hacia atrás llega a What)"* | Kept for the indicator and keyboard, **not** for the swipe — see assumption A-07 |
| `design-extract.md` § 10 | `Glow origen` is a page-background glow, and Landing has 12 | It is nested in this section; Landing's background has 11 (already recorded in `rules.md` § R29 / `SectionGlow.vue`) |
| `content.md` | The `What` block's copy is the same sentence as the Hero's subhead | Both are approved copy in `content.md`; this feature ships it as written and reports the duplication |

## Assumptions

- **A-01** The constellation's horizontal geometry is expressed as percentages of
  the section's content width, derived from the single 1440 frame. Only that
  endpoint is design; the behaviour at every other width is a smoothing decision,
  stated in the token comments (`rules.md` § R48 § 4).
- **A-02** Exact arc-to-radar tangency is a property of the 1440 frame. Card
  heights are copy-driven and the arcs scale with width, so no width other than
  1440 can preserve it; the arcs are 1px hairlines at 24% and the drift is not
  legible.
- **A-03** The constellation renders at `lg` (1024px) and above — the repository's
  existing, still-UNVERIFIED breakpoint assumption (`decisions-open.md`).
- **A-04** The label text is centred over its radar, since the frame centres the
  220px label box on the radar to the pixel and the alignment inside that box is
  not recorded. Long labels do not wrap (`white-space: nowrap`), so the 220 never
  becomes a constraint.
- **A-05** No `scroll-margin-top` on the section — derived above.
- **A-06** A revealed card never intercepts the pointer. This keeps the reveal
  stable while the pointer travels and costs mouse text selection at desktop
  width only; the same copy is permanently selectable below 1024px and on any
  coarse-pointer device.
- **A-07** The carousel loop is implemented for the indicator and keyboard
  (wrap-around index) but not for the swipe, which uses native scroll bounds. A
  seamless swipe loop needs cloned nodes or scroll teleporting, both of which
  fight the native snap track that **is** the no-JS fallback (FR-020, FR-023).
  Reversible; Roberto may overrule.
- **A-08** The section carries no accessible name, matching the Hero's precedent
  (feature 9 A-08). The `id` is a scroll target, not a landmark.
- **A-09** The arcs paint above the dotted paper and below the content, in the
  content layer. They are composition, not background: the design nests them in
  the section frame beside the cards, not in the page background group.
- **A-10** The mobile card's copy keeps `--text-lead`'s desktop letter-spacing
  (−0.02em against the frame's −0.03em at 22px = 0.22px) but **does** take the
  frame's 600 weight below `lg`. `rules.md` § R4 named this the one documented
  exception to the fluid scale and left it to whoever built `PurposeCard`.

## Notes for feature 14 (Servicios)

Measured the same way `rules.md` § R49 measured this section's inheritance:
Propósito's content ends at page y **1739** desktop (776 + 164 + 40 + 110 + 649)
against a frame bottom of 1840, so the leftover Servicios inherits is **101px**
desktop. The mobile leftover cannot be computed until O-05 is answered.

## Process notes

- **No git branch was created.** The repository has no `.specify/extensions.yml`,
  so spec-kit's `before_specify` branch hook does not exist and the skill's own
  flow creates only the directory and the spec file. The leader additionally
  prohibited any git command for this run.
- **`.specify/feature.json` was not updated.** It still points at
  `specs/012-english-url-segments`, a directory deleted when feature 12 was
  cancelled. Writing outside `specs/013-purpose-section/` was out of scope for
  this run; the leader should repoint it, or the next `/speckit-*` invocation must
  be given the directory explicitly.
