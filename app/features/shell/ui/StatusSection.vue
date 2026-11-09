<script setup lang="ts">
import type {
  StatusPreset,
  StatusSectionProps,
} from '@/features/shell/data/types'
import GlassButton from '@/shared/ui/GlassButton.vue'
import Heading, { type HeadingSize } from '@/shared/ui/Heading.vue'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'

/**
 * The status-page block of Muush 1.0 (feature 46, spec FR-035…FR-042; pen
 * extract-46 §§ 3–4, leader § 6; frames `X9EQIz` / `Y2fsOQ` 404): one block
 * over the acanalado, the page's only `h1`, and a row with the primary
 * button (with its arrow) and the glass button (label only). No pill and no
 * body copy. Preguntas used it too until feature 51 gave that page its own
 * `faq` module; the 404 is its only page now.
 *
 * `preset` names the page, which picks its shader preset, its heading size
 * (diagnóstico 34 → 64) and the air above its buttons (0 → 8).
 *
 * Content centred both ways, gap 32 → 40, buttons gap 8 → 14 at the hero
 * size, x padding 24 → 80. Height and vertical padding are the section
 * framing (`global.css`, Roberto 2026-11-08), shared with the heroes: the
 * block is the first of its page, at least a full viewport, its content
 * centred below the floating header. The `.pen` drew the 404 720 → 760
 * tall, as a minimum height (leader, 2026-11-02). Below `lg` the buttons
 * row may use the gutters, as the frame draws it; where even the full
 * width is too narrow (about 350), the row wraps. Both buttons route
 * inside the site with `to` (the external call-booking branch left with
 * Preguntas, feature 51). Every string and href arrives resolved.
 */
const { preset, headingFirst, headingSecond, primary, secondary } =
  defineProps<StatusSectionProps>()

const HEADING_SIZES = {
  notFound: 'diagnostico',
} satisfies Record<StatusPreset, HeadingSize>

const BUTTONS_CLASSES = {
  notFound: 'pt-error-botones-arriba',
} satisfies Record<StatusPreset, string>
</script>

<template>
  <section
    class="relative isolate flex min-h-portada-alto flex-col pt-seccion-arriba pb-seccion-aire"
    :data-estado="preset"
  >
    <ShaderBackground :preset="preset" />
    <div
      class="relative z-10 flex flex-1 flex-col items-center justify-center gap-estado-gap px-gutter text-center lg:px-gutter-desktop"
    >
      <Heading
        :level="1"
        :size="HEADING_SIZES[preset]"
        :first="headingFirst"
        :second="headingSecond"
      />
      <div
        :class="[
          'flex flex-wrap items-center justify-center gap-portada-botones-gap self-stretch max-lg:-mx-gutter',
          BUTTONS_CLASSES[preset],
        ]"
      >
        <PrimaryButton
          v-bind="primary.trackAttrs"
          size="hero"
          :to="primary.href"
          :label="primary.label"
          :aria-current="undefined"
        />
        <GlassButton
          v-bind="secondary.trackAttrs"
          :to="secondary.href"
          :label="secondary.label"
          :aria-current="undefined"
        />
      </div>
    </div>
  </section>
</template>
