---

description: "Task list for feature 008 — cursor spotlight"
---

# Tasks: Cursor spotlight

**Input**: Design documents from `specs/008-cursor-spotlight/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/components.md`, `quickstart.md`

**Tests**: included — Constitution Article X requires unit tests for `logic/`,
a component test for every `app/shared/ui/` component and a story for each,
and spec FR-023/FR-024 name all three.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable — different files, no dependency on an incomplete task
- **[Story]**: the user story the task serves (US1–US4 from `spec.md`)

## Path conventions

Nuxt 4 with `srcDir: app/`. Component in `app/shared/ui/`, composable in
`app/shared/logic/`, layout in `app/layouts/`, tokens in
`app/assets/css/global.css`, artifact assertions in `tests/`, test
configuration in `vitest.config.ts`.

## Three things this feature must not touch

`app/shared/ui/SectionGlow.vue`, `SectionGlow.stories.ts` and the dead `'920'`
size variant belong to **feature 7** (`pending`). Everything under
`docs/business/` except `rules.md` belongs to Clau. Neither appears in any task
below, and T024 exists to prove it.

---

## Phase 1: Setup — prove the harness before trusting it

**Purpose**: `vitest.config.ts` does not currently collect tests from
`app/shared/logic/`. Left alone, the composable's whole test file would never
run and would report as green by not existing (`rules.md` § R16,
`quickstart.md` § 1). This is fixed and **demonstrated** before any production
code is written.

- [x] T001 Run the five gates on the untouched branch (`pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build`) and record the passing counts (files, tests) in `docs/harness/progress/impl_cursor_spotlight.md` as the before-state for SC-012. Change no file.
- [x] T002 Add `'app/shared/logic/**/*.test.ts'` to the `include` array in `vitest.config.ts`, beside the three existing entries, with a comment citing `rules.md` § R16 ("a feature that adds tests in a new location extends the include; `defineVitestConfig` throws on `projects`").
- [x] T003 Create `app/shared/logic/useCursorSpotlight.test.ts` containing **one deliberately failing assertion** (e.g. `expect(true).toBe(false)`), run `pnpm test`, and confirm the run **fails** and names this file. Record the failing output in `docs/harness/progress/impl_cursor_spotlight.md`. A test file never seen failing has not been shown to run.

**Checkpoint**: the new path is collected, proven by a red run. Do not proceed
until the failure has been observed.

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: the nine tokens and the amended layer contract every later task
consumes. Nothing in Phase 3 can be written before these exist.

> ⚠️ **Namespace trap.** No token added here may begin `--color-glow-` or
> `--spacing-glow-`. `SectionGlow.test.ts` scans `global.css` for both
> prefixes and asserts every match is reachable through its props; a spotlight
> token in that family turns that suite red without a line of
> `SectionGlow.vue` changing (`research.md` § R5, spec FR-003).

- [x] T004 Add nine tokens to the `:root` block of `app/assets/css/global.css`, beside `--dot-paper-*` and **not** inside `@theme inline` (`rules.md` § R18): `--spotlight-red-400-42`, `--spotlight-red-400-17`, `--spotlight-red-400-37` (each `color-mix(in srgb, var(--red-400) N%, transparent)`), `--spotlight-stop-mid: 42%`, `--spotlight-outer-size: 41.25rem`, `--spotlight-core-size: 11.25rem`, `--dot-paper-lit-color: var(--dot-paper-color)`, `--duration-spotlight-fade: 0.2s`, `--layer-spotlight: -1`. Values and derivations are in `data-model.md` § 1. The comment beside each records its provenance — the `gViAx` hex, the alpha arithmetic (`0x6B` = 41.96%, `0x2B` = 16.86%, `0x5E` = 36.86%), the two cross-confirmed by `ui-map.md:270`, and the two marked **UNVERIFIED with owner Clau** (`--dot-paper-lit-color`, `--duration-spotlight-fade`). It must also warn that `--spotlight-stop-mid`'s 42% is a gradient **position** unrelated to the 42% **opacity** above it (spec § D-01). (FR-002, FR-003)
- [x] T005 In the same `:root` block of `app/assets/css/global.css`, change `--layer-glow` from `-2` to `-3` and `--layer-dots` from `-1` to `-2`, and rewrite the comment above them as the **three-level** table from `data-model.md` § 3, stating that the *relation* is the contract, that both tokens keep their names so no consumer changes, and why there is no integer between `-1` and `0`. (FR-016, spec A-01)
- [x] T006 [P] Correct the one doc-comment line in `app/shared/ui/DotGrid.stories.ts` that prints the old level numbers (`--layer-glow`, -2 / `--layer-dots`, -1) to the new values, and add the spotlight level to the sentence. **Only the comment changes** — no story, no render, no assertion. (FR-017)
- [x] T007 [P] Correct the one doc-comment line in `app/shared/ui/SectionBackdrop.stories.ts` the same way, with the same restriction. (FR-017)

