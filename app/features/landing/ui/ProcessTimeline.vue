<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProcessStepContent } from '@/features/landing/data/howWeWorkContent'
import { useTimelineHover } from '@/features/landing/logic/useTimelineHover'
import { useTimelineProgress } from '@/features/landing/logic/useTimelineProgress'
import ProcessStep from './ProcessStep.vue'

/**
 * The five steps on their line (feature 44, spec FR-018…FR-020, FR-042…
 * FR-047; pen extract-44 § 4; research R8; Roberto review and
 * clarification 2026-11-02).
 *
 * From `lg`: five equal columns (gap 20) over a 2 px line at y 13, behind
 * the dots. At rest the whole line is the unlit track (Blanco 20 %,
 * `linea-fuerte`, the mobile rail's unlit colour) and every column is
 * unlit; there is no scroll fill on desktop. Pointing at or keyboard-
 * focusing a column previews it (`useTimelineHover`): a solid Red muush 500
 * fill grows from the left to that step's dot (`--progreso`), the columns
 * up to it light, the later ones stay unlit, and that column grows.
 * Leaving returns to the unlit rest. Server, no-script and reduced motion
 * rest unlit as well; under reduced motion the preview still works, with
 * no scale and every change instant (0 ms durations, transitions off).
 *
 * Below `lg`: the vertical rail, whose segments (Blanco 20 %) live in each
 * step and fill in red with the scroll (`useTimelineProgress`; full and
 * every step lit on the server, without scripting and under reduced
 * motion). The rail has no hover.
 */
interface Props {
  steps: ProcessStepContent[]
}

const { steps } = defineProps<Props>()

const list = ref<HTMLElement | null>(null)
const { lit, fills } = useTimelineProgress(list, steps.length)
const hover = useTimelineHover(list, steps.length)
const lineStyle = computed(() => ({
  '--progreso': `${hover.progress.value ?? 0}`,
}))
</script>

<template>
  <div class="relative" :style="lineStyle">
    <div
      aria-hidden="true"
      data-linea
      :data-vista-previa="hover.active.value !== null || undefined"
      class="absolute inset-x-0 top-linea-proceso-arriba hidden h-linea-proceso bg-linea-fuerte lg:block"
    >
      <span
        data-relleno
        class="absolute inset-0 origin-left scale-x-(--progreso) bg-red-muush-500 transition-transform duration-(--medio) ease-muush motion-reduce:transition-none"
      />
    </div>
    <ol ref="list" class="relative grid lg:grid-cols-5 lg:gap-x-pasos">
      <ProcessStep
        v-for="(step, index) in steps"
        :key="step.number"
        v-bind="step"
        :lit="lit[index] ?? true"
        :column-lit="hover.lit.value?.[index] ?? false"
        :fill="fills[index] ?? 1"
        :is-last="index === steps.length - 1"
        :raised="hover.active.value === index"
        :focusable="hover.focusable.value"
        @mouseenter="hover.pointIn(index)"
        @mouseleave="hover.pointOut(index)"
        @focusin="hover.focusIn(index, $event)"
        @focusout="hover.focusOut(index, $event)"
      />
    </ol>
  </div>
</template>
