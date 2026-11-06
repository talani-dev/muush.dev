import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FormSuccess from './FormSuccess.vue'
import {
  APPLICATION_FORM_COPY,
  CONTACT_FORM_COPY,
} from './formsFixtures.testing'

/**
 * "Enviado" (feature 45, spec FR-014; pen extract-45 §§ 3, 8): the tile
 * with the pinging red dot (none with reduced motion), the title, the text
 * and the glass button. 56 / 26 on mobile, 64 / 32 on desktop.
 */
const meta = {
  title: 'Forms/FormSuccess',
  component: FormSuccess,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof FormSuccess>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

export const ContactEsDesktop1440: Story = {
  args: CONTACT_FORM_COPY.es.success,
  globals: desktop,
}
export const ContactEnMobile390: Story = {
  args: CONTACT_FORM_COPY.en.success,
  globals: mobile,
}
export const ApplicationEsMobile390: Story = {
  args: APPLICATION_FORM_COPY.es.success,
  globals: mobile,
}
export const ApplicationEnDesktop1440: Story = {
  args: APPLICATION_FORM_COPY.en.success,
  globals: desktop,
}
