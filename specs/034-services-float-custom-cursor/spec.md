# Feature Specification: Services nodes float in zero gravity, and the site's own cursor

**Feature Branch**: `034-services-float-custom-cursor` (spec folder; the git branch is `feat/services-float-custom-cursor`)
**Created**: 2026-10-14
**Status**: Draft, awaiting the human gate · amended A1 and A2 (2026-10-14) · A2 revision 1 (2026-10-15)
**Input**: Feature 34 `services_float_and_custom_cursor` in `feature_list.json`
(requested by Roberto on 2026-10-14), plus Roberto's decisions of 2026-10-14
relayed by the leader (recorded below as approved). The feature's
`description` and `acceptance` array are the requirements; this document
restates them as testable behaviour. It adds scope only where Roberto's
decisions do (the mobile float trial) or where an existing defect blocks an
acceptance criterion (OA-3, marked as such).

Two independent parts, shipped together because Roberto asked for them
together:

- **Part A**: the five Services nodes (radar, name, brief) drift slowly up
  and down, out of step with each other. On desktop the four connector lines
  stretch and tilt with them and never come loose from the radars. On mobile
  and tablet the same float runs on the vertical timeline, as a **reversible
  trial** Roberto will review locally.
- **Part B**: the whole site uses Roberto's brand cursor (the red arrow with
  the "You" pill) in place of the operating system's arrow and hand.

Both apply identically to `/es` and `/en` (and to `/es/nosotros`, `/en/about`
for Part B). No copy is added or changed, so no locale key changes.

- **Part C** (amendment A2, 2026-10-14): the cursor spotlight loses its red
  glow; only the dots within about 120 px of the pointer turn red
  (`--red-400`), fading with distance back to the normal dot. All four
  routes, both locales. *(A2 revision 1, 2026-10-15: the footer keeps its own
  flat `bg-ink-500` surface exactly as before A2, so neither the dots nor the
  red lit dots show over it. The original A2 text, "The footer stops painting
  its own surface, so the dotted paper and the red dots continue under it",
  is superseded.)*

---

## Decisions approved by Roberto (2026-10-14)

Relayed by the leader on 2026-10-14. These are decisions, not proposals.
Roberto's design team confirmed both changes; the `.pen` does not define the
animation or the cursor (Pencil cannot design animation). **This list is the
visual source of truth for the motion, and the delivered SVG is the source
of truth for the cursor.** No `.pen` check is needed for either.

| # | Decision |
|---|---|
| D-1 | Text inputs and textareas keep the native text cursor (I-beam). The brand cursor applies everywhere else, including the pointer state on links and buttons. |
| D-2 | The cursor label is always "You", in ES and EN. No localized variant. |
| D-3 | The float **also applies to mobile and tablet** (the vertical `ServicesTimeline`), as a **reversible trial**: Roberto checks it locally with `pnpm dev` and may ask to revert it. It must be removable cleanly and in isolation (its own tasks, its own commit, one self-contained CSS block). |
| D-4 | Motion: about 6 to 8 px vertical amplitude, 5 to 7 s period per node, desynchronized phases, sine easing. |
| D-5 | `prefers-reduced-motion: reduce` → no float, fully static. |
| D-6 | The `.pen` defines neither the animation nor the cursor; no `.pen` check for them. |

---

## Open for approval (resolve at the gate)

None of these is a `[NEEDS CLARIFICATION]` blocker: each carries a
recommendation the plan is built on, so the gate is a yes/no per row.
Trade-offs are in [research.md](./research.md).

| # | Item | Recommendation the plan is built on | Owner |
|---|---|---|---|
| OA-1 | **Mechanism that keeps the line ends glued to the moving radars.** Compared in research R1: (A) per-node CSS keyframes plus lines split per endpoint or animated as paths; (B) SMIL `<animate>` on the line attributes; (C) one shared CSS clock: a registered angle property animated once on the canvas, every node and every line end computing its offset from it with `sin()`; (D) a small `requestAnimationFrame` loop in `logic/` writing custom properties | **(C) shared CSS clock.** One clock on one thread, so a node and the line ends attached to it cannot be out of step in any frame; no script, no client state, no new dependency; reduced-motion and no-JS are CSS; degrades to the static layout where unsupported. (D) is the fallback if the manual browser checks reject (C) | Roberto |
| OA-2 | **Exact motion values inside the approved ranges (D-4).** One shared period for all five nodes, or a different period per node | Amplitude **7 px**; **one shared 6 s period**; phases on the golden angle (0°, 137.5°, 275°, 52.5°, 190°) so neighbours never peak together and no left-to-right wave appears. A per-node period (for example 5.2 / 6.4 / 5.8 / 6.9 / 5.5 s) makes the pattern never repeat, at the cost of five clocks instead of one (research R2); the plan can switch to it without changing the mechanism. Both read as "5 to 7 s per node" | Roberto |
| OA-3 | **Existing defect, in scope because it blocks acceptance 3.** At desktop widths below 1440 px the connector layer is rescaled to the canvas width while the radars keep fixed positions, so today the lines already miss the radars (about 20 px at 1280 px; INFERRED from the source, Provenance P-08). "Endpoints coincide at all times" cannot pass at 1024 to 1439 px unless the line layer stops rescaling | Fix it in this feature: the line layer uses the same fixed frame as the nodes at every desktop width and root font size. Leader to confirm the defect in a browser at 1280 px before implementation | Leader (confirm), Roberto (scope) |
| OA-4 | **Cursor hotspot.** The arrow's geometric tip vertex is at (1, 5) of the 32×32 asset; its 1-unit miter stroke draws the tip at about (0.1, 4.1) (DERIVED, research R6) | Hotspot **(1, 5)**, the geometric vertex the leader measured. The 1.4 px difference is below pointing precision; switch to (0, 4) if Roberto prefers the drawn tip pixel. *Superseded by amendment A1 (2026-10-14): hotspot (1, 9) at 64×64* | Roberto |
| OA-5 | **What counts as "text field"** for D-1 | I-beam on text-entry inputs (text, email, url, tel, search, number, password, and inputs with no type), `textarea`, and editable content. Everything else, including plain body text, selects, radio pills, the file picker and disabled controls, shows the brand cursor | Roberto |
| OA-6 | **Raster fallback (PNG @1x/@2x).** SVG cursor support and sharpness on high-density screens could not be confirmed from official documentation in this session (research R5, UNVERIFIED) | **Ship SVG only**, with native keyword fallbacks, and run the manual browser matrix. If any target browser shows the cursor blurry or not at all, Roberto exports 32×32 and 64×64 PNGs (64×64 and 128×128 after amendment A1) from his design source and a follow-up adds them through `image-set()`. No agent rasterizes the brand asset | Roberto |
| OA-7 | **White in the "You" glyphs.** The asset paints the letters pure white; `branding.md` says on Red 400 everything goes in Bone 100 (`#FBF8F6`) | Keep the asset exactly as delivered, removing only the background rectangle (the brief says "keep everything else"). Bone 100 is a one-attribute edit if Roberto wants token parity | Roberto |
| OA-8 | **Contrast and accessibility of the cursor.** Red arrow on the Ink 500 background ≈ 3.0:1 (DERIVED, research R7), the minimum for non-text graphics. Over Red 400 surfaces (red third of the final CTA gradient) it is red on red. A custom image may also override an OS enlarged-pointer setting (UNVERIFIED) | Ship as is; check contrast manually over the red CTA gradient; with forced colours (Windows High Contrast) active, use native cursors. If the red-on-red check fails, Roberto or Clau decide on an outline (an asset change, not code) | Roberto / Clau |

