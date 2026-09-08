---

description: "Task list for feature 016 — CTA final y formulario de contacto"
---

# Tasks: CTA final y formulario de contacto — the landing's closing section

**Input**: Design documents from `specs/016-contact-section/`
**Prerequisites**: `plan.md`, `spec.md`, `data-model.md`

**Tests**: included — `feature_list.json`'s acceptance array requires component
tests and Storybook coverage, and Constitution Article X makes both mandatory
for any `ui/` component.

**Organization**: grouped by the five user stories in `spec.md`. US1 and US2
are the section's structural core and ship first; US3 (WhatsApp toggle) and
US4 (viewport order) extend the same components; US5 (the three unreachable
states) is additive to `ContactForm.vue` and can ship any time after it exists.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable — different file, no dependency on an incomplete task
- **[Story]**: `[US1]`…`[US5]`, matching `spec.md`
- Every task names its exact file path

## Path Conventions

Nuxt 4 with `srcDir: app/`. Two feature modules touched: the **new**
`app/features/forms/` and the existing `app/features/landing/`, each with
`ui/`, `logic/`, `data/` and a barrel. Locale files at `i18n/locales/`.
Cross-cutting tests at `tests/`; component tests sit beside their SFC.

---

## Phase 1: Setup

**Purpose**: confirm the ground before changing anything. Every task is a read or a run.

- [x] T001 Read `app/shared/ui/SectionBackdrop.vue`'s doc comment in full (paint-order contract) and `app/shared/ui/GlassPanel.vue`, `BotonPrimario.vue` in full — this feature reuses both unmodified.
- [x] T002 Read `app/features/landing/data/heroContent.ts`, `app/features/landing/logic/useHeroContent.ts`, `app/features/shell/data/navigation.ts` and `app/features/shell/logic/useShellNavigation.ts` in full — `spec.md` § *Notes on the two dangling CTAs* depends on all four.
- [x] T003 Run `./init.sh` and confirm it exits 0, so any red later belongs to this feature.
- [x] T004 [P] Confirm `vitest.config.ts`'s `include` already covers `app/features/**/*.test.ts` (it does — a **new** module under `app/features/` needs no config change) and that `.storybook/main.ts`'s stories glob already covers `app/features/forms/ui/*.stories.ts` and `app/features/landing/ui/*.stories.ts`.
- [x] T005 [P] Grep `app/assets/css/global.css` for `--text-form-label`, `--text-input-value`, `--spacing-form-gap`, `--spacing-glass-dark`, `--spacing-btn-submit-x`, `--radius-control` and confirm all six already exist (primitives era) — record their exact values from `data-model.md` § 5.1 for reuse.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: the new `forms` module's data/logic layer, tokens, and copy. Everything in Phase 3+ depends on these.

**⚠️ Blocks every user story.**

