<script setup lang="ts">
/**
 * FormProgress — "Paso 1 de 2 · Tus datos" and its bar (feature 45, spec
 * FR-004; pen extract-45 § 4): label 12 Blanco filling the row, gap 10;
 * segments 28 × 4, radius 2, gap 4; the current step and the ones before
 * it Red muush, later ones Blanco 20 %.
 *
 * The label is a polite live region, so the step change is announced
 * (spec US5-4); its id names the visible step group. The bar repeats the
 * label and is hidden from assistive technology. Presentational.
 */
interface Props {
  id: string
  label: string
  step: number
  total: number
}

const { id, label, step, total } = defineProps<Props>()
</script>

<template>
  <div class="flex items-center gap-progreso-gap">
    <p
      :id="id"
      aria-live="polite"
      class="min-w-0 flex-1 font-texto text-progreso text-blanco"
    >
      {{ label }}
    </p>
    <div aria-hidden="true" class="flex shrink-0 gap-barra-paso-gap">
      <span
        v-for="segment in total"
        :key="segment"
        data-segmento
        class="h-barra-paso-alto w-barra-paso-ancho rounded-barra-paso transition-colors duration-(--medio) ease-muush"
        :class="segment <= step ? 'bg-red-muush-500' : 'bg-linea-fuerte'"
      />
    </div>
  </div>
</template>
