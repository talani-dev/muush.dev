# Implementation report: feature 35 `technical_seo_indexing`

**Implementer** · 2026-10-15 · status left at `in_progress` (the leader moves it to `reviewing`).
Every task T001–T025 in `tasks.md` is checked. `./init.sh` exits 0.

Evidence labels: **CONFIRMED** means observed in this repo's build output or in installed module code. **INFERRED** means reasoned from that evidence but not observed directly.

## 1. Files changed

| File | Change |
|---|---|
| `package.json`, `pnpm-lock.yaml` | `@nuxtjs/sitemap ~8.6.2`, `@nuxtjs/robots ~6.2.4`, `nuxt-schema-org ~6.4.3` (via `pnpm add` only) |
| `nuxt.config.ts` | `SITE_URL` const (site.url + i18n.baseUrl); 3 modules; `site` (`indexable: true`); `sitemap` (`sitemaps:false`, `xsl:false`, `discover*:false`, `excludeAppSources`); `robots` (`botDetection/header/mergeWithRobotsTxtPath: false`); EN `language: 'en-US'` |
| `public/index.html` | `hreflang="en"` → `"en-US"` + one comment sentence |
| `i18n/locales/es.json`, `en.json` | `pages.home.{title,description}`, `pages.about.description` (gate-approved copy, verbatim); `site` object removed |
| `app/features/shell/data/siteIdentity.ts` (new) | `SITE_ALTERNATE_NAME`, `SITE_LOGO_URL`, `ShareImage`, `SHARE_IMAGE` (`url: null`, TODO(D6)) |
| `app/features/shell/logic/{profileUrls,resolveShareMeta}.ts` (+ `.test.ts`) (new) | pure helpers + unit tests |
| `app/features/shell/logic/{usePageSeo,useSiteSeo}.ts` (new) | page / site head composables |
| `app/features/shell/index.ts` | exports `usePageSeo`, `useSiteSeo` |
| `app/layouts/default.vue` | `useSiteSeo()` + tag-source comment |
| `app/pages/index.vue`, `nosotros.vue` | `usePageSeo(...)` replaces `useHead({ title })` |
| `tests/seo-output.test.ts` (new) | contract §§ 1–5 (34 tests) |
| `tests/static-output.test.ts` | `en-US` / `es-MX` alternates; root object `en-US` + `noindex` |
| `specs/035-technical-seo-indexing/tasks.md` | checkboxes |
| `docs/harness/findings.md` | R71 (schema-org client tree-shake trap) |
| `docs/harness/progress/current.md` | log |

No `.npmrc`, no `pnpm-workspace.yaml`, no `public/robots.txt`, no `docs/business/`, no `server/`. `NUXT_SEO_PRO_KEY` is not set anywhere.

## 2. Install (T002)

- Registry `https://registry.npmjs.org/`. `pnpm add` succeeded on pnpm 10.27.0. CONFIRMED.
- Resolved versions: `@nuxtjs/sitemap 8.6.2`, `@nuxtjs/robots 6.2.4`, `nuxt-schema-org 6.4.3`, `nuxt-site-config 4.2.3`, `nuxtseo-shared 5.3.16`. `nuxt` is still 4.5.2. `@nuxtjs/seo` and `nuxt-og-image` are absent. CONFIRMED.
- Specifiers use `~` (patch range) rather than the plan's `^`, so a later reinstall cannot drift to 8.7 / 6.3 / 6.5. That is the leader's "exactly 8.6.x / 6.2.x / 6.4.x".
- 19 new packages: `@fingerprintjs/botd@2.0.0`, `@nodable/entities`, `@nuxt/devtools-kit@4.0.0-alpha.7`, `anynum`, `fast-xml-builder`, `fast-xml-parser`, `is-unsafe`, `path-expression-matcher`, `sitemapd`, `strnum`, `xml-naming`, `nuxt-site-config`, `nuxt-site-config-kit`, `site-config-stack`, `nuxtseo-shared`, and the 3 modules. **No new package declares a `preinstall`/`install`/`postinstall` script**, checked in each installed `package.json`. **pnpm flagged no package for `allowBuilds`**: `node_modules/.modules.yaml` has no `ignoredBuilds`. `pnpm-workspace.yaml` is untouched. The only script that ran was the project's own `postinstall: nuxt prepare`. One deprecation warning, `glob@10.5.0`, is transitive and pre-existing.

