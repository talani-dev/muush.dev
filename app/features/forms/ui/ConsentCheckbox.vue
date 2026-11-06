<script setup lang="ts">
import check from '@/assets/icons/check.svg?raw'
import type { ConsentLabel } from '@/features/forms/data/formChrome'

/**
 * ConsentCheckbox — the required privacy consent (feature 45, spec FR-008;
 * pen extract-45 §§ 2, 8; Roberto 2026-10-31: it enables sending and is
 * never sent). Its value goes back to the form's consent gate only, never
 * to the form values.
 *
 * A native checkbox (Space toggles it, its state is announced) drawn as the
 * `.pen` box: 18 × 18, radius 5, a Blanco 40 % stroke on mobile and 25 % on
 * desktop. Ticked, it fills Red muush with the lucide `check` in Blanco: the
 * `.pen` draws only the unticked box, so the ticked look is the handoff's
 * `accent-color: red-muush-500` rebuilt with the site's own glyph. The text
 * is 12 / 1.4 with gap 10 on mobile, 13 / 1.45 with gap 12 on desktop,
 * Gris 400.
 *
 * "aviso de privacidad" links to the privacy page (feature 48,
 * pen-extract-48 § 4) in a new tab with the opener severed, so a
 * half-filled form is not lost. In the sentence's Gris 400, underlined:
 * DERIVED, the `.pen` draws it as plain text (rules.md § R38). A click on the link
 * follows it without ticking the box: interactive content inside a
 * `<label>` does not activate the control. A visually hidden
 * "(se abre en una pestaña nueva)" inside the link warns assistive tech
 * of the new tab (Roberto 2026-11-05, WCAG G201); the leading space keeps
 * it a separate word in the link's accessible name. Presentational.
 */
interface Props {
  id: string
  label: ConsentLabel
  modelValue: boolean
  disabled?: boolean
}

const { id, label, modelValue, disabled = false } = defineProps<Props>()

defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <div
    class="flex items-start gap-privacidad-gap md:gap-privacidad-gap-escritorio"
  >
    <span class="relative grid size-check shrink-0">
      <input
        :id="id"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="peer size-check cursor-pointer appearance-none rounded-check border border-texto-tenue bg-transparent transition-colors duration-(--rapido) ease-muush foco checked:border-red-muush-500 checked:bg-red-muush-500 md:border-blanco-25 md:checked:border-red-muush-500"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      >
      <span
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 hidden place-items-center text-blanco peer-checked:grid"
      >
        <span class="icono size-burbuja-icono" v-html="check" />
      </span>
    </span>
    <label
      :for="id"
      class="cursor-pointer font-texto text-privacidad text-gris-400 md:text-privacidad-escritorio"
    >
      {{ label.before
      }}<a
        :href="label.href"
        target="_blank"
        rel="noopener noreferrer"
        class="underline transition-colors duration-(--rapido) ease-muush hover:text-blanco foco"
        >{{ label.link
        }}<span class="sr-only">{{ ` ${label.newTab}` }}</span></a
      >{{ label.after }}
    </label>
  </div>
</template>

<style scoped>
/* `:deep()`: Vue's scoped transform does not reach `v-html` content. The
   wrapper's `size-burbuja-icono` (12 px) decides the glyph's size. */
.icono :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
