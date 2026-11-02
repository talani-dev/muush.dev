<script setup lang="ts">
import { computed } from 'vue'
import {
  type CvFileVerdict,
  classifyCvFile,
} from '@/features/forms/logic/cvFileCheck'
import FieldBlock from './FieldBlock.vue'
import {
  AREA_CONTROL_CLASSES,
  describedBy,
  strokeClasses,
} from './fieldAnatomy'

/**
 * CvField — the application form's CV box (feature 45, spec FR-020; pen
 * extract-45 § 5; research R7): a 96-tall box in the field anatomy, padding
 * 14 / 16, the placeholder "Adjunta tu CV en PDF · máximo 5 MB" (15 / 400
 * Gris 400 on desktop) or, once chosen, the file name in Blanco. No icon
 * (§ 5). The text sits top-left, like the textarea it matches.
 *
 * The whole box is the `<label>` of a visually hidden
 * `<input type="file" accept="application/pdf">`: a click anywhere opens the
 * picker, Enter or Space on the focused input opens it too, and the box
 * draws the keyboard ring (`<style>`). A file `classifyCvFile` refuses is
 * never kept: the input is emptied and `reject` tells the form, which shows
 * the error at once and sends nothing (feature 031 FR-013). This component
 * builds no request. Presentational.
 */
interface Props {
  id: string
  label: string
  placeholder: string
  modelValue: File | null
  error?: string
  required?: boolean
  readonly?: boolean
}

const {
  id,
  label,
  placeholder,
  modelValue,
  error,
  required = false,
  readonly = false,
} = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
  reject: [kind: Exclude<CvFileVerdict, 'accepted'>]
}>()

function onChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  if (file === null) {
    emit('update:modelValue', null)
    return
  }
  const verdict = classifyCvFile(file)
  if (verdict !== 'accepted') {
    input.value = ''
    emit('reject', verdict)
    return
  }
  emit('update:modelValue', file)
}

const boxClasses = computed(() => [
  AREA_CONTROL_CLASSES,
  'caja flex h-area-alto cursor-pointer items-start',
  modelValue ? 'text-blanco' : 'text-texto-tenue md:text-gris-400',
  readonly ? 'pointer-events-none' : '',
  strokeClasses(Boolean(error)),
])
</script>

<template>
  <FieldBlock :id="id" :label="label" :error="error">
    <label :class="boxClasses">
      <span class="min-w-0 break-words">{{
        modelValue?.name ?? placeholder
      }}</span>
      <input
        :id="id"
        type="file"
        accept="application/pdf"
        class="sr-only"
        :required="required && !modelValue"
        :disabled="readonly"
        :aria-invalid="Boolean(error)"
        :aria-describedby="describedBy(id, error)"
        @change="onChange"
      >
    </label>
  </FieldBlock>
</template>

<style scoped>
/* The keyboard ring of the shared controls (`foco`), on the box, since its
   input is visually hidden. */
.caja:has(:focus-visible) {
  outline: var(--foco-ancho) solid var(--blanco);
  outline-offset: var(--foco-separacion);
}
</style>
