<script setup lang="ts">
/**
 * Radar — a red dot that pings, the section marker of the whole site.
 * Measurements from docs/business/landing/design-extract.md § 2.
 *
 * The design file draws three concentric circles, but the two halos are not
 * rings the site renders: they are how a static mockup draws this animation,
 * because Pencil cannot animate. Rendering them next to a live ping would
 * show the drawn effect and the real effect at once (design-extract.md § 2,
 * ui-map.md § Receta del ping del radar). In code the radar is the dot plus
 * the ping, and nothing else.
 *
 * The outer element is not a ring — it is the reserved footprint, 20 / 30 /
 * 22, with the dot centred inside it. The Pill's gap and padding and the
 * section layouts are all measured against that box, so collapsing the
 * component down to the dot would silently reflow every consumer.
 *
 * Decorative by definition: the label beside it always carries the meaning,
 * so it is hidden from assistive technology and exposes no colour or opacity
 * control. The mobile services ladder (0.18 / 0.45 / 1) is applied by that
 * section to the whole radar-plus-text group, not here.
 */
export type RadarSize = 'sm' | 'md' | 'sm-alt'

interface Props {
  size?: RadarSize
}

const { size = 'sm' } = defineProps<Props>()

interface RadarGeometry {
  /** The reserved box the surrounding layout is measured against. */
  footprint: string
  /** The red dot, centred in the footprint. `core` is the token's name for
   *  what the design file calls `dot`; both mean the same circle. */
  dot: string
}

const geometryBySize = {
  sm: {
    footprint: 'size-radar-sm',
    dot: 'size-radar-sm-core',
  },
  md: {
    footprint: 'size-radar-md',
    dot: 'size-radar-md-core',
  },
  'sm-alt': {
    footprint: 'size-radar-alt',
    dot: 'size-radar-alt-core',
  },
} satisfies Record<RadarSize, RadarGeometry>
</script>

<template>
  <span
    aria-hidden="true"
    :class="['grid place-items-center', geometryBySize[size].footprint]"
  >
    <span
      :class="['ping relative rounded-full bg-red-400', geometryBySize[size].dot]"
    />
  </span>
</template>

<style scoped>
/*
 * The ping is a pseudo-element of the dot, so it costs no DOM node and no
 * script, and `inset: 0` makes it exactly the dot in all three sizes — it
 * never has to know which one is mounted. It expands past the footprint,
 * which is what reads as a radar sweep rather than as a halo.
 *
 * It paints over the dot, and that is harmless: both are `--red-400`, so red
 * over red leaves the dot looking untouched. At `scale(1)` the ghost covers
 * the dot exactly, which is why the loop appears to start from nothing.
 *
 * `@keyframes radar-ping` and `--duration-radar-ping` are document-level and
 * live in app/assets/css/global.css; they are referenced here, never
 * redeclared.
 */
.ping::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--red-400);
  /* Off outside the animation: the ghost is never a resting state. */
  opacity: 0;
  /* It grows past the footprint and must never intercept a pointer. */
  pointer-events: none;
  animation: radar-ping var(--duration-radar-ping) ease-out infinite;
}

/*
 * The ghost is withdrawn, not just paused, so no frozen ring is left sitting
 * on the dot. What remains is the red dot, visible and complete: the dot is
 * the marker, the ping is the ornament, and nothing is lost
 * (ui-map.md § Movimiento reducido).
 */
@media (prefers-reduced-motion: reduce) {
  .ping::before {
    content: none;
  }
}
</style>
