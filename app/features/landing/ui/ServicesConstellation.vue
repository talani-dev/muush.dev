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
 * this whole canvas is one `position: relative` box at fixed pixels, anchored
 * to `<main>`'s own border box — a documented full-bleed exception, see the
 * `<style scoped>` note on `.canvas` — rather than to its padded content box
 * (`data-model.md` § 2).
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
 * The `<svg>`'s `viewBox` is the canvas's own fixed frame (1440×910, feature
 * 23 round 3 — see the `<style scoped>` note on `.canvas`), so a raw
 * attribute number and the `rem`-token position of the same node agree
 * pixel-for-pixel — both ultimately come from the same confirmed centre
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
      viewBox="0 0 1440 910"
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
 * Feature 23, item 4 — round 3, the real fix. The leader read the `.pen`
 * node directly (`GiLTU`, 1440×1020, `Landing ES · v4 (radiales)`, confirmed
 * — not the `DEMO spotlight cursor` copy): the canvas's own coordinate space
 * is the FULL 1440px frame, not the 1280px `--services-closer-w` box nested
 * 80px in from each edge inside it. Rounds 1 and 2 both reused
 * `--services-closer-w` for `.canvas` itself — conflating two different
 * boxes in the design — and centred that 1280px (or fluid-shrunk) box
 * inside `<main>`'s *padded* content box. That is 80px narrower than the
 * frame, which is exactly why node 5's confirmed text (`--services-node-5-x`
 * + `--spacing-services-text-w`, both correct and untouched) rendered 18px
 * past the viewport at 1440: it was positioned correctly relative to the
 * 1440px frame, inside a canvas that was itself wrongly anchored 80px too
 * far right.
 *
 * The fix breaks `.canvas` out of `<main>`'s `--spacing-page` padding —
 * approved by Roberto as a documented, one-section exception to the
 * "no horizontal padding, inherits `<main>`'s `px-page`" contract feature 14
 * already reviewed. `calc(100% + 2 * var(--spacing-page))` re-adds the
 * padding this element's own containing block (this section's content box,
 * itself `<main>`'s content box — the section carries no padding of its
 * own) had already subtracted, yielding `<main>`'s own BORDER box width at
 * any viewport; `min()` against the fixed 1440px frame width caps it there
 * once `<main>` is itself capped by `max-w-shell-max`. The matching
 * `margin-inline: calc(-1 * var(--spacing-page))` shifts the box left/right
 * by exactly the padding this formula added back, landing its rendered edges
 * on `<main>`'s own border box — not its content box — at every width:
 *
 * | Viewport | `<main>` border box | `.canvas` (this formula) |
 * |---|---|---|
 * | 1024 (uncapped) | 0 → 1024 | 0 → 1024 (full-bleed, matches) |
 * | 1440 (frame) | 0 → 1440 | 0 → 1440 (matches the `.pen` exactly) |
 * | 1536/1600/1920 (capped, centred) | e.g. 48 → 1488 | 48 → 1488 (matches) |
 *
 * Every node/Pill/closer offset keeps reading the SAME tokens as before
 * (`--services-node-*-x/-y`, `--services-pill-x/-y`, `--services-closer-*`)
 * — they were already authored relative to the 1440px frame's own origin,
 * which is now exactly where `.canvas`'s local (0,0) lands.
 */
.canvas {
  width: min(var(--services-canvas-w), calc(100% + 2 * var(--spacing-page)));
  height: var(--services-canvas-h);
  margin-inline: calc(-1 * var(--spacing-page));
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
