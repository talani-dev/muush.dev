import { describe, expect, it } from 'vitest'
import { computed, ref } from 'vue'
import type { ContactFieldId } from '@/features/forms/data/contactFields'
import {
  CONTACT_STEP_FIELDS,
  type FormStep,
} from '@/features/forms/data/formSteps'
import type { SubmitState } from './useFormSubmitState'
import { submitLabelKey, useFormView } from './useFormView'

describe('submitLabelKey', () => {
  it.each([
    ['idle', 'submit'],
    ['invalid', 'submit'],
    ['uploading', 'uploading'],
    ['sending', 'sending'],
    ['server-error', 'retry'],
    ['cv-upload-error', 'retry'],
    ['success', 'submit'],
  ] as const)('should read %s as the %s label', (state, key) => {
    expect(submitLabelKey(state)).toBe(key)
  })
})

function view(
  overrides: {
    state?: SubmitState
    preview?: SubmitState
    previewStep?: FormStep
    attempted?: FormStep | null
  } = {}
) {
  const errors = ref<Partial<Record<ContactFieldId, string>>>({
    name: 'forms.contact.fields.name.errorRequired',
    need: 'forms.contact.fields.need.errorLength',
  })
  return useFormView<ContactFieldId>({
    state: ref(overrides.state ?? 'idle'),
    step: ref<FormStep>(1),
    accepted: ref(false),
    attemptedStep: ref(overrides.attempted ?? null),
    errors: computed(() => errors.value),
    stepFields: CONTACT_STEP_FIELDS,
    fieldContent: () =>
      ({
        name: { errorRequired: 'Escribe tu nombre.' },
        need: { errorLength: 'Cuéntanos un poco más.' },
      }) as unknown as Record<ContactFieldId, object>,
    previewState: () => overrides.preview,
    previewStep: () => overrides.previewStep,
  })
}

describe('useFormView', () => {
  it('should show no error when idle and the translated message once invalid', () => {
    expect(view().errorFor('name')).toBeUndefined()
    expect(view({ state: 'invalid' }).errorFor('need')).toBe(
      'Cuéntanos un poco más.'
    )
  })

  it('should show only step-1 errors after Continuar found step 1 invalid', () => {
    const shown = view({ attempted: 1 })

    expect(shown.errorFor('name')).toBe('Escribe tu nombre.')
    expect(shown.errorFor('need')).toBeUndefined()
  })

  it('should be busy while uploading or sending', () => {
    expect(view({ state: 'uploading' }).busy.value).toBe(true)
    expect(view({ state: 'sending' }).busy.value).toBe(true)
    expect(view({ state: 'server-error' }).busy.value).toBe(false)
  })

  it('should let a preview pin the state, the step and a ticked box', () => {
    const shown = view({ preview: 'server-error', previewStep: 2 })

    expect(shown.shownState.value).toBe('server-error')
    expect(shown.shownStep.value).toBe(2)
    expect(shown.shownAccepted.value).toBe(true)
    expect(shown.labelKey.value).toBe('retry')
  })

  it('should name the notice only after a failed send or CV upload', () => {
    expect(view({ state: 'server-error' }).noticeKind.value).toBe(
      'server-error'
    )
    expect(view({ state: 'cv-upload-error' }).noticeKind.value).toBe(
      'cv-upload-error'
    )
    expect(view({ state: 'invalid' }).noticeKind.value).toBeUndefined()
  })
})
