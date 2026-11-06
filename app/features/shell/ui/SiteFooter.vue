<script setup lang="ts">
import type {
  ResolvedContactChannel,
  ResolvedFooterColumn,
  ResolvedShellItem,
  ResolvedSocial,
} from '@/features/shell/data/types'
import Lockup from '@/shared/ui/Lockup.vue'
import FooterColumns from './FooterColumns.vue'
import MobileFooter from './MobileFooter.vue'
import ShellItemLink from './ShellItemLink.vue'

/**
 * The Muush 1.0 footer (feature 43, spec FR-030…FR-035, contract § 7; pen
 * extract-43 § 6). Full width and transparent over the Negro 950 canvas,
 * with a 1 px Blanco 8 % rule on top. Two layouts, swapped at `lg`:
 *
 * - from `lg` (`K3vvqL`): padding 72 80 40 80, gap 56. The top row is
 *   `space-between`: the brand block (340 wide, gap 18: lockup 176 × 31,
 *   tagline Poppins 20 / 500 tracking −0.4, the category 14 / 1.5 Gris 400)
 *   and the four columns. The bottom row, over its own 1 px Blanco 8 %
 *   rule (padding-top 24): copyright left, privacy and terms right (gap
 *   24), all 13 / 400 Gris 400. Content caps at 1280 above 1440.
 * - below `lg`: `MobileFooter` (`kJfw5`).
 *
 * The inactive layout is `display: none`, so only one is announced.
 */
interface Props {
  columns: ResolvedFooterColumn[]
  contactChannels: ResolvedContactChannel[]
  mobileLinks: ResolvedShellItem[]
  socials: ResolvedSocial[]
  legal: ResolvedShellItem[]
  home: string
  homeLabel: string
  tagline: string
  category: string
  copyright: string
  label: string
}

const {
  columns,
  contactChannels,
  mobileLinks,
  socials,
  legal,
  home,
  homeLabel,
  tagline,
  category,
  copyright,
  label,
} = defineProps<Props>()
</script>

<template>
  <footer :aria-label="label" class="border-t border-blanco-8">
    <div
      data-escritorio
      class="hidden px-gutter-desktop pt-footer-arriba pb-footer-abajo lg:block"
    >
      <div class="mx-auto flex max-w-contenido flex-col gap-footer-bloques">
        <div class="flex justify-between gap-footer-columnas">
          <div
            class="flex min-w-0 shrink basis-footer-marca-ancho flex-col items-start gap-footer-marca"
          >
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
            <p class="font-texto text-categoria text-gris-400">
              {{ category }}
            </p>
          </div>
          <FooterColumns :columns="columns" />
        </div>

        <div
          class="flex justify-between gap-footer-legal border-t border-blanco-8 pt-footer-legal font-texto text-p-chico text-gris-400"
        >
          <p>{{ copyright }}</p>
          <p class="flex gap-footer-legal">
            <ShellItemLink
              v-for="item in legal"
              :key="item.label"
              :item="item"
            />
          </p>
        </div>
      </div>
    </div>

    <MobileFooter
      data-movil
      class="lg:hidden"
      :contact-channels="contactChannels"
      :links="mobileLinks"
      :socials="socials"
      :legal="legal"
      :home="home"
      :home-label="homeLabel"
      :tagline="tagline"
      :category="category"
      :copyright="copyright"
    />
  </footer>
</template>
