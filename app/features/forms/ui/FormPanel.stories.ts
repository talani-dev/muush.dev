import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FormPanel from './FormPanel.vue'

/**
 * The form's glass panel (feature 45; pen extract-45 §§ 1, 2, 4): radius 22,
 * padding 20, flat Blanco 12 % edge on mobile; the `panel` glass preset
 * (28, 36, top-lit edge, shadow) from 768 px; 600 wide at most.
 */
const meta = {
  title: 'Forms/FormPanel',
  component: FormPanel,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof FormPanel>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const render: Story['render'] = () => ({
  components: { FormPanel },
  template:
    '<FormPanel><p class="font-texto text-p text-texto-suave">Contenido del formulario</p></FormPanel>',
})

export const Mobile390: Story = { render, globals: mobile }
export const Desktop1440: Story = { render, globals: desktop }
