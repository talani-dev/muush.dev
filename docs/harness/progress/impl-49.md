# Feature 49 `consented_tracking` — implementation report

Implementer, 2026-11-07, branch `feat/v2-consented-tracking` (no branch
created or switched, nothing committed, pushed or deployed). Spec package:
`specs/049-consented-tracking/` (approved by Roberto 2026-11-07, Q1–Q7).
Status set to `reviewing`; not `done`.

## Verification

| Command | Result |
|---|---|
| `pnpm check` | PASS (674 files, 0 warnings) |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS — 237 files / 3247 tests (baseline before the feature: 222 / 3056) |
| `pnpm generate` | PASS — 28 routes, 13 HTML documents |
| `pnpm storybook:build` | PASS |
| `./init.sh` | PASS — exit 0, "Environment ready." (typecheck, check, test 237/3247, generate, storybook all OK) |

`.output/public` inspected after the last build:

- `robots.txt`: `User-agent: *` + the two AI groups, the 11 agents once each,
  every group `Disallow: ` (empty), `Disallow: /` 0 times, `Sitemap:` once.
  Byte shape equals contracts/build-output.md § 3.
- `llms.txt`: present, byte-identical to `public/llms.txt` and to the fenced
  block of copy-drafts § C (incl. the `Contact: support@muush.dev…` line);
  10 links = the 10 sitemap `<loc>`s.
- No `.map` file, no `sourceMappingURL` in any `.js`/`.css`.
- 0 of 13 HTML documents carry a googletagmanager/fbevents/connect.facebook
  script tag, an inline `gtag(`/`fbq(`, or a `<noscript>` pixel. The two IDs
  appear only inside `window.__NUXT__.config` (public runtime config).
- `sitemap.xml`: 10 URLs, unchanged.
- Vendor logic is in two lazy chunks (~0.9 KB each), fetched only on a
  grant; only the two script-URL constants sit in the entry chunk.

## What was built

- **Shared seam** (`app/shared/`): `data/trackingEvents.ts` (closed lists,
  `TrackingEvent` union, `trackAttrs()`, the T030 CTA audit table as a
  comment) and `logic/trackingBus.ts` (emit/subscribe; a throwing sink never
  stops the others).
- **`tracking` feature** (`app/features/tracking/`, barrel exports
  `startTracking`): `data/trackingConfig.ts`, `data/vendorTypes.ts`;
  `logic/` `startTracking`, `toolSwitch` (lazy load per category, buffers
  events while loading, revoke drops them), `googleAnalytics`, `metaPixel`
  (incl. advanced matching), `thirdPartyCookies`, `injectScript`,
  `pageViews`, `clickTracking`, `sectionVisits`, `useSectionTiming`,
  `whenScrollSettles`. Started by `app/plugins/tracking.client.ts`.
- **Consent** (`legal`): `analytics` category (Necesarias → Analítica →
  Publicidad, same `CookieCategoryRow`, no new token), 12-month expiry in
  `parseConsentRecord(raw, now)` (calendar months, UTC, clamped),
  `cookie_preferences` emitted from `saveChoice` only with Analítica on.
- **Events wired**: CTA `data-track*` on nav, hero, footer (desktop + mobile),
  FAQ, 404, assessment call link, form success call, send-notice email;
  `data-track-section` on the 5 Home and 4 Nosotros sections;
  `data-track-form` on both forms; `form_start/step/submit/error`,
  `generate_lead` (+ `userData`), `application_submit`, `cv_attached` from
  `forms` logic; `language_change` and page views from the router.
- **Copy**: copy-drafts §§ A2–A11, B1–B4, D copied literally into
  `i18n/locales/{es,en}.json` (checked programmatically against the drafts
  file; `tests/legal-copy.test.ts` asserts every approved string);
  `privacyNotice.ts` gained the analytics purpose and the Google sharing item.
- **robots/llms**: `nuxt.config.ts` `robots.groups`; `public/llms.txt`.
- **Website field** (US7): `ContactFieldId`/values/order/step 2, `TextField`
  `maxlength` prop, `ContactPayload.website?` trimmed/omitted/≤ 300 code
  points (throws → generic failure), not in `CONTACT_SERVER_ERROR_KEYS`,
  i18n § D, story value `casaolivo.mx`.
- **Config**: `runtimeConfig.public.gaMeasurementId` / `metaPixelId`;
  blank overrides in `.env.example`.

