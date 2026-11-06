import type { ContactFormContent, ContactSubmitter } from '@/features/forms'
import type { AssessmentContent } from '@/features/landing/data/assessmentContent'
import type { HeroContent } from '@/features/landing/data/heroContent'
import type { HowWeWorkContent } from '@/features/landing/data/howWeWorkContent'
import type { ServicesContent } from '@/features/landing/data/servicesContent'
import type { WhoWeAreContent } from '@/features/landing/data/whoWeAreContent'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { MAP_COPY } from '@/shared/ui/mapFixtures.testing'

/**
 * Resolved home copy for the catalogue and the component tests (feature
 * 44): what the landing content composables hand the page on `/es` and
 * `/en`, verbatim from `docs/business/muush-1.0.md` § 4.2–4.5 and pen
 * extract-44 §§ 2–4, 8. Fixtures only; the app never imports this file.
 * `tests/landing-copy.test.ts` pins the locale files to the same strings.
 */
export type FixtureLocale = 'es' | 'en'

export const HERO_COPY: Record<FixtureLocale, HeroContent> = {
  es: {
    pillItems: [
      'Estrategia tecnológica',
      'Software, web y nube',
      'Automatización, datos e IA',
      'Diseño de producto y UX',
    ],
    headlineFirst: 'Hablamos negocio',
    headlineSecond: 'y código.',
    subtitle:
      'Diseñamos y construimos las soluciones digitales que tu negocio usa todos los días.',
    primaryLabel: 'Diagnóstico gratis',
    primaryHref: '/es#diagnostico',
    secondaryLabel: 'Cómo trabajamos',
    secondaryHref: '/es#como-trabajamos',
  },
  en: {
    pillItems: [
      'Technology strategy',
      'Software, web and cloud',
      'Automation, data and AI',
      'Product design and UX',
    ],
    headlineFirst: 'We speak business',
    headlineSecond: 'and code.',
    subtitle:
      'We design and build the digital solutions your business uses every day.',
    primaryLabel: 'Free assessment',
    primaryHref: '/en#diagnostico',
    secondaryLabel: 'How we work',
    secondaryHref: '/en#como-trabajamos',
  },
}

function whoWeAre(
  locale: FixtureLocale,
  copy: Pick<
    WhoWeAreContent,
    'pill' | 'headingFirst' | 'headingSecond' | 'body'
  >
): WhoWeAreContent {
  const map = MAP_COPY[locale]
  return {
    ...copy,
    legend: map.legend,
    soonLabel: map.soonLabel,
    regions: map.regions,
    regionsLabel: map.regionsLabel,
    groups: map.groups,
    cityNames: map.cityNames,
  }
}

export const WHO_WE_ARE_COPY: Record<FixtureLocale, WhoWeAreContent> = {
  es: whoWeAre('es', {
    pill: 'Qué es muush',
    headingFirst: 'Un equipo base y aliados de confianza,',
    headingSecond: 'según lo que pida tu proyecto.',
    body: 'Estrategia, diseño e ingeniería trabajan juntos desde el primer día. Cuando el proyecto lo pide, sumamos aliados con el mismo estándar, estén donde estén.',
  }),
  en: whoWeAre('en', {
    pill: 'Who we are',
    headingFirst: 'A core team and trusted partners,',
    headingSecond: 'shaped by what your project needs.',
    body: 'Strategy, design and engineering work together from day one. When the project calls for it, we bring in partners held to the same standard, wherever they are.',
  }),
}

