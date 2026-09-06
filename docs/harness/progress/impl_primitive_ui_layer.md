# Implementation summary: primitive_ui_layer (feature 002)

**Status after this work**: implementation complete, ready for review (leader
to move `feature_list.json` status to `reviewing`).

All 41 tasks in `specs/002-primitive-ui-layer/tasks.md` are checked off.
`./init.sh` exits 0.

## What changed

### Phase 1 — Setup (T001)

- `tsconfig.json`: added `"@/assets/*": ["src/assets/*"]` to
  `compilerOptions.paths`, above the existing six aliases (untouched). This
  is Article VI compliance, not an exception: without it Lockup and
  SocialIcon would need a boundary-crossing relative import.

### Phase 2 — Tokens (T002–T007, `src/styles/global.css`)

Appended only. `git diff --stat` on the file reports **231 insertions, 0
deletions**, so every feature-001 ramp, font token and `@font-face` block is
byte-identical (FR-008).

- `:root`: `--dark-glass: #1c1416` (warm near-black of the dark glass
  surfaces, explicitly not `--ink-500`; `rules.md` § R1) and
  `--stroke-led: 0.09375rem` (the 1.5 LED band).
- `@theme inline`: 13 `--color-glass-*` / `--color-radar-*` tokens, each a
  `color-mix(in srgb, <ramp token> <alpha>%, transparent)` so the 8-digit
  hexes of the design keep pointing at the brand ramp.
- `@theme inline`: 22 type roles, each with size + `--line-height` +
  `--letter-spacing` + `--font-weight`, so one class carries the whole role.
- `@theme inline`: 19 `--spacing-*`, 4 `--radius-*`, 3 `--blur-*` surface
  tokens.
- Document level: `@property --led-angle` and `@keyframes led-spin`.
- **Zero `@media` rules in the file** (`grep -c "@media" src/styles/global.css`
  → 0), so no sizing breakpoint exists anywhere in this layer (SC-002).

### Phase 3 — Fluid scale verified (T008–T010)

Every `clamp()` in the file was evaluated symbolically at a 390px and a
1440px viewport (rem = 16px). All 44 fluid tokens land on their
design-extract endpoint within **0.01px** — well inside SC-001's 1px
tolerance. Spot values: `display` 46.00 / 98.00 · `h1` 38.00 / 74.00 ·
`pill` 12.00 / 13.00 · `meta` 11.50 / 12.50 · `--spacing-page` 24 / 80 ·
`--spacing-isotipo` 40 / 52 · `--radius-panel` 18 / 22 · `--blur-glass-red`
20 / 22. Fixed roles (`service-brief`, `form-label`, `input-value`,
`button-sm`, `link`) are single `rem` values, not degenerate clamps.

### Phases 4–9 — The eight components (T011–T035)

All eight are static `.astro` in `src/components/`, prop signatures exactly
as `contracts/components.md` defines them (including the exported variant
types). Verified in the built HTML from a throwaway route:

- **GlassPanel** — 6 variants × 3 padding modes, `as` renders
  `div`/`article`/`section`/`aside`, `class` merges, slot unconstrained.
- **Radar** — 3 sizes, three rings stacked in one grid cell so they are
  exactly concentric, `aria-hidden="true"`.
- **Wordmark** — `full` / `short`. The three runs sit in an
  `inline-flex` with no gap, which also makes the markup immune to
  formatter-inserted whitespace; rendered output is
  `<span>muush</span><span class="text-red-400">.</span><span>dev</span>`.
- **Lockup** — isotipo (`on-ink`) + Wordmark, `gap-lockup-gap`. Only the
  isotipo width is set; no `strokeWidth` prop and no `src/utils/` helper.
- **Pill** — composes `<Radar size="sm" />` + caller label, `rounded-full`.
- **BotonPrimario** — `<a>` when `href` is set, otherwise
  `<button type>` (`submit` defaults to `type="submit"`), 3 size variants.
- **LinkArrow** — 2 sizes, arrow appended by the component, never a box.
- **SocialIcon** — 48 glass square, glyph inheriting `bone-100`.

Dependency graph is exactly what FR-013 permits: Pill → Radar,
Lockup → Wordmark + isotipo asset, SocialIcon → the three glyph assets. No
other component imports another.

### Social glyphs (T030–T033, `src/assets/social/`)

Three normalized SVGs plus a README recording source, original viewBox,
transform applied and what was stripped, per file. All three declare
`viewBox="0 0 24 24"`, carry a `<title>`, use `fill="currentColor"` only,
and contain no `<style>`, `<defs>`, DOCTYPE, prolog, tool metadata or
`class` attribute. TikTok's four nested `<g transform>` levels were
collapsed into one wrapper plus one matrix per path; its optical centring
was verified against the transformed path extents (x lands in
`[1.53, 22.45]`, y in `[0, 24]`).

## The three leader rulings, as implemented

1. **LED on touch devices** — `@media (hover: hover)` gates the rotation, so
   a touch device shows the same static ring as the reduced-motion and no-JS
   fallbacks. Reversal is deleting one media query.
2. **`@/assets/*` alias** — added, one line, existing aliases untouched.
3. **Isotipo stroke width** — the formula is *not* replicated. Lockup sets
   `w-isotipo` and `h-auto` and lets the viewBox scale the stroke, which
   reproduces 8.851 at width 52 and 6.809 at width 40.

