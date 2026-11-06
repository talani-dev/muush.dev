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
 * | compact | cookie preferences save (feature 48) | 11 / 20 | 14 | — | 167 × 39 |
 *
 * The arrow is visible at every width and every size: the mobile hero and
 * the mobile form submit draw the same 20 px lucide arrow as the desktop
 * hero (pen extract § 9, leader check of frame `V2s7T`, 2026-11-01). So the
 * mobile box is 14 + 120 label + 10 gap + 20 arrow + 14 = 178 wide and
 * 12 + 20 + 12 = 44 tall. Only `icon=false` removes it.
 *
 * `unavailable` (feature 45, spec FR-009, contract): the button is shown
 * at 70 % opacity with the not-allowed cursor (pen extract-45 § 8) and
 * carries `aria-disabled="true"`, but stays focusable and clickable, so a
 * keyboard user reaches it and hears why (`describedBy`, the id of a
 * visually hidden hint). The form's own guard decides what a click does.
 * Native `disabled` stays for "busy" ("Enviando…").
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
export type PrimaryButtonSize = 'hero' | 'nav' | 'block' | 'compact'

interface Props {
  label: string
  to?: RouteLocationRaw
  href?: string
  type?: 'button' | 'submit'
  size?: PrimaryButtonSize
  icon?: boolean
  disabled?: boolean
  unavailable?: boolean
  describedBy?: string
}

const {
  label,
  to,
  href,
  type = 'button',
  size = 'hero',
  icon = true,
  disabled = false,
  unavailable = false,
  describedBy,
} = defineProps<Props>()

const BASE_CLASSES =
  'relative inline-flex items-center justify-center gap-boton-gap whitespace-nowrap rounded-pill bg-(image:--btn-fondo) borde-luz borde-btn shadow-boton font-texto font-semibold text-blanco transition duration-(--rapido) ease-muush hover:brightness-(--btn-brillo) active:scale-(--btn-presion) disabled:opacity-70 disabled:cursor-progress foco'

const SIZE_CLASSES = {
  hero: 'py-boton-movil-y px-boton-movil-x text-boton-movil lg:py-boton-y lg:px-boton-x lg:text-boton-hero',
  nav: 'py-boton-nav-y px-boton-nav-x text-boton-nav',
  block: 'w-full py-boton-y px-boton-x text-boton-hero',
  /* "Guardar mi elección" (pen-extract-48, `P5UI3` / `kDst7`): the nav
     padding with the 14 px label, drawn without the arrow. */
  compact: 'py-boton-nav-y px-boton-nav-x text-boton-movil',
} satisfies Record<PrimaryButtonSize, string>

const ICON_CLASSES = {
  hero: 'size-boton-icono',
  nav: 'size-boton-icono-nav',
  block: 'size-boton-icono',
  compact: 'size-boton-icono-nav',
} satisfies Record<PrimaryButtonSize, string>

/* The brand cursor rules in `global.css` set the not-allowed cursor from
   `aria-disabled`; the utility covers forced-colours mode, where they are
   off. */
const UNAVAILABLE_CLASSES = 'opacity-70 cursor-not-allowed'

const rootClasses = computed(() => [
  BASE_CLASSES,
  SIZE_CLASSES[size],
  unavailable ? UNAVAILABLE_CLASSES : '',
])
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
  <button
    v-else
    :type="type"
    :disabled="disabled"
    :aria-disabled="unavailable || undefined"
    :aria-describedby="describedBy"
    :class="rootClasses"
  >
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
