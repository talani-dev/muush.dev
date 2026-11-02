<script setup lang="ts">
/**
 * RadioPillGroup — the `RadioPill` control
 * (`docs/business/landing/design-extract.md` § RadioPill): a row of pill
 * buttons, one active at a time, dot + label. Used here for "¿Cómo prefieres
 * que te contactemos?" (`ui-map.md` § 7); a native `<input type="radio">`
 * per option keeps keyboard behaviour and grouping for free, visually
 * replaced by the pill treatment.
 */
interface Option {
  value: string
  label: string
}

interface Props {
  /** Name shared by the native radio inputs, and the group's own label id. */
  id: string
  label: string
  modelValue: string
  options: Option[]
  readonly?: boolean
}

const {
  id,
  label,
  modelValue,
  options,
  readonly = false,
} = defineProps<Props>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div
    class="flex flex-col gap-field-label-gap"
    role="radiogroup"
    :aria-labelledby="`${id}-label`"
  >
    <span
      :id="`${id}-label`"
      class="font-instrument text-form-label text-bone-300"
    >
      {{ label }}
    </span>
    <div class="flex flex-wrap gap-radio-gap">
      <label
        v-for="option in options"
        :key="option.value"
        class="inline-flex cursor-pointer items-center gap-radio-gap rounded-full border py-radio-y px-radio-x font-instrument text-link text-bone-100"
        :class="
          option.value === modelValue
            ? 'border-radio-active-line bg-radio-active-fill'
            : 'border-glass-line-faint bg-glass-bone-faint'
        "
      >
        <input
          type="radio"
          :name="id"
          :value="option.value"
          :checked="option.value === modelValue"
          :disabled="readonly"
          class="sr-only"
          @change="$emit('update:modelValue', option.value)"
        >
        <span
          aria-hidden="true"
          class="size-radio-dot rounded-full"
          :class="option.value === modelValue ? 'bg-red-400' : 'bg-glass-dark-line'"
        />
        {{ option.label }}
      </label>
    </div>
  </div>
</template>
