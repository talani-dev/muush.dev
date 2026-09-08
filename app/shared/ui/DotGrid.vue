<script setup lang="ts">
/**
 * DotGrid — the site's dotted paper: 2.5px dots on a 24px grid, faint
 * ink-100, covering the whole page from behind the nav down to the footer
 * (docs/business/landing/design-extract.md § 10 · DottedPaper).
 *
 * **One element with one repeating background, never a grid of nodes.** The
 * design file draws a 288×288 `Dot tile` holding 144 ellipses and instances it
 * 90 times over the 1440×5060 page — 12 960 nodes. The arithmetic closes
 * exactly (12 × 24 = 288; 5 columns × 18 rows = 90), which is what identifies
 * it as Pencil's way of drawing a repeat rather than a unit of layout. In a
 * browser it is two declarations, so neither 288 nor 90 appears anywhere in
 * this repository (spec FR-001). `ui-map.md` § 10 already lists the dotted
 * paper as pure CSS with no dependency on JavaScript.
 *
 * No props: there is exactly one dotted paper in the design, at exactly one
 * density. A `size` or `color` prop would invent a system the design does not
 * have (Constitution Article VIII).
 *
 * **What it needs from its host** — the layout, and nothing else renders it:
 * a `position: relative` ancestor that establishes the page's single stacking
 * context (`isolation: isolate`) and spans the whole document rather than the
 * viewport. Inside a viewport-height ancestor this covers the viewport and
 * leaves the rest of a 5000px page bare. See the *Composed background* story.
 *
 * Decorative and inert: it is announced to nobody and intercepts no pointer.
 */
</script>

<template>
  <div
    aria-hidden="true"
    class="dot-grid pointer-events-none absolute inset-0"
  />
</template>

<style scoped>
/*
 * The sheet sits one level above the section glows and below every piece of
 * content, which is the child order of frame `SdEJx` (base → glows → dots →
 * content) and the whole visual requirement of the background
 * (docs/business/rules.md § R28).
 *
 * The three dot values are tokens, not literals: `var(--dot-paper-*)` names
 * from the ramp, never `--color-*` theme names, which do not exist in the
 * site's emitted CSS (§ R18).
 *
 * The second colour stop is `transparent` at the same radius, which is what
 * gives a hard-edged 2.5px dot instead of a smudge. The design draws solid
 * ellipses, so there is no second radius to soften it with.
 */
.dot-grid {
  z-index: var(--layer-dots);
  background-image: radial-gradient(
    var(--dot-paper-color) var(--dot-paper-radius),
    transparent var(--dot-paper-radius)
  );
  background-size: var(--dot-paper-step) var(--dot-paper-step);
}
</style>
