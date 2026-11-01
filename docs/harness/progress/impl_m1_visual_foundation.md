# Implementation report · feature 42 `m1_visual_foundation`

- **Branch:** `feat/v2-visual-foundation` (nothing committed, no version bump)
- **Dates:** 2026-10-31 → 2026-11-01
- **Spec:** `specs/042-m1-visual-foundation/`. All 65 tasks in `tasks.md` are checked.
- **Status:** left at `in_progress` for the leader to move to `reviewing`.
- **Gate:** `./init.sh` exits 0 (typecheck, check, test, generate, storybook:build).

Clarifications Q1–Q4 were implemented as final, because Roberto confirmed them
on 2026-10-31. `spec.md` now marks Q1, Q3 and Q4 as confirmed and has a dated
note under the Clarifications header. The favicon was not touched; feature 43
owns it.

## 1 · What was built

### Tokens and global CSS (`app/assets/css/global.css`)

- **New `:root` block "Muush 1.0"**, placed after the v1 `:root`:
  - Every variable of the handoff `tokens.css`, under its handoff name, in `rem`.
  - The two `.pen` overrides, each with a comment citing pen extract § 4 and R32:
    `--m1-h-hero` goes 34 → 96 and `--m1-p-grande` goes 17 → 20.
  - New heading sizes `--m1-h-proceso` (28 → 52), `--m1-h-diagnostico`
    (34 → 64) and `--m1-h-servicio` (24).
  - Fluid line-heights `--m1-lh-*`.
  - Fluid tracking `--m1-tracking-*`: 0 at 390 and the `.pen` value at 1440.
    The service card is a fixed −0.6 px.
  - Radii for the three glass presets (28 / 24 / 20).
  - Derived surface colours: pill 60 %, strip 40 %, dot halos 30 % and 12 %.
  - Edge gradients for card, button and flat.
  - Focus-ring width and offset (2 / 3 px).
  - Pill-motion tokens: 220 ms, 260 ms, 6 px.
- **Reduced motion:** `--m1-rapido`, `--m1-medio` and `--m1-lento` are set to
  `0ms` inside the existing reduced-motion block.
- **New `@theme inline` m1 block**, placed after the v1 one. It covers the
  colour, font, text (with line-height, letter-spacing and font-weight
  sub-properties), radius, spacing, blur, shadow, ease and container
  namespaces.
- **New utilities:**
  - `@utility m1-borde-luz`: the 1 px top-lit edge, painted as a masked
    `::before`.
  - Edge variants: `m1-borde-panel`, `-tarjeta`, `-boton`, `-plano`, `-linea`
    and `-btn`.
  - `@utility m1-foco`: the Blanco `:focus-visible` outline.
- **Canvas:** the `html` background is now `var(--m1-negro-950)`.
- **Spotlight:** `--dot-paper-lit-color` is now `var(--m1-red-muush-500)`.
- **Untouched:** the v1 token families.

### Assets

- `app/assets/shaders/m1-liston.glsl` and `m1-acanalado.glsl`: byte-for-byte
  copies, checked with `cmp`.
- `app/assets/backgrounds/*.webp`: the six posters, byte-for-byte, checked with `cmp`.
- `app/assets/icons/arrow-right.svg` (lucide, ISC), with its entry in that
  folder's README.
- `public/cursor/you.svg`: the three `#CF3147` occurrences are now `#E5352F`.
  The comment was rewritten without `--`, so the image still decodes.

### Shared layer

- **Data**
  - `app/shared/data/glassPresets.ts`: types, `GLASS_PRESETS`, `GLASS_CLASSES`
    and `glassClasses()`.
  - `app/shared/data/backgroundPresets.ts`: seven presets, plus
    `SHADER_SOURCES` as dynamic `?raw` imports.
- **Logic**
  - `app/shared/logic/useReducedMotion.ts`: follows the preference live.
  - `app/shared/logic/useRotatingText.ts`
  - `app/shared/logic/shaderRenderer.ts`
  - `app/shared/logic/useShaderCanvas.ts`
