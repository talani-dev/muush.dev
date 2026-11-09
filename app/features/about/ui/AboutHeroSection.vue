<script setup lang="ts">
import type { AboutHeroContent } from '@/features/about/data/aboutHeroContent'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'

/**
 * The Nosotros hero (feature 46, US1, spec FR-004…FR-007; pen extract-46
 * §§ 1.1, 2; frames `b0rao` desktop, `Docxh` mobile).
 *
 * Over the listón (`aboutHero` preset, high priority, its poster as the
 * no-WebGL fallback; the `.pen` mobile uniforms below 1024). One centred
 * column, centred in the section both ways: the pill, the page's only `h1`
 * (line 2 in Gris 400) and the intro. No buttons.
 *
 * - 1440: x padding 80, gap 28; heading 64 (the v2
 *   scale, 1.08, Roberto 2026-11-02); intro 20 / 1.5, 720 wide.
 * - 390: x padding 24, gap 24; heading 32 / 1.15, line 2 wrapping; intro
 *   16 / 1.5.
 *
 * Height and vertical padding are the section framing (`global.css`,
 * Roberto 2026-11-08), shared with the home hero: at least a full viewport, the column centred
 * below the floating header (the `.pen` drew 700 → 820 tall).
 *
 * The pill carries `pill-aire` (Roberto 2026-11-02, spec 045 FR-041).
 * Copy arrives as props; no Nuxt composable here (`rules.md` § R23).
 */
type Props = AboutHeroContent

const { pill, headingFirst, headingSecond, intro } = defineProps<Props>()
</script>

<template>
  <section
    class="relative isolate flex min-h-portada-alto flex-col"
    data-track-section="hero"
  >
    <ShaderBackground preset="aboutHero" />
    <div
      class="relative z-10 flex flex-1 flex-col items-center justify-center gap-pagina-gap px-gutter pt-seccion-arriba pb-seccion-aire text-center lg:px-gutter-desktop"
    >
      <Pill class="pill-aire" :label="pill" />
      <Heading
        :level="1"
        size="pagina"
        :first="headingFirst"
        :second="headingSecond"
      />
      <p
        class="max-w-pagina-intro font-texto text-pagina-intro text-texto-suave"
      >
        {{ intro }}
      </p>
    </div>
  </section>
</template>
