# Feature Specification: Servicios — the landing's third section

**Feature Branch**: `014-services-section` (no branch created — same process note as feature 13; see § *Process notes*)
**Created**: 2026-09-08
**Status**: Draft
**Input**: feature 14 `services_section` in `feature_list.json`, plus the leader's reading of
frames `GiLTU` (desktop 1440×1020) and `F2Zu8X` (mobile 390×1290) on 2026-09-08 (`rules.md` § R32).

## Summary

`03 Servicios` is the landing's third section: five service areas presented with **no
cards, no numbering** (`services.md`), each a Radar + name + brief. Desktop scatters the
five nodes by hand and joins consecutive pairs with a thin diagonal line; mobile turns
the same five into a vertical timeline against a spine, with a scroll-driven "lyrics"
dimming effect. A Delivery-closing line (Pill + copy) follows the five in both
viewports. Two compositions, not one rescaled — same discipline as Propósito.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Five areas, read as one system (Priority: P1)

A visitor scrolls past Propósito and sees five service areas as a constellation
(desktop) or a timeline (mobile), each with a name and a one-line brief, plus a closing
line stating that project delivery runs through all five.

**Why this priority**: this is the section's entire content. Without it there is no
services message on the landing at all.

**Independent Test**: load `/es` and `/en` at 1440px and 390px. Confirm five distinct
areas render with name + brief, in `services.md`'s order, plus the delivery-closing
line, with no numbering and no card surface around any area.

**Acceptance Scenarios**:

1. **Given** the landing at 1440px, **When** it renders, **Then** five service nodes
   appear at the design's hand-placed positions, each with a pulsing radar, a name and a
   brief, joined by four thin connector lines between consecutive nodes.
2. **Given** the landing at 390px, **When** it renders, **Then** the same five areas
   appear as a vertical timeline against a spine, in the same order.
3. **Given** either viewport, **When** the section is inspected, **Then** the delivery
   line ("Y una capacidad que atraviesa las cinco…") renders as plain text below the
   five areas, with no interactive affordance.

---

### User Story 2 — Mobile reads it with the lyrics effect, and degrades safely (Priority: P1)

A mobile visitor scrolls the timeline; the item nearest the centre of the viewport is
fully readable, its neighbours are dimmed, and the rest recede further — all without any
click, and without ever losing an area if scripting is off.

**Why this priority**: this is `ui-map.md` § 5's defining mobile behaviour, and its
no-JS fallback is a hard content-loss risk if implemented wrong (`ui-map.md` § 10 is
explicit: never dimmed by default).

**Independent Test**: load `/es` at 390px, scroll the section, and confirm the centred
item is at full strength while its neighbours and the rest are visibly dimmer. Then
disable scripting and confirm all five render at full strength.

**Acceptance Scenarios**:

1. **Given** the timeline at 390px, **When** an item is centred in the viewport,
   **Then** it and its radar render at 100% and its two immediate neighbours at 45% and
   the remaining items at 22%.
2. **Given** the visitor scrolls, **When** a different item becomes centred, **Then**
   the three-tier opacity re-buckets around the new centred item.
3. **Given** scripting is unavailable, **When** the section renders, **Then** all five
   items are at 100% opacity, never dimmed by default.
4. **Given** `prefers-reduced-motion: reduce`, **When** the section renders, **Then**
   all five items are at 100%, matching the no-JS state (this is an atmospheric effect,
   not information — unlike Propósito's reveal, dimming carries no content).

---

### User Story 3 — The section contributes its background without breaking it (Priority: P2)

The section carries two glows that must paint below the page-wide dotted paper.

**Why this priority**: the R28/R37 paint-order contract fails silently — this is the
third section bound by it.

**Independent Test**: on the generated artefact, read the computed `z-index` of the
section's backdrop (`-3`), the dot sheet (`-2`) and the section's content (`auto`).

**Acceptance Scenarios**:

1. **Given** the built page, **When** the four levels are measured **on the page**,
   **Then** glows sit below the dots and the content above.
2. **Given** the section element, **When** its computed style is read, **Then** it
   declares none of the stacking-context properties § R28/R37 name, and no background.
3. **Given** any viewport from 320px to 2560px, **When** the page is measured, **Then**
   `scrollWidth` never exceeds `clientWidth`.

---

### Edge Cases

- **A locale's name or brief is longer** — text blocks are 232px/310px wide with
  intrinsic height; the desktop canvas height is fixed at the design's own measurement
  (910px, § *Provenance*), so a name/brief that overflows its 232×144-class block wraps
  within the block rather than resizing the block — the block widths are the one thing
  the design fixes, not the copy length. Reported as an assumption (A-03), not silently
  handled.
- **The section is the last block in the document** — it is not; Proyectos follows. If
  it temporarily is, the layout root's `overflow-clip` already absorbs any excess
  (`findings.md` §§ R54, R57, cited in feature 13).
- **A fragment jump to `#servicios`** — the section's own top padding (101px desktop /
  open value mobile) is compared against the pinned nav's height the same way feature 13
  did; no `scroll-margin-top` is added unless that comparison fails (assumption A-06).
