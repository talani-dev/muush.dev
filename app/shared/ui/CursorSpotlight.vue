<script setup lang="ts">
/**
 * CursorSpotlight — the dots of the paper near the pointer turn red, fading
 * with distance back to the normal dot (`ui-map.md` § 10, row 1; feature 34,
 * amendment A2, Roberto 2026-10-14).
 *
 * **No light of its own.** Until A2 this layer also painted a red glow (two
 * concentric radial fields from frame `gViAx` "DEMO spotlight cursor"); Roberto
 * removed it entirely (A2-1). What remains is a second copy of the
 * dotted-paper recipe in `--dot-paper-lit-color` (red-400 at full opacity,
 * A2-2), clipped by a linear radial mask of radius `--spotlight-lit-radius`
 * (≈120px, A2-3). Frame `gViAx` still draws the two circles: that is a recorded
 * human divergence from the design file, not a correction of it.
 *
 * **No props and no imports, both deliberate.** There is one spotlight in the
 * design, at one size, with one recipe — a `size`, `colour` or `enabled` prop
 * would invent a system the design does not have (Article VIII), and `DotGrid`
 * set the precedent. The component calls no composable either: one that did
 * would attach window listeners inside every story that rendered it and could
 * not be pinned at a fixed position at all (`rules.md` § R23's corollary).
 * Everything that moves arrives as three inherited custom properties —
 * `--spotlight-x`, `--spotlight-y`, `--spotlight-opacity` — each with a
 * fallback, so anything that can set a custom property can drive it:
 * `useCursorSpotlight` at runtime, a story's wrapper at rest.
 *
 * ## Four things here are load-bearing
 *
 * 1. **`overflow: clip` on the root.** Without it a beam near the end of the
 *    page (under the footer) extends the document's scrollable height and the
 *    page grows as the visitor moves the mouse down (FR-019, SC-006). `clip`
 *    and not `hidden`, for the reason feature 006 gives in the layout:
 *    `hidden` on one axis coerces the other to `auto` and turns the page into
 *    a scroll container.
 * 2. **The mask is static.** It lives on the window, which the beam carries.
 *    A mask positioned by a custom property repaints its layer every frame,
 *    and the entire point of this structure is that nothing repaints
 *    (`research.md` § R2).
 * 3. **The lit sheet cancels the beam's page origin, modulo the dot step.**
 *    That is what keeps the second dot pattern on the same 24px grid as the
 *    base sheet at every pointer position and every scroll offset (FR-006).
 *    Without it the pattern travels with the pointer and lands at an arbitrary
 *    sub-step offset — visibly doubled dots.
 * 4. **No blend mode.** The red lit dots composite normally over the base
 *    dots, so the dot under the pointer renders exactly red-400. The original
 *    argument against `screen` / `plus-lighter` was about the glow over the
 *    dots and is moot since A2, but the rule stands.
 *
 * **What it needs from its host**: the same positioned, full-document,
 * single-stacking-context ancestor `DotGrid` requires — `app/layouts/default.vue`'s
 * root — which must also be the element `useCursorSpotlight` publishes to, so
 * the coordinates and this layer's coordinate space agree.
 *
 * Decorative and inert: announced to nobody, never intercepting a pointer,
 * never focusable, absent from print.
 *
 * ---
 *
 * ## ⚠️ Recorded exception to Article V's 200-line limit
 *
 * This file is over it. **Do not "fix" that by extracting sub-components.**
 * Non-comment, non-blank lines are ~90 (~110 before feature 34's A2 removed the
 * glow); the excess is this documentation and
 * the reasoning in the `<style>` block, which is deliberate — three of the four
 * declarations here are load-bearing in ways that fail *silently* when changed,
 * and the measurements behind them are the whole evidence for this feature.
 *
 * Article V's remedy clause ("extract sub-components if they grow past that")
 * names the cure, which is what identifies the disease as **structural**
 * complexity. There is none to extract: root → beam → window → lit is one
 * indivisible geometric mechanism, and splitting it would break the
 * custom-property inheritance chain that `--spotlight-beam-*` depends on —
 * turning a documented file into a broken one.
 *
 * Judged non-blocking by the reviewer on 2026-09-07 and recorded in
 * `plan.md`'s Complexity Tracking table, per the Constitution's
 * *Compliance Review* ("a violation MUST be justified... no exception is valid
 * without an explicit record"). `plan.md` line 111 had estimated ~90 lines; the
 * built file does not bear that out, and this note is the correction.
 */
