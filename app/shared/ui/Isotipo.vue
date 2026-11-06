<script setup lang="ts">
/**
 * Isotipo — the muush mark of Muush 1.0 (feature 43, spec FR-036, contract
 * § 1; Kit `uUENh`, pen extract-43 § 1).
 *
 * The geometry is the brand logo's, unchanged: the same viewBox, circle,
 * path, `stroke-width` 12 and round cap as `app/assets/logo/*.svg`. Roberto,
 * 2026-11-01: the thinner stroke the design draws at 40 × 22 is not
 * followed; the logo does not change, only its colours. In a `viewBox` the
 * stroke scales with the width, so 12 units are ≈ 6.8 px at 40 wide
 * (rules.md § R3).
 *
 * It is drawn inline rather than imported from `app/assets/logo/`, because
 * those brand files carry the v1 hex: here the stroke is `currentColor`
 * (the caller sets Blanco) and the dot is the Red muush 500 token.
 *
 * Decorative: the accessible name belongs to the link that holds it.
 */
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="14.5 38.5 70.5 39.5"
    fill="none"
    aria-hidden="true"
    focusable="false"
    class="block h-auto w-isotipo-ancho shrink-0"
  >
    <circle cx="21" cy="45" r="6.5" class="fill-red-muush-500" />
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="12"
      d="M21 72a17 17 0 0 1 34 0 12 12 0 0 1 24 0"
    />
  </svg>
</template>
