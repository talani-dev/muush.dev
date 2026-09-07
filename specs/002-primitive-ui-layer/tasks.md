---

description: "Task list for the primitive UI layer"
---

# Tasks: Primitive UI layer

**Input**: Design documents from `/specs/002-primitive-ui-layer/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/components.md`, `quickstart.md`

**Tests**: Component tests ARE included. FR-051 requires them (Constitution
Article X layer 2). They are flagged in `spec.md` A-12 as an addition beyond
the originating request — if the approval gate trims FR-051, drop T001 and
every `*.test.ts` task, and nothing else changes.

**Working branch**: stay on `master`. Do **not** create a `002-*` branch — the
Husky `pre-commit` hook only accepts `feat/`, `fix/`, `chore/`, … prefixes, and
skips the check entirely on `master`. The spec-kit scripts locate this feature
through `.specify/feature.json`; where a script insists on a branch, prefix the
command with `SPECIFY_FEATURE=002-primitive-ui-layer`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel — different file, no dependency on an
  incomplete task
- **[Story]**: the user story from `spec.md` this task serves

## Path Conventions

Everything lands in `app/shared/ui/`. The single exception is
`vitest.config.ts` (T001), justified in `plan.md` § Complexity Tracking.

**Out of scope for every task below** — no task may create or edit: a page, a
layout, a feature module, an i18n key, an alias, a dependency, a token,
`app/assets/css/global.css`, `nuxt.config.ts`, `.storybook/*`, `biome.json`, or
any file under `app/assets/logo/` or `app/assets/social/`.

---

## Phase 1: Setup

**Purpose**: make component tests collectable. Nothing else needs setting up —
the toolchain, the tokens and the assets all already exist.

- [x] T001 Change `vitest.config.ts`: set `environment` from `'node'` to
  `'happy-dom'`, and extend `include` to
  `['tests/**/*.test.ts', 'app/shared/ui/**/*.test.ts']`. Do **not** add
  `test.projects` — `defineVitestConfig` throws on it — and do not reach for
  `environmentMatchGlobs`, which Vitest 4 removed (`research.md` § R8). Do not
  redeclare aliases: they are inherited from the Nuxt config. Verify with
  `pnpm test` that `tests/i18n-parity.test.ts` still passes under the new
  environment.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: settle the two mechanics `research.md` leaves open, on the two
components that embody them, before the other six are written. Getting either
wrong on component eight means rewriting eight files.

**⚠️ CRITICAL**: no other component may be written until T003 and T005 pass.

- [x] T002 Create `app/shared/ui/GlassPanel.vue` — the pattern-setter for the
  whole layer. `<script setup lang="ts">`, `export type GlassVariant`,
  `GlassPadding`, `GlassElement`; destructured props with defaults (no
  `withDefaults`); a `const … satisfies Record<GlassVariant, …>` map holding
  **complete** class-name strings; root is `<component :is="as">` with a single
  root so fallthrough `class` merges; default `<slot />`. Values: the six-row
  table in `data-model.md` § 2, sourced from `design-extract.md` § 1. `variant`
  is required with no default (FR-013). Padding is orthogonal to variant
  (FR-014). The panel supplies fill, 1px border, backdrop blur, radius and
  padding and nothing else (FR-016).
- [x] T003 **SPIKE A — does an SFC-exported type survive for a consumer?** In a
  scratch line inside `app/shared/ui/GlassPanel.vue`'s own module or a
  temporary file, write
  `import type { GlassVariant } from '@/shared/ui/GlassPanel.vue'` and run
  `pnpm typecheck`.
  **Pass criterion**: typecheck is green and `GlassVariant` is usable as a type.
  **Fallback if red**: create `app/shared/ui/types.ts` exporting the seven
  unions, have each SFC import its own union from there, and record the change
  in `contracts/components.md` § "Type export mechanism". Do not create
  `types.ts` speculatively if the spike passes (Article VIII).
