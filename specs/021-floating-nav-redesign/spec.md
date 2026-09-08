# Feature Specification: Floating nav redesign

**Feature Branch**: `feat/floating-nav-redesign`
**Created**: 2026-09-08
**Status**: Draft
**Input**: Feature id 21 in `feature_list.json` (`floating_nav_redesign`, `"sdd": true`). Clau redesigned the desktop nav in the `.pen` and the nodes feature 3 measured (`JYhmR`, `IQjRU`) no longer exist. Rebuild `SiteNav.vue`'s desktop row as the new floating glass pill; leave the mobile row alone unless comparison against the current frame proves otherwise.

## Overview

Feature 3 built the desktop nav as a full-bleed, backgroundless 1440×103 bar.
Feature 9 recorded that as D-07: a pinned nav with no surface of its own lets
scrolled content show through the lockup and the links, and Roberto deferred
the fix to Clau rather than inventing a background. Clau has now shipped that
fix in the redesign this feature implements: the desktop nav becomes a
floating pill, 1280×72, anchored inside the page gutter at `x80 y24`, with the
system's own dark-glass surface (`#1c1416a6`, radius 999, `bone-100` @18%
border) behind the lockup and the links.

Three things change inside that pill, and nothing else about the nav does:

1. **The link row** goes from `Proyectos · Nosotros` to `Servicios ·
   Nosotros`. This is two independent, opposite-direction departures from the
   `.pen` and from `docs/business/`, both decided by a human and neither
   negotiable in this feature — see *Clarifications*.
2. **The CTA** (`Cuéntanos tu proyecto`) grows to 221×48 and gains a leading
   arrow glyph. It stays the exact same `BotonPrimario` instance feature 3
   composed — same component, same `#1c1416a6` fill, same LED ring, already
   at pill radius since feature 22. Only its size-variant geometry and its
   slot content change.
3. **The language toggle** stops being the `ES / EN` text pair and becomes a
   44×44 circular glass button showing only the active locale.

