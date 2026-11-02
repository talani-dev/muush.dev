<script setup lang="ts">
/**
 * Pill — the Muush 1.0 capsule with the red dot (feature 42, spec FR-011,
 * contract § 2; Kit component `XqFl6`, pen extract § 2).
 *
 * Carbón 800 at 60 %, a 1 px Blanco 12 % edge, 16 px backdrop blur, padding
 * 8 / 18 / 8 / 10, gap 10, and a label in Instrument Sans 13 / 500 with
 * 0.6 px tracking. The dot is a 7 px Red muush 500 circle centred in a
 * 20 px footprint, with the radar ping (`pulso`): the 14 / 20 halos the
 * Kit draws are how a mockup draws that ping (pen extract-44 § 9, Roberto
 * 2026-11-01), so they are not painted as rings. Decorative and hidden from
 * assistive technology. The 20 px footprint is the tallest child, so the
 * capsule is 8 + 20 + 8 = 36 px tall at both anchors; the ghost overflows it
 * without moving anything.
 *
 * The edge is the painted `borde-luz` band rather than a CSS border, which
 * would add 2 px to that height; the `.pen`'s stroke takes no layout space.
 *
 * The label comes from the caller (FR-016); the default slot replaces it,
 * which is how `RotatingPill` animates it.
 */
interface Props {
  label?: string
}

const { label = '' } = defineProps<Props>()
</script>

<template>
  <div
    class="relative inline-flex items-center gap-pill-gap rounded-pill bg-pill-fondo py-pill-y ps-pill-inicio pe-pill-fin backdrop-blur-pill borde-luz borde-linea font-texto text-pill text-blanco"
  >
    <span
      aria-hidden="true"
      data-punto
      class="grid size-pill-punto shrink-0 place-items-center"
    >
      <span
        class="relative size-pill-nucleo rounded-full bg-red-muush-500 pulso"
      />
    </span>
    <slot>{{ label }}</slot>
  </div>
</template>
