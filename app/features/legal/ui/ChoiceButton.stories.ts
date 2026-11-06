import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ChoiceButton from './ChoiceButton.vue'

/** "Rechazar todo" / "Aceptar todo" (feature 48): Carbón 800 pill. */
const meta = {
  title: 'Legal/ChoiceButton',
  component: ChoiceButton,
  globals: { backgrounds: { value: 'negro' } },
} satisfies Meta<typeof ChoiceButton>

export default meta
type Story = StoryObj<typeof meta>

export const RejectEsMobile390: Story = {
  args: { label: 'Rechazar todo' },
  globals: { viewport: { value: 'mobile' } },
}
export const AcceptEnDesktop1440: Story = {
  args: { label: 'Accept all' },
  globals: { viewport: { value: 'desktop' } },
}