## Manual checks (quickstart)

Run in headless Chrome 156 over CDP against `.output/public` served on
localhost, with **every Google/Meta URL blocked by the browser**, so nothing
reached either vendor (no data sent to the production properties). Results
are recorded in `docs/harness/progress/current.md`: M1–M8, M13 PASS; M14
structure PASS (row order, 2 switches, identical classes); M16 positions PASS
at 1440 and 390. **Not run**: M9 (hashed `ud[em]`/`ud[ph]` on a real Meta
request), M10, M11, M17 in a browser, the visual half of M14, a full M12
walk. They are covered by unit/integration tests
(`tests/tracking-privacy.test.ts`, `metaPixel.test.ts`, forms tests) but the
network-level confirmation needs a real walk with Roberto (GA4 DebugView /
Meta Test Events, per Q5).

That browser run found two bugs, both fixed with tests:

1. **Double page view** on the first load and on the `#diagnostico` jump: a
   static host serves `/es/`, the router settles on `/es`.
   `isNewPage` now ignores a trailing slash.
2. **Premature `form_view`** after a page change: the observer started while
   the new page was still smooth-scrolling up from the old offset (Home →
   Nosotros reported the application form within 63 ms). Section/form
   observation now starts once the scroll has settled (3 still frames, 2 s
   cap).

## Deviations and decisions (each one line)

