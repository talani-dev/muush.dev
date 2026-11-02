<script setup lang="ts">
import type { ResolvedShellItem } from '@/features/shell/data/types'
import { scrollToTopIfCurrent } from '@/features/shell/logic/scrollToTopIfCurrent'

/**
 * The desktop header's link bar (feature 43, spec FR-002, FR-003, contract
 * § 4; pen extract-43 § 2, frame `FJIoc`).
 *
 * A glass pill: Negro 900 at 45 %, 24 px backdrop blur, the 1 px top-lit
 * edge Blanco 20 % → 4 %, padding and gap 6. Each item is Instrument Sans
 * 15 / 500, padding 10 / 18, pill radius; inactive in Blanco 70 %, active
 * with a Blanco 8 % fill, Blanco text and a leading 6 × 6 Red muush 500 dot
 * 8 px before the label.
 *
 * `current: 'page'` is announced as the current page and `'section'` as the
 * current location (`aria-current="true"`); the dot is decorative. The Home
 * item (`scrollsToTop`) scrolls to the top when clicked on its own page.
 */
interface Props {
  items: ResolvedShellItem[]
}

const { items } = defineProps<Props>()

const ITEM_CLASSES =
  'relative inline-flex items-center gap-enlace-gap whitespace-nowrap rounded-pill px-enlace-x py-enlace-y font-texto text-enlace transition-colors duration-(--rapido) ease-muush foco'

function ariaCurrent(item: ResolvedShellItem): 'page' | 'true' | undefined {
  if (item.current === 'page') return 'page'
  if (item.current === 'section') return 'true'
  return undefined
}
</script>

<template>
  <ul
    class="relative flex items-center gap-barra rounded-pill bg-nav-fondo p-barra backdrop-blur-cristal borde-luz borde-barra"
  >
    <li v-for="item in items" :key="item.label">
      <NuxtLink
        :to="item.href"
        :aria-current="ariaCurrent(item)"
        @click="item.scrollsToTop && scrollToTopIfCurrent(item.href)"
        :class="[
          ITEM_CLASSES,
          item.current
            ? 'bg-blanco-8 text-blanco'
            : 'text-texto-suave',
        ]"
      >
        <span
          v-if="item.current"
          data-punto
          aria-hidden="true"
          class="size-punto-activo shrink-0 rounded-full bg-red-muush-500"
        />
        {{ item.label }}
      </NuxtLink>
    </li>
  </ul>
</template>
