import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FaqBand from './FaqBand.vue'

/**
 * The Preguntas acanalado band (feature 51; handoff README "Fondo · vidrio
 * acanalado"): 1440 × 600 from y 84, 390 × 300 from y 68, inside a
 * positioned page-tall host, as `FaqSection` places it.
 */
const meta = {
  title: 'Faq/FaqBand',
  component: FaqBand,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
  decorators: [
    () => ({
      template:
        '<div class="relative isolate min-h-portada-alto"><story /></div>',
    }),
  ],
} satisfies Meta<typeof FaqBand>

export default meta
type Story = StoryObj<typeof meta>

export const Mobile390: Story = {
  globals: { viewport: { value: 'mobile' } },
}
export const Desktop1440: Story = {
  globals: { viewport: { value: 'desktop' } },
}
