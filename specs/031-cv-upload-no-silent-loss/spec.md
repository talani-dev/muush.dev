# Feature Specification: A chosen CV is never lost in silence

**Feature Branch**: `031-cv-upload-no-silent-loss`
**Created**: 2026-10-13
**Status**: Done (approved by Roberto 2026-10-13; reviewer APPROVED 2026-10-13)
**Input**: Feature 31 `cv_upload_no_silent_loss` in `feature_list.json`
(hotfix requested by Roberto on 2026-10-13). Its `description` and
`acceptance` array are the requirements; this document restates them as
testable behaviour and does not add scope.

**Supersedes** (decision of Roberto, 2026-10-13):

- `docs/business/landing/form-api-contract.md` § 9, last bullet ("Si la
  subida del CV falla, la postulación se manda sin `cvId` y el estado de
  éxito lo dice con una nota").
- `form-api-contract.md` § 7, point 5, second sentence ("Si la subida falla,
  la postulación se puede enviar igual sin `cvId`").
- Feature 29 (`specs/029-form-submission-integration/`): FR-016, US2
  scenario 5, OA-2 (the CV note copy), SC-003, and the acceptance item "si
  falla cualquier paso del upload, se envía sin cvId y el éxito muestra la
  nota aprobada".

Everything else in feature 29 stays in force (payload shapes, single 403
retry with a fresh token, field-error mapping, generic error, spam guard,
Invisible Turnstile, configuration).

---

## Open for approval (resolve at the gate)

None of these is a `[NEEDS CLARIFICATION]` blocker: each carries a proposal
the plan is built on, so the gate is a yes/no. Changing any of them changes
a constant, a copy string or a class list, not the design.

| # | Item | Proposal | Owner |
|---|---|---|---|
| OA-1 | **Docs update, human-only.** `form-api-contract.md` § 9 (last bullet) and § 7.5 still describe the reversed behaviour. Agents may not edit `docs/business/` | Roberto rewrites both, or tells the leader exactly what to write. Until then this spec is the record of the 2026-10-13 decision | Roberto |
| OA-2 | Copy. All new strings were given in the request: error ES/EN, "Reintentar subida" / "Retry upload", "Enviar sin CV" / "Submit without CV", "Subiendo CV…" / "Uploading CV…". One observation: the EN submit button of this form reads **"Send"** (`en.json`), so "Submit without CV" names a verb the page never shows | Ship the strings exactly as given. Optional alternative for EN only: "Send without CV". Roberto picks | Roberto |
| OA-3 | Upload time bound. The file upload needs a maximum wait before it counts as failed | **60 seconds** (unchanged from feature 29: 5 MiB at about 1 Mbit/s is about 42 s). The authorization request keeps its 15 s bound | Roberto |
| OA-4 | What "Reintentar subida" does after the upload succeeds. The visitor already pressed Enviar once | The retry runs the whole submission again: new authorization, new upload, then the application is sent with the CV. The visitor does not have to press Enviar a second time | Roberto |
| OA-5 | **Visual values not determinable from existing components** (only the leader can read the `.pen`): (a) whether the design has a frame for this error state at all; (b) the layout of the two actions (one row or stacked, gap between them, alignment, position relative to the message); (c) their visual treatment (text-only like the existing support link, or another existing style); (d) the uploading state, if drawn differently from "Enviando…" | Build with existing primitives and tokens only, no new token: message in the field-error style the CV field already uses; two text-only actions in the treatment of the existing support link in the error message; uploading reuses the submit button's sending treatment with a different label. Every class is **UNVERIFIED against the design** until the leader confirms or supplies values | Leader (from the `.pen`), Clau if no frame exists |

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A candidate whose CV fails to upload decides what happens (Priority: P1)

A visitor on Nosotros (`/es/nosotros#work`, `/en/about#work`) fills in the
application, attaches a PDF and presses Enviar / Send. The CV upload fails
(the authorization is refused, the file upload is refused, the network or
a cross-origin block stops it, or it takes too long). The application is
**not** sent. Next to the CV field the visitor reads that the CV could not
be uploaded, and gets two explicit choices: retry the upload, or send the
application without the CV. Everything typed is still there.

**Why this priority**: This is the defect. Today the candidate believes the
CV was attached while the team receives an application without one.

**Independent Test**: With the network mocked so that the upload
authorization fails (and, separately, so that the file upload answers 403,
and rejects with a network error), submit a valid application with a PDF:
no application request is sent, the CV error and both actions are visible,
and every value is kept.

**Acceptance Scenarios**:

1. **Given** a valid application with a PDF, **When** the upload
   authorization answers anything other than a usable success (including
   after its single silent retry for an expired anti-abuse token), **Then**
   no file upload and no application request are sent, and the CV error is
   shown next to the CV field.
2. **Given** a valid application with a PDF and a usable authorization,
   **When** the file upload answers 403, any status other than 200, fails
   on the network or by a cross-origin block, or exceeds the time bound
   (OA-3), **Then** no application request is sent and the CV error is
   shown.
3. **Given** the CV error is shown, **Then** it reads, in the page language,
   ES "No pudimos subir tu CV. Inténtalo de nuevo o envía la postulación sin
   CV." / EN "We couldn't upload your CV. Try again or submit without a
   CV.", and offers two actions: "Reintentar subida" and "Enviar sin CV"
   (EN "Retry upload" and "Submit without CV", subject to OA-2).
4. **Given** the CV error is shown, **Then** every typed value and the
   chosen file are kept, the success state is not shown, and no note about a
   missing CV appears anywhere.
5. **Given** the CV error appears, **Then** it is announced to assistive
   technology and keyboard focus moves to the "Reintentar subida" action.

---

### User Story 2 - Retrying the upload gets a fresh authorization every time (Priority: P1)

From the CV error the visitor presses "Reintentar subida". The site asks for
a brand new upload authorization (never the previous one), uploads the same
file again, and only after the upload is confirmed sends the application
with the CV reference. If it fails again, the same CV error is shown again.

**Why this priority**: A retry that reused an expired or already-used
authorization would always fail, which turns the choice into a dead end.

**Independent Test**: Mock a first attempt whose file upload fails and a
second that succeeds; press "Reintentar subida": two different upload
addresses were used, each authorization and the application each carried a
different fresh anti-abuse token, and the application carries the CV
reference from the second authorization.

**Acceptance Scenarios**:

1. **Given** the CV error after a failed attempt, **When** "Reintentar
   subida" is pressed, **Then** a new upload authorization is requested with
   a newly obtained anti-abuse token, and the file is uploaded to the
   address returned by that new authorization, never to an earlier one.
2. **Given** the retried upload is confirmed, **Then** the application is
   sent with a newly obtained anti-abuse token and the CV reference returned
   by the authorization of that same attempt (OA-4).
3. **Given** the retry fails again at any step, **Then** no application
   request is sent and the CV error is shown again, with both actions.
4. **Given** any number of retries, **Then** no anti-abuse token and no
   upload address is ever used twice.
5. **Given** the visitor presses Enviar / Send instead of "Reintentar
   subida" while the CV is still chosen, **Then** it behaves exactly like a
   retry: the CV is uploaded again from a new authorization before the
   application is sent. Pressing Enviar never sends the application without
   the CV while a CV is chosen.

---

### User Story 3 - The candidate chooses to send without the CV (Priority: P1)

From the CV error the visitor presses "Enviar sin CV". The chosen file is
removed from the form and the application is sent without any CV
reference. From there the normal outcomes apply: success, field errors or
the generic error.

**Why this priority**: It is the only path that sends an application
without the CV once one was chosen, and it is the person's decision.

**Independent Test**: From the CV error, press "Enviar sin CV": the CV field
shows no file, exactly one application request is sent, it has no CV
reference, and no upload authorization or file upload is attempted.

**Acceptance Scenarios**:

1. **Given** the CV error, **When** "Enviar sin CV" is pressed, **Then** the
   CV field is emptied (placeholder shown again) and one application
   request is sent without a CV reference, with a newly obtained anti-abuse
   token, and no upload is attempted.
2. **Given** that request answers with success, **Then** the standard
   success copy is shown, with no extra note.
3. **Given** that request fails, **Then** the generic error of feature 29 is
   shown, every other value is kept, and the CV stays removed (the person
   chose to send without it; pressing Enviar again sends without CV).
4. **Given** that request is rejected for specific fields, **Then** those
   fields are marked as in feature 29.

---

### User Story 4 - An invalid file is refused the moment it is chosen (Priority: P2)

A visitor selects a file that is not a PDF, or a PDF larger than
5,242,880 bytes. The CV field shows the matching error immediately, before
any submit, and nothing is sent anywhere about it.

**Why this priority**: Saves a doomed round trip and gives immediate,
specific feedback. Today the rejected file is silently dropped and no
message appears at all.

**Independent Test**: Select a `.docx`, then a 6 MB PDF: each time the
existing format or size message appears at once, the field holds no file,
and zero requests of any kind are made.

**Acceptance Scenarios**:

1. **Given** the visitor selects a file whose type is not PDF, **Then** the
   existing format error ("Solo se aceptan archivos PDF" / "Only PDF files
   are accepted") is shown at once and the field holds no file.
2. **Given** the visitor selects a PDF larger than 5,242,880 bytes, **Then**
   the existing size error ("El archivo debe pesar máximo 5MB" / "The file
   must be 5MB or smaller") is shown at once and the field holds no file.
3. **Given** either refusal, **Then** no upload authorization, no file
   upload and no application request is made.
4. **Given** a refusal is shown, **When** the visitor then selects a valid
   PDF, **Then** the error disappears and the file is shown.
5. **Given** a PDF of exactly 5,242,880 bytes, **Then** it is accepted.

---

### User Story 5 - The visitor sees that the CV is uploading (Priority: P2)

While the CV is being uploaded the submit control is disabled and reads
"Subiendo CV…" / "Uploading CV…"; once the upload is confirmed and the
application itself is being sent, it reads "Enviando…" / "Sending…" as
today.

**Why this priority**: A 5 MB upload on a slow connection can take tens of
seconds; the visitor must know the site is working and must not be able to
start a second submission.

**Independent Test**: With a file upload that stays pending, submit: the
button is disabled, reads the uploading label, fields are read-only, and a
second press sends nothing; resolve the upload and the label changes to the
sending label.

**Acceptance Scenarios**:

1. **Given** a submission with a CV, **When** the authorization or the file
   upload is in progress, **Then** the submit control is disabled, reads
   "Subiendo CV…" / "Uploading CV…", fields are read-only, and the two CV
   actions are not available.
2. **Given** the upload was confirmed, **When** the application request is
   in progress, **Then** the control reads "Enviando…" / "Sending…".
3. **Given** a submission without a CV, **Then** "Subiendo CV…" never
   appears.
4. **Given** any of these in-progress states, **Then** pressing submit
   again sends nothing.

---

### Edge Cases

- **Upload authorization rejected for a field** (e.g. the server disagrees
  on size): counts as a CV upload failure (CV error with both actions), not
  as a field error. The visitor can still retry or send without CV.
- **Anti-abuse token expired on the authorization**: one silent retry with a
  fresh token, exactly as feature 29 does for every API call; only if that
  also fails is the CV error shown.
- **Anti-abuse token cannot be obtained** (script blocked, offline) before
  the authorization: CV error, nothing sent. Before the application request
  (e.g. after "Enviar sin CV"): generic error, as in feature 29.
- **File upload answers another 2xx** (e.g. 204): treated as failure. Only
  200 confirms the upload (feature 31 description).
- **Malformed authorization** (missing reference, address, method or
  content type, or a method other than upload-by-PUT): CV upload failure.
- **The visitor changes or removes the file while the CV error is shown**:
  the CV error disappears; the next Enviar runs the normal flow for whatever
  is now chosen. Removing the file by hand is the person's decision, the
  same as "Enviar sin CV".
- **The visitor edits other fields while the CV error is shown**: the CV
  error stays until an action, a file change or a new submit. If a retry
  finds the form invalid, the normal client validation state wins and
  nothing is sent.
- **Application request fails after a confirmed upload** (500, network,
  timeout): the generic error of feature 29. Pressing Enviar again uploads
  the CV again from a new authorization (each attempt is self-contained).
- **The file is modified or replaced on disk between attempts**: out of the
  site's control; the browser reads whatever the chosen file is at upload
  time.
- **Browser-native console output**: when a cross-origin block happens, the
  browser itself may print the blocked address in its developer console.
  That message is produced by the browser, not by the site, and cannot be
  suppressed; FR-016 governs only what the site itself writes.
- **No JavaScript**: the form cannot submit (unchanged); nothing is sent.

---

## Requirements *(mandatory)*

### Functional Requirements

**Never sent without the CV unless the person decides**

- **FR-001**: When a CV is chosen, the application request MUST NOT be sent
  unless the file upload of that same attempt was confirmed with a 200.
- **FR-002**: A failure of the upload authorization (any outcome other than
  a usable success, after its single anti-abuse retry) or of the file upload
  (any status other than 200, a 403, a network or cross-origin failure, or
  exceeding the time bound of OA-3) MUST end the attempt with the CV error
  state and nothing further sent.
- **FR-003**: The CV error MUST be shown next to the CV field, in the page
  language, with the copy of US1-3 and two actions: retry the upload, and
  send without CV. It MUST be announced to assistive technology, and focus
  MUST move to the retry action.
- **FR-004**: "Enviar sin CV" MUST clear the chosen file and send the
  application without a CV reference. It is the only control that sends an
  application without a CV reference after a CV had been chosen and not
  removed by the visitor.
- **FR-005**: The application request MUST carry a CV reference only when
  the file upload of the same attempt answered 200, and MUST then carry the
  reference returned by that attempt's authorization.
- **FR-006**: The success state MUST NOT carry any "CV could not be
  attached" note; feature 29's note, its copy and every path to it are
  removed.

**Fresh authorization and token every time**

- **FR-007**: Every upload attempt (first try, "Reintentar subida", or a new
  Enviar) MUST request a new upload authorization; an upload address MUST
  NOT be used more than once.
- **FR-008**: Every request to the upload authorization and to the
  application MUST carry an anti-abuse token obtained for that request
  alone, retries included (feature 29 FR-013/FR-014 extended to the retry
  actions).

**The file upload itself**

- **FR-009**: The file upload MUST send the visitor's original file, byte
  for byte, as the request body, using the upload method and address the
  authorization returned.
- **FR-010**: The file upload MUST declare the content type exactly as the
  authorization returned it, and MUST NOT set the content length itself;
  the browser derives it from the file, which equals the size declared to
  the authorization.
- **FR-011**: The file upload MUST be bounded in time (OA-3); exceeding it
  is a failure under FR-002.

**Feedback while working**

- **FR-012**: While the authorization or file upload is in progress, the
  submit control MUST be disabled and read "Subiendo CV…" / "Uploading
  CV…", fields MUST be read-only and the CV actions unavailable. While the
  application request is in progress it MUST read "Enviando…" / "Sending…"
  (existing copy).

**Immediate file checks**

- **FR-013**: Selecting a file that is not a PDF, or larger than 5,242,880
  bytes, MUST show the existing format or size error immediately, leave the
  field without a file, and cause no request of any kind.

**Privacy of what the site writes**

- **FR-014**: The site MUST NOT write the upload address (a temporary
  credential) or any personal data from the form (name, email, WhatsApp,
  portfolio, LinkedIn, file name or content) to the browser console, to any
  analytics tool or to any error-reporting tool.
- **FR-015**: No analytics or error-reporting tool is added by this
  feature.

**Copy and architecture**

- **FR-016**: Every new string (CV error, two action labels, uploading
  label) MUST exist in both Spanish and English; the removed note MUST be
  removed from both. No string is hardcoded in a component.
- **FR-017**: No presentational component performs a network request; all
  network code stays in the forms logic layer (Constitution Art. V).
- **FR-018**: No server route or runtime server is added (Constitution
  Art. IV).
- **FR-019**: Any new visual element MUST be built from existing primitives
  and design tokens, with no new color or spacing literal (Constitution
  Art. VII). Values the design file must confirm are listed in OA-5.

### Key Entities

- **Upload attempt**: one authorization, one file upload, and (if both
  succeed) one application request. Owns its own upload address, CV
  reference and anti-abuse tokens; nothing carries over to the next
  attempt.
- **CV upload error state**: the form state after a failed upload attempt:
  values and file kept, application not sent, CV error and two actions
  shown.
- **Submission outcome**: success (no CV note any more), field errors,
  generic failure, or CV upload failure (new).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0% of applications where a CV was chosen arrive without the
  CV unless the candidate explicitly pressed "Enviar sin CV" or removed the
  file.
- **SC-002**: 100% of failed CV uploads show the CV error with both
  actions, and 100% keep every typed value.
- **SC-003**: A candidate whose first upload failed and whose retry
  succeeds reaches the success state with at most one extra press
  ("Reintentar subida").
- **SC-004**: 100% of upload attempts use an upload address and anti-abuse
  tokens never used before (verified by automated tests over first try,
  retry and repeated retries).
- **SC-005**: Choosing an invalid file produces its error in the same
  interaction, with 0 network requests.
- **SC-006**: The site's own code writes 0 upload addresses and 0 personal
  form values to the console, analytics or error reporting (verified by an
  automated check over the forms code).

## Assumptions

- The backend contract is unchanged (`form-api-contract.md` § 4, § 5). The
  request text said "POST /upload"; it is the same `/careers/upload`
  endpoint.
- Feature 29's single silent retry on an expired anti-abuse token
  (contract § 7.6) still applies to the upload authorization; the "403" in
  this feature's failure list refers to the file upload, and to an
  authorization that is still refused after that retry.
- The missing cross-origin configuration of the CV bucket is fixed by infra
  separately; this feature changes what the site does when the upload
  fails, whatever the cause. Until infra fixes it, every CV upload in
  production will reach the CV error; that is the intended honest outcome.
- Each attempt is self-contained: a CV uploaded in an attempt whose
  application request then failed is uploaded again on the next attempt.
  Whether the backend cleans up objects that no application references is
  a backend matter, not this site's (noted for Roberto, not a blocker).
- The PDF check is the existing one (the file's reported type must be
  `application/pdf`); the 5,242,880-byte limit equals the contract's
  maximum. No client rule changes, so the backend needs no change
  (contract § 7.7).
- A file refused on selection leaves the field empty rather than keeping a
  previously chosen file, so what the field shows is always what would be
  sent.
- The CV stays optional (`decisions-open.md` #7 unchanged); applications
  without a CV that never chose one behave exactly as in feature 29.
- The site has no analytics and no error-reporting tool today (CONFIRMED by
  searching `app/`, `nuxt.config.ts` and `package.json` on 2026-10-13), and
  the forms code writes nothing to the console today.
- All verification uses mocked network (Constitution Art. X; no E2E).
