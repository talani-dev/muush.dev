---

description: "Task list for feature 020 — Work with muush application form section"
---

# Tasks: Work with muush — the About page's application form

**Input**: Design documents from `specs/020-work-with-muush-section/`
**Prerequisites**: `plan.md`, `spec.md`, `data-model.md`

**Tests**: included — `feature_list.json`'s acceptance array requires component
tests and Storybook coverage, and Constitution Article X makes both mandatory
for any `ui/` component.

**Organization**: grouped by the three user stories in `spec.md`. US1 (desktop
apply) is the section's structural core and ships first; US2 (mobile +
WhatsApp) extends the same components for the other viewport and the one
stateful toggle; US3 (CV upload) is the one field Contacto never needed and
can ship any time after `ApplicationForm.vue` exists. The three unreachable
submit states are folded into US1 (same mechanism feature 16 built, reused
rather than re-decided).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable — different file, no dependency on an incomplete task
- **[Story]**: `[US1]`…`[US3]`, matching `spec.md`
- Every task names its exact file path

## Path Conventions

Nuxt 4 with `srcDir: app/`. Two feature modules touched: the **existing**
`app/features/forms/` (feature 16) and the **existing** `app/features/about/`
(feature 17), each with `ui/`, `logic/`, `data/` and a barrel. Locale files at
`i18n/locales/`. Cross-cutting tests at `tests/`; component tests sit beside
their SFC.

---

## Phase 1: Setup

**Purpose**: confirm the ground before changing anything. Every task is a read or a run.

- [x] T001 Read `app/features/forms/data/contactFields.ts`, `app/features/forms/logic/useContactForm.ts`, `app/features/forms/ui/ContactForm.vue`, `TextField.vue`, `SelectField.vue`, `RadioPillGroup.vue` and `app/features/forms/index.ts` in full — this feature's `applicationFields.ts`/`useApplicationForm.ts`/`ApplicationForm.vue` mirror their shape exactly.
- [x] T002 Read `app/features/about/ui/AboutHeroSection.vue`, `app/features/about/logic/useAboutHeroContent.ts`, `app/features/about/data/aboutHeroContent.ts` and `app/features/about/index.ts` in full — `WorkWithMuushSection.vue` follows the same shape as the module's second section.
- [x] T003 Read `app/pages/nosotros.vue` in full and confirm the exact text of its `#work` placeholder `<section>` and the `pages.about.work` i18n key it reads, so both are removed cleanly in Phase 5.
- [x] T004 Run `./init.sh` and confirm it exits 0, so any red later belongs to this feature.
- [x] T005 [P] Confirm `vitest.config.ts`'s `include` already covers `app/features/**/*.test.ts` (it does — no config change needed) and that `.storybook/main.ts`'s stories glob already covers `app/features/forms/ui/*.stories.ts` and `app/features/about/ui/*.stories.ts`.
- [x] T006 [P] Grep `app/assets/css/global.css` for `--color-glow-red-400-60`, `--spacing-glow-1500-760`, `--color-glow-wine-300-37`, `--spacing-glow-1000-560`, `--color-glow-wine-400-28`, `--spacing-glow-900-520` and confirm all six already exist (feature 16) — record their exact values for verbatim reuse (zero new color/size glow tokens, `rules.md` § R36).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: the `forms` module's new data/logic layer (application-specific), the `SelectField` extension, tokens, and copy. Everything in Phase 3+ depends on these.

**⚠️ Blocks every user story.**

