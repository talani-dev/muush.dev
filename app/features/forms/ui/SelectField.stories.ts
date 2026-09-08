import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SelectField from './SelectField.vue'

const meta = {
  title: 'Forms/SelectField',
  component: SelectField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SelectField>

export default meta
type Story = StoryObj<typeof meta>

const options = [
  { value: 'company', label: 'Empresa' },
  { value: 'independent', label: 'Emprendedor o persona física' },
  { value: 'startup', label: 'Startup' },
  { value: 'creator', label: 'Creador de contenido o marca personal' },
  { value: 'other', label: 'Otro' },
]

export const Default: Story = {
  args: {
    id: 'identity',
    label: '¿Cómo te identificas?',
    modelValue: '',
    options,
    placeholder: '¿Cómo te identificas?',
  },
}

export const WithError: Story = {
  args: {
    id: 'identity',
    label: '¿Cómo te identificas?',
    modelValue: '',
    options,
    placeholder: '¿Cómo te identificas?',
    error: 'Elige una opción',
  },
}
