<script setup lang="ts">
import type { ResolvedShellItem } from '@/features/shell/data/types'
import BotonPrimario from '@/shared/ui/BotonPrimario.vue'
import Pill from '@/shared/ui/Pill.vue'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'
import NotFoundRings from './NotFoundRings.vue'

/**
 * The not-found page's content (feature 36): the `<main>` of Roberto's
 * reference, `specs/036-not-found-page/reference/404.html`, in its order —
 * Pill, heading, subtitle, LED button, shortcuts. The layout supplies nav,
 * footer, dotted paper and spotlight around it.
 *
 * Presentational: every string and href arrives resolved
 * (`useNotFoundContent`), no Nuxt composable is called here (rules.md § R23).
 *
 * ## Mapping to the site's tokens (research.md R6; gate G2/G3)
 *
 * Existing pieces are reused and win over the reference by a few px:
 * `Pill` (padding start −2, gap +1, 7 px pinging dot instead of 8 px static
 * glowing dot), `text-display` for the heading (+2 px at 390, +10 px at 1440),
 * `BotonPrimario variant="hero"` (~55 px tall at 1440 vs 48), `text-body-sm`
 * for the subtitle (line-height +0.05), `text-footer-item` for the shortcuts
 * (+1 px at 1440). Horizontal padding is the layout's `px-page`.
 *
 * ## The red background glow (gate G4, research.md R6b)
 *
 * The reference's top-right red bloom, through the site's own mechanism: an
 * existing `SectionGlow` pair (red-400 / 60 / `1400-700`) inside
 * `SectionBackdrop`, so it paints on `--layer-glow`, beneath the dotted
 * paper. Recorded deltas vs the reference: opacity 55 → 60 %, diameter
 * 1440 → 1400 at 1440 and 1440 → 700 at 390. No new glow token: the
 * `--color-glow-*` / `--spacing-glow-*` namespace is closed (rules.md § R36).
 * Only its position is new (`--spacing-not-found-glow-x/y`).
 *
 * ⚠️ `SectionBackdrop.vue` contract: this `<section>` stays
 * `position: relative`, creates no stacking context and paints no opaque
 * background, or the glow ends up above the dots or hidden.
 */
interface Props {
  eyebrow: string
  headline: string
  body: string
  cta: ResolvedShellItem
  /** Accessible name of the shortcuts landmark ("Atajos" / "Shortcuts"). */
  shortcutsLabel: string
  /** Exactly three, in render order: purpose, services, about. */
  shortcuts: ResolvedShellItem[]
}

const { eyebrow, headline, body, cta, shortcutsLabel, shortcuts } =
  defineProps<Props>()
</script>

<template>
  <section
    class="relative flex min-h-not-found-min-h items-center justify-center pt-not-found-top pb-not-found-bottom"
  >
    <SectionBackdrop>
      <SectionGlow
        color="red-400"
        :opacity="60"
        size="1400-700"
        class="absolute top-not-found-glow-y left-not-found-glow-x -translate-x-1/2 -translate-y-1/2"
      />
    </SectionBackdrop>

    <NotFoundRings />

    <div
      class="relative flex max-w-not-found-content flex-col items-center text-center"
    >
      <Pill :label="eyebrow" class="mb-not-found-pill-gap" />

      <h1
        class="mb-not-found-title-gap font-instrument text-display text-balance text-bone-100"
      >
        {{ headline }}
      </h1>

      <p
        class="mb-not-found-body-gap max-w-not-found-measure font-instrument text-body-sm text-ink-100"
      >
        {{ body }}
      </p>

      <BotonPrimario variant="hero" :href="cta.href">
        {{ cta.label }}
      </BotonPrimario>

      <nav
        :aria-label="shortcutsLabel"
        class="mt-not-found-cta-gap flex flex-wrap items-center justify-center gap-x-not-found-shortcut-gap-x gap-y-not-found-shortcut-gap-y"
      >
        <template v-for="(shortcut, index) in shortcuts" :key="shortcut.label">
          <span v-if="index > 0" aria-hidden="true" class="text-ink-300"
            >·</span
          >
          <NuxtLink
            :to="shortcut.href"
            class="px-not-found-shortcut-x py-not-found-shortcut-y font-instrument text-footer-item text-ink-100 transition-colors hover:text-bone-100 focus-visible:outline-red-400 motion-reduce:transition-none"
          >
            {{ shortcut.label }}
          </NuxtLink>
        </template>
      </nav>
    </div>
  </section>
</template>
