# Implementation Plan: Work with muush — the About page's application form

**Branch**: `feat/work-with-muush-section` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/020-work-with-muush-section/spec.md`

## Summary

`app/features/forms/` (built by feature 16, and named explicitly by
Constitution Article I as "the contact and application forms, which appear on
both pages") gains its second consumer and one new primitive: `FileField.vue`
for the CV upload, plus `ApplicationForm.vue`, `useApplicationForm.ts` and
`applicationFields.ts` sitting alongside feature 16's `ContactForm.vue` /
`useContactForm.ts` / `contactFields.ts` behind the module's existing barrel.
`app/features/about/` (built by feature 17) gets its second section,
`WorkWithMuushSection.vue` — chrome only: Pill, headline, body, three reused
glow tokens, the two-column↔stacked layout, and an import of `ApplicationForm`
from `forms`'s barrel. `app/pages/nosotros.vue` swaps its `#work` placeholder
heading for the real section.

The form does not submit, mirroring feature 16 exactly: `useApplicationForm`
runs real client-side validation and exposes only `idle` | `invalid` as
reachable states; `sending` / `success` / `server-error` exist solely as
`ApplicationForm.vue`'s Storybook-only `previewState` prop, never set by the
shipped page. The CV field extends this same "no fake result" guarantee to
file input: selecting a file only updates local component state (name, size,
client-side PDF/size check) and is never transmitted, uploaded, or persisted.

Two things this feature adds that feature 16 never needed: a file-upload
primitive, and a grouped (area-then-role) select. Both are additions to
existing primitives' territory (`forms/ui/` gains one new component;
`SelectField.vue` gains one new, backward-compatible prop shape) rather than
new bespoke UI.

## Technical Context

**Language/Version**: TypeScript 5 strict, Vue 3.5 SFCs (`<script setup lang="ts">`), Nuxt 4 (`srcDir: app/`)
**Primary Dependencies**: `@nuxtjs/i18n` 10, Tailwind CSS 4.3.3 via `@tailwindcss/vite`, `@nuxt/fonts`. **No new dependency** — file validation (MIME/extension + size) is a handful of lines against the native `File` API; no upload/dropzone library is added (Article VIII — there is nowhere to upload to).
**Storage**: none — the selected `File` object lives in one `ref`, is never read into a `FormData`, never base64-encoded for a request, and is discarded on unmount; no IndexedDB, no `localStorage`, no request of any kind.
**Testing**: Vitest 4 + `@nuxt/test-utils` + Vue Test Utils, `happy-dom` global (which does implement `File`/`FileList` enough for a component test to assert on `.name`/`.size`/`.type`); Storybook 10 for the three unreachable states and the two new field variants.
**Target Platform**: static files in `.output/public`, S3 + CloudFront. Two locales × the one existing About route (`/es/nosotros`, `/en/about`) — no new route.
**Project Type**: static marketing site, feature-based Vue front end, no back end (Article IV) — this feature's file field is the one place that guarantee is easiest to violate by accident (a stray "upload to X for later" call), so it gets its own Constitution Check line below.
**Performance Goals**: zero network requests from any interaction with this section, including a selected file and a "successfully" validated submit attempt.
**Constraints**: zero hex/`px`/arbitrary Tailwind values (Article VII); zero copy literals (Article VI); no edit to `SectionGlow`/`DotGrid`/`SectionBackdrop` or the `--layer-*` tokens; no new token named `--color-glow-*`/`--spacing-glow-*` (§ R36) — this section reuses feature 16's three glow color/size pairs verbatim; no stacking context on the section or above it (§§ R28, R37); no code path from a real user action reaches `sending`/`success`/`server-error`, and none reaches a network call for the CV file either.
**Scale/Scope**: `forms/` gains 1 new field component (`FileField`) + 1 new form composition (`ApplicationForm`) + 1 composable + 1 data file, and `SelectField.vue` gains one optional grouped-options prop; `about/` gains 1 new section (component + logic + data), extends its barrel; 1 line removed from and 1 component added to `app/pages/nosotros.vue`; ~10 new tokens in `global.css` (all spacing/anchor — zero new color/size glow tokens); ~35 i18n keys per locale (`forms.application.*` + `about.work.*`); component tests + stories for both new components plus the extended `SelectField`.

