# Research: Root `/` locale redirect by country

**Feature**: 33 · `ip_locale_root_redirect` | **Date**: 2026-10-15

Provenance: **CONFIRMED** (read in this repository), **INFERRED** (reasoned, shown), **UNVERIFIED** (owner named). No documentation service was queried for this research. AWS behaviour is stated from platform knowledge and marked INFERRED, and each claim has a test case in the contract (§ 7) that confirms or refutes it before go-live.

---

## R1 · Where the decision runs

**Decision**: A branch in muush-foundation's existing viewer-request CloudFront Function `request-router`, matching `request.uri === "/"` exactly. It returns a generated 302 response.

**Rationale**
- F1 (CONFIRMED): the same function already answers `/__geo` from `cloudfront-viewer-country` (feature 32 contract § 3) and the `www` → apex 301. One more branch keeps muush-foundation's one-edge-function rule (G-VII.6).
- F2 (INFERRED): a response *returned* by a viewer-request function is sent to the viewer before CloudFront looks up its cache, and CloudFront never stores it. So a per-country answer cannot leak to another viewer through the CDN cache, whatever the cache policy says (spec FR-009, assumption A2). Contract § 7 case V-3 confirms it (`x-cache` is absent or `FunctionGeneratedResponse`, never `Hit`).
- F3 (INFERRED): CloudFront Functions receive the viewer's cookies in `event.request.cookies` independently of what the cache policy forwards to the origin (assumption A3). Contract case R-10 confirms it.
- F4 (UNVERIFIED, inherited from feature 32 contract § 4): whether `cloudfront-viewer-country` reaches a function on the **default** behaviour without an origin-request policy that names it. If it does not, the safe fix is an **origin-request policy** on the default behaviour that adds `CloudFront-Viewer-Country`. An origin-request policy does not change the cache key. Adding it to the **cache policy** is forbidden: it would split every page into about 250 cache entries. Owner: muush-foundation.
- F5 (INFERRED): an ordered behaviour with path pattern `/` alone, to scope that policy, may not be expressible or may behave unexpectedly. The contract does not depend on it.

**Alternatives rejected**
- *Script in `public/index.html` that calls `/__geo` and then navigates.* Two round trips, a visible blank page, needs scripting, and makes the static fallback the production path. It would also need a `<noscript>` branch. Rejected.
- *Lambda@Edge.* A second edge runtime, region and IAM role, for logic a CloudFront Function already handles. Rejected (G-VII.6).
- *S3 routing rules / a CloudFront setting.* Neither can read the country or a cookie.

## R2 · Order of the rule inside `request-router`

**Decision**: after the `www` → apex 301, after the `/__geo` branch, before the directory-index rewrite.

**Rationale**: the `www` branch must keep normalising the host first, so there is no `www` → apex → locale chain on the *apex* side. The `/__geo` branch matches a different path, so its position relative to this one does not matter, but listing it first keeps feature 32's verified order intact. The rewrite would turn `/` into `/index.html` and hide it from this rule (INFERRED from feature 32 contract § 3's identical constraint).

## R3 · Today's 301 and the migration to 302

- F6 (UNVERIFIED, Roberto): `/` currently answers 301 → `https://muush.dev/en`. Its location (function branch, distribution setting) and headers are unknown here.
- F7 (INFERRED, RFC 9110 § 15.4.2 and browser behaviour): a 301 is cacheable by default. Without `cache-control`/`expires`, Chromium and Firefox keep it for the lifetime of the HTTP cache, with no fixed expiry. A browser that holds it goes to `/en` without contacting the edge.
- F8 (INFERRED): no server-side change can evict it. The only levers are the user clearing the cache, or the cache evicting the entry under pressure.
- **Decision (G7)**: replace the 301 with the 302 in the same change, so there is never a 301 → 302 chain. Step 0 of the rollout records where the 301 lives and its exact response headers (`curl -sI https://muush.dev/`). Accept the residue: those browsers already land on English, which is the recommended default.
- Search engines (INFERRED): a 302 on a `noindex` root carries no ranking consequence. `/es` and `/en` are discovered through the sitemap and `hreflang`, not through `/`.

## R4 · Response headers of the 302

**Decision**

