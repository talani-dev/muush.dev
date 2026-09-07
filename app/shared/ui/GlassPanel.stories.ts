import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GlassPanel, { type GlassVariant } from '@/shared/ui/GlassPanel.vue'

/**
 * The six glass surfaces of docs/business/landing/design-extract.md § 1.
 *
 * Review note: `branding.md` forbids glass on glass ("nunca vidrio sobre
 * vidrio"). GlassPanel cannot see its own ancestry, so nesting one inside
 * another is caught here at review, never by the component (spec A-08).
 *
 * Two of the six differ by 5% opacity, which is why `AllVariants` exists:
 * side by side the difference is obvious, on separate pages it is invisible.
 * Flip the viewport control between Móvil (390) and Escritorio (1440) to see
 * the fluid radius and padding move without a breakpoint.
 */
const meta = {
  title: 'Shared/UI/GlassPanel',
  component: GlassPanel,
  render: args => ({
    components: { GlassPanel },
    setup: () => ({ args }),
    template: `
      <GlassPanel v-bind="args" class="max-w-md">
        <p class="text-body text-bone-100 font-instrument">
          Construimos con el estándar de las aplicaciones que admiramos.
        </p>
      </GlassPanel>
    `,
  }),
} satisfies Meta<typeof GlassPanel>

export default meta
type Story = StoryObj<typeof meta>

const allVariants: GlassVariant[] = [
  'red-strong',
  'red-soft',
  'bone-strong',
  'bone',
  'bone-faint',
  'dark',
]

export const RedStrong: Story = { args: { variant: 'red-strong' } }
export const RedSoft: Story = { args: { variant: 'red-soft' } }
export const BoneStrong: Story = { args: { variant: 'bone-strong' } }
export const Bone: Story = { args: { variant: 'bone' } }
export const BoneFaint: Story = { args: { variant: 'bone-faint' } }
export const Dark: Story = { args: { variant: 'dark' } }

/** The photo frames use the tight padding with the `bone` variant. */
export const TightPadding: Story = {
  args: { variant: 'bone', padding: 'tight' },
}

/** A card is an `<article>` without needing a second component. */
export const AsArticle: Story = {
  args: { variant: 'bone-strong', as: 'article' },
}

export const AllVariants: Story = {
  args: { variant: 'red-strong' },
  render: () => ({
    components: { GlassPanel },
    setup: () => ({ allVariants }),
    template: `
      <div class="flex flex-wrap items-start gap-6 font-instrument">
        <figure v-for="variant in allVariants" :key="variant" class="w-64">
          <GlassPanel :variant="variant">
            <p class="text-body-sm text-bone-100">Vidrio muush</p>
          </GlassPanel>
          <figcaption class="text-meta text-bone-300 pt-2">{{ variant }}</figcaption>
        </figure>
      </div>
    `,
  }),
}
