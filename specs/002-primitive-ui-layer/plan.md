# Implementation Plan: Primitive UI layer

**Branch**: `002-shared-ui-components` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-primitive-ui-layer/spec.md`

## Summary

Append a fluid type and surface scale to `src/styles/global.css` — 22 type
roles and 24 spacing/radius/blur tokens, each a `clamp()` interpolating between
the 390px and 1440px design frames — then build the eight static `.astro`
primitives that consume it, plus the three normalized social glyph assets.

The organizing idea: **the desktop/mobile difference lives in the token, not in
the component.** A section author writes `text-display` once and gets 98px at
1440px and 46px at 390px; no primitive in this layer contains a sizing media
query. The only media queries that ship are `prefers-reduced-motion` and
`hover: hover`, both on the LED border, both behavioural rather than
dimensional.

Feature 001 delivered the colour ramps, the two font families and the three
isotipo assets but placed nothing on a page. This feature is the same shape one
level up: it delivers the vocabulary, mounts none of it. Nav, hero, cards and
forms come later and consume `contracts/components.md`.

Two findings from Phase 0 shaped the design materially:

1. **The isotipo stroke-width formula is free.** `12 × width ÷ 70.5` is exactly
   what SVG viewBox scaling already does (verified: 8.851 at 52px, 6.809 at
   40px, matching the design's 8.85 and 6.8). Lockup therefore sets a width and
   nothing else — no computation, no `src/utils/` helper, and consequently no
   new unit test.
2. **The LED ring cannot use the common `background-clip` trick**, because the
   button's fill is 65% opaque and the conic layer would show through the
   middle. It uses a `mask-composite: exclude` ring on a `::before` with an
   `@property`-registered angle instead — still zero JavaScript, and it
   degrades to a static ring where `@property` is unsupported, which is the
   exact fallback `ui-map.md` § 10 already documents.

## Technical Context

**Language/Version**: TypeScript strict (`astro/tsconfigs/strict`), Astro 7.2.8 component syntax, CSS (Tailwind CSS 4.3.3 `@theme inline`)
**Primary Dependencies**: Astro 7 (`output: 'static'`), `@tailwindcss/vite` (CSS-first config — there is no `tailwind.config.js`), Biome 2.5.10, Vitest 4
**Storage**: N/A — no database, no server-side state, no client-side state
**Testing**: Vitest (existing `tests/i18n-utils.test.ts` only; no new test — see `research.md` § R6), plus the manual verification steps in `quickstart.md`
**Target Platform**: Static site, plain files on S3 + CloudFront — no compute
**Project Type**: Single static marketing site (Astro), no frontend/backend split
**Performance Goals**: Zero added JavaScript bytes. Three SVGs under ~2KB each after normalization. The LED animation animates one registered custom property on a compositor-friendly gradient and runs only while hovered
**Constraints**: No server runtime (Article I) · no island, no `<script>`, no `client:*` (Article II) · no colour/size literal in component markup (Article IV) · nothing under `src/pages/`, `src/layouts/`, `src/islands/`, `src/i18n/` may be created or modified (FR-037, FR-038) · `src/styles/global.css` is append-only, no feature-001 value changes (FR-008)
**Scale/Scope**: 1 CSS file appended · 1 config line added · 8 new `.astro` components · 3 normalized SVGs + 1 README · 0 pages, 0 layouts, 0 islands, 0 i18n keys, 0 new dependencies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — result unchanged, noted per row.*

| Article | Gate | Status | Notes |
|---|---|---|---|
| **I. Static-Site Purity** (NON-NEGOTIABLE) | No server runtime, no backend, no API route; `output: 'static'` untouched | **PASS** | `astro.config.mjs` is not modified. Nothing added needs compute: the fluid scale is CSS, the components render at build time, the LED ring is a CSS animation. `dist/` stays plain files. Re-check after Phase 1: the `@property`/`mask-composite` decision (R4) is pure CSS and does not change this |
| **II. Astro Component & Island Discipline** | New components are `.astro` with zero client JS; islands only for genuine interactivity and always with an explicit `client:*`; `components/` never imports `islands/` | **PASS** | All eight are `.astro`. **No island is created and none is imported.** The one piece of behaviour in the feature — the LED hover animation — is deliberately CSS, which is what makes an island unnecessary; had it been JS it would have needed one, and Article II would have pushed back. `quickstart.md` § 6 verifies the build emits no JS for these components |
| **III. i18n Parity** (NON-NEGOTIABLE) | Every route in both locales; every `ui.ts` key in both locales; `hreflang` from config | **N/A** | No route, page or `ui.ts` key is added or changed. FR-029 keeps every visible string in the caller's hands, so these primitives cannot create a locale gap. The one hardcoded string set — `muush` / `.` / `dev` in Wordmark — is brand identity, locale-invariant by `messaging.md` rule 6 |
| **IV. Design Tokens Discipline** | No hex/oklch/arbitrary-value literals in components; everything through `@theme inline` custom properties | **PASS — this feature is the first real test of the article** | Feature 001 could only assert this vacuously (nothing consumed the tokens). Here, 13 glass colours, 22 type roles and 24 surface values are all defined in `global.css`; components reference utility classes only. Two design values that map to no ramp are given names rather than being inlined: `--dark-glass: #1c1416` (FR-031) and `bone-faint`'s `#FBF8F2`, folded into bone-100 @16% (A-07). `quickstart.md` § 5 makes this a grep-able gate rather than a promise |
| **V. TypeScript Strict + Biome** | Strict mode, no `any`, no `@ts-ignore`, Biome only, `pnpm check`/`typecheck` pass | **PASS** | Each component declares `interface Props` with string-literal unions; variant maps use `satisfies Record<Variant, string>`. No `any`, no `@ts-ignore`. `*.svg` imports are typed by Astro's own `SvgComponent` declaration (verified in `astro@7.2.8`'s `client.d.ts`). No lint or format tool is added |
| **VI. Absolute Imports via Alias** | Intra-project imports use `@/*`; relative only within a directory | **PASS (with one config addition)** | Pill→Radar and Lockup→Wordmark are same-directory imports, so `./Radar.astro` is allowed and correct. Lockup→`src/assets/logo/` and SocialIcon→`src/assets/social/` cross a directory boundary, and `tsconfig.json` has no `@/assets/*` alias yet — so one line is added to the existing `paths` map. Complying with the article, not bending it |
| **VII. Testing Discipline** | Vitest only; no Playwright, no Storybook; non-trivial `i18n`/`utils` logic tested; component tests deferred until warranted | **PASS** | No test framework is added. No new Vitest test either, and that is a finding rather than an omission: the single candidate for "non-trivial logic" was the stroke-width formula, which `research.md` § R6 shows SVG scaling already performs, so there is no function to test. Purely presentational components with no logic are exactly what Article VII defers. The existing suite must keep passing untouched, and verification is the manual checklist in `quickstart.md` |
| **VIII. Configuration & Credential Hygiene** (NON-NEGOTIABLE) | `import.meta.env` only; no `process.env` in `src/`; no credentials committed | **N/A** | No environment variable, no credential, no external service is involved. Nothing in this feature reads configuration at all |
| **IX. Clean Code Discipline** | Intent-revealing names, DRY, no dead code, no magic numbers, no over-engineering | **PASS** | Every magic number in design-extract becomes a named token — that *is* the feature. Variant sets are closed at exactly what the design documents (6 glass / 3 radar / 2 wordmark / 3 button / 2 link); `contracts/components.md` closes with an explicit list of the props considered and rejected. No `src/types/ui.ts` barrel and no shared base component are created for a single consumer each. `rounded-full` is reused instead of minting a `999px` token. No SVGO dependency for a one-time three-file normalization |

