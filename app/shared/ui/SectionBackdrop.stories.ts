import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DotGrid from '@/shared/ui/DotGrid.vue'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'

/**
 * The container a section puts its own glows in — and the demonstration that
 * adding a section's glows touches exactly one file, that section's own
 * (SC-005).
 *
 * There is nothing to review about the component itself: it has no props, no
 * copy and no visible surface. What is reviewable is the **paint order it
 * buys**, which is why every story here composes it with `DotGrid` on the host
 * the layout provides.
 *
 * The mechanism, in one line: the layout is the page's only stacking context,
 * the dot sheet sits at `--layer-dots` (-1) and every backdrop at
 * `--layer-glow` (-2), so a glow written *inside* a section still paints
 * *beneath* a sheet written once in the layout. No registry, no route
 * metadata, no shared list of 21 (`docs/business/rules.md` § R28).
 */
const meta = {
  title: 'Shared/UI/SectionBackdrop',
  component: SectionBackdrop,
} satisfies Meta<typeof SectionBackdrop>

export default meta
type Story = StoryObj<typeof meta>

/** The host the layout provides (`contracts/components.md` § Host contract). */
const HOST = 'relative isolate min-h-svh overflow-x-clip bg-ink-500'

/** A stand-in section: the positioning reference for its own glows, and
 *  nothing else. No transform, no opacity below 1, no opaque background. */
const SECTION = 'relative px-page py-24'

/**
 * Two sections, each contributing its own glows, and no shared file edited to
 * make either appear.
 *
 * The first carries the real Hero triplet — `Hero · foco` (red-400 65%,
 * 1500-700), `Hero · wine` (wine-300 40%, 1100-520), `Hero · cierre`
 * (wine-400 30%, 900-520). The second carries the Propósito pair:
 * `Propósito · wine` (wine-400 20%, 1000-560) and `Propósito · red`, which the
 * design names "red" and fills with **wine-300** at 17%, 820-480
 * (`design-extract.md` § 10 — the names do not track the colour, which is why
 * `SectionGlow` takes colour and opacity outright).
 *
 * Both sets paint beneath the same page-wide dot sheet, each anchored to its
 * own section, and neither displaces the other. The third section contributes
 * nothing and still gets the base and the dots: the page-wide layers are the
 * layout's, never a section's.
 *
 * The offsets here belong to this story. The design's own coordinates are
 * page-absolute inside a 1440×5060 frame and must be converted to
 * section-relative ones by whoever builds the section (`rules.md` § R29).
 *
 * **The silent failure to watch for** (spec A-04): give either `<section>` a
 * `transform`, a `filter`, an `opacity` below 1, an `isolation` or a
 * `contain: paint`, and its glows jump above the dots. Nothing errors and no
 * test fails — the page just stops matching the design. A section that
 * genuinely needs one of those moves its glows to the page level instead.
 */
export const AdditiveContribution: Story = {
  render: () => ({
    components: { DotGrid, SectionBackdrop, SectionGlow },
    setup: () => ({ HOST, SECTION }),
    template: `
      <div :class="HOST">
        <DotGrid />

        <section :class="SECTION">
          <SectionBackdrop>
            <SectionGlow
              color="red-400"
              :opacity="65"
              size="1500-700"
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            <SectionGlow
              color="wine-300"
              :opacity="40"
              size="1100-520"
              class="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/2"
            />
            <SectionGlow
              color="wine-400"
              :opacity="30"
              size="900-520"
              class="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3"
            />
          </SectionBackdrop>

          <p class="font-instrument text-h2 text-bone-100">Hero · 3 glows</p>
        </section>

        <section :class="SECTION">
          <SectionBackdrop>
            <SectionGlow
              color="wine-400"
              :opacity="20"
              size="1000-560"
              class="absolute top-0 left-1/3 -translate-x-1/2"
            />
            <SectionGlow
              color="wine-300"
              :opacity="17"
              size="820-480"
              class="absolute right-0 bottom-0 translate-x-1/4"
            />
          </SectionBackdrop>

          <p class="font-instrument text-h2 text-bone-100">Propósito · 2 glows</p>
        </section>

        <section :class="SECTION">
          <p class="font-instrument text-h2 text-bone-100">
            Sin glows · sigue con base y puntos
          </p>
        </section>
      </div>
    `,
  }),
}
