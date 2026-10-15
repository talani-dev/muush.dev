# Edge contract: `GET /__geo` (deliverable for muush-foundation)

**From**: muush.dev feature 32 `whatsapp_dial_code_selector`, Amendment A1
(`specs/032-whatsapp-dial-code-selector/spec.md`)
**To**: muush-foundation, module `static-site`, function `request-router`
**Status**: approved by Roberto on 2026-10-14 (spec Amendment A1, row IP-1). muush-foundation
specifies, reviews and applies it through its own harness; nothing here
edits that repository.

## 1 · Purpose

Tell the page, same-origin, the **country** CloudFront computed for the
current viewer, so the WhatsApp dial-code selector can preselect it. Country
level only. The site falls back to Mexico whenever this contract is not
met, so the contract can ship before, after, or never.

## 2 · Request (what the site sends)

```
GET /__geo HTTP/1.1
Host: muush.dev
```

- Relative URL from the page; same origin; no query string, no body, no
  custom header, no credentials (`credentials: 'omit'`), `cache: 'no-store'`.
- Sent at most once per page load, only after the visitor interacts with a
  form. The site aborts after **3000 ms**.

## 3 · Response (what the edge returns)

Generated **by the existing viewer-request function `request-router`**,
never by the origin, never cached.

| Situation | Status | Body (exact bytes) |
|---|---|---|
| `cloudfront-viewer-country` present and matches `^[A-Z]{2}$` | `200` | `{"country":"MX"}` (the header value) |
| Header absent, empty, or any other shape | `200` | `{"country":null}` |

Headers on both:

| Header | Value | Why |
|---|---|---|
| `content-type` | `application/json; charset=utf-8` | The site parses JSON |
| `cache-control` | `no-store` | Per viewer; no browser or shared cache may keep it |
| `x-robots-tag` | `noindex` | Optional; keeps a technical URL out of search results |

Rules:

- **Exact path match** on `request.uri === "/__geo"` (case-sensitive; `/__geo/`
  and `/__geo.json` are not part of the contract and fall through to the
  existing behaviour, i.e. the 404 page).
- **Order inside the function**: after the `www` → apex 301 branch, before
  the directory-index rewrite (the rewrite would otherwise turn `/__geo`
  into `/__geo/index.html`).
- Methods: `GET` and `HEAD` MUST be answered as above. Other methods allowed
  by the behaviour (`OPTIONS`) may receive the same response; the site
  never sends them.
- Query string ignored.
- **The body carries the country and nothing else.** Never the IP
  (`event.viewer.ip`), city, region, postal code, ASN, coordinates or time
  zone. No `console.log` of the IP or the country.
- No `Set-Cookie`.
- No validation against a country list at the edge (the list lives in the
  site); only the two-letter uppercase shape.
- `{"country":null}` is the **only** "no data" form: no `204`, no `404`, no
  empty body. (The site also tolerates all of those, as Mexico.)

Reference shape (illustrative, runtime `cloudfront-js-2.0`, string
concatenation only because the file goes through `templatefile()`):

```js
var GEO_PATH = "/__geo";
var COUNTRY_SHAPE = /^[A-Z]{2}$/;

function geoResponse(request) {
  var header = request.headers["cloudfront-viewer-country"];
  var value = header && header.value;
  var country = value && COUNTRY_SHAPE.test(value) ? value : null;

  return {
    statusCode: 200,
    statusDescription: "OK",
    headers: {
      "content-type": { value: "application/json; charset=utf-8" },
      "cache-control": { value: "no-store" }
    },
    body: JSON.stringify({ country: country })
  };
}

// in handler(), after the www branch and before the rewrite:
// if (request.uri === GEO_PATH) { return geoResponse(request); }
```

## 4 · Distribution configuration

- **Still one edge function** (G-VII.6): the branch lives in
  `request-router`; no viewer-response function, no Lambda@Edge.
- **Header availability is UNVERIFIED for CloudFront Functions without a
  policy** (research R11.1 F4). Preferred configuration, safe either way:
  an ordered cache behaviour `path_pattern = "/__geo"` with
  `Managed-CachingDisabled`, an origin request policy whose only header is
  `CloudFront-Viewer-Country`, the existing response-headers policy, and a
  `viewer-request` association to **the same** `request-router` ARN. If
  verification proves the header present without it, the behaviour is
  optional.
- **MUST NOT** add `CloudFront-Viewer-Country` (or any header) to the HTML
  cache policy: it would split every page into ~250 cache entries.
- The new behaviour, if added, differs from the immutable ones by its
  policies, not only by path, so it does not belong in
  `var.immutable_path_patterns` (muush-foundation's call under its Gate VII).

## 5 · Verification muush-foundation owns

1. CloudFront function test console (`TestFunction`) cases: header `MX` →
   `{"country":"MX"}`; header absent → `{"country":null}`; header `mx`,
   `MEX`, `"M1"`, `""` → `{"country":null}`; `www` host + `/__geo` → 301 to
   apex (unchanged); every pre-existing case of the function unchanged
   (`/`, `/es`, `/es/`, `/en/about`, `/_nuxt/x.js`). A defect in this branch
   affects **every** path the function serves, so the regression cases are
   mandatory, not optional.
2. After apply: `curl -si https://muush.dev/__geo` from a known location
   returns `200`, `cache-control: no-store`, and the correct country (not
   `null`). If `null` everywhere, the header is not reaching the function:
   apply § 4's behaviour.
3. `curl -sI https://muush.dev/es/` still has an empty cache key behaviour
   (no new `Vary`, unchanged hit ratio).

## 6 · Privacy statement

CloudFront already receives the viewer's IP to serve the site. The country is
derived inside AWS; this contract returns the country and nothing else to
the same viewer; the page keeps it in memory for the page load only and
never sends it anywhere (the Form Submission API receives only the dial code
the visitor confirms, as in feature 32). No third party is involved.

## 7 · Change control

Changing the path, the JSON key, the "no data" form or the cache header is a
breaking change for muush.dev and requires a new spec on both sides. Adding
fields is **not** allowed without a muush.dev spec (country-only by design).
