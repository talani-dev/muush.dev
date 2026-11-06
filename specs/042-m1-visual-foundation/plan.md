# Implementation Plan: Muush 1.0 visual foundation (tokens, primitives, animated backgrounds)

**Branch**: `feat/v2-visual-foundation` (from `muush-v2`, merges back into `muush-v2`) | **Date**: 2026-10-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/042-m1-visual-foundation/spec.md`

> **Naming reorganization approved by Roberto 2026-11-01.** File, token,
> utility, component and story names below are the final, unprefixed ones;
> see `spec.md` and `docs/harness/progress/impl_42_naming.md`.

## Summary

Port the Muush 1.0 handoff tokens into `app/assets/css/global.css` as a new
`--*` family exposed through Tailwind v4 `@theme inline`, with the `.pen`
overrides from the leader's extract (hero 96 px, p-grande 17 px, three new
heading sizes). Add Poppins 500 to the self-hosted fonts. Build seven Vue SFCs
in `app/shared/ui/` (glass surface, pill, rotating pill, primary button, glass
button, two-tone heading, shader background), with their logic in
`app/shared/logic/` composables, pure helpers in `app/shared/utils/`, and
static presets in `app/shared/data/`. Ship the two GLSL shaders and six
posters from `app/assets/`. Switch the page canvas to Negro 950, and recolour
the spotlight's lit dots and the brand cursor to Red muush 500 with no
behaviour change. No page, section, nav or footer changes. Details:
[research.md](./research.md), [data-model.md](./data-model.md),
[contracts/components.md](./contracts/components.md),
[quickstart.md](./quickstart.md).

## Technical Context

**Language/Version**: TypeScript (strict) · Vue 3.5 `<script setup lang="ts">` · Nuxt 4.5 (`srcDir: app/`)
**Primary Dependencies**: Tailwind CSS 4.3 (`@tailwindcss/vite`), `@nuxt/fonts` 0.14, `@nuxtjs/i18n` 10. **No new dependency.** WebGL 1 is a browser API.
**Storage**: N/A
**Testing**: Vitest 4 + Vue Test Utils + happy-dom (unit and component); Storybook 10 (`@storybook/vue3-vite`) for visual review; build-output tests in `tests/`
**Target Platform**: Static site (`nitro.preset: 'static'`, `pnpm generate` → `.output/public`) on S3 + CloudFront; evergreen browsers
**Project Type**: Static web site (single Nuxt project)
**Performance Goals**: Backgrounds draw zero frames offscreen or with the tab hidden; DPR ≤ 1 below 768 px and ≤ 1.5 above; one shader bundled per page that uses it; hero poster eager and high priority
**Constraints**: Article IV (no server), Article VII (no literals in components, v1 tokens banned in new code), components < 200 lines, logic in composables, 390/1440 anchors
**Scale/Scope**: ~70 tokens, 7 components, 4 composables and helpers, 2 data modules, 8 assets, ~14 test files, ~9 story files; 4 existing tests updated

## Constitution Check

*GATE: must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Phase -1: Pre-Implementation Gates

#### I. Feature-Based + Capas architecture
- [x] Primitives live in `app/shared/ui/`, composables in `app/shared/logic/`, presets and types in `app/shared/data/`, pure helpers in `app/shared/utils/`. They are genuinely cross-cutting: 43–46 all consume them.
- [x] No feature module is created or edited. `app/layouts/default.vue` changes one class only (structural chrome).

#### II. Dependency direction (NON-NEGOTIABLE)
- [x] `ui/` → `logic/` and `data/`; `logic/` → `data/` and `utils/`; `data/` imports only assets and types. No `logic/` → `ui/` import.

#### III. Feature isolation (NON-NEGOTIABLE)
- [x] Nothing reaches into a feature's internals; the only consumer edited is the layout, which already imports `@/shared/...`.

#### IV. Static-site purity (NON-NEGOTIABLE)
- [x] No `server/` route, no runtime dependency, no request-time compute. WebGL runs in the visitor's browser after mount; the prerendered HTML holds the poster.
- [x] Fonts stay build-time self-hosted; no `fonts.googleapis.com` import (checked by test and in `.output/public`).
- [x] Shaders and posters are bundled from `app/assets/`; nothing is served from `docs/`.

#### V. Component discipline
- [x] All SFCs use `<script setup lang="ts">`; every component is planned under 200 lines (largest: `PrimaryButton` ≈ 120, `ShaderBackground` ≈ 90).
- [x] WebGL lifecycle, rotation timing and reduced-motion tracking live in composables, not in `<script setup>`.
- [x] Interactivity is opt-in: only the rotating pill and the shader background carry client state, and both render a correct static first state.

#### VI. i18n parity (NON-NEGOTIABLE)
- [x] No user-facing string in any primitive: copy arrives as props. No locale key is added or removed; `tests/i18n-parity.test.ts` stays green.
- [x] Both locales are covered in stories (ES and EN args from `muush-1.0.md` § 4).

#### VII. Design tokens discipline
- [x] Every visual value is an `--*` token in `global.css`, consumed as an unprefixed utility or via `var()` in scoped CSS; zero hex/rgb/px in components (automated scan, `tests/token-literals.test.ts`).
- [x] New code uses no `--bone-*`, `--ink-*`, `--red-*`, `--wine-*` (same scan). The v1 families stay untouched for v1 code until 47.
- [x] Fluid `clamp()` scale anchored at 390/1440 (research R4); breakpoints are used only for the two discrete changes the `.pen` draws (icon shown/hidden, mobile vs desktop button metrics at `lg`).
- [x] Poppins 500 for headings, Instrument Sans for everything else.

#### VIII. Clean code
- [x] Named constants for 2600 ms, 768 px, 1/1.5 DPR, 12 s still time and shader defaults; functions ≤ ~30 lines (the renderer splits compile, link and draw).
- [x] No speculative abstraction: presets cover exactly the README's seven uses; no shader beyond the two used.

#### IX. TypeScript strict + Biome
- [x] Strict types for presets and props; no `any` (WebGL handles typed); `pnpm check` and `pnpm typecheck` gate.

#### X. Testing discipline
- [x] Unit tests for every composable and pure helper; component tests for all seven components; a story for every new `app/shared/ui/` component; names follow `should … when …`.

#### XI. Configuration and credential hygiene (NON-NEGOTIABLE)
- [x] No environment variable, secret or credential involved.

#### XII. Absolute imports via alias
- [x] Imports use `@/shared/...` and `@/assets/...`; relative imports only within the same directory (for example a story importing its sibling component, per repo precedent).

**Result: PASS.** No violation needs Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/042-m1-visual-foundation/
├── spec.md
├── plan.md                  # this file
├── research.md              # R1–R19
├── data-model.md            # tokens, presets, state machines
├── quickstart.md            # verification steps
├── contracts/components.md  # props and composable signatures
├── checklists/requirements.md
└── tasks.md                 # /speckit-tasks
```

