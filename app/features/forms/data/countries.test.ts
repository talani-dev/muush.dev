import { describe, expect, it } from 'vitest'
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  DIAL_CODE_PATTERN,
  isCountryCode,
} from './countries'

/** The data-set guard spec FR-005 asks for: a malformed row fails CI. */
describe('COUNTRIES', () => {
  const dialCodeOf = (code: string) =>
    COUNTRIES.find(entry => entry.code === code)?.dialCode

  it('should hold 245 entries when the data set is complete', () => {
    expect(COUNTRIES).toHaveLength(245)
  })

  it('should hold unique country codes when every row is listed once', () => {
    const codes = COUNTRIES.map(entry => entry.code)

    expect(new Set(codes).size).toBe(codes.length)
  })

  it('should match the agreed dial-code format when any row is checked', () => {
    const malformed = COUNTRIES.filter(
      entry => !DIAL_CODE_PATTERN.test(entry.dialCode)
    )

    expect(malformed).toEqual([])
  })

  it('should map the default country to +52 when the fallback applies', () => {
    expect(DEFAULT_COUNTRY).toBe('MX')
    expect(dialCodeOf(DEFAULT_COUNTRY)).toBe('+52')
  })

  it('should carry the expected dial code when a shared or unusual code is checked', () => {
    expect({
      US: dialCodeOf('US'),
      CA: dialCodeOf('CA'),
      CO: dialCodeOf('CO'),
      ES: dialCodeOf('ES'),
      GB: dialCodeOf('GB'),
      KZ: dialCodeOf('KZ'),
      XK: dialCodeOf('XK'),
    }).toEqual({
      US: '+1',
      CA: '+1',
      CO: '+57',
      ES: '+34',
      GB: '+44',
      KZ: '+7',
      XK: '+383',
    })
  })

  it.each([['es-MX'], ['en']])(
    'should resolve a real name for every code when displayed in %s',
    locale => {
      const names = new Intl.DisplayNames([locale], {
        type: 'region',
        fallback: 'none',
      })
      const unnamed = COUNTRIES.filter(entry => {
        const name = names.of(entry.code)
        return name === undefined || name === entry.code
      })

      expect(unnamed).toEqual([])
    }
  )
})

describe('isCountryCode', () => {
  it('should accept a listed code when checked', () => {
    expect(isCountryCode('CO')).toBe(true)
  })

  it('should reject an unlisted or lowercase code when checked', () => {
    expect(isCountryCode('AQ')).toBe(false)
    expect(isCountryCode('co')).toBe(false)
  })
})