## Constitution Check

*GATE: passed before Phase 0. Re-checked after the design below.*

### Phase -1: Pre-Implementation Gates

Derived from `.specify/memory/constitution.md` v2.0.0 plus the repository-specific contracts feature 16 already bound this module to.

#### I · Feature-Based + Capas Architecture

- [x] Does every piece live under `app/features/<feature>/`? → **Yes.** `about`
      gains its second listed section ("work-with-muush", Article I's own
      word for it); `forms` gains its second consumer, which Article I's
      phrase "the contact and application forms" already anticipated as one
      module, not two.
- [x] Are the three layers respected in both modules? → **Yes**; `ui/`,
      `logic/`, `data/`, barrel — identical shape to feature 16 and 17.
- [x] Is `app/pages/nosotros.vue` still a thin wrapper? → **Yes**: it drops
      its four-line placeholder `<section id="work">` and gains one
      composable call + one component, same shape `index.vue` already has
      for the landing's sections.
- [x] Is anything added to `app/shared/`? → **No.** `FileField` is
      form-domain (a business rule — "PDF only, one CV" — governs it), not a
      generic design-system atom, same reasoning feature 16's plan.md D-1
      already established for the other four field primitives.

#### II · Dependency Direction (NON-NEGOTIABLE)

- [x] `ui/` imports only from `logic/`, `data/`, `@/shared/ui`? → **Yes** in
      both modules; `ApplicationForm.vue` and `WorkWithMuushSection.vue`
      follow the same shape `ContactForm.vue`/`ContactSection.vue` do.
- [x] `logic/` imports only from `data/`? → **Yes.**
- [x] `data/` imports from neither? → **Yes**; `applicationFields.ts` holds
      types, ids and named validation constants only, no Vue.

#### III · Feature Isolation (NON-NEGOTIABLE)

- [x] Does `about` avoid `forms`'s internals? → **Yes.**
      `WorkWithMuushSection.vue` imports `ApplicationForm` only from
      `app/features/forms/index.ts`.
- [x] Does `forms` avoid `about`'s and `landing`'s internals? → **Yes.**
      `forms/` holds no `about.*` and no `landing.*` i18n key and no `#work`
      string — field-generic, consumed by two features' own copy, exactly
      feature 16's plan.md D-1/D-4 precedent.
- [x] Does `landing` or `shell` change? → **No file under either module is
      touched.**

#### IV · Static-Site Purity (NON-NEGOTIABLE)

- [x] No `server/api/`, no runtime server dependency, no request-time
      compute? → **Yes**, and this feature's file field is the sharpest test
      of it in the repository so far: there is no upload endpoint, so
      `FileField.vue`/`useApplicationForm.ts` MUST NOT construct a
      `FormData`, call `fetch`/`XMLHttpRequest`, or read the file into a
      base64 string "for later" — any of those would be dead code with no
      destination, which Article VIII (no speculative abstraction) already
      forbids independently.
- [x] Is the whole section, including CV validation, present in
      `.output/public` after `pnpm generate`? → **Yes** — validation is
      client JS shipped with the page.

#### V · Component Discipline

- [x] `<script setup lang="ts">`, no Options API? → **Yes.**
- [x] Are `ui/` components presentational, no endpoint calls? → **Yes** —
      doubly true for `FileField.vue`, which has no endpoint to call.
- [x] Under 200 lines each? → **Corrected post-review.** This gate was
      self-certified "Yes" before the file existed at its shipped size and
      was never re-run against the built component — `ApplicationForm.vue`
      shipped round 1 at 249 lines, caught by the reviewer, not by this gate.
      Fixed by extracting the WhatsApp field and its transition into
      `ApplicationWhatsappField.vue` (round 2); `ApplicationForm.vue` is now
      198 lines. The gate's own lesson: re-check line counts against the
      actual file before certifying, not against the plan's intent for it.
- [x] Is interactivity opt-in and local? → **Yes.** The WhatsApp toggle, the
      area/role selection and the CV filename display all live in one
      composable/component instance each, scoped to the form.

#### VI · i18n Parity (NON-NEGOTIABLE)

