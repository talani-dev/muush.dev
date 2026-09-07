# Review: primitive_ui_layer (feature 002)

## APPROVED

Reviewed 2026-09-06 (Nuxt 4 / Vue 3 / Tailwind v4 / Storybook 10 cycle). This
file replaces the Astro-era review of the same name; that implementation was
discarded by the 2026-09-06 migration and nothing below refers to it.

Feature 2 confirmed at status `reviewing` in `feature_list.json` before this
review began. No repository file was modified by this review other than this
one.

**Reason**: all eight primitives are correct against `design-extract.md`
§§ 1-8, every acceptance criterion is covered by a test, all 36 tasks are
truthfully done except the human-visual pass noted below, no Constitution
violation was found, and `./init.sh` exits 0 with 8/8 checks.

---

## Checkpoints C1-C8

- **C1 — harness complete.** CONFIRMED. All base and harness files present;
  `constitution.md` v2.0.0 is real, not a template. `./init.sh` exits 0.
- **C2 — state coherent.** CONFIRMED with one housekeeping defect. Exactly one
  feature active (id 2, `reviewing`); feature 1 `done` with `init.sh`-verified
  criteria. **`docs/harness/progress/current.md` is stale** — it still
  describes the `spec_author` session and states feature 2 is `spec_ready`,
  contradicting `feature_list.json`. Leader-owned; fix before closing.
- **C3 — architecture (Feature-Based).** CONFIRMED. `app/features/`,
  `app/layouts/` and `app/pages/` untouched (`app/pages/index.vue` pre-exists);
  this feature deliberately creates no feature module. Everything landed in
  `app/shared/ui/`. Largest component is `BotonPrimario.vue` at 134 lines; no
  function approaches 30. No cross-layer import exists to violate.
- **C4 — constitution in code.** CONFIRMED. See the article-by-article section.
- **C5 — verification real.** CONFIRMED. 9 Storybook entries / 39 stories
  (`storybook-static/index.json`), one per `app/shared/ui/` component plus
  `Foundations/Design tokens`. `pnpm test` = 63 passing in 9 files.
  `pnpm generate` writes `.output/public` (8 routes). `pnpm storybook:build`
  succeeds.
- **C6 — session closed cleanly.** NOT YET APPLICABLE. `history.md`'s last
  entry covers the feature-1 close, not the feature-2 implementation session;
  the session is still open pending this review. Leader to add the entry and
  move status on close.
- **C7 — SDD.** CONFIRMED. `spec.md`, `plan.md`, `tasks.md`, `research.md`,
  `data-model.md`, `contracts/components.md`, `quickstart.md` and
  `checklists/requirements.md` all present. All Phase -1 gates `[x]`. Zero
  `[NEEDS CLARIFICATION]` markers. 36/36 tasks `[x]`, none unchecked.
- **C8 — i18n parity.** CONFIRMED. Both `/es/` and `/en/` prerender.
  `es.json` and `en.json` share the same key tree and
  `tests/i18n-parity.test.ts` passes. No i18n key was added — correctly, since
  every visible string in these primitives comes from the caller (FR-005). The
  only hardcoded strings are the Wordmark's `muush` / `.` / `dev` runs, which
  the spec designates as locale-invariant brand identity.

---

## Constitution v2.0.0

- **Article IV — static purity.** CONFIRMED. `nitro.preset: 'static'` unchanged
  in `nuxt.config.ts`; no `server/` directory exists; no route added. No
  component carries an event handler, a `ref` driving a style, or `onMounted`.
  The LED ring is pure CSS.
- **Article V — component discipline.** CONFIRMED. All 8 SFCs open with
  `<script setup lang="ts">`. Zero occurrences of `defineComponent`,
  `export default {` or `inheritAttrs`. All under 200 lines.
- **Article VII — token discipline.** CONFIRMED, mechanically. All three
  `quickstart.md` § 4 greps return **zero** matches across
  `app/shared/ui/*.vue`: no hex / `rgb()` / `oklch()`, no `px`/`rem`/`em`
  literal, no arbitrary bracketed value, no breakpoint-driven size utility.
  Cleaner than the spec budgeted — the two pre-declared exceptions were
  reworded out rather than footnoted. Poppins appears only in `Wordmark.vue`.
- **Article X — story + test per component.** CONFIRMED. All 8 have both:
  `<Name>.vue` + `<Name>.stories.ts` + `<Name>.test.ts`, plus
  `tokens.stories.ts`. Test names follow `should <expected> when <condition>`
  throughout. No test depends on another's state.
- **Article XII — absolute imports.** CONFIRMED. No relative import crosses a
  directory boundary; the only relative imports are same-directory
  (`./Radar.vue`, `./Wordmark.vue`), which the article permits. Asset imports
  use `@/assets/...`. **No new alias was added**, so nothing new needed
  mirroring; the six existing aliases in `.storybook/main.ts` still match
  `nuxt.config.ts` exactly.

---

