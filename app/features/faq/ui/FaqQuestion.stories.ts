import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FaqQuestion from './FaqQuestion.vue'
import { FAQ_CONTENT } from './faqFixtures.testing'

/**
 * One Preguntas question (feature 51; handoff `preguntas-muush-1.0`
 * README "Acordeón"): closed and open, ES and EN, 390 and 1440. Every prop
 * is a fixture: the component calls no Nuxt composable.
 */
const meta = {
  title: 'Faq/FaqQuestion',
  component: FaqQuestion,
  globals: { backgrounds: { value: 'negro' } },
  decorators: [() => ({ template: '<div class="p-gutter"><story /></div>' })],
} satisfies Meta<typeof FaqQuestion>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

function question(locale: 'es' | 'en', topic: number, index: number) {
  const found = FAQ_CONTENT[locale].topics[topic]?.questions[index]
  if (!found) throw new Error('missing fixture')
  return found
}

export const OpenEsMobile390: Story = {
  args: { question: question('es', 0, 0), open: true },
  globals: mobile,
}
export const ClosedEsMobile390: Story = {
  args: { question: question('es', 0, 2), open: false },
  globals: mobile,
}
export const OpenEsDesktop1440: Story = {
  args: { question: question('es', 0, 0), open: true },
  globals: desktop,
}
export const ClosedEnDesktop1440: Story = {
  args: { question: question('en', 0, 1), open: false },
  globals: desktop,
}
/** The privacy link inside the answer. */
export const WithLinkEnDesktop1440: Story = {
  args: { question: question('en', 3, 2), open: true },
  globals: desktop,
}
/** Question 19: the address as a mail link. */
export const WithEmailEsMobile390: Story = {
  args: { question: question('es', 4, 1), open: true },
  globals: mobile,
}
