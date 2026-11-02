import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ASSESSMENT_COPY } from './landingFixtures.testing'
import ReceivesList from './ReceivesList.vue'

/**
 * "Lo que recibes" (feature 45, pen extract-45 § 1): the caption and three
 * check rows; on mobile the rows wrap.
 */
const meta = {
  title: 'Landing/ReceivesList',
  component: ReceivesList,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ReceivesList>

export default meta
type Story = StoryObj<typeof meta>

const args = (locale: 'es' | 'en') => ({
  label: ASSESSMENT_COPY[locale].receivesLabel,
  items: ASSESSMENT_COPY[locale].receives,
})

export const EsMobile390: Story = {
  args: args('es'),
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: args('en'),
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: args('es'),
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: args('en'),
  globals: { viewport: { value: 'desktop' } },
}
