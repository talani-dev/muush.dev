<script setup lang="ts">
import type {
  ResolvedContactChannel,
  ResolvedShellItem,
  ResolvedSocial,
} from '@/features/shell/data/types'
import Lockup from '@/shared/ui/Lockup.vue'
import ShellItemLink from './ShellItemLink.vue'
import SocialLinks from './SocialLinks.vue'

/**
 * The mobile footer (feature 43, spec FR-033, contract § 7; pen extract-43
 * § 6, frame `kJfw5`), below `lg`. Padding 48 24 32 24, gap 24, in order:
 *
 * 1. brand (gap 10): lockup, tagline in Poppins 17 / 500, the category in
 *    12 / 400 Gris 400;
 * 2. contact first, as full-width rows (gap 8): Negro 900 70 %, radius 14,
 *    1 px Blanco 12 %, padding 14 / 16; label 15 / 600 Blanco on the left,
 *    hint 13 / 400 Gris 400 and a decorative arrow on the right;
 * 3. the links on one wrapped line, 15 / 400 Blanco 70 %, " · " between;
 * 4. the social buttons (44 × 44);
 * 5. legal (gap 6, 1 px Carbón 700 above, padding-top 16, 12 / 400 Gris 400):
 *    privacy and terms (links since feature 48), then the copyright.
 */
interface Props {
  contactChannels: ResolvedContactChannel[]
  links: ResolvedShellItem[]
  socials: ResolvedSocial[]
  legal: ResolvedShellItem[]
  home: string
  homeLabel: string
  tagline: string
  category: string
  copyright: string
}

const {
  contactChannels,
  links,
  socials,
  legal,
  home,
  homeLabel,
  tagline,
  category,
  copyright,
} = defineProps<Props>()
</script>

<template>
  <div
    class="flex flex-col gap-footer-movil-bloques px-gutter pt-footer-movil-arriba pb-footer-movil-abajo"
  >
    <div class="flex flex-col items-start gap-footer-movil-marca">
      <!--
        `aria-current` cleared on purpose (feature 44, FR-028; review-43c nit
        5): the router marks any exact-active link "current page", and on the
        home that would announce the logo as well as the Home item.
      -->
      <NuxtLink
        :to="home"
        :aria-label="homeLabel"
        :aria-current="undefined"
        class="inline-flex rounded-control foco"
      >
        <Lockup />
      </NuxtLink>
      <p class="font-titulo text-lema text-blanco">{{ tagline }}</p>
      <p class="font-texto text-etiqueta text-gris-400">{{ category }}</p>
    </div>

    <ul class="flex flex-col gap-contacto-gap">
      <li v-for="channel in contactChannels" :key="channel.label">
        <ShellItemLink
          :item="channel"
          class="flex items-center justify-between gap-contacto-x rounded-contacto border border-linea bg-vidrio-fondo px-contacto-x py-contacto-y font-texto foco"
        >
          <span class="text-p font-semibold text-blanco">{{
            channel.label
          }}</span>
          <span class="text-p-chico whitespace-nowrap text-gris-400">
            {{ channel.hint
            }}<span aria-hidden="true" class="whitespace-pre"> →</span>
          </span>
        </ShellItemLink>
      </li>
    </ul>

    <ul class="font-texto text-p text-texto-suave">
      <li v-for="(item, index) in links" :key="item.label" class="inline">
        <ShellItemLink
          :item="item"
          :class="item.href ? 'rounded-control foco' : ''"
        />
        <span v-if="index < links.length - 1" aria-hidden="true"> · </span>
      </li>
    </ul>

    <SocialLinks :socials="socials" size="footer" />

    <div
      class="flex flex-col gap-legal-movil-gap border-t border-carbon-700 pt-legal-movil-arriba font-texto text-etiqueta text-gris-400"
    >
      <p>
        <template v-for="(item, index) in legal" :key="item.label">
          <ShellItemLink :item="item" />
          <span v-if="index < legal.length - 1" aria-hidden="true"> · </span>
        </template>
      </p>
      <p>{{ copyright }}</p>
    </div>
  </div>
</template>