- [x] T007 Create `app/features/forms/data/applicationFields.ts` with `ApplicationFieldId`, `AreaId`, `RoleCatalogEntry`, `ROLE_CATALOG`, `ApplicationFormValues`, `ApplicationFormErrors`, `CV_REQUIRED`, `CV_MAX_BYTES`, `CV_ACCEPTED_TYPE` per `data-model.md` §§ 1–3. Imports nothing. Comment `ROLE_CATALOG` with the exact UNVERIFIED gap and owner (Clau) per `data-model.md` § 2 — do not invent role titles.
- [x] T008 Create `app/features/forms/logic/useApplicationForm.ts` exporting `useApplicationForm(initial?): UseApplicationFormReturn` per `data-model.md` §§ 4–5, mirroring `useContactForm.ts`'s structure. `state` is a `Ref<'idle' | 'invalid'>` only — no internal variable for `sending`/`success`/`server-error` exists anywhere in this file (plan.md D-1). `onCvChange` stores the raw `File | null` with no serialization. `onContactPreferenceChange` resets `values.whatsapp` to `''` when leaving `'whatsapp'`, identical to `useContactForm.ts`.
- [x] T009 **Guard (`rules.md` § R36)** — before adding any token, grep `app/assets/css/global.css` for `--spacing-glow-` and `--color-glow-` and confirm the list of matches is unchanged from before this feature; run `pnpm vitest run app/shared/ui/SectionGlow.test.ts` and confirm it passes with **zero modifications to that file**. Re-run this exact check after T014 (the new tokens) as a second guard.
- [x] T010 Extend `app/features/forms/ui/SelectField.vue` with the additive `groups?: OptionGroup[]` prop per `data-model.md` § 7 and plan.md D-4, rendering `<optgroup :label>` per group when `groups` is supplied and falling back to the existing flat `options` rendering otherwise. Confirm `ContactForm.vue`'s existing "¿cómo te identificas?" call site needs zero changes (it keeps passing `options`).
- [x] T011 [P] Extend `app/features/forms/ui/SelectField.test.ts`: a new test asserts that, given `groups`, the rendered `<select>` contains one `<optgroup>` per group with the correct `label` and the correct nested `<option>`s, and that the existing flat-`options` test still passes unmodified.
- [x] T012 Add `--spacing-work-left-w` and `--spacing-work-form-w` to `@theme inline` in `app/assets/css/global.css`, `clamp()` between 342px (mobile) and 520px/660px (desktop) respectively, per `data-model.md` § 9.2.
- [x] T013 Add `--spacing-work-col-gap` (6.25rem, desktop-only) and `--spacing-work-stack-gap` (2rem, mobile-only) to `@theme inline`, each commented with its derivation (`data-model.md` § 9.2) — do not substitute the generic `--spacing-form-gap` for the mobile value, it is measurably different (32px vs. 14–16px).
- [x] T014 Add `--spacing-work-top` to `@theme inline` (clamp between 130px desktop and 0px mobile) and the six `--spacing-work-glow-{foco,wine,cierre}-{x,y}` tokens, converting the leader-supplied page-absolute centres (`red-400`: 1170,3030 desktop · 410,3130 mobile; `wine-300`: 1580,3240 · 480,3430; `wine-400`: 190,3350 · 80,3610) to section-relative offsets per `rules.md` §§ R29/R48 and plan.md D-2/D-3 — each token commented with its two measured endpoints.
- [x] T015 Add `FileField.vue`'s own recipe tokens — `--color-glass-upload`, `--color-glass-upload-line`, `--spacing-upload-y`, `--spacing-upload-x`, `--spacing-upload-gap` — per `data-model.md` § 9.3, sourced from `design-extract.md` § FormField's "upload" variant.
- [x] T016 [P] Add `app/assets/icons/paperclip.svg` (lucide, normalized per the existing contract in `app/assets/icons/README.md`: square viewBox, `currentColor`, no `<style>`/`<defs>`/metadata, one `<title>`) and extend the README with its entry.
- [x] T017 [P] Add all `forms.application.*` keys from `data-model.md` § 10 to `i18n/locales/es.json` — field labels/placeholders from this feature's approved copy, the six area labels from `ui-map.md` § 9, the placeholder role string per area (commented as UNVERIFIED, owner Clau — do not invent real role names), and the approved success copy verbatim from `ui-map.md` § 9.
- [x] T018 [P] Add the same `forms.application.*` keys to `i18n/locales/en.json`, English values from the same sources.
- [x] T019 [P] Add `about.work.*` keys (`eyebrow`, `headline`, `body`) to both locale files, using this session's approved copy (spec.md, both languages) — and **remove** the now-dead `pages.about.work` key from both locale files in the same change (its only consumer is the placeholder this feature retires in Phase 5).
- [x] T020 Run `pnpm vitest run tests/i18n-parity.test.ts` and confirm both key sets match, no value is empty, and the removed `pages.about.work` key does not leave an orphaned reference anywhere (grep `app/` for it — expect zero hits after Phase 5).

