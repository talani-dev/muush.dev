import type { Meta, StoryObj } from '@storybook/vue3-vite'
import RotatingPill from '@/shared/ui/RotatingPill.vue'

/**
 * The hero's rotating pill (feature 42, FR-015). Check (quickstart § 7): the
 * label changes every 2.6 s with a short upward slide; resting the pointer
 * on it holds the label; with "reduce motion" on and a reload it stays on
 * the first item; a screen reader reads the four items once and announces
 * nothing while it rotates. Items are approved copy (`muush-1.0.md` § 4.2).
 */
const meta = {
  title: 'Shared/UI/RotatingPill',
  component: RotatingPill,
  globals: { backgrounds: { value: 'negro' } },
} satisfies Meta<typeof RotatingPill>

export default meta
type Story = StoryObj<typeof meta>

const ES = [
  'Estrategia tecnológica',
  'Software, web y nube',
  'Automatización, datos e IA',
  'Diseño de producto y UX',
]

const EN = [
  'Technology strategy',
  'Software, web and cloud',
  'Automation, data and AI',
  'Product design and UX',
]

export const Es: Story = { args: { items: ES } }

export const En: Story = { args: { items: EN } }

/** One item never rotates. */
export const SingleItem: Story = { args: { items: ['Estrategia tecnológica'] } }

export const Mobile390: Story = {
  args: { items: ES },
  globals: { viewport: { value: 'mobile' } },
}

export const Desktop1440: Story = {
  args: { items: EN },
  globals: { viewport: { value: 'desktop' } },
}
