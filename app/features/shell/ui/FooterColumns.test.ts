import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import FooterColumns from './FooterColumns.vue'
import { SHELL_COPY } from './shellFixtures.testing'

/** Feature 43 · FR-030, FR-031, contract § 7; pen extract-43 § 6. */
function render(locale: 'es' | 'en' = 'es') {
  return mount(FooterColumns, {
    props: { columns: SHELL_COPY[locale].columns },
  })
}

describe('FooterColumns', () => {
  it('should render the four columns in the designed order when rendered', () => {
    expect(
      render()
        .findAll('h2')
        .map(title => title.text())
    ).toEqual(['Navegación', 'Contacto', 'muush', 'Redes'])
  })

  it.each([
    ['es', 'Inicio'],
    ['en', 'Home'],
  ] as const)(
    'should open the %s Navegación column with %s pointing home (Roberto 2026-11-01)',
    (locale, label) => {
      const first = render(locale).find('ul a')

      expect(first.text()).toBe(label)
      expect(first.attributes('href')).toBe(`/${locale}`)
    }
  )

  it('should set the headings in 11 / 600 uppercase Gris 400 when rendered', () => {
    expect(render().find('h2').classes()).toEqual(
      expect.arrayContaining([
        'text-footer-titulo',
        'uppercase',
        'text-gris-400',
      ])
    )
  })

  it('should set the entries in 15 / 400 Blanco 85 % when rendered', () => {
    expect(render().find('ul').classes()).toEqual(
      expect.arrayContaining(['text-p', 'text-blanco-85'])
    )
  })

  it('should render the blog as text, not as a link, when rendered', () => {
    const blog = render('en')
      .findAll('li')
      .find(item => item.text().includes('Blog'))

    expect(blog?.find('a').exists()).toBe(false)
    expect(blog?.find('span').text()).toBe('Blog · coming soon')
  })

  it('should open external entries in a new tab when rendered', () => {
    const booking = render().find(`a[href="${CALL_BOOKING_URL}"]`)

    expect(booking.attributes('target')).toBe('_blank')
    expect(booking.attributes('rel')).toBe('noopener noreferrer')
  })

  it('should space the columns by the footer column gap when rendered', () => {
    expect(render().classes()).toContain('gap-footer-columnas')
  })
})