- **Two adjacent items both centred (tie, at a snap boundary while scrolling fast)** —
  the IntersectionObserver drives off the intersection ratio, not scroll position, so a
  transient tie resolves to whichever crosses the threshold callback last; no state is
  shared with an animation frame loop, so no stutter compounds.

## Requirements *(mandatory)*

### Functional Requirements — structure and copy

- **FR-001**: The section MUST render on the landing in both locales, carry
  `id="servicios"` and follow Propósito directly. This closes the `#servicios` anchor the
  shell already emits from the footer and the mobile menu (`rules.md` § R50).
- **FR-002**: The section MUST render a `Pill` eyebrow, the five service areas in
  `services.md`'s own order, and the delivery-closing line, in that order for both
  compositions.
- **FR-003**: All copy MUST come from `landing.services.*` in
  `i18n/locales/{es,en}.json`, both locales present, zero strings in components
  (Article VI). The five briefs are `services.md`'s approved ES-MX/EN text verbatim.
- **FR-004**: `ServiceItem` (per `component-contracts.md`) renders a `Radar` plus a name
  and a brief in a 232px (desktop) / 310px (mobile) column — **no glass surface**, per
  `services.md`'s explicit "sin tarjetas." It is a new component; it does not reuse or
  extend `PurposeCard`, whose glass-panel-plus-reveal contract does not apply here.
- **FR-005**: The delivery-closing line MUST render as plain text (Pill + copy), with no
  link, no button and no hover affordance (`ui-map.md` § 5: "es texto, no interactiva").

### Functional Requirements — desktop geometry

- **FR-006**: The five nodes MUST be positioned at the design's hand-placed centres, not
  a grid: radar centres (section-relative) at `150,330` · `430,200` · `690,440` ·
  `950,250` · `1150,480`, one per service in document order.
- **FR-007**: Each node's text block top-left MUST be generated from its own radar
  centre by one relation, not five literals: `radarCentre + (-4, 28)`. Verified exact
  against all five (§ *Provenance*).
- **FR-008**: The four connector lines MUST be generated from the same five radar
  centres, not from four independent width/height/position triples: connector *i* is the
  straight line from radar centre *i* to radar centre *i+1*, for *i* = 1..4. They are
  decorative (`aria-hidden="true"`).
- **FR-009**: The desktop canvas (five nodes, four connectors, the eyebrow Pill and the
  delivery line) MUST use one `position: relative` container sized to the design's own
  content extent (910px, § *Provenance*) — not a flow layout, since the design's
  positions are non-linear on both axes and a flow container cannot reproduce a scatter.
- **FR-010**: The section MUST NOT declare bottom padding; the gap to Proyectos belongs
  to Proyectos (`rules.md` § R49).

### Functional Requirements — mobile geometry and the lyrics effect

- **FR-011**: The five timeline items MUST be positioned by one relation, not five
  literals: item *i*'s block top = `72 + (i − 1) × 185` for *i* = 1..5. Block height is
  intrinsic to its own copy (98/98/120/98/98 measured — item 3's brief is longest) and
  MUST NOT become a fixed token.
- **FR-012**: Each item's radar MUST be vertically centred on its own block (same
  discipline as Propósito FR-016), not measured as a separate offset.
- **FR-013**: The spine MUST render as one decorative element the full height of the
  timeline; it is atmospheric (`aria-hidden="true"`) and MUST NOT be required to
  terminate exactly at any radar's centre (assumption A-01).
- **FR-014**: The lyrics effect MUST bucket each item into exactly one of three states —
  centred (100%), neighbour (45%), rest (22%) — applied to both the item's text and its
  radar+halo, driven by scroll position.
