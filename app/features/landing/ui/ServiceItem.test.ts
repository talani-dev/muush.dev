import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import Radar from '@/shared/ui/Radar.vue'
import ServiceItem from './ServiceItem.vue'

/**
 * Fixtures, not copy — the component takes already-translated strings, which
 * is what lets it mount here with no i18n instance (`rules.md` § R23).
 *
 * Seen red on purpose first (`findings.md` § R39).
 */
const props = {
  name: 'Software & Digital Solutions',
  brief: 'Platforms, internal systems, portals, and integrations.',
}

const mounted: VueWrapper[] = []

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
})

function mountItem(overrides: Partial<typeof props> = {}) {
  const wrapper = mount(ServiceItem, { props: { ...props, ...overrides } })
  mounted.push(wrapper)
  return wrapper
}

describe('ServiceItem · no glass surface, no reveal state', () => {
  it('should render the name then the brief when mounted', () => {
    const paragraphs = mountItem().findAll('p')

    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[0]?.text()).toBe(props.name)
    expect(paragraphs[1]?.text()).toBe(props.brief)
  })

  it('should carry the service typography roles when mounted', () => {
    const paragraphs = mountItem().findAll('p')

    expect(paragraphs[0]?.classes()).toContain('text-service-name')
    expect(paragraphs[1]?.classes()).toContain('text-service-brief')
  })

  it('should render no glass panel and no card surface when mounted', () => {
    /* `services.md`: "sin tarjetas." No article, no glass-* utility class. */
    const wrapper = mountItem()

    expect(wrapper.find('article').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('bg-glass')
    expect(wrapper.html()).not.toContain('border-glass')
  })

  it('should render no Radar and take no mode or variant prop when mounted', () => {
    /* The radar always accompanies a service item, but it is a sibling in
       both compositions (desktop positions it independently, mobile centres
       it on the row) — never a child of this component. */
    const wrapper = mountItem()

    expect(wrapper.findComponent(Radar).exists()).toBe(false)
    expect(Object.keys(wrapper.vm.$props)).toEqual(['name', 'brief'])
  })

  it('should be no link and claim no pointer when mounted', () => {
    /* `ui-map.md` § 5: the five points are not clickable. */
    const wrapper = mountItem()

    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('cursor-pointer')
  })
})
