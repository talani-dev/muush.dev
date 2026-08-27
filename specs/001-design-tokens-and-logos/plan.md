# Implementation Plan: Design tokens and logo assets

**Branch**: `001-design-tokens-and-logos` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-design-tokens-and-logos/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace the placeholder 10-step (50–900) color ramps in
`src/styles/global.css` with the real 5-step (100–500) muush branding-book
values for `red`, `wine`, `ink`, and `bone`, keeping the file's existing
`@import "tailwindcss"` → `:root` custom properties → `@theme inline`
pattern unchanged in structure (only values/step-count change). Bring the
three official isotipo SVG variants (currently living only outside the
project) into a new `src/assets/logo/` directory, renamed to
background-context-first file names (`isotipo-on-bone.svg`,
`isotipo-on-ink.svg`, `isotipo-on-red.svg`) with a colocated mapping
document, so the "pick the right variant per background" rule from
`docs/business/branding.md` is discoverable without a wrapper component or
re-reading the branding doc. No wrapper component, page, header, or logo
instance is added — that's explicitly deferred to the future feature that
places the first real logo instance, per FR-006/FR-007.

## Technical Context

**Language/Version**: TypeScript (strict mode), Astro 7 template syntax, CSS (Tailwind CSS 4 `@theme inline`)
**Primary Dependencies**: Astro 7 (`output: 'static'`), `@tailwindcss/vite` (CSS-first `@theme inline` config, no `tailwind.config.js`), Biome (lint/format), Vitest (unit tests)
**Storage**: N/A — no database, no server-side state
**Testing**: Vitest (existing suite only; no new tests required — see `research.md` § 5)
**Target Platform**: Static site, deployed as plain files (S3 + CloudFront) — no compute
**Project Type**: Single static marketing site (Astro), no frontend/backend split
**Performance Goals**: N/A — no runtime behavior added; three tiny SVGs (<1KB each) and a value-only CSS edit have no measurable performance impact
**Constraints**: Must not add a server runtime or backend (Article I); must not require any component code to change as a result of the token swap (Article IV); must not place a logo instance on any live page (FR-007)
**Scale/Scope**: 1 file edited (`src/styles/global.css`), 1 new directory with 3 renamed SVG files + 1 mapping doc (`src/assets/logo/`) — no pages, layouts, components, islands, or i18n keys touched

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Article | Gate | Status | Notes |
|---|---|---|---|
| I. Static-Site Purity | No server/backend introduced | **PASS** | Pure CSS value edit + static SVG assets; `astro.config.mjs` untouched, no `server/` dir, no API routes |
| II. Astro Component & Island Discipline | Any new component is `.astro`, zero client JS | **PASS (N/A)** | This feature adds no component (see research.md § 3 — wrapper deliberately deferred). Guidance recorded for the future feature: if/when a variant-selector wrapper is built, it must be a static `.astro` component, never a Svelte island, since variant selection by a `background` prop is pure build-time logic |
| III. i18n Parity | Every route exists in both locales; every `ui.ts` key has both locales | **N/A** | No routes, pages, or i18n keys are touched — tokens and logo assets are locale-agnostic |
| IV. Design Tokens Discipline | Components use CSS custom properties, not raw literals; token-value changes require no component code change | **PASS** | This feature *is* the anticipated "branding book replaces placeholder" event Article IV describes. Verified via `grep` that zero components currently reference any `bone-`/`ink-`/`red-`/`wine-` token, so shrinking 10 steps to 5 changes no component code |
| V. TypeScript Strict + Biome | `pnpm check` / `pnpm typecheck` pass | **PASS** | No new `.ts`/`.astro` code. New `.svg`/`.md` files fall outside Biome's parser support (confirmed via `biome.json`) and outside `astro check`'s scope (`.astro`/`.ts` only) |
| VI. Absolute Imports via Alias | Intra-project imports use `@/*` aliases | **N/A** | No import statements are introduced by this feature — the new assets are not yet consumed by any code |
| VII. Testing Discipline | Non-trivial logic in `src/i18n/`/`src/utils/` has unit tests | **PASS (N/A)** | No logic added anywhere; existing Vitest suite must keep passing unmodified (see research.md § 5 for why no new test is added) |
| VIII. Configuration & Credential Hygiene | No `process.env`, no committed credentials | **N/A** | No environment variables or credentials involved |
| IX. Clean Code Discipline | Intent-revealing names, no speculative abstraction | **PASS** | Renaming the SVGs to background-context-first names (`isotipo-on-bone.svg` etc.) fixes a naming-inversion trap in the source files (`muush-dark.svg` is actually used on *light* backgrounds); the wrapper component is deliberately **not** built yet to avoid guessing an API with zero real consumers |

No violations requiring Complexity Tracking justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-design-tokens-and-logos/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md         # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit.specify command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

No `contracts/` directory: this feature has no external interface (no API,
no CLI, no public component contract) — it is a CSS token file and three
static assets with no consumer yet.

### Source Code (repository root)

```text
src/
├── styles/
│   └── global.css              # EDITED: 10-step -> 5-step ramps for red/wine/ink/bone
└── assets/
    └── logo/                   # NEW directory
        ├── isotipo-on-bone.svg # renamed from muush-dark.svg (stroke Ink 500, dot Red 400)
        ├── isotipo-on-ink.svg  # renamed from muush-light.svg (stroke Bone 100, dot Red 400)
        ├── isotipo-on-red.svg  # renamed from muush-triple-white.svg (stroke + dot Bone 100)
        └── README.md           # NEW: background-context -> file mapping (data-model.md table)
```

**Structure Decision**: Single-project Astro static site (already the
project's only structure — no frontend/backend split, no new top-level
directory). This feature adds exactly one new subdirectory,
`src/assets/logo/`, chosen over `public/logo/` because these assets are
meant to be picked by future code based on a background-context prop/import
(FR-006), not fetched by a stable public URL (see research.md § 2). No
`src/components/`, `src/islands/`, `src/layouts/`, `src/pages/`, or
`src/i18n/` files are touched, matching the feature's explicit scope
boundary (FR-007).

## Complexity Tracking

*No entries — no Constitution Check violations to justify.*
