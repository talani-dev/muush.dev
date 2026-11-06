import type { ApplicationFormContent } from '@/features/forms/data/applicationFields'
import type { ContactFormContent } from '@/features/forms/data/contactFields'
import type {
  ApplicationSubmitter,
  ContactSubmitter,
} from '@/features/forms/data/submissionContract'
import { buildCountryOptions } from '@/features/forms/logic/countryOptions'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'

/**
 * Resolved v2 form copy for the catalogue and the component tests (feature
 * 45): what `useContactFormContent` / `useApplicationFormContent` hand the
 * page on `/es` and `/en`, from `i18n/locales/*.json` (approved copy,
 * `muush-1.0.md` §§ 4.6, 4.8, and the gate decisions of 2026-11-02).
 * Fixtures only; the app never imports this file.
 */
export type FixtureLocale = 'es' | 'en'

const IDENTITY = {
  es: {
    realEstate: 'Bienes raíces/inmobiliaria',
    creator: 'Creador de contenido/marca personal',
    company: 'Empresa pública o privada',
    independent: 'Emprendedor o persona física',
    startup: 'Startup',
    other: 'Otro',
  },
  en: {
    realEstate: 'Real estate',
    creator: 'Content creator/personal brand',
    company: 'Public or private company',
    independent: 'Independent or sole proprietor',
    startup: 'Startup',
    other: 'Other',
  },
} as const

const SHARED = {
  es: {
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
    contactPreference: {
      label: '¿Cómo prefieres que te contactemos?',
      options: { email: 'Correo', whatsapp: 'WhatsApp' },
    },
    whatsappCountry: {
      label: 'Lada del país',
      errorInvalid: 'Elige la lada de tu país.',
      options: buildCountryOptions('es-MX'),
    },
    whatsapp: {
      label: 'Número de WhatsApp',
      errorRequired: 'Escribe tu número.',
      errorDigits: 'Deben ser entre 6 y 14 dígitos.',
    },
  },
  en: {
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
    contactPreference: {
      label: 'How should we contact you?',
      options: { email: 'Email', whatsapp: 'WhatsApp' },
    },
    whatsappCountry: {
      label: 'Country code',
      errorInvalid: 'Choose your country code.',
      options: buildCountryOptions('en'),
    },
    whatsapp: {
      label: 'WhatsApp number',
      errorRequired: 'Enter your number.',
      errorDigits: 'Must be 6 to 14 digits.',
    },
  },
} as const

function chrome(locale: FixtureLocale, secondStep: string, about: string) {
  const es = locale === 'es'
  const step = (n: 1 | 2, title: string) =>
    es ? `Paso ${n} de 2 · ${title}` : `Step ${n} of 2 · ${title}`
  return {
    progress: {
      1: step(1, es ? 'Tus datos' : 'Your details'),
      2: step(2, secondStep),
    },
    continue: es ? 'Continuar' : 'Continue',
    back: es ? '← Atrás' : '← Back',
    privacy: {
      label: es
        ? {
            before: 'Acepto el ',
            link: 'aviso de privacidad',
            after: ` y que muush me contacte sobre ${about}.`,
            newTab: '(se abre en una pestaña nueva)',
            href: '/es/privacidad',
          }
        : {
            before: 'I accept the ',
            link: 'privacy notice',
            after: ` and agree to be contacted by muush about ${about}.`,
            newTab: '(opens in a new tab)',
            href: '/en/privacy',
          },
      requiredHint: es
        ? 'Acepta el aviso de privacidad para enviar.'
        : 'Accept the privacy notice to send.',
    },
    sending: es ? 'Enviando…' : 'Sending…',
    retry: es ? 'Intentar de nuevo' : 'Try again',
  }
}

function sendError(
  locale: FixtureLocale,
  before: Record<FixtureLocale, string>
) {
  return {
    before: before[locale],
    email: 'support@muush.dev',
    href: 'mailto:support@muush.dev',
    after: '.',
  }
}

