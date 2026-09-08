import { describe, expect, it } from 'vitest'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { FOOTER_COLUMNS, SUPPORT_EMAIL, WHATSAPP_URL } from './footerColumns'
import type { ShellDestination, ShellItem } from './types'

const everyItem: ShellItem[] = FOOTER_COLUMNS.flatMap(column => column.items)

function itemFor(labelKey: string): ShellItem {
  const item = everyItem.find(candidate => candidate.labelKey === labelKey)
  if (!item) throw new Error(`No footer item for ${labelKey}`)
  return item
}

function hasRealDestination(destination: ShellDestination): boolean {
  switch (destination.kind) {
    case 'none':
      return false
    case 'external':
      return destination.href.length > 0
    default:
      return true
  }
}

/**
 * The audit `ui-map.md` § 8 asks for. A link to a page that does not exist is
 * "un 404 en el footer de **todas** las páginas del sitio", so every item has
 * to carry a real destination.
 *
 * Feature 23 (2026-09-08) removed the three items that used to fail that
 * audit for a different reason — `Proyectos`, `FAQ` and `Blog · próximamente`
 * — entirely, rather than leaving them inert. `kind: 'none'` no longer
 * appears anywhere in `FOOTER_COLUMNS`.
 */
describe('footer columns', () => {
  it('should carry exactly four columns in the order the design fixes', () => {
    expect(FOOTER_COLUMNS.map(column => column.titleKey)).toEqual([
      'shell.footer.nav.title',
      'shell.footer.contact.title',
      'shell.footer.muush.title',
      'shell.footer.social.title',
    ])
  })

  it('should order Navegación as decisions-open.md D4 settled it, minus Proyectos', () => {
    /* `ui-map.md` § 8 lists Servicios first; D4 superseded it. Feature 23
       removes `Proyectos` entirely (Roberto, 2026-09-08) — same class of
       decision as dropping it from the main nav in feature 21. */
    expect(FOOTER_COLUMNS[0]?.items.map(item => item.labelKey)).toEqual([
      'shell.footer.nav.purpose',
      'shell.footer.nav.services',
      'shell.footer.nav.about',
    ])
  })

  it('should give every item a real destination', () => {
    const undecided = everyItem.filter(
      item => !hasRealDestination(item.destination)
    )

    expect(undecided).toEqual([])
  })

  it('should carry no item in the inert "none" state anymore', () => {
    /* Feature 23: `Proyectos`, `FAQ` and `Blog · próximamente` are gone
       entirely rather than rendered as inert text (Roberto, 2026-09-08). */
    const withoutDestination = everyItem.filter(
      item => item.destination.kind === 'none'
    )

    expect(withoutDestination).toEqual([])
  })

  it('should point the call booking at the shared booking URL now that #2 is resolved', () => {
    /* The guard against a silent return to the inert branch. `external` is
       what earns it the new tab and the severed opener that
       `decisions-open.md` § Decisión 2 asks for; `kind: 'none'` here would
       put the phrase back to grey text with no test noticing otherwise. */
    expect(itemFor('shell.footer.contact.call').destination).toEqual({
      kind: 'external',
      href: CALL_BOOKING_URL,
    })
  })

  it('should carry only Work with muush in the muush column', () => {
    /* FAQ and `Blog · próximamente` removed entirely (feature 23) — not left
       inert, not present at all. */
    expect(FOOTER_COLUMNS[2]?.items.map(item => item.labelKey)).toEqual([
      'shell.footer.muush.work',
    ])
  })

  it('should address the email item at the support mailbox', () => {
    expect(itemFor('shell.footer.contact.email').destination).toEqual({
      kind: 'external',
      href: `mailto:${SUPPORT_EMAIL}`,
    })
  })

  it('should carry a pre-filled message on the WhatsApp destination', () => {
    expect(itemFor('shell.footer.contact.whatsapp').destination).toEqual({
      kind: 'external',
      href: WHATSAPP_URL,
      messageKey: 'shell.footer.whatsappMessage',
    })
  })

  it('should attach a pre-filled message to no other destination', () => {
    /* The key lives inside the `external` variant, so the combination cannot
       be written for a route, an anchor or an item with no destination. */
    const withMessage = everyItem.filter(
      item =>
        item.destination.kind === 'external' &&
        item.destination.messageKey !== undefined
    )

    expect(withMessage.map(item => item.labelKey)).toEqual([
      'shell.footer.contact.whatsapp',
    ])
  })

  it('should point every social item at a public profile URL', () => {
    const socials = FOOTER_COLUMNS[3]?.items ?? []

    expect(socials).toHaveLength(3)
    for (const item of socials) {
      expect(item.destination.kind).toBe('external')
      if (item.destination.kind !== 'external') continue
      expect(item.destination.href).toMatch(/^https:\/\//)
    }
  })

  it('should never point a shell anchor at a bare fragment', () => {
    /* A bare `#proyectos` does nothing on the About page, where the footer
       also renders (spec FR-041). */
    const anchors = everyItem.filter(item => item.destination.kind === 'anchor')

    expect(anchors.length).toBeGreaterThan(0)
    for (const item of anchors) {
      if (item.destination.kind !== 'anchor') continue
      expect(item.destination.name).toBeTruthy()
      expect(item.destination.hash.startsWith('#')).toBe(true)
    }
  })
})
