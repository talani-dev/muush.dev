import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * `forms.contact.*`, asserted against the files on disk — never imported,
 * since Nuxt's i18n Vite transform compiles a locale JSON into a message AST
 * on import, and an AST node is never the empty string
 * (`docs/business/rules.md` § R27).
 *
 * The five identity options are checked verbatim against `content.md`; the
 * success/error copy against `ui-map.md` § 7 — both approved copy that ships
 * today even though the two states it belongs to are unreachable from the
 * live page (spec FR-016).
 */
interface ContactFormsCopy {
  fields: {
    name: { label: string; errorRequired: string }
    email: { label: string; errorRequired: string; errorFormat: string }
    company: { label: string }
    identity: {
      label: string
      errorRequired: string
      options: Record<
        'company' | 'independent' | 'startup' | 'creator' | 'other',
        string
      >
    }
    need: { label: string; errorRequired: string; errorLength: string }
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

interface LandingContactCopy {
  eyebrow: string
  heading: string
  body: string
  ctaSecondary: string
}

function readLocale(name: string): {
  forms: { contact: ContactFormsCopy }
  landing: { contact: LandingContactCopy; hero: { ctaSecondary: string } }
} {
  const file = join(process.cwd(), 'i18n', 'locales', `${name}.json`)
  return JSON.parse(readFileSync(file, 'utf8'))
}

const es = readLocale('es')
const en = readLocale('en')

describe('forms copy · forms.contact.*', () => {
  it('should hold every field label and error message in both locales', () => {
    for (const locale of [es, en]) {
      const { fields } = locale.forms.contact
      expect(fields.name.label).not.toBe('')
      expect(fields.name.errorRequired).not.toBe('')
      expect(fields.email.errorFormat).not.toBe('')
      expect(fields.company.label).not.toBe('')
      expect(fields.identity.errorRequired).not.toBe('')
      expect(fields.need.errorLength).not.toBe('')
      expect(fields.contactPreference.label).not.toBe('')
      expect(fields.whatsapp.errorDigits).not.toBe('')
    }
  })

  it('should ship the five approved identity options verbatim per locale', () => {
    /* content.md: the .pen's sixth option ("Restaurante o bar") is not
       approved copy and MUST NOT appear (spec A-02, FR-007). */
    expect(Object.values(es.forms.contact.fields.identity.options)).toEqual([
      'Empresa',
      'Emprendedor o persona física',
      'Startup',
      'Creador de contenido o marca personal',
      'Otro',
    ])
    expect(Object.values(en.forms.contact.fields.identity.options)).toEqual([
      'Company',
      'Independent or sole proprietor',
      'Startup',
      'Creator or personal brand',
      'Other',
    ])
    for (const locale of [es, en]) {
      const values = Object.values(locale.forms.contact.fields.identity.options)
      expect(values).toHaveLength(5)
      expect(values.some(option => /restaurante|bar/i.test(option))).toBe(false)
    }
  })

  it('should default the contact preference options to Correo/Email and WhatsApp', () => {
    expect(es.forms.contact.fields.contactPreference.options).toEqual({
      email: 'Correo',
      whatsapp: 'WhatsApp',
    })
    expect(en.forms.contact.fields.contactPreference.options).toEqual({
      email: 'Email',
      whatsapp: 'WhatsApp',
    })
  })

  it('should carry the success and error copy verbatim in each locale, unreachable or not', () => {
    /* `ui-map.md` § 7, verbatim. The `@` renders correctly at runtime via the
       `{'@'}` escape (`rules.md` § R26) — this file reads the raw JSON, so
       the literal escape sequence is what the fixture below matches. */
    expect(es.forms.contact.success.title).toBe(
      'Listo, ya lo recibimos. Te respondemos por [correo/WhatsApp] en menos de 24 horas hábiles.'
    )
    expect(en.forms.contact.success.title).toBe(
      "Got it. We'll get back to you by [email/WhatsApp] within one business day."
    )
    expect(es.forms.contact.error.title).toContain('No pudimos enviarlo.')
    expect(es.forms.contact.error.fallback).toBe("support{'@'}muush.dev")
    expect(en.forms.contact.error.fallback).toBe("support{'@'}muush.dev")
  })

  it('should translate every field label and error message between locales', () => {
    const esFields = es.forms.contact.fields
    const enFields = en.forms.contact.fields

    expect(enFields.name.label).not.toBe(esFields.name.label)
    expect(enFields.whatsapp.errorDigits).not.toBe(
      esFields.whatsapp.errorDigits
    )
    expect(en.forms.contact.submit).not.toBe(es.forms.contact.submit)
  })
})

describe('landing copy · CTA final left block', () => {
  it('should hold the four keys, non-empty, in both locales', () => {
    for (const locale of [es, en]) {
      expect(locale.landing.contact.eyebrow).not.toBe('')
      expect(locale.landing.contact.heading).not.toBe('')
      expect(locale.landing.contact.body).not.toBe('')
      expect(locale.landing.contact.ctaSecondary).not.toBe('')
    }
  })

  it('should reuse the Hero"s own approved secondary CTA string, per locale', () => {
    /* Intentional duplication (data-model.md § 6, same precedent
       `specs/013-purpose-section/spec.md` set for `what.copy`/`hero.subhead`):
       both are approved copy for the same button in two places. */
    expect(es.landing.contact.ctaSecondary).toBe(es.landing.hero.ctaSecondary)
    expect(en.landing.contact.ctaSecondary).toBe(en.landing.hero.ctaSecondary)
  })

  it('should translate the placeholder heading and body between locales', () => {
    expect(en.landing.contact.heading).not.toBe(es.landing.contact.heading)
    expect(en.landing.contact.body).not.toBe(es.landing.contact.body)
  })
})
