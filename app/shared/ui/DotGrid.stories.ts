import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DotGrid from '@/shared/ui/DotGrid.vue'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'

/**
 * The site's dotted paper, and the only place the four-layer background is
 * reviewable at all.
 *
 * `happy-dom` does no layout and no painting, so **no test in this repository
 * can tell you that a glow rendered beneath a dot** (feature 006
 * `research.md` § R7). The component tests prove the layer resolves its
 * tokens and stays inert; these stories are where the paint order is actually
 * checked, by eye.
 *
 * What to look for, in every story below:
 *
 * 1. The dots cover the **whole** canvas, at an even 24px step, with no seam
 *    and no change in density.
 * 2. Glows bloom **under** the dots — you can see the dot pattern continue
 *    across a glow. A glow that looks like it is floating on top of the dots
 *    is the failure the whole mechanism exists to prevent, and it fails
 *    silently: nothing errors.
 * 3. Text sits **above** both, unmuddied.
 *
 * The design's four layers, bottom to top, are the child order of frame
 * `SdEJx`: ink-500 base → section glows (`--layer-glow`, -3) → dotted paper
 * (`--layer-dots`, -2) → content, with the cursor spotlight
 * (`--layer-spotlight`, -1) between the dots and the content — feature 008
 * renumbered the stack to three negative levels so it could paint above the
 * dots and brighten them (`rules.md` § R37). Flip the viewport control between
 * Móvil (390) and Escritorio (1440): the dot step is fixed and the glow
 * diameters are `clamp()`s, so the dots must stay put while the glows resize.
 */
const meta = {
  title: 'Shared/UI/DotGrid',
  component: DotGrid,
} satisfies Meta<typeof DotGrid>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The host the layout provides, reproduced exactly: the page's single stacking
 * context, positioned, spanning the whole document, painting the ink base and
 * clipping horizontal overflow with `clip` rather than `hidden`
 * (`contracts/components.md` § Host contract).
 */
const HOST = 'relative isolate min-h-svh overflow-x-clip bg-ink-500'

/** A stand-in section: the positioning reference for its own glows, and
 *  nothing else. No transform, no opacity, no opaque background — those are
 *  what would trap its glows above the dot sheet. */
const SECTION = 'relative px-page py-24'

/**
 * The layer on its own over ink-500, with nothing else on the canvas.
 *
 * This is the story for the texture itself: 2.5px dots on a 24px grid at 12%
 * ink-100. It should read as paper, not as a pattern — if you can see rows,
 * columns or moiré at 100% zoom, the step or the radius is wrong.
 */
export const Default: Story = {
  render: () => ({
    components: { DotGrid },
    setup: () => ({ HOST }),
    template: `
      <div :class="HOST">
        <DotGrid />
      </div>
    `,
  }),
}

/**
 * The whole stack, with the real Hero triplet: `Hero · foco` (red-400 65%,
 * 1500-700), `Hero · wine` (wine-300 40%, 1100-520) and `Hero · cierre`
 * (wine-400 30%, 900-520) — `design-extract.md` § 10, at their real fills and
 * real diameters.
 *
 * The arrangement is the one to copy when building a section: the section is
 * `position: relative`, its glows go inside a `<SectionBackdrop>`, and each
 * glow is positioned with utilities on itself. The offsets here belong to this
 * story — the design's own coordinates are page-absolute inside a 1440×5060
 * frame and must be converted to section-relative ones by whoever builds the
 * section (`rules.md` § R29).
 *
 * **This is the story that proves FR-005.** All four layers are visible at
 * once: ink under the glows, glows under the dots, dots under the text.
 */
export const ComposedBackground: Story = {
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

          <div class="mx-auto max-w-shell-max font-instrument text-bone-100">
            <p class="text-display">Hablamos negocio y código.</p>
            <p class="max-w-2xl pt-6 text-body-lg text-bone-300">
              Construimos con el estándar de las aplicaciones que admiramos.
              Tu negocio merece estar a la misma altura.
            </p>
          </div>
        </section>
      </div>
    `,
  }),
}

/*
 * The additive-contribution story — two sections each carrying their own glow
 * set — lives in `SectionBackdrop.stories.ts`, because that is the component
 * whose contract it demonstrates.
 */
