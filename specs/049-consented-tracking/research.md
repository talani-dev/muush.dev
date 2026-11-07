# Research — feature 49 `consented_tracking`

Status labels: **CONFIRMED** (read in code or an official page on the date
given), **INFERRED** (derived from evidence), **UNVERIFIED** (the implementer
must measure it; a fallback is given).

---

## R1 · Where the code lives (architecture)

**Decision**: three pieces, so that the four emitting features never depend on
the tracking feature:

1. `app/shared/data/trackingEvents.ts` — the closed event catalogue (names,
   parameters, closed value lists) as types + `as const` lists, and
   `trackAttrs()`, a typed helper returning `data-track*` attributes for a click
   CTA.
2. `app/shared/logic/trackingBus.ts` — `emitTrackingEvent(event)` and
   `onTrackingEvent(sink)`; a module-scoped, in-memory dispatcher. With no sink
   registered it does nothing. No network, no DOM.
3. `app/features/tracking/` — new feature module (`data/`, `logic/`, `index.ts`;
   no `ui/`): consent bridge, GA4 and Meta loaders and sinks, page-view and
   language-change detection on route change, delegated click listener for
   `data-track` CTAs, section-time observer. Started once by
   `app/plugins/tracking.client.ts`.

**Rationale**: Article III allows features to talk through `app/shared/`; a
bus makes `forms`, `shell`, `landing`, `about` and `legal` emit facts ("lead
confirmed", "choice saved") without knowing whether anything listens. Clicks
and section timing need only `data-*` attributes in markup, so most UI edits
are one attribute. The tracking feature reads consent through
`@/features/legal` (barrel).

**Alternatives considered**: (a) each feature imports `@/features/tracking`:
allowed, but couples four features to a fifth and makes stories/tests need a
stub; (b) put loaders inside `legal`: mixes legal pages with vendor code;
(c) everything in `app/shared/`: the loaders belong to one feature, which
Article I/III discourage in `shared`.

**Constitution note (for the leader)**: Article I lists the feature modules as
`shell`, `landing`, `about`, `forms`. Feature 48 already added `legal` without
an amendment. `tracking` would be a second unlisted module. Recorded in plan
Complexity Tracking; whether to amend Article I is Roberto's call.

## R2 · Page views: once per route change, never on an anchor jump

**Decision**: the site sends page views itself. GA4 config with
`send_page_view: false`; on the grant and on every `router.afterEach` whose
`to.path !== from.path`, send `page_view` (GA) and `PageView` (Meta). Meta:
`fbq.disablePushState = true` before `init` so fbevents does not add its own
history-based PageViews.

**Rationale**: FR-022 is binding and must be testable; a pure function
`isNewPage(from, to)` is unit-testable, while GA4's enhanced-measurement history
listener is opaque (INFERRED: it listens to `pushState`/`popstate`; whether a
hash-only push counts is UNVERIFIED).

**Dependency on Roberto**: GA4 → Admin → Data streams → Enhanced measurement →
Page views → "Page changes based on browser history events" must be turned
**OFF**, or every SPA navigation is counted twice. Tracking plan § 9 says it is
ON today. → Open question Q1 in plan.md.

**Fallback if Roberto keeps it ON**: drop the manual SPA page views for GA (keep
the first one through `send_page_view: true`), and the implementer measures
whether the `#diagnostico` jump produces a page view; if it does, FR-022 is
reported as not met to the leader.

`fbq.disablePushState`: UNVERIFIED against Meta's current docs (not reachable
as text on 2026-11-07); the implementer confirms in the network panel that one
in-app navigation produces exactly one `PageView`.

## R3 · Loading only after consent, and revoking

**Decision**:

- Scripts are injected by the tracking feature with `document.createElement('script')`
  (`async`) only after the category is granted; nothing is added to `app.head`
  or `useHead`, so the prerendered HTML never contains them (FR-010).
