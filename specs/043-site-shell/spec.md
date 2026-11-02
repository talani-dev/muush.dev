# Feature Specification: Muush 1.0 site shell — floating nav, smart header, mobile menu and footer

**Feature Branch**: `feat/v2-site-shell` (cut from `muush-v2`, merges back into `muush-v2`, never into `master`)
**Feature**: 43 `m1_site_shell` · `sdd: true` · depends on 42 (done)
**Created**: 2026-11-01
**Status**: Approved by Roberto 2026-11-01 (spec_ready gate passed; every clarification confirmed, see Clarifications)
**Input**: User description: "Feature 43 `m1_site_shell` — the v2 shell: floating nav, smart header, full-screen mobile menu, desktop and mobile footer, v2 lockup and social icons, section anchors, favicon in Red muush 500, retirement of the spotlight, dotted paper and section glows, and the five items inherited from feature 42's review." (full text in `feature_list.json`, id 43)

> The feature name `m1_site_shell` is a historical identifier. Nothing this
> feature creates (file, component, token, utility, story) carries a version
> marker (Constitution 2.1.2, Article VII).

## Context

Feature 42 built the v2 vocabulary (tokens, primitives, shader backgrounds).
This feature builds the **chrome every page inherits** with it: the header
(desktop floating nav and mobile bar), the full-screen mobile menu and the
footer. It also removes from the layout what the v2 design no longer has, and
closes the follow-ups feature 42's review left open. It builds **no** page
section: home, Nosotros, Preguntas and 404 content arrive in 44–46.

### Sources of truth (in order of precedence)

1. `docs/harness/progress/pen-extract-43.md`: values the leader extracted from
   `muush.pen` on 2026-11-01, plus Roberto's answers in its § 9. **The `.pen`
   wins** over every other source (`rules.md` § R32). The spec author cannot
   open the `.pen` and has not.
2. `docs/business/muush-1.0.md`: authoritative v2 decisions and approved copy
   (§ 1, § 4.1, § 4.7, § 4.9).
3. `docs/handoff/muush-1.0/` (README, `componentes/componentes.css/js`,
   `muush-gradient.js` `smartHeader`): reference behaviour, translated, never
   copied. Where its CSS differs from the pen extract (desktop header height 72
   vs 64, link radius 10 vs 999, menu list offset), the pen extract wins.
4. The v1 design documents supply no value to this feature.

### Settled decisions (cited, not re-decided)

- The logo does not change; its dot is Red muush 500 (`muush-1.0.md` § 1).
- The custom "You" cursor stays; the spotlight effect is retired (Roberto,
  2026-11-01, `muush-1.0.md` § 1).
- Privacy notice and Terms get their own pages in feature 48; until then their
  footer entries are plain text (feature 43 acceptance).
- Preguntas lives at `/es/preguntas` ↔ `/en/faq`, built in feature 46.
- Social buttons keep the designed boxes and carry the real brand SVGs from the
  repo in Blanco (Roberto, 2026-11-01, pen extract § 9 Q2).
- Nav links scroll to their sections; the logo is the home link; there is no
  separate Home item (Roberto, 2026-11-01, pen extract § 9 Q1).
  **Superseded the same day — Home link added by Roberto 2026-11-01:** see
  "Amendment 2026-11-01" at the end of this spec.
- The primary CTA reads "Diagnóstico gratis" / "Free assessment".
- 390 px and 1440 px must match the `.pen`; other widths may adapt sizes and
  spacing, never colour, components, copy or behaviour (AGENTS.md § 3.1).
- No version bump in this feature.

## User Scenarios & Testing *(mandatory)*

"Visitor" is anyone on `/es/…` or `/en/…`. "Reviewer" is Roberto, approving
the shell in the component catalogue and on the `muush-v2` build.

### User Story 1 - Find my way on desktop (Priority: P1)

A desktop visitor sees a floating glass nav near the top of every page: the
muush lockup on the left (it returns home), the three section links in a
centred glass bar, and on the right the language button and the "Diagnóstico
gratis" button. Clicking a link takes them to that section or page.

**Why this priority**: the nav is on every page and is the main way to move
around the site.

**Independent Test**: render the nav at 1440 px in ES and EN in the catalogue
and on the integration build; compare it with pen extract § 2; click every
control.

**Acceptance Scenarios**:

1. **Given** a 1440 px window on `/es`, **When** the page loads, **Then** the
   nav is a 1280 × 64 row 24 px from the top, with the 176 × 31 lockup, the
   347 × 50 link bar (Servicios · Nosotros · Preguntas) and the 40 × 40
   language button showing "ES" next to the 195 × 40 "Diagnóstico gratis"
   button.
2. **Given** `/en`, **When** the page loads, **Then** the bar reads Services ·
   About · FAQ, the language button shows "EN" and the button reads "Free
   assessment".
3. **Given** any page, **When** the visitor activates the lockup, **Then** they
   reach the home page of the current locale.
4. **Given** any page, **When** the visitor activates "Servicios", **Then**
   they reach the Servicios section of the current locale's home page; when
   already on the home page it scrolls there without a reload.
5. **Given** any page, **When** the visitor activates "Diagnóstico gratis",
   **Then** they reach the diagnostic section of the current locale's home.
6. **Given** any page, **When** the visitor activates "Nosotros", **Then** they
   reach `/es/nosotros` (or `/en/about`).

---

### User Story 2 - Switch language without losing my place (Priority: P1)

A visitor presses the language button and lands on the same page in the other
language. Nothing about features 33, 37 and 39 regresses.

**Why this priority**: Constitution Article VI is non-negotiable and the
toggle is the only switching path.

**Independent Test**: the existing LanguageToggle, locale-preference and
not-found locale tests pass unchanged in behaviour; a manual check of each
case below on the generated site.

