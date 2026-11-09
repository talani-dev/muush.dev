import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FaqTopicTabs from './FaqTopicTabs.vue'
import { FAQ_CONTENT } from './faqFixtures.testing'

/**
 * The five Preguntas topics (feature 51; handoff README "Pestañas de
 * temas"): a chip carousel at 390, a column of tabs at 1440. Clicks are
 * logged, not applied: `FaqSection` owns the selection.
 */
const meta = {
  title: 'Faq/FaqTopicTabs',
  component: FaqTopicTabs,
  globals: { backgrounds: { value: 'negro' } },
  args: { idPrefix: 'faq' },
} satisfies Meta<typeof FaqTopicTabs>

export default meta
type Story = StoryObj<typeof meta>

const es = {
  topics: FAQ_CONTENT.es.topics,
  label: FAQ_CONTENT.es.tabsLabel,
}
const en = {
  topics: FAQ_CONTENT.en.topics,
  label: FAQ_CONTENT.en.tabsLabel,
}

export const EsMobile390: Story = {
  args: { ...es, selected: 0 },
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390Pricing: Story = {
  args: { ...en, selected: 1 },
  globals: { viewport: { value: 'mobile' } },
}
/* From lg the tabs sit in the 420 px left column of the page grid. */
const inLeftColumn = () => ({
  template: '<div class="grid grid-cols-faq p-gutter-desktop"><story /></div>',
})

export const EsDesktop1440: Story = {
  args: { ...es, selected: 0 },
  globals: { viewport: { value: 'desktop' } },
  decorators: [inLeftColumn],
}
export const EnDesktop1440: Story = {
  args: { ...en, selected: 4 },
  globals: { viewport: { value: 'desktop' } },
  decorators: [inLeftColumn],
}