## 3. Deviations from the plan, and why

1. **The sitemap listed both About URLs twice (research U-2 fired).** Root cause, CONFIRMED in `@nuxtjs/sitemap` 8.6.2 `dist/`: with `i18n.pages` set, the module adds an `@nuxtjs/i18n:pages` source whose entries carry `_sitemap: 'es-MX'|'en-US'`, and it auto-excludes `nuxt:pages`. The `nuxt:prerender` source has the same URLs untagged. The dedupe key is `${_sitemap}${loc}`, so the pairs never merge. Fix: `sitemap.excludeAppSources: ['@nuxtjs/i18n:pages']`, which is the module's own option. All 4 pages are crawled and prerendered, and they keep their `es-MX`/`en-US`/`x-default` alternates. Result: 4 URLs × 3 alternates. I ran a negative control: removing the line turns `should list exactly the four pages` red. This is config, not a hand-written sitemap. The plan says "stop and report" for U-2, so **the leader/reviewer should explicitly accept this**. Residual risk: a future page that is not reachable by the prerender crawler would be missing from the sitemap. The test catches that for the current 4 pages.
2. **Schema-org code reached the client bundle (research U-3 fired), and I fixed it.** Root cause, CONFIRMED in `nuxt/dist/index.mjs` `TreeShakeComposablesPlugin`: the transform runs `enforce: 'post'`, after unimport has rewritten the auto-import to an absolute path, and it only matches the `'nuxt-schema-org'` and `#imports` specifiers. So `useSchemaOrg(...)` survived and a 34.6 KB chunk with schema-org node code shipped. Fix: both `useSchemaOrg` calls are wrapped in `import.meta.server`. On the client the call is a no-op with `reactive: false`. JSON-LD output is identical; I checked the graph types for all 4 pages before and after. The bundle grep is now 0, and `tests/seo-output.test.ts` asserts it. The trap is documented in a code comment and in `findings.md` § R71. The plan says "stop and report" for U-3; this is reported here for acceptance.
3. **The JSON-LD `<script>` is rendered at the end of `<body>`, not in `<head>`.** This is the module's default placement. It is still in the prerendered HTML (FR-011) and Google reads it there. The tests search the whole document for it. INFERRED: acceptable for indexing.
4. **The logo URL was changed mid-task by the leader (Roberto, 2026-10-15).** `SITE_LOGO_URL` is `https://assets.muush.dev/brand/logo/ink500.png`, not `.../brand/logo_ink500.png`. The tests import the constant rather than retyping it.
5. Minor schema asymmetry (module default, not caused by this feature): `/es/nosotros`'s WebPage node carries a `potentialAction: ReadAction`, while `/en/about` does not, because the module infers `AboutPage` from the `about` segment and skips the action. Both are typed `["WebPage","AboutPage"]`, so FR-010 holds.
6. The quickstart's `<body>` extraction (`sed -n '/<body/,/<\/body>/p'`) also grabs `<head>`, because the generated HTML is on one line. For the comparison I used a perl regex on `<body…>…</body>`, normalising `data-v-*` scope hashes and `_nuxt/` file hashes.

## 4. Quality gate (T023)

| Check | Result |
|---|---|
| `./init.sh` | **PASS** (exit 0) |
| `pnpm check` (Biome, `--error-on-warnings`) | **PASS** (263 files) |
| `pnpm typecheck` | **PASS** |
| `pnpm test` | **PASS**: 86 files, 1207 tests; this feature adds 3 files / 38 tests (34 output-contract, 4 unit) |
| `pnpm generate` | **PASS** |
| `pnpm storybook:build` | **PASS** |