- GA4: `https://www.googletagmanager.com/gtag/js?id=<id>`, `dataLayer`, then
  `gtag('set', …)` for `send_page_view: false`,
  `allow_ad_personalization_signals: false` and `allow_google_signals: false`
  and `gtag('consent', 'default', …)` BEFORE `gtag('js', new Date())`, then
  `gtag('config', id, { send_page_view: false, cookie_expires: 36288000,
  allow_google_signals: false, allow_ad_personalization_signals: false })`
  (fix round 1, findings.md § R80: gtag.js sends an automatic `page_view`
  when it processes `js`).
- Meta: `https://connect.facebook.net/en_US/fbevents.js` with the standard
  `fbq` stub created in code, then `fbq('set', 'autoConfig', false, id)`,
  `fbq.disablePushState = true`, `fbq('init', id)`; every page view is
  `fbq('trackSingle', id, 'PageView')` (fix round 1, findings.md § R80:
  fbevents drops every `track PageView` after the first of the document).
  No `<noscript>` image anywhere.
- Revoke Analytics: `window['ga-disable-<id>'] = true` (Google's documented
  opt-out flag), the GA sink unsubscribes, and the cookies `_ga` and
  `_ga_<id without "G-">` are expired on `muush.dev` and `.muush.dev`, path `/`.
- Revoke Advertising: `fbq('consent', 'revoke')`, the Meta sink unsubscribes,
  `_fbp` expired the same way.
- Re-grant in the same visit: clear the GA flag / `fbq('consent', 'grant')`,
  re-subscribe, send a page view; scripts are never injected twice.

**Evidence**: `fbq('set', 'autoConfig', false, 'FB_PIXEL_ID')` "above the init
call" — CONFIRMED on Meta's Pixel "Advanced" page, fetched 2026-11-07
(https://developers.facebook.com/docs/meta-pixel/advanced/). GA config keys and
`ga-disable-<id>`: from Google's gtag documentation (INFERRED from prior
knowledge; the implementer checks them against
https://developers.google.com/tag-platform/gtagjs/reference and
https://developers.google.com/analytics/devguides/collection/ga4/disable-analytics
before coding — Context7 or curl).

**Cookie lifetime (FR-014)**: `cookie_expires` is in seconds; 420 days =
36,288,000 s, shorter than any span of 14 calendar months (minimum 424 days),
so "hasta 14 meses" in the notice is always true. Named constant
`GA_COOKIE_LIFETIME_SECONDS`.

## R4 · Meta advanced matching

**Decision**: when the assessment flow returns `ok: true` and Advertising is
granted, the Meta sink calls `fbq('init', id, { em, ph })` and then
`fbq('track', 'Lead')`. `em` = email trimmed and lowercased; `ph` = dial code +
national digits (the same values `buildContactPayload` already derives:
`dialCodeOf(whatsappCountry)` + digits), only when the preference is WhatsApp.
Values are passed in plain form; the pixel hashes them with SHA-256.

**Evidence**: Meta's advanced-matching page (fetched 2026-11-07,
https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching/)
shows `fbq('init', '<id>', { em: '…', … })` with the comment "Values will be
hashed automatically by the pixel using SHA-256", and the `em` format
"lowercase unhashed, or SHA-256 hashed" — CONFIRMED. Calling `init` a second
time with user data after the page loaded: UNVERIFIED; the implementer confirms
in the network panel that the `Lead` request carries `ud[em]` (and `ud[ph]`) as
64-hex hashes and that the following `PageView` does not need them.
`ph` format (digits with country code, no `+`): INFERRED from Meta's parameter
table; verify on the same page.

**Isolation**: the user data never travels as event parameters. It is a
separate optional `userData` field on the `generate_lead` bus event; the GA sink
ignores it by type (its mapper only reads `params`) and a test feeds real-looking
PII through a full lead and asserts no GA call contains it (FR-026).

**Gate coupling (FR-031)**: the `userData` field, its emission in `forms` and its
use in the Meta sink are one task group (US5). If § A of `copy-drafts.md` is not
approved, that group is dropped and `Lead` ships without user data.

## R5 · AI crawler user-agent tokens (verified 2026-11-07)

