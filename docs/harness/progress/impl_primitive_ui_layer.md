# Implementation summary: primitive_ui_layer (feature 002)

**Status after this work**: implementation complete, ready for review (leader
to move `feature_list.json` status to `reviewing`).

This file replaces the Astro-era summary of the same name. That
implementation was discarded by the 2026-09-06 migration; nothing below
refers to it except where a decision was deliberately carried forward.

All 36 tasks in `specs/002-primitive-ui-layer/tasks.md` are checked off.
`./init.sh` exits **0**, all eight checks green, no `[WARN]` and no `[FAIL]`.

---

## What shipped

Eight Vue SFCs in `app/shared/ui/`, each with a Storybook story and a
component test, plus one story for the design token set. No page, layout,
feature module, i18n key or token value was created or changed.

| Component | Variants | Story | Test |
|---|---|---|---|
| `GlassPanel.vue` | 6 surfaces × 3 paddings × 4 elements | 9 stories | 12 cases |
| `Radar.vue` | 3 sizes | 4 stories | 6 cases |
| `Wordmark.vue` | 2 forms | 3 stories | 5 cases |
| `Lockup.vue` | 2 forms (forwarded) | 3 stories | 7 cases |
| `Pill.vue` | 1 prop (`label`) | 4 stories | 4 cases |
| `BotonPrimario.vue` | 3 sizes, link/button | 6 stories | 11 cases |
| `LinkArrow.vue` | 2 sizes, external | 4 stories | 8 cases |
| `SocialIcon.vue` | 3 networks | 4 stories | 8 cases |
| `tokens.stories.ts` | 20 swatches, 22 type roles | 2 stories | — |

`pnpm test` runs **63 tests in 9 files**, all passing (the i18n parity suite
plus the eight component suites). The catalogue builds with exactly **nine
sidebar entries**, verified from `storybook-static/index.json`:
`Foundations/Design tokens` + `Shared/UI/{BotonPrimario, GlassPanel,
LinkArrow, Lockup, Pill, Radar, SocialIcon, Wordmark}` (SC-004).

The placeholder `Shared/Tokens smoke test` story was deleted, not extended
(FR-048); its job moved to `tokens.stories.ts`.

## Verification performed

- **FR-050 / SC-002 / SC-003 grep gate** — all three commands from
  `quickstart.md` § 4 return **zero matches** across `app/shared/ui/*.vue`.
  Cleaner than the spec budgeted: the two pre-declared exceptions
  (`width: 100%` and `2.6s`) do not match the patterns at all, and two
  incidental matches in explanatory comments (a hex quoted from the design
  file, the phrase "1px border") were reworded so the gate is mechanically
  clean rather than clean-with-footnotes.
- **Utilities actually compile.** Every class the eight components rely on
  was grepped out of the built Storybook stylesheet — `size-radar-sm-halo`,
  `backdrop-blur-glass-red`, `p-glass-tight`, `w-isotipo`, `gap-lockup-gap`,
  `text-wordmark`, `pe-pill-end`, `px-btn-nav-x`, `text-link-lg`,
  `rounded-icon`, `size-social-glyph`, `font-poppins`,
  `focus-visible:outline-red-400`, `group-hover:translate-x-0.5`,
  `motion-reduce:transition-none` — all present. **No token was added.**
- **Spike A (SFC type export)** passed with a negative control: a consumer
  writing `import type { GlassVariant } from '@/shared/ui/GlassPanel.vue'`
  type-checks, and an invalid member fails with TS2322. `types.ts` was
  therefore **not** created (Article VIII).
- **Spike B (`?raw` + `v-html` + `:deep(svg)`)** passed: mounting SocialIcon
  yields inline `<svg>` markup with `currentColor` intact, never an `<img>`.
  The scoped rule compiles to `[data-v-…] svg{width:100%;height:auto}` in
  both the Lockup and SocialIcon chunks.
- **LED ring** compiles to the intended CSS, verified in
  `storybook-static/assets/BotonPrimario-*.css`: three stops
  `var(--red-400) 0% → var(--bone-100) 50% → var(--red-400) 100%`,
  `mask-clip: content-box, border-box` with `mask-composite: exclude` and the
  `-webkit-` companion, `@media (hover: hover)` gating the 2.6s linear spin,
  and `@media (prefers-reduced-motion: reduce)` flattening it to
  `background: var(--red-400); animation: none`. **Zero wine, zero
  JavaScript.**
