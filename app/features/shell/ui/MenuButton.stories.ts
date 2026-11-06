import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MenuButton from './MenuButton.vue'

/**
 * The mobile bar's menu control and the open menu's "Cerrar" (feature 43,
 * FR-007, FR-016; pen extract-43 §§ 3–4): 36 × 36, radius 12, Blanco 20 %
 * stroke; three 16 × 1.5 lines, or the 14 × 14 X at 1.6.
 */
const meta = {
  title: 'Shell/MenuButton',
  component: MenuButton,
  globals: { backgrounds: { value: 'negro' }, viewport: { value: 'mobile' } },
} satisfies Meta<typeof MenuButton>

export default meta
type Story = StoryObj<typeof meta>

export const OpenEs: Story = { args: { kind: 'open', label: 'Abrir menú' } }
export const OpenEn: Story = { args: { kind: 'open', label: 'Open menu' } }
export const CloseEs: Story = { args: { kind: 'close', label: 'Cerrar menú' } }
export const CloseEn: Story = { args: { kind: 'close', label: 'Close menu' } }
