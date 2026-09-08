---

description: "Task list for feature 14 — Servicios, the landing's third section"
---

# Tasks: Servicios — the landing's third section

**Input**: Design documents from `/specs/014-services-section/`
**Prerequisites**: `plan.md`, `spec.md`, `data-model.md`

**Tests**: included — `feature_list.json` asks for them and Constitution Article X
makes a component test and a Storybook story mandatory for anything with a `ui/`
component.

**Organization**: grouped by the three user stories in `spec.md`. US1 is the whole
desktop+mobile content surface; US2 is the mobile lyrics effect and its no-JS/
reduced-motion fallback; US3 is verification on the built artefact.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable — different file, no dependency on an incomplete task
- **[Story]**: `[US1]`–`[US3]`, matching `spec.md`
- Every task names its exact file path

## Path Conventions

Nuxt 4 with `srcDir: app/`. Feature modules under `app/features/<name>/` with
`ui/`, `logic/`, `data/` and a barrel. Locale files at `i18n/locales/`.
Cross-cutting tests at `tests/`; component tests sit beside their SFC.

---

## Phase 1: Setup

**Purpose**: confirm the ground before changing anything. Every task is a read or
a run.

- [x] T001 Read `app/shared/ui/SectionBackdrop.vue`'s doc comment in full — this is the third section bound by the R28/R37 paint-order contract. Then read `data-model.md` §§ 2–4 and `plan.md` § *Decisions*.
- [x] T002 Run `./init.sh` and confirm it exits 0, so any red later belongs to this feature.
- [x] T003 [P] Confirm `vitest.config.ts` already collects `app/features/**/*.test.ts` and `tests/**/*.test.ts`, and that `.storybook/main.ts`'s stories glob already covers `app/features/landing/ui/*.stories.ts`. Record that **no config change is required**.
- [x] T004 [P] Read `app/features/landing/ui/PurposeSection.vue`, `PurposeCard.vue` and `logic/usePurposeContent.ts` — this feature repeats the module shape but **does not** reuse `PurposeCard`; read it to confirm why it doesn't apply (no glass surface, no reveal state, `services.md`'s "sin tarjetas").

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: tokens and copy. Everything else depends on these, and the token
*home* is the trap.

**⚠️ Blocks every user story.**

