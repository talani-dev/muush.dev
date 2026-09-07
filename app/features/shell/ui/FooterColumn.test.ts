import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { ResolvedShellItem } from '@/features/shell/data/types'
import FooterColumn from './FooterColumn.vue'

const items: ResolvedShellItem[] = [
  { label: 'Proyectos', href: '/es#proyectos', external: false },
  { label: 'Nosotros', href: '/es/nosotros', external: false, current: true },
  { label: 'WhatsApp', href: 'https://wa.me/525639060739', external: true },
  { label: 'FAQ' },
]

function mountColumn() {
  return mount(FooterColumn, { props: { title: 'Navegación', items } })
}

describe('FooterColumn', () => {
  it('should render its title when rendered', () => {
    const title = mountColumn().find('h2')

    expect(title.text()).toBe('Navegación')
    expect(title.classes()).toContain('text-red-300')
  })

  it('should render every item when rendered', () => {
    const entries = mountColumn().findAll('li')

    expect(entries).toHaveLength(items.length)
    expect(entries.map(entry => entry.text())).toEqual([
      'Proyectos',
      'Nosotros',
      'WhatsApp',
      'FAQ',
    ])
  })

  it('should render an anchor when the item has a destination', () => {
    const link = mountColumn()
      .findAll('a')
      .find(anchor => anchor.text() === 'Proyectos')

    expect(link?.attributes('href')).toBe('/es#proyectos')
  })

  it('should render no anchor at all when the item has no destination', () => {
    const wrapper = mountColumn()
    const withoutDestination = wrapper
      .findAll('li')
      .find(entry => entry.text() === 'FAQ')

    expect(withoutDestination?.find('a').exists()).toBe(false)
    expect(withoutDestination?.find('span').classes()).toContain('text-ink-300')
  })

  it('should sever the opener when the item is external', () => {
    const link = mountColumn()
      .findAll('a')
      .find(anchor => anchor.text() === 'WhatsApp')

    expect(link?.attributes('target')).toBe('_blank')
    expect(link?.attributes('rel')).toBe('noopener noreferrer')
  })

  it('should keep an internal link in the same context when rendered', () => {
    const link = mountColumn()
      .findAll('a')
      .find(anchor => anchor.text() === 'Proyectos')

    expect(link?.attributes('target')).toBeUndefined()
  })

  it('should announce the current page when the item is the active route', () => {
    const link = mountColumn()
      .findAll('a')
      .find(anchor => anchor.text() === 'Nosotros')

    expect(link?.attributes('aria-current')).toBe('page')
  })

  it('should leave the other items unmarked when one is current', () => {
    const link = mountColumn()
      .findAll('a')
      .find(anchor => anchor.text() === 'Proyectos')

    expect(link?.attributes('aria-current')).toBeUndefined()
  })
})
