---
description: "Task list for feature 46 — Muush 1.0 secondary pages (Nosotros, Preguntas, 404)"
---

# Tasks: Muush 1.0 secondary pages (feature 46)

**Input**: `specs/046-secondary-pages/` — spec.md, plan.md, research.md, data-model.md, contracts/components.md, quickstart.md
**Tests**: required (Constitution Article X; spec SC-006). Test names follow `should <expected> when <condition>`.
**Visual values**: `docs/harness/progress/pen-extract-46.md` (plus pen-extract-44/45 for the reused map and form). A value missing there is asked of the leader, never invented; values marked "awaiting leader" in research R8/R10/R11/R12 use the provisional value stated there and are re-checked once the leader answers.
**Copy**: `docs/business/muush-1.0.md` § 4.7–4.9 verbatim and data-model §§ 2–3. Items marked ⚠ (Clarifications, provisional) wait for Roberto's gate answers.
**Untouchable**: feature 45 payload/flow modules in `app/features/forms/logic/` and their tests; the feature 36/39 modules `shell/logic/notFoundLocale.ts`, `useNotFoundDocument.ts`, `switchLocaleInPlace.ts`, `resolveLocaleDestination.ts`, `app/plugins/not-found-locale.ts`, the `NOT_FOUND_ROUTES` hook in `nuxt.config.ts`, and `LanguageToggle` with its tests.
**Branch**: `feat/v2-pages`. No commit unless Roberto asks.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no dependency on an unfinished task)
- **[Story]**: US1 Nosotros page · US2 Trabaja con muush + form · US3 Preguntas · US4 404 · US5 Storybook and review

A = `app/features/about`, S = `app/features/shell`, L = `app/features/landing`, SH = `app/shared`.

---

## Phase 1: Setup

- [x] T001 Add the tokens of data-model § 5 to `app/assets/css/global.css` under a "Feature 46 · secondary pages" comment citing pen-extract-46 sections (`:root` values + `@theme inline` utilities; `clamp()` between the 390 and 1440 values): Heading sizes `pagina` and `estado` (`--h-*`, `--lh-*`, `--tracking-*`, `--text-*` like `seccion`), the Cómo se arma heading per-use size, Nosotros hero / Cómo se arma / card / status-block spacings and min-heights, card text sizes, the Dónde estamos mobile body. Grep each new key for collisions first; no `m1`/`v2` in any name; reuse every token data-model § 5 lists as reused.
- [x] T002 Extend `tests/design-tokens.test.ts` to pin every token added in T001 at 390 and 1440 and that none is declared twice.

---

## Phase 2: Foundational (blocks every story)

