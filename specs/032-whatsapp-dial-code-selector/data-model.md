# Data Model: Dial-code selector before the WhatsApp number

**Feature**: 032 | **Date**: 2026-10-14 | Research: [research.md](./research.md)

## 1 · Country data set — `app/features/forms/data/countries.ts` (new)

```ts
/** ISO 3166-1 alpha-2 (plus CLDR `XK`). Uppercase. */
export type CountryCode = string            // narrowed by `isCountryCode`
export interface CountryEntry {
  code: CountryCode
  /** With the '+', matches DIAL_CODE_PATTERN. */
  dialCode: string
}
export const COUNTRIES: readonly CountryEntry[]       // 245 rows, below
export const DEFAULT_COUNTRY: CountryCode = 'MX'      // spec FR-006 fallback
/** The agreed backend format (2026-10-14). */
export const DIAL_CODE_PATTERN = /^\+[1-9]\d{0,3}$/
```

Rules (unit-tested in `data/countries.test.ts`):

- 245 entries, codes unique, every `dialCode` matches `DIAL_CODE_PATTERN`.
- `DEFAULT_COUNTRY` is in the set and maps to `+52`.
- Every code yields a name different from the code from
  `Intl.DisplayNames(['es-MX'|'en'], { type: 'region', fallback: 'none' })`.
- Rows stored in code order (alphabetical by code) for reviewability; the
  display order is computed per locale (§ 3).

Names and flags are **not** stored (research R2, R3).

Rows (validated by the spec author in Node 24.12 / ICU 77.1 — count,
uniqueness, regex, ES/EN names CONFIRMED; each dial code INFERRED from
ITU-T E.164, see research R4/R5):

```text
AC +247 · AD +376 · AE +971 · AF +93 · AG +1 · AI +1 · AL +355 · AM +374 · AO +244 · AR +54 · AS +1 · AT +43 · AU +61 · AW +297 · AX +358 · AZ +994
BA +387 · BB +1 · BD +880 · BE +32 · BF +226 · BG +359 · BH +973 · BI +257 · BJ +229 · BL +590 · BM +1 · BN +673 · BO +591 · BQ +599 · BR +55 · BS +1 · BT +975 · BW +267 · BY +375 · BZ +501
CA +1 · CC +61 · CD +243 · CF +236 · CG +242 · CH +41 · CI +225 · CK +682 · CL +56 · CM +237 · CN +86 · CO +57 · CR +506 · CU +53 · CV +238 · CW +599 · CX +61 · CY +357 · CZ +420
DE +49 · DJ +253 · DK +45 · DM +1 · DO +1 · DZ +213
EC +593 · EE +372 · EG +20 · EH +212 · ER +291 · ES +34 · ET +251
FI +358 · FJ +679 · FK +500 · FM +691 · FO +298 · FR +33
GA +241 · GB +44 · GD +1 · GE +995 · GF +594 · GG +44 · GH +233 · GI +350 · GL +299 · GM +220 · GN +224 · GP +590 · GQ +240 · GR +30 · GT +502 · GU +1 · GW +245 · GY +592
HK +852 · HN +504 · HR +385 · HT +509 · HU +36
ID +62 · IE +353 · IL +972 · IM +44 · IN +91 · IO +246 · IQ +964 · IR +98 · IS +354 · IT +39
JE +44 · JM +1 · JO +962 · JP +81
KE +254 · KG +996 · KH +855 · KI +686 · KM +269 · KN +1 · KP +850 · KR +82 · KW +965 · KY +1 · KZ +7
LA +856 · LB +961 · LC +1 · LI +423 · LK +94 · LR +231 · LS +266 · LT +370 · LU +352 · LV +371 · LY +218
MA +212 · MC +377 · MD +373 · ME +382 · MF +590 · MG +261 · MH +692 · MK +389 · ML +223 · MM +95 · MN +976 · MO +853 · MP +1 · MQ +596 · MR +222 · MS +1 · MT +356 · MU +230 · MV +960 · MW +265 · MX +52 · MY +60 · MZ +258
NA +264 · NC +687 · NE +227 · NF +672 · NG +234 · NI +505 · NL +31 · NO +47 · NP +977 · NR +674 · NU +683 · NZ +64
OM +968
PA +507 · PE +51 · PF +689 · PG +675 · PH +63 · PK +92 · PL +48 · PM +508 · PR +1 · PS +970 · PT +351 · PW +680 · PY +595
QA +974
RE +262 · RO +40 · RS +381 · RU +7 · RW +250
SA +966 · SB +677 · SC +248 · SD +249 · SE +46 · SG +65 · SH +290 · SI +386 · SJ +47 · SK +421 · SL +232 · SM +378 · SN +221 · SO +252 · SR +597 · SS +211 · ST +239 · SV +503 · SX +1 · SY +963 · SZ +268
TA +290 · TC +1 · TD +235 · TG +228 · TH +66 · TJ +992 · TK +690 · TL +670 · TM +993 · TN +216 · TO +676 · TR +90 · TT +1 · TV +688 · TW +886 · TZ +255
UA +380 · UG +256 · US +1 · UY +598 · UZ +998
VA +39 · VC +1 · VE +58 · VG +1 · VI +1 · VN +84 · VU +678
WF +681 · WS +685
XK +383
YE +967 · YT +262
ZA +27 · ZM +260 · ZW +263
```