- **Isotipo stroke** — `Lockup.test.ts` asserts the rendered output contains
  exactly one `stroke-width`, the asset's own `12` in user units, and that
  the template contains neither `stroke` nor `70.5`. The Pencil formula
  appears nowhere in code (FR-023, SC-005).

## Three deviations from the plan — please review

### 1. `research.md` § R3 is wrong about the CSS variable names

The plan, `data-model.md` § 7 and task T016 all specify the LED gradient as
`var(--color-red-400)` / `var(--color-bone-100)`. **Those custom properties
do not exist at runtime in the site build.** `global.css` declares the theme
with `@theme inline`, which substitutes values directly into utilities rather
than referencing them, so a theme variable only reaches `:root` if the content
scan finds it used. Confirmed against `pnpm generate` output
(`.output/public/_nuxt/*.css`): `--red-400:#cf3147` is present and there are
**zero** `--color-*` declarations.

The catalogue would not have caught this: `storybook-static` *does* declare
`--color-red-400` and `--color-bone-100`, and only those two — because
Storybook's Tailwind scan reaches the `specs/` and `docs/` markdown where
those two names are written out as `var(--color-…)`. A ring written as
specified would have looked correct in Storybook and been broken in
production. Rule **R18** records the narrower, true version.

Written as specified, the conic gradient would have resolved to nothing and
the ring would not have painted. Implemented instead with `var(--red-400)`
and `var(--bone-100)`, the `:root` ramp names — which is also what the
pre-migration Astro implementation used. Recorded as **R18** in
`docs/business/rules.md`, because it applies to every hand-written CSS block
in the repository, not just this one.

### 2. Storybook could not compile a single `.vue` file — scope had to widen

`research.md` § R7 confirmed the framework, the story glob and the aliases,
but the placeholder story was pure inline templates, so no `.vue` file had
ever been imported into the catalogue. The first real story failed the build
with `PARSE_ERROR — Unexpected JSX expression` on line 1 of every SFC.

Cause: `@storybook/vue3-vite@10` does **not** contribute `@vitejs/plugin-vue`
— its preset adds only template compilation and docgen, and
`@storybook/builder-vite` expects the SFC plugin to come from the project's
own `vite.config.*`, which this repo does not have because Nuxt owns the Vite
config.

Fix, and the two files it touched outside the declared scope:

- `.storybook/main.ts` — `vue()` registered in `viteFinal` beside
  `tailwindcss()` and the six aliases. Same duty Article XII already imposes
  ("what Nuxt provides, Storybook redeclares"), extended to the SFC compiler.
- `package.json` — `@vitejs/plugin-vue` promoted to an explicit
  `devDependency` at `^6.0.8`. **No new code enters the tree**: 6.0.8 was
  already installed as a transitive dependency of Nuxt's Vite builder, same
  version, same integrity hash in `pnpm-lock.yaml`; it was simply not
  importable from the project root under pnpm's strict layout. Publisher is
  the official `vitejs` org; the plugin already executes on every
  `pnpm dev`/`pnpm generate`.

