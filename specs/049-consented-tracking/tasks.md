# Tasks: Consented tracking (GA4 + Meta Pixel), AI-bot robots groups and llms.txt

**Input**: `specs/049-consented-tracking/` — spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md, copy-drafts.md
**Tests**: required (Constitution Article X; feature 49 acceptance). Test names follow `should <expected> when <condition>`.
**Copy rule**: any task that writes copy uses the text **as approved by Roberto** in `copy-drafts.md`, literally. If a draft was rejected or edited at the gate, the leader updates `copy-drafts.md` first.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an open task)
- **[Story]**: US1–US7 from spec.md (US7 = website field, amendment 2026-11-07; its tasks are T053–T068 in Phase 8b)

---

## Phase 1: Setup

- [x] T001 Add `gaMeasurementId: 'G-RHZC650SQS'` and `metaPixelId: '1488638740001981'` to `runtimeConfig.public` in `nuxt.config.ts`, with a comment (public identifiers, not credentials; empty value disables the tool; env overrides `NUXT_PUBLIC_GA_MEASUREMENT_ID` / `NUXT_PUBLIC_META_PIXEL_ID`; scoped Article IV exception, plan Complexity Tracking)
- [x] T002 [P] Add `NUXT_PUBLIC_GA_MEASUREMENT_ID=` and `NUXT_PUBLIC_META_PIXEL_ID=` with Spanish comments in the style of the existing entries to `.env.example`
- [x] T003 [P] Verify the GA4 (`gtag` config keys `send_page_view`, `cookie_expires`, `allow_google_signals`, `allow_ad_personalization_signals`, `transport_type`; `window['ga-disable-<id>']`) and Meta (`fbq('set','autoConfig',false,id)`, `fbq.disablePushState`, `fbq('consent','revoke'|'grant')`, `fbq('init', id, { em, ph })` after load, `ph` format) APIs against the official docs (Context7 or curl, research R2–R4); record each as CONFIRMED/UNVERIFIED with URL and date in `docs/harness/findings.md`, and stop and report to the leader if any differs from research.md

---

## Phase 2: Foundational (blocks every user story)

- [x] T004 [P] Write unit tests for the catalogue in `app/shared/data/trackingEvents.test.ts`: closed lists match data-model.md § 2; `trackAttrs()` returns only `data-track`, `data-track-location`, `data-track-channel` for the three click events
- [x] T005 [P] Write unit tests for the bus in `app/shared/logic/trackingBus.test.ts`: no-op without sinks, delivers to every subscriber, unsubscribe stops delivery, `resetTrackingBus` clears
- [x] T006 Create `app/shared/data/trackingEvents.ts` (closed lists, `TrackingEvent` discriminated union, `ClickTrackingEvent`, `trackAttrs`) per data-model.md § 2; `CTA_LOCATIONS` starts with the research R9 set and is finalised in T030
- [x] T007 Create `app/shared/logic/trackingBus.ts` (`emitTrackingEvent`, `onTrackingEvent`, `resetTrackingBus`) per contracts/tracking-runtime.md § 1
- [x] T008 [P] Write tests for the consent record in `app/features/legal/logic/consentRecord.test.ts`: both categories required (a feature-48 record with only `advertising` → null), `choiceForAll` covers both, expiry at exactly 12 months → null, 1 day before → valid, future `decidedAt` → null, invalid date → null, month-end clamping (decided Jan 31 expires end of Jan next year)
- [x] T009 Add `'analytics'` to `OPTIONAL_COOKIE_CATEGORIES`, the `analytics` entry between `necessary` and `advertising` in `COOKIE_CATEGORIES`, and `CONSENT_LIFETIME_MONTHS = 12` in `app/features/legal/data/cookieCategories.ts`; update its header comment
- [x] T010 Implement expiry in `parseConsentRecord(raw, now)` in `app/features/legal/logic/consentRecord.ts` (research R11) and pass `new Date()` from `loadOnce` in `app/features/legal/logic/useCookieConsent.ts`; update `app/features/legal/logic/useCookieConsent.test.ts` (expired stored record → `hasDecided` false; `isGranted('analytics')`)
- [x] T011 Create `app/features/tracking/data/trackingConfig.ts` (script URLs, `GA_COOKIE_LIFETIME_SECONDS = 36_288_000` with the 420-days < 14-months comment, cookie names, Meta event map) and `app/features/tracking/index.ts` exporting `startTracking`
- [x] T012 Create `app/plugins/tracking.client.ts` calling `startTracking({ gaMeasurementId, metaPixelId, router })` from `@/features/tracking` with `useRuntimeConfig().public` and `useRouter()`; nothing else

