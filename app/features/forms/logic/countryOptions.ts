import {
  COUNTRIES,
  type CountryCode,
  type CountryOption,
  isCountryCode,
} from '@/features/forms/data/countries'

/**
 * Pure helpers behind the WhatsApp dial-code selector (feature 32,
 * data-model § 3 and § 8.3). No Vue, no Nuxt, no network. The default
 * country no longer comes from the browser's languages: it is Mexico, or the
 * country the site's edge reports through `GET /__geo` once this file has
 * accepted it (Amendment A1; the request lives in `edgeCountry.ts`).
 */

/** Code point of 🇦 (REGIONAL INDICATOR SYMBOL LETTER A). */
const REGIONAL_INDICATOR_A = 0x1f1e6
const LETTER_A = 'A'.charCodeAt(0)
/** ISO 3166-1 alpha-2 shape, the only one the edge contract sends (§ 3). */
const ALPHA_2_COUNTRY = /^[A-Z]{2}$/

const DIAL_CODE_BY_COUNTRY: ReadonlyMap<CountryCode, string> = new Map(
  COUNTRIES.map(entry => [entry.code, entry.dialCode])
)

/**
 * Spec FR-A02/FR-A03: a reported value becomes the default only when it is
 * two uppercase letters AND a listed country; anything else (`null`, `mx`,
 * `MEX`, `XX`, a number) is `undefined`, which leaves the form on Mexico.
 */
export function toReportedCountry(value: unknown): CountryCode | undefined {
  if (typeof value !== 'string' || !ALPHA_2_COUNTRY.test(value)) {
    return undefined
  }
  return isCountryCode(value) ? value : undefined
}

/** `MX` → 🇲🇽, from the two regional-indicator code points (OA-5). */
export function flagEmoji(code: CountryCode): string {
  return String.fromCodePoint(
    ...[...code].map(
      letter => REGIONAL_INDICATOR_A + letter.charCodeAt(0) - LETTER_A
    )
  )
}

/** `+52` for `MX`. Throws on an unknown code: the selector only offers
 * listed ones, so reaching this is a programming error the submission flows
 * turn into `failure` (same convention as `toRoleId`). */
export function dialCodeOf(code: CountryCode): string {
  const dialCode = DIAL_CODE_BY_COUNTRY.get(code)
  if (!dialCode) {
    throw new Error(`Unknown country code: "${code}"`)
  }
  return dialCode
}

/**
 * Every listed country named in `displayLocale` and sorted by that name with
 * the same locale's collation (spec FR-002/FR-003). A browser with no name
 * for a code shows the code itself, never an empty row.
 */
export function buildCountryOptions(displayLocale: string): CountryOption[] {
  const names = new Intl.DisplayNames([displayLocale], {
    type: 'region',
    fallback: 'none',
  })
  const collator = new Intl.Collator(displayLocale)

  return COUNTRIES.map(({ code, dialCode }) => ({
    code,
    name: names.of(code) ?? code,
    dialCode,
    flag: flagEmoji(code),
  })).sort((a, b) => collator.compare(a.name, b.name))
}
