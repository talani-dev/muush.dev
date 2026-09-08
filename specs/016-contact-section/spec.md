# Feature Specification: CTA final y formulario de contacto — the landing's closing section

**Feature Branch**: `016-contact-section` (branch `feat/contact-section` already checked out by the leader for this run)
**Created**: 2026-09-08
**Status**: Draft
**Input**: feature 16 `contact_section` in `feature_list.json`, plus the leader's reading of frames `Xrs80` (desktop 1440×900) and `r3PHqc` (mobile 390×1260) on 2026-09-08 (`rules.md` § R32).

## Summary

`06 CTA final` is the landing's sixth and last section before the footer, and the
one that gives a real destination to two controls that have been inert since
they were built: the Hero's primary CTA (feature 9) and the nav's CTA (feature
3/10). Both already point at `#contacto`; today neither goes anywhere because
the anchor doesn't exist.

Roberto descoped this feature tonight (2026-09-08), in writing, to **pure
client-side UI/UX**: the form does not submit anything, anywhere. That
descope is what closes blocker #1 of `decisions-open.md` (which external
service a submission reaches) without answering it — there is nothing to
wire, so there is nothing the missing answer blocks. Three of the design's
five submit states (`enviando`, `éxito`, `error del servidor`) presume a
remote response that does not exist in this feature's scope; they are built
as Storybook stories, reviewable and copy-accurate, never as code reachable
from a real click.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The section exists, and the two dangling CTAs land on it (Priority: P1)

A visitor clicks "Cuéntanos tu proyecto" in the Hero or in the nav. Today the
click changes nothing. After this feature, it scrolls to a real section
holding a heading, a short pitch, and a form.

**Why this priority**: without this, feature 9's and the shell's CTA remain
what `rules.md` § R50 already registers as a known, deliberate gap — clicking
changes the URL and moves nothing. This is the only feature that can close it.

**Independent Test**: load `/es` and `/en`, click the Hero's primary CTA and
the nav's CTA in turn; both land on a visible section carrying `id="contacto"`
with a heading, a form, and no dead space.

**Acceptance Scenarios**:

1. **Given** the landing at any width, **When** the page renders, **Then** a
   section with `id="contacto"` exists after Proyectos and before the footer.
2. **Given** the Hero's primary CTA, **When** it is clicked, **Then** the
   browser navigates to `#contacto` — which requires `HERO_DESTINATIONS.contactHash`
   in `app/features/landing/data/heroContent.ts` to be filled, since an empty
   anchor in the DOM does **not** by itself give the Hero's button an `href`
   (see § *Notes on the two dangling CTAs* below).
3. **Given** the nav's CTA, **When** it is clicked from the landing or from
   `/nosotros`, **Then** the browser navigates to (respectively) `#contacto`
   or `/#contacto` — this one requires **no code change**, because
   `NAV_CTA`'s destination in `app/features/shell/data/navigation.ts` is
   already an unconditional anchor; only the target needed to exist.

---

### User Story 2 — Seven fields, validated on the client, with nothing sent anywhere (Priority: P1)

A visitor fills Nombre, Correo, Empresa o proyecto, ¿Cómo te identificas?, ¿Qué
necesitas? and ¿Cómo prefieres que te contactemos?, then clicks Enviar. If a
required field is missing or invalid, the form shows the errors and focuses
the first one. If everything is valid, nothing happens beyond that — there is
no destination.

**Why this priority**: this is the entire built (non-story) surface of the
form. Without real client validation, "idle → validation failed" — the one
state transition this feature can honestly build — would not exist either.

**Independent Test**: submit the form empty; every required field shows an
error and focus lands on Nombre. Fill it correctly and submit again; no
network request is made (verified by the absence of a `fetch`/`XMLHttpRequest`
target and by grepping the built output for a `server/api` route, which
Article IV already forbids at the repo level) and the form does not clear,
does not disable, and does not show a success or error state — those three
only exist as stories.

**Acceptance Scenarios**:

1. **Given** the empty form, **When** Enviar is clicked, **Then** Nombre,
   Correo, ¿Cómo te identificas? and ¿Qué necesitas? show red borders and a
   short message each, and focus moves to Nombre. Nothing already typed
   elsewhere is cleared (`ui-map.md` § 7).
2. **Given** Correo holds `not-an-email`, **When** Enviar is clicked, **Then**
   only Correo's error shows (format), independent of the other fields' state.