**Checkpoint**: shared seam, consent model with `analytics` + expiry, plugin entry point exist; `pnpm test` green.

---

## Phase 3: US1 — nothing tracked until the visitor says yes, per category (P1) 🎯 MVP

**Goal**: GA4 and Meta load only after their own category; prerendered HTML has no tag.
**Independent test**: quickstart M1–M5; `tests/tracking-output.test.ts`.

- [x] T013 [P] [US1] Write `tests/tracking-output.test.ts` per contracts/build-output.md §§ 1–2: no `googletagmanager`/`fbevents`/`connect.facebook.net` script, no inline `fbq(`/`gtag(`, no `<noscript>` pixel in any `.output/public/**/*.html`; neither ID literal (assembled from fragments) appears under `app/`
- [x] T014 [P] [US1] Write `app/features/tracking/logic/pageViews.test.ts`: `isNewPage` true only when `path` differs (hash/query-only → false), `localeChange` returns `{from,to}` only when the first path segment changes between `es`/`en`
- [x] T015 [P] [US1] Write `app/features/tracking/logic/googleAnalytics.test.ts` with a fake document/window: no script before `grant()`; one `gtag/js?id=` script after grant even if granted twice; config called with `send_page_view:false`, `cookie_expires: 36288000`, signals off; `page_view` sent on grant; empty ID → nothing
- [x] T016 [P] [US1] Write `app/features/tracking/logic/metaPixel.test.ts` with a fake document/window: no script before grant; one `fbevents.js`; call order `set autoConfig false` → `disablePushState` → `init`, then each page view as `trackSingle <id> PageView` (fix round 1, findings.md § R80); no `<noscript>` created; empty ID → nothing
- [x] T017 [P] [US1] Implement `app/features/tracking/logic/pageViews.ts` (pure `isNewPage`, `localeChange`)
- [x] T018 [US1] Implement the GA loader + sink (`grant`, `sendPageView`, `sink(event)` mapping params only) in `app/features/tracking/logic/googleAnalytics.ts` per research R3 and contracts/tracking-runtime.md § 4
- [x] T019 [US1] Implement the Meta loader + sink (`grant`, `sendPageView`, `sink(event)` mapping only Schedule/Contact/Lead, no params) in `app/features/tracking/logic/metaPixel.ts`; advanced matching NOT yet (US5)
- [x] T020 [US1] Implement `app/features/tracking/logic/startTracking.ts`: idempotent; `watch(consent, …, { immediate: true })` via `useCookieConsent()` from `@/features/legal`; lazily `import()` each vendor module on its first grant; subscribe its sink to the bus; `router.afterEach` sends page views when `isNewPage` and emits `language_change` when `localeChange`; export through `app/features/tracking/index.ts`; add `app/features/tracking/logic/startTracking.test.ts` (each of the four choices loads exactly its tools; returning granted visitor loads on start)
- [x] T021 [US1] Run `pnpm generate` and confirm `tests/tracking-output.test.ts` passes; run quickstart M1–M5 and record results in `docs/harness/progress/current.md`

**Checkpoint**: acceptance items 1, 2, 7 hold.

---

## Phase 4: US2 — change of mind and expiry (P1)

**Goal**: revoke stops sends immediately, deletes cookies, nothing loads next time; 12-month expiry shows the banner (expiry itself done in T010).
**Independent test**: quickstart M7–M8.

