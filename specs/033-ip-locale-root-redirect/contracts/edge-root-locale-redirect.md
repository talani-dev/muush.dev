# Edge contract: `/` → locale by preference and country (deliverable for muush-foundation)

**From**: muush.dev feature 33 `ip_locale_root_redirect` (`specs/033-ip-locale-root-redirect/spec.md`)
**To**: muush-foundation, module `static-site`, viewer-request function `request-router`
**Owner**: **Roberto, to apply.** Nothing here edits, deploys or tests muush-foundation. muush-foundation specifies, reviews and applies it through its own harness and gates, including G-VII.6 ("one edge function").
**Status**: **Agreed at the feature 33 gate (Roberto, 2026-10-15).** Every *(G#)* value below is the approved answer (spec § Gate — human approval).

## 1 · Purpose

Answer a request for the bare root `/` with a temporary redirect to `/es` or `/en`, chosen by:

1. the visitor's explicit preference (cookie written by the site's language toggle, `contracts/locale-preference-cookie.md`), else
2. the country CloudFront derives for the viewer, else
3. the default locale *(G2: `en`)*.

It **replaces** the current fixed 301 `/` → `https://muush.dev/en` (§ 6). Nothing else changes.

## 2 · Matching

- **Exactly** `request.uri === "/"`, case-sensitive. `/index.html`, `/es`, `/en`, `/es/`, every sub-path, `/__geo`, `/sitemap.xml`, `/robots.txt`, `/_nuxt/*`, `/_fonts/*` and every missing path (feature 36's not-found responses) are **not** matched and keep their current behaviour.
- Methods: `GET` and `HEAD`. Any other method falls through to the existing behaviour.
- **Order inside `request-router`**: after the `www` → apex 301 branch, after the `/__geo` branch, before the directory-index rewrite (the rewrite would otherwise turn `/` into `/index.html`).

## 3 · Decision

```
cookie muush_locale == "es"                → /es
cookie muush_locale == "en"                → /en
country ∈ SPANISH_SPEAKING                 → /es
country matches ^[A-Z]{2}$ (not in list)   → /en
otherwise (absent, empty, malformed)       → /<DEFAULT_LOCALE>      (G2: "en")
```

- The cookie value must equal `es` or `en` **exactly**. Any other value (`EN`, ` en`, `fr`, `es,en`, empty) is ignored, as if absent.
- Only the `muush_locale` cookie is read. No other cookie or header influences the result. `Accept-Language` is **not** used.

**`SPANISH_SPEAKING` — the single authoritative list** *(G5, G6)*. Uppercase ISO 3166-1 alpha-2:

```
AR BO CL CO CR CU DO EC ES GQ GT HN MX NI PA PE PR PY SV UY VE
```

21 codes. G5 (2026-10-15): **`GQ`** (Equatorial Guinea) **included**; **`US`** **excluded** (→ `/en`). Also excluded on purpose: `BZ`, `AD`, `GI`, `EH`, `PH` (research R7). The site holds no copy of this list. Changing it is a change to this section, applied in the function.

## 4 · Response

```
HTTP/1.1 302 Found
location: /en?utm_source=card          (path + "?" + original query, only if one was present)
cache-control: private, no-store
x-robots-tag: noindex                  (optional)
```

- **Status 302.** Never 301/308 (research R3, R4).
- **`location`**: relative path `/es` or `/en`, no trailing slash, followed by `?` and the original query string when the request had one. The query is rebuilt from `request.querystring` preserving every key and every value of multi-value keys. INFERRED: values arrive still URL-encoded in `cloudfront-js-2.0`. Cases R-8/R-9 confirm or refute. If they arrive decoded, encode them with `encodeURIComponent`.
- **`cache-control: private, no-store`.** No `Vary` (research R4: nothing is stored, so nothing varies).
- **No body. No `set-cookie`.** The edge never writes the preference.
- **Privacy**: never read `event.viewer.ip`. Never put the country, the cookie or the IP in a header, body or log line. No `console.log` in this branch.

Reference shape (illustrative, runtime `cloudfront-js-2.0`, ES5 string concatenation because the file goes through `templatefile()`):

```js
var ROOT_PATH = "/";
var DEFAULT_LOCALE = "en"; // G2
var PREFERENCE_COOKIE = "muush_locale";
var SPANISH_SPEAKING = ["AR","BO","CL","CO","CR","CU","DO","EC","ES","GQ",
                        "GT","HN","MX","NI","PA","PE","PR","PY","SV","UY",
                        "VE"]; // G5
var COUNTRY_SHAPE = /^[A-Z]{2}$/;

function preferredLocale(request) {
  var cookie = request.cookies && request.cookies[PREFERENCE_COOKIE];
  var value = cookie && cookie.value;
  return value === "es" || value === "en" ? value : null;
}

function countryLocale(request) {
  var header = request.headers["cloudfront-viewer-country"];
  var country = header && header.value;
  if (!country || !COUNTRY_SHAPE.test(country)) return DEFAULT_LOCALE;
  return SPANISH_SPEAKING.indexOf(country) !== -1 ? "es" : "en";
}

function rootQuery(querystring) {
  var parts = [];
  for (var key in querystring) {
    var entry = querystring[key];
    var values = entry.multiValue ? entry.multiValue : [entry];
    for (var i = 0; i < values.length; i++) {
      parts.push(values[i].value === "" ? key : key + "=" + values[i].value);
    }
  }
  return parts.length ? "?" + parts.join("&") : "";
}

function rootRedirect(request) {
  var locale = preferredLocale(request) || countryLocale(request);
  return {
    statusCode: 302,
    statusDescription: "Found",
    headers: {
      "location": { value: "/" + locale + rootQuery(request.querystring) },
      "cache-control": { value: "private, no-store" }
    }
  };
}

// in handler(), after the www branch and the /__geo branch, before the rewrite:
// if (request.uri === ROOT_PATH && (request.method === "GET" || request.method === "HEAD")) {
//   return rootRedirect(request);
// }
```

> `?flag` with no value vs `?flag=`: the reference emits `flag` for both. Accepted: neither form exists in the site's own links.

## 5 · Distribution configuration

- **Still one edge function.** No viewer-response function, no Lambda@Edge.
- **Country header at `/`**: if § 7 case R-1 returns the G2 default from a Spanish-speaking location, the header is not reaching the function. Fix it by adding `CloudFront-Viewer-Country` to an **origin-request policy** on the default (HTML) behaviour. That does not change the cache key.
- **MUST NOT** add `CloudFront-Viewer-Country`, `Cookie`/`muush_locale` or any new header to the **cache policy** of any behaviour. It would fragment the HTML cache, and it is unnecessary: the redirect is generated before the cache (research R1 F2).
- Cookies: no change to cookie forwarding is needed for the function to read them (research R1 F3; confirmed by R-10).

## 6 · Rollout (replacing today's 301)

0. **Record the current state** (research R3). `curl -sI https://muush.dev/` (status, `location`, `cache-control`, `expires`, `age`, `x-cache`), and find where the 301 is configured: a `request-router` branch, a distribution setting or an S3 redirect rule. Note both in muush-foundation's own spec. If there is no 301 today, skip to 1.
1. Run the `TestFunction` cases of § 7 against the updated function **before** publishing.
2. Publish the function and remove the old 301 **in the same change**, so `/` never answers 301 → 302 (spec FR-022).
3. Run § 7's live checks.
4. Residue to accept (G7): browsers that cached the old 301 keep going to `/en` without asking the edge until their HTTP cache drops the entry. Nothing server-side can reach them, and they already get English.

No dependency on a muush.dev deploy: the cookie is simply absent until the site ships the toggle change, and the rule then falls through to the country. Either side can ship first.

## 7 · Test cases (muush-foundation owns these)

### TestFunction console — `/` cases (all `GET` unless noted)

| # | Cookie `muush_locale` | `cloudfront-viewer-country` | Query | Expect |
|---|---|---|---|---|
| R-1 | — | `MX` | — | 302 `location: /es` |
| R-2 | — | each of the 20 other listed codes (including `GQ`) | — | 302 `/es` (one case per code) |
| R-3 | — | `US`, `BR`, `FR`, `JP`, `CA` | — | 302 `/en` (`US` excluded at G5) |
| R-4 | — | absent | — | 302 `/en` (G2) |
| R-5 | — | `mx`, `MEX`, `M1`, `""` | — | 302 `/en` (G2) |
| R-6 | `en` | `MX` | — | 302 `/en` |
| R-7 | `es` | `US` | — | 302 `/es` |
| R-8 | — | `AR` | `utm_source=card&x=a%20b` | 302 `/es?utm_source=card&x=a%20b` |
| R-9 | — | `DE` | `a=1&a=2` | 302 `/en?a=1&a=2` |
| R-10 | `EN`, ` en`, `fr`, `` (each) | `MX` | — | 302 `/es` (cookie ignored) |
| R-11 | `en` plus unrelated cookies | `MX` | — | 302 `/en` |
| R-12 | — | `MX` | — | `HEAD` → 302 `/es` |
| R-13 | — | `MX` | — | every case: `cache-control: private, no-store`; no `set-cookie`; no body; no `vary` |

### TestFunction console — regression (MANDATORY; a defect here affects every path)

| # | Request | Expect |
|---|---|---|
| N-1 | `/es`, `/es/`, `/en`, `/en/about`, `/es/nosotros` with country `MX` and cookie `en` | unchanged (no redirect from this branch) |
| N-2 | `/index.html` with country `US` | unchanged |
| N-3 | `/__geo` | unchanged (feature 32 contract) |
| N-4 | `/_nuxt/x.js`, `/_fonts/x.woff2`, `/sitemap.xml`, `/robots.txt` | unchanged |
| N-5 | `/es/no-existe`, `/xyz` | unchanged (falls through to the origin, then feature 36's error responses) |
| N-6 | host `www.muush.dev`, uri `/` | 301 to apex (unchanged; the apex request then hits R-*) |
| N-7 | `OPTIONS /` | unchanged |

### Live checks after publishing

| # | Command | Expect |
|---|---|---|
| V-1 | `curl -sI https://muush.dev/` from a known non-Spanish-speaking location | `302`, `location: /en`, `cache-control: private, no-store` |
| V-2 | `curl -sI -H 'Cookie: muush_locale=es' https://muush.dev/` | `302`, `location: /es` |
| V-3 | V-1 repeated three times | never `x-cache: Hit from cloudfront` (generated before the cache) |
| V-4 | `curl -sI https://muush.dev/es` and `/en` | `200`, same `cache-control` and cache behaviour as before (no new `vary`) |
| V-5 | `curl -s -o /dev/null -w '%{http_code}' https://muush.dev/es/no-existe` | `404` (feature 36 unchanged) |
| V-6 | Browser: open `https://muush.dev/#servicios` | lands on `/<locale>#servicios` (the browser re-attaches the fragment) |
| V-7 | From a Spanish-speaking location (or VPN), clean profile | `/` → `/es`; click the toggle; type `muush.dev` again → `/en` |
| V-8 | CloudWatch logs of the function after V-1..V-7 | no IP, country or cookie value logged by this branch |

## 8 · Privacy statement

CloudFront already receives the viewer's IP to serve the site. The country is derived inside AWS, used to choose between two URLs, and discarded. The cookie holds `es` or `en` and nothing else. Neither is logged, stored, returned or forwarded. No third party is involved.

## 9 · Change control

Changing the cookie name or its values, the matched path, the status code, the cache header or the meaning of the list is a breaking change for muush.dev and needs a new spec on both sides. Editing the list in § 3 is a business decision (Roberto) recorded in this file first.
