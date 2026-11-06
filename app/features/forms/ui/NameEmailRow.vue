<script setup lang="ts">
import TextField from './TextField.vue'

/**
 * NameEmailRow — "Nombre | Correo", the first row of both v2 forms and the
 * start of step 1 (feature 45; pen extract-45 §§ 2, 4, 5): two fields side by
 * side with gap 14 once the form is at least 32rem wide (a container query
 * on the form, `SteppedForm`), stacked below that. The 1440 panel's form is
 * 528 wide, so the row is side by side there; the 390 one stacks. The
 * row therefore changes twice across widths, on purpose: side by side at
 * 768–1023 (stacked section, 600 panel), stacked at 1024–~1100 (the panel
 * narrows for `--diagnostico-izq-min`), side by side again above. It
 * follows the panel's width, not the viewport's; do not "fix" it to `md`. Presentational: the form
 * owns the values.
 */
interface FieldCopy {
  label: string
  placeholder?: string
}

interface Props {
  name: string
  email: string
  content: { name: FieldCopy; email: FieldCopy }
  errors: { name?: string; email?: string }
  readonly?: boolean
}

const { name, email, content, errors, readonly = false } = defineProps<Props>()

defineEmits<{
  'update:name': [value: string]
  'update:email': [value: string]
}>()
</script>

<template>
  <div class="grid gap-formulario-fila @lg:grid-cols-2">
    <TextField
      id="name"
      :model-value="name"
      autocomplete="name"
      :label="content.name.label"
      :placeholder="content.name.placeholder"
      :error="errors.name"
      :readonly="readonly"
      required
      @update:model-value="$emit('update:name', $event)"
    />
    <TextField
      id="email"
      :model-value="email"
      type="email"
      autocomplete="email"
      :label="content.email.label"
      :placeholder="content.email.placeholder"
      :error="errors.email"
      :readonly="readonly"
      required
      @update:model-value="$emit('update:email', $event)"
    />
  </div>
</template>
