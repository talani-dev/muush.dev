<script setup lang="ts">
import Isotipo from '@/shared/ui/Isotipo.vue'
import Wordmark from '@/shared/ui/Wordmark.vue'

/**
 * Lockup — isotipo and wordmark of Muush 1.0 (feature 43, spec FR-036,
 * contract § 1; pen extract-43 § 1): gap 10, centred, 176 × 31 in full;
 * `isotipo` renders the 40 × 22 mark alone, the form the whole header
 * uses at every width (FR-059); the footers keep `full`.
 *
 * The stroke is Blanco here, so a caller places the lockup as is.
 * Decorative: the accessible name lives on the caller's link.
 */
export type LockupForm = 'full' | 'isotipo'

interface Props {
  form?: LockupForm
}

const { form = 'full' } = defineProps<Props>()
</script>

<template>
  <span
    aria-hidden="true"
    class="inline-flex items-center gap-lockup text-blanco"
  >
    <Isotipo />
    <Wordmark v-if="form === 'full'" />
  </span>
</template>
