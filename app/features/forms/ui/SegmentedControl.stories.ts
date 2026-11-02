import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SegmentedControl from './SegmentedControl.vue'

/**
 * The contact choice (feature 45, pen extract-45 §§ 2, 4, 8): a radio
 * group — Tab once, then the arrow keys. Desktop: a pill with the selected
 * option in Carbón 700 and a 6 px red dot; mobile: square-ish, no dot.
 */
const meta = {
  title: 'Forms/SegmentedControl',
  component: SegmentedControl,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const es = {
  id: 'contactPreference',
  label: '¿Cómo prefieres que te contactemos?',
  modelValue: 'email',
  options: [
    { value: 'email', label: 'Correo' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ],
}
const en = {
  ...es,
  label: 'How should we contact you?',
  options: [
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ],
}

export const EsMobile390: Story = { args: es, globals: mobile }
export const EnMobile390: Story = {
  args: { ...en, modelValue: 'whatsapp' },
  globals: mobile,
}
export const EsDesktop1440: Story = { args: es, globals: desktop }
export const EnDesktop1440: Story = {
  args: { ...en, modelValue: 'whatsapp' },
  globals: desktop,
}
