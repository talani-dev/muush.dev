import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CONTACT_FORM_COPY } from './formsFixtures.testing'
import NameEmailRow from './NameEmailRow.vue'

/**
 * "Nombre | Correo", the first row of both forms (feature 45): stacked at
 * "Móvil (390)", side by side at "Escritorio (1440)".
 */
const meta = {
  title: 'Forms/NameEmailRow',
  component: NameEmailRow,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof NameEmailRow>

export default meta
type Story = StoryObj<typeof meta>

export const EsMobile390: Story = {
  args: {
    name: '',
    email: '',
    content: CONTACT_FORM_COPY.es.fields,
    errors: {},
  },
  globals: { viewport: { value: 'mobile' } },
}
export const EnInvalidDesktop1440: Story = {
  args: {
    name: '',
    email: 'mary@',
    content: CONTACT_FORM_COPY.en.fields,
    errors: {
      name: 'Enter your name.',
      email: 'Enter an email like name@company.com',
    },
  },
  globals: { viewport: { value: 'desktop' } },
}
