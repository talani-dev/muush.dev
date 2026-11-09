# Feature Specification: Muush 1.0 secondary pages — Nosotros, Preguntas and 404

**Feature Branch**: `feat/v2-pages` (cut from `muush-v2`, merges back into `muush-v2` only, never into `master`)
**Feature**: 46 `m1_secondary_pages` · `sdd: true` · depends on 45 (done)
**Created**: 2026-11-02
**Status**: Done (approved by Roberto 2026-11-02; review-46 APPROVED, § Re-review 1)
**Input**: User description: "Feature 46 `m1_secondary_pages`: rebuild Nosotros (/es/nosotros ↔ /en/about) with the Muush 1.0 design (hero over listón, 'Cómo se arma' three cards Equipo base / Talent pool / Aliados, 'Dónde estamos' reusing the feature 44 map, legend and mobile America/Europa tabs, 'Trabaja con muush' over listón holding the feature 45 v2 application form with the 'Áreas que sumamos' list); add a new indexed Preguntas page (/es/preguntas ↔ /en/faq; 'En construcción 🚧' with CTAs Diagnóstico gratis / Agenda una llamada over acanalado); restyle the 404 to the v2 design keeping all feature 36/39 behaviour. Both locales. Retire the v1 About sections and the v1 404 body. Header link bar stays Inicio · Servicios · Nosotros. Every v2 pill above a heading uses pill-aire." (full text in `feature_list.json`, id 46)

> The feature name `m1_secondary_pages` is a historical identifier. Nothing this
> feature creates (file, component, token, utility, i18n key, story) carries a
> version marker (Constitution 2.1.2, Article VII).

## Context

Features 42–45 built the v2 vocabulary (tokens, glass, buttons, pill with radar
ping, shader backgrounds, two-tone headings), the v2 shell, the full v2 home
(with the shared world map) and the v2 forms. Nosotros is the last v1 page: it
still shows the v1 About hero and the v1 "Work with muush" section, with only
the form column swapped for the v2 application form (feature 45, Roberto
2026-11-02, "the page looks mixed until feature 46"). The 404 still shows its
v1 body (pill, subtitle, LED button, shortcuts, concentric rings, red glow).
Preguntas does not exist yet. This feature finishes the visible v2 site: after
it, every page a visitor can reach is Muush 1.0 (legal pages are feature 48).

### Sources of truth (in order of precedence)

1. `docs/harness/progress/pen-extract-46.md`: values the leader extracted from
   `muush.pen` on 2026-11-02. **The `.pen` wins** over every other visual source
   (`rules.md` § R32). The spec author cannot open the `.pen` and has not.
2. `docs/business/muush-1.0.md` § 1 (decisions), § 3 (structure), § 4.7–4.9
   (approved copy).
3. `pen-extract-44.md` (map, legend, radar ping, line-height findings) and
   `pen-extract-45.md` (Trabaja con muush section, application form).
4. `docs/handoff/muush-1.0/` (README: per-section shader uniforms): reference
   behaviour, translated, never copied.
5. Specs 036 and 039 (404 behaviour), 043 (shell), 044 (home, map), 045 (forms).

### Settled decisions (cited, not re-decided)

- Branching: this feature merges back into `muush-v2` only (Roberto).
- 390 px and 1440 px must match the `.pen`; other widths may adapt sizes and
  spacing only, never colour, components, copy or behaviour (AGENTS.md § 3.1).
- Preguntas lives at `/es/preguntas` ↔ `/en/faq` and **is indexed**: canonical,
  hreflang, sitemap entry, no noindex (Roberto 2026-10-31, `muush-1.0.md` § 1).
- The header link bar stays **Inicio · Servicios · Nosotros**; the "Preguntas"
  link drawn in the `.pen` nav is ignored (Roberto, feature 43). *(Superseded by feature 51, Roberto 2026-11-08, OQ-2 = A: the bar and menu gain "Preguntas" / "FAQ" as a fourth item, lit on its page; see `specs/051-faq-content/spec.md` FR-021.)*
- Every v2 pill above a heading carries the shared `pill-aire` spacing (+6 px
  below 1024, +8 px from 1024). Preguntas and 404 have no pill (Roberto
  2026-11-02, feature 45 reopen 2).
- The v2 application form of feature 45 moves into the new v2 "Trabaja con
  muush" section. The v1 About sections are retired; features 18 and 19 are
  `superseded`. Whatever v1 code nothing needs any more is deleted; only what
  something still needs is quarantined (precedent: features 44 and 45).