**Acceptance Scenarios**:

1. **Given** `/es/nosotros`, **When** the visitor presses the language button,
   **Then** they reach `/en/about`, resolved through the i18n route map (never
   by swapping the prefix as a string).
2. ~~**Given** the URL has a fragment (e.g. `/es#servicios`), **When** they press
   it, **Then** they reach `/en#servicios`.~~ **Superseded by FR-061 (Roberto 2026-11-01):** the
   fragment is dropped and the visitor keeps their section and relative offset.
3. **Given** any page, **When** they press it, **Then** the locale-preference
   cookie of feature 33 records the destination locale.
4. **Given** the not-found page, **When** they press it, **Then** the page
   switches language in place and the URL does not change (feature 39).
5. **Given** scripting is off, **When** they press it, **Then** the link still
   navigates to the equivalent page.
6. **Given** the open mobile menu, **When** they press the language button in
   it, **Then** the same rules apply and the menu closes.

---

### User Story 3 - Navigate on a phone (Priority: P1)

A phone visitor sees a compact glass bar with the isotipo, the language button
and a menu button. Opening the menu covers the screen with glass over a slow
listón; it shows the three links, a divider and the three social buttons. It
closes with the X, with Esc, or by choosing a link.

**Why this priority**: most visitors arrive on phones, and the menu is their
only navigation.

**Independent Test**: open and close the menu at 390 px in ES and EN with
touch, keyboard and a screen reader; compare it with pen extract §§ 3–4.

**Acceptance Scenarios**:

1. **Given** a 390 px window, **When** the page loads, **Then** the bar is
   342 × 60 at 16 px from the top and 24 px from each side, with the 40 × 22
   isotipo and two 36 × 36 radius-12 controls (language, menu).
2. **Given** the closed menu, **When** the visitor activates the menu button,
   **Then** a full-screen layer opens: Negro 950 base, the menu listón, a
   Negro 950 70 % glass with 24 px blur, the same top bar with "Cerrar" in
   place of the menu button, the links in Poppins 32 / 500 with no arrows, a
   divider and three 48 × 48 social buttons with the real brand icons.
3. **Given** the open menu, **When** the visitor presses the X, presses Esc or
   chooses a link, **Then** the menu closes; a chosen link then navigates.
4. **Given** the open menu, **When** the visitor tries to scroll, **Then** the
   page behind does not move; after closing, the page is where it was.
5. **Given** the menu opens from the keyboard, **When** it opens, **Then**
   focus moves into the menu, Tab never leaves it, and the page behind is not
   reachable by keyboard or screen reader.
6. **Given** the menu closes without navigating, **When** it closes, **Then**
   focus returns to the menu button.
7. **Given** reduced motion, **When** the menu opens, **Then** it appears with
   no transition and the listón shows one still frame.

---

### User Story 4 - A header that gets out of the way (Priority: P2)

While reading, the header slides away as the visitor scrolls down and comes
back as soon as they scroll up.

**Why this priority**: it is designed behaviour shared by every page, but the
site is usable without it.

**Independent Test**: unit tests of the visibility rule with simulated scroll
positions; a manual scroll on the integration build with and without reduced
motion.

**Acceptance Scenarios**:

1. **Given** the page is within 80 px of the top, **When** the visitor scrolls
   in either direction, **Then** the header stays visible.
2. **Given** the page is past 80 px, **When** the visitor scrolls down,
   **Then** the header hides.
3. **Given** the header is hidden, **When** the visitor scrolls up by any
   amount, **Then** it reappears.
4. **Given** the mobile menu is open, **When** anything scrolls, **Then** the
   header never hides.
5. **Given** reduced motion, **When** the header hides or reappears, **Then**
   it does so without animation.
6. **Given** keyboard focus moves onto a header control while it is hidden,
   **When** that happens, **Then** the header reappears.

---

### User Story 5 - Know where I am (Priority: P2) — confirmed by Roberto 2026-11-01

The link bar marks the item for where the visitor is: the page's own item on
Nosotros and Preguntas, and on the home page "Servicios" while the Servicios
section is in view. Nothing is marked at the top of the home page or on the 404.

**Why this priority**: orientation aid. The scroll-spy rule was confirmed by
Roberto 2026-11-01 (pen extract § 9, Q1).

**Independent Test**: unit tests of the active-item rule; scroll the home page
on the integration build.

**Acceptance Scenarios**:

1. **Given** the top of the home page, **When** it loads, **Then** no item is
   marked.
2. **Given** the home page, **When** the Servicios section is in view, **Then**
   "Servicios" shows the active fill, Blanco text and the 6 × 6 red dot; when
   it leaves the view, the mark goes away.
3. **Given** `/es/nosotros`, **When** it loads, **Then** "Nosotros" is marked
   and announced as the current page.
4. **Given** the 404, **When** it loads, **Then** no item is marked.
5. **Given** scripting is off, **When** the home page loads, **Then** no item
   is marked (route marks still render).

---

### User Story 6 - Reach muush from the footer (Priority: P1)

Every page ends with the footer. On desktop: brand block and four columns
(Navigation, Contact, muush, Social) above a copyright and legal row. On a
phone: brand, then the three contact channels as large buttons, the links on
one wrapped line, the social buttons and the legal block.

**Why this priority**: the footer carries every contact channel on every page.

**Independent Test**: render the footer at 1440 and 390 in ES and EN; compare
with pen extract § 6; follow every link.

**Acceptance Scenarios**:

1. **Given** 1440 px, **When** the footer renders, **Then** it shows the lockup,
   the tagline and "Technology Solution Studio.", and the columns
   NAVEGACIÓN / CONTACTO / MUUSH / REDES with the links of pen extract § 6.
