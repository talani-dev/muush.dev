# Quickstart: Primitive UI layer

**Feature**: `specs/002-primitive-ui-layer` | **Date**: 2026-09-06

How to build, verify and hand off this feature. Every command runs from the
repository root.

## 1 · Order of work

1. `src/styles/global.css` — append tokens (nothing existing is edited).
2. `tsconfig.json` — add the `@/assets/*` path alias (1 line).
3. `src/assets/social/` — normalize the three glyphs + README.
4. `src/components/` — the eight `.astro` files, dependency order:
   Radar → Wordmark → GlassPanel → LinkArrow → SocialIcon → Pill (needs Radar)
   → Lockup (needs Wordmark) → BotonPrimario.

Tokens first: every component below is unbuildable without them, and building
a component "temporarily" with a literal is how Article IV violations get
committed.

## 2 · Verifying the fluid scale without a page

The components are not mounted anywhere (FR-038), so verification uses a
throwaway route that is **deleted before commit**:

```bash
pnpm dev
# create src/pages/__scratch.astro, render each token/component,
# inspect at 390 and 1440 in devtools, then DELETE the file
git status --short   # must show no src/pages/ entry
```

Endpoint checks that matter most (from `research.md` § R2):

| At 390px wide | At 1440px wide |
|---|---|
| `text-display` → 46px | → 98px |
| `text-pill` → 12px | → 13px |
| `text-service-brief` → 14px (unchanged) | → 14px |
| `--spacing-page` → 24px | → 80px |
| `--spacing-isotipo` → 40px | → 52px |

Astro's dev toolbar and browser devtools are enough — no Playwright, no
Storybook (Article VII).

## 3 · Verifying the LED border

1. Hover the button on a pointer device → ring rotates, one turn per 2.6s.
2. Move the pointer away → rotation stops.
3. macOS: System Settings → Accessibility → Display → Reduce motion, or
   devtools → Rendering → *Emulate CSS prefers-reduced-motion* → the ring is a
   flat red-400 border and does not move.
4. Devtools → disable JavaScript → reload → hover behaviour is identical.
5. Devtools → toggle device emulation (touch) → the ring stays static (spec
   A-02).

Confirm the gradient stops read `--color-red-400` → `--color-bone-100` →
`--color-red-400` in the computed styles. If `--wine-` appears anywhere in the
button, the wrong document was followed — see design-extract § 11.

## 4 · Verifying the social glyphs

```bash
# no white left, no leftover metadata, one shared viewBox
grep -riE '#fff|#ffffff|<style|<defs|DOCTYPE|serif:|class=' src/assets/social/
# expect: no matches

grep -c 'viewBox="0 0 24 24"' src/assets/social/*.svg
# expect: 1 for each of the three files
```

Then render all three side by side and confirm they read at the same optical
weight and that all three adopt the container's colour when it is set to
`bone-100`.

## 5 · The Article IV gate

The hard gate of this feature. No colour or size literal may survive in
component markup:

```bash
# hex literals
grep -rInE '#[0-9a-fA-F]{3,8}\b' src/components/
# arbitrary Tailwind values and raw px/rem
grep -rInE '\[[0-9]+(px|rem|%)|[0-9]+px' src/components/
```

Both must return nothing. (`src/assets/**.svg` is exempt — those are assets,
not markup, exactly as feature 001 established.)

Also confirm the boundary held:

```bash
git status --short
# expect changes only under:
#   src/styles/global.css
#   src/components/
#   src/assets/social/
#   tsconfig.json
#   specs/002-primitive-ui-layer/
# and NOTHING under src/pages/, src/layouts/, src/islands/, src/i18n/
```

## 6 · Acceptance gate

```bash
pnpm check && pnpm typecheck && pnpm test && pnpm build
```

All four must exit zero (FR-039). Notes:

- `pnpm check` is Biome with `--error-on-warnings`; it formats CSS and
  `.astro`, and its `lineWidth` is 80, so long `clamp()` declarations will be
  wrapped — run `pnpm check:fix` before committing rather than hand-wrapping.
- `pnpm typecheck` is `astro check`; it type-checks the `Props` interfaces and
  the `*.svg` component imports.
- `pnpm test` runs the existing `tests/i18n-utils.test.ts` unchanged. This
  feature adds no test: the only candidate logic (the isotipo stroke-width
  formula) turned out to be handled by SVG viewBox scaling and does not exist
  as code — see `research.md` § R6.
- `pnpm build` must produce no JS chunk attributable to these components.

## 7 · Handoff

Later features consume this layer through `contracts/components.md`. The first
consumer (nav / hero) should need **zero** new tokens; if it does need one,
that is a signal the design grew, not that this scale was wrong — add it to
`global.css`, never inline it in the component.
