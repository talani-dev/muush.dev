# Quickstart: verifying feature 42

## Automated

```bash
pnpm check && pnpm typecheck && pnpm test && pnpm generate && pnpm storybook:build
./init.sh
```

Then, against the build (never the dev server, `rules.md` §§ R25, R31):

```bash
# No Google Fonts anywhere in the artefact
grep -rl "fonts.googleapis.com\|fonts.gstatic.com" .output/public && echo FAIL || echo ok
# Poppins 500 face emitted
grep -o "font-family:Poppins[^}]*font-weight:500" .output/public/_nuxt/*.css | head -1
# Canvas token
grep -o "html{[^}]*}" .output/public/_nuxt/*.css | head -1     # → var(--negro-950)
# Nothing served from docs/
grep -rl "docs/handoff" .output/public && echo FAIL || echo ok
# No server output
test ! -d .output/server && echo ok
```

## Catalogue (`pnpm storybook`)

For each story under **Foundations/Tokens** and **Shared/UI/**, switch the viewport toolbar between
"Móvil (390)" and "Escritorio (1440)":

1. **Tokens**: swatches equal pen extract § 1; hero sample measures 34 px at
   390 and 96 px at 1440.
2. **PrimaryButton**: measure 253 × 55 (hero, 1440), 178 × 44 without icon
   (hero, 390), 195 × 40 (nav), full width × 55 (block, 390). Label white,
   19 px semibold. Tab to it: a Blanco ring with an offset.
3. **GlassButton**: 198 × 53 at 1440, 145 × 41 at 390; edge lighter at the top.
4. **Pill**: 36 px tall, three rings visible on the dot.
5. **GlassSurface**: panel, servicio, franja side by side over a background
   story; compare with pen extract § 3.
6. **Heading**: two-tone; ES and EN; each size at both anchors.
7. **RotatingPill**: changes every 2.6 s; hover stops it; with the OS
   "reduce motion" setting on and the page reloaded, it stays on item 1. With
   VoiceOver, the four items are read once and nothing is announced while it
   rotates.
8. **ShaderBackground**, one story per preset:
   - Performance panel: frames stop when the story is scrolled away or the
     tab is hidden.
   - Rendering → "Emulate CSS prefers-reduced-motion: reduce" and reload: one
     still frame.
   - `chrome://flags` → disable WebGL (or `--disable-webgl`): the poster shows.
   - DevTools → disable JavaScript and reload: the poster shows.
   - Resize below 768 px: `canvas.width` equals its CSS width (1×); at 1440 on
     a 2× screen it equals 1.5× the CSS width.
   - Click through it: the click reaches the content; the accessibility tree
     shows nothing for it.

Also check 360, 768, 1024, 1280 and 1920 px: no horizontal scroll, no clipped
text, no overlap.

## Live pages (`pnpm generate && npx serve .output/public`)

On `/es/`, `/en/`, `/es/nosotros`, `/en/about` and a 404:

- The canvas is near-black `#050505` (overscroll too). The v1 sections, dots
  and glows still render; the footer is a lighter Ink 500 band (expected
  until feature 43).
- With a mouse: the cursor is the red "You" arrow in `#E5352F`; text fields
  show the I-beam; the dots near the pointer turn `#E5352F` and fade out. With
  reduced motion or touch: no spotlight.
