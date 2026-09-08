import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import type { ServiceNodeContent } from '@/features/landing/data/servicesContent'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'
import ServicesConstellation from './ServicesConstellation.vue'
import ServicesSection from './ServicesSection.vue'
import ServicesTimeline from './ServicesTimeline.vue'

/**
 * The section element — what the R28/R37 paint-order contract actually
 * binds. Seen red on purpose first (`findings.md` § R39).
 */
const nodes: ServiceNodeContent[] = [
  { id: 'consulting', index: 0, name: 'Consulting', brief: 'Brief 1.' },
  { id: 'software', index: 1, name: 'Software', brief: 'Brief 2.' },
  { id: 'cloud', index: 2, name: 'Cloud', brief: 'Brief 3.' },
  { id: 'automation', index: 3, name: 'Automation', brief: 'Brief 4.' },
  { id: 'product', index: 4, name: 'Product', brief: 'Brief 5.' },
]

const props = {
  eyebrow: 'Servicios',
  deliveryLabel: 'Delivery',
  nodes,
  deliveryCopy: 'Y una capacidad que atraviesa las cinco.',
}

const mounted: VueWrapper[] = []

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
})

function mountSection() {
  const wrapper = mount(ServicesSection, { props })
  mounted.push(wrapper)
  return wrapper
}

function sectionRoot(wrapper: VueWrapper): string[] {
  return wrapper.find('section#servicios').classes()
}

describe('ServicesSection · structure', () => {
  it('should carry the Spanish anchor the shell already links to when mounted', () => {
    expect(mountSection().find('section#servicios').exists()).toBe(true)
  })

  it('should render exactly one of the two compositions visible via class', () => {
    const wrapper = mountSection()

    const constellation = wrapper.getComponent(ServicesConstellation).classes()
    const timeline = wrapper.getComponent(ServicesTimeline).classes()

    expect(constellation).toContain('hidden')
    expect(constellation).toContain('lg:block')
    expect(timeline).toContain('lg:hidden')
    expect(timeline).not.toContain('hidden')
  })

  it('should pass the same props to both compositions when mounted', () => {
    const wrapper = mountSection()

    for (const composition of [ServicesConstellation, ServicesTimeline]) {
      const component = wrapper.getComponent(composition)
      expect(component.props('eyebrow')).toBe(props.eyebrow)
      expect(component.props('deliveryLabel')).toBe(props.deliveryLabel)
      expect(component.props('nodes')).toEqual(nodes)
      expect(component.props('deliveryCopy')).toBe(props.deliveryCopy)
    }
  })

  it('should take its top padding from its own token when mounted', () => {
    expect(sectionRoot(mountSection())).toContain('pt-services-top')
  })
})

describe('ServicesSection · the two glows', () => {
  it('should contribute exactly the two confirmed glows when mounted', () => {
    const glows = mountSection().findAllComponents(SectionGlow)

    expect(
      glows.map(glow => ({
        color: glow.props('color'),
        opacity: glow.props('opacity'),
        size: glow.props('size'),
      }))
    ).toEqual([
      { color: 'wine-300', opacity: 14, size: '900-520' },
      { color: 'wine-400', opacity: 12, size: '860-480' },
    ])
  })

  it('should render both glows inside the section backdrop when mounted', () => {
    const wrapper = mountSection()
    const backdrop = wrapper.getComponent(SectionBackdrop).element

    for (const glow of wrapper.findAllComponents(SectionGlow)) {
      expect(backdrop.contains(glow.element)).toBe(true)
    }
  })

  it('should anchor each glow by its own centre on its own pair of tokens', () => {
    const expected = [
      ['top-services-glow-a-y', 'left-services-glow-a-x'],
      ['top-services-glow-b-y', 'left-services-glow-b-x'],
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

describe('ServicesSection · the paint-order contract', () => {
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
    expect(sectionRoot(mountSection()).some(n => n.startsWith('bg-'))).toBe(
      false
    )
  })

  it('should declare no bottom and no horizontal padding when mounted', () => {
    const root = sectionRoot(mountSection())

    expect(root.some(name => /^(pb|px|ps|pe|pl|pr|p)-/.test(name))).toBe(false)
  })

  it('should give the section no accessible name and no landmark of its own', () => {
    const section = mountSection().find('section#servicios')

    expect(section.attributes('aria-label')).toBeUndefined()
    expect(section.attributes('aria-labelledby')).toBeUndefined()
  })
})
