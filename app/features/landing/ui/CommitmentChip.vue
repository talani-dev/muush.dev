<script setup lang="ts">
import fileText from '@/assets/icons/file-text.svg?raw'
import keyRound from '@/assets/icons/key-round.svg?raw'
import messageCircleWarning from '@/assets/icons/message-circle-warning.svg?raw'
import slidersHorizontal from '@/assets/icons/sliders-horizontal.svg?raw'
import userRound from '@/assets/icons/user-round.svg?raw'
import type { StepIcon } from '@/features/landing/data/howWeWorkContent'

/**
 * A step's commitment (feature 44, spec FR-021; pen extract-44 § 4), the
 * same lit or not.
 *
 * - From `lg`: a 38-tall pill, Carbón 800 60 %, the top-lit Blanco 20 → 4 %
 *   edge and a 16 px backdrop blur, padding 8 / 10 / 8 / 8, gap 6 (pen
 *   extract-44 § 10); a 22 px Red 15 % bubble with the 12 px lucide glyph in
 *   `#E98A77`; 13 / 500 Blanco text.
 * - Below `lg`: Red 10 %, a flat Red 25 % edge, radius 99, padding 6 / 10,
 *   gap 6, a 5 px red dot, 12 px Blanco text, no icon.
 *
 * Both glyph and dot are decorative.
 */
interface Props {
  text: string
  icon: StepIcon
}

const { text, icon } = defineProps<Props>()

const ICONS = {
  'message-circle-warning': messageCircleWarning,
  'sliders-horizontal': slidersHorizontal,
  'user-round': userRound,
  'file-text': fileText,
  'key-round': keyRound,
} satisfies Record<StepIcon, string>
</script>

<template>
  <span
    data-compromiso="escritorio"
    class="relative hidden h-compromiso-alto items-center gap-chip-gap self-start rounded-pill bg-pill-fondo py-compromiso ps-compromiso pe-compromiso-fin font-texto text-compromiso text-blanco backdrop-blur-pill borde-luz borde-barra lg:inline-flex"
  >
    <span
      aria-hidden="true"
      class="grid size-burbuja shrink-0 place-items-center rounded-full bg-rojo-15"
    >
      <span
        class="icono size-burbuja-icono text-compromiso-icono"
        v-html="ICONS[icon]"
      />
    </span>
    {{ text }}
  </span>
  <span
    data-compromiso="movil"
    class="relative inline-flex items-center gap-chip-gap self-start rounded-pill bg-rojo-10 px-compromiso-movil-x py-compromiso-movil-y font-texto text-compromiso-movil text-blanco borde-luz borde-rojo lg:hidden"
  >
    <span
      aria-hidden="true"
      class="size-compromiso-movil-punto shrink-0 rounded-full bg-red-muush-500"
    />
    {{ text }}
  </span>
</template>

<style scoped>
/* `:deep()`: Vue's scoped transform does not reach `v-html` content. */
.icono :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
