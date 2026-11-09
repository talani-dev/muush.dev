import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FaqSection from './FaqSection.vue'
import { FAQ_CONTENT } from './faqFixtures.testing'

/**
 * The Preguntas page block (feature 51; handoff `preguntas-muush-1.0`,
 * frames "Preguntas ES/EN · Muush 1.0 · A pestañas · fondo acanalado" and
 * their mobile pair): the acanalado band, the header, the five topics, the
 * accordion and the card, at 390 and 1440 in both locales. The framing is
 * the site-wide one (OQ-1 = B), so the top air is the header's strip; the
 * header itself is the layout's and is not part of this block. Every prop
 * is a fixture: the block calls no Nuxt composable.
 */
const meta = {
  title: 'Faq/FaqSection',
  component: FaqSection,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FaqSection>

export default meta
type Story = StoryObj<typeof meta>

export const EsMobile390: Story = {
  args: FAQ_CONTENT.es,
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: FAQ_CONTENT.en,
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: FAQ_CONTENT.es,
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: FAQ_CONTENT.en,
  globals: { viewport: { value: 'desktop' } },
}