export const SERVICES_COPY: Record<FixtureLocale, ServicesContent> = {
  es: {
    pill: 'Servicios',
    headingFirst: 'Lo que hacemos',
    headingSecond: 'por tu negocio.',
    cards: [
      {
        title: 'Estrategia tecnológica',
        description:
          'Un diagnóstico claro y un plan de qué hacer y en qué orden, antes de invertir.',
        icon: 'compass',
        light: 'crimsonBottomLeft',
      },
      {
        title: 'Software, web\ny nube',
        description:
          'Sitios, sistemas, portales y apps, con la nube donde viven y tus herramientas conectadas.',
        icon: 'layout-dashboard',
        light: 'aceroBottomRight',
      },
      {
        title: 'Automatización, datos e IA',
        description:
          'Procesos que corren solos, datos que se vuelven decisiones e IA donde sí suma.',
        icon: 'workflow',
        light: 'crimsonBottomLeft',
      },
      {
        title: 'Diseño de producto\ny UX',
        description: 'Pantallas tan claras que tu equipo las usa sin manual.',
        icon: 'pen-tool',
        light: 'arenaTopRight',
      },
    ],
    also: {
      label: 'También, si lo necesitas',
      chips: ['Creativo', 'Marketing'],
      note: 'Contenido, foto, video, redes y anuncios con nuestros aliados. Siempre se cotiza aparte.',
    },
  },
  en: {
    pill: 'Services',
    headingFirst: 'What we do',
    headingSecond: 'for your business.',
    cards: [
      {
        title: 'Technology\nstrategy',
        description:
          'A clear diagnosis and a plan for what to do, and in what order, before you invest.',
        icon: 'compass',
        light: 'crimsonBottomLeft',
      },
      {
        title: 'Software, web\nand cloud',
        description:
          'Websites, systems, portals and apps, with the cloud they run on and your tools connected.',
        icon: 'layout-dashboard',
        light: 'aceroBottomRight',
      },
      {
        title: 'Automation,\ndata and AI',
        description:
          'Processes that run themselves, data that turns into decisions, and AI where it truly helps.',
        icon: 'workflow',
        light: 'crimsonBottomLeft',
      },
      {
        title: 'Product design\nand UX',
        description: 'Screens so clear your team uses them without a manual.',
        icon: 'pen-tool',
        light: 'arenaTopRight',
      },
    ],
    also: {
      label: 'Also, if you need it',
      chips: ['Creative', 'Marketing'],
      note: 'Content, photo, video, social media and ads with our partners. Always quoted separately.',
    },
  },
}

export const HOW_WE_WORK_COPY: Record<FixtureLocale, HowWeWorkContent> = {
  es: {
    pill: 'Cómo trabajamos',
    headingFirst: 'Primero entendemos tu operación,',
    headingSecond: 'después decidimos qué se construye.',
    steps: [
      {
        number: '01',
        title: 'Diagnóstico',
        description:
          'Una revisión rápida para ver qué conviene resolver. Si hace falta ir a fondo, se cotiza aparte.',
        descriptionShort: 'Una revisión rápida para ver qué conviene resolver.',
        commitment: 'Te decimos qué te conviene',
        icon: 'message-circle-warning',
      },
      {
        number: '02',
        title: 'Propuesta',
        description: 'Alcance, tiempos y costo por escrito.',
        commitment: 'Solo lo que necesitas',
        icon: 'sliders-horizontal',
      },
      {
        number: '03',
        title: 'Diseño',
        description: 'Ves cómo va a funcionar antes de construir nada.',
        commitment: 'Tú apruebas cada pantalla',
        icon: 'user-round',
      },
      {
        number: '04',
        title: 'Construcción',
        description: 'Avanzamos por etapas y te mostramos cada avance.',
        commitment: 'Un solo punto de contacto',
        icon: 'file-text',
      },
      {
        number: '05',
        title: 'Lanzamiento y soporte',
        description: 'Lo ponemos en marcha y preparamos a tu equipo.',
        commitment: 'Todo documentado y tuyo',
        icon: 'key-round',
      },
    ],
  },
  en: {
    pill: 'How we work',
    headingFirst: 'First we understand how you operate,',
    headingSecond: 'then we decide what gets built.',
    steps: [
      {
        number: '01',
        title: 'Assessment',
        description:
          "A quick review to see what's worth solving. If it needs a deeper look, that's quoted separately.",
        descriptionShort: "A quick review to see what's worth solving.",
        commitment: 'We tell you what fits best',
        icon: 'message-circle-warning',
      },
      {
        number: '02',
        title: 'Proposal',
        description: 'Scope, timeline and cost in writing.',
        commitment: 'Only what you need',
        icon: 'sliders-horizontal',
      },
      {
        number: '03',
        title: 'Design',
        description: 'You see how it works before anything is built.',
        commitment: 'You approve every screen',
        icon: 'user-round',
      },
      {
        number: '04',
        title: 'Build',
        description: 'We work in stages and show you every step.',
        commitment: 'One point of contact',
        icon: 'file-text',
      },
      {
        number: '05',
        title: 'Launch and support',
        description: 'We launch it and get your team ready.',
        commitment: 'Documented and all yours',
        icon: 'key-round',
      },
    ],
  },
}

