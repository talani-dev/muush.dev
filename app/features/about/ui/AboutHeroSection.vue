<script setup lang="ts">
import HeroStack from '@/shared/ui/HeroStack.vue'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'

/**
 * `01 Hero` of Nosotros/About — the page's first section, and explicitly the
 * landing Hero's sibling: same three children (Pill, headline, intro copy)
 * over the same three-glow backdrop, minus the CTA row. `ui-map.md` § 9
 * documents it as "Estático, sin botones" — there is nothing to click here.
 *
 * The Pill + headline + intro are `HeroStack.vue` (`app/shared/ui/`) with
 * `variant="about"` — the shared base this section reuses from the landing
 * Hero rather than duplicating the same three tags (Constitution
 * Article VIII). No default slot content is passed, which is the entire
 * structural difference from `landing/ui/HeroSection.vue`.
 *
 * It calls **no composable at all**: copy arrives already translated from
 * `logic/useAboutHeroContent.ts`, and this section needs no sentinel — the
 * nav's CTA does not animate outside the landing page
 * (`ui-map.md` § 2: "Nosotros, y cualquier otra página: el botón está desde
 * el inicio, sin animación").
 *
 * ---
 *
 * ## The four rules this component must not break
 *
 * `SectionBackdrop.vue`'s doc comment is the contract, and its failure mode is
 * **silent** — no error, no failing test, the page simply stops matching the
 * design.
 *
 * 1. **No stacking context anywhere in this subtree, except on an individual
 *    glow.** Not on the `<section>`, not on the stack: no `transform`,
 *    `translate`, `scale`, `rotate`, `filter`, `backdrop-filter`, `opacity`
 *    below 1, `isolation`, `will-change`, `contain: paint`,
 *    `position: fixed`, or `position: sticky` with a `z-index`. The three
 *    `-translate-x-1/2 -translate-y-1/2` pairs are the one permitted
 *    exception, because the context a glow creates contains only its own empty
 *    subtree.
 * 2. **No opaque background on the section.** It would hide its own glows.
 * 3. **No bottom padding and no horizontal padding.** The next block on the
 *    page owns the separation, and `<main>` already applies `px-page`
 *    (24 → 80) — the same convention every section on the site follows
 *    (`rules.md` § R49).
 * 4. **The three glow opacities are Landing's own 60/37/28, on BOTH
 *    viewports.** The `.pen`'s mobile frame draws 65/40/30 — Roberto reviewed
 *    this on 2026-09-08 and ruled it a design-file error, not intent. This is
 *    the one place on the site where the design file itself is wrong, so the
 *    component does **not** "correct" itself to match it.
 *
 * The three glows reuse the exact colour+opacity+size pairs `SectionGlow`
 * already declares for Landing's own Hero (`--color-glow-red-400-60`,
 * `--color-glow-wine-300-37`, `--color-glow-wine-400-28`,
 * `--spacing-glow-1400-700`, `--spacing-glow-1000-520`,
 * `--spacing-glow-860-520`) — no new colour/size token exists for this
 * feature (`rules.md` § R36's closed namespace). Only the six anchor tokens
 * are new, because the two Heroes place their glows at different offsets.
 *
 * The section carries no `aria-label` and no `id`: it holds the page's `<h1>`,
 * same precedent as the landing Hero (spec-equivalent to that section's A-08).
 */
interface Props {
  eyebrow: string
  headline: string
  intro: string
}

defineProps<Props>()
</script>

<template>
  <section class="relative pt-about-hero-top">
    <!--
      The three glows of the Nosotros Hero, each anchored **by its centre** at
      an offset from this section's own top-left corner — never at a page
      offset, which would drift the moment anything above the section changed
      height (`rules.md` §§ R29, R48).
    -->
    <SectionBackdrop>
      <SectionGlow
        color="red-400"
        :opacity="60"
        size="1400-700"
        class="absolute top-about-hero-glow-foco-y left-about-hero-glow-foco-x -translate-x-1/2 -translate-y-1/2"
      />
      <SectionGlow
        color="wine-300"
        :opacity="37"
        size="1000-520"
        class="absolute top-about-hero-glow-wine-y left-about-hero-glow-wine-x -translate-x-1/2 -translate-y-1/2"
      />
      <SectionGlow
        color="wine-400"
        :opacity="28"
        size="860-520"
        class="absolute top-about-hero-glow-cierre-y left-about-hero-glow-cierre-x -translate-x-1/2 -translate-y-1/2"
      />
    </SectionBackdrop>

    <HeroStack
      variant="about"
      :eyebrow="eyebrow"
      :headline="headline"
      :body="intro"
    />
  </section>
</template>
