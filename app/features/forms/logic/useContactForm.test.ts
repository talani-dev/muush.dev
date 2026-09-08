import { describe, expect, it } from 'vitest'
import { initialContactFormValues } from '@/features/forms/data/contactFields'
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

describe('useContactForm · the two reachable states', () => {
  it('should default to idle with the default contact preference of email', () => {
    const { state, values } = useContactForm()

    expect(state.value).toBe('idle')
    expect(values.value.contactPreference).toBe('email')
  })

  it('should move to invalid and name the first invalid field on an empty submit', () => {
    const { state, firstInvalidFieldId, onSubmit } = useContactForm()

    onSubmit(new Event('submit'))

    expect(state.value).toBe('invalid')
    expect(firstInvalidFieldId.value).toBe('name')
  })

  it('should not clear any value when validation fails', () => {
    const { values, onSubmit } = useContactForm({
      name: 'A',
      company: 'muush',
    })

    onSubmit(new Event('submit'))

    expect(values.value.name).toBe('A')
    expect(values.value.company).toBe('muush')
  })

  it('should stay idle — never any other value — when a valid submit occurs', () => {
    const form = useContactForm({
      name: 'Ana',
      email: 'ana@muush.dev',
      identity: 'company',
      need: 'Necesitamos un rediseño completo del sitio.',
    })

    form.onSubmit(new Event('submit'))

    /* The composable's return type has no `sending` | `success` |
       `server-error` member at all — this asserts the runtime value stays
       inside the two-member union the type already restricts it to. */
    expect(form.state.value).toBe('idle')
  })

  it('should call preventDefault on submit regardless of validity', () => {
    const event = new Event('submit', { cancelable: true })
    const { onSubmit } = useContactForm()

    onSubmit(event)

    expect(event.defaultPrevented).toBe(true)
  })

  it('should expose no fetch-shaped dependency from the composable', () => {
    /* There is no injected network function to call because none exists —
       the return shape itself is the proof (FR-014, spec US2). */
    const form = useContactForm()

    expect(Object.keys(form).sort()).toEqual(
      [
        'errors',
        'firstInvalidFieldId',
        'onContactPreferenceChange',
        'onSubmit',
        'state',
        'values',
      ].sort()
    )
  })
})

describe('useContactForm · the WhatsApp field discards its value', () => {
  it('should reset whatsapp to empty synchronously when switching back to email', () => {
    const { values, onContactPreferenceChange } = useContactForm()

    onContactPreferenceChange('whatsapp')
    values.value.whatsapp = '5639060739'
    onContactPreferenceChange('email')

    expect(values.value.whatsapp).toBe('')
    expect(values.value.contactPreference).toBe('email')
  })

  it('should leave whatsapp untouched while staying on whatsapp', () => {
    const { values, onContactPreferenceChange } = useContactForm()

    onContactPreferenceChange('whatsapp')
    values.value.whatsapp = '5639060739'
    onContactPreferenceChange('whatsapp')

    expect(values.value.whatsapp).toBe('5639060739')
  })
})