function contact(locale: FixtureLocale): ContactFormContent {
  const es = locale === 'es'
  return {
    fields: {
      name: SHARED[locale].name,
      email: SHARED[locale].email,
      company: {
        label: es ? 'Empresa o proyecto' : 'Company or project',
        placeholder: es ? 'Nombre de la empresa' : 'Company name',
      },
      identity: {
        label: es ? '¿Cómo te identificas?' : 'You are a…',
        placeholder: es ? 'Selecciona una opción' : 'Select an option',
        errorRequired: es ? 'Elige una opción.' : 'Choose an option.',
        options: IDENTITY[locale],
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
      contactPreference: SHARED[locale].contactPreference,
      whatsappCountry: SHARED[locale].whatsappCountry,
      whatsapp: SHARED[locale].whatsapp,
    },
    ...chrome(
      locale,
      es ? 'Tu negocio' : 'Your business',
      es ? 'mi diagnóstico' : 'my assessment'
    ),
    submit: es ? 'Quiero mi diagnóstico' : 'Get my assessment',
    error: sendError(locale, {
      es: 'El envío se interrumpió. Tus datos siguen aquí: vuelve a intentarlo o escríbenos a',
      en: 'Sending was interrupted. Your details are still here: try again or write to us at',
    }),
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

const ROLES_ES = {
  it: { backend: 'Backend', frontend: 'Frontend', fullStack: 'Full stack' },
  product: { uxUiDesign: 'UX/UI design', productDesign: 'Diseño de producto' },
  projectManagement: { projectManager: 'Project manager' },
  sales: { sales: 'Ventas' },
  marketing: { growth: 'Growth', content: 'Contenido' },
  creative: { graphicDesign: 'Diseño gráfico' },
}

const AREAS = {
  it: 'IT',
  product: 'Product',
  projectManagement: 'Project management',
  sales: 'Sales',
  marketing: 'Marketing',
  creative: 'Creative',
}

function application(locale: FixtureLocale): ApplicationFormContent {
  const es = locale === 'es'
  const urlError = es ? 'Ingresa una URL válida.' : 'Enter a valid URL.'
  const cvError = es
    ? 'Adjunta tu CV en PDF de hasta 5 MB.'
    : 'Attach your CV as a PDF up to 5 MB.'
  return {
    fields: {
      name: SHARED[locale].name,
      email: SHARED[locale].email,
      areaRole: {
        label: es ? 'Área y rol' : 'Area and role',
        placeholder: es
          ? 'Selecciona tu área y rol'
          : 'Select your area and role',
        errorRequired: es
          ? 'Elige tu área y rol.'
          : 'Choose your area and role.',
        areas: AREAS,
        roles: ROLES_ES,
      },
      portfolio: {
        label: es ? 'Portafolio' : 'Portfolio',
        placeholder: 'https://',
        errorFormat: urlError,
      },
      linkedin: {
        label: 'LinkedIn',
        placeholder: 'https://linkedin.com/in/…',
        errorFormat: urlError,
      },
      cv: {
        label: 'CV',
        placeholder: es
          ? 'Adjunta tu CV en PDF · máximo 5 MB'
          : 'Attach your CV as a PDF · max 5 MB',
        errorFormat: cvError,
        errorSize: cvError,
        errorRequired: es ? 'Adjunta tu CV.' : 'Attach your CV.',
      },
      contactPreference: SHARED[locale].contactPreference,
      whatsappCountry: SHARED[locale].whatsappCountry,
      whatsapp: SHARED[locale].whatsapp,
    },
    ...chrome(
      locale,
      es ? 'Tu perfil' : 'Your profile',
      es ? 'mi aplicación' : 'my application'
    ),
    submit: es ? 'Enviar aplicación' : 'Send application',
    uploading: es ? 'Subiendo CV…' : 'Uploading CV…',
    cvUploadError: {
      message: es
        ? 'No pudimos subir tu CV. Inténtalo de nuevo o envía la postulación sin CV.'
        : "We couldn't upload your CV. Try again or submit without a CV.",
      submitWithoutCv: es ? 'Enviar sin CV' : 'Submit without CV',
    },
    error: sendError(locale, {
      es: 'El envío se interrumpió. Tus datos y tu CV siguen aquí: vuelve a intentarlo o escríbenos a',
      en: 'Sending was interrupted. Your details and CV are still here: try again or write to us at',
    }),
    success: {
      title: es ? 'Recibimos tu aplicación.' : 'We got your application.',
      body: es
        ? 'Revisamos tu perfil y te escribimos cuando haya un proyecto que encaje contigo.'
        : "We'll review your profile and reach out when there's a project that fits you.",
      action: {
        label: es ? 'Volver al inicio' : 'Back to home',
        to: `/${locale}`,
      },
    },
  }
}

export const CONTACT_FORM_COPY: Record<FixtureLocale, ContactFormContent> = {
  es: contact('es'),
  en: contact('en'),
}

export const APPLICATION_FORM_COPY: Record<
  FixtureLocale,
  ApplicationFormContent
> = { es: application('es'), en: application('en') }

/** Long enough to see "Enviando…", short enough not to bore. */
const STUB_REPLY_MS = 1_200

function later<T>(value: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), STUB_REPLY_MS))
}

/** Catalogue submitters: nothing reaches the network; a valid send
 * succeeds after a moment. */
export const STORY_CONTACT_SUBMITTER: ContactSubmitter = {
  engage: () => undefined,
  submit: () => later({ kind: 'success' }),
}

export const STORY_APPLICATION_SUBMITTER: ApplicationSubmitter = {
  engage: () => undefined,
  submit: (_values, progress) => {
    progress?.cvUploaded()
    return later({ kind: 'success' })
  },
}