## 5. Verification on `.output/public` (T022)

Counts are for `<head>`. The whole document also contains pre-existing SVG `<title>` elements in the body (logo/icons), which are not the document title. The language-only `es`/`en` alternates are i18n's catch-alls (spec A-04). Each appears once, and they are not counted as duplicates.

#### /es
- html lang: es-MX (count 1)
- title (head): 'Hablamos negocio y código · muush' (count 1)
- description: count 1 = 'muush es un technology solution studio. Diseñamos y construimos soluciones digitales alrededor de tu negocio, del problema de negocio a la solución técnica.'
- og:title: count 1 = 'Hablamos negocio y código · muush'
- og:description: count 1 = 'muush es un technology solution studio. Diseñamos y construimos soluciones digitales alrededor de tu negocio, del problema de negocio a la solución técnica.'
- og:type: count 1 = 'website'
- og:site_name: count 1 = 'muush'
- og:url: count 1 = 'https://muush.dev/es'
- og:locale: count 1 = 'es_MX'
- og:locale:alternate: count 1 = 'en_US'
- twitter:card: count 1 = 'summary'
- og:image: count 0
- twitter:image: count 0
- robots: count 1 = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
- canonical: https://muush.dev/es (count 1)
  - alternate hreflang=x-default -> https://muush.dev/es
  - alternate hreflang=es -> https://muush.dev/es
  - alternate hreflang=es-MX -> https://muush.dev/es
  - alternate hreflang=en -> https://muush.dev/en
  - alternate hreflang=en-US -> https://muush.dev/en
- application/ld+json blocks: 1 (rendered at end of body); @graph types: ['WebSite', 'WebPage', 'Organization', 'ImageObject']

#### /en
- html lang: en-US (count 1)
- title (head): 'We speak business and code · muush' (count 1)
- description: count 1 = 'muush is a technology solution studio. We design and build digital solutions around your business, from business problem to technology solution.'
- og:title: count 1 = 'We speak business and code · muush'
- og:description: count 1 = 'muush is a technology solution studio. We design and build digital solutions around your business, from business problem to technology solution.'
- og:type: count 1 = 'website'
- og:site_name: count 1 = 'muush'
- og:url: count 1 = 'https://muush.dev/en'
- og:locale: count 1 = 'en_US'
- og:locale:alternate: count 1 = 'es_MX'
- twitter:card: count 1 = 'summary'
- og:image: count 0
- twitter:image: count 0
- robots: count 1 = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
- canonical: https://muush.dev/en (count 1)
  - alternate hreflang=x-default -> https://muush.dev/es
  - alternate hreflang=es -> https://muush.dev/es
  - alternate hreflang=es-MX -> https://muush.dev/es
  - alternate hreflang=en -> https://muush.dev/en
  - alternate hreflang=en-US -> https://muush.dev/en
- application/ld+json blocks: 1 (rendered at end of body); @graph types: ['WebSite', 'WebPage', 'Organization', 'ImageObject']

#### /es/nosotros
- html lang: es-MX (count 1)
- title (head): 'Nosotros · muush' (count 1)
- description: count 1 = 'Conoce al equipo de muush: reunimos al talento indicado para cada proyecto. Si trabajas en tecnología, diseño o producción, súmate a nuestro talent pool.'
- og:title: count 1 = 'Nosotros · muush'
- og:description: count 1 = 'Conoce al equipo de muush: reunimos al talento indicado para cada proyecto. Si trabajas en tecnología, diseño o producción, súmate a nuestro talent pool.'
- og:type: count 1 = 'website'
- og:site_name: count 1 = 'muush'
- og:url: count 1 = 'https://muush.dev/es/nosotros'
- og:locale: count 1 = 'es_MX'
- og:locale:alternate: count 1 = 'en_US'
- twitter:card: count 1 = 'summary'
- og:image: count 0
- twitter:image: count 0
- robots: count 1 = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
- canonical: https://muush.dev/es/nosotros (count 1)
  - alternate hreflang=x-default -> https://muush.dev/es/nosotros
  - alternate hreflang=es -> https://muush.dev/es/nosotros
  - alternate hreflang=es-MX -> https://muush.dev/es/nosotros
  - alternate hreflang=en -> https://muush.dev/en/about
  - alternate hreflang=en-US -> https://muush.dev/en/about
