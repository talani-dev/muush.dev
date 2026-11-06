import type { Meta, StoryObj } from '@storybook/vue3-vite'
import LegalList from './LegalList.vue'

/**
 * A legal list (feature 48): bullets with the red 6 px dot, or the numbered
 * ARCO steps in red. Copy from the Aviso de privacidad.
 */
const meta = {
  title: 'Legal/LegalList',
  component: LegalList,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({
      template:
        '<div class="max-w-legal font-texto text-legal-cuerpo text-blanco"><story /></div>',
    }),
  ],
} satisfies Meta<typeof LegalList>

export default meta
type Story = StoryObj<typeof meta>

const steps = {
  es: [
    'Tu nombre y el correo donde quieres recibir la respuesta.',
    'Cualquier documento que nos ayude a ubicar tus datos.',
  ],
  en: [
    'Your name and the email where you want our reply.',
    'Any document that helps us find your data.',
  ],
}

export const StepsEsMobile390: Story = {
  args: { kind: 'steps', items: steps.es },
  globals: { viewport: { value: 'mobile' } },
}
export const BulletsEnDesktop1440: Story = {
  args: { kind: 'bullets', items: steps.en },
  globals: { viewport: { value: 'desktop' } },
}
