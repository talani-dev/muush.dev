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
 * extract-46 §§ 3–4, leader § 6; frames `FXvwz` / `pDsNQ` Preguntas,
 * `X9EQIz` / `Y2fsOQ` 404): one block over the acanalado, the page's only
 * `h1`, and a row with the primary button (with its arrow) and the glass
 * button (label only). No pill and no body copy.
 *
 * `preset` names the page, which picks its shader preset, its heading size
 * and its block tokens:
 *
 * | preset   | heading            | block (390 → 1440)                        |
 * |----------|--------------------|-------------------------------------------|
 * | faq      | estado 34 → 88     | min 720 → 1100, pad 100/24/60 → 120/80/80 |
 * | notFound | diagnóstico 34→64  | min 720 → 760, pad 100/24/60 → 100/80/60, 0 → 8 above the buttons |
 *
 * Both: content centred both ways, gap 32 → 40, buttons gap 8 → 14 at the
 * hero size. The frame heights are minimum heights (leader, 2026-11-02).
 * Below `lg` the buttons row may use the gutters: at 390 the Spanish
 * Preguntas pair is 178 + 8 + 161 = 347 wide, more than the 342 between the
 * paddings, and the frame draws it as one centred row running into them.
 * Where even the full width is too narrow (about 350), the row wraps.
 * An external secondary (the call booking) opens in a new tab; an internal
 * one routes with `to`. Every string and href arrives resolved.
 */
const { preset, headingFirst, headingSecond, primary, secondary } =
  defineProps<StatusSectionProps>()

const HEADING_SIZES = {
  faq: 'estado',
  notFound: 'diagnostico',
} satisfies Record<StatusPreset, HeadingSize>

const BLOCK_CLASSES = {
  faq: 'min-h-preguntas-alto pt-preguntas-arriba pb-preguntas-abajo',
  notFound: 'min-h-error-alto pt-error-arriba pb-portada-abajo',
} satisfies Record<StatusPreset, string>

const BUTTONS_CLASSES = {
  faq: '',
  notFound: 'pt-error-botones-arriba',
} satisfies Record<StatusPreset, string>
</script>

<template>
  <section
    :class="['relative isolate flex flex-col', BLOCK_CLASSES[preset]]"
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
          v-if="secondary.external"
          v-bind="secondary.trackAttrs"
          :href="secondary.href"
          :label="secondary.label"
          target="_blank"
          rel="noopener noreferrer"
        />
        <GlassButton
          v-else
          v-bind="secondary.trackAttrs"
          :to="secondary.href"
          :label="secondary.label"
          :aria-current="undefined"
        />
      </div>
    </div>
  </section>
</template>
