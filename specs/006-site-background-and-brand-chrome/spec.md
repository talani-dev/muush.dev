# Feature Specification: Site background and brand chrome

**Feature Branch**: `feat/site-background-and-brand-chrome`
**Created**: 2026-09-07
**Status**: Draft
**Input**: Feature id 6 in `feature_list.json` (`site_background_and_brand_chrome`, `"sdd": true`). Paint the site background (dotted paper + section glows) in the layout so both pages and both locales inherit it, replace the wrong hand-written font faces with real self-hosted brand type, and replace the stock Nuxt favicon with the muush isotipo — three chrome foundations no feature owned, grouped into one review cycle.

## Overview

Everything the site has shipped so far is either invisible (tokens, fonts that
never loaded) or floating on flat black. This feature closes the three gaps
that make the site look like a scaffold instead of the design:

1. **The background.** The design is not a dark page — it is a four-layer
   stack: an ink base, a field of radial glows, a sheet of dotted paper, and
   the content on top. Today only the first layer exists. `SectionGlow.vue`
   was built in feature 5 and has never been placed; the dotted paper has no
   component at all. This feature builds the dot layer, composes the stack in
   the layout, and defines **how a section contributes its own glows** — the
   requirement Roberto stated on 2026-09-07 and the scope flag feature 3 left
   open as A-03.

2. **The type.** `app/assets/css/global.css` declares four `@font-face` blocks
   pointing at files that do not exist, in weights the design never uses
   (Poppins 400/700, Instrument Sans 400/700 — the branding book asks for
   Poppins 600 and Instrument Sans 400/500/600). The whole site therefore
   renders in the system fallback, and every missing file becomes a
   `[VUE_ROUTER_R0004]` warning in `pnpm dev`. The site has never once been
   seen in its own typefaces.

3. **The mark.** `public/favicon.svg` and `public/favicon.ico` are still the
   Nuxt logo, on the site and in the catalogue. There is no favicon
   configuration anywhere — Nuxt is serving `public/favicon.ico` by
   convention.

They are one feature because they share one review cycle: all three are chrome
that no page owns, none is large enough to justify its own SDD pass, and all
three are judged the same way — by looking at a rendered page.

### What this feature is not

It does **not** rebuild, refactor or re-specify `SectionGlow.vue`. That
component is `done` (feature 5), its discriminated-union API is fixed, and
this feature is a **consumer** of it. Not one line of it changes.

It also does not place the 21 glows at their design coordinates. Those
coordinates belong to sections that do not exist yet (Hero, Propósito,
Servicios, Proyectos, CTA on Landing; Hero, Equipo, Network, Work on
Nosotros). What ships here is the two page-wide layers plus the mechanism a
section will use — proven in the catalogue against the real Hero glow triplet,
not asserted. See A-10.

### Source of truth and evidence discipline

Every value in this spec is **CONFIRMED** against
`docs/business/landing/design-extract.md` and `docs/business/branding.md`,
**DERIVED** with the arithmetic shown, or recorded below as an **ASSUMPTION**
with its owner and reversal cost. The `.pen` file is not opened — the Pencil
bridge does not exist outside the main interactive session (Constitution,
*Development Workflow*).

The leader supplied a reading of frame `SdEJx` ("Landing ES · v4 (radiales)",
1440×5060, fill `#262626`) taken from the design file on 2026-09-07. Where
that reading and `design-extract.md` disagree, **the design file wins and the
document is what gets corrected** — Roberto's decision, 2026-09-07: the `.pen`
is the most up-to-date artifact and the source of truth for anything visual,
and every file under `docs/business/` is derived from it and can lag. The
disagreement is recorded (see D-01 below) and is `rules.md` § R32.

This has an operational edge, because the Pencil bridge exists only in the
main interactive session: a subagent **cannot** go and check the source of
truth itself. Extracting values from the `.pen` is therefore the leader's job,
handed down in the task prompt — as happened here. A spec that quietly prefers
a `docs/business/` value over a leader-supplied frame reading reintroduces
exactly the bug this paragraph exists to prevent. If a value is missing, the
answer is to ask the leader, never to fall back to the document.

### Measurement provenance