3. **Given** all required fields hold valid values, **When** Enviar is
   clicked, **Then** validation passes and the control does nothing further —
   it does not disable, does not show "Enviando…", and does not present a
   success or error card. Those three states are not wired to this action.
4. **Given** ¿Cómo prefieres que te contactemos? is "WhatsApp", **When** the
   visitor leaves Número de WhatsApp empty and clicks Enviar, **Then** that
   field shows an error alongside the others (it becomes required only in
   this branch).

---

### User Story 3 — The WhatsApp field appears, and forgets itself when hidden (Priority: P1)

A visitor picks "WhatsApp" as their contact preference; a phone field
transitions in below. They type a number, change their mind, and switch back
to "Correo"; the field transitions back out. If they switch to WhatsApp again,
the field is empty — not what they typed before.

**Why this priority**: it is explicitly named in the feature's acceptance
criteria and is the one piece of stateful, genuinely interactive behaviour in
an otherwise mostly-static form.

**Independent Test**: select WhatsApp, type a number, switch to Correo,
switch back to WhatsApp; the field is present and empty.

**Acceptance Scenarios**:

1. **Given** ¿Cómo prefieres que te contactemos? defaults to "Correo",
   **When** the section renders, **Then** the WhatsApp field is not present
   (not merely hidden — see FR-011).
2. **Given** "WhatsApp" is selected, **When** the choice changes, **Then** the
   field transitions in over height and opacity.
3. **Given** a value typed into the WhatsApp field, **When** the visitor
   switches back to "Correo", **Then** the field transitions out and its value
   is discarded — reselecting WhatsApp presents an empty field, never the
   discarded value.

---

### User Story 4 — The section reads correctly on both viewports, in the design's own order (Priority: P2)

Desktop: left block (Pill, heading, copy, alternate route) beside the form.
Mobile: left block, then the form, then the alternate route — the one
place this section's order is **not** a straight rescale of desktop.

**Why this priority**: the leader's brief and the design frame both call this
out explicitly as a deliberate divergence, not paridad-desktop-móvil scope
creep — getting it backwards reads as a bug review would flag immediately.

**Independent Test**: load at 1440px and 390px; confirm the DOM/visual order
differs exactly as described and nothing else about the two blocks changes.

**Acceptance Scenarios**:

1. **Given** the section at 1440px, **When** it renders, **Then** the left
   block (with the alternate route inside it) sits beside the form.
2. **Given** the section at 390px, **When** it renders, **Then** the left
   block (without the alternate route) is first, the form is second, and the
   alternate route is third, below the form.

---

### User Story 5 — The three unreachable states exist, reviewable, in Storybook (Priority: P3)

Sending, success and server-error are built as static Storybook stories
matching `ui-map.md` § 7's layout and copy in both locales, so Clau/Roberto
can review them before any backend exists — without a single line of code
that could accidentally fire a real request.

**Why this priority**: it is explicit in the feature's acceptance criteria
("existen como stories revisables, no como código cableado") and is what lets
a future feature wire a real destination against an already-reviewed visual
target instead of designing it from scratch.

**Independent Test**: open Storybook, find the three stories; confirm each
renders statically (no interaction fires them) and each matches `ui-map.md`
§ 7's copy, in both locales.

**Acceptance Scenarios**:

1. **Given** Storybook, **When** the "Enviando" story loads, **Then** the
   submit control is disabled, labelled "Enviando…"/"Sending…", and the LED
   ring shows its static (non-spinning) treatment; the fields render
   read-only.
2. **Given** Storybook, **When** the "Éxito" story loads, **Then** the form is
   replaced by the confirmation copy inside the same card, in both locales.
3. **Given** Storybook, **When** the "Error del servidor" story loads,
   **Then** the form renders with all fields still holding their captured
   values, plus the error copy and the `support@muush.dev` fallback, in both
   locales.
4. **Given** the built site (not Storybook), **When** its JavaScript bundle is
   inspected, **Then** no code path can reach any of these three states from a
   user action — they exist only as story fixtures.

---

### Edge Cases

- **A locale's validation message is longer** — messages are short by design
  (`ui-map.md` § 7: "mensaje corto"); the field's own layout absorbs it, no
  field is measured to a hard-coded height for its error state.
- **The visitor never touches ¿Cómo prefieres que te contactemos?** — it
  defaults to "Correo" (`ui-map.md` § 7), so the WhatsApp field never renders
  unless the visitor actively picks WhatsApp.
- **The visitor submits, corrects one field, and submits again** — only the
  fields still invalid re-show their error; a field that became valid clears
  its own error. Nothing outside the changed field's error state resets.
