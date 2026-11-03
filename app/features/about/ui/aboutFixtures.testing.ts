import type { AboutHeroContent } from '@/features/about/data/aboutHeroContent'
import type { TeamCompositionContent } from '@/features/about/data/teamCompositionContent'
import type { WhereWeAreContent } from '@/features/about/data/whereWeAreContent'
import type { WorkContent } from '@/features/about/data/workContent'
import type {
  ApplicationFormContent,
  ApplicationSubmitter,
} from '@/features/forms'
import { MAP_COPY } from '@/shared/ui/mapFixtures.testing'

/**
 * Resolved Nosotros copy for the catalogue and the component tests (feature
 * 46): what the about content composables hand the page on `/es/nosotros`
 * and `/en/about`, verbatim from `docs/business/muush-1.0.md` § 4.8 and pen
 * extract-46 § 1. `tests/about-copy.test.ts` pins the locale files to the
 * same strings. The application form fixture is a resolved
 * `ApplicationFormContent` (the forms module keeps its own fixtures
 * internal). Fixtures only; the app never imports this file.
 */
export type FixtureLocale = 'es' | 'en'

export const ABOUT_HERO_COPY: Record<FixtureLocale, AboutHeroContent> = {
  es: {
    pill: 'Nosotros',
    headingFirst: 'El equipo se arma',
    headingSecond: 'alrededor del proyecto.',
    intro:
      'Reunimos al talento indicado para cada proyecto y le damos libertad de elegir en qué proyectos entra y desde dónde trabaja. Esa flexibilidad sostiene nuestro talent pool y nos permite entregar con una estructura ligera.',
  },
  en: {
    pill: 'About',
    headingFirst: 'The team takes shape',
    headingSecond: 'around the project.',
    intro:
      'We bring together the right talent for each project and give them the freedom to choose which projects they join and where they work from. That flexibility sustains our talent pool and lets us deliver with a lean structure.',
  },
}

export const TEAM_COMPOSITION_COPY: Record<
  FixtureLocale,
  TeamCompositionContent
> = {
  es: {
    pill: 'Cómo se arma',
    headingFirst: 'Quién entra',
    headingSecond: 'a tu proyecto.',
    cards: [
      {
        kind: 'team',
        label: 'Equipo base',
        title: 'Siempre en tu proyecto',
        text: 'Estrategia, diseño e ingeniería, de principio a fin.',
      },
      {
        kind: 'pool',
        label: 'Talent pool',
        title: 'Cuando el proyecto lo pide',
        text: 'Especialistas que entran con el mismo estándar de entrega.',
      },
      {
        kind: 'partner',
        label: 'Aliados',
        title: 'Creativo y marketing',
        text: 'Estudios de confianza, coordinados por nosotros.',
      },
    ],
  },
  en: {
    pill: 'How it comes together',
    headingFirst: 'Who joins',
    headingSecond: 'your project.',
    cards: [
      {
        kind: 'team',
        label: 'Core team',
        title: 'Always on your project',
        text: 'Strategy, design and engineering, from start to finish.',
      },
      {
        kind: 'pool',
        label: 'Talent pool',
        title: 'When the project calls for it',
        text: 'Specialists who join with the same delivery standard.',
      },
      {
        kind: 'partner',
        label: 'Partners',
        title: 'Creative and marketing',
        text: 'Trusted studios, coordinated by us.',
      },
    ],
  },
}

export const WHERE_WE_ARE_COPY: Record<FixtureLocale, WhereWeAreContent> = {
  es: {
    ...MAP_COPY.es,
    pill: 'Dónde estamos',
    headingFirst: 'Un talent pool que crece',
    headingSecond: 'por sector y por proyecto.',
    body: 'Todos trabajamos con las mismas reglas y el mismo estándar de entrega.',
  },
  en: {
    ...MAP_COPY.en,
    pill: 'Where we are',
    headingFirst: 'A talent pool that grows',
    headingSecond: 'by industry and by project.',
    body: 'We all work under the same rules and the same delivery standard.',
  },
}

export const WORK_COPY: Record<FixtureLocale, WorkContent> = {
  es: {
    pill: 'Trabaja con muush',
    headingFirst: 'Tú eliges en qué',
    headingSecond: 'proyectos entras.',
    body: 'Con quién y desde dónde, también. Si trabajas en tecnología, diseño o producción, cuéntanos qué haces y te buscamos cuando haya un proyecto para ti.',
    areasLabel: 'Áreas que sumamos',
    areas: [
      'Ingeniería y desarrollo',
      'Diseño de producto y UX',
      'Creativo, contenido y marketing',
    ],
  },
  en: {
    pill: 'Work with muush',
    headingFirst: 'You choose which',
    headingSecond: 'projects you join.',
    body: "Who you work with and where from, too. If you work in technology, design or production, tell us what you do and we'll reach out when there's a project for you.",
    areasLabel: 'Areas we bring in',
    areas: [
      'Engineering and development',
      'Product design and UX',
      'Creative, content and marketing',
    ],
  },
}

/* The real catalogue (feature 24, 2026-09-08), as `ROLE_CATALOG` holds it. */
const AREAS = {
  it: 'IT',
  product: 'Product',
  projectManagement: 'Project management',
  sales: 'Sales',
  marketing: 'Marketing',
  creative: 'Creative',
}

const ROLES = {
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

const SPANISH_FORM: ApplicationFormContent = {
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
      areas: AREAS,
      roles: ROLES,
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

const ENGLISH_FORM: ApplicationFormContent = {
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
      areas: AREAS,
      roles: ROLES,
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

export const APPLICATION_FORM_COPY: Record<
  FixtureLocale,
  ApplicationFormContent
> = { es: SPANISH_FORM, en: ENGLISH_FORM }

/** A catalogue submitter: nothing reaches the network. */
export const STORY_APPLICATION_SUBMITTER: ApplicationSubmitter = {
  engage: () => undefined,
  submit: async () => ({ kind: 'success' }),
}
