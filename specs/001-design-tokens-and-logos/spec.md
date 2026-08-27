# Feature Specification: Design tokens and logo assets

**Feature Branch**: `001-design-tokens-and-logos`
**Created**: 2026-08-27
**Status**: Draft
**Input**: User description: "Replace the placeholder color and typography tokens in src/styles/global.css with the real values from the muush branding book (documented in docs/business/branding.md), and wire the three official isotipo SVG variants into the project as usable assets, mapped for the three background contexts the branding rules define (light/bone background, dark/ink background, on Red 400)."

## User Scenarios & Testing *(mandatory)*

<!--
  This is a foundational design-system infrastructure feature, not an
  end-user-facing feature. There is no visitor-facing UI to test yet — the
  "users" of this feature are the developers (Roberto) who will build
  future landing/Nosotros components on top of these tokens and assets.
  User stories are framed from that consumer perspective, which is the
  correct and only audience until a future feature places these tokens and
  assets into real page markup.
-->

### User Story 1 - Build UI with the real brand color ramps (Priority: P1)

As the developer building any future component, I need `src/styles/global.css`
to expose the actual muush brand color ramps (red, wine, ink, bone) as
Tailwind utility classes, so that any component I write from this point
forward uses real brand colors automatically, without needing to know or
paste a hex value.

**Why this priority**: Every other visual feature (landing sections, About
page, forms) depends on this. Building on top of placeholder colors and
then having to retrofit every component later would violate the project's
design-tokens discipline and waste implementation time twice.

**Independent Test**: Can be fully tested by inspecting `src/styles/global.css`
and confirming the `--red-*`, `--wine-*`, `--ink-*`, `--bone-*` custom
properties and their `@theme inline` counterparts resolve to the exact
branding-book hex values, then confirming a throwaway utility class (e.g.
`bg-red-400`) compiles to that value in a build. Delivers value on its own:
the token layer is correct even before any component consumes it.

**Acceptance Scenarios**:

1. **Given** `src/styles/global.css` currently defines placeholder 10-step
   ramps (50–900), **When** this feature is implemented, **Then** each of
   `--red-*`, `--wine-*`, `--ink-*`, `--bone-*` is redefined as a 5-step ramp
   (100–500) matching the exact hex values documented in
   `docs/business/branding.md`.
2. **Given** the new 5-step ramps exist as CSS custom properties, **When** the
   site is built, **Then** the `@theme inline` block surfaces each step as a
   Tailwind utility class (e.g. `bg-bone-200`, `text-ink-500`,
   `border-red-400`) usable by any future component.
3. **Given** the branding book defines a base/accent step per ramp (bone 200,
   ink 500, red 400, wine 400), **When** a future component needs the "main"
   shade of a ramp, **Then** that base step is present in the ramp and
   documented as the base, so no component needs to guess which step is
   the default.

---

### User Story 2 - Preserve the typography scoping rule (Priority: P2)

As the developer building any future component, I need the existing
`font-poppins` / `font-instrument` tokens in `src/styles/global.css` to keep
matching the branding book's rule (Poppins reserved for logo/wordmark use
only, Instrument Sans as the default for everything else), so that I never
have to reason about which typeface a new heading or body block should use
— the token name already tells me.

**Why this priority**: Lower priority than the color ramps because the
current tokens already comply with the branding book (verified during
research) — this story is about confirming and preserving correctness, not
introducing a change. It still needs to be verified explicitly so a future
contributor doesn't assume it's unverified placeholder content like the
colors were.

**Independent Test**: Can be tested independently by reading
`src/styles/global.css` and `docs/business/branding.md` side by side and
confirming the two font tokens and their `@font-face` declarations need no
change. Delivers value by leaving a verified, documented state instead of
an assumed one.

**Acceptance Scenarios**:

1. **Given** `docs/business/branding.md` reserves Poppins for logo/wordmark
   use only, **When** this feature is implemented, **Then**
   `src/styles/global.css` still exposes exactly two font tokens
   (`--font-poppins`, `--font-instrument`) with no new typeface added and no
   scope change to either token.
