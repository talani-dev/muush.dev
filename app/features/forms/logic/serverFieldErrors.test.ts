import { describe, expect, it } from 'vitest'
import {
  APPLICATION_FIELD_ORDER,
  initialApplicationFormValues,
} from '@/features/forms/data/applicationFields'
import {
  CONTACT_FIELD_ORDER,
  type ContactFieldId,
  type ContactFormValues,
  initialContactFormValues,
} from '@/features/forms/data/contactFields'
import {
  APPLICATION_SERVER_ERROR_KEYS,
  activeServerErrors,
  CONTACT_SERVER_ERROR_KEYS,
  createServerMarks,
  mergeErrors,
  resolveServerFields,
} from './serverFieldErrors'

function contactValues(
  overrides: Partial<ContactFormValues> = {}
): ContactFormValues {
  return { ...initialContactFormValues(), ...overrides }
}

describe('resolveServerFields · contact (research R9)', () => {
  it.each([['name'], ['email'], ['identity'], ['need']])(
    'should map %s to its visible input when the server rejects it',
    field => {
      expect(
        resolveServerFields([field], CONTACT_SERVER_ERROR_KEYS, contactValues())
      ).toEqual([field])
    }
  )

  it.each([
    ['company'],
    ['contactPreference'],
    ['locale'],
    ['turnstileToken'],
    ['cvId'],
    ['somethingUnknown'],
  ])('should refuse to map %s, which has no fixable input', field => {
    expect(
      resolveServerFields(
        ['email', field],
        CONTACT_SERVER_ERROR_KEYS,
        contactValues()
      )
    ).toBeUndefined()
  })

  it('should map whatsapp only when the preference is whatsapp', () => {
    expect(
      resolveServerFields(
        ['whatsapp'],
        CONTACT_SERVER_ERROR_KEYS,
        contactValues({ contactPreference: 'whatsapp' })
      )
    ).toEqual(['whatsapp'])
    expect(
      resolveServerFields(
        ['whatsapp'],
        CONTACT_SERVER_ERROR_KEYS,
        contactValues({ contactPreference: 'email' })
      )
    ).toBeUndefined()
  })

  it('should map whatsappDialCode to the selector when the preference is whatsapp', () => {
    expect(
      resolveServerFields(
        ['whatsappDialCode'],
        CONTACT_SERVER_ERROR_KEYS,
        contactValues({ contactPreference: 'whatsapp' })
      )
    ).toEqual(['whatsappCountry'])
  })

  it('should refuse whatsappDialCode as a site defect when the preference is email', () => {
    expect(
      resolveServerFields(
        ['whatsappDialCode'],
        CONTACT_SERVER_ERROR_KEYS,
        contactValues({ contactPreference: 'email' })
      )
    ).toBeUndefined()
  })

  it('should refuse the form id whatsappCountry when the server names it, since the server never does', () => {
    expect(
      resolveServerFields(
        ['whatsappCountry'],
        CONTACT_SERVER_ERROR_KEYS,
        contactValues({ contactPreference: 'email' })
      )
    ).toBeUndefined()
  })

  it('should refuse an empty field list, which marks nothing the visitor can fix', () => {
    expect(
      resolveServerFields([], CONTACT_SERVER_ERROR_KEYS, contactValues())
    ).toBeUndefined()
  })
})

describe('resolveServerFields · application (research R9)', () => {
  it('should map the six visible application fields when the server rejects them', () => {
    const values = {
      ...initialApplicationFormValues(),
      contactPreference: 'whatsapp' as const,
    }
    const fields = [
      'name',
      'email',
      'areaRole',
      'portfolio',
      'linkedin',
      'whatsapp',
    ]

    expect(
      resolveServerFields(fields, APPLICATION_SERVER_ERROR_KEYS, values)
    ).toEqual(fields)
  })

  it('should map whatsappDialCode to the selector on the application form too', () => {
    expect(
      resolveServerFields(
        ['whatsappDialCode', 'whatsapp'],
        APPLICATION_SERVER_ERROR_KEYS,
        {
          ...initialApplicationFormValues(),
          contactPreference: 'whatsapp' as const,
        }
      )
    ).toEqual(['whatsappCountry', 'whatsapp'])
  })

  it('should refuse cvId, locale and contactPreference on the application form', () => {
    for (const field of ['cvId', 'locale', 'contactPreference']) {
      expect(
        resolveServerFields(
          [field],
          APPLICATION_SERVER_ERROR_KEYS,
          initialApplicationFormValues()
        )
      ).toBeUndefined()
    }
  })
})