| Group | Source | Note |
|---|---|---|
| Layer order: base → glows → dotted paper → content | Frame `SdEJx` child order, bottom to top | CONFIRMED |
| Base fill `#262626` = `ink-500` | `SdEJx` child `wybKV` "BG · base", 1440×5060 | CONFIRMED, matches `branding.md` ramp |
| Dot recipe: 2.5px dot, 24px step, `#D9D9D91F` | `design-extract.md` § 10 · *DottedPaper*, and `SdEJx` child `QYqLM` / component `yGTC1` | CONFIRMED by both sources |
| Dot tile arithmetic: 288 = 12 × 24; 90 tiles = 5 cols × 18 rows over 1440×5060 | DERIVED from the two above | Confirms the tile is an authoring artifact, not a unit of layout |
| `#D9D9D9` = `ink-100` exactly; alpha `1F` = 31/255 = 12.16% | DERIVED from `branding.md` ramp | See A-02 |
| Eleven Landing glow colour+opacity+size triples | `SdEJx` children, cross-checked against `design-extract.md` § 10 | CONFIRMED — all eleven match to the percent |
| A twelfth Landing glow (`Glow origen`) | `design-extract.md` § 10 only — **not in the frame** | **DISCREPANCY D-01** — stale documentation; Landing has eleven |
| Parent frame `clip: true`; several glows at negative x | `SdEJx` | CONFIRMED — drives FR-007 |
| Type: Poppins 600 (wordmark only); Instrument Sans 400/500/600 | `branding.md` § *Tipografía* | CONFIRMED |
| No element uses weight 700 | Verified in the repository: the only `font-weight: 700` in `global.css` is inside the two `@font-face` blocks being deleted; the 32 type tokens use 400, 500 and 600 only | CONFIRMED |
| Poppins is used by exactly one component (`Wordmark`), Instrument Sans by everything else | Verified in the repository (`font-poppins` / `font-instrument` utilities) | CONFIRMED |
| Isotipo geometry and the square avatar framing | `app/assets/logo/README.md` and `branding.md` § *Isotipo* | CONFIRMED |
| Footer is an opaque `ink-500` block | `design-extract.md` § 9.bis · *Footer — contenedor* | CONFIRMED — see A-12 |
| `@nuxt/fonts` 0.14.0 configuration surface | Read from the published package's type declarations on 2026-09-07 | CONFIRMED, see `research.md` |

### Discrepancies

- **D-01 · The document lists a twelfth Landing glow the design file does not
  contain.** The `SdEJx` child reading names eleven radial frames (Hero ×3,
  Propósito ×2, Servicios ×2, Proyectos ×1, CTA ×3), and all eleven match
  `design-extract.md` § 10 to the percent. § 10 additionally records a twelfth,
  `Glow origen` (red-400, 12%, 920px, desktop only), described there as the
  anchor of the Propósito constellation. **The design file wins: Landing has
  eleven glows, and `Glow origen` is stale documentation, not a missing node**
  (Roberto, 2026-09-07 — see § *Source of truth* and `rules.md` § R32).
  **Action: `design-extract.md` § 10 gets corrected** — the total also drops
  from 22 glows to 21 across both pages, and the "Observaciones" bullet about
  `Glow origen` goes with it. **Owner: Clau.** **No impact on this feature**,
  which places no glows (A-10); it matters to whoever builds Propósito, who
  must build eleven and must not resurrect the twelfth from the document.

  **Two downstream consequences, flagged and deliberately not fixed here.**
  `app/shared/ui/SectionGlow.vue` carries the same stale count in its doc
  comment ("22 of them, 12 on Landing and 10 on Nosotros"), and its `GlowSize`
  union still offers `'920'` — the desktop-only size that existed for
  `Glow origen` alone — backed by a `--spacing-glow-920` token in
  `global.css`. If `Glow origen` is not real, that variant and that token are
  dead code (Article VIII). **This feature still does not touch
  `SectionGlow.vue`**: FR-011 and SC-006 stand, and quietly widening this
  feature's diff to chase a documentation correction is how a one-line fix
  becomes a re-spec of feature 5. The cleanup belongs to whoever builds
  Propósito, or to a small follow-up once Clau has corrected § 10.
  **Owner: Roberto** (scheduling).

## Clarifications

### Session 2026-09-07

Three questions had no answer in any document and would each have blocked
implementation. All three are resolved here rather than deferred, per the
leader's instruction; each carries an owner and a reversal cost.