**Checkpoint**: `pnpm check`, `pnpm typecheck` and `pnpm test` still pass —
**in particular `SectionGlow.test.ts`, `DotGrid.test.ts` and
`SectionBackdrop.test.ts`, all unmodified** (SC-009). The nine new custom
properties appear under `:root` in the emitted CSS after `pnpm generate`.

---

## Phase 3: User Story 2 — It is absent whenever it should be (Priority: P1)

**Goal**: the three off-states are correct *before* anything is visible.
Touch pointers, reduced motion and no-JS all render exactly feature 6's
background, with no element and no listener.

**Independent test**: with the composable in place but nothing rendered yet,
its unit test proves eligibility in both directions, the live preference
change, the non-mouse guard, one write per frame and clean teardown.

**Why this story runs first**: US1 is the visible half, but every guard lives
in the composable, and building the visible half first is how an effect ends
up shipping to a phone.

- [x] T008 [US2] Create `app/shared/logic/useCursorSpotlight.ts` per `contracts/components.md` § 2: signature `useCursorSpotlight(host: Ref<HTMLElement | null>): { isActive: Readonly<Ref<boolean>> }`, importing only from `vue`. No `window` access during setup (SSR-safe); everything starts in `onMounted`. Evaluate `(hover: hover) and (pointer: fine)` and `(prefers-reduced-motion: reduce)`, subscribe to both `change` events (FR-013), and attach `pointermove` + `scroll` on `window` and `pointerleave`/`pointerenter` on `document.documentElement`, **all `{ passive: true }`** (FR-020). Five named functions, none over 20 lines, each returning early on the ineligible path. No `any`, no `@ts-ignore`.
- [x] T009 [US2] In `app/shared/logic/useCursorSpotlight.ts`, implement the rAF coalescing: `pointermove` ignores any event whose `pointerType` is not `'mouse'` (FR-014), stores `clientX`/`clientY`, and requests a frame only when none is pending. Inside the frame, read `scrollX`/`scrollY` **first**, then write `--spotlight-x` / `--spotlight-y` on the host — read-then-write, never the reverse (`research.md` § R2). Measure the host's page offset once at activation and on `resize`, outside the hot path, and subtract it so the published values are host-relative (`research.md` § R4). Write `--spotlight-opacity` only on pointer leave/entry. (FR-020, spec A-05, A-07)
- [x] T010 [US2] In `app/shared/logic/useCursorSpotlight.ts`, implement teardown with `onScopeDispose` (the precedent `useMobileMenu.ts` set): remove every listener, cancel any pending frame, clear all three custom properties from the host, and set `isActive` false. The same path runs when a media `change` makes the effect ineligible. (FR-011, FR-013)
- [x] T011 [US2] Replace the deliberately failing assertion in `app/shared/logic/useCursorSpotlight.test.ts` with the real suite, per `research.md` § R6 — stub `window.matchMedia` with a controllable per-query factory and `requestAnimationFrame` with a hand-flushed queue, wrap the call in `effectScope()`, and assert against a detached `<div>` host. Names follow `should <expected> when <condition>`. Cover: **(a)** `isActive` stays false when the pointer is coarse (FR-010, SC-004); **(b)** `isActive` stays false under `prefers-reduced-motion: reduce`, even with a fine pointer (FR-011, SC-004); **(c)** no listener is attached in either ineligible case; **(d)** a `change` event that makes it eligible starts it without a reload, and one that makes it ineligible stops it and clears the properties (FR-013); **(e)** a `pointermove` with `pointerType: 'touch'` is ignored (FR-014); **(f)** twenty `pointermove` events before one flush produce exactly **one** property write (FR-020); **(g)** a `scroll` with no new pointer event still republishes coordinates (FR-005); **(h)** `scope.stop()` leaves zero listeners and zero properties.

**Checkpoint**: `pnpm test` passes and the new file's tests are visibly
counted. The composable is fully tested while rendering nothing.

---

## Phase 4: User Story 1 — The page answers the cursor (Priority: P1)

**Goal**: the light follows the pointer across the whole page, the dots inside
its radius brighten and stay on the grid, and nothing else about the page
changes.

