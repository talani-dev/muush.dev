import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { ResolvedFooterColumn } from '@/features/shell/data/types'
import SiteFooter from './SiteFooter.vue'

const columns: ResolvedFooterColumn[] = [
  {
    title: 'Navegación',
    items: [
      { label: 'Propósito', href: '/es#proposito', external: false },
      { label: 'Servicios', href: '/es#servicios', external: false },
      { label: 'Proyectos', href: '/es#proyectos', external: false },
      { label: 'Nosotros', href: '/es/nosotros', external: false },
    ],
  },
  {
    title: 'Contacto',
    items: [
      { label: 'Agenda una llamada' },
      {
        label: 'support@muush.dev',
        href: 'mailto:support@muush.dev',
        external: false,
      },
      {
        label: 'WhatsApp',
        href: 'https://wa.me/525639060739?text=Hola%20muush',
        external: true,
      },
    ],
  },
  {
    title: 'muush',
    items: [
      { label: 'Work with muush', href: '/es/nosotros#work', external: false },
      { label: 'FAQ' },
      { label: 'Blog · próximamente' },
    ],
  },
  {
    title: 'Redes',
    items: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/muush-dev',
        external: true,
      },
      {
        label: 'Instagram',
        href: 'https://www.instagram.com/muush.dev',
        external: true,
      },
      {
        label: 'TikTok',
        href: 'https://www.tiktok.com/@muush.dev',
        external: true,
      },
    ],
  },
]

const props = {
  columns,
  home: '/es',
  tagline: 'Hablamos negocio y código.',
  category: 'Technology solution studio',
  copyright: '© 2026 muush · Todos los derechos reservados',
  location: 'CDMX · MX',
}

function mountFooter() {
  return mount(SiteFooter, { props })
}

describe('SiteFooter', () => {
  it('should render a contentinfo landmark when rendered', () => {
    expect(mountFooter().find('footer').exists()).toBe(true)
  })

  it('should render exactly four columns when rendered', () => {
    /* Asserted by count so a silently dropped column fails rather than
       quietly narrowing the footer. */
    expect(mountFooter().findAll('h2')).toHaveLength(4)
  })

  it('should render the columns in the order the design fixes', () => {
    const titles = mountFooter()
      .findAll('h2')
      .map(title => title.text())

    expect(titles).toEqual(['Navegación', 'Contacto', 'muush', 'Redes'])
  })

  it('should point the brand lockup at the home of the active locale', () => {
    const link = mountFooter().find('a')

    expect(link.attributes('href')).toBe('/es')
    expect(link.find('svg').exists()).toBe(true)
  })

  it('should render the tagline and the category when rendered', () => {
    const text = mountFooter().text()

    expect(text).toContain('Hablamos negocio y código.')
    expect(text).toContain('Technology solution studio')
  })

  it('should render both bottom bar texts when rendered', () => {
    const text = mountFooter().text()

    expect(text).toContain('© 2026 muush · Todos los derechos reservados')
    expect(text).toContain('CDMX · MX')
  })

  it('should rule the bottom bar with the unified hairline when rendered', () => {
    const bar = mountFooter().find('.border-hairline-footer')

    expect(bar.exists()).toBe(true)
    expect(bar.classes()).toContain('border-t')
  })

  it('should render no anchor without a destination anywhere in the footer', () => {
    const anchors = mountFooter().findAll('a')

    expect(anchors.every(anchor => anchor.attributes('href'))).toBe(true)
  })
})

/**
 * The audit `ui-map.md` § 8 asks for, at the rendering level: every item is
 * either a link with a real destination or a non-interactive text run. A
 * third category — an `<a>` with no `href` — is what would put a 404 in the
 * footer of every page of the site.
 */
describe('SiteFooter · destination audit', () => {
  const undecided = ['Agenda una llamada', 'FAQ', 'Blog · próximamente']

  it('should place every item in exactly one of the two categories', () => {
    const wrapper = mountFooter()
    const entries = wrapper.findAll('li')
    const total = columns.reduce((sum, column) => sum + column.items.length, 0)

    expect(entries).toHaveLength(total)
    for (const entry of entries) {
      const link = entry.find('a')
      const isLink = link.exists() && Boolean(link.attributes('href'))
      const isText = !link.exists() && entry.find('span').exists()

      expect(isLink !== isText).toBe(true)
    }
  })

  it('should render the three undecided items as one identical treatment', () => {
    const wrapper = mountFooter()

    for (const label of undecided) {
      const entry = wrapper
        .findAll('li')
        .find(candidate => candidate.text() === label)

      expect(entry?.find('a').exists()).toBe(false)
      expect(entry?.find('span').classes()).toEqual(['text-ink-300'])
    }
  })

  it('should sever the opener on every external destination', () => {
    const externals = mountFooter()
      .findAll('a')
      .filter(link => link.attributes('href')?.startsWith('https://'))

    expect(externals).toHaveLength(4)
    for (const link of externals) {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    }
  })

  it('should keep the mail link in the same browsing context', () => {
    /* A new tab for a `mailto:` leaves the visitor on a blank page. */
    const mail = mountFooter()
      .findAll('a')
      .find(link => link.attributes('href')?.startsWith('mailto:'))

    expect(mail?.attributes('href')).toBe('mailto:support@muush.dev')
    expect(mail?.attributes('target')).toBeUndefined()
  })

  it('should carry the pre-filled message on the WhatsApp destination', () => {
    const whatsapp = mountFooter()
      .findAll('a')
      .find(link => link.attributes('href')?.startsWith('https://wa.me/'))

    expect(whatsapp?.attributes('href')).toContain('?text=')
  })
})
