<script setup lang="ts">
/**
 * The not-found page's "empty radar": three concentric rings with no dot
 * (feature 36, Roberto's reference `specs/036-not-found-page/reference/`).
 * Purely decorative — hidden from assistive technology, never intercepts a
 * pointer, never animates.
 *
 * Centred on its section with `left/top: 50%` plus a `translate`. The
 * transform creates a stacking context for this element's own empty subtree
 * only, which `SectionBackdrop.vue`'s section contract allows; the section
 * itself stays free of one (rules.md § R28).
 *
 * The geometry and colours read `:root` ramp tokens (`--not-found-ring-*`),
 * never `--color-*` theme names, which do not exist in the site's build when
 * read from hand-written CSS (rules.md § R18). The outer ring is wider than
 * a 390 px viewport; the layout root's `overflow-clip` keeps it from causing
 * horizontal scroll.
 */
</script>

<template>
  <div aria-hidden="true" class="not-found-rings pointer-events-none absolute">
    <span class="not-found-rings__ring not-found-rings__ring--outer" />
    <span class="not-found-rings__ring not-found-rings__ring--mid" />
    <span class="not-found-rings__ring not-found-rings__ring--inner" />
  </div>
</template>

<style scoped>
.not-found-rings {
  left: 50%;
  top: 50%;
  width: var(--not-found-rings);
  height: var(--not-found-rings);
  transform: translate(-50%, -50%);
}

.not-found-rings__ring {
  position: absolute;
  border-radius: 50%;
}

.not-found-rings__ring--outer {
  inset: 0;
  border: var(--not-found-ring-w) solid var(--not-found-ring-outer-color);
}

.not-found-rings__ring--mid {
  inset: var(--not-found-ring-mid-inset);
  border: var(--not-found-ring-w) solid var(--not-found-ring-mid-color);
}

.not-found-rings__ring--inner {
  inset: var(--not-found-ring-inner-inset);
  border: var(--not-found-ring-w) solid var(--not-found-ring-inner-color);
}
</style>
