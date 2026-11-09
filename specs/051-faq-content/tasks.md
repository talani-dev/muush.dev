# Tasks: Preguntas frecuentes (FAQ) with the real questions

**Input**: `specs/051-faq-content/` (spec, plan, research, data-model, contracts, quickstart, open-questions with Roberto's answers)
**Prerequisites**: Roberto's answers of 2026-11-08 (1B, 2A, 3A, 4A, 5 `.pen` export, 6A, 7A, 8 A+B), encoded in `spec.md`. Constitution 2.1.5 (`faq` in Article I) already applied.
**Tests**: required by Constitution Article X (unit for `logic/`/`data/`, component per `ui/`, stories, build-output). Test names `should … when …`.
**Module path**: `app/features/faq/`.

## Phase 1: Setup

- [x] T001 [P] Add lucide `plus.svg`, `chevron-right.svg`, `message-circle.svg` (24 viewBox, stroke `currentColor`, no width/height colour literals) to `app/assets/icons/` and list them in `app/assets/icons/README.md`.
- [x] T002 [P] Create the module skeleton `app/features/faq/{ui,logic,data}/` and `app/features/faq/index.ts` (barrel, empty exports for now).
- [x] T003 [P] Poster (spec FR-020, OQ-5): copy `specs/051-faq-content/assets/poster-escritorio-h3JSJ.png` (1440 × 600, the `.pen` band layer) and convert it with `cwebp` to `app/assets/backgrounds/preguntas-acanalado.webp`, overwriting the old file (same name, same import). Pick a quality that keeps it in the range of the other posters in that folder (75–140 KB) without visible banding; report the bytes and quality used. Never render a substitute. `poster-movil-xJCj0.png` is not used: the preset holds one poster (research R4).

## Phase 2: Foundational (blocks every story)

- [x] T004 Move `SUPPORT_EMAIL` from `app/features/shell/data/footerColumns.ts` to new `app/shared/data/supportEmail.ts`; update `footerColumns.ts` and its test imports.
- [x] T005 Add the FAQ copy to `i18n/locales/es.json` and `i18n/locales/en.json` per `data-model.md` § 1, copied verbatim from `Landing Page/handoff/preguntas-muush-1.0/contenido/preguntas-{es,en}.json`; write links/email as `{privacy}`, `{about}`, `{email}` placeholders (never a literal `@`, rules.md § R26); set `pages.faq.title`/`description` to the JSON `meta`; add `faq.tabsLabel` "Temas"/"Topics" (non-visible copy, flagged at the gate); add `shell.nav.faq` "Preguntas"/"FAQ"; delete `shell.faq.*`.
- [x] T006 [P] Add a content test `tests/faq-copy.test.ts` that reads both locale files from disk (rules.md § R27) and the two handoff JSON files' text copied into a fixture `tests/fixtures/faq-approved.{es,en}.json`, asserting: 5 topics with 5/5/4/3/3 questions, every question equal to the JSON, every answer equal to the JSON once placeholders are filled with the link texts and `support@muush.dev`, meta title/description equal, no "Mientras tanto"/"In the meantime".
- [x] T007 Tracking catalogue (spec D6, FR-024): in `app/shared/data/trackingEvents.ts` add `FAQ_TOPIC_IDS = ['assessment', 'pricing', 'process', 'delivery', 'work_with_muush'] as const`, `FaqTopicId`, and the union member `{ name: 'faq_question_open'; params: { faq_topic: FaqTopicId; faq_question: number } }` with a docblock (GA4 only, Roberto 2026-11-08, OQ-8 B; open only). Do **not** add it to `CLICK_EVENT_NAMES` or to `META_EVENT_BY_NAME`. Update the file's header docblock ("five features emit" → six, adding `faq`) and the `faq` row of the CTA table to "Agenda una llamada, correo (card and question 19)" with source `faq data/faqTopics.ts`.
- [x] T008 [P] Tests for T007: `app/shared/data/trackingEvents.test.ts` pins `FAQ_TOPIC_IDS`; `app/features/tracking/logic/googleAnalytics.test.ts` sends a `faq_question_open` with exactly its two params; `app/features/tracking/logic/metaPixel.test.ts` › "should never send …" also covers `faq_question_open` (the "three conversions and nothing else" test stays as is).
- [x] T009 Create `app/features/faq/data/types.ts` and `app/features/faq/data/faqTopics.ts` (`FAQ_TOPICS`, `FAQ_CARD`) per `data-model.md` § 2: per-locale anchors, `trackingId` per topic, key paths, link destinations by route name (`privacy`; `about` + `SECTION_ANCHORS.workWithUs`), `email: true` on t5 q2, card track `book_call_click`/`faq`, `CALL_BOOKING_URL`, email track `contact_click`/`email`/`faq`.
- [x] T010 [P] Unit test `app/features/faq/data/faqTopics.test.ts`: 20 questions, unique anchors per locale, anchors equal the handoff ids, tracking ids equal `FAQ_TOPIC_IDS` in order, each link placeholder present in its answer key's ES and EN string.
- [x] T011 Add tokens to `app/assets/css/global.css` (one commented group "Preguntas · feature 51", fluid 390 → 1440 where both anchors exist): columns (left 420, gap 72, right offset 68, left gap 36), tab (padding 16×18 / chip 10×14, radius 14 / full, gap 8, blur 18, number 13→12/600, name 16→14/500, chevron 18), question (radius 16→18, padding 18 → 24×28, gap 14, gap list 10→12, text 16→19/500 lh 1.35, button 30→34, icon 14→16, answer 15→16 lh 1.6), card (radius 20→22, padding 24→28, gap 12→14, icon box 40→44 radius 14, icon 20, title 22→24 tracking −0.6, text 15 lh 1.5, blur 24), heading 34→56 tracking −1.02→−1.96 lh 1.1, subtitle 16→18 lh 1.5, band (top 68→84, height 300→600), inner mobile spacings (chips `28 0 0 24`, questions `20 24 0 24`, card section top 32), and the `borde-faq-activo` gradient-border utility (Red muush 500 33 % → Blanco 6 %, vertical). **No outer framing token** (OQ-1 = B): the block reuses `portada-alto` / `seccion-arriba` / `seccion-aire`. In the group comment, record the fallback (handoff 200 → 300 top, 64 → 200 bottom, no centring) in case Roberto rejects the centred look. Names never reuse the retired `--spacing-preguntas-*`.
- [x] T012 [P] Extend `tests/design-tokens.test.ts` with a `describe('design tokens · preguntas (feature 51)')` pinning the 390 and 1440 values of the T011 tokens and asserting no `--spacing-faq-arriba` / `--spacing-faq-abajo` exists; keep the "retired tokens never come back" assertions unchanged.
- [x] T013 Update `app/shared/data/backgroundPresets.ts` `faq` preset to the README uniforms (`data-model.md` § 6), `compactUniforms` = same + `u_ribs: 18`, `u_th: 0.26`; rewrite its comment (band 1440×600 / 390×300 from the page top, feature 51, handoff `preguntas-muush-1.0`, poster = `.pen` export `h3JSJ`); update `app/shared/data/backgroundPresets.test.ts`.

## Phase 3: User Story 1 — find the answer (P1) 🎯 MVP

**Goal**: both pages show the header, the five topics and the accordion with the approved copy. **Independent test**: open `/es/preguntas` and `/en/faq`; every topic shows its questions; every question opens.

- [x] T014 [P] [US1] Pure helpers + tests in `app/features/faq/logic/topicHash.ts` / `.test.ts`: `topicIndexFromHash(hash, anchors)` (unknown/empty → 0, leading `#` and URI-decoding handled), `nextTabIndex(current, key, count)` (ArrowLeft/Right wrap, Home, End, else null), `counterpartAnchor(hash, from, to)` (same topic index, other locale's anchor; unknown → none).
- [x] T015 [US1] `app/features/faq/logic/useFaqAccordion.ts` + test: `useFaqAccordion(topic: Ref<ResolvedFaqTopic>)` (the selected topic, so it knows `trackingId` and each question's `number`); `openIndex` starts 0, `toggle(i)` opens i / closes if open, `reset()` → 0. `toggle(i)` that opens calls `emitTrackingEvent({ name: 'faq_question_open', params: { faq_topic, faq_question } })` from `@/shared/logic/trackingBus` with the selected topic's `trackingId` and the question's `number`; tests (with `onTrackingEvent` + `resetTrackingBus`): opening emits once with the right params; closing emits nothing; `reset()` and the initial state emit nothing; open → close → open emits twice; values are only ids and a number (spec FR-024).
- [x] T016 [US1] `app/features/faq/logic/useFaqTopics.ts` + test: `selected` 0 at render, re-selected from `route.hash` on mount (no event), `select(i)` calls the accordion `reset`, `onKeydown` uses `nextTabIndex` and focuses the new tab by id.
- [x] T017 [US1] `app/features/faq/logic/useFaqContent.ts` + test: resolves `FAQ_TOPICS`/`FAQ_CARD` for the active locale into `ResolvedFaqTopic[]`/card (`data-model.md` § 3): titles, questions with `number` 1–20, `trackingId`, `answerKey` + `answerParams`, `answerText` plain (links → link text, email → address), link `href`s through `localePath` (+ `#trabaja-con-muush`), `mailto:` href and `contact_click`/`email`/`faq` track attrs.
- [x] T018 [P] [US1] `app/features/faq/ui/FaqQuestion.vue` + `.test.ts` + `.stories.ts` per `contracts/ui-contract.md` (h3 > button `aria-expanded`/`aria-controls`, region always rendered and `hidden` when closed, `<i18n-t>` with slots for links and email, plus/x icon, closed/open looks with `borde-faq-activo`; emits `toggle` only, never tracking).
- [x] T019 [P] [US1] `app/features/faq/ui/FaqTopicTabs.vue` + test + stories: tablist/tab roles, roving tabindex, number/title/chevron, active/inactive looks; below 1024 a chip row with `overflow-x-auto`, `snap-x snap-mandatory`, no right padding, selected chip scrolled into view (instant under reduced motion); emits `select`, forwards `keydown`.
- [x] T020 [P] [US1] `app/features/faq/ui/FaqBand.vue` + test + story: absolutely positioned box from the block's top edge (band top/height tokens, full width, `aria-hidden`) hosting `ShaderBackground preset="faq"`; test that it is not inside the centred content layer.
- [x] T021 [US1] `app/features/faq/ui/FaqSection.vue` + test + stories (ES/EN × 390/1440): block `relative isolate flex min-h-portada-alto flex-col pt-seccion-arriba pb-seccion-aire` (the framing of `StatusSection.vue` today, spec FR-019, OQ-1 = B), FaqBand as a sibling of a `relative z-10 flex flex-1 flex-col justify-center` content layer holding Pill (pill-air rule), Heading `level 1` two lines with the FAQ heading token, subtitle, tabs, five `tabpanel`s (inactive `hidden`), questions, and the card slot; ≥1024 two-column grid with the 68 right-column offset; <1024 stacked with the inner mobile spacings. Component test pins the framing classes, like the other first blocks' tests. Under 200 lines (extract a `FaqPanel.vue` if needed).
- [x] T022 [US1] Export the public API from `app/features/faq/index.ts` (`FaqSection`, `useFaqContent`, `faqQuestionNodes` from T029, added then) and rewrite `app/pages/faq.vue` to compose `FaqSection` with `useFaqContent()`; update its docblock (feature 51; no more "En construcción").
- [x] T023 [US1] Remove the Preguntas use of the status block: delete `app/features/shell/data/faq.ts`, `app/features/shell/logic/useFaqContent.ts` and their tests (`faq.test.ts`, the faq cases of `statusSectionContent.test.ts`); drop the `faq` row and the `FAQ_PRIMARY`/`FAQ_SECONDARY` import of `app/features/shell/data/trackedItems.test.ts` (lines 9, 47) and cover the new card/email track attrs in the `faq` module's tests instead; narrow `StatusPreset` to `'notFound'` in `app/features/shell/data/types.ts`; drop the `faq` rows from `StatusSection.vue` maps, comment, test and stories, and the `faq` entry of `app/features/shell/ui/shellFixtures.testing.ts` (status fixtures, ~line 268–285); update `app/features/shell/index.ts`. 404 tests stay green unchanged.
- [x] T024 [US1] Update `tests/static-output.test.ts`: replace the "En construcción 🚧"/"Under construction 🚧" expectations (lines 146–149) with `contracts/build-output.md` § 1 items 1, 2, 4, 5 and 7 for both documents.
- [x] T025 [P] [US1] Add the new files to `tests/token-literals.test.ts` (replace `shell/data/faq.ts`; keep `pages/faq.vue`).

## Phase 4: User Story 2 — link to one topic (P2)

**Independent test**: open the 10 topic URLs; the right tab is selected; select a topic and switch language.

- [x] T026 [US2] In `useFaqTopics.ts`, on a user `select` write the locale anchor with `history.replaceState(history.state, '', '#' + id)` (no scroll, no new entry); tests cover it and that the initial hash selection does not rewrite the URL. Verify in the built site that no extra `page_view` is sent (spec FR-013).
- [x] T027 [US2] Language switch keeps the topic: let the FAQ page tell the toggle the counterpart anchor (`counterpartAnchor`, same topic index, other locale) through a small, route-scoped hook in `app/features/shell/logic/resolveLocaleDestination.ts` (explicit `hash` argument already supported); read the selected index, not `route.hash` (replaceState bypasses the router, research R3). Unit test ES `#precios` → EN `#pricing`, `#trabaja-con-muush` ↔ `#work-with-muush`, unknown hash → no hash, other routes unchanged; LanguageToggle tests stay green.

## Phase 5: User Story 3 — keyboard and screen reader (P2)

- [x] T028 [US3] Component tests in `FaqTopicTabs.test.ts`/`FaqSection.test.ts`: Left/Right wrap, Home/End, focus moves, only selected tab `tabindex=0`, panel `aria-labelledby`; `FaqQuestion.test.ts`: `aria-expanded` toggles, `aria-controls` points to an existing region. Check the band and icons are `aria-hidden`.

## Phase 6: User Story 5 — search engines and assistants (P2)

- [x] T029 [US5] `app/features/faq/logic/faqStructuredData.ts` + test: `faqQuestionNodes(topics)` → 20 `defineQuestion({ name, acceptedAnswer: { text } })` inputs in page order from `answerText`.
- [x] T030 [US5] Generalise `app/features/shell/logic/usePageSeo.ts`: `pageType?: 'AboutPage' | 'WebPage' | 'FAQPage'` and `extraNodes?`; for `WebPage`/`FAQPage` the replace tag (`replaceWebPageNode`) writes `defineWebPage({ '@type': pageType, potentialAction: [defineReadAction({})] })` followed by `extraNodes` in the same `nodes` array, server-only; update the docblock (FR-038 of spec 046 superseded by feature 51 D1). `app/pages/faq.vue` passes `pageType: 'FAQPage'` and the T029 nodes.
- [x] T031 [US5] Rewrite `tests/seo-output.test.ts` › "never FAQPage" (≈ line 369) into `contracts/build-output.md` § 2 (one FAQPage string type, `inLanguage`, ReadAction, 20 Questions equal to the copy, equal node-type sets across locales) and add § 1 item 3 (title/description/og) for both pages; verify measured output, not assumptions (research R1 INFERRED item).
- [x] T032 [US5] Set `public/llms.txt` to the fenced block of `specs/051-faq-content/contracts/llms-txt.md` (approved, OQ-4 = A) plus a final newline; point `approvedBlock()` in `tests/seo-output.test.ts` to that file; add an assertion that no FAQ question text appears in `llms.txt`; sitemap test still expects 10 URLs.

## Phase 7: User Story 4 — contact card (P3)

- [x] T033 [P] [US4] `app/features/faq/ui/FaqCard.vue` + test + stories: icon box with `message-circle`, h2 title, text via `<i18n-t>` with the `{email}` mail link (`contact_click`/`email`/`faq` track attrs), one `PrimaryButton` (`href` booking URL, new tab, `rel="noopener noreferrer"`, `book_call_click`/`faq` track attrs), full width below 1024; slot it into `FaqSection.vue`.

## Phase 8: User Story 6 — Preguntas in the header (P2, OQ-2 = A)

- [x] T034 [US6] `app/features/shell/data/navigation.ts`: add `{ labelKey: 'shell.nav.faq', destination: { kind: 'route', name: 'faq' } }` after the about item of `NAV_ITEMS` (`MENU_ITEMS` is the same array); rewrite the docblock paragraph "Preguntas is not in the link bar or the menu, permanently …" (lines ~17–21) with Roberto's 2026-11-08 decision (OQ-2 = A, revokes features 43/46; the footers keep their links too). Rewrite the `MENU_ITEMS` and `NAV_CTA` comments only if they mention three items.
- [x] T035 [US6] Measure the header with four items at 1024, 1280, 1440 and 1920 (built site, CDP device metrics): the link bar stays centred, no overlap with the logo or the end group, no wrap. If 1024 overflows, stop and report with captures (do not shrink tokens on your own).
- [x] T036 [US6] Update every test that pins "Preguntas not in the nav" or three nav items:
  - `app/features/shell/data/navigation.test.ts`: `NAV_ITEMS` `toEqual` (lines 7–20) gains the faq item; "should carry no Preguntas item when the link bar or the menu is read" (lines 23–29) becomes "should list Preguntas last, by route name, when the link bar or the menu is read".
  - `tests/static-output.test.ts`: the header describe comment (lines ~486–491, "never Preguntas"); "should never render Proyectos or Preguntas inside the nav" (lines ~524–533) keeps only Proyectos/Projects and a new test asserts the four labels in order with the faq href (`contracts/build-output.md` § 1b); "should mark Nosotros as the current page …" (lines ~375–394) adds `/es/preguntas` → `Preguntas` and `/en/faq` → `FAQ`.
  - `tests/shell-copy.test.ts` "should carry the approved nav copy when read" (lines ~60–70): adds `shell.nav.faq` ("Preguntas" / "FAQ") and drops the stale "Preguntas returns with feature 46" comment.
  - `app/features/shell/ui/MobileMenu.test.ts`: the items fixture (line ~27) and "should list the items in Poppins 32 …" (lines ~134–150, `['Inicio', 'Servicios', 'Nosotros']`) → four items.
  - `app/features/shell/ui/NavLinkBar.test.ts`: fixture and expected pairs (lines ~10, ~23) → four items.
  - `app/features/shell/ui/SiteHeader.test.ts`: the `ITEMS` fixture (line ~28) → four items (the `toHaveLength(3)` at line ~165 counts the nav's grid children, not items: unchanged).
  - `app/features/shell/ui/shellFixtures.testing.ts`: `SHELL_COPY.es.items` and `SHELL_COPY.en.items` (lines ~50–54 and ~155) gain Preguntas / FAQ.
  - Stories reading those fixtures: `NavLinkBar.stories.ts`, `MobileMenu.stories.ts`, `SiteHeader.stories.ts` (check they render four items; add a story with Preguntas current).
  - `app/features/shell/data/trackedItems.test.ts` `nav` row (line 36) needs no change (route items carry no track) — confirm it stays green.
- [x] T037 [US6] Superseded spec text (docs only, done by the spec_author on 2026-11-08, not the implementer): add a "Superseded by feature 51 (Roberto 2026-11-08, OQ-2 = A)" note next to `specs/046-secondary-pages/spec.md` Context line ~45–46 ("The header link bar stays Inicio · Servicios · Nosotros"), User Story 3 scenario 4 (lines ~209–211), FR-029 (line ~419) and FR-032 (line ~428); and FR-038 for the FAQPage (D1). `specs/043-site-shell/spec.md` FR-024 (lines ~425–429) is historical (pre-46, it already says feature 46 adds the item back) and stays as is; line ~592 got a pointer. `docs/business/muush-1.0.md` § 3 line 79 ("por ahora solo En construcción") is human-only: reported to the leader, not edited.

## Phase 9: Measurement plan

- [x] T038 Update `docs/harness/progress/tracking-plan-49.md` (spec FR-026): § 4 table gains the row `faq_question_open` | "A question of the FAQ is opened (not on close, not the automatic first one)" | `faq_topic` (`assessment`, `pricing`, `process`, `delivery`, `work_with_muush`), `faq_question` (1–20) | ✅ | —; the custom-dimension list gains `faq_topic`, `faq_question`; the `assessment_cta_click` row's `cta_location` list loses `faq` (the FAQ card no longer has "Diagnóstico gratis"); § 9's "After the first events arrive" gains the two FAQ dimensions (event scope). Note "Roberto, 2026-11-08, feature 51 OQ-8".

## Phase 10: Polish

- [x] T039 Measure at 1440×900 and 390×844 (CDP device metrics, findings.md § R44/R60) against `referencias/*.png` (everything but the vertical framing, FR-019; record where the title lands relative to the band for Roberto), and at 360/768/1024/1280/1920 for no horizontal scroll, clipping or overlap, header included; save captures under the session scratchpad and list them in the implementation report.
- [x] T040 Run `./init.sh` (Biome, typecheck, `pnpm test`, `pnpm generate`, `pnpm storybook:build`) until green; run quickstart.md steps 2–9.
- [x] T041 Update `docs/harness/progress/current.md`; report to the leader: the framing result for Roberto's look (OQ-1 fallback ready if he rejects it), the poster bytes, values to pass to Clau for the `.pen` (R32: the four-item nav, the centred framing, `faq.tabsLabel`), the two GA4 dimensions Roberto must register, and the post-deploy Search Console re-indexing of both URLs.

## Dependencies

- T002 before T009. T003 only blocks the visual check (T039).
- Phase 2 (T004–T013) before all stories; T007 before T009 (`FaqTopicId`) and T015.
- US1 (T014–T025) before US2, US3, US5, US4 (they extend its files). US2, US3, US5, US4 are independent of each other afterwards.
- US6 (T034–T036) needs only T005 (`shell.nav.faq`); T035 needs a build. T037 and T038 are docs, any time.

## Parallel examples

- Phase 1: T001, T002, T003 together.
- Phase 2: T006, T008, T010, T012 in parallel once T005/T007/T009/T011 exist.
- US1: T014 first; then T018, T019, T020 together; T025 any time.
- After US1: T026–T027 (US2), T028 (US3), T029–T032 (US5), T033 (US4), T034–T036 (US6) in parallel streams.

## Implementation strategy

MVP = Phase 1 + 2 + US1: the real questions replace "En construcción" in both locales. Then US5 (SEO), US6 (header), US2, US3, US4, measurement plan, polish. One feature, one branch, no commits unless Roberto asks.
