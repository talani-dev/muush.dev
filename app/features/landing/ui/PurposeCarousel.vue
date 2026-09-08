<script setup lang="ts">
import { useTemplateRef } from 'vue'
import type { PurposeNodeContent } from '@/features/landing/data/purposeContent'
import { usePurposeCarousel } from '@/features/landing/logic/usePurposeCarousel'
import PurposeCard from './PurposeCard.vue'

/**
 * The mobile composition: three cards on a horizontal track, the centred one
 * at full size and its neighbours smaller and dimmed, with three dots below.
 *
 * Below `lg` this is the **only** form the section has, so it is half the
 * feature's surface rather than an enhancement.
 *
 * ## A native snap track, plus very little
 *
 * The track is a `scroll-snap-type: x mandatory` scroller with
 * `scroll-snap-align: center` on each card and a symmetric inline padding that
 * gives the first and last card room to reach the centre. That is swiping,
 * snapping and centring, done — and it is also exactly what a visitor with no
 * scripting gets (`ui-map.md` § 10, spec FR-020, FR-023).
 *
 * `usePurposeCarousel` adds only the active-card tracking, the dots and
 * wrap-around arrow keys. Everything it drives is behind `isEnhanced`, so with
 * no scripting the three cards are full size and full opacity and there are no
 * dots — never three inert controls that look clickable
 * (`findings.md` § R56).
 *
 * The cards are **not links** and show no pointer cursor (`ui-map.md` § 4).
 * Only the dots do something, so only the dots claim a pointer.
 *
 * ## The neighbour is the active card at 0.88, not a second smaller card
 *
 * One `scale` and one `opacity` on the same element. 241/274 = 0.8796 and
 * 278/316 = 0.8797 — the frame agrees to four decimals on both axes, so
 * `0.88` is the value and the 18px copy the frame draws is that scale drawn
 * statically, the same thing the radar's halos were (spec FR-021).
 *
 * A named `<section>` rather than a `<div role="group">`: the WAI carousel
 * pattern names the track, and a `role` attribute on a `<div>` where a
 * semantic element exists is a Biome `useSemanticElements` error the correct
 * fix for which is the element, not a suppression. It does mean the mobile
 * composition contributes **one** landmark that the desktop one does not —
 * which is a narrowing of spec A-08 rather than a contradiction: A-08 refuses
 * a name on the *outer* section, whose `id` is a scroll target. Naming the
 * track is what `ui-map.md` § Accesibilidad mínima asks for.
 */
interface Props {
  nodes: PurposeNodeContent[]
  /** The track's accessible name (`ui-map.md` § Accesibilidad mínima). */
  label: string
}

const { nodes, label } = defineProps<Props>()

const track = useTemplateRef<HTMLElement>('track')
const { activeIndex, isEnhanced, focusCard, onIndicatorKeydown } =
  usePurposeCarousel(track, nodes.length)

/** `undefined` rather than `false`, so the attribute is absent, not empty. */
function dimmed(index: number): true | undefined {
  return isEnhanced.value && index !== activeIndex.value ? true : undefined
}
</script>

<template>
  <section :aria-label="label">
    <!--
      Full bleed. The frame draws the track 390 wide at x 0, so it has to break
      out of the page gutter `<main>` applies — and it is the wrapper, not the
      track, that breaks out: the track's inline padding is a percentage, and a
      percentage padding resolves against the **containing block**, so the
      wrapper is what has to be 390 wide for `(100% − 274) / 2` to land on the
      frame's 58.
    -->
    <div class="-mx-page">
      <div
        ref="track"
        class="track flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        <PurposeCard
          v-for="(node, index) in nodes"
          :key="node.id"
          :label="node.label"
          :copy="node.copy"
          :data-dimmed="dimmed(index)"
          class="card w-purpose-card-m shrink-0 snap-center"
        />
      </div>
    </div>

    <!--
      Three real buttons that centre their card, keyboard-operable, with the
      active one marked for assistive technology (spec FR-022). Present only
      when the tracking is live, because without it they would do nothing.
    -->
    <div
      v-if="isEnhanced"
      class="mt-purpose-indicator-gap flex items-center justify-center gap-purpose-dot-gap"
    >
      <button
        v-for="(node, index) in nodes"
        :key="node.id"
        type="button"
        :aria-label="node.label"
        :aria-current="index === activeIndex ? 'true' : undefined"
        :class="[
          'cursor-pointer rounded-full focus-visible:outline-red-400',
          index === activeIndex
            ? 'size-purpose-dot bg-red-400'
            : 'size-purpose-dot-sm bg-ink-300',
        ]"
        @click="focusCard(index)"
        @keydown="onIndicatorKeydown"
      />
    </div>
  </section>
</template>

<style scoped>
/*
 * The whole no-JS and reduced-motion contract is in this one block, and so is
 * every transition property. A scoped selector outweighs a Tailwind utility,
 * so splitting them is how `motion-reduce:` silently stops working
 * (`findings.md` § R53); and the duration has to be a token, which Tailwind v4
 * has no namespace for (§ R52).
 */

/*
 * `(100% − card) / 2` is what centres a snapped card, and at 390 it is the
 * frame's 58. `smooth` here rather than in the composable's `scrollTo`, so the
 * reduced-motion rule below is the single place the preference is honoured.
 */
.track {
  padding-inline: calc((100% - var(--purpose-card-m)) / 2);
  scroll-behavior: smooth;
}

/*
 * The layout gap between two cards is **negative**, and that is the design
 * rather than a hack. The frame leaves 10px of painted air between adjacent
 * cards (`--purpose-card-air`), but the neighbour's 0.88 scale already pulls
 * each painted edge inward by half the shrinkage — 274 × 0.12 ÷ 2 = 16.44px —
 * so the layout boxes have to overlap by the difference for 10px to survive.
 *
 * That is also where the 48px peek `ui-map.md` § 4 asks for comes from:
 * 390 − 332 − 10 = 48 on each side. A plain `gap: 0` would leave 41.5px and
 * miss both the frame and the document.
 *
 * `margin-inline-end` on all but the last, rather than `gap`: `gap` rejects
 * negative values outright, and keeping the outer edges free means the track's
 * inline padding above still centres the first and last card exactly.
 */
.track > .card:not(:last-child) {
  margin-inline-end: calc(
    var(--purpose-card-air) -
    var(--purpose-card-m) *
    (1 - var(--purpose-card-scale)) /
    2
  );
}

.track > .card {
  transition:
    scale var(--duration-purpose-reveal) ease-out,
    opacity var(--duration-purpose-reveal) ease-out;
}

/*
 * ⚠️ The dim is opt-**in**. `data-dimmed` only ever appears once the composable
 * is tracking, so with no scripting — and in the prerendered document — every
 * card renders at scale 1 and opacity 1: *"nunca atenuadas por default"*
 * (`ui-map.md` § 10, spec FR-023).
 */
.track > .card[data-dimmed] {
  scale: var(--purpose-card-scale);
  opacity: var(--purpose-card-dim);
}

/*
 * Reduced motion: the transitions go, the smooth scroll goes, and the
 * neighbour state goes with them — `ui-map.md` § Movimiento reducido leaves
 * everything at 100% and never dimmed, and the carousel keeps working by
 * swipe and by dot.
 */
@media (prefers-reduced-motion: reduce) {
  .track {
    scroll-behavior: auto;
  }

  .track > .card {
    transition: none;
  }

  .track > .card[data-dimmed] {
    scale: 1;
    opacity: 1;
  }
}
</style>