- [x] T006 Create `app/features/forms/data/contactFields.ts` with `ContactFieldId`, `IdentityOption`, `ContactPreference`, `ContactFormValues`, `ContactFormErrors` per `data-model.md` § 1. Imports nothing. Comment that `IdentityOption` deliberately excludes the `.pen`'s undocumented sixth option (`spec.md` A-02).
- [x] T007 Create `app/features/forms/logic/useContactForm.ts` exporting `useContactForm(initial?: Partial<ContactFormValues>): UseContactFormReturn` per `data-model.md` § 2–3. Plain Vue, no Nuxt call. `validate()` is synchronous, no `await`, no `fetch` (FR-008, FR-014). `state` is a `Ref<'idle' | 'invalid'>` only — no internal variable for `sending`/`success`/`server-error` exists anywhere in this file (plan.md D-2). `onContactPreferenceChange` resets `values.whatsapp` to `''` when leaving `'whatsapp'` (FR-011).
- [x] T008 **Guard (`rules.md` § R36)** — before adding any token, grep `app/assets/css/global.css` for `--spacing-glow-` and `--color-glow-` and confirm the list of matches is unchanged from before this feature; run `pnpm vitest run app/shared/ui/SectionGlow.test.ts` and confirm it passes with **zero modifications to that file**. Re-run this exact check after T014 (the new tokens) as a second guard.
- [x] T009 Add the reused-verbatim tokens' consumption points as comments only (no new declarations) referencing `data-model.md` § 5.1 — confirms the mapping before any component uses them.
- [x] T010 Add `--spacing-contact-form-w` and `--spacing-contact-left-w` to `@theme inline` in `app/assets/css/global.css`. If the desktop left-block width is still unconfirmed (`data-model.md` § 5.2 flags it `UNVERIFIED`), **ask the leader for the missing frame value before writing the token** (`rules.md` § R32 point 4) — do not derive it from the mobile frame.
- [x] T011 Add the six `--spacing-contact-glow-{foco,wine,cierre}-{x,y}` tokens to `@theme inline`, converting the leader's page-absolute centres per `rules.md` §§ R29/R48, each commented with its two measured endpoints.
- [x] T012 Add `--duration-contact-whatsapp-toggle` to `:root` (owner Clau, seeded near `--duration-purpose-reveal`'s precedent) and `--color-glass-dark-contact` to `@theme inline`'s glass block, with the exact contrast ratio computed and written in the token's comment (plan.md D-3) — compute this by rendering `--text-input-value`'s color over `--dark-glass` at increasing opacity steps until the ratio clears 4.5:1 against the worst-case (palest) point of the section's own glow overlap, and record the winning opacity and the ratio achieved.
- [x] T013 [P] Add `app/assets/icons/chevron-down.svg` (lucide, normalized per the existing contract in `app/assets/icons/README.md`: square viewBox, `currentColor`, no `<style>`/`<defs>`/metadata, one `<title>`) and extend the README with its entry.
- [x] T014 [P] Add all `forms.contact.*` keys from `data-model.md` § 6 to `i18n/locales/es.json`, Spanish values from `ui-map.md` § 7 and `content.md` (the five identity options), success/error copy verbatim from `ui-map.md` § 7.
- [x] T015 [P] Add the same `forms.contact.*` keys to `i18n/locales/en.json`, English values from the same sources.
- [x] T016 [P] Add `landing.contact.*` keys (`eyebrow`, `heading`, `body`, `ctaSecondary`) to both locale files. `heading` and `body` are placeholders pending Roberto/Clau (`spec.md` A-01) — mark this in a comment in `contactContent.ts` (T024), not in the JSON itself. `ctaSecondary` reuses the Hero's approved string value.
- [x] T017 Run `pnpm vitest run tests/i18n-parity.test.ts` and confirm both key sets match and no value is empty.

**Checkpoint**: the `forms` module's data/logic exist; tokens and copy exist; nothing renders yet.

---

## Phase 3: US1 — the section exists, and the two dangling CTAs land on it (Priority: P1)

**Goal**: `#contacto` exists in the DOM in both locales, and both the Hero's and the nav's CTAs navigate to it.

**Independent test**: load `/es` and `/en`, click the Hero's primary CTA and the nav's CTA; both land on a visible section.

- [x] T018 [US1] In `app/features/landing/data/heroContent.ts`, set `HERO_DESTINATIONS.contactHash = '#contacto'` (FR-002). This is the only edit to this file — no markup changes anywhere else in the Hero.
- [x] T019 [US1] Re-read `app/features/shell/data/navigation.ts`'s `NAV_CTA` and confirm (no edit expected) it already resolves to `/es/#contacto` / `/en/#contacto` once the section exists — record this confirmation, per FR-003, as the "no shell-side change" evidence for the task report.
- [x] T020 [US1] Create `app/features/landing/data/contactContent.ts` with `CONTACT_KEYS` (four `landing.contact.*` keys) and the `ContactContent` interface (`eyebrow`, `heading`, `body`, `ctaSecondary`, `callHref`). Comment that `heading`/`body` are placeholders pending Roberto/Clau (spec A-01).
- [x] T021 [US1] Create `app/features/landing/logic/useContactContent.ts` exporting `useContactContent(): ComputedRef<ContactContent>`, calling `useI18n` only, resolving `callHref` from `CALL_BOOKING_URL` (`app/shared/data/callBooking.ts`) exactly as `useHeroContent.ts` does. Imports nothing from `app/features/shell/` or `app/features/forms/`.
- [x] T022 [US1] Create `app/features/landing/ui/ContactSection.vue`: `<section id="contacto" class="relative pt-contact-top">` holding one `<SectionBackdrop>` with the three glows (`red-400` 60% `1500-760`, `wine-300` 37% `1000-560`, `wine-400` 28% `900-520`, anchors from T011, each centred with `-translate-x-1/2 -translate-y-1/2`), the left block (`Pill`, `h2`, body `<p>`, `LinkArrow` for the alt route using `callHref`), and a `<ContactForm>` imported from `@/features/forms`. No bottom padding (`rules.md` § R49); no horizontal padding (`<main>` already applies `px-page`).
- [x] T023 [US1] In the same file, implement the two-column desktop layout (`lg:flex-row`) and the mobile stacked order via DOM order + `lg:` utilities only — no JS reordering (this satisfies US1's structural half; the exact order is verified in US4).
- [x] T024 [US1] Write `ContactSection.vue`'s doc comment stating the paint-order constraints (no stacking context on the section or above it, no opaque background — `rules.md` §§ R28, R37), matching the convention `HeroSection.vue` and `PurposeSection.vue` already use.
- [x] T025 [US1] Extend `app/features/landing/index.ts` to export `ContactSection`, `useContactContent` and the `ContactContent` type.
- [x] T026 [US1] Add the section to `app/pages/index.vue`: one `useContactContent()` call and `<ContactSection v-bind="contact" />` after `<ServicesSection>` (and after Proyectos, once feature 15 lands — if it has not yet landed, this task still adds the section immediately after Servicios and notes the ordering gap for the leader).
- [x] T027 [US1] Create `app/features/landing/ui/ContactSection.test.ts` — red first (`findings.md` § R39). Assert: the section root carries `id="contacto"`; it renders `Pill`, the heading, the body, `LinkArrow` with `callHref` and no fragment-only anchor; it imports and renders one `ContactForm`; no `href` without a destination anywhere in the tree.
- [x] T028 [P] [US1] Create `app/features/landing/ui/ContactSection.stories.ts` covering both locales at 1440 and 390.

**Checkpoint**: `#contacto` exists; both CTAs work; the section renders its own chrome. (The form inside it is built next, in US2.)

---

## Phase 4: US2 — seven fields, validated on the client, nothing sent (Priority: P1)

**Goal**: `ContactForm.vue` renders the seven fields, validates them for real on submit, and does nothing further on success.

**Independent test**: submit empty → every required field errors, focus on Nombre. Fill correctly, submit → no error, no network call, no state change beyond `idle`.

### The `forms` module's field primitives, bottom-up

- [x] T029 [US2] Create `app/features/forms/ui/TextField.vue` — props `{ id, label, modelValue, type?: 'text' | 'email' | 'tel', placeholder?, error?, readonly? }`. Renders a `<label>` (`text-form-label`) + `<input>` (`text-input-value`, `--radius-control`, error state = red border + `aria-invalid` + a short message). Emits `update:modelValue`.
- [x] T030 [P] [US2] Create `app/features/forms/ui/SelectField.vue` — props `{ id, label, modelValue, options: { value, label }[], error?, readonly? }`. Renders the `chevron-down` icon (T013) via `?raw` + `v-html` inside an `aria-hidden` wrapper with a `:deep(svg)` sizing rule (`rules.md` § R14).
- [x] T031 [P] [US2] Create `app/features/forms/ui/TextareaField.vue` — props `{ id, label, modelValue, error?, readonly? }`, fixed height per `design-extract.md` § 10's `FormField` textarea variant (92px equivalent token — reuse or add `--spacing-contact-textarea-h` if no existing token covers it).
- [x] T032 [P] [US2] Create `app/features/forms/ui/RadioPillGroup.vue` — props `{ id, label, modelValue, options: { value, label }[], readonly? }`, per `component-contracts.md` § *RadioPill* (active/inactive fill+stroke+dot, already-contracted values). Emits `update:modelValue`.
- [x] T033 [US2] Create `app/features/forms/ui/ContactForm.vue` composing all seven fields via `useContactForm()`, wired to a `<form novalidate @submit="onSubmit">`. `novalidate` is deliberate: it hands constraint validation to the composable so the error UI is consistent, while native constraint validation still remains the no-JS fallback per the browser's own behaviour on `required`/`type="email"` inputs when scripting is unavailable (`spec.md` Edge Cases). Submit button is `<BotonPrimario variant="submit" type="submit">{{ content.submit }}</BotonPrimario>` — a real native submit, so `isClickable` in `BotonPrimario.vue` already gives it a pointer cursor with no edit to that file.
- [x] T034 [US2] In the same file, wire per-field errors from `useContactForm().errors` to each field's `error` prop, and focus the field named by `firstInvalidFieldId` on an unsuccessful submit (`ui-map.md` § 7: "foco al primer error; no se limpia nada" — confirm no `v-model` is reset anywhere in the failure path).
- [x] T035 [US2] Extend `app/features/forms/index.ts` (new barrel) to export `ContactForm`, `useContactForm`, and the `ContactFormValues`/`ContactFormContent` types. Field components (`TextField`, `SelectField`, `TextareaField`, `RadioPillGroup`) stay internal — composition detail of `ContactForm`, matching how the shell keeps `MobileMenu` unexported.
- [x] T036 [US2] Create `app/features/forms/logic/useContactForm.test.ts` — red first. Assert: empty submit produces all four always-required errors (`name`, `email`, `identity`, `need`) and none for `company`; `state` becomes `'invalid'`; `firstInvalidFieldId` is `'name'`; a valid submit leaves `state` at `'idle'` (**not** any other value) and calls no injected network function (there is none to call — assert the composable's return has no `fetch`-shaped dependency).
- [x] T037 [P] [US2] Create `app/features/forms/ui/ContactForm.test.ts` — red first. Assert: seven fields render in `ui-map.md` § 7's order; the submit control is a native `<button type="submit">` inside a `<form>`; on empty submit, error messages appear and focus moves to Nombre's input; on a valid fill, no error renders and no `sending`/`success`/`server-error` markup appears (`previewState` is not set by this component's own default render).
- [x] T038 [P] [US2] Extend `tests/landing-copy.test.ts` (or add `tests/forms-copy.test.ts`) — read both locale files **from disk** (`rules.md` § R27), assert all `forms.contact.*` keys exist in both locales and the five identity options match `content.md` verbatim per locale.

**Checkpoint**: the form renders, validates for real, and does nothing on a valid submit.

---

## Phase 5: US3 — the WhatsApp field appears, and forgets itself when hidden (Priority: P1)

**Goal**: the WhatsApp field mounts only when selected, transitions in/out, and its value never survives a round trip back to Correo.

**Independent test**: select WhatsApp, type a number, switch to Correo, switch back — field is present and empty.

- [x] T039 [US3] In `ContactForm.vue`, render the WhatsApp `TextField` with `v-if="values.contactPreference === 'whatsapp'"` (not `v-show` — FR-010 requires it absent from the DOM, not merely hidden) wrapped in a `<Transition>` whose enter/leave classes animate `max-height` (using `--spacing-contact-whatsapp-h` from T012 as the mounted height target) and `opacity`, duration `--duration-contact-whatsapp-toggle`.
- [x] T040 [US3] Confirm (via T007's `onContactPreferenceChange`) that switching away from `'whatsapp'` sets `values.whatsapp = ''` **before** the field unmounts, so a re-mount always starts empty — no separate "reset on unmount" hook is needed because the value was never retained.
- [x] T041 [US3] Add the `@media (prefers-reduced-motion: reduce)` rule to `ContactForm.vue`'s `<style scoped>`: the `<Transition>`'s CSS transition duration drops to `0s` (mount/unmount still happens, only the animated step is removed) — same discipline as every other reveal in the site (`findings.md` § R53: declare the property, its duration and its reduced-motion override in exactly one place).
- [x] T042 [US3] Extend `app/features/forms/ui/ContactForm.test.ts`: select WhatsApp → the phone field appears; type a value; switch to Correo → the field is removed from the DOM (not just hidden — assert `find(...).exists() === false`); switch back to WhatsApp → the field exists and its value is empty.
- [x] T043 [P] [US3] Extend `app/features/forms/logic/useContactForm.test.ts`: calling `onContactPreferenceChange('email')` after setting `values.whatsapp` to a non-empty string resets it to `''` synchronously, before any re-render.

**Checkpoint**: the WhatsApp field's full show/hide/discard contract is real and tested.

---

## Phase 6: US4 — the section reads correctly on both viewports, in the design's own order (Priority: P2)

**Goal**: desktop shows left block beside the form; mobile shows left block, then form, then the alternate route — not a straight rescale.

**Independent test**: load at 1440px and 390px; confirm the visual order matches exactly.

- [x] T044 [US4] In `ContactSection.vue`, structure the template so the alt-route `LinkArrow` is a **sibling** of the form (not nested inside the left block on mobile): desktop places it inside the left block via `lg:` layout (a flex column that is only "the left block" above `lg`), mobile places it as a separate element after `<ContactForm>` in DOM order. Comment this explicitly as the one place this section's mobile order is not a rescale of desktop (`spec.md` US4).
- [x] T045 [US4] Extend `ContactSection.test.ts`: at a mocked mobile breakpoint (or by asserting the DOM order + the `lg:` classes present), confirm the alt route's element comes **after** `ContactForm`'s element in document order, with `lg:` classes moving it visually beside the left block at desktop width.
- [x] T046 [P] [US4] Extend `ContactSection.stories.ts` with an explicit 390px story showing the stacked order, and a 1440px story showing the two-column order, both already partially covered by T028 — confirm both are present rather than adding a third redundant story.

**Checkpoint**: both viewports read correctly.

---

## Phase 7: US5 — the three unreachable states exist, reviewable, in Storybook (Priority: P3)

**Goal**: `sending`, `success`, `server-error` render correctly and match `ui-map.md` § 7's copy in both locales — reachable only from a story arg, never from the shipped page.

**Independent test**: open Storybook, load each of the three stories; confirm no interaction in the real page can reach them.

- [x] T047 [US5] In `ContactForm.vue`, add the `previewState?: 'sending' | 'success' | 'server-error'` prop (`data-model.md` § 4) and three template branches: `sending` disables the submit control, sets its label to `content.sending`, stops the LED ring (reuse `BotonPrimario`'s existing `prefers-reduced-motion` treatment — a static ring — by forcing the same visual state, without editing `BotonPrimario.vue`) and marks every field `readonly`; `success` replaces the whole form markup with the confirmation copy inside the same `GlassPanel`; `server-error` keeps every field's captured value, renders the error copy, and adds a `mailto:support@muush.dev` fallback link.
- [x] T048 [US5] Confirm, by reading the file once more, that `previewState` is never referenced by `ContactSection.vue`, `useContactContent.ts`, or `app/pages/index.vue` — the shipped tree has no code path that sets it (plan.md D-2). Record this confirmation for the task report; this is the assertion T052 makes mechanically on the built artefact.
- [x] T049 [US5] Create `app/features/forms/ui/ContactForm.stories.ts` with five stories — `Idle`, `ValidationFailed` (pre-seeded `errors`), `Sending`, `Success`, `ServerError` — each in both locales (or parameterised by locale per the existing Storybook convention in `HeroSection.stories.ts`), copy read from `data-model.md` § 6 / `ui-map.md` § 7 verbatim.
- [x] T050 [P] [US5] Extend `tests/forms-copy.test.ts` (or wherever T038 landed): assert `forms.contact.success.title` and `forms.contact.error.title`/`.fallback` exist in both locales and match `ui-map.md` § 7's copy verbatim per locale, even though unreachable from the shipped page today.

**Checkpoint**: all five states are visible somewhere, and only two are reachable from the built site.

---

## Phase 8: Verification on the built artefact

**Method for every task here**: fix the viewport with the DevTools protocol's `Emulation.setDeviceMetricsOverride` against the artefact from `pnpm generate` (`findings.md` § R44). **Never** a headless `--window-size` or `--screenshot` (§§ R34, R60).

- [x] T051 Run `pnpm generate`, serve `.output/public`, and at 1440×900 and 390×1260 read the computed `z-index` of this section's `SectionBackdrop` (`-3`), the dot sheet (`-2`) and the section's content (`auto`); confirm the section declares no stacking-context property and no background colour.
- [x] T052 Measure each glow's rendered centre in page coordinates at both widths against `data-model.md` § 5.2's converted anchors.
- [x] T053 On `/es` and `/en`, click the Hero's primary CTA and the nav's CTA from both the landing and `/nosotros`; confirm each lands on the visible `#contacto` section (SC-001).
- [x] T054 On the built page, submit the empty form; confirm all required fields show errors and focus lands on Nombre; fill it correctly and submit again; confirm **no network request fires** — inspect the page's request log (or, absent a live network monitor, grep `.output/public/_nuxt/*.js` for `fetch(` / `XMLHttpRequest` inside the chunk containing `ContactForm`'s compiled code and confirm none references an external URL) (SC-002, SC-004).
- [x] T055 Toggle the contact-preference radio to WhatsApp, type a value, switch back to Correo, switch to WhatsApp again; confirm the field is present and empty (SC-003).
- [x] T056 Read the computed color of `--text-input-value` over `--color-glass-dark-contact` at the section's glow-lit background and compute the contrast ratio; confirm it is ≥4.5:1 (SC-007).
- [x] T057 At 390px confirm the alt route renders after the form in the accessibility tree / DOM order, and at 1440px confirm it renders inside the left block (SC-006).
- [x] T058 Sweep the viewport from 320px to 2560px and confirm `documentElement.scrollWidth` never exceeds `clientWidth`.

**Checkpoint**: every claim this feature makes about paint order, destinations, validation and non-submission is a measurement.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [x] T059 Run `git diff --stat` (read-only) and confirm **zero changed lines** in `app/shared/ui/*`, `app/features/shell/**` and `app/layouts/**` — the only files outside `app/features/forms/` and `app/features/landing/` this feature may touch are `app/pages/index.vue`, `app/assets/css/global.css`, `app/assets/icons/`, the two locale files and test files.
- [x] T060 Grep every added/changed file for a hex literal, a `px` literal and an arbitrary Tailwind value (`[...]`) outside `app/assets/css/global.css`; grep the same set for a hardcoded user-facing string outside i18n calls.
- [x] T061 Grep the compiled `ContactForm` chunk one more time for `fetch(`, `XMLHttpRequest`, `axios`, `setTimeout` used to fake a delayed state change, or any literal endpoint URL — confirm zero (FR-014, this feature's central guarantee).
- [x] T062 Run the five gates — `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build` — and confirm all five pass with no pre-existing test modified.
- [x] T063 Write the implementation report to `docs/harness/progress/impl_contact_section.md`: the measured contrast ratio and its winning opacity, the six measured glow centres, the confirmation that both CTAs work, and the module-boundary decision (D-1) as built.
- [x] T064 Report, without writing to `docs/business/`: the unresolved `--spacing-contact-left-w` value if T010 had to ask the leader; the placeholder heading/body copy (A-01) with its owner; the sixth identity option gap (A-02); the honeypot/timestamp deferral (A-04, FR-017); and any implementation finding worth `docs/harness/findings.md`. `docs/business/` stays read-only (AGENTS.md § 3).

---

## Dependencies

```
Phase 1 (T001–T005)     setup, read-only
   ↓
Phase 2 (T006–T017)     forms/ data+logic, tokens, copy — blocks everything
   ↓
Phase 3 (T018–T028)     US1 — section exists, both CTAs wired
   ↓
Phase 4 (T029–T038)     US2 — the seven fields, real validation, no submit
   ↓
Phase 5 (T039–T043)     US3 — WhatsApp toggle + discard
   ↓
Phase 6 (T044–T046)     US4 — viewport order
   ↓
Phase 7 (T047–T050)     US5 — the three unreachable states as stories
   ↓
Phase 8 (T051–T058)     browser-measured verification
   ↓
Phase 9 (T059–T064)     diff guard, grep guards, gates, reports
```

Phase 4 depends on Phase 3 only for `ContactSection.vue` to have somewhere to
mount `ContactForm` — the field primitives (T029–T032) and the composable
(already built in Phase 2) have no dependency on Phase 3 and could be built in
parallel with it if two people were doing this. Phase 5 depends only on
`ContactForm.vue` existing (T033), not on US1/US4. Phase 7 depends only on
`ContactForm.vue` existing and is otherwise independent of US3/US4.

**Nothing in Phase 8 is parallel**: every task reads the same generated
artefact through one browser session.

## Parallel Execution Examples

**Phase 2 — tokens, icon and the two locale files**

```
T013  app/assets/icons/chevron-down.svg
T014  i18n/locales/es.json
T015  i18n/locales/en.json
T016  both locale files (landing.contact.*)
```

**Phase 4 — the three simple field components, once `contactFields.ts` and `useContactForm.ts` exist**

```
T030  app/features/forms/ui/SelectField.vue
T031  app/features/forms/ui/TextareaField.vue
T032  app/features/forms/ui/RadioPillGroup.vue
```

## Implementation Strategy

**MVP is Phase 2 + Phase 3 + Phase 4.** At that point `#contacto` exists, both
CTAs work, and the form validates for real with no submission — the feature's
whole point, per Roberto's 2026-09-08 descope.

**Phase 5 (WhatsApp) and Phase 7 (unreachable states) are both named,
non-optional acceptance criteria**, not enhancements — skipping either leaves
an acceptance line unmet, not merely a nice-to-have undone.

**Do not defer T064 to the end of the session.** A gap noticed while building
and reported after the report is filed does not get reported — same
discipline `specs/013-purpose-section/tasks.md` T057 already established.
