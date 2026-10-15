# Research: Dial-code selector before the WhatsApp number

**Feature**: 032 `whatsapp_dial_code_selector` | **Date**: 2026-10-14

Evidence labels (org policy): **CONFIRMED** = checked against the repository
or by running a command; **INFERRED** = derived from evidence; **UNVERIFIED**
= not checked. Every "Decision" below that maps to a spec OA row is a
**proposal for the gate**, not a decision taken by an agent.

---

## Gate summary (for Roberto)

| OA | Question | Proposal (plan baseline) | Main alternative | Why the baseline |
|---|---|---|---|---|
| OA-3 | **SUPERSEDED by A1 (R10–R14).** How to guess the country | Region subtag of `navigator.languages` | Intl time zone → country table | Zero data to ship; works in every browser; one line of logic. Wrong for people whose browser language does not match where they live |
| OA-4 | How many countries, how to find one | All 245 dial-code regions, alphabetical in page language, native type-to-jump | Same list + search box (needs OA-6 C) / short list of ~25 | Covers every visitor; no extra UI to build |
| OA-5 | Flag format | Emoji built from the country code | Local SVG set / emoji + self-hosted Windows flag font | 0 KB, no dependency, works inside a native list. Letters instead of flags on Chrome/Edge for Windows |
| OA-6 | Control | Native list control with a custom closed face | Custom WAI-ARIA combobox with search | Accessibility and mobile picker for free; repo precedent (feature 20) |
| OA-7 | Data source | Static module in `forms/data/` (245 rows) + browser-localized names | npm package (`libphonenumber-js`, `i18n-iso-countries`, …) | ~4 KB of data vs. a dependency; ES/EN parity from one source |

---

## R1 · Country detection without a request (OA-3)

> **SUPERSEDED by spec Amendment A1 (2026-10-14).** Roberto chose IP
> location through the site's own CDN (`GET /__geo`), Mexico by default;
> option D's "own API" variant, without a third party. Kept for the record;
> see R10–R14.

**Candidates**

| Option | Source | Network | Data to ship | Accuracy notes |
|---|---|---|---|---|
| **A. `navigator.languages` region** | Browser language preferences (`es-MX`, `en-US`) | none | none | Reflects the language setup, not the location. A Mexican with an `en-US` OS gets +1; plain `es` or `es-419` (Latin America, numeric region) give no country → MX fallback, which is the right answer for most of this site's audience (INFERRED) |
| B. Intl time zone | `Intl.DateTimeFormat().resolvedOptions().timeZone` (`America/Mexico_City`) | none | zone → country table, ~400 rows (IANA `zone1970.tab`/`zone.tab`) | Closer to physical location; wrong for travellers and for zones shared by countries (`America/New_York` is US only, but e.g. `Europe/Berlin` is linked for several countries in `zone1970.tab`). More data to maintain (INFERRED) |
| C. A + B | A, then B when A yields nothing | none | both | Best guess, double the logic and data |
| D. IP geolocation | Third-party or own API | **yes** | — | Rejected: third-party request (Constitution IV/FR-022) and the feature description excludes it |
| E. Page locale (`/es/` → MX, `/en/` → ?) | Route | none | none | Says nothing about the country for EN; already covered by the MX fallback |

**Proposal**: A. Walk `navigator.languages` in order and take the first tag
whose region, parsed with `Intl.Locale`, is a two-letter code present in the
data set; otherwise `MX`.

CONFIRMED (Node 24.12, ICU 77.1): `new Intl.Locale('es-419').region` is
`'419'`, `new Intl.Locale('es').region` is `undefined`,
`new Intl.Locale('en-US').region` is `'US'`. A malformed tag makes
`Intl.Locale` throw; the parser catches and skips it.

