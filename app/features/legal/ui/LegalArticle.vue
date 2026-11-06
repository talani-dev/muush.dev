<script setup lang="ts">
import type { LegalPageContent } from '@/features/legal/data/types'
import Heading from '@/shared/ui/Heading.vue'
import LegalIndex from './LegalIndex.vue'
import LegalIndexDisclosure from './LegalIndexDisclosure.vue'
import LegalSection from './LegalSection.vue'

/**
 * LegalArticle — the body of the Aviso de privacidad and the Términos y
 * condiciones (feature 48, pen-extract-48 § 3; frames `rhgZ2` / `XaxDq`,
 * `dKb9C` / `VvK17` and their EN twins).
 *
 * The header: the two-tone heading (Poppins 34 → 56, Blanco / Gris 400),
 * then "Última actualización" (and, on the English page, the courtesy
 * translation note) in Gris 400, 13 / 20 → 15 / 23, gap 16 → 20. The
 * sections follow at a 40 → 64 gap.
 *
 * Below `lg`: one 342-wide column inside the 24 gutters, top 112, the
 * collapsed "En esta página" under the header. From `lg`: the 80 gutters,
 * the index column (220) at the left and the 680 article centred on the
 * page at 1440 (`--legal-columnas`); the index starts 80 below the first
 * section's top and sticks at 168 while the article scrolls.
 *
 * The current index entry is the caller's `activeId`. Presentational.
 */
interface Props {
  content: LegalPageContent
  activeId: string | null
}

const { content, activeId } = defineProps<Props>()

defineEmits<{ 'open-preferences': [trigger: HTMLElement] }>()
</script>

<template>
  <article
    class="px-gutter pt-legal-arriba pb-legal-abajo lg:grid lg:grid-cols-(--legal-columnas) lg:gap-y-legal-gap lg:px-gutter-desktop"
  >
    <header
      class="flex flex-col gap-legal-encabezado-gap lg:col-start-3 lg:row-start-1"
    >
      <Heading
        :first="content.headingFirst"
        :second="content.headingSecond"
        :level="1"
        size="legal"
      />
      <p class="font-texto text-legal-fecha text-gris-400">
        {{ content.updated }}
      </p>
      <p
        v-if="content.translationNote"
        class="font-texto text-legal-fecha text-gris-400"
      >
        {{ content.translationNote }}
      </p>
    </header>

    <aside class="hidden lg:col-start-1 lg:row-start-2 lg:block">
      <div class="sticky top-legal-indice-fijo mt-legal-indice-arriba">
        <LegalIndex
          :label="content.onThisPage"
          :sections="content.sections"
          :active-id="activeId"
        />
      </div>
    </aside>

    <div
      class="mt-legal-gap flex flex-col gap-legal-gap lg:col-start-3 lg:row-start-2 lg:mt-0"
    >
      <LegalIndexDisclosure
        class="lg:hidden"
        :label="content.onThisPage"
        :sections="content.sections"
      />
      <LegalSection
        v-for="section in content.sections"
        :key="section.id"
        :section="section"
        @open-preferences="$emit('open-preferences', $event)"
      />
    </div>
  </article>
</template>
