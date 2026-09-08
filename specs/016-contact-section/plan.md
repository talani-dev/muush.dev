# Implementation Plan: CTA final y formulario de contacto — the landing's closing section

**Branch**: `feat/contact-section` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/016-contact-section/spec.md`

## Summary

A new `app/features/forms/` module (Constitution Article I names it explicitly:
"the contact and application forms, which appear on both pages") holds the
field primitives and the validation/state composable that this feature and
feature 20 (`work_with_muush_section`) will both consume through its barrel.
`app/features/landing/` gets one new section — chrome only: `Pill`, heading,
copy, the alternate route, three glows, the two-column/stacked layout, and
`id="contacto"` — which imports `ContactForm` from `forms`'s barrel and
nothing from its internals (Article III).

The form does not submit. `useContactForm` runs real client-side validation
(hand-rolled, no new dependency — this repo has never added a validation
library and Article VIII prefers duplication of a small utility over a new
dependency for one form) and exposes exactly two reachable states, `idle` and
`invalid`. The other three states (`sending`, `success`, `server-error`) are
static presentational variants of `ContactForm.vue`, selected by a
Storybook-only `previewState` prop that the real page never sets — so the
component that can *render* all five states cannot *reach* three of them from
a real click, which is the literal shape of the acceptance criteria
("existen como stories revisables, no como código cableado").

Two data fixes complete the section: `HERO_DESTINATIONS.contactHash` gets a
value (closing the Hero's half of the CTA gap), and `NAV_CTA` needs nothing —
its destination was already unconditional.

## Technical Context

**Language/Version**: TypeScript 5 strict, Vue 3.5 SFCs (`<script setup lang="ts">`), Nuxt 4 (`srcDir: app/`)
**Primary Dependencies**: `@nuxtjs/i18n` 10, Tailwind CSS 4.3.3 via `@tailwindcss/vite`, `@nuxt/fonts`. **No new dependency** — validation is hand-rolled (no `zod`/`yup`/`vee-validate` anywhere in this repo today; adding one for seven fields would be the over-engineering Article VIII forbids).
**Storage**: none — no data layer, no persistence, no network call (this is the feature's own point)
**Testing**: Vitest 4 + `@nuxt/test-utils` + Vue Test Utils, `happy-dom` global; Storybook 10 as the visual review surface for the three unreachable states (Article X)
**Target Platform**: static files in `.output/public`, S3 + CloudFront. Two locales × two routes
**Project Type**: static marketing site, feature-based Vue front end, no back end (Article IV) — reinforced by this feature's own scope line
**Performance Goals**: zero network requests from the form under any interaction; the WhatsApp field's mount/unmount is the only animated, stateful behaviour
**Constraints**: zero hex/`px`/arbitrary Tailwind values in components (Article VII); zero copy literals (Article VI); zero edits to the shared primitives or `--layer-*` tokens; no token named `--color-glow-*`/`--spacing-glow-*` (§ R36); no stacking context on the section or above it (§§ R28, R37); **no code path from a real user action reaches `sending`/`success`/`server-error`** (spec FR-014)
**Scale/Scope**: 1 new feature module (`forms`) with 5 field/group components + 1 composable + 1 data file; 1 new section in `landing` (component + logic + data); 1 line each in `heroContent.ts` and `app/pages/index.vue`; ~20 tokens in `global.css`; ~40 i18n keys per locale; component tests + stories for both modules

## Constitution Check

*GATE: passed before Phase 0. Re-checked after the design below.*

### Phase -1: Pre-Implementation Gates

Derived from `.specify/memory/constitution.md` v2.0.0 plus the repository-specific contracts this feature is bound by.

#### I · Feature-Based + Capas Architecture

- [x] Does every piece live under `app/features/<feature>/`? → **Yes.** `landing`
      gains `ContactSection` (its listed member, "contact CTA"); a **new**
      module `forms` is created, which Article I already names and scopes
      ("the contact and application forms, which appear on both pages") —
      this is not a judgement call, it is filling in a module the
      Constitution already declared and no feature had needed yet.
- [x] Are the three layers respected in both modules? → **Yes**; `forms/` gets
      the same `ui/`, `logic/`, `data/`, barrel shape as every other module.
- [x] Is `app/pages/index.vue` still a thin wrapper? → **Yes**: one more
      composable call and one more component.
- [x] Is anything added to `app/shared/`? → **No.** The field primitives are
      form-domain, not generic design-system atoms like `GlassPanel` — they
      belong to the feature the Constitution built for exactly this reuse
      case, not to `shared/`.

#### II · Dependency Direction (NON-NEGOTIABLE)

- [x] `ui/` imports only from `logic/`, `data/`, `@/shared/ui`? → **Yes** in
      both modules.
- [x] `logic/` imports only from `data/`? → **Yes.**
- [x] `data/` imports from neither? → **Yes**; it holds keys, field
      definitions and validation rule descriptors, no Vue.

#### III · Feature Isolation (NON-NEGOTIABLE)

- [x] Does `landing` avoid `forms`'s internals? → **Yes.** `ContactSection.vue`
      imports `ContactForm` and `useContactForm`'s types only from
      `app/features/forms/index.ts`.
- [x] Does `forms` avoid `landing`'s and `shell`'s internals? → **Yes.**
      `forms/` holds no `#contacto` string and no i18n key under
      `landing.*` — it is field-generic, consumed by two different feature's
      copy.
