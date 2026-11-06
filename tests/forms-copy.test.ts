import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * `forms.contact.*` (feature 45, data-model § 4), asserted against the files
 * on disk — never imported, since the i18n Vite transform turns a locale
 * import into a message AST (`docs/business/rules.md` § R27).
 *
 * Approved copy: `docs/business/muush-1.0.md` § 4.6, plus the gate
 * decisions of 2026-11-02 (Roberto): the identity placeholder, the
 * screen-reader hint, field errors in the v2 wording or today's wording with
 * a period (Clarifications Q3), and the EN mobile copy of pen extract-45
 * § 8. A literal `@` is written `{'@'}` (rules.md § R26), which is what the
 * raw JSON holds.
 */
type Messages = Record<string, unknown>

function readLocale(name: string): Messages {
  const file = join(process.cwd(), 'i18n', 'locales', `${name}.json`)
  return JSON.parse(readFileSync(file, 'utf8'))
}

function at(tree: Messages, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (node, segment) => (node as Messages | undefined)?.[segment],
      tree
    )
}

const es = readLocale('es')
const en = readLocale('en')
const AT = "{'@'}"

const APPROVED: Record<string, [string, string]> = {
  'fields.name.label': ['Nombre', 'Name'],
  'fields.name.placeholder': ['Nombre y apellido', 'First and last name'],
  'fields.name.errorRequired': ['Escribe tu nombre.', 'Enter your name.'],
  'fields.email.label': ['Correo', 'Email'],
  'fields.email.placeholder': [`tu${AT}correo.com`, `you${AT}email.com`],
  'fields.email.errorRequired': [
    `Escribe un correo como nombre${AT}empresa.com`,
    `Enter an email like name${AT}company.com`,
  ],
  'fields.email.errorFormat': [
    `Escribe un correo como nombre${AT}empresa.com`,
    `Enter an email like name${AT}company.com`,
  ],
  'fields.company.label': ['Empresa o proyecto', 'Company or project'],
  'fields.company.placeholder': ['Nombre de la empresa', 'Company name'],
  'fields.identity.label': ['¿Cómo te identificas?', 'You are a…'],
  'fields.identity.placeholder': ['Selecciona una opción', 'Select an option'],
  'fields.identity.errorRequired': ['Elige una opción.', 'Choose an option.'],
  'fields.need.label': ['¿Qué necesitas?', 'What do you need?'],
  'fields.need.placeholder': [
    'Cuéntanos en un par de líneas qué quieres resolver.',
    'Tell us in a couple of lines what you want to solve.',
  ],
  'fields.need.errorRequired': [
    'Cuéntanos qué necesitas.',
    'Tell us what you need.',
  ],
  'fields.need.errorLength': ['Cuéntanos un poco más.', 'Tell us a bit more.'],
  'fields.contactPreference.label': [
    '¿Cómo prefieres que te contactemos?',
    'How should we contact you?',
  ],
  'steps.progress': [
    'Paso {n} de {total} · {title}',
    'Step {n} of {total} · {title}',
  ],
  'steps.titles.1': ['Tus datos', 'Your details'],
  'steps.titles.2': ['Tu negocio', 'Your business'],
  continue: ['Continuar', 'Continue'],
  back: ['← Atrás', '← Back'],
  /* Feature 48 · split around the link to the privacy page; the sentence
     is unchanged. */
  'privacy.before': ['Acepto el ', 'I accept the '],
  'privacy.link': ['aviso de privacidad', 'privacy notice'],
  'privacy.after': [
    ' y que muush me contacte sobre mi diagnóstico.',
    ' and agree to be contacted by muush about my assessment.',
  ],
  /* Roberto 2026-11-05 · screen-reader-only after the link, which opens
     in a new tab. */
  'privacy.newTab': ['(se abre en una pestaña nueva)', '(opens in a new tab)'],
  'privacy.requiredHint': [
    'Acepta el aviso de privacidad para enviar.',
    'Accept the privacy notice to send.',
  ],
  submit: ['Quiero mi diagnóstico', 'Get my assessment'],
  sending: ['Enviando…', 'Sending…'],
  retry: ['Intentar de nuevo', 'Try again'],
  'error.before': [
    'El envío se interrumpió. Tus datos siguen aquí: vuelve a intentarlo o escríbenos a',
    'Sending was interrupted. Your details are still here: try again or write to us at',
  ],
  'error.email': [`support${AT}muush.dev`, `support${AT}muush.dev`],
  'error.after': ['.', '.'],
  'success.title': ['Recibimos tu solicitud.', 'We got your request.'],
  'success.body': [
    'Te respondemos en 24 horas hábiles por el medio que elegiste. Si prefieres adelantar, agenda una llamada.',
    "We'll reply within 24 business hours through the channel you chose. If you'd like to move faster, book a call.",
  ],
  'success.action': ['Agenda una llamada', 'Book a call'],
}

