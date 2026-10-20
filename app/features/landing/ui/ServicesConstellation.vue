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
 * be one (`services.md`: "colocados a mano"). The design supplies exactly
 * one desktop frame, so this canvas is one `position: relative` box anchored
 * to `<main>`'s own border box — a documented full-bleed exception, see the
 * `<style scoped>` note on `.canvas` — rather than to its padded content box
 * (`data-model.md` § 2). Since feature 38 the frame's x axis scales with the
 * canvas (`--services-unit-x`) while y stays fixed, so below 1440 the five
 * nodes narrow instead of being cut; at 1440 and up nothing moves.
 *
 * Every node's radar centre and its text block are generated from the same
 * five `--services-node-{n}-x/-y` token pairs (CSS). The four connectors
 * (`ServicesConnectors.vue`) read the **same five confirmed centres** as
 * numbers, through `connectorEndpoints(SERVICE_NODE_CENTRES)`: one relation
 * over five known points, never four independent shapes (spec FR-008).
 *
 * Feature 34 · the float. `.canvas` runs ONE clock (`--services-float-phase`);
 * each node and each connector end is offset by the same `amplitude ×
 * sin(phase + i × step)`, so they cannot separate. No script (research R1).
 * No hover state either: every node is always visible.
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

    <!-- The scaled frame: the `cqw` container `--services-unit-x` reads. -->
    <div class="frame absolute inset-0">
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
          class="text absolute"
        />
      </div>

      <!-- Decorative; after the nodes so the lines paint over them. -->
      <ServicesConnectors :connectors="connectors" />
    </div>

    <!--
      Pill-then-copy on ONE row (feature 23, item 5 — `.pen` frame `Giamn`).
      `items-start` matters as much as `flex-row`: the default `stretch` made
      the Pill fill the whole closer instead of sizing to its content.
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
 * 1440px frame (`.pen` node `GiLTU`), not the 1280px closer box inside it.
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
 * Node tokens are authored from the frame's origin, `.canvas`'s (0,0); the
 * Pills sit on `--spacing-page` like every section Pill (feature 38, D6). The
 * canvas also runs the one float clock (feature 34).
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
  left: var(--spacing-page);
  top: var(--services-pill-y);
}

/* Feature 38 · the container `--services-unit-x`'s `cqw` reads — not on
   `.canvas`, whose root must stay free of stacking contexts. It covers the
   Pill, so it passes the pointer through and the nodes take it back. */
.frame {
  container-type: inline-size;
  pointer-events: none;
}

/* Feature 34 · the float moves the whole node (radar + text, FR-002). */
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
  pointer-events: auto;
}

/* One rule per node, naming only which token pair it reads — the geometry is
   written once in `.radar`/`.text`. Five rules because CSS cannot interpolate
   a custom-property *name* (same as Propósito's three `.arc-*` rules). */
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

/* x in frame units scaled by `--services-unit-x`, y fixed (feature 38). */
.radar {
  left: calc(var(--node-x) * var(--services-unit-x));
  top: var(--node-y);
}

/* `textBlock = radarCentre + (-4, +28)`, identical for all five (FR-007);
   its 232 width scales with x down to a measured floor (global.css). */
.text {
  left: calc(
    (var(--node-x) + var(--services-text-offset-x)) *
    var(--services-unit-x)
  );
  top: calc(var(--node-y) + var(--services-text-offset-y));
  width: max(
    calc(var(--services-text-w) * var(--services-unit-x)),
    var(--services-text-min-w)
  );
}

/* Delivery closer: Pill + copy on the page content box, plain text (FR-005). */
.closer {
  left: var(--spacing-page);
  top: var(--services-closer-y);
  width: calc(100% - 2 * var(--spacing-page));
}
</style>
