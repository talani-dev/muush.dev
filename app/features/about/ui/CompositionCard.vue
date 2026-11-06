<script setup lang="ts">
import type { CompositionKind } from '@/features/about/data/teamCompositionContent'

/**
 * One "Cómo se arma" card (feature 46, spec FR-010…FR-012, FR-014; pen
 * extract-46 § 1.2, leader § 6; research R11).
 *
 * A list item: the glass-panel black (`vidrio-fondo`, `#0B0B0BB3`), radius
 * 24, a flat 1 px Blanco 12 % edge (`borde-luz borde-linea`, the painted
 * band, so it adds no size); no blur and no shadow. Padding 24 → 32, gap
 * 14. Inside: the label row (gap 10; an 8 px dot and the label 14 / 600
 * Gris 400), the title (Poppins 26 / 500 Blanco, an `h3` under the
 * section's `h2`) and the text (17 / 1.5 Blanco 70 %).
 *
 * From `lg` the title's box extends into the card's end padding: the `.pen`
 * draws "Cuando el proyecto lo pide" (`wxw3m`) as one 355 px line in the
 * 336 px content box, about 19 px into the padding and 13 from the edge, so
 * the cards are 197 tall at 1440 (leader, 2026-11-02). The extension is the
 * padding minus a 10 px floor (`tarjeta-equipo-titulo-fin`; the English
 * title is 357 px), so no title comes closer than 10 to the edge; narrower
 * cards (1024–1439) wrap it within that. Below `lg` nothing changes
 * (review-46, fix round 1).
 *
 * The dot is decorative (`aria-hidden`) and carries the shared radar ping
 * (`pulso`) in its own colour, none under reduced motion (Roberto
 * 2026-11-02, Clarifications Q4): Red muush 500 for the core team, Blanco
 * for the talent pool, Acero 200 for the partners.
 */
interface Props {
  kind: CompositionKind
  label: string
  title: string
  text: string
}

const { kind, label, title, text } = defineProps<Props>()

const DOT_CLASSES = {
  team: 'bg-red-muush-500',
  pool: 'bg-blanco',
  partner: 'bg-acero-200',
} satisfies Record<CompositionKind, string>
</script>

<template>
  <li
    class="relative flex flex-col gap-tarjeta-equipo-gap rounded-servicio bg-vidrio-fondo p-tarjeta-equipo text-start borde-luz borde-linea"
  >
    <p
      class="flex items-center gap-tarjeta-equipo-rotulo font-texto text-tarjeta-equipo-rotulo text-gris-400"
    >
      <span
        aria-hidden="true"
        data-punto
        :class="[
          'relative size-tarjeta-equipo-punto shrink-0 rounded-full pulso',
          DOT_CLASSES[kind],
        ]"
      />
      {{ label }}
    </p>
    <h3
      class="font-titulo text-tarjeta-equipo-titulo text-blanco lg:-me-tarjeta-equipo-titulo-fin"
    >
      {{ title }}
    </h3>
    <p class="font-texto text-tarjeta-equipo-texto text-texto-suave">
      {{ text }}
    </p>
  </li>
</template>
