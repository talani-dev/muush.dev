<script setup lang="ts">
import Pill from './Pill.vue'

/**
 * HeroStack — the Pill + headline + intro pattern shared by every Hero-shaped
 * section on the site. Landing's `01 Hero` and About's `01 Hero` (feature 17)
 * render the identical three children in the identical order; the landing one
 * appends a CTA row after them and the About one does not. That is the
 * **entire** structural difference the two frames draw, so it lives here as a
 * shared base plus a default slot, never as two components that duplicate the
 * same three tags (Constitution Article VIII, DRY) — the reuse the leader
 * asked for rather than a second copy of Pill+h1+p.
 *
 * `variant` selects each frame's own type roles and widths — never a size a
 * fluid token should already cover (Article VII):
 *
 * | | `landing` | `about` |
 * |---|---|---|
 * | Headline role | `--text-display` | `--text-h1` |
 * | Body role | `--text-body-lg` | `--text-body` |
 * | Stack width | `--spacing-hero-body` (900) | `--spacing-about-hero-body` (960) |
 * | Body measure | `--spacing-hero-measure` (600) | `--spacing-about-hero-measure` (700) |
 *
 * design-extract.md § 9 documents both roles ("H1 (hero Nosotros)" /
 * "Body (intro Nosotros)") already — no new type token exists for this
 * feature, only the two width tokens the design's own 960/700 frame needs.
 *
 * Complete class strings, looked up from a closed map per variant, never
 * assembled by concatenation (`component-contracts.md`'s convention):
 * Tailwind scans literal source text, so a template literal would name a
 * utility the stylesheet never emits.
 *
 * The default slot is the one structural difference: absent for About, the
 * CTA row for Landing. It renders after the intro copy, which is where both
 * frames draw it.
 */
export type HeroStackVariant = 'landing' | 'about'

interface Props {
  variant?: HeroStackVariant
  eyebrow: string
  headline: string
  body: string
}

const { variant = 'landing', eyebrow, headline, body } = defineProps<Props>()

const STACK_CLASSES = {
  landing: 'flex max-w-hero-body flex-col items-start gap-hero-gap',
  about: 'flex max-w-about-hero-body flex-col items-start gap-about-hero-gap',
} satisfies Record<HeroStackVariant, string>

const HEADLINE_CLASSES = {
  landing: 'w-full font-instrument text-display text-bone-100',
  about: 'w-full font-instrument text-h1 text-bone-100',
} satisfies Record<HeroStackVariant, string>

const BODY_CLASSES = {
  landing:
    'w-full max-w-hero-measure font-instrument text-body-lg text-ink-100',
  about:
    'w-full max-w-about-hero-measure font-instrument text-body text-ink-100',
} satisfies Record<HeroStackVariant, string>
</script>

<template>
  <div :class="STACK_CLASSES[variant]">
    <Pill :label="eyebrow" />

    <h1 :class="HEADLINE_CLASSES[variant]">
      {{ headline }}
    </h1>

    <p :class="BODY_CLASSES[variant]">
      {{ body }}
    </p>

    <slot />
  </div>
</template>
