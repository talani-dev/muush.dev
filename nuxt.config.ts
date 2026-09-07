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

  modules: ['@nuxtjs/i18n'],

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
