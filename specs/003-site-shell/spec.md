# Feature Specification: Site shell — Nav, Footer and mobile menu

**Feature Branch**: `003-site-shell`
**Created**: 2026-09-07
**Status**: Draft
**Input**: Feature id 3 in `feature_list.json` (`site_shell`, `"sdd": true`). Build the chrome that wraps every page — a responsive Nav, a full-screen mobile menu, a Footer with four columns and an ES/EN language toggle — as the first feature module under `app/features/shell/`, wired into a Nuxt layout so every page inherits it, with the About route added so the nav links resolve.

## Overview

Features 1, 2, 4 and 5 delivered vocabulary and primitives. Nothing they
produced is on a page: the site today is one placeholder route rendering one
heading. **This feature is the first that a visitor could see.**

It delivers four things:

1. **The shell components** — Nav, mobile menu, Footer, FooterColumn and the
   ES/EN toggle — as the first feature module, `app/features/shell/`, in the
   `ui/` · `logic/` · `data/` shape Constitution Article I mandates, with an
   `index.ts` barrel as its only public surface.
2. **The layout** that renders Nav above and Footer below every page's content,
   so no page ever composes the shell itself.
3. **The second route.** The nav links to About. Until About exists, that link
   is a 404 on every page of the site. A thin About page is therefore in scope;
   its *content* is not.
4. **Locale equivalence.** The About segment is translated (`nosotros` ↔
   `about`), so the toggle cannot swap a prefix — it has to resolve the
   equivalent route through the route map. That resolution is the one piece of
   genuinely non-trivial logic in the feature and the one that carries unit
   tests by name in Constitution Article X.

### What the design verified, and why it halves the work

`design-extract.md` § 9.bis records the result of comparing all four vigent
frames: **Nav and Footer are byte-identical between Landing and About in both
viewports** — same width, padding, gap and alignment. There is therefore one
responsive Nav and one responsive Footer, not four components and not a
per-page variant. This is a finding from the design file, not an
implementation shortcut.

It has a second consequence, drawn out in A-04 below: because the two navs are
identical, **the design contains no visual "active page" treatment**, even
though `ui-map.md` § 2 says Nosotros "queda activo ahí".

### Source of truth and evidence discipline

Every measurement in this spec is **CONFIRMED** against
`docs/business/landing/design-extract.md` (extracted from `muush.pen` on
2026-09-06), **DERIVED** from those values with the arithmetic shown, or
recorded as an explicit **ASSUMPTION** below with its owner and its reversal
cost. Nothing is estimated from memory, and the `.pen` file is not opened — the
Pencil bridge does not exist outside the main interactive session.

Where a value the shell needs is genuinely absent from every document, it is
recorded as an assumption with the word **UNVERIFIED** and named in the return
to the approval gate. It is never presented as a design value.

Prop signatures for everything this feature composes are fixed in
`specs/002-primitive-ui-layer/contracts/components.md` and are consumed
unchanged.

### Measurement provenance

| Group | Source | Note |
|---|---|---|
| Nav container, desktop and mobile | `design-extract.md` § 9.bis · *Nav — contenedor* | CONFIRMED |
| Nav right group, links, toggle, hamburger | § 9.bis · *Nav* | CONFIRMED |
| Footer container, Top/Bottom, Marca, Columnas | § 9.bis · *Footer — contenedor* | CONFIRMED |
| FooterColumn geometry and type | § 10 · *FooterColumn* | CONFIRMED |
| Mobile menu layer stack | § 9.bis · *Menú móvil abierto* | CONFIRMED, positions translated to flow per `rules.md` § R12 |
| ES/EN copy, both locales | § 9.bis · *Copy del shell — ES / EN* | CONFIRMED |
| Destinations | § 9.bis · *Destinos* + `ui-map.md` §§ 1, 2, 8 | CONFIRMED |
| Social button geometry (48×48) | § 8 | CONFIRMED, already implemented in `SocialIcon` |
| Lockup, Wordmark, primary button | §§ 4, 5, 6 | CONFIRMED, already implemented |
| Hairline and divider alpha percentages | DERIVED from the 8-digit hex, arithmetic in FR-042 and FR-043 | |
| Tracking in `em` | DERIVED from the px tracking, per `rules.md` § R4 | |
| Mobile-menu flow gaps (50 / 44) | `rules.md` § R12, already derived in the previous cycle | Reused, not re-derived |
| Breakpoint, max content width, page background | **absent from every source** — see A-01, A-02, A-03 | UNVERIFIED |
| Desktop footer Top row | § 9.bis records 340 + 80 + 912 against a 1280 box | **DISCREPANCY** — resolved in A-16, flagged for Clau |

## Clarifications

### Session 2026-09-07

Three values the shell needs are not in any document, or are self-contradictory
where they are. All three were resolved by the spec author from the arithmetic
of the values that *are* recorded, and all three remain **UNVERIFIED against
the design file**. Each carries an owner and a reversal cost, and each is named
in the hand-off to the approval gate. None is a measurement read from the
`.pen`, and none is presented as one.

- **Q**: At what viewport width does the shell swap between its mobile and
  desktop arrangements? → **A**: 1024px. *(No source; see A-01. Owner: Clau.
  Reversal cost: one breakpoint name.)*
- **Q**: What happens above the 1440px design frame — does content cap, or run
  full-bleed with clamped gutters? → **A**: Content caps at 1440px and centres.
  *(No source; see A-02. Owner: Clau. Reversal cost: one container rule.)*