## Measured values vs `design-extract.md`

Every value below was traced from the component's utility class through the
token declaration in `app/assets/css/global.css` to the design figure. All
CONFIRMED.

- **§ 1 GlassPanel, 6 variants.** `red-strong` 17% fill / 47% border,
  `red-soft` 12% / 35%, `bone-strong` 10% / 18%, `bone` 6% / 18%,
  `bone-faint` 4% / 16% (the design's `#FBF8F2` resolved to bone-100 at 16% per
  rules.md § R2), `dark` 65% of `--dark-glass` / 23%. Blur `22/20` (red),
  `16` (bone), `22` (dark). Radius `22/18` (`--radius-panel`) and `20/18`
  (`--radius-panel-sm`). Padding `32/22`, `28/22`, `34/24`, tight `22/18`.
  The `bone-faint` variant correctly maps to the 32/22 padding token, matching
  the design's row.
- **§ 2 Radar, 3 sizes.** `sm` 20/14/7, `md` 30/20/12, `sm-alt` 22/16/10 — all
  exact in rem. One colour recipe across all three: outer red-400 @12%, middle
  @30%, core solid red-400. Three genuinely nested rings, `aria-hidden`, no
  opacity or colour prop.
- **§ 3 Pill.** gap 11, padding `[9, 20, 9, 10]` expressed logically
  (`py`/`ps`/`pe`), radius 999, dark-glass fill, 18% border, `text-pill`
  13→12 at weight 500 and ls 0.054em (= 0.7/13). One prop, `label`.
- **§ 4 BotonPrimario, 3 sizes + LED.** `nav` `[13, 24]` @14,
  `hero` `[18/16, 32/26]` @16/15, `submit` `[18/16, 32/28]` @16/15. Radius 12,
  ring `--stroke-led` = 1.5px. **LED gradient CONFIRMED as
  `red-400 0% → bone-100 50% → red-400 100%` — three stops, NOT wine.** Zero
  occurrences of any wine token in any component; the only "wine" string in the
  layer is the comment explaining its absence, and `BotonPrimario.test.ts`
  asserts it. Verified in the emitted CSS
  (`storybook-static/assets/BotonPrimario-*.css`): masked pseudo-element with
  `mask-composite: exclude` and its `-webkit-` companion, `@media (hover: hover)`
  gating a `2.6s linear infinite` spin, and `@media (prefers-reduced-motion:
  reduce)` flattening to `background: var(--red-400); animation: none`. No
  JavaScript.
- **§ 5 Wordmark.** Both lockups. `muush` and `dev` bone-100, separating `.`
  red-400, three flush runs with no gap, `text-wordmark` 24→19 at weight 600
  and ls -0.03em (= -0.72/24 = -0.57/19).
- **§ 6 Lockup.** gap 12→9 (`--spacing-lockup-gap`), isotipo width 52→40
  (`--spacing-isotipo`), on-ink variant, `aria-hidden`, not a link.
- **§ 7 LinkArrow.** `text-link` 16 fixed, `text-link-lg` 20→23 at ls -0.03em
  (= -0.7/23), always bone-100, no background or border in any state.
- **§ 8 SocialIcon.** 48×48 (`--spacing-social`), radius 10 (`--radius-icon`),
  18% border, dark-glass fill, glyph at 24 (`--spacing-social-glyph`, spec
  A-06), inlined via `?raw` + `v-html` + `:deep(svg)` so `currentColor`
  resolves to bone-100.

## Isotipo stroke formula (§ 6) — the load-bearing check

