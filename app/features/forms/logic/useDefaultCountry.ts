import type { Ref } from 'vue'
import type { CountryCode } from '@/features/forms/data/countries'
import { toReportedCountry } from './countryOptions'

/**
 * The WhatsApp field's default country, shared by both forms (feature 32,
 * Amendment A1, data-model § 8.5). The form value starts on Mexico
 * (`DEFAULT_COUNTRY`, from the initial values) and is replaced by the
 * country the site's edge reports, if valid and listed.
 *
 * - IP-3: the lookup starts on the visitor's first interaction (first focus
 *   in the form, or switching to WhatsApp), at most once — never at setup,
 *   so prerendered HTML holds no country and an idle visit sends nothing.
 * - IP-4: a late answer never overwrites a country the visitor picked.
 *   Typing a number is not picking; only `onWhatsappCountryChange` is.
 *
 * Plain Vue, no Nuxt: the network sits behind the injected `lookupCountry`
 * port. Without one (stories, tests) nothing is requested.
 */
export interface UseDefaultCountryOptions {
  values: Ref<{ whatsappCountry: CountryCode }>
  lookupCountry?: () => Promise<string | undefined>
}

export interface UseDefaultCountryReturn {
  requestDefaultCountry: () => void
  onWhatsappCountryChange: (code: CountryCode) => void
}

export function useDefaultCountry({
  values,
  lookupCountry,
}: UseDefaultCountryOptions): UseDefaultCountryReturn {
  /** Whether the visitor chose a country themselves. Never back to false. */
  let picked = false
  let requested = false

  function applyReported(raw: string | undefined): void {
    const country = toReportedCountry(raw)
    if (country && !picked) {
      values.value.whatsappCountry = country
    }
  }

  function requestDefaultCountry(): void {
    if (requested || !lookupCountry) {
      return
    }
    requested = true
    /* The port never rejects (edgeCountry.ts); the catch keeps a stub that
       does from surfacing as an unhandled rejection. Mexico stays. */
    lookupCountry().then(applyReported, () => undefined)
  }

  function onWhatsappCountryChange(code: CountryCode): void {
    values.value.whatsappCountry = code
    picked = true
  }

  return { requestDefaultCountry, onWhatsappCountryChange }
}
