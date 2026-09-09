import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { ContactFormContent } from '@/features/forms'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'
import ContactSection from './ContactSection.vue'

/**
 * Fixtures, not copy. The component takes already-translated strings and a
 * ready-made `formContent` object — it calls no Nuxt composable of its own —
 * which is why it mounts here with no router and no i18n instance present
 * (`docs/business/rules.md` § R23).
 */
const formContent: ContactFormContent = {
  fields: {
    name: { label: 'Nombre', errorRequired: 'Escribe tu nombre' },
    email: {
      label: 'Correo',
      errorRequired: 'Escribe tu correo',
      errorFormat: 'Correo inválido',
    },
    company: { label: 'Empresa o proyecto' },
    identity: {
      label: '¿Cómo te identificas?',
      errorRequired: 'Elige una opción',
      options: {
        realEstate: 'Bienes raíces/inmobiliaria',
        creator: 'Creador de contenido',
        company: 'Empresa',
        independent: 'Emprendedor o persona física',
        startup: 'Startup',
        other: 'Otro',
      },
    },
    need: {
      label: '¿Qué necesitas?',
      errorRequired: 'Cuéntanos qué necesitas',
      errorLength: 'Cuéntanos un poco más',
    },
    contactPreference: {
      label: '¿Cómo prefieres que te contactemos?',
      options: { email: 'Correo', whatsapp: 'WhatsApp' },
    },
    whatsapp: {
      label: 'Número de WhatsApp',
      errorRequired: 'Escribe tu número',
      errorDigits: 'Deben ser 10 dígitos',
    },
  },
  submit: 'Enviar',
  sending: 'Enviando…',
  success: { title: 'Listo, ya lo recibimos.' },
  error: { title: 'No pudimos enviarlo.', fallback: 'support@muush.dev' },
}

const props = {
  eyebrow: 'Contacto',
  heading: 'Cuéntanos tu proyecto.',
  body: 'Déjanos lo básico y te respondemos por donde prefieras. Si ya sabes qué necesitas, agenda una llamada directo con el equipo.',
  ctaSecondary: 'Agenda una llamada',
  altQuestion: '¿Ya sabes qué necesitas?',
  callHref: CALL_BOOKING_URL,
  formContent,
}

function mountSection() {
  return mount(ContactSection, { props })
}

describe('ContactSection · structure and the two dangling CTAs', () => {
  it('should carry id="contacto" on its section root when mounted', () => {
    expect(mountSection().find('section').attributes('id')).toBe('contacto')
  })

  it('should render the Pill, heading, body and one contact form when mounted', () => {
    const wrapper = mountSection()

    expect(wrapper.text()).toContain(props.eyebrow)
    expect(wrapper.find('h2').text()).toBe(props.heading)
    expect(wrapper.find('p').text()).toBe(props.body)
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.findAll('input, select, textarea').length).toBeGreaterThan(0)
  })

  it('should render the alternate route as an external link with an arrow', () => {
    const links = mountSection().findAll('a')
    const link = links.find(anchor =>
      anchor.text().includes(props.ctaSecondary)
    )

    expect(link?.attributes('href')).toBe(props.callHref)
    expect(link?.attributes('target')).toBe('_blank')
    expect(link?.attributes('rel')).toBe('noopener noreferrer')
    expect(link?.text()).toContain('→')
  })
})

describe('ContactSection · the paint-order contract', () => {
  const STACKING_CONTEXT_UTILITIES = [
    'transform',
    'translate',
    'scale',
    'rotate',
    'filter',
    'backdrop-filter',
    'opacity-',
    'isolate',
    'will-change',
    'contain-paint',
    'fixed',
    'sticky',
  ]

  it('should create no stacking context on the section root when mounted', () => {
    const root = mountSection().find('section').classes()

    expect(root).toContain('relative')
    for (const utility of STACKING_CONTEXT_UTILITIES) {
      expect(
        root.some(name => name.includes(utility)),
        utility
      ).toBe(false)
    }
  })

  it('should paint no background of its own on the section root when mounted', () => {
    const root = mountSection().find('section').classes()

    expect(root.some(name => name.startsWith('bg-'))).toBe(false)
  })

  it('should declare no bottom padding when mounted', () => {
    const root = mountSection().find('section').classes()

    expect(root.some(name => /^pb-/.test(name))).toBe(false)
  })

  it('should contribute exactly the three CTA final glows when mounted', () => {
    const glows = mountSection().findAllComponents(SectionGlow)

    expect(
      glows.map(glow => ({
        color: glow.props('color'),
        opacity: glow.props('opacity'),
        size: glow.props('size'),
      }))
    ).toEqual([
      { color: 'red-400', opacity: 60, size: '1500-760' },
      { color: 'wine-300', opacity: 37, size: '1000-560' },
      { color: 'wine-400', opacity: 28, size: '900-520' },
    ])
  })

  it('should render every glow inside the section backdrop when mounted', () => {
    const wrapper = mountSection()
    const backdrop = wrapper.getComponent(SectionBackdrop).element

    for (const glow of wrapper.findAllComponents(SectionGlow)) {
      expect(backdrop.contains(glow.element)).toBe(true)
    }
  })
})

describe('ContactSection · viewport order (spec US4)', () => {
  it('should place the alternate route after the form in document order', () => {
    const html = mountSection().html()

    expect(html.indexOf('<form')).toBeLessThan(html.indexOf(props.ctaSecondary))
  })

  it('should give the alternate route group its own desktop grid area class', () => {
    /* The grid area lands on the wrapping div (feature 23), which also
       carries the lead-in question and the hairline divider — not on the
       `LinkArrow` itself. */
    const wrapper = mountSection()
    const group = wrapper.find('.contact-layout__alt')

    expect(group.exists()).toBe(true)
    expect(group.text()).toContain(props.ctaSecondary)
  })
})

describe('ContactSection · the alternate route (feature 23, items 6/7)', () => {
  it('should render the lead-in question above the call-booking link', () => {
    const wrapper = mountSection()
    const group = wrapper.find('.contact-layout__alt')

    expect(group.text()).toContain(props.altQuestion)
    expect(group.text().indexOf(props.altQuestion)).toBeLessThan(
      group.text().indexOf(props.ctaSecondary)
    )
  })

  it('should draw a hairline divider above the alternate route, reusing the footer token', () => {
    const group = mountSection().find('.contact-layout__alt')

    expect(group.classes()).toContain('border-t')
    expect(group.classes()).toContain('border-hairline-footer')
  })
})
