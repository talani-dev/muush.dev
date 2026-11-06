<script setup lang="ts">
import type { CookieConsentCopy } from '@/features/legal/data/cookieCategories'
import ChoiceButton from './ChoiceButton.vue'

/**
 * CookieBanner — "Usamos cookies" (feature 48, pen-extract-48 § 3; frames
 * `Dq04d` / `SYQea`, `TEElj` / `qnVrY`).
 *
 * Fixed at the bottom of the viewport, over every page, until the visitor
 * chooses, 16 → 24 from the bottom edge. Surface Negro 900 at 95 %, radius 22, a 1 px Blanco 15 % stroke,
 * padding 18 → 24.
 * - From `lg`: one row inside the 80 gutters (1280 at 1440), gap 32: the
 *   title and text (gap 4) on the left; "Personalizar" (a text button),
 *   "Rechazar todo" and "Aceptar todo" on the right, gap 12.
 * - Below: a card inside the 24 gutters (342 at 390), gap 12: title, text,
 *   the two choices side by side (gap 8), "Personalizar" centred below.
 *
 * Not a dialog: the page stays usable behind it. "Personalizar" emits the
 * control itself, the one focus returns to when the preferences close.
 * Presentational; the composable owns the choice.
 */
interface Props {
  copy: Pick<CookieConsentCopy, 'banner' | 'actions'>
}

const { copy } = defineProps<Props>()

defineEmits<{
  'accept-all': []
  'reject-all': []
  customize: [trigger: HTMLElement]
}>()
</script>

<template>
  <section
    aria-labelledby="aviso-cookies-titulo"
    class="fixed inset-x-gutter bottom-cookies-abajo z-40 print:hidden lg:inset-x-gutter-desktop"
  >
    <div
      class="mx-auto flex max-w-contenido flex-col gap-cookies-movil-gap rounded-tarjeta bg-cookies-fondo p-cookies inset-ring inset-ring-blanco-15 lg:flex-row lg:items-center lg:gap-cookies-gap"
    >
      <div
        class="flex min-w-0 flex-1 flex-col gap-cookies-movil-gap lg:gap-cookies-texto-gap"
      >
        <h2
          id="aviso-cookies-titulo"
          class="font-titulo text-cookies-titulo text-blanco"
        >
          {{ copy.banner.title }}
        </h2>
        <p class="font-texto text-cookies text-texto-cookies">
          {{ copy.banner.body }}
        </p>
      </div>
      <div
        class="flex flex-col gap-cookies-movil-gap lg:flex-row lg:items-center lg:gap-cookies-acciones-gap"
      >
        <button
          type="button"
          class="order-last self-center rounded-pill font-texto text-cookies-boton text-blanco transition-colors duration-(--rapido) ease-muush hover:text-gris-400 foco lg:order-first"
          @click="$emit('customize', $event.currentTarget as HTMLElement)"
        >
          {{ copy.banner.customize }}
        </button>
        <div
          class="flex gap-cookies-botones-gap *:flex-1 lg:gap-cookies-acciones-gap lg:*:flex-none"
        >
          <ChoiceButton
            :label="copy.actions.rejectAll"
            @choose="$emit('reject-all')"
          />
          <ChoiceButton
            :label="copy.actions.acceptAll"
            @choose="$emit('accept-all')"
          />
        </div>
      </div>
    </div>
  </section>
</template>