- **Q**: `design-extract.md` § 9.bis over-constrains the desktop footer's Top
  row — `Marca` 340 + gap 80 + `Columnas` 912 = 1332 against a 1280 content
  box. Which value yields? → **A**: The gap. `space_between` governs and the
  columns flex; 340 + 912 = 1252 fits 1280 with 28px spare, so the frame
  realizes a 28px gap and the recorded 80 is never achieved. *(See A-16.
  Owner: Clau. Reversal cost: one layout rule.)*

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A visitor can get anywhere from anywhere (Priority: P1)

A visitor lands on the Spanish home page. Across the top they see the muush
lockup, links to Proyectos and Nosotros, the primary "Cuéntanos tu proyecto"
button and the ES/EN toggle. Down the bottom of every page they find the same
four columns of destinations and the same brand block. Clicking Nosotros takes
them to a real page, not an error. Clicking Proyectos from that page takes them
back to the landing and down to the projects section.

**Why this priority**: without it the site is a single page with no way in or
out. Every other story in this feature is a refinement of this one.

**Independent Test**: load the Spanish landing, follow every nav and footer
destination in turn, and confirm each one resolves — no 404, no dead anchor, no
link that leaves the visitor on the wrong page.

**Acceptance Scenarios**:

1. **Given** the Spanish landing, **When** the Nav renders, **Then** it shows
   the lockup, the Proyectos link, the Nosotros link, the primary CTA and the
   ES/EN toggle, in that order.
2. **Given** the Nav on the About page, **When** it renders, **Then** it is
   visually identical to the Nav on the landing — same padding, same gaps, same
   items — because the design records the two as identical.
3. **Given** the About page, **When** the visitor activates Proyectos, **Then**
   they arrive at the landing of the same locale, at the projects anchor.
4. **Given** any page, **When** the visitor activates the lockup in either the
   Nav or the Footer, **Then** they arrive at the home of the active locale.
5. **Given** any page in either locale, **When** the Footer renders, **Then**
   its four columns carry exactly the items `design-extract.md` § 9.bis lists,
   in the order `decisions-open.md` D4 and D5 settled.

---

### User Story 2 - A visitor switches language without losing their place (Priority: P1)

A visitor reading the Spanish About page switches to English. They land on the
English About page — not the English home, and not a 404 produced by swapping
`/es/` for `/en/` while leaving `nosotros` in the path.

**Why this priority**: Constitution Article VI calls this out by name, and
names the failure mode: a prefix swap "silently produces 404s, and shipping one
in a `hreflang` tag tells search engines the page exists when it does not". It
is also the only logic in the feature complex enough to be wrong in a way
review would not catch.

**Independent Test**: from each of the four routes, activate the toggle and
confirm the destination is the equivalent route of the other locale; then
assert the same mapping in unit tests, including the segment translation in
both directions and the round trip.

**Acceptance Scenarios**:

1. **Given** `/es/nosotros`, **When** the visitor activates EN, **Then** they
   arrive at `/en/about`.
2. **Given** `/en/about`, **When** the visitor activates ES, **Then** they
   arrive at `/es/nosotros`.
3. **Given** `/es/`, **When** the visitor activates EN, **Then** they arrive at
   `/en/` — the home of the other locale, not a translated segment.
4. **Given** any route, **When** the toggle renders, **Then** the active locale
   is marked in bone-100 and the inactive one in ink-200, per § 9.bis.
5. **Given** a page with an anchor in the address bar and JavaScript available,
   **When** the visitor activates the toggle, **Then** the anchor is carried to
   the equivalent route.
6. **Given** the same page with JavaScript unavailable, **When** the visitor
   activates the toggle, **Then** they still arrive at the equivalent route,
   at the top of it — see FR-021 and `rules.md` § R9. The toggle never breaks;
   it degrades.

---

### User Story 3 - A visitor on a phone can navigate (Priority: P1)

A visitor on a phone sees the lockup, the ES/EN toggle and a hamburger. Tapping
it fills the screen with dark glass carrying the four destinations, a divider
and the three social buttons. The page behind does not scroll. Tapping an item,
tapping the close X, or pressing Escape closes it. Choosing an anchor closes the
menu first and scrolls afterwards, so the visitor sees where they landed.

**Why this priority**: on mobile the hamburger is the *only* navigation. There
is deliberately no CTA button in the mobile nav — `decisions-open.md`
2026-09-06 records that on mobile the only call to action is the social row
inside the menu. If the menu does not work, mobile navigation does not exist.

**Independent Test**: at 390px, open the menu, attempt to scroll the page
behind it, close it by each of the three routes, and confirm the page scroll
position is unchanged and the background scrolls again.

**Acceptance Scenarios**:

1. **Given** a 390px viewport, **When** the Nav renders, **Then** it shows the
   lockup, the ES/EN toggle and the hamburger, and **no primary CTA button** —
   a documented decision, not an omission.
2. **Given** the closed menu, **When** the visitor activates the hamburger,
   **Then** a full-screen dark-glass panel appears carrying the same nav row
   with a close X in place of the hamburger, the four items, the divider and
   the three social buttons.
3. **Given** the open menu, **When** the visitor attempts to scroll the page
   behind it, **Then** nothing behind moves.
4. **Given** the open menu, **When** the visitor presses Escape, **Then** it
   closes and the background scrolls again at the position it was left.
5. **Given** the open menu, **When** the visitor chooses an item pointing at an
   anchor, **Then** the menu closes and only then does the page scroll to that
   anchor.
6. **Given** the open menu, **When** a keyboard user tabs, **Then** focus stays
   within the menu, and on close it returns to the control that opened it.

---

### User Story 4 - Nothing in the footer leads nowhere (Priority: P2)

