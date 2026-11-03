# Feature Specification: Muush 1.0 forms — diagnóstico (home) and application (Nosotros)

**Feature Branch**: `feat/v2-forms` (cut from `muush-v2`, merges back into `muush-v2`, never into `master`)
**Feature**: 45 `m1_forms` · `sdd: true` · depends on 44 (done)
**Created**: 2026-11-02
**Status**: Done (Reopen 2, FR-041, approved in review-45 § Re-review 4; Reopen 1 in § Re-review 3)
**Input**: User description: "Feature 45 `m1_forms` — one shared v2 form UI for the diagnóstico form (home, POST /contact) and the application form (Nosotros, /careers/upload + /careers): v2 fields, segmented contact control, required privacy checkbox that only enables submit and is never sent, two steps with progress on mobile and one view on desktop, the four states, conditional WhatsApp, CV PDF only, radar ping on the Enviado tile dot. Reuses all existing forms logic; payloads unchanged; the website field is not built; no backend contract change. v1 forms UI quarantined. Home gets the v2 'Diagnóstico y contacto' section at `#diagnostico`; Nosotros mounts the v2 application form inside its v1 'Trabaja con muush' section." (full text in `feature_list.json`, id 45)

> The feature name `m1_forms` is a historical identifier. Nothing this feature
> creates (file, component, token, utility, i18n key, story) carries a version
> marker (Constitution 2.1.2, Article VII).

## Context

Features 42–44 built the v2 vocabulary (tokens, glass, buttons, pill with
radar ping, shader backgrounds), the chrome and the first four home sections.
The home still ends in the v1 contact section at `#diagnostico`, and Nosotros
still shows the v1 application form. The logic behind both forms (validation,
Turnstile, spam guard, payload builders, CV upload with no silent loss, dial
code and default country, server field errors) is complete and tested
(features 16, 20, 29, 31, 32). This feature replaces only what the visitor
sees and touches: one v2 form UI shared by both forms, the v2 home section
around the diagnóstico form, and the v2 application form inside the v1
Nosotros section.

### Sources of truth (in order of precedence)

1. `docs/harness/progress/pen-extract-45.md`: values the leader extracted from
   `muush.pen` on 2026-11-02, plus Roberto's answers in its § 7. **The `.pen`
   wins** over every other visual source (`rules.md` § R32). The spec author
   cannot open the `.pen` and has not.
2. `docs/business/muush-1.0.md` § 1 (decisions), § 4.6 and § 4.8 (approved
   copy).
3. `docs/business/landing/form-api-contract.md`: the binding backend contract,
   unchanged by this feature.
4. `docs/handoff/muush-1.0/componentes/` (`iniciarFormulario`, the `.m1-form`
   rules): reference behaviour, translated, never copied. Where its values
   differ from the pen extract, the pen extract wins.
5. Specs 016, 020, 029, 031, 032 (forms behaviour) and 042–044 (v2 primitives,
   tokens, presets, anchors, radar ping).

### Settled decisions (cited, not re-decided)

- The privacy notice is a required checkbox that enables submit and is **never
  sent** (Roberto 2026-10-31, `muush-1.0.md` § 1).
- The diagnóstico field "Tu sitio web o redes (opcional)" is **not built**; the
  backend does not change (Roberto 2026-10-31).
- The identity (6) and area/role (24) lists stay as they are today (feature
  45 description).
- Desktop shows every field in one view; mobile uses two steps with a progress
  bar, and data is kept when going back (`muush-1.0.md` § 3).
- The v2 application form is mounted **now** inside the v1 "Trabaja con muush"
  section; the rest of that section stays v1 until feature 46 (Roberto
  2026-11-02, pen extract § 7 Q1). The page looks mixed until 46; Roberto
  accepts this.
- The "Enviado" tile dot gets the radar ping, same recipe and token as the Pill
  dot, in Red muush; none under reduced motion (Roberto 2026-11-02, Q2).
- The lucide `check` icon (`lucide-static@0.469.0`, ISC) is added to
  `app/assets/icons/` (Roberto 2026-11-02, Q3).
- Privacy notice and Terms pages are feature 48; until then the words "aviso de
  privacidad" in the checkbox are plain text, as in the footer (feature 43).
- 390 px and 1440 px must match the `.pen`; other widths may adapt sizes and
  spacing, never colour, components, copy or behaviour (AGENTS.md § 3.1).
- No version bump in this feature.

## Clarifications

### Session 2026-11-02

