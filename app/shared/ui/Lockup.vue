<script setup lang="ts">
import isotipo from '@/assets/logo/isotipo-on-ink.svg?raw'
import Wordmark, { type WordmarkForm } from './Wordmark.vue'

/**
 * Lockup — isotipo + wordmark, cross-axis centred, at the fluid gap of
 * docs/business/landing/design-extract.md § 6 (12 desktop / 9 mobile).
 *
 * ⚠️ Only the isotipo's WIDTH is set. Its height and its stroke thickness
 * follow the viewBox on their own: the asset declares
 * `viewBox="14.5 38.5 70.5 39.5"` with `stroke-width="12"` in user units, so
 * the browser reproduces the branding formula `12 × width ÷ 70.5` exactly —
 * 8.851 at a width of 52, 6.809 at 40, matching the design's 8.85 and 6.8.
 *
 * That formula is a Pencil workaround (Pencil does not scale stroke with the
 * viewBox; the browser does). Writing it here in any form — a prop, a
 * computed value, a helper — would apply the scale twice and thicken the
 * mark. See docs/business/rules.md § R3 and design-extract.md § 6.
 *
 * The site is dark end to end, so the on-ink variant is the only one used.
 * Lockup is not a link: the nav and the footer decide where it points.
 */
interface Props {
  form?: WordmarkForm
}

const { form = 'full' } = defineProps<Props>()
</script>

<template>
  <span class="inline-flex items-center gap-lockup-gap">
    <span aria-hidden="true" class="inline-flex w-isotipo" v-html="isotipo" />
    <Wordmark :form="form" />
  </span>
</template>

<style scoped>
/*
 * `:deep()` is required: content injected by `v-html` is not rewritten by
 * Vue's scoped-style transform (docs/business/rules.md § R14). `100%`/`auto`
 * are layout keywords, not design values — and `auto` is precisely what lets
 * the viewBox drive the height and the stroke.
 */
:deep(svg) {
  width: 100%;
  height: auto;
}
</style>
