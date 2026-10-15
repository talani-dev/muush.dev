import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { type Ref, ref } from 'vue'
import {
  type CountryCode,
  DEFAULT_COUNTRY,
} from '@/features/forms/data/countries'
import { useDefaultCountry } from './useDefaultCountry'

/** A lookup the test answers by hand, to place the answer before or after a
 * pick. */
function deferredLookup() {
  let answer: (value: string | undefined) => void = () => undefined
  const lookupCountry = vi.fn(
    () =>
      new Promise<string | undefined>(resolve => {
        answer = resolve
      })
  )
  return {
    lookupCountry,
    resolve: async (value: string | undefined) => {
      answer(value)
      await flushPromises()
    },
  }
}

function freshValues(): Ref<{ whatsappCountry: CountryCode }> {
  return ref({ whatsappCountry: DEFAULT_COUNTRY })
}

describe('useDefaultCountry', () => {
  it('should stay on Mexico without throwing when there is no lookup port', async () => {
    const values = freshValues()
    const { requestDefaultCountry } = useDefaultCountry({ values })

    expect(() => requestDefaultCountry()).not.toThrow()
    await flushPromises()

    expect(values.value.whatsappCountry).toBe('MX')
  })

  it('should select the reported country when it is valid and listed', async () => {
    const values = freshValues()
    const lookup = deferredLookup()
    const { requestDefaultCountry } = useDefaultCountry({
      values,
      lookupCountry: lookup.lookupCountry,
    })

    requestDefaultCountry()
    await lookup.resolve('CO')

    expect(values.value.whatsappCountry).toBe('CO')
  })

  it.each([['co'], ['COL'], ['ZZ'], [undefined]])(
    'should stay on Mexico when the lookup answers %j',
    async raw => {
      const values = freshValues()
      const lookup = deferredLookup()
      const { requestDefaultCountry } = useDefaultCountry({
        values,
        lookupCountry: lookup.lookupCountry,
      })

      requestDefaultCountry()
      await lookup.resolve(raw)

      expect(values.value.whatsappCountry).toBe('MX')
    }
  )

  it('should stay on Mexico when a stub lookup rejects', async () => {
    const values = freshValues()
    const { requestDefaultCountry } = useDefaultCountry({
      values,
      lookupCountry: () => Promise.reject(new Error('stub')),
    })

    requestDefaultCountry()
    await flushPromises()

    expect(values.value.whatsappCountry).toBe('MX')
  })

  it('should keep the pick when the answer arrives after the visitor picked', async () => {
    const values = freshValues()
    const lookup = deferredLookup()
    const { requestDefaultCountry, onWhatsappCountryChange } =
      useDefaultCountry({ values, lookupCountry: lookup.lookupCountry })

    requestDefaultCountry()
    onWhatsappCountryChange('PE')
    await lookup.resolve('CO')

    expect(values.value.whatsappCountry).toBe('PE')
  })

  it('should keep the pick when the visitor picks after the answer arrived', async () => {
    const values = freshValues()
    const lookup = deferredLookup()
    const { requestDefaultCountry, onWhatsappCountryChange } =
      useDefaultCountry({ values, lookupCountry: lookup.lookupCountry })

    requestDefaultCountry()
    await lookup.resolve('CO')
    onWhatsappCountryChange('PE')

    expect(values.value.whatsappCountry).toBe('PE')
  })

  it('should look up once when asked three times', async () => {
    const values = freshValues()
    const lookup = deferredLookup()
    const { requestDefaultCountry } = useDefaultCountry({
      values,
      lookupCountry: lookup.lookupCountry,
    })

    requestDefaultCountry()
    requestDefaultCountry()
    requestDefaultCountry()

    expect(lookup.lookupCountry).toHaveBeenCalledTimes(1)
  })

  it('should not look up when nothing asked for the default yet', async () => {
    const values = freshValues()
    const lookup = deferredLookup()
    useDefaultCountry({ values, lookupCountry: lookup.lookupCountry })
    await flushPromises()

    expect(lookup.lookupCountry).not.toHaveBeenCalled()
    expect(values.value.whatsappCountry).toBe('MX')
  })
})
