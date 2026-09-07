# Implementation summary: section_glow (feature 5)

**Status: `done`.** The `reviewer` returned APPROVED
(`docs/harness/progress/review_section_glow.md`), verifying all 9 acceptance
items independently, so `feature_list.json` moved `reviewing` → `done` — the
one transition this protocol permits. A post-review section at the end of this
file records what changed after the verdict and what is still open.

`sdd: false` — no `specs/005-*` folder and no `tasks.md`, by design
(AGENTS.md § 4). The brief is the `feature_list.json` entry plus
`docs/business/landing/design-extract.md` § 10 · SectionGlow.

`./init.sh` exits **0**, 8/8 checks green.

---

## What shipped

`app/shared/ui/SectionGlow.vue`: one `<span>`, one class list, no script at
runtime beyond a `computed` that picks a class. The recipe is

```
circle (rounded-full)
  × radial-gradient(circle closest-side, <base colour at its opacity>, transparent)
  × a diameter that clamps 390 → 1440
```

**No named variants.** § 10's warning was taken literally: the props are
`color`, `opacity` and `size`, and the design's table is the reference for
which combination goes where. Nothing in the component knows the word `foco`,
`wine` or `cierre` — those names appear only as captions in the story, next to
the pair they describe, which is where the design's own colour/name mismatch
(`Propósito · red` is wine-300) can be seen instead of being encoded.

### Files

Created — 3:

- `app/shared/ui/SectionGlow.vue`
- `app/shared/ui/SectionGlow.test.ts` — 32 cases
- `app/shared/ui/SectionGlow.stories.ts` — 5 stories

Modified — 1:

- `app/assets/css/global.css` — 12 colour tokens and 13 diameter tokens added
  to `@theme inline`. No existing token changed or removed.

No page, layout, feature module, i18n key, route, dependency or other
component was touched. No barrel needed updating: `app/shared/ui/` has none,
and consumers import the SFC directly through `@/shared/ui/…` as the other
seven primitives do.

### Tokens

**Fills — 12, and only the 12 the design actually draws.**

| Colour | Opacities | Token |
|---|---|---|
| `red-400` | 65, 60, 12 | `--color-glow-red-400-<o>` |
| `wine-300` | 40, 37, 17, 14 | `--color-glow-wine-300-<o>` |
| `wine-400` | 30, 28, 20, 14, 12 | `--color-glow-wine-400-<o>` |

Each is `color-mix(in srgb, var(--<ramp>) <o>%, transparent)`, the same
construction `--color-glass-*` already uses. A pair the design does not draw
(say `red-400` at 17%) has no token, and the component's type refuses it.

**Diameters — 13, named after the design's own desktop/mobile pair.**

`1500-760`, `1500-700`, `1400-700`, `1100-520`, `1000-560`, `1000-520`,
`960-560`, `900-520`, `880-500`, `860-520`, `860-480`, `820-480`, and `920`.

Each is a `clamp()` interpolating 390 → 1440 (R5), the same construction the
rest of the surface scale uses. `920` is `Glow origen`, which the design draws
only on Landing desktop, so it has no mobile measurement and the token is a
fixed `57.5rem`.

## Judgement calls

### 1. Size: a fluid token per pair, not a `clamp()` the caller computes — and not a shared ratio

This was the question the brief asked to be settled. **Answer: `clamp()`, one
per design pair, picked by a `size` prop.** Three findings drove it.

- **A single ratio cannot work.** Mobile runs 0.47× (1500→700) to 0.60×
  (860→520). Applying any one fraction would silently redraw about half the
  22.
- **The desktop diameter is not a key.** Two glows are 1500 on desktop and
  700 / 760 on mobile; two are 1000 on desktop and 560 / 520 on mobile; two
  are 860 on desktop and 480 / 520 on mobile. So a `size` prop carrying only
  the desktop number could not reach the right mobile value — the *pair* is
  the identity, which is why the token names are `1500-700` and `1500-760`.
- **The caller must not pass the number.** A raw diameter at the call site is
  a spacing literal (Article VII), and a caller-side `clamp()` is the same
  literal twice. A breakpoint at the call site is what Article VII names as
  the signal that a token is missing.

The ratios are not noise, incidentally: they correlate inversely with size
(large glows shrink to ~0.47–0.50, small ones to ~0.56–0.60), which is what a
linear 390 → 1440 interpolation produces. Each pair still needs its own
intercept and slope, so 13 tokens is the same arithmetic the existing ~20
`--spacing-*` tokens already do, not a new mechanism.