- [x] Does `shell` change? → **No file under `app/features/shell/` is
      touched** (FR-003 — the nav CTA needs nothing).

#### IV · Static-Site Purity (NON-NEGOTIABLE)

- [x] No `server/api/`, no runtime server dependency, no request-time
      compute? → **Yes**, reinforced rather than merely satisfied: this
      feature's whole descope is "there is no destination."
- [x] Is the whole section present in `.output/public` after `pnpm generate`,
      including validation? → **Yes** — validation is client JS shipped with
      the page, not server-rendered state.

#### V · Component Discipline

- [x] `<script setup lang="ts">`, no Options API? → **Yes.**
- [x] Are `ui/` components presentational, no endpoint calls? → **Yes** —
      there is no endpoint to call. None calls a Nuxt composable except the
      two `logic/` seams (`useContactContent`, `useContactForm` needs none —
      see Decisions).
- [x] Under 200 lines each? → **Yes**, the reason the form is
      `ContactForm.vue` plus five small field components rather than one
      file with seven fields inlined.
- [x] Is interactivity opt-in and local? → **Yes.** The WhatsApp toggle and
      validation state live in one composable, scoped to the form instance.

#### VI · i18n Parity (NON-NEGOTIABLE)

- [x] Do both locale files gain the same keys? → **Yes**, enforced by
      `tests/i18n-parity.test.ts`.
- [x] Zero user-facing strings in components? → **Yes**, including the five
      validation messages and the (unreachable) success/error copy.
- [x] Any new route? → **No.**

#### VII · Design Tokens Discipline

- [x] Zero hex, `oklch` or arbitrary Tailwind values in components? → **Yes.**
- [x] Reuse before invention? → **Most of the form's tokens already exist**
      from the primitives era: `--text-form-label`, `--text-input-value`,
      `--spacing-form-gap`, `--spacing-glass-dark`, `--spacing-btn-submit-x`,
      `GlassPanel variant="dark"`. New tokens are limited to: form/left-block
      widths (660/342), the WhatsApp field's transition duration, the
      section's own glow anchors (6, one per axis per glow), and the darker
      contrast-fix background (§ *Decisions*, D-3).
- [x] Are the two token homes correct? → **Yes** — anchors and widths consumed
      as utilities go in `@theme inline`; the transition duration (Tailwind
      v4 has no `transition-duration` theme namespace, `findings.md` § R52)
      goes in `:root` and is read by a `<style scoped>`.
- [x] Is Poppins still confined to the wordmark? → **Yes.**

#### VIII · Clean Code Discipline

- [x] No magic numbers? → The three-per-field validation rules (min length,
      pattern) are named constants in `forms/data/`, not inlined literals.
