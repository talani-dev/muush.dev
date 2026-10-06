<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'

/**
 * FormOutcome — what replaces or follows a form once a submission has an
 * outcome (`ui-map.md` § 7, "Flujo de envío"). Shared by both forms.
 *
 * - `success`: rendered INSTEAD of the form, in the same card. The container
 *   is a `role="status"` live region, and the confirmation takes focus on
 *   mount, because the form (and the focused button) just disappeared and
 *   focus would otherwise fall to `<body>` (spec FR-023). `note` is the
 *   talent form's "CV could not be attached" line (spec OA-2).
 * - `server-error`: rendered BELOW the form, which stays mounted with every
 *   captured value. `role="alert"`, with the support address as the
 *   alternate route `ui-map.md` § 7 asks for.
 *
 * Classes are the ones the success/error markup already used inside both
 * forms before this extraction — no new token (Constitution Article VII).
 * The note has no frame in the design file; it reuses the body copy role.
 */
interface Props {
  kind: 'success' | 'server-error'
  message: string
  note?: string
  /** The support address shown as the error's alternate route. */
  errorFallback: string
}

const { kind, message, note, errorFallback } = defineProps<Props>()

const confirmation = useTemplateRef<HTMLElement>('confirmation')

onMounted(() => {
  if (kind === 'success') confirmation.value?.focus()
})
</script>

<template>
  <div
    v-if="kind === 'success'"
    role="status"
    class="flex flex-col gap-form-gap"
  >
    <p
      ref="confirmation"
      tabindex="-1"
      class="font-instrument text-body-lg text-bone-100 focus-visible:outline-red-400"
    >
      {{ message }}
    </p>
    <p v-if="note" class="font-instrument text-body-sm text-ink-100">
      {{ note }}
    </p>
  </div>

  <p
    v-else
    role="alert"
    class="mt-form-gap font-instrument text-body-sm text-red-400"
  >
    {{ message }}
    <a href="mailto:support@muush.dev" class="underline">{{ errorFallback }}</a>
  </p>
</template>
