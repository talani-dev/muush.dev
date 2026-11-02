import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { ASSESSMENT_COPY } from './landingFixtures.testing'
import ReceivesList from './ReceivesList.vue'

/** Feature 45 · FR-023; pen extract-45 § 1. */
function render(locale: 'es' | 'en' = 'es') {
  const copy = ASSESSMENT_COPY[locale]
  return mount(ReceivesList, {
    props: { label: copy.receivesLabel, items: copy.receives },
  })
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
})
