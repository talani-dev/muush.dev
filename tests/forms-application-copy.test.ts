import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * `forms.application.*`, sibling to `tests/forms-copy.test.ts`
 * (`forms.contact.*`). Asserted against the files on disk — never imported,
 * since Nuxt's i18n Vite transform compiles a locale JSON into a message AST
 * on import, and an AST node is never the empty string
 * (`docs/business/rules.md` § R27).
 *
 * The six area labels are checked verbatim against `ui-map.md` § 9; the
 * success copy against the same source. The per-area role list is checked
 * verbatim against the real catalogue Roberto gave directly (feature 24,
 * 2026-09-08), which replaced the previous `⚠️ UNVERIFIED placeholder —
 * owner Clau` this test used to only check the shape of.
 */
interface AreaRoleFieldCopy {
  label: string
  placeholder: string
  errorRequired: string
  areas: Record<
    'it' | 'product' | 'projectManagement' | 'sales' | 'marketing' | 'creative',
    string
  >
  roles: Record<string, Record<string, string>>
}

interface ApplicationFormsCopy {
  fields: {
    name: { label: string; errorRequired: string }
    email: { label: string; errorRequired: string; errorFormat: string }
    areaRole: AreaRoleFieldCopy
    portfolio: { label: string; placeholder: string; errorFormat: string }
    linkedin: { label: string; placeholder: string; errorFormat: string }
    cv: {
      label: string
      placeholder: string
      errorFormat: string
      errorSize: string
      errorRequired: string
    }
    contactPreference: {
      label: string
      options: Record<'email' | 'whatsapp', string>
    }
    whatsapp: { label: string; errorRequired: string; errorDigits: string }
  }
  submit: string
  sending: string
  success: { title: string }
  error: { title: string; fallback: string }
}

function readLocale(name: string): {
  forms: { application: ApplicationFormsCopy }
} {
  const file = join(process.cwd(), 'i18n', 'locales', `${name}.json`)
  return JSON.parse(readFileSync(file, 'utf8'))
}

const es = readLocale('es')
const en = readLocale('en')

