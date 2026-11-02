import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The shell's copy. Since feature 43 it is Muush 1.0's: `muush-1.0.md`
 * §§ 4.1, 4.7, 4.9 and pen extract-43 § 6. Three entries are easy to "fix"
 * by mistake: "Technology Solution Studio." is drawn in English in both
 * locales, the support address has to survive the message compiler, and
 * the WhatsApp message is the locale's own.
 *
 * Read from disk, not imported: Nuxt's i18n Vite transform compiles a locale
 * JSON into a message AST, which none of these assertions could see through
 * (docs/business/rules.md § R27).
 */
interface ShellCopy {
  shell: {
    nav: { services: string; about: string; cta: string }
    footer: {
      tagline: string
      category: string
      copyright: string
      whatsappMessage: string
      contact: {
        email: string
        hints: { whatsapp: string; call: string; email: string }
      }
      muush: { work: string; blog: string; blogInline: string }
      legal: { privacy: string; terms: string }
    }
  }
}

function readLocale(name: string): ShellCopy {
  /* Built with node:path, not `new URL`: the DOM environment replaces the
     global `URL` with an implementation `fs` does not accept. */
  const file = join(process.cwd(), 'i18n', 'locales', `${name}.json`)
  return JSON.parse(readFileSync(file, 'utf8')) as ShellCopy
}

const es = readLocale('es')
const en = readLocale('en')

describe('shell copy', () => {
  it('should pre-fill the WhatsApp message in each locale', () => {
    expect(es.shell.footer.whatsappMessage).toBe(
      'Hola muush, me interesa platicar sobre un proyecto.'
    )
    expect(en.shell.footer.whatsappMessage).toBe(
      "Hi muush, I'd like to talk about a project."
    )
  })

  it('should leave the studio category untranslated in both locales', () => {
    /* Parity is satisfied by presence, not by difference. */
    expect(es.shell.footer.category).toBe('Technology Solution Studio.')
    expect(en.shell.footer.category).toBe(es.shell.footer.category)
  })

  it('should carry the approved nav copy when read', () => {
    /* `muush-1.0.md` § 4.1; Preguntas returns with feature 46. */
    expect([
      es.shell.nav.services,
      es.shell.nav.about,
      es.shell.nav.cta,
    ]).toEqual(['Servicios', 'Nosotros', 'Diagnóstico gratis'])
    expect([
      en.shell.nav.services,
      en.shell.nav.about,
      en.shell.nav.cta,
    ]).toEqual(['Services', 'About', 'Free assessment'])
  })

  it('should carry the approved footer copy when read', () => {
    /* `muush-1.0.md` §§ 4.7, 4.9; pen extract-43 § 6. */
    expect(es.shell.footer.tagline).toBe('Hablamos negocio y código.')
    expect(en.shell.footer.tagline).toBe('We speak business and code.')
    expect(es.shell.footer.muush.work).toBe('Trabaja con muush')
    expect(en.shell.footer.muush.work).toBe('Work with muush')
    expect(es.shell.footer.muush.blog).toBe('Blog · próximamente')
    expect(en.shell.footer.muush.blogInline).toBe('Blog (coming soon)')
    expect(es.shell.footer.legal).toEqual({
      privacy: 'Aviso de privacidad',
      terms: 'Términos y condiciones',
    })
    expect(en.shell.footer.copyright).toBe('© 2026 muush · All rights reserved')
  })

  it('should store the contact hints without the arrow when read', () => {
    /* The arrow is decorative and drawn by the component (data-model § 5). */
    expect(es.shell.footer.contact.hints).toEqual({
      whatsapp: 'Escríbenos',
      call: '30 minutos',
      email: 'Correo',
    })
    expect(en.shell.footer.contact.hints).toEqual({
      whatsapp: 'Message us',
      call: '30 minutes',
      email: 'Email',
    })
  })

  it('should escape the at sign of the support address for the compiler', () => {
    /* vue-i18n reads a bare `@` as the start of a linked message and refuses
       to compile the file at all. `{'@'}` is the documented literal escape
       and renders as a plain `@` (docs/business/rules.md § R26). */
    expect(es.shell.footer.contact.email).toBe("support{'@'}muush.dev")
    expect(en.shell.footer.contact.email).toBe("support{'@'}muush.dev")
  })
})
