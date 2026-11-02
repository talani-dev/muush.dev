import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FooterColumns from './FooterColumns.vue'
import MobileFooter from './MobileFooter.vue'
import SiteFooter from './SiteFooter.vue'
import { SHELL_COPY, SOCIALS } from './shellFixtures.testing'

/** Feature 43 · FR-030…FR-035, contract § 7; pen extract-43 § 6. */
function render(locale: 'es' | 'en' = 'es') {
  const copy = SHELL_COPY[locale]
  return mount(SiteFooter, {
    props: {
      columns: copy.columns,
      contactChannels: copy.contactChannels,
      mobileLinks: copy.mobileLinks,
      socials: SOCIALS,
      legal: copy.legal,
      home: copy.home,
      homeLabel: copy.homeLabel,
      tagline: copy.tagline,
      category: copy.category,
      copyright: copy.copyright,
      label: copy.footerLabel,
    },
  })
}

describe('SiteFooter', () => {
  it('should be a named, transparent footer with a Blanco 8 % rule when rendered', () => {
    const footer = render().find('footer')

    expect(footer.attributes('aria-label')).toBe('Pie de página')
    expect(footer.classes()).toEqual(['border-t', 'border-blanco-8'])
  })

  it('should show the desktop layout from lg and the mobile one below it', () => {
    const wrapper = render()

    expect(wrapper.find('[data-escritorio]').classes()).toEqual(
      expect.arrayContaining(['hidden', 'lg:block'])
    )
    expect(wrapper.findComponent(MobileFooter).classes()).toContain('lg:hidden')
  })

  it('should lay the desktop brand block beside the four columns when rendered', () => {
    const desktop = render('en').find('[data-escritorio]')

    expect(desktop.text()).toContain('We speak business and code.')
    expect(desktop.find('p.font-titulo').classes()).toContain('text-lema')
    expect(desktop.findComponent(FooterColumns).props('columns')).toHaveLength(
      4
    )
  })

  it('should end the desktop layout with the copyright and the legal text', () => {
    const bottom = render().find('[data-escritorio] .border-t')
    const [copyright, legal] = bottom.findAll('p')

    expect(copyright?.text()).toBe(
      '© 2026 muush · Todos los derechos reservados'
    )
    expect(legal?.findAll('span').map(item => item.text())).toEqual([
      'Aviso de privacidad',
      'Términos y condiciones',
    ])
    expect(legal?.find('a').exists()).toBe(false)
  })

  it('should hand the mobile layout its own models when rendered', () => {
    const mobile = render().findComponent(MobileFooter)

    expect(mobile.props('contactChannels')).toHaveLength(3)
    expect(mobile.props('links')).toHaveLength(6)
    expect(mobile.props('socials')).toEqual(SOCIALS)
  })
})
