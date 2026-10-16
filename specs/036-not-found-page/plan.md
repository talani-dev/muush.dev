# Implementation Plan: Not-found page (404) in Spanish and English

**Branch**: `036-not-found-page` (spec directory; no git branch created by spec_author) | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/036-not-found-page/spec.md`

## Summary

Two prerendered not-found documents, `es/404/index.html` and `en/404/index.html`, rendered by a new `app/error.vue` that wraps the existing layout and composes a new shell component (`NotFoundContent` with the three-ring `NotFoundRings`). Nitro refuses to write a route rendered with status 404, so a build-time `prerender:generate` hook in `nuxt.config.ts` keeps exactly those two and also stops the obsolete `200.html`/`404.html` shells from being written. A one-line server-side removal of `payload.path` keeps the visitor's URL in the address bar after hydration. The nav's LED CTA is removed (not hidden) while an error is shown. A contract tells muush-foundation how to serve the documents with status 404 by path prefix. Every mechanism was run in a scratch copy and in headless Chrome against a CloudFront simulation (`research.md`).

## Technical Context

**Language/Version**: TypeScript (strict) · Vue 3.5 `<script setup>` · Nuxt 4.5.2 (nitropack 2.13.4)
**Primary Dependencies**: @nuxtjs/i18n 10.6.0 (`strategy: 'prefix'`, `customRoutes: 'config'`), Tailwind v4, @nuxtjs/sitemap 8.6.2, @nuxtjs/robots 6.2.4, nuxt-schema-org 6.4.3 — **no new dependency**
**Storage**: N/A
**Testing**: Vitest 4 (happy-dom, `globalSetup` runs `pnpm generate`), Vue Test Utils, Storybook 10; browser check by CDP script (quickstart § 3, not committed)
**Target Platform**: static files on S3 + CloudFront (`nitro.preset: 'static'`)
**Project Type**: static website
**Performance Goals**: each 404 document comparable to an existing page (~16 KB HTML measured in research); zero extra requests beyond the page's own payload
**Constraints**: no server runtime, no infra change, no change to other pages' output, one LED per screen, no client-side language switch
**Scale/Scope**: 2 documents, ~6 new source files in `shell`, 1 new Nuxt-native file, 9 copy keys × 2 locales, ~19 tokens (incl. 2 glow-position tokens)

All unknowns resolved in `research.md` (R1–R9). Remaining UNVERIFIED items are infrastructure facts owned by Roberto/muush-foundation, not blockers for this repository.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — still passing.*

### Phase -1: Pre-Implementation Gates

#### I · Feature-Based + Capas Architecture
- [x] All new code lives in `app/features/shell/{ui,logic,data}` plus the Nuxt-native `app/error.vue`; no new feature module (research R5).
- [x] `app/error.vue` is a thin wrapper: imports from the shell barrel, no logic of its own.

#### II · Dependency Direction (NON-NEGOTIABLE)
- [x] `data/notFound.ts` imports only `data/` (types, `SHELL_ANCHORS`); `logic/` imports `data/`; `ui/` imports `logic/` types/`data/` types and `@/shared/ui` only.

#### III · Feature Isolation (NON-NEGOTIABLE)
- [x] `app/error.vue` reaches the shell only through `@/features/shell`; the shell imports nothing from `landing`/`about`/`forms` (anchors come from `SHELL_ANCHORS`).

#### IV · Static-Site Purity (NON-NEGOTIABLE)
- [x] `nitro.preset` stays `'static'`; no `server/` directory, no server route, no runtime handler. The Nitro hook runs only during `pnpm generate`.
- [x] The deployable artefact is `.output/public`; edge behaviour is delegated to muush-foundation via `contracts/edge-not-found.md`, not emulated in this repo.

#### V · Component Discipline
- [x] `NotFoundContent.vue` (which composes the existing `SectionBackdrop`/`SectionGlow`), `NotFoundRings.vue` are `<script setup lang="ts">`, presentational, props-only, no Nuxt composable, < 200 lines, no client state.
- [x] `SiteNav.vue` change is one optional prop + `v-if`; its existing recorded line-count situation is not worsened beyond those lines.

#### VI · i18n Parity (NON-NEGOTIABLE)
- [x] Both locales ship a not-found document; every new key exists in `es.json` and `en.json` (`tests/i18n-parity.test.ts`).
- [x] No hardcoded user-facing string; destinations resolved by route name, never by string surgery; the language button uses the existing resolver (other home, research R4 F26).
- [x] No `hreflang` emitted for a document that does not exist as a page (R3 F19).

#### VII · Design Tokens Discipline
- [x] Every colour, size and spacing goes through tokens in `global.css` (research R6); no hex/oklch literal, no arbitrary Tailwind value.
- [x] Hand-written CSS reads ramp-root tokens (`var(--not-found-ring-*)`, `var(--bone-100)`), never `--color-*` (§ R18); no token in the closed `glow` namespace (§ R36).
- [x] Fluid tokens interpolate 390 ↔ 1440; no breakpoint used to change a size.
- [x] The background glow reuses an existing `SectionGlow` pair (no new `--color-glow-*`/`--spacing-glow-*`), sits on `--layer-glow` inside `SectionBackdrop`, and the section creates no stacking context and paints no opaque background (§§ R28, R36, R37).

#### VIII · Clean Code
- [x] `resolveItem`/`resolveHref` extracted once (`useShellItemResolver`) instead of duplicated.
- [x] Route list `NOT_FOUND_ROUTES` named once in `nuxt.config.ts`; no magic strings repeated.
- [x] No dead code: obsolete `200.html` comment clause removed with the file.

#### IX · TypeScript Strict + Biome
- [x] No `any`, no `@ts-ignore`; `pnpm check` and `pnpm typecheck` pass. `delete payload.path` type-checks (optional field) — if it does not, `@ts-expect-error` with a reason, never `any`.

#### X · Testing Discipline
- [x] Output tests against `.output/public` for `contracts/build-output.md`; unit tests for `data/notFound.ts` shape and `useShellItemResolver`; component tests for `NotFoundContent`, `NotFoundRings` and `SiteNav` without `cta`; token test for the new tokens. Names follow `should … when …`.
- [x] Storybook stories for `NotFoundContent` (both locales) and `SiteNav` without CTA; `pnpm storybook:build` passes.

#### XI · Configuration & Credential Hygiene (NON-NEGOTIABLE)
- [x] No environment variable, no credential, no `process.env` in app code; the contract contains no account IDs, ARNs or keys.

#### XII · Absolute Imports via Alias
- [x] All new imports use `@/features/…`, `@/shared/…`; relative only within the same directory.

**Result**: PASS. No violation; Complexity Tracking records one deliberate use of a framework internal (not a constitution violation, recorded for review).

## Project Structure

### Documentation (this feature)

```text
specs/036-not-found-page/
├── spec.md
├── plan.md                  # this file
├── research.md              # R1–R9, every finding labelled
├── data-model.md
├── quickstart.md            # incl. CDP browser check + CloudFront simulator
├── contracts/
│   ├── build-output.md      # what pnpm generate must write
│   ├── components.md        # props / composables / config shape
│   └── edge-not-found.md    # FOR muush-foundation — Roberto to apply
├── reference/               # Roberto's 404.html + README.md, verbatim
├── checklists/requirements.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
app/
├── error.vue                                   # NEW · Nuxt-native thin wrapper
├── assets/css/global.css                       # + ring tokens (:root), + spacing tokens (@theme inline)
└── features/shell/
    ├── index.ts                                # + NotFoundContent, useNotFoundContent, useNotFoundDocument
    ├── data/notFound.ts                        # NEW · keys + destinations
    ├── data/notFound.test.ts                   # NEW
    ├── logic/useShellItemResolver.ts           # NEW · lifted from useShellNavigation
    ├── logic/useShellItemResolver.test.ts      # NEW
    ├── logic/useShellNavigation.ts             # navCta undefined while an error is shown
    ├── logic/useNotFoundContent.ts             # NEW
    ├── logic/useNotFoundDocument.ts            # NEW · title, robots, payload.path
    ├── ui/NotFoundContent.vue (+ .test.ts, .stories.ts)   # NEW
    ├── ui/NotFoundRings.vue (+ .test.ts)                  # NEW
    └── ui/SiteNav.vue (+ .test.ts, .stories.ts)           # cta optional
