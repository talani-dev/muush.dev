import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Lockup from '@/shared/ui/Lockup.vue'

/**
 * The brand mark the nav and the footer both compose: the on-ink isotipo
 * beside a Wordmark, from docs/business/landing/design-extract.md § 6.
 *
 * What to check at the two viewport presets: at Escritorio (1440) the
 * isotipo is 52 wide and its stroke measures 8.85; at Móvil (390) it is 40
 * wide and the stroke measures 6.8. Both fall out of the viewBox — no stroke
 * thickness is written anywhere in the component.
 */
const meta = {
  title: 'Shared/UI/Lockup',
  component: Lockup,
} satisfies Meta<typeof Lockup>

export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = { args: { form: 'full' } }
export const Short: Story = { args: { form: 'short' } }

export const BothForms: Story = {
  render: () => ({
    components: { Lockup },
    template: `
      <div class="flex flex-col gap-8 font-instrument">
        <figure class="flex flex-col gap-2">
          <Lockup form="full" />
          <figcaption class="text-meta text-bone-300">full</figcaption>
        </figure>
        <figure class="flex flex-col gap-2">
          <Lockup form="short" />
          <figcaption class="text-meta text-bone-300">short</figcaption>
        </figure>
      </div>
    `,
  }),
}