**Re-check after Phase 1 design**: no gate changed status. No violation requires
Complexity Tracking.

### Two decisions worth flagging to the reviewer

1. **`tsconfig.json` gains one line** (`"@/assets/*": ["src/assets/*"]`). It is
   outside the three directories the feature description named, but it is the
   Article VI-compliant way to import an asset from a component. The
   alternative — a relative `../assets/…` import — would be the violation.
2. **The LED's touch-device behaviour** (`@media (hover: hover)`) resolves
   `decisions-open.md` open decision #8, which is classified there as
   non-blocking, with the conservative option: static ring, matching the
   reduced-motion and no-JS fallbacks. Recorded as spec A-02 and reversible by
   deleting one media query. It is **not** an approval of that decision — Clau
   still owns it.

## Project Structure

### Documentation (this feature)

```text
specs/002-primitive-ui-layer/
├── spec.md                  # /speckit.specify output
├── plan.md                  # This file
├── research.md              # Phase 0 — every measurement, computed and sourced
├── data-model.md            # Phase 1 — token + variant entities
├── quickstart.md            # Phase 1 — build order, verification, acceptance gate
├── contracts/
│   └── components.md        # Phase 1 — the eight prop signatures + asset contract
├── checklists/
│   └── requirements.md      # spec quality checklist
└── tasks.md                 # Phase 2 (/speckit.tasks — not created by /speckit.plan)
```