- [x] T022 [P] [US2] Write `app/features/tracking/logic/thirdPartyCookies.test.ts`: expiring `_ga`, `_ga_RHZC650SQS`-shaped name and `_fbp` writes `max-age=0` for host and `.muush.dev` domain, path `/`; leaves other cookies alone
- [x] T023 [P] [US2] Implement `app/features/tracking/logic/thirdPartyCookies.ts` (`expireCookies(names, hostname)`)
- [x] T024 [US2] Add `revoke()` / re-`grant()` to `app/features/tracking/logic/googleAnalytics.ts` (`ga-disable-<id>` flag, sink unsubscribed, cookies expired) and `app/features/tracking/logic/metaPixel.ts` (`fbq('consent','revoke'|'grant')`, `_fbp` expired); extend both test files: after revoke, bus events produce no vendor call; re-grant resumes with one page view and no second script
- [x] T025 [US2] Wire revoke/re-grant transitions in `app/features/tracking/logic/startTracking.ts` and extend `startTracking.test.ts` (grant → revoke → no calls; expired record → nothing loads)
- [x] T026 [US2] Run quickstart M7–M8 and record results in `docs/harness/progress/current.md`

**Checkpoint**: acceptance items 3 and 5 hold.

---

## Phase 5: US3 — Analytics category and copy naming Google Analytics (P1)

**Goal**: dialog shows Necesarias → Analítica → Publicidad with the existing row; approved copy in ES/EN.
**Independent test**: quickstart M14; component tests; `i18n-parity`, `legal-copy`.

- [x] T027 [P] [US3] Add the approved `consent.categories.analytics.{name,detail}`, `consent.banner.body` and (if approved) `consent.categories.advertising.detail` (copy-drafts §§ B1–B4) to `i18n/locales/es.json` and `i18n/locales/en.json`, literally
- [x] T028 [P] [US3] Update `app/features/legal/ui/CookiePreferences.test.ts` and `app/features/legal/ui/CookieConsent.test.ts`: three rows in order necessary → analytics → advertising, two independent switches, "Guardar mi elección" saves `{ analytics, advertising }`, both off without a choice; update `app/features/legal/ui/CookieBanner.test.ts` for the new body; update `app/features/legal/data/legalFixtures.testing.ts` / `localeKeys.testing.ts` if they enumerate categories or keys
- [x] T029 [US3] Update `app/features/legal/ui/CookiePreferences.stories.ts` and `app/features/legal/ui/CookieCategoryRow.stories.ts` to show the Analytics row (no change to `CookieCategoryRow.vue` or any token); confirm `tests/token-literals.test.ts` and `tests/design-tokens.test.ts` stay green

**Checkpoint**: acceptance items 4 and 10 hold (copy part of 8 is US5/T041).

---

## Phase 6: US4 — measurement plan events (P2)

**Goal**: every catalogue event, closed values only, journey readable in order.
**Independent test**: quickstart M6, M9–M13; unit tests with PII fixtures.

