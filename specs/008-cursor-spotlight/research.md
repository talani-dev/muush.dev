# Research: Cursor spotlight

**Feature**: `specs/008-cursor-spotlight` | **Date**: 2026-09-07

Eight questions had to be settled before the plan could be written. Six were
answered from the repository, from the design file (through the leader) or
from arithmetic; two end in a **verification obligation** on the implementer,
which this repository treats as a first-class answer rather than a gap
(`rules.md` §§ R25, R31, R34: the question is what the tool recorded).

---

## R1 · Where must a layer sit if it is to brighten the dots?

**Decision**: above the dot sheet, on a new third negative level, painting a
second copy of the dot recipe clipped to the spotlight's radius.

**The constraint.** Feature 6 shipped one page-wide dot sheet at
`--layer-dots` above the section glows at `--layer-glow`, inside the layout
root's single stacking context. `ui-map.md:271` asks for the dots inside the
radius to brighten. The dot sheet is frozen (spec FR-018), so the brightening
has to come from somewhere else.

**The arithmetic that decided it.** Working in 8-bit grey over `ink-500`
(`#262626` = 38), with the dot at `ink-100` (`#D9D9D9` = 217) at 12%:

| Situation | Dot pixel | Local background | Gap |
|---|---|---|---|
| Outside the radius (today) | `0.12·217 + 0.88·38` = **59** | 38 | **21** |
| Under a 42% red light, base dots only | `0.58·59 + 0.42·207` = **121** R | `0.58·38 + 0.42·207` = **109** R | **12** |
| Under the light, plus a second dot sheet | `0.88·121 + 0.12·217` = **133** R | 109 R | **24** |

So a plain translucent light *veils* the dots (21 → 12): the requirement is
not satisfied by the glow alone, which is why § 271 exists as a separate
sentence. The second sheet restores and exceeds the gap (24) while raising
absolute brightness, which is both halves of "suben de brillo".

**Rejected, with reasons.**

- **`mix-blend-mode: screen`.** With light `R`, dot `D` and background `B`,
  the gap becomes `(1−R)(D−B)` — strictly *smaller* than `D−B`. It makes the
  dots less visible, which is the opposite of the requirement.
- **`mix-blend-mode: plus-lighter`.** Additive, so the gap is preserved
  exactly and everything gets brighter. The closest miss. Rejected because
  § 271 singles out the dots — if a uniform lift were the intent, the glow
  already provides it — and because frame `gViAx` records **no blend mode** on
  either circle, so a blend mode is a departure from the drawing. It also
  forces the browser to re-blend the backdrop region every frame, which is
  paint work (see R2).
- **Putting the spotlight below the dots.** Needs no amendment to § R28 and
  still produces the brightening — two sheets of the same colour at the same
  positions give the same final pixel in either order, since `1−(1−a)(1−b)` is
  symmetric. Rejected because the *light* would then sit under section glows
  of up to 65% opacity in the Hero and CTA, exactly where the page is
  brightest, while the frame draws the circles over the page.
- **Re-tuning `DotGrid.vue` to accept a brightness prop.** Rejected by spec
  FR-007/FR-018 and by Article VIII: it would invent a variant system for one
  consumer and change a `done` contract.

**Consequence**: `rules.md` § R28 gains a third level. There is no integer
between `−1` and `0`, so the two existing values shift to `−3` / `−2` and
`--layer-spotlight` takes `−1`. Both keep their token names, so no consumer
changes — that is the whole reason feature 6 made them tokens.

---

## R2 · How does it move without repainting?

**Decision**: one `transform: translate3d()` on the beam, driven by two custom
properties. Everything else in the layer is static.

Four ways to move a radial field were considered, and only one keeps the
per-frame work off the paint path:

| Technique | Per-frame work |
|---|---|
| `background-position` on a page-sized element | repaint of the whole layer — a 1440×5060 page is not affordable |
| `radial-gradient(… at var(--x) var(--y) …)` on a page-sized element | same: the gradient is part of the element's paint |
| `mask-position` following the pointer | repaint of the masked layer every frame |
| **`transform: translate3d()` on a small box** | **style resolution + composite; the layer's raster is reused** |

This is why the mask lives on a *static* inner window that the beam carries,
rather than on the layer itself: a mask whose position is a custom property is
back in the third row of that table.

