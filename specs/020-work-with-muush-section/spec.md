# Feature Specification: Work with muush — application form section (About/Nosotros)

**Feature Branch**: `feat/work-with-muush-section`
**Created**: 2026-09-08
**Status**: Draft
**Input**: User description: "Nosotros — Work with muush, the application form section. Two-column-desktop/stacked-mobile layout: a left text block (Pill, headline, body) beside an eight-field glass application form (Nombre, Correo, Área y rol, Portafolio, LinkedIn, CV, contact preference, submit). No submission — layout, fields and client-side validation only, same scope line as feature 16 (contact_section). Reuses `app/features/forms/` field primitives; adds a new file-upload primitive. Joins `app/features/about/` as its second section, at anchor `#work`."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Apply from desktop (Priority: P1)

A visitor to `/es/nosotros` or `/en/about` who works in technology, design or
production scrolls to "Work with muush" and wants to tell muush what they do
so they can be considered for future project work.

**Why this priority**: This is the section's entire reason to exist — every
other behaviour (validation, WhatsApp toggle, mobile layout) supports this one
journey. Without it there is no application form at all.

**Independent Test**: Load the About page at a desktop viewport, fill Nombre,
Correo, Área y rol, and leave Portafolio/LinkedIn/CV empty, select "Correo" as
contact preference, and submit. The form must not raise any validation error
that the leftover requirements don't call for, and it must not send a network
request or navigate away — it stays on the page with everything captured (per
scope: no real submission exists yet).

**Acceptance Scenarios**:

1. **Given** the About page loaded at desktop width, **When** the visitor
   scrolls to `#work`, **Then** they see the left text block (Pill, headline,
   body copy) beside the eight-field glass form, laid out in two columns.
2. **Given** the form is empty, **When** the visitor clicks Submit, **Then**
   every field the requirements mark as required shows its validation message
   and focus moves to the first invalid field, without clearing anything
   already typed elsewhere.
3. **Given** Nombre, Correo and Área y rol are filled with valid values and
   contact preference is left at its default ("Correo"), **When** the visitor
   submits, **Then** no validation error appears and no network request is
   made — the section only manages local UI state.

---

### User Story 2 - Apply from mobile, with WhatsApp preference (Priority: P2)

The same visitor, on a phone, wants to be reached over WhatsApp instead of
email.

**Why this priority**: Confirms the mobile stacked layout and the one
genuinely stateful interaction in the form (the conditional WhatsApp field),
which is also the interaction most likely to regress silently if copied
carelessly from feature 16.

**Independent Test**: Load the About page at a mobile viewport, fill the
required fields, switch contact preference to "WhatsApp", confirm the phone
number field appears with a transition, fill it, then switch back to "Correo"
and confirm the WhatsApp field disappears and its value is gone if the
visitor switches to WhatsApp again.

**Acceptance Scenarios**:

1. **Given** the About page at mobile width, **When** the visitor reaches
   `#work`, **Then** the left text block appears above the form, both at full
   mobile width — no two-column grid.
2. **Given** the contact-preference radio is at its default ("Correo"),
   **When** the visitor selects "WhatsApp", **Then** a phone-number field
   appears with a height/opacity transition and becomes a required field.
3. **Given** the WhatsApp field holds a value, **When** the visitor switches
   the radio back to "Correo", **Then** the field disappears and its value is
   discarded — selecting "WhatsApp" again shows an empty field, not the
   previous one.

---

### User Story 3 - Attach a CV and see it rejected or accepted client-side (Priority: P3)

A visitor wants to attach their CV as a PDF.

**Why this priority**: The one interaction this form has that feature 16
never needed (file selection). Lower priority than the two above because the
form is usable and testable end-to-end without ever touching this field.

**Independent Test**: Attempt to attach a non-PDF file and confirm the field
rejects it client-side with a message and never appears to upload anywhere;
attach a valid PDF under the size limit and confirm the field shows the
filename with no network activity.

**Acceptance Scenarios**:

1. **Given** the CV field is empty, **When** the visitor selects a `.docx`
   file, **Then** the field shows a format error and does not accept the file
   as valid.
2. **Given** the CV field is empty, **When** the visitor selects a valid PDF
   under the proposed size limit, **Then** the field shows the file name and
   size, with no request of any kind leaving the browser.
3. **Given** a CV is attached, **When** the visitor submits the form,
   **Then** the file is never transmitted, uploaded, or persisted beyond the
   component's own lifetime — there is no destination for it to go to.

---

### Edge Cases

