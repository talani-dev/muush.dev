import { describe, expect, it } from 'vitest'
import {
  type ApplicationFormValues,
  initialApplicationFormValues,
  ROLE_CATALOG,
  ROLE_IDS,
} from '@/features/forms/data/applicationFields'
import {
  type ContactFormValues,
  initialContactFormValues,
} from '@/features/forms/data/contactFields'
import { HONEYPOT_FIELD_NAME } from '@/features/forms/data/submissionContract'
import {
  buildCareersPayload,
  buildContactPayload,
  toRoleId,
} from './submissionPayloads'

/** Contract § 5, copied literally — the list the server accepts. */
const CONTRACT_ROLE_IDS = [
  'backend',
  'frontend',
  'fullStack',
  'mobile',
  'devOps',
  'infrastructureCloud',
  'productManager',
  'productOwner',
  'uxResearch',
  'uxUiDesign',
  'productDesign',
  'designSystems',
  'projectManager',
  'sales',
  'accountManagement',
  'partnerships',
  'growth',
  'performanceMedia',
  'content',
  'seo',
  'communityManagement',
  'design3d',
  'graphicDesign',
  'blogStorytelling',
]

const AREA_IDS = ['it', 'product', 'projectManagement', 'marketing', 'creative']

const FORBIDDEN_KEYS = [
  'cv',
  HONEYPOT_FIELD_NAME,
  'honeypot',
  'readyAt',
  'timestamp',
  'startedAt',
]

function contactValues(
  overrides: Partial<ContactFormValues> = {}
): ContactFormValues {
  return {
    ...initialContactFormValues(),
    name: '  Ana  ',
    email: ' ana@muush.dev ',
    identity: 'company',
    need: '  Necesitamos un rediseño completo.  ',
    ...overrides,
  }
}

function applicationValues(
  overrides: Partial<ApplicationFormValues> = {}
): ApplicationFormValues {
  return {
    ...initialApplicationFormValues(),
    name: ' Ana ',
    email: 'ana@muush.dev',
    areaRole: 'it:backend',
    ...overrides,
  }
}

describe('buildContactPayload', () => {
  it('should carry exactly the eight contract keys when the preference is email', () => {
    const payload = buildContactPayload(contactValues(), 'es', 'tok-1')

    expect(Object.keys(payload).sort()).toEqual(
      [
        'company',
        'contactPreference',
        'email',
        'identity',
        'locale',
        'name',
        'need',
        'turnstileToken',
      ].sort()
    )
    expect(payload).not.toHaveProperty('whatsapp')
  })

  it('should carry exactly ten keys with the digits only when the preference is whatsapp', () => {
    const payload = buildContactPayload(
      contactValues({
        contactPreference: 'whatsapp',
        whatsapp: '55 1234 5678',
      }),
      'es',
      'tok-1'
    )

    expect(Object.keys(payload)).toHaveLength(10)
    expect(payload.whatsapp).toBe('5512345678')
  })

  it.each([
    ['MX', '+52', '(55) 4433-2211', '5544332211'],
    ['CO', '+57', '300 123 4567', '3001234567'],
    ['CA', '+1', '876-555-1234', '8765551234'],
  ])(
    'should send the dial code of %s before the digits when the preference is whatsapp',
    (country, dialCode, typed, digits) => {
      const payload = buildContactPayload(
        contactValues({
          contactPreference: 'whatsapp',
          whatsappCountry: country,
          whatsapp: typed,
        }),
        'es',
        'tok-1'
      )
      const keys = Object.keys(payload)
      const at = keys.indexOf('contactPreference')

      expect(keys.slice(at, at + 3)).toEqual([
        'contactPreference',
        'whatsappDialCode',
        'whatsapp',
      ])
      expect(payload.whatsappDialCode).toBe(dialCode)
      expect(payload.whatsapp).toBe(digits)
    }
  )

  it('should drop a stale whatsapp value and the dial code when the preference is email', () => {
    const payload = buildContactPayload(
      contactValues({
        contactPreference: 'email',
        whatsappCountry: 'CO',
        whatsapp: '5512345678',
      }),
      'es',
      'tok-1'
    )

    expect(payload).not.toHaveProperty('whatsapp')
    expect(payload).not.toHaveProperty('whatsappDialCode')
  })

  it('should throw when the country is not listed, since the selector only offers listed ones', () => {
    expect(() =>
      buildContactPayload(
        contactValues({
          contactPreference: 'whatsapp',
          whatsappCountry: 'QQ',
          whatsapp: '5544332211',
        }),
        'es',
        't'
      )
    ).toThrow()
  })

  it('should send company as an empty string when it is empty', () => {
    expect(
      buildContactPayload(contactValues({ company: '   ' }), 'es', 't').company
    ).toBe('')
  })

  it('should trim every free-text value when building', () => {
    const payload = buildContactPayload(
      contactValues({ company: ' Altavista ' }),
      'es',
      't'
    )

    expect(payload.name).toBe('Ana')
    expect(payload.email).toBe('ana@muush.dev')
    expect(payload.company).toBe('Altavista')
    expect(payload.need).toBe('Necesitamos un rediseño completo.')
  })

  it('should pass the active locale and the token through untouched', () => {
    const payload = buildContactPayload(contactValues(), 'en', 'tok-xyz')

    expect(payload.locale).toBe('en')
    expect(payload.turnstileToken).toBe('tok-xyz')
  })

  it('should never carry a honeypot, timestamp or file key', () => {
    const payload = buildContactPayload(contactValues(), 'es', 't')

    for (const key of FORBIDDEN_KEYS) {
      expect(payload).not.toHaveProperty(key)
    }
  })

  it('should throw when identity is empty, since validation guarantees it is not', () => {
    expect(() =>
      buildContactPayload(contactValues({ identity: '' }), 'es', 't')
    ).toThrow()
  })
})

