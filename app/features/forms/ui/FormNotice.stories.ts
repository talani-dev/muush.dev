import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FormNotice from './FormNotice.vue'

/**
 * The "Aviso" (feature 45, spec FR-013; pen extract-45 §§ 3, 8): Red 12 %
 * fill, Red 40 % edge, an 8 px dot; 12 / 14 and 13 px on mobile, 14 / 16
 * and 14 px on desktop.
 */
const meta = {
  title: 'Forms/FormNotice',
  component: FormNotice,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
  decorators: [
    () => ({ template: '<div class="max-w-panel-form"><story /></div>' }),
  ],
} satisfies Meta<typeof FormNotice>

export default meta
type Story = StoryObj<typeof meta>

const mobile = { viewport: { value: 'mobile' } }
const desktop = { viewport: { value: 'desktop' } }

const render =
  (text: string): Story['render'] =>
  () => ({
    components: { FormNotice },
    setup: () => ({ text }),
    template: '<FormNotice>{{ text }}</FormNotice>',
  })
const es =
  'El envío se interrumpió. Tus datos siguen aquí: vuelve a intentarlo o escríbenos a support@muush.dev.'
const en =
  'Sending was interrupted. Your details are still here: try again or write to us at support@muush.dev.'

export const EsMobile390: Story = { render: render(es), globals: mobile }
export const EnDesktop1440: Story = { render: render(en), globals: desktop }
