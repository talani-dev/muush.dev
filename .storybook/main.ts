import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/vue3-vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

/*
 * Storybook runs Vite directly, outside Nuxt, so it does not inherit the
 * aliases from nuxt.config.ts, the Tailwind plugin, nor the SFC compiler.
 * All three are re-declared here; if an alias is added there it must be
 * added here too.
 *
 * The SFC compiler is not optional and is not supplied by the framework:
 * `@storybook/vue3-vite@10` only contributes its own template-compilation
 * and docgen plugins, and `@storybook/builder-vite` picks up
 * `@vitejs/plugin-vue` from the project's own `vite.config.*` — which this
 * repository does not have, because Nuxt owns the Vite config. Without this
 * line every `.vue` import inside a story fails to parse.
 */
const config: StorybookConfig = {
  stories: ['../app/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  staticDirs: ['../public'],
  viteFinal: async viteConfig => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), vue(), tailwindcss()]
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        ...viteConfig.resolve?.alias,
        '@/features': fileURLToPath(
          new URL('../app/features', import.meta.url)
        ),
        '@/shared': fileURLToPath(new URL('../app/shared', import.meta.url)),
        '@/layouts': fileURLToPath(new URL('../app/layouts', import.meta.url)),
        '@/assets': fileURLToPath(new URL('../app/assets', import.meta.url)),
        '@/types': fileURLToPath(new URL('../types', import.meta.url)),
        '@/utils': fileURLToPath(new URL('../utils', import.meta.url)),
      },
    }
    return viteConfig
  },
}

export default config