describe('buildCareersPayload', () => {
  const REQUIRED_KEYS = [
    'areaRole',
    'contactPreference',
    'email',
    'locale',
    'name',
    'turnstileToken',
  ]

  it('should carry only the required keys when nothing optional applies', () => {
    const payload = buildCareersPayload(applicationValues(), 'es', 't')

    expect(Object.keys(payload).sort()).toEqual(REQUIRED_KEYS)
  })

  it('should add portfolio and linkedin only when they are non-empty', () => {
    const payload = buildCareersPayload(
      applicationValues({
        portfolio: ' https://ana.dev ',
        linkedin: 'https://linkedin.com/in/ana',
      }),
      'es',
      't'
    )

    expect(Object.keys(payload).sort()).toEqual(
      [...REQUIRED_KEYS, 'linkedin', 'portfolio'].sort()
    )
    expect(payload.portfolio).toBe('https://ana.dev')
  })

  it('should omit portfolio and linkedin when they hold only whitespace', () => {
    const payload = buildCareersPayload(
      applicationValues({ portfolio: '  ', linkedin: '' }),
      'es',
      't'
    )

    expect(payload).not.toHaveProperty('portfolio')
    expect(payload).not.toHaveProperty('linkedin')
  })

  it('should add whatsapp digits only when the preference is whatsapp', () => {
    const viaWhatsapp = buildCareersPayload(
      applicationValues({
        contactPreference: 'whatsapp',
        whatsapp: '(55) 1234-5678',
      }),
      'es',
      't'
    )
    const viaEmail = buildCareersPayload(
      applicationValues({ whatsapp: '5512345678' }),
      'es',
      't'
    )

    expect(viaWhatsapp.whatsapp).toBe('5512345678')
    expect(viaEmail).not.toHaveProperty('whatsapp')
    expect(viaEmail).not.toHaveProperty('whatsappDialCode')
  })

  it.each([
    ['MX', '+52'],
    ['CO', '+57'],
    ['CA', '+1'],
  ])(
    'should send the dial code of %s right before whatsapp when the preference is whatsapp',
    (country, dialCode) => {
      const payload = buildCareersPayload(
        applicationValues({
          contactPreference: 'whatsapp',
          whatsappCountry: country,
          whatsapp: '300 123 4567',
        }),
        'es',
        't'
      )
      const keys = Object.keys(payload)
      const at = keys.indexOf('contactPreference')

      expect(keys.slice(at, at + 3)).toEqual([
        'contactPreference',
        'whatsappDialCode',
        'whatsapp',
      ])
      expect(payload.whatsappDialCode).toBe(dialCode)
      expect(payload.whatsapp).toBe('3001234567')
    }
  )

  it('should leave out the dial code when the preference is email even with a country chosen', () => {
    const payload = buildCareersPayload(
      applicationValues({ whatsappCountry: 'CO', whatsapp: '3001234567' }),
      'es',
      't'
    )

    expect(payload).not.toHaveProperty('whatsappDialCode')
    expect(payload).not.toHaveProperty('whatsapp')
  })

  it('should throw when the country is not listed', () => {
    expect(() =>
      buildCareersPayload(
        applicationValues({
          contactPreference: 'whatsapp',
          whatsappCountry: 'QQ',
          whatsapp: '3001234567',
        }),
        'es',
        't'
      )
    ).toThrow()
  })

  it('should add cvId only when one is given', () => {
    expect(
      buildCareersPayload(applicationValues(), 'es', 't', 'cv-123').cvId
    ).toBe('cv-123')
    expect(
      buildCareersPayload(applicationValues(), 'es', 't')
    ).not.toHaveProperty('cvId')
  })

  it('should never carry the file, a file name, the honeypot or a timestamp even with a CV chosen', () => {
    const cv = new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' })
    const payload = buildCareersPayload(
      applicationValues({ cv }),
      'en',
      't',
      'cv-1'
    )

    for (const key of [...FORBIDDEN_KEYS, 'fileName', 'name_of_file']) {
      expect(payload).not.toHaveProperty(key)
    }
    expect(Object.values(payload)).not.toContain(cv)
    expect(JSON.stringify(payload)).not.toContain('cv.pdf')
  })

  it('should send the role id, never the qualified option value', () => {
    expect(buildCareersPayload(applicationValues(), 'es', 't').areaRole).toBe(
      'backend'
    )
  })
})

describe('toRoleId', () => {
  const OPTION_VALUES = ROLE_CATALOG.flatMap(({ area, roleIds }) =>
    roleIds.map(roleId => `${area}:${roleId}`)
  )

  it('should map all 24 select values to exactly the contract role ids', () => {
    expect(OPTION_VALUES).toHaveLength(24)
    expect(OPTION_VALUES.map(toRoleId)).toEqual(CONTRACT_ROLE_IDS)
  })

  it('should never yield an area id when mapping any select value', () => {
    for (const value of OPTION_VALUES) {
      expect(AREA_IDS).not.toContain(toRoleId(value))
    }
  })

  it('should keep sales as the role when the area is also sales', () => {
    expect(toRoleId('sales:sales')).toBe('sales')
  })

  it('should throw when the value is not one of the select options', () => {
    expect(() => toRoleId('it')).toThrow()
    expect(() => toRoleId('backend')).toThrow()
    expect(() => toRoleId('it:sales')).toThrow()
    expect(() => toRoleId('it:unknown')).toThrow()
    expect(() => toRoleId('')).toThrow()
  })
})

describe('ROLE_IDS', () => {
  it('should equal the contract § 5 list literally, in order', () => {
    expect([...ROLE_IDS]).toEqual(CONTRACT_ROLE_IDS)
  })
})
