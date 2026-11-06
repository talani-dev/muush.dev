import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Wordmark from '@/shared/ui/Wordmark.vue'

/**
 * "muush.dev" in Muush 1.0 (feature 43, FR-036): Poppins 22, "muush" 600
 * Blanco, "." 600 Red muush 500, "dev" 400 Gris 400, one baseline.
 */
const meta = {
  title: 'Shared/UI/Wordmark',
  component: Wordmark,
  globals: { backgrounds: { value: 'negro' } },
} satisfies Meta<typeof Wordmark>

export default meta
type Story = StoryObj<typeof meta>

export const OnNegro: Story = {}
export const Mobile390: Story = { globals: { viewport: { value: 'mobile' } } }
export const Desktop1440: Story = {
  globals: { viewport: { value: 'desktop' } },
}
