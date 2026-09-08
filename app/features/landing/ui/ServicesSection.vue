<script setup lang="ts">
import type { ServiceNodeContent } from '@/features/landing/data/servicesContent'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'
import ServicesConstellation from './ServicesConstellation.vue'
import ServicesTimeline from './ServicesTimeline.vue'

/**
 * `03 Servicios` — the landing's third section: five service areas presented
 * with no cards and no numbering (`services.md`), each a Radar + name + brief.
 * Desktop scatters the five nodes by hand and joins consecutive pairs with a
 * thin connector line; mobile turns the same five into a vertical timeline
 * against a spine, with the scroll-driven lyrics effect. Two compositions,
 * not one rescaled — same discipline as Propósito.
 *
 * The `id` is Spanish (Article VI keeps Spanish anchors) and closes two of the
 * shell's dangling anchors — the footer's *Navegación* column and the mobile
 * menu already point at `#servicios` (`rules.md` § R50).
 *
 * It calls **no Nuxt composable**: copy arrives already translated from
 * `logic/useServicesContent.ts` (`rules.md` § R23).
 *
 * ---
 *
 * ## The paint-order contract — `SectionBackdrop.vue`'s rules, applied here
 *
 * 1. **No stacking context on this section, or on any wrapper above it** —
 *    not `transform`, `translate`, `scale`, `rotate`, `filter`,
 *    `backdrop-filter`, `opacity` below 1, `isolation`, `will-change`,
 *    `contain: paint`, `position: fixed`, or `sticky` with a `z-index`.
 * 2. **The descendant contexts below are permitted and deliberate.** Both
 *    glows' `-translate-x-1/2 -translate-y-1/2`, `ServicesConstellation`'s own
 *    `position: relative` canvas, and the lyrics effect's per-item `opacity`
 *    each create a context for **its own subtree only** — the contract binds
 *    this section and its ancestors, not a leaf in the content layer.
 * 3. **No opaque background** — it would hide this section's own glows,
 *    which paint at a negative level.
 * 4. **No bottom padding and no horizontal padding.** The gap to Proyectos
 *    belongs to Proyectos (`rules.md` § R49) — this section passes on a
 *    **110px** desktop remainder — and `<main>` already applies `px-page`.
 *    ⚠️ **This section's own root still carries none.** The one documented
 *    exception is one level down: `ServicesConstellation.vue`'s `.canvas`
 *    breaks out of `<main>`'s `px-page` on its own (a negative
 *    `margin-inline`), because the `.pen` frame it is built from is
 *    1440px wide — `<main>`'s full border box, not its padded content box.
 *    Roberto approved this as a one-section divergence from feature 14's
 *    reviewed "no horizontal padding" contract (feature 23, item 4, round 3)
 *    — see that component's own `.canvas` comment for the full derivation.
 *
 * The section carries no `aria-label`, matching the Hero's and Propósito's
 * precedent: the `id` is a scroll target, not a landmark (spec A-05). No
 * `scroll-margin-top` either — this section's own top padding (101px desktop,
 * inherited unchanged from Propósito's own leftover) already comfortably
 * exceeds the pinned nav's measured height (spec A-06, `findings.md` § R55).
 */
interface Props {
  eyebrow: string
  deliveryLabel: string
  nodes: ServiceNodeContent[]
  deliveryCopy: string
}

const { eyebrow, deliveryLabel, nodes, deliveryCopy } = defineProps<Props>()
</script>

<template>
  <section id="servicios" class="relative pt-services-top">
    <SectionBackdrop>
      <SectionGlow
        color="wine-300"
        :opacity="14"
        size="900-520"
        class="absolute top-services-glow-a-y left-services-glow-a-x -translate-x-1/2 -translate-y-1/2"
      />
      <SectionGlow
        color="wine-400"
        :opacity="12"
        size="860-480"
        class="absolute top-services-glow-b-y left-services-glow-b-x -translate-x-1/2 -translate-y-1/2"
      />
    </SectionBackdrop>

    <ServicesConstellation
      :eyebrow="eyebrow"
      :delivery-label="deliveryLabel"
      :nodes="nodes"
      :delivery-copy="deliveryCopy"
      class="hidden lg:block"
    />
    <ServicesTimeline
      :eyebrow="eyebrow"
      :delivery-label="deliveryLabel"
      :nodes="nodes"
      :delivery-copy="deliveryCopy"
      class="lg:hidden"
    />
  </section>
</template>
