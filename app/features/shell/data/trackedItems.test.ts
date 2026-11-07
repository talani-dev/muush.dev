import { describe, expect, it } from 'vitest'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import {
  LEGAL_ITEMS,
  MOBILE_CONTACT_CHANNELS,
  MOBILE_FOOTER_LINKS,
} from './contactChannels'
import { FAQ_PRIMARY, FAQ_SECONDARY } from './faq'
import { FOOTER_COLUMNS, WHATSAPP_URL } from './footerColumns'
import { MENU_ITEMS, NAV_CTA, NAV_ITEMS } from './navigation'
import { NOT_FOUND_ASSESSMENT, NOT_FOUND_HOME } from './notFound'
import type { ShellItem } from './types'

/**
 * Feature 49 · every shell CTA carries its click event, and nothing else
 * does (task T033). The expected event follows from the destination alone:
 * the diagnóstico anchor, the call-booking page, WhatsApp, the mailbox.
 */
function expectedEvent(item: ShellItem): string | undefined {
  const { destination } = item
  if (
    destination.kind === 'anchor' &&
    destination.anchor === SECTION_ANCHORS.assessment
  ) {
    return 'assessment_cta_click'
  }
  if (destination.kind !== 'external') return undefined
  if (destination.href === CALL_BOOKING_URL) return 'book_call_click'
  if (destination.href === WHATSAPP_URL) return 'contact_click'
  if (destination.href.startsWith('mailto:')) return 'contact_click'
  return undefined
}

const PLACES: [string, ShellItem[], string][] = [
  ['nav', [NAV_CTA, ...NAV_ITEMS, ...MENU_ITEMS], 'nav'],
  [
    'footer',
    [
      ...FOOTER_COLUMNS.flatMap(column => column.items),
      ...MOBILE_CONTACT_CHANNELS,
      ...MOBILE_FOOTER_LINKS,
      ...LEGAL_ITEMS,
    ],
    'footer',
  ],
  ['faq', [FAQ_PRIMARY, FAQ_SECONDARY], 'faq'],
  ['not found', [NOT_FOUND_HOME, NOT_FOUND_ASSESSMENT], 'not_found'],
]

describe('shell tracked items', () => {
  for (const [place, items, location] of PLACES) {
    it(`should track every ${place} CTA, and only CTAs, at ${location}`, () => {
      for (const item of items) {
        const expected = expectedEvent(item)
        expect(item.track?.name, item.labelKey).toBe(expected)
        if (expected) {
          expect(item.track?.params.cta_location, item.labelKey).toBe(location)
        }
      }
    })
  }

  it('should name the channel of each contact item', () => {
    const contacts = [
      ...FOOTER_COLUMNS.flatMap(column => column.items),
      ...MOBILE_CONTACT_CHANNELS,
    ].filter(item => item.track?.name === 'contact_click')

    expect(
      contacts.map(item =>
        item.track?.name === 'contact_click' ? item.track.params.channel : ''
      )
    ).toEqual(['email', 'whatsapp', 'whatsapp', 'email'])
  })
})
