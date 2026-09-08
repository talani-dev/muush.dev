import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { ApplicationFormContent } from '@/features/forms'
import SectionBackdrop from '@/shared/ui/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/SectionGlow.vue'
import WorkWithMuushSection from './WorkWithMuushSection.vue'

/**
 * Fixtures, not copy. The component takes already-translated strings and a
 * ready-made `formContent` object — it calls no Nuxt composable of its own —
 * which is why it mounts here with no router and no i18n instance present
 * (`docs/business/rules.md` § R23), the same discipline `ContactSection.test.ts`
 * follows.
 */
const formContent: ApplicationFormContent = {
  fields: {
    name: { label: 'Nombre', errorRequired: 'Escribe tu nombre' },
    email: {
      label: 'Correo',
      errorRequired: 'Escribe tu correo',
      errorFormat: 'Correo inválido',
    },
    areaRole: {
      label: 'Área y rol',
      placeholder: 'Área y rol',
      errorRequired: 'Elige un área y un rol',
      areas: {
        it: 'IT',
        product: 'Product',
        projectManagement: 'Project management',
        sales: 'Sales',
        marketing: 'Marketing',
        creative: 'Creative',
      },
      roles: {
        it: { placeholder: 'Rol por confirmar' },
        product: { placeholder: 'Rol por confirmar' },
        projectManagement: { placeholder: 'Rol por confirmar' },
        sales: { placeholder: 'Rol por confirmar' },
        marketing: { placeholder: 'Rol por confirmar' },
        creative: { placeholder: 'Rol por confirmar' },
      },
    },
    portfolio: {
      label: 'Portafolio',
      placeholder: 'https://tu-portafolio.com',
      errorFormat: 'Ingresa una URL válida',
    },
    linkedin: {
      label: 'LinkedIn',
      placeholder: 'https://linkedin.com/in/tu-usuario',
      errorFormat: 'Ingresa una URL válida',
    },
    cv: {
      label: 'CV',
      placeholder: 'Adjuntar CV · PDF',
      errorFormat: 'Solo se aceptan archivos PDF',
      errorSize: 'El archivo debe pesar máximo 5MB',
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
  success: { title: 'Gracias, ya tenemos tu perfil.' },
  error: { title: 'No pudimos enviarlo.', fallback: 'support@muush.dev' },
}

const props = {
  eyebrow: 'Work with muush',
  headline: 'Tú eliges en qué proyectos entras, con quién y desde dónde.',
  body: 'Si trabajas en tecnología, diseño o producción, cuéntanos qué haces.',
  formContent,
}

function mountSection() {
  return mount(WorkWithMuushSection, { props })
}

describe('WorkWithMuushSection · structure', () => {
  it('should carry id="work" on its section root when mounted', () => {
    expect(mountSection().find('section').attributes('id')).toBe('work')
  })

  it('should render the Pill, headline, body and one application form when mounted', () => {
    const wrapper = mountSection()

    expect(wrapper.text()).toContain(props.eyebrow)
    expect(wrapper.find('h2').text()).toBe(props.headline)
    expect(wrapper.find('p').text()).toBe(props.body)
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.findAll('input, select, textarea').length).toBeGreaterThan(0)
  })

  it('should render no href without a destination anywhere in the tree', () => {
    const anchors = mountSection().findAll('a')

    for (const anchor of anchors) {
      expect(anchor.attributes('href')).toBeTruthy()
    }
  })
})

describe('WorkWithMuushSection · the paint-order contract', () => {
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

  it('should contribute exactly the three reused Contacto glows when mounted', () => {
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

  it('should anchor each glow by its own centre on its own pair of tokens when mounted', () => {
    const anchors = mountSection()
      .findAllComponents(SectionGlow)
      .map(glow => glow.classes())

    const expected = [
      ['top-work-glow-foco-y', 'left-work-glow-foco-x'],
      ['top-work-glow-wine-y', 'left-work-glow-wine-x'],
      ['top-work-glow-cierre-y', 'left-work-glow-cierre-x'],
    ]

    anchors.forEach((classes, index) => {
      expect(classes).toContain('absolute')
      expect(classes).toContain('-translate-x-1/2')
      expect(classes).toContain('-translate-y-1/2')
      for (const token of expected[index] ?? []) {
        expect(classes, token).toContain(token)
      }
    })
  })
})

describe('WorkWithMuushSection · layout', () => {
  it('should place the left block before the form in document order (mobile stack)', () => {
    const html = mountSection().html()

    expect(html.indexOf(props.headline)).toBeLessThan(html.indexOf('<form'))
  })

  it('should give the left block and the form their own desktop grid area classes', () => {
    const wrapper = mountSection()

    expect(wrapper.find('.work-layout__form').exists()).toBe(true)
    expect(wrapper.findAll('.work-layout__text').length).toBeGreaterThanOrEqual(
      1
    )
  })
})