- What happens when the visitor selects a PDF larger than the proposed 5MB
  limit? The field rejects it client-side with a size error, same treatment
  as the format error.
- What happens when the visitor picks an area under "Área y rol" but never
  picks a role? The select is a single control (area headers are
  non-selectable group labels, roles are the selectable options), so no role
  chosen is the same "empty" state Correo/Email's required-select validation
  already models in feature 16.
- What happens with JavaScript disabled? All eight fields, the two optional
  URL fields, and the CV input render and are usable as plain HTML form
  controls; the WhatsApp field's mount/unmount transition degrades to instant
  show/hide (native conditional rendering still works without a JS
  animation), consistent with `ui-map.md` § 10's "sin JavaScript" precedents.
- What happens if the visitor resizes past the `lg` breakpoint mid-session?
  The layout reflows between the two-column grid and stacked flow with no
  loss of entered values — it is the same CSS mechanism `ContactSection.vue`
  already uses, not two different markups.
- What happens on submit with the CV field empty, given its mandatory-ness is
  an open business decision? See Assumptions — the shipped default treats it
  as valid (optional), matching the currently-recorded recommendation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The section MUST render a left text block (Pill eyebrow,
  headline, body copy) and an eight-field application form, in the approved
  copy for both `es` and `en` locales.
- **FR-002**: Desktop (`lg` and above) MUST lay the left block and the form
  out in two columns; below `lg` they MUST stack, left block first, using the
  same CSS mechanism `app/features/landing/ui/ContactSection.vue` already
  uses (a `grid-template-areas` grid above the breakpoint, plain document
  flow below) — not separate markup per viewport.
- **FR-003**: The form MUST NOT submit anywhere. No `fetch`, `XMLHttpRequest`,
  `FormData` POST, or timer-simulated network round trip may exist on any
  code path reachable from a real user interaction.
- **FR-004**: The three remote-dependent submit states ("enviando" /
  sending, "éxito" / success, "error del servidor" / server error) MUST exist
  only as Storybook stories, never reachable from the shipped page's own
  props or state.
- **FR-005**: The submit control MUST NOT fake a result — no success message,
  no clearing of the form, no state change beyond a real, immediate,
  client-side validation outcome (pass or fail).
- **FR-006**: Nombre MUST be required text, minimum 2 characters (same rule
  as feature 16's Nombre).
- **FR-007**: Correo MUST be required and validate email format (same rule as
  feature 16's Correo).
- **FR-008**: "Área y rol" MUST be a required single-selection control that
  visually groups selectable roles under six non-selectable area headers —
  IT, Product, Project management, Sales, Marketing, Creative.
- **FR-009**: Portafolio and LinkedIn MUST be optional URL fields; if filled,
  each MUST validate as a well-formed URL. Empty is always valid.
- **FR-010**: CV MUST be a file field accepting PDF only, validating file
  type client-side and rejecting a non-PDF selection with a visible message.
  It MUST also reject a file over the proposed size limit (5MB) the same way.
  Whether an empty CV blocks a submit attempt is an explicit open value — see
  Assumptions; it MUST be isolated to one place so flipping it later is a
  one-line change.
- **FR-011**: The CV field MUST NOT transmit, upload, or persist the selected
  file anywhere beyond the component's own lifetime — no `FormData`, no
  object URL kept after unmount, no network call of any kind.
- **FR-012**: "¿Cómo prefieres que te contactemos?" MUST be a required radio
  with two options, Correo/Email and WhatsApp, defaulting to Correo/Email.
- **FR-013**: Selecting WhatsApp MUST reveal a phone-number field with a
  height/opacity mount transition; the field becomes required only while
  WhatsApp is selected. Switching back to Correo MUST hide the field and
  discard its value, so re-selecting WhatsApp later shows an empty field.
- **FR-014**: Submitting with one or more invalid required fields MUST show
  each field's own error message, move focus to the first invalid field, and
  MUST NOT clear any value already entered in any field.
- **FR-015**: All eight fields' primitives (text, email, URL, grouped select,
  file, radio with conditional reveal) MUST be sourced from a shared module
  also used by feature 16's contact form, rather than duplicated — a new
  field kind (file upload) is added to that shared module rather than built
  bespoke to this section.
- **FR-016**: The section MUST reuse the exact glow color/size token pairs
  already declared for feature 16's contact section (red-400 60% / 1500×760,
  wine-300 37% / 1000×560, wine-400 28% / 900×520), positioned at this
  section's own offsets rather than feature 16's.
