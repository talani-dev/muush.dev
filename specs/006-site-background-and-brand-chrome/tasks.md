---

description: "Task list for feature 006 — site background and brand chrome"
---

# Tasks: Site background and brand chrome

**Input**: Design documents from `specs/006-site-background-and-brand-chrome/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/components.md`, `quickstart.md`

**Tests**: included — Constitution Article X requires a component test and a
Storybook story for every `app/shared/ui/` component, and spec FR-029/FR-030
name both.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable — different files, no dependency on an incomplete task
- **[Story]**: the user story the task serves (US1–US4 from `spec.md`)

## Path conventions

Nuxt 4 with `srcDir: app/`. Components in `app/shared/ui/`, layout in
`app/layouts/`, tokens in `app/assets/css/global.css`, artifact assertions in
`tests/`, catalogue configuration in `.storybook/`, assets in `public/`.

---

## Phase 1: Setup

**Purpose**: capture the before-state, so every change is attributable.

- [x] T001 Run the five gates on the untouched branch (`pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build`) and confirm all pass. Then run `pnpm dev`, open `/es/`, and record the `[VUE_ROUTER_R0004]` warnings naming `/fonts/*` paths in `docs/harness/progress/impl_site_background_and_brand_chrome.md` as the before-state for FR-016/SC-009. Do not change any file yet.

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: the tokens every background task consumes. Nothing in Phase 3 can
be written before these exist.

- [x] T002 Add five tokens to the `:root` block of `app/assets/css/global.css`, beside `--dark-glass` / `--stroke-led` / `--duration-radar-ping` and **not** inside `@theme inline` (`rules.md` § R18 — they are read from hand-written CSS): `--dot-paper-color: color-mix(in srgb, var(--ink-100) 12%, transparent)`, `--dot-paper-radius: 0.078125rem`, `--dot-paper-step: 1.5rem`, `--layer-glow: -2`, `--layer-dots: -1`. Values and derivations are in `data-model.md` §§ 1-2; the comment above them cites `design-extract.md` § 10 and records that the design's 288px tile and 90 instances are an authoring artifact that must never appear in code.

**Checkpoint**: `pnpm check` and `pnpm generate` still pass; the new custom
properties appear in the emitted CSS under `:root`.

---

## Phase 3: User Story 1 — The site looks like the design instead of a scaffold (Priority: P1)

**Goal**: the four-layer stack renders on every page in both locales — ink
base, section glows, dotted paper, content — decorative and inert, with no
horizontal scrollbar.

**Independent test**: generate the site, open both locales at 390px and
1440px, scroll each page top to bottom, and confirm the dot field covers the
full page, the layer order holds, and nothing about pointer or keyboard
behaviour changed.

