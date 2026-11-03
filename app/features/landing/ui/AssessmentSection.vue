<script setup lang="ts">
import arrowRight from '@/assets/icons/arrow-right.svg?raw'
import {
  ContactForm,
  type ContactFormContent,
  type ContactSubmitter,
} from '@/features/forms'
import type { AssessmentContent } from '@/features/landing/data/assessmentContent'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import ReceivesList from '@/shared/ui/ReceivesList.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'

/**
 * Diagnóstico y contacto (feature 45, US1, spec FR-022…FR-025; pen
 * extract-45 §§ 1, 4, 8; frames `mMSV2` desktop, `ASEvR` mobile), over the
 * listón (`assessment` preset), at the shared `diagnostico` anchor the nav,
 * the hero and the footer link to.
 *
 * - 1440: a row, gap 72, padding 120 / 80 / 140 / 80: the left column (pill,
 *   the 64 px heading, the body 18 / 1.55 at 500 wide, "Lo que recibes",
 *   the call row; gap 26), centred against the 600-wide form panel.
 * - 390: a column, padding 72 / 24, gap 24, in the order pill → heading →
 *   body → "Lo que recibes" → form → call row.
 *
 * One DOM for both: the call row is a sibling after the form, so it falls
 * under the form on mobile; from `lg` a grid puts it in the left column
 * under the intro, with rows 1fr / auto / auto / 1fr centring the pair
 * against the panel. The heading is an `h2` (the hero has the page's only
 * `h1`). The form comes from the `forms` barrel; its copy and submitter
 * from the page. No Nuxt composable here (`rules.md` § R23).
 *
 * Call row (feature 45, reopen 1, Roberto 2026-11-02, FR-040): the question
 * is Blanco like the link, the link text is underlined (1 px, 4 px offset,
 * stock utilities), the arrow stays Red muush. This departs from pen
 * extract § 1 (question in Gris 400, no underline) at Roberto's request.
 *
 * Feature 45, reopen 2 (Roberto 2026-11-02, spec 045 FR-041): the pill
 * carries `pill-aire`, 6 px more space above the heading below `lg` and
 * 8 px from it, a deliberate departure from the `.pen`.
 */
interface Props extends AssessmentContent {
  formContent: ContactFormContent
  formSubmitter: ContactSubmitter
}

const {
  pill,
  headingFirst,
  headingSecond,
  body,
  receivesLabel,
  receives,
  callQuestion,
  callLink,
  callHref,
  formContent,
  formSubmitter,
} = defineProps<Props>()
</script>

<template>
  <section :id="SECTION_ANCHORS.assessment" class="relative isolate">
    <ShaderBackground preset="assessment" />
    <div
      class="relative z-10 px-gutter pt-bloque-y pb-diagnostico-abajo lg:px-gutter-desktop"
    >
      <div
        class="mx-auto grid max-w-contenido gap-y-diagnostico-gap lg:grid-cols-diagnostico lg:grid-rows-diagnostico lg:gap-x-diagnostico-gap lg:gap-y-0"
      >
        <div
          class="flex min-w-0 flex-col items-start gap-diagnostico-izq lg:col-start-1 lg:row-start-2"
        >
          <Pill class="pill-aire" :label="pill" />
          <Heading
            :level="2"
            size="diagnostico"
            :first="headingFirst"
            :second="headingSecond"
          />
          <p
            class="max-w-cuerpo-diagnostico font-texto text-cuerpo-diagnostico text-texto-suave"
          >
            {{ body }}
          </p>
          <ReceivesList
            class="self-stretch"
            :label="receivesLabel"
            :items="receives"
          />
        </div>
        <ContactForm
          class="lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:self-center"
          :content="formContent"
          :submitter="formSubmitter"
        />
        <div
          class="flex flex-wrap items-center gap-llamada-gap pt-llamada-arriba font-texto text-llamada lg:col-start-1 lg:row-start-3 lg:mt-diagnostico-izq"
        >
          <span class="text-blanco">{{ callQuestion }}</span>
          <a
            :href="callHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-llamada-enlace font-semibold text-blanco foco"
          >
            <span
              data-enlace-llamada
              class="underline decoration-1 underline-offset-4"
              >{{
                callLink
              }}</span
            >
            <span
              aria-hidden="true"
              class="icono size-boton-icono-nav text-red-muush-500"
              v-html="arrowRight"
            />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* `:deep()`: Vue's scoped transform does not reach `v-html` content. */
.icono :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
