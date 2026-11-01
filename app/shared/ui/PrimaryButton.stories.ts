import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PrimaryButton from '@/shared/ui/PrimaryButton.vue'

/**
 * The Muush 1.0 primary button (feature 42, FR-012; Kit `FcCCF`). Measure in
 * the viewport toolbar: hero 253 × 55 at "Escritorio (1440)" and 178 × 44
 * with the arrow at "Móvil (390)"; nav 195 × 40; block full width × 55.
 * Tab to it: a Blanco ring 3 px away. Copy from `muush-1.0.md` §§ 4.1, 4.6.
 */
const meta = {
  title: 'Shared/UI/PrimaryButton',
  component: PrimaryButton,
  globals: { backgrounds: { value: 'negro' } },
} satisfies Meta<typeof PrimaryButton>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const heroEs = { label: 'Diagnóstico gratis', size: 'hero' } as const
const heroEn = { label: 'Free assessment', size: 'hero' } as const
const nav = { label: 'Diagnóstico gratis', size: 'nav' } as const
const blockEs = {
  label: 'Quiero mi diagnóstico',
  size: 'block',
  type: 'submit',
} as const
const blockEn = { ...blockEs, label: 'Get my assessment' } as const
const disabled = { ...blockEs, label: 'Enviando…', disabled: true } as const

/** The block button fills its form column, as in the form panel. */
const inColumn: Story['render'] = args => ({
  components: { PrimaryButton },
  setup: () => ({ args }),
  template:
    '<div class="max-w-contenido p-gutter"><PrimaryButton v-bind="args" /></div>',
})

export const HeroEs: Story = { args: heroEs }
export const HeroEn: Story = { args: heroEn }
export const HeroEsMobile390: Story = { args: heroEs, globals: mobile }
export const HeroEnDesktop1440: Story = { args: heroEn, globals: desktop }
export const Nav: Story = { args: nav }
export const NavDesktop1440: Story = {
  args: { ...nav, label: 'Free assessment' },
  globals: desktop,
}
export const BlockEs: Story = { args: blockEs, render: inColumn }
export const BlockEn: Story = { args: blockEn, render: inColumn }
export const BlockMobile390: Story = {
  args: blockEs,
  render: inColumn,
  globals: mobile,
}
export const BlockDesktop1440: Story = {
  args: blockEn,
  render: inColumn,
  globals: desktop,
}
export const DisabledEs: Story = { args: disabled, render: inColumn }
export const DisabledEn: Story = {
  args: { ...disabled, label: 'Sending…' },
  render: inColumn,
}
export const DisabledMobile390: Story = {
  args: disabled,
  render: inColumn,
  globals: mobile,
}
export const DisabledDesktop1440: Story = {
  args: disabled,
  render: inColumn,
  globals: desktop,
}