Not merged: several diameters differ by 20–40px out of ~900 (860 / 880 / 900;
480 / 500 / 520). Collapsing those would be legitimate rounding of a
soft-edged gradient — and would also be me overruling a design the extract
explicitly says to check "caso por caso". They are kept apart, and the `Sizes`
story lines them up so the call can be made with eyes on it.

### 2. `closest-side` is the load-bearing detail, and it is one arbitrary Tailwind value

`bg-radial-[circle_closest-side]`. Tailwind's plain `bg-radial` emits
`radial-gradient(…)` with the default `ellipse farthest-corner`, whose fade
ends at the **corners** of the box — √2 ≈ 1.41× the circle's radius. On a
square clipped by `rounded-full` that leaves the gradient still at ~29%
strength where the circle ends: a hard rim on all 22, on a layer that is
supposed to have no edges at all. `closest-side` makes the gradient and the
circle the same size, which is what the design file draws.

This is the only arbitrary-value utility in the component. It carries gradient
geometry — no colour, no length, nothing Article VII governs — and it is
stated once. The alternatives were worse: a scoped `<style>` would have pulled
the 12 fills out of the token-driven utility map and into hand-written CSS,
and a custom `@utility` in `global.css` would have hard-coded Tailwind's
internal `--tw-gradient-stops` contract into the design-token file.

**This is the thing to eyeball in review** — the `Edge` story exists for it.

### 3. The outer stop is `to-transparent`, not a token for `#26262600`

The design writes the outer stop as `#26262600` — ink-500 at zero alpha. CSS
premultiplies by alpha before interpolating a gradient, precisely so a
transparent stop contributes no hue, so `#26262600` and `transparent` paint
byte-identically. Introducing an `--color-glow-edge` token would have implied a
choice that does not exist. Recorded in the component and in `global.css` so
the discrepancy against § 10 is not read later as an omission.

### 4. The accepted colour+opacity pairs are a type, not a convention

`defineProps` takes a discriminated union on `color`, so `color="red-400"`
accepts only 65 / 60 / 12 and `color="wine-300"` only 40 / 37 / 17 / 14. A
pair with no token is a **type error at the call site**, not a glow that
renders with no fill. The alternative — two independent unions plus a 30-cell
map — would have meant inventing 18 colour values the design never uses.

### 5. Positioning, and only positioning, is delegated

The component sets no `position`, no offset and no `z-index`, and a test
asserts the absence rather than trusting it. It does set
`pointer-events-none` and `aria-hidden="true"`: at up to 1500px across it
would otherwise sit over the content it is behind and eat clicks, and it
carries no meaning for assistive technology.

### 6. No new rule was added to `docs/business/rules.md`

Nothing here is a new cross-cutting constraint. R5 (390/1440), R18 (`:root`
ramp names) and the `--color-glass-*` construction all already existed and are
followed; the decisions above are component-local and documented in the
component.

## Tests

`SectionGlow.test.ts` — 32 cases, all passing.

- 12 × `should fill from the <colour> token at <o>% when that pair is given` —
  the prop-to-token mapping, one case per real pair.
- 13 × `should take its diameter from the fluid token when size is <pair>`.
- `should name a token global.css actually declares when every accepted
  combination is mounted` and `should leave no glow token in global.css
  unreachable when every accepted combination is mounted` — the cross-file
  contract with the stylesheet, in both directions. Added after review; see
  the post-review section for why they replaced a test that asserted nothing.
- `should size the gradient to the circle, not to its corners` — asserts
  `closest-side` and `rounded-full` together, for judgement call 2.
- `should fade to a fully transparent outer stop`.
- `should leave positioning entirely to the caller` — no `style` attribute and
  none of `absolute` / `relative` / `fixed` / `sticky` / `inset-0`.
- `should be hidden from assistive technology and inert to pointers`.
- `should render a single leaf element that holds no content`.

Deliberately **not** asserted: the computed gradient, the clamp output or any
colour value. happy-dom applies no stylesheet, so those tests would only read
back strings this same commit wrote. They were checked against the real build
instead — see below.

`pnpm test`: **98 tests in 10 files**, all passing (was 66 in 9 before).

## Verification performed

Read out of the real artifacts, not inferred:

- **Diameters, from `.output/public/_nuxt/entry.*.css`** — all 13
  `size-glow-*` utilities present, each setting `width` and `height` to the
  same `clamp()`. Spot-checked at both anchors: `size-glow-1500-700` is
  `clamp(43.75rem, 25.1786rem + 76.1905vw, 93.75rem)`, which evaluates to
  700px at 390 and 1500px at 1440. Every pair was checked numerically at both
  ends when the tokens were generated.