- **Q**: How does a section contribute its glows to a background layer that
  sits *underneath* a page-wide dot sheet, without the layer holding a list of
  all 21? → **A**: **The section renders its own glows, inside its own
  markup.** The layout establishes one page-level stacking context and paints
  the dot sheet page-wide; a section's glow group declares itself as a
  below-content layer, so it lands *under* the dot sheet even though it is
  written *inside* the section. No registry, no route metadata, no client
  state, no shared list. Adding a section adds glows in exactly one file — the
  section's own. *(Rejected alternatives and the paint-order reasoning are in
  `research.md`; the constraints this places on future sections are A-04.)*
- **Q**: Once the hand-written font faces are deleted, where does the
  **Storybook catalogue** get real type from — it runs Vite outside Nuxt and
  therefore never sees the Nuxt fonts module? → **A**: the catalogue loads the
  two families from the Google Fonts stylesheet through a `.storybook`-only
  head snippet. The deployed site remains fully self-hosted; only the local
  catalogue makes an external request. *(See A-05 — this is the one decision
  in this feature that a reviewer might want reversed, and reversing it costs
  one file.)*
- **Q**: `favicon.ico` must stop being the Nuxt logo — replaced with what,
  given the repository has no image rasterizer and adding one is a new build
  dependency for a 16×16 image? → **A**: **delete it.** The adaptive SVG
  becomes the only icon and is declared explicitly in head configuration
  rather than relying on Nuxt's `public/favicon.ico` convention. *(See A-06.)*

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The site looks like the design instead of a scaffold (Priority: P1)

A visitor opens `/es/` or `/en/`. Instead of flat black behind the nav, the
page has depth: a faint field of dots across the whole scroll height, and —
wherever a section has contributed them — soft radial glows blooming behind
the content from underneath the dots. Scrolling to the footer, the dots run
the full height of the page. Nothing about the background can be clicked,
selected, focused, or heard by a screen reader, and no horizontal scrollbar
ever appears, even though some glows are drawn far off the left edge.

**Why this priority**: it is the reason the feature exists, and it is the
layer every future section is composed on top of. Reviewing a section against
flat black is reviewing it in a context it will never ship in — the objection
feature 5's own description raised and feature 3 deferred as A-03.

**Independent Test**: generate the site, open both locales, scroll each page
top to bottom at 390px and 1440px, and confirm the dot field covers the full
page, the layer order reads base → glows → dots → content, and no scrollbar or
pointer behaviour changed.

**Acceptance Scenarios**:

1. **Given** the Spanish landing page, **When** it is loaded, **Then** the
   dotted paper covers the entire scrollable page, not just the first
   viewport.
2. **Given** a section that has contributed glows, **When** the page renders,
   **Then** those glows appear behind the dots and behind the section's
   content, never in front of either.
3. **Given** any page, **When** the visitor tries to select text or click
   where only background is visible, **Then** the background neither responds
   nor blocks the element beneath the pointer.
4. **Given** a screen reader, **When** it walks the page, **Then** no
   background element is announced.
5. **Given** a glow drawn beyond the left or right edge of the page,
   **When** the page renders, **Then** no horizontal scrollbar appears and no
   content is clipped.
6. **Given** the English pages, **When** they are loaded, **Then** the
   background is identical to the Spanish ones — the layer is locale-blind.

---

### User Story 2 - The site is finally set in its own typefaces (Priority: P1)

A visitor sees the wordmark in Poppins SemiBold and every other word in
Instrument Sans at the weight the design specifies, delivered from the site's
own domain. A developer running `pnpm dev` sees a clean console instead of a
warning per missing font file.

**Why this priority**: every measurement in the type scale — the −3% tracking,
the `clamp()` sizes, the 500-vs-600 distinctions the design draws — is
currently being applied to the wrong typeface. Every component reviewed so
far was reviewed in a fallback font. It is tied with US1 because a background
under fallback type is still not the design.

**Independent Test**: generate the site, load a page with the network panel
open, and confirm the two families are requested from the site's own origin
and from nowhere else; then run `pnpm dev` and confirm no `[VUE_ROUTER_R0004]`
warning names a font path.

**Acceptance Scenarios**:

1. **Given** the generated site, **When** a page loads, **Then** Poppins 600
   and Instrument Sans 400, 500 and 600 are all available and no text falls
   back to a system font.
2. **Given** the generated site, **When** a page loads, **Then** no request
   leaves for `fonts.googleapis.com` or `fonts.gstatic.com`.
