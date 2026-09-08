---

description: "Task list for feature 009 — Hero section"
---

# Tasks: Hero section

**Input**: Design documents from `/specs/009-hero-section/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/components.md`, `quickstart.md`

**Tests**: test tasks are included — `feature_list.json` asks for them, and
Constitution Article X makes a component test and a Storybook story mandatory
for anything with a `ui/` component.

**Organization**: grouped by the four user stories in `spec.md`. US1 and US2
share the same component and are implemented together; US3 and US4 are
separately verifiable increments on top of it.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel — different file, no dependency on an
  incomplete task
- **[Story]**: `[US1]`…`[US4]`, matching `spec.md`
- Every task names its exact file path

## Path Conventions

Nuxt 4 with `srcDir: app/`. Feature modules under `app/features/<name>/` with
`ui/`, `logic/`, `data/` and a barrel (Constitution Article I). Locale files at
`i18n/locales/`. Cross-cutting tests at `tests/`; component tests sit beside
their SFC.

---

## Phase 1: Setup

**Purpose**: confirm the ground this feature stands on, before changing
anything. Every task here is a read or a run, not an edit.

- [x] T001 Read `app/shared/ui/SectionBackdrop.vue`'s doc comment in full — it is the section contract this feature is the first to be bound by, and its failure mode is silent. Then read `research.md` §§ R1, R3, R4 and `data-model.md` §§ 2, 3.
- [x] T002 Run `./init.sh` and confirm it exits 0, so any red that appears later belongs to this feature.
- [x] T003 Confirm `vitest.config.ts` already collects both locations this feature writes tests to — `app/features/**/*.test.ts` (line 31) and `tests/**/*.test.ts` (line 19) — and record that **no `include` change is required** (`rules.md` § R39 applies to the demonstration, not to the config).
- [x] T004 [P] Confirm `.storybook/main.ts`'s `stories` glob (`../app/**/*.stories.@(ts|tsx)`) already covers `app/features/landing/ui/*.stories.ts`, so no Storybook config change is required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: the tokens and the copy. Every later task depends on these, and
two of them carry traps that are invisible if they are got wrong.

**⚠️ Blocks every user story.**

- [x] T005 Add the six layout tokens to `@theme inline` in `app/assets/css/global.css` — `--spacing-hero-top: clamp(4.625rem, 1.5375rem + 12.6667vw, 12.9375rem)` (74→207, `design y − nav height` with the frame-confirmed nav of 103/76), `--spacing-hero-gap` (24→34), `--spacing-hero-cta-gap` (20→28), `--spacing-hero-cta-top` (10→14), `--spacing-hero-body: 56.25rem` (900), `--spacing-hero-measure: 37.5rem` (600). Values verbatim from `data-model.md` § 2.1, each commented with the two frame values it interpolates. Note in the comment that `--spacing-hero-gap` shares its endpoints with `--spacing-glass-dark` but is a different role, so a reviewer does not read it as duplication.
- [x] T006 Add the six glow-anchor tokens to `@theme inline` in `app/assets/css/global.css`, values verbatim from `data-model.md` § 2.2: `foco` x `clamp(24.125rem, 4.5321rem + 80.381vw, 76.875rem)` / y `clamp(-1.625rem, -6.5696rem + 20.2857vw, 11.6875rem)`; `wine` x `clamp(1rem, 0.2107rem + 3.2381vw, 3.125rem)` / y `clamp(4rem, 0.6804rem + 13.619vw, 12.9375rem)`; `cierre` x `clamp(26rem, 4.3179rem + 88.9524vw, 84.375rem)` / y `clamp(27.75rem, 20.2518rem + 30.7619vw, 47.9375rem)`. **Six tokens, not three**: the two viewports place the glows independently and neither derives from the other (spec A-04, D-06). `foco`'s mobile y is deliberately **negative** — its centre sits 26px above the section, behind the nav.
- [x] T007 Comment the six anchor tokens with (a) both measured endpoints in section-relative pixels — 386→1230 / −26→187, 16→50 / 64→207, 416→1350 / 444→767 — and (b) the sentence that **only the endpoints are design-sourced and the interpolation between them is a smoothing choice**. Add the one-line reason the offsets are measured from the section's corner rather than from the page (`rules.md` §§ R29, R48). **Nothing is added to the `:root` block**: no token here derives from another, so § R46's trap does not bind this feature.
- [x] T008 **Guard (`rules.md` § R36)** — grep `app/assets/css/global.css` for `--spacing-glow-` and `--color-glow-` and confirm the eleven new tokens match neither prefix; then run `pnpm vitest run app/shared/ui/SectionGlow.test.ts` and confirm it passes **with zero modifications to that file**. A Hero token inside that closed namespace turns this feature red in a file it never opened.
- [x] T009 [P] Add the five `landing.hero.*` keys to `i18n/locales/es.json` — `eyebrow`, `headline`, `subhead`, `ctaPrimary`, `ctaSecondary` — with the Spanish values in `data-model.md` § 1.1. `ctaSecondary` is `Agenda una llamada` with **no `→`**: the arrow belongs to `LinkArrow` (FR-010).
- [x] T010 [P] Add the same five keys to `i18n/locales/en.json` with the English values. `eyebrow` is `Technology solution studio` — **identical to the Spanish value, on purpose**, verified in all four frames; it must not be translated (FR-009).
- [x] T011 Run `pnpm vitest run tests/i18n-parity.test.ts` and confirm both new key sets match and no value is empty.

