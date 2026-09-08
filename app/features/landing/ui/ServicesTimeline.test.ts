import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import type { ServiceNodeContent } from '@/features/landing/data/servicesContent'
import Radar from '@/shared/ui/Radar.vue'
import ServiceItem from './ServiceItem.vue'
import ServicesTimeline from './ServicesTimeline.vue'

/**
 * The mobile composition. Seen red on purpose first (`findings.md` § R39).
 *
 * ⚠️ `happy-dom` supplies an `IntersectionObserver` constructor but never
 * fires it, so no test here asserts a `data-lyrics` value — that behaviour is
 * `useServicesLyrics`'s own contract, covered in its own test file. What this
 * file proves is that every item computes full strength with no scripting at
 * all, which is the CSS default this component must ship (spec FR-016).
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

function mountTimeline() {
  const wrapper = mount(ServicesTimeline, { props })
  mounted.push(wrapper)
  return wrapper
}

function styleDeclarations(): string {
  const source = readFileSync(
    join(
      process.cwd(),
      'app',
      'features',
      'landing',
      'ui',
      'ServicesTimeline.vue'
    ),
    'utf8'
  )
  return source
    .slice(source.lastIndexOf('<style scoped>'))
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
}

describe('ServicesTimeline · the five items', () => {
  it('should render five items in order, each carrying its own --i', () => {
    const wrapper = mountTimeline()
    const rows = wrapper.findAll('.item')

    expect(rows).toHaveLength(5)
    rows.forEach((row, index) => {
      expect((row.element as HTMLElement).style.getPropertyValue('--i')).toBe(
        String(index)
      )
    })
  })

  it('should render one sm-alt radar and one ServiceItem per row when mounted', () => {
    /* Seven `Radar`s mount in total: five row radars plus one inside each
       of the two `Pill`s (eyebrow, closer) — scoped to `size="sm-alt"` so
       the Pills' own `size="sm"` radars do not inflate the count. */
    const wrapper = mountTimeline()
    const rowRadars = wrapper
      .findAllComponents(Radar)
      .filter(radar => radar.props('size') === 'sm-alt')

    expect(rowRadars).toHaveLength(5)
    expect(wrapper.findAllComponents(ServiceItem)).toHaveLength(5)
  })

  it('should render the eyebrow, the spine and the delivery closer', () => {
    const wrapper = mountTimeline()

    expect(wrapper.text()).toContain(props.eyebrow)
    expect(wrapper.text()).toContain(props.deliveryLabel)
    expect(wrapper.text()).toContain(props.deliveryCopy)
    expect(wrapper.find('.spine').attributes('aria-hidden')).toBe('true')
  })

  it('should never hardcode the five item-top literals', () => {
    /* FR-011: one relation, generated from `--i` and the shared step token. */
    const style = styleDeclarations()

    for (const literal of ['72', '257', '442', '627', '812']) {
      expect(style, literal).not.toContain(literal)
    }

    expect(style).toContain('var(--services-timeline-item-1-top)')
    expect(style).toContain('var(--services-timeline-item-step)')
    expect(style).toContain('var(--i)')
  })
})

describe('ServicesTimeline · the no-JS default', () => {
  it('should render no data-lyrics attribute before the composable observes anything', () => {
    /* `happy-dom` never fires the observer, so this is the same document a
       visitor with scripting disabled receives (`ui-map.md` § 10). */
    const wrapper = mountTimeline()

    for (const row of wrapper.findAll('.item')) {
      expect(row.attributes('data-lyrics')).toBeUndefined()
    }
  })

  it('should default every item to full opacity with no attribute present', () => {
    const style = styleDeclarations()

    expect(style).toMatch(/\.item\s*\{[^}]*opacity:\s*1/)
  })

  it('should force full strength under reduced motion regardless of bucket', () => {
    const style = styleDeclarations()
    const reducedMotionBlock = style.slice(
      style.indexOf('prefers-reduced-motion')
    )

    expect(reducedMotionBlock).toContain('opacity: 1')
    expect(reducedMotionBlock).toContain('transition: none')
  })
})

describe('ServicesTimeline · no destination', () => {
  it('should offer no pointer and no destination on any item', () => {
    const wrapper = mountTimeline()

    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('cursor-pointer')
  })
})
