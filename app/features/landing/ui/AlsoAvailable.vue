<script setup lang="ts">
import GlassSurface from '@/shared/ui/GlassSurface.vue'

/**
 * "También, si lo necesitas" (feature 44, spec FR-017; pen extract-44
 * § 3.2): Creative and Marketing, always quoted apart.
 *
 * - From `lg`: the `franja` glass strip (Carbón 800 40 %, radius 20, flat
 *   Blanco 10 % edge, blur 20, padding 22 / 28), `space-between`: on the
 *   left, gap 18, the label (11 / 600, tracking 1, Gris 400, uppercase by
 *   CSS so it is not spelled out) and two chips (radius 999, Blanco 15 %
 *   edge, 7 / 14, gap 8, a 6 px Acero 200 dot, 14 Blanco); the note (14 Gris
 *   400) on the right. Each chip dot carries the radar ping in its own
 *   Acero 200 (`pulso`, FR-041, Roberto review 2026-11-02); the ghost
 *   overflows without resizing the chip, and is gone under reduced motion.
 * - Below `lg`: a card (radius 16, Blanco 12 % edge, padding 20, gap 8)
 *   with the label (12 / 600, tracking 1.2), "Creativo · Marketing" in
 *   Poppins 18 / 500 (the `·` decorative) and the note in Blanco 70 %.
 */
interface Props {
  label: string
  chips: string[]
  note: string
}

const { label, chips, note } = defineProps<Props>()
</script>

<template>
  <GlassSurface
    preset="franja"
    class="hidden items-center justify-between gap-franja-grupo font-texto lg:flex"
  >
    <div class="flex items-center gap-franja-grupo">
      <p class="text-rotulo text-gris-400 uppercase">{{ label }}</p>
      <ul class="flex items-center gap-franja-grupo">
        <li
          v-for="chip in chips"
          :key="chip"
          class="relative flex items-center gap-franja-chip-gap rounded-pill px-franja-chip-x py-chip-y text-nota text-blanco borde-luz borde-suave"
        >
          <span
            aria-hidden="true"
            class="relative size-chip-punto shrink-0 rounded-full bg-acero-200 pulso"
          />
          {{ chip }}
        </li>
      </ul>
    </div>
    <p class="text-nota text-gris-400">{{ note }}</p>
  </GlassSurface>
  <div
    class="relative flex flex-col gap-tambien-gap rounded-caja p-tambien font-texto borde-luz borde-linea lg:hidden"
  >
    <p class="text-rotulo-movil text-gris-400 uppercase">{{ label }}</p>
    <p class="font-titulo text-tambien text-blanco">
      <template v-for="(chip, index) in chips" :key="chip">
        <span v-if="index > 0" aria-hidden="true">{{ ' · ' }}</span>{{ chip }}
      </template>
    </p>
    <p class="text-nota text-texto-suave">{{ note }}</p>
  </div>
</template>
