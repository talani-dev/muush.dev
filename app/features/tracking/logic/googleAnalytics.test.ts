import { describe, expect, it } from 'vitest'
import { createGoogleAnalytics } from './googleAnalytics'
import { fakeBrowser, gtagCalls } from './vendorFakes.testing'

/* Assembled, so the literal never appears under `app/` (contract § 2). */
const ID = ['G', 'TESTID123'].join('-')

function granted() {
  const browser = fakeBrowser()
  const ga = createGoogleAnalytics(ID, browser.env)
  ga.grant()
  return { browser, ga }
}

describe('googleAnalytics', () => {
  it('should inject nothing and define nothing before the grant', () => {
    const browser = fakeBrowser()
    const ga = createGoogleAnalytics(ID, browser.env)

    ga.sendPageView()
    ga.sink({ name: 'form_start', params: { form: 'assessment' } })

    expect(browser.scripts).toEqual([])
    expect(browser.window.gtag).toBeUndefined()
    expect(browser.window.dataLayer).toBeUndefined()
  })

  it('should inject gtag.js once even when granted twice', () => {
    const { browser, ga } = granted()

    ga.grant()

    expect(browser.scripts).toHaveLength(1)
    expect(browser.scripts[0]?.src).toBe(
      `https://www.googletagmanager.com/gtag/js?id=${ID}`
    )
    expect(browser.scripts[0]?.async).toBe(true)
  })

  it('should set page-wide privacy fields and the consent default before js and config', () => {
    const { browser } = granted()

    expect(gtagCalls(browser.window).slice(0, 5)).toEqual([
      ['set', 'send_page_view', false],
      ['set', 'allow_ad_personalization_signals', false],
      ['set', 'allow_google_signals', false],
      [
        'consent',
        'default',
        {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'granted',
        },
      ],
      ['js', expect.any(Date)],
    ])
    expect(gtagCalls(browser.window)[5]?.[0]).toBe('config')
  })

  it('should configure with no automatic page view, a 420-day cookie and signals off', () => {
    const { browser } = granted()

    expect(
      gtagCalls(browser.window).find(call => call[0] === 'config')
    ).toEqual([
      'config',
      ID,
      {
        send_page_view: false,
        cookie_expires: 36_288_000,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      },
    ])
  })

  it('should record the current page without its hash when granted', () => {
    const { browser } = granted()

    expect(gtagCalls(browser.window).at(-1)).toEqual([
      'event',
      'page_view',
      {
        page_location: 'https://muush.dev/es/nosotros',
        page_title: 'Nosotros · muush',
      },
    ])
  })

  it('should send a catalogue event with only its params', () => {
    const { browser, ga } = granted()

    ga.sink({
      name: 'generate_lead',
      params: { form: 'assessment', contact_preference: 'whatsapp' },
      userData: { email: 'ana@ejemplo.mx', phone: '+525544332211' },
    })

    expect(gtagCalls(browser.window).at(-1)).toEqual([
      'event',
      'generate_lead',
      { form: 'assessment', contact_preference: 'whatsapp' },
    ])
  })

  it('should send a form_response with its params', () => {
    const { browser, ga } = granted()

    ga.sink({
      name: 'form_response',
      params: { form: 'application', result: 'error', error_type: 'network' },
    })

    expect(gtagCalls(browser.window).at(-1)).toEqual([
      'event',
      'form_response',
      { form: 'application', result: 'error', error_type: 'network' },
    ])
  })

  it('should send a flushed section view with the beacon transport', () => {
    const { browser, ga } = granted()

    ga.sink({
      name: 'section_view',
      params: { page_key: 'home', section: 'services', section_seconds: 14 },
      beacon: true,
    })

    expect(gtagCalls(browser.window).at(-1)).toEqual([
      'event',
      'section_view',
      {
        page_key: 'home',
        section: 'services',
        section_seconds: 14,
        transport_type: 'beacon',
      },
    ])
  })

  it('should do nothing at all when the measurement id is empty', () => {
    const browser = fakeBrowser()
    const ga = createGoogleAnalytics('', browser.env)

    ga.grant()
    ga.sendPageView()

    expect(browser.scripts).toEqual([])
    expect(browser.window.dataLayer).toBeUndefined()
  })

  it('should set the opt-out flag and expire both cookies when revoked', () => {
    const { browser, ga } = granted()

    ga.revoke()

    expect(browser.window[`ga-disable-${ID}`]).toBe(true)
    expect(browser.cookieWrites).toContain(
      '_ga=; max-age=0; path=/; domain=.muush.dev'
    )
    expect(browser.cookieWrites).toContain(
      '_ga_TESTID123=; max-age=0; path=/; domain=.muush.dev'
    )
  })

  it('should send nothing when bus events arrive after the revoke', () => {
    const { browser, ga } = granted()
    ga.revoke()
    const before = gtagCalls(browser.window).length

    ga.sink({ name: 'form_start', params: { form: 'assessment' } })
    ga.sendPageView()

    expect(gtagCalls(browser.window)).toHaveLength(before)
  })

  it('should resume with one page view and no second script when re-granted', () => {
    const { browser, ga } = granted()
    ga.revoke()

    ga.grant()

    expect(browser.window[`ga-disable-${ID}`]).toBe(false)
    expect(browser.scripts).toHaveLength(1)
    expect(
      gtagCalls(browser.window).filter(call => call[1] === 'page_view')
    ).toHaveLength(2)
    expect(
      gtagCalls(browser.window).filter(call => call[0] === 'consent')
    ).toHaveLength(1)
    expect(
      gtagCalls(browser.window).filter(call => call[0] === 'set')
    ).toHaveLength(3)
  })
})
