<script setup lang="ts">
import { useId } from 'vue'
import check from '@/assets/icons/check.svg?raw'

/**
 * "Lo que recibes" (feature 45, spec FR-023; pen extract-45 § 1): the
 * caption 11 / 600 tracked 1 px in Gris 400, drawn uppercase from
 * sentence-case copy; below it, gap 14, the rows: gap 12, a 24 × 24 Red
 * 15 % bubble holding the lucide `check` at 14 px in the commitment-icon
 * colour, and the text 16 / 400 Blanco. Rows fill the width and wrap on
 * mobile (§ 4). The caption names the list; the bubbles are decorative.
 */
interface Props {
  label: string
  items: readonly string[]
}

const { label, items } = defineProps<Props>()

const labelId = useId()
</script>

<template>
  <div class="flex flex-col gap-recibes-gap pt-recibes-arriba">
    <p :id="labelId" class="font-texto text-rotulo text-gris-400 uppercase">
      {{ label }}
    </p>
    <ul :aria-labelledby="labelId" class="flex flex-col gap-recibes-gap">
      <li
        v-for="item in items"
        :key="item"
        class="flex items-center gap-recibe-gap font-texto text-recibe text-blanco"
      >
        <span
          aria-hidden="true"
          class="grid size-recibe-burbuja shrink-0 place-items-center rounded-full bg-rojo-15"
        >
          <span
            class="icono size-recibe-icono text-compromiso-icono"
            v-html="check"
          />
        </span>
        <span class="min-w-0">{{ item }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* `:deep()`: Vue's scoped transform does not reach `v-html` content. */
.icono :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
