import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SelectField from './SelectField.vue'

/**
 * A v2 native select with the 16 px Gris 400 chevron (feature 45, spec
 * FR-021). Open it with the keyboard; Esc closes it unchanged.
 */
const meta = {
  title: 'Forms/SelectField',
  component: SelectField,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof SelectField>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const options = [
  { value: 'realEstate', label: 'Bienes raíces/inmobiliaria' },
  { value: 'company', label: 'Empresa pública o privada' },
  { value: 'other', label: 'Otro' },
]
const es = {
  id: 'identity',
  label: '¿Cómo te identificas?',
  modelValue: '',
  placeholder: 'Selecciona una opción',
  options,
}

export const EsMobile390: Story = { args: es, globals: mobile }
export const EnDesktop1440: Story = {
  args: { ...es, label: 'You are a…', placeholder: 'Select an option' },
  globals: desktop,
}
export const PickedDesktop1440: Story = {
  args: { ...es, modelValue: 'company' },
  globals: desktop,
}
export const GroupedEsDesktop1440: Story = {
  args: {
    id: 'areaRole',
    label: 'Área y rol',
    modelValue: '',
    placeholder: 'Selecciona tu área y rol',
    groups: [
      {
        label: 'IT',
        options: [
          { value: 'it:backend', label: 'Backend' },
          { value: 'it:frontend', label: 'Frontend' },
        ],
      },
      {
        label: 'Product',
        options: [{ value: 'product:uxUiDesign', label: 'UX/UI design' }],
      },
    ],
  },
  globals: desktop,
}
export const InvalidEsMobile390: Story = {
  args: { ...es, error: 'Elige una opción.' },
  globals: mobile,
}
