import { describe, expect, it, vi } from 'vitest'
import { initialApplicationFormValues } from '@/features/forms/data/applicationFields'
import {
  useApplicationForm,
  validateApplicationForm,
} from './useApplicationForm'

/** A `File` fixture with a controllable `.size`, since a real PDF this small
 * would never exceed `CV_MAX_BYTES` on its own. */
function pdfFixture(size = 1024, type = 'application/pdf'): File {
  const file = new File(['%PDF-1.4'], 'cv.pdf', { type })
  if (file.size !== size) {
    Object.defineProperty(file, 'size', { value: size })
  }
  return file
}

describe('validateApplicationForm', () => {
  it('should flag every always-required field when all values are empty', () => {
    const errors = validateApplicationForm(initialApplicationFormValues())

    expect(Object.keys(errors)).toEqual(['name', 'email', 'areaRole'])
  })

  it('should not flag cv, portfolio or linkedin when every other field is valid', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
    })

    expect(errors).toEqual({})
    expect(errors.cv).toBeUndefined()
    expect(errors.portfolio).toBeUndefined()
    expect(errors.linkedin).toBeUndefined()
  })

  it('should reject a name shorter than the minimum when validated', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'A',
    })

    expect(errors.name).toBe('forms.application.fields.name.errorRequired')
  })

  it('should reject a malformed email independently of the other fields', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'not-an-email',
      areaRole: 'it:placeholder',
    })

    expect(Object.keys(errors)).toEqual(['email'])
  })

  it('should require an area/role selection', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: '',
    })

    expect(errors.areaRole).toBe(
      'forms.application.fields.areaRole.errorRequired'
    )
  })

  it('should never validate portfolio or linkedin when they are empty', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
      portfolio: '',
      linkedin: '',
    })

    expect(errors.portfolio).toBeUndefined()
    expect(errors.linkedin).toBeUndefined()
  })

  it('should reject a malformed portfolio or linkedin URL only when non-empty', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
      portfolio: 'not a url',
      linkedin: 'also not a url',
    })

    expect(errors.portfolio).toBe(
      'forms.application.fields.portfolio.errorFormat'
    )
    expect(errors.linkedin).toBe(
      'forms.application.fields.linkedin.errorFormat'
    )
  })

  it('should accept a well-formed portfolio and linkedin URL', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
      portfolio: 'https://ana.dev',
      linkedin: 'https://linkedin.com/in/ana',
    })

    expect(errors.portfolio).toBeUndefined()
    expect(errors.linkedin).toBeUndefined()
  })

  describe('cv', () => {
    it('should not flag a null cv when CV_REQUIRED is false (the shipped default)', () => {
      const errors = validateApplicationForm({
        ...initialApplicationFormValues(),
        name: 'Ana',
        email: 'ana@muush.dev',
        areaRole: 'it:placeholder',
        cv: null,
      })

      expect(errors.cv).toBeUndefined()
    })

    it('should reject a non-PDF file with the format error', () => {
      const errors = validateApplicationForm({
        ...initialApplicationFormValues(),
        name: 'Ana',
        email: 'ana@muush.dev',
        areaRole: 'it:placeholder',
        cv: new File(['x'], 'cv.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
      })

      expect(errors.cv).toBe('forms.application.fields.cv.errorFormat')
    })

    it('should reject a PDF over the size limit with the size error', () => {
      const errors = validateApplicationForm({
        ...initialApplicationFormValues(),
        name: 'Ana',
        email: 'ana@muush.dev',
        areaRole: 'it:placeholder',
        cv: pdfFixture(6 * 1024 * 1024),
      })

      expect(errors.cv).toBe('forms.application.fields.cv.errorSize')
    })

    it('should accept a valid PDF under the size limit', () => {
      const errors = validateApplicationForm({
        ...initialApplicationFormValues(),
        name: 'Ana',
        email: 'ana@muush.dev',
        areaRole: 'it:placeholder',
        cv: pdfFixture(1024),
      })

      expect(errors.cv).toBeUndefined()
    })
  })

  it('should never validate whatsapp while the preference is email', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
      contactPreference: 'email',
      whatsapp: '',
    })

    expect(errors.whatsapp).toBeUndefined()
  })

  it('should require whatsapp only when the preference is whatsapp', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
      contactPreference: 'whatsapp',
      whatsapp: '',
    })

    expect(errors.whatsapp).toBe(
      'forms.application.fields.whatsapp.errorRequired'
    )
  })

  it('should reject a whatsapp number with the wrong digit count for Mexico', () => {
    const errors = validateApplicationForm({
      ...initialApplicationFormValues(),
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
      contactPreference: 'whatsapp',
      whatsapp: '123',
    })

    expect(errors.whatsapp).toBe(
      'forms.application.fields.whatsapp.errorDigits'
    )
  })
})

