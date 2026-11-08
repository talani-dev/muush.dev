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
 * The site is dark end to end on the Muush 1.0 canvas, Negro 950
 * (`--negro-950`, feature 42), so `negro` is the default background. The v1
 * backgrounds (Ink 500, Bone 200, Red 400) left with the v1 stories in
 * feature 47.
 */
const preview: Preview = {
  parameters: {
    /*
     * Sidebar order (naming reorganization, Roberto 2026-11-01): the
     * foundations first, then the shared layer, then every feature group
     * (`*`, alphabetical).
     */
    options: {
      storySort: {
        order: ['Foundations', 'Shared', ['UI'], '*'],
      },
    },
    backgrounds: {
      options: {
        negro: { name: 'Negro 950', value: '#050505' },
      },
    },
    viewport: {
      options: {
        /* Feature 44: the narrowest width the home is checked at, where
           the hero's two buttons wrap (Clarifications Q1). */
        mobileSmall: {
          name: 'Móvil chico (360)',
          styles: { width: '360px', height: '780px' },
        },
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
    backgrounds: { value: 'negro' },
  },
}

export default preview
