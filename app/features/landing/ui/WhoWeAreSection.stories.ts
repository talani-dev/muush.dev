import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { WHO_WE_ARE_COPY } from './landingFixtures.testing'
import WhoWeAreSection from './WhoWeAreSection.vue'

/**
 * "Qué es muush" (feature 44, US2; pen extract-44 § 2, frames `esV29` /
 * `nfrT8`). Below `lg` the tabs zoom the map; use them in "Móvil (390)".
 */
const meta = {
  title: 'Landing/WhoWeAreSection',
  component: WhoWeAreSection,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WhoWeAreSection>

export default meta
type Story = StoryObj<typeof meta>

export const EsMobile390: Story = {
  args: WHO_WE_ARE_COPY.es,
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: WHO_WE_ARE_COPY.en,
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: WHO_WE_ARE_COPY.es,
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: WHO_WE_ARE_COPY.en,
  globals: { viewport: { value: 'desktop' } },
}
