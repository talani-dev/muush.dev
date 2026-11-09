# fix/v2-section-centering — every section a viewport tall, content centred

Branch `fix/v2-section-centering` (off master). Not committed.
Request: Roberto 2026-11-08, "Siento que las sections están muy abajo,
estaría bien que centraras el contenido para que se vea uniforme", scope
"absolutamente todo".

## What changed

Two shapes of section, both centred with `flex-col` + `justify-center`
and a symmetric safety padding (`--seccion-aire`, 40 → 64 px):

- **The first block of each page** (home hero, Nosotros hero, Preguntas,
  404) runs under the floating header from the top of the page:
  `min-h-portada-alto` (= `100svh`), `pt-portada-arriba`
  (= header offset + aire), `pb-seccion-aire`. So the content centres in the
  part of the viewport below the header.
- **Every other section**: `min-h-seccion-alto`
  (= `100svh - var(--header-offset)`), `py-seccion-aire`. An in-page jump
  stops at `scroll-padding-top` (unchanged), so the section fills exactly
  what is left of the viewport and its content sits centred in it.
- Sections with a shader layer (Cómo trabajamos, Diagnóstico, Trabaja con
  muush): the section is the flex column with the min height; the `z-10`
  content layer is `flex-1 flex-col justify-center`, so the shader (still
  `absolute inset-0`) covers the full height. Their `mx-auto max-w-contenido`
  container got `w-full`, since auto margins in a flex column would shrink
  it to its content.
- Taller content just grows the section: `min-height`, never `height`; no
  overflow, nothing clipped (`scrollWidth === innerWidth` at all four
  viewports).

`svh` because nothing in the codebase standardised a viewport unit for
sections (only `min-h-dvh`/`h-dvh` in the cookie dialog and a story), and
`svh` does not resize when mobile browser bars hide, so sections never
jump while scrolling.

## Tokens (`app/assets/css/global.css`)

Added:

| Token | Where | Value |
|---|---|---|
| `--seccion-aire` | `:root` (read by two theme tokens, rules.md § R18) | `clamp(2.5rem, 1.9429rem + 2.2857vw, 4rem)` = 40 → 64 px |
| `--spacing-seccion-alto` | `@theme inline` | `calc(100svh - var(--header-offset))` |
| `--spacing-seccion-aire` | `@theme inline` | `var(--seccion-aire)` |

Changed:

| Token | Before | After |
|---|---|---|
| `--spacing-portada-alto` | `clamp(…)` 740 → 1000 px | `100svh` |
| `--spacing-portada-arriba` | `clamp(…)` 110 → 290 px | `calc(var(--header-offset) + var(--seccion-aire))` = 116 → 152 px (76 + 40 / 88 + 64) |

Deleted (no reader left): `--spacing-portada-abajo` (60),
`--spacing-mapa-y` (72 → 110), `--spacing-bloque-y` (72 → 120),
`--spacing-diagnostico-abajo` (72 → 140), `--spacing-pagina-alto`
(700 → 820), `--spacing-pagina-arriba` (110 → 120),
`--spacing-composicion-arriba` (72 → 100), `--spacing-composicion-abajo`
(72 → 80), `--spacing-preguntas-alto` (720 → 1100),
`--spacing-preguntas-arriba` (100 → 120), `--spacing-preguntas-abajo`
(60 → 80), `--spacing-error-alto` (720 → 760), `--spacing-error-arriba`
(100). The comments over each group now say the drawn value gave way to the
section framing, and a new comment block over the portada tokens explains
the framing. Untouched: the handoff's `--seccion-y` / `--seccion-y-desktop`
(not used by any of these sections), `--spacing-error-botones-arriba`, all
gaps and gutters, `--header-offset`, `scroll-padding-top`.