describe('forms copy · forms.contact.* (feature 45)', () => {
  for (const [key, [esText, enText]] of Object.entries(APPROVED)) {
    it(`should carry the approved ${key} verbatim in both locales`, () => {
      expect(at(es, `forms.contact.${key}`), `es ${key}`).toBe(esText)
      expect(at(en, `forms.contact.${key}`), `en ${key}`).toBe(enText)
    })
  }

  it('should ship the six real identity options verbatim, in order, per locale', () => {
    /* Given directly by Roberto (feature 24, 2026-09-08); unchanged by the
       v2 design (feature 45). */
    expect(at(es, 'forms.contact.fields.identity.options')).toEqual({
      realEstate: 'Bienes raíces/inmobiliaria',
      creator: 'Creador de contenido/marca personal',
      company: 'Empresa pública o privada',
      independent: 'Emprendedor o persona física',
      startup: 'Startup',
      other: 'Otro',
    })
    expect(at(en, 'forms.contact.fields.identity.options')).toEqual({
      realEstate: 'Real estate',
      creator: 'Content creator/personal brand',
      company: 'Public or private company',
      independent: 'Independent or sole proprietor',
      startup: 'Startup',
      other: 'Other',
    })
  })

  it('should default the contact preference options to Correo/Email and WhatsApp', () => {
    expect(at(es, 'forms.contact.fields.contactPreference.options')).toEqual({
      email: 'Correo',
      whatsapp: 'WhatsApp',
    })
    expect(at(en, 'forms.contact.fields.contactPreference.options')).toEqual({
      email: 'Email',
      whatsapp: 'WhatsApp',
    })
  })

  it('should keep the feature 32 WhatsApp copy, its errors ending in a period', () => {
    /* Approved at the feature 32 gate; a period added by Clarifications Q3.
       The 6–14 digit range is the feature 32 backend agreement. */
    expect(at(es, 'forms.contact.fields.whatsappCountry')).toEqual({
      label: 'Lada del país',
      errorInvalid: 'Elige la lada de tu país.',
    })
    expect(at(en, 'forms.contact.fields.whatsappCountry')).toEqual({
      label: 'Country code',
      errorInvalid: 'Choose your country code.',
    })
    expect(at(es, 'forms.contact.fields.whatsapp')).toEqual({
      label: 'Número de WhatsApp',
      errorRequired: 'Escribe tu número.',
      errorDigits: 'Deben ser entre 6 y 14 dígitos.',
    })
    expect(at(en, 'forms.contact.fields.whatsapp')).toEqual({
      label: 'WhatsApp number',
      errorRequired: 'Enter your number.',
      errorDigits: 'Must be 6 to 14 digits.',
    })
  })

  it('should carry no website field and no v1 key when the locales are read', () => {
    for (const locale of [es, en]) {
      const fields = at(locale, 'forms.contact.fields') as Messages
      expect(Object.keys(fields)).not.toContain('website')
      expect(at(locale, 'forms.contact.success.channel')).toBeUndefined()
      expect(at(locale, 'forms.contact.error.title')).toBeUndefined()
      expect(at(locale, 'forms.contact.error.fallback')).toBeUndefined()
    }
  })

  it('should never hold a bare @ in any forms string', () => {
    /* rules.md § R26: a bare `@` breaks vue-i18n's compiler. */
    for (const locale of [es, en]) {
      const raw = JSON.stringify(at(locale, 'forms'))
      expect(raw.replaceAll(AT, '')).not.toContain('@')
    }
  })
})
