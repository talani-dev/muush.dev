import { describe, expect, it } from 'vitest'
import { advancedMatching, createMetaPixel } from './metaPixel'
import { fakeBrowser, fbqCalls } from './vendorFakes.testing'

/* Assembled, so the literal never appears under `app/` (contract § 2). */
const ID = ['1000', '2000', '3000'].join('')

function granted() {
  const browser = fakeBrowser()
  const meta = createMetaPixel(ID, browser.env)
  meta.grant()
  return { browser, meta }
}

describe('metaPixel', () => {
  it('should inject nothing and define nothing before the grant', () => {
    const browser = fakeBrowser()
    const meta = createMetaPixel(ID, browser.env)

    meta.sendPageView()
    meta.sink({ name: 'book_call_click', params: { cta_location: 'hero' } })

    expect(browser.scripts).toEqual([])
    expect(browser.window.fbq).toBeUndefined()
  })

  it('should inject fbevents.js once even when granted twice', () => {
    const { browser, meta } = granted()

    meta.grant()

    expect(browser.scripts).toHaveLength(1)
    expect(browser.scripts[0]?.src).toBe(
      'https://connect.facebook.net/en_US/fbevents.js'
    )
    expect(browser.scripts[0]?.async).toBe(true)
  })

  it('should turn automatic configuration off before init, then record the page view', () => {
    const { browser } = granted()

    expect(fbqCalls(browser.window)).toEqual([
      ['set', 'autoConfig', false, ID],
      ['init', ID],
      ['trackSingle', ID, 'PageView'],
    ])
    expect(browser.window.fbq?.disablePushState).toBe(true)
  })

  it('should send every later page view with trackSingle, which fbevents does not drop', () => {
    const { browser, meta } = granted()

    meta.sendPageView()
    meta.sendPageView()

    expect(
      fbqCalls(browser.window).filter(call => call.includes('PageView'))
    ).toEqual([
      ['trackSingle', ID, 'PageView'],
      ['trackSingle', ID, 'PageView'],
      ['trackSingle', ID, 'PageView'],
    ])
  })

  it('should create no noscript image pixel when granted', () => {
    const { browser } = granted()

    expect(browser.scripts.every(node => node.tagName === 'SCRIPT')).toBe(true)
  })

  it('should map the three conversions and nothing else', () => {
    const { browser, meta } = granted()

    meta.sink({ name: 'book_call_click', params: { cta_location: 'faq' } })
    meta.sink({
      name: 'contact_click',
      params: { channel: 'email', cta_location: 'footer' },
    })
    meta.sink({
      name: 'generate_lead',
      params: { form: 'assessment', contact_preference: 'email' },
    })
    meta.sink({
      name: 'assessment_cta_click',
      params: { cta_location: 'hero' },
    })
    meta.sink({
      name: 'application_submit',
      params: { form: 'application', with_cv: true },
    })
    meta.sink({ name: 'cv_attached', params: { result: 'ok' } })

    expect(fbqCalls(browser.window).slice(3)).toEqual([
      ['track', 'Schedule'],
      ['track', 'Contact'],
      ['track', 'Lead'],
    ])
  })

  it('should do nothing at all when the pixel id is empty', () => {
    const browser = fakeBrowser()
    const meta = createMetaPixel('', browser.env)

    meta.grant()

    expect(browser.scripts).toEqual([])
    expect(browser.window.fbq).toBeUndefined()
  })

  it('should revoke consent and expire _fbp when revoked', () => {
    const { browser, meta } = granted()

    meta.revoke()

    expect(fbqCalls(browser.window).at(-1)).toEqual(['consent', 'revoke'])
    expect(browser.cookieWrites).toEqual([
      '_fbp=; max-age=0; path=/',
      '_fbp=; max-age=0; path=/; domain=.muush.dev',
    ])
  })

  it('should send nothing when bus events arrive after the revoke', () => {
    const { browser, meta } = granted()
    meta.revoke()
    const before = fbqCalls(browser.window).length

    meta.sink({ name: 'book_call_click', params: { cta_location: 'footer' } })
    meta.sendPageView()

    expect(fbqCalls(browser.window)).toHaveLength(before)
  })

  it('should grant consent again with one page view and no second script when re-granted', () => {
    const { browser, meta } = granted()
    meta.revoke()

    meta.grant()

    expect(fbqCalls(browser.window).slice(-2)).toEqual([
      ['consent', 'grant'],
      ['trackSingle', ID, 'PageView'],
    ])
    expect(browser.scripts).toHaveLength(1)
  })

  it('should re-init with the email and phone, then track the Lead, when the lead carries user data', () => {
    const { browser, meta } = granted()

    meta.sink({
      name: 'generate_lead',
      params: { form: 'assessment', contact_preference: 'whatsapp' },
      userData: { email: '  MF.Ruiz@Ejemplo.MX ', phone: '+525544332211' },
    })

    expect(fbqCalls(browser.window).slice(-2)).toEqual([
      ['init', ID, { em: 'mf.ruiz@ejemplo.mx', ph: '525544332211' }],
      ['track', 'Lead'],
    ])
  })

  it('should send only the email when the lead chose email', () => {
    const { browser, meta } = granted()

    meta.sink({
      name: 'generate_lead',
      params: { form: 'assessment', contact_preference: 'email' },
      userData: { email: 'ana@ejemplo.mx' },
    })

    expect(fbqCalls(browser.window).at(-2)).toEqual([
      'init',
      ID,
      { em: 'ana@ejemplo.mx' },
    ])
  })

  it('should never send the application or a form_response to Meta', () => {
    const { browser, meta } = granted()
    const before = fbqCalls(browser.window).length

    meta.sink({
      name: 'form_response',
      params: { form: 'assessment', result: 'ok' },
    })
    meta.sink({
      name: 'application_submit',
      params: { form: 'application', with_cv: false },
    })

    expect(fbqCalls(browser.window)).toHaveLength(before)
  })
})

describe('advancedMatching', () => {
  it('should keep only em and ph, normalised', () => {
    expect(
      advancedMatching({ email: ' Ana@Muush.dev ', phone: '+52 55 4433 2211' })
    ).toEqual({ em: 'ana@muush.dev', ph: '525544332211' })
    expect(Object.keys(advancedMatching({ email: 'a@b.mx' }))).toEqual(['em'])
  })
})