/**
 * Feature 45 · "Diagnóstico y contacto" (`muush-1.0.md` § 4.6). The form's
 * copy below is what `useContactFormContent` resolves from
 * `forms.contact.*`, typed through the `forms` barrel (Article III); the
 * forms module keeps its own fixtures for its own stories.
 */
export const ASSESSMENT_COPY: Record<FixtureLocale, AssessmentContent> = {
  es: {
    pill: 'Primer paso',
    headingFirst: 'Pide tu diagnóstico',
    headingSecond: 'sin costo.',
    body: 'Cuéntanos qué quieres resolver y te respondemos en 24 horas hábiles.',
    receivesLabel: 'Lo que recibes',
    receives: [
      'Una revisión de tu sitio y tus herramientas',
      'Qué conviene hacer primero y por qué',
      'Si hace falta ir a fondo, qué incluye y cuánto cuesta',
    ],
    callQuestion: '¿Prefieres hablar?',
    callLink: 'Agenda una llamada',
    callHref: CALL_BOOKING_URL,
  },
  en: {
    pill: 'First step',
    headingFirst: 'Request your',
    headingSecond: 'free assessment.',
    body: "Tell us what you want to solve and we'll reply within 24 business hours.",
    receivesLabel: 'What you get',
    receives: [
      'A review of your website and tools',
      'What to do first, and why',
      "If it needs a deeper look, what's included and what it costs",
    ],
    callQuestion: 'Prefer to talk?',
    callLink: 'Book a call',
    callHref: CALL_BOOKING_URL,
  },
}

const COUNTRIES = [
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸' },
] as const

