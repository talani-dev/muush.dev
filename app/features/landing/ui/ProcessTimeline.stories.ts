import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { HOW_WE_WORK_COPY } from './landingFixtures.testing'
import ProcessTimeline from './ProcessTimeline.vue'

/**
 * The five steps on their line (feature 44, pen extract-44 § 4; Roberto
 * review and clarification 2026-11-02).
 *
 * Desktop stories: at rest every column is unlit (grey dots pinging in
 * grey) on a grey line; there is no scroll fill. Hover a column, or Tab to
 * it, to preview it: it grows, the line is red up to its dot and grey after,
 * the columns up to it light (red ping) and the later ones stay unlit.
 * Leaving returns to the unlit rest. Mobile stories: the rail fills with
 * the canvas scroll and the steps' text shrinks and fades with its
 * distance from the fill's end (feature 50); reduced motion shows the rail
 * full and only fades.
 */
const meta = {
  title: 'Landing/ProcessTimeline',
  component: ProcessTimeline,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
  decorators: [
    () => ({
      template:
        '<div class="px-gutter py-seccion-aire lg:px-gutter-desktop"><story /></div>',
    }),
  ],
} satisfies Meta<typeof ProcessTimeline>

export default meta
type Story = StoryObj<typeof meta>

export const EsDesktop1440: Story = {
  args: { steps: HOW_WE_WORK_COPY.es.steps },
  globals: { viewport: { value: 'desktop' } },
}
export const EnMobile390: Story = {
  args: { steps: HOW_WE_WORK_COPY.en.steps },
  globals: { viewport: { value: 'mobile' } },
}
export const EsMobile390: Story = {
  args: { steps: HOW_WE_WORK_COPY.es.steps },
  globals: { viewport: { value: 'mobile' } },
}
export const EnDesktop1440: Story = {
  args: { steps: HOW_WE_WORK_COPY.en.steps },
  globals: { viewport: { value: 'desktop' } },
}