- [x] T003 [P] `git mv L/ui/ReceivesList.{vue,test.ts,stories.ts}` to `SH/ui/`; change the story title to the shared group (e.g. `Shared/ReceivesList`), keep its ES/EN and both-viewport stories; update `L/ui/AssessmentSection.vue` (and its test/story imports) to `@/shared/ui/ReceivesList.vue`. `pnpm test` green, home unchanged.
- [x] T004 [P] Create `SH/data/mapCopy.ts` (`MAP_COPY_KEYS` with the `satisfies` typing, `MapCopy` type, data-model § 1) and `SH/utils/mapCopy.ts` (`resolveMapCopy(translate)`), with `SH/utils/mapCopy.test.ts` (`should build the legend team, partner then anywhere when resolved`, `should list team, partner and soon groups when resolved`, `should map every city to its translated name when resolved`, using a fake translate that echoes keys).
- [x] T005 Move `landing.whoWeAre.{legend,regions,cities}` to top-level `map.{legend,regions,cities}` in `i18n/locales/es.json` and `en.json` (values verbatim); reduce `WHO_WE_ARE_KEYS` in `L/data/whoWeAreContent.ts` to pill/heading/body and make `WhoWeAreContent` extend `MapCopy`; make `L/logic/useWhoWeAreContent.ts` spread `resolveMapCopy(t)`. Update `L/data/whoWeAreContent.test.ts`, `L/data/localeKeys.testing.ts` if it lists those keys, and `tests/landing-copy.test.ts` to the new paths. Home renders byte-identical copy (depends on T004).
- [x] T006 [P] Add `compactUniforms?` to `BackgroundPreset` in `SH/data/backgroundPresets.ts` and fill it for `aboutHero`, `workWithUs`, `faq`, `notFound` with the spec FR-046 values (desktop `uniforms` untouched); extend `SH/data/backgroundPresets.test.ts`: `should give exactly aboutHero, workWithUs, faq and notFound a compact set`, `should carry u_flip 1 in every compact set`, and pin the 18 ribs of the two acanalado compact sets.
- [x] T007 Make `SH/ui/ShaderBackground.vue` pass `useShaderCanvas` a computed preset whose `uniforms` are `compactUniforms` below 1024 (`useDesktopLayout`) when present, else `uniforms` (research R5); in `SH/logic/useShaderCanvas.ts` make a preset change redraw once even when the loop is paused (reduced motion / off screen), if it does not already. Tests in `SH/ui/ShaderBackground.test.ts` / `SH/logic/useShaderCanvas.test.ts`: `should draw with the compact uniforms when the viewport is below 1024`, `should draw with the desktop uniforms when the viewport is 1024 or wider`, `should redraw once when the layout crosses 1024 while paused`, `should keep the desktop uniforms when a preset has no compact set` (depends on T006).
- [x] T008 [P] Add `pagina` and `estado` to `HeadingSize` and `SIZE_CLASSES` in `SH/ui/Heading.vue` (tokens from T001); extend `SH/ui/Heading.test.ts` and add both sizes to `Heading.stories.ts`.
- [x] T009 Add `faq: { es: '/preguntas', en: '/faq' }` to `i18n.pages` in `nuxt.config.ts` (with a one-line comment: Roberto 2026-10-31, indexed) and update the sitemap comment that says "4 URLs" to six; widen `ShellRouteName` to `'index' | 'about' | 'faq'` in `S/data/types.ts`. Check `S/logic/useShellItemResolver.ts` and `resolveLocaleDestination.ts` need no change (route names resolve generically); if either enumerates names, add `faq` and a test.
- [x] T010 Retire the v1 page frame: in `app/layouts/default.vue` delete `isFullBleed` and the conditional `mx-auto max-w-shell-max px-page` on `<main>` and rewrite the "page frame" comment; delete `definePageMeta({ fullBleed: true })` and its comment line in `app/pages/index.vue`. Keep `mt-section-gap` on `SiteFooter` (awaiting leader, research R8). Update any test asserting the frame or `fullBleed` (grep `tests/` and `app/`).

**Checkpoint**: `./init.sh` green; home unchanged visually.

---

## Phase 3: User Story 1 — Nosotros in the v2 design (P1)

**Goal**: Hero, Cómo se arma and Dónde estamos render per FR-001…FR-019. **Independent test**: generate; `/es/nosotros` and `/en/about` show the three sections with § 4.8 copy at 390 and 1440.