describe('server marks', () => {
  const rejected = contactValues({
    email: 'ana@bad',
    contactPreference: 'whatsapp',
    whatsapp: '55 12',
  })

  it('should carry the existing error key of each marked field when created', () => {
    const marks = createServerMarks<ContactFieldId>(
      ['email', 'whatsapp'],
      CONTACT_SERVER_ERROR_KEYS,
      rejected
    )

    expect(activeServerErrors(marks, rejected)).toEqual({
      email: 'forms.contact.fields.email.errorFormat',
      whatsapp: 'forms.contact.fields.whatsapp.errorDigits',
    })
  })

  it('should drop only the mark of a field whose value changed', () => {
    const marks = createServerMarks<ContactFieldId>(
      ['email', 'whatsapp'],
      CONTACT_SERVER_ERROR_KEYS,
      rejected
    )

    expect(
      activeServerErrors(marks, { ...rejected, email: 'ana@muush.dev' })
    ).toEqual({ whatsapp: 'forms.contact.fields.whatsapp.errorDigits' })
  })

  it('should drop the whatsapp mark when switching to email discards the value', () => {
    const marks = createServerMarks<ContactFieldId>(
      ['whatsapp'],
      CONTACT_SERVER_ERROR_KEYS,
      rejected
    )

    expect(
      activeServerErrors(marks, {
        ...rejected,
        contactPreference: 'email',
        whatsapp: '',
      })
    ).toEqual({})
  })
})

describe('server marks · dial code (feature 32)', () => {
  const rejected = contactValues({
    contactPreference: 'whatsapp',
    whatsappCountry: 'CO',
    whatsapp: '3001234567',
  })

  it('should carry the dial-code message while the country is unchanged', () => {
    const marks = createServerMarks<ContactFieldId>(
      ['whatsappCountry'],
      CONTACT_SERVER_ERROR_KEYS,
      rejected
    )

    expect(activeServerErrors(marks, rejected)).toEqual({
      whatsappCountry: 'forms.contact.fields.whatsappCountry.errorInvalid',
    })
  })

  it('should drop the dial-code mark when another country is picked', () => {
    const marks = createServerMarks<ContactFieldId>(
      ['whatsappCountry', 'whatsapp'],
      CONTACT_SERVER_ERROR_KEYS,
      rejected
    )

    expect(
      activeServerErrors(marks, { ...rejected, whatsappCountry: 'MX' })
    ).toEqual({ whatsapp: 'forms.contact.fields.whatsapp.errorDigits' })
  })

  it('should keep the number mark when only the country changes', () => {
    const marks = createServerMarks<ContactFieldId>(
      ['whatsapp'],
      CONTACT_SERVER_ERROR_KEYS,
      rejected
    )

    expect(
      activeServerErrors(marks, { ...rejected, whatsappCountry: 'MX' })
    ).toEqual({ whatsapp: 'forms.contact.fields.whatsapp.errorDigits' })
  })

  it('should hide the dial-code mark when the preference is email, though the country is kept', () => {
    const marks = createServerMarks<ContactFieldId>(
      ['whatsappCountry'],
      CONTACT_SERVER_ERROR_KEYS,
      rejected
    )

    expect(
      activeServerErrors(marks, {
        ...rejected,
        contactPreference: 'email',
        whatsapp: '',
      })
    ).toEqual({})
  })

  it('should put the selector before the number when both are marked', () => {
    const merged = mergeErrors<ContactFieldId>(
      {},
      {
        whatsapp: 'forms.contact.fields.whatsapp.errorDigits',
        whatsappCountry: 'forms.contact.fields.whatsappCountry.errorInvalid',
      },
      CONTACT_FIELD_ORDER
    )

    expect(Object.keys(merged)).toEqual(['whatsappCountry', 'whatsapp'])
  })
})

describe('mergeErrors', () => {
  it('should keep the form field order and let a client error win over a server mark', () => {
    const merged = mergeErrors<ContactFieldId>(
      { need: 'client.need', email: 'client.email' },
      { email: 'server.email', name: 'server.name' },
      CONTACT_FIELD_ORDER
    )

    expect(Object.keys(merged)).toEqual(['name', 'email', 'need'])
    expect(merged.email).toBe('client.email')
    expect(merged.name).toBe('server.name')
  })

  it('should work over the application field order too', () => {
    expect(
      Object.keys(
        mergeErrors(
          { whatsapp: 'a' },
          { portfolio: 'b' },
          APPLICATION_FIELD_ORDER
        )
      )
    ).toEqual(['portfolio', 'whatsapp'])
  })
})