- Shared pieces are reused, not duplicated: world map, map legend, the
  "Lo que recibes" list anatomy, pill, two-tone heading, primary and glass
  buttons, shader presets.
- The 404 keeps every behaviour of features 36 and 39 (one prerendered
  document per locale, HTTP 404 at the edge, noindex, no canonical/hreflang,
  not in the sitemap, in-place language switch that rewrites the cookie);
  only its look and copy change.
- No version bump in this feature (only feature 47 bumps, to 2.0.0).

## Clarifications

### Session 2026-11-02

Asked by the spec author (a subagent, no human present) and **approved by
Roberto at the spec gate on 2026-11-02**. His rulings replace the earlier
provisional answers:

- Q: Preguntas is not in the header link bar. Where is it linked? → A
  (approved 2026-11-02): **in the footer only**, as the approved copy draws it
  (`muush-1.0.md` § 4.7, pen extract-43 §§ 6–7): the desktop MUUSH column
  reads "Trabaja con muush · Preguntas · Blog · próximamente" (EN "Work with
  muush · FAQ · Blog · coming soon"), and the mobile footer link line reads
  "… Nosotros · Preguntas · Trabaja con muush · Blog (próximamente)". Not in
  the link bar, not in the mobile menu. The sitemap lists it too.
- Q: Preguntas title weight (desktop frame 600, mobile 500, Article VII 500)?
  → A (approved 2026-11-02): **500 at every width.**
- Q: The `.pen` mobile frames draw their own shader uniforms. → A (approved
  2026-11-02): **below 1024 the shader backgrounds use the `.pen` mobile
  uniforms**, as an optional compact uniform set on the presets: the four new
  sections of this feature (Nosotros hero, Trabaja con muush, Preguntas, 404)
  **and** the home's hero, Cómo trabajamos and Diagnóstico (values in
  pen-extract-46 § 6). Specs 044 and 045 carry a dated note. The poster stays
  one per section.
- Q: Do the 8 px dots on the three "Cómo se arma" cards get the radar ping?
  → A (approved 2026-11-02): **yes**, the shared `pulso` utility in each dot's
  colour (Red muush, Blanco, Acero 200), none under reduced motion.
