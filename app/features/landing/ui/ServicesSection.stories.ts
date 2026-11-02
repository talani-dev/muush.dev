import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SERVICES_COPY } from './landingFixtures.testing'
import ServicesSection from './ServicesSection.vue'

/**
 * Servicios (feature 44, US3; pen extract-44 § 3, frames `TztwR` /
 * `HeOLx`): carousel at "Móvil (390)", grid at "Escritorio (1440)".
 */
const meta = {
  title: 'Landing/ServicesSection',
  component: ServicesSection,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ServicesSection>

export default meta
type Story = StoryObj<typeof meta>

export const EsMobile390: Story = {
  args: SERVICES_COPY.es,
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: SERVICES_COPY.en,
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: SERVICES_COPY.es,
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: SERVICES_COPY.en,
  globals: { viewport: { value: 'desktop' } },
}
