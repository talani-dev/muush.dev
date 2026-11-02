import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { buildCountryOptions } from '@/features/forms/logic/countryOptions'
import WhatsappField from './WhatsappField.vue'

/**
 * The conditional WhatsApp row (feature 45, spec FR-019): dial code and
 * number side by side in the v2 anatomy. The `.pen` draws no v2 frame for it.
 */
const meta = {
  title: 'Forms/WhatsappField',
  component: WhatsappField,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof WhatsappField>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const es = {
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
}
const en = {
  ...es,
  content: {
    whatsapp: { label: 'WhatsApp number' },
    whatsappCountry: {
      label: 'Country code',
      options: buildCountryOptions('en'),
    },
  },
}

export const EsMobile390: Story = { args: es, globals: mobile }
export const EnDesktop1440: Story = {
  args: { ...en, modelValue: '55 4433 2211' },
  globals: desktop,
}
export const InvalidEsDesktop1440: Story = {
  args: {
    ...es,
    modelValue: '12345',
    errors: { number: 'Deben ser entre 6 y 14 dígitos.' },
  },
  globals: desktop,
}