- **Utils:** `app/shared/utils/shaderFrame.ts`.
- **UI:** `M1GlassSurface.vue`, `M1Pill.vue`, `M1RotatingPill.vue`,
  `M1PrimaryButton.vue`, `M1GlassButton.vue`, `M1Heading.vue` and
  `M1ShaderBackground.vue`, all in `app/shared/ui/`. Each has a `.test.ts` and
  a `.stories.ts`. There is also `m1-tokens.stories.ts`.

### Other files edited

- `app/layouts/default.vue`: the root uses `bg-m1-negro-950` and the doc
  comment was updated.
- `nuxt.config.ts`: Poppins weights are `[500, 600]` and the comment was
  rewritten.
- `.storybook/preview.ts`: adds a `negro` background swatch. The default
  background stays `ink`.
- `.storybook/preview-head.html`: the catalogue's font link adds Poppins 500.
- `vitest.config.ts`: the include list adds `app/shared/utils/**/*.test.ts`.

### Tests

- **New:** `tests/m1-tokens.test.ts` (112 cases) and
  `tests/m1-literals.test.ts` (23 cases).
- **Edited in place, not deleted:**
  - `tests/static-output.test.ts`: canvas token, layout-root class, Poppins 500 face.
  - `tests/brand-cursor.test.ts`: the cursor colour now compares against `--m1-red-muush-500`.
  - `tests/spotlight-red-dots-tokens.test.ts`: lit colour is `var(--m1-red-muush-500)`.

## 2 · Deviations from the plan, and why

1. **The pill and the primary button draw their 1 px edge as a painted band.**
   - The plan had a CSS border on both (`border-m1-linea`,
     `border-m1-btn-borde`). I used `m1-borde-luz` with the new
     `m1-borde-linea` and `m1-borde-btn` variants instead.
   - Why: a CSS border adds 2 px to the box, so the pill would be 38 tall
     instead of 36 and the hero button 57 instead of 55. The `.pen`'s stroke
     takes no layout space.
   - This is the same mechanism as the glass edges, and the measured sizes
     below confirm it.
2. **Focus ring.** It is a `@utility m1-foco` in `global.css` rather than
   inline `focus-visible:outline-*` classes. It produces the same CSS, gives
   one name that 43–46 can reuse, and was checked in the emitted CSS.
3. **The mobile hero button keeps an invisible arrow slot.** This is
   INFERRED, and I am flagging it in § 5.
   - Below `lg`, the arrow wrapper is `invisible`, not removed.
   - The `.pen` gives the button as 178 × 44 with no icon. Its 14 px label
     measures about 120 px (scaled from the 19 px label in the 253 px
     desktop button). 120 + 28 padding = 148, not 178.
   - 178 equals exactly label + 10 gap + 20 arrow + 28, and 44 equals
     12 + 20 + 12. Measured in the build: 177.75 × 44.
4. **Button labels use `line-height: normal`.** The extract gives no
   line-height for buttons. `normal` is the font's own line box, which is
   how the `.pen` sizes text that grows with its content. It reproduces
   253 × 55 and 178 × 44 exactly, and nav and glass within 1 px (§ 3).
5. **Tokens added beyond data-model § 1:**
   - `--m1-cuerpo`: 17 px, the body text size.
   - `--m1-btn-brillo` (1.06) and `--m1-btn-presion` (0.98): the handoff's
     hover brightness and press scale from `componentes.css`, as tokens.
   - Spacing names that data-model left open: `--spacing-m1-pill-inicio`,
     `-fin`, `-punto`, `-halo`, `-nucleo` and `--spacing-m1-boton-gap`.
6. **`--m1-h-seccion` is re-anchored, as research R4 decided.** Its middle
   term differs from the handoff's `3vw + 14px`. The token test therefore
   compares it with the handoff only at and beyond the anchors (320, 390,
   1440, 1920), and records that in the test.
