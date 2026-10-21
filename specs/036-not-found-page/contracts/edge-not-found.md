# Edge contract: serving the not-found pages (deliverable for muush-foundation)

**From**: muush.dev feature 36 `not_found_page` (`specs/036-not-found-page/spec.md`, decisions D2–D3, gate G5); Stage 2 rewritten by feature 39 `not_found_locale` (`feature_list.json`, Roberto's decisions of 2026-10-19)
**To**: muush-foundation, module `static-site` (CloudFront distribution in front of the S3 origin with OAC; viewer-request function `request-router`)
**Owner**: **Roberto — to apply.** Nothing here edits, deploys or tests muush-foundation. muush-foundation specifies, reviews and applies it through its own harness and gates (including its G-VII.6 "one edge function" rule).
**Status**: **Stage 1 agreed** by Roberto at the feature 36 gate (2026-10-15) and live since muush-foundation v1.0.12 (2026-10-17). **Stage 2 decided** by Roberto on 2026-10-19 (feature 39): Lambda@Edge origin-response, rule cookie > prefix > country > `en` (§ 4). To be applied by Roberto in muush-foundation.

## 1 · What muush.dev ships (after feature 36 deploys)

| Object key | Language | Purpose |
|---|---|---|
| `en/404/index.html` | English (`en-US`) | **Stage 1: the not-found page for every missing path.** Stage 2: whenever § 4.2 resolves to `en` |
| `es/404/index.html` | Spanish (`es-MX`) | Stage 1: built, not referenced by the edge. Stage 2: whenever § 4.2 resolves to `es` |
| `en/404/_payload.json`, `es/404/_payload.json` | — | fetched by the page itself once interactive (same origin, normal 200) |

Both documents are self-contained (assets under `/_nuxt/`, `/_fonts/` as for every page), carry `<meta name="robots" content="noindex">`, no canonical and no hreflang. Once interactive they keep the visitor's URL in the address bar and stay in their own language whatever URL they are served at (verified, `research.md` R1 F8, F10).

**No longer shipped**: `200.html` and `404.html` at the bucket root (`research.md` R2).

## 2 · Stage 1 — the agreed rollout (configuration only)

### Required behaviour

For a request whose object does not exist in the bucket (S3 with OAC answers **403**; a public/website origin would answer **404** — both apply):

| Request path | Response status | Response body |
|---|---|---|
| **any** missing path (`/en/…`, `/es/…`, `/xyz`, `/fr/abc`, `/200.html`, …) | **404** | bytes of `en/404/index.html` |

> ℹ️ Historical: since feature 37 (2026-10-16) the site default is English too, so the divergence described here no longer exists.
>
> ⚠️ **Deliberate divergence, Roberto's decision (gate G5, 2026-10-15).** The site's default locale is Spanish (`i18n.defaultLocale: 'es'`, `x-default` → `/es`, root `/` → `/es`). Stage 1 nevertheless serves the **English** document for every missing path, including Spanish and unprefixed ones. This is an explicit human decision for the interim, not a mistake to "correct" against the site's defaults. Stage 2 restores the per-prefix choice with **English** as fallback for every path not under `/es` (gate G6, Roberto, 2026-10-15).

### Configuration

```text
CustomErrorResponses:
  - ErrorCode: 403   ResponsePagePath: /en/404/index.html   ResponseCode: 404   ErrorCachingMinTTL: 60
  - ErrorCode: 404   ResponsePagePath: /en/404/index.html   ResponseCode: 404   ErrorCachingMinTTL: 60
```

- The `ResponsePagePath` request must reach S3 through a behaviour that serves `en/404/index.html` as-is (the key exists; `request-router`'s directory-index rewrite should not touch a path ending in `.html` — muush-foundation to confirm).
- `ErrorCachingMinTTL` 60 s (suggested) so a page published after an error was cached becomes visible quickly. **Stage 2 changes this to 0** (§ 4.5).

### Rules common to both stages

- `content-type: text/html; charset=utf-8` on the error response.
- Existing objects are unaffected: `/es`, `/en`, `/es/nosotros`, `/en/about`, `/`, `/robots.txt`, `/sitemap.xml`, `/_nuxt/*`, `/_fonts/*`, `/__geo` keep their current status and body.
- Missing **assets** under `/_nuxt/*`, `/_fonts/*` may receive the 404 document or a bare 404; either is acceptable to the site. Preference: bare 404 if the immutable behaviours make that simpler.
- The documents' own addresses (`/es/404`, `/en/404`) resolve as ordinary objects with 200; acceptable (they are `noindex` and unlinked). muush-foundation **may** answer them with 404 too.
- No redirect: a missing URL answers in place; it never redirects to `/en/404`.

## 3 · Why Stage 2 needs more than configuration

A CloudFront custom error response maps **one error code to one `ResponsePagePath` for the whole distribution** — it cannot choose a page by request path (research R8 F27, INFERRED; muush-foundation to confirm). A CloudFront Function runs before the origin and cannot know whether an object exists (F28, INFERRED). So Stage 1 is the most configuration alone can deliver; the per-prefix choice needs logic after the origin answers, or knowledge at the edge of which paths exist.

## 4 · Stage 2 — the not-found page in the visitor's language (decided, feature 39)

Claim labels: **CONFIRMED** = read in muush-foundation's code (`modules/static-site/main.tf`, `variables.tf`, `functions/request-router.js`, read-only, 2026-10-19) or measured in this repo; **INFERRED** = derived from AWS's documented model, not tested against this distribution; **UNVERIFIED** = must be settled by a test in § 7 before production.

### 4.1 · Mechanism

**Lambda@Edge, origin-response trigger** on the **default (HTML) cache behaviour only** — option A of the feature 36 draft. Roberto's decision (B, 2026-10-19): the language is chosen by CloudFront, not by the client, so there is no flash and it works without JavaScript. Option B (route manifest) is dropped.

- Fires on a cache miss, after S3 answers. It acts **only** when the origin status is `403` or `404` (S3 with OAC answers 403 for a missing key, CONFIRMED in `main.tf`: no `s3:ListBucket`) and the method is `GET` or `HEAD`. Every other response passes through untouched.
- The immutable behaviours (`/_nuxt/*`, `/_fonts/*`, `/_i18n/*`, CONFIRMED in `variables.tf`) get **no** association; their misses keep Stage 1.
- It is a second edge runtime next to `request-router`. muush-foundation's own G-VII.6 ("one edge function") needs a recorded exception for it — Roberto's decision B is the reason; recording it is muush-foundation's step.

### 4.2 · Decision (evaluated in this order; the first rule that yields a locale wins)

```
1. cookie muush_locale == "es" | "en" (exact)        → that locale
2. first path segment == "es"  (uri "/es" or "/es/…") → es
   first path segment == "en"  (uri "/en" or "/en/…") → en
3. CloudFront-Viewer-Country ∈ SPANISH_SPEAKING        → es
   CloudFront-Viewer-Country matches ^[A-Z]{2}$        → en
4. otherwise (header absent, empty or malformed)       → en
```

- **Cookie** — the one written by the site's language toggle, `specs/033-ip-locale-root-redirect/contracts/locale-preference-cookie.md`. Value must equal `es` or `en` **exactly**: `EN`, ` en`, `fr`, `es,en`, empty are ignored as if absent. If the name appears more than once, the first occurrence decides. No other cookie is read. In Lambda@Edge the cookies arrive raw in `request.headers.cookie` (an array of `{ key, value }`, possibly several entries) and must be parsed: split each value on `;`, drop the single leading space of each pair, split on the first `=`, compare name and value exactly (no further trimming — ` en` must stay invalid).
- **Prefix** — segment match, case-sensitive, matching the site's own routing: `/english`, `/enx/…`, `/esx`, `/EN/…`, `/ES/…` are **not** prefixes and fall through to the country rule. The function sees `request.uri` **after** `request-router`'s directory-index rewrite (`/es/abc` → `/es/abc/index.html`); that rewrite only appends, and the canonical 301s run before it, so the first segment is the visitor's (CONFIRMED by reading `request-router.js` job 4; that the origin-response event carries the rewritten URI is INFERRED).
- **Country** — `SPANISH_SPEAKING` is **the list in `specs/033-ip-locale-root-redirect/contracts/edge-root-locale-redirect.md` § 3** (21 codes; `GQ` in, `US` out, gate G5 of feature 33). This contract holds no copy of it. muush-foundation must feed the Lambda from the same single source as `request-router` (e.g. one Terraform local rendered into both files with `templatefile()`), so the two can never drift; editing the list remains a change to that § 3. `Accept-Language` is not used.
- The order differs from `/` (feature 33: cookie > country) only by the prefix step, which `/` does not have.

### 4.3 · Response

```
status: 404   statusDescription: Not Found
content-type: text/html; charset=utf-8
cache-control: private, no-store
x-robots-tag: noindex
body: the bytes of <locale>/404/index.html
```

- **404 in place.** No redirect, no `location`; the address bar keeps the URL the visitor typed. The document is `noindex` already (`<meta name="robots">`), the header repeats it.
- **No `set-cookie`.** The edge never writes, refreshes or deletes the preference. No `vary` (nothing is stored, § 4.5).
- `HEAD` gets the same status and headers.
- The response-headers policy (HSTS, nosniff, referrer, frame options) is still applied by CloudFront to the viewer response (INFERRED).
- **Body source: the bucket.** The function reads `es/404/index.html` / `en/404/index.html` with `s3:GetObject` through its execution role, scoped to exactly those two keys, and may keep them in memory per container for **at most `html_default_ttl_seconds`** (300 s today, CONFIRMED in `variables.tf`) so a deploy becomes visible on the same horizon as every page. Rejected: bundling the HTML into the function package (each muush.dev deploy renames the content-hashed `/_nuxt/` assets the document references, so a bundled copy would point at deleted files until someone redeploys the function) and fetching through CloudFront (a loop through `request-router`, whose canonical rule 301s `/en/404/index.html`).
- **Size**: 19 095 B (es) and 19 013 B (en) on the 2026-10-19 build (CONFIRMED, measured), far below the size limit AWS documents for a response generated in an origin-response trigger (INFERRED; muush-foundation to confirm the current quota).
- **Failure = Stage 1.** Any error (S3 read, parse, timeout budget) returns the origin's response unchanged, so the Stage 1 custom error response serves the English page with 404. An unhandled exception would instead surface as a 5xx to the visitor (INFERRED), so the whole decision and fetch is wrapped. Nothing is logged on failure either.

### 4.4 · What must reach the function

Today (CONFIRMED, `main.tf`): the origin request policy `viewer_country` forwards **`CloudFront-Viewer-Country` only** — `cookies_config.cookie_behavior = "none"` — and the HTML cache policy forwards no cookie and no header. An origin-facing function sees only what is forwarded to the origin (INFERRED from AWS's event model), so today it would see the country but **never the cookie**.

Required change, on the `viewer_country` origin request policy (rename it if muush-foundation wants the name to stay accurate):

| Item | Today | Stage 2 |
|---|---|---|
| `headers_config` | whitelist `CloudFront-Viewer-Country` | unchanged |
| `cookies_config` | `none` | **whitelist `muush_locale`** |
| `query_strings_config` | `none` | unchanged |

- Origin-request-policy values are forwarded but are **not** part of the cache key (INFERRED, AWS's cache-policy / origin-request-policy split). The HTML **cache policy must stay as it is**: no cookie, no header, no query string (feature 33 contract § 5 still applies).
- Side effect: S3 receives the `muush_locale` cookie on cache misses, as it already receives the country (accepted deviation D2 in `main.tf`). S3 ignores both and access logging is off (CONFIRMED, `main.tf` comment).
- ⚠️ This widens the feature 33 cookie contract, whose § 4 says the edge reads the cookie "only at `/`". Amending that line is part of applying this stage — see § 8.

### 4.5 · Caching — a language-dependent 404 must never be served from cache to another visitor

The HTML cache key is the path alone (CONFIRMED: no cookie, header or query in `aws_cloudfront_cache_policy.html`). If a Stage 2 404 were cached, the next visitor to the same missing URL would get the first visitor's language. Two settings together prevent it:

1. **`cache-control: private, no-store`** on every response the function generates. The HTML cache policy has `min_ttl = 0` (CONFIRMED), so CloudFront honours it and does not store the object (INFERRED).
2. **`error_caching_min_ttl = 0`** on the `403` and `404` custom error responses (today `var.error_caching_min_ttl_seconds`, module default 10, CONFIRMED in `variables.tf`; the value set in the live environment is UNVERIFIED here). AWS describes this setting as the *minimum* time an error response stays cached, so a non-zero value can cache the function's 404 for that long whatever its `cache-control` says (INFERRED). The Stage 1 fallback body is the same for everyone, so 0 costs nothing in correctness.

Rejected: adding `muush_locale` and `CloudFront-Viewer-Country` to the cache key. It would fragment the cache of **every** HTML page (≈250 countries × 3 cookie states) to vary only the error page, and feature 33 § 5 forbids it.

Accepted cost: every request for a missing HTML URL reaches S3 and runs the function (plus at most one `GetObject` per container per locale per TTL window). Bot scans of random paths are billed at that rate.

**HTML pages are cached at the edge (Roberto, 2026-10-20, feature 40).** The deploy uploads every non-hashed object (HTML, `_payload.json`, `_i18n/*`, `favicon.svg`) with `cache-control: public,max-age=0,s-maxage=300,must-revalidate` (CONFIRMED, `.github/workflows/deploy.yml`). `max-age=0` + `must-revalidate` keep the browser revalidating every time; `s-maxage=300` is read only by CloudFront, within the HTML cache policy's `max_ttl` 3600 (`min_ttl` 0 and default 300 CONFIRMED above / in `variables.tf`; `max_ttl` 3600 as recorded in feature 40, measured from muush-foundation). Before this every page visit was a miss to S3 and would run this function; now a page miss — and so the function — happens about once per 5 min per path per edge cache (INFERRED). The deploy's `/*` invalidation, the last deploy step, makes a new deploy visible at once.

- **Stage 2 is unchanged.** The function's 404s still carry `private, no-store` and are not cached (point 1 above), and the "Accepted cost" for missing URLs is unchanged: a missing URL has no object to cache, so each request still reaches S3 and the function.
- **404 body lag after a deploy (pre-existing, not introduced by feature 40).** The function's in-memory copy of the 404 body (§ 4.3, up to `html_default_ttl_seconds`) lives in the Lambda container, not in the CloudFront cache, so a `/*` invalidation does not clear it: the 404 text can lag a deploy by up to 300 s (INFERRED).

**Interaction with `custom_error_response` — UNVERIFIED, settled by test E-0 (§ 7).** It is not established here whether CloudFront matches its custom error responses against the origin's status (403) or against the status the function returned (404), nor whether it replaces a function-generated body. The **required outcome** is fixed: when the function succeeds, its body reaches the visitor; when it passes the origin response through, the Stage 1 English page does. If E-0 shows the custom error page replacing the function's body, the candidate fix is to keep only the `403` entry (the normal miss, CONFIRMED) and drop `404` — then re-run E-0. If the 403 entry also overrides it, Stage 2 cannot coexist with a custom error response and muush-foundation must come back to muush.dev before shipping.

### 4.6 · Privacy and logging

- Never read `cf.request.clientIp` or any other IP field.
- No `console.log`/`console.error` anywhere in the function: never log the URI, the cookie, the country or a header. Lambda@Edge writes its logs to CloudWatch in the region of the edge that ran it; only the platform's own START/END/REPORT lines may appear.
- The country and the cookie are used to choose between two documents and discarded; neither is echoed in a header, the body or a log line.

### 4.7 · Reference shape (illustrative, Node.js Lambda@Edge, us-east-1, published version)

Lambda@Edge has no environment variables, so constants are rendered into the source (`templatefile()`); `${…}` below are Terraform placeholders, not JavaScript.

```js
'use strict';
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const BUCKET = '${bucket_name}';
const s3 = new S3Client({ region: '${bucket_region}' });
const PREFERENCE_COOKIE = 'muush_locale';
// Rendered from the single list of feature 33 § 3 — never typed here.
const SPANISH_SPEAKING = ${spanish_speaking_json};
const COUNTRY_SHAPE = /^[A-Z]{2}$/;
const DEFAULT_LOCALE = 'en';
const BODY_TTL_MS = ${html_default_ttl_seconds} * 1000;
const bodies = {}; // locale -> { html, fetchedAt }

function cookieLocale(headers) {
  for (const header of headers.cookie || []) {
    for (const raw of header.value.split(';')) {
      const pair = raw.charAt(0) === ' ' ? raw.slice(1) : raw;
      const eq = pair.indexOf('=');
      if (eq === -1 || pair.slice(0, eq) !== PREFERENCE_COOKIE) continue;
      const value = pair.slice(eq + 1);
      return value === 'es' || value === 'en' ? value : null; // first occurrence decides
    }
  }
  return null;
}

function prefixLocale(uri) {
  const segment = uri.split('/')[1];
  return segment === 'es' || segment === 'en' ? segment : null;
}

function countryLocale(headers) {
  const header = headers['cloudfront-viewer-country'];
  const country = header && header[0] && header[0].value;
  if (!country || !COUNTRY_SHAPE.test(country)) return DEFAULT_LOCALE;
  return SPANISH_SPEAKING.indexOf(country) !== -1 ? 'es' : 'en';
}

async function notFoundBody(locale) {
  const cached = bodies[locale];
  if (cached && Date.now() - cached.fetchedAt < BODY_TTL_MS) return cached.html;
  const object = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: locale + '/404/index.html' }));
  const html = await object.Body.transformToString('utf-8');
  bodies[locale] = { html, fetchedAt: Date.now() };
  return html;
}

exports.handler = async (event) => {
  const { request, response } = event.Records[0].cf;
  const isMiss = response.status === '403' || response.status === '404';
  const isRead = request.method === 'GET' || request.method === 'HEAD';
  if (!isMiss || !isRead) return response;

  try {
    const locale = cookieLocale(request.headers) || prefixLocale(request.uri) || countryLocale(request.headers);
    return {
      status: '404',
      statusDescription: 'Not Found',
      headers: {
        'content-type': [{ key: 'Content-Type', value: 'text/html; charset=utf-8' }],
        'cache-control': [{ key: 'Cache-Control', value: 'private, no-store' }],
        'x-robots-tag': [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      body: await notFoundBody(locale),
    };
  } catch {
    return response; // Stage 1 takes over. Nothing is logged.
  }
};
```

Infrastructure this implies (muush-foundation's to specify): the function in **us-east-1**, associated by **published version ARN** on `default_cache_behavior` as `origin-response` (`include_body = false`); an execution role trusted by `lambda.amazonaws.com` and `edgelambda.amazonaws.com` with `s3:GetObject` on the two keys only (same account, SSE-S3, so no KMS grant — INFERRED) and CloudWatch Logs; a short timeout (a few seconds) and the smallest memory size.

### 4.8 · What the site does (feature 39, already in muush.dev)

- Whatever document arrives, it **hydrates in that document's language**, at any URL: `es/404` served at `/fr/abc` stays Spanish, `en/404` at `/es/abc` stays English, no hydration mismatch (feature 36 rule, re-verified in headless Chrome on 2026-10-19).
- On the not-found page the ES/EN toggle switches the language **in place** (same URL, no reload), writes `muush_locale` exactly as on every page, and the page's links, nav and footer follow the chosen locale. Its `href` stays the other locale's home for no-JS visitors. So after a toggle a reload of the same missing URL comes back in the chosen language — rule 1 above.
- The site needs nothing new from the edge for this; it works with Stage 1 too. Either side can ship first.

## 5 · Headers (both stages)

| Header | Stage 1 (custom error response) | Stage 2 (function-generated) |
|---|---|---|
| `content-type` | `text/html; charset=utf-8` | same |
| `cache-control` | what the HTML object carries — `public,max-age=0,s-maxage=300,must-revalidate` since feature 40 (§ 4.5); never `immutable` | **`private, no-store`** (§ 4.5) |
| `x-robots-tag` | `noindex` (optional) | `noindex` |
| `set-cookie` | none | **none** |
| `location` | none | **none** |

## 6 · Rollout order

Stage 1 (done, kept for the record):

1. **Before anything**: read the current distribution config (`aws cloudfront get-distribution-config`) and record whether any custom error response points at `/200.html` or `/404.html` (spec A-06, research F18 — UNVERIFIED today).
2. Deploy muush.dev with feature 36 (the new keys exist from this moment).
3. Apply Stage 1 (§ 2).
4. If step 1 found a reference to `/200.html` or `/404.html` **and** the deploy deletes removed keys (`s3 sync --delete`), do steps 2 and 3 back-to-back, or deploy once without `--delete` and remove the two keys after step 3.

Stage 2 (no muush.dev deploy required — both documents exist since feature 36):

1. Amend the feature 33 cookie contract § 4 (§ 8 below) — Roberto.
2. In muush-foundation: the function, its role, the origin request policy cookie whitelist (§ 4.4) and `error_caching_min_ttl = 0` (§ 4.5), through its own spec and gates (G-VII.6 exception recorded).
3. Run the function-level cases L-* (§ 7) with Lambda console test events **before** associating it.
4. Associate it, keep the Stage 1 custom error responses (or the 403-only variant if E-0 requires it), then run E-0 and the live checks V-*.
5. Rollback: remove the association. Stage 1 serves English for every miss again; the site is unaffected.

## 7 · Verification muush-foundation owns

### Stage 1 (live since v1.0.12)

| Request | Expect |
|---|---|
| `https://muush.dev/en/no-existe` | `404`, `lang="en-US"`, `We couldn't find this page.` |
| `https://muush.dev/es/no-existe` | `404`, `lang="en-US"` (English, by G5) |
| `https://muush.dev/xyz`, `/en/about/zzz`, `/200.html`, `/404.html` | `404`, `lang="en-US"` |
| `https://muush.dev/es`, `/en`, `/es/nosotros`, `/en/about`, `/` | unchanged |
| `https://muush.dev/en/404/_payload.json` | `200`, JSON |

### Stage 2 · function cases (Lambda console, origin-response test event; origin status `403` unless noted)

`uri` is what the function receives (after the rewrite). "→ es/en" means `404` with that document's body (`lang="es-MX"` / `lang="en-US"`).

| # | Cookie header(s) | `cloudfront-viewer-country` | `uri` | Expect |
|---|---|---|---|---|
| L-1 | `muush_locale=es` | `US` | `/en/abc/index.html` | → **es** (cookie beats prefix) |
| L-2 | `muush_locale=en` | `MX` | `/es/abc/index.html` | → **en** (cookie beats prefix and country) |
| L-3 | `muush_locale=es` | `US` | `/xyz/index.html` | → es |
| L-4 | — | `US` | `/es/abc/index.html` | → **es** (prefix beats country) |
| L-5 | — | `MX` | `/en/abc/index.html` | → **en** (prefix beats country) |
| L-6 | — | absent | `/es/about/zzz/index.html` | → es |
| L-7 | — | `MX`; then `GQ`; then each other code of the feature 33 list | `/fr/abc/index.html` | → es (one case per code) |
| L-8 | — | `US`, `BR`, `FR`, `JP`, `CA` | `/fr/abc/index.html` | → en (`US` excluded at feature 33 G5) |
| L-9 | — | absent; `""`; `mx`; `MEX`; `M1` | `/xyz/index.html` | → en |
| L-10 | — | `US` | `/esx/abc/index.html`, `/ES/abc/index.html`, `/espanol/index.html` | → en (not a prefix; country) |
| L-11 | — | `MX` | `/EN/abc/index.html`, `/english/index.html` | → es (not a prefix; country) |
| L-12 | `muush_locale=EN`; `muush_locale= en`; `muush_locale=fr`; `muush_locale=` (each) | `MX` | `/xyz/index.html` | → es (cookie ignored; country) |
| L-13 | `muush_locale=fr` | `MX` | `/en/abc/index.html` | → en (cookie ignored; prefix) |
| L-14 | `a=1; muush_locale=en; b=2`, and the same split across two `cookie` entries | `MX` | `/es/abc/index.html` | → en |
| L-15 | — | `MX` | `/es/abc/index.html`, origin status `404` | → es |
| L-16 | — | `MX` | origin status `200` and `304` | response returned **unchanged** |
| L-17 | — | `MX` | method `HEAD`, `/es/abc/index.html` | `404`, es headers |
| L-18 | role without `s3:GetObject` (staging) | `MX` | `/es/abc/index.html` | origin response unchanged (→ Stage 1, English 404), never 5xx |
| L-19 | every case above that generates | — | — | headers exactly § 4.3: `cache-control: private, no-store`, `content-type`, `x-robots-tag`; **no** `set-cookie`, `location`, `vary` |

### Stage 2 · live checks

| # | Command | Expect |
|---|---|---|
| E-0 | `curl -s https://muush.dev/es/e0-$RANDOM -H 'Cookie: muush_locale=es' \| grep -o 'lang="[^"]*"'` — and the same with `muush_locale=en` on `/xyz-$RANDOM` | `lang="es-MX"` then `lang="en-US"`, both `404`. If the first is `en-US`, the custom error response overrode the function — § 4.5 |
| V-1 | `curl -s -o /dev/null -w '%{http_code}' https://muush.dev/es/no-existe` (no cookie) | `404`, body `lang="es-MX"`, `No encontramos esta página.` |
| V-2 | `curl -s -H 'Cookie: muush_locale=en' https://muush.dev/es/no-existe` | `404`, `lang="en-US"` |
| V-3 | `curl -s -H 'Cookie: muush_locale=es' https://muush.dev/xyz` | `404`, `lang="es-MX"` |
| V-4 | from a Spanish-speaking location (or VPN), no cookie: `/fr/abc`, then `/en/no-existe` | `es-MX`, then `en-US` (prefix beats country) |
| V-5 | from a non-Spanish-speaking location, no cookie: `/fr/abc` | `en-US` |
| V-6 | **cache**: one fresh missing URL `U=/fr/cache-$RANDOM`; request it 6 times alternating `muush_locale=es` / `en` | language follows **every** request; `cache-control: private, no-store`; `x-cache` never `Hit from cloudfront` |
| V-7 | `curl -sI` on any 404 above | no `location`, no `set-cookie`, no `vary` |
| V-8 | `/es`, `/en`, `/es/nosotros`, `/en/about` twice each | `200`, `cache-control: public,max-age=0,s-maxage=300,must-revalidate` (the S3 object header, feature 40) and no `private, no-store`, second request `Hit from cloudfront` with `age` (HTML cache key unchanged) |
| V-9 | `/`, with and without cookie | unchanged feature 33 302 |
| V-10 | `/en/404/_payload.json`, `/_i18n/…/messages.json` used by the page | `200` |
| V-11 | `/_nuxt/does-not-exist.js` | unchanged (Stage 1 behaviour of the immutable behaviours) |
| V-12 | CloudWatch log groups of the function (every region that served V-*) | only START/END/REPORT lines; no IP, cookie, country or URI |
| V-13 | Browser, clean profile, from a non-Spanish-speaking location: open `/es/no-existe` | Spanish; address bar unchanged; click `ES` → English **without reload or URL change**; reload → English (cookie) |

## 8 · Change control

- Moving or renaming `en/404/index.html` / `es/404/index.html`, adding a locale, or changing the prefix rule, the rule order of § 4.2 or the Stage 1 language is a breaking change on both sides and needs a new muush.dev spec.
- The country list is **not** edited here: it is § 3 of the feature 33 root-redirect contract, and a change there applies to both functions.
- **`specs/033-ip-locale-root-redirect/contracts/locale-preference-cookie.md` § 4 is amended** (Roberto, 2026-10-20, feature 39): the edge reads `muush_locale` at `/` and in the origin-response function of § 4 of this contract, still never setting it and never putting it in a cache key. A further reader of that cookie is a change to that contract, not to this one.
