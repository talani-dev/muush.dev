# Implementation summary: design_tokens_and_logos (feature 001)

**Status after this work**: implementation complete, ready for review (leader
to move `feature_list.json` status to `reviewing`).

## What changed

### User Story 1 + 2 — Color ramps and typography (`src/styles/global.css`)

- Replaced the placeholder 10-step (50–900) `--red-*`, `--wine-*`, `--ink-*`,
  `--bone-*` ramps with the real 5-step (100–500) branding-book values from
  `docs/business/branding.md` / `data-model.md`.
- Shrunk the `@theme inline` block's `--color-<ramp>-<step>` mappings to
  match (20 entries total: 4 ramps × 5 steps), preserving the file's
  existing `@import "tailwindcss"` → `:root` → `@theme inline` structure.
- `grep -rEn "bone-(50|600|700|800|900)|ink-(50|600|700|800|900)|red-(50|600|700|800|900)|wine-(50|600|700|800|900)" src/`
  confirmed zero matches outside `global.css` itself (matches found inside
  it are false positives — "50" substring-matching within "500" — not
  removed steps).
- Verified `--font-poppins`, `--font-instrument`, and all four `@font-face`
  blocks (Poppins/Instrument Sans, Regular/Bold) are unchanged — they
  already matched the branding book and required no edit.

### User Story 3 — Logo assets (`src/assets/logo/`)

- Confirmed the three source SVGs at
  `/Users/betonajera/Library/Mobile Documents/com~apple~CloudDocs/Pictures/Icons/Muush/`
  (`muush-dark.svg`, `muush-light.svg`, `muush-triple-white.svg`) still
  match the documented geometry (`viewBox="14.5 38.5 70.5 39.5"`,
  `circle cx=21 cy=45 r=6.5`, `path d="M21 72 a17 17 0 0 1 34 0 a12 12 0 0 1 24 0"`,
  `stroke-width=12`, `stroke-linecap=round`).
- Created `src/assets/logo/` and copied the three files in, renamed to
  background-context-first names:
  - `isotipo-on-bone.svg` (from `muush-dark.svg`) — stroke Ink 500
    `#262626`, dot Red 400 `#CF3147`
  - `isotipo-on-ink.svg` (from `muush-light.svg`) — stroke Bone 100
    `#FBF8F6`, dot Red 400 `#CF3147`
  - `isotipo-on-red.svg` (from `muush-triple-white.svg`) — stroke + dot
    Bone 100 `#FBF8F6` (never red-on-red)
- Created `src/assets/logo/README.md` with the background-context →
  file/source/stroke/dot mapping table, so the mapping is discoverable
  without re-reading `docs/business/branding.md`.
- Diffed all three files: `viewBox`, `circle`, and `path` elements are
  byte-identical across all three; only `fill`/`stroke` color attributes
  (and the descriptive `<title>`) differ.

### Explicitly out of scope (per spec FR-007/FR-008, plan.md, research.md § 3)

- No wrapper `.astro` component, page, header, footer, favicon, or any
  logo instance was added.
- No wordmark or lockup A/B asset was added — only the three isotipo-only
  (lockup C) variants.

## Verification

- `pnpm check` (Biome) — pass, no new findings.
- `pnpm typecheck` (`astro check`) — pass, 0 errors/warnings/hints.
- `pnpm test` (Vitest) — existing suite passes unmodified (1 file, 5 tests).
  No new test files added: this feature has no non-trivial logic in
  `src/i18n/` or `src/utils/` (Article VII / research.md § 5).
- `pnpm build` — static build succeeds. Spot-checked the built CSS
  (`dist/_astro/BaseLayout.*.css`) and confirmed `#cf3147` is present after
  temporarily adding `bg-red-400` to `src/pages/es/index.astro`, then
  reverted that page to its original content (no page/component left
  modified).
- `./init.sh` — exit code 0.
- Walked through `quickstart.md` end-to-end — every verification step
  passes.

## Files touched

- `src/styles/global.css` (edited)
- `src/assets/logo/isotipo-on-bone.svg` (new)
- `src/assets/logo/isotipo-on-ink.svg` (new)
- `src/assets/logo/isotipo-on-red.svg` (new)
- `src/assets/logo/README.md` (new)
- `specs/001-design-tokens-and-logos/tasks.md` (T001–T019 checked off)

No other file was modified. `src/pages/es/index.astro` was touched
temporarily for the build spot-check (T018) and reverted to its original
state before finishing.