- [x] T004 Create `app/shared/ui/SocialIcon.vue` — the pattern-setter for asset
  inlining. Import the three glyphs with
  `import linkedin from '@/assets/social/linkedin.svg?raw'` (and the other two),
  select by `network` through a `satisfies Record<SocialNetwork, string>` map,
  and render with `v-html` inside an `aria-hidden` wrapper sized by
  `size-social-glyph`; size the injected `<svg>` with a scoped
  `:deep(svg) { width: 100%; height: auto }` — a plain `svg {}` rule will not
  match `v-html` content (`research.md` § R2). Root is
  `<a :href :aria-label="label" target="_blank" rel="noopener noreferrer">`
  wrapping a `size-social` `rounded-icon` `bg-glass-dark` square with a 1px
  `border-glass-line` and `text-bone-100`. Values: `data-model.md` § 9, sourced
  from `design-extract.md` § 8. Consume the three SVGs as-is — do not
  re-normalize, re-scale, edit or relocate them (FR-043, FR-044).
- [x] T005 **SPIKE B — does the `?raw` + `v-html` + `:deep(svg)` chain paint?**
  Run `pnpm generate` and inspect `.output/public`, then run `pnpm storybook`
  and inspect the rendered DOM.
  **Pass criterion**: the glyph appears as **inline `<svg>` markup** in both,
  and its colour follows the container (`currentColor` resolving to bone-100,
  not `#ffffff`).
  **Fail signature**: an `<img src="/_nuxt/….svg">` — the `?raw` suffix was
  dropped and `currentColor` can never resolve, which is the exact failure
  `rules.md` § R8 exists to prevent.
  **Fallback**: re-check the Storybook alias in `.storybook/main.ts` resolves
  the query suffix before considering any other approach; the alternatives and
  why each was rejected are in `research.md` § R2.
- [x] T006 Delete the placeholder story at
  `app/shared/ui/GlassPanel.stories.ts` (currently titled
  `Shared/Tokens smoke test`). It is removed, not extended (FR-048); its
  token-rendering job moves to `tokens.stories.ts` in T029. Confirm
  `pnpm storybook:build` still succeeds with zero stories present.

**Checkpoint**: both mechanics proven. The remaining six components are now
mechanical.

---

## Phase 3: User Story 1 — Compose a section without knowing any measurement (Priority: P1) 🎯 MVP

**Goal**: a section author can build a glass card with a pill and a radar in
it, naming variants only, never opening `design-extract.md` (SC-009).

**Independent Test**: render the six glass variants, the three radar sizes and
a pill at 1440px and at 390px and confirm each matches `design-extract.md`
§§ 1–3, with no breakpoint in any of the three components.

- [x] T007 [P] [US1] Create `app/shared/ui/GlassPanel.stories.ts` —
  `Meta<typeof GlassPanel>` / `StoryObj`, title `Shared/UI/GlassPanel`, one
  story per variant plus an `AllVariants` story rendering all six together with
  each variant's name as a caption (FR-049 — two variants differing by 5%
  opacity are indistinguishable on separate pages and obvious side by side).
  Consume the existing `ink`/`bone` backgrounds and `390`/`1440` viewports from
  `.storybook/preview.ts`; do not redefine either. Add a note in the story that
  `branding.md` forbids glass-on-glass and the component cannot enforce it
  (spec edge case, A-08).
- [x] T008 [P] [US1] Create `app/shared/ui/GlassPanel.test.ts` — assert each of
  the six variants emits its documented fill/border/blur/radius class;
  `padding: 'tight'` and `'none'` override the variant default; `as` changes
  the rendered tag; a caller-supplied `class` is **merged**, not replaced. Test
  names follow `should <expected> when <condition>` (Article X).
- [x] T009 [P] [US1] Create `app/shared/ui/Radar.vue` — three **nested**
  elements, each `rounded-full`, the outer two `grid place-items-center` so the
  next ring sits concentric (`research.md` § R4 — sibling elements in one grid
  land in separate rows, and forcing one cell needs an arbitrary bracketed
  value the FR-050 gate would flag). Sizes from the three-row table in
  `data-model.md` § 3, sourced from `design-extract.md` § 2 (sm 20/14/7, md
  30/20/12, sm-alt 22/16/10). One colour recipe for all three sizes: outer
  `bg-radar-halo-outer`, middle `bg-radar-halo-mid`, core `bg-red-400`.
  `size` defaults to `'sm'`. Root carries `aria-hidden="true"` (FR-019). **No
  opacity or colour prop** (FR-020) — the mobile services 0.18/0.45/1 ladder
  belongs to that section, not here.
