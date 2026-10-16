# Feature Specification: Root `/` redirects to a locale by the visitor's country

**Feature Branch**: `feat/ip-locale-root-redirect`
**Feature**: 33 · `ip_locale_root_redirect` (`feature_list.json`)
**Created**: 2026-10-15
**Status**: Approved by Roberto on 2026-10-15 — G1–G8 answered as recommended (see § Gate — human approval at the end; the gate-questions table below keeps the original proposals)
**Input**: Roberto, 2026-10-14: "según la IP del visitante, mandarlo al idioma correspondiente. Se mapean los países de habla hispana a /es; cualquier otro país va a /en." Leader proposals (a)–(e) in `feature_list.json`, plus the context that changed on 2026-10-15 (existing 301 at CloudFront, English as the intended site default in feature 37, per-locale 404 pages from feature 36).

## Provenance key

- **CONFIRMED** — read in this repository (file and line cited) or stated by Roberto in `feature_list.json`.
- **INFERRED** — derived from confirmed facts; the reasoning is shown.
- **UNVERIFIED** — nobody in this repository can check it; it names an owner.

## Context

| # | Fact | Status |
|---|---|---|
| C1 | Today `/` is served by the committed `public/index.html`: a `meta refresh` to `/es`, `canonical` `/es`, `x-default` `/es`, `noindex`, and a real `<a href="/es">` fallback. | CONFIRMED (`public/index.html`) |
| C2 | Roberto says CloudFront **already** answers `/` with a **301** to `https://muush.dev/en`, so `public/index.html` is probably never served in production. Where that 301 is configured (the `request-router` function, a distribution setting, or an S3 redirect rule) and what cache headers it carries are unknown here. | **UNVERIFIED** — owner: Roberto / muush-foundation |
| C3 | `docs/business/landing/ui-map.md` § 1 says Spanish is the default and "no se detecta idioma por IP ni por `Accept-Language`"; `messaging.md` rule 4 repeats the reason. Roberto revokes that **only for `/`**; the human-only docs are updated by him. | CONFIRMED (feature 33 description) |
| C4 | `ui-map.md` § 1 also says the toggle's choice "se recuerda en `localStorage` para visitas siguientes al home". **No such memory exists**: nothing under `app/` reads or writes `localStorage` or `document.cookie`. | CONFIRMED (grep over `app/`, 2026-10-15) |
| C5 | Feature 32 already reads the viewer's country at the edge (`GET /__geo`, answered by muush-foundation's viewer-request function `request-router` from `cloudfront-viewer-country`). Whether that header reaches a CloudFront Function without an origin-request policy is itself UNVERIFIED in feature 32's contract § 4. | CONFIRMED / UNVERIFIED (`specs/032-whatsapp-dial-code-selector/contracts/edge-geo-endpoint.md`) |
| C6 | muush-foundation runs **one** edge function (`request-router`, its gate G-VII.6). This repository never edits that repository; it delivers contracts. | CONFIRMED (feature 32 and 36 contracts) |
| C7 | Feature 36 serves per-locale not-found documents at whatever missing URL was requested (`en/404/index.html`, `es/404/index.html`), via error responses, never via redirect. | CONFIRMED (`specs/036-not-found-page/contracts/edge-not-found.md`) |
| C8 | Feature 37 (`english_default_locale`, pending, after this one) will switch `i18n.defaultLocale`, `rootRedirect`, `x-default` and `public/index.html` to English. It is **not** implemented here. | CONFIRMED (`feature_list.json`) |
| C9 | The language toggle is one component (`app/features/shell/ui/LanguageToggle.vue`), rendered by `SiteNav` and `MobileMenu` on every page, including the not-found pages. It is a real link; scripting only adds the anchor. | CONFIRMED |

## User Scenarios & Testing *(mandatory)*

### User Story 1 — A visitor typing `muush.dev` lands in their language (Priority: P1)

Someone types `muush.dev` or follows a link to the bare domain. If they are in a Spanish-speaking country they land on the Spanish home. Anywhere else they land on the English home. There is no flash of the wrong language and nothing to click.

**Why this priority**: This is the request. The bare domain is what people type and print on cards, and it is the one URL that carries no language of its own.

**Independent Test**: Request `/` with the edge's country set to `MX`, `AR`, `ES` → the response sends the visitor to `/es`. With `US`, `BR`, `FR`, `JP` → `/en`. Can be tested in the edge function's test console alone (contract § 7) before the site changes at all.

**Acceptance Scenarios**:

