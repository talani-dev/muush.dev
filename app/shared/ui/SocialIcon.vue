<script setup lang="ts">
import instagram from '@/assets/social/instagram.svg?raw'
import linkedin from '@/assets/social/linkedin.svg?raw'
import tiktok from '@/assets/social/tiktok.svg?raw'

/**
 * SocialIcon — the 48×48 dark-glass square of the mobile menu, from
 * docs/business/landing/design-extract.md § 8.
 *
 * The glyph is inlined with `?raw` + `v-html` rather than referenced as an
 * image, so its `currentColor` fills resolve against `text-bone-100`. Served
 * as `<img>` it would stay the vendor's pure white and defeat the whole
 * normalization (docs/business/rules.md §§ R8, R14). The three assets are
 * consumed exactly as feature 1 delivered them.
 *
 * The `v-html` string is a build-time constant read from a reviewed file in
 * this repository. No caller, no route and no fetch can reach it.
 *
 * The accessible name comes from the caller, because the glyph carries no
 * text of its own.
 */
export type SocialNetwork = 'linkedin' | 'instagram' | 'tiktok'

interface Props {
  network: SocialNetwork
  /** The profile URL. Always opened in a new context. */
  href: string
  /** Accessible name — required, the glyph has no text. */
  label: string
}

const { network, href, label } = defineProps<Props>()

const glyphByNetwork = {
  linkedin,
  instagram,
  tiktok,
} satisfies Record<SocialNetwork, string>
</script>

<template>
  <!--
    biome-ignore lint/a11y/useAnchorContent: the accessible name is the
    required `label` prop, rendered as aria-label. The only child is the
    decorative glyph, deliberately hidden from assistive technology so it
    does not compete with that name.
  -->
  <a
    :href="href"
    :aria-label="label"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-grid size-social place-items-center rounded-icon border border-glass-line bg-glass-dark text-bone-100 focus-visible:outline-red-400"
  >
    <!--
      Only the outline colour is set: ui-map.md § 10 requires a visible
      red-400 indicator and forbids removing it, but documents no thickness
      or offset, so the platform default geometry stands (spec A-07 —
      UNVERIFIED against the design file, flagged for Clau).
    -->
    <span
      aria-hidden="true"
      class="inline-flex size-social-glyph"
      v-html="glyphByNetwork[network]"
    />
  </a>
</template>

<style scoped>
/*
 * `:deep()` is required, not stylistic: content injected by `v-html` is not
 * rewritten by Vue's scoped-style transform, so a plain `svg {}` rule would
 * never match it (docs/business/rules.md § R14). `100%`/`auto` are layout
 * keywords, not design values — there is no token for "fill your parent".
 */
:deep(svg) {
  width: 100%;
  height: auto;
}
</style>
