# Implementation Plan: Cursor spotlight

**Branch**: `feat/cursor-spotlight` | **Date**: 2026-09-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/008-cursor-spotlight/spec.md`

## Summary

One decorative layer, one composable, nine tokens, and one amendment to a
contract feature 6 established.

1. **The light.** A new `app/shared/ui/CursorSpotlight.vue` renders the frame's
   two concentric gradients as **two background layers on one moving box**,
   plus a second copy of the dotted-paper recipe clipped to the same radius —
   the mechanism `spec.md` § *The dot-brightening decision* chose. The box is
   moved with `translate3d()` driven by two CSS custom properties, so the only
   per-frame work is a style resolution and a composite.

2. **The tracking.** A new `app/shared/logic/useCursorSpotlight.ts` owns every
   listener: `pointermove` and `scroll` (both passive), two `matchMedia`
   objects with live `change` listeners, and the pointer-leave/enter pair. It
   coalesces everything into **one write per animation frame** and publishes
   the result as custom properties on the layout root. The component calls it
   **not at all** — that separation is what lets the catalogue drive the effect
   with no Nuxt runtime and no pointer (`rules.md` §§ R19, R23, R30), and it is
   the § R23 corollary applied on purpose.

3. **The layer.** `rules.md` § R28 goes from two negative levels to three:
   `--layer-glow` → `−3`, `--layer-dots` → `−2`, new `--layer-spotlight` →
   `−1`. The **relation** the rule protects is unchanged, both existing levels
   keep their **token names**, and therefore `DotGrid.vue`,
   `SectionBackdrop.vue` and `SectionGlow.vue` are not edited at all
   (spec FR-018, SC-007).

4. **The traps.** Two were found while planning and both are silent:
   `SectionGlow.test.ts` owns the `--color-glow-*` / `--spacing-glow-*`
   namespace and fails if this feature borrows it (spec FR-003); and
   `vitest.config.ts`'s `include` does not cover `app/shared/logic/`, so the
   composable's unit test would never run — the exact situation `rules.md`
   § R16 predicted.

## Technical Context

**Language/Version**: TypeScript 6 (strict), Vue 3.5 SFCs with `<script setup lang="ts">`
**Primary Dependencies**: Nuxt 4.5 (`srcDir: app/`), Tailwind CSS v4 via `@tailwindcss/vite`, `@nuxtjs/i18n` 10.6 — **no new dependency**
**Storage**: N/A — one pair of coordinates in memory, nothing persisted, nothing shared between documents
**Testing**: Vitest 4 + `@vue/test-utils` + `happy-dom` (one global environment, `rules.md` § R16); Storybook 10 (`@storybook/vue3-vite`) for visual review
**Target Platform**: static files on S3 + CloudFront; the effect runs only where the primary pointer is fine and hovering — i.e. desktop browsers (`ui-map.md` § 10)
**Project Type**: static marketing site — no server, no API, no runtime compute
**Performance Goals**: ≤ 1 visual update per animation frame at any pointer event rate; zero layout and zero paint of the spotlight's own layers per frame; zero cost of any kind when the effect is off
**Constraints**: no server route (Article IV); no colour, size or duration literal outside a token (Article VII); `DotGrid.vue` / `SectionBackdrop.vue` / `SectionGlow.vue` byte-identical (FR-018); no new locale key (FR-025); no token in the `glow` namespace (FR-003); the effect absent from the prerendered HTML (FR-012)
**Scale/Scope**: 1 new component, 1 new composable, 9 new tokens, 2 amended token values, 1 layout edit, 1 test-config edit, 2 stories, 2 new test files, 1 existing test file extended, 2 doc-comment corrections, 1 rules append

## Constitution Check

*GATE: evaluated before Phase 0, re-evaluated after Phase 1 design. Every box
must be `[x]` before implementation starts, and the `reviewer` verifies each
one against the diff.*

### Phase -1: Pre-Implementation Gates

Derived from `.specify/memory/constitution.md` v2.0.0.

#### I. Feature-Based + Capas Architecture

- [x] Does the new component belong in `app/shared/ui/` rather than inside a
      feature? **Yes** — the effect covers both pages and belongs to no
      section, the same reasoning that placed `DotGrid` and `SectionGlow`
      there.
- [x] Does the composable belong in `app/shared/logic/`? **Yes** — it is
      cross-cutting by definition (it tracks the pointer over the whole
      document) and is consumed by the layout, not by a feature. It is the
      first inhabitant of a directory the Constitution already names.
- [x] Does the layout keep structural chrome only? **Yes** — it renders one
      more decorative element and calls one composable to publish two
      coordinates. No business logic enters it.

#### II. Dependency Direction (NON-NEGOTIABLE)

- [x] Does `logic/` import from `ui/`? **No** — the composable imports only
      `vue` and takes an element ref.
- [x] Does `data/` import upward? **N/A** — this feature adds no `data/` file.
- [x] Does `ui/` import from `logic/`? **No, deliberately.** The direction
      would be legal, and it is still avoided: a `ui/` component that called
      the composable could not be pinned in the catalogue and would attach
      listeners inside a story. The component imports **nothing**.

#### III. Feature Isolation (NON-NEGOTIABLE)

- [x] Does anything reach into a feature's internals? **No.** The layout keeps
      importing the shell through `@/features/shell` only; the new files live
      in `app/shared/` and import nothing from any feature.

#### IV. Static-Site Purity (NON-NEGOTIABLE)

- [x] Is `nitro.preset: 'static'` untouched and `server/api/` still absent?
      **Yes** — this feature does not open `nuxt.config.ts`.
- [x] Does the effect need compute at request time? **No.** It is a client-side
      progressive enhancement: absent from the prerendered document, added
      after mount, and its absence is a documented, content-complete state
      (`ui-map.md` § 10, spec FR-012).
- [x] Does the artifact gain a runtime third-party request? **No** — no
      network call of any kind.

#### V. Component Discipline

- [x] `<script setup lang="ts">`, no Options API? **Yes.**
- [x] Presentational, no endpoint calls, complex logic delegated to a
      composable? **Yes** — the component has no script logic at all beyond
      its doc comment; every listener, every timer and every computation lives
      in `useCursorSpotlight` (spec FR-021).
- [x] Under 200 lines? **Yes** — the component is ~90 lines including a long
      doc comment; the composable ~110.
- [x] Is interactivity opt-in and local? **Yes, and it is the point of the
      feature.** It is the one row of `ui-map.md` § 10 that the design marks as
      JavaScript-dependent, with the no-JS state specified as lossless. Nothing
      that renders identically on every load gains state.

#### VI. i18n Parity (NON-NEGOTIABLE)

- [x] Are new locale keys added in both files? **N/A — zero keys** (FR-025).
      The layer is `aria-hidden`, so it has no accessible name to translate.
- [x] Do both locales get identical treatment? **Yes** — it lives in the
      layout and is locale-blind by construction; asserted per route in
      `tests/static-output.test.ts`.
- [x] Does `tests/i18n-parity.test.ts` stay green, unmodified? **Yes** —
      untouched (SC-010).

#### VII. Design Tokens Discipline

- [x] Zero colour, spacing or duration literals in the component? **Yes** —
      three opacities, two diameters, one stop position, one duration, one
      stacking level and the dot recipe are all named tokens
      (`data-model.md` § 1).
- [x] Does hand-written CSS use ramp names, never theme names? **Yes** —
      `var(--red-400)` inside `color-mix()`, never `var(--color-red-400)`
      (`rules.md` § R18).
- [x] Do the new tokens avoid a namespace another component owns? **Yes** —
      FR-003; see `research.md` § R5. This is the single highest-value gate in
      this list, because breaking it turns a green suite red in a file this
      feature never opens.

#### VIII. Clean Code Discipline

- [x] No magic numbers? **Yes** — including the two that would be easiest to
      inline: the 24px dot step (read from `--dot-paper-step`, never
      re-declared, and never copied into JavaScript) and the beam's
      half-diameter (derived from `--spotlight-outer-size`).
- [x] No dead code, no speculative API? **Yes** — the component takes **no
      props**, exactly like `DotGrid`. A `size`, `color` or `enabled` prop
      would invent a system the design does not have.
- [x] Names describe intent? **Yes** — `CursorSpotlight`,
      `useCursorSpotlight`, `--spotlight-x`, `--dot-paper-lit-color`,
      `--layer-spotlight`.
- [x] Small functions, early returns? **Yes** — the composable is five named
      functions, none over 20 lines, each returning early on the ineligible
      path.

#### IX. TypeScript Strict + Biome

- [x] No `any`, no `@ts-ignore`? **Yes** — the only types are
      `Ref<HTMLElement | null>`, `PointerEvent` and `MediaQueryList`.
- [x] Biome remains the only lint/format tool? **Yes** — no dependency is
      added at all.
- [x] Do `pnpm check` and `pnpm typecheck` pass? **Enforced by the task list
      and the Husky hooks.**

#### X. Testing Discipline

- [x] Unit tests for the pure logic in `logic/`? **Yes** —
      `useCursorSpotlight.test.ts` covers eligibility, the per-event pointer
      guard, rAF coalescing and teardown.
- [x] Component test for the new `ui/` component? **Yes** —
      `CursorSpotlight.test.ts`, mirroring `DotGrid.test.ts`'s cross-file token
      assertions, naming pattern `should <expected> when <condition>`.
- [x] A Storybook story for every component in `app/shared/ui/`? **Yes — two**
      (FR-023): pinned and live.
- [x] Will the new test file actually run? **Yes, and this needed checking.**
      `vitest.config.ts`'s `include` does not cover `app/shared/logic/`; it is
      extended, and the extension is proved with a deliberately failing
      assertion before the real one lands (`quickstart.md` § 1).
- [x] Are the limits of automated verification stated rather than faked?
      **Yes** — `happy-dom` does not paint, so paint order, registration and
      the frame budget are verified in a real browser through same-width
      iframes and a recorded trace (`rules.md` §§ R31, R34), never asserted
      from a test that cannot see pixels (`rules.md` § R27).
- [x] Do all existing tests stay green **without modification to accommodate
      this feature**? **Required** — SC-012. The only edit to an existing test
      file is *additive* assertions in `tests/static-output.test.ts`.

#### XI. Configuration & Credential Hygiene (NON-NEGOTIABLE)

- [x] Any new environment variable, secret or `runtimeConfig` entry? **None.**
      The feature reads no configuration at all.
- [x] Any credential in a spec artifact or commit? **None**, and nothing in
      this feature could carry one.

#### XII. Absolute Imports via Alias

- [x] Do all intra-project imports use aliases? **Yes** — the layout imports
      `@/shared/ui/CursorSpotlight.vue` and `@/shared/logic/useCursorSpotlight`;
      the test and both stories do the same.
- [x] Is any new alias mirrored in `.storybook/main.ts`? **N/A** — no new
      alias; `@/shared` is already declared in all three places.

**Result: PASS.** No gate fails. Three items are recorded in Complexity
Tracking as changes a reviewer should see stated rather than discover.

## Project Structure

### Documentation (this feature)

```text
specs/008-cursor-spotlight/
├── spec.md              # requirements, the dot-brightening decision, D-01, A-01…A-11
├── plan.md              # this file
├── research.md          # Phase 0 — the seven questions and how each was settled
├── data-model.md        # Phase 1 — tokens, the amended layer stack, the tracked state
├── quickstart.md        # Phase 1 — how to verify, in fail-fast order
├── contracts/
│   └── components.md    # Phase 1 — the component's zero-prop surface, the composable, the host contract
├── checklists/
│   └── requirements.md  # spec quality checklist
└── tasks.md             # Phase 2 — /speckit-tasks output
```

### Source Code (repository root)

```text
app/
├── shared/
│   ├── ui/
│   │   ├── CursorSpotlight.vue        # NEW — 4 elements, no props, no imports
│   │   ├── CursorSpotlight.test.ts    # NEW — token mapping, inertness, structure
│   │   ├── CursorSpotlight.stories.ts # NEW — Pinned (frame Estado 2) + Live
│   │   ├── DotGrid.vue                # UNCHANGED
│   │   ├── DotGrid.stories.ts         # EDIT — one doc-comment line: the level numbers
│   │   ├── SectionBackdrop.vue        # UNCHANGED
│   │   ├── SectionBackdrop.stories.ts # EDIT — one doc-comment line: the level numbers
│   │   └── SectionGlow.*              # UNCHANGED — feature 7 owns its stale comment
│   └── logic/
│       ├── useCursorSpotlight.ts      # NEW — listeners, eligibility, rAF coalescing
│       └── useCursorSpotlight.test.ts # NEW — the opt-outs and the coalescing
├── layouts/
│   └── default.vue                    # EDIT — ref + composable + <CursorSpotlight v-if>,
│                                      #        and the stack table in the doc comment
└── assets/css/
    └── global.css                     # EDIT — +9 tokens, 2 amended values (R28)