**Independent test**: open a generated page with a mouse, move the pointer
over every section and the footer, scroll while stationary, and confirm the
light tracks, the dots lift, no doubled dot appears at the boundary and no
interaction is affected.

- [x] T012 [US1] Create `app/shared/ui/CursorSpotlight.vue` per `contracts/components.md` § 1: `<script setup lang="ts">` with **no props, no emits, no slots and no imports**, and the four-element structure root → beam → window → lit. Root: `absolute inset-0`, `pointer-events-none`, `aria-hidden="true"`, `z-index: var(--layer-spotlight)`, `overflow: clip`, `opacity: var(--spotlight-opacity, 1)` transitioned over `var(--duration-spotlight-fade)`. The doc comment states the four load-bearing facts from `plan.md` § *Part 2* — why `clip` and not `hidden`, why the mask is static, why the lit sheet counter-translates, and why there is no blend mode. (FR-015, FR-019)
- [x] T013 [US1] In `app/shared/ui/CursorSpotlight.vue`, implement the beam: `--spotlight-outer-size` square, offset by half its own size, `transform: translate3d(var(--spotlight-x, 50%), var(--spotlight-y, 50%), 0)`, `will-change: transform`, and two `background-image` layers with `background-repeat: no-repeat` — the core (`--spotlight-core-size`, centred, `--spotlight-red-400-37` → `transparent`) painted over the outer field (`--spotlight-red-400-42` at 0 → `--spotlight-red-400-17` at `var(--spotlight-stop-mid)` → `transparent` at 100%, `closest-side`). Normal compositing, no blend mode. Zero literals. (FR-001, FR-002)
- [x] T014 [US1] In `app/shared/ui/CursorSpotlight.vue`, implement the lit dots: a window inset by one negative `var(--dot-paper-step)` on all sides carrying a **static** `mask-image` (plus `-webkit-mask-image`) with the same radial falloff as the light (FR-008), containing a sheet that repeats the `--dot-paper-*` recipe with `--dot-paper-lit-color` and counter-translates by the beam's page origin reduced modulo the step: `translate3d(calc(-1 * mod(calc(var(--spotlight-x, 50%) - var(--spotlight-outer-size) / 2), var(--dot-paper-step))), …, 0)` (`research.md` § R3). The sheet resolves the same `--dot-paper-radius` and `--dot-paper-step` as `DotGrid`, never its own copies. (FR-006, FR-009)
- [x] T015 [US1] In `app/shared/ui/CursorSpotlight.vue`, add the three belt-and-braces guards that set `display: none`: `@media (prefers-reduced-motion: reduce)`, `@media not (hover: hover)` and `@media print`, following `Radar.vue` and `BotonPrimario.vue`. They are redundant with the composable by design — two independent mechanisms for the accessibility requirement `ui-map.md` § *Movimiento reducido* lists first. (FR-010, FR-011)
- [x] T016 [US1] Create `app/shared/ui/CursorSpotlight.test.ts` in `DotGrid.test.ts`'s shape — read the SFC and `global.css` from disk with `node:fs` + `node:path`, never `new URL` (`rules.md` §§ R16, R27). Cover: the rendered structure is four nested elements with no text; `aria-hidden="true"` and `pointer-events-none` on the root (FR-015); `z-index: var(--layer-spotlight)` in the source **and** `--layer-spotlight:` in `global.css`; every `var(--…)` the component names is declared in `global.css` and every new token is named by the component; and a comment-stripped scan of the `<style scoped>` block finds **zero** hex literals and **zero** `px`/`rem`/`em` literals (FR-002, SC-008).
- [x] T017 [US1] Wire the layer in `app/layouts/default.vue`: add a template ref to the existing root element, call `useCursorSpotlight()` with it, and render `<CursorSpotlight v-if="…" />` immediately after `<DotGrid />`. Imports use aliases (`@/shared/ui/CursorSpotlight.vue`, `@/shared/logic/useCursorSpotlight`). Nothing else about the layout changes — same single stacking context, same `overflow-x: clip`, same `inert` wrapper. (FR-005, FR-012)
- [x] T018 [US1] Update the background-stack table in `app/layouts/default.vue`'s doc comment to the three negative levels from `data-model.md` § 3, and add a sentence recording that the spotlight is the only layer that is absent from the prerendered HTML and why (`research.md` § R7). (FR-016)
- [x] T019 [US1] Extend `tests/static-output.test.ts` with **additive** assertions only: the spotlight's class name appears **zero** times in each of the four prerendered documents (FR-012, SC-003). Do not modify or weaken an existing assertion (SC-012).

