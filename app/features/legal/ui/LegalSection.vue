<script setup lang="ts">
import type { ResolvedLegalSection } from '@/features/legal/data/types'
import LegalDataTable from './LegalDataTable.vue'
import LegalList from './LegalList.vue'

/**
 * LegalSection — one section of a legal page (feature 48, pen-extract-48
 * § 3): a 1 px Carbón 700 rule on top, padding-top 28 → 40, gap 14 → 18;
 * the title in Poppins 22 / 29 → 28 / 35 and the blocks in Instrument Sans
 * 16 / 26 → 17 / 29, Blanco. Its `id` is the index's anchor. It is
 * deliberately not labelled by its title: a labelled `<section>` becomes a
 * region landmark, and 10–14 of them per page are landmark noise; the
 * `h2` already structures the page for heading navigation.
 *
 * The `preferences` block is the "Cambiar mis preferencias" pill (fill
 * `#1A1A1A8C`, a 1 px Blanco 20 % stroke, padding 12 / 20, 14 → 15 / 500);
 * it emits `open-preferences` with itself as the control focus returns to.
 * Presentational.
 */
interface Props {
  section: ResolvedLegalSection
}

const { section } = defineProps<Props>()

defineEmits<{ 'open-preferences': [trigger: HTMLElement] }>()
</script>

<template>
  <section
    :id="section.id"
    class="flex flex-col gap-legal-seccion-gap border-t border-carbon-700 pt-legal-seccion-arriba font-texto text-legal-cuerpo text-blanco"
  >
    <h2 class="font-titulo text-legal-titulo text-blanco">
      {{ section.title }}
    </h2>
    <template v-for="(block, index) in section.blocks" :key="index">
      <p v-if="block.kind === 'paragraph'">{{ block.text }}</p>
      <LegalList
        v-else-if="block.kind === 'bullets' || block.kind === 'steps'"
        :kind="block.kind"
        :items="block.items"
      />
      <LegalDataTable v-else-if="block.kind === 'table'" :rows="block.rows" />
      <button
        v-else
        type="button"
        class="self-start rounded-pill bg-btn2-fondo px-legal-boton-x py-legal-boton-y font-texto text-legal-boton text-blanco inset-ring inset-ring-linea-fuerte transition-colors duration-(--rapido) ease-muush hover:bg-carbon-800 foco"
        @click="$emit('open-preferences', $event.currentTarget as HTMLElement)"
      >
        {{ block.label }}
      </button>
    </template>
  </section>
</template>