- [x] T010 [US1] Create `app/shared/ui/Radar.stories.ts` — title
  `Shared/UI/Radar`, one story per size plus `AllSizes` rendering the three
  side by side so the diameter progression is visible. Depends on T009.
- [x] T011 [US1] Create `app/shared/ui/Radar.test.ts` — assert three nested
  ring elements with the documented size classes for each of the three sizes,
  and that the root is `aria-hidden`. Depends on T009.
- [x] T012 [US1] Create `app/shared/ui/Pill.vue` — composes
  `<Radar size="sm" />` (same-directory import, permitted by Article XII).
  `inline-flex items-center gap-pill-gap rounded-full border border-glass-line
  bg-glass-dark py-pill-y ps-pill-start pe-pill-end`, label in `text-pill
  text-bone-200`. Values from `data-model.md` § 6, sourced from
  `design-extract.md` § 3. Exactly one prop, `label`, required (FR-026) — the
  13 → 12 difference is carried by the fluid `text-pill` role, not by a `size`
  prop. Padding is logical (`ps`/`pe`), not physical. Depends on T009.
- [x] T013 [US1] Create `app/shared/ui/Pill.stories.ts` — title
  `Shared/UI/Pill`, stories using real labels from `design-extract.md` § 3
  (`Technology solution studio`, `Propósito`, `Servicios`, `Work with muush`),
  plus one deliberately long label exercising the wrap edge case. Depends on
  T012.
- [x] T014 [US1] Create `app/shared/ui/Pill.test.ts` — assert a Radar is
  rendered and the caller's label appears; assert no ES/EN string is baked into
  the component. Depends on T012.

**Checkpoint**: a section author can now build the glass + pill + radar
combination that every landing section uses.

---

## Phase 4: User Story 2 — Review a primitive before composing it (Priority: P1)

**Goal**: every primitive is reviewable in isolation, on the real dark surface,
at both frame widths.

**Independent Test**: build the catalogue and confirm nine entries, each
rendering every variant its component declares.

**Note on ordering**: US2 is delivered *incrementally* — the eight per-component
story files are created inside their own component's phase (T007 GlassPanel,
T010 Radar, T013 Pill, T017 BotonPrimario, T020 Wordmark, T023 Lockup, T025
SocialIcon, T028 LinkArrow) and the token story in T031. The single task below
is the catalogue-wide check and is therefore **executed after Phase 8**, not
now. It is listed here for traceability to the story it serves.

- [x] T015 [US2] Verify the built catalogue: `pnpm storybook:build` succeeds and
  the sidebar shows exactly nine entries — `Foundations/Design tokens` plus
  `Shared/UI/{BotonPrimario, GlassPanel, LinkArrow, Lockup, Pill, Radar,
  SocialIcon, Wordmark}`. Open each on the `ink` background, then flip to
  `bone`: a primitive that only looks right on dark is a defect the background
  switch exists to surface. Toggle `Móvil (390)` ↔ `Escritorio (1440)` and
  confirm the fluid values visibly change. **Execute after T031.**

---

## Phase 5: User Story 3 — The primary CTA reads as alive on pointer devices and calm everywhere else (Priority: P2)

**Goal**: the one animated control in the system, correct in all five of its
states.

**Independent Test**: static ring at rest; rotation starts and stops with the
pointer; flat red-400 under reduced motion; static on touch.

