<script setup lang="ts">
import type { ResolvedFooterColumn } from '@/features/shell/data/types'
import ShellItemLink from './ShellItemLink.vue'

/**
 * The desktop footer's four columns (feature 43, spec FR-030, FR-031,
 * contract § 7; pen extract-43 § 6, frame `K3vvqL`): NAVEGACIÓN, CONTACTO,
 * MUUSH and REDES, gap 72 (narrower toward 1024). Each column stacks with
 * gap 14: the heading in Instrument Sans 11 / 600, tracking 1, uppercase,
 * Gris 400 (stored in title case so it is not spelt out), then the entries
 * in 15 / 400 Blanco 85 %. An entry without a destination is plain text.
 */
interface Props {
  columns: ResolvedFooterColumn[]
}

const { columns } = defineProps<Props>()
</script>

<template>
  <div class="flex shrink-0 gap-footer-columnas">
    <div
      v-for="column in columns"
      :key="column.title"
      class="flex flex-col gap-footer-columna"
    >
      <h2 class="font-texto text-footer-titulo text-gris-400 uppercase">
        {{ column.title }}
      </h2>
      <ul
        class="flex flex-col gap-footer-columna font-texto text-p text-blanco-85"
      >
        <li v-for="item in column.items" :key="item.label">
          <ShellItemLink
            :item="item"
            :class="item.href ? 'rounded-control foco' : ''"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