- [x] Do both locale files gain the same keys? → **Yes**, enforced by
      `tests/i18n-parity.test.ts`.
- [x] Zero user-facing strings in components? → **Yes**, including the CV
      field's format/size error messages and the (unreachable)
      success/error copy.
- [x] Any new route? → **No** — `nosotros.vue` already resolves both locales;
      `#work` is an existing anchor, not a new one.

#### VII · Design Tokens Discipline

- [x] Zero hex, `oklch` or arbitrary Tailwind values in components? → **Yes.**
- [x] Reuse before invention? → **The three glow color/size pairs are
      reused verbatim from feature 16** (`--color-glow-red-400-60` +
      `--spacing-glow-1500-760`, `--color-glow-wine-300-37` +
      `--spacing-glow-1000-560`, `--color-glow-wine-400-28` +
      `--spacing-glow-900-520` — zero new declarations there); the field
      recipe tokens (`--radius-control`, `--spacing-field-*`,
      `--text-form-label`, `--text-input-value`) are reused verbatim from
      `forms/`'s existing four primitives. New tokens are limited to: this
      section's own layout widths/gaps (left block, form, column/row gaps),
      its six glow-anchor tokens (one per axis per glow, section-relative —
      never the three shared color/size pairs), and whatever `FileField`
      needs beyond the shared field recipe (its distinct fill/stroke per
      `design-extract.md` § FormField's "upload" variant).
- [x] Are the two token homes correct? → **Yes** — layout widths, gaps and
      glow anchors are consumed as utilities (`@theme inline`); nothing new
      needs `:root` for this feature (unlike feature 16's transition
      duration and contrast-fix token) unless the CV field turns out to need
      a hand-written `<style scoped>` value, in which case it goes in
      `:root` per `rules.md` § R18/§ R52.
- [x] Is Poppins still confined to the wordmark? → **Yes.**

#### VIII · Clean Code Discipline

- [x] No magic numbers? → CV size limit and the validation rule constants
      are named constants in `forms/data/applicationFields.ts`, not inlined.
- [x] No speculative abstraction? → **Yes.** No actual upload mechanism is
      built (there is nowhere to upload to — FR-011); no drag-and-drop is
      built beyond what a native file input gives; the area/role catalog's
      role list is not invented (Assumptions, spec.md).
- [x] No dead code? → The three unreachable submit states are stories, not
      dead branches in the shipped bundle, mirroring feature 16's
      `previewState` mechanism exactly.

#### IX · TypeScript Strict + Biome

- [x] No `any`, no `@ts-ignore`? → **Yes.**
- [x] Do new component names survive `useVueMultiWordComponentNames`? →
      **Yes** — `ApplicationForm`, `FileField`, `WorkWithMuushSection` are
      all multi-word; no `biome.json` override needed.

#### X · Testing Discipline

- [x] Component tests with `should <expected> when <condition>` names? →
      **Yes**, one per new component plus the validation composable,
      including the CV field's format/size rejection and the grouped
      select's area/role structure.
- [x] Storybook stories at both viewports and both locales, **plus** the
      three unreachable states and the new field variants (default, error,
      file-attached, disabled/read-only for the `sending` preview)? →
      **Yes.**
- [x] Do the new test files run under the existing `vitest.config.ts`
      `include`? → **Yes**, `app/features/**/*.test.ts` already covers a
      new module with no config change.
- [x] Are tests independent? → **Yes**; no global listener is registered by
      any new composable.
- [x] No E2E added? → **None.**

#### XI · Configuration & Credential Hygiene (NON-NEGOTIABLE)

- [x] No `process.env`, no `runtimeConfig`, no credential? → **Yes** — there
      is no upload endpoint URL, no API key, nothing to configure. Same
      note as feature 16's plan.md: this is where that gate is easiest to
      violate by accident (a placeholder upload URL "for later"), and none
      is added.

#### XII · Absolute Imports via Alias

- [x] All intra-project imports via `@/features/`, `@/shared/`? → **Yes.**
- [x] Any new alias? → **No.**

#### R28 / R37 · Paint-order contract (repository-specific, NON-NEGOTIABLE)

- [x] Is the section `position: relative`? → **Yes.**
- [x] Are all three glows inside one `SectionBackdrop`? → **Yes.**
- [x] Does the section or any wrapper create a stacking context or paint an
      opaque background? → **No.**

#### R36 · Closed glow token namespace (repository-specific)

- [x] Does any new token match `--(color|spacing)-glow-…`? → **No** — new
      tokens are `--work-*` / `--spacing-work-*`.
- [x] Does `app/shared/ui/SectionGlow.test.ts` still pass unmodified? →
      Verified as a task before any component exists (same as feature 16).

#### R48 / R49 · Glow-anchor conversion and section rhythm (repository-specific)

- [x] Are the glow anchors converted section-relative from the page-absolute
      centres the leader supplied, per both viewports independently (never
      derived from one and assumed for the other, § R48's own cautionary
      tale)? → **Yes** — see Decisions D-2.
- [x] Does the section's own top spacing follow the R49 discipline (measured
      from the previous rendered sibling's own bottom edge, not a
      page-absolute y)? → **Yes** — see Decisions D-3; `AboutHeroSection`
      declares no bottom padding, so this section's own top padding is the
      whole of the separation, same shape feature 17 used following the
      nav.

