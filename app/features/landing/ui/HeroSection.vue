<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useHeroSentinel } from '@/shared/logic/useNavCtaReveal'
import BotonPrimario from '@/shared/ui/BotonPrimario.vue'
import LinkArrow from '@/shared/ui/LinkArrow.vue'
import Pill from '@/shared/ui/Pill.vue'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'

/**
 * `01 Hero` — the landing's first section, and the first section the site has
 * ever had. Four children in a vertical stack over three radial glows.
 *
 * One responsive component, not two. The two frames are structurally
 * identical — same children, same order, same roles — and every size
 * difference resolves through a `clamp()` that already exists in
 * `app/assets/css/global.css`. The **only** breakpoint in the whole component
 * is on the CTA row, and it changes flex direction and cross-axis alignment,
 * never a size (spec FR-019).
 *
 * It calls **no Nuxt composable**. Copy and destinations arrive already
 * translated and already resolved from `logic/useHeroContent.ts`, which is
 * what lets this render in Storybook and in a bare Vue Test Utils mount, and
 * what makes the catalogue able to catch a component that cheats
 * (`docs/business/rules.md` § R23).
 *
 * It does call **one plain Vue composable**, `useHeroSentinel` — an
 * `IntersectionObserver` and two lifecycle hooks, no Nuxt runtime — so the
 * property above still holds. That is the narrowing, stated rather than left
 * as an absolute claim someone later finds untrue: the rule is "no **Nuxt**
 * composable", because the rule exists so this file renders where no Nuxt
 * runtime is present.
 *
 * The sentinel is why the section carries a template ref. It is what tells the
 * nav to stop offering `Cuéntanos tu proyecto` while this section — which
 * already offers it — is on screen (`ui-map.md` § 2, Roberto, 2026-09-07).
 * The Hero publishes *"I am visible"* and knows nothing about the nav; the two
 * features meet in `app/shared/logic/`, never in each other (Article III).
 *
 * ---
 *
 * ## The five rules this component must not break
 *
 * `SectionBackdrop.vue`'s doc comment is the contract; this section is the
 * first thing it actually governs, and its failure mode is **silent** — no
 * error, no failing test, the page simply stops matching the design.
 *
 * 1. **No stacking context anywhere in this subtree, except on an individual
 *    glow.** Not on the `<section>`, not on the stack, not on the CTA row: no
 *    `transform`, `translate`, `scale`, `rotate`, `filter`, `backdrop-filter`,
 *    `opacity` below 1, `isolation`, `will-change`, `contain: paint`,
 *    `position: fixed`, or `position: sticky` with a `z-index`. Any of them
 *    lifts the glows above the page-wide dot sheet. The three
 *    `-translate-x-1/2 -translate-y-1/2` pairs are the one permitted
 *    exception, because the context a glow creates contains only its own empty
 *    subtree.
 * 2. **No opaque background on the section.** It would hide its own glows.
 * 3. **No bottom padding.** The block that follows owns the separation — the
 *    convention `app/layouts/default.vue` already states for the footer. The
 *    design leaves 164px (desktop) / 90px (mobile) between the end of this
 *    stack and the start of `02 Propósito`, and that remainder is Propósito's.
 * 4. **No horizontal padding.** `<main>` already applies `px-page` (24 → 80),
 *    which is the design's x24 / x80 origin. Re-declaring it here would put
 *    the whole block at twice the gutter.
 * 5. **No `href` invented for either control.** `contactHref` absent means a
 *    real `<button>`; `callHref` absent means a `<span>` in `ink-300`. Neither
 *    may fall back to a substitute target (spec FR-014). `callHref` is
 *    supplied from 2026-09-07 and `contactHref` is still absent, so both
 *    branches are live in the same section today.
 *
 * The section carries no `aria-label` and no `id`: it holds the page's `<h1>`,
 * which is what conveys the structure, nothing points at it, and naming it
 * would add a landmark the design never asked for (spec A-08).
 */