## Verification

- `pnpm check` (Biome, `--error-on-warnings`) — pass.
- `pnpm typecheck` (`astro check`) — 0 errors, 0 warnings, 0 hints.
- `pnpm test` (Vitest) — existing suite passes unmodified (1 file, 5 tests).
  No new test: the one candidate for non-trivial logic (the stroke-width
  formula) does not exist as code, per `research.md` § R6 and Article VII.
- `pnpm build` — passes. **No page emits a `<script>` tag** and no page
  references the Svelte client bundle (`grep -l "client.svelte" dist -r` →
  nothing), so SC-005 holds.
- `./init.sh` — exit code 0.
- **Article IV gate**: `grep -rInE '#[0-9a-fA-F]{3,8}\b' src/components/` and
  `grep -rInE '\[[0-9]+(px|rem|%)|[0-9]+px' src/components/` both return
  nothing.
- **Article II gate**: `grep -rInE '<script|client:|islands/' src/components/`
  returns nothing.
- **Asset gate**: `grep -riE '#fff|#ffffff|<style|<defs|DOCTYPE|serif:|class='
  src/assets/social/` returns nothing; all three files declare
  `viewBox="0 0 24 24"`.
- **Glass gate (SC-003)**: the built stylesheet was read back and all 30
  checks (6 variants × fill / border / blur / radius / padding) match the
  `design-extract.md` § 1 row.
- **LED gate**: the emitted rule is
  `conic-gradient(from var(--led-angle), var(--red-400) 0%, var(--bone-100) 50%, var(--red-400) 100%)`
  with `mask-composite: exclude`, `@media (hover:hover)` for the 2.6s linear
  rotation and `@media (prefers-reduced-motion: reduce)` collapsing it to a
  flat `var(--red-400)` ring. `--wine-` appears nowhere in the page.
- **Style-bleed gate (SC-007)**: a page carrying a `.cls-1` element plus all
  three inlined glyphs produced no `.cls-1` rule in the output.

The verification route (`src/pages/scratch-002.astro`) was deleted (T036);
`git status --short` shows nothing under `src/pages/`.

## Deviations and judgement calls the reviewer should look at

1. **Nine radar tokens beyond the 19 the task list enumerates.** T005 lists
   no radar geometry, but Radar needs three diameters per size and FR-030
   forbids a size literal in markup. `--spacing-radar-{sm,md,alt}` +
   `-halo` + `-core` were added to `global.css`, exactly the values in
   `design-extract.md` § 2. This is the option `research.md` § R7 already
   anticipated ("sized from three tokens per variant").
2. **TikTok's fill rule is `nonzero`, not the `evenodd` T032 asks for.** In
   the source, the root `style="fill-rule:evenodd"` is overridden by
   `fill-rule:nonzero` on every path, so `nonzero` is what the vendor art
   actually renders with. It is moot either way — each of the four paths is
   a single subpath — but the source's own value was preserved rather than
   silently changed. Recorded in `src/assets/social/README.md` too.
3. **GlassPanel annotates its destructuring target (`}: Props =
   Astro.props`).** A `Props` interface that declares an `as` member is read
   by Astro's TSX transform as the polymorphic-component signature, which
   leaves `Astro.props` untyped inside the component and produced three
   `ts(7053)` errors. Callers are still checked against `Props` (verified
   with a deliberate bad prop). No `any`, no `@ts-expect-error`.
4. **One Biome suppression in LinkArrow.** `lint/a11y/useAnchorContent`
   cannot see through an Astro `<slot />`, so *any* slot-labelled anchor
   fails it. The suppression is the HTML-comment form because neither the
   JSX-expression form nor a frontmatter comment is recognised — which means
   the comment does appear in the rendered HTML. The alternative was turning
   the slot into a `label` prop, which would break the published contract.
5. **`black` appears in LinkArrow's / BotonPrimario's mask gradients.** It is
   a mask, not a surface: only its alpha channel is read, and it carries no
   design meaning. Flagged so it is not mistaken for a colour literal.

## Files touched

- `tsconfig.json` (1 line added)
- `src/styles/global.css` (append-only, 231 lines)
- `src/components/GlassPanel.astro`, `Radar.astro`, `Wordmark.astro`,
  `Lockup.astro`, `Pill.astro`, `BotonPrimario.astro`, `LinkArrow.astro`,
  `SocialIcon.astro` (new)
- `src/assets/social/linkedin.svg`, `instagram.svg`, `tiktok.svg`,
  `README.md` (new)
- `specs/002-primitive-ui-layer/tasks.md` (T001–T041 checked off)
- `docs/harness/progress/impl_primitive_ui_layer.md` (this file)

Nothing under `src/pages/`, `src/layouts/`, `src/islands/`, `src/i18n/`,
`src/utils/`, `src/types/`, `tests/`, `astro.config.mjs`, `package.json` or
`biome.json` was created or modified. The other entries in `git status`
(`.claude/agents/*`, `.specify/feature.json`, `docs/business/*`,
`docs/harness/progress/current.md`, `feature_list.json`) were already
modified before this task started and were not touched here.
