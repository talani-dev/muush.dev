<script setup lang="ts">
import { useTemplateRef } from 'vue'

/**
 * The mobile bar's menu control and the open menu's "Cerrar" (feature 43,
 * spec FR-007, FR-016, contract § 5; pen extract-43 §§ 3–4).
 *
 * Both are the shared 36 × 36 control: radius 12, 1 px Blanco 20 % stroke,
 * no fill. `open` draws three Blanco lines, 16 × 1.5, radius 1, gap 4;
 * `close` draws the 14 × 14 X, stroke 1.6 with round caps, in Blanco.
 *
 * `aria-expanded` belongs to the control that opens the menu only; the
 * close control is named by its label. `focus()` is exposed so the header
 * can return focus here when the menu is dismissed (spec FR-020).
 */
interface Props {
  label: string
  kind: 'open' | 'close'
  expanded?: boolean
}

const { label, kind, expanded = false } = defineProps<Props>()

const emit = defineEmits<{ click: [] }>()

const button = useTemplateRef<HTMLButtonElement>('button')

defineExpose({ focus: () => button.value?.focus() })
</script>

<template>
  <button
    ref="button"
    type="button"
    :aria-label="label"
    :aria-expanded="kind === 'open' ? expanded : undefined"
    class="inline-flex size-control shrink-0 cursor-pointer flex-col items-center justify-center gap-hamburguesa-gap rounded-control border border-linea-fuerte text-blanco foco"
    @click="emit('click')"
  >
    <template v-if="kind === 'open'">
      <span
        v-for="line in 3"
        :key="line"
        data-linea
        aria-hidden="true"
        class="h-hamburguesa-trazo w-hamburguesa rounded-hamburguesa bg-blanco"
      />
    </template>
    <svg
      v-else
      data-cerrar
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      focusable="false"
      class="size-cerrar overflow-visible"
    >
      <path
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        d="M0 0l14 14M14 0L0 14"
      />
    </svg>
  </button>
</template>
