import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { Component } from 'vue'
import Lockup from '@/shared/ui/Lockup.vue'
import MobileFooter from './MobileFooter.vue'
import SocialLinks from './SocialLinks.vue'
import {
  ExactActiveLinkStub,
  SHELL_COPY,
  SOCIALS,
} from './shellFixtures.testing'

/** Feature 43 · FR-033, contract § 7; pen extract-43 § 6 (`kJfw5`). */
function render(
  locale: 'es' | 'en' = 'es',
  stubs: Record<string, Component> = {}
) {
  const copy = SHELL_COPY[locale]
  return mount(MobileFooter, {
    global: { stubs },
    props: {
      contactChannels: copy.contactChannels,
      links: copy.mobileLinks,
      socials: SOCIALS,
      legal: copy.legal,
      home: copy.home,
      homeLabel: copy.homeLabel,
      tagline: copy.tagline,
      category: copy.category,
      copyright: copy.copyright,
    },
  })
}

describe('MobileFooter', () => {
  it('should never mark the logo as the current page when the router marks its link', () => {
    /* Feature 44 · FR-028 (review-43c nit 5): the stub marks every link
       exact-active, as the router does on the home page. */
    const logos = render('es', { NuxtLink: ExactActiveLinkStub }).findAll(
      'a[aria-label="Inicio de muush"]'
    )

    expect(logos.length).toBeGreaterThan(0)
    for (const logo of logos) {
      expect(logo.attributes('aria-current')).toBeUndefined()
    }
  })

  it('should open with the brand block when rendered', () => {
    const wrapper = render()
    const brand = wrapper.find('div > div')

    expect(brand.findComponent(Lockup).exists()).toBe(true)
    expect(brand.find('a').attributes('aria-label')).toBe('Inicio de muush')
    expect(brand.text()).toContain('Hablamos negocio y código.')
    expect(brand.text()).toContain('Technology Solution Studio.')
  })

  it('should put the three contact channels first as full-width rows with their hints', () => {
    const rows = render().findAll('ul.gap-contacto-gap a')

    expect(
      rows.map(row =>
        row
          .findAll(':scope > span')
          .map(part => part.text().replace(/\s+/g, ' '))
      )
    ).toEqual([
      ['WhatsApp', 'Escríbenos →'],
      ['Agenda una llamada', '30 minutos →'],
      ['support@muush.dev', 'Correo →'],
    ])
    expect(rows[0]?.classes()).toEqual(
      expect.arrayContaining([
        'bg-vidrio-fondo',
        'rounded-contacto',
        'border-linea',
        'justify-between',
      ])
    )
  })

  it('should hide the hint arrow from assistive technology when rendered', () => {
    const arrow = render().find('ul.gap-contacto-gap [aria-hidden="true"]')

    expect(arrow.text()).toBe('→')
  })

  it('should open WhatsApp and the booking in a new tab and the mail in the same one', () => {
    const [whatsapp, call, mail] = render().findAll('ul.gap-contacto-gap a')

    expect(whatsapp?.attributes('target')).toBe('_blank')
    expect(call?.attributes('target')).toBe('_blank')
    expect(mail?.attributes('target')).toBeUndefined()
  })

  it('should list the links on one wrapped line, Home first, with the blog as text', () => {
    const line = render('en').findAll('ul')[1]

    expect(line?.text().replace(/\s+/g, ' ')).toBe(
      'Home · Services · How we work · About · FAQ · Work with muush · Blog (coming soon)'
    )
    /* Feature 46 · FR-031: Preguntas follows About. */
    expect(line?.findAll('a')).toHaveLength(6)
    expect(line?.find('a').attributes('href')).toBe('/en')
  })

  it('should open the Spanish line with Inicio when rendered in ES', () => {
    const line = render('es').findAll('ul')[1]

    expect(line?.find('a').text()).toBe('Inicio')
    expect(line?.find('a').attributes('href')).toBe('/es')
  })

  it('should render the 44 px social buttons when rendered', () => {
    expect(render().findComponent(SocialLinks).props('size')).toBe('footer')
  })

  it('should end with privacy and terms as text, then the copyright', () => {
    const legal = render().find('.border-carbon-700')
    const [links, copyright] = legal.findAll('p')

    expect(links?.text()).toBe('Aviso de privacidad · Términos y condiciones')
    expect(links?.find('a').exists()).toBe(false)
    expect(copyright?.text()).toBe(
      '© 2026 muush · Todos los derechos reservados'
    )
  })
})
