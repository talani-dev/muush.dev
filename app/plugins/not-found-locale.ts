import { applyNotFoundLocaleRule } from '@/features/shell'

/**
 * The not-found page's language rule (feature 36), on the server and the
 * client. Thin wrapper: the shell owns the rule
 * (`app/features/shell/logic/notFoundLocale.ts`). `enforce: 'pre'` puts the
 * hook in place before `@nuxtjs/i18n` detects the initial locale. A no-op for
 * every path that matches a route.
 */
export default defineNuxtPlugin({
  name: 'shell:not-found-locale',
  enforce: 'pre',
  setup(nuxtApp) {
    applyNotFoundLocaleRule(nuxtApp)
  },
})
