# Research: Site background and brand chrome

**Feature**: `specs/006-site-background-and-brand-chrome` | **Date**: 2026-09-07

Every finding below is marked **CONFIRMED** (verified against this repository,
a published package's own type declarations, or a normative spec),
**DERIVED** (arithmetic shown), or **UNVERIFIED** (the implementer must run it
before relying on it). `rules.md` § R25 is the standing discipline here: in
this repository the question is always "what file was written?", not "what
does the documentation say the option does".

---

## R1 · How a section contributes glows that render *under* a page-wide layer

**The problem.** The design's stack is base → glows → dotted paper → content.
The dotted paper is one sheet across the whole page. The glows are grouped by
section, and Roberto's requirement is that a section contributes its own
without any shared list. So a glow must be **authored inside a section** and
**painted beneath a page-level layer that is itself beneath every section**.
Those two facts are what make this non-trivial; everything else is layout.

### Decision

**CSS paint order.** The layout establishes exactly one stacking context for
the page and paints the ink base on it. Two negative stacking levels live
inside it:

| Level | What | Where it is authored |
|---|---|---|
| root element's own background | ink-500 base | layout |
| lower negative level | section glow groups | inside each section |
| upper negative level | dotted paper, page-wide | layout |
| normal flow | nav, page content, footer | everywhere |

A section marks itself as the positioning reference for its own glows and
renders a glow group that opts into the lower negative level. Because nothing
between that group and the page root creates an intervening stacking context,
the group is painted at the page root's lower negative level — under the dot
sheet, which sits one level above it, and under all content, which is painted
later still.

**Why this satisfies the requirement literally**: adding a section's glows
touches that section's file and nothing else. There is no list, no registry,
no route metadata, no ordering rule to remember, and no client-side state —
which also means it costs zero JavaScript and survives `pnpm generate`
untouched (Constitution Article IV, spec FR-009).

**CONFIRMED** against CSS 2.1 Appendix E paint order: within a stacking
context, (1) the root element's background, (2) negative-`z-index` stacking
contexts in `z-index` then tree order, (3) in-flow non-positioned block
backgrounds, … (8) positioned descendants with `z-index: auto | 0`. That
ordering is what puts the ink base under the glows, the glows under the dots,
and both under content.

### Two traps this creates, and how they are handled

1. **Order between the two negative levels is not tree order.** If the dot
   sheet and the glow groups shared one negative level, the glows would paint
   *above* the dots, because they appear later in the document. Distinct
   negative levels — dots above glows — is therefore load-bearing, not
   decoration, and both are named tokens rather than bare numbers (Article
   VIII).
2. **Any intervening stacking context breaks it silently.** If a future
   section carries `transform`, `filter`, `opacity < 1`, `isolation`,
   `will-change`, `contain: paint`, `position: fixed/sticky` with a
   `z-index`, or a backdrop filter, its glows are trapped inside that
   subtree and paint *above* the dot sheet. Nothing errors; the page just
   looks subtly wrong. This is spec A-04, and the mitigation is triple: the
   constraint is written in the glow-group component's own doc comment, in
   `quickstart.md`, and appended to `docs/business/rules.md`, which is the
   file a future spec author is required to read.

   Note the escape hatch is cheap: a section that genuinely needs a transform
   moves its glows up to the page level. That is a change to that section, not
   to this layer.

### Alternatives considered and rejected

| Option | Why rejected |
|---|---|
| **`<Teleport>` from the section into a background node** | Vue SSR does not resolve a teleport to an arbitrary in-app selector into the emitted HTML — Nuxt injects only the well-known teleport targets. The glows would be absent from the prerendered page and appear only after hydration, which for a static site means a visible pop on every load and nothing at all with scripting off. Contradicts FR-009. |
| **`provide`/`inject` registry filled by sections** | SSR renders a parent before its children, so a background layer declared at the top of the layout renders while the registry is still empty. Making it work requires rendering the background *after* the content and relying on setup-order — clever, order-dependent, and it adds reactive client state to something that is identical on every load (Articles V and VIII). |
| **Route meta (`definePageMeta`) carrying the page's glow list** | SSR-safe and stateless, but it moves the contribution point from the section to the page, so adding a section means editing two files instead of one. It also depends on the page-meta macro accepting imported constants, which would have to be verified. Kept as the documented fallback if R1's paint-order approach fails review. |
| **Explicit `<NuxtLayout :glows="…">` per page** | Requires every page to opt out of automatic layout resolution and render the layout itself; a page that forgets loses the entire shell. Too sharp an edge for a decorative layer. |
| **One hardcoded list of all 21 in the layout** | The thing Roberto explicitly ruled out on 2026-09-07: five future features would each edit the same list and each could break the other four. |
| **Per-section dot patches instead of one page-wide sheet** | Would let the glows sit above their own section's dots and dodge the whole problem — but the 24px grid restarts at every section boundary unless section heights are exact multiples of 24px, so the seams show. Rejected on fidelity. |

---

## R2 · The dotted paper as one repeating background

**Decision.** One element, one repeating radial gradient:

```
background-image: radial-gradient(<dot colour> <dot radius>, transparent <dot radius>);
background-size: <step> <step>;
```

This is exactly the recipe `design-extract.md` § 10 · *DottedPaper* already
prescribes ("⚠️ NO es un componente… en producción es"), and the numbers
match the frame reading: a 2.5px dot (1.25px radius) on a 24px step.

**Why the design file's construction is not the implementation** — DERIVED:
the `Dot tile` component is 288×288 holding a 12×12 grid at a 24px step
(12 × 24 = 288 ✓), instanced 90 times over the 1440×5060 page
(1440 ÷ 288 = 5 columns; 5060 ÷ 288 = 17.6 → 18 rows; 5 × 18 = 90 ✓). The
arithmetic closes exactly, which confirms the tile is Pencil's way of drawing
a repeat — 12 960 ellipse nodes for what CSS does with two declarations. The
tile size 288 has no meaning of its own and MUST NOT appear in the code.

**Tokens** (Article VII — FR-002). Three named values in
`app/assets/css/global.css`:

| Token | Value | Provenance |
|---|---|---|
| dot colour | `ink-100` at 12% | `#D9D9D9` is exactly `ink-100`; `0x1F ÷ 255 = 12.16%` → 12%, per the § R2/§ R11 rounding precedent (spec A-02) |
| dot radius | `0.078125rem` (1.25px @ 16px root) | half of the design's 2.5px dot |
| grid step | `1.5rem` (24px @ 16px root) | design |

**CONFIRMED trap — `rules.md` § R18**: these are declared in `:root` and
consumed from hand-written CSS, so they are referenced as `var(--dot-…)` and
composed from `var(--ink-100)`, never from a `--color-*` theme name. Theme
names do not exist in the site's emitted CSS; a mistake here looks right in
the catalogue and paints nothing in production.

**Two dots, one gradient**: the second colour stop is `transparent` at the
same radius, which gives a hard-edged dot. A softer edge would need a second
radius and is not what the design draws (2.5px solid ellipses).

---

## R3 · The stacking contract, overflow, and the mobile menu

- **The layout root must create a stacking context.** Without one, a negative
  level would escape to the document root and paint *behind* the layout's own
  ink background — i.e. invisibly. `isolation: isolate` (Tailwind `isolate`)
  creates one without touching `z-index`, and pairs with `position: relative`
  so the page-wide dot sheet can be absolutely positioned against the full
  document height rather than the viewport (spec edge case: the Landing frame
  is 5060px tall). **CONFIRMED** by CSS 2.1 Appendix E, as in R1.

- **`overflow-x: clip` on that root**, matching the design frame's
  `clip: true`, keeps the off-canvas glows (several at negative x) from
  producing a horizontal scrollbar. **`clip` rather than `hidden` on purpose**:
  per CSS Overflow 3, `visible` is coerced to `auto` when paired with
  `hidden`/`scroll`/`auto` but **not** when paired with `clip`, so
  `overflow-x: clip; overflow-y: visible` clips one axis without creating a
  scroll container in the other. `hidden` would create one and would break any
  future `position: sticky`. **UNVERIFIED in a browser** — the implementer
  MUST confirm no horizontal scrollbar and no vertical clipping at 390 and
  1440, per FR-007.

- **The mobile menu keeps working, unchanged.** It is `fixed inset-0 z-50`
  inside the layout (`app/features/shell/ui/MobileMenu.vue`). Two things to
  know: (1) a `position: fixed` element is not clipped by an ancestor's
  overflow unless that ancestor is in its containing-block chain, and neither
  `isolation` nor `overflow-x: clip` makes one, so the menu still covers the
  viewport; (2) `backdrop-filter` blurs everything painted below it within its
  backdrop root, and `isolation: isolate` on the layout root makes that root
  the whole page — base, glows, dots and content included. The blur therefore
  reads *more* than before, which is exactly FR-008 and the intent recorded in
  feature 3's A-03. **UNVERIFIED in a browser** — open the menu and look.

- **Nothing is repainted inside the menu.** The frame stacks `BG · base` and
  `Dotted paper` under the menu's glass because in Pencil there is no
  "whatever is behind"; in a browser there is.

---

## R4 · `@nuxt/fonts` — configuration surface and emission path

**CONFIRMED on 2026-09-07** by reading the published package rather than
documentation: `@nuxt/fonts@0.14.0`, whose `ModuleOptions` extends
`FontlessOptions` from `fontless@0.2.1`. Relevant keys, with defaults as
declared:

| Key | Meaning | Default |
|---|---|---|
| `families[]` | per-family override: `name`, `provider`, `weights`, `styles`, `subsets`, `global`, `preload` | — |
| `defaults` | `weights`, `styles`, `subsets`, `formats`, `preload`, `fallbacks` | `formats: ['woff2']`, `weights: [400]` |
| `provider` | restrict resolution to a single provider | all |
| `providers` | enable/disable/replace individual providers | built-ins |
| `assets.prefix` | base URL the binaries are served from | `/_fonts` |
| `processCSSVariables` | process `--font-*` CSS variables | `'font-prefixed-only'` |
| `throwOnError` | fail the build when a family cannot be resolved | `false` |
| `devtools` | DevTools panel | `true` |

**Emission path — CONFIRMED from `dist/module.mjs`**: the module registers a
Nitro `publicAssets` entry pointing at `<buildDir>/cache/fonts` with base URL
`assets.prefix`; on `nitro:init` → `rollup:before` it downloads each resolved
URL (cached in `node_modules/.cache/nuxt/fonts` via unstorage) and writes the
binaries into that directory. For `nitro.preset: 'static'` they therefore land
in `.output/public/_fonts/` and are served from the site's own origin. In
`nuxt dev` they are served by a dev handler on the same prefix.

**Consequences that belong in the plan, not buried here:**

- **A build-time network dependency and a new package.** `pnpm generate` now
  fetches from Google on a cold cache. With `throwOnError: false` (the
  default) a failed fetch is a *warning*, and the site would ship with the
  `@font-face` rules pointing at files that were never written. Spec A-09
  records the trade; the plan sets `throwOnError: true` so a fetch failure
  fails the build instead of shipping silent fallback type — the exact failure
  mode this feature exists to remove.
- **`processCSSVariables: 'font-prefixed-only'` is already the right default
  for this repository.** The theme declares `--font-poppins` and
  `--font-instrument`, and the package's own deprecation note states that
  Tailwind v4 users no longer need to force this on.
- **Injection is usage-driven.** The module scans CSS for `font-family`
  declarations. Tailwind's `@theme inline` substitutes the literal family
  names into the `font-poppins` / `font-instrument` utilities (`rules.md`
  § R18), so the names do appear in the emitted CSS. **UNVERIFIED end to
  end** — if the faces do not appear, the documented fix is `global: true`
  on each family, which injects the `@font-face` regardless of detected usage.
  The verification is a grep over `.output/public`, not a look at the dev
  server.
- **Weights**: `Poppins: [600]` (wordmark only, `branding.md`) and
  `Instrument Sans: [400, 500, 600]`. Google serves Instrument Sans as a
  variable font covering 400–700 in one file, so the three weights may resolve
  to a single binary with a range — that is correct and expected, not a
  misconfiguration.
- **Subsets**: `['latin', 'latin-ext']` (spec A-11). Spanish diacritics are in
  `latin`; `latin-ext` is cheap insurance for a proper noun.
- **Nothing about this needs `runtimeConfig`**, and no credential exists —
  Article XI is untouched.

---

## R5 · The catalogue's type (extends `rules.md` §§ R19, R23)

**Problem.** Storybook runs Vite outside Nuxt. It therefore has no Nuxt
module pipeline: no `@nuxt/fonts`, no `/_fonts` dev handler, and no way to
read the content-hashed binaries the module writes into `.nuxt/cache/fonts`.
Once FR-013 deletes the hand-written `@font-face` blocks, the catalogue has
**no** font declarations at all.

**Decision.** A `.storybook`-only head snippet loading the two families from
the Google Fonts stylesheet, with exactly the weights the site uses. The
catalogue is developer tooling and is never deployed; the site's artifact
stays fully self-hosted (Constitution Article IV governs the deployable
artifact).

**Alternatives rejected**: commit the two `.woff2` binaries under `public/`
and declare faces by hand for the catalogue (two copies of the same font in
the tree, one of which silently drifts from what the build downloads); or
accept fallback type in the catalogue (defeats Article X — a component
reviewed in the wrong typeface has not been reviewed, and Wordmark exists
precisely to show Poppins).

Recorded as spec A-05 with its reversal cost, because it is the one decision
in this feature a reviewer might want flipped.

---

## R6 · The favicon

- **Square framing — CONFIRMED, already answered by the brand book.**
  `branding.md` § *Isotipo* records: "viewBox avatar/favicon: `0 0 100 100`
  con `transform translate(3,-8)`". DERIVED check with `stroke-width: 12` (so
  the stroke extends 6 user units either side of the path): the art spans
  x 15→85 and y 38.5→78; after `translate(3,-8)` that is x 18→88, y 30.5→70
  inside a 100×100 box — vertically centred to within half a unit. So the
  70.5×39.5 artboard becomes a square without any scaling of one axis
  (FR-022). No new composition was invented.
