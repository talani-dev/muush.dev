import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

  it.each([
    ['12345', 'five'],
    ['123456789012345', 'fifteen'],
  ])('should reject %s when the number has %s digits', whatsapp => {
    const errors = validateContactForm({
      ...initialContactFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      identity: 'company',
      need: 'Necesitamos un rediseño completo del sitio.',
      contactPreference: 'whatsapp',
      whatsapp,
    })

    expect(errors.whatsapp).toBe('forms.contact.fields.whatsapp.errorDigits')
  })

  it.each([['123456'], ['12345678901234'], ['(55) 4433-2211'], ['5639060739']])(
    'should accept %s when the digit count is within 6 to 14',
    whatsapp => {
      const errors = validateContactForm({
        ...initialContactFormValues(),
        name: 'Ana',
        email: 'ana@muush.dev',
        identity: 'company',
        need: 'Necesitamos un rediseño completo del sitio.',
        contactPreference: 'whatsapp',
        whatsapp,
      })

      expect(errors).toEqual({})
    }
  )

  it('should count digits only when the number carries separators', () => {
    const errors = validateContactForm({
      ...initialContactFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      identity: 'company',
      need: 'Necesitamos un rediseño completo del sitio.',
      contactPreference: 'whatsapp',
      whatsapp: '(12) 3-4',
    })

    expect(errors.whatsapp).toBe('forms.contact.fields.whatsapp.errorDigits')
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

  it('should mark and focus-order the selector first when the server rejects the dial code and the number', async () => {
    const form = await rejected(['whatsappCountry', 'whatsapp'])

    expect(form.errors.value).toEqual({
      whatsappCountry: 'forms.contact.fields.whatsappCountry.errorInvalid',
      whatsapp: 'forms.contact.fields.whatsapp.errorDigits',
    })
    expect(form.firstInvalidFieldId.value).toBe('whatsappCountry')
  })

  it('should clear the dial-code mark when another country is picked', async () => {
    const form = await rejected(['whatsappCountry'])

    form.onWhatsappCountryChange(
      form.values.value.whatsappCountry === 'CO' ? 'MX' : 'CO'
    )

    expect(form.errors.value).toEqual({})
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

describe('useContactForm · the default country (feature 32 Amendment A1)', () => {
  /** A stub port whose `/__geo` answer the test releases by hand. */
  function formWithLookup() {
    let answer: (value: string | undefined) => void = () => undefined
    const lookupCountry = vi.fn(
      () =>
        new Promise<string | undefined>(resolve => {
          answer = resolve
        })
    )
    const form = useContactForm({
      submitter: { ...stubSubmitter(), lookupCountry },
    })
    const resolve = async (value: string | undefined) => {
      answer(value)
      await flushPromises()
    }
    return { form, lookupCountry, resolve }
  }

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('should select the reported country when the visitor engages and switches to whatsapp', async () => {
    const { form, resolve } = formWithLookup()

    form.onEngage()
    form.onContactPreferenceChange('whatsapp')
    await resolve('CO')

    expect(form.values.value.whatsappCountry).toBe('CO')
  })

  it.each([[undefined], ['xx'], ['ZZ']])(
    'should stay on Mexico when the lookup answers %j',
    async raw => {
      const { form, resolve } = formWithLookup()

      form.onEngage()
      form.onContactPreferenceChange('whatsapp')
      await resolve(raw)

      expect(form.values.value.whatsappCountry).toBe('MX')
    }
  )

  it('should stay on Mexico when the submitter has no lookup port', async () => {
    const form = useContactForm({ submitter: stubSubmitter() })

    form.onEngage()
    form.onContactPreferenceChange('whatsapp')
    await flushPromises()

    expect(form.values.value.whatsappCountry).toBe('MX')
  })

  it('should ignore the browser language when the edge reports Mexico', async () => {
    vi.stubGlobal('navigator', { languages: ['en-US'] })
    const { form, resolve } = formWithLookup()

    form.onContactPreferenceChange('whatsapp')
    await resolve('MX')

    expect(form.values.value.whatsappCountry).toBe('MX')
  })

  it('should not look up the country before the visitor engages or switches', () => {
    const { form, lookupCountry } = formWithLookup()

    expect(lookupCountry).not.toHaveBeenCalled()
    expect(form.values.value.whatsappCountry).toBe('MX')
  })

  it('should look up once when the visitor focuses, switches and switches back', () => {
    const { form, lookupCountry } = formWithLookup()

    form.onEngage()
    form.onEngage()
    form.onContactPreferenceChange('whatsapp')
    form.onContactPreferenceChange('email')
    form.onContactPreferenceChange('whatsapp')

    expect(lookupCountry).toHaveBeenCalledTimes(1)
  })

  it('should never call the global fetch when a lookup port is injected', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { form, resolve } = formWithLookup()

    form.onEngage()
    form.onContactPreferenceChange('whatsapp')
    await resolve('CO')

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('should keep the pick when the answer arrives after the visitor picked', async () => {
    const { form, resolve } = formWithLookup()

    form.onContactPreferenceChange('whatsapp')
    form.onWhatsappCountryChange('PE')
    await resolve('CO')

    expect(form.values.value.whatsappCountry).toBe('PE')
  })

  it('should keep a picked country and empty the number when switching to email and back', async () => {
    const { form, resolve } = formWithLookup()

    form.onContactPreferenceChange('whatsapp')
    await resolve('CO')
    form.onWhatsappCountryChange('PE')
    form.values.value.whatsapp = '987654321'
    form.onContactPreferenceChange('email')
    form.onContactPreferenceChange('whatsapp')

    expect(form.values.value.whatsappCountry).toBe('PE')
    expect(form.values.value.whatsapp).toBe('')
  })

  it('should apply the reported country when the visitor only typed a number', async () => {
    const { form, resolve } = formWithLookup()

    form.onContactPreferenceChange('whatsapp')
    form.values.value.whatsapp = '3001234567'
    await resolve('CO')

    expect(form.values.value.whatsappCountry).toBe('CO')
  })

  it('should send the picked country to the submitter when submitted', async () => {
    const { form, submitter } = readyForm({
      ...VALID,
      contactPreference: 'whatsapp',
      whatsapp: '300 123 4567',
    })

    form.onWhatsappCountryChange('CO')
    await form.onSubmit(new Event('submit'))

    expect(submitter.submit.mock.calls[0]?.[0]).toMatchObject({
      whatsappCountry: 'CO',
      whatsapp: '300 123 4567',
    })
  })
})