`contracts/` exists here (unlike feature 001, which had none) because this
feature *does* expose a public interface: eight prop surfaces that later
features bind to.

### Source Code (repository root)

```text
src/
├── styles/
│   └── global.css              # APPENDED: --dark-glass base colour;
│                               #   13 --color-glass-*/--color-radar-* tokens;
│                               #   22 --text-* roles (+ line-height,
│                               #   letter-spacing, font-weight sub-props);
│                               #   24 --spacing-*/--radius-*/--blur-* tokens;
│                               #   @property --led-angle + @keyframes led-spin
│                               #   (existing ramps, fonts and @font-face
│                               #   blocks are NOT touched)
├── components/                 # 8 NEW files (directory was empty but .gitkeep)
│   ├── GlassPanel.astro        #   6 variants × 3 padding modes
│   ├── Radar.astro             #   3 sizes, 3 concentric rings
│   ├── Wordmark.astro          #   'muush.dev' | 'muush'
│   ├── Lockup.astro            #   isotipo-on-ink + Wordmark
│   ├── Pill.astro              #   Radar sm + label
│   ├── BotonPrimario.astro     #   3 sizes + CSS-only LED ring
│   ├── LinkArrow.astro         #   2 sizes, never boxed
│   └── SocialIcon.astro        #   48×48 glass button + normalized glyph
└── assets/
    ├── logo/                   # feature 001 — read only, unchanged
    └── social/                 # NEW
        ├── linkedin.svg        #   viewBox 0 0 24 24, currentColor
        ├── instagram.svg       #   .cls-1 <style> removed
        ├── tiktok.svg          #   optically centred, DOCTYPE/metadata stripped
        └── README.md           #   source → transform → what was stripped

tsconfig.json                   # +1 line: "@/assets/*": ["src/assets/*"]
```

**Untouched by design**: `src/pages/`, `src/layouts/`, `src/islands/`,
`src/i18n/`, `src/utils/`, `src/types/`, `astro.config.mjs`, `package.json`,
`biome.json`, `vitest.config.ts`, `tests/`.

**Structure Decision**: Single-project Astro static site — the repo's only
structure, unchanged. Components go in `src/components/` (not `src/islands/`)
because every one of them is presentational with zero client JS, which is
precisely the split Article II defines. The normalized glyphs go in
`src/assets/social/` rather than `public/` for the same reason feature 001 put
the isotipos in `src/assets/logo/`: they are imported and inlined by code so
they can inherit `currentColor`, not fetched by a stable public URL — an
`<img src>` from `public/` could never take the bone-100 token, which would
defeat the entire normalization.

## Phase 2 preview (what `/speckit.tasks` will expand)

Sequenced by dependency, parallelizable where files do not touch:

1. Tokens in `global.css` (blocking — everything else consumes them).
2. `tsconfig.json` alias (blocking for Lockup and SocialIcon only).
3. The three SVG normalizations (independent of each other → `[P]`).
4. Radar, Wordmark, GlassPanel, LinkArrow (independent → `[P]`).
5. Pill (needs Radar), Lockup (needs Wordmark + alias), SocialIcon (needs
   glyphs + alias) (→ `[P]` among themselves).
6. BotonPrimario (needs the `@property`/`@keyframes` from step 1).
7. Verification sweep: the Article IV grep gate, the boundary check, the
   endpoint spot-checks, then `pnpm check && pnpm typecheck && pnpm test &&
   pnpm build`.

## Complexity Tracking

*No entries — no Constitution Check violations to justify.*

The one item that could look like a deviation, the `tsconfig.json` alias
addition, is Article VI **compliance**, not an exception to it.
