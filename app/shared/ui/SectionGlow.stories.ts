import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SectionGlow, { type GlowSize } from '@/shared/ui/SectionGlow.vue'

/**
 * The radial background layer of the whole site: 21 circles, 11 on Landing
 * and 10 on Nosotros (docs/business/landing/design-extract.md § 10, corrected
 * against the design file — § 10 still prints 22 and 12, and `Sizes` below
 * says where the difference went). Every story below sits on the Ink 500
 * background, which is the only surface these ever appear on — the Bone and
 * Red backgrounds in the toolbar will make them look wrong, correctly so.
 *
 * **There are no named variants to review.** The 21 are hand-tuned: three
 * base colours crossed with ten opacities, and the design's own names do not
 * track the colour (`Propósito · red` is wine-300). So the props are colour,
 * opacity and size outright, and `Fills` is the catalogue of the 12 pairs
 * that actually exist. If you find yourself wanting `variant="foco"`, § 10's
 * warning is the answer.
 *
 * What to look for: the fade must reach nothing exactly at the circle's edge.
 * A visible ring where the circle ends means the gradient outran the shape —
 * see `Edge`. And flip the viewport control between Móvil (390) and
 * Escritorio (1440): every diameter is a `clamp()`, so the glows must resize
 * smoothly, with no jump at any width.
 */
const meta = {
  title: 'Shared/UI/SectionGlow',
  component: SectionGlow,
} satisfies Meta<typeof SectionGlow>

export default meta
type Story = StoryObj<typeof meta>

/** The 12 colour+opacity pairs § 10 actually draws, strongest first. */
const allFills = [
  { color: 'red-400', opacity: 65, note: 'Hero · foco (Landing)' },
  { color: 'red-400', opacity: 60, note: 'CTA · foco, Work · foco' },
  { color: 'red-400', opacity: 12, note: 'Glow origen' },
  { color: 'wine-300', opacity: 40, note: 'Hero · wine' },
  { color: 'wine-300', opacity: 37, note: 'CTA · wine, Work · wine' },
  { color: 'wine-300', opacity: 17, note: 'Propósito · red, Equipo · red' },
  { color: 'wine-300', opacity: 14, note: 'Servicios · red, Network · red' },
  { color: 'wine-400', opacity: 30, note: 'Hero · cierre' },
  { color: 'wine-400', opacity: 28, note: 'CTA · cierre, Work · cierre' },
  { color: 'wine-400', opacity: 20, note: 'Propósito · wine, Equipo · wine' },
  { color: 'wine-400', opacity: 14, note: 'Proyectos · wine' },
  { color: 'wine-400', opacity: 12, note: 'Servicios · wine, Network · wine' },
] as const

/** Every distinct desktop/mobile diameter pair in § 10's two tables. */
const allSizes: GlowSize[] = [
  '1500-760',
  '1500-700',
  '1400-700',
  '1100-520',
  '1000-560',
  '960-560',
  '1000-520',
  '900-520',
  '920',
  '880-500',
  '860-520',
  '860-480',
  '820-480',
]

/*
 * The catalogues shrink the canvas rather than the glows: the smallest token
 * is still 820px across, so twelve of them at true size cannot be compared on
 * one screen. `zoom` scales layout as well as paint, which keeps the grid
 * honest — every glow below is the real token, seen from further away. It is
 * a review aid and appears nowhere in the component.
 */
const reviewZoom = 'zoom: 0.2'

/** Landing's `Hero · foco` — the largest and strongest of the 21. */
export const Default: Story = {
  args: { color: 'red-400', opacity: 65, size: '1500-700' },
}

/**
 * The 12 colour+opacity pairs at one shared diameter, so the only thing that
 * varies is the fill. Read the two wine ramps as ladders: 40 → 37 → 17 → 14
 * and 30 → 28 → 20 → 14 → 12 must each get visibly fainter, in that order.
 *
 * The captions name where each pair is used, and they are the point: three of
 * them are called "red" in the design and are wine here. That mismatch is the
 * design's, faithfully carried over, and it is why the props are colour and
 * opacity instead of a name.
 */