2. **Given** 390 px, **When** the footer renders, **Then** WhatsApp, Agenda una
   llamada and support@muush.dev come first as full-width buttons with their
   hints, followed by the one-line links, three 44 × 44 social buttons and the
   legal block.
3. **Given** the WhatsApp entry, **When** activated, **Then** it opens the
   existing WhatsApp link with the locale's pre-filled message in a new tab;
   "Agenda una llamada" opens the existing booking URL in a new tab; the
   e-mail entry opens a `mailto:` in the same tab.
4. **Given** "Blog · próximamente", "Aviso de privacidad" and "Términos y
   condiciones", **When** inspected, **Then** none is a link (until feature 48
   for the legal ones).
5. **Given** "Trabaja con muush", **When** activated, **Then** it reaches the
   Nosotros page's work-with-muush section in the current locale.

---

### User Story 7 - The canvas the v2 sections need (Priority: P2)

The reviewer sees the page canvas as plain Negro 950: the v1 dotted paper,
the section glows and the red-dot spotlight are gone; the "You" cursor stays.
The favicon shows the Red muush 500 dot and the v2 stroke.

**Why this priority**: required for 44–46 to compose their shader sections on
a clean canvas; it supersedes one acceptance line of feature 42 on purpose.

**Independent Test**: load each page on the integration build with a mouse:
no dots, no glow, no red spotlight; the "You" cursor is still there; tab
favicon is the red-dot mark.

**Acceptance Scenarios**:

1. **Given** any page, **When** the pointer moves, **Then** no lit dots appear
   and no dotted grid is painted. This **supersedes** feature 42's acceptance
   line "El cursor personalizado y el spotlight (features 8 y 34) siguen
   funcionando" for the spotlight half, by Roberto's decision of 2026-11-01.
2. **Given** a fine pointer, **When** it hovers the page, links and text
   fields, **Then** the "You" cursor behaves as in features 34 and 42.
3. **Given** any page, **When** it renders, **Then** no v1 section glow is
   visible.
4. **Given** a browser tab, **When** the site is open, **Then** the favicon's
   dot is Red muush 500 `#E5352F`, its stroke is Negro 950 on light chrome
   and Blanco on dark, and its shape is unchanged.

---

### User Story 8 - Feature 42 follow-ups closed (Priority: P3)

The reviewer finds each of the five follow-ups inherited from review-42b
(advisories 1, 2, 3, 5, 7) either fixed or carrying a recorded decision.

**Independent Test**: read the implementation report's follow-up table; run
the tests named in FR-045 to FR-049.

**Acceptance Scenarios**:

1. **Given** a shader chunk that fails to load, **When** a background starts,
   **Then** it falls back to its poster, its fallback state becomes true and no
   unhandled rejection is logged.
2. **Given** the glass button, **When** its props are read, **Then** there is no
   `size` prop.
3. **Given** `global.css`, **When** read, **Then** no comment says the layout
   paints an ink-500 base.
4. **Given** the catalogue, **When** opened, **Then** v2 Lockup, Wordmark and
   social icon exist outside `Legacy v1/`, and the v1 ones stay quarantined.
5. **Given** the feature 42 primitives, **When** reviewed at 360, 768, 1024,
   1280 and 1920 px and under emulated forced colours, **Then** the result is
   recorded (pass, or each defect with a decision).

---

### Edge Cases

- **Widths between anchors.** The header switches from mobile bar to desktop
  nav, and the footer from mobile to desktop layout, at 1024 px. At 1024 the
  desktop nav must fit without overlap: lockup, link bar and right group may
  shrink spacing (responsive latitude), never drop an item. At 360 the mobile
  bar, menu and footer must show no horizontal scroll or clipped text.
- **Resize to desktop with the menu open.** The menu closes and the scroll
  lock is released (existing behaviour of `useMobileMenu`).
- **Browser back or forward with the menu open.** The menu closes.
- **Anchor link while already on the home page.** It scrolls (smoothly unless
  reduced motion) and the target section's heading is not hidden under the
  header.
- **A link to a section that does not exist yet** (`#como-trabajamos` until
  feature 44). The home page opens at its top. No 404.
- **No scripting.** The header and footer render and every link works. The
  menu button is absent (the menu needs scripting, as in v1); on phones the
  footer remains the full navigation. The header never hides.
- **No WebGL in the open menu.** The menu has no poster; the Negro 950 base and
  the glass show, with no listón. Text stays legible.
- **404 page.** No active item. The language button switches in place.
- **Forced colours.** Controls keep a visible boundary and readable labels;
  the "You" cursor yields to the system cursor (unchanged).
- **Very long translated labels.** Footer columns wrap; the link bar never
  wraps at 1024 px and above.
- **Print.** The header and the open menu do not print.

## Requirements *(mandatory)*

### Functional Requirements

#### Header — desktop (≥ 1024 px)

- **FR-001**: The desktop header MUST be a 1280-wide (at 1440) row, 64 tall,
  24 px from the viewport top, centred, with three slots laid out with
  space-between: lockup, link bar, right group (pen extract § 2). The link bar
  is the middle slot (centre of the free space, not of the row).
- **FR-002**: The link bar MUST be a pill (radius 999) filled Negro 900 at
  45 %, with a 1 px top-lit edge Blanco 20 % → 4 %, 24 px backdrop blur,
  padding 6, gap 6.
- **FR-003**: Each link item MUST be Instrument Sans 15 / 500, padding 10 / 18,
  radius 999. Inactive: no fill, Blanco 70 % text. Active: Blanco 8 % fill,
  Blanco text and a leading 6 × 6 Red muush 500 dot (gap 8). Order: Servicios ·
  Nosotros · Preguntas (EN Services · About · FAQ), subject to FR-024.
