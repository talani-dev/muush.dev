import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-09-06',
  devtools: { enabled: true },

  /*
   * Static output for S3 + CloudFront. `ssr: true` prerenders every route at
   * build time; `pnpm generate` writes plain files with no runtime behind
   * them. Constitution Article I.
   */
  ssr: true,
  nitro: {
    preset: 'static',
  },

  css: ['~/assets/css/global.css'],

  /*
   * The site icon, declared once so every prerendered page in both locales
   * carries it. Until now nothing declared an icon at all: Nuxt was serving
   * `public/favicon.ico` by convention, and that file was still the stock Nuxt
   * logo. It is deleted, and the adaptive SVG is the only icon the site ships
   * (spec A-06 — producing a real `.ico` needs a rasterizer this repository
   * does not have, and adding a build dependency for a 16×16 legacy format
   * fails Article VIII). Requests to `/favicon.ico` now 404, which browsers
   * handle silently.
   */
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  modules: ['@nuxtjs/i18n', '@nuxt/fonts'],

  /*
   * Feature 029 · the Form Submission API (docs/business/landing/
   * form-api-contract.md). Both values are PUBLIC identifiers, not secrets:
   * the API has no credential at all (contract § 1) and a Turnstile sitekey is
   * printed into every page by design. They still live here and never inline
   * under `app/` (Constitution Article XI, spec FR-001), so the planned move
   * to `api.muush.dev` and the real sitekey are configuration changes, not
   * code changes.
   *
   * The site is static: these are baked into the generated HTML at
   * `pnpm generate` time, so the override has to be present in the build
   * environment, not the serving one (research R1):
   *   NUXT_PUBLIC_FORMS_API_BASE_URL · NUXT_PUBLIC_TURNSTILE_SITE_KEY
   *
   * - `formsApiBaseUrl` defaults to the deployed API of contract § 1, so a
   *   build without `.env` still targets the right backend.
   * - `turnstileSiteKey` defaults to the REAL Invisible sitekey for
   *   `muush.dev` (Roberto, 2026-10-12): it is public by design, and keeping
   *   it here means the production build needs no extra wiring. Its secret
   *   lives only in the backend. For local work, override it in `.env` with
   *   Cloudflare's always-pass invisible test key `1x00000000000000000000BB`
   *   — the real key fails on `localhost` unless that hostname is added in
   *   Cloudflare. Never inline it under `app/` (tests/forms-config.test.ts).
   *
   * Turnstile's script (`challenges.cloudflare.com`) is a deliberate, scoped
   * exception to the "no third-party request at runtime" practice recorded
   * above for fonts: loaded only in the browser, only on a page with a form,
   * only after the visitor engages it (spec FR-021, plan Complexity Tracking).
   */
  runtimeConfig: {
    public: {
      formsApiBaseUrl: 'https://ma8y4vvt58.execute-api.us-east-1.amazonaws.com',
      turnstileSiteKey: '0x4AAAAAAFO1zGh2W1tV7LWH',
    },
  },

  /*
   * The brand type, self-hosted. `branding.md` § Tipografía grants Poppins to
   * the logo/wordmark alone, at 600, and gives everything else to Instrument
   * Sans at 400 / 500 / 600. The set is closed: the 32 type tokens in
   * global.css name those weights and no other, so a weight added here would
   * be bytes no page asks for, and one missing would be synthesised by the
   * browser — the defect this feature exists to remove.
   *
   * The binaries are downloaded at **build** time and emitted into
   * `.output/public/_fonts`, so the deployed artefact makes no request to a
   * third party at runtime (Constitution Article IV). That means `pnpm
   * generate` now needs the network on a cold cache — the trade recorded in
   * spec A-09.
   *
   * `throwOnError` is on deliberately. Its default is `false`, which turns a
   * failed download into a warning and ships `@font-face` rules pointing at
   * files that were never written: fallback type, silently, which is exactly
   * today's defect wearing a different hat.
   *
   * Subsets are latin + latin-ext (spec A-11): the site ships Spanish and
   * English only. Verify the result against `.output/public`, never against
   * the dev server or the catalogue (docs/business/rules.md §§ R25, R31).
   */
  fonts: {
    defaults: {
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
    },
    families: [
      { name: 'Poppins', provider: 'google', weights: [600] },
      { name: 'Instrument Sans', provider: 'google', weights: [400, 500, 600] },
    ],
    throwOnError: true,
  },

  /*
   * Both locales carry a prefix (/es/, /en/) — decided 2026-09-06, see
   * docs/business/landing/decisions-open.md. The About segment stays
   * translated (nosotros ↔ about), so the locale switcher resolves routes
   * through i18n, never by swapping the prefix.
   */
  i18n: {
    locales: [
      { code: 'es', language: 'es-MX', name: 'Español', file: 'es.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
    ],
    /*
     * The canonical origin, needed for the `hreflang` alternates to be
     * absolute — a relative alternate is ignored by search engines. It is a
     * public domain, not configuration that varies by environment.
     */
    baseUrl: 'https://muush.dev',
    defaultLocale: 'es',
    strategy: 'prefix',
    langDir: 'locales',
    detectBrowserLanguage: false,
    /*
     * `/` has no page of its own. This governs it wherever a Nuxt runtime is
     * present — `nuxt dev`, and the client router when the host serves
     * `200.html` as an SPA fallback.
     *
     * It does NOT produce a file. Verified by running it: with
     * `rootRedirect: '/es'` AND `'/'` in `nitro.prerender.routes`, the route
     * is dropped from the crawl and `.output/public/index.html` still does
     * not exist — the redirect is runtime-only, and a static host runs
     * nothing. The prerender entry was removed rather than left as a no-op;
     * the object at the root is the committed `public/index.html`
     * (docs/business/rules.md § R25).
     */
    rootRedirect: '/es',
    /*
     * The translated route segments live here and nowhere else — this is the
     * single declaration spec FR-018 requires. A component never writes
     * `/nosotros` or `/about`; it names the route and lets the router resolve
     * the path, which is also what makes the locale toggle correct by
     * construction instead of by string surgery (Constitution Article VI).
     *
     * Reverting Spanish to an unprefixed root would be an edit to this block,
     * not to any component (decisions-open.md § Estrategia de rutas i18n).
     */
    customRoutes: 'config',
    pages: {
      nosotros: {
        es: '/nosotros',
        en: '/about',
      },
    },
  },

  /*
   * Feature-Based + Capas architecture (Constitution Articles I–III).
   * `@/features` and `@/shared` are the two entry points; a feature is
   * reached only through its `index.ts` barrel.
   */
  alias: {
    '@/features': fileURLToPath(new URL('./app/features', import.meta.url)),
    '@/shared': fileURLToPath(new URL('./app/shared', import.meta.url)),
    '@/layouts': fileURLToPath(new URL('./app/layouts', import.meta.url)),
    '@/assets': fileURLToPath(new URL('./app/assets', import.meta.url)),
    '@/types': fileURLToPath(new URL('./types', import.meta.url)),
    '@/utils': fileURLToPath(new URL('./utils', import.meta.url)),
  },

  vite: {
    plugins: [tailwindcss()],
  },
})