**Checkpoint**: the `forms` module's application data/logic exist; `SelectField` supports grouping; tokens and copy exist; nothing new renders yet.

---

## Phase 3: US1 — apply from desktop, real validation, nothing sent (Priority: P1)

**Goal**: `WorkWithMuushSection.vue` renders on `/es/nosotros` and `/en/about` with the left block and the eight-field form in two columns at desktop width; the form validates for real on submit and never fakes a result.

**Independent test**: load the About page at desktop width, submit empty → every required field errors, focus on Nombre. Fill Nombre/Correo/Área y rol correctly, leave the rest empty, submit → no error, no network call, no state change beyond `idle`.

### The `forms` module's one new field primitive

- [x] T021 [US1] Create `app/features/forms/ui/FileField.vue` per `data-model.md` § 8 — a native `<input type="file" accept="application/pdf">`, presentational only. On change: validates `file.type === CV_ACCEPTED_TYPE` and `file.size <= CV_MAX_BYTES`, shows the filename + human-readable size when valid, shows a format or size error message otherwise. **No** `FormData`, **no** `fetch`/`XMLHttpRequest`, **no** object URL kept past the component's own lifetime (plan.md D-1). Emits `update:modelValue` with the raw `File | null`.
- [x] T022 [P] [US1] Create `app/features/forms/ui/FileField.test.ts` — red first (`findings.md` § R39). Assert: selecting a `.pdf` File fixture under the size limit shows the filename and no error; selecting a non-PDF File fixture shows a format error and does not update `modelValue` to a value the parent would treat as valid; selecting an oversized PDF fixture shows a size error; grepping this file's own source and `FileField.vue`'s source for `FormData`, `fetch`, `XMLHttpRequest` finds nothing.
- [x] T023 [P] [US1] Create `app/features/forms/ui/FileField.stories.ts` covering: empty, valid-PDF-attached, wrong-format error, oversized error, and a disabled/read-only state (previewing the `sending` state's field treatment).

### `ApplicationForm.vue`

- [x] T024 [US1] Create `app/features/forms/ui/ApplicationForm.vue` composing all eight fields via `useApplicationForm()`, wired to a `<form novalidate @submit="onSubmit">` — same `novalidate`-with-composable-validation rationale as `ContactForm.vue`. "Área y rol" uses `SelectField` with `groups` (T010) built from `ROLE_CATALOG` (T007). Submit button is `<BotonPrimario variant="submit" type="submit">{{ content.submit }}</BotonPrimario>`.
- [x] T025 [US1] In the same file, wire per-field errors from `useApplicationForm().errors` to each field's `error` prop, and focus the field named by `firstInvalidFieldId` on an unsuccessful submit — no `v-model` is reset anywhere in the failure path (mirrors `ContactForm.vue`'s T034 precedent).
- [x] T026 [US1] Add the `previewState?: 'sending' | 'success' | 'server-error'` prop and its three template branches (mirroring `ContactForm.vue`'s own mechanism exactly): `sending` disables the submit control, sets its label to `content.sending`, marks every field `readonly`; `success` replaces the form markup with the confirmation copy inside the same glass panel; `server-error` keeps every captured value, renders the error copy with the `support@muush.dev` fallback link. Confirm, by reading the file once more, that no other file in this feature's tree ever sets `previewState` (plan.md D-1's grep-provable guarantee).
- [x] T027 [US1] Extend `app/features/forms/index.ts` to export `ApplicationForm`, `useApplicationForm`, and the `ApplicationFormValues`/`ApplicationFormContent` types. `FileField` stays internal — composition detail of `ApplicationForm`, same precedent as the other four field primitives.
- [x] T028 [US1] Create `app/features/forms/logic/useApplicationForm.test.ts` — red first. Assert: empty submit produces errors for `name`, `email`, `areaRole`, `contactPreference`'s dependents as applicable, and — given `CV_REQUIRED === false` — **no** error for `cv`; a valid submit (with Portfolio/LinkedIn/CV all empty) leaves `state` at `'idle'` and calls no injected network function; `firstInvalidFieldId` is `'name'` on a fully-empty submit.
- [x] T029 [P] [US1] Create `app/features/forms/ui/ApplicationForm.test.ts` — red first. Assert: eight fields render in `ui-map.md` § 9's order; the submit control is a native `<button type="submit">` inside a `<form>`; on empty submit, error messages appear and focus moves to Nombre's input; on a valid minimal fill, no error renders and no `sending`/`success`/`server-error` markup appears by default.
- [x] T030 [P] [US1] Create `tests/forms-application-copy.test.ts` (sibling to feature 16's copy test) — read both locale files **from disk** (`rules.md` § R27), assert all `forms.application.*` keys exist in both locales, the six area labels match `ui-map.md` § 9 verbatim, and the success copy matches `ui-map.md` § 9 verbatim per locale.

### `WorkWithMuushSection.vue` and mounting it

- [x] T031 [US1] Create `app/features/about/data/workContent.ts` with `WORK_KEYS` (three `about.work.*` keys) and the `WorkContent` interface (`eyebrow`, `headline`, `body`).
- [x] T032 [US1] Create `app/features/about/logic/useWorkContent.ts` exporting `useWorkContent(): ComputedRef<WorkContent>`, calling `useI18n` only — no Nuxt composable beyond that, matching `useAboutHeroContent.ts`'s discipline.
- [x] T033 [US1] Create `app/features/about/ui/WorkWithMuushSection.vue`: `<section id="work" class="relative pt-work-top">` holding one `<SectionBackdrop>` with the three reused glows (`red-400` 60% `1500-760`, `wine-300` 37% `1000-560`, `wine-400` 28% `900-520`, anchors from T014, each centred with `-translate-x-1/2 -translate-y-1/2`), the left block (`Pill`, heading, body `<p>`), and an `<ApplicationForm>` imported from `@/features/forms`. No bottom padding; no horizontal padding (`<main>` already applies `px-page`).
- [x] T034 [US1] In the same file, implement the two-column desktop layout (CSS grid with `grid-template-areas`, `lg:` breakpoint) and the mobile stacked flow, the same mechanism `ContactSection.vue` uses (hand-written `<style scoped>` reading `:root`-consumed `@theme inline` tokens, since `grid-template-areas` has no Tailwind utility, `rules.md` § R18).
- [x] T035 [US1] Write `WorkWithMuushSection.vue`'s doc comment stating the paint-order constraints (no stacking context on the section or above it, no opaque background — `rules.md` §§ R28, R37) and D-3's section-top-spacing reasoning, matching the convention `AboutHeroSection.vue` and `ContactSection.vue` already use.
- [x] T036 [US1] Extend `app/features/about/index.ts` to export `WorkWithMuushSection`, `useWorkContent` and the `WorkContent` type.
- [x] T037 [US1] In `app/pages/nosotros.vue`, remove the `#work` placeholder `<section>` and its `t('pages.about.work')` call; add one `useWorkContent()` call and `<WorkWithMuushSection v-bind="work" />` after `<AboutHeroSection>`.
- [x] T038 [US1] Create `app/features/about/ui/WorkWithMuushSection.test.ts` — red first. Assert: the section root carries `id="work"`; it renders `Pill`, the headline, the body, and imports/renders one `ApplicationForm`; no `href` without a destination anywhere in the tree.
- [x] T039 [P] [US1] Create `app/features/about/ui/WorkWithMuushSection.stories.ts` covering both locales at 1440 and 390.

**Checkpoint**: `#work` renders the real section in both locales; the eight-field form validates for real and never fakes a result at desktop width.

---

## Phase 4: US2 — apply from mobile, with the WhatsApp toggle (Priority: P2)

**Goal**: below `lg` the left block stacks above the form at full mobile width; selecting WhatsApp reveals the phone field with a transition and discards its value on switching back.

**Independent test**: load at mobile width, confirm the stacked order; select WhatsApp, type a number, switch to Correo, switch back — field is present and empty.

- [x] T040 [US2] Confirm (via the same `<style scoped>` block from T034) that below `lg` the layout is plain document flow — left block, then form — with `--spacing-work-stack-gap` (T013) as the gap between them, not `--spacing-work-col-gap`.
- [x] T041 [US2] In `ApplicationForm.vue`, render the WhatsApp `TextField` with `v-if="values.contactPreference === 'whatsapp'"` (not `v-show` — same reasoning as `ContactForm.vue`) wrapped in a `<Transition>` reusing `--duration-contact-whatsapp-toggle` (no new duration token — identical mechanism, T012 of feature 16 already exists).
- [x] T042 [US2] Confirm (via T008's `onContactPreferenceChange`) that switching away from `'whatsapp'` sets `values.whatsapp = ''` **before** the field unmounts, so a re-mount always starts empty — no separate "reset on unmount" hook needed, mirroring `useContactForm.ts`.
- [x] T043 [US2] Add the `@media (prefers-reduced-motion: reduce)` rule to `ApplicationForm.vue`'s `<style scoped>`: the `<Transition>`'s CSS transition duration drops to `0s` (mount/unmount still happens, only the animated step is removed) — same discipline as `ContactForm.vue` (`findings.md` § R53: declare the property, duration and reduced-motion override in exactly one place).
- [x] T044 [US2] Extend `app/features/forms/ui/ApplicationForm.test.ts`: select WhatsApp → the phone field appears; type a value; switch to Correo → the field is removed from the DOM (`find(...).exists() === false`); switch back to WhatsApp → the field exists and its value is empty.
- [x] T045 [P] [US2] Extend `app/features/forms/logic/useApplicationForm.test.ts`: calling `onContactPreferenceChange('email')` after setting `values.whatsapp` to a non-empty string resets it to `''` synchronously, before any re-render.
- [x] T046 [P] [US2] Extend `app/features/about/ui/WorkWithMuushSection.stories.ts` (or confirm T039 already covers it) with an explicit 390px story showing the stacked order and a 1440px story showing the two-column order.

**Checkpoint**: both viewports read correctly; the WhatsApp toggle's full show/hide/discard contract is real and tested.

---

## Phase 5: US3 — attach a CV, validated and rejected client-side, never transmitted (Priority: P3)

**Goal**: the CV field accepts only PDFs under the proposed size limit, shows the file locally, and never constructs a request of any kind — with or without `CV_REQUIRED` ever flipping.

**Independent test**: attach a `.docx` → rejected with a message; attach a valid PDF under the limit → filename shown, zero network activity; submit with a CV attached → the file is never transmitted.

- [x] T047 [US3] Confirm (already built in T021/T024) that `FileField` is wired into `ApplicationForm.vue` with `error` bound to `errors.cv` and, if `CV_REQUIRED` is ever flipped to `true`, that `required` reaches the field the same way every other required field does — verify by temporarily flipping the constant in a throwaway local test run, not by shipping the flip.
- [x] T048 [US3] Extend `app/features/forms/logic/useApplicationForm.test.ts`: with a `File` fixture whose `type` is not `application/pdf`, `errors.cv` is the format-error key; with a PDF fixture whose `size` exceeds `CV_MAX_BYTES`, `errors.cv` is the size-error key; with `CV_REQUIRED` at its shipped value (`false`) and `cv: null`, `errors.cv` is `undefined`.
- [x] T049 [P] [US3] Extend `app/features/forms/ui/ApplicationForm.test.ts`: attaching a CV and submitting a fully-valid form does not add any assertion-visible network call, matches T029's existing "no `sending`/`success`/`server-error` markup by default" assertion, extended to confirm the same holds with a CV attached.
- [x] T050 [P] [US3] Extend `app/features/forms/ui/ApplicationForm.stories.ts` (create alongside T024 if not already covered) — a `CvAttached` story variant showing the filled state with a PDF fixture, in both locales.

**Checkpoint**: the CV field's real validation, local-only state, and the CV-mandatory open value (isolated to one flag) are all demonstrated and tested.

---

## Phase 6: Verification on the built artefact

**Method for every task here**: fix the viewport with the DevTools protocol's `Emulation.setDeviceMetricsOverride` against the artefact from `pnpm generate` (`findings.md` § R44). **Never** a headless `--window-size` or `--screenshot` (§§ R34, R60).

- [x] T051 Run `pnpm generate`, serve `.output/public`, and at 1440×900 and 390×1000 read the computed `z-index` of this section's `SectionBackdrop` (`-3`), the dot sheet (`-2`) and the section's content (`auto`); confirm the section declares no stacking-context property and no background colour. Completed by the reviewer over live CDP (`docs/harness/progress/review_work_with_muush_section.md`): `#work` is `position:relative; z-index:auto; transform:none; isolation:auto; background:transparent`, `SectionBackdrop` child `z-index:-3`.
- [x] T052 Measure each glow's rendered centre in page coordinates at both widths against `data-model.md` § 9.2's converted anchors (red-400, wine-300, wine-400). Completed by the reviewer over live CDP: all six x/y pairs match at both 1440×900 and 390×1000.
- [x] T053 On `/es/nosotros` and `/en/about`, confirm `#work` resolves to the visible section (footer's "Work with muush" item and any other existing link to it still land correctly).
- [x] T054 On the built page, submit the empty form; confirm all required fields show errors and focus lands on Nombre; fill Nombre/Correo/Área y rol correctly and submit again; confirm **no network request fires** — inspect the page's request log (or, absent a live network monitor, grep `.output/public/_nuxt/*.js` for `fetch(` / `XMLHttpRequest` / `FormData` inside the chunk containing `ApplicationForm`'s compiled code and confirm none references an external URL).
- [x] T055 Attach a valid PDF fixture to the CV field on the built page and confirm — by the same request-log/grep method as T054 — that selecting the file fires no network request of any kind.
- [x] T056 Toggle the contact-preference radio to WhatsApp, type a value, switch back to Correo, switch to WhatsApp again; confirm the field is present and empty. Completed by the reviewer over live CDP: mounts, holds a typed value, unmounts on reverting, remounts empty on reselecting WhatsApp — real DOM events on the built page, both review rounds.
- [x] T057 At 390px confirm the left block renders above the form in DOM order, and at 1440px confirm the two-column grid places them side by side per D-2's converted anchors. Round 2: measured via CDP against a fresh `pnpm generate` — desktop 1440×900: text column top 818.73px, form column top 788.73px, delta -30px (form starts 30px above text, matching Left@y130/form@y100); mobile 390×1000: stacked flow, form 377px below text, unaffected.
- [x] T058 Sweep the viewport from 320px to 2560px and confirm `documentElement.scrollWidth` never exceeds `clientWidth`. Completed by the reviewer over live CDP: `scrollWidth === clientWidth` throughout, including at 1440/1920 for the round-2 negative-margin regression check.

**Checkpoint**: every claim this feature makes about paint order, validation, non-submission and the file field's dead end is a measurement.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T059 Run `git diff --stat` (read-only) and confirm **zero changed lines** in `app/shared/ui/*`, `app/features/shell/**` and `app/features/landing/**` — the only files this feature may touch are `app/features/forms/**`, `app/features/about/**`, `app/pages/nosotros.vue`, `app/assets/css/global.css`, `app/assets/icons/`, the two locale files and test files.
- [x] T060 Grep every added/changed file for a hex literal, a `px` literal and an arbitrary Tailwind value (`[...]`) outside `app/assets/css/global.css`; grep the same set for a hardcoded user-facing string outside i18n calls.
- [x] T061 Grep the compiled `ApplicationForm` and `FileField` chunks one more time for `fetch(`, `XMLHttpRequest`, `FormData`, `axios`, `setTimeout` used to fake a delayed state change, or any literal endpoint/upload URL — confirm zero (this feature's central guarantee, extended from feature 16's FR-014 to file input).
- [x] T062 Confirm `ContactForm.vue`/`useContactForm.ts`/`contactFields.ts` and `ContactSection.vue` (feature 16) are byte-unchanged — `git diff` on those four files is empty.
- [x] T063 Run the five gates — `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build` — and confirm all five pass with no pre-existing test modified.
- [x] T064 Write the implementation report to `docs/harness/progress/impl_work_with_muush_section.md`: the measured glow centres, the confirmation that `#work` resolves and the form never sends anything, and the two seeded-open-value decisions (`CV_REQUIRED`, `ROLE_CATALOG`) as built, each restating its owner.
- [x] T065 Report, without writing to `docs/business/`: the CV-mandatory open value (decisions-open.md #7) still unresolved; the placeholder role catalog gap with its owner (Clau); the proposed (not confirmed) 5MB CV size limit; the WhatsApp digit-validation rule reused by symmetry rather than restated in `ui-map.md` § 9; and any implementation finding worth `docs/harness/findings.md`. `docs/business/` stays read-only (AGENTS.md § 3).

---

## Dependencies

```
Phase 1 (T001–T006)     setup, read-only
   ↓
Phase 2 (T007–T020)     forms/ application data+logic, SelectField extension, tokens, copy — blocks everything
   ↓
Phase 3 (T021–T039)     US1 — FileField, ApplicationForm, WorkWithMuushSection, mounted at #work
   ↓
Phase 4 (T040–T046)     US2 — mobile stack + WhatsApp toggle
   ↓
Phase 5 (T047–T050)     US3 — CV validation edge cases, never transmitted
   ↓
Phase 6 (T051–T058)     browser-measured verification
   ↓
Phase 7 (T059–T065)     diff guard, grep guards, gates, reports
```

Phase 4 depends on Phase 3 only for `ApplicationForm.vue` to exist — the
WhatsApp mechanism itself (T041–T043) is close to a copy of feature 16's own
Phase 5 and has no dependency beyond `useApplicationForm.ts` (already built in
Phase 2/3). Phase 5 depends only on `FileField.vue`/`ApplicationForm.vue`
existing (T021, T024), not on US2. Both US2 and US3 could be built in
parallel with each other once US1's checkpoint is reached.

**Nothing in Phase 6 is parallel**: every task reads the same generated
artefact through one browser session.

## Parallel Execution Examples

**Phase 2 — tokens, icon and the two locale files**

```
T016  app/assets/icons/paperclip.svg
T017  i18n/locales/es.json
T018  i18n/locales/en.json
T019  both locale files (about.work.*, retiring pages.about.work)
```

**Phase 3 — the new field primitive's tests and stories, once `FileField.vue` exists**

```
T022  app/features/forms/ui/FileField.test.ts
T023  app/features/forms/ui/FileField.stories.ts
```

## Implementation Strategy

**MVP is Phase 2 + Phase 3.** At that point `#work` renders the real section,
the eight-field form validates for real with no submission, and the CV field
already has its baseline real/reject/no-transmit behaviour built in — the
feature's whole point, per Roberto's 2026-09-08 descope (identical scope line
to feature 16).

**Phase 4 (WhatsApp toggle) and Phase 5 (CV edge cases) are both named,
non-optional acceptance criteria**, not enhancements — skipping either leaves
an acceptance line unmet, not merely a nice-to-have undone.

**Do not defer T065 to the end of the session.** A gap noticed while building
and reported after the report is filed does not get reported — same
discipline feature 16's tasks.md T064 already established.
