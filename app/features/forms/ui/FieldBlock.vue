<script setup lang="ts">
import { HELP_CLASSES, LABEL_CLASSES } from './fieldAnatomy'

/**
 * FieldBlock — a v2 field's label, control and help line (feature 45,
 * pen extract-45 §§ 2–4): gap 7 / 8, the label tied to the control by
 * `for`, the help line in Red muush 500 with the id `<id>-error` the
 * control names in its `aria-describedby` (spec FR-012). Presentational.
 */
interface Props {
  /** The control's id; the label points at it. */
  id: string
  label: string
  /** Already translated; absent → no help line. */
  error?: string
}

const { id, label, error } = defineProps<Props>()
</script>

<template>
  <div class="flex min-w-0 flex-col gap-campo-gap md:gap-campo-gap-escritorio">
    <label :for="id" :class="LABEL_CLASSES">{{ label }}</label>
    <slot />
    <p v-if="error" :id="`${id}-error`" :class="HELP_CLASSES">{{ error }}</p>
  </div>
</template>
