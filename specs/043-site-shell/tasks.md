# Tasks: Muush 1.0 site shell (feature 43)

**Input**: `specs/043-site-shell/` (spec.md, plan.md, research.md, data-model.md, contracts/components.md, quickstart.md)
**Tests**: required (Constitution Article X, spec FR-050). Within each story, write or update the tests first and see them fail.
**Branch**: stay on `feat/v2-site-shell`. Do not commit unless Roberto asks. No version bump (AGENTS.md § 3.1).

Format: `- [ ] Txxx [P?] [Story?] description with path`. `[P]` = different file, no dependency on an unfinished task.

Ground rules for every task:

- Visual values come from `docs/harness/progress/pen-extract-43.md` (as encoded in spec FR-001…FR-038 and research R15). Never take a value from the v1 docs or the handoff CSS where they differ from the extract, and never invent one. If a value is missing, stop and ask the leader.
- New and rewritten files: no hex, rgb or px literal, no v1 token or v1 utility (`*-ink-*`, `*-bone-*`, `*-red-4*`, `*-wine-*`, `glass-dark`, `glass-line`, `font-poppins`, `font-instrument`), no version marker in any name. Literals only in `global.css` token declarations and `public/favicon.svg`.
- No v2 file imports anything from a `legacy/` directory.
- Components under 200 lines; logic in composables; imports through `@/features/…`, `@/shared/…`, `@/assets/…`.
- Test names: `should <expected> when <condition>`.
- The clarification answers (spec Clarifications Q1–Q5, FR-028 scroll-spy) were confirmed by Roberto 2026-11-01, with Q2 and Q4 as amended there; implement them as written and do not re-decide them.

---

## Phase 1: Setup (tokens, quarantine)

