# Quickstart: Design tokens and logo assets

**Feature**: `001-design-tokens-and-logos` | **Spec**: [spec.md](./spec.md)

This feature has no page to visit — it's a token/asset infrastructure
change. This quickstart is how a developer (or reviewer) verifies the
feature is correctly in place after implementation.

## Verify the color tokens

1. Open `src/styles/global.css` and confirm the `:root` block defines
   exactly 5 steps (100–500) for each of `--red-*`, `--wine-*`, `--ink-*`,
   `--bone-*`, matching the hex table in `data-model.md`.
2. Confirm the `@theme inline` block has a matching
   `--color-<ramp>-<step>` entry for each of the 20 values (4 ramps × 5
   steps) — no more, no fewer.
3. Run `pnpm build` and confirm a throwaway utility class (e.g. add
   `bg-red-400` to any element temporarily) compiles to `#CF3147` in the
   built CSS output, then remove the temporary class.
4. Confirm `--font-poppins` and `--font-instrument` are unchanged, and all
   four `@font-face` blocks are unchanged.

## Verify the logo assets

1. Confirm `src/assets/logo/` contains exactly three files:
   `isotipo-on-bone.svg`, `isotipo-on-ink.svg`, `isotipo-on-red.svg`.
2. Confirm each file's stroke/dot colors match the mapping table in
   `data-model.md`, and that all three share the identical `viewBox`,
   `circle`, and `path` geometry (diff them if unsure — only color
   attributes should differ).
3. Confirm the colocated mapping documentation (e.g.
   `src/assets/logo/README.md`) states, in one place, which file goes on
   which background context, without needing to open
   `docs/business/branding.md`.
4. Confirm no `.astro`/`.svelte` component was added by this feature (that
   is deliberately deferred — see `research.md` § 3) and that no page or
   layout was modified.

## Full verification suite

```sh
pnpm check       # Biome lint/format
pnpm typecheck   # astro check
pnpm test        # Vitest — existing suite only, no new tests expected
pnpm build       # Astro static build
```

All four MUST pass with no changes required outside
`src/styles/global.css` and the new `src/assets/logo/` directory.
