---

description: "Task list for feature 013 — Propósito, the Golden Circle section"
---

# Tasks: Propósito — the Golden Circle section

**Input**: Design documents from `/specs/013-purpose-section/`
**Prerequisites**: `plan.md`, `spec.md`, `data-model.md`

**Tests**: included — `feature_list.json` asks for them and Constitution Article X
makes a component test and a Storybook story mandatory for anything with a `ui/`
component.

**Organization**: grouped by the four user stories in `spec.md`. US1 and US2 are
the same component and ship together; US3 is a separate composition; US4 is
verification on the built artefact.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable — different file, no dependency on an incomplete task
- **[Story]**: `[US1]`…`[US4]`, matching `spec.md`
- Every task names its exact file path

## Path Conventions

Nuxt 4 with `srcDir: app/`. Feature modules under `app/features/<name>/` with
`ui/`, `logic/`, `data/` and a barrel. Locale files at `i18n/locales/`.
Cross-cutting tests at `tests/`; component tests sit beside their SFC.

---

## Phase 1: Setup

**Purpose**: confirm the ground before changing anything. Every task is a read or
a run.

- [x] T001 Read `app/shared/ui/SectionBackdrop.vue`'s doc comment in full — it is the paint-order contract this is only the second section bound by, and its failure mode is silent. Then read `data-model.md` §§ 2 and 4 and `plan.md` § *Decisions*.
- [x] T002 Run `./init.sh` and confirm it exits 0, so any red later belongs to this feature.
- [x] T003 [P] Confirm `vitest.config.ts` already collects `app/features/**/*.test.ts` and `tests/**/*.test.ts`, and that `.storybook/main.ts`'s stories glob already covers `app/features/landing/ui/*.stories.ts`. Record that **no config change is required**.
- [x] T004 [P] Read `app/features/landing/ui/HeroSection.vue` and `app/features/landing/logic/useHeroContent.ts` — this feature repeats their module shape exactly, and the Hero is the precedent for how a section contributes glows.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: tokens and copy. Everything else depends on these, and the token
*home* is the trap.

**⚠️ Blocks every user story.**

