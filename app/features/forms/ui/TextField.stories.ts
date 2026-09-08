import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TextField from './TextField.vue'

const meta = {
  title: 'Forms/TextField',
  component: TextField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { id: 'name', label: 'Nombre', modelValue: '' },
}

export const WithError: Story = {
  args: {
    id: 'email',
    label: 'Correo',
    type: 'email',
    modelValue: 'not-an-email',
    error: 'Formato de correo inválido',
  },
}

export const ReadOnly: Story = {
  args: { id: 'name', label: 'Nombre', modelValue: 'Ana', readonly: true },
}
