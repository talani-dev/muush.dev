import { describe, expect, it } from 'vitest'
import {
  ABOUT_SECTIONS,
  CLICK_EVENT_NAMES,
  CONTACT_CHANNELS,
  CTA_LOCATIONS,
  CV_RESULTS,
  FAQ_TOPIC_IDS,
  FORM_ERROR_TYPES,
  FORM_FIELD_IDS,
  FORM_IDS,
  HOME_SECTIONS,
  PAGE_KEYS,
  SITE_LOCALES,
  trackAttrs,
} from './trackingEvents'

describe('trackingEvents', () => {
  it('should hold the closed value lists of data-model § 2 when read', () => {
    expect(CONTACT_CHANNELS).toEqual(['whatsapp', 'email'])
    expect(FORM_IDS).toEqual(['assessment', 'application'])
    expect(FORM_ERROR_TYPES).toEqual([
      'validation',
      'challenge_failed',
      'network',
      'server',
    ])
    expect(CV_RESULTS).toEqual(['ok', 'too_large', 'not_pdf'])
    expect(PAGE_KEYS).toEqual(['home', 'about'])
    expect(HOME_SECTIONS).toEqual([
      'hero',
      'who_we_are',
      'services',
      'how_we_work',
      'assessment',
    ])
    expect(ABOUT_SECTIONS).toEqual([
      'hero',
      'how_it_comes_together',
      'where_we_are',
      'work_with_us',
    ])
    expect(SITE_LOCALES).toEqual(['es', 'en'])
    /* Feature 51 · spec D6: locale-neutral, in page order. */
    expect(FAQ_TOPIC_IDS).toEqual([
      'assessment',
      'pricing',
      'process',
      'delivery',
      'work_with_muush',
    ])
    expect(CLICK_EVENT_NAMES).toEqual([
      'assessment_cta_click',
      'book_call_click',
      'contact_click',
    ])
  })

  it('should list exactly the CTA places the audit found when read', () => {
    expect(CTA_LOCATIONS).toEqual([
      'nav',
      'hero',
      'footer',
      'faq',
      'not_found',
      'assessment',
      'form_success',
      'send_notice',
    ])
  })

  it('should name every field id of both forms, website included, when read', () => {
    expect([...FORM_FIELD_IDS].sort()).toEqual(
      [
        'name',
        'email',
        'company',
        'identity',
        'website',
        'need',
        'contactPreference',
        'whatsappCountry',
        'whatsapp',
        'areaRole',
        'portfolio',
        'linkedin',
        'cv',
      ].sort()
    )
  })

  it('should return only the event and location attributes when a CTA click is tracked', () => {
    expect(
      trackAttrs({
        name: 'assessment_cta_click',
        params: { cta_location: 'hero' },
      })
    ).toEqual({
      'data-track': 'assessment_cta_click',
      'data-track-location': 'hero',
    })
    expect(
      trackAttrs({ name: 'book_call_click', params: { cta_location: 'faq' } })
    ).toEqual({
      'data-track': 'book_call_click',
      'data-track-location': 'faq',
    })
  })

  it('should add the channel attribute when a contact click is tracked', () => {
    expect(
      trackAttrs({
        name: 'contact_click',
        params: { channel: 'whatsapp', cta_location: 'footer' },
      })
    ).toEqual({
      'data-track': 'contact_click',
      'data-track-location': 'footer',
      'data-track-channel': 'whatsapp',
    })
  })
})
