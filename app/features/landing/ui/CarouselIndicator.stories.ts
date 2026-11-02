import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CarouselIndicator from './CarouselIndicator.vue'

/**
 * The services carousel indicator (feature 44, pen extract-44 § 3.3).
 * Coverage note (review-44): it has no text, so no locale axis, and it
 * renders only below `lg` (hidden at 1440), so only "Móvil (390)" applies.
 */
const meta = {
  title: 'Landing/CarouselIndicator',
  component: CarouselIndicator,
  globals: { backgrounds: { value: 'negro' }, viewport: { value: 'mobile' } },
  args: { count: 4 },
} satisfies Meta<typeof CarouselIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const First: Story = { args: { active: 0 } }
export const Third: Story = { args: { active: 2 } }
export const Last: Story = { args: { active: 3 } }