- **Reduced motion** — the WhatsApp field's height/opacity transition is
  dropped, per the sitewide `prefers-reduced-motion` contract already applied
  to every other reveal (Hero's CTA fade, Purpose's card reveal); the field
  still appears/disappears, just without the animated step.
- **No JavaScript** — validation is entirely client-side and requires
  scripting; without it the browser's own `required`/`type="email"`
  constraint validation still runs on native submit (the `<form>` element and
  native input types are not scripting-dependent), and the submit control (a
  native `<button type="submit">` with no `action`/no listener) causes no
  navigation and no error — a graceful no-op, consistent with "the form does
  not submit" holding true with or without JavaScript.
- **The section is the last thing in the document before the footer** — its
  glows must not bleed past the section box into the footer, and the footer's
  own opaque `bg-ink-500` already caps anything that does (`findings.md` §
  R54/R57 precedent).

## Requirements *(mandatory)*

### Functional Requirements — structure, anchor, and the two dangling CTAs

- **FR-001**: The section MUST render on the landing in both locales, after
  Proyectos and before the footer, and MUST carry `id="contacto"`.
- **FR-002**: This feature MUST fill `HERO_DESTINATIONS.contactHash` in
  `app/features/landing/data/heroContent.ts` with the section's anchor. This
  is a one-key change to existing data, not new markup — the same shape
  `callUrl` already proved when it landed (feature 11). Adding `id="contacto"`
  to the DOM alone does **not** give the Hero's button an `href`; the two are
  independent and both are required (verified against `useHeroContent.ts`,
  which only emits `contactHref` when `contactHash` is present).
- **FR-003**: The nav's CTA (`NAV_CTA` in `app/features/shell/data/navigation.ts`)
  requires **no code change** — its destination is already an unconditional
  `{ kind: 'anchor', name: 'index', hash: '#contacto' }`, resolved to a real
  href regardless of whether the target exists. It starts working the moment
  the section with that `id` exists in the DOM.
- **FR-004**: The section MUST render a `Pill` eyebrow, an `h2` heading, a
  body paragraph, and the secondary CTA ("Agenda una llamada →", `LinkArrow`,
  `CALL_BOOKING_URL`, new tab, `rel="noopener"`) in a left block, plus the
  form. Desktop: left block beside the form. Mobile: left block, form,
  secondary CTA — in that order (FR-US4).
- **FR-005**: All copy MUST come from `landing.contact.*` in
  `i18n/locales/{es,en}.json`, both locales present, zero strings in
  components (Article VI).

### Functional Requirements — the seven fields

- **FR-006**: The form MUST render exactly the seven fields of `ui-map.md`
  § 7, in that order: Nombre (text, required, min 2 chars), Correo (email,
  required, valid format), Empresa o proyecto (text, optional), ¿Cómo te
  identificas? (select, required, one of the five options in `content.md`),
  ¿Qué necesitas? (textarea, required, min 10 chars), ¿Cómo prefieres que te
  contactemos? (radio, required, Correo/WhatsApp, default Correo), and the
  conditional Número de WhatsApp (tel, required only when WhatsApp is
  selected, 10 digits for the default +52 country).
- **FR-007**: The "¿Cómo te identificas?" select MUST ship the five options
  documented in `content.md` (Empresa, Emprendedor o persona física, Startup,
  Creador de contenido o marca personal, Otro). The sixth option visible only
  in the `.pen` ("Restaurante o bar") is **not** approved copy
  (`decisions-open.md`) and MUST NOT be invented; it is reported, not shipped.
- **FR-008**: Client-side validation MUST run with no network dependency and
  MUST NOT depend on scripting to be safe (native HTML constraint validation
  covers the no-JS case — see Edge Cases).
- **FR-009**: On a failed validation, the form MUST show a short message per
  invalid field, apply the error visual treatment (red border), move focus to
  the first invalid field in document order, and MUST NOT clear any field's
  value (`ui-map.md` § 7).

### Functional Requirements — the WhatsApp conditional field

- **FR-010**: The WhatsApp field MUST NOT render at all while "Correo" is
  selected — removed from the DOM, not merely visually hidden, so its value
  cannot exist to leak (this is what makes discard structural rather than a
  behaviour to remember to implement correctly).
- **FR-011**: Selecting "WhatsApp" MUST mount the field with a transition over
  height and opacity. Selecting "Correo" again MUST reverse the transition and
  discard the field's value: remounting it (by switching back to WhatsApp)
  MUST present it empty, never the previously typed value.
