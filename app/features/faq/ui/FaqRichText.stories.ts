import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FaqRichText from './FaqRichText.vue'
import { FAQ_CONTENT } from './faqFixtures.testing'

/** An answer with its inline link (feature 51, spec FR-007). */
const meta = {
  title: 'Faq/FaqRichText',
  component: FaqRichText,
  globals: { backgrounds: { value: 'negro' } },
  decorators: [
    () => ({
      template:
        '<div class="p-gutter font-texto text-faq-respuesta text-texto-suave"><story /></div>',
    }),
  ],
} satisfies Meta<typeof FaqRichText>

export default meta
type Story = StoryObj<typeof meta>

export const PrivacyLinkEs: Story = {
  args: {
    segments: FAQ_CONTENT.es.topics[3]?.questions[2]?.answer ?? [],
  },
}
export const EmailLinkEn: Story = {
  args: {
    segments: FAQ_CONTENT.en.topics[4]?.questions[1]?.answer ?? [],
  },
}