- **FR-004**: The right group (gap 12) MUST hold the language button (40 × 40,
  radius 999, Negro 900 45 % fill, 1 px Blanco 15 % stroke, 20 px blur,
  Instrument Sans 12 / 600 Blanco, showing the **current** locale code) and the
  primary button at its nav size from feature 42 ("Diagnóstico gratis" /
  "Free assessment", 195 × 40) linking to the diagnostic section of the
  current locale's home. The button is **always shown, on every page,
  including the home page at its top and the 404** (Clarifications Q1,
  confirmed by Roberto 2026-11-01): the v1 hero-reveal (feature 9) and the 404 removal (feature
  36) no longer apply.
- **FR-005**: The lockup (176 × 31) MUST link to the current locale's home.

#### Header — mobile (< 1024 px)

- **FR-006**: The mobile header MUST be a 60-tall bar 16 px from the top, inset
  by the page gutter (24 at 390), radius 18, Negro 900 45 % fill, 1 px Blanco
  12 % stroke, 20 px blur, padding 0 10 0 16, space-between (pen extract § 3).
- **FR-007**: It MUST show only the isotipo (40 × 22, linking home) on the left
  and, on the right with gap 8, the language button and the menu button. Both
  are 36 × 36, radius 12, 1 px Blanco 20 % stroke, no fill; language shows the
  current locale code in 12 / 600 Blanco; the menu button shows three Blanco
  lines 16 × 1.5, radius 1, gap 4. There is no CTA in the mobile header.
- **FR-008**: The menu button MUST exist only when scripting is available and
  expose its open state to assistive technology.

#### Header — behaviour

- **FR-009**: The header MUST float over the page content (it does not take
  space in the flow), so a section's background can run beneath it.
- **FR-010**: The header MUST stay visible within the first 80 px of scroll;
  past 80 px it MUST hide on downward scroll and reappear immediately on any
  upward scroll. The v1 anti-bounce threshold (10 px of continuous downward
  movement, feature 26) is kept.
- **FR-011**: The header MUST NOT hide while the mobile menu is open.
- **FR-012**: Under reduced motion, hiding and showing MUST NOT animate.
- **FR-013**: A hidden header MUST reappear when one of its controls receives
  keyboard focus.
- **FR-014**: Following an in-page link MUST leave the target section's top
  visible below the header (the header does not cover it).

#### Mobile menu

- **FR-015**: The open menu MUST cover the whole viewport with, bottom to top:
  a Negro 950 base, the shader background with a **new** listón preset
  `{u_flip: 1, u_y0: 1.02, u_y1: 0.8, u_th: 0.06, u_amp: 0.03, u_tdark: 0}`
  that has **no poster**, and a Negro 950 70 % glass with 24 px blur
  (pen extract § 4).
- **FR-016**: Its top bar MUST be identical to FR-006/FR-007, with the menu
  button replaced by "Cerrar": same 36 × 36 box with a 14 × 14 X drawn in
  Blanco, 1.6 stroke, round caps.
- **FR-017**: The items MUST be a column starting 150 px from the top (at 390),
  342 wide, gap 6; each row padding 16 / 0, label Poppins 32 / 500 Blanco, no
  arrows: Servicios · Nosotros · Preguntas (subject to FR-024). A 1 px Blanco
  12 % divider follows (at y 440), then the social row (at y 480): centred,
  gap 12, three 48 × 48 radius-12 buttons, Negro 900 45 % fill, 1 px Blanco
  20 % stroke, each with the brand SVG in Blanco.
- **FR-018**: The menu MUST close on the Cerrar control, on Esc, on choosing a
  link (before navigation), on a browser history navigation and on resizing to
  the desktop layout.
- **FR-019**: While open, the menu MUST lock background scroll and restore the
  exact scroll position on close.
- **FR-020**: On open, focus MUST move to the Cerrar control; Tab and Shift+Tab
  MUST stay within the menu; everything outside it MUST be unreachable by
  keyboard and hidden from assistive technology. On close without navigation,
  focus MUST return to the menu button.
- **FR-021**: The menu MUST be exposed as a modal dialog with an accessible
  name.
- **FR-022**: Its shader MUST run only while the menu is open and be released
  when it closes; under reduced motion it draws one still frame; without
  WebGL nothing is drawn and the base and glass remain.
- **FR-023**: The open/close transition MAY follow the handoff (fade at the
  medium duration, links rising 8 px, staggered 40 ms); under reduced motion
  there is none.

#### Navigation model

- **FR-024**: The Preguntas route does not exist until feature 46. Until then
  the Preguntas item MUST NOT render in the link bar, the menu or the footer
  (no dead link, no inert placeholder), following the precedent Roberto set in
  features 21 and 23. Feature 46 adds it back as one data entry per list
  (Clarifications Q5, confirmed by Roberto 2026-11-01).
- **FR-025**: The section anchors MUST be defined once, in a data module both
  the shell and the page features can import without crossing feature
  internals: home `servicios`, `como-trabajamos`, `diagnostico`; Nosotros
  `trabaja-con-muush`. Features 44 and 46 put these ids on their sections.
- **FR-026**: Every destination MUST be resolved by route name through the
  i18n route map; anchors resolve to "locale home (or Nosotros) + hash", never
  a bare fragment and never a string-swapped prefix.
- **FR-027**: Route items (Nosotros, later Preguntas) MUST be marked active on
  their own page and announced as the current page.
- **FR-028** *(confirmed by Roberto 2026-11-01)*: On the home page, the "Servicios" item MUST be
  marked active while the Servicios section is in view and not otherwise; no
  item is marked at the top of the home page or on the 404. Without scripting
  no anchor item is marked. The server-rendered state equals the first client
  state (no hydration flash).
