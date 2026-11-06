<script setup lang="ts">
import { useTemplateRef } from 'vue'
import chevronDown from '@/assets/icons/chevron-down.svg?raw'

/**
 * LegalIndexDisclosure — "En esta página" below `lg` (feature 48,
 * pen-extract-48 § 3, frame `XaxDq`): collapsed, a 48 px bar, Negro 900,
 * radius 12, a 1 px Blanco 20 % stroke, padding 0 / 16, the label
 * 14 / 600 Blanco and the chevron on the right.
 *
 * The `.pen` draws it closed only. Open is DERIVED (rules.md § R38): the
 * same links as the desktop index (14 / 20 Gris 400, gap 14) inside the
 * same box, padded 16 like its sides, and the chevron turned over. A
 * native `<details>`: it works before hydration and announces its state.
 * Choosing a link closes it. Presentational.
 */
interface Props {
  label: string
  sections: { id: string; nav: string }[]
}

const { label, sections } = defineProps<Props>()

const disclosure = useTemplateRef<HTMLDetailsElement>('disclosure')

function closeDisclosure() {
  if (disclosure.value) disclosure.value.open = false
}
</script>

<template>
  <details
    ref="disclosure"
    class="group rounded-control bg-negro-900 font-texto inset-ring inset-ring-linea-fuerte"
  >
    <summary
      class="flex h-legal-plegado cursor-pointer list-none items-center justify-between rounded-control px-legal-plegado-x text-legal-plegado text-blanco foco [&::-webkit-details-marker]:hidden"
    >
      {{ label }}
      <span
        aria-hidden="true"
        class="icono -me-legal-chevron-aire size-legal-chevron shrink-0 transition-transform duration-(--rapido) ease-muush group-open:rotate-180"
        v-html="chevronDown"
      />
    </summary>
    <nav :aria-label="label">
      <ul
        class="flex flex-col gap-legal-indice-gap px-legal-plegado-x pb-legal-plegado-x"
      >
        <li v-for="section in sections" :key="section.id">
          <a
            :href="`#${section.id}`"
            class="block text-legal-indice text-gris-400 transition-colors duration-(--rapido) ease-muush hover:text-blanco foco"
            @click="closeDisclosure"
          >
            {{ section.nav }}
          </a>
        </li>
      </ul>
    </nav>
  </details>
</template>

<style scoped>
/* `:deep()`: Vue's scoped transform does not reach `v-html` content. */
.icono :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
