# Implementation Plan: Muush 1.0 forms — diagnóstico (home) and application (Nosotros)

**Branch**: `feat/v2-forms` (from `muush-v2`, merges back into `muush-v2`) | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/045-forms/spec.md`

## Summary

Build one v2 form UI in `app/features/forms/ui/` — a shared `SteppedForm`
shell plus field parts — that both `ContactForm` (diagnóstico, `/contact`)
and `ApplicationForm` (`/careers/upload` → PUT → `/careers`) compose. The
logic layer stays: three additive pieces (`useFormSteps`, `useConsentGate`,
the `revealField` hook in `useFormSubmitState`) and one extraction
(`classifyCvFile`). Payload builders and flows are untouched, so bodies stay
byte-for-byte. Quarantine the v1 form UI in `forms/ui/legacy/`; replace the
v1 contact section on the home with `landing/ui/AssessmentSection` over the
`assessment` listón; Nosotros keeps its v1 section and receives the v2
`ApplicationForm` through the barrel. Add the lucide `check` icon, the form
tokens and the ES/EN copy. Details: [research.md](./research.md),
[data-model.md](./data-model.md),
[contracts/components.md](./contracts/components.md),
[quickstart.md](./quickstart.md).

## Technical Context

**Language/Version**: TypeScript (strict) · Vue 3.5 `<script setup lang="ts">` · Nuxt 4 (`srcDir: app/`)
**Primary Dependencies**: Tailwind CSS 4 (v2 tokens 42–44), `@nuxtjs/i18n` 10. **No new dependency** (lucide `check` copied as an asset).
**Storage**: N/A (client state only)
**Testing**: Vitest + Vue Test Utils + happy-dom; Storybook 10; build-output tests in `tests/`
**Target Platform**: Static site (`nitro.preset: 'static'`) on S3 + CloudFront; evergreen browsers
**Project Type**: Static web site (single Nuxt project)
**Performance Goals**: zero new requests at load (Turnstile and the edge-country lookup still load on first engagement, feature 029/032); no layout work on scroll; only `matchMedia` listeners
**Constraints**: Articles IV, VI, VII; components < 200 lines; 390/1440 anchors; contract unchanged; feature 29/31/32 tests stay green
**Scale/Scope**: ~16 new v2 form components, 1 landing section + 1 list, 3 new composables/pure modules, ~12 v1 components moved, ~90 i18n keys per locale reworked, ~40 tokens, ~8 test files edited

## Constitution Check

*GATE: must pass before Phase 0 research. Re-checked after Phase 1 design: still passing.*

### Phase -1: Pre-Implementation Gates

#### I. Feature-Based + Capas architecture
- [x] Form UI in `forms/ui/`, step/consent/CV logic in `forms/logic/`, step membership and media query in `forms/data/`; the home section in `landing/{ui,data,logic}`; pages only compose.
- [x] v1 form UI quarantined in `forms/ui/legacy/` with its content types in `forms/data/legacy/` (research R1).

#### II. Dependency direction (NON-NEGOTIABLE)
- [x] `ui/` → `logic/`, `data/`; `logic/` → `data/`; `formSteps.ts` (data) imports only types from sibling data files.

#### III. Feature isolation (NON-NEGOTIABLE)
- [x] `landing` and `about` reach forms only through `@/features/forms`; nothing from `ui/legacy/` is exported. The v1 ContactSection is deleted rather than kept, because keeping it would require exporting a v1 form (R1).

#### IV. Static-site purity (NON-NEGOTIABLE)
- [x] No server route; submissions remain browser calls to the external API from `logic/formsApiClient.ts`. Prerendered HTML is the single view, no step state on the server.

#### V. Component discipline
- [x] `<script setup lang="ts">` only; every component < 200 lines (largest planned: `ApplicationForm` ≈ 170, `SteppedForm` ≈ 150).
- [x] Step, consent and CV checks live in composables / pure functions; components bind. `ui/` never calls `fetch` or a Nuxt composable.
- [x] Interactivity opt-in: the section chrome is static markup; only the form carries state.

#### VI. i18n parity (NON-NEGOTIABLE)
- [x] All copy in `forms.contact.*`, `forms.application.*`, `landing.assessment.*` in both locales; `landing.contact.*` and other readerless keys removed from both; parity test green. New copy (identity placeholder, consent hint, EN step labels) flagged for Roberto/leader.

#### VII. Design tokens discipline
- [x] Every colour, size and spacing through tokens (data-model § 5); reuses 42–44 tokens where equal; no `m1`/`v2` in any name; no v1 token in new files; `token-literals.test.ts` scans them.
- [x] 390/1440 match the extract; other widths use clamps; the anatomy swap is a `md:` change.

#### VIII. Clean code
- [x] The v1 file-type/size check is extracted once (`classifyCvFile`) and reused by the quarantined `FileField`; shared chrome is one shell for both forms; no speculative props.

#### IX. TypeScript strict + Biome
- [x] No `any`; step lists typed with `satisfies`; `pnpm check` and `pnpm typecheck` in `./init.sh`.

#### X. Testing discipline
- [x] Unit tests for `formSteps`, `useFormSteps`, `useConsentGate`, `classifyCvFile`, the `revealField` hook; component tests for every v2 part, both forms and the section; stories in both viewports and locales. Existing payload/flow tests stay unchanged and green.

#### XI. Configuration & credential hygiene (NON-NEGOTIABLE)
- [x] No new config or env; sitekey and API base stay in `runtimeConfig.public`; no credential in specs or code.

#### XII. Absolute imports via alias
- [x] `@/features/…`, `@/shared/…`, `@/assets/…`; relative only within one folder.

## Project Structure

### Documentation (this feature)

```text
specs/045-forms/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/components.md
├── checklists/requirements.md
└── tasks.md
```

### Source code (repository root)

```text
app/
├── assets/
│   ├── css/global.css                 # form + section tokens; retire --contact-*
│   └── icons/check.svg, README.md     # new glyph
├── features/forms/
│   ├── data/formSteps.ts              # new
│   ├── data/legacy/legacyFormContent.ts  # v1 content types (moved)
│   ├── data/contactFields.ts, applicationFields.ts   # v2 content shapes
│   ├── logic/formSteps.ts, useFormSteps.ts, useConsentGate.ts, cvFileCheck.ts  # new
│   ├── logic/useFormSubmitState.ts, useContactForm.ts, useApplicationForm.ts   # + revealField
│   ├── logic/useContactFormContent.ts, useApplicationFormContent.ts             # v2 copy
│   ├── ui/ SteppedForm, FormPanel, FormProgress, FieldBlock, TextField,
│   │       TextareaField, SelectField, SegmentedControl, ContactChannelField,
│   │       WhatsappField, DialCodeSelect, CvField, ConsentCheckbox, FormNotice,
│   │       FormSuccess, ContactForm, ApplicationForm (+ stories, tests), HoneypotField
│   ├── ui/legacy/                     # the 12 v1 components + stories + tests
│   └── index.ts
├── features/landing/
│   ├── data/assessmentContent.ts, logic/useAssessmentContent.ts      # new
│   ├── ui/AssessmentSection.vue, ReceivesList.vue (+ stories, tests)  # new
│   └── (deleted) data/contactContent.ts, logic/useContactContent.ts, ui/legacy/ContactSection.*
├── features/about/ui/WorkWithMuushSection.* # fixtures + comment only
├── shared/ui/PrimaryButton.vue            # + unavailable, describedBy
└── pages/index.vue, about.vue
i18n/locales/{es,en}.json
tests/ forms-copy, forms-application-copy, landing-copy, static-output,
       tablet-layout-tokens, token-literals
```

**Structure Decision**: single Nuxt project; feature modules as above.

## Complexity Tracking

No constitution violation to justify.

## Agent context

`CLAUDE.md` has no `<!-- SPECKIT START -->` block, so no agent-context update
was made (same as features 43–44).
