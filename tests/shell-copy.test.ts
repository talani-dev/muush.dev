import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The shell's copy is fixed by `design-extract.md` § 9.bis and
 * `ui-map.md` § 8, and three of its entries are easy to "fix" by mistake:
 * `Work with muush` and `FAQ` are proper nouns carrying the same value in
 * both locales, the blog item keeps its separator inside the string, and the
 * support address has to survive the message compiler.
 *
 * Read from disk, not imported: Nuxt's i18n Vite transform compiles a locale
 * JSON into a message AST, which none of these assertions could see through
 * (docs/business/rules.md § R27).
 */
interface ShellCopy {
  shell: {
    footer: {
      category: string
      whatsappMessage: string
      contact: { email: string }
      muush: { work: string; faq: string; blog: string }
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

  it('should leave the proper nouns untranslated in both locales', () => {
    /* Parity is satisfied by presence, not by difference. */
    expect(en.shell.footer.muush.work).toBe(es.shell.footer.muush.work)
    expect(en.shell.footer.muush.faq).toBe(es.shell.footer.muush.faq)
    expect(en.shell.footer.category).toBe(es.shell.footer.category)
  })

  it('should keep the separator inside the blog item in both locales', () => {
    expect(es.shell.footer.muush.blog).toBe('Blog · próximamente')
    expect(en.shell.footer.muush.blog).toBe('Blog · coming soon')
  })

  it('should escape the at sign of the support address for the compiler', () => {
    /* vue-i18n reads a bare `@` as the start of a linked message and refuses
       to compile the file at all. `{'@'}` is the documented literal escape
       and renders as a plain `@` (docs/business/rules.md § R26). */
    expect(es.shell.footer.contact.email).toBe("support{'@'}muush.dev")
    expect(en.shell.footer.contact.email).toBe("support{'@'}muush.dev")
  })
})
