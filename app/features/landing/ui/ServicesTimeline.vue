<script setup lang="ts">
import { useTemplateRef } from 'vue'
import type { ServiceNodeContent } from '@/features/landing/data/servicesContent'
import { useServicesLyrics } from '@/features/landing/logic/useServicesLyrics'
import Pill from '@/shared/ui/Pill.vue'
import Radar from '@/shared/ui/Radar.vue'
import ServiceItem from './ServiceItem.vue'

/**
 * The mobile composition: a vertical timeline against a spine, with a
 * scroll-driven three-tier "lyrics" dimming effect (`ui-map.md` § 5).
 *
 * Below `lg` this is the section's **only** form, so it is half the feature's
 * surface rather than an enhancement — same framing Propósito's carousel had.
 *
 * ## The five items are absolutely positioned, not flowed
 *
 * `item.top = 72 + index × 185` is a fixed step regardless of each item's own
 * intrinsic height (item 3's brief is longest, 22px taller than the rest) —
 * a flow layout with `gap` would let that taller block push every item below
 * it down, breaking the formula (`data-model.md` § 3, spec FR-011). So the
 * five items sit in one `position: relative` canvas at an explicit height,
 * each positioned by `--i` and the one shared step token — never five
 * literals.
 *
 * ## The lyrics effect writes an attribute; CSS owns the opacity
 *
 * `useServicesLyrics` is a plain Vue composable — no Nuxt call — so this
 * component still mounts bare in Storybook and in a bare test mount
 * (`docs/business/rules.md` § R23). It only ever sets `data-lyrics` on each
 * item; the actual opacity values and the transition live in
 * `<style scoped>` below, which is also where the no-JS and reduced-motion
 * defaults live (spec FR-016, FR-017).
 */
interface Props {
  eyebrow: string
  deliveryLabel: string
  nodes: ServiceNodeContent[]
  deliveryCopy: string
}

const { eyebrow, deliveryLabel, nodes, deliveryCopy } = defineProps<Props>()

/** The container wrapping the five items — `useServicesLyrics` reads its
 *  children, same discipline `usePurposeCarousel` uses for its own track. */
const timelineItems = useTemplateRef<HTMLElement>('timelineItems')
useServicesLyrics(timelineItems)
</script>

<template>
  <div>
    <div class="canvas relative">
      <Pill :label="eyebrow" class="pill absolute left-services-pill-x top-0" />

      <span aria-hidden="true" class="spine absolute" />

      <!-- `contents`: a transparent wrapper. Each `.item` still resolves its
           `position: absolute` against `.canvas`, the nearest positioned
           ancestor — this div contributes no box of its own. -->
      <div ref="timelineItems" class="contents">
        <div
          v-for="node in nodes"
          :key="node.id"
          class="item absolute inset-x-0 flex items-center gap-services-row-gap-m"
          :style="{ '--i': String(node.index) }"
        >
          <Radar size="sm-alt" />
          <ServiceItem
            :name="node.name"
            :brief="node.brief"
            class="w-services-item-m-w"
          />
        </div>
      </div>
    </div>

    <div class="mt-services-item-gap flex flex-col gap-services-item-gap">
      <Pill :label="deliveryLabel" />
      <p class="font-instrument text-copy w-services-closer-m-w text-bone-100">
        {{ deliveryCopy }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/*
 * Explicit height so the closer that follows in normal flow does not overlap
 * the absolutely-positioned items above it (§ *doc comment*). Same class of
 * approximation as the desktop canvas height — a much longer locale's item 5
 * could overflow it slightly (spec A-03).
 */
.canvas {
  height: var(--services-timeline-h);
}

.spine {
  left: var(--services-spine-x);
  top: var(--services-spine-y);
  height: var(--services-spine-h);
  width: var(--services-link-w);
  background: var(--services-link-color);
}

/*
 * The one relation (`data-model.md` § 3): `top = 72 + i × 185`, never five
 * literals (spec FR-011). `--i` arrives inline, one per item.
 */
.item {
  top: calc(
    var(--services-timeline-item-1-top) +
    var(--i) *
    var(--services-timeline-item-step)
  );
}

/*
 * The lyrics effect. `useServicesLyrics` only ever sets `data-lyrics` on
 * `.item`; opacity — applied to the whole row, so it dims the radar and the
 * text together — and the transition live here and nowhere else.
 *
 * ⚠️ The default, with no `[data-lyrics]` attribute present, is `opacity: 1`
 * unconditionally — this is what a visitor with scripting off renders, and
 * what the prerendered document already contains (`ui-map.md` § 10, spec
 * FR-016). The composable only ever narrows that default once mounted.
 */
.item {
  opacity: 1;
  transition: opacity var(--duration-services-lyrics) ease-out;
}

.item[data-lyrics="near"] {
  opacity: 0.45;
}

.item[data-lyrics="far"] {
  opacity: 0.22;
}

/*
 * Reduced motion drops the transition **and** forces every item back to full
 * strength, regardless of its bucket — unlike Propósito's reveal, this
 * dimming is atmospheric, not information, so it is the one part of this
 * feature reduced motion removes entirely rather than keeping instant
 * (spec FR-017).
 */
@media (prefers-reduced-motion: reduce) {
  .item {
    transition: none;
    opacity: 1;
  }
}
</style>
