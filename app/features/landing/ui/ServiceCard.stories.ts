import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SERVICES_COPY } from './landingFixtures.testing'
import ServiceCard from './ServiceCard.vue'

/**
 * The four service cards (feature 44, pen extract-44 § 3.1), each with its
 * glyph and edge light.
 *
 * Coverage note (review-44): the card has no breakpoint-dependent class; it
 * is identical at every viewport except for the width its parent gives it.
 * So the eight per-card variants run at "Móvil (390)" inside the 290 px
 * carousel slot, and the `…Desktop1440` stories show it at "Escritorio
 * (1440)" in a slot of the 4-column grid (305 px at 1440), ES and EN.
 */
const meta = {
  title: 'Landing/ServiceCard',
  component: ServiceCard,
  globals: { backgrounds: { value: 'negro' }, viewport: { value: 'mobile' } },
  decorators: [
    () => ({ template: '<div class="w-tarjeta-movil"><story /></div>' }),
  ],
} satisfies Meta<typeof ServiceCard>

export default meta
type Story = StoryObj<typeof meta>

const [strategy, software, automation, design] = SERVICES_COPY.es.cards
const [strategyEn, softwareEn, automationEn, designEn] = SERVICES_COPY.en.cards
if (!(strategy && software && automation && design)) throw new Error('fixtures')
if (!(strategyEn && softwareEn && automationEn && designEn)) {
  throw new Error('fixtures')
}

export const EsStrategy: Story = { args: strategy }
export const EsSoftware: Story = { args: software }
export const EsAutomation: Story = { args: automation }
export const EsDesign: Story = { args: design }
export const EnStrategy: Story = { args: strategyEn }
export const EnSoftware: Story = { args: softwareEn }
export const EnAutomation: Story = { args: automationEn }
export const EnDesign: Story = { args: designEn }

/** One slot of the desktop grid: the card is 305 wide at 1440. */
const desktopSlot = () => ({
  template:
    '<div class="grid grid-cols-4 items-start gap-tarjetas-gap px-gutter-desktop py-seccion-aire"><story /></div>',
})

export const EsDesktop1440: Story = {
  args: strategy,
  globals: { viewport: { value: 'desktop' } },
  decorators: [desktopSlot],
}
export const EnDesktop1440: Story = {
  args: strategyEn,
  globals: { viewport: { value: 'desktop' } },
  decorators: [desktopSlot],
}
