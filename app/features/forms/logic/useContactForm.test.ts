import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import {
  type ContactFieldId,
  type ContactFormValues,
  initialContactFormValues,
} from '@/features/forms/data/contactFields'
import {
  type ContactSubmitter,
  MIN_FILL_TIME_MS,
  type SubmissionOutcome,
} from '@/features/forms/data/submissionContract'
import { useContactForm, validateContactForm } from './useContactForm'

/**
 * `validateContactForm` first: pure function, no composable instance, one
 * assertion per rule (`data-model.md` § 2).
 */
describe('validateContactForm', () => {
  it('should flag every always-required field when all values are empty', () => {
    const errors = validateContactForm(initialContactFormValues())

    expect(Object.keys(errors)).toEqual(['name', 'email', 'identity', 'need'])
  })

  it('should not flag company when every other field is valid', () => {
    const errors = validateContactForm({
      ...initialContactFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      identity: 'company',
      need: 'Necesitamos un rediseño completo del sitio.',
    })

    expect(errors).toEqual({})
    expect(errors.company).toBeUndefined()
  })

  it('should reject a name shorter than the minimum when validated', () => {
    const errors = validateContactForm({
      ...initialContactFormValues(),
      name: 'A',
    })

    expect(errors.name).toBe('forms.contact.fields.name.errorRequired')
  })

  it('should reject a malformed email independently of the other fields', () => {
    const errors = validateContactForm({
      ...initialContactFormValues(),
      name: 'Ana',
      email: 'not-an-email',
      identity: 'company',
      need: 'Necesitamos un rediseño completo del sitio.',
    })

    expect(Object.keys(errors)).toEqual(['email'])
    expect(errors.email).toBe('forms.contact.fields.email.errorFormat')
  })

  it('should reject a need shorter than the minimum when validated', () => {
    const errors = validateContactForm({
      ...initialContactFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      identity: 'company',
      need: 'Muy corto',
    })

    expect(errors.need).toBe('forms.contact.fields.need.errorLength')
  })

  it('should never validate whatsapp while the preference is email', () => {
    const errors = validateContactForm({
      ...initialContactFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      identity: 'company',
      need: 'Necesitamos un rediseño completo del sitio.',
      contactPreference: 'email',
      whatsapp: '',
    })

    expect(errors.whatsapp).toBeUndefined()
  })

  it('should require whatsapp only when the preference is whatsapp', () => {
    const errors = validateContactForm({
      ...initialContactFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      identity: 'company',
      need: 'Necesitamos un rediseño completo del sitio.',
      contactPreference: 'whatsapp',
      whatsapp: '',
    })

    expect(errors.whatsapp).toBe('forms.contact.fields.whatsapp.errorRequired')
  })

  it('should reject a whatsapp number with the wrong digit count for Mexico', () => {
    const errors = validateContactForm({
      ...initialContactFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      identity: 'company',
      need: 'Necesitamos un rediseño completo del sitio.',
      contactPreference: 'whatsapp',
      whatsapp: '123',
    })

    expect(errors.whatsapp).toBe('forms.contact.fields.whatsapp.errorDigits')
  })

  it('should accept a ten-digit whatsapp number for Mexico', () => {
    const errors = validateContactForm({
      ...initialContactFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      identity: 'company',
      need: 'Necesitamos un rediseño completo del sitio.',
      contactPreference: 'whatsapp',
      whatsapp: '5639060739',
    })

    expect(errors.whatsapp).toBeUndefined()
  })
})

const VALID: Partial<ContactFormValues> = {
  name: 'Ana',
  email: 'ana@muush.dev',
  identity: 'company',
  need: 'Necesitamos un rediseño completo del sitio.',
}

function stubSubmitter(
  outcome: SubmissionOutcome<ContactFieldId> = { kind: 'success' }
) {
  return {
    engage: vi.fn<ContactSubmitter['engage']>(),
    submit: vi.fn<ContactSubmitter['submit']>(async () => outcome),
  }
}

