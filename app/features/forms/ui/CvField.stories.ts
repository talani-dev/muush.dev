import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CvField from './CvField.vue'

/**
 * The application's CV box (feature 45, pen extract-45 § 5): 96 tall, PDF
 * only, up to 5 MB (Roberto 2026-11-02). Pick a file: a PDF shows its
 * name; anything else is refused by the form.
 */
const meta = {
  title: 'Forms/CvField',
  component: CvField,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof CvField>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const es = {
  id: 'cv',
  label: 'CV',
  placeholder: 'Adjunta tu CV en PDF · máximo 5 MB',
  modelValue: null,
}

export const EsMobile390: Story = { args: es, globals: mobile }
export const EnDesktop1440: Story = {
  args: { ...es, placeholder: 'Attach your CV as a PDF · max 5 MB' },
  globals: desktop,
}
export const ChosenDesktop1440: Story = {
  args: {
    ...es,
    modelValue: new File(['%PDF'], 'cv-ana-ruiz.pdf', {
      type: 'application/pdf',
    }),
  },
  globals: desktop,
}
export const RefusedEsMobile390: Story = {
  args: { ...es, error: 'Adjunta tu CV en PDF de hasta 5 MB.' },
  globals: mobile,
}
