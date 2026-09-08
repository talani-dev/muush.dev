<script setup lang="ts">
import { ContactForm, type ContactFormContent } from '@/features/forms'
import LinkArrow from '@/shared/ui/LinkArrow.vue'
import Pill from '@/shared/ui/Pill.vue'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'

/**
 * `06 CTA final` — the landing's sixth and last section before the footer,
 * and the one that gives a real destination to two controls that were inert
 * since they were built: the Hero's primary CTA (feature 9) and the nav's CTA
 * (feature 3/10). Both already point at `#contacto`; this section is the
 * anchor.
 *
 * Chrome only (Pill, heading, copy, alternate route, glows, the two-column ↔
 * stacked layout). The seven-field form is `forms/ContactForm`'s, consumed
 * through the barrel and nothing else (Constitution Article III) — this file
 * imports no `forms/` internal.
 *
 * It calls **no Nuxt composable**: copy arrives already translated from
 * `logic/useContactContent.ts`, the same discipline `HeroSection.vue` and
 * `PurposeSection.vue` already follow (`rules.md` § R23). The form's own
 * content (`formContent`) is resolved by whoever composes this section
 * (`app/pages/index.vue`) calling `useContactFormContent` from the `forms`
 * barrel directly — never by this component, which is what keeps this file
 * mountable with no Nuxt runtime present, and keeps `forms/` from depending
 * on a `landing.*` key (plan.md D-1, D-4).
 *
 * ---
 *
 * ## The paint-order contract — `SectionBackdrop.vue`'s rules, applied here
 *
 * No stacking context on this section or on any wrapper above it (no
 * `transform`, `translate`, `scale`, `filter`, `backdrop-filter`, `opacity`
 * below 1, `isolation`, `will-change`, `contain: paint`, `fixed`/`sticky`
 * with a `z-index` — the three glows' own `-translate-…` are the one
 * permitted exception, same as every prior section). No opaque background —
 * it would hide this section's own glows, painted at a negative level. No
 * bottom padding: the footer's own top padding is the separation
 * (`rules.md` § R49), and this is the fourth section bound by the contract.
 *
 * ## The one place this section's mobile order is not a rescale of desktop
 *
 * The alternate route (`LinkArrow`) is a **sibling** of `ContactForm` in the
 * DOM, never nested inside the left block: in normal flow (below `lg`) it
 * renders third, after the form. At `lg` and above the layout becomes a CSS
 * grid — Tailwind has no `grid-template-areas` utility, so this is the one
 * piece of hand-written CSS in the section — with two explicit column tracks
 * and the alt route's own grid area placed inside the left column, below the
 * body copy. No JavaScript reorders anything (spec US4).
 */
interface Props {
  eyebrow: string
  heading: string
  body: string
  ctaSecondary: string
  callHref: string
  formContent: ContactFormContent
}

const { eyebrow, heading, body, ctaSecondary, callHref, formContent } =
  defineProps<Props>()
</script>

<template>
  <section id="contacto" class="relative pt-contact-top">
    <SectionBackdrop>
      <SectionGlow
        color="red-400"
        :opacity="60"
        size="1500-760"
        class="absolute top-contact-glow-foco-y left-contact-glow-foco-x -translate-x-1/2 -translate-y-1/2"
      />
      <SectionGlow
        color="wine-300"
        :opacity="37"
        size="1000-560"
        class="absolute top-contact-glow-wine-y left-contact-glow-wine-x -translate-x-1/2 -translate-y-1/2"
      />
      <SectionGlow
        color="wine-400"
        :opacity="28"
        size="900-520"
        class="absolute top-contact-glow-cierre-y left-contact-glow-cierre-x -translate-x-1/2 -translate-y-1/2"
      />
    </SectionBackdrop>

    <div class="contact-layout gap-form-gap">
      <div class="contact-layout__text flex flex-col gap-contact-text-gap">
        <div class="flex">
          <Pill :label="eyebrow" />
        </div>
        <h2 class="font-instrument text-h2 text-bone-100">{{ heading }}</h2>
        <p class="font-instrument text-body-sm text-ink-100">{{ body }}</p>
      </div>

      <ContactForm class="contact-layout__form" :content="formContent" />

      <LinkArrow class="contact-layout__alt" :href="callHref" external>
        {{ ctaSecondary }}
      </LinkArrow>
    </div>
  </section>
</template>

<style scoped>
/*
 * Mobile: plain flow, DOM order (text, form, alt) — no override needed.
 * Desktop: a two-column grid whose left column holds two stacked rows (text,
 * then alt) beside a form column spanning both rows. `grid-template-areas` has
 * no Tailwind utility, so this is hand-written CSS reading the `:root` tokens
 * `<style scoped>` needs (rules.md § R18) rather than the `@theme inline`
 * ones utility classes consume.
 */
.contact-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-form-gap);
}

@media (width >= 64rem) {
  .contact-layout {
    display: grid;
    align-items: start;
    grid-template-columns: var(--contact-left-w) var(--contact-form-w);
    grid-template-areas: "text form" "alt form";
    column-gap: var(--contact-col-gap);
    row-gap: var(--contact-left-gap);
  }

  .contact-layout__text {
    grid-area: text;
  }

  .contact-layout__form {
    grid-area: form;
  }

  .contact-layout__alt {
    grid-area: alt;
  }
}
</style>
