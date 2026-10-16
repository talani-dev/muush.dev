# Edge contract: serving the not-found pages (deliverable for muush-foundation)

**From**: muush.dev feature 36 `not_found_page` (`specs/036-not-found-page/spec.md`, decisions D2–D3, gate G5)
**To**: muush-foundation, module `static-site` (CloudFront distribution in front of the S3 origin with OAC; viewer-request function `request-router`)
**Owner**: **Roberto — to apply.** Nothing here edits, deploys or tests muush-foundation. muush-foundation specifies, reviews and applies it through its own harness and gates (including its G-VII.6 "one edge function" rule).
**Status**: **Stage 1 agreed** by Roberto at the feature 36 gate (2026-10-15). Stage 2 deferred to muush-foundation.

## 1 · What muush.dev ships (after feature 36 deploys)

| Object key | Language | Purpose |
|---|---|---|
| `en/404/index.html` | English (`en-US`) | **Stage 1: the not-found page for every missing path.** Stage 2: for `/en`, `/en/*` |
| `es/404/index.html` | Spanish (`es-MX`) | Stage 1: built, not referenced by the edge. Stage 2: for `/es` and `/es/*` only |
| `en/404/_payload.json`, `es/404/_payload.json` | — | fetched by the page itself once interactive (same origin, normal 200) |

Both documents are self-contained (assets under `/_nuxt/`, `/_fonts/` as for every page), carry `<meta name="robots" content="noindex">`, no canonical and no hreflang. Once interactive they keep the visitor's URL in the address bar and stay in their own language whatever URL they are served at (verified, `research.md` R1 F8, F10).

**No longer shipped**: `200.html` and `404.html` at the bucket root (`research.md` R2).

## 2 · Stage 1 — the agreed rollout (configuration only)

### Required behaviour

For a request whose object does not exist in the bucket (S3 with OAC answers **403**; a public/website origin would answer **404** — both apply):

| Request path | Response status | Response body |
|---|---|---|
| **any** missing path (`/en/…`, `/es/…`, `/xyz`, `/fr/abc`, `/200.html`, …) | **404** | bytes of `en/404/index.html` |

> ⚠️ **Deliberate divergence, Roberto's decision (gate G5, 2026-10-15).** The site's default locale is Spanish (`i18n.defaultLocale: 'es'`, `x-default` → `/es`, root `/` → `/es`). Stage 1 nevertheless serves the **English** document for every missing path, including Spanish and unprefixed ones. This is an explicit human decision for the interim, not a mistake to "correct" against the site's defaults. Stage 2 restores the per-prefix choice with **English** as fallback for every path not under `/es` (gate G6, Roberto, 2026-10-15).

### Configuration

```text
CustomErrorResponses:
  - ErrorCode: 403   ResponsePagePath: /en/404/index.html   ResponseCode: 404   ErrorCachingMinTTL: 60
  - ErrorCode: 404   ResponsePagePath: /en/404/index.html   ResponseCode: 404   ErrorCachingMinTTL: 60
```

