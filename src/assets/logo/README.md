# Isotipo assets (lockup C — isotipo only)

Three official isotipo SVG variants, each designed for exactly one
background context. Source of truth: `docs/business/branding.md`.

## Background context → file mapping

| Background context | In-project file | Source file | Stroke | Dot |
|---|---|---|---|---|
| Bone / light background | `isotipo-on-bone.svg` | `muush-dark.svg` | Ink 500 `#262626` | Red 400 `#CF3147` |
| Ink 500 / dark background | `isotipo-on-ink.svg` | `muush-light.svg` | Bone 100 `#FBF8F6` | Red 400 `#CF3147` |
| Red 400 background, or red third of gradient B | `isotipo-on-red.svg` | `muush-triple-white.svg` | Bone 100 `#FBF8F6` | Bone 100 `#FBF8F6` (never red-on-red) |

## Shared geometry

All three files share identical `viewBox`, `circle`, and `path` elements —
only `fill`/`stroke` color attributes differ:

```
viewBox: 14.5 38.5 70.5 39.5
circle: cx=21 cy=45 r=6.5
path: M21 72 a17 17 0 0 1 34 0 a12 12 0 0 1 24 0
stroke-width: 12 · stroke-linecap: round
```

## Scope

No wordmark, lockup A (horizontal), or lockup B (stacked) asset exists in
this directory — only the three isotipo-only (lockup C) variants. No
wrapper component, page, header, or logo instance consumes these files yet;
that is deliberately deferred to the future feature that places the first
real logo instance (see `specs/001-design-tokens-and-logos/research.md` § 3).