A visitor scans the footer. "Blog · próximamente" reads as a note, not a link —
it has no pointer, no hover, nothing to click. "FAQ" and "Agenda una llamada"
read exactly the same way, because neither has a destination yet. Every item
that *is* a link goes somewhere real: the mail client, WhatsApp with a message
already written, a social profile in a new tab, or a section of this site.

**Why this priority**: `ui-map.md` § 8 states the failure precisely — a link to
a page that does not exist is "un 404 en el footer de **todas** las páginas del
sitio". Two of the four blocking open decisions land in this footer. Getting
this wrong ships a broken link site-wide.

**Independent Test**: enumerate every footer item, and for each assert either a
resolvable destination or the absence of any interactive affordance. There must
be no third category.

**Acceptance Scenarios**:

1. **Given** the footer in either locale, **When** it renders, **Then**
   `Agenda una llamada` / `Book a call` is plain ink-300 text with no
   destination, no pointer cursor and no hover state — `decisions-open.md` #2
   is still open.
2. **Given** the same footer, **When** it renders, **Then** `FAQ` is plain
   ink-300 text on the same terms — `decisions-open.md` #3 is still open.
3. **Given** the same footer, **When** it renders, **Then**
   `Blog · próximamente` / `Blog · coming soon` renders identically, as the
   design already specifies, so the three read as one consistent treatment.
4. **Given** the WhatsApp item, **When** the visitor activates it, **Then** a
   new browsing context opens at the muush WhatsApp number with the
   locale-appropriate message pre-filled, with the opener relationship severed.
5. **Given** the email item, **When** the visitor activates it, **Then** their
   mail client opens addressed to the support address.
6. **Given** any footer item pointing at a section anchor, **When** the visitor
   activates it from the About page, **Then** they arrive at the landing of the
   active locale at that anchor — not at a dead fragment on the page they are
   already on.

---

### User Story 5 - The shell can be reviewed before it is trusted (Priority: P2)

A reviewer opens the component catalogue and sees the Nav at both frame widths,
the Footer at both frame widths, and the mobile menu open — without running the
site, without a route existing, and in both locales.

**Why this priority**: Constitution Article X makes the story mandatory for
these three, and the catalogue runs Vite outside Nuxt, so a component that
silently depends on ambient routing or translation state cannot be rendered
there at all. The story is therefore also the mechanism that keeps the `ui/`
layer honestly presentational.

**Independent Test**: build the catalogue and confirm the three entries render
with no Nuxt runtime present, at 390px and 1440px, with Spanish and English
content.

**Acceptance Scenarios**:

1. **Given** the catalogue, **When** it is built, **Then** it contains a story
   for the Nav, one for the Footer and one for the open mobile menu.
2. **Given** the Nav story, **When** the viewport control moves between 390px
   and 1440px, **Then** the layout changes between the mobile and desktop
   arrangements § 9.bis records.
3. **Given** any of the three stories, **When** it renders, **Then** no Nuxt
   runtime, router or i18n instance is required for it to do so — the
   presentational components receive their copy and destinations already
   resolved.

---

### Edge Cases

- **A locale whose label is longer than the other's.** `Cuéntanos tu proyecto`
  and `Tell us about your project` differ by five characters and the nav CTA
  sizes to its label (feature 2, FR-034 / edge case). The nav right group must
  absorb that without wrapping or pushing the lockup off the row.
- **`Blog · próximamente` is one string, not two items.** The `·` lives inside
  the copy. Splitting it on the separator would produce a phantom fifth item in
  the muush column and a second non-interactive element.
- **`Work with muush` and `FAQ` are the same in both locales.** They are proper
  nouns (§ 9.bis note). Both locale files carry the key with the same value;
  that is parity, not a missing translation, and `tests/i18n-parity.test.ts`
  is satisfied by presence, not by difference.
- **The mobile menu is opened, then the viewport is widened past the
  breakpoint.** The menu must not survive as a full-screen panel over a desktop
  layout, and the scroll lock must not outlive it.
- **The menu is open and the visitor navigates with the browser back button.**
  Route change closes the menu and releases the lock; a lock that outlives its
  panel makes the whole site unscrollable with nothing visible to blame.
- **A visitor with reduced motion requested.** The shell introduces no
  animation of its own; the only animated element it composes is the primary
  button's LED ring, which already honours reduced motion.
- **A very tall or very short phone.** `rules.md` § R12 already established
  that the menu frame's absolute coordinates are frame artefacts: a real phone
  is rarely 844px tall, so the item block, divider and social row flow rather
  than being positioned.
- **A viewport wider than the 1440px frame.** No frame exists for it. See A-02.
- **Zero-JavaScript.** The nav links, footer links and the toggle are all plain
  links and work. Only the mobile menu and the toggle's anchor preservation
  need scripting; both degrade rather than break (FR-021, FR-032).

## Requirements *(mandatory)*

### Scope and structure

- **FR-001**: The feature MUST create the module `app/features/shell/` with the
  three layers `ui/`, `logic/`, `data/` and an `index.ts` barrel that is the
  module's only public surface (Constitution Article I).
- **FR-002**: Within the module, `data/` MUST NOT import from `logic/` or
  `ui/`, and `logic/` MUST NOT import from `ui/` (Article II). No file outside
  the module may import any of its internals — only the barrel (Article III).
- **FR-003**: The module MUST contain, at minimum: a responsive Nav, a mobile
  menu, a Footer, a FooterColumn and an ES/EN toggle. Nav and Footer MUST each
  be **one** responsive component, not one per page and not one per viewport,
  because § 9.bis verified the two pages' chrome is identical.
- **FR-004**: A layout under `app/layouts/` MUST render the Nav before and the
  Footer after the page content, so no page composes the shell itself.