Compiled CSS (verified in `.output/public/_nuxt/*.css`):
`.min-h-portada-alto{min-height:100svh}`,
`.min-h-seccion-alto{min-height:calc(100svh - var(--header-offset))}`,
`.pt-portada-arriba{padding-top:calc(var(--header-offset) + var(--seccion-aire))}`,
`.py-seccion-aire{padding-block:var(--seccion-aire)}`,
`.pb-seccion-aire{padding-bottom:var(--seccion-aire)}`.

## Per section, before → after

| Section | Before (min height / vertical padding / centring) | After |
|---|---|---|
| Home · Hero | 740 → 1000 / top 110 → 290, bottom 60 / centred below `lg` only | `100svh` / top header + aire, bottom aire / centred at every width |
| Home · Qué es muush | none / 72 → 110 both / — | viewport − header / aire both / centred |
| Home · Servicios `#servicios` | none / 72 → 120 both / — | same as above |
| Home · Cómo trabajamos `#como-trabajamos` | none / 72 → 120 both / — | same |
| Home · Diagnóstico `#diagnostico` | none / top 72 → 120, bottom 72 → 140 / — | same |
| Nosotros · Hero | 700 → 820 / top 110 → 120, bottom 60 / centred | `100svh` / header + aire, aire / centred |
| Nosotros · Cómo se arma | none / top 72 → 100, bottom 72 → 80 / — | viewport − header / aire both / centred |
| Nosotros · Dónde estamos | none / 72 → 110 both / — | same |
| Nosotros · Trabaja con muush `#trabaja-con-muush` | none / top 72 → 120, bottom 72 → 140 / — | same |
| Preguntas (StatusSection `faq`) | 720 → 1100 / top 100 → 120, bottom 60 → 80 / centred | `100svh` / header + aire, aire / centred |
| 404 (StatusSection `notFound`) | 720 → 760 / top 100, bottom 60 / centred | same as Preguntas; keeps its 0 → 8 above the buttons |

`StatusSection.vue` lost its `BLOCK_CLASSES` map (both presets now share
one class list); `BUTTONS_CLASSES` and `HEADING_SIZES` stay.

