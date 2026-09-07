import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BotonPrimario, {
  type ButtonVariant,
} from '@/shared/ui/BotonPrimario.vue'

/**
 * The site's single animated control, from
 * docs/business/landing/design-extract.md § 4.
 *
 * How to review the ring: hover it on a pointer device and it turns once
 * every 2.6s; leave and it stops. The three stops are red-400 → bone-100 →
 * red-400 — if you see wine anywhere, that is a defect.
 *
 * The label is slot content in both locales below, to show that no copy is
 * baked into the component.
 */
const meta = {
  title: 'Shared/UI/BotonPrimario',
  component: BotonPrimario,
  render: args => ({
    components: { BotonPrimario },
    setup: () => ({ args }),
    template:
      '<BotonPrimario v-bind="args">Cuéntanos tu proyecto</BotonPrimario>',
  }),
} satisfies Meta<typeof BotonPrimario>

export default meta
type Story = StoryObj<typeof meta>

const allVariants: ButtonVariant[] = ['nav', 'hero', 'submit']

export const Nav: Story = { args: { variant: 'nav' } }
export const Hero: Story = { args: { variant: 'hero' } }
export const Submit: Story = { args: { variant: 'submit' } }

/** With `href` the control is a real link, not a button. */
export const AsLink: Story = {
  args: { variant: 'hero', href: '#contacto' },
  render: args => ({
    components: { BotonPrimario },
    setup: () => ({ args }),
    template:
      '<BotonPrimario v-bind="args">Tell us about your project</BotonPrimario>',
  }),
}

export const AllVariants: Story = {
  render: () => ({
    components: { BotonPrimario },
    setup: () => ({ allVariants }),
    template: `
      <div class="flex flex-wrap items-center gap-8 font-instrument">
        <figure v-for="variant in allVariants" :key="variant" class="flex flex-col items-start gap-2">
          <BotonPrimario :variant="variant">Cuéntanos tu proyecto</BotonPrimario>
          <figcaption class="text-meta text-bone-300">{{ variant }}</figcaption>
        </figure>
      </div>
    `,
  }),
}

/**
 * Reduced motion cannot be forced from a story — it is an operating-system
 * setting. To check the fallback, turn on "Reduce motion" in the OS (macOS:
 * System Settings → Accessibility → Display) and reload: the ring must go
 * flat red-400 and never animate, on hover or otherwise. A touch device gets
 * the same static ring while decisions-open.md #8 is open.
 */
export const ReducedMotion: Story = { args: { variant: 'hero' } }