- **FR-005**: A page MUST exist that resolves at `/es/nosotros` and at
  `/en/about` from a single page component, so the nav's Nosotros link and the
  footer's Work with muush item resolve instead of returning 404.
- **FR-006**: That page's **content** is out of scope. It carries a title in
  both locales and the `#work` anchor target the footer points at, and nothing
  else. The team, network and application-form sections belong to a later
  feature.
- **FR-007**: The existing placeholder page MUST be reduced to page content
  only — the surface, the outer padding and the minimum height move to the
  layout, so a second page does not restate them.
- **FR-008**: Components under `ui/` MUST be presentational: they receive
  already-resolved copy and destinations as props and emit events (Article V).
  Resolving copy from the locale files and destinations from the route map is
  the job of `logic/`; the shape of the navigation and footer models is the job
  of `data/`. This is what makes FR-052 achievable at all.
- **FR-009**: Complex behaviour MUST NOT be inlined in a component. The mobile
  menu's open/close state, its background scroll lock and its Escape handling
  MUST live in a composable under `logic/` (Articles I, II and V).

### Nav

- **FR-010**: At the desktop frame the Nav MUST render, left to right: the
  lockup, the Proyectos link, the Nosotros link, the primary CTA and the ES/EN
  toggle, with the container padding, the lockup gap and the right-group gap
  § 9.bis records.
- **FR-011**: At the mobile frame the Nav MUST render the lockup, the ES/EN
  toggle and the hamburger, with the mobile container padding and gaps § 9.bis
  records, and MUST NOT render the primary CTA. Its absence is a recorded
  decision (`decisions-open.md`, 2026-09-06), and MUST be commented as such so
  a future reader does not "fix" it.
- **FR-012**: The nav links MUST use the bone-300 15px/500 treatment § 9.bis
  records. The CTA MUST be the existing primary button in its `nav` variant,
  unmodified.
- **FR-013**: The hamburger MUST be the dark-glass control § 9.bis measures:
  the icon corner radius, the standard 1px neutral border, the recorded
  asymmetric padding, and two bone-100 bars of the recorded size, gap and
  corner radius.
- **FR-014**: The Nav MUST be a navigation landmark and its links MUST be real
  links, reachable and operable by keyboard.
- **FR-015**: The Nav MUST sit at the top of the page and MUST NOT be fixed or
  sticky. `ui-map.md` § 2 and `decisions-open.md` #5 record "nav fijo al hacer
  scroll" as an **open, non-blocking** decision with no frame drawn for the
  compressed state. See A-05.

### Language toggle and route mapping

- **FR-016**: The toggle MUST render both locale labels separated by the
  divider § 9.bis records, with the active locale in bone-100 at weight 600 and
  the inactive one in ink-200 at weight 500, at the recorded sizes and gaps for
  each frame.
- **FR-017**: The toggle MUST resolve its destination through the route map. It
  MUST NOT construct the destination by replacing the locale prefix in the
  current path (Article VI, stated as a prohibition).
- **FR-018**: The translated-segment mapping (`nosotros` ↔ `about`) MUST be
  declared once, as configuration or data, and MUST NOT be written inside any
  component. Reverting to an unprefixed Spanish, should that ever happen, must
  be a data change and not a component change (`decisions-open.md` §
  *Estrategia de rutas i18n*).
- **FR-019**: The resolver MUST handle every route the site has: the two homes
  and the two About routes, in both directions, and MUST be total — given an
  unknown path it returns a defined destination rather than an undefined one.
- **FR-020**: The resolver MUST carry unit tests covering both directions of
  the segment translation, the home-to-home case, the round trip, and the
  anchor handling of FR-021. Constitution Article X names route mapping
  explicitly as requiring unit tests.
- **FR-021**: **The anchor cannot be resolved at build time.** A URL fragment
  is never sent to the server and does not exist when a static page is
  generated (`rules.md` § R9). Therefore the statically rendered destination
  MUST be the equivalent route **without** an anchor, and preserving the anchor
  MUST be a client-side enhancement applied at activation time. With scripting
  unavailable the toggle MUST still navigate to the equivalent route, landing
  at its top. This is a documented degradation, not a defect.
- **FR-022**: If the shell emits alternate-language metadata for search
  engines, those alternates MUST come from the same route map as the toggle.
  Emitting one that does not resolve is the failure Article VI names. See A-09
  — this requirement is an addition beyond the feature's stated acceptance
  criteria and may be trimmed at the approval gate.

### Mobile menu

- **FR-023**: The open menu MUST cover the viewport with the dark-glass panel
  § 9.bis records — the dark glass fill and the recorded blur — with no border,
  no corner radius and no panel padding, because the frame gives it none.
- **FR-024**: The menu MUST carry the same nav row as the closed mobile nav
  (same container padding, same lockup, same toggle), with a close control in
  place of the hamburger: the dark-glass control § 9.bis measures, carrying the
  lucide `x` glyph at the recorded size in bone-100.
- **FR-025**: The `x` glyph MUST be inlined from a repository asset so it takes
  its colour from its container, following the established path in `rules.md`
  § R14 — a `?raw` import rendered inside a decorative wrapper and sized
  through a deep selector. The asset does not exist yet and MUST be added to
  `app/assets/` with a provenance note matching the pattern of the existing
  logo and social assets.
- **FR-026**: The menu MUST render the four destinations at the recorded size,
  weight and tracking, then the divider, then the three social buttons, using
  the flow spacing already derived in `rules.md` § R12. The frame's absolute
  coordinates MUST NOT be reproduced as positions.
- **FR-027**: The three social buttons MUST be the existing social primitive,
  unmodified, at the recorded row gap, centred.