- **Fills, same file** — all 12 `from-glow-*` utilities present, each resolving
  to `color-mix(in srgb, var(--wine-300) 37%, transparent)` and so on.
- **R18 holds** — the emitted fills reference the `:root` ramp names
  (`var(--red-400)`, `var(--wine-300)`, `var(--wine-400)`), all three of which
  are confirmed present in `:root` in the site build. No `--color-*` theme name
  appears in any hand-written CSS; the component has no `<style>` block at all.
- **The gradient shape survives the build** —
  `bg-radial-\[circle_closest-side\]{--tw-gradient-position:circle closest-side;background-image:radial-gradient(var(--tw-gradient-stops,circle closest-side))}`,
  in both the site CSS and `storybook-static/assets/iframe-*.css`.
- **Stories are really built** — `storybook-static/index.json` lists all five
  (`--default`, `--fills`, `--sizes`, `--hero-stack`, `--edge`).
- **No hardcoded values in the component** — `SectionGlow.vue` contains no hex,
  no `px`, no `rem`, no percentage and no arbitrary colour or length. Every
  literal is a token name, a class name or an opacity *selector* (the number
  that names which token to use, e.g. `65` → `from-glow-red-400-65`).

Worth knowing, not a defect: Tailwind emits an opaque fallback
(`--tw-gradient-from: var(--red-400)`) outside an
`@supports (color: color-mix(…))` block, so a browser without `color-mix` gets
the base colour at full strength rather than nothing. That is the same
progressive enhancement `bg-glass-*` has shipped with since feature 2.

## Stories

All five sit on the Ink 500 background, the only surface these ever appear on.

- `Default` — Landing's `Hero · foco`, the largest and strongest, at true size.
- `Fills` — the 12 pairs at one shared diameter, captioned with both the pair
  and where the design uses it. The two wine ramps should read as ladders
  (40 → 37 → 17 → 14 and 30 → 28 → 20 → 14 → 12). The captions are where the
  design's colour/name mismatch is visible.
- `Sizes` — the 13 diameters, largest to smallest. Flip the viewport to Móvil
  (390) and `1500-760` / `1500-700` separate, which is the whole argument for
  naming tokens by the pair.
- `HeroStack` — the three Landing hero glows at true size, offset and clipped
  by the section, i.e. the page. Every coordinate belongs to the story. **This
  is the story that shows whether the recipe is right**: three transparent
  gradients overlapping must build one soft field with no seam or band.
- `Edge` — one glow alone on Ink 500 for the single defect that matters (see
  judgement call 2): if you can see where the circle ends, the gradient
  outran the shape.

`Fills` and `Sizes` shrink the canvas with `zoom: 0.2` rather than shrinking
the glows — the smallest token is still 820px across, so a dozen at true size
cannot be compared on one screen. Every glow in them is the real token seen
from further away. It is a review aid in the story and appears nowhere in the
component, the same way `Radar`'s `Footprint` outline does.

## Flagged for the reviewer / Clau

1. **`design-extract.md` § 10 says "nueve opacidades distintas"; the two
   tables contain ten** — 65, 60, 40, 37, 30, 28, 20, 17, 14, 12. The tables
   were treated as authoritative and all ten are implemented. Either the prose
   miscounts or one row is wrong; harmless today, but it is the kind of
   off-by-one that turns into a missing glow later. *(UNVERIFIED against the
   `.pen` — the Pencil bridge is not available to subagents.)*
2. **The Nosotros hero is fainter than Landing's on desktop (60/37/28 vs
   65/40/30) and identical on mobile (65/40/30).** § 10 already flags this as
   possibly drift rather than intent. Implemented exactly as documented — the
   mobile values are simply Landing's pairs — but a caller composing the
   Nosotros hero will have to switch opacity by viewport, which no other glow
   requires and which no token can express. Worth a decision before feature 6
   or 7 needs it.
3. **The near-duplicate diameters** (860 / 880 / 900 and 480 / 500 / 520) are
   kept distinct per judgement call 1. If Clau confirms they are hand-tuning
   noise, merging them removes 4 tokens and 4 prop values with no visual
   change.

## Not done, deliberately

- **No visual confirmation in a browser.** Everything above was read out of
  emitted CSS and build manifests. Whether the fade has no visible rim
  (`Edge`), whether the opacity ladders read in order (`Fills`) and whether
  three overlapping glows build one field (`HeroStack`) are visual questions.
  This is the open work for the reviewer.
- **No consumer was built.** No page, layout or feature module — the feature
  is a shared primitive only, per its own acceptance list. The 22 instances
  get placed when the landing and about features are built; their offsets are
  not in `design-extract.md` and were not invented here.