**Result: PASS.** No violation, so Complexity Tracking stays empty.

## Project Structure

### Documentation (this feature)

```text
specs/020-work-with-muush-section/
├── spec.md                      # The "what", scope line, and the assumptions this feature seeds explicitly
├── plan.md                      # This file
├── data-model.md                # Fields, validation rules, tokens, i18n keys
└── tasks.md                     # /speckit-tasks output
```

> No `research.md`: the two real technical questions this feature raises
> (how a file field can be "real UI/UX" with nowhere to send the file, and
> how a two-column area/role select becomes a native, accessible control) are
> decided below with their evidence, same precedent feature 16's plan.md set.

### Source Code (repository root)

```text
app/
├── features/forms/
│   ├── data/
│   │   └── applicationFields.ts           # NEW — sibling to contactFields.ts: field ids, kinds, validation constants, area/role catalog shape
│   ├── logic/
│   │   └── useApplicationForm.ts          # NEW — mirrors useContactForm.ts's shape: values, errors, WhatsApp toggle, previewState passthrough
│   ├── ui/
│   │   ├── FileField.vue                  # NEW — the CV upload control (PDF/size validation, filename display, no transmission)
│   │   ├── ApplicationForm.vue            # NEW — composes the eight fields + submit + 5 visual states
│   │   ├── SelectField.vue                # EXTENDED — accepts an optional grouped-options shape for "Área y rol", additive to its existing flat Option[] prop
│   │   ├── *.test.ts · *.stories.ts       # NEW/EXTENDED accordingly
│   │   └── index.ts (barrel)              # EXTENDED
│   └── index.ts                           # EXTENDED module barrel
├── features/about/
│   ├── data/
│   │   └── workContent.ts                 # NEW — keys, glow anchors' derivation notes, section layout widths
│   ├── logic/
│   │   └── useWorkContent.ts              # NEW — the module's second Nuxt seam (useI18n only; no CALL_BOOKING_URL-equivalent here — no external link on this section)
│   ├── ui/
│   │   ├── WorkWithMuushSection.vue        # NEW — backdrop, left block, layout, imports ApplicationForm from @/features/forms
│   │   └── *.test.ts · *.stories.ts       # NEW
│   └── index.ts                           # EXTENDED barrel
├── pages/nosotros.vue                     # − 4-line `#work` placeholder, + 1 composable call, + 1 component
├── shared/ui/                             # UNTOUCHED
├── assets/icons/                          # + paperclip.svg (lucide, normalized per rules.md § R14, same contract as chevron-down.svg/x.svg)
└── assets/css/global.css                  # + ~10 tokens, zero new color/size glow tokens

i18n/locales/{es,en}.json                  # + about.work.* (section chrome) + forms.application.* (field content) − pages.about.work (the placeholder key this feature retires)

