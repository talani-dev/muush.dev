import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Pill from '@/shared/ui/Pill.vue'

/**
 * The Muush 1.0 capsule with the red dot (feature 42, FR-011; Kit `XqFl6`).
 * It must measure 36 px tall at both anchors, with three rings visible on
 * the dot. Labels are approved copy (`docs/business/muush-1.0.md` § 4.2).
 */
const meta = {
  title: 'Shared/UI/Pill',
  component: Pill,
  globals: { backgrounds: { value: 'negro' } },
} satisfies Meta<typeof Pill>

export default meta
type Story = StoryObj<typeof meta>

export const Es: Story = { args: { label: 'Estrategia tecnológica' } }

export const En: Story = { args: { label: 'Technology strategy' } }

/** The longest service name: the capsule grows, it never truncates. */
export const LongLabel: Story = {
  args: { label: 'Automatización, datos e IA' },
}

export const Mobile390: Story = {
  args: { label: 'Estrategia tecnológica' },
  globals: { viewport: { value: 'mobile' } },
}

export const Desktop1440: Story = {
  args: { label: 'Technology strategy' },
  globals: { viewport: { value: 'desktop' } },
}