**Checkpoint**: tokens and copy exist; nothing renders yet.

---

## Phase 3: User Story 1 + User Story 2 — the Hero renders, over its own glows (Priority: P1)

**Goal**: the landing opens with the design's first section, in both locales
and both viewports, over three glows that paint beneath the dotted paper.

**Why the two stories share a phase**: they are the same component. The glows
are three elements inside the section's own markup — separating them would
mean building the Hero twice.

**Independent test**: generate the site; open all four routes at 390px and
1440px; check the four children, their order, their sizes and their copy
against the frames; then measure the four stacking levels on the page.

### The module, bottom-up (Article II: `data/` → `logic/` → `ui/`)

- [x] T012 [US1] Create `app/features/landing/data/heroContent.ts` with `HERO_KEYS`, the `HeroDestinations` interface, `HERO_DESTINATIONS: HeroDestinations = {}` and the `HeroContent` interface — signatures verbatim from `contracts/components.md`. Both destination fields stay **absent**, each with a doc comment naming the decision that blocks it (`decisions-open.md` #2 for `callUrl`, section 05 for `contactHash`). This file imports nothing.
- [x] T013 [US1] Create `app/features/landing/logic/useHeroContent.ts` exporting `useHeroContent(): ComputedRef<HeroContent>`. It is the module's **only** file allowed to call a Nuxt composable: it translates the five keys with `useI18n`, and resolves `contactHash` — when present — into the locale's home path plus the fragment with `useLocalePath()`. When a destination is absent, **omit the key** rather than setting it to `undefined`, the shape `useShellNavigation` already uses. It must not import anything from `app/features/shell/` (Article III).
- [x] T014 [US1] Create `app/features/landing/ui/HeroSection.vue` as `<script setup lang="ts">` with the seven props of `contracts/components.md`, no emits and no slots. Render the section, the stack and the four children per `data-model.md` § 4: `relative pt-hero-top` on the section, `flex max-w-hero-body flex-col items-start gap-hero-gap` on the stack, `w-full … text-display text-bone-100` on the `<h1>`, `w-full max-w-hero-measure … text-body-lg text-ink-100` on the `<p>`. **It must call zero Nuxt composables** (`rules.md` § R23).
- [x] T015 [US1] In the same file, add the CTA row: `flex flex-col items-start gap-hero-cta-gap pt-hero-cta-top lg:flex-row lg:items-center` — the feature's **only** breakpoint, changing direction and cross-axis alignment and never a size. `items-start` on the mobile axis is what keeps the primary button as wide as its label rather than the column (`ui-map.md` § 3, FR-007).
- [x] T016 [US2] In the same file, add `<SectionBackdrop>` as the section's first child holding the three `<SectionGlow>` instances, with the colour/opacity/size triples and the `left-*` / `top-*` / `-translate-x-1/2 -translate-y-1/2` classes of `data-model.md` § 3.2. Each glow uses **its own pair** of anchor tokens; none reuses `--spacing-hero-top`, which coincides with `wine`'s vertical anchor at 1440 (both 207) and diverges at 390 (74 against 64).
- [x] T017 [US2] Write the component's doc comment to state, where a maintainer will read it: no stacking context anywhere in the subtree except the `translate` on each individual glow (which `SectionBackdrop.vue` explicitly permits), no opaque background, no bottom padding, no horizontal padding (`<main>` already applies `px-page`), and no invented `href` for either control.
- [x] T018 [US1] Create `app/features/landing/index.ts` exporting exactly `HeroSection`, `useHeroContent` and the `HeroContent` type. `HERO_DESTINATIONS` stays internal.
- [x] T019 [US1] Rewrite `app/pages/index.vue` as a thin wrapper: import from `@/features/landing`, call `useHeroContent()`, render `<HeroSection v-bind="hero" />`, keep `useHead({ title: t('site.title') })`. **Delete the placeholder `<h1>`** — the Hero's headline is the page's `<h1>` and a page has one (FR-004).

### Tests and the story

- [x] T020 [US1] Create `app/features/landing/ui/HeroSection.test.ts` and, **before writing a real assertion, make it fail on purpose once and observe the red** (`rules.md` § R39) — a test file that has never been seen red has not been shown to run. Then assert, with `should <expected> when <condition>` names: the five strings reach their slots; the `<h1>` carries `text-display` and `text-bone-100`; the subhead carries `text-body-lg`, `text-ink-100` and `max-w-hero-measure`; the CTA row carries the gap, top-padding and `lg:` classes.
- [x] T021 [US1] Extend `app/features/landing/ui/HeroSection.test.ts` with both destination branches: with no `contactHref` the primary CTA renders a `<button>` and no `href`; with one it renders an `<a>`. With no `callHref` the secondary CTA is a `<span class="text-ink-300">` with **no anchor element and no `→`**; with one it is a `LinkArrow` carrying `external`.
- [x] T022 [US2] Extend `app/features/landing/ui/HeroSection.test.ts` to assert the R28 constraint mechanically: the section root's class list contains none of `transform`, `translate`, `scale`, `rotate`, `filter`, `backdrop-filter`, `opacity-`, `isolate`, `will-change`, `contain-paint`, `fixed`, `sticky`, and no `bg-` utility; and the three glows are rendered inside `SectionBackdrop` with the expected colour/opacity/size props.
- [x] T023 [P] [US1] Create `tests/landing-copy.test.ts` — again, see it red once first. Read both locale files **from disk** with `readFileSync` + `JSON.parse`, never by import (an imported locale file is a compiled message AST and the assertion would pass on any input — `rules.md` § R27). Build the path with `node:path` and `process.cwd()`, never `new URL` (§ R27's environment note). Assert: `landing.hero.eyebrow` holds the **identical** value in both files; the four remaining keys differ between locales; and `landing.hero.ctaSecondary` contains no `→` in either.
- [x] T024 [P] [US1] Create `app/features/landing/ui/HeroSection.stories.ts` with stories for both locales' copy, both viewports (Storybook viewport parameters at 390 and 1440), and **both** destination states — including the live one with a placeholder URL, so the `LinkArrow` branch that does not ship today is still reviewed before it does (FR-035).
- [x] T025 [US1] Extend `tests/static-output.test.ts`: each of the four generated documents carries its own locale's headline and subhead; all four carry the identical eyebrow string; and the landing documents contain **no fragment emitted by the Hero** — scope any "must not appear" assertion to the `<body>`, never the whole document, since a scoped stylesheet travels even when its element does not (`rules.md` § R40).

**Checkpoint**: the Hero renders in all four documents, and its glows are in the markup.

---

## Phase 4: User Story 3 — the two dead ends read as dead ends (Priority: P1)

**Goal**: neither absent destination produces a 404, a dangling fragment or an
anchor without a destination — and each is one data value from being alive.

**Independent test**: grep all four generated documents for an anchor with no
`href` and for a Hero-emitted fragment; read the rendered Hero and confirm the
secondary CTA is not an anchor element at all.

- [x] T026 [US3] Run `pnpm vitest run tests/static-output.test.ts` and confirm the pre-existing invariant *"should leave no anchor without a destination on any page"* still passes with the Hero in place, and that neither Hero control introduced a new fragment. Record what a visitor sees today for each control, in the implementation report: the primary button looks live and does nothing; the secondary CTA is grey text that does not respond to the pointer.
- [x] T027 [US3] Temporarily set `HERO_DESTINATIONS.callUrl` and `HERO_DESTINATIONS.contactHash` to placeholder values, regenerate, and confirm the primary CTA becomes an `<a>` to the locale's home plus the fragment and the secondary becomes a `bone-100` link with `target="_blank"` and `rel="noopener noreferrer"` — **with zero component markup changed**. Then revert both to absent. This proves FR-013's one-value claim rather than asserting it.

**Checkpoint**: both absences render correctly and both are reversible in one line.

---

## Phase 5: User Story 4 — measured on the page, not in the catalogue (Priority: P2)

**Goal**: close the two limits feature 8 had to declare.

**Method for every task in this phase**: fix the viewport with the DevTools
protocol's `Emulation.setDeviceMetricsOverride` against the generated
artefact, per `rules.md` § R44. **Never** a headless `--window-size`: § R34
proved it does not fix the layout viewport and produces images that look
exactly like an overflow bug. Node 22+ has a global `WebSocket`, so the client
is ~80 lines and zero new dependencies.

- [x] T028 [US4] Run `pnpm generate`, serve `.output/public`, and **measure the nav's rendered height** at 1440 and at 390. It must agree with the frame — **103 and 76** (spec A-02, now CONFIRMED from the design file). This is a check that the implementation matches the frame, not the source of the number; if it disagrees, the bug is in the shell's rendering or in this feature's assumption about which nav child is tallest, and it must be reported rather than absorbed by retuning `--spacing-hero-top`.
- [x] T029 [US4] On the same artefact, **measure each glow's rendered centre** in page coordinates at 1440 and at 390 and check all six against the design: 1310,290 / 130,310 / 1430,870 at 1440, and 410,50 / 40,140 / 440,520 at 390. This is the assertion that would have caught the derivation this spec had to correct (D-06), and it is the only check that can — nothing in the test suite sees a glow's position.
- [x] T030 [US4] On the same generated artefact, at 1440×900 and 390×844, read the computed `z-index` of four elements and record all four: the Hero's `SectionBackdrop` (`-3`), the dot sheet (`-2`), the cursor spotlight after one mouse event (`-1`), and the Hero's content (`auto`). **This is on the page, not in the Storybook catalogue** — which is precisely the limit feature 8 declared and this closes (FR-028, SC-006).
- [x] T031 [US4] On the same load, read the Hero section's computed style and confirm it declares none of the eleven stacking-context properties and no background colour of its own (SC-007). If the design turns out to need either, stop and report it as a finding with `SectionBackdrop.vue`'s escape hatch — do not work around it (FR-027).
- [x] T032 [US4] At 1440×900 and 390×844, confirm `document.documentElement.scrollHeight` exceeds the viewport height **with nothing injected** (expected ≈1176 and ≈1127). Then park the pointer over the Hero, scroll, and confirm the spotlight stays under it and its lit dots stay registered with the grid. Closes feature 8's second declared limit (SC-009).
- [x] T033 [US4] Sweep the viewport width from 320px to 2560px and confirm `documentElement.scrollWidth` never exceeds `clientWidth` — two of the three glows extend past the page edge by design, and this proves the layout root's `overflow-x: clip` still absorbs them with real glows in place (SC-008).
- [x] T034 [US4] Grep `.output/public/_nuxt/*.css` for the emitted anchor declarations — `left: clamp(24.125rem, 4.5321rem + 80.381vw, …)`, `top: clamp(-1.625rem, -6.5696rem + …)` and `padding-top: clamp(4.625rem, 1.5375rem + 12.6667vw, …)`. **On the site build, not the catalogue**: Storybook's content scan reaches `specs/` and `docs/` and emits theme variables the site never does, so it cannot detect a token that failed to resolve (`rules.md` § R18, `research.md` § R1).

**Checkpoint**: both of feature 8's declared limits are now measurements.

---

## Phase 5b: User Story 5 — the nav CTA reveal (Priority: P2)

> **Added 2026-09-07** with Roberto's scope change (`ui-map.md` § 2). Appended
> rather than woven in, so the task IDs are not in document order: **execute
> T042–T050 after Phase 5 and before Phase 6.** Everything here depends on the
> Hero existing (Phase 3) — it is the trigger.

**Goal**: the nav pins to the top, and its `Cuéntanos tu proyecto` button stops
duplicating the one the Hero already offers.

**Independent test**: at 1440px, load the generated landing and confirm the nav
CTA is absent at scroll 0 and never flashed; scroll past the Hero for the fade
in, back up for the fade out. Load Nosotros and confirm it is present on first
paint with no fade. Repeat with scripting disabled and with reduced motion.

- [x] T042 [P] [US5] Add two tokens to `@theme inline` in `app/assets/css/global.css`: `--layer-nav` (a positive level, so the pinned nav paints above the Hero's `position: relative` section, which comes later in the document) and `--duration-nav-cta-fade: 0.2s`, commented **UNVERIFIED, owner Clau** — `ui-map.md` § 2 says "fade" and specifies no timing, so this follows the radar ping and the spotlight fade. **Do not touch `--layer-glow`, `--layer-dots` or `--layer-spotlight`.**
- [x] T043 [US5] Create `app/shared/logic/useNavCtaReveal.ts` per `contracts/components.md` § *Addendum*: one module-scoped `shallowRef` `isHeroOnScreen` initialised `true`, `useHeroSentinel(target)` wiring an `IntersectionObserver` and disconnecting on `onScopeDispose`, and `useNavCtaReveal(suppressedByRoute)` returning the resolved boolean. It must **no-op when `IntersectionObserver` is undefined** and must import nothing from `app/features/` (Article II).
- [x] T044 [US5] Create `app/shared/logic/useNavCtaReveal.test.ts` — see it red on purpose once first (`findings.md` § R39; `vitest.config.ts` already collects `app/shared/logic/**`). Assert: the flag starts `true`; a route that never registers a sentinel keeps the CTA visible; a suppressing route with the Hero on screen hides it; the observer disconnects on unmount. **Register every mounted component and unmount it in `afterEach`** — `happy-dom` gives one `window` per file and a composable with global wiring leaks between tests (`findings.md` § R43).
- [x] T045 [US5] In `app/features/landing/ui/HeroSection.vue`, add a template ref on the root `<section>` and one call to `useHeroSentinel`. Update the component's doc comment: it still calls **no Nuxt composable**, which is the property that keeps it renderable in Storybook and in a bare mount (`rules.md` § R23) — record the narrowing rather than leaving the old absolute claim standing.
- [x] T046 [US5] In `app/features/shell/logic/useShellNavigation.ts` (**feature 3, `done`**), return one more value, `showNavCta`, from `useNavCtaReveal(computed(() => currentRouteName.value === 'index'))`. The route comparison stays here because routes already live here; it is the single place a future page declares that it renders its own above-the-fold CTA (spec A-14).
- [x] T047 [US5] In `app/features/shell/ui/SiteNav.vue` (**feature 3, `done`**), add the prop `showCta: boolean` — **added, never renaming or retyping an existing one** — pin the nav row with `sticky top-0` at `--layer-nav`, and give the existing `<div class="hidden lg:block">` CTA wrapper the opacity/visibility pair, `transition-opacity` at `--duration-nav-cta-fade`, and `motion-reduce:transition-none`. Hiding MUST use `visibility` as well as opacity, or the invisible button stays focusable and clickable (FR-048). **The nav itself gets no animation, no height change and no background change** (FR-042).
- [x] T048 [US5] In `app/features/shell/ui/SiteNav.vue`, add the `<noscript>` block whose rule forces the CTA visible. This is the only mechanism that satisfies FR-045 and FR-046 together: the button ships hidden in the landing's HTML so it cannot flash, and a browser without scripting overrides it. Shipping it visible and hiding it on mount is exactly the flash FR-045 forbids.
- [x] T049 [US5] In `app/layouts/default.vue` (**feature 3, `done`**), pass `:show-cta="showNavCta"` to `SiteNav`. This is the only change to that file in the whole feature; the background stack, the `<main>` wrapper and everything else stay untouched.
- [x] T050 [US5] Extend `app/features/shell/ui/SiteNav.test.ts` and `SiteNav.stories.ts` (**feature 3, `done`**) for both states: hidden renders the button non-focusable; visible renders it normally; the nav's own classes are identical in both. Add a story per state so the fade is reviewable. Confirm every pre-existing `SiteNav` assertion still passes **unmodified** — a changed assertion means the prop surface was not purely additive.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T035 Run `git diff --stat` and confirm **zero lines changed** in `app/shared/ui/SectionGlow.vue`, `app/shared/ui/SectionBackdrop.vue`, `app/shared/ui/DotGrid.vue`, `app/shared/ui/Pill.vue` and `app/shared/ui/BotonPrimario.vue` (SC-011, SC-012). `app/layouts/default.vue` and three files under `app/features/shell/` **are** modified, by design and only for US5 — check the diff against `spec.md` § *Files this feature modifies* and confirm it touches nothing else, in particular not the background stack in the layout.
- [x] T036 Confirm `SectionGlow.vue`'s stale doc comment ("22 … 12 on Landing") and its dead `'920'` size variant with `--spacing-glow-920` are **still present and untouched** — they belong to feature 7, and cleaning them up here would widen this diff into someone else's feature.
- [x] T037 Grep every file this feature added or changed for a hex literal, a `px` literal and an arbitrary Tailwind value (`[...]`), and confirm there are none outside `app/assets/css/global.css`, which is the token layer (SC-005, Article VII).
- [x] T038 Grep the same set for a hardcoded user-facing string and confirm there are none — every one comes from `landing.hero.*` (SC-004, Article VI).
- [x] T039 Append this cycle's implementation findings to `docs/business/rules.md` under a new dated `Feature 009 · Hero — hallazgos de implementación` heading, citing the feature. **Append, never overwrite.** The specification findings are already recorded as §§ R46–R50; check each one against what actually happened and say which held, in the shape features 006 and 008 used when they revisited their own spec-cycle rules.
- [x] T040 Run the five quality gates — `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build` — and confirm all five pass and every pre-existing test is green **without having been modified to accommodate this feature** (SC-013).
- [x] T041 Write the implementation report to `docs/harness/progress/impl_hero_section.md`, including a *Limits of what was verified* section in the shape feature 8's report used. Record the measured nav heights, the six measured glow centres against the design's, and the four stacking levels — the three numbers this feature exists to turn from assertions into measurements.

---

## Dependencies

```
Phase 1 (T001–T004)   setup, read-only
   ↓
Phase 2 (T005–T011)   tokens + copy — blocks everything
   ↓
Phase 3 (T012–T025)   US1 + US2 — the component and its glows
   ↓
Phase 4 (T026–T027)   US3 — verifies the two dead ends on the built artefact
   ↓
Phase 5 (T028–T034)   US4 — browser measurements against the frames
   ↓
Phase 5b (T042–T050)  US5 — the nav CTA reveal (added 2026-09-07)
   ↓
Phase 6 (T035–T041)   polish, findings, gates
```

Within Phase 3 the module is strictly bottom-up: T012 → T013 → T014 → T015/T016/T017 → T018 → T019. T020–T022 all edit the same test file and are therefore sequential; T023 and T024 touch different files and are parallel with each other and with T022.

**T028 and T029 are checks, not sources.** The nav's height and all six glow centres are frame-confirmed (spec A-02, A-04), so a disagreement at T028 or T029 is a bug in the implementation — or in this spec's reading of which nav child is tallest — and must be reported rather than absorbed by retuning a token. That is the opposite of how the first draft treated them, and the reason is D-06: a number this feature derived for itself was wrong by up to 35px, and only the design file caught it.

## Parallel Execution Examples

**Phase 2 — the two locale files**

```
T009  i18n/locales/es.json
T010  i18n/locales/en.json
```

**Phase 3 — after T019, three different files**

```
T023  tests/landing-copy.test.ts
T024  app/features/landing/ui/HeroSection.stories.ts
T025  tests/static-output.test.ts
```

Nothing in Phase 5 is parallel: every task reads the same generated artefact
through one browser session, and T028's nav measurement is the reference the
glow centres in T029 are then checked against.

## Implementation Strategy

**MVP is Phase 2 + Phase 3.** At that point the landing renders the design's
first section, in both locales and both viewports, over its three glows — the
whole visible feature.

**Phase 4 costs two tasks** and is what makes the two blocked destinations
honest rather than merely absent.

**Phase 5 is where this feature earns its size.** Without it the paint order
is asserted rather than measured, and the two limits feature 8 declared stay
open. It is also the only place a silent R28 failure can be caught: no unit
test in this repository can see a glow paint above the dot sheet.

**Phase 5b's IDs run out of document order on purpose.** They were appended
rather than woven through the list, so nothing already numbered had to move.
Execute them after Phase 5 and before Phase 6 — its diff check (T035) and its
gates (T040) have to see the shell changes.

**Do not reorder Phase 6's T038 to the end of the session.** A rule discovered
at T016 and written down at T038 survives; one written down after the report
is filed does not get written down.