describe('forms copy · forms.application.*', () => {
  it('should hold every field label and error message in both locales', () => {
    for (const locale of [es, en]) {
      const { fields } = locale.forms.application
      expect(fields.name.label).not.toBe('')
      expect(fields.name.errorRequired).not.toBe('')
      expect(fields.email.errorFormat).not.toBe('')
      expect(fields.areaRole.errorRequired).not.toBe('')
      expect(fields.portfolio.errorFormat).not.toBe('')
      expect(fields.linkedin.errorFormat).not.toBe('')
      expect(fields.cv.errorFormat).not.toBe('')
      expect(fields.cv.errorSize).not.toBe('')
      expect(fields.contactPreference.label).not.toBe('')
      expect(fields.whatsapp.errorDigits).not.toBe('')
    }
  })

  it('should ship the six confirmed area headers verbatim, identical in both locales', () => {
    /* ui-map.md § 9: "Áreas: IT · Product · Project management · Sales ·
       Marketing · Creative" — the design documents these in English and
       does not translate them, the same treatment `landing.hero.eyebrow`
       gets. */
    const expected = [
      'IT',
      'Product',
      'Project management',
      'Sales',
      'Marketing',
      'Creative',
    ]

    expect(Object.values(es.forms.application.fields.areaRole.areas)).toEqual(
      expected
    )
    expect(Object.values(en.forms.application.fields.areaRole.areas)).toEqual(
      expected
    )
  })

  it('should ship the real per-area role catalogue verbatim, in both locales', () => {
    /* Given directly by Roberto (feature 24, 2026-09-08). Role ids, and
       therefore area membership, are asserted first — the labels are
       asserted per locale below. `infrastructureCloud` and
       `performanceMedia` are each ONE combined role, never split. */
    for (const locale of [es, en]) {
      const { roles } = locale.forms.application.fields.areaRole

      expect(Object.keys(roles)).toEqual([
        'it',
        'product',
        'projectManagement',
        'sales',
        'marketing',
        'creative',
      ])
      expect(Object.keys(roles.it)).toEqual([
        'backend',
        'frontend',
        'fullStack',
        'mobile',
        'devOps',
        'infrastructureCloud',
      ])
      expect(Object.keys(roles.product)).toEqual([
        'productManager',
        'productOwner',
        'uxResearch',
        'uxUiDesign',
        'productDesign',
        'designSystems',
      ])
      expect(Object.keys(roles.projectManagement)).toEqual(['projectManager'])
      expect(Object.keys(roles.sales)).toEqual([
        'sales',
        'accountManagement',
        'partnerships',
      ])
      expect(Object.keys(roles.marketing)).toEqual([
        'growth',
        'performanceMedia',
        'content',
        'seo',
        'communityManagement',
      ])
      expect(Object.keys(roles.creative)).toEqual([
        'design3d',
        'graphicDesign',
        'blogStorytelling',
      ])
    }

    expect(es.forms.application.fields.areaRole.roles.it).toEqual({
      backend: 'Backend',
      frontend: 'Frontend',
      fullStack: 'Full stack',
      mobile: 'Mobile',
      devOps: 'DevOps',
      infrastructureCloud: 'Infrastructure y Cloud',
    })
    expect(es.forms.application.fields.areaRole.roles.marketing).toEqual({
      growth: 'Growth',
      performanceMedia: 'Performance y pauta',
      content: 'Contenido',
      seo: 'SEO',
      communityManagement: 'Community management',
    })

    expect(en.forms.application.fields.areaRole.roles.it).toEqual({
      backend: 'Backend',
      frontend: 'Frontend',
      fullStack: 'Full stack',
      mobile: 'Mobile',
      devOps: 'DevOps',
      infrastructureCloud: 'Infrastructure & Cloud',
    })
    expect(en.forms.application.fields.areaRole.roles.marketing).toEqual({
      growth: 'Growth',
      performanceMedia: 'Performance & paid media',
      content: 'Content',
      seo: 'SEO',
      communityManagement: 'Community management',
    })
  })

  it('should default the contact preference options to Correo/Email and WhatsApp', () => {
    expect(es.forms.application.fields.contactPreference.options).toEqual({
      email: 'Correo',
      whatsapp: 'WhatsApp',
    })
    expect(en.forms.application.fields.contactPreference.options).toEqual({
      email: 'Email',
      whatsapp: 'WhatsApp',
    })
  })

  it('should carry the success copy verbatim in each locale, unreachable or not', () => {
    /* `ui-map.md` § 9, verbatim. */
    expect(es.forms.application.success.title).toBe(
      'Gracias, ya tenemos tu perfil. Te escribimos cuando haya un proyecto donde encajes.'
    )
    expect(en.forms.application.success.title).toBe(
      "Thanks, we've got your profile. We'll reach out when there's a project that fits."
    )
  })

  it('should escape the literal "@" in the error fallback the same way forms.contact does', () => {
    /* `rules.md` § R26: a literal `@` breaks vue-i18n's compiler unless
       escaped. */
    expect(es.forms.application.error.fallback).toBe("support{'@'}muush.dev")
    expect(en.forms.application.error.fallback).toBe("support{'@'}muush.dev")
  })

  it('should translate every field label and error message between locales', () => {
    const esFields = es.forms.application.fields
    const enFields = en.forms.application.fields

    expect(enFields.name.label).not.toBe(esFields.name.label)
    expect(enFields.whatsapp.errorDigits).not.toBe(
      esFields.whatsapp.errorDigits
    )
    expect(en.forms.application.submit).not.toBe(es.forms.application.submit)
  })

  it('should reuse the exact WhatsApp digit-count copy forms.contact already ships', () => {
    /* Assumption (spec.md): the WhatsApp number's validation rule is reused
       by symmetry from `forms.contact` — the copy is reused the same way. */
    const contactWhatsapp = (locale: typeof es) =>
      (
        locale as unknown as {
          forms: { contact: { fields: { whatsapp: { errorDigits: string } } } }
        }
      ).forms.contact.fields.whatsapp.errorDigits

    expect(es.forms.application.fields.whatsapp.errorDigits).toBe(
      contactWhatsapp(es)
    )
    expect(en.forms.application.fields.whatsapp.errorDigits).toBe(
      contactWhatsapp(en)
    )
  })
})
