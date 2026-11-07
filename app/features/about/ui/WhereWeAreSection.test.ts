import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Heading from '@/shared/ui/Heading.vue'
import MapLegend from '@/shared/ui/MapLegend.vue'
import Pill from '@/shared/ui/Pill.vue'
import WorldMap from '@/shared/ui/WorldMap.vue'
import { WHERE_WE_ARE_COPY } from './aboutFixtures.testing'
import WhereWeAreSection from './WhereWeAreSection.vue'

/** Feature 46 · US1, FR-015…FR-019; pen extract-46 §§ 1.3, 2. */
function render(locale: 'es' | 'en' = 'es') {
  return mount(WhereWeAreSection, { props: WHERE_WE_ARE_COPY[locale] })
}

describe('WhereWeAreSection', () => {
  it('should pass the shared map copy to the map and legend', () => {
    const wrapper = render()
    const map = wrapper.findComponent(WorldMap)
    const legend = wrapper.findComponent(MapLegend)

    expect(map.props('regions')).toEqual(WHERE_WE_ARE_COPY.es.regions)
    expect(map.props('regionsLabel')).toBe('Región del mapa')
    expect(map.props('cityNames').amsterdam).toBe('Ámsterdam')
    expect(legend.props('items')).toEqual(WHERE_WE_ARE_COPY.es.legend)
  })

  it('should render the soon chip label', () => {
    expect(render('en').findComponent(MapLegend).props('soonLabel')).toBe(
      'Estonia · soon'
    )
  })

  it('should stack pill, heading, map, body and legend in order when rendered', () => {
    const order = render()
      .findAll('section > *')
      .map(child => child.element.tagName.toLowerCase())

    expect(order).toEqual(['div', 'h2', 'div', 'p', 'div'])
  })

  it('should title the section with the section-size two-tone h2 when rendered', () => {
    expect(render('en').findComponent(Heading).props()).toMatchObject({
      level: 2,
      size: 'seccion',
      first: 'A talent pool that grows',
      second: 'by industry and by project.',
    })
  })

  it('should set the body 16 at 390 and 17 at 1440 with the home colours when rendered', () => {
    const body = render().find('section > p')

    expect(body.text()).toBe(
      'Todos trabajamos con las mismas reglas y el mismo estándar de entrega.'
    )
    expect(body.classes()).toEqual(
      expect.arrayContaining([
        'text-donde-cuerpo',
        'max-w-medida',
        'text-texto-suave',
        'lg:text-gris-400',
      ])
    )
  })

  it('should carry the shared pill air', () => {
    const pill = render().findComponent(Pill)

    expect(pill.props('label')).toBe('Dónde estamos')
    expect(pill.classes()).toContain('pill-aire')
  })

  it('should mark its root for section timing when rendered', () => {
    /* Feature 49 · `section_view` (tracking plan § 5). */
    expect(render().attributes('data-track-section')).toBe('where_we_are')
  })
})