**Checkpoint**: `pnpm test` and `pnpm generate` pass; the artifact contains the
spotlight's CSS and none of its markup.

---

## Phase 5: User Story 4 — The recipe is reviewable at rest (Priority: P3)

**Goal**: the catalogue shows the effect both pinned and live, with no Nuxt
runtime.

- [x] T020 [US4] Create `app/shared/ui/CursorSpotlight.stories.ts` with a **Pinned** story: a wrapper `<div>` that supplies the host contract (`relative isolate` box, `bg-ink-500`, a `<DotGrid />`, some real content) and sets `--spotlight-x` / `--spotlight-y` inline to reproduce frame `gViAx`'s `Estado 2`. No composable, no pointer, no Nuxt import — the story must render correctly in `storybook-static/` with nothing running (FR-022, FR-023, SC-011). The doc comment explains that the design file itself drew three fixed positions for exactly this reason.
- [x] T021 [US4] Add a **Live** story to `app/shared/ui/CursorSpotlight.stories.ts` that calls `useCursorSpotlight()` from the story's own `setup()` against the wrapper's ref, so the effect follows the pointer over the composed background exactly as on the site. Confirm both stories render in Poppins / Instrument Sans rather than a system fallback (feature 6, `rules.md` § R30). (FR-023)

**Checkpoint**: `pnpm storybook:build` passes and both stories render in the
built catalogue.

---

## Phase 6: User Story 3 — It costs nothing to run (Priority: P2) · verification no test can do

**Purpose**: `happy-dom` neither styles nor paints, and a headless screenshot
is not evidence of layout in this repository (`rules.md` § R34). These five
tasks **are** the verification of the claims the suite cannot reach
(`research.md` § R8). Record each result in
`docs/harness/progress/impl_cursor_spotlight.md`; an unrecorded check has not
happened.

