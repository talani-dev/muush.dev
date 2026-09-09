<script setup lang="ts">
/**
 * CursorSpotlight — the soft red light that follows the pointer across the
 * whole page, and the lift it gives the dotted paper underneath
 * (`ui-map.md` § 10, row 1; frame `gViAx` "DEMO spotlight cursor").
 *
 * Two concentric radial fields: an outer field running red-400 42% → 17% at
 * 0.42 → transparent, and a core at 37%. Plus a second copy of the
 * dotted-paper recipe clipped to the same radius, which is what makes the
 * dots *inside* the light brighter **and more distinct** rather than merely
 * veiled (`ui-map.md:271`).
 *
 * ⚠️ **Sizing is a recorded human divergence from the frame (feature 26,
 * 2026-09-09), not the confirmed design measurement.** Frame `gViAx` draws
 * the outer field at 660px and the core at 180px — `--spotlight-core-size`
 * still matches that. `--spotlight-outer-size` was cut to roughly half of it
 * (330px) at Roberto's request: the effect read as "more than one gradient"
 * and too large, and he asked to shrink the bigger field while leaving the
 * smaller core untouched. This is a first calibration pass, not a final
 * value — see the token's own comment in `global.css` for the exact numbers
 * and for why a further pass only ever touches that one token.
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
 * 1. **`overflow: clip` on the root.** Without it a beam near the footer
 *    extends the document's scrollable height and the page grows as the
 *    visitor moves the mouse down (FR-019, SC-006). `clip` and not `hidden`,
 *    for the reason feature 006 gives in the layout: `hidden` on one axis
 *    coerces the other to `auto` and turns the page into a scroll container.
 * 2. **The mask is static.** It lives on the window, which the beam carries.
 *    A mask positioned by a custom property repaints its layer every frame,
 *    and the entire point of this structure is that nothing repaints
 *    (`research.md` § R2).
 * 3. **The lit sheet cancels the beam's page origin, modulo the dot step.**
 *    That is what keeps the second dot pattern on the same 24px grid as the
 *    base sheet at every pointer position and every scroll offset (FR-006).
 *    Without it the pattern travels with the pointer and lands at an arbitrary
 *    sub-step offset — visibly doubled dots.
 * 4. **No blend mode.** Frame `gViAx` records none on either circle, and both
 *    candidates were rejected with arithmetic in `spec.md` § *The
 *    dot-brightening decision*: `screen` *reduces* the dots' contrast, and
 *    `plus-lighter` raises brightness without raising distinctness, which is
 *    the half § 271 actually asks for.
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
 * Non-comment, non-blank lines are ~110; the excess is this documentation and
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
 * rather than a repaint of a page-sized layer (`research.md` § R2).
 *
 * The negative margins put the beam's *centre* on the published coordinates —
 * the pointer hotspot, which the frame's three states confirm is the shared
 * centre of both circles (spec A-04).
 *
 * The fallback is a length (`--spotlight-outer-size`) and not the `50%` the
 * component contract first specified, and the reason is **not** that `mod()`
 * rejects a percentage — it does not. Measured in Chrome:
 * `CSS.supports('transform', 'translate3d(calc(-1 * mod(calc(50% - 330px),
 * 24px)), 0px, 0)')` is `true`, and a forced `50%` fallback produces valid
 * matrices on both elements, never `none`.
 *
 * The real defect is that **a percentage resolves against each element's own
 * box**, and the two elements that read `--spotlight-beam-*` are different
 * sizes: the beam is 660px, the lit sheet is 756px (the beam plus two dot steps
 * of bleed on every side). So the same `50%` is 330px where the light uses it
 * and 378px where the registration uses it, and the two halves stop agreeing
 * on where the beam is. A length is one number everywhere.
 *
 * Measured, with `--spotlight-x` removed so the fallback is what runs:
 *
 * | fallback | beam translate | lit translate | correct |
 * |---|---|---|---|
 * | `50%` | 330 | 0 | 0 — agrees **by luck** |
 * | `55%` | 363 | −13.8 | −9 — **wrong by 4.8px** |
 * | `--spotlight-outer-size` | 660 | −18 | −18 ✓ |
 *
 * `50%` only looks correct because 378 − 330 = 48 is exactly two dot steps, so
 * the `mod()` cancels the disagreement; `55%` gives 415.8 − 330 = 85.8 and it
 * does not. Relying on that coincidence is precisely the registration
 * fragility FR-006 exists to forbid. The path is unreachable in production —
 * the `v-if` needs a published position and the pinned story sets one — so this
 * is latent, and recorded here so it stays that way.
 *
 * ⚠️ The digits above (660/756/378/330/…) are historical: they were measured
 * when `--spotlight-outer-size` was 660px, before feature 26 (2026-09-09) cut
 * it to roughly half. The **argument** they demonstrate — a percentage
 * resolves against each element's own box, and the beam and the lit sheet are
 * different sizes — is scale-invariant and still holds at the new size; only
 * the specific numbers would change if this table were re-measured. Not
 * recomputed here to avoid introducing a transcription error into evidence
 * this comment depends on; re-measure before trusting the exact figures again.
 */