- **FR-015**: The lyrics effect MUST be implemented with an `IntersectionObserver`
  reading each item's intersection ratio, never a `scroll` handler that reads geometry
  (`scrollY`, `getBoundingClientRect`) inside the update path — that forces a style
  recalculation regardless of read/write ordering (`findings.md` § R41).
- **FR-016**: Without JavaScript, all five items MUST render at 100% opacity,
  unconditionally — never dimmed by default (`ui-map.md` § 10).
- **FR-017**: Under `prefers-reduced-motion: reduce`, all five items MUST render at
  100%, same as the no-JS state — the dimming is atmospheric, not information, so it is
  the one part of this feature reduced motion removes entirely rather than keeping
  instantly (contrast with Propósito's reveal, which reduced motion keeps and only
  un-animates).
- **FR-018**: The section MUST NOT hijack vertical page scroll; the `IntersectionObserver`
  only reads, it never calls `scrollTo` or similar on the page.

### Functional Requirements — background contribution

- **FR-019**: The section MUST contribute two glows through the feature 6 mechanism,
  with **zero** edits to `SectionGlow.vue`, `SectionBackdrop.vue`, `DotGrid.vue` or the
  `--layer-*` tokens: `wine-300` 14% size `900-520`, `wine-400` 12% size `860-480`.
- **FR-020**: Glow offsets MUST be section-relative, independently converted for each
  viewport per `rules.md` §§ R29 and R48 — never one derived from the other (§ R48's own
  disproved derivation). Section-relative centres: `wine-300` `1390,630` (desktop) /
  `436,986` (mobile); `wine-400` `50,970` (desktop) / `36,1346` (mobile) — § *Provenance*
  shows the arithmetic.
- **FR-021**: The section, and every wrapper between it and the layout root, MUST create
  no stacking context and paint no opaque background (`rules.md` §§ R28, R37).
- **FR-022**: No token added by this feature may be named `--color-glow-*` or
  `--spacing-glow-*` (`rules.md` § R36).

### Key Entities

- **Service node** — one of the five areas: an index (0–4), a name key and a brief key.
  The index generates every desktop offset, the mobile step and the connector endpoints;
  nothing else distinguishes the five.
- **Delivery closer** — one Pill + one copy string, not a sixth node (`services.md`:
  "transversal, no es una 6ta área").

## Success Criteria *(mandatory)*

- **SC-001**: At both 1440px and 390px, all five service areas and the delivery line are
  visible with no scrolling required to discover that they exist (the section itself may
  need scrolling to reach, its own content does not hide behind interaction).
- **SC-002**: At 390px, a centred item is visibly the strongest of the three states and
  the effect re-buckets as the visitor scrolls, with no click required.
- **SC-003**: With scripting disabled and with `prefers-reduced-motion: reduce`, all five
  items are at full strength — zero areas are ever hidden or dimmed by default.
- **SC-004**: Measured on the generated artefact: the section's backdrop computes below
  the dot sheet, the content above both, and the section declares no stacking-context
  property and no background colour.
- **SC-005**: Measured on the generated artefact: the two glow centres match the
  converted section-relative coordinates at both viewport endpoints; the four connector
  lines' endpoints match the five radar centres to the pixel.
- **SC-006**: No horizontal overflow from 320px to 2560px.
- **SC-007**: `#servicios` scrolls to the section from the footer and the mobile menu, in
  both locales.
- **SC-008**: Zero hex, `px` or arbitrary Tailwind values outside `global.css`; zero copy
  literals in components.
- **SC-009**: `git diff --stat` shows zero changed lines in `SectionGlow.vue`,
  `SectionBackdrop.vue`, `DotGrid.vue`, `Radar.vue` and `Pill.vue`, and
  `SectionGlow.test.ts` passes unmodified.