- application/ld+json blocks: 1 (rendered at end of body); @graph types: ['WebSite', ['WebPage', 'AboutPage'], 'Organization', 'ImageObject']

#### /en/about
- html lang: en-US (count 1)
- title (head): 'About us · muush' (count 1)
- description: count 1 = 'Meet the muush team: we bring together the right talent for each project. If you work in technology, design or production, join our talent pool.'
- og:title: count 1 = 'About us · muush'
- og:description: count 1 = 'Meet the muush team: we bring together the right talent for each project. If you work in technology, design or production, join our talent pool.'
- og:type: count 1 = 'website'
- og:site_name: count 1 = 'muush'
- og:url: count 1 = 'https://muush.dev/en/about'
- og:locale: count 1 = 'en_US'
- og:locale:alternate: count 1 = 'es_MX'
- twitter:card: count 1 = 'summary'
- og:image: count 0
- twitter:image: count 0
- robots: count 1 = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
- canonical: https://muush.dev/en/about (count 1)
  - alternate hreflang=x-default -> https://muush.dev/es/nosotros
  - alternate hreflang=es -> https://muush.dev/es/nosotros
  - alternate hreflang=es-MX -> https://muush.dev/es/nosotros
  - alternate hreflang=en -> https://muush.dev/en/about
  - alternate hreflang=en-US -> https://muush.dev/en/about
- application/ld+json blocks: 1 (rendered at end of body); @graph types: ['WebSite', ['WebPage', 'AboutPage'], 'Organization', 'ImageObject']

#### JSON-LD /es
```json
{
 "@context": "https://schema.org",
 "@graph": [
  {
   "@id": "https://muush.dev/es#website",
   "@type": "WebSite",
   "inLanguage": "es-MX",
   "name": "muush",
   "url": "https://muush.dev/es",
   "publisher": {
    "@id": "https://muush.dev/#identity"
   },
   "workTranslation": {
    "@id": "https://muush.dev/en#website"
   }
  },
  {
   "@id": "https://muush.dev/es#webpage",
   "@type": "WebPage",
   "description": "muush es un technology solution studio. Diseñamos y construimos soluciones digitales alrededor de tu negocio, del problema de negocio a la solución técnica.",
   "name": "Hablamos negocio y código · muush",
   "url": "https://muush.dev/es",
   "isPartOf": {
    "@id": "https://muush.dev/es#website"
   },
   "potentialAction": [
    {
     "@type": "ReadAction",
     "target": [
      "https://muush.dev/es"
     ]
    }
   ],
   "primaryImageOfPage": {
    "@id": "https://muush.dev/#logo"
   }
  },
  {
   "@id": "https://muush.dev/#identity",
   "@type": "Organization",
   "alternateName": "muush.dev",
   "name": "muush",
   "url": "https://muush.dev",
   "logo": {
    "@id": "https://muush.dev/#logo"
   },
   "sameAs": [
    "https://www.linkedin.com/company/muush-dev",
    "https://www.instagram.com/muush.dev",
    "https://www.tiktok.com/@muush.dev"
   ]
  },
  {
   "@id": "https://muush.dev/#logo",
   "@type": "ImageObject",
   "caption": "muush",
   "contentUrl": "https://assets.muush.dev/brand/logo/ink500.png",
   "inLanguage": "es-MX",
   "url": "https://assets.muush.dev/brand/logo/ink500.png"
  }
 ]
}
```