### Source code (repository root)

```text
app/
├── assets/
│   ├── css/global.css                     # EDIT: v2 :root block, @theme inline v2 block,
│   │                                      #   borde-luz utilities, reduced-motion v2 durations,
│   │                                      #   html canvas → --negro-950, --dot-paper-lit-color → v2
│   ├── shaders/liston.glsl                # NEW (copied from docs/handoff/…/shaders; static grain since 2026-11-01, R8)
│   ├── shaders/acanalado.glsl             # NEW (copied; static grain since 2026-11-01, R8)
│   ├── backgrounds/*.webp                 # NEW (6 posters copied from docs/handoff/…/posters)
│   └── icons/arrow-right.svg (+ README)   # NEW lucide glyph; README entry added
├── layouts/default.vue                    # EDIT: bg-ink-500 → bg-negro-950 (+ doc comment)
└── shared/
    ├── data/
    │   ├── glassPresets.ts                # NEW
    │   └── backgroundPresets.ts           # NEW (+ .test.ts)
    ├── logic/
    │   ├── useReducedMotion.ts            # NEW (+ .test.ts)
    │   ├── useRotatingText.ts             # NEW (+ .test.ts)
    │   ├── shaderRenderer.ts              # NEW (+ .test.ts)
    │   └── useShaderCanvas.ts             # NEW (+ .test.ts)
    ├── utils/shaderFrame.ts               # NEW (+ .test.ts)
    └── ui/
        ├── GlassSurface.vue  (+ .stories.ts, .test.ts)
        ├── Pill.vue          (+ .stories.ts, .test.ts)
        ├── RotatingPill.vue  (+ .stories.ts, .test.ts)
        ├── PrimaryButton.vue (+ .stories.ts, .test.ts)
        ├── GlassButton.vue   (+ .stories.ts, .test.ts)
        ├── Heading.vue       (+ .stories.ts, .test.ts)
        ├── ShaderBackground.vue (+ .stories.ts, .test.ts)
        └── tokens.stories.ts
nuxt.config.ts                             # EDIT: Poppins weights [500, 600] + comment
public/cursor/you.svg                      # EDIT: #CF3147 → #E5352F (3 occurrences) + comment
.storybook/preview.ts                      # EDIT: 'negro' (#050505) background option
tests/
├── design-tokens.test.ts                      # NEW
├── token-literals.test.ts                    # NEW
├── static-output.test.ts                  # EDIT: canvas token, layout-root class, Poppins 500 face
├── brand-cursor.test.ts                   # EDIT: compare against --red-muush-500
└── spotlight-red-dots-tokens.test.ts      # EDIT: lit colour var(--red-muush-500)
```

