<script setup lang="ts">
import type { WorkContent } from '@/features/about/data/workContent'
import {
  ApplicationForm,
  type ApplicationFormContent,
  type ApplicationSubmitter,
} from '@/features/forms'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import ReceivesList from '@/shared/ui/ReceivesList.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'

/**
 * "Trabaja con muush" (feature 46, US2, spec FR-020…FR-026; pen extract-46
 * §§ 1.4, 2; frames `O1FdO9` desktop, `fhqDx` mobile), over the listón
 * (`workWithUs` preset, the Diagnóstico values; the mobile set below
 * 1024), at the shared `trabaja-con-muush` anchor the footer links to.
 *
 * The home Diagnóstico layout (research R13) with no call row:
 *
 * - 1440: a row, gap 72, x padding 80: the left column (pill,
 *   the 64 px heading, the body 18 / 1.55 at 500 wide, "Áreas que sumamos";
 *   gap 26) centred against the 600-wide application form panel.
 * - 390: a column, x padding 24, gap 24: pill → heading (34 / 1.15) →
 *   body (16 / 1.5) → the list → the two-step form.
 *
 * Height, vertical padding and the anchor landing are the section framing
 * (`global.css`, Roberto 2026-11-08), as in `AssessmentSection.vue`.
 *
 * The background fills the section exactly; the `.pen`'s 26 px upward
 * offset sits inside the shader's 30 % top fade (leader, 2026-11-02). The
 * list is the shared `ReceivesList`, the same anatomy as "Lo que recibes".
 * The form is the feature 45 `ApplicationForm` from the forms barrel,
 * unchanged; its content and submitter come from the page. No Nuxt
 * composable here (`rules.md` § R23). The pill carries `pill-aire`.
 */
interface Props extends WorkContent {
  formContent: ApplicationFormContent
  /** Created by the page (`useApplicationSubmitter()`) and passed through
   * untouched: this section never reaches the network (feature 029). */
  formSubmitter: ApplicationSubmitter
}

const {
  pill,
  headingFirst,
  headingSecond,
  body,
  areasLabel,
  areas,
  formContent,
  formSubmitter,
} = defineProps<Props>()
</script>

<template>
  <section
    :id="SECTION_ANCHORS.workWithUs"
    class="relative isolate flex min-h-seccion-alto -scroll-mt-cabecera flex-col"
    data-track-section="work_with_us"
  >
    <ShaderBackground preset="workWithUs" />
    <div
      class="relative z-10 flex flex-1 flex-col justify-center px-gutter pt-seccion-arriba pb-seccion-aire lg:px-gutter-desktop"
    >
      <div
        class="mx-auto grid w-full max-w-contenido gap-y-diagnostico-gap lg:grid-cols-diagnostico lg:items-center lg:gap-x-diagnostico-gap lg:gap-y-0"
      >
        <div class="flex min-w-0 flex-col items-start gap-diagnostico-izq">
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
            :label="areasLabel"
            :items="areas"
          />
        </div>
        <ApplicationForm :content="formContent" :submitter="formSubmitter" />
      </div>
    </div>
  </section>
</template>