- [x] T001 Add the shell tokens of research R15 to the v2 `:root` block and the `@theme inline` block of `app/assets/css/global.css` (header offsets 24/16, heights 64/60, mobile radius 18, link-bar padding/gap 6, link padding 10/18, active dot 6, right-group gaps 12/8, language 40, controls 36, social 48/44, menu row padding 16 and list offset, menu label 32, footer paddings and gaps, contact row radius 14 and padding 14/16, footer type sizes 11/12/13/14/15 and tagline 17→20 clamp, wordmark 22 as `text-marca`, X 14 and stroke 1.6, burger line 16×1.5 and gap 4, Blanco 8 %/15 %/85 % only if not already defined). Reuse `--nav-fondo`, `--texto-suave`, `--linea`, `--linea-fuerte`, `--vidrio-fondo`. Each block gets a comment citing pen extract § and frame id.
- [x] T002 Add `--header-offset` (76 px below `lg`, 88 px from `lg`, in rem), `html { scroll-padding-top: var(--header-offset) }` and `@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth } }` to `app/assets/css/global.css`, with a comment citing research R5 (Nuxt's default `scrollBehavior` reads `scroll-padding-top` and follows CSS `scroll-behavior`).
- [x] T003 `git mv` the v1 shell UI into `app/features/shell/ui/legacy/`: `SiteNav.vue`, `MobileMenu.vue`, `SiteFooter.vue`, `FooterColumn.vue`, `NotFoundContent.vue`, `NotFoundRings.vue` with their `.stories.ts` and `.test.ts`. Rewrite their relative imports to `@/features/shell/…` aliases (e.g. `LanguageToggle` → `@/features/shell/ui/LanguageToggle.vue`). Keep their story titles under `Legacy v1/Shell/…`. Update `app/features/shell/index.ts` so `NotFoundContent` is exported from `./ui/legacy/NotFoundContent.vue`. Run `pnpm test` and `pnpm typecheck`: green before continuing.

---

## Phase 2: Foundational (shared data, marks, shell data and logic)

**Blocks every story.**

### Shared

- [x] T004 [P] Write `app/shared/data/sectionAnchors.test.ts` (four ids exactly as data-model § 1, unique, `/^[a-z-]+$/`), then create `app/shared/data/sectionAnchors.ts` exporting `SECTION_ANCHORS`, `SectionAnchor` and a doc comment naming features 44, 45, 46 as the sections' owners.
- [x] T005 [P] Write tests then create `app/shared/ui/Isotipo.vue` per contracts § 1: inline SVG with the existing geometry (`viewBox="14.5 38.5 70.5 39.5"`, circle 21/45/r 6.5, path `M21 72a17 17 0 0 1 34 0 12 12 0 0 1 24 0`, stroke-width 12, round cap — exactly the logo SVG, not the design's thinner stroke; Clarifications Q2, confirmed by Roberto 2026-11-01), stroke `currentColor`, dot `fill-red-muush-500`, `aria-hidden`, sized by a `size-isotipo` token (40×22). Test file `app/shared/ui/Isotipo.test.ts`; story `app/shared/ui/Isotipo.stories.ts` titled `Shared/UI/Isotipo` on the `negro` background.
- [x] T006 [P] Write tests then create `app/shared/ui/Wordmark.vue` (Poppins `text-marca` 22, baseline, runs `muush` 600 Blanco · `.` 600 Red muush 500 · `dev` 400 Gris 400; Clarifications Q3) with `Wordmark.test.ts` and `Wordmark.stories.ts` (`Shared/UI/Wordmark`).
- [x] T007 Write tests then create `app/shared/ui/Lockup.vue` (`form?: 'full' | 'isotipo'`, gap 10, 176×31 full) composing `Isotipo` and `Wordmark`, with `Lockup.test.ts` and `Lockup.stories.ts` (`Shared/UI/Lockup`, both forms, 390 and 1440 viewports). Depends on T005, T006.
- [x] T008 [P] Write tests then create `app/shared/ui/SocialIcon.vue` (`network` prop; inlines `@/assets/social/{linkedin,instagram,tiktok}.svg?raw`; `aria-hidden`; colour from `currentColor`) exporting `type SocialNetwork`, with `SocialIcon.test.ts` and `SocialIcon.stories.ts` (`Shared/UI/SocialIcon`).
- [x] T009 [P] Add `Poppins` weight 400 to `nuxt.config.ts` fonts (`[400, 500, 600]`), rewriting the comment (400 = the wordmark's "dev" run, Clarifications Q3, confirmed by Roberto 2026-11-01); add an assertion for the 400 face to `tests/static-output.test.ts`.

### Shell data

- [x] T010 Update `app/features/shell/data/types.ts` per data-model § 2: anchor destination `{ kind: 'anchor'; name; anchor: SectionAnchor }`, the `legacyHash` member (doc: removed by feature 46), `ContactChannel`, `ResolvedContactChannel`, `current?: 'page' | 'section'`, and `SocialNetwork` re-exported from `@/shared/ui/SocialIcon.vue`. Depends on T004, T008.
- [x] T011 [P] Rewrite `app/features/shell/data/navigation.ts` (`NAV_ITEMS`, `NAV_CTA`, `MENU_ITEMS` per data-model § 3; doc comment records Q5: Preguntas is added by 46) and write `app/features/shell/data/navigation.test.ts`. Remove `SHELL_ANCHORS`.
- [x] T012 [P] Rewrite `app/features/shell/data/footerColumns.ts` (four columns per data-model § 4, Blog as `kind: 'none'`) and `footerColumns.test.ts`; keep `SUPPORT_EMAIL`, `WHATSAPP_URL` and the WhatsApp `messageKey`.
- [x] T013 [P] Create `app/features/shell/data/contactChannels.ts` with `MOBILE_CONTACT_CHANNELS` (WhatsApp, call, email + `hintKey`), `MOBILE_FOOTER_LINKS` and `LEGAL_ITEMS` (`none` until 48), plus `contactChannels.test.ts` asserting order and that privacy/terms/blog have no destination.
- [x] T014 [P] Update `app/features/shell/data/notFound.ts` and `notFound.test.ts`: shortcuts keep Propósito via `{ kind: 'legacyHash', name: 'index', hash: '#proposito' }` and Servicios via `{ kind: 'anchor', name: 'index', anchor: SECTION_ANCHORS.services }`.

### Shell logic

- [x] T015 Extend `createShellItemResolver` in `app/features/shell/logic/useShellItemResolver.ts` and its test: anchor href = `localePath(name) + '#' + anchor`; `legacyHash` href = `localePath(name) + hash`; optional `activeAnchor` dependency; `current: 'page'` for the matching route item, `'section'` for the matching anchor item on its own route, absent otherwise and on the 404. Depends on T010.
- [x] T016 [P] Extend `app/features/shell/logic/useMobileMenu.ts` and its test: `close(reason: 'dismiss' | 'navigate' = 'dismiss')`, readonly `lastCloseReason`; Esc, history and breakpoint close with `dismiss`; `releaseScroll` restores with `window.scrollTo({ top, left: 0, behavior: 'instant' })` (research R5). Test both.
- [x] T017 [P] Extend `app/features/shell/logic/useNavScrollReveal.ts` and its test with `reveal()` (clears the hidden state and the downward accumulator). Keep the 80 px zone, 10 px anti-bounce and forced-visible-while-menu-open rules unchanged.
- [x] T018 [P] Write `app/features/shell/logic/useFocusTrap.test.ts` then create `useFocusTrap.ts` (contracts § 8): Tab from the last focusable goes to the first, Shift+Tab from the first goes to the last, only while `active()`; listener removed on scope dispose.
- [x] T019 [P] Write `app/features/shell/logic/useActiveSection.test.ts` (stubbed `IntersectionObserver`: null on server/without the API/at the top, set while intersecting, null when it leaves, disconnect on dispose, re-observe on route change) then create `useActiveSection.ts` (research R8; doc comment cites the confirmation by Roberto 2026-11-01).
- [x] T020 Update `app/features/shell/logic/useShellNavigation.ts`: drop `useNavCtaReveal` and `showNavCta`; `navCta` always resolved (Q1); add `contactChannels`, `mobileFooterLinks`, `legalItems`, `homeLabel`; wire `useActiveSection` (enabled on route `index`) into the resolver. Doc comment: `useNavCtaReveal` is left for 44/47 to delete. Depends on T011–T015, T019.

### Shared background and i18n

- [x] T021 [P] Make `poster` optional in `app/shared/data/backgroundPresets.ts`, add the `mobileMenu` preset (data-model § 6, comment: no poster in the handoff, pen extract § 4) and extend `backgroundPresets.test.ts`; update `app/shared/ui/ShaderBackground.vue` to render the poster `<img>` only when present, with a test for a poster-less preset.
- [x] T022 Update `i18n/locales/es.json` and `en.json` per data-model § 5: new keys, `shell.nav.cta` → "Diagnóstico gratis" / "Free assessment", removed v1-only keys in both. Update `tests/shell-copy.test.ts` to the v2 shell copy (keep the WhatsApp message, proper-noun and `{'@'}` escape assertions). Run `tests/i18n-parity.test.ts`.

**Checkpoint**: `pnpm typecheck && pnpm test` green.

---

## Phase 3: User Story 1 — Desktop navigation (P1) 🎯 MVP

**Goal**: floating desktop nav with lockup, link bar, language button and CTA. **Independent test**: `Shell/SiteHeader` story at 1440 ES/EN vs pen extract § 2; click every control on the generated site.

- [x] T023 [P] [US1] Write tests then create `app/features/shell/ui/NavLinkBar.vue` (contracts § 4): pill with `bg-nav-fondo`, top-lit edge Blanco 20 %→4 %, blur 24, padding/gap 6; items 15/500 padding 10/18; active fill Blanco 8 %, Blanco text, 6×6 dot; `aria-current` per `current`. Test + story `Shell/NavLinkBar`.
- [x] T024 [US1] Restyle `app/features/shell/ui/LanguageToggle.vue` with `variant?: 'desktop' | 'mobile'` (contracts § 2) without touching any behaviour function; update only class assertions in `LanguageToggle.test.ts`; retitle its story to `Shell/LanguageToggle` with both variants and both locales.
- [x] T025 [US1] Write tests then create `app/features/shell/ui/SiteHeader.vue` desktop row (contracts § 3): fixed header, container 1280 at y 24, height 64, space-between (lockup link with `homeLabel` | `NavLinkBar` | toggle + `PrimaryButton` nav size), `print:hidden`, hide state via `useNavScrollReveal` (`translateY(-140%)` + opacity 0, `--medio`, `ease-muush`, `motion-reduce:transition-none`). Story `Shell/SiteHeader` (1440, ES/EN, items with Servicios active and none active).
- [x] T026 [US1] Rewrite `app/layouts/default.vue` per contracts § 10: `SiteHeader`, `MobileMenu` (wired in US3), `SiteFooter` (wired in US6) from the barrel; `inert` wrapper; root `relative isolate min-h-screen overflow-x-clip bg-negro-950`; rewrite the doc comment (no dots, spotlight or glows; header floats). Export `SiteHeader` from `app/features/shell/index.ts`.
- [x] T027 [P] [US1] Retarget v1 section ids to `SECTION_ANCHORS` (research R3): `app/features/landing/ui/ContactSection.vue` → `assessment`, `ServicesSection.vue` → `services`, `app/features/landing/data/heroContent.ts` `contactHash` → `#diagnostico`, `app/features/about/ui/WorkWithMuushSection.vue` → `workWithUs`; update their tests and the hero story's `contactHref`. Each section also gets a one-line comment naming feature 43.

**Checkpoint**: desktop nav works on `/es`, `/en`, `/es/nosotros`, 404.

---

## Phase 4: User Story 2 — Language switch without regression (P1)

**Goal**: features 21/33/37/39 behaviour intact in both header variants and the menu. **Independent test**: existing toggle, locale-preference, not-found tests + quickstart § 4.

- [x] T028 [US2] Add `SiteHeader.test.ts` cases: the toggle receives `localeSwitchHref`, `localeSwitchLabel`, `inPlace`; `switchInPlace` is re-emitted as `switchLocale`, from both variants.
- [x] T029 [US2] Update `tests/not-found-output.test.ts` for the v2 header: the nav landmark selector, and the feature 36 assertions that the 404 has no nav CTA (`site-nav__cta`, noscript override, `lg:min-h-nav-cta-h`) now assert the CTA **is** present (Clarifications Q1, confirmed by Roberto 2026-11-01), with a comment citing Q1. Keep every locale and in-place-switch assertion.
- [x] T030 [US2] Run the unchanged behavioural suites (`LanguageToggle.test.ts`, `localePreference.test.ts`, `switchLocaleInPlace.test.ts`, `resolveLocaleDestination.test.ts`, `notFoundLocale.test.ts`, `useNotFoundDocument.test.ts`) and record in the implementation report that only class assertions changed (SC-003).

---

## Phase 5: User Story 3 — Mobile bar and menu (P1)

**Goal**: mobile bar and full-screen menu per pen extract §§ 3–4. **Independent test**: `Shell/MobileMenu` and `Shell/SiteHeader` at 390, keyboard and reduced-motion checks.

- [x] T031 [P] [US3] Write tests then create `app/features/shell/ui/MenuButton.vue` (contracts § 5; `open` three lines, `close` X 14×14 stroke 1.6 round caps; 36×36 radius 12, 1 px `linea-fuerte`) with story `Shell/MenuButton`.
- [x] T032 [P] [US3] Write tests then create `app/features/shell/ui/SocialLinks.vue` (contracts § 7; sizes `menu` 48 filled `bg-nav-fondo` / `footer` 44 outline; `aria-label`, external attributes; `SocialIcon` in Blanco) with story `Shell/SocialLinks`.
- [x] T033 [US3] Add the mobile bar to `app/features/shell/ui/SiteHeader.vue` (below `lg`: 60 tall, y 16, gutter inset, radius 18, `bg-nav-fondo`, 1 px `linea`, blur 20, padding 0 10 0 16; isotipo link; mobile toggle; `MenuButton` only after mount; `reveal()` on `focusin`; focus the menu button when the menu closes with `dismiss`). Tests for each. Story at 390 ES/EN.
- [x] T034 [US3] Write tests then create `app/features/shell/ui/MobileMenu.vue` (contracts § 6): `v-if` + `<Transition>`; Negro 950 base, `ShaderBackground preset="mobileMenu"`, glass Negro 950 70 % blur 24; top bar copy with isotipo, mobile toggle and Cerrar; items Poppins 32/500 column (offset per token, gap 6, row padding 16, no arrows; stagger 0/40/80 ms, none under reduced motion); divider `linea`; `SocialLinks size="menu"`; `role="dialog"`, `aria-modal`, `aria-label`; focus Cerrar on open; `useFocusTrap`. Emits `close`, `itemChosen`, `switchLocale`. Tests: Esc via composable, link emits before navigation, focus trap, dialog semantics. Story `Shell/MobileMenu` (390, ES/EN; one with WebGL unavailable).
- [x] T035 [US3] Wire `MobileMenu` in `app/layouts/default.vue` and export it from the barrel: `itemChosen` → `close('navigate')`, `close` → `close('dismiss')`, `switchLocale` → `switchLocale` then `close('navigate')`; header and content wrapper `inert` while open.

---

## Phase 6: User Story 6 — Footer (P1)

**Goal**: desktop and mobile footers per pen extract § 6. **Independent test**: `Shell/SiteFooter` at 1440 and 390, ES/EN; every link followed on the generated site.

- [x] T036 [P] [US6] Write tests then create `app/features/shell/ui/FooterColumns.vue` (contracts § 7; headings 11/600 tracking 1 `uppercase` Gris 400; links 15/400 Blanco 85 %; no-href items as `<span>`; external `target="_blank" rel="noopener noreferrer"`; `mailto:` same tab).
- [x] T037 [P] [US6] Write tests then create `app/features/shell/ui/MobileFooter.vue` (brand gap 10; contact rows full width `bg-vidrio-fondo` radius 14, 1 px `linea`, padding 14/16, label 15/600, hint 13/400 Gris 400 + decorative `→`; links line 15/400 `texto-suave` wrapping; `SocialLinks size="footer"`; legal block with Carbón 700 top border, 12/400 Gris 400, privacy/terms as `<span>`).
- [x] T038 [US6] Write tests then create `app/features/shell/ui/SiteFooter.vue` composing `Lockup`, `FooterColumns` (from `lg`, padding 72 80 40 80, gap 56, brand 340 wide gap 18, tagline Poppins 20/500 tracking −0.4, category 14/1.5 Gris 400; bottom row with copyright and legal `<span>`s, 13/400 Gris 400, 1 px Blanco 8 % border) and `MobileFooter` (below `lg`). Story `Shell/SiteFooter` (1440 and 390, ES/EN). Wire it in `app/layouts/default.vue` and the barrel.

---

## Phase 7: User Story 4 — Smart header (P2)

- [x] T039 [US4] Add `SiteHeader.test.ts` cases: hidden class applied when `isNavVisible` is false; never hidden while the menu is open; `focusin` calls `reveal()`; `motion-reduce:transition-none` present. Verify on the generated site per quickstart § 4.

## Phase 8: User Story 5 — Active nav state (P2, confirmed by Roberto 2026-11-01)

- [x] T040 [US5] Add `useShellNavigation`/resolver integration tests (or a `SiteHeader` test with resolved items) for: nothing current at the top of home, Servicios `'section'` while observed, Nosotros `'page'` on about, nothing on the 404, SSR output equals first client state. Name the tests' describe block "scroll-spy (spec FR-028, confirmed by Roberto 2026-11-01)".

## Phase 9: User Story 7 — Canvas and favicon (P2)

- [x] T041 [US7] Remove `DotGrid`, `CursorSpotlight` and `useCursorSpotlight` from `app/layouts/default.vue` (if not already in T026) and add `hidden` to the root of `app/shared/ui/legacy/SectionBackdrop.vue` with a comment citing feature 43 and Roberto 2026-11-01; update `SectionBackdrop.test.ts` if it pins classes.
- [x] T042 [US7] Update the build/layout tests that pinned the spotlight or the dot grid (`tests/static-output.test.ts`, `tests/spotlight-red-dots-tokens.test.ts`, any `default.vue` test) to assert their **absence**, each with the comment "supersedes feature 42 acceptance 'El cursor personalizado y el spotlight siguen funcionando' for the spotlight (Roberto, 2026-11-01)". Keep `tests/brand-cursor.test.ts` unchanged and green.
- [x] T043 [P] [US7] In `public/favicon.svg` change the circle fill `#CF3147` → `#E5352F` and the adaptive stroke `#262626` → `#050505` (Negro 950, light chrome) and `#FBF8F6` → `#F4F4F2` (Blanco, dark chrome), and update its comment (`muush-1.0.md` § 2; Clarifications Q4, confirmed by Roberto 2026-11-01: no v1 hex remains, geometry kept). Add a test (in `tests/static-output.test.ts` or a new `tests/favicon.test.ts`) pinning the colours, the absence of the v1 values and the unchanged path.
- [x] T044 [P] [US7] Rewrite the Spanish layer table and its paragraph in `app/assets/css/global.css` (~lines 136–160) to describe the Negro 950 canvas and the remaining stack (review-42b advisory 3); mark `--layer-glow`, `--layer-dots`, `--layer-spotlight` as v1-only for feature 47.

## Phase 10: User Story 8 — Feature 42 follow-ups (P3)

- [x] T045 [P] [US8] Wrap the shader import in `app/shared/logic/useShaderCanvas.ts` `start()` in `try/catch` that calls `fallBack()`; add a test with a rejecting loader asserting fallback state and no unhandled rejection (advisory 1).
- [x] T046 [P] [US8] Remove `size?: 'hero'` from `app/shared/ui/GlassButton.vue` and any story/test argument that passes it (advisory 2).
- [x] T047 [US8] Review the feature 42 primitives' stories and the new shell stories at 360, 768, 1024, 1280 and 1920 px and under emulated forced colours (advisory 7); record pass/defect per component in the implementation report. Fix defects inside this feature's files; record others with an owner feature. If no browser is available to the implementer, mark the item UNVERIFIED for the leader.

---

## Phase 11: Polish & cross-cutting

- [x] T048 Extend `tests/token-literals.test.ts` to scan every new or rewritten file in `app/features/shell/{ui,logic,data}` (excluding `legacy/`) and the four new shared components (SC-007).
- [x] T049 [P] Grep `app/` for `legacy/` imports from non-legacy files (must be none except the barrel's `NotFoundContent` and the layout-free legacy files themselves) and for `m1`/`v2` in new names; fix any hit.
- [x] T050 [P] Confirm no story outside `Legacy v1/` renders a v1 shell component, and that `Shell/` contains only v2 components (FR-042).
- [x] T051 Run `./init.sh` (typecheck, check, test, generate, storybook:build); if another build holds the lock, wait and rerun.
- [x] T052 Walk `quickstart.md` §§ 4–8 on the generated site and write `docs/harness/progress/impl_site_shell.md`: what changed, the review-42b follow-up table (FR-045…FR-049, SC-008), the visual check results, and how each confirmed resolution (Q1–Q5, FR-028; Roberto 2026-11-01) was applied.

---

## Dependencies

- Phase 1 → Phase 2 → stories. T003 before any shell UI task.
- US1 (T023–T027) before US2 (T028–T030) and US3 (T031–T035).
- US6 (T036–T038) needs Phase 2 and T026; it can run in parallel with US3.
- US4 (T039) and US5 (T040) need T025 and T033 (header). US7 (T041–T044) needs T026. US8 (T045–T047) is independent after Phase 2.
- Polish (T048–T052) last.

## Parallel examples

- Phase 2: T004, T005, T006, T008, T009 together; then T011, T012, T013, T014; then T016–T019, T021.
- US3: T031 and T032 together, then T033, T034, T035.
- US6: T036 and T037 together, then T038.
- US7/US8: T043, T044, T045, T046 together.

## Implementation strategy

MVP = Phases 1–3 (desktop nav on the new canvas). Then US2 (regression proof), US3 (mobile), US6 (footer) — together these replace the whole v1 shell. Then US4, US5, US7, US8 and polish. Stop at each checkpoint with tests green.

---

## Amendment 2026-11-01 — Home link added by Roberto 2026-11-01

Reopened scope (spec FR-052…FR-056).

- [x] T053 [B] Add `readShaderDefaults` (`app/shared/utils/shaderUniformDefaults.ts`) with tests against both real shaders; extend `withShaderDefaults` to merge shader `@default` → engine base → preset; read the defaults in `useShaderCanvas.start()`; fix the `backgroundPresets.ts` comment; test that a missing uniform takes its `@default` and an explicit preset value wins.
- [x] T054 [B] Verify every preset (homeHero ES/EN, howWeWork, assessment, aboutHero, workWithUs, faq, notFound, mobileMenu) in headless Chrome with SwiftShader WebGL, against the posters and against a control that reproduces the old zeros.
- [x] T055 [A] Add the `top` destination kind, `NAV_HOME`, `FOOTER_DESTINATIONS.home`, the Home entries in NAVEGACIÓN and the mobile line, and the i18n keys `shell.nav.homeLink`, `shell.footer.nav.home` (ES/EN).
- [x] T056 [A] `useActiveSection` `atTop` (second observer), resolver `atTop` + `scrollsToTop`, `useShellNavigation` wiring gated by `isHome`; `scrollToTopIfCurrent` used by `NavLinkBar`, `MobileMenu`, `ShellItemLink`.
- [x] T057 [A] Update tests, fixtures and stories in both locales (`HomeTop` stories for `NavLinkBar` and `SiteHeader`); update `tests/static-output.test.ts` and `tests/not-found-output.test.ts` (home lit, 404 never).
- [x] T058 Run `./init.sh`; append the reopen section to `docs/harness/progress/impl_site_shell.md`.

## Amendment 2026-11-01 — Static grain and header isotipo, Roberto 2026-11-01

Reopened scope (spec FR-057…FR-059).

- [x] T059 Seed the grain hash in `finish()` of `liston.glsl` and `acanalado.glsl` with `gl_FragCoord.xy` only, with a divergence comment; test it in `backgroundPresets.test.ts`; drop the byte-identical claims (spec 042 R8/plan/T001, `backgroundPresets.ts`); verify motion-on frames in SwiftShader WebGL.
- [x] T060 Render the header logo as the isotipo alone at every width (`SiteHeader.vue`), footers unchanged; update `SiteHeader.test.ts`, the story doc and `tests/static-output.test.ts`; verify at 390 and 1440 in both locales.
- [x] T061 Run `./init.sh`; append "Reopened 2" to `docs/harness/progress/impl_site_shell.md`.

## Amendment 2026-11-01 — Grain 0.03, Roberto 2026-11-01

Reopened scope (spec FR-060).

- [x] T062 Set `SHADER_DEFAULTS.u_grain` to 0.03 in `app/shared/utils/shaderFrame.ts`; update the engine-value tests (`shaderFrame.test.ts`, `useShaderCanvas.test.ts`, engine-base case of `shaderUniformDefaults.test.ts`); leave the `.glsl` `@default` tests at 0.07; verify the grain σ and the listón/ribs in headless Chrome WebGL.
- [x] T063 Run `./init.sh`; append "Reopened 3" to `docs/harness/progress/impl_site_shell.md`.


## Amendment 2026-11-01 — Language switch keeps position, Roberto 2026-11-01

Reopened scope (spec FR-061).

- [x] T064 Drop any fragment `switchLocalePath` returns in `resolveLocaleDestination`; add `logic/localeSwitchScroll.ts` (capture/resolve, pure, plus the held position) and `logic/useLocaleSwitchScroll.ts` (router guards + `page:loading:end` restore, `meta.scrollToTop = false` for the held navigation only), wired in `useShellNavigation`; the toggle holds the position on a plain click instead of carrying the hash; unit tests for all three; update `LanguageToggle.test.ts` (fragment cases now assert the hold; cookie and 404 cases unchanged in meaning).
- [x] T065 Verify in headless Chrome on `.output/public`: Home form, Home with `#servicios`, Nosotros/About at Trabaja con muush, hero fallback, the open mobile menu; 390 and 1440; with and without reduced motion; 404 in-place switch.
- [x] T066 Run `./init.sh`; append "Reopened 4" to `docs/harness/progress/impl_site_shell.md`.
