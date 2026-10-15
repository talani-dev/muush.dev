import { describe, expect, it, vi } from 'vitest'
import {
  buildCountryOptions,
  dialCodeOf,
  flagEmoji,
  toReportedCountry,
} from './countryOptions'

describe('toReportedCountry', () => {
  it.each([['MX'], ['CO'], ['CA']])(
    'should accept %s when it is a listed alpha-2 code',
    code => {
      expect(toReportedCountry(code)).toBe(code)
    }
  )

  it.each([['mx'], ['MEX'], ['M1'], [''], [null], [undefined], [52], [{}]])(
    'should reject %j when it is not an uppercase alpha-2 string',
    value => {
      expect(toReportedCountry(value)).toBeUndefined()
    }
  )

  it.each([['XX'], ['AQ'], ['EU']])(
    'should reject %s when it is well formed but not listed',
    code => {
      expect(toReportedCountry(code)).toBeUndefined()
    }
  )
})

describe('flagEmoji', () => {
  it('should build the regional-indicator pair when given a country code', () => {
    expect(flagEmoji('MX')).toBe('🇲🇽')
    expect(flagEmoji('CO')).toBe('🇨🇴')
  })
})

describe('dialCodeOf', () => {
  it('should return the dial code when the code is listed', () => {
    expect(dialCodeOf('CO')).toBe('+57')
    expect(dialCodeOf('MX')).toBe('+52')
  })

  it('should throw when the code is not listed', () => {
    expect(() => dialCodeOf('QQ')).toThrow()
  })
})

describe('buildCountryOptions', () => {
  it('should list every country with Spanish names sorted by Spanish collation when displayed in es-MX', () => {
    const options = buildCountryOptions('es-MX')
    const names = options.map(option => option.name)
    const collator = new Intl.Collator('es-MX')

    expect(options).toHaveLength(245)
    expect(names[0]).toBe('Afganistán')
    expect([...names].sort(collator.compare)).toEqual(names)
    expect(options.find(option => option.code === 'MX')).toEqual({
      code: 'MX',
      name: 'México',
      dialCode: '+52',
      flag: '🇲🇽',
    })
  })

  it('should sort an accented initial with its base letter when displayed in en', () => {
    const names = buildCountryOptions('en').map(option => option.name)
    const aland = names.indexOf('Åland Islands')

    expect(aland).toBeGreaterThan(-1)
    expect(aland).toBeLessThan(names.indexOf('Zambia'))
    expect(names.indexOf('Mexico')).toBeGreaterThan(-1)
  })

  it('should show the code itself when the browser has no name for it', () => {
    const spy = vi
      .spyOn(Intl.DisplayNames.prototype, 'of')
      .mockReturnValue(undefined)

    const options = buildCountryOptions('es-MX')

    expect(options.find(option => option.code === 'MX')?.name).toBe('MX')
    spy.mockRestore()
  })
})
