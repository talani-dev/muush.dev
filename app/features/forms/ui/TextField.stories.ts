import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TextField from './TextField.vue'

/**
 * A v2 one-line field (feature 45, pen extract-45 §§ 2–4): 46 tall with no
 * stroke at "Móvil (390)", 50 tall with the Blanco 10 % stroke at
 * "Escritorio (1440)"; the red stroke and help line when invalid (§ 3).
 */
const meta = {
  title: 'Forms/TextField',
  component: TextField,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const es = {
  id: 'name',
  label: 'Nombre',
  modelValue: '',
  placeholder: 'Nombre y apellido',
}
const en = { ...es, label: 'Name', placeholder: 'First and last name' }

export const EsMobile390: Story = { args: es, globals: mobile }
export const EnDesktop1440: Story = { args: en, globals: desktop }
export const FilledDesktop1440: Story = {
  args: { ...es, modelValue: 'María Fernanda Ruiz' },
  globals: desktop,
}
export const InvalidEsMobile390: Story = {
  args: { ...es, error: 'Escribe tu nombre.' },
  globals: mobile,
}
export const InvalidEnDesktop1440: Story = {
  args: {
    ...en,
    id: 'email',
    label: 'Email',
    modelValue: 'mary@',
    error: 'Enter an email like name@company.com',
  },
  globals: desktop,
}