## 2 · Form values and field ids

`ContactFormValues` and `ApplicationFormValues` gain one key, placed
**between `contactPreference` and `whatsapp`** (insertion order = focus
order, spec FR-016):

```ts
whatsappCountry: CountryCode   // initial DEFAULT_COUNTRY; never empty
```

`ContactFieldId` / `ApplicationFieldId` gain `'whatsappCountry'`;
`CONTACT_FIELD_ORDER` / `APPLICATION_FIELD_ORDER` insert it before
`'whatsapp'`. The selector's DOM id is `whatsappCountry` (so
`focusField('whatsappCountry')` works unchanged).

Lifecycle:

| Event | `whatsappCountry` | `whatsapp` |
|---|---|---|
| initial values (also during prerender) | `DEFAULT_COUNTRY` | `''` |
| preference → WhatsApp, visitor has not picked a country yet | ~~`detectDefaultCountry(readLanguages())`~~ **Amendment A1**: unchanged here; the `/__geo` report sets it (§ 8.5) | unchanged (`''`) |
| preference → WhatsApp, visitor already picked | kept (OA-9) | unchanged (`''`) |
| preference → Correo | kept (OA-9) | `''` (existing rule) |
| visitor picks a country | that code; "picked" flag set | unchanged |

The "picked" flag is a composable-local `ref<boolean>`, not a form value: it
is never sent and never validated.

## 3 · Pure logic — `app/features/forms/logic/countryOptions.ts` (new)

> **Amendment A1**: `detectDefaultCountry` and `readBrowserLanguages` are
> removed; `toReportedCountry` is added (§ 8.3).

```ts
/** First region of `languages` that is in COUNTRIES; else DEFAULT_COUNTRY. */
export function detectDefaultCountry(languages: readonly string[]): CountryCode
/** Browser-only read; `[]` when `navigator` is absent (prerender, tests). */
export function readBrowserLanguages(): readonly string[]
/** `MX` → 🇲🇽 (regional indicators). */
export function flagEmoji(code: CountryCode): string
/** `+52` for `MX`; throws on an unknown code (programming error). */
export function dialCodeOf(code: CountryCode): string
export interface CountryOption { code: CountryCode; name: string; dialCode: string; flag: string }
/** All COUNTRIES with names in `displayLocale`, sorted by Intl.Collator(displayLocale). */
export function buildCountryOptions(displayLocale: string): CountryOption[]
```

`displayLocale` is the `language` of the site locale (`es` → `es-MX`,
`en` → `en`), read from i18n in the content composables.

## 4 · Validation (client) — replaces the 10-digit rule