- **FR-012**: The transition MUST be dropped (not merely shortened) under
  `prefers-reduced-motion: reduce`; the field still mounts/unmounts.

### Functional Requirements — the five states, and where the line falls

- **FR-013**: The section MUST implement **idle** and **validación fallida**
  as real, reachable states, driven by a real client-side validation
  composable with no network call.
- **FR-014**: The section MUST NOT implement **enviando**, **éxito**, or
  **error del servidor** as code reachable from any user action. No `fetch`,
  no `XMLHttpRequest`, no simulated delay (`setTimeout` standing in for a
  network round-trip), no client-only "success" flag flipped by the submit
  handler. The submit handler's only real effect is running validation and,
  if it passes, doing nothing further.
- **FR-015**: The three unreachable states MUST exist as Storybook stories on
  the form component, driven by a story-only prop/args mechanism that has no
  equivalent path in the shipped page (e.g., a `previewState` prop consumed
  only by the story, never set by the real composable). Each MUST match
  `ui-map.md` § 7's layout and exact copy, in both locales.
- **FR-016**: The success and error copy (both locales) MUST exist in
  `i18n/locales/{es,en}.json` today, since it is already approved copy — an
  unreachable state is still a real state once destinations exist, and
  shipping its copy now avoids a second i18n pass later.
- **FR-017**: The honeypot + minimum-timestamp anti-spam measures
  `ui-map.md` § 10 describes MUST NOT be built in this feature. Both exist to
  protect a submission endpoint; with no endpoint, there is nothing to
  protect, and building them now would be inert code with no test that could
  prove it does anything (Article VIII, no speculative work). They are
  explicitly deferred to whichever future feature wires a real destination —
  recorded here rather than silently dropped, per the leader's brief.

### Functional Requirements — background contribution

- **FR-018**: The section MUST contribute three glows through the feature 6
  mechanism, with zero edits to `SectionGlow.vue`, `SectionBackdrop.vue`,
  `DotGrid.vue` or the `--layer-*` tokens: `red-400` 60% size `1500-760`,
  `wine-300` 37% size `1000-560`, `wine-400` 28% size `900-520` — the same
  three color/opacity/size triples `design-extract.md` § 10's "CTA" row
  already documents, confirmed against the leader's page-absolute centres.
- **FR-019**: All glow offsets MUST be section-relative, converted from the
  leader-supplied page-absolute centres per `rules.md` §§ R29 and R48, with
  each axis of each glow interpolated between its two measured endpoints. No
  offset may be derived from the other viewport.
- **FR-020**: The section, and every wrapper between it and the layout root,
  MUST create no stacking context and paint no opaque background
  (`rules.md` §§ R28, R37) — the fourth section bound by this contract.
- **FR-021**: No token added by this feature may be named `--color-glow-*` or
  `--spacing-glow-*` — that namespace is closed (`rules.md` § R36).

### Functional Requirements — contrast

- **FR-022**: Body text and field values over the dark-glass form MUST meet
  4.5:1 contrast (`ui-map.md` § Accesibilidad mínima). `--dark-glass` at 65%
  opacity over the section's own glow-lit background is the one surface in
  this feature dark enough to be at risk; § *Decisions* below fixes the
  mechanism.

### Key Entities