3. **Given** `pnpm dev`, **When** the app starts and a page is opened,
   **Then** the console contains no `[VUE_ROUTER_R0004]` warning for a
   `/fonts/*` path.
4. **Given** any heading, label or button, **When** it renders, **Then** its
   weight comes from a real font face and never from browser-synthesised
   bolding.
5. **Given** the Storybook catalogue, **When** any story renders, **Then** it
   shows the same two families as the site, so a component is reviewed in the
   type it will ship in.

---

### User Story 3 - The tab carries the muush mark (Priority: P2)

A visitor with a dozen tabs open recognises muush by its isotipo — dark stroke
on a light browser chrome, light stroke on a dark one, red dot in both. The
same mark appears on the catalogue's tab.

**Why this priority**: it is real brand damage (the site currently advertises
Nuxt) but it changes nothing structural, and the site is not yet public.

**Independent Test**: load the generated site in light and dark OS
appearance and confirm the tab icon is the muush isotipo, legible in both,
with no Nuxt asset left anywhere under `public/`.

**Acceptance Scenarios**:

1. **Given** a browser in light appearance, **When** any page of the site is
   open, **Then** the tab shows the isotipo with an ink-500 stroke and a
   red-400 dot.
2. **Given** a browser in dark appearance, **When** any page is open,
   **Then** the same mark appears with a bone-100 stroke, the dot still
   red-400.
3. **Given** the icon rendered into a square tab, **When** it is compared to
   the brand asset, **Then** it is centred and undistorted — never stretched
   to fill a square from a 70.5×39.5 artboard.
4. **Given** the catalogue, **When** it is opened, **Then** its tab shows the
   muush mark, not the Storybook or Nuxt default.
5. **Given** the deployed file set, **When** `public/` is inspected, **Then**
   no stock Nuxt image remains.

---

### User Story 4 - A future section can add its glows without touching shared code (Priority: P2)

The developer building the Hero section places its three glows — `Hero · foco`,
`Hero · wine`, `Hero · cierre` — while writing the Hero. They do not open the
layout, do not edit a central list, and do not register anything. When the
Propósito section is built later, its two glows are added the same way, and
the Hero's are unaffected.

**Why this priority**: it is Roberto's explicit requirement, and getting it
wrong is expensive later — a hardcoded list of 22 in the layout would be
edited by five future features in turn, each one able to break the other four.
It is P2 only because it is verified through US1's rendering rather than on
its own.

**Independent Test**: in the catalogue, compose the background with the real
Hero glow triplet contributed by a stand-in section, and confirm the stack
order holds without any change to the layout or to `SectionGlow.vue`.

**Acceptance Scenarios**:

1. **Given** a section that declares glows, **When** it is added to a page,
   **Then** no file outside that section is edited to make its glows appear.
2. **Given** two sections that both declare glows, **When** the page renders,
   **Then** both sets appear, each positioned relative to its own section, and
   neither displaces the other.
3. **Given** a section that declares no glows, **When** the page renders,
   **Then** the base and the dots still cover it — a section is never
   responsible for the page-wide layers.
4. **Given** `SectionGlow.vue`, **When** this feature is complete, **Then**
   its prop contract is byte-identical to what feature 5 shipped.

---

### Edge Cases

- **A very long page.** The dot field and the glow layer must span the whole
  document height, not the viewport — the Landing frame is 5060px tall and the
  real page will differ. A layer sized to the viewport would leave the bottom
  of the page bare.
- **A viewport wider than the 1440px frame.** Content caps at 1440px and
  centres (feature 3, A-02), but the background layers are full-bleed. The dot
  grid keeps its 24px step rather than stretching.
- **Glows drawn off-canvas.** Several sit at negative x in the design and the
  parent frame is clipped. Horizontal overflow must be clipped without
  creating a scroll container and without clipping content vertically.
- **The mobile menu is open.** The menu's glass panel blurs whatever is behind
  it; with the background painted, that is now the dots and glows rather than
  flat ink. The menu must still sit above everything and the background must
  remain inert while the rest of the page is inert.
- **A future section that transforms itself** (a carousel, a scroll effect).
  Certain CSS properties on a section would trap its glows above the dot
  sheet. This is a real constraint of the chosen mechanism and must be
  documented where a section author will read it — see A-04.
