# Social glyph assets (normalized)

The three official brand SVGs for LinkedIn, Instagram and TikTok, normalized
so they can be inlined and take their colour from the container. Source of
truth for the normalization steps:
`docs/business/landing/decisions-open.md` § Íconos de redes sociales.

They live here rather than in `public/` because they are inlined by
`src/components/SocialIcon.astro`: served as `<img src="/…">` they could
never adopt the `bone-100` token, which is the whole reason the
normalization exists (`docs/business/rules.md` § R8). Same criterion as the
isotipos in `src/assets/logo/`.

## Shared contract

All three satisfy, by design:

- Root is `<svg xmlns viewBox="0 0 24 24">` — one shared square viewBox, no
  `width`/`height` (the component sizes them).
- Every `fill` is `currentColor`, so the glyph renders in bone-100
  (`#FBF8F6`) and not in the pure white (`#ffffff`) the sources hardcode.
- No `<style>`, no `<defs>`, no DOCTYPE, no XML prolog, no tool metadata, no
  comments, no `class` attribute.
- Exactly one wrapping `<g transform>`, the normalizing transform.
- A `<title>` naming the network, mirroring `src/assets/logo/*.svg`.

## Per file

### `linkedin.svg`

| | |
|---|---|
| Source | `~/Library/Mobile Documents/com~apple~CloudDocs/Pictures/Icons/Redes/Linkedin/linkedin-logo-white.svg` |
| Original viewBox | `34.13333 34.13333 187.73333 187.73333` |
| Transform applied | `scale(1.090909) translate(-4 -4)` |
| Stripped | `width="480"`, `height="480"`, the viewBox offset, the path's `transform="scale(8.53333)"`, `fill="#ffffff"` |

The art occupies a 22-unit square starting at (4,4) once the original
`scale(8.53333)` is removed, so the normalizing scale is `24 ÷ 22 =
1.090909` after shifting the origin to (0,0).

### `instagram.svg`

| | |
|---|---|
| Source | `…/Icons/Redes/Instagram/Instagram_Glyph_White.svg` |
| Original viewBox | `0 0 1000 1000` |
| Transform applied | `scale(0.024) translate(-2.5 -2.5)` |
| Stripped | `<defs>` and its `.cls-1 { fill: #fff }` `<style>` block, `class="cls-1"` on the path, `id="Layer_1"`, `data-name` |

`24 ÷ 1000 = 0.024` exactly. The source's own `translate(-2.5 -2.5)` on the
path is folded into the single wrapping transform. Deleting the global
`.cls-1` class is the correctness fix, not a cosmetic one: inlined, that
class would collide with any `.cls-1` elsewhere on the page.

### `tiktok.svg`

| | |
|---|---|
| Source | `…/Icons/Redes/TikTok/tiktok-logo-white.svg` |
| Original viewBox | `0 0 1419 1627` (not square, ratio 0.872) |
| Transform applied | `translate(1.53 0) scale(0.0147511)` on the wrapper, plus one flattened `matrix(4.166667,0,0,4.166667,…)` per path |
| Stripped | XML prolog, DOCTYPE, `xmlns:xlink`, `xmlns:serif`, `xml:space`, `width`/`height`, the root `style` attribute, the `<g id="ICONS">` wrapper and three levels of nested `<g transform>`, `fill:white` |

Optical centring: the taller axis is fitted (`24 ÷ 1627 = 0.0147511`), which
renders the art `1419 × 0.0147511 = 20.93` wide, so the horizontal inset is
`(24 − 20.93) ÷ 2 = 1.53`. Verified against the transformed path extents:
x lands in `[1.53, 22.45]`, y in `[0, 24]`.

The four nested `<g transform>` levels were collapsed into one matrix per
path: the outer `translate(-3312.500833,-401.2225)` composed with
`matrix(4.166667,0,0,4.166667,2812.5,0)` gives
`matrix(4.166667,0,0,4.166667,-500.000833,-401.2225)`, which is then
composed with each path's own translate.

**Deviation from `specs/002-primitive-ui-layer/tasks.md` T032, recorded on
purpose.** T032 asks for `fill-rule="evenodd"` / `clip-rule="evenodd"` to be
re-attached from the stripped root `style` attribute. In the source those
root values are overridden by `fill-rule:nonzero` on every path, so
`nonzero` — not `evenodd` — is what the source actually renders with, and it
is what is emitted here. The point is moot in practice: each of the four
paths is a single subpath, so no fill rule changes the result. `clip-rule`
is dropped because no path is used as a clip path.