- **Contact form field** — one of the seven: an id, a control kind (text,
  email, textarea, select, radio, conditional-tel), a required rule (which
  for one field depends on another field's value), and a validation rule.
- **Submit state** — one of five: `idle`, `invalid`, `sending`, `success`,
  `server-error`. Only the first two are reachable from a real action in this
  feature; the last three exist as named story fixtures.

## Success Criteria *(mandatory)*

- **SC-001**: Clicking the Hero's primary CTA or the nav's CTA, from the
  landing or from `/nosotros`, lands the visitor on the contact section, in
  both locales.
- **SC-002**: Submitting the empty form shows an error on every required
  field and moves focus to the first one, with no field's prior input lost.
- **SC-003**: Selecting WhatsApp reveals the phone field with a visible
  transition; typing a value, switching to Correo, and switching back to
  WhatsApp shows the field empty.
- **SC-004**: No user action in the shipped page can reach a "sending",
  "success" or "server error" visual — grepping the built JavaScript for a
  network call inside the form's submit path finds none.
- **SC-005**: The three unreachable states are visible and copy-correct (both
  locales) in Storybook.
- **SC-006**: At 1440px the alternate route sits in the left block; at 390px
  it sits below the form.
- **SC-007**: Text over the form's glass surface measures ≥4.5:1 contrast.
- **SC-008**: Measured on the generated artefact: the section's backdrop
  computes below the dot sheet, the content above both, and the section
  declares no stacking-context property and no background colour.
- **SC-009**: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`
  and `pnpm storybook:build` all pass.

## Assumptions

- **A-01** The heading/body copy for the left block beyond the two CTA
  button labels (already approved: "Cuéntanos tu proyecto" / "Agenda una
  llamada →") is **not found documented anywhere in `docs/business/`**. This
  is a content gap, not a behavioural ambiguity: the heading and body
  paragraph ship as placeholder i18n values (heading reuses the approved
  button string, capitalised and punctuated per the leader's frame reading,
  "Cuéntanos tu proyecto."; the body paragraph is a placeholder pending
  Roberto/Clau), owner Roberto/Clau, tracked the same way `decisions-open.md`
  already tracks Nosotros' hero/network copy as draft.
- **A-02** The sixth "¿Cómo te identificas?" option ("Restaurante o bar")
  visible only in the `.pen` is not shipped (FR-007); this is a reported gap,
  not an invented one.
- **A-03** The WhatsApp field's country selector is fixed to México (+52) for
  this feature — `ui-map.md` § 7 documents only the +52/10-digit rule and
  "default México"; no other country's digit count is documented, so no other
  country is offered. A future feature can extend this without touching the
  field's contract (it already carries a country dimension).
- **A-04** Honeypot and minimum-timestamp anti-spam are explicitly deferred
  (FR-017), not silently dropped.
- **A-05** The breakpoint at which the two-column desktop layout switches to
  the stacked mobile layout follows the same still-`UNVERIFIED` assumption
  the rest of the landing uses (`decisions-open.md`): `lg` (1024px).
- **A-06** The section carries no bottom padding of its own; the footer's own
  top padding is the separation, matching every other section's convention
  (`rules.md` § R49).
- **A-07** "Empresa o proyecto" being optional means it has no required rule
  and no validation beyond being free text (`ui-map.md` § 7: "Libre").

## Notes on the two dangling CTAs

Verified by reading the current source, not assumed:

- `app/features/landing/logic/useHeroContent.ts` only emits `contactHref`
  when `HERO_DESTINATIONS.contactHash` is set (`app/features/landing/data/heroContent.ts`).
  That file today has `contactHash` absent — feature 11 filled `callUrl` and
  left this one, exactly as its own doc comment says it would. This feature
  MUST set it (FR-002); nothing else in `HeroSection.vue` needs to change,
  which is the same "one key" property `callUrl` already demonstrated.
- `app/features/shell/data/navigation.ts`'s `NAV_CTA` destination is **not**
  gated behind an optional field the way the Hero's is — it is an
  unconditional `{ kind: 'anchor', name: 'index', hash: SHELL_ANCHORS.contact }`,
  already resolved to a real `href` by `useShellNavigation.ts`. `rules.md`
  § R50 already registers this as a link that "changes the URL and moves
  nothing" — precisely because the target doesn't exist yet. This feature
  requires **no shell-side code change**: the nav's CTA starts working by
  construction the moment `id="contacto"` exists in the DOM.

This is the answer to the leader's "watch for" item: the two controls are
**not** symmetric. The nav's link is already fully wired and waits only on
the DOM target; the Hero's is additionally gated by a data flag that this
feature must flip.

## Contradictions found in `docs/business/` — reported, not edited

`docs/business/` is human-authored and read-only to this agent (AGENTS.md § 3).

| Document | What it says | What this spec does |
|---|---|---|
| `content.md` | "¿Cómo te identificas?" has 5 options | Ships the 5; the `.pen`'s 6th is reported, not invented (FR-007, A-02) |
| — | No document states the CTA final's own heading/body copy | Placeholder copy, owner flagged (A-01) |

## Process notes

- No `git` command was run for spec authoring beyond what the leader already
  did (checking out `feat/contact-section`); no branch hook exists
  (`.specify/extensions.yml` is absent), matching the precedent recorded in
  `specs/013-purpose-section/spec.md`.
- **`.specify/feature.json` was NOT updated.** It still points at
  `specs/014-services-section`. The hard boundary for this run scopes writes
  to `specs/016-contact-section/` only, so `/speckit-plan` and
  `/speckit-tasks` were invoked with the directory given explicitly rather
  than relying on that file — same open item feature 13's spec.md already
  flagged for the leader.
