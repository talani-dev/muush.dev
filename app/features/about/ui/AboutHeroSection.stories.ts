import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AboutHeroSection from './AboutHeroSection.vue'

/**
 * `01 Hero` of Nosotros/About. Explicitly the landing Hero's sibling: switch
 * the viewport control between *Móvil (390)* and *Escritorio (1440)* to see
 * that nothing here changes shape — no CTA row exists to reflow, so this
 * section has no breakpoint at all, unlike `Landing/HeroSection`.
 *
 * Every prop below is a **fixture**. The component calls no composable at
 * all, which is why it renders here with no i18n instance and no Nuxt
 * runtime (`docs/business/rules.md` § R23).
 *
 * ⚠️ The three glows read **60/37/28** on both viewports below, never the
 * `.pen`'s mobile-drawn 65/40/30 — Roberto reviewed this on 2026-09-08 and
 * ruled it a design-file error, not intent (see the component's own doc
 * comment).
 *
 * The backdrop's three glows paint at `--layer-glow`, a **negative** level:
 * on this page there is no ink base beneath them, so they read darker than
 * they do on the site — same note `Landing/HeroSection`'s story carries.
 */
const meta = {
  title: 'About/AboutHeroSection',
  component: AboutHeroSection,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AboutHeroSection>

export default meta
type Story = StoryObj<typeof meta>

const spanish = {
  eyebrow: 'Nosotros',
  headline: 'El equipo se arma alrededor del proyecto.',
  intro:
    'Reunimos al talento indicado para cada proyecto y le damos libertad de elegir en qué proyectos entra y desde dónde trabaja. Esa flexibilidad es lo que sostiene nuestro talent pool, y lo que nos permite entregar sin cargar una estructura pesada.',
}

const english = {
  eyebrow: 'About us',
  headline: 'We build the team around the project.',
  intro:
    'We bring together the right talent for each project and give them freedom to choose which projects they join and where they work from. That flexibility is what holds our talent pool together, and what lets us deliver without carrying a heavy structure.',
}

export const Spanish: Story = {
  args: spanish,
  globals: { viewport: { value: 'desktop' } },
}

export const English: Story = {
  args: english,
  globals: { viewport: { value: 'desktop' } },
}

export const Mobile: Story = {
  args: spanish,
  globals: { viewport: { value: 'mobile' } },
}

export const MobileEnglish: Story = {
  args: english,
  globals: { viewport: { value: 'mobile' } },
}
