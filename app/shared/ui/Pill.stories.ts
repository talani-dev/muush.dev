import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Pill from '@/shared/ui/Pill.vue'

/**
 * The section capsule of docs/business/landing/design-extract.md § 3 —
 * eleven instances across the two pages, differing only in their label.
 *
 * The labels below are the real ones from the design file; they arrive as a
 * prop precisely because the same capsule serves /es/ and /en/.
 */
const meta = {
  title: 'Shared/UI/Pill',
  component: Pill,
} satisfies Meta<typeof Pill>

export default meta
type Story = StoryObj<typeof meta>

const realLabels = [
  'Technology solution studio',
  'Propósito',
  'Servicios',
  'Work with muush',
]

export const HeroEyebrow: Story = {
  args: { label: 'Technology solution studio' },
}

export const SectionMarker: Story = { args: { label: 'Propósito' } }

/** The wrap edge case: the capsule grows, it never truncates. */
export const LongLabel: Story = {
  args: {
    label:
      'Delivery & Technology Management de principio a fin, con alcance y tiempos',
  },
  render: args => ({
    components: { Pill },
    setup: () => ({ args }),
    template: '<div class="max-w-xs"><Pill v-bind="args" /></div>',
  }),
}

export const RealLabels: Story = {
  args: { label: 'Propósito' },
  render: () => ({
    components: { Pill },
    setup: () => ({ realLabels }),
    template: `
      <div class="flex flex-wrap items-start gap-4">
        <Pill v-for="label in realLabels" :key="label" :label="label" />
      </div>
    `,
  }),
}
