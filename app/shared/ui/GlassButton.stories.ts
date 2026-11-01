import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GlassButton from '@/shared/ui/GlassButton.vue'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'

/**
 * The Muush 1.0 glass button (feature 42, FR-013; Kit `p0X8nQ`): 198 × 53 at
 * "Escritorio (1440)", 145 × 41 at "Móvil (390)", edge lighter at the top.
 * The hero pair puts it beside the primary button, as the hero draws them.
 * Copy from `docs/business/muush-1.0.md` § 4.2.
 */
const meta = {
  title: 'Shared/UI/GlassButton',
  component: GlassButton,
  globals: { backgrounds: { value: 'negro' } },
} satisfies Meta<typeof GlassButton>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

function heroPair(primary: string, secondary: string) {
  return () => ({
    components: { GlassButton, PrimaryButton },
    setup: () => ({ primary, secondary }),
    template: `
      <div class="flex flex-wrap justify-center gap-boton-gap p-gutter">
        <PrimaryButton :label="primary" size="hero" />
        <GlassButton :label="secondary" />
      </div>`,
  })
}

export const Es: Story = { args: { label: 'Cómo trabajamos' } }
export const En: Story = { args: { label: 'How we work' } }
export const EsMobile390: Story = {
  args: { label: 'Cómo trabajamos' },
  globals: mobile,
}
export const EnDesktop1440: Story = {
  args: { label: 'How we work' },
  globals: desktop,
}
export const HeroPairEsMobile390: Story = {
  args: { label: 'Cómo trabajamos' },
  render: heroPair('Diagnóstico gratis', 'Cómo trabajamos'),
  globals: mobile,
}
export const HeroPairEsDesktop1440: Story = {
  args: { label: 'Cómo trabajamos' },
  render: heroPair('Diagnóstico gratis', 'Cómo trabajamos'),
  globals: desktop,
}
export const HeroPairEnMobile390: Story = {
  args: { label: 'How we work' },
  render: heroPair('Free assessment', 'How we work'),
  globals: mobile,
}
export const HeroPairEnDesktop1440: Story = {
  args: { label: 'How we work' },
  render: heroPair('Free assessment', 'How we work'),
  globals: desktop,
}