Not changed, on purpose: **legal pages** (`privacy.vue`, `terms.vue`, long
articles with their own `legal-arriba` rhythm), the **footer**, the cookie
banner/dialog, and `ShaderBackground.stories.ts` (its frame heights are the
handoff README's, story-only).

## Files

- `app/assets/css/global.css`
- `app/features/landing/ui/{HeroSection,WhoWeAreSection,ServicesSection,HowWeWorkSection,AssessmentSection}.vue` (+ `.test.ts`)
- `app/features/about/ui/{AboutHeroSection,TeamCompositionSection,WhereWeAreSection,WorkWithMuushSection}.vue` (+ `.test.ts`)
- `app/features/shell/ui/StatusSection.vue` (+ `.test.ts`)
- `app/features/landing/ui/{ServiceCard,ProcessTimeline,ServicesCarousel}.stories.ts` (decorator `py-bloque-y` → `py-seccion-aire`, the token was deleted)
- `tests/design-tokens.test.ts`: removed the pins of the 13 deleted tokens and
  the two old `portada-*` clamps; added `describe('design tokens · the section
  framing')` pinning `--seccion-aire` at 40 / 64 px, the exact values of the
  four framing tokens (declared once), and that none of the deleted tokens
  comes back.
- `tests/static-output.test.ts`: comment only (the hero lookup by
  `min-h-portada-alto` is unique *on the home*; the class is now also on the
  other first blocks, other pages).
- Each section's component test now pins `min-h-seccion-alto` /
  `min-h-portada-alto`, `justify-center`, `py-seccion-aire` (or
  `pt-portada-arriba` + `pb-seccion-aire`), and `flex-1` / `w-full` where
  the layered pattern needs them. The hero test also asserts
  `max-lg:justify-center` is gone.

Scroll-spy (`useActiveSection.ts`) and `localeSwitchScroll.ts` read the
header line from `scroll-padding-top` and rects at runtime, not section
sizes: untouched, their tests pass. Anchor ids and attribute order are
unchanged (`<section id="servicios"` etc. still match `static-output`).

## Commands

- `pnpm check`: clean (549 files) after a Biome format fix on two test files.
- `pnpm typecheck`: clean.
- `pnpm test`: 191 files, 2693 tests passed.
- `pnpm generate`: OK.
- `./init.sh`: exit 0 (includes storybook build).

## Measurement and screenshots

Method (findings.md § R44/R60): `.output/public` served with
`python3 -m http.server`, Chrome 156 headless driven over CDP with
`Emulation.setDeviceMetricsOverride` (real layout viewport, not
`--window-size`). For each section: scroll to it (top of page for the
first block; `scrollIntoView` for anchored sections, which honours
`scroll-padding-top` like the nav jump; section top minus header offset
otherwise), capture, and measure the content's gap to the frame
(frame = section, or section below the header for the first block). The
fixed cookie banner was hidden for the captures only.

Gap top / gap bottom (px) per viewport — symmetric everywhere:

| Section | 1232×752 | 1440×900 | 768×1024 | 390×844 |
|---|---|---|---|---|
| Home hero | 123 / 123 | 183 / 183 | 305 / 305 | 241 / 241 |
| Qué es muush | 59 / 59 (866 tall) | 64 / 64 (949) | 49 / 49 | 40 / 40 |
| Servicios | 59 / 59 (884 tall) | 64 / 64 (890) | 88 / 88 | 40 / 40 |
| Cómo trabajamos | 87 / 87 | 157 / 157 | 101 / 101 | 40 / 40 |
| Diagnóstico | 59 / 59 (775 tall) | 78 / 78 | 49 / 49 (1275) | 40 / 40 |
| Nosotros hero | 177 / 177 | 242 / 242 | 340 / 340 | 224 / 224 |
| Cómo se arma | 102 / 102 | 184 / 184 | 121 / 121 | 40 / 40 |
| Dónde estamos | 59 / 59 (839) | 64 / 64 (923) | 59 / 59 | 44 / 44 |
| Trabaja con muush | 59 / 59 (775) | 78 / 78 | 49 / 49 (1223) | 40 / 40 |
| Preguntas | 244 / 244 | 312 / 312 | 405 / 405 | 327 / 327 |
| 404 | 219 / 219 | 285 / 285 | 383 / 383 | 307 / 307 |

Where the gap equals the aire (40 at 390, ~49 at 768, ~59 at 1232, 64 at
1440), the content is taller than the viewport and the section grew.

Screenshots (45 PNGs + `after-geometry.json`), named
`after-<viewport>-<page>-<index>-<section>.png`, in
`/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/centering/`.
Checked by eye: all four heroes/status blocks, Servicios, Cómo trabajamos,
Diagnóstico, Cómo se arma and Dónde estamos at the relevant widths; content
centred, nothing clipped horizontally.

## What could not be centred, and why

- **Servicios at 1232×752 and 1440×900**: the content alone (head + the four
  cards + the "También" strip) is ~766 / ~762 px, taller than the 664 / 812
  px left below the header minus the aire. The section grows and the cards'
  lower part / the strip are below the fold after the nav jump, as before —
  only the top now starts 59 / 64 px under the header instead of 120.
  Fitting it would need smaller cards or a different layout: a design
  decision, not a spacing one.
- **Qué es muush / Dónde estamos at desktop** (the 1408 × 470 map) and
  **Diagnóstico / Trabaja con muush at 1232×752 and 768×1024** (the form):
  same — taller than the viewport, so they grow with the aire at both ends.
- These cases are the "section simply grows" branch of the request, not
  regressions.

## For the leader / Roberto

- The `.pen` heights at the 390 / 1440 anchors (hero 740 → 1000, Nosotros
  hero 700 → 820, Preguntas 720 → 1100, 404 720 → 760, section paddings
  72 → 140) are no longer matched: they are now viewport-driven per this
  request. If Roberto wants this recorded as a business/design rule in
  `docs/business/muush-1.0.md` or the constitution's responsive-anchor
  wording, that is a human edit.
- The 40 → 64 px aire is my choice ("smaller than today's 72 → 140"); it is
  one token if Roberto wants it tighter or looser.

## Round 2 (Roberto, about 1220×756)

### 1. Nosotros hero: the next section's pill peeking in

**Diagnosis (measured over CDP, the round-1 build):** this does not happen in
Chrome at 1220×756 on this branch. The hero is exactly `innerHeight` (756),
the next section starts at 756 with its top padding, and the "Cómo se arma"
pill starts at 861, 105 px below the fold. None of the three suspects holds.
The hero is not shorter than the viewport, the next section has top padding,
and the pill sits inside it. Client-side navigation from Home (at scroll 0,
300 and 2000) gives the same numbers, with `scrollY` 0.
The likely causes, neither confirmed: (a) a stale build or dev server with
the old fixed hero (700 → 820 px); (b) a browser whose toolbars collapse, so
the visible viewport is taller than `svh`. In that case a `100svh` first
block really does leave the next section showing below it.

**Fix (covers (b) at every breakpoint):** `--spacing-portada-alto` went from
`100svh` to `100lvh` (the viewport with the bars hidden) for every first
block: the home hero, the Nosotros hero, Preguntas and the 404. On desktop
`lvh` = `svh` = the window, so nothing changes there. On a phone with its
bars showing, the first block runs past the fold by the bars' height. Its
column then sits up to half that height below the visual centre. That is the
cost of guaranteeing no peek. `--spacing-seccion-alto` stays in `svh`, the
smallest case, so a section reached by a jump fits even with the bars
showing.

Measured on round 2: on every page, at all five viewports, the next section
(or the footer) starts exactly at `innerHeight` on the first screen. Nothing
from below is visible.

### 2. Servicios (and every jump target): too low, cards cut

Measured content of Servicios (pill top to "También" bar bottom):
**765 px at 1220**, 766 at 1232, 762 at 1440. It breaks down as pill 36,
gap, heading 112, gap 40, cards 428, gap 40, bar 79. The header's lower
edge (`--header-offset`, the `scroll-padding-top`) is at 88 px from `lg`.

Change: `--seccion-aire` 40 → 64 went to **24 → 32**
(`clamp(1.5rem, 1.3143rem + 0.7619vw, 2rem)`). The rule did not change.
Content stays centred, so short sections keep their larger centred gaps.
When content nearly fills the viewport or is taller, only the air shows, so
the pill lands 24–32 px under the header. `--header-offset` and the scroll
padding are unchanged. They are the header's real lower edge, and shrinking
them would put the pill under the floating bar when it shows again on
scroll-up.

After the jump, measured (content top – bottom, viewport height):

| Viewport | Servicios | Fits? |
|---|---|---|
| 1440×900 | 120 – 882 / 900 | yes: pill 32 under the header, bar ends 18 above the bottom |
| 1220×756 | 118 – 883 / 756 | **no**, 127 px of bar and card bottoms below the fold |
| 1232×752 | 118 – 884 / 752 | **no** |
| 768×1024 | 164 – 936 / 1024 | yes, centred |
| 390×844 | 100 – 853 / 844 | carousel and dots visible, the bar 9 px below the fold |

The other jump targets follow the same rule: Cómo trabajamos and Cómo se arma
stay centred at all five viewports. The map sections and the two forms are
taller than the viewport at 1220/1232 and on mobile. Their content starts
24–32 px under the header and the section grows.

**Gap to report, not guessed around:** Roberto's 1220×756 target has the
pill at about 90 and the bar ending at about 718. That leaves 628 px for
765 px of content. Padding cannot close 137 px. Fitting needs the Servicios
content itself to shrink at short viewports, for example height-aware gaps
(80 → ~48), a shorter card visual (210 → ~120) and/or a smaller heading.
That changes the design (component sizes), so it is for the leader and
Roberto to decide, and the values should come from the `.pen`. Also, "about
90 px from the top" and "24–32 px of air under the header" contradict each
other at real size, because the desktop header ends at 88 px. Both targets
are consistent with a **screenshot scaled by about 0.85 from a ~1440-wide
window** (1440×892 × 0.847 ≈ 1220×756). In that case the measured 1440
result (pill 120 → about 102 in the screenshot, bar 882 → about 747, all
visible) is what he asked for. Worth confirming with him.

### Round 2 files

- `app/assets/css/global.css`: `--seccion-aire` 24 → 32 (comment explains
  the fit arithmetic), `--spacing-portada-alto: 100lvh` (comment explains
  `lvh` vs `svh`, never `dvh`).
- `tests/design-tokens.test.ts`: pins `--seccion-aire` at 24 / 32 px and
  `--spacing-portada-alto` at `100lvh`.
- No component changes. Every section already reads the tokens.

### Round 2 commands

`pnpm check` clean · `pnpm typecheck` clean · `pnpm test` 191 files /
2693 tests passed · `pnpm generate` OK (compiled:
`.min-h-portada-alto{min-height:100lvh}`,
`--seccion-aire:clamp(1.5rem, 1.3143rem + .7619vw, 2rem)`).

### Round 2 screenshots

`r2-<viewport>-<page>-<index>-<section>.png` plus `r2-geometry.json`
(gaps, and the content top and bottom in the viewport after each jump) at
1232×752, 1220×756, 1440×900, 768×1024 and 390×844, in
`/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/centering/`.
Checked by eye: `r2-1440x900-home-2-servicios.png` (whole block visible),
`r2-1220x756-nosotros-0-hero.png` (nothing below the hero),
`r2-390x844-home-3-como-trabajamos.png`.

## Round 3 (Roberto, /en/ at about 1224×756)

### 1. Neighbour sections bleeding into the screen after a jump

**Cause:** the jump stopped the target section's top at `scroll-padding-top`
(88 px from `lg`, 76 below), so the 88 px strip under the transparent header
showed the bottom of the section above. With 24–32 px of bottom air, that
included its last line of text. A section exactly `100svh − header` tall
also ended at the fold, so the next section's first element sat just below
it.

**Fix: each section carries the header strip in its own top padding, and
an anchored section lands on its own top edge.**

- Every section is at least a full viewport tall: `min-h-seccion-alto` is now
  `100svh` (it was `100svh − header`). Its top padding is
  `pt-seccion-arriba` = header + aire, and its bottom padding is
  `pb-seccion-aire`. This is the same framing the first blocks already had
  (`portada-arriba` renamed to `seccion-arriba`, since every section uses it
  now). Content stays centred in the part below the header.
- The anchored sections (Servicios, Cómo trabajamos, Diagnóstico, Trabaja con
  muush) carry `-scroll-mt-cabecera`, which compiles to
  `scroll-margin-top: calc(var(--header-offset)*-1)`. Nuxt's router scrolls
  to `scroll-margin-top + scroll-padding-top`
  (`node_modules/nuxt/dist/pages/runtime/router.options.js`,
  `_getHashElementScrollMarginTop`), and the native fragment scroll does the
  same, so the sum is 0 and the section's top edge lands at the top of the
  viewport. The strip under the header is then that section's own empty top
  padding, and its pill sits header + aire from the top. That is the same
  position Roberto approved (118 px at 1224, 120 at 1440).
- `html { scroll-padding-top }` is unchanged. `useActiveSection.ts` and
  `localeSwitchScroll.ts` read the header line from it. After the jump, the
  previous section ends at y 0, above the scroll-spy's band, so the spy
  marks the target. All of their tests pass.
- Bottom: a section that fits ends exactly at the fold, and the next section
  starts with its own header + aire of empty padding, so nothing peeks in.
  A taller section continues past the fold, so the next one is not on
  screen at all.

### 2. Qué es muush ("Who we are") given more air

New token `--spacing-que-es-y: clamp(4.5rem, 3.3857rem + 4.5714vw, 7.5rem)`
= 72 px at 390 and 120 px at 1440 (the old `bloque-y` rhythm), applied as
`py-que-es-y` at both ends. It keeps `min-h-seccion-alto` and centring.
Before (round 2) it had 24 → 32 px. Measured: 120 / 120 at 1440, about
110 at 1224, 72 at 390. Dónde estamos (the same map on Nosotros) was not
part of the request and keeps the standard framing.

### Measured (real NuxtLink clicks with reduced motion, `.output/public` on the coordinator's port 4321)

For every page in ES and EN (Home, Nosotros/About, Preguntas/FAQ, 404) at
1224×756, 1440×900, 768×1024 and 390×844 (88 captures), with each section
landed in turn: anchored ones by clicking a real `href="…#id"` link,
the others scrolled to their top edge. The check was any element with text
or an icon from the previous or next section intersecting the viewport.
**Result: none, in all 88.** Every anchored section lands with
`top = 0`.

Content top–bottom after the jump (viewport height), ES:

| Section | 1224×756 | 1440×900 | 768×1024 | 390×844 |
|---|---|---|---|---|
| Servicios | 118–883 | 120–882 | 163–936 | 100–853 |
| Cómo trabajamos | 177–667 | 245–743 | 177–923 | 100–879 |
| Diagnóstico | 118–775 | 166–822 | 103–1280 | 100–945 |
| Trabaja con muush | 119–775 | 166–822 | 103–1229 | 100–910 |
| Qué es muush (scrolled to its top) | 110–855 | 120–941 | 89–990 | 72–810 |

EN matches within a few px. Servicios' pill is where round 2 put it, and the
bar is still fully visible at 1440×900. At 1224×756 the bar is still below
the fold (content 765 px). Round 3 did not change that, and only shrinking
the content would.

### Round 3 tokens and files

- `global.css`:
  - `--spacing-seccion-alto` changed from `calc(100svh - var(--header-offset))` to `100svh`.
  - `--spacing-portada-arriba` was renamed `--spacing-seccion-arriba` (same value).
  - New: `--spacing-cabecera: var(--header-offset)` (for `-scroll-mt-cabecera`) and `--spacing-que-es-y`.
  - The framing comment was rewritten.
- Sections:
  - `Services`, `HowWeWork`, `Assessment`, `WorkWithMuush`: `-scroll-mt-cabecera`, `pt-seccion-arriba pb-seccion-aire`.
  - `TeamComposition`, `WhereWeAre`: `pt-seccion-arriba pb-seccion-aire`.
  - `WhoWeAre`: `py-que-es-y`.
  - `Hero`, `AboutHero`, `StatusSection`: class rename only.
  - Docblocks updated.
- Tests:
  - Each section's test pins the new classes, and the four anchored sections pin `-scroll-mt-cabecera`.
  - `design-tokens.test.ts` pins the new exact values, `que-es-y` at 72 / 120, and `--spacing-portada-arriba` as retired.

### Round 3 commands

`pnpm check` clean · `pnpm typecheck` clean · `pnpm test` 191 files /
2694 tests passed · `pnpm generate` OK (compiled
`.-scroll-mt-cabecera{scroll-margin-top:calc(var(--header-offset)*-1)}`,
`.min-h-seccion-alto{min-height:100svh}`, `.py-que-es-y{…}`). I did not
start or stop any server. Measurements used the coordinator's server on
port 4321 and my own headless Chrome, which I shut down afterwards.

### Round 3 screenshots

`r3-<es|en>-<viewport>-<page>-<index>-<section>.png` plus
`r3-geometry.json` (landing method, section top, content top/bottom, any
neighbour text found) in
`/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/centering/`.
Checked by eye: `r3-en-1224x756-home-2-servicios.png` (empty strip above
the pill), `r3-en-1440x900-home-1-who_we_are.png` (120 px of air),
`r3-es-390x844-home-4-diagnostico.png`.
