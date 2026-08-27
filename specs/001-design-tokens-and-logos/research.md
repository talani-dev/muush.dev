# Phase 0 Research: Design tokens and logo assets

**Feature**: `001-design-tokens-and-logos` | **Spec**: [spec.md](./spec.md)

All items below were resolved during pre-load context gathering (constitution,
`docs/business/branding.md`, `src/styles/global.css`, and direct inspection of
the three source SVG files and the project's Biome/tsconfig configuration).
None required `[NEEDS CLARIFICATION]` in spec.md.

## 1. Token replacement mechanics

- **Decision**: Replace the `:root` block's four 10-step (50–900) ramps with
  4 five-step (100–500) ramps using the exact hex values from
  `docs/business/branding.md`, and shrink the corresponding `@theme inline`
  `--color-<ramp>-<step>` mappings from 10 to 5 entries per ramp. Keep the
  file's existing three-part structure (`@import "tailwindcss"` →
  `:root { ... }` custom properties → `@theme inline { ... }` Tailwind
  exposure) unchanged. Leave `--font-poppins`, `--font-instrument`, and all
  four `@font-face` blocks untouched.
- **Rationale**: This is exactly the "branding book replaces the placeholder"
  event Article IV (Design Tokens Discipline) anticipates: "only
  `src/styles/global.css` changes." A grep across `src/` confirmed zero
  components currently reference any color token (`bone-`, `ink-`, `red-`,
  `wine-` do not appear anywhere outside `global.css` itself), so shrinking
  10 steps to 5 is non-breaking today. The typography tokens were verified
  against `docs/business/branding.md`'s typography table and already match
  (Poppins reserved for logo/wordmark, Instrument Sans as the default) — no
  change needed there.
- **Alternatives considered**:
  - *Keep a 10-step ramp and just refill unused steps with interpolated
    values*: rejected — `docs/business/branding.md` is explicit that "solo
    hay 5 tokens por rampa (100–500), no la escala 50–950" and that adopting
    the real system means the Tailwind scale "debe ajustarse a 5 pasos, no
    10." Inventing interpolated steps would silently reintroduce
    placeholder values under the guise of "real" tokens.
  - *Rename ramps or restructure the file's pattern (e.g. move to a
    JS/TS token file)*: rejected — no requirement calls for it, and Article
    IX (no over-engineering) rules out restructuring a file that already
    works, especially given zero consumers exist yet to justify a bigger
    rewrite.

## 2. Asset organization: `public/` vs `src/`

- **Decision**: Place the three isotipo SVGs under a new `src/assets/logo/`
  directory (source-controlled, not `public/`).
- **Rationale**: `public/` in this project today holds files meant to be
  referenced by a stable, predictable root URL regardless of any build step
  (`favicon.ico`, `favicon.svg`, `fonts/*.woff2` referenced via relative
  `url()` in CSS). The isotipo variants are not consumed that way — per
  spec FR-006, they exist to be picked by *code* based on a background
  context (a future header/footer/About-page component choosing the right
  variant), which is an import-time, not request-time, concern. Keeping
  them under `src/` lets a future consuming component `import` the exact
  file it needs (enabling Vite-level fingerprinting/optimization later) and
  keeps brand-asset source material colocated with the rest of the
  project's source tree rather than mixed into `public/`'s narrower,
  currently font/favicon-only role.
- **Alternatives considered**:
  - *`public/logo/*.svg`*: rejected for now — would work for a direct
    `<img src="/logo/...">`, but nothing in this feature or the current
    spec needs a stable public URL yet (no page places a logo instance),
    and mixing brand source assets into `public/` blurs the boundary this
    project has kept so far (only truly root-level static files live
    there).
  - *Both locations (duplicate the files)*: rejected — violates DRY
    (Article IX); two copies of the same three files would drift the
    moment one is regenerated and the other isn't.

## 3. "Pick the right variant per background" pattern: wrapper component or not

- **Decision**: This feature does **not** ship a wrapper `.astro` component.
  It ships the three SVG files with self-documenting names (see §4) plus a
  short colocated mapping document. The wrapper/selection component is
  deferred to the future feature that actually places the first logo
  instance on a page.
