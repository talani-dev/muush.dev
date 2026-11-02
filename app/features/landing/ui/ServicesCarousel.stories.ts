import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SERVICES_COPY } from './landingFixtures.testing'
import ServicesCarousel from './ServicesCarousel.vue'

/**
 * The service cards (feature 44, pen extract-44 §§ 3.1, 3.3): a snapping
 * carousel with its indicator at "Móvil (390)" (swipe or scroll it), the
 * 4-column grid at "Escritorio (1440)".
 */
const meta = {
  title: 'Landing/ServicesCarousel',
  component: ServicesCarousel,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
  decorators: [
    () => ({
      template:
        '<div class="px-gutter py-bloque-y lg:px-gutter-desktop"><story /></div>',
    }),
  ],
} satisfies Meta<typeof ServicesCarousel>

export default meta
type Story = StoryObj<typeof meta>

export const EsMobile390: Story = {
  args: { cards: SERVICES_COPY.es.cards, labelledBy: 'x' },
  globals: { viewport: { value: 'mobile' } },
}
export const EnDesktop1440: Story = {
  args: { cards: SERVICES_COPY.en.cards, labelledBy: 'x' },
  globals: { viewport: { value: 'desktop' } },
}
export const EnMobile390: Story = {
  args: { cards: SERVICES_COPY.en.cards, labelledBy: 'x' },
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: { cards: SERVICES_COPY.es.cards, labelledBy: 'x' },
  globals: { viewport: { value: 'desktop' } },
}