/** A composable whose clock already sits past the minimum fill time. */
function readyForm(
  initial: Partial<ContactFormValues> = VALID,
  submitter = stubSubmitter()
) {
  let clock = 0
  const form = useContactForm({ submitter, initial, now: () => clock })
  form.markInteractive()
  clock += MIN_FILL_TIME_MS
  return { form, submitter }
}

describe('useContactForm · client validation', () => {
  it('should default to idle with the default contact preference of email', () => {
    const { state, values } = useContactForm({ submitter: stubSubmitter() })

    expect(state.value).toBe('idle')
    expect(values.value.contactPreference).toBe('email')
  })

  it('should move to invalid, name the first invalid field and send nothing on an empty submit', async () => {
    const { form, submitter } = readyForm({})

    await form.onSubmit(new Event('submit'))

    expect(form.state.value).toBe('invalid')
    expect(form.firstInvalidFieldId.value).toBe('name')
    expect(submitter.submit).not.toHaveBeenCalled()
  })

  it('should not clear any value when validation fails', async () => {
    const { form } = readyForm({ name: 'A', company: 'muush' })

    await form.onSubmit(new Event('submit'))

    expect(form.values.value.name).toBe('A')
    expect(form.values.value.company).toBe('muush')
  })

  it('should call preventDefault on submit regardless of validity', async () => {
    const event = new Event('submit', { cancelable: true })
    const { form } = readyForm({})

    await form.onSubmit(event)

    expect(event.defaultPrevented).toBe(true)
  })
})

describe('useContactForm · the submit state machine', () => {
  it('should go sending, then success, when the submitter succeeds', async () => {
    let finish: (outcome: SubmissionOutcome<ContactFieldId>) => void = () =>
      undefined
    const submitter = stubSubmitter()
    submitter.submit.mockReturnValue(
      new Promise(resolve => {
        finish = resolve
      })
    )
    const { form } = readyForm(VALID, submitter)

    const submitting = form.onSubmit(new Event('submit'))
    expect(form.state.value).toBe('sending')

    finish({ kind: 'success' })
    await submitting
    expect(form.state.value).toBe('success')
  })

  it('should call the submitter once when submit fires again while sending', async () => {
    const submitter = stubSubmitter()
    submitter.submit.mockReturnValue(new Promise(() => undefined))
    const { form } = readyForm(VALID, submitter)

    void form.onSubmit(new Event('submit'))
    void form.onSubmit(new Event('submit'))
    await flushPromises()

    expect(submitter.submit).toHaveBeenCalledTimes(1)
  })

  it('should hand the submitter a snapshot of the values', async () => {
    const { form, submitter } = readyForm()

    await form.onSubmit(new Event('submit'))

    /* The shared state machine also hands every submitter a progress
       callback (feature 031); the contact flow ignores it. */
    expect(submitter.submit.mock.calls[0]?.[0]).toEqual({
      ...initialContactFormValues(),
      ...VALID,
    })
    expect(submitter.submit.mock.calls[0]?.[0]).not.toBe(form.values.value)
  })

  it('should move to server-error with every value intact when the submitter fails', async () => {
    const { form } = readyForm(VALID, stubSubmitter({ kind: 'failure' }))

    await form.onSubmit(new Event('submit'))

    expect(form.state.value).toBe('server-error')
    expect(form.values.value).toEqual({
      ...initialContactFormValues(),
      ...VALID,
    })
  })

  it('should send again when submitted from server-error', async () => {
    const { form, submitter } = readyForm(
      VALID,
      stubSubmitter({ kind: 'failure' })
    )

    await form.onSubmit(new Event('submit'))
    await form.onSubmit(new Event('submit'))

    expect(submitter.submit).toHaveBeenCalledTimes(2)
  })

  it('should move to server-error rather than hang when a submitter throws', async () => {
    const submitter = stubSubmitter()
    submitter.submit.mockRejectedValue(new Error('broken stub'))
    const { form } = readyForm(VALID, submitter)

    await form.onSubmit(new Event('submit'))

    expect(form.state.value).toBe('server-error')
  })

  it('should engage the submitter with the host before sending and on focus', async () => {
    const submitter = stubSubmitter()
    const host = document.createElement('div')
    let clock = 0
    const form = useContactForm({
      submitter,
      initial: VALID,
      challengeHost: ref(host),
      now: () => clock,
    })
    form.markInteractive()
    clock += MIN_FILL_TIME_MS

    form.onEngage()
    expect(submitter.engage).toHaveBeenLastCalledWith(host)

    await form.onSubmit(new Event('submit'))
    expect(submitter.engage).toHaveBeenCalledTimes(2)
    expect(submitter.engage.mock.invocationCallOrder[1]).toBeLessThan(
      submitter.submit.mock.invocationCallOrder[0] ?? 0
    )
  })
})

