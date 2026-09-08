<script setup lang="ts">
import {
  connectorEndpoints,
  SERVICE_NODE_CENTRES,
  type ServiceNodeContent,
} from '@/features/landing/data/servicesContent'
import Pill from '@/shared/ui/Pill.vue'
import Radar from '@/shared/ui/Radar.vue'
import ServiceItem from './ServiceItem.vue'

/**
 * The desktop composition: five always-visible nodes, hand-placed and joined
 * by four thin connector lines — a genuine scatter, not a grid pretending to
 * be one (`services.md`: "colocados a mano"). Unlike Propósito's columnar
 * layout, there is no percentage geometry here: the design supplies exactly
 * one desktop frame and the five positions are non-linear on both axes, so
 * this whole canvas is one `position: relative` box at fixed pixels, centred
 * within the content box (`data-model.md` § 2).
 *
 * Every node's radar centre and its text block are generated from the same
 * five `--services-node-{n}-x/-y` token pairs (CSS). The four connectors read
 * the **same five confirmed centres**, but as numbers rather than CSS custom
 * properties: `x1/y1/x2/y2` are SVG geometry attributes, not CSS properties —
 * Biome's `noUnknownProperty` correctly rejects them written as CSS
 * declarations, so `connectorEndpoints(SERVICE_NODE_CENTRES)` (a pure
 * function over the same five centres, `data/servicesContent.ts`) is bound
 * directly onto each `<line>`. Either way there are no four independent
 * shapes, only one relation over five known points (spec FR-008).
 *
 * The `<svg>`'s `viewBox` is the canvas's own fixed content box (1280×910),
 * so a raw attribute number and the `rem`-token position of the same node
 * agree pixel-for-pixel — both ultimately come from the same confirmed centre
 * (`data-model.md` § 2.1), just read through two different consumption paths.
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

    <!--
      Decorative. Each endpoint pair is the output of `connectorEndpoints`
      over the five confirmed radar centres — a straight line between two
      known points, not a fifth measured quantity (spec FR-008).
    -->
    <svg
      aria-hidden="true"
      viewBox="0 0 1280 910"
      class="connectors pointer-events-none absolute inset-0 size-full"
    >
      <line
        v-for="(connector, index) in connectors"
        :key="index"
        :x1="connector.x1"
        :y1="connector.y1"
        :x2="connector.x2"
        :y2="connector.y2"
        class="connector"
      />
    </svg>

    <div class="closer absolute flex flex-col gap-services-item-gap">
      <Pill :label="deliveryLabel" />
      <p class="font-instrument text-copy text-bone-100">{{ deliveryCopy }}</p>
    </div>
  </div>
</template>

<style scoped>
.canvas {
  width: var(--services-closer-w);
  height: var(--services-canvas-h);
  margin-inline: auto;
}

.eyebrow {
  left: var(--services-pill-x);
  top: var(--services-pill-y);
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

.connector {
  stroke: var(--services-link-color);
  stroke-width: var(--services-link-w);
}

/* Delivery closer: Pill + copy, full content width, plain text (FR-005). */
.closer {
  left: var(--services-closer-x);
  top: var(--services-closer-y);
  width: var(--services-closer-w);
}
</style>
