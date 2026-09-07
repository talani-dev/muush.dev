import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * Smoke story: proves the Storybook pipeline resolves Tailwind tokens from
 * global.css. Replaced by the real GlassPanel story when that component is
 * ported to Vue.
 */
const meta = {
  title: 'Shared/Tokens smoke test',
  render: () => ({
    template: `
      <div class="flex gap-4 p-8 font-instrument">
        <div class="rounded-panel border border-bone-100/20 bg-bone-100/6 p-8 text-bone-100 backdrop-blur">
          bone
        </div>
        <div class="rounded-panel border border-red-400/45 bg-red-400/12 p-8 text-bone-100 backdrop-blur">
          red
        </div>
      </div>
    `,
  }),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Tokens: Story = {}