Without this, Constitution Article X ("every component in `app/shared/ui/`
MUST have a story") is unimplementable and `pnpm storybook:build` fails.
Flagged because both changes are outside the scope `tasks.md` declared.
Recorded as **R19** in `docs/business/rules.md`.

### 3. `research.md` § R9 overstates the Biome result

R9 says `useVueMultiWordComponentNames` produces "no diagnostic" under the
`recommended` preset. It does produce one — an **info** — for each of
`Radar`, `Wordmark`, `Lockup` and `Pill`. R9's operative conclusion still
holds: `biome check --error-on-warnings` exits **0**, because info-level
diagnostics are not promoted. `biome.json` was **not** modified, exactly as
R9 instructed. The four `info` lines in `pnpm check` output are expected, not
a pending defect. Recorded as **R20**.

## Carried forward, not re-decided

- **A-02 · LED on touch devices.** `@media (hover: hover)` kept, so a touch
  device gets the static red-400 ring. `decisions-open.md` #8 is still open,
  owner Clau. The component says so in a comment; reversing it is deleting
  one media query.
- **A-07 · Focus-indicator geometry.** The one value in the spec with no
  design source. All three interactive primitives set
  `focus-visible:outline-red-400` and nothing else, so the platform default
  outline geometry stands, recoloured. **Still UNVERIFIED** — and worth
  noting for Clau that Chrome draws its `outline-style: auto` focus ring with
  its own colour, so the red may not appear there until a geometry is
  specified and `outline-width`/`outline-offset` are set explicitly. Left as
  the spec directed rather than invented.
- **A-11 · Font binaries.** `public/fonts/` is still empty, so every
  specimen and the Wordmark render in a fallback face. Noted in the Wordmark
  story. Out of scope, blocks nothing.
- **A-08 · Glass on glass** is documented in the GlassPanel story and
  enforced at review; a leaf component cannot check its ancestry.

## Two implementation notes a reviewer will notice

- **`LinkArrow` and `SocialIcon` open their template with a `biome-ignore`
  comment.** Biome's `useAnchorContent` cannot see slot content or an
  `aria-label`, so it flags both anchors as errors. The ignore comments carry
  the justification. Consequence: Vue's root vnode for those two is a
  fragment of `[comment, anchor]`. Attribute fallthrough is **unaffected** —
  Vue skips comments when resolving the single root, verified by asserting a
  caller-supplied `class` still merges — but their tests reach for
  `.find('a')` rather than the wrapper, and each test file says why.
- **`LinkArrow` has no `<style>` block.** The pre-migration version carried
  `--arrow-shift: 0.15em`, a magic number with no design source that the
  FR-050 grep would have flagged as a third exception. The hover affordance
  is expressed entirely in utilities instead —
  `group-hover:translate-x-0.5 transition-transform duration-200
  motion-reduce:transition-none hover:underline` — which is both token-based
  and one less file section. Behaviour is unchanged: underline plus a small
  arrow shift, never a background (FR-036).

## Not done, deliberately

- No page, layout, route, feature module, Nav, Footer, card or form
  component. `app/features/`, `app/layouts/` and `app/pages/` are untouched.
- No change to any token value in `app/assets/css/global.css` (FR-006).
- No re-normalizing, re-scaling or relocating of the logo and social SVGs
  (FR-044) — the three glyphs are consumed exactly as feature 1 delivered
  them.
- No `types.ts` barrel, no `index.ts` barrel (Spike A made both unnecessary).
- No visual browsing of the catalogue: T015/T034's "open each on ink, flip to
  bone, toggle the two viewports" was verified **structurally** — nine
  entries, 39 stories, a clean build, and every utility present in the
  emitted CSS — not with human eyes on a browser. A visual pass is a genuine
  reviewer step that remains open.

## Files

Created — `app/shared/ui/`: `GlassPanel`, `Radar`, `Wordmark`, `Lockup`,
`Pill`, `BotonPrimario`, `LinkArrow`, `SocialIcon` (`.vue` + `.stories.ts` +
`.test.ts` each) and `tokens.stories.ts`. 25 files.

Modified — `vitest.config.ts` (`environment: 'happy-dom'`, `include` extended
to `app/shared/ui/**/*.test.ts`), `.storybook/main.ts` (deviation 2),
`package.json` + `pnpm-lock.yaml` (deviation 2), `docs/business/rules.md`
(appended R18–R20), `specs/002-primitive-ui-layer/tasks.md` (tasks checked
off).

Deleted — the placeholder `app/shared/ui/GlassPanel.stories.ts`
(`Shared/Tokens smoke test`), replaced by the real story at the same path.

## Gates

| Gate | Result |
|---|---|
| `pnpm check` | pass (exit 0; 4 expected `info`, see deviation 3) |
| `pnpm typecheck` | pass |
| `pnpm test` | pass — 63 tests, 9 files |
| `pnpm generate` | pass — 8 routes prerendered |
| `pnpm storybook:build` | pass — 9 entries, 39 stories |
| `./init.sh` | **exit 0**, 8/8 checks |