- **The footer.** It is an opaque `ink-500` block in the design, so the
  background does not show through it. That is the design, not a bug (A-12).
- **A build with no network.** The font binaries are fetched at build time. An
  offline build with a cold cache produces a site without embedded faces —
  see A-09.
- **A browser that ignores media queries inside SVG icons.** The favicon must
  still be legible; the non-matching default is the light-appearance stroke
  (A-08).
- **Printing a page.** The background is decorative; nothing depends on it
  being printed, and nothing breaks if a browser drops it.
- **A visitor who enlarges text.** The dot texture and the layer stack must
  not break when the root font size changes (A-03).

## Requirements *(mandatory)*

### Functional Requirements — the background

- **FR-001**: The dot layer MUST render the design's dotted paper as **one
  repeating background on a single element** — 2.5px dots on a 24px grid — and
  MUST NOT reproduce the design file's 144-ellipses-per-tile, 90-tiles-per-page
  construction, which is a canvas authoring artifact.
- **FR-002**: The dot layer MUST NOT contain a colour or size literal. Dot
  size, grid step and dot colour MUST each resolve through a named token added
  to `app/assets/css/global.css` (Constitution Article VII).
- **FR-003**: Every background layer MUST be decorative and inert: hidden from
  assistive technology, non-interactive to the pointer, and never focusable.
- **FR-004**: The layout MUST paint the ink base and the dot layer for every
  page, so both Landing and Nosotros, in both locales, inherit them without
  composing anything themselves.
- **FR-005**: The rendered stacking order MUST be, bottom to top: ink-500
  base → section glows → dotted paper → page content. This is the child order
  of frame `SdEJx` and is the single visual requirement the whole background
  is judged against.
- **FR-006**: A section MUST be able to contribute its own glows **without any
  edit to the layout, to the dot layer, or to any shared list**. Two sections
  contributing glows MUST NOT interfere with each other, and a section
  contributing none MUST still receive the page-wide layers.
- **FR-007**: Background layers MUST NOT produce horizontal overflow or a
  horizontal scrollbar, MUST NOT become a scroll container, and MUST NOT clip
  page content in either axis.
- **FR-008**: With the mobile menu open, the menu MUST still render above all
  background layers and its glass MUST still blur them. The background MUST
  NOT be repainted inside the menu (feature 3, A-03: the frame's intent is that
  the menu blurs the page, not that it redraws it).
- **FR-009**: The background MUST require no client-side JavaScript: it MUST
  be fully present in the prerendered HTML and CSS, and MUST look identical
  with scripting disabled (`ui-map.md` § 10 lists the dotted paper as
  JS-independent).
- **FR-010**: The comment at `app/layouts/default.vue:16-20`, which states the
  dotted paper and glows are deliberately unpainted, MUST be rewritten to
  describe what the layout now does. Feature 3's scope flag A-03 MUST be
  recorded as resolved.
- **FR-011**: `app/shared/ui/SectionGlow.vue` MUST NOT change. Its props, its
  types and its rendered markup are fixed by feature 5 and are consumed as-is.
- **FR-012**: The existing shell layout MUST be unaffected: nav, footer, page
  gutter, content cap and the mobile menu keep their current geometry and
  their current tests.

### Functional Requirements — the type

- **FR-013**: The four hand-written `@font-face` blocks and the stale TODO
  comment above them MUST be removed from `app/assets/css/global.css`, along
  with the empty `public/fonts/` directory they pointed into.
- **FR-014**: The site MUST make Poppins 600 and Instrument Sans 400, 500 and
  600 available to the browser — the exact set `branding.md` § *Tipografía*
  specifies, and no weight the design does not use.
- **FR-015**: The font binaries MUST be served from the site's own origin in
  the generated output. **No request may reach `fonts.googleapis.com` or
  `fonts.gstatic.com` at runtime** (Constitution Article IV: the deployable
  artifact is static files with no runtime dependency).
- **FR-016**: `pnpm dev` MUST produce zero `[VUE_ROUTER_R0004]` warnings for
  `/fonts/*` paths.
- **FR-017**: No element may render a browser-synthesised weight. Every weight
  named by a type token MUST resolve to a real face.
- **FR-018**: The type tokens themselves MUST NOT change. This feature makes
  the existing scale render correctly; it does not retune it.
- **FR-019**: The Storybook catalogue MUST render the same two families as the
  site, so a component is reviewed in the type it ships in (Constitution
  Article X — stories are the review surface).