</script>

<template>
  <div
    aria-hidden="true"
    class="cursor-spotlight pointer-events-none absolute inset-0"
  >
    <div class="cursor-spotlight__beam">
      <div class="cursor-spotlight__window">
        <div class="cursor-spotlight__lit" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * The third negative level, above the dot sheet and below every piece of
 * content (docs/business/rules.md §§ R28, R37). It is a sibling of the dot
 * sheet and never an ancestor of a section, so nothing § R28 asks of a section
 * changes.
 */
.cursor-spotlight {
  /* Component-local, not a token: the beam's side, two lit radii. */
  --spotlight-size: calc(2 * var(--spotlight-lit-radius));

  z-index: var(--layer-spotlight);
  /* See doc comment, point 1. Removing this makes the page grow as the
     pointer approaches the footer. */
  overflow: clip;
  opacity: var(--spotlight-opacity, 1);
  transition: opacity var(--duration-spotlight-fade) ease-out;
}

/*
 * The moving part, and the only thing that moves: one `translate3d` driven by
 * two custom properties, so a frame costs a style resolution and a composite
 * rather than a repaint of a page-sized layer (`research.md` § R2). It paints
 * nothing itself since A2: it only carries the mask and the lit sheet.
 *
 * The negative margins put the beam's *centre* on the published coordinates —
 * the pointer hotspot.
 *
 * The fallback is a length (`--spotlight-size`) and not the `50%` the
 * component contract first specified, and the reason is **not** that `mod()`
 * rejects a percentage — it does not. Measured in Chrome:
 * `CSS.supports('transform', 'translate3d(calc(-1 * mod(calc(50% - 330px),
 * 24px)), 0px, 0)')` is `true`, and a forced `50%` fallback produces valid
 * matrices on both elements, never `none`.
 *
 * The real defect is that **a percentage resolves against each element's own
 * box**, and the two elements that read `--spotlight-beam-*` are different
 * sizes: the beam, and the lit sheet (the beam plus two dot steps of bleed on
 * every side). So the same `50%` resolves to two different lengths, and the
 * two halves stop agreeing on where the beam is. A length is one number
 * everywhere.
 *
 * Measured with `--spotlight-x` removed so the fallback is what runs, at the
 * ORIGINAL feature 008 size (beam 660px, lit sheet 756px) — before feature 26
 * halved it and before A2 replaced it with `--spotlight-lit-radius`:
 *
 * | fallback | beam translate | lit translate | correct |
 * |---|---|---|---|
 * | `50%` | 330 | 0 | 0 — agrees **by luck** |
 * | `55%` | 363 | −13.8 | −9 — **wrong by 4.8px** |
 * | the size token | 660 | −18 | −18 ✓ |
 *
 * `50%` only looked correct because 378 − 330 = 48 is exactly two dot steps,
 * so the `mod()` cancels the disagreement; `55%` gives 415.8 − 330 = 85.8 and
 * it does not. The **argument** is scale-invariant; the digits are historical
 * and were not re-measured at the current size. The path is unreachable in
 * production — the `v-if` needs a published position and the pinned story
 * sets one — so this is latent, and recorded here so it stays that way.
 */
