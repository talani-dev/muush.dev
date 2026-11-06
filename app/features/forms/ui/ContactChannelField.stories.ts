import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ContactChannelField from './ContactChannelField.vue'
import { CONTACT_FORM_COPY } from './formsFixtures.testing'

/**
 * The contact block of both forms (feature 45): the segmented choice and,
 * only with WhatsApp, the dial code and number.
 */
const meta = {
  title: 'Forms/ContactChannelField',
  component: ContactChannelField,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof ContactChannelField>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

export const EsEmailMobile390: Story = {
  args: {
    preference: 'email',
    country: 'MX',
    number: '',
    content: CONTACT_FORM_COPY.es.fields,
  },
  globals: mobile,
}
export const EnWhatsappDesktop1440: Story = {
  args: {
    preference: 'whatsapp',
    country: 'MX',
    number: '',
    content: CONTACT_FORM_COPY.en.fields,
  },
  globals: desktop,
}