- **FR-020**: Adding the font pipeline MUST NOT introduce a server runtime, a
  server route, or any request-time compute (Constitution Article IV). A
  build-time network fetch is acceptable and MUST be stated as such in the
  plan.

### Functional Requirements — the mark

- **FR-021**: `public/favicon.svg` MUST carry the muush isotipo geometry
  recorded in `app/assets/logo/README.md` (`circle cx=21 cy=45 r=6.5`;
  `path M21 72 a17 17 0 0 1 34 0 a12 12 0 0 1 24 0`; `stroke-width 12`;
  `stroke-linecap round`).
- **FR-022**: The icon MUST render **centred and undistorted in a square**.
  The brand artboard is 70.5×39.5; a favicon is square, so the spec REQUIRES an
  explicit square framing rather than an aspect-ratio stretch.
- **FR-023**: The icon MUST adapt to the browser's colour scheme: ink-500
  stroke by default, bone-100 stroke under `prefers-color-scheme: dark`, with
  the dot red-400 in both. It MUST remain legible in a browser that ignores
  the query.
- **FR-024**: No stock Nuxt asset may remain under `public/`.
- **FR-025**: The site MUST declare its icon explicitly for every page and
  both locales, rather than depending on the `public/favicon.ico` convention
  that currently supplies the Nuxt logo.
- **FR-026**: The catalogue MUST show the muush mark in its own browser tab,
  configured under `.storybook/`.

### Functional Requirements — documentation and quality gates

- **FR-027**: `docs/business/branding.md` lines 63-64 MUST be corrected. They
  claim the `@font-face` declarations already match the branding book and cite
  `src/styles/global.css`; **both halves are false** — the declared weights
  differ from the book and the file lives at `app/assets/css/global.css`. The
  correction is appended in place, dated, and does not rewrite surrounding
  content.
- **FR-028**: Rules discovered while specifying and implementing MUST be
  appended to `docs/business/rules.md` — never overwriting it — each citing
  this feature.
- **FR-029**: The dot layer MUST have a Storybook story, and there MUST be a
  story showing the composed background stack against real content, with real
  glows, so the layer order is reviewable (Constitution Article X).
- **FR-030**: The dot layer MUST have a component test covering its
  token-to-output mapping, and all existing tests MUST stay green.
- **FR-031**: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate` and
  `pnpm storybook:build` MUST all pass.

### Key Entities

- **Background stack**: the four ordered layers of the page — ink base,
  section glows, dotted paper, content. Its identity is its order; every
  requirement about it is a statement about what sits above what.
- **Section glow group**: the set of glows one section contributes, positioned
  relative to that section rather than to the page, so it survives content
  reflow. The design's glows are grouped by section already (`Hero · foco`,
  `Propósito · wine`, `CTA · cierre`), which is why the section is the natural
  unit.
- **Dot paper tokens**: the three named values the dot layer resolves —
  colour, dot size, grid step — living with the rest of the design tokens.
- **Brand font set**: Poppins 600 and Instrument Sans 400/500/600. The set is
  closed: a weight not in it is a bug, not an option.
- **Site icon**: one adaptive vector mark, the only favicon the site ships.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On every generated page, in both locales, the dot field covers
  100% of the scrollable page height and width — verified at the top, middle
  and bottom of each page at 390px and 1440px.
- **SC-002**: In every rendering that contains glows, all four layers are
  visible simultaneously and read in the order base → glows → dots → content.
  Zero renderings show a glow above the dots or the dots above content.
- **SC-003**: Zero background elements are reachable by keyboard, by pointer,
  or by an accessibility tree walk.
- **SC-004**: Zero horizontal scrollbars appear at any viewport width from
  320px to 2560px, on either page.
- **SC-005**: Adding a section's glows requires an edit to exactly **one**
  file — that section's own — and zero edits to shared or layout files.
- **SC-006**: `SectionGlow.vue` shows zero lines changed in the feature's
  diff.
- **SC-007**: A page load of the generated site issues **zero** requests to a
  third-party domain, and all font binaries come from the site's own origin.
- **SC-008**: 100% of the weights the type tokens name (400, 500, 600 for
  Instrument Sans; 600 for Poppins) resolve to a real face; zero elements
  render synthesised bold.
- **SC-009**: `pnpm dev` emits zero `[VUE_ROUTER_R0004]` warnings for font
  paths, down from one per missing file.
- **SC-010**: The tab icon is the muush isotipo in both light and dark browser
  appearance, on the site and in the catalogue, and zero Nuxt-branded files
  remain under `public/`.
- **SC-011**: The catalogue renders every existing story in Poppins and
  Instrument Sans rather than a system fallback.
- **SC-012**: All five quality gates pass, and the existing shell, i18n-parity
  and static-output tests stay green with zero modifications made to
  accommodate this feature.

## Assumptions

Each assumption is a decision taken because no source documents the value, or
because two sources disagree. **A-04, A-05 and A-06 are the three the approval
gate most needs to look at.**

- **A-01 · Landing has eleven glows; the document's twelfth is stale** — see
  D-01. This is not a judgement call any more: the design file wins over the
  document by decision (Roberto, 2026-09-07), so `design-extract.md` § 10 is
  what gets corrected. No consequence for this feature; a consequence for
  whoever builds Propósito. **Owner: Clau** (the document fix).
  **Reversal cost: none here.**
- **A-02 · The dot colour is `ink-100` at 12%.** The design writes
  `#D9D9D91F`. `#D9D9D9` is exactly `ink-100`; `1F` is 12.16%, which rounds to
  12%. Implementing it as a token composed from the ramp rather than as a
  literal follows the precedent of `rules.md` § R2 and § R11 (system token
  over off-by-a-hair design literal). Worst-case difference: 0.16% of alpha on
  a 2.5px dot. **Reversal cost: one token value.**
