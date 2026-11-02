import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type {
  ApplicationFormContent,
  ApplicationSubmitter,
} from '@/features/forms'
import WorkWithMuushSection from './WorkWithMuushSection.vue'

/**
 * `Work with muush`, the About page's second section. Switch the viewport
 * control between *Móvil (390)* and *Escritorio (1440)* to see the layout
 * reflow between the stacked mobile flow and the two-column desktop grid.
 * Since feature 45 the form column holds the v2 application panel (two
 * steps at 390); the rest of the section stays v1 until feature 46.
 *
 * Every prop is a fixture. The component calls no Nuxt composable, which is
 * why it renders here with no router, no i18n instance and no Nuxt runtime
 * (`docs/business/rules.md` § R23).
 */
const meta = {
  title: 'Legacy v1/About/WorkWithMuushSection',
  component: WorkWithMuushSection,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WorkWithMuushSection>

export default meta
type Story = StoryObj<typeof meta>

const areas = {
  it: 'IT',
  product: 'Product',
  projectManagement: 'Project management',
  sales: 'Sales',
  marketing: 'Marketing',
  creative: 'Creative',
}

/* The real catalogue (feature 24, 2026-09-08) — see `ROLE_CATALOG`. */
const roles = {
  it: {
    backend: 'Backend',
    frontend: 'Frontend',
    fullStack: 'Full stack',
    mobile: 'Mobile',
    devOps: 'DevOps',
    infrastructureCloud: 'Infrastructure y Cloud',
  },
  product: {
    productManager: 'Product manager',
    productOwner: 'Product owner',
    uxResearch: 'UX research',
    uxUiDesign: 'UX/UI design',
    productDesign: 'Diseño de producto',
    designSystems: 'Design systems',
  },
  projectManagement: { projectManager: 'Project manager' },
  sales: {
    sales: 'Ventas',
    accountManagement: 'Account management',
    partnerships: 'Partnerships',
  },
  marketing: {
    growth: 'Growth',
    performanceMedia: 'Performance y pauta',
    content: 'Contenido',
    seo: 'SEO',
    communityManagement: 'Community management',
  },
  creative: {
    design3d: 'Diseño 3D',
    graphicDesign: 'Diseño gráfico',
    blogStorytelling: 'Blog y storytelling',
  },
}

const spanishForm: ApplicationFormContent = {
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
      areas: areas,
      roles: roles,
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

const englishForm: ApplicationFormContent = {
  fields: {
    name: {
      label: 'Name',
      placeholder: 'First and last name',
      errorRequired: 'Enter your name.',
    },
    email: {
      label: 'Email',
      placeholder: 'you@email.com',
      errorRequired: 'Enter an email like name@company.com',
      errorFormat: 'Enter an email like name@company.com',
    },
    areaRole: {
      label: 'Area and role',
      placeholder: 'Select your area and role',
      errorRequired: 'Choose your area and role.',
      areas: areas,
      roles: roles,
    },
    portfolio: {
      label: 'Portfolio',
      placeholder: 'https://',
      errorFormat: 'Enter a valid URL.',
    },
    linkedin: {
      label: 'LinkedIn',
      placeholder: 'https://linkedin.com/in/…',
      errorFormat: 'Enter a valid URL.',
    },
    cv: {
      label: 'CV',
      placeholder: 'Attach your CV as a PDF · max 5 MB',
      errorFormat: 'Attach your CV as a PDF up to 5 MB.',
      errorSize: 'Attach your CV as a PDF up to 5 MB.',
    },
    contactPreference: {
      label: 'How should we contact you?',
      options: { email: 'Email', whatsapp: 'WhatsApp' },
    },
    whatsappCountry: {
      label: 'Country code',
      errorInvalid: 'Choose your country code.',
      options: [
        { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
        { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
        { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
      ],
    },
    whatsapp: {
      label: 'WhatsApp number',
      errorRequired: 'Enter your number.',
      errorDigits: 'Must be 6 to 14 digits.',
    },
  },
  progress: {
    1: 'Step 1 of 2 · Your details',
    2: 'Step 2 of 2 · Your profile',
  },
  continue: 'Continue',
  back: '← Back',
  privacy: {
    label:
      'I accept the privacy notice and agree to be contacted by muush about my application.',
    requiredHint: 'Accept the privacy notice to send.',
  },
  submit: 'Send application',
  sending: 'Sending…',
  retry: 'Try again',
  uploading: 'Uploading CV…',
  cvUploadError: {
    message: "We couldn't upload your CV. Try again or submit without a CV.",
    submitWithoutCv: 'Submit without CV',
  },
  error: {
    before:
      'Sending was interrupted. Your details and CV are still here: try again or write to us at',
    email: 'support@muush.dev',
    href: 'mailto:support@muush.dev',
    after: '.',
  },
  success: {
    title: 'We got your application.',
    body: "We'll review your profile and reach out when there's a project that fits you.",
    action: { label: 'Back to home', to: '/en' },
  },
}

/** Never reaches the network: the section only passes it through. */
const formSubmitter: ApplicationSubmitter = {
  engage: () => undefined,
  submit: async () => ({ kind: 'success' }),
}

const spanish = {
  eyebrow: 'Work with muush',
  headline: 'Tú eliges en qué proyectos entras, con quién y desde dónde.',
  body: 'Si trabajas en tecnología, diseño o producción y quieres sumarte a nuestro talent pool, cuéntanos qué haces.',
  formContent: spanishForm,
  formSubmitter,
}

const english = {
  eyebrow: 'Work with muush',
  headline:
    'You choose which projects you join, who you work with, and where from.',
  body: 'If you work in technology, design or production and want to join our talent pool, tell us what you do.',
  formContent: englishForm,
  formSubmitter,
}

export const Desktop: Story = {
  args: spanish,
  globals: { viewport: { value: 'desktop' } },
}

export const Mobile: Story = {
  args: spanish,
  globals: { viewport: { value: 'mobile' } },
}

export const DesktopEnglish: Story = {
  args: english,
  globals: { viewport: { value: 'desktop' } },
}

export const MobileEnglish: Story = {
  args: english,
  globals: { viewport: { value: 'mobile' } },
}