2. **Given** the existing `@font-face` declarations for Poppins and
   Instrument Sans (Regular/Bold weights), **When** this feature is
   implemented, **Then** those declarations are left unchanged, because they
   already match the branding book.

---

### User Story 3 - Pick the correct logo variant for a given background (Priority: P1)

As the developer of any future component that places the muush isotipo (a
header, a footer, a favicon, an About page hero), I need the three official
isotipo SVG variants available inside the project and clearly mapped to the
background context each one is designed for, so that I always render the
correct-contrast variant instead of guessing at colors or reconstructing
the mark by hand.

**Why this priority**: Equal priority to Story 1 — both are prerequisites
for any visual feature that follows. Without the assets being in the
project and correctly labeled, the first component that needs the logo
would have to source the SVGs and re-derive the background mapping from
`docs/business/branding.md` from scratch.

**Independent Test**: Can be fully tested by locating the three SVG assets
inside the project (not just on the source-of-truth external path) and
confirming each one is unambiguously labeled with the single background
context it is meant for, matching `docs/business/branding.md`'s mapping.
Delivers value on its own even with zero pages consuming it yet: the
asset layer is correct and ready to consume.

**Acceptance Scenarios**:

1. **Given** the three official isotipo SVGs today live only outside the
   project (`muush-dark.svg`, `muush-light.svg`, `muush-triple-white.svg`),
   **When** this feature is implemented, **Then** all three are present
   inside the project as project-tracked files.
2. **Given** the branding book maps each variant to exactly one background
   context (bone/light background → dark-stroke variant, ink-500/dark
   background → light-stroke variant, Red 400 background or the red third
   of gradient B → all-bone variant), **When** a future component needs a
   logo for a specific background, **Then** the mapping from background
   context to the correct variant is unambiguous and discoverable without
   re-reading `docs/business/branding.md`.
3. **Given** the three variants share identical geometry and differ only in
   fill/stroke colors, **When** this feature is implemented, **Then** no
   variant's geometry, viewBox, or stroke properties are altered from the
   source files.

### Edge Cases

- What happens if a future component needs the isotipo over a surface this
  feature doesn't map (e.g. a photograph, a glass panel, or gradient A —
  the unused reserve gradient)? Out of scope for this feature; the
  branding book only defines three documented background contexts for the
  isotipo, and `docs/business/branding.md` already flags that photography
  always needs "a contrast layer" as a separate, unresolved concern for
  whichever future feature places a logo over a photo.
- What happens to the two missing `.woff2` font files already flagged with
  a TODO in `src/styles/global.css`? Out of scope — this feature does not
  add, fetch, or generate font binaries; it only verifies the font *tokens*
  already match the branding book. The existing TODO comment about missing
  font files remains a separate, pre-existing gap this feature does not
  claim to close.
- What happens to any code that referenced a now-removed 10-step-only
  shade (e.g. `bone-600` through `bone-900`, `ink-600` through `ink-900`,
  etc.)? Verified during research: no component in the codebase references
  any token outside the 100–500 range today, so removing the unused steps
  breaks nothing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The color custom properties in `src/styles/global.css` MUST
  define exactly five steps (100, 200, 300, 400, 500) for each of `--red-*`,
  `--wine-*`, `--ink-*`, `--bone-*`, using the exact hex values documented
  in `docs/business/branding.md`, replacing the current placeholder
  50–900 ten-step scale.
- **FR-002**: The `@theme inline` block in `src/styles/global.css` MUST
  expose every one of the new 5-step color values as a Tailwind utility
  class (e.g. `bg-bone-100`...`bg-bone-500`, `text-ink-100`...`text-ink-500`,
  and equivalently for `red` and `wine`), following the same
  `--color-<ramp>-<step>: var(--<ramp>-<step>)` pattern already used in the
  file today.
