<script setup lang="ts">
/**
 * ConsentSwitch — a category's on/off control in the cookie preferences
 * (feature 48, pen-extract-48 § 3, `S9MqXO`): a 44 × 26 track, padding 3,
 * the pill radius, a 20 px Blanco knob. Off is drawn: Carbón 700 track,
 * knob at the start.
 *
 * On is DERIVED (rules.md § R38, the `.pen` draws off only): Red muush 500
 * track, knob at the far end (18 px travel, `perilla-recorrido`); the
 * handoff's accent for a ticked control (feature 45's consent box).
 *
 * A real `role="switch"` button with `aria-checked`; its name comes from
 * the category heading (`labelledBy`). Presentational.
 */
interface Props {
  checked: boolean
  labelledBy: string
  describedBy?: string
}

const { checked, labelledBy, describedBy } = defineProps<Props>()

defineEmits<{ 'update:checked': [value: boolean] }>()
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="checked"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    class="flex h-interruptor-alto w-interruptor-ancho shrink-0 items-center rounded-pill p-interruptor-aire transition-colors duration-(--rapido) ease-muush foco"
    :class="checked ? 'bg-red-muush-500' : 'bg-carbon-700'"
    @click="$emit('update:checked', !checked)"
  >
    <span
      aria-hidden="true"
      class="size-perilla rounded-full bg-blanco transition-transform duration-(--rapido) ease-muush"
      :class="checked ? 'translate-x-perilla-recorrido' : 'translate-x-0'"
    />
  </button>
</template>