- [x] T030 [US4] Audit every `CALL_BOOKING_URL`, `SECTION_ANCHORS.assessment`, `wa.me` and `mailto:` use under `app/` (start from `app/features/shell/data/{navigation,footerColumns,contactChannels,faq,notFound}.ts`, `app/features/shell/logic/useShellItemResolver.ts`, `app/features/shell/ui/{ShellItemLink,MobileFooter,StatusSection}.vue`, `app/features/landing/logic/{useHeroContent,useAssessmentContent}.ts`, `app/features/landing/ui/{HeroSection,AssessmentSection}.vue`, `app/features/forms/data/formChrome.ts`, `app/features/forms/logic/{formChromeContent,useContactFormContent}.ts`, `app/features/forms/ui/{SendNotice,FormSuccess}.vue`); fix the final `CTA_LOCATIONS` list in `app/shared/data/trackingEvents.ts` and record the location → file table as a comment there
- [x] T031 [P] [US4] Write `app/features/tracking/logic/clickTracking.test.ts`: a click inside `[data-track]` emits the parsed event; unknown event/location/channel → nothing; clicks outside → nothing
- [x] T032 [P] [US4] Implement `app/features/tracking/logic/clickTracking.ts` (one capture-phase passive document listener, closest `[data-track]`, validation against closed lists) and start it from `startTracking.ts`
- [x] T033 [US4] Add `track` (a `ClickTrackingEvent`) to the CTA/item data models found in T030 and spread `trackAttrs(item.track)` on the rendered `<a>`/`NuxtLink` in the shell, landing and forms components listed in T030; extend each component's existing test with one assertion on the `data-track*` attributes, and add a data test that every CTA model carries a `track` entry
- [x] T034 [P] [US4] Write `app/features/tracking/logic/sectionVisits.test.ts`: enter/leave produces one event with rounded seconds; < 1 s dropped; 600 s cap; hidden tab time excluded; `flush` closes open visits; re-entering a section produces a second event
- [x] T035 [P] [US4] Implement `app/features/tracking/logic/sectionVisits.ts` (pure reducer, data-model.md § 3)
- [x] T036 [US4] Implement `app/features/tracking/logic/useSectionTiming.ts`: after each route on `index`/`about` routes, observe `[data-track-section]` (research R8 thresholds), feed the reducer, emit `section_view` (beacon transport on `pagehide`/hidden), observe `[data-track-form]` for one `form_view` per page view; disconnect on route leave; started from `startTracking.ts`
- [x] T037 [P] [US4] Add `data-track-section` (`hero`, `who_we_are`, `services`, `how_we_work`, `assessment`) to the root of `app/features/landing/ui/{HeroSection,WhoWeAreSection,ServicesSection,HowWeWorkSection,AssessmentSection}.vue` and (`hero`, `how_it_comes_together`, `where_we_are`, `work_with_us`) to `app/features/about/ui/{AboutHeroSection,TeamCompositionSection,WhereWeAreSection,WorkWithMuushSection}.vue`, ids from `HOME_SECTIONS`/`ABOUT_SECTIONS`; one assertion per component test
- [x] T038 [US4] Emit form events on the bus from forms logic: `form_start` (first field interaction, once), `form_step` (mobile step change, `app/features/forms/logic/useFormSteps.ts`), `form_submit` (valid send), `form_error` (validation with field id / `challenge_failed` / `network` / `server`), `generate_lead` (`contactPreference`, assessment `ok: true`), `application_submit` (`with_cv`), `cv_attached` (`app/features/forms/logic/cvFileCheck.ts` result) in `app/features/forms/logic/{useContactForm,useApplicationForm,submissionFlows}.ts`; add `data-track-form` to the form roots in `app/features/forms/ui/{ContactForm,ApplicationForm}.vue`; extend `useContactForm.test.ts`, `useApplicationForm.test.ts`, `submissionFlows.test.ts` with bus-spy assertions
- [x] T039 [US4] Emit `cookie_preferences` (`analytics`, `ads`) from `saveChoice` in `app/features/legal/logic/useCookieConsent.ts` only when `analytics` is true after the save; test in `useCookieConsent.test.ts`
- [x] T040 [US4] Add the no-PII test in `app/features/tracking/logic/googleAnalytics.test.ts`: drive a full assessment and application flow with fixtures `María Fernanda Ruiz`, `mf.ruiz@ejemplo.mx`, `5544332211`, `Inmobiliaria Altavista`, a `need` sentence and a portfolio URL; assert none of those strings appears in any serialized `gtag` call and every param value is in its closed list, boolean or number; same assertion for every Meta call except `init` user data (US5)

**Checkpoint**: FR-020–FR-026 hold; quickstart M6, M10–M13 pass.

---

## Phase 7: US5 — Meta advanced matching + privacy notice (P2) — conditional on gate § A

**Gate**: T041 always runs (the notice must name Google Analytics, acceptance item 8) with whatever Roberto approved in § A. T042–T044 run only if he approved the advanced-matching lines (A4, A5, A6, and B4 if used); if not, skip them, apply A4–A6 in their "Before" wording, record it in `docs/harness/progress/current.md`, and `Lead` ships without user data.

- [x] T041 [P] [US5] Apply the approved privacy-notice text (copy-drafts §§ A1–A11) to `i18n/locales/es.json` and `i18n/locales/en.json`, literally, and add the two new blocks (`purposes.additionalItems.analytics` before `advertising`; `sharing.items.google` after `meta`) to `app/features/legal/data/privacyNotice.ts`; update `tests/legal-copy.test.ts` and `app/features/legal/data/localeKeys.testing.ts` for the new keys
- [x] T042 [P] [US5] Write tests in `app/features/tracking/logic/metaPixel.test.ts`: `generate_lead` with `userData` → `init(id, { em, ph })` then `track('Lead')`; `em` trimmed + lowercased; `ph` = dial code + digits only when WhatsApp; email preference → no `ph`; no other key; `application_submit` → no Meta call
- [x] T043 [US5] Add optional `userData` to the `generate_lead` event in `app/shared/data/trackingEvents.ts`, set it in the assessment success path in `app/features/forms/logic/submissionFlows.ts` (reuse `dialCodeOf` + digits as in `submissionPayloads.ts`), and apply it in the Meta sink in `app/features/tracking/logic/metaPixel.ts`; confirm the GA sink and T040 still exclude it
- [ ] T044 [US5] Run quickstart M9 and verify in the network panel that `Lead` carries `ud[em]`/`ud[ph]` as 64-hex hashes (resolves the UNVERIFIED items of research R4); record in `docs/harness/progress/current.md` — **NOT RUN** (implementer, 2026-11-07): needs a real send and real Meta requests to see the hashed `ud[em]`/`ud[ph]`; left for the manual walk with Roberto (Meta Test Events). Unit and integration tests cover the `init` user data (`metaPixel.test.ts`, `tests/tracking-privacy.test.ts`).