- [x] T016 [US3] Create `app/shared/ui/BotonPrimario.vue`. Three size variants
  from the table in `data-model.md` § 7, sourced from `design-extract.md` § 4:
  `nav` = `py-btn-nav-y px-btn-nav-x text-button-sm`, `hero` = `py-btn-y
  px-btn-hero-x text-button`, `submit` = `py-btn-y px-btn-submit-x
  text-button`. Shared: `relative inline-flex items-center justify-center
  rounded-control bg-glass-dark text-bone-100`. Root is `<component :is>`
  rendering `<a>` when `href` is set and `<button>` otherwise, with `type`
  defaulting to `submit` for the `submit` variant and `button` elsewhere
  (FR-033). Label comes from the default slot — never a hardcoded string.
  **LED ring, in a scoped `<style>` (all four constraints are hard):**
  1. **Three stops: `var(--color-red-400)` 0% → `var(--color-bone-100)` 50% →
     `var(--color-red-400)` 100%. Wine appears NOWHERE.** `branding.md`'s old
     "→ Wine 400" wording was corrected on 2026-09-06; the design file's third
     stop `#cf3247` is a one-digit typo of `red-400` `#CF3147` and the token is
     what goes in code (`design-extract.md` § 4 and § 11).
  2. `mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)`
     with `mask-composite: exclude`, `padding: var(--stroke-led)`,
     `border-radius: inherit`. The simpler `background-clip` trick fails here
     because the button's fill is translucent and the conic layer shows through
     the middle (`research.md` § R3). Emit the `-webkit-` companion alongside
     the standard property.
  3. **Do not redeclare `@property --led-angle` or `@keyframes led-spin`** —
     both are already document-level in `app/assets/css/global.css`, which this
     feature must not modify (FR-006). The scoped block references them.
  4. Gate the animation behind `@media (hover: hover)` and override to flat
     `var(--color-red-400)` under `@media (prefers-reduced-motion: reduce)`.
     **The hover gate is `decisions-open.md` #8, still open, owner Clau** — it
     is carried forward from the pre-migration default, not re-decided (spec
     A-02). Leave a comment saying so, since reversing it is deleting that one
     media query.
  No JavaScript of any kind, no LED prop (FR-034), no disabled/in-flight state.
- [x] T017 [US3] Create `app/shared/ui/BotonPrimario.stories.ts` — title
  `Shared/UI/BotonPrimario`, one story per variant plus `AllVariants`, plus a
  `ReducedMotion` story documenting how to check the flat-ring fallback. Labels
  supplied as slot content in both locales' real copy (`Cuéntanos tu proyecto`
  / `Tell us about your project`) to prove no string is baked in. Depends on
  T016.
- [x] T018 [US3] Create `app/shared/ui/BotonPrimario.test.ts` — assert `<a>`
  when `href` is set and `<button>` otherwise; `type` defaults per variant;
  each variant emits its padding and label-size classes; the slot label
  renders; **assert no wine token appears in the component's output or source**.
  Depends on T016.

**Checkpoint**: the site's single animated control is complete and its four
fallbacks are all reachable without script.

---

## Phase 6: User Story 4 — The brand mark renders correctly at any size (Priority: P2)

**Goal**: the lockup the nav and footer both need, with the isotipo stroke
correct at every width **because nothing sets it**.

**Independent Test**: render at 40 and 52 wide, measure the stroke: 6.8 and
8.85, with no stroke value anywhere in the source.

- [x] T019 [US4] Create `app/shared/ui/Wordmark.vue` — three flush text runs,
  no gap: `muush` (`text-bone-100`), `.` (`text-red-400`), `dev`
  (`text-bone-100`), the last two omitted when `form="short"`. `font-poppins`
  and `text-wordmark` (19 → 24, weight 600, −0.03em). Values from
  `data-model.md` § 4, sourced from `design-extract.md` § 5. **This is the only
  component in the layer permitted to use `font-poppins`** (FR-011,
  `branding.md`: logo/wordmark exclusive). The three literals are the one
  deliberately hardcoded string set — brand identity, locale-invariant, always
  lowercase (FR-005, `messaging.md` rule 6).
- [x] T020 [P] [US4] Create `app/shared/ui/Wordmark.stories.ts` — title
  `Shared/UI/Wordmark`, `Full` and `Short` stories plus `BothForms` side by
  side. Depends on T019.