Each page was fetched with `curl` on 2026-11-07 and read as data.

| Token | Purpose | Provider page | Status |
|---|---|---|---|
| `OAI-SearchBot` | ChatGPT search results | https://developers.openai.com/api/docs/bots (redirect target of https://platform.openai.com/docs/bots) | CONFIRMED |
| `ChatGPT-User` | user-triggered fetches in ChatGPT; OpenAI notes robots.txt rules "may not apply" | same | CONFIRMED |
| `GPTBot` | training | same | CONFIRMED |
| `Claude-SearchBot` | Claude search indexing | https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler | CONFIRMED |
| `Claude-User` | user-triggered fetches in Claude | same | CONFIRMED |
| `ClaudeBot` | training | same | CONFIRMED |
| `Google-Extended` | product token for Gemini training/grounding; no separate HTTP user agent; no effect on Search | https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers | CONFIRMED |
| `PerplexityBot` | Perplexity search | https://docs.perplexity.ai/guides/bots | CONFIRMED |
| `Perplexity-User` | user-triggered fetches; Perplexity says it "generally ignores robots.txt" | same | CONFIRMED |
| `Applebot-Extended` | Apple AI training control; does not crawl itself | https://support.apple.com/en-us/119829 | CONFIRMED |
| `CCBot` | Common Crawl (used in training sets) | https://commoncrawl.org/ccbot | CONFIRMED |

Not added (outside Roberto's list, still allowed by `*`): `OAI-AdsBot` (new,
validates ChatGPT ad landing pages), `Applebot` (Apple search), `Google-CloudVertexBot`,
`meta-externalagent`, `Amazonbot`. Naming `ChatGPT-User` / `Perplexity-User` is
harmless even though they may ignore robots.txt.

## R6 · `@nuxtjs/robots` 6.2.4 group shape (read from `node_modules`, 2026-11-07)

- Installed version `6.2.4` (`node_modules/@nuxtjs/robots/package.json`).
- `ModuleOptions.groups: RobotsGroupInput[]`; `GoogleInput = { comment?,
  disallow?, allow?, userAgent?, contentUsage?, contentSignal?, _skipI18n? }`
  (`dist/runtime/types.d.ts`).
- Output (`dist/util.mjs` `generateRobotsTxt`): per group, `# comment` lines,
  one `User-agent:` line per agent, then `Allow:`/`Disallow:`, a blank line;
  `Sitemap:` lines once at the end. Multiple `User-agent` lines in one group are
  valid (RFC 9309 § 2.1).
- The `*` group is created by the module only when no group targets exactly
  `*` (`dist/module.mjs` ~l. 375–387), as `Disallow: ` (empty = allow all). The
  current output is exactly that (`.output/public/robots.txt`, checked).
- **Trap**: with `@nuxtjs/i18n` present, the module rewrites each group's
  `allow`/`disallow` paths per locale (`splitPathForI18nLocales`) unless
  `_skipI18n` is set; an empty string is returned unchanged (nuxtseo-shared
  `i18n.mjs`). So each AI group uses **`disallow: ['']`**, the exact rule of the
  `*` group, and no `allow` (an `allow: ['/']` would be split into locale paths).
- `blockAiBots` must stay `false` (default); `mergeWithRobotsTxtPath: false`,
  `header: false`, `botDetection: false` unchanged; no `robots.sitemap` entry
  (the sitemap module adds the line; adding it would print it twice).

