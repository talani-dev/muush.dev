import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Heading from '@/shared/ui/Heading.vue'
import MapLegend from '@/shared/ui/MapLegend.vue'
import Pill from '@/shared/ui/Pill.vue'
import WorldMap from '@/shared/ui/WorldMap.vue'
import { WHO_WE_ARE_COPY } from './landingFixtures.testing'
import WhoWeAreSection from './WhoWeAreSection.vue'

/** Feature 44 · US2, FR-007…FR-013; pen extract-44 § 2. */
function render(locale: 'es' | 'en' = 'es') {
  return mount(WhoWeAreSection, { props: WHO_WE_ARE_COPY[locale] })
}

describe('WhoWeAreSection', () => {
  it('should stack pill, heading, map, body and legend in order when rendered', () => {
    const wrapper = render()
    const order = wrapper
      .findAll('section > *')
      .map(child => child.element.tagName.toLowerCase())

    expect(order).toEqual(['div', 'h2', 'div', 'p', 'div'])
    expect(wrapper.findComponent(Pill).props('label')).toBe('Qué es muush')
    expect(wrapper.findComponent(MapLegend).exists()).toBe(true)
  })

  it('should title the section with a two-tone h2 when rendered', () => {
    const heading = render('en').findComponent(Heading)

    expect(heading.props()).toMatchObject({
      level: 2,
      size: 'seccion',
      first: 'A core team and trusted partners,',
      second: 'shaped by what your project needs.',
    })
  })

  it('should hand the map its tabs, groups and city names when rendered', () => {
    const map = render().findComponent(WorldMap)

    expect(map.props('regionsLabel')).toBe('Región del mapa')
    expect(map.props('regions')).toEqual(WHO_WE_ARE_COPY.es.regions)
    expect(map.props('cityNames').dublin).toBe('Dublín')
  })

  it('should soften the body below lg and grey it from lg when rendered', () => {
    expect(render().find('section > p').classes()).toEqual(
      expect.arrayContaining([
        'text-cuerpo',
        'max-w-medida',
        'text-texto-suave',
        'lg:text-gris-400',
      ])
    )
  })

  it('should pad the section as drawn when rendered', () => {
    expect(render().find('section').classes()).toEqual(
      expect.arrayContaining(['gap-mapa-gap', 'px-gutter', 'lg:px-0'])
    )
  })

  it('should fill the viewport below the header and centre its content when rendered', () => {
    /* Section framing (Roberto 2026-11-08, global.css). */
    expect(render().find('section').classes()).toEqual(
      expect.arrayContaining([
        'flex',
        'flex-col',
        'min-h-seccion-alto',
        'justify-center',
        'py-que-es-y',
      ])
    )
  })

  it('should mark its root for section timing when rendered', () => {
    /* Feature 49 · `section_view` (tracking plan § 5). */
    expect(render().attributes('data-track-section')).toBe('who_we_are')
  })
})
