import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ReceivesList from './ReceivesList.vue'
import { RECEIVES_LISTS } from './receivesFixtures.testing'

/**
 * The check list of the v2 split sections (feature 45, pen extract-45 § 1;
 * shared since feature 46, pen extract-46 § 1.4): the caption and three
 * check rows; on mobile the rows wrap. The home's "Lo que recibes" and
 * Nosotros' "Áreas que sumamos".
 */
const meta = {
  title: 'Shared/UI/ReceivesList',
  component: ReceivesList,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ReceivesList>

export default meta
type Story = StoryObj<typeof meta>

export const EsMobile390: Story = {
  args: RECEIVES_LISTS.receives.es,
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: RECEIVES_LISTS.receives.en,
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: RECEIVES_LISTS.receives.es,
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: RECEIVES_LISTS.receives.en,
  globals: { viewport: { value: 'desktop' } },
}
export const AreasEsMobile390: Story = {
  args: RECEIVES_LISTS.areas.es,
  globals: { viewport: { value: 'mobile' } },
}
export const AreasEnDesktop1440: Story = {
  args: RECEIVES_LISTS.areas.en,
  globals: { viewport: { value: 'desktop' } },
}
