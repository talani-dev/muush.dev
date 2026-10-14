<script setup lang="ts">
import { computed } from 'vue'
import paperclip from '@/assets/icons/paperclip.svg?raw'
import { CV_MAX_BYTES } from '@/features/forms/data/applicationFields'

/**
 * FileField — the CV upload control, the one field primitive `ContactForm`
 * never needed. A native `<input type="file" accept="application/pdf">`,
 * presentational only (Constitution Article V): no composable, no i18n, and
 * — the point of this component — **no destination**.
 *
 * ## No destination here
 *
 * This component sends nothing and builds no request body: no object URL is
 * kept past its own lifetime. Selecting a file only reads the native `File`
 * object's own `.type`/`.name`/`.size`, synchronously, to decide whether to
 * emit it as `modelValue` or to show a format/size error instead. Since
 * feature 029 the chosen file is uploaded on submit by
 * `logic/submissionFlows.ts` through a presigned S3 PUT; `ui/` never touches
 * the network (Constitution Article V, `tests/forms-config.test.ts`).
 *
 * `design-extract.md` § FormField's "upload" variant: fill `#FBF8F60A`
 * (bone-100 @ ~4%) and stroke `#FBF8F229` (bone-100 @ ~16%) — both close
 * enough to the existing `--color-glass-bone-faint` / `--color-glass-line-faint`
 * steps to reuse verbatim, the same tolerance `rules.md` §§ R2/R11 already
 * accepted, rather than declaring two near-duplicate tokens (Article VII:
 * reuse before invention). Padding is 16×16 — `--spacing-field-x` (already
 * 16px) covers the horizontal axis; only the vertical axis differs from the
 * shared field recipe's 14px, so it gets its own `--spacing-upload-y`. Gap
 * 10 between the `paperclip` icon and the label text gets its own
 * `--spacing-upload-gap` (the closest existing gap, `--spacing-radio-gap` at
 * 9px, is off by enough not to reuse under the same R2/R11 tolerance).
 */
export type FileFieldRejection = 'format' | 'size'

interface Props {
  id: string
  label: string
  /** The currently-selected file, or `null`. Presentational — no upload. */
  modelValue: File | null
  placeholder: string
  accept?: string
  error?: string
  /** Extra element id(s) describing the input, e.g. the application form's
   * CV upload error (feature 031). Appended to the field's own error id. */
  describedBy?: string
  required?: boolean
  readonly?: boolean
}

const {
  id,
  label,
  modelValue,
  placeholder,
  accept = 'application/pdf',
  error,
  describedBy,
  required = false,
  readonly = false,
} = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
  /** Emitted instead of `update:modelValue` when the local check rejects the
   * selection. Since feature 031 `ApplicationForm` listens: it empties the
   * field and shows the format/size error at once, with no request
   * (`useApplicationForm`'s `onCvReject`, spec FR-013). The size limit is
   * contract § 4's 5 MiB, no longer a proposal. */
  reject: [kind: FileFieldRejection]
}>()

function onChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  if (file === null) {
    emit('update:modelValue', null)
    return
  }

  if (file.type !== accept) {
    emit('reject', 'format')
    input.value = ''
    return
  }

  if (file.size > CV_MAX_BYTES) {
    emit('reject', 'size')
    input.value = ''
    return
  }

  emit('update:modelValue', file)
}

/** `1.2 MB`, `340 KB` — binary units, one decimal place, never more precise
 * than a visitor needs to confirm "yes, that's the right file". */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

const ariaDescribedBy = computed(
  () =>
    [error ? `${id}-error` : undefined, describedBy]
      .filter(Boolean)
      .join(' ') || undefined
)

const fileSummary = computed(() =>
  modelValue ? `${modelValue.name} · ${formatFileSize(modelValue.size)}` : null
)
</script>

<template>
  <div class="flex flex-col gap-field-label-gap">
    <label :for="id" class="font-instrument text-form-label text-bone-300">{{
      label
    }}</label>
    <label
      :for="id"
      class="flex cursor-pointer items-center gap-upload-gap rounded-control border bg-glass-bone-faint px-field-x py-upload-y font-instrument text-input-value"
      :class="[
        error ? 'border-red-400' : 'border-glass-line-faint',
        readonly ? 'pointer-events-none opacity-60' : '',
      ]"
    >
      <span aria-hidden="true" class="text-bone-300" v-html="paperclip" />
      <span :class="fileSummary ? 'text-ink-100' : 'text-bone-300'">{{
        fileSummary ?? placeholder
      }}</span>
      <input
        :id="id"
        type="file"
        :accept="accept"
        :required="required && !modelValue"
        :disabled="readonly"
        :aria-invalid="Boolean(error)"
        :aria-describedby="ariaDescribedBy"
        class="sr-only"
        @change="onChange"
      >
    </label>
    <p
      v-if="error"
      :id="`${id}-error`"
      class="font-instrument text-form-label text-red-400"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
/*
 * `:deep()` is required: content injected by `v-html` is not rewritten by
 * Vue's scoped-style transform (`docs/business/rules.md` § R14).
 */
:deep(svg) {
  width: var(--spacing-field-icon);
  height: var(--spacing-field-icon);
}
</style>
