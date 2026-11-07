# Implementation Plan: Consented tracking (GA4 + Meta Pixel), AI-bot robots groups and llms.txt

**Branch**: `feat/v2-consented-tracking` (from `fix/v2-mobile-fixes`, merges into `master` after feature 50) | **Date**: 2026-11-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/049-consented-tracking/spec.md`
**Gate drafts**: [copy-drafts.md](./copy-drafts.md) (all DRAFT until Roberto approves)

> `.specify/scripts/bash/setup-plan.sh` refuses branch names that are not
> `NNN-name`; its steps were followed by hand, no branch was created or
> switched. The `CLAUDE.md` SPECKIT marker update was skipped: the file has no
> such markers and is outside the spec author's write scope.

## Summary

Complete feature 48's consent: add an `analytics` category (row reused as is,
order Necesarias → Analítica → Publicidad) and a 12-month expiry to the consent
record; build a new `tracking` feature that, client-only and only after the
matching category is granted, injects GA4 or the Meta Pixel, sends page views
once per path change, maps the closed event catalogue of the tracking plan to
GA4 (all) and Meta (Schedule, Contact, Lead), times sections on Home and
Nosotros, and on revoke opts out and deletes the tool's cookies. Emitting
features stay decoupled through a typed bus and `data-track` attributes in
`app/shared/`. Meta advanced matching (email + phone, hashed by the pixel) rides
only on the `Lead` and ships only with the approved notice text. Copy
(banner, dialog, privacy notice) changes only as approved in `copy-drafts.md`.
robots.txt gains two allow-all AI groups through `@nuxtjs/robots` `groups`;
`public/llms.txt` is added. Details: [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/),
[quickstart.md](./quickstart.md).

**Amendment 2026-11-07 (scope item 8, spec US7, FR-060–FR-067)**: the `forms`
module's assessment form gains the optional website field: one more
`ContactFieldId` (`website`) in step 2 between `identity` and `need`, rendered
with the existing `TextField` (which gains an optional `maxlength` prop), two
i18n keys per locale (copy-drafts § D), and the optional `website` key on
`ContactPayload`, trimmed, omitted when empty, at most 300 code points
(research R12, [contracts/contact-website.md](./contracts/contact-website.md)).
No tracking change beyond extending the no-PII test. Deploy precondition:
the API release accepting `website` is live (R43, Roberto confirms).

## Technical Context

**Language/Version**: TypeScript (strict) · Vue 3.5 `<script setup lang="ts">` · Nuxt 4 (`srcDir: app/`)
**Primary Dependencies**: existing only (`@nuxtjs/i18n`, `@nuxtjs/robots` 6.2.4, `@nuxtjs/sitemap` 8.6.x). **No new npm dependency**: gtag.js and fbevents.js are loaded at runtime from Google/Meta, after consent, never bundled.
**Storage**: `localStorage` key `muush.cookie-consent` (existing, shape unchanged, version 1)
**Testing**: Vitest + Vue Test Utils + happy-dom (unit, component); build-output tests (`tests/seo-output.test.ts`, new `tests/tracking-output.test.ts`, `legal-copy`, `i18n-parity`); Storybook for the changed consent components; manual network checks in `quickstart.md`
**Target Platform**: static site (`nitro.preset: 'static'`) on S3 + CloudFront
**Project Type**: static web site (single Nuxt project)
**Performance Goals**: zero added bytes or requests for visitors who do not consent; tracking code is a lazily imported client chunk; no long tasks from section observers (one `IntersectionObserver` per page)
**Constraints**: Articles IV, VI, VII, XI; components < 200 lines; no new visual values; no PII in GA; Meta only gets the four mapped events
**Scale/Scope**: 1 new feature module (~10 files), 2 shared files, ~6 legal files edited, ~15 UI/data files gain `data-track*` attributes or bus emits, ~12 i18n keys per locale changed/added, 1 static file, `nuxt.config.ts` (2 config values + robots groups), ~10 test files new/edited; amendment: ~9 forms files (data, logic, `TextField.vue`, `ContactForm.vue`, story, fixtures), 2 i18n keys per locale, ~8 forms test files + `tests/forms-copy.test.ts`

## Open questions for Roberto (gate)

- **Q1 · GA4 history page views**: plan sends page views in code (FR-022 needs
  hash jumps excluded). Requires turning **OFF** "Page changes based on browser
  history events" in GA4 enhanced measurement (today ON, tracking plan § 9), or
  every navigation counts twice. Fallback if he keeps it ON: research R2.
- **Q2 · Drafts**: approve/edit `copy-drafts.md` §§ A, B, C; B4 (naming
  advanced matching in the Publicidad row) is recommended, optional.
- **Q3 · Google as transfer vs. processor** in the notice (copy-drafts A8);
  the draft takes the conservative reading.
- **Q4 · Article I**: a new `tracking` feature module (Complexity Tracking).
- **Q5 · Test properties**: whether a GA4/Meta test property exists for manual
  checks, or DebugView/Test Events on production are acceptable.

**Resolved at the gate (Roberto, 2026-11-07):** Q1 toggle OFF and saved in
GA4; Q2 drafts approved (B4 reworded to "en forma codificada"/"in encoded
form"; llms.txt adds `support@muush.dev`); Q3 transfer; Q4 constitution 2.1.3;
Q5 real properties with GA4 DebugView and Meta Test Events. Q6 and Q7 (2026-11-07): the website field
has no message of its own (the generic send error covers it), and the
`maxlength` emoji difference is accepted. Whole spec approved for
implementation (Roberto, "Si", 2026-11-07).

### Open questions for Roberto (amendment, 2026-11-07)

- **Q6 · Website error message**: the plan adds **no** error copy for the
  website field. Over 300 code points cannot be typed through the input
  (`maxlength`), and the two remaining cases (a value over the limit set
  programmatically; a server `validation_failed` on `website`, i.e. R43
  broken) end in the form's existing generic send error. Confirm, or supply an
  ES/EN message for the field (then it is copy for the gate).
- **Q7 · `maxlength` vs code points**: browsers count `maxlength` in UTF-16
  units, the API counts code points, so a value made only of emoji stops at 150
  in the input. Default: accept (the feature entry asks for `maxlength` 300;
  the site is never looser than the API).

## Constitution Check

*GATE: must pass before Phase 0 research. Re-checked after Phase 1 design: still passing (one recorded deviation, Article I list; one recorded exception, Article IV third-party runtime scripts).*

### Phase -1: Pre-Implementation Gates

#### I. Feature-Based + Capas architecture
- [x] Tracking code lives in `app/features/tracking/{data,logic}` with an `index.ts` barrel; no `ui/` (it renders nothing).
- [x] The event catalogue and bus live in `app/shared/{data,logic}` because five features use them (research R1).
- [x] `app/plugins/tracking.client.ts` only calls `startTracking()` with runtime config and the router: no logic of its own.
- [x] Article I's module list names `legal` and `tracking` since constitution 2.1.3 (Roberto, 2026-11-07, Q4).

#### II. Dependency direction (NON-NEGOTIABLE)
- [x] `tracking/data` imports nothing from `logic`/`ui`; `shared/data/trackingEvents.ts` imports only shared data/types; `shared/logic/trackingBus.ts` imports only `shared/data`.

#### III. Feature isolation (NON-NEGOTIABLE)
- [x] `tracking` reaches consent only through `@/features/legal`.
- [x] `forms`, `shell`, `landing`, `about`, `legal` import only `@/shared/data/trackingEvents` and `@/shared/logic/trackingBus`; none imports `@/features/tracking`.
- [x] Website field (amendment): every change stays inside `app/features/forms/{data,logic,ui}`; no other feature imports the new constant or type.

#### IV. Static-site purity (NON-NEGOTIABLE)
- [x] No server route, no `server/`, preset stays `static`; robots.txt and llms.txt are build-time files.
- [x] GA4/Meta scripts load in the browser only, after consent, never in prerendered HTML (scoped exception, Complexity Tracking, same shape as Turnstile).

#### V. Component discipline
- [x] `<script setup lang="ts">` only; no component gains tracking logic: UI changes are `data-track*` attributes from `trackAttrs()` and the extra category row coming from data.
- [x] Every edited component stays < 200 lines (`ContactForm.vue` is 173 lines today; the website `TextField` adds ~9).
- [x] Website field: `TextField.vue` gains only an optional `maxlength` prop forwarded to the `<input>`; no logic in the component; the trim/omit/limit rule lives in `logic/submissionPayloads.ts`.

#### VI. i18n parity (NON-NEGOTIABLE)
- [x] New/changed keys (`consent.categories.analytics.*`, `consent.banner.body`, `legal.privacy.*` of copy-drafts § A) exist in both locale files with the approved text; `tests/i18n-parity.test.ts` and `tests/legal-copy.test.ts` green.
- [x] No string hardcoded in a component; event ids are not user-facing strings.
- [x] Website field: `forms.contact.fields.website.{label,placeholder}` in both locale files with copy-drafts § D; `tests/forms-copy.test.ts` asserts both strings per locale (its "no website field" assertion is inverted).

#### VII. Design tokens discipline
- [x] The Analytics row is rendered by the existing `CookieCategoryRow` with the existing tokens; no new token, utility, arbitrary value or variant; `token-literals.test.ts` green.
- [x] The website field reuses `TextField` and the existing row/stack utilities of `ContactForm.vue` (`gap-formulario-fila`); no new token or class.

#### VIII. Clean code
- [x] One bus, one catalogue, one loader per vendor; pure functions for expiry, page-view detection, section visits, attribute parsing; named constants (`CONSENT_LIFETIME_MONTHS`, `GA_COOKIE_LIFETIME_SECONDS`, `MIN_VISIT_MS`, `MAX_VISIT_SECONDS`); no speculative vendor abstraction beyond the two sinks.

#### IX. TypeScript strict + Biome
- [x] `window.gtag`/`window.fbq`/`dataLayer` typed in a local `.d.ts` or narrowed from `unknown`; no `any`, no `@ts-ignore`; `pnpm check` / `pnpm typecheck` green.

#### X. Testing discipline
- [x] Unit: consent expiry/parse, category order, page-view detection, language-change detection, click-attribute parsing, section-visit reducer, GA/Meta sinks (event mapping, no PII, advanced-matching normalisation), loaders (no injection before grant, single injection, revoke opt-out + cookie removal) with a fake DOM.
- [x] Component: `CookiePreferences` (three rows, order, switches independent), `CookieBanner` copy, edited CTA components carry the expected `data-track*` attributes.
- [x] Build output: robots groups, llms.txt format + URL set + approved text, no tracking tags/noscript in HTML, IDs not in `app/`, no `.map`/`sourceMappingURL`, sitemap 10 URLs.
- [x] Stories updated: `CookiePreferences` and `CookieCategoryRow` show the Analytics row; `pnpm storybook:build` green.
- [x] Website field, tests first: payload builder (trim, omit, never null, 300 vs 301 code points with emoji, careers never), step partition, field order, `ContactForm` render order/attributes/sent values at both widths, `TextField` `maxlength`, server `website` mark → generic failure, no-PII test with a website value; `ContactForm.stories.ts` shows a filled website.
- [x] Test names `should <expected> when <condition>`; no shared state between tests (`resetCookieConsentState`, `resetTrackingBus`).

#### XI. Configuration & credential hygiene (NON-NEGOTIABLE)
- [x] `gaMeasurementId` and `metaPixelId` in `runtimeConfig.public` (public identifiers, not credentials); names added to `.env.example` with placeholders; no `process.env` in `app/`.
- [x] No access token, API secret or Conversions API key anywhere (out of scope).
- [x] Website field: no configuration change; the API base URL stays in `runtimeConfig.public.formsApiBaseUrl`.

#### XII. Absolute imports via alias
- [x] `@/features/…`, `@/shared/…`; relative only within one folder; no new alias.

## Project Structure

### Documentation (this feature)

```text
specs/049-consented-tracking/
├── spec.md
├── copy-drafts.md            # DRAFTS for Roberto's gate (A notice, B banner/dialog, C llms.txt)
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── tracking-runtime.md
│   ├── build-output.md
│   └── contact-website.md    # amendment: website key on POST /contact
├── checklists/requirements.md
└── tasks.md
```

### Source code (repository root)

```text
nuxt.config.ts                         # runtimeConfig.public.{gaMeasurementId,metaPixelId}; robots.groups
.env.example                           # NUXT_PUBLIC_GA_MEASUREMENT_ID, NUXT_PUBLIC_META_PIXEL_ID
public/llms.txt                        # NEW, approved text (copy-drafts § C)
i18n/locales/{es,en}.json              # consent.* and legal.privacy.* per copy-drafts §§ A–B
app/
├── plugins/tracking.client.ts         # NEW: startTracking(runtimeConfig, router)
├── shared/
│   ├── data/trackingEvents.ts         # NEW: catalogue, closed lists, trackAttrs()
│   └── logic/trackingBus.ts           # NEW: emit/subscribe
├── features/tracking/                 # NEW module
│   ├── index.ts                       # startTracking
│   ├── data/trackingConfig.ts         # constants, cookie names, Meta event map
│   └── logic/
│       ├── startTracking.ts           # consent bridge + router hooks + listeners
│       ├── googleAnalytics.ts         # loader, config, opt-out, GA sink
│       ├── metaPixel.ts               # loader, autoConfig off, consent revoke/grant, Meta sink, advanced matching
│       ├── thirdPartyCookies.ts       # expire _ga/_ga_*/_fbp
│       ├── pageViews.ts               # isNewPage, localeChange (pure)
│       ├── clickTracking.ts           # delegated listener + attribute parsing
│       ├── sectionVisits.ts           # pure reducer
│       └── useSectionTiming.ts        # IntersectionObserver + visibility wiring, form_view
├── features/legal/
│   ├── data/cookieCategories.ts       # analytics category, order, CONSENT_LIFETIME_MONTHS
│   ├── data/privacyNotice.ts          # new blocks: purposes.additionalItems.analytics, sharing.items.google
│   ├── logic/consentRecord.ts         # expiry in parseConsentRecord(raw, now)
│   ├── logic/useCookieConsent.ts      # passes now; emits cookie_preferences on save
│   └── ui/*.stories.ts                # Analytics row in stories
├── features/forms/data/               # amendment: contactFields.ts (website id/value/order/content, WEBSITE_MAX_CODE_POINTS), formSteps.ts (step 2), submissionContract.ts (ContactPayload.website?)
├── features/forms/logic/              # bus emits: form_start/step/submit/error, generate_lead (+userData), application_submit, cv_attached; amendment: submissionPayloads.ts (website trim/omit/limit), useContactFormContent.ts (website label/placeholder)
├── features/forms/ui/                 # data-track-form on form roots; trackAttrs on send-notice / success links; amendment: TextField.vue (maxlength prop), ContactForm.vue (website row), ContactForm.stories.ts, formsFixtures.testing.ts
├── features/shell/{data,ui}/          # trackAttrs on nav/menu/footer/FAQ/404 CTAs and contact channels
├── features/landing/ui/               # data-track-section on 5 Home sections; trackAttrs on hero/assessment CTAs
└── features/about/ui/                 # data-track-section on 4 Nosotros sections
tests/
├── forms-copy.test.ts                 # amendment: website label/placeholder ES/EN (replaces the "no website" assertion)
├── seo-output.test.ts                 # robots groups, llms.txt, no sourcemaps
└── tracking-output.test.ts            # NEW: no tags/noscript in HTML, IDs not in app/
```

**Structure Decision**: single Nuxt project; one new feature module plus two
shared files (research R1).

## Implementation notes

- **Order of work**: consent model (US2/US3 data) → tracking core with GA →
  Meta → event wiring → section timing → advanced matching (only if § A is
  approved) → copy → robots/llms. Copy and robots/llms are independent and can
  run in parallel with the tracking core.
- **Lazy loading**: `startTracking` dynamically imports the vendor modules only
  when a category is granted, so a visitor who never consents downloads none of
  the vendor code.
- **cta_location audit** (research R9): before wiring clicks, list every
  `CALL_BOOKING_URL`, `SECTION_ANCHORS.assessment`, `wa.me` and `mailto:` use in
  `app/` and fix the closed list; add a unit test that every CTA data model
  carries a `track` entry.
- **Revocation and the page view on grant** are driven by a `watch` on
  `consent` with `immediate: true`, so returning visitors load on startup.
- **Do not** touch `useCookieConsent`'s module-scoped design, the dialog
  behaviour, the forms' payloads or Turnstile, **except** the optional
  `website` key of the assessment payload (amendment, scope item 8).
- **Website field** (amendment): independent of the tracking work; can run in
  parallel with any phase. Tests first (tasks T053–T059), then data → payload
  → `TextField` prop → i18n/content → `ContactForm.vue` → story. The `.pen`
  values are the leader's extract in the feature entry; do not measure or
  guess anything else.
- **Deploy precondition (R43, FR-067)**: before the deploy of this feature,
  Roberto confirms the Form Submission API release that accepts `website` is
  live. Without it every assessment carrying `website` gets a `400`. Not an
  implementation task; the leader asks at the merge/deploy step.
- After closing, the leader reports the new row and every changed string to
  Roberto for the `.pen` (rules.md § R32).

## Complexity Tracking

| Violation / exception | Why needed | Simpler alternative rejected because |
|---|---|---|
| Article I: new `tracking` feature module not in the article's list (as `legal` from feature 48) | Vendor loaders, consent bridge and observers form one domain used site-wide | Inside `legal`: mixes legal pages with vendor code; inside `shared`: Article I/III forbid one feature's logic there. Resolved: constitution 2.1.3 adds `legal` and `tracking` (Roberto, 2026-11-07) |
| Article IV: third-party scripts at runtime (googletagmanager.com, connect.facebook.net) | The feature's purpose is GA4/Meta measurement, decided by Roberto | Server-side/Conversions API needs a backend (out of scope, tracking plan § 7). Scoped like Turnstile: browser only, after explicit consent, never in prerendered HTML |
| `app/plugins/` hosts the tracking bootstrap | Router hooks and a document listener must start once per app, client-only | Mounting a component in the layout would render nothing and add a component with no markup |