- **FR-028**: Opening the menu MUST prevent the page behind it from scrolling,
  and closing it MUST restore scrolling at the position the visitor left.
- **FR-029**: The menu MUST close on: activating any of its items, activating
  the close control, pressing Escape, and any route change.
- **FR-030**: When the menu closes because an anchor item was chosen, the close
  MUST complete before the scroll begins (`ui-map.md` § 2).
- **FR-031**: While open, the menu MUST be exposed as a modal surface: keyboard
  focus stays inside it, the content behind is hidden from assistive
  technology, and focus returns to the control that opened it on close.
- **FR-032**: With scripting unavailable the mobile menu cannot open. The
  hamburger MUST NOT then present itself as operable, and no shell destination
  may be reachable *only* through the menu — every destination it offers also
  exists in the footer, which is present on every page and needs no scripting.

### Footer

- **FR-033**: The Footer MUST render on the ink-500 surface at the container
  padding and gap § 9.bis records for each frame.
- **FR-034**: At the desktop frame it MUST render a brand block and four
  columns side by side, then the bottom bar, at the recorded widths and gaps.
  At the mobile frame it MUST render the brand block, then the four columns as
  two rows of two, then the bottom bar, at the recorded mobile gaps.
- **FR-035**: The brand block MUST be the lockup, the tagline and the category
  line, at the ink-100 and ink-300 treatments and the per-frame sizes § 9.bis
  records. The lockup MUST link to the home of the active locale.
- **FR-036**: Each column MUST render a red-300 title and its items at the
  geometry and type § 10 · *FooterColumn* records for each frame.
- **FR-037**: The four columns and their items MUST be exactly those in § 9.bis
  and § 10, in that order: Navegación (Propósito · Servicios · Proyectos ·
  Nosotros), Contacto (Agenda una llamada · support@muush.dev · WhatsApp),
  muush (Work with muush · FAQ · Blog · próximamente) and Redes (LinkedIn ·
  Instagram · TikTok). `ui-map.md` § 8 lists the Navegación column in a
  different order; it is superseded by `decisions-open.md` D4, which settled it
  explicitly.
- **FR-038**: The bottom bar MUST carry the 1px hairline above it and the two
  ink-300 texts — copyright and location — arranged apart on one row at the
  desktop frame and stacked at the mobile frame, at the recorded paddings, gaps
  and sizes. The two frames differ in arrangement, not only in size.
- **FR-039**: An item with no destination MUST render as plain ink-300 text
  with no destination, no pointer affordance and no hover state. This applies
  to `Blog · próximamente` (specified by the design) and, for as long as
  `decisions-open.md` #2 and #3 remain open, to `Agenda una llamada` and `FAQ`.
- **FR-040**: The email item MUST open the visitor's mail client at the support
  address. The WhatsApp item MUST open the recorded number in a new browsing
  context with the opener relationship severed, carrying the locale-appropriate
  pre-filled message from `ui-map.md` § 8. The three social items MUST open
  their profiles in a new context on the same terms.
- **FR-041**: Every shell destination that points at a section anchor MUST be
  expressed as the home of the active locale plus that anchor, never as a bare
  fragment. A bare fragment does nothing on the About page, where the footer
  also renders. `ui-map.md` § 2 states this rule for the nav; it applies
  identically to the footer, which appears on both pages.

### Tokens and visual discipline

- **FR-042**: The footer bottom-bar hairline MUST be bone-100 at 12% in **both**
  frames. § 9.bis records two different colours for the same line —
  `#c9c9c91f` at desktop and `#FBF8F61F` at mobile — and `#c9c9c9` belongs to
  no brand ramp. `0x1F ÷ 255 = 12.2%`, so the mobile value *is* bone-100 at
  12%; the desktop value is taken as the off-palette one.
  `rules.md` § R11 and `decisions-open.md` § *Discrepancias pendientes* record
  this and flag the design file for correction by Clau. See A-06: the token
  that unified this **does not currently exist in the repository** and must be
  added by this feature.
- **FR-043**: The mobile menu divider MUST be bone-100 at 8%. § 9.bis records
  it as `#FBF8F614`; `0x14 ÷ 255 = 7.8%`, rounded to 8%.
- **FR-044**: Every value this feature needs that has no token MUST be added as
  a token in the global stylesheet, derived from § 9.bis and § 10 — the nav and
  footer vertical paddings and gaps, the column and brand-block widths, the
  toggle, tagline, category, column-title, column-item, bottom-bar and
  menu-item type roles, the menu panel blur, and the hairline and divider
  colours. No component may carry a colour or size literal (Article VII).
- **FR-045**: Tracking MUST be expressed in `em`, not pixels, so it scales with
  the fluid size (`rules.md` § R4). Where the design's px tracking implies two
  slightly different `em` values at the two frames, the desktop value is used
  and the drift recorded; see A-07.
- **FR-046**: Hand-written CSS in a scoped style block MUST reference the
  `:root` ramp variables, never the `--color-*` theme names. `@theme inline`
  emits no runtime custom property for the theme names in the site build, so
  the theme name resolves to nothing in production while looking correct in the
  catalogue (`rules.md` § R18). This has broken this repository three times.
- **FR-047**: No component may use a breakpoint to change a font size, a
  padding, a radius or a blur; those resolve through fluid tokens
  (Article VII). A breakpoint that changes **layout** — the nav swapping
  arrangements, the footer columns reflowing to two rows — is permitted and
  necessary, because those are structural changes no `clamp()` can express.
- **FR-058**: The shell MUST swap between its mobile and desktop arrangements
  at **1024px** — below it the Nav shows the hamburger and the footer columns
  stack two by two; at and above it the Nav shows its links and CTA and the
  footer columns sit four across. No document states this value; see A-01.
