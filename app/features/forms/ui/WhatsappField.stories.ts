import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { buildCountryOptions } from '@/features/forms/logic/countryOptions'
import WhatsappField from './WhatsappField.vue'

/* Visual classes UNVERIFIED against the `.pen` (feature 32 spec OA-10). */
const meta = {
  title: 'Forms/WhatsappField',
  component: WhatsappField,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WhatsappField>

export default meta
type Story = StoryObj<typeof meta>

export const Spanish: Story = {
  args: {
    visible: true,
    modelValue: '',
    country: 'MX',
    content: {
      whatsapp: { label: 'Número de WhatsApp' },
      whatsappCountry: {
        label: 'Lada del país',
        options: buildCountryOptions('es-MX'),
      },
    },
  },
}

export const English: Story = {
  args: {
    visible: true,
    modelValue: '',
    country: 'US',
    content: {
      whatsapp: { label: 'WhatsApp number' },
      whatsappCountry: {
        label: 'Country code',
        options: buildCountryOptions('en'),
      },
    },
  },
}

export const BothErrors: Story = {
  args: {
    ...Spanish.args,
    modelValue: '12345',
    country: 'CO',
    errors: {
      number: 'Deben ser entre 6 y 14 dígitos',
      country: 'Elige la lada de tu país',
    },
  },
}
