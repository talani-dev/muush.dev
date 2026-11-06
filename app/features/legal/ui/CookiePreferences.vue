<script setup lang="ts">
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import x from '@/assets/icons/x.svg?raw'
import type {
  CookieChoice,
  CookieConsentCopy,
  OptionalCookieCategory,
  ResolvedCookieCategory,
} from '@/features/legal/data/cookieCategories'
import { useFocusTrap } from '@/shared/logic/useFocusTrap'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'
import ChoiceButton from './ChoiceButton.vue'
import CookieCategoryRow from './CookieCategoryRow.vue'

/**
 * CookiePreferences — "Tus preferencias de cookies" (feature 48,
 * pen-extract-48 §§ 3–4; frames `V4sL7G` / `ev0kn`, `S4ZU4` / `Q3oIYc`).
 *
 * A modal `<dialog>`: the browser puts it in the top layer, makes the page
 * behind it inert and turns Escape into `cancel`; `useFocusTrap` wraps Tab
 * at its edges, which the browser alone lets out to its own chrome. Black
 * 70 % behind it. Negro 900, radius 22, a 1 px Blanco 15 % stroke,
 * padding 20 → 28, gap 12. From `lg` a 720-wide dialog centred in the
 * viewport; below, a sheet 8 from the bottom and the sides.
 *
 * Close (X), Escape and a click on the backdrop emit `close` and save
 * nothing. "Rechazar todo", "Aceptar todo" and "Guardar mi elección" emit
 * their choice; the caller stores it and closes. The switches edit a draft
 * that starts from `choice` every time the dialog opens.
 *
 * The intro's "aviso de privacidad" is a link to the privacy page, in the
 * text's own colour and underlined (DERIVED: the `.pen` draws it as plain
 * text, rules.md § R38). Following it dismisses the dialog.
 * Presentational.
 */
interface Props {
  open: boolean
  copy: CookieConsentCopy
  choice: CookieChoice
}

const { open, copy, choice } = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [choice: CookieChoice]
  'accept-all': []
  'reject-all': []
}>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const draft = ref<CookieChoice>({ ...choice })

useFocusTrap(dialog, () => open)

function sync(isOpen: boolean) {
  const element = dialog.value
  if (!element) return
  if (isOpen && !element.open) {
    draft.value = { ...choice }
    element.showModal()
  }
  if (!isOpen && element.open) element.close()
}

/*
 * The backdrop listener is attached here, not with `@click` in the
 * template: it is the pointer twin of Escape (the dialog's `cancel`), and
 * the keyboard already has that path.
 */
onMounted(() => {
  dialog.value?.addEventListener('click', onDialogClick)
  sync(open)
})
watch(
  () => open,
  isOpen => sync(isOpen)
)

/** Only a click on the backdrop itself, never one inside the panel. */
function onDialogClick(event: MouseEvent) {
  if (event.target === dialog.value) emit('close')
}

function setCategory(id: OptionalCookieCategory, value: boolean) {
  draft.value = { ...draft.value, [id]: value }
}

/* An always-on category has no entry in the draft: it is on. */
function isChecked(category: ResolvedCookieCategory): boolean {
  return category.required || draft.value[category.id as OptionalCookieCategory]
}
</script>

<template>
  <dialog
    ref="dialog"
    aria-modal="true"
    aria-labelledby="preferencias-titulo"
    class="m-0 h-dvh max-h-none w-full max-w-none items-end justify-center overflow-y-auto bg-transparent p-0 backdrop:bg-velo open:flex lg:items-center"
    @cancel.prevent="emit('close')"
  >
    <div
      class="m-preferencias-borde flex w-full max-w-panel-preferencias flex-col gap-preferencias-gap rounded-tarjeta bg-negro-900 p-preferencias inset-ring inset-ring-blanco-15 lg:m-gutter"
    >
      <div class="flex items-center justify-between gap-preferencias-gap">
        <h2
          id="preferencias-titulo"
          class="font-titulo text-preferencias-titulo text-blanco"
        >
          {{ copy.preferences.title }}
        </h2>
        <button
          type="button"
          :aria-label="copy.preferences.close"
          class="grid size-control shrink-0 place-items-center rounded-control text-blanco inset-ring inset-ring-linea-fuerte transition-colors duration-(--rapido) ease-muush hover:bg-carbon-800 foco"
          @click="emit('close')"
        >
          <span aria-hidden="true" class="icono size-cerrar-icono" v-html="x" />
        </button>
      </div>
      <p class="font-texto text-cookies text-texto-cookies">
        {{ copy.preferences.intro.before
        }}<NuxtLink
          :to="copy.preferences.intro.href"
          class="underline transition-colors duration-(--rapido) ease-muush hover:text-blanco foco"
          @click="emit('close')"
          >{{
            copy.preferences.intro.link
          }}</NuxtLink
        >{{ copy.preferences.intro.after }}
      </p>
      <ul>
        <CookieCategoryRow
          v-for="category in copy.categories"
          :key="category.id"
          :category="category"
          :always-on="copy.alwaysOn"
          :checked="isChecked(category)"
          @update:checked="setCategory(category.id as OptionalCookieCategory, $event)"
        />
      </ul>
      <div
        class="flex flex-col gap-preferencias-acciones-gap pt-preferencias-acciones-arriba lg:flex-row lg:items-center lg:justify-end"
      >
        <div class="flex gap-preferencias-acciones-gap *:flex-1 lg:*:flex-none">
          <ChoiceButton
            :label="copy.actions.rejectAll"
            @choose="emit('reject-all')"
          />
          <ChoiceButton
            :label="copy.actions.acceptAll"
            @choose="emit('accept-all')"
          />
        </div>
        <PrimaryButton
          size="compact"
          :icon="false"
          :label="copy.actions.save"
          class="w-full lg:w-auto"
          @click="emit('save', { ...draft })"
        />
      </div>
    </div>
  </dialog>
</template>

<style scoped>
/* `:deep()`: Vue's scoped transform does not reach `v-html` content. */
.icono :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