**Decision**: two groups in `nuxt.config.ts` `robots.groups`, each with a
`comment` ("AI search and answer agents: allowed", "AI training crawlers:
allowed"), the agents of R5 and `disallow: ['']`.

## R7 · llms.txt

**Decision**: a static `public/llms.txt` with the approved text (copy-drafts
§ C). Nitro copies `public/` verbatim to `.output/public/llms.txt`.

**Rationale**: the content is fixed and approved literally; generating it from
the route table would add build code for 10 lines (Article VIII). The test
(`tests/seo-output.test.ts`) ties it to the sitemap: the set of absolute URLs in
llms.txt must equal the sitemap's `<loc>` set, so a page added later breaks the
test instead of drifting silently. The file is not UI copy, so it does not live
in the locale files (Article VI governs strings rendered by components).

**Format** (https://llmstxt.org, read 2026-11-07 from prior knowledge of the
proposal; INFERRED): H1 with the project name (required), a blockquote summary,
optional free paragraphs/lists, then H2 sections whose bodies are Markdown
lists of `[name](url): notes`; an `## Optional` section may be skipped by
consumers. The implementer re-reads https://llmstxt.org once before writing the
format assertions.

**Serving**: CloudFront/S3 serve `.txt` as `text/plain` by extension
(INFERRED; the deploy uploads `robots.txt` the same way).

## R8 · Section timing

**Decision**: `IntersectionObserver` with thresholds `[0, 0.5, 1]` over
`[data-track-section]` elements found after each route on Home and Nosotros;
a section is "in view" when `intersectionRatio ≥ 0.5` **or**
`intersectionRect.height ≥ 0.5 × viewport height` (tall sections), and
`document.visibilityState === 'visible'`. A pure reducer
(`sectionVisits.ts`) turns enter/leave/hide/show/clock ticks into completed
visits; < 1000 ms dropped; seconds capped at 600, rounded to whole seconds. On
`pagehide`/`visibilitychange → hidden` open visits are flushed with
`transport_type: 'beacon'` (gtag option). `page_key` comes from the route name
(`index` → `home`, `about` → `about`).

The ids are attached by the pages' sections as `data-track-section="<id>"`
(Home: `hero`, `who_we_are`, `services`, `how_we_work`, `assessment`;
Nosotros: `hero`, `how_it_comes_together`, `where_we_are`, `work_with_us`).

## R9 · Where each event comes from

| Event | Source | Mechanism |
|---|---|---|
| `assessment_cta_click` | every "Diagnóstico gratis" link (nav, hero, mobile menu, footer, FAQ, 404, …) | `trackAttrs` on the link + delegated click listener |
| `book_call_click` | every Cal.com link (hero/assessment, footer, FAQ, form success, …) | same |
| `contact_click` | WhatsApp and `support@muush.dev` links (footer, mobile footer, send notices) | same, `channel` + `cta_location` |
| `form_view` | the form section enters the viewport (once per page view) | `data-track-form="assessment|application"` + observer |
| `form_start`, `form_step`, `form_submit`, `form_error` | forms logic (`useContactForm`, `useApplicationForm`, `useFormSteps`) | bus |
| `generate_lead`, `application_submit`, `cv_attached` | forms submission flows / CV check | bus |
| `language_change` | any route change whose locale differs | tracking router hook |
| `cookie_preferences` | `legal` `saveChoice` | bus |
| `section_view` | R8 | observer |

The full list of `cta_location` values is produced by auditing every
`CALL_BOOKING_URL`, `SECTION_ANCHORS.assessment`, `wa.me` and `mailto:` use in
`app/` (files listed in tasks); the audit result becomes the closed list in
`trackingEvents.ts`. Starting set: `nav`, `hero`, `mobile_menu`, `footer`,
`faq`, `not_found`, `form_success`, `send_notice`.

## R10 · Third-party runtime requests (Constitution Article IV)

The site already accepts one scoped third-party runtime script (Turnstile,
feature 029, Complexity Tracking). GA4 and Meta follow the same shape: browser
only, never at build, never in the prerendered HTML, only after an explicit
visitor action (here: consent). Recorded in plan Complexity Tracking.

## R11 · Consent expiry

**Decision**: `parseConsentRecord(raw, now)` returns `null` when
`decidedAt` is not a valid date, is later than `now`, or `now ≥ decidedAt + 12
calendar months` (`CONSENT_LIFETIME_MONTHS = 12`, month arithmetic clamped to
the month's last day). `CONSENT_RECORD_VERSION` stays `1`; the new category
alone invalidates feature-48 records (`readChoice` already requires every
optional category). Checked at load; a tab left open across the boundary keeps
its in-memory choice until reload (acceptable; documented).

## R12 · Website field on the assessment form (amendment, 2026-11-07)

**Sources** (read-only, `/Users/betonajera/Workspaces/muush/muush-foundation`):

- `modules/form-submission-api/src/shared/validation.js`, `validateWebsite`,
  introduced in commit `af491cb` — **CONFIRMED**: `website` is in
  `CONTACT_FIELDS` only (not `CAREERS_FIELDS`, so `/careers` answers
  `validation_failed` for it); absent key → `''`; a present non-string
  (`null` included) → error; value trimmed; error when
  `Array.from(value).length > 300` (code points, an emoji counts once); no URL
  parsing.
- `specs/008-email-templates-muush-1-0/contracts/payload-delta.md` —
  **CONFIRMED** at the foundation repo's HEAD (the file was added in commit
  `f44254a`, the spec commit right after `af491cb`, not in `af491cb` itself):
  site obligations "maxlength 300; send trimmed or omit when empty; never reuse
  the honeypot name `muush_website`"; error
  `400 {"ok":false,"error":{"code":"validation_failed","fields":["website", …]}}`;
  release order R43: API first, verified live without `website`, then the site.
- `.pen` values (label, placeholder, desktop/mobile position, same text-field
  component): leader extract of 2026-11-07, recorded in `feature_list.json`
  id 49. Not measured by the spec author.
- Privacy notice: `i18n/locales/{es,en}.json` already lists "tu sitio web o
  redes" / "your website or social media" (**CONFIRMED**, 2026-11-07).

**Decisions**

- **Where**: `website` becomes a `ContactFieldId`, placed after `identity` and
  before `need` in `CONTACT_FIELD_ORDER` and in `CONTACT_STEP_FIELDS[2]`; the
  two step lists keep partitioning the order (existing test). In
  `ContactForm.vue` it is a full-width `TextField` between the
  company/identity grid and the `need` textarea inside the `#profile` slot, so
  the same markup gives the desktop row and the mobile step-2 position.
  `SteppedForm.vue` needs no change (slot-based); its story uses generic slots.
- **Input**: `type="text"` (not `url`: `@handle` must be accepted without a
  native error), `autocomplete="url"`, `maxlength="300"`, not required, id
  `website`. `TextField.vue` gains an optional `maxlength?: number` prop
  forwarded to the `<input>` (absent → no attribute); no visual change.
- **Limit**: `WEBSITE_MAX_CODE_POINTS = 300` in `data/contactFields.ts`, with a
  comment citing the foundation contract. `buildContactPayload` trims, omits
  the key when empty, and **throws** when `Array.from(trimmed).length > 300`;
  `submitContactFlow` already turns a throw into `failure` before any request
  (same pattern as the empty-`identity` guard). No client field error: none is
  reachable through the input (INFERRED: `maxlength` counts UTF-16 units, and
  a string's code-point count never exceeds its UTF-16 length), and adding one
  would need new copy (plan Q6).
- **Server mark**: `website` is **not** added to `CONTACT_SERVER_ERROR_KEYS`,
  so a `validation_failed` naming it resolves to `failure` (generic send error,
  values kept). This only happens if R43 is broken.
- **Honeypot**: unchanged (`HONEYPOT_FIELD_NAME = 'muush_website'`); the new
  input has no `name` attribute (`TextField` sets none) and its id is
  `website`; payloads are built key by key, so neither can leak.
- **Tracking**: `FORM_FIELD_IDS` (data-model § 2) derives from
  `ContactFieldId`, so the id `website` becomes a legal `form_error.field`
  value, but no client error for it exists, so it is never emitted. The value
  itself is never read by any tracking code; the no-PII test (T040) gains a
  website fixture (T067).
- **Tests that assert the old absence**: `tests/forms-copy.test.ts` ("should
  carry no website field…") and `app/features/forms/ui/ContactForm.test.ts`
  (design-order test, "no website key" send test) are inverted/updated, not
  deleted.