- Q: Heading line heights and tracking the `.pen` leaves unset (Nosotros hero,
  Cómo se arma, Preguntas, 404)? → A (approved 2026-11-02): **the v2 heading
  scale**: 1.08 at 64, 1.1 at 56, −0.035 em tracking at 1440; 1.15 on mobile.
  This supersedes FR-053's "drawn line boxes" (90 / 78 px). The 88 px
  Preguntas title, which the scale does not list, takes the display ratio of
  the hero, 1.06 (implementer's reading, reported).
- Q: The 404 tests that assert the v1 look? → A (approved 2026-11-02): drop
  the v1 pill, subtitle and shortcuts per the design; **every feature 36/39
  behaviour test stays green unchanged**; only the v1-look tests are
  rewritten for the v2 look. LanguageToggle tests untouched.
- New copy (approved 2026-11-02): Preguntas document title "Preguntas · muush"
  / "FAQ · muush"; description "Respuestas a las preguntas frecuentes sobre
  muush. Mientras tanto, pide tu diagnóstico gratis o agenda una llamada." /
  "Answers to frequently asked questions about muush. In the meantime,
  request a free assessment or book a call."; footer labels "Preguntas" /
  "FAQ" (§ 4.7). The 404 document title is kept. The Nosotros SEO description
  (`pages.about.description`) stays unchanged.
- Leader defaults (pen-extract-46 § 6): the footer sits flush after the last
  section on every page (the v1 gap is removed); the Preguntas and 404 blocks
  are minimum heights with centred content; the Trabaja con muush background
  fills the section exactly; glass buttons have no icon; the card has no
  blur or shadow and a flat Blanco 12 % stroke.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A visitor reads Nosotros in the Muush 1.0 design (Priority: P1)

A prospective client or collaborator opens `/es/nosotros` or `/en/about` and
sees one coherent v2 page: a hero over the listón that explains how the team
takes shape, "Cómo se arma" with the three ways people join a project, "Dónde
estamos" with the same world map as the home, and "Trabaja con muush" with the
application form, followed by the v2 footer.

**Why this priority**: Nosotros is a linked, indexed page that today looks
half v1. It is the main reason the integration branch cannot ship.

**Independent Test**: Generate the site and open both Nosotros URLs at 390 and
1440: the four sections appear in order with the approved copy, no v1 element
(dotted paper glow, v1 pill, v1 headline) remains, and the page matches the
`.pen` frames `gQ0NG`/`D1CqYA` and `trkk7`/`XoSI5`.

**Acceptance Scenarios**:

1. **Given** a visitor on `/es/nosotros` at 1440, **When** the page loads,
   **Then** they see, top to bottom: Hero (pill "Nosotros", two-tone heading
   "El equipo se arma / alrededor del proyecto.", intro) over the listón;
   "Cómo se arma" (pill, heading "Quién entra / a tu proyecto.", three cards
   in a row); "Dónde estamos" (pill, heading, the whole map, body, one-row
   legend); "Trabaja con muush" (pill, heading, body, "Áreas que sumamos" list
   on the left, the application form panel on the right) over the listón; the
   footer.
2. **Given** the same page at 390, **When** it loads, **Then** "Cómo se arma"
   is left-aligned with the three cards stacked, "Dónde estamos" shows the
   America / Europa selector and the zoomed map with the two-row legend and the
   "Estonia · pronto" chip, and "Trabaja con muush" stacks pill, heading, body,
   list and the two-step form.
3. **Given** `/en/about`, **When** it loads, **Then** every string is the
   approved English copy of `muush-1.0.md` § 4.8.
4. **Given** the footer's "Trabaja con muush" link from any page, **When** the
   visitor follows it, **Then** they land on the v2 "Trabaja con muush"
   section of Nosotros in the current locale.
5. **Given** the mobile map selector, **When** the visitor uses the keyboard,
   **Then** it behaves exactly as on the home (tablist, arrow keys, region
   zoom, no zoom animation under reduced motion).

---

### User Story 2 - A candidate applies from the v2 "Trabaja con muush" section (Priority: P1)

A candidate reads why they would join and what areas muush brings in, then
fills in and sends the application form, with every feature 45 behaviour
intact.

**Why this priority**: the form is the page's only conversion; moving it must
not break it.

**Independent Test**: On Nosotros, fill in the form and submit against the
existing test setup: the payloads, CV upload, consent gate, two steps below
768 px and the four states behave exactly as in feature 45.

**Acceptance Scenarios**:

1. **Given** the v2 section, **When** the visitor reaches the form, **Then** it
   is the same feature 45 application form (fields, consent, states,
   two steps on mobile), unchanged in behaviour and payload.
2. **Given** the left column at 1440, **When** it renders, **Then** it shows the
   pill "Trabaja con muush", the heading "Tú eliges en qué / proyectos
   entras.", the body, and the "ÁREAS QUE SUMAMOS" list with three check rows,
   with the same anatomy as the home "Lo que recibes" list.
3. **Given** the section, **When** it renders, **Then** it carries the
   `trabaja-con-muush` anchor the footer links to.

---

### User Story 3 - A visitor reaches Preguntas and is pointed to a next step (Priority: P2)

A visitor (or a search engine) reaches `/es/preguntas` or `/en/faq` and sees
"En construcción 🚧" / "Under construction 🚧" over the acanalado, with two
ways forward: the free assessment and booking a call.

**Why this priority**: the route is required in both locales and must be
indexed, but its content is a placeholder.

**Independent Test**: Generate the site: both documents exist, carry canonical,
hreflang (es-MX, en-US, x-default) and an indexable robots value, appear in
`sitemap.xml`, and the language button switches between them.

**Acceptance Scenarios**:

1. **Given** `/es/preguntas`, **When** the visitor presses the language button,
   **Then** they land on `/en/faq` (and back), resolved through the route map,
   never by swapping the prefix.
2. **Given** the page, **When** the visitor activates "Diagnóstico gratis",
   **Then** they reach the diagnóstico section of the same-locale home; **When**
   they activate "Agenda una llamada", **Then** the call-booking page opens in
   a new tab.
3. **Given** the generated site, **When** `sitemap.xml` is read, **Then** it
   lists both Preguntas URLs with their alternates, and neither document carries
   `noindex`.
4. **Given** any page, **When** the visitor looks at the header link bar or the
   mobile menu, **Then** there is no "Preguntas" item; the page is reachable
   from the footer (see FR-031). *(Superseded by feature 51, Roberto 2026-11-08, OQ-2 = A: the bar and menu gain "Preguntas" / "FAQ" as a fourth item, lit on its page; see `specs/051-faq-content/spec.md` FR-021.)*

---

### User Story 4 - A lost visitor sees the v2 404 and gets back (Priority: P2)

A visitor hits a URL that does not exist and sees the v2 404 over the
acanalado: "Volvamos a un / lugar conocido." with "Volver al inicio" and
"Diagnóstico gratis", in the language the edge chose, with the language button
still switching in place.

**Why this priority**: the 404 is reachable from everywhere and is the last v1
screen after Nosotros.

**Independent Test**: Generate the site: `/es/404/index.html` and
`/en/404/index.html` still exist, each in its own language, noindex, without
canonical/hreflang, outside the sitemap; the body shows the v2 heading and two
buttons; the feature 39 in-place switch still changes text, links, `lang` and
title without changing the URL.

**Acceptance Scenarios**:

1. **Given** the Spanish 404 at 1440, **When** it renders, **Then** it shows the
   two-tone heading "Volvamos a un / lugar conocido." as the page's only `h1`,
   then the primary button "Volver al inicio" (with arrow) to the same-locale
   home and the glass button "Diagnóstico gratis" to the same-locale home's
   diagnóstico section; no pill, no subtitle, no shortcuts, no rings, no red
   glow.
2. **Given** a 404 served under any URL, **When** the visitor presses ES/EN,
   **Then** the copy, both buttons, the header and the footer switch to the
   other locale without changing the URL or reloading, the `muush_locale`
   cookie is written, and the button's no-JavaScript `href` is still the other
   locale's home (feature 39).
3. **Given** the existing 404 and LanguageToggle tests, **When** the suite runs,
   **Then** every behavioural assertion of features 36 and 39 still passes;
   only the assertions about the v1 look are replaced by assertions about the
   v2 look (FR-045).

---

### User Story 5 - The design system stays reviewable (Priority: P3)

A reviewer opens Storybook and sees each new or moved component in both
viewports and both locales, and the v1 About and 404 components are gone.

**Why this priority**: Article X requires it; it is how regressions are caught
before composition.

**Independent Test**: `pnpm storybook:build` passes; the new section and card
components have stories at 390 and 1440 in ES and EN; no story remains for a
deleted v1 component.

**Acceptance Scenarios**:

1. **Given** Storybook, **When** a reviewer opens the Nosotros sections, the
   Preguntas/404 body and the moved "Lo que recibes" list, **Then** each has
   stories for mobile and desktop in ES and EN.

---

### Edge Cases

- **Widths between the anchors (360, 768, 1024, 1280, 1920)**: no horizontal
  scroll, clipped text or overlap. The three cards may wrap or stack between
  768 and 1024; the map keeps its feature 44 behaviour (tabs below 1024, whole
  map from 1024); the "Trabaja con muush" layout switches to two columns from
  1024 like the home diagnóstico section.
- **Long English lines**: the EN headings ("The team takes shape / around the
  project.", "You choose which / projects you join.") may wrap to more lines at
  390; nothing is clipped.
- **No WebGL / reduced motion**: every shader section shows its still poster;
  pills and pins keep the radar-ping rules (no ping under reduced motion); the
  map zoom does not animate.
- **No JavaScript**: Nosotros, Preguntas and 404 render fully from the static
  HTML (the form shows its single view, as in feature 45); all links work.
- **404 served under an unprefixed or foreign URL** (`/xyz`, `/fr/abc`): the
  served document's language wins at hydration, as today (feature 39).
- **Preguntas on the 404's language switch**: not applicable; the 404 switches
  in place, Preguntas switches by route.
- **The emoji in the Preguntas title** renders with the system emoji font (the
  brand fonts carry no emoji glyph); that is expected.
- **Anchors**: no link anywhere points to an id that no longer exists (the v1
  About had no other anchors; `trabaja-con-muush` moves to the v2 section).

## Requirements *(mandatory)*

### Functional Requirements

#### Nosotros — page

- **FR-001**: Nosotros MUST render, in order, Hero → Cómo se arma → Dónde
  estamos → Trabaja con muush → footer, in both locales, from the same page
  file, with sections full bleed (each section owns its own padding; no v1 page
  frame around them).
- **FR-002**: The Hero heading MUST be the page's only `h1`; every other
  section heading is an `h2`.
- **FR-003**: Every v2 pill on the page MUST carry the shared pill spacing
  (`pill-aire`).

#### Nosotros — Hero (`b0rao` / `Docxh`)

- **FR-004**: The Hero MUST sit over the listón background (`aboutHero`
  preset: `u_tx 0.5, u_ty 0.55, u_trx 0.4, u_try 0.32, u_tdark 1, u_fadeB 0.08`,
  other uniforms at the shader defaults), loaded with high priority, with its
  poster as the no-WebGL fallback.
- **FR-005**: 1440: section 820 tall, content centred both ways, padding
  120 / 80 / 60 / 80, gap 28. Children: pill "Nosotros" / "About"; two-tone
  heading Poppins 64 / 500 (line 1 Blanco, line 2 Gris 400; line boxes drawn
  90 tall, see FR-053); intro Instrument Sans 20 / 1.5 Blanco 70 %, 720 wide,
  centred.
- **FR-006**: 390: section 700 tall, padding 110 / 24 / 60 / 24, gap 24, centred;
  heading 32 / 500 / 1.15, 342 wide (line 2 wraps at 390); intro 16 / 1.5
  Blanco 70 %.
- **FR-007**: Copy is `muush-1.0.md` § 4.8 verbatim (ES "El equipo se arma /
  alrededor del proyecto." + intro; EN "The team takes shape / around the
  project." + intro).

#### Nosotros — Cómo se arma (`Wy3iH` / `jRvnu`)

- **FR-008**: The section MUST sit on the page black (no shader).
- **FR-009**: 1440: vertical, gap 40, padding 100 / 80 / 80 / 80, centred. Pill
  "Cómo se arma" / "How it comes together"; heading Poppins 56 / 500, centred,
  "Quién entra / a tu proyecto." / "Who joins / your project." (line boxes drawn
  78 tall, see FR-053); a row of three cards, gap 24, each 400 wide, all three
  the same height (drawn 197).
- **FR-010**: Card anatomy (both widths): vertical, gap 14, radius 24, fill the
  glass-panel black (`#0B0B0BB3`), 1 px Blanco 12 % stroke; padding 32 at 1440,
  24 at 390. Children: (1) label row, gap 10: an 8 px dot + label Instrument
  Sans 14 / 600 Gris 400; (2) title Poppins 26 / 500 Blanco; (3) text
  Instrument Sans 17 / 1.5 Blanco 70 %.
- **FR-011**: Cards, in order, with their dot colour and copy:
  Equipo base (Red muush 500) "Siempre en tu proyecto" / "Estrategia, diseño e
  ingeniería, de principio a fin."; Talent pool (Blanco) "Cuando el proyecto lo
  pide" / "Especialistas que entran con el mismo estándar de entrega.";
  Aliados (Acero 200) "Creativo y marketing" / "Estudios de confianza,
  coordinados por nosotros." EN: Core team / Talent pool / Partners with the
  § 4.8 English copy.
- **FR-012**: Each card dot MUST carry the radar ping in its own colour (Red
  muush 500, Blanco, Acero 200), with the shared recipe and duration token, and
  no ping under reduced motion (Clarifications Q4, provisional).
- **FR-013**: 390: vertical, gap 24, padding 72 / 24, **left aligned** (pill and
  heading start at x 24); heading 30 / 500 / 1.15; cards stacked, gap 14, full
  width (342 at 390); the title wraps.
- **FR-014**: The three cards MUST be a list (one list item per card) so
  assistive technology announces three items; the dots are decorative.

#### Nosotros — Dónde estamos (`sBV2H` / `ab0j5`)

- **FR-015**: The section MUST reuse the shared world map exactly as the home
  uses it: same dotted map, the same nine pins (seven team, Ámsterdam partner,
  Estonia "soon"), same radar ping, same hidden city list, same mobile America /
  Europa selector and region zoom, same accessibility labels.
- **FR-016**: The section MUST reuse the shared map legend: 1440 one row, gap 22
  ("Equipo" red dot · "Aliados" Acero 200 dot · "Trabajamos con clientes en
  cualquier país."), 13 Gris 400; 390 two rows with the "Estonia · pronto"
  chip, identical to the home mobile legend.
- **FR-017**: The map's labels (legend, region tabs and their list name, city
  names, "Estonia · pronto") MUST come from one source shared with the home,
  so the two pages can never disagree.
- **FR-018**: 1440: vertical, gap 28, padding 110 / 0, centred; pill "Dónde
  estamos" / "Where we are"; heading Poppins 56 / 500 / 1.1 "Un talent pool que
  crece / por sector y por proyecto." / "A talent pool that grows / by industry
  and by project."; the map block 1408 × 470 at 80 % opacity; body Instrument
  Sans 17 / 1.55 Gris 400, 640 wide, centred: "Todos trabajamos con las mismas
  reglas y el mismo estándar de entrega." / "We all work under the same rules
  and the same delivery standard."; then the legend.
- **FR-019**: 390: vertical, gap 24, padding 72 / 24, centred; heading 28 / 500 /
  1.15; selector, 342 × 240 map, body 16 / 1.5 Blanco 70 %, legend.

#### Nosotros — Trabaja con muush (`O1FdO9` / `fhqDx`)

- **FR-020**: The section MUST carry the shared `trabaja-con-muush` anchor and
  sit over the listón (`workWithUs` preset, the assessment uniforms).
- **FR-021**: 1440: the same layout as the home diagnóstico section: a row, gap
  72, padding 120 / 80 / 140 / 80, items vertically centred; left column 608
  wide, vertical gap 26; the feature 45 application form panel (600 wide,
  glass) on the right.
- **FR-022**: Left column, in order: pill "Trabaja con muush" / "Work with
  muush"; heading Poppins 64 / 500 / 1.08 / −2.24 left-aligned "Tú eliges en
  qué / proyectos entras." / "You choose which / projects you join."; body
  Instrument Sans 18 / 1.55 Blanco 70 %, 500 wide (§ 4.8 copy); the list.
- **FR-023**: The list MUST have the same anatomy as the home "Lo que recibes"
  list (caption 11 / 600 tracking 1 Gris 400 drawn uppercase; rows gap 12 with
  a 24 px Red 15 % bubble holding the 14 px check, text 16 Blanco; list gap 14,
  padding-top 8), with caption "Áreas que sumamos" / "Areas we bring in" and
  rows "Ingeniería y desarrollo", "Diseño de producto y UX", "Creativo,
  contenido y marketing" (EN "Engineering and development", "Product design and
  UX", "Creative, content and marketing"). One component serves both pages.
- **FR-024**: Unlike the home section there is **no** call row.
- **FR-025**: 390: vertical, gap 24, padding 72 / 24, left aligned; heading 34 /
  500 / 1.15; body 16 / 1.5 Blanco 70 %; list; then the stepped form panel
  (342 wide).
- **FR-026**: The application form MUST be the feature 45 form with no change of
  behaviour, payload, copy or states; its content and submitter are still
  resolved by the page and passed through.

#### Nosotros — retiring v1

- **FR-027**: The v1 About hero and the v1 "Work with muush" section, their
  content seams, stories, tests, the v1 `about.hero.*` / `about.work.*` copy
  and the v1 tokens only they use MUST be removed. Nothing renders them and no
  other feature imports them, so they are deleted, not quarantined.
- **FR-028**: Shared v1 primitives still used by other quarantined code
  (legacy pill, glow, backdrop, hero stack) MUST stay where they are for
  feature 47 to delete.

#### Shell — navigation and footer

- **FR-029**: The header link bar and the mobile menu MUST keep exactly Inicio ·
  Servicios · Nosotros; no "Preguntas" item. *(Superseded by feature 51, Roberto 2026-11-08, OQ-2 = A: the bar and menu gain "Preguntas" / "FAQ" as a fourth item, lit on its page; see `specs/051-faq-content/spec.md` FR-021.)*
- **FR-030**: The route map MUST gain the Preguntas route (`/es/preguntas` ↔
  `/en/faq`), declared once with the other translated segments; no component
  writes either path.
- **FR-031**: Preguntas MUST be linked from the footer only: the desktop MUUSH
  column after "Trabaja con muush" and the mobile footer link line after
  "Nosotros", label "Preguntas" / "FAQ", resolved by route name; on Preguntas
  that footer item is the current page (Clarifications Q1, provisional).
- **FR-032**: On Preguntas, no header link-bar item is lit (none points there). *(Superseded by feature 51, Roberto 2026-11-08, OQ-2 = A: the bar and menu gain "Preguntas" / "FAQ" as a fourth item, lit on its page; see `specs/051-faq-content/spec.md` FR-021.)*

#### Preguntas (`FXvwz` / `pDsNQ`)

- **FR-033**: Preguntas MUST exist in both locales at `/es/preguntas` and
  `/en/faq`, prerendered as static documents.
- **FR-034**: It MUST be indexable: its own title and description, canonical,
  hreflang es-MX / en-US / x-default (x-default → English), an indexable robots
  value, and an entry in `sitemap.xml` with its alternates.
- **FR-035**: Content: one block over the acanalado (`faq` preset), no pill, no
  body copy: the title "En construcción 🚧" / "Under construction 🚧" as the
  page's only `h1`, Blanco, centred; then a buttons row: primary with arrow
  "Diagnóstico gratis" / "Free assessment" to the same-locale home's
  diagnóstico section, and glass "Agenda una llamada" / "Book a call" to the
  call-booking page in a new tab.
- **FR-036**: 1440: block 1100 tall, vertical, gap 40, padding 120 / 80 / 80 /
  80, centred both ways; title Poppins 88 / **500** (the frame draws 600; the
  constitution and the mobile frame win, Clarifications Q2, provisional);
  buttons gap 14, hero size.
- **FR-037**: 390: block 720 tall, gap 32, padding 100 / 24 / 60 / 24, centred;
  title 34 / 500; buttons gap 8, centred, both at mobile size (padding 12 / 14;
  178 × 44 and 161 × 41 at 390).
- **FR-038**: The page's structured data MUST be a plain web page (not a
  question-and-answer page: it has no questions yet). *(Superseded by feature
  51 D1, 2026-11-08: the page now carries a `FAQPage` with its 20 questions;
  see `specs/051-faq-content/spec.md` FR-003.)*

#### 404 (`X9EQIz` / `Y2fsOQ`)

- **FR-039**: The 404 body MUST be one block over the acanalado (`notFound`
  preset), no pill, no body copy: two-tone heading "Volvamos a un / lugar
  conocido." / "Let's get you back / somewhere familiar." as the only `h1`;
  then a buttons row, padding-top 8: primary with arrow "Volver al inicio" /
  "Back to home" to the same-locale home, and glass "Diagnóstico gratis" /
  "Free assessment" to the same-locale home's diagnóstico section.
- **FR-040**: 1440: block 760 tall, gap 40, padding 100 / 80 / 60 / 80, centred;
  heading Poppins 64 / 500; buttons gap 14, hero size.
- **FR-041**: 390: block 720 tall, gap 32, padding 100 / 24 / 60 / 24, centred;
  heading 34 / 500; buttons gap 8, mobile size (153 × 44 and 146 × 41).
- **FR-042**: Preguntas and the 404 MUST share one presentational block (shader
  preset, heading, primary and glass button), not two copies.
- **FR-043**: Every behaviour of features 36 and 39 MUST hold: two prerendered
  documents (`/es/404`, `/en/404`) each in its own language with no client-side
  language detection; noindex; no canonical, hreflang, description or page
  Open Graph; not in the sitemap; no `200.html` or root `404.html`; the served
  document wins at hydration; the language button switches in place, writes
  `muush_locale`, and keeps a real no-JavaScript `href`; after switching, both
  buttons, the header and the footer point at the chosen locale and `<html
  lang>` and `<title>` follow it.
- **FR-044**: The v1 404 body, its rings, its glow, its shortcuts, its v1 copy
  (eyebrow, subtitle, shortcut labels and their landmark name) and the v1
  tokens only it uses MUST be removed.
- **FR-045**: Tests that assert the v1 404 look (pill, subtitle, LED, rings,
  glow, shortcuts) MUST be rewritten to assert the v2 look; every test that
  asserts a feature 36/39 behaviour MUST keep passing unchanged in intent; the
  LanguageToggle tests MUST pass unchanged.

#### Backgrounds

- **FR-046**: The four presets (`aboutHero`, `workWithUs`, `faq`, `notFound`)
  MUST keep their desktop uniforms (they already match the `.pen`) from 1024,
  and below 1024 MUST use the mobile uniforms the `.pen` draws (Clarifications
  Q3, provisional): `aboutHero` `{u_flip 1, u_y0 0.95, u_y1 0.68, u_th 0.07,
  u_amp 0.04, u_tx 0.5, u_ty 0.5, u_trx 0.5, u_try 0.34, u_tdark 1, u_fadeB
  0.06}`; `workWithUs` `{u_flip 1, u_y0 1, u_y1 0.5, u_th 0.05, u_amp 0.03,
  u_twist 0.5, u_tx 0.5, u_ty 0.2, u_trx 0.6, u_try 0.2, u_tdark 0.8, u_fadeT
  0.15, u_fadeB 0.02}`; `faq` `{u_flip 1, u_ribs 18, u_y0 0.86, u_y1 0.8, u_th
  0.08, u_right 0.6, u_tx 0.5, u_ty 0.48, u_trx 0.6, u_try 0.26, u_tdark 1,
  u_fadeB 0.1}`; `notFound` `{u_flip 1, u_ribs 18, u_y0 0.9, u_y1 0.84, u_th
  0.08, u_right 0.6, u_tx 0.5, u_ty 0.48, u_trx 0.6, u_try 0.28, u_tdark 1,
  u_fadeB 0.08}`. Omitted uniforms take the shader defaults, as on desktop.
  Presets without a mobile set (the home's) are unchanged.
- **FR-047**: Every shader section keeps the feature 42 host contract: poster
  always present, pause off screen, one still frame under reduced motion,
  hidden from assistive technology.

#### Cross-cutting

- **FR-048**: All copy MUST live in both locale files with matching keys; no
  hardcoded string (Article VI).
- **FR-049**: No hex, rgb or arbitrary pixel value in components; every value
  goes through the v2 tokens consumed as utilities (Article VII). New tokens
  only where no existing v2 token fits.
- **FR-050**: At 390 and 1440 the three pages MUST match their `.pen` frames
  (ES and EN); at 360, 768, 1024, 1280 and 1920 there is no horizontal scroll,
  clipped text or overlap.
- **FR-051**: Technical SEO from feature 35 MUST stay intact for every page; the
  sitemap lists exactly the six indexable pages (home, Nosotros, Preguntas, in
  both locales).
- **FR-052**: With every page now full bleed, the v1 page frame (centred
  max-width with page inset) MUST be retired from the layout, and no page opts
  in or out of it any more.
- **FR-053**: Line heights not given explicitly by the `.pen` MUST follow the
  drawn line boxes (the feature 44 rule) unless the leader supplies otherwise:
  Nosotros hero 64 → 90 px boxes, Cómo se arma 56 → 78 px boxes; Preguntas and
  404 headings take the value the leader supplies.

### Key Entities

- **Nosotros section content**: per section, pill, heading (two lines), body;
  the three "Cómo se arma" cards (label, dot kind, title, text); the
  "Áreas que sumamos" caption and three rows.
- **Map labels**: legend labels, the "soon" chip label, region tab labels and
  list name, city names. One source, two consumers (home and Nosotros).
- **Status-page block**: shader preset, heading (one or two lines, heading
  level 1), a primary action and a glass action, each with a label and a
  destination. Two consumers (Preguntas, 404).
- **Preguntas route**: route name, translated segments, page title and
  description.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % of the reachable pages in both locales (home, Nosotros,
  Preguntas, 404) show the Muush 1.0 design; zero v1 visual element remains on
  Nosotros or the 404.
- **SC-002**: At 390 and 1440, each of the 12 frames (3 pages × 2 widths × 2
  locales) matches the `.pen` in a side-by-side review by the reviewer.
- **SC-003**: At 360, 768, 1024, 1280 and 1920, zero horizontal scroll, clipped
  text or overlap on the three pages in both locales.
- **SC-004**: The generated sitemap lists exactly 6 URLs, each with 3
  alternates; both Preguntas documents carry a canonical and no noindex; both
  404 documents carry noindex and no canonical.
- **SC-005**: A candidate can complete and send the application from the v2
  Nosotros section with the same number of steps and the same payload as in
  feature 45 (zero contract change).
- **SC-006**: Every existing behavioural test of features 36, 39 and the
  LanguageToggle passes; `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm
  generate` and `pnpm storybook:build` pass.
- **SC-007**: The map labels and the "Lo que recibes" list anatomy each exist
  in exactly one place in the code base.

## Assumptions

- The feature 45 application form fits the 600-wide right column as on the home
  diagnóstico section; no change inside the form.
- "Dónde estamos" and the home "Qué es muush" share the same map and legend
  copy, so the home's map keys become the shared source (the home's rendered
  copy does not change).
- The Trabaja con muush background (`BD9CZ`) is drawn 26 px above the section
  top. The shader fades to black at the top (`u_fadeT 0.3`), so the background
  fills the section exactly; the 26 px offset is not reproduced (reported to
  the leader).
- The Preguntas secondary button has no icon (the `.pen` draws none on glass
  buttons). The 404 secondary button likewise.
- Preguntas and the 404 block heights (1100 / 760 at 1440, 720 at 390) are
  minimum heights with the content centred; other widths may adapt.
- The emoji stays part of the Preguntas title string (approved copy); a screen
  reader reads it.
- The Nosotros page title and description (`pages.about.*`) stay as they are;
  Preguntas gets a new title and description (provisional copy in
  Clarifications, to approve).
- The space above the footer on the v2 pages follows the leader's answer on the
  footer gap; until then the footer keeps its current top margin.
- The feature 43 footer and header components are reused untouched apart from
  the data entry that adds Preguntas (FR-031).
