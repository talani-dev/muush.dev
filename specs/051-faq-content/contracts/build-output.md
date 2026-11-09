# Build output contract · Feature 51

Checked against `.output/public` after `pnpm generate`
(`tests/static-output.test.ts`, `tests/seo-output.test.ts`).

## 1 · Documents

`es/preguntas/index.html` and `en/faq/index.html`:

1. Contain each of the 20 questions and the 20 answers of their locale as
   text (answers with link texts and the email inline), compared against
   the locale file read from disk (rules.md § R27).
2. Contain neither "En construcción" nor "Under construction" nor
   "Mientras tanto" / "In the meantime".
3. `<title>`, `meta[name=description]`, `og:title`, `og:description` equal
   `pages.faq.title` / `pages.faq.description`.
4. Exactly one `role="tablist"`, five `role="tab"`, five `role="tabpanel"`;
   four panels carry `hidden`. Exactly one question button has
   `aria-expanded="true"` (topic 01, question 1).
5. Links: the privacy link resolves to `/es/privacidad` / `/en/privacy`;
   the about link to `/es/nosotros#trabaja-con-muush` /
   `/en/about#trabaja-con-muush`; two `mailto:support@muush.dev` links; the
   card button `href="https://cal.com/muush/intro-call"` with
   `target="_blank"`.
6. Canonical, hreflang alternates and no `noindex`, as today.
7. The page block carries `min-h-portada-alto`, `pt-seccion-arriba`,
   `pb-seccion-aire` and its content layer `justify-center` (spec FR-019);
   no `faq-arriba` / `faq-abajo` class exists.

## 1b · Header on every document (OQ-2 = A)

For every prerendered route (the 10 sitemap URLs and both 404s):

1. The `<nav>` link list holds exactly four items in order: `Inicio`,
   `Servicios`, `Nosotros`, `Preguntas` (EN `Home`, `Services`, `About`,
   `FAQ`); the last links to `/es/preguntas` / `/en/faq`. The mobile menu
   markup, when it is prerendered, holds the same four.
2. On `/es/preguntas` the only `aria-current="page"` link of the bar is
   `Preguntas`; on `/en/faq` it is `FAQ`; on every other page `Preguntas` /
   `FAQ` carries no `aria-current`.
3. `Proyectos` / `Projects` is still never in the nav.

## 2 · Structured data

One `application/ld+json` graph per document with exactly one WebPage node
(`@id` ending `#webpage`) whose `@type` is `["WebPage", "FAQPage"]` in both
locales, a `ReadAction`, and `mainEntity` listing 20 `@id` references to the
20 `Question` nodes of the graph, in page order. Each `Question` has `name`
equal to the question, `acceptedAnswer` of `@type` `Answer` with `text`
equal to the answer as the page renders it (link texts and the address
inline), and `inLanguage` `es-MX` / `en-US`. Node-type sets are equal across
the two locales.

Amended 2026-11-08 (review-51 F2) to the shipped shape: nuxt-schema-org
6.4.3's WebPage resolver merges its own default type into the node, so the
type is the array (as Nosotros ships `["WebPage", "AboutPage"]`), and the
site's WebPage nodes carry no `inLanguage` of their own (the language is on
the Questions and the WebSite node). The earlier text asked for the string
`"FAQPage"` and `inLanguage` on the page node. Reviewer's judgement
(INFERRED): valid schema.org, accepted by Google. After deploy, run the
Rich Results Test or the Schema.org validator on both URLs (SC-005).

## 3 · Site files

- `sitemap.xml`: exactly the same 10 URLs as before.
- `llms.txt`: equal byte for byte to `public/llms.txt` and to the fenced
  block in `contracts/llms-txt.md` (approved, OQ-4 = A); still links
  exactly the 10 sitemap URLs; contains none of the 20 questions.

## 4 · Poster

- The band poster served under `_nuxt/` is a WebP converted from the `.pen`
  export `h3JSJ` (1440 × 600); the old `preguntas-acanalado.webp` bytes are
  gone (different content hash).