- **FR-003**: The `--font-poppins` and `--font-instrument` custom properties
  in `@theme inline`, and their associated `@font-face` declarations, MUST
  remain unchanged, since they already match the branding book's rule that
  Poppins is scoped to logo/wordmark use only and Instrument Sans is the
  default for everything else.
- **FR-004**: The three official isotipo SVG files (light-background,
  dark-background, and Red-400-background variants) MUST be brought into
  the project as project-tracked asset files, sourced from the external
  path documented in `docs/business/branding.md`, without altering their
  geometry, `viewBox`, or stroke properties.
- **FR-005**: Each of the three isotipo variants MUST be identifiable, by
  file name or accompanying documentation, as belonging to exactly one of
  the three background contexts the branding book defines: light/bone
  background, dark/ink-500 background, or Red 400 background (including
  the red third of gradient B).
- **FR-006**: The mapping from background context to the correct isotipo
  variant MUST be discoverable by a future developer working in this
  project without needing to re-read `docs/business/branding.md` from
  scratch (e.g. via naming, code comments, or a wrapper that encodes the
  mapping — the exact mechanism is a planning decision, not a specification
  requirement).
- **FR-007**: This feature MUST NOT introduce any new page, page section,
  header, footer, favicon replacement, or other UI that places a logo
  instance on a live page — it stops at making the tokens and assets
  correctly available for future features to consume.
- **FR-008**: This feature MUST NOT add a wordmark asset, a horizontal
  lockup (lockup A), or a stacked lockup (lockup B) — only the three
  isotipo-only (lockup C) variants that exist as source files today are in
  scope.

### Key Entities

- **Color Ramp**: A named brand color family (`red`, `wine`, `ink`, `bone`),
  each with exactly 5 ordered steps (100–500) and one documented base/accent
  step, expressed as both a CSS custom property and a Tailwind utility
  class.
- **Isotipo Variant Asset**: One of exactly three SVG files representing the
  muush isotipo (lockup C), each tied to exactly one background context
  (light/bone, dark/ink-500, or Red 400) and sharing identical geometry
  with the other two variants — only fill/stroke colors differ between
  them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the color values defined in `docs/business/branding.md`
  for red, wine, ink, and bone (20 hex values total: 4 ramps × 5 steps) are
  present, correctly named, and exactly matching in `src/styles/global.css`.
- **SC-002**: A developer starting any future component can find and use a
  brand-accurate color utility class and the correct logo variant for a
  given background without opening `docs/business/branding.md` or the
  external SVG source folder.
- **SC-003**: Zero regressions: the full verification suite (`pnpm check`,
  `pnpm typecheck`, `pnpm test`, `pnpm build`) passes after the token and
  asset changes, with no existing page or component broken by the ramp
  step-count change (50–900 → 100–500).
- **SC-004**: All three isotipo variants are present in the project and
  each is traceable to exactly one background context, with zero ambiguity
  about which variant to use for bone, ink-500, or Red 400 backgrounds.

## Assumptions

- The branding book (`docs/business/branding.md`) is the sole source of
  truth for token values and asset mapping for this feature, superseding
  the placeholder values and the older "Claude Design" PDF/book mentioned
  as deprecated in that same document.
- No component in the current codebase depends on the placeholder 10-step
  ramp's unused steps (50, 600, 700, 800, 900) — confirmed by inspection;
  removing them is non-breaking.
- The three isotipo SVG source files at the external path in
  `docs/business/branding.md` are the final, approved versions for this
  feature — this feature copies/imports them, it does not redesign or
  re-export them.
- The missing `.woff2` font binary files (already flagged with a pre-existing
  TODO comment in `src/styles/global.css`) are a separate, unrelated gap and
  are not part of this feature's scope or acceptance criteria.
- Gradient B/A background treatments, glass/metal interface materials, and
  any open landing decisions tracked in `docs/business/landing/decisions-open.md`
  are unrelated to this feature and are not affected by it.
- "Available in the project" for the isotipo assets means committed as
  project-tracked files reachable by future build-time or run-time code;
  the specific directory/module organization is an implementation decision
  for the planning phase, not a specification-level requirement.
