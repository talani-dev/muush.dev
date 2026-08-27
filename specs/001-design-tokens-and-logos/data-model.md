# Phase 1 Data Model: Design tokens and logo assets

**Feature**: `001-design-tokens-and-logos` | **Spec**: [spec.md](./spec.md)

This feature has no runtime data model (no database, no API payloads, no
user input). The "entities" below are the two structural design-time
artifacts this feature produces, documented for traceability back to
`docs/business/branding.md` and to the spec's Key Entities section.

## Entity: Color Ramp

A named brand color family exposed as both a CSS custom property scale and
a Tailwind utility class scale.

| Field | Description |
|---|---|
| `name` | One of `red`, `wine`, `ink`, `bone` |
| `steps` | Exactly 5 ordered steps: `100`, `200`, `300`, `400`, `500` |
| `baseStep` | The documented "main" shade of the ramp (see table below) — not a separate field in CSS, just the step a future component should reach for by default |
| `hex` | The exact hex value per step, from `docs/business/branding.md` |

### Values (source of truth: `docs/business/branding.md`)

| Ramp | 100 | 200 | 300 | 400 (base unless noted) | 500 |
|---|---|---|---|---|---|
| `red` | `#FAD9DE` | `#F0A3AE` | `#E36B7C` | `#CF3147` **(base)** | `#9E2436` |
| `wine` | `#E9D3D7` | `#C08A94` | `#8A4552` | `#591F28` **(base)** | `#3B141B` |
| `ink` | `#D9D9D9` | `#A6A6A6` | `#737373` | `#404040` | `#262626` **(base)** |
| `bone` | `#FBF8F6` | `#F2EBE7` **(base)** | `#E0D3CC` | `#C7B4A9` | `#A38D80` |

Note the base step is not always `400` — `ink` bases at `500` and `bone`
bases at `200`, matching `docs/business/branding.md`'s bolded values.
`src/styles/global.css` does not need a separate "base" marker token; this
table exists so a future component author picks the right default step
without re-deriving it from the branding doc.

### Validation rules

- Every ramp MUST have exactly 5 steps (100–500) — no 50, no 600+.
- Every hex value MUST exactly match `docs/business/branding.md` (case of
  the hex digits is not semantically meaningful but should stay lowercase
  in CSS to match the file's existing style).
- Every `:root` custom property MUST have a corresponding `@theme inline`
  `--color-<ramp>-<step>` entry — no orphaned custom property, no
  `@theme inline` entry without a backing custom property.

## Entity: Isotipo Variant Asset

One of exactly three SVG files representing the muush isotipo (lockup C —
isotipo only, no wordmark), each tied to exactly one background context.

| Field | Description |
|---|---|
| `backgroundContext` | One of `bone` (light background), `ink` (dark, Ink 500 background), `red` (Red 400 background, or the red third of gradient B) |
| `fileName` | In-project file name (see mapping table) |
| `sourceFileName` | Original file name at the external source path documented in `docs/business/branding.md` |
| `strokeColor` | Hex value of the isotipo's stroke |
| `dotColor` | Hex value of the isotipo's circle/dot fill |
| `geometry` | Shared, unchanged across all three: `viewBox="14.5 38.5 70.5 39.5"`, `circle cx="21" cy="45" r="6.5"`, `path d="M21 72 a17 17 0 0 1 34 0 a12 12 0 0 1 24 0"`, `stroke-width="12"`, `stroke-linecap="round"` |

### Mapping table (the FR-005 / FR-006 discoverable mapping)

| Background context | In-project file | Source file | Stroke | Dot |
|---|---|---|---|---|
| Bone / light background | `isotipo-on-bone.svg` | `muush-dark.svg` | Ink 500 `#262626` | Red 400 `#CF3147` |
| Ink 500 / dark background | `isotipo-on-ink.svg` | `muush-light.svg` | Bone 100 `#FBF8F6` | Red 400 `#CF3147` |
| Red 400 background, or red third of gradient B | `isotipo-on-red.svg` | `muush-triple-white.svg` | Bone 100 `#FBF8F6` | Bone 100 `#FBF8F6` (never red-on-red) |

### Validation rules

- All three files MUST share the identical `viewBox`, `circle`, and `path`
  geometry — only `fill`/`stroke` color attributes may differ between them.
- Each file MUST be traceable to exactly one background context via its
  file name and the mapping table above (colocated with the assets in
  `src/assets/logo/`).
- No wordmark, lockup A (horizontal), or lockup B (stacked) asset is part
  of this entity — those files do not exist at the source path and are out
  of scope (FR-008).