.cursor-spotlight__beam {
  --spotlight-beam-x: calc(
    var(--spotlight-x, var(--spotlight-outer-size)) -
    0.5 *
    var(--spotlight-outer-size)
  );
  --spotlight-beam-y: calc(
    var(--spotlight-y, var(--spotlight-outer-size)) -
    0.5 *
    var(--spotlight-outer-size)
  );

  position: absolute;
  top: 0;
  left: 0;
  width: var(--spotlight-outer-size);
  height: var(--spotlight-outer-size);
  margin-top: calc(-0.5 * var(--spotlight-outer-size));
  margin-left: calc(-0.5 * var(--spotlight-outer-size));
  transform: translate3d(
    var(--spotlight-x, var(--spotlight-outer-size)),
    var(--spotlight-y, var(--spotlight-outer-size)),
    0
  );
  will-change: transform;
  /*
   * The frame's two circles, the core listed first because a background layer
   * paints over the ones after it. Three stops on the outer field, not two:
   * the mid stop exists only in the design file and a two-stop gradient has a
   * visibly different falloff (spec § D-01).
   *
   * ⚠️ `--spotlight-stop-mid` is a gradient POSITION. That it also reads 42%
   * is a coincidence of digits with the centre's OPACITY above it.
   */
  background-image:
    radial-gradient(
      circle closest-side at center,
      var(--spotlight-red-400-37),
      transparent
    ),
    radial-gradient(
      circle closest-side at center,
      var(--spotlight-red-400-42) 0%,
      var(--spotlight-red-400-17) var(--spotlight-stop-mid),
      transparent 100%
    );
  background-position: center;
  background-repeat: no-repeat;
  background-size:
    var(--spotlight-core-size) var(--spotlight-core-size),
    100% 100%;
}

/*
 * The static mask, carried by the beam and never repositioned. Its radius is
 * the light's own radius, so the lit dots and the light end together and no
 * hard circular edge appears in the paper (FR-008).
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
    circle calc(0.5 * var(--spotlight-outer-size)) at center,
    black 0%,
    transparent 100%
  );
  mask-image: radial-gradient(
    circle calc(0.5 * var(--spotlight-outer-size)) at center,
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
 * Painting 12% twice is what puts a lit dot at 1 − (1 − 0.12)² = 22.6%
 * (`rules.md` § R38 — a DERIVED value, and the reason
 * `--dot-paper-lit-color` exists as a token rather than as a literal).
 *
 * The counter-translate is the registration (doc comment, point 3): cancelling
 * the beam's page origin *modulo* the step lands this pattern on the same grid
 * as the page-wide sheet, at every pointer position and every scroll offset,
 * while keeping the layer 708px square instead of page-sized
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
