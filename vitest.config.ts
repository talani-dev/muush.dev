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
    setupFiles: ['tests/setup.ts'],
    /* Builds the static site once, so the output assertions read the current
       artefact rather than whatever was last left in `.output/`. */
    globalSetup: ['tests/global-setup.ts'],
    include: [
      'tests/**/*.test.ts',
      'app/shared/ui/**/*.test.ts',
      /*
       * Added by feature 008. Without this line `app/shared/logic/` — where
       * Article I puts the cross-cutting composables — is collected zero
       * times, so a test file there reports green **by never running** and the
       * file count rises by nothing (docs/business/rules.md § R39). A feature
       * that adds tests in a new location extends this array; a separate
       * Vitest project is not an option, because `defineVitestConfig` throws
       * on `projects` (§ R16).
       */
      'app/shared/logic/**/*.test.ts',
      'app/features/**/*.test.ts',
    ],
  },
})
