import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/vue3-vite'
import tailwindcss from '@tailwindcss/vite'

/*
 * Storybook runs Vite directly, outside Nuxt, so it does not inherit the
 * aliases from nuxt.config.ts nor the Tailwind plugin. Both are re-declared
 * here; if an alias is added there it must be added here too.
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
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()]
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
