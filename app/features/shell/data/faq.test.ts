import { describe, expect, it } from 'vitest'
import { CALL_BOOKING_URL } from '@/shared/data/callBooking'
import { SECTION_ANCHORS } from '@/shared/data/sectionAnchors'
import { FAQ_COPY_KEYS, FAQ_PRIMARY, FAQ_SECONDARY } from './faq'

/** Feature 46 · FR-035, data-model § 3. */
describe('faq content model', () => {
  it('should point the primary at the home diagnóstico anchor', () => {
    expect(FAQ_PRIMARY).toEqual({
      labelKey: 'shell.faq.assessment',
      destination: {
        kind: 'anchor',
        name: 'index',
        anchor: SECTION_ANCHORS.assessment,
      },
      track: { name: 'assessment_cta_click', params: { cta_location: 'faq' } },
    })
  })

  it('should point the secondary at the shared call-booking URL', () => {
    expect(FAQ_SECONDARY).toEqual({
      labelKey: 'shell.faq.call',
      destination: { kind: 'external', href: CALL_BOOKING_URL },
      track: { name: 'book_call_click', params: { cta_location: 'faq' } },
    })
  })

  it('should key the title under the shell faq namespace when read', () => {
    expect(FAQ_COPY_KEYS).toEqual({ title: 'shell.faq.title' })
  })
})
