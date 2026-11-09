<script setup lang="ts">
import plusIcon from '@/assets/icons/plus.svg?raw'
import xIcon from '@/assets/icons/x.svg?raw'
import type { ResolvedFaqQuestion } from '@/features/faq/data/types'
import FaqRichText from './FaqRichText.vue'

/**
 * One Preguntas question (feature 51, spec FR-015…FR-017; contract
 * `ui-contract.md`; handoff README "Acordeón").
 *
 * An `h3` wrapping the button that toggles the answer, with
 * `aria-expanded` and `aria-controls`; the answer is a `section` labelled
 * by the button (a region), always rendered (so all twenty answers are in
 * the prerendered HTML, spec D3) and `hidden` while closed. The round button
 * shows lucide `plus` closed and `x` open.
 *
 * Looks (README): closed, Negro 900 at 60 % with a flat Blanco 8 % edge;
 * open, Carbón 800 at 60 % with the active tab's gradient edge. Radius
 * 16 → 18, padding 18 → 24 / 28, gap 14, blur 18; question 16 → 19 / 500
 * line 1.35 Blanco; round button 30 → 34 with a Blanco 15 % edge and a
 * 14 → 16 icon; answer 15 → 16 line 1.6, Blanco 70 %.
 *
 * It emits `toggle` only: the parent's composable decides whether that is
 * an open and reports it (spec FR-024).
 */
interface Props {
  question: ResolvedFaqQuestion
  open: boolean
}

const { question, open } = defineProps<Props>()

const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <div
    :class="[
      'relative rounded-faq-pregunta px-faq-pregunta-x py-faq-pregunta-y backdrop-blur-faq borde-luz',
      open ? 'bg-carbon-800/60 borde-faq-activo' : 'bg-negro-900/60 borde-faq',
    ]"
  >
    <h3 class="font-texto text-faq-pregunta text-blanco">
      <button
        :id="`${question.id}-boton`"
        type="button"
        :aria-expanded="open"
        :aria-controls="`${question.id}-respuesta`"
        class="flex w-full items-center justify-between gap-faq-pregunta-gap text-start foco"
        @click="emit('toggle')"
      >
        <span>{{ question.question }}</span>
        <span
          aria-hidden="true"
          class="relative grid size-faq-boton shrink-0 place-items-center rounded-pill borde-luz borde-suave"
        >
          <span
            data-icono
            class="icono size-faq-boton-icono"
            v-html="open ? xIcon : plusIcon"
          />
        </span>
      </button>
    </h3>
    <section
      :id="`${question.id}-respuesta`"
      :aria-labelledby="`${question.id}-boton`"
      :hidden="!open"
      class="pt-faq-pregunta-gap font-texto text-faq-respuesta text-texto-suave"
    >
      <FaqRichText :segments="question.answer" />
    </section>
  </div>
</template>

<style scoped>
/* `:deep()` is required: the scoped transform does not reach `v-html`
   content (app/assets/icons/README.md). The wrapper's token sizes it. */
.icono :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
