<script setup lang="ts">
/**
 * LegalIndex — "En esta página", the desktop table of contents (feature
 * 48, pen-extract-48 § 3): 220 wide, gap 14; the label 13 / 18 in 600
 * Blanco, one link per section 14 / 20. The current entry carries the 6 px
 * Red muush dot (gap 8) and Blanco text, `aria-current="location"`; the
 * rest are Gris 400. Which entry is current is the caller's (the page's
 * scroll-spy). Presentational.
 */
interface Props {
  label: string
  sections: { id: string; nav: string }[]
  activeId: string | null
}

const { label, sections, activeId } = defineProps<Props>()
</script>

<template>
  <nav
    :aria-label="label"
    class="flex flex-col gap-legal-indice-gap font-texto"
  >
    <p class="text-legal-rotulo text-blanco" aria-hidden="true">{{ label }}</p>
    <ul class="flex flex-col gap-legal-indice-gap">
      <li v-for="section in sections" :key="section.id">
        <a
          :href="`#${section.id}`"
          :aria-current="section.id === activeId ? 'location' : undefined"
          class="flex items-center gap-legal-indice-punto-gap text-legal-indice transition-colors duration-(--rapido) ease-muush hover:text-blanco foco"
          :class="section.id === activeId ? 'text-blanco' : 'text-gris-400'"
        >
          <span
            v-if="section.id === activeId"
            aria-hidden="true"
            class="size-legal-punto shrink-0 rounded-full bg-red-muush-500"
          />
          <span class="min-w-0 flex-1">{{ section.nav }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>