- [x] T003 [P] [US1] Create `app/shared/ui/DotGrid.vue` per `contracts/components.md` § *DotGrid*: `<script setup lang="ts">`, no props, no slot; a single element with `aria-hidden="true"`, `pointer-events-none`, `absolute inset-0`, and a `<style scoped>` block setting `z-index: var(--layer-dots)`, `background-image: radial-gradient(var(--dot-paper-color) var(--dot-paper-radius), transparent var(--dot-paper-radius))` and `background-size: var(--dot-paper-step) var(--dot-paper-step)`. The doc comment states why this is one repeating background and not the design file's 144-ellipse tile (FR-001), and what the component requires of its host. Zero literals (FR-002).
- [x] T004 [P] [US1] Create `app/shared/ui/SectionBackdrop.vue` per `contracts/components.md` § *SectionBackdrop*: no props, default slot, `aria-hidden="true"`, `pointer-events-none`, `absolute inset-0`, `z-index: var(--layer-glow)`. Its doc comment carries the **section contract** verbatim — `position: relative` on the section, no intervening stacking context (`transform`, `filter`, `opacity < 1`, `isolation`, `will-change`, `contain: paint`, sticky/fixed with `z-index`), no opaque section background, and the note that the failure is silent (spec A-04).
- [x] T005 [P] [US1] Create `app/shared/ui/DotGrid.test.ts`: `should render exactly one element when mounted` (the anti-tiling assertion of FR-001), `should hide itself from assistive technology when rendered`, `should never intercept pointer events when rendered`, and `should resolve its pattern from the dot-paper tokens when rendered` — asserting the three `var(--dot-paper-*)` references, not literal values, so a token rename fails here rather than in production.
- [x] T006 [P] [US1] Create `app/shared/ui/SectionBackdrop.test.ts`: `should hide itself from assistive technology when rendered`, `should never intercept pointer events when rendered`, `should sit on the glow layer when rendered` (asserts `var(--layer-glow)`, i.e. below the dots), and `should render the glows it is given when a default slot is provided`.
- [x] T007 [US1] Edit `app/layouts/default.vue` per `contracts/components.md` § *Host contract*: the root element keeps `min-h-screen bg-ink-500` and gains `relative isolate overflow-x-clip`; render `<DotGrid />` once, imported as `@/shared/ui/DotGrid.vue` (Article XII). **Rewrite the comment at lines 16-20**: it currently says the dotted paper and glows are deliberately unpainted; it must describe the four-layer stack, cite `SdEJx`'s child order, record spec A-03 as resolved by this feature, and state why `overflow-x: clip` is not `hidden` (`research.md` § R3). Do not touch the shell imports, the `:inert` wrapper, `<main>`'s classes or `useHead`.
- [x] T008 [US1] Create `app/shared/ui/DotGrid.stories.ts` with a *Dot grid* story showing the layer alone over `ink-500` at both viewports, and a *Composed background* story rendering the full stack — host element (`relative isolate overflow-x-clip bg-ink-500`), one `SectionBackdrop` carrying the real Hero triplet (`red-400` 65% `1500-700`, `wine-300` 40% `1100-520`, `wine-400` 30% `900-520`, `design-extract.md` § 10), `DotGrid`, and real text content on top. This story is the only place the layer order is reviewable (`research.md` § R7), so its docs text must say what to look for.
- [x] T009 [US1] Extend `tests/static-output.test.ts` with `should paint the background layers on every route when the site is generated`: for all four documents (`/es`, `/en`, `/es/nosotros`, `/en/about`), assert the layout root carries the isolation/clip classes and that the dot layer element is present in the prerendered HTML — proving FR-009 (no JavaScript) and FR-004 (both locales) against the artifact rather than a mounted component. Read files with `node:path` + `process.cwd()`, never `new URL` (`rules.md` § R27).
- [x] T010 [US1] Verify by eye per `quickstart.md` § 3 and record the result in `docs/harness/progress/impl_site_background_and_brand_chrome.md`: dots cover the full scroll height on both pages and both locales; no horizontal scrollbar from 320px to 2560px; text selection and clicks over bare background unchanged; the mobile menu still opens above everything and its glass now blurs the dots (FR-008); the footer stays opaque (A-12).

**Checkpoint**: the site renders base + dots everywhere, the composed story
shows all four layers in order, and every existing test still passes
unmodified.

---

## Phase 4: User Story 2 — The site is set in its own typefaces (Priority: P1)

**Goal**: Poppins 600 and Instrument Sans 400/500/600, self-hosted from the
site's own origin, with a clean dev console and a catalogue that shows the
same type.

**Independent test**: generate the site, load a page with the network panel
open, confirm the two families come from the site's own origin and nowhere
else, then run `pnpm dev` and confirm no `[VUE_ROUTER_R0004]` warning names a
font path.

- [x] T011 [US2] `pnpm add @nuxt/fonts` (0.14.x) and add `'@nuxt/fonts'` to `modules` in `nuxt.config.ts`, after `'@nuxtjs/i18n'`. Confirm the lockfile change adds no lint/format tool (Article IX forbids ESLint and Prettier entering the tree).
- [x] T012 [US2] Configure the `fonts` block in `nuxt.config.ts` per `research.md` § R4 and `data-model.md` § 3: `defaults: { styles: ['normal'], subsets: ['latin', 'latin-ext'] }`, `families: [{ name: 'Poppins', provider: 'google', weights: [600] }, { name: 'Instrument Sans', provider: 'google', weights: [400, 500, 600] }]`, `throwOnError: true`. The comment above it states, in this repository's voice: the binaries are downloaded at **build** time and emitted into `.output/public/_fonts`, so the deployed artifact makes no runtime request (Article IV); `throwOnError` is on so a failed download fails the build instead of silently shipping fallback type; and the weight set is closed because `branding.md` grants Poppins to the wordmark alone.
- [x] T013 [US2] Delete from `app/assets/css/global.css` the TODO comment at line 529 and the four `@font-face` blocks below it (Poppins 400/700, Instrument Sans 400/700 — weights nothing in the design uses, pointing at files that do not exist), and delete the empty `public/fonts/` directory. Change nothing else in the file: the 32 type tokens stay exactly as they are (FR-018).
- [x] T014 [US2] Run `pnpm generate` and verify the artifact per `quickstart.md` § 2: `.output/public/_fonts/` holds the binaries; the emitted CSS declares `@font-face` for both families at the four weights with `src` pointing at `/_fonts/…`; `fonts.gstatic.com` and `fonts.googleapis.com` appear **nowhere**; none of the four deleted `/fonts/*.woff2` paths survives. **If the faces are not emitted**, add `global: true` to each family — the documented fallback in `research.md` § R4 — and re-verify. Record which path was taken.
- [x] T015 [P] [US2] Create `.storybook/preview-head.html` loading Poppins 600 and Instrument Sans 400/500/600 from the Google Fonts stylesheet, with a comment stating that this is catalogue-only, that Storybook runs Vite outside Nuxt and never sees the font module (`rules.md` §§ R19, R23), and that the deployed site is self-hosted (spec A-05). Confirm the stories render in the two families in `pnpm storybook` and in `pnpm storybook:build`.
- [x] T016 [US2] Extend `tests/static-output.test.ts` with `should serve the brand fonts from its own origin when the site is generated`: the emitted CSS contains `@font-face` for both families; every font `src` URL is same-origin; the artifact contains zero occurrences of `fonts.gstatic.com` / `fonts.googleapis.com`; and zero occurrences of the four deleted font paths. This is the mechanical half of FR-015 and SC-007.
- [x] T017 [US2] Verify by eye per `quickstart.md` § 4 and record it: `pnpm dev` console has no `[VUE_ROUTER_R0004]` for a font path (compare against the T001 before-state); devtools *Rendered Fonts* shows Poppins for the wordmark and Instrument Sans everywhere else, with no synthesised bold (FR-017).