- **FR-017**: All user-facing copy (headline, body, field labels,
  placeholders, validation messages, the unreachable success/error copy)
  MUST live in `i18n/locales/{es,en}.json` with both locales present — zero
  hardcoded strings in any component.
- **FR-018**: Zero hardcoded color or spacing literals in any component —
  every visual value MUST resolve through an existing or newly-declared
  design token, reusing the fluid scale before adding a breakpoint-specific
  value.
- **FR-019**: The section MUST join the About page's feature module as its
  second section (after the About Hero), without either module reaching into
  the shared form module's internal files directly — only through its public
  barrel.
- **FR-020**: The section MUST NOT create a stacking context or paint an
  opaque background on itself or any wrapper between it and the page layout
  root, so its glows and the site-wide dot sheet keep their established paint
  order.

### Key Entities

- **Application (form submission draft)**: the in-memory, never-transmitted
  values a visitor types or attaches — name, email, area/role selection,
  portfolio URL, LinkedIn URL, CV file, contact preference, and conditionally
  a WhatsApp number. Exists only in the browser tab's local component state;
  has no persistence, no identifier, and no relationship to any other entity
  in this system, because nothing is ever sent anywhere.
- **Area/role catalog**: the six area groups (IT, Product, Project
  management, Sales, Marketing, Creative) and the roles listed under each.
  The six area names are confirmed; the specific roles per area are not
  documented in any file this project can read (see Assumptions) and ship as
  an explicitly-flagged placeholder pending a real list.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can read the section's purpose (headline + body) and
  identify all eight fields of the application form within one viewport's
  scroll on both desktop and mobile.
- **SC-002**: 100% of the eight fields' validation states (empty, valid,
  invalid) render the outcome ui-map.md § 9 and this spec describe, verified
  by component tests — no field silently accepts or rejects the wrong input.
- **SC-003**: Zero real network requests leave the browser under any
  interaction with this section, including a completed, "successfully"
  validated submit attempt — verified against the generated site artifact.
- **SC-004**: A visitor who selects WhatsApp and later reverts to Correo, and
  selects WhatsApp again, always sees an empty WhatsApp field — never a
  retained prior value.
- **SC-005**: The section renders correctly (two-column desktop, stacked
  mobile, both locales) with zero i18n-parity or design-token violations,
  verified by the project's existing automated checks.

## Assumptions

- **CV mandatory-ness is an open business decision (`decisions-open.md` #7,
  owned by Roberto/Clau).** This spec does not assume either answer. The
  shipped default treats an empty CV as valid on submit-attempt (matching the
  recommendation already recorded in `decisions-open.md`: "opcional, con
  portafolio/LinkedIn como respaldo"), gated behind one named, isolated
  constant so a future answer is a one-line flip, not a validation rewrite.
  This is UNVERIFIED as a final answer and is reported, not decided, by this
  spec.
- **The specific role options under each of the six "Área y rol" area
  headers are UNVERIFIED.** `docs/business/landing/ui-map.md` § 9 names the
  six area headers but explicitly defers the role list to "content.md si se
  necesitan, o en la fuente Notion original" — `content.md` does not contain
  them, and the Notion source is not accessible to this process. The area
  headers are CONFIRMED (ui-map.md § 9); the roles per area ship as an
  explicit placeholder data structure, owned by Clau, reported rather than
  invented.
- **The CV size limit (5MB) is a proposal, not a confirmed value**
  (`ui-map.md` § 9: "máximo 5MB propuesto"). It is implemented as the
  best-available client-side check and is UNVERIFIED as a final number.
- **The WhatsApp number's validation rule (10 digits, +52/México default)
  is reused by symmetry from feature 16's contact form** (`ui-map.md` § 7),
  since `ui-map.md` § 9's own table for this form does not restate a
  separate row for the conditional WhatsApp number field — it is implied by
  "mismo campo condicional" (same conditional field as feature 16).
- **Headline, body and field-placeholder copy are approved**, per this
  session's review of the `.pen` copy in both languages (same treatment
  feature 17's Hero copy received) — not blocked on Clau's sign-off, unlike
  the rest of `decisions-open.md`'s "Copy de Nosotros... sigue en borrador"
  note, which this specific copy supersedes.
- **The Network section (feature 19) and Team section (feature 18) are out
  of scope** — both remain `blocked` in `feature_list.json` for reasons
  unrelated to this feature.
- **No server route, upload destination, or storage location exists or is
  created for the CV file** — Constitution Article IV (static-site purity)
  forbids it, and the feature's own scope line confirms no submission
  exists yet.