1. **Given** a visitor whose country is on the approved Spanish-speaking list (G5), **When** they request `/`, **Then** they end on `/es` in one redirect.
2. **Given** a visitor whose country is known and **not** on the list, **When** they request `/`, **Then** they end on `/en` in one redirect.
3. **Given** a visitor whose country is absent or malformed, **When** they request `/`, **Then** they end on the default locale approved at gate G2 (recommended: `/en`).
4. **Given** a request to `/?utm_source=card`, **When** it is redirected, **Then** the query string is kept on the destination (`/en?utm_source=card`).

---

### User Story 2 — A visitor who chose a language keeps it (Priority: P1)

A visitor in Mexico switches the site to English with the toggle. Next week they type `muush.dev` again and land on English, not Spanish. The same holds the other way round.

**Why this priority**: Without it, the country rule overrides a choice the person made explicitly, every time. The leader proposed it as part of the feature (proposal c) and the acceptance list requires it.

**Independent Test**: Click the toggle on any page → the browser holds the preference. Request `/` from a Spanish-speaking country with that preference set to `en` → `/en`.

**Acceptance Scenarios**:

1. **Given** a visitor clicked the toggle towards English, **When** they later request `/` from a listed Spanish-speaking country, **Then** they end on `/en`.
2. **Given** a visitor clicked the toggle towards Spanish, **When** they later request `/` from any other country, **Then** they end on `/es`.
3. **Given** a stored preference, **When** the visitor opens a direct link such as `/es/nosotros` or `/en#servicios`, **Then** nothing redirects: the link wins, exactly as `ui-map.md` § 1 requires.
4. **Given** a stored preference whose value is anything other than the two locale codes, **When** they request `/`, **Then** the preference is ignored and the country rule applies.
5. **Given** a visitor who never touched the toggle, **When** they browse `/es` or `/en`, **Then** no preference is stored. Only the toggle records one.

---

### User Story 3 — Every other address behaves exactly as today (Priority: P1)

Shared links, anchors, the About pages, the per-locale not-found pages, the sitemap, robots, assets and the country endpoint of feature 32 are untouched.

**Why this priority**: The principle Roberto kept from `ui-map.md` § 1: a direct link is never overwritten. A defect here breaks every shared URL.

**Independent Test**: Request each of `/es`, `/en`, `/es/`, `/es/nosotros`, `/en/about`, `/en/404`, `/es/no-existe`, `/xyz`, `/index.html`, `/sitemap.xml`, `/robots.txt`, `/__geo`, `/_nuxt/<file>` from a Spanish-speaking and from a non-Spanish-speaking country, with and without a preference → identical status and body to today.

**Acceptance Scenarios**:

1. **Given** any path other than exactly `/`, **When** it is requested from any country with any preference, **Then** the response is the same as before this feature.
2. **Given** a missing path under `/es/…` or `/en/…`, **When** it is requested, **Then** the visitor gets the not-found page of feature 36 with status 404, never a redirect.

---

### User Story 4 — Search engines still see both languages (Priority: P2)

Crawlers reach `/es` and `/en` and keep indexing both. The root stays out of the index, and a per-country answer is never stored and replayed to someone else.

**Why this priority**: Most crawlers run from one country. A cached or permanent answer at `/` would make the redirect wrong for everybody else, or teach search engines that `/` permanently means one language.

**Independent Test**: The redirect response is temporary and carries no-store caching. `/es` and `/en` are still in the sitemap, still linked to each other by `hreflang`, and still reachable from a crawler in any country.

**Acceptance Scenarios**:

1. **Given** any request to `/` that the edge answers, **When** the response is inspected, **Then** it is a temporary redirect (302) that no browser or shared cache may store.
2. **Given** a crawler from any country, **When** it requests `/es` or `/en` directly, **Then** it gets the page with 200. The sitemap and `hreflang` sets are unchanged by this feature.
3. **Given** crawlers and people, **When** they request `/` from the same country with no preference, **Then** they get the same answer. Crawlers are not singled out.

---

### User Story 5 — Without the edge piece, nothing breaks (Priority: P2)

If the edge change is not deployed, rolled back, or the site is served somewhere else (local preview, a static host), `/` still goes somewhere sensible, with no scripting required.

**Why this priority**: Constitution Article IV. The site must stay correct as plain files.

**Independent Test**: `pnpm generate` and serve `.output/public` with a plain static server → `/` leads to the locale `public/index.html` names.

**Acceptance Scenarios**:

1. **Given** no edge redirect, **When** a visitor requests `/`, **Then** `public/index.html` sends them to its locale (today `/es`; `/en` once feature 37 lands; see gate G3).
2. **Given** no edge redirect, **When** a visitor uses the toggle, **Then** the preference is written all the same, and nothing on the page changes because of it.

