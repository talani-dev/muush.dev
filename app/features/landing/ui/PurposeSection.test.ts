import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import type { PurposeNodeContent } from '@/features/landing/data/purposeContent'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'
import PurposeCarousel from './PurposeCarousel.vue'
import PurposeConstellation from './PurposeConstellation.vue'
import PurposeSection from './PurposeSection.vue'

/**
 * The section element itself — which is what the R28 / R37 paint-order
 * contract actually binds, and this is only the second section it governs.
 *
 * Seen red on purpose first (`findings.md` § R39). `tasks.md` T032 put these
 * assertions in `PurposeConstellation.test.ts`; they are here instead because
 * the subject they name — "the section root" and the arcs' clip wrapper —
 * lives in this component, not in the constellation.
 */
const nodes: PurposeNodeContent[] = [
  { id: 'why', index: 0, label: 'Why', copy: 'Copy for why.' },
  { id: 'how', index: 1, label: 'How', copy: 'Copy for how.' },
  { id: 'what', index: 2, label: 'What', copy: 'Copy for what.' },
]

const props = { eyebrow: 'Propósito', carouselLabel: 'Propósito', nodes }

const mounted: VueWrapper[] = []

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
})

function mountSection() {
  const wrapper = mount(PurposeSection, { props })
  mounted.push(wrapper)
  return wrapper
}

/** The section element, not the carousel's — the carousel is a `<section>` too. */
function sectionRoot(wrapper: VueWrapper): string[] {
  return wrapper.find('section#proposito').classes()
}

describe('PurposeSection · structure', () => {
  it('should carry the Spanish anchor the shell already links to when mounted', () => {
    /* Three links point here — the footer's *Navegación* column and the mobile
       menu — so this closes three of the five dangling anchors `rules.md`
       § R50 records. Spanish because Article VI keeps Spanish anchors. */
    expect(mountSection().find('section#proposito').exists()).toBe(true)
  })

  it('should render the eyebrow and exactly one of the two compositions', () => {
    /* Both are in the DOM and one is `display: none`, which is FR-002's point:
       the inactive composition is *removed from rendering*, never merely
       transparent, so no copy is announced twice. */
    const wrapper = mountSection()

    expect(wrapper.text()).toContain(props.eyebrow)

    const constellation = wrapper.getComponent(PurposeConstellation).classes()
    const carousel = wrapper.getComponent(PurposeCarousel).classes()

    expect(constellation).toContain('hidden')
    expect(constellation).toContain('lg:flex')
    expect(carousel).toContain('lg:hidden')
    expect(carousel).not.toContain('hidden')
  })

  it('should space both compositions off the eyebrow with the same token', () => {
    /* One gap, whichever composition renders: 58 mobile → 22 desktop, and it
       decreases with width. */
    for (const composition of [PurposeConstellation, PurposeCarousel]) {
      expect(mountSection().getComponent(composition).classes()).toContain(
        'mt-purpose-eyebrow-gap'
      )
    }
  })

  it('should pass the same three nodes to both compositions when mounted', () => {
    const wrapper = mountSection()

    expect(wrapper.getComponent(PurposeConstellation).props('nodes')).toEqual(
      nodes
    )
    expect(wrapper.getComponent(PurposeCarousel).props('nodes')).toEqual(nodes)
    expect(wrapper.getComponent(PurposeCarousel).props('label')).toBe(
      props.carouselLabel
    )
  })

  it('should take no top padding beyond its own token when mounted', () => {
    expect(sectionRoot(mountSection())).toContain('pt-purpose-top')
  })
})

describe('PurposeSection · the three glows', () => {
  it('should contribute exactly the three Landing Propósito glows when mounted', () => {
    /* `design-extract.md` § 10's table, minus its own error: `Glow origen` is
       nested in this section's frame rather than in the page background group,
       which is why Landing's background count is 11 (`rules.md` § R29). */
    const glows = mountSection().findAllComponents(SectionGlow)

    expect(
      glows.map(glow => ({
        color: glow.props('color'),
        opacity: glow.props('opacity'),
        size: glow.props('size'),
      }))
    ).toEqual([
      { color: 'wine-400', opacity: 20, size: '1000-560' },
      { color: 'wine-300', opacity: 17, size: '820-480' },
      { color: 'red-400', opacity: 12, size: '920' },
    ])
  })

  it('should consume the 920 size variant so it stops being dead code', () => {
    /* Feature 7 nearly deleted `'920'` as unconsumed. This is its consumer,
       and it is desktop-only because the design gives it no mobile size
       (spec FR-028). */
    const origen = mountSection()
      .findAllComponents(SectionGlow)
      .find(glow => glow.props('size') === '920')

    expect(origen?.classes()).toContain('hidden')
    expect(origen?.classes()).toContain('lg:block')
    expect(origen?.classes()).toContain('top-purpose-origen-y')
    expect(origen?.classes()).toContain('left-purpose-origen-x')
  })

  it('should render every glow inside the section backdrop when mounted', () => {
    const wrapper = mountSection()
    const backdrop = wrapper.getComponent(SectionBackdrop).element

    for (const glow of wrapper.findAllComponents(SectionGlow)) {
      expect(backdrop.contains(glow.element)).toBe(true)
    }
  })

  it('should anchor each glow by its own centre on its own pair of tokens', () => {
    /* Both endpoints of every anchor are measured; nothing is derived from the
       other viewport, which `rules.md` § R48 records failing by up to 35px.
       The translate is permitted here and nowhere else in the subtree. */
    const expected = [
      ['top-purpose-glow-a-y', 'left-purpose-glow-a-x'],
      ['top-purpose-glow-b-y', 'left-purpose-glow-b-x'],
      ['top-purpose-origen-y', 'left-purpose-origen-x'],
    ]

    mountSection()
      .findAllComponents(SectionGlow)
      .forEach((glow, index) => {
        const classes = glow.classes()

        expect(classes).toContain('absolute')
        expect(classes).toContain('-translate-x-1/2')
        expect(classes).toContain('-translate-y-1/2')
        for (const token of expected[index] ?? []) {
          expect(classes, token).toContain(token)
        }
      })
  })
})

