<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProcessStepContent } from '@/features/landing/data/howWeWorkContent'
import { useTimelineHover } from '@/features/landing/logic/useTimelineHover'
import { useTimelineProgress } from '@/features/landing/logic/useTimelineProgress'
import { useTimelineRun } from '@/features/landing/logic/useTimelineRun'
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
 * Leaving returns to the unlit rest.
 *
 * Feature 45, reopen 1 (Roberto 2026-11-02, FR-038): the fill runs instead
 * of jumping. After 150 ms it travels from where it is to the previewed dot
 * at a constant speed (700 ms for the whole line), each column lighting as
 * the fill reaches its dot, and back the same way on leaving or moving to
 * an earlier step (`useTimelineRun`). Transform only (`scaleX`).
 *
 * Server, no-script and reduced motion
 * rest unlit as well; under reduced motion the preview still works, with
 * no scale and every change instant (0 ms durations, transitions off).
 *
 * Below `lg`: the vertical rail, whose segments (Blanco 20 %) live in each
 * step and fill in red with the scroll (`useTimelineProgress`; full and
 * every step lit on the server, without scripting and under reduced
 * motion). The rail has no hover.
 *
 * Feature 50 (Roberto 2026-11-06): below `lg` the steps' text follows the
 * scroll as well (`emphasis`): the step at the rail's active point (the
 * pencil line where the fill ends) is whole, the others shrink and fade in
 * proportion to their distance from it (`--paso-enfasis-*` tokens); only
 * the fade under reduced motion; whole on the server and without
 * scripting. Not in the `.pen` yet (rules.md § R32).
 */
interface Props {
  steps: ProcessStepContent[]
}

const { steps } = defineProps<Props>()

const list = ref<HTMLElement | null>(null)
const { lit, fills, emphasis } = useTimelineProgress(list, steps.length)
const hover = useTimelineHover(list, steps.length)
const run = useTimelineRun(
  hover.progress,
  () => steps.map((_, index) => hover.dotShare(index)),
  steps.length
)
const lineStyle = computed(() => ({
  '--progreso': `${run.progress.value}`,
  '--relleno-duracion': `${run.durationMs.value}ms`,
  '--relleno-retraso': `${run.delayMs.value}ms`,
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
        class="absolute inset-0 origin-left scale-x-(--progreso) bg-red-muush-500 transition-transform duration-(--relleno-duracion) delay-(--relleno-retraso) ease-linear motion-reduce:transition-none"
      />
    </div>
    <ol ref="list" class="relative grid lg:grid-cols-5 lg:gap-x-pasos">
      <ProcessStep
        v-for="(step, index) in steps"
        :key="step.number"
        v-bind="step"
        :lit="lit[index] ?? true"
        :column-lit="run.lit.value[index] ?? false"
        :fill="fills[index] ?? 1"
        :emphasis="emphasis[index]"
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
