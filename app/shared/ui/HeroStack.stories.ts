import type { Meta, StoryObj } from '@storybook/vue3-vite'
import HeroStack from './HeroStack.vue'

/**
 * The Pill + headline + intro pattern shared by Landing's `01 Hero` and
 * About's `01 Hero` (feature 17). Switch `variant` to compare the two frames'
 * own type roles and widths side by side — everything else about the three
 * children is identical.
 *
 * Every prop below is a **fixture**: the component calls no composable at
 * all, which is what lets it render here with no i18n instance and no Nuxt
 * runtime (`docs/business/rules.md` § R23).
 */
const meta = {
  title: 'Shared/UI/HeroStack',
  component: HeroStack,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof HeroStack>

export default meta
type Story = StoryObj<typeof meta>

export const Landing: Story = {
  args: {
    variant: 'landing',
    eyebrow: 'Technology solution studio',
    headline: 'Hablamos negocio y código.',
    body: 'Diseñamos y construimos soluciones digitales alrededor de tu negocio.',
  },
}

/** About's own frame: `--text-h1` over `--spacing-about-hero-measure` (700),
 *  narrower type and a wider paragraph than Landing's. */
export const About: Story = {
  args: {
    variant: 'about',
    eyebrow: 'Nosotros',
    headline: 'El equipo se arma alrededor del proyecto.',
    body: 'Reunimos al talento indicado para cada proyecto y le damos libertad de elegir en qué proyectos entra y desde dónde trabaja. Esa flexibilidad es lo que sostiene nuestro talent pool, y lo que nos permite entregar sin cargar una estructura pesada.',
  },
}

/** The default slot is the one structural difference between the two Heroes:
 *  Landing appends a CTA row here, About renders nothing after the intro. */
export const WithSlotContent: Story = {
  render: args => ({
    components: { HeroStack },
    setup() {
      return { args }
    },
    template:
      '<HeroStack v-bind="args"><div class="mt-4 text-bone-100">CTA row placeholder</div></HeroStack>',
  }),
  args: Landing.args,
}