- **FR-029**: The language toggle MUST keep every behaviour of features 21,
  33, 37 and 39: route-map destination, ~~fragment preserved at click time~~ (superseded by FR-061, 2026-11-01),
  locale cookie written on every click, in-place switch on the not-found page
  with the home fallback, plain navigation without scripting, accessible name
  naming the destination locale. Only its appearance changes (FR-004, FR-007).

#### Footer

- **FR-030**: Desktop footer (≥ 1024): full width, transparent, 1 px Blanco 8 %
  top border, padding 72 80 40 80 at 1440, gap 56; top row space-between with
  the brand block (340 wide, gap 18: lockup 176 × 31, tagline Poppins 20 / 500
  Blanco tracking −0.4, "Technology Solution Studio." Instrument Sans 14 / 1.5
  Gris 400) and four columns (gap 72; each gap 14; heading Instrument Sans
  11 / 600, tracking 1, uppercase, Gris 400; links 15 / 400 Blanco 85 %).
- **FR-031**: Columns and entries (ES / EN), per pen extract § 6:
  - NAVEGACIÓN / NAVIGATION: Servicios, Cómo trabajamos, Nosotros;
  - CONTACTO / CONTACT: Diagnóstico gratis, Agenda una llamada,
    support@muush.dev, WhatsApp;
  - MUUSH: Trabaja con muush, Preguntas (subject to FR-024), "Blog ·
    próximamente" (text, not a link);
  - REDES / SOCIAL: LinkedIn, Instagram, TikTok (text links).
- **FR-032**: Desktop bottom row: 1 px Blanco 8 % top border, padding-top 24,
  space-between; left the copyright, right "Aviso de privacidad" and "Términos
  y condiciones" (gap 24), all 13 / 400 Gris 400. The two legal entries are
  plain text until feature 48 creates their routes.
- **FR-033**: Mobile footer (< 1024): 1 px Blanco 8 % top border, padding
  48 24 32 24, gap 24, in this order: brand (gap 10: lockup 176 × 31, tagline
  Poppins 17 / 500, "Technology Solution Studio." 12 / 400 Gris 400); contact
  buttons (gap 8; full width, Negro 900 70 % fill, radius 14, 1 px Blanco 12 %
  stroke, padding 14 / 16, label 15 / 600 Blanco left, hint 13 / 400 Gris 400
  right: WhatsApp "Escríbenos →", Agenda una llamada "30 minutos →",
  support@muush.dev "Correo →"; EN "Message us →", "30 minutes →",
  "Email →"); the links on one wrapped line (15 / 400 Blanco 70 %: Servicios ·
  Cómo trabajamos · Nosotros · Preguntas (FR-024) · Trabaja con muush · Blog
  (próximamente)); the social row (gap 10, three 44 × 44 radius-12 buttons,
  1 px Blanco 20 % stroke, no fill, brand SVG in Blanco); the legal block
  (gap 6, 1 px Carbón 700 top border, padding-top 16, 12 / 400 Gris 400:
  "Aviso de privacidad · Términos y condiciones", then the copyright).
- **FR-034**: Contact destinations MUST reuse the existing data: WhatsApp URL
  with the locale's pre-filled message, the call-booking URL, `mailto:` for
  the support address, the three social profile URLs. External links open in
  a new tab with the opener severed; `mailto:` stays in the same tab.
- **FR-035**: Every social control MUST have an accessible name naming the
  network; the glyph is decorative.

#### Brand marks

- **FR-036**: A v2 lockup MUST render the isotipo (Blanco stroke, Red muush 500
  dot, geometry unchanged) and the wordmark ("muush" Blanco, "." Red muush
  500, "dev" Gris 400, Poppins 22, baseline aligned) with gap 10, 176 × 31 at
  1440; and an isotipo-only form at 40 × 22. The isotipo uses exactly the
  existing logo SVG geometry from `app/assets/logo/` **including its stroke**
  (12 in viewBox units, about 6.8 px at 40 wide), **not** the thinner stroke
  the design draws; only the colours change: Blanco stroke on dark, Red
  muush 500 dot (Clarifications Q2, confirmed by Roberto 2026-11-01). The
  wordmark runs are "muush" Poppins 600, "." Poppins 600, "dev" Poppins 400,
  and Poppins 400 joins the self-hosted fonts (Clarifications Q3, confirmed
  by Roberto 2026-11-01; Constitution 2.1.2 Article VII allows it).
- **FR-037**: A v2 social icon MUST render the LinkedIn, Instagram and TikTok
  SVGs from the repo's social assets in the current text colour (Blanco
  where placed by the shell).
- **FR-038**: The favicon MUST keep its shape and framing, with the dot in Red
  muush 500 `#E5352F` and the adaptive stroke in the v2 neutrals: Negro 950
  `#050505` on light browser chrome and Blanco `#F4F4F2` on dark chrome. No
  v1 value remains in the file (Clarifications Q4, confirmed by Roberto
  2026-11-01).

#### Canvas and retirements

- **FR-039**: The layout MUST stop rendering the dotted paper and the cursor
  spotlight. This supersedes feature 42's "spotlight sigue funcionando"
  acceptance (Roberto, 2026-11-01), and the tests that pinned the spotlight in
  the layout MUST say so.
- **FR-040**: No v1 section glow MUST be visible on any page after this
  feature. The glow components stay quarantined until feature 47 deletes them.
- **FR-041**: The "You" cursor MUST keep working exactly as in features 34 and
  42.
- **FR-042**: The v1 shell components this feature replaces (nav, mobile menu,
  footer and its column) and those that stay rendered until feature 46 (the
  v1 404 content) MUST live in a quarantine location with their stories under
  `Legacy v1/`. No v1 shell story may remain outside `Legacy v1/`, and no v2
  shell file may import from a quarantine location.
