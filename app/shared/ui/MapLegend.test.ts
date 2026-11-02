import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MapLegend from '@/shared/ui/MapLegend.vue'
import { MAP_COPY } from '@/shared/ui/mapFixtures.testing'

/** Feature 44 · FR-013; pen extract-44 § 2, § 2.1. */
function render(withSoon = true) {
  return mount(MapLegend, {
    props: {
      items: MAP_COPY.es.legend,
      soonLabel: withSoon ? MAP_COPY.es.soonLabel : undefined,
    },
  })
}

describe('MapLegend', () => {
  it('should mark the team red and the partners steel when rendered', () => {
    const items = render().findAll('li')

    expect(items[0]?.text()).toBe('Equipo')
    expect(items[0]?.find('span').classes()).toContain('bg-red-muush-500')
    expect(items[1]?.text()).toBe('Aliados')
    expect(items[1]?.find('span').classes()).toContain('bg-acero-200')
    expect(items[0]?.find('span').attributes('aria-hidden')).toBe('true')
  })

  it('should add the Estonia chip below lg only when a soon label is given', () => {
    const chip = render().findAll('li')[2]

    expect(chip?.text()).toBe('Estonia · pronto')
    expect(chip?.classes()).toEqual(
      expect.arrayContaining(['lg:hidden', 'bg-vidrio-fondo', 'rounded-pill'])
    )
    /* Pen extract-44 § 10: a 6 px solid Acero 400 dot, Blanco text. */
    expect(chip?.find('span').classes()).toEqual(
      expect.arrayContaining(['size-chip-punto', 'bg-acero-400'])
    )
    expect(chip?.classes()).toContain('text-blanco')
    expect(render(false).findAll('li')).toHaveLength(2)
  })

  it('should end with the anywhere line without a dot when rendered', () => {
    const line = render().find('p')

    expect(line.text()).toBe('Trabajamos con clientes en cualquier país.')
    expect(line.find('span').exists()).toBe(false)
  })

  it('should lay out one row from lg and two rows below when rendered', () => {
    expect(render().classes()).toEqual(
      expect.arrayContaining([
        'flex-col',
        'gap-leyenda-filas',
        'lg:flex-row',
        'lg:gap-leyenda-gap',
      ])
    )
  })
})
