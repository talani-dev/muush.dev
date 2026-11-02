import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Isotipo from '@/shared/ui/Isotipo.vue'

/**
 * The muush isotipo in Muush 1.0 (feature 43, FR-036; Kit `uUENh`): 40 × 22,
 * Blanco stroke, Red muush 500 dot, the brand geometry unchanged (stroke 12
 * in the 70.5-wide artboard). The caller sets the stroke colour.
 */
const meta = {
  title: 'Shared/UI/Isotipo',
  component: Isotipo,
  globals: { backgrounds: { value: 'negro' } },
  render: () => ({
    components: { Isotipo },
    template: '<span class="text-blanco"><Isotipo /></span>',
  }),
} satisfies Meta<typeof Isotipo>

export default meta
type Story = StoryObj<typeof meta>

export const OnNegro: Story = {}
export const Mobile390: Story = { globals: { viewport: { value: 'mobile' } } }
export const Desktop1440: Story = {
  globals: { viewport: { value: 'desktop' } },
}
