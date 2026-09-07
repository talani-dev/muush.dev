import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Wordmark from '@/shared/ui/Wordmark.vue'

/**
 * The two official lockups of `branding.md`, set in Poppins — the only
 * component in this layer allowed to use it.
 *
 * Note: the font binaries are not in the repository yet (public/fonts/ is
 * empty), so both forms currently render in a fallback face. That is a known
 * gap, tracked separately; the type role, weight and tracking are correct.
 */
const meta = {
  title: 'Shared/UI/Wordmark',
  component: Wordmark,
} satisfies Meta<typeof Wordmark>

export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = { args: { form: 'full' } }
export const Short: Story = { args: { form: 'short' } }

export const BothForms: Story = {
  render: () => ({
    components: { Wordmark },
    template: `
      <div class="flex items-baseline gap-10 font-instrument">
        <figure class="flex flex-col gap-2">
          <Wordmark form="full" />
          <figcaption class="text-meta text-bone-300">full</figcaption>
        </figure>
        <figure class="flex flex-col gap-2">
          <Wordmark form="short" />
          <figcaption class="text-meta text-bone-300">short</figcaption>
        </figure>
      </div>
    `,
  }),
}
