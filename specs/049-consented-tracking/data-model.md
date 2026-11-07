# Data model — feature 49

## 1 · Consent record (`app/features/legal/data/cookieCategories.ts`)

```ts
OPTIONAL_COOKIE_CATEGORIES = ['analytics', 'advertising'] as const
COOKIE_CATEGORIES order: necessary (required) → analytics → advertising
CONSENT_LIFETIME_MONTHS = 12
ConsentRecord { version: 1; decidedAt: ISO string; categories: { analytics: boolean; advertising: boolean } }
```

Validation (`parseConsentRecord(raw, now)`): JSON object, `version === 1`,
`decidedAt` a valid date, `decidedAt <= now`, `now < decidedAt + 12 months`,
both categories boolean. Anything else → `null` (no choice).

State transitions:

```
no choice ──accept/reject/save──▶ decided(choice, decidedAt)
decided ──save new choice──▶ decided(choice', now)
decided ──12 months elapse (checked at load)──▶ no choice
decided (48 record, no analytics key) ──load──▶ no choice
```

## 2 · Event catalogue (`app/shared/data/trackingEvents.ts`)

Closed lists (`as const`):

| List | Values |
|---|---|
| `CTA_LOCATIONS` | audited set, starting `nav`, `hero`, `mobile_menu`, `footer`, `faq`, `not_found`, `form_success`, `send_notice` |
| `CONTACT_CHANNELS` | `whatsapp`, `email` |
| `FORM_IDS` | `assessment`, `application` |
| `FORM_ERROR_TYPES` | `validation`, `challenge_failed`, `network`, `server` |
| `FORM_FIELD_IDS` | union of `ContactFieldId` and `ApplicationFieldId` ids (ids only) |
| `CV_RESULTS` | `ok`, `too_large`, `not_pdf` |
| `PAGE_KEYS` | `home`, `about` |
| `HOME_SECTIONS` | `hero`, `who_we_are`, `services`, `how_we_work`, `assessment` |
| `ABOUT_SECTIONS` | `hero`, `how_it_comes_together`, `where_we_are`, `work_with_us` |
| `SITE_LOCALES` | `es`, `en` |

`TrackingEvent` is a discriminated union on `name`:

| `name` | `params` | GA4 | Meta |
|---|---|---|---|
| `assessment_cta_click` | `{ cta_location }` | yes | — |
| `book_call_click` | `{ cta_location }` | yes | `Schedule` |
| `contact_click` | `{ channel, cta_location }` | yes | `Contact` |
| `form_view` | `{ form }` | yes | — |
| `form_start` | `{ form }` | yes | — |
| `form_step` | `{ form, step: 1 \| 2 }` | yes | — |
| `form_submit` | `{ form }` | yes | — |
| `form_error` | `{ form, error_type, field? }` (`field` only for `validation`) | yes | — |
| `generate_lead` | `{ form: 'assessment', contact_preference }` + optional `userData { email; phone? }` | yes (params only) | `Lead` (+ user data, FR-030) |
| `form_response` *(Roberto, 2026-11-07, FR-027)* | `{ form, result: 'ok' }` or `{ form, result: 'error', error_type }` | yes | — |
| `cv_attached` | `{ result }` | yes | — |
| `application_submit` | `{ form: 'application', with_cv: boolean }` | yes | — |
| `language_change` | `{ from_locale, to_locale }` | yes | — |
| `section_view` | `{ page_key, section, section_seconds }` | yes | — |
| `cookie_preferences` | `{ analytics: boolean, ads: boolean }` | yes | — |

Page views are not catalogue events: the tracking feature sends them itself.

`trackAttrs(event)` → `{ 'data-track': name, 'data-track-location'?: …, 'data-track-channel'?: … }`
for the three click events. The delegated listener parses these back and
**drops** any value not in its closed list.

## 3 · Section visit (`app/features/tracking/logic/sectionVisits.ts`)

```ts
SectionVisit { pageKey; section; startedAt: number /* ms */; visibleMs: number }
MIN_VISIT_MS = 1000; MAX_VISIT_SECONDS = 600
```

Inputs: `enter(section, t)`, `leave(section, t)`, `hide(t)`, `show(t)`,
`flush(t)` → completed `section_view` events (seconds = round(visibleMs/1000),
capped). Pure; no DOM.

## 4 · Tracking configuration (`nuxt.config.ts` `runtimeConfig.public`)

```ts
gaMeasurementId: 'G-RHZC650SQS'     // public identifier
metaPixelId: '1488638740001981'     // public identifier
```

Overridable at build time with `NUXT_PUBLIC_GA_MEASUREMENT_ID` /
`NUXT_PUBLIC_META_PIXEL_ID`; both names added blank to `.env.example`. An empty
value disables that tool entirely (no script injected) — used by tests and by
any local build that must not report to production properties.

## 5 · Constants (`app/features/tracking/data/`)

- `GA_COOKIE_LIFETIME_SECONDS = 36_288_000` (420 days, < 14 months).
- `GA_SCRIPT_ORIGIN = 'https://www.googletagmanager.com'`,
  `META_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js'`.
- Cookie names: `_ga`, `_ga_<measurement id without "G-">`, `_fbp`.
- Meta event map: `book_call_click → Schedule`, `contact_click → Contact`,
  `generate_lead → Lead`.

## 6 · Assessment form website field (amendment, 2026-11-07; spec FR-060–FR-067)

`app/features/forms/data/contactFields.ts`:

```ts
ContactFieldId    += 'website'
ContactFormValues += { website: string }          // initial ''
CONTACT_FIELD_ORDER = [name, email, company, identity, website, need,
                       contactPreference, whatsappCountry, whatsapp]
WEBSITE_MAX_CODE_POINTS = 300                     // foundation validateWebsite
ContactFormContent.fields.website: ContactFormFieldContent  // label + placeholder only
```

`app/features/forms/data/formSteps.ts`:

```ts
CONTACT_STEP_FIELDS[2] = ['company', 'identity', 'website', 'need']
```

`app/features/forms/data/submissionContract.ts`:

```ts
ContactPayload += { website?: string }   // trimmed, 1–300 code points; key absent when empty; never null
CareersPayload                            // unchanged: never has website
HONEYPOT_FIELD_NAME = 'muush_website'     // unchanged, never a payload key
```

Payload rule (`logic/submissionPayloads.ts`, `buildContactPayload`):

| Typed value | `website` in the body |
|---|---|
| `''` | key absent |
| `'   '` (spaces/tabs/newlines only) | key absent |
| `'  casaolivo.mx  '` | `"casaolivo.mx"` |
| `'@casaolivo'`, `'https://casaolivo.mx'` | as typed (trimmed) |
| 300 code points after trim (e.g. 299 letters + 1 emoji) | sent |
| 301 code points after trim | throws → flow outcome `failure`, no request |

Server answer `validation_failed` with `website` → not in
`CONTACT_SERVER_ERROR_KEYS` → outcome `failure` (generic send error).

i18n keys (both locales, copy-drafts § D): `forms.contact.fields.website.label`,
`forms.contact.fields.website.placeholder`. No error key.

Tracking: the id `website` joins `FORM_FIELD_IDS` through `ContactFieldId`;
its **value** is never part of any event or of `userData`.