- **Adaptive colour.** A `<style>` element inside the SVG, with the light
  scheme as the *default* declaration and `@media (prefers-color-scheme:
  dark)` overriding the stroke. The dot keeps `red-400` in both, per
  `branding.md` § *Sobre qué fondo va qué trazo*.
- **Support — UNVERIFIED here.** Media queries inside SVG favicons are
  honoured by Firefox and Chromium; Safari does not use SVG favicons at all.
  Because the light-scheme colours are the *default* rather than a
  media-query branch, a browser that ignores the query still renders a
  correct mark. The implementer looks at a real tab (spec A-08).
- **Hex literals in this one file are correct, not a token violation.** A
  standalone document in `public/` is outside the app's CSS and cannot read a
  custom property. The three existing brand SVGs in `app/assets/logo/` already
  carry literal hex for the same reason. The values are quoted from
  `branding.md` and the file records where they came from.
- **`favicon.ico` is deleted** (spec A-06): generating a real `.ico` needs a
  rasterizer this repository does not have, and adding a build dependency for
  a 16×16 legacy format fails Article VIII. Consequence: `/favicon.ico`
  returns 404, which browsers handle silently.
- **Registration.** There is no favicon configuration in `nuxt.config.ts`
  today; the Nuxt logo is being served purely by the `public/favicon.ico`
  convention. The icon link is declared once in `app.head.link` so every
  prerendered page in both locales carries it — verifiable in
  `.output/public/**/index.html`. The catalogue gets its own via
  `.storybook/`.

