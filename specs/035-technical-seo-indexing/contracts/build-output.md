# Contract: what `pnpm generate` must write (feature 35)

The site's external interface is the set of files in `.output/public`. These are the assertions the tests and the reviewer check. Values in `«»` are the gate-approved copy.

## 1. Each page document — `es/index.html`, `en/index.html`, `es/nosotros/index.html`, `en/about/index.html`

Exactly once per document unless stated:

| Element | Expected |
|---|---|
| `<html lang>` | `es-MX` (es pages) / `en-US` (en pages) |
| `<title>` | «title» for that page and locale, ends with ` · muush` |
| `<meta name="description">` | «description» |
| `<link rel="canonical">` | absolute, `https://muush.dev/<path>` of the page itself |
| `<link rel="alternate" hreflang="es-MX">` | the Spanish counterpart |
| `<link rel="alternate" hreflang="en-US">` | the English counterpart |
| `<link rel="alternate" hreflang="x-default">` | the Spanish counterpart |
| `hreflang="es"`, `hreflang="en"` | at most once each (i18n catch-alls; spec A-04) |
| `og:url` | equals canonical |
| `og:locale` | `es_MX` / `en_US` |
| `og:title` / `og:description` | equal to `<title>` / description |
| `og:type` | `website` |
| `og:site_name` | `muush` |
| `twitter:card` | `summary` while `SHARE_IMAGE.url` is `null` |
| `og:image`, `twitter:image` | **absent** while `SHARE_IMAGE.url` is `null` |
| `<meta name="robots">` | once, content starts with `index, follow` |
| `<script type="application/ld+json">` | once; its `@graph` contains one node with `@type` including `Organization`, `name: "muush"`, `alternateName: "muush.dev"`, `url: "https://muush.dev"` (trailing slash tolerated if the library normalises it), `logo` resolving to `https://assets.muush.dev/brand/logo/ink500.png`, `sameAs` = the 3 `SOCIAL_PROFILES` hrefs in order |
| About pages only | the `WebPage` node has `@type` `AboutPage` in **both** locales |
| `<body>` | byte-identical to the pre-feature build except for the Nuxt payload/hash noise (no visible change) |

## 2. `sitemap.xml`

- Exists at `.output/public/sitemap.xml`; no `sitemap_index.xml`, no `__sitemap__/*.xml`, no `__sitemap__/style.xsl`.
- Exactly 4 `<url>`; `<loc>` set = `https://muush.dev/es`, `/en`, `/es/nosotros`, `/en/about`.
- Each `<url>` has exactly 3 `xhtml:link rel="alternate"`: `hreflang="es-MX"`, `"en-US"`, `"x-default"` (x-default = the Spanish URL).
- No `<loc>` for `https://muush.dev/`, `/200.html`, `/404.html`, `/_nuxt/**`, `/_fonts/**`, `/_i18n/**`, `/cursor/**`.
- No `<image:image>` / `<video:video>`.

## 3. `robots.txt`

- Exists at `.output/public/robots.txt`, generated (begins with `# START nuxt-robots (indexable)`).
- Contains `User-agent: *` and no line equal to `Disallow: /`.
- Contains exactly one `Sitemap: https://muush.dev/sitemap.xml`.
- `public/robots.txt` and `public/_robots.txt` do not exist in the repository.

## 4. Root object `index.html` (from `public/index.html`)

- Still has `<meta name="robots" content="noindex">`, the refresh to `/es`, canonical `https://muush.dev/es`, `<a href="/es">`.
- Alternates: `hreflang="es-MX"` → `/es`, `hreflang="en-US"` → `/en`, `hreflang="x-default"` → `/es`; no `hreflang="en"`.
- No `index, follow` robots meta added.

## 5. Client bundle `.output/public/_nuxt/*.js`

- No occurrence of `botd`, `fingerprintjs`, `BotDetector`.
- No schema-org graph builder (e.g. `defineOrganization`, `schema-org-graph`) — expected absent; a hit is reported, not silently accepted.
- Size delta vs. baseline 556 K is reported.

## 6. Report-only

- The list of every `*/index.html` under `.output/public` (for the CloudFront index-document rewrite; not implemented here).
