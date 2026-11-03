import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AboutHeroSection from './AboutHeroSection.vue'
import { ABOUT_HERO_COPY } from './aboutFixtures.testing'

/**
 * The Nosotros hero (feature 46, US1; pen extract-46 §§ 1.1, 2; frames
 * `b0rao` / `Docxh`) over the listón, with the `.pen` mobile uniforms below
 * 1024. Every prop is a fixture: the component calls no Nuxt composable.
 */
const meta = {
  title: 'About/AboutHeroSection',
  component: AboutHeroSection,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AboutHeroSection>

export default meta
type Story = StoryObj<typeof meta>

export const EsMobile390: Story = {
  args: ABOUT_HERO_COPY.es,
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: ABOUT_HERO_COPY.en,
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: ABOUT_HERO_COPY.es,
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: ABOUT_HERO_COPY.en,
  globals: { viewport: { value: 'desktop' } },
}
