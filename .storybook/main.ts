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
  /*
   * `public/` is served under `/brand`, not at the static root.
   *
   * Verified, not assumed (feature 006, T021): with `staticDirs: ['../public']`
   * the copy happens **after** Storybook writes its own files, so
   * `public/index.html` — the site's `/` redirect stub — overwrote the
   * catalogue's manager document, and `storybook-static/index.html` was a
   * 1480-byte `<meta http-equiv="refresh" content="0; url=/es">`. The built
   * catalogue's root was redirecting to a page that does not exist inside it.
   * `public/favicon.svg` collided with Storybook's own the same way, which is
   * why the catalogue's tab has been showing the stock Nuxt logo.
   *
   * Mapping the directory to a prefix keeps one source file for the icon —
   * `public/favicon.svg`, the same one the site ships — and ends both
   * collisions. `.storybook/manager-head.html` points the tab at
   * `./brand/favicon.svg`.
   */
  staticDirs: [{ from: '../public', to: '/brand' }],
  viteFinal: async viteConfig => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), vue(), tailwindcss()]
    /*
     * Vite's own `publicDir` defaults to `<root>/public`, which in this
     * repository is the site's public directory — so the preview build copied
     * it over the catalogue's output a second time, independently of
     * `staticDirs`, and `public/index.html` landed on top of Storybook's
     * manager document. Storybook owns static files through `staticDirs`;
     * Vite must not also claim them.
     */
    viteConfig.publicDir = false
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