**Checkpoint**: acceptance items 8 and 9 hold.

---

## Phase 8: US6 — AI-bot robots groups and llms.txt (P3)

**Independent test**: quickstart M15; `tests/seo-output.test.ts`.

- [x] T045 [P] [US6] Extend the robots block of `tests/seo-output.test.ts` per contracts/build-output.md § 3: each of the 11 agents once, each group's only rule empty `Disallow:`, no `Disallow: /`, one `Sitemap:`; add a `no sourcemaps` test (no `.map` file, no `sourceMappingURL` in `.js`/`.css` under `.output/public`)
- [x] T046 [US6] Add `robots.groups` to `nuxt.config.ts`: two groups with `comment`, the agents of research R5 and `disallow: ['']` (no `allow`, i18n trap R6); comment citing the provider URLs and the 2026-11-07 check; keep `botDetection`, `header`, `mergeWithRobotsTxtPath` as they are and add no `sitemap` entry
- [x] T047 [P] [US6] Create `public/llms.txt` with the approved block of `copy-drafts.md` § C, byte for byte
- [x] T048 [US6] Add llms.txt tests to `tests/seo-output.test.ts` per contracts/build-output.md § 4: exists, equals `public/llms.txt`, equals the § C fenced block of `specs/049-consented-tracking/copy-drafts.md`, H1 + blockquote format, link set == sitemap `<loc>` set, no `@`, no `wa.me`

**Checkpoint**: acceptance items 11–13 hold.

---

## Phase 8b: US7 — website field on the assessment form (P2) — amendment 2026-11-07

**Goal**: optional "Tu sitio web o redes (opcional)" field in the `.pen` position; `website` sent trimmed or omitted on `POST /contact` only, ≤ 300 code points; never in GA4/Meta.
**Independent test**: quickstart M16–M17; unit/component tests below.
**Sources**: spec US7, FR-060–FR-067; research R12; data-model § 6; contracts/contact-website.md; copy-drafts § D (APPROVED).
**Deploy precondition (not a task)**: R43, FR-067 — Roberto confirms the API release accepting `website` is live before the deploy.

Tests first (they fail until T060–T066 land):