- [x] T021 [P] [US4] Create `app/shared/ui/Wordmark.test.ts` — assert `full`
  renders all three runs with the dot in red-400; `short` renders only `muush`
  and neither the dot nor `dev`. Depends on T019.
- [x] T022 [US4] Create `app/shared/ui/Lockup.vue` —
  `inline-flex items-center gap-lockup-gap`, containing an `aria-hidden`
  wrapper at `w-isotipo` holding
  `@/assets/logo/isotipo-on-ink.svg?raw` via `v-html` (same chain T004/T005
  proved), followed by `<Wordmark :form="form" />`. Values from `data-model.md`
  § 5, sourced from `design-extract.md` § 6.
  **⚠️ FR-023 — the load-bearing constraint of this feature.** Set the **width
  only**. Do **not** write a `stroke-width` anywhere: not as a prop, not as a
  computed value, not as a helper, not as an attribute on the `<svg>`. The
  formula `12 × (width ÷ 70.5)` that `branding.md`, `design-extract.md` § 6 and
  `rules.md` § R3 all document is a **Pencil workaround**. The browser scales
  `stroke-width` with the `viewBox` automatically — the asset declares
  `viewBox="14.5 38.5 70.5 39.5"` with `stroke-width="12"` in user units, so
  12 × 52 ÷ 70.5 = 8.851 and 12 × 40 ÷ 70.5 = 6.809 fall out on their own.
  Writing the formula applies the scale twice and thickens the mark. Height is
  not set either; it follows the viewBox. Uses `isotipo-on-ink.svg` because the
  site is dark end to end (spec A-09). **Not a link** (FR-024). Depends on T019.
- [x] T023 [US4] Create `app/shared/ui/Lockup.stories.ts` — title
  `Shared/UI/Lockup`, `Full` and `Short`, reviewed at both viewport presets so
  the fluid isotipo width and gap are visible. Depends on T022.
- [x] T024 [US4] Create `app/shared/ui/Lockup.test.ts` — assert an inline
  `<svg>` is present (not an `<img>`); **assert the string `stroke-width` does
  not appear anywhere in the component's rendered output beyond the asset's own
  `12`, and that no computed or bound stroke value exists**; assert `form` is
  forwarded to Wordmark. This is the highest-value test in the set: it guards
  against a bug the design documentation actively invites. Depends on T022.

**Checkpoint**: the shell's brand mark is ready for feature 3.

---

## Phase 7: User Story 5 — Social and secondary links are on-brand and reachable (Priority: P3)

**Goal**: the icon-only and box-less links are both accessible.

**Independent Test**: tab through all three social buttons and both link
sizes; every one takes focus visibly, each social button announces its network,
each external destination opens safely.

- [x] T025 [P] [US5] Create `app/shared/ui/SocialIcon.stories.ts` — title
  `Shared/UI/SocialIcon`, one story per network plus `AllNetworks` rendering
  the three in the 48×48 row the mobile menu uses. Use the real profile URLs
  from `design-extract.md` § 9.bis (`instagram.com/muush.dev`,
  `tiktok.com/@muush.dev`) and note in the story that the LinkedIn URL shape is
  still unconfirmed (`rules.md` § R13 — company page assumed). Depends on T004.
- [x] T026 [P] [US5] Create `app/shared/ui/SocialIcon.test.ts` — assert the
  `aria-label` is the caller's value; `target="_blank"` and
  `rel="noopener noreferrer"` are present; each network renders its own glyph;
  the glyph wrapper is `aria-hidden` so the asset's own `<title>` does not
  compete with the label. Depends on T004.
- [x] T027 [P] [US5] Create `app/shared/ui/LinkArrow.vue` — two sizes,
  `text-link` (16) and `text-link-lg` (20 → 23), always `text-bone-100`, from
  `data-model.md` § 8 sourced from `design-extract.md` § 7. **No background and
  no border in any state** (FR-036) — `design-extract.md` § 7 and `ui-map.md`
  § 3 both say loose text, "nunca un fondo". The trailing `→` is rendered by
  the component inside an `aria-hidden` span so hover has something to
  translate (FR-037, FR-041, spec A-04). `external` adds `target="_blank"
  rel="noopener noreferrer"` (FR-038). Label comes from the default slot.
