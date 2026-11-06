# Implementation Plan: Muush 1.0 secondary pages — Nosotros, Preguntas and 404

**Branch**: `feat/v2-pages` (from `muush-v2`, merges back into `muush-v2`) | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/046-secondary-pages/spec.md`

## Summary

Rebuild Nosotros in `app/features/about/` as four v2 sections (hero over the
`aboutHero` listón, "Cómo se arma" cards, "Dónde estamos" on the shared map,
"Trabaja con muush" over the `workWithUs` listón holding the feature 45
`ApplicationForm`), deleting the v1 About sections. Lift `ReceivesList` and the
map labels to `app/shared/` so home and Nosotros share one source. Add the
`faq` route (`/es/preguntas` ↔ `/en/faq`), indexed, linked from both footers
only. Replace the v1 404 body with a shell `StatusSection` that Preguntas also
uses (heading + primary + glass button over the acanalado), keeping every
feature 36/39 module untouched. Give four presets a compact (below 1024)
uniform set, honoured by `ShaderBackground`. Retire the v1 page frame from the
layout. Details: [research.md](./research.md), [data-model.md](./data-model.md),
[contracts/components.md](./contracts/components.md),
[quickstart.md](./quickstart.md).

## Technical Context

**Language/Version**: TypeScript (strict) · Vue 3.5 `<script setup lang="ts">` · Nuxt 4 (`srcDir: app/`)
**Primary Dependencies**: Tailwind CSS 4 (v2 tokens of 42–45), `@nuxtjs/i18n`, `@nuxtjs/sitemap`, `nuxt-schema-org` (existing). **No new dependency, no new asset** (the posters for all four presets already ship).
**Storage**: N/A
**Testing**: Vitest + Vue Test Utils + happy-dom; Storybook; build-output tests in `tests/` (`seo-output`, `not-found-output`, `static-output`, `about-copy`, `i18n-parity`, `token-literals`, `pill-air`)
**Target Platform**: static site (`nitro.preset: 'static'`) on S3 + CloudFront
**Project Type**: static web site (single Nuxt project)
**Performance Goals**: no new request at load; Nosotros keeps at most two WebGL canvases (hero high priority, Trabaja lazy, both paused off screen); Preguntas and 404 one each
**Constraints**: Articles IV, VI, VII; components < 200 lines; 390/1440 anchors; feature 45 payloads and feature 36/39 behaviour unchanged
**Scale/Scope**: 6 new/rewritten about components, 1 new shell component, 2 shared moves, 1 shared extension (compact uniforms), 1 new route, ~45 i18n keys per locale added/moved, ~40 tokens added, ~45 v1 tokens removed, ~10 test files edited
**Awaiting leader (does not block the plan)**: heading line heights and desktop tracking (R12), card blur/shadow/stroke (R11), Preguntas/404 heading line heights (R10), footer top gap (R8)

## Constitution Check

*GATE: must pass before Phase 0 research. Re-checked after Phase 1 design: still passing.*

### Phase -1: Pre-Implementation Gates

#### I. Feature-Based + Capas architecture
- [x] Nosotros sections in `about/{ui,logic,data}`; Preguntas and 404 content in `shell/{ui,logic,data}` (research R1); pages (`about.vue`, `faq.vue`, `error.vue`) only compose barrels.
- [x] No new feature module (the closed list of Article I is unchanged; R1).

#### II. Dependency direction (NON-NEGOTIABLE)
- [x] `about/data` and `shell/data` import only shared data/types; `resolveMapCopy` lives in `shared/utils` and imports only `shared/data`.

#### III. Feature isolation (NON-NEGOTIABLE)
- [x] `about` reaches forms only through `@/features/forms`; `ReceivesList` and the map copy are lifted to `app/shared/` rather than imported from `landing` (R2, R3); the shell exports `StatusSection`, `useFaqContent`, `useNotFoundContent` through its barrel.

#### IV. Static-site purity (NON-NEGOTIABLE)
- [x] No server route; Preguntas is a prerendered page; the 404 stays two prerendered documents with the 036 Nitro hook unchanged.

#### V. Component discipline
- [x] `<script setup lang="ts">` only; every component < 200 lines; copy and hrefs arrive as props; the only client state is the existing map/tab, form and shader logic.

#### VI. i18n parity (NON-NEGOTIABLE)
- [x] Every route exists in both locales (`faq` declared once in `i18n.pages`); the toggle resolves `/es/preguntas` ↔ `/en/faq` by route; every new or moved key exists in both locale files; `i18n-parity.test.ts` green; no hardcoded string. Provisional copy (Preguntas SEO title/description) flagged for Roberto.

#### VII. Design tokens discipline
- [x] Every value through v2 tokens; new tokens carry no version marker; no v1 token in new code; v1 tokens used only by deleted files are removed; `token-literals.test.ts` covers the new files.
- [x] 390 / 1440 match the extract; other widths use `clamp()`; headings at Poppins 500 (Preguntas 600 → 500, Clarifications Q2).

#### VIII. Clean code
- [x] One `StatusSection` for two pages, one `ReceivesList` and one map-copy source for two pages; dead v1 code deleted, not left behind (R14); no speculative props.

#### IX. TypeScript strict + Biome
- [x] No `any`; key maps typed with `satisfies`; `ShellRouteName` widened so a footer item to an undeclared route does not compile.

#### X. Testing discipline
- [x] Unit tests: `resolveMapCopy`, compact-uniform selection, footer/nav data, the four about content models, `faq.ts` / `notFound.ts`. Component tests for every new/rewritten component. Build-output tests: six sitemap URLs, Preguntas indexable, 404 behaviour (036/039) unchanged with v2-look assertions. Stories at 390/1440 × ES/EN for every new shared/about/shell component.

#### XI. Configuration & credential hygiene (NON-NEGOTIABLE)
- [x] No new config, env var or credential; forms `runtimeConfig` untouched.

#### XII. Absolute imports via alias
- [x] `@/features/…`, `@/shared/…`, `@/assets/…`; relative only within one folder; no new alias.

## Project Structure

### Documentation (this feature)

```text
specs/046-secondary-pages/
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
nuxt.config.ts                              # i18n.pages.faq
app/
├── assets/css/global.css                   # new about/status tokens; remove v1 about-hero/work/not-found
├── layouts/default.vue                     # v1 frame retired
├── error.vue                               # StatusSection
├── pages/about.vue, faq.vue (new), index.vue
├── shared/
│   ├── data/backgroundPresets.ts           # compactUniforms
│   ├── data/mapCopy.ts                     # new
│   ├── utils/mapCopy.ts                    # new resolveMapCopy
│   └── ui/ReceivesList.vue (moved), ShaderBackground.vue, Heading.vue
├── features/about/
│   ├── data/aboutHeroContent.ts, teamCompositionContent.ts, whereWeAreContent.ts, workContent.ts
│   ├── logic/useAboutHeroContent.ts, useTeamCompositionContent.ts, useWhereWeAreContent.ts, useWorkContent.ts
│   ├── ui/AboutHeroSection, TeamCompositionSection, CompositionCard, WhereWeAreSection, WorkWithMuushSection (+ stories, tests)
│   └── index.ts
├── features/landing/
│   ├── data/whoWeAreContent.ts, logic/useWhoWeAreContent.ts   # use shared map copy
│   └── ui/AssessmentSection.vue                                # imports shared ReceivesList
└── features/shell/
    ├── data/types.ts, footerColumns.ts, contactChannels.ts, navigation.ts (comment), notFound.ts, faq.ts (new)
    ├── logic/useNotFoundContent.ts, useFaqContent.ts (new)
    ├── ui/StatusSection.vue (new) ; ui/legacy/NotFoundContent.*, NotFoundRings.* (deleted)
    └── index.ts
i18n/locales/{es,en}.json
tests/ seo-output, not-found-output, not-found-tokens, static-output, about-copy, landing-copy, pill-air
```

**Structure Decision**: single Nuxt project; feature modules as above.

## Complexity Tracking

No constitution violation to justify.

## Agent context

`CLAUDE.md` has no `<!-- SPECKIT START -->` block, so no agent-context update
was made (same as features 43–45).