---

## R7 · What can actually be tested, and where

`happy-dom` does no layout and no painting, so **no unit test can assert that
the glows render beneath the dots**. Pretending otherwise would produce a
green suite that proves nothing — the failure mode `rules.md` § R27 already
caught once in this repository. The layers are therefore verified at three
levels, each doing only what it can:

| Level | Asserts | Cannot assert |
|---|---|---|
| Component test (Vitest + VTU) | the dot layer resolves its three tokens and renders one element, not a grid of nodes; both background components are `aria-hidden` and pointer-inert | anything visual |
| Static-output test (`tests/static-output.test.ts`, already builds the site in `globalSetup`) | the emitted HTML contains the background elements on every route in both locales; the emitted CSS contains `@font-face` for both families pointing at same-origin `/_fonts/…`; the string `fonts.gstatic.com` appears nowhere in the artifact; every page's head declares the icon | paint order |
| Storybook story + human eyes | the four layers in their order, at 390 and 1440, over real content and the real Hero glow triplet | nothing automatable |

This split is deliberate and is the honest reading of Article X: the visual
review layer exists precisely because the other two cannot see.

---

## R8 · Verification against the real artifact (standing discipline)

`rules.md` §§ R18 and R25 both say the same thing in different words: verify
against `.output/public`, never against the dev server or the catalogue. For
this feature that means, after `pnpm generate`:

1. `.output/public/_fonts/` contains the downloaded binaries.
2. The emitted CSS contains `@font-face` for Poppins 600 and Instrument Sans
   400/500/600 and references only `/_fonts/…`.
3. No file in `.output/public` contains `fonts.gstatic.com` or
   `fonts.googleapis.com`.
4. No file in `.output/public` contains `/fonts/Poppins-Regular.woff2` or any
   of the other three deleted paths.
5. Every `index.html` links the SVG icon.
6. The dot layer's custom properties resolve in the emitted CSS — checked by
   name against the ramp (`--ink-100`), not against a theme name.
