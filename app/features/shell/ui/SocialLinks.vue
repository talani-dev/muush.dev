<script setup lang="ts">
import type { ResolvedSocial } from '@/features/shell/data/types'
import SocialIcon from '@/shared/ui/SocialIcon.vue'

/**
 * The four social buttons (feature 43, spec FR-017, FR-033, FR-035,
 * contract § 7; pen extract-43 §§ 4, 6).
 *
 * - `menu`: 48 × 48, radius 12, Negro 900 45 % fill, 1 px Blanco 20 %
 *   stroke, gap 12, centred (open mobile menu).
 * - `footer`: 44 × 44, radius 12, the same stroke and no fill, gap 10
 *   (mobile footer).
 *
 * Inside each, the network's brand SVG in Blanco (Roberto, 2026-11-01). The
 * glyph is decorative; the accessible name is the network's.
 */
interface Props {
  socials: ResolvedSocial[]
  size: 'menu' | 'footer'
}

const { socials, size } = defineProps<Props>()

const LIST_CLASSES = {
  menu: 'justify-center gap-red-menu-gap',
  footer: 'gap-red-footer-gap',
} satisfies Record<Props['size'], string>

const LINK_CLASSES = {
  menu: 'size-red-menu bg-nav-fondo',
  footer: 'size-red-footer',
} satisfies Record<Props['size'], string>
</script>

<template>
  <ul :class="['flex items-center', LIST_CLASSES[size]]">
    <li v-for="social in socials" :key="social.network">
      <a
        :href="social.href"
        :aria-label="social.label"
        target="_blank"
        rel="noopener noreferrer"
        :class="[
          'inline-grid place-items-center rounded-control border border-linea-fuerte text-blanco foco',
          LINK_CLASSES[size],
        ]"
      >
        <SocialIcon :network="social.network" class="size-red-glifo" />
      </a>
    </li>
  </ul>
</template>