**Checkpoint**: the site and the catalogue both render in brand type; the
artifact is self-contained.

---

## Phase 5: User Story 3 — The tab carries the muush mark (Priority: P2)

**Goal**: an adaptive isotipo favicon on the site and in the catalogue, and no
Nuxt asset left in `public/`.

**Independent test**: load the generated site in light and dark OS appearance
and confirm the tab shows the isotipo, legible in both, with nothing
Nuxt-branded under `public/`.

- [x] T018 [P] [US3] Replace `public/favicon.svg` with the muush isotipo per `data-model.md` § 5: `viewBox="0 0 100 100"` with the geometry wrapped in `transform="translate(3, -8)"` (the avatar/favicon framing `branding.md` § *Isotipo* already documents — this is how a 70.5×39.5 artboard becomes square without distortion, FR-022); `circle cx=21 cy=45 r=6.5` filled `#CF3147`; `path M21 72 a17 17 0 0 1 34 0 a12 12 0 0 1 24 0` with `stroke-width="12"`, `stroke-linecap="round"`, no fill; an internal `<style>` whose **default** stroke is `#262626` and whose `@media (prefers-color-scheme: dark)` override is `#FBF8F6`, the dot unchanged in both. Include a comment recording the provenance (`app/assets/logo/README.md`, `branding.md`) and why literal hex is correct in a standalone `public/` document.
- [x] T019 [P] [US3] Delete `public/favicon.ico` (spec A-06 — no rasterizer in this repository, and adding a build dependency for a 16×16 legacy format fails Article VIII). Confirm nothing else under `public/` is Nuxt-branded (FR-024).
- [x] T020 [US3] Declare the icon in `nuxt.config.ts` under `app.head.link` (`rel="icon"`, `type="image/svg+xml"`, `href="/favicon.svg"`), so every prerendered page in both locales carries it instead of relying on the `public/favicon.ico` convention that has been serving the Nuxt logo (FR-025).
- [x] T021 [US3] Create `.storybook/manager-head.html` declaring the same icon for the catalogue's own tab. `staticDirs: ['../public']` already serves it. **Verify rather than assume**: Storybook ships its own `favicon.svg`, so check the built `storybook-static/` and the running catalogue's tab; if the two collide at the static root, serve the icon under a distinct path and point the link at it. Record which happened.
- [x] T022 [US3] Extend `tests/static-output.test.ts` with `should declare the muush icon on every route when the site is generated`: each of the four documents contains the `rel="icon"` link to `/favicon.svg`, and `.output/public/favicon.ico` does not exist.
- [x] T023 [US3] Verify by eye per `quickstart.md` § 5 and record it: light and dark browser appearance, the mark centred and not stretched, the catalogue's tab, and a note that Safari does not use SVG favicons (spec A-08) so the check was done in Chromium or Firefox.

**Checkpoint**: no stock Nuxt asset anywhere; both tabs carry the isotipo.

---

## Phase 6: User Story 4 — A future section adds glows without touching shared code (Priority: P2)

**Goal**: the contribution mechanism is documented where the next implementer
will read it, and demonstrated with more than one contributing section.

**Independent test**: in the catalogue, two stand-in sections each contribute
their own glows; both sets render beneath the dots, neither displaces the
other, and no layout or shared file was edited to make either appear.

