<script setup lang="ts">
import {
  type ConnectorEndpoints,
  connectorFloatVars,
} from '@/features/landing/data/servicesContent'

/**
 * The four thin lines between the five desktop Services radars. Extracted
 * from `ServicesConstellation.vue` by feature 34, so the float CSS has a home
 * and both files stay under 200 lines (Article V).
 *
 * Each `<line>`'s `x1/y1/x2/y2` are the resting ends from
 * `connectorEndpoints(SERVICE_NODE_CENTRES)`; SVG geometry attributes cannot
 * be animated from CSS (Biome's `noUnknownProperty` rejects them as CSS
 * declarations). The float moves each line instead with a CSS `transform`
 * computed from the SAME clock and the SAME formula as the two nodes it
 * joins — see the `<style scoped>` note — so a line end cannot leave its
 * radar in any frame (spec FR-008). The per-line inputs arrive as inline
 * custom properties (`connectorFloatVars`), never as literals.
 *
 * Each `<svg>` spans the constellation's `.frame` horizontally and the
 * 910-unit frame height vertically, with `preserveAspectRatio="none"`: one
 * user unit is one `--services-unit-x` along x and one `--services-frame-px`
 * along y — exactly the two units the radars are positioned in (feature 38),
 * so the line ends stay on the radars at every canvas width. (OA-3 had sized
 * it to the fixed 1440 frame because a uniformly meet-scaled SVG drifted off
 * radars that did not scale; now both scale the same way, x only.)
 * `overflow: visible` keeps the clip where it already was, on the layout root.
 */
interface Props {
  connectors: ConnectorEndpoints[]
}

const { connectors } = defineProps<Props>()
</script>

<template>
  <!--
    One frame-sized <svg> per line, on purpose: the shear is a CSS transform
    on the OUTER <svg> box, never on the <line>. Chromium re-runs SVG layout
    on every frame in which an SVG child's transform changes; an outer <svg>
    is a CSS box, so changing its transform is paint-only, like `.node`'s
    `translate` (spec FR-007 — measured, see the implementation report).
  -->
  <svg
    v-for="(connector, index) in connectors"
    :key="index"
    aria-hidden="true"
    viewBox="0 0 1440 910"
    preserveAspectRatio="none"
    class="connector pointer-events-none absolute top-0 left-0"
    :style="connectorFloatVars(connector, index)"
  >
    <line
      :x1="connector.x1"
      :y1="connector.y1"
      :x2="connector.x2"
      :y2="connector.y2"
      class="line"
    />
  </svg>
</template>

<style scoped>
/*
 * Why a shear (research R1). The float is vertical only, so a line's two
 * ends move by the offsets of the two nodes it joins, `dyA` and `dyB`, and
 * keep their x. That is exactly the affine map
 *   y' = y + slope·x + shift,  slope = (dyB − dyA) / (x2 − x1),
 *                              shift = dyA − slope·x1
 * which sends (x1, y1) to (x1, y1 + dyA) and (x2, y2) to (x2, y2 + dyB), all
 * in design units. `dyA` / `dyB` are the same expression as `.node`'s offset
 * in `ServicesConstellation.vue`, against the same inherited clock.
 *
 * On screen x is scaled by `--services-unit-x` and y by `--services-frame-px`
 * (feature 38). `shift` is a pure y quantity, so it only needs the y unit;
 * the on-screen slope is `(dyB − dyA)·frame-px / ((x2 − x1)·unit-x)`, and
 * `skewY(atan2(rise, run))` takes it as two lengths — no typed division.
 * At 1440 both units are 1px and this is the pre-feature 38 `atan(slope)`.
 * All four lines have x2 ≠ x1, so the run is never zero.
 */
.connector {
  --dy-a: calc(
    var(--services-float-amplitude) *
    sin(
      var(--services-float-phase) +
      var(--i-a) *
      var(--services-float-phase-step)
    )
  );
  --dy-b: calc(
    var(--services-float-amplitude) *
    sin(
      var(--services-float-phase) +
      var(--i-b) *
      var(--services-float-phase-step)
    )
  );
  --slope: calc((var(--dy-b) - var(--dy-a)) / (var(--x2) - var(--x1)));
  --shift: calc(var(--dy-a) - var(--slope) * var(--x1));

  width: 100%;
  height: var(--services-canvas-h);
  overflow: visible;
  transform-origin: 0 0;
  transform: translate(0, calc(var(--shift) * var(--services-frame-px)))
    skewY(
      atan2(
        calc((var(--dy-b) - var(--dy-a)) * var(--services-frame-px)),
        calc((var(--x2) - var(--x1)) * var(--services-unit-x))
      )
    );
}

/*
 * `non-scaling-stroke`: the hairline stays exactly `--services-link-w` on
 * screen under the non-uniform x/y scale and at any root font size, matching
 * the mobile spine's HTML hairline.
 */
.line {
  stroke: var(--services-link-color);
  stroke-width: var(--services-link-w);
  vector-effect: non-scaling-stroke;
}
</style>
