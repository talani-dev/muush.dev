# Interface icon assets (normalized)

Icons from [lucide](https://lucide.dev) that the interface inlines. They live
here rather than in `public/` for the same reason the isotipos and the social
glyphs do: served as `<img src="/…">` they could never adopt a brand token,
because `currentColor` only resolves for inlined markup
(`docs/business/rules.md` § R8).

They are consumed with `?raw` + `v-html` inside an `aria-hidden` wrapper and
sized through a `:deep(svg)` rule in the component's scoped style — the
`:deep()` is required, since Vue's scoped-style transform does not rewrite
`v-html` content (`docs/business/rules.md` § R14).

## Shared contract

Same contract the social glyphs satisfy:

- Root is `<svg xmlns viewBox="0 0 24 24">` — a square viewBox, no `width` or
  `height` (the component sizes them).
- Every stroke and fill is `currentColor` or `none`. No hardcoded hex.
- No `<style>`, no `<defs>`, no DOCTYPE, no XML prolog, no tool metadata, no
  comments, no `class` attribute.
- A `<title>` naming the source glyph, mirroring `app/assets/logo/*.svg` and
  `app/assets/social/*.svg`. It names the *asset*, not the control: the
  accessible name of the button belongs to the caller and comes from the
  locale files.

## Per file

### `x.svg`

| | |
|---|---|
| Source | lucide `x` (ISC licence) |
| Original viewBox | `0 0 24 24` — already square, unchanged |
| Transform applied | none |
| Stripped | `width="24"`, `height="24"` |

Used by the mobile menu's close control, which the design specifies as the
lucide `x` at 18×18 in `$bone-100`
(`docs/business/landing/design-extract.md` § 9.bis · *Menú móvil abierto*).
The stroke presentation attributes (`stroke-width`, `stroke-linecap`,
`stroke-linejoin`) are lucide's own and are kept: they are the glyph's
geometry, not a design value this repository owns.

### `chevron-down.svg`

| | |
|---|---|
| Source | lucide `chevron-down` (ISC licence) |
| Original viewBox | `0 0 24 24` — already square, unchanged |
| Transform applied | none |
| Stripped | `width="24"`, `height="24"` |

Used by `SelectField.vue` (feature 016, `app/features/forms/`) as the select
control's affordance glyph. Same stroke-attribute convention as `x.svg`.