- [x] T024 [US4] Add an *Additive contribution* story to `app/shared/ui/DotGrid.stories.ts` (or a sibling `SectionBackdrop.stories.ts` if it reads better) with **two** stand-in sections, each `position: relative`, each rendering its own `SectionBackdrop` with a different glow set from `design-extract.md` § 10 — e.g. the Hero triplet and the Propósito pair (`wine-400` 20% `1000-560`, `wine-300` 17% `820-480`). The docs text states the one-file rule (SC-005) and the silent failure mode (A-04).
- [x] T025 [US4] `docs/business/rules.md` already carries **R28–R31**, appended during the spec cycle (§ *Feature 006 · Fondo del sitio y chrome de marca — especificación*): the paint-order contract and its silent failure mode, the page-absolute → section-relative offset rule plus discrepancy D-01, the catalogue's separate font declaration, and the `@nuxt/fonts` emission path. **Read them before implementing**, confirm the implementation matches what they claim, and — if implementing turned any of them out to be wrong or incomplete — append a corrections block at the end under `## Feature 006 · … hallazgos de implementación`, following the R25–R27 precedent. **Never overwrite an existing rule.**
- [x] T026 [US4] Confirm `git diff app/shared/ui/SectionGlow.vue` is empty (FR-011, SC-006) and that no existing test file was modified to accommodate this feature — only extended with new cases (SC-012).

**Checkpoint**: the mechanism is provable in the catalogue and recorded in the
file a future spec author must read.

---

## Phase 7: Polish & cross-cutting

- [x] T027 [P] Correct `docs/business/branding.md` lines 63-64 (FR-027): the claim that the `@font-face` declarations already match the branding book is false (they declared Poppins 400/700 and Instrument Sans 400/700 against a book that asks for Poppins 600 and Instrument Sans 400/500/600), and the cited path `src/styles/global.css` has not existed since the Nuxt migration — it is `app/assets/css/global.css`. Correct both halves in place, dated 2026-09-07, citing this feature, and note that the faces are now emitted by the font module rather than hand-written. Do not rewrite the surrounding section.
- [x] T028 Run the five gates and confirm all pass: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build` (FR-031, SC-012).
- [x] T029 Complete `docs/harness/progress/impl_site_background_and_brand_chrome.md` with the session record: what was built, the before/after of the `[VUE_ROUTER_R0004]` warnings, which font-emission path T014 took, what T021 found about the catalogue favicon collision, the results of the three by-eye verifications (T010, T017, T023), and anything a reviewer should look at first.

---

## Dependencies

```
T001 (baseline)
  └─ T002 (tokens)  ────────────────────────────────┐
        ├─ US1: T003, T004, T005, T006 → T007 → T008 → T009 → T010
        └─ US4: T024 (needs T004 and T008)
US2: T011 → T012 → T013 → T014 → T016 → T017      (T015 parallel from T011)
US3: T018, T019 → T020, T021 → T022 → T023
US4: T024 → T025 → T026
Polish: T027 (any time) → T028 → T029 (last)
```

- **US1 depends on** T002 only. It is the MVP.
- **US2, US3 are independent of US1 and of each other** — different files
  entirely. They can be done in any order or in parallel.
- **US4 depends on US1** (it demonstrates the mechanism US1 builds).
- **T009, T016 and T022 all edit `tests/static-output.test.ts`** — they are
  therefore **not** parallel with each other, even though their stories are.
- **T012 and T020 both edit `nuxt.config.ts`** — not parallel.
- **T002 and T013 both edit `global.css`** — not parallel.

## Parallel execution examples

Within US1, after T002:

```
T003 (DotGrid.vue)          ┐
T004 (SectionBackdrop.vue)  ├─ four different files, no shared edits
T005 (DotGrid.test.ts)      │
T006 (SectionBackdrop.test) ┘
```

Across stories, once T002 is done: US1's component tasks, US2's T011/T015 and
US3's T018/T019 touch disjoint files and can proceed together.

## Implementation strategy

**MVP = US1.** The background is the reason the feature exists and the layer
every future section composes onto. If the cycle had to stop after one story,
US1 alone is a coherent, shippable increment.

Then **US2** — tied at P1 in the spec, and the one whose absence has silently
invalidated every visual review so far. Then **US3** (brand damage, no
structural risk) and **US4** (documentation and proof of the mechanism).

Three things are deliberately *not* automatable and are tasks in their own
right — T010, T017 and T023. `happy-dom` cannot paint and no test in this
repository can tell you a glow rendered beneath a dot (`research.md` § R7).
Skipping them and declaring the feature done would be exactly the green-suite
illusion `rules.md` § R27 recorded.
