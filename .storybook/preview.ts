import { type Preview, setup } from '@storybook/vue3-vite'
import { defineComponent, h } from 'vue'
import '../app/assets/css/global.css'

/*
 * Storybook runs Vite outside Nuxt, so it has no `NuxtLink` — a component
 * that uses one does not render in the catalogue at all
 * (docs/business/rules.md § R23, extending § R19). The stub below is the
 * whole accommodation: presentational components keep using `<NuxtLink>`
 * idiomatically and stay free of a `linkComponent` prop.
 *
 * The corollary matters more than the stub: this only works because `ui/`
 * components call no Nuxt composable. Copy and destinations arrive as
 * already-resolved props, so a component that cheats fails here immediately
 * instead of in production.
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

setup(app => {
  app.component('NuxtLink', NuxtLinkStub)
})

/*
 * The site is dark end to end (Ink 500 background, see
 * docs/business/landing/content.md § Dirección visual), so `ink` is the
 * default background. `bone` is here because the brand system also defines
 * light surfaces — a component that only looks right on dark is a bug the
 * story should surface.
 */
const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        ink: { name: 'Ink 500', value: '#262626' },
        bone: { name: 'Bone 200', value: '#f2ebe7' },
        red: { name: 'Red 400', value: '#cf3147' },
      },
    },
    viewport: {
      options: {
        mobile: {
          name: 'Móvil (390)',
          styles: { width: '390px', height: '844px' },
        },
        desktop: {
          name: 'Escritorio (1440)',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'ink' },
  },
}

export default preview