#### JSON-LD /en/about
```json
{
 "@context": "https://schema.org",
 "@graph": [
  {
   "@id": "https://muush.dev/en#website",
   "@type": "WebSite",
   "inLanguage": "en-US",
   "name": "muush",
   "url": "https://muush.dev/en",
   "publisher": {
    "@id": "https://muush.dev/#identity"
   },
   "translationOfWork": {
    "@id": "https://muush.dev/es#website"
   }
  },
  {
   "@id": "https://muush.dev/en/about#webpage",
   "description": "Meet the muush team: we bring together the right talent for each project. If you work in technology, design or production, join our talent pool.",
   "name": "About us · muush",
   "url": "https://muush.dev/en/about",
   "@type": [
    "WebPage",
    "AboutPage"
   ],
   "isPartOf": {
    "@id": "https://muush.dev/en#website"
   },
   "primaryImageOfPage": {
    "@id": "https://muush.dev/#logo"
   }
  },
  {
   "@id": "https://muush.dev/#identity",
   "@type": "Organization",
   "alternateName": "muush.dev",
   "name": "muush",
   "url": "https://muush.dev",
   "logo": {
    "@id": "https://muush.dev/#logo"
   },
   "sameAs": [
    "https://www.linkedin.com/company/muush-dev",
    "https://www.instagram.com/muush.dev",
    "https://www.tiktok.com/@muush.dev"
   ]
  },
  {
   "@id": "https://muush.dev/#logo",
   "@type": "ImageObject",
   "caption": "muush",
   "contentUrl": "https://assets.muush.dev/brand/logo/ink500.png",
   "inLanguage": "en-US",
   "url": "https://assets.muush.dev/brand/logo/ink500.png"
  }
 ]
}
```

### sitemap.xml: the 4 `<loc>`s and their alternates

```
<loc>https://muush.dev/en</loc>
<xhtml:link rel="alternate" hreflang="es-MX" href="https://muush.dev/es" />
<xhtml:link rel="alternate" hreflang="en-US" href="https://muush.dev/en" />
<xhtml:link rel="alternate" hreflang="x-default" href="https://muush.dev/es" />
<loc>https://muush.dev/es</loc>
<xhtml:link rel="alternate" hreflang="es-MX" href="https://muush.dev/es" />
<xhtml:link rel="alternate" hreflang="en-US" href="https://muush.dev/en" />
<xhtml:link rel="alternate" hreflang="x-default" href="https://muush.dev/es" />
<loc>https://muush.dev/en/about</loc>
<xhtml:link rel="alternate" hreflang="es-MX" href="https://muush.dev/es/nosotros" />
<xhtml:link rel="alternate" hreflang="en-US" href="https://muush.dev/en/about" />
<xhtml:link rel="alternate" hreflang="x-default" href="https://muush.dev/es/nosotros" />
<loc>https://muush.dev/es/nosotros</loc>
<xhtml:link rel="alternate" hreflang="es-MX" href="https://muush.dev/es/nosotros" />
<xhtml:link rel="alternate" hreflang="en-US" href="https://muush.dev/en/about" />
<xhtml:link rel="alternate" hreflang="x-default" href="https://muush.dev/es/nosotros" />
```

No `sitemap_index.xml`, no `__sitemap__/`, no XSL, no `<image:image>`/`<video:video>`. `/`, `200.html` and `404.html` are not listed. The file ends with the module's credit comment (`<!-- XML Sitemap generated by @nuxtjs/sitemap v8.6.2 … -->`).

### robots.txt (full text)

```
# START nuxt-robots (indexable)
User-agent: *
Disallow: 

Sitemap: https://muush.dev/sitemap.xml
# END nuxt-robots```

`Disallow:` is empty, which means allow all. There is no `Disallow: /`.

### Root object `index.html` (copied verbatim from `public/index.html`)

`<meta name="robots" content="noindex" />`, refresh to `/es`, canonical `https://muush.dev/es`, alternates `es-MX → /es`, `en-US → /en`, `x-default → /es`. No bare `hreflang="en"`, and no `index, follow` added.

### Every `*/index.html` under `.output/public` (FR-021, report-only for the CloudFront index-document rewrite)