- [x] T022 [US1] Verify **paint order and registration** in a real browser against the generated artifact, through a same-width iframe rather than a screenshot: measure that section backdrops compute `z-index: -3`, the dot sheet `-2`, the spotlight root `-1`, and content `auto`, with no intervening stacking context; then at several pointer positions and scroll offsets confirm the lit dots sit exactly on the base grid — **no doubled or half-step dot at the boundary** (FR-006, SC-002). In the same session read `getComputedStyle(...).transform` on the lit sheet and confirm it is a matrix and never `none`, which is what proves CSS `mod()` resolved rather than silently invalidating the declaration (`research.md` § R3, `quickstart.md` § 4).
- [x] T023 [US3] Record a **performance trace** over five seconds of continuous pointer movement on a full-length page and confirm: at most one update per frame at any mouse polling rate, **zero** layout operations and **zero** paints attributable to the spotlight's layers, and no blocked scroll (FR-020, SC-005, spec A-11). Then measure `document.documentElement.scrollWidth` / `scrollHeight` with the pointer at the centre and at all four extremes of the page and confirm they are **identical** (FR-019, SC-006).
- [x] T024 [US1] Verify the **three off-states** as `quickstart.md` § 7 describes — touch pointer, `prefers-reduced-motion: reduce`, and scripting disabled — confirming in each that no spotlight element exists, no listener is attached, and the background is exactly what feature 6 renders (FR-010, FR-011, FR-012, SC-003, SC-004). Then, with the page open, toggle the reduced-motion emulation and confirm the effect stops and starts **without a reload** (FR-013).
- [x] T025 [US1] Verify the **behavioural edge cases** by hand at `/es/` and `/en/` and on `/es/nosotros`: reload without moving the mouse and confirm no red blob appears at the top-left (spec A-07); move the pointer off the window and confirm the light fades rather than freezing; hold the pointer still and scroll, confirming the light stays under the cursor and the lit dots stay registered (FR-005); and confirm text selection, links, the nav CTA and the mobile menu behave exactly as before (FR-015).
- [x] T026 Confirm the **untouched contracts**: `git diff -- app/shared/ui/DotGrid.vue app/shared/ui/SectionBackdrop.vue app/shared/ui/SectionGlow.vue` is **empty** (FR-018, SC-007); `git diff -- app/shared/ui/SectionGlow.stories.ts app/shared/ui/SectionGlow.test.ts` is **empty** and `SectionGlow.test.ts` passes unmodified (SC-009, feature 7's scope); `git diff -- i18n/` is empty and the parity suite passes unmodified (FR-025, SC-010); and `git status` shows no file under `docs/business/` changed except `rules.md`.

---

## Phase 7: Documentation and gates

- [x] T027 **R36–R39 already exist** in `docs/business/rules.md` — the spec cycle appended them on 2026-09-07 under *Feature 008 · especificación*, the same way feature 006 appended R28–R32 before implementation. Re-read them against what was actually built and confirm each still holds: **R36** (the closed `--color-glow-*` / `--spacing-glow-*` namespace), **R37** (§ R28 amended to three negative levels — its preamble says it takes effect when this feature ships, so remove that caveat once T005 has landed), **R38** (the lit dot's brightness as the base recipe painted twice, UNVERIFIED, owner Clau) and **R39** (the `vitest.config.ts` include gap). Then append a **new dated section** — *Feature 008 · hallazgos de implementación* — with any rule the implementation revealed that the spec did not anticipate, numbering from **R40**, each citing this feature. Append only; never overwrite. (FR-026)
- [x] T028 Record in `docs/harness/progress/impl_cursor_spotlight.md` the two values this feature could not source and their owners — `--dot-paper-lit-color` (spec A-03) and `--duration-spotlight-fade` (spec A-08), both **Clau** — plus D-01, the missing mid stop in `ui-map.md:270` that Clau should add. Do **not** edit `ui-map.md`; `docs/business/` outside `rules.md` is not in this cycle's write scope.
- [x] T029 Run the five gates and confirm all pass: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build`. Compare the test file/test counts against the before-state recorded in T001 and confirm the only change is **additions** — no existing test modified, removed or weakened (SC-012, FR-027).

---

## Dependencies

- **T001 → T002 → T003** are strictly sequential and come before everything:
  the harness is proved before any code relies on it.
- **T004 and T005 both edit `global.css`** — sequential, not parallel. Every
  Phase 3+ task depends on both.
- **T006 and T007** are parallel with each other (different files) and must
  land in the same change as T005, so no comment ever disagrees with the
  stylesheet.
- **T008 → T009 → T010 → T011** are sequential: one file, and each builds on
  the last.
- **T012 → T013 → T014 → T015** are sequential for the same reason.
- **T016 depends on T012–T015**; **T017 depends on T011 and T015**;
  **T018 depends on T017** (same file, and T017's shape is what the comment
  describes).
- **US4 (T020, T021) depends on US1's component** but not on the layout.
- **Phase 6 depends on everything before it** — it verifies the composed
  result.
- **T027 depends on T005 and on Phase 6**: R37's caveat can only be removed
  once the renumbering has landed, and any R40+ can only be written once the
  implementation has produced it.

## Parallel execution examples

Only three genuine parallel pairs exist in this feature, because almost every
task is the next line of a file the previous task created:

```
T006 (DotGrid.stories.ts)          ┐ two different files, both
T007 (SectionBackdrop.stories.ts)  ┘ comment-only, no shared edit

T016 (CursorSpotlight.test.ts)     ┐ different files, both depend
T019 (tests/static-output.test.ts) ┘ only on T015 / T017

T020+T021 (stories)                ┐ different files from the
T023 (performance trace)           ┘ browser-verification tasks
```

`global.css` (T004, T005), `useCursorSpotlight.ts` (T008–T010) and
`CursorSpotlight.vue` (T012–T015) are each a single file touched by several
tasks — **none of those are parallel**, regardless of story.

## Implementation strategy

**The order is deliberately not "visible thing first".**

**US2 before US1.** Every guard — touch, reduced motion, no-JS, the non-mouse
event, the live preference change — lives in the composable. Building the
visible half first is exactly how a desktop-only effect ends up shipping to a
phone, and the composable is fully testable before a single pixel exists.

**Then US1**, the feature itself, then **US4** (the catalogue), then **US3**,
which is measurement rather than construction.

**Phase 6 is not optional polish.** Four of the spec's twelve success criteria
— SC-002 (the dots actually brighten and stay registered), SC-005 (no paint
per frame), SC-006 (the page does not grow) and half of SC-003 — are invisible
to every test in this repository. `happy-dom` does not paint, and § R34 rules
out screenshots as evidence of layout. Declaring the feature done on a green
suite alone would be the exact illusion `rules.md` § R27 recorded when a test
asserted against an AST and passed against anything.

**The riskiest task is T014** (registration of the lit dots). If `mod()` turns
out not to resolve, `research.md` § R3 has the fallback written and costed: the
composable publishes the reduced offset instead, at the price of reading the
dot step from the computed style.
