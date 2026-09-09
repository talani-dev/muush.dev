<script setup lang="ts">
import { computed } from 'vue'
import {
  type ApplicationFormContent,
  CV_REQUIRED,
  ROLE_CATALOG,
} from '@/features/forms/data/applicationFields'
import { useApplicationForm } from '@/features/forms/logic/useApplicationForm'
import BotonPrimario from '@/shared/ui/BotonPrimario.vue'
import ApplicationWhatsappField from './ApplicationWhatsappField.vue'
import FileField from './FileField.vue'
import RadioPillGroup from './RadioPillGroup.vue'
import SelectField from './SelectField.vue'
import TextField from './TextField.vue'

/**
 * ApplicationForm — the eight fields of `docs/business/landing/ui-map.md`
 * § 9, real client-side validation, and nothing else. `about/
 * WorkWithMuushSection.vue` is its only consumer, through `forms/`'s barrel
 * (Article III, plan.md D-1).
 *
 * No-submit guarantee, structural: `useApplicationForm`'s `state` is typed
 * `'idle' | 'invalid'`, no third value exists anywhere in that file, and
 * `previewState` below is the **only** place `'sending' | 'success' |
 * 'server-error'` exist — consumed only by `ApplicationForm.stories.ts`.
 *
 * "Área y rol" values are qualified `${area}:${roleId}`, not bare role ids:
 * `ROLE_CATALOG` ships the identical placeholder role id under all six areas
 * (plan.md D-6), and a bare id would collide across `<optgroup>`s otherwise.
 *
 * The WhatsApp field and its transition live in `ApplicationWhatsappField.vue`
 * — extracted so this file stays under Article V's 200-line limit (round 1
 * review caught it shipping at 249 with no real extraction).
 */
interface Props {
  content: ApplicationFormContent
  /** Storybook-only (plan.md D-1). Absent → renders the real `idle`/`invalid`
   * state `useApplicationForm` computes. */
  previewState?: 'sending' | 'success' | 'server-error'
}

const { content, previewState } = defineProps<Props>()

const {
  values,
  errors,
  state,
  onSubmit,
  onContactPreferenceChange,
  onCvChange,
} = useApplicationForm()

const readonly = computed(() => previewState === 'sending')
const showForm = computed(() => previewState !== 'success')

const contactPreferenceOptions = computed(() =>
  (
    Object.entries(content.fields.contactPreference.options) as [
      string,
      string,
    ][]
  ).map(([value, label]) => ({ value, label }))
)

const areaRoleGroups = computed(() =>
  ROLE_CATALOG.map(({ area, roleIds }) => ({
    label: content.fields.areaRole.areas[area],
    options: roleIds.map(roleId => ({
      value: `${area}:${roleId}`,
      label: content.fields.areaRole.roles[area]?.[roleId] ?? roleId,
    })),
  }))
)

/**
 * Gated on `state === 'invalid'`, same reasoning as `ContactForm.vue`'s own
 * `errorFor`: `errors` is always live, but the error *treatment* must not
 * appear before a submit is attempted.
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
      <SelectField
        id="areaRole"
        v-model="values.areaRole"
        :label="content.fields.areaRole.label"
        :placeholder="content.fields.areaRole.placeholder"
        :groups="areaRoleGroups"
        :error="errorFor('areaRole')"
        :readonly="readonly"
        required
      />
      <TextField
        id="portfolio"
        v-model="values.portfolio"
        :label="content.fields.portfolio.label"
        :placeholder="content.fields.portfolio.placeholder"
        :error="errorFor('portfolio')"
        :readonly="readonly"
      />
      <TextField
        id="linkedin"
        v-model="values.linkedin"
        :label="content.fields.linkedin.label"
        :placeholder="content.fields.linkedin.placeholder"
        :error="errorFor('linkedin')"
        :readonly="readonly"
      />
      <FileField
        id="cv"
        :model-value="values.cv"
        :label="content.fields.cv.label"
        :placeholder="content.fields.cv.placeholder"
        :error="errorFor('cv')"
        :readonly="readonly"
        :required="CV_REQUIRED"
        @update:model-value="onCvChange"
      />
      <RadioPillGroup
        id="contactPreference"
        :model-value="values.contactPreference"
        :label="content.fields.contactPreference.label"
        :options="contactPreferenceOptions"
        :readonly="readonly"
        @update:model-value="onContactPreferenceChange($event as 'email' | 'whatsapp')"
      />
      <ApplicationWhatsappField
        v-model="values.whatsapp"
        :visible="values.contactPreference === 'whatsapp'"
        :label="content.fields.whatsapp.label"
        :error="errorFor('whatsapp')"
        :readonly="readonly"
      />

      <!--
        Feature 025 (corrected) — same node and same reasoning as
        `ContactForm.vue`: `width: 216` explicit at `lg`, `fill_container`
        below it, so the fixed width and the centring both stay scoped to
        `lg:` and mobile keeps stretching to the form's width.
      -->
      <BotonPrimario
        variant="submit"
        type="submit"
        :disabled="previewState === 'sending'"
        class="lg:w-btn-submit-w lg:self-center"
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
