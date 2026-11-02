import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type {
  ApplicationFormContent,
  ApplicationSubmitter,
} from '@/features/forms'
import SectionBackdrop from '@/shared/ui/legacy/SectionBackdrop.vue'
import SectionGlow from '@/shared/ui/legacy/SectionGlow.vue'
import WorkWithMuushSection from './WorkWithMuushSection.vue'

/**
 * Fixtures, not copy. The component takes already-translated strings and a
 * ready-made `formContent` object — it calls no Nuxt composable of its own —
 * which is why it mounts here with no router and no i18n instance present
 * (`docs/business/rules.md` § R23). Since feature 45 the form content is
 * the v2 `ApplicationFormContent`: the v2 panel sits in this v1 section until
 * feature 46.
 */
const formContent: ApplicationFormContent = {
  fields: {
    name: {
      label: 'Nombre',
      placeholder: 'Nombre y apellido',
      errorRequired: 'Escribe tu nombre.',
    },
    email: {
      label: 'Correo',
      placeholder: 'tu@correo.com',
      errorRequired: 'Escribe un correo como nombre@empresa.com',
      errorFormat: 'Escribe un correo como nombre@empresa.com',
    },
    areaRole: {
      label: 'Área y rol',
      placeholder: 'Selecciona tu área y rol',
      errorRequired: 'Elige tu área y rol.',
      areas: {
        it: 'IT',
        product: 'Product',
        projectManagement: 'Project management',
        sales: 'Sales',
        marketing: 'Marketing',
        creative: 'Creative',
      },
      roles: {
        it: { backend: 'Backend' },
        product: { uxUiDesign: 'UX/UI design' },
        projectManagement: { projectManager: 'Project manager' },
        sales: { sales: 'Ventas' },
        marketing: { growth: 'Growth' },
        creative: { graphicDesign: 'Diseño gráfico' },
      },
    },
    portfolio: {
      label: 'Portafolio',
      placeholder: 'https://',
      errorFormat: 'Ingresa una URL válida.',
    },
    linkedin: {
      label: 'LinkedIn',
      placeholder: 'https://linkedin.com/in/…',
      errorFormat: 'Ingresa una URL válida.',
    },
    cv: {
      label: 'CV',
      placeholder: 'Adjunta tu CV en PDF · máximo 5 MB',
      errorFormat: 'Adjunta tu CV en PDF de hasta 5 MB.',
      errorSize: 'Adjunta tu CV en PDF de hasta 5 MB.',
    },
    contactPreference: {
      label: '¿Cómo prefieres que te contactemos?',
      options: { email: 'Correo', whatsapp: 'WhatsApp' },
    },
    whatsappCountry: {
      label: 'Lada del país',
      errorInvalid: 'Elige la lada de tu país.',
      options: [
        { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
        { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽' },
        { code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸' },
      ],
    },
    whatsapp: {
      label: 'Número de WhatsApp',
      errorRequired: 'Escribe tu número.',
      errorDigits: 'Deben ser entre 6 y 14 dígitos.',
    },
  },
  progress: { 1: 'Paso 1 de 2 · Tus datos', 2: 'Paso 2 de 2 · Tu perfil' },
  continue: 'Continuar',
  back: '← Atrás',
  privacy: {
    label:
      'Acepto el aviso de privacidad y que muush me contacte sobre mi aplicación.',
    requiredHint: 'Acepta el aviso de privacidad para enviar.',
  },
  submit: 'Enviar aplicación',
  sending: 'Enviando…',
  retry: 'Intentar de nuevo',
  uploading: 'Subiendo CV…',
  cvUploadError: {
    message:
      'No pudimos subir tu CV. Inténtalo de nuevo o envía la postulación sin CV.',
    submitWithoutCv: 'Enviar sin CV',
  },
  error: {
    before:
      'El envío se interrumpió. Tus datos y tu CV siguen aquí: vuelve a intentarlo o escríbenos a',
    email: 'support@muush.dev',
    href: 'mailto:support@muush.dev',
    after: '.',
  },
  success: {
    title: 'Recibimos tu aplicación.',
    body: 'Revisamos tu perfil y te escribimos cuando haya un proyecto que encaje contigo.',
    action: { label: 'Volver al inicio', to: '/es' },
  },
}

/** Never reaches the network: the section only passes it through. */
const formSubmitter: ApplicationSubmitter = {
  engage: () => undefined,
  submit: async () => ({ kind: 'success' }),
}

const props = {
  eyebrow: 'Work with muush',
  headline: 'Tú eliges en qué proyectos entras, con quién y desde dónde.',
  body: 'Si trabajas en tecnología, diseño o producción, cuéntanos qué haces.',
  formContent,
  formSubmitter,
}

function mountSection() {
  return mount(WorkWithMuushSection, { props })
}

describe('WorkWithMuushSection · structure', () => {
  it('should carry the shared trabaja-con-muush anchor on its section root when mounted', () => {
    /* Feature 43 · the footer's "Trabaja con muush" target (spec FR-025). */
    expect(mountSection().find('section').attributes('id')).toBe(
      'trabaja-con-muush'
    )
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
