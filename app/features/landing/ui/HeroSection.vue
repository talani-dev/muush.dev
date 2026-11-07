<script setup lang="ts">
import { HERO_PRIMARY_TRACK } from '@/features/landing/data/heroContent'
import { trackAttrs } from '@/shared/data/trackingEvents'
import GlassButton from '@/shared/ui/GlassButton.vue'
import Heading from '@/shared/ui/Heading.vue'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'
import RotatingPill from '@/shared/ui/RotatingPill.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'

/**
 * The home hero (feature 44, spec FR-004…FR-006, US1; pen extract-44 § 1,
 * § 8; frames `NVg3Y` desktop, `yQQ0x` mobile).
 *
 * Over the listón (`homeHero` preset, with its poster as the no-WebGL and
 * no-script fallback). One centred column: the rotating pill of services,
 * the page's only `h1` (line 2 in Gris 400 at both widths, the Kit's
 * two-tone rule), the subtitle and two actions.
 *
 * - 1440: 1000 tall; the column starts at y 290 (the header floats over
 *   it), gap 28, buttons gap 14; no bottom padding is drawn.
 * - 390: 740 tall, padding 110 / 24 / 60, the column vertically centred
 *   (`justifyContent: center`, § 8), gap 22; the buttons are the mobile
 *   size, in one centred row with gap 8 and 8 above, wrapping the second
 *   below where the row does not fit, e.g. at 360 (Clarifications Q1,
 *   confirmed by Roberto 2026-11-01).
 *
 * Every size between the anchors is a fluid token. Both actions are links
 * to sections of this page, so they work without scripting; `aria-current`
 * is cleared because the router marks any link to the current path as the
 * current page, hash or not (the header CTA's precedent).
 *
 * Feature 45, reopen 2 (Roberto 2026-11-02, spec 045 FR-041): the pill
 * carries `pill-aire`, 6 px more space above the heading below `lg` and
 * 8 px from it, a deliberate departure from the `.pen`.
 */
interface Props {
  pillItems: string[]
  headlineFirst: string
  headlineSecond: string
  subtitle: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
}

const {
  pillItems,
  headlineFirst,
  headlineSecond,
  subtitle,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
} = defineProps<Props>()
</script>

<template>
  <section
    class="relative isolate flex min-h-portada-alto flex-col"
    data-track-section="hero"
  >
    <ShaderBackground preset="homeHero" />
    <div
      class="relative z-10 flex flex-1 flex-col items-center gap-portada-gap px-gutter pt-portada-arriba pb-portada-abajo text-center max-lg:justify-center"
    >
      <RotatingPill class="pill-aire" :items="pillItems" />
      <Heading
        :level="1"
        size="hero"
        :first="headlineFirst"
        :second="headlineSecond"
      />
      <p
        class="max-w-medida font-texto text-subtitulo text-texto-suave"
        data-subtitulo
      >
        {{ subtitle }}
      </p>
      <div
        class="flex flex-wrap items-center justify-center gap-portada-botones-gap pt-portada-botones-arriba"
      >
        <PrimaryButton
          v-bind="trackAttrs(HERO_PRIMARY_TRACK)"
          size="hero"
          :to="primaryHref"
          :label="primaryLabel"
          :aria-current="undefined"
        />
        <GlassButton
          :to="secondaryHref"
          :label="secondaryLabel"
          :aria-current="undefined"
        />
      </div>
    </div>
  </section>
</template>
