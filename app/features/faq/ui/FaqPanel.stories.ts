import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FaqPanel from './FaqPanel.vue'
import { FAQ_CONTENT } from './faqFixtures.testing'

/** One topic's questions (feature 51): its first question open. */
const meta = {
  title: 'Faq/FaqPanel',
  component: FaqPanel,
  globals: { backgrounds: { value: 'negro' } },
  args: { openIndex: 0, selected: true, idPrefix: 'faq' },
  decorators: [() => ({ template: '<div class="p-gutter"><story /></div>' })],
} satisfies Meta<typeof FaqPanel>

export default meta
type Story = StoryObj<typeof meta>

function topic(locale: 'es' | 'en', index: number) {
  const found = FAQ_CONTENT[locale].topics[index]
  if (!found) throw new Error('missing fixture')
  return found
}

export const EsMobile390: Story = {
  args: { topic: topic('es', 1) },
  globals: { viewport: { value: 'mobile' } },
}
export const EnDesktop1440: Story = {
  args: { topic: topic('en', 4) },
  globals: { viewport: { value: 'desktop' } },
}