export const Fills: Story = {
  args: { color: 'red-400', opacity: 65, size: '820-480' },
  render: () => ({
    components: { SectionGlow },
    setup: () => ({ allFills, reviewZoom }),
    template: `
      <div class="flex flex-wrap items-start gap-glass-red font-instrument">
        <figure v-for="fill in allFills" :key="fill.color + fill.opacity" class="w-52">
          <div :style="reviewZoom">
            <SectionGlow :color="fill.color" :opacity="fill.opacity" size="820-480" />
          </div>
          <figcaption class="text-meta text-bone-300 pt-2">
            {{ fill.color }} · {{ fill.opacity }}%
            <span class="block text-bone-500">{{ fill.note }}</span>
          </figcaption>
        </figure>
      </div>
    `,
  }),
}

/**
 * The 13 diameters at one shared fill, largest to smallest. Several differ by
 * 20-40px out of 900 — invisible one at a time, which is exactly why they are
 * lined up here.
 *
 * The names are the design's own desktop/mobile pair, not a t-shirt scale:
 * `1500-760` and `1500-700` are the same circle on desktop and different ones
 * on mobile, so switch the viewport to Móvil (390) and watch those two
 * separate. `920` is `Glow origen`, which the design only draws on desktop,
 * so it has no mobile measurement and stays fixed. It is also the one
 * diameter no page-level background uses: the design file nests that glow
 * inside the Propósito desktop frame, which is why the background is 21 glows
 * and Landing's is 11. Reviewing it here is how it stays honest until the
 * Propósito feature renders it.
 */
export const Sizes: Story = {
  args: { color: 'wine-300', opacity: 40, size: '1500-760' },
  render: () => ({
    components: { SectionGlow },
    setup: () => ({ allSizes, reviewZoom }),
    template: `
      <div class="flex flex-wrap items-end gap-glass-red font-instrument">
        <figure v-for="size in allSizes" :key="size">
          <div :style="reviewZoom">
            <SectionGlow color="wine-300" :opacity="40" :size="size" />
          </div>
          <figcaption class="text-meta text-bone-300 pt-2">{{ size }}</figcaption>
        </figure>
      </div>
    `,
  }),
}

/**
 * Landing's hero, the way the page actually stacks it: foco over wine over
 * cierre, at true size, offset and clipped by the section. Every coordinate
 * here belongs to this story — the component contributes only three circles,
 * because all of them sit somewhere different and a glow that placed itself
 * would be right once.
 *
 * This is the story to judge the recipe on. Three transparent gradients
 * overlapping must build one soft field with no seam, no band and no ring
 * where any of them ends.
 */
export const HeroStack: Story = {
  args: { color: 'red-400', opacity: 65, size: '1500-700' },
  render: () => ({
    components: { SectionGlow },
    template: `
      <div class="relative h-svh overflow-hidden bg-ink-500">
        <SectionGlow
          color="wine-400"
          :opacity="30"
          size="900-520"
          class="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3"
        />
        <SectionGlow
          color="wine-300"
          :opacity="40"
          size="1100-520"
          class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4"
        />
        <SectionGlow
          color="red-400"
          :opacity="65"
          size="1500-700"
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    `,
  }),
}

/**
 * One glow at true size, centred on plain Ink 500 with nothing else on the
 * canvas, for the one defect that matters: a hard circular edge.
 *
 * The gradient is sized to the circle's side, not to the corners of its box,
 * so it must be fully transparent by the time it reaches the edge. If you can
 * see where the circle ends — a rim, a step, a change in the falloff — the
 * gradient outran the shape and the whole background layer is wrong.
 */
export const Edge: Story = {
  args: { color: 'wine-300', opacity: 40, size: '900-520' },
  render: args => ({
    components: { SectionGlow },
    setup: () => ({ args }),
    template: `
      <div class="grid min-h-svh place-items-center bg-ink-500">
        <SectionGlow v-bind="args" />
      </div>
    `,
  }),
}