- **`feature_list.json` was not touched.** The review gate is unconditional
  for `sdd: false` too (AGENTS.md § 4).

## Gates

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass |
| `pnpm check` | pass (exit 0; the same 4 expected `info` on one-word primitive names, per R17/R20 — `SectionGlow` adds none) |
| `pnpm test` | pass — 98 tests, 10 files |
| `pnpm generate` | pass — 8 routes prerendered |
| `pnpm storybook:build` | pass — 5 new stories indexed |
| `./init.sh` | **exit 0**, 8/8 checks |

---

## Post-review (2026-09-06)

The `reviewer` returned **APPROVED** with five non-blocking observations. One
was acted on, the rest are recorded as open below. `feature_list.json` moved
`reviewing` → `done`, and the session entry is appended to
`docs/harness/progress/history.md`.

`design-extract.md` § SectionGlow was corrected by Roberto: the prose said
"nueve opacidades" where its tables carry ten (65, 60, 40, 37, 30, 28, 20, 17,
14, 12) across 12 colour+opacity pairs. The tables were already treated as
authoritative and all ten are implemented; no code changed.

### Acted on: the tautological test was replaced, not deleted

**Chosen: replace it with tests that mount and cover what the type system
cannot.** The reviewer was right — `should map each colour to exactly the
opacities the design draws for it` rebuilt a map from the `fills` array
declared 80 lines above it in the same file and compared it to a literal,
never mounting the component. The invariant it named is enforced by the
TypeScript union, so it asserted nothing.

Making it mount was the other option and was rejected: mounting it would only
have re-derived the same 12 pairs the 12 per-pair cases already assert
individually, which is duplication rather than coverage. The gap worth closing
is elsewhere.

The two tests that replace it check the **cross-file contract between the
component and `global.css`** — the one part of this feature the compiler
genuinely cannot see. The component names its tokens as class strings, the
stylesheet declares them as custom properties, and nothing connects the two: a
token renamed on one side only still typechecks, still builds, and renders a
glow with no fill or no diameter. That is the silent failure mode `rules.md`
§ R18 exists because of.

- `should name a token global.css actually declares when every accepted
  combination is mounted` — mounts all 12 pairs and all 13 sizes, reads the
  token names back off the rendered element, and checks each against the real
  stylesheet.
- `should leave no glow token in global.css unreachable when every accepted
  combination is mounted` — the other direction, which is how dead tokens
  accumulate.

Both names carry the `when <condition>` half the reviewer noted was missing.

**Both were mutation-tested before being trusted.** Renaming
`--spacing-glow-880-500` in `global.css` fails the first; adding a
`--color-glow-red-400-99` no prop can reach fails the second; `global.css` was
then restored and confirmed unmodified. A test not seen failing is not known to
test anything, which is precisely the defect being fixed here.

One implementation detail worth knowing, because it would silently undo the
work: `@/assets/css/global.css?raw` returns an **empty string**, since the
Tailwind Vite plugin claims every `.css` request. Both tests would have passed
against nothing. The stylesheet is read with `readFileSync` from Vitest's root
instead, and a comment in the test says why, so it does not get "fixed" back
into an import.

`pnpm test`: **98 tests in 10 files** (was 97).

### Recorded, not resolved

- **The Nosotros hero opacity split needs Clau.** The design has it at
  60/37/28 on desktop and 65/40/30 on mobile, where Landing is 65/40/30 at
  both. § 10 flags it as possibly intentional, possibly drift. No token can
  express an opacity that changes by viewport and **none was invented**; the
  cost lands on whoever composes that hero, who will need a viewport switch no
  other glow requires. **This needs a decision before the About page is
  built** — it is not resolved here.
- **`920` (`Glow origen`) renders full-size on mobile** if a caller mounts it
  there. Consistent with delegating placement, and the prop's JSDoc says
  desktop-only, but the consuming feature must hide it.
- **The near-duplicate diameters** (860/880/900, 480/500/520) remain distinct,
  upheld by the reviewer. If Clau confirms they are hand-tuning noise, merging
  them removes 4 tokens and 4 prop values with no visual change.

### Still NOT verified

**Browser-level visual confirmation remains open and is not claimed.** Nothing
in this feature has been watched rendering. Everything above was read out of
emitted CSS and build manifests. The three open visual questions are exactly
what the stories were built to answer:

- `Edge` — no rim where the circle ends.
- `Fills` — the two wine ladders read in order (40 → 37 → 17 → 14 and
  30 → 28 → 20 → 14 → 12).
- `HeroStack` — three overlapping gradients build one field, with no seam or
  band.

This joins the visual passes still outstanding from features 2 and 4.