- **FR-059**: Above the 1440px design frame the shell's content MUST cap at
  1440px and centre, with the page-margin token supplying the gutter below that
  width. No document states this behaviour; see A-02.
- **FR-060**: In the desktop footer's Top row, the brand block MUST hold its
  recorded 340 width and the four columns MUST flex, sharing the remaining
  space at the recorded gap where it fits. The recorded 80 gap between the two
  groups is not achievable at any width the design draws (arithmetic in A-16)
  and MUST NOT be treated as a fixed value.

### Copy and locales

- **FR-048**: Every user-facing string in the shell MUST come from
  `i18n/locales/es.json` and `i18n/locales/en.json`. No Spanish or English copy
  may appear in a component (Article VI). The one exception is the wordmark's
  brand runs, already established in feature 2.
- **FR-049**: The copy MUST be exactly the ES/EN table in § 9.bis.
  `Work with muush` and `FAQ` carry the same value in both locales because they
  are proper nouns. `Blog · próximamente` / `Blog · coming soon` is a single
  string including its separator.
- **FR-050**: Every key added MUST exist in both locale files with a non-empty
  value, and `tests/i18n-parity.test.ts` MUST stay green.
- **FR-051**: Every route MUST resolve in both locales (Article VI). Adding
  About means adding it in Spanish *and* English in the same change.

### Reuse, review and verification

- **FR-052**: The three shell components MUST each have a story in the
  component catalogue (Article X). Because the catalogue runs outside Nuxt, the
  presentational components MUST be renderable with no router, no i18n instance
  and no Nuxt runtime present — which FR-008 already requires.
- **FR-053**: The shell MUST compose the existing primitives rather than
  reimplement them, honouring the signatures in
  `specs/002-primitive-ui-layer/contracts/components.md` without changing any
  of them. It composes the lockup (and the wordmark through it), the primary
  button in its `nav` variant, and the social button. See A-08 for the two
  primitives the acceptance criteria name that the design does **not** place in
  the shell.
- **FR-054**: The mobile-menu composable and the route resolver MUST have unit
  tests, and the `ui/` components MUST have component tests asserting rendering
  from props and the events they emit (Article X, layers 1 and 2). The test
  configuration currently scans only `tests/` and `app/shared/ui/`; it must be
  extended to reach the feature module.
- **FR-055**: Any alias added MUST be mirrored in the catalogue's Vite
  configuration (Article XII). No new alias is anticipated — `@/features` and
  `@/layouts` already exist in both places.
- **FR-056**: All five repository quality gates MUST pass: lint/format, type
  check, tests, static generation and the catalogue build.
- **FR-057**: No credential, endpoint token or analytics key is introduced by
  this feature. The only external destinations are public profile URLs, a
  public WhatsApp number already recorded in `overview.md`, and a public
  support mailbox (Article XI).

### Key Entities

- **Shell destination**: a named target the shell can point at. Four kinds:
  a route in the current locale, a route plus a section anchor, an external URL
  opened in a new context, and **none** — the last being a real, renderable
  state (FR-039), not a missing value.
- **Navigation item**: a copy key plus a destination. The nav has two, the
  mobile menu four, the footer fifteen across four columns.
- **Footer column**: a title key plus an ordered list of navigation items.
  Exactly four exist, fixed by the design.
- **Locale route pair**: the two paths — one per locale — that denote the same
  page. Two pairs exist today: the homes, and About. The pair is the unit the
  toggle resolves against and the unit any alternate-language metadata is built
  from.
- **Menu state**: open or closed, plus the scroll position held while open.
  Owned by a composable, never by a component.

No persistence, no server state and no network call exists anywhere in this
feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **4** routes resolve — `/es/`, `/en/`, `/es/nosotros`,
  `/en/about` — and `/` reaches the Spanish home. Zero 404s.
- **SC-002**: Every one of the **~24** shell destinations (2 nav links + 1 nav
  CTA + 2 lockups + 4 menu items + 3 social buttons + 15 footer items, minus
  overlaps) either resolves or is provably non-interactive. Count of links that
  render as links and lead nowhere: **zero**.
- **SC-003**: The locale toggle resolves correctly from all **4** routes in both
  directions — **8** transitions, **8** correct destinations, zero 404s.
- **SC-004**: A search for a locale-prefix string substitution in the shell
  returns **zero** matches; the resolver reaches the route map in **100%** of
  cases.
- **SC-005**: A visitor on a 390px viewport can reach every destination the
  desktop nav offers, in at most **2** interactions (open menu, choose item).
- **SC-006**: With the mobile menu open, the page behind scrolls by **0** px;
  after closing, the scroll position differs from the pre-open position by
  **0** px.
- **SC-007**: A search for a user-facing Spanish or English literal across the
  shell components returns **zero** matches; **100%** of shell copy resolves
  from the locale files, and the parity suite reports **0** key differences and
  **0** empty values.
- **SC-008**: A search for a colour or size literal across the shell components
  returns **zero** matches.
- **SC-009**: A search for the `--color-*` theme names inside any hand-written
  style block returns **zero** matches (`rules.md` § R18).
- **SC-010**: The component catalogue gains **3** entries — Nav, Footer, mobile
  menu — and each renders with **zero** Nuxt runtime present.
- **SC-011**: Prop signature changes to any of the nine existing primitives:
  **zero**.
- **SC-012**: Imports that cross a feature boundary other than through a
  barrel: **zero**. Imports from `data/` into `logic/` or `ui/` in the wrong
  direction: **zero**.