`contactFields.ts`: delete `WHATSAPP_MX_DIGIT_COUNT`; add

```ts
export const WHATSAPP_MIN_DIGITS = 6
export const WHATSAPP_MAX_DIGITS = 14
```

`applicationFields.ts` re-exports both instead of `WHATSAPP_MX_DIGIT_COUNT`.

`validateContactForm` / `validateApplicationForm`, preference WhatsApp:

| Digits after `/\D/g` removal | Error key |
|---|---|
| 0 | `forms.<form>.fields.whatsapp.errorRequired` (unchanged) |
| < 6 or > 14 | `forms.<form>.fields.whatsapp.errorDigits` (copy changes, § 7) |
| 6–14 | none |

`whatsappCountry` has no client rule (always a list value). A server mark
is its only error source.

## 5 · Request payloads — `data/submissionContract.ts`, `logic/submissionPayloads.ts`

`ContactPayload` and `CareersPayload` gain `whatsappDialCode?: string`.
Built only when `contactPreference === 'whatsapp'`, key order
`contactPreference, whatsappDialCode, whatsapp`:

```json
{ "contactPreference": "whatsapp", "whatsappDialCode": "+52", "whatsapp": "5544332211" }
```

With `email`: neither key present. `dialCodeOf` throwing on an unknown code
is caught by the flows' existing `try` → `failure` (same convention as
`toRoleId`).

## 6 · Server field marks — `logic/serverFieldErrors.ts`

```ts
/** Server field name → form field id where they differ (research R8). */
export const SERVER_FIELD_ALIASES: Readonly<Record<string, string>> = {
  whatsappDialCode: 'whatsappCountry',
}
```

`resolveServerFields` maps each server name through the alias first; the
"only while preference is WhatsApp" guard applies to `whatsapp` **and**
`whatsappCountry`. Error keys:

```ts
CONTACT_SERVER_ERROR_KEYS.whatsappCountry     = 'forms.contact.fields.whatsappCountry.errorInvalid'
APPLICATION_SERVER_ERROR_KEYS.whatsappCountry = 'forms.application.fields.whatsappCountry.errorInvalid'
```

`markValue` already reads string values, so the mark clears when the
country code changes (spec FR-017).

## 7 · Content shapes and i18n keys

`ContactFormContent.fields` and `ApplicationFormContent.fields` gain:

```ts
whatsappCountry: { label: string; errorInvalid: string; options: CountryOption[] }
```

(`label` = selector accessible name.) `ContactFormFieldContent` /
`ApplicationFormFieldContent` gain optional `errorInvalid?: string` so
`fieldErrorMessage` resolves it by kind.

| Key (under `forms.contact.fields` and `forms.application.fields`) | ES | EN | Status |
|---|---|---|---|
| `whatsappCountry.label` | Lada del país | Country code | new (OA-8) |
| `whatsappCountry.errorInvalid` | Elige la lada de tu país | Choose your country code | new (OA-8) |
| `whatsapp.errorDigits` | Deben ser entre 6 y 14 dígitos | Must be 6 to 14 digits | changed (OA-8) |

6 keys added per locale, 2 values changed per locale. Country names are
not locale keys (research R2).

## 8 · Amendment A1 (2026-10-14) — default country from `GET /__geo`

All paths under `app/features/forms/`. `data/countries.ts` (`COUNTRIES`,
`DEFAULT_COUNTRY = 'MX'`, `isCountryCode`) is reused unchanged.

### 8.1 · Edge answer (wire format, `contracts/edge-geo-endpoint.md`)

```ts
// What GET /__geo returns when the contract is met. The site never trusts it.
type EdgeGeoBody = { country: string | null }
```

### 8.2 · `logic/edgeCountry.ts` (NEW)

