<script setup lang="ts">
/**
 * Wordmark — `muush.dev` (full) or `muush` (short), the two lockups
 * `branding.md` documents as official. Geometry and type from
 * docs/business/landing/design-extract.md § 5.
 *
 * The three runs `muush` / `.` / `dev` are the one deliberately hardcoded
 * string set in this layer: they are brand identity, not copy, and they are
 * locale-invariant (docs/business/messaging.md rule 6, "muush siempre en
 * minúsculas"). Everything else in these primitives comes from the caller.
 *
 * The runs sit in a flex row with no gap so they read as one word; flex also
 * makes the markup immune to whitespace a formatter may insert between them.
 *
 * This is the only component in the layer permitted to use Poppins
 * (branding.md: logo and wordmark exclusive).
 */
export type WordmarkForm = 'full' | 'short'

interface Props {
  form?: WordmarkForm
}

const { form = 'full' } = defineProps<Props>()
</script>

<template>
  <span
    class="inline-flex items-baseline font-poppins text-wordmark text-bone-100"
  >
    <span>muush</span>
    <template v-if="form === 'full'">
      <span class="text-red-400">.</span>
      <span>dev</span>
    </template>
  </span>
</template>
