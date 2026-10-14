<script setup lang="ts">
import { computed } from 'vue'
import type { ApplicationFormContent } from '@/features/forms/data/applicationFields'
import CvUploadError from './CvUploadError.vue'
import FileField, { type FileFieldRejection } from './FileField.vue'

/**
 * CvField — the application form's CV control plus everything feature 031
 * hangs off it: the immediate format/size refusal and, after a failed
 * upload, `CvUploadError` with its two actions. Extracted from
 * `ApplicationForm.vue` to keep it under 200 lines (Constitution Article V;
 * feature 031 research R9). Presentational: props in, events out.
 *
 * The visible error is the selection refusal when there is one (spec
 * FR-013), else the submit-time validation message the parent passes.
 */
interface Props {
  id: string
  modelValue: File | null
  content: ApplicationFormContent['fields']['cv']
  uploadErrorContent: ApplicationFormContent['cvUploadError']
  /** The submit-time validation message, if any. */
  error?: string
  rejection: FileFieldRejection | null
  uploadFailed: boolean
  readonly: boolean
  required: boolean
}

const {
  id,
  modelValue,
  content,
  uploadErrorContent,
  error,
  rejection,
  uploadFailed,
  readonly,
  required,
} = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
  reject: [kind: FileFieldRejection]
  retry: []
  'submit-without-cv': []
}>()

const REJECTION_MESSAGE_KEY = {
  format: 'errorFormat',
  size: 'errorSize',
} as const

const uploadErrorId = computed(() => `${id}-upload-error`)
const shownError = computed(() =>
  rejection ? content[REJECTION_MESSAGE_KEY[rejection]] : error
)
</script>

<template>
  <FileField
    :id="id"
    :model-value="modelValue"
    :label="content.label"
    :placeholder="content.placeholder"
    :error="shownError"
    :described-by="uploadFailed ? uploadErrorId : undefined"
    :readonly="readonly"
    :required="required"
    @update:model-value="emit('update:modelValue', $event)"
    @reject="emit('reject', $event)"
  />
  <CvUploadError
    v-if="uploadFailed"
    :id="uploadErrorId"
    :message="uploadErrorContent.message"
    :retry-label="uploadErrorContent.retry"
    :submit-without-cv-label="uploadErrorContent.submitWithoutCv"
    @retry="emit('retry')"
    @submit-without-cv="emit('submit-without-cv')"
  />
</template>
