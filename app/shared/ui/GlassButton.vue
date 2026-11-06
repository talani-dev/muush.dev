<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

/**
 * GlassButton — the secondary glass action of Muush 1.0 (feature 42, spec
 * FR-013, FR-017, contract § 5; Kit component `p0X8nQ`, pen extract § 2).
 *
 * Carbón 800 at 55 %, a 20 px backdrop blur, the 1 px edge fading from
 * Blanco 25 % to 6 % (`borde-luz borde-boton`), the pill radius and an
 * Instrument Sans 500 Blanco label, no icon. Measured in the `.pen`: 16 / 28,
 * 17 px, 198 × 53 from `lg`; 12 / 14, 14 px, 145 × 41 below it.
 *
 * Link or button and the focus ring as in `PrimaryButton` (research R15,
 * Clarifications Q3). Press scale from the handoff's `componentes.css`; the
 * handoff gives the glass button no hover state, so it has none here.
 *
 * One size only, so no `size` prop (feature 43, review-42b advisory 2): the
 * 390 / 1440 difference is the `lg:` swap below.
 *
 * Shares no base component with `PrimaryButton`: fill, edge, icon and
 * sizes all differ, and a base for two callers would be a premature
 * abstraction (plan § 4, Article VIII).
 */
interface Props {
  label: string
  to?: RouteLocationRaw
  href?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

const {
  label,
  to,
  href,
  type = 'button',
  disabled = false,
} = defineProps<Props>()

const ROOT_CLASSES =
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-pill bg-btn2-fondo backdrop-blur-boton borde-luz borde-boton font-texto font-medium text-blanco transition duration-(--rapido) ease-muush active:scale-(--btn-presion) disabled:opacity-70 disabled:cursor-progress foco py-boton-movil-y px-boton-movil-x text-boton-movil lg:py-boton-y lg:px-boton-vidrio-x lg:text-boton-vidrio'
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="ROOT_CLASSES">{{ label }}</NuxtLink>
  <a v-else-if="href" :href="href" :class="ROOT_CLASSES">{{ label }}</a>
  <button v-else :type="type" :disabled="disabled" :class="ROOT_CLASSES">
    {{ label }}
  </button>
</template>
