<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import arrowRight from '@/assets/icons/arrow-right.svg?raw'

/**
 * PrimaryButton — the red primary action of Muush 1.0 (feature 42, spec
 * FR-012, FR-017, contract § 4; Kit component `FcCCF`, pen extract § 2).
 *
 * The three-stop red gradient, a 1 px white 20 % edge, the red shadow, the
 * pill radius, an Instrument Sans 600 Blanco label and the lucide
 * `arrow-right`. Sizes measured in the `.pen`:
 *
 * | size  | where                     | padding | label | arrow | box     |
 * |-------|---------------------------|---------|-------|-------|---------|
 * | hero  | below `lg` (mobile hero)  | 12 / 14 | 14    | 20    | 178 × 44 |
 * | hero  | from `lg` (desktop hero)  | 16 / 30 | 19    | 20    | 253 × 55 |
 * | nav   | desktop nav CTA           | 11 / 20 | 15    | 16    | 195 × 40 |
 * | block | form submit, full width   | 16 / 30 | 19    | 20    | 302 × 55 at 390 |
 *
 * The arrow is visible at every width and every size: the mobile hero and
 * the mobile form submit draw the same 20 px lucide arrow as the desktop
 * hero (pen extract § 9, leader check of frame `V2s7T`, 2026-11-01). So the
 * mobile box is 14 + 120 label + 10 gap + 20 arrow + 14 = 178 wide and
 * 12 + 20 + 12 = 44 tall. Only `icon=false` removes it.
 *
 * The edge is the painted `borde-luz` band, not a CSS border: a border
 * would add 2 px to every box above, where the `.pen`'s stroke adds none.
 *
 * Link or button (research R15): `to` → `<NuxtLink>`, else `href` → `<a>`,
 * else a real `<button>` with `type`. `disabled` applies to the button only.
 * Hover, press and disabled come from the handoff's `componentes.css` (the
 * `.pen` draws no states); keyboard focus is the Blanco ring (`foco`,
 * Clarifications Q3, confirmed by Roberto 2026-10-31). The brand cursor
 * comes from the global rules in `global.css`, as on every control.
 */
export type PrimaryButtonSize = 'hero' | 'nav' | 'block'

interface Props {
  label: string
  to?: RouteLocationRaw
  href?: string
  type?: 'button' | 'submit'
  size?: PrimaryButtonSize
  icon?: boolean
  disabled?: boolean
}

const {
  label,
  to,
  href,
  type = 'button',
  size = 'hero',
  icon = true,
  disabled = false,
} = defineProps<Props>()

const BASE_CLASSES =
  'relative inline-flex items-center justify-center gap-boton-gap whitespace-nowrap rounded-pill bg-(image:--btn-fondo) borde-luz borde-btn shadow-boton font-texto font-semibold text-blanco transition duration-(--rapido) ease-muush hover:brightness-(--btn-brillo) active:scale-(--btn-presion) disabled:opacity-70 disabled:cursor-progress foco'

const SIZE_CLASSES = {
  hero: 'py-boton-movil-y px-boton-movil-x text-boton-movil lg:py-boton-y lg:px-boton-x lg:text-boton-hero',
  nav: 'py-boton-nav-y px-boton-nav-x text-boton-nav',
  block: 'w-full py-boton-y px-boton-x text-boton-hero',
} satisfies Record<PrimaryButtonSize, string>

const ICON_CLASSES = {
  hero: 'size-boton-icono',
  nav: 'size-boton-icono-nav',
  block: 'size-boton-icono',
} satisfies Record<PrimaryButtonSize, string>

const rootClasses = computed(() => [BASE_CLASSES, SIZE_CLASSES[size]])
const iconClasses = computed(() => ['icono shrink-0', ICON_CLASSES[size]])
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="rootClasses">
    <span>{{ label }}</span>
    <span
      v-if="icon"
      data-icono
      aria-hidden="true"
      :class="iconClasses"
      v-html="arrowRight"
    />
  </NuxtLink>
  <a v-else-if="href" :href="href" :class="rootClasses">
    <span>{{ label }}</span>
    <span
      v-if="icon"
      data-icono
      aria-hidden="true"
      :class="iconClasses"
      v-html="arrowRight"
    />
  </a>
  <button v-else :type="type" :disabled="disabled" :class="rootClasses">
    <span>{{ label }}</span>
    <span
      v-if="icon"
      data-icono
      aria-hidden="true"
      :class="iconClasses"
      v-html="arrowRight"
    />
  </button>
</template>

<style scoped>
/*
 * `:deep()` is required: Vue's scoped transform does not rewrite `v-html`
 * content (app/assets/icons/README.md). The wrapper's size token decides the
 * arrow's size; the glyph fills it.
 */
.icono :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