**CONFIRMED NOT replicated.** `Lockup.vue` sets `w-isotipo` and nothing else;
height and stroke are left to the viewBox. The asset declares
`viewBox="14.5 38.5 70.5 39.5"` with `stroke-width="12"` in user units, so the
browser produces 8.851 at width 52 and 6.809 at width 40 on its own, matching
the design's 8.85 and 6.8. The formula `12 × width ÷ 70.5` appears only in
explanatory comments and in `Lockup.test.ts`, which asserts the rendered output
contains exactly one `stroke-width` (the asset's own `12`) and that the
template contains neither a stroke value nor `70.5`. No prop, no computed
value, no helper. Double-scaling is impossible.

---

## Ruling on the three flagged deviations

### 1. `var(--red-400)` instead of `var(--color-red-400)` — CORRECT, justification partly overstated

The **decision is right and was necessary.** Verified against both builds:
`dist/_nuxt/*.css` (the shipped site) contains **zero** `--color-*`
declarations, so `var(--color-red-400)` would have resolved to nothing and the
LED ring would not have painted in production. The `:root` ramp names
`--red-400` / `--bone-100` are emitted unconditionally and are the safe target.

The justification is **imprecise, not wrong**: `--color-red-400:var(--red-400)`
*is* present in the Storybook stylesheet, so R18's blanket wording ("`--color-red-400`
no existe") holds for the site build but not for the catalogue build. Worth a
one-line correction to R18; it changes no code.

### 2. `@vitejs/plugin-vue` + `.storybook/main.ts` — NECESSARY, correct, no cleaner in-scope option

The claim reproduces. **CONFIRMED at source**, not from the error message:
`@storybook/vue3-vite@10.6.0`'s `viteFinal` returns exactly two plugins —
`templateCompilation()`, which only aliases `vue` to `vue/dist/vue.esm-bundler.js`,
and a docgen plugin that runs `order: 'post'` on already-compiled output.
Neither transforms SFC source. `grep -rl plugin-vue` across
`@storybook/vue3-vite`, `@storybook/vue3` and `@storybook/builder-vite` returns
**nothing**, and `plugin-vue` is not among their dependencies. `builder-vite`
expects the SFC plugin from the project's own `vite.config.*`, and this
repository has none because Nuxt owns the Vite config. So without the explicit
registration Storybook genuinely cannot compile a single `.vue` file — a real
blocker, and one that makes Article X unimplementable.

The alternatives are all worse: inline-template-only stories would defeat the
purpose of the story (it must render the real component); adding a root
`vite.config.ts` introduces a second config surface competing with Nuxt's.

The dependency addition is also genuinely inert, verified: the `pnpm-lock.yaml`
diff is **3 lines** — an importer entry only, no new package entry and no new
integrity hash. `@vitejs/plugin-vue@6.0.8` was already installed in three
peer-resolved variants as a transitive dependency of Nuxt's Vite builder, from
the official `vitejs` publisher, and already executes on every `pnpm dev` and
`pnpm generate`. Promoting it to an explicit devDependency adds zero new code
to the tree and merely makes it importable from the project root under pnpm's
strict layout. Registering `vue()` in `.storybook/main.ts` is the same duty
Article XII already imposes on that file ("what Nuxt provides, Storybook
redeclares"), extended from aliases to the compiler.

**Ruling: the deviation was correct and was correctly flagged.** One paperwork
gap follows from it — see below.

### 3. `useVueMultiWordComponentNames` produces 4 `info`s — ACCURATE

Reproduced exactly: `pnpm check` emits one `info` each for `Radar.vue`,
`Wordmark.vue`, `Lockup.vue` and `Pill.vue`, and `biome check
--error-on-warnings` still exits 0 because `info` is not promoted. `biome.json`
was correctly left unmodified. `research.md` § R9's operative conclusion holds;
only its "no diagnostic" wording was too strong. Not a defect.

---

## Accuracy of the implementer's summary

Independently verified rather than taken on trust. Every quantitative claim
holds: 63 tests in 9 files; 9 catalogue entries and 39 stories; all three grep
gates clean; `--color-*` absent from the site build; the LED CSS as described;
one `stroke-width` in the Lockup output; `./init.sh` exit 0 with 8/8. The
per-component variant/story/test table matches the files. The two disclosed
implementation notes (the `biome-ignore` comments on the two anchors, and
`LinkArrow` dropping its `<style>` block in favour of utilities) are accurate
and are improvements, not defects.

The summary is also honest about what it could **not** do, which is the reason
it can be trusted on the rest.

---

## Open items — none blocking, all for the leader before `done`

1. **`plan.md` Complexity Tracking has no row for deviation 2.** The table
   still lists `vitest.config.ts` as the single file outside `app/shared/ui/`,
   and the Article VIII gate still reads "no new dependency or build tool
   added". The Constitution's Compliance Review requires a violation to be
   justified *in that table*. The justification exists and is excellent — it is
   just recorded in `impl_primitive_ui_layer.md` and `rules.md` § R19 instead.
   Add the row. Consequently SC-011 ("files modified outside `app/shared/ui/`,
   the test configuration and the spec directory: zero") is literally unmet:
   `.storybook/main.ts`, `package.json`, `pnpm-lock.yaml` and
   `docs/business/rules.md` were also touched. Approved because the cause was a
   proven toolchain blocker, not scope creep.
2. **T015 / T034 are checked `[x]` but the human-visual pass was not
   performed** — the implementer disclosed this. Structural verification is
   CONFIRMED (9 entries, 39 stories, clean build, every relied-on utility
   present in the emitted CSS, and `.storybook/preview.ts` does define the
   `ink`/`bone` backgrounds and the 390/1440 viewports). The visual pass itself
   is **UNVERIFIED** — no browser was available to this review either. A human
   should open the catalogue once before feature 3 composes these.
3. **`current.md` is stale** (C2) and **`history.md` lacks this session's
   entry** (C6).
4. **R18's wording** should be narrowed to the site build (deviation 1 above).

Carried-forward assumptions A-02 (LED on touch, `decisions-open.md` #8, owner
Clau), A-07 (focus geometry, still UNVERIFIED — and the implementer's note that
Chrome's `outline-style: auto` may not honour `outline-red-400` is a real
observation worth Clau's attention) and A-11 (font binaries missing) were
correctly carried forward, not re-decided.