- [x] T005 Add the nineteen `--purpose-*` and `--duration-purpose-reveal` tokens to the **`:root`** block of `app/assets/css/global.css`, values verbatim from `data-model.md` § 4.1. They go in `:root` and **not** in `@theme inline` because a `<style scoped>` reads them: a theme token named in hand-written CSS resolves to nothing, silently (`rules.md` § R18, `findings.md` §§ R46, R52).
- [x] T006 Add the sixteen `--spacing-purpose-*` and `--text-purpose-*` tokens to **`@theme inline`** in `app/assets/css/global.css`, values verbatim from `data-model.md` § 4.2. These are consumed as utilities (`pt-*`, `top-*`, `left-*`, `w-*`, `text-*`), which `findings.md` § R47 confirms read the `--spacing-*` namespace by name and accept percentages and `calc()`.
- [x] T007 Comment every new token with its derivation from `data-model.md` — the two frame values it interpolates, or the arithmetic that produced it. For `--spacing-purpose-glow-b-y` note that it **decreases** with width (870 → 854) and is written as a `clamp()` with the desktop value as the minimum. For the constellation's percentages, state that only the 1440 endpoint is design and that percentage scaling is a smoothing decision (`rules.md` § R48 § 4, spec A-01).
- [x] T008 Mark the six open values in place, each with its owner and its derivation: `--purpose-radar-rest-opacity` (⚠️ O-01, Roberto/Clau — the mean of the card's own 31/43 and 89/120 rest:hover ratios, the only rest/hover pair the frame contains), `--purpose-arc-color` and `--purpose-arc-w` (⚠️ O-02, Clau), `--spacing-purpose-eyebrow-gap` (⚠️ O-04/O-05), the three mobile flow gaps (⚠️ O-05) and `--duration-purpose-reveal` (⚠️ O-06). Same treatment `--dot-paper-lit-color` and `--duration-spotlight-fade` already carry (`rules.md` § R38) — **do not invent a value and do not present a derivation as a measurement.**
- [x] T009 **Guard (`rules.md` § R36)** — grep `app/assets/css/global.css` for `--spacing-glow-` and `--color-glow-` and confirm no new token matches either prefix; then run `pnpm vitest run app/shared/ui/SectionGlow.test.ts` and confirm it passes **with zero modifications to that file**. A token inside that closed namespace turns this feature red in a file it never opened.
- [x] T010 [P] Add the nine `landing.purpose.*` keys to `i18n/locales/es.json` with the Spanish values in `data-model.md` § 1.2: `eyebrow`, `carouselLabel`, and `{why,how,what}.{label,copy}`. The three `label` values are ⚠️ **O-03** — seeded from `content.md`'s own block headings, replaceable one string at a time.
- [x] T011 [P] Add the same nine keys to `i18n/locales/en.json` with the English values. Note in the data file that `what.copy` is the **same approved sentence** as `landing.hero.subhead` in `content.md` — two keys, one value, reported and not collapsed.
- [x] T012 Run `pnpm vitest run tests/i18n-parity.test.ts` and confirm both key sets match and no value is empty.

**Checkpoint**: tokens and copy exist; nothing renders yet.

---

## Phase 3: US1 + US2 — the constellation, and it reveals for everyone (Priority: P1)

**Goal**: at 1440px the section shows three words and three pinging dots, and each
node reveals its line then its card on hover **or** focus — with no JavaScript.

**Why the two stories share a phase**: they are the same component and the same
CSS. US2 is three extra selectors and two media queries on US1's markup;
separating them would mean building the constellation twice.

**Independent test**: generate the site, open all four routes at 1440px. At rest:
three labels, three radars, no card, no line. Hover each radar and each word; tab
through; emulate a coarse pointer; force reduced motion.

### The module, bottom-up (Article II: `data/` → `logic/` → `ui/`)

- [x] T013 [US1] Create `app/features/landing/data/purposeContent.ts` with `PURPOSE_KEYS`, `PURPOSE_NODES` (three entries carrying `id`, `index`, `labelKey`, `copyKey`) and the `PurposeNodeContent` / `PurposeContent` interfaces, signatures verbatim from `data-model.md` § 5. This file imports nothing. Comment that `index` is the whole of what distinguishes the three nodes.
- [x] T014 [US1] Create `app/features/landing/logic/usePurposeContent.ts` exporting `usePurposeContent(): ComputedRef<PurposeContent>`. It is the module's **second and last** Nuxt seam: it calls `useI18n` and returns inert data. It must import nothing from `app/features/shell/` (Article III) and must resolve no destination — the cards are not links.
- [x] T015 [US1] Create `app/features/landing/ui/PurposeCard.vue` — props `{ label, copy }`, no mode prop. Render `<GlassPanel variant="red-soft" as="article">` containing the label (`text-purpose-card-label`, `text-red-200`, **`lg:hidden`**) and the copy (`text-lead`, `font-semibold lg:font-medium`). The `lg:hidden` on the label **is** `decisions-open.md` § D6: mobile paints it inside, desktop delegates it to the constellation. One class, no prop, and no duplicate label in the accessibility tree.
- [x] T016 [US1] In the same file, document the two deviations from `--text-lead`: the weight goes 500 → 600 below `lg` (the one exception `rules.md` § R4 named and left to `PurposeCard`), and the mobile letter-spacing stays at the token's −0.02em against the frame's −0.03em (0.22px at 22px — same criterion as `rules.md` §§ R2 and R11: implement the system value, record the discrepancy).
- [x] T017 [US1] Create `app/features/landing/ui/PurposeConstellation.vue` rendering three `.node` rows in a column with `gap: var(--purpose-row-gap)`. Each row is `position: relative` with `align-items: center` and carries `--i: 0 | 1 | 2` as an inline custom property. DOM order inside a row is **trigger → line → card**, which is what makes the sibling selector reachable and gives a screen reader label-then-copy.
- [x] T018 [US1] In the same file, build the trigger: a `<button type="button" class="peer">` at `left: calc(var(--purpose-node-x) + var(--i) * var(--purpose-node-step))`, `top: 50%`, `translate: -50% -50%`, sized to `--spacing-radar-md`, holding `<Radar size="md" />` in a wrapper carrying `--purpose-radar-rest-opacity`. Its label is an absolutely positioned child at `bottom: calc(100% + var(--purpose-label-gap))`, centred, `white-space: nowrap`, `text-purpose-label text-red-200` — the button's accessible name. It gets **no `href`, no fragment and no pointer cursor** (`rules.md` § R50, `findings.md` § R56).
- [x] T019 [US1] In the same file, build the connector line as an `aria-hidden` span at `left: calc(var(--purpose-node-x) + var(--i) * var(--purpose-node-step) + var(--purpose-link-offset))`, `top: 50%`, height `--purpose-link-h`, background `--purpose-link-color`, `width: 0` at rest. Its revealed width is the **one formula** of `data-model.md` § 2.2 — `100% − var(--purpose-card-w) − var(--purpose-node-x) − var(--i) * var(--purpose-node-step) − var(--purpose-link-offset)`. **Do not write 394 / 244 / 94** (FR-014).
- [x] T020 [US1] In the same file, place the card: `<PurposeCard>` in flow with `margin-left: auto` and `width: var(--purpose-card-w)`, `opacity: 0` and `pointer-events: none` at rest. Card heights stay **intrinsic** — no height token, no `min-height` (FR-015). The row's `align-items: center` is what puts the radar and the line on the card's centre (FR-016).
- [x] T021 [US2] In the same file's `<style scoped>`, write the reveal: `.trigger:hover ~ .link`, `.trigger:focus-visible ~ .link` and the same two for `~ .card` set the line's formula width, the card's `opacity: 1` and the radar wrapper's `opacity: 1`. Then one transition block — property, duration `--duration-purpose-reveal`, and the two delays that sequence it (card waits one duration on reveal; line waits one duration on hide). **Every one of these properties is declared here and nowhere else** (`findings.md` § R53).
- [x] T022 [US2] In the same file, add the card's revealed **surface** as Tailwind `peer-hover:` / `peer-focus-visible:` utilities on the card element — `bg-glass-red-strong` and `border-glass-red-strong-line`. It cannot go in the `<style scoped>`: the glass colours live in `@theme inline` and a `var(--color-glass-red-strong)` in hand-written CSS resolves to nothing (`rules.md` § R18). Comment that the frame's 17%/47% Why card **is this state**, not Golden Circle hierarchy (Roberto, 2026-09-08).
- [x] T023 [US2] In the same file, add the two media queries: `@media (hover: none)` sets the revealed line width and card opacity unconditionally so every touch screen at desktop width reads all three blocks with no interaction (FR-011); `@media (prefers-reduced-motion: reduce)` sets `transition: none` **and nothing else**, so the reveal survives and only the movement goes (FR-012). Both live in the same `<style scoped>` as the transition they modify.
- [x] T024 [US2] In the same file, add the desktop-only arcs: an `aria-hidden` wrapper at `absolute inset-0` with `overflow: clip`, holding three spans centred on `(--purpose-arc-origin-x, --purpose-arc-origin-y)` with `translate: -50% -50%`, `border-radius: 50%`, `border: var(--purpose-arc-w) solid var(--purpose-arc-color)` and diameters `--purpose-arc-why|how|what`. Comment the derivation: each diameter is `2 × distance(origin, radarCentre)`, verified to under 1px, so they are **not** three magic numbers (FR-017). The clip goes on this wrapper and **never on the section**, which would cut the section's own 1000px glows (FR-018).
- [x] T025 [US1] Create `app/features/landing/ui/PurposeSection.vue`: `<section id="proposito" class="relative pt-purpose-top">` holding one `<SectionBackdrop>` with the three glows, the `Pill` eyebrow, then `<PurposeConstellation class="hidden lg:block mt-purpose-eyebrow-gap">` and `<PurposeCarousel class="lg:hidden mt-purpose-eyebrow-gap">`. The `id` is the target of three links the shell already emits, so this closes three of the five dangling anchors `rules.md` § R50 records. **No bottom padding** (`rules.md` § R49) and **no horizontal padding** (`<main>` already applies `px-page`).
- [x] T026 [US1] In the same file, place the three glows inside `SectionBackdrop` with the anchors of `data-model.md` § 4.3, each centred with `-translate-x-1/2 -translate-y-1/2`: `wine-400` 20% `1000-560`, `wine-300` 17% `820-480`, and `red-400` 12% `920` for `Glow origen` with `hidden lg:block` (the design gives it no mobile size — FR-028). `Glow origen` is the consumer that makes `SectionGlow`'s `'920'` variant not dead code.
- [x] T027 [US1] Write `PurposeSection.vue`'s doc comment to state the five constraints where a maintainer will read them: no stacking context on the section or above it; no opaque background; no bottom or horizontal padding; the descendant contexts (the trigger's `translate`, the card's `opacity`, the carousel's `scale`, every glass `backdrop-filter`) are permitted because each contains only its own subtree and the backdrop is a **sibling**; and the arcs' clip is on a wrapper, not the section.
- [x] T028 [US1] Extend `app/features/landing/index.ts` to export `PurposeSection`, `usePurposeContent` and the `PurposeContent` type. `PURPOSE_NODES` and `PURPOSE_KEYS` stay internal, matching how the Hero keeps `HERO_KEYS` private.
- [x] T029 [US1] Add the section to `app/pages/index.vue`: one `usePurposeContent()` call and `<PurposeSection v-bind="purpose" />` after `<HeroSection>`. The page stays a thin wrapper with no feature logic (Article I).