describe('useContactForm · server field errors', () => {
  async function rejected(fields: ContactFieldId[]) {
    const { form } = readyForm(
      { ...VALID, contactPreference: 'whatsapp', whatsapp: '5512345678' },
      stubSubmitter({ kind: 'field-errors', fields })
    )
    await form.onSubmit(new Event('submit'))
    return form
  }

  it('should move to invalid with the existing keys of the rejected fields', async () => {
    const form = await rejected(['email', 'whatsapp'])

    expect(form.state.value).toBe('invalid')
    expect(form.errors.value).toEqual({
      email: 'forms.contact.fields.email.errorFormat',
      whatsapp: 'forms.contact.fields.whatsapp.errorDigits',
    })
    expect(form.firstInvalidFieldId.value).toBe('email')
  })

  it('should clear only the mark of the field the visitor edits', async () => {
    const form = await rejected(['email', 'whatsapp'])

    form.values.value.email = 'ana.ruiz@muush.dev'

    expect(Object.keys(form.errors.value)).toEqual(['whatsapp'])
  })

  it('should drop the whatsapp mark with the value when switching to email', async () => {
    const form = await rejected(['whatsapp'])

    form.onContactPreferenceChange('email')

    expect(form.errors.value).toEqual({})
  })
})

describe('useContactForm · anti-spam guard', () => {
  it('should send nothing and show the generic error when submitted before the minimum fill time', async () => {
    let clock = 0
    const submitter = stubSubmitter()
    const form = useContactForm({ submitter, initial: VALID, now: () => clock })
    form.markInteractive()
    clock += MIN_FILL_TIME_MS - 1

    await form.onSubmit(new Event('submit'))

    expect(form.state.value).toBe('server-error')
    expect(submitter.submit).not.toHaveBeenCalled()

    clock += 1
    await form.onSubmit(new Event('submit'))
    expect(submitter.submit).toHaveBeenCalledTimes(1)
  })

  it('should send nothing when the honeypot is filled', async () => {
    const { form, submitter } = readyForm()

    form.honeypot.value = 'bot'
    await form.onSubmit(new Event('submit'))

    expect(form.state.value).toBe('server-error')
    expect(submitter.submit).not.toHaveBeenCalled()
  })
})

describe('useContactForm · the WhatsApp field discards its value', () => {
  it('should reset whatsapp to empty synchronously when switching back to email', () => {
    const { values, onContactPreferenceChange } = useContactForm({
      submitter: stubSubmitter(),
    })

    onContactPreferenceChange('whatsapp')
    values.value.whatsapp = '5639060739'
    onContactPreferenceChange('email')

    expect(values.value.whatsapp).toBe('')
    expect(values.value.contactPreference).toBe('email')
  })

  it('should leave whatsapp untouched while staying on whatsapp', () => {
    const { values, onContactPreferenceChange } = useContactForm({
      submitter: stubSubmitter(),
    })

    onContactPreferenceChange('whatsapp')
    values.value.whatsapp = '5639060739'
    onContactPreferenceChange('whatsapp')

    expect(values.value.whatsapp).toBe('5639060739')
  })
})
