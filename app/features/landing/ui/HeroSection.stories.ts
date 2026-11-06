import type { Meta, StoryObj } from '@storybook/vue3-vite'
import HeroSection from './HeroSection.vue'
import { HERO_COPY } from './landingFixtures.testing'

/**
 * The home hero (feature 44, US1; pen extract-44 § 1, frames `NVg3Y` /
 * `yQQ0x`) over the listón. Compare "Escritorio (1440)" and "Móvil (390)"
 * with the `.pen`; "Móvil chico (360)" shows the button row wrapping
 * (Clarifications Q1).
 */
const meta = {
  title: 'Landing/HeroSection',
  component: HeroSection,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HeroSection>

export default meta
type Story = StoryObj<typeof meta>

export const EsMobile390: Story = {
  args: HERO_COPY.es,
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: HERO_COPY.en,
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: HERO_COPY.es,
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: HERO_COPY.en,
  globals: { viewport: { value: 'desktop' } },
}
export const EsMobile360Wrapped: Story = {
  args: HERO_COPY.es,
  globals: { viewport: { value: 'mobileSmall' } },
}
