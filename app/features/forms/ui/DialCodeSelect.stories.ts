import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { buildCountryOptions } from '@/features/forms/logic/countryOptions'
import DialCodeSelect from './DialCodeSelect.vue'

/* Visual classes UNVERIFIED against the `.pen` (feature 32 spec OA-10). */
const meta = {
  title: 'Forms/DialCodeSelect',
  component: DialCodeSelect,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DialCodeSelect>

export default meta
type Story = StoryObj<typeof meta>

const spanish = buildCountryOptions('es-MX')

export const Default: Story = {
  args: {
    id: 'whatsappCountry',
    modelValue: 'MX',
    options: spanish,
    label: 'Lada del país',
  },
}

export const English: Story = {
  args: {
    id: 'whatsappCountry',
    modelValue: 'US',
    options: buildCountryOptions('en'),
    label: 'Country code',
  },
}

export const Colombia: Story = {
  args: {
    id: 'whatsappCountry',
    modelValue: 'CO',
    options: spanish,
    label: 'Lada del país',
  },
}

export const WithError: Story = {
  args: {
    id: 'whatsappCountry',
    modelValue: 'MX',
    options: spanish,
    label: 'Lada del país',
    error: 'Elige la lada de tu país',
    errorId: 'whatsappCountry-error',
  },
}

export const Readonly: Story = {
  args: {
    id: 'whatsappCountry',
    modelValue: 'MX',
    options: spanish,
    label: 'Lada del país',
    readonly: true,
  },
}