| Header | Value | Why |
|---|---|---|
| status | `302 Found` | Temporary (spec FR-008). `307` would also be correct. `302` matches the leader's proposal and every user agent treats GET identically. |
| `location` | `/es` or `/en`, plus `?` and the original query string if present | Relative per RFC 9110 § 10.2.2. Host-agnostic, no trailing slash, the same form as the canonical URLs (`https://muush.dev/es`). |
| `cache-control` | `private, no-store` | Forbids storage everywhere. `private` is redundant with `no-store` but makes intent explicit for shared caches. |
| `vary` | not sent | INFERRED: `Vary` tells a cache which request headers select a stored variant. With `no-store` nothing is stored, so `Vary` has no effect. `Vary: Cookie` would also wrongly suggest a cacheable variant. It adds nothing. |
| `x-robots-tag` | `noindex` (optional) | Mirrors `public/index.html`. A redirect is not indexed anyway. |

No `set-cookie` (spec FR-010). No body.

## R5 · Crawlers

- F9 (INFERRED): most crawlers fetch from one country (Googlebot mostly from the US), so at `/` they get the English home under the recommended rule. They still reach `/es` through `sitemap.xml` (it lists `/es` and `/es/nosotros`, CONFIRMED by `tests/seo-output.test.ts`) and through the `hreflang` alternates on every page.
- **Decision**: no user-agent rule (spec FR-011). Treating bots differently is cloaking risk, and it is unnecessary.
- `x-default` (INFERRED from Google's guidance on locale-adaptive pages): `x-default` could point at `/` itself, the redirecting root. Feature 37 already specifies `x-default` → `/en`. This feature does not touch it (G3/G8).

## R6 · The preference cookie (proposal c)

**Decision (G4)**: `muush_locale=<es|en>; Path=/; Max-Age=31536000; SameSite=Lax; Secure`. No `Domain` attribute. Written with `document.cookie` by the toggle's click handler. Contract: `contracts/locale-preference-cookie.md`.

| Attribute | Choice | Reason |
|---|---|---|
| Name | `muush_locale` | Specific enough not to collide with a third-party library's `locale`/`lang`. Not `i18n_redirected`, which is `@nuxtjs/i18n`'s own cookie (unused here: `detectBrowserLanguage: false`, CONFIRMED `nuxt.config.ts`). Sharing that name would make the library start reading it if detection were ever turned on. |
| Value | exactly `es` or `en` | No identifier, no timestamp, no country (FR-012). |
| `Path=/` | required | The edge reads it at `/`, and the toggle runs at `/es/…`/`/en/…`. Without `Path=/` the cookie would default to the toggle page's directory and never reach `/`. |
| No `Domain` | host-only | Not sent to `assets.muush.dev` or the API host (FR-013). |
| `Secure` | yes | HTTPS only. INFERRED: `localhost` counts as a secure context in current Chromium/Firefox, so dev still works. Older Safari drops it on `http://localhost`, which only affects local testing of the edge, and there is no edge locally anyway. |
| `SameSite=Lax` | yes | Sent on a top-level navigation to `/` from another site (a link in an email or a search result), which is exactly when the preference matters. `Strict` would drop it on those navigations. `None` is unnecessary. |
| `HttpOnly` | no | Impossible from script. Nothing sensitive is stored. |
| `Max-Age` | 31 536 000 s (365 d), renewed on each toggle | Long enough that a returning visitor keeps the choice. Proposal for G4. |

- **Privacy** (INFERRED, not legal advice): a cookie that stores only a language the user explicitly chose is a "user-interface customisation" cookie in the EU Article 29 WP Opinion 04/2012 sense, generally exempt from consent. It holds no personal data under Mexico's LFPDPPP. It is never sent to a third party: it is host-only, so the browser attaches it only to requests for `muush.dev` itself. The forms' API and Turnstile are other hosts and never receive it. Roberto decides (spec A4).
- **Size/perf**: about 16 bytes on each request to `muush.dev`. Not part of any cache key (contract § 4 forbids it).
- **Where it is written** (CONFIRMED by reading `LanguageToggle.vue`): the component's existing `@click` handler. Writing happens **before** the modifier/hash early-returns, so a ⌘-click (new tab) also records the choice. `auxclick` (middle button) is not a `click` and does not write. INFERRED: the user still expressed a preference, but a middle-click is ambiguous enough to leave alone.
- **No reading on the client**: the site never reads the cookie. Only the edge does (FR-016). Nothing in the page changes because of it, so there is no hydration risk.

**Alternatives rejected**
- *`localStorage`* (what `ui-map.md` § 1 describes, never built, C4): the edge cannot read it. Only a client script at `/` could, which reintroduces R1's rejected script.
- *No override* (country always wins): violates the feature's acceptance item and `ui-map.md` § 1's intent.
- *Cookie written by the edge on `/es`/`/en` visits*: it would record a link someone followed, not a choice they made (spec FR-014), and every page response would then carry `Set-Cookie`.
- *Server-set cookie*: there is no server (Article IV).

## R7 · The Spanish-speaking country list (proposal e)

**Criterion**: Spanish is an official language, or the majority language, of the territory, and the territory has its own ISO 3166-1 alpha-2 code that CloudFront can report.

| Code | Territory | Note |
|---|---|---|
| AR | Argentina | |
| BO | Bolivia | |
| CL | Chile | |
| CO | Colombia | |
| CR | Costa Rica | |
| CU | Cuba | |
| DO | Dominican Republic | |
| EC | Ecuador | |
| ES | Spain | Canary Islands, Ceuta and Melilla are reported as `ES` (INFERRED: `IC`/`EA` are not ISO 3166-1 assigned codes). |
| GT | Guatemala | |
| HN | Honduras | |
| MX | Mexico | |
| NI | Nicaragua | |
| PA | Panama | |
| PE | Peru | |
| PR | Puerto Rico | US territory with its own ISO code. Spanish is co-official and the majority language. |
| PY | Paraguay | |
| SV | El Salvador | |
| UY | Uruguay | |
| VE | Venezuela | |

**Flagged for Roberto (G5)**

| Code | Territory | Recommendation | Why |
|---|---|---|---|
| GQ | Equatorial Guinea | **include** | Spanish is official (with French and Portuguese) and is the language of administration and schooling. |
| US | United States | **exclude** | Roughly one person in eight speaks Spanish at home. The majority language is English, and the site's default is moving to English. Including it would send every US visitor, crawlers included, to `/es`. |

**Excluded, listed so the omission is visibly deliberate**: `BZ` Belize (English official; Spanish widely spoken), `AD` Andorra (Catalan official), `GI` Gibraltar (English official), `EH` Western Sahara (disputed; reporting by CDNs inconsistent), `PH` Philippines (Spanish no longer official).

**Where it lives (G6)**: only in `contracts/edge-root-locale-redirect.md` § 3. Nothing in this repository decides on country at `/`. The forms' dial-code default uses `/__geo` and its own full list, which is a different question. So a copy in `app/` would have no reader (Article VIII, "no dead code"), and a test asserting a copy equals the contract would test two copies of the same text. The edge function is the list's only implementation, and its test cases (§ 7) enumerate every code.

## R8 · Interaction with feature 37 and the static fallback (G3)

| Piece | Today | After 33 (recommended) | After 37 |
|---|---|---|---|
| Edge answer at `/` | 301 → `/en` (UNVERIFIED) | 302 by cookie/country, unknown → `/en` | unchanged |
| `public/index.html` refresh/canonical/`x-default` | `/es` | unchanged (`/es`) | `/en` |
| `i18n.rootRedirect` (dev only) | `/es` | unchanged | `/en` |
| `x-default` on `/es`, `/en` pages | `/es` | unchanged | `/en` |

- INFERRED: in production the edge answers `/` before the S3 object is fetched, so the `public/index.html` value only shows when the edge piece is absent (local preview, rollback). The temporary mismatch between the edge default (`/en`) and the file (`/es`) between the two deploys is therefore invisible in production. `x-default` → `/es` on the indexed pages is the only production-visible leftover, and feature 37 removes it.
- Acceptance item "Sin la pieza de borde desplegada, `/` sigue llevando a `/es` como hoy" stays literally true until feature 37, which then changes it on purpose. Proposed rewording in spec G3.
- If Roberto prefers, feature 33 can absorb the `public/index.html` edit. That duplicates scope feature 37 already lists (its step 3 audit) and is not recommended.

## R9 · Feature 36 (not-found pages)

- F10 (CONFIRMED, feature 36 contract § 2): not-found documents are served through custom error responses at the missing URL, never via redirect. This rule matches only `/`, which is an existing object, so the two never meet.
- The toggle on a not-found page leads to the other home (CONFIRMED, `useShellNavigation` → `resolveLocaleDestination` fallback). Recording the preference there is consistent: it is the same explicit choice.

## R10 · What this repository can verify

- Unit: cookie serialisation (exact string), the "write" function against a fake `document`, the allowed-value guard.
- Component: clicking the toggle writes the destination locale. The anchor behaviour and modified-click behaviour are unchanged (existing tests stay green).
- Output: `public/index.html` byte-identical to `master` (guards G3's "untouched"). No `muush_locale` string in any generated HTML. The cookie is written only from the bundle (grep).
- It cannot verify the edge. That is contract § 7, owned by muush-foundation.