- **FR-043**: Every new or rewritten shell component, and the v2 brand marks,
  MUST use only v2 tokens: no hex, rgb or px literals and no v1 token.

#### Copy

- **FR-044**: All visible strings and accessible names MUST live in the ES and
  EN locale files with both locales present; v1 shell keys no longer used are
  removed in both. The i18n parity test stays green.

#### Inherited from feature 42 (review-42b)

- **FR-045** (advisory 1): A shader source that fails to load MUST put the
  background in its fallback state with no unhandled rejection, pinned by a
  test.
- **FR-046** (advisory 2): The unused `size` prop of the glass button MUST be
  removed.
- **FR-047** (advisory 3): The two stale `global.css` comments MUST describe the
  Negro 950 canvas and, after FR-039/FR-040, the reduced layer stack.
- **FR-048** (advisory 5): v2 Lockup, Wordmark and social icon replace the v1
  ones in the shell (FR-036, FR-037); the v1 ones stay in quarantine until 47.
- **FR-049** (advisory 7): The feature 42 primitives MUST be reviewed at 360,
  768, 1024, 1280 and 1920 px and under emulated forced colours, with the
  result recorded in the implementation report. Defects are fixed if they are
  within this feature's files, otherwise recorded with an owner.

#### Quality

- **FR-050**: Every new component MUST have catalogue stories at both anchor
  viewports with ES and EN copy and component tests; every new composable and
  data module MUST have unit tests (Article X).