.cursor-spotlight__beam {
  --spotlight-beam-x: calc(
    var(--spotlight-x, var(--spotlight-size)) -
    0.5 *
    var(--spotlight-size)
  );
  --spotlight-beam-y: calc(
    var(--spotlight-y, var(--spotlight-size)) -
    0.5 *
    var(--spotlight-size)
  );

  position: absolute;
  top: 0;
  left: 0;
  width: var(--spotlight-size);
  height: var(--spotlight-size);
  margin-top: calc(-0.5 * var(--spotlight-size));
  margin-left: calc(-0.5 * var(--spotlight-size));
  transform: translate3d(
    var(--spotlight-x, var(--spotlight-size)),
    var(--spotlight-y, var(--spotlight-size)),
    0
  );
  will-change: transform;
}

/*
 * The static mask, carried by the beam and never repositioned. Alpha falls
 * linearly from 1 at the hotspot to 0 exactly at `--spotlight-lit-radius`, so
 * the red fades back to the normal dot and no hard circular edge appears in
 * the paper (feature 008 FR-008; feature 34 A2-3).
 *
 * `no-repeat` is not optional: `mask-repeat` defaults to `repeat`, which would
 * tile the falloff across the box and light dots in a grid of circles. It is
 * also what clips the lit sheet's deliberate overflow below.
 *
 * The mask's black carries no design meaning — only its alpha is read, the
 * same convention `BotonPrimario.vue` uses for the LED ring.
 */
.cursor-spotlight__window {
  position: absolute;
  inset: calc(-1 * var(--dot-paper-step));
  -webkit-mask-image: radial-gradient(
    circle var(--spotlight-lit-radius) at center,
    black 0%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle var(--spotlight-lit-radius) at center,
    black 0%,
    transparent 100%
  );
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

/*
 * The second dot sheet — the same recipe `DotGrid` paints, resolving the same
 * `--dot-paper-radius` and `--dot-paper-step`, so the two patterns can never
 * drift apart, including when the visitor enlarges the root font size (FR-009).
 * Only the colour differs: `--dot-paper-lit-color` is red-400 (feature 34,
 * A2-2, Roberto 2026-10-14), painted over the base dot.
 *
 * The counter-translate is the registration (doc comment, point 3): cancelling
 * the beam's page origin *modulo* the step lands this pattern on the same grid
 * as the page-wide sheet, at every pointer position and every scroll offset,
 * while keeping the layer two lit radii plus four steps square instead of
 * page-sized
 * (`research.md` § R3). `mod()` takes the sign of its divisor, so the shift is
 * always between zero and one step *back* — which is why this sheet is a
 * further step larger than its window on every side, and why the window's
 * `no-repeat` mask is what hides the surplus.
 */
.cursor-spotlight__lit {
  position: absolute;
  inset: calc(-1 * var(--dot-paper-step));
  transform: translate3d(
    calc(-1 * mod(var(--spotlight-beam-x), var(--dot-paper-step))),
    calc(-1 * mod(var(--spotlight-beam-y), var(--dot-paper-step))),
    0
  );
  will-change: transform;
  background-image: radial-gradient(
    var(--dot-paper-lit-color) var(--dot-paper-radius),
    transparent var(--dot-paper-radius)
  );
  background-size: var(--dot-paper-step) var(--dot-paper-step);
}

/*
 * Belt and braces. `useCursorSpotlight` never mounts the element in any of
 * these cases, so none of the three should ever be reached — they exist so a
 * future miswiring cannot make a desktop-only, motion-sensitive decoration
 * appear where `ui-map.md` says it must not. Two independent mechanisms for
 * one accessibility requirement is proportionate: § *Movimiento reducido*
 * lists the spotlight first. Precedent: `Radar.vue`, `BotonPrimario.vue`.
 */
@media (prefers-reduced-motion: reduce) {
  .cursor-spotlight {
    display: none;
  }
}

@media not (hover: hover) {
  .cursor-spotlight {
    display: none;
  }
}

@media print {
  .cursor-spotlight {
    display: none;
  }
}
</style>