interface Props {
  eyebrow: string
  headline: string
  subhead: string
  ctaPrimary: string
  ctaSecondary: string
  /** Absent → the primary CTA renders as a button with no destination. */
  contactHref?: string
  /** Absent → the secondary CTA renders as non-interactive text. */
  callHref?: string
}

const {
  eyebrow,
  headline,
  subhead,
  ctaPrimary,
  ctaSecondary,
  contactHref,
  callHref,
} = defineProps<Props>()

/* The element the nav watches. Nothing else in this file reads it. */
const root = useTemplateRef<HTMLElement>('root')
useHeroSentinel(root)
</script>

<template>
  <section ref="root" class="relative pt-hero-top">
    <!--
      The three glows of `design-extract.md` § 10's Landing table. Each is
      anchored **by its centre** at an offset from this section's own top-left
      corner — never at a page offset, which would drift the moment anything
      above the section changed height (`rules.md` §§ R29, R48).

      Each uses its **own** pair of anchor tokens. In particular `wine`'s
      vertical anchor is not `--spacing-hero-top`: the two coincide at 1440
      (both 207) and diverge at 390 (64 against 74).
    -->
    <SectionBackdrop>
      <SectionGlow
        color="red-400"
        :opacity="65"
        size="1500-700"
        class="absolute top-hero-glow-foco-y left-hero-glow-foco-x -translate-x-1/2 -translate-y-1/2"
      />
      <SectionGlow
        color="wine-300"
        :opacity="40"
        size="1100-520"
        class="absolute top-hero-glow-wine-y left-hero-glow-wine-x -translate-x-1/2 -translate-y-1/2"
      />
      <SectionGlow
        color="wine-400"
        :opacity="30"
        size="900-520"
        class="absolute top-hero-glow-cierre-y left-hero-glow-cierre-x -translate-x-1/2 -translate-y-1/2"
      />
    </SectionBackdrop>

    <!--
      `items-start` keeps the Pill at its intrinsic width instead of stretching
      it across the body; `w-full` puts the headline and the subhead back at
      the stack's width so they wrap where the design wraps them.
    -->
    <div class="flex max-w-hero-body flex-col items-start gap-hero-gap">
      <Pill :label="eyebrow" />

      <h1 class="w-full font-instrument text-display text-bone-100">
        {{ headline }}
      </h1>

      <p
        class="w-full max-w-hero-measure font-instrument text-body-lg text-ink-100"
      >
        {{ subhead }}
      </p>

      <!--
        The feature's only breakpoint: direction and cross-axis alignment,
        never a size. `items-start` on the mobile axis is what keeps the
        primary button as wide as its label rather than as wide as the column
        (`ui-map.md` § 3, spec FR-007).
      -->
      <div
        class="flex flex-col items-start gap-hero-cta-gap pt-hero-cta-top lg:flex-row lg:items-center"
      >
        <BotonPrimario variant="hero" :href="contactHref">
          {{ ctaPrimary }}
        </BotonPrimario>

        <!--
          Two branches, and a single data value decides which one renders.
          `decisions-open.md` #2 resolved on 2026-09-07, so today it is the
          `v-if`: a `bone-100` link that opens in a new tab with the opener
          relationship severed, and whose arrow `LinkArrow` owns. **Not one
          line of this markup changed when it flipped** — the white text and
          the arrow were never styling to fix, they were the other branch.

          The `v-else` stays. It is how any control with no destination renders
          — grey, inert, no anchor element, no pointer, no hover and no arrow,
          because an arrow is the affordance for going somewhere. It is the
          treatment `FooterColumn.vue` still gives `FAQ` and
          `Blog · próximamente`, and it is covered by its own test.
        -->
        <LinkArrow v-if="callHref" :href="callHref" external>
          {{ ctaSecondary }}
        </LinkArrow>
        <span v-else class="font-instrument text-link text-ink-300">
          {{ ctaSecondary }}
        </span>
      </div>
    </div>
  </section>
</template>
