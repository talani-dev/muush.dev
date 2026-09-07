import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Radar, { type RadarSize } from '@/shared/ui/Radar.vue'

/**
 * The three radar sizes of docs/business/landing/design-extract.md § 2, as
 * footprint / dot: sm 20/7 (inside a Pill), md 30/12 (Propósito and desktop
 * Servicios) and sm-alt 22/10 (the mobile services timeline).
 *
 * A radar is a red dot and its ping — **there are no halo rings**. The
 * design file draws two, but they are how a static mockup draws this
 * animation; rendering them as well would show the drawn effect and the real
 * one at once. If you see concentric circles at rest in any story below,
 * that is the bug.
 *
 * How to review the ping: every story pulses on its own, once every 2.4s, and
 * the ring grows past the footprint — that overshoot is what reads as a radar
 * sweep instead of a halo. The dot itself must never move, grow or dim. Use
 * `Ping` for a close reading, where each radar is given room for the ring at
 * its full `scale(3)`.
 *
 * None of the sizes exposes an opacity control — the mobile lyrics ladder
 * belongs to that section.
 */
const meta = {
  title: 'Shared/UI/Radar',
  component: Radar,
} satisfies Meta<typeof Radar>

export default meta
type Story = StoryObj<typeof meta>

const allSizes: RadarSize[] = ['sm', 'md', 'sm-alt']

export const Small: Story = { args: { size: 'sm' } }
export const Medium: Story = { args: { size: 'md' } }
export const SmallAlt: Story = { args: { size: 'sm-alt' } }

export const AllSizes: Story = {
  render: () => ({
    components: { Radar },
    setup: () => ({ allSizes }),
    template: `
      <div class="flex items-end gap-8 font-instrument">
        <figure v-for="size in allSizes" :key="size" class="flex flex-col items-center gap-2">
          <Radar :size="size" />
          <figcaption class="text-meta text-bone-300">{{ size }}</figcaption>
        </figure>
      </div>
    `,
  }),
}

/**
 * The ping at all three sizes, spaced out so the ring is legible end to end
 * as it passes the edge of the footprint (7→21, 12→36, 10→30). The three run
 * out of phase with each other on purpose — they are independent CSS loops,
 * exactly as they will be across the 19 instances of the page, and nothing
 * synchronises them.
 */
export const Ping: Story = {
  render: () => ({
    components: { Radar },
    setup: () => ({ allSizes }),
    template: `
      <div class="flex items-center gap-page py-page font-instrument">
        <figure v-for="size in allSizes" :key="size" class="flex flex-col items-center gap-glass-tight">
          <Radar :size="size" />
          <figcaption class="text-meta text-bone-300">{{ size }}</figcaption>
        </figure>
      </div>
    `,
  }),
}

/**
 * Reduced motion cannot be forced from a story — it is an operating-system
 * setting. To check the fallback, turn on "Reduce motion" in the OS (macOS:
 * System Settings → Accessibility → Display) and reload: the ping must be
 * gone entirely, with no frozen ring left behind, and the red dot must still
 * be there at full strength. The dot is the marker and the ping is the
 * ornament, so nothing is lost — static also works.
 */
export const ReducedMotion: Story = { args: { size: 'md' } }

/**
 * The footprint is invisible but load-bearing: the Pill's `gap: 11` and
 * `padding: [9,20,9,10]`, and the section layouts, are measured against the
 * 20/30/22 box, not against the dot. Here it is outlined so the reserved
 * space and the dot's centring can be checked at once — the outline is a
 * review aid and exists nowhere in the component.
 */
export const Footprint: Story = {
  render: () => ({
    components: { Radar },
    setup: () => ({ allSizes }),
    template: `
      <div class="flex items-center gap-page font-instrument">
        <figure v-for="size in allSizes" :key="size" class="flex flex-col items-center gap-glass-tight">
          <span class="inline-flex outline outline-glass-line">
            <Radar :size="size" />
          </span>
          <figcaption class="text-meta text-bone-300">{{ size }}</figcaption>
        </figure>
      </div>
    `,
  }),
}
