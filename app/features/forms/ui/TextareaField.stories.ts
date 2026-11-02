import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TextareaField from './TextareaField.vue'

/**
 * "¿Qué necesitas?" (feature 45, pen extract-45 § 2): 96 tall, padding
 * 14 / 16 on desktop, 12 / 14 on mobile.
 */
const meta = {
  title: 'Forms/TextareaField',
  component: TextareaField,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof TextareaField>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const es = {
  id: 'need',
  label: '¿Qué necesitas?',
  modelValue: '',
  placeholder: 'Cuéntanos en un par de líneas qué quieres resolver.',
}
const en = {
  ...es,
  label: 'What do you need?',
  placeholder: 'Tell us in a couple of lines what you want to solve.',
}

export const EsMobile390: Story = { args: es, globals: mobile }
export const EnDesktop1440: Story = { args: en, globals: desktop }
export const InvalidEsDesktop1440: Story = {
  args: { ...es, modelValue: 'Un sitio', error: 'Cuéntanos un poco más.' },
  globals: desktop,
}
