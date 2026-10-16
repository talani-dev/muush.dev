# Tasks: Not-found page (404) in Spanish and English

**Input**: `specs/036-not-found-page/` — spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md, reference/
**Tests**: required (spec FR-015, Constitution Article X). Output tests read `.output/public`; copy is read from the locale files on disk (`rules.md` § R27); test names `should … when …`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no dependency on an unfinished task)
- **[Story]**: US1 Spanish 404 · US2 English 404 · US3 search engines · US4 one LED + language button · US5 rings

Gate answered by Roberto 2026-10-15 (`spec.md` § Gate): copy approved; `text-display` and `BotonPrimario variant="hero"` are final; red background glow added (Phase 7b); edge Stage 1 = English document for every missing path (affects only the contract and the browser simulation, not the build).

Read before starting: `contracts/components.md` (shapes), `research.md` R1–R6 (why), `.specify/memory/constitution.md`. Do not edit `docs/business/`, `app/layouts/default.vue`, `app/pages/*`, `public/index.html` or feature 35's tests.

---

## Phase 1: Setup

- [x] T001 Run `./init.sh` and `pnpm generate`; record in `docs/harness/progress/current.md` the baseline: list of `*.html` under `.output/public` (expect `200.html`, `404.html`, the 4 pages, `index.html`), and save the script-stripped `<body>` of `es/index.html`, `en/index.html`, `es/nosotros/index.html`, `en/about/index.html` to the session scratchpad (outside the repo) for the FR-004 comparison in T030.

---

## Phase 2: Foundational (blocks every story)