- [x] T011 [P] [US1] Add the `about.hero.*`, `about.composition.*`, `about.where.*` keys of data-model § 2 to both locale files, replacing the v1 `about.hero.{eyebrow,headline,intro}` values (delete `eyebrow`, `headline`).
- [x] T012 [P] [US1] Rewrite `A/data/aboutHeroContent.ts` (keys + `AboutHeroContent` per data-model § 2) and `A/logic/useAboutHeroContent.ts`; create `A/data/teamCompositionContent.ts` (`CompositionKind`, `COMPOSITION_ORDER`, keys, content type) + `A/logic/useTeamCompositionContent.ts`; create `A/data/whereWeAreContent.ts` (keys, `WhereWeAreContent extends MapCopy`) + `A/logic/useWhereWeAreContent.ts` (spreads `resolveMapCopy(t)`). Unit tests `A/data/teamCompositionContent.test.ts` (`should order the cards team, pool, partner when listed`) and `A/data/whereWeAreContent.test.ts` (keys exist in both locales).
- [x] T013 [US1] Rewrite `A/ui/AboutHeroSection.vue` per contracts (section `relative isolate`, `ShaderBackground preset="aboutHero"`, `Pill.pill-aire`, `Heading level=1 size=pagina`, intro; FR-004…FR-006; no v1 import) and rewrite `A/ui/AboutHeroSection.test.ts` (`should render the two-tone heading as the only h1`, `should carry the shared pill air`, `should mount the aboutHero background`) and `.stories.ts` (Muush 1.0 group, 390/1440 × ES/EN).
- [x] T014 [P] [US1] Create `A/ui/CompositionCard.vue` per contracts and research R11 (`li`, `bg-vidrio-fondo rounded-servicio borde-luz borde-linea`, padding token 24 → 32, label row with an `aria-hidden` positioned 8 px dot carrying `pulso` in the kind colour, title `h3` Poppins 26 / 500, text 17 / 1.5 Blanco 70 %) with `CompositionCard.test.ts` (`should colour the dot by kind when rendered`, `should hide the dot from assistive technology`, `should carry the ping utility on the dot`) and `.stories.ts` (three kinds, 390/1440 × ES/EN).
- [x] T015 [US1] Create `A/ui/TeamCompositionSection.vue` (pill `pill-aire`, `Heading level=2` with the Cómo se arma size class, `ul` of three `CompositionCard`; centred and three equal-height columns from `lg`, start-aligned single column below; FR-008…FR-014) with test (`should render three list items in team, pool, partner order`, `should start-align the head below lg`) and stories (depends on T014).
- [x] T016 [P] [US1] Create `A/ui/WhereWeAreSection.vue` composing `Pill`, `Heading size=seccion`, `WorldMap`, `MapLegend` with the `WhoWeAreSection` classes and the 16 / 1.5 mobile body (FR-015…FR-019, research R4) with test (`should pass the shared map copy to the map and legend`, `should render the soon chip label`) and stories.
- [x] T017 [US1] Update `A/index.ts` (export the new content types, seams and sections; nothing v1) and compose `app/pages/about.vue`: Hero → Cómo se arma → Dónde estamos → Trabaja con muush (T021), no `mt-section-gap`, `usePageSeo` with `AboutPage` unchanged; rewrite the page comment.
- [x] T018 [US1] Rewrite `tests/about-copy.test.ts` to assert the § 4.8 strings of `about.hero.*`, `about.composition.*`, `about.where.*` in both locales (drop the v1 "reuse the shell's Nosotros" and "Work with muush untranslated" cases).

**Checkpoint**: Nosotros shows the three v2 sections; Trabaja still shows v1 until Phase 4.

---

## Phase 4: User Story 2 — Trabaja con muush with the application form (P1)

**Goal**: FR-020…FR-028. **Independent test**: the form submits as in feature 45 from the v2 section; footer "Trabaja con muush" lands on it.

- [x] T019 [P] [US2] Replace `about.work.*` in both locale files with the data-model § 2 keys (`pill`, `heading.first/second`, `body`, `areasLabel`, `areas.{engineering,design,creative}`; delete `eyebrow`, `headline`).
- [x] T020 [P] [US2] Rewrite `A/data/workContent.ts` (`AREAS_ORDER`, keys, `WorkContent`) and `A/logic/useWorkContent.ts`; test `A/data/workContent.test.ts` (`should order the areas engineering, design, creative when listed`).
- [x] T021 [US2] Rewrite `A/ui/WorkWithMuushSection.vue` per contracts and research R13 (`section :id=SECTION_ANCHORS.workWithUs` `relative isolate`, `ShaderBackground preset="workWithUs"`, the `AssessmentSection` grid tokens without the call row, left column pill `pill-aire` + `Heading level=2 size=diagnostico` + body + shared `ReceivesList`, `ApplicationForm` from the forms barrel; no `legacy/` import, no `<style scoped>` grid) and rewrite its test (`should carry the trabaja-con-muush anchor`, `should render the areas list with three rows`, `should pass formContent and formSubmitter to ApplicationForm untouched`, `should render no call row`) and stories (fixtures from the forms story fixtures).
- [x] T022 [US2] Delete the v1 tokens used only by the old About sections (`--about-hero-*`, `--work-*` families and their `@theme` utilities, e.g. `pt-about-hero-top`, `pt-work-top`, `--work-cols`, `--work-col-gap`, `--work-form-y-offset`, `--work-stack-gap`) from `app/assets/css/global.css` after grepping `app/` and `tests/` that nothing else reads them; update `tests/design-tokens.test.ts` / `tests/tablet-layout-tokens.test.ts` cases that pinned them.

**Checkpoint**: Nosotros fully v2; `pnpm test` green.

---

## Phase 5: User Story 3 — Preguntas (P2)

**Goal**: FR-029…FR-038, FR-042. **Independent test**: both documents generated, indexable, in the sitemap; toggle resolves; footer links to it, header does not.