**The honest caveat.** A custom-property change is not a compositor animation:
it triggers a style recalculation, and the browser then updates the transform
node. Browsers do this without repainting the layer's contents, but that is a
statement about implementations, not about the spec — so spec A-11 makes it a
**measurement**, not an assumption. `quickstart.md` § 5 says what to record.

`will-change: transform` goes on the beam and the lit sheet — the two elements
that move — and nowhere else. It creates a stacking context, which is harmless
there (both are inside the spotlight root and neither sits between a section's
glows and the layout root, so `rules.md` § R28 is untouched).

---

## R3 · How do the lit dots stay registered with the base grid?

**Decision**: the lit sheet cancels the beam's page origin **modulo the dot
step**, using CSS `mod()`, and is inset by one step on every side so the
cancellation can never uncover an edge.

The lit sheet is a child of the moving beam, so without a counter-transform
its pattern travels with the pointer and lands at an arbitrary sub-24px offset
from the base sheet — **doubled dots**, the failure spec FR-006 names.

Two ways to cancel:

| Option | Element size | Cost |
|---|---|---|
| **A** · cancel to the document origin: `translate3d(calc(-1 · x), calc(-1 · y), 0)` | must span the whole page (1440×5060 ⇒ a ~29 MB worst-case layer, tiled) | exact, no modern-CSS dependency, big layer |
| **B** · cancel modulo the step: `translate3d(calc(-1 · mod(beamOriginX, step)), …, 0)` | beam + one step of bleed (708×708) | exact, small layer, needs CSS `mod()` |

