<script setup lang="ts">
import TextField from './TextField.vue'

/**
 * ApplicationWhatsappField — the conditional WhatsApp number field and its
 * mount/unmount transition, extracted out of `ApplicationForm.vue` to bring
 * that file back under Article V's 200-line limit (reviewer, feature 20
 * round 1: 249 lines, no actual extraction had been done despite `plan.md`'s
 * Phase -1 gate claiming otherwise).
 *
 * Not shared with `ContactForm.vue`'s own inline WhatsApp field — a
 * deliberate non-abstraction, not an oversight. The two forms' markup is
 * genuinely identical, but `ContactForm.vue` is out of scope for this fix
 * (byte-unchanged, reviewer-confirmed) and a shared component would have to
 * touch it. The two files reuse the same **tokens**
 * (`--duration-contact-whatsapp-toggle`, `--spacing-contact-whatsapp-h`) —
 * that is the actual reuse this feature's data-model.md § 9.1 asked for —
 * not the markup.
 *
 * Visibility is the parent's own decision (`values.contactPreference ===
 * 'whatsapp'`), passed in as `visible` rather than this component reading
 * `values` itself, so it stays a plain presentational field like every
 * other one in `forms/ui/` (Constitution Article V).
 */
interface Props {
  visible: boolean
  modelValue: string
  label: string
  error?: string
  readonly?: boolean
}

defineProps<Props>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <Transition name="whatsapp-field">
    <TextField
      v-if="visible"
      id="whatsapp"
      :model-value="modelValue"
      type="tel"
      :label="label"
      :error="error"
      :readonly="readonly"
      required
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </Transition>
</template>

<style scoped>
/*
 * Same mechanism and same shared tokens `ContactForm.vue` uses
 * (`--duration-contact-whatsapp-toggle`, `--spacing-contact-whatsapp-h`):
 * identical field markup, so reusing the same measured height estimate is
 * reuse, not a hack (data-model.md § 9.1). `max-height`, not `height`: the
 * error message varies its own height.
 */
.whatsapp-field-enter-active,
.whatsapp-field-leave-active {
  overflow: clip;
  transition:
    max-height var(--duration-contact-whatsapp-toggle) ease,
    opacity var(--duration-contact-whatsapp-toggle) ease;
}

.whatsapp-field-enter-from,
.whatsapp-field-leave-to {
  max-height: 0;
  opacity: 0;
}

.whatsapp-field-enter-to,
.whatsapp-field-leave-from {
  max-height: var(--spacing-contact-whatsapp-h);
  opacity: 1;
}

/* Dropped, not shortened: the field still mounts/unmounts, only the animated
   step is removed (`findings.md` § R53 discipline). */
@media (prefers-reduced-motion: reduce) {
  .whatsapp-field-enter-active,
  .whatsapp-field-leave-active {
    transition: none;
  }
}
</style>