- [x] T028 [US5] Create `app/shared/ui/LinkArrow.stories.ts` — title
  `Shared/UI/LinkArrow`, both sizes plus a story that makes the hover
  affordance reviewable, using the real copy `Agenda una llamada` /
  `Book a call`. Depends on T027.
- [x] T029 [US5] Create `app/shared/ui/LinkArrow.test.ts` — assert no
  background or border class appears in any state including hover and focus
  (FR-036); the component itself renders the `→` rather than the caller
  (FR-037); the arrow is `aria-hidden` (FR-041); `external` sets both
  `target="_blank"` and `rel="noopener noreferrer"` (FR-038). Depends on T027.
- [x] T030 [US5] Audit the focus indicator across the three interactive
  primitives (`BotonPrimario.vue`, `LinkArrow.vue`, `SocialIcon.vue`): each
  must show a visible red-400 indicator on `:focus-visible` and must not
  suppress the default without replacing it (FR-039, `ui-map.md` § 10). Use
  built-in outline utilities recoloured with `outline-red-400`; the geometry is
  spec A-07 — **no design source exists for it**, so keep the platform default
  and leave a comment saying so. Depends on T016, T027, T004.

**Checkpoint**: all eight primitives exist and are keyboard-reachable.

---

## Phase 8: User Story 6 — A section author can see the vocabulary itself (Priority: P3)

**Goal**: the token set is inspectable, absorbed from feature 1.

**Independent Test**: open the story at both widths; every ramp step and type
role is labelled with the name an author would write, and the specimens resize.

- [x] T031 [US6] Create `app/shared/ui/tokens.stories.ts` — **lowercase
  filename on purpose**: Article VIII reserves PascalCase for components, so
  the name itself says this is not one. Title `Foundations/Design tokens`, so
  it sorts into its own sidebar group above the primitives rather than reading
  as a ninth. Render (a) the four ramps — `bone`, `ink`, `red`, `wine` — at
  five steps each, every swatch captioned with its token name, and (b) one
  specimen line per fluid type role from `app/assets/css/global.css`, captioned
  with the class an author would write (`text-display`, `text-h1`, …). No new
  token, no hardcoded hex: the swatches use the `bg-*` utilities, so a swatch
  that renders wrong is a token that is wrong.

---

## Phase 9: Polish & Cross-Cutting Verification

- [x] T032 Run the FR-050 token-discipline gate over `app/shared/ui/*.vue`
  (`quickstart.md` § 4). All three must return nothing:
  ```bash
  grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(|oklch\(' app/shared/ui/*.vue
  grep -nE '[0-9]+(px|rem|em)\b' app/shared/ui/*.vue
  grep -nE '\[[a-z-]+:[^]]+\]|(sm|md|lg|xl):(text|p|px|py|m|mx|my|gap|rounded|blur)-' app/shared/ui/*.vue
  ```
  **Two matches are legitimate and pre-declared — do NOT "fix" them**:
  `:deep(svg) { width: 100%; height: auto }` in `Lockup.vue` and
  `SocialIcon.vue` (layout keywords, not design values — there is no token for
  "fill your parent"), and `animation: led-spin 2.6s linear infinite` in
  `BotonPrimario.vue` (a duration, which Article VII does not govern; the value
  is `design-extract.md` § 4 verbatim). Anything else is a real violation.
- [x] T033 Conformance review of the eight `.vue` files against
  `contracts/components.md`: every prop name, type, optionality and default
  matches; no prop exists that the contract's "Deliberately NOT in this
  contract" section rejects; **no component declares `class` as a prop**
  (Vue merges it through fallthrough — `research.md` § R6); no component sets
  `inheritAttrs: false`; each file is under 200 lines (Article V); no component
  contains an event handler, a `ref` driving a style, or an `onMounted`
  (Article IV — zero runtime JavaScript).
