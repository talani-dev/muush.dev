import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ReceivesList from './ReceivesList.vue'
import { RECEIVES_LISTS } from './receivesFixtures.testing'

/**
 * Feature 45 · FR-023; pen extract-45 § 1. Shared since feature 46 (spec
 * FR-023, research R2): the home's "Lo que recibes" and Nosotros' "Áreas
 * que sumamos" are the same component.
 */
function render(
  locale: 'es' | 'en' = 'es',
  list: 'receives' | 'areas' = 'receives'
) {
  return mount(ReceivesList, { props: RECEIVES_LISTS[list][locale] })
}

describe('ReceivesList', () => {
  it('should name the list by its sentence-case caption, drawn uppercase', () => {
    const wrapper = render()
    const caption = wrapper.find('p')

    expect(caption.text()).toBe('Lo que recibes')
    expect(caption.classes()).toEqual(
      expect.arrayContaining(['uppercase', 'text-rotulo', 'text-gris-400'])
    )
    expect(wrapper.find('ul').attributes('aria-labelledby')).toBe(
      caption.attributes('id')
    )
  })

  it('should render one row per item with a decorative check bubble', () => {
    const wrapper = render('en')
    const rows = wrapper.findAll('li')

    expect(rows.map(row => row.find('span.min-w-0').text())).toEqual([
      'A review of your website and tools',
      'What to do first, and why',
      "If it needs a deeper look, what's included and what it costs",
    ])
    for (const row of rows) {
      const bubble = row.find('[aria-hidden="true"]')
      expect(bubble.classes()).toEqual(
        expect.arrayContaining([
          'size-recibe-burbuja',
          'bg-rojo-15',
          'rounded-full',
        ])
      )
      expect(bubble.html()).toContain('lucide · check')
      expect(bubble.find('.icono').classes()).toEqual(
        expect.arrayContaining(['size-recibe-icono', 'text-compromiso-icono'])
      )
    }
  })

  it('should render the Nosotros areas with the same anatomy when given them', () => {
    const wrapper = render('es', 'areas')

    expect(wrapper.find('p').text()).toBe('Áreas que sumamos')
    expect(wrapper.findAll('li span.min-w-0').map(row => row.text())).toEqual([
      'Ingeniería y desarrollo',
      'Diseño de producto y UX',
      'Creativo, contenido y marketing',
    ])
    expect(wrapper.findAll('.size-recibe-burbuja')).toHaveLength(3)
  })
})