---

### Edge Cases

- **Browsers that cached today's 301.** A 301 may be stored by a browser with no expiry. Those visitors go straight to `/en` without asking the edge until their cache is cleared. No server-side change can reach them. The contract records the current 301's headers first and states the residual effect (G7).
- **Country header absent** (some IPs, test traffic, header not forwarded) → gate G2 default.
- **Country present but malformed** (`mx`, `MEX`, `""`, `XX`-style placeholders that pass the shape) → a well-formed code that is not on the list is treated as "another country" → `/en`. Only a missing or malformed value uses the G2 default. Under the recommended G2 (`/en`) both give the same result.
- **Preference with surrounding whitespace, different case or extra values** (`EN`, ` en`, `en;x`) → ignored; the country rule applies.
- **Several cookies on the request** → only the preference cookie is read; no other cookie influences the answer.
- **`HEAD /`** → same redirect as `GET`. **`OPTIONS /` or other methods** → unchanged behaviour.
- **`/` with a fragment** (`muush.dev/#servicios`) → the fragment never reaches the edge; browsers re-attach it to a redirect target, so the visitor lands on `/en#servicios`. INFERRED (RFC 9110 § 10.2.2); verified in contract § 7.
- **`www.muush.dev/`** → the existing `www` → apex 301 runs first (unchanged), then the apex `/` is answered by this rule.
- **`/index.html`** → not redirected by country; keeps today's behaviour (it is the static fallback object).
- **Toggle activated with scripting disabled** → the link still navigates; the preference is not written. Documented degradation.
- **Toggle on a not-found page** (feature 36) → it leads to the other locale's home and records the preference like any other toggle click.
- **Privacy tools that block or clear cookies** → the country rule applies; nothing fails.

## Requirements *(mandatory)*

### Functional Requirements

**Scope**

- **FR-001**: Only a request whose path is exactly `/` MAY be redirected by country or preference. Every other path, including `/index.html`, `/es`, `/en`, their sub-paths, the not-found pages, `/__geo`, `/sitemap.xml`, `/robots.txt` and assets, MUST be answered exactly as before this feature.
- **FR-002**: The redirect MUST be decided and sent by the site's own edge before any page is served (no flash of the wrong language, no scripting, no extra page load). In this repository it is delivered as a contract for muush-foundation (`contracts/edge-root-locale-redirect.md`). This repository adds no server, route or runtime.

**The decision at `/`, in order**

- **FR-003**: If the request carries the site's locale-preference cookie with a value of exactly `es` or exactly `en`, the visitor MUST be sent to that locale's home.
- **FR-004**: Otherwise, if the visitor's country is a well-formed two-letter code on the approved Spanish-speaking list (G5), the visitor MUST be sent to `/es`.
- **FR-005**: Otherwise, if the country is a well-formed two-letter code not on the list, the visitor MUST be sent to `/en`.
- **FR-006**: Otherwise (country absent or malformed), the visitor MUST be sent to `/en` (gate G2, approved by Roberto 2026-10-15). FR-005 and FR-006 therefore read as "anything not on the list → `/en`".
- **FR-007**: The redirect MUST preserve the request's query string unchanged and MUST NOT add any parameter.

**Response properties**

- **FR-008**: The redirect MUST be temporary (302) and MUST forbid storage by browsers and shared caches. It MUST NOT be permanent (301/308).
- **FR-009**: A per-country or per-preference answer MUST never be stored at the edge and replayed to another visitor. The cache key of every other page MUST NOT start varying by country or by cookie.
- **FR-010**: The redirect response MUST NOT set any cookie. The edge never writes the preference; only the toggle does.
- **FR-011**: Crawlers MUST receive exactly the same answer as people from the same country with the same cookies. No user-agent rule.

**The preference (proposal c)**

- **FR-012**: Activating the language toggle MUST record the **destination** locale as a first-party preference holding only `es` or `en`. Nothing else is stored, and no identifier is created.
- **FR-013**: The preference MUST be limited to this site's own host (not shared with subdomains), sent only over secure connections, not sent on cross-site sub-requests, and expire after 365 days, renewed on each toggle use (gate G4, approved).
- **FR-014**: Only the toggle writes the preference. Visiting a page, following a link, the not-found pages and the forms MUST NOT write it.
- **FR-015**: Writing the preference MUST NOT change the toggle's existing behaviour: same destination, same anchor preservation, same no-scripting fallback, same accessible name, same visual result.
- **FR-016**: The preference MUST only ever influence the answer at `/` (FR-001). It MUST NOT redirect or alter any page.

**Privacy**