**Structure decision.** Shared design-system layer only (`app/shared/*`),
following feature 2's precedent for primitives and feature 8's for a
shared composable plus its component. Assets go under `app/assets/` so Vite
hashes and bundles them (research R8).

## Implementation notes per area

1. **Tokens** (research R1–R4, data-model § 1). Add the `:root` "Muush 1.0"
   block after the v1 `:root`, with a header comment naming the sources and
   the two `.pen` overrides inline. Add the `@theme inline` v2 block after the
   v1 one. Add `--rapido/-medio/-lento: 0ms` inside the existing
   reduced-motion `:root` block. Add `@utility borde-luz` plus the four
   edge utilities (research R6).
2. **Canvas** (R16). Two one-line edits plus their comments; update the three
   test sites.
3. **Fonts** (R5). `weights: [500, 600]`; rewrite the config comment (v2:
   Poppins 500 headings, 600 kept for v1 until 47); add the test row.
4. **Primitives** (contracts §§ 1–6). Class strings come from static lookup
   tables (complete class names so Tailwind's scanner finds them). Gradient
   fills via `bg-(image:--btn-fondo)`; durations via
   `duration-(--rapido)` and `ease-muush`. Buttons share no base component:
   the two files differ in fill, edge, icon and sizes, and a shared base would
   be a premature abstraction for two callers (Article VIII).
5. **Background** (R7–R11, contract § 7). Build in this order:
   `shaderFrame.ts` (pure) → `shaderRenderer.ts` → `useReducedMotion` →
   `useShaderCanvas` → `backgroundPresets.ts` → `ShaderBackground.vue`.
6. **Rotating pill** (R12–R13). `useRotatingText` then `RotatingPill.vue`
   composing `Pill` through its default slot.
7. **Cursor and spotlight** (R17). Token edit, SVG recolour, two test pins.
   No change to `CursorSpotlight.vue`, `useCursorSpotlight.ts` or the cursor
   rules.
8. **Storybook** (R18). `negro` background; every v2 story meta sets it.

## Risks

| Risk | Mitigation |
|---|---|
| `bg-(image:--x)` / `duration-(--x)` syntax not emitted by 4.3.3 | Verify on the first `pnpm generate` (R2). Fallback: a scoped `<style>` rule with `var()`, which Article VII also allows. |
| happy-dom has no WebGL, so the render path is untested in Vitest | The renderer is tested against a hand-written `WebGLRenderingContext` stub for call order and failure handling; real rendering is reviewed in Storybook (quickstart § 8). |
| Fluid line-heights drift between anchors | Anchors are exact by construction; the in-between latitude is allowed (Article VII). |
| Sections whose mobile heading is 30, 32 or 34 px (pen extract § 8) | Out of this scale by decision; features 44 and 46 own those per-use overrides. |
| The darker canvas changes how v1 sections look on `muush-v2` | Expected and stated in the spec ("What changes visually"); production is untouched until 47. |

## Post-design Constitution re-check

Re-evaluated after research, data model and contracts: **PASS**, no change.
No Complexity Tracking entries.

## Complexity Tracking

None.

## Agent context

The plan template asks to update a `<!-- SPECKIT START -->` block in
`CLAUDE.md`. That file has no such block, and the spec author may not edit
files outside `specs/`, `docs/harness/progress/`, `docs/harness/findings.md`
and `feature_list.json`, so it was not touched.
