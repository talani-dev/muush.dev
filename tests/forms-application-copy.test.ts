import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * `forms.application.*` (feature 45, data-model § 4), sibling to
 * `tests/forms-copy.test.ts`, read from disk (rules.md § R27).
 *
 * Approved copy: `docs/business/muush-1.0.md` § 4.8 and the gate decisions
 * of 2026-11-02 (Roberto): the CV limit stays the contract's 5 MiB, so both
 * CV strings say "5 MB" (Clarifications Q1); the LinkedIn placeholder is
 * "https://linkedin.com/in/…" to match the unchanged URL rule; a failed CV
 * upload keeps feature 31's message and "Enviar sin CV" (Q2).
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
  'fields.areaRole.label': ['Área y rol', 'Area and role'],
  'fields.areaRole.placeholder': [
    'Selecciona tu área y rol',
    'Select your area and role',
  ],
  'fields.areaRole.errorRequired': [
    'Elige tu área y rol.',
    'Choose your area and role.',
  ],
  'fields.portfolio.label': ['Portafolio', 'Portfolio'],
  'fields.portfolio.placeholder': ['https://', 'https://'],
  'fields.portfolio.errorFormat': [
    'Ingresa una URL válida.',
    'Enter a valid URL.',
  ],
  'fields.linkedin.label': ['LinkedIn', 'LinkedIn'],
  'fields.linkedin.placeholder': [
    'https://linkedin.com/in/…',
    'https://linkedin.com/in/…',
  ],
  'fields.linkedin.errorFormat': [
    'Ingresa una URL válida.',
    'Enter a valid URL.',
  ],
  'fields.cv.label': ['CV', 'CV'],
  'fields.cv.placeholder': [
    'Adjunta tu CV en PDF · máximo 5 MB',
    'Attach your CV as a PDF · max 5 MB',
  ],
  'fields.cv.errorFormat': [
    'Adjunta tu CV en PDF de hasta 5 MB.',
    'Attach your CV as a PDF up to 5 MB.',
  ],
  'fields.cv.errorSize': [
    'Adjunta tu CV en PDF de hasta 5 MB.',
    'Attach your CV as a PDF up to 5 MB.',
  ],
  'fields.cv.errorRequired': ['Adjunta tu CV.', 'Attach your CV.'],
  'steps.titles.1': ['Tus datos', 'Your details'],
  'steps.titles.2': ['Tu perfil', 'Your profile'],
  /* Feature 48 · split around the link to the privacy page; the sentence
     is unchanged. */
  'privacy.before': ['Acepto el ', 'I accept the '],
  'privacy.link': ['aviso de privacidad', 'privacy notice'],
  'privacy.after': [
    ' y que muush me contacte sobre mi aplicación.',
    ' and agree to be contacted by muush about my application.',
  ],
  /* Roberto 2026-11-05 · screen-reader-only after the link, which opens
     in a new tab. */
  'privacy.newTab': ['(se abre en una pestaña nueva)', '(opens in a new tab)'],
  submit: ['Enviar aplicación', 'Send application'],
  uploading: ['Subiendo CV…', 'Uploading CV…'],
  'error.before': [
    'El envío se interrumpió. Tus datos y tu CV siguen aquí: vuelve a intentarlo o escríbenos a',
    'Sending was interrupted. Your details and CV are still here: try again or write to us at',
  ],
  'error.email': [`support${AT}muush.dev`, `support${AT}muush.dev`],
  'cvUploadError.message': [
    'No pudimos subir tu CV. Inténtalo de nuevo o envía la postulación sin CV.',
    "We couldn't upload your CV. Try again or submit without a CV.",
  ],
  'cvUploadError.submitWithoutCv': ['Enviar sin CV', 'Submit without CV'],
  'success.title': ['Recibimos tu aplicación.', 'We got your application.'],
  'success.body': [
    'Revisamos tu perfil y te escribimos cuando haya un proyecto que encaje contigo.',
    "We'll review your profile and reach out when there's a project that fits you.",
  ],
  'success.action': ['Volver al inicio', 'Back to home'],
}

/** Shared wording each form keeps under its own namespace (feature 16
 * D-4), equal in both. */
const SHARED_WORDING = [
  'fields.name',
  'fields.email',
  'fields.contactPreference',
  'fields.whatsappCountry',
  'fields.whatsapp',
  'steps.progress',
  'steps.titles.1',
  'continue',
  'back',
  'privacy.requiredHint',
  'sending',
  'retry',
  'error.email',
  'error.after',
]

describe('forms copy · forms.application.* (feature 45)', () => {
  for (const [key, [esText, enText]] of Object.entries(APPROVED)) {
    it(`should carry the approved ${key} verbatim in both locales`, () => {
      expect(at(es, `forms.application.${key}`), `es ${key}`).toBe(esText)
      expect(at(en, `forms.application.${key}`), `en ${key}`).toBe(enText)
    })
  }

  it('should share the common wording with forms.contact in both locales', () => {
    for (const locale of [es, en]) {
      for (const key of SHARED_WORDING) {
        expect(at(locale, `forms.application.${key}`), key).toEqual(
          at(locale, `forms.contact.${key}`)
        )
      }
    }
  })

  it('should drop the v1 retry, error title and fallback keys', () => {
    for (const locale of [es, en]) {
      expect(
        at(locale, 'forms.application.cvUploadError.retry')
      ).toBeUndefined()
      expect(at(locale, 'forms.application.error.title')).toBeUndefined()
      expect(at(locale, 'forms.application.error.fallback')).toBeUndefined()
    }
  })

  it('should ship the six confirmed area headers verbatim, identical in both locales', () => {
    const expected = {
      it: 'IT',
      product: 'Product',
      projectManagement: 'Project management',
      sales: 'Sales',
      marketing: 'Marketing',
      creative: 'Creative',
    }
    expect(at(es, 'forms.application.fields.areaRole.areas')).toEqual(expected)
    expect(at(en, 'forms.application.fields.areaRole.areas')).toEqual(expected)
  })

  it('should ship the real per-area role catalogue unchanged, in both locales', () => {
    /* Given directly by Roberto (feature 24, 2026-09-08). */
    for (const locale of [es, en]) {
      const roles = at(
        locale,
        'forms.application.fields.areaRole.roles'
      ) as Record<string, Messages>
      expect(
        Object.fromEntries(
          Object.entries(roles).map(([area, list]) => [area, Object.keys(list)])
        )
      ).toEqual({
        it: [
          'backend',
          'frontend',
          'fullStack',
          'mobile',
          'devOps',
          'infrastructureCloud',
        ],
        product: [
          'productManager',
          'productOwner',
          'uxResearch',
          'uxUiDesign',
          'productDesign',
          'designSystems',
        ],
        projectManagement: ['projectManager'],
        sales: ['sales', 'accountManagement', 'partnerships'],
        marketing: [
          'growth',
          'performanceMedia',
          'content',
          'seo',
          'communityManagement',
        ],
        creative: ['design3d', 'graphicDesign', 'blogStorytelling'],
      })
    }
    expect(
      at(es, 'forms.application.fields.areaRole.roles.it.infrastructureCloud')
    ).toBe('Infrastructure y Cloud')
    expect(
      at(
        en,
        'forms.application.fields.areaRole.roles.marketing.performanceMedia'
      )
    ).toBe('Performance & paid media')
  })
})
