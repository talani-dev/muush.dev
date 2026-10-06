<script setup lang="ts">
import { HONEYPOT_FIELD_NAME } from '@/features/forms/data/submissionContract'

/**
 * HoneypotField — the hidden trap input of `ui-map.md` § 7 ("honeypot
 * oculto … solo en el cliente, nunca se mandan al servidor"; contract § 9).
 *
 * A person never sees, reaches or hears it: visually hidden with the `sr-only`
 * core utility, removed from the accessibility tree by `aria-hidden`, out of
 * the Tab order by `tabindex="-1"`, and `autocomplete="off"` with a name that
 * is not an autofill token. A bot that fills every input fills this one, and
 * `useSpamGuard` then blocks the submit in the browser.
 *
 * Deliberately NOT `type="hidden"`: naive bots skip those. Its value is bound
 * to the guard only, never to the form values, so it can never reach a
 * payload (`submissionPayloads.ts` builds from the values alone). No label
 * text: there is nobody to read it, and copy would need i18n for nothing.
 */
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div aria-hidden="true" class="sr-only">
    <input
      type="text"
      :name="HONEYPOT_FIELD_NAME"
      :value="modelValue"
      tabindex="-1"
      autocomplete="off"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </div>
</template>
