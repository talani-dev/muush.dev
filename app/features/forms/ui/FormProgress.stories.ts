import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FormProgress from './FormProgress.vue'

/**
 * The mobile step progress (feature 45, spec FR-004; pen extract-45 § 4).
 * It exists only in the stepped view, below 768 px, so it has no desktop
 * story.
 */
const meta = {
  title: 'Forms/FormProgress',
  component: FormProgress,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof FormProgress>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }

export const EsStep1Mobile390: Story = {
  args: { id: 'p', label: 'Paso 1 de 2 · Tus datos', step: 1, total: 2 },
  globals: mobile,
}
export const EsStep2Mobile390: Story = {
  args: { id: 'p', label: 'Paso 2 de 2 · Tu negocio', step: 2, total: 2 },
  globals: mobile,
}
export const EnStep2Mobile390: Story = {
  args: { id: 'p', label: 'Step 2 of 2 · Your profile', step: 2, total: 2 },
  globals: mobile,
}
