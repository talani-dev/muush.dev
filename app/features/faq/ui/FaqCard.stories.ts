import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FaqCard from './FaqCard.vue'
import { FAQ_CONTENT } from './faqFixtures.testing'

/**
 * "¿Tienes otra pregunta?" (feature 51; handoff README "Tarjeta"): one
 * booking button, full width at 390. At 1440 it sits in the 420 px left
 * column, as on the page.
 */
const meta = {
  title: 'Faq/FaqCard',
  component: FaqCard,
  globals: { backgrounds: { value: 'negro' } },
} satisfies Meta<typeof FaqCard>

export default meta
type Story = StoryObj<typeof meta>

const inGutters = () => ({ template: '<div class="p-gutter"><story /></div>' })
const inLeftColumn = () => ({
  template: '<div class="grid grid-cols-faq p-gutter-desktop"><story /></div>',
})

export const EsMobile390: Story = {
  args: { card: FAQ_CONTENT.es.card },
  globals: { viewport: { value: 'mobile' } },
  decorators: [inGutters],
}
export const EnMobile390: Story = {
  args: { card: FAQ_CONTENT.en.card },
  globals: { viewport: { value: 'mobile' } },
  decorators: [inGutters],
}
export const EsDesktop1440: Story = {
  args: { card: FAQ_CONTENT.es.card },
  globals: { viewport: { value: 'desktop' } },
  decorators: [inLeftColumn],
}
export const EnDesktop1440: Story = {
  args: { card: FAQ_CONTENT.en.card },
  globals: { viewport: { value: 'desktop' } },
  decorators: [inLeftColumn],
}
