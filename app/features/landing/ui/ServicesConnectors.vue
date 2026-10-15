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
 * Each `<svg>` is sized to the 1440×910 frame in rem rather than to the
 * canvas (OA-3). Below a 1440px viewport the canvas is narrower than the
 * frame, and a `size-full` SVG was meet-scaled into it while the radars kept
 * their rem positions: measured in Chrome 155 on the pre-feature build,
 * connector 1 started 21.7px off its radar at 1280px and the worst end was
 * 332px off at 1024px. With the SVG at the frame's own size, one user unit
 * is one design pixel (`--services-frame-px`) at every width and root font
 * size, the same unit the nodes are positioned in; `overflow: visible` keeps
 * the clip where it already was, on the layout root.
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
 * which sends (x1, y1) to (x1, y1 + dyA) and (x2, y2) to (x2, y2 + dyB). In
 * CSS: `translate(0, shift) skewY(atan(slope))` about the frame's origin,
 * since `tan(atan(slope)) = slope`. All four lines have x2 ≠ x1, so the
 * slope is always defined. `dyA` / `dyB` are the same expression as
 * `.node`'s offset in `ServicesConstellation.vue`, evaluated against the same
 * inherited clock in the same style pass.
 *
 * Units: offsets are unitless design pixels. Each <svg> is exactly the
 * 1440×910 frame in rem, so its border-box origin is the viewBox origin and
 * one user unit is one `--services-frame-px`; `shift` becomes a length
 * through that token, and `slope` is a ratio, unit-free either way.
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

  width: var(--services-canvas-w);
  height: var(--services-canvas-h);
  overflow: visible;
  transform-origin: 0 0;
  transform: translate(0, calc(var(--shift) * var(--services-frame-px)))
    skewY(atan(var(--slope)));
}

/*
 * `non-scaling-stroke`: the hairline stays exactly `--services-link-w` on
 * screen at any root font size (one user unit is 1.25px at a 20px root, which
 * would otherwise thicken it), matching the mobile spine's HTML hairline.
 */
.line {
  stroke: var(--services-link-color);
  stroke-width: var(--services-link-w);
  vector-effect: non-scaling-stroke;
}
</style>