**B is chosen.** The beam's page origin is `var(--spotlight-x) −
var(--spotlight-outer-size) / 2`, so the expression is derivable in CSS
alone and never needs the step's value in JavaScript — which matters, because
the step is `1.5rem` and a JS copy would be both a magic number and wrong the
moment the visitor changes their text size (spec A-10).

`mod()` is CSS Values 4 and has shipped in all three engines (Safari 15.4,
Firefox 118, Chromium 125-era). **Verify it resolves rather than trusting this
paragraph** — `quickstart.md` § 4 says how. If it does not, the fallback is
option A's arithmetic performed in the composable and published as two more
custom properties, which costs the step being read once from the computed
style instead of being known by CSS.

---

## R4 · Viewport coordinates or page coordinates?

**Decision**: page coordinates (`clientX + scrollX`), reduced to
**host-relative** coordinates by subtracting the layout root's page offset,
measured once.

Both forms need a scroll listener — one to move the light, the other to keep
the lit dots registered — so the choice is not about listener count. It is
about what a dropped frame looks like:

- **Page coordinates**: the whole effect trails the cursor for one frame.
  Reads as softness.
- **Viewport coordinates**: the light is exact, but the lit sheet is
  misregistered against the base sheet by whatever the scroll moved. Reads as
  **doubled dots** — a defect.

The host offset is measured with one `getBoundingClientRect()` at activation
and on resize, never in the hot path. It should be `(0, 0)`: the layout root
is the first child of `<body>`, Tailwind's preflight zeroes the body margin,
and `DotGrid`'s own `inset-0` origin is the same box. It is subtracted anyway,
because "should be" is not "is", and because the correction costs one
subtraction per frame against a permanent class of alignment bug.

---

## R5 · What may the new tokens be called?

**Decision**: `--spotlight-*` (and one `--dot-paper-lit-color`). **Never**
`--color-glow-*` or `--spacing-glow-*` — and, for the same class of reason,
not `--color-spotlight-*` or `--spacing-spotlight-*` either: those two
prefixes read as Tailwind theme entries, and these nine tokens live in
`:root` because hand-written CSS consumes them (`rules.md` § R18).

This is not a style preference. `app/shared/ui/SectionGlow.test.ts` builds

```ts
globalCss.matchAll(/--(?:color|spacing)-glow-[\w-]+(?=\s*:)/g)
```

and then asserts, in *both* directions, that every token matching those
prefixes is reachable through `SectionGlow`'s props and that every prop
combination names a declared token. A spotlight token called
`--color-glow-red-400-42` would be unreachable through those props by
construction, and

```
should leave no glow token in global.css unreachable …  ✗
```

would fail in a file this feature never opens. That test is right and should
not be relaxed: it is what keeps the twelve hand-tuned pairs honest. The
correct reading is that `glow` is a **closed namespace owned by
`SectionGlow`**, and this finding is appended to `rules.md` so the next
feature that adds a radial token does not rediscover it the hard way.

The same test is why the spotlight is **not** built by widening
`SectionGlow`'s opacity unions (spec FR-004): three new members would be three
new tokens in that namespace *and* a change to a `done` contract. Its two-stop
recipe cannot express the mid stop at 0.42 in any case.

---

## R6 · How is a pointer composable tested under `happy-dom`?

**Decision**: stub `matchMedia` and `requestAnimationFrame`; assert on the
custom properties written to a detached element.

- **`matchMedia`**: `happy-dom` provides one, but not a controllable one. The
  test replaces it with a small factory (`vi.stubGlobal`) that returns
  `{ matches, addEventListener, removeEventListener, … }` per query string,
  so the two conditions can be set independently and a `change` event can be
  dispatched to prove FR-013's live update.
- **`requestAnimationFrame`**: replaced with a queue the test flushes by hand.
  That is what makes "one write per frame" assertable: dispatch twenty
  `pointermove` events, flush once, and count the writes. With the real rAF
  the assertion would be a timing race.
- **The subject of the assertions** is
  `host.style.getPropertyValue('--spotlight-x')` on a plain detached `<div>`
  passed to the composable as its host ref. No component is mounted, which is
  the point: the composable is testable because nothing about it is Vue-shaped
  except its disposal hook.
- **Scoped disposal**: `onScopeDispose` requires an active effect scope. The
  test wraps the call in `effectScope()` and calls `.stop()` to prove teardown
  removes every listener — the precedent `useMobileMenu.test.ts` set.

What this **cannot** test is that any of it looks right: `happy-dom` does no
styling and no painting, so a test that asserted a gradient or a stacking
order would pass against nothing (`rules.md` § R27 records that failure
happening for real). Those claims are verified in a browser — see R8.

---

## R7 · How does the effect stay out of the prerendered HTML?

**Decision**: `v-if` on a flag that is `false` during SSR and until the first
qualifying mouse event.

The composable returns `isActive`, initialised `false`. On the server nothing
runs, so the flag is `false` and the element is not rendered — **the no-JS
fallback is therefore mechanical, not a promise**, and it is verified the way
this repository verifies everything about the artifact: a grep over
`.output/public` (`rules.md` §§ R25, R31), added to
`tests/static-output.test.ts`.

It also solves two problems at once. The first client render agrees with the
server render, so there is no hydration mismatch; and because the flag flips
only on the first *event*, the page never paints a red blob at `(0, 0)` in the
corner before the pointer has moved (spec A-07).

The CSS media guards (`display: none` under reduced motion, under a
non-hovering pointer, and in print) are belt-and-braces: the composable would
never mount the element in those cases, and the guards make it impossible for
a future miswiring to make it visible anyway. Two independent mechanisms for
one accessibility requirement is proportionate — `ui-map.md` § *Movimiento
reducido* lists the spotlight **first**.

---

## R8 · What can only be verified in a browser?

**Decision**: five claims, each with a stated method, none of them a
screenshot.

`happy-dom` cannot paint, and a headless screenshot is not evidence of layout
in this repository (`rules.md` § R34: `--window-size` does not fix the layout
viewport, so a capture crops rather than reflows). What that leaves:

| Claim | Method |
|---|---|
| Paint order — light and lit dots above the dot sheet, below content | measured `z-index` / computed style through a same-width iframe, the method feature 6's review used |
| Registration — no doubled dots at any pointer position or scroll offset | compare the computed transform of the lit sheet against `beamOriginX mod step` at several positions, and look at the boundary |
| No layout, no paint per frame (spec A-11) | a recorded performance trace over five seconds of continuous movement |
| The document does not grow (SC-006) | `documentElement.scrollWidth/scrollHeight` with the pointer at the centre and at all four extremes |
| `mod()` resolves | read the computed `transform` of the lit sheet; an unsupported `mod()` invalidates the whole declaration and the transform reads `none` |

Every one of these is a measurement of the document or of the tool's own
record. None is "it looked right".