### Tests and stories

- [x] T030 [US1] Create `app/features/landing/ui/PurposeCard.test.ts` and **make it fail on purpose once before writing a real assertion** (`findings.md` § R39). Then assert: the label and copy reach their slots; the label carries `lg:hidden`, `text-purpose-card-label` and `text-red-200`; the copy carries `text-lead` and the `font-semibold lg:font-medium` pair; the surface is `GlassPanel variant="red-soft"`.
- [x] T031 [US1] Create `app/features/landing/ui/PurposeConstellation.test.ts` — red first. Assert: three rows render with `--i` of 0, 1 and 2; each row's DOM order is trigger, line, card; each trigger is a `<button type="button">` with **no `href`** whose accessible name is its label; the line width is the **formula** and the source contains no `394`, `244` or `94`; no card carries `hidden`, `invisible` or `display:none` at rest (FR-010).
- [x] T032 [US2] Extend `PurposeConstellation.test.ts` with the R28 constraint, mechanically: neither the component root nor any row carries `transform`, `scale`, `rotate`, `filter`, `backdrop-filter`, `opacity-`, `isolate`, `will-change`, `contain-paint`, `fixed`, `sticky` or any `bg-` utility; the arcs' wrapper carries `overflow-clip` and the section root does not.
- [x] T033 [P] [US1] Create `app/features/landing/ui/PurposeSection.stories.ts` covering both locales' copy at 1440 and 390 (Storybook viewport parameters), plus a desktop story with one node forced revealed so the revealed state is reviewable in the catalogue and not only under a live cursor.
- [x] T034 [P] [US1] Extend `tests/landing-copy.test.ts` — read both locale files **from disk** with `readFileSync` + `JSON.parse`, never by import (an imported locale file is a compiled message AST and the assertion would pass on any input — `rules.md` § R27), building the path with `node:path` + `process.cwd()`. Assert the nine keys exist in both, that the three `copy` values match `content.md` verbatim per locale, and that `landing.purpose.what.copy` equals `landing.hero.subhead` **in the same locale** — so the duplication is asserted rather than discovered later as a bug.