Run by the spec author as a subagent with no human present. **Approved by
Roberto at the spec_ready gate on 2026-11-02** with the leader's
recommendations; the answers below are binding (they replace the earlier
"provisional" wording). The last four entries were added at the same gate.

- Q: The approved copy and the acceptance say the CV may be up to 10 MB, but
  the binding contract (§ 4) caps `contentLength` at 5 242 880 bytes and the
  backend must not change. Which limit and copy ship? → A: **The contract
  wins: the enforced limit stays 5 MiB (5 242 880 bytes) and both CV strings
  say "5 MB"** ("Adjunta tu CV en PDF · máximo 5 MB" / "Attach your CV as a
  PDF · max 5 MB"; "Adjunta tu CV en PDF de hasta 5 MB." / "Attach your CV
  as a PDF up to 5 MB."). Shipping "10 MB" would accept files the server then
  refuses, which ends in the CV-upload error for every CV between 5 and
  10 MB. **Approved by Roberto 2026-11-02**: CV max 5 MiB (5 242 880 bytes,
  the contract value), copy "PDF · máximo 5 MB" / "PDF · max 5 MB"; the
  backend is not changed.
- Q: The `.pen` draws no v2 state for a failed CV upload (feature 31: the
  application is not sent). How is it shown? → A: **The "Error al enviar"
  notice above the submit carries feature 31's message; the submit reads
  "Intentar de nuevo" and retries the upload with the same file; the notice
  holds a text action "Enviar sin CV" that sends without the file.** Changing
  or removing the file dismisses the notice (today's behaviour). Feature 31's
  current ES/EN message and "Enviar sin CV" label are kept; "Reintentar subida"
  is replaced by the button. **Approved by Roberto 2026-11-02.**
- Q: Which copy do field errors without approved v2 text use? → A: **Approved
  v2 lines where they exist** ("Escribe tu nombre."; "Escribe un correo como
  nombre@empresa.com" for both empty and malformed email; "Elige tu área y
  rol."; the CV line for both wrong format and too large); **every other error
  keeps today's wording, ending in a period** to match the v2 lines (e.g.
  "Elige una opción.", "Cuéntanos un poco más.", "Deben ser entre 6 y 14
  dígitos."). No other new copy. **Approved by Roberto 2026-11-02.**
- Q: New copy that is not in the approved copy? → A (**approved by Roberto
  2026-11-02**): identity placeholder "Selecciona una opción" / "Select an
  option"; screen-reader-only hint on the disabled submit "Acepta el aviso de
  privacidad para enviar." / "Accept the privacy notice to send."; the list
  label "Lo que recibes" / "What you get", stored in sentence case and drawn
  uppercase.
- Q: The LinkedIn placeholder "linkedin.com/in/…" invites a value the
  unchanged URL rule rejects. → A (**approved by Roberto 2026-11-02**): the
  placeholder becomes "https://linkedin.com/in/…" in both locales; the URL
  rule does not change.
- Q: The contract document still says WhatsApp numbers are exactly 10 digits
  and has no `whatsappDialCode`. → A (**Roberto 2026-11-02**): the document
  stays as it is (human-owned; `docs/business/` is not edited); the code keeps
  the feature-32 rule (6–14 digits plus the dial code).
- Values from pen extract-45 § 8 (leader re-check, 2026-11-02) supersede the
  "assumed" items of this spec: EN mobile copy ("Step 1 of 2 · Your details",
  "Step 2 of 2 · Your business" / "Your profile", "Continue", "← Back"); the
  mobile segmented control has no red dot; mobile privacy row gap 10,
  checkbox stroke Blanco 40 %, text 12 / 1.4; the notice carries an 8 px red
  dot (desktop padding 14 / 16, gap 12, text 14; mobile padding 12 / 14, gap
  10, text 13); mobile success tile 56 × 56 radius 18, title 26, text 16;
  mobile section body 16 / 1.5; disabled submit opacity 0.7 with the
  not-allowed cursor. Where § 8 and a requirement below disagree, § 8 wins
  (noted inline).

### Implementation notes (2026-11-02, implementer; not decisions)

Recorded so the reviewer can check them against the `.pen` and Roberto can
overrule them:

- **§ 8 over the spec**: the notice sizes, the mobile success tile, the
  mobile privacy row and the disabled submit follow pen extract § 8 (FR-013,
  FR-014 updated above).
- **Textarea**: fixed 96 tall, no resize grip; the handoff allows a vertical
  resize, the `.pen` draws none (R32).
- **1024–~1100 px**: the section's left column keeps at least 352 px and the
  panel narrows (a fixed 600 panel pushed "diagnóstico" under it at 1024);
  the two-field rows go side by side from 32rem of form width (a container
  query) instead of from `md`, so they stack while the panel is narrow.
  390 and 1440 are unchanged. Consequence, intended: the rows are side by
  side at 768–1023, stacked at 1024–~1100 and side by side again above
  (they follow the panel's width, not the viewport's; review-45 nit).
- **Consent on every send path** (review-45, fix round 1): the
  application's "Enviar sin CV" goes through the same consent guard as the
  submit, so after unticking the box it sends nothing and focuses it.
- **Disabled submit cursor**: the site's brand-cursor rules are unlayered,
  so a fifth rule in that block gives `[aria-disabled="true"]` the
  not-allowed cursor.

## User Scenarios & Testing *(mandatory)*

"Visitor" is anyone on `/es`, `/en`, `/es/nosotros` or `/en/about`. "Reviewer"
is Roberto, approving the forms in the component catalogue and on the
`muush-v2` build.

### User Story 1 - Request a free assessment on desktop (Priority: P1)

A prospective client reaches "Diagnóstico y contacto" on the home (from the
nav CTA, the hero CTA or by scrolling), reads what they will receive, fills the
form in one view, accepts the privacy notice and sends it.

**Why this priority**: It is the site's main conversion. Without it the v2
home ends in a v1 block that has to go.

**Independent Test**: On `/es` and `/en` at 1440 px, fill every required field,
tick the privacy box, send against a stubbed endpoint returning 200, and see
the "Enviado" state; the request body equals today's `/contact` payload for the
same values.

**Acceptance Scenarios**:

1. **Given** the home at 1440, **When** the visitor reaches `#diagnostico`,
   **Then** the section shows, over the `assessment` listón, the pill "Primer
   paso", the two-line heading, the body, the "Lo que recibes" list with three
   check rows, the "¿Prefieres hablar? Agenda una llamada" row and, on the
   right, the glass form panel with every field in this order: Nombre | Correo,
   Empresa o proyecto | ¿Cómo te identificas?, ¿Qué necesitas?, the contact
   segmented control, the privacy checkbox, the submit "Quiero mi diagnóstico".
2. **Given** the privacy box is not ticked, **When** the visitor looks at or
   reaches the submit, **Then** it is shown disabled and assistive technology
   announces why ("accept the privacy notice to send"); no request can be sent.
3. **Given** the box is ticked and every field is valid, **When** the visitor
   sends, **Then** the button shows "Enviando…" at reduced opacity with its
   arrow, every field keeps its value and cannot be edited, and exactly one
   `/contact` request leaves with the same JSON body today's form produces —
   no privacy, website or honeypot key.
4. **Given** a 200 `ok` response, **Then** the panel content is replaced by the
   "Enviado" stack: the 64 × 64 tile with the red dot and its radar ping, "Recibimos
   tu solicitud.", the body, and the glass button "Agenda una llamada" to the
   call-booking page; focus moves to the confirmation.
5. **Given** the visitor chooses WhatsApp, **Then** the dial-code and number
   field appears below the segmented control; choosing Correo removes it and
   the number is never sent.

---

### User Story 2 - Request a free assessment on a phone in two steps (Priority: P1)

The same visitor on a phone fills the form in two short steps.

**Why this priority**: Most first visits are on phones; the design makes the
form two steps there.

**Independent Test**: At 390 px, complete step 1, continue, complete step 2,
go back and forth, send; values survive every move and the payload is the same
as on desktop.

**Acceptance Scenarios**:

1. **Given** 390 px, **Then** the section stacks: pill, heading, body, "Lo que
   recibes", form panel, "Llamada" row; the panel shows the progress row
   "Paso 1 de 2 · Tus datos" with the first of two bar segments red, and only
   Nombre, Correo and the contact control (plus WhatsApp when chosen), then
   the full-width "Continuar" button.
2. **Given** step 1 has an invalid or empty required field, **When** the
   visitor taps "Continuar", **Then** the step does not change, each invalid
   field shows its error and focus moves to the first one.
3. **Given** step 1 is valid, **When** "Continuar" is tapped, **Then** step 2
   ("Paso 2 de 2 · Tu negocio", both segments red) shows Empresa o proyecto,
   ¿Cómo te identificas?, ¿Qué necesitas?, the privacy checkbox, "Quiero mi
   diagnóstico" and "← Atrás"; the change is announced and focus moves to the
   first field of step 2.
4. **Given** step 2, **When** "← Atrás" is tapped, **Then** step 1 shows again
   with every value kept, and step 2's values are still there on return.
5. **Given** a server field error on a step-1 field (for example `email`),
   **When** the response arrives on step 2, **Then** the form goes back to
   step 1 and focuses that field with its error.

---

### User Story 3 - Recover from missing data and failed sends (Priority: P1)

A visitor makes a mistake or the network fails; nothing they typed is lost and
the way forward is clear.

**Why this priority**: The contract forbids fake success, and the design's
states ("Faltan datos", "Error al enviar") are part of the acceptance.

**Independent Test**: Submit with errors; then with a stub that fails (500,
network error, spam guard); then retry successfully.

**Acceptance Scenarios**:

1. **Given** invalid fields, **When** the visitor sends, **Then** ("Faltan
   datos") each invalid control gets a 1 px Red muush 500 stroke and a help line
   below it in Red muush 500 (e.g. "Escribe tu nombre.", "Escribe un correo
   como nombre@empresa.com"), each message is programmatically tied to its
   field, focus moves to the first invalid field and no request leaves.
2. **Given** a field shows an error, **When** the visitor corrects it, **Then**
   its error disappears as soon as the value is valid.
3. **Given** the request fails (5xx, network, timeout, second 403, or a tripped
   spam guard), **Then** ("Error al enviar") a red notice appears above the
   submit with the approved text and a working `support@muush.dev` link, the
   button reads "Intentar de nuevo", every value stays, and the notice is
   announced.
4. **Given** the error state, **When** the visitor presses "Intentar de nuevo",
   **Then** a new attempt runs with a fresh Turnstile token.
5. **Given** a `validation_failed` response naming fields, **Then** those
   fields are marked like client errors, not as a global error.

---

### User Story 4 - Apply to work with muush from Nosotros (Priority: P1)

A professional on Nosotros fills the application form, optionally attaches a
PDF CV, and sends it.

**Why this priority**: It is the only way talent reaches muush; its UI must
match the diagnóstico form (one shared code) and its CV must never be lost
silently (feature 31).

**Independent Test**: On `/es/nosotros` and `/en/about`, desktop and mobile,
send with and without a CV against stubs; verify the call order and payloads.

**Acceptance Scenarios**:

1. **Given** 1440, **Then** the v1 "Trabaja con muush" section keeps its v1
   pill, headline, body, glows and layout, and its form column holds the v2
   glass panel with: Nombre | Correo, Portafolio | Área y rol, LinkedIn, CV,
   the contact control, the privacy checkbox ("…sobre mi aplicación.") and
   "Enviar aplicación".
2. **Given** 390, **Then** the panel has two steps: "Paso 1 de 2 · Tus datos"
   (Nombre, Correo, contact) and "Paso 2 de 2 · Tu perfil" (Portafolio, Área y
   rol, LinkedIn, CV, privacy, submit, "← Atrás").
3. **Given** the visitor picks a file that is not a PDF or is over the size
   limit, **Then** the field stays empty, shows the CV error at once and sends
   nothing.
4. **Given** a valid PDF and a valid form, **When** sent, **Then** the label
   reads "Subiendo CV…" during the upload and "Enviando…" afterwards, and the
   requests run `/careers/upload` → PUT → `/careers` with the `cvId`, exactly
   as today.
5. **Given** the CV upload fails, **Then** the application is **not** sent;
   the red notice shows the CV message with an "Enviar sin CV" action, the
   button reads "Intentar de nuevo" and retries the upload with the same file,
   and choosing another file dismisses the notice.
6. **Given** a 200 `ok`, **Then** the panel shows "Recibimos tu aplicación.",
   its body, the tile with the pinging dot, and the glass button "Volver al
   inicio" to the home of the current locale.

---

### User Story 5 - Use both forms with keyboard and assistive technology (Priority: P2)

A keyboard or screen-reader user completes either form.

**Why this priority**: Required by the feature's accessibility brief; the
forms are the site's only input.

**Independent Test**: Complete both forms with keyboard only, with a screen
reader, and with reduced motion on.

**Acceptance Scenarios**:

1. Every control has a visible label tied to it; every error is announced with
   its field.
2. The segmented control is a radio group: one Tab stop, arrow keys move the
   selection, the selected option is announced.
3. Each select opens, moves and closes with the keyboard; Esc closes it
   without changing the value.
4. In the stepped view, the current step ("Paso 2 de 2 · Tu negocio") is
   announced when it changes.
5. The disabled submit is reachable and explains it needs the privacy notice.
6. With reduced motion: no radar ping, no WhatsApp field transition, step
   changes and scrolls are instant.

---

### User Story 6 - The v1 forms are quarantined (Priority: P3)

The reviewer finds the v1 form UI only in the quarantine and the catalogue
shows the v2 forms as the current ones.

**Why this priority**: Constitution Article VII quarantine; feature 47 deletes
v1.

**Independent Test**: Search the code and Storybook.

**Acceptance Scenarios**:

1. The v1 form components and their stories live in a `legacy` location of the
   forms module, titled under `Legacy v1/`, and no page renders them.
2. The v2 form components, the v2 home section and its states have stories in
   both viewports and both locales under non-legacy titles.

### Edge Cases

- Window resized across the step breakpoint mid-fill: values stay; in the
  stepped view the current step is kept; in the single view every field shows.
- No JavaScript: the static page shows every field in the single-view order
  (the stepped view needs script); sending needs script as today.
- Visitor ticks then unticks privacy: submit disables again.
- Pressing Enter in a text field while privacy is unticked: nothing is sent and
  focus moves to the privacy checkbox.
- Server marks a field the visitor then changes: its mark clears (today's
  behaviour).
- Double click on submit or "Intentar de nuevo": one request only.
- Turnstile token expired (403): one silent retry with a fresh token, then the
  error state (today's behaviour).
- Very long values or translations at 360 px: fields wrap or truncate inside
  the panel, never overflow the page.
- The success state stays until reload; there is no "send another".
- WhatsApp chosen, number typed, switched to Correo and back: the number field
  returns empty, the country is kept (feature 32).

## Requirements *(mandatory)*

### Functional Requirements

#### Shared form UI

- **FR-001**: Both forms MUST be built from one shared set of v2 form parts
  (panel, field block, select, textarea, segmented control, WhatsApp field,
  privacy checkbox, progress, notice, actions, success stack); only each form's
  own fields differ.
- **FR-002**: From 768 px the form MUST show every field in one view with the
  desktop field anatomy of the pen extract § 2; below 768 px it MUST show two
  steps with the mobile anatomy of § 4. (The handoff's `max-width: 767px`.)
- **FR-003**: In the stepped view, step 1 MUST hold Nombre, Correo and the
  contact control (plus WhatsApp when chosen); step 2 the form's own fields and
  the privacy checkbox. In the single view the contact control and privacy
  MUST follow the form's own fields (pen extract § 2, § 5). Reading order and
  focus order MUST match the visual order in both views.
- **FR-004**: The progress row MUST read "Paso N de 2 · <step title>" and the
  bar MUST light the current and previous segments in Red muush, later ones in
  Blanco 20 %.
- **FR-005**: "Continuar" MUST validate only step 1's fields; if any is invalid
  it MUST show their errors and focus the first; otherwise it MUST show step 2,
  focus its first field and bring the panel top into view.
- **FR-006**: "← Atrás" MUST show step 1 without validating; no value is
  cleared by moving between steps.
- **FR-007**: When a submit (client or server) finds an invalid field on step 1
  while step 2 is shown, the form MUST return to step 1 before focusing that
  field.

#### Privacy consent

- **FR-008**: Each form MUST show an unticked, required privacy checkbox with
  its approved label (diagnóstico: "…sobre mi diagnóstico."; application:
  "…sobre mi aplicación.").
- **FR-009**: Until it is ticked, the submit MUST look disabled, MUST stay
  reachable by keyboard, MUST expose a short explanation to assistive
  technology, and MUST NOT send anything by any path (click, Enter, script).
- **FR-010**: The consent value MUST NOT appear in any request.

#### States

- **FR-011**: "Enviando": submit at 70 % opacity with "Enviando…" (application
  with a CV: "Subiendo CV…" while uploading) and its arrow; fields keep values
  and are not editable; repeated activation is ignored.
- **FR-012**: "Faltan datos": shown only after an attempt (submit or
  Continuar); each invalid control gets a 1 px Red muush 500 stroke and a
  13 / 400 Red muush 500 help line; the message is tied to the control; focus
  moves to the first invalid field.
- **FR-013**: "Error al enviar": a notice (red 12 % fill, red 40 % stroke,
  radius 10, an 8 px Red muush dot before the text; desktop padding 14 / 16,
  gap 12, 14 / 1.45 Blanco text; mobile padding 12 / 14, gap 10, text 13 —
  pen extract § 8) above the submit with the
  approved text and a `mailto:support@muush.dev` link; submit label "Intentar
  de nuevo"; every value (and the chosen CV) kept; announced on appearance.
- **FR-014**: "Enviado": the panel content is replaced by a centred stack — a
  64 × 64 tile (Blanco 8 % fill, radius 20, Blanco 20 % stroke) with a 14 px
  Red muush dot carrying the radar ping; the title in Poppins 32 / 500 Blanco;
  the body 16 / 1.5 Blanco 70 % at most 420 wide; a glass button. On mobile
  (pen extract § 8) the tile is 56 × 56 with radius 18 and the title 26. The stack is
  announced and receives focus.
- **FR-015**: Success MUST come only from a real 200 `ok` response (contract
  § 7.2); nothing is ever cleared on a failure.

#### Fields and logic (unchanged behaviour)

- **FR-016**: The diagnóstico form MUST NOT render a website or social field.
- **FR-017**: Validation rules, Turnstile handling, spam guard (honeypot and
  minimum fill time), dial-code selection with default country, server field
  errors, and the CV upload flow MUST keep today's behaviour and tests.
- **FR-018**: Request bodies MUST be byte-for-byte what today's payload
  builders produce for the same values (contract §§ 3–5 plus the
  `whatsappDialCode` agreed in feature 32).
- **FR-019**: The WhatsApp field MUST appear only while WhatsApp is the chosen
  channel, restyled with the v2 field anatomy (dial-code control and number in
  one row).
- **FR-020**: The CV field MUST accept only PDF up to the limit in FR-033; the
  box is 96 tall with the approved placeholder, and shows the chosen file name
  once one is chosen.
- **FR-021**: Selects MUST stay native so keyboard, Esc, type-ahead and the
  mobile pickers work; they carry the lucide `chevron-down` 16 px in Gris 400.

#### Home section

- **FR-022**: A v2 "Diagnóstico y contacto" section MUST replace the v1 contact
  section at `#diagnostico`, over the `assessment` listón, with the layout of
  pen extract § 1 (desktop) and § 4 (mobile).
- **FR-023**: The "Lo que recibes" rows MUST use a 24 × 24 Red 15 % bubble with
  the lucide `check` at 14 px in the commitment-icon colour; the label is the
  11 / 600 tracked Gris 400 caption.
- **FR-024**: "Agenda una llamada" MUST link to the existing call-booking URL.
- **FR-025**: The section heading MUST be an `h2` (the hero keeps the only
  `h1`).

#### Nosotros

- **FR-026**: The v1 "Trabaja con muush" section MUST keep its v1 copy, layout,
  glows and anchor, and MUST render the v2 application form in its form
  column.
- **FR-027**: The application success button "Volver al inicio" MUST go to the
  home of the current locale.

#### Copy, quarantine, quality

- **FR-028**: All copy MUST come from ES/EN locale keys with parity; no string
  hardcoded.
- **FR-029**: Zero hex, rgb or px literals and zero v1 tokens in files this
  feature creates or rewrites under `app/`.
- **FR-030**: The v1 form UI and its stories MUST move to the forms module's
  `legacy` location with `Legacy v1/` titles; the v1 contact section is
  retired from the home.
- **FR-031**: The lucide `check` icon MUST be normalized to the icons folder
  contract and documented in its README.
- **FR-032**: Storybook MUST cover the v2 parts, both forms in every state, and
  the home section, at 390 and 1440, in ES and EN, with component tests.

#### Values settled in Clarifications

- **FR-033**: The CV size limit MUST stay the contract's 5 242 880 bytes
  (5 MiB), and the CV placeholder and error MUST say "5 MB" (Clarifications
  Q1, approved 2026-11-02). A file of exactly 5 242 880 bytes is accepted.
- **FR-034**: When the CV upload fails, the application MUST NOT be sent;
  the "Error al enviar" notice MUST show feature 31's CV message and an
  "Enviar sin CV" action; the submit MUST read "Intentar de nuevo" and retry
  with the same file; changing or removing the file MUST dismiss the notice
  (Clarifications Q2, approved 2026-11-02).
- **FR-035**: Field errors MUST use the approved v2 lines where they exist
  (name, email empty or malformed, area and role, CV format or size); every
  other error keeps today's wording ending in a period (Clarifications Q3,
  approved 2026-11-02).

#### Reopen 1, Roberto 2026-11-02 (after seeing the build)

Roberto asked for four changes after the first approval. The defaults
marked "leader" were chosen by the leader when reopening, not by Roberto.

- **FR-036** (desktop header, idle hide): from `lg` (1024 px, the existing
  desktop breakpoint), the header MUST keep hiding on downward scroll and
  showing on upward scroll (feature 43). It MUST also hide after
  `HEADER_IDLE_HIDE_MS` = 2.5 s with no scrolling (leader: "~2.5 s", a
  named constant). Any scroll restarts the wait, but only an upward scroll
  (or reaching the top zone) shows it again; a downward scroll keeps it
  hidden (review-45 re-review 2). Below `lg` nothing changes. Leader defaults:
  - always visible within the first 80 px of the page (the feature 26
    reveal zone);
  - visible before scripting runs (prerender and no-JS).
- **FR-037** (desktop header, hold and motion): from `lg` the header MUST
  NOT hide while the pointer is over it or keyboard focus is inside it
  (leader default). The slide MUST be transform only, with no fade on
  desktop; under `prefers-reduced-motion` it shows and hides instantly
  (leader default). The scroll listener is passive and coalesced with rAF;
  the logic lives in `shell/logic/useHeaderIdleHide.ts`, with unit tests on
  fake timers.
- **FR-038** ("Cómo trabajamos" run, desktop): pointing at or focusing a
  step MUST NOT jump the red fill. After 150 ms (`RUN_DELAY_MS`) it travels,
  transform only (`scaleX`, linear), at a constant 700 ms per whole line
  (`RUN_MS_PER_LINE`; the run from the start to the last dot, at about 83 %
  of the line, takes about 580 ms). Each column lights as the fill reaches
  its dot. Leaving, or moving to an earlier step, runs back and puts the
  passed columns out in turn. The final lit steps are unchanged (FR-042 of
  spec 044). Under reduced motion everything is instant. Mobile rail
  unchanged.
- **FR-039** (shader on resize): a background shader MUST keep animating
  continuously while its section changes height (e.g. the form's WhatsApp
  row opening). A resize only updates the backing-store size and the
  resolution uniform; it never restarts the clock, rebuilds the program or
  recreates the context. Root cause: assigning the canvas size cleared the
  buffer after that frame's draw, so a running loop showed a cleared
  canvas (the poster) every frame of the transition. The fix: repaint in
  the same frame when the size changed. Pinned by a test in
  `useShaderCanvas.test.ts`.
- **FR-040** (assessment call row): "¿Prefieres hablar?" / "Prefer to
  talk?" MUST be Blanco (the link's token, `text-blanco`). "Agenda una
  llamada" / "Book a call" stays Blanco and is underlined: 1 px
  (`decoration-1`), offset 4 (`underline-offset-4`). The arrow stays Red
  muush. This departs from pen extract § 1 (question in Gris 400, no
  underline) at Roberto's request.

#### Reopen 2, Roberto 2026-11-02

Roberto: "sube todos los pills de las sections, un poquito… para que no se
vea tan pegado". A deliberate departure from the `.pen`.

- **FR-041** (pill air): every v2 section pill that sits above its heading
  MUST have 6 px more space before the heading below `lg` and 8 px more
  from `lg` (1024). The space is added below the pill, through ONE shared
  utility, `pill-aire` (`margin-block-end: var(--pill-aire)`; `--pill-aire`
  is 0.375rem, 0.5rem from `lg`), on top of each section's own gap. The pill
  component and the heading sizes do not change, and the v1 quarantine is
  untouched. This applies to:
  - the hero's rotating pill;
  - Qué es muush;
  - Servicios;
  - Cómo trabajamos;
  - Diagnóstico y contacto.

  The service cards have no pill above their titles. The v2 application
  panel has no pill; the Nosotros pill is the v1 one, kept until feature 46.

### What the pages look like after 45

- **Home** (`/es`, `/en`): header → v2 Hero → Qué es muush → Servicios → Cómo
  trabajamos → **v2 Diagnóstico y contacto over the `assessment` listón** →
  footer. The page is fully v2.
- **Nosotros** (`/es/nosotros`, `/en/about`): v1 About hero → v1 "Trabaja con
  muush" section (v1 pill "Work with muush", v1 headline and body, v1 glows,
  v1 two-column layout) whose form column now holds the **v2 glass
  application panel** with the v2 fields, privacy checkbox, two steps on
  phones and the v2 states → footer. Mixed until feature 46.

### Key Entities

- **Form step model**: which fields belong to step 1 and step 2 for each form;
  the current step; whether the stepped view applies.
- **Consent**: a per-form, client-only boolean; never part of the values sent.
- **Form copy**: per form, field labels/placeholders/errors, step titles,
  continue/back, submit/sending/uploading/retry, notice text, success title,
  body and action.
- **Assessment section content**: pill, two heading lines, body, receives label
  and three items, call question and link.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For every combination exercised by the payload tests (each
  identity, each channel, with and without company/portfolio/LinkedIn/CV), the
  request bodies are identical to the ones produced before this feature.
- **SC-002**: 0 requests leave while the privacy box is unticked, across click,
  Enter and programmatic submit tests; 0 requests contain a consent, website or
  honeypot key.
- **SC-003**: At 390 and 1440, in ES and EN, the section and both forms match
  the `.pen` frames (`mMSV2`, `ASEvR`, `uUEnn`, `Vh9NI`, `Bw4IB`, `qUy14`,
  `VtxDP`, `w9Owd`, `gNda1`, `u1CDBO`, `H3cNSD`) in layout, colour and copy;
  no horizontal scroll, clipped text or overlap at 360, 768, 1024, 1280 and
  1920.
- **SC-004**: A keyboard-only user completes and sends both forms in both
  views; a screen reader announces each label, each error with its field, the
  step change, the error notice and the confirmation.
- **SC-005**: Moving between steps any number of times loses 0 values; a failed
  send loses 0 values (including the chosen CV).
- **SC-006**: With reduced motion, 0 animations run in the forms (ping,
  WhatsApp transition, smooth scroll).
- **SC-007**: i18n parity test green; 0 hardcoded strings; 0 hex/px literals or
  v1 tokens in new or rewritten files; `pnpm check`, `typecheck`, `test`,
  `generate` and `storybook:build` pass.

## Assumptions

- **Step breakpoint 768 px** (handoff `max-width: 767px`). The section layout
  still switches at 1024 px like every v2 section, so at 768–1023 the section
  is stacked and the panel uses the single view, capped at the desktop panel
  width (600).
- **The panel and field anatomy follow the form view**: mobile anatomy
  (342-wide panel at 390, radius 22, padding 20, gap 14, 46-tall stroke-less
  controls, 400 labels, square-ish segmented control) in the stepped view;
  desktop anatomy (600, radius 28, padding 36, gap 18, 50-tall stroked
  controls, 600 labels, pill segmented control) in the single view.
- **Before script runs** the server-rendered page shows the single view; the
  stepped view engages once the page is interactive on a narrow screen.
- **EN mobile copy**: confirmed by the leader against `qUy14`/`H3cNSD` (pen
  extract § 8): "Step N of 2 · Your details / Your business / Your profile",
  "Continue", "← Back".
- **Identity select placeholder**: "Selecciona una opción" / "Select an
  option" (new copy, approved 2026-11-02).
- **Disabled-submit explanation** (screen-reader only): "Acepta el aviso de
  privacidad para enviar." / "Accept the privacy notice to send." (approved
  2026-11-02).
- **Disabled look**: 70 % opacity like "Enviando", with the not-allowed cursor
  (confirmed, pen extract § 8).
- **WhatsApp row**: dial-code control and number side by side with the field
  block gap (8 desktop, 7 mobile); its label and the dial-code name keep
  today's copy ("Número de WhatsApp", "Lada del país").
- **Error notice** carries an 8 px red dot before the text (confirmed, pen
  extract § 8).
- **Success copy**: the diagnóstico title no longer names the channel (v1 did);
  the body says "por el medio que elegiste".
- **The v1 contact section and its home-only content seam are deleted** rather
  than kept in quarantine: keeping it would require exporting a v1 form through
  the forms barrel; v1 ContactSection had no other consumer.
- **The v1 form components stay compilable** in quarantine with their own
  (legacy) content types; nothing renders them; feature 47 deletes them.
- **Placeholders** for Portafolio ("https://") and LinkedIn
  ("https://linkedin.com/in/…", Roberto 2026-11-02, replacing the drawn
  "linkedin.com/in/…" so it matches the unchanged URL rule).
- Turnstile stays Invisible; its host stays inside the panel.

## Out of Scope

- Any backend or contract change; the website field; new identity or role
  options.
- The rest of Nosotros in v2 (hero, Cómo se arma, Dónde estamos, the v2
  "Trabaja con muush" chrome): feature 46.
- Privacy and Terms pages and their links: feature 48.
- Deleting v1 code: feature 47.
- A "send another" action after success.

## Amendments

### 2026-11-02 · Mobile shader uniforms (amended by feature 46)

Roberto, feature 46 spec gate: below 1024 px the Diagnóstico y contacto
listón (`assessment` preset) draws with the uniforms the home mobile frame
`V2s7T` draws (pen-extract-46 § 6), as the preset's optional
`compactUniforms`; the desktop uniforms apply from 1024. Trabaja con muush
(`workWithUs`) shares the same mobile values. Spec 046 FR-046,
Clarifications. The form, its payloads and its states are unchanged.
