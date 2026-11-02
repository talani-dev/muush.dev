import { describe, expect, it } from 'vitest'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import { FOOTER_COLUMNS, SUPPORT_EMAIL, WHATSAPP_URL } from './footerColumns'
import type { ShellItem } from './types'

const everyItem: ShellItem[] = FOOTER_COLUMNS.flatMap(column => column.items)

function itemFor(labelKey: string): ShellItem {
  const item = everyItem.find(candidate => candidate.labelKey === labelKey)
  if (!item) throw new Error(`No footer item for ${labelKey}`)
  return item
}

function keysOf(index: number): string[] {
  return FOOTER_COLUMNS[index]?.items.map(item => item.labelKey) ?? []
}

/** Feature 43 · data-model § 4, spec FR-031, FR-034; pen extract-43 § 6. */
describe('footer columns', () => {
  it('should carry exactly four columns in the order the design fixes when read', () => {
    expect(FOOTER_COLUMNS.map(column => column.titleKey)).toEqual([
      'shell.footer.nav.title',
      'shell.footer.contact.title',
      'shell.footer.muush.title',
      'shell.footer.social.title',
    ])
  })

  it('should list Inicio, Servicios, Cómo trabajamos, Nosotros in Navegación when read', () => {
    expect(keysOf(0)).toEqual([
      'shell.footer.nav.home',
      'shell.footer.nav.services',
      'shell.footer.nav.howWeWork',
      'shell.footer.nav.about',
    ])
  })

  it('should point Inicio at the top of the home page (Roberto 2026-11-01)', () => {
    expect(FOOTER_COLUMNS[0]?.items[0]?.destination).toEqual({
      kind: 'top',
      name: 'index',
    })
  })

  it('should list the four contact entries in Contacto when read', () => {
    expect(keysOf(1)).toEqual([
      'shell.footer.contact.assessment',
      'shell.footer.contact.call',
      'shell.footer.contact.email',
      'shell.footer.contact.whatsapp',
    ])
  })

  it('should list Trabaja con muush then the blog in MUUSH when Preguntas has no route yet', () => {
    expect(keysOf(2)).toEqual([
      'shell.footer.muush.work',
      'shell.footer.muush.blog',
    ])
  })

  it('should leave only the blog without a destination when read', () => {
    const inert = everyItem.filter(item => item.destination.kind === 'none')

    expect(inert.map(item => item.labelKey)).toEqual([
      'shell.footer.muush.blog',
    ])
  })

  it('should point the section entries at their declared anchors when read', () => {
    expect(itemFor('shell.footer.nav.services').destination).toEqual({
      kind: 'anchor',
      name: 'index',
      anchor: SECTION_ANCHORS.services,
    })
    expect(itemFor('shell.footer.nav.howWeWork').destination).toEqual({
      kind: 'anchor',
      name: 'index',
      anchor: SECTION_ANCHORS.howWeWork,
    })
    expect(itemFor('shell.footer.contact.assessment').destination).toEqual({
      kind: 'anchor',
      name: 'index',
      anchor: SECTION_ANCHORS.assessment,
    })
    expect(itemFor('shell.footer.muush.work').destination).toEqual({
      kind: 'anchor',
      name: 'about',
      anchor: SECTION_ANCHORS.workWithUs,
    })
  })

  it('should point the call booking at the shared booking URL when read', () => {
    expect(itemFor('shell.footer.contact.call').destination).toEqual({
      kind: 'external',
      href: CALL_BOOKING_URL,
    })
  })

  it('should address the email item at the support mailbox when read', () => {
    expect(itemFor('shell.footer.contact.email').destination).toEqual({
      kind: 'external',
      href: `mailto:${SUPPORT_EMAIL}`,
    })
  })

  it('should carry a pre-filled message on the WhatsApp destination only when read', () => {
    expect(itemFor('shell.footer.contact.whatsapp').destination).toEqual({
      kind: 'external',
      href: WHATSAPP_URL,
      messageKey: 'shell.footer.whatsappMessage',
    })
    const withMessage = everyItem.filter(
      item =>
        item.destination.kind === 'external' &&
        item.destination.messageKey !== undefined
    )
    expect(withMessage.map(item => item.labelKey)).toEqual([
      'shell.footer.contact.whatsapp',
    ])
  })

  it('should point every social item at a public profile URL when read', () => {
    const socials = FOOTER_COLUMNS[3]?.items ?? []

    expect(socials).toHaveLength(3)
    for (const item of socials) {
      expect(item.destination.kind).toBe('external')
      if (item.destination.kind !== 'external') continue
      expect(item.destination.href).toMatch(/^https:\/\//)
    }
  })
})
