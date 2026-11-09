<script setup lang="ts">
import messageCircle from '@/assets/icons/message-circle.svg?raw'
import type { ResolvedFaqCard } from '@/features/faq/data/types'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'
import FaqRichText from './FaqRichText.vue'

/**
 * "¿Tienes otra pregunta?" (feature 51, spec FR-007, FR-008; contract
 * `ui-contract.md`; handoff README "Tarjeta").
 *
 * Negro 900 at 60 %, a flat Blanco 8 % edge, radius 20 → 22, padding
 * 24 → 28, gap 12 → 14, blur 24. The `message-circle` icon (20) in a
 * 40 → 44 box, radius 14, Carbón 800, Blanco 12 % edge. Title Poppins
 * 22 → 24, tracking −0.6; text 15 / 1.5 Blanco 70 % with the address as a
 * tracked mail link. One action only, the primary "Agenda una llamada" /
 * "Book a call" to the booking page in a new tab: full width below `lg`,
 * its own width from it. No "Diagnóstico gratis" here (FR-008).
 */
interface Props {
  card: ResolvedFaqCard
}

const { card } = defineProps<Props>()
</script>

<template>
  <div
    class="relative flex flex-col items-start gap-faq-tarjeta-gap rounded-faq-tarjeta bg-negro-900/60 p-faq-tarjeta backdrop-blur-cristal borde-luz borde-faq"
  >
    <span
      aria-hidden="true"
      class="relative grid size-faq-icono-caja place-items-center rounded-faq-icono bg-carbon-800 text-blanco borde-luz borde-linea"
    >
      <span data-icono class="icono size-faq-icono" v-html="messageCircle" />
    </span>
    <h2 class="font-titulo text-faq-tarjeta-titulo text-blanco">
      {{ card.title }}
    </h2>
    <FaqRichText
      :segments="card.text"
      class="font-texto text-faq-tarjeta text-texto-suave"
    />
    <PrimaryButton
      v-bind="card.button.trackAttrs"
      size="block"
      :href="card.button.href"
      :label="card.button.label"
      target="_blank"
      rel="noopener noreferrer"
      class="lg:w-auto"
    />
  </div>
</template>

<style scoped>
/* `:deep()` is required: the scoped transform does not reach `v-html`
   content (app/assets/icons/README.md). */
.icono :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