**Checkpoint**: the constellation renders and reveals in all four documents, by pointer and by keyboard.

---

## Phase 4: US3 — the mobile carousel (Priority: P1)

**Goal**: at 390px, three cards on a native snap track with the centred one active,
three real dots, and all three readable with no script at all.

**Independent test**: at 390px, swipe the track and watch the indicator follow;
activate each dot by pointer and by keyboard; disable scripting and confirm all
three cards are full size and full opacity.

- [x] T035 [US3] Create `app/features/landing/logic/usePurposeCarousel.ts` — a **plain Vue** composable, no Nuxt call, so `ui/` still mounts bare (`rules.md` § R23). It exposes the active index, a `focusCard(index)` that calls `scrollTo` on the track, and wrap-around arrow-key handling. Which card is active comes from **one** `IntersectionObserver` on the track. It must no-op when `IntersectionObserver` is undefined, and disconnect on `onScopeDispose`.
- [x] T036 [US3] Create `app/features/landing/ui/PurposeCarousel.vue`: a `scroll-snap-type: x mandatory` track with `scroll-snap-align: center` on each `<PurposeCard>` at `w-purpose-card-m`, and a symmetric inline padding of `calc((100% - var(--spacing-purpose-card-m)) / 2)` that centres each snapped card. Track gap **0** — the neighbour scale supplies the visual gap (`data-model.md` § 3). The region carries the `carouselLabel` as its accessible name and must not hijack vertical scroll (FR-025).
- [x] T037 [US3] In the same file, apply the neighbour state as **one scale plus one opacity** on the same card — `--purpose-card-scale` and `--purpose-card-dim` — never a second smaller card. Comment the derivation: 241/274 = 0.8796 and 278/316 = 0.8797, so `0.88` is the value and the frame's 18px copy is that scale drawn statically, the same thing the radar's halos were (FR-021).
- [x] T038 [US3] In the same file, build the indicator: three real `<button type="button">`s at `--spacing-purpose-dot` / `--spacing-purpose-dot-sm`, `bg-red-400` active and `bg-ink-300` inactive, each named by its node's label, carrying `aria-current` when active, and centring its card on activation (FR-022, `ui-map.md` § *Accesibilidad mínima*).
- [x] T039 [US3] In the same file's `<style scoped>`, put the whole no-JS and reduced-motion contract in one place: without the composable's active index **every** card renders at scale 1 and opacity 1 (`ui-map.md` § 10 — "nunca atenuadas por default"), and `@media (prefers-reduced-motion: reduce)` does the same and drops the transitions. The cards get no pointer cursor and are not links (FR-024).
- [x] T040 [US3] Create `app/features/landing/logic/usePurposeCarousel.test.ts` — red first. Assert: the active index starts at 0 (`Why`); `focusCard` moves it; arrow keys wrap around in both directions; the observer disconnects on unmount; and with `IntersectionObserver` absent the composable no-ops. **Register every mounted component and unmount it in `afterEach`** — `happy-dom` gives one `window` per file and a composable with global wiring leaks between tests, reading as a failure of the subject (`findings.md` § R43).
- [x] T041 [US3] Create `app/features/landing/ui/PurposeCarousel.test.ts` — red first. Assert: three cards render, each with `scroll-snap-align`; the indicator renders three `<button type="button">`s with per-node accessible names and exactly one `aria-current`; each card renders its own label (no `lg:hidden` suppression below `lg`); and no card is a link.