vitest.config.ts                       # EDIT — include app/shared/logic/**/*.test.ts

tests/
└── static-output.test.ts              # EDIT — additive: the effect is absent from the artifact

docs/business/
└── rules.md                           # APPEND ONLY — the new rules (FR-026)
```

**Structure Decision**: no new feature module, and no new directory. The
component is a cross-cutting primitive (`app/shared/ui/`), the tracking is a
cross-cutting composable (`app/shared/logic/`, whose first real file this is),
and the wiring is structural chrome (`app/layouts/`). `app/features/`,
`app/pages/`, `i18n/`, `nuxt.config.ts` and `package.json` are not touched.

## Implementation approach

Order is chosen so that nothing is ever written against something that does
not exist yet, and so the two silent traps are hit deliberately and early.

### Part 1 — the tokens and the amended layer contract

1. **`global.css` `:root`** gains nine tokens, with the arithmetic in a
   comment beside each value (`data-model.md` § 1):
   `--spotlight-red-400-42`, `--spotlight-red-400-17`,
   `--spotlight-red-400-37`, `--spotlight-stop-mid`, `--spotlight-outer-size`,
   `--spotlight-core-size`, `--dot-paper-lit-color`,
   `--duration-spotlight-fade`, `--layer-spotlight`. All in `:root`, not
   `@theme inline`, because they are read from hand-written CSS
   (`rules.md` § R18) — and none of them carries a `--color-` or `--spacing-`
   prefix, both because they are not Tailwind theme entries and because of the
   namespace trap below.
2. **`--layer-glow` becomes `−3` and `--layer-dots` becomes `−2`**, with the
   amended three-row table written into the same comment block. Both keep
   their names, so no consumer changes.
3. **The two stale parentheses** in `DotGrid.stories.ts` and
   `SectionBackdrop.stories.ts` are corrected in the same commit as the
   renumbering — never later, because a doc comment that disagrees with the
   stylesheet is exactly the debt feature 7 exists to pay off.

> **The naming trap, restated where it will be read**: no new token may begin
> `--color-glow-` or `--spacing-glow-`. `SectionGlow.test.ts` scans
> `global.css` for both prefixes and asserts every match is reachable through
> its props; a spotlight token in that family turns that suite red without a
> line of `SectionGlow.vue` changing (`research.md` § R5).

### Part 2 — the component

`CursorSpotlight.vue`: no props, no imports, four elements
(`contracts/components.md` § 1).

```text
root    absolute inset-0 · pointer-events-none · aria-hidden
        z-index: var(--layer-spotlight) · overflow: clip
        opacity: var(--spotlight-opacity, 1) · transition on opacity
