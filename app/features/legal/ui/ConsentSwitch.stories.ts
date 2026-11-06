import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ConsentSwitch from './ConsentSwitch.vue'

/**
 * A category switch (feature 48, `S9MqXO`): 44 × 26. Off as drawn; on is
 * DERIVED (Red muush track, knob at the end).
 */
const meta = {
  title: 'Legal/ConsentSwitch',
  component: ConsentSwitch,
  globals: { backgrounds: { value: 'negro' } },
  args: { labelledBy: 'cookies-advertising' },
} satisfies Meta<typeof ConsentSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const OffMobile390: Story = {
  args: { checked: false },
  globals: { viewport: { value: 'mobile' } },
}
export const OnDesktop1440: Story = {
  args: { checked: true },
  globals: { viewport: { value: 'desktop' } },
}