**Checkpoint**: both compositions exist, and only one renders per viewport.

---

## Phase 5: US4 — measured on the page, not in the catalogue (Priority: P2)

**Method for every task here**: fix the viewport with the DevTools protocol's
`Emulation.setDeviceMetricsOverride` against the artefact from `pnpm generate`
(`findings.md` § R44). **Never** a headless `--window-size` or `--screenshot`:
§§ R34 and R60 proved both produce images that look exactly like an overflow bug.
Node 22+ has a global `WebSocket`, so the client is ~80 lines and zero new
dependencies.

- [x] T042 [US4] Run `pnpm generate`, serve `.output/public`, and at 1440×900 and 390×844 read the computed `z-index` of four elements: this section's `SectionBackdrop` (`-3`), the dot sheet (`-2`), the cursor spotlight after one mouse event (`-1`) and the section's content (`auto`). Record all four (SC-006).
- [x] T043 [US4] On the same load, read the section element's computed style and confirm it declares none of the eleven stacking-context properties and no background colour. If either turns out to be needed, **stop and report it as a finding** with `SectionBackdrop.vue`'s escape hatch — do not work around it (FR-030).
- [x] T044 [US4] Measure each glow's rendered **centre** in page coordinates at both widths and check the six against `data-model.md` § 4.3: 60,704 / 1410,854 / −180,44 at 1440 (all section-relative), and 56,630 / 456,870 at 390 with `Glow origen` absent. Nothing in the test suite can see a glow's position; this is the only check that catches the § R48 class of error.
- [x] T045 [US4] At 1440, measure the three radar centres and the three arc rects and confirm each arc passes **within 1px** of its own radar's centre (SC-007). This is the assertion that proves the arc diameters were generated rather than transcribed.
- [x] T046 [US4] At 1440, with the pointer parked outside the section, confirm every line's rendered width is 0 and every card's computed opacity is 0 **while its text is still present in the accessibility tree** — then dispatch a pointer move onto each trigger in turn and confirm only that node reveals (SC-001, FR-010).
- [x] T047 [US4] On the same artefact, emulate `hover: none` and confirm all three lines are at full width and all three cards at full opacity with no input (SC-003); then emulate `prefers-reduced-motion: reduce`, hover a trigger, and confirm the card appears with a computed `transition-property` of `none` (SC-004).
- [x] T048 [US4] Sweep the viewport from 320px to 2560px and confirm `documentElement.scrollWidth` never exceeds `clientWidth` (SC-008) — the arcs overflow by ~1000px by design and this proves the layout root's `overflow-clip` plus the arc wrapper's own clip absorb them.
- [x] T049 [US4] Confirm `#proposito` works end to end: from the footer's Navegación column and from the mobile menu, in both locales, the section scrolls into view and its first content is **not** covered by the pinned nav (SC-009, spec A-05). Record the measured nav height and the section's rendered top padding side by side.
- [x] T050 [US4] Grep `.output/public/_nuxt/*.css` for the emitted anchor and geometry declarations — the two `top: clamp(...)`, the two `left: clamp(...)`, `padding-top: clamp(5.625rem, 3.9071rem + 7.0476vw, ...)` and the line's `calc()` with `var(--i)`. **On the site build, never the catalogue**: Storybook's content scan reaches `specs/` and `docs/` and emits theme variables the site does not, so it cannot detect a token that failed to resolve (`rules.md` § R18).
- [x] T051 [US4] Extend `tests/static-output.test.ts`: each of the two landing documents carries all three locale-correct copy blocks **twice** (once per composition, both present in the HTML by design — one is `display: none`); no anchor without a destination appears; and the section carries `id="proposito"`. Scope any "must not appear" assertion to the `<body>`, never the whole document — a scoped stylesheet travels even when its element does not (`rules.md` § R40).

