import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AlsoAvailable from './AlsoAvailable.vue'
import { SERVICES_COPY } from './landingFixtures.testing'

/**
 * "También, si lo necesitas" (feature 44, pen extract-44 § 3.2). From
 * 1440 the Creativo / Marketing chip dots ping in Acero 200 (FR-041, Roberto
 * review 2026-11-02); no ping under reduced motion. The mobile card has no
 * chips.
 */
const meta = {
  title: 'Landing/AlsoAvailable',
  component: AlsoAvailable,
  globals: { backgrounds: { value: 'negro' } },
  decorators: [() => ({ template: '<div class="p-gutter"><story /></div>' })],
} satisfies Meta<typeof AlsoAvailable>

export default meta
type Story = StoryObj<typeof meta>

export const EsMobile390: Story = {
  args: SERVICES_COPY.es.also,
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: SERVICES_COPY.en.also,
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: SERVICES_COPY.es.also,
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: SERVICES_COPY.en.also,
  globals: { viewport: { value: 'desktop' } },
}
