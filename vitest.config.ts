import { defineVitestConfig } from '@nuxt/test-utils/config'

/*
 * One global DOM environment, on purpose: Vitest 4 removed
 * `environmentMatchGlobs` and `defineVitestConfig` throws on `projects`, so a
 * per-directory environment split is not available (docs/business/rules.md
 * § R16). The i18n parity suite reads JSON and is unaffected by a DOM being
 * present. Aliases and the Vue plugin are inherited from the Nuxt config and
 * must not be redeclared here (§ R15).
 */
export default defineVitestConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'app/shared/ui/**/*.test.ts'],
  },
})