**Checkpoint**: every claim this feature makes about paint order, geometry and the reveal is a measurement.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T052 Run `git diff --stat` (read-only) and confirm **zero changed lines** in `app/shared/ui/SectionGlow.vue`, `SectionBackdrop.vue`, `DotGrid.vue`, `Radar.vue`, `GlassPanel.vue` and `Pill.vue`, and in every file under `app/features/shell/` and `app/layouts/` (SC-011). The only files outside `app/features/landing/` this feature may touch are `app/pages/index.vue`, `app/assets/css/global.css`, the two locale files and two test files.
- [x] T053 Grep every added or changed file for a hex literal, a `px` literal and an arbitrary Tailwind value (`[...]`) and confirm there are none outside `app/assets/css/global.css`, which is the token layer (SC-010, Article VII). Then grep the same set for a hardcoded user-facing string and confirm every one comes from `landing.purpose.*` (Article VI).
- [x] T054 Confirm the three generated relations survived implementation: the source contains no `394`, `244`, `94`, no `1039`, `1617`, `2134`, no card height and no `241`/`278`. Each must be reachable only through its formula or its token (FR-014, FR-015, FR-017, FR-021).
- [x] T055 Run the five gates — `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build` — and confirm all five pass with **no pre-existing test modified** to accommodate this feature (SC-012).
- [x] T056 Write the implementation report to `docs/harness/progress/impl_purpose_section.md`, with a *Limits of what was verified* section in the shape feature 8's and 9's reports used. Record: the six measured glow centres against the design's, the three arc tangencies, the four paint levels, the rest-state measurement, and the mobile leftover this section passes to feature 14 (which `spec.md` § *Notes for feature 14* could only compute for desktop: **101px**).
- [x] T057 Report, without writing to `docs/business/`: the six open values with whatever the cycle learned about each; the six `docs/business/` contradictions listed in `spec.md`; and any implementation finding worth `docs/harness/findings.md`. **`docs/business/` is human-authored and read-only to every agent** (AGENTS.md § 3) — a finding is reported and taken to a person, never written there.

