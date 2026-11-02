<script setup lang="ts">
import instagram from '@/assets/social/instagram.svg?raw'
import linkedin from '@/assets/social/linkedin.svg?raw'
import tiktok from '@/assets/social/tiktok.svg?raw'

/**
 * SocialIcon — a network's brand glyph in Muush 1.0 (feature 43, spec
 * FR-037, contract § 1).
 *
 * The three SVGs of `app/assets/social/` (already normalised to a 24 × 24
 * box with `fill="currentColor"`), inlined with `?raw` so the glyph takes the
 * current text colour (rules.md § R14). Roberto, 2026-11-01: the real brand
 * glyphs go inside the designed buttons, not the "in" / "ig" / "tt" text the
 * `.pen` draws (pen extract-43 § 9, Q2).
 *
 * Only the glyph: the caller owns the box, the size (a `size-*` class on
 * this element) and the accessible name. Decorative.
 */
export type SocialNetwork = 'linkedin' | 'instagram' | 'tiktok'

interface Props {
  network: SocialNetwork
}

const { network } = defineProps<Props>()

const GLYPHS = {
  linkedin,
  instagram,
  tiktok,
} satisfies Record<SocialNetwork, string>
</script>

<template>
  <span
    aria-hidden="true"
    class="glifo inline-flex shrink-0"
    v-html="GLYPHS[network]"
  />
</template>

<style scoped>
/* `:deep()`: Vue's scoped transform does not reach `v-html` content. */
.glifo :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
