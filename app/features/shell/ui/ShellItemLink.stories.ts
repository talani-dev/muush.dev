import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import ShellItemLink from './ShellItemLink.vue'

/**
 * One footer entry by destination (feature 43, FR-031…FR-034): external in
 * a new tab, internal or `mailto:` in place, no destination as plain text.
 */
const meta = {
  title: 'Shell/ShellItemLink',
  component: ShellItemLink,
  globals: { backgrounds: { value: 'negro' } },
  render: args => ({
    components: { ShellItemLink },
    setup: () => ({ args }),
    template:
      '<p class="font-texto text-p text-blanco-85"><ShellItemLink v-bind="args" /></p>',
  }),
} satisfies Meta<typeof ShellItemLink>

export default meta
type Story = StoryObj<typeof meta>

export const InternalEs: Story = {
  args: { item: { label: 'Nosotros', href: '/es/nosotros', external: false } },
}
export const ExternalEn: Story = {
  args: {
    item: {
      label: 'Book a call',
      href: CALL_BOOKING_URL,
      external: true,
    },
  },
}
export const NoDestinationEs: Story = {
  args: { item: { label: 'Blog · próximamente', external: false } },
}
export const NoDestinationEn: Story = {
  args: { item: { label: 'Blog · coming soon', external: false } },
}
