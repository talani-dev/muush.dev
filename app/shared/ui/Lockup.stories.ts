import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Lockup from '@/shared/ui/Lockup.vue'

/**
 * The Muush 1.0 lockup (feature 43, FR-036): 176 × 31 in full, gap 10; the
 * isotipo form is the 40 × 22 mark of the mobile nav. Compare with pen
 * extract-43 § 1 at both viewports.
 */
const meta = {
  title: 'Shared/UI/Lockup',
  component: Lockup,
  globals: { backgrounds: { value: 'negro' } },
} satisfies Meta<typeof Lockup>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

export const Full: Story = { args: { form: 'full' } }
export const IsotipoOnly: Story = { args: { form: 'isotipo' } }
export const FullDesktop1440: Story = {
  args: { form: 'full' },
  globals: desktop,
}
export const FullMobile390: Story = { args: { form: 'full' }, globals: mobile }
export const IsotipoMobile390: Story = {
  args: { form: 'isotipo' },
  globals: mobile,
}
