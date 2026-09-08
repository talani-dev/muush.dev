# Implementation Plan: Site background and brand chrome

**Branch**: `feat/site-background-and-brand-chrome` | **Date**: 2026-09-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/006-site-background-and-brand-chrome/spec.md`

## Summary

Three chrome foundations, one review cycle.

1. **Background** — add `DotGrid.vue` (the dotted paper as one repeating CSS
   background) and `SectionBackdrop.vue` (the per-section container for
   glows), compose the four-layer stack in `app/layouts/default.vue`, and
   close feature 3's A-03 scope flag. The mechanism is **CSS paint order**: the
   layout is the page's only stacking context, the dot sheet sits on
   `--layer-dots` (-1) and every section's glows on `--layer-glow` (-2), so a
   glow authored *inside* a section still paints *beneath* a page-wide sheet.
   No registry, no teleport, no route metadata, no client state
   (`research.md` § R1). `SectionGlow.vue` is consumed unchanged.
2. **Type** — install `@nuxt/fonts`, configure the `google` provider for
   Poppins 600 and Instrument Sans 400/500/600 with `throwOnError: true`, and
   delete the four wrong hand-written `@font-face` blocks, the stale TODO and
   the empty `public/fonts/`. Binaries are downloaded at build time and served
   from `/_fonts` in the artifact — no runtime third-party request. The
   catalogue, which never sees a Nuxt module, gets the same two families from
   a `.storybook`-only head snippet (spec A-05).
3. **Mark** — replace `public/favicon.svg` with the isotipo in the square
   avatar framing the brand book already documents, adaptive by
   `prefers-color-scheme`, delete `favicon.ico`, and declare the icon
   explicitly for the site and for the catalogue.

Plus the documentation debts the feature is chartered to pay: correct
`branding.md` lines 63-64, append the new rules to `rules.md`.

## Technical Context

**Language/Version**: TypeScript 6 (strict), Vue 3.5 SFCs with `<script setup lang="ts">`
**Primary Dependencies**: Nuxt 4.5 (`srcDir: app/`), `@nuxtjs/i18n` 10.6, Tailwind CSS v4 via `@tailwindcss/vite`, **new: `@nuxt/fonts` 0.14** (build-time font pipeline)
**Storage**: N/A — this feature stores nothing
**Testing**: Vitest 4 + `@vue/test-utils` + `happy-dom` (one global environment, `rules.md` § R16); Storybook 10 (`@storybook/vue3-vite`) for visual review
**Target Platform**: static files on S3 + CloudFront; browsers at 390px and 1440px (the design's only two frames, `rules.md` § R5)
**Project Type**: static marketing site — no server, no API, no runtime compute
**Performance Goals**: the background costs zero JavaScript and two paint layers; the font set is 2 families / 4 weights / `woff2` / latin + latin-ext
**Constraints**: no server route or runtime dependency (Article IV); no runtime request to a third-party font host; no colour or size literal outside a token (Article VII); `SectionGlow.vue` byte-identical (spec FR-011); the existing shell's geometry and tests unchanged (FR-012)
**Scale/Scope**: 2 new components, 5 new tokens, 1 layout edit, 1 config edit, 3 asset changes, 2 documentation edits, 2 stories, 2 test files touched

## Constitution Check

*GATE: evaluated before Phase 0, re-evaluated after Phase 1 design. Every box
must be `[x]` before implementation starts, and the `reviewer` verifies each
one against the diff.*

### Phase -1: Pre-Implementation Gates

Derived from `.specify/memory/constitution.md` v2.0.0.

#### I. Feature-Based + Capas Architecture

- [x] Do the two new components belong in `app/shared/ui/` rather than inside a
      feature? **Yes** — the background is consumed by both the landing and the
      about pages, exactly like `SectionGlow`, which the same reasoning already
      placed there.
- [x] Does the layout hold structural chrome only, no business logic? **Yes** —
      it renders one more decorative element and gains three CSS classes.
- [x] Is any new logic layered `ui/` · `logic/` · `data/`? **N/A** — no
      composable, no data shaping, no state. Adding either would be inventing
      work (Article VIII).

#### II. Dependency Direction (NON-NEGOTIABLE)

- [x] Does any `data/` import from `logic/` or `ui/`? **No** — this feature
      adds no `logic/` or `data/` file at all.

#### III. Feature Isolation (NON-NEGOTIABLE)

- [x] Does anything reach into a feature's internals? **No.** The layout keeps
      importing the shell through `@/features/shell` only; the new components
      live in `app/shared/ui/` and import nothing from a feature.

#### IV. Static-Site Purity (NON-NEGOTIABLE)

- [x] Is `nitro.preset: 'static'` untouched and `server/api/` still absent?
      **Yes.**
- [x] Does the background need compute at request time? **No** — it is CSS in
      the prerendered document (FR-009).
- [x] Does the deployed artifact make a runtime request to a third party?
      **No.** `@nuxt/fonts` downloads at **build** time and emits binaries into
      `.output/public/_fonts`; the artifact is self-contained. The new
      build-time network dependency is recorded in Complexity Tracking and in
      spec A-09 — it is a build input, not a runtime dependency.

#### V. Component Discipline

- [x] `<script setup lang="ts">`, no Options API? **Yes**, both components.
- [x] Presentational, props-in / events-out, no endpoint calls? **Yes** —
      neither component takes a prop or emits anything.
- [x] Under 200 lines? **Yes** — each is under 40, mostly doc comment.
- [x] No client-side state added to something that renders identically every
      load? **Yes** — the rejected registry design is precisely what this
      clause forbids (`research.md` § R1).

#### VI. i18n Parity (NON-NEGOTIABLE)

- [x] Are new locale keys added in both files? **N/A — zero keys.** The
      background and the icon carry no copy; `aria-hidden` decorative elements
      have no accessible name to translate.
- [x] Do both locales get identical treatment? **Yes** — the layout is
      locale-blind, so `/es/*` and `/en/*` receive the same layers by
      construction. Asserted per-route in `tests/static-output.test.ts`.
- [x] Does `tests/i18n-parity.test.ts` stay green? **Yes** — untouched.

#### VII. Design Tokens Discipline

- [x] Zero colour or spacing literals in components? **Yes** — dot colour,
      radius and step, and both stacking levels, are named tokens in
      `global.css` (`data-model.md` §§ 1-2).
- [x] Does hand-written CSS use ramp names, never theme names? **Yes** —
      `var(--ink-100)`, never `var(--color-ink-100)` (`rules.md` § R18); the
      Complexity table records the one file where literal hex is unavoidable
      and why.
- [x] Poppins reserved for the wordmark? **Yes** — the font config declares
      Poppins at 600 only, which is the weight `Wordmark` uses and the only one
      the brand book grants it.

#### VIII. Clean Code Discipline

- [x] No magic numbers? **Yes** — the two stacking levels are named tokens
      because their *relationship* is the requirement.
- [x] No dead code? **Yes** — the four `@font-face` blocks, the TODO and the
      empty `public/fonts/` are deleted rather than left "just in case", and
      `favicon.ico` goes with them.
- [x] No over-engineering? **Yes** — `SectionBackdrop` has no props and exists
      to name one position in the stack; the `glows: GlowPlacement[]` API and
      the registry were both rejected on this clause (`research.md` § R1,
      `contracts/components.md`).
- [x] Names describe intent? **Yes** — `DotGrid`, `SectionBackdrop`,
      `--dot-paper-*`, `--layer-glow`, `--layer-dots`.

#### IX. TypeScript Strict + Biome

- [x] No `any`, no `@ts-ignore`? **Yes** — neither component has a type
      annotation to get wrong.
- [x] Biome remains the only lint/format tool? **Yes** — no ESLint, no
      Prettier; `@nuxt/fonts` brings neither.
- [x] Do `pnpm check` and `pnpm typecheck` pass? **Enforced by the task list
      and by the Husky hooks.**

#### X. Testing Discipline

- [x] Component tests for the new `ui/` components? **Yes** —
      `DotGrid.test.ts` and `SectionBackdrop.test.ts`, naming pattern
      `should <expected> when <condition>`.
- [x] A Storybook story for every component in `app/shared/ui/`? **Yes** —
      `DotGrid.stories.ts`, including the composed four-layer stack over real
      content and the real Hero glow triplet.
- [x] Are the limits of automated verification stated rather than faked?
      **Yes** — `happy-dom` cannot paint, so paint order is verified by story
      plus the artifact assertions, and `research.md` § R7 says so explicitly
      instead of shipping a test that always passes (`rules.md` § R27).
- [x] Do all existing tests stay green **without modification to accommodate
      this feature**? **Required** — SC-012.

#### XI. Configuration & Credential Hygiene (NON-NEGOTIABLE)

- [x] Any new environment variable or secret? **None.** The font provider
      needs no key; nothing new reaches `runtimeConfig`, and no `.env` entry is
      added.
- [x] Any credential in a spec artifact or commit? **None.**

#### XII. Absolute Imports via Alias

- [x] Do all intra-project imports use aliases? **Yes** — the layout imports
      `@/shared/ui/DotGrid.vue`; stories and tests do the same.
- [x] Is any new alias mirrored in `.storybook/main.ts`? **N/A** — no new
      alias. `.storybook/` does gain two files (a manager head for the icon
      and a preview head for the type), which is the same Article XII
      obligation in its documented form: what Nuxt provides, Storybook
      redeclares (`rules.md` §§ R19, R23).

**Result: PASS.** No gate fails. Two items are recorded in Complexity
Tracking as tensions worth a reviewer's eye rather than violations.

## Project Structure

### Documentation (this feature)

```text
specs/006-site-background-and-brand-chrome/
├── spec.md              # requirements, assumptions, D-01
├── plan.md              # this file
├── research.md          # Phase 0 — the paint-order decision, @nuxt/fonts, favicon
├── data-model.md        # Phase 1 — tokens, stacking levels, font set, icon
├── quickstart.md        # Phase 1 — how to verify, in fail-fast order
├── contracts/
│   └── components.md    # Phase 1 — DotGrid, SectionBackdrop, host + section contracts
├── checklists/
│   └── requirements.md  # spec quality checklist
└── tasks.md             # Phase 2 — /speckit.tasks output
```

### Source Code (repository root)

```text
app/
├── shared/ui/
│   ├── DotGrid.vue              # NEW — the dotted paper, one repeating background
│   ├── DotGrid.test.ts          # NEW
│   ├── DotGrid.stories.ts       # NEW — dot layer + the composed 4-layer stack
│   ├── SectionBackdrop.vue      # NEW — per-section glow container
│   ├── SectionBackdrop.test.ts  # NEW
│   └── SectionGlow.vue          # UNCHANGED — consumed, never edited
├── layouts/
│   └── default.vue              # EDIT — stacking context, ink base, clip, <DotGrid />,
│                                #        and the A-03 comment rewritten
└── assets/css/
    └── global.css               # EDIT — +5 tokens; −4 @font-face blocks and the TODO

nuxt.config.ts                   # EDIT — modules += '@nuxt/fonts', fonts{}, app.head.link
package.json                     # EDIT — dependency: @nuxt/fonts

public/
├── favicon.svg                  # REPLACE — muush isotipo, adaptive
├── favicon.ico                  # DELETE
└── fonts/                       # DELETE (empty; the four faces pointed into it)

.storybook/
├── manager-head.html            # NEW — the catalogue's tab icon
└── preview-head.html            # NEW — the catalogue's type (spec A-05)

tests/
└── static-output.test.ts        # EDIT — artifact assertions for fonts, icon, layers

docs/business/
├── branding.md                  # EDIT — correct lines 63-64 (FR-027)
└── rules.md                     # APPEND ONLY — the new rules (FR-028)
```

**Structure Decision**: no new feature module. Everything this feature adds is
either a cross-cutting primitive (`app/shared/ui/`), structural chrome
(`app/layouts/`), project configuration, or a public asset — which is exactly
the split Constitution Article I draws. `app/features/`, `app/pages/` and
`i18n/` are not touched at all.

## Implementation approach

### Part 1 — the background

1. **Tokens first** (`global.css`, `:root`): `--dot-paper-color`,
   `--dot-paper-radius`, `--dot-paper-step`, `--layer-glow`, `--layer-dots`.
   In `:root` and not `@theme inline`, because they are consumed from
   hand-written CSS (`rules.md` § R18).
2. **`DotGrid.vue`** — one element, `aria-hidden`, `pointer-events-none`,
   `absolute inset-0`, `z-index: var(--layer-dots)`, one `radial-gradient` and
   one `background-size`. No props.
3. **`SectionBackdrop.vue`** — one element, `aria-hidden`,
   `pointer-events-none`, `absolute inset-0`, `z-index: var(--layer-glow)`,
   default slot. No props. Its doc comment carries the section contract,
   because that is where a section author will read it.
4. **`app/layouts/default.vue`** — the root becomes the page's single stacking
   context (`relative isolate`), keeps `bg-ink-500` as the bottom layer, gains
   `overflow-x-clip` (not `hidden` — see `research.md` § R3), and renders
   `<DotGrid />` once. The A-03 comment is rewritten to describe the stack and
   to record the flag as resolved.
5. **Stories** — `DotGrid` alone, and *Composed background*: the four layers
   over real content with the real Hero triplet, at both viewports.

Order matters: tokens → components → layout → stories, so nothing is written
against a token that does not exist yet.

### Part 2 — the type

1. `pnpm add @nuxt/fonts`, register the module, configure `families`,
   `defaults.subsets`, `defaults.styles` and `throwOnError: true` — the last
   one so a failed download fails the build instead of silently shipping
   fallback type, which is the exact defect this feature exists to remove.
2. Delete the four `@font-face` blocks, the TODO above them, and
   `public/fonts/`.
3. Run `pnpm generate` and grep the artifact (`quickstart.md` § 2). If the
   faces are not emitted, add `global: true` per family — the documented
   fallback in `research.md` § R4.
4. Add `.storybook/preview-head.html` so the catalogue renders the same two
   families (spec A-05).

### Part 3 — the mark

1. Write `public/favicon.svg` from the geometry in
   `app/assets/logo/README.md` with the `0 0 100 100` + `translate(3, -8)`
   framing `branding.md` documents, an internal `<style>` with the light
   scheme as the default and a `prefers-color-scheme: dark` override for the
   stroke only.
2. Delete `public/favicon.ico`.
3. Declare the icon in `nuxt.config.ts` under `app.head.link`, so every
   prerendered page in both locales carries it.
4. Add `.storybook/manager-head.html`. Verify against the built catalogue —
   Storybook ships its own `favicon.svg`, so the collision at the static root
   must be checked, not assumed.

### Part 4 — documentation and tests

1. Correct `docs/business/branding.md` lines 63-64 in place, dated, without
   rewriting the surrounding section.
2. Append the new rules to `docs/business/rules.md` (never overwrite): the
   paint-order contract and its silent failure mode, the page-absolute →
   section-relative conversion, the catalogue's separate font path, and the
   `@nuxt/fonts` emission path with the verification that proves it.
3. Extend `tests/static-output.test.ts` with the artifact assertions, and add
   the two component tests.

## Complexity Tracking

> Neither row is a constitution violation. Both are trade-offs a reviewer
> should see stated rather than discover.

| Item | Why needed | Simpler alternative rejected because |
|---|---|---|
| **A new runtime dependency (`@nuxt/fonts`) and a build-time network fetch** | It is the only way to self-host from a canonical source without committing binaries: it resolves the exact weights, downloads at build, and emits them into the artifact so the deployed site makes no third-party request (Article IV). Approved by Roberto 2026-09-07. | Committing two `.woff2` files and writing the faces by hand needs no package and no network — but it puts opaque binaries in the repository with no provenance and no update path, and it is what the current broken state already tried. Recorded as the reversal path in spec A-09. |
| **The catalogue loads type from Google's CDN (`.storybook` only)** | Storybook runs Vite outside Nuxt and cannot see the font pipeline (`rules.md` §§ R19, R23); after the hand-written faces are deleted it would otherwise render every story in a fallback typeface, which defeats Article X's visual-review layer. | Committing the binaries for the catalogue alone puts a second, drifting copy of the same fonts in the tree. Leaving the catalogue in fallback type means components are reviewed in type they never ship in. Spec A-05, reversal cost one file. |
| **Literal hex inside `public/favicon.svg`** | A standalone document in `public/` is outside the app's CSS and cannot read a custom property. | There is no alternative; the three brand SVGs in `app/assets/logo/` already carry literals for the same reason, and the values are quoted from `branding.md` with provenance recorded in the file. |
