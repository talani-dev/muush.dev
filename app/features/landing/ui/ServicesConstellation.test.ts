import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import type { ServiceNodeContent } from '@/features/landing/data/servicesContent'
import Radar from '@/shared/ui/Radar.vue'
import ServiceItem from './ServiceItem.vue'
import ServicesConstellation from './ServicesConstellation.vue'

/**
 * The desktop composition. Seen red on purpose first (`findings.md` § R39).
 *
 * `happy-dom` resolves no `calc()`, so none of the rendered pixel positions
 * are observable here — that is measured in Chrome against `.output/public`
 * and recorded in the implementation report. What this file proves is the
 * **structure** the geometry depends on: five nodes, four connectors, and no
 * five/four literal coordinates anywhere in the source.
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

function mountConstellation() {
  const wrapper = mount(ServicesConstellation, { props })
  mounted.push(wrapper)
  return wrapper
}

/** The `<style scoped>` block with its comments stripped. */
function styleDeclarations(): string {
  const source = readFileSync(
    join(
      process.cwd(),
      'app',
      'features',
      'landing',
      'ui',
      'ServicesConstellation.vue'
    ),
    'utf8'
  )
  return source
    .slice(source.lastIndexOf('<style scoped>'))
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
}

describe('ServicesConstellation · the five nodes', () => {
  it('should render five nodes in services.md order when mounted', () => {
    const wrapper = mountConstellation()
    const items = wrapper.findAllComponents(ServiceItem)

    expect(items).toHaveLength(5)
    items.forEach((item, index) => {
      expect(item.props('name')).toBe(nodes[index]?.name)
      expect(item.props('brief')).toBe(nodes[index]?.brief)
    })
  })

  it('should render one md radar per node when mounted', () => {
    /* Seven `Radar`s mount in total: five node radars plus one inside each
       of the two `Pill`s (eyebrow, closer) — scoped to `size="md"` so the
       Pills' own `size="sm"` radars do not inflate the count. */
    const mdRadars = mountConstellation()
      .findAllComponents(Radar)
      .filter(radar => radar.props('size') === 'md')

    expect(mdRadars).toHaveLength(5)
  })

  it('should render the eyebrow and the delivery closer when mounted', () => {
    const wrapper = mountConstellation()

    expect(wrapper.text()).toContain(props.eyebrow)
    expect(wrapper.text()).toContain(props.deliveryLabel)
    expect(wrapper.text()).toContain(props.deliveryCopy)
  })

  it('should render no glass surface around any node when mounted', () => {
    /* `services.md`: "sin tarjetas." */
    const wrapper = mountConstellation()

    expect(wrapper.find('article').exists()).toBe(false)
  })

  it('should offer no pointer and no destination on any node', () => {
    const wrapper = mountConstellation()

    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('cursor-pointer')
  })
})

describe('ServicesConstellation · nothing is a measured pixel', () => {
  it('should generate every node position from the shared node/offset tokens', () => {
    const style = styleDeclarations()

    /* FR-007: none of the five text-block coordinates as bare literals. */
    for (const literal of [
      '146',
      '358',
      '426',
      '228',
      '686',
      '468',
      '946',
      '278',
      '1146',
      '508',
    ]) {
      expect(style, literal).not.toContain(literal)
    }

    expect(style).toContain('var(--services-text-offset-x)')
    expect(style).toContain('var(--services-text-offset-y)')
  })

  it('should generate the four connectors from the same node tokens', () => {
    const style = styleDeclarations()

    /* FR-008: none of the four connector rectangle dimensions as literals. */
    for (const literal of ['280', '131', '261', '241', '191', '201', '231']) {
      expect(style, literal).not.toContain(literal)
    }

    expect(style).toContain('--services-node-1-x')
    expect(style).toContain('--services-node-5-x')
  })

  it('should render exactly four connector lines when mounted', () => {
    const svg = mountConstellation().find('svg')

    expect(svg.exists()).toBe(true)
    expect(svg.findAll('line')).toHaveLength(4)
  })

  it('should bind each connector to the pair of confirmed radar centres it joins', () => {
    /* Unlike the radar/text CSS positions, these ARE plain attributes and
       directly observable here — Biome's `noUnknownProperty` correctly
       rejects `x1`/`y1`/`x2`/`y2` as CSS declarations, so the geometry is
       bound from `connectorEndpoints` instead (spec FR-008). */
    const lines = mountConstellation().findAll('line')

    expect(
      lines.map(line => ({
        x1: line.attributes('x1'),
        y1: line.attributes('y1'),
        x2: line.attributes('x2'),
        y2: line.attributes('y2'),
      }))
    ).toEqual([
      { x1: '150', y1: '330', x2: '430', y2: '200' },
      { x1: '430', y1: '200', x2: '690', y2: '440' },
      { x1: '690', y1: '440', x2: '950', y2: '250' },
      { x1: '950', y1: '250', x2: '1150', y2: '480' },
    ])
  })

  it('should mark the connector svg as decorative when mounted', () => {
    expect(mountConstellation().find('svg').attributes('aria-hidden')).toBe(
      'true'
    )
  })
})

describe('ServicesConstellation · the paint-order contract', () => {
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

  it('should create no stacking context on the root when mounted', () => {
    const classes = mountConstellation().classes()

    for (const utility of STACKING_CONTEXT_UTILITIES) {
      expect(
        classes.some(name => name.includes(utility)),
        utility
      ).toBe(false)
    }
  })

  it('should paint no background on the root when mounted', () => {
    expect(
      mountConstellation()
        .classes()
        .some(name => name.startsWith('bg-'))
    ).toBe(false)
  })
})
