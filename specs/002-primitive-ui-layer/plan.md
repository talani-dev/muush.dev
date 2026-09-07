# Implementation Plan: Primitive UI layer

**Branch**: `002-primitive-ui-layer` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/002-primitive-ui-layer/spec.md`

## Summary

Build the eight design-system primitives as Vue SFCs in `app/shared/ui/`, each
with a Storybook story and a component test, plus one story rendering the
design token set. Every visual value resolves through tokens feature 1 already
shipped in `app/assets/css/global.css` — **this feature adds no token**,
verified by compiling all 66 candidate utility classes against the real
stylesheet with zero misses (`research.md` § R1).

The technical approach is deliberately boring: static presentational
components, closed string-literal variant unions, a `satisfies Record<…>`
class lookup per variant, and no client-side JavaScript anywhere. The three
places where "boring" needed a decision — inlining SVG under Vite, placing the
LED ring's CSS, and getting a DOM into the test run — were each resolved by
executing the installed tooling rather than by recalling how it behaves.

## Technical Context

**Language/Version**: TypeScript 6.0.3, strict. Vue 3.5.42 SFCs with
`<script setup lang="ts">`.
**Primary Dependencies**: Nuxt 4.5.2 (`srcDir: app/`), Tailwind CSS 4.3.3 via
`@tailwindcss/vite`, Vite 8.2.2 (transitive), Storybook 10.6.0 on
`@storybook/vue3-vite`. **No dependency is added by this feature.**
**Storage**: none. No runtime data, no state, no persistence, no network call.
**Testing**: Vitest 4.1.11 with `@nuxt/test-utils/config`, `@vue/test-utils`
2.5.0 and happy-dom 20.14.0. Storybook is the visual-review layer.
**Target Platform**: static files on S3 + CloudFront. `nitro.preset: 'static'`;
`pnpm generate` writes `.output/public`.
**Project Type**: static marketing site, feature-based + capas architecture.
This feature is entirely inside the cross-cutting `app/shared/ui/` layer.
**Performance Goals**: zero bytes of runtime JavaScript added to any page that
uses these primitives. Every fluid value resolves through `clamp()` with no
breakpoint and no layout-shifting measurement.
**Constraints**: no colour or size literal in component markup; no breakpoint
for a size; no server; no i18n key; no change to any existing token value.
**Scale/Scope**: 8 components, 9 story files, 8 test files, 1 config line
change. 19 variant renderings across the eight. Two component-to-component
dependencies total.

## Constitution Check

*GATE: passed before Phase 0 research; re-checked after Phase 1 design.*

Derived from `.specify/memory/constitution.md` **v2.0.0** (ratified
2026-08-26, last amended 2026-09-06).

### Phase -1: Pre-Implementation Gates

#### Article I — Feature-Based + Capas Architecture

- [x] Does every new file land in a directory the architecture defines?
      Yes: `app/shared/ui/` is the named home for "the design-system
      primitives" as cross-cutting reusables. No file lands in
      `app/features/`, `app/layouts/`, `app/pages/` or `app/middleware/`.
- [x] Is `app/shared/` being used for genuinely cross-cutting reusables and
      not as a dumping ground for one feature's logic?
      Yes: the shell, the landing, the About page and both forms all compose
      these eight. Feature 3 is already blocked on them.

#### Article II — Dependency Direction (NON-NEGOTIABLE)

- [x] Does every import point in the permitted direction?
      Yes, vacuously and by construction. This feature creates no `logic/` or
      `data/` layer, so there is no `data → logic` or `logic → ui` import to
      get backwards. The only imports are `ui → ui` (Pill → Radar, Lockup →
      Wordmark) and `ui → assets`.

#### Article III — Feature Isolation (NON-NEGOTIABLE)

- [x] Does any file import another feature's internals?
      No. Nothing here imports `app/features/**` at all — the layer is a leaf.
- [x] Is anything being lifted to `app/shared/` prematurely?
      No. Every one of the eight has at least two known consumers documented in
      `design-extract.md` (13 glass panels, 11 pills, 8+ radars, 4 wordmarks,
      3 buttons, 4 link arrows, 3 social buttons).

#### Article IV — Static-Site Purity (NON-NEGOTIABLE)

- [x] Does the solution avoid any server route or backend dependency?
      Yes. No `server/api/`, no runtime config read, no fetch. `pnpm generate`
      remains the deployable artifact.
- [x] Does it avoid anything requiring compute at request time?
      Yes. Stronger than required: this layer ships **zero client-side
      JavaScript**. The LED animation is CSS (`research.md` § R3), the radar is
      three nested elements, and no component has a handler, a `ref` or an
      `onMounted`.

#### Article V — Component Discipline

- [x] Is every component a Vue SFC using `<script setup lang="ts">`?
      Yes, all eight. Options API appears nowhere.
- [x] Are `ui/` components presentational — props in, events out, no direct
      endpoint calls?
      Yes. None of the eight emits an event or calls anything.
- [x] Is complex logic in a composable rather than inlined in `<script setup>`?
      No composable is needed: the heaviest logic in the layer is a
      `Record` lookup. Creating a `logic/` layer to hold it would violate
      Article VIII.
- [x] Is every component under 200 lines?
      Budgeted: the largest is BotonPrimario at ~90 lines including its scoped
      `<style>`. Enforced at review.

#### Article VI — i18n Parity (NON-NEGOTIABLE)

- [x] Does every route resolve in both locales?
      No route is added or changed, so parity is unaffected.
- [x] Does every `es.json` key have an `en.json` counterpart?
      **No key is added by this feature.** `tests/i18n-parity.test.ts` keeps
      passing untouched. The gate is satisfied **vacuously and deliberately**,
      not skipped: these primitives are locale-agnostic by construction —
      every visible string arrives from the caller (FR-005), which is what
      makes one instance serve both `/es/` and `/en/`.
- [x] Is any user-facing string hardcoded in a component?
      One set, deliberately: the Wordmark's `muush` / `.` / `dev`. Those are
      brand identity, not copy, and locale-invariant (`messaging.md` rule 6:
      muush always lowercase). Recorded in `contracts/components.md`.

#### Article VII — Design Tokens Discipline (the load-bearing gate here)

- [x] Does every colour and spacing value go through a CSS custom property?
      Yes. All 66 utility classes were compiled against the real `global.css`
      and **zero were missing** (`research.md` § R1) — so there is no value
      this layer needs that a token does not already provide.
- [x] Is any hex, `oklch`, or arbitrary bracketed utility present?
      No. FR-050's grep gate proves it mechanically; the command is in
      `quickstart.md` § 4. Two legitimate matches (`width: 100%` for injected
      SVG, `2.6s` for the LED duration) are pre-declared there — neither is a
      colour or a spacing value.
- [x] Does any component reach for a breakpoint to change a size?
      No. The fluid `clamp()` roles carry the 390 ↔ 1440 difference; a
      breakpoint for a font size or padding would be a signal the token is
      missing, and none is.
- [x] Is Poppins confined to the logo and wordmark?
      Yes. `font-poppins` appears in `Wordmark.vue` and nowhere else.
- [x] Does the feature change any existing token value?
      No (FR-006). `global.css` is not modified at all.

#### Article VIII — Clean Code Discipline

- [x] Are names intent-revealing, with no generic `data`/`info`/`temp`?
      Yes. Variant names come from the design vocabulary.
- [x] Is any logic duplicated in 2+ places?
      No. The glass recipe lives in one map; the isotipo geometry lives in one
      asset (which is why it is imported, not retyped — `research.md` § R2).
- [x] Any dead code, unused export, or speculative abstraction?
      No. The placeholder story is **deleted**, not left beside its
      replacement. No barrel `index.ts` and no shared `types.ts` are created
      up front — both are named as fallbacks with a trigger condition, not
      built on speculation.
- [x] Any magic number?
      No. Every number is a named token; the two exceptions above are declared.
- [x] Is any new prop invented beyond what a consumer asked for?
      No. `contracts/components.md` § "Deliberately NOT in this contract"
      enumerates the rejected ones.
- [x] Is any new dependency or build tool added?
      No. A Vite SVG plugin was considered for `research.md` § R2 and rejected
      precisely on this article — new build-time infrastructure with its own
      supply-chain surface, to solve a four-file problem, plus a second place
      to keep in sync with Storybook.

#### Article IX — TypeScript Strict + Biome

- [x] Is every file TypeScript in strict mode, with no `any`?
      Yes. Variant unions are string literals; the `?raw` imports are typed
      `string` by `vite/client` (`research.md` § R2).
- [x] Any `@ts-ignore`?
      None planned. `@ts-expect-error` with a reason only if unavoidable.
- [x] Are ESLint/Prettier still absent and Biome the only tool?
      Yes. `biome.json` is not modified — verified by execution that
      `useVueMultiWordComponentNames` is not in the `recommended` preset, so
      `Radar.vue`, `Wordmark.vue`, `Lockup.vue` and `Pill.vue` keep their
      contract names without a config exception (`research.md` § R9).
- [x] Will `pnpm check` and `pnpm typecheck` pass before commit?
      Required by SC-010 and by the Husky pre-commit hook. Baseline confirmed
      green before starting.

#### Article X — Testing Discipline

- [x] **Does every component in `app/shared/ui/` have a Storybook story?**
      Yes — all eight, plus a ninth story for the token set (FR-046, FR-047).
      This is the article's explicit MUST and the primary review artifact for
      a feature that puts nothing on a page.
- [x] Do `ui/` components have component tests verifying rendering given
      props? (layer 2)
      Yes — eight test files (FR-051), asserting variant maps and structural
      invariants. See the note below: this is an addition beyond the
      originating task description, flagged for the approval gate.
- [x] Do unit tests cover pure logic in `logic/` and `utils/`? (layer 1)
      Not applicable — this feature creates no `logic/` and no `utils/`. The
      one candidate for a unit test, the isotipo stroke computation, **does not
      exist by design** (FR-023): the browser does it.
- [x] Do test names follow `should <expected> when <condition>`?
      Yes, enforced at review.
- [x] Does any test depend on another test's state?
      No. Each mounts its own component.
- [x] Is E2E correctly absent?
      Yes. Article X puts it out of scope repository-wide.

#### Article XI — Configuration & Credential Hygiene (NON-NEGOTIABLE)

- [x] Is any environment variable read outside `runtimeConfig`?
      None is read at all. `process.env` appears nowhere in this feature.
- [x] Is any credential value written to source control?
      None exists in this feature. No key, token, endpoint or URL secret is
      involved — the only URLs are public social profiles, supplied by the
      caller as props, not embedded.
- [x] Is `.env.example` still accurate?
      Unchanged; this feature adds no variable.

#### Article XII — Absolute Imports via Alias

- [x] Does every intra-project import use an alias?
      Yes. Both asset imports go through `@/assets/...` (verified resolvable in
      `.nuxt/tsconfig.app.json`). The two component-to-component imports —
      Pill → Radar and Lockup → Wordmark — are **same-directory**, which the
      article explicitly permits.
- [x] Are any new aliases added, and if so mirrored in `.storybook/main.ts`?
      No alias is added, so nothing needs mirroring. Verified that
      `vitest.config.ts` inherits the aliases from the Nuxt config
      automatically and does not need them redeclared (`research.md` § R8).

### Result

**PASS** — all twelve articles satisfied. One item is recorded in Complexity
Tracking below: the single change outside `app/shared/ui/`.

> **Amended 2026-09-06, during implementation.** A second row was added to
> Complexity Tracking: Storybook cannot compile a `.vue` file without
> `@vitejs/plugin-vue`, which neither the framework nor this repository
> supplies. That makes three files outside `app/shared/ui/`, not one.
> Article VIII's "no new dependency" answer above changes from "no" to "one,
> already present in the tree as a transitive dependency of Nuxt, promoted to
> an explicit devDependency"; Article XII's "no alias added, so nothing needs
> mirroring" is unchanged, but the mirroring duty it describes turned out to
> extend to the SFC compiler as well. Both are justified in the table.

**Re-checked after Phase 1 design**: unchanged. The design added no dependency,
no token, no alias and no runtime code path. The only delta from the pre-Phase-0
evaluation is that Articles VII and IX moved from "expected to pass" to
"verified by executing the tooling" (`research.md` §§ R1, R9).

## Project Structure

### Documentation (this feature)

```text
specs/002-primitive-ui-layer/
├── spec.md                    # Requirements (/speckit.specify)
├── plan.md                    # This file (/speckit.plan)
├── research.md                # Phase 0 — the resolved mechanics, with evidence
├── data-model.md              # Phase 1 — variant sets → token classes
├── quickstart.md              # Phase 1 — build order, grep gates, review flow
├── contracts/
│   └── components.md          # Phase 1 — the eight prop surfaces
├── checklists/
│   └── requirements.md        # Spec quality validation
└── tasks.md                   # Phase 2 (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
app/
├── assets/
│   ├── css/global.css              # READ ONLY — every token comes from here
│   ├── logo/isotipo-on-ink.svg     # READ ONLY — consumed by Lockup via ?raw
│   └── social/*.svg                # READ ONLY — consumed by SocialIcon via ?raw
├── shared/
│   └── ui/                         # ← the entire feature lives here
│       ├── GlassPanel.vue      .stories.ts   .test.ts
│       ├── Radar.vue           .stories.ts   .test.ts
│       ├── Wordmark.vue        .stories.ts   .test.ts
│       ├── Lockup.vue          .stories.ts   .test.ts
│       ├── Pill.vue            .stories.ts   .test.ts
│       ├── BotonPrimario.vue   .stories.ts   .test.ts
│       ├── LinkArrow.vue       .stories.ts   .test.ts
│       ├── SocialIcon.vue      .stories.ts   .test.ts
│       └── tokens.stories.ts       # Foundations/Design tokens — not a component
├── features/                       # UNTOUCHED
├── layouts/                        # UNTOUCHED
└── pages/                          # UNTOUCHED

vitest.config.ts                    # environment + include (the one exception)

.storybook/main.ts                  # UNTOUCHED — no alias added
.storybook/preview.ts               # UNTOUCHED — backgrounds/viewports consumed
nuxt.config.ts                      # UNTOUCHED
biome.json                          # UNTOUCHED — verified no exception needed
i18n/                               # UNTOUCHED — no key added
```

**Structure Decision**: everything lands in `app/shared/ui/`, the
constitution's named location for cross-cutting design-system primitives
(Article I). Stories and tests are **colocated** beside their component rather
than gathered in a parallel tree — Storybook's existing glob
(`../app/**/*.stories.@(ts|tsx)`) already assumes it, and colocation is what
makes "delete the component, delete its story and test" a single directory
operation instead of a three-directory hunt.

The token story is the one file in `app/shared/ui/` that is not a component or
its satellite. It is named `tokens.stories.ts` in lowercase precisely because
Article VIII reserves PascalCase for components — the filename itself says
"not a component" — and it is titled `Foundations/Design tokens` so it sorts
into its own sidebar group rather than reading as a ninth primitive.

## Implementation Approach

Five decisions carry the feature. Each is derived and evidenced in
`research.md`; the summary is here.

1. **Consume the tokens, add none** (§ R1). All 66 utility classes were
   compiled against the real `global.css` with zero misses. `text-<role>`
   emits size, line-height, tracking and weight together, so a component
   states typographic intent once.
2. **Inline SVG with `?raw` + `v-html` + `:deep(svg)`** (§ R2). No new
   dependency. `currentColor` resolves because the markup is inline, which is
   the entire point of the normalization (`rules.md` § R8). The wrapper is
   `aria-hidden`, so the asset's own `<title>` never competes with the
   caller's accessible name.
3. **LED ring: document-level at-rules stay global, the masked `::before`
   goes scoped** (§ R3). Verified by compiling the scoped CSS that
   `::before`, `:hover::before` and both media queries survive Vue's
   transform. `mask-composite: exclude` is required — the simpler
   `background-clip` trick fails against a translucent fill.
4. **Destructured props with defaults, unions exported per component**
   (§ R5). Verified by compiling an SFC that Vue 3.5.42 turns
   `const { padding = 'default' } = defineProps<…>()` into a real runtime
   default, and that `export type` hoists out of `setup()`. `withDefaults` is
   the pre-3.5 workaround and is not used.
5. **One global `happy-dom` environment for tests** (§ R8). Forced by two
   facts discovered in the installed packages: `defineVitestConfig` *throws*
   on `projects`, and Vitest 4 removed `environmentMatchGlobs`. The aliases
   and the Vue plugin come from the Nuxt config automatically.

Build order, the grep gates, the Storybook review flow and the two things to
verify on the first component are all in `quickstart.md`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| One file changed outside `app/shared/ui/`: `vitest.config.ts` (`environment: 'node'` → `'happy-dom'`, and one glob added to `include`) | Article X layer 2 requires component tests for `ui/` components, and a component test needs a DOM. The current config runs a Node environment over `tests/` only, so no test under `app/shared/ui/` would even be collected. | **`test.projects`**: `defineVitestConfig` throws on it outright (`research.md` § R8, source line 200). **`environmentMatchGlobs`**: removed in Vitest 4, no occurrence in the installed `vitest/dist`. **A per-file `// @vitest-environment happy-dom` docblock**: works, but repeats in eight files a thing that should be configured once — Article VIII. **Skipping component tests entirely**: would leave Article X layer 2 unmet with no justification, and would make acceptance criterion 9 (`pnpm test` passes) vacuous for this feature. |
| **Added during implementation, 2026-09-06.** Two further files outside `app/shared/ui/`: `.storybook/main.ts` registers `vue()` in its `viteFinal`, and `@vitejs/plugin-vue@^6.0.8` becomes an explicit `devDependency` (with the matching `pnpm-lock.yaml` entry). | Without the SFC compiler, **every** `.vue` import inside a story fails with `PARSE_ERROR — Unexpected JSX expression` on line 1 and `pnpm storybook:build` exits non-zero, which makes Article X's "every component in `app/shared/ui/` MUST have a story" unimplementable and fails SC-004 and SC-010. `@storybook/vue3-vite@10.6.0`'s `viteFinal` returns only `templateCompilation()` and a docgen plugin — neither compiles SFC source — and `@storybook/builder-vite` expects `@vitejs/plugin-vue` to arrive from the project's own `vite.config.*`, which this repository does not have because Nuxt owns the Vite config. `research.md` § R7 confirmed the framework, the glob and the aliases, but the placeholder story was pure inline templates, so no SFC had ever been imported and the gap was invisible until the first real story. Verified at source by the reviewer, not inferred from the error message. | **Leaving `.storybook/main.ts` untouched**: not an option — the catalogue is the only review surface for a feature that puts nothing on a page, and the build gate is mandatory. **Adding a root `vite.config.ts`** so `builder-vite` picks the plugin up implicitly: still requires the same dependency, and adds a second Vite config for Nuxt to warn about. **Resolving the plugin through a deep `node_modules/.pnpm/...` path** to avoid touching `package.json`: version-hashed, breaks on any reinstall. **The dependency itself is not new code**: `@vitejs/plugin-vue@6.0.8` was already installed as a transitive dependency of Nuxt's Vite builder — same version, same integrity hash in the lockfile, already executing on every `pnpm dev` and `pnpm generate`; promoting it only makes it importable from the project root under pnpm's strict layout. Publisher is the official `vitejs` org. Recorded as **R19** in `docs/business/rules.md`. |

### Note for the approval gate

The component-test requirement (FR-051, spec A-12) is an **addition beyond the
originating task description**, which listed the eight components, their
stories and the placeholder replacement. It was added to satisfy Article X
layer 2 rather than claim an exemption, and it was — at planning time — the
sole reason this feature touched a file outside `app/shared/ui/`. (It stopped
being the sole reason during implementation; see the second Complexity
Tracking row.) If the intent was Storybook-only,
trimming FR-051 removes the eight `.test.ts` files, the `vitest.config.ts`
change and this Complexity Tracking row, and leaves the rest of the plan
intact.

Two further items are decisions carried forward rather than made here, and are
flagged in `spec.md` and `quickstart.md` § 8: **A-02** (LED on touch devices —
`decisions-open.md` #8 is still open, owner Clau, the pre-migration default is
carried forward unchanged and is reversible by deleting one media query) and
**A-07** (focus-indicator geometry — no design source exists at all).
