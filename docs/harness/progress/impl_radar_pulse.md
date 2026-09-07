# Implementation summary: radar_pulse (feature 4)

**Status after this work**: implementation complete, ready for review (leader
to move `feature_list.json` status to `reviewing`). Feature 4 is left at
`in_progress`; nothing in `feature_list.json` was edited.

`sdd: false` — no `specs/004-*` folder and no `tasks.md`, by design. The brief
is the `feature_list.json` entry plus `docs/business/landing/design-extract.md`
§ 2 and `ui-map.md` § *Receta del ping del radar* / § *Movimiento reducido*.

`./init.sh` exits **0**, 8/8 checks green, 19 `[OK]`, no `[WARN]`, no `[FAIL]`.

> This file describes the delivered state only. A first pass built the ping on
> top of the two halo rings; Roberto clarified on 2026-09-06 that the halos are
> the designer's static drawing *of this animation*, corrected both source
> documents, and the component was reworked against them. What follows is the
> corrected understanding, not a changelog of the wrong one.

---

## What shipped

**A radar is a red dot and its ping. There are no halo rings.**

The `.pen` draws three concentric circles, but the two halos are how a static
mockup communicates a pulse — Pencil cannot animate. Rendering them *and* the
ping would put the drawn effect and the real effect on screen at the same
time: a dot with rings that also pulses. So `Radar.vue` now renders one red
dot inside an invisible reserved box, and a pseudo-element expands out of the
dot and fades, on a loop. Pure CSS, no script, no prop, no extra DOM node.

| Recipe (ui-map.md § Receta del ping del radar) | Where it lives |
|---|---|
| At rest: only the red dot, centred in its footprint | `Radar.vue` template — two elements total |
| Animate a pseudo-element the size of the dot | `.ping::before` with `inset: 0` on the dot |
| `scale(1)` → `scale(3)` | `@keyframes radar-ping` in `global.css` |
| opacity `0.6` → `0` | `@keyframes radar-ping` |
| 2.4s, `ease-out`, `infinite` | `animation: radar-ping var(--duration-radar-ping) ease-out infinite` |
| `red-400` at low opacity | `background: var(--red-400)`, attenuated by the 0.6 → 0 ramp — see judgement call 2 |
| Footprint preserved (20 / 30 / 22) | the outer element, `size-radar-{sm,md,alt}` |

The ping overshoots the footprint (7→21, 12→36, 10→30), which is what reads as
a radar sweep rather than as a halo.

### Files

Modified — 4, no file created or deleted:

- `app/assets/css/global.css` — one `:root` token added, five dead tokens
  removed, one document-level `@keyframes` added.
- `app/shared/ui/Radar.vue` — rewritten: two elements instead of three, a
  scoped `<style>` block, and a docblock that records why the halos are absent.
- `app/shared/ui/Radar.stories.ts` — three stories added (`Ping`,
  `ReducedMotion`, `Footprint`) and review instructions in the meta docblock.
- `app/shared/ui/Radar.test.ts` — rewritten against footprint + dot.

No page, layout, feature module, i18n key, route, dependency or other
component was touched. `Pill.vue` is unchanged and `Pill.test.ts` still passes
unmodified — it asserts `size-radar-sm` on the Radar root, which is exactly
the footprint that was preserved.

### Tokens

Added to `:root`: `--duration-radar-ping: 2.4s`.

Removed as dead code (Article VIII), after grepping the whole tree for
consumers and finding only `Radar.vue` and `Radar.test.ts`:

| Removed | Was |
|---|---|
| `--color-radar-halo-outer` | outer halo fill, red-400 @12% |
| `--color-radar-halo-mid` | middle halo fill, red-400 @30% |
| `--spacing-radar-sm-halo` / `-md-halo` / `-alt-halo` | 14 / 20 / 16 halo diameters |

The three footprint tokens and the three dot tokens stay, and no token *value*
changed. The only surviving references to the halos anywhere in the repo are
in `specs/002-primitive-ui-layer/` and `impl_primitive_ui_layer.md`, which are
the historical record of a `done` feature and were deliberately left alone.

## Judgement calls

### 1. The ping hangs off the dot, not off the footprint