- **FR-017**: No new request to any third party. No location permission prompt. No new script.
- **FR-018**: The visitor's IP address MUST NOT be logged, returned, stored, forwarded or written anywhere by the redirect. Only the country (already computed by the edge) and the preference cookie are read, and neither is logged.

**Single source of the country list (proposal e)**

- **FR-019**: The Spanish-speaking country list MUST be written in exactly one authoritative place. Approved (G6): the contract `contracts/edge-root-locale-redirect.md` § 3, which the edge function implements. This repository holds no runtime copy, because nothing in the site decides on it.

**Fallback and coexistence**

- **FR-020**: Without the edge redirect, `/` MUST keep working as plain files through `public/index.html` (Constitution Article IV). Which locale that file names is gate G3. **Approved:** feature 33 does not edit it; feature 37 switches it to `/en` together with `rootRedirect` and `x-default`.
- **FR-021**: `/` MUST stay out of the index (`noindex`) and out of the sitemap. `/es` and `/en` keep their canonical, `hreflang` and sitemap entries unchanged by this feature.
- **FR-022**: The existing permanent redirect at `/` (C2) MUST be replaced, not stacked. A request to `/` produces one redirect, never a chain.

**Quality gates**

- **FR-023**: No new dependency. No new copy (no i18n key is added or changed). No change to any page's markup other than the toggle's behaviour.
- **FR-024**: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate` and `pnpm storybook:build` pass.

### Key Entities

- **Locale preference**: the visitor's explicit language choice. One value, `es` or `en`, stored in the visitor's browser as a first-party cookie. Written by the toggle, read only by the edge at `/`. No identifier, no timestamp, no country.
- **Spanish-speaking country list**: a closed set of ISO 3166-1 alpha-2 codes (G5). Lives in the edge contract.
- **Viewer country**: the two-letter code the CDN derives from the connection. Read at the edge, never stored, never forwarded.

## Gate questions for Roberto *(proposals — none decided)*

| # | Question | Leader proposal | Recommendation |
|---|---|---|---|
| **G1** | Where is the redirect made? (proposal a) | 302 in the existing viewer-request function `request-router`, from the CDN's country, same mechanism as `/__geo`. | **Yes, at the edge.** The alternative (a script in `public/index.html` calling `/__geo`) adds a flash, a second round trip and a scripting dependency. |
| **G2** | Country absent or malformed → which locale? (proposal b) | `/es` (today) vs `/en`. | **`/en`.** Matches Roberto's English-default direction and the current 301. Also makes the rule "listed → `/es`, everything else → `/en`". |
| **G3** | The acceptance item "Sin la pieza de borde desplegada, `/` sigue llevando a `/es` como hoy" conflicts with the English default. What does `public/index.html` name, and when does it change? | — | **Feature 33 leaves `public/index.html`, `rootRedirect` and `x-default` untouched. Feature 37 switches all three to `/en`.** Rewrite the acceptance item as: "Sin la pieza de borde, `/` se comporta como dicte `public/index.html` (hoy `/es`; `/en` tras la feature 37)". The window between the two deploys is invisible in production, because the edge answers `/` before the file is reached. |
| **G4** | Does a manual choice beat the country, and how is it remembered? (proposal c) | First-party cookie with only `es`/`en`, written by the toggle. | **Yes, cookie `muush_locale`, `Path=/`, host-only, `Secure`, `SameSite=Lax`, `Max-Age` 365 days, written by script on toggle click.** No PII. It also replaces the `localStorage` memory `ui-map.md` § 1 describes but that was never built (C4). Without scripting nothing is written (accepted degradation). |
| **G5** | Which countries go to `/es`? (proposal e) | List in contract § 3. | **20 codes:** `AR BO CL CO CR CU DO EC ES GT HN MX NI PA PE PR PY SV UY VE`. **Flagged:** `GQ` Equatorial Guinea (Spanish is official, alongside French and Portuguese; **recommend include**). `US` (large Spanish-speaking minority, English majority; **recommend exclude**). Listed as excluded, for completeness: `BZ` Belize, `AD` Andorra, `GI` Gibraltar, `EH` Western Sahara, `PH` Philippines. |
| **G6** | Where does the list live? (proposal e) | One place. | **Only in the edge contract**, implemented by the edge function. No copy in this repository: nothing here would read it, so a copy would be dead code that drifts (Article VIII). |
| **G7** | How do we leave today's 301? | — | **Replace it with the 302 in the same deploy, and accept that browsers which cached the 301 keep going to `/en` until their cache clears.** Nothing on the server can reach them. Before the change, muush-foundation records where the 301 lives and its exact headers (contract § 6, step 0). If it carried no `cache-control`, the residue is indefinite but harmless: those visitors already get English today. |
| **G8** | SEO shape. (proposal d) | `noindex`, 302, no shared cache, bots reach both locales. | **Yes:** 302 + `cache-control: private, no-store`, generated before the cache (so the CDN never stores it), no user-agent exceptions. `x-default` stays whatever feature 37 sets (planned `/en`). No change to the sitemap. |

## Business-document conflicts to report *(this repository does not edit `docs/business/`)*

- `ui-map.md` § 1: "no se detecta idioma por IP ni por `Accept-Language`" — revoked for `/` only (Roberto). The paragraph and the `Raíz | / redirige a /es/` row need his rewrite.
- `ui-map.md` § 1: "La elección se recuerda en `localStorage`" — never implemented (C4). This feature proposes a cookie instead (G4).
- `messaging.md` rule 4 gives the "no IP detection" rule as its reason. It is still true for every page except `/`.
- `decisions-open.md` § Estrategia de rutas i18n: `Raíz | / → redirect a /es/`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the contract's root cases (§ 7: every listed country, at least five unlisted countries, absent and malformed country, both preferences, a junk preference) produce the expected destination in the edge function's test console.
- **SC-002**: 0 of the contract's non-root regression cases (at least 13 paths) change status or body compared with before the change.
- **SC-003**: A visitor reaches their language's home from `/` with exactly one redirect and no intermediate page.
- **SC-004**: After one toggle click, 100% of later visits to `/` from that browser land on the chosen locale, from any country, until the preference expires or is cleared.
- **SC-005**: 0 new third-party requests and 0 new dependencies, measured on the generated output and the lockfile.
- **SC-006**: The IP address appears in 0 response bodies, headers, cookies or logs produced by this feature.
- **SC-007**: The repository's five quality commands pass.

## Assumptions

- A1: The CDN exposes the viewer's country to the viewer-request function at `/` as it does at `/__geo`. If it needs an origin-request policy on the default behaviour, that is muush-foundation's configuration, and the contract says what is and is not allowed (§ 4). UNVERIFIED; owner muush-foundation.
- A2: A response generated by a viewer-request function is returned before the cache is consulted and is never stored by the CDN. INFERRED from how CloudFront Functions work; to be confirmed by muush-foundation in the contract's verification.
- A3: CloudFront Functions see the viewer's cookies in a viewer-request event whatever the cache policy forwards. INFERRED; confirmed by the contract's test cases.
- A4: A language-preference cookie with no identifier, set only on the user's explicit action, is a functional cookie that needs no consent banner. INFERRED, not legal advice. Roberto decides at G4.
- A5: The country list follows "Spanish is an official or majority language of the territory" (G5). Linguistic classification is Roberto's call.
- A6: The 301 Roberto describes exists (C2). If it does not, G7 is moot and the contract's step 0 records that.
- A7: Feature 37 lands after this one (Roberto's order, 2026-10-15). If 37 is dropped, G3 must be revisited, because the static fallback would keep naming `/es` while the edge default names `/en`.

## Out of scope

- Any change to `public/index.html`, `i18n.defaultLocale`, `rootRedirect`, `x-default` or the sitemap (feature 37).
- Language detection by `Accept-Language`, or a redirect on any path other than `/`.
- A visible language picker, banner or "were you looking for…" prompt.
- Editing, deploying or testing muush-foundation.
- Editing `docs/business/`.

## Gate — human approval (Roberto, 2026-10-15)

All gate questions answered with the recommendation; the spec is **approved for implementation**.

- G1 · 302 from the existing `request-router` viewer-request function, from `cloudfront-viewer-country`.
- G2 · Country absent or malformed → `/en`.
- G3 · Feature 37 (not 33) moves `public/index.html`, `x-default` and `rootRedirect` to English. Without the edge piece, `/` goes wherever `public/index.html` names (`/es` today, `/en` after feature 37).
- G4 · The toggle's choice beats the country: cookie `muush_locale` (`es`/`en` only, `Path=/`, host-only, `Secure`, `SameSite=Lax`, 365 days), written by the toggle on click. No PII.
- G5 · `/es` countries: AR BO CL CO CR CU DO EC ES GT HN MX NI PA PE PR PY SV UY VE **+ GQ** (Equatorial Guinea included); **US excluded** (→ `/en`).
- G6 · The country list lives only in the edge contract.
- G7 · Replace today's 301 with the 302 in the same change, after recording the 301's current headers.
- G8 · 302 with `cache-control: private, no-store`, generated before the cache, no `Vary`, no crawler special-casing.
