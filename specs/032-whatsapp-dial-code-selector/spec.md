# Feature Specification: Dial-code selector before the WhatsApp number

**Feature Branch**: `032-whatsapp-dial-code-selector` (spec folder; the git branch is `feat/whatsapp-country-code`)
**Created**: 2026-10-14
**Status**: Done, including Amendment A1 (2026-10-14: default country from the
visitor's IP via `GET /__geo`). Original scope approved by Roberto 2026-10-14 and
reviewer APPROVED 2026-10-14; the amendment's gate items were approved by Roberto
on 2026-10-14 and the amendment was reviewer APPROVED on 2026-10-14 (see
[Amendment A1](#amendment-a1-2026-10-14--default-country-from-the-visitors-ip))
**Input**: Feature 32 `whatsapp_dial_code_selector` in `feature_list.json`
(requested by Roberto on 2026-10-14). Its `description` and `acceptance`
array are the requirements; this document restates them as testable
behaviour and does not add scope.

**Supersedes** (agreement of Roberto with the backend, 2026-10-14, recorded
in the feature description):

- `docs/business/landing/form-api-contract.md` § 3, the `whatsapp` rule
  ("exactamente 10 dígitos"), and § 5 by reference ("misma regla que en
  `/contact`").
- `docs/business/landing/ui-map.md` § 7, row "Número de WhatsApp", column
  Validación ("10 dígitos para +52, default México").
- `contactFields.ts` constant `WHATSAPP_MX_DIGIT_COUNT` and the spec
  assumption A-03 of feature 16 ("no other country is offered").

Everything else in features 16, 20, 29 and 31 stays in force (conditional
field, discard-on-switch of the number, submission flows, single 403 retry,
server field marks, generic error, spam guard, CV flow).

**Amended on 2026-10-14** (Amendment A1, at the end of this document): the
default country no longer comes from the browser's preferred languages. It
is Mexico (+52), replaced by the country `GET /__geo` reports when valid.
Superseded by A1: OA-3, User Story 2, FR-006, FR-007, FR-008 (timing part),
SC-002, SC-003. Each is marked in place.

---

## Open for approval (resolve at the gate)

None of these is a `[NEEDS CLARIFICATION]` blocker: each carries a proposal
the plan is built on, so the gate is a yes/no per row. Trade-offs for OA-3
to OA-7 are in [research.md](./research.md). "Leader proposal" marks the
four proposals the feature description itself names; they are proposals,
not decisions.

| # | Item | Proposal the plan is built on | Owner |
|---|---|---|---|
| OA-1 | **Docs update, human-only. STILL OPEN.** `form-api-contract.md` § 3 / § 5 (new `whatsappDialCode` field, `whatsapp` 6–14 digits without the dial code) and `ui-map.md` § 7 row "Número de WhatsApp" still describe the old rule. With Amendment A1 the same `ui-map.md` § 7 row's "default México" also changes, to "país de la IP del visitante (vía CloudFront, `GET /__geo`); México si no se conoce". Agents may not edit `docs/business/` | Roberto rewrites them, or tells the leader exactly what to write. Until then this spec is the record of the 2026-10-14 agreement | Roberto |
| OA-2 | **Deploy order.** The server rejects unknown fields (contract § 6), so this front fails every WhatsApp submission until the backend accepts `whatsappDialCode`. Unknown: does the new backend *require* `whatsappDialCode` when the preference is WhatsApp? If yes, the front currently in production fails WhatsApp submissions the moment the backend ships | Do not deploy this feature before the backend accepting `whatsappDialCode` is live. Roberto confirms whether the backend requires the field, and if so the two deploys are coordinated (same window). No feature flag | Roberto |
| OA-3 | **SUPERSEDED by Amendment A1 (2026-10-14).** Country detection *(leader proposal a)* | Region subtag of the browser's preferred languages, first one that names a listed country (`es-MX` → MX, `en-US` → US); none → Mexico. No IP lookup, no request. **Tension to confirm:** `messaging.md` rule 4 and `ui-map.md` § 1 forbid detecting the **language** from `Accept-Language`, which is the same browser data. Here it only pre-selects a dial code the visitor can change, never the language or any content. Also: a visitor in Mexico with an English (`en-US`) browser gets +1 by default. Alternative: time zone (see research R1) | Roberto |
| OA-4 | List scope *(leader proposal b)* | Full list of every country/territory with an assigned dial code (about 240), sorted by name in the page language, Mexico not pinned. **Search:** the plan's baseline is the browser's native list, whose built-in type-to-jump (typing "Col" jumps to Colombia) replaces a search box. A real search box needs the custom combobox of OA-6 option C | Roberto |
| OA-5 | Flag format *(leader proposal c)* | Emoji flags derived from the country code: zero bytes of assets, zero dependency, render inside a native list. **Known cost:** Chrome and Edge on Windows show the two letters ("MX") instead of the flag (INFERRED from platform behaviour, verify on a Windows machine). Alternatives: local SVG set, or emoji plus a self-hosted Windows flag font (research R3) | Roberto |
| OA-6 | Control type | **Option N (baseline): native list control** with a custom closed face (flag + dial code). Keyboard, screen-reader announcement and the mobile picker come from the browser; matches the precedent of feature 20's "Área y rol". **Option C:** custom combobox with a search box following the WAI-ARIA combobox/listbox pattern; required if Roberto wants a search box (OA-4) or SVG flags (OA-5) inside the list. The plan lists the delta tasks for C | Roberto (behaviour), Leader (whether the `.pen` draws a custom popover) |
| OA-7 | Data source *(leader proposal d)* | A static data module in the forms feature (country code + dial code per entry, hand-authored from the ITU-T E.164 assignment list, cross-checked against Google's libphonenumber metadata at authoring time only). Country **names** are not stored: they come from the browser's built-in localized region names in the page language, so ES/EN parity is structural. No new dependency (packages evaluated in research R4) | Roberto |
| OA-8 | Copy (new and changed strings) | Selector accessible name: ES "Lada del país" / EN "Country code". Number length error: ES "Deben ser entre 6 y 14 dígitos" / EN "Must be 6 to 14 digits" (replaces "Deben ser 10 dígitos" / "Must be 10 digits"). Dial-code server error: ES "Elige la lada de tu país" / EN "Choose your country code". Same strings in both forms | Roberto |
| OA-9 | Country after switching to Correo and back | The **number** is discarded, as today (`ui-map.md` § 7). The **chosen country** is kept for the rest of the visit, since it describes the visitor, not a value they typed into the hidden field. It is never sent while the preference is Correo | Roberto |
| OA-10 | **STILL OPEN.** **Visual values not determinable without the `.pen`** (only the leader can read it; Pencil is currently unavailable): (a) whether the design has a frame for the selector at all; (b) selector width and whether it is a separate box beside the number or merged into the number's box; (c) closed-face content and order (flag, dial code, chevron?), flag size; (d) gap between selector and number; (e) mobile (342 px form) layout: same row or stacked; (f) styling of the open list if custom (option C); (g) where the dial-code error sits | Build with existing tokens and classes only, no new token: the selector reuses the field control recipe of the select field (fill, border, radius, padding, chevron icon) as its own box at the start of the number's row, with the existing field gap; one row on every width; errors under the row, in the existing error style. Every class is **UNVERIFIED against the design** until the leader confirms or supplies values | Leader (from the `.pen`), Clau if no frame exists |

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A visitor outside Mexico leaves a WhatsApp number that works (Priority: P1)

A visitor on the landing (`/es/#contacto`, `/en/#contacto`) or on Nosotros
(`/es/nosotros#work`, `/en/about#work`) chooses WhatsApp as the contact
channel. The number field appears with a dial-code selector before it. The
visitor opens the selector, picks their country from a list showing flag,
name and dial code, types their national number and sends. The team receives
the dial code and the national number as two separate values.

**Why this priority**: Today the form accepts only 10-digit Mexican numbers,
so a client in Colombia or Spain cannot leave a WhatsApp number at all.

**Independent Test**: Choose WhatsApp, pick Colombia (+57) in the selector,
type a 10-digit number, submit with the network mocked: the request body
carries `whatsappDialCode: "+57"` and the digits of the number without any
dial code.

**Acceptance Scenarios**:

1. **Given** either form with preference Correo, **When** the visitor
   switches to WhatsApp, **Then** the number field appears with a dial-code
   selector placed before the number input, in both forms.
2. **Given** the selector is shown, **When** the visitor opens it, **Then**
   a list of countries shows, for each, its flag, its name in the page
   language and its dial code with "+".
3. **Given** the list is open, **When** the visitor picks a country,
   **Then** the closed selector shows that country's flag and dial code.
4. **Given** a valid form with WhatsApp, country Colombia and number
   "300 123 4567", **When** submitted, **Then** the body carries
   `whatsappDialCode: "+57"` and `whatsapp: "3001234567"`.
5. **Given** the same on the application form, **When** submitted, **Then**
   the `/careers` body carries the same two fields with the same rules.

---

### User Story 2 - The selector starts on the visitor's own country (Priority: P1)

> **SUPERSEDED by Amendment A1 (2026-10-14).** The source of the country is
> now `GET /__geo`, not the browser's languages; see A1 User Stories A1-1 to
> A1-4. Scenario 4 (a pick survives Correo ↔ WhatsApp) stays in force.

Most visitors never need to touch the selector: it already shows their
country, detected from the browser without asking any outside service. When
nothing can be detected, it shows Mexico (+52).

**Why this priority**: The default decides the dial code for every visitor
who does not open the selector, which is most of them.

**Independent Test**: With the browser's preferred languages set to
`["en-US"]`, `["es-CO", "es"]`, `["es"]` and `[]`, choose WhatsApp: the
selector shows US +1, Colombia +57, Mexico +52 and Mexico +52; the network
log shows no request caused by the detection.

**Acceptance Scenarios**:

1. **Given** preferred languages whose first region-bearing entry names a
   listed country, **When** the field appears, **Then** that country is
   selected.
2. **Given** preferred languages with no region (`es`), a region that is not
   a country (`es-419`), or a region not in the list, **When** the field
   appears, **Then** Mexico (+52) is selected.
3. **Given** any page load and any interaction, **Then** detection causes no
   network request of any kind.
4. **Given** the visitor already picked a country, **When** they switch to
   Correo and back to WhatsApp, **Then** their pick is kept (OA-9) and the
   number is empty.

---

### User Story 3 - The number rule fits any country (Priority: P1)

The visitor types only their national number. The form accepts 6 to 14
digits, ignoring spaces, dashes and parentheses, and never includes the dial
code in the number it sends.

**Why this priority**: A 10-digit rule rejects most of the world; the
backend already applies 6–14 digits.

**Independent Test**: Validate numbers of 5, 6, 14 and 15 digits, with and
without separators: 5 and 15 fail with the length message, 6 and 14 pass.

**Acceptance Scenarios**:

1. **Given** WhatsApp chosen and an empty number, **When** submitting,
   **Then** the existing "Escribe tu número" / "Enter your number" error
   shows and nothing is sent.
2. **Given** a number with fewer than 6 or more than 14 digits after
   removing non-digits, **When** submitting, **Then** the length error
   (OA-8) shows and nothing is sent.
3. **Given** "(55) 4433-2211", **When** submitted, **Then** the body
   carries `whatsapp: "5544332211"`.
4. **Given** preference Correo, **When** submitted, **Then** the body
   carries neither `whatsapp` nor `whatsappDialCode`.

---

### User Story 4 - The selector works without a mouse and with a screen reader (Priority: P2)

A keyboard or screen-reader user reaches the selector with Tab, hears its
name and current value, changes it with the keyboard, and hears the new
value.

**Why this priority**: Required by the acceptance criteria and by
`ui-map.md` § 10 "Accesibilidad mínima"; a control that only works with a
pointer would lock these visitors out of WhatsApp contact.

**Independent Test**: Tab to the selector; the accessibility tree exposes a
role, the name "Lada del país" / "Country code" and the current value;
arrow keys or typing change the value; the change is announced.

**Acceptance Scenarios**:

1. **Given** the field is visible, **When** tabbing through the form,
   **Then** focus reaches the selector, then the number input, in that
   order, with a visible focus ring in the existing red focus style.
2. **Given** focus on the selector, **Then** it exposes a role, the
   accessible name of OA-8 and the selected country (name and dial code).
3. **Given** focus on the selector, **When** the visitor uses the keyboard
   to open it, move and choose, **Then** the selection changes without a
   pointer and the newly selected option is announced.
4. **Given** the form is sending, **Then** the selector cannot be changed,
   like every other field.

---

### User Story 5 - A rejected dial code is marked on the selector (Priority: P3)

If the server answers `validation_failed` naming `whatsappDialCode`, the
selector is marked with the error style and the dial-code message, focus
goes to it, and the mark clears when the visitor picks another country.

**Why this priority**: The client only offers valid codes, so this path is
a safety net, but the acceptance criteria require it.

**Independent Test**: Mock a 400 with `fields: ["whatsappDialCode"]`: the
selector shows the error style and message, receives focus, and the message
disappears after choosing another country.

**Acceptance Scenarios**:

1. **Given** WhatsApp chosen, **When** the server answers
   `validation_failed` with `whatsappDialCode` in `fields`, **Then** the
   selector is marked and focused, and no generic error is shown.
2. **Given** `fields` holds both `whatsappDialCode` and `whatsapp`, **Then**
   both are marked and focus goes to the selector (first in field order).
3. **Given** the mark is shown, **When** the visitor picks another country,
   **Then** the mark disappears.
4. **Given** preference Correo, **When** a `validation_failed` names
   `whatsappDialCode`, **Then** it is treated as a site defect and the
   generic error shows (same rule the `whatsapp` field already follows).

---

### Edge Cases

- **Shared dial codes.** +1 is shared by the United States, Canada and the
  Caribbean NANP members; +7 by Russia and Kazakhstan; +44 by the United
  Kingdom and its Crown Dependencies, among others. Each country is its own
  list entry with its own flag; the request carries only the dial code
  ("+1"), so picking Canada or the United States sends the same value. NANP
  area codes (Jamaica's 876, for example) belong to the national number,
  never to the dial code.
- **Visitor types the dial code into the number** ("+52 55 4433 2211" with
  Mexico selected). The number becomes "525544332211" (12 digits), passes
  the 6–14 rule and is sent with the dial code duplicated. Not detected in
  this feature (Assumptions); the team sees it in the message.
- **Region code with no browser name.** If the browser has no localized
  name for a listed code, the entry shows the code itself, never an empty
  row.
- **Old browsers without localized region names.** Same fallback: codes
  instead of names; the form still works.
- **Prerendered HTML.** The field is hidden until the visitor chooses
  WhatsApp, so the static HTML never contains a guessed country; detection
  runs only in the visitor's browser.
- **Server marks `whatsapp` after a country change.** The number mark stays
  while the number is unchanged, as today; changing the country alone does
  not clear a number mark.
- **Windows without flag glyphs** (OA-5): the two-letter code shows in place
  of the flag; name and dial code remain, so the list stays usable.

## Requirements *(mandatory)*

### Functional Requirements

**Selector presence and content**

- **FR-001**: Both forms MUST show, whenever and only when the contact
  preference is WhatsApp, a dial-code selector placed before the WhatsApp
  number input, inside the same conditional field and its existing
  show/hide transition.
- **FR-002**: The selector's list MUST contain every entry of the country
  data set (OA-4, OA-7), each showing the flag, the country name in the
  page language (ES on `/es/`, EN on `/en/`) and the dial code written with
  "+".
- **FR-003**: The list MUST be ordered alphabetically by the displayed name
  under the page language's collation rules (an accented initial, as in
  "Åland", sorts with its base letter, not after "Z").
- **FR-004**: The closed selector MUST show the selected country's flag and
  dial code; picking an entry MUST update both immediately.
- **FR-005**: Every dial code in the data set MUST match `^\+[1-9]\d{0,3}$`
  and every country code MUST be unique; a check MUST fail the build if not.

**Default country**

- **FR-006** *(SUPERSEDED by A1: FR-A01..FR-A04)*: When the field first appears, the selected country MUST be
  the first preferred browser language whose region subtag is a two-letter
  code present in the data set; otherwise Mexico (+52) (OA-3).
- **FR-007** *(SUPERSEDED by A1: FR-A05, FR-A06)*: Detection MUST make no network request and MUST NOT read
  anything other than the browser's preferred-languages setting; nothing it
  reads is sent anywhere.
- **FR-008** *(timing amended by A1: FR-A08)*: Detection MUST run only in the visitor's browser; the
  prerendered HTML MUST NOT depend on it.
- **FR-009**: A country the visitor picked MUST survive switching to Correo
  and back during the same page visit (OA-9); the number MUST still be
  discarded on that switch, as today.

**Number rule and payloads**

- **FR-010**: With preference WhatsApp, the number MUST be validated on the
  client as 6–14 digits after removing every non-digit character; empty
  keeps the existing "required" error, any other count shows the length
  error (OA-8).
- **FR-011**: The number MUST be sent as its digits only, without the dial
  code.
- **FR-012**: With preference WhatsApp, `POST /contact` and `POST /careers`
  MUST carry `whatsappDialCode` equal to the selected country's dial code
  (format `^\+[1-9]\d{0,3}$`) together with `whatsapp`.
- **FR-013**: With preference Correo, neither request MUST carry
  `whatsappDialCode` or `whatsapp` (absent, not empty).
- **FR-014**: No other request field may change.

**Errors**

- **FR-015**: A 400 `validation_failed` whose `fields` contains
  `whatsappDialCode` MUST mark the selector (error style, dial-code
  message, `aria-invalid`), provided the preference is WhatsApp; otherwise
  the outcome is the generic error.
- **FR-016**: The selector MUST take part in "focus the first invalid
  field", placed before the number in field order.
- **FR-017**: A server mark on the selector MUST clear as soon as the
  selected country changes.

**Accessibility**

- **FR-018**: The selector MUST be reachable and operable with the keyboard
  alone (open, move, choose, close), expose a role and an accessible name
  (OA-8), expose the selected value, and have the selection announced by
  assistive technology. If option C (custom combobox) is chosen, it MUST
  follow the WAI-ARIA Authoring Practices combobox/listbox pattern.
- **FR-019**: The selector MUST be read-only while the form is sending or
  uploading, like every other field.
- **FR-020**: Flags MUST be decorative for assistive technology: the name
  and dial code carry the meaning.

**i18n and platform**

- **FR-021**: Every new or changed string (OA-8) MUST exist in both locale
  files with the same keys; country names MUST be available in both
  languages from one source, with no per-locale hand-maintained list.
- **FR-022**: The feature MUST add no request to any third-party origin,
  no server route and no runtime dependency on a service; components under
  `ui/` MUST NOT call the network.
- **FR-023**: No new color, spacing or size literal; only existing tokens
  (OA-10).

### Key Entities

- **Country entry**: a two-letter region code (ISO 3166-1 alpha-2, plus
  `XK` Kosovo) and its dial code with "+". Name and flag are derived, never
  stored.
- **Selected country**: a form value holding one country code; defaults
  per Amendment A1 (FR-A01..FR-A04); maps to the request's `whatsappDialCode`.
- **WhatsApp number**: the national number as typed; sent as digits only.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor from any listed country can submit a WhatsApp
  contact or application with their own dial code; 100% of WhatsApp
  submissions carry a dial code matching the agreed format.
- **SC-002** *(SUPERSEDED by A1: SC-A01)*: A visitor whose browser names their country completes the
  WhatsApp field without opening the selector.
- **SC-003** *(SUPERSEDED by A1: SC-A03, SC-A04)*: Zero network requests are attributable to country detection
  (verified in the browser's network panel and in the generated site).
- **SC-004**: A keyboard-only user can change the country and submit
  without using a pointer; a screen reader announces the selector's name,
  value and every change.
- **SC-005**: Both locales show the same set of countries, each named in
  the page language; the i18n parity check passes with the new keys.
- **SC-006**: The project's quality gates (lint, type check, tests, static
  generation, component catalogue build) pass.

## Assumptions

- The backend strips non-digits from `whatsapp` before counting, as it does
  today, and accepts exactly the agreed format for `whatsappDialCode`
  (feature description, 2026-10-14).
- The backend keeps rejecting unknown fields (contract § 6); hence OA-2.
- No parsing of a dial code typed inside the number field; no per-country
  length rules (the backend applies a single 6–14 range).
- No persistence of the chosen country across visits (no storage); a new
  visit starts from detection again.
- The site's own language is never changed by this feature; detection only
  pre-selects the dial code.
- The existing labels "Número de WhatsApp" / "WhatsApp number" stay.
- Deployment target, static output and Turnstile setup are unchanged.
- Visual values are UNVERIFIED (OA-10) until the leader reads the `.pen`.

---

## Amendment A1 (2026-10-14) — Default country from the visitor's IP

**Requested by**: Roberto, 2026-10-14, as part of feature 32 (not a separate
feature; the draft that was briefly numbered 033 is folded in here and
deleted). `feature_list.json` feature 32 `description` ("AMPLIACIÓN
2026-10-14") and `acceptance` are the requirements.

**Replaces**: OA-3 (default from `navigator.languages`), User Story 2,
FR-006, FR-007, the timing part of FR-008, SC-002, SC-003; plan D-2;
research R1; data-model § 2 (detection row) and § 3 (`detectDefaultCountry`,
`readBrowserLanguages`).

**Unchanged**: selector, list, flags, payload (`whatsappDialCode`), 6–14
digit rule, server marks, OA-9 (the chosen country survives a Correo ↔
WhatsApp round trip), OA-2 (backend deploy order).

**Still open**: OA-1 (human-only docs, including the `ui-map.md` § 7 "default
México" wording) and OA-10 (visual values from the `.pen`). A1 adds no
visual: same selector, list and flags; the only visible effect is IP-4's
in-place change of flag and dial code. If the `.pen` holds a "detecting"
state or a transition, it comes back as an OA-10 question.

Evidence labels (org policy): **CONFIRMED** = checked against a repository,
a command or the AWS documentation; **INFERRED** = derived from evidence;
**UNVERIFIED** = not checked.

### A1 gate — approved by Roberto on 2026-10-14, as written

| # | Item | Approved decision | Trade-offs |
|---|---|---|---|
| IP-1 | Mechanism | Same-origin read-only `GET /__geo`, answered **by the existing `request-router` viewer-request function** in muush-foundation with `{"country":"MX"}` or `{"country":null}`, never cached. **One edge function** (muush-foundation gate G-VII.6 kept); HTML cache untouched. Contract: [contracts/edge-geo-endpoint.md](./contracts/edge-geo-endpoint.md), a deliverable for muush-foundation; this repository does not edit it | research R11 |
| IP-2 | Constitution Art. IV | **Complies without amendment.** The feature does not *require* the edge piece: without it every visitor gets Mexico, the specified default. The site artefact is unchanged in kind (`nitro.preset: 'static'`, no `server/`, no new dependency) | research R12 |
| IP-3 | When the country is asked for | Once per page load, on the visitor's **first interaction with a form** or on **switching to WhatsApp**, whichever comes first; never at page load, never during prerender. **3-second timeout**: no answer by then → Mexico for the rest of the visit | research R13 |
| IP-4 | Late answer | A **late answer never overwrites a country the visitor picked**. It is applied only while the visitor has not picked one; typing digits is not picking | data-model § 8 |
| IP-5 | IP used for the dial code only | The IP country only **pre-selects the dial code**; it never chooses the **language**, route or content (`messaging.md` rule 4 and `ui-map.md` § 1 stay intact) | research R13 |
| IP-6 | Deploy order with muush-foundation | **None.** Front first: everyone gets Mexico until the edge ships. Edge first: the address answers and nobody asks yet. muush-foundation still verifies after its apply that `/__geo` returns a real country (contract § 5). The backend deploy order of OA-2 is a separate matter and still applies | research R11.3 |

### A1 user stories

#### A1-1 — A visitor outside Mexico sees their own country preselected (P1)

A visitor in Colombia, with a browser set to English, opens the landing
(`/es/#contacto`, `/en/#contacto`) or Nosotros (`/es/nosotros#work`,
`/en/about#work`), starts filling the form and chooses WhatsApp. The
selector already shows Colombia (+57).

**Independent Test**: with a country source that reports `CO`, focus the
form, switch to WhatsApp, read the selector.

1. **Given** `/__geo` reports a valid country present in the list (`CO`),
   **When** the visitor switches to WhatsApp, **Then** the selector shows
   Colombia +57.
2. **Given** browser languages `en-US` and `/__geo` reporting `MX`, **Then**
   the selector shows Mexico +52: the browser language is not used.
3. **Given** the visitor sends with that default, **Then** the request
   carries that country's dial code (payload rules unchanged).

#### A1-2 — Without a known location, Mexico, silently (P1)

**Independent Test**: run with no edge (`pnpm dev`, a local preview of the
generated output, Storybook): the selector defaults to Mexico, no error.

1. **Given** no answer (address missing, network error, non-success status,
   not JSON, HTML body), **Then** Mexico +52 and nothing on the page
   mentions it.
2. **Given** `country` empty, `null`, lowercase, not two letters or not
   letters, **Then** Mexico.
3. **Given** a well-formed code not in the list (`AQ`, `XX`), **Then** Mexico.
4. **Given** no answer within 3 seconds, **Then** Mexico; a later answer is
   ignored.

#### A1-3 — A choice the visitor made is never overwritten (P1)

1. **Given** the visitor picked Peru, **When** an answer reporting `CO`
   arrives later, **Then** Peru stays.
2. **Given** the visitor picked Peru and switched to Correo and back,
   **Then** Peru stays (OA-9) and the answer does not replace it.
3. **Given** the visitor has only typed digits in the number (no pick),
   **When** the answer arrives, **Then** the reported country replaces
   Mexico.

#### A1-4 — Nothing about the visitor leaves for a third party (P1)

**Independent Test**: in the network panel the only new request is one
same-origin `GET /__geo`, only after interacting with a form; no permission
prompt; the generated output contains no new origin.

1. **Given** any visit, **Then** no location-permission prompt appears.
2. **Given** a visit that never touches a form, **Then** no country request.
3. **Given** a visit that interacts with a form, **Then** at most one
   country request per page load, same origin, carrying no visitor data.
4. **Given** the answer, **Then** it contains a country code and nothing
   else (no IP, city or coordinates).

### A1 edge cases

- **Answer arrives while the preference is Correo**: the country is set (if
  not picked) and shown on switching to WhatsApp; nothing is sent while the
  preference is Correo.
- **Contact form, then Nosotros in the same visit**: the second page may ask
  once for its own page load; nothing is stored beyond page memory.
- **Shared dial codes**: the reported *country* is selected, so a Canadian
  sees Canada, not the United States.
- **Codes CloudFront never reports** (`AC`, `TA`, `XK`): still pickable by
  hand.
- **VPN or travelling visitor**: gets the country of the apparent IP; the
  selector stays changeable. Accepted limitation.
- **HTML answer** (dev server or a static preview serving its 404 page):
  treated as no answer → Mexico.
- **Prerender**: the country is never read at build time; the generated HTML
  is identical for every visitor and contains no country.

### A1 functional requirements

- **FR-A01**: When the visitor's country is not known, the selector MUST
  default to Mexico (+52).
- **FR-A02**: When `/__geo` reports a country that is two uppercase letters
  **and** is in the selector's list, the selector MUST default to it.
- **FR-A03**: Any other report (absent, empty, `null`, wrong shape, not in
  the list, unreadable, non-success, not answered within 3 s) MUST leave
  Mexico selected and MUST NOT show any message, mark or error.
- **FR-A04**: The browser's language settings MUST NOT be used to choose the
  default country; the language-based detection is removed, not kept as a
  fallback.
- **FR-A05**: The only source of the country MUST be the same-origin
  `GET /__geo` ([contract](./contracts/edge-geo-endpoint.md)). The page MUST
  NOT contact any third party to learn it and MUST NOT send the visitor's IP
  or any visitor data in that request.
- **FR-A06**: The page MUST NOT use the Geolocation API (no permission
  prompt) nor the time zone to choose the country.
- **FR-A07**: A country the visitor picked MUST NOT be replaced by a report,
  whenever it arrives.
- **FR-A08**: The country MUST be requested at most once per page load, only
  after the first interaction with a form or the switch to WhatsApp; never
  at page load, never at build time. The request is aborted after 3000 ms.
- **FR-A09**: The country MUST NOT be stored beyond page memory (no cookie,
  no Web Storage) and MUST NOT be sent to the Form Submission API; only the
  chosen dial code is sent.
- **FR-A10**: The site MUST remain static (`nitro.preset: 'static'`, no
  `server/`, no new dependency); the generated output MUST contain no
  country and no new third-party origin; components under `ui/` MUST NOT
  call the network.
- **FR-A11**: The page MUST work and default to Mexico wherever the edge
  piece is absent: dev server, local preview of the generated output,
  Storybook, test suite.
- **FR-A12**: No new user-facing string (i18n parity unaffected); if one
  appears, it MUST exist in ES and EN.

### A1 key entities

- **Country report**: what `/__geo` says about the current visitor: one ISO
  3166-1 alpha-2 code or nothing. Lives in page memory for the page load.
- **Picked flag**: whether the visitor chose a country in this page load; it
  shields the choice from the report.

### A1 success criteria

- **SC-A01**: A visitor whose network location is Colombia, the United
  States or Mexico sees that country preselected, regardless of browser
  language, once the edge piece is live.
- **SC-A02**: With the edge piece absent or answering garbage, 100% of
  visits show Mexico (+52) and zero visible errors.
- **SC-A03**: Zero location-permission prompts and zero third-party requests
  attributable to the feature.
- **SC-A04**: A visit that never interacts with a form makes zero country
  requests; one that does makes at most one per page load.
- **SC-A05**: A picked country is never replaced by the report.

### A1 assumptions

- CloudFront derives the country from the IP it already receives to serve
  the site; no new party learns the IP (CONFIRMED, AWS "Add CloudFront
  request headers": `CloudFront-Viewer-Country` is ISO 3166-1 alpha-2,
  computed from the viewer IP).
- 3 s is enough for a same-origin edge-generated answer and short enough
  that a late flip is unlikely (INFERRED).
- The country request carries no cookie the site sets and no visitor data.
- The edge piece is built, deployed and verified by the muush-foundation
  harness from the contract; nothing here edits that repository.
- One form per page (landing: contact; Nosotros: application), so "once per
  page load" and "once per form" coincide today.
- Whether `cloudfront-viewer-country` reaches a viewer-request *function*
  without a cache/origin-request policy is **UNVERIFIED** (research R11.1
  F4); the contract makes muush-foundation responsible and the site falls
  back to Mexico meanwhile.