`.ping::before` is a pseudo-element of the dot with `inset: 0`, so it is the
dot's diameter at every size and expands from the dot's centre — the recipe's
"un pseudo-elemento del tamaño del punto". The alternative, keeping it on the
footprint element, would have meant feeding the dot diameter in as a
per-size custom property or inline style, i.e. carrying the same measurement
twice. This way the component states each measurement once.

Consequence worth knowing: the ghost paints *over* the dot rather than behind
it. That is harmless here and was checked deliberately — both are
`var(--red-400)`, so red over red leaves the dot looking untouched, and at
`scale(1)` the ghost covers the dot exactly, which is why the loop appears to
start from nothing. No `z-index`/`isolation` juggling was needed, and none is
present.

### 2. The ping's colour is `var(--red-400)`, attenuated by the animation

ui-map.md gives the colour as "`red-400` a baja opacidad" and, separately, the
opacity as `0.6` → `0`. Read strictly, that is two attenuations; the ghost
would peak somewhere under 10% red over Ink 500 and barely register, which
defeats "lectura de barrido de radar".

So the background is plain `var(--red-400)` and the low opacity is delivered
by the `0.6 → 0` ramp: it peaks at 60% and spends most of the loop well below
that. This invents no number — every value in the animation comes from the
recipe — whereas picking a fixed "low" alpha would have meant inventing a
percentage with no design source.

**This is the one thing to eyeball.** If the ping reads too strong, the fix is
one declaration: give the pseudo-element a `color-mix` of `--red-400` instead.
Flagged rather than decided, because it is a visual judgement.

Note this keeps the R18 pattern the coordinator asked for: `--red-400` is a
`:root` ramp name. Per `rules.md` **R18** the `--color-*` theme names do not
exist at runtime — `@theme inline` inlines them into utilities and emits no
custom property — so `var(--color-red-400)` in a hand-written CSS block would
look right in Storybook and paint nothing in production.

### 3. The duration token lives in `:root`, next to `--stroke-led`

`--duration-radar-ping: 2.4s` sits in `:root` in `global.css`, the convention
`BotonPrimario` already established for a non-colour, non-spacing animation
value. Retuning the ping is one line of `global.css` and no markup.

The 2.6s of the LED ring was deliberately **not** tokenised alongside it and
not touched: its comment says 2.6s is quoted verbatim from `design-extract.md`
§ 4, whereas 2.4s is an implementation choice with no design source. The token
comment records that the two are kept apart on purpose so the loops do not
drift into phase.

### 4. The keyframes are document-level, in `global.css`

`@keyframes radar-ping` sits beside `@keyframes led-spin`, for the reason
already documented there: a document at-rule, declared once even though the
radar renders 19 times. Only the `animation` shorthand is in the component.

### 5. Reduced motion withdraws the ghost rather than pausing it

`@media (prefers-reduced-motion: reduce) { .ping::before { content: none } }`.
`animation: none` alone would leave a frozen ring sitting on the dot at full
strength — a visible artefact, not a neutral fallback. `content: none` means
the pseudo-element is never generated, so what remains is the red dot, visible
and complete: the dot is the marker, the ping is the ornament, and nothing is
lost. Defence in depth: the base rule also sets `opacity: 0`, so the ghost
cannot show if the animation fails to run for any other reason.

### 6. `pointer-events: none`

The ring grows to 3× and overflows the footprint. Inside a Pill that is a
transparent disc up to 21px wide sitting over the label; it must never
intercept a pointer.

### 7. The `-core` token name was kept

The design file calls the circle `dot`; the tokens have been
`--spacing-radar-*-core` since feature 002. The component's field is named
`dot` and a comment states the two names mean the same circle. Renaming three
tokens would churn a done feature's documented contract for no behavioural
gain (Article VIII: no over-engineering).

## Tests

`Radar.test.ts` is rewritten around footprint + dot. Nine cases: two per size
plus three general.

- `should centre the dot in its reserved footprint when size is <size>` — the
  outer element carries `size-radar-{sm,md,alt}` and the dot carries its
  `-core` token. This is the regression guard for the layout: the Pill and the
  section grids are measured against the footprint, so if it ever collapses to
  the dot, 19 instances reflow silently.
- `should hang the ping on the dot and add no node of its own when size is
  <size>` — the `ping` hook is on the **dot**, and the tree is exactly two
  nested elements. The node count is the real assertion: it fails the moment
  someone re-adds the halo circles, or re-implements the ping as a real
  element or with JavaScript.