---

## Dependencies

```
Phase 1 (T001–T004)   setup, read-only
   ↓
Phase 2 (T005–T012)   tokens + copy — blocks everything
   ↓
Phase 3 (T013–T034)   US1 + US2 — the constellation and its reveal
   ↓
Phase 4 (T035–T041)   US3 — the mobile carousel
   ↓
Phase 5 (T042–T051)   US4 — browser measurements against the frames
   ↓
Phase 6 (T052–T057)   diff guard, grep guards, gates, reports
```

Within Phase 3 the module is strictly bottom-up: T013 → T014 → T015/T016 →
T017–T024 → T025–T027 → T028 → T029. T017–T024 all edit
`PurposeConstellation.vue` and are therefore sequential. T030–T032 edit two test
files and follow the components they cover; T033 and T034 touch different files
and are parallel with each other and with T032.

Phase 4 depends on Phase 2 and on T015 (`PurposeCard`) only — **not** on Phase 3.
It could ship first if the mobile composition were ever prioritised.

**Nothing in Phase 5 is parallel**: every task reads the same generated artefact
through one browser session, and T042's levels are the reference the rest are
checked against.

**T044 and T045 are checks, not sources.** Every glow endpoint and every arc
diameter is frame-confirmed or derived from confirmed values with the arithmetic
written down, so a disagreement is a bug in the implementation — never a reason to
retune a token. `rules.md` § R48 exists because a number this repository derived
for itself was wrong by up to 35px and only the design file caught it.

## Parallel Execution Examples

**Phase 2 — the two locale files**

```
T010  i18n/locales/es.json
T011  i18n/locales/en.json
```

**Phase 3 — after T029, three different files**

```
T032  app/features/landing/ui/PurposeConstellation.test.ts
T033  app/features/landing/ui/PurposeSection.stories.ts
T034  tests/landing-copy.test.ts
```

## Implementation Strategy

**MVP is Phase 2 + Phase 3.** At that point the landing's second section renders
and reveals in both locales at desktop width — and because US2 is baked into the
same CSS, it is accessible from the first commit rather than retrofitted. That
ordering is deliberate: a reveal built for the mouse first and opened to the
keyboard later is how a section ends up excluding keyboard users.

**Phase 4 is the other half of the feature, not an enhancement.** Below 1024px the
carousel is the *only* form the section has.

**Phase 5 is where this feature earns its size.** No unit test in this repository
can see a glow paint above the dot sheet, an arc miss its radar, or a card that is
visible when it should be hidden. Skipping it leaves the R28 failure mode exactly
as silent as it was before the section existed.

**Do not defer T057 to the end of the session.** A contradiction noticed at T024
and reported at T057 survives; one noticed and reported after the report is filed
does not get reported.
