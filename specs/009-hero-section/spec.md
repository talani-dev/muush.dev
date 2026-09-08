# Feature Specification: Hero section

**Feature Branch**: `feat/hero-section`
**Created**: 2026-09-07
**Status**: Draft
**Input**: Feature id 9 in `feature_list.json` (`hero_section`, `"sdd": true`). Build `01 Hero`, the landing's first section, in both locales and both viewports — and, because it is the first section to exist at all, make it the first real exercise of the glow contribution mechanism and of the R28/R37 paint-order contract.

## Overview

The landing page today is the shell wrapped around a placeholder heading. This
feature replaces that placeholder with the design's first section: a Pill
eyebrow, the headline, the subhead and a row of two calls to action, over the
three radial glows that give the top of the page its colour.

It is four children in a vertical stack, and the two frames are structurally
identical — same children, same order, same roles. Only sizes change, and one
thing: the CTA row runs horizontally on desktop and vertically on mobile.
**That makes it one responsive component, not two**, exactly as the nav and
the footer are one each (feature 3, `design-extract.md` § 9.bis).

It draws nothing new. `Pill`, `BotonPrimario`, `LinkArrow`, `SectionBackdrop`
and `SectionGlow` all exist and are consumed unchanged. Every size it needs
already resolves through the fluid scale in `app/assets/css/global.css`; what
this feature adds to that file is geometry the design gives only for the Hero
(the stack's gaps and the six glow anchors).

### Why this is bigger than one section

Three things converge here and none of them is about the Hero's own markup.

1. **It is the first consumer of feature 6's contribution mechanism.** That
   mechanism shipped proven in the Storybook catalogue against a stand-in
   section (feature 6, A-10). This is the first time a real section renders
   its own glows on a real page.
2. **It is the first thing the R28/R37 paint-order contract actually
   governs.** Until now the contract has bound nothing: no page rendered a
   `SectionBackdrop`. From this feature on, a section that creates a stacking
   context or paints an opaque background lifts its own glows above the dot
   sheet, with no error and no failing test.
3. **It closes both limits feature 8 had to declare.** Feature 8 measured the
   glow level (`-3`) in the built catalogue rather than on a page, because no
   page rendered a section; and it verified scroll tracking with a 3000px
   spacer injected into a stub page, because no page was taller than the
   viewport. A real Hero makes both measurable on shipped content, and this
   spec requires them measured that way.

### Scope added 2026-09-07 — the nav CTA reveal

Roberto decided that the nav's `Cuéntanos tu proyecto` button must not be
visible while the Hero is on screen, because it is the same control the Hero
already offers. The decision is recorded in `ui-map.md` § 2, which is now the
source and replaces the 🔴 that asked whether the nav is fixed. It lands here
because the Hero is the trigger.

It is small in behaviour and **not small in blast radius**: the controlled
element belongs to feature 3's shell, which is `done` and merged. § *Files
this feature modifies* lists exactly what it reaches into.

### What this feature is not

It does **not** modify `SectionGlow.vue`, `DotGrid.vue`, `SectionBackdrop.vue`
or the three `--layer-*` tokens. All four are `done` contracts and this
feature is a consumer of every one of them.

It does **not** perform the cleanup feature 7 owns. `SectionGlow.vue`'s doc
comment still says "22 … 12 on Landing", and its `GlowSize` union still offers
the dead `'920'` variant backed by `--spacing-glow-920`. Both are stale, both
are already scheduled, and touching them here would widen this diff into
someone else's feature. They are left alone deliberately.

It does not build any other section, does not create the `#contacto` target,
and does not resolve either of the two open decisions it is blocked by — it
renders their absence correctly instead.

### Source of truth and evidence discipline

Every value below is **CONFIRMED** (against the `.pen` via the leader, or
against this repository), **DERIVED** with the arithmetic shown, or recorded
as an **ASSUMPTION** with an owner and a reversal cost.

The `.pen` was not opened here. The Pencil bridge exists only in the main
interactive session, so a subagent cannot check the source of truth itself
(Constitution, *Development Workflow*; `rules.md` § R32). The leader extracted
the Hero's measurements from four frames on 2026-09-07 — desktop ES `hpiMz`,
desktop EN `I87ti`, mobile ES `t5n4Sm`, mobile EN `dwool` — and passed them
down in the task prompt. **Where that reading and `docs/business/` disagree,
the frame reading wins and the document is what gets corrected.** Where a
value is missing, this spec asks the leader (see § *Open questions for the
leader*) rather than falling back to a document and presenting it as a design
measurement.

### Measurement provenance

| Group | Source | Status |
|---|---|---|
| Four children, same order, both viewports; only the CTA row's direction differs | Leader's reading of `hpiMz` / `t5n4Sm` (and their EN twins) | CONFIRMED |
| Desktop: body 900×466, gap 34, at page x80 y310 | Same | CONFIRMED |
| Mobile: body 342×400, gap 24, at page x24 y150 | Same | CONFIRMED |
| Headline 98/600 · lh 0.98 · ls −3.5 → 46/600 · lh 1 · ls −1.7 | Leader's reading; matches `design-extract.md` § 9 row *Display (hero landing)* | CONFIRMED by both |
| Subhead 21/400 · lh 1.5 → 17/400 · lh 1.5 | Leader's reading; matches § 9 row *Body (subhead hero)* | CONFIRMED by both |
| Pill text 13 → 12 | Leader's reading; matches § 3 | CONFIRMED by both |
| Primary CTA label 16 → 15, `hero` padding variant | Leader's reading; matches § 4 variant table | CONFIRMED by both |
| Secondary CTA 16/500/ls 0 desktop, 16/600/ls −0.3 mobile | Leader's reading; matches § 7 rows *Hero desktop* / *Hero móvil* | CONFIRMED by both — see D-04 |
| Headline and secondary CTA `bone-100`; subhead `ink-100`; all Instrument Sans | Leader's reading | CONFIRMED |
| Eyebrow reads `Technology solution studio` in **both** locale frames | Leader's reading of all four frames | CONFIRMED — see FR-009 |
| Headline / subhead / CTA copy, ES and EN | Leader's reading; matches `content.md` (*WHAT* block, *CTA* block) and `messaging.md` | CONFIRMED by both |
| Three glows: foco red-400 65% `1500-700`; wine wine-300 40% `1100-520`; cierre wine-400 30% `900-520` | Leader's reading; matches `design-extract.md` § 10 Landing table | CONFIRMED by both |
| Glow fills `#CF3147A6`, `#8A455266`, `#591F284D` — **identical in both viewports** | Leader's second reading, 2026-09-07 | CONFIRMED. `A6`/255 = 65.1%, `66`/255 = 40.0%, `4D`/255 = 30.2% — the three opacities the tokens already carry |
| Glow **centres**, desktop: 1310,290 · 130,310 · 1430,870 | Leader's second reading, measured directly | **CONFIRMED.** They match the earlier top-left coordinates plus each radius exactly, which retires that inference |
| Glow **centres**, mobile: 410,50 · 40,140 · 440,520 | Leader's second reading | **CONFIRMED — and they disprove A-04's first draft.** See D-06 |
| Nav height: **desktop 1440×103, mobile 390×76** | Leader's second reading, bounds-resolved from the frames | **CONFIRMED.** Agrees with the repository-token derivation (102.8 / 76.2) to within rounding |
| Hero section spans page y 0→940 desktop, 0→640 mobile; `02 Propósito` starts at 940 / 640 | Leader's second reading | CONFIRMED |
| Hero top padding 207 desktop / 74 mobile | DERIVED: 310 − 103 and 150 − 76 | Both inputs now CONFIRMED |
| Every token this feature consumes already exists in `global.css` | Verified in the repository | CONFIRMED |
| No wrapper between a page section and the layout root creates a stacking context | Verified in `app/layouts/default.vue`: `<main class="mx-auto max-w-shell-max px-page">` sets none of the properties § R28 lists | CONFIRMED |

### Discrepancies and findings

- **D-01 · The design draws a live control the site is not allowed to ship.**
  All four frames draw `Agenda una llamada →` / `Book a call →` in `bone-100`,
  the colour of a live call to action. `ui-map.md` § 3 carries a 🔴 saying the
  opposite: while the Google Calendar link does not exist "el botón no debe
  llevar a ningún lado en producción — deshabilitado u oculto antes de
  publicar". They cannot both be honoured. **Resolved in favour of
  `ui-map.md`** — see the Clarifications and FR-011. **Owner: Clau**
  (`decisions-open.md` #2, the Calendar URL). **Reversal cost: one data
  value.**

- **D-02 · The primary CTA points at a section that does not exist.**
  `ui-map.md` § 3 says clicking it scrolls to `#contacto` and focuses the
  Nombre field. `#contacto` belongs to section 05, which is a later feature.
  **Resolved in FR-012.** **Owner: Roberto** (scheduling section 05).
  **Reversal cost: one data value.**

- **D-03 · The shell already ships five links to anchors that do not exist,
  and this feature deliberately does not match that precedent.**
  `app/features/shell/data/navigation.ts` and `footerColumns.ts` emit
  `/es/#contacto`, `/es/#proposito`, `/es/#servicios` and `/es/#proyectos`
  from the nav CTA, the mobile menu and the footer's Navegación column. Every
  one of those targets is missing today, and clicking any of them changes the
  URL and moves nothing. This feature's primary CTA takes the stricter line
  (FR-012) because the leader required it and because a dangling fragment is
  also a dangling URL for a crawler. **The inconsistency is real and lasts
  only until the sections ship.** Whether the shell should be brought into
  line early is **Roberto's** call and is out of this feature's scope.

- **D-04 · The design gives the secondary CTA two different weights and two
  different trackings for the same 16px role.** Desktop is 500/ls 0, mobile is
  600/ls −0.3 (`design-extract.md` § 7, confirmed by the leader's reading).
  The `--text-link` token that feature 2 shipped resolves this to a single
  600/ls 0 — the mobile weight with the desktop tracking. **This feature reuses
  the frozen token rather than reopening it**, which is the same treatment
  `rules.md` § R4 records for the `lead` role (whose weight also changes
  500→600 between frames and which also resolves to one value). **Consequence:
  on desktop the secondary CTA renders one weight step heavier than the frame
  and on mobile it loses −0.3px of tracking.** **Owner: Clau** (pick one).
  **Reversal cost: one token value — and it is free today, because `LinkArrow`
  has no other consumer anywhere in the repository.**

- **D-06 · The glows are hand-placed per viewport, and one cannot be derived
  from the other.** This spec's first draft had only the desktop coordinates
  and derived the mobile ones by holding each glow's horizontal centre at a
  fixed fraction of the section's width. **The frames disprove it.** Measured
  against a 390px viewport, that derivation predicts x at 374.8 / 15.2 / 411.3
  where the design draws **410 / 40 / 440** — wrong by 35, 25 and 29px. The
  vertical axis diverges further: `foco`'s centre sits at 30.9% of the desktop
  section's height and 7.8% of the mobile one, and the `foco`/`wine` mirror
  pair that holds exactly on desktop (0.90972 + 0.09028 = 1) does **not** hold
  on mobile (1.0513 + 0.1026). The correction is in A-04, and it is folded
  back into `rules.md` § R48 so the five sections still to come do not repeat
  the inference. **Sizes and colours are unaffected** — both viewports use the
  same three fills and the same three size pairs.

- **D-07 · A pinned nav with no background of its own will overlap the content
  that scrolls under it.** `ui-map.md` § 2 pins the nav and says it keeps "el
  mismo alto y el mismo fondo". Its background today is **none** — the ink base
  belongs to the layout root — and the compressed state that would have
  introduced `#1c1416a6` is explicitly dropped by the same decision. So once
  the page scrolls, the lockup and the links will sit over whatever passes
  beneath them; with only the Hero and the footer built, that is the footer's
  opaque block sliding under the nav's text. **This spec implements what
  `ui-map.md` says and does not invent a background**, per the instruction that
  a contradiction in `docs/business/` is reported rather than fixed. **Owner:
  Clau / Roberto.** **Reversal cost: two utility classes on the nav row
  (`bg-glass-dark`, a blur), which is what the dropped compressed state would
  have supplied.**

- **D-05 · `--text-display` carries the desktop line-height at both ends.**
  The design draws lh 0.98 desktop and lh 1 mobile; the token is 0.98
  throughout. At 46px that is 0.92px per line. Not reopened, for the same
  reason as D-04. **Reversal cost: one token value.**

## Clarifications

### Session 2026-09-07

Three decisions had no answer that both source documents agreed on, and each
would have blocked implementation. All three are resolved here rather than
deferred, per the leader's instruction; each carries an owner and a reversal
cost.

- **Q**: The `.pen` bakes `→` into the secondary CTA's text, but `ui-map.md`
  § 3 specifies its hover as *"subrayado o desplazamiento de flecha"* — and an
  arrow that moves has to be its own element. Is this `LinkArrow`'s first
  consumer, or is plain text right? → **A**: **`LinkArrow` is the right
  component and the arrow never belongs to the copy.** The i18n strings are
  `Agenda una llamada` and `Book a call`, with no glyph: `LinkArrow` appends
  and animates the arrow itself, which is exactly the reason feature 2 gave
  for owning it. A mockup cannot draw a hover, so the baked-in `→` is a
  drawing convention and not a copy decision — the same class of thing as
  `rules.md` § R38. **However, `LinkArrow` does not render today**, because
  the control has no destination (next question) and `LinkArrow` requires an
  `href`. Both branches are written now; only a data value decides which one
  renders. *(FR-010, FR-011.)*

- **Q**: `Agenda una llamada` has no destination. The design draws a live
  `bone-100` CTA; `ui-map.md` § 3 forbids shipping anything that leads
  nowhere; feature 3's precedent renders destination-less items as
  non-interactive `ink-300` text. Which wins? → **A**: **`ui-map.md` and the
  feature 3 precedent win.** The control is *present* — `ui-map.md` offers
  "deshabilitado **u** oculto" and present-but-inert is the weaker, more
  honest of the two — and it renders exactly as `FooterColumn.vue` renders the
  identical phrase in the footer's Contacto column: a `<span>` in `ink-300`,
  no anchor element, no pointer, no hover, and no arrow. **What a visitor sees
  today: the two calls to action side by side, the primary one in its
  glass-and-LED box, and beside it "Agenda una llamada" in grey text that does
  not respond to the pointer.** The day Clau supplies the URL it becomes a
  `bone-100` `LinkArrow` opening in a new tab, and that is a one-value data
  change. *(D-01, FR-011.)*

- **Q**: The primary CTA targets `#contacto`, which does not exist, and it
  must not emit a link to a missing anchor. What does it do until section 05
  ships? → **A**: **It keeps its box, its LED ring and its label, and carries
  no destination at all** — `BotonPrimario` renders a real `<button
  type="button">` when given no `href`, which is the branch this uses. **What
  a visitor sees today: the button looks exactly as designed and clicking it
  does nothing.** That is a real defect, and it is accepted for three reasons:
  the site is not yet public (feature 6, US3); it is time-boxed by a feature
  already on the list; and the only alternative — emitting `/es/#contacto` —
  produces the same do-nothing click *plus* a dangling fragment in the URL,
  the history and the crawled HTML. **The destination lives in data, so
  section 05's feature turns it into a link by changing one value.** *(D-02,
  D-03, FR-012.)*

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The landing finally opens with its own first impression (Priority: P1)

A visitor lands on `/es/` or `/en/`. Above the fold they read a small capsule
with a pulsing red marker reading *Technology solution studio*, then the
headline at display size, then one sentence explaining what muush does, then
two calls to action. Behind all of it, red and wine light blooms from the top
right, the top left and the bottom right, under the field of dots. At 390px
the same four things appear in the same order at smaller sizes, with the two
calls to action stacked instead of side by side.

**Why this priority**: it is the feature. It is also the first time the site
shows anything that looks like the design rather than like a shell around a
placeholder.

**Independent Test**: generate the site; open all four routes at 390px and
1440px; confirm the four children, their order, their sizes and their copy
against the frames, and confirm the mobile primary button is as wide as its
label rather than as wide as the screen.

**Acceptance Scenarios**:

1. **Given** the Spanish landing at 1440px, **When** it loads, **Then** the
   eyebrow, headline, subhead and CTA row appear in that order, left-aligned,
   in a block that starts at the page gutter and is at most 900px wide.
2. **Given** the same page, **When** the subhead is measured, **Then** its
   line length is capped well short of the headline's — the design caps the
   measure at 600px — so the two do not wrap to the same width.
3. **Given** the Spanish landing at 390px, **When** it loads, **Then** the
   same four children appear in the same order and the CTA row is stacked
   vertically.
4. **Given** the mobile landing, **When** the primary button renders,
   **Then** it is exactly as wide as its label plus its padding, never the
   full width of the column (`ui-map.md` § 3).
5. **Given** the English landing in either viewport, **When** it loads,
   **Then** every string is the English one **except the eyebrow**, which
   reads `Technology solution studio` in both locales.
6. **Given** either locale, **When** the page's heading structure is walked,
   **Then** the Hero's headline is the page's only `<h1>`.

---

### User Story 2 - The background finally has something to sit behind (Priority: P1)

The same visitor sees the three Hero glows: a large red bloom off the top
right, a wine bloom off the top left, and a deeper wine one falling away past
the bottom right. They are underneath the dotted paper, so the dots read on
top of them; the cursor spotlight, on a desktop with a mouse, reads on top of
both; and all of the Hero's text and controls read on top of everything. None
of it can be clicked, selected or heard by a screen reader, and no horizontal
scrollbar ever appears even though two of the three glows are drawn partly off
the page.

**Why this priority**: it is the half of the feature that the rest of the site
depends on being right. Five more sections will copy whatever this one does.

**Independent Test**: generate the site, open the landing, and measure the
computed stacking level of the section's backdrop, the dot sheet, the
spotlight root and the Hero content **on the page** — not in the catalogue.

**Acceptance Scenarios**:

1. **Given** the generated landing, **When** the layers are measured on the
   page, **Then** they read, bottom to top: ink base → the Hero's glows → the
   dotted paper → (with a mouse) the cursor spotlight → the Hero's content.
2. **Given** the Hero section element, **When** its computed style is
   inspected, **Then** it establishes no stacking context and paints no
   opaque background of its own.
3. **Given** any viewport width from 320px to 2560px, **When** the landing is
   loaded, **Then** no horizontal scrollbar appears and no Hero content is
   clipped.
4. **Given** a screen reader, **When** it walks the landing, **Then** no glow
   is announced and the Hero reads as heading, paragraph and controls only.
5. **Given** the copy is replaced by a longer or shorter string, **When** the
   page re-renders, **Then** the glows move with the section rather than
   staying at a fixed page offset.
6. **Given** `SectionGlow.vue`, `DotGrid.vue`, `SectionBackdrop.vue` and the
   `--layer-*` tokens, **When** this feature is complete, **Then** all four
   show zero lines changed.

---

### User Story 3 - The two dead ends read as dead ends, not as broken links (Priority: P1)

A visitor clicks `Agenda una llamada`. Nothing happens, because nothing looks
clickable: it is grey text with no pointer cursor and no hover. A visitor who
clicks the primary button gets no response either — but the button is the one
control the design draws as a box, and it is still there, still branded.
Neither control produces a 404, a dangling `#` in the address bar, or an
anchor element with no destination.

**Why this priority**: it is the half of this feature most likely to be
"fixed" wrongly by the next person. Both dead ends are deliberate, both are
recorded, and both are one data value away from being alive.

**Independent Test**: generate the site and grep all four documents for an
anchor with no `href` and for a Hero-emitted `#contacto`; then read the
rendered Hero and confirm the secondary CTA is not an anchor element at all.

**Acceptance Scenarios**:

1. **Given** any generated page, **When** its markup is scanned, **Then** it
   contains no `<a>` without an `href` — the invariant
   `tests/static-output.test.ts` already asserts.
2. **Given** the Hero, **When** the secondary CTA is inspected, **Then** it is
   a plain text node in `ink-300`, with no anchor element, no pointer cursor,
   no hover treatment and no arrow glyph.
3. **Given** the Hero, **When** the primary CTA is inspected, **Then** it is a
   real button element with no `href` and no `#contacto` anywhere in its
   markup.
4. **Given** a Google Calendar URL supplied as data, **When** the page
   re-renders, **Then** the secondary CTA becomes a `bone-100` link with a
   trailing arrow that shifts on hover and opens in a new tab with the opener
   relationship severed — and no component markup changed to make that happen.
5. **Given** a `#contacto` destination supplied as data, **When** the page
   re-renders, **Then** the primary CTA becomes a link to it — and no
   component markup changed to make that happen.

---

### User Story 4 - The page is finally taller than the screen (Priority: P2)

Feature 8's cursor spotlight tracks the pointer while the page scrolls. Until
now that could only be demonstrated by injecting a 3000px spacer into a stub
page, because neither page was taller than a viewport. With the Hero in place
the landing scrolls on its own.

**Why this priority**: it costs nothing extra — it is a consequence of the
Hero existing — but it converts two declared limits into measured facts, and
that is the sort of thing that never gets done later.

**Independent Test**: load the generated landing at 1440×900 and at 390×844
and confirm the document scrolls with no test-only content added; then move
the pointer and scroll, and confirm the spotlight stays under the cursor.

**Acceptance Scenarios**:

1. **Given** the generated landing at 1440×900, **When** it loads, **Then**
   the document is taller than the viewport with nothing injected.
2. **Given** the generated landing at 390×844, **When** it loads, **Then**
   the same is true.
3. **Given** a desktop pointer resting on the Hero, **When** the page is
   scrolled, **Then** the spotlight stays under the pointer and its
   illuminated dots stay registered with the dot grid.
4. **Given** the glow level, **When** it is measured, **Then** it is measured
   on the generated page rather than in the Storybook catalogue.

---

### User Story 5 - The nav stops offering a button the page already offers (Priority: P2)

A visitor opens the landing on a desktop. The nav is pinned to the top of the
window and stays there as they scroll, at the same height it always had. While
the Hero is on screen its `Cuéntanos tu proyecto` button is absent — the Hero
is already offering it, two steps below. Once the Hero has scrolled away the
button fades in; scrolling back up into the Hero fades it out again. On
Nosotros the button is simply there from the moment the page paints, and never
animates.

**Why this priority**: it is a real duplication a visitor can see, and the Hero
is the only thing that can trigger it. P2 because the Hero is the deliverable
and this rides on it.

**Independent Test**: load the generated landing at 1440px, confirm the nav CTA
is absent at scroll 0 and never flashes; scroll past the Hero and watch it fade
in; scroll back and watch it fade out. Load Nosotros and confirm the button is
present on first paint with no fade. Repeat both with scripting disabled and
with reduced motion.

**Acceptance Scenarios**:

1. **Given** the landing at 1440px and scroll 0, **When** the page paints,
   **Then** the nav CTA is not visible and has not been visible at any point
   since the document loaded.
2. **Given** the landing, **When** the Hero has been scrolled entirely out of
   view, **Then** the nav CTA fades in; **When** the visitor scrolls back into
   the Hero, **Then** it fades out.
3. **Given** Nosotros in either locale, **When** the page paints, **Then** the
   nav CTA is already visible and no fade runs.
4. **Given** any page with scripting disabled, **When** it renders, **Then**
   the nav CTA is visible.
5. **Given** `prefers-reduced-motion: reduce`, **When** the Hero leaves or
   re-enters view, **Then** the button still appears and disappears, with no
   fade.
6. **Given** 390px, **When** any page renders, **Then** nothing about this
   behaviour is observable, because the nav has no CTA at that width.
7. **Given** the nav while hidden, **When** the visitor tabs through the page,
   **Then** the hidden button is not focusable.
8. **Given** any page, **When** it scrolls, **Then** the nav itself never
   changes height, background or opacity — only the button does.

---

### Edge Cases

- **A viewport wider than 1440px.** Content caps at `--spacing-shell-max` and
  centres (feature 3, A-02). The Hero's glows are anchored to the section, so
  the composition stays with the content column instead of drifting to the
  screen edges. The dot sheet and the ink base stay full-bleed.
- **A viewport between the two frames.** There is no third frame. Every size
  interpolates through the existing `clamp()` scale, and the only breakpoint
  in the whole section is the one that turns the CTA row from a column into a
  row — a **layout** change, which is the same distinction `SiteNav.vue`
  already draws for its own `lg:` rules.
- **A long headline in a future locale, or a copy edit.** The section grows,
  and because every glow offset is measured from the section's own top-left
  corner rather than from the page, the whole group travels with the section —
  which is what `rules.md` § R29 exists to guarantee. What it does **not** do
  is stretch: a Hero whose copy grew by 200px would keep `cierre` where the
  design put it rather than pushing it down. That is deliberate. The design
  places all three glows independently in each frame (A-04), so there is no
  proportional relationship to preserve, and the residual is a token value if
  a future locale ever grows the section materially.
- **A glow drawn off-canvas.** `wine` extends past the left edge and `foco`
  past the right; `cierre` falls past the bottom of the section and under the
  footer, which is opaque (feature 6, A-12). None of them may produce a
  horizontal scrollbar.
- **The glow that paints behind the nav.** `foco`'s centre sits above the
  Hero's own top edge, so part of it paints behind the nav. That is the
  design: the nav has no background of its own.
- **A visitor with reduced motion.** The radar inside the eyebrow stops
  pinging and the primary button's LED ring stops turning; both keep their
  static appearance. Nothing in the Hero depends on either.
- **A visitor with no JavaScript.** The Hero is entirely static markup: every
  string, every size and every glow is in the prerendered HTML and CSS. Only
  the cursor spotlight behind it is absent, which is already the documented
  no-JS fallback.
- **The mobile menu open over the Hero.** The Hero is inside the subtree the
  layout marks `inert`, and the menu's glass blurs whatever is behind it —
  which is now the Hero's glows and dots.
- **A visitor who enlarges text.** Every size is in `rem`, so the stack, its
  gaps and the glow anchors scale together.
- **Printing.** The glows are decorative; nothing is lost if a browser drops
  the background.

## Requirements *(mandatory)*

### Functional Requirements — structure and copy

- **FR-001**: The landing MUST render a Hero section, in both locales, as
  **one responsive component**. There MUST NOT be a desktop variant and a
  mobile variant, nor a `variant` prop that selects between them.
- **FR-002**: The Hero MUST render exactly four children, in this order:
  eyebrow, headline, subhead, CTA row. The order MUST be identical in both
  viewports.
- **FR-003**: The eyebrow MUST be an instance of the existing `Pill`
  primitive, consumed unchanged, carrying the label as a prop.
- **FR-004**: The headline MUST be the landing page's `<h1>`, and the page
  MUST NOT contain a second one. The placeholder heading currently in
  `app/pages/index.vue` is replaced, not supplemented.
- **FR-005**: The primary call to action MUST be an instance of the existing
  `BotonPrimario` primitive at its `hero` size variant, consumed unchanged.
- **FR-006**: The secondary call to action MUST be loose text with **no box,
  no border and no background in any state**, in both viewports
  (`ui-map.md` § 3).
- **FR-007**: On mobile the primary button MUST be sized to its own label and
  MUST NOT stretch to the width of the column.
- **FR-008**: Every visible string MUST come from `i18n/locales/es.json` and
  `i18n/locales/en.json`, both locales present, with zero copy literals in any
  component (Constitution Article VI). `tests/i18n-parity.test.ts` MUST stay
  green.
- **FR-009**: The eyebrow's copy MUST be `Technology solution studio` in
  **both** locales — it is English inside the Spanish page by design, verified
  in all four frames. The spec, the locale files and the component MUST say so
  loudly enough that a later i18n pass does not "fix" it, and a test MUST
  assert the two locale files carry the identical value for that key.
- **FR-010**: The secondary CTA's i18n strings MUST NOT contain the `→`
  glyph. The arrow belongs to `LinkArrow`, which owns it precisely so the
  hover affordance has something to move; a glyph inside the string cannot be
  animated and would render twice the day the control goes live.

### Functional Requirements — the two absent destinations

- **FR-011**: While no Google Calendar URL exists (`decisions-open.md` #2),
  the secondary CTA MUST render as non-interactive text in `ink-300`, with no
  anchor element, no pointer cursor, no hover treatment and no arrow — the
  identical treatment `FooterColumn.vue` already gives the identical phrase.
  When a URL is supplied it MUST render as a `bone-100` `LinkArrow` that opens
  in a new browsing context with the opener relationship severed
  (`ui-map.md` § 3).
- **FR-012**: While `#contacto` does not exist, the primary CTA MUST render as
  a real button with **no destination**, and MUST NOT emit `#contacto` — or
  any other fragment — into the generated HTML. When a destination is supplied
  it MUST render as a link to it.
- **FR-013**: Both absent destinations MUST be represented as **data**, in one
  file of the Hero's own module, each carrying a comment naming the decision
  that blocks it. Supplying either MUST be a change to that data and MUST NOT
  require editing any component's markup.
- **FR-014**: Neither absent destination may be worked around by inventing a
  substitute target — not the footer, not `mailto:`, not WhatsApp, not a
  scroll to an arbitrary position.

### Functional Requirements — geometry and tokens

- **FR-015**: Every colour, size, gap and offset MUST resolve through a named
  token in `app/assets/css/global.css`. Zero hex literals, zero `px` literals
  and zero arbitrary utility values may appear in any component
  (Constitution Article VII).
- **FR-016**: Where a `clamp()` in the existing scale already spans the two
  frames' values, that token MUST be reused rather than a new one added and
  rather than a breakpoint introduced. This applies at minimum to the headline
  (`--text-display`, 46→98), the subhead (`--text-body-lg`, 17→21), the
  eyebrow's label (`--text-pill`, 12→13), the primary button's label
  (`--text-button`, 15→16) and its padding (the `hero` variant), and the
  secondary CTA's label (`--text-link`). The design's x80 / x24 horizontal
  origin is the page gutter, which `<main>` already applies for every page
  (`--spacing-page`, 24→80): the Hero MUST inherit it and MUST NOT re-declare
  it, or the block will sit at twice the gutter.
- **FR-017**: The Hero MUST add tokens only for geometry the existing scale
  does not carry: the stack's gap (34→24), the CTA row's gap (28→20) and its
  extra top padding (14→10), the body's maximum width (900), the subhead's
  maximum measure (600), the section's top padding, and the **six** glow
  anchors — one per glow per axis, since the two viewports place the glows
  independently (A-04). Each new token MUST carry a comment stating the two
  frame values it interpolates.
- **FR-018**: No new token may be named `--color-glow-*` or `--spacing-glow-*`.
  That namespace is closed and belongs to `SectionGlow`, whose test asserts in
  both directions that every token with that prefix is reachable from its
  props; a Hero token in that namespace would fail a suite in a file this
  feature never opened (`rules.md` § R36).
- **FR-019**: The only breakpoint the Hero may introduce is the one that
  changes the CTA row from a column to a row. It MUST use the same breakpoint
  the shell already uses, and it MUST NOT be used to change any size.
- **FR-020**: The section's top padding MUST place the Hero's first child
  where the design places it — page y310 desktop, y150 mobile — measured from
  the bottom of the nav, since the nav sits in normal flow above it. With the
  frame-confirmed nav of 103 / 76 that is **207px / 74px** (A-02). The built
  page's nav MUST be measured as a check that the implementation matches the
  frame.
- **FR-021**: The Hero MUST NOT declare a bottom padding. The separation
  between it and whatever follows belongs to the following block, which is the
  convention the layout already states for the footer.

### Functional Requirements — the glows and the paint order

- **FR-022**: The Hero MUST contribute exactly three glows, through feature
  6's mechanism, by rendering them inside a `SectionBackdrop` in its own
  markup: `foco` (red-400, 65%, size `1500-700`), `wine` (wine-300, 40%, size
  `1100-520`) and `cierre` (wine-400, 30%, size `900-520`). All three
  colour+opacity pairs and all three size pairs already exist in
  `SectionGlow`'s API and in `global.css`.
- **FR-023**: Making the Hero's glows appear MUST require an edit to **no file
  outside the Hero's own module and the token file** — no layout edit, no
  shared list, no registration.
- **FR-024**: Each glow MUST be positioned **relative to the Hero section** —
  its offsets measured from the section's own top-left corner, never from the
  page (`rules.md` § R29; feature 6, A-13). The conversion MUST be recorded
  with its arithmetic. Because the two frames place the glows independently
  (A-04, D-06), each of the six offsets MUST carry **both** measured endpoints
  and interpolate between them; **no offset may be derived from the other
  viewport's value**, and the interpolation MUST be labelled a smoothing
  choice rather than a design measurement.
- **FR-025**: The Hero section MUST create **no stacking context**: no
  `transform`, `translate`, `scale`, `rotate`, `filter`, `backdrop-filter`,
  `opacity` below 1, `isolation`, `will-change`, `contain: paint`,
  `position: fixed`, or `position: sticky` with a `z-index` — on the section
  or on anything the Hero puts between it and the layout root.
- **FR-026**: The Hero section MUST NOT paint an opaque background of its own;
  it would hide its own glows.
- **FR-027**: If the design genuinely requires either of FR-025 or FR-026,
  that MUST be reported as a finding — with the escape hatch
  `SectionBackdrop.vue` documents, which is to move that section's glows up to
  the page level — and MUST NOT be worked around silently.
- **FR-028**: The rendered paint order MUST be verified **on a generated
  page**, not in the Storybook catalogue: the Hero's backdrop at
  `--layer-glow`, the dot sheet at `--layer-dots`, the cursor spotlight at
  `--layer-spotlight`, and the Hero's content in normal flow, in that order.
  This closes the limit feature 8 declared.
- **FR-029**: The glows MUST NOT produce a horizontal scrollbar at any
  viewport width, MUST NOT be focusable or clickable, and MUST NOT be
  announced by assistive technology.
- **FR-030**: `SectionGlow.vue`, `DotGrid.vue`, `SectionBackdrop.vue` and the
  three `--layer-*` tokens MUST show zero lines changed. `Pill.vue` and
  `BotonPrimario.vue` MUST show zero lines changed. The stale doc comment and
  the dead `'920'` variant in `SectionGlow.vue` belong to feature 7 and MUST
  be left exactly as they are.

### Functional Requirements — placement in the architecture

- **FR-031**: The Hero MUST live in a `landing` feature module under
  `app/features/`, split into the three layers the Constitution requires, with
  a barrel as its only public API (Articles I–III). It MUST NOT be placed in
  `app/shared/`, which is for cross-cutting reusables and has exactly one
  consumer here.
- **FR-032**: The Hero's presentational component MUST NOT call any Nuxt
  composable. Copy and destinations arrive as already-resolved props, resolved
  in the module's `logic/` layer — the discipline that lets the Storybook
  catalogue detect a component that cheats (`rules.md` § R23).
- **FR-033**: The landing page component MUST stay a thin wrapper: it composes
  the Hero and holds no Hero logic of its own.
- **FR-034**: The `landing` module MUST NOT import any internal file of the
  `shell` module. If the two need the same thing, it goes through the shell's
  barrel or to `app/shared/` (Article III).

### Functional Requirements — verification and quality gates

- **FR-035**: The Hero MUST have a Storybook story covering both viewports and
  both locales, and showing the secondary CTA in **both** of its states, so
  the live `LinkArrow` path is reviewable before it ships (Article X).
- **FR-036**: The Hero MUST have a component test covering the copy-to-slot
  mapping, the token classes for each of the four children, both destination
  branches, and the fact that the section root carries none of the properties
  FR-025 forbids.
- **FR-037**: A test MUST assert that the eyebrow key holds the identical
  value in both locale files. It MUST read the locale files **from disk**, not
  import them — an imported locale file is a compiled message AST and the
  assertion would pass on any input (`rules.md` § R27).
- **FR-038**: The generated-output test suite MUST assert that all four
  documents carry the Hero's copy for their own locale and that the primary
  CTA renders with no fragment destination.
- **FR-039**: If any test file lands in a directory `vitest.config.ts` does
  not already include, the `include` MUST be extended **and the file must be
  seen failing on purpose** before its real assertions are written
  (`rules.md` § R39).
- **FR-040**: Rules discovered while specifying and implementing MUST be
  appended to `docs/business/rules.md`, never overwriting it, each citing this
  feature.
- **FR-041**: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate` and
  `pnpm storybook:build` MUST all pass, and every existing test MUST stay
  green without being modified to accommodate this feature.

### Functional Requirements — the nav CTA reveal (added 2026-09-07)

- **FR-042**: The nav MUST stay pinned to the top of the viewport while the
  page scrolls, at its current height and with its current background
  (`ui-map.md` § 2). The nav itself MUST NOT animate, resize, or change
  background at any scroll position — the compressed state is dropped.
- **FR-043**: On the landing, the nav's `Cuéntanos tu proyecto` button MUST be
  hidden while the Hero is in view, MUST become visible once the Hero has been
  scrolled out of view, and MUST hide again when the Hero re-enters view.
- **FR-044**: On every route without a Hero, the button MUST be visible from
  first paint and MUST NOT animate on load. The absence of an entry animation
  MUST be structural — nothing to transition from — rather than a duration set
  to zero.
- **FR-045**: On the landing at scroll 0, the button MUST be hidden **in the
  generated HTML**, so it cannot flash before scripting runs.
- **FR-046**: With scripting unavailable, the button MUST be visible on every
  route, including the landing. This overrides FR-045's initial state and MUST
  require no scripting to take effect.
- **FR-047**: Under `prefers-reduced-motion: reduce` the button MUST still
  appear and disappear; only the fade is dropped. Hiding carries information;
  the fade is decoration.
- **FR-048**: While hidden, the button MUST NOT be focusable and MUST NOT be
  reachable by pointer.
- **FR-049**: The behaviour is **desktop-only**, because the nav has no CTA
  below `lg` — a deliberate decision of feature 3, verified in `SiteNav.vue`
  (`hidden lg:block`) and in `design-extract.md` § 9.bis. No mobile-specific
  behaviour may be invented for it.
- **FR-050**: The detection mechanism MUST NOT read layout geometry on a
  per-frame path (`findings.md` § R41), and MUST degrade to "button visible"
  on any route where no Hero exists.
- **FR-051**: The shared state this introduces MUST be written only on the
  client. During prerendering it MUST hold one value for every generated
  document, so no route can leak a state into the next — the property
  `useMobileMenu` already relies on and states.

### Key Entities

- **Hero section**: the landing's first block. Four children in a vertical
  stack, a top padding that positions the first of them, no bottom padding,
  and three glows of its own. It is the unit the glows are positioned against.
- **Hero content**: the five strings — eyebrow, headline, subhead, primary
  label, secondary label — plus the two destinations. Four of the strings are
  per-locale; the eyebrow is not.
- **Hero destination**: one of the two targets the Hero points at, each
  currently absent. Its two states are *absent* and *present*, and the
  rendering of each control is a function of which state it is in.
- **Hero glow group**: the three glows, each identified by its colour,
  opacity, size pair and its anchor on the section. The group is what feature
  6's mechanism carries; the section is what it is measured against.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four routes render the Hero's four children in order, at
  390px and at 1440px — 8 renderings, zero missing or reordered children.
- **SC-002**: Every measurement the leader supplied is reproduced within 2px
  at both frame widths: the body's width and gap, the headline's size, the
  subhead's size and measure cap, the CTA row's gap and top padding, and the
  primary button's label size.
- **SC-003**: The eyebrow reads `Technology solution studio` in 4 of 4
  documents, and the two locale files hold byte-identical values for that key.
- **SC-004**: Zero copy literals appear in any Hero component, and
  `i18n/locales/es.json` and `en.json` hold the same key set.
- **SC-005**: Zero hex literals, zero `px` literals and zero arbitrary utility
  values appear in any Hero component.
- **SC-006**: On the **generated page**, the four levels measure in the order
  glow → dots → spotlight → content, at both frame widths and in both locales.
  Zero renderings show a glow above the dots.
- **SC-007**: The Hero section's computed style shows none of the eleven
  stacking-context properties FR-025 lists, and no background colour of its
  own.
- **SC-008**: Zero horizontal scrollbars appear on the landing at any width
  from 320px to 2560px.
- **SC-009**: The generated landing scrolls with **zero** injected content at
  1440×900 and at 390×844, and the spotlight stays under a stationary pointer
  across a scroll at both.
- **SC-010**: The generated HTML contains zero anchors without an `href`, and
  zero fragments emitted by the Hero.
- **SC-011**: `SectionGlow.vue`, `DotGrid.vue`, `SectionBackdrop.vue`,
  `Pill.vue`, `BotonPrimario.vue` and the `--layer-*` tokens show zero lines
  changed in the feature's diff.
- **SC-012**: Making the Hero's glows appear required edits to exactly **two**
  files: the Hero's own component and `global.css` (for the three anchor
  tokens). Zero layout files, zero shared lists and zero shared components
  were touched.
- **SC-014**: Across 8 renderings (2 routes × 2 locales × 2 widths), the nav
  CTA's initial visibility in the generated HTML is correct in 8 of 8: hidden
  on the landing at 1440, visible on Nosotros at 1440, absent at 390.
- **SC-015**: On the landing, zero frames show the nav CTA before the first
  scroll, and zero fades run on any Nosotros page load.
- **SC-016**: With scripting disabled, the nav CTA is visible on 4 of 4
  generated documents.
- **SC-017**: The nav's height, background and opacity are byte-identical at
  scroll 0 and after scrolling past the Hero — only the button's computed
  `opacity` and `visibility` differ.
- **SC-013**: All five quality gates pass and every pre-existing test stays
  green with zero modifications made to accommodate this feature.

## Assumptions

Each is a decision taken because no source documents the value, or because two
sources disagree. **A-01, A-04 and A-06 are the three the approval gate most
needs to look at.**

- **A-01 · The two dead controls render as specified in the Clarifications,
  and both are visible deviations from the frames.** The secondary CTA is grey
  and inert where the design draws it live in `bone-100`; the primary CTA
  looks live and does nothing. Both are recorded as D-01 and D-02, both are
  one data value from being correct, and both were resolved in favour of
  `ui-map.md`'s explicit instruction over the frame's appearance. **Owners:
  Clau (the Calendar URL), Roberto (section 05's schedule).** **Reversal cost:
  one data value each.**
- **A-02 · The section's top padding is `design y − nav height`, and both
  inputs are now CONFIRMED.** The design places the Hero's first child at page
  y310 / y150, and the nav sits in normal flow above it. The leader's second
  frame reading gives the nav as **1440×103** and **390×76**, so the padding is
  **207px** and **74px**. This repository's own tokens independently derive
  102.8 and 76.2 — agreement to within rounding across two unrelated methods.
  T028 still measures the built page, now as a **check** that the
  implementation matches the frame rather than as the source of the number.
  **Reversal cost: one token value.**
- **A-03 · Each glow is anchored by its centre, and the centres are
  design-sourced.** The leader supplied measured centres for both viewports,
  which retires this spec's earlier inference that the design's coordinates
  were top-left corners — the two agree exactly on desktop (coordinate +
  radius = the measured centre, for all three glows), so the convention is
  confirmed rather than assumed. Centre-anchoring rather than corner-anchoring
  is what keeps the composition intact as the size token interpolates between
  frames. **Reversal cost: three offsets.**
- **A-04 · The glow offsets are two measured sets, and the interpolation
  between them is a smoothing choice.** *(Rewritten 2026-09-07 after the
  leader read the mobile frames — the first draft derived mobile from desktop
  and was wrong; see D-06.)* Both endpoints are read from the design:

  | Glow | Desktop centre (page) | Mobile centre (page) |
  |---|---|---|
  | `foco` | 1310, 290 | 410, 50 |
  | `wine` | 130, 310 | 40, 140 |
  | `cierre` | 1430, 870 | 440, 520 |

  Converted to the section's own box — origin at the page gutter horizontally
  and at the nav's bottom edge vertically — that is (1230, 187) / (50, 207) /
  (1350, 767) on desktop and (386, −26) / (16, 64) / (416, 444) on mobile.
  **The glows are hand-placed per viewport; neither set derives from the
  other.**

  Each of the six offsets is then interpolated between its two endpoints with
  a `clamp()`, the same 390↔1440 interpolation feature 1's fluid scale already
  uses everywhere else. **Only the two endpoints are design-sourced; every
  width in between is a smoothing choice**, taken so the section keeps the
  property that its only breakpoint changes direction and never a position.
  The alternative — a media query per glow — would put six position
  breakpoints into a section that currently has one layout breakpoint, and
  would jump the composition at 1024px instead of gliding.
  **Reversal cost: six token values, or six media queries if the glide is ever
  judged wrong.**
- **A-05 · The Hero has no bottom padding and no `id`.** The following block
  owns the separation, which is the convention `app/layouts/default.vue`
  already states for the footer; and no nav item, footer item or menu item
  points at the Hero, so it needs no anchor target. **Now quantified**: the
  design's Hero section spans page y 0→940 desktop and 0→640 mobile, and the
  content stack ends at 776 / 550, so the block that follows owns a **164px /
  90px** gap on top of its own internal offset. Recorded here because
  Propósito's feature will need it. **Reversal cost: one token, one
  attribute.**
- **A-06 · The frozen `--text-link` and `--text-display` tokens are reused
  rather than reopened**, accepting the two small deviations recorded as D-04
  and D-05. The alternative — a breakpoint that changes a font weight — is
  what Article VII exists to prevent, and the `lead` role has the identical
  desktop/mobile weight split already resolved the same way (`rules.md` § R4).
  **Owner: Clau** (pick one value per role). **Reversal cost: one token value
  each, and free today: `LinkArrow` has no other consumer in the
  repository.**
- **A-07 · The CTA row's direction change uses the shell's existing
  breakpoint**, which feature 3 recorded as its own UNVERIFIED assumption
  (A-01: the design has frames at 390 and 1440 only and documents no
  breakpoint). Using a second, different breakpoint for the same unknown would
  be worse than reusing the first. **Owner: Clau.** **Reversal cost: one
  utility prefix, shared with the shell.**
- **A-08 · The Hero section is not an accessibility landmark and carries no
  accessible name.** It contains the page's `<h1>`, which is what conveys the
  structure; naming it would add a region to the landmark list that the design
  never asked for. **Reversal cost: one attribute plus one i18n key.**
- **A-09 · The subhead's 600px measure cap applies at both widths.** The
  design caps it at 600 on desktop; on mobile the column is 342px, so the same
  cap is inert there. One value, no breakpoint. **Reversal cost: one token.**
- **A-10 · The four strings the design shows on two lines each are allowed to
  re-wrap.** The design's 466px desktop body height corroborates the token
  mapping: the four children plus three gaps compute to **464.3px** when the
  headline and the subhead each take two lines, which is 1.7px from the frame.
  No manual line break is inserted to force that wrap — the measure caps do
  the work, and a hard break would be wrong in the other locale.
  **Reversal cost: none; it is an absence.**
- **A-13 · "Fixed" is implemented as `position: sticky`, not `position:
  fixed`.** Both pin the nav to the top while scrolling, which is what
  `ui-map.md` § 2 asks for and what the open decision it replaces literally
  asked ("si el nav es fijo al hacer scroll"). `sticky` keeps the nav **in
  normal flow**, and that matters twice: `<main>` needs no compensating top
  padding, and `rules.md` § R49's derivation — every section's top padding is
  `design y − nav height` — stays true instead of needing a duplicated
  nav-height token that could drift from the real nav. `fixed` would have
  required both. **Reversal cost: one utility, plus the offset token `fixed`
  would then need.** **Consequence either way**: the nav becomes a positioned
  element and needs an explicit level to paint above the Hero, which is
  `position: relative` and comes later in the document — hence
  `--layer-nav`. It is a **new** token; the three `--layer-*` levels the
  background depends on are not touched, and the nav is neither a section nor
  an ancestor of one, so `rules.md` §§ R28/R37 are unaffected.
- **A-14 · The route decides whether the CTA starts hidden; the Hero decides
  when it appears.** The shell already knows its route base name, so
  "the landing suppresses the nav CTA" is one comparison in
  `useShellNavigation`, evaluated identically on the server and on the client —
  which is what makes FR-045 (hidden in the HTML, no flash) and FR-044 (no fade
  on Nosotros) both mechanical rather than promised. A page **cannot** publish
  this to the layout instead: in SSR the layout renders before the page, the
  same reason feature 6 rejected a `provide`/`inject` glow registry (§ R28).
  If another route ever renders its own above-the-fold CTA, that comparison is
  the one place it is declared. **Reversal cost: one predicate.**
- **A-15 · The fade duration is a token with no design source.** `ui-map.md`
  § 2 says "fade" and specifies no timing, and no frame can draw one. Same
  situation and same treatment as the radar ping and the spotlight fade:
  `--duration-nav-cta-fade`, seeded at the spotlight's `0.2s` so the two
  chrome-level fades agree, marked **UNVERIFIED**. **Owner: Clau.**
  **Reversal cost: one token value.**
- **A-11 · Geometry is expressed in `rem`.** The rest of `global.css` is, and
  a visitor who enlarges text gets a Hero that scales with it. **Reversal
  cost: the new token values.**
- **A-12 · Verification of the paint order and of the scroll case uses the
  method `rules.md` § R44 records** — the DevTools protocol's device-metrics
  override to fix a real layout viewport, not a headless window size, which
  § R34 already showed does not fix the viewport and produces images that
  look like overflow. **Reversal cost: none; it is a procedure.**

## Files this feature modifies

Listed because an approved spec that quietly reaches into a shipped feature is
worse than one that says so. Everything below the line is feature 3's, `done`
and merged.

| File | Change | Owner today |
|---|---|---|
| `app/shared/logic/useNavCtaReveal.ts` | **new** — the shared flag, the observer, the derivation | this feature |
| `app/features/landing/**` | **new** — the Hero, plus one call attaching the sentinel to its root | this feature |
| `app/pages/index.vue` | rewritten as a thin wrapper | this feature |
| `app/assets/css/global.css` | + 12 Hero tokens, + `--layer-nav`, + `--duration-nav-cta-fade` | tokens |
| `i18n/locales/{es,en}.json` | + 5 keys | copy |
| — | — | — |
| `app/features/shell/ui/SiteNav.vue` | pinned nav; new `showCta` prop; fade classes; the no-scripting override | **feature 3** |
| `app/features/shell/logic/useShellNavigation.ts` | returns one more value, `showNavCta` | **feature 3** |
| `app/layouts/default.vue` | passes `:show-cta` through | **feature 3** |
| `app/features/shell/ui/SiteNav.{test,stories}.ts` | extended for the two states | **feature 3** |

`SiteNav`'s existing prop surface is **added to, never changed**: no existing
prop is renamed, retyped or removed, so nothing that composes it today breaks.

## Open questions for the leader — both ANSWERED 2026-09-07

Both were raised by this spec, both were answered from the `.pen` by the
leader the same day, and both are folded into the spec above. Kept here
because the second one changed a decision.

- **Q-A · What is the nav's height in the frames?** → **Answered: desktop
  1440×103, mobile 390×76**, plus the Hero section's own extent (page y 0→940
  and 0→640, with `02 Propósito` starting at 940 / 640). A-02 is now
  CONFIRMED, and the repository-token derivation it replaces agreed to within
  rounding.
- **Q-B · What are the three glow coordinates in the mobile frames `t5n4Sm`
  and `dwool`?** → **Answered, and the answer was that this spec's derivation
  was wrong.** The glows are repositioned per viewport, not merely resized. The
  measured centres are in A-04; the disproof is in D-06. This is the failure
  mode the question was written to catch, and it is the reason a spec asks the
  leader instead of inferring (`rules.md` § R32).

Nothing about this feature is UNVERIFIED any more except the two items feature
3 already carried as its own (the 1024px breakpoint and the 1440px content
cap, both Clau's — A-07).

## Out of Scope

- Any other section: Propósito, Servicios, Proyectos, the final CTA, and every
  section of the Nosotros page — including the *About* hero, which is a
  different composition at a different type size and belongs to the `about`
  module.
- Creating the `#contacto` target, the contact form, or the focus behaviour
  `ui-map.md` § 3 describes for it.
- Obtaining the Google Calendar URL (`decisions-open.md` #2 — Clau).
- Feature 7's cleanup: `SectionGlow.vue`'s stale doc comment, the dead `'920'`
  size variant and its `--spacing-glow-920` token.
- Bringing the shell's five existing links-to-missing-anchors into line with
  FR-012 (D-03 — Roberto).
- Making the nav sticky (`decisions-open.md` #5) or anything else about the
  shell's behaviour.
- Correcting `design-extract.md` or any other `docs/business/` file beyond
  appending to `rules.md`.
- End-to-end tests. Constitution Article X puts them out of scope for this
  repository.

## Dependencies

- **Feature 2 (`done`)** — `Pill`, `BotonPrimario` and `LinkArrow`, all three
  consumed through their existing prop contracts, none of them changed.
- **Feature 5 (`done`)** — `SectionGlow`, consumed unchanged; all three of the
  Hero's colour+opacity+size combinations are already in its union.
- **Feature 6 (`done`)** — `SectionBackdrop`, the glow contribution mechanism,
  the dot sheet, the ink base, and the section contract this feature is the
  first to be bound by (its A-04 and A-13).
- **Feature 8 (`done`)** — the cursor spotlight, whose two declared limits
  this feature closes, and `--layer-spotlight`.
- **Feature 3 (`done`)** — the layout and `<main>` wrapper the Hero renders
  inside, the `lg` breakpoint it borrows, and `FooterColumn.vue`'s precedent
  for a destination that does not exist.
- **Feature 1 (`done`)** — the ramps and the fluid scale in
  `app/assets/css/global.css`, which this feature extends and does not retune.
- **`docs/business/landing/ui-map.md` § 2** — the pinned nav and the CTA
  reveal, decided by Roberto on 2026-09-07. **That file is the source and is
  read-only to every agent**; a contradiction found in it is reported, never
  edited (see D-07).
- **`docs/business/landing/ui-map.md` § 3** — the Hero's behaviour, both
  blockers, and the "loose text, never a box" rule.
- **`docs/business/landing/design-extract.md` §§ 3, 4, 7, 9, 10** — the Pill,
  the button variants, the secondary CTA's four instances, the type scale and
  the glow table.
- **`docs/business/landing/content.md`** — the approved headline, subhead and
  CTA copy.
- **`docs/business/rules.md` §§ R4, R18, R23, R27, R28, R29, R32, R34, R36,
  R37, R38, R39, R44** — the tracking convention, the `@theme inline` trap,
  the no-Nuxt-composables-in-`ui/` corollary, the read-locales-from-disk rule,
  the paint-order contract and its renumbering, the section-relative rule, the
  `.pen`-wins rule, the two measurement-method rules, the closed glow
  namespace and the include-a-new-test-directory procedure.
