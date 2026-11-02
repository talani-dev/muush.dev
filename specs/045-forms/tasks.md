---
description: "Task list for feature 45 — Muush 1.0 forms"
---

# Tasks: Muush 1.0 forms (feature 45)

**Input**: `specs/045-forms/` — spec.md, plan.md, research.md, data-model.md, contracts/components.md, quickstart.md
**Tests**: required (Constitution Article X; spec FR-032, SC-001…SC-007). Test names follow `should <expected> when <condition>`.
**Visual values**: `docs/harness/progress/pen-extract-45.md` only. A value missing there is asked of the leader, never invented. Copy: `docs/business/muush-1.0.md` § 4.6 / § 4.8 verbatim, plus data-model § 4 (provisional items marked ⚠ wait for the gate answers).
**Contract**: `docs/business/landing/form-api-contract.md` is binding. `app/features/forms/logic/submissionPayloads.ts`, `submissionFlows.ts`, `formsApiClient.ts`, `sendWithFreshToken.ts`, `useTurnstile.ts`, `useSpamGuard.ts`, `serverFieldErrors.ts`, `edgeCountry.ts`, `useDefaultCountry.ts` and their tests MUST NOT change.
**Branch**: `feat/v2-forms`. No commit unless Roberto asks.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no dependency on an unfinished task)
- **[Story]**: US1 diagnóstico desktop + home section · US2 two steps on mobile · US3 states · US4 application on Nosotros · US5 keyboard and assistive technology · US6 quarantine

F = `app/features/forms`, L = `app/features/landing`.

---

## Phase 1: Setup

- [x] T001 [P] Normalize `/private/tmp/claude-501/lucide45/check.svg` into `app/assets/icons/check.svg` (strip the license comment, `class`, `width`, `height`; keep viewBox, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, linecap/linejoin; add `<title>lucide · check</title>`) and add a "Feature 45" entry to `app/assets/icons/README.md` (source `lucide-static@0.469.0`, ISC, used by `ReceivesList.vue` at 14 px in `--compromiso-icono`). If the source file is gone, stop and ask the leader.
- [x] T002 [P] Add the tokens of data-model § 5 to `app/assets/css/global.css` under a "Feature 45 · forms" comment citing pen extract-45 sections (`:root` values + `@theme inline` utilities; clamps between the 390 and 1440 values); reuse the tokens data-model § 5 lists as reused; before adding any `--text-*`, `--spacing-*`, `--radius-*`, `--color-*` key grep for collisions with v1 keys and rename the v1 one to `legacy-*` with its consumers.
- [x] T003 Extend `tests/design-tokens.test.ts` to pin every token added in T002 at 390 and 1440 and that none is declared twice.

---

## Phase 2: Foundational (blocks every story)

**Quarantine first: the v2 files reuse the v1 names (research R1).**