- The `ResponsePagePath` request must reach S3 through a behaviour that serves `en/404/index.html` as-is (the key exists; `request-router`'s directory-index rewrite should not touch a path ending in `.html` — muush-foundation to confirm).
- `ErrorCachingMinTTL` 60 s (suggested) so a page published after an error was cached becomes visible quickly.

### Rules common to both stages

- `content-type: text/html; charset=utf-8` on the error response.
- Existing objects are unaffected: `/es`, `/en`, `/es/nosotros`, `/en/about`, `/`, `/robots.txt`, `/sitemap.xml`, `/_nuxt/*`, `/_fonts/*`, `/__geo` keep their current status and body.
- Missing **assets** under `/_nuxt/*`, `/_fonts/*` may receive the 404 document or a bare 404; either is acceptable to the site. Preference: bare 404 if the immutable behaviours make that simpler.
- The documents' own addresses (`/es/404`, `/en/404`) resolve as ordinary objects with 200; acceptable (they are `noindex` and unlinked). muush-foundation **may** answer them with 404 too.
- No redirect: a missing URL answers in place; it never redirects to `/en/404`.

## 3 · Why Stage 2 needs more than configuration

A CloudFront custom error response maps **one error code to one `ResponsePagePath` for the whole distribution** — it cannot choose a page by request path (research R8 F27, INFERRED; muush-foundation to confirm). A CloudFront Function runs before the origin and cannot know whether an object exists (F28, INFERRED). So Stage 1 is the most configuration alone can deliver; the per-prefix choice needs logic after the origin answers, or knowledge at the edge of which paths exist.

## 4 · Stage 2 — deferred to muush-foundation (target behaviour, mechanism open)

| Request path | Status | Body |
|---|---|---|
| `/en` exactly, or starting with `/en/` | 404 | `en/404/index.html` |
| `/es` exactly, or starting with `/es/` | 404 | `es/404/index.html` |
| any other path (`/xyz`, `/fr/abc`, `/enx`, `/EN/…`) | 404 | `en/404/index.html` (gate G6: English fallback for not-found, not the site's default locale) |

Prefix match is on the **path segment**, case-sensitive (`/english`, `/enx`, `/EN/…`, `/esx` → English, the G6 fallback), matching the site's own routing.

| Option | How | Trade-off |
|---|---|---|
| **A · Lambda@Edge, origin-response** on the HTML (default) behaviour | On origin 403/404, choose the document from `request.uri`, return its body with 404. Stage 1 stays as the safety net. | Exact; adds a second edge runtime (G-VII.6 — muush-foundation's call), IAM role, us-east-1. |
| **B · Route manifest at the edge** | `request-router` knows the site's page routes (KeyValueStore or templated list from this repo's build) and rewrites unknown HTML paths to `/<locale>/404/index.html`; a viewer-response step sets 404. | No origin-side code, but a manifest to keep in sync per deploy and a second function association. |

Any mechanism that produces the table above satisfies Stage 2. When it ships, Stage 1's `ResponsePagePath` stays `/en/404/index.html` as the safety net (gate G6).

## 5 · Headers

| Header | On the 404 responses | Why |
|---|---|---|
| `content-type` | `text/html; charset=utf-8` | HTML document |
| `cache-control` | what the HTML behaviour already sends; never `immutable` | A 404 can stop being one when a page is published |
| `x-robots-tag` | `noindex` (optional) | The document already says it |

No `Set-Cookie`.

## 6 · Rollout order (because `200.html`/`404.html` disappear)

1. **Before anything**: read the current distribution config (`aws cloudfront get-distribution-config`) and record whether any custom error response points at `/200.html` or `/404.html` (spec A-06, research F18 — UNVERIFIED today).
2. Deploy muush.dev with feature 36 (the new keys exist from this moment).
3. Apply Stage 1 (§ 2).
4. If step 1 found a reference to `/200.html` or `/404.html` **and** the deploy deletes removed keys (`s3 sync --delete`), do steps 2 and 3 back-to-back, or deploy once without `--delete` and remove the two keys after step 3.

## 7 · Verification muush-foundation owns

After Stage 1 (`curl -s -o /dev/null -w '%{http_code}'` plus a body check):

| Request | Expect (Stage 1) | Expect (Stage 2) |
|---|---|---|
| `https://muush.dev/en/no-existe` | `404`, `lang="en-US"`, `We couldn't find this page.` | same |
| `https://muush.dev/es/no-existe` | `404`, `lang="en-US"` (English, by G5) | `404`, `lang="es-MX"`, `No encontramos esta página.` |
| `https://muush.dev/xyz` | `404`, `lang="en-US"` | `404`, `lang="en-US"` |
| `https://muush.dev/en/about/zzz` | `404`, `lang="en-US"` | same |
| `https://muush.dev/200.html`, `/404.html` | `404`, `lang="en-US"` (keys gone) | `404`, `lang="en-US"` |
| `https://muush.dev/es`, `/en`, `/es/nosotros`, `/en/about`, `/` | unchanged | unchanged |
| `https://muush.dev/en/404/_payload.json` | `200`, JSON | same |

In a browser: open `/es/no-existe`; the address bar keeps `/es/no-existe`, the page is English (Stage 1), its language button leads to `/es`, the console is clean.

## 8 · Change control

Moving or renaming `en/404/index.html` / `es/404/index.html`, adding a locale, changing the prefix rule or the Stage 1 language is a breaking change on both sides and needs a new muush.dev spec.