- **A-03 · Dot geometry is expressed in `rem`, not `px`.** The rest of
  `global.css` is in `rem`, and at the default root size the two are identical.
  Consequence: a visitor who enlarges text also enlarges the dot texture
  proportionally, which keeps the page coherent rather than leaving a
  fine-grained texture behind large type. **Reversal cost: two token values.**
- **A-04 · The chosen mechanism constrains future sections — UNVERIFIED
  against any future section, because none exists.** For a section's glows to
  land beneath the page-wide dot sheet, the elements between that glow group
  and the page root must not create an intervening compositing/stacking layer,
  and a section must not paint an opaque background of its own. Neither
  restriction conflicts with anything in the design as recorded (sections are
  transparent; the only opaque block is the footer). The restriction MUST be
  documented in the component that establishes the contract, in the plan, and
  in `docs/business/rules.md`, because the failure mode is silent: the glows
  simply move above the dots. **Owner: Roberto (accepting the constraint).**
  **Reversal cost: if a future section genuinely needs a transform, that
  section's glows move to the page level — a change to that section, not to
  the layer.**
- **A-05 · The catalogue loads its type from Google's CDN; the site does
  not.** Storybook runs Vite outside Nuxt (`rules.md` §§ R19, R23), so it
  never sees the Nuxt font pipeline, and after FR-013 there are no
  hand-written faces left for it to use. The alternatives were considered:
  committing the two binaries under `public/` (duplicates what the build
  already downloads, and puts two copies of the same font in the repository)
  or leaving the catalogue in fallback type (defeats Article X — a component
  reviewed in the wrong typeface has not been reviewed). **Consequence: the
  local catalogue makes an external request and needs network on first load;
  the deployed site does not, and Article IV is about the deployed artifact.**
  **Owner: Roberto.** **Reversal cost: one file.**
- **A-06 · `favicon.ico` is deleted rather than regenerated.** Producing a
  real `.ico` requires a rasterizer this repository does not have, and adding
  one is a new build dependency for a legacy format. The adaptive SVG becomes
  the only icon. **Consequence: browsers with no SVG-favicon support show no
  icon rather than a wrong one, and requests to `/favicon.ico` 404 harmlessly.**
  **Owner: Roberto.** **Reversal cost: one committed binary plus one link
  declaration, whenever someone wants it.**