function assessmentForm(locale: FixtureLocale): ContactFormContent {
  const es = locale === 'es'
  const email = es
    ? 'Escribe un correo como nombre@empresa.com'
    : 'Enter an email like name@company.com'
  const step = (n: 1 | 2, title: string) =>
    es ? `Paso ${n} de 2 · ${title}` : `Step ${n} of 2 · ${title}`
  return {
    fields: {
      name: {
        label: es ? 'Nombre' : 'Name',
        placeholder: es ? 'Nombre y apellido' : 'First and last name',
        errorRequired: es ? 'Escribe tu nombre.' : 'Enter your name.',
      },
      email: {
        label: es ? 'Correo' : 'Email',
        placeholder: es ? 'tu@correo.com' : 'you@email.com',
        errorRequired: email,
        errorFormat: email,
      },
      company: {
        label: es ? 'Empresa o proyecto' : 'Company or project',
        placeholder: es ? 'Nombre de la empresa' : 'Company name',
      },
      identity: {
        label: es ? '¿Cómo te identificas?' : 'You are a…',
        placeholder: es ? 'Selecciona una opción' : 'Select an option',
        errorRequired: es ? 'Elige una opción.' : 'Choose an option.',
        options: {
          realEstate: es ? 'Bienes raíces/inmobiliaria' : 'Real estate',
          creator: es
            ? 'Creador de contenido/marca personal'
            : 'Content creator/personal brand',
          company: es
            ? 'Empresa pública o privada'
            : 'Public or private company',
          independent: es
            ? 'Emprendedor o persona física'
            : 'Independent or sole proprietor',
          startup: 'Startup',
          other: es ? 'Otro' : 'Other',
        },
      },
      need: {
        label: es ? '¿Qué necesitas?' : 'What do you need?',
        placeholder: es
          ? 'Cuéntanos en un par de líneas qué quieres resolver.'
          : 'Tell us in a couple of lines what you want to solve.',
        errorRequired: es
          ? 'Cuéntanos qué necesitas.'
          : 'Tell us what you need.',
        errorLength: es ? 'Cuéntanos un poco más.' : 'Tell us a bit more.',
      },
      contactPreference: {
        label: es
          ? '¿Cómo prefieres que te contactemos?'
          : 'How should we contact you?',
        options: { email: es ? 'Correo' : 'Email', whatsapp: 'WhatsApp' },
      },
      whatsappCountry: {
        label: es ? 'Lada del país' : 'Country code',
        errorInvalid: es
          ? 'Elige la lada de tu país.'
          : 'Choose your country code.',
        options: [...COUNTRIES],
      },
      whatsapp: {
        label: es ? 'Número de WhatsApp' : 'WhatsApp number',
        errorRequired: es ? 'Escribe tu número.' : 'Enter your number.',
        errorDigits: es
          ? 'Deben ser entre 6 y 14 dígitos.'
          : 'Must be 6 to 14 digits.',
      },
    },
    progress: {
      1: step(1, es ? 'Tus datos' : 'Your details'),
      2: step(2, es ? 'Tu negocio' : 'Your business'),
    },
    continue: es ? 'Continuar' : 'Continue',
    back: es ? '← Atrás' : '← Back',
    privacy: {
      label: es
        ? {
            before: 'Acepto el ',
            link: 'aviso de privacidad',
            after: ' y que muush me contacte sobre mi diagnóstico.',
            href: '/es/privacidad',
          }
        : {
            before: 'I accept the ',
            link: 'privacy notice',
            after: ' and agree to be contacted by muush about my assessment.',
            href: '/en/privacy',
          },
      requiredHint: es
        ? 'Acepta el aviso de privacidad para enviar.'
        : 'Accept the privacy notice to send.',
    },
    submit: es ? 'Quiero mi diagnóstico' : 'Get my assessment',
    sending: es ? 'Enviando…' : 'Sending…',
    retry: es ? 'Intentar de nuevo' : 'Try again',
    error: {
      before: es
        ? 'El envío se interrumpió. Tus datos siguen aquí: vuelve a intentarlo o escríbenos a'
        : 'Sending was interrupted. Your details are still here: try again or write to us at',
      email: 'support@muush.dev',
      href: 'mailto:support@muush.dev',
      after: '.',
    },
    success: {
      title: es ? 'Recibimos tu solicitud.' : 'We got your request.',
      body: es
        ? 'Te respondemos en 24 horas hábiles por el medio que elegiste. Si prefieres adelantar, agenda una llamada.'
        : "We'll reply within 24 business hours through the channel you chose. If you'd like to move faster, book a call.",
      action: {
        label: es ? 'Agenda una llamada' : 'Book a call',
        href: CALL_BOOKING_URL,
      },
    },
  }
}

export const ASSESSMENT_FORM_COPY: Record<FixtureLocale, ContactFormContent> = {
  es: assessmentForm('es'),
  en: assessmentForm('en'),
}

/** A catalogue submitter: nothing reaches the network. */
export const STORY_ASSESSMENT_SUBMITTER: ContactSubmitter = {
  engage: () => undefined,
  submit: async () => ({ kind: 'success' }),
}
