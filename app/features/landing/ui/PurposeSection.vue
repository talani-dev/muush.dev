<script setup lang="ts">
import type { PurposeNodeContent } from '@/features/landing/data/purposeContent'
import Pill from '@/shared/ui/Pill.vue'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'
import PurposeCarousel from './PurposeCarousel.vue'
import PurposeConstellation from './PurposeConstellation.vue'

/**
 * `02 Propósito` — the landing's second section, and the site's most divergent:
 * a Golden Circle constellation at desktop width, a three-card carousel below
 * it. Two compositions, not one rescaled, and the inactive one is `display:
 * none` so no copy is announced twice (spec FR-002).
 *
 * The `id` is Spanish because the Constitution's Article VI keeps translated
 * route segments and Spanish anchors, and it closes three of the five dangling
 * anchors `rules.md` § R50 records — the footer's *Navegación* column and the
 * mobile menu already point three links at `#proposito`. The shell keeps
 * owning those links and neither feature imports the other; the literal
 * appears in both, which Article III prefers to a shared anchor registry.
 *
 * It calls **no Nuxt composable**: copy arrives already translated from
 * `logic/usePurposeContent.ts`, which is what lets this render in Storybook and
 * in a bare mount (`rules.md` § R23).
 *
 * ---
 *
 * ## The five rules this component must not break
 *
 * `SectionBackdrop.vue`'s doc comment is the contract, and this is only the
 * second section it governs. Its failure mode is **silent** — no error, no
 * failing test, the page simply stops matching the design.
 *
 * 1. **No stacking context on this section, or on any wrapper above it.** Not
 *    `transform`, `translate`, `scale`, `rotate`, `filter`, `backdrop-filter`,
 *    `opacity` below 1, `isolation`, `will-change`, `contain: paint`,
 *    `position: fixed`, or `sticky` with a `z-index`. Any of them lifts this
 *    subtree — glows included — above the page-wide dot sheet.
 * 2. **The descendant contexts below are permitted, and they are deliberate.**
 *    The three glows' `-translate-x-1/2 -translate-y-1/2`, the arcs'
 *    `translate`, the constellation trigger's `translate`, each card's
 *    `opacity`, the carousel neighbour's `scale` and every glass surface's
 *    `backdrop-filter` each create a context for **its own subtree only**. The
 *    contract binds this section and its *ancestors*; a leaf in the content
 *    layer cannot lift the backdrop, which is a **sibling**.
 * 3. **No opaque background.** A section background paints after the negative
 *    levels and would hide the section's own glows.
 * 4. **No bottom padding and no horizontal padding.** The gap to Servicios
 *    belongs to Servicios (`rules.md` § R49) — this section passes on a
 *    **101px** desktop remainder — and `<main>` already applies `px-page`.
 * 5. **The arcs' clip is on a wrapper, never on the section.** `overflow:
 *    clip` on the section would cut its own ~1000px glows hard at the section
 *    box; on an `absolute inset-0` wrapper it clips to the same box, creates no
 *    stacking context, and leaves the glows soft (spec FR-018).
 *
 * The arcs live here rather than in `PurposeConstellation` for one reason: they
 * centre on a point 270px **above** the constellation's own box, so only a
 * wrapper whose `inset-0` resolves against the *section* can place them where
 * the design measures them from. They are ordered before both compositions so
 * the cards paint over them, which is what `A-09` asks for — the arcs are
 * composition in the content layer, above the dotted paper and below the copy.
 *
 * The section carries no `aria-label`, matching the Hero's precedent: the `id`
 * is a scroll target, not a landmark (spec A-08). No `scroll-margin-top`
 * either — the section's own top padding (254 desktop / 90 mobile) comfortably
 * exceeds the pinned nav's measured height (102.8 / 78.19,
 * `findings.md` § R55), so a jump to `#proposito` lands the Pill below the nav.
 */
interface Props {
  eyebrow: string
  /** The mobile carousel's accessible name. Same word, different role. */
  carouselLabel: string
  nodes: PurposeNodeContent[]
}

const { eyebrow, carouselLabel, nodes } = defineProps<Props>()
</script>

