import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ConsentCheckbox from './ConsentCheckbox.vue'

/**
 * The privacy consent (feature 45, spec FR-008; pen extract-45 §§ 2, 8):
 * 18 px box, Blanco 40 % stroke on mobile, 25 % on desktop; ticked it fills
 * Red muush. It enables sending and is never sent. "aviso de privacidad"
 * links to the privacy page in a new tab (feature 48).
 */
const meta = {
  title: 'Forms/ConsentCheckbox',
  component: ConsentCheckbox,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof ConsentCheckbox>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const es = {
  id: 'privacy',
  label: {
    before: 'Acepto el ',
    link: 'aviso de privacidad',
    after: ' y que muush me contacte sobre mi diagnóstico.',
    newTab: '(se abre en una pestaña nueva)',
    href: '/es/privacidad',
  },
  modelValue: false,
}
const en = {
  ...es,
  label: {
    before: 'I accept the ',
    link: 'privacy notice',
    after: ' and agree to be contacted by muush about my assessment.',
    newTab: '(opens in a new tab)',
    href: '/en/privacy',
  },
}

export const EsMobile390: Story = { args: es, globals: mobile }
export const EnDesktop1440: Story = { args: en, globals: desktop }
export const TickedEsDesktop1440: Story = {
  args: { ...es, modelValue: true },
  globals: desktop,
}