7. **Two edits outside the task list:**
   - `.storybook/preview-head.html` gains Poppins 500. Without it the
     catalogue would draw M1 headings in a fallback weight (findings § R30).
   - `vitest.config.ts` gains the `app/shared/utils/` include. Without it,
     `shaderFrame.test.ts` would never run (findings § R39).
8. **`M1ShaderBackground` root.** It also has `bg-m1-negro-950`, matching the
   handoff's `#050505` behind the poster, so nothing shows through before the
   poster loads. It also has `overflow-hidden`.
9. **`M1Heading` accessible name.** A space text node sits between the two
   line spans. Without it the name reads "negocioy código.". It does not
   render visibly between two blocks.
10. **Story frame heights.** `M1ShaderBackground.stories.ts` sets the README
    section heights as inline `rem` values (62.5rem and so on). They frame
    the story only; each section owns its real height in 44–46. The
    ScrollAway story stacks three sections, not two, because two sections of
    that height never leave the 100 px look-ahead at desktop height.
11. **Test-only techniques:**
    - `useShaderCanvas.test.ts` mocks the renderer module and waits for the
      `?raw` source import to settle.
    - The rotating-pill component test uses Vue Test Utils' default
      `<Transition>` stub.
12. **Primary-button test.** It removes the `aria-hidden` arrow before reading
    the text, because the SVG `<title>` is text content. It is not part of
    the accessible name.

## 3 · Test and check results

Every gate command passed:

| Command | Result |
|---|---|
| `./init.sh` | exit 0 ("Environment ready") |
| `pnpm test` | 113 files, 1697 tests (before: 101 files, 1520 tests) |
| `pnpm check` | 0 diagnostics |
| `pnpm typecheck` | 0 errors |
| `pnpm generate` | succeeded |
| `pnpm storybook:build` | succeeded |

- `pnpm typecheck` really covers `app/shared/`: a deliberate type error in a
  temporary file there was reported, and the file was removed.
- New tests failed before their implementation existed, as the tasks ask.

**Quickstart greps on `.output/public`:**
- No Google Fonts request anywhere.
- A Poppins 500 `@font-face` is emitted.
- The CSS contains `html{background-color:var(--m1-negro-950)}`.
- No file mentions `docs/handoff`.
- There is no `.output/server`.

**Tailwind shorthands (T010).** These all compile into `_nuxt/*.css`:
`duration-(--m1-rapido)`, `bg-(image:--m1-btn-fondo)`,
`hover:brightness-(--…)`, `active:scale-(--…)`, `backdrop-blur-m1-*`,
`shadow-m1-*` and `text-m1-hero` (with its line-height, tracking and weight
from tokens).

**Primitive sizes (SC-002).** Measured on the built catalogue in headless
Chrome over CDP, with fonts loaded:

| Element | Target | Measured |
|---|---|---|
| Primary, hero, 1440 | 253 × 55 | 252.52 × 55 |
| Primary, hero, 390 | 178 × 44 | 177.75 × 44 |
| Primary, nav | 195 × 40 | 194.3 × 41 |
| Glass, 1440 | 198 × 53 | 197.13 × 52 |
| Glass, 390 | 145 × 41 | 144.22 × 42 |
| Pill height, 390 and 1440 | 36 | 36 |

All sizes are within 1 px.

**Headings (SC-002).**

| Size | 390 | 1440 | Tracking at 1440 |
|---|---|---|---|
| Hero | 34 | 96 | −3.499 px |
| Sección | 28 | 56 | −1.96 px |
| Proceso | 28 | 52 | −1.819 px |
| Diagnóstico | 34 | 64 | −2.2395 px |

Tracking at 390 is 0 for all four.

**Intermediate widths (SC-003).** Nine stories at 360, 768, 1024, 1280 and
1920 px show no horizontal overflow.

**Backgrounds.** Measured on the built catalogue with SwiftShader WebGL,
counting `drawArrays` per canvas:

| Check | Result |
|---|---|
| In view | about 30 draws/s |
| DPR cap | 1440 @ 2× → canvas 2160 (1.5×); 767 @ 3× → 767; 390 @ 3× → 390 |
| Three stacked sections | top: [30, 30, 0]; bottom: [0, 30, 30] |
| Hidden tab | 0 draws |
| Tab shown again | about 30 draws/s |
| Reduced motion | exactly 1 draw, still 1 a second later |
| Click-through | `elementFromPoint` hits the section |
| Accessibility tree | no image node, no canvas |
| `--disable-webgl` | canvas hidden, poster loaded, 0 draws |
| Poster loading | `eager` + `fetchpriority=high` on high presets, `lazy` on the others |

**Rotating pill (SC-008).**
- The label changes every 2599–2601 ms.
- Hovering holds it for 6 s, and it resumes after the pointer leaves.
- With reduced motion and a reload it stays on item 1.
- Accessibility tree: 1 list, 4 items, 0 live regions. The only static texts
  are the four items.

**Live pages.** `/es/`, `/en/`, `/es/nosotros/`, `/en/about/`, `/es/404/` and
`/en/404/` were served from `.output/public`:
- `html` and the layout root are rgb(5, 5, 5).
- The footer is rgb(38, 38, 38), the Ink 500 band.
- After a mouse move, the lit dots are rgb(229, 53, 47).
- The cursor is `you.svg 1 9, auto` / `pointer` on links, and `text` in fields.
- With reduced motion there is no spotlight.
- No change in `CursorSpotlight.vue`, `useCursorSpotlight.ts`, `DotGrid.vue`
  or the cursor rules (`git diff` is empty).

## 4 · Not done, or only partly verifiable here

- **VoiceOver was not run** (no interactive session). The accessibility tree
  above is what it reads.
- **JavaScript disabled:** Storybook cannot render without JavaScript. The
  no-JS state is covered by the server-render test: `renderToString`
  contains the poster `<img>`. No page places a background yet.
- **Hidden tab** was simulated by activating a second headless tab. The
  page's `visibilityState` really became `hidden`.
- **SC-003 clipped text and overlap** were not machine-checked; only
  horizontal overflow was. These need a by-eye pass in review.
- **Posters and shaders are not in the site bundle yet.** No page uses
  `M1ShaderBackground`, so they are tree-shaken out until feature 44. The
  catalogue bundles them.
- **The catalogue still loads its fonts from Google** (existing setup,
  catalogue only). The site artefact is self-hosted.

## 5 · Values I stopped on, and items for the leader

- **No value was missing, so I did not stop.** Every visual value came from
  `pen-extract-42.md` (§ 8 included), `muush-1.0.md` or the handoff.
- **Needs a `.pen` check.** The mobile hero primary button's invisible
  20 px arrow slot (§ 2 item 3). Could the leader confirm in frame `V2s7T`
  whether the icon node is hidden but still takes layout space? If the
  `.pen` button is instead a fixed 178 × 44, the slot can become a width
  token with no visible change.
- **1 px residues** come from the font's own line box: nav 41 vs 40, glass 52
  vs 53 and 42 vs 41. They are within SC-002. Only an explicit line-height
  from the `.pen` would remove them.
- **A `nuxt dev` process was already running** (pid 43034, started
  2026-10-31 23:06, not started by me). The gate's prerender took 578 s
  while it ran, but passed. I did not stop it.
- **No business rule was written anywhere.** Technical notes went into code
  comments next to what they govern.

## 6 · Follow-up (2026-11-01): the arrow is always visible

The leader checked frame `V2s7T` (pen extract § 9). The mobile hero primary
button shows its 20 px arrow: the "—" in § 2 meant "not extracted", not "no
icon". The mobile form submit shows the arrow too. Item 3 of § 2 and the
first question in § 5 are therefore resolved, and the "invisible arrow slot"
inference is withdrawn.

**What changed**

