import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CONTACT_FORM_COPY } from './formsFixtures.testing'
import SteppedForm from './SteppedForm.vue'
import TextField from './TextField.vue'

/**
 * The shell both v2 forms share (feature 45, research R2), with
 * placeholder fields in its three slots: the single view, and the stepped
 * view's two steps. The real forms are `Forms/ContactForm` and
 * `Forms/ApplicationForm`.
 */
const meta = {
  title: 'Forms/SteppedForm',
  component: SteppedForm,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SteppedForm>

export default meta
type Story = StoryObj<typeof meta>

const render: Story['render'] = args => ({
  components: { SteppedForm, TextField },
  setup: () => ({ args }),
  template: `<SteppedForm v-bind="args">
    <template #details><TextField id="a" label="Detalles" model-value="" /></template>
    <template #profile><TextField id="b" label="Perfil" model-value="" /></template>
    <template #channel><TextField id="c" label="Canal" model-value="" /></template>
  </SteppedForm>`,
})

const base = {
  chrome: CONTACT_FORM_COPY.es,
  isStepped: false,
  step: 1,
  accepted: false,
  honeypot: '',
  submitLabel: CONTACT_FORM_COPY.es.submit,
  busy: false,
} as const

export const SingleDesktop1440: Story = {
  args: base,
  render,
  globals: { viewport: { value: 'desktop' } },
}
export const Step1Mobile390: Story = {
  args: { ...base, isStepped: true },
  render,
  globals: { viewport: { value: 'mobile' } },
}
export const Step2Mobile390: Story = {
  args: { ...base, isStepped: true, step: 2, accepted: true },
  render,
  globals: { viewport: { value: 'mobile' } },
}
