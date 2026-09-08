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
      /*
       * Added by feature 011, for the same reason and with the same proof.
       * `app/shared/data/` is where Article I puts a cross-cutting constant,
       * and it was **not** collected: a probe file in it whose only assertion
       * was `expect('collected').toBe('this assertion must fail')` left the
       * run at "29 files passed". A suite that reports green by never running
       * is worse than no suite, because it is counted.
       *
       * Nothing lives here yet — this feature's own test is in `tests/` — so
       * the line is written before the need rather than after the false green.
       */
      'app/shared/data/**/*.test.ts',
      'app/features/**/*.test.ts',
    ],
  },
})
