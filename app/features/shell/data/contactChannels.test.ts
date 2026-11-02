import { describe, expect, it } from 'vitest'
import {
  LEGAL_ITEMS,
  MOBILE_CONTACT_CHANNELS,
  MOBILE_FOOTER_LINKS,
} from './contactChannels'
import { FOOTER_COLUMNS } from './footerColumns'

/** Feature 43 · data-model § 4, spec FR-032, FR-033; pen extract-43 § 6. */
describe('mobile footer models', () => {
  it('should put WhatsApp, the call and the email first, in that order, when read', () => {
    expect(
      MOBILE_CONTACT_CHANNELS.map(channel => [
        channel.labelKey,
        channel.hintKey,
      ])
    ).toEqual([
      ['shell.footer.contact.whatsapp', 'shell.footer.contact.hints.whatsapp'],
      ['shell.footer.contact.call', 'shell.footer.contact.hints.call'],
      ['shell.footer.contact.email', 'shell.footer.contact.hints.email'],
    ])
  })

  it('should share each contact destination with the desktop columns when read', () => {
    const desktop = FOOTER_COLUMNS[1]?.items ?? []

    for (const channel of MOBILE_CONTACT_CHANNELS) {
      const twin = desktop.find(item => item.labelKey === channel.labelKey)
      expect(twin?.destination, channel.labelKey).toEqual(channel.destination)
    }
  })

  it('should list the one-line links in the designed order, Home first, when read', () => {
    expect(MOBILE_FOOTER_LINKS.map(item => item.labelKey)).toEqual([
      'shell.footer.nav.home',
      'shell.footer.nav.services',
      'shell.footer.nav.howWeWork',
      'shell.footer.nav.about',
      'shell.footer.muush.work',
      'shell.footer.muush.blogInline',
    ])
  })

  it('should point the Home link at the top of the home page (Roberto 2026-11-01)', () => {
    expect(MOBILE_FOOTER_LINKS[0]?.destination).toEqual({
      kind: 'top',
      name: 'index',
    })
  })

  it('should give the blog, privacy and terms no destination when their pages do not exist', () => {
    const blog = MOBILE_FOOTER_LINKS.at(-1)

    expect(blog?.destination).toEqual({ kind: 'none' })
    expect(LEGAL_ITEMS).toEqual([
      { labelKey: 'shell.footer.legal.privacy', destination: { kind: 'none' } },
      { labelKey: 'shell.footer.legal.terms', destination: { kind: 'none' } },
    ])
  })
})