- **SC-013**: Unit tests exist for the route resolver and the menu composable,
  covering both translation directions, the home case, the round trip, the
  unknown-path case, and each of the four close triggers.
- **SC-014**: All five quality gates pass: lint/format, type check, tests,
  static generation, catalogue build.

## Assumptions

Each assumption is a decision made because no source documents the value or
because two sources disagree. **A-01, A-02 and A-03 are values no document
contains** and are the ones the approval gate most needs to look at.

- **A-01 · The layout breakpoint — UNVERIFIED, no source. Resolved 2026-09-07,
  see Clarifications**: the design has exactly two frames, 390px and 1440px,
  and no intermediate one (`rules.md` § R5). No document states the width at
  which the Nav swaps arrangements and the footer reflows. **Decision: 1024px**
  — the desktop nav carries a lockup, two links, a padded button and the
  toggle, which is too much for a 768px row, and the footer's four columns plus
  the brand block need `340 + 912 = 1252px` of content before margins, so they
  cannot sit at their designed widths below roughly 1400px anyway.
  **Consequence**: between 1024px and 1440px the four columns are narrower than
  their designed 180px, which FR-060 already requires them to tolerate.
  **Owner: Clau** (a frame at an intermediate width would settle it).
  **Reversal cost: one breakpoint name.**
- **A-02 · Behaviour above 1440px — UNVERIFIED, no source. Resolved 2026-09-07,
  see Clarifications**: no frame exists wider than 1440px and no document
  states whether content caps there. **Decision: the content caps at 1440px and
  centres**, with the page margin token continuing to supply the gutter below
  that width. Rationale: the existing page-margin token already clamps at 80px
  above 1440px, so without a cap a 2560px screen would spread the footer's four
  columns across 2400px — a layout no frame ever showed. **Owner: Clau.**
  **Reversal cost: one container rule.**
- **A-03 · The page background is not in this feature — UNVERIFIED scope
  boundary**: the mobile-menu frame stacks a `BG · base` and a `Dotted paper`
  layer beneath its glass panel, and `ui-map.md` § 10 describes the dotted
  paper as covering the whole page. No feature in `feature_list.json` owns it.
  **Decision: the layout supplies the flat ink-500 surface only** (confirmed by
  `content.md` § *Dirección visual*: the site is dark end to end); the dotted
  paper and the section glows are left to the feature that builds the page
  backgrounds. The menu's glass therefore blurs whatever the page paints, which
  is the frame's intent — repainting the two layers inside the menu would
  double them. **Consequence**: until that feature lands, Nav and Footer are
  reviewed against flat ink-500, which is exactly the objection feature 5's own
  description raised. **Owner: Roberto** (scope). **Reversal cost: two CSS
  declarations on the layout, whenever it is scheduled.**
- **A-04 · There is no visual active-page state**: `ui-map.md` § 2 says
  Nosotros "queda activo ahí", but § 9.bis verified the Nav is **byte-identical**
  between the two pages, which means the design draws no active treatment.
  **Decision: expose the current page to assistive technology only**, with no
  visual change. This honours both sources: nothing visual is invented, and the
  information is not lost. **Owner: Clau.** **Reversal cost: one class.**
- **A-05 · The Nav is static, not sticky**: `decisions-open.md` #5 (owner Clau
  and Roberto, classified **non-blocking**) asks whether the nav becomes fixed
  on scroll, and notes there is no frame for the compressed state. The design as
  drawn places it at the top of the page. **Decision: static, as drawn.**
  Building a sticky state would require inventing the compressed appearance the
  decision itself says is missing. **Reversal cost: a position rule plus the
  frame Clau would have to draw.**
- **A-06 · The hairline unification did not survive the migration —
  CONFIRMED against the repository**: `rules.md` § R11 and
  `decisions-open.md` say the footer hairline "se unificó a bone-100 @12%" in
  code. That was the Astro implementation. The current
  `app/assets/css/global.css` contains **no hairline token at all** — verified
  by inspection. This feature therefore *creates* that unification rather than
  inheriting it (FR-042). The underlying design discrepancy — two colours for
  one line, one of them off-palette — is **still open and still Clau's**, and
  is deliberately not silently fixed here.
- **A-07 · Tracking uses the desktop `em` value**: several shell roles convert
  to slightly different `em` values at the two frames (tagline −0.030 desktop
  vs −0.034 mobile; category 0.075 vs 0.082; toggle 0.062 vs 0.067). The
  desktop value is used throughout, as feature 1 already did for the shared
  scale. Worst-case drift is under 0.07px. The footer column title is the happy
  case: `1.2 ÷ 12` and `1.1 ÷ 11` are both exactly 0.1em.
- **A-08 · The shell does not use every primitive the acceptance criteria
  name**: criterion 7 lists Pill and LinkArrow among the primitives to reuse.
  The design places **neither in the shell**: § 3 lists all eleven Pill
  instances and every one is a section eyebrow, and § 7 lists all four LinkArrow
  instances (hero and final CTA, desktop and mobile) and none is in the footer.
  The footer's `Agenda una llamada` is a plain 15px column item — and is
  non-interactive anyway under FR-039. GlassPanel is likewise not used: the menu
  panel has the dark fill but no border, radius or padding, and the hamburger
  and close controls have their own geometry. **Decision: compose only what the
  design places — the lockup, the primary button and the social button.**
  Flagged here rather than silently omitted.
- **A-09 · Alternate-language metadata is an addition**: FR-022 is not in the
  feature's acceptance criteria. It is included because Article VI names the
  broken-`hreflang` failure mode explicitly and the route map that prevents it
  is being built here anyway. It can be trimmed at the approval gate.
