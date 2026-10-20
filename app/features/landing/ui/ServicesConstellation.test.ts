import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import {
  connectorEndpoints,
  SERVICE_NODE_CENTRES,
  type ServiceNodeContent,
} from '@/features/landing/data/servicesContent'
import Radar from '@/shared/ui/Radar.vue'
import ServiceItem from './ServiceItem.vue'
import ServicesConnectors from './ServicesConnectors.vue'
import ServicesConstellation from './ServicesConstellation.vue'

/**
 * The desktop composition. Seen red on purpose first (`findings.md` § R39).
 *
 * `happy-dom` resolves no `calc()`, so none of the rendered pixel positions
 * are observable here — that is measured in Chrome against `.output/public`
 * and recorded in the implementation report. What this file proves is the
 * **structure** the geometry depends on: five nodes, four connectors, and no
 * five/four literal coordinates anywhere in the source. Since feature 34 the
 * connector `<svg>` lives in `ServicesConnectors.vue` and is asserted there.
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

/** The `<style scoped>` block, comments stripped, whitespace collapsed. */
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
  /* Whitespace collapsed, so the formatter's line wrapping of a long
     `calc(… sin(…))` cannot break an assertion on the expression. */
  return source
    .slice(source.lastIndexOf('<style scoped>'))
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/\s+/g, ' ')
    .replaceAll('( ', '(')
    .replaceAll(' )', ')')
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

  it('should hand the connectors the four lines generated from the confirmed centres', () => {
    /* The line geometry itself is asserted in `ServicesConnectors.test.ts`
       (feature 34 extracted it); here only the hand-off is. */
    const connectorLayers =
      mountConstellation().findAllComponents(ServicesConnectors)

    expect(connectorLayers).toHaveLength(1)
    expect(connectorLayers[0]?.props('connectors')).toEqual(
      connectorEndpoints(SERVICE_NODE_CENTRES)
    )
  })
})

describe('ServicesConstellation · the float (feature 34)', () => {
  /** The declarations of the first rule whose selector is exactly `selector`. */
  function rule(selector: string): string {
    const escaped = selector.replaceAll('.', '\\.')
    return (
      styleDeclarations().match(
        new RegExp(`${escaped}\\s*\\{([^}]*)\\}`)
      )?.[1] ?? ''
    )
  }

  it('should give each node its own index when mounted', () => {
    const nodeElements = mountConstellation().findAll('.node')

    expect(nodeElements).toHaveLength(5)
    nodeElements.forEach((node, index) => {
      expect((node.element as HTMLElement).style.getPropertyValue('--i')).toBe(
        String(nodes[index]?.index)
      )
    })
  })

  it('should offset every node by the shared sine of the one clock', () => {
    const node = rule('.node')

    expect(node).toContain(
      'sin(var(--services-float-phase) + var(--i) * var(--services-float-phase-step))'
    )
    expect(node).toMatch(/translate:[^;]*var\(--services-frame-px\)/)
  })

  it('should only translate the nodes, never rotate, scale, blur or fade them', () => {
    const node = rule('.node')

    for (const property of ['rotate', 'scale', 'filter', 'opacity']) {
      expect(node, property).not.toContain(property)
    }
  })

  it('should run the clock once on the canvas', () => {
    expect(rule('.canvas')).toContain(
      'animation: services-float var(--duration-services-float) linear infinite'
    )
  })

  it('should stop the clock when reduced motion is requested', () => {
    expect(styleDeclarations()).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.canvas\s*\{\s*animation:\s*none;?\s*\}/
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

describe('ServicesConstellation · narrows instead of being cut (feature 38)', () => {
  /** The declarations of the first rule whose selector is exactly `selector`. */
  function rule(selector: string): string {
    const escaped = selector.replaceAll('.', '\\.')
    return (
      styleDeclarations().match(
        new RegExp(`(?:^|\\}|\\s)${escaped}\\s*\\{([^}]*)\\}`)
      )?.[1] ?? ''
    )
  }

  it('should put the eyebrow on the page content edge when styled', () => {
    /* D6: every section Pill shares `--spacing-page`; a fixed 80 put this one
       22px right of the others at 1024. */
    expect(rule('.eyebrow')).toContain('left: var(--spacing-page)')
  })

  it('should lay the Delivery closer on the page content box when styled', () => {
    const closer = rule('.closer')

    expect(closer).toContain('left: var(--spacing-page)')
    expect(closer).toContain('width: calc(100% - 2 * var(--spacing-page))')
  })

  it('should scale every node x and keep every y fixed when styled', () => {
    expect(rule('.radar')).toContain(
      'left: calc(var(--node-x) * var(--services-unit-x))'
    )
    expect(rule('.radar')).toContain('top: var(--node-y)')
    expect(rule('.text')).toContain(
      'left: calc((var(--node-x) + var(--services-text-offset-x)) * var(--services-unit-x))'
    )
  })

  it('should scale the text width down to its measured floor when styled', () => {
    expect(rule('.text')).toContain(
      'width: max(calc(var(--services-text-w) * var(--services-unit-x)), var(--services-text-min-w))'
    )
  })

  it('should resolve the scale against an inner container, never the root', () => {
    /* `cqw` needs a size container; containment makes a stacking context,
       which the paint-order contract keeps off `.canvas`. */
    const wrapper = mountConstellation()

    expect(rule('.frame')).toContain('container-type: inline-size')
    expect(rule('.canvas')).not.toContain('container')
    expect(wrapper.find('.canvas > .frame').exists()).toBe(true)
    expect(wrapper.findAll('.frame > .node')).toHaveLength(5)
  })

  it('should transform the canvas nowhere when styled', () => {
    /* D5: scaling the canvas would shrink the Pills and the copy too. */
    for (const property of ['transform', 'scale', 'zoom']) {
      expect(rule('.canvas'), property).not.toContain(property)
    }
  })
})
