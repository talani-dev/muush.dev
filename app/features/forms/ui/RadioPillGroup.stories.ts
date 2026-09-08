import type { Meta, StoryObj } from '@storybook/vue3-vite'
import RadioPillGroup from './RadioPillGroup.vue'

const meta = {
  title: 'Forms/RadioPillGroup',
  component: RadioPillGroup,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RadioPillGroup>

export default meta
type Story = StoryObj<typeof meta>

const options = [
  { value: 'email', label: 'Correo' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

export const EmailActive: Story = {
  args: {
    id: 'contactPreference',
    label: '¿Cómo prefieres que te contactemos?',
    modelValue: 'email',
    options,
  },
}

export const WhatsAppActive: Story = {
  args: {
    id: 'contactPreference',
    label: '¿Cómo prefieres que te contactemos?',
    modelValue: 'whatsapp',
    options,
  },
}
