import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { ResolvedShellItem } from '@/features/shell/data/types'
import NavLinkBar from './NavLinkBar.vue'
import { SHELL_COPY } from './shellFixtures.testing'

/** Feature 43 · FR-002, FR-003, contract § 4; pen extract-43 § 2. */
const ITEMS: ResolvedShellItem[] = [
  { label: 'Servicios', href: '/es#servicios', external: false },
  { label: 'Nosotros', href: '/es/nosotros', external: false },
  /* Feature 51 · OQ-2 = A, the fourth item. */
  { label: 'Preguntas', href: '/es/preguntas', external: false },
]

function render(items: ResolvedShellItem[] = ITEMS) {
  return mount(NavLinkBar, { props: { items } })
}

describe('NavLinkBar', () => {
  it('should link every item to its resolved destination in order when rendered', () => {
    const links = render().findAll('a')

    expect(links.map(link => [link.text(), link.attributes('href')])).toEqual([
      ['Servicios', '/es#servicios'],
      ['Nosotros', '/es/nosotros'],
      ['Preguntas', '/es/preguntas'],
    ])
  })

  it.each([
    ['es', 'Inicio'],
    ['en', 'Home'],
  ] as const)(
    'should open the %s bar with %s pointing home (Roberto 2026-11-01)',
    (locale, label) => {
      const first = render(SHELL_COPY[locale].items).find('a')

      expect(first.text()).toBe(label)
      expect(first.attributes('href')).toBe(`/${locale}`)
    }
  )

  it('should light the Home item with the dot when it is current', () => {
    const items = SHELL_COPY.es.items.map((item, index) =>
      index === 0 ? { ...item, current: 'page' as const } : item
    )
    const home = render(items).find('a')

    expect(home.attributes('aria-current')).toBe('page')
    expect(home.find('[data-punto]').classes()).toContain('bg-red-muush-500')
  })

  it('should paint the glass pill when rendered', () => {
    const bar = render().find('ul')

    for (const expected of [
      'rounded-pill',
      'bg-nav-fondo',
      'backdrop-blur-cristal',
      'borde-luz',
      'borde-barra',
      'p-barra',
      'gap-barra',
    ]) {
      expect(bar.classes()).toContain(expected)
    }
  })

  it('should mark nothing and show Blanco 70 % text when no item is current', () => {
    const wrapper = render()

    expect(wrapper.find('[aria-current]').exists()).toBe(false)
    expect(wrapper.find('[data-punto]').exists()).toBe(false)
    for (const link of wrapper.findAll('a')) {
      expect(link.classes()).toContain('text-texto-suave')
    }
  })

  it('should announce the current page and show the dot when an item is the page', () => {
    const wrapper = render([
      ITEMS[0] as ResolvedShellItem,
      { ...ITEMS[1], current: 'page' } as ResolvedShellItem,
    ])
    const about = wrapper.findAll('a')[1]

    expect(about?.attributes('aria-current')).toBe('page')
    expect(about?.classes()).toEqual(
      expect.arrayContaining(['bg-blanco-8', 'text-blanco'])
    )
    expect(about?.find('[data-punto]').attributes('aria-hidden')).toBe('true')
  })

  it('should announce the current location when an item is the section in view', () => {
    const wrapper = render([
      { ...ITEMS[0], current: 'section' } as ResolvedShellItem,
      ITEMS[1] as ResolvedShellItem,
    ])
    const services = wrapper.findAll('a')[0]

    expect(services?.attributes('aria-current')).toBe('true')
    expect(services?.find('[data-punto]').classes()).toEqual(
      expect.arrayContaining(['size-punto-activo', 'bg-red-muush-500'])
    )
  })

  it('should keep the item label as its accessible text when current', () => {
    const wrapper = render([
      { ...ITEMS[0], current: 'section' } as ResolvedShellItem,
    ])

    expect(wrapper.find('a').text()).toBe('Servicios')
  })
})
