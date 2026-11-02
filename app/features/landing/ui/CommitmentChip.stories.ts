import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CommitmentChip from './CommitmentChip.vue'
import { HOW_WE_WORK_COPY } from './landingFixtures.testing'

/**
 * A step's commitment (feature 44, pen extract-44 § 4): the glass chip with
 * its glyph at "Escritorio (1440)", the red chip at "Móvil (390)".
 */
const meta = {
  title: 'Landing/CommitmentChip',
  component: CommitmentChip,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CommitmentChip>

export default meta
type Story = StoryObj<typeof meta>

const [first] = HOW_WE_WORK_COPY.es.steps
const [firstEn] = HOW_WE_WORK_COPY.en.steps
if (!first || !firstEn) throw new Error('fixtures')

export const EsDesktop1440: Story = {
  args: { text: first.commitment, icon: first.icon },
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: { text: firstEn.commitment, icon: firstEn.icon },
  globals: { viewport: { value: 'desktop' } },
}
export const EsMobile390: Story = {
  args: { text: first.commitment, icon: first.icon },
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: { text: firstEn.commitment, icon: firstEn.icon },
  globals: { viewport: { value: 'mobile' } },
}