describe('PurposeSection · the paint-order contract', () => {
  /**
   * The eleven properties that would create a stacking context, from
   * `SectionBackdrop.vue`'s contract. The failure mode is **silent**: the
   * glows simply move above the page-wide dot sheet and the page stops
   * matching the design. Measured on the generated page as well (spec FR-030).
   */
  const STACKING_CONTEXT_UTILITIES = [
    'transform',
    'translate',
    'scale',
    'rotate',
    'filter',
    'backdrop-filter',
    'opacity-',
    'isolate',
    'will-change',
    'contain-paint',
    'fixed',
    'sticky',
  ]

  it('should create no stacking context on the section root when mounted', () => {
    const root = sectionRoot(mountSection())

    expect(root).toContain('relative')
    for (const utility of STACKING_CONTEXT_UTILITIES) {
      expect(
        root.some(name => name.includes(utility)),
        utility
      ).toBe(false)
    }
  })

  it('should paint no background of its own on the section root when mounted', () => {
    /* A section background paints after the negative levels and would hide the
       section's own glows. */
    expect(sectionRoot(mountSection()).some(n => n.startsWith('bg-'))).toBe(
      false
    )
  })

  it('should declare no bottom and no horizontal padding when mounted', () => {
    /* The gap to Servicios belongs to Servicios (`rules.md` § R49), and
       `<main>` already applies `px-page` — re-declaring it would place the
       whole section at twice the gutter. */
    const root = sectionRoot(mountSection())

    expect(root.some(name => /^(pb|px|ps|pe|pl|pr|p)-/.test(name))).toBe(false)
  })

  it('should clip the arcs on a wrapper and never on the section when mounted', () => {
    /*
     * `overflow: clip` on the section would cut its own ~1000px glows hard at
     * the section box; on an `absolute inset-0` wrapper it clips to the same
     * box, creates no stacking context, and leaves the glows soft
     * (spec FR-018). `clip` and not `hidden`, so the wrapper never becomes a
     * scroll container.
     */
    const wrapper = mountSection()
    const arcs = wrapper.find('.arcs').classes()

    expect(arcs).toContain('overflow-clip')
    expect(arcs).toContain('absolute')
    expect(arcs).toContain('inset-0')
    expect(arcs).toContain('hidden')
    expect(arcs).toContain('lg:block')
    expect(arcs).not.toContain('overflow-hidden')

    const root = sectionRoot(wrapper)
    expect(root.some(name => name.startsWith('overflow-'))).toBe(false)

    expect(wrapper.find('.arcs').attributes('aria-hidden')).toBe('true')
  })

  it('should render the arcs before both compositions so the cards paint over', () => {
    /* Same z-index, so document order decides: the arcs are composition in the
       content layer — above the dotted paper, below the copy (spec A-09). */
    const children = mountSection().findAll('section#proposito > *')
    const arcIndex = children.findIndex(child =>
      child.classes().includes('arcs')
    )
    const constellationIndex = children.findIndex(child =>
      child.classes().includes('constellation')
    )

    expect(arcIndex).toBeGreaterThanOrEqual(0)
    expect(arcIndex).toBeLessThan(constellationIndex)
  })

  it('should express the three arcs as one origin and three radii when mounted', () => {
    /* FR-017: the diameters are `2 × distance(origin, radarCentre)`, so they
       are tokens rather than the three literals the frame draws. */
    const arcs = mountSection().findAll('.arcs > *')

    expect(arcs.map(arc => arc.classes())).toEqual([
      ['arc', 'arc-why'],
      ['arc', 'arc-how'],
      ['arc', 'arc-what'],
    ])
  })

  it('should give the section no accessible name and no landmark of its own', () => {
    /* The Hero's precedent (spec A-08): the `id` is a scroll target, not a
       landmark. The mobile carousel names *itself*, which is a different
       element and a different requirement. */
    const section = mountSection().find('section#proposito')

    expect(section.attributes('aria-label')).toBeUndefined()
    expect(section.attributes('aria-labelledby')).toBeUndefined()
  })
})
