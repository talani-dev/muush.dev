# Research: Muush 1.0 forms (feature 45)

Every decision cites its source. "Extract" = `docs/harness/progress/pen-extract-45.md`.
The spec author did not open the `.pen`. No new dependency is added.

## R1 · Quarantine of the v1 form UI

- **Decision**: Move every v1 visual form component of `app/features/forms/ui/`
  (`ContactForm`, `ApplicationForm`, `CvField`, `CvUploadError`,
  `DialCodeSelect`, `FileField`, `FormOutcome`, `RadioPillGroup`,
  `SelectField`, `TextareaField`, `TextField`, `WhatsappField`) with their
  stories and tests to `app/features/forms/ui/legacy/`. Stories keep their
  `Legacy v1/Forms/…` titles. The v1 content shapes move to
  `forms/data/legacy/legacyFormContent.ts` as `LegacyContactFormContent` and
  `LegacyApplicationFormContent` (today's interfaces, verbatim), so the
  quarantined components keep compiling and their tests keep passing while the
  final names (`ContactFormContent`, `ApplicationFormContent`) describe v2.
  `HoneypotField.vue` is not v1 design (it is invisible); it stays in `ui/` and
  both generations use it.
- **Barrel**: `forms/index.ts` exports the v2 `ContactForm` and
  `ApplicationForm` under the same names; nothing from `ui/legacy/` is
  exported.
- **v1 contact section**: `landing/ui/legacy/ContactSection.vue` (+ story,
  test), `landing/data/contactContent.ts`, `landing/logic/useContactContent.ts`
  and the `landing.contact.*` keys are **deleted**. Keeping the section in
  quarantine would need the forms barrel to export a v1 form to another
  feature (Article III) for a section nothing renders. This differs from the
  feature-44 precedent (Propósito kept in quarantine) only because that
  section imported nothing from another feature.
- **Alternatives**: delete the v1 forms outright (rejected: the leader's task
  asks for quarantine; feature 47 deletes); keep v1 type names and give v2 new
  names (rejected: v2 names are final, Article VII).

## R2 · One shared form shell, two views

- **Decision**: A shared `SteppedForm.vue` owns the panel, the progress row,
  the two step groups, the position of the contact block, the privacy
  checkbox, the notice, the actions and the success swap. Each form passes its
  fields through two slots: `details` (Nombre, Correo) and `profile` (its own
  fields), plus the contact block in a `channel` slot. Order:
  - stepped view: step 1 = `details` + `channel`; step 2 = `profile` + privacy
    + submit + "← Atrás";
  - single view: `details` (one row), `profile`, `channel`, privacy, submit.
  The shell renders the `channel` slot in exactly one of the two places, so DOM
  order = visual order = focus order in both views (spec FR-003). Pen extract
  §§ 2, 4, 5 show the same pattern for both forms, which is why one shell
  fits.
- **Breakpoint**: stepped below 768 px (handoff `(max-width: 767px)`), as
  `FORM_STEPS_MEDIA_QUERY = '(max-width: 47.9375rem)'` in
  `forms/data/formSteps.ts` (forms-only, so not in `shared/data/layout.ts`).
- **SSR**: `useFormSteps` reads the query in `onMounted` (pattern of
  `useDesktopLayout`): `isStepped` is `false` on the server and until mount,
  so the prerendered page is the single view (also the no-JS state) and
  hydration agrees. On a phone the stepped view engages after mount; the form
  is far below the fold, so the swap is not seen.
- **Anatomy**: the field and panel anatomy switch with Tailwind `md:`
  utilities (mobile anatomy below `md`, desktop from `md`), so it is correct in
  the static HTML and never waits for script. Step groups use `v-show`, so
  hidden steps keep their DOM (native select state, file input).
- **Alternatives**: CSS `order`/grid areas with a fixed DOM (rejected: desktop
  tab order would jump from Correo to the contact control below ¿Qué
  necesitas?, WCAG 2.4.3); rendering the contact block twice (rejected:
  duplicate ids and radio names).

## R3 · Step navigation and error visibility

- **Decision**: pure functions in `forms/logic/formSteps.ts`:
  `stepOfField(form, fieldId)`, `stepHasErrors(errors, stepFields)` and
  `visibleError(fieldId, { state, attemptedStep, stepFields })`. Errors show
  when the submit state is `invalid` (today's rule) **or** after "Continuar"
  was pressed with errors — then only for step-1 fields. `useFormSteps`
  holds `step`, `attemptedStep`, `isStepped`, `goNext`, `goBack`, `revealField`.
- **Continuar** (`type="button"`): if step-1 fields have errors, set
  `attemptedStep = 1` and focus the first; else show step 2, focus its first
  control with `preventScroll`, and `scrollIntoView({ block: 'start' })` the
  panel, `behavior: 'auto'` under reduced motion (handoff).
- **Reveal before focus**: `useFormSubmitState` gains one optional option,
  `revealField?: (fieldId) => void`, called just before `focusField` in both
  invalid paths (client and server marks). `useContactForm` /
  `useApplicationForm` pass it through. With the stepped view it switches to
  the field's step; the v1 forms pass nothing, so their behaviour is
  unchanged.
- **Announcement**: the progress label is an `aria-live="polite"` region, and
  each step group is `role="group"` labelled by it while stepped (the handoff
  uses a `fieldset`; a `group` avoids the default fieldset border reset and the
  legend-position rules). In the single view the groups carry no role.

## R4 · Consent gate

- **Decision**: `useConsentGate()` (`forms/logic/`) holds `accepted` and
  `guard(handler)`: when not accepted it returns without calling the handler
  and focuses the checkbox (id `privacy`). Both forms wrap `onSubmit` with it,
  so click, Enter in a field and `requestSubmit()` are all stopped before
  `useFormSubmitState` runs. The value lives only here, never in the form
  values, so the payload builders cannot see it (FR-010) — nothing in
  `submissionPayloads.ts` changes.
- **Button**: `PrimaryButton` gains two additive props, `unavailable` (renders
  `aria-disabled="true"`, 70 % opacity, `cursor: not-allowed`, keeps the button
  focusable and type submit) and `describedBy` (`aria-describedby`). The
  explanation is a visually hidden line (new copy, spec Assumptions). Native
  `disabled` stays for "Enviando".
- **Alternatives**: native `disabled` (rejected: removes the button from the
  tab order, so its explanation can never be reached).

## R5 · States mapped onto the existing state machine

| Spec state | `SubmitState` | UI |
|---|---|---|
| idle | `idle` | form |
| Faltan datos | `invalid` (+ Continuar attempt) | strokes + help lines, focus first |
| Enviando | `uploading` / `sending` | button `disabled`, label "Subiendo CV…" / "Enviando…", fields readonly |
| Error al enviar | `server-error` | `FormNotice` with error text + support link; button "Intentar de nuevo" |
| CV upload failed | `cv-upload-error` | `FormNotice` with the CV message + "Enviar sin CV"; button "Intentar de nuevo" (Clarifications Q2) |
| Enviado | `success` | `FormSuccess` replaces the panel content |

"Intentar de nuevo" is the submit itself: `attemptSubmit` already allows a new
attempt from `server-error` and `cv-upload-error` (fresh token per request in
the flows; same file for the CV retry). No change to `useFormSubmitState`
beyond R3's hook.

## R6 · Success stack

- Tile 64 × 64, Blanco 8 % fill, radius 20, Blanco 20 % edge; dot 14 px Red
  muush with the `pulso` utility (same recipe as `Pill`; the utility already
  stops under reduced motion, feature 44). Title Poppins 32 / 500 Blanco
  (`h3`), body 16 / 1.5 `texto-suave` max 420, `GlassButton`.
- Focus moves to the title (`tabindex="-1"`) on mount inside a
  `role="status"` container (feature 029 FR-023 pattern of `FormOutcome`).
- Destinations come from content, never from a Nuxt composable inside `ui/`
  (`rules.md` § R23): `ContactFormContent.success.action.href =
  CALL_BOOKING_URL`; `ApplicationFormContent.success.action.to =
  localePath('/')`, resolved in `useApplicationFormContent`.

## R7 · CV field

- One v2 `CvField.vue`: a 96-tall box (padding 14 / 16, the field anatomy
  fill) wrapping a visually hidden `<input type="file" accept="application/pdf">`;
  shows the placeholder in Gris 400 or the file name in Blanco; keyboard focus
  ring on the box; Enter/Space open the picker natively through the label.
- The type/size check moves into a pure `classifyCvFile(file)` →
  `'accepted' | 'format' | 'size'` in `forms/logic/cvFileCheck.ts`, used by the
  v2 field and by the quarantined `FileField` (DRY, Article VIII). Limit stays
  `CV_MAX_BYTES` (Clarifications Q1).
- No icon (extract § 5).

## R8 · Selects, segmented control, WhatsApp

- Native `<select>` with `appearance: none`, the 16 px lucide `chevron-down`
  in Gris 400 (desktop, extract § 2); Esc, arrows and type-ahead are the
  browser's (spec FR-021, features 16/20/32 decision).
- `SegmentedControl.vue`: a `role="radiogroup"` labelled by its label, native
  radios `sr-only` inside `<label>`s (one tab stop, arrows move and select);
  selected option desktop carbón 700 + 600 Blanco + 6 px red dot, unselected
  transparent 500 Gris 400 (extract § 2); mobile Blanco 10 % fill, radius 9,
  padding 8 / 14, container radius 12, padding 4, gap 4 (extract § 4). The
  mobile drawing shows no dot; the dot is desktop-only (`md:`), an inference
  from the extract listing it only in § 2.
- `WhatsappField.vue` + `DialCodeSelect.vue` (v2): same mechanism as today
  (transparent native select over a face) with the v2 control anatomy; the
  height/opacity transition is kept and dropped under reduced motion.

## R9 · The check icon

`/private/tmp/claude-501/lucide45/check.svg` (leader-checked, ISC) normalized
to `app/assets/icons/check.svg` per the folder README: strip the license
comment, `class`, `width`, `height`; keep `viewBox`, `fill="none"`,
`stroke="currentColor"`, `stroke-width="2"`, linecap/linejoin; add
`<title>lucide · check</title>`. README gets a "Feature 45" row. Rendered 14 px
in `--compromiso-icono` (`#E98A77`, already a token since feature 44) inside a
24 × 24 `bg-rojo-15` bubble.

## R10 · Home section

`AssessmentSection.vue` (landing) at `SECTION_ANCHORS.assessment`, `relative
isolate`, `ShaderBackground preset="assessment"` first child, content `relative
z-10`. From `lg`: row, gap 72, padding 120 / 80 / 140 / 80, items centred;
left column fills (gap 26), panel 600. Below `lg`: column, padding 72 / 24, gap
24, order pill → heading → body → receives → panel → call row (the call row is
a DOM sibling after the panel, placed into the left column from `lg` with a
two-column grid whose left column holds two rows — the v1 ContactSection
mechanism, now with stock grid utilities where they exist). Heading:
`Heading level 2 size="diagnostico"`. Body 18 / 1.55 desktop, 16 mobile,
`texto-suave`, max 500.

## R11 · Nosotros

`WorkWithMuushSection.vue` keeps its markup; the barrel's `ApplicationForm` is
now v2, so only the comment and its story/test fixtures change (they pass the
v2 `ApplicationFormContent`). In the v1 grid the panel takes the form column
up to its 600 cap, start-aligned; the v1 `--work-form-y-offset` stays.
`about.vue` unchanged except comments.

## R12 · Tokens

New tokens are added only where no feature 42–44 token matches exactly
(data-model § 5). All colours resolve through the palette with `color-mix`.

## R13 · Tests changed on purpose

- `tests/forms-copy.test.ts`, `tests/forms-application-copy.test.ts`: rewritten
  for the v2 copy (and Clarifications Q1–Q3); the identity/role catalogue and
  WhatsApp-range assertions stay.
- `tests/landing-copy.test.ts`: `landing.contact` → `landing.assessment`.
- `tests/static-output.test.ts`: "landing contact section" block rewritten for
  the v2 section (anchor, listón canvas, no v1 glow, panel present, no website
  field, privacy checkbox unticked, submit `aria-disabled`); the
  `ContactForm|ApplicationForm` source scan includes `ui/legacy/`.
- `tests/tablet-layout-tokens.test.ts`: the Contacto case is removed with
  `--contact-cols`/`--contact-col-gap`/`--contact-left-w`/`--contact-form-w`;
  the Work case stays.
- `tests/token-literals.test.ts`: the new files are added to its scan list.
- `tests/forms-config.test.ts`: unchanged rules; `previewState` stays
  Storybook-only.
