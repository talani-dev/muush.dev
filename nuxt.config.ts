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
    defaultLocale: 'es',
    strategy: 'prefix',
    langDir: 'locales',
    detectBrowserLanguage: false,
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