tests/
├── landing-copy.test.ts or an about-copy equivalent  # EXTENDED/NEW — work section copy read from disk
└── static-output.test.ts                  # EXTENDED — `#work` still resolves, no network-bound request, no server route
```

**Structure Decision**: `forms` and `about` both extend module shapes feature
16 and 17 already established — no new top-level module, no new alias, no
change to `landing` or `shell`. `WorkWithMuushSection.vue` stays thin: layout,
copy, glows, one import from `forms`'s barrel — the same division of
responsibility `ContactSection.vue` already models.

## Decisions

### D-1 · File upload: a real, presentational control with a structurally-enforced dead end

`FileField.vue` renders a native `<input type="file" accept="application/pdf">`
plus the filename/size once chosen, and validates type and size synchronously
against the selected `File` object's own `.type`/`.name`/`.size` — no
`FormData`, no `fetch`/`XMLHttpRequest`, no object URL kept past the
component's lifetime. This is the literal extension of feature 16's D-2
("no fake success is structural, not conventional") to a file: grep this
component and its composable for `FormData`, `fetch`, or `XMLHttpRequest` and
find nothing, the same guarantee a reviewer already checks for `ContactForm`.

**Alternative rejected**: a disabled/inert file input until "the real upload
exists". Rejected because the acceptance criteria call for real client-side
validation of the CV field specifically (`ui-map.md` § 9: "Solo PDF, máximo
5MB propuesto"), and an inert control cannot demonstrate that rule at all —
the same reasoning that kept feature 16's other seven fields real while only
the network round-trip was descoped.

### D-2 · Glow anchors: two viewports' centres, converted independently

The leader supplied both viewports' page-absolute centres directly (this
session, not `design-extract.md`), so § R48's failure mode — deriving one
viewport's offset from the other's and treating it as measured — does not
apply here; both are used as given. Conversion follows § R48's recipe:
horizontal origin is the page margin (80 desktop / 24 mobile), vertical
origin is this section's own top edge (§ R49, see D-3), each glow anchored by
its centre with `-translate-x-1/2 -translate-y-1/2` (the one permitted
stacking-context exception, § R28), each axis its own `clamp()` between the
two measured extremes — six tokens total, none named `--spacing-glow-*` or
`--color-glow-*` (§ R36).

### D-3 · Section top spacing: the frame's own left-block offset, not a page-absolute subtraction

The leader's brief gives the Left block's position as `@80,130` (desktop) /
`@24,0` (mobile) — coordinates *within the section's own 1440×950 / 390×1000
frame*, the same local-coordinate convention feature 13's Propósito frame
(`ayCiG`) already used for its own children ("Radar Why 30x30 @235,249",
explicitly relative to the section). Team (feature 18) and Network (feature
19) both stay `blocked`, so this section renders as `AboutHeroSection`'s
immediate next sibling with nothing between them. `AboutHeroSection` declares
no bottom padding (its own doc comment: "the next block on the page owns the
separation"), so this section's own top padding is the *entire* separation
between the two — not a leftover computed from a page-absolute y minus
intervening sections that do not exist in the DOM. Concretely:
`--spacing-work-top` takes the frame's own y130/y0 values directly, the same
way `AboutHeroSection` took its own frame's y-offsets directly as its own
top padding after subtracting only the nav (§ R49) — there is no page-absolute
subtraction to redo here because the frame is already section-local.

**Alternative rejected**: treating `ZfhBB`'s coordinates as page-absolute and
subtracting `AboutHeroSection`'s rendered height from them. Rejected because
that would require Team and Network's heights too (they sit between Hero and
this section on the actual 5060px-tall design page) — heights that do not
exist because those two sections are `blocked`, which would make this
section's top spacing depend on sections that aren't being built. The
section-relative reading needs nothing from either.

### D-4 · Area/role select: extend `SelectField`, don't fork a second component

"Área y rol" becomes a `SelectField` variant that accepts an optional
`groups: { label: string; options: Option[] }[]` prop alongside its existing
flat `options: Option[]` — rendered as `<optgroup>` per group, native
`<option>` per role, when `groups` is supplied; the existing flat shape is
untouched for `ContactForm`'s "¿cómo te identificas?" field, so this is
additive, not a breaking change to a `done` contract (feature 16's
`identity` field keeps working with zero changes to its own call site).

**Alternative rejected**: a bespoke two-column popover reproducing the
`.pen`'s visual layout (`Nldxe`) pixel-for-pixel. Rejected for the same
reason feature 16 chose a native `<select>` over a custom listbox — a native
grouped control keeps keyboard navigation and assistive-technology behaviour
for free, and a two-column popover would be new, untested interaction surface
for a control whose actual job (pick one role from six labelled groups) a
browser already solves. `<optgroup>` does not render two visual columns in
any browser, which is a real, reported divergence from the `.pen`'s drawn
layout — not a silent one.

### D-5 · CV mandatory-ness stays an isolated, owner-flagged assumption

Per `decisions-open.md`'s own instruction ("cualquier spec que toque estas
áreas debe marcar lo abierto... en vez de asumir una respuesta") and this
feature's own launch brief, item #7 is not resolved either way here. It is
implemented as one named boolean (e.g. `CV_REQUIRED = false`, colocated with
its own comment naming the owner and the decision it is pending) consumed by
exactly one line of `validateApplicationForm`, so flipping it later is a
one-line change, not a validation rewrite — mirroring how feature 16 handled
every other genuinely open value it touched (`--duration-contact-whatsapp-toggle`,
owner Clau).

### D-6 · Area/role catalog: six confirmed headers, an explicit placeholder role list

The six area headers are CONFIRMED (`ui-map.md` § 9). The specific roles per
area are UNVERIFIED — not in `content.md`, not in `design-extract.md`, and
the Notion source `ui-map.md` itself defers to is not accessible to this
process. `applicationFields.ts` ships a `ROLE_CATALOG` data structure with the
six confirmed area keys, each holding a single explicitly-named placeholder
role (e.g. `"Rol por confirmar"` / `"Role to be confirmed"`), commented with
the owner (Clau) and the exact gap, so the select renders a real, testable
grouped control today and gains real role options later as a pure data change
— no component, no validation rule, and no i18n key shape changes when the
real list arrives.

**Alternative rejected**: inventing plausible role titles per area (e.g.
"Backend Engineer" under IT). Rejected because it would ship unapproved
content indistinguishable from real copy — exactly what feature 16's plan.md
D-... precedent already refused to do for the sixth, undocumented "Restaurante
o bar" identity option, and what `rules.md` § R38 already names as the
wrong move for a value no design artifact can supply: register the gap,
derive nothing that looks like a measurement or a fact, and mark it.

## Implementation Approach

1. **`forms/data/` first** (Article II bottom-up): `applicationFields.ts`
   with its field ids, validation constants, `ROLE_CATALOG` placeholder and
   the `CV_REQUIRED` flag (D-5), each with a test before any component exists.
2. **`forms/logic/useApplicationForm.ts`**, mirroring `useContactForm.ts`'s
   shape and its no-fake-success guarantee, including the CV field's
   validation (D-1) and the WhatsApp toggle (identical mechanism to feature
   16, confirmed by `design-extract.md` § 10's "RadioPill... 4 usos").
3. **`SelectField.vue`'s additive extension** (D-4), verified against
   `ContactForm`'s existing "¿cómo te identificas?" call site staying
   unchanged, before `FileField.vue` exists.
4. **`FileField.vue`**, new, under 200 lines, its own story showing empty /
   valid-PDF-attached / wrong-format / oversized / read-only (`sending`
   preview) states.
5. **Tokens and copy**, in the two correct homes, with `SectionGlow.test.ts`
   run unmodified as the § R36 guard before `WorkWithMuushSection.vue` exists.
6. **`ApplicationForm.vue`** composing the eight fields plus the five-state
   switch, then **`WorkWithMuushSection.vue`** composing the left block, the
   glows (D-2), and `ApplicationForm` — replacing `nosotros.vue`'s `#work`
   placeholder and retiring the now-dead `pages.about.work` i18n key.
7. **Verification that Vitest cannot do** is measured on the generated
   artefact with `Emulation.setDeviceMetricsOverride` (`findings.md` § R44):
   the four paint levels, the three glow centres on both viewports, `#work`
   still resolving, and — the check specific to this feature — that
   selecting a file in the CV field fires no network request of any kind.

## Complexity Tracking

> No Constitution Check violation. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