**Policy tension, for Roberto (not resolved by an agent)**: `messaging.md`
rule 4 and `ui-map.md` § 1 say the site does not detect the **language** by
IP or `Accept-Language` ("un visitante que llega por un link en español debe
ver lo que le compartieron"). `navigator.languages` is the same browser
preference `Accept-Language` is built from. The proposal uses it only to
pre-select a changeable dial code and never changes language or content, so
it does not contradict the rule's reason (INFERRED), but the rule's wording
is broad enough that a human should confirm.

**Timing**: detection runs inside the handler that switches the preference
to WhatsApp (a user event, browser only). It therefore never runs during
prerender and never causes a hydration mismatch: the field does not exist in
the static HTML (CONFIRMED: `WhatsappField` renders under `v-if="visible"`,
and `contactPreference` starts as `'email'`).

**Privacy**: the language list is read in memory and discarded; only the
dial code of the selected country is sent, and only with a WhatsApp number
the visitor chose to give.

---

## R2 · Country names in ES/EN (FR-021)

| Option | Parity | Size | Maintenance | Notes |
|---|---|---|---|---|
| **A. `Intl.DisplayNames(locale, { type: 'region' })`** | Structural: same code list, both languages from the browser's CLDR data | 0 KB | none | CONFIRMED in Node 24/ICU 77: all 245 codes resolve to a real name in `es-MX` and `en` (e.g. `MX` → "México" / "Mexico", `XK` → "Kosovo", `CW` → "Curazao" / "Curaçao"). Supported in all evergreen browsers since 2021 (INFERRED from MDN baseline; UNVERIFIED per version). Names may differ slightly between browsers/ICU versions |
| B. 490 keys in `es.json`/`en.json` | Enforced by `i18n-parity.test.ts` | ~15 KB of JSON compiled into the i18n bundle of every page | hand-maintained, copy review for 245 names | Doubles the locale files; vue-i18n compiles each message |
| C. npm `i18n-iso-countries` | Package-provided | per-locale JSON (UNVERIFIED size) | dependency | See R4 |

**Proposal**: A, using the site's own locale tags from `nuxt.config.ts`
(`es` → `es-MX`, `en` → `en`, CONFIRMED in `nuxt.config.ts` `i18n.locales`).
Names are computed in the content composables (which already hold the page
locale through `useI18n`), sorted with `Intl.Collator` of the same tag.
`fallback: 'none'` plus a fallback to the code itself covers an old browser
(spec Edge Cases). A unit test asserts every code has a non-code name in
both locales in the test runtime, so an invalid code fails CI.

Constitution VI ("No user-facing string may be hardcoded in a component") is
respected: names come from the platform, not from a literal. Option A means
the parity test cannot see country names; the data-set test is the
replacement guard.

---

## R3 · Flag rendering (OA-5)

| Option | Bytes | Requests | Windows Chrome/Edge | Inside a native `<option>` | Dependency |
|---|---|---|---|---|---|
| **A. Emoji from regional-indicator code points** | 0 | 0 | Shows the two letters ("MX") — INFERRED from Windows shipping no flag glyphs in Segoe UI Emoji; **verify on a Windows machine** | Yes (text) | none |
| B. Local SVG set in `public/flags/` or inlined | ~245 files; size depends on the set (UNVERIFIED; full sets are commonly hundreds of KB to a few MB uncompressed) | only the visible ones if `loading="lazy"` `<img>` from own origin | Correct flags | **No** — `<option>` cannot hold images → forces OA-6 C | a vendored set (license per set) |
| C. Emoji + self-hosted flag font scoped with `unicode-range` to regional indicators (e.g. the "Twemoji Country Flags" font used by `country-flag-emoji-polyfill`) | one font file, loaded only when a flag glyph renders (UNVERIFIED size, reported ~80 KB) | own origin only | Correct flags | Yes | font file (Twemoji graphics are CC-BY 4.0, attribution required — UNVERIFIED for that specific build) |
| D. No flag, show `MX +52` | 0 | 0 | n/a | Yes | none — fails acceptance "bandera" |

Computation for A (CONFIRMED in Node): each letter `L` → code point
`0x1F1E6 + (L − 'A')`; `MX` → 🇲🇽.

**Proposal**: A. It is the only option that costs nothing and keeps the
native control. If Roberto wants real flags on Windows, C upgrades A without
touching the control; B only makes sense together with OA-6 C.

Brand note (observation, not a rule): `messaging.md` § Emojis says copy
emojis avoid red. Flags are data identifying a country, not decorative copy;
a human may want to confirm this reading.

Flags are `aria-hidden` in the closed face; inside `<option>` text they are
read by some screen readers as "flag: Mexico" (INFERRED), which duplicates
the name but is not wrong. Option C (combobox) can hide them properly.

---

## R4 · Data source and dependency evaluation (OA-7)

**Proposal**: a static TypeScript module `app/features/forms/data/countries.ts`
holding 245 `{ code, dialCode }` rows (listed in data-model § 1), authored
from the ITU-T E.164 assignment list and the region set of Google's
libphonenumber metadata. The spec author validated the draft list by running
it through Node (CONFIRMED): 245 unique codes, every dial code matches
`^\+[1-9]\d{0,3}$`, every code has an ES and EN name. Correctness of each
individual dial code against ITU is **INFERRED** (authored from well-known
assignments); the implementer spot-checks the shared/unusual ones
(R5) and the reviewer re-checks a sample.

Approximate size: 245 × ~16 bytes ≈ 4 KB source, smaller gzipped
(INFERRED); only shipped in the chunks of the two form pages.

**npm candidates evaluated (none proposed)** — publisher, licence, size,
maintenance are from general knowledge and **UNVERIFIED** in this session
(no registry query was made); if Roberto prefers a package, the implementer
must verify each with `npm view <pkg>` and check for `install`/`postinstall`
scripts before adding it, and the addition goes back to the gate.

| Package | What it gives | Publisher / licence | Size impact | Network / scripts | Why not |
|---|---|---|---|---|---|
| `libphonenumber-js` | country list, calling codes, full number validation | catamphetamine (individual), MIT | tens of KB min+gz even with "min" metadata | no network at runtime; install scripts not expected (UNVERIFIED) | We need 245 pairs, not number parsing; the backend applies a single 6–14 rule |
| `country-flag-icons` | SVG flags | catamphetamine, MIT | per-flag SVGs / a large sprite | none expected | Only useful with OA-6 C + OA-5 B |
| `flag-icons` | SVG flags + CSS | lipis, MIT | full set is large; CSS references every file | none | Same as above |
| `i18n-iso-countries` | localized names | michaelwittig, MIT | one JSON per locale, ~10–20 KB each | none | `Intl.DisplayNames` gives the same for 0 KB |
| `country-flag-emoji-polyfill` | Windows flag font loader | talkjs, MIT | small script + font | by default loads the font from a **CDN** (UNVERIFIED) — would need self-hosting to respect "no third-party requests" | Optional upgrade for OA-5 C only |

Supply-chain note: every package above adds a publisher we would trust at
every update; the static module removes that surface entirely.

---

## R5 · Shared and special dial codes

- `+1` (NANP): US, CA and 23 Caribbean/Pacific members (`AG AI AS BB BM BS
  DM DO GD GU JM KN KY LC MP MS PR SX TC TT VC VG VI`). The area code is part
  of the 10-digit national number, so `whatsappDialCode` is always `+1`.
- `+7`: RU, KZ. `+44`: GB, GG, IM, JE. `+47`: NO, SJ. `+61`: AU, CC, CX.
  `+212`: MA, EH. `+262`: RE, YT. `+290`: SH, TA. `+358`: FI, AX.
  `+590`: GP, BL, MF. `+599`: CW, BQ. `+39`: IT, VA (Vatican's +379 is
  assigned but unused; libphonenumber uses +39 — INFERRED).
- `XK` (Kosovo, +383) is a CLDR user-assigned code, not ISO 3166-1; CONFIRMED
  that `Intl.DisplayNames` names it in both locales.
- Antarctica (`AQ`) and other regions with no dial code are excluded.

Because several countries share a dial code, the form stores the **country
code**, not the dial code; the dial code is derived when building the
request. Storing `+1` would make "which flag?" unanswerable.

---

## R6 · Control type and accessibility (OA-6)

**Option N — native `<select>` (baseline)**

- Options: `"{flag} {name} ({dialCode})"`, e.g. "🇨🇴 Colombia (+57)".
  Value: country code.
- Closed face: the native select is stretched transparent over a visible
  face showing `{flag} {dialCode}` + the existing `chevron-down` icon. The
  select keeps focus, keyboard and the platform picker; the face is
  `aria-hidden`. This overlay pattern is common for styled native selects
  (INFERRED). The select's accessible name is the OA-8 label via
  `aria-label` (the visible field label "Número de WhatsApp" belongs to the
  number input).
- Satisfies every acceptance item: role `combobox` (HTML-AAM maps a
  single-select `<select>` to combobox in current browsers, INFERRED),
  accessible name, value exposed and change announced by the platform;
  keyboard: arrows, Home/End, type-to-jump, Enter/Space/Alt+Down to open
  (platform-dependent).
- No search box: native type-to-jump matches name prefixes ("Es" → España,
  Estados Unidos…). Not substring or dial-code search.
- Mobile: iOS/Android show their own wheel/list, the best UX at 342 px.
- Same choice and rationale as `SelectField.vue` (feature 20, plan D-4),
  CONFIRMED in its header comment.

**Option C — custom combobox with search (APG "Editable Combobox With List
Autocomplete")**

- `<input role="combobox" aria-expanded aria-controls aria-autocomplete="list"
  aria-activedescendant>` + popup `<ul role="listbox">` with `role="option"`
  `aria-selected` rows; Down/Up/Home/End/PageUp/PageDown, Enter to choose,
  Escape to close and restore, Tab to close; filter by name (accent- and
  case-insensitive via `normalize('NFD')`), dial digits or code; active
  option scrolled into view; outside click closes; a polite live region
  announcing result count is advisable.
- Needed for: a real search box (OA-4), SVG flags (OA-5 B), or a popover
  the `.pen` draws.
- Cost (INFERRED): one component well past 200 lines unless split
  (input + listbox + logic composable), ~25 more test cases, manual
  screen-reader verification (VoiceOver + NVDA) the repo has no tooling
  for, and an on-screen keyboard opening on mobile when the list opens.
- Delta tasks are listed at the end of `tasks.md` so the gate can switch
  without re-planning.

---

## R7 · Layout inside the existing field (OA-10)

CONFIRMED in code: `WhatsappField.vue` wraps `TextField.vue`, which renders
label → input → error as a column, using tokens `gap-field-label-gap`,
`rounded-control`, `border-glass-line`, `bg-glass-bone`, `px-field-x`,
`py-field-y`, `text-input-value`, `text-ink-100`,
`focus-visible:outline-red-400`, error `text-red-400` / `border-red-400`.
`SelectField.vue` adds the `chevron-down` icon sized by
`--spacing-field-icon`.

**Proposal**: `TextField` gains an optional `leading` slot; when present,
input and slot sit in a `flex` row with the existing `gap-field-label-gap`
token as the horizontal gap. The selector box reuses the control recipe
above. The dial-code error renders under the row, before the number error.
No new token. Every one of these choices is **UNVERIFIED against the
`.pen`** (spec OA-10); a measured value that has no token becomes a new
token in `global.css`, never a literal.

`--spacing-contact-whatsapp-h` (4.625rem, CONFIRMED in `global.css`) is the
transition's max height for label + one control row; the row keeps one
control height, so the token still fits. If the leader's layout stacks the
selector above the number on mobile, the token must grow (open question in
OA-10 e).

---

## R8 · Server field name vs. form field id

The server names the field `whatsappDialCode`; the form stores a country
code. CONFIRMED in `serverFieldErrors.ts`: `resolveServerFields` treats the
server name as the form field id and rejects unknown names as a site defect;
`markValue` reads `values[field]`. Proposal: form field id
`whatsappCountry` (value: country code, DOM id of the select, error-key
owner) and a one-entry alias map `{ whatsappDialCode: 'whatsappCountry' }`
applied at the start of `resolveServerFields`. The existing "WhatsApp only"
guard extends to the alias. A mark clears when the country changes because
`markValue` compares the current country code to the marked one.

---

## R9 · `ApplicationForm.vue` stays ≤ 200 lines

CONFIRMED: 199 lines today. The `WhatsappField` call grows by a country
`v-model`, the country options and a country error (+3 lines). Proposal:
`WhatsappField` receives `content` (the whatsapp + whatsappCountry content
object, one prop) and `errors` (`{ number, country }`, one prop built by a
small `whatsappErrors()` helper in the form) instead of separate label/error
props, so the call stays within today's line count. Fallback: drop the
"Same `lg:`-scoped width" comment (1 line) or move `submitLabel` into
`useApplicationForm` (−4 lines). Reviewer checks `wc -l`.

---

# Amendment A1 (2026-10-14) · Default country from the visitor's IP

Folded in from the draft briefly numbered 033 (deleted). Evidence labels
as above; **CONFIRMED** here also covers the AWS CloudFront Developer Guide
(fetched through Context7, library
`/websites/aws_amazon_amazoncloudfront_developerguide`, indexed 2026-08-14).
The gate items IP-1..IP-6 were **approved by Roberto on 2026-10-14** as
proposed below.

Sources read (read-only): `muush-foundation/modules/static-site/{main.tf,
variables.tf,functions/request-router.js,README.md}`,
`muush-foundation/specs/001-static-site-hosting/plan.md` (Gate VII),
`muush-foundation/.specify/memory/constitution.md` § VII. Nothing in
muush-foundation was edited.

---

## R10 · What exists today (CONFIRMED, from the infra repo)

- One CloudFront distribution, private S3 REST origin with OAC.
- **One** CloudFront Function, `<apex>-request-router`, runtime
  `cloudfront-js-2.0`, associated as **viewer-request** on the default
  behaviour **and** on the three immutable behaviours (`/_nuxt/*`,
  `/_fonts/*`, `/_i18n/*`). Two jobs, in order: `www` → apex 301 (a
  generated response, before the cache), then directory-index rewrite
  (no dot → append `/index.html`).
- **G-VII.6** (muush-foundation 001 plan, Gate VII, NON-NEGOTIABLE
  principle "DRY — loops over duplication"): "The edge function is one
  function, not two … Two functions doing two jobs on the same request
  would be the duplication this principle exists to prevent."
- HTML cache policy `<apex>-html`: **nothing** in the cache key (no
  headers, cookies or query strings), default TTL 300 s. No origin request
  policy anywhere in the module.
- Custom error responses: origin 403/404 → `/404.html` with status 404. A
  request for `/__geo` that reached the origin today would be answered with
  the site's 404 **HTML**.
- Response-headers policy: HSTS, nosniff, `Referrer-Policy`, `X-Frame-Options:
  DENY`. No CSP.
- Logging and WAF deliberately absent (001 spec, Resolved Open Questions B).

## R11 · How the country reaches the page — mechanism comparison (spec A1 IP-1)

### R11.1 · AWS facts used below

| # | Fact | Label |
|---|---|---|
| F1 | `CloudFront-Viewer-Country` contains "the two-letter country code for the viewer's country" (ISO 3166-1 alpha-2), computed by CloudFront from the viewer IP (`adding-cloudfront-headers.md`, `header-caching.md`) | CONFIRMED |
| F2 | AWS ships **CloudFront Functions** examples that read `request.headers['cloudfront-viewer-country']` in a **viewer-request** function (`example_cloudfront_functions_redirect_based_on_country_section.md`, `…select_origin_based_on_country_section.md`); the event-structure example also shows it on the request | CONFIRMED |
| F3 | For **Lambda@Edge**, the CloudFront headers are added "after the viewer request event", only "if you configure CloudFront to add them by using a cache policy or origin request policy", and are not available in a viewer-request Lambda (`lambda-at-edge-function-restrictions.md`) | CONFIRMED |
| F4 | Whether a **CloudFront Function** in viewer-request sees `cloudfront-viewer-country` **without** any cache/origin-request policy naming it: the fetched docs do not say | **UNVERIFIED** (see R11.3) |
| F5 | A viewer-request function can return a response object instead of the request; it short-circuits before the cache and the origin (`function-code-choose-purpose.md`, tutorial; also the existing `www` branch relies on it) | CONFIRMED |
| F6 | Generated responses at viewer request are capped at 40 KB (stated for Lambda; the body here is < 20 bytes) | CONFIRMED (limit irrelevant) |
| F7 | A viewer-response function can set cookies through `response.cookies` (`{ value, attributes }`) and can add headers; it cannot read the origin body | CONFIRMED |
| F8 | "For a specific cache behavior, each event type … can have only one edge function association" | CONFIRMED |
| F9 | `CloudFront-Viewer-Address`/`-ASN` can go only in an origin request policy, not a cache policy; `-Country` can go in either | CONFIRMED |
| F10 | A header in an origin request policy is forwarded to the origin but is not part of the cache key; a header in a cache policy is both | INFERRED (AWS "Control origin requests with a policy" vs "Control the cache key with a policy"; standard CloudFront model) |
| F11 | When the viewer itself sends a header named like a CloudFront header, "viewer-facing functions see the header value from the viewer request" (stated for Lambda@Edge) | CONFIRMED for Lambda@Edge; INFERRED for CloudFront Functions |

### R11.2 · Options

| Criterion | **(1) `GET /__geo` answered by the existing viewer-request function** | (2) Cookie set by a **viewer-response** function | (3) Country in the HTML cache key | (4) `Server-Timing` header from a viewer-response function | (5) Lambda@Edge origin-request | (6) Viewer-request rewrite to per-country static JSON |
|---|---|---|---|---|---|---|
| One-function gate (G-VII.6) | **Kept**: one more branch in `request-router` | **Broken**: a second function on the same request | Kept (no function change), but see cardinality | **Broken** (second function) | Broken differently: a Lambda besides the function | Kept (branch rewrites URI) |
| HTML cache behaviour | **Untouched** | Untouched (viewer-response runs after the cache) | Fragmented per country | Untouched | Fragmented | Untouched |
| Cache-key cardinality | **None**: generated before the cache; if a policy is needed it is an origin request policy on a `/__geo`-only behaviour (F10) | None if the header goes in an origin request policy; must not touch HTML cache policy | ×~250 objects per URL, hit ratio collapses | Same as (2) | ×~250 | ×~250 tiny objects, plus 250 files in the build |
| Extra request | **One** small same-origin GET per page load, only after the visitor engages a form | **Zero** (cookie arrives with the HTML) | Zero, but the static HTML cannot carry the country anyway (S3 serves the same bytes) → does not work without (5) | Zero | Zero | One, plus an origin round trip |
| Privacy | Country only, no storage, no cookie; IP never leaves AWS | A cookie on the device for every visitor, form or not, sent back on every request; likely needs to be declared in a cookie notice (INFERRED) | n/a | No storage; country sent to every visitor | Compute sees the IP; country only in output | Country only |
| Failure mode | Branch bug → **all paths** served by the function fail (it is the same function); mitigated by tests in CloudFront's test console. Missing header → `{"country":null}` → Mexico | Second function bug → all HTML responses fail | Cache misses, origin load | Same as (2); `serverTiming` needs Safari ≥ 16.4 (INFERRED) | Lambda cold starts, cost, regional logs that contain IPs | Missing object → 404 HTML → Mexico |
| Site-side complexity | One `fetch` with timeout + validation | Cookie parsing; no request | — | `performance.getEntriesByType('navigation')` parsing | — | Same as (1) |
| Fits Art. IV (site) | Yes (R12) | Yes | No benefit | Yes | No (compute generating HTML) | Yes |

Also excluded by the feature description itself: a third-party IP
service, the Geolocation API, the time zone, browser languages. A
**response-headers policy** cannot carry the country: its custom headers
hold static values (INFERRED from the policy model; no dynamic placeholders
exist).

### R11.3 · Decision (approved by Roberto 2026-10-14, IP-1)

**Option (1)**: `GET /__geo`, answered by `request-router` with
`{"country":"<A2>"}` or `{"country":null}`, `Cache-Control: no-store`.
Exact contract: [contracts/edge-geo-endpoint.md](./contracts/edge-geo-endpoint.md).

Rationale: it is the only option that keeps G-VII.6, keeps the HTML cache
key empty, stores nothing on the device, and fails into the documented
default. Its single cost, one ~20-byte same-origin request per page load,
is paid only by visitors who interact with a form (IP-3), which is exactly
the population that can use the answer.

On **F4** (UNVERIFIED): the contract makes muush-foundation responsible for
the header being present, with a preferred configuration that is safe
either way: a dedicated ordered behaviour for path `/__geo` with
`Managed-CachingDisabled` and an origin request policy that names only
`CloudFront-Viewer-Country`, associated with **the same** `request-router`
function ARN. If verification shows the header is present without the
policy, the behaviour is optional. It must **never** be added to the HTML
cache policy. Post-apply verification (`curl https://muush.dev/__geo`
returning a real country from a known location) is a contract obligation.

On **F11**: a visitor could forge their own `CloudFront-Viewer-Country`
request header and, at worst, preselect a different dial code for
themselves. Harmless (they can pick any country by hand); the edge's
`^[A-Z]{2}$` check prevents anything but two letters from entering the JSON.

Alternatives kept on record: (4) is the best zero-request variant if
muush-foundation ever accepts a viewer-response function for another
reason; (2) only if a cookie notice exists anyway.

## R12 · Constitution Article IV (spec A1 IP-2)

Article IV (NON-NEGOTIABLE) has four operative clauses. Assessment:

| Clause | Does Amendment A1 comply? |
|---|---|
| "`nitro.preset: 'static'` … the deployable artefact is whatever `pnpm generate` writes" | **Yes.** No config change; the artefact is the same kind of files, with no country in them (FR-A10, asserted by `tests/static-output.test.ts`) |
| "no `server/api/` routes, no runtime server dependency" | **Yes.** No `server/` directory; the site does not *depend* on the edge piece: absent, it degrades to Mexico, the documented default (FR-A01/FR-A03) |
| "no feature that requires compute at request time" | **Yes, on the word "requires".** The feature's required behaviour (Mexico by default, never a third party, never overwrite a pick) is complete without any compute. The edge answer is an optional enhancement whose absence is a specified, tested state (A1-2). The compute that *does* run is CDN configuration in muush-foundation |
| "Any capability that needs a server … belongs in a different service, not a workaround bolted onto this site" | **Yes.** The piece that needs request-time evaluation is placed in the hosting layer, owned by another repository with its own harness and gates. This repository ships only a contract and a client |

Supporting precedent (CONFIRMED): the site **already** depends on the same
edge function far more strongly: without the index rewrite, `/es/nosotros`
and `/en/about` are 404s (`rules.md` § R21 calls it "un requisito de
despliegue"). Article IV has never been read as forbidding the CDN layer's
own logic; Amendment A1 adds a dependency that is weaker (optional) than one
already accepted.

Counter-argument, for Roberto to weigh: the *spirit* of "static purity" is
"the page behaves the same for everyone". After this feature, two visitors
see different defaults. But that was already true in the original feature 32 design (browser
languages), and the HTML stays identical; only client behaviour differs.

**Approved by Roberto 2026-10-14**: complies; **no amendment needed**. Optional PATCH (wording
only, Roberto's call): add to Art. IV "Logic in the CDN layer owned by the
hosting repository is outside this article when the site works without it
and no `server/` code is added". An agent does not draft constitution
amendments without being asked.

## R13 · When to ask, how long to wait (spec A1 IP-3, IP-4)

| Option | Requests | Answer ready when field opens | Notes |
|---|---|---|---|
| A. On page load | 1 per page view, every visitor | Always | Pays for visitors who never use a form; a request with no user intent |
| **B. On first interaction with the form** | 1 per page load, only engaged visitors | Almost always (the preference radio is the 6th field of the contact form, the last of the application form) | Same trigger Turnstile already uses (`onEngage` on `focusin`), so the site's network behaviour stays "nothing until you touch a form" |
| C. On switch to WhatsApp | 1, only WhatsApp choosers | Rarely: the field shows Mexico, then flips | Most private, worst UX (visible flip every time) |

**Approved by Roberto 2026-10-14**: B, with the switch to WhatsApp as a second trigger (keyboard
or programmatic paths that skip `focusin` are covered); the lookup runs at
most once per form instance. Timeout **3000 ms** (named constant): the
request is aborted, Mexico stands, no late flip. A late answer that arrives
inside the budget is applied only if the visitor has not picked (FR-A07).
Typing digits is not picking.

## R14 · Site-side design choices

- **Seam.** The lookup is a network call; Constitution Art. V forbids it in
  `ui/`. The forms already receive one network port from the page, the
  submitter (`ContactSubmitter`/`ApplicationSubmitter`, built in
  `logic/useFormSubmission.ts`, the only Nuxt-aware network file). Adding an
  **optional** member `lookupCountry?: () => Promise<string | undefined>` to
  both ports means: pages, sections and form props are unchanged; stories
  and component tests, whose stub submitters do not implement it, make no
  request and show Mexico (FR-A11) with no global `fetch` stub.
- **Validation lives in the site too.** The edge checks the shape; the site
  checks shape **and** list membership (`isCountryCode`), because only the
  site knows the list (`data/countries.ts`).
- **Request shape.** Relative URL `/__geo` (same origin by construction, so
  no CORS and no host to configure), `GET`, no body, no custom header,
  `credentials: 'omit'`, `cache: 'no-store'`, `AbortController` timeout.
  Never throws: any failure returns `undefined`.
- **Dev / preview / Storybook / tests.** `pnpm dev` answers `/__geo` with
  Nuxt's 404 HTML; a local static preview answers 404; JSON parsing fails or
  the status is not OK → `undefined` → Mexico. Storybook and Vitest stubs
  omit `lookupCountry` → no request. No `public/__geo` fixture and no dev
  proxy are added: a fixture would ship to S3 and lie in a local preview.
  To see a non-Mexico default by hand: a story whose stub resolves `'CO'`,
  or the browser's "override content" on `/__geo`.
- **No new dependency, no i18n change** (no new copy).
- **Removed** (Art. VIII, no dead code): `detectDefaultCountry`,
  `readBrowserLanguages`, the `readLanguages` option, and their tests.
- **Shared logic.** `countryPicked` + `onWhatsappCountryChange` are today
  duplicated in both form composables; the new behaviour (lookup once,
  apply if not picked) would duplicate more. Extracted to one
  `logic/useDefaultCountry.ts` used by both (Art. VIII DRY).