```
./en/about/index.html
./en/index.html
./es/index.html
./es/nosotros/index.html
./index.html
```

The set is unchanged from the baseline. Other top-level outputs: `200.html`, `404.html`, `favicon.svg`, `robots.txt` (new), `sitemap.xml` (new), `_fonts/`, `_i18n/`, `_nuxt/`, `cursor/`.

### `<body>` comparison vs. the T001 baseline

`/es`, `/en`, `/es/nosotros`, `/en/about`: **identical**. Scripts are stripped, and `data-v-*` and `_nuxt/` hashes are normalised. No visible change.

### Client bundle

| | Baseline (T001) | After |
|---|---|---|
| `du -sk _nuxt` | 556 KB | 564 KB (**+8 KB**) |
| `_nuxt/*.js` raw total | 385 385 B (12 files) | 395 353 B (10 files) (**+9 968 B**) |
| `_nuxt/*.js` gzip (concatenated) | 129 980 B | 134 616 B (**+4 636 B**) |
| `botd \| fingerprintjs \| BotDetector` | — | **0 hits** |
| `defineOrganization \| schema-org-graph \| primaryImageOfPage` | — | **0 hits** (was 1 file / 34.6 KB before the deviation-2 fix) |

INFERRED: the remaining delta is the `nuxt-site-config` client plugins, which research R4 said are unavoidable. `nuxt-site-config` strings appear in the main entry chunk. Each prerendered page also grew by about 3 KB of HTML (JSON-LD, the new meta tags, and the site config in the inline payload): `/es` 52 554 → 55 546 B, `/en/about` 28 623 → 31 503 B.

## 6. For the leader / Roberto

- Accept or reject deviations 1 and 2 (U-2 and U-3 stop-conditions, resolved by config and a server-only guard, with evidence above).
- Business-rule candidate (from the gate, not written to `docs/business/`): "technology solution studio" and "talent pool" stay in English in both locales.
- Report-only: the 5 `index.html` paths above, for the CloudFront rewrite.
- Unrelated pre-existing items: none touched.

## 7. Review round 1: F1 and F2 (2026-10-15)

The reviewer accepted U-2 and U-3. F3 (plan.md gates) belongs to the leader and was not touched.

- **F2 first.** I added `seo output · structured-data parity across locales` to `tests/seo-output.test.ts`. For each pair (`/es`↔`/en`, `/es/nosotros`↔`/en/about`) it compares a locale-independent shape of the JSON-LD graph: per node, the `@id` fragment, the `@type` set, the key set, and the `@type` of each `potentialAction`. The directed translation links `workTranslation`/`translationOfWork` are excluded because they legitimately differ. **Run against the unfixed build, the About pair failed (CONFIRMED)** and the home pair passed.
- **F1 fix.** `usePageSeo` now passes `potentialAction: [defineReadAction({})]` in its `defineWebPage` call (server-only, as before). The rule is the same as the homes': every WebPage carries one `ReadAction` targeting its own URL. Output, CONFIRMED: `/es/nosotros` → `[{ReadAction, target: [https://muush.dev/es/nosotros]}]` (one, not doubled), and `/en/about` → `[{ReadAction, target: [https://muush.dev/en/about]}]`.
- **Empty array, measured and rejected.** With `potentialAction: []`, `/es/nosotros` still has the default ReadAction after the merge, and `/en/about` renders `"potentialAction": []`. That is still not identical. The comment in `usePageSeo.ts` now documents both defaults and this measurement.
- **Gate:** `./init.sh` exit 0. 86 files, 1209 tests (+2 parity tests). check, typecheck, test, generate and storybook:build all **PASS**. Bundle grep for `botd|fingerprintjs|BotDetector|ReadAction|primaryImageOfPage|schema-org-graph` in `_nuxt/*.js`: 0 hits. `_nuxt` is unchanged at 564 KB.
- Section 3 item 5 above (the ReadAction asymmetry) is resolved by this fix.
