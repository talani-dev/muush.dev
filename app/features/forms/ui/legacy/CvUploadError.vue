<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'

/**
 * CvUploadError — what the application form shows next to the CV field when
 * the chosen CV could not be uploaded and the application was therefore NOT
 * sent (feature 031, spec FR-003). Presentational only (Constitution Article
 * V): props in, two events out; no composable, no i18n, no network.
 *
 * - `role="alert"` announces it when it appears, and focus moves to the
 *   retry action on mount, because the visitor's next step is a choice.
 * - Both actions are `type="button"`: neither submits the form nor
 *   navigates by itself; the parent decides what each one does.
 *
 * ⚠️ Classes UNVERIFIED against the `.pen` (spec OA-5). Every one is reused
 * from existing forms markup, no new token (feature 031 research R8): the
 * message is `FileField`'s field-error style, the actions are the text-link
 * treatment of `FormOutcome`'s support link with `LinkArrow`'s red-400 focus
 * ring, and the gaps are the field label gap (column) and the form gap
 * (between actions). Replace them only with values the leader extracts.
 */
interface Props {
  /** DOM id of the message, for the CV input's `aria-describedby`. */
  id: string
  message: string
  retryLabel: string
  submitWithoutCvLabel: string
}

const { id, message, retryLabel, submitWithoutCvLabel } = defineProps<Props>()

const emit = defineEmits<{
  retry: []
  'submit-without-cv': []
}>()

const retryAction = useTemplateRef<HTMLButtonElement>('retryAction')

onMounted(() => retryAction.value?.focus())
</script>

<template>
  <div role="alert" class="flex flex-col gap-field-label-gap">
    <p :id="id" class="font-instrument text-form-label text-red-400">
      {{ message }}
    </p>
    <div class="flex flex-wrap gap-form-gap">
      <button
        ref="retryAction"
        type="button"
        class="font-instrument text-body-sm text-bone-100 underline focus-visible:outline-red-400"
        @click="emit('retry')"
      >
        {{ retryLabel }}
      </button>
      <button
        type="button"
        class="font-instrument text-body-sm text-bone-100 underline focus-visible:outline-red-400"
        @click="emit('submit-without-cv')"
      >
        {{ submitWithoutCvLabel }}
      </button>
    </div>
  </div>
</template>
