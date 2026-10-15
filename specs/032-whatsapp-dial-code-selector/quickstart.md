# Quickstart: verify feature 32

## Automated

```bash
pnpm check && pnpm typecheck && pnpm test && pnpm generate && pnpm storybook:build
wc -l app/features/forms/ui/*.vue   # every component ≤ 200
```

Focused suites: `data/countries.test.ts` (data set), `logic/countryOptions.test.ts` (flags, options, `toReportedCountry`),
`logic/edgeCountry.test.ts`, `logic/useDefaultCountry.test.ts` (A1),
`submissionPayloads.test.ts`, `serverFieldErrors.test.ts`,
`useContactForm.test.ts`, `useApplicationForm.test.ts`,
`DialCodeSelect.test.ts`, `WhatsappField.test.ts`, `ContactForm.test.ts`,
`ApplicationForm.test.ts`, `tests/forms-copy.test.ts`,
`tests/forms-application-copy.test.ts`, `tests/i18n-parity.test.ts`,
`tests/static-output.test.ts` (A1: `/__geo` in the client chunk, no
geolocation or `navigator.languages`, no country in HTML).

Static output: no new third-party origin in `.output/public`:

```bash
grep -rhoE 'https?://[a-z0-9.-]+' .output/public | sort -u   # same set as before the feature
```

## Manual (`pnpm dev`)

1. `/es/` → Contacto → choose WhatsApp. Selector shows 🇲🇽 +52 (no edge
   locally; Amendment A1, see below). Network panel: only the same-origin
   `GET /__geo` (404).
2. Open the selector: names in Spanish, alphabetical; pick Colombia →
   face shows 🇨🇴 +57. `/en/`: names in English.
3. Number "300 123 4567" → submit with the network mocked or against the
   test backend: body has `whatsappDialCode: "+57"`, `whatsapp: "3001234567"`.
4. Number "12345" → "Deben ser entre 6 y 14 dígitos". 15 digits → same.
5. Switch to Correo and back: country kept, number empty. Submit with
   Correo: body has neither key.
6. Keyboard only: Tab reaches selector then number; arrows / typing change
   the country; VoiceOver (macOS) announces "Lada del país" and the value.
7. Repeat 1–6 on `/es/nosotros#work` (application form).
8. Windows Chrome/Edge (if available): confirm what the flags look like
   (research R3, OA-5).

## Amendment A1 — without the edge piece (every local environment)

1. `pnpm dev`, open `/es/#contacto`, focus "Nombre". Network: one request
   `GET /__geo` (404, HTML). No other new request.
2. Choose WhatsApp: the selector shows 🇲🇽 +52. No message anywhere.
3. Set the browser language to `en-US` and reload: still Mexico (FR-A04).
4. Reload, do not touch the form: **no** `/__geo` request (FR-A08).
5. Same on `/en/about#work` (application form).
6. `pnpm generate`, serve `.output/public` with any static server: same as
   1–2 (404 → Mexico).
7. `grep -rl "__geo" .output/public/_nuxt` finds the client chunk;
   `grep -rE "geolocation|navigator\.languages" .output/public/_nuxt` finds
   nothing from the forms feature.

### Simulating a reported country by hand

- Storybook: the `ContactForm` / `ApplicationForm` variant whose stub port
  resolves `lookupCountry` to `'CO'` shows Colombia on switching to WhatsApp.
- Browser: DevTools → Sources → Overrides, override `/__geo` with
  `{"country":"CO"}`, reload, focus the form, choose WhatsApp → 🇨🇴 +57.
  Pick Peru before the answer (throttle to "Slow 3G"): Peru stays.

### With the edge piece (after muush-foundation ships the contract)

1. `curl -si https://muush.dev/__geo` → `200`, `cache-control: no-store`,
   `{"country":"MX"}` (from Mexico).
2. Browser with `en-US` language in Mexico: the WhatsApp field shows +52.
3. Through a VPN exit in Colombia: +57.

## Not before

Production deploy only after the backend accepting `whatsappDialCode` is
live (spec OA-2). Amendment A1 adds no deploy order with muush-foundation
(IP-6).
