<script setup lang="ts">
import compass from '@/assets/icons/compass.svg?raw'
import layoutDashboard from '@/assets/icons/layout-dashboard.svg?raw'
import penTool from '@/assets/icons/pen-tool.svg?raw'
import workflow from '@/assets/icons/workflow.svg?raw'
import type {
  ServiceIcon,
  ServiceLight,
} from '@/features/landing/data/servicesContent'
import GlassSurface from '@/shared/ui/GlassSurface.vue'

/**
 * One service card (feature 44, spec FR-014; pen extract-44 § 3.1, § 8):
 * the `servicio` glass surface (Negro 900, radius 24, clipped, 1 px top-lit
 * edge), a 210-tall visual area lit from one corner, and the text block.
 *
 * The glass tile is 96 × 96, radius 28, centred in the visual area: a 200°
 * Carbón fill, a 1 px gradient edge, a 20 px backdrop blur and the shadow
 * of the `.pen`'s shadow tile (5 / 8, blur 36). Its 40 px lucide glyph is
 * Blanco, drawn at stroke 1.5 for the `.pen`'s "weight 300" (the asset
 * carries it, `app/assets/icons/README.md`) and decorative.
 *
 * Text: padding 22 / 24 / 28 / 24, gap 10; the title is Poppins 24 / 500
 * (`h3`) and keeps the design's forced line break (`\n` in the locale
 * file, `whitespace-pre-line`); the description is 15 / 1.5 in Blanco 70 %.
 * Mobile cards are 290 wide with the same inner values (§ 8).
 */
interface Props {
  title: string
  description: string
  icon: ServiceIcon
  light: ServiceLight
}

const { title, description, icon, light } = defineProps<Props>()

const ICONS = {
  compass,
  'layout-dashboard': layoutDashboard,
  workflow,
  'pen-tool': penTool,
} satisfies Record<ServiceIcon, string>

const LIGHTS = {
  crimsonBottomLeft: 'bg-(image:--luz-crimson)',
  aceroBottomRight: 'bg-(image:--luz-acero)',
  arenaTopRight: 'bg-(image:--luz-arena)',
} satisfies Record<ServiceLight, string>
</script>

<template>
  <GlassSurface preset="servicio" as="article" class="flex flex-col">
    <div
      data-visual
      :class="['grid h-tarjeta-visual place-items-center', LIGHTS[light]]"
    >
      <div
        class="relative grid size-tile place-items-center rounded-tile bg-(image:--tile-fondo) shadow-(--tile-sombra) backdrop-blur-boton borde-luz borde-tile"
      >
        <span
          aria-hidden="true"
          class="icono size-tile-icono text-blanco"
          v-html="ICONS[icon]"
        />
      </div>
    </div>
    <div
      class="flex flex-col gap-tarjeta-texto-gap px-tarjeta-texto-x pt-tarjeta-texto-arriba pb-tarjeta-texto-abajo"
    >
      <h3 class="font-titulo text-servicio whitespace-pre-line text-blanco">
        {{ title }}
      </h3>
      <p class="font-texto text-p text-texto-suave">{{ description }}</p>
    </div>
  </GlassSurface>
</template>

<style scoped>
/* `:deep()`: Vue's scoped transform does not reach `v-html` content
   (app/assets/icons/README.md). The wrapper's size token sizes the glyph. */
.icono :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