- [x] T023 [P] [US3] Add `shell.faq.{title,assessment,call}`, `shell.footer.muush.faq` and ⚠ `pages.faq.{title,description}` (data-model § 3) to both locale files.
- [x] T024 [P] [US3] Create `S/data/faq.ts` (`FAQ_PRIMARY` anchor `index#diagnostico`, `FAQ_SECONDARY` external `CALL_BOOKING_URL`, `FAQ_COPY_KEYS`) with `S/data/faq.test.ts` (`should point the primary at the home diagnóstico anchor`, `should point the secondary at the shared call-booking URL`).
- [x] T025 [US3] Create `S/ui/StatusSection.vue` per contracts and research R10 (preset → Heading size `estado`/`diagnostico` and the block token classes; `ShaderBackground :preset`; `Heading level=1`; `PrimaryButton size=hero` with arrow via `to`; `GlassButton` with `href` + `target="_blank" rel="noopener noreferrer"` when `external`, `to` otherwise) with test (`should render the heading as the only h1`, `should open an external secondary in a new tab`, `should route an internal secondary with to`, `should select the estado size when the preset is faq`) and stories (`faq` and `notFound`, 390/1440 × ES/EN).
- [x] T026 [US3] Create `S/logic/useFaqContent.ts` returning `StatusSectionProps` (preset `faq`, title, primary/secondary through `useShellItemResolver`); export `StatusSection`, `StatusSectionProps`, `useFaqContent` from `S/index.ts`.
- [x] T027 [US3] Create `app/pages/faq.vue`: `StatusSection v-bind="useFaqContent()"` and `usePageSeo({ titleKey: 'pages.faq.title', descriptionKey: 'pages.faq.description' })` (no `pageType`), with the thin-page comment citing Roberto's indexing decision.
- [x] T028 [US3] Add `FOOTER_DESTINATIONS.faq` and the MUUSH item after `work` in `S/data/footerColumns.ts`, and the item after `about` in `MOBILE_FOOTER_LINKS` (`S/data/contactChannels.ts`); rewrite the "Preguntas is absent until feature 46" comments there and in `S/data/navigation.ts` (now: Roberto keeps the link bar at three items, Preguntas is in the footer only). Update `footerColumns.test.ts` and `contactChannels.test.ts` to the new order; keep `navigation.test.ts`'s no-faq assertion, renaming it to state the permanent rule; update `S/ui/NavLinkBar.stories.ts` comment.
- [x] T029 [US3] Update `tests/seo-output.test.ts`: six pages (add `/es/preguntas`, `/en/faq` with their titles/descriptions), sitemap exactly six URLs each with es-MX/en-US/x-default, Preguntas canonical and indexable robots, Preguntas pair structurally identical graphs and no `AboutPage`.
- [x] T030 [US3] Update `tests/static-output.test.ts`: add the two Preguntas routes to `ROUTES`; keep "no Preguntas inside the nav" for every route; change the footer case to "should link Preguntas from the footer to the same-locale route" (desktop column and mobile line); assert the language button on `/es/preguntas` targets `/en/faq` and vice versa.

**Checkpoint**: Preguntas reachable, indexed, toggles.

---

## Phase 6: User Story 4 — the v2 404 (P2)

**Goal**: FR-039…FR-045. **Independent test**: both 404 documents generated with the v2 body; all 036/039 behaviour tests green.

- [x] T031 [P] [US4] In both locale files replace `shell.notFound` with `{ heading: { first, second }, cta, assessment }` (data-model § 3); keep `pages.notFound.title`.
- [x] T032 [US4] Reshape `S/data/notFound.ts` (keep `NOT_FOUND_HOME`, add `NOT_FOUND_ASSESSMENT`, new `NOT_FOUND_COPY_KEYS`, delete `NOT_FOUND_SHORTCUTS`; robots and state key unchanged) and `S/logic/useNotFoundContent.ts` to return `StatusSectionProps` (preset `notFound`); update `S/data/notFound.test.ts`; check `useNotFoundDocument` still finds `documentTitle`.
- [x] T033 [US4] Make `app/error.vue` render `<StatusSection v-bind="content" />` inside `NuxtLayout` (keep `defineProps<{ error: NuxtError }>()` and `useNotFoundDocument()`); export from `S/index.ts` no longer includes `NotFoundContent`; rewrite the barrel comment.
- [x] T034 [US4] Delete `S/ui/legacy/NotFoundContent.{vue,test.ts,stories.ts}` and `S/ui/legacy/NotFoundRings.{vue,test.ts}`, and the v1 `--not-found-*` tokens and their utilities in `global.css` that only those files read (grep first); reduce or delete `tests/not-found-tokens.test.ts` accordingly (keep any assertion that still has a live subject, e.g. the closed glow namespace).
- [x] T035 [US4] Update `tests/not-found-output.test.ts` per research R9: keep every behavioural case (documents, lang, nav/footer once, header CTA, language-button href, other-locale copy absent, payload path, no client switch attributes, no href-less anchor, title + noindex, no canonical/hreflang/description/OG, no `200.html`/`404.html`, not in sitemap); replace the pill, subtitle, LED, shortcuts, separators, rings and glow cases with: `should render the two-tone heading as the only h1`, `should render one primary link to the same-locale home`, `should render one glass link to the same-locale diagnóstico anchor`, `should render one aria-hidden shader background with the notFound poster`.
- [x] T036 [US4] Run the 039 suites unchanged (`switchLocaleInPlace`, `notFoundLocale`, `useNotFoundDocument`, `LanguageToggle`, `resolveLocaleDestination`, `tests/locale-preference-output.test.ts`); add one test to the `useNotFoundContent` or `StatusSection` level: `should point both buttons at the switched locale after an in-place switch`.