- `should render only the red dot, and no halo ring, when mounted` — the dot
  is `bg-red-400` and the rendered markup contains no `halo` anywhere. A blunt
  assertion on purpose: it is the one that fails if the misreading returns.

Deliberately **not** asserted: the animation shorthand, the duration string,
the keyframe values or the media query. happy-dom applies no stylesheet, so
such a test would only read back a string this same commit wrote.

`pnpm test`: **66 tests in 9 files**, all passing (was 63 before the feature).

## Verification performed

- **Compiled scoped CSS**, read out of `storybook-static/assets/Radar-*.css`:
  `.ping[data-v-…]::before` with `content:""`, `border-radius:inherit`,
  `background:var(--red-400)`, `opacity:0`, `pointer-events:none`,
  `animation:radar-ping var(--duration-radar-ping) ease-out infinite`,
  `position:absolute`, `inset:0`, and
  `@media (prefers-reduced-motion:reduce){.ping[data-v-…]::before{content:none}}`.
  Nothing else. **Zero JavaScript.**
- **Emitted keyframes**, from `.output/public/_nuxt/entry.*.css`:
  `@keyframes radar-ping{0%{opacity:.6;transform:scale(1)}to{opacity:0;transform:scale(3)}}`
  — the recipe values exactly.
- **Emitted token**: `:root{--duration-radar-ping:2.4s}`, present in the site
  build and not only in Storybook.
- **Dead tokens really are gone**: zero occurrences of `radar-halo` in the
  site build *and* in the Storybook build, and zero references anywhere in
  `app/`.
- **No hardcoded values in the component**: `Radar.vue` contains no hex, no
  `px`, no `rem`, no arbitrary Tailwind value. Every literal is a token name
  or a class name.
- **All three sizes**: the ghost is `inset: 0` on the dot, so it inherits
  `size-radar-{sm,md,alt}-core` with no size-specific rule. Asserted
  structurally per size and shown side by side in the `Ping` story.

## Stories

- `Ping` — the three sizes with room around them so the ring stays legible as
  it passes the footprint edge. Notes that the three loops are independent and
  run out of phase, as the 19 page instances will.
- `Footprint` — the reserved box outlined, so the invisible 20/30/22 and the
  dot's centring can be checked at once. The outline is a review aid in the
  story and exists nowhere in the component.
- `ReducedMotion` — follows the pattern `BotonPrimario.stories.ts` set: the
  setting cannot be forced from a story, so the story carries the OS
  instructions and the pass condition (ping gone, no frozen ring, dot still at
  full strength).
- The four existing stories are unchanged; the meta docblock now states that
  concentric circles at rest are the bug.

## Not done, deliberately

- **No visual confirmation in a browser.** Everything above was verified from
  the emitted CSS, not with eyes on a moving radar. Whether 2.4s reads as a
  heartbeat, and whether the ping at 60% peak red is right (judgement call 2),
  are visual questions. This plus judgement call 2 is the open work for the
  reviewer.
- **The 🟡 flag on the duration in `ui-map.md` was left in place.**
  Implementing the ping is not Clau approving 2.4s, and clearing a
  pending-approval marker because the code now exists would misrepresent an
  approval.
- **`specs/002-primitive-ui-layer/` was not rewritten.** `data-model.md` and
  `research.md` still describe the three-ring radar. They are the record of
  what feature 002 shipped, and the correction is now carried by
  `design-extract.md` § 2 and `ui-map.md`, which are the live sources.
- No prop to switch the ping off. All 19 instances pulse or none do —
  ui-map.md is explicit that animating some and not others breaks the section
  marker's coherence.
- No change to `Pill.vue` or any other consumer.
- `rules.md` was not appended to. Nothing here is a new cross-cutting rule;
  the one that applied (R18) already existed and is cited above.

## Gates

| Gate | Result |
|---|---|
| `pnpm check` | pass (exit 0; the same 4 expected `info`, per R20) |
| `pnpm typecheck` | pass |
| `pnpm test` | pass — 66 tests, 9 files |
| `pnpm generate` | pass — 8 routes prerendered |
| `pnpm storybook:build` | pass |
| `./init.sh` | **exit 0**, 8/8 checks, 19 `[OK]`, no `[WARN]`/`[FAIL]` |