- **A-07 · The square framing is the one `branding.md` already documents.**
  § *Isotipo* records "viewBox avatar/favicon: `0 0 100 100` con `transform
  translate(3,-8)`" — i.e. the brand book already answers FR-022. DERIVED
  check: with stroke 12, the art spans x 15→85 and y 38.5→78; after the
  translate that is x 18→88 and y 30.5→70 inside a 100×100 box, which is
  centred vertically to within half a unit. This is the official avatar
  framing, not a new composition. **Reversal cost: two numbers in one file.**
- **A-08 · `prefers-color-scheme` inside an SVG favicon is honoured by
  Firefox and Chromium and not by Safari — UNVERIFIED in this environment.**
  The mitigation is structural, not conditional: the default (non-matching)
  colours are the light-appearance ones, so a browser that ignores the query
  still shows a correct, legible mark. The implementer MUST look at the tab in
  at least one browser rather than assert it from the file. **Reversal cost:
  none — the fallback is the file itself.**
- **A-09 · The build gains a network dependency.** Font binaries are fetched
  at build time and cached; a cold, offline build produces a site with no
  embedded faces. This is a deliberate trade for not committing binaries and
  not serving from a CDN at runtime, and it MUST be called out in the plan
  along with the new package it adds. **Owner: Roberto.** **Reversal cost:
  commit the binaries and declare the faces by hand — i.e. return to today's
  approach with the right weights.**
- **A-10 · No glow is placed on any page in this feature.** Every glow's
  position in the design is an absolute offset inside a 1440×5060 page frame
  whose sections do not exist. Placing them now would mean inventing
  coordinates against content that is not built, and every one of them would
  be re-derived by the section feature anyway. **What ships is the two
  page-wide layers plus the contribution mechanism, demonstrated in the
  catalogue with the real Hero triplet.** **Consequence: until the first
  section lands, the site shows base + dots and no glow.** **Owner: Roberto
  (scope).** **Reversal cost: none — placing glows is additive by
  construction.**
- **A-11 · Character coverage is Latin and Latin Extended.** The site ships
  Spanish and English only; no other script appears in any locale file. Any
  broader coverage is bytes no visitor reads. **Reversal cost: one config
  value.**
- **A-12 · The footer stays opaque and hides the background behind it.**
  `design-extract.md` § 9.bis gives the footer a solid `ink-500` fill, and in
  the frame the footer is a content section above the dotted paper. A reviewer
  seeing no dots inside the footer is seeing the design. **Reversal cost:
  one class, if Clau ever says otherwise.**
- **A-13 · Section glows are positioned relative to their section, not to the
  page.** The design's coordinates are page-absolute, but a real page's
  section heights depend on content and locale, so page-absolute offsets would
  drift the moment any copy changed. Converting a design offset into a
  section-relative one is therefore work each section feature owns.
  **Reversal cost: none in this feature; it is a rule recorded for the next
  ones.**

## Out of Scope

- Placing any of the 21 glows on a real page (A-10), and deriving their
  section-relative offsets (A-13).
- Building any section: Hero, Propósito, Servicios, Proyectos, CTA, Equipo,
  Network, Work with muush.
- The cursor spotlight effect (`ui-map.md` § 10) — it is a JavaScript effect
  over this background, and a separate decision.
- Any change to `SectionGlow.vue`, to the type scale, or to the nine existing
  primitives.
- An `.ico`, an `apple-touch-icon`, a web app manifest, or Open Graph imagery
  (A-06 covers the first; the rest were never requested).
- Correcting `design-extract.md` § 10 for D-01 — removing the stale twelfth
  glow and re-totalling 22 → 21 is Clau's, and touching `docs/business/`
  content beyond `rules.md` is outside a spec cycle's write scope anyway.
- End-to-end tests. Constitution Article X puts them out of scope for this
  repository.

## Dependencies

- **Feature 5 (`done`)** — `app/shared/ui/SectionGlow.vue`, consumed unchanged
  through its existing discriminated-union contract.
- **Feature 3 (`done`)** — `app/layouts/default.vue`, the mobile menu whose
  glass now blurs a real background, and the A-03 scope flag this feature
  closes.
- **Feature 1 (`done`)** — the ramps and the token file this feature extends,
  and `app/assets/logo/README.md` for the isotipo geometry.
- **`docs/business/landing/design-extract.md` §§ 9.bis, 10** — the dot recipe,
  the glow table and the footer's opacity.
- **`docs/business/branding.md`** §§ *Tipografía*, *Isotipo* — the font set and
  the favicon framing; also the file this feature corrects (FR-027).
- **`docs/business/rules.md` §§ R2, R11, R18, R19, R23** — the token-rounding
  precedent, the `@theme inline` trap that governs any hand-written CSS, and
  the two rules explaining why the catalogue needs everything declared twice.
