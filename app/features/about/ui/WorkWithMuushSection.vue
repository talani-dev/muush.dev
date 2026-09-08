<script setup lang="ts">
import { ApplicationForm, type ApplicationFormContent } from '@/features/forms'
import Pill from '@/shared/ui/Pill.vue'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'

/**
 * `Work with muush` — the About page's second section (after `AboutHeroSection`,
 * feature 17), and the second consumer of `forms/` (after `ContactSection.vue`,
 * feature 16). Chrome only: Pill, headline, body, three reused glow tokens,
 * the two-column ↔ stacked layout, and `ApplicationForm` imported from
 * `forms/`'s barrel and nothing else (Constitution Article III) — this file
 * imports no `forms/` internal.
 *
 * It calls **no Nuxt composable**: copy arrives already translated from
 * `logic/useWorkContent.ts`, the same discipline `AboutHeroSection.vue` and
 * `ContactSection.vue` already follow (`rules.md` § R23). The form's own
 * content (`formContent`) is resolved by whoever composes this section
 * (`app/pages/nosotros.vue`) calling `useApplicationFormContent` from the
 * `forms` barrel directly — never by this component, keeping this file
 * mountable with no Nuxt runtime present and keeping `forms/` from depending
 * on an `about.*` key (plan.md D-1, D-4).
 *
 * ---
 *
 * ## The paint-order contract — `SectionBackdrop.vue`'s rules, applied here
 *
 * No stacking context on this section or any wrapper above it (the three
 * glows' own `-translate-…` are the one permitted exception, same as every
 * prior section). No opaque background — it would hide this section's own
 * glows. No bottom padding: Team (18) and Network (19) both stay `blocked`,
 * so this section renders as `AboutHeroSection`'s immediate next sibling with
 * nothing between them — `AboutHeroSection` declares no bottom padding, so
 * this section's own top padding (`--spacing-work-top`) is the *entire*
 * separation between the two (plan.md D-3, `rules.md` § R49), not a leftover
 * computed from a page-absolute y minus sections that do not exist in the DOM.
 *
 * ## The layout mechanism — identical to `ContactSection.vue`
 *
 * Mobile: plain flow, DOM order (left block, then form) — no override
 * needed. Desktop (`lg` and above): a two-column CSS grid, left block beside
 * the form. `grid-template-areas` has no Tailwind utility, so this is
 * hand-written CSS in `<style scoped>` reading `:root`-declared tokens
 * (`rules.md` § R18) — `--work-left-w` / `--work-form-w` / `--work-col-gap`
 * live in `:root`, not `@theme inline`, because they are read only by this
 * hand-written rule and never by a Tailwind utility class, the same
 * placement `ContactSection.vue`'s own `--contact-left-w` / `--contact-form-w`
 * / `--contact-col-gap` use for the identical reason (`rules.md` § R18's own
 * warning: an `@theme inline` token with no scanned utility consumer never
 * reaches `:root` at all).
 */
interface Props {
  eyebrow: string
  headline: string
  body: string
  formContent: ApplicationFormContent
}

defineProps<Props>()
</script>

<template>
  <section id="work" class="relative pt-work-top">
    <SectionBackdrop>
      <SectionGlow
        color="red-400"
        :opacity="60"
        size="1500-760"
        class="absolute top-work-glow-foco-y left-work-glow-foco-x -translate-x-1/2 -translate-y-1/2"
      />
      <SectionGlow
        color="wine-300"
        :opacity="37"
        size="1000-560"
        class="absolute top-work-glow-wine-y left-work-glow-wine-x -translate-x-1/2 -translate-y-1/2"
      />
      <SectionGlow
        color="wine-400"
        :opacity="28"
        size="900-520"
        class="absolute top-work-glow-cierre-y left-work-glow-cierre-x -translate-x-1/2 -translate-y-1/2"
      />
    </SectionBackdrop>

    <div class="work-layout">
      <div class="work-layout__text flex flex-col gap-work-text-gap">
        <div class="flex">
          <Pill :label="eyebrow" />
        </div>
        <h2 class="font-instrument text-h2 text-bone-100">{{ headline }}</h2>
        <p class="font-instrument text-body-sm text-ink-100">{{ body }}</p>
      </div>

      <ApplicationForm class="work-layout__form" :content="formContent" />
    </div>
  </section>
</template>

<style scoped>
/*
 * Mobile: plain flow, DOM order (text, form) — no override needed. Desktop:
 * a two-column grid, left column beside a form column. `grid-template-areas`
 * has no Tailwind utility, so this is hand-written CSS reading the `:root`
 * tokens `<style scoped>` needs (`rules.md` § R18), same mechanism
 * `ContactSection.vue` already uses.
 */
.work-layout {
  display: flex;
  flex-direction: column;
  gap: var(--work-stack-gap);
}

@media (width >= 64rem) {
  .work-layout {
    display: grid;
    align-items: start;
    grid-template-columns: var(--work-left-w) var(--work-form-w);
    grid-template-areas: "text form";
    column-gap: var(--work-col-gap);
  }

  .work-layout__text {
    grid-area: text;
  }

  .work-layout__form {
    grid-area: form;
    /* The Left block sits at local y130, the form at local y100 — the form
       starts 30px higher, not level with it (plan.md D-3; round-2 review
       measured both at the same y via live CDP and rejected it). This pulls
       the form column back up by that confirmed delta; `--spacing-work-top`
       already positions the text column correctly from the Left block's own
       y130, so only the form needs the correction. */
    margin-top: calc(-1 * var(--work-form-y-offset));
  }
}
</style>