describe('useApplicationForm · the two reachable states', () => {
  it('should default to idle with the default contact preference of email', () => {
    const { state, values } = useApplicationForm()

    expect(state.value).toBe('idle')
    expect(values.value.contactPreference).toBe('email')
    expect(values.value.cv).toBeNull()
  })

  it('should move to invalid and name the first invalid field on an empty submit', () => {
    const { state, firstInvalidFieldId, onSubmit } = useApplicationForm()

    onSubmit(new Event('submit'))

    expect(state.value).toBe('invalid')
    expect(firstInvalidFieldId.value).toBe('name')
  })

  it('should not clear any value when validation fails', () => {
    const { values, onSubmit } = useApplicationForm({
      name: 'A',
      portfolio: 'https://ana.dev',
    })

    onSubmit(new Event('submit'))

    expect(values.value.name).toBe('A')
    expect(values.value.portfolio).toBe('https://ana.dev')
  })

  it('should stay idle — never any other value — when a valid submit occurs, cv included', () => {
    const form = useApplicationForm({
      name: 'Ana',
      email: 'ana@muush.dev',
      areaRole: 'it:placeholder',
      cv: pdfFixture(1024),
    })

    form.onSubmit(new Event('submit'))

    /* The composable's return type has no `sending` | `success` |
       `server-error` member at all — this asserts the runtime value stays
       inside the two-member union the type already restricts it to. */
    expect(form.state.value).toBe('idle')
  })

  it('should call preventDefault on submit regardless of validity', () => {
    const event = new Event('submit', { cancelable: true })
    const { onSubmit } = useApplicationForm()

    onSubmit(event)

    expect(event.defaultPrevented).toBe(true)
  })

  it('should expose no fetch-shaped dependency from the composable', () => {
    /* There is no injected network function to call because none exists —
       the return shape itself is the proof (FR-003, FR-011). */
    const form = useApplicationForm()

    expect(Object.keys(form).sort()).toEqual(
      [
        'errors',
        'firstInvalidFieldId',
        'onContactPreferenceChange',
        'onCvChange',
        'onSubmit',
        'state',
        'values',
      ].sort()
    )
  })
})

describe('useApplicationForm · the WhatsApp field discards its value', () => {
  it('should reset whatsapp to empty synchronously when switching back to email', () => {
    const { values, onContactPreferenceChange } = useApplicationForm()

    onContactPreferenceChange('whatsapp')
    values.value.whatsapp = '5639060739'
    onContactPreferenceChange('email')

    expect(values.value.whatsapp).toBe('')
    expect(values.value.contactPreference).toBe('email')
  })

  it('should leave whatsapp untouched while staying on whatsapp', () => {
    const { values, onContactPreferenceChange } = useApplicationForm()

    onContactPreferenceChange('whatsapp')
    values.value.whatsapp = '5639060739'
    onContactPreferenceChange('whatsapp')

    expect(values.value.whatsapp).toBe('5639060739')
  })
})

describe('useApplicationForm · the CV field never transmits anything', () => {
  it('should store the raw File on onCvChange with no serialization', () => {
    /* `values` is a reactive `ref`, so the stored file is Vue's reactive
       proxy over the original object, not the same reference — comparing
       its own properties is what proves nothing was serialized instead. */
    const { values, onCvChange } = useApplicationForm()
    const file = pdfFixture(2048)

    onCvChange(file)

    expect(values.value.cv).toBeInstanceOf(File)
    expect(values.value.cv?.name).toBe(file.name)
    expect(values.value.cv?.size).toBe(file.size)
    expect(values.value.cv?.type).toBe(file.type)
  })

  it('should clear cv back to null when onCvChange receives null', () => {
    const { values, onCvChange } = useApplicationForm()

    onCvChange(pdfFixture(2048))
    onCvChange(null)

    expect(values.value.cv).toBeNull()
  })

  it('should call no network primitive from onCvChange, even when a real File is stored', () => {
    /* The composable-level complement of `tests/static-output.test.ts`'s
       compiled-chunk grep (T061): this asserts the *behaviour* — storing a
       file changes only `values.value.cv`, synchronously, with no promise
       left pending and no global fetch/XHR spy ever invoked. */
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { values, onCvChange } = useApplicationForm()

    onCvChange(pdfFixture(2048))

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(values.value.cv).toBeInstanceOf(File)
    fetchSpy.mockRestore()
  })
})
