<script setup lang="ts">
import { computed } from 'vue'

/**
 * Heading — the Muush 1.0 two-tone heading (feature 42, spec FR-006,
 * FR-014, contract § 6; pen extract §§ 4, 8).
 *
 * Poppins 500. Line 1 Blanco, line 2 Gris 400, each on its own line, inside
 * ONE heading element, so a screen reader announces one heading whose name
 * is both lines in order. A space separates the two spans in the markup:
 * between two blocks it collapses visually, but it keeps "negocio" and "y"
 * apart in the accessible name and the text content.
 *
 * `size` picks one of the six fluid sizes (hero 34 → 96, sección 28 → 56,
 * proceso 28 → 52, diagnóstico 34 → 64, página 32 → 64 for the Nosotros
 * hero and estado 34 → 88 for Preguntas, feature 46), each with its own
 * line-height and the fluid tracking (0 at 390, ≈ −0.035 em at 1440). A
 * per-use size (the 30 px Servicios and Cómo se arma headings) is passed
 * as a `class`, which lands on the heading element.
 *
 * All copy arrives as props (FR-016).
 */
export type HeadingSize =
  | 'hero'
  | 'seccion'
  | 'proceso'
  | 'diagnostico'
  | 'pagina'
  | 'estado'

interface Props {
  first: string
  second?: string
  level?: 1 | 2 | 3
  size?: HeadingSize
}

const { first, second, level = 2, size = 'seccion' } = defineProps<Props>()

const SIZE_CLASSES = {
  hero: 'text-hero',
  seccion: 'text-seccion',
  proceso: 'text-proceso',
  diagnostico: 'text-diagnostico',
  pagina: 'text-pagina',
  estado: 'text-estado',
} satisfies Record<HeadingSize, string>

const tag = computed(() => `h${level}`)
</script>

<template>
  <component :is="tag" :class="['font-titulo', SIZE_CLASSES[size]]">
    <span class="block text-blanco">{{ first }}</span>
    <template v-if="second"
      >{{ ' ' }}<span class="block text-gris-400">{{ second }}</span></template
    >
  </component>
</template>
