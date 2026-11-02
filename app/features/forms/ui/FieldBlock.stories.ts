import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FieldBlock from './FieldBlock.vue'

/**
 * A v2 field's label, control slot and help line (feature 45, pen
 * extract-45 §§ 2–4): gap 7 and a 12 / 400 label on mobile, gap 8 and a
 * 12 / 600 tracked label on desktop.
 */
const meta = {
  title: 'Forms/FieldBlock',
  component: FieldBlock,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FieldBlock>

export default meta
type Story = StoryObj<typeof meta>

const render: Story['render'] = args => ({
  components: { FieldBlock },
  setup: () => ({ args }),
  template:
    '<div class="max-w-panel-form"><FieldBlock v-bind="args"><div class="h-campo-alto rounded-campo bg-carbon-800 md:h-campo-alto-escritorio md:rounded-campo-escritorio" /></FieldBlock></div>',
})

export const EsMobile390: Story = {
  args: { id: 'name', label: 'Nombre' },
  render,
  globals: { viewport: { value: 'mobile' } },
}
export const EnInvalidDesktop1440: Story = {
  args: { id: 'name', label: 'Name', error: 'Enter your name.' },
  render,
  globals: { viewport: { value: 'desktop' } },
}