- **Rationale**: Spec FR-006 lists a wrapper as only one of three acceptable
  ways to make the mapping discoverable ("via naming, code comments, or a
  wrapper... the exact mechanism is a planning decision, not a
  specification requirement") — it is not mandated. Building a component
  today, with zero real consumers, means guessing its API (does it need a
  `size` prop? a `class` passthrough? does it render inline `<svg>` markup
  or an `<img>`? does a future favicon-generation script need a different
  entry point than a header component would?) before any of those
  constraints are known. Article IX explicitly rules out "speculative
  abstractions" and "infrastructure... added ahead of an actual need." The
  self-documenting file names plus a short mapping doc fully satisfy FR-005
  and FR-006 today, without foreclosing what shape the eventual wrapper
  takes once a real page needs it. If a wrapper is later added, Article II
  already constrains its shape: it must be a `.astro` presentational
  component with zero client-side JS (selecting a variant by a `background`
  prop is pure build-time logic, never Svelte-island territory).
- **Alternatives considered**:
  - *Ship an `Isotipo.astro` component now with a `background` prop*:
    rejected per Article IX reasoning above — no consumer exists to
    validate the API shape, and FR-007 explicitly forbids this feature from
    placing any logo instance on a live page, which is the only way to
    prove a wrapper's API is right.
  - *Ship a plain TS constant/map (e.g. `src/utils/logoVariants.ts`
    exporting `{ bone: ..., ink: ..., red: ... }`) without a component*:
    considered as a middle ground, but rejected for the same reason as the
    component — it's still code committing to an API/import shape (what do
    the values resolve to — a URL string? a raw SVG string? an Astro
    `ImageMetadata`?) before a real consumer exists to dictate it. A plain
    markdown mapping document carries the same information with zero
    premature commitment.

## 4. Naming convention for the in-project SVG copies

- **Decision**: Rename the in-project copies to a background-context-first
  convention: `isotipo-on-bone.svg`, `isotipo-on-ink.svg`,
  `isotipo-on-red.svg` — replacing the source file names `muush-dark.svg`,
  `muush-light.svg`, `muush-triple-white.svg` respectively.
- **Rationale**: The source names are a naming-inversion trap for anyone
  who hasn't just read `docs/business/branding.md`: `muush-dark.svg` sounds
  like "the dark-colored variant" but per branding.md it is the variant
  used *on light/bone backgrounds* (it has the dark ink-colored stroke,
  which reads as "dark" from the file's own perspective, not the
  background's). `muush-light.svg` has the same inversion risk in reverse.
  This is precisely what Article IX (Clean Code Discipline — "no generic
  names," "express intent, not implementation details") flags: the source
  names express the mark's own fill/stroke lightness, not the thing a
  future developer actually needs to know (which background does this go
  on?). Renaming to background-context-first names makes FR-006's
  "discoverable... without needing to re-read `docs/business/branding.md`"
  true from the file name alone. `muush-triple-white.svg` → 
  `isotipo-on-red.svg` follows the same logic (the "triple-white" naming
  describes the fill/stroke choice, not the Red-400 background it's
  designed for).
- **Alternatives considered**:
  - *Keep source names as-is*: rejected — this is exactly the ambiguity
    FR-006 exists to eliminate, and it would leave the project relying on
    developers remembering (or re-deriving from branding.md) that "dark"
    means "for light backgrounds."
  - *Keep source names but add a suffix (e.g. `muush-dark-on-bone.svg`)*:
    rejected as unnecessarily verbose — the background-context-first name
    alone is sufficient and shorter; the original source names are recorded
    in the mapping document (§ below) for traceability back to
    `docs/business/branding.md`, so no information is lost.

## 5. Verification/testing scope

- **Decision**: No new test file is added by this feature. `pnpm test`
  passing means the existing Vitest suite continues to pass unmodified
  (regression-free ramp-size change). `pnpm check` (Biome) and `pnpm
  typecheck` (`astro check`) are confirmed to have nothing new to process:
  Biome's configured scope (`biome.json`'s `files.includes`) has no parser
  for `.svg` and does not format Markdown in the version pinned by this
  project, so the new `src/assets/logo/*.svg` files and their colocated
  mapping document add no new lint/format surface; `astro check` only
  type-checks `.astro`/`.ts` files, none of which are added by this
  feature.
- **Rationale**: Article VII (Testing Discipline) mandates unit tests only
  for "non-trivial logic in `src/i18n/` or `src/utils/`." This feature adds
  zero logic anywhere — it is a CSS value/count edit plus three renamed,
  color-unchanged static asset files. Adding a Vitest test that parses the
  SVGs as XML and asserts their shared `viewBox`/geometry would be testing
  a static fact about files that don't change at runtime and that this
  feature's own acceptance criteria (FR-004: "without altering their
  geometry... or stroke properties") already commit to preserving via a
  literal copy, not a transformation. That is exactly the kind of test
  infrastructure Article IX says not to add "ahead of an actual need" — it
  would start being valuable the day something *transforms* these SVGs
  (e.g. an optimization/minification build step), which is not part of
  this feature.
- **Alternatives considered**:
  - *Add a Vitest geometry-parsing sanity test now*: rejected per Article
    IX reasoning above; revisit if/when a future feature introduces an SVG
    build-time transform (e.g. `astro-icon`, `svgo`) that could silently
    corrupt geometry.