```ts
/** Contract constants (contracts/edge-geo-endpoint.md § 2). */
export const EDGE_COUNTRY_PATH = '/__geo'
export const EDGE_COUNTRY_TIMEOUT_MS = 3000

type FetchLike = (input: string, init: RequestInit) => Promise<Response>

/**
 * One same-origin GET, aborted after the timeout. Returns the raw `country`
 * string from a 2xx JSON body, or `undefined` for anything else (network
 * error, abort, non-2xx, not JSON, missing/non-string `country`).
 * Never throws. Never validates against the list (that is § 3).
 */
export function fetchEdgeCountry(options?: {
  fetchImpl?: FetchLike
  timeoutMs?: number
}): Promise<string | undefined>

/** Memoized per instance: the first call starts the request, later calls
 * return the same promise (spec FR-A08: at most once per page load). */
export function createEdgeCountryLookup(
  fetchOnce?: () => Promise<string | undefined>
): () => Promise<string | undefined>
```

Request: `fetchImpl(EDGE_COUNTRY_PATH, { method: 'GET', credentials: 'omit',
cache: 'no-store', signal })`; nothing else.

### 8.3 · `logic/countryOptions.ts` (CHANGED)

Removed: `detectDefaultCountry(languages)`, `readBrowserLanguages()`,
`regionOf`.

Added:

```ts
/** Spec FR-002/FR-003: a reported value becomes a selectable country only if
 * it is two uppercase letters AND in COUNTRIES; else undefined. */
export function toReportedCountry(value: unknown): CountryCode | undefined
```

Kept: `flagEmoji`, `dialCodeOf`, `buildCountryOptions`.

### 8.4 · Ports in `data/submissionContract.ts` (CHANGED)

```ts
export interface ContactSubmitter {
  engage(host: HTMLElement): void
  submit(values: ContactFormValues): Promise<SubmissionOutcome<ContactFieldId>>
  /** Amendment A1: the visitor's country as reported by the site's own edge,
   * raw. Optional: a port without it (stories, tests) means "unknown". */
  lookupCountry?: () => Promise<string | undefined>
}
// ApplicationSubmitter: same optional member.
```

`logic/useFormSubmission.ts` builds it with `createEdgeCountryLookup()` per
submitter instance (one per page).

### 8.5 · `logic/useDefaultCountry.ts` (NEW, shared by both forms)

```ts
export function useDefaultCountry(options: {
  values: Ref<{ whatsappCountry: CountryCode }>
  lookupCountry?: () => Promise<string | undefined>
}): {
  /** Starts the lookup once (no-op without a port or after the first call);
   * applies a valid answer only while `picked` is false. */
  requestDefaultCountry: () => void
  /** The visitor's own pick: sets the country and `picked = true`. */
  onWhatsappCountryChange: (code: CountryCode) => void
}
```

State (not form values, never sent):

| State | Initial | Becomes |
|---|---|---|
| `whatsappCountry` (form value) | `DEFAULT_COUNTRY` (`MX`), from `initial*Values()` | the reported country, if valid and `picked` is false when the answer arrives; the visitor's pick |
| `picked` | `false` | `true` on the first `onWhatsappCountryChange`; never back |
| `requested` | `false` | `true` on the first `requestDefaultCountry()` |

Transitions:

| Event | Effect |
|---|---|
| first `focusin` in the form (`onEngage`) | `requestDefaultCountry()` (plus the existing Turnstile engage) |
| preference → WhatsApp | `requestDefaultCountry()` (no-op if already requested); the country is **not** reset |
| preference → Correo | number cleared (unchanged); country kept (OA-9) |
| answer arrives, valid & listed, `picked` false | `whatsappCountry = answer` |
| answer arrives, `picked` true | ignored |
| answer `undefined`/invalid/unlisted/timeout | nothing (stays `MX` or the pick) |

### 8.6 · Composables (CHANGED)

`useContactForm` / `useApplicationForm`: remove `readLanguages` option,
`countryPicked`, the detection branch of `onContactPreferenceChange` and the
local `onWhatsappCountryChange`; compose `useDefaultCountry({ values,
lookupCountry: options.submitter.lookupCountry })`; wrap the returned
`onEngage` so it also calls `requestDefaultCountry()`. Return shapes
unchanged, so `ui/` does not change.