- A1 (`legal.privacy.updated`) left at "5 de noviembre de 2026" / "November 5, 2026": the plan fills it at the merge; a `[…]` placeholder would ship if forgotten and fails the existing no-placeholder test. **The leader must set the date at the merge.**
- `CTA_LOCATIONS` per the T030 audit: added `assessment` (the section's "Agenda una llamada") and kept `send_notice`; dropped `mobile_menu` (the open menu has no CTA).
- `form_error` reasons: `ApiResult.failure` gained `network?: true` and `SubmissionOutcome.failure` a `reason`; a missing Turnstile token reports `server` (it cannot be told apart without changing the token retry). A tripped spam guard and a failed CV upload report no `form_error` (not one of the plan's types).
- `cv_attached` is emitted from `useApplicationForm` (`onCvChange`/`onCvReject`), not from the pure `cvFileCheck.ts`.
- Section observer thresholds are 21 steps (0–1 by 0.05), not R8's `[0, 0.5, 1]`, so a section taller than the viewport is noticed when it covers half the viewport.
- `@nuxtjs/robots` 6.2.4 prints a string `comment` one character per line; groups use `comment: ['…']` (findings § R81).
- The no-PII end-to-end test lives in `tests/tracking-privacy.test.ts` (it runs `forms` + `tracking` together, which a feature test must not import); vendor-level PII checks stay in `googleAnalytics.test.ts` / `metaPixel.test.ts`. `startTracking.test.ts` mocks the `legal` barrel; the real legal↔tracking checks are in `tests/tracking-consent.test.ts`.
- contracts/build-output.md § 4 "llms.txt contains no `@`" conflicts with the approved text (Roberto added `support@muush.dev`); the test allows exactly that address.
- `tests/forms-config.test.ts` (feature 029) "no analytics SDK import" now checks package specifiers only; the tracking module's own imports matched its `/analytics/` pattern.
- `tests/static-output.test.ts` "no website field" inverted to assert the field (type text, maxlength 300, placeholder, position, not required, not the honeypot name).
- Legacy v1 `forms/ui/legacy/ContactForm.vue`: one type annotation changed so it compiles with the new `website` field id (no behavior change).
- `transport_type: 'beacon'` and `fbq.disablePushState` stay UNVERIFIED in the vendor docs (findings § R80); everything else in R2–R4 CONFIRMED.
- T049: the spec-kit branch-name refusal is recorded in findings § R82 but no comment was added to `.specify/scripts/bash/common.sh` (vendored tooling).

## For the leader

- **R32 hand-off to Clau (.pen)**: new row "Analítica" / "Analytics" (detail B3) between Necesarias and Publicidad, same row pattern; changed strings: `consent.banner.body` (B1), `consent.categories.advertising.detail` (B4), and `legal.privacy.sections.*`: `purposes.additionalIntro` (A2), `purposes.additionalItems.analytics` NEW (A3), `purposes.additionalItems.advertising` (A4), `purposes.objection` (A5), `sharing.items.meta` (A6), `sharing.items.google` NEW (A7), `sharing.transfers` (A8), `retention.items.browsing` (A9), `cookies.body` (A10), `cookies.choices` (A11); plus `updated` (A1) once dated. Website field strings (§ D) were already in the `.pen`.
- **`docs/business/` lines superseded** (human-only, not edited): `muush-1.0.md` § 1 ("El campo … no se construye por ahora") and the note under § 4.6; `landing/form-api-contract.md` § 3 table lacks `website`.
- **R43 / FR-067**: current.md records Roberto's 2026-11-07 confirmation that the API accepting `website` is live; no code action.
- **GA4 admin follow-ups (tracking plan § 9)**: keep "Page changes based on browser history events" OFF (code sends `page_view`); after the first events, register the custom dimensions (`cta_location`, `channel`, `form`, `step`, `error_type`, `field`, `contact_preference`, `result`, `with_cv`, `from_locale`, `to_locale`, `page_key`, `section`) and the `section_seconds` metric; star `generate_lead`, `book_call_click`, `contact_click` as key events. Meta Events Manager: automatic advanced matching and automatic event setup OFF.
- **Before deploy**: walk M9–M11, M17 and the visual M14 in a real browser with Roberto (DebugView / Test Events), and confirm in the network panel that one in-app navigation gives exactly one Meta `PageView` and the `Lead` carries 64-hex `ud[em]`/`ud[ph]`.
- Business-rule candidates: none found.

## Fix round 1 (npa) — 2026-11-07

Three reports from Roberto, one round: GA hits carried `npa=0`; GA4 showed
page views but none of the custom events; Meta Test events showed only 2
PageViews (at the landing URL) and no `Contact`/`Schedule`. Plus a scope
addition from Roberto: the GA4-only `form_response` event.

**Docs.** Context7 is not available to this subagent; the same official
sources as findings § R80 were read with `curl` (`.md.txt`):
developers.google.com/tag-platform/security/guides/privacy ("When set to
`false`, include an `&npa=1` parameter on all beacons"; page-wide form is
`gtag('set', …)`; consent mode is "the recommended way"),
…/security/guides/consent, …/security/concepts/consent-mode,
…/analytics/devguides/collection/ga4/views; Meta: developers.facebook.com/docs/meta-pixel/guides/track-multiple-events (`trackSingle`).

**How it was measured.** Headless Chrome 156 over CDP against
`.output/public` (local static server). Only the vendor *scripts* were
allowed to load (gtag.js; fbevents.js and its signals config). Every GA
`/g/collect` and every Meta `facebook.com/tr` request was paused by the
Fetch domain, its URL and body recorded, and **failed** — none reached
Google or Meta. Turnstile was replaced by a local fake and the forms API /
CV PUT were answered locally (no real submission). Scripts and raw captures
are in the session scratchpad (`scripts/npa-check.mjs`, `journey.mjs`,
`meta-journey.mjs`). gtag retries a failed hit once with the same `_s`;
counts below are per unique `_s`.

### Root causes (CONFIRMED by the captures)

1. **npa / extra page view.** gtag.js fires an automatic `page_view`
   (`gtm=…za208…`, `_s=1`) while it processes `js`, *before* the commands
   after it: `npa=0`, `gcd=13l3l3l3l1l1` (no consent state), and
   `send_page_view: false` from `config` ignored. A minimal static page with
   only the gtag snippet reproduced it; moving `set`/`consent` after `js`
   kept `npa=0`; putting them before `js` gave `npa=1`; adding
   `gtag('set', 'send_page_view', false)` before `js` removed that hit.
   Fix: `set send_page_view false`, `set allow_ad_personalization_signals
   false`, `set allow_google_signals false`, `consent default` (ad_* denied,
   analytics_storage granted), then `js`, then `config` (unchanged) — all
   inside `load()`, i.e. only after the Analytics grant.
2. **Meta in-app PageViews.** fbevents 2.9.438 sends the first
   `fbq('track', 'PageView')` of a document and silently drops every later
   one (our `disablePushState` is on). `fbq('trackSingle', id, 'PageView')`
   is sent every time with `dl` = current route. Fix in `metaPixel.ts`.
   Meta also sends **nothing** from a headless UA ("[Meta pixel] Bot" error
   log); the Meta captures used a normal Chrome UA string.
3. **Custom events "missing" in GA4.** Not reproduced on the site side: every
   event the site generates is in the captured GA requests, before and after
   the fix (table below). CONFIRMED: the sink fires after the grant, batched
   bodies carry every `en=` line, `transport_type` / scroll-settle do not
   swallow anything. So the gap Roberto saw is on GA's side or in how it was
   read (UNVERIFIED: e.g. a data filter, Realtime/User-snapshot lag, or the
   pre-fix hits; check Admin → Data filters and DebugView after deploy).
   Likewise `Contact`/`Schedule` DO leave the browser (captured `ev=Contact`,
   `ev=Schedule`); the "Custom event" label in Test events is Meta's display —
   the request carries `ev=PageView` exactly (UNVERIFIED why it labels it so).
   The root URL in Roberto's PageViews is the URL at grant time when the
   visit starts at `/` (INFERRED).

### Evidence

npa (all unique hits, after the fix): **`npa=1` on every hit**, incl. the
first `page_view` and later `assessment_cta_click`, `section_view`,
`form_view`, `cookie_preferences`, `form_*`, `generate_lead`, `scroll`;
`gcs=G101`, `gcd=13p3t3p3p7l1` on every hit. Before the fix the first hit was
`page_view` with `npa=0` and no consent state; the rest `npa=1` once the
`set`s were added after `js`.

| | before | after |
|---|---|---|
| no choice stored | 0 requests, `gtag` undefined | same |
| page views on a grant + 1 in-app nav | 2 on load (auto `npa=0` + ours) | 1 on load + 1 per nav |
| dataLayer head | `js, set, set, consent, config` | `set send_page_view, set ads, set signals, consent, js, config` |
| `config` params | `send_page_view:false, cookie_expires:36288000, signals off` | unchanged |
| `_ga` lifetime in Chrome | 400 days (Chrome's cap on `cookie_expires` 420 d) | 400 days |
| revoke → navigate | — | 0 hits, `ga-disable` true |
| re-grant | — | 1 `page_view` `npa=1`, `ga-disable` false, still 1 `consent` call |

Roberto's journey (accept all, Home → Nosotros → Home, scroll, both forms,
API answered locally): generated in dataLayer = sent in collect, per event:
page_view 4/4, cookie_preferences 1/1, section_view 7/8 (8th = flush on the
final reload), form_view 2/2, form_start 2/2, form_submit 2/2,
form_response 2/2, generate_lead 1/1, cv_attached 1/1, application_submit
1/1. Batches: `_s=6` = `form_start, form_submit, form_response{assessment,ok},
generate_lead{assessment,email}`; `_s=8` = `cv_attached{ok}, form_start,
form_submit, form_response{application,ok}, application_submit{with_cv=1}`.

API failing (every forms-API request failed from localhost): `_s=6` =
`form_start, form_submit, form_response{assessment,error,network},
form_error{assessment,network}`; `_s=8` = `cv_attached, form_start,
form_submit, form_response{application,error,network}` (no `form_error` for a
CV upload failure, as before).

Meta (after, `tr` GETs, all failed): `PageView dl=/es/`, `PageView
dl=/es/nosotros`, `PageView dl=/es`, `Contact`, `Schedule`, `Contact`; before:
only the first `PageView`, then `Contact`, `Schedule`, `Contact`.

### `form_response` (Roberto's amendment, FR-027, T069)

GA4 only, once per attempt whose API call finished, after the token retry:
`{ form, result: 'ok' }` or `{ form, result: 'error', error_type }`.
`validation` for any server 400 (unlike `form_error`, which reports a 400
the visitor cannot fix as `server`). No token → API never called → none.
Application with a CV: a failed `/careers/upload` reports its type; a failed
CV PUT reports `server` (the client cannot tell S3 refusal from a network
failure) — **decision for Roberto to confirm**. GA4 setup: `result` is
already in the custom-dimension list above (it is shared with
`cv_attached.result`: values `ok`, `error`, `too_large`, `not_pdf`).

### Files

`app/features/tracking/logic/googleAnalytics.ts` (+test),
`app/features/tracking/logic/metaPixel.ts` (+test),
`app/shared/data/trackingEvents.ts`,
`app/features/forms/logic/submissionFlows.ts` (+test),
`tests/tracking-privacy.test.ts`, spec.md (FR-020, FR-027), data-model.md,
tasks.md (T069), findings.md § R80 correction.

Commands: `pnpm check`, `pnpm typecheck`, `pnpm test` (237 files, 3262
tests), `pnpm generate`, `pnpm storybook:build` — all pass.
