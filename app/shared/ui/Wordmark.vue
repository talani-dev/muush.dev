<script setup lang="ts">
/**
 * Wordmark — "muush.dev" in Muush 1.0 (feature 43, spec FR-036, contract
 * § 1; pen extract-43 § 1): Poppins 22 on one baseline, three runs.
 *
 * | Run   | Weight | Colour        |
 * |-------|--------|---------------|
 * | muush | 600    | Blanco        |
 * | .     | 600    | Red muush 500 |
 * | dev   | 400    | Gris 400      |
 *
 * The weights are the design's (Roberto, 2026-11-01; Constitution 2.1.2,
 * Article VII). Poppins 400 is self-hosted for the "dev" run only.
 *
 * Decorative text: the link that holds the lockup carries the accessible
 * name, so the three runs are not read out as "muush dot dev".
 */
</script>

<template>
  <span
    aria-hidden="true"
    class="inline-flex items-baseline whitespace-nowrap font-titulo text-marca"
  >
    <span class="font-semibold text-blanco">muush</span>
    <span class="font-semibold text-red-muush-500">.</span>
    <span class="font-normal text-gris-400">dev</span>
  </span>
</template>
