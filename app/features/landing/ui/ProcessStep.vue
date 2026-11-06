<script setup lang="ts">
import { computed } from 'vue'
import type { StepIcon } from '@/features/landing/data/howWeWorkContent'
import CommitmentChip from './CommitmentChip.vue'

/**
 * One step of "Cómo trabajamos" (feature 44, spec FR-018, FR-021, FR-022,
 * FR-043…FR-047; pen extract-44 § 4; Roberto review 2026-11-02).
 *
 * Two independent states, because the two arrangements are lit by
 * different things: `lit` is the mobile rail's (scroll-driven, full by
 * default) and `columnLit` the desktop column's (hover / focus preview
 * only, unlit by default, FR-044). Each applies only to its arrangement.
 *
 * - From `lg`, a column (gap 16): the 28 px dot (lit: only the 12 px Red
 *   muush 500 core; not lit: a Negro 950 core with a 1.5 Blanco 40 % ring;
 *   no static halo in either state, the drawn halo is the radar ping,
 *   FR-048), the number (13 / 600, Blanco in both states,
 *   FR-046), the title (Poppins 22, Blanco), the description (15 / 1.5,
 *   Blanco 85 % lit, Gris 400 not) and the commitment chip.
 * - Below `lg`, a rail row (gap 14, at least 112 tall): the 14 px rail with
 *   its 12 px dot (solid red when lit, the not-lit ring otherwise) and,
 *   except the last step, the segment to the next dot, filled from the top
 *   by `fill`; then "01  Diagnóstico" in Poppins 17 (number included, in
 *   the title's Blanco), the 14 / 1.45 description in Blanco 70 % and the
 *   mobile chip.
 *
 * Every dot pings (`pulso`, pen extract-44 § 11; FR-047): a lit one in Red
 * muush 500, a not-lit one in its ring's Blanco 40 % (`pulso-tenue`). No
 * ping under reduced motion.
 *
 * The number is decorative (`aria-hidden`): the `<ol>` numbers the steps.
 * Step 01's short sentence shows below `lg`, the full one from `lg`.
 *
 * `raised` is the timeline's hover / focus preview (FR-043): from `lg` the
 * column grows to `--paso-escala` (1.04) from its top-left corner, so the
 * dot stays on the line; never under reduced motion. `focusable` makes the
 * column a tab stop from `lg` only, so keyboard users get the same preview.
 */
interface Props {
  number: string
  title: string
  description: string
  descriptionShort?: string
  commitment: string
  icon: StepIcon
  lit: boolean
  columnLit?: boolean
  fill: number
  isLast: boolean
  raised?: boolean
  focusable?: boolean
}

const {
  number,
  title,
  description,
  descriptionShort,
  commitment,
  icon,
  lit,
  columnLit = false,
  fill,
  isLast,
  raised = false,
  focusable = false,
} = defineProps<Props>()

const UNLIT_DOT =
  'border-(length:--trazo-anillo) border-texto-tenue bg-negro-950 pulso pulso-tenue'
const FADE =
  'transition-colors duration-(--medio) ease-muush motion-reduce:transition-none'
const segmentStyle = computed(() => ({ '--relleno': `${fill}` }))
</script>

<template>
  <li
    :data-lit="lit || undefined"
    :data-column-lit="columnLit || undefined"
    :data-elevado="raised || undefined"
    :tabindex="focusable ? 0 : undefined"
    :class="[
      'relative flex min-h-paso-movil gap-riel-gap foco lg:min-h-0 lg:origin-top-left lg:flex-col lg:gap-paso lg:transition-transform lg:duration-(--medio) lg:ease-muush motion-reduce:transition-none',
      raised && 'motion-safe:lg:scale-(--paso-escala)',
    ]"
  >
    <div aria-hidden="true" class="relative w-riel shrink-0 lg:hidden">
      <span
        :class="[
          'relative z-10 mx-auto block size-riel-punto rounded-full',
          FADE,
          lit ? 'bg-red-muush-500 pulso' : UNLIT_DOT,
        ]"
      />
      <span
        v-if="!isLast"
        data-segmento
        :style="segmentStyle"
        class="absolute top-riel-centro -bottom-riel-centro left-1/2 w-linea-riel -translate-x-1/2 bg-linea-fuerte"
      >
        <span
          class="absolute inset-0 origin-top scale-y-(--relleno) bg-red-muush-500 transition-transform duration-(--progreso-paso) ease-linear motion-reduce:transition-none"
        />
      </span>
    </div>
    <span
      aria-hidden="true"
      data-punto-paso
      class="hidden size-paso-punto place-items-center rounded-full lg:grid"
    >
      <span
        :class="[
          'relative size-paso-nucleo rounded-full',
          FADE,
          columnLit ? 'bg-red-muush-500 pulso' : UNLIT_DOT,
        ]"
      />
    </span>
    <div class="flex flex-col gap-paso-texto lg:contents">
      <span
        aria-hidden="true"
        class="hidden font-texto text-paso-numero text-blanco lg:block"
        >{{
          number
        }}</span
      >
      <h3 class="font-titulo text-paso text-blanco">
        <span aria-hidden="true" class="whitespace-pre lg:hidden">{{
          `${number}  `
        }}</span>{{ title }}
      </h3>
      <p
        :class="[
          'font-texto text-paso-texto text-texto-suave',
          FADE,
          columnLit ? 'lg:text-blanco-85' : 'lg:text-gris-400',
        ]"
      >
        <template v-if="descriptionShort">
          <span class="hidden lg:inline">{{ description }}</span>
          <span class="lg:hidden">{{ descriptionShort }}</span>
        </template>
        <template v-else>{{ description }}</template>
      </p>
      <CommitmentChip :text="commitment" :icon="icon" />
    </div>
  </li>
</template>