- [x] T004 `git mv` from `F/ui/` to `F/ui/legacy/` the v1 components and their `.test.ts` / `.stories.ts`: `ContactForm`, `ApplicationForm`, `CvField`, `CvUploadError`, `DialCodeSelect`, `FileField`, `FormOutcome`, `RadioPillGroup`, `SelectField`, `TextareaField`, `TextField`, `WhatsappField`. `HoneypotField` stays in `F/ui/`. Story titles stay `Legacy v1/Forms/…`.
- [x] T005 Create `F/data/legacy/legacyFormContent.ts` holding today's `ContactFormContent`, `ContactFormFieldContent`, `ApplicationFormContent`, `ApplicationFormFieldContent` verbatim as `LegacyContactFormContent`, `LegacyContactFormFieldContent`, `LegacyApplicationFormContent`, `LegacyApplicationFormFieldContent`; point every file in `F/ui/legacy/` (components, stories, tests, fixtures) at them and fix their imports (`./HoneypotField.vue` → `@/features/forms/ui/HoneypotField.vue`). Temporarily point the `F/index.ts` exports of `ContactForm`/`ApplicationForm` at `./ui/legacy/…` (re-pointed in T026 and T041). Run `pnpm typecheck && pnpm test`: the site renders exactly as before.
- [x] T006 [P] Create `F/logic/cvFileCheck.ts` (`classifyCvFile(file): 'accepted' | 'format' | 'size'`, using `CV_ACCEPTED_TYPE` and `CV_MAX_BYTES`) and `cvFileCheck.test.ts` (non-PDF → format; PDF of 5 242 881 bytes → size; exactly 5 242 880 → accepted); make `F/ui/legacy/FileField.vue` call it instead of its inline check.
- [x] T007 [P] Create `F/data/formSteps.ts` per data-model § 1 and `formSteps.test.ts` (each form's two step lists partition its `*_FIELD_ORDER` exactly; no field in both).
- [x] T008 [P] Create `F/logic/formSteps.ts` (`stepOfField`, `firstErrorInStep`, `isErrorVisible`) and `formSteps.test.ts` covering: errors hidden at idle; all visible in `invalid`; only step-1 errors visible after a step-1 attempt.
- [x] T009 Add the optional `revealField?: (fieldId: F) => void` option to `F/logic/useFormSubmitState.ts`, called immediately before each `focusField` (client-invalid and server field-errors paths); add it to `UseContactFormOptions` / `UseApplicationFormOptions` and pass it through in `useContactForm.ts` / `useApplicationForm.ts`. Add tests in `useContactForm.test.ts` and `useApplicationForm.test.ts`: `should call revealField with the first invalid field before focusing when a submit is invalid` and the same for a `field-errors` outcome. All existing tests stay green unchanged.
- [x] T010 [P] Create `F/logic/useConsentGate.ts` (`accepted`, `guard(handler)`: when not accepted, return without calling the handler and focus `#privacy`) and `useConsentGate.test.ts` (handler not called and focus moved when unaccepted; called once when accepted).
- [x] T011 Create `F/logic/useFormSteps.ts` per data-model § 2 (`isStepped` false until mount, `matchMedia(FORM_STEPS_MEDIA_QUERY)` followed live and removed on unmount; `goNext` validates step 1 through `firstErrorInStep`, sets `attemptedStep`, focuses the first error or moves to step 2, focuses its first control with `preventScroll` and scrolls the panel into view with `behavior: 'auto'` under `useReducedMotion`; `goBack`; `revealField` switches step only while stepped) and `useFormSteps.test.ts` with a fake media query (`app/shared/logic/fakeMediaQuery.testing.ts`).
- [x] T012 Rework `F/data/contactFields.ts` and `F/data/applicationFields.ts` content interfaces to the v2 shapes of data-model § 3 (shared `FormChromeContent`; identity placeholder; application `uploading`, `cvUploadError: { message, submitWithoutCv }`; success `action` with `href` or `to`); remove `titleByChannel`, `error.title/fallback`, `cvUploadError.retry`.
- [x] T013 Rewrite the `forms.contact.*` and `forms.application.*` keys in `i18n/locales/es.json` and `i18n/locales/en.json` per data-model § 4 (remove `forms.contact.success.channel.*`, `error.title`, `error.fallback`, `cvUploadError.retry`; keep the identity options, areas, roles and WhatsApp keys; errors end in "."); keep `support{'@'}muush.dev` escaping.
- [x] T014 Update `F/logic/useContactFormContent.ts` and `F/logic/useApplicationFormContent.ts` to resolve the v2 shapes (`success.action.href = CALL_BOOKING_URL` from `@/shared/data/callBooking`; `success.action.to` from `useLocalePath()('/')`; the progress template interpolated per step).
- [x] T015 Add `unavailable?: boolean` and `describedBy?: string` to `app/shared/ui/PrimaryButton.vue` per contracts (`aria-disabled`, 70 % opacity, `cursor-not-allowed`, still focusable); add tests in `PrimaryButton.test.ts` and an "Unavailable" story in `PrimaryButton.stories.ts`.

**Checkpoint**: unit tests of T006–T011 and T015 green. From T012 the v1 consumers (`index.vue` with the legacy ContactSection, `about.vue`) no longer type-check against the v2 content shapes; that is expected until T030 and T042. `about.vue` type-checks again only after T041. Run the full `pnpm typecheck && pnpm test` after T042 (component and unit tests of each task run as they land).

---

## Phase 3: User Story 1 — Request a free assessment on desktop (P1) 🎯 MVP

**Goal**: the v2 diagnóstico form in one view inside the v2 home section at `#diagnostico`.
**Independent test**: `/es` and `/en` at 1440: send a valid form with privacy ticked against a stub; body equals today's payload; "Enviado" shows.

- [x] T016 [P] [US1] Create `F/ui/FormPanel.vue` (+ test, story): mobile anatomy below `md` (radius 22, padding 20, flat `--linea` edge, no shadow), `GlassSurface` `panel` preset from `md`; `bg-vidrio-fondo`, blur 30; `w-full` capped at 600.
- [x] T017 [P] [US1] Create `F/ui/FieldBlock.vue`, `F/ui/TextField.vue`, `F/ui/TextareaField.vue` (+ tests, stories) with the field anatomy of pen extract §§ 2 and 4 (heights 46 / 50, textarea 96; mobile no stroke, desktop 1 px Blanco 10 %; label 12 / 400 mobile, 12 / 600 tracking 0.3 desktop, Gris 400; value 14 / 15 Blanco; placeholder Blanco 40 % mobile, Gris 400 desktop; error stroke Red muush 500 and 13 / 400 help line with `id="<id>-error"`, `aria-invalid`, `aria-describedby`; focus ring `foco`).
- [x] T018 [P] [US1] Create `F/ui/SelectField.vue` (+ test, story): native select, `appearance-none`, `options` or `groups` (`<optgroup>`), hidden disabled placeholder option, lucide `chevron-down` 16 px Gris 400 `aria-hidden`.
- [x] T019 [P] [US1] Create `F/ui/SegmentedControl.vue` (+ test, story): `role="radiogroup"` labelled by its label, `sr-only` native radios inside labels; desktop container carbón 800 pill, Blanco 10 % stroke, padding 5, gap 6, options 9 / 20 radius pill 14 px, selected carbón 700 600 Blanco + 6 px red dot, unselected 500 Gris 400; mobile container radius 12, padding 4, gap 4, selected Blanco 10 % radius 9 padding 8 / 14, no dot.
- [x] T020 [P] [US1] Create v2 `F/ui/DialCodeSelect.vue` and `F/ui/WhatsappField.vue` (+ tests, stories) with today's mechanism (transparent native select over a `{flag} {dialCode}` face, number `type="tel"`, ids `whatsappCountry`/`whatsapp`, mount/unmount height+opacity transition dropped under reduced motion) in the v2 anatomy; dial control and number in one row, gap 8 desktop / 7 mobile (provisional, spec Assumptions).
- [x] T021 [US1] Create `F/ui/ContactChannelField.vue` (+ test): `SegmentedControl` for `contactPreference` + `WhatsappField` visible only while `whatsapp` is chosen.
- [x] T022 [P] [US1] Create `F/ui/ConsentCheckbox.vue` (+ test, story): native checkbox `id="privacy"` 18 × 18, radius 5, Blanco 25 % stroke, ticked state Red muush; label 13 / 1.45 Gris 400, gap 12; never named in any value object.
- [x] T023 [P] [US1] Create `F/ui/FormSuccess.vue` (+ test, story): `role="status"`, 64 × 64 tile (Blanco 8 %, radius 20, Blanco 20 % edge) with a 14 px Red muush dot carrying `pulso`, title `h3` Poppins 32 / 500 Blanco `tabindex="-1"` focused on mount, body 16 / 1.5 `texto-suave` max 420, `GlassButton` (`href` or `to`).
- [x] T024 [US1] Create `F/ui/SteppedForm.vue` (+ test) per contracts: `<form novalidate>` in `FormPanel`; single view order `details` · `profile` · `channel` · privacy · notice slot · centred `PrimaryButton` hero size (`unavailable` + `describedBy` → visually hidden `privacy.requiredHint` while unticked; `disabled` while busy); renders `FormSuccess` instead of the form on success; Turnstile host `<div>` and `HoneypotField` inside the panel; the stepped branch is completed in US2.
- [x] T025 [US1] Create v2 `F/ui/ContactForm.vue` (+ test) composing `useContactForm({ submitter, challengeHost, revealField })`, `useFormSteps`, `useConsentGate`, `SteppedForm`: Nombre | Correo row (`md:grid-cols-2`, gap 14), Empresa | ¿Cómo te identificas? row, ¿Qué necesitas?, `ContactChannelField`; **no website field**; `previewState`/`previewStep`/`initial` props per contracts. Tests: submit blocked and no submitter call while unticked (click, Enter in a field, `requestSubmit`); one submitter call with the exact values when ticked; no `privacy`/`website` key reaches the submitter.
- [x] T026 [US1] Point `F/index.ts` `ContactForm` at `./ui/ContactForm.vue`; update its comment.
- [x] T027 [P] [US1] Create `L/data/assessmentContent.ts` (`ASSESSMENT_KEYS`, `AssessmentContent`), `L/logic/useAssessmentContent.ts` (`callHref = CALL_BOOKING_URL`), and add `landing.assessment.*` to both locale files per data-model § 4; delete `landing.contact.*`.
- [x] T028 [P] [US1] Create `L/ui/ReceivesList.vue` (+ test, story): caption `text-rotulo` Gris 400 uppercase (`aria-labelledby` on the `<ul>`), gap 14, padding-top 8; rows gap 12, items centred, 24 × 24 `bg-rojo-15` round bubble (`aria-hidden`) with `check.svg` 14 px `text-compromiso-icono`, text 16 / 400 Blanco; rows fill the width and wrap on mobile.
- [x] T029 [US1] Create `L/ui/AssessmentSection.vue` (+ test, story `Landing/AssessmentSection`, 390/1440 × ES/EN) per research R10: `id` from `SECTION_ANCHORS.assessment`, `ShaderBackground preset="assessment"`, `Pill`, `Heading level 2 size="diagnostico"`, body, `ReceivesList`, `ContactForm`, call row ("¿Prefieres hablar?" 15 / 400 Gris 400 + link 15 / 600 Blanco with `arrow-right` 16 Red muush to `callHref`); desktop row gap 72, padding 120 / 80 / 140 / 80, left column gap 26; mobile column order pill → heading → body → receives → panel → call row, padding 72 / 24, gap 24.
- [x] T030 [US1] Export `AssessmentSection`, `useAssessmentContent`, `AssessmentContent` from `L/index.ts`; remove the `ContactSection`, `useContactContent`, `ContactContent` exports; rewrite `app/pages/index.vue` to render `AssessmentSection` with `useContactFormContent()` and `useContactSubmitter()`.
- [x] T031 [US1] Delete `L/ui/legacy/ContactSection.{vue,test.ts,stories.ts}`, `L/data/contactContent.ts`, `L/logic/useContactContent.ts`, and the `--contact-*` / `pt-contact-top` / contact-glow tokens that grep shows have no remaining reader in `app/assets/css/global.css`.

**Checkpoint**: the home is fully v2; the diagnóstico form sends at 1440.

---

## Phase 4: User Story 2 — Two steps on mobile (P1)

**Goal**: below 768 px the form is two steps with progress and kept values.
**Independent test**: at 390, Continuar / Atrás / send with values kept; server mark on `email` returns to step 1.

- [x] T032 [P] [US2] Create `F/ui/FormProgress.vue` (+ test, story): label 12 Blanco filling the row, gap 10, `aria-live="polite"`; `aria-hidden` bar of two 28 × 4 radius-2 segments, gap 4, current and previous Red muush, later Blanco 20 %.
- [x] T033 [US2] Complete the stepped branch of `F/ui/SteppedForm.vue`: progress row; group 1 (`details`, `channel`, full-width `PrimaryButton size="block"` "Continuar" `type="button"` → `continue`); group 2 (`profile`, privacy, notice, full-width submit, "← Atrás" 14 / 400 Gris 400 `type="button"` → `back`); groups `v-show` by `step`, `role="group"` + `aria-labelledby` the progress label only while stepped; `channel` rendered in group 1 when stepped and after `profile` otherwise.
- [x] T034 [US2] Wire `useFormSteps` in `F/ui/ContactForm.vue` (`CONTACT_STEP_FIELDS`, titles "Tus datos" / "Tu negocio"); tests with a fake media query: Continuar with empty Nombre stays on step 1, shows only step-1 errors, focuses `#name`; valid step 1 shows step 2 and focuses `#company`; Atrás keeps all values; a `field-errors` outcome on `email` while on step 2 returns to step 1 and focuses `#email`; at desktop width no progress, Continuar or Atrás is rendered.
- [x] T035 [US2] Add stories for the stepped view (step 1, step 2 via `previewStep`) at 390 in ES and EN to `F/ui/ContactForm.stories.ts`.

---

## Phase 5: User Story 3 — Faltan datos and Error al enviar (P1)

**Goal**: the designed states, values always kept.
**Independent test**: invalid submit; failing stub; retry.

- [x] T036 [P] [US3] Create `F/ui/FormNotice.vue` (+ test, story): `role="alert"`, full width, `bg-rojo-12`, flat `--rojo-40` edge, radius 10, padding 14 / 16, gap 12, 8 px red dot `aria-hidden`, text 14 / 1.45 Blanco; content by slot.
- [x] T037 [US3] In `F/ui/ContactForm.vue` render errors through `isErrorVisible`; in `server-error` render `FormNotice` above the submit with `error.before` + `<a href="mailto:support@muush.dev">` + `error.after`, submit label `retry`; in `sending` label `sending` with the arrow, button `disabled`, fields `readonly`. Tests: every value kept after a `failure` outcome; "Intentar de nuevo" makes a second submitter call; double activation while sending makes one call; spam-guard block shows the notice.
- [x] T038 [US3] Add `previewState` stories (Faltan datos with `initial` values, Enviando, Error al enviar, Enviado) at 390 and 1440, ES and EN, to `F/ui/ContactForm.stories.ts`.

---

## Phase 6: User Story 4 — Application on Nosotros (P1)

**Goal**: the v2 application form, with CV, inside the v1 section.
**Independent test**: `/es/nosotros`, `/en/about`, desktop and mobile, with and without CV; call order unchanged.

- [x] T039 [P] [US4] Create v2 `F/ui/CvField.vue` (+ test, story) per research R7: 96-tall box padding 14 / 16 in the field anatomy, visually hidden `<input type="file" accept="application/pdf" id="cv">`, placeholder 15 / 400 Gris 400 or the file name in Blanco, `classifyCvFile` on change emitting `reject` for format/size (field left empty, error shown at once, nothing sent), focus ring on the box.
- [x] T040 [US4] Create v2 `F/ui/ApplicationForm.vue` (+ test) composing `useApplicationForm({ …, revealField })`, `useFormSteps` (`APPLICATION_STEP_FIELDS`, titles "Tus datos" / "Tu perfil"), `useConsentGate`, `SteppedForm`: Nombre | Correo, Portafolio (`https://`) | Área y rol (grouped select), LinkedIn, CV, `ContactChannelField`; labels "Subiendo CV…" while `uploading`, "Enviando…" while `sending`; `cv-upload-error` → `FormNotice` with `cvUploadError.message` and an "Enviar sin CV" `type="button"` text action (`onSubmitWithoutCv`), submit label `retry` (retries via submit); `server-error` → notice with the application error text. Tests: no request while unticked; non-PDF and 5 242 881-byte PDF refused at once with no submitter call; a 5 242 880-byte PDF accepted; success shows "Volver al inicio" with the `to` from content; CV failure keeps the file and values; "Enviar sin CV" sends with `cv: null`.
- [x] T041 [US4] Point `F/index.ts` `ApplicationForm` at `./ui/ApplicationForm.vue`; nothing in `F/ui/legacy/` remains exported.
- [x] T042 [US4] Update `app/features/about/ui/WorkWithMuushSection.{test,stories}.ts` fixtures to the v2 `ApplicationFormContent` and the section comment in `WorkWithMuushSection.vue` (v2 panel inside the v1 section until feature 46); keep `Legacy v1/About/…` titles; verify at 1440 the panel sits in the form column (start-aligned, ≤ 600) with no overlap, and at 390 below the text.
- [x] T043 [US4] Add `F/ui/ApplicationForm.stories.ts` (title `Forms/ApplicationForm`): idle, step 2, Faltan datos, Subiendo CV, CV upload failed, Error al enviar, Enviado; 390/1440 × ES/EN.

---

## Phase 7: User Story 5 — Keyboard and assistive technology (P2)

- [x] T044 [US5] Add component tests in `F/ui/ContactForm.test.ts` and `F/ui/ApplicationForm.test.ts`: every control has a label pointing at it; each error is in the control's `aria-describedby`; the submit has `aria-disabled="true"` and `aria-describedby` the hint while unticked and neither once ticked; arrow keys change the segmented selection; the progress text changes when the step changes; `FormSuccess` and `FormNotice` carry `role="status"` / `role="alert"`.
- [x] T045 [US5] Add a reduced-motion test: with `prefers-reduced-motion: reduce` mocked, `goNext` scrolls with `behavior: 'auto'` and the WhatsApp transition classes have no duration (`F/logic/useFormSteps.test.ts`, `F/ui/WhatsappField.test.ts`); assert the success dot uses the `pulso` utility (whose reduced-motion rule is in `global.css`).

---

## Phase 8: User Story 6 — Quarantine and catalogue (P3)

- [x] T046 [US6] Add a test (`tests/forms-config.test.ts`) that no page, section or barrel imports from `F/ui/legacy/`, and that every story under `F/ui/legacy/` is titled `Legacy v1/…` while every story in `F/ui/*.stories.ts` and `L/ui/AssessmentSection.stories.ts` is not.

---

## Phase 9: Polish & cross-cutting

- [x] T047 [P] Rewrite `tests/forms-copy.test.ts` and `tests/forms-application-copy.test.ts` for the v2 copy (data-model § 4): approved lines verbatim per locale; shared wording keys equal across both forms; CV strings say 5 MB; identity options, areas, roles and WhatsApp-range copy unchanged; `@` escaped.
- [x] T048 [P] Update `tests/landing-copy.test.ts`: `landing.contact` → `landing.assessment`, approved copy verbatim, `receivesLabel` in sentence case.
- [x] T049 [P] Rewrite the "landing contact section" block of `tests/static-output.test.ts` for the v2 section: `#diagnostico` on `/es` and `/en`; the listón canvas present; no v1 glow; no website/social input; privacy checkbox unticked; submit `aria-disabled="true"`; no preview state; the `ContactForm|ApplicationForm` source scans include `F/ui/legacy/`.
- [x] T050 [P] Remove the Contacto case and `--contact-*` names from `tests/tablet-layout-tokens.test.ts` (Work case stays); add every new file of this feature to the scan list of `tests/token-literals.test.ts`.
- [x] T051 Run `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build`, then `./init.sh`; walk `specs/045-forms/quickstart.md` at 360, 390, 768, 1024, 1280, 1440, 1920 in ES and EN; write `docs/harness/progress/impl_forms.md` with results, any value asked of the leader, and confirmation that the payload/flow tests were not edited.

---

## Phase 10: Reopen 1 (Roberto 2026-11-02, FR-036…FR-040)

- [x] T052 Amend the spec (FR-036…FR-040) and add amendment notes to `specs/043-site-shell/spec.md` (header) and `specs/044-home-page/spec.md` (timeline).
- [x] T053 [FR-036, FR-037] `shell/logic/useHeaderIdleHide.ts` (`HEADER_IDLE_HIDE_MS` = 2500; desktop only; reveal zone; hold on pointer/focus; passive rAF scroll listener; clean-up) and `useHeaderIdleHide.test.ts` (fake timers); compose in `SiteHeader.vue` (transform-only slide on desktop); SiteHeader tests.
- [x] T054 [FR-038] `runSchedule` / `litAt` / `runPosition` (`RUN_DELAY_MS` 150, `RUN_MS_PER_LINE` 700) in `landing/logic/timelineProgress.ts`, `useTimelineRun.ts`, wired in `ProcessTimeline.vue` (fill delay/duration by CSS variables, linear; columns light on timers); unit, composable and component tests.
- [x] T055 [FR-039] Fix `useShaderCanvas` resize at the root (repaint in the same frame when the size changed; clock, program and context untouched); pinning test with a negative control.
- [x] T056 [FR-040] Call row: question `text-blanco`, link text underlined (`decoration-1 underline-offset-4`), arrow red; test and story note.
- [x] T058 [FR-036] Re-review 2 fix: after an idle hide only an upward scroll or the top zone reveals the header; a downward scroll keeps it hidden. Composable and SiteHeader tests for the slow downward start (negative control fails without the fix).
- [x] T057 `./init.sh` exit 0; visual check at 390 and 1440 (127.0.0.1 only); report "Reopen 1" in `impl_forms.md`.

## Phase 11: Reopen 2 (Roberto 2026-11-02, FR-041)

- [x] T059 [FR-041] Add `--pill-aire` (6 px, 8 px from `lg`) and the `pill-aire` utility to `global.css`; put it on the five v2 section pills (hero rotating pill, Qué es muush, Servicios, Cómo trabajamos, Diagnóstico); `tests/pill-air.test.ts`; amend the spec and add a note in `specs/044-home-page/spec.md`.
- [x] T060 `./init.sh` exit 0; measure the pill → heading gaps at 390 and 1440 (127.0.0.1 only); report "Reopen 2" in `impl_forms.md`.

## Implementation notes (implementer, 2026-11-02)

- T011: `goNext` takes the form's current errors as an argument instead of an
  `errors` option, so the form composable can receive `revealField` without a
  circular setup. Behaviour as specified.
- T024/T025/T040: the shared display rules (shown state/step/consent, busy,
  submit-label key, notice kind, visible errors) live in
  `forms/logic/useFormView.ts`; "Nombre | Correo" is the shared
  `ui/NameEmailRow.vue`; the notice text is the shared `ui/SendNotice.vue`.
  Keeps both forms under 200 lines (Article V) and the rules in one place.
- T044: arrow-key movement in the segmented control is the browser's native
  radio behaviour, which happy-dom does not implement; the tests assert the
  native radio group (one `name`, one checked, named `radiogroup`).
- T051: the 360–1920 sweep found the heading under the panel at 1024; fixed
  with a left-column minimum (`--diagnostico-izq-min`) and container-query
  rows (see spec Clarifications, implementation notes).

## Dependencies & execution order

- Phase 1 → Phase 2 → stories. T004–T005 before any v2 file in `F/ui/`; T012–T014 before T025/T040.
- US1 (T016–T031) first: it creates the shared parts. US2 and US3 extend `SteppedForm`/`ContactForm` (sequential on those files). US4 needs T016–T024 and T032–T036. US5/US6 after US1–US4. Polish last.

## Parallel examples

- Phase 2: T006, T007, T008, T010 together.
- US1: T016, T017, T018, T019, T020, T022, T023, T027, T028 together; then T021, T024, T025, T029.
- Polish: T047–T050 together.

## Implementation strategy

MVP = Phases 1–3 (home fully v2 with a working desktop diagnóstico form). Then US2 and US3 complete the diagnóstico form, US4 swaps Nosotros, US5–US6 lock accessibility and quarantine. The provisional copy items (⚠ in data-model § 4) and Clarifications Q1–Q3 are implemented as written unless Roberto changes them at the gate.
