import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { APPLICATION_FORM_COPY } from './formsFixtures.testing'
import SendNotice from './SendNotice.vue'

/**
 * What the notice says (feature 45, spec FR-013, FR-034): a failed send
 * with the support link, or a failed CV upload with "Enviar sin CV".
 */
const meta = {
  title: 'Forms/SendNotice',
  component: SendNotice,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof SendNotice>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const es = APPLICATION_FORM_COPY.es
const en = APPLICATION_FORM_COPY.en

export const SendErrorEsDesktop1440: Story = {
  args: { kind: 'server-error', error: es.error },
  globals: desktop,
}
export const SendErrorEnMobile390: Story = {
  args: { kind: 'server-error', error: en.error },
  globals: mobile,
}
export const CvUploadFailedEsMobile390: Story = {
  args: {
    kind: 'cv-upload-error',
    error: es.error,
    cvUploadError: es.cvUploadError,
  },
  globals: mobile,
}
export const CvUploadFailedEnDesktop1440: Story = {
  args: {
    kind: 'cv-upload-error',
    error: en.error,
    cvUploadError: en.cvUploadError,
  },
  globals: desktop,
}
