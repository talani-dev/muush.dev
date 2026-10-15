<script setup lang="ts">
import {
  connectorEndpoints,
  SERVICE_NODE_CENTRES,
  type ServiceNodeContent,
} from '@/features/landing/data/servicesContent'
import Pill from '@/shared/ui/Pill.vue'
import Radar from '@/shared/ui/Radar.vue'
import ServiceItem from './ServiceItem.vue'
import ServicesConnectors from './ServicesConnectors.vue'

/**
 * The desktop composition: five always-visible nodes, hand-placed and joined
 * by four thin connector lines — a genuine scatter, not a grid pretending to
 * be one (`services.md`: "colocados a mano"). Unlike Propósito's columnar
 * layout, there is no percentage geometry here: the design supplies exactly
 * one desktop frame and the five positions are non-linear on both axes, so
 * this whole canvas is one `position: relative` box at fixed pixels, anchored
 * to `<main>`'s own border box — a documented full-bleed exception, see the
 * `<style scoped>` note on `.canvas` — rather than to its padded content box
 * (`data-model.md` § 2).
 *
 * Every node's radar centre and its text block are generated from the same
 * five `--services-node-{n}-x/-y` token pairs (CSS). The four connectors
 * (`ServicesConnectors.vue`) read the **same five confirmed centres** as
 * numbers, through `connectorEndpoints(SERVICE_NODE_CENTRES)`: one relation
 * over five known points, never four independent shapes (spec FR-008).
 *
 * Feature 34 · the float. `.canvas` runs ONE clock (`--services-float-phase`,
 * global.css); each node is offset by `amplitude × sin(phase + i × step)` and
 * each connector end by the very same expression for the node it touches, so
 * nodes and lines share one value on one thread and cannot separate in any
 * frame. No script, no client state (research R1).
 *
 * No hover-reveal state exists here at all — every node is always visible, so
 * unlike Propósito's constellation this carries no interaction and no
 * `:hover`/`:focus-visible` wiring.
 */
interface Props {
  eyebrow: string
  deliveryLabel: string
  nodes: ServiceNodeContent[]
  deliveryCopy: string
}

const { eyebrow, deliveryLabel, nodes, deliveryCopy } = defineProps<Props>()

/** Generated from the five confirmed centres — never four literal shapes. */
const connectors = connectorEndpoints(SERVICE_NODE_CENTRES)
</script>

<template>
  <div class="canvas relative">
    <Pill :label="eyebrow" class="eyebrow absolute" />

    <div
      v-for="node in nodes"
      :key="node.id"
      class="node absolute"
      :class="`node-${node.index + 1}`"
      :style="{ '--i': String(node.index) }"
    >
      <Radar
        size="md"
        class="radar absolute -translate-x-1/2 -translate-y-1/2"
      />
      <ServiceItem
        :name="node.name"
        :brief="node.brief"
        class="text absolute w-services-text-w"
      />
    </div>

    <!-- Decorative; after the nodes so the lines paint over them, as before. -->
    <ServicesConnectors :connectors="connectors" />

    <!--
      Pill-then-copy on ONE row (feature 23, item 5 — `.pen` frame `Giamn`
      draws `Pill delivery` and `Copy` at the same y). `items-start` matters
      as much as `flex-row`: without it the row's `align-items` default
      (`stretch`) is what was making the Pill fill the whole 1280px closer
      instead of sizing to its own content.
    -->
    <div
      class="closer absolute flex flex-row items-start gap-services-item-gap"
    >
      <Pill :label="deliveryLabel" />
      <p class="font-instrument text-copy text-bone-100">{{ deliveryCopy }}</p>
    </div>
  </div>
</template>

<style scoped>
/*
 * Feature 23, item 4 (round 3). The canvas's coordinate space is the FULL
 * 1440px frame (`.pen` node `GiLTU`, read by the leader), not the 1280px
 * `--services-closer-w` box nested inside it — earlier rounds conflated the
 * two and rendered node 5's text 18px past the viewport at 1440.
 *
 * So `.canvas` breaks out of `<main>`'s `--spacing-page` padding (approved by
 * Roberto as a one-section exception to feature 14's "inherits `px-page`"
 * contract): `calc(100% + 2 * var(--spacing-page))` re-adds the padding the
 * containing block subtracted, `min()` caps it at the frame, and the matching
 * negative `margin-inline` lands its edges on `<main>`'s BORDER box:
 *
 * | Viewport | `<main>` border box | `.canvas` (this formula) |
 * |---|---|---|
 * | 1024 (uncapped) | 0 → 1024 | 0 → 1024 (full-bleed, matches) |
 * | 1440 (frame) | 0 → 1440 | 0 → 1440 (matches the `.pen` exactly) |
 * | 1536/1600/1920 (capped, centred) | e.g. 48 → 1488 | 48 → 1488 (matches) |
 *
 * Every node/Pill/closer token is authored from that frame's origin, which is
 * exactly `.canvas`'s local (0,0). The canvas also runs the float clock
 * (feature 34): one animation per canvas, read by every node and line in it.
 */
.canvas {
  width: min(var(--services-canvas-w), calc(100% + 2 * var(--spacing-page)));
  height: var(--services-canvas-h);
  margin-inline: calc(-1 * var(--spacing-page));
  animation: services-float var(--duration-services-float) linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .canvas {
    animation: none;
  }
}

.eyebrow {
  left: var(--services-pill-x);
  top: var(--services-pill-y);
}

/*
 * Feature 34 · the float: translate the whole node (radar + text as one
 * piece, spec FR-002). `translate` on `.node` does not collide with the
 * radar's own centring, which is on the `.radar` child.
 */
.node {
  --float-dy: calc(
    var(--services-float-amplitude) *
    sin(
      var(--services-float-phase) +
      var(--i) *
      var(--services-float-phase-step)
    )
  );
  translate: 0 calc(var(--float-dy) * var(--services-frame-px));
}

/*
 * One rule per node, and each does nothing but name which pair of tokens this
 * node reads — the geometry itself lives in `.radar` and `.text` below, so it
 * is written once. Unavoidably five rules (there is no way to interpolate a
 * custom-property *name* in plain CSS), same discipline as Propósito's three
 * `.arc-*` rules.
 */
.node-1 {
  --node-x: var(--services-node-1-x);
  --node-y: var(--services-node-1-y);
}
.node-2 {
  --node-x: var(--services-node-2-x);
  --node-y: var(--services-node-2-y);
}
.node-3 {
  --node-x: var(--services-node-3-x);
  --node-y: var(--services-node-3-y);
}
.node-4 {
  --node-x: var(--services-node-4-x);
  --node-y: var(--services-node-4-y);
}
.node-5 {
  --node-x: var(--services-node-5-x);
  --node-y: var(--services-node-5-y);
}

.radar {
  left: var(--node-x);
  top: var(--node-y);
}

/* `textBlock = radarCentre + (-4, +28)` — the one relation, applied
   identically to all five (spec FR-007). */
.text {
  left: calc(var(--node-x) + var(--services-text-offset-x));
  top: calc(var(--node-y) + var(--services-text-offset-y));
}

/* Delivery closer: Pill + copy, full content width, plain text (FR-005). */
.closer {
  left: var(--services-closer-x);
  top: var(--services-closer-y);
  width: var(--services-closer-w);
}
</style>
