import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { buildCountryOptions } from '@/features/forms/logic/countryOptions'
import DialCodeSelect from './DialCodeSelect.vue'

/**
 * The WhatsApp dial code in the v2 anatomy (feature 45, spec FR-019): a
 * transparent native select over a `{flag} {dial code}` face.
 */
const meta = {
  title: 'Forms/DialCodeSelect',
  component: DialCodeSelect,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof DialCodeSelect>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

export const EsMobile390: Story = {
  args: {
    id: 'whatsappCountry',
    modelValue: 'MX',
    options: buildCountryOptions('es-MX'),
    label: 'Lada del país',
  },
  globals: mobile,
}
export const EnDesktop1440: Story = {
  args: {
    id: 'whatsappCountry',
    modelValue: 'US',
    options: buildCountryOptions('en'),
    label: 'Country code',
  },
  globals: desktop,
}
