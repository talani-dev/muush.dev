<script setup lang="ts">
import { computed } from 'vue'
import type { ContactFormContent } from '@/features/forms/data/contactFields'
import { useContactForm } from '@/features/forms/logic/useContactForm'
import BotonPrimario from '@/shared/ui/BotonPrimario.vue'
import RadioPillGroup from './RadioPillGroup.vue'
import SelectField from './SelectField.vue'
import TextareaField from './TextareaField.vue'
import TextField from './TextField.vue'

/**
 * ContactForm — the seven fields of `docs/business/landing/ui-map.md` § 7,
 * real client-side validation, and nothing else. `landing/ContactSection.vue`
 * is its only consumer today; `forms/`'s barrel is what lets feature 20's
 * application form reuse the same field vocabulary without either module
 * reaching into the other (Constitution Article III, plan.md D-1).
 *
 * The no-submit guarantee is structural, not conventional:
 * `useContactForm`'s `state` is typed `'idle' | 'invalid'` — no third value
 * exists anywhere in that file. `previewState` below is the **only** place
 * `'sending' | 'success' | 'server-error'` exist in this feature, consumed
 * **only** by `ContactForm.stories.ts`; grep this file and its barrel for
 * `previewState` and the only call sites are the prop below and the three
 * template branches that read it — neither `ContactSection.vue` nor
 * `app/pages/index.vue` ever sets it (plan.md D-2).
 */
interface Props {
  content: ContactFormContent
  /** Storybook-only (plan.md D-2). Absent → renders the real `idle`/`invalid`
   * state `useContactForm` computes. */
  previewState?: 'sending' | 'success' | 'server-error'
}

const { content, previewState } = defineProps<Props>()

const { values, errors, state, onSubmit, onContactPreferenceChange } =
  useContactForm()

const readonly = computed(() => previewState === 'sending')
const showForm = computed(() => previewState !== 'success')

const identityOptions = computed(() =>
  (Object.entries(content.fields.identity.options) as [string, string][]).map(
    ([value, label]) => ({ value, label })
  )
)

const contactPreferenceOptions = computed(() =>
  (
    Object.entries(content.fields.contactPreference.options) as [
      string,
      string,
    ][]
  ).map(([value, label]) => ({ value, label }))
)

/**
 * Gated on `state === 'invalid'`: `errors` itself is always live (it is
 * `validate(values)`, unconditionally), but the error *treatment* — red
 * border, message, `aria-invalid` — must not appear before a submit is
 * attempted (`ui-map.md` § 7: the empty form's own "Idle" row shows no
 * errors at all).
 */
function errorFor(field: keyof typeof errors.value): string | undefined {
  if (state.value !== 'invalid') return undefined
  const key = errors.value[field]
  if (!key) return undefined
  const messages = content.fields[field] as unknown as Record<
    string,
    string | undefined
  >
  const kind = key.split('.').pop() ?? ''
  return messages[kind]
}
</script>

<template>
  <div
    class="rounded-panel-sm border border-glass-dark-line bg-glass-dark-contact p-glass-dark backdrop-blur-glass-dark"
  >
    <form
      v-if="showForm"
      novalidate
      class="flex flex-col gap-form-gap"
      @submit="onSubmit"
    >
      <TextField
        id="name"
        v-model="values.name"
        :label="content.fields.name.label"
        :error="errorFor('name')"
        :readonly="readonly"
        required
      />
      <TextField
        id="email"
        v-model="values.email"
        type="email"
        :label="content.fields.email.label"
        :error="errorFor('email')"
        :readonly="readonly"
        required
      />
      <TextField
        id="company"
        v-model="values.company"
        :label="content.fields.company.label"
        :readonly="readonly"
      />
      <SelectField
        id="identity"
        v-model="values.identity"
        :label="content.fields.identity.label"
        :placeholder="content.fields.identity.label"
        :options="identityOptions"
        :error="errorFor('identity')"
        :readonly="readonly"
        required
      />
      <TextareaField
        id="need"
        v-model="values.need"
        :label="content.fields.need.label"
        :error="errorFor('need')"
        :readonly="readonly"
        required
      />
      <RadioPillGroup
        id="contactPreference"
        :model-value="values.contactPreference"
        :label="content.fields.contactPreference.label"
        :options="contactPreferenceOptions"
        :readonly="readonly"
        @update:model-value="onContactPreferenceChange($event as 'email' | 'whatsapp')"
      />
      <Transition name="whatsapp-field">
        <TextField
          v-if="values.contactPreference === 'whatsapp'"
          id="whatsapp"
          v-model="values.whatsapp"
          type="tel"
          :label="content.fields.whatsapp.label"
          :error="errorFor('whatsapp')"
          :readonly="readonly"
          required
        />
      </Transition>

      <BotonPrimario
        variant="submit"
        type="submit"
        :disabled="previewState === 'sending'"
      >
        {{ previewState === 'sending' ? content.sending : content.submit }}
      </BotonPrimario>
    </form>

    <div v-else class="flex flex-col gap-form-gap">
      <p class="font-instrument text-body-lg text-bone-100">
        {{ content.success.title }}
      </p>
    </div>

    <!-- `server-error`: the form above stays mounted with its captured values. -->
    <p
      v-if="previewState === 'server-error'"
      class="mt-form-gap font-instrument text-body-sm text-red-400"
    >
      {{ content.error.title }}
      <a href="mailto:support@muush.dev" class="underline">{{
        content.error.fallback
      }}</a>
    </p>
  </div>
</template>

<style scoped>
/* The WhatsApp field's mount/unmount transition (FR-011, FR-012).
   `max-height`, not `height`: the error message varies its own height. */
.whatsapp-field-enter-active,
.whatsapp-field-leave-active {
  overflow: clip;
  transition:
    max-height var(--duration-contact-whatsapp-toggle) ease,
    opacity var(--duration-contact-whatsapp-toggle) ease;
}

.whatsapp-field-enter-from,
.whatsapp-field-leave-to {
  max-height: 0;
  opacity: 0;
}

.whatsapp-field-enter-to,
.whatsapp-field-leave-from {
  max-height: var(--spacing-contact-whatsapp-h);
  opacity: 1;
}

/* Dropped, not shortened: the field still mounts/unmounts, only the animated
   step is removed (spec FR-012, `findings.md` § R53 discipline). */
@media (prefers-reduced-motion: reduce) {
  .whatsapp-field-enter-active,
  .whatsapp-field-leave-active {
    transition: none;
  }
}
</style>
