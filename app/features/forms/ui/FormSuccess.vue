<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import type { FormSuccessAction } from '@/features/forms/data/formChrome'
import { trackAttrs } from '@/shared/data/trackingEvents'
import GlassButton from '@/shared/ui/GlassButton.vue'

/**
 * FormSuccess — "Enviado" (feature 45, spec FR-014; pen extract-45 §§ 3, 8):
 * replaces the panel content with a centred stack. A 56 / 64 tile (Blanco
 * 8 % fill, Blanco 20 % edge, radius 18 / 20) holding a 14 px Red muush dot
 * with the radar ping (`pulso`, the Pill's recipe; none under reduced
 * motion — Roberto 2026-11-02); the title Poppins 26 / 32 / 500 Blanco;
 * the text 16 / 1.5 Blanco 70 %, at most 420 wide; the glass button.
 *
 * `role="status"` and focus on the title when it appears (feature 029
 * FR-023 pattern), so the confirmation is announced (spec US1-4). The
 * gap is the panel's (14 / 18); the stack's padding 40 / 8 is the
 * handoff's `.m1-exito`. Shown only from a real 200 `ok` (FR-015): the
 * form decides. Presentational.
 */
interface Props {
  title: string
  body: string
  action: FormSuccessAction
}

const { title, body, action } = defineProps<Props>()

const heading = useTemplateRef<HTMLElement>('heading')

onMounted(() => heading.value?.focus())
</script>

<template>
  <div
    role="status"
    class="flex flex-col items-center gap-formulario-gap px-exito-x py-exito-y text-center md:gap-formulario-gap-escritorio"
  >
    <span
      aria-hidden="true"
      class="grid size-exito-tile place-items-center rounded-exito border border-linea-fuerte bg-blanco-8 md:size-exito-tile-escritorio md:rounded-franja"
    >
      <span
        data-punto
        class="relative size-exito-punto rounded-full bg-red-muush-500 pulso"
      />
    </span>
    <h3
      ref="heading"
      tabindex="-1"
      class="font-titulo text-exito text-blanco outline-none md:text-exito-escritorio"
    >
      {{ title }}
    </h3>
    <p class="max-w-exito font-texto text-exito-cuerpo text-texto-suave">
      {{ body }}
    </p>
    <GlassButton
      v-bind="action.track && trackAttrs(action.track)"
      :label="action.label"
      :href="action.href"
      :to="action.to"
    />
  </div>
</template>