- [x] T053 [P] [US7] In `tests/forms-copy.test.ts`, replace the `Object.keys(fields)).not.toContain('website')` assertion of "should carry no website field and no v1 key…" with exact-text assertions for `forms.contact.fields.website.label` and `.placeholder` in ES and EN (copy-drafts § D), renaming the test accordingly; keep its v1-key assertions unchanged
- [x] T054 [P] [US7] In `app/features/forms/logic/submissionPayloads.test.ts` add: `'  casaolivo.mx  '` → `website: 'casaolivo.mx'`; `'@casaolivo'` and `'https://casaolivo.mx'` sent as typed; `''` and `' \t\n '` → no `website` key (`'website' in payload` is false, never `null`/`''`); `'a'.repeat(299) + '😀'` (300 code points, 301 UTF-16 units) → sent; `'a'.repeat(300) + '😀'` (301 code points) → throws; `buildCareersPayload` never has `website`; neither payload has a `muush_website` key
- [x] T055 [P] [US7] In `app/features/forms/data/formSteps.test.ts` expect `CONTACT_STEP_FIELDS[2]` to equal `['company', 'identity', 'website', 'need']` (the existing partition test covers `CONTACT_FIELD_ORDER`); add a test that `CONTACT_FIELD_ORDER` places `website` between `identity` and `need` and that `initialContactFormValues().website === ''`
- [x] T056 [P] [US7] In `app/features/forms/ui/ContactForm.test.ts`: update "should render every field in the design order…" to expect `website` between `identity` and `need`, drop the `#website`-absent and `/sitio web|website/` assertions, and assert the label, `placeholder="https://"`, `type="text"`, `maxlength="300"`, no `required`, no `name="muush_website"` on `#website`; update "should send the exact values once…" to include `website: ''`; add "should send the typed website when filled" and "should show the website field in step 2 between identity and need when narrow"; add "should make the website field readonly while sending"
- [x] T057 [P] [US7] In `app/features/forms/ui/TextField.test.ts` add: renders `maxlength` when the prop is given; renders no `maxlength` attribute when it is not
- [x] T058 [P] [US7] In `app/features/forms/logic/submissionFlows.test.ts` add: a contact `validation_failed` with `fields: ['website']` → `{ kind: 'failure' }`; a website of 301 code points → `{ kind: 'failure' }` and `postContact` never called; in `app/features/forms/logic/serverFieldErrors.test.ts` assert `resolveServerFields(['website'], CONTACT_SERVER_ERROR_KEYS, values)` is `undefined`; update any full `ContactFormValues` literal in these two files with `website`
- [x] T059 [P] [US7] In `app/features/forms/logic/useContactForm.test.ts` add: `validateContactForm` never returns a `website` error (empty, spaces, 301 code points); update full-values literals in `useContactForm.test.ts` and `useSpamGuard.test.ts` with `website: ''`

Implementation:

