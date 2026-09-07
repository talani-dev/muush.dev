import { config } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

/**
 * `defineVitestConfig` inherits Nuxt's Vite config, so the SFC compiler
 * resolves `<NuxtLink>` to the **real** component — which then throws
 * `NUXT_E1001` on mount, because a component test has no Nuxt app behind it.
 * Registering a replacement under `components` does not help: the resolution
 * already happened at compile time. It has to be a **stub**, which Vue Test
 * Utils swaps in by component name at mount.
 *
 * Same obligation the catalogue has in `.storybook/preview.ts`
 * (`docs/business/rules.md` § R23), and stubbing it once keeps the shape
 * identical across both harnesses.
 */
const NuxtLinkStub = defineComponent({
  name: 'NuxtLink',
  props: {
    to: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    return () => h('a', { href: props.to }, slots.default?.())
  },
})

config.global.stubs = {
  ...config.global.stubs,
  NuxtLink: NuxtLinkStub,
}