└ beam  660px square, offset by half its size, moved with
        translate3d(var(--spotlight-x), var(--spotlight-y), 0)
        two background layers: the core (180px, centred) over the outer field
  └ win inset by one dot step · static mask-image with the same falloff
    └ lit the dot recipe, translated back by the beam's page origin
          reduced modulo the dot step
```

Four things about it are load-bearing and each gets a comment in the file:

- **`overflow: clip` on the root.** Without it, a beam near the footer extends
  the document's scrollable height and the page grows as the visitor moves the
  mouse down (spec FR-019, SC-006). `clip` and not `hidden`, for the same
  reason feature 6 chose it in the layout.
- **The mask is static.** It lives on the window, which the beam moves; a mask
  positioned by a custom property would repaint every frame, and the whole
  point of this structure is that nothing repaints (`research.md` § R2).
- **The lit sheet cancels the beam's translation, modulo the dot step.** That
  is what keeps the second dot pattern on the same 24px grid as the base sheet
  at every pointer position and every scroll offset (FR-006). Cancelling to the
  document origin instead would work, and would need a page-sized layer — the
  cost comparison is `research.md` § R3.
- **The gradients composite normally.** No blend mode: frame `gViAx` records
  none, and the two that were considered are rejected with arithmetic in
  `spec.md` § *The dot-brightening decision*.

Belt-and-braces CSS guards mirror the composable's JS ones, so the effect
cannot appear even if the composable were ever wired up wrongly:
`@media (prefers-reduced-motion: reduce)` and `@media not (hover: hover)` set
`display: none`, following `Radar.vue` and `BotonPrimario.vue`. `@media print`
does the same.

### Part 3 — the composable

`useCursorSpotlight(host: Ref<HTMLElement | null>)` returns `{ isActive }`
(`contracts/components.md` § 2). Its whole life:

1. **On mount**, evaluate two media queries — `(hover: hover) and
   (pointer: fine)` and `(prefers-reduced-motion: reduce)` — and subscribe to
   both `change` events so a plugged-in mouse or an OS preference flip takes
   effect without a reload (FR-013).
2. **When eligible**, attach `pointermove` and `scroll` on `window`, both
   `{ passive: true }`, and `pointerleave` / `pointerenter` on
   `document.documentElement`.
3. **On each `pointermove`**, ignore anything whose `pointerType` is not
   `'mouse'` (FR-014), store `clientX`/`clientY`, and request an animation
   frame if one is not already pending — **this is the coalescing**, and it is
   why a 1000 Hz mouse still produces one update per frame.
4. **In the frame**, read `scrollX`/`scrollY` **first**, then write
   `--spotlight-x` and `--spotlight-y` on the host. Read-then-write, never the
   reverse: writing first and reading after is what forces a synchronous
   layout.
5. **On teardown** (`onScopeDispose`, the precedent `useMobileMenu` set),
   remove every listener, cancel any pending frame, and clear the properties.

`isActive` is `false` on the server and stays `false` until the first
qualifying mouse event, which is what keeps the element out of the prerendered
HTML, avoids a hydration mismatch, and prevents a red blob appearing at the
page's top-left corner before the pointer has ever moved (spec A-07).

The host's own page offset is measured **once**, at activation and on resize,
and subtracted — so `--spotlight-x` is always host-relative and agrees with the
dot sheet's origin whatever the layout root turns out to sit at
(`research.md` § R4).

### Part 4 — the layout

`app/layouts/default.vue` gains a template ref on its existing root element,
one composable call, and `<CursorSpotlight v-if="isSpotlightActive" />` as the
sibling *after* `<DotGrid />`. Its doc-comment stack table grows the third
negative level. Nothing else about the layout changes: the same single
stacking context, the same `overflow-x: clip`, the same `inert` wrapper.

### Part 5 — tests, stories and documentation

1. **Extend `vitest.config.ts`'s `include`** and prove the extension with a
   deliberately failing assertion before writing the real test
   (`quickstart.md` § 1). A test file that silently never runs is worse than
   no test.
2. `useCursorSpotlight.test.ts` — eligibility both ways, the live preference
   change, the non-mouse pointer guard, one write per frame under many events,
   and clean teardown. `matchMedia` and `requestAnimationFrame` are stubbed;
   the approach is `research.md` § R6.
3. `CursorSpotlight.test.ts` — structure, inertness, and the cross-file token
   assertions in `DotGrid.test.ts`'s shape (both sides of every `var(--…)`),
   plus the literal scan Article VII needs.
4. `tests/static-output.test.ts` — additive: the class name appears **zero**
   times in all four prerendered documents.
5. Two stories, pinned and live (FR-023).
6. `docs/business/rules.md` already carries **R36–R39**, appended by this spec
   cycle on 2026-09-07 (the namespace, the § R28 amendment, the value the
   design file cannot contain, and the Vitest `include` gap) — the same
   sequencing feature 006 used for R28–R32. Implementation re-checks them and
   appends anything new from **R40**, never overwriting (FR-026).

## Complexity Tracking

> The first three rows are changes to something this feature would otherwise
> not touch, and the reviewer should see each stated. **The fourth was added
> during implementation** and is a real departure from an Article V limit,
> recorded here because the Constitution's *Compliance Review* says no
> exception is valid without an explicit record.

| Item | Why needed | Simpler alternative rejected because |
|---|---|---|
| **`rules.md` § R28 is amended: three negative levels, and the two existing values shift** | A layer that brightens the dots must paint above them, and there is no integer between `−1` and `0`. Both existing levels keep their token names, so no component that consumes them changes, and the relation the rule protects — glows below dots below content — is identical. | Sharing `--layer-dots` and relying on document order is exactly the fragility § R28 was written to forbid; accepting it once would erode the rule for the five section features still to come. Putting the spotlight *below* the dots needs no amendment and buries the light under section glows of up to 65% opacity, against a frame that draws the circles on top. Spec A-01, reversal cost two token values and three doc comments. |
| **Two doc comments edited in files this feature otherwise leaves alone** (`DotGrid.stories.ts`, `SectionBackdrop.stories.ts`) | They print the old level numbers in prose. Renumbering without correcting them manufactures precisely the stale-comment debt feature 7 exists to pay off, in two more files. | Leaving them to feature 7 means shipping a known-false comment and hoping a `pending` feature that does not list these files picks it up. The edit is one parenthesis each; no story, no render and no assertion changes (FR-017). |
| **`vitest.config.ts`'s `include` is extended to `app/shared/logic/`** | The composable's unit test would otherwise never run, and would report as "passing" by never existing. `rules.md` § R16 anticipated this: a feature that adds tests in a new location extends the include rather than inventing a Vitest project. | Putting the composable's test in `tests/` to dodge the config change separates a unit test from its subject and hides the config gap for the next feature. Adding a Vitest `projects` entry is not available at all — `defineVitestConfig` throws on it (§ R16). |
| **`CursorSpotlight.vue` exceeds Article V's 200-line limit** — added 2026-09-07 during implementation. The gate above answered "Under 200 lines?" with "~90 lines"; **the built file is 286 raw lines (`wc -l`; 277 non-blank), of which 110 are code** — comments and blanks stripped. The estimate was wrong and the limit is stated as a MUST, so it is recorded rather than quietly passed. ⚠️ **The raw figure goes stale on every comment edit, and already did once**: it was first written here as "~265", measured *before* the exception note below was added and not re-measured after. Same class of error as the "~90 lines" it corrects. Only the **110** is stable, and it is the figure Article V's remedy clause actually cares about; re-measure the raw number rather than trusting it, and prefer citing the code figure. | The excess is entirely documentation: three of the four style rules fail *silently* when changed (`overflow: clip` lets the page grow, a moving mask repaints every frame, a missing counter-translate doubles the dots), and the measurements behind them are this feature's whole evidence base. Deleting the comments would meet the number and lose the reason. | Article V's own remedy — "extract sub-components if they grow past that" — identifies the target as *structural* complexity, and there is none here: root → beam → window → lit is one indivisible geometric mechanism whose `--spotlight-beam-*` inheritance chain breaks the moment it is split across components. Extracting would trade a documented file for a broken one. Judged non-blocking by the `reviewer` on 2026-09-07; the exception is also written at the top of the file itself, where a future agent reading Article V against it will actually hit it. |