- [x] T060 [US7] In `app/features/forms/data/contactFields.ts` add `'website'` to `ContactFieldId`, `website: string` to `ContactFormValues` (with a comment: free text, optional, Roberto 2026-11-07 supersedes muush-1.0.md § 1), `'website'` between `identity` and `need` in `CONTACT_FIELD_ORDER`, `website: ''` in `initialContactFormValues`, `website: ContactFormFieldContent` in `ContactFormContent.fields`, and `WEBSITE_MAX_CODE_POINTS = 300` with a comment citing the foundation contract (contracts/contact-website.md); in `app/features/forms/data/formSteps.ts` set `CONTACT_STEP_FIELDS[2]` to `['company', 'identity', 'website', 'need']`
- [x] T061 [US7] In `app/features/forms/data/submissionContract.ts` add `website?: string` to `ContactPayload` with a comment (trimmed, ≤ 300 code points, absent when empty, never null; R43; never the honeypot name); leave `CareersPayload` and `HONEYPOT_FIELD_NAME` unchanged
- [x] T062 [US7] In `app/features/forms/logic/submissionPayloads.ts` `buildContactPayload`: trim `values.website`; spread `{ website }` only when non-empty; throw when `Array.from(trimmed).length > WEBSITE_MAX_CODE_POINTS` (comment: unreachable through the input's `maxlength`; the flow turns it into `failure`); update the header comment (`company` stays the one key sent as `""`); do not add `website` to `CONTACT_SERVER_ERROR_KEYS` in `serverFieldErrors.ts` (add a one-line comment there saying why)
- [x] T063 [US7] In `app/features/forms/ui/TextField.vue` add an optional `maxlength?: number` prop bound to the `<input>` (undefined → no attribute); no class or token change
- [x] T064 [US7] Add `forms.contact.fields.website.{label,placeholder}` to `i18n/locales/es.json` and `i18n/locales/en.json` after `identity`, literally from copy-drafts § D; resolve them in `app/features/forms/logic/useContactFormContent.ts`; add `website` to the ES/EN contact content in `app/features/forms/ui/formsFixtures.testing.ts`; confirm `tests/i18n-parity.test.ts` stays green
- [x] T065 [US7] In `app/features/forms/ui/ContactForm.vue`, inside `#profile`, add a full-width `TextField` with `id="website"`, `v-model="values.website"`, `autocomplete="url"`, `:maxlength="WEBSITE_MAX_CODE_POINTS"`, label/placeholder from `content.fields.website`, `:readonly="busy"`, not required, between the company/identity grid and `TextareaField id="need"`; update the header comment (drop "No website field (Roberto 2026-10-31)", cite Roberto 2026-11-07); file stays < 200 lines; no `SteppedForm.vue` change
- [x] T066 [P] [US7] In `app/features/forms/ui/ContactForm.stories.ts` add a `website` value to the ES and EN `initial` fixtures (e.g. `casaolivo.mx`); confirm `SteppedForm.stories.ts` needs no change; run `pnpm storybook:build`
- [x] T067 [US7] After T040: add a website fixture (`@casaolivo` and `https://casaolivo.mx`) to the no-PII test in `app/features/tracking/logic/googleAnalytics.test.ts` and assert the string appears in no serialized `gtag` or `fbq` call, Meta `init` user data included; confirm `generate_lead` `userData` holds only `email`/`phone`
- [ ] T068 [US7] Run quickstart M16–M17 and record results in `docs/harness/progress/current.md`; list for the leader the two `docs/business/` lines this supersedes (`muush-1.0.md` § 1 and the note under § 4.6; `landing/form-api-contract.md` § 3 table without `website`) and the R43 deploy precondition — **PARTIAL** (implementer, 2026-11-07): M16 positions measured at 1440 and 390 (CDP); M17 covered by unit/component tests only, not by a browser send. The leader list is in docs/harness/progress/impl-49.md.

**Checkpoint**: acceptance item "El formulario de diagnóstico muestra el campo opcional…" holds; FR-060–FR-066 hold.

---

## Phase 9: Polish & cross-cutting

- [x] T049 [P] Add a `docs/harness/findings.md` entry for the robots i18n path-splitting trap (research R6) and the `setup-plan.sh` branch-name refusal, and a comment next to each in the code they govern
- [x] T050 Run `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build`; fix until green (acceptance item 14)
- [ ] T051 Walk quickstart M1–M17 end to end on the final build; record pass/fail per row in `docs/harness/progress/current.md` — **PARTIAL** (implementer, 2026-11-07): M1–M8, M13, M14 (structure), M16 run in headless Chrome over CDP against the built site with every Google/Meta URL blocked (nothing sent); M12 spot-checked; M15 automated. M9–M11, M17 and the visual half of M14 need a real browser walk (see docs/harness/progress/impl-49.md).
- [x] T069 *(amendment, Roberto 2026-11-07)* Add the GA4-only `form_response` event (FR-027): type in `app/shared/data/trackingEvents.ts` (`FORM_RESPONSE_RESULTS`), emitted from `forms/logic/submissionFlows.ts` once per attempt that reached the API; tests first in `submissionFlows.test.ts`, `googleAnalytics.test.ts`, `metaPixel.test.ts` (never sent to Meta) and `tests/tracking-privacy.test.ts`; verified in captured GA requests (impl-49.md § Fix round 1)
- [x] T052 List for the leader every changed/added string (consent + notice keys) and the new Analítica row, for the R32 hand-off to Clau; list the GA4 admin follow-ups (Q1 toggle, custom dimensions and `section_seconds` metric of tracking plan § 9)

---

## Dependencies & execution order

- Phase 1 → Phase 2 → everything else.
- US1 (Phase 3) before US2, US4, US5 (they extend its loaders/sinks).
- US3 depends only on Phase 2 (T009); can run in parallel with US1.
- US6 depends only on Phase 1; can run any time in parallel.
- US7 (Phase 8b) depends on nothing in the tracking work and can run any time in parallel, except T067, which needs T040. Within US7: T053–T059 before T060–T066; T060 → T061 → T062; T063 before T065; T064 before T065; T068 last.
- US5 depends on US4's `generate_lead` emission (T038) and on gate § A.
- Polish last.

## Parallel examples

- After T012: T013–T017 together; T027–T028 (US3) and T045–T047 (US6) alongside.
- In US4: T031/T032, T034/T035 and T037 in parallel; T033 after T030; T036 after T035; T040 after T038.
- In US7: T053–T059 together; then T060 and T063 in parallel; T064 after T060 (content type); T066 alongside T065.

## Implementation strategy

1. MVP = Phases 1–3 + US2 (consent-correct loading and revocation) + US3 (category + copy): legally sound measurement with page views.
2. Then US4 (events and section timing), then US5 if approved.
3. US6 is independent and small; any free slot.
4. US7 (website field) is independent and small; any free slot. It ships only after Roberto confirms the API release accepting `website` is live (R43).
5. Stop at each checkpoint, run the story's quickstart rows, record results.