Nothing about *when* the CTA shows (feature 9's scroll-reveal), *where* any
link points (feature 3's route/anchor model), or *which* segments and anchors
the site uses (Article VI, unaffected by feature 12's cancellation) changes.
This is a visual rebuild of one component's desktop row, not a behavioural one.

### What this feature is not

It does not touch `MobileMenu.vue`, `useMobileMenu.ts`, `useNavCtaReveal.ts`,
`useShellNavigation.ts`'s resolution logic, `resolveLocaleDestination.ts`, the
route table in `nuxt.config.ts`, `MENU_ITEMS`, or `FOOTER_COLUMNS`. The mobile
menu still lists Propósito · Servicios · Proyectos · Nosotros (feature 3's own
decision, driven by a much longer mobile scroll) and the footer's Navegación
column still lists Servicios · Proyectos · Propósito · Nosotros (D4). Neither
list is the desktop nav's two-link row this feature edits, and "Proyectos"
staying out of the desktop nav does not remove it from either of those two.

It does not reopen feature 22 (the pill radius already applies everywhere) or
feature 9 (the reveal composable and its tests are reused, not modified,
beyond whatever the new markup requires of the classes that read `showCta`).

It does not change `SiteNav.vue`'s mobile markup unless the implementer's own
comparison against the live frame finds a real difference — the leader's
reading says frame `X3Xquh` is still 390×76, unchanged.

## Clarifications

### Session 2026-09-08

Two link-list questions have irreconcilable answers between the `.pen` and
`docs/business/`, and a spec that silently picked one without saying so would
reintroduce exactly the bug `rules.md` § R32 exists to close. Both are
resolved here, by a human decision that outranks the source it disagrees with.

- **Q: The `.pen` draws `Proyectos` in the new nav (frame `WGhSI`'s `Links`
  child). Does the desktop nav link to it?** → **A: No.** Roberto's explicit
  instruction (2026-09-08) drops it, because feature 15 (`projects_section`)
  is `blocked` indefinitely and a nav link to a section that does not exist
  is precisely what `ui-map.md` § 6 calls "un espacio reservado que parece
  clickeable y no lleva a nada" — a broken-looking site. **This is a human
  decision that overrides the design file, not an inference.** It must be
  recorded as a code comment in `NAV_ITEMS` so a future reader who compares
  the component against the `.pen` does not "restore" the link. **Reversal
  cost: one array entry, the day feature 15 ships.**

- **Q: `content.md` states "Servicios no está en el nav" as a settled
  decision. The redesigned frame draws it anyway. Which wins?** → **A: The
  design file wins, per `rules.md` § R32** — the `.pen` is the more current
  artifact and the redesign postdates `content.md`'s statement. `Servicios`
  is added to the desktop nav's link row. The contradiction is reported for a
  human to update `content.md`; no agent edits `docs/business/`.
  **Reversal cost: none — this is the state going forward, not a temporary
  one.**

A third question has no source that can answer it and is decided here rather
than deferred, per the instruction to decide and not defer:

- **Q: The design shows a leading `→` on the CTA. Does `BotonPrimario` gain
  an arrow prop, or does the arrow live in the caller's markup?** → **A: The
  arrow lives in `SiteNav.vue`'s own markup, as a second, `aria-hidden`
  element inside `BotonPrimario`'s existing default slot — the same shape
  `LinkArrow` already uses internally (own element, never baked into the
  i18n string, per feature 9 FR-010), but placed by the one caller that needs
  it rather than added to `BotonPrimario`'s prop contract.** `BotonPrimario`
  gains **zero** new props: its contract was deliberately kept narrow at
  feature 2 ("Deliberately NOT in this contract... before a consumer asks for
  it"), and its only consumer that wants a leading arrow is this one instance
  in `SiteNav.vue`. **Reversal cost: one markup change in one file, the day a
  second consumer wants the same thing** — at which point it is promoted to
  a prop, not before.

A fourth question is decided the same way:

- **Q: What does the 44×44 circular language toggle display?** → **A: The
  active locale's two-letter code (`ES` or `EN`), identical to what the
  component already shows for the active side today — only the container
  changes from an inline text pair to a 44×44 circular glass button, and the
  inactive locale's code stops rendering at all (there is only one control,
  and clicking it is the only way to reach the other locale).** This is the
  minimal reading of frame `tGVGq` ("Botón circular con el idioma activo")
  consistent with there being exactly two locales: a circle with one code
  showing is unambiguous about what clicking it does, and inventing a flag,
  globe glyph or country abbreviation would add a symbol the design does not
  specify and localization the brand voice does not use (`branding.md`:
  "Sin referencias geográficas"). **Reversal cost: one glyph swap inside the
  circle, if a future frame specifies otherwise.**

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The nav finally has a surface, on every page (Priority: P1)

A visitor on the landing or on Nosotros, in either locale, scrolls the page.
Where the nav used to be an invisible bar with the lockup and links floating
directly on scrolled content — sometimes illegible where the footer's opaque
block or a headline passed beneath it — there is now a dark glass pill,
anchored a short distance from the top and the sides, that the lockup, the
links, the CTA and the language toggle all sit inside. The pill's fill,
blur and border are the same dark-glass surface every other control on the
site already uses.

**Why this priority**: it is the feature, and it retires a known, previously
accepted defect (feature 9's D-07) rather than merely changing an appearance.

**Independent Test**: generate the site; open all four routes (`/es/`,
`/en/`, `/es/nosotros`, `/en/about`) at 1440px; scroll each past the point
where content used to show through the old bar; confirm the pill's surface
now sits behind the nav's content at every scroll position, with no change in
the nav's height or position other than the pill's own inset from the edges.

**Acceptance Scenarios**:

1. **Given** any of the four routes at 1440px, **When** the page loads,
   **Then** the nav renders as a pill inset from the top and both sides of
   the viewport — not a full-bleed bar — carrying the same dark-glass fill,
   radius and border every other glass surface on the site uses.
2. **Given** the same page, **When** it is scrolled, **Then** the pill's
   surface, not bare content, sits behind the lockup, the links, the CTA and
   the language toggle at every scroll position.
3. **Given** the pill's computed style, **When** it is inspected, **Then**
   its fill, border colour and radius resolve to the exact tokens
   (`--dark-glass`/`bg-glass-dark`, `--color-glass-line`, `rounded-full`)
   already declared for `Pill`, `BotonPrimario`, the form surfaces and the
   mobile menu panel — no new glass recipe is introduced.

---

### User Story 2 - The links match what the site actually has to offer (Priority: P1)

A visitor reading the nav sees `Servicios` and `Nosotros` — never
`Proyectos`, because there is nothing behind that word to click through to
yet. On Nosotros the same two links show, with `Nosotros` marked as the
current page exactly as `Proyectos`/`Nosotros` did before this feature.

**Why this priority**: a link to a section that doesn't exist reads as a
broken site (`ui-map.md` § 6); this is the one change in this feature with a
real user-facing correctness consequence, not just an appearance change.

**Independent Test**: generate the site; grep all four documents' nav markup
for the string "Proyectos"/"Projects" — it must not appear inside the
`<nav>` element (it may still appear in the footer and, on mobile, in the
menu panel, which this feature does not touch); confirm "Servicios"/
"Services" does appear, in both locales.

**Acceptance Scenarios**:

1. **Given** any generated document, **When** the `<nav>` element's link row
   is inspected, **Then** it contains exactly two links, in order: Servicios
   (an anchor to `#servicios` on the landing route), Nosotros (a route link).
2. **Given** the same markup, **When** it is scanned for "Proyectos" or
   "Projects", **Then** neither appears anywhere inside `<nav>`.
3. **Given** Nosotros in either locale, **When** the nav renders, **Then**
   `Nosotros` carries `aria-current="page"` and `Servicios` does not.
4. **Given** the mobile menu panel and the footer's Navegación column,
   **When** either is inspected, **Then** both are byte-unchanged from
   before this feature — Proyectos and Propósito remain exactly where
   feature 3's own decisions put them.

---

### User Story 3 - The primary CTA reads as a call to action, with a directional cue (Priority: P2)

The `Cuéntanos tu proyecto` button in the nav is visibly larger than before,
and a small arrow leads the label — the same visual family as the loose-text
`Agenda una llamada →` elsewhere on the site, but inside a solid button
rather than as plain text. The button still fades in and out with scroll
position exactly as it did on the landing before this feature (feature 9),
and is present from first paint everywhere else.

**Why this priority**: it is a real, visible change to the site's one
conversion control, but it changes only the control's container and content,
not its behaviour — the reveal logic (P1 in feature 9) is not this feature's
to re-verify from scratch, only to confirm survives unchanged.

**Independent Test**: generate the site; measure the CTA's box at 1440px;
confirm it is 221×48 with a leading arrow glyph that is not part of the
translated string; then repeat feature 9's own scroll-reveal scenarios
(hidden on landing at scroll 0, fades in past the Hero, visible from first
paint on Nosotros, visible with scripting disabled, no fade under reduced
motion) and confirm every one still holds.

**Acceptance Scenarios**:

1. **Given** the landing or Nosotros at 1440px, **When** the CTA is measured,
   **Then** its box is 221×48 with `border-radius: 999px` (unchanged from
   feature 22) and its fill is unchanged from `#1c1416a6`.
2. **Given** the CTA's markup, **When** it is inspected, **Then** the arrow
   glyph is a separate, `aria-hidden` element, and neither locale's
   `shell.nav.cta` string contains the `→` character.
3. **Given** the landing at scroll 0, **When** the page paints, **Then** the
   CTA is hidden, exactly as feature 9 requires; scrolling past the Hero
   fades it in and scrolling back fades it out.
4. **Given** Nosotros, **When** the page paints, **Then** the CTA is visible
   from first paint with no fade, exactly as feature 9 requires.
5. **Given** the pill's new background sitting behind the CTA, **When** the
   CTA's hidden/visible transition runs, **Then** nothing about the pill's
   own opacity, blur or presence changes — only the CTA's own opacity and
   visibility, exactly as `SiteNav.vue`'s existing comment for `.site-nav__cta`
   already documents.

---

### User Story 4 - Switching language is one button, not two words (Priority: P2)

A visitor clicks a small circle showing `ES` (or `EN`) and lands on the
equivalent page in the other locale — the same destination the old `ES / EN`
pair resolved, through the same route map, never by editing the URL string.
The circle always shows the *current* locale; there is nothing to read for
the locale not currently active.

**Why this priority**: it is a visible interaction change, but the mechanism
underneath — resolving the equivalent route, preserving an in-page anchor at
click time, falling back to the other locale's home — is inherited unchanged
from `resolveLocaleDestination.ts`. The risk here is markup and
accessibility, not routing correctness.

**Independent Test**: generate the site; inspect the toggle's markup at all
four routes; confirm it is a single 44×44 circular control per page, showing
the current locale's code and nothing else; click-test (or simulate) the
switch and confirm the destination matches what `resolveLocaleDestination`
already resolves today, anchor included when scripting is available.

**Acceptance Scenarios**:

1. **Given** any route, **When** the language toggle renders, **Then** it is
   a single 44×44 circular control, dark-glass fill, showing only the active
   locale's two-letter code.
2. **Given** the Spanish landing, **When** the toggle is activated, **Then**
   it navigates to `/en/`; **given** the English landing, activating it
   navigates to `/es/` — the same destinations `switchLocalePath` resolves
   today, run through the same totality guard (`rules.md` § R22).
3. **Given** any page with an in-page fragment present at click time (e.g.
   the visitor scrolled to `#servicios` first), **When** the toggle is
   activated with scripting available, **Then** the equivalent page opens at
   the equivalent fragment — the same behaviour `LanguageToggle.vue`'s
   existing `preserveAnchor` already provides.
4. **Given** scripting unavailable, **When** the toggle is activated,
   **Then** it still navigates to the equivalent page's top, with no anchor
   — the documented degradation this component already has.
5. **Given** the toggle's accessible name, **When** it is inspected by
   assistive technology, **Then** it states which locale activating the
   control switches *to* (e.g. "Switch to English"), not merely the code it
   displays, since the visible glyph alone does not convey the action to a
   screen reader.

---

### User Story 5 - Nothing about mobile moved (Priority: P3)

A visitor on a phone sees the same nav row as before this feature: the
lockup, the language toggle and the hamburger, no CTA, and the same open
menu behind it.

**Why this priority**: lowest, because the expected outcome is *no visible
change* — this user story exists to make the absence of a change a tested
fact rather than an assumption.

**Independent Test**: generate the site at 390px; compare the nav row's
markup and computed layout against what `SiteNav.vue` rendered before this
feature; confirm byte-for-byte equivalence in structure (allowing for
whatever the language toggle's own markup change requires, per User Story
4, which does apply at every viewport since it is one component).

**Acceptance Scenarios**:

1. **Given** any route at 390px, **When** the nav renders, **Then** the
   lockup, the (now circular) language toggle and the hamburger appear in
   the same order, at the same sizes, with the same "no CTA" rule feature 3
   established.
2. **Given** the mobile nav's height, **When** it is measured on the
   generated page, **Then** it matches what feature 3/`findings.md` § R55
   already recorded (76px per the frame; ~78.19px as built, from the
   hamburger's own border) — this feature introduces no further drift.
3. **Given** the open mobile menu, **When** it is inspected, **Then**
   `MobileMenu.vue` is unchanged except for whatever `LanguageToggle.vue`'s
   own markup change requires, since the menu composes the same toggle.

---

### Edge Cases

- **A viewport between mobile and desktop.** The pill's breakpoint is the
  same `lg` feature 3 already uses for the link row and the CTA; this
  feature introduces no second breakpoint.
- **A screen reader on the language toggle.** The circle's accessible name
  must describe the destination locale, not the two letters a sighted user
  reads — see User Story 4, Scenario 5.
- **A visitor who has already scrolled to an in-page anchor and then
  switches locale.** Unchanged behaviour from `LanguageToggle.vue`'s
  existing `preserveAnchor`; this feature does not touch that function.
- **The pill drawing behind the Hero's own glows.** The nav is not a
  section and creates no stacking context of its own beyond the existing
  `--layer-nav` (feature 9, A-13); a solid glass fill on the pill does not
  change that contract, because the pill is the nav's own surface, not a
  section's backdrop.
- **A future feature 15 shipping Proyectos.** Restoring the link is a
  one-entry change to `NAV_ITEMS`, already called out in *Clarifications*.
- **`prefers-reduced-motion` and no-JS.** Neither the pill's static surface
  nor the language toggle's markup depend on animation or scripting; the
  CTA's existing reveal fallbacks (feature 9, FR-046/FR-047) are unchanged
  and are re-verified, not re-designed, by this feature.

## Requirements *(mandatory)*

### Functional Requirements — the pill surface

- **FR-001**: The desktop nav (`lg` and above) MUST render as a pill,
  1280×72 at the 1440px frame, inset from the viewport edges rather than
  full-bleed, with a dark-glass fill, a 1px `bone-100`-at-18% border and a
  fully-rounded corner radius.
- **FR-002**: The pill's fill, border colour and corner radius MUST resolve
  to the same tokens already declared for `--dark-glass`/`bg-glass-dark` and
  `--color-glass-line` and the same rounding vocabulary `Pill` and
  `BotonPrimario` use (`rounded-full`). No new glass-surface token or
  variant may be introduced (Constitution Article VII, and the acceptance
  criterion that this reuses existing vocabulary).
- **FR-003**: The pill's inset from the viewport edges MUST resolve through
  a token (new or reused), never a hardcoded pixel value, and MUST reuse the
  existing page-gutter token if the two values already coincide.
- **FR-004**: Introducing the pill MUST NOT change the nav's height, its
  `position: sticky` behaviour, its `--layer-nav` stacking level, or any
  property `rules.md` §§ R28/R37 forbid a section from having — the nav is
  not a section and remains bound only by its own existing contract
  (feature 9, A-13).

### Functional Requirements — the link row

- **FR-005**: The desktop link row MUST contain exactly two items, in order:
  `Servicios` (an anchor to `#servicios` on the landing route) and
  `Nosotros` (a route link to Nosotros/About), both resolved through the
  same `ShellDestination`/`resolveHref` model `useShellNavigation.ts`
  already uses — no new destination kind and no path literal in a
  component.
- **FR-006**: `Proyectos` MUST NOT appear in the desktop link row, even
  though the redesigned frame draws it. The data model (`NAV_ITEMS`) MUST
  carry a code comment stating this is a deliberate divergence from the
  `.pen`, citing feature 15's `blocked` status, so a future reader does not
  "restore" the link by comparing against the design file.
- **FR-007**: `Servicios` MUST appear in the desktop link row, even though
  `content.md` states it is excluded. This divergence MUST be reported (in
  this spec and in the implementation report) as a contradiction for a
  human to resolve in `content.md` — no agent may edit `docs/business/`.
- **FR-008**: `MENU_ITEMS` (the mobile menu's four items) and
  `FOOTER_COLUMNS`' Navegación column MUST NOT change as a result of this
  feature. Both keep `Proyectos` exactly where feature 3's own decisions put
  it.
- **FR-009**: All link labels MUST come from `i18n/locales/{es,en}.json`,
  both locales present, with zero copy literals in any component
  (Constitution Article VI). The now-unused `shell.nav.projects` key MAY be
  removed if nothing else references it; a new `shell.nav.services` key (or
  equivalent) MUST be added.

### Functional Requirements — the CTA

- **FR-010**: The nav CTA MUST remain a `BotonPrimario` instance, unchanged
  in component identity, fill (`#1c1416a6`) and radius (`rounded-full`,
  already shipped by feature 22). This feature MUST NOT add a `shape` prop,
  a new `variant`, or any per-instance override of those properties.
- **FR-011**: The CTA's box MUST measure 221×48 at the 1440px frame. Any
  padding/label-size change this requires MUST resolve through
  `BotonPrimario`'s existing `nav` size variant (updating its token values),
  not through a new variant.
- **FR-012**: The CTA MUST carry a leading arrow glyph as a separate,
  `aria-hidden` element inside `BotonPrimario`'s existing default slot,
  composed by the caller (`SiteNav.vue`). The arrow MUST NOT be part of the
  `shell.nav.cta` translated string in either locale, so it can never render
  twice and never needs re-translating (same discipline as feature 9
  FR-010, `LinkArrow`).
- **FR-013**: `BotonPrimario.vue`'s prop contract MUST show zero new props.
- **FR-014**: The CTA's existing show/hide-on-scroll behaviour
  (`useNavCtaReveal`, `useHeroSentinel`, the `showCta` prop, the
  `.site-nav__cta` fade classes and the `<noscript>` override) MUST be
  reused unchanged. This feature touches only the CTA's visual container and
  slot content inside `SiteNav.vue`, never `app/shared/logic/
  useNavCtaReveal.ts` or `useShellNavigation.ts`'s `showNavCta` derivation.

### Functional Requirements — the language toggle

- **FR-015**: The language toggle MUST render as a single 44×44 circular
  control with a dark-glass fill, showing only the active locale's
  two-letter code. It MUST NOT render the inactive locale's code, the `/`
  divider, or any other visible text.
- **FR-016**: Activating the toggle MUST resolve the equivalent route
  through the existing i18n route map (`useSwitchLocalePath`/
  `resolveLocaleDestination.ts`), exactly as today — never through string
  manipulation of the current path (Constitution Article VI, non-negotiable,
  unaffected by feature 12's cancellation).
- **FR-017**: The toggle MUST preserve an in-page fragment present at click
  time, using the same client-side enhancement `LanguageToggle.vue`
  already implements (`preserveAnchor`), with the same no-scripting
  fallback (navigate to the equivalent page's top).
- **FR-018**: The toggle's accessible name MUST describe the destination
  locale ("switch to English" / "cambiar a inglés"), resolved from i18n,
  not merely echo the visible two-letter code.
- **FR-019**: The toggle MUST render identically at every viewport this
  component is used at (desktop nav, mobile nav, mobile menu panel) — it is
  one component with one visual form, not a per-context variant.

### Functional Requirements — verification and quality gates

- **FR-020**: `SiteNav.vue`'s mobile row MUST be compared against the
  current frame before any edit; if the leader's reading (unchanged,
  390×76) holds, the mobile markup MUST show zero structural changes beyond
  whatever FR-015–FR-019 require of the shared `LanguageToggle` component.
- **FR-021**: All copy MUST live in `i18n/locales/{es,en}.json`, both
  locales present; `tests/i18n-parity.test.ts` MUST stay green; zero
  hardcoded strings in any component (Constitution Article VI).
- **FR-022**: Zero hardcoded hex or `px` literals may appear in any touched
  component; every value MUST resolve through a token, reusing the existing
  fluid scale before a new breakpoint-specific token is introduced
  (Constitution Article VII).
- **FR-023**: `SiteNav.vue` and `LanguageToggle.vue` MUST each keep or gain
  a Storybook story covering both viewports and both locales (Constitution
  Article X), and component tests MUST cover the new link row, the CTA's
  arrow-as-separate-element rule, and the toggle's single-circle markup.
- **FR-024**: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`
  and `pnpm storybook:build` MUST all pass, and every pre-existing test
  MUST stay green without being modified to accommodate this feature, with
  the sole exception of assertions that literally encode the old nav
  geometry/link set (e.g. `SiteNav.test.ts`'s current "Proyectos" and
  "ES / EN" expectations), which MUST be updated, not deleted, to assert
  the new reality.
- **FR-025**: This feature MUST NOT change any route path, locale segment,
  or anchor. `/es/nosotros ↔ /en/about` and the four existing Spanish
  anchors (`#proposito`, `#servicios`, `#proyectos`, `#contacto`) remain
  exactly as feature 3 and the cancellation of feature 12 left them.
- **FR-026**: `docs/business/landing/ui-map.md` § 2 is now further out of
  date by this redesign (it already carries a note saying so, dated
  2026-09-08). This feature reports that, and reports the `content.md`
  contradiction (FR-007), but edits neither file — both are human-owned.

### Key Entities

- **Nav pill**: the desktop nav's new container. A glass surface (fill,
  border, radius, inset) with no behaviour of its own — it is the same
  `<nav>` element feature 3 built, restyled.
- **Nav link item**: one of exactly two entries in the desktop row
  (`Servicios`, `Nosotros`), each an existing `ShellItem`/`ResolvedShellItem`
  resolved exactly as today.
- **Nav CTA**: the same `BotonPrimario` instance, at an updated size and
  with an added, non-translatable arrow glyph, whose visibility is still
  governed entirely by feature 9's reveal composable.
- **Language toggle**: the shared control (used in the desktop nav, the
  mobile nav and the mobile menu panel) that now renders as one 44×44 circle
  showing the active locale, resolving the equivalent route exactly as
  before.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four routes render the desktop nav as a pill (not a
  full-bleed bar) at 1440px, with its fill/border/radius resolving to
  existing glass tokens in 4 of 4 documents.
- **SC-002**: Zero occurrences of "Proyectos"/"Projects" inside any
  generated document's `<nav>` element; the mobile menu panel and the
  footer's Navegación column keep exactly the occurrences they had before
  this feature.
- **SC-003**: The nav CTA measures 221×48 with `border-radius: 999px` in
  4 of 4 generated documents, and its label string contains no `→`
  character in either locale file.
- **SC-004**: The language toggle renders as exactly one 44×44 circular
  control per page, in 4 of 4 documents, at both the desktop and mobile
  breakpoints.
- **SC-005**: Every one of feature 9's nav-CTA-reveal acceptance scenarios
  (hidden at landing scroll 0, fades in past the Hero, fades out on
  scrolling back, visible from first paint on Nosotros, visible with
  scripting disabled, unaffected by reduced motion) still holds after this
  feature, verified on the generated page.
- **SC-006**: Zero hardcoded hex/px literals and zero new glass-surface
  tokens appear in the diff; every new value traces to an existing or a
  clearly-commented new token.
- **SC-007**: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`
  and `pnpm storybook:build` all pass, with the pre-existing suite green
  except for the assertions FR-024 names as intentionally updated.
- **SC-008**: The mobile nav's structure (lockup, toggle, hamburger, no CTA)
  is unchanged in 4 of 4 documents, confirmed against the current build
  before any edit.

## Assumptions

- **A-01 · The pill's exact inset and size tokens are `plan.md`'s to
  derive**, from the frame measurements the leader supplied (1280×72 at
  `x80 y24` on a 1440 canvas) — this spec fixes the "what" (a pill, inset,
  reusing existing gutter/glass tokens) and leaves the precise `clamp()`
  values to the plan, consistent with `rules.md` § R48's convention for
  section-relative geometry. **Reversal cost: token values only.**
- **A-02 · The CTA's updated `nav` size-variant padding and label size are
  `plan.md`'s to derive** from the 221×48 target, the same way feature 9
  derived its own geometry from measured boxes rather than guessing.
  **Reversal cost: token values only.**
- **A-03 · The language toggle's circular treatment applies at every
  viewport it appears in** (desktop nav, mobile nav, mobile menu), since it
  is one shared component and the design gives no reason to special-case
  any of the three. **Owner: Clau, if a future frame shows otherwise.**
  **Reversal cost: one conditional class.**
- **A-04 · Mobile is unchanged beyond what the shared `LanguageToggle`
  requires.** The leader's reading of frame `X3Xquh` (390×76, unchanged) is
  taken as CONFIRMED per `rules.md` § R32's chain of custody (only the
  leader can open the `.pen`); the implementer still compares the built
  mobile row against this before finalizing, per FR-020. **Reversal cost:
  none if confirmed; a follow-up finding if not.**
- **A-05 · `shell.nav.projects` is safe to remove.** It is used only by
  `NAV_ITEMS` today (the mobile menu and the footer use their own,
  differently-named keys — `shell.menu.projects` and
  `shell.footer.nav.projects` — which are untouched). **Reversal cost: one
  i18n key, if a future consumer needs the old label back.**

## Files this feature modifies

| File | Change |
|---|---|
| `app/features/shell/ui/SiteNav.vue` | pill container classes; CTA slot content (label + arrow element); comments recording the `Proyectos`/`Servicios` divergence |
| `app/features/shell/ui/LanguageToggle.vue` | rewritten markup: single 44×44 circular control, active-locale-only, new accessible-name string |
| `app/features/shell/data/navigation.ts` | `NAV_ITEMS`: `Proyectos` → `Servicios`, with the divergence comment |
| `app/assets/css/global.css` | + pill inset/size tokens; updated `nav` `BotonPrimario` size-variant tokens; + toggle circle tokens if not already covered by `--radius-icon`/existing glass scale |
| `i18n/locales/{es,en}.json` | `shell.nav.projects` → `shell.nav.services` (or added alongside, removed if unused elsewhere); + toggle accessible-name keys |
| `app/features/shell/ui/SiteNav.{test,stories}.ts` | updated for the new link set, CTA geometry and pill classes |
| `app/features/shell/ui/LanguageToggle.{test,stories}.ts` | updated for the single-circle markup |
| `tests/static-output.test.ts` | updated assertions for the new nav markup, per FR-024 |

Everything else in `app/features/shell/` — `MobileMenu.vue`, `useMobileMenu.ts`,
`useShellNavigation.ts`, `resolveLocaleDestination.ts`, `footerColumns.ts`,
`types.ts` — is out of scope and MUST show zero lines changed unless FR-020's
mobile comparison finds a real difference.

## Out of Scope

- Building the Proyectos section (feature 15, `blocked` indefinitely).
- Changing `BotonPrimario`'s shape or radius (feature 22, already `done`).
- Any change to route paths, locale segments or anchors (feature 12,
  cancelled by Roberto in favour of Constitution Article VI as written).
- The nav-CTA-reveal composable's logic (feature 9) — reused, not modified.
- Editing `docs/business/` (`ui-map.md`, `content.md`) or `feature_list.json`
  — both contradictions this feature surfaces are reported, not fixed, by
  an agent.
- Any change to `MENU_ITEMS` or `FOOTER_COLUMNS`.
- End-to-end tests (Constitution Article X puts them out of scope for this
  repository).

## Dependencies

- **Feature 3 (`done`)** — the nav this feature restyles: its layout, its
  `sticky`/`--layer-nav` contract, its i18n/route model, and
  `LanguageToggle.vue`/`MobileMenu.vue` as they exist today.
- **Feature 9 (`done`)** — the nav-CTA-reveal composable and its `showCta`
  contract, reused unchanged; D-07, the illegibility defect this feature's
  pill surface resolves.
- **Feature 22 (`done`)** — `BotonPrimario`'s pill radius, already applied
  everywhere including the nav CTA; this feature does not touch its shape.
- **`docs/business/rules.md` § R32** — the `.pen`-over-`docs/business/`
  precedence rule this spec applies twice, once each way (Servicios in,
  Proyectos out — the second by explicit human override, not by the rule
  itself, since the rule only arbitrates `.pen` vs. `docs/business/` and
  Roberto's instruction is a third, higher-ranked source).
- **`docs/business/landing/ui-map.md` § 2** — already notes it is
  outdated by this redesign; not edited here.
- **`docs/business/landing/content.md`** — states Servicios is excluded
  from the nav; contradicted here and reported, not edited.