- [x] T034 Execute T015 (the catalogue verification deferred from Phase 4).
- [x] T035 Run the full gate and confirm all six are green:
  `pnpm check` · `pnpm typecheck` · `pnpm test` · `pnpm generate` ·
  `pnpm storybook:build` · `./init.sh` (SC-010). `pnpm check` and
  `pnpm typecheck` also run in the Husky pre-commit hook; `--no-verify` is
  prohibited.
- [x] T036 If T003's spike forced the `types.ts` fallback, or if any assumption
  in `spec.md` had to be resolved differently during implementation, append the
  new rule to `docs/business/rules.md` under a `Feature 002` heading, citing
  this feature. **Append, never overwrite.**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies.
- **Phase 2 (Foundational)**: T002–T005 depend on nothing but each other in
  pairs (T003 after T002, T005 after T004). T006 is independent of both.
  **Blocks every later phase** — the two spikes decide the shape of six more
  components.
- **Phases 3–8 (User Stories)**: all depend on Phase 2. Phase 7's T025/T026
  additionally depend on T004 (Phase 2), which is why SocialIcon's component
  sits in Foundational while its story and test sit in US5.
- **Phase 9 (Polish)**: depends on all of Phases 3–8.

### Within-story dependencies

| Task | Depends on | Why |
|---|---|---|
| T010, T011 | T009 | the story and test import `Radar.vue` |
| T012 | T009 | Pill composes Radar |
| T013, T014 | T012 | import `Pill.vue` |
| T017, T018 | T016 | import `BotonPrimario.vue` |
| T020, T021 | T019 | import `Wordmark.vue` |
| T022 | T019 | Lockup composes Wordmark |
| T023, T024 | T022 | import `Lockup.vue` |
| T025, T026 | T004 | import `SocialIcon.vue` |
| T028, T029 | T027 | import `LinkArrow.vue` |
| T030 | T004, T016, T027 | audits all three interactive primitives |
| T034 (= T015) | T031 | the catalogue is not complete until the token story exists |

### Parallel Opportunities

Genuinely disjoint files only. The two composition edges — Pill → Radar and
Lockup → Wordmark — are **not** parallel with their dependency.

```bash
# After Phase 2, three components can be written at once:
T009  Radar.vue          # no dependency
T016  BotonPrimario.vue  # no dependency
T027  LinkArrow.vue      # no dependency
T019  Wordmark.vue       # no dependency

# Within US1, once Radar exists:
T007  GlassPanel.stories.ts   # disjoint from
T008  GlassPanel.test.ts      # each other

# Within US4, once Wordmark exists:
T020  Wordmark.stories.ts     # disjoint from
T021  Wordmark.test.ts        # each other
```

---

## Implementation Strategy

### MVP first

1. Phase 1 (T001) — tests become collectable.
2. Phase 2 (T002–T006) — **the critical phase**. Both spikes must pass before
   anything else is written.
3. Phase 3 (T007–T014) — GlassPanel, Radar, Pill.
4. **STOP and validate**: `pnpm storybook` shows three reviewable primitives,
   `pnpm test` is green, and the T032 grep gate already returns clean on those
   three. This is a demonstrable increment even if the rest slips.

### Incremental delivery

Each of Phases 5–8 adds reviewable primitives without touching the earlier
ones — every component is a separate file with at most one internal dependency,
so a phase cannot regress a previous phase. Feature 3 (site shell) is unblocked
once Phases 5 and 6 land, since the nav needs Lockup, Wordmark and
BotonPrimario; the mobile menu additionally needs SocialIcon from Phase 2.

### Notes

- Commit after each task or logical group. Branch prefix must satisfy
  `.husky/pre-commit`; `master` is exempt from the name check.
- `[P]` means a different file with no incomplete dependency.
- Three items are flagged for the approval gate, not defects:
  **A-02** LED on touch (`decisions-open.md` #8, still open, owner Clau),
  **A-12/FR-051** component tests (an addition made to satisfy Article X), and
  **A-07** focus-indicator geometry (no design source exists).
