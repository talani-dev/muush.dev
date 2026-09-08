import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TextareaField from './TextareaField.vue'

const meta = {
  title: 'Forms/TextareaField',
  component: TextareaField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TextareaField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { id: 'need', label: '¿Qué necesitas?', modelValue: '' },
}

export const WithError: Story = {
  args: {
    id: 'need',
    label: '¿Qué necesitas?',
    modelValue: 'corto',
    error: 'Cuéntanos un poco más',
  },
}