| File | Change |
|---|---|
| `app/shared/ui/M1PrimaryButton.vue` | The hero arrow class is now just `size-m1-boton-icono`; `invisible lg:visible` is gone. The doc comment's table and note were corrected. |
| `app/shared/ui/M1PrimaryButton.test.ts` | The hero case now asserts a 20 px arrow with no `invisible` and no `lg:` class. |
| `app/shared/ui/M1PrimaryButton.stories.ts` | The doc comment says the arrow shows at 390. |
| `specs/042-m1-visual-foundation/spec.md` | Edge case "Hero buttons below 1024 px" and FR-012's hero-mobile line now give icon 20. |
| `specs/042-m1-visual-foundation/research.md` | R15 now says the arrow shows at every width. |
| `specs/042-m1-visual-foundation/contracts/components.md` | § 4 now says the arrow shows at every width. |
| `specs/042-m1-visual-foundation/tasks.md` | T026's wording is corrected. |

`icon=false` still removes the arrow at every size.

**Re-measured** on the rebuilt catalogue, headless Chrome over CDP:

| Story | Width | Box | Arrow |
|---|---|---|---|
| Hero | 390 | 177.75 × 44 | 20 × 20, `visibility: visible` |
| Hero | 1440 | 252.52 × 55 | 20 × 20 |
| Block | 390 | full width × 55 | 20 × 20 |

The 178 × 44 box was already right, because the arrow slot had always
occupied that space; it now also draws.

**Gate:** `./init.sh` exits 0: typecheck, check, test (113 files, 1697 tests), generate and storybook:build all OK. Nothing committed.

## 7 · Follow-up (review S1)

Review: `docs/harness/progress/review-42.md`.

**S1 · forced-colours boundary.**
- **The problem:** the painted `m1-borde-luz` band is a background, which the
  browser drops in forced-colours mode. The buttons and the pill lost their
  boundary there (spec § Edge Cases).
- **The fix:** `@utility m1-borde-luz` in `app/assets/css/global.css` now
  includes:

  ```css
  @media (forced-colors: active) {
    outline: var(--m1-borde-ancho) solid CanvasText;
    outline-offset: calc(var(--m1-borde-ancho) * -1);
  }
  ```

  - An outline takes no layout space, and the negative offset draws it
    inside the box.
  - `CanvasText` is a system-colour keyword, not a literal.
  - The `m1-foco` focus ring is more specific, so it still wins on
    `:focus-visible`.
  - The glass surfaces get the same edge, because they use the same utility.
- **Pinned by** a new case in `tests/m1-tokens.test.ts`: "should keep a
  layout-free system-colour edge when colours are forced".
- **Verified** on the rebuilt catalogue in headless Chrome, with CDP
  `Emulation.setEmulatedMedia` `forced-colors: active` and
  `matchMedia('(forced-colors: active)')` confirmed true. The primary button,
  glass button and pill were each measured at 390 and 1440:

  | Element | 390 | 1440 |
  |---|---|---|
  | Primary hero | 177.75 × 44 | 252.52 × 55 |
  | Glass button | 144.22 × 42 | 197.13 × 52 |
  | Pill | 206.33 × 36 | 206.33 × 36 |

  - Forced colours: each element's computed outline is
    `solid 1px rgb(255, 255, 255)` (the system colour) with a −1 px offset.
  - Normal mode: the outline is `none`, and every size is identical in both
    modes.
- **The site build** emits
  `@media (forced-colors:active){.m1-borde-luz{outline:…solid CanvasText;outline-offset:calc(var(--m1-borde-ancho)*-1)}`
  in `.output/public/_nuxt/*.css`.

**Advisory 1 · hidden tab.** `useShaderCanvas` no longer draws the paused
frame when `document.hidden` is true, either in `update()` or after a resize.
A hidden tab now draws 0 frames, literally. New test: "should draw nothing
at all while the tab is hidden".

**Advisory 6.** `spec.md` now reads "**Status**: Approved by Roberto on
2026-10-31".

The other advisories were not touched, as instructed.

**Gate:** `./init.sh` exits 0: typecheck, check, test (113 files, 1699
tests), generate and storybook:build all OK.
- One focused test run failed earlier in Vitest's global-setup build step.
  It was most likely a concurrent build, but I did not confirm that.
- An immediate rerun passed. I killed no processes.
- Nothing committed.
