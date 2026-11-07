<script setup lang="ts">
import {
  type FormChromeContent,
  SEND_NOTICE_EMAIL_TRACK,
} from '@/features/forms/data/formChrome'
import { trackAttrs } from '@/shared/data/trackingEvents'
import FormNotice from './FormNotice.vue'

/**
 * SendNotice — what a form's "Aviso" says (feature 45, spec FR-013,
 * FR-034). After a failed send (both forms): the approved text with its
 * `mailto:` link. After a failed CV upload (application only; the
 * application was not sent, feature 031): feature 031's message and the
 * "Enviar sin CV" text action, the visitor's explicit choice to drop the
 * file (Clarifications Q2, Roberto 2026-11-02). Presentational.
 */
interface Props {
  kind: 'server-error' | 'cv-upload-error'
  error: FormChromeContent['error']
  cvUploadError?: { message: string; submitWithoutCv: string }
}

const { kind, error, cvUploadError } = defineProps<Props>()

defineEmits<{ 'submit-without-cv': [] }>()
</script>

<template>
  <FormNotice>
    <template v-if="kind === 'cv-upload-error' && cvUploadError">
      {{ cvUploadError.message }}
      <button
        type="button"
        class="font-semibold underline underline-offset-2 foco"
        @click="$emit('submit-without-cv')"
      >
        {{ cvUploadError.submitWithoutCv }}
      </button>
    </template>
    <template v-else>
      {{ error.before }}
      <a
        :href="error.href"
        class="underline underline-offset-2 foco"
        v-bind="trackAttrs(SEND_NOTICE_EMAIL_TRACK)"
        >{{
          error.email
        }}</a
      >{{ error.after }}
    </template>
  </FormNotice>
</template>