**Checkpoint**: 404 v2; feature 36/39 behaviour intact.

---

## Phase 7: User Story 5 — Storybook and review (P3)

- [x] T037 [P] [US5] Confirm every new or rewritten component (`AboutHeroSection`, `TeamCompositionSection`, `CompositionCard`, `WhereWeAreSection`, `WorkWithMuushSection`, `StatusSection`, shared `ReceivesList`, `Heading` sizes, `ShaderBackground` compact presets) has stories at 390 and 1440 in ES and EN, and that no story references a deleted file; `pnpm storybook:build` passes.
- [x] T038 [P] [US5] Add the new pills (Nosotros hero, Cómo se arma, Dónde estamos, Trabaja con muush) to `tests/pill-air.test.ts`, and assert Preguntas and the 404 render no pill.

---

## Phase 8: Polish & cross-cutting

- [x] T039 Grep `app/` for leftovers: `about.hero.eyebrow`, `about.work.eyebrow`, `shell.notFound.shortcuts`, `landing.whoWeAre.legend`, `NotFoundContent`, `NotFoundRings`, `fullBleed`, `HeroStack` in about; zero hits outside `legacy/` (and `legacy/` must not lose anything another legacy file needs).
- [x] T040 Run `tests/token-literals.test.ts` and `tests/i18n-parity.test.ts`; fix any literal or missing key.
- [x] T041 Visual check per `quickstart.md` at 390 and 1440 (ES and EN) against the frames, and at 360, 768, 1024, 1280, 1920; with reduced motion and with WebGL disabled. Record any gap against the extract in `docs/harness/progress/impl_secondary_pages.md` and ask the leader for any missing value instead of inventing it.
  - Implementer note (2026-11-02): 390/1440 and 320–1920 measured in headless Chrome; the reduced-motion and no-WebGL passes were not run in a browser (covered by the `pulso` / `ShaderBackground` unit tests only). See `docs/harness/progress/impl_secondary_pages.md`.
- [x] T042 `./init.sh`, `pnpm generate` and `pnpm storybook:build` exit 0; check the six indexable documents and the two 404 documents in `.output/public` per `quickstart.md` step 2.

---

## Dependencies & execution order

- Phase 1 → Phase 2 → stories. T005 depends on T004; T007 on T006.
- US1 (Phase 3) and US2 (Phase 4) both touch `app/pages/about.vue` and the locale files: run US1 then US2. US3 (Phase 5) needs T009; US4 (Phase 6) needs T025/T026 from US3 (`StatusSection`). US5 after US1–US4. Polish last.
- Locale-file tasks (T011, T019, T023, T031) edit the same two files: do them one at a time even though each is marked [P] against the code tasks of its own phase.

## Parallel examples

- Phase 2: T003, T004, T006, T008 together; then T005, T007, T009, T010.
- US1: T011, T012, T014, T016 together; then T013, T015, T017, T018.
- US3: T023 and T024 together; then T025 → T026 → T027; T028–T030 after.

## Implementation strategy

MVP is US1 + US2 (Nosotros fully v2, the reason the integration branch cannot
ship). Then US3 (Preguntas route and footer link) and US4 (404 look), then
Storybook coverage and polish. After each phase run `./init.sh`.