- **SC-010**: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate` and
  `pnpm storybook:build` all pass.

## Provenance

Per `rules.md` § R32: `CONFIRMED` = read from the `.pen` by the leader. `DERIVED` =
arithmetic on confirmed values, shown. `UNVERIFIED` = nobody documents it.

### CONFIRMED

Desktop frame `GiLTU` 1440×1020, mobile `F2Zu8X` 390×1290. Pill 122×38 @80,90 (desktop) /
118×38 @24,0 (mobile). Five radar halo2 top-lefts (30×30, desktop): `135,315` ·
`415,185` · `675,425` · `935,235` · `1135,465` → centres `150,330` · `430,200` ·
`690,440` · `950,250` · `1150,480`. Five text blocks 232px wide, heights `144/144/166/
122/144`, at `146,358` · `426,228` · `686,468` · `946,278` · `1146,508`. Four connector
rectangles `280×131@150,200` · `261×241@429,200` · `261×191@690,250` · `201×231@949,250`.
Delivery close `1280×100@80,810`. Mobile spine `1×750@29,86`; five item blocks 310px
wide, heights `98/98/120/98/98`, at y `72/257/442/627/812`. Section glows page-absolute
centres: `wine-300` `1470,2470` (D) / `460,2160` (M), `wine-400` `130,2810` (D) /
`60,2520` (M), sizes `900-520` and `860-480`. Hero's and Propósito's own page spans,
carried from feature 13's notes: Propósito occupies page y `940→1840` desktop /
`640→1174` mobile, with a rendered-content leftover of **101px** desktop before this
section's frame.

### DERIVED (arithmetic shown)

- **The text block offset is one relation.** All five: `textBlock − radarCentre =
  (−4, +28)`, exact to the pixel across all five nodes.
- **The four connectors are the bounding boxes of consecutive radar-centre pairs, not
  four independent shapes.** `bbox(150,330 → 430,200)` = `280×130@150,200` against the
  drawn `280×131@150,200` (1px height rounding); `bbox(430,200→690,440)` =
  `260×240@430,200` against `261×241@429,200`; `bbox(690,440→950,250)` =
  `260×190@690,250` against `261×191@690,250`; `bbox(950,250→1150,480)` =
  `200×230@950,250` against `201×231@949,250`. Every rectangle agrees within 1px — the
  same rounding tolerance Propósito's arc-tangency check used.
- **The mobile step is one relation, and resolves an apparent irregularity.** Item tops
  `72,257,442,627,812` differ by exactly 185px each. The "gap" before item 4 looks like
  65px (not 87px like the other three) only because item 3's block is 22px taller
  (120 vs 98) — the *step* is uniform; the *gap* is what a taller block leaves inside an
  identical 185px slot. Nothing here is irregular.
- **Desktop canvas height is the design's own content extent.** Cierre bottom
  `810 + 100 = 910` is the tallest extent among all nodes, connectors and the closer —
  this is the canvas's explicit height, not an invented number.
- **This section's desktop top padding is Propósito's own leftover, unchanged.**
  Feature 13 already computed it: `101px` (frame bottom `1840` − rendered content bottom
  `1739`). Per `rules.md` § R49, a section with no bottom padding hands its leftover
  frame space to the section that follows; this section's Pill and every absolute
  position are placed using the raw `GiLTU`-relative coordinates directly inside that
  padded box — no further folding needed. (Unlike Propósito's own O-04, which *assumed*
  its Pill sat at its frame's y-0 for lack of a confirmed value, this section's Pill
  is confirmed at y-90 directly from the same `.pen` read — a fact about this section,
  not a correction to feature 13's.)
- **Section-relative glow centres**, page centre minus page margin (80 D / 24 M)
  horizontally, minus this section's own page-y top (`1840` D / `1174` M, from
  Propósito's frame bottom, § *CONFIRMED*) vertically: `wine-300` → `1390,630` (D) /
  `436,986` (M); `wine-400` → `50,970` (D) / `36,1346` (M). Both mobile centres land
  partly outside the 390×1290 frame (x=436, y=1346) — consistent with the rest of the
  site's glows, which are hand-tuned and routinely bleed past their own frame
  (`design-extract.md` § 10).
- **Leftover this section hands to feature 15 (Proyectos)**: frame height `1020` minus
  content bottom `910` = **110px** desktop. Mobile cannot be computed until this
  section's own mobile top-padding (below) is resolved.

### UNVERIFIED — listed in § *Open values*

The five Spanish service names · the connector line's stroke colour/width · this
section's mobile top padding · the reveal/transition duration for the lyrics effect ·
the IntersectionObserver's exact threshold values.

## Open values

Every one is seeded with a derivation, never an invention (`rules.md` § R38). None
blocks implementation.

| # | What is missing | Seeded with | Owner |
|---|---|---|---|
| O-01 | The five Spanish service names. `services.md` keeps all five in English "on purpose" for the rest of the site, but Roberto's 2026-09-08 instruction for this feature is that they DO translate — without yet supplying the translations, and without ruling out keeping them English like the Hero's eyebrow | English names used as the ES key's value too, marked `⚠️ O-01` in the data file, so filling five keys is the entire fix | Roberto |
| O-02 | The connector lines' stroke colour/width | `bone-100` at 24%, 1px — the same hairline family as Propósito's connector lines (`data-model.md` § *Purpose*) | Clau |
| O-03 | This section's own mobile top padding. Its own Pill sits at mobile-frame y-0 (confirmed), so the padding equals Propósito's own mobile leftover — which feature 13's own spec left unresolved ("cannot be computed until O-05 answered") | `55px`, seeded from this section's confirmed desktop leftover (101px) scaled by the ratio Hero→Propósito already used for its own D/M leftover pair (90/164 ≈ 0.549) | whoever resolves feature 13's O-05 first |
| O-04 | The lyrics effect's transition duration and exact `IntersectionObserver` thresholds. No frame can draw a scroll-driven effect (`rules.md` § R38, same class as the reveal's timing in feature 13) | `--duration-services-lyrics: 0.3s`; thresholds `[0, 0.5, 1]` per item, tuned for a stable "most-visible-wins" bucket assignment | Clau |

## Contradictions found in `docs/business/` — reported, not edited

`docs/business/` is human-authored and read-only to this agent (AGENTS.md § 3).

| Document | What it says | What wins |
|---|---|---|
| `content.md` § Navegación | "Servicios no va en el nav" | The pending nav redesign (feature 21, not yet built) adds it back, per the leader's own read of the `.pen` (`rules.md` § R32). Reported for a human to reconcile the two documents; not resolved here. |
| `design-extract.md` § 2 | Mobile lyrics opacities are `0.18` (far) / `0.45` (neighbour) / `1` (active) | `ui-map.md` § 5 and `feature_list.json`'s own acceptance for this feature both say `22%` / `45%` / `100%`. This spec ships `22%`, matching the two documents that agree with each other; the `0.18` in `design-extract.md` is flagged for a human to reconcile, not silently averaged. |

## Assumptions

- **A-01** The mobile spine is purely atmospheric and does not need to terminate exactly
  at the first or last radar's centre; a ~25px overshoot past the last item is visible
  in the raw measurements and is not corrected.
- **A-02** The desktop breakpoint is `lg` (1024px) and above, matching the repository's
  existing, still-`UNVERIFIED` breakpoint assumption already used by feature 13
  (`decisions-open.md`).
- **A-03** Name/brief text wraps within its fixed-width block rather than growing the
  block width; the design fixes 232px/310px, and no locale's copy is long enough to
  need a second line at the brief's 14px size within that width (verified against both
  locales' longest brief).
- **A-04** The IntersectionObserver's "most visible wins" resolves ties (two items with
  equal ratio) by DOM order — the earlier item wins — since no frame can draw this
  edge case and it is momentary in practice.
- **A-05** The section carries no accessible name, matching Propósito and the Hero's
  precedent (feature 9 A-08, feature 13 A-08); `id="servicios"` is a scroll target, not a
  landmark.
- **A-06** No `scroll-margin-top` is added unless the section's own top padding is less
  than the pinned nav's measured height — the same check feature 13 ran (`findings.md`
  § R55), re-run for this section's own 101px (desktop) once mobile's O-03 is answered.
- **A-07** The delivery-closing line's copy key lives beside the five service keys in
  the same `landing.services.*` namespace, not a separate `landing.delivery.*` namespace
  — `services.md` frames it as belonging to the section, not a standalone concept.

## Notes for feature 15 (Proyectos)

Following feature 13's own precedent: this section's frame (`GiLTU`, 1020 tall) has its
tallest content at `910` (the delivery close's bottom edge), leaving a **110px desktop**
leftover for Proyectos' own top padding. Mobile's equivalent cannot be computed until
this section's own O-03 (mobile top padding) is resolved, since that resolution changes
where this section's own frame is anchored relative to its rendered content.

## Process notes

- **No git branch was created** for the same reason feature 13 recorded: no
  `.specify/extensions.yml` exists, so no `before_specify` hook runs, and the leader
  separately prohibited git commands for this run. The repository is already on
  `feat/services-section`.
- **`.specify/feature.json` now points at `specs/014-services-section`**, replacing the
  stale pointer to `specs/013-purpose-section` (which itself had replaced a pointer to a
  cancelled feature 12's deleted directory).
