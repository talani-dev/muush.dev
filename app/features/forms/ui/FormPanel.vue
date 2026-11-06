<script setup lang="ts">
/**
 * FormPanel — the glass panel both forms sit in (feature 45, spec FR-001;
 * pen extract-45 §§ 1, 2, 4). Fill Negro 900 at 70 % (`vidrio-fondo`) with
 * a 30 px backdrop blur at both anchors; the rest follows the form's
 * anatomy, which swaps at `md` with the view (spec FR-002):
 *
 * - mobile: radius 22 (`tarjeta`), padding 20, a flat Blanco 12 % edge, no
 *   shadow;
 * - desktop: the `panel` glass preset of feature 42 — radius 28, padding
 *   36, the top-lit Blanco 25 → 4 % edge and the long shadow.
 *
 * Full width up to 600. `GlassSurface` takes one preset for all widths,
 * so the panel spells the two out with the same utilities
 * (`shared/data/glassPresets.ts`). Content by slot.
 */
</script>

<template>
  <div
    class="relative w-full max-w-panel-form rounded-tarjeta bg-vidrio-fondo p-panel-movil backdrop-blur-vidrio borde-luz borde-linea md:rounded-panel md:p-panel md:shadow-vidrio md:borde-panel"
  >
    <slot />
  </div>
</template>