<template>
  <section id="proposito" class="relative pt-purpose-top">
    <!--
      Three glows, each anchored **by its centre** at an offset from this
      section's own top-left corner — never at a page offset, which would drift
      the moment anything above the section changed height
      (`rules.md` §§ R29, R48). Both endpoints of every anchor are measured;
      nothing is derived from the other viewport.

      `Glow origen` is the third, and it is desktop-only because the design
      gives it no mobile size (spec FR-028). It is also the consumer that makes
      `SectionGlow`'s `'920'` size variant not dead code — feature 7 nearly
      deleted it.
    -->
    <SectionBackdrop>
      <SectionGlow
        color="wine-400"
        :opacity="20"
        size="1000-560"
        class="absolute top-purpose-glow-a-y left-purpose-glow-a-x -translate-x-1/2 -translate-y-1/2"
      />
      <SectionGlow
        color="wine-300"
        :opacity="17"
        size="820-480"
        class="absolute top-purpose-glow-b-y left-purpose-glow-b-x -translate-x-1/2 -translate-y-1/2"
      />
      <SectionGlow
        color="red-400"
        :opacity="12"
        size="920"
        class="absolute top-purpose-origen-y left-purpose-origen-x hidden -translate-x-1/2 -translate-y-1/2 lg:block"
      />
    </SectionBackdrop>

    <!--
      The three concentric arcs of the Golden Circle. `overflow-clip` is here
      and never on the section (rule 5 above), and `clip` rather than `hidden`
      so the wrapper never becomes a scroll container — the same distinction
      `app/layouts/default.vue` already documents.
    -->
    <div
      aria-hidden="true"
      class="arcs pointer-events-none absolute inset-0 hidden overflow-clip lg:block"
    >
      <span class="arc arc-why" />
      <span class="arc arc-how" />
      <span class="arc arc-what" />
    </div>

    <!-- `flex` keeps the Pill at its intrinsic 127×38 with no line box. -->
    <div class="flex">
      <Pill :label="eyebrow" />
    </div>

    <!--
      Exactly one of the two renders. `display` is declared here, on the
      caller, because choosing the composition is the caller's job — the two
      components deliberately declare none of their own.
    -->
    <PurposeConstellation
      :nodes="nodes"
      class="mt-purpose-eyebrow-gap hidden lg:flex"
    />
    <PurposeCarousel
      :nodes="nodes"
      :label="carouselLabel"
      class="mt-purpose-eyebrow-gap lg:hidden"
    />
  </section>
</template>

<style scoped>
/*
 * The arcs. Three radii from one origin, and **not three magic numbers**: each
 * diameter is `2 × distance(origin, radarCentre)`, so every arc passes through
 * its own radar. Verified against all three, to under 1px each — the table is
 * in `global.css` beside `--purpose-arc-why`.
 *
 * `width` adds one stroke to the token because the design's diameter is the
 * **centreline** of the 1px stroke while `box-sizing: border-box` measures the
 * outer edge. Without it the three arcs land 0.5px inside their radars, which
 * is enough to push the middle one past the 1px tolerance.
 *
 * `aspect-ratio` and not `height`: a percentage height would resolve against
 * the section's height, which is copy-driven, while the percentage width
 * resolves against the section's content box — the 1280 every other
 * percentage in this feature is measured against.
 */
.arc {
  position: absolute;
  top: var(--purpose-origin-y);
  left: var(--purpose-arc-origin-x);
  aspect-ratio: 1;
  width: calc(var(--arc-diameter) + var(--purpose-arc-w));
  border: var(--purpose-arc-w) solid var(--arc-color);
  border-radius: 50%;
  translate: -50% -50%;
}

/*
 * ⚠️ The three strokes are **different**, read from the `.pen` on 2026-09-08:
 * the innermost arc is red-tinted and the outer two are bone at decreasing
 * opacity, so the Golden Circle's centre reads warmer. Three tokens, not one.
 */
.arc-why {
  --arc-diameter: var(--purpose-arc-why);
  --arc-color: var(--purpose-arc-why-color);
}

.arc-how {
  --arc-diameter: var(--purpose-arc-how);
  --arc-color: var(--purpose-arc-how-color);
}

.arc-what {
  --arc-diameter: var(--purpose-arc-what);
  --arc-color: var(--purpose-arc-what-color);
}
</style>