### Amendment A1 · cursor size (Roberto, 2026-10-14)

After trying the build locally Roberto asked for a bigger cursor ("está muy
chico, hazlo un poco más grande"). Supersedes the 32×32 render size and the
(1, 5) hotspot of OA-4; everything else in Part B is unchanged.

- **Size**: the cursor renders at **64×64 CSS px** (2×), sized from a
  reference screenshot Roberto sent (@2x): the "You" pill measures ≈48×31 CSS
  px and the arrow ≈20 px, i.e. exactly 2× the 32 viewBox (pill 23.5×14.76
  units → 47×29.5 px; leader's measurement). Earlier rounds the same day set
  48×48 and 64×64. Only the root `<svg>` `width`/`height` attributes change
  (32 → 64); `viewBox="0 0 32 32"`
  and every path and colour stay byte-identical, so the vector scales with no
  rasterizing. 64 is under the 128 px browser limit in CSS px; at 2× DPR it
  is exactly 128 device px and at 3× 192 (UNVERIFIED risks, research A1).
- **Hotspot**: **(1, 9)** in the 64×64 space. The vertex (1, 5) scales to
  (2, 10) and the drawn miter tip ≈(0.1, 4.1) to ≈(0.2, 8.2). (1, 9) lies on
  the tip's bisector between the two, inside the painted miter: 1.1 px from
  the drawn tip, 1.4 px from the vertex. (2, 10) is the vertex itself but
  2.5 px behind the visible tip; (0, 8) is 0.3 px from the drawn tip but on
  the anti-aliased outer edge of the stroke. Same rule as earlier rounds: the
  click point is on the visible tip, between the two.
- **PNG fallback (OA-6)**, if ever needed, would be 64×64 and 128×128.
- **Caveats** of cursors larger than 32 px are in research A1 (UNVERIFIED
  items go into the manual matrix).

### Amendment A2 · red lit dots, no glow, footer on the paper (Roberto, 2026-10-14)

Relayed by the leader on 2026-10-14 and **APPROVED by Roberto on
2026-10-14**. These are decisions, not proposals. They add Part C to this
feature: two existing components outside the `landing` feature change,
`app/shared/ui/CursorSpotlight.vue` (feature 008) and
`app/features/shell/ui/SiteFooter.vue` (feature 003). Parts A and B are
unchanged.

Visual reference: a screenshot from Roberto where only the dots near the
mouse change tone, fading with distance, with no glow. The spec author has
not seen it; this is the leader's description of it. Roberto also reported,
with a screenshot, that the effect disappears over the footer.

| # | Decision (APPROVED, Roberto, 2026-10-14) |
|---|---|
| A2-1 | **No glow.** The cursor-following red light is removed entirely: the two radial gradients painted on `.cursor-spotlight__beam`. Tokens that only the glow used are deleted with it: `--spotlight-red-400-42`, `--spotlight-red-400-17`, `--spotlight-red-400-37`, `--spotlight-stop-mid`, `--spotlight-core-size` (research A2.1). |
| A2-2 | **The dots near the pointer turn red**, not lighter: colour `--red-400` (`#CF3147`, existing brand token), fading with distance back to the normal dot. **No new red hue and no new colour token**: only existing red tokens, with opacity or mask falloff. `--dot-paper-lit-color` changes from the base recipe painted twice (22.6%) to `--red-400`. |
| A2-3 | **Radius about 120 CSS px** around the pointer (was tied to the glow's size), held in a token; the mask falloff stays so there is no hard edge. |
| A2-4 | **SUPERSEDED by A2 revision 1 (Roberto, 2026-10-15), see below; kept as history.** **Footer, option A.** `SiteFooter.vue` stops painting its own opaque `bg-ink-500` surface, so the dotted paper and the red lit dots continue under the footer as one surface. The forms' cards keep covering the effect as today; that is correct behaviour. |
| A2-5 | **Everything else about the spotlight stays**: only with a fine, hovering pointer; never with reduced motion (nor in print); mounted only after the first mouse event, so it is absent from the prerendered HTML; the lit dots stay registered on `DotGrid`'s grid at every pointer position, scroll offset and root font size; same fade, same layer (`--layer-spotlight`), `overflow: clip`, no blend mode. |

#### A2 revision 1 · the footer keeps its flat surface (Roberto, 2026-10-15)

Relayed by the leader on 2026-10-15. Roberto saw A2 running locally and
reversed one decision: "me quitaste el fondo del footer flat, eso quiero que
esté". This is a decision, not a proposal.

| # | Decision (APPROVED, Roberto, 2026-10-15) |
|---|---|
| A2-4 rev 1 | **The footer keeps its own flat, opaque `bg-ink-500` surface, exactly as before A2.** No dotted paper inside the footer. Replaces A2-4 option A. |
| A2-4 rev 1 · consequence | **The red lit dots do not show over the footer either.** The spotlight paints on `--layer-spotlight`, below all content, so the footer's surface covers it, as it did before A2. Approved as the leader's reading of Roberto's request (leader, 2026-10-15). |
| unchanged | A2-1 (no glow), A2-2 / A2-S1 (red-400 lit dots), A2-3 / A2-S2 (`--spotlight-lit-radius: 7.5rem`), A2-5 (activation, registration, layer), and the form cards staying opaque all stand. |

**The original footer bug is moot.** Roberto's report was that the red glow
disappeared over the footer. A2-1 removes the glow everywhere, so there is
no glow left for the footer to hide. What the footer now hides is the dotted
paper and the red lit dots, which is the look Roberto asked for.

**What this revision supersedes in this document** (kept below as history,
each marked): A2-4 option A; the footer half of A2-S1's ink-300 weak spot;
the *Footer dependencies checked* paragraph; OA-9; items 1, 2 and 6 of the
`docs/business/` list; US5 scenario 3 and its title; FR-026; the footer part
of FR-028; the *Footer surface* key entity; SC-010's footer half; the A2 edge
cases about the footer.

**Decisions this spec takes inside A2** (the leader may overturn either at
the gate; each is one token):

- **A2-S1 · Centre colour: `--red-400` at full opacity.** The dot nearest
  the pointer renders exactly `#CF3147`; the mask fades it linearly to
  transparent at the radius, so at 60 px a dot is half red over the normal
  dot. Reasons (research A2.2): (1) any partial opacity of red-400 composited
  over the ink-500 page renders a darker maroon (50% gives about `#7A2C36`),
  which is not a brand tone, so on screen it would be the "new red hue" A2-2
  rules out; full opacity is the only value whose rendered pixel *is*
  red-400. (2) The dots paint on `--layer-spotlight`, below all content, so
  no glyph pixel is ever covered by a red dot. (3) A dot is 2.5 px across on
  a 24 px grid, about 0.85% of the area, and the full-strength dot sits under
  the 64×64 brand cursor's arrow tip. (4) Bone-100 text keeps 4.75:1 against
  a red-400 dot (DERIVED), so even a glyph pixel that lands on the strongest
  dot stays above 4.5:1. **Known weak spot**: ink-300 (`#737373`) small text
  (footer category, footer bottom bar) is about 1.06:1 against a red-400 dot,
  which is new now that the effect reaches the footer. It affects isolated
  2.5 px points, only within the radius, only while the pointer is there; it
  is a manual check (quickstart § 5). *(A2 revision 1: the footer covers the
  effect again, so this weak spot no longer applies to the footer's text.)*
  If Roberto finds it noisy, the one-line
  fallback is `--dot-paper-lit-color: color-mix(in srgb, var(--red-400) N%,
  transparent)`: same token, no new hue token.
- **A2-S2 · Radius token `--spotlight-lit-radius: 7.5rem`** (120 px at the
  default 16 px root). In rem, not px, for the same reason the dot grid is:
  the visitor's root font size scales the grid and the effect together
  (feature 008 A-10). It replaces `--spotlight-outer-size` (20.625rem); every
  size the component derives (beam, window, lit sheet, the fallback position)
  is computed from it, so recalibrating costs one number.
  Previous reach, from the source: mask radius `0.5 × 20.625rem` = 165 px with
  a linear falloff (CONFIRMED, repository); the leader quoted about 354 px.
  The difference is not material because the value is being replaced; it is
  recorded so neither number is cited later as a measurement.

**Footer dependencies checked** *(superseded by A2 revision 1: the footer
keeps `bg-ink-500`, so nothing below changes; the spotlight's `overflow:
clip` is still required because the lit sheet near the document's end still
extends under the footer)* (research A2.4): the ink colour under the
footer comes from the layout root and `html`, so its area stays ink-500;
nothing scrolls under the footer (it is the last in-flow child; the sticky
nav paints above it on a positive level, unchanged); the § R28 / § R37 layer
order is unchanged (the footer is normal flow; without its own background it
now obeys the same "no opaque background" rule as every section); the
spotlight's `overflow: clip` is still required and its "beam near the
footer" note still applies; the footer story already sets an ink background.
One consequence is not covered by the approval and goes to the gate as OA-9.

| # | Item | Recommendation | Owner |
|---|---|---|---|
| OA-9 | **MOOT after A2 revision 1 (2026-10-15)**: the footer's opaque fill hides whatever reaches below it, as before A2. Kept as history. **Section glows under the footer.** Glow layers are not clipped at their section's bottom (`SectionBackdrop` has no overflow rule, CONFIRMED), and the last section on each page has glows anchored near the footer's top edge (Contacto `cierre` at design y 4630 and `wine` at 4520, against a footer that starts around y 4660 in the 1440×5060 frame, DERIVED from 5060 − 400; Trabaja con muush mirrors Contacto's glow set per its `global.css` comment, its distance to the About footer not checked). Today the footer's opaque fill hides whatever of them reaches below. After A2-4 that part shows under the footer's text (INFERRED, not observed) | Accept: A2-4 asks for one continuous surface, and the glows end where the layout root clips the page anyway. Leader confirms in a browser at 1440 and 390 on `/es` and `/es/nosotros` before implementation; if Roberto rejects the look, the change is to the last sections' glows, not to the footer | Leader (observe), Roberto (decide) |

**`.pen` divergence.** Frame `gViAx` "DEMO spotlight cursor" draws the two
red circles that A2-1 removes, at the old size. Like feature 26's size cut,
this is a **recorded human divergence** from the design file, not a
correction of it (`rules.md` § R32 governs documents versus the `.pen`, and a
direct decision by Roberto governs both). Whether to update the frame is the
leader's and Roberto's call.

**`docs/business/` text this amendment contradicts** (Roberto edits these
himself; no agent writes there). After A2 revision 1 three passages remain,
all about the spotlight and the glow:

1. `rules.md` § R37, row `--layer-spotlight`: "la luz y los puntos
   iluminados". After A2 only the red lit dots.
2. `rules.md` § R38: the lit-dot brightness as a value pending Clau, derived
   as the recipe painted twice. After A2 it is Roberto's decision (red-400).
3. `landing/ui-map.md` § 10, the spotlight row ("Fondo normal, sin glow") and
   the *Spotlight del cursor (receta)* paragraph (red-400 42%, radius ~330 px,
   core ~90 px at 37%, dots "suben de brillo"). After A2: no glow, dots turn
   red-400, radius ~120 px.

*Removed by A2 revision 1 (2026-10-15), because the footer keeps its
`$ink-500` fill and these passages are accurate again:*
`landing/design-extract.md` § 9.bis *Footer — contenedor* ("Fill
`$ink-500`"); `rules.md` § R28 ("El único bloque opaco del diseño es el
footer, y no aporta glows."); `landing/ui-map.md` § 2 note ("El bloque opaco
del footer también alcanza el texto del nav").

### Optional `.pen` checks for the leader (not about motion or cursor)

1. Whether frame `GiLTU`'s radar centres still match `SERVICE_NODE_CENTRES`
   (150,330 · 430,200 · 690,440 · 950,250 · 1150,480), the rest positions
   the float oscillates around.
2. Whether, in frame `F2Zu8X`, the mobile spine passes through the radar
   centres. In the build it does not appear to: the spine is at canvas
   x = 29 and the radar centres at x = 11 (INFERRED from tokens,
   pre-existing, not changed by this feature).
3. Whether either page has a light (Bone) surface where the red cursor would
   sit (OA-8). Expected: none.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The desktop constellation feels alive (Priority: P1)

A visitor on a desktop screen scrolls to Services. The five service areas
drift gently up and down, each at its own moment. The thin lines between
them stretch and tilt with them and never come loose from the red dots. The
visitor can read any name and brief while it moves.

**Why this priority**: it is the visible change Roberto asked for, and a
line detached from its dot reads as a broken page.

**Independent Test**: open `/es` at 1440×900 and 1280×800, scroll to
Services, watch two full cycles; pause the animation in the browser's
animation inspector at several moments and check every line end sits on its
radar centre.

**Acceptance Scenarios**:

1. **Given** a desktop viewport (1024 px or wider) and no reduced-motion
   preference, **When** Services is on screen, **Then** each of the five
   nodes moves vertically within ±7 px of its design position, smoothly, and
   no two nodes reach their peak at the same moment.
2. **Given** the float is running, **Then** each radar keeps its existing
   ping, and the ping travels with its node.
3. **Given** the float is running, **When** the animation is paused at any
   moment, **Then** both ends of each of the four lines coincide with the
   centres of the two radars it joins, to within 0.5 px, at 1024, 1280,
   1440 and 1920 px widths.
4. **Given** the float is running, **When** a visitor reads a name or brief,
   **Then** the text moves with its radar as one piece (same offset, same
   moment), is never rotated, scaled or blurred, and stays legible.
5. **Given** the same page in `/en`, **Then** behaviour is identical.

---

### User Story 2 - Motion is never forced on anyone (Priority: P1)

A visitor whose system asks for reduced motion sees Services exactly as it
is today, on every viewport.

**Why this priority**: D-5, and the site already honours reduced motion for
every animation (`ui-map.md` § Movimiento reducido).

**Independent Test**: emulate `prefers-reduced-motion: reduce` and load
`/es` at 1440 and 390 px; compare with today's build.

**Acceptance Scenarios**:

1. **Given** `prefers-reduced-motion: reduce`, **Then** no node moves, on
   desktop or mobile, and every node and line is at its design position.
2. **Given** a browser without the capabilities the float needs, **Then**
   the composition is static and every desktop line still meets its radars.
3. **Given** JavaScript is disabled, **Then** the float behaves exactly as
   with JavaScript (it needs none).

---

### User Story 3 - Mobile and tablet float, as a trial (Priority: P2)

A visitor on a phone or a tablet narrower than 1024 px sees the vertical
timeline; its five rows (radar and text) drift up and down the same way,
out of step, while the lyrics dimming keeps working. Roberto reviews this
locally and may ask to remove it; removing it leaves the timeline exactly as
it was before this feature.

**Why this priority**: approved (D-3) but explicitly provisional.

**Independent Test**: `pnpm dev`, open `/es` at 390×844 and 768×1024,
scroll Services, watch the float with the lyrics effect; then remove the
mobile float block and confirm the timeline matches the pre-feature build.

**Acceptance Scenarios**:

1. **Given** a viewport narrower than 1024 px and no reduced-motion
   preference, **Then** each timeline row (radar and text together) moves
   vertically within ±7 px, out of phase with its neighbours, with the same
   parameters as desktop.
2. **Given** the float is running, **Then** the lyrics effect still dims
   and restores rows as before, and the radar ping keeps running.
3. **Given** the float is running, **Then** each radar stays on the same
   vertical as the static spine (the motion is parallel to the spine, so
   nothing detaches; research R4).
4. **Given** the mobile float block is deleted, **Then** the timeline is
   byte-identical in behaviour to the pre-feature build and the desktop
   float is unaffected.

---

### User Story 4 - The site has its own cursor (Priority: P1)

A visitor with a mouse or trackpad sees Roberto's red arrow with the "You"
pill instead of the system arrow everywhere on the site, including over
links and buttons. Clicking lands exactly where the arrow points. In text
fields the familiar text cursor appears.

**Why this priority**: explicit request, site-wide.

**Independent Test**: open `/es` and `/en/about` in Chrome, Safari and
Firefox on a desktop; move over body text, the nav, the primary button, a
footer link, both forms' fields, radio pills, the country selector and the
CV picker; click a small target.

**Acceptance Scenarios**:

1. **Given** a fine pointer, **When** over any non-editable part of any
   page, **Then** the brand cursor is shown, with no white square.
2. **Given** a fine pointer, **When** over a link or a button, **Then** the
   same brand cursor is shown, not the system hand (D-1).
3. **Given** a fine pointer, **When** over a text input or textarea,
   **Then** the system text cursor is shown (D-1, OA-5).
4. **Given** the cursor image cannot be loaded or decoded, **Then** the
   system arrow is shown in general and the system hand over links and
   buttons.
5. **Given** a click, **Then** the clicked point is the arrow's tip (OA-4).
6. **Given** a touch-only device, **Then** nothing changes.
7. **Given** forced colours are active, **Then** system cursors are shown.
8. **Given** `/es` or `/en`, **Then** the label reads "You" (D-2).

---

### User Story 5 - Red dots under the pointer, over the paper (Priority: P1) · amendment A2, revision 1

*(Title before A2 revision 1: "…everywhere including the footer".)*

A visitor with a mouse moves over the page and the dots of the paper close
to the pointer turn brand red, strongest right under the arrow and fading
back to the normal dot within about 120 px. There is no red haze or glow.
The footer keeps its own flat ink-500 surface, so it shows no dots and no
red dots, as before A2 (A2 revision 1). Over the forms' cards nothing shows
through, as today. *(Superseded A2 text: "The same happens over the footer,
which now reads as part of the same dotted surface.")*

**Why this priority**: explicit request. The reported defect (the glow
vanished over the footer) is moot: A2-1 removes the glow everywhere.

**Independent Test**: quickstart § 5 on `/es` and `/en/about` at 1440×900 in
Chrome, Safari and Firefox.

**Acceptance Scenarios**:

1. **Given** a fine hovering pointer over the paper, **When** it stops,
   **Then** the dot nearest the hotspot is red-400, dots further out are
   progressively less red, and dots beyond about 120 px are the normal dot
   (A2-2, A2-3, A2-S1).
2. **Given** the same, **Then** the spaces between dots carry no red tint:
   no glow, no halo, no visible circular edge (A2-1, A2-3).
3. *(A2 revision 1)* **Given** the pointer over the footer (brand block,
   columns, bottom bar), **Then** the footer shows its flat ink-500 surface
   with no dots and no red lit dots, exactly as before A2; paper dots above
   the footer's top edge that are within the radius still turn red, so the
   effect is cut cleanly by the footer's edge (A2-4 rev 1). *(Superseded A2 text: "the dots and the red lit
   dots are visible behind the footer's content exactly as over a
   section".)*
4. **Given** the pointer over the contact form card on `/es` or the
   application form card on `/en/about`, **Then** the card covers the effect
   as it does today (A2-4).
5. **Given** scroll offsets at the top, middle and bottom of the page and a
   20 px root font size, **Then** every red dot sits exactly on a base dot:
   no doubled or half-step dots (A2-5).
6. **Given** reduced motion, a coarse or non-hovering pointer, print, or no
   mouse event yet, **Then** no spotlight element exists, as before (A2-5).
7. **Given** any route, **Then** the footer's layout, typography, hairline
   and `bg-ink-500` surface are unchanged from before A2 (A2 revision 1;
   superseded A2 text: "only what shows behind it changes").

---

### Edge Cases

- Viewport resized across 1024 px while floating: one composition hides and
  the other shows; the one shown starts on its own clock with its lines (if
  any) glued from the first frame.
- Desktop widths 1024 to 1439 px, where part of the constellation is clipped
  today: lines and radars must still coincide (OA-3).
- Root font size changed by the visitor: positions are in rem; lines and
  radars must still coincide.
- Browser tab hidden: the browser stops advancing the animation; on return
  nodes and lines are still together.
- Services off screen: the float keeps running only as cheaply as any idle
  CSS animation; there is no script to pause (research R3).
- Mobile row 5's radar centre sits below the end of the spine today
  (DERIVED: 861 vs 836, pre-existing); the float does not change that.
- A brief wrapping to more lines in one locale: the float moves the whole
  block; nothing is laid out again.
- Disabled country selector: brand cursor; its fallback keyword may be the
  hand (only visible if the image fails).
- Storybook serves `public/` under `/brand`, so the cursor path does not
  resolve in the catalogue and it shows system cursors. Accepted: the cursor
  is a page-level rule, not a component.
- Cursor over the red final-CTA gradient: low contrast (OA-8).
- (A2) Pointer at the very bottom of the footer: the lit sheet extends past
  the document's end and is clipped by the spotlight root's `overflow: clip`
  and the layout root's clip; the page does not grow. (Still applies after
  A2 revision 1: the sheet exists under the footer even though the footer
  covers it.)
- (A2) Pointer over ink-300 footer text: a red-400 dot under a glyph is
  about 1.06:1 against it (A2-S1, known weak spot, manual check).
  **Moot after A2 revision 1**: the footer covers the effect.
- (A2) Pointer over a red surface (final-CTA gradient, red glass cards): red
  dots on red; the cards are content and paint above the dots, so only the
  areas between cards can show them. Record visibility.
- (A2) Pointer over the sticky nav: the nav has no surface (ui-map § 2), so
  red dots show behind it, as the grey lit dots did.
- (A2) Glows of the last section under the footer: OA-9 (moot after A2
  revision 1).
- (A2 rev 1) Pointer straddling the footer's top edge: the lit circle is
  cut by the footer's opaque edge; above it the dots are red, below it the
  flat ink-500. Expected, not a defect.

## Requirements *(mandatory)*

### Functional Requirements

**Part A · Float, shared**

- **FR-001**: Each Services node MUST move vertically on a continuous sine
  around its design position, with the approved amplitude, period and
  per-node phase (D-4, OA-2), all held as tokens and shared by desktop and
  mobile.
- **FR-002**: Each node's radar and text MUST move as one unit: same offset
  at the same moment. The float applies no rotation, scaling, blur or
  opacity change.
- **FR-003**: The existing radar ping MUST keep running, unchanged.
- **FR-004**: With `prefers-reduced-motion: reduce`, every node and line
  MUST sit at its design position with no motion (D-5).
- **FR-005**: Where the browser lacks the features the float relies on, the
  composition MUST degrade to a static layout in which desktop lines still
  meet their radars.
- **FR-006**: The float MUST require no JavaScript, add no client state and
  no dependency, and leave the prerendered HTML unchanged except for
  presentational inline custom properties on the desktop connector lines.
- **FR-007**: The float MUST not trigger layout while running (only
  transforms change).

**Part A · Desktop**

- **FR-008**: Each connector's two ends MUST be computed, every frame, from
  the same values that move the two radars it joins, so no frame can show a
  gap. Resting endpoints MUST still come from `SERVICE_NODE_CENTRES`
  through `connectorEndpoints` (feature 14 FR-008); no centre is duplicated
  as a literal.
- **FR-009**: The line layer MUST use the same fixed coordinate frame as the
  nodes at every desktop width and root font size (fixes OA-3).

**Part A · Mobile and tablet trial (D-3)**

- **FR-010**: Below 1024 px each timeline row MUST float with the same
  parameters as desktop; the spine stays static.
- **FR-011**: The lyrics effect MUST keep working unchanged while rows float.
- **FR-012**: The mobile float MUST live in one self-contained, commented
  block of the timeline's styles that reads only the shared tokens, and MUST
  be implemented in its own tasks and its own commit, so deleting that block
  (or reverting that commit) restores the pre-feature timeline without
  touching the desktop float, the tokens or any test other than the mobile
  float's own.

**Part B · Cursor**

- **FR-013**: The repository MUST contain a cleaned copy of the brand cursor
  at `public/cursor/you.svg`, identical to `01-Mouse.svg` except that the
  full-size white background `<rect>` is removed and the root `width`/`height`
  are 64 (amendment A1; `viewBox` unchanged); the arrow, the pill and
  the "You" glyph paths are kept unchanged (OA-7). A short XML comment may
  state provenance and why its colour literal cannot be a token.
- **FR-014**: Every page in both locales MUST use that image as the cursor,
  hotspot per amendment A1 (supersedes OA-4), system arrow as fallback.
- **FR-015**: Links, buttons and every element that today declares a pointer
  cursor MUST show the same image, with the system hand as fallback (D-1).
- **FR-016**: Text-entry inputs, textarea and editable content MUST keep the
  system text cursor (D-1, OA-5).
- **FR-017**: With forced colours active, the site MUST use system cursors.
- **FR-018**: The cursor MUST be served from the site's own origin; no
  third-party request is added.
- **FR-019**: The cursor values (image, hotspot, fallbacks) MUST be defined
  once, as tokens, and reused by every rule that applies them.
- **FR-020**: The label is "You" on every locale (D-2); no locale-specific
  cursor rule exists.

**Both**

- **FR-021**: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`
  and `pnpm storybook:build` MUST pass.

**Part C · Spotlight and footer (amendment A2, 2026-10-14)**

- **FR-022**: The spotlight MUST paint no light of its own: no background,
  background image or gradient on `.cursor-spotlight__beam` or the root. The
  tokens `--spotlight-red-400-42`, `--spotlight-red-400-17`,
  `--spotlight-red-400-37`, `--spotlight-stop-mid` and
  `--spotlight-core-size` MUST be deleted from `global.css` and referenced
  nowhere in the repository (A2-1, Article VIII no dead code).
- **FR-023**: The lit dots MUST be painted with `--dot-paper-lit-color`,
  declared as `var(--red-400)` with no literal. Under the pointer a lit dot
  renders red-400 at full opacity (A2-S1); with distance it fades linearly to
  transparent over the normal dot. No new hex literal, no new `--red-*` token
  and no other new colour token is added; the lit sheet keeps `DotGrid`'s
  `--dot-paper-radius` and `--dot-paper-step` (A2-2).
- **FR-024**: The effect's radius MUST come from one `:root` token,
  `--spotlight-lit-radius: 7.5rem` (120 px at a 16 px root; A2-3, A2-S2). The
  mask's circle radius reads it directly, and every derived size (beam,
  window, lit sheet, the fallback position) is computed from it.
  `--spotlight-outer-size` MUST be removed. The mask keeps a falloff whose
  alpha reaches 0 exactly at the radius, so there is no hard edge.
- **FR-025**: Everything listed in A2-5 MUST keep working unchanged:
  activation conditions, absence from the prerendered HTML, registration on
  the base grid at every pointer position, scroll offset and root font size,
  fade token, `--layer-spotlight`, `overflow: clip`, no blend mode, no props,
  no colour or size literal in the component.
- **FR-026** *(A2 revision 1, 2026-10-15)*: The `<footer>` of
  `SiteFooter.vue` MUST paint its own flat, opaque `bg-ink-500` surface,
  exactly as before A2, so neither `DotGrid`'s sheet nor the lit dots show
  over it. Its layout, typography, spacing tokens and hairline are unchanged.
  A test MUST pin the `bg-ink-500` class on the component and on the
  prerendered `<footer>` of `/es` and `/en/about` (A2-4 rev 1).
  *Superseded A2 text*: "MUST paint no background of its own (no `bg-*`
  utility, no background declaration), so `DotGrid`'s sheet and the lit dots
  show under its content."
- **FR-027**: The contact and application form cards MUST keep their glass
  surface (`bg-glass-dark-contact` with `backdrop-blur-glass-dark`) and keep
  covering the effect as today (A2-4). No file of the `forms` feature changes
  except its tests.
- **FR-028**: Comments that describe the glow, the old size or an opaque
  footer MUST be corrected in the same change: `CursorSpotlight.vue` and its
  stories, `app/layouts/default.vue`'s background-stack notes,
  `SectionBackdrop.vue`'s "only opaque block" sentence, `SiteFooter.vue`'s
  doc comment, and the spotlight, lit-colour, layer-table and radar comments
  in `global.css`. No file under `docs/business/` is edited by an agent; the
  list of contradicted text goes to Roberto (amendment A2).
  *A2 revision 1*: the footer-related comments return to the pre-A2 fact
  (the footer is the one opaque block and covers the dots and the
  spotlight): `SectionBackdrop.vue`'s "only opaque block" sentence is
  restored, `SiteFooter.vue`'s doc comment describes its ink-500 surface,
  `app/layouts/default.vue`'s note names the footer and the form cards as
  the surfaces that cover the effect, and `CursorSpotlight.vue`'s point 1
  drops "now that the footer has no surface of its own". Spotlight, glow,
  lit-colour and radius comments stay as A2 wrote them.
- **FR-029**: No copy and no locale key changes; Part C applies identically
  to all four routes.

### Key Entities

- **Float clock**: one shared phase that advances once per period; every
  moving value in a composition is computed from it.
- **Node phase**: per-node angle added to the shared phase (five values,
  shared by both compositions).
- **Connector (desktop)**: line between radar *i* and *i+1*; resting ends
  from the confirmed centres, moving ends from the two node phases.
- **Spine (mobile)**: one static vertical line; rows move parallel to it.
- **Brand cursor**: one image rendered at 64×64 (32×32 viewBox, amendment A1), one hotspot, two fallback keywords.
- **Lit dots (A2)**: a second copy of the dot recipe in red-400, carried by
  the pointer, masked by a linear radial falloff of radius
  `--spotlight-lit-radius`, registered on the base grid.
- **Footer surface (A2 revision 1)**: its own flat, opaque `bg-ink-500`, as
  before A2; it covers the dots and the lit dots. *(Superseded A2 text:
  "none of its own; the footer's background is the page's (ink base, dots,
  lit dots).")*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a paused-animation inspection at 8 moments per cycle and 4
  desktop widths (1024, 1280, 1440, 1920), every line end is within 0.5 px
  of its radar centre (128 checks in total).
- **SC-002**: Every node's offset stays within ±7 px and no two nodes share
  a phase, on desktop and mobile.
- **SC-003**: With reduced motion emulated, Services matches the
  pre-feature build at 1440 and 390 px.
- **SC-004**: A 10 s performance recording of the float shows no layout
  caused by it.
- **SC-005**: Removing the mobile float block restores the pre-feature
  mobile timeline with no other edit.
- **SC-006**: The brand cursor appears on all four routes in Chrome, Safari
  and Firefox on macOS, without a white square; the text cursor appears in
  every text field of both forms.
- **SC-007**: A click aimed with the arrow tip at a 1 px target lands on it.
- **SC-008**: The deployed output contains the cursor file with no
  background rectangle, and no third-party request is added.
- **SC-009** (A2): With the pointer still over plain paper at 1440×900, a
  pixel sample at the dot nearest the hotspot reads `#CF3147` (±2 per
  channel), dots more than 120 px away read as the normal dot, and a sample
  midway between two dots inside the radius reads ink-500 (no glow).
- **SC-010** (A2, revision 1): Over the footer on `/es` and `/en/about`,
  with the pointer still inside it, a pixel sample at a dot-grid position
  and one between dots both read ink-500 (`bg-ink-500`, no dot, no red), as
  in the pre-A2 build; over a form card the lit dots are not visible, as in
  the pre-A2 build. *(Superseded A2 text: "Over the footer, the same samples
  give the same results [as SC-009]".)*
- **SC-011** (A2): No doubled or half-step dot at scroll offsets top, middle
  and bottom, at 16 px and 20 px root font size.
- **SC-012** (A2): `global.css` declares no `--spotlight-red-400-*`,
  `--spotlight-stop-mid`, `--spotlight-core-size` or `--spotlight-outer-size`,
  exactly the five `--red-100`…`--red-500` red tokens it declared before, and
  `--spotlight-lit-radius` equal to 7.5rem.

## Provenance

| # | Value | Status | Source |
|---|---|---|---|
| P-01 | Five radar centres 150,330 · 430,200 · 690,440 · 950,250 · 1150,480 in a 1440×910 frame | CONFIRMED (repository) | `servicesContent.ts`, `global.css`, features 14 / 23 |
| P-02 | Amplitude 6–8 px, period 5–7 s, desynchronized, sine | CONFIRMED (Roberto, D-4) | leader message 2026-10-14 |
| P-03 | 7 px, shared 6 s, golden-angle phases | Implementation choice inside P-02 | OA-2 |
| P-04 | Radar ping 2.4 s, unchanged | CONFIRMED (repository) | `--duration-radar-ping` |
| P-05 | Cursor 32×32, arrow and pill `#CF3147`, glyphs white, background `<rect>` white 32×32 | CONFIRMED (file read) | `01-Mouse.svg` |
| P-06 | Arrow vertex (1, 5); drawn tip ≈ (0.1, 4.1) | DERIVED | path data plus 1-unit miter stroke (research R6) |
| P-07 | `#CF3147` equals `--red-400` | CONFIRMED | `global.css`, `branding.md` |
| P-08 | Desktop lines miss radars below 1440 px today | INFERRED | `<svg viewBox="0 0 1440 910">` sized to a canvas narrower than 1440 px, radars at fixed rem positions; not observed in a browser |
| P-09 | SVG cursor support and sharpness per browser | UNVERIFIED | research R5 |
| P-10 | `01.png` (62×62 RGBA) next to the SVG | CONFIRMED (file metadata) | not used: not a 1x/2x size of the 32×32 asset |
| P-11 | Mobile spine static at canvas x 29, y 86–836; rows at `72 + i × 185` | CONFIRMED (repository) | `ServicesTimeline.vue`, `global.css` |
| P-12 | No glow, red-400 lit dots, radius ≈120 px, footer without its own background (superseded by P-20), forms keep covering, rest of the spotlight unchanged | CONFIRMED (Roberto, A2-1…A2-5) | leader message 2026-10-14 |
| P-13 | Glow = two radial gradients on `.cursor-spotlight__beam` using `--spotlight-red-400-{42,17,37}`, `--spotlight-stop-mid`, `--spotlight-core-size`; none used elsewhere | CONFIRMED (repository) | `CursorSpotlight.vue`, `global.css`, `grep` over `app/`, `tests/` |
| P-14 | Current lit colour `--dot-paper-lit-color: var(--dot-paper-color)` painted over the base (22.6% derived); mask radius `0.5 × --spotlight-outer-size` = 165 px, linear | CONFIRMED (repository) | `global.css`, `CursorSpotlight.vue` |
| P-15 | Red-400 dot vs ink-500 3.01:1; bone-100 text vs red-400 4.75:1; ink-300 vs red-400 1.06:1; ink-500 + 50% red-400 ≈ `#7A2C36`; dot area 0.85% | DERIVED | WCAG relative luminance on the `global.css` hex values; π·1.25²/24² |
| P-16 | Footer is `<footer class="bg-ink-500">`; layout root `bg-ink-500`; `DotGrid` `inset-0` on the layout root | CONFIRMED (repository) | `SiteFooter.vue`, `app/layouts/default.vue`, `DotGrid.vue` |
| P-17 | Form cards `bg-glass-dark-contact` (dark-glass 80%) + `backdrop-blur-glass-dark` | CONFIRMED (repository) | `ContactForm.vue`, `ApplicationForm.vue`, `global.css` |
| P-18 | Last-section glows reach under the footer | INFERRED | `SectionBackdrop.vue` has no overflow rule; Contacto glow anchors in `global.css` (OA-9) |
| P-19 | Roberto's two screenshots (reference effect; effect hidden over the footer) | UNVERIFIED by the spec author | described by the leader; not seen here |
| P-20 | Footer keeps its flat `bg-ink-500` surface ("me quitaste el fondo del footer flat, eso quiero que esté"); red lit dots therefore not shown over the footer | CONFIRMED (Roberto, A2 revision 1; consequence approved as the leader's reading) | leader message 2026-10-15 |
| P-21 | Pre-A2 footer was `<footer class="bg-ink-500">` with no test pinning the class | CONFIRMED (repository) | `git show HEAD:app/features/shell/ui/SiteFooter.vue`, `…/SiteFooter.test.ts`; research A2.4 |

## Assumptions

- A-01: Desktop means the existing `lg` breakpoint (1024 px), as in
  feature 14; "mobile and tablet" means everything below it.
- A-02: Target browsers are current Chrome, Safari and Firefox (Edge
  follows Chrome); versions older than about two years may get the static
  fallback.
- A-03: No new copy, so `i18n/locales/` is untouched.
- A-04: The cursor needs no story: it is a page-level rule, not a component.
- A-05 (A2): Part C touches `app/shared/ui/` and `app/features/shell/ui/`
  without any new import between features, so Articles II and III are not
  engaged; the `forms` feature changes only in its tests.
- A-06 (A2): "About 120 px" is read at the default 16 px root; at a larger
  root font size the radius grows with the dot grid, by design (A2-S2).