i18n/locales/{es,en}.json                       # + pages.notFound.title, + shell.notFound.*
nuxt.config.ts                                  # NOT_FOUND_ROUTES, prerender.routes, prerender:generate hook, comment fix
tests/
├── not-found-output.test.ts                    # NEW · contracts/build-output.md
└── not-found-tokens.test.ts                    # NEW · research R6 tokens
```

`app/layouts/default.vue`, `app/pages/*`, `public/index.html`, feature 35's tests: **unchanged**.

**Structure Decision**: shell feature + Nuxt-native `error.vue` (research R5).

## Design decisions (each traced to research)

1. **Generation** — `error.vue` + prerendered `/es/404`, `/en/404` + hook clearing the 404 error on those two routes (R1 F1–F6). Rejected: dedicated page, catch-all, Nuxt's SSR-less `/404.html` (R1 table).
2. **URL kept after hydration** — delete `payload.path` server-side (R1 F7–F8). Guarded by the quickstart browser check because it leans on a Nuxt internal.
3. **`200.html` and `404.html`** — no longer written (R2). Justification: neither is served under the new contract; `200.html` would be a soft 404 with `index, follow`; root `404.html` is a client-side language guess with no content without scripting. Rollout order in the contract § 6.
4. **SEO** — `noindex` robots, title only; no canonical/hreflang/og:url by construction (R3 F19–F21). Feature 35 tests unchanged.
5. **One LED** — nav CTA absent (not hidden) while an error is shown, so the `<noscript>` override cannot resurrect it (R4 F24–F25). Language button already correct (F26).
6. **Visual mapping** — table in R6: reuse `Pill`, `BotonPrimario variant="hero"`, `text-display`, `text-body-sm`, `text-footer-item` (G2/G3 confirmed); ~17 new tokens for rings and spacing plus 2 glow-position tokens (R6b), each derived and justified.
7. **Contract** — `contracts/edge-not-found.md`: required behaviour, the one-page-per-error-code constraint, Stage 1 agreed (config only, English document for every missing path, G5) and Stage 2 deferred with options; Roberto applies.
8. **Red background glow (G4)** — inside `NotFoundContent`'s section, first child: `<SectionBackdrop><SectionGlow color="red-400" :opacity="60" size="1400-700" class="absolute top-not-found-glow-y left-not-found-glow-x -translate-x-1/2 -translate-y-1/2" /></SectionBackdrop>`. Existing glow pair, so `SectionGlow` and its closed namespace are untouched; deltas vs the reference (55 %→60 %, 1440→1400/700 px) recorded in R6b. Two **new position tokens** are unavoidable (every glow-bearing section owns its offsets, §§ R29/R48): `--spacing-not-found-glow-x`, `--spacing-not-found-glow-y`. Layer `--layer-glow`, clipped by the layout root (no horizontal scroll), `aria-hidden`.

## Copy (for confirmation at the gate)

See `spec.md` § Copy — ES from the reference, EN = the reference's `data-en` values, approved by Roberto (G1). Keys in `data-model.md` § 2.

## Gate — answered by Roberto (2026-10-15)

| # | Question | Answer (binding) |
|---|---|---|
| G1 | EN copy (reference `data-en`) | **Approved** as in `spec.md` § Copy |
| G2 | Heading size | **`text-display`** (reuse; no new type token) |
| G3 | Button size | **`BotonPrimario variant="hero"`** (reuse; no new button token) |
| G4 | Reference background blobs | **Add the red glow** via `SectionBackdrop` + `SectionGlow` (`red-400`, `60`, `1400-700`), position from the reference → decision 8, `research.md` R6b. Wine/deep blobs stay out |
| G5 | Edge rollout | **Stage 1 now**: every missing path → **English** document `en/404/index.html`, status 404, configuration only — deliberately not the default locale `es`/`x-default` (Roberto's correction). Stage 2 deferred to muush-foundation. Both locale documents are still generated |

## Complexity Tracking

| Item | Why needed | Simpler alternative rejected because |
|---|---|---|
| `delete useNuxtApp().payload.path` (framework internal, server-only) | Without it the client rewrites the visitor's URL to `/<locale>/404` (CONFIRMED in Chrome, R1 F7) | Leaving it breaks the visitor's ability to see/fix the URL they typed and makes a refresh hit the 200-served `/…/404` object; there is no public option for this in Nuxt 4.5 |
| Nitro `prerender:generate` hook clearing a 404 | Nitro never writes a non-200 route (R1 F1) and Nuxt fails the build on it (F2) | A matched page (200) brings canonical/hreflang/sitemap entries and a client-side error swap (R1 table) |
| Universal plugin `app/plugins/not-found-locale.ts` (`enforce: 'pre'`, server + client) hooking `@nuxtjs/i18n`'s public `i18n:beforeLocaleSwitch` (rule in `app/features/shell/logic/notFoundLocale.ts`) — added during implementation (D1, then G6) | (1) In Stage 1 the edge serves the English document at `/es/*`; i18n detects `es` from the URL on hydration and flips the page to Spanish with a hydration mismatch (CONFIRMED in Chrome). While hydrating, the locale the server recorded wins. (2) G6 (Roberto, 2026-10-15): a not-found page rendered at runtime takes its prefix, else English, whereas i18n falls back to `defaultLocale` `es`. It applies only to the initial locale of an unmatched, non-`/` path; every real page is unaffected | A client-side switch after hydration is the language-changing script D1 forbids, and it still mismatches. Changing `defaultLocale` would move every real page and `/`. Setting i18n's internal `useState('i18n:resolved-locale')` relies on a private key, and the module's `locale-changing` route middleware re-detects from the path on the initial navigation (INFERRED from source, not run). Hooks must exist before i18n's plugin runs, so the logic cannot live in `error.vue`; the plugin is a thin wrapper over the shell barrel |
| `useHead({ meta: [og:locale, og:locale:alternate → content: null] }, { tagPriority: 'high' })` in `useNotFoundDocument` (D2) | The layout's `useLocaleHead()` emits `og:locale`/`og:locale:alternate` even on an unmatched route (CONFIRMED on the first build; research F19 said otherwise), and FR-012 forbids them on a 404. unhead dedupes these tags by property across entries; `high` priority beats the layout's later entry, and `null` content is unhead's removal value (dropped at render). Scoped to `error.vue`, so the tags return when the error clears | Editing `app/layouts/default.vue` (e.g. `useLocaleHead({ seo: false })` on errors) is out of scope (plan: layout unchanged, FR-004). A global `tags:resolve` hook filter would outlive the error page on the client and would need its own teardown |
