<script setup lang="ts">
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'

/**
 * The Preguntas vidrio acanalado band (feature 51, spec FR-020; handoff
 * README "Fondo · vidrio acanalado"; research R4).
 *
 * A full-width box measured from the top of the page block, which is the
 * page top (the header floats over it): top 68 → 84, height 300 → 600. It
 * sits beside the block's centred content layer, never inside it, so the
 * site-wide centring (OQ-1 = B) never moves it; with tall content the title
 * may sit over the band, which Roberto accepted. The rest of the page is
 * the layout's Negro 950.
 *
 * It hosts the shared `ShaderBackground` with the `faq` preset, which fills
 * it and carries every rule of the animations handoff: poster without
 * WebGL, paused off screen and in a hidden tab, one still frame under
 * reduced motion, capped resolution. Decorative: no pointer, hidden from
 * assistive technology.
 */
</script>

<template>
  <div
    aria-hidden="true"
    data-faq-franja
    class="pointer-events-none absolute inset-x-0 top-faq-franja-arriba h-faq-franja-alto"
  >
    <ShaderBackground preset="faq" />
  </div>
</template>