- **A-10 · Remembering the locale choice is deferred**: `ui-map.md` § 1 says
  the language choice is remembered in `localStorage` for later visits to the
  home, and never to override a direct link. It is in none of the acceptance
  criteria, and on a static site it would mean adding client-side redirection
  logic on top of the root redirect the routing configuration already generates.
  **Decision: out of scope for this feature**, recorded here so it is deferred
  deliberately rather than dropped. **Owner: Roberto** (scope).
- **A-11 · The LinkedIn URL shape is still unconfirmed**: `branding.md` and
  `overview.md` record the handle `/muush-dev`; § 9.bis records the destination
  only as "linkedin.com". Nobody documents whether it is a company page or a
  personal profile. Company page is assumed, as `rules.md` § R13 already
  recorded, and the value lives in one place in the shell's data so correcting
  it is one line. **Still pending Clau.**
- **A-12 · The copyright year is a literal**: § 9.bis records
  `© 2026 muush · …`. It is carried as written. A static site bakes it at build
  time, so it will need editing — or a build-time substitution — in January.
  Recorded so the staleness is a known cost rather than a surprise.
- **A-13 · The hamburger and the close control are not the same size**: § 9.bis
  gives the hamburger padding `[12,11]` around two 16-wide bars — 38 wide and
  about 32 tall — and the close control padding `10` around an 18×18 glyph —
  38×38. Both are implemented exactly as recorded. If they were meant to match,
  that is Clau's correction to the design file, not an implementation choice.
- **A-14 · Static output shape must be verified, not assumed**: `rules.md`
  § R10 concluded that internal links need a trailing slash, derived from
  Astro's `build.format: 'directory'`. **That derivation does not transfer** —
  Nuxt and Nitro generate static output on their own terms. Whether the
  generated files require, tolerate or reject a trailing slash MUST be verified
  against a real `pnpm generate` output during planning, and the finding
  recorded. Assuming either way risks every internal link on the site.
- **A-15 · Component tests for the feature module extend the test
  configuration**: the current configuration scans `tests/` and
  `app/shared/ui/` only (`rules.md` § R16 explains why it is one global
  environment). Honouring Article X for this module requires widening that
  include — the only configuration file this feature touches.
- **A-16 · The desktop footer's Top row is over-constrained in the design —
  DISCREPANCY, resolved 2026-09-07, see Clarifications**: § 9.bis records three
  values that cannot all hold at the 1440px frame. The footer's content box is
  `1440 − 80 − 80 = 1280`. The brand block is 340 wide. The four columns are
  `4 × 180 + 3 × 64 = 912` wide. Those two already total **1252**, leaving
  **28px**, but § 9.bis records the gap between them as **80** — a shortfall of
  52px. **Decision: the gap yields.** The row is `space_between`, which § 9.bis
  also records, and `space_between` distributes whatever is left rather than
  honouring a declared gap; at exactly 1440px it realizes 28px. The brand block
  keeps its 340 and the columns flex (FR-060). **This is a genuine
  inconsistency in the design file, not an implementation choice** — flagged
  for Clau alongside the hairline of A-06. **Reversal cost: one layout rule.**
  Note the mobile frame has no such conflict: `390 − 24 − 24 = 342`, and two
  columns with a 20 gap divide it evenly at 161 each — the same 342 the menu's
  items and divider use.

## Out of Scope

- The content of the About page: team, network and the application form.
- Any landing section: hero, purpose, services, projects, final CTA.
- Either form, and the endpoint decision (`decisions-open.md` #1) behind them.
- The dotted-paper page background and the section glow composition (A-03).
- A sticky or compressed nav state (A-05).
- Remembering the locale in `localStorage` (A-10).
- Writing the FAQ page or sourcing the Google Calendar link — this feature
  renders the absence correctly (FR-039); it does not resolve
  `decisions-open.md` #2 or #3.
- Correcting the design file's off-palette hairline (A-06) — flagged for Clau.
- Any change to the nine existing primitives' signatures.
- End-to-end tests. Article X puts them out of scope for the repository.

## Dependencies

- **Feature 2 (`done`)** — the lockup, wordmark, primary button and social
  button the shell composes, with the signatures fixed in
  `specs/002-primitive-ui-layer/contracts/components.md`.
- **Feature 1 (`done`)** — the ramps, the fluid scale and the asset pipeline
  this feature extends with the shell's own tokens.
- **Feature 5 (`done`)** — listed as a dependency in `feature_list.json` so the
  shell would be reviewed over the real background. Under A-03 the shell does
  not compose it; the dependency is satisfied by the primitive existing.
- **`docs/business/landing/design-extract.md` §§ 8, 9.bis, 10** — the sole
  source of shell measurements and of the ES/EN copy.
- **`docs/business/landing/ui-map.md` §§ 1, 2, 8** — behaviour and
  destinations.
- **`docs/business/landing/decisions-open.md`** — the resolved routing
  strategy, and the two open footer decisions #2 and #3 this feature must
  render around rather than resolve.
- **`docs/business/rules.md` §§ R9, R11, R12, R13, R14, R16, R18** — rules the
  previous cycle recorded for exactly this feature, plus the two system rules
  that would otherwise be rediscovered the hard way.
- **The routing configuration already in place** — both locales prefixed, no
  browser detection, Spanish the default. This feature adds the translated
  About paths to it; it does not change the strategy.

## Downstream consumers

Every later feature renders inside this layout and inherits this Nav and
Footer. The landing sections must supply the anchors the shell already points
at — `#proposito`, `#servicios`, `#proyectos`, `#contacto` — and the About
feature must supply `#work`. Until they exist, those destinations resolve to a
page that lacks the target, which is a missing section rather than a broken
link, and is why they are listed here.