- **FR-051**: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`,
  `pnpm storybook:build` and `./init.sh` MUST pass. The site stays static
  (Article IV).

### What changes visually on the live pages after 43

"Live" means the `muush-v2` integration build. Production does not change
until feature 47.

1. **New header and footer on every page** (home, Nosotros/About, 404, both
   locales) as described above. The v1 nav and its lighter Ink 500 footer band
   are gone.
2. **The header now floats.** The v1 nav took space in the flow; the v2 header
   does not. Every v1 page's first section moves up by the old nav row height
   and starts at the top of the viewport, under the floating header. On
   desktop the v1 hero and Nosotros hero text starts well below the header
   (top padding about 207 px at 1440, header bottom at 88); the v1 404 text
   starts about 8 px below it (96 vs 88). On phones the first line touches the
   header's lower edge: at 390 the v1 hero text starts at about 74 px and the
   404 at about 72 px, while the header bar ends at 76 px, so the glass bar
   overlaps the top 2–4 px of the first line until the visitor scrolls.
   Expected until 44 and 46 replace those sections; no compensation is added
   because the v2 sections need the header over their backgrounds (INFERRED
   from the token values, not seen in a browser).
3. **Plain Negro 950 canvas.** The dotted paper, every v1 section glow and the
   red-dot spotlight disappear. The v1 sections (Hero, Propósito, Servicios,
   Contacto on home; hero and Work with muush on Nosotros; the v1 404) render
   on flat near-black with their own content, cards and forms unchanged. The
   v1 404's rings stay.
4. **Nav items.** Servicios and Nosotros only (Preguntas returns in 46). The
   CTA "Diagnóstico gratis" points to the home's diagnostic section; the v1
   contact section now carries that id, so it still lands on the v1 form.
   "Cómo trabajamos" (footer) opens the home page at its top until 44.
   "Trabaja con muush" lands on the v1 Work with muush section.
5. **Favicon** dot shifts to Red muush 500 and its adaptive stroke to Negro
   950 / Blanco.
6. **The "You" cursor** is unchanged.

### Key Entities

- **Shell item**: a translated label and a destination (route, route + section
  anchor, external URL, or none), plus whether it is current.
- **Section anchor**: a stable id a page section carries and the shell links
  to; four exist (FR-025).
- **Social profile**: a network, its URL and its accessible name.
- **Contact channel**: label, hint and destination (mobile footer buttons).
- **Background preset "mobile menu"**: the listón with the FR-015 uniforms and
  no poster.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At 390 and 1440 px, the header, open menu and footer match the
  pen extract dimensions within 1 px (desktop nav 1280 × 64 at y 24; link bar
  347 × 50; mobile bar 342 × 60 at y 16; controls 36 × 36; social 48 × 48 and
  44 × 44; lockup 176 × 31; isotipo 40 × 22).
- **SC-002**: At 360, 768, 1024, 1280 and 1920 px, zero horizontal scroll,
  clipped text or overlap in header, menu and footer.
- **SC-003**: 100 % of the language-switch cases of User Story 2 pass, and all
  pre-existing LanguageToggle, locale-preference and not-found tests pass with
  only styling assertions changed.
- **SC-004**: A keyboard-only visitor can open the menu, reach every item, and
  close it with Esc, with focus never leaving the menu while open and landing
  back on the menu button after closing.
- **SC-005**: Zero dotted-paper, glow or spotlight elements are painted on any
  generated page; the "You" cursor rule is still emitted.
- **SC-006**: Zero links in the shell point to a route that does not exist;
  zero entries for Preguntas, Blog, privacy or terms are links before their
  features ship.
- **SC-007**: Zero hex, rgb or px literals and zero v1 tokens in the files
  this feature creates or rewrites under `app/`, checked by the automated scan.
- **SC-008**: Every follow-up of review-42b advisories 1, 2, 3, 5 and 7 is
  marked fixed or decided in the implementation report.

## Clarifications

### Session 2026-11-01

`/speckit-clarify` ran inside the spec_author subagent, which cannot reach
Roberto, so each answer was first applied as the recommended option. Roberto
approved the spec on 2026-11-01: every answer below, and the scroll-spy rule
(FR-028, User Story 5), is **confirmed by Roberto 2026-11-01**, with the
resolutions recorded at the end of feature 43 in `feature_list.json`. Two
answers changed at the gate: Q2 (the logo SVG is used as is, the design's
thinner stroke is not followed) and Q4 (the favicon stroke moves to the v2
neutrals too).

- Q1: Is the nav CTA "Diagnóstico gratis" always shown, or does it keep the v1
  rules (hidden while the home hero is on screen, feature 9; absent on the
  404, feature 36)? Options: A always shown on every page · B keep the home
  reveal, show on the 404 · C keep both v1 rules. → A: **A**, confirmed by
  Roberto 2026-11-01.
  The home frame draws it at the top of the page, the pen extract says every
  page uses the same nav, and both v1 rules came from v1 documents. Applied in
  FR-004. Consequence: the 404 shows two red buttons (nav and its own), as the
  `.pen` draws the nav there; Roberto confirmed it 2026-11-01.
- Q2: The pen extract gives the isotipo stroke as 3.4 at 40 × 22, half the
  stroke of the logo asset (12 units, ≈ 6.8 px at 40 wide). Options: A keep the
  existing geometry and stroke, recolour only · B use the `.pen` stroke (6
  units) · C ask the leader to re-check `uUENh`. → A: **A**, confirmed by
  Roberto 2026-11-01: do **not** follow the thinner stroke in the design; use
  exactly the existing logo SVG geometry from `app/assets/logo/` (stroke 12
  in viewBox units), changing only the colours (Blanco stroke on dark, Red
  muush 500 dot). Applied in FR-036.
- Q3: The `.pen` wordmark uses Poppins 600 ("muush", ".") and 400 ("dev"),
  while Constitution Article VII says "Poppins (weight 500) is used for the
  logo, the wordmark and headings". Options: A follow the `.pen` (600 / 400)
  and add Poppins 400 to the self-hosted fonts · B render all three runs at
  500 · C 600 / 500. → A: **A**, confirmed by Roberto 2026-11-01: "muush" 600,
  "." 600, "dev" 400, with Poppins 400 added to the fonts. Constitution 2.1.2
  (amended 2026-11-01) now states these weights in Article VII, so no
  Complexity Tracking entry remains. Applied in FR-036.
- Q4: The favicon "changes to Red muush 500". Does only the dot change, or do
  the adaptive stroke colours (#262626 / #FBF8F6, v1 values) move to v2
  neutrals too? Options: A only the dot · B dot plus stroke to Negro 950 /
  Blanco · C a solid Red muush 500 mark. → **B**, confirmed by Roberto
  2026-11-01: the dot is Red muush 500 and the adaptive stroke uses the v2
  colours (Negro 950 on light, Blanco on dark); no v1 hex remains; the
  geometry is kept. Applied in FR-038.
- Q5: What do the nav, menu and footer show for Preguntas before feature 46
  creates the route? Options: A omit the item until 46 · B show it as inert
  text · C link it anyway (404 until 46). → A: **A**, confirmed by Roberto
  2026-11-01. Roberto
  removed inert placeholders in features 21 and 23 ("a placeholder that looks
  clickable and leads nowhere"), and C ships a broken link. Applied in FR-024.
  Consequence on the integration build: two items in the link bar and the
  menu, one fewer entry in the MUUSH column and the mobile links line, until
  46.

## Assumptions

- **Folder number.** `043` matches the feature id, as 042 did.
- **Breakpoint.** Mobile ↔ desktop at 1024 px (`lg`), as the handoff and the
  pen extract state.
- **Header floating mechanism.** Fixed to the viewport (the handoff's
  `position: fixed`), not sticky in flow.
- **Anti-bounce threshold.** The v1 10 px continuous-downward rule (feature
  26, Roberto) is kept on top of the handoff's 80 px rule; it only filters
  bounce noise.
- **Section ids on v1 sections.** To keep shell links working on the
  integration build, the v1 contact section takes the id `diagnostico` and
  the v1 Work with muush section takes `trabaja-con-muush`, both from the
  shared anchors (the v1 hero's contact link follows). `servicios` already
  matches. INFERRED as the lowest-cost path; 44 and 46 replace those sections.
- **"Blog · próximamente"** renders as one text entry in the column's link
  style (desktop) and as "Blog (próximamente)" in the mobile line. The pen
  extract shows no separate style for "próximamente". INFERRED.
- **Copyright year** is copy ("© 2026"), as today.
- **The v1 404 content** keeps its own shortcuts, including Propósito, until
  feature 46 replaces it.
- **The nav CTA under no scripting** shows (no reveal logic, Clarifications
  Q1).
- **Menu stagger animation** is optional polish (FR-023); behaviour does not
  depend on it.

## Out of scope

- Page sections and their backgrounds (44–46); the Preguntas page and route
  (46); legal pages (48); deleting v1 components, tokens and stories, and the
  2.0.0 bump (47).
- Any change to the form contracts or the cursor design.
- Changing the main content container width (`<main>`); sections in 44–46
  decide full-bleed layout.

## Amendment 2026-11-01 — Home link added by Roberto 2026-11-01

Feature 43 was reopened after Roberto's Storybook review (`feature_list.json`,
"REABIERTA 2026-11-01"). Two changes; everything else in this spec stands.

### A · Home link

Supersedes the Settled decision "there is no separate Home item" and the
item lists of FR-003, FR-017, FR-031 and FR-033. The leader chose the
details below; Roberto may change them.

- **FR-052**: The desktop link bar, the mobile menu list, the desktop
  footer's NAVEGACIÓN / NAVIGATION column and the mobile footer's links line
  MUST start with a Home item labelled "Inicio" (ES) / "Home" (EN), from i18n
  keys (`shell.nav.homeLink`, `shell.footer.nav.home`).
- **FR-053**: It MUST point at the top of the home page of the current
  locale, resolved by route name through the route map (never a path
  literal). Clicked while already on that page with no hash, it MUST scroll
  to the top (the router alone ignores a link to the URL shown).
- **FR-054**: It MUST be marked current (`aria-current="page"`, the 6 px Red
  muush 500 dot and the active fill in the link bar) only on the home page
  while no spied section is in the reading band and none has been scrolled
  past — that is, above the first section. Never on another page, never on
  the 404. Server render and first client render agree: the prerendered home
  page shows it lit.
- **FR-055**: It uses the existing item styling of each place; the logo stays
  a home link too.

Amends FR-028: "no item is marked at the top of the home page" now reads
"only the Home item is marked at the top of the home page".

### B · Shader uniform defaults

The handoff was corrected on 2026-11-01 (`docs/handoff/muush-1.0/README.md`,
`muush-gradient.js` `MuushGradient.defaults()`): every uniform a preset does
not pass takes the `@default` from its `.glsl` doc comment.

- **FR-056**: Uniforms MUST be merged as shader `@default` → engine base
  (`u_speed`, `u_flip`, `u_grain`) → preset, each layer winning over the
  one before, as in the handoff engine. The hero listón and the acanalado
  ribs MUST draw (verified in a WebGL browser).

## Amendment 2026-11-01 — Static grain, Roberto 2026-11-01

Feature 43 was reopened a second time (`feature_list.json`, "REABIERTA 2").
Roberto saw the shader grain flicker "como ISO alto": in both shaders,
`finish()` seeded the grain hash with `fract(u_time*7.0)`, so the noise
changed every frame. His decision: keep the grain, make it static. This is a
deliberate, documented divergence from the handoff shaders; everything else
in this spec stands.

- **FR-057**: In `app/assets/shaders/liston.glsl` and
  `app/assets/shaders/acanalado.glsl`, the grain hash in `finish()` MUST NOT
  depend on `u_time` (it is `hash(gl_FragCoord.xy)`). Every other line stays
  identical to `docs/handoff/muush-1.0/shaders/m1-*.glsl`; a comment above
  `finish()` in each file records the divergence.
- **FR-058**: The grain texture stays: `u_grain` keeps its engine base of
  0.07 (0.03 since FR-060) and still scales the grain. Two frames of a running background MUST
  NOT differ by grain (only by the large-scale motion), verified in a WebGL
  browser; a unit test pins that the grain hash does not reference `u_time`.

## Amendment 2026-11-01 — Grain 0.03, Roberto 2026-11-01

Feature 43 was reopened a third time (`feature_list.json`, "REABIERTA 3").
Roberto found the static grain at 0.07 reads as a dirty texture on the black.
Everything else in this spec stands; the grain stays static (FR-057).

- **FR-060**: The engine base `u_grain` (`SHADER_DEFAULTS` in
  `app/shared/utils/shaderFrame.ts`) MUST be 0.03. The `.glsl` files keep
  their own `@default` of 0.07, which the engine base overrides (FR-056
  merge order). Supersedes the 0.07 in FR-058. Verified in a WebGL browser:
  the grain is still present but weaker, and the listón and the ribs draw.

## Amendment 2026-11-01 — Header logo isotipo-only, Roberto 2026-11-01

Added to the second reopen (`feature_list.json`, acceptance item 4). The
desktop `.pen` header shows the full lockup (isotipo + "muush.dev"); Roberto
changes that for the header only. Everything else in this spec stands.

- **FR-059**: The header logo, desktop and mobile, MUST be the isotipo
  alone (`Lockup form="isotipo"`, 40 × 22), with no wordmark at any width.
  The link keeps its accessible name from i18n, reusing the existing key
  `shell.nav.home` ("Inicio de muush" / "muush home"). The desktop and
  mobile footers keep the full lockup, unchanged. Supersedes the "lockup
  176 × 31" of the desktop header in FR-001 and FR-005, user story 1
  scenario 1 and pen extract-43 § 2; FR-036 (the v2 Lockup and Wordmark)
  stands, used by the footer.

## Amendment 2026-11-01 — Language switch keeps position, Roberto 2026-11-01

Feature 43 was reopened a fourth time (`feature_list.json`, "REABIERTA 4",
acceptance item 5). Roberto clicked "Servicios" (URL `…#servicios`),
scrolled down to the form and switched language: the other locale's page
opened at Servicios again. He wants only the language to change. Root
cause, confirmed in `@nuxtjs/i18n` (`runtime/routing/routing.js`):
`switchLocalePath` copies the current route's hash into the path it
returns, so on the client the toggle's `href` became `/en#servicios` and
Nuxt's router scrolled to that section. Everything else in this spec
stands.

- **FR-061**: A client-side language switch MUST keep the visitor where they
  are: the same anchored section (a `<section>` with an id inside `<main>`;
  the ids are the same in both locales) at the same relative offset within
  it, measured at the header's lower edge (`html`'s `scroll-padding-top`),
  never as absolute pixels. With no anchored section at that line (the
  hero, the footer), the page's relative scroll position is restored. The
  resulting URL is the other locale's equivalent route **without** the old
  fragment. The restore is a single instant jump, with or without
  `prefers-reduced-motion`. It also applies to the language button inside
  the open mobile menu. Unchanged: the no-JS `href` (a real, anchorless
  destination), the locale cookie on every click (feature 33), the 404
  in-place switch (feature 39), route-map resolution and `hreflang`.
  Supersedes User Story 2 scenario 2 (`/es#servicios` → `/en#servicios`)
  and "fragment preserved at click time" in FR-029.
