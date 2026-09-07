<script setup lang="ts">
import Radar from './Radar.vue'

/**
 * Pill — the capsule that introduces every section of both pages: a small
 * radar plus a label. Geometry from
 * docs/business/landing/design-extract.md § 3.
 *
 * `label` is the only content input. The eleven instances in the design
 * differ in nothing else, and the 13 → 12 type difference between frames is
 * carried by the fluid `text-pill` role, not by a size prop.
 *
 * A long label wraps rather than truncating: this sits next to navigation
 * and silently losing a word would be worse than a taller capsule.
 *
 * The padding is asymmetric (10 leading, 20 trailing) and expressed
 * logically, so it survives a future RTL locale without a second rule.
 */
interface Props {
  /** Caller-supplied — the i18n copy lives with the caller (FR-005). */
  label: string
}

const { label } = defineProps<Props>()
</script>

<template>
  <span
    class="inline-flex items-center gap-pill-gap rounded-full border border-glass-line bg-glass-dark py-pill-y ps-pill-start pe-pill-end"
  >
    <Radar size="sm" />
    <span class="font-instrument text-pill text-bone-200">{{ label }}</span>
  </span>
</template>