- [x] T005 Add the seventeen `--services-*` tokens listed in `data-model.md` § 4.1 to the **`:root`** block of `app/assets/css/global.css` — the five node centre pairs, the shared text-offset pair, `--services-canvas-h`, `--services-link-color`/`-w`, the Pill and closer position tokens, the timeline step/first-item tokens, the spine tokens, the mobile Pill/closer width tokens, and `--duration-services-lyrics`. They go in `:root` because `<style scoped>` and the inline SVG's `x1/y1/x2/y2` read them by name — a theme token named in hand-written CSS resolves to nothing, silently (`rules.md` § R18, `findings.md` §§ R46, R52).
- [x] T006 Add the five `--spacing-services-*` tokens (`-top`, `-glow-a-x`, `-glow-a-y`, `-glow-b-x`, `-glow-b-y`) to **`@theme inline`** in `app/assets/css/global.css`, values verbatim from `data-model.md` § 4.2. These are consumed as utilities (`pt-*`, `top-*`, `left-*`), which `findings.md` § R47 confirms read the `--spacing-*` namespace by name and accept `clamp()`.
- [x] T007 Comment every new token with its derivation from `data-model.md` — the confirmed frame value it holds, or the arithmetic that produced it. For `--spacing-services-glow-a-y` and `-glow-b-y` note that both **decrease** with width and are written as `clamp()` with the desktop value as the minimum. For `--spacing-services-top` note the mobile endpoint is an open value (⚠️ O-03), not a measurement.
- [x] T008 Mark the four open values in place, each with its owner and its seed: `--services-link-color`/`-w` (⚠️ O-02, Clau — same hairline family as Propósito's connector lines), `--spacing-services-top`'s mobile endpoint (⚠️ O-03, whoever resolves feature 13's O-05 first — seeded 55px from the Hero→Propósito leftover ratio), `--duration-services-lyrics` (⚠️ O-04, Clau), and the five service names in the data file (⚠️ O-01, Roberto). **Do not invent a value and do not present a derivation as a measurement** (`rules.md` § R38).
- [x] T009 **Guard (`rules.md` § R36)** — grep `app/assets/css/global.css` for `--spacing-glow-` and `--color-glow-` and confirm no new token matches either prefix; then run `pnpm vitest run app/shared/ui/SectionGlow.test.ts` and confirm it passes **with zero modifications to that file**. A token inside that closed namespace turns this feature red in a file it never opened.
- [x] T010 [P] Add the twelve `landing.services.*` keys to `i18n/locales/es.json` with the Spanish values in `data-model.md` § 1.2: `eyebrow`, `delivery.copy`, and `{consulting,software,cloud,automation,product}.{name,brief}`. The five `name` values are ⚠️ **O-01** — the English string used as a placeholder, replaceable one string at a time once Roberto supplies the Spanish names.
- [x] T011 [P] Add the same twelve keys to `i18n/locales/en.json` with the English values (identical to the ES placeholders for the five `name` keys today).
- [x] T012 Run `pnpm vitest run tests/i18n-parity.test.ts` and confirm both key sets match and no value is empty.

**Checkpoint**: tokens and copy exist; nothing renders yet.

---

## Phase 3: US1 — five areas, read as one system (Priority: P1)

**Goal**: at both 1440px and 390px the five service areas render with name +
brief in `services.md`'s order, plus the delivery-closing line, with no cards
and no numbering.

**Independent test**: generate the site, open all four routes. At 1440px:
five nodes at their hand-placed positions joined by four connector lines. At
390px: the same five as a vertical timeline against a spine, in order.

### The module, bottom-up (Article II: `data/` → `logic/` → `ui/`)

- [x] T013 [US1] Create `app/features/landing/data/servicesContent.ts` with `SERVICES_KEYS`, `SERVICE_NODES` (five entries carrying `id`, `index`, `nameKey`, `briefKey`) and the `ServiceNodeContent` / `ServicesContent` interfaces, signatures verbatim from `data-model.md` § 5. Also export `SERVICE_NODE_CENTRES` (the five `[x, y]` pairs from `data-model.md` § 2.1, in the same order as `SERVICE_NODES`) and a pure function `connectorEndpoints(centres): { x1: number; y1: number; x2: number; y2: number }[]` that returns the four consecutive pairs (§ 2.2). This file imports nothing.
- [x] T014 [US1] Create `app/features/landing/logic/useServicesContent.ts` exporting `useServicesContent(): ComputedRef<ServicesContent>`. It is the module's only Nuxt seam: it calls `useI18n` and returns inert data. It must import nothing from `app/features/shell/` (Article III) and must resolve no destination — nothing here is a link.
- [x] T015 [P] [US1] Create `app/features/landing/ui/ServiceItem.vue` — props `{ name, brief }`, no glass surface, no reveal state, always visible. Render `<Radar size="md">` (desktop) — actually the size is a caller concern, see T017/T018 — plus the name (`19px/600` desktop token role, `18px/600` mobile) and the brief (`14px`, unchanged across viewports per `design-extract.md` § 9). No `GlassPanel` wrapper — `services.md`'s explicit "sin tarjetas."
- [x] T016 [US1] Create `app/features/landing/ui/ServicesConstellation.vue` — desktop only. Root is `position: relative` with explicit `height: var(--services-canvas-h)` (910px, § 2.3 — not a flow container, since the five positions are non-linear on both axes). Render the eyebrow `Pill` at `left: var(--services-pill-x); top: var(--services-pill-y)`.
- [x] T017 [US1] In the same file, render five absolutely-positioned node wrappers, each at `left: var(--services-node-{n}-x); top: var(--services-node-{n}-y)` holding a `Radar size="md"` centred on that point (`translate: -50% -50%`), and the matching `ServiceItem` at `left: calc(var(--services-node-{n}-x) + var(--services-text-offset-x)); top: calc(var(--services-node-{n}-y) + var(--services-text-offset-y))` — the **one relation** from `data-model.md` § 2.1. **Do not write 146/358, 426/228, 686/468, 946/278 or 1146/508 as literals** (FR-007); only the five confirmed node-centre tokens and the one shared offset pair may appear.
- [x] T018 [US1] In the same file, render one inline `<svg aria-hidden="true">` containing four `<line>` elements, one per `connectorEndpoints(SERVICE_NODE_CENTRES)` result, styled via `<style scoped>` (`line { x1: var(--services-node-1-x); y1: var(--services-node-1-y); x2: var(--services-node-2-x); y2: var(--services-node-2-y); }` and so on for the three remaining pairs), stroke `var(--services-link-color)`, stroke-width `var(--services-link-w)`. **Do not write 280×131, 261×241, 261×191 or 201×231 as literals** (FR-008) — the four lines are generated from the same five node tokens T017 uses.
- [x] T019 [US1] In the same file, render the delivery closer as plain text — a `Pill` plus the `delivery.copy` string at `24px/500` — positioned at `left: var(--services-closer-x); top: var(--services-closer-y); width: var(--services-closer-w)`, with **no link, no button, no hover class** (FR-005).
- [x] T020 [US1] Create `app/features/landing/ui/ServicesTimeline.vue` — mobile only. Render the eyebrow `Pill` at `left: var(--services-pill-x); top: 0` (mobile's own confirmed offset is zero, § 2 vs § 3 in `data-model.md`), then the spine as an `aria-hidden` element at `left: var(--services-spine-x); top: var(--services-spine-y); height: var(--services-spine-h); width: var(--services-link-w)`, background `var(--services-link-color)`.
- [x] T021 [US1] In the same file, render five `ServiceItem` instances in normal flow inside a `position: relative` timeline container, each wrapped with its own `Radar size="sm-alt"` centred vertically on its own block (FR-012) — position each item's top with `calc(var(--services-timeline-item-1-top) + var(--i) * var(--services-timeline-item-step))` and `--i` set inline to 0–4. **Do not write 72/257/442/627/812 as five literals** (FR-011) — one relation, one `--i` per item.
- [x] T022 [US1] In the same file, render the delivery closer stacked after item 5 — `Pill` + `delivery.copy` at `17px/500`, width `var(--services-closer-m-w)`, no interactivity (FR-005).
- [x] T023 [US1] Create `app/features/landing/ui/ServicesSection.vue`: `<section id="servicios" class="relative pt-services-top">` holding one `<SectionBackdrop>` with the two glows, then `<ServicesConstellation class="hidden lg:block">` and `<ServicesTimeline class="lg:hidden">`. The `id` closes the `#servicios` anchor the shell already emits from the footer and the mobile menu (`rules.md` § R50). **No bottom padding** (`rules.md` § R49) and **no horizontal padding** (`<main>` already applies `px-page`).
- [x] T024 [US1] In the same file, place the two glows inside `SectionBackdrop` with the anchors of `data-model.md` § 4.2, each centred with `-translate-x-1/2 -translate-y-1/2`: `wine-300` 14% `900-520` and `wine-400` 12% `860-480`.
- [x] T025 [US1] Write `ServicesSection.vue`'s doc comment to state: no stacking context on the section or above it; no opaque background; no bottom or horizontal padding; the descendant `position: relative` of `ServicesConstellation` and the `translate`/`opacity` on individual radars/glows are permitted because each contains only its own subtree and the backdrop is a **sibling** (same reasoning `SectionBackdrop.vue` already grants Propósito's descendant contexts).
- [x] T026 [US1] Extend `app/features/landing/index.ts` to export `ServicesSection`, `useServicesContent` and the `ServicesContent` type. `SERVICE_NODES`, `SERVICES_KEYS` and `SERVICE_NODE_CENTRES` stay internal.
- [x] T027 [US1] Add the section to `app/pages/index.vue`: one `useServicesContent()` call and `<ServicesSection v-bind="services" />` after `<PurposeSection>`. The page stays a thin wrapper with no feature logic (Article I).

### Tests and stories

- [x] T028 [P] [US1] Create `app/features/landing/ui/ServiceItem.test.ts` and **make it fail on purpose once before writing a real assertion** (`findings.md` § R39). Then assert: name and brief reach their slots; no `GlassPanel` or card-surface class is rendered; a `Radar` renders.
- [x] T029 [US1] Create `app/features/landing/ui/ServicesConstellation.test.ts` — red first. Assert: five nodes render in `services.md`'s order; each `ServiceItem`'s position resolves through the shared `--services-text-offset-*` tokens (no five hardcoded offsets in the source); the inline `<svg>` renders exactly four `<line>` elements; the source contains none of `146`, `358`, `426`, `228`, `686`, `468`, `946`, `278`, `1146`, `508` as bare literals (FR-007) and none of `280`, `131`, `261`, `241`, `191`, `201`, `231` as bare literals (FR-008).
- [x] T030 [US1] Create `app/features/landing/ui/ServicesTimeline.test.ts` — red first. Assert: five items render in order; each item's `--i` is 0–4 in sequence; the source contains no `72`, `257`, `442`, `627` or `812` as bare literals (FR-011); the spine renders `aria-hidden="true"`.
- [x] T031 [P] [US1] Create `app/features/landing/ui/ServicesSection.stories.ts` covering both locales' copy at 1440 and 390 (Storybook viewport parameters).
- [x] T032 [P] [US1] Extend `tests/landing-copy.test.ts` — read both locale files **from disk** with `readFileSync` + `JSON.parse`, never by import (`rules.md` § R27). Assert the twelve keys exist in both, that the five brief values and the delivery copy match `services.md` verbatim per locale, and that the five `name` values are currently identical between ES and EN (documenting O-01's placeholder state so the day a Spanish name lands, this assertion forces an update rather than drifting silently).

**Checkpoint**: both compositions render with real content in all four documents.

---

## Phase 4: US2 — the lyrics effect, and its no-JS/reduced-motion fallback (Priority: P1)

**Goal**: at 390px, the item nearest the viewport centre reads at 100%, its
neighbours at 45%, the rest at 22% — driven by scroll, with zero geometry reads
per frame — and every fallback path renders all five at 100%.

**Independent test**: at 390px, scroll the timeline and watch the three-tier
opacity re-bucket around the new centred item; disable scripting and confirm
all five are full strength; force `prefers-reduced-motion: reduce` and confirm
the same.

- [x] T033 [US2] Create `app/features/landing/logic/useServicesLyrics.ts` — a **plain Vue** composable, no Nuxt call, so `ui/` still mounts bare (`rules.md` § R23). It accepts an array of item element refs, creates **one** `IntersectionObserver` with thresholds `[0, 0.5, 1]` (⚠️ O-04), and on each callback reads each entry's `intersectionRatio` — **never** `scrollY` or `getBoundingClientRect()` in the update path (`findings.md` § R41) — to pick the highest-ratio item as active, its immediate array-neighbours as near, and the rest as far. It sets `data-lyrics="active" | "near" | "far"` on each element. It must no-op when `IntersectionObserver` is undefined and disconnect every observed element on `onScopeDispose`.
- [x] T034 [US2] In `ServicesTimeline.vue`, wire `useServicesLyrics` to the five item wrappers, passing element refs collected on mount.
- [x] T035 [US2] In the same file's `<style scoped>`, declare the CSS default — **every** item and its radar at `opacity: 1`, unconditionally, with no `[data-lyrics]` attribute present (`ui-map.md` § 10) — then `[data-lyrics="active"]` at `opacity: 1`, `[data-lyrics="near"]` at `opacity: 0.45`, `[data-lyrics="far"]` at `opacity: 0.22`, transition on `opacity` with `--duration-services-lyrics`. `@media (prefers-reduced-motion: reduce)` removes the transition **and** forces every item back to `opacity: 1` regardless of its `data-lyrics` value — unlike Propósito's reveal, this dimming is atmospheric, not information, so reduced motion removes the effect entirely rather than keeping it instant (FR-017).
- [x] T036 [US2] Create `app/features/landing/logic/useServicesLyrics.test.ts` — red first. Assert: with a mocked `IntersectionObserver`, the highest-ratio entry gets `active`, its array-neighbours get `near`, the rest get `far`; re-triggering the callback with a different top ratio re-buckets around the new item; the observer disconnects on unmount; with `IntersectionObserver` undefined the composable no-ops without throwing. **Register every mounted component and unmount it in `afterEach`** — `happy-dom` gives one `window` per file and a composable with global wiring leaks between tests, reading as a failure of the subject (`findings.md` § R43).
- [x] T037 [US2] Extend `ServicesTimeline.test.ts` (from T030): without invoking the composable (simulating no-JS), assert every item computes `opacity: 1`; with `prefers-reduced-motion: reduce` emulated, assert the same and that `transition-property` is `none`.

**Checkpoint**: the lyrics effect re-buckets on scroll, and every fallback path is full strength.

---

## Phase 5: US3 — measured on the page, not in the catalogue (Priority: P2)

**Method for every task here**: fix the viewport with the DevTools protocol's
`Emulation.setDeviceMetricsOverride` against the artefact from `pnpm generate`
(`findings.md` § R44). **Never** a headless `--window-size` or `--screenshot`:
§§ R34 and R60 proved both produce images that look exactly like an overflow
bug. Node 22+ has a global `WebSocket`, so the client is ~80 lines and zero new
dependencies.

- [x] T038 [US3] Run `pnpm generate`, serve `.output/public`, and at 1440×900 and 390×844 read the computed `z-index` of four elements: this section's `SectionBackdrop` (`-3`), the dot sheet (`-2`), the cursor spotlight after one mouse event (`-1`) and the section's content (`auto`). Record all four (SC-004).
- [x] T039 [US3] On the same load, read the section element's computed style and confirm it declares none of the stacking-context properties `rules.md` §§ R28/R37 name, and no background colour. If either turns out to be needed, **stop and report it as a finding** with `SectionBackdrop.vue`'s escape hatch — do not work around it (FR-021).
- [x] T040 [US3] Measure each glow's rendered **centre** in page coordinates at both widths and check against `data-model.md` § 4.2: `1390,630` / `50,970` at 1440 (section-relative), `436,986` / `36,1346` at 390 (SC-005). Nothing in the test suite can see a glow's position; this is the only check that catches the § R48 class of error.
- [x] T041 [US3] At 1440, measure the four `<line>` elements' rendered endpoints and confirm each matches its pair of confirmed radar centres to the pixel (SC-005) — the assertion that proves the connectors were generated rather than transcribed.
- [x] T042 [US3] At 390, script a scroll through the timeline and confirm the `data-lyrics` bucket re-assigns as each item crosses centre, and that no item is ever dimmed while scripting is disabled (SC-002, SC-003).
- [x] T043 [US3] On the same artefact, emulate `prefers-reduced-motion: reduce` and confirm every item computes `opacity: 1` regardless of scroll position (SC-003).
- [x] T044 [US3] Sweep the viewport from 320px to 2560px and confirm `documentElement.scrollWidth` never exceeds `clientWidth` (SC-006) — the connector SVG and the absolutely-positioned canvas are the features most likely to overflow a narrower viewport if the `lg:` cutoff were ever missed.
- [x] T045 [US3] Confirm `#servicios` works end to end: from the footer's Navegación column and from the mobile menu, in both locales, the section scrolls into view (SC-007).
- [x] T046 [US3] Grep `.output/public/_nuxt/*.css` for the emitted `--services-*` custom properties and the two `clamp()` glow anchors, and confirm the SVG `line` styling resolved (non-zero rendered `x2 - x1` on at least one connector). **On the site build, never the catalogue** (`rules.md` § R18).
- [x] T047 [US3] Extend `tests/static-output.test.ts`: the landing documents carry all five names and briefs and the delivery copy for the active locale; the section carries `id="servicios"`; no interactive element (link, button) wraps the delivery closer or any `ServiceItem`. Scope any "must not appear" assertion to the `<body>`, never the whole document (`rules.md` § R40).

**Checkpoint**: every claim this feature makes about paint order, geometry and the lyrics effect is a measurement.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T048 Run `git diff --stat` (read-only) and confirm **zero changed lines** in `app/shared/ui/SectionGlow.vue`, `SectionBackdrop.vue`, `DotGrid.vue`, `Radar.vue` and `Pill.vue`, in every file under `app/features/landing/ui/Purpose*.vue` and `app/features/landing/ui/Hero*.vue`, and in every file under `app/features/shell/` and `app/layouts/` (SC-009). The only files outside `app/features/landing/` this feature may touch are `app/pages/index.vue`, `app/assets/css/global.css`, the two locale files and two test files.
- [x] T049 Grep every added or changed file for a hex literal, a `px` literal and an arbitrary Tailwind value (`[...]`) and confirm there are none outside `app/assets/css/global.css` (SC-008, Article VII). Then grep the same set for a hardcoded user-facing string and confirm every one comes from `landing.services.*` (Article VI).
- [x] T050 Confirm the two generated relations survived implementation: the source contains none of the five text-block coordinate literals, none of the four connector rectangle dimensions, and none of the five mobile item-top literals — each reachable only through its token or its formula (FR-007, FR-008, FR-011).
- [x] T051 Run the five gates — `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build` — and confirm all five pass with **no pre-existing test modified** to accommodate this feature (SC-010).
- [x] T052 Write the implementation report to `docs/harness/progress/impl_services_section.md`, with a *Limits of what was verified* section in the shape features 9's and 13's reports used. Record: the two measured glow centres against the design's, the four connector-endpoint matches, the four paint levels, the lyrics effect's measured re-bucketing, and the leftover this section passes to feature 15 (desktop **110px**; mobile blocked on this feature's own O-03).
- [x] T053 Report, without writing to `docs/business/`: the four open values with whatever the cycle learned about each; the two `docs/business/` contradictions listed in `spec.md` (the nav's Servicios entry, and the `0.18`/`0.22` lyrics-opacity mismatch between `design-extract.md` and `ui-map.md`); and any implementation finding worth `docs/harness/findings.md`. **`docs/business/` is human-authored and read-only to every agent** (AGENTS.md § 3) — a finding is reported and taken to a person, never written there.

---

## Dependencies

```
Phase 1 (T001–T004)   setup, read-only
   ↓
Phase 2 (T005–T012)   tokens + copy — blocks everything
   ↓
Phase 3 (T013–T032)   US1 — both compositions, real content
   ↓
Phase 4 (T033–T037)   US2 — the lyrics effect + its fallbacks
   ↓
Phase 5 (T038–T047)   US3 — browser measurements against the frames
   ↓
Phase 6 (T048–T053)   diff guard, grep guards, gates, reports
```

Within Phase 3 the module is strictly bottom-up: T013 → T014 → T015 →
T016–T019 (desktop, sequential — all edit `ServicesConstellation.vue`) and
T020–T022 (mobile, sequential — all edit `ServicesTimeline.vue`) can proceed in
parallel with each other once T015 exists → T023–T025 → T026 → T027.
T028–T032 follow the components they cover; T028, T031 and T032 touch
different files from T029/T030 and from each other.

Phase 4 depends on Phase 3's `ServicesTimeline.vue` (T020–T022) but **not** on
the desktop composition — it could ship independently of `ServicesConstellation`.

**Nothing in Phase 5 is parallel**: every task reads the same generated
artefact through one browser session, and T038's levels are the reference the
rest are checked against.

**T040 and T041 are checks, not sources.** Every glow endpoint and every
connector coordinate is frame-confirmed or derived from confirmed values with
the arithmetic written down, so a disagreement is a bug in the implementation
— never a reason to retune a token. `rules.md` § R48 exists because a number
this repository derived for itself was wrong by up to 35px and only the design
file caught it.

## Parallel Execution Examples

**Phase 2 — the two locale files**

```
T010  i18n/locales/es.json
T011  i18n/locales/en.json
```

**Phase 3 — desktop and mobile compositions, after T015**

```
T016–T019  app/features/landing/ui/ServicesConstellation.vue
T020–T022  app/features/landing/ui/ServicesTimeline.vue
```

**Phase 3 — after T027, three different files**

```
T028  app/features/landing/ui/ServiceItem.test.ts
T031  app/features/landing/ui/ServicesSection.stories.ts
T032  tests/landing-copy.test.ts
```

## Implementation Strategy

**MVP is Phase 2 + Phase 3.** At that point the landing's third section
renders real content in both locales at both viewports, with the desktop
scatter and the mobile timeline both static (lyrics effect not yet wired).

**Phase 4 is not an enhancement — it's `ui-map.md` § 5's defining mobile
behaviour**, but it is genuinely separable from Phase 3's content work, which
is why it is its own phase with its own no-JS/reduced-motion contract.

**Phase 5 is where this feature earns its size.** No unit test in this
repository can see a glow paint above the dot sheet, a connector line miss its
radar, or an item dimmed by default. Skipping it leaves the R28 failure mode
and the "never dimmed by default" contract exactly as silent as they were
before the section existed.

**Do not defer T053 to the end of the session.** A contradiction noticed at
T017 or T035 and reported at T053 survives; one noticed and reported after the
report is filed does not get reported.
