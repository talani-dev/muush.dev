import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MapPin from '@/shared/ui/MapPin.vue'

/**
 * The three pin kinds of the map (feature 44, pen extract-44 § 2.1, § 9):
 * team (red) and partner (Acero 200) dots with the radar ping, and the
 * hollow "coming soon" ring with none. Each sits at the centre of a 28 px
 * frame; the ping overflows it. Reduced motion shows the dots only.
 * Coverage note (review-44): a pin has no text and no breakpoint-dependent
 * look (it keeps 28 × 28 at every width), so it has no locale or viewport
 * axis; `WorldMap`'s stories show it at 390 and 1440 in ES and EN.
 */
const meta = {
  title: 'Shared/UI/MapPin',
  component: MapPin,
  globals: { backgrounds: { value: 'negro' } },
  args: { leftPercent: 50, topPercent: 50 },
  decorators: [
    () => ({ template: '<div class="relative size-pin"><story /></div>' }),
  ],
} satisfies Meta<typeof MapPin>

export default meta
type Story = StoryObj<typeof meta>

export const Team: Story = { args: { kind: 'team' } }
export const Partner: Story = { args: { kind: 'partner' } }
export const Soon: Story = { args: { kind: 'soon' } }