- [x] T002 [P] Add copy keys from `data-model.md` § 2 to `i18n/locales/es.json` and `i18n/locales/en.json`: `pages.notFound.title` (sibling of `pages.home`/`pages.about`, title only, no description) and the `shell.notFound` object (`eyebrow`, `headline`, `body`, `cta`, `shortcutsLabel`, `shortcuts.{purpose,services,about}`), values verbatim from the approved table in `spec.md` § Copy.
- [x] T003 [P] Create `app/features/shell/data/notFound.ts` exactly as `data-model.md` § 1 (`NOT_FOUND_HOME`, `NOT_FOUND_SHORTCUTS` built from `SHELL_ANCHORS` in `./navigation`, `NOT_FOUND_COPY_KEYS`, `NOT_FOUND_ROBOTS = 'noindex'`), with a doc comment citing `reference/README.md` and `research.md` R5.
- [x] T004 [P] Create `app/features/shell/data/notFound.test.ts`: should list exactly three shortcuts in the order purpose, services, about; should use only `route`/`anchor` destinations; should point the home at route `index`; should use `SHELL_ANCHORS.purpose`/`.services`.
- [x] T005 Extract `resolveHref` and `resolveItem` verbatim from `app/features/shell/logic/useShellNavigation.ts` into new `app/features/shell/logic/useShellItemResolver.ts` (`export function useShellItemResolver()` returning both; reads `useI18n`, `useLocalePath`, `useRouteBaseName`, `useRoute`), and make `useShellNavigation` call it. No behaviour change.
- [x] T006 Create `app/features/shell/logic/useShellItemResolver.test.ts` with stubbed Nuxt composables (same approach as the existing shell logic tests): should return `undefined` href for `none`; should append the hash to the localized route for `anchor`; should append the encoded message for `external` with `messageKey`; should mark `current` for the active route.
- [x] T007 In `nuxt.config.ts` add `const NOT_FOUND_ROUTES = ['/es/404', '/en/404']` (comment: one per locale, keep in step with `i18n.locales`), set `nitro.prerender.routes: NOT_FOUND_ROUTES`, and add `nitro.hooks['prerender:generate']` that (a) deletes `route.error` when `NOT_FOUND_ROUTES.includes(route.route) && route.error?.statusCode === 404`, (b) sets `route.skip = true` for `/200.html` and `/404.html`. Comment each branch with `research.md` R1 F1–F3 and R2. Remove the "when the host serves `200.html` as an SPA fallback" clause from the `i18n.rootRedirect` comment. Typecheck the hook parameter (Nitro's prerender route type), no `any`.
- [x] T008 Create `app/features/shell/logic/useNotFoundDocument.ts` per `contracts/components.md`: `useSeoMeta({ title: t(NOT_FOUND_COPY_KEYS.documentTitle), robots: NOT_FOUND_ROBOTS })` and `if (import.meta.server) delete useNuxtApp().payload.path` with a comment explaining `research.md` R1 F7/F8 and pointing at `quickstart.md` § 3 as its guard. No description, no OG, no canonical.
- [x] T009 Create `app/features/shell/logic/useNotFoundContent.ts` returning a `computed` `NotFoundContent` (`data-model.md` § 3) resolved through `useShellItemResolver` and `t`.
- [x] T010 Create `app/error.vue` exactly as `contracts/components.md` § `app/error.vue` (declared `error` prop, `<NuxtLayout><NotFoundContent v-bind="content" /></NuxtLayout>`), importing only from `@/features/shell`.

**Checkpoint**: T011–T014 below provide the component `error.vue` renders; Phase 2 compiles once T012 exists.

---

## Phase 3: User Story 1 — Spanish visitor finds their way back (P1) 🎯 MVP

**Goal**: `es/404/index.html` with nav, footer and the reference content in Spanish.
**Independent test**: `contracts/build-output.md` § 1 for `es`; quickstart § 3 on `/es/nada` and `/xyz`.

- [x] T011 [P] [US1] Write `tests/not-found-output.test.ts` (fails first): for `es/404/index.html` — file and `_payload.json` exist; `<html lang="es-MX">`; exactly one `<nav aria-label=…main…>` site nav and one `<footer>`; one `<h1>` = `shell.notFound.headline`; Pill markup containing `shell.notFound.eyebrow` and the radar `ping` dot; subtitle = `shell.notFound.body`; the `led` `<a href="/es">` with `shell.notFound.cta`; a `<nav aria-label="Atajos">` with hrefs `/es#proposito`, `/es#servicios`, `/es/nosotros` in order and their labels; separators `aria-hidden="true"`; no `<a>` without `href`; no `data-en`/`data-href-en`/`data-aria-en`; none of the `en.json` `shell.notFound.*` strings present. Structure the file as a per-locale table so US2 only adds a row.
- [x] T012 [US1] Create `app/features/shell/ui/NotFoundContent.vue` per `contracts/components.md`: `<section class="relative flex min-h-not-found-min-h items-center justify-center pt-not-found-top pb-not-found-bottom">` containing `<NotFoundRings />` then a `relative` centred column `max-w-not-found-content text-center`: `<Pill :label="eyebrow" />` (`mb-not-found-pill-gap`), `<h1 class="font-instrument text-display text-bone-100 text-balance mb-not-found-title-gap">`, `<p class="font-instrument text-body-sm text-ink-100 max-w-not-found-measure mb-not-found-body-gap">`, `<BotonPrimario variant="hero" :href="cta.href">`, `<nav :aria-label="shortcutsLabel" class="mt-not-found-cta-gap flex flex-wrap justify-center gap-x-not-found-shortcut-gap-x gap-y-not-found-shortcut-gap-y">` with `NuxtLink`s (`px-not-found-shortcut-x py-not-found-shortcut-y font-instrument text-footer-item text-ink-100 hover:text-bone-100 focus-visible:outline-red-400`, colour transition off under reduced motion) and `<span aria-hidden="true" class="text-ink-300">·</span>` between them. No Nuxt composable; doc comment citing `reference/404.html` and `research.md` R6 (including the listed deltas). Gate answers G2/G3 may swap `text-display`/`variant` — follow the approved option.
- [x] T013 [US1] Export `NotFoundContent`, `useNotFoundContent`, `useNotFoundDocument` from `app/features/shell/index.ts`.
- [x] T014 [P] [US1] Create `app/features/shell/ui/NotFoundContent.test.ts` (Vue Test Utils, `NuxtLink` stubbed): should render pill, heading, body, one primary link with the given href; should render three shortcut links in order inside a nav named by `shortcutsLabel`; should hide separators from assistive technology; should render exactly one `.led`.
- [x] T015 [P] [US1] Create `app/features/shell/ui/NotFoundContent.stories.ts` with ES and EN stories (copy passed as args, strings copied from the approved table), following the existing shell stories' setup.
- [x] T016 [US1] Run `pnpm generate` and `pnpm test -- not-found-output`; confirm the ES assertions pass and the generate log shows `/es/404` written, `/200.html` and `/404.html` `(skipped)`, no `ERROR`.

---

## Phase 4: User Story 2 — English visitor (P1)

**Goal**: `en/404/index.html`, same content in English.
**Independent test**: same as US1 with `en`.

- [x] T017 [US2] Add the `en` row to `tests/not-found-output.test.ts` (`lang="en-US"`, `led` href `/en`, `<nav aria-label="Shortcuts">` with `/en#proposito`, `/en#servicios`, `/en/about`, none of the `es.json` `shell.notFound.*` strings present) and run it green against the build.

---

## Phase 5: User Story 3 — Search engines never index a not-found page (P1)

**Goal**: `noindex`, no canonical/hreflang, out of the sitemap, shells gone.
**Independent test**: `contracts/build-output.md` §§ 1–3.

- [x] T018 [US3] Extend `tests/not-found-output.test.ts`, per locale, on the `<head>` only: exactly one `<title>` = `pages.notFound.title`; exactly one `<meta name="robots" content="noindex">`; no `rel="canonical"`; no `hreflang`; no `og:url`, `og:locale`, `og:title`, `og:description`, `name="description"`.
- [x] T019 [US3] Extend `tests/not-found-output.test.ts`: should not write `200.html` or `404.html` at the output root; should list no `<loc>` containing `404` in `sitemap.xml`.
- [x] T020 [US3] Run the full `pnpm test`; `tests/seo-output.test.ts` and `tests/static-output.test.ts` must pass **unedited**. If one fails, stop and report to the leader rather than editing feature 35's contract.

---

## Phase 6: User Story 4 — One LED, language button to the other home (P2)

**Goal**: nav CTA absent on the 404 (with and without scripting); language button → other home.
**Independent test**: LED count = 1; `site-nav__cta` absent; toggle href; other pages unchanged.

- [x] T021 [US4] In `app/features/shell/logic/useShellNavigation.ts` read `useError()` and make `navCta` `computed<ResolvedShellItem | undefined>` returning `undefined` while an error is shown; doc comment citing `research.md` R4 F24–F25 and the README "un solo LED por pantalla" rule.
- [x] T022 [US4] In `app/features/shell/ui/SiteNav.vue` make `cta` optional and render the `div.site-nav__cta` wrapper **and** the `<noscript>` override only when `cta` is set (`v-if`); update the prop doc comment. With `cta` set the markup must be identical to today.
- [x] T023 [P] [US4] Extend `app/features/shell/ui/SiteNav.test.ts`: should render neither the CTA nor its noscript override when `cta` is absent; should render both when present (existing behaviour).
- [x] T024 [P] [US4] Add a "without CTA" story to `app/features/shell/ui/SiteNav.stories.ts`.
- [x] T025 [US4] Extend `tests/not-found-output.test.ts`, per locale: exactly one `class="led ` occurrence; zero `site-nav__cta` occurrences (also inside `<noscript>`); the nav's `a[hreflang]` href is `/en` in es and `/es` in en. Add one regression assertion that `en/about/index.html` still contains `visible opacity-100 site-nav__cta` and `en/index.html` still contains `invisible opacity-0 site-nav__cta`.

---

## Phase 7: User Story 5 — The empty radar (P3)

**Goal**: three rings, 700/500/300 → 420/300/180, colours via tokens, decorative.
**Independent test**: token test + measurement in quickstart § 4.

- [x] T026 [P] [US5] In `app/assets/css/global.css` add the tokens of `research.md` R6 — ring tokens (`--not-found-rings`, `--not-found-ring-mid-inset`, `--not-found-ring-inner-inset`, `--not-found-ring-w`, `--not-found-ring-{outer,mid,inner}-color`) in `:root` next to the `--purpose-arc-*` block, spacing tokens (`--spacing-not-found-*`) in `@theme inline`, each with a comment giving the reference value and derivation. No `glow` namespace.
- [x] T027 [P] [US5] Create `tests/not-found-tokens.test.ts` reading `global.css` from disk: each token exists with the exact value of `research.md` R6; ring tokens are declared in the `:root` block, not `@theme inline`; no new `--color-glow-`/`--spacing-glow-` name.
- [x] T028 [US5] Create `app/features/shell/ui/NotFoundRings.vue` per `contracts/components.md`: `<div aria-hidden="true" class="not-found-rings pointer-events-none absolute">` with three `<span>`s; `<style scoped>` sets width/height `var(--not-found-rings)`, `left: 50%; top: 50%; transform: translate(-50%, -50%)`, rings `border-radius: 50%` with `border: var(--not-found-ring-w) solid var(--not-found-ring-*-color)` and `inset: 0` / `var(--not-found-ring-mid-inset)` / `var(--not-found-ring-inner-inset)`. No animation. Doc comment: why a transform here is allowed (`SectionBackdrop.vue` contract), why `:root` tokens (§ R18).
- [x] T029 [P] [US5] Create `app/features/shell/ui/NotFoundRings.test.ts`: should be hidden from assistive technology; should render three rings; should not intercept pointer events (class present). Extend `tests/not-found-output.test.ts`: one `aria-hidden="true"` rings element with three children per document.

---

## Phase 7b: Red background glow (gate G4) — part of US5

**Goal**: the reference's top-right red bloom, through `SectionBackdrop` + `SectionGlow`, on `--layer-glow`.
**Independent test**: output test + quickstart § 4 glow measurement.

- [x] T035 [P] [US5] In `app/assets/css/global.css` (`@theme inline`, next to the other `--spacing-not-found-*`) add `--spacing-not-found-glow-x: clamp(12.875rem, -10.2rem + 94.6667vw, 75rem)` and `--spacing-not-found-glow-y: clamp(9rem, 10.7143rem - 1.9048vw, 10.25rem)` with comments giving the derivation of `research.md` R6b (reference `.bg__blob--red`, centre viewport − 160 / page-y 240, minus page margin and reference header) and the UNVERIFIED nav-height caveat. Extend `tests/not-found-tokens.test.ts` with both exact values and an assertion that neither matches `/--(?:color|spacing)-glow-/`.
- [x] T036 [US5] In `app/features/shell/ui/NotFoundContent.vue` add, as the section's first child, `<SectionBackdrop><SectionGlow color="red-400" :opacity="60" size="1400-700" class="absolute top-not-found-glow-y left-not-found-glow-x -translate-x-1/2 -translate-y-1/2" /></SectionBackdrop>` (imports from `@/shared/ui/`). Doc comment: gate G4, the 55→60 % and 1440→1400/700 deltas (R6b), why no new glow token (§ R36), and that the section must keep `position: relative`, no stacking context, no opaque background (`SectionBackdrop.vue` contract). Do **not** edit `SectionGlow.vue`, `SectionBackdrop.vue` or their tests.
- [x] T037 [US5] Tests: in `app/features/shell/ui/NotFoundContent.test.ts` — should render one aria-hidden backdrop with one glow carrying `from-glow-red-400-60` and `size-glow-1400-700` before the rings; in `tests/not-found-output.test.ts`, per locale — exactly one `section-backdrop` element with `aria-hidden="true"` inside the not-found section, containing `from-glow-red-400-60`, `size-glow-1400-700`, `left-not-found-glow-x`, `top-not-found-glow-y`. Update `NotFoundContent.stories.ts` so the story renders the glow (it needs the composed background story setup used by `SectionBackdrop.stories.ts`).

---

## Phase 8: Polish & verification

- [x] T030 Compare the four existing pages' script-stripped `<body>` with the T001 baseline (FR-004); differences other than build hashes/payload ids are a defect to fix, not to accept.
- [x] T031 Run quickstart § 3 (CloudFront simulator + CDP probe) at 1440 and 390 on all listed URLs and the two click checks, once in Stage 1 (English for every missing path) and once with `STAGE=2`; paste the outputs into `docs/harness/progress/current.md`. Any URL rewritten to `/…/404`, any console line, exception or extra non-200 request is a failure.
- [x] T032 Run quickstart § 4 measurements (ring sizes ± 1 px, glow layer and centre, no horizontal scroll, document not lengthened, no-JS rendering, reduced motion, nav height vs reference) and record the numbers in `docs/harness/progress/current.md`.
- [x] T033 Run `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build`; all green. Confirm `package.json`/`pnpm-lock.yaml` unchanged (no new dependency).
- [x] T034 Record any technical finding (e.g. Nitro never writing non-200 routes, `payload.path` rewriting the URL) in `docs/harness/findings.md` or as a comment next to the code — never in `docs/business/`. Remind the leader that `contracts/edge-not-found.md` is Roberto's to apply.

---

## Dependencies & execution order

- Phase 1 → Phase 2. Inside Phase 2: T002, T003/T004 in parallel; T005 → T006; T007 independent; T008, T009 need T003 (+T005 for T009); T010 needs T008, T009 and T012/T013.
- US1 (T011–T016) needs Phase 2; T012 needs T026's spacing tokens to style correctly — do T026 before T012 or alongside (no blocking at compile time, utilities simply resolve once tokens exist).
- US2 needs US1 (same component, adds a row). US3 needs US1. US4 is independent of US2/US3 but needs Phase 2. US5's T028 is needed by T012 to compile — create a minimal `NotFoundRings.vue` early if working strictly in order, then finish it in Phase 7.
- Phase 8 last.

### Parallel opportunities

- T002 ∥ T003 ∥ T004 ∥ T007 ∥ T026 ∥ T027 ∥ T035.
- Phase 7b: T035 any time; T036 after T012; T037 after T036 (and T011 for the output-test file).
- Within US1: T014 ∥ T015 after T012.
- Within US4: T023 ∥ T024 after T022.

## Implementation strategy

MVP = Phase 2 + US1 + US3 (a correct, non-indexable 404 for every missing path — superseded detail: the fallback is English per G5/G6). Then US2 (parity), US4 (single LED), US5 (rings), Phase 8. The edge contract is applied by Roberto in muush-foundation independently; this repository's work is complete without it, but D3 (status 404 in production) is only true after it.