- [x] No speculative abstraction? → **Yes.** No file-upload field variant is
      built (that is feature 20's, not shared preemptively); no country
      picker beyond México is built (A-03); no validation library is added.
- [x] No dead code? → The three unreachable states are stories, not dead
      branches in the shipped bundle — `previewState` is a Storybook-only
      prop, never imported by `app/pages/index.vue`'s tree.

#### IX · TypeScript Strict + Biome

- [x] No `any`, no `@ts-ignore`? → **Yes.**
- [x] Do new component names survive `useVueMultiWordComponentNames`? →
      **Yes** — `ContactSection`, `ContactForm`, `TextField`, `SelectField`,
      `TextareaField`, `RadioPillGroup` are all multi-word; no `biome.json`
      override needed.

#### X · Testing Discipline

- [x] Component tests with `should <expected> when <condition>` names? →
      **Yes**, one per new component plus the validation composable.
- [x] Storybook stories at both viewports and both locales, **plus** the
      three unreachable states? → **Yes** — this is where FR-015 is actually
      demonstrated, not merely asserted.
- [x] Do the new test files run under the existing `vitest.config.ts`
      `include`? → **Yes**, `app/features/**/*.test.ts` already covers a new
      module with no config change.
- [x] Are tests independent? → **Yes**; no global listener is registered by
      any new composable (the WhatsApp toggle is local component state).
- [x] No E2E added? → **None.**

#### XI · Configuration & Credential Hygiene (NON-NEGOTIABLE)

- [x] No `process.env`, no `runtimeConfig`, no credential? → **Yes** — there
      is no endpoint URL, no API key, nothing to configure. This is the
      feature where that gate is easiest to pass and easiest to violate by
      accident (a stray placeholder URL "for later"); none is added.

#### XII · Absolute Imports via Alias

- [x] All intra-project imports via `@/features/`, `@/shared/`? → **Yes.**
- [x] Any new alias? → **No** — `@/features/forms/` resolves through the
      existing `@/features/` alias, nothing to mirror in `.storybook/main.ts`.

#### R28 / R37 · Paint-order contract (repository-specific, NON-NEGOTIABLE)

- [x] Is the section `position: relative`? → **Yes.**
- [x] Are all three glows inside one `SectionBackdrop`? → **Yes.**
- [x] Does the section or any wrapper create a stacking context or paint an
      opaque background? → **No** — including the contrast fix (D-3), which
      darkens the **glass token itself**, not a new opaque layer.

#### R36 · Closed glow token namespace (repository-specific)

- [x] Does any new token match `--(color|spacing)-glow-…`? → **No** — new
      tokens are `--contact-*` / `--spacing-contact-*`.
- [x] Does `app/shared/ui/SectionGlow.test.ts` still pass unmodified? →
      Verified as a task before any component exists.

#### R49 · Section rhythm (repository-specific)

- [x] Does the section take its top padding from Proyectos' leftover rather
      than a page-absolute y? → **Yes** — measured the same way features 9/13
      measured theirs, once feature 15 (Proyectos) has landed and left a
      number; if it has not yet landed when this is implemented, the leader
      supplies the leftover the same way it supplied the glow centres.
- [x] Does it declare no bottom padding? → **Yes** — the footer's own top
      padding is the separation (`rules.md` § R49 precedent).

**Result: PASS.** No violation, so Complexity Tracking stays empty.

## Project Structure

### Documentation (this feature)

```text
specs/016-contact-section/
├── spec.md                      # The "what", scope line, and the two-CTA finding
├── plan.md                      # This file
├── data-model.md                # Fields, validation rules, tokens, i18n keys
└── tasks.md                     # /speckit-tasks output
```

> No `checklists/requirements.md` beyond the one already written during
> `/speckit-specify`. No `research.md`: the two real technical questions
> (module placement, and how three unreachable states coexist with "no fake
> success") are decided below with their evidence, and Roberto's standing
> note against extra prose (recorded in feature 13's plan) applies here too.

### Source Code (repository root)

```text
app/
├── features/forms/                        # NEW MODULE — Constitution Article I, filled in
│   ├── data/
│   │   └── contactFields.ts               # NEW — field ids, kinds, validation rule descriptors
│   ├── logic/
│   │   └── useContactForm.ts              # NEW — plain Vue: values, errors, WhatsApp toggle, previewState passthrough
│   ├── ui/
│   │   ├── TextField.vue                  # NEW — text / email / tel control, one `type` prop
│   │   ├── SelectField.vue                # NEW — select + chevron-down icon
│   │   ├── TextareaField.vue              # NEW
│   │   ├── RadioPillGroup.vue             # NEW — the Correo/WhatsApp pair
│   │   ├── ContactForm.vue                # NEW — composes the seven fields + submit + 5 visual states
│   │   ├── *.test.ts · *.stories.ts       # NEW
│   │   └── index.ts (barrel)              # NEW
│   └── index.ts                           # NEW — module barrel
├── features/landing/
│   ├── data/
│   │   ├── contactContent.ts              # NEW — keys, glow anchors' derivation notes
│   │   └── heroContent.ts                 # +1 line: HERO_DESTINATIONS.contactHash
│   ├── logic/
│   │   └── useContactContent.ts           # NEW — the module's Nth Nuxt seam (useI18n, useLocalePath for CALL_BOOKING_URL's label only)
│   ├── ui/
│   │   ├── ContactSection.vue             # NEW — backdrop, left block, layout, imports ContactForm from @/features/forms
│   │   └── *.test.ts · *.stories.ts       # NEW
│   └── index.ts                           # extended barrel
├── pages/index.vue                        # + one composable call, + one component
├── shared/ui/                             # UNTOUCHED
├── shared/data/callBooking.ts             # UNTOUCHED, re-consumed
├── assets/icons/                          # + chevron-down.svg (lucide, normalized per the existing contract)
└── assets/css/global.css                  # + ~20 tokens

i18n/locales/{es,en}.json                  # + landing.contact.* + forms.contact.* (or a shared forms.* namespace — see Decisions D-4)

tests/
├── landing-copy.test.ts                   # extended — contact section copy read from disk
└── static-output.test.ts                  # extended — id="contacto", no server-bound request
```

**Structure Decision**: `forms` is a new top-level feature module because
Article I already names it and scopes it to exactly this reuse — the field
primitives and the validation composable are shared between this feature and
feature 20, and Article III forbids `about` reaching into `landing`'s
internals (or vice versa) to borrow them. `landing/ContactSection.vue` stays
thin: layout, copy, glows, and one import from `forms`'s barrel.

## Decisions

### D-1 · Module boundary: `forms` owns fields and state, `landing` owns section chrome

The dividing line, concretely:

| Lives in `forms` | Lives in `landing` |
|---|---|
| `TextField`, `SelectField`, `TextareaField`, `RadioPillGroup` | `ContactSection` (Pill, heading, copy, alt route, glows, layout) |
| `ContactForm` (composes the seven fields, the submit control, the five visual states) | The section's own i18n namespace (`landing.contact.*`) for the left block |
| `useContactForm` (values, per-field errors, WhatsApp mount/unmount, `previewState` passthrough) | `useContactContent` (left-block copy + `CALL_BOOKING_URL` label) |
| The form's own copy keys (field labels, placeholders, validation messages, the two unreachable states' copy) | — |

`ContactForm` takes its field labels/options/messages as props from a content
object `forms/` computes from its own i18n keys — **not** from `landing`'s.
This is what lets feature 20 reuse `ContactForm`'s primitives for a
differently-shaped form (different fields, same controls) without `about`
importing anything from `landing`.

**Alternative rejected**: putting the field primitives in `app/shared/ui/`.
Rejected because Article I already gives them a home more specific than
"cross-cutting design-system primitive" — `GlassPanel`/`Radar`/`Pill` are
primitives with no domain; a form field validated against a business rule
("10 dígitos para +52") is domain logic that belongs to the module the
Constitution named for it.

### D-2 · Five states, two reachable — the mechanism

`ContactForm.vue` accepts an optional `previewState?: 'sending' | 'success' | 'server-error'`
prop, **consumed only by its own `.stories.ts` file**. `app/pages/index.vue`
and `ContactSection.vue` never set it — grep-provable, since it is one prop
name in one file. `useContactForm`'s real return value only ever produces
`idle` or `invalid`; there is no internal state variable for the other three
inside the composable, so there is no code path — not even a theoretically
reachable one — for a real click to produce them. The submit handler:

```
onSubmit → runValidation(values) → errors.length
  ? state = 'invalid', focus first invalid field
  : /* nothing further — no request, no state change */
```

Success/error/sending are rendered by `ContactForm.vue` **only** when
`previewState` is set, which the shipped page's props never do. This is
different from — and stricter than — a client-only "fake success" flag: there
is no runtime condition under which the real page can reach those branches,
only a build-time one (whether the story passed the prop).

**Alternative rejected**: a `setTimeout`-driven fake submit that flips to
"sending" then "success" after a delay. Rejected explicitly — this is the
literal shape of "no debe simular un envío" the leader's brief names, and
would additionally violate FR-014 by giving the button a real, if fake,
network-shaped effect.

### D-3 · Contrast fix: a darker dark-glass token, not a new opaque layer

`--dark-glass` at 65% opacity, over this section's glow-lit background,
does not measure at 4.5:1 for `--text-input-value` in the worst case (light
`ink` text over the palest part of the glow). The fix is a second opacity
step on the **existing** dark-glass recipe — `--color-glass-dark-contact`
at a higher opacity (derived, not invented: raised until the worst-case
contrast clears 4.5:1, documented with the exact ratio in `data-model.md`) —
consumed only by this form's outer `GlassPanel`-equivalent surface. This
keeps `GlassPanel.vue` itself untouched (its `dark` variant is a `done`
contract) and keeps the section's own background non-opaque: darkening the
*glass*, which is already translucent, is not the same as painting an opaque
layer over the glows (FR-020 still holds).

**Alternative rejected**: raising `--text-input-value`'s color contrast
instead of the glass. Rejected because the value color is a system-wide
token (`ink-100`) used across every form-adjacent surface in the design;
changing it here would drift this section from the vocabulary `component-contracts.md`
already fixed, whereas a form-specific glass opacity step is local and
named for exactly one consumer.

### D-4 · i18n namespace: `forms.contact.*`, not `landing.contact.fields.*`

Field labels, placeholders, validation messages and the two unreachable
states' copy live under `forms.contact.*` — not nested under `landing.*` —
because `forms/` cannot import a key namespaced under a feature it must stay
isolated from (Article III), and because feature 20's application form will
need its own sibling namespace (`forms.application.*`) using the **same**
field-level conventions (e.g. `forms.contact.fields.name.label`,
`forms.contact.fields.name.errorRequired`). The section's own left-block copy
(heading, body, eyebrow) stays under `landing.contact.*`, matching every
other section's convention.

## Implementation Approach

1. **`forms/data/` and `forms/logic/` first** (Article II bottom-up), with a
   test file per validation rule before any component exists.
2. **Tokens and copy**, in the two correct homes, with `SectionGlow.test.ts`
   run unmodified as the § R36 guard before `ContactSection.vue` exists.
3. **Field components**, each under 200 lines, each with its own story so a
   reviewer can see every visual state (default, error, disabled/read-only
   for the `sending` preview) without assembling the whole form.
4. **`ContactForm.vue`** composing the seven fields plus the five-state
   switch (D-2), then **`ContactSection.vue`** composing the left block, the
   glows, and `ContactForm`.
5. **The two CTA fixes**: one line in `heroContent.ts` (FR-002); confirm
   FR-003 needs literally nothing by reading `useShellNavigation.ts` once
   more against the built page.
6. **Verification that Vitest cannot do** is measured on the generated
   artefact with `Emulation.setDeviceMetricsOverride` over the DevTools
   protocol (`findings.md` § R44): the four paint levels, the three glow
   centres, the contrast ratio, both CTAs landing on `#contacto`, and —
   the check specific to this feature — that no network request fires from
   any interaction with the shipped form.

## Complexity Tracking

> No Constitution Check violation. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
