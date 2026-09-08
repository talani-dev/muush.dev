import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Wordmark from '@/shared/ui/Wordmark.vue'

/**
 * The two official lockups of `branding.md`, set in Poppins — the only
 * component in this layer allowed to use it.
 *
 * Both forms render in real Poppins 600, so the type role, weight and
 * tracking below are reviewable as drawn. Feature 006 self-hosted the brand
 * type: the site downloads the faces at build time through `@nuxt/fonts` and
 * serves them from its own origin, and this catalogue — which runs Vite
 * outside Nuxt and therefore sees no Nuxt module — declares the same two
 * families itself in `.storybook/preview-head.html`. If a story does show a
 * system face, that stylesheet failed to load; the component is not the
 * suspect.
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
